/* ==========================================================================
   data/code.js — kategori "Coding & Teknis"
   ========================================================================== */

(function (PG) {
  'use strict';
  var h = PG.h;

  var LANGS = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'PHP', 'Ruby',
    'Kotlin', 'Swift', 'C++', 'SQL', 'Bash', 'Dart / Flutter', 'HTML/CSS', 'Lainnya'];

  function fLang(def) {
    return { id: 'lang', label: 'Bahasa / stack', type: 'select', options: LANGS, default: def || 'JavaScript' };
  }
  function fStack() {
    return { id: 'stack', label: 'Framework & library', type: 'text',
      placeholder: 'mis. React 18, Express, Prisma, PostgreSQL' };
  }
  function fCode(label, req) {
    return { id: 'code', label: label || 'Kode', type: 'textarea', wide: true, required: !!req,
      placeholder: 'Tempel kode di sini.' };
  }
  function fExtra() {
    return { id: 'extra', label: 'Instruksi tambahan', type: 'textarea', wide: true,
      placeholder: 'Konvensi tim, hal yang harus dihindari, dsb.' };
  }

  PG.registerCategory({
    id: 'code',
    name: 'Coding & Teknis',
    icon: '💻',
    desc: 'Bangun fitur, debug, review, refactor, tes, dokumentasi, dan arsitektur.',
    defaultFormat: 'xml',
    templates: [

      /* ------------------------------------------------------------------ */
      {
        id: 'feature',
        name: 'Bangun Fitur / Kode Baru',
        desc: 'Minta implementasi fitur dengan spesifikasi yang jelas.',
        tags: ['fitur', 'implementasi', 'bangun', 'develop', 'kode baru'],
        fields: [
          { id: 'feature', label: 'Fitur yang dibangun', type: 'textarea', required: true, wide: true,
            placeholder: 'mis. endpoint untuk upload gambar dengan kompresi otomatis dan batas 5MB' },
          fLang(),
          fStack(),
          { id: 'existing', label: 'Konteks kode yang sudah ada', type: 'textarea', wide: true,
            placeholder: 'Struktur folder, pola yang dipakai, atau potongan kode terkait.',
            hint: 'Ini yang paling menentukan apakah kode hasilnya nyambung dengan proyekmu.' },
          { id: 'io', label: 'Input & output', type: 'textarea', wide: true,
            placeholder: 'Bentuk data masuk dan data keluar, termasuk tipe.' },
          { id: 'edge', label: 'Kasus tepi yang harus ditangani', type: 'textarea', wide: true,
            placeholder: 'File rusak, koneksi putus, input kosong, akses ditolak.' },
          { id: 'style', label: 'Gaya kode', type: 'select',
            options: ['Ikuti kode yang sudah ada', 'Fungsional', 'OOP', 'Sederhana & eksplisit', 'Performa dulu'],
            default: 'Ikuti kode yang sudah ada' },
          { id: 'opts', label: 'Sertakan', type: 'multi',
            options: ['Unit test', 'Penanganan error', 'Komentar pada bagian rumit', 'Tipe / type hints',
              'Logging', 'Validasi input', 'Contoh pemakaian', 'Catatan performa', 'Pertimbangan keamanan'],
            default: ['Penanganan error', 'Validasi input', 'Contoh pemakaian'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah software engineer senior. Kamu menulis kode yang dibaca manusia lain, ' +
            'menolak abstraksi yang belum dibutuhkan, dan selalu memikirkan apa yang bisa gagal.';

          b.context.push('Bahasa/stack: ' + h.or(v.lang, 'JavaScript') + (v.stack ? ' — ' + v.stack : '') + '.');
          if (v.existing) b.context.push('Kode dan pola yang sudah ada:\n```\n' + v.existing + '\n```');
          h.push(b.context, v.io, 'Kontrak input/output: ' + v.io);

          b.task.push('Implementasikan: ' + h.or(v.feature, '(isi deskripsi fitur)'));
          h.push(b.task, v.edge, 'Tangani kasus tepi berikut: ' + v.edge);

          b.constraints.push('Gaya kode: ' + h.or(v.style, 'Ikuti kode yang sudah ada') + '.');
          b.constraints.push('Jangan memperkenalkan dependensi baru tanpa menjelaskan alasannya.');
          b.constraints.push('Kode harus bisa langsung dijalankan, bukan pseudocode.');
          b.constraints.push('Jika ada bagian spesifikasi yang ambigu, sebutkan asumsimu di awal, jangan diam-diam memilih.');
          if (h.has(v.opts, 'Pertimbangan keamanan')) b.constraints.push('Perhatikan keamanan: validasi input, hindari injection, jangan bocorkan detail internal di pesan error.');
          h.push(b.constraints, v.extra, v.extra);

          b.output.push('Kode lengkap dalam blok kode, dipisah per file bila lebih dari satu file.');
          if (h.has(v.opts, 'Tipe / type hints')) b.output.push('Sertakan tipe/type hints yang eksplisit.');
          if (h.has(v.opts, 'Penanganan error')) b.output.push('Sertakan penanganan error yang memberi pesan berguna.');
          if (h.has(v.opts, 'Validasi input')) b.output.push('Sertakan validasi input di batas sistem.');
          if (h.has(v.opts, 'Logging')) b.output.push('Sertakan logging pada titik penting, tanpa membocorkan data sensitif.');
          if (h.has(v.opts, 'Komentar pada bagian rumit')) b.output.push('Beri komentar hanya pada bagian yang tidak jelas dari kodenya sendiri.');
          if (h.has(v.opts, 'Unit test')) b.output.push('Sertakan unit test yang mencakup jalur normal dan kasus tepi.');
          if (h.has(v.opts, 'Contoh pemakaian')) b.output.push('Sertakan contoh pemakaian singkat.');
          if (h.has(v.opts, 'Catatan performa')) b.output.push('Sertakan catatan kompleksitas dan potensi bottleneck.');

          b.success.push('Kode bisa di-copy ke proyek dan berjalan tanpa perubahan berarti.');
          b.success.push('Developer lain paham alasan setiap keputusan tanpa harus bertanya.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'debug',
        name: 'Debug & Perbaiki Error',
        desc: 'Cari akar masalah dari error atau perilaku yang salah.',
        tags: ['debug', 'error', 'bug', 'perbaiki', 'fix', 'troubleshoot'],
        fields: [
          { id: 'symptom', label: 'Gejala yang terlihat', type: 'textarea', required: true, wide: true,
            placeholder: 'Apa yang terjadi, dan apa yang seharusnya terjadi.' },
          { id: 'error', label: 'Pesan error / stack trace', type: 'textarea', wide: true,
            placeholder: 'Tempel apa adanya, jangan dipotong.' },
          fCode('Kode yang dicurigai'),
          fLang(),
          fStack(),
          { id: 'when', label: 'Kapan muncul', type: 'select',
            options: ['Selalu', 'Kadang-kadang (intermiten)', 'Hanya di produksi', 'Hanya di lokal',
              'Setelah perubahan tertentu', 'Hanya pada data tertentu', 'Hanya di bawah beban tinggi'],
            default: 'Selalu' },
          { id: 'tried', label: 'Yang sudah dicoba', type: 'textarea', wide: true,
            placeholder: 'Supaya tidak disarankan ulang.' },
          { id: 'env', label: 'Lingkungan', type: 'text', wide: true,
            placeholder: 'OS, versi runtime, versi library, browser' },
          { id: 'opts', label: 'Tambahan', type: 'multi',
            options: ['Jelaskan akar masalahnya', 'Beri beberapa hipotesis berurut', 'Sertakan cara verifikasi',
              'Sertakan test yang menangkap bug ini', 'Sarankan pencegahan ke depan'],
            default: ['Jelaskan akar masalahnya', 'Beri beberapa hipotesis berurut', 'Sertakan cara verifikasi'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah engineer yang ahli debugging. Kamu tidak menebak; kamu membentuk hipotesis, ' +
            'lalu merancang cara termurah untuk membuktikan atau menggugurkannya.';

          b.context.push('Stack: ' + h.or(v.lang, 'JavaScript') + (v.stack ? ' — ' + v.stack : '') + '.');
          h.push(b.context, v.env, 'Lingkungan: ' + v.env + '.');
          b.context.push('Frekuensi kemunculan: ' + h.or(v.when, 'Selalu') + '.');
          if (v.error) b.context.push('Pesan error:\n```\n' + v.error + '\n```');
          if (v.code) b.context.push('Kode terkait:\n```\n' + v.code + '\n```');
          h.push(b.context, v.tried, 'Sudah dicoba dan tidak berhasil: ' + v.tried);

          b.task.push('Gejala: ' + h.or(v.symptom, '(isi gejala)'));
          b.task.push('Temukan akar masalahnya, lalu berikan perbaikan yang benar — bukan sekadar menutupi gejala.');

          b.constraints.push('Jangan menyarankan ulang hal yang sudah dicoba.');
          b.constraints.push('Jika informasi yang ada belum cukup untuk memastikan, sebutkan persis data apa yang perlu ditambahkan (log, nilai variabel, langkah reproduksi).');
          b.constraints.push('Bedakan dengan jelas antara yang kamu ketahui dari kode dan yang masih dugaan.');
          h.push(b.constraints, v.extra, v.extra);

          if (h.has(v.opts, 'Beri beberapa hipotesis berurut')) b.output.push('Daftar hipotesis diurutkan dari yang paling mungkin, masing-masing dengan alasan.');
          if (h.has(v.opts, 'Jelaskan akar masalahnya')) b.output.push('Penjelasan akar masalah: mengapa kode berperilaku seperti itu.');
          b.output.push('Perbaikan berupa kode konkret (tampilkan bagian sebelum dan sesudah).');
          if (h.has(v.opts, 'Sertakan cara verifikasi')) b.output.push('Langkah verifikasi untuk memastikan perbaikan benar-benar bekerja.');
          if (h.has(v.opts, 'Sertakan test yang menangkap bug ini')) b.output.push('Satu test yang gagal sebelum perbaikan dan lulus sesudahnya.');
          if (h.has(v.opts, 'Sarankan pencegahan ke depan')) b.output.push('Saran agar kelas bug yang sama tidak terulang.');

          b.success.push('Akar masalah dijelaskan sampai ke sebabnya, bukan berhenti di "coba tambahkan pengecekan null".');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'review',
        name: 'Code Review',
        desc: 'Review kode untuk bug, keamanan, dan kualitas.',
        tags: ['review', 'audit', 'kualitas', 'pr'],
        fields: [
          fCode('Kode yang direview', true),
          fLang(),
          { id: 'purpose', label: 'Apa yang seharusnya dilakukan kode ini', type: 'textarea', wide: true },
          { id: 'focus', label: 'Fokus review', type: 'multi', wide: true,
            options: ['Kebenaran / bug', 'Keamanan', 'Performa', 'Keterbacaan', 'Penanganan error',
              'Cakupan test', 'Duplikasi & abstraksi', 'Konsistensi gaya', 'Kompatibilitas mundur'],
            default: ['Kebenaran / bug', 'Keamanan', 'Keterbacaan'] },
          { id: 'strictness', label: 'Tingkat ketat', type: 'select',
            options: ['Longgar (hanya masalah serius)', 'Normal', 'Ketat (termasuk gaya dan detail kecil)'],
            default: 'Normal' },
          { id: 'opts', label: 'Bentuk hasil', type: 'multi',
            options: ['Urutkan berdasarkan keparahan', 'Sertakan kode perbaikan', 'Sebutkan yang sudah bagus',
              'Sertakan skenario kegagalan konkret', 'Tandai temuan yang belum pasti'],
            default: ['Urutkan berdasarkan keparahan', 'Sertakan kode perbaikan', 'Sertakan skenario kegagalan konkret'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah reviewer kode yang tajam tapi adil. Kamu hanya melaporkan temuan yang ' +
            'benar-benar bisa kamu pertanggungjawabkan, dan kamu selalu menyertakan skenario kegagalan nyata.';
          b.context.push('Bahasa: ' + h.or(v.lang, 'JavaScript') + '.');
          h.push(b.context, v.purpose, 'Maksud kode: ' + v.purpose);
          b.context.push('Kode:\n```\n' + h.or(v.code, '[KODE]') + '\n```');
          b.task.push('Review kode di atas.');
          var focus = Array.isArray(v.focus) ? v.focus : [];
          if (focus.length) b.task.push('Fokus pada: ' + focus.join(', ') + '.');
          b.constraints.push('Tingkat ketat: ' + h.or(v.strictness, 'Normal') + '.');
          b.constraints.push('Jangan melaporkan masalah gaya sebagai bug. Pisahkan keduanya.');
          b.constraints.push('Untuk setiap temuan, tunjukkan baris atau potongan kode yang dimaksud.');
          b.constraints.push('Jangan mengarang masalah demi terlihat teliti. Jika kodenya memang bagus, katakan begitu.');
          if (h.has(v.opts, 'Tandai temuan yang belum pasti')) b.constraints.push('Beri label [PERLU DIPASTIKAN] pada temuan yang bergantung pada konteks di luar kode ini.');
          h.push(b.constraints, v.extra, v.extra);
          if (h.has(v.opts, 'Urutkan berdasarkan keparahan')) b.output.push('Kelompokkan temuan: Kritis, Penting, Minor, Saran.');
          if (h.has(v.opts, 'Sertakan skenario kegagalan konkret')) b.output.push('Tiap temuan menyertakan input/kondisi konkret yang memicu kegagalan.');
          if (h.has(v.opts, 'Sertakan kode perbaikan')) b.output.push('Tiap temuan menyertakan potongan kode perbaikan.');
          if (h.has(v.opts, 'Sebutkan yang sudah bagus')) b.output.push('Sertakan bagian singkat tentang apa yang sudah dikerjakan dengan baik.');
          b.output.push('Tutup dengan kesimpulan: layak merge atau belum, dan apa syaratnya.');
          b.success.push('Setiap temuan bisa dibuktikan dengan skenario nyata, bukan sekadar preferensi.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'refactor',
        name: 'Refactor & Optimasi',
        desc: 'Rapikan atau percepat kode tanpa mengubah perilakunya.',
        tags: ['refactor', 'optimasi', 'performa', 'bersihkan', 'clean code'],
        fields: [
          fCode('Kode yang direfactor', true),
          fLang(),
          { id: 'goal', label: 'Tujuan utama', type: 'select',
            options: ['Lebih mudah dibaca', 'Kurangi duplikasi', 'Percepat eksekusi', 'Kurangi pemakaian memori',
              'Pecah fungsi raksasa', 'Mudahkan pengujian', 'Modernkan sintaks', 'Kurangi dependensi'],
            default: 'Lebih mudah dibaca' },
          { id: 'constraintsIn', label: 'Batasan yang wajib dijaga', type: 'textarea', wide: true,
            placeholder: 'mis. API publik tidak boleh berubah, harus tetap jalan di Node 16' },
          { id: 'perf', label: 'Masalah performa yang diketahui', type: 'textarea', wide: true,
            placeholder: 'mis. query N+1 saat memuat daftar pesanan' },
          { id: 'opts', label: 'Tambahan', type: 'multi',
            options: ['Jelaskan setiap perubahan', 'Refactor bertahap (langkah demi langkah)',
              'Sertakan test untuk mengunci perilaku', 'Ukur perkiraan dampak performa', 'Tandai risiko perubahan'],
            default: ['Jelaskan setiap perubahan', 'Tandai risiko perubahan'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah engineer yang percaya bahwa refactor terbaik adalah yang paling membosankan: ' +
            'perilaku persis sama, kode jauh lebih jelas.';
          b.context.push('Bahasa: ' + h.or(v.lang, 'JavaScript') + '.');
          h.push(b.context, v.perf, 'Masalah performa yang diketahui: ' + v.perf);
          b.context.push('Kode saat ini:\n```\n' + h.or(v.code, '[KODE]') + '\n```');
          b.task.push('Refactor kode di atas dengan tujuan utama: ' + h.or(v.goal, 'Lebih mudah dibaca') + '.');
          b.constraints.push('Perilaku yang terlihat dari luar tidak boleh berubah sama sekali.');
          b.constraints.push('Jangan menambah abstraksi yang baru terasa berguna kalau ada tiga pemakaian lagi di masa depan.');
          h.push(b.constraints, v.constraintsIn, 'Batasan wajib: ' + v.constraintsIn);
          h.push(b.constraints, v.extra, v.extra);
          b.output.push('Kode hasil refactor secara utuh.');
          if (h.has(v.opts, 'Jelaskan setiap perubahan')) b.output.push('Daftar perubahan: apa yang diubah, kenapa, dan apa yang menjadi lebih baik.');
          if (h.has(v.opts, 'Refactor bertahap (langkah demi langkah)')) b.output.push('Pecah menjadi langkah-langkah kecil yang masing-masing tetap membuat kode jalan.');
          if (h.has(v.opts, 'Sertakan test untuk mengunci perilaku')) b.output.push('Sertakan test yang mengunci perilaku lama sebelum refactor dilakukan.');
          if (h.has(v.opts, 'Ukur perkiraan dampak performa')) b.output.push('Perkirakan dampak performa dengan notasi kompleksitas dan alasan.');
          if (h.has(v.opts, 'Tandai risiko perubahan')) b.output.push('Sebutkan bagian mana yang paling berisiko dan bagaimana mengujinya.');
          b.success.push('Test lama tetap lulus tanpa diubah.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'tests',
        name: 'Buat Unit Test',
        desc: 'Tulis test yang benar-benar menangkap kesalahan.',
        tags: ['test', 'testing', 'unit test', 'jest', 'pytest'],
        fields: [
          fCode('Kode yang diuji', true),
          fLang(),
          { id: 'framework', label: 'Framework test', type: 'text', placeholder: 'mis. Jest, Vitest, pytest, JUnit' },
          { id: 'kind', label: 'Jenis test', type: 'select',
            options: ['Unit test', 'Integration test', 'End-to-end', 'Property-based', 'Snapshot'], default: 'Unit test' },
          { id: 'cases', label: 'Kasus yang wajib diuji', type: 'textarea', wide: true,
            placeholder: 'Jalur normal, input kosong, nilai batas, kegagalan jaringan.' },
          { id: 'mock', label: 'Yang perlu di-mock', type: 'text', wide: true,
            placeholder: 'mis. panggilan HTTP, jam sistem, database' },
          { id: 'opts', label: 'Tambahan', type: 'multi',
            options: ['Sertakan kasus tepi', 'Sertakan kasus kegagalan', 'Nama test deskriptif (given-when-then)',
              'Hindari test yang rapuh', 'Sebutkan cabang yang belum tercakup'],
            default: ['Sertakan kasus tepi', 'Sertakan kasus kegagalan', 'Nama test deskriptif (given-when-then)'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah engineer yang menulis test untuk menangkap bug, bukan untuk mengejar angka coverage.';
          b.context.push('Bahasa: ' + h.or(v.lang, 'JavaScript') + '. Framework: ' + h.or(v.framework, '(pilih yang paling umum untuk stack ini)') + '.');
          b.context.push('Kode yang diuji:\n```\n' + h.or(v.code, '[KODE]') + '\n```');
          b.task.push('Tulis ' + h.or(v.kind, 'unit test') + ' untuk kode di atas.');
          h.push(b.task, v.cases, 'Pastikan kasus berikut tercakup: ' + v.cases);
          h.push(b.constraints, v.mock, 'Mock hanya untuk: ' + v.mock + '. Selain itu gunakan implementasi asli.');
          b.constraints.push('Setiap test menguji satu perilaku dan punya alasan jelas untuk ada.');
          if (h.has(v.opts, 'Hindari test yang rapuh')) b.constraints.push('Jangan bergantung pada urutan eksekusi, waktu nyata, atau detail implementasi internal.');
          if (h.has(v.opts, 'Nama test deskriptif (given-when-then)')) b.constraints.push('Nama test menjelaskan kondisi dan hasil yang diharapkan, bukan nama fungsi.');
          h.push(b.constraints, v.extra, v.extra);
          b.output.push('Berkas test lengkap dalam blok kode, siap dijalankan.');
          if (h.has(v.opts, 'Sertakan kasus tepi')) b.output.push('Sertakan kasus nilai batas dan input tak terduga.');
          if (h.has(v.opts, 'Sertakan kasus kegagalan')) b.output.push('Sertakan test untuk jalur error dan pengecualian.');
          if (h.has(v.opts, 'Sebutkan cabang yang belum tercakup')) b.output.push('Tutup dengan daftar cabang logika yang belum tercakup dan alasannya.');
          b.success.push('Jika satu baris logika diubah secara salah, setidaknya satu test akan gagal.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'docs',
        name: 'Dokumentasi & README',
        desc: 'Dokumentasi teknis yang benar-benar dibaca orang.',
        tags: ['dokumentasi', 'readme', 'docs', 'api doc'],
        fields: [
          { id: 'subject', label: 'Yang didokumentasikan', type: 'textarea', required: true, wide: true,
            placeholder: 'Nama proyek/modul dan apa fungsinya.' },
          fCode('Kode / struktur proyek (opsional)'),
          { id: 'kind', label: 'Jenis dokumen', type: 'select',
            options: ['README proyek', 'Dokumentasi API', 'Panduan memulai (quickstart)', 'Panduan kontribusi',
              'Dokumen arsitektur', 'Runbook operasional', 'Changelog', 'Komentar docstring'],
            default: 'README proyek' },
          { id: 'reader', label: 'Pembaca', type: 'select',
            options: ['Developer baru di tim', 'Pengguna eksternal', 'Tim operasional', 'Diri sendiri 6 bulan lagi'],
            default: 'Developer baru di tim' },
          fLang(),
          { id: 'opts', label: 'Bagian yang disertakan', type: 'multi', wide: true,
            options: ['Ringkasan 2 kalimat', 'Instalasi', 'Contoh cepat', 'Referensi API lengkap', 'Konfigurasi / env',
              'Troubleshooting', 'Diagram alur', 'Keputusan desain & alasannya', 'Batasan yang diketahui'],
            default: ['Ringkasan 2 kalimat', 'Instalasi', 'Contoh cepat', 'Troubleshooting'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah technical writer yang menulis dokumentasi untuk orang yang sedang terburu-buru ' +
            'dan sedikit frustrasi.';
          b.context.push('Pembaca: ' + h.or(v.reader, 'Developer baru di tim') + '. Bahasa/stack: ' + h.or(v.lang, 'JavaScript') + '.');
          if (v.code) b.context.push('Kode / struktur proyek:\n```\n' + v.code + '\n```');
          b.task.push('Tulis ' + h.or(v.kind, 'README proyek') + ' untuk: ' + h.or(v.subject, '(isi subjek)'));
          b.constraints.push('Contoh kode harus bisa disalin dan dijalankan apa adanya.');
          b.constraints.push('Jangan mendokumentasikan hal yang tidak ada di kode. Tandai [PERLU DIISI] bila informasinya kurang.');
          b.constraints.push('Hindari kalimat yang tidak memberi informasi seperti "modul ini sangat powerful".');
          h.push(b.constraints, v.extra, v.extra);
          b.output.push('Format Markdown.');
          var sec = Array.isArray(v.opts) ? v.opts : [];
          if (sec.length) b.output.push('Sertakan bagian: ' + sec.join(', ') + '.');
          if (h.has(v.opts, 'Diagram alur')) b.output.push('Diagram ditulis dalam sintaks Mermaid.');
          if (h.has(v.opts, 'Referensi API lengkap')) b.output.push('Referensi API berbentuk tabel: nama, tipe, wajib/opsional, default, deskripsi.');
          b.success.push('Pembaca bisa menjalankan proyek dalam 5 menit tanpa bertanya ke siapa pun.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'architecture',
        name: 'Desain Arsitektur / Sistem',
        desc: 'Rancang sistem, pilih teknologi, dan pertimbangkan trade-off.',
        tags: ['arsitektur', 'desain', 'sistem', 'skalabilitas', 'database'],
        fields: [
          { id: 'system', label: 'Sistem yang dirancang', type: 'textarea', required: true, wide: true,
            placeholder: 'mis. sistem antrian pesanan untuk 500 outlet dengan sinkronisasi offline' },
          { id: 'scale', label: 'Skala yang diharapkan', type: 'textarea', wide: true,
            placeholder: 'Jumlah pengguna, request per detik, volume data, pertumbuhan.' },
          { id: 'constraintsIn', label: 'Batasan', type: 'textarea', wide: true,
            placeholder: 'Anggaran, tim, tenggat, teknologi yang sudah ada, regulasi.' },
          { id: 'priorities', label: 'Prioritas', type: 'multi', wide: true,
            options: ['Cepat dirilis', 'Biaya rendah', 'Skalabilitas', 'Keandalan / uptime', 'Keamanan',
              'Mudah dirawat', 'Latensi rendah', 'Konsistensi data'],
            default: ['Mudah dirawat', 'Keandalan / uptime'] },
          { id: 'stackIn', label: 'Teknologi yang sudah dipakai', type: 'text', wide: true },
          { id: 'opts', label: 'Sertakan', type: 'multi',
            options: ['Diagram arsitektur (Mermaid)', 'Skema data', 'Beberapa alternatif + trade-off',
              'Rencana migrasi bertahap', 'Titik kegagalan & mitigasi', 'Perkiraan biaya', 'Yang sengaja TIDAK dipilih'],
            default: ['Diagram arsitektur (Mermaid)', 'Beberapa alternatif + trade-off', 'Titik kegagalan & mitigasi'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah arsitek sistem yang skeptis terhadap kerumitan. Kamu memilih solusi paling ' +
            'sederhana yang memenuhi kebutuhan nyata, dan kamu selalu menyebutkan harganya.';
          h.push(b.context, v.scale, 'Skala: ' + v.scale);
          h.push(b.context, v.constraintsIn, 'Batasan: ' + v.constraintsIn);
          h.push(b.context, v.stackIn, 'Teknologi eksisting: ' + v.stackIn + '.');
          var pr = Array.isArray(v.priorities) ? v.priorities : [];
          if (pr.length) b.context.push('Prioritas, dari yang terpenting: ' + pr.join(' > ') + '.');
          b.task.push('Rancang arsitektur untuk: ' + h.or(v.system, '(isi sistem)'));
          b.constraints.push('Mulai dari kebutuhan, bukan dari teknologi. Jangan menyarankan microservices atau Kubernetes kecuali skalanya benar-benar menuntut.');
          b.constraints.push('Setiap pilihan teknologi disertai alasan dan konsekuensinya.');
          b.constraints.push('Sebutkan asumsi yang kamu pakai bila informasinya kurang.');
          h.push(b.constraints, v.extra, v.extra);
          b.output.push('Mulai dengan ringkasan arsitektur dalam satu paragraf.');
          if (h.has(v.opts, 'Diagram arsitektur (Mermaid)')) b.output.push('Diagram komponen dalam sintaks Mermaid.');
          if (h.has(v.opts, 'Skema data')) b.output.push('Skema data utama beserta indeks penting.');
          if (h.has(v.opts, 'Beberapa alternatif + trade-off')) b.output.push('Dua sampai tiga alternatif arsitektur dengan tabel trade-off.');
          if (h.has(v.opts, 'Titik kegagalan & mitigasi')) b.output.push('Daftar titik kegagalan tunggal dan mitigasinya.');
          if (h.has(v.opts, 'Rencana migrasi bertahap')) b.output.push('Rencana migrasi bertahap yang tetap aman di setiap langkah.');
          if (h.has(v.opts, 'Perkiraan biaya')) b.output.push('Perkiraan biaya bulanan beserta asumsi perhitungannya.');
          if (h.has(v.opts, 'Yang sengaja TIDAK dipilih')) b.output.push('Bagian "yang sengaja tidak dipilih" beserta alasannya.');
          b.success.push('Tim bisa mulai membangun minggu depan tanpa rapat tambahan.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'sql',
        name: 'Query & Database',
        desc: 'Query SQL, desain skema, dan optimasi database.',
        tags: ['sql', 'database', 'query', 'postgres', 'mysql'],
        fields: [
          { id: 'goal', label: 'Yang ingin dicapai', type: 'textarea', required: true, wide: true,
            placeholder: 'mis. ambil 10 pelanggan dengan pertumbuhan belanja tertinggi 3 bulan terakhir' },
          { id: 'schema', label: 'Skema tabel', type: 'textarea', wide: true,
            placeholder: 'CREATE TABLE ... atau deskripsi kolom dan relasinya.' },
          { id: 'db', label: 'Database', type: 'select',
            options: ['PostgreSQL', 'MySQL / MariaDB', 'SQLite', 'SQL Server', 'Oracle', 'BigQuery', 'ClickHouse', 'MongoDB'],
            default: 'PostgreSQL' },
          { id: 'volume', label: 'Perkiraan volume data', type: 'text', placeholder: 'mis. 50 juta baris di tabel orders' },
          { id: 'task', label: 'Jenis pekerjaan', type: 'select',
            options: ['Tulis query', 'Optimasi query lambat', 'Desain skema baru', 'Tulis migrasi', 'Analisis indeks'],
            default: 'Tulis query' },
          { id: 'current', label: 'Query saat ini (jika ada)', type: 'textarea', wide: true },
          { id: 'opts', label: 'Tambahan', type: 'multi',
            options: ['Jelaskan cara kerjanya', 'Sertakan rencana indeks', 'Sertakan contoh hasil',
              'Pertimbangkan NULL dan duplikat', 'Sertakan versi alternatif'],
            default: ['Jelaskan cara kerjanya', 'Pertimbangkan NULL dan duplikat'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah database engineer yang menulis query benar lebih dulu, baru cepat.';
          b.context.push('Database: ' + h.or(v.db, 'PostgreSQL') + '.');
          h.push(b.context, v.volume, 'Volume data: ' + v.volume + '.');
          if (v.schema) b.context.push('Skema:\n```sql\n' + v.schema + '\n```');
          if (v.current) b.context.push('Query saat ini:\n```sql\n' + v.current + '\n```');
          b.task.push(h.or(v.task, 'Tulis query') + ' untuk: ' + h.or(v.goal, '(isi tujuan)'));
          b.constraints.push('Gunakan sintaks yang valid untuk ' + h.or(v.db, 'PostgreSQL') + ' saja.');
          b.constraints.push('Jangan mengasumsikan kolom yang tidak ada di skema; jika perlu, tanyakan atau tandai sebagai asumsi.');
          if (h.has(v.opts, 'Pertimbangkan NULL dan duplikat')) b.constraints.push('Tangani NULL, duplikat, dan zona waktu secara eksplisit.');
          h.push(b.constraints, v.extra, v.extra);
          b.output.push('Query dalam blok kode SQL yang rapi dan mudah dibaca.');
          if (h.has(v.opts, 'Jelaskan cara kerjanya')) b.output.push('Penjelasan singkat cara kerja query, bagian per bagian.');
          if (h.has(v.opts, 'Sertakan rencana indeks')) b.output.push('Indeks yang disarankan beserta alasannya.');
          if (h.has(v.opts, 'Sertakan contoh hasil')) b.output.push('Contoh baris hasil dalam bentuk tabel.');
          if (h.has(v.opts, 'Sertakan versi alternatif')) b.output.push('Satu versi alternatif dengan pendekatan berbeda dan perbandingannya.');
          b.success.push('Query memberi hasil yang benar bahkan pada data kotor.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'explain',
        name: 'Jelaskan Kode / Konsep',
        desc: 'Pahami kode asing atau konsep teknis yang rumit.',
        tags: ['jelaskan', 'belajar', 'explain', 'paham'],
        fields: [
          { id: 'subject', label: 'Kode atau konsep', type: 'textarea', required: true, wide: true,
            placeholder: 'Tempel kode, atau tulis konsep yang ingin dipahami.' },
          { id: 'level', label: 'Tingkat pemahamanmu', type: 'select',
            options: ['Baru belajar programming', 'Sudah bisa dasar', 'Menengah', 'Berpengalaman di bahasa lain', 'Ahli'],
            default: 'Menengah' },
          { id: 'why', label: 'Kenapa perlu paham ini', type: 'text', wide: true,
            placeholder: 'mis. mau memodifikasi bagian ini besok' },
          { id: 'opts', label: 'Cara menjelaskan', type: 'multi', wide: true,
            options: ['Analogi sehari-hari', 'Telusuri baris per baris', 'Gambarkan alur eksekusi',
              'Bandingkan dengan pendekatan lain', 'Sebutkan jebakan umum', 'Beri latihan kecil',
              'Tunjukkan versi paling sederhana dulu'],
            default: ['Analogi sehari-hari', 'Telusuri baris per baris', 'Sebutkan jebakan umum'] },
          { id: 'extra', label: 'Instruksi tambahan', type: 'textarea', wide: true }
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah mentor yang sabar dan tidak pernah merendahkan. Kamu menjelaskan sampai orang ' +
            'benar-benar paham, bukan sampai kamu selesai bicara.';
          b.context.push('Tingkat pemahaman penanya: ' + h.or(v.level, 'Menengah') + '.');
          h.push(b.context, v.why, 'Alasan perlu memahaminya: ' + v.why + '.');
          b.task.push('Jelaskan hal berikut:\n```\n' + h.or(v.subject, '[KODE ATAU KONSEP]') + '\n```');
          b.constraints.push('Sesuaikan kedalaman dengan tingkat pemahaman di atas. Jangan menyederhanakan sampai salah.');
          b.constraints.push('Setiap istilah teknis baru dijelaskan saat pertama kali muncul.');
          if (h.has(v.opts, 'Analogi sehari-hari')) b.constraints.push('Gunakan analogi dari kehidupan sehari-hari, lalu jelaskan di mana analogi itu tidak lagi berlaku.');
          h.push(b.constraints, v.extra, v.extra);
          if (h.has(v.opts, 'Tunjukkan versi paling sederhana dulu')) b.output.push('Mulai dari versi paling sederhana, baru tambahkan kerumitannya bertahap.');
          if (h.has(v.opts, 'Telusuri baris per baris')) b.output.push('Telusuri baris per baris untuk bagian yang penting.');
          if (h.has(v.opts, 'Gambarkan alur eksekusi')) b.output.push('Gambarkan urutan eksekusi, termasuk nilai variabel di tiap tahap.');
          if (h.has(v.opts, 'Bandingkan dengan pendekatan lain')) b.output.push('Bandingkan dengan cara lain menyelesaikan masalah yang sama.');
          if (h.has(v.opts, 'Sebutkan jebakan umum')) b.output.push('Sebutkan kesalahan yang sering terjadi pada konsep ini.');
          if (h.has(v.opts, 'Beri latihan kecil')) b.output.push('Tutup dengan satu latihan kecil beserta kunci jawabannya.');
          b.success.push('Penanya bisa menjelaskan ulang konsep ini dengan kata-katanya sendiri.');
          return b;
        }
      }

    ]
  });

})(window.PG);
