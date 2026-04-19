/**
 * MENTRA ERP - Ultra Dashboard v5.0 (Intelligence & Fixes)
 * التعديلات: إصلاح محرك المشتريات، مرونة في قراءة أنواع الفواتير، وتحسين الرسوم البيانية المصغرة
 */

(function() {
    const displayArea = document.getElementById('main-content-display');

    const dashboardHTML = `
    <div class="animate-fade-in space-y-8 pb-16 px-4" style="direction: rtl; text-align: right;">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/60 backdrop-blur-2xl p-8 rounded-[3rem] border border-white shadow-2xl shadow-slate-200/50">
            <div class="flex items-center gap-6">
                <div class="w-16 h-16 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center text-2xl shadow-xl">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div>
                    <h2 class="text-3xl font-black text-slate-900 tracking-tighter italic">الرادار المالي الذكي</h2>
                    <p class="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-1">تحليل البيانات اللحظي - MENTRA ERP</p>
                </div>
            </div>

            <div class="flex items-center gap-3 bg-white p-3 rounded-[2.5rem] shadow-inner border border-slate-100">
                <div class="flex items-center gap-3 px-4">
                    <input type="date" id="date-from" class="bg-transparent text-xs font-black text-slate-700 outline-none">
                    <span class="text-slate-300">|</span>
                    <input type="date" id="date-to" class="bg-transparent text-xs font-black text-slate-700 outline-none">
                </div>
                <button id="refresh-btn" class="bg-emerald-500 hover:bg-slate-900 text-white w-12 h-12 rounded-2xl transition-all shadow-lg active:scale-95">
                    <i class="fas fa-sync-alt" id="refresh-icon"></i>
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div class="bg-white p-8 rounded-[3.5rem] border border-slate-50 shadow-xl relative overflow-hidden group">
                <div class="relative z-10">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي المبيعات</p>
                    <h4 id="stat-sales" class="text-3xl font-black text-slate-900 mt-2 font-mono">0.00</h4>
                    <div id="sales-progress" class="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div class="h-full bg-emerald-500 transition-all duration-1000" style="width: 0%"></div>
                    </div>
                </div>
            </div>

            <div class="bg-white p-8 rounded-[3.5rem] border border-slate-50 shadow-xl relative overflow-hidden group">
                <div class="relative z-10">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي المشتريات</p>
                    <h4 id="stat-purchases" class="text-3xl font-black text-rose-600 mt-2 font-mono">0.00</h4>
                    <div id="purchases-progress" class="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div class="h-full bg-rose-500 transition-all duration-1000" style="width: 0%"></div>
                    </div>
                </div>
            </div>

            <div class="bg-white p-8 rounded-[3.5rem] border border-slate-50 shadow-xl group">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">قيمة المخزن حالياً</p>
                <h4 id="stat-stock-value" class="text-3xl font-black text-slate-900 mt-2 font-mono">0.00</h4>
                <p class="text-[9px] text-amber-500 font-bold mt-2 italic">بناءً على تكلفة الشراء</p>
            </div>

            <div class="bg-slate-900 p-8 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden">
                <p class="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">صافي الربح التقديري</p>
                <h4 id="stat-profit" class="text-4xl font-black font-mono text-emerald-400">0.00</h4>
                <div id="profit-indicator" class="mt-4 text-[10px] font-bold py-1 px-3 rounded-full bg-white/10 inline-block">--</div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 bg-white rounded-[4rem] p-10 shadow-xl border border-slate-50">
                <div class="flex justify-between items-center mb-8">
                    <h5 class="text-xl font-black text-slate-800 italic">⚠️ تنبيهات المخزون الحرجة</h5>
                    <span class="bg-rose-50 text-rose-500 text-[10px] px-4 py-1 rounded-full font-black uppercase">تحت الحد الأدنى</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-right border-separate border-spacing-y-3">
                        <tbody id="low-stock-list"></tbody>
                    </table>
                </div>
            </div>

            <div class="bg-gradient-to-br from-indigo-600 to-violet-800 p-10 rounded-[4rem] text-white shadow-2xl flex flex-col justify-center">
                <h6 class="text-[10px] font-black opacity-60 uppercase tracking-widest mb-8 text-center">نشاط النظام العام</h6>
                <div class="space-y-4">
                    <div class="flex justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                        <span class="text-xs font-bold">عدد الفواتير</span>
                        <span id="count-invoices" class="font-black font-mono">0</span>
                    </div>
                    <div class="flex justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                        <span class="text-xs font-bold">عدد المنتجات</span>
                        <span id="count-products" class="font-black font-mono">0</span>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    displayArea.innerHTML = dashboardHTML;

    // --- المحرك الذكي المحدث ---
    window.loadDashboardStats = async () => {
        const from = document.getElementById('date-from').value;
        const to = document.getElementById('date-to').value;
        const icon = document.getElementById('refresh-icon');
        icon.classList.add('fa-spin');

        try {
            const [invoices, products] = await Promise.all([
                db.table('invoices').toArray(),
                db.table('products').toArray()
            ]);

            let totals = {
                sales: 0,
                purchases: 0,
                stock: 0,
                invCount: 0
            };

            invoices.forEach(inv => {
                const invDate = String(inv.date || "").substring(0, 10);
                
                // الفلترة بالتاريخ
                if (invDate >= from && invDate <= to) {
                    const amount = parseFloat(inv.total) || 0;
                    const type = String(inv.type || "").toUpperCase();
                    
                    // تحسين المنطق: التحقق من وجود كلمة PURCHASE في أي مكان في النوع
                    if (type.includes('PURCHASE') || type.includes('شراء') || type === 'BUY') {
                        totals.purchases += amount;
                    } 
                    // التحقق من البيع
                    else if (type.includes('SALE') || type.includes('بيع') || type === 'PAID' || type === 'PENDING') {
                        totals.sales += amount;
                    }
                    totals.invCount++;
                }
            });

            products.forEach(p => {
                const qty = parseFloat(p.stock_qty) || 0;
                const cost = parseFloat(p.cost) || 0;
                totals.stock += (qty * cost);
            });

            // تحديث الأرقام مع الأنيميشن
            updateUI(totals, products);

        } catch (err) {
            console.error("Dashboard Logic Error:", err);
        } finally {
            setTimeout(() => icon.classList.remove('fa-spin'), 600);
        }
    };

    function updateUI(data, products) {
        // الأرقام الرئيسية
        animateText('stat-sales', data.sales);
        animateText('stat-purchases', data.purchases);
        animateText('stat-stock-value', data.stock);
        
        const profit = data.sales - data.purchases;
        animateText('stat-profit', profit);

        // المؤشرات المرئية
        const salesBar = document.querySelector('#sales-progress div');
        const purchaseBar = document.querySelector('#purchases-progress div');
        
        // حساب النسبة المئوية للمقارنة بينهما
        const totalVolume = data.sales + data.purchases || 1;
        salesBar.style.width = `${(data.sales / totalVolume) * 100}%`;
        purchaseBar.style.width = `${(data.purchases / totalVolume) * 100}%`;

        // مؤشر الربح
        const indicator = document.getElementById('profit-indicator');
        if (profit > 0) {
            indicator.innerText = "أداء إيجابي ممتاز 📈";
            indicator.className = "mt-4 text-[10px] font-bold py-1 px-3 rounded-full bg-emerald-500/20 text-emerald-400 inline-block";
        } else if (profit < 0) {
            indicator.innerText = "تنبيه: عجز مالي 📉";
            indicator.className = "mt-4 text-[10px] font-black py-1 px-3 rounded-full bg-rose-500/20 text-rose-400 inline-block";
        }

        document.getElementById('count-invoices').innerText = data.invCount;
        document.getElementById('count-products').innerText = products.length;

        // النواقص
        const lowStock = products.filter(p => (parseFloat(p.stock_qty) || 0) < 5);
        renderLowStock(lowStock);
    }

    function animateText(id, val) {
        const el = document.getElementById(id);
        if (!el) return;
        const finalVal = val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        el.innerText = finalVal;
    }

    function renderLowStock(items) {
        const list = document.getElementById('low-stock-list');
        if (!items.length) {
            list.innerHTML = `<tr><td class="py-10 text-center text-slate-300 italic font-bold">كل الأصناف متوفرة بمخزون آمن ✅</td></tr>`;
            return;
        }

        list.innerHTML = items.map(item => `
            <tr class="bg-slate-50/50 hover:bg-white transition-all rounded-2xl group">
                <td class="p-4 font-black text-slate-700 text-sm">${item.name_ar}</td>
                <td class="p-4 text-center">
                    <span class="text-rose-600 font-mono font-black bg-rose-50 px-3 py-1 rounded-lg">
                        ${item.stock_qty} <small class="text-[8px]">متبقي</small>
                    </span>
                </td>
                <td class="p-4 text-left">
                    <i class="fas fa-exclamation-triangle text-rose-300 group-hover:text-rose-500 transition-colors"></i>
                </td>
            </tr>
        `).join('');
    }

    // تهيئة التواريخ
    const d = new Date();
    document.getElementById('date-from').value = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
    document.getElementById('date-to').value = d.toISOString().split('T')[0];

    document.getElementById('refresh-btn').onclick = window.loadDashboardStats;
    window.loadDashboardStats();

})();