# Prompt Generator

**[→ Coba langsung](https://hidayat140897.github.io/prompt-generator-id/)**

Generator prompt serbaguna untuk **teks & tulisan, coding, gambar, dan video/audio**.
Berjalan sepenuhnya di browser: tanpa build step, tanpa server, tanpa akun, tanpa database.

- **33 template** siap pakai di 4 kategori
- **5 format output**: Terstruktur (Markdown), XML, Ringkas, JSON, Baris Tunggal
- **Skor kualitas** prompt beserta saran perbaikan yang konkret
- **Pustaka lokal**: simpan, cari, ekspor, impor prompt
- **Bagikan lewat tautan** — seluruh isian dikodekan di URL
- **Penyempurnaan AI opsional** memakai API key milik sendiri (Claude, OpenAI, Gemini, OpenRouter, atau server lokal kompatibel-OpenAI)

---

## Menjalankan

### Cara tercepat
Dobel-klik `index.html`. Aplikasi langsung jalan karena semua skrip dimuat sebagai
`<script>` biasa, bukan ES module.

> Catatan: dari `file://`, tombol **AI** kemungkinan diblokir CORS oleh browser.
> Semua fitur lain (template, pratinjau, skor, pustaka, ekspor) tetap berfungsi penuh.

### Lewat server lokal (disarankan bila ingin memakai fitur AI)

```bash
python -m http.server 8123
```

Lalu buka `http://localhost:8123`. Alternatif tanpa Python:

```bash
npx serve .
```

---

## Hosting

Ini situs statis murni, jadi bisa ditaruh di mana saja tanpa konfigurasi:

| Layanan | Cara |
|---|---|
| GitHub Pages | Push repo → Settings → Pages → pilih branch `main`, folder `/` |
| Netlify | Tarik folder ini ke netlify.com/drop |
| Vercel | `vercel --prod` di folder ini |
| Cloudflare Pages | Hubungkan repo, kosongkan build command, output directory `/` |
| Hosting cPanel / VPS | Unggah semua berkas ke `public_html` |

Tidak ada variabel lingkungan, tidak ada proses build, tidak ada backend yang perlu disiapkan.

---

## Struktur proyek

```
index.html                  Kerangka halaman + urutan pemuatan skrip
assets/css/styles.css       Seluruh gaya + tema terang/gelap (variabel CSS)
assets/js/core/
  registry.js               Pendaftaran kategori/template + helper penulis template
  composer.js               Merakit blok prompt menjadi teks akhir (5 format)
  quality.js                Penilaian kualitas heuristik
  store.js                  localStorage, pustaka, ekspor/impor, share URL
  ai.js                     Adapter opsional ke penyedia model
assets/js/data/
  modifiers.js              Pustaka modifier bersama untuk gambar & video
  text.js                   Kategori Teks & Tulisan  (10 template)
  code.js                   Kategori Coding & Teknis (9 template)
  image.js                  Kategori Gambar          (8 template)
  video.js                  Kategori Video & Audio   (6 template)
assets/js/ui/
  components.js             Perender field form, modal, toast
  app.js                    Kontroler utama
```

---

## Menambah template baru

Buka salah satu berkas di `assets/js/data/`, lalu tambahkan objek ke array `templates`:

```js
{
  id: 'nama-unik',
  name: 'Nama yang tampil di sidebar',
  desc: 'Satu kalimat penjelasan.',
  tags: ['kata', 'kunci', 'pencarian'],
  fields: [
    { id: 'topik', label: 'Topik', type: 'textarea', required: true, wide: true,
      placeholder: 'contoh isian', hint: 'penjelasan di bawah field' },
    { id: 'gaya', label: 'Gaya', type: 'select', options: ['A', 'B'], default: 'A' },
    { id: 'opsi', label: 'Tambahan', type: 'multi', options: ['X', 'Y'], default: ['X'] }
  ],
  build: function (v) {
    return {
      role: 'Kamu adalah ...',
      context: ['baris konteks'],
      task: ['apa yang harus dikerjakan: ' + v.topik],
      constraints: ['aturan'],
      output: ['bentuk keluaran'],
      success: ['kriteria berhasil']
    };
  }
}
```

**Tipe field yang tersedia:** `text`, `textarea`, `select`, `multi` (chip pilih-banyak),
`tags` (dipisah koma), `toggle`, `range`, `number`.
Properti opsional: `required`, `wide` (melebar dua kolom), `section` (mengelompokkan
field ke kartu terpisah), `placeholder`, `hint`, `default`, `min`/`max`/`step`.

**Blok yang dikembalikan `build()`:** `role`, `context`, `task`, `constraints`, `output`,
`examples`, `success`, `notes` — plus `raw`, `negative`, `params` khusus prompt
gambar/video baris tunggal.

Helper tersedia di `PG.h`: `or()` (nilai atau cadangan), `split()` (pecah input koma),
`csv()`, `has()` (cek pilihan `multi`), `push()` (tambah baris bersyarat), `line()`.

## Menambah kategori baru

1. Buat berkas baru di `assets/js/data/`, misalnya `bisnis.js`.
2. Isi dengan `PG.registerCategory({ id, name, icon, desc, defaultFormat, templates: [...] })`.
3. Daftarkan satu baris `<script>` di `index.html` pada blok **Data**.

Tidak ada langkah lain — sidebar, pencarian, dan pustaka akan langsung mengenalinya.

---

## Privasi

Seluruh data (prompt tersimpan, draf, pengaturan, API key) berada di `localStorage`
browser pengguna. Tidak ada yang dikirim ke mana pun, **kecuali** saat tombol AI ditekan:
saat itu prompt dan API key dikirim langsung dari browser ke penyedia model yang dipilih.

API key tersimpan dalam bentuk teks biasa di browser. Jangan pakai fitur AI di komputer
bersama; matikan opsi *Ingat API key* bila perlu.

## Pintasan papan ketik

| Pintasan | Fungsi |
|---|---|
| `Ctrl` + `K` | Fokus ke kotak pencarian template |
| `Ctrl` + `S` | Simpan prompt ke pustaka |
| `Ctrl` + `Shift` + `C` | Salin prompt ke clipboard |

## Dukungan browser

Chrome, Edge, Firefox, dan Safari versi modern. Kode ditulis dengan ES5 + beberapa API
umum (`fetch`, `Promise`, `classList`, `dataset`) sehingga tidak butuh transpiler.
