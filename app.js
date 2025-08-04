/**
 * ProDash - Professional Productivity Suite
 * Main Application Controller
 * Handles routing, theme management, and module coordination
 */

// Dynamic module loader that checks both locations
async function loadModule(moduleName) {
    try {
        // First try loading from modules/ directory
        const module = await import(`./modules/${moduleName}.js`);
        return module;
    } catch (error) {
        try {
            // Fallback to loading from same directory
            const module = await import(`./${moduleName}.js`);
            return module;
        } catch (fallbackError) {
            console.error(`Failed to load module ${moduleName} from both locations:`, error, fallbackError);
            throw new Error(`Module ${moduleName} not found in ./modules/ or ./`);
        }
    }
}

class ProDashApp {
    constructor() {
        this.modules = new Map();
        this.currentModule = null;
        this.focusMode = false;
        this.theme = localStorage.getItem('prodash-theme') || 'light';
        this.mobileMenuOpen = false;

        this.initializeApp();
    }

    async initializeApp() {
        console.log('🚀 Initializing ProDash Application...');

        // Initialize theme
        this.initializeTheme();

        // Initialize modules (removed WeatherModule and StocksModule)
        await this.initializeModules();

        // Initialize router
        this.initializeRouter();

        // Initialize event listeners
        this.initializeEventListeners();

        // Set initial route
        this.router.navigate(window.location.hash || '#todo');

        console.log('✅ ProDash Application initialized successfully');
    }

    initializeTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        this.updateThemeIcon();
    }

    async initializeModules() {
        try {
            // Load modules dynamically with fallback
            const moduleLoaders = [
                { name: 'todo', className: 'TodoModule' },
                { name: 'notes', className: 'NotesModule' },
                { name: 'calendar', className: 'CalendarModule' },
                { name: 'pomodoro', className: 'PomodoroModule' },
                { name: 'calculators', className: 'CalculatorsModule' },
                { name: 'settings', className: 'SettingsModule' },
                { name: 'games', className: 'GamesModule' },
                { name: 'sprite', className: 'SpriteModule' }
            ];

            for (const { name, className } of moduleLoaders) {
                try {
                    const moduleExports = await loadModule(name);
                    const ModuleClass = moduleExports[className];
                    if (ModuleClass) {
                        this.modules.set(name, new ModuleClass());
                        console.log(`✅ ${name} module loaded successfully`);
                    } else {
                        console.error(`❌ ${className} not found in ${name} module exports`);
                    }
                } catch (error) {
                    console.error(`❌ Failed to load ${name} module:`, error);
                }
            }

            // Initialize router separately
            try {
                const routerModule = await loadModule('router');
                this.Router = routerModule.Router;
            } catch (error) {
                console.error('❌ Failed to load router module:', error);
            }

            // Initialize each loaded module
            for (const [name, module] of this.modules) {
                try {
                    await module.initialize();
                    console.log(`✅ ${name} module initialized`);
                } catch (error) {
                    console.error(`❌ Failed to initialize ${name} module:`, error);
                }
            }
        } catch (error) {
            console.error('❌ Failed to initialize modules:', error);
        }
    }

    initializeRouter() {
        if (this.Router) {
            this.router = new this.Router();
        } else {
            console.error('❌ Router class not available');
            return;
        }

        // Define routes (removed weather and stocks routes)
        this.router.addRoute('todo', () => this.showModule('todo'));
        this.router.addRoute('notes', () => this.showModule('notes'));
        this.router.addRoute('calendar', () => this.showModule('calendar'));
        this.router.addRoute('pomodoro', () => this.showModule('pomodoro'));
        this.router.addRoute('calculators', () => this.showModule('calculators'));
        this.router.addRoute('settings', () => this.showModule('settings'));
        this.router.addRoute('games', () => this.showModule('games'));
        this.router.addRoute('sprite', () => this.showModule('sprite'));
    }

    initializeEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle?.addEventListener('click', () => this.toggleTheme());

        // Focus mode toggle
        const focusToggle = document.getElementById('focus-toggle');
        focusToggle?.addEventListener('click', () => this.toggleFocusMode());

        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        mobileMenuToggle?.addEventListener('click', () => this.toggleMobileMenu());

        // Navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const module = link.getAttribute('data-module');
                this.router.navigate(`#${module}`);
                // Close mobile menu when navigating
                if (this.mobileMenuOpen) {
                    this.toggleMobileMenu();
                }
            });
        });

        // Modal handling
        const modal = document.getElementById('modal');
        const modalClose = document.querySelector('.modal-close');

        modalClose?.addEventListener('click', () => this.closeModal());
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        const appContainer = document.getElementById('app-container');
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');

        if (this.mobileMenuOpen) {
            appContainer?.classList.add('mobile-menu-open');
            mobileMenuToggle?.classList.add('active');
        } else {
            appContainer?.classList.remove('mobile-menu-open');
            mobileMenuToggle?.classList.remove('active');
        }
    }

    showModule(moduleName) {
        // Hide all modules
        document.querySelectorAll('.module').forEach(module => {
            module.classList.add('hidden');
        });

        // Show selected module
        const moduleElement = document.getElementById(`${moduleName}-module`);
        if (moduleElement) {
            moduleElement.classList.remove('hidden');
            moduleElement.classList.add('fade-in');
        }

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[data-module="${moduleName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Initialize module if needed
        const module = this.modules.get(moduleName);
        if (module && typeof module.onShow === 'function') {
            module.onShow();
        }

        this.currentModule = moduleName;

        // Update page title
        document.title = `ProDash - ${this.getModuleTitle(moduleName)}`;
    }

    getModuleTitle(moduleName) {
        const titles = {
            todo: 'Tasks',
            notes: 'Notes',
            calendar: 'Calendar & Planner',
            pomodoro: 'Pomodoro Timer',
            calculators: 'Calculator Suite',
            settings: 'Settings',
            games: 'Physics Playground',
            sprite: 'Sprite Generator'
        };
        return titles[moduleName] || 'Productivity Suite';
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('prodash-theme', this.theme);
        this.updateThemeIcon();

        // Notify modules of theme change
        this.modules.forEach(module => {
            if (typeof module.onThemeChange === 'function') {
                module.onThemeChange(this.theme);
            }
        });
    }

    updateThemeIcon() {
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.theme === 'light' ? '🌙' : '☀️';
        }
    }

    toggleFocusMode() {
        this.focusMode = !this.focusMode;
        const appContainer = document.getElementById('app-container');
        const focusIcon = document.querySelector('.focus-icon');

        if (this.focusMode) {
            appContainer?.classList.add('focus-mode');
            if (focusIcon) focusIcon.textContent = '🎯';
        } else {
            appContainer?.classList.remove('focus-mode');
            if (focusIcon) focusIcon.textContent = '👁️';
        }

        // Notify current module
        const currentModule = this.modules.get(this.currentModule);
        if (currentModule && typeof currentModule.onFocusModeChange === 'function') {
            currentModule.onFocusModeChange(this.focusMode);
        }
    }

    openModal(content) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');

        if (modal && modalBody) {
            modalBody.innerHTML = content;
            modal.classList.add('active');

            // Focus first input if exists
            const firstInput = modalBody.querySelector('input, textarea, select');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    closeModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    handleKeyboardShortcuts(e) {
        // Global shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    this.router.navigate('#todo');
                    break;
                case '2':
                    e.preventDefault();
                    this.router.navigate('#notes');
                    break;
                case '3':
                    e.preventDefault();
                    this.router.navigate('#calendar');
                    break;
                case '4':
                    e.preventDefault();
                    this.router.navigate('#pomodoro');
                    break;
                case '5':
                    e.preventDefault();
                    this.router.navigate('#calculators');
                    break;
                case 'd':
                    e.preventDefault();
                    this.toggleTheme();
                    break;
                case 'f':
                    e.preventDefault();
                    this.toggleFocusMode();
                    break;
            }
        }

        // Escape key
        if (e.key === 'Escape') {
            this.closeModal();
        }

        // Pass to current module
        const currentModule = this.modules.get(this.currentModule);
        if (currentModule && typeof currentModule.handleKeyboard === 'function') {
            currentModule.handleKeyboard(e);
        }
    }

    handleResize() {
        // Close mobile menu on desktop resize
        if (window.innerWidth > 768 && this.mobileMenuOpen) {
            this.toggleMobileMenu();
        }

        // Handle responsive behavior
        const appContainer = document.getElementById('app-container');

        if (window.innerWidth <= 768) {
            appContainer?.classList.add('mobile');
        } else {
            appContainer?.classList.remove('mobile', 'mobile-menu-open');
        }

        // Notify modules
        this.modules.forEach(module => {
            if (typeof module.onResize === 'function') {
                module.onResize();
            }
        });
    }

    // Utility methods for modules
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

        document.body.appendChild(notification);

        // Position notification
        const notifications = document.querySelectorAll('.notification');
        notification.style.position = 'fixed';
        notification.style.top = `${20 + (notifications.length - 1) * 60}px`;
        notification.style.right = '20px';
        notification.style.zIndex = '10000';
        notification.style.background = type === 'error' ? 'var(--error)' :
                                      type === 'success' ? 'var(--success)' :
                                      type === 'warning' ? 'var(--warning)' : 'var(--accent-primary)';
        notification.style.color = 'white';
        notification.style.padding = '1rem 1.5rem';
        notification.style.borderRadius = '8px';
        notification.style.boxShadow = '0 4px 12px var(--shadow-lg)';
        notification.style.display = 'flex';
        notification.style.alignItems = 'center';
        notification.style.gap = '1rem';
        notification.style.minWidth = '300px';
        notification.style.animation = 'slideIn 0.3s ease-out';

        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.background = 'none';
        closeBtn.style.border = 'none';
        closeBtn.style.color = 'white';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.fontSize = '1.2rem';

        const closeNotification = () => {
            notification.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        };

        closeBtn.addEventListener('click', closeNotification);

        // Auto close
        if (duration > 0) {
            setTimeout(closeNotification, duration);
        }
    }

    // Data management utilities
    saveData(key, data) {
        try {
            localStorage.setItem(`prodash-${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save data:', error);
            this.showNotification('Failed to save data', 'error');
            return false;
        }
    }

    loadData(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(`prodash-${key}`);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Failed to load data:', error);
            return defaultValue;
        }
    }

    // Export app instance for global access
    static getInstance() {
        if (!ProDashApp.instance) {
            ProDashApp.instance = new ProDashApp();
        }
        return ProDashApp.instance;
    }
}

// CSS for notifications
const notificationStyles = `
@keyframes fadeOut {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(100%); }
}
`;

// Add notification styles to document
const style = document.createElement('style');
style.textContent = notificationStyles;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ProDash = ProDashApp.getInstance();
});

// Export for module use
export { ProDashApp };
