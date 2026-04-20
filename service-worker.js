const CACHE_NAME = 'mentra-erp-offline-v2';

// 1. ضع هنا الملفات المحلية الأساسية فقط التي قمت بإنشائها بالفعل
// (لا تضع أي ملف pages/ لم تقم بإنشائه بعد حتى لا يحدث خطأ 404)
const LOCAL_ASSETS = [
    '/',
    '/index.html',
    '/login.html',
    '/subscriptions.html',
    '/dashboard.html',
    '/assets/js/db-init.js',
    '/assets/img/smalicon.png'
];

// 2. حدث التثبيت (Install) - تخزين الملفات المحلية بحذر
self.addEventListener('install', (event) => {
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            console.log('[Mentra SW] جاري تخزين الملفات المحلية...');
            // استخدام طريقة آمنة: محاولة تحميل كل ملف على حدة لتجنب انهيار العملية
            for (let url of LOCAL_ASSETS) {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        await cache.put(url, response);
                    } else {
                        console.warn(`[Mentra SW] لم يتم العثور على: ${url}`);
                    }
                } catch (err) {
                    console.error(`[Mentra SW] فشل تحميل: ${url}`, err);
                }
            }
        })
    );
});

// 3. حدث التفعيل (Activate) - تنظيف الكاش القديم
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Mentra SW] مسح النسخة القديمة...');
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 4. حدث جلب البيانات (Fetch) - التخزين الديناميكي (Runtime Caching)
self.addEventListener('fetch', (event) => {
    // تجاهل الطلبات غير الصالحة (مثل امتدادات المتصفح)
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // أ. إذا وجد الملف في الكاش (سواء محلي أو مكتبة CDN سابقة)، أرجعه فوراً
            if (cachedResponse) {
                return cachedResponse;
            }

            // ب. إذا لم يجده، قم بجلبه من الإنترنت
            return fetch(event.request).then((networkResponse) => {
                // التأكد من أن الاستجابة صالحة (حتى لو كانت من CDN بصيغة opaque)
                if (!networkResponse || (networkResponse.status !== 200 && networkResponse.type !== 'opaque')) {
                    return networkResponse;
                }

                // ج. حفظ نسخة من هذا الملف (مثل Tailwind أو الصفحات الجديدة) في الكاش للمستقبل
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            }).catch(() => {
                console.log('[Mentra SW] أنت أوفلاين وهذا الرابط غير مخزن:', event.request.url);
            });
        })
    );
});