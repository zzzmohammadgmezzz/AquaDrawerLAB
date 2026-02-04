// Aqua Drawer LAB - Cabinet Cutting Calculator
// Version 2.0 - Complete Rewrite with New Features
// By_zZzMohammadzZz

// Application State Management
const AppState = {
    currentTheme: 'light',
    cabinets: [],
    savedProjects: [],
    isSidebarOpen: false,
    currentCabinetId: 1,
    isScrolling: false,
    lastScrollTop: 0,
    headerVisible: true,
    toastTimeout: null,
    isCalculating: false,
    customRows: []
};

// DOM Elements Cache
const DOM = {
    // Theme & Layout
    themeToggle: document.getElementById('themeToggle'),
    themeIcon: document.getElementById('themeIcon'),
    menuToggle: document.getElementById('menuToggle'),
    closeSidebar: document.getElementById('closeSidebar'),
    sidebar: document.getElementById('sidebar'),
    mainHeader: document.getElementById('mainHeader'),
    scrollTopBtn: document.getElementById('scrollTopBtn'),
    
    // Form Elements
    cabinetWidth: document.getElementById('cabinetWidth'),
    cabinetHeight: document.getElementById('cabinetHeight'),
    cabinetDepth: document.getElementById('cabinetDepth'),
    shelfCount: document.getElementById('shelfCount'),
    stretcherQuantity: document.getElementById('stretcherQuantity'),
    stretcherHeight: document.getElementById('stretcherHeight'),
    cabinetTypeRadios: document.querySelectorAll('input[name="cabinetType"]'),
    craftsmanName: document.getElementById('craftsmanName'),
    clientName: document.getElementById('clientName'),
    projectDate: document.getElementById('projectDate'),
    
    // Hints
    widthHint: document.getElementById('widthHint'),
    heightHint: document.getElementById('heightHint'),
    shelfHint: document.getElementById('shelfHint'),
    
    // Buttons
    calculateBtn: document.getElementById('calculateBtn'),
    addToTableBtn: document.getElementById('addToTableBtn'),
    clearTableBtn: document.getElementById('clearTableBtn'),
    printBtn: document.getElementById('printBtn'),
    pdfBtn: document.getElementById('pdfBtn'),
    saveProjectBtn: document.getElementById('saveProjectBtn'),
    preview3DBtn: document.getElementById('preview3DBtn'),
    exportExcelBtn: document.getElementById('exportExcelBtn'),
    addCustomRowBtn: document.getElementById('addCustomRowBtn'),
    
    // Quick Actions
    quickBtns: document.querySelectorAll('.quick-btn'),
    
    // Table Elements
    tableBody: document.getElementById('tableBody'),
    tableSearch: document.getElementById('tableSearch'),
    
    // Results Display
    resultCraftsman: document.getElementById('resultCraftsman'),
    resultClient: document.getElementById('resultClient'),
    resultDate: document.getElementById('resultDate'),
    resultsSubtitle: document.getElementById('resultsSubtitle'),
    cabinetCount: document.getElementById('cabinetCount'),
    totalParts: document.getElementById('totalParts'),
    totalArea: document.getElementById('totalArea'),
    
    // Modal
    preview3DModal: document.getElementById('preview3DModal'),
    preview3DSVG: document.getElementById('preview3DSVG'),
    closeModal: document.querySelector('.close-modal'),
    previewWidth: document.getElementById('previewWidth'),
    previewHeight: document.getElementById('previewHeight'),
    previewDepth: document.getElementById('previewDepth'),
    previewShelves: document.getElementById('previewShelves'),
    previewStretchers: document.getElementById('previewStretchers'),
    
    // Projects
    projectsList: document.getElementById('projectsList'),
    
    // Formulas
    aerialFormulas: document.getElementById('aerialFormulas'),
    groundFormulas: document.getElementById('groundFormulas')
};

// Constants
const CONSTANTS = {
    BOARD_THICKNESS: 1.6,
    PVC_EDGE_THICKNESS: 0.2,
    DEFAULT_AERIAL: { width: 41, height: 97, depth: 35, shelves: 2, stretcherQty: 0, stretcherHeight: 12 },
    DEFAULT_GROUND: { width: 49, height: 77.1, depth: 55, shelves: 1, stretcherQty: 2, stretcherHeight: 12 },
    MIN_DIMENSIONS: { width: 30, height: 30, depth: 30 },
    MAX_DIMENSIONS: { width: 200, height: 300, depth: 100 },
    MAX_SHELVES: { aerial: 20, ground: 1 },
    BACK_PANEL_OFFSET_AERIAL: 1.6,
    BACK_PANEL_OFFSET_GROUND: 0.9
};

// Initialize Application
function init() {
    console.log('🚀 Aqua Drawer LAB v2.0 Initializing...');
    
    // Load saved state
    loadSavedState();
    
    // Set up UI
    setupUI();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initial calculations
    updateFormulasDisplay();
    updateCabinetCount();
    
    console.log('✅ Aqua Drawer LAB Ready!');
}

// Load Saved State
function loadSavedState() {
    // Load theme
    const savedTheme = localStorage.getItem('aquaDrawerTheme');
    AppState.currentTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme();
    
    // Load saved projects
    const savedProjects = localStorage.getItem('aquaDrawerProjects');
    if (savedProjects) {
        try {
            AppState.savedProjects = JSON.parse(savedProjects);
            renderProjectsList();
        } catch (e) {
            console.error('Error loading saved projects:', e);
        }
    }
    
    // Set current date
    setCurrentDate();
    
    // Load last used values
    loadLastValues();
}

// Setup UI
function setupUI() {
    // Update cabinet type display
    updateCabinetTypeUI();
    
    // Setup scroll top button
    updateScrollTopButton();
    
    // Setup formulas display
    updateFormulasDisplay();
}

// Setup Event Listeners
function setupEventListeners() {
    // Theme toggle
    DOM.themeToggle.addEventListener('click', toggleTheme);
    
    // Sidebar toggle
    DOM.menuToggle.addEventListener('click', toggleSidebar);
    DOM.closeSidebar.addEventListener('click', closeSidebar);
    
    // Close sidebar on outside click
    document.addEventListener('click', (e) => {
        if (AppState.isSidebarOpen && 
            !DOM.sidebar.contains(e.target) && 
            !DOM.menuToggle.contains(e.target)) {
            closeSidebar();
        }
    });
    
    // Cabinet type change
    DOM.cabinetTypeRadios.forEach(radio => {
        radio.addEventListener('change', handleCabinetTypeChange);
    });
    
    // Form inputs validation
    DOM.cabinetWidth.addEventListener('input', validateDimensions);
    DOM.cabinetHeight.addEventListener('input', validateDimensions);
    DOM.cabinetDepth.addEventListener('input', validateDimensions);
    DOM.shelfCount.addEventListener('input', validateShelves);
    DOM.stretcherQuantity.addEventListener('input', validateStretcherQuantity);
    DOM.stretcherHeight.addEventListener('input', validateStretcherHeight);
    
    // Quick actions
    DOM.quickBtns.forEach(btn => {
        btn.addEventListener('click', handleQuickAction);
    });
    
    // Main buttons
    DOM.calculateBtn.addEventListener('click', calculateAndShow);
    DOM.addToTableBtn.addEventListener('click', addToTable);
    DOM.clearTableBtn.addEventListener('click', clearTable);
    DOM.printBtn.addEventListener('click', printTable);
    DOM.pdfBtn.addEventListener('click', exportToPDF);
    DOM.saveProjectBtn.addEventListener('click', saveProject);
    DOM.preview3DBtn.addEventListener('click', show3DPreview);
    DOM.exportExcelBtn.addEventListener('click', exportToExcel);
    DOM.addCustomRowBtn.addEventListener('click', addCustomRow);
    
    // Modal
    DOM.closeModal.addEventListener('click', hide3DPreview);
    DOM.preview3DModal.addEventListener('click', (e) => {
        if (e.target === DOM.preview3DModal) hide3DPreview();
    });
    
    // Table search
    DOM.tableSearch.addEventListener('input', filterTable);
    
    // Scroll events for header auto-hide
    window.addEventListener('scroll', handleScroll);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Form auto-save
    setupAutoSave();
    
    // Window resize
    window.addEventListener('resize', handleResize);
}

// Theme Management
function applyTheme() {
    document.documentElement.setAttribute('data-theme', AppState.currentTheme);
    localStorage.setItem('aquaDrawerTheme', AppState.currentTheme);
    
    // Update icon
    const icon = DOM.themeIcon;
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
    showToast('تم تغییر کرد', `حالت ${AppState.currentTheme === 'dark' ? 'تاریک' : 'روشن'}`, 'success');
}

