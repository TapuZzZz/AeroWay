// Theme management
const savedTheme = localStorage.getItem('dashboard-theme') || 'dark';
const root = document.documentElement;
const themeIcon = document.getElementById('themeIcon');
const themeText = document.getElementById('themeText');

function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
        themeIcon.textContent = '🌞';
        themeText.textContent = 'Light Mode';
    } else {
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Dark Mode';
    }
}

// Apply theme on page load
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(savedTheme);
});

function toggleTheme() {
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('dashboard-theme', newTheme);
    applyTheme(newTheme);
}

// Auto-refresh functionality
let isAutoRefresh = true;
let refreshInterval = setInterval(() => { location.reload(); }, 60000);

function toggleRefresh() {
    const statusBadge = document.getElementById('refreshStatus');
    const statusIcon = statusBadge.querySelector('.status-icon');
    const statusText = statusBadge.querySelector('.status-text');

    if (isAutoRefresh) {
        clearInterval(refreshInterval);
        statusIcon.textContent = '⏸️';
        statusText.textContent = 'Refresh Paused';
        statusBadge.classList.remove('status-active');
        statusBadge.classList.add('status-paused');
        isAutoRefresh = false;
    } else {
        refreshInterval = setInterval(() => { location.reload(); }, 60000);
        statusIcon.textContent = '🔄';
        statusText.textContent = 'Auto Refresh';
        statusBadge.classList.remove('status-paused');
        statusBadge.classList.add('status-active');
        isAutoRefresh = true;
    }
}

// Enhanced search with highlighting
function searchTable(input, tableName) {
    const searchText = input.value.toLowerCase();
    const table = document.querySelector(`[data-table="${tableName}"]`);
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    // First restore all cells to their original value
    rows.forEach(row => {
        Array.from(row.querySelectorAll('td')).forEach(cell => {
            const originalValue = cell.getAttribute('data-original-value');
            cell.innerHTML = originalValue;
        });
    });
    
    if (searchText === '') {
        // If search is empty, show all rows
        rows.forEach(row => row.style.display = '');
        return;
    }
    
    rows.forEach(row => {
        let rowContainsSearch = false;
        const cells = Array.from(row.querySelectorAll('td'));
        
        cells.forEach(cell => {
            const originalText = cell.getAttribute('data-original-value');
            
            if (originalText.toLowerCase().includes(searchText)) {
                rowContainsSearch = true;
                
                // Highlight matching text with our purple color and bold
                const regex = new RegExp(searchText, 'gi');
                cell.innerHTML = originalText.replace(regex, match => 
                    `<span class="highlight">${match}</span>`
                );
            }
        });
        
        row.style.display = rowContainsSearch ? '' : 'none';
    });
}

// פונקציית מיון לטבלה
function sortTable(table, column) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const headerRow = table.querySelector('thead tr');
    const headerCells = Array.from(headerRow.querySelectorAll('th'));
    
    // מצא את האינדקס של העמודה שרוצים למיין
    const headerIndex = headerCells.findIndex(th => 
        th.textContent.trim().includes(column));
    
    // אם לא מצאנו את העמודה, נצא מהפונקציה
    if (headerIndex === -1) {
        console.error('Column not found:', column);
        return;
    }
    
    // החלף כיוון מיון (עולה/יורד)
    const currentDir = table.getAttribute('data-sort-dir') || 'asc';
    const newDir = currentDir === 'asc' ? 'desc' : 'asc';
    table.setAttribute('data-sort-dir', newDir);
    
    // עדכן את כל מחווני המיון בכותרות
    headerCells.forEach(cell => {
        const button = cell.querySelector('.sort-button');
        const dirIndicator = button.querySelector('span:last-child');
        
        if (cell.textContent.trim().includes(column)) {
            // הוסף סימון לעמודה הנבחרת
            cell.classList.add('active-sort');
            button.classList.add('active');
            dirIndicator.textContent = newDir === 'asc' ? '↑' : '↓';
            dirIndicator.style.opacity = '1';
        } else {
            // נקה סימונים מעמודות אחרות
            cell.classList.remove('active-sort');
            button.classList.remove('active');
            dirIndicator.textContent = '⇅';
            dirIndicator.style.opacity = '0.6';
        }
    });

    // קבע כיוון מיון
    const sortDir = newDir === 'asc' ? 1 : -1;
    
    // מיין את השורות
    const sortedRows = rows.sort((a, b) => {
        const aCell = a.cells[headerIndex];
        const bCell = b.cells[headerIndex];
        
        // ודא שהתאים קיימים
        if (!aCell || !bCell) {
            return 0;
        }
        
        // קבל את הערכים המקוריים (ללא הדגשות חיפוש)
        const aValue = aCell.getAttribute('data-original-value') || aCell.textContent.trim();
        const bValue = bCell.getAttribute('data-original-value') || bCell.textContent.trim();

        // בדוק אם אלו מספרים
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return (aNum - bNum) * sortDir;
        }
        
        // בדוק אם אלו תאריכים
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
            return (aDate - bDate) * sortDir;
        }
        
        // אחרת מיין כמחרוזות (לא תלוי רישיות)
        return aValue.localeCompare(bValue) * sortDir;
    });

    // הצג את השורות הממוינות עם אנימציה
    tbody.innerHTML = '';
    sortedRows.forEach((row, index) => {
        tbody.appendChild(row);
    });
}

