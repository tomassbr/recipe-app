# Design System & Tokens: PastryCalc App

## 1. Core Visual Concept
The application must use a clean, futuristic, and premium **Glassmorphism** style. It should feel like a high-end tool for a professional pastry chef. Avoid generic SaaS looks. 

## 2. Global Tokens
- **Background**: A full-viewport, subtle mesh gradient.
  - Colors: Pastel Mint (`#e0f7fa`), Soft Lilac (`#ede7f6`), Powder Blue (`#e3f2fd`).
  - The gradient should be soft, blurred, and abstract.
- **Font**: `Inter` or `Geist` (sans-serif, highly legible).
- **Text Colors**: 
  - Primary text: `slate-800` (Dark gray, not pure black for better contrast).
  - Secondary text: `slate-500`.

## 3. Glassmorphism UI Elements (The "Glass" Token)
All cards, sidebars, and main containers must use these Tailwind classes to achieve the glass effect:
- **Background**: `bg-white/40` (or `bg-white/30` for slightly more transparency)
- **Backdrop Blur**: `backdrop-blur-xl` or `backdrop-blur-2xl`
- **Border**: `border border-white/50`
- **Shadow**: `shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]`
- **Border Radius**: `rounded-2xl` or `rounded-3xl` for main containers.

## 4. Components
- **Sidebar (Categories)**: Vertical list. Active state should be a slightly more opaque white pill `bg-white/60` with bold text.
- **Recipe Cards (List view)**: Simple glass cards showing Recipe Name, Base Yield, and Unit. Hover effect: slight translateY and increased shadow (`hover:-translate-y-1 transition-all`).
- **Input Fields (Target Yield)**: Large, prominent, clear. 
  - Classes: `bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300/50`.
- **Tables (Ingredients)**:
  - Clean layout, no heavy borders.
  - Separate sections if a recipe has multiple components (e.g., "Crumble" header, then its ingredients).
  - Numbers must be monospaced or tabular (`tabular-nums`) to prevent shifting when values change.