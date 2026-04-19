/**
 * MENTRA ERP - Smart Purchases & Stock Sync (v7.5)
 * نظام المشتريات المطور: تسجيل كامل للبنود + ترحيل مخزني + إحصائيات لحظية
 */

(function() {
    const displayArea = document.getElementById('main-content-display');

    const purchasesHTML = `
    <div class="animate-fade-in space-y-8 pb-16 px-4" style="direction: rtl;">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div class="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-xl shadow-slate-200/30 flex items-center gap-5">
                <div class="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-inner"><i class="fas fa-shopping-basket"></i></div>
                <div>
                    <p class="text-[10px] font-black text-slate-400 uppercase">مشتريات اليوم</p>
                    <h4 id="today-purchases-count" class="text-xl font-black text-slate-900 font-mono">0.00</h4>
                </div>
            </div>
            <div class="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-xl shadow-slate-200/30 flex items-center gap-5 text-right">
                <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner"><i class="fas fa-box-open"></i></div>
                <div>
                    <p class="text-[10px] font-black text-slate-400 uppercase">أصناف بانتظار التوريد</p>
                    <h4 id="low-stock-count" class="text-xl font-black text-slate-900 font-mono">0</h4>
                </div>
            </div>
             <div class="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl flex items-center gap-5 text-white">
                <div class="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center shadow-inner"><i class="fas fa-file-invoice"></i></div>
                <div>
                    <p class="text-[10px] font-black text-slate-400 uppercase">رقم الفاتورة الحالية</p>
                    <h4 id="purchase-inv-no" class="text-lg font-black font-mono text-rose-400">PUR-${Math.floor(Math.random()*900000)}</h4>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-8">
                <div class="bg-white rounded-[3.5rem] p-10 shadow-xl border border-slate-50">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <label class="block text-[10px] font-black text-slate-400 mb-3 mr-4 uppercase italic">ابحث عن صنف لشرائه</label>
                            <div class="relative">
                                <input type="text" id="p-search" placeholder="اكتب اسم المنتج أو الكود..." class="w-full bg-slate-50 border-none rounded-2xl p-4 pr-12 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500 transition-all">
                                <i class="fas fa-search absolute left-4 top-4 text-slate-300"></i>
                                <div id="search-results" class="absolute z-50 w-full bg-white shadow-2xl rounded-2xl mt-2 max-h-60 overflow-y-auto hidden border border-slate-100"></div>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center">
                             <div>
                                <p class="text-[9px] font-black text-slate-400 uppercase">المخزون الحالي</p>
                                <span id="current-stock-info" class="text-lg font-black text-slate-700 font-mono">0</span>
                             </div>
                             <div>
                                <p class="text-[9px] font-black text-slate-400 uppercase">التكلفة الأخيرة</p>
                                <span id="last-cost-info" class="text-lg font-black text-emerald-600 font-mono">0.00</span>
                             </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label class="block text-[10px] font-black text-slate-400 mb-3 mr-4 uppercase">الكمية</label>
                            <input type="number" id="p-qty" value="1" min="1" class="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-black text-slate-700 outline-none focus:ring-2 focus:ring-rose-500">
                        </div>
                        <div>
                            <label class="block text-[10px] font-black text-slate-400 mb-3 mr-4 uppercase">سعر الشراء</label>
                            <input type="number" id="p-cost" placeholder="0.00" class="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-black text-slate-700 outline-none focus:ring-2 focus:ring-rose-500">
                        </div>
                        <div class="flex items-end">
                            <button id="add-to-purchase" class="w-full bg-slate-900 hover:bg-rose-600 text-white h-[55px] rounded-2xl font-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3">
                                <i class="fas fa-plus"></i> إضافة للسلة
                            </button>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-[3.5rem] p-10 shadow-xl border border-slate-50 overflow-hidden">
                    <table class="w-full text-right border-separate border-spacing-y-4">
                        <thead>
                            <tr class="text-[10px] font-black text-slate-400 uppercase">
                                <th class="pb-4 pr-4">الصنف</th>
                                <th class="pb-4 text-center">الكمية</th>
                                <th class="pb-4 text-center font-sans">Cost</th>
                                <th class="pb-4 text-center font-sans">Total</th>
                                <th class="pb-4 text-left">الإجراء</th>
                            </tr>
                        </thead>
                        <tbody id="purchase-items-list"></tbody>
                    </table>
                </div>
            </div>

            <div class="space-y-8">
                <div class="bg-gradient-to-br from-slate-800 to-slate-950 p-10 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
                    <div class="relative z-10">
                         <p class="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-4 italic">Grand Total / الإجمالي</p>
                        <h4 id="purchase-total-display" class="text-5xl font-black font-mono tracking-tighter text-white">0.00</h4>
                        
                        <div class="mt-10 space-y-4">
                            <button id="save-purchase" class="w-full bg-emerald-500 hover:bg-emerald-400 text-white p-6 rounded-3xl font-black text-xl transition-all shadow-xl active:scale-90 flex items-center justify-center gap-3">
                                <i class="fas fa-check-circle"></i> ترحيل للمخزن ✅
                            </button>
                            <button id="clear-purchase" class="w-full bg-white/5 hover:bg-white/10 text-white/50 p-4 rounded-3xl font-bold text-[10px] transition-all italic border border-white/5">
                                <i class="fas fa-trash-alt ml-2"></i> إفراغ السلة
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    displayArea.innerHTML = purchasesHTML;

    // --- المنطق البرمجي المعدل ---
    let currentPurchaseItems = [];
    let selectedProduct = null;
    let allProducts = [];

    async function init() {
        allProducts = await db.table('products').toArray();
        const invoices = await db.table('invoices').toArray();
        const today = new Date().toISOString().split('T')[0];
        const todayPurchases = invoices.filter(inv => inv.type === 'PURCHASE' && inv.date.startsWith(today));
        const totalToday = todayPurchases.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
        
        document.getElementById('today-purchases-count').innerText = totalToday.toLocaleString();
        document.getElementById('low-stock-count').innerText = allProducts.filter(p => p.stock_qty < 5).length;
    }

    // البحث عن منتج
    const searchInput = document.getElementById('p-search');
    const resultsDiv = document.getElementById('search-results');

    searchInput.oninput = (e) => {
        const val = e.target.value.toLowerCase();
        if(!val) { resultsDiv.classList.add('hidden'); return; }

        const filtered = allProducts.filter(p => 
            p.name_ar.toLowerCase().includes(val) || 
            (p.sku && p.sku.toLowerCase().includes(val))
        );

        resultsDiv.innerHTML = filtered.map(p => `
            <div class="p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50 flex justify-between items-center" 
                 onclick="selectProductForPurchase('${p.id}')">
                <span class="font-bold text-slate-700">${p.name_ar}</span>
                <span class="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono">${p.stock_qty} بالمخزن</span>
            </div>
        `).join('');
        resultsDiv.classList.remove('hidden');
    };

    window.selectProductForPurchase = async (id) => {
        const product = allProducts.find(p => p.id == id);
        if(product) {
            selectedProduct = product;
            document.getElementById('p-search').value = product.name_ar;
            document.getElementById('current-stock-info').innerText = product.stock_qty || 0;
            document.getElementById('last-cost-info').innerText = (parseFloat(product.cost) || 0).toFixed(2);
            document.getElementById('p-cost').value = product.cost || "";
            resultsDiv.classList.add('hidden');
        }
    };

    document.getElementById('add-to-purchase').onclick = () => {
        if(!selectedProduct) return alert("اختر صنفاً أولاً!");
        const qty = parseFloat(document.getElementById('p-qty').value) || 0;
        const cost = parseFloat(document.getElementById('p-cost').value) || 0;

        if(qty <= 0 || cost <= 0) return alert("القيم غير صحيحة!");

        currentPurchaseItems.push({
            productId: selectedProduct.id,
            name: selectedProduct.name_ar,
            qty,
            cost,
            total: qty * cost
        });

        updateUI();
        resetInputs();
    };

    function updateUI() {
        const list = document.getElementById('purchase-items-list');
        let total = 0;
        list.innerHTML = currentPurchaseItems.map((item, index) => {
            total += item.total;
            return `
            <tr class="bg-slate-50/50 rounded-2xl hover:bg-white transition-all">
                <td class="p-4 font-black text-slate-700">${item.name}</td>
                <td class="p-4 text-center font-bold font-mono">${item.qty}</td>
                <td class="p-4 text-center font-bold font-mono text-slate-500">${item.cost.toFixed(2)}</td>
                <td class="p-4 text-center font-black font-mono text-emerald-600">${item.total.toFixed(2)}</td>
                <td class="p-4 text-left">
                    <button onclick="removePurchaseItem(${index})" class="w-8 h-8 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white transition-all">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>`;
        }).join('');
        document.getElementById('purchase-total-display').innerText = total.toLocaleString('en-US', { minimumFractionDigits: 2 });
    }

    window.removePurchaseItem = (index) => {
        currentPurchaseItems.splice(index, 1);
        updateUI();
    };

    // --- دالة الترحيل الذكية المعدلة ---
    document.getElementById('save-purchase').onclick = async () => {
        if (currentPurchaseItems.length === 0) return alert("السلة فارغة!");

        const invNo = document.getElementById('purchase-inv-no').innerText;
        const total = currentPurchaseItems.reduce((acc, curr) => acc + curr.total, 0);

        try {
            // الترحيل داخل Transaction لضمان سلامة البيانات
            await db.transaction('rw', [db.invoices, db.invoice_items, db.products, db.stock_movements], async () => {
                
                // 1. إضافة رأس الفاتورة
                const invId = await db.invoices.add({
                    invoice_number: invNo,
                    type: 'PURCHASE', // تأكد أن النوع مطابق لما يبحث عنه مدير البيانات
                    date: new Date().toISOString().split('T')[0],
                    total: total,
                    status: 'paid'
                });

                // 2. إضافة بنود الفاتورة (هذا الجزء كان مفقوداً عندك)
                for (let item of currentPurchaseItems) {
                    await db.invoice_items.add({
                        invoice_id: invId,
                        product_id: item.productId,
                        product_name: item.name,
                        qty: item.qty,
                        price: item.cost, // في المشتريات، السعر هو التكلفة
                        total_item: item.total
                    });

                    // 3. تحديث المخزن وتكلفة المنتج
                    const product = await db.products.get(Number(item.productId));
                    if (product) {
                        const newQty = (parseFloat(product.stock_qty) || 0) + item.qty;
                        await db.products.update(Number(item.productId), { 
                            stock_qty: newQty,
                            cost: item.cost 
                        });

                        // 4. تسجيل حركة المخزن
                        await db.stock_movements.add({
                            product_id: item.productId,
                            type: 'IN',
                            qty: item.qty,
                            date: new Date().toISOString(),
                            ref_id: invNo
                        });
                    }
                }
            });

            alert("🚀 تم الترحيل بنجاح! الفاتورة الآن تظهر ببنودها في مدير المبيعات.");
            location.reload(); 

        } catch (err) {
            console.error(err);
            alert("❌ فشل الترحيل: " + err.message);
        }
    };

    function resetInputs() {
        selectedProduct = null;
        document.getElementById('p-search').value = "";
        document.getElementById('p-qty').value = 1;
        document.getElementById('p-cost').value = "";
        document.getElementById('current-stock-info').innerText = "0";
        document.getElementById('last-cost-info').innerText = "0.00";
    }

    init();
})();