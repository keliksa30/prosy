# Changelog

All notable changes to **Prosy** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.4.0] - 2026-09-10

### 🌫️ Figma-Style Gaussian Blur & Background Blur (Frosted Glass)
- **Gaussian Blur**: True shape and image diffusion blur implemented natively without relying on drop shadow tricks.
- **Background Blur (Frosted Glass)**: Realtime backdrop sampling blur ala Figma. Objects sample underlying canvas graphics with `ctx.filter = blur(...)` and local geometry clipping. Includes a 1-click **"Apply Frosted Glass Style"** preset button (`fill: rgba(255,255,255,0.22)`, `stroke: rgba(255,255,255,0.45)`).
- **Decoupled from Shadow**: Blur effects no longer interfere with or overwrite Fabric's native `obj.shadow`.
- **Pipeline Architecture Fix**: Intercepts `drawObject` and bypasses cache when effects are active, ensuring 100% of shapes, vectors, and text render effects without bounding box clipping.

### ✨ Dedicated Glow Effect
- **Independent Luminescence Aura**: Added a dedicated **Glow Effect** section in the properties panel (`[ None | Glow ]`).
- **Custom Color & Neon Palette**: Color picker with quick-access neon presets (Cyan `#00F0FF`, Purple `#A855F7`, Pink `#EC4899`, Amber `#F59E0B`, Emerald `#10B981`, White `#FFFFFF`).
- **Radius Slider**: Smooth radius slider (1–60px). Coexists seamlessly with Drop Shadow and Blur.

### 🌑 Shadow Opacity Slider
- **Dedicated Shadow Opacity Control**: Added an opacity slider (0%–100%) to the Shadow section with automatic RGBA color conversion and preview.

### Advanced 4-Corner Radius & Interactive Circle Handles
- **Independent 4-Corner Radii**: Added support for individual corner radii (Top-Left, Top-Right, Bottom-Right, Bottom-Left) in both panel controls and canvas rendering.
- **On-Canvas Circular Corner Handles**: All 4 corners of rectangles now feature interactive circular handles on the canvas ala Figma, allowing dragging to adjust radius interactively. Holding Alt/Option adjusts only the targeted corner.
- **Properties Panel Toggle**: Added segmented control [ All corners | Independent ] with 4-cell inputs (TL, TR, BL, BR) and unified slider.


### 📱 100% Scannable ISO/IEC 18004 QR Code Generator
- **Scanner Compatibility**: Powered by the industry-standard `qrcode` engine with high-DPI retina rendering (`dpr = 2`). Verified 100% scannable by smartphone cameras and `jsqr`.
- **Top Toolbar & Mobile Access**: Direct access button placed right next to Photos in the top toolbar, as well as the mobile "Add to Slide" bottom sheet.
- **Clickable Hyperlink PDF Export**: Generated QR codes automatically store target URLs in object metadata for interactive PDF exports.

### 💻 macOS Code Snippet Visual Overhaul
- **Pixel-Perfect Terminal Block**: Replaced Fabric group layout with high-DPI canvas rendering, eliminating floating window dots and misaligned code text.
- **Rich Syntax Highlighting**: Real token coloring for keywords, strings, numbers, comments, and functions across 4 themes (*One Dark, Dracula, GitHub Light, Monokai*).

---


## [2.3.1] - 2026-09-10

### 🐛 Properties Panel Scroll Stability Fix
- **Fixed Scroll Reset on Slider Adjustments**: Resolved an annoying bug where adjusting the Blur slider, Opacity slider, or Shadow properties caused the Properties Panel to abruptly jump/scroll to the top.
- **Persistent Scroll Retention**: Implemented automatic scroll position tracking (`_getScrollInfo` & `_restoreScrollInfo`) across re-renders for both desktop (`.panel-scroll`) and mobile bottom sheet (`#mobile-sheet-content`).
- **Targeted Event Filtering**: Avoided unnecessary DOM rebuilding when edits originate internally from PropertiesPanel controls (`source: 'properties'`), eliminating flicker and preserving active control focus.

---

## [2.3.0] - 2026-09-10

