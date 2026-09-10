# Prosy v2.3.0 — Smart Guides, Interactive Vector PDF, Code Snippets, QR Generator & 4 Enterprise Template Packs

We are thrilled to announce **Prosy v2.3.0**! This release brings major quality-of-life enhancements for designers, developers, and founders: Figma-style smart guides with equal spacing gap snapping, interactive vector PDF exports with selectable text and clickable links, native macOS terminal code snippet blocks, an offline pure JS QR Code generator, appearance blur filters, and 4 brand new professional template packs.

---

## 🚀 Key Highlights in v2.3.0

### 📐 Smart Guides & Equal Spacing (Figma-Style)
- **Multi-Alignment Snapping**: Automatically snaps moving objects to bounding edges (left, right, top, bottom) and center lines (horizontal and vertical) of neighboring elements with red alignment guides.
- **Equidistant Gap Snapping (Smart Spacing)**: Detects equal distance gaps between 3 or more neighboring elements on both horizontal and vertical axes. Renders Figma-style magenta/pink (`#FF007A`) spacing guide bars and pill badges indicating the exact pixel gap distance.

### 📄 Interactive Vector PDF Export
- **Selectable & Searchable Text Layer**: Generates native PDF invisible text layers (`3 Tr`) aligned over high-DPI canvas graphics. Slide text in exported PDFs is now 100% copy-pasteable, selectable, and searchable across Adobe Acrobat, Apple Preview, and browsers.
- **Clickable Hyperlinks**: Registered canvas objects and QR codes with URLs automatically export as active, clickable hyperlink annotations in the PDF.

### 💻 Code Snippet Block (Developer Portfolios & Decks)
- **macOS Terminal Window Card**: Authentic terminal block featuring 3 window control dots (red, yellow, green), language badge pill, optional line numbers, and dark/light color themes.
- **Interactive Code Editor Modal**: Edit code content, change programming languages (JavaScript, TypeScript, Python, HTML/CSS, Rust, Go, SQL, JSON, etc.), toggle line numbering, and select themes directly from the Properties Panel.

### 📱 QR Code Generator via Link
- **Pure JavaScript ISO/IEC 18004 Engine**: Zero external dependencies, fully offline-ready vector QR code generation.
- **Sharp Vector SVG**: Renders crisp SVG vector groups with customizable foreground and background colors.
- **Auto Hyperlink**: Embedded links automatically become interactive clickable buttons in exported PDFs.

### 🌫️ Efek Blur Filter (Gaussian & Soft Blur)
- **Appearance Blur Slider**: Added smooth 0–40px blur controls in the Properties Panel.
- **Dual Support**: Hardware-accelerated Fabric filter for raster images and soft blur drop shadow rendering for shapes and vector elements.

### 📦 4 New Enterprise & Professional Template Packs (Total: 18 Packs)
1. **Startup Investor Pitch Deck (Nexus AI)**: Complete 6-slide deck covering Problem, Solution, Market Size, Traction, Team, and The Ask with modern corporate styling and metric callouts.
2. **Creative Agency Portfolio (Atelier Nouveau)**: Design studio portfolio featuring asymmetric masonry layouts, full-bleed images, and editorial typography.
3. **Product Launch / Brand Deck (Aura One)**: Premium hardware/software launch deck with realistic device mockup frames (iPhone & MacBook), feature highlights, technical specifications table, and pricing tiers.
4. **Academic / Research Paper (Latent Geometries)**: Clean academic deck featuring two-column paper layouts, mathematical formulas, empirical benchmark comparison tables, and formal bibliography.

---

## 🛠️ Verification & Build Status
- `npm run build`: Passed cleanly with 0 errors.
- Automated end-to-end testing with Playwright confirmed template packs (18 packs), QR code generation, Code Snippets, and Smart Guides functionality.
