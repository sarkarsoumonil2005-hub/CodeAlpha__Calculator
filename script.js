/**
 * AuraCalc — Glassmorphism Multi-Line & Scientific Calculator
 * Logic, Multi-Line Formula Tracking, Scientific Functions & Glass Theme Support
 */

class GlassCalculator {
  constructor(formulaElement, subElement, resultElement, displayContainer) {
    this.formulaElement = formulaElement;
    this.subElement = subElement;
    this.resultElement = resultElement;
    this.displayContainer = displayContainer;

    this.expression = '';
    this.lastFormula = '';
    this.evaluated = false;
    this.hasError = false;

    // Scientific Mode States
    this.angleMode = 'deg'; // 'deg' or 'rad'
    this.isInverse = false;
    this.isScientificOpen = false;

    this.history = JSON.parse(localStorage.getItem('auracalc_history') || '[]');

    this.clear();
  }

  /**
   * Resets calculator state
   */
  clear() {
    this.expression = '';
    this.lastFormula = '';
    this.evaluated = false;
    this.hasError = false;
    this.clearOperatorHighlights();
    this.updateDisplay();
  }

  /**
   * Deletes last character (Backspace)
   */
  delete() {
    if (this.hasError || this.evaluated) {
      this.clear();
      return;
    }

    if (this.expression.length > 0) {
      // Check multi-character functions to delete as one unit
      const multiChars = ['sin⁻¹(', 'cos⁻¹(', 'tan⁻¹(', 'sin(', 'cos(', 'tan(', 'ln(', 'log(', '√(', '10^(', 'e^('];
      let matchedMulti = false;
      for (const m of multiChars) {
        if (this.expression.endsWith(m)) {
          this.expression = this.expression.slice(0, -m.length);
          matchedMulti = true;
          break;
        }
      }

      if (!matchedMulti) {
        this.expression = this.expression.slice(0, -1);
      }

      this.clearOperatorHighlights();
      this.updateDisplay();
    }
  }

  /**
   * Appends digit or decimal point
   * @param {string} num
   */
  appendNumber(num) {
    this.clearOperatorHighlights();

    if (this.hasError) {
      this.clear();
    }

    if (this.evaluated) {
      this.expression = '';
      this.lastFormula = '';
      this.evaluated = false;
    }

    // Decimal logic
    if (num === '.') {
      const tokens = this.expression.split(/[+\-*/()^% ]/);
      const currentToken = tokens[tokens.length - 1] || '';
      if (currentToken.includes('.')) return;
      if (currentToken === '' || /[+\-*/(^]$/.test(this.expression)) {
        num = '0.';
      }
    }

    // Prevent multiple leading zeroes
    const tokens = this.expression.split(/[+\-*/()^% ]/);
    const currentToken = tokens[tokens.length - 1] || '';
    if (currentToken === '0' && num !== '.') {
      this.expression = this.expression.slice(0, -1) + num;
      this.updateDisplay();
      return;
    }

    this.expression += num;
    this.updateDisplay();
  }

  /**
   * Appends arithmetic operator (+, -, *, /)
   * @param {string} op
   */
  appendOperator(op) {
    if (this.hasError) {
      this.clear();
    }

    if (this.evaluated) {
      this.lastFormula = `Ans = ${this.formatNumber(this.expression)}`;
      this.evaluated = false;
    }

    if (this.expression === '') {
      if (op === '-') {
        this.expression = '-';
        this.updateDisplay();
      }
      return;
    }

    // Clean multiple consecutive operator taps
    const trailingOpMatch = this.expression.match(/[+\-*/]+$/);
    if (trailingOpMatch) {
      if (op === '-' && (this.expression.endsWith('*') || this.expression.endsWith('/'))) {
        this.expression += op;
      } else {
        this.expression = this.expression.replace(/[+\-*/]+$/, op);
      }
    } else {
      this.expression += op;
    }

    this.highlightOperatorButton(op);
    this.updateDisplay();
  }

  /**
   * Highlights active operator button on mobile/desktop
   */
  highlightOperatorButton(op) {
    this.clearOperatorHighlights();
    const btn = document.querySelector(`[data-operation="${op}"]`);
    if (btn) {
      btn.classList.add('active-op');
    }
  }

  clearOperatorHighlights() {
    document.querySelectorAll('.btn[data-operation]').forEach(b => b.classList.remove('active-op'));
  }

  /**
   * Appends parenthesis '(' or ')'
   * @param {string} [specific]
   */
  appendParenthesis(specific) {
    if (this.hasError) {
      this.clear();
    }

    if (this.evaluated) {
      this.expression = '';
      this.lastFormula = '';
      this.evaluated = false;
    }

    if (specific === '(') {
      const lastChar = this.expression.slice(-1);
      if (/[0-9)πe%]/.test(lastChar)) {
        this.expression += '*(';
      } else {
        this.expression += '(';
      }
    } else if (specific === ')') {
      const openCount = (this.expression.match(/\(/g) || []).length;
      const closeCount = (this.expression.match(/\)/g) || []).length;
      const lastChar = this.expression.slice(-1);
      if (openCount > closeCount && !['+', '-', '*', '/', '(', '^'].includes(lastChar)) {
        this.expression += ')';
      }
    } else {
      // Smart Auto Parenthesis
      const openCount = (this.expression.match(/\(/g) || []).length;
      const closeCount = (this.expression.match(/\)/g) || []).length;
      const lastChar = this.expression.slice(-1);

      if (this.expression === '' || ['+', '-', '*', '/', '(', '^'].includes(lastChar)) {
        this.expression += '(';
      } else if (openCount > closeCount) {
        this.expression += ')';
      } else {
        this.expression += '*(';
      }
    }

    this.updateDisplay();
  }