// Sidebar Management
function toggleSidebar() {
    AppState.isSidebarOpen = !AppState.isSidebarOpen;
    DOM.sidebar.classList.toggle('active', AppState.isSidebarOpen);
}

function closeSidebar() {
    AppState.isSidebarOpen = false;
    DOM.sidebar.classList.remove('active');
}

// Cabinet Type Handling
function handleCabinetTypeChange() {
    const isAerial = document.querySelector('input[name="cabinetType"]:checked').value === 'aerial';
    
    // Update UI
    updateCabinetTypeUI();
    
    // Update default values
    if (isAerial) {
        DOM.cabinetWidth.value = CONSTANTS.DEFAULT_AERIAL.width;
        DOM.cabinetHeight.value = CONSTANTS.DEFAULT_AERIAL.height;
        DOM.cabinetDepth.value = CONSTANTS.DEFAULT_AERIAL.depth;
        DOM.shelfCount.value = CONSTANTS.DEFAULT_AERIAL.shelves;
        DOM.stretcherQuantity.value = CONSTANTS.DEFAULT_AERIAL.stretcherQty;
        DOM.stretcherHeight.value = CONSTANTS.DEFAULT_AERIAL.stretcherHeight;
        DOM.shelfHint.textContent = `(۰ تا ${CONSTANTS.MAX_SHELVES.aerial} طبقه)`;
    } else {
        DOM.cabinetWidth.value = CONSTANTS.DEFAULT_GROUND.width;
        DOM.cabinetHeight.value = CONSTANTS.DEFAULT_GROUND.height;
        DOM.cabinetDepth.value = CONSTANTS.DEFAULT_GROUND.depth;
        DOM.shelfCount.value = CONSTANTS.DEFAULT_GROUND.shelves;
        DOM.stretcherQuantity.value = CONSTANTS.DEFAULT_GROUND.stretcherQty;
        DOM.stretcherHeight.value = CONSTANTS.DEFAULT_GROUND.stretcherHeight;
        DOM.shelfHint.textContent = `(فقط ۰ یا ${CONSTANTS.MAX_SHELVES.ground} طبقه)`;
    }
    
    // Update formulas display
    updateFormulasDisplay();
    
    showToast('نوع کابینت تغییر کرد', `کابینت ${isAerial ? 'دیواری' : 'زمینی'} انتخاب شد`, 'info');
}

function updateCabinetTypeUI() {
    const isAerial = document.querySelector('input[name="cabinetType"]:checked').value === 'aerial';
    
    // Update shelf hint
    DOM.shelfHint.textContent = isAerial ? 
        `(۰ تا ${CONSTANTS.MAX_SHELVES.aerial} طبقه)` : 
        `(فقط ۰ یا ${CONSTANTS.MAX_SHELVES.ground} طبقه)`;
}

// Date Handling
function setCurrentDate() {
    const now = new Date();
    const persianDate = convertToPersianDate(now);
    DOM.projectDate.value = persianDate;
}

function convertToPersianDate(date) {
    // Simple Persian date conversion
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        calendar: 'persian',
        numberingSystem: 'arab'
    };
    
    return new Intl.DateTimeFormat('fa-IR', options).format(date);
}

// Form Validation
function validateDimensions() {
    const width = parseFloat(DOM.cabinetWidth.value);
    const height = parseFloat(DOM.cabinetHeight.value);
    const depth = parseFloat(DOM.cabinetDepth.value);
    
    let isValid = true;
    
    if (width < CONSTANTS.MIN_DIMENSIONS.width || width > CONSTANTS.MAX_DIMENSIONS.width) {
        highlightInvalid(DOM.cabinetWidth);
        isValid = false;
    } else {
        removeHighlight(DOM.cabinetWidth);
    }
    
    if (height < CONSTANTS.MIN_DIMENSIONS.height || height > CONSTANTS.MAX_DIMENSIONS.height) {
        highlightInvalid(DOM.cabinetHeight);
        isValid = false;
    } else {
        removeHighlight(DOM.cabinetHeight);
    }
    
    if (depth < CONSTANTS.MIN_DIMENSIONS.depth || depth > CONSTANTS.MAX_DIMENSIONS.depth) {
        highlightInvalid(DOM.cabinetDepth);
        isValid = false;
    } else {
        removeHighlight(DOM.cabinetDepth);
    }
    
    return isValid;
}

function validateShelves() {
    const isAerial = document.querySelector('input[name="cabinetType"]:checked').value === 'aerial';
    const shelves = parseInt(DOM.shelfCount.value);
    const maxShelves = isAerial ? CONSTANTS.MAX_SHELVES.aerial : CONSTANTS.MAX_SHELVES.ground;
    
    if (shelves < 0 || shelves > maxShelves) {
        highlightInvalid(DOM.shelfCount);
        return false;
    } else {
        removeHighlight(DOM.shelfCount);
        return true;
    }
}

function validateStretcherQuantity() {
    const quantity = parseInt(DOM.stretcherQuantity.value);
    
    if (quantity < 0 || quantity > 10) {
        highlightInvalid(DOM.stretcherQuantity);
        return false;
    } else {
        removeHighlight(DOM.stretcherQuantity);
        return true;
    }
}

function validateStretcherHeight() {
    const height = parseFloat(DOM.stretcherHeight.value);
    
    if (height < 8 || height > 20) {
        highlightInvalid(DOM.stretcherHeight);
        return false;
    } else {
        removeHighlight(DOM.stretcherHeight);
        return true;
    }
}

function highlightInvalid(element) {
    element.parentElement.style.borderColor = 'var(--accent-color)';
    element.parentElement.style.boxShadow = '0 0 0 4px rgba(231, 76, 60, 0.2)';
}

function removeHighlight(element) {
    element.parentElement.style.borderColor = '';
    element.parentElement.style.boxShadow = '';
}

// Quick Actions
function handleQuickAction(e) {
    const action = e.currentTarget.dataset.action;
    
    switch(action) {
        case 'reset':
            resetForm();
            break;
        case 'loadDefaults':
            loadDefaults();
            break;
        case 'swapDimensions':
            swapDimensions();
            break;
    }
}

function resetForm() {
    const isAerial = document.querySelector('input[name="cabinetType"]:checked').value === 'aerial';
    
    if (isAerial) {
        DOM.cabinetWidth.value = '';
        DOM.cabinetHeight.value = '';
        DOM.cabinetDepth.value = '';
        DOM.shelfCount.value = '2';
        DOM.stretcherQuantity.value = '0';
        DOM.stretcherHeight.value = '12';
    } else {
        DOM.cabinetWidth.value = '';
        DOM.cabinetHeight.value = '';
        DOM.cabinetDepth.value = '';
        DOM.shelfCount.value = '1';
        DOM.stretcherQuantity.value = '2';
        DOM.stretcherHeight.value = '12';
    }
    
    DOM.craftsmanName.value = '';
    DOM.clientName.value = '';
    setCurrentDate();
    
    // Reset highlights
    removeHighlight(DOM.cabinetWidth);
    removeHighlight(DOM.cabinetHeight);
    removeHighlight(DOM.cabinetDepth);
    removeHighlight(DOM.shelfCount);
    removeHighlight(DOM.stretcherQuantity);
    removeHighlight(DOM.stretcherHeight);
    
    showToast('فرم بازنشانی شد', 'همه مقادیر به حالت اولیه بازگشتند', 'info');
}

function loadDefaults() {
    const isAerial = document.querySelector('input[name="cabinetType"]:checked').value === 'aerial';
    
    if (isAerial) {
        DOM.cabinetWidth.value = CONSTANTS.DEFAULT_AERIAL.width;
        DOM.cabinetHeight.value = CONSTANTS.DEFAULT_AERIAL.height;
        DOM.cabinetDepth.value = CONSTANTS.DEFAULT_AERIAL.depth;
        DOM.shelfCount.value = CONSTANTS.DEFAULT_AERIAL.shelves;
        DOM.stretcherQuantity.value = CONSTANTS.DEFAULT_AERIAL.stretcherQty;
        DOM.stretcherHeight.value = CONSTANTS.DEFAULT_AERIAL.stretcherHeight;
    } else {
        DOM.cabinetWidth.value = CONSTANTS.DEFAULT_GROUND.width;
        DOM.cabinetHeight.value = CONSTANTS.DEFAULT_GROUND.height;
        DOM.cabinetDepth.value = CONSTANTS.DEFAULT_GROUND.depth;
        DOM.shelfCount.value = CONSTANTS.DEFAULT_GROUND.shelves;
        DOM.stretcherQuantity.value = CONSTANTS.DEFAULT_GROUND.stretcherQty;
        DOM.stretcherHeight.value = CONSTANTS.DEFAULT_GROUND.stretcherHeight;
    }
    
    showToast('مقادیر پیش‌فرض بارگذاری شد', 'ابعاد استاندارد کابینت اعمال شد', 'success');
}

