# Rekomendasi Fitur Prosy — Avnac Inspiration, Quick Canvas, & Non-Distortion Template Adaptation

Dokumen analisis mendalam dan rekomendasi arsitektur fitur baru untuk Prosy, berfokus pada adopsi kapabilitas grafis modern (terinspirasi dari platform open-source Avnac), sistem Quick Canvas multi-aspek rasio, dan strategi adaptasi template tanpa distorsi visual.

---

## 1. Analisis Komparasi: Avnac vs Prosy

Avnac adalah alat desain grafis open-source local-first berbasis Fabric.js yang fokus pada pembuatan konten media sosial cepat (Instagram post, story, flyer). Prosy memiliki keunggulan jauh lebih kuat pada slide decks, PDF vektor interaktif, code snippet, smart guides, frosted glass, dan sistem presentasi. 

Dengan menyerap fitur unggulan Avnac, Prosy dapat berevolusi dari sekadar "presentation tool" menjadi "all-in-one visual graphic & presentation suite".

### Fitur Avnac yang Belum Dimiliki Prosy
1. **Quick Canvas Presets & Instant Resize**: Pergantian ukuran kanvas instan antar format media sosial (1:1, 9:16, 16:9, 4:5, A4).
2. **Image Adjustment Suite**: Pengaturan tone foto seperti Brightness, Contrast, Saturation, Hue Rotation, Noise, dan Vignette.
3. **Image Masking / Shape Frames**: Memasukkan gambar ke dalam shape geometri (lingkaran, poligon, bintang) sebagai clipping mask.
4. **Freehand Drawing / Pencil Tool**: Menggambar goresan kuas atau anotasi tangan secara langsung di atas slide/kanvas.
5. **Direct Stock Assets Explorer**: Pencarian aset langsung di dalam editor menggunakan integrasi API stok foto (Unsplash/Pexels) dan ikon (Lucide/Feather).
6. **SVG File Import & Parsing**: Membaca file `.svg` eksternal dan mengubahnya menjadi objek Fabric Path yang setiap warnanya bisa diubah langsung di kanvas.

---

## 2. Quick Canvas Presets & Analisis Bebas Distorsi

### Target Presets
| Format | Aspek Rasio | Resolusi Rekomendasi | Penggunaan Utama |
| :--- | :--- | :--- | :--- |
| **Presentation Deck (Default)** | 16:9 | 1920 x 1080 px | Slide deck, pitch deck, portofolio desktop |
| **Instagram Post / Square** | 1:1 | 1080 x 1080 px | Feed Instagram, profil, visual card |
| **Story / Reels / TikTok** | 9:16 | 1080 x 1920 px | Mobile story, vertikal video cover, status |
| **Portrait Social Feed** | 4:5 | 1080 x 1350 px | Feed Instagram portrait optimal |
| **Print Document (A4)** | 1:1.414 | 1240 x 1754 px (150 DPI) / 2480 x 3508 px (300 DPI) | Resume, proposal dokumen cetak, flyer |

---

### Analisis Distorsi: Apakah Template Akan Rusak Jika Rasio Berubah?

#### Masalah Peregangan Naif (Linear Stretch)
Jika ukuran kanvas diubah dari 16:9 (1920x1080) ke 1:1 (1080x1080) hanya dengan menghitung rasio peregangan independen:
- `scaleX = newWidth / oldWidth` (1080 / 1920 = 0.5625)
- `scaleY = newHeight / oldHeight` (1080 / 1080 = 1.0)

Hasilnya adalah **distorsi parah**:
- Lingkaran berubah menjadi lonjong / elips vertikal.
- Teks menjadi pipih dan memanjang ke atas secara tidak wajar.
- Sudut corner radius menjadi tidak simetris.
- Foto dan avatar tampak tertarik/peot.

#### Solusi Non-Distorsi: 3 Strategi Adaptasi Prosy

Agar template yang ada saat ini dapat berpindah ke rasio kanvas apa pun dengan **100% bebas distorsi**, Prosy wajib menerapkan kombinasi strategi berikut:

#### 1. Strategi Smart Fit & Center (Uniform Scaling)
- Skala objek dihitung menggunakan nilai tunggal (uniform):
  `scale = Math.min(newWidth / oldWidth, newHeight / oldHeight)`
- Karena rasio sumbu X dan sumbu Y selalu identik (`scaleX === scaleY`), bentuk objek geometris, proporsi font, dan foto **dijamin 100% bulat sempurna dan tidak memanjang/memendek**.
- Konten yang telah di-scale kemudian dihitung bounding box totalnya dan ditempatkan tepat di tengah (*auto-centered*) pada kanvas baru:
  `deltaX = (newWidth - (oldWidth * scale)) / 2`
  `deltaY = (newHeight - (oldHeight * scale)) / 2`

#### 2. Strategi Smart Background Cover
- Elemen latar belakang (background rectangle atau background image) tidak ikut di-fit seperti konten teks/shape biasa.
- Background rect disesuaikan secara dinamis agar langsung menutupi ukuran baru kanvas (`width: newWidth`, `height: newHeight`).
- Jika latar belakang menggunakan gambar, digunakan mode `cover` (skala berdasarkan `Math.max`) sehingga seluruh kanvas terisi penuh tanpa ada margin hitam/putih kosong di tepi.

