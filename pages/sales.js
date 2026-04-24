/**
 * MENTRA ERP - Smart POS Engine v3.1 (Mobile Native Optimized + Bug Fixes)
 * Features: Mobile UI, Haptic Feedback, SweetAlert2, No-Table Layout
 */

(function() {
    let state = {
        cart: [],
        taxRate: 0.00, 
        discount: 0
    };

    const posHTML = `
    <style>
        /* ===== POS Layout ===== */
        #pos-wrap { display:flex; flex-direction:column; height:100%; font-family:inherit; direction:rtl; -webkit-tap-highlight-color:transparent; }

        #pos-search-bar { flex-shrink:0; background:#fff; border-radius:1.25rem; padding:12px 14px; margin-bottom:10px; border:1px solid #f1f5f9; box-shadow:0 1px 4px rgba(0,0,0,.06); }
        #pos-search-bar input { width:100%; background:#f8fafc; border:2px solid transparent; border-radius:.75rem; padding:10px 44px 10px 12px; font-size:16px; font-weight:700; color:#334155; outline:none; transition:border-color .2s; }
        #pos-search-bar input:focus { border-color:#3b82f6; background:#fff; }
        #pos-search-bar .barcode-icon { position:absolute; right:12px; top:50%; transform:translateY(-50%); color:#3b82f6; font-size:1.1rem; }
        #search-results { display:flex; gap:10px; overflow-x:auto; padding:8px 0 4px; scrollbar-width:none; }
        #search-results::-webkit-scrollbar { display:none; }

        #pos-cart-wrap { flex:1; min-height:0; overflow-y:auto; background:#fff; border-radius:1.25rem; border:1px solid #f1f5f9; box-shadow:0 1px 4px rgba(0,0,0,.06); padding:12px; scrollbar-width:none; }
        #pos-cart-wrap::-webkit-scrollbar { display:none; }

        #pos-bottom-bar { flex-shrink:0; background:#0f172a; border-radius:1rem 1rem 0 0; padding:10px 12px 12px; box-shadow:0 -4px 20px rgba(0,0,0,.35); }

        @media (min-width: 1024px) {
            #pos-wrap { flex-direction:row; gap:24px; }
            #pos-left  { flex:1; min-width:0; display:flex; flex-direction:column; }
            #pos-right { width:340px; flex-shrink:0; }
            #pos-bottom-bar { display:none !important; }
            #pos-desktop-panel { display:flex !important; flex-direction:column; background:#0f172a; border-radius:2rem; padding:2rem; color:#fff; box-shadow:0 20px 60px rgba(0,0,0,.3); position:sticky; top:1rem; }
        }
        @media (max-width: 1023px) {
            #pos-left  { flex:1; min-width:0; display:flex; flex-direction:column; }
            #pos-right { display:none; }
        }

        .search-card { background:#eff6ff; padding:10px 12px; border-radius:.75rem; border:1px solid #dbeafe; cursor:pointer; min-width:110px; flex-shrink:0; transition:background .15s; }
        .search-card:active { background:#dbeafe; }
        .search-card .sc-name { font-weight:900; font-size:.75rem; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:110px; }
        .search-card .sc-price { font-weight:900; font-size:.85rem; color:#2563eb; margin-top:2px; }
        .search-card .sc-stock { font-size:.65rem; font-weight:700; margin-top:2px; }
        .sc-stock.ok  { color:#10b981; }
        .sc-stock.out { color:#ef4444; }

        .cart-card { background:#fff; border:1px solid #f1f5f9; border-radius:1rem; padding:12px 14px; display:flex; justify-content:space-between; align-items:center; gap:12px; box-shadow:0 2px 8px rgba(6,81,237,.07); margin-bottom:10px; }
        .cart-card .cc-info { flex:1; min-width:0; }
        .cart-card .cc-name { font-weight:900; font-size:.85rem; color:#1e293b; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .cart-card .cc-unit { font-size:.7rem; color:#94a3b8; font-weight:700; margin-top:2px; }
        .cart-card .cc-controls { display:flex; align-items:center; gap:12px; flex-shrink:0; }
        .qty-box { display:flex; align-items:center; gap:4px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:.65rem; padding:4px; }
        .qty-btn { width:34px; height:34px; border-radius:.5rem; background:#fff; border:none; cursor:pointer; font-size:1rem; display:flex; align-items:center; justify-content:center; color:#475569; box-shadow:0 1px 3px rgba(0,0,0,.1); transition:transform .1s; }
        .qty-btn:active { transform:scale(.88); }
        .qty-num { font-weight:900; font-size:.9rem; color:#1e293b; width:26px; text-align:center; }
        .cc-total-wrap { display:flex; flex-direction:column; align-items:flex-end; min-width:64px; }
        .cc-total { font-weight:900; font-size:.95rem; color:#2563eb; }
        .cc-del { font-size:.65rem; font-weight:700; color:#f87171; cursor:pointer; margin-top:3px; background:none; border:none; }

        #pb-row1 { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
        #pb-total-wrap { flex-shrink:0; }
        #pb-total-label { font-size:8px; font-weight:900; color:#34d399; text-transform:uppercase; }
        #pb-total-val { font-size:1.5rem; font-weight:900; color:#fff; font-family:monospace; line-height:1; }
        #pb-discount-wrap { display:flex; align-items:center; gap:4px; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1); border-radius:.5rem; padding:5px 8px; flex-shrink:0; }
        #pb-discount-wrap span { font-size:8px; font-weight:900; color:#f87171; }
        .sync-discount { width:46px; background:transparent; border:none; color:#fff; font-size:15px; text-align:center; outline:none; font-family:monospace; font-weight:900; }
        .sync-customer { flex:1; min-width:0; background:#1e293b; border:1px solid #334155; border-radius:.5rem; padding:6px 10px; font-size:14px; font-weight:700; color:#fff; outline:none; }
        #pb-row2 { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        .pb-btn { border:none; cursor:pointer; border-radius:.65rem; padding:12px; font-weight:900; font-size:.9rem; display:flex; align-items:center; justify-content:center; gap:6px; box-shadow:0 4px 12px rgba(0,0,0,.2); }
        .pb-cash { background:#10b981; color:#0f172a; }
        .pb-card { background:#3b82f6; color:#fff; }

        #pos-desktop-panel { display:none; }
        .dp-row { display:flex; justify-content:space-between; align-items:center; color:#94a3b8; font-size:.8rem; font-weight:700; margin-bottom:10px; }
        .dp-disc-wrap { display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.06); border-radius:.75rem; padding:8px 12px; margin-bottom:16px; }
        .dp-disc-wrap span { font-size:.8rem; font-weight:900; color:#f87171; }
        .dp-disc-wrap input { width:72px; background:transparent; border:none; border-bottom:2px solid rgba(239,68,68,.3); text-align:center; color:#fff; font-size:16px; outline:none; font-family:monospace; }
        .dp-total-box { border-top:1px solid rgba(255,255,255,.1); padding-top:16px; text-align:center; margin-bottom:20px; }
        .dp-total-label { font-size:.6rem; font-weight:900; color:#34d399; }
        .dp-total-val { font-size:3.5rem; font-weight:900; color:#fff; font-family:monospace; line-height:1.1; }
        .dp-customer { width:100%; background:#1e293b; border:1px solid #334155; border-radius:.75rem; padding:12px 14px; color:#fff; font-size:16px; font-weight:700; outline:none; margin-bottom:12px; box-sizing:border-box; }
        .dp-btns { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .dp-btn { border:none; cursor:pointer; border-radius:.75rem; padding:16px; font-weight:900; font-size:1rem; display:flex; align-items:center; justify-content:center; gap:8px; }
        .dp-cash { background:#10b981; color:#0f172a; }
        .dp-card { background:#3b82f6; color:#fff; }
    </style>

    <div id="pos-wrap">
        <!-- يسار: البحث + العربة -->
        <div id="pos-left">
            <div id="pos-search-bar">
                <div style="position:relative">
                    <i class="fas fa-barcode barcode-icon"></i>
                    <input type="text" id="smart-search" placeholder="ابحث باسم المنتج أو الباركود...">
                </div>
                <div id="search-results">
                    <p style="font-size:.7rem;color:#94a3b8;font-weight:700;width:100%;text-align:center;padding:6px 0">
                        <i class="fas fa-search" style="margin-left:4px"></i> اكتب للبحث أو استخدم القارئ
                    </p>
                </div>
            </div>

            <div id="pos-cart-wrap">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding:0 4px">
                    <h3 style="font-weight:900;font-size:.9rem;color:#334155"><i class="fas fa-shopping-basket" style="color:#3b82f6;margin-left:6px"></i> الفاتورة الحالية</h3>
                    <button onclick="clearCart()" style="font-size:.7rem;font-weight:700;color:#ef4444;background:#fef2f2;border:none;padding:6px 12px;border-radius:.5rem;cursor:pointer">إفراغ</button>
                </div>
                <div id="cart-items-container"></div>
            </div>
        </div>

        <!-- يمين: ديسكتوب panel -->
        <div id="pos-right">
            <div id="pos-desktop-panel">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
                    <span style="color:#94a3b8;font-size:.7rem;font-weight:900;text-transform:uppercase;">ملخص الحساب</span>
                    <span style="background:rgba(255,255,255,.1);color:#34d399;font-size:.6rem;font-weight:900;padding:4px 8px;border-radius:.4rem">INV-${Date.now().toString().slice(-4)}</span>
                </div>
                <div class="dp-row"><span>الإجمالي الفرعي</span><span class="sync-sub-total" style="font-family:monospace">0.00</span></div>
                
                <div class="dp-disc-wrap">
                    <span>الخصم</span>
                    <input type="number" class="sync-discount" oninput="updateTotals(this.value)" value="0">
                </div>
                <div class="dp-total-box">
                    <div class="dp-total-label">المطلوب دفعه</div>
                    <div class="dp-total-val sync-final-total">0.00</div>
                </div>
                <input type="text" class="dp-customer sync-customer" oninput="syncInputs('sync-customer', this.value)" placeholder="اسم العميل (اختياري)...">
                <div class="dp-btns">
                    <button class="dp-btn dp-cash" onclick="processCheckout('CASH')"><i class="fas fa-money-bill-wave"></i> كاش</button>
                    <button class="dp-btn dp-card" onclick="processCheckout('CARD')"><i class="fas fa-credit-card"></i> شبكة</button>
                </div>
            </div>
        </div>

        <!-- الشريط السفلي (موبايل فقط) -->
        <div id="pos-bottom-bar" dir="rtl">
            <div id="pb-row1">
                <div id="pb-total-wrap">
                    <div id="pb-total-label">الإجمالي</div>
                    <div id="pb-total-val" class="sync-final-total">0.00</div>
                </div>
                <div id="pb-discount-wrap">
                    <span>خصم</span>
                    <input type="number" class="sync-discount" oninput="updateTotals(this.value)" value="0" placeholder="0">
                </div>
                <input type="text" class="sync-customer" oninput="syncInputs('sync-customer', this.value)" placeholder="العميل...">
            </div>
            <div id="pb-row2">
                <button class="pb-btn pb-cash" onclick="processCheckout('CASH')"><i class="fas fa-money-bill-wave"></i> كاش</button>
                <button class="pb-btn pb-card" onclick="processCheckout('CARD')"><i class="fas fa-credit-card"></i> شبكة</button>
            </div>
        </div>
    </div>
    `;

    document.getElementById('main-content-display').innerHTML = posHTML;

    function applyPosHeight() {
        const wrap = document.getElementById('pos-wrap');
        const container = document.getElementById('main-content-display');
        if (!wrap || !container) return;
        const rect = container.getBoundingClientRect();
        const bottomBar = document.getElementById('pos-bottom-bar');
        const bbH = (bottomBar && window.innerWidth < 1024) ? bottomBar.offsetHeight : 0;
        wrap.style.height = (window.innerHeight - rect.top - bbH) + 'px';
    }
    requestAnimationFrame(() => applyPosHeight());
    window.addEventListener('resize', applyPosHeight);

    // --- المنطق البرمجي (Logic) ---

    // الدالة المفقودة: مزامنة العناصر بين شاشة الديسكتوب والموبايل
    window.setAllText = (className, value) => {
        document.querySelectorAll('.' + className).forEach(el => el.innerText = value);
    };
    
    window.syncInputs = (className, value) => {
        document.querySelectorAll('.' + className).forEach(el => {
            if(el.value !== value) el.value = value;
        });
    };

    window.liveSearch = async (val) => {
        const resultsArea = document.getElementById('search-results');
        if (val.trim().length === 0) {
            resultsArea.innerHTML = '<p style="font-size:.7rem;color:#94a3b8;font-weight:700;width:100%;text-align:center;padding:6px 0"><i class="fas fa-search" style="margin-left:4px"></i> اكتب للبحث</p>';
            return;
        }

        try {
            const products = await db.products
                .filter(p => (p.name_ar && p.name_ar.includes(val)) || p.sku === val || p.barcode === val)
                .limit(8)
                .toArray();

            if (products.length === 1 && (products[0].sku === val || products[0].barcode === val)) {
                addToCart(products[0]);
                document.getElementById('smart-search').value = '';
                resultsArea.innerHTML = '<p style="font-size:.7rem;color:#10b981;font-weight:700;width:100%;text-align:center;padding:6px 0">تم الإضافة</p>';
                return;
            }

            if (products.length > 0) {
                resultsArea.innerHTML = products.map(p => {
                    const outOfStock = (parseFloat(p.stock_qty) || 0) <= 0;
                    const encoded = JSON.stringify(p).replace(/'/g, "&#39;");
                    const stockText = outOfStock ? 'نفد' : 'متوفر: ' + p.stock_qty;
                    const stockClass = outOfStock ? 'sc-stock out' : 'sc-stock ok';
                    const cardStyle = outOfStock ? ' style="opacity:.55"' : '';
                    return '<div onclick=\'addToCart(' + encoded + ')\' class="search-card"' + cardStyle + '>' +
                        '<div class="sc-name">' + p.name_ar + '</div>' +
                        '<div class="sc-price">' + Number(p.price).toFixed(2) + '</div>' +
                        '<div class="' + stockClass + '">' + stockText + '</div>' +
                        '</div>';
                }).join('');
            } else {
                resultsArea.innerHTML = '<p style="font-size:.7rem;color:#f87171;font-weight:700;width:100%;text-align:center;padding:6px 0">لا يوجد منتج</p>';
            }
        } catch (error) { console.error(error); }
    };

    document.getElementById('smart-search').addEventListener('input', (e) => liveSearch(e.target.value));

    window.addToCart = (product) => {
        const availableStock = parseFloat(product.stock_qty) || 0;
        const exist = state.cart.find(i => i.id === product.id);
        const currentQtyInCart = exist ? exist.qty : 0;

        if (availableStock <= 0 && currentQtyInCart === 0) {
            playFeedback('delete');
            Swal.fire({ icon: 'warning', title: 'نفد من المخزون', text: product.name_ar + ' غير متوفر', toast: true, position: 'top', timer: 2000, showConfirmButton: false });
            return;
        }
        if (currentQtyInCart >= availableStock) {
            playFeedback('delete');
            Swal.fire({ icon: 'info', title: 'تجاوز الكمية المتاحة', toast: true, position: 'top', timer: 2000, showConfirmButton: false });
            return;
        }

        if (exist) exist.qty++;
        else {
            state.cart.unshift({
                id: product.id,
                name: product.name_ar || 'منتج',
                price: Number(product.price || 0),
                qty: 1,
                maxStock: availableStock
            });
        }
        playFeedback();
        renderCart();
    };

    window.renderCart = () => {
        const container = document.getElementById('cart-items-container');
        if (state.cart.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:60px 0;opacity:.4"><i class="fas fa-cart-arrow-down" style="font-size:3rem;color:#cbd5e1;display:block;margin-bottom:10px"></i><span style="font-size:.8rem;font-weight:700;color:#64748b">الفاتورة فارغة</span></div>';
            updateTotals();
            return;
        }
        container.innerHTML = state.cart.map(function(item) {
            return '<div class="cart-card">' +
                '<div class="cc-info"><div class="cc-name">' + item.name + '</div><div class="cc-unit">' + item.price.toFixed(2) + ' للوحدة</div></div>' +
                '<div class="cc-controls">' +
                    '<div class="qty-box">' +
                        '<button class="qty-btn" onclick="updateQty(' + item.id + ',-1)"><i class="fas fa-minus" style="font-size:.65rem"></i></button>' +
                        '<span class="qty-num">' + item.qty + '</span>' +
                        '<button class="qty-btn" onclick="updateQty(' + item.id + ',1)"><i class="fas fa-plus" style="font-size:.65rem"></i></button>' +
                    '</div>' +
                    '<div class="cc-total-wrap">' +
                        '<span class="cc-total">' + (item.price * item.qty).toFixed(2) + '</span>' +
                        '<button class="cc-del" onclick="removeItem(' + item.id + ')"><i class="fas fa-trash-alt"></i> حذف</button>' +
                    '</div>' +
                '</div></div>';
        }).join('');
        updateTotals();
    };

    window.updateTotals = (discountValue = null) => {
        const sub = state.cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
        
        // مزامنة حقل الخصم بين الموبايل والديسكتوب
        let disc = 0;
        if(discountValue !== null) {
            disc = parseFloat(discountValue) || 0;
            syncInputs('sync-discount', discountValue);
        } else {
            const el = document.querySelector('.sync-discount');
            disc = el ? (parseFloat(el.value) || 0) : 0;
        }

        const final = sub - disc;
        const finalStr = final > 0 ? final.toFixed(2) : "0.00";

        setAllText('sync-sub-total', sub.toFixed(2));
        setAllText('sync-final-total', finalStr);
    };

    window.updateQty = (id, change) => {
        const item = state.cart.find(i => i.id === id);
        if (item) {
            if (change > 0 && item.maxStock !== undefined && item.qty >= item.maxStock) {
                playFeedback('delete');
                Swal.fire({ icon: 'info', title: 'وصلت للحد الأقصى', toast: true, position: 'top', timer: 2000, showConfirmButton: false });
                return;
            }
            item.qty += change;
            if (item.qty <= 0) removeItem(id);
            else { playFeedback('tap'); renderCart(); }
        }
    };

    window.removeItem = (id) => {
        state.cart = state.cart.filter(i => i.id !== id);
        playFeedback('delete');
        renderCart();
    };

    window.clearCart = async () => {
        if(state.cart.length === 0) return;
        const res = await Swal.fire({ title: 'إفراغ الفاتورة؟', icon: 'warning', showCancelButton: true, confirmButtonText: 'نعم', cancelButtonText: 'تراجع', confirmButtonColor: '#ef4444', customClass: { popup: 'rounded-3xl' } });
        if(res.isConfirmed) {
            state.cart = [];
            syncInputs('sync-discount', 0);
            renderCart();
        }
    };

    window.processCheckout = async (method) => {
        if (state.cart.length === 0) {
            Swal.fire({ icon: 'error', title: 'الفاتورة فارغة', toast: true, position: 'top', timer: 2000, showConfirmButton: false }); return;
        }
        
        const finalTotal = parseFloat(document.querySelector('.sync-final-total').innerText);
        if(finalTotal < 0) {
            Swal.fire({ icon: 'error', title: 'الخصم غير منطقي', toast: true, position: 'top', timer: 2000, showConfirmButton: false }); return;
        }

        try {
            const customerName = document.querySelector('.sync-customer').value || "عميل نقدي";
            const discountApplied = parseFloat(document.querySelector('.sync-discount').value) || 0;
            const today = new Date().toISOString(); 
            
            await db.transaction('rw', db.invoices, db.invoice_items, db.products, async () => {
                const invId = await db.invoices.add({
                    invoice_number: 'INV-' + Date.now().toString().slice(-6),
                    customer_vendor_name: customerName,
                    date: today,
                    total: finalTotal,
                    method: method,
                    type: 'SALE',
                    status: 'PAID',
                    discount: discountApplied
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

                    const p = await db.products.get(item.id);
                    if (p) await db.products.update(item.id, { stock_qty: (parseFloat(p.stock_qty) || 0) - item.qty });
                }
            });

            playFeedback('success');
            Swal.fire({ title: 'تم الدفع بنجاح 🎉', text: `الإجمالي: ${finalTotal.toFixed(2)}`, icon: 'success', timer: 2000, showConfirmButton: false, customClass: { popup: 'rounded-3xl' } });

            state.cart = [];
            syncInputs('sync-customer', '');
            syncInputs('sync-discount', 0);
            document.getElementById('smart-search').value = '';
            document.getElementById('search-results').innerHTML = '<p style="font-size:.7rem;color:#94a3b8;font-weight:700;width:100%;text-align:center;padding:6px 0"><i class="fas fa-search" style="margin-left:4px"></i> اكتب للبحث</p>';
            renderCart();

        } catch (e) {
            console.error(e);
            Swal.fire({ icon: 'error', title: 'حدث خطأ', text: e.message });
        }
    };

    function playFeedback(type = 'click') {
        if (navigator.vibrate) {
            if (type === 'success') navigator.vibrate([100, 50, 100]);
            else if (type === 'delete') navigator.vibrate(100);
            else navigator.vibrate(40);
        }
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            
            if (type === 'click' || type === 'tap') { 
                osc.type = 'sine'; osc.frequency.setValueAtTime(800, ctx.currentTime); gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1); 
            }
            if (type === 'success') { 
                osc.type = 'triangle'; osc.frequency.setValueAtTime(600, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1); gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3); 
            }
            if (type === 'delete') {
                osc.type = 'square'; osc.frequency.setValueAtTime(200, ctx.currentTime); gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15); 
            }
            osc.start(); osc.stop(ctx.currentTime + 0.3);
        } catch(e) {}
    }

    renderCart();
})();