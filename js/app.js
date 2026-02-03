// Application State
const AppState = {
    currentTheme: 'light',
    cabinets: [], // Array of all cabinets added to table
    savedProjects: [],
    isSidebarOpen: false,
    currentCabinetId: 1 // Auto-increment ID for cabinets
};

// DOM Elements
const domElements = {
    themeToggle: document.getElementById('themeToggle'),
    themeIcon: document.getElementById('themeIcon'),
    menuToggle: document.getElementById('menuToggle'),
    closeSidebar: document.getElementById('closeSidebar'),
    sidebar: document.getElementById('sidebar'),
    calculateBtn: document.getElementById('calculateBtn'),
    addToTableBtn: document.getElementById('addToTableBtn'),
    resetBtn: document.getElementById('resetBtn'),
    clearTableBtn: document.getElementById('clearTableBtn'),
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
    resultsSubtitle: document.getElementById('resultsSubtitle'),
    cabinetCount: document.getElementById('cabinetCount')
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
    
    // Initialize with empty table
    updateCabinetCount();
    
    console.log('Aqua Drawer LAB initialized successfully');
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
    // Simple Persian date formatter
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
        errorMessage = 'عرض کابینت باید بین ۳۰ تا ۲۰۰ سانتی‌متر باشد';
        highlightInvalidField(domElements.cabinetWidth);
    } else {
        removeHighlight(domElements.cabinetWidth);
    }
    
    if (isNaN(height) || height < 30 || height > 300) {
        isValid = false;
        errorMessage = 'ارتفاع کابینت باید بین ۳۰ تا ۳۰۰ سانتی‌متر باشد';
        highlightInvalidField(domElements.cabinetHeight);
    } else {
        removeHighlight(domElements.cabinetHeight);
    }
    
    if (isNaN(depth) || depth < 30 || depth > 100) {
        isValid = false;
        errorMessage = 'عمق کابینت باید بین ۳۰ تا ۱۰۰ سانتی‌متر باشد';
        highlightInvalidField(domElements.cabinetDepth);
    } else {
        removeHighlight(domElements.cabinetDepth);
    }
    
    if (isNaN(shelves) || shelves < 0 || shelves > 20) {
        isValid = false;
        errorMessage = 'تعداد طبقات باید بین ۰ تا ۲۰ باشد';
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
    field.parentElement.style.boxShadow = '0 0 0 4px rgba(231, 76, 60, 0.2)';
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
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        color: white;
        padding: 16px 20px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        box-shadow: 0 8px 32px rgba(231, 76, 60, 0.3);
        animation: slideIn 0.3s ease;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
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
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// Cabinet Calculation Functions
function calculateWallCabinetParts() {
    const width = parseFloat(domElements.cabinetWidth.value);
    const height = parseFloat(domElements.cabinetHeight.value);
    const depth = parseFloat(domElements.cabinetDepth.value);
    const shelfCount = parseInt(domElements.shelfCount.value);
    
    const parts = [];
    
    // Side panels (بدنه) - 2 pieces
    parts.push({
        description: 'بدنه',
        quantity: 2,
        width: depth, // عمق = عرض بدنه
        length: height, // ارتفاع = طول بدنه
        groove: false,
        pvcWidth: false,
        pvcLength: false,
        attachment: ''
    });
    
    // Top & Bottom panels (سقف و کف) - 2 pieces
    parts.push({
        description: 'سقف و کف',
        quantity: 2,
        width: depth, // عمق = عرض
        length: (width - 3.2).toFixed(1), // عرض کابینت - 3.2 = طول
        groove: false,
        pvcWidth: false,
        pvcLength: false,
        attachment: ''
    });
    
    // Shelves (طبقه)
    for (let i = 1; i <= shelfCount; i++) {
        parts.push({
            description: `طبقه ${i}`,
            quantity: 1,
            width: depth - 2, // عمق - 2 = عرض
            length: (width - 3.2).toFixed(1), // عرض کابینت - 3.2 = طول
            groove: false,
            pvcWidth: false,
            pvcLength: false,
            attachment: ''
        });
    }
    
    return parts;
}

function calculateFloorCabinetParts() {
    const width = parseFloat(domElements.cabinetWidth.value);
    const height = parseFloat(domElements.cabinetHeight.value);
    const depth = parseFloat(domElements.cabinetDepth.value);
    const shelfCount = Math.min(parseInt(domElements.shelfCount.value), 1); // فقط یک طبقه برای کابینت زمینی
    
    const parts = [];
    
    // Side panels (بدنه) - 2 pieces (ارتفاع - 1.6)
    parts.push({
        description: 'بدنه',
        quantity: 2,
        width: depth, // عمق = عرض بدنه
        length: (height - 1.6).toFixed(1), // ارتفاع - 1.6 = طول بدنه
        groove: false,
        pvcWidth: false,
        pvcLength: false,
        attachment: ''
    });
    
    // Bottom panel (کف) - 1 piece
    parts.push({
        description: 'کف',
        quantity: 1,
        width: depth, // عمق = عرض
        length: width.toFixed(1), // عرض کابینت = طول
        groove: false,
        pvcWidth: false,
        pvcLength: false,
        attachment: ''
    });
    
    // Stretchers (تیرک) - 2 pieces (عرض - 3.2 و عمق ۱۲)
    parts.push({
        description: 'تیرک',
        quantity: 2,
        width: 12, // عمق ثابت ۱۲ سانتی‌متر
        length: (width - 3.2).toFixed(1), // عرض کابینت - 3.2 = طول
        groove: false,
        pvcWidth: false,
        pvcLength: false,
        attachment: ''
    });
    
    // Shelf (طبقه) - 1 piece فقط اگر تعداد طبقات > 0
    if (shelfCount > 0) {
        parts.push({
            description: 'طبقه',
            quantity: 1,
            width: depth - 2, // عمق - 2 = عرض
            length: (width - 3.2).toFixed(1), // عرض کابینت - 3.2 = طول
            groove: false,
            pvcWidth: false,
            pvcLength: false,
            attachment: ''
        });
    }
    
    return parts;
}

// 3D Schematic Drawing Function
function create3DSchematic(cabinetType, width, height, depth, shelfCount) {
    const svgNS = "http://www.w3.org/2000/svg";
    const container = document.createElement('div');
    container.className = 'cabinet-schematic';
    
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 200 150');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    
    // Main rectangle (cabinet body)
    const cabinetRect = document.createElementNS(svgNS, 'rect');
    cabinetRect.setAttribute('x', '20');
    cabinetRect.setAttribute('y', '20');
    cabinetRect.setAttribute('width', cabinetType === 'wall' ? '120' : '140');
    cabinetRect.setAttribute('height', cabinetType === 'wall' ? '80' : '100');
    cabinetRect.setAttribute('fill', 'none');
    cabinetRect.setAttribute('stroke', '#5d4037');
    cabinetRect.setAttribute('stroke-width', '2');
    svg.appendChild(cabinetRect);
    
    // Depth indicator line (diagonal)
    const depthLine = document.createElementNS(svgNS, 'line');
    depthLine.setAttribute('x1', cabinetType === 'wall' ? '140' : '160');
    depthLine.setAttribute('y1', '20');
    depthLine.setAttribute('x2', cabinetType === 'wall' ? '160' : '180');
    depthLine.setAttribute('y2', '40');
    depthLine.setAttribute('stroke', '#3498db');
    depthLine.setAttribute('stroke-width', '1.5');
    depthLine.setAttribute('stroke-dasharray', '4,2');
    svg.appendChild(depthLine);
    
    // Labels
    const addLabel = (text, x, y, fontSize = '10') => {
        const label = document.createElementNS(svgNS, 'text');
        label.setAttribute('x', x);
        label.setAttribute('y', y);
        label.setAttribute('font-size', fontSize);
        label.setAttribute('fill', '#2c3e50');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-weight', 'bold');
        label.textContent = text;
        svg.appendChild(label);
    };
    
    // Height label (left side)
    addLabel(`${height}`, cabinetType === 'wall' ? '15' : '15', cabinetType === 'wall' ? '60' : '70', '11');
    
    // Width label (top side)
    addLabel(`${width}`, cabinetType === 'wall' ? '80' : '90', '12', '11');
    
    // Depth label (diagonal)
    addLabel(`${depth}`, cabinetType === 'wall' ? '150' : '170', '28', '10');
    
    // Shelves (dashed horizontal lines)
    if (shelfCount > 0) {
        const shelfSpacing = (cabinetType === 'wall' ? 80 : 100) / (shelfCount + 1);
        
        for (let i = 1; i <= shelfCount; i++) {
            const shelfY = 20 + (shelfSpacing * i);
            const shelf = document.createElementNS(svgNS, 'line');
            shelf.setAttribute('x1', '20');
            shelf.setAttribute('y1', shelfY);
            shelf.setAttribute('x2', cabinetType === 'wall' ? '140' : '160');
            shelf.setAttribute('y2', shelfY);
            shelf.setAttribute('stroke', '#e74c3c');
            shelf.setAttribute('stroke-width', '1');
            shelf.setAttribute('stroke-dasharray', '3,3');
            svg.appendChild(shelf);
        }
    }
    
    // For floor cabinet, add bottom stretcher indicator
    if (cabinetType === 'floor') {
        const stretcher = document.createElementNS(svgNS, 'line');
        stretcher.setAttribute('x1', '20');
        stretcher.setAttribute('y1', '110');
        stretcher.setAttribute('x2', '160');
        stretcher.setAttribute('y2', '110');
        stretcher.setAttribute('stroke', '#27ae60');
        stretcher.setAttribute('stroke-width', '2');
        stretcher.setAttribute('stroke-dasharray', '6,3');
        svg.appendChild(stretcher);
    }
    
    svg.appendChild(cabinetRect);
    container.appendChild(svg);
    
    return container;
}

// Table Generation Functions
function generateCabinetTable() {
    if (!validateForm()) {
        return;
    }
    
    const isWallCabinet = document.getElementById('wallCabinet').checked;
    const cabinetType = isWallCabinet ? 'wall' : 'floor';
    const cabinetTypeName = isWallCabinet ? 'دیواری' : 'زمینی';
    
    // Get current cabinet data
    const width = parseFloat(domElements.cabinetWidth.value);
    const height = parseFloat(domElements.cabinetHeight.value);
    const depth = parseFloat(domElements.cabinetDepth.value);
    const shelfCount = parseInt(domElements.shelfCount.value);
    const craftsman = domElements.craftsmanName.value || 'تعیین نشده';
    const client = domElements.clientName.value || 'تعیین نشده';
    const date = domElements.projectDate.value || convertToPersianDate(new Date());
    
    // Calculate parts based on cabinet type
    const parts = isWallCabinet ? calculateWallCabinetParts() : calculateFloorCabinetParts();
    
    // Create cabinet object
    const cabinet = {
        id: AppState.currentCabinetId++,
        type: cabinetType,
        typeName: cabinetTypeName,
        width,
        height,
        depth,
        shelfCount,
        parts,
        craftsman,
        client,
        date,
        timestamp: new Date().getTime()
    };
    
    // Add to cabinets array
    AppState.cabinets.push(cabinet);
    
    // Update UI
    updateResultsMetadata(craftsman, client, date);
    updateCabinetCount();
    renderTable();
    
    // Show results section if hidden
    domElements.resultsSection.style.display = 'block';
    
    showSuccess(`کابینت ${cabinetTypeName} به جدول اضافه شد`);
}

function addToTable() {
    generateCabinetTable();
}

function updateResultsMetadata(craftsman, client, date) {
    domElements.resultCraftsman.textContent = craftsman;
    domElements.resultClient.textContent = client;
    domElements.resultDate.textContent = date;
}

function updateCabinetCount() {
    const count = AppState.cabinets.length;
    domElements.cabinetCount.textContent = count;
    
    if (count > 0) {
        domElements.resultsSubtitle.textContent = `لیست ${count} کابینت محاسبه شده`;
    } else {
        domElements.resultsSubtitle.textContent = 'لیست تمام کابینت‌های محاسبه شده';
    }
}

function renderTable() {
    const tableBody = domElements.tableBody;
    
    if (AppState.cabinets.length === 0) {
        tableBody.innerHTML = `
            <tr class="empty-table-message">
                <td colspan="9">
                    <div class="empty-state">
                        <i class="mdi mdi-table-large"></i>
                        <p>هنوز کابینتی به جدول اضافه نشده است</p>
                        <small>از دکمه "محاسبه جدول" یا "افزودن به جدول" استفاده کنید</small>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = '';
    
    // Group cabinets by type for numbering
    const cabinetCounts = {
        wall: 0,
        floor: 0
    };
    
    AppState.cabinets.forEach(cabinet => {
        cabinetCounts[cabinet.type]++;
        const cabinetNumber = cabinetCounts[cabinet.type];
        
        // Create 3D schematic
        const schematic = create3DSchematic(cabinet.type, cabinet.width, cabinet.height, cabinet.depth, cabinet.shelfCount);
        
        // Add cabinet header row with rowspan
        const headerRow = document.createElement('tr');
        headerRow.className = 'cabinet-header-row';
        headerRow.innerHTML = `
            <td rowspan="${cabinet.parts.length}" class="cabinet-3d-cell">
                <div class="cabinet-number">کابینت ${cabinet.typeName} ${cabinetNumber}</div>
                ${schematic.outerHTML}
                <div class="cabinet-dimensions">
                    <small>${cabinet.width} × ${cabinet.height} × ${cabinet.depth} سانتی‌متر</small>
                </div>
            </td>
            <td><input type="checkbox" class="groove-checkbox"></td>
            <td><input type="checkbox" class="pvc-checkbox" data-type="width"></td>
            <td><input type="checkbox" class="pvc-checkbox" data-type="length"></td>
            <td>${cabinet.parts[0].description}</td>
            <td>${cabinet.parts[0].quantity}</td>
            <td>${cabinet.parts[0].width}</td>
            <td>${cabinet.parts[0].length}</td>
            <td><input type="text" class="attachment-input" placeholder="-" value="${cabinet.parts[0].attachment}"></td>
        `;
        tableBody.appendChild(headerRow);
        
        // Add remaining parts rows
        for (let i = 1; i < cabinet.parts.length; i++) {
            const part = cabinet.parts[i];
            const row = document.createElement('tr');
            row.className = 'cabinet-part-row';
            row.innerHTML = `
                <td><input type="checkbox" class="groove-checkbox"></td>
                <td><input type="checkbox" class="pvc-checkbox" data-type="width"></td>
                <td><input type="checkbox" class="pvc-checkbox" data-type="length"></td>
                <td>${part.description}</td>
                <td>${part.quantity}</td>
                <td>${part.width}</td>
                <td>${part.length}</td>
                <td><input type="text" class="attachment-input" placeholder="-" value="${part.attachment}"></td>
            `;
            tableBody.appendChild(row);
        }
    });
    
    // Add event listeners to checkboxes and inputs
    addTableEventListeners();
}

function addTableEventListeners() {
    // Groove checkboxes
    document.querySelectorAll('.groove-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // You can add additional logic here if needed
            console.log('Groove checkbox changed:', this.checked);
        });
    });
    
    // PVC checkboxes
    document.querySelectorAll('.pvc-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            console.log('PVC checkbox changed:', this.checked, this.dataset.type);
        });
    });
    
    // Attachment inputs
    document.querySelectorAll('.attachment-input').forEach(input => {
        input.addEventListener('input', function() {
            console.log('Attachment input changed:', this.value);
        });
    });
}

function clearTable() {
    if (AppState.cabinets.length === 0) {
        showError('جدول در حال حاضر خالی است');
        return;
    }
    
    if (!confirm('آیا از پاک کردن تمام جدول اطمینان دارید؟ این عمل قابل بازگشت نیست.')) {
        return;
    }
    
    AppState.cabinets = [];
    AppState.currentCabinetId = 1;
    updateCabinetCount();
    renderTable();
    
    showSuccess('جدول با موفقیت پاک شد');
}

// Project Management
function saveProject() {
    if (AppState.cabinets.length === 0) {
        showError('لطفاً ابتدا حداقل یک کابینت به جدول اضافه کنید');
        return;
    }
    
    const craftsman = domElements.craftsmanName.value || 'تعیین نشده';
    const client = domElements.clientName.value || 'تعیین نشده';
    const date = domElements.projectDate.value || convertToPersianDate(new Date());
    
    // Create project object
    const project = {
        id: Date.now(),
        name: `پروژه ${new Date().toLocaleDateString('fa-IR')}`,
        cabinets: [...AppState.cabinets],
        craftsman,
        client,
        date,
        timestamp: new Date().getTime(),
        totalCabinets: AppState.cabinets.length
    };
    
    // Add to saved projects
    AppState.savedProjects.push(project);
    
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
            console.error('Error loading saved projects:', e);
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
                    <span><i class="mdi mdi-cube-outline"></i> ${project.totalCabinets} کابینت</span>
                    <span><i class="mdi mdi-clock"></i> ${new Date(project.timestamp).toLocaleTimeString('fa-IR')}</span>
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
    
    // Clear current table
    AppState.cabinets = [...project.cabinets];
    AppState.currentCabinetId = Math.max(...project.cabinets.map(c => c.id)) + 1;
    
    // Set form values from first cabinet
    if (project.cabinets.length > 0) {
        const firstCabinet = project.cabinets[0];
        domElements.cabinetWidth.value = firstCabinet.width;
        domElements.cabinetHeight.value = firstCabinet.height;
        domElements.cabinetDepth.value = firstCabinet.depth;
        domElements.shelfCount.value = firstCabinet.shelfCount;
        domElements.craftsmanName.value = project.craftsman;
        domElements.clientName.value = project.client;
        domElements.projectDate.value = project.date;
        
        // Set cabinet type
        if (firstCabinet.type === 'wall') {
            document.getElementById('wallCabinet').checked = true;
        } else {
            document.getElementById('floorCabinet').checked = true;
        }
    }
    
    // Update UI
    updateResultsMetadata(project.craftsman, project.client, project.date);
    updateCabinetCount();
    renderTable();
    
    // Show results section
    domElements.resultsSection.style.display = 'block';
    
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
    domElements.cabinetWidth.value = 80.0;
    domElements.cabinetHeight.value = 120.0;
    domElements.cabinetDepth.value = 55.0;
    domElements.shelfCount.value = 2;
    document.getElementById('wallCabinet').checked = true;
    domElements.craftsmanName.value = '';
    domElements.clientName.value = '';
    setTodayDate();
    
    // Clear highlights
    removeHighlight(domElements.cabinetWidth);
    removeHighlight(domElements.cabinetHeight);
    removeHighlight(domElements.cabinetDepth);
    removeHighlight(domElements.shelfCount);
    
    showSuccess('فرم با موفقیت بازنشانی شد');
}

// Export Functions
function printTable() {
    if (AppState.cabinets.length === 0) {
        showError('لطفاً ابتدا حداقل یک کابینت به جدول اضافه کنید');
        return;
    }
    
    // Create a print-friendly version
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="fa">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>جدول ریزاندازه کابینت - Aqua Drawer LAB</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap');
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: 'Vazirmatn', sans-serif;
                }
                
                body {
                    padding: 20px;
                    color: #000;
                    line-height: 1.6;
                }
                
                .print-header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 3px solid #333;
                    padding-bottom: 20px;
                }
                
                .print-header h1 {
                    color: #2c3e50;
                    font-size: 24px;
                    margin-bottom: 10px;
                }
                
                .print-metadata {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                    padding: 15px;
                    background: #f5f5f5;
                    border-radius: 8px;
                }
                
                .metadata-item {
                    display: flex;
                    gap: 10px;
                }
                
                .metadata-label {
                    font-weight: bold;
                    color: #2c3e50;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                    font-size: 12px;
                }
                
                th, td {
                    border: 1px solid #333;
                    padding: 10px;
                    text-align: center;
                    vertical-align: middle;
                }
                
                th {
                    background-color: #ddd;
                    font-weight: bold;
                    color: #000;
                }
                
                tbody tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                
                .cabinet-header {
                    background-color: #e8f4fc !important;
                    font-weight: bold;
                }
                
                .cabinet-number {
                    background: #2c3e50;
                    color: white;
                    padding: 5px 10px;
                    border-radius: 4px;
                    display: inline-block;
                    margin-bottom: 10px;
                }
                
                .print-footer {
                    margin-top: 30px;
                    text-align: center;
                    color: #666;
                    font-size: 11px;
                    border-top: 1px solid #ddd;
                    padding-top: 15px;
                }
                
                @media print {
                    body {
                        padding: 0;
                    }
                    
                    .no-print {
                        display: none !important;
                    }
                    
                    table {
                        page-break-inside: auto;
                    }
                    
                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }
                }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1>جدول ریزاندازه جهت کات مستر</h1>
                <p>Aqua Drawer LAB - ابزار تخصصی تجزیه باکس کابینت</p>
            </div>
            
            <div class="print-metadata">
                <div class="metadata-item">
                    <span class="metadata-label">استادکار:</span>
                    <span>${domElements.resultCraftsman.textContent}</span>
                </div>
                <div class="metadata-item">
                    <span class="metadata-label">مشتری:</span>
                    <span>${domElements.resultClient.textContent}</span>
                </div>
                <div class="metadata-item">
                    <span class="metadata-label">تاریخ:</span>
                    <span>${domElements.resultDate.textContent}</span>
                </div>
                <div class="metadata-item">
                    <span class="metadata-label">تعداد کابینت‌ها:</span>
                    <span>${AppState.cabinets.length}</span>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th rowspan="2">نمای سه‌بعدی</th>
                        <th rowspan="2">شیار</th>
                        <th colspan="2">نوار PVC</th>
                        <th rowspan="2">نوع قطعه / توضیحات</th>
                        <th rowspan="2">تعداد</th>
                        <th colspan="2">ابعاد (سانتی‌متر)</th>
                        <th rowspan="2">شماره پیوست</th>
                    </tr>
                    <tr>
                        <th>عرض</th>
                        <th>طول</th>
                        <th>عرض</th>
                        <th>طول</th>
                    </tr>
                </thead>
                <tbody>
                    ${generatePrintTableRows()}
                </tbody>
            </table>
            
            <div class="print-footer">
                <p>تولید شده توسط Aqua Drawer LAB - ساخته شده توسط ممد</p>
                <p>تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')} - ساعت: ${new Date().toLocaleTimeString('fa-IR')}</p>
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() {
                        window.close();
                    }, 1000);
                };
            </script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}

function generatePrintTableRows() {
    let rows = '';
    let cabinetCounts = { wall: 0, floor: 0 };
    
    AppState.cabinets.forEach(cabinet => {
        cabinetCounts[cabinet.type]++;
        const cabinetNumber = cabinetCounts[cabinet.type];
        
        // Add cabinet header row
        rows += `
            <tr class="cabinet-header">
                <td rowspan="${cabinet.parts.length}">
                    <div class="cabinet-number">کابینت ${cabinet.typeName} ${cabinetNumber}</div>
                    <div>${cabinet.width} × ${cabinet.height} × ${cabinet.depth} سانتی‌متر</div>
                </td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>${cabinet.parts[0].description}</td>
                <td>${cabinet.parts[0].quantity}</td>
                <td>${cabinet.parts[0].width}</td>
                <td>${cabinet.parts[0].length}</td>
                <td>-</td>
            </tr>
        `;
        
        // Add remaining parts rows
        for (let i = 1; i < cabinet.parts.length; i++) {
            const part = cabinet.parts[i];
            rows += `
                <tr>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>${part.description}</td>
                    <td>${part.quantity}</td>
                    <td>${part.width}</td>
                    <td>${part.length}</td>
                    <td>-</td>
                </tr>
            `;
        }
    });
    
    return rows;
}

async function exportToPDF() {
    if (AppState.cabinets.length === 0) {
        showError('لطفاً ابتدا حداقل یک کابینت به جدول اضافه کنید');
        return;
    }
    
    try {
        // Show loading state
        const originalText = domElements.pdfBtn.innerHTML;
        domElements.pdfBtn.innerHTML = '<i class="mdi mdi-loading mdi-spin"></i> در حال تولید PDF...';
        domElements.pdfBtn.disabled = true;
        
        // Import jsPDF
        const { jsPDF } = window.jspdf;
        
        // Create PDF in landscape orientation
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });
        
        // Set metadata
        pdf.setProperties({
            title: 'جدول ریزاندازه کابینت',
            subject: 'Aqua Drawer LAB - جدول ریزاندازه جهت کات مستر',
            author: 'Aqua Drawer LAB',
            creator: 'By_zZzMohammadzZz'
        });
        
        // Add Persian font (using default font that supports RTL)
        pdf.setFont('helvetica');
        
        // Title
        pdf.setFontSize(20);
        pdf.text('جدول ریزاندازه جهت کات مستر', 148, 20, { align: 'center' });
        
        pdf.setFontSize(12);
        pdf.text('Aqua Drawer LAB - ابزار تخصصی تجزیه باکس کابینت', 148, 28, { align: 'center' });
        
        // Metadata
        pdf.setFontSize(10);
        const metadataY = 40;
        pdf.text(`استادکار: ${domElements.resultCraftsman.textContent}`, 20, metadataY);
        pdf.text(`مشتری: ${domElements.resultClient.textContent}`, 148, metadataY, { align: 'center' });
        pdf.text(`تاریخ: ${domElements.resultDate.textContent}`, 276, metadataY, { align: 'right' });
        pdf.text(`تعداد کابینت‌ها: ${AppState.cabinets.length}`, 20, metadataY + 8);
        
        // Create table data
        const headers = [
            ['نمای سه‌بعدی', 'شیار', 'نوار PVC عرض', 'نوار PVC طول', 'نوع قطعه', 'تعداد', 'ابعاد عرض', 'ابعاد طول', 'شماره پیوست']
        ];
        
        const tableData = [];
        
        // Group cabinets by type for numbering
        let cabinetCounts = { wall: 0, floor: 0 };
        
        AppState.cabinets.forEach(cabinet => {
            cabinetCounts[cabinet.type]++;
            const cabinetNumber = cabinetCounts[cabinet.type];
            
            cabinet.parts.forEach((part, index) => {
                const rowData = [
                    index === 0 ? `کابینت ${cabinet.typeName} ${cabinetNumber}\n${cabinet.width}×${cabinet.height}×${cabinet.depth}` : '',
                    '',
                    '',
                    '',
                    part.description,
                    part.quantity.toString(),
                    part.width.toString(),
                    part.length.toString(),
                    ''
                ];
                tableData.push(rowData);
            });
        });
        
        // Configure table options
        const tableConfig = {
            startY: 60,
            head: headers,
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [93, 64, 55], // Wood dark color
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 9,
                halign: 'center',
                valign: 'middle'
            },
            bodyStyles: {
                fontSize: 8,
                textColor: [44, 62, 80], // Primary color
                cellPadding: 3,
                halign: 'center',
                valign: 'middle'
            },
            columnStyles: {
                0: { cellWidth: 25, halign: 'right' }, // 3D View
                1: { cellWidth: 12 }, // Groove
                2: { cellWidth: 15 }, // PVC Width
                3: { cellWidth: 15 }, // PVC Length
                4: { cellWidth: 30, halign: 'right' }, // Description
                5: { cellWidth: 12 }, // Quantity
                6: { cellWidth: 15 }, // Dimensions Width
                7: { cellWidth: 15 }, // Dimensions Length
                8: { cellWidth: 20 } // Attachment
            },
            margin: { left: 10, right: 10 },
            didDrawPage: function(data) {
                // Footer
                pdf.setFontSize(8);
                pdf.setTextColor(128, 128, 128);
                pdf.text('تولید شده توسط Aqua Drawer LAB - ساخته شده توسط ممد', 148, 200, { align: 'center' });
                pdf.text(`صفحه ${pdf.internal.getNumberOfPages()}`, 290, 200, { align: 'right' });
            }
        };
        
        // Generate table
        pdf.autoTable(tableConfig);
        
        // Save PDF
        const fileName = `جدول-ریزاندازه-${new Date().getTime()}.pdf`;
        pdf.save(fileName);
        
        // Restore button state
        domElements.pdfBtn.innerHTML = originalText;
        domElements.pdfBtn.disabled = false;
        
        showSuccess('PDF با موفقیت تولید و ذخیره شد');
        
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
        background: linear-gradient(135deg, #27ae60, #229954);
        color: white;
        padding: 16px 20px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        box-shadow: 0 8px 32px rgba(39, 174, 96, 0.3);
        animation: slideIn 0.3s ease;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
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
    domElements.calculateBtn.addEventListener('click', generateCabinetTable);
    domElements.addToTableBtn.addEventListener('click', addToTable);
    domElements.resetBtn.addEventListener('click', resetForm);
    domElements.clearTableBtn.addEventListener('click', clearTable);
    domElements.printBtn.addEventListener('click', printTable);
    domElements.pdfBtn.addEventListener('click', exportToPDF);
    domElements.saveProjectBtn.addEventListener('click', saveProject);
    
    // Update form validation on input
    const formInputs = [
        domElements.cabinetWidth,
        domElements.cabinetHeight,
        domElements.cabinetDepth,
        domElements.shelfCount
    ];
    
    formInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Remove error highlight when user starts typing
            removeHighlight(this);
        });
    });
    
    // Real-time cabinet type change
    domElements.cabinetType.forEach(radio => {
        radio.addEventListener('change', function() {
            const isWallCabinet = this.value === 'wall';
            const shelfInput = domElements.shelfCount;
            
            // Update hint based on cabinet type
            if (!isWallCabinet) {
                // Floor cabinet - max 1 shelf
                if (parseInt(shelfInput.value) > 1) {
                    shelfInput.value = 1;
                }
                shelfInput.max = 1;
                shelfInput.parentElement.querySelector('.hint').textContent = '(فقط ۰ یا ۱ طبقه برای کابینت زمینی)';
            } else {
                // Wall cabinet - up to 20 shelves
                shelfInput.max = 20;
                shelfInput.parentElement.querySelector('.hint').textContent = '(۰ تا ۲۰ طبقه)';
            }
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to calculate
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            generateCabinetTable();
        }
        
        // Ctrl/Cmd + A to add to table
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            e.preventDefault();
            addToTable();
        }
        
        // Escape to close sidebar
        if (e.key === 'Escape' && AppState.isSidebarOpen) {
            AppState.isSidebarOpen = false;
            domElements.sidebar.classList.remove('active');
        }
    });
    
    // Prevent form submission on Enter key in inputs
    document.querySelectorAll('input[type="number"], input[type="text"]').forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                // Focus on next input or calculate
                const form = input.closest('form') || input.closest('.form-grid');
                const inputs = form ? Array.from(form.querySelectorAll('input')) : [];
                const currentIndex = inputs.indexOf(input);
                
                if (currentIndex < inputs.length - 1) {
                    inputs[currentIndex + 1].focus();
                } else {
                    generateCabinetTable();
                }
            }
        });
    });
    
    // Auto-update date when it's empty
    domElements.projectDate.addEventListener('focus', function() {
        if (!this.value.trim()) {
            this.value = convertToPersianDate(new Date());
        }
    });
    
    console.log('All event listeners set up successfully');
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);