#### 3. Strategi Content Reflow / Layout Anchoring (Tingkat Lanjut)
Elemen template dibagi berdasarkan perannya:
- **Header & Logo**: Di-pin ke batas atas (*top anchor*).
- **Footer & Page Number**: Di-pin ke batas bawah (*bottom anchor*).
- **Card Konten Utama & Ilustrasi**: Diletakkan di tengah dengan penyesuaian kolom (misalnya pada rasio 16:9 kartu berjajar 3 kolom ke samping, sedangkan saat beralih ke 9:16 mobile story, kartu ditumpuk secara vertikal 1 kolom).

---

## 3. Rekomendasi Fitur Tambahan (Diadopsi dari Avnac)

### A. Image Adjustments Suite
Menambahkan panel "Image Filters" di bawah panel Appearance saat objek gambar (Fabric.Image) dipilih:
- **Brightness**: Rentang -100% s/d +100% (`fabric.Image.filters.Brightness`)
- **Contrast**: Rentang -100% s/d +100% (`fabric.Image.filters.Contrast`)
- **Saturation**: Rentang -100% s/d +100% (`fabric.Image.filters.Saturation`)
- **Hue Rotation**: Rentang -180 deg s/d +180 deg (`fabric.Image.filters.HueRotation`)
- **Vignette / Blur**: Efek bayangan sudut artistik foto.
- **Tombol Reset**: Mengembalikan semua filter ke nilai normal (0).

### B. Image Masking & Framing (Shape Clipping)
Fitur memasukkan gambar ke dalam bingkai bentuk:
- Pengguna dapat membuat shape (lingkaran, segi enam, rounded rect), lalu menarik/mengunggah gambar ke shape tersebut.
- Gambar otomatis terpotong mengikuti kontur shape (`clipPath` Fabric.js).
- Pengguna dapat melakukan double-click untuk menggeser posisi foto di dalam bingkai tanpa mengubah bentuk bingkai luarnya.

### C. Freehand & Pen Tool (Drawing Mode)
- **Pencil Tool**: Mengaktifkan `canvas.isDrawingMode = true` dengan opsi ukuran kuas dan warna goresan untuk corat-coret ide, tanda tangan, atau diagram cepat.
- **Pen Tool (Bézier)**: Membuat kurva vektor kustom dengan titik kontrol anchor handle.

### D. Direct Assets Explorer (Stock & Icons)
- Sidebar tab baru "Assets":
  - **Stock Photos**: Integrasi gratis dengan API Unsplash / Pexels, memungkinkan pencarian foto langsung dari Prosy dan memasukkannya ke kanvas dengan sekali klik.
  - **Vector Icons**: Pencarian ribuan ikon SVG dari koleksi Lucide Icons atau Feather Icons langsung ke kanvas.

### E. Native SVG Importer & Parser
- Fitur drag-and-drop file SVG ke kanvas.
- Menggunakan `fabric.loadSVGFromString` untuk mengonversi elemen SVG menjadi `fabric.Group` dari beberapa `fabric.Path`.
- Setiap bagian kurva SVG dapat diwarnai ulang secara mandiri melalui Color Picker Prosy.

---

## 4. Rencana Arsitektur & Tahapan Implementasi di Prosy

### Fase 1: Quick Canvas Presets & Adaptive Resizing
1. **Canvas Size Registry**:
   - Daftarkan konstanta rasio preset di `src/core/CanvasManager.js` dan `src/core/PageManager.js`.
2. **Preset Selector UI**:
   - Tambahkan dropdown/modal di Top Navigation atau Bottom Bar: [ 16:9 Deck | 1:1 Square | 9:16 Story | 4:5 Feed | A4 Document ].
3. **Adaptive Canvas Engine**:
   - Implementasikan fungsi `resizeCanvasFormat(targetPreset, mode = 'fit-center')`.
   - Lakukan penyesuaian otomatis untuk background rects dan posisi elemen dengan uniform scaling untuk menjamin nol distorsi.
4. **Export Manager Alignment**:
   - Pastikan `ExportManager.js` (PDF, PNG, JPEG) mengekspor dokumen sesuai dimensi rasio yang aktif.

### Fase 2: Image Filters & Adjustments
1. Buat helper `src/core/ImageFilterManager.js` untuk membungkus Fabric Image filters.
2. Tambahkan section "Photo Adjustments" di `PropertiesPanel.js` khusus saat tipe objek aktif adalah `image`.
3. Pasang slider real-time untuk Brightness, Contrast, Saturation, dan Hue.

### Fase 3: Image Masking / Shape Frames
1. Implementasikan `clipPath` pada Fabric Object.
2. Sediakan interaksi drag-over: saat file gambar di-drop di atas shape yang sudah ada di kanvas, otomatis terapkan gambar tersebut sebagai fill / clip image.
3. Tambahkan tombol "Crop / Reposition Image" di Properties Panel.

### Fase 4: Stock Assets Integration
1. Sediakan tab "Assets" pada sidebar kiri editor.
2. Integrasikan endpoint pencarian ikon Lucide (ringan dan offline-ready).
3. Sediakan tab pencarian Unsplash dengan lazy loading preview image.
