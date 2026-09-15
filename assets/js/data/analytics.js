/* ==========================================================================
   data/analytics.js — kategori "Data & Analisis"
   ========================================================================== */

(function (PG) {
  'use strict';
  var h = PG.h;

  function fExtra() {
    return { id: 'extra', label: 'Instruksi tambahan', type: 'textarea', wide: true };
  }
  function fSample() {
    return { id: 'sample', label: 'Contoh data', type: 'textarea', wide: true,
      placeholder: 'Tempel beberapa baris pertama termasuk judul kolom.',
      hint: 'Beberapa baris saja sudah sangat membantu ketepatan hasil.' };
  }

  PG.registerCategory({
    id: 'data',
    name: 'Data & Analisis',
    icon: '📊',
    desc: 'Rumus spreadsheet, pembersihan data, analisis, statistik, dan dashboard.',
    defaultFormat: 'structured',
    templates: [

      /* ------------------------------------------------------------------ */
      {
        id: 'formula',
        name: 'Rumus Excel / Google Sheets',
        desc: 'Membuat atau memperbaiki rumus spreadsheet.',
        tags: ['excel', 'spreadsheet', 'rumus', 'formula', 'sheets'],
        fields: [
          { id: 'goal', label: 'Yang ingin dihitung', type: 'textarea', required: true, wide: true,
            placeholder: 'mis. total penjualan per sales hanya untuk transaksi lunas bulan ini' },
          { id: 'app', label: 'Aplikasi', type: 'select',
            options: ['Microsoft Excel', 'Google Sheets', 'LibreOffice Calc', 'Keduanya (Excel & Sheets)'],
            default: 'Microsoft Excel' },
          { id: 'version', label: 'Versi / fitur yang tersedia', type: 'select',
            options: ['Versi lama (tanpa XLOOKUP / LAMBDA)', 'Microsoft 365 (fitur terbaru)', 'Tidak tahu — buat yang paling aman'],
            default: 'Tidak tahu — buat yang paling aman' },
          { id: 'layout', label: 'Susunan kolom', type: 'textarea', wide: true,
            placeholder: 'mis. A: tanggal, B: nama sales, C: status, D: nominal' },
          fSample(),
          { id: 'current', label: 'Rumus yang sekarang (bila ada)', type: 'textarea', wide: true,
            placeholder: 'Tempel rumus yang error atau hasilnya salah.' },
          { id: 'opts', label: 'Sertakan', type: 'multi', wide: true,
            options: ['Penjelasan bagian per bagian', 'Versi alternatif yang lebih sederhana', 'Cara menangani error',
              'Cara menangani sel kosong', 'Versi tabel pivot sebagai pembanding', 'Contoh hasil'],
            default: ['Penjelasan bagian per bagian', 'Cara menangani error', 'Cara menangani sel kosong'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah ahli spreadsheet yang menulis rumus agar bisa dipahami dan diperbaiki orang lain ' +
            'enam bulan kemudian.';
          b.context.push('Aplikasi: ' + h.or(v.app, 'Microsoft Excel') + '. Ketersediaan fitur: ' + h.or(v.version, 'tidak diketahui') + '.');
          h.push(b.context, v.layout, 'Susunan kolom: ' + v.layout);
          if (v.sample) b.context.push('Contoh data:\n```\n' + v.sample + '\n```');
          if (v.current) b.context.push('Rumus yang dipakai sekarang:\n```\n' + v.current + '\n```');

          b.task.push('Buat rumus untuk: ' + h.or(v.goal, '(isi kebutuhan)'));
          if (v.current) b.task.push('Jelaskan juga kenapa rumus yang sekarang tidak bekerja seperti yang diharapkan.');

          b.constraints.push('Gunakan hanya fungsi yang tersedia di aplikasi dan versi di atas.');
          b.constraints.push('Gunakan nama kolom dan huruf sel sesuai susunan yang diberikan. Bila belum diberikan, sebutkan asumsi letak kolomnya di awal.');
          b.constraints.push('Pisahkan argumen dengan koma; sebutkan bila pengaturan wilayah pengguna memerlukan titik koma.');
          if (h.has(v.opts, 'Cara menangani sel kosong')) b.constraints.push('Pastikan rumus tetap benar bila ada sel kosong, teks di kolom angka, atau spasi berlebih.');
          h.push(b.constraints, v.extra, v.extra);

          b.output.push('Rumus final dalam blok kode, siap disalin.');
          if (h.has(v.opts, 'Penjelasan bagian per bagian')) b.output.push('Penjelasan rumus bagian per bagian.');
          if (h.has(v.opts, 'Versi alternatif yang lebih sederhana')) b.output.push('Satu versi alternatif yang lebih sederhana atau lebih cepat, beserta perbandingannya.');
          if (h.has(v.opts, 'Cara menangani error')) b.output.push('Cara membungkus rumus agar error tampil rapi, beserta arti tiap jenis error.');
          if (h.has(v.opts, 'Versi tabel pivot sebagai pembanding')) b.output.push('Langkah membuat hasil yang sama memakai tabel pivot.');
          if (h.has(v.opts, 'Contoh hasil')) b.output.push('Contoh hasil perhitungan memakai data contoh di atas.');

          b.success.push('Rumus memberi angka yang benar bahkan ketika datanya belum rapi.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'clean',
        name: 'Bersihkan & Rapikan Data',
        desc: 'Menstandarkan data berantakan agar siap dianalisis.',
        tags: ['bersihkan', 'cleaning', 'rapikan', 'duplikat', 'standarisasi'],
        fields: [
          { id: 'problem', label: 'Masalah datanya', type: 'textarea', required: true, wide: true,
            placeholder: 'mis. nama kota ditulis berbeda-beda, tanggal campur format, banyak duplikat' },
          fSample(),
          { id: 'tool', label: 'Alat yang dipakai', type: 'select',
            options: ['Excel / Google Sheets', 'Python (pandas)', 'SQL', 'Power Query', 'R', 'Belum tahu — sarankan'],
            default: 'Excel / Google Sheets' },
          { id: 'size', label: 'Ukuran data', type: 'select',
            options: ['Di bawah 1.000 baris', '1.000 - 50.000 baris', '50.000 - 1 juta baris', 'Lebih dari 1 juta baris'],
            default: '1.000 - 50.000 baris' },
          { id: 'target', label: 'Bentuk akhir yang diinginkan', type: 'textarea', wide: true,
            placeholder: 'mis. satu baris per transaksi, tanggal format YYYY-MM-DD, kota sesuai daftar baku' },
          { id: 'rules', label: 'Aturan khusus', type: 'textarea', wide: true,
            placeholder: 'mis. bila duplikat, ambil yang tanggalnya paling baru' },
          { id: 'opts', label: 'Sertakan', type: 'multi', wide: true,
            options: ['Langkah berurutan', 'Kode siap jalan', 'Cara memeriksa hasil', 'Data yang perlu dicek manual',
              'Cara mencegah masalah ini berulang', 'Catatan baris yang dibuang'],
            default: ['Langkah berurutan', 'Kode siap jalan', 'Cara memeriksa hasil', 'Data yang perlu dicek manual'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah data engineer yang paranoid terhadap data hilang diam-diam. Setiap transformasi ' +
            'yang kamu buat bisa diperiksa hasilnya.';
          b.context.push('Alat: ' + h.or(v.tool, 'Excel / Google Sheets') + '. Ukuran data: ' + h.or(v.size, '1.000 - 50.000 baris') + '.');
          if (v.sample) b.context.push('Contoh data:\n```\n' + v.sample + '\n```');
          h.push(b.context, v.target, 'Bentuk akhir yang diinginkan: ' + v.target);
          h.push(b.context, v.rules, 'Aturan khusus: ' + v.rules);

          b.task.push('Rancang proses pembersihan untuk masalah: ' + h.or(v.problem, '(isi masalah)'));

          b.constraints.push('Jangan menghapus baris tanpa mencatat berapa banyak dan kenapa.');
          b.constraints.push('Setiap langkah harus bisa diulang dari data mentah; jangan menyarankan perubahan manual yang tidak terekam.');
          b.constraints.push('Jangan menebak isi data yang tidak terlihat di contoh. Bila perlu asumsi, sebutkan dan tandai.');
          b.constraints.push('Perhatikan jebakan umum: angka yang tersimpan sebagai teks, nol di depan yang hilang, format tanggal dan zona waktu, spasi tak terlihat.');
          h.push(b.constraints, v.extra, v.extra);

          if (h.has(v.opts, 'Langkah berurutan')) b.output.push('Langkah berurutan dari data mentah sampai data siap pakai.');
          if (h.has(v.opts, 'Kode siap jalan')) b.output.push('Kode atau rumus siap jalan untuk tiap langkah.');
          if (h.has(v.opts, 'Cara memeriksa hasil')) b.output.push('Cara memeriksa hasil tiap langkah: jumlah baris sebelum dan sesudah, nilai unik, total angka.');
          if (h.has(v.opts, 'Data yang perlu dicek manual')) b.output.push('Daftar kasus yang tidak bisa diputuskan otomatis dan perlu dicek manusia.');
          if (h.has(v.opts, 'Catatan baris yang dibuang')) b.output.push('Cara menyimpan catatan baris yang dibuang beserta alasannya.');
          if (h.has(v.opts, 'Cara mencegah masalah ini berulang')) b.output.push('Saran perbaikan di hulu agar data masuk sudah lebih bersih.');

          b.success.push('Jumlah baris dan total angka sebelum dan sesudah bisa dijelaskan selisihnya.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'analyze',
        name: 'Analisis & Interpretasi Data',
        desc: 'Menarik kesimpulan yang jujur dari angka yang ada.',
        tags: ['analisis', 'interpretasi', 'insight', 'laporan', 'tren'],
        fields: [
          { id: 'question', label: 'Pertanyaan yang ingin dijawab', type: 'textarea', required: true, wide: true,
            placeholder: 'mis. kenapa penjualan turun 18% di kuartal ini padahal iklan naik' },
          { id: 'dataset', label: 'Data yang tersedia', type: 'textarea', wide: true,
            placeholder: 'Kolom apa saja, periode berapa, dari sistem mana.' },
          fSample(),
          { id: 'audience', label: 'Untuk siapa hasilnya', type: 'select',
            options: ['Diri sendiri', 'Atasan / direksi', 'Tim operasional', 'Klien', 'Publik / laporan terbuka'],
            default: 'Atasan / direksi' },
          { id: 'depth', label: 'Kedalaman', type: 'select',
            options: ['Ringkasan cepat', 'Analisis sedang', 'Analisis mendalam'], default: 'Analisis sedang' },
          { id: 'opts', label: 'Sertakan', type: 'multi', wide: true,
            options: ['Temuan utama di awal', 'Angka pendukung tiap temuan', 'Kemungkinan penyebab',
              'Penjelasan tandingan', 'Batasan data', 'Rekomendasi tindakan', 'Analisis lanjutan yang disarankan',
              'Peringatan korelasi vs sebab-akibat'],
            default: ['Temuan utama di awal', 'Angka pendukung tiap temuan', 'Kemungkinan penyebab', 'Batasan data', 'Rekomendasi tindakan', 'Peringatan korelasi vs sebab-akibat'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah analis data yang lebih takut memberi kesimpulan salah daripada terlihat tidak tahu. ' +
            'Kamu selalu menyebutkan batas dari data yang kamu pegang.';
          b.context.push('Pembaca hasil: ' + h.or(v.audience, 'Atasan / direksi') + '. Kedalaman: ' + h.or(v.depth, 'Analisis sedang') + '.');
          h.push(b.context, v.dataset, 'Data yang tersedia: ' + v.dataset);
          if (v.sample) b.context.push('Contoh data:\n```\n' + v.sample + '\n```');

          b.task.push('Jawab pertanyaan analitis: ' + h.or(v.question, '(isi pertanyaan)'));
          b.task.push('Bila data yang ada belum cukup untuk menjawab, katakan itu lebih dulu dan sebutkan data apa yang kurang.');

          b.constraints.push('Jangan mengarang angka. Hanya gunakan angka yang benar-benar ada di data yang diberikan.');
          b.constraints.push('Bedakan dengan tegas antara yang terlihat di data, yang mungkin menjelaskannya, dan yang hanya dugaan.');
          if (h.has(v.opts, 'Peringatan korelasi vs sebab-akibat')) b.constraints.push('Jangan menyimpulkan sebab-akibat dari data yang hanya menunjukkan hubungan. Sebutkan secara eksplisit bila ini terjadi.');
          b.constraints.push('Waspadai jebakan: perubahan musiman, ukuran sampel kecil, perubahan definisi metrik, data yang belum lengkap di periode terakhir.');
          b.constraints.push('Sampaikan dalam bahasa yang dimengerti pembaca di atas, bukan istilah statistik yang tidak dijelaskan.');
          h.push(b.constraints, v.extra, v.extra);

          if (h.has(v.opts, 'Temuan utama di awal')) b.output.push('Mulai dengan 3 temuan utama, masing-masing satu kalimat.');
          if (h.has(v.opts, 'Angka pendukung tiap temuan')) b.output.push('Setiap temuan disertai angka pendukung dan periode datanya.');
          if (h.has(v.opts, 'Kemungkinan penyebab')) b.output.push('Kemungkinan penyebab diurutkan dari yang paling mungkin, beserta cara mengujinya.');
          if (h.has(v.opts, 'Penjelasan tandingan')) b.output.push('Penjelasan tandingan yang bisa membatalkan kesimpulan utama.');
          if (h.has(v.opts, 'Batasan data')) b.output.push('Batasan data secara terbuka: apa yang tidak bisa dijawab dengan data ini.');
          if (h.has(v.opts, 'Rekomendasi tindakan')) b.output.push('Rekomendasi tindakan yang bisa dijalankan minggu ini.');
          if (h.has(v.opts, 'Analisis lanjutan yang disarankan')) b.output.push('Analisis lanjutan yang sebaiknya dilakukan berikutnya.');

          b.success.push('Pembaca tahu apa yang terjadi, seberapa yakin kita, dan apa yang harus dilakukan.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'dashboard',
        name: 'Rancang Dashboard & Laporan',
        desc: 'Menentukan metrik dan tata letak laporan yang benar-benar dipakai.',
        tags: ['dashboard', 'laporan', 'kpi', 'metrik', 'monitoring'],
        fields: [
          { id: 'purpose', label: 'Keputusan yang didukung', type: 'textarea', required: true, wide: true,
            placeholder: 'mis. manajer cabang memutuskan stok apa yang perlu ditambah minggu depan' },
          { id: 'user', label: 'Siapa yang melihat', type: 'text', wide: true,
            placeholder: 'Jabatan, seberapa sering melihat, seberapa paham angka.' },
          { id: 'source', label: 'Sumber data', type: 'textarea', wide: true,
            placeholder: 'Sistem apa saja, seberapa sering diperbarui.' },
          { id: 'tool', label: 'Alat', type: 'select',
            options: ['Google Sheets / Excel', 'Looker Studio', 'Power BI', 'Tableau', 'Metabase', 'Dibuat sendiri (kode)', 'Belum ditentukan'],
            default: 'Google Sheets / Excel' },
          { id: 'freq', label: 'Frekuensi pemakaian', type: 'select',
            options: ['Realtime', 'Harian', 'Mingguan', 'Bulanan', 'Sesekali saat dibutuhkan'], default: 'Mingguan' },
          { id: 'opts', label: 'Sertakan', type: 'multi', wide: true,
            options: ['Daftar metrik beserta definisinya', 'Tata letak per bagian layar', 'Jenis grafik per metrik',
              'Ambang batas peringatan', 'Filter yang perlu disediakan', 'Metrik yang sengaja tidak dipakai',
              'Cara memeriksa kebenaran angka'],
            default: ['Daftar metrik beserta definisinya', 'Tata letak per bagian layar', 'Jenis grafik per metrik', 'Metrik yang sengaja tidak dipakai'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah perancang dashboard yang memulai dari keputusan yang harus diambil, bukan dari ' +
            'data yang kebetulan tersedia.';
          h.push(b.context, v.user, 'Pengguna dashboard: ' + v.user);
          h.push(b.context, v.source, 'Sumber data: ' + v.source);
          b.context.push('Alat: ' + h.or(v.tool, 'Google Sheets / Excel') + '. Frekuensi dilihat: ' + h.or(v.freq, 'Mingguan') + '.');

          b.task.push('Rancang dashboard yang mendukung keputusan: ' + h.or(v.purpose, '(isi keputusan)'));

          b.constraints.push('Setiap metrik harus terhubung langsung ke keputusan di atas. Buang metrik yang hanya enak dilihat.');
          b.constraints.push('Maksimal 7 metrik utama di layar pertama. Sisanya masuk halaman detail.');
          b.constraints.push('Setiap metrik wajib punya definisi yang tidak bisa ditafsirkan ganda, termasuk apa yang dihitung dan apa yang dikecualikan.');
          b.constraints.push('Jangan mengarang nama tabel atau kolom yang tidak disebutkan.');
          h.push(b.constraints, v.extra, v.extra);

          if (h.has(v.opts, 'Daftar metrik beserta definisinya')) b.output.push('Tabel metrik: nama, definisi, rumus, sumber, frekuensi perbarui.');
          if (h.has(v.opts, 'Tata letak per bagian layar')) b.output.push('Tata letak dijelaskan per bagian layar, dari kiri atas ke bawah, beserta alasan urutannya.');
          if (h.has(v.opts, 'Jenis grafik per metrik')) b.output.push('Jenis grafik yang dipakai tiap metrik beserta alasannya.');
          if (h.has(v.opts, 'Ambang batas peringatan')) b.output.push('Ambang batas yang memicu perhatian, beserta apa yang harus dilakukan saat terlampaui.');
          if (h.has(v.opts, 'Filter yang perlu disediakan')) b.output.push('Filter yang perlu disediakan dan nilai bawaannya.');
          if (h.has(v.opts, 'Metrik yang sengaja tidak dipakai')) b.output.push('Daftar metrik yang sengaja tidak dipakai beserta alasannya.');
          if (h.has(v.opts, 'Cara memeriksa kebenaran angka')) b.output.push('Cara memeriksa kebenaran angka terhadap sumber aslinya.');

          b.success.push('Pengguna bisa mengambil keputusan dalam 30 detik melihat layar pertama.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'stats',
        name: 'Uji Statistik & Metodologi',
        desc: 'Memilih metode yang tepat dan membaca hasilnya dengan benar.',
        tags: ['statistik', 'uji', 'hipotesis', 'sampel', 'metodologi', 'penelitian'],
        fields: [
          { id: 'question', label: 'Pertanyaan penelitian', type: 'textarea', required: true, wide: true,
            placeholder: 'mis. apakah tampilan halaman baru benar-benar menaikkan pendaftaran' },
          { id: 'design', label: 'Bentuk data / rancangan', type: 'textarea', wide: true,
            placeholder: 'Kelompok apa saja, berapa jumlahnya, diukur berapa kali, jenis variabelnya.' },
          { id: 'task', label: 'Yang dibutuhkan', type: 'select',
            options: ['Pilih uji yang tepat', 'Tafsirkan hasil yang sudah ada', 'Rancang percobaan / A-B test',
              'Hitung ukuran sampel', 'Periksa apakah metodenya sudah benar'], default: 'Pilih uji yang tepat' },
          { id: 'result', label: 'Hasil yang sudah ada', type: 'textarea', wide: true,
            placeholder: 'Tempel angka hasil uji bila sudah ada: p-value, rata-rata, ukuran sampel.' },
          { id: 'level', label: 'Tingkat pemahaman statistik', type: 'select',
            options: ['Awam', 'Pernah belajar dasar', 'Terbiasa', 'Ahli'], default: 'Pernah belajar dasar' },
          { id: 'opts', label: 'Sertakan', type: 'multi', wide: true,
            options: ['Alasan memilih metode', 'Asumsi yang harus dipenuhi', 'Cara memeriksa asumsi',
              'Metode alternatif bila asumsi gagal', 'Arti hasil dalam bahasa awam', 'Ukuran efek, bukan hanya signifikansi',
              'Kesalahan penafsiran yang sering terjadi'],
            default: ['Alasan memilih metode', 'Asumsi yang harus dipenuhi', 'Arti hasil dalam bahasa awam', 'Ukuran efek, bukan hanya signifikansi', 'Kesalahan penafsiran yang sering terjadi'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah ahli statistik terapan yang lebih peduli pada kebenaran kesimpulan daripada ' +
            'pada kerumitan metode.';
          b.context.push('Tingkat pemahaman statistik penanya: ' + h.or(v.level, 'Pernah belajar dasar') + '.');
          h.push(b.context, v.design, 'Rancangan dan bentuk data: ' + v.design);
          if (v.result) b.context.push('Hasil yang sudah ada:\n```\n' + v.result + '\n```');

          b.task.push(h.or(v.task, 'Pilih uji yang tepat') + ' untuk pertanyaan: ' + h.or(v.question, '(isi pertanyaan)'));

          b.constraints.push('Jangan menjalankan perhitungan yang datanya tidak tersedia; jelaskan caranya, jangan mengarang hasilnya.');
          b.constraints.push('Jelaskan arti hasil dalam bahasa yang dipahami sesuai tingkat pemahaman di atas.');
          b.constraints.push('Jangan menyamakan "tidak signifikan" dengan "tidak ada pengaruh", dan jangan menyamakan "signifikan" dengan "penting".');
          b.constraints.push('Sebutkan bila ukuran sampelnya terlalu kecil untuk menyimpulkan apa pun.');
          h.push(b.constraints, v.extra, v.extra);

          if (h.has(v.opts, 'Alasan memilih metode')) b.output.push('Metode yang dipilih beserta alasannya, dan metode apa yang dipertimbangkan tapi tidak dipakai.');
          if (h.has(v.opts, 'Asumsi yang harus dipenuhi')) b.output.push('Asumsi yang harus dipenuhi metode tersebut.');
          if (h.has(v.opts, 'Cara memeriksa asumsi')) b.output.push('Cara memeriksa tiap asumsi secara praktis.');
          if (h.has(v.opts, 'Metode alternatif bila asumsi gagal')) b.output.push('Metode alternatif bila asumsi tidak terpenuhi.');
          if (h.has(v.opts, 'Ukuran efek, bukan hanya signifikansi')) b.output.push('Ukuran efek beserta selang kepercayaan, bukan hanya nilai p.');
          if (h.has(v.opts, 'Arti hasil dalam bahasa awam')) b.output.push('Satu paragraf arti hasil dalam bahasa sehari-hari.');
          if (h.has(v.opts, 'Kesalahan penafsiran yang sering terjadi')) b.output.push('Kesalahan penafsiran yang sering terjadi pada jenis analisis ini.');

          b.success.push('Kesimpulannya tetap benar meski dibaca orang yang tidak paham statistik.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'viz',
        name: 'Pilih & Rancang Visualisasi',
        desc: 'Menentukan grafik yang jujur dan mudah dibaca.',
        tags: ['grafik', 'visualisasi', 'chart', 'diagram', 'infografis'],
        fields: [
          { id: 'message', label: 'Pesan yang ingin disampaikan', type: 'textarea', required: true, wide: true,
            placeholder: 'mis. penjualan tumbuh merata di semua wilayah kecuali Sumatera' },
          { id: 'data', label: 'Bentuk datanya', type: 'textarea', wide: true,
            placeholder: 'Berapa kategori, berapa periode, jenis angkanya apa.' },
          fSample(),
          { id: 'medium', label: 'Akan ditampilkan di', type: 'select',
            options: ['Slide presentasi', 'Laporan cetak', 'Dashboard layar', 'Media sosial', 'Dokumen web'],
            default: 'Slide presentasi' },
          { id: 'audience', label: 'Penonton', type: 'text', wide: true },
          { id: 'opts', label: 'Sertakan', type: 'multi', wide: true,
            options: ['Rekomendasi jenis grafik beserta alasan', 'Jenis grafik yang harus dihindari', 'Saran judul grafik',
              'Aturan warna & aksesibilitas', 'Cara menandai bagian penting', 'Kode contoh untuk membuatnya',
              'Cara menghindari grafik yang menyesatkan'],
            default: ['Rekomendasi jenis grafik beserta alasan', 'Jenis grafik yang harus dihindari', 'Saran judul grafik', 'Cara menghindari grafik yang menyesatkan'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah perancang visualisasi data yang memegang satu aturan: grafik yang baik membuat ' +
            'pesannya terlihat tanpa perlu dijelaskan.';
          b.context.push('Media tampil: ' + h.or(v.medium, 'Slide presentasi') + '.');
          h.push(b.context, v.audience, 'Penonton: ' + v.audience + '.');
          h.push(b.context, v.data, 'Bentuk data: ' + v.data);
          if (v.sample) b.context.push('Contoh data:\n```\n' + v.sample + '\n```');

          b.task.push('Rancang visualisasi untuk menyampaikan pesan: ' + h.or(v.message, '(isi pesan)'));

          b.constraints.push('Pilih grafik berdasarkan bentuk data dan pesan, bukan berdasarkan yang paling menarik dipandang.');
          b.constraints.push('Sumbu nilai dimulai dari nol untuk grafik batang. Bila dipotong, harus ditandai jelas.');
          b.constraints.push('Jangan memakai grafik tiga dimensi, efek bayangan, atau hiasan yang tidak membawa informasi.');
          b.constraints.push('Jangan mengarang angka di contoh; gunakan data yang diberikan atau tandai sebagai ilustrasi.');
          h.push(b.constraints, v.extra, v.extra);

          if (h.has(v.opts, 'Rekomendasi jenis grafik beserta alasan')) b.output.push('Rekomendasi utama beserta satu alternatif, lengkap dengan alasannya.');
          if (h.has(v.opts, 'Jenis grafik yang harus dihindari')) b.output.push('Jenis grafik yang harus dihindari untuk data ini beserta alasannya.');
          if (h.has(v.opts, 'Saran judul grafik')) b.output.push('Saran judul grafik yang langsung menyatakan kesimpulan, bukan sekadar menyebut isinya.');
          if (h.has(v.opts, 'Aturan warna & aksesibilitas')) b.output.push('Panduan warna, termasuk keterbacaan bagi yang buta warna.');
          if (h.has(v.opts, 'Cara menandai bagian penting')) b.output.push('Cara menonjolkan bagian penting dan meredam sisanya.');
          if (h.has(v.opts, 'Kode contoh untuk membuatnya')) b.output.push('Kode contoh untuk membuat grafiknya.');
          if (h.has(v.opts, 'Cara menghindari grafik yang menyesatkan')) b.output.push('Daftar cara grafik ini bisa menyesatkan dan cara mencegahnya.');

          b.success.push('Penonton menangkap pesan utamanya dalam lima detik.');
          return b;
        }
      }

    ]
  });

})(window.PG);
