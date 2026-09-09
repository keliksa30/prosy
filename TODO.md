# Prosy — Task Backlog & Bug Fixes (Rencana Pengerjaan Besok)

Dokumen ini merangkum 4 tugas dan perbaikan bug yang dilaporkan untuk dikerjakan pada sesi berikutnya:

---

## 1. Perbaikan Fitur Photo Placeholder (Double-Click & Upload)

### Permasalahan
- Fitur photo placeholder saat ini belum berjalan dengan lancar / belum berfungsi di sisi pengguna saat klik 2 kali.

### Analisis & Rencana Perbaikan
- **Pemicu Event Double-Click**:
  - Periksa event `mouse:dblclick` pada canvas Fabric.js dan pastikan tidak terblokir oleh `SelectTool` atau mekanisme selection.
  - Pastikan klik ganda baik pada kotak (`Rect`), ikon kamera (`📷`), teks label (`PHOTO FRAME`, `MAIN EDITORIAL LOOK`), maupun child di dalam group (`Photo Frame` pada `ig-post`) dapat mendeteksi target placeholder secara konsisten di semua browser (Chrome, Safari, Firefox).
- **Trigger File Picker**:
  - Perbaiki pemanggilan dialog `<input type="file" accept="image/*">` agar tidak terhambat security policy / pop-up blocker browser saat event click.
- **Eksekusi Auto-Clipping**:
  - Pastikan pembacaan file gambar dan konversi ke clipping mask (`maskWrap: 'single'`) berjalan mulus tanpa jeda atau error.
  - Sediakan fallback visual (cursor pointer saat hover placeholder, atau tombol kecil "Upload Photo" di context menu / sidebar ketika placeholder terpilih).

---

## 2. Opsi Apply Template: "All Pages" vs "This Page Only"

### Permasalahan
- Saat ini saat memilih template pack, semua halaman (6–7 halaman) langsung menggantikan seluruh proyek, sehingga pengguna tidak bisa memilih hanya 1 halaman tertentu saja yang diinginkan.

### Kebutuhan & Rencana Perbaikan
- **Modal Template Chooser & Welcome Screen**:
  - Saat pengguna memilih template pack atau halaman template, sediakan 2 tombol aksi:
    1. **"Apply All Pages" / "Replace Entire Project"**: Memasukkan seluruh halaman template pack ke proyek.
    2. **"Apply to This Page Only"**: Hanya menimpa/mengganti canvas pada halaman aktif saat ini dengan halaman template yang dipilih.
    3. **"Insert as New Page"**: Menambahkan halaman template terpilih sebagai halaman baru setelah halaman aktif, tanpa menghapus halaman lain.
- **Dukungan Multi-Select / Halaman Tertentu**:
  - Pengguna dapat melihat thumbnail tiap halaman di dalam pack dan mengklik halaman mana saja yang ingin di-import.

---

## 3. Perapian UI Sidebar (Fix Button Overflow & Clipping)

### Permasalahan
- Beberapa tombol di panel kanan (*Design / Properties Panel*) keluar jalur (overflow) melewati container card:
  - **Corner Radius**: Tombol preset (`Sharp`, `Soft`, `Rounded`, `Rounder`, `Full`) meluap ke kanan hingga tombol `Full` keluar dari sidebar.
  - **Border**: Tombol toggle style (`Solid`, `Dashed`) tergeser ke kiri dan terpotong di tepi kiri.
  - Elemen input heksadesimal (`#000000`) dan input ukuran border (`0 px`) mepet di lebar sidebar standar.

### Rencana Perbaikan CSS
- **File**: `src/styles/` dan `index.css`:
  - Pada `.radius-presets` / `.chip-row`:
    - Tambahkan `flex-wrap: wrap` atau atur ulang padding (`padding: 4px 6px; font-size: 11px;`) dan gunakan `gap: 4px`.
    - Alternatif: Buat grid 5-kolom dengan `display: grid; grid-template-columns: repeat(5, 1fr);` agar kelima tombol pas 100% di dalam lebar card.
  - Pada border control & segmented controls (`.seg-btn`, `.segmented-control`):
    - Atur `box-sizing: border-box; width: 100%;` dengan `flex: 1 1 0; text-align: center;`.
    - Hilangkan margin negatif yang menyebabkan tombol terpotong di tepi kiri.

---

## 4. Perbaikan Bug Ungroup: Objek Terpental ke Kiri Atas

### Permasalahan
- Ketika pengguna melakukan **Ungroup** (`app.ops.ungroup()` / shortcut ⌘⇧G) pada objek grup, objek anak di dalamnya langsung berpindah tempat / terpental ke pojok kiri atas canvas (`0, 0`), tidak berada di posisi visual semula.

### Akar Masalah & Rencana Perbaikan
- **File**: `src/core/ObjectOps.js` pada fungsi `_explodeGroup(group)` / `ungroup()`:
  - Di Fabric.js (v6/v7), koordinat anak di dalam grup (`child.left`, `child.top`) bersifat **relatif terhadap pusat grup** (local space).
  - Ketika grup di-explode tanpa mendekomposisi matriks transformasi absolut (`calcTransformMatrix`), koordinat lokal anak langsung ditempel ke canvas global, sehingga posisinya menjadi salah (seringkali minus atau mendekati 0,0 di pojok kiri atas).
  - **Solusi**:
    - Untuk setiap anak di dalam grup sebelum dilepas, hitung posisi absolutnya dengan `child.calcTransformMatrix()` lalu gunakan `fabric.util.qrDecompose(matrix)`.
    - Lepaskan anak dari grup (`child.group = undefined; child.parent = undefined;`).
    - Setel posisi anak dengan koordinat absolut hasil dekomposisi (`left: p.translateX`, `top: p.translateY`, `scaleX: p.scaleX`, `scaleY: p.scaleY`, `angle: p.angle`).
    - Panggil `child.setCoords()` lalu tambahkan kembali ke canvas sehingga objek 100% diam di tempat semula tanpa bergeser satu piksel pun.
