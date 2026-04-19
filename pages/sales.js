/**
 * MENTRA ERP - Smart POS Engine v2.0
 * Features: Barcode Auto-detection, Audio Feedback, VAT Calc, Inventory Sync
 */

(function() {
    // 1. الحالة الداخلية (State Management)
    let state = {
        cart: [],
        currentPage: 1,
        itemsPerPage: 6,
        taxRate: 0.15, // ضريبة 15% مثلاً
        discount: 0
    };

    const posHTML = `
    <div class="grid grid-cols-12 gap-6 p-4 animate-fade-in font-sans" dir="rtl">
        <div class="col-span-12 lg:col-span-8 space-y-4">
            <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div class="flex items-center gap-4 mb-6">
                    <div class="relative flex-1">
                        <i class="fas fa-barcode absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 text-xl"></i>
                        <input type="text" id="smart-search" 
                            placeholder="امسح الباركود أو ابحث عن منتج... (F2)" 
                            class="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl py-4 pr-14 pl-4 font-bold transition-all outline-none">
                    </div>
                    <button onclick="toggleScanner()" class="bg-slate-100 p-4 rounded-2xl text-slate-600 hover:bg-emerald-500 hover:text-white transition-all">
                        <i class="fas fa-camera"></i>
                    </button>
                </div>

                <div id="search-results" class="grid grid-cols-2 md:grid-cols-4 gap-4 min-h-[100px]">
                    <div class="col-span-full text-center py-10 text-slate-300">
                        <i class="fas fa-search text-4xl mb-2"></i>
                        <p class="text-sm">ابدأ بالبحث أو المسح السريع</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <table class="w-full">
                    <thead class="bg-slate-50 text-slate-500 text-xs font-black uppercase">
                        <tr>
                            <th class="p-4 text-right">المنتج</th>
                            <th class="p-4 text-center">السعر</th>
                            <th class="p-4 text-center">الكمية</th>
                            <th class="p-4 text-center">الإجمالي</th>
                            <th class="p-4"></th>
                        </tr>
                    </thead>
                    <tbody id="cart-items-rows" class="divide-y divide-slate-50"></tbody>
                </table>
            </div>
        </div>

        <div class="col-span-12 lg:col-span-4">
            <div class="bg-slate-900 rounded-[2.5rem] p-8 text-white sticky top-6 shadow-2xl">
                <h3 class="text-lg font-black mb-6 flex justify-between">
                    <span>ملخص الفاتورة</span>
                    <span class="text-emerald-400">#${Date.now().toString().slice(-5)}</span>
                </h3>

                <div class="space-y-4 mb-8">
                    <div class="flex justify-between text-slate-400">
                        <span>الإجمالي الفرعي</span>
                        <span id="sub-total">0.00</span>
                    </div>
                    <div class="flex justify-between text-slate-400">
                        <span>الضريبة (15%)</span>
                        <span id="tax-amount">0.00</span>
                    </div>
                    <div class="flex justify-between items-center text-rose-400">
                        <span>خصم</span>
                        <input type="number" id="discount-input" oninput="updateTotals()" value="0" 
                            class="w-20 bg-white/10 border-none rounded-lg p-1 text-center text-white focus:ring-1 focus:ring-rose-500 outline-none">
                    </div>
                    <hr class="border-white/10">
                    <div class="text-center py-4">
                        <p class="text-xs text-emerald-400 font-bold mb-1">صافي المطلوب</p>
                        <h2 id="final-total" class="text-6xl font-black tracking-tighter">0.00</h2>
                    </div>
                </div>

                <div class="space-y-3">
                    <input type="text" id="customer-name" placeholder="اسم العميل..." 
                        class="w-full bg-white/5 border-white/10 rounded-2xl p-4 text-sm focus:bg-white/10 outline-none transition-all">
                    
                    <div class="grid grid-cols-2 gap-2">
                        <button onclick="processCheckout('CASH')" class="bg-emerald-600 hover:bg-emerald-500 p-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2">
                            <i class="fas fa-money-bill-wave"></i> كاش
                        </button>
                        <button onclick="processCheckout('CARD')" class="bg-blue-600 hover:bg-blue-500 p-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2">
                            <i class="fas fa-credit-card"></i> شبكة
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

    document.getElementById('main-content-display').innerHTML = posHTML;

    // --- المنطق البرمجي الذكي ---

    // 1. البحث والتعرف على الباركود
    window.liveSearch = async (val) => {
        const resultsArea = document.getElementById('search-results');
        if (val.length < 1) return;

        const products = await db.table('products')
            .filter(p => p.name_ar.includes(val) || p.sku === val)
            .toArray();

        // ذكاء الباركود: إذا كان هناك منتج واحد فقط والبحث مطابق تماماً للباركود، أضفه فوراً
        if (products.length === 1 && products[0].sku === val) {
            addToCart(products[0]);
            document.getElementById('smart-search').value = '';
            return;
        }

        if (products.length > 0) {
            resultsArea.innerHTML = products.map(p => `
                <div onclick='addToCart(${JSON.stringify(p)})' class="bg-slate-50 p-4 rounded-2xl border-2 border-transparent hover:border-emerald-500 cursor-pointer transition-all group">
                    <p class="font-black text-slate-700 text-xs mb-1">${p.name_ar}</p>
                    <p class="text-emerald-600 font-black text-sm">${Number(p.price).toFixed(2)}</p>
                </div>
            `).join('');
        }
    };

    document.getElementById('smart-search').addEventListener('input', (e) => liveSearch(e.target.value));

    // 2. إدارة السلة
    window.addToCart = (product) => {
        const exist = state.cart.find(i => i.id === product.id);
        if (exist) {
            exist.qty++;
        } else {
            state.cart.push({
                id: product.id,
                name: product.name_ar,
                price: Number(product.price),
                qty: 1,
                stock: product.stock_qty
            });
        }
        playAudio('click');
        renderCart();
    };

    window.renderCart = () => {
        const container = document.getElementById('cart-items-rows');
        container.innerHTML = state.cart.map(item => `
            <tr class="hover:bg-slate-50 transition-all">
                <td class="p-4 font-bold text-slate-700 text-sm">${item.name}</td>
                <td class="p-4 text-center font-bold text-slate-400">${item.price.toFixed(2)}</td>
                <td class="p-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                        <button onclick="updateQty(${item.id}, -1)" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-rose-100 hover:text-rose-600">-</button>
                        <span class="font-black w-6">${item.qty}</span>
                        <button onclick="updateQty(${item.id}, 1)" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-600">+</button>
                    </div>
                </td>
                <td class="p-4 text-center font-black text-slate-800">${(item.price * item.qty).toFixed(2)}</td>
                <td class="p-4 text-left">
                    <button onclick="removeItem(${item.id})" class="text-slate-300 hover:text-rose-500"><i class="fas fa-times"></i></button>
                </td>
            </tr>
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
        document.getElementById('final-total').innerText = final.toFixed(2);
    };

    // 3. إنهاء الفاتورة (Checkout)
    window.processCheckout = async (method) => {
        if (state.cart.length === 0) return;
        
        try {
            const finalTotal = parseFloat(document.getElementById('final-total').innerText);
            const today = new Date().toISOString().split('T')[0];

            await db.transaction('rw', ['invoices', 'invoice_items', 'products', 'journal'], async () => {
                const invId = await db.invoices.add({
                    invoice_number: 'INV-' + Date.now().toString().slice(-6),
                    customer_vendor_name: document.getElementById('customer-name').value || "عميل نقدي",
                    date: today,
                    total: finalTotal,
                    method: method,
                    type: 'SALE',
                    status: 'PAID'
                });

                for (let item of state.cart) {
                    // تسجيل ذكي لكل منتج مع اسمه لضمان عدم ضياع البيانات
                    await db.invoice_items.add({
                        invoice_id: invId,
                        product_id: item.id,
                        product_name: item.name, // مهم جداً
                        price: item.price,
                        qty: item.qty,
                        total_item: item.price * item.qty
                    });

                    // تحديث المخزن
                    const p = await db.products.get(item.id);
                    if (p) await db.products.update(item.id, { stock_qty: p.stock_qty - item.qty });
                }
            });

            playAudio('success');
            alert("تم حفظ الفاتورة بنجاح 🎉");
            state.cart = [];
            renderCart();
            document.getElementById('customer-name').value = '';
        } catch (e) {
            console.error(e);
        }
    };

    // وظائف مساعدة
    window.updateQty = (id, change) => {
        const item = state.cart.find(i => i.id === id);
        if (item) {
            item.qty += change;
            if (item.qty <= 0) removeItem(id);
            renderCart();
        }
    };

    window.removeItem = (id) => {
        state.cart = state.cart.filter(i => i.id !== id);
        renderCart();
    };

    function playAudio(type) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        if (type === 'click') { osc.frequency.value = 800; gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1); }
        if (type === 'success') { osc.frequency.value = 1200; gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3); }
        
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    }

})();