function swapDimensions() {
    const width = DOM.cabinetWidth.value;
    const height = DOM.cabinetHeight.value;
    
    DOM.cabinetWidth.value = height;
    DOM.cabinetHeight.value = width;
    
    showToast('ابعاد جابجا شد', 'عرض و ارتفاع با هم عوض شدند', 'info');
}

// Cabinet Calculations
function calculateCabinetParts() {
    const isAerial = document.querySelector('input[name="cabinetType"]:checked').value === 'aerial';
    const width = parseFloat(DOM.cabinetWidth.value);
    const height = parseFloat(DOM.cabinetHeight.value);
    const depth = parseFloat(DOM.cabinetDepth.value);
    const shelves = parseInt(DOM.shelfCount.value);
    const stretcherQty = parseInt(DOM.stretcherQuantity.value);
    const stretcherHeight = parseFloat(DOM.stretcherHeight.value);
    
    const parts = [];
    
    if (isAerial) {
        // Aerial Cabinet Parts
        // Body (2 pieces)
        parts.push({
            id: `body_${Date.now()}`,
            description: 'بدنه',
            quantity: 2,
            width: depth,
            height: height,
            groove: true,
            pvc: 'both',
            notes: ''
        });
        
        // Top and Bottom (2 pieces)
        parts.push({
            id: `top_bottom_${Date.now()}`,
            description: 'سقف و کف',
            quantity: 2,
            width: depth,
            height: (width - CONSTANTS.BOARD_THICKNESS * 2).toFixed(1),
            groove: false,
            pvc: 'both',
            notes: ''
        });
        
        // Shelves
        for (let i = 1; i <= shelves; i++) {
            parts.push({
                id: `shelf_${i}_${Date.now()}`,
                description: `طبقه ${i}`,
                quantity: 1,
                width: depth - 2,
                height: (width - CONSTANTS.BOARD_THICKNESS * 2).toFixed(1),
                groove: false,
                pvc: 'front',
                notes: ''
            });
        }
        
        // Stretchers (if any)
        if (stretcherQty > 0) {
            parts.push({
                id: `stretcher_${Date.now()}`,
                description: 'تیرک',
                quantity: stretcherQty,
                width: (width - CONSTANTS.BOARD_THICKNESS * 2).toFixed(1),
                height: stretcherHeight,
                groove: false,
                pvc: 'both',
                notes: ''
            });
        }
        
        // Back panel (سه میل) - Fixed calculation
        parts.push({
            id: `back_panel_${Date.now()}`,
            description: 'سه میل',
            quantity: 1,
            width: (width - CONSTANTS.BOARD_THICKNESS).toFixed(1),
            height: (height - CONSTANTS.BACK_PANEL_OFFSET_AERIAL).toFixed(1),
            groove: false,
            pvc: 'none',
            notes: 'ضخامت ۳ میلی‌متر'
        });
        
    } else {
        // Ground Cabinet Parts
        // Body (2 pieces)
        parts.push({
            id: `body_${Date.now()}`,
            description: 'بدنه',
            quantity: 2,
            width: depth,
            height: (height - CONSTANTS.BOARD_THICKNESS).toFixed(1),
            groove: true,
            pvc: 'both',
            notes: ''
        });
        
        // Bottom (1 piece)
        parts.push({
            id: `bottom_${Date.now()}`,
            description: 'کف',
            quantity: 1,
            width: depth,
            height: width.toFixed(1),
            groove: false,
            pvc: 'both',
            notes: ''
        });
        
        // Stretchers
        if (stretcherQty > 0) {
            parts.push({
                id: `stretcher_${Date.now()}`,
                description: 'تیرک',
                quantity: stretcherQty,
                width: (width - CONSTANTS.BOARD_THICKNESS * 2).toFixed(1),
                height: stretcherHeight,
                groove: false,
                pvc: 'both',
                notes: ''
            });
        }
        
        // Shelf (if any)
        if (shelves > 0) {
            parts.push({
                id: `shelf_${Date.now()}`,
                description: 'طبقه',
                quantity: 1,
                width: depth - 2,
                height: (width - CONSTANTS.BOARD_THICKNESS * 2).toFixed(1),
                groove: false,
                pvc: 'front',
                notes: ''
            });
        }
        
        // Back panel (سه میل) - Fixed calculation
        parts.push({
            id: `back_panel_${Date.now()}`,
            description: 'سه میل',
            quantity: 1,
            width: (width - CONSTANTS.BOARD_THICKNESS).toFixed(1),
            height: (height - CONSTANTS.BACK_PANEL_OFFSET_GROUND).toFixed(1),
            groove: false,
            pvc: 'none',
            notes: 'ضخامت ۳ میلی‌متر'
        });
    }
    
    return parts;
}

