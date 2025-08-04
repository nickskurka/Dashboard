/**
 * Sprite Generator Module - Pixel Art Creation Tool
 * Features: Canvas-based drawing, color picker, multiple tools, undo/redo, export functionality
 */

export class SpriteModule {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.colorWheel = null;
        this.colorWheelCtx = null;
        this.spriteEditor = null;
    }

    async initialize() {
        this.render();
        this.initializeSpriteEditor();
    }

    render() {
        const spriteContainer = document.getElementById('sprite-module');
        if (!spriteContainer) return;

        spriteContainer.innerHTML = `
            <div class="sprite-generator">
                <div class="sprite-main-container">
                    <div class="sprite-canvas-container">
                        <div class="sprite-grid-wrapper">
                            <canvas id="sprite-canvas" width="512" height="512"></canvas>
                        </div>
                    </div>

                    <div class="sprite-ui-panel">
                        <div class="sprite-ui-section sprite-color-picker-section">
                            <h3>Color Picker</h3>
                            <canvas class="sprite-color-wheel" id="sprite-color-wheel" width="120" height="120"></canvas>
                            <input type="range" class="sprite-slider sprite-brightness-slider" id="sprite-brightness-slider" min="0" max="100" value="100">
                            <div class="sprite-rgb-inputs">
                                <div class="sprite-rgb-input">
                                    <label>R</label>
                                    <input type="number" id="sprite-rgb-r" min="0" max="255" value="255">
                                </div>
                                <div class="sprite-rgb-input">
                                    <label>G</label>
                                    <input type="number" id="sprite-rgb-g" min="0" max="255" value="0">
                                </div>
                                <div class="sprite-rgb-input">
                                    <label>B</label>
                                    <input type="number" id="sprite-rgb-b" min="0" max="255" value="0">
                                </div>
                            </div>
                            <div class="sprite-color-preview" id="sprite-color-preview" style="background-color: rgb(255, 0, 0);"></div>
                        </div>

                        <div class="sprite-ui-section sprite-grid-size-section">
                            <h3>Grid Size</h3>
                            <div class="sprite-size-buttons">
                                <button class="sprite-size-button" data-size="8">8x8</button>
                                <button class="sprite-size-button" data-size="16">16x16</button>
                                <button class="sprite-size-button active" data-size="32">32x32</button>
                                <button class="sprite-size-button" data-size="64">64x64</button>
                                <button class="sprite-size-button" data-size="128">128x128</button>
                            </div>
                        </div>

                        <div class="sprite-ui-section sprite-tools-section">
                            <h3>Tools</h3>
                            <div class="sprite-undo-redo">
                                <button id="sprite-undo-btn">↶ Undo</button>
                                <button id="sprite-redo-btn">↷ Redo</button>
                            </div>
                            <div class="sprite-zoom-controls">
                                <button id="sprite-zoom-out-btn" class="sprite-zoom-button">− Zoom Out</button>
                                <button id="sprite-zoom-in-btn" class="sprite-zoom-button">+ Zoom In</button>
                            </div>
                            <div class="sprite-tool-buttons">
                                <button class="sprite-tool-button active" data-tool="brush">🖌️ Brush</button>
                                <button class="sprite-tool-button" data-tool="bucket">🪣 Bucket Fill</button>
                                <button class="sprite-tool-button" data-tool="rectangle">▭ Rectangle</button>
                                <button class="sprite-tool-button" data-tool="eyedropper">🎨 Eyedropper</button>
                                <button class="sprite-tool-button sprite-eraser-toggle" id="sprite-eraser-toggle">🗑️ Eraser Mode</button>
                            </div>
                        </div>

                        <div class="sprite-ui-section sprite-export-section">
                            <h3>Export</h3>
                            <div class="sprite-filename-input">
                                <label for="sprite-filename-input">Filename:</label>
                                <input type="text" id="sprite-filename-input" placeholder="Enter filename without extension" value="sprite">
                            </div>
                            <div class="sprite-export-buttons">
                                <button class="sprite-export-button" data-format="png">PNG</button>
                                <button class="sprite-export-button" data-format="jpg">JPG</button>
                                <button class="sprite-export-button" data-format="bmp">BMP</button>
                                <button class="sprite-export-button" data-format="gif">GIF</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="sprite-status-bar" id="sprite-status-bar">
                    Tool: Brush | Grid: 32x32 | Color: RGB(255, 0, 0)
                </div>
            </div>
        `;

        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('sprite-generator-styles')) return;

        const style = document.createElement('style');
        style.id = 'sprite-generator-styles';
        style.textContent = `
            .sprite-generator {
                height: 100%;
                display: flex;
                flex-direction: column;
                background: var(--background);
                color: var(--text-primary);
            }

            .sprite-main-container {
                display: flex;
                flex: 1;
                height: calc(100vh - 120px);
                overflow: hidden;
            }

            .sprite-canvas-container {
                flex: 1;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 24px;
                background: var(--surface);
                position: relative;
            }

            .sprite-canvas-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background:
                    radial-gradient(circle at 25% 25%, rgba(14, 165, 233, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 75% 75%, rgba(34, 197, 94, 0.1) 0%, transparent 50%);
                pointer-events: none;
            }

            .sprite-grid-wrapper {
                position: relative;
                border: 2px solid var(--border);
                border-radius: 12px;
                background: #ffffff;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                overflow: hidden;
            }

            #sprite-canvas {
                display: block;
                cursor: crosshair;
                image-rendering: pixelated;
                image-rendering: -moz-crisp-edges;
                image-rendering: crisp-edges;
                border-radius: 10px;
            }

            .sprite-ui-panel {
                width: 280px;
                background: var(--surface);
                border-left: 1px solid var(--border);
                padding: 20px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 20px;
                box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
            }

            .sprite-ui-panel::-webkit-scrollbar {
                width: 6px;
            }

            .sprite-ui-panel::-webkit-scrollbar-track {
                background: var(--background);
                border-radius: 3px;
            }

            .sprite-ui-panel::-webkit-scrollbar-thumb {
                background: var(--border);
                border-radius: 3px;
            }

            .sprite-ui-panel::-webkit-scrollbar-thumb:hover {
                background: var(--accent-primary);
            }

            .sprite-ui-section {
                background: var(--background);
                border: 1px solid var(--border);
                border-radius: 12px;
                padding: 16px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                transition: all 0.2s ease;
            }

            .sprite-ui-section:hover {
                border-color: var(--accent-primary);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .sprite-ui-section h3 {
                margin-bottom: 16px;
                color: var(--text-primary);
                font-size: 16px;
                font-weight: 600;
                letter-spacing: -0.01em;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .sprite-ui-section h3::before {
                content: '';
                width: 3px;
                height: 16px;
                background: var(--accent-primary);
                border-radius: 2px;
            }

            .sprite-color-picker-section {
                text-align: center;
            }

            .sprite-color-wheel {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                margin: 12px auto;
                position: relative;
                cursor: crosshair;
                border: 3px solid var(--border);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transition: all 0.2s ease;
            }

            .sprite-color-wheel:hover {
                border-color: var(--accent-primary);
                transform: scale(1.02);
            }

            .sprite-brightness-slider {
                width: 100%;
                margin: 12px 0;
            }

            .sprite-rgb-inputs {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                margin: 12px 0;
            }

            .sprite-rgb-input {
                text-align: center;
            }

            .sprite-rgb-input label {
                display: block;
                font-size: 11px;
                font-weight: 500;
                margin-bottom: 4px;
                color: var(--text-secondary);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .sprite-rgb-input input {
                width: 100%;
                padding: 8px 6px;
                text-align: center;
                border: 1px solid var(--border);
                border-radius: 6px;
                background: var(--surface);
                color: var(--text-primary);
                font-size: 12px;
                font-weight: 500;
                transition: all 0.2s ease;
            }

            .sprite-rgb-input input:focus {
                outline: none;
                border-color: var(--accent-primary);
                box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
            }

            .sprite-color-preview {
                width: 100%;
                height: 36px;
                border: 2px solid var(--border);
                border-radius: 8px;
                margin: 12px 0;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                transition: all 0.2s ease;
            }

            .sprite-color-preview:hover {
                transform: scale(1.02);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .sprite-size-buttons {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
            }

            .sprite-size-button {
                padding: 10px 8px;
                border: 1px solid var(--border);
                background: var(--surface);
                color: var(--text-secondary);
                cursor: pointer;
                border-radius: 8px;
                transition: all 0.2s ease;
                font-size: 12px;
                font-weight: 500;
                position: relative;
                overflow: hidden;
            }

            .sprite-size-button:hover {
                background: var(--background);
                color: var(--text-primary);
                border-color: var(--accent-primary);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .sprite-size-button.active {
                background: var(--accent-primary);
                color: white;
                border-color: var(--accent-primary);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .sprite-tool-buttons {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .sprite-tool-button {
                padding: 12px 16px;
                border: 1px solid var(--border);
                background: var(--surface);
                color: var(--text-secondary);
                cursor: pointer;
                border-radius: 8px;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 13px;
                font-weight: 500;
            }

            .sprite-tool-button:hover {
                background: var(--background);
                color: var(--text-primary);
                border-color: var(--accent-primary);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .sprite-tool-button.active {
                background: var(--accent-primary);
                color: white;
                border-color: var(--accent-primary);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .sprite-eraser-toggle {
                background: var(--error) !important;
                border-color: var(--error) !important;
                color: white !important;
            }

            .sprite-eraser-toggle:hover {
                background: #dc2626 !important;
            }

            .sprite-eraser-toggle.active {
                background: #dc2626 !important;
                box-shadow: 0 0 20px rgba(239, 68, 68, 0.3) !important;
            }

            .sprite-export-buttons {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
            }

            .sprite-export-button {
                padding: 10px 8px;
                border: 1px solid var(--accent-primary);
                background: var(--accent-primary);
                color: white;
                cursor: pointer;
                border-radius: 8px;
                transition: all 0.2s ease;
                text-align: center;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .sprite-export-button:hover {
                background: var(--primary-hover);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .sprite-status-bar {
                background: var(--surface);
                color: var(--text-secondary);
                padding: 12px 16px;
                font-size: 12px;
                font-weight: 500;
                border-top: 1px solid var(--border);
                box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
            }

            .sprite-slider {
                width: 100%;
                height: 20px;
                border-radius: 10px;
                outline: none;
                -webkit-appearance: none;
                background: linear-gradient(to right, #000 0%, #fff 100%);
                border: 2px solid var(--border);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                transition: all 0.2s ease;
            }

            .sprite-slider:hover {
                border-color: var(--accent-primary);
            }

            .sprite-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: var(--accent-primary);
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transition: all 0.2s ease;
            }

            .sprite-slider::-webkit-slider-thumb:hover {
                background: var(--primary-hover);
                transform: scale(1.1);
            }

            .sprite-undo-redo {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
            }

            .sprite-undo-redo button {
                flex: 1;
                padding: 10px 12px;
                border: 1px solid var(--border);
                background: var(--surface);
                color: var(--text-secondary);
                cursor: pointer;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                transition: all 0.2s ease;
            }

            .sprite-undo-redo button:hover:not(:disabled) {
                background: var(--success);
                color: white;
                border-color: var(--success);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .sprite-undo-redo button:disabled {
                background: var(--background);
                color: var(--text-muted);
                cursor: not-allowed;
                border-color: var(--border);
            }

            .sprite-zoom-controls {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
            }

            .sprite-zoom-button {
                flex: 1;
                padding: 10px 12px;
                border: 1px solid var(--border);
                background: var(--surface);
                color: var(--text-secondary);
                cursor: pointer;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                transition: all 0.2s ease;
            }

            .sprite-zoom-button:hover {
                background: var(--warning);
                color: white;
                border-color: var(--warning);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .sprite-filename-input {
                margin-bottom: 12px;
            }

            .sprite-filename-input label {
                display: block;
                margin-bottom: 4px;
                font-size: 11px;
                font-weight: 500;
                color: var(--text-secondary);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .sprite-filename-input input {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid var(--border);
                border-radius: 6px;
                background: var(--surface);
                color: var(--text-primary);
                font-size: 13px;
                transition: all 0.2s ease;
            }

            .sprite-filename-input input:focus {
                outline: none;
                border-color: var(--accent-primary);
                box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
            }

            @media (max-width: 768px) {
                .sprite-ui-panel {
                    width: 240px;
                    padding: 16px;
                }

                .sprite-canvas-container {
                    padding: 16px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    initializeSpriteEditor() {
        this.spriteEditor = new SpriteEditor();
    }

    onShow() {
        // Called when the module is displayed
        if (this.spriteEditor) {
            this.spriteEditor.updateCanvas();
        }
    }

    onResize() {
        // Handle window resize
        if (this.spriteEditor) {
            this.spriteEditor.updateCanvas();
        }
    }
}

// Sprite Editor class - embedded version of the original SpriteGenerator
class SpriteEditor {
    constructor() {
        this.canvas = document.getElementById('sprite-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.colorWheel = document.getElementById('sprite-color-wheel');
        this.colorWheelCtx = this.colorWheel.getContext('2d');

        // State
        this.gridSize = 32;
        this.baseCanvasSize = 512;
        this.zoomLevel = 1;
        this.pixelSize = this.baseCanvasSize / this.gridSize;
        this.currentTool = 'brush';
        this.eraserMode = false;
        this.currentColor = { r: 255, g: 0, b: 0 };
        this.brightness = 1;
        this.hue = 0;
        this.saturation = 1;

        // Grid data
        this.grid = this.createEmptyGrid();
        this.history = [this.copyGrid(this.grid)];
        this.historyIndex = 0;

        // Mouse state
        this.isDrawing = false;
        this.isRectSelecting = false;
        this.rectStart = null;
        this.rectEnd = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.drawColorWheel();
        this.updateCanvas();
        this.updateStatus();
    }

    createEmptyGrid() {
        const grid = [];
        for (let y = 0; y < this.gridSize; y++) {
            grid[y] = [];
            for (let x = 0; x < this.gridSize; x++) {
                grid[y][x] = null;
            }
        }
        return grid;
    }

    copyGrid(grid) {
        return grid.map(row => [...row]);
    }

    setupEventListeners() {
        // Canvas events
        this.canvas.addEventListener('mousedown', this.handleCanvasMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleCanvasMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleCanvasMouseUp.bind(this));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        // Color wheel events
        this.colorWheel.addEventListener('click', this.handleColorWheelClick.bind(this));

        // Brightness slider
        document.getElementById('sprite-brightness-slider').addEventListener('input', (e) => {
            this.brightness = e.target.value / 100;
            this.updateColorFromHSB();
        });

        // RGB inputs
        ['r', 'g', 'b'].forEach(component => {
            document.getElementById(`sprite-rgb-${component}`).addEventListener('input', (e) => {
                this.currentColor[component] = parseInt(e.target.value) || 0;
                this.updateColorPreview();
                this.updateStatus();
            });
        });

        // Grid size buttons
        document.querySelectorAll('.sprite-size-button').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.sprite-size-button').forEach(b => b.classList.remove('active'));
                button.classList.add('active');
                this.changeGridSize(parseInt(button.dataset.size));
            });
        });

        // Tool buttons
        document.querySelectorAll('.sprite-tool-button:not(.sprite-eraser-toggle)').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.sprite-tool-button:not(.sprite-eraser-toggle)').forEach(b => b.classList.remove('active'));
                button.classList.add('active');
                this.currentTool = button.dataset.tool;
                this.updateStatus();
            });
        });

        // Eraser toggle
        document.getElementById('sprite-eraser-toggle').addEventListener('click', () => {
            this.eraserMode = !this.eraserMode;
            const button = document.getElementById('sprite-eraser-toggle');
            button.classList.toggle('active', this.eraserMode);
            this.updateStatus();
        });

        // Undo/Redo
        document.getElementById('sprite-undo-btn').addEventListener('click', () => this.undo());
        document.getElementById('sprite-redo-btn').addEventListener('click', () => this.redo());

        // Export buttons
        document.querySelectorAll('.sprite-export-button').forEach(button => {
            button.addEventListener('click', () => {
                this.exportImage(button.dataset.format);
            });
        });

        // Zoom buttons
        document.getElementById('sprite-zoom-in-btn').addEventListener('click', () => this.changeZoom(1));
        document.getElementById('sprite-zoom-out-btn').addEventListener('click', () => this.changeZoom(-1));
    }

    drawColorWheel() {
        const centerX = this.colorWheel.width / 2;
        const centerY = this.colorWheel.height / 2;
        const radius = Math.min(centerX, centerY) - 5;

        for (let angle = 0; angle < 360; angle++) {
            const startAngle = (angle - 1) * Math.PI / 180;
            const endAngle = angle * Math.PI / 180;

            for (let r = 0; r < radius; r++) {
                const sat = r / radius;
                const hsl = `hsl(${angle}, ${sat * 100}%, 50%)`;

                this.colorWheelCtx.beginPath();
                this.colorWheelCtx.arc(centerX, centerY, r, startAngle, endAngle);
                this.colorWheelCtx.strokeStyle = hsl;
                this.colorWheelCtx.lineWidth = 1;
                this.colorWheelCtx.stroke();
            }
        }
    }

    handleColorWheelClick(e) {
        const rect = this.colorWheel.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = this.colorWheel.width / 2;
        const centerY = this.colorWheel.height / 2;

        const deltaX = x - centerX;
        const deltaY = y - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const radius = Math.min(centerX, centerY) - 5;

        if (distance <= radius) {
            this.hue = (Math.atan2(deltaY, deltaX) * 180 / Math.PI + 360) % 360;
            this.saturation = Math.min(distance / radius, 1);
            this.updateColorFromHSB();
        }
    }

    updateColorFromHSB() {
        const h = this.hue / 360;
        const s = this.saturation;
        const v = this.brightness;

        const c = v * s;
        const x = c * (1 - Math.abs((h * 6) % 2 - 1));
        const m = v - c;

        let r, g, b;
        if (h < 1/6) {
            r = c; g = x; b = 0;
        } else if (h < 2/6) {
            r = x; g = c; b = 0;
        } else if (h < 3/6) {
            r = 0; g = c; b = x;
        } else if (h < 4/6) {
            r = 0; g = x; b = c;
        } else if (h < 5/6) {
            r = x; g = 0; b = c;
        } else {
            r = c; g = 0; b = x;
        }

        this.currentColor.r = Math.round((r + m) * 255);
        this.currentColor.g = Math.round((g + m) * 255);
        this.currentColor.b = Math.round((b + m) * 255);

        document.getElementById('sprite-rgb-r').value = this.currentColor.r;
        document.getElementById('sprite-rgb-g').value = this.currentColor.g;
        document.getElementById('sprite-rgb-b').value = this.currentColor.b;

        this.updateColorPreview();
        this.updateStatus();
    }

    updateColorPreview() {
        const preview = document.getElementById('sprite-color-preview');
        preview.style.backgroundColor = `rgb(${this.currentColor.r}, ${this.currentColor.g}, ${this.currentColor.b})`;
    }

    updateStatus() {
        const status = document.getElementById('sprite-status-bar');
        const tool = this.eraserMode ? 'Eraser' : this.currentTool.charAt(0).toUpperCase() + this.currentTool.slice(1);
        status.textContent = `Tool: ${tool} | Grid: ${this.gridSize}x${this.gridSize} | Color: RGB(${this.currentColor.r}, ${this.currentColor.g}, ${this.currentColor.b})`;
    }

    handleCanvasMouseDown(e) {
        this.isDrawing = true;
        const { x, y } = this.getGridPosition(e);

        if (this.currentTool === 'rectangle') {
            this.isRectSelecting = true;
            this.rectStart = { x, y };
        } else {
            this.drawPixel(x, y);
        }
    }

    handleCanvasMouseMove(e) {
        if (!this.isDrawing) return;

        const { x, y } = this.getGridPosition(e);

        if (this.currentTool === 'rectangle' && this.isRectSelecting) {
            this.rectEnd = { x, y };
            this.updateCanvas();
            this.drawRectanglePreview();
        } else if (this.currentTool === 'brush') {
            this.drawPixel(x, y);
        }
    }

    handleCanvasMouseUp(e) {
        if (this.currentTool === 'rectangle' && this.isRectSelecting) {
            const { x, y } = this.getGridPosition(e);
            this.drawRectangle(this.rectStart.x, this.rectStart.y, x, y);
            this.isRectSelecting = false;
            this.rectStart = null;
            this.rectEnd = null;
        }

        if (this.isDrawing) {
            this.saveState();
        }

        this.isDrawing = false;
    }

    getGridPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const x = Math.floor(((e.clientX - rect.left) * scaleX) / this.pixelSize);
        const y = Math.floor(((e.clientY - rect.top) * scaleY) / this.pixelSize);

        return {
            x: Math.max(0, Math.min(x, this.gridSize - 1)),
            y: Math.max(0, Math.min(y, this.gridSize - 1))
        };
    }

    drawPixel(x, y) {
        if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            if (this.currentTool === 'eyedropper') {
                const color = this.grid[y][x];
                if (color) {
                    this.currentColor = { ...color };
                    document.getElementById('sprite-rgb-r').value = this.currentColor.r;
                    document.getElementById('sprite-rgb-g').value = this.currentColor.g;
                    document.getElementById('sprite-rgb-b').value = this.currentColor.b;
                    this.updateColorPreview();
                    this.updateStatus();
                }
                return;
            }

            if (this.currentTool === 'bucket') {
                this.bucketFill(x, y);
            } else {
                this.grid[y][x] = this.eraserMode ? null : { ...this.currentColor };
            }
            this.updateCanvas();
        }
    }

    drawRectangle(x1, y1, x2, y2) {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);

        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                this.grid[y][x] = this.eraserMode ? null : { ...this.currentColor };
            }
        }
        this.updateCanvas();
    }

    drawRectanglePreview() {
        if (!this.rectStart || !this.rectEnd) return;

        const minX = Math.min(this.rectStart.x, this.rectEnd.x);
        const maxX = Math.max(this.rectStart.x, this.rectEnd.x);
        const minY = Math.min(this.rectStart.y, this.rectEnd.y);
        const maxY = Math.max(this.rectStart.y, this.rectEnd.y);

        this.ctx.strokeStyle = this.eraserMode ? '#ff0000' : `rgb(${this.currentColor.r}, ${this.currentColor.g}, ${this.currentColor.b})`;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
            minX * this.pixelSize,
            minY * this.pixelSize,
            (maxX - minX + 1) * this.pixelSize,
            (maxY - minY + 1) * this.pixelSize
        );
    }

    bucketFill(startX, startY) {
        const targetColor = this.grid[startY][startX];
        const fillColor = this.eraserMode ? null : { ...this.currentColor };

        if (this.colorsEqual(targetColor, fillColor)) return;

        const stack = [{ x: startX, y: startY }];

        while (stack.length > 0) {
            const { x, y } = stack.pop();

            if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) continue;
            if (!this.colorsEqual(this.grid[y][x], targetColor)) continue;

            this.grid[y][x] = fillColor;

            stack.push({ x: x + 1, y });
            stack.push({ x: x - 1, y });
            stack.push({ x, y: y + 1 });
            stack.push({ x, y: y - 1 });
        }
    }

    colorsEqual(color1, color2) {
        if (color1 === null && color2 === null) return true;
        if (color1 === null || color2 === null) return false;
        return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b;
    }

    updateCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw checkerboard background
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#e0e0e0';
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if ((x + y) % 2 === 0) {
                    this.ctx.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
                }
            }
        }

        // Draw pixels
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const color = this.grid[y][x];
                if (color) {
                    this.ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
                    this.ctx.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
                }
            }
        }

        // Draw grid lines
        this.ctx.strokeStyle = '#cccccc';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.gridSize; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.pixelSize, 0);
            this.ctx.lineTo(i * this.pixelSize, this.canvas.height);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.pixelSize);
            this.ctx.lineTo(this.canvas.width, i * this.pixelSize);
            this.ctx.stroke();
        }
    }

    changeGridSize(newSize) {
        this.gridSize = newSize;
        this.pixelSize = this.baseCanvasSize / this.gridSize;
        this.grid = this.createEmptyGrid();
        this.saveState();
        this.updateCanvas();
        this.updateStatus();
    }

    changeZoom(direction) {
        const oldZoom = this.zoomLevel;
        this.zoomLevel = Math.max(0.5, Math.min(3, this.zoomLevel + direction * 0.25));

        if (this.zoomLevel !== oldZoom) {
            const newSize = this.baseCanvasSize * this.zoomLevel;
            this.canvas.style.width = newSize + 'px';
            this.canvas.style.height = newSize + 'px';
        }
    }

    saveState() {
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(this.copyGrid(this.grid));
        this.historyIndex = this.history.length - 1;

        document.getElementById('sprite-undo-btn').disabled = this.historyIndex <= 0;
        document.getElementById('sprite-redo-btn').disabled = this.historyIndex >= this.history.length - 1;
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.grid = this.copyGrid(this.history[this.historyIndex]);
            this.updateCanvas();

            document.getElementById('sprite-undo-btn').disabled = this.historyIndex <= 0;
            document.getElementById('sprite-redo-btn').disabled = this.historyIndex >= this.history.length - 1;
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.grid = this.copyGrid(this.history[this.historyIndex]);
            this.updateCanvas();

            document.getElementById('sprite-undo-btn').disabled = this.historyIndex <= 0;
            document.getElementById('sprite-redo-btn').disabled = this.historyIndex >= this.history.length - 1;
        }
    }

    exportImage(format) {
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = this.gridSize;
        exportCanvas.height = this.gridSize;
        const exportCtx = exportCanvas.getContext('2d');

        // Draw only the pixels without grid lines
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const color = this.grid[y][x];
                if (color) {
                    exportCtx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
                    exportCtx.fillRect(x, y, 1, 1);
                }
            }
        }

        const filename = document.getElementById('sprite-filename-input').value || 'sprite';
        const mimeType = format === 'png' ? 'image/png' :
                         format === 'jpg' ? 'image/jpeg' :
                         format === 'bmp' ? 'image/bmp' : 'image/gif';

        exportCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.${format}`;
            a.click();
            URL.revokeObjectURL(url);
        }, mimeType);
    }
}
