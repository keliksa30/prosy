# Prosy — Future Features & Templates Roadmap

Dokumen ini berisi daftar ide dan rekomendasi fitur untuk pengembangan Prosy ke depan, agar aplikasi ini semakin profesional dan siap bersaing dengan *design tools* kelas *enterprise* (seperti Pitch atau Canva).

## 1. Rekomendasi Tema / Template Baru
Untuk memperluas audiens dari portofolio personal ke B2B dan profesional industri:

*   **Startup Investor Pitch Deck** `[SELESAI v2.3.0]`: Template dengan struktur baku (Problem, Solution, Market Size, Traction, Team, Ask). Desain mengedepankan grafik, visual modern, metrics cards, dan gaya korporat modern.
*   **Creative Agency Portfolio** `[SELESAI v2.3.0]`: Untuk studio desain. Mengandalkan tata letak *masonry*, gambar *full-bleed*, dan desain asimetris editorial yang menonjol.
*   **Product Launch / Brand Deck** `[SELESAI v2.3.0]`: Dikhususkan untuk mempresentasikan produk (fisik/digital), dengan *mockup* perangkat (iPhone & MacBook frames), tabel spesifikasi, dan pricing tiers.
*   **Academic / Research Paper** `[SELESAI v2.3.0]`: Tata letak super bersih untuk peneliti/akademisi dengan format dua kolom, rumus ilmiah, tabel perbandingan empiris, dan daftar pustaka.

## 2. Rekomendasi Fitur Inti (Core Features)
Fitur-fitur teknis yang akan meningkatkan *Quality of Life* (QoL) pengguna profesional:

*   **Smart Guides & Snapping Tingkat Lanjut** `[SELESAI v2.3.0]`: Menambahkan garis bantu otomatis multi-alignment dan deteksi jarak yang sama (*smart spacing gap snapping*) ala Figma dengan visualisasi garis magenta/pink `#FF007A` dan pill badge jarak piksel.
*   **Global Design System (Theme Manager)** `[SELESAI v2.1.0]`: Fitur untuk mengatur palet warna global (*primary, secondary, background*). Mengubah satu warna di Theme Manager akan otomatis memperbarui seluruh bentuk/teks yang menggunakan warna tersebut di semua halaman.
*   **Custom Font Upload** `[SELESAI v2.2.0]`: Mendukung pengunggahan *font* lokal (`.otf`, `.ttf`, `.woff`, atau `.woff2`). Profesional sering kali diwajibkan menggunakan *font* spesifik milik *brand* mereka. Tersedia di Desktop & Mobile.
*   **Export PDF Interaktif** `[SELESAI v2.3.0]`: Peningkatan sistem *export*. Mengganti *export* PDF berbasis *raster murni* menjadi PDF vektor interaktif: teks dapat diseleksi & disalin (*copyable* & *searchable*) dengan native PDF text layer, serta URL/link yang dapat diklik (*clickable hyperlinks*).
*   **Code Snippet Block** `[SELESAI v2.3.0]`: Menambahkan kartu blok kode macOS terminal lengkap dengan 3 tombol jendela, badge bahasa pemrograman, nomor baris, pilihan tema (Dark & Light), dan syntax highlighting, khusus menargetkan developer dan kreator teknikal.
*   **QR Code Generator via Link** `[SELESAI v2.3.0]`: Generator kode QR berbasis URL/tautan langsung di kanvas dengan QR render SVG resolusi tajam, kustomisasi warna foreground/background, dan tautan otomatis clickable di PDF export.
*   **Efek Blur (Gaussian / Soft Blur)** `[SELESAI v2.3.0]`: Kontrol slider Blur visual (0–40px) pada panel Appearance untuk elemen gambar (Fabric filter) dan bentuk/grup kanvas.

## 3. Interaktivitas & Presentasi
*   **Page Transitions & Micro-animations**: Menambahkan opsi animasi sederhana saat pergantian halaman di *Presentation Mode* (misalnya: *Fade, Slide, Zoom, Magic Move*). 
*   **Embeds & iFrames**: Memungkinkan pengguna memasukkan elemen eksternal seperti video YouTube, prototipe interaktif Figma, atau pemutar musik langsung ke dalam kanvas.