// 3D Preview Functions
function show3DPreview() {
    if (!validateDimensions() || !validateShelves() || !validateStretcherQuantity() || !validateStretcherHeight()) {
        showToast('خطا در ابعاد', 'لطفاً ابعاد معتبر وارد کنید', 'error');
        return;
    }
    
    // Update preview values
    DOM.previewWidth.textContent = DOM.cabinetWidth.value;
    DOM.previewHeight.textContent = DOM.cabinetHeight.value;
    DOM.previewDepth.textContent = DOM.cabinetDepth.value;
    DOM.previewShelves.textContent = DOM.shelfCount.value;
    DOM.previewStretchers.textContent = DOM.stretcherQuantity.value;
    
    // Generate SVG
    generate3DSVG();
    
    // Show modal
    DOM.preview3DModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hide3DPreview() {
    DOM.preview3DModal.classList.remove('active');
    document.body.style.overflow = '';
}

function generate3DSVG() {
    const isAerial = document.querySelector('input[name="cabinetType"]:checked').value === 'aerial';
    const width = parseFloat(DOM.cabinetWidth.value);
    const height = parseFloat(DOM.cabinetHeight.value);
    const depth = parseFloat(DOM.cabinetDepth.value);
    const shelves = parseInt(DOM.shelfCount.value);
    const stretcherQty = parseInt(DOM.stretcherQuantity.value);
    
    // Clear previous SVG
    DOM.preview3DSVG.innerHTML = '';
    
    // Create SVG element
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 400 300");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    
    // Colors based on theme - High contrast for dark mode
    const strokeColor = AppState.currentTheme === 'dark' ? '#ecf0f1' : '#2c3e50';
    const fillColor = AppState.currentTheme === 'dark' ? '#34495e' : '#f8f9fa';
    const accentColor = '#e74c3c';
    const woodColor = AppState.currentTheme === 'dark' ? '#c19a6b' : '#8b4513';
    const textColor = AppState.currentTheme === 'dark' ? '#ecf0f1' : '#2c3e50';
    
    // Main cabinet rectangle (front view)
    const frontRect = document.createElementNS(svgNS, "rect");
    frontRect.setAttribute("x", "50");
    frontRect.setAttribute("y", "50");
    frontRect.setAttribute("width", "200");
    frontRect.setAttribute("height", "200");
    frontRect.setAttribute("fill", fillColor);
    frontRect.setAttribute("stroke", strokeColor);
    frontRect.setAttribute("stroke-width", "3");
    frontRect.setAttribute("rx", "5");
    svg.appendChild(frontRect);
    
    // Depth representation (perspective lines)
    const depthLine1 = document.createElementNS(svgNS, "line");
    depthLine1.setAttribute("x1", "250");
    depthLine1.setAttribute("y1", "50");
    depthLine1.setAttribute("x2", "300");
    depthLine1.setAttribute("y2", "30");
    depthLine1.setAttribute("stroke", woodColor);
    depthLine1.setAttribute("stroke-width", "2");
    depthLine1.setAttribute("stroke-dasharray", "5,5");
    svg.appendChild(depthLine1);
    
    const depthLine2 = document.createElementNS(svgNS, "line");
    depthLine2.setAttribute("x1", "250");
    depthLine2.setAttribute("y1", "250");
    depthLine2.setAttribute("x2", "300");
    depthLine2.setAttribute("y2", "230");
    depthLine2.setAttribute("stroke", woodColor);
    depthLine2.setAttribute("stroke-width", "2");
    depthLine2.setAttribute("stroke-dasharray", "5,5");
    svg.appendChild(depthLine2);
    
    // Shelves (dashed lines)
    if (shelves > 0) {
        const shelfSpacing = 200 / (shelves + 1);
        for (let i = 1; i <= shelves; i++) {
            const shelfY = 50 + (shelfSpacing * i);
            const shelf = document.createElementNS(svgNS, "line");
            shelf.setAttribute("x1", "50");
            shelf.setAttribute("y1", shelfY);
            shelf.setAttribute("x2", "250");
            shelf.setAttribute("y2", shelfY);
            shelf.setAttribute("stroke", accentColor);
            shelf.setAttribute("stroke-width", "2");
            shelf.setAttribute("stroke-dasharray", "8,4");
            svg.appendChild(shelf);
        }
    }
    
    // Stretcher representation (if any)
    if (stretcherQty > 0) {
        for (let i = 1; i <= Math.min(stretcherQty, 3); i++) {
            const stretcherY = 50 + (i * 40);
            const stretcher = document.createElementNS(svgNS, "rect");
            stretcher.setAttribute("x", "60");
            stretcher.setAttribute("y", stretcherY);
            stretcher.setAttribute("width", "180");
            stretcher.setAttribute("height", "8");
            stretcher.setAttribute("fill", woodColor);
            stretcher.setAttribute("stroke", strokeColor);
            stretcher.setAttribute("stroke-width", "1");
            stretcher.setAttribute("rx", "2");
            svg.appendChild(stretcher);
        }
    }
    
    // Dimension labels with high contrast
    const addDimensionLabel = (text, x1, y1, x2, y2, offsetX = 0, offsetY = 0) => {
        // Line
        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke", textColor);
        line.setAttribute("stroke-width", "1");
        line.setAttribute("stroke-dasharray", "3,3");
        svg.appendChild(line);
        
        // Arrow heads
        const arrow1 = document.createElementNS(svgNS, "polygon");
        arrow1.setAttribute("points", `${x1},${y1} ${x1-5},${y1-5} ${x1+5},${y1-5}`);
        arrow1.setAttribute("fill", textColor);
        svg.appendChild(arrow1);
        
        const arrow2 = document.createElementNS(svgNS, "polygon");
        arrow2.setAttribute("points", `${x2},${y2} ${x2-5},${y2-5} ${x2+5},${y2-5}`);
        arrow2.setAttribute("fill", textColor);
        svg.appendChild(arrow2);
        
        // Text with background for better contrast
        const textBg = document.createElementNS(svgNS, "rect");
        textBg.setAttribute("x", (x1 + x2) / 2 + offsetX - 35);
        textBg.setAttribute("y", (y1 + y2) / 2 + offsetY - 12);
        textBg.setAttribute("width", "70");
        textBg.setAttribute("height", "24");
        textBg.setAttribute("fill", AppState.currentTheme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)');
        textBg.setAttribute("rx", "4");
        svg.appendChild(textBg);
        
        const textEl = document.createElementNS(svgNS, "text");
        textEl.setAttribute("x", (x1 + x2) / 2 + offsetX);
        textEl.setAttribute("y", (y1 + y2) / 2 + offsetY);
        textEl.setAttribute("text-anchor", "middle");
        textEl.setAttribute("dominant-baseline", "middle");
        textEl.setAttribute("fill", textColor);
        textEl.setAttribute("font-size", "14");
        textEl.setAttribute("font-weight", "bold");
        textEl.textContent = text;
        svg.appendChild(textEl);
    };
    
    // Width dimension
    addDimensionLabel(`${width}cm`, 50, 30, 250, 30, 0, -20);
    
    // Height dimension
    addDimensionLabel(`${height}cm`, 30, 50, 30, 250, -20, 0);
    
    // Depth dimension
    addDimensionLabel(`${depth}cm`, 250, 50, 300, 30, 10, -10);
    
    // Cabinet type indicator
    const typeText = document.createElementNS(svgNS, "text");
    typeText.setAttribute("x", "150");
    typeText.setAttribute("y", "280");
    typeText.setAttribute("text-anchor", "middle");
    typeText.setAttribute("fill", accentColor);
    typeText.setAttribute("font-size", "16");
    typeText.setAttribute("font-weight", "bold");
    typeText.setAttribute("style", "font-family: 'Vazirmatn', sans-serif;");
    typeText.textContent = isAerial ? "کابینت دیواری (باکس هوایی)" : "کابینت زمینی (باکس زمینی)";
    svg.appendChild(typeText);
    
    DOM.preview3DSVG.appendChild(svg);
}

// Table Management
function calculateAndShow() {
    if (!validateDimensions() || !validateShelves() || !validateStretcherQuantity() || !validateStretcherHeight()) {
        showToast('خطا در اعتبارسنجی', 'لطفاً تمام فیلدها را به درستی پر کنید', 'error');
        return;
    }
    
    const cabinet = createCabinetObject();
    AppState.cabinets = [cabinet];
    updateResultsDisplay();
    renderTable();
    
    showToast('محاسبه انجام شد', 'کابینت با موفقیت محاسبه شد', 'success');
}

function addToTable() {
    if (!validateDimensions() || !validateShelves() || !validateStretcherQuantity() || !validateStretcherHeight()) {
        showToast('خطا در اعتبارسنجی', 'لطفاً تمام فیلدها را به درستی پر کنید', 'error');
        return;
    }
    
    const cabinet = createCabinetObject();
    AppState.cabinets.push(cabinet);
    updateResultsDisplay();
    renderTable();
    
    showToast('کابینت اضافه شد', 'کابینت جدید به جدول اضافه شد', 'success');
}

function createCabinetObject() {
    const isAerial = document.querySelector('input[name="cabinetType"]:checked').value === 'aerial';
    const width = parseFloat(DOM.cabinetWidth.value);
    const height = parseFloat(DOM.cabinetHeight.value);
    const depth = parseFloat(DOM.cabinetDepth.value);
    const shelves = parseInt(DOM.shelfCount.value);
    const stretcherQty = parseInt(DOM.stretcherQuantity.value);
    const stretcherHeight = parseFloat(DOM.stretcherHeight.value);
    const craftsman = DOM.craftsmanName.value || 'تعیین نشده';
    const client = DOM.clientName.value || 'تعیین نشده';
    const date = DOM.projectDate.value || convertToPersianDate(new Date());
    
    return {
        id: AppState.currentCabinetId++,
        type: isAerial ? 'aerial' : 'ground',
        typeName: isAerial ? 'دیواری' : 'زمینی',
        width,
        height,
        depth,
        shelves,
        stretcherQty,
        stretcherHeight,
        parts: calculateCabinetParts(),
        craftsman,
        client,
        date,
        timestamp: Date.now(),
        number: AppState.cabinets.length + 1
    };
}

function updateResultsDisplay() {
    if (AppState.cabinets.length === 0) {
        DOM.resultCraftsman.textContent = 'تعیین نشده';
        DOM.resultClient.textContent = 'تعیین نشده';
        DOM.resultDate.textContent = '-';
        DOM.cabinetCount.textContent = '0';
        DOM.resultsSubtitle.textContent = 'لیست تمام کابینت‌های محاسبه شده';
        DOM.totalParts.textContent = '0';
        DOM.totalArea.textContent = '0';
        return;
    }
    
    const lastCabinet = AppState.cabinets[AppState.cabinets.length - 1];
    
    DOM.resultCraftsman.textContent = lastCabinet.craftsman;
    DOM.resultClient.textContent = lastCabinet.client;
    DOM.resultDate.textContent = lastCabinet.date;
    DOM.cabinetCount.textContent = AppState.cabinets.length;
    DOM.resultsSubtitle.textContent = `لیست ${AppState.cabinets.length} کابینت محاسبه شده`;
    
    // Calculate totals
    let totalParts = 0;
    let totalArea = 0;
    
    AppState.cabinets.forEach(cabinet => {
        cabinet.parts.forEach(part => {
            totalParts += part.quantity;
            totalArea += (part.width * part.height * part.quantity) / 10000; // Convert to m²
        });
    });
    
    // Add custom rows
    AppState.customRows.forEach(row => {
        totalParts += row.quantity;
        totalArea += (row.width * row.height * row.quantity) / 10000;
    });
    
    DOM.totalParts.textContent = totalParts;
    DOM.totalArea.textContent = totalArea.toFixed(2);
}

function renderTable() {
    if (AppState.cabinets.length === 0 && AppState.customRows.length === 0) {
        DOM.tableBody.innerHTML = `
            <tr class="empty-table-message">
                <td colspan="9">
                    <div class="empty-state">
                        <i class="mdi mdi-table-large"></i>
                        <p>هنوز کابینتی به جدول اضافه نشده است</p>
                        <small>از دکمه "محاسبه و نمایش" یا "افزودن به جدول" استفاده کنید</small>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    let tableHTML = '';
    
    AppState.cabinets.forEach((cabinet, cabinetIndex) => {
        // Calculate cabinet number
        const cabinetNumber = cabinetIndex + 1;
        
        cabinet.parts.forEach((part, partIndex) => {
            const isFirstRow = partIndex === 0;
            
            tableHTML += `
                <tr data-cabinet-id="${cabinet.id}" data-part-id="${part.id}">
                    ${isFirstRow ? `
                        <td rowspan="${cabinet.parts.length}" class="cabinet-3d-cell">
                            <div class="cabinet-number">کابینت ${cabinet.typeName} ${cabinetNumber}</div>
                            <div class="cabinet-schematic" id="schematic-${cabinet.id}"></div>
                            <div class="cabinet-dimensions">
                                ${cabinet.width} × ${cabinet.height} × ${cabinet.depth} سانتی‌متر
                            </div>
                        </td>
                    ` : ''}
                    <td>${part.description}</td>
                    <td>${part.quantity}</td>
                    <td>${part.width}</td>
                    <td>${part.height}</td>
                    <td>
                        <input type="checkbox" class="groove-checkbox" ${part.groove ? 'checked' : ''}>
                    </td>
                    <td>
                        <select class="pvc-select">
                            <option value="none" ${part.pvc === 'none' ? 'selected' : ''}>ندارد</option>
                            <option value="front" ${part.pvc === 'front' ? 'selected' : ''}>جلو</option>
                            <option value="both" ${part.pvc === 'both' ? 'selected' : ''}>هر دو طرف</option>
                        </select>
                    </td>
                    <td>
                        <input type="text" class="attachment-input" value="${part.notes}" placeholder="توضیحات...">
                    </td>
                    <td class="col-actions">
                        <div class="row-actions">
                            <button class="action-btn edit" title="ویرایش">
                                <i class="mdi mdi-pencil"></i>
                            </button>
                            <button class="action-btn delete" title="حذف">
                                <i class="mdi mdi-delete"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    });
    
    // Add custom rows
    AppState.customRows.forEach(row => {
        tableHTML += `
            <tr data-custom-id="${row.id}">
                <td>
                    <div class="cabinet-number custom-row">سفارشی</div>
                </td>
                <td><input type="text" class="part-name-input" value="${row.description}"></td>
                <td><input type="number" class="quantity-input" value="${row.quantity}" min="1"></td>
                <td><input type="number" class="width-input" value="${row.width}" step="0.1"></td>
                <td><input type="number" class="height-input" value="${row.height}" step="0.1"></td>
                <td><input type="checkbox" class="groove-checkbox" ${row.groove ? 'checked' : ''}></td>
                <td>
                    <select class="pvc-select">
                        <option value="none" ${row.pvc === 'none' ? 'selected' : ''}>ندارد</option>
                        <option value="front" ${row.pvc === 'front' ? 'selected' : ''}>جلو</option>
                        <option value="both" ${row.pvc === 'both' ? 'selected' : ''}>هر دو طرف</option>
                    </select>
                </td>
                <td>
                    <input type="text" class="attachment-input" value="${row.notes}" placeholder="توضیحات...">
                </td>
                <td class="col-actions">
                    <div class="row-actions">
                        <button class="action-btn delete" title="حذف">
                            <i class="mdi mdi-delete"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    DOM.tableBody.innerHTML = tableHTML;
    
    // Generate 3D schematics
    AppState.cabinets.forEach(cabinet => {
        generateTable3DSVG(cabinet);
    });
    
    // Add event listeners to table elements
    addTableEventListeners();
}

function generateTable3DSVG(cabinet) {
    const container = document.getElementById(`schematic-${cabinet.id}`);
    if (!container) return;
    
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 150 100");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    
    // Colors with high contrast for dark mode
    const strokeColor = AppState.currentTheme === 'dark' ? '#ecf0f1' : '#2c3e50';
    const fillColor = AppState.currentTheme === 'dark' ? '#2c3e50' : '#f8f9fa';
    const accentColor = '#e74c3c';
    
    // Simplified cabinet representation
    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("x", "25");
    rect.setAttribute("y", "25");
    rect.setAttribute("width", "100");
    rect.setAttribute("height", "50");
    rect.setAttribute("fill", fillColor);
    rect.setAttribute("stroke", strokeColor);
    rect.setAttribute("stroke-width", "2");
    svg.appendChild(rect);
    
    // Shelves
    if (cabinet.shelves > 0) {
        const shelfSpacing = 50 / (cabinet.shelves + 1);
        for (let i = 1; i <= cabinet.shelves; i++) {
            const shelfY = 25 + (shelfSpacing * i);
            const shelf = document.createElementNS(svgNS, "line");
            shelf.setAttribute("x1", "25");
            shelf.setAttribute("y1", shelfY);
            shelf.setAttribute("x2", "125");
            shelf.setAttribute("y2", shelfY);
            shelf.setAttribute("stroke", accentColor);
            shelf.setAttribute("stroke-width", "1");
            shelf.setAttribute("stroke-dasharray", "3,3");
            svg.appendChild(shelf);
        }
    }
    
    // Depth indicator
    const depthLine = document.createElementNS(svgNS, "line");
    depthLine.setAttribute("x1", "125");
    depthLine.setAttribute("y1", "25");
    depthLine.setAttribute("x2", "140");
    depthLine.setAttribute("y2", "15");
    depthLine.setAttribute("stroke", strokeColor);
    depthLine.setAttribute("stroke-width", "1.5");
    depthLine.setAttribute("stroke-dasharray", "4,2");
    svg.appendChild(depthLine);
    
    container.appendChild(svg);
}

function addTableEventListeners() {
    // Groove checkboxes
    document.querySelectorAll('.groove-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const row = this.closest('tr');
            const cabinetId = row.dataset.cabinetId;
            const partId = row.dataset.partId;
            const customId = row.dataset.customId;
            
            if (cabinetId && partId) {
                const cabinet = AppState.cabinets.find(c => c.id == cabinetId);
                if (cabinet) {
                    const part = cabinet.parts.find(p => p.id === partId);
                    if (part) {
                        part.groove = this.checked;
                    }
                }
            } else if (customId) {
                const rowData = AppState.customRows.find(r => r.id === customId);
                if (rowData) {
                    rowData.groove = this.checked;
                }
            }
        });
    });
    
    // PVC selects
    document.querySelectorAll('.pvc-select').forEach(select => {
        select.addEventListener('change', function() {
            const row = this.closest('tr');
            const cabinetId = row.dataset.cabinetId;
            const partId = row.dataset.partId;
            const customId = row.dataset.customId;
            
            if (cabinetId && partId) {
                const cabinet = AppState.cabinets.find(c => c.id == cabinetId);
                if (cabinet) {
                    const part = cabinet.parts.find(p => p.id === partId);
                    if (part) {
                        part.pvc = this.value;
                    }
                }
            } else if (customId) {
                const rowData = AppState.customRows.find(r => r.id === customId);
                if (rowData) {
                    rowData.pvc = this.value;
                }
            }
        });
    });
    
    // Attachment inputs
    document.querySelectorAll('.attachment-input').forEach(input => {
        input.addEventListener('input', function() {
            const row = this.closest('tr');
            const cabinetId = row.dataset.cabinetId;
            const partId = row.dataset.partId;
            const customId = row.dataset.customId;
            
            if (cabinetId && partId) {
                const cabinet = AppState.cabinets.find(c => c.id == cabinetId);
                if (cabinet) {
                    const part = cabinet.parts.find(p => p.id === partId);
                    if (part) {
                        part.notes = this.value;
                    }
                }
            } else if (customId) {
                const rowData = AppState.customRows.find(r => r.id === customId);
                if (rowData) {
                    rowData.notes = this.value;
                }
            }
        });
    });
    
    // Edit buttons
    document.querySelectorAll('.action-btn.edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const cabinetId = row.dataset.cabinetId;
            const partId = row.dataset.partId;
            
            if (cabinetId && partId) {
                const cabinet = AppState.cabinets.find(c => c.id == cabinetId);
                if (cabinet) {
                    const part = cabinet.parts.find(p => p.id === partId);
                    if (part) {
                        // Populate form with part data for editing
                        DOM.cabinetWidth.value = cabinet.width;
                        DOM.cabinetHeight.value = cabinet.height;
                        DOM.cabinetDepth.value = cabinet.depth;
                        DOM.shelfCount.value = cabinet.shelves;
                        DOM.stretcherQuantity.value = cabinet.stretcherQty;
                        DOM.stretcherHeight.value = cabinet.stretcherHeight;
                        DOM.craftsmanName.value = cabinet.craftsman;
                        DOM.clientName.value = cabinet.client;
                        
                        // Set cabinet type
                        document.querySelector(`input[name="cabinetType"][value="${cabinet.type}"]`).checked = true;
                        updateCabinetTypeUI();
                        
                        // Show toast
                        showToast('ویرایش', 'مشخصات کابینت برای ویرایش بارگذاری شد', 'info');
                    }
                }
            }
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.action-btn.delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const cabinetId = row.dataset.cabinetId;
            const partId = row.dataset.partId;
            const customId = row.dataset.customId;
            
            if (customId) {
                // Remove custom row
                AppState.customRows = AppState.customRows.filter(r => r.id !== customId);
                row.remove();
                updateResultsDisplay();
                showToast('ردیف حذف شد', 'ردیف سفارشی با موفقیت حذف شد', 'success');
            } else if (cabinetId && partId) {
                // Remove part from cabinet
                const cabinet = AppState.cabinets.find(c => c.id == cabinetId);
                if (cabinet) {
                    cabinet.parts = cabinet.parts.filter(p => p.id !== partId);
                    if (cabinet.parts.length === 0) {
                        // Remove entire cabinet if no parts left
                        AppState.cabinets = AppState.cabinets.filter(c => c.id != cabinetId);
                    }
                    renderTable();
                    updateResultsDisplay();
                    showToast('قطعه حذف شد', 'قطعه با موفقیت حذف شد', 'success');
                }
            }
        });
    });
    
    // Custom row inputs
    document.querySelectorAll('.part-name-input').forEach(input => {
        input.addEventListener('input', function() {
            const row = this.closest('tr');
            const customId = row.dataset.customId;
            const rowData = AppState.customRows.find(r => r.id === customId);
            
            if (rowData) {
                rowData.description = this.value;
                updateResultsDisplay();
            }
        });
    });
    
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('input', function() {
            const row = this.closest('tr');
            const customId = row.dataset.customId;
            const rowData = AppState.customRows.find(r => r.id === customId);
            
            if (rowData) {
                rowData.quantity = parseInt(this.value) || 1;
                updateResultsDisplay();
            }
        });
    });
    
    document.querySelectorAll('.width-input').forEach(input => {
        input.addEventListener('input', function() {
            const row = this.closest('tr');
            const customId = row.dataset.customId;
            const rowData = AppState.customRows.find(r => r.id === customId);
            
            if (rowData) {
                rowData.width = parseFloat(this.value) || 0;
                updateResultsDisplay();
            }
        });
    });
    
    document.querySelectorAll('.height-input').forEach(input => {
        input.addEventListener('input', function() {
            const row = this.closest('tr');
            const customId = row.dataset.customId;
            const rowData = AppState.customRows.find(r => r.id === customId);
            
            if (rowData) {
                rowData.height = parseFloat(this.value) || 0;
                updateResultsDisplay();
            }
        });
    });
}

function addCustomRow() {
    const newRow = {
        id: `custom_${Date.now()}`,
        description: 'قطعه سفارشی',
        quantity: 1,
        width: 0,
        height: 0,
        groove: false,
        pvc: 'none',
        notes: ''
    };
    
    AppState.customRows.push(newRow);
    renderTable();
    showToast('ردیف اضافه شد', 'ردیف سفارشی جدید اضافه شد', 'success');
}

function clearTable() {
    if (AppState.cabinets.length === 0 && AppState.customRows.length === 0) {
        showToast('جدول خالی است', 'جدول در حال حاضر خالی است', 'info');
        return;
    }
    
    if (confirm('آیا از پاک کردن کامل جدول اطمینان دارید؟ این عمل قابل بازگشت نیست.')) {
        AppState.cabinets = [];
        AppState.customRows = [];
        AppState.currentCabinetId = 1;
        updateResultsDisplay();
        renderTable();
        showToast('جدول پاک شد', 'تمام داده‌های جدول حذف شدند', 'success');
    }
}

function filterTable() {
    const searchTerm = DOM.tableSearch.value.toLowerCase();
    const rows = DOM.tableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        if (row.classList.contains('empty-table-message')) return;
        
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Export Functions
function printTable() {
    if (AppState.cabinets.length === 0 && AppState.customRows.length === 0) {
        showToast('جدول خالی است', 'لطفاً ابتدا کابینتی به جدول اضافه کنید', 'error');
        return;
    }
    
    // Create print window
    const printWindow = window.open('', '_blank');
    
    // Get table data
    let tableHTML = `
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
                    line-height: 1.4;
                    direction: rtl;
                }
                
                .print-header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid #333;
                }
                
                .print-header h1 {
                    color: #2c3e50;
                    font-size: 28px;
                    margin-bottom: 10px;
                }
                
                .print-header .subtitle {
                    color: #666;
                    font-size: 16px;
                }
                
                .print-meta {
                    display: flex;
                    justify-content: space-between;
                    margin: 20px 0;
                    padding: 15px;
                    background: #f5f5f5;
                    border-radius: 8px;
                    flex-wrap: wrap;
                }
                
                .meta-item {
                    margin: 5px 15px;
                    font-size: 14px;
                }
                
                .meta-label {
                    font-weight: bold;
                    color: #2c3e50;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                    font-size: 12px;
                }
                
                th {
                    background: #333;
                    color: white;
                    font-weight: bold;
                    padding: 12px 8px;
                    border: 2px solid #000;
                    text-align: center;
                }
                
                td {
                    padding: 10px 8px;
                    border: 1px solid #000;
                    text-align: center;
                    vertical-align: middle;
                }
                
                .cabinet-group {
                    background: #f0f0f0 !important;
                }
                
                .cabinet-header td {
                    font-weight: bold;
                    background: #e8f4fc;
                }
                
                .total-row {
                    background: #333 !important;
                    color: white;
                    font-weight: bold;
                }
                
                .total-row td {
                    border: 2px solid #000;
                }
                
                .print-footer {
                    margin-top: 30px;
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                    padding-top: 15px;
                    border-top: 1px solid #ddd;
                }
                
                @media print {
                    body { padding: 0; }
                    .no-print { display: none; }
                    table { page-break-inside: auto; }
                    tr { page-break-inside: avoid; }
                    @page { margin: 1.5cm; }
                }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1>جدول ریزاندازه جهت کات مستر</h1>
                <div class="subtitle">Aqua Drawer LAB - تولید شده توسط نرم‌افزار</div>
            </div>
            
            <div class="print-meta">
                <div class="meta-item">
                    <span class="meta-label">استادکار:</span>
                    <span>${DOM.resultCraftsman.textContent}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">مشتری:</span>
                    <span>${DOM.resultClient.textContent}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">تاریخ:</span>
                    <span>${DOM.resultDate.textContent}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">تعداد کابینت‌ها:</span>
                    <span>${AppState.cabinets.length}</span>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th rowspan="2">نوع قطعه</th>
                        <th rowspan="2">تعداد</th>
                        <th colspan="2">ابعاد (سانتی‌متر)</th>
                        <th rowspan="2">شیار</th>
                        <th rowspan="2">نوار PVC</th>
                        <th rowspan="2">توضیحات</th>
                    </tr>
                    <tr>
                        <th>عرض</th>
                        <th>ارتفاع</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Add cabinet data
    let totalParts = 0;
    AppState.cabinets.forEach((cabinet, index) => {
        tableHTML += `
            <tr class="cabinet-group">
                <td colspan="7" style="text-align: center; font-weight: bold; background: #e0e0e0;">
                    کابینت ${cabinet.typeName} ${index + 1} - ${cabinet.width} × ${cabinet.height} × ${cabinet.depth} سانتی‌متر
                </td>
            </tr>
        `;
        
        cabinet.parts.forEach(part => {
            totalParts += part.quantity;
            tableHTML += `
                <tr>
                    <td>${part.description}</td>
                    <td>${part.quantity}</td>
                    <td>${part.width}</td>
                    <td>${part.height}</td>
                    <td>${part.groove ? '✓' : '✗'}</td>
                    <td>${getPVCtext(part.pvc)}</td>
                    <td>${part.notes}</td>
                </tr>
            `;
        });
    });
    
    // Add custom rows
    if (AppState.customRows.length > 0) {
        tableHTML += `
            <tr class="cabinet-group">
                <td colspan="7" style="text-align: center; font-weight: bold; background: #e0e0e0;">
                    قطعات سفارشی
                </td>
            </tr>
        `;
        
        AppState.customRows.forEach(row => {
            totalParts += row.quantity;
            tableHTML += `
                <tr>
                    <td>${row.description}</td>
                    <td>${row.quantity}</td>
                    <td>${row.width}</td>
                    <td>${row.height}</td>
                    <td>${row.groove ? '✓' : '✗'}</td>
                    <td>${getPVCtext(row.pvc)}</td>
                    <td>${row.notes}</td>
                </tr>
            `;
        });
    }
    
    // Add totals
    tableHTML += `
            <tr class="total-row">
                <td colspan="1">مجموع:</td>
                <td>${totalParts}</td>
                <td colspan="5"></td>
            </tr>
        </tbody>
    </table>
    
    <div class="print-footer">
        <p>Aqua Drawer LAB v2.0 - طراحی و توسعه توسط ممد (By_zZzMohammadzZz)</p>
        <p>تاریخ چاپ: ${convertToPersianDate(new Date())}</p>
    </div>
    
    <script>
        window.onload = function() {
            window.print();
            setTimeout(() => window.close(), 1000);
        };
    </script>
</body>
</html>`;
    
    printWindow.document.write(tableHTML);
    printWindow.document.close();
}

