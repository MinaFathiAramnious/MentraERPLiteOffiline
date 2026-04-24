// قم بتغيير هذا الرقم (v3, v4...) عندما تقوم بتحديثات جذرية لإجبار المتصفح على مسح الكاش القديم
const CACHE_NAME = 'mentra-erp-offline-v4';

// 1. الملفات الأساسية
const LOCAL_ASSETS = [
    '/',
    '/index.html',
    '/login.html',
    '/Tutorial.html',
    '/subscriptions.html',
    '/dashboard.html',
    '/assets/js/db-init.js',
    '/assets/img/smalicon.png'
];

// 2. حدث التثبيت (Install)
self.addEventListener('install', (event) => {
    // تفعيل الـ Service Worker الجديد فوراً دون انتظار إغلاق التبويبات
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            console.log('[Mentra SW] جاري تخزين الملفات الأساسية...');
            for (let url of LOCAL_ASSETS) {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        await cache.put(url, response);
                    }
                } catch (err) {
                    console.warn(`[Mentra SW] فشل تحميل مؤقت لـ: ${url}`);
                }
            }
        })
    );
});

// 3. حدث التفعيل (Activate) - تنظيف الكاش القديم فوراً
self.addEventListener('activate', (event) => {
    // السيطرة على كل الصفحات المفتوحة حالياً فوراً
    event.waitUntil(self.clients.claim());

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Mentra SW] مسح النسخة القديمة:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// 4. حدث جلب البيانات (Fetch) - استراتيجية ديناميكية ذكية
self.addEventListener('fetch', (event) => {
    if (!event.request.url.startsWith('http')) return;

    const requestUrl = new URL(event.request.url);

    // أ) إذا كان الطلب لملفات من موقعنا (HTML, JS, الصفحات الديناميكية)
    // نستخدم استراتيجية: (الشبكة أولاً، ثم الكاش) لضمان التحديث الفوري
    if (requestUrl.origin === location.origin) {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    // إذا نجح الاتصال بالإنترنت، قم بتحديث الكاش بالنسخة الجديدة
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // إذا كان المستخدم أوفلاين، أحضر النسخة من الكاش
                    console.log('[Mentra SW] وضع الأوفلاين: عرض النسخة المخزنة لـ', event.request.url);
                    return caches.match(event.request);
                })
        );
    } 
    // ب) للمكتبات الخارجية (Tailwind, FontAwesome, صور خارجية)
    // نستخدم استراتيجية: (الكاش أولاً لسرعة التحميل، مع التحديث في الخلفية) (Stale-While-Revalidate)
    else {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, networkResponse.clone());
                        });
                    }
                    return networkResponse;
                }).catch(() => { /* صمت عند الأوفلاين للملفات الخارجية */ });

                // إرجاع الكاش فوراً إذا وجد، والإنترنت يقوم بالتحديث في الخلفية
                return cachedResponse || fetchPromise;
            })
        );
    }
});