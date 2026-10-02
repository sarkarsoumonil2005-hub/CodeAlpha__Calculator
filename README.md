# 🔮 AuraCalc — Frosted Glassmorphism Multi-Line Calculator

A modern, responsive, frosted-glassmorphic calculator web application built with Vanilla HTML, CSS, and JavaScript. Featuring a multi-line smart formula display, real-time calculation preview, light/dark themes, tactile keyboard navigation, and calculation history persistence.

---

## ✨ Features

- **💎 Premium Glassmorphism UI**: Frosted transparent glass aesthetic with a seamless math icon & formula doodle pattern, soft blur refraction, translucent squircle keys, and fluid hover effects.
- **🔢 Multi-Line Smart Display**:
  - **Top Row**: Formula history and previous equations (`5 + 3 =` / `Ans = 8`).
  - **Middle Row**: Real-time evaluation preview as you type (`= 8`).
  - **Main Row**: High-contrast, bold display with dynamic auto-scaling font size.
- **🧪 Collapsible Scientific Keypad**: Expandable scientific keypad via the top indicator handle pill or keyboard shortcut (`S`), featuring 12 scientific functions:
  - **Trigonometry**: `sin`, `cos`, `tan`, and Inverse functions (`sin⁻¹`, `cos⁻¹`, `tan⁻¹`).
  - **Angle Modes**: Toggle between Degrees (`Deg`) and Radians (`Rad`) with header badge indicator.
  - **Algebra & Constants**: Square root (`√`), power (`^`), percentage (`%`), Euler's number (`e`), and $\pi$.
  - **Logarithms & Exponentials**: Natural log (`ln`), common log (`log`), $e^x$, and $10^x$.
  - **Inverse Toggle (`Inv`)**: One-click switch for inverse functions ($x^2$, $\sin^{-1}$, $\cos^{-1}$, $\tan^{-1}$, $e^x$, $10^x$).
- **🌓 Light & Dark Theme**: Seamless toggle between sleek frosted glass and dark obsidian glass themes (persisted via `localStorage`).
- **📜 Calculation History Drawer**: Flyout panel recording recent calculations with one-click result recall and clear option.
- **⌨️ Comprehensive Keyboard Support**: Full keyboard shortcuts for digits, operators, power (`^`), percentage (`%`), clear (`Esc`), delete (`Backspace`), equals (`Enter`), scientific toggle (`S`), theme toggle (`T`), and history (`H`).
- **📱 Mobile Tactile & Haptic Feedback**: Smooth touch down states and vibration API haptic feedback on supported mobile devices.
- **🛡️ Robust Input & Math Handling**:
  - Auto-closing smart parentheses `( )`.
  - Operator chaining and smart consecutive operator replacement.
  - Division-by-zero protection with visual error shake animation.
  - Accurate floating-point arithmetic formatting with comma separators for thousands.

---

## 🛠️ Tech Stack

- **HTML5**: Semantic and accessible markup.
- **CSS3 (Vanilla)**: CSS custom properties / design tokens, CSS Grid, Flexbox, glassmorphism (`backdrop-filter`), and micro-animations.
- **JavaScript (Vanilla ES6+)**: Object-Oriented class-based architecture (`GlassCalculator`), event delegation, and Web Storage API.

---

## 🚀 Getting Started

### Prerequisites
You only need a modern web browser (such as Chrome, Edge, Firefox, Safari, or Brave).

### Running the Project
1. Clone or download this repository.
2. Open [index.html](file:///d:/WEB%20DESIGN/calculator/index.html) directly in any web browser, or launch it with a local server (e.g. VS Code Live Server or `npx serve`).

---

## ⌨️ Keyboard Shortcuts

| Key / Shortcut | Action |
| :--- | :--- |
| `0` - `9` | Enter numbers |
| `.` or `,` | Decimal point |
| `+`, `-`, `*` (or `x`), `/` | Arithmetic operations (Add, Subtract, Multiply, Divide) |
| `%` | Percentage ($\%$) |
| `^` | Power ($x^y$) |
| `(` and `)` | Open / Close parentheses |
| `Enter` or `=` | Calculate result |
| `Backspace` | Delete last character / function |
| `Escape` | Clear all (`C`) / Close drawer |
| `S` | Toggle Scientific Keypad |
| `T` | Toggle Light / Dark theme |
| `H` | Toggle Calculation History drawer |

---

## 📁 Project Structure

```
calculator/
├── index.html        # HTML structure & semantic layout
├── style.css         # Glassmorphism design system, themes, and animations
├── script.js         # Calculator engine, state management, & keyboard bindings
└── README.md         # Project documentation
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
