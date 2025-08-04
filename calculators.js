/**
 * Calculators Module - Multi-Calculator Suite
 * Features: Basic, Scientific, Financial, Unit Converter, and Graphing calculators
 */

export class CalculatorsModule {
    constructor() {
        this.currentCalculator = 'basic';
        this.display = '0';
        this.previousValue = null;
        this.operation = null;
        this.waitingForOperand = false;
        this.memory = 0;
    }

    async initialize() {
        this.bindEvents();
        this.showCalculator('basic');
    }

    bindEvents() {
        // Calculator tabs
        const calcTabs = document.querySelectorAll('.calc-tab');
        calcTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const calcType = e.target.dataset.calc;
                this.showCalculator(calcType);
            });
        });
    }

    showCalculator(type) {
        this.currentCalculator = type;
        this.updateTabs();
        this.renderCalculator();
    }

    updateTabs() {
        document.querySelectorAll('.calc-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.calc === this.currentCalculator);
        });
    }

    renderCalculator() {
        const content = document.getElementById('calculator-content');
        if (!content) return;

        switch (this.currentCalculator) {
            case 'basic':
                content.innerHTML = this.getBasicCalculatorHTML();
                this.bindBasicCalculatorEvents();
                break;
            case 'scientific':
                content.innerHTML = this.getScientificCalculatorHTML();
                this.bindScientificCalculatorEvents();
                break;
            case 'financial':
                content.innerHTML = this.getFinancialCalculatorHTML();
                this.bindFinancialCalculatorEvents();
                break;
            case 'converter':
                content.innerHTML = this.getConverterHTML();
                this.bindConverterEvents();
                break;
            case 'graphing':
                content.innerHTML = this.getGraphingCalculatorHTML();
                this.bindGraphingCalculatorEvents();
                break;
        }
    }

    getBasicCalculatorHTML() {
        return `
            <div class="calculator-interface">
                <div class="calc-display" id="calc-display">${this.display}</div>
                <div class="calc-buttons">
                    <button class="calc-btn" data-action="clear">C</button>
                    <button class="calc-btn" data-action="clear-entry">CE</button>
                    <button class="calc-btn" data-action="backspace">⌫</button>
                    <button class="calc-btn operator" data-action="divide">÷</button>

                    <button class="calc-btn" data-number="7">7</button>
                    <button class="calc-btn" data-number="8">8</button>
                    <button class="calc-btn" data-number="9">9</button>
                    <button class="calc-btn operator" data-action="multiply">×</button>

                    <button class="calc-btn" data-number="4">4</button>
                    <button class="calc-btn" data-number="5">5</button>
                    <button class="calc-btn" data-number="6">6</button>
                    <button class="calc-btn operator" data-action="subtract">−</button>

                    <button class="calc-btn" data-number="1">1</button>
                    <button class="calc-btn" data-number="2">2</button>
                    <button class="calc-btn" data-number="3">3</button>
                    <button class="calc-btn operator" data-action="add">+</button>

                    <button class="calc-btn" data-number="0" style="grid-column: span 2;">0</button>
                    <button class="calc-btn" data-action="decimal">.</button>
                    <button class="calc-btn equals" data-action="equals">=</button>
                </div>
            </div>
        `;
    }

    getScientificCalculatorHTML() {
        return `
            <div class="calculator-interface">
                <div class="calc-display" id="calc-display">${this.display}</div>
                <div class="calc-buttons" style="grid-template-columns: repeat(5, 1fr);">
                    <button class="calc-btn" data-action="clear">C</button>
                    <button class="calc-btn" data-action="clear-entry">CE</button>
                    <button class="calc-btn" data-action="backspace">⌫</button>
                    <button class="calc-btn" data-action="memory-clear">MC</button>
                    <button class="calc-btn" data-action="memory-recall">MR</button>

                    <button class="calc-btn" data-action="sin">sin</button>
                    <button class="calc-btn" data-action="cos">cos</button>
                    <button class="calc-btn" data-action="tan">tan</button>
                    <button class="calc-btn" data-action="log">log</button>
                    <button class="calc-btn" data-action="ln">ln</button>

                    <button class="calc-btn" data-action="sqrt">√</button>
                    <button class="calc-btn" data-action="square">x²</button>
                    <button class="calc-btn" data-action="power">x^y</button>
                    <button class="calc-btn" data-action="factorial">x!</button>
                    <button class="calc-btn operator" data-action="divide">÷</button>

                    <button class="calc-btn" data-number="7">7</button>
                    <button class="calc-btn" data-number="8">8</button>
                    <button class="calc-btn" data-number="9">9</button>
                    <button class="calc-btn" data-action="pi">π</button>
                    <button class="calc-btn operator" data-action="multiply">×</button>

                    <button class="calc-btn" data-number="4">4</button>
                    <button class="calc-btn" data-number="5">5</button>
                    <button class="calc-btn" data-number="6">6</button>
                    <button class="calc-btn" data-action="e">e</button>
                    <button class="calc-btn operator" data-action="subtract">−</button>

                    <button class="calc-btn" data-number="1">1</button>
                    <button class="calc-btn" data-number="2">2</button>
                    <button class="calc-btn" data-number="3">3</button>
                    <button class="calc-btn" data-action="reciprocal">1/x</button>
                    <button class="calc-btn operator" data-action="add">+</button>

                    <button class="calc-btn" data-number="0" style="grid-column: span 2;">0</button>
                    <button class="calc-btn" data-action="decimal">.</button>
                    <button class="calc-btn" data-action="negate">+/-</button>
                    <button class="calc-btn equals" data-action="equals">=</button>
                </div>
            </div>
        `;
    }

    getFinancialCalculatorHTML() {
        return `
            <div class="calculator-interface">
                <div class="financial-calculator">
                    <div class="calc-section">
                        <h4>Loan Payment Calculator</h4>
                        <div class="form-group">
                            <label>Loan Amount ($)</label>
                            <input type="number" id="loan-amount" placeholder="100000">
                        </div>
                        <div class="form-group">
                            <label>Annual Interest Rate (%)</label>
                            <input type="number" id="interest-rate" placeholder="5.5" step="0.01">
                        </div>
                        <div class="form-group">
                            <label>Loan Term (years)</label>
                            <input type="number" id="loan-term" placeholder="30">
                        </div>
                        <button class="btn btn-primary" onclick="window.ProDash.modules.get('calculators').calculateLoanPayment()">
                            Calculate Payment
                        </button>
                        <div id="loan-result" class="calc-result"></div>
                    </div>

                    <div class="calc-section">
                        <h4>Compound Interest Calculator</h4>
                        <div class="form-group">
                            <label>Principal ($)</label>
                            <input type="number" id="principal" placeholder="10000">
                        </div>
                        <div class="form-group">
                            <label>Annual Rate (%)</label>
                            <input type="number" id="compound-rate" placeholder="7" step="0.01">
                        </div>
                        <div class="form-group">
                            <label>Time (years)</label>
                            <input type="number" id="time-years" placeholder="10">
                        </div>
                        <div class="form-group">
                            <label>Compounding Frequency</label>
                            <select id="compound-frequency">
                                <option value="1">Annually</option>
                                <option value="4">Quarterly</option>
                                <option value="12" selected>Monthly</option>
                                <option value="365">Daily</option>
                            </select>
                        </div>
                        <button class="btn btn-primary" onclick="window.ProDash.modules.get('calculators').calculateCompoundInterest()">
                            Calculate Interest
                        </button>
                        <div id="compound-result" class="calc-result"></div>
                    </div>
                </div>
            </div>
        `;
    }

    getConverterHTML() {
        return `
            <div class="calculator-interface">
                <div class="converter-interface">
                    <div class="converter-tabs">
                        <button class="converter-tab active" data-type="length">Length</button>
                        <button class="converter-tab" data-type="weight">Weight</button>
                        <button class="converter-tab" data-type="temperature">Temperature</button>
                        <button class="converter-tab" data-type="currency">Currency</button>
                    </div>
                    <div id="converter-content">
                        ${this.getLengthConverterHTML()}
                    </div>
                </div>
            </div>
        `;
    }

    getLengthConverterHTML() {
        return `
            <div class="converter-section">
                <div class="conversion-row">
                    <div class="form-group">
                        <label>From</label>
                        <input type="number" id="from-value" placeholder="1">
                        <select id="from-unit">
                            <option value="mm">Millimeters</option>
                            <option value="cm">Centimeters</option>
                            <option value="m" selected>Meters</option>
                            <option value="km">Kilometers</option>
                            <option value="in">Inches</option>
                            <option value="ft">Feet</option>
                            <option value="yd">Yards</option>
                            <option value="mi">Miles</option>
                        </select>
                    </div>
                    <div class="conversion-arrow">→</div>
                    <div class="form-group">
                        <label>To</label>
                        <input type="number" id="to-value" readonly>
                        <select id="to-unit">
                            <option value="mm">Millimeters</option>
                            <option value="cm">Centimeters</option>
                            <option value="m">Meters</option>
                            <option value="km">Kilometers</option>
                            <option value="in">Inches</option>
                            <option value="ft" selected>Feet</option>
                            <option value="yd">Yards</option>
                            <option value="mi">Miles</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    getGraphingCalculatorHTML() {
        return `
            <div class="calculator-interface">
                <div class="graphing-calculator">
                    <div class="graph-controls">
                        <div class="form-group">
                            <label>Function (y = )</label>
                            <input type="text" id="function-input" placeholder="x^2" value="x^2">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label>X Range</label>
                                <input type="number" id="x-min" value="-10" step="0.1">
                                <span> to </span>
                                <input type="number" id="x-max" value="10" step="0.1">
                            </div>
                            <div class="form-group">
                                <label>Y Range</label>
                                <input type="number" id="y-min" value="-10" step="0.1">
                                <span> to </span>
                                <input type="number" id="y-max" value="10" step="0.1">
                            </div>
                        </div>
                        <button class="btn btn-primary" onclick="window.ProDash.modules.get('calculators').plotFunction()">
                            Plot Function
                        </button>
                    </div>
                    <canvas id="graph-canvas" width="600" height="400" style="border: 1px solid var(--border); background: var(--bg-primary);"></canvas>
                </div>
            </div>
        `;
    }

    bindBasicCalculatorEvents() {
        const buttons = document.querySelectorAll('.calc-btn');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                if (e.target.dataset.number !== undefined) {
                    this.inputNumber(e.target.dataset.number);
                } else if (e.target.dataset.action) {
                    this.performAction(e.target.dataset.action);
                }
            });
        });
    }

    bindScientificCalculatorEvents() {
        this.bindBasicCalculatorEvents(); // Reuse basic events
    }

    bindFinancialCalculatorEvents() {
        // Events are bound via onclick in HTML for simplicity
    }

    bindConverterEvents() {
        const converterTabs = document.querySelectorAll('.converter-tab');
        converterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.showConverterType(e.target.dataset.type);
            });
        });

        // Bind conversion events
        setTimeout(() => {
            const fromValue = document.getElementById('from-value');
            const fromUnit = document.getElementById('from-unit');
            const toUnit = document.getElementById('to-unit');

            if (fromValue && fromUnit && toUnit) {
                [fromValue, fromUnit, toUnit].forEach(element => {
                    element.addEventListener('input', () => this.convertUnits());
                    element.addEventListener('change', () => this.convertUnits());
                });
            }
        }, 100);
    }

    bindGraphingCalculatorEvents() {
        // Auto-plot when function changes
        setTimeout(() => {
            const functionInput = document.getElementById('function-input');
            functionInput?.addEventListener('input', () => {
                clearTimeout(this.plotTimeout);
                this.plotTimeout = setTimeout(() => this.plotFunction(), 500);
            });
        }, 100);
    }

    inputNumber(num) {
        if (this.waitingForOperand) {
            this.display = num;
            this.waitingForOperand = false;
        } else {
            this.display = this.display === '0' ? num : this.display + num;
        }
        this.updateDisplay();
    }

    performAction(action) {
        const current = parseFloat(this.display);

        switch (action) {
            case 'clear':
                this.display = '0';
                this.previousValue = null;
                this.operation = null;
                this.waitingForOperand = false;
                break;

            case 'clear-entry':
                this.display = '0';
                break;

            case 'backspace':
                this.display = this.display.length > 1 ? this.display.slice(0, -1) : '0';
                break;

            case 'decimal':
                if (this.display.indexOf('.') === -1) {
                    this.display += '.';
                }
                break;

            case 'negate':
                this.display = (parseFloat(this.display) * -1).toString();
                break;

            case 'equals':
                if (this.operation && this.previousValue !== null) {
                    this.display = this.calculate(this.previousValue, current, this.operation).toString();
                    this.operation = null;
                    this.previousValue = null;
                    this.waitingForOperand = true;
                }
                break;

            // Basic operations
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                if (this.previousValue !== null && this.operation && !this.waitingForOperand) {
                    this.display = this.calculate(this.previousValue, current, this.operation).toString();
                }
                this.previousValue = parseFloat(this.display);
                this.operation = action;
                this.waitingForOperand = true;
                break;

            // Scientific operations
            case 'sin':
                this.display = Math.sin(current * Math.PI / 180).toString();
                break;
            case 'cos':
                this.display = Math.cos(current * Math.PI / 180).toString();
                break;
            case 'tan':
                this.display = Math.tan(current * Math.PI / 180).toString();
                break;
            case 'log':
                this.display = Math.log10(current).toString();
                break;
            case 'ln':
                this.display = Math.log(current).toString();
                break;
            case 'sqrt':
                this.display = Math.sqrt(current).toString();
                break;
            case 'square':
                this.display = (current * current).toString();
                break;
            case 'reciprocal':
                this.display = (1 / current).toString();
                break;
            case 'factorial':
                this.display = this.factorial(current).toString();
                break;
            case 'pi':
                this.display = Math.PI.toString();
                break;
            case 'e':
                this.display = Math.E.toString();
                break;
        }

        this.updateDisplay();
    }

    calculate(first, second, operation) {
        switch (operation) {
            case 'add': return first + second;
            case 'subtract': return first - second;
            case 'multiply': return first * second;
            case 'divide': return second !== 0 ? first / second : 0;
            case 'power': return Math.pow(first, second);
            default: return second;
        }
    }

    factorial(n) {
        if (n < 0 || n % 1 !== 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    updateDisplay() {
        const displayElement = document.getElementById('calc-display');
        if (displayElement) {
            displayElement.textContent = this.display;
        }
    }

    // Financial Calculator Methods
    calculateLoanPayment() {
        const principal = parseFloat(document.getElementById('loan-amount').value);
        const annualRate = parseFloat(document.getElementById('interest-rate').value) / 100;
        const years = parseFloat(document.getElementById('loan-term').value);

        if (!principal || !annualRate || !years) {
            document.getElementById('loan-result').innerHTML = '<p style="color: var(--error);">Please fill in all fields</p>';
            return;
        }

        const monthlyRate = annualRate / 12;
        const numPayments = years * 12;

        const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                              (Math.pow(1 + monthlyRate, numPayments) - 1);

        const totalPaid = monthlyPayment * numPayments;
        const totalInterest = totalPaid - principal;

        document.getElementById('loan-result').innerHTML = `
            <div style="background: var(--bg-primary); padding: 1rem; border-radius: 6px; margin-top: 1rem;">
                <h5>Results:</h5>
                <p><strong>Monthly Payment:</strong> $${monthlyPayment.toFixed(2)}</p>
                <p><strong>Total Paid:</strong> $${totalPaid.toFixed(2)}</p>
                <p><strong>Total Interest:</strong> $${totalInterest.toFixed(2)}</p>
            </div>
        `;
    }

    calculateCompoundInterest() {
        const principal = parseFloat(document.getElementById('principal').value);
        const rate = parseFloat(document.getElementById('compound-rate').value) / 100;
        const time = parseFloat(document.getElementById('time-years').value);
        const frequency = parseFloat(document.getElementById('compound-frequency').value);

        if (!principal || !rate || !time || !frequency) {
            document.getElementById('compound-result').innerHTML = '<p style="color: var(--error);">Please fill in all fields</p>';
            return;
        }

        const amount = principal * Math.pow(1 + rate / frequency, frequency * time);
        const interest = amount - principal;

        document.getElementById('compound-result').innerHTML = `
            <div style="background: var(--bg-primary); padding: 1rem; border-radius: 6px; margin-top: 1rem;">
                <h5>Results:</h5>
                <p><strong>Final Amount:</strong> $${amount.toFixed(2)}</p>
                <p><strong>Interest Earned:</strong> $${interest.toFixed(2)}</p>
                <p><strong>Effective Annual Rate:</strong> ${((amount / principal) ** (1 / time) - 1).toFixed(4) * 100}%</p>
            </div>
        `;
    }

    // Unit Converter Methods
    showConverterType(type) {
        document.querySelectorAll('.converter-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.type === type);
        });

        const content = document.getElementById('converter-content');
        switch (type) {
            case 'length':
                content.innerHTML = this.getLengthConverterHTML();
                break;
            case 'weight':
                content.innerHTML = this.getWeightConverterHTML();
                break;
            case 'temperature':
                content.innerHTML = this.getTemperatureConverterHTML();
                break;
            case 'currency':
                content.innerHTML = this.getCurrencyConverterHTML();
                break;
        }

        this.bindConverterEvents();
    }

    getWeightConverterHTML() {
        return `
            <div class="converter-section">
                <div class="conversion-row">
                    <div class="form-group">
                        <label>From</label>
                        <input type="number" id="from-value" placeholder="1">
                        <select id="from-unit">
                            <option value="mg">Milligrams</option>
                            <option value="g">Grams</option>
                            <option value="kg" selected>Kilograms</option>
                            <option value="oz">Ounces</option>
                            <option value="lb">Pounds</option>
                            <option value="ton">Tons</option>
                        </select>
                    </div>
                    <div class="conversion-arrow">→</div>
                    <div class="form-group">
                        <label>To</label>
                        <input type="number" id="to-value" readonly>
                        <select id="to-unit">
                            <option value="mg">Milligrams</option>
                            <option value="g">Grams</option>
                            <option value="kg">Kilograms</option>
                            <option value="oz">Ounces</option>
                            <option value="lb" selected>Pounds</option>
                            <option value="ton">Tons</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    getTemperatureConverterHTML() {
        return `
            <div class="converter-section">
                <div class="conversion-row">
                    <div class="form-group">
                        <label>From</label>
                        <input type="number" id="from-value" placeholder="0">
                        <select id="from-unit">
                            <option value="c" selected>Celsius</option>
                            <option value="f">Fahrenheit</option>
                            <option value="k">Kelvin</option>
                        </select>
                    </div>
                    <div class="conversion-arrow">→</div>
                    <div class="form-group">
                        <label>To</label>
                        <input type="number" id="to-value" readonly>
                        <select id="to-unit">
                            <option value="c">Celsius</option>
                            <option value="f" selected>Fahrenheit</option>
                            <option value="k">Kelvin</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    getCurrencyConverterHTML() {
        return `
            <div class="converter-section">
                <div class="conversion-row">
                    <div class="form-group">
                        <label>From</label>
                        <input type="number" id="from-value" placeholder="1">
                        <select id="from-unit">
                            <option value="usd" selected>USD</option>
                            <option value="eur">EUR</option>
                            <option value="gbp">GBP</option>
                            <option value="jpy">JPY</option>
                            <option value="cad">CAD</option>
                            <option value="aud">AUD</option>
                        </select>
                    </div>
                    <div class="conversion-arrow">→</div>
                    <div class="form-group">
                        <label>To</label>
                        <input type="number" id="to-value" readonly>
                        <select id="to-unit">
                            <option value="usd">USD</option>
                            <option value="eur" selected>EUR</option>
                            <option value="gbp">GBP</option>
                            <option value="jpy">JPY</option>
                            <option value="cad">CAD</option>
                            <option value="aud">AUD</option>
                        </select>
                    </div>
                </div>
                <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 1rem;">
                    * Currency rates are static for demo purposes
                </p>
            </div>
        `;
    }

    convertUnits() {
        const fromValue = parseFloat(document.getElementById('from-value').value);
        const fromUnit = document.getElementById('from-unit').value;
        const toUnit = document.getElementById('to-unit').value;
        const toValueElement = document.getElementById('to-value');

        if (!fromValue || !fromUnit || !toUnit) return;

        let result = this.performConversion(fromValue, fromUnit, toUnit);
        toValueElement.value = result.toFixed(6).replace(/\.?0+$/, '');
    }

    performConversion(value, fromUnit, toUnit) {
        // Length conversions (to meters)
        const lengthConversions = {
            mm: 0.001, cm: 0.01, m: 1, km: 1000,
            in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.34
        };

        // Weight conversions (to grams)
        const weightConversions = {
            mg: 0.001, g: 1, kg: 1000,
            oz: 28.3495, lb: 453.592, ton: 1000000
        };

        // Currency conversions (to USD) - static rates for demo
        const currencyConversions = {
            usd: 1, eur: 0.85, gbp: 0.73, jpy: 110, cad: 1.25, aud: 1.35
        };

        if (lengthConversions[fromUnit] && lengthConversions[toUnit]) {
            return (value * lengthConversions[fromUnit]) / lengthConversions[toUnit];
        } else if (weightConversions[fromUnit] && weightConversions[toUnit]) {
            return (value * weightConversions[fromUnit]) / weightConversions[toUnit];
        } else if (currencyConversions[fromUnit] && currencyConversions[toUnit]) {
            return (value / currencyConversions[fromUnit]) * currencyConversions[toUnit];
        } else if (fromUnit === 'c' || fromUnit === 'f' || fromUnit === 'k') {
            // Temperature conversions
            return this.convertTemperature(value, fromUnit, toUnit);
        }

        return value;
    }

    convertTemperature(value, fromUnit, toUnit) {
        // Convert to Celsius first
        let celsius = value;
        if (fromUnit === 'f') {
            celsius = (value - 32) * 5/9;
        } else if (fromUnit === 'k') {
            celsius = value - 273.15;
        }

        // Convert from Celsius to target
        if (toUnit === 'c') return celsius;
        if (toUnit === 'f') return celsius * 9/5 + 32;
        if (toUnit === 'k') return celsius + 273.15;

        return value;
    }

    // Graphing Calculator Methods
    plotFunction() {
        const canvas = document.getElementById('graph-canvas');
        const ctx = canvas.getContext('2d');
        const functionStr = document.getElementById('function-input').value;
        const xMin = parseFloat(document.getElementById('x-min').value);
        const xMax = parseFloat(document.getElementById('x-max').value);
        const yMin = parseFloat(document.getElementById('y-min').value);
        const yMax = parseFloat(document.getElementById('y-max').value);

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw axes
        this.drawAxes(ctx, canvas.width, canvas.height, xMin, xMax, yMin, yMax);

        // Plot function
        this.drawFunction(ctx, canvas.width, canvas.height, functionStr, xMin, xMax, yMin, yMax);
    }

    drawAxes(ctx, width, height, xMin, xMax, yMin, yMax) {
        ctx.strokeStyle = 'var(--border)';
        ctx.lineWidth = 1;

        // Calculate axis positions
        const xAxisY = height - ((0 - yMin) / (yMax - yMin)) * height;
        const yAxisX = ((0 - xMin) / (xMax - xMin)) * width;

        // Draw x-axis
        ctx.beginPath();
        ctx.moveTo(0, xAxisY);
        ctx.lineTo(width, xAxisY);
        ctx.stroke();

        // Draw y-axis
        ctx.beginPath();
        ctx.moveTo(yAxisX, 0);
        ctx.lineTo(yAxisX, height);
        ctx.stroke();

        // Draw grid
        ctx.strokeStyle = 'rgba(128, 128, 128, 0.3)';
        for (let i = 1; i < 10; i++) {
            const x = (width / 10) * i;
            const y = (height / 10) * i;

            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }

    drawFunction(ctx, width, height, functionStr, xMin, xMax, yMin, yMax) {
        ctx.strokeStyle = 'var(--accent-primary)';
        ctx.lineWidth = 2;
        ctx.beginPath();

        let firstPoint = true;

        for (let pixelX = 0; pixelX < width; pixelX++) {
            const x = xMin + (pixelX / width) * (xMax - xMin);

            try {
                const y = this.evaluateFunction(functionStr, x);

                if (!isNaN(y) && isFinite(y)) {
                    const pixelY = height - ((y - yMin) / (yMax - yMin)) * height;

                    if (pixelY >= 0 && pixelY <= height) {
                        if (firstPoint) {
                            ctx.moveTo(pixelX, pixelY);
                            firstPoint = false;
                        } else {
                            ctx.lineTo(pixelX, pixelY);
                        }
                    }
                }
            } catch (e) {
                // Skip invalid points
            }
        }

        ctx.stroke();
    }

    evaluateFunction(functionStr, x) {
        // Simple function evaluator - replace x with actual value
        // TODO: In a real implementation, use a proper math expression parser
        let expression = functionStr
            .replace(/x/g, `(${x})`)
            .replace(/\^/g, '**')
            .replace(/sin/g, 'Math.sin')
            .replace(/cos/g, 'Math.cos')
            .replace(/tan/g, 'Math.tan')
            .replace(/log/g, 'Math.log10')
            .replace(/ln/g, 'Math.log')
            .replace(/sqrt/g, 'Math.sqrt')
            .replace(/pi/g, 'Math.PI')
            .replace(/e/g, 'Math.E');

        return eval(expression);
    }

    onShow() {
        this.renderCalculator();
        // Auto-plot if graphing calculator is active
        if (this.currentCalculator === 'graphing') {
            setTimeout(() => this.plotFunction(), 100);
        }
    }

    handleKeyboard(e) {
        if (this.currentCalculator === 'basic' || this.currentCalculator === 'scientific') {
            // Handle numeric keypad input for calculators
            if (e.key >= '0' && e.key <= '9') {
                this.inputNumber(e.key);
            } else if (e.key === '.') {
                this.performAction('decimal');
            } else if (e.key === '+') {
                this.performAction('add');
            } else if (e.key === '-') {
                this.performAction('subtract');
            } else if (e.key === '*') {
                this.performAction('multiply');
            } else if (e.key === '/') {
                e.preventDefault();
                this.performAction('divide');
            } else if (e.key === 'Enter' || e.key === '=') {
                this.performAction('equals');
            } else if (e.key === 'Escape') {
                this.performAction('clear');
            } else if (e.key === 'Backspace') {
                this.performAction('backspace');
            }
        }
    }
}
