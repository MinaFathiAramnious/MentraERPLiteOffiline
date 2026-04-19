/**
 * MENTRA ERP - Smart Sales & Inventory Master (v7.2)
 * مدمج بالكامل: إدارة المبيعات + مزامنة المخزن + حذف وتعديل ذكي
 */

(function() {
    const displayArea = document.getElementById('main-content-display');
    const state = {
        allSales: [],
        itemsPerPage: 6,
        currentPage: 0
    };

    // متغيرات الحالة للعمليات الداخلية
    let activeInvoiceId = null;
    let editingItems = [];

    // --- 1. بناء هيكل الصفحة (UI) ---
    displayArea.innerHTML = `
    <div class="p-6 md:p-10 space-y-8 animate-fade-in pb-32 text-right" dir="rtl">
        <div id="salesStats" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"></div>

        <div class="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-wrap gap-6 items-center">
            <div class="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl flex-1 min-w-[320px]">
                <input type="date" id="report-start" class="bg-transparent text-sm font-black outline-none p-2 text-slate-600">
                <span class="text-slate-400 font-black">←</span>
                <input type="date" id="report-end" class="bg-transparent text-sm font-black outline-none p-2 text-slate-600">
                <button onclick="applyFilters()" class="bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black hover:scale-105 transition-all">تطبيق</button>
            </div>
            
            <div class="relative w-full md:w-80">
                <i class="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input type="text" id="searchInvoice" onkeyup="handleSearch(this.value)" 
                       placeholder="رقم الفاتورة أو العميل..." 
                       class="w-full bg-slate-100 p-4 pr-12 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 font-bold text-sm transition-all">
            </div>
        </div>

        <div id="sales-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"></div>

        <div class="flex justify-center items-center gap-6 mt-12">
            <button onclick="changePage(-1)" id="prevBtn" class="p-5 bg-white rounded-2xl shadow-md hover:bg-slate-50 disabled:opacity-20 transition-all"><i class="fas fa-chevron-right"></i></button>
            <span id="pageNumber" class="font-black text-slate-400 bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100">1</span>
            <button onclick="changePage(1)" id="nextBtn" class="p-5 bg-white rounded-2xl shadow-md hover:bg-slate-50 disabled:opacity-20 transition-all"><i class="fas fa-chevron-left"></i></button>
        </div>
    </div>

    <div id="detailsModal" class="hidden fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-3xl rounded-[3rem] p-10 shadow-2xl overflow-y-auto max-h-[92vh] animate-pop-in relative text-right" dir="rtl">
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h3 class="text-2xl font-black text-slate-900">تفاصيل فاتورة <span id="view-inv-no" class="text-blue-600"></span></h3>
                    <p id="view-inv-date" class="text-xs font-bold text-slate-400 mt-1"></p>
                </div>
                <button onclick="closeDetailsModal()" class="w-12 h-12 bg-slate-100 rounded-full text-slate-400 hover:text-rose-500 hover:rotate-90 transition-all"><i class="fas fa-times text-xl"></i></button>
            </div>
            
            <div class="space-y-8">
                <div class="overflow-x-auto rounded-3xl border border-slate-100">
                    <table class="w-full text-right">
                        <thead>
                            <tr class="bg-slate-50 text-[10px] font-black text-slate-500 border-b border-slate-100">
                                <th class="p-5">الصنف</th>
                                <th class="p-5 text-center">الكمية</th>
                                <th class="p-5 text-center">السعر</th>
                                <th class="p-5 text-left font-sans">Total</th>
                            </tr>
                        </thead>
                        <tbody id="invoice-items-list" class="divide-y divide-slate-50"></tbody>
                    </table>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-slate-50 p-6 rounded-3xl space-y-4">
                        <div class="flex justify-between items-center">
                            <span class="text-xs font-black text-slate-500">حالة التحصيل:</span>
                            <select id="view-inv-status" class="bg-white border-none shadow-sm p-2 rounded-xl font-bold text-xs outline-none">
                                <option value="paid">مدفوعة بالكامل ✅</option>
                                <option value="pending">آجلة ⏳</option>
                            </select>
                        </div>
                    </div>
                    <div class="bg-slate-900 p-8 rounded-3xl text-left">
                        <p class="text-[10px] font-black text-slate-500 mb-2 uppercase">Net Total</p>
                        <h2 id="view-inv-total" class="text-4xl font-black text-white font-sans">0.00</h2>
                    </div>
                </div>

                <div class="flex gap-4 pt-4">
                    <button onclick="saveSmartEdit()" class="flex-[2] bg-emerald-600 text-white p-6 rounded-[2rem] font-black shadow-xl hover:bg-emerald-700 transition-all">حفظ التعديلات</button>
                    <button onclick="deleteInvoice()" class="flex-1 bg-rose-50 text-rose-500 p-6 rounded-[2rem] font-black hover:bg-rose-500 hover:text-white transition-all">حذف الفاتورة</button>
                </div>
            </div>
        </div>
    </div>`;

    // --- 2. وظائف جلب وعرض البيانات ---

    window.loadSalesData = async () => {
        const data = await db.invoices.where('type').equalsIgnoreCase('sale').reverse().toArray();
        state.allSales = data;
        renderSales(data);
    };

    window.applyFilters = () => {
        const start = document.getElementById('report-start').value;
        const end = document.getElementById('report-end').value;
        let filtered = state.allSales;
        if (start && end) filtered = filtered.filter(inv => inv.date >= start && inv.date <= end);
        renderSales(filtered);
    };

    window.handleSearch = (val) => {
        const filtered = state.allSales.filter(inv => 
            inv.invoice_number.includes(val) || (inv.customer_vendor_name && inv.customer_vendor_name.includes(val))
        );
        renderSales(filtered);
    };

    window.renderSales = (data) => {
        const container = document.getElementById('sales-list');
        const start = state.currentPage * state.itemsPerPage;
        const paged = data.slice(start, start + state.itemsPerPage);

        container.innerHTML = paged.map(inv => `
            <div class="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50 hover:shadow-2xl transition-all cursor-pointer group" onclick="openDetails(${inv.id})">
                <div class="flex justify-between items-start mb-6 font-sans">
                    <span class="text-[10px] font-black text-slate-300">#${inv.invoice_number}</span>
                    <span class="px-4 py-1 rounded-xl text-[10px] font-black ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}">
                        ${inv.status === 'paid' ? 'مدفوعة' : 'آجلة'}
                    </span>
                </div>
                <div class="mb-8">
                    <p class="text-[10px] font-black text-slate-400">العميل</p>
                    <p class="font-bold text-slate-700">${inv.customer_vendor_name || 'عميل نقدي'}</p>
                </div>
                <div class="flex justify-between items-end pt-6 border-t border-slate-50 font-sans">
                    <div>
                        <p class="text-[10px] font-black text-slate-400 uppercase">${inv.date}</p>
                        <p class="text-2xl font-black text-slate-900">${Number(inv.total).toLocaleString()}</p>
                    </div>
                    <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center transition-all group-hover:bg-blue-600 group-hover:text-white">
                        <i class="fas fa-eye"></i>
                    </div>
                </div>
            </div>
        `).join('');

        updateStats(data);
        updatePagination(data.length);
    };

    // --- 3. وظائف التعديل الذكي (Smart Edit) ---

    window.openDetails = async (id) => {
        activeInvoiceId = id;
        const inv = await db.invoices.get(id);
        let items = await db.invoice_items.where('invoice_id').equals(id).toArray();

        // إصلاح الأسماء إذا كانت مفقودة
        for (let item of items) {
            if (!item.product_name) {
                const p = await db.products.get(item.product_id);
                item.product_name = p ? p.name_ar : "صنف مجهول";
            }
        }

        editingItems = JSON.parse(JSON.stringify(items));
        document.getElementById('view-inv-no').innerText = inv.invoice_number;
        document.getElementById('view-inv-date').innerText = `بتاريخ: ${inv.date}`;
        document.getElementById('view-inv-total').innerText = Number(inv.total).toLocaleString();
        document.getElementById('view-inv-status').value = inv.status;

        renderModalItems();
        document.getElementById('detailsModal').classList.remove('hidden');
    };

    window.renderModalItems = () => {
        document.getElementById('invoice-items-list').innerHTML = editingItems.map((item, idx) => `
            <tr>
                <td class="p-5 font-bold text-slate-700 text-sm">${item.product_name}</td>
                <td class="p-5 text-center">
                    <input type="number" onchange="updateRow(${idx}, this.value)" value="${item.qty}" 
                           class="w-20 p-2 bg-slate-50 border-none rounded-xl text-center font-black text-xs outline-none focus:ring-2 focus:ring-blue-500">
                </td>
                <td class="p-5 text-center font-bold text-slate-400 font-sans">${item.price}</td>
                <td class="p-5 text-left font-black text-blue-600 font-sans">${(item.qty * item.price).toLocaleString()}</td>
            </tr>
        `).join('');
    };

    window.updateRow = (idx, newQty) => {
        editingItems[idx].qty = parseFloat(newQty) || 0;
        const total = editingItems.reduce((s, i) => s + (i.qty * i.price), 0);
        document.getElementById('view-inv-total').innerText = total.toLocaleString();
    };

window.saveSmartEdit = async () => {
    try {
        // 1. التحقق المسبق قبل بدء أي عملية تحديث
        for (let item of editingItems) {
            const original = await db.invoice_items.get(item.id);
            const diff = item.qty - original.qty; // الفرق المطلوب سحبه من المخزن
            const prod = await db.products.get(item.product_id);

            // إذا كان التعديل بالزيادة، نتحقق من توفر الكمية
            if (prod && diff > 0 && prod.stock_qty < diff) {
                alert(`⚠️ عذراً! الكمية المتاحة من [${item.product_name}] هي (${prod.stock_qty}) فقط. لا يمكنك زيادة الفاتورة بمقدار ${diff}`);
                return; // إيقاف العملية تماماً
            }
        }

        // 2. إذا اجتاز التحقق، نبدأ التحديث الفعلي
        await db.transaction('rw', [db.invoices, db.invoice_items, db.products], async () => {
            let finalTotal = 0;
            for (let item of editingItems) {
                const original = await db.invoice_items.get(item.id);
                const diff = item.qty - original.qty;
                const prod = await db.products.get(item.product_id);
                
                if (prod) {
                    await db.products.update(prod.id, { 
                        stock_qty: Number(prod.stock_qty) - diff 
                    });
                }

                await db.invoice_items.update(item.id, { 
                    qty: item.qty, 
                    total_item: item.qty * item.price 
                });
                finalTotal += (item.qty * item.price);
            }

            await db.invoices.update(activeInvoiceId, { 
                total: finalTotal, 
                status: document.getElementById('view-inv-status').value 
            });
        });

        alert("✅ تم التحقق والتعديل وتحديث المخزن بنجاح!");
        closeDetailsModal();
        loadSalesData();

    } catch (e) { 
        console.error(e);
        alert("خطأ في العملية: " + e.message); 
    }
};

    // --- 4. وظيفة الحذف الذكي (Smart Delete) ---

    window.deleteInvoice = async () => {
        if (!activeInvoiceId) return;
        if (!confirm("⚠️ هل تريد حذف الفاتورة؟ سيتم إعادة الكميات للمخزن تلقائياً.")) return;

        try {
            await db.transaction('rw', [db.invoices, db.invoice_items, db.products], async () => {
                const items = await db.invoice_items.where('invoice_id').equals(activeInvoiceId).toArray();
                // استرجاع المخزن
                for (const item of items) {
                    const p = await db.products.get(item.product_id);
                    if (p) await db.products.update(p.id, { stock_qty: Number(p.stock_qty) + Number(item.qty) });
                }
                // مسح البيانات
                await db.invoice_items.where('invoice_id').equals(activeInvoiceId).delete();
                await db.invoices.delete(activeInvoiceId);
            });
            alert("🗑️ تم الحذف وإعادة المخزون.");
            closeDetailsModal();
            loadSalesData();
        } catch (e) { alert("خطأ بالحذف: " + e); }
    };

    // --- 5. أدوات مساعدة (Helpers) ---

    function updateStats(data) {
        const total = data.reduce((s, i) => s + Number(i.total), 0);
        const paid = data.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0);
        document.getElementById('salesStats').innerHTML = `
            <div class="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm text-center">
                <p class="text-[10px] font-black text-slate-400 mb-2">إجمالي المبيعات</p>
                <p class="text-2xl font-black text-blue-600 font-sans">${total.toLocaleString()}</p>
            </div>
            <div class="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm text-center">
                <p class="text-[10px] font-black text-slate-400 mb-2">المحصل</p>
                <p class="text-2xl font-black text-emerald-500 font-sans">${paid.toLocaleString()}</p>
            </div>
            <div class="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm text-center">
                <p class="text-[10px] font-black text-slate-400 mb-2">الديون</p>
                <p class="text-2xl font-black text-rose-500 font-sans">${(total-paid).toLocaleString()}</p>
            </div>
            <div class="bg-slate-900 p-6 rounded-3xl shadow-xl text-center">
                <p class="text-[10px] font-black text-slate-500 mb-2">العمليات</p>
                <p class="text-2xl font-black text-white font-sans">${data.length}</p>
            </div>
        `;
    }

    window.closeDetailsModal = () => document.getElementById('detailsModal').classList.add('hidden');
    window.changePage = (dir) => { state.currentPage += dir; applyFilters(); };
    function updatePagination(len) {
        document.getElementById('pageNumber').innerText = state.currentPage + 1;
        document.getElementById('prevBtn').disabled = state.currentPage === 0;
        document.getElementById('nextBtn').disabled = (state.currentPage + 1) * state.itemsPerPage >= len;
    }

    loadSalesData();
})();