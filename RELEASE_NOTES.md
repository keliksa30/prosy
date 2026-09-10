# Prosy v2.1.0 — Global Theme System, Figma-Style Bezier Pen Tool & SVG Recolor

We are thrilled to announce the release of **Prosy v2.1.0**! This major update brings a complete global Design System & Theme Manager, a powerful Figma-style Bezier Pen Tool with full vector node editing, dynamic SVG recoloring, and interface improvements.

---

## 🚀 Key Highlights

### 🎨 Global Theme & Design System (Theme Manager)
- **1-Click Curated Palettes**: Switch effortlessly between 8 curated design system palettes (*Neo Studio, Emerald Luxury, Midnight Indigo, Sunset Coral, Cyber Neon, Clean Minimal, Ocean Breeze, Warm Terracotta*).
- **Instant Canvas & Slide Theming**: Clicking **"Apply to Page"** or **"Apply to All Pages"** smartly recolors text, backgrounds, and shapes according to their role.
- **Real-Time Token Sync**: Editing any token (`Primary`, `Secondary`, `Accent`, `Background`, `Text`) immediately cascades changes across the canvas.
- **Palette Shuffle**: Quickly shuffle color roles across slide elements for fresh creative inspiration.
- **Sleek Popover UI**: Added a dedicated `[ Custom | ✦ Theme ]` tabbed color picker with token badges (`✦ Primary`).

### ✒️ Figma-Style Bezier Pen Tool & Vector Edit Mode
- **Fluid Curve Drawing**: Click to place sharp corner nodes; click-and-drag to pull out smooth, mirrored Bezier control handles (`cpIn` and `cpOut`).
- **Live Curve Previews**: Smooth cubic Bezier curves (`C`) follow the mouse cursor dynamically before committing the next point.
- **Loop Closure**: Approaching the start node highlights an intuitive green snap halo; clicking it closes the vector path (`Z`).
- **Dedicated Vector Edit Mode**: Double-click any vector path to access interactive anchor squares and draggable Bezier handles.
- **Anchor Curve Toggle**: Double-click any anchor to toggle between sharp corners and smooth curves.
- **Hotkeys & Controls**: Press `Delete` or `Backspace` to remove nodes; press `Esc`, `Enter`, or click "Done" on the floating top bar to exit.

### 🧩 SVG Upload & Live Color Customization
- **Vector Upload**: Import custom `.svg` vector files and icons via the Elements Panel.
- **Granular Recolor**: Easily inspect and tweak individual fill and stroke colors directly in the Properties Panel.

### ℹ️ New About Dialog
- Accessible via the Top Bar, Status Bar, and Welcome Screen, featuring version details, highlights, and repository links.

---

## 🛠️ Verification & Build Status
- `npm run build`: Passed cleanly with 0 errors.
- Dependencies: Fabric.js v7.4.0, jsPDF v4.2.1, PptxGenJS v4.0.1, Lucide Icons, Vite v8.2.2.