// Refresh specific table
function refreshTable(tableName) {
    const container = document.querySelector(`[data-table="${tableName}"]`)
        .closest('.table-container');
    
    container.style.opacity = '0.5';
    container.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        location.reload();
    }, 300);
}

// Export table functionality
function exportTable(tableName) {
    console.log("Export function called for table:", tableName);
    
    const table = document.querySelector(`[data-table="${tableName}"]`);
    if (!table) {
        console.error("Table not found:", tableName);
        return;
    }
    
    const headerRow = table.querySelector("thead tr");
    const headers = Array.from(headerRow.querySelectorAll("th")).map(th => {
        // נקה את הטקסט מהכותרת (הסר את החץ ⇅)
        const headerText = th.textContent.trim();
        return headerText.replace(/[⇅↑↓]/g, "").trim();
    });
    
    const rows = Array.from(table.querySelectorAll("tbody tr"));
    
    console.log("Headers:", headers);
    console.log("Row count:", rows.length);
    
    // יצירת מודל האקספורט
    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0,0,0,0.5)";
    modal.style.display = "flex";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    modal.style.zIndex = "1000";
    modal.style.backdropFilter = "blur(5px)";

    const modalContent = document.createElement("div");
    modalContent.style.backgroundColor = "var(--surface)";
    modalContent.style.borderRadius = "1rem";
    modalContent.style.padding = "1.5rem";
    modalContent.style.maxWidth = "400px";
    modalContent.style.width = "90%";
    modalContent.style.animation = "fadeIn 0.3s ease";

    modalContent.innerHTML = `
        <h2 style="color: var(--text); margin-bottom: 1rem; text-align: center;">Export ${tableName}</h2>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            <button id="exportExcel" style="
                width: 100%; 
                padding: 0.75rem; 
                background-color: #4f46e5; 
                color: white; 
                border: none; 
                border-radius: 0.5rem; 
                cursor: pointer;
                transition: background-color 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            ">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M8 13h2"></path><path d="M8 17h2"></path><path d="M14 13h2"></path><path d="M14 17h2"></path></svg>
                Export as Excel
            </button>
            <button id="exportPDF" style="
                width: 100%; 
                padding: 0.75rem; 
                background-color: #ef4444; 
                color: white; 
                border: none; 
                border-radius: 0.5rem; 
                cursor: pointer;
                transition: background-color 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            ">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Export as PDF
            </button>
            <button id="exportJSON" style="
                width: 100%; 
                padding: 0.75rem; 
                background-color: #f59e0b; 
                color: white; 
                border: none; 
                border-radius: 0.5rem; 
                cursor: pointer;
                transition: background-color 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            ">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Export as JSON
            </button>
            <button id="cancelExport" style="
                width: 100%; 
                padding: 0.75rem; 
                background-color: var(--surface-light); 
                color: var(--text); 
                border: none; 
                border-radius: 0.5rem; 
                cursor: pointer;
                transition: background-color 0.3s ease;
            ">Cancel</button>
        </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // בדיקת טעינת ספריות
    console.log("XLSX library loaded:", typeof XLSX !== "undefined");
    console.log("jspdf library loaded:", typeof jspdf !== "undefined");

    // סגירה בלחיצה מחוץ למודל
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });

    // סגירה בלחיצה על כפתור ביטול
    document.getElementById("cancelExport").addEventListener("click", () => {
        document.body.removeChild(modal);
    });

    // ייצוא ל-Excel - עם בדיקות מפורטות
    document.getElementById("exportExcel").addEventListener("click", () => {
        console.log("Excel export clicked");
        
        try {
            // בדיקת טעינת הספרייה
            if (typeof XLSX === "undefined") {
                console.error("XLSX library is not loaded.");
                alert("Excel export library is not loaded. Please try again later.");
                return;
            }
            
            // הכנת הנתונים לייצוא
            const data = rows.map(row => {
                const rowData = {};
                const cells = Array.from(row.querySelectorAll("td"));
                
                headers.forEach((header, index) => {
                    if (index < cells.length) {
                        rowData[header] = cells[index].getAttribute("data-original-value") || cells[index].textContent.trim();
                    } else {
                        rowData[header] = "";
                    }
                });
                
                return rowData;
            });
            
            console.log("Excel data prepared:", data);

            // ייצוא בסיסי ל-Excel
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, tableName);
            
            console.log("Excel workbook created");
            
            // שמירת הקובץ
            XLSX.writeFile(workbook, `${tableName}.xlsx`);
            console.log("Excel file saved");
            
            document.body.removeChild(modal);
        } catch (error) {
            console.error("Error exporting to Excel:", error);
            alert("Failed to export to Excel: " + error.message);
        }
    });

    // ייצוא ל-PDF - עם בדיקות מפורטות
    document.getElementById("exportPDF").addEventListener("click", () => {
        try {
            // בדיקת טעינת הספרייה
            if (typeof jspdf === "undefined") {
                alert("PDF export library is not loaded. Please try again later.");
                return;
            }
            
            // יצירת מסמך PDF במצב אופקי (landscape) כדי להכיל את כל העמודות
            const doc = new jspdf.jsPDF('landscape');
            
            // הגדרת פונט וצבעים
            doc.setFont("helvetica");
            
            // כותרת ראשית מעוצבת
            doc.setFillColor(15, 23, 42); // --background color
            doc.rect(0, 0, doc.internal.pageSize.width, 25, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text(`AeroWay - ${tableName}`, doc.internal.pageSize.width / 2, 15, { align: "center" });
            
            // מידע נוסף
            doc.setFontSize(10);
            doc.setTextColor(180, 180, 180);
            doc.setFont("helvetica", "normal");
            const exportDate = new Date().toLocaleString();
            doc.text(`Generated on: ${exportDate}`, doc.internal.pageSize.width / 2, 22, { align: "center" });
            
            // הכנת נתוני הטבלה - קומפקטי
            const tableData = rows.map(row => {
                const cells = Array.from(row.querySelectorAll("td"));
                
                // נקה את הנתונים ורכז כל תוכן בשורה אחת
                return cells.map(cell => {
                    let value = cell.getAttribute("data-original-value") || cell.textContent.trim();
                    // הסר ירידות שורה וכפילויות רווחים
                    value = value.replace(/\n/g, " ").replace(/\s+/g, " ");
                    return value;
                });
            });
            
            // עיצוב והוספת הטבלה
            doc.autoTable({
                head: [headers],
                body: tableData,
                startY: 30,
                theme: "grid",
                headStyles: {
                    fillColor: [99, 102, 241], // --primary-color
                    textColor: [255, 255, 255],
                    fontSize: 10,
                    fontStyle: "bold",
                    halign: "center",
                    valign: "middle",
                    cellPadding: 3
                },
                bodyStyles: {
                    fontSize: 9,
                    textColor: [50, 50, 50],
                    lineWidth: 0.1,
                    lineColor: [220, 220, 220],
                    halign: "center",
                    cellPadding: 2, // פחות ריווח
                    minCellHeight: 8 // גובה מינימלי קטן יותר
                },
                columnStyles: {
                    0: { cellWidth: 10 }, // ID - צר יותר
                    // התאם את רוחב העמודות לפי הצורך
                },
                alternateRowStyles: {
                    fillColor: [240, 247, 250]
                },
                margin: { top: 35, right: 10, bottom: 25, left: 10 },
                rowPageBreak: 'auto',
                showHead: 'everyPage',
                tableWidth: 'auto',
                styles: {
                    overflow: 'ellipsize', // קיצור טקסט ארוך עם נקודות
                    cellPadding: 2,
                },
                didParseCell: function(data) {
                    // מתאים את סגנון התאים לפי סוג הנתונים
                    if (data.section === 'body') {
                        const text = data.cell.text[0];
                        
                        // עיצוב התאים של True/False
                        if (text === 'True') {
                            data.cell.styles.textColor = [34, 197, 94]; // --success-color
                            data.cell.styles.fontStyle = 'bold';
                        } else if (text === 'False') {
                            data.cell.styles.textColor = [239, 68, 68]; // --danger-color
                        } else if (text === 'NULL') {
                            data.cell.styles.textColor = [148, 163, 184]; // gray
                            data.cell.styles.fontStyle = 'italic';
                        }
                        
                        // מניעת שבירת שורות
                        data.cell.styles.overflow = 'ellipsize';
                    }
                },
                didDrawCell: function(data) {
                    // הגבלת גובה התא
                    if (data.section === 'body') {
                        // לא לאפשר לתאים להתרחב יותר מדי
                        if (data.row.height > 10) {
                            data.row.height = 10;
                        }
                    }
                }
            });
            
            // הוספת מספור עמודים
            const pageCount = doc.internal.getNumberOfPages();
            for(let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(120, 120, 120);
                doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
                
                // רגל
                doc.text('AeroWay Database System', doc.internal.pageSize.width - 15, doc.internal.pageSize.height - 10, { align: 'right' });
                doc.text(`Export date: ${exportDate}`, 15, doc.internal.pageSize.height - 10, { align: 'left' });
            }
            
            // שמירת המסמך
            doc.save(`${tableName}_Export.pdf`);
            document.body.removeChild(modal);
        } catch (error) {
            console.error("Error exporting to PDF:", error);
            alert("Failed to export to PDF: " + error.message);
        }
    });

    // ייצוא ל-JSON
    document.getElementById("exportJSON").addEventListener("click", () => {
        console.log("JSON export clicked");
        
        try {
            // הכנת הנתונים לייצוא
            const jsonData = rows.map(row => {
                const rowData = {};
                const cells = Array.from(row.querySelectorAll("td"));
                
                headers.forEach((header, index) => {
                    if (index < cells.length) {
                        rowData[header] = cells[index].getAttribute("data-original-value") || cells[index].textContent.trim();
                    } else {
                        rowData[header] = "";
                    }
                });
                
                return rowData;
            });
            
            console.log("JSON data prepared:", jsonData);

            // ייצוא ל-JSON
            const jsonString = JSON.stringify(jsonData, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement("a");
            a.href = url;
            a.download = `${tableName}.json`;
            a.click();
            
            console.log("JSON file saved");
            
            document.body.removeChild(modal);
        } catch (error) {
            console.error("Error exporting to JSON:", error);
            alert("Failed to export to JSON: " + error.message);
        }
    });
}

// Improved table toggling with animation and persistence
function toggleTable(tableName) {
    const container = document.getElementById(`container-${tableName}`);
    const icon = document.getElementById(`minimize-icon-${tableName}`);
    const content = document.getElementById(`content-${tableName}`);
    
    // הוסף מחלקת toggling לאנימציה
    if (!container.classList.contains('minimized')) {
        // אם הטבלה פתוחה ואנחנו סוגרים אותה
        container.classList.add('minimized');
        icon.textContent = '▶️';
        localStorage.setItem(`table-${tableName}-state`, 'minimized');
    } else {
        // אם הטבלה סגורה ואנחנו פותחים אותה
        container.classList.remove('minimized');
        icon.textContent = '🔽';
        
        // הוסף מחלקת toggling לאנימציית פתיחה
        content.classList.add('toggling');
        setTimeout(() => {
            content.classList.remove('toggling');
            }, 400); // משך האנימציה

localStorage.setItem(`table-${tableName}-state`, 'expanded');
}
}

// Improved function to apply saved table states
function applyTableStates() {
    const tableContainers = document.querySelectorAll('.table-container');
    tableContainers.forEach((container, index) => {
        const tableName = container.id.replace('container-', '');
        // מצב ברירת מחדל: טבלה ראשונה פתוחה, השאר סגורות
        const defaultState = index === 0 ? 'expanded' : 'minimized';
        const state = localStorage.getItem(`table-${tableName}-state`) || defaultState;
        
        const icon = document.getElementById(`minimize-icon-${tableName}`);
        
        if (state === 'expanded') {
            container.classList.remove('minimized');
            icon.textContent = '🔽';
        } else {
            container.classList.add('minimized');
            icon.textContent = '▶️';
        }
    });
}

// Initialize everything on page load
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(savedTheme);
    applyTableStates();
    
    // Add keyboard shortcut to toggle tables (Ctrl+Shift+T)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            // Toggle all tables' states
            const tableContainers = document.querySelectorAll('.table-container');
            const allMinimized = Array.from(tableContainers).every(
                container => container.classList.contains('minimized')
            );
            
            tableContainers.forEach(container => {
                const tableName = container.id.replace('container-', '');
                if (allMinimized) {
                    // Expand all
                    container.classList.remove('minimized');
                    document.getElementById(`minimize-icon-${tableName}`).textContent = '🔽';
                    const content = document.getElementById(`content-${tableName}`);
                    content.style.display = 'block';
                    setTimeout(() => {
                        content.style.opacity = '1';
                        content.style.transform = 'translateY(0)';
                    }, 10);
                    localStorage.setItem(`table-${tableName}-state`, 'expanded');
                } else {
                    // Minimize all
                    container.classList.add('minimized');
                    document.getElementById(`minimize-icon-${tableName}`).textContent = '▶️';
                    const content = document.getElementById(`content-${tableName}`);
                    content.style.opacity = '0';
                    content.style.transform = 'translateY(-10px)';
                    setTimeout(() => {
                        content.style.display = 'none';
                    }, 300);
                    localStorage.setItem(`table-${tableName}-state`, 'minimized');
                }
            });
        }
    });
});