  /**
   * Scientific & Percentage functions handling
   * @param {string} func
   */
  appendScientific(func) {
    if (this.hasError) {
      this.clear();
    }

    if (this.evaluated) {
      if (['power', 'percent'].includes(func)) {
        this.lastFormula = `Ans = ${this.formatNumber(this.expression)}`;
        this.evaluated = false;
      } else {
        this.expression = '';
        this.lastFormula = '';
        this.evaluated = false;
      }
    }

    const lastChar = this.expression.slice(-1);
    const needMultiply = /[0-9)πe%]/.test(lastChar);

    switch (func) {
      case 'sqrt':
        if (this.isInverse) {
          if (this.expression !== '' && !/[+\-*/(^]$/.test(lastChar)) {
            this.expression += '^2';
          }
        } else {
          this.expression += (needMultiply ? '*√(' : '√(');
        }
        break;

      case 'pi':
        this.expression += (needMultiply ? '*π' : 'π');
        break;

      case 'e':
        this.expression += (needMultiply ? '*e' : 'e');
        break;

      case 'power':
        if (this.expression !== '' && !/[+\-*/(^]$/.test(lastChar)) {
          this.expression += '^';
        }
        break;

      case 'percent':
        if (this.expression !== '' && !/[+\-*/(^]$/.test(lastChar)) {
          this.expression += '%';
        }
        break;

      case 'sin':
        if (this.isInverse) {
          this.expression += (needMultiply ? '*sin⁻¹(' : 'sin⁻¹(');
        } else {
          this.expression += (needMultiply ? '*sin(' : 'sin(');
        }
        break;

      case 'cos':
        if (this.isInverse) {
          this.expression += (needMultiply ? '*cos⁻¹(' : 'cos⁻¹(');
        } else {
          this.expression += (needMultiply ? '*cos(' : 'cos(');
        }
        break;

      case 'tan':
        if (this.isInverse) {
          this.expression += (needMultiply ? '*tan⁻¹(' : 'tan⁻¹(');
        } else {
          this.expression += (needMultiply ? '*tan(' : 'tan(');
        }
        break;

      case 'ln':
        if (this.isInverse) {
          this.expression += (needMultiply ? '*e^(' : 'e^(');
        } else {
          this.expression += (needMultiply ? '*ln(' : 'ln(');
        }
        break;

      case 'log':
        if (this.isInverse) {
          this.expression += (needMultiply ? '*10^(' : '10^(');
        } else {
          this.expression += (needMultiply ? '*log(' : 'log(');
        }
        break;

      case 'angle-mode':
        this.toggleAngleMode();
        return;

      case 'inv':
        this.toggleInverse();
        return;
    }

    this.updateDisplay();
  }

  /**
   * Toggles DEG / RAD angle calculation mode
   */
  toggleAngleMode() {
    this.angleMode = this.angleMode === 'deg' ? 'rad' : 'deg';
    
    const modeBtn = document.getElementById('btn-angle-mode');
    const modeBadge = document.getElementById('angle-mode-badge');
    
    if (modeBtn) {
      modeBtn.innerText = this.angleMode === 'deg' ? 'Deg' : 'Rad';
      modeBtn.classList.toggle('active-mode', this.angleMode === 'rad');
    }
    if (modeBadge) {
      modeBadge.innerText = this.angleMode.toUpperCase();
    }

    this.updateDisplay();
  }

  /**
   * Toggles Inverse functions (sin⁻¹, cos⁻¹, tan⁻¹, eˣ, 10ˣ, x²)
   */
  toggleInverse() {
    this.isInverse = !this.isInverse;

    const invBtn = document.getElementById('btn-inv');
    if (invBtn) {
      invBtn.classList.toggle('active-inv', this.isInverse);
    }

    const sinBtn = document.getElementById('btn-sin');
    const cosBtn = document.getElementById('btn-cos');
    const tanBtn = document.getElementById('btn-tan');
    const lnBtn = document.getElementById('btn-ln');
    const logBtn = document.getElementById('btn-log');
    const sqrtBtn = document.getElementById('btn-sqrt');

    if (sinBtn) sinBtn.innerHTML = this.isInverse ? 'sin<sup>-1</sup>' : 'sin';
    if (cosBtn) cosBtn.innerHTML = this.isInverse ? 'cos<sup>-1</sup>' : 'cos';
    if (tanBtn) tanBtn.innerHTML = this.isInverse ? 'tan<sup>-1</sup>' : 'tan';
    if (lnBtn) lnBtn.innerHTML = this.isInverse ? 'e<sup>x</sup>' : 'ln';
    if (logBtn) logBtn.innerHTML = this.isInverse ? '10<sup>x</sup>' : 'log';
    if (sqrtBtn) sqrtBtn.innerHTML = this.isInverse ? 'x<sup>2</sup>' : '√';
  }

  /**
   * Toggles scientific panel drawer on/off
   */
  toggleScientific(forceState) {
    const sciKeypad = document.getElementById('scientific-keypad');
    const sciToggleBtn = document.getElementById('btn-sci-toggle');
    if (!sciKeypad) return;

    this.isScientificOpen = forceState !== undefined ? forceState : !this.isScientificOpen;

    if (this.isScientificOpen) {
      sciKeypad.classList.add('open');
      sciKeypad.setAttribute('aria-hidden', 'false');
      if (sciToggleBtn) {
        sciToggleBtn.classList.add('active');
        sciToggleBtn.setAttribute('aria-expanded', 'true');
      }
    } else {
      sciKeypad.classList.remove('open');
      sciKeypad.setAttribute('aria-hidden', 'true');
      if (sciToggleBtn) {
        sciToggleBtn.classList.remove('active');
        sciToggleBtn.setAttribute('aria-expanded', 'false');
      }
    }
  }

  /**
   * Mathematical parsing & evaluation helper (with percentage & scientific functions)
   */
  executeMath(expr) {
    if (!expr) return null;

    let sanitized = expr.replace(/[+\-*/^]+$/, '');
    if (!sanitized) return null;

    // Auto-close open parentheses
    let openCount = (sanitized.match(/\(/g) || []).length;
    let closeCount = (sanitized.match(/\)/g) || []).length;
    while (openCount > closeCount) {
      sanitized += ')';
      closeCount++;
    }

    // Check division by zero
    if (/\/0(?![.\d])/.test(sanitized) || /\/0\.0+(?!\d)/.test(sanitized)) {
      return { error: 'Cannot divide by 0' };
    }

    // Transform formula into runnable JavaScript math expression
    let jsExpr = sanitized;

    // Implicit multiplication before parentheses or constants: e.g. 5(3) -> 5*(3), 5π -> 5*π
    jsExpr = jsExpr
      .replace(/(\d)(\()/g, '$1*$2')
      .replace(/(\))(\d)/g, '$1*$2')
      .replace(/(\))(\()/g, '$1*$2')
      .replace(/(\d)(π|e|√|sin|cos|tan|ln|log)/g, '$1*$2')
      .replace(/(π|e)(\d)/g, '$1*$2')
      .replace(/(π|e)(π|e)/g, '$1*$2')
      .replace(/(\))(π|e)/g, '$1*$2');

    // Percentage Calculation:
    // 1. Contextual Addition/Subtraction: e.g. 200 + 10% -> 200 + (200 * (10 * 0.01)) = 220
    jsExpr = jsExpr.replace(/(\b\d+(?:\.\d+)?|\))([+\-])(\d+(?:\.\d+)?|\([0-9+\-*/.,a-zA-Z_()]+\))%/g, '$1 $2 ($1 * ($3 * 0.01))');

    // 2. Standalone percentage: e.g. 50% -> (50 * 0.01), 200 * 15% -> 200 * (15 * 0.01)
    while (/(\d+(?:\.\d+)?|\([0-9+\-*/.,a-zA-Z_()]+\))%/.test(jsExpr)) {
      jsExpr = jsExpr.replace(/(\d+(?:\.\d+)?|\([0-9+\-*/.,a-zA-Z_()]+\))%/g, '($1 * 0.01)');
    }

    // Scientific functions replacements
    jsExpr = jsExpr
      .replace(/sin⁻¹\(/g, '__asin(')
      .replace(/cos⁻¹\(/g, '__acos(')
      .replace(/tan⁻¹\(/g, '__atan(')
      .replace(/sin\(/g, '__sin(')
      .replace(/cos\(/g, '__cos(')
      .replace(/tan\(/g, '__tan(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/√\(/g, 'Math.sqrt(')
      .replace(/π/g, '(Math.PI)')
      .replace(/(^|[^a-zA-Z0-9_])e($|[^a-zA-Z0-9_])/g, '$1(Math.E)$2')
      .replace(/\^/g, '**');

    // Prepare scoped math functions
    const isDeg = this.angleMode === 'deg';
    const toRad = (x) => isDeg ? (x * Math.PI / 180) : x;
    const fromRad = (x) => isDeg ? (x * 180 / Math.PI) : x;

    const __sin = (x) => {
      const rad = toRad(x);
      const res = Math.sin(rad);
      return Math.abs(res) < 1e-12 ? 0 : res;
    };

    const __cos = (x) => {
      const rad = toRad(x);
      const res = Math.cos(rad);
      return Math.abs(res) < 1e-12 ? 0 : res;
    };

    const __tan = (x) => {
      if (isDeg && Math.abs(x % 180) === 90) return NaN;
      const rad = toRad(x);
      const res = Math.tan(rad);
      return Math.abs(res) < 1e-12 ? 0 : res;
    };

    const __asin = (x) => fromRad(Math.asin(x));
    const __acos = (x) => fromRad(Math.acos(x));
    const __atan = (x) => fromRad(Math.atan(x));

    try {
      const fn = new Function(
        '__sin', '__cos', '__tan', '__asin', '__acos', '__atan',
        `'use strict'; return (${jsExpr});`
      );
      const rawResult = fn(__sin, __cos, __tan, __asin, __acos, __atan);

      if (!isFinite(rawResult) || isNaN(rawResult)) {
        return { error: 'Error' };
      }

      return { result: rawResult, sanitized };
    } catch {
      return { error: 'Error' };
    }
  }

  /**
   * Evaluates final solution when clicking '='
   */
  evaluate() {
    if (this.expression === '' || this.hasError) return;

    const evalResult = this.executeMath(this.expression);
    if (!evalResult) return;

    if (evalResult.error) {
      if (evalResult.error.includes('divide by 0')) {
        this.triggerDivisionByZero();
      } else {
        this.triggerError(evalResult.error);
      }
      return;
    }

    const rawResult = evalResult.result;
    const formattedResult = this.formatNumber(rawResult);

    // Save to History
    this.saveToHistory(evalResult.sanitized, formattedResult);

    // Set multi-line view
    this.lastFormula = `${this.formatFormulaDisplay(evalResult.sanitized)} =`;
    this.formulaElement.innerText = this.lastFormula;
    this.subElement.innerText = '';
    
    this.expression = rawResult.toString();
    this.evaluated = true;
    this.clearOperatorHighlights();

    this.renderMainResult(formattedResult, true);
  }

  /**
   * Real-time calculation preview
   */
  calculatePreview() {
    if (this.expression === '' || !/[+\-*/^%]|√|sin|cos|tan|ln|log|π|e/.test(this.expression)) {
      return '';
    }

    const evalResult = this.executeMath(this.expression);
    if (!evalResult || evalResult.error) return '';

    return this.formatNumber(evalResult.result);
  }

  /**
   * Formats numbers with comma separators for thousands and dot for decimal (e.g. 12,478.35)
   */
  formatNumber(val) {
    if (typeof val === 'string') {
      val = Number(val);
    }
    if (isNaN(val) || !isFinite(val)) return 'Error';

    // Round to 10 decimal places to eliminate floating point issues (e.g. 0.1 + 0.2 = 0.3)
    const rounded = Math.round(val * 1e10) / 1e10;
    const parts = rounded.toString().split('.');
    const intPart = parseFloat(parts[0]).toLocaleString('en-US');
    const decPart = parts[1];

    return decPart !== undefined ? `${intPart}.${decPart}` : intPart;
  }

  /**
   * Formats formula expression with clean readable spacing
   */
  formatFormulaDisplay(expr) {
    if (!expr) return '';
    return expr
      .replace(/\*/g, ' × ')
      .replace(/\//g, ' ÷ ')
      .replace(/\+/g, ' + ')
      .replace(/(?<=[0-9)πe%])\-(?=[0-9(πe√]|sin|cos|tan|ln|log)/g, ' − ')
      .trim();
  }

  /**
   * Updates multi-line display
   */
  updateDisplay() {
    if (this.hasError) return;

    if (this.evaluated) {
      this.formulaElement.innerText = this.lastFormula;
      this.subElement.innerText = '';
      this.renderMainResult(this.formatNumber(this.expression));
    } else {
      this.formulaElement.innerText = this.lastFormula || '';
      
      const preview = this.calculatePreview();
      this.subElement.innerText = preview ? `= ${preview}` : '';

      const displayValue = this.expression ? this.formatFormulaDisplay(this.expression) : '0';
      this.renderMainResult(displayValue);
    }
  }

  renderMainResult(val, isNewEvaluation = false) {
    if (!this.resultElement) return;

    this.resultElement.innerText = val;

    if (isNewEvaluation) {
      this.resultElement.classList.remove('result-pop');
      void this.resultElement.offsetWidth; // Trigger reflow
      this.resultElement.classList.add('result-pop');
    }

    // Font size scaling according to length
    const len = val.length;
    if (len > 18) {
      this.resultElement.style.fontSize = '1.2rem';
    } else if (len > 14) {
      this.resultElement.style.fontSize = '1.45rem';
    } else if (len > 10) {
      this.resultElement.style.fontSize = '1.75rem';
    } else if (len > 7) {
      this.resultElement.style.fontSize = '2.05rem';
    } else {
      this.resultElement.style.fontSize = '2.3rem';
    }
  }

  triggerDivisionByZero() {
    this.hasError = true;
    this.renderMainResult('Cannot divide by 0');
    if (this.displayContainer) {
      this.displayContainer.classList.add('error');
      setTimeout(() => this.displayContainer.classList.remove('error'), 450);
    }
  }

  triggerError(msg = 'Error') {
    this.hasError = true;
    this.renderMainResult(msg);
    if (this.displayContainer) {
      this.displayContainer.classList.add('error');
      setTimeout(() => this.displayContainer.classList.remove('error'), 450);
    }
  }

  /**
   * Calculation History
   */
  saveToHistory(expression, result) {
    this.history.unshift({ expression, result, timestamp: Date.now() });
    if (this.history.length > 30) this.history.pop();
    localStorage.setItem('auracalc_history', JSON.stringify(this.history));
    this.renderHistory();
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem('auracalc_history');
    this.renderHistory();
  }

  renderHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;

    if (this.history.length === 0) {
      historyList.innerHTML = '<p class="history-empty">No calculations yet</p>';
      return;
    }

    historyList.innerHTML = '';
    this.history.forEach((item) => {
      const el = document.createElement('div');
      el.className = 'history-item';
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', `Use result ${item.result}`);
      el.innerHTML = `
        <div class="history-item-exp">${this.formatFormulaDisplay(item.expression)} =</div>
        <div class="history-item-res">${item.result}</div>
      `;

      el.addEventListener('click', () => {
        this.clear();
        this.expression = item.result.replace(/,/g, '');
        this.lastFormula = `${this.formatFormulaDisplay(item.expression)} =`;
        this.evaluated = true;
        this.updateDisplay();
        const drawer = document.getElementById('history-drawer');
        if (drawer) {
          drawer.classList.remove('open');
          drawer.setAttribute('aria-hidden', 'true');
        }
      });

      historyList.appendChild(el);
    });
  }
}

/* ==========================================================================
   DOM Initialization & Event Handlers
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const formulaElement = document.getElementById('formula-text');
  const subElement = document.getElementById('sub-text');
  const resultElement = document.getElementById('main-result');
  const displayContainer = document.querySelector('.glass-display');

  const calculator = new GlassCalculator(
    formulaElement,
    subElement,
    resultElement,
    displayContainer
  );

  calculator.renderHistory();

  // --- Scientific Keypad Toggle Handle Button ---
  const sciToggleBtn = document.getElementById('btn-sci-toggle');
  if (sciToggleBtn) {
    sciToggleBtn.addEventListener('click', () => {
      calculator.toggleScientific();
    });
  }

  // --- Scientific & Percentage Buttons ---
  document.querySelectorAll('[data-sci]').forEach(button => {
    button.addEventListener('click', () => {
      calculator.appendScientific(button.getAttribute('data-sci'));
    });
  });

  // --- Number buttons ---
  document.querySelectorAll('[data-number]').forEach(button => {
    button.addEventListener('click', () => {
      calculator.appendNumber(button.getAttribute('data-number'));
    });
  });

  // --- Operator buttons ---
  document.querySelectorAll('[data-operation]').forEach(button => {
    button.addEventListener('click', () => {
      calculator.appendOperator(button.getAttribute('data-operation'));
    });
  });

  // --- Action buttons (Clear, Delete, Calculate, Parenthesis) ---
  document.querySelectorAll('[data-action]').forEach(button => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-action');
      if (action === 'clear') calculator.clear();
      if (action === 'delete') calculator.delete();
      if (action === 'calculate') calculator.evaluate();
      if (action === 'parenthesis') calculator.appendParenthesis();
    });
  });

  // --- Instant Mobile Touch / Finger Tap Tactile & Haptic Feedback ---
  document.querySelectorAll('.btn, .header-indicator-btn, .glass-icon-btn, .glass-close-btn, .glass-text-btn').forEach(button => {
    button.addEventListener('pointerdown', (e) => {
      button.classList.add('touch-active');

      // Trigger subtle tactile haptic vibration if supported on phone (10ms)
      if (navigator.vibrate) {
        try {
          navigator.vibrate(10);
        } catch (_) {}
      }
    });

    button.addEventListener('pointerup', () => button.classList.remove('touch-active'));
    button.addEventListener('pointercancel', () => button.classList.remove('touch-active'));
    button.addEventListener('pointerleave', () => button.classList.remove('touch-active'));
  });

  // --- Keyboard Handler ---
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const key = e.key;

    // Digits
    if (/^[0-9]$/.test(key)) {
      triggerKeyFeedback(key);
      calculator.appendNumber(key);
      return;
    }

    // Decimal
    if (key === '.' || key === ',') {
      triggerKeyFeedback('.');
      calculator.appendNumber('.');
      return;
    }

    // Operators
    if (key === '+') {
      triggerKeyFeedback('+');
      calculator.appendOperator('+');
      return;
    }
    if (key === '-') {
      triggerKeyFeedback('-');
      calculator.appendOperator('-');
      return;
    }
    if (key === '*' || key === 'x' || key === 'X') {
      triggerKeyFeedback('*');
      calculator.appendOperator('*');
      return;
    }
    if (key === '/') {
      e.preventDefault();
      triggerKeyFeedback('/');
      calculator.appendOperator('/');
      return;
    }

    // Percentage %
    if (key === '%') {
      calculator.appendScientific('percent');
      return;
    }

    // Power ^
    if (key === '^') {
      calculator.appendScientific('power');
      return;
    }

    // Brackets
    if (key === '(') {
      calculator.appendParenthesis('(');
      return;
    }
    if (key === ')') {
      calculator.appendParenthesis(')');
      return;
    }

    // Equals / Enter
    if (key === 'Enter' || key === '=') {
      e.preventDefault();
      triggerKeyFeedback('Enter');
      calculator.evaluate();
      return;
    }

    // Backspace
    if (key === 'Backspace') {
      triggerKeyFeedback('Backspace');
      calculator.delete();
      return;
    }

    // Clear
    if (key === 'Escape') {
      triggerKeyFeedback('Escape');
      calculator.clear();
      return;
    }

    // Scientific Panel Shortcut: 's' or 'S'
    if (key === 's' || key === 'S') {
      calculator.toggleScientific();
      return;
    }

    // Theme Shortcut
    if (key === 't' || key === 'T') {
      toggleTheme();
      return;
    }

    // History Shortcut
    if (key === 'h' || key === 'H') {
      toggleHistoryDrawer();
      return;
    }
  });

  function triggerKeyFeedback(key) {
    const btn = document.querySelector(`[data-key="${key}"]`);
    if (btn) {
      btn.classList.add('key-pressed');
      setTimeout(() => btn.classList.remove('key-pressed'), 130);
    }
  }

  // --- Theme Toggle ---
  const themeToggleBtn = document.getElementById('btn-theme-toggle');
  const savedTheme = localStorage.getItem('auracalc_theme') || 'dark';
  setTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(cur === 'dark' ? 'light' : 'dark');
    });
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('auracalc_theme', theme);
  }

  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(cur === 'dark' ? 'light' : 'dark');
  }

  // --- History Drawer ---
  const historyToggleBtn = document.getElementById('btn-history-toggle');
  const historyCloseBtn = document.getElementById('btn-close-history');
  const historyDrawer = document.getElementById('history-drawer');
  const clearHistoryBtn = document.getElementById('btn-clear-history');

  if (historyToggleBtn && historyDrawer) {
    historyToggleBtn.addEventListener('click', () => toggleHistoryDrawer());
  }

  if (historyCloseBtn) {
    historyCloseBtn.addEventListener('click', () => toggleHistoryDrawer(false));
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => calculator.clearHistory());
  }

  // Close history drawer when pressing Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && historyDrawer && historyDrawer.classList.contains('open')) {
      toggleHistoryDrawer(false);
    }
  });

  function toggleHistoryDrawer(forceState) {
    if (!historyDrawer) return;
    const isOpen = historyDrawer.classList.contains('open');
    const shouldOpen = forceState !== undefined ? forceState : !isOpen;

    if (shouldOpen) {
      historyDrawer.classList.add('open');
      historyDrawer.setAttribute('aria-hidden', 'false');
    } else {
      historyDrawer.classList.remove('open');
      historyDrawer.setAttribute('aria-hidden', 'true');
    }
  }
});
