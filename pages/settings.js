/**
 * MentraERPLite - Profile Module Integrated with Dexie.js
 */

window.handleProfileUpdate = async function() {
    const btn = document.getElementById('submit-btn');
    if (!btn || btn.disabled) return;

    // تجميع البيانات من النموذج
    const profileData = {
        full_name: document.getElementById('set_fullname').value.trim(),
        username: document.getElementById('set_username').value.trim(),
        email: document.getElementById('set_email').value.trim(), // ملاحظة: هذا الحقل غير موجود في schema لكن سنحفظه في settings
        phone: document.getElementById('set_phone').value.trim(),
        shop_name: document.getElementById('set_store').value.trim()
    };

    if (!profileData.full_name || !profileData.username) {
        showToast("⚠️ يرجى إدخال البيانات الأساسية", "error");
        return;
    }

    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-magic animate-spin ml-2"></i> جاري المزامنة مع قاعدة البيانات...`;

    try {
        // 1. تحديث إعدادات النظام (اسم المحل والرقم)
        await db.settings.put({
            id: 1, 
            project_name: 'MentraERPLite',
            shop_name: profileData.shop_name,
            phone: profileData.phone,
            email: profileData.email // إضافة مرنة
        });

        // 2. تحديث بيانات المستخدم (نفترض أن المستخدم الحالي هو ID: 1 أو أول مستخدم)
        const firstUser = await db.local_users.toCollection().first();
        if (firstUser) {
            await db.local_users.update(firstUser.id, {
                username: profileData.username,
                full_name: profileData.full_name
            });
        } else {
            await db.local_users.add({
                username: profileData.username,
                full_name: profileData.full_name,
                role: 'admin'
            });
        }

        Swal.fire({
            icon: 'success',
            title: 'تم حفظ التغييرات',
            text: 'تم تحديث البيانات في قاعدة البيانات المحلية Dexie بنجاح.',
            confirmButtonColor: '#10b981'
        }).then(() => location.reload());

    } catch (error) {
        console.error("Dexie Error:", error);
        showToast("❌ خطأ في قاعدة البيانات المحلية", "error");
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-save text-lg"></i> حفظ كافة التغييرات`;
    }
};

(async function() {
    const displayArea = document.getElementById('main-content-display');
    if (!displayArea) return;

    // جلب البيانات من Dexie.js
    let settings = await db.settings.get(1) || {};
    let user = await db.local_users.toCollection().first() || {};

    displayArea.innerHTML = `
    <div class="max-w-4xl mx-auto space-y-6 animate-fade-in pb-24" style="direction: rtl;">
        
        <div class="bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div class="relative z-10 text-right w-full md:w-auto">
                <h2 class="text-2xl font-black italic">إعدادات النظام المحلي</h2>
                <div class="mt-2">
                    <span class="inline-flex items-center px-4 py-1 rounded-full text-[10px] font-black bg-white/20 text-white border border-white/30 uppercase tracking-widest">
                        <i class="fas fa-database ml-2"></i> بيانات Dexie.js النشطة
                    </span>
                </div>
            </div>
            <div class="bg-white/10 border border-white/20 px-8 py-4 rounded-3xl backdrop-blur-xl text-center">
                <p class="text-[10px] uppercase font-black text-emerald-100 mb-1">حالة الترخيص</p>
                <p class="font-black text-xl">مدى الحياة ✨</p>
            </div>
        </div>

        <div class="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 rounded-[2.5rem] p-1 shadow-2xl">
            <div class="bg-white/5 backdrop-blur-sm rounded-[2.3rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10">
                <div class="flex items-center gap-5">
                    <div class="w-16 h-16 bg-blue-500 rounded-[1.5rem] flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-500/20 rotate-3">
                        <i class="fas fa-city"></i>
                    </div>
                    <div class="text-right">
                        <h4 class="text-white font-black text-lg text-right">هل تحتاج نظاماً متكاملاً لمؤسستك؟</h4>
                        <p class="text-blue-200/60 text-[11px] font-bold leading-relaxed">
                            متوفر الآن نسخة <span class="text-blue-400">Mentra Business</span> التي تدعم تعدد الفروع، الحسابات الختامية، والمزامنة السحابية.
                        </p>
                    </div>
                </div>
                <a href="https://wa.me/201211934816" target="_blank" class="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 group">
                    <i class="fab fa-whatsapp text-lg group-hover:scale-110"></i>
                    تواصل الآن: 01211934816
                </a>
            </div>
        </div>

        <div class="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100">
            <form id="settingsForm" class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-2">
                    <label class="text-[11px] font-black text-slate-400 uppercase px-1">الاسم الكامل</label>
                    <input type="text" id="set_fullname" value="${user.full_name || ''}" placeholder="أدخل اسمك" class="w-full bg-slate-50 p-4 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none transition-all">
                </div>
                <div class="space-y-2">
                    <label class="text-[11px] font-black text-slate-400 uppercase px-1">اسم المستخدم</label>
                    <input type="text" id="set_username" value="${user.username || ''}" placeholder="username" class="w-full bg-slate-50 p-4 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none transition-all">
                </div>
                <div class="space-y-2">
                    <label class="text-[11px] font-black text-slate-400 uppercase px-1">البريد الإلكتروني</label>
                    <input type="email" id="set_email" value="${settings.email || ''}" placeholder="example@mail.com" class="w-full bg-slate-50 p-4 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none transition-all">
                </div>
                <div class="space-y-2">
                    <label class="text-[11px] font-black text-slate-400 uppercase px-1">رقم الهاتف</label>
                    <input type="text" id="set_phone" value="${settings.phone || ''}" placeholder="01xxxxxxxxx" class="w-full bg-slate-50 p-4 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none transition-all">
                </div>
                <div class="md:col-span-2 space-y-2">
                    <label class="text-[11px] font-black text-slate-400 uppercase px-1 text-center block w-full">اسم المتجر / النشاط</label>
                    <input type="text" id="set_store" value="${settings.shop_name || ''}" placeholder="اسم شركتك أو محلك" class="w-full bg-slate-50 p-4 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none transition-all text-center">
                </div>
                <button type="button" id="submit-btn" onclick="window.handleProfileUpdate()" class="md:col-span-2 bg-slate-900 text-white p-5 rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all shadow-lg flex items-center justify-center gap-3">
                    <i class="fas fa-save text-lg"></i> حفظ كافة التغييرات
                </button>
            </form>
        </div>
    </div>`;
})();