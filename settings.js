/**
 * Settings Module - Application Configuration & Preferences
 * Features: Dark/Light theme toggle, units, notifications, data management
 */

export class SettingsModule {
    constructor() {
        this.settings = {
            theme: 'light',
            units: 'metric',
            notifications: true,
            autoSave: true,
            pomodoroSound: true,
            weatherRefresh: 30, // minutes
            taskReminders: true,
            compactView: false,
            animationsEnabled: true,
            dataBackup: true
        };
    }

    async initialize() {
        this.loadSettings();
        this.bindEvents();
        this.render();
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('prodash-settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
        this.applySettings();
    }

    saveSettings() {
        localStorage.setItem('prodash-settings', JSON.stringify(this.settings));
        this.applySettings();
        window.ProDash.showNotification('Settings saved successfully!', 'success');
    }

    bindEvents() {
        // Settings will be bound after render
    }

    applySettings() {
        // Apply theme
        document.documentElement.setAttribute('data-theme', this.settings.theme);

        // Update theme toggle icon
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.settings.theme === 'light' ? '🌙' : '☀️';
        }

        // Apply other settings to relevant modules
        if (window.ProDash && window.ProDash.modules) {
            // Update weather module units
            const weatherModule = window.ProDash.modules.get('weather');
            if (weatherModule) {
                weatherModule.units = this.settings.units;
            }

            // Update pomodoro sound setting
            const pomodoroModule = window.ProDash.modules.get('pomodoro');
            if (pomodoroModule) {
                pomodoroModule.soundEnabled = this.settings.pomodoroSound;
            }
        }
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }

