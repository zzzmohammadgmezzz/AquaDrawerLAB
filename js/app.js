// js/app.js

// Application State
const AppState = {
    currentTheme: 'light',
    currentProject: null,
    savedProjects: [],
    isSidebarOpen: false
};

// DOM Elements
const domElements = {
    themeToggle: document.getElementById('themeToggle'),
    themeIcon: document.getElementById('themeIcon'),
    menuToggle: document.getElementById('menuToggle'),
    closeSidebar: document.getElementById('closeSidebar'),
    sidebar: document.getElementById('sidebar'),
    calculateBtn: document.getElementById('calculateBtn'),
    resetBtn: document.getElementById('resetBtn'),
    printBtn: document.getElementById('printBtn'),
    pdfBtn: document.getElementById('pdfBtn'),
    saveProjectBtn: document.getElementById('saveProjectBtn'),
    resultsSection: document.getElementById('results-section'),
    tableBody: document.getElementById('tableBody'),
    projectsList: document.getElementById('projectsList'),
    
    // Input fields
    cabinetWidth: document.getElementById('cabinetWidth'),
    cabinetHeight: document.getElementById('cabinetHeight'),
    cabinetDepth: document.getElementById('cabinetDepth'),
    shelfCount: document.getElementById('shelfCount'),
    cabinetType: document.querySelectorAll('input[name="cabinetType"]'),
    craftsmanName: document.getElementById('craftsmanName'),
    clientName: document.getElementById('clientName'),
    projectDate: document.getElementById('projectDate'),
    
    // Result display fields
    resultCraftsman: document.getElementById('resultCraftsman'),
    resultClient: document.getElementById('resultClient'),
    resultDate: document.getElementById('resultDate'),
    resultsSubtitle: document.getElementById('resultsSubtitle')
};

// Initialize the application
function init() {
    // Load saved theme preference
    loadThemePreference();
    
    // Set today's date
    setTodayDate();
    
    // Load saved projects
    loadSavedProjects();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize with default values
    updateResultsSubtitle();
}

// Theme Management
function loadThemePreference() {
    const savedTheme = localStorage.getItem('aquaDrawerTheme');
    if (savedTheme) {
        AppState.currentTheme = savedTheme;
    } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        AppState.currentTheme = prefersDark ? 'dark' : 'light';
    }
    applyTheme();
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', AppState.currentTheme);
    localStorage.setItem('aquaDrawerTheme', AppState.currentTheme);
    
    // Update theme icon
    const icon = domElements.themeIcon;
    if (AppState.currentTheme === 'dark') {
        icon.classList.remove('mdi-weather-sunny');
        icon.classList.add('mdi-weather-night');
    } else {
        icon.classList.remove('mdi-weather-night');
        icon.classList.add('mdi-weather-sunny');
    }
}

function toggleTheme() {
    AppState.currentTheme = AppState.currentTheme === 'light' ? 'dark' : 'light';
    applyTheme();
}

// Date Functions
function setTodayDate() {
    const now = new Date();
    const persianDate = convertToPersianDate(now);
    domElements.projectDate.value = persianDate;
}

function convertToPersianDate(date) {
    // Simple Persian date formatter (in a real app, you would use a library like moment-jalaali)
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    
    const gregorianDate = date.toLocaleDateString('fa-IR', options);
    
    // Convert English digits to Persian
    return gregorianDate.replace(/\d/g, digit => persianDigits[digit]);
}

