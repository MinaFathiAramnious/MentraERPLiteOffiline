(function() {
    const displayArea = document.getElementById('main-content-display');
    let itemsToShow = 5; 
    let currentFilter = 'all'; // (all, low, out)
    let currentEditingId = null;

    // 1. بناء هيكل الصفحة الرئيسي
    displayArea.innerHTML = `
    <div class="p-4 md:p-8 space-y-6 animate-fade-in pb-24 text-right" dir="rtl">
        
        <div id="inventoryStats" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"></div>

        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-black text-slate-800 tracking-tighter text-right">📦 إدارة المخزن</h2>
            <button onclick="openProductModal()" 
                    class="bg-blue-600 text-white px-5 py-3 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all text-sm">
                صنف جديد +
            </button>
        </div>

        <div class="flex gap-2 overflow-x-auto pb-2 no-scrollbar font-black">
            <button onclick="changeFilter('all')" id="filter-all" class="px-6 py-2 rounded-xl border-2 transition-all whitespace-nowrap bg-slate-900 text-white border-slate-900">الكل</button>
            <button onclick="changeFilter('low')" id="filter-low" class="px-6 py-2 rounded-xl border-2 transition-all whitespace-nowrap bg-white text-orange-600 border-orange-100">قربت تخلص ⚠️</button>
            <button onclick="changeFilter('out')" id="filter-out" class="px-6 py-2 rounded-xl border-2 transition-all whitespace-nowrap bg-white text-rose-600 border-rose-100">نفدت 🚫</button>
        </div>

        <div class="bg-white p-3 rounded-3xl shadow-sm border border-slate-100">
            <input type="text" id="productSearch" onkeyup="resetPaginationAndRender()" 
                   placeholder="ابحث بالاسم أو الباركود..." 
                   class="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold border-2 border-transparent focus:border-blue-500 transition-all">
        </div>

        <div id="productsList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>

        <div id="loadMoreContainer" class="flex justify-center mt-8 hidden">
            <button onclick="loadMore()" class="bg-white border-2 border-slate-100 text-slate-600 px-10 py-4 rounded-3xl font-black hover:bg-slate-50 transition-all shadow-sm">
                عرض المزيد من الأصناف 👇
            </button>
        </div>
    </div>

    <div id="productModal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 id="modalTitle" class="text-2xl font-black mb-6 text-slate-800 text-right">إضافة صنف</h3>
            <form id="productForm" class="space-y-4 text-right">
                <div>
                    <label class="text-xs font-black pr-2 mb-1 block">اسم المنتج</label>
                    <input type="text" id="p_name" placeholder="مثلاً: زيت زيتون 1 لتر" class="w-full bg-slate-100 p-4 rounded-2xl font-bold outline-none focus:ring-2 ring-blue-500" required>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="text-xs font-black pr-2 mb-1 block">الباركود (SKU)</label>
                        <input type="text" id="p_sku" placeholder="00000" class="w-full bg-slate-100 p-4 rounded-2xl font-bold outline-none">
                    </div>
                    <div>
                        <label class="text-xs font-black pr-2 mb-1 block">التصنيف</label>
                        <input type="text" id="p_category" placeholder="عام" class="w-full bg-slate-100 p-4 rounded-2xl font-bold outline-none">
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-4 text-center">
                    <div><label class="text-[10px] font-black block mb-1">سعر التكلفة</label>
                        <input type="number" id="p_cost" step="0.01" class="w-full bg-slate-100 p-3 rounded-xl font-bold text-center outline-none"></div>
                    <div><label class="text-[10px] font-black block mb-1">سعر البيع</label>
                        <input type="number" id="p_price" step="0.01" class="w-full bg-slate-100 p-3 rounded-xl font-bold text-center outline-none"></div>
                    <div><label class="text-[10px] font-black block mb-1">الكمية</label>
                        <input type="number" id="p_qty" class="w-full bg-slate-100 p-3 rounded-xl font-bold text-center outline-none"></div>
                </div>
                <div class="flex gap-4 pt-4">
                    <button type="submit" class="flex-[2] bg-slate-900 text-white p-5 rounded-2xl font-black shadow-xl hover:bg-black transition-all">حفظ البيانات</button>
                    <button type="button" onclick="closeProductModal()" class="flex-1 bg-slate-100 text-slate-500 p-5 rounded-2xl font-black">إلغاء</button>
                </div>
            </form>
        </div>
    </div>`;

    // 2. تحديث الإحصائيات بشكل ذكي
    const updateStats = async () => {
        const all = await db.products.toArray();
        const totalValue = all.reduce((sum, p) => sum + (p.stock_qty * p.cost), 0);
        const lowCount = all.filter(p => p.stock_qty > 0 && p.stock_qty <= 5).length;
        const outCount = all.filter(p => p.stock_qty <= 0).length;

        document.getElementById('inventoryStats').innerHTML = `
            <div class="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                <p class="text-[10px] font-black text-slate-400 uppercase">قيمة المخزن</p>
                <p class="text-xl font-black text-green-600">${totalValue.toLocaleString()} <span class="text-xs">ج.م</span></p>
            </div>
            <div class="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                <p class="text-[10px] font-black text-slate-400 uppercase">إجمالي الأصناف</p>
                <p class="text-xl font-black text-slate-800">${all.length}</p>
            </div>
            <div class="bg-orange-50 p-4 rounded-3xl border border-orange-100 shadow-sm">
                <p class="text-[10px] font-black text-orange-400 uppercase">نواقص (قريباً)</p>
                <p class="text-xl font-black text-orange-600">${lowCount}</p>
            </div>
            <div class="bg-rose-50 p-4 rounded-3xl border border-rose-100 shadow-sm">
                <p class="text-[10px] font-black text-rose-400 uppercase">أصناف نفدت</p>
                <p class="text-xl font-black text-rose-600">${outCount}</p>
            </div>
        `;
    };

    // 3. وظيفة العرض والفلترة (القلب النابض)
    window.renderProducts = async () => {
        const query = document.getElementById('productSearch').value.toLowerCase();
        const container = document.getElementById('productsList');
        let products = await db.products.reverse().toArray();

        // تطبيق الفلاتر الذكية
        if (currentFilter === 'low') products = products.filter(p => p.stock_qty > 0 && p.stock_qty <= 5);
        if (currentFilter === 'out') products = products.filter(p => p.stock_qty <= 0);

        // تطبيق البحث
        if (query) {
            products = products.filter(p => p.name_ar.toLowerCase().includes(query) || (p.sku && p.sku.toLowerCase().includes(query)));
        }

        const visible = products.slice(0, itemsToShow);
        
        if (visible.length === 0) {
            container.innerHTML = `<div class="col-span-full py-20 text-center text-slate-400 font-black">لا توجد نتائج مطابقة</div>`;
            document.getElementById('loadMoreContainer').classList.add('hidden');
            return;
        }

        container.innerHTML = visible.map(p => `
            <div class="bg-white p-5 rounded-[2.5rem] shadow-sm border ${p.stock_qty <= 0 ? 'border-rose-100 bg-rose-50/10' : 'border-slate-50'} group relative transition-all hover:shadow-md">
                <div class="flex justify-between items-start mb-4">
                    <span class="bg-slate-100 text-slate-500 text-[9px] px-2 py-1 rounded-lg font-black italic">#${p.id}</span>
                    <div class="flex gap-2">
                        <button onclick="openProductModal(${p.id})" class="text-blue-500 p-2 bg-blue-50 rounded-xl hover:bg-blue-500 hover:text-white transition-all"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteProduct(${p.id})" class="text-rose-500 p-2 bg-rose-50 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <h4 class="font-black text-slate-800 text-lg truncate mb-1">${p.name_ar}</h4>
                <p class="text-xs font-bold text-slate-400 mb-6 font-mono">${p.sku || '---'}</p>
                
                <div class="flex justify-between items-end bg-slate-50 p-4 rounded-3xl border border-slate-100">
                    <div>
                        <p class="text-[9px] text-slate-400 font-black mb-1 uppercase tracking-tighter">الرصيد المتاح</p>
                        <p class="text-2xl font-black ${p.stock_qty <= 0 ? 'text-rose-600' : p.stock_qty <= 5 ? 'text-orange-600' : 'text-slate-800'} italic">
                            ${p.stock_qty} <span class="text-[10px]">قطعة</span>
                        </p>
                    </div>
                    <div class="text-left">
                        <p class="text-[9px] text-slate-400 font-black mb-1 uppercase tracking-tighter text-left">سعر البيع</p>
                        <p class="text-xl font-black text-blue-600">${p.price} <span class="text-[10px]">ج.م</span></p>
                    </div>
                </div>

                <button onclick="quickAdd(${p.id})" class="absolute -bottom-2 -right-2 bg-slate-900 text-white w-10 h-10 rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 transition-transform">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `).join('');

        document.getElementById('loadMoreContainer').classList.toggle('hidden', products.length <= itemsToShow);
        updateStats();
    };

    // 4. وظائف التحكم
    window.changeFilter = (f) => {
        currentFilter = f;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.replace('bg-slate-900', 'bg-white')); // تنظيف
        itemsToShow = 5;
        renderProducts();
    };

    window.openProductModal = (id = null) => {
        currentEditingId = id;
        const form = document.getElementById('productForm');
        if(id) {
            document.getElementById('modalTitle').innerText = "تعديل بيانات الصنف";
            db.products.get(id).then(p => {
                document.getElementById('p_name').value = p.name_ar;
                document.getElementById('p_sku').value = p.sku;
                document.getElementById('p_category').value = p.category;
                document.getElementById('p_cost').value = p.cost;
                document.getElementById('p_price').value = p.price;
                document.getElementById('p_qty').value = p.stock_qty;
            });
        } else {
            document.getElementById('modalTitle').innerText = "إضافة صنف جديد";
            form.reset();
        }
        document.getElementById('productModal').classList.remove('hidden');
    };

    window.closeProductModal = () => document.getElementById('productModal').classList.add('hidden');

    document.getElementById('productForm').onsubmit = async (e) => {
        e.preventDefault();
        const data = {
            name_ar: document.getElementById('p_name').value,
            sku: document.getElementById('p_sku').value,
            category: document.getElementById('p_category').value,
            stock_qty: parseFloat(document.getElementById('p_qty').value) || 0,
            price: parseFloat(document.getElementById('p_price').value) || 0,
            cost: parseFloat(document.getElementById('p_cost').value) || 0,
        };
        if(currentEditingId) await db.products.update(currentEditingId, data);
        else await db.products.add(data);
        closeProductModal();
        renderProducts();
    };

    window.deleteProduct = async (id) => {
        if(confirm("سيتم حذف الصنف نهائياً، هل أنت متأكد؟")) {
            await db.products.delete(id);
            renderProducts();
        }
    };

    window.quickAdd = async (id) => {
        const val = prompt("الكمية المضافة للمخزن:");
        if(val && !isNaN(val)) {
            const p = await db.products.get(id);
            await db.products.update(id, { stock_qty: p.stock_qty + parseFloat(val) });
            await db.stock_movements.add({ product_id: id, type: 'in', qty: parseFloat(val), date: new Date().toISOString(), ref_id: 'إضافة سريعة' });
            renderProducts();
        }
    };

    window.loadMore = () => { itemsToShow += 5; renderProducts(); };
    window.resetPaginationAndRender = () => { itemsToShow = 5; renderProducts(); };

    renderProducts();
})();