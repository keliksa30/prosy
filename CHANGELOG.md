# Changelog

All notable changes to **Prosy** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.1.0] - 2026-09-10

### 🎨 Global Theme & Design System (Theme Manager)
- **Real-Time Palette Synchronization**: Changing global tokens (`primary`, `secondary`, `accent`, `background`, `text`) immediately updates the canvas background and all linked elements across all pages.
- **Curated Theme Presets**: Added 8 curated palettes (*Neo Studio, Emerald Luxury, Midnight Indigo, Sunset Coral, Cyber Neon, Clean Minimal, Ocean Breeze, Warm Terracotta*) with 1-click apply.
- **Smart Theme Application**: Added **"Apply to Page"** and **"Apply to All Pages"** to intelligently map shapes, texts, and SVGs to design system tokens.
- **Palette Shuffling**: Added **"Shuffle"** action to rotate color roles across elements for instant creative inspiration.
- **Enhanced Theme UI**: Redesigned ThemePanel with swatch preview bars and improved `colorControl` with a tabbed popover (`[ Custom | ✦ Theme ]`) and neat token badge pills (`✦ Primary`).
- **State Persistence**: Retained `themeColor` in Fabric.js `toJSON` and `toObject` serialization to preserve bindings across undo/redo and project saves.

### ✒️ Figma-Style Bezier Pen Tool & Vector Edit Mode
- **Interactive Tangent Handles**: Click-and-drag to pull out mirrored Bezier handles (`cpIn`, `cpOut`) with live dashed guide lines and circular control dots.
- **Live Curve Preview**: Real-time cubic Bezier curve (`C`) dynamically follows the cursor.
- **Loop Closure**: Approaching the start node highlights a green snap halo; clicking it closes the vector path (`Z`).
- **Vector Edit Mode**: Double-clicking any vector path enters direct node editing with interactive anchor squares and draggable Bezier handles.
- **Curve Toggle**: Double-clicking an anchor point toggles between sharp corners and smooth Bezier curves.
- **Node Management**: Delete selected anchor points using `Delete` or `Backspace`.
- **Floating Toolbar**: Sleek "✦ Edit Vector" top bar with a "Done" button and hotkeys (`Esc` / `Enter`).

### 🧩 SVG Upload & Dynamic Color Editing
- **Custom Vector Import**: Upload `.svg` files via the Elements Panel.
- **Live Recolor**: Inspect and modify individual fill and stroke colors of imported SVGs directly in the Properties Panel.

### ℹ️ About Dialog & Interface Polish
- Added an **About Modal** accessible from the Top Bar, Status Bar, and Welcome Screen displaying version info, feature highlights, and GitHub links.

---

## [2.0.0] - 2026-09-08

### 📄 Native PowerPoint (.pptx) Export
- Export multi-page slide decks into genuine PowerPoint files with native editable textboxes and vector shapes.
- Automatic translation of Fabric shapes (`rect`, `roundRect`, `ellipse`, `line`, `path`) to native Office Open XML shapes.
- Font preservation with fallback mappings for Google Fonts.

### ✍️ Multi-Selection Typography Editing
- Batch font family changes across all selected text objects.
- Proportional font size scaling (`A-` / `A+`).
- Uniform alignment, bold, italic, line-height, and letter-spacing toggles.

### 🖼️ Photo Clipping & Vector Masking
- Cover-crop photo masking into any shape or custom polygon.
- In-place photo replacement and layer order preservation.

### 📦 Portfolio Template Packs
- Curated template packs: Digital Portfolio, Lumina Folio, Jost Brand, Neo Studio, Chroma, Apex Minimal, Code Dark, Executive, Editorial, and Studio Today.