function getPVCtext(pvc) {
    switch(pvc) {
        case 'none': return 'ندارد';
        case 'front': return 'جلو';
        case 'both': return 'هر دو طرف';
        default: return 'ندارد';
    }
}

async function exportToPDF() {
    if (AppState.cabinets.length === 0 && AppState.customRows.length === 0) {
        showToast('جدول خالی است', 'لطفاً ابتدا کابینتی به جدول اضافه کنید', 'error');
        return;
    }
    
    try {
        // Show loading
        const originalText = DOM.pdfBtn.innerHTML;
        DOM.pdfBtn.innerHTML = '<i class="mdi mdi-loading mdi-spin"></i> در حال تولید...';
        DOM.pdfBtn.disabled = true;
        
        const { jsPDF } = window.jspdf;
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
        
        // Add logo and title
        pdf.setFontSize(20);
        pdf.text('جدول ریزاندازه جهت کات مستر', 148, 20, { align: 'center' });
        
        pdf.setFontSize(12);
        pdf.text('Aqua Drawer LAB - ابزار تخصصی تجزیه باکس کابینت', 148, 28, { align: 'center' });
        
        // Add metadata
        pdf.setFontSize(10);
        pdf.text(`استادکار: ${DOM.resultCraftsman.textContent}`, 20, 45);
        pdf.text(`مشتری: ${DOM.resultClient.textContent}`, 148, 45, { align: 'center' });
        pdf.text(`تاریخ: ${DOM.resultDate.textContent}`, 276, 45, { align: 'right' });
        pdf.text(`تعداد کابینت‌ها: ${AppState.cabinets.length}`, 20, 52);
        
        // Prepare table data
        const tableData = [];
        
        // Add cabinets data
        AppState.cabinets.forEach((cabinet, index) => {
            // Add cabinet header
            tableData.push([{
                content: `کابینت ${cabinet.typeName} ${index + 1} - ${cabinet.width}×${cabinet.height}×${cabinet.depth} سانتی‌متر`,
                colSpan: 7,
                styles: { 
                    fillColor: [200, 200, 200],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    halign: 'center'
                }
            }]);
            
            // Add cabinet parts
            cabinet.parts.forEach(part => {
                tableData.push([
                    part.description,
                    part.quantity,
                    part.width,
                    part.height,
                    part.groove ? '✓' : '✗',
                    getPVCtext(part.pvc),
                    part.notes || '-'
                ]);
            });
        });
        
        // Add custom rows
        if (AppState.customRows.length > 0) {
            tableData.push([{
                content: 'قطعات سفارشی',
                colSpan: 7,
                styles: { 
                    fillColor: [200, 200, 200],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    halign: 'center'
                }
            }]);
            
            AppState.customRows.forEach(row => {
                tableData.push([
                    row.description,
                    row.quantity,
                    row.width,
                    row.height,
                    row.groove ? '✓' : '✗',
                    getPVCtext(row.pvc),
                    row.notes || '-'
                ]);
            });
        }
        
        // Generate table with RTL support
        pdf.autoTable({
            startY: 60,
            head: [['نوع قطعه', 'تعداد', 'عرض', 'ارتفاع', 'شیار', 'نوار PVC', 'توضیحات']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [51, 51, 51],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center'
            },
            bodyStyles: {
                halign: 'center',
                font: 'Vazirmatn',
                fontStyle: 'normal'
            },
            columnStyles: {
                0: { cellWidth: 40, halign: 'right' },
                1: { cellWidth: 20 },
                2: { cellWidth: 25 },
                3: { cellWidth: 25 },
                4: { cellWidth: 20 },
                5: { cellWidth: 30 },
                6: { cellWidth: 50, halign: 'right' }
            },
            margin: { left: 15, right: 15 },
            styles: {
                font: 'Vazirmatn',
                fontStyle: 'normal',
                textColor: [0, 0, 0]
            },
            didDrawPage: function(data) {
                // Footer
                pdf.setFontSize(8);
                pdf.setTextColor(128, 128, 128);
                pdf.text('Aqua Drawer LAB v2.0 - طراحی و توسعه توسط ممد (By_zZzMohammadzZz)', 148, 200, { align: 'center' });
                pdf.text(`صفحه ${pdf.internal.getNumberOfPages()}`, 290, 200, { align: 'right' });
            }
        });
        
        // Save PDF
        const fileName = `کابینت-${new Date().toISOString().slice(0,10)}.pdf`;
        pdf.save(fileName);
        
        // Restore button
        DOM.pdfBtn.innerHTML = originalText;
        DOM.pdfBtn.disabled = false;
        
        showToast('PDF تولید شد', 'فایل با موفقیت ذخیره شد', 'success');
        
    } catch (error) {
        console.error('PDF Export Error:', error);
        showToast('خطا در تولید PDF', 'لطفاً دوباره تلاش کنید', 'error');
        
        // Restore button
        DOM.pdfBtn.innerHTML = '<i class="mdi mdi-file-pdf"></i> خروجی PDF';
        DOM.pdfBtn.disabled = false;
    }
}

