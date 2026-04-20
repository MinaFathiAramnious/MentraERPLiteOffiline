/**
 * MENTRA ERP - Smart Purchases & Stock Sync (v8.0 Mobile Optimized)
 * نظام المشتريات المطور: UI مخصص للموبايل + ترحيل مخزني + SweetAlert2
 */

(function() {
    const displayArea = document.getElementById('main-content-display');

    const purchasesHTML = `
    <div class="animate-fade-in space-y-6 pb-28 md:pb-16 px-2 md:px-4 text-right" dir="rtl" style="-webkit-tap-highlight-color: transparent;">
        
        <!-- البطاقات الإحصائية العلوية (Responsive Grid) -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
             <div class="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-50 shadow-sm md:shadow-xl shadow-slate-200/30 flex flex-col md:flex-row items-center gap-3 md:gap-5 text-center md:text-right">
                <div class="w-10 h-10 md:w-12 md:h-12 bg-rose-50 text-rose-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner"><i class="fas fa-shopping-basket"></i></div>
                <div>
                    <p class="text-[9px] md:text-[10px] font-black text-slate-400 uppercase">مشتريات اليوم</p>
                    <h4 id="today-purchases-count" class="text-base md:text-xl font-black text-slate-900 font-mono">0.00</h4>
                </div>
            </div>
            
            <div class="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-50 shadow-sm md:shadow-xl shadow-slate-200/30 flex flex-col md:flex-row items-center gap-3 md:gap-5 text-center md:text-right">
                <div class="w-10 h-10 md:w-12 md:h-12 bg-blue-50 text-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner"><i class="fas fa-box-open"></i></div>
                <div>
                    <p class="text-[9px] md:text-[10px] font-black text-slate-400 uppercase">نواقص المخزن</p>
                    <h4 id="low-stock-count" class="text-base md:text-xl font-black text-slate-900 font-mono">0</h4>
                </div>
            </div>
            
             <div class="col-span-2 md:col-span-1 bg-slate-900 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl flex items-center justify-center md:justify-start gap-4 md:gap-5 text-white">
                <div class="w-10 h-10 md:w-12 md:h-12 bg-white/10 text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner"><i class="fas fa-file-invoice"></i></div>
                <div>
                    <p class="text-[9px] md:text-[10px] font-black text-slate-400 uppercase">رقم الفاتورة الحالية</p>
                    <h4 id="purchase-inv-no" class="text-sm md:text-lg font-black font-mono text-emerald-400">PUR-${Math.floor(Math.random()*900000)}</h4>
                </div>
            </div>
        </div>

        <!-- منطقة إدخال البيانات والتفاصيل -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            
            <!-- القسم الأيمن: إدخال الأصناف والقائمة -->
            <div class="lg:col-span-2 space-y-6 md:space-y-8">
                
                <!-- بلوك البحث والإضافة -->
                <div class="bg-white rounded-[2rem] md:rounded-[3.5rem] p-5 md:p-10 shadow-sm md:shadow-xl border border-slate-50 relative z-20">
                    
                    <div class="flex flex-col md:flex-row gap-5 md:gap-8 mb-6 md:mb-8">
                        <!-- حقل البحث -->
                        <div class="flex-1 relative">
                            <label class="block text-[10px] font-black text-slate-400 mb-2 mr-2 uppercase italic">ابحث عن صنف لشرائه</label>
                            <input type="text" id="p-search" placeholder="اكتب اسم المنتج أو الباركود..." autocomplete="off"
                                   class="w-full bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl p-4 pr-12 text-[16px] md:text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner">
                            <i class="fas fa-search absolute right-4 top-10 text-slate-300"></i>
                            
                            <!-- قائمة النتائج المنسدلة -->
                            <div id="search-results" class="absolute z-50 w-full bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] rounded-2xl mt-2 max-h-48 overflow-y-auto hidden border border-slate-100 divide-y divide-slate-50"></div>
                        </div>
                        
                        <!-- معلومات الصنف المحددة -->
                        <div class="grid grid-cols-2 gap-3 bg-slate-50/80 p-3 md:p-4 rounded-xl md:rounded-3xl border border-slate-100 text-center shrink-0">
                             <div>
                                <p class="text-[9px] font-black text-slate-400 uppercase mb-1">بالمخزن</p>
                                <span id="current-stock-info" class="text-sm md:text-lg font-black text-slate-700 font-mono bg-white px-3 py-1 rounded-lg border border-slate-200">0</span>
                             </div>
                             <div>
                                <p class="text-[9px] font-black text-slate-400 uppercase mb-1">تكلفة سابقة</p>
                                <span id="last-cost-info" class="text-sm md:text-lg font-black text-emerald-600 font-mono bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">0.00</span>
                             </div>
                        </div>
                    </div>

                    <!-- حقول الكمية والسعر وزر الإضافة -->
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                        <div>
                            <label class="block text-[10px] font-black text-slate-400 mb-2 mr-2 uppercase">الكمية المستلمة</label>
                            <input type="number" id="p-qty" value="1" min="1" class="w-full bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl p-3 md:p-4 text-[16px] md:text-sm font-black text-center text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner">
                        </div>
                        <div>
                            <label class="block text-[10px] font-black text-slate-400 mb-2 mr-2 uppercase">تكلفة الوحدة</label>
                            <input type="number" id="p-cost" placeholder="0.00" class="w-full bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl p-3 md:p-4 text-[16px] md:text-sm font-black text-center text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner">
                        </div>
                        <div class="col-span-2 md:col-span-1 flex items-end">
                            <button id="add-to-purchase" class="w-full bg-slate-900 hover:bg-emerald-500 text-white h-[48px] md:h-[55px] rounded-xl md:rounded-2xl font-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                                <i class="fas fa-plus"></i> <span class="md:hidden">إضافة الصنف</span> <span class="hidden md:inline">إضافة للسلة</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- قائمة الأصناف المضافة (عربة المشتريات) - Card Layout للموبايل -->
                <div class="bg-white rounded-[2rem] md:rounded-[3.5rem] p-4 md:p-8 shadow-sm md:shadow-xl border border-slate-50 relative z-10 min-h-[200px]">
                    <div class="flex justify-between items-center mb-4 px-2">
                        <h3 class="font-black text-slate-700 text-sm md:text-base"><i class="fas fa-list-ul text-slate-400 ml-2"></i>أصناف الفاتورة</h3>
                        <span id="items-count" class="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded-md">0 أصناف</span>
                    </div>
                    
                    <div id="purchase-items-list" class="space-y-3">
                        <div class="text-center py-10 opacity-40">
                            <i class="fas fa-shopping-cart text-4xl mb-3 block text-slate-300"></i>
                            <span class="text-xs font-bold text-slate-500">قم بإضافة أصناف للفاتورة</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- القسم الأيسر: الإجمالي والترحيل (عائم في الموبايل) -->
            <div class="relative z-30">
                <!-- في الموبايل يكون لاصق أسفل الشاشة -->
                <div class="bg-gradient-to-br from-slate-800 to-slate-950 p-6 md:p-10 rounded-t-[2rem] md:rounded-[4rem] text-white shadow-[0_-10px_40px_rgba(0,0,0,0.15)] md:shadow-2xl fixed bottom-0 left-0 right-0 md:relative w-full md:w-auto">
                    
                    <div class="flex md:flex-col justify-between items-center md:items-start gap-4">
                        <div>
                             <p class="text-[9px] md:text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 md:mb-4 italic">الإجمالي المطلوب</p>
                            <h4 id="purchase-total-display" class="text-2xl md:text-5xl font-black font-mono tracking-tighter text-white">0.00</h4>
                        </div>
                        
                        <div class="flex md:flex-col gap-2 md:gap-4 md:mt-10 w-auto md:w-full">
                            <button id="save-purchase" class="bg-emerald-500 hover:bg-emerald-400 text-slate-900 p-3 md:p-6 px-6 rounded-xl md:rounded-3xl font-black text-sm md:text-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                                <i class="fas fa-check-circle"></i> <span class="hidden md:inline">ترحيل للمخزن</span> <span class="md:hidden">حفظ</span>
                            </button>
                            <!-- زر التفريغ مخفي في الموبايل في الشريط السفلي توفيراً للمساحة -->
                            <button id="clear-purchase" class="hidden md:flex w-full bg-white/5 hover:bg-white/10 text-white/50 p-4 rounded-3xl font-bold text-[10px] transition-all italic border border-white/5 items-center justify-center">
                                <i class="fas fa-trash-alt ml-2"></i> إفراغ الفاتورة
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    displayArea.innerHTML = purchasesHTML;

    // --- المنطق البرمجي المعدل للـ Mobile & UI ---
    let currentPurchaseItems = [];
    let selectedProduct = null;
    let allProducts = [];

    async function init() {
        allProducts = await db.table('products').toArray();
        const invoices = await db.table('invoices').toArray();
        const today = new Date().toISOString().split('T')[0];
        const todayPurchases = invoices.filter(inv => inv.type === 'PURCHASE' && inv.date.startsWith(today));
        const totalToday = todayPurchases.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
        
        document.getElementById('today-purchases-count').innerText = totalToday.toLocaleString('en-US', { minimumFractionDigits: 2 });
        document.getElementById('low-stock-count').innerText = allProducts.filter(p => p.stock_qty <= 5).length;
    }

    const searchInput = document.getElementById('p-search');
    const resultsDiv = document.getElementById('search-results');

    searchInput.oninput = (e) => {
        const val = e.target.value.trim().toLowerCase();
        if(!val) { resultsDiv.classList.add('hidden'); return; }

        const filtered = allProducts.filter(p => 
            (p.name_ar && p.name_ar.toLowerCase().includes(val)) || 
            (p.sku && p.sku.toLowerCase().includes(val)) ||
            (p.barcode && p.barcode.toLowerCase().includes(val))
        ).slice(0, 8); // تقليل عدد النتائج لتسريع الموبايل

        if(filtered.length === 0) {
            resultsDiv.innerHTML = `<div class="p-3 text-center text-xs text-rose-400 font-bold">لا يوجد صنف بهذا الاسم</div>`;
        } else {
            resultsDiv.innerHTML = filtered.map(p => `
                <div class="p-3 hover:bg-emerald-50 cursor-pointer flex justify-between items-center transition-colors active:bg-emerald-100" 
                     onclick="selectProductForPurchase('${p.id}')">
                    <span class="font-black text-slate-700 text-sm line-clamp-1 flex-1">${p.name_ar}</span>
                    <span class="text-[9px] bg-slate-100 px-2 py-1 rounded-md text-slate-500 font-mono font-bold shrink-0">${p.stock_qty || 0} متوفر</span>
                </div>
            `).join('');
        }
        resultsDiv.classList.remove('hidden');
    };

    // إغلاق قائمة البحث عند النقر خارجها
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !resultsDiv.contains(e.target)) {
            resultsDiv.classList.add('hidden');
        }
    });

    window.selectProductForPurchase = async (id) => {
        const product = allProducts.find(p => p.id == id);
        if(product) {
            selectedProduct = product;
            document.getElementById('p-search').value = product.name_ar;
            document.getElementById('current-stock-info').innerText = product.stock_qty || 0;
            document.getElementById('last-cost-info').innerText = (parseFloat(product.cost) || 0).toFixed(2);
            document.getElementById('p-cost').value = product.cost || "";
            
            // إخفاء الكيبورد والقائمة
            document.getElementById('p-search').blur();
            resultsDiv.classList.add('hidden');
            
            // التركيز على حقل الكمية لتسريع العمل
            setTimeout(() => document.getElementById('p-qty').focus(), 100);
        }
    };

    document.getElementById('add-to-purchase').onclick = () => {
        if(!selectedProduct) {
            playFeedback('error');
            Swal.fire({icon: 'warning', title: 'تنبيه', text: 'يرجى البحث واختيار صنف أولاً!', toast: true, position: 'top', timer: 2000, showConfirmButton: false});
            return;
        }
        
        const qty = parseFloat(document.getElementById('p-qty').value) || 0;
        const cost = parseFloat(document.getElementById('p-cost').value) || 0;

        if(qty <= 0 || cost <= 0) {
            playFeedback('error');
            Swal.fire({icon: 'error', title: 'قيم غير صالحة', text: 'تأكد من إدخال كمية وتكلفة صحيحة', toast: true, position: 'top', timer: 2000, showConfirmButton: false});
            return;
        }

        // تحديث الصنف إذا كان موجوداً مسبقاً في الفاتورة
        const existingItem = currentPurchaseItems.find(i => i.productId === selectedProduct.id);
        if (existingItem) {
            existingItem.qty += qty;
            existingItem.cost = cost; // تحديث السعر لآخر سعر مُدخل
            existingItem.total = existingItem.qty * existingItem.cost;
        } else {
            currentPurchaseItems.unshift({ // إضافته في الأعلى
                productId: selectedProduct.id,
                name: selectedProduct.name_ar,
                qty,
                cost,
                total: qty * cost
            });
        }

        playFeedback('success');
        updateUI();
        resetInputs();
    };

    function updateUI() {
        const list = document.getElementById('purchase-items-list');
        const countBadge = document.getElementById('items-count');
        
        if (currentPurchaseItems.length === 0) {
            list.innerHTML = `
                <div class="text-center py-10 opacity-40">
                    <i class="fas fa-shopping-cart text-4xl mb-3 block text-slate-300"></i>
                    <span class="text-xs font-bold text-slate-500">قم بإضافة أصناف للفاتورة</span>
                </div>`;
            document.getElementById('purchase-total-display').innerText = "0.00";
            countBadge.innerText = "0 أصناف";
            return;
        }

        let total = 0;
        list.innerHTML = currentPurchaseItems.map((item, index) => {
            total += item.total;
            return `
            <div class="bg-white border border-slate-100 rounded-xl md:rounded-2xl p-3 md:p-4 flex justify-between items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex-1">
                    <h5 class="font-black text-sm text-slate-800 line-clamp-1">${item.name}</h5>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="bg-slate-100 text-slate-600 font-mono text-[10px] font-black px-2 py-0.5 rounded">${item.qty} وحدة</span>
                        <span class="text-[10px] text-slate-400 font-bold">× ${item.cost.toFixed(2)}</span>
                    </div>
                </div>
                <div class="flex flex-col items-end gap-1">
                    <span class="font-black font-mono text-emerald-600 text-base md:text-lg">${item.total.toFixed(2)}</span>
                    <button onclick="removePurchaseItem(${index})" class="text-rose-400 hover:text-rose-600 text-[10px] font-bold active:scale-90 transition-transform">
                        <i class="fas fa-trash-alt ml-1"></i>حذف
                    </button>
                </div>
            </div>`;
        }).join('');
        
        document.getElementById('purchase-total-display').innerText = total.toLocaleString('en-US', { minimumFractionDigits: 2 });
        countBadge.innerText = `${currentPurchaseItems.length} أصناف`;
    }

    window.removePurchaseItem = (index) => {
        playFeedback('delete');
        currentPurchaseItems.splice(index, 1);
        updateUI();
    };

    document.getElementById('clear-purchase').onclick = () => {
        if(currentPurchaseItems.length === 0) return;
        currentPurchaseItems = [];
        updateUI();
        resetInputs();
    };

    // --- دالة الترحيل الذكية المعدلة ---
    document.getElementById('save-purchase').onclick = async () => {
        if (currentPurchaseItems.length === 0) {
            Swal.fire({icon: 'warning', title: 'السلة فارغة!', customClass: {popup: 'rounded-3xl'}});
            return;
        }

        const invNo = document.getElementById('purchase-inv-no').innerText;
        const total = currentPurchaseItems.reduce((acc, curr) => acc + curr.total, 0);

        // طلب تأكيد قبل الترحيل (لأمان النظام)
        const confirmResult = await Swal.fire({
            title: 'تأكيد الترحيل؟',
            text: `سيتم إضافة الأصناف للمخزن بتكلفة إجمالية ${total.toLocaleString()}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'نعم، قم بالترحيل',
            cancelButtonText: 'مراجعة',
            confirmButtonColor: '#10b981',
            customClass: {popup: 'rounded-3xl', confirmButton: 'rounded-xl font-bold', cancelButton: 'rounded-xl font-bold'}
        });

        if (!confirmResult.isConfirmed) return;

        try {
            await db.transaction('rw', [db.invoices, db.invoice_items, db.products], async () => {
                
                const invId = await db.invoices.add({
                    invoice_number: invNo,
                    type: 'PURCHASE', 
                    date: new Date().toISOString(), // حفظ الوقت الكامل
                    total: total,
                    status: 'paid'
                });

                for (let item of currentPurchaseItems) {
                    await db.invoice_items.add({
                        invoice_id: invId,
                        product_id: item.productId,
                        product_name: item.name,
                        qty: item.qty,
                        price: item.cost, 
                        total_item: item.total
                    });

                    const product = await db.products.get(Number(item.productId));
                    if (product) {
                        const newQty = (parseFloat(product.stock_qty) || 0) + item.qty;
                        await db.products.update(Number(item.productId), { 
                            stock_qty: newQty,
                            cost: item.cost 
                        });
                    }
                }
            });

            playFeedback('success');
            await Swal.fire({
                icon: 'success', 
                title: 'تم الترحيل بنجاح 🚀', 
                text: 'تم تحديث كميات المخزن وحساب التكاليف', 
                timer: 2000, 
                showConfirmButton: false,
                customClass: {popup: 'rounded-3xl'}
            });
            
            // إعادة ضبط الشاشة لعملية جديدة
            currentPurchaseItems = [];
            document.getElementById('purchase-inv-no').innerText = `PUR-${Math.floor(Math.random()*900000)}`;
            updateUI();
            resetInputs();
            init(); // لتحديث إحصائيات الأعلى

        } catch (err) {
            console.error(err);
            Swal.fire({icon: 'error', title: 'خطأ في النظام', text: err.message, customClass: {popup: 'rounded-3xl'}});
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

    // تأثيرات صوتية واهتزاز للهاتف
    function playFeedback(type) {
        if (navigator.vibrate) {
            if (type === 'success') navigator.vibrate([100, 50, 100]);
            else if (type === 'error' || type === 'delete') navigator.vibrate(200);
            else navigator.vibrate(50);
        }
    }

    init();
})();