/**
 * Pomodoro Module - Productivity Timer with Focus/Break Sessions
 * Features: Configurable session/break lengths, audio & desktop notifications, session history
 */

export class PomodoroModule {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentSession = 'focus'; // 'focus' or 'break'
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.focusDuration = 25 * 60;
        this.breakDuration = 5 * 60;
        this.sessionCount = 0;
        this.timer = null;
        this.audio = null;
    }

    async initialize() {
        this.loadSettings();
        this.bindEvents();
        this.initializeAudio();
        this.requestNotificationPermission();
        this.updateDisplay();
    }

    loadSettings() {
        const settings = localStorage.getItem('prodash-pomodoro-settings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.focusDuration = parsed.focusDuration * 60;
            this.breakDuration = parsed.breakDuration * 60;
            this.sessionCount = parsed.sessionCount || 0;
        }

        this.timeLeft = this.focusDuration;
        this.updateDurationInputs();
    }

    saveSettings() {
        const settings = {
            focusDuration: this.focusDuration / 60,
            breakDuration: this.breakDuration / 60,
            sessionCount: this.sessionCount
        };
        localStorage.setItem('prodash-pomodoro-settings', JSON.stringify(settings));
    }

    updateDurationInputs() {
        const focusInput = document.getElementById('focus-duration');
        const breakInput = document.getElementById('break-duration');
        const sessionCountEl = document.getElementById('session-count');

        if (focusInput) focusInput.value = this.focusDuration / 60;
        if (breakInput) breakInput.value = this.breakDuration / 60;
        if (sessionCountEl) sessionCountEl.textContent = this.sessionCount;
    }

    bindEvents() {
        // Timer controls
        const startBtn = document.getElementById('start-timer');
        const pauseBtn = document.getElementById('pause-timer');
        const resetBtn = document.getElementById('reset-timer');

        startBtn?.addEventListener('click', () => this.startTimer());
        pauseBtn?.addEventListener('click', () => this.pauseTimer());
        resetBtn?.addEventListener('click', () => this.resetTimer());

        // Duration settings
        const focusInput = document.getElementById('focus-duration');
        const breakInput = document.getElementById('break-duration');

        focusInput?.addEventListener('change', (e) => {
            this.focusDuration = parseInt(e.target.value) * 60;
            if (this.currentSession === 'focus' && !this.isRunning) {
                this.timeLeft = this.focusDuration;
                this.updateDisplay();
            }
            this.saveSettings();
        });

        breakInput?.addEventListener('change', (e) => {
            this.breakDuration = parseInt(e.target.value) * 60;
            if (this.currentSession === 'break' && !this.isRunning) {
                this.timeLeft = this.breakDuration;
                this.updateDisplay();
            }
            this.saveSettings();
        });
    }

    initializeAudio() {
        // Create audio notification sound (simple beep using Web Audio API)
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                await Notification.requestPermission();
            }
        }
    }

    playNotificationSound() {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.2);

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    showNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body: body,
                icon: '🍅',
                requireInteraction: true
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            // Auto close after 10 seconds
            setTimeout(() => notification.close(), 10000);
        }
    }

    startTimer() {
        if (this.isPaused) {
            this.isPaused = false;
        } else if (!this.isRunning) {
            this.isRunning = true;
        }

        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();

            if (this.timeLeft <= 0) {
                this.completeSession();
            }
        }, 1000);

        this.updateControls();
        window.ProDash.showNotification(`${this.currentSession === 'focus' ? 'Focus' : 'Break'} session started!`, 'info');
    }

    pauseTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.isPaused = true;
        this.updateControls();
        window.ProDash.showNotification('Timer paused', 'info');
    }

    resetTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        this.isRunning = false;
        this.isPaused = false;
        this.timeLeft = this.currentSession === 'focus' ? this.focusDuration : this.breakDuration;
        this.updateDisplay();
        this.updateControls();
        window.ProDash.showNotification('Timer reset', 'info');
    }

    completeSession() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        this.isRunning = false;
        this.isPaused = false;

        // Play sound and show notification
        this.playNotificationSound();

        if (this.currentSession === 'focus') {
            this.sessionCount++;
            this.saveSettings();
            this.updateDurationInputs();

            this.showNotification(
                '🍅 Focus Session Complete!',
                `Great job! You completed a ${this.focusDuration / 60}-minute focus session. Time for a break!`
            );

            // Switch to break
            this.currentSession = 'break';
            this.timeLeft = this.breakDuration;

            window.ProDash.showNotification('Focus session complete! Starting break...', 'success');
        } else {
            this.showNotification(
                '☕ Break Time Over!',
                'Break time is over. Ready for another focus session?'
            );

            // Switch back to focus
            this.currentSession = 'focus';
            this.timeLeft = this.focusDuration;

            window.ProDash.showNotification('Break complete! Ready for focus session?', 'success');
        }

        this.updateDisplay();
        this.updateControls();
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    updateDisplay() {
        const timerDisplay = document.getElementById('timer-display');
        const timerLabel = document.getElementById('timer-label');

        if (timerDisplay) {
            timerDisplay.textContent = this.formatTime(this.timeLeft);
        }

        if (timerLabel) {
            timerLabel.textContent = this.currentSession === 'focus' ? 'Focus Time' : 'Break Time';
        }

        // Update document title with countdown
        if (this.isRunning && !this.isPaused) {
            document.title = `${this.formatTime(this.timeLeft)} - ${this.currentSession === 'focus' ? 'Focus' : 'Break'} | ProDash`;
        }

        // Update timer circle color
        const timerCircle = document.querySelector('.timer-circle');
        if (timerCircle) {
            const color = this.currentSession === 'focus' ? 'var(--accent-primary)' : 'var(--success)';
            timerCircle.style.borderColor = color;
        }

        // Update progress (optional visual enhancement)
        this.updateProgress();
    }

    updateProgress() {
        const totalTime = this.currentSession === 'focus' ? this.focusDuration : this.breakDuration;
        const progress = ((totalTime - this.timeLeft) / totalTime) * 100;

        // Create or update progress indicator
        let progressIndicator = document.querySelector('.timer-progress');
        if (!progressIndicator) {
            progressIndicator = document.createElement('div');
            progressIndicator.className = 'timer-progress';
            progressIndicator.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: ${progress}%;
                height: 4px;
                background: ${this.currentSession === 'focus' ? 'var(--accent-primary)' : 'var(--success)'};
                transition: width 1s ease;
                border-radius: 2px;
            `;

            const timerContainer = document.querySelector('.pomodoro-container');
            if (timerContainer) {
                timerContainer.style.position = 'relative';
                timerContainer.appendChild(progressIndicator);
            }
        } else {
            progressIndicator.style.width = `${progress}%`;
            progressIndicator.style.background = this.currentSession === 'focus' ? 'var(--accent-primary)' : 'var(--success)';
        }
    }

    updateControls() {
        const startBtn = document.getElementById('start-timer');
        const pauseBtn = document.getElementById('pause-timer');
        const resetBtn = document.getElementById('reset-timer');

        if (startBtn) {
            startBtn.textContent = this.isRunning && !this.isPaused ? 'Running...' :
                                  this.isPaused ? 'Resume' : 'Start';
            startBtn.disabled = this.isRunning && !this.isPaused;
        }

        if (pauseBtn) {
            pauseBtn.disabled = !this.isRunning || this.isPaused;
        }

        if (resetBtn) {
            resetBtn.disabled = !this.isRunning && !this.isPaused && this.timeLeft === (this.currentSession === 'focus' ? this.focusDuration : this.breakDuration);
        }
    }

    onShow() {
        this.updateDisplay();
        this.updateControls();
        this.updateDurationInputs();
    }

    onFocusModeChange(focusMode) {
        // In focus mode, make timer more prominent
        const timerCircle = document.querySelector('.timer-circle');
        if (timerCircle) {
            if (focusMode) {
                timerCircle.style.transform = 'scale(1.1)';
                timerCircle.style.boxShadow = '0 0 30px var(--accent-primary)';
            } else {
                timerCircle.style.transform = 'scale(1)';
                timerCircle.style.boxShadow = '0 8px 20px var(--shadow)';
            }
        }
    }

    handleKeyboard(e) {
        if (e.code === 'Space') {
            e.preventDefault();
            if (this.isRunning && !this.isPaused) {
                this.pauseTimer();
            } else {
                this.startTimer();
            }
        } else if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            this.resetTimer();
        }
    }

    // Clean up when switching modules
    cleanup() {
        if (this.timer) {
            clearInterval(this.timer);
        }

        // Reset document title
        document.title = 'ProDash - Professional Productivity Suite';
    }
}
