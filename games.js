/**
 * Physics Playground Module - Interactive Particle Physics Simulation
 * Features: Real-time particle physics, gravity wells, visual trails, and interactive controls
 */

export class GamesModule {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationId = null;
        this.mouse = { x: 0, y: 0, isPressed: false };
        this.isRunning = false;

        // Simulation settings
        this.settings = {
            particleCount: 100,
            showTrails: false,
            gravityStrength: 0.5,
            particleSpeed: 2,
            trailLength: 20,
            repulsion: false
        };

        // Visual settings
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
        ];

        this.trails = [];
    }

    async initialize() {
        this.render();
        this.setupCanvas();
        this.bindEvents();
        this.generateParticles();
    }

    render() {
        const gamesContainer = document.getElementById('games-module');
        if (!gamesContainer) return;

        gamesContainer.innerHTML = `
            <div class="physics-playground">
                <div class="playground-header">
                    <h2>Physics Playground</h2>
                    <p>Interactive particle physics simulation with gravity wells and beautiful trails</p>
                </div>

                <div class="playground-controls">
                    <div class="control-group">
                        <button id="play-pause-btn" class="control-btn primary">
                            <span class="btn-icon">▶️</span>
                            <span class="btn-text">Start</span>
                        </button>
                        <button id="reset-btn" class="control-btn">
                            <span class="btn-icon">🔄</span>
                            <span class="btn-text">Reset</span>
                        </button>
                    </div>

                    <div class="control-group">
                        <label class="control-label">
                            <span>Particles:</span>
                            <select id="particle-count">
                                <option value="50">50</option>
                                <option value="100" selected>100</option>
                                <option value="200">200</option>
                                <option value="300">300</option>
                            </select>
                        </label>

                        <label class="control-label">
                            <span>Gravity:</span>
                            <input type="range" id="gravity-slider" min="0" max="2" step="0.1" value="0.5">
                            <span id="gravity-value">0.5</span>
                        </label>
                    </div>

                    <div class="control-group">
                        <label class="control-checkbox">
                            <input type="checkbox" id="trails-toggle">
                            <span class="checkmark"></span>
                            <span>Show Trails</span>
                        </label>

                        <label class="control-checkbox">
                            <input type="checkbox" id="repulsion-toggle">
                            <span class="checkmark"></span>
                            <span>Repulsion Mode</span>
                        </label>
                    </div>
                </div>

                <div class="canvas-container">
                    <canvas id="physics-canvas"></canvas>
                    <div class="canvas-overlay">
                        <div class="instruction">Click and drag to create gravity wells!</div>
                    </div>
                </div>

                <div class="playground-stats">
                    <div class="stat">
                        <span class="stat-label">Particles:</span>
                        <span id="particle-count-display">100</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">FPS:</span>
                        <span id="fps-display">60</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Status:</span>
                        <span id="status-display">Stopped</span>
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('physics-playground-styles')) return;

        const style = document.createElement('style');
        style.id = 'physics-playground-styles';
        style.textContent = `
            .physics-playground {
                padding: 1.5rem;
                height: 100%;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .playground-header {
                text-align: center;
                margin-bottom: 1rem;
            }

            .playground-header h2 {
                color: var(--text-primary);
                margin: 0 0 0.5rem 0;
                font-size: 1.8rem;
                font-weight: 600;
            }

            .playground-header p {
                color: var(--text-secondary);
                margin: 0;
                font-size: 0.9rem;
            }

            .playground-controls {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                justify-content: center;
                align-items: center;
                padding: 1rem;
                background: var(--surface);
                border-radius: 12px;
                border: 1px solid var(--border);
            }

            .control-group {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            .control-btn {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                border: 1px solid var(--border);
                border-radius: 8px;
                background: var(--background);
                color: var(--text-primary);
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 0.9rem;
            }

            .control-btn:hover {
                background: var(--surface);
                transform: translateY(-1px);
            }

            .control-btn.primary {
                background: var(--primary);
                color: white;
                border-color: var(--primary);
            }

            .control-btn.primary:hover {
                background: var(--primary-hover);
            }

            .control-label {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.9rem;
                color: var(--text-primary);
            }

            .control-label select,
            .control-label input[type="range"] {
                padding: 0.25rem 0.5rem;
                border: 1px solid var(--border);
                border-radius: 6px;
                background: var(--background);
                color: var(--text-primary);
            }

            .control-checkbox {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
                font-size: 0.9rem;
                color: var(--text-primary);
            }

            .control-checkbox input[type="checkbox"] {
                display: none;
            }

            .checkmark {
                width: 18px;
                height: 18px;
                border: 2px solid var(--border);
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }

            .control-checkbox input[type="checkbox"]:checked + .checkmark {
                background: var(--primary);
                border-color: var(--primary);
            }

            .control-checkbox input[type="checkbox"]:checked + .checkmark::after {
                content: '✓';
                color: white;
                font-size: 12px;
                font-weight: bold;
            }

            .canvas-container {
                position: relative;
                width: 100%;
                max-width: 1200px;
                margin: 0 auto;
                height: 60vh;
                min-height: 400px;
                max-height: 600px;
                border-radius: 12px;
                overflow: hidden;
                background: #000;
                border: 2px solid var(--border);
            }

            #physics-canvas {
                width: 100%;
                height: 100%;
                display: block;
                cursor: crosshair;
            }

            .canvas-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
                display: flex;
                align-items: flex-end;
                justify-content: center;
                padding: 1rem;
            }

            .instruction {
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.85rem;
                opacity: 0.8;
            }

            .playground-stats {
                display: flex;
                justify-content: center;
                gap: 2rem;
                padding: 1rem;
                background: var(--surface);
                border-radius: 12px;
                border: 1px solid var(--border);
            }

            .stat {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.25rem;
            }

            .stat-label {
                font-size: 0.8rem;
                color: var(--text-secondary);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .stat-value {
                font-size: 1.1rem;
                font-weight: 600;
                color: var(--text-primary);
            }

            @media (max-width: 768px) {
                .physics-playground {
                    padding: 1rem;
                }

                .playground-controls {
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .control-group {
                    flex-wrap: wrap;
                    justify-content: center;
                }

                .playground-stats {
                    gap: 1rem;
                }

                .canvas-container {
                    height: 50vh;
                    min-height: 300px;
                    max-height: 400px;
                }
            }

            @media (max-width: 480px) {
                .canvas-container {
                    height: 45vh;
                    min-height: 250px;
                    max-height: 350px;
                }

                .playground-header h2 {
                    font-size: 1.5rem;
                }

                .control-btn {
                    padding: 0.4rem 0.8rem;
                    font-size: 0.8rem;
                }
            }
        `;

        document.head.appendChild(style);
    }

    setupCanvas() {
        this.canvas = document.getElementById('physics-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Wait for next frame to ensure DOM is fully rendered
        requestAnimationFrame(() => {
            this.initializeCanvasSize();
            window.addEventListener('resize', () => this.resizeCanvas());
        });
    }

    initializeCanvasSize() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();

        // Ensure we have valid dimensions
        if (rect.width === 0 || rect.height === 0) {
            // Retry after a short delay if container isn't ready
            setTimeout(() => this.initializeCanvasSize(), 100);
            return;
        }

        const dpr = window.devicePixelRatio || 1;

        // Set canvas actual size
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        // Set canvas display size
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';

        // Scale context for high DPI
        this.ctx.scale(dpr, dpr);

        // Now draw the initial frame
        this.drawFrame();
    }

    resizeCanvas() {
        if (!this.canvas) return;

        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();

        if (rect.width === 0 || rect.height === 0) return;

        const dpr = window.devicePixelRatio || 1;

        // Reset transform before resizing
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';

        this.ctx.scale(dpr, dpr);

        // Redraw immediately after resize
        this.drawFrame();
    }

    bindEvents() {
        // Play/Pause button
        document.getElementById('play-pause-btn').addEventListener('click', () => {
            this.toggleSimulation();
        });

        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetSimulation();
        });

        // Particle count
        document.getElementById('particle-count').addEventListener('change', (e) => {
            this.settings.particleCount = parseInt(e.target.value);
            this.generateParticles();
            document.getElementById('particle-count-display').textContent = e.target.value;
        });

        // Gravity slider
        const gravitySlider = document.getElementById('gravity-slider');
        gravitySlider.addEventListener('input', (e) => {
            this.settings.gravityStrength = parseFloat(e.target.value);
            document.getElementById('gravity-value').textContent = e.target.value;
        });

        // Trails toggle
        document.getElementById('trails-toggle').addEventListener('change', (e) => {
            this.settings.showTrails = e.target.checked;
            if (!e.target.checked) {
                this.trails = [];
            }
        });

        // Repulsion toggle
        document.getElementById('repulsion-toggle').addEventListener('change', (e) => {
            this.settings.repulsion = e.target.checked;
        });

        // Mouse events for gravity wells
        this.canvas.addEventListener('mousedown', (e) => {
            this.mouse.isPressed = true;
            this.updateMousePosition(e);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            this.updateMousePosition(e);
        });

        this.canvas.addEventListener('mouseup', () => {
            this.mouse.isPressed = false;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.isPressed = false;
        });

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.mouse.isPressed = true;
            this.updateTouchPosition(e);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.updateTouchPosition(e);
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.mouse.isPressed = false;
        });
    }

    updateMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
    }

    updateTouchPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        this.mouse.x = touch.clientX - rect.left;
        this.mouse.y = touch.clientY - rect.top;
    }

    generateParticles() {
        this.particles = [];
        const canvasRect = this.canvas.getBoundingClientRect();

        for (let i = 0; i < this.settings.particleCount; i++) {
            const particle = {
                x: Math.random() * canvasRect.width,
                y: Math.random() * canvasRect.height,
                vx: (Math.random() - 0.5) * this.settings.particleSpeed,
                vy: (Math.random() - 0.5) * this.settings.particleSpeed,
                radius: Math.random() * 3 + 1,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                life: 1,
                trail: []
            };
            this.particles.push(particle);
        }
    }

    toggleSimulation() {
        if (this.isRunning) {
            this.stopSimulation();
        } else {
            this.startSimulation();
        }
    }

    startSimulation() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.animate();

        // Update UI
        const btn = document.getElementById('play-pause-btn');
        btn.querySelector('.btn-icon').textContent = '⏸️';
        btn.querySelector('.btn-text').textContent = 'Pause';
        document.getElementById('status-display').textContent = 'Running';
    }

    stopSimulation() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        // Update UI
        const btn = document.getElementById('play-pause-btn');
        btn.querySelector('.btn-icon').textContent = '▶️';
        btn.querySelector('.btn-text').textContent = 'Start';
        document.getElementById('status-display').textContent = 'Stopped';
    }

    resetSimulation() {
        this.stopSimulation();
        this.trails = [];
        this.generateParticles();
        this.drawFrame();
    }

    animate() {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;

        // Calculate FPS
        this.frameCount++;
        if (this.frameCount % 60 === 0) {
            const fps = Math.round(1000 / deltaTime);
            document.getElementById('fps-display').textContent = fps;
        }

        this.updateParticles(deltaTime);
        this.drawFrame();

        this.lastTime = currentTime;
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    updateParticles(deltaTime) {
        const canvasRect = this.canvas.getBoundingClientRect();
        const dt = deltaTime / 16.67; // Normalize to 60fps

        this.particles.forEach(particle => {
            // Store previous position for trails
            if (this.settings.showTrails) {
                particle.trail.push({ x: particle.x, y: particle.y });
                if (particle.trail.length > this.settings.trailLength) {
                    particle.trail.shift();
                }
            }

            // Apply gravity well effect when mouse is pressed
            if (this.mouse.isPressed) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 0) {
                    const force = this.settings.gravityStrength / (distance * 0.01);
                    const forceX = (dx / distance) * force * dt;
                    const forceY = (dy / distance) * force * dt;

                    if (this.settings.repulsion) {
                        particle.vx -= forceX;
                        particle.vy -= forceY;
                    } else {
                        particle.vx += forceX;
                        particle.vy += forceY;
                    }
                }
            }

            // Apply particle-to-particle interactions
            this.particles.forEach(other => {
                if (particle !== other) {
                    const dx = other.x - particle.x;
                    const dy = other.y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance > 0 && distance < 50) {
                        const force = 0.01 / (distance * distance);
                        const forceX = (dx / distance) * force * dt;
                        const forceY = (dy / distance) * force * dt;

                        // Slight attraction/repulsion between particles
                        particle.vx += forceX * 0.1;
                        particle.vy += forceY * 0.1;
                    }
                }
            });

            // Update position
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;

            // Bounce off edges with some energy loss
            if (particle.x <= particle.radius || particle.x >= canvasRect.width - particle.radius) {
                particle.vx *= -0.8;
                particle.x = Math.max(particle.radius, Math.min(canvasRect.width - particle.radius, particle.x));
            }

            if (particle.y <= particle.radius || particle.y >= canvasRect.height - particle.radius) {
                particle.vy *= -0.8;
                particle.y = Math.max(particle.radius, Math.min(canvasRect.height - particle.radius, particle.y));
            }

            // Apply slight friction
            particle.vx *= 0.999;
            particle.vy *= 0.999;
        });
    }

    drawFrame() {
        const canvasRect = this.canvas.getBoundingClientRect();

        // Clear canvas with slight trail effect
        if (this.settings.showTrails) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fillRect(0, 0, canvasRect.width, canvasRect.height);
        } else {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
            this.ctx.fillRect(0, 0, canvasRect.width, canvasRect.height);
        }

        // Draw particles and trails
        this.particles.forEach(particle => {
            // Draw trail
            if (this.settings.showTrails && particle.trail.length > 1) {
                this.ctx.strokeStyle = particle.color;
                this.ctx.lineWidth = 1;
                this.ctx.globalAlpha = 0.3;
                this.ctx.beginPath();

                for (let i = 0; i < particle.trail.length - 1; i++) {
                    const alpha = i / particle.trail.length;
                    this.ctx.globalAlpha = alpha * 0.3;

                    if (i === 0) {
                        this.ctx.moveTo(particle.trail[i].x, particle.trail[i].y);
                    } else {
                        this.ctx.lineTo(particle.trail[i].x, particle.trail[i].y);
                    }
                }
                this.ctx.stroke();
            }

            // Draw particle with glow effect
            this.ctx.globalAlpha = 1;

            // Outer glow
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.radius * 3
            );
            gradient.addColorStop(0, particle.color);
            gradient.addColorStop(1, 'transparent');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius * 3, 0, Math.PI * 2);
            this.ctx.fill();

            // Inner particle
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw gravity well indicator
        if (this.mouse.isPressed) {
            const gradient = this.ctx.createRadialGradient(
                this.mouse.x, this.mouse.y, 0,
                this.mouse.x, this.mouse.y, 50
            );

            if (this.settings.repulsion) {
                gradient.addColorStop(0, 'rgba(255, 100, 100, 0.5)');
                gradient.addColorStop(1, 'rgba(255, 100, 100, 0)');
            } else {
                gradient.addColorStop(0, 'rgba(100, 255, 100, 0.5)');
                gradient.addColorStop(1, 'rgba(100, 255, 100, 0)');
            }

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(this.mouse.x, this.mouse.y, 50, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.globalAlpha = 1;
    }
}