function exportToExcel() {
    if (AppState.cabinets.length === 0 && AppState.customRows.length === 0) {
        showToast('جدول خالی است', 'لطفاً ابتدا کابینتی به جدول اضافه کنید', 'error');
        return;
    }
    
    // Create CSV content
    let csv = 'نوع قطعه,تعداد,عرض (سانتی‌متر),ارتفاع (سانتی‌متر),شیار,نوار PVC,توضیحات\n';
    
    // Add cabinets data
    AppState.cabinets.forEach((cabinet, index) => {
        csv += `کابینت ${cabinet.typeName} ${index + 1} - ${cabinet.width}×${cabinet.height}×${cabinet.depth} سانتی‌متر,,,,,,\n`;
        
        cabinet.parts.forEach(part => {
            csv += `${part.description},${part.quantity},${part.width},${part.height},${part.groove ? 'دارد' : 'ندارد'},${getPVCtext(part.pvc)},"${part.notes || ''}"\n`;
        });
    });
    
    // Add custom rows
    if (AppState.customRows.length > 0) {
        csv += 'قطعات سفارشی,,,,,,\n';
        
        AppState.customRows.forEach(row => {
            csv += `${row.description},${row.quantity},${row.width},${row.height},${row.groove ? 'دارد' : 'ندارد'},${getPVCtext(row.pvc)},"${row.notes || ''}"\n`;
        });
    }
    
    // Create and download file
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `کابینت-${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Excel تولید شد', 'فایل CSV با موفقیت ذخیره شد', 'success');
}

// Project Management
function saveProject() {
    if (AppState.cabinets.length === 0 && AppState.customRows.length === 0) {
        showToast('جدول خالی است', 'لطفاً ابتدا کابینتی به جدول اضافه کنید', 'error');
        return;
    }
    
    const projectName = prompt('نام پروژه را وارد کنید:', `پروژه ${convertToPersianDate(new Date())}`);
    
    if (!projectName) return;
    
    const project = {
        id: Date.now(),
        name: projectName,
        cabinets: JSON.parse(JSON.stringify(AppState.cabinets)),
        customRows: JSON.parse(JSON.stringify(AppState.customRows)),
        craftsman: DOM.craftsmanName.value || 'تعیین نشده',
        client: DOM.clientName.value || 'تعیین نشده',
        date: DOM.projectDate.value || convertToPersianDate(new Date()),
        timestamp: Date.now(),
        version: '2.0'
    };
    
    AppState.savedProjects.push(project);
    localStorage.setItem('aquaDrawerProjects', JSON.stringify(AppState.savedProjects));
    
    renderProjectsList();
    showToast('پروژه ذخیره شد', 'پروژه با موفقیت ذخیره شد', 'success');
}

function renderProjectsList() {
    if (AppState.savedProjects.length === 0) {
        DOM.projectsList.innerHTML = `
            <div class="empty-state">
                <i class="mdi mdi-folder-open-outline"></i>
                <p>هیچ پروژه‌ای ذخیره نشده است</p>
                <small>پروژه‌های خود را ذخیره کنید تا بعداً بتوانید آنها را بارگذاری کنید</small>
            </div>
        `;
        return;
    }
    
    DOM.projectsList.innerHTML = AppState.savedProjects.map(project => `
        <div class="project-item" data-id="${project.id}">
            <div class="project-info">
                <h4>${project.name}</h4>
                <div class="project-meta">
                    <span><i class="mdi mdi-account-hard-hat"></i> ${project.craftsman}</span>
                    <span><i class="mdi mdi-calendar"></i> ${project.date}</span>
                    <span><i class="mdi mdi-cube-outline"></i> ${project.cabinets.length} کابینت</span>
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
    
    // Add event listeners
    DOM.projectsList.querySelectorAll('.load-project').forEach(btn => {
        btn.addEventListener('click', function() {
            const projectId = parseInt(this.closest('.project-item').dataset.id);
            loadProject(projectId);
        });
    });
    
    DOM.projectsList.querySelectorAll('.delete-project').forEach(btn => {
        btn.addEventListener('click', function() {
            const projectId = parseInt(this.closest('.project-item').dataset.id);
            deleteProject(projectId);
        });
    });
}