// Form Validation
function validateForm() {
    const width = parseFloat(domElements.cabinetWidth.value);
    const height = parseFloat(domElements.cabinetHeight.value);
    const depth = parseFloat(domElements.cabinetDepth.value);
    const shelves = parseInt(domElements.shelfCount.value);
    
    let isValid = true;
    let errorMessage = '';
    
    if (isNaN(width) || width < 30 || width > 200) {
        isValid = false;
        errorMessage = 'عرض کابینت باید بین 30 تا 200 سانتی‌متر باشد';
        highlightInvalidField(domElements.cabinetWidth);
    } else {
        removeHighlight(domElements.cabinetWidth);
    }
    
    if (isNaN(height) || height < 30 || height > 300) {
        isValid = false;
        errorMessage = 'ارتفاع کابینت باید بین 30 تا 300 سانتی‌متر باشد';
        highlightInvalidField(domElements.cabinetHeight);
    } else {
        removeHighlight(domElements.cabinetHeight);
    }
    
    if (isNaN(depth) || depth < 30 || depth > 100) {
        isValid = false;
        errorMessage = 'عمق کابینت باید بین 30 تا 100 سانتی‌متر باشد';
        highlightInvalidField(domElements.cabinetDepth);
    } else {
        removeHighlight(domElements.cabinetDepth);
    }
    
    if (isNaN(shelves) || shelves < 0 || shelves > 20) {
        isValid = false;
        errorMessage = 'تعداد طبقات باید بین 0 تا 20 باشد';
        highlightInvalidField(domElements.shelfCount);
    } else {
        removeHighlight(domElements.shelfCount);
    }
    
    if (!isValid) {
        showError(errorMessage);
    }
    
    return isValid;
}

function highlightInvalidField(field) {
    field.parentElement.style.borderColor = '#e74c3c';
    field.parentElement.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.2)';
}

function removeHighlight(field) {
    field.parentElement.style.borderColor = '';
    field.parentElement.style.boxShadow = '';
}