    exportData() {
        const data = {
            settings: this.settings,
            tasks: JSON.parse(localStorage.getItem('prodash-tasks') || '[]'),
            notes: JSON.parse(localStorage.getItem('prodash-notes') || '[]'),
            folders: JSON.parse(localStorage.getItem('prodash-folders') || '[]'),
            events: JSON.parse(localStorage.getItem('prodash-events') || '[]'),
            location: JSON.parse(localStorage.getItem('prodash-location') || 'null'),
            pomodoroSettings: JSON.parse(localStorage.getItem('prodash-pomodoro-settings') || '{}'),
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prodash-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        window.ProDash.showNotification('Data exported successfully!', 'success');
    }

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (data.version && data.exportDate) {
                    // Import settings
                    if (data.settings) {
                        this.settings = { ...this.settings, ...data.settings };
                        localStorage.setItem('prodash-settings', JSON.stringify(this.settings));
                    }

                    // Import data
                    if (data.tasks) localStorage.setItem('prodash-tasks', JSON.stringify(data.tasks));
                    if (data.notes) localStorage.setItem('prodash-notes', JSON.stringify(data.notes));
                    if (data.folders) localStorage.setItem('prodash-folders', JSON.stringify(data.folders));
                    if (data.events) localStorage.setItem('prodash-events', JSON.stringify(data.events));
                    if (data.location) localStorage.setItem('prodash-location', JSON.stringify(data.location));
                    if (data.pomodoroSettings) localStorage.setItem('prodash-pomodoro-settings', JSON.stringify(data.pomodoroSettings));

                    this.applySettings();
                    window.ProDash.showNotification('Data imported successfully! Please refresh the page.', 'success');
                } else {
                    throw new Error('Invalid backup file format');
                }
            } catch (error) {
                console.error('Import failed:', error);
                window.ProDash.showNotification('Failed to import data. Invalid file format.', 'error');
            }
        };
        reader.readAsText(file);
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            if (confirm('This will delete ALL your tasks, notes, events, and settings. Are you absolutely sure?')) {
                // Clear all localStorage data
                const keys = ['prodash-tasks', 'prodash-notes', 'prodash-folders', 'prodash-events',
                             'prodash-location', 'prodash-pomodoro-settings', 'prodash-settings'];

                keys.forEach(key => localStorage.removeItem(key));

                window.ProDash.showNotification('All data cleared. Refreshing page...', 'info');
                setTimeout(() => window.location.reload(), 2000);
            }
        }
    }

    render() {
        const settingsContainer = document.getElementById('settings-module');
        if (!settingsContainer) return;

        settingsContainer.innerHTML = `
            <div class="settings-container">
                <div class="settings-section">
                    <h3>🎨 Appearance</h3>
                    <div class="setting-item">
                        <label class="setting-label">
                            <span>Theme</span>
                            <select id="theme-setting" class="setting-input">
                                <option value="light" ${this.settings.theme === 'light' ? 'selected' : ''}>Light</option>
                                <option value="dark" ${this.settings.theme === 'dark' ? 'selected' : ''}>Dark</option>
                            </select>
                        </label>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label">
                            <span>Compact View</span>
                            <input type="checkbox" id="compact-setting" ${this.settings.compactView ? 'checked' : ''}>
                        </label>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label">
                            <span>Animations</span>
                            <input type="checkbox" id="animations-setting" ${this.settings.animationsEnabled ? 'checked' : ''}>
                        </label>
                    </div>
                </div>

                <div class="settings-section">
                    <h3>⚙️ General</h3>
                    <div class="setting-item">
                        <label class="setting-label">
                            <span>Units</span>
                            <select id="units-setting" class="setting-input">
                                <option value="metric" ${this.settings.units === 'metric' ? 'selected' : ''}>Metric (°C, km/h)</option>
                                <option value="imperial" ${this.settings.units === 'imperial' ? 'selected' : ''}>Imperial (°F, mph)</option>
                            </select>
                        </label>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label">
                            <span>Auto-save Notes</span>
                            <input type="checkbox" id="autosave-setting" ${this.settings.autoSave ? 'checked' : ''}>
                        </label>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label">
                            <span>Weather Refresh (minutes)</span>
                            <input type="number" id="weather-refresh-setting" value="${this.settings.weatherRefresh}" min="5" max="120" class="setting-input">
                        </label>
                    </div>
                </div>

                <div class="settings-section">
                    <h3>🔔 Notifications</h3>
                    <div class="setting-item">
                        <label class="setting-label">
                            <span>Enable Notifications</span>
                            <input type="checkbox" id="notifications-setting" ${this.settings.notifications ? 'checked' : ''}>
                        </label>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label">
                            <span>Pomodoro Sound</span>
                            <input type="checkbox" id="pomodoro-sound-setting" ${this.settings.pomodoroSound ? 'checked' : ''}>
                        </label>
                    </div>
                    <div class="setting-item">
                        <label class="setting-label">
                            <span>Task Reminders</span>
                            <input type="checkbox" id="task-reminders-setting" ${this.settings.taskReminders ? 'checked' : ''}>
                        </label>
                    </div>
                </div>

                <div class="settings-section">
                    <h3>💾 Data Management</h3>
                    <div class="setting-item">
                        <label class="setting-label">
                            <span>Auto Backup</span>
                            <input type="checkbox" id="backup-setting" ${this.settings.dataBackup ? 'checked' : ''}>
                        </label>
                    </div>
                    <div class="setting-actions">
                        <button class="btn btn-primary" id="export-data-btn">📥 Export Data</button>
                        <button class="btn" id="import-data-btn">📤 Import Data</button>
                        <input type="file" id="import-file-input" accept=".json" style="display: none;">
                        <button class="btn" style="background: var(--error); color: white;" id="clear-data-btn">🗑️ Clear All Data</button>
                    </div>
                </div>

                <div class="settings-section">
                    <h3>ℹ️ About</h3>
                    <div class="about-info">
                        <p><strong>ProDash</strong> - Professional Productivity Suite</p>
                        <p>Version: 1.0.0</p>
                        <p>Built with vanilla HTML, CSS, and JavaScript</p>
                        <p>No external dependencies or frameworks</p>
                        <div style="margin-top: 1rem;">
                            <h4>Keyboard Shortcuts:</h4>
                            <div class="shortcuts-grid">
                                <span>Ctrl+1-6</span><span>Switch modules</span>
                                <span>Ctrl+D</span><span>Toggle theme</span>
                                <span>Ctrl+F</span><span>Focus mode</span>
                                <span>Ctrl+N</span><span>New task/note</span>
                                <span>Ctrl+S</span><span>Save note</span>
                                <span>Space</span><span>Start/pause timer</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.bindSettingsEvents();
    }

    bindSettingsEvents() {
        // Theme setting
        const themeSetting = document.getElementById('theme-setting');
        themeSetting?.addEventListener('change', (e) => {
            this.updateSetting('theme', e.target.value);
        });

        // Units setting
        const unitsSetting = document.getElementById('units-setting');
        unitsSetting?.addEventListener('change', (e) => {
            this.updateSetting('units', e.target.value);
        });

        // Checkbox settings
        const checkboxes = [
            'compact-setting', 'animations-setting', 'autosave-setting',
            'notifications-setting', 'pomodoro-sound-setting', 'task-reminders-setting', 'backup-setting'
        ];

        checkboxes.forEach(id => {
            const element = document.getElementById(id);
            element?.addEventListener('change', (e) => {
                const settingKey = id.replace('-setting', '').replace('-', '');
                let key = settingKey;
                if (key === 'compact') key = 'compactView';
                if (key === 'animations') key = 'animationsEnabled';
                if (key === 'autosave') key = 'autoSave';
                if (key === 'pomodorosound') key = 'pomodoroSound';
                if (key === 'taskreminders') key = 'taskReminders';
                if (key === 'backup') key = 'dataBackup';

                this.updateSetting(key, e.target.checked);
            });
        });

        // Weather refresh setting
        const weatherRefresh = document.getElementById('weather-refresh-setting');
        weatherRefresh?.addEventListener('change', (e) => {
            this.updateSetting('weatherRefresh', parseInt(e.target.value));
        });

        // Data management buttons
        const exportBtn = document.getElementById('export-data-btn');
        const importBtn = document.getElementById('import-data-btn');
        const importInput = document.getElementById('import-file-input');
        const clearBtn = document.getElementById('clear-data-btn');

        exportBtn?.addEventListener('click', () => this.exportData());

        importBtn?.addEventListener('click', () => importInput?.click());

        importInput?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.importData(file);
            }
        });

        clearBtn?.addEventListener('click', () => this.clearAllData());
    }

    onShow() {
        this.render();
    }

    handleKeyboard(e) {
        if (e.ctrlKey && e.key === ',') {
            e.preventDefault();
            // Settings shortcut - could navigate here
        }
    }
}