function loadProject(projectId) {
    const project = AppState.savedProjects.find(p => p.id === projectId);
    if (!project) return;
    
    // Clear current data
    AppState.cabinets = JSON.parse(JSON.stringify(project.cabinets));
    AppState.customRows = JSON.parse(JSON.stringify(project.customRows || []));
    
    // Update form from first cabinet
    if (project.cabinets.length > 0) {
        const firstCabinet = project.cabinets[0];
        const isAerial = firstCabinet.type === 'aerial';
        
        // Set cabinet type
        document.querySelector(`input[name="cabinetType"][value="${firstCabinet.type}"]`).checked = true;
        updateCabinetTypeUI();
        
        // Set dimensions
        DOM.cabinetWidth.value = firstCabinet.width;
        DOM.cabinetHeight.value = firstCabinet.height;
        DOM.cabinetDepth.value = firstCabinet.depth;
        DOM.shelfCount.value = firstCabinet.shelves;
        DOM.stretcherQuantity.value = firstCabinet.stretcherQty;
        DOM.stretcherHeight.value = firstCabinet.stretcherHeight;
        
        // Set metadata
        DOM.craftsmanName.value = project.craftsman;
        DOM.clientName.value = project.client;
        DOM.projectDate.value = project.date;
    }
    
    // Update UI
    updateResultsDisplay();
    renderTable();
    
    showToast('پروژه بارگذاری شد', 'پروژه با موفقیت بارگذاری شد', 'success');
}