function showError(message) {
    // Create error toast
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.innerHTML = `
        <i class="mdi mdi-alert-circle"></i>
        <span>${message}</span>
    `;
    
    // Style the toast
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        right: 20px;
        background-color: #e74c3c;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateY(-100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(-100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Calculation Functions
function calculateCabinetParts() {
    const width = parseFloat(domElements.cabinetWidth.value);
    const height = parseFloat(domElements.cabinetHeight.value);
    const depth = parseFloat(domElements.cabinetDepth.value);
    const shelfCount = parseInt(domElements.shelfCount.value);
    const isWallCabinet = document.getElementById('wallCabinet').checked;
    
    const parts = [];
    
    // Side panels (2 pieces)
    parts.push({
        description: 'دیواره جانبی',
        quantity: 2,
        width: height,
        length: depth,
        groove: false,
        pvcWidth: '',
        pvcLength: '',
        attachment: ''
    });
    
    // Shelves
    for (let i = 1; i <= shelfCount; i++) {
        parts.push({
            description: `طبقه ${i}`,
            quantity: 1,
            width: width - 3.2,
            length: depth - 2,
            groove: false,
            pvcWidth: '',
            pvcLength: '',
            attachment: ''
        });
    }
    
    // Top panel (only for wall cabinets)
    if (isWallCabinet) {
        parts.push({
            description: 'صفحه رویه',
            quantity: 1,
            width: width - 3.2,
            length: depth,
            groove: false,
            pvcWidth: '',
            pvcLength: '',
            attachment: ''
        });
    }
    
    return parts;
}

// Table Generation
function generateResultsTable() {
    if (!validateForm()) {
        return;
    }
    
    // Get form values
    const width = parseFloat(domElements.cabinetWidth.value);
    const height = parseFloat(domElements.cabinetHeight.value);
    const depth = parseFloat(domElements.cabinetDepth.value);
    const shelfCount = parseInt(domElements.shelfCount.value);
    const isWallCabinet = document.getElementById('wallCabinet').checked;
    const craftsman = domElements.craftsmanName.value || 'تعیین نشده';
    const client = domElements.clientName.value || 'تعیین نشده';
    const date = domElements.projectDate.value || convertToPersianDate(new Date());
    
    // Update result metadata
    domElements.resultCraftsman.textContent = craftsman;
    domElements.resultClient.textContent = client;
    domElements.resultDate.textContent = date;
    
    // Calculate parts
    const parts = calculateCabinetParts();
    
    // Generate table rows
    const tableBody = domElements.tableBody;
    tableBody.innerHTML = '';
    
    // Add cabinet number and 3D view with rowspan
    const cabinetType = isWallCabinet ? 'دیواری' : 'زمینی';
    const cabinetNumber = 1; // In this version, we only handle one cabinet
    
    // Create first row with rowspan for 3D view
    const firstRow = document.createElement('tr');
    firstRow.innerHTML = `
        <td rowspan="${parts.length}" class="cabinet-3d-cell">
            <div class="cabinet-number">کابینت ${cabinetType} ${cabinetNumber}</div>
            <div class="cabinet-3d"></div>
        </td>
        <td><input type="checkbox" class="groove-checkbox"></td>
        <td><input type="text" class="pvc-input" placeholder="عرض"></td>
        <td><input type="text" class="pvc-input" placeholder="طول"></td>
        <td>${parts[0].description}</td>
        <td>${parts[0].quantity}</td>
        <td>${parts[0].width.toFixed(1)}</td>
        <td>${parts[0].length.toFixed(1)}</td>
        <td><input type="text" class="attachment-input" placeholder="شماره"></td>
    `;
    tableBody.appendChild(firstRow);
    
    // Add remaining rows
    for (let i = 1; i < parts.length; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="groove-checkbox"></td>
            <td><input type="text" class="pvc-input" placeholder="عرض"></td>
            <td><input type="text" class="pvc-input" placeholder="طول"></td>
            <td>${parts[i].description}</td>
            <td>${parts[i].quantity}</td>
            <td>${parts[i].width.toFixed(1)}</td>
            <td>${parts[i].length.toFixed(1)}</td>
            <td><input type="text" class="attachment-input" placeholder="شماره"></td>
        `;
        tableBody.appendChild(row);
    }
    
    // Update results subtitle
    updateResultsSubtitle();
    
    // Show results section
    domElements.resultsSection.style.display = 'block';
    
    // Save current project to state
    AppState.currentProject = {
        width,
        height,
        depth,
        shelfCount,
        isWallCabinet,
        craftsman,
        client,
        date,
        parts,
        timestamp: new Date().getTime()
    };
    
    // Scroll to results
    domElements.resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function updateResultsSubtitle() {
    const width = domElements.cabinetWidth.value || '80';
    const height = domElements.cabinetHeight.value || '120';
    const depth = domElements.cabinetDepth.value || '55';
    const shelves = domElements.shelfCount.value || '2';
    const isWallCabinet = document.getElementById('wallCabinet').checked;
    const cabinetType = isWallCabinet ? 'دیواری' : 'زمینی';
    
    domElements.resultsSubtitle.textContent = 
        `کابینت ${cabinetType} - عرض: ${width} سانتی‌متر - ارتفاع: ${height} سانتی‌متر - عمق: ${depth} سانتی‌متر - تعداد طبقات: ${shelves}`;
}

// Project Management
function saveProject() {
    if (!AppState.currentProject) {
        showError('لطفاً ابتدا یک پروژه محاسبه کنید');
        return;
    }
    
    // Add to saved projects
    AppState.savedProjects.push({
        ...AppState.currentProject,
        id: Date.now(),
        name: `پروژه ${new Date().toLocaleDateString('fa-IR')}`
    });
    
    // Save to localStorage
    localStorage.setItem('aquaDrawerProjects', JSON.stringify(AppState.savedProjects));
    
    // Update UI
    loadSavedProjects();
    
    // Show success message
    showSuccess('پروژه با موفقیت ذخیره شد');
}

function loadSavedProjects() {
    const saved = localStorage.getItem('aquaDrawerProjects');
    if (saved) {
        try {
            AppState.savedProjects = JSON.parse(saved);
        } catch (e) {
            AppState.savedProjects = [];
        }
    }
    
    renderProjectsList();
}

function renderProjectsList() {
    const container = domElements.projectsList;
    
    if (AppState.savedProjects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="mdi mdi-folder-open-outline"></i>
                <p>هیچ پروژه‌ای ذخیره نشده است</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = AppState.savedProjects.map(project => `
        <div class="project-item" data-id="${project.id}">
            <div class="project-info">
                <h4>${project.name}</h4>
                <div class="project-meta">
                    <span><i class="mdi mdi-account-hard-hat"></i> ${project.craftsman}</span>
                    <span><i class="mdi mdi-calendar"></i> ${project.date}</span>
                    <span><i class="mdi mdi-ruler"></i> ${project.width}×${project.height}×${project.depth} سانتی‌متر</span>
                </div>
            </div>
            <div class="project-actions">
                <button class="project-btn load-project" title="بارگذاری">
                    <i class="mdi mdi-folder-open"></i>
                </button>
                <button class="project-btn delete-project" title="حذف">
                    <i class="mdi mdi-delete"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to project buttons
    container.querySelectorAll('.load-project').forEach(btn => {
        btn.addEventListener('click', function() {
            const projectId = parseInt(this.closest('.project-item').dataset.id);
            loadProject(projectId);
        });
    });
    
    container.querySelectorAll('.delete-project').forEach(btn => {
        btn.addEventListener('click', function() {
            const projectId = parseInt(this.closest('.project-item').dataset.id);
            deleteProject(projectId);
        });
    });
}

function loadProject(projectId) {
    const project = AppState.savedProjects.find(p => p.id === projectId);
    if (!project) return;
    
    // Fill form with project data
    domElements.cabinetWidth.value = project.width;
    domElements.cabinetHeight.value = project.height;
    domElements.cabinetDepth.value = project.depth;
    domElements.shelfCount.value = project.shelfCount;
    domElements.craftsmanName.value = project.craftsman;
    domElements.clientName.value = project.client;
    domElements.projectDate.value = project.date;
    
    // Set cabinet type
    if (project.isWallCabinet) {
        document.getElementById('wallCabinet').checked = true;
    } else {
        document.getElementById('floorCabinet').checked = true;
    }
    
    // Calculate and show results
    generateResultsTable();
    
    showSuccess('پروژه با موفقیت بارگذاری شد');
}

function deleteProject(projectId) {
    if (!confirm('آیا از حذف این پروژه اطمینان دارید؟')) {
        return;
    }
    
    AppState.savedProjects = AppState.savedProjects.filter(p => p.id !== projectId);
    localStorage.setItem('aquaDrawerProjects', JSON.stringify(AppState.savedProjects));
    renderProjectsList();
    
    showSuccess('پروژه با موفقیت حذف شد');
}

function resetForm() {
    // Reset to default values
    domElements.cabinetWidth.value = 80;
    domElements.cabinetHeight.value = 120;
    domElements.cabinetDepth.value = 55;
    domElements.shelfCount.value = 2;
    document.getElementById('wallCabinet').checked = true;
    domElements.craftsmanName.value = '';
    domElements.clientName.value = '';
    setTodayDate();
    
    // Hide results section
    domElements.resultsSection.style.display = 'none';
    
    // Clear highlights
    removeHighlight(domElements.cabinetWidth);
    removeHighlight(domElements.cabinetHeight);
    removeHighlight(domElements.cabinetDepth);
    removeHighlight(domElements.shelfCount);
    
    showSuccess('فرم با موفقیت بازنشانی شد');
}

// Export Functions
function printTable() {
    window.print();
}

async function exportToPDF() {
    try {
        // Show loading state
        const originalText = domElements.pdfBtn.innerHTML;
        domElements.pdfBtn.innerHTML = '<i class="mdi mdi-loading mdi-spin"></i> در حال تولید PDF...';
        domElements.pdfBtn.disabled = true;
        
        // Import jsPDF dynamically
        const { jsPDF } = window.jspdf;
        
        // Create PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Set Persian font (using default font for now)
        pdf.setFont('helvetica');
        
        // Add title
        pdf.setFontSize(18);
        pdf.text('جدول ریزاندازه جهت کات مستر', 105, 20, { align: 'center' });
        
        // Add metadata
        pdf.setFontSize(12);
        pdf.text(`استادکار: ${domElements.resultCraftsman.textContent}`, 20, 35);
        pdf.text(`مشتری: ${domElements.resultClient.textContent}`, 105, 35, { align: 'center' });
        pdf.text(`تاریخ: ${domElements.resultDate.textContent}`, 180, 35, { align: 'right' });
        
        // Add table
        const tableElement = document.querySelector('.results-table');
        
        // Simple table representation for PDF
        const headers = [
            'نمای سه‌بعدی',
            'شیار',
            'نوار PVC عرض',
            'نوار PVC طول',
            'نوع قطعه',
            'تعداد',
            'ابعاد عرض',
            'ابعاد طول',
            'شماره پیوست'
        ];
        
        // Get table data
        const rows = [];
        const tableRows = tableElement.querySelectorAll('tbody tr');
        
        tableRows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const rowData = [];
            
            cells.forEach((cell, index) => {
                if (index === 0) {
                    // Skip 3D view column in PDF
                    rowData.push('');
                } else if (cell.querySelector('input')) {
                    rowData.push(cell.querySelector('input').value || '');
                } else {
                    rowData.push(cell.textContent.trim());
                }
            });
            
            rows.push(rowData);
        });
        
        // Add table to PDF (simplified)
        let yPos = 50;
        pdf.setFontSize(10);
        
        // Add headers
        const colWidths = [20, 15, 20, 20, 40, 15, 20, 20, 20];
        let xPos = 20;
        
        headers.forEach((header, i) => {
            pdf.text(header, xPos, yPos);
            xPos += colWidths[i];
        });
        
        yPos += 10;
        
        // Add rows
        rows.forEach(row => {
            xPos = 20;
            row.forEach((cell, i) => {
                pdf.text(cell || '', xPos, yPos);
                xPos += colWidths[i];
            });
            yPos += 10;
            
            // Add new page if needed
            if (yPos > 270) {
                pdf.addPage();
                yPos = 20;
            }
        });
        
        // Add footer
        pdf.setFontSize(8);
        pdf.text('Aqua Drawer LAB - تولید شده توسط ممد', 105, 285, { align: 'center' });
        
        // Save PDF
        pdf.save(`جدول-ریزاندازه-${new Date().getTime()}.pdf`);
        
        // Restore button state
        domElements.pdfBtn.innerHTML = originalText;
        domElements.pdfBtn.disabled = false;
        
        showSuccess('PDF با موفقیت تولید شد');
        
    } catch (error) {
        console.error('PDF export error:', error);
        showError('خطا در تولید PDF. لطفاً دوباره تلاش کنید.');
        
        // Restore button state
        domElements.pdfBtn.innerHTML = '<i class="mdi mdi-file-pdf"></i> خروجی PDF';
        domElements.pdfBtn.disabled = false;
    }
}

