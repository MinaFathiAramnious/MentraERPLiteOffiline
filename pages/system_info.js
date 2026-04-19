(function() {
    const displayArea = document.getElementById('main-content-display');

    const systemInfoHTML = `
    <div class="animate-fade-in space-y-8 pb-16 px-4" style="direction: rtl;">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
            <div class="relative z-10">
                <h2 class="text-3xl font-black tracking-tighter italic">مركز البيانات المحلي</h2>
                <p class="text-rose-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Excel Import/Export & Local Backup</p>
            </div>
            <i class="fas fa-database absolute -bottom-10 -left-10 text-[12rem] opacity-5"></i>
        </div>

        <div id="import-progress-container" class="hidden bg-white p-8 rounded-[2.5rem] shadow-xl border border-blue-100 animate-pulse">
            <div class="flex justify-between mb-4">
                <span id="progress-status" class="text-xs font-black text-blue-600 uppercase">جاري المعالجة...</span>
                <span id="progress-percent" class="text-xs font-black text-blue-600">0%</span>
            </div>
            <div class="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                <div id="progress-bar" class="bg-blue-600 h-full w-0 transition-all duration-300"></div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${renderTableCard('المنتجات', 'products', 'fa-boxes', 'emerald')}
            ${renderTableCard('الفواتير', 'invoices', 'fa-file-invoice', 'blue')}
            ${renderTableCard('دليل الحسابات', 'accounts', 'fa-users-cog', 'purple')}
            ${renderTableCard('القيود اليومية', 'journal', 'fa-book', 'rose')}
            ${renderTableCard('حركات المخزن', 'stock_movements', 'fa-exchange-alt', 'amber')}
            ${renderTableCard('عناصر الفواتير', 'invoice_items', 'fa-list-ol', 'indigo')}
        </div>



        <div class="bg-white rounded-[3.5rem] p-10 shadow-xl border border-slate-50">
            <h3 class="text-xl font-black text-slate-800 mb-8 flex items-center gap-4">
                <span class="w-2 h-8 bg-emerald-500 rounded-full"></span> أدوات نقل البيانات (Excel)
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button onclick="exportToExcel()" class="flex flex-col items-center p-8 bg-emerald-50 rounded-[2.5rem] hover:bg-emerald-600 hover:text-white transition-all group">
                    <i class="fas fa-file-download text-3xl mb-4 text-emerald-600 group-hover:animate-bounce"></i>
                    <span class="font-black text-xs uppercase italic">تصدير الكل إلى Excel</span>
                </button>
                
                <div class="relative flex flex-col items-center p-8 bg-blue-50 rounded-[2.5rem] hover:bg-blue-600 hover:text-white transition-all group cursor-pointer">
                    <i class="fas fa-upload text-3xl mb-4 text-blue-600 group-hover:scale-110 transition-transform"></i>
                    <span class="font-black text-xs uppercase italic">استيراد بيانات من Excel</span>
                    <input type="file" id="import-excel-file" accept=".xlsx, .xls" class="absolute inset-0 opacity-0 cursor-pointer" onchange="importFromExcel(event)">
                </div>

                <button onclick="refreshDBCounters()" class="flex flex-col items-center p-8 bg-slate-50 rounded-[2.5rem] hover:bg-slate-900 hover:text-white transition-all group">
                    <i class="fas fa-sync-alt text-3xl mb-4 text-slate-400 group-hover:rotate-180 transition-transform duration-500"></i>
                    <span class="font-black text-xs uppercase italic">تحديث الأرقام</span>
                </button>
				
                <button onclick="clearAllSystemData()" class="flex flex-col items-center p-8 bg-rose-50 rounded-[2.5rem] hover:bg-rose-600 hover:text-white transition-all group">
                    <i class="fas fa-trash-sweep text-3xl mb-4 text-rose-600 group-hover:animate-bounce"></i>
                    <span class="font-black text-xs uppercase italic text-center">تصفير النظام بالكامل</span>
                </button>
            </div>
        </div>
    </div>`;

    function renderTableCard(title, dbName, icon, color) {
        return `
        <div class="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
            <div class="flex justify-between items-start relative z-10">
                <div class="w-12 h-12 bg-${color}-50 text-${color}-600 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="text-right">
                    <p class="text-[10px] font-black text-slate-400 uppercase italic mb-1">${dbName}</p>
                    <h4 class="text-xl font-black text-slate-800">${title}</h4>
                </div>
            </div>
            <div class="mt-8">
                <span id="cnt-${dbName}" class="text-3xl font-black font-mono text-slate-900">0</span>
                <span class="text-[10px] font-bold text-slate-400 mr-2 uppercase italic">Record</span>
            </div>
        </div>`;
    }

    displayArea.innerHTML = systemInfoHTML;

    // --- [1] Local Backup Logic (بدلاً من PHP) ---

    window.downloadJsonBackup = async () => {
        try {
            const tables = ['products', 'invoices', 'invoice_items', 'accounts', 'journal', 'journal_items', 'stock_movements'];
            const dbData = {};
            for (const table of tables) {
                dbData[table] = await db.table(table).toArray();
            }
            
            const blob = new Blob([JSON.stringify(dbData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `MENTRA_FULL_BACKUP_${new Date().toISOString().slice(0,10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            alert("حدث خطأ أثناء تصدير النسخة الاحتياطية");
        }
    };

    // --- [2] Excel Functions ---

    window.exportToExcel = async () => {
        const wb = XLSX.utils.book_new();
        const tables = ['products', 'invoices', 'invoice_items', 'accounts', 'journal', 'journal_items', 'stock_movements'];

        for (let table of tables) {
            const data = await db.table(table).toArray();
            const ws = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(wb, ws, table);
        }
        XLSX.writeFile(wb, `MENTRA_EXCEL_EXPORT_${new Date().getTime()}.xlsx`);
    };

    window.importFromExcel = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        const progressCont = document.getElementById('import-progress-container');
        const progressBar = document.getElementById('progress-bar');
        const progressStatus = document.getElementById('progress-status');

        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const totalSheets = workbook.SheetNames.length;
                
                if (!confirm("⚠️ تنبيه: سيتم تحديث البيانات الموجودة ببيانات الملف. استمرار؟")) return;

                progressCont.classList.remove('hidden');
                
                await db.transaction('rw', db.products, db.invoices, db.invoice_items, db.accounts, db.journal, db.journal_items, db.stock_movements, async () => {
                    for (let i = 0; i < totalSheets; i++) {
                        const sheetName = workbook.SheetNames[i];
                        if (db[sheetName]) {
                            progressStatus.innerText = `جاري استيراد: ${sheetName}`;
                            let jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

                            const cleanData = jsonData.map(item => {
                                for (let key in item) {
                                    if (key.includes('id') || key.includes('qty') || key.includes('price') || 
                                        key.includes('total') || key.includes('balance') || key.includes('cost') ||
                                        key.includes('debit') || key.includes('credit')) {
                                        item[key] = parseFloat(item[key]) || 0;
                                    }
                                }
                                return item;
                            });
                            await db[sheetName].bulkPut(cleanData);
                        }
                        progressBar.style.width = Math.round(((i + 1) / totalSheets) * 100) + '%';
                    }
                });

                progressStatus.innerText = "✅ نجح الاستيراد!";
                setTimeout(() => {
                    progressCont.classList.add('hidden');
                    refreshDBCounters();
                    alert("تم تحديث الجداول بنجاح!");
                }, 800);
            } catch (err) {
                alert("فشل الاستيراد: " + err.message);
                progressCont.classList.add('hidden');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    window.refreshDBCounters = async () => {
        const tables = ['products', 'invoices', 'invoice_items', 'accounts', 'journal', 'stock_movements'];
        for (let table of tables) {
            const count = await db.table(table).count();
            const el = document.getElementById(`cnt-${table}`);
            if (el) el.innerText = count.toLocaleString();
        }
    };

    window.clearAllSystemData = async () => {
        const confirm1 = confirm("⚠️ تحذير نهائي: أنت على وشك حذف كافة البيانات. هل أنت متأكد؟");
        if (!confirm1) return;

        const confirm2 = prompt("لتأكيد الحذف النهائي، اكتب كلمة (حذف) في المربع أدناه:");
        if (confirm2 !== 'حذف') return;

        const progressCont = document.getElementById('import-progress-container');
        const progressBar = document.getElementById('progress-bar');
        const progressStatus = document.getElementById('progress-status');
        
        try {
            progressCont.classList.remove('hidden');
            progressStatus.innerText = "جاري مسح قواعد البيانات...";
            progressBar.style.width = '30%';

            const tables = ['products', 'invoices', 'invoice_items', 'accounts', 'journal', 'journal_items', 'stock_movements'];
            
            await db.transaction('rw', tables, async () => {
                for (let table of tables) {
                    await db[table].clear();
                }
            });

            progressBar.style.width = '100%';
            progressStatus.innerText = "✅ تم تصفير النظام بنجاح!";
            
            setTimeout(() => {
                progressCont.classList.add('hidden');
                refreshDBCounters();
                alert("تم مسح كافة البيانات بنجاح.");
            }, 1000);
        } catch (err) {
            alert("فشل المسح: " + err.message);
            progressCont.classList.add('hidden');
        }
    };

    // Initial Execution
    refreshDBCounters();
})();