function deleteProject(projectId) {
    if (!confirm('آیا از حذف این پروژه اطمینان دارید؟ این عمل قابل بازگشت نیست.')) {
        return;
    }
    
    AppState.savedProjects = AppState.savedProjects.filter(p => p.id !== projectId);
    localStorage.setItem('aquaDrawerProjects', JSON.stringify(AppState.savedProjects));
    
    renderProjectsList();
    showToast('پروژه حذف شد', 'پروژه با موفقیت حذف شد', 'success');
}

// Scroll Handling for Header Auto-hide
function handleScroll() {
    if (window.innerWidth > 768) return; // Only on mobile
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > AppState.lastScrollTop && scrollTop > 100) {
        // Scrolling down - hide header
        if (AppState.headerVisible) {
            DOM.mainHeader.classList.add('header-hidden');
            DOM.mainHeader.classList.remove('header-visible');
            AppState.headerVisible = false;
        }
    } else {
        // Scrolling up - show header
        if (!AppState.headerVisible) {
            DOM.mainHeader.classList.remove('header-hidden');
            DOM.mainHeader.classList.add('header-visible');
            AppState.headerVisible = true;
        }
    }
    
    AppState.lastScrollTop = scrollTop;
    
    // Update scroll top button
    updateScrollTopButton();
}

function updateScrollTopButton() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 300) {
        DOM.scrollTopBtn.classList.add('visible');
    } else {
        DOM.scrollTopBtn.classList.remove('visible');
    }
    
    // Add click event
    DOM.scrollTopBtn.onclick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
}

// Keyboard Shortcuts
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + Enter: Calculate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        calculateAndShow();
    }
    
    // Ctrl/Cmd + S: Save project
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveProject();
    }
    
    // Ctrl/Cmd + P: Print
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        printTable();
    }
    
    // Escape: Close sidebar and modals
    if (e.key === 'Escape') {
        closeSidebar();
        hide3DPreview();
    }
}

// Auto-save Form Values
function setupAutoSave() {
    const inputs = [
        DOM.cabinetWidth,
        DOM.cabinetHeight,
        DOM.cabinetDepth,
        DOM.shelfCount,
        DOM.stretcherQuantity,
        DOM.stretcherHeight,
        DOM.craftsmanName,
        DOM.clientName
    ];
    
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            saveFormValues();
        });
    });
}

function saveFormValues() {
    const formData = {
        width: DOM.cabinetWidth.value,
        height: DOM.cabinetHeight.value,
        depth: DOM.cabinetDepth.value,
        shelves: DOM.shelfCount.value,
        stretcherQty: DOM.stretcherQuantity.value,
        stretcherHeight: DOM.stretcherHeight.value,
        craftsman: DOM.craftsmanName.value,
        client: DOM.clientName.value,
        cabinetType: document.querySelector('input[name="cabinetType"]:checked').value
    };
    
    localStorage.setItem('aquaDrawerLastValues', JSON.stringify(formData));
}

function loadLastValues() {
    const saved = localStorage.getItem('aquaDrawerLastValues');
    if (saved) {
        try {
            const formData = JSON.parse(saved);
            
            // Set cabinet type first
            document.querySelector(`input[name="cabinetType"][value="${formData.cabinetType}"]`).checked = true;
            updateCabinetTypeUI();
            
            // Set other values
            DOM.cabinetWidth.value = formData.width || '';
            DOM.cabinetHeight.value = formData.height || '';
            DOM.cabinetDepth.value = formData.depth || '';
            DOM.shelfCount.value = formData.shelves || (formData.cabinetType === 'aerial' ? '2' : '1');
            DOM.stretcherQuantity.value = formData.stretcherQty || (formData.cabinetType === 'aerial' ? '0' : '2');
            DOM.stretcherHeight.value = formData.stretcherHeight || '12';
            DOM.craftsmanName.value = formData.craftsman || '';
            DOM.clientName.value = formData.client || '';
        } catch (e) {
            console.error('Error loading last values:', e);
        }
    }
}

// Window Resize Handler
function handleResize() {
    // Close sidebar on desktop
    if (window.innerWidth > 768 && AppState.isSidebarOpen) {
        closeSidebar();
    }
    
    // Update header visibility
    if (window.innerWidth > 768) {
        DOM.mainHeader.classList.remove('header-hidden', 'header-visible');
        AppState.headerVisible = true;
    }
    
    // Ensure proper centering
    updateLayoutCentering();
}

function updateLayoutCentering() {
    // Ensure all containers are properly centered
    const containers = document.querySelectorAll('.container, .app-layout, .header-content, .footer-content');
    containers.forEach(container => {
        container.style.marginInline = 'auto';
        container.style.maxWidth = '1400px';
        container.style.width = '100%';
        container.style.boxSizing = 'border-box';
    });
}

// Update Formulas Display
function updateFormulasDisplay() {
    const isAerial = document.querySelector('input[name="cabinetType"]:checked').value === 'aerial';
    
    if (isAerial) {
        DOM.aerialFormulas.style.display = 'block';
        DOM.groundFormulas.style.display = 'none';
    } else {
        DOM.aerialFormulas.style.display = 'none';
        DOM.groundFormulas.style.display = 'block';
    }
}

// Toast Notifications
function showToast(title, message, type = 'info') {
    // Clear existing timeout
    if (AppState.toastTimeout) {
        clearTimeout(AppState.toastTimeout);
    }
    
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(toast => toast.remove());
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'mdi-check-circle',
        error: 'mdi-alert-circle',
        info: 'mdi-information'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="mdi ${icons[type]}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">
            <i class="mdi mdi-close"></i>
        </button>
    `;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        hideToast(toast);
    });
    
    // Auto hide
    AppState.toastTimeout = setTimeout(() => {
        hideToast(toast);
    }, 5000);
}

function hideToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);