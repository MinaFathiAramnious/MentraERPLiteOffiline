/**
 * MENTRA ERP - Smart POS Engine v3.0 (Mobile Native Optimized)
 * Features: Mobile UI, Haptic Feedback, SweetAlert2, No-Table Layout
 */

(function() {
    // 1. الحالة الداخلية
    let state = {
        cart: [],
        taxRate: 0.00, // يمكنك تغييرها لـ 0.15 إذا كان هناك ضريبة
        discount: 0
    };

    const posHTML = `
    <!-- الحاوية الرئيسية: في الديسكتوب صفين، في الموبايل عمودي -->
    <div class="flex flex-col lg:flex-row gap-4 md:gap-6 h-[calc(100vh-6rem)] animate-fade-in font-sans" dir="rtl" style="-webkit-tap-highlight-color: transparent;">
        
        <!-- القسم الأيمن: البحث وعربة التسوق -->
        <div class="flex-1 flex flex-col gap-4 h-full overflow-hidden">
            
            <!-- شريط البحث السريع -->
            <div class="bg-white p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-100 shrink-0">
                <div class="relative flex-1">
                    <i class="fas fa-barcode absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 text-lg"></i>
                    <!-- text-[16px] حيوية لمنع الأندرويد من عمل Zoom -->
                    <input type="text" id="smart-search" 
                        placeholder="ابحث باسم المنتج أو الباركود..." 
                        class="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl py-3 pr-12 pl-4 font-bold text-[16px] text-slate-700 outline-none transition-all">
                </div>
                <!-- نتائج البحث (تظهر أفقياً لتوفير المساحة) -->
                <div id="search-results" class="flex gap-3 overflow-x-auto pb-2 pt-3 hide-scrollbar">
                    <p class="text-xs text-slate-400 font-bold w-full text-center py-2"><i class="fas fa-search mr-1"></i> اكتب للبحث أو استخدم القارئ</p>
                </div>
            </div>

            <!-- قائمة المنتجات (عربة التسوق) -->
            <div class="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-slate-100 flex-1 overflow-y-auto p-2 md:p-4 hide-scrollbar">
                <div class="flex justify-between items-center mb-4 px-2">
                    <h3 class="font-black text-slate-700 text-sm md:text-base"><i class="fas fa-shopping-basket text-blue-500 ml-1"></i> الفاتورة الحالية</h3>
                    <button onclick="clearCart()" class="text-[10px] md:text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg hover:bg-rose-100 active:scale-95 transition-all">إفراغ</button>
                </div>
                
                <div id="cart-items-container" class="space-y-3">
                    <!-- يتم الحقن هنا -->
                    <div class="text-center py-20 opacity-50">
                        <i class="fas fa-cart-arrow-down text-5xl text-slate-300 mb-3 block"></i>
                        <span class="text-slate-400 font-bold text-sm">الفاتورة فارغة</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- القسم الأيسر: لوحة الدفع والملخص (في الموبايل تلتصق بالأسفل) -->
        <div class="w-full lg:w-[350px] xl:w-[400px] shrink-0">
            <div class="bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 text-white shadow-2xl sticky bottom-0">
                
                <div class="flex justify-between items-center mb-6">
                    <span class="text-slate-400 text-xs font-bold uppercase tracking-widest">ملخص الحساب</span>
                    <span class="bg-white/10 text-emerald-400 text-[10px] font-black px-2 py-1 rounded-md">INV-${Date.now().toString().slice(-4)}</span>
                </div>

                <div class="space-y-3 mb-6">
                    <div class="flex justify-between text-slate-400 text-sm font-bold">
                        <span>الإجمالي الفرعي</span>
                        <span id="sub-total" class="font-mono">0.00</span>
                    </div>
                    <div class="flex justify-between text-slate-400 text-sm font-bold hidden" id="tax-row">
                        <span>الضريبة</span>
                        <span id="tax-amount" class="font-mono">0.00</span>
                    </div>
                    
                    <div class="flex justify-between items-center text-rose-400 text-sm font-bold bg-white/5 p-2 rounded-xl border border-white/5">
                        <span>الخصم (إن وجد)</span>
                        <input type="number" id="discount-input" oninput="updateTotals()" value="0" 
                            class="w-20 bg-transparent border-b-2 border-rose-500/30 text-center text-white text-[16px] focus:border-rose-500 outline-none p-1 font-mono">
                    </div>
                    
                    <div class="pt-4 border-t border-white/10 text-center">
                        <p class="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-1">المطلوب دفعه</p>
                        <h2 id="final-total" class="text-5xl md:text-6xl font-black tracking-tighter text-white">0.00</h2>
                    </div>
                </div>

                <div class="space-y-3">
                    <input type="text" id="customer-name" placeholder="اسم العميل (اختياري)..." 
                        class="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-sm font-bold text-white focus:bg-slate-700 outline-none transition-all text-[16px]">
                    
                    <div class="grid grid-cols-2 gap-3">
                        <button onclick="processCheckout('CASH')" class="bg-emerald-500 hover:bg-emerald-400 text-slate-900 p-4 rounded-xl font-black transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                            <i class="fas fa-money-bill-wave"></i> كاش
                        </button>
                        <button onclick="processCheckout('CARD')" class="bg-blue-500 hover:bg-blue-400 text-white p-4 rounded-xl font-black transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                            <i class="fas fa-credit-card"></i> شبكة
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <style>
        /* إخفاء السكرول بار داخل النتائج والعربة لتحسين المظهر */
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
    `;

    document.getElementById('main-content-display').innerHTML = posHTML;

    // --- المنطق البرمجي (Logic) ---

    window.liveSearch = async (val) => {
        const resultsArea = document.getElementById('search-results');
        if (val.trim().length === 0) {
            resultsArea.innerHTML = `<p class="text-xs text-slate-400 font-bold w-full text-center py-2"><i class="fas fa-search mr-1"></i> اكتب للبحث أو استخدم القارئ</p>`;
            return;
        }

        try {
            // البحث المطابق وغير المطابق
            const products = await db.products
                .filter(p => (p.name_ar && p.name_ar.includes(val)) || p.sku === val || p.barcode === val)
                .limit(10) // تقليل العدد لعدم تجميد الموبايل
                .toArray();

            // إضافة ذكية: إذا مسح باركود وتطابق منتج واحد، أضفه مباشرة وامسح البحث
            if (products.length === 1 && (products[0].sku === val || products[0].barcode === val)) {
                addToCart(products[0]);
                document.getElementById('smart-search').value = '';
                resultsArea.innerHTML = `<p class="text-xs text-emerald-500 font-bold w-full text-center py-2"><i class="fas fa-check-circle mr-1"></i> تم الإضافة</p>`;
                return;
            }

            if (products.length > 0) {
                resultsArea.innerHTML = products.map(p => `
                    <div onclick='addToCart(${JSON.stringify(p).replace(/'/g, "&#39;")})' 
                         class="bg-blue-50/50 p-3 rounded-xl border border-blue-100 hover:bg-blue-100 cursor-pointer transition-all min-w-[120px] md:min-w-[140px] shrink-0 active:scale-95">
                        <p class="font-black text-slate-700 text-xs truncate mb-1">${p.name_ar}</p>
                        <p class="text-blue-600 font-black text-sm">${Number(p.price).toFixed(2)}</p>
                    </div>
                `).join('');
            } else {
                resultsArea.innerHTML = `<p class="text-xs text-rose-400 font-bold w-full text-center py-2">لا يوجد منتج بهذا الاسم أو الباركود</p>`;
            }
        } catch (error) {
            console.error("Search Error:", error);
        }
    };

    document.getElementById('smart-search').addEventListener('input', (e) => liveSearch(e.target.value));

    window.addToCart = (product) => {
        const exist = state.cart.find(i => i.id === product.id);
        if (exist) {
            exist.qty++;
        } else {
            state.cart.unshift({ // إضافته في أول القائمة
                id: product.id,
                name: product.name_ar || 'منتج',
                price: Number(product.price || 0),
                qty: 1
            });
        }
        playFeedback();
        renderCart();
    };

    window.renderCart = () => {
        const container = document.getElementById('cart-items-container');
        
        if(state.cart.length === 0) {
            container.innerHTML = `
                <div class="text-center py-20 opacity-50">
                    <i class="fas fa-cart-arrow-down text-5xl text-slate-300 mb-3 block"></i>
                    <span class="text-slate-400 font-bold text-sm">الفاتورة فارغة</span>
                </div>`;
            updateTotals();
            return;
        }

        container.innerHTML = state.cart.map(item => `
            <div class="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] transition-all">
                
                <div class="flex-1">
                    <h4 class="font-black text-sm text-slate-800 line-clamp-1">${item.name}</h4>
                    <div class="text-xs font-bold text-slate-400 mt-0.5">${item.price.toFixed(2)} للوحدة</div>
                </div>
                
                <div class="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                    <!-- أزرار الكمية الكبيرة للمس -->
                    <div class="flex items-center gap-1 bg-slate-50 rounded-xl p-1 border border-slate-100">
                        <button onclick="updateQty(${item.id}, -1)" class="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm hover:text-rose-500 active:scale-90 transition-transform"><i class="fas fa-minus text-xs"></i></button>
                        <span class="font-black text-slate-800 w-6 md:w-8 text-center text-sm">${item.qty}</span>
                        <button onclick="updateQty(${item.id}, 1)" class="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm hover:text-emerald-500 active:scale-90 transition-transform"><i class="fas fa-plus text-xs"></i></button>
                    </div>
                    
                    <div class="flex flex-col items-end min-w-[70px]">
                        <span class="font-black text-blue-600 text-sm md:text-base">${(item.price * item.qty).toFixed(2)}</span>
                        <button onclick="removeItem(${item.id})" class="text-rose-400 text-[10px] font-bold mt-1 hover:text-rose-600"><i class="fas fa-trash-alt ml-1"></i>حذف</button>
                    </div>
                </div>
            </div>
        `).join('');
        
        updateTotals();
    };

    window.updateTotals = () => {
        const sub = state.cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
        const tax = sub * state.taxRate;
        const disc = parseFloat(document.getElementById('discount-input').value) || 0;
        const final = (sub + tax) - disc;

        document.getElementById('sub-total').innerText = sub.toFixed(2);
        document.getElementById('tax-amount').innerText = tax.toFixed(2);
        document.getElementById('final-total').innerText = final > 0 ? final.toFixed(2) : "0.00";
        
        if(state.taxRate > 0) document.getElementById('tax-row').classList.remove('hidden');
    };

    window.updateQty = (id, change) => {
        const item = state.cart.find(i => i.id === id);
        if (item) {
            item.qty += change;
            if (item.qty <= 0) {
                removeItem(id);
            } else {
                playFeedback('tap');
                renderCart();
            }
        }
    };

    window.removeItem = (id) => {
        state.cart = state.cart.filter(i => i.id !== id);
        playFeedback('delete');
        renderCart();
    };

    window.clearCart = async () => {
        if(state.cart.length === 0) return;
        const res = await Swal.fire({
            title: 'إفراغ الفاتورة؟',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم',
            cancelButtonText: 'تراجع',
            confirmButtonColor: '#ef4444',
            customClass: { popup: 'rounded-3xl' }
        });
        if(res.isConfirmed) {
            state.cart = [];
            document.getElementById('discount-input').value = 0;
            renderCart();
        }
    };

    window.processCheckout = async (method) => {
        if (state.cart.length === 0) {
            Swal.fire({ icon: 'error', title: 'الفاتورة فارغة', toast: true, position: 'top', timer: 2000, showConfirmButton: false });
            return;
        }
        
        const finalTotal = parseFloat(document.getElementById('final-total').innerText);
        if(finalTotal < 0) {
            Swal.fire({ icon: 'error', title: 'الخصم أكبر من قيمة الفاتورة', toast: true, position: 'top', timer: 2000, showConfirmButton: false });
            return;
        }

        try {
            const today = new Date().toISOString(); // حفظ التاريخ والوقت الكامل
            
            // استخدام Dexie Transaction لضمان سلامة البيانات
            await db.transaction('rw', db.invoices, db.invoice_items, db.products, async () => {
                
                const invId = await db.invoices.add({
                    invoice_number: 'INV-' + Date.now().toString().slice(-6),
                    customer_vendor_name: document.getElementById('customer-name').value || "عميل نقدي",
                    date: today,
                    total: finalTotal,
                    method: method,
                    type: 'SALE',
                    status: 'PAID',
                    discount: parseFloat(document.getElementById('discount-input').value) || 0
                });

                for (let item of state.cart) {
                    await db.invoice_items.add({
                        invoice_id: invId,
                        product_id: item.id,
                        product_name: item.name,
                        price: item.price,
                        qty: item.qty,
                        total_item: item.price * item.qty
                    });

                    // خصم من المخزون
                    const p = await db.products.get(item.id);
                    if (p) {
                        await db.products.update(item.id, { stock_qty: (parseFloat(p.stock_qty) || 0) - item.qty });
                    }
                }
            });

            playFeedback('success');
            
            Swal.fire({
                title: 'تم الدفع بنجاح 🎉',
                text: `الإجمالي: ${finalTotal.toFixed(2)}`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                customClass: { popup: 'rounded-3xl' }
            });

            // إعادة ضبط الكاشير
            state.cart = [];
            document.getElementById('customer-name').value = '';
            document.getElementById('discount-input').value = 0;
            document.getElementById('smart-search').value = '';
            document.getElementById('search-results').innerHTML = `<p class="text-xs text-slate-400 font-bold w-full text-center py-2"><i class="fas fa-search mr-1"></i> اكتب للبحث أو استخدم القارئ</p>`;
            renderCart();

        } catch (e) {
            console.error(e);
            Swal.fire({ icon: 'error', title: 'حدث خطأ أثناء الحفظ', text: e.message });
        }
    };

    // نظام ردود الأفعال (صوت واهتزاز للموبايل)
    function playFeedback(type = 'click') {
        // 1. الاهتزاز إذا كان الجهاز يدعمه (أندرويد)
        if (navigator.vibrate) {
            if (type === 'success') navigator.vibrate([100, 50, 100]);
            else if (type === 'delete') navigator.vibrate(100);
            else navigator.vibrate(40);
        }

        // 2. الصوت (Web Audio API)
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            if (type === 'click' || type === 'tap') { 
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, ctx.currentTime); 
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1); 
            }
            if (type === 'success') { 
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(600, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3); 
            }
            if (type === 'delete') {
                osc.type = 'square';
                osc.frequency.setValueAtTime(200, ctx.currentTime);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15); 
            }
            
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } catch(e) { /* تجاهل أخطاء الصوت إذا لم يدعمها المتصفح */ }
    }

})();