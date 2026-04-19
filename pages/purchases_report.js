/**
 * MENTRA ERP - Purchases Report Pro (v3.0)
 * الميزات: عرض تفاصيل المنتجات + التعديل الذكي لكل صنف + مزامنة المخزن
 */

(function() {
    const displayArea = document.getElementById('main-content-display');
    const state = { activeInvId: null, editingItems: [] };

    const reportHTML = `
    <div class="animate-fade-in space-y-8 pb-16 px-4 text-right" dir="rtl">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/60 backdrop-blur-2xl p-8 rounded-[3rem] border border-white shadow-2xl shadow-slate-200/50">
            <div class="flex items-center gap-6">
                <div class="w-16 h-16 bg-rose-600 text-white rounded-[2rem] flex items-center justify-center text-2xl shadow-xl">
                    <i class="fas fa-file-contract"></i>
                </div>
                <div>
                    <h2 class="text-3xl font-black text-slate-900 tracking-tighter italic">سجل المشتريات الذكي</h2>
                    <p class="text-[10px] text-rose-500 font-black uppercase tracking-widest mt-1">نظام إدارة الأصناف والمخزون</p>
                </div>
            </div>

            <div class="flex items-center gap-3 bg-white p-3 rounded-[2.5rem] shadow-inner border border-slate-100">
                <input type="date" id="rep-date-from" class="bg-transparent text-[10px] font-black text-slate-700 outline-none px-2">
                <input type="date" id="rep-date-to" class="bg-transparent text-[10px] font-black text-slate-700 outline-none px-2 border-r border-slate-100">
                <button id="run-report-btn" class="bg-slate-900 hover:bg-rose-600 text-white w-10 h-10 rounded-xl transition-all shadow-lg active:scale-90">
                    <i class="fas fa-sync-alt"></i>
                </button>
            </div>
        </div>

        <div class="bg-white rounded-[4rem] p-10 shadow-xl border border-slate-50 overflow-hidden">
             <div class="flex justify-between items-center mb-8 px-4">
                <h5 class="text-xl font-black text-slate-800 italic">فواتير المشتريات</h5>
                <input type="text" id="p-inv-search" placeholder="ابحث برقم الفاتورة..." class="bg-slate-50 px-6 py-3 rounded-2xl text-xs font-bold outline-none border-none w-64 focus:ring-2 focus:ring-rose-500 transition-all">
            </div>
            
            <table class="w-full text-right border-separate border-spacing-y-4">
                <thead>
                    <tr class="text-[10px] font-black text-slate-400 uppercase italic">
                        <th class="pb-4 pr-6">رقم الفاتورة</th>
                        <th class="pb-4">التاريخ</th>
                        <th class="pb-4 text-center">الإجمالي</th>
                        <th class="pb-4 text-center">الحالة</th>
                        <th class="pb-4 text-left pl-6">الإجراءات</th>
                    </tr>
                </thead>
                <tbody id="purchases-report-list"></tbody>
            </table>
        </div>
    </div>

    <div id="edit-purchase-modal" class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] hidden flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-3xl rounded-[3.5rem] p-10 shadow-2xl animate-pop-in relative overflow-y-auto max-h-[90vh] text-right" dir="rtl">
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h3 class="text-2xl font-black text-slate-900 italic">تفاصيل فاتورة شراء</h3>
                    <p id="modal-inv-no" class="text-xs font-bold text-rose-500 mt-1"></p>
                </div>
                <button onclick="closeEditModal()" class="w-12 h-12 bg-slate-100 rounded-full text-slate-400 hover:rotate-90 transition-all"><i class="fas fa-times"></i></button>
            </div>

            <div class="space-y-6">
                <div class="rounded-3xl border border-slate-100 overflow-hidden">
                    <table class="w-full">
                        <thead class="bg-slate-50 text-[10px] font-black text-slate-500">
                            <tr>
                                <th class="p-5">الصنف</th>
                                <th class="p-5 text-center">الكمية المشراة</th>
                                <th class="p-5 text-center">سعر التكلفة</th>
                                <th class="p-5 text-left">الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody id="modal-items-body" class="divide-y divide-slate-50"></tbody>
                    </table>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-slate-50 p-6 rounded-3xl">
                         <p class="text-[10px] font-black text-slate-400 mb-2 uppercase">حالة الفاتورة</p>
                         <select id="modal-inv-status" class="w-full bg-white border-none p-3 rounded-xl font-bold text-sm shadow-sm outline-none">
                            <option value="paid">مدفوعة ✅</option>
                            <option value="pending">آجلة ⏳</option>
                         </select>
                    </div>
                    <div class="bg-slate-900 p-6 rounded-3xl text-left">
                        <p class="text-[10px] font-black text-slate-500 mb-1 uppercase">Grand Total</p>
                        <h2 id="modal-inv-total" class="text-4xl font-black text-white font-mono">0.00</h2>
                    </div>
                </div>

                <div class="flex gap-4">
                    <button onclick="saveSmartPurchaseEdit()" class="flex-[2] bg-emerald-600 text-white p-6 rounded-[2rem] font-black shadow-xl hover:bg-emerald-700 transition-all">حفظ وتحديث المخزن</button>
                    <button onclick="confirmDeletePurchase()" class="flex-1 bg-rose-50 text-rose-500 p-6 rounded-[2rem] font-black hover:bg-rose-500 hover:text-white transition-all">حذف الفاتورة</button>
                </div>
            </div>
        </div>
    </div>`;

    displayArea.innerHTML = reportHTML;

    // --- وظائف الجلب والعرض ---
    async function loadPurchases() {
        const from = document.getElementById('rep-date-from').value;
        const to = document.getElementById('rep-date-to').value;
        const search = document.getElementById('p-inv-search').value.toLowerCase();

        const data = await db.invoices.where('type').equalsIgnoreCase('PURCHASE').reverse().toArray();
        const filtered = data.filter(inv => {
            const d = inv.date.substring(0, 10);
            return (d >= from && d <= to) && inv.invoice_number.toLowerCase().includes(search);
        });

        document.getElementById('purchases-report-list').innerHTML = filtered.map(inv => `
            <tr class="bg-slate-50/50 hover:bg-white transition-all group cursor-pointer" onclick="openPurchaseDetails(${inv.id})">
                <td class="p-6 font-black text-slate-700">${inv.invoice_number}</td>
                <td class="p-6 text-xs font-bold text-slate-500">${inv.date.substring(0, 10)}</td>
                <td class="p-6 text-center font-black font-mono text-slate-900">${parseFloat(inv.total).toLocaleString()}</td>
                <td class="p-6 text-center">
                    <span class="px-3 py-1 rounded-lg text-[9px] font-black ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}">
                        ${inv.status === 'paid' ? 'مدفوعة' : 'آجلة'}
                    </span>
                </td>
                <td class="p-6 text-left">
                    <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-300 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">
                        <i class="fas fa-eye text-xs"></i>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // --- نظام التعديل الذكي ---
    window.openPurchaseDetails = async (id) => {
        state.activeInvId = id;
        const inv = await db.invoices.get(id);
        const items = await db.invoice_items.where('invoice_id').equals(id).toArray();
        
        // حفظ نسخة للتعديل
        state.editingItems = JSON.parse(JSON.stringify(items));

        document.getElementById('modal-inv-no').innerText = `# ${inv.invoice_number}`;
        document.getElementById('modal-inv-total').innerText = parseFloat(inv.total).toLocaleString();
        document.getElementById('modal-inv-status').value = inv.status;

        renderModalItems();
        document.getElementById('edit-purchase-modal').classList.remove('hidden');
    };

    function renderModalItems() {
        document.getElementById('modal-items-body').innerHTML = state.editingItems.map((item, idx) => `
            <tr>
                <td class="p-5 font-bold text-slate-700 text-sm">${item.product_name || 'صنف مجهول'}</td>
                <td class="p-5 text-center">
                    <input type="number" value="${item.qty}" onchange="updatePurchaseQty(${idx}, this.value)" 
                           class="w-20 p-2 bg-slate-50 border-none rounded-xl text-center font-black text-xs focus:ring-2 focus:ring-rose-500 outline-none">
                </td>
                <td class="p-5 text-center font-bold text-slate-400 font-mono">${item.price}</td>
                <td class="p-5 text-left font-black text-emerald-600 font-mono">${(item.qty * item.price).toLocaleString()}</td>
            </tr>
        `).join('');
    }

    window.updatePurchaseQty = (idx, val) => {
        state.editingItems[idx].qty = parseFloat(val) || 0;
        const newTotal = state.editingItems.reduce((sum, i) => sum + (i.qty * i.price), 0);
        document.getElementById('modal-inv-total').innerText = newTotal.toLocaleString();
    };

    window.saveSmartPurchaseEdit = async () => {
        try {
            await db.transaction('rw', [db.invoices, db.invoice_items, db.products], async () => {
                let finalTotal = 0;
                for (let item of state.editingItems) {
                    const original = await db.invoice_items.get(item.id);
                    const diff = item.qty - original.qty; // الفرق في الكمية
                    
                    const prod = await db.products.get(item.product_id);
                    if (prod) {
                        // في المشتريات: زيادة الكمية تعني زيادة في المخزن
                        await db.products.update(prod.id, { stock_qty: (parseFloat(prod.stock_qty) || 0) + diff });
                    }
                    
                    await db.invoice_items.update(item.id, { qty: item.qty, total_item: item.qty * item.price });
                    finalTotal += (item.qty * item.price);
                }
                
                await db.invoices.update(state.activeInvId, { 
                    total: finalTotal, 
                    status: document.getElementById('modal-inv-status').value 
                });
            });
            alert("✅ تم تحديث المشتريات والمخزن بنجاح!");
            closeEditModal();
            loadPurchases();
        } catch (e) { alert("خطأ: " + e); }
    };

    window.confirmDeletePurchase = async () => {
        if(!confirm("⚠️ سيتم حذف الفاتورة وخصم كمياتها من المخزن. هل أنت متأكد؟")) return;
        
        try {
            await db.transaction('rw', [db.invoices, db.invoice_items, db.products, db.stock_movements], async () => {
                const inv = await db.invoices.get(state.activeInvId);
                const items = await db.invoice_items.where('invoice_id').equals(state.activeInvId).toArray();

                for (let item of items) {
                    const prod = await db.products.get(item.product_id);
                    if (prod) {
                        // عكس المشتريات: خصم الكمية من المخزن عند حذف الفاتورة
                        await db.products.update(prod.id, { stock_qty: Math.max(0, prod.stock_qty - item.qty) });
                    }
                }
                
                await db.invoice_items.where('invoice_id').equals(state.activeInvId).delete();
                await db.stock_movements.where('ref_id').equals(inv.invoice_number).delete();
                await db.invoices.delete(state.activeInvId);
            });
            alert("🗑️ تم حذف الفاتورة وتعديل المخزن.");
            closeEditModal();
            loadPurchases();
        } catch (e) { alert("خطأ: " + e); }
    };

    window.closeEditModal = () => document.getElementById('edit-purchase-modal').classList.add('hidden');

    // إعدادات البحث والتواريخ
    const d = new Date();
    document.getElementById('rep-date-from').value = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
    document.getElementById('rep-date-to').value = d.toISOString().split('T')[0];
    document.getElementById('run-report-btn').onclick = loadPurchases;
    document.getElementById('p-inv-search').oninput = loadPurchases;

    loadPurchases();
})();