// Helper Functions
function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.innerHTML = `
        <i class="mdi mdi-check-circle"></i>
        <span>${message}</span>
    `;
    
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        right: 20px;
        background-color: #27ae60;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Event Listeners Setup
function setupEventListeners() {
    // Theme toggle
    domElements.themeToggle.addEventListener('click', toggleTheme);
    
    // Sidebar toggle
    domElements.menuToggle.addEventListener('click', () => {
        AppState.isSidebarOpen = true;
        domElements.sidebar.classList.add('active');
    });
    
    domElements.closeSidebar.addEventListener('click', () => {
        AppState.isSidebarOpen = false;
        domElements.sidebar.classList.remove('active');
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (event) => {
        if (AppState.isSidebarOpen && 
            !domElements.sidebar.contains(event.target) && 
            !domElements.menuToggle.contains(event.target)) {
            AppState.isSidebarOpen = false;
            domElements.sidebar.classList.remove('active');
        }
    });
    
    // Sidebar links
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', () => {
            AppState.isSidebarOpen = false;
            domElements.sidebar.classList.remove('active');
        });
    });
    
    // Form actions
    domElements.calculateBtn.addEventListener('click', generateResultsTable);
    domElements.resetBtn.addEventListener('click', resetForm);
    domElements.printBtn.addEventListener('click', printTable);
    domElements.pdfBtn.addEventListener('click', exportToPDF);
    domElements.saveProjectBtn.addEventListener('click', saveProject);
    
    // Update results subtitle on input changes
    const inputsToWatch = [
        domElements.cabinetWidth,
        domElements.cabinetHeight,
        domElements.cabinetDepth,
        domElements.shelfCount
    ];
    
    inputsToWatch.forEach(input => {
        input.addEventListener('input', updateResultsSubtitle);
    });
    
    // Cabinet type change
    domElements.cabinetType.forEach(radio => {
        radio.addEventListener('change', updateResultsSubtitle);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to calculate
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            generateResultsTable();
        }
        
        // Escape to close sidebar
        if (e.key === 'Escape' && AppState.isSidebarOpen) {
            AppState.isSidebarOpen = false;
            domElements.sidebar.classList.remove('active');
        }
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);