### 📐 Smart Guides & Gap Snapping Tingkat Lanjut (Figma-Style)
- **Multi-Alignment Snapping**: Dynamic red alignment guides for edge (left, right, top, bottom) and center (horizontal & vertical) alignment.
- **Smart Spacing Gap Snapping**: Automatically detects equidistant spacing between neighboring elements with vibrant magenta/pink (`#FF007A`) spacing lines and pill badge indicators showing exact pixel gap distance.

### 📄 Interactive Vector PDF Export
- **Selectable & Searchable Text**: Overlays native PDF invisible text layer (`3 Tr`) on top of crisp high-DPI canvas graphics, enabling 100% copy-pasteable and searchable text in any PDF reader.
- **Clickable Hyperlinks**: Automatically registers PDF clickable annotation links for elements and QR codes with attached hyperlinks.

### 💻 Code Snippet Block
- **macOS Terminal Window Card**: Sleek code card with 3 window controls (close, minimize, maximize), programming language badge, optional line numbers, and dark/light themes.
- **Dedicated Editor Modal**: Edit code content, change language (JavaScript, TypeScript, Python, HTML/CSS, Rust, Go, JSON, SQL, etc.), toggle line numbers, and pick color themes directly from the Properties Panel.

### 📱 QR Code Generator via Link
- **Pure JavaScript ISO/IEC 18004 Engine**: Zero external dependencies, fully offline-ready QR code generation.
- **Vector SVG Integration**: Generates crisp vector SVG Fabric groups with custom foreground and background colors.
- **Interactive URL Linking**: Automatically binds hyperlinks to generated QR codes, ensuring export compatibility in interactive PDFs.

### 🌫️ Efek Blur (Visual Blur Filter)
- **Appearance Blur Slider**: Added smooth 0–40px blur controls in Properties Panel.
- **Dual Support**: Hardware-accelerated Fabric.js blur filter for images and soft blur shadow rendering for shapes and vector elements.

### 📦 4 New Enterprise & Professional Template Packs
- **Startup Investor Pitch Deck (Nexus AI)**: Complete 6-slide deck covering Problem, Solution, Market Size, Traction, Team, and The Ask with modern corporate styling and metric callouts.
- **Creative Agency Portfolio (Atelier Nouveau)**: Design studio portfolio featuring asymmetric masonry layouts, full-bleed images, and editorial typography.
- **Product Launch / Brand Deck (Aura One)**: Premium hardware/software launch deck with realistic device mockup frames (iPhone & MacBook), feature highlights, technical specifications table, and pricing tiers.
- **Academic / Research Paper (Latent Geometries)**: Clean academic deck featuring two-column paper layouts, mathematical formulas, empirical benchmark comparison tables, and formal bibliography.

---

## [2.2.0] - 2026-09-10

### 🔤 Custom Font Upload & Brand Font Management
- **Local Font Upload**: Upload `.ttf`, `.otf`, `.woff`, and `.woff2` font files directly from desktop or mobile.
- **Offline & Session Persistence**: Custom fonts are persisted in browser storage and rehydrated across sessions.
- **Dedicated Font Picker Section**: Displayed prominently under "Custom Brand Fonts" with live previews and deletion controls.

### 📱 Mobile UI & iPhone Experience Overhaul
- **Resolved iPhone Infinite Reload Bug**: Fixed mobile Safari reload loop by debouncing canvas resize listeners, guarding against address-bar pixel jitters, and configuring proper LAN HMR.
- **Floating Mask Edit Bar on Mobile**: Fixed missing "Done" and "Cancel" buttons by elevating the bar above mobile bottom bars (`z-index: 9999`) with touch-friendly controls.
- **Quick Mask Edit Button**: Added direct "Mask" button to the mobile quick actions bar when selecting clipped images/shapes.
- **Theme & Pen Tool on Mobile**:
  - Added dedicated **Theme** button to the mobile bottom navigation bar (`[ Slides | Add | Theme | Layers | Design ]`).
  - Added **Pen Tool** and **Theme & Styles** to the mobile "Add to Slide" sheet and More dropdown.
- **Mobile Template & Welcome Screen Scrolling**: Fixed flexbox constraint and overflow bugs on mobile viewports so both the Welcome Screen template grid and the Template Chooser modal layout picker scroll smoothly with touch momentum.

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
