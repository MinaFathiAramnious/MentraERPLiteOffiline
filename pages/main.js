/**
 * MENTRA ERP - Ultra Dashboard v6.0 (Mobile Optimized & Intelligence)
 * التعديلات: دعم مثالي للهواتف (Android/iOS)، أنيميشن للأرقام، وتحسين محرك البحث المالي
 */

(function() {
    const displayArea = document.getElementById('main-content-display');

    const dashboardHTML = `
    <div class="animate-fade-in space-y-6 md:space-y-8 pb-16 px-2 md:px-4" style="direction: rtl; text-align: right; -webkit-tap-highlight-color: transparent;">
        
        <!-- الهيدر وفلاتر التاريخ -->
        <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-5 bg-white/70 backdrop-blur-2xl p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white shadow-xl shadow-slate-200/50">
            <div class="flex items-center gap-4 md:gap-6">
                <div class="w-12 h-12 md:w-16 md:h-16 bg-slate-900 text-white rounded-xl md:rounded-[2rem] flex items-center justify-center text-lg md:text-2xl shadow-lg shrink-0">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div>
                    <h2 class="text-xl md:text-3xl font-black text-slate-900 tracking-tighter italic leading-tight">الرادار المالي الذكي</h2>
                    <p class="text-[9px] md:text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-1">تحليل البيانات اللحظي</p>
                </div>
            </div>

            <!-- محدد التاريخ المخصص للموبايل والديسكتوب -->
            <div class="flex items-center justify-between xl:justify-end gap-2 bg-white p-2 md:p-3 rounded-2xl md:rounded-[2.5rem] shadow-inner border border-slate-100 w-full xl:w-auto overflow-x-auto">
                <div class="flex items-center gap-2 md:gap-3 px-2 md:px-4 min-w-max">
                    <div class="flex flex-col">
                        <span class="text-[8px] text-slate-400 font-bold mb-0.5 mr-1">من تاريخ</span>
                        <input type="date" id="date-from" class="bg-transparent text-xs font-black text-slate-700 outline-none w-[110px] md:w-auto">
                    </div>
                    <span class="text-slate-200 text-xl font-light">|</span>
                    <div class="flex flex-col">
                        <span class="text-[8px] text-slate-400 font-bold mb-0.5 mr-1">إلى تاريخ</span>
                        <input type="date" id="date-to" class="bg-transparent text-xs font-black text-slate-700 outline-none w-[110px] md:w-auto">
                    </div>
                </div>
                <button id="refresh-btn" class="bg-emerald-500 hover:bg-slate-900 text-white w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl transition-all shadow-md active:scale-90 shrink-0 flex items-center justify-center">
                    <i class="fas fa-sync-alt" id="refresh-icon"></i>
                </button>
            </div>
        </div>

        <!-- الكروت الإحصائية -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            
            <div class="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] border border-slate-50 shadow-lg md:shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-transform">
                <div class="relative z-10">
                    <div class="flex justify-between items-start mb-2">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي المبيعات</p>
                        <i class="fas fa-arrow-trend-up text-emerald-500 opacity-50"></i>
                    </div>
                    <h4 id="stat-sales" class="text-2xl md:text-3xl font-black text-slate-900 mt-1 font-mono">0.00</h4>
                    <div id="sales-progress" class="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div class="h-full bg-emerald-500 transition-all duration-1000" style="width: 0%"></div>
                    </div>
                </div>
            </div>

            <div class="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] border border-slate-50 shadow-lg md:shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-transform">
                <div class="relative z-10">
                    <div class="flex justify-between items-start mb-2">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي المشتريات</p>
                        <i class="fas fa-shopping-cart text-rose-500 opacity-50"></i>
                    </div>
                    <h4 id="stat-purchases" class="text-2xl md:text-3xl font-black text-rose-600 mt-1 font-mono">0.00</h4>
                    <div id="purchases-progress" class="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div class="h-full bg-rose-500 transition-all duration-1000" style="width: 0%"></div>
                    </div>
                </div>
            </div>

            <div class="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] border border-slate-50 shadow-lg md:shadow-xl hover:-translate-y-1 transition-transform">
                <div class="flex justify-between items-start mb-2">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">قيمة المخزن حالياً</p>
                    <i class="fas fa-boxes-stacked text-amber-500 opacity-50"></i>
                </div>
                <h4 id="stat-stock-value" class="text-2xl md:text-3xl font-black text-slate-900 mt-1 font-mono">0.00</h4>
                <p class="text-[9px] text-amber-500 font-bold mt-2 md:mt-3 italic bg-amber-50 inline-block px-2 py-0.5 rounded-lg">بناءً على تكلفة الشراء</p>
            </div>

            <div class="bg-slate-900 p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] shadow-xl md:shadow-2xl text-white relative overflow-hidden hover:-translate-y-1 transition-transform">
                <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                <p class="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 relative z-10">صافي الربح التقديري</p>
                <h4 id="stat-profit" class="text-3xl md:text-4xl font-black font-mono text-emerald-400 relative z-10">0.00</h4>
                <div id="profit-indicator" class="mt-3 md:mt-4 text-[10px] font-bold py-1 px-3 rounded-full bg-white/10 inline-block relative z-10 border border-white/5">--</div>
            </div>
        </div>

        <!-- القوائم السفلية -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            
            <!-- جدول النواقص -->
            <div class="lg:col-span-2 bg-white rounded-[2rem] md:rounded-[4rem] p-5 md:p-10 shadow-lg md:shadow-xl border border-slate-50">
                <div class="flex justify-between items-center mb-6 md:mb-8">
                    <h5 class="text-lg md:text-xl font-black text-slate-800 italic flex items-center gap-2">
                        <i class="fas fa-exclamation-circle text-rose-500 text-sm"></i> تنبيهات النواقص
                    </h5>
                    <span class="bg-rose-50 text-rose-500 text-[9px] md:text-[10px] px-3 md:px-4 py-1 rounded-full font-black uppercase border border-rose-100">تحت الحد الأدنى</span>
                </div>
                
                <div class="overflow-x-auto pb-2 -mx-5 px-5 md:mx-0 md:px-0">
                    <table class="w-full text-right border-separate border-spacing-y-2 md:border-spacing-y-3 min-w-[300px]">
                        <tbody id="low-stock-list"></tbody>
                    </table>
                </div>
            </div>

            <!-- إحصائيات النظام -->
            <div class="bg-gradient-to-br from-indigo-600 to-violet-800 p-6 md:p-10 rounded-[2rem] md:rounded-[4rem] text-white shadow-xl flex flex-col justify-center relative overflow-hidden">
                <div class="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                <h6 class="text-[10px] md:text-xs font-black opacity-70 uppercase tracking-widest mb-6 md:mb-8 text-center relative z-10">نشاط النظام العام</h6>
                
                <div class="space-y-3 md:space-y-4 relative z-10">
                    <div class="flex justify-between items-center p-4 bg-white/10 rounded-xl md:rounded-2xl backdrop-blur-md border border-white/10">
                        <div class="flex items-center gap-3">
                            <i class="fas fa-file-invoice opacity-50"></i>
                            <span class="text-xs font-bold">عدد الفواتير</span>
                        </div>
                        <span id="count-invoices" class="font-black font-mono text-lg text-blue-200">0</span>
                    </div>
                    
                    <div class="flex justify-between items-center p-4 bg-white/10 rounded-xl md:rounded-2xl backdrop-blur-md border border-white/10">
                        <div class="flex items-center gap-3">
                            <i class="fas fa-box-open opacity-50"></i>
                            <span class="text-xs font-bold">عدد المنتجات</span>
                        </div>
                        <span id="count-products" class="font-black font-mono text-lg text-purple-200">0</span>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    displayArea.innerHTML = dashboardHTML;

    // --- محرك الأنيميشن للأرقام (Premium Feature) ---
    function animateValue(id, start, end, duration) {
        const obj = document.getElementById(id);
        if (!obj) return;
        
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // دالة تسهيل الحركة (Ease Out)
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentVal = (progress * (end - start) + start);
            
            obj.innerHTML = currentVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
        };
        window.requestAnimationFrame(step);
    }

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

            let totals = { sales: 0, purchases: 0, stock: 0, invCount: 0 };

            invoices.forEach(inv => {
                const invDate = String(inv.date || "").substring(0, 10);
                
                if (invDate >= from && invDate <= to) {
                    const amount = parseFloat(inv.total) || 0;
                    const type = String(inv.type || "").toUpperCase();
                    
                    if (type.includes('PURCHASE') || type.includes('شراء') || type === 'BUY') {
                        totals.purchases += amount;
                    } 
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

            updateUI(totals, products);

        } catch (err) {
            console.error("Dashboard Logic Error:", err);
        } finally {
            setTimeout(() => icon.classList.remove('fa-spin'), 600);
        }
    };

    function updateUI(data, products) {
        // تشغيل الأنيميشن للأرقام المالية (مدة 1 ثانية)
        animateValue('stat-sales', 0, data.sales, 1000);
        animateValue('stat-purchases', 0, data.purchases, 1000);
        animateValue('stat-stock-value', 0, data.stock, 1000);
        
        const profit = data.sales - data.purchases;
        
        // تلوين الربح إذا كان بالسالب
        const profitEl = document.getElementById('stat-profit');
        if(profitEl) {
            profitEl.className = profit < 0 
                ? "text-3xl md:text-4xl font-black font-mono text-rose-400 relative z-10" 
                : "text-3xl md:text-4xl font-black font-mono text-emerald-400 relative z-10";
        }
        animateValue('stat-profit', 0, profit, 1000);

        // المؤشرات المرئية للتقدم
        setTimeout(() => {
            const salesBar = document.querySelector('#sales-progress div');
            const purchaseBar = document.querySelector('#purchases-progress div');
            const totalVolume = data.sales + data.purchases || 1; // تجنب القسمة على صفر
            
            if(salesBar) salesBar.style.width = `${(data.sales / totalVolume) * 100}%`;
            if(purchaseBar) purchaseBar.style.width = `${(data.purchases / totalVolume) * 100}%`;
        }, 100);

        // مؤشر الربح (النصي)
        const indicator = document.getElementById('profit-indicator');
        if (profit > 0) {
            indicator.innerText = "أداء إيجابي ممتاز 📈";
            indicator.className = "mt-3 md:mt-4 text-[10px] font-bold py-1 px-3 rounded-full bg-emerald-500/20 text-emerald-400 inline-block border border-emerald-500/10 relative z-10";
        } else if (profit < 0) {
            indicator.innerText = "تنبيه: عجز مالي 📉";
            indicator.className = "mt-3 md:mt-4 text-[10px] font-black py-1 px-3 rounded-full bg-rose-500/20 text-rose-400 inline-block border border-rose-500/10 relative z-10";
        } else {
            indicator.innerText = "نقطة التعادل ⚖️";
            indicator.className = "mt-3 md:mt-4 text-[10px] font-bold py-1 px-3 rounded-full bg-white/10 text-slate-300 inline-block relative z-10";
        }

        // إحصائيات النظام بدون كسور عشرية
        document.getElementById('count-invoices').innerText = data.invCount.toLocaleString('en-US');
        document.getElementById('count-products').innerText = products.length.toLocaleString('en-US');

        // النواقص (الكمية أقل من 5)
        const lowStock = products.filter(p => (parseFloat(p.stock_qty) || 0) <= 5);
        renderLowStock(lowStock);
    }

    function renderLowStock(items) {
        const list = document.getElementById('low-stock-list');
        if (!items.length) {
            list.innerHTML = `<tr><td class="py-10 text-center text-slate-400 text-xs md:text-sm italic font-bold">كل الأصناف متوفرة بمخزون آمن ✅</td></tr>`;
            return;
        }

        list.innerHTML = items.map(item => `
            <tr class="bg-slate-50/70 hover:bg-slate-100 transition-all rounded-xl md:rounded-2xl group">
                <td class="p-3 md:p-4 font-black text-slate-700 text-xs md:text-sm rounded-r-xl md:rounded-r-2xl truncate max-w-[120px] md:max-w-none">${item.name_ar || item.name || 'منتج غير معروف'}</td>
                <td class="p-3 md:p-4 text-center">
                    <span class="text-rose-600 font-mono font-black bg-rose-100/50 px-2 md:px-3 py-1 rounded-lg border border-rose-100">
                        ${item.stock_qty || 0} <small class="text-[7px] md:text-[8px]">متبقي</small>
                    </span>
                </td>
                <td class="p-3 md:p-4 text-left rounded-l-xl md:rounded-l-2xl">
                    <i class="fas fa-exclamation-triangle text-rose-300 group-hover:text-rose-500 transition-colors animate-pulse"></i>
                </td>
            </tr>
        `).join('');
    }

    // تهيئة التواريخ لتكون من أول الشهر الحالي حتى اليوم
    const d = new Date();
    // ضبط صيغة التاريخ لتعمل في جميع المتصفحات بشكل صحيح YYYY-MM-DD
    const pad = n => n < 10 ? '0'+n : n;
    const firstDay = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
    const today = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    
    document.getElementById('date-from').value = firstDay;
    document.getElementById('date-to').value = today;

    // ربط الزر بتحديث البيانات
    document.getElementById('refresh-btn').onclick = window.loadDashboardStats;
    
    // التشغيل التلقائي عند فتح الصفحة
    window.loadDashboardStats();

})();