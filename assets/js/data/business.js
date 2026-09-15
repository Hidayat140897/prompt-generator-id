/* ==========================================================================
   data/business.js — kategori "Bisnis & Marketing"
   ========================================================================== */

(function (PG) {
  'use strict';
  var h = PG.h;

  function fExtra() {
    return { id: 'extra', label: 'Instruksi tambahan', type: 'textarea', wide: true,
      placeholder: 'Hal khusus yang wajib ada atau wajib dihindari.' };
  }

  PG.registerCategory({
    id: 'business',
    name: 'Bisnis & Marketing',
    icon: '📈',
    desc: 'Proposal, pitch, SOP, analisis kompetitor, harga, dan komunikasi pelanggan.',
    defaultFormat: 'structured',
    templates: [

      /* ------------------------------------------------------------------ */
      {
        id: 'proposal',
        name: 'Proposal & Penawaran',
        desc: 'Proposal proyek, penawaran harga, dan dokumen kerja sama.',
        tags: ['proposal', 'penawaran', 'quotation', 'kerjasama', 'tender'],
        fields: [
          { id: 'offer', label: 'Yang ditawarkan', type: 'textarea', required: true, wide: true,
            placeholder: 'mis. jasa pembuatan sistem kasir untuk jaringan 12 outlet' },
          { id: 'client', label: 'Calon klien', type: 'textarea', wide: true,
            placeholder: 'Nama, bidang usaha, dan apa yang kamu tahu tentang situasi mereka.' },
          { id: 'problem', label: 'Masalah yang dipecahkan', type: 'textarea', wide: true,
            placeholder: 'Kerugian atau kerepotan yang mereka alami sekarang.' },
          { id: 'kind', label: 'Jenis dokumen', type: 'select',
            options: ['Proposal proyek', 'Penawaran harga sederhana', 'Proposal tender', 'Proposal kerja sama / kemitraan',
              'Proposal sponsorship', 'Company profile ringkas'], default: 'Proposal proyek' },
          { id: 'budget', label: 'Kisaran nilai & skema harga', type: 'text', wide: true,
            placeholder: 'mis. 85-120 juta, termin 40-40-20' },
          { id: 'timeline', label: 'Estimasi waktu kerja', type: 'text', wide: true,
            placeholder: 'mis. 10 minggu, mulai Oktober' },
          { id: 'edge', label: 'Keunggulan & bukti', type: 'tags', wide: true,
            placeholder: 'pengalaman 8 tahun, 40 klien ritel, garansi 6 bulan' },
          { id: 'tone', label: 'Nada', type: 'select',
            options: ['Formal korporat', 'Profesional hangat', 'Lugas dan ringkas', 'Konsultatif'], default: 'Profesional hangat' },
          { id: 'sections', label: 'Bagian yang disertakan', type: 'multi', wide: true,
            options: ['Ringkasan eksekutif', 'Latar belakang masalah', 'Ruang lingkup pekerjaan', 'Metodologi / tahapan',
              'Jadwal & milestone', 'Rincian biaya', 'Tim & peran', 'Portofolio serupa', 'Syarat & ketentuan',
              'Di luar lingkup (out of scope)', 'Langkah selanjutnya'],
            default: ['Ringkasan eksekutif', 'Ruang lingkup pekerjaan', 'Jadwal & milestone', 'Rincian biaya', 'Di luar lingkup (out of scope)', 'Langkah selanjutnya'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah konsultan bisnis yang menulis proposal yang dibaca sampai habis: ' +
            'fokus pada masalah klien, bukan pada kehebatan diri sendiri.';
          h.push(b.context, v.client, 'Calon klien: ' + v.client);
          h.push(b.context, v.problem, 'Masalah yang mereka hadapi: ' + v.problem);
          h.push(b.context, v.budget, 'Kisaran nilai dan skema pembayaran: ' + v.budget + '.');
          h.push(b.context, v.timeline, 'Estimasi waktu kerja: ' + v.timeline + '.');
          var edge = h.split(v.edge);
          if (edge.length) b.context.push('Keunggulan yang boleh diklaim: ' + edge.join(', ') + '.');

          b.task.push('Tulis ' + h.or(v.kind, 'proposal proyek').toLowerCase() + ' untuk: ' + h.or(v.offer, '(isi penawaran)'));
          b.task.push('Bingkai penawaran sebagai jawaban atas masalah klien, bukan sebagai daftar layanan.');

          b.constraints.push('Nada: ' + h.or(v.tone, 'Profesional hangat') + '.');
          b.constraints.push('Halaman pertama harus sudah menjawab: masalahnya apa, solusinya apa, berapa biayanya, berapa lama.');
          b.constraints.push('Jangan mengarang angka, sertifikasi, nama klien, atau testimoni. Tandai [ISI DATA] untuk yang belum ada.');
          b.constraints.push('Hindari kalimat kosong seperti "kami berkomitmen memberikan yang terbaik".');
          h.push(b.constraints, v.extra, v.extra);

          b.output.push('Format Markdown dengan heading per bagian.');
          var sec = Array.isArray(v.sections) ? v.sections : [];
          if (sec.length) b.output.push('Sertakan bagian: ' + sec.join(', ') + '.');
          if (h.has(v.sections, 'Rincian biaya')) b.output.push('Rincian biaya berbentuk tabel: item, volume, harga satuan, subtotal.');
          if (h.has(v.sections, 'Jadwal & milestone')) b.output.push('Jadwal berbentuk tabel: tahap, keluaran, durasi, penanggung jawab.');
          if (h.has(v.sections, 'Di luar lingkup (out of scope)')) b.output.push('Sebutkan secara eksplisit apa yang TIDAK termasuk, agar tidak jadi sengketa.');

          b.success.push('Klien bisa memutuskan lanjut atau tidak tanpa perlu rapat penjelasan tambahan.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'pitch',
        name: 'Pitch Deck & Investor',
        desc: 'Materi presentasi untuk investor, juri, atau manajemen.',
        tags: ['pitch', 'deck', 'investor', 'startup', 'presentasi', 'funding'],
        fields: [
          { id: 'venture', label: 'Usaha / produk', type: 'textarea', required: true, wide: true,
            placeholder: 'Apa yang dibangun, untuk siapa, dan kenapa sekarang waktunya.' },
          { id: 'audience', label: 'Siapa yang dipresentasikan', type: 'select',
            options: ['Investor angel', 'Venture capital', 'Juri kompetisi', 'Manajemen internal', 'Calon mitra strategis', 'Lembaga hibah'],
            default: 'Investor angel' },
          { id: 'stage', label: 'Tahap usaha', type: 'select',
            options: ['Ide / pra-produk', 'MVP / prototipe', 'Sudah ada pengguna', 'Sudah ada pendapatan', 'Sedang bertumbuh cepat'],
            default: 'MVP / prototipe' },
          { id: 'traction', label: 'Traksi & angka yang dimiliki', type: 'textarea', wide: true,
            placeholder: 'Pengguna, pendapatan, pertumbuhan, kemitraan. Tulis apa adanya.' },
          { id: 'ask', label: 'Yang diminta', type: 'text', wide: true,
            placeholder: 'mis. pendanaan 2 miliar untuk 18 bulan runway' },
          { id: 'slides', label: 'Jumlah slide', type: 'range', min: 5, max: 20, default: 12 },
          { id: 'opts', label: 'Sertakan', type: 'multi', wide: true,
            options: ['Naskah bicara per slide', 'Saran visual per slide', 'Antisipasi pertanyaan sulit',
              'Versi elevator pitch 60 detik', 'Catatan durasi per slide', 'Slide appendix cadangan'],
            default: ['Naskah bicara per slide', 'Antisipasi pertanyaan sulit', 'Versi elevator pitch 60 detik'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah penasihat pitch yang pernah duduk di kedua sisi meja. Kamu tahu investor ' +
            'memutuskan dalam tiga slide pertama, dan kamu benci angka yang tidak bisa dipertanggungjawabkan.';
          b.context.push('Audiens: ' + h.or(v.audience, 'Investor angel') + '. Tahap usaha: ' + h.or(v.stage, 'MVP / prototipe') + '.');
          h.push(b.context, v.traction, 'Traksi yang dimiliki: ' + v.traction);
          h.push(b.context, v.ask, 'Yang diminta: ' + v.ask + '.');

          b.task.push('Susun pitch deck ' + h.or(v.slides, 12) + ' slide untuk: ' + h.or(v.venture, '(isi usaha)'));
          b.task.push('Urutkan slide sebagai satu argumen yang mengalir, bukan sebagai daftar topik.');

          b.constraints.push('Satu slide, satu pesan. Maksimal 30 kata teks per slide.');
          b.constraints.push('Hanya gunakan angka yang diberikan di atas. Jangan mengarang proyeksi, ukuran pasar, atau nama klien.');
          b.constraints.push('Jika sebuah slide standar tidak bisa diisi karena datanya belum ada, tulis [BELUM ADA DATA] dan sebutkan data apa yang perlu disiapkan.');
          b.constraints.push('Hindari klaim "tidak punya kompetitor" dan proyeksi hoki seperti "cukup rebut 1% pasar".');
          h.push(b.constraints, v.extra, v.extra);

          b.output.push('Untuk tiap slide: nomor, judul slide, isi poin, dan pesan utama satu kalimat.');
          if (h.has(v.opts, 'Naskah bicara per slide')) b.output.push('Sertakan naskah bicara singkat untuk tiap slide.');
          if (h.has(v.opts, 'Saran visual per slide')) b.output.push('Sertakan saran visual atau grafik untuk tiap slide.');
          if (h.has(v.opts, 'Catatan durasi per slide')) b.output.push('Cantumkan target durasi bicara per slide.');
          if (h.has(v.opts, 'Antisipasi pertanyaan sulit')) b.output.push('Tutup dengan 8 pertanyaan tersulit yang mungkin diajukan beserta kerangka jawabannya.');
          if (h.has(v.opts, 'Versi elevator pitch 60 detik')) b.output.push('Sertakan versi elevator pitch 60 detik di bagian akhir.');
          if (h.has(v.opts, 'Slide appendix cadangan')) b.output.push('Usulkan slide appendix yang perlu disiapkan untuk sesi tanya jawab.');

          b.success.push('Pendengar bisa menjelaskan ulang usahanya ke orang lain dengan benar setelah sekali menonton.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'sop',
        name: 'SOP & Prosedur Kerja',
        desc: 'Prosedur baku yang bisa diikuti orang baru tanpa bertanya.',
        tags: ['sop', 'prosedur', 'panduan', 'operasional', 'checklist'],
        fields: [
          { id: 'process', label: 'Proses yang dibakukan', type: 'textarea', required: true, wide: true,
            placeholder: 'mis. penanganan retur barang dari pelanggan marketplace' },
          { id: 'who', label: 'Siapa yang menjalankan', type: 'text', wide: true,
            placeholder: 'mis. staf gudang shift pagi, baru bekerja 1-2 minggu' },
          { id: 'trigger', label: 'Kapan prosedur ini dipakai', type: 'text', wide: true,
            placeholder: 'Pemicu yang membuat prosedur dimulai.' },
          { id: 'tools', label: 'Sistem & alat yang dipakai', type: 'tags', wide: true,
            placeholder: 'aplikasi gudang, WhatsApp grup, formulir retur' },
          { id: 'rules', label: 'Aturan & batasan wajib', type: 'textarea', wide: true,
            placeholder: 'Batas waktu, batas wewenang, aturan perusahaan atau regulasi.' },
          { id: 'risks', label: 'Kesalahan yang sering terjadi', type: 'textarea', wide: true },
          { id: 'opts', label: 'Sertakan', type: 'multi', wide: true,
            options: ['Diagram alur (Mermaid)', 'Tabel RACI', 'Checklist siap cetak', 'Penanganan kasus khusus',
              'Eskalasi bila macet', 'Indikator keberhasilan', 'Formulir / template terkait', 'Riwayat revisi'],
            default: ['Diagram alur (Mermaid)', 'Checklist siap cetak', 'Penanganan kasus khusus', 'Eskalasi bila macet'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah penulis prosedur operasional yang menulis untuk orang yang sedang sibuk ' +
            'dan baru seminggu bekerja.';
          h.push(b.context, v.who, 'Pelaksana: ' + v.who + '.');
          h.push(b.context, v.trigger, 'Pemicu prosedur: ' + v.trigger);
          var tools = h.split(v.tools);
          if (tools.length) b.context.push('Sistem dan alat yang tersedia: ' + tools.join(', ') + '.');
          h.push(b.context, v.rules, 'Aturan wajib: ' + v.rules);
          h.push(b.context, v.risks, 'Kesalahan yang sering terjadi: ' + v.risks);

          b.task.push('Susun SOP untuk proses: ' + h.or(v.process, '(isi proses)'));
          b.task.push('Pecah menjadi langkah bernomor yang masing-masing berisi satu tindakan yang bisa langsung dikerjakan.');

          b.constraints.push('Setiap langkah dimulai dengan kata kerja dan menyebut siapa pelakunya.');
          b.constraints.push('Hindari kata kabur seperti "segera", "sesuai kebutuhan", "koordinasikan". Ganti dengan batas waktu dan nama peran yang jelas.');
          b.constraints.push('Jangan mengarang nama sistem, nomor formulir, atau kebijakan. Tandai [SESUAIKAN] bila perlu.');
          h.push(b.constraints, v.extra, v.extra);

          b.output.push('Format Markdown: Tujuan, Ruang lingkup, Definisi, Langkah, lalu lampiran.');
          if (h.has(v.opts, 'Diagram alur (Mermaid)')) b.output.push('Sertakan diagram alur dalam sintaks Mermaid.');
          if (h.has(v.opts, 'Tabel RACI')) b.output.push('Sertakan tabel RACI: siapa yang mengerjakan, menyetujui, dikonsultasi, dan diberi tahu.');
          if (h.has(v.opts, 'Checklist siap cetak')) b.output.push('Sertakan versi checklist ringkas yang bisa dicetak dan ditempel.');
          if (h.has(v.opts, 'Penanganan kasus khusus')) b.output.push('Sertakan bagian kasus khusus beserta cara menanganinya.');
          if (h.has(v.opts, 'Eskalasi bila macet')) b.output.push('Sertakan jalur eskalasi: kapan naik ke atasan, ke siapa, dan dalam berapa lama.');
          if (h.has(v.opts, 'Indikator keberhasilan')) b.output.push('Sertakan indikator keberhasilan yang bisa diukur.');
          if (h.has(v.opts, 'Formulir / template terkait')) b.output.push('Sebutkan formulir atau template yang perlu disiapkan.');
          if (h.has(v.opts, 'Riwayat revisi')) b.output.push('Sertakan tabel riwayat revisi di bagian akhir.');

          b.success.push('Pegawai baru bisa menjalankan prosedur ini tanpa bertanya kepada siapa pun.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'competitor',
        name: 'Analisis Kompetitor & Pasar',
        desc: 'Memetakan pesaing dan mencari celah yang bisa diambil.',
        tags: ['kompetitor', 'pasar', 'riset', 'positioning', 'strategi'],
        fields: [
          { id: 'business', label: 'Usaha kita', type: 'textarea', required: true, wide: true,
            placeholder: 'Apa yang dijual, ke siapa, dan posisi saat ini.' },
          { id: 'rivals', label: 'Pesaing yang diketahui', type: 'tags', wide: true,
            placeholder: 'kosongkan bila ingin dibantu mengidentifikasi jenis pesaingnya' },
          { id: 'market', label: 'Pasar & wilayah', type: 'text', wide: true,
            placeholder: 'mis. kuliner cepat saji di Bandung' },
          { id: 'criteria', label: 'Dimensi perbandingan', type: 'multi', wide: true,
            options: ['Harga', 'Kualitas produk', 'Jangkauan distribusi', 'Kekuatan merek', 'Layanan pelanggan',
              'Kecepatan', 'Teknologi', 'Variasi pilihan', 'Program loyalitas', 'Kehadiran digital'],
            default: ['Harga', 'Kualitas produk', 'Kekuatan merek', 'Kehadiran digital'] },
          { id: 'goal', label: 'Keputusan yang akan diambil', type: 'text', wide: true,
            placeholder: 'mis. menentukan posisi harga untuk lini produk baru' },
          { id: 'opts', label: 'Sertakan', type: 'multi', wide: true,
            options: ['Tabel perbandingan', 'Peta posisi (positioning map)', 'Celah pasar yang belum digarap',
              'Ancaman yang perlu diwaspadai', 'Rekomendasi diferensiasi', 'Data yang perlu dikumpulkan'],
            default: ['Tabel perbandingan', 'Celah pasar yang belum digarap', 'Rekomendasi diferensiasi', 'Data yang perlu dikumpulkan'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah analis strategi pasar yang berhati-hati: kamu memisahkan apa yang benar-benar ' +
            'diketahui dari apa yang hanya asumsi, dan kamu mengatakannya terang-terangan.';
          h.push(b.context, v.market, 'Pasar dan wilayah: ' + v.market + '.');
          var rivals = h.split(v.rivals);
          if (rivals.length) b.context.push('Pesaing yang diketahui: ' + rivals.join(', ') + '.');
          h.push(b.context, v.goal, 'Keputusan yang akan diambil dari analisis ini: ' + v.goal + '.');

          b.task.push('Analisis posisi kompetitif untuk usaha berikut: ' + h.or(v.business, '(isi usaha)'));
          if (!rivals.length) b.task.push('Identifikasi dulu jenis pesaing yang relevan (langsung, tidak langsung, pengganti) sebelum membandingkan.');
          var crit = Array.isArray(v.criteria) ? v.criteria : [];
          if (crit.length) b.task.push('Bandingkan pada dimensi: ' + crit.join(', ') + '.');

          b.constraints.push('Jangan mengarang pangsa pasar, omzet, jumlah cabang, atau angka apa pun tentang pesaing.');
          b.constraints.push('Tandai setiap pernyataan dengan [FAKTA], [ASUMSI], atau [PERLU DIVERIFIKASI].');
          b.constraints.push('Hindari kesimpulan umum seperti "pasar sangat kompetitif" tanpa menjelaskan implikasinya.');
          h.push(b.constraints, v.extra, v.extra);

          if (h.has(v.opts, 'Tabel perbandingan')) b.output.push('Tabel perbandingan: baris pesaing, kolom dimensi penilaian.');
          if (h.has(v.opts, 'Peta posisi (positioning map)')) b.output.push('Peta posisi dua sumbu, dijelaskan dalam teks beserta alasan penempatannya.');
          if (h.has(v.opts, 'Celah pasar yang belum digarap')) b.output.push('Daftar celah pasar yang belum digarap beserta alasan kenapa celah itu ada.');
          if (h.has(v.opts, 'Ancaman yang perlu diwaspadai')) b.output.push('Daftar ancaman beserta tanda-tanda awal yang perlu dipantau.');
          if (h.has(v.opts, 'Rekomendasi diferensiasi')) b.output.push('Rekomendasi diferensiasi yang realistis dengan sumber daya yang ada.');
          if (h.has(v.opts, 'Data yang perlu dikumpulkan')) b.output.push('Daftar data yang perlu dikumpulkan beserta cara termurah mendapatkannya.');

          b.success.push('Pembaca tahu persis satu langkah yang membuat posisinya berbeda, dan apa risikonya.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'jobdesc',
        name: 'Lowongan & Deskripsi Kerja',
        desc: 'Iklan lowongan, job description, dan materi rekrutmen.',
        tags: ['lowongan', 'rekrutmen', 'hrd', 'job description', 'karyawan'],
        fields: [
          { id: 'role', label: 'Posisi yang dicari', type: 'text', required: true, wide: true,
            placeholder: 'mis. Admin Penjualan' },
          { id: 'company', label: 'Tentang perusahaan', type: 'textarea', wide: true,
            placeholder: 'Bidang, ukuran, budaya kerja, lokasi.' },
          { id: 'duties', label: 'Tugas utama sehari-hari', type: 'textarea', wide: true,
            placeholder: 'Apa yang benar-benar dikerjakan, bukan istilah umum.' },
          { id: 'must', label: 'Syarat wajib', type: 'tags', wide: true },
          { id: 'nice', label: 'Nilai tambah', type: 'tags', wide: true },
          { id: 'level', label: 'Tingkat posisi', type: 'select',
            options: ['Magang', 'Fresh graduate', 'Staf berpengalaman', 'Supervisor', 'Manajer', 'Kepala divisi'],
            default: 'Staf berpengalaman' },
          { id: 'mode', label: 'Pola kerja', type: 'select', options: ['Kerja di kantor', 'Hibrida', 'Penuh jarak jauh', 'Lapangan'], default: 'Kerja di kantor' },
          { id: 'salary', label: 'Kisaran gaji & benefit', type: 'text', wide: true },
          { id: 'opts', label: 'Sertakan', type: 'multi', wide: true,
            options: ['Versi iklan singkat untuk media sosial', 'Pertanyaan wawancara', 'Kriteria penilaian kandidat',
              'Tes praktik singkat', 'Bahasa inklusif dan netral gender', 'Ekspektasi 90 hari pertama'],
            default: ['Versi iklan singkat untuk media sosial', 'Pertanyaan wawancara', 'Bahasa inklusif dan netral gender'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah praktisi rekrutmen yang menulis lowongan jujur: menarik kandidat yang tepat ' +
            'sekaligus menyaring keluar yang tidak cocok sejak awal.';
          h.push(b.context, v.company, 'Tentang perusahaan: ' + v.company);
          b.context.push('Tingkat posisi: ' + h.or(v.level, 'Staf berpengalaman') + '. Pola kerja: ' + h.or(v.mode, 'Kerja di kantor') + '.');
          h.push(b.context, v.duties, 'Tugas sehari-hari: ' + v.duties);
          var must = h.split(v.must), nice = h.split(v.nice);
          if (must.length) b.context.push('Syarat wajib: ' + must.join(', ') + '.');
          if (nice.length) b.context.push('Nilai tambah: ' + nice.join(', ') + '.');
          h.push(b.context, v.salary, 'Gaji dan benefit: ' + v.salary + '.');

          b.task.push('Tulis lowongan dan deskripsi kerja untuk posisi: ' + h.or(v.role, '(isi posisi)'));

          b.constraints.push('Gambarkan pekerjaan apa adanya, termasuk bagian yang berat. Jangan menjual mimpi.');
          b.constraints.push('Syarat wajib maksimal 6 butir dan benar-benar wajib; sisanya masuk nilai tambah.');
          b.constraints.push('Jangan mencantumkan syarat yang diskriminatif: usia, jenis kelamin, agama, suku, status pernikahan, atau penampilan fisik, kecuali memang persyaratan jabatan yang sah.');
          if (h.has(v.opts, 'Bahasa inklusif dan netral gender')) b.constraints.push('Gunakan bahasa netral gender dan hindari istilah yang membatasi kelompok tertentu.');
          b.constraints.push('Jangan mengarang benefit atau kebijakan perusahaan yang tidak disebutkan.');
          h.push(b.constraints, v.extra, v.extra);

          b.output.push('Struktur: ringkasan posisi, tanggung jawab, syarat, nilai tambah, benefit, cara melamar.');
          if (h.has(v.opts, 'Ekspektasi 90 hari pertama')) b.output.push('Sertakan bagian ekspektasi 30/60/90 hari pertama.');
          if (h.has(v.opts, 'Versi iklan singkat untuk media sosial')) b.output.push('Sertakan versi iklan singkat maksimal 80 kata untuk media sosial.');
          if (h.has(v.opts, 'Pertanyaan wawancara')) b.output.push('Sertakan 8 pertanyaan wawancara berbasis perilaku beserta apa yang dicari dari jawabannya.');
          if (h.has(v.opts, 'Kriteria penilaian kandidat')) b.output.push('Sertakan rubrik penilaian kandidat dengan bobot per kriteria.');
          if (h.has(v.opts, 'Tes praktik singkat')) b.output.push('Usulkan satu tes praktik singkat yang bisa dikerjakan di bawah 60 menit.');

          b.success.push('Kandidat yang tidak cocok mundur sendiri setelah membaca, dan yang cocok merasa tertantang.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'meeting',
        name: 'Notulen jadi Rencana Aksi',
        desc: 'Mengubah catatan rapat berantakan menjadi tindakan yang jelas.',
        tags: ['rapat', 'notulen', 'meeting', 'action item', 'tindak lanjut'],
        fields: [
          { id: 'notes', label: 'Catatan / transkrip rapat', type: 'textarea', required: true, wide: true,
            placeholder: 'Tempel apa adanya, sekalipun berantakan.' },
          { id: 'topic', label: 'Topik rapat', type: 'text', wide: true },
          { id: 'people', label: 'Peserta & peran', type: 'textarea', wide: true,
            placeholder: 'mis. Budi (operasional), Sari (keuangan), Andi (vendor)' },
          { id: 'kind', label: 'Jenis rapat', type: 'select',
            options: ['Rapat rutin tim', 'Rapat keputusan', 'Rapat dengan klien', 'Rapat proyek', 'Evaluasi / retrospektif', 'Brainstorming'],
            default: 'Rapat rutin tim' },
          { id: 'opts', label: 'Sertakan', type: 'multi', wide: true,
            options: ['Ringkasan 5 kalimat', 'Daftar keputusan', 'Action item dengan PIC & tenggat', 'Isu yang belum selesai',
              'Risiko yang muncul', 'Draf email tindak lanjut', 'Agenda rapat berikutnya', 'Tandai bagian yang tidak jelas'],
            default: ['Ringkasan 5 kalimat', 'Daftar keputusan', 'Action item dengan PIC & tenggat', 'Isu yang belum selesai', 'Draf email tindak lanjut'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah notulis yang tajam: kamu memisahkan obrolan dari keputusan, dan keputusan dari niat baik.';
          h.push(b.context, v.topic, 'Topik rapat: ' + v.topic + '.');
          b.context.push('Jenis rapat: ' + h.or(v.kind, 'Rapat rutin tim') + '.');
          h.push(b.context, v.people, 'Peserta: ' + v.people);
          b.context.push('Catatan rapat:\n"""\n' + h.or(v.notes, '[CATATAN RAPAT]') + '\n"""');

          b.task.push('Ubah catatan di atas menjadi notulen yang rapi beserta rencana tindak lanjut.');

          b.constraints.push('Hanya gunakan informasi yang ada di catatan. Jangan menambah keputusan yang tidak pernah diucapkan.');
          b.constraints.push('Bedakan tegas antara keputusan yang sudah final, usulan yang belum disetujui, dan sekadar wacana.');
          b.constraints.push('Setiap action item wajib punya penanggung jawab dan tenggat. Bila tidak disebut di rapat, tulis [PIC BELUM DITENTUKAN] atau [TENGGAT BELUM DITENTUKAN].');
          if (h.has(v.opts, 'Tandai bagian yang tidak jelas')) b.constraints.push('Beri tanda [PERLU KONFIRMASI] pada bagian yang ambigu di catatan.');
          h.push(b.constraints, v.extra, v.extra);

          if (h.has(v.opts, 'Ringkasan 5 kalimat')) b.output.push('Mulai dengan ringkasan maksimal 5 kalimat.');
          if (h.has(v.opts, 'Daftar keputusan')) b.output.push('Daftar keputusan yang diambil beserta alasannya.');
          if (h.has(v.opts, 'Action item dengan PIC & tenggat')) b.output.push('Tabel action item: tugas, penanggung jawab, tenggat, status.');
          if (h.has(v.opts, 'Isu yang belum selesai')) b.output.push('Daftar isu yang masih menggantung beserta apa yang menghambatnya.');
          if (h.has(v.opts, 'Risiko yang muncul')) b.output.push('Daftar risiko yang terungkap di rapat.');
          if (h.has(v.opts, 'Draf email tindak lanjut')) b.output.push('Draf email tindak lanjut singkat yang siap dikirim ke peserta.');
          if (h.has(v.opts, 'Agenda rapat berikutnya')) b.output.push('Usulan agenda untuk rapat berikutnya.');

          b.success.push('Orang yang tidak hadir tahu persis apa yang diputuskan dan apa tugasnya.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'pricing',
        name: 'Strategi Harga & Paket',
        desc: 'Menyusun struktur harga, paket, dan cara mengomunikasikannya.',
        tags: ['harga', 'pricing', 'paket', 'margin', 'diskon'],
        fields: [
          { id: 'product', label: 'Produk / layanan', type: 'textarea', required: true, wide: true },
          { id: 'cost', label: 'Struktur biaya', type: 'textarea', wide: true,
            placeholder: 'Biaya tetap, biaya variabel per unit, margin yang diharapkan.' },
          { id: 'market', label: 'Harga pasar & pesaing', type: 'textarea', wide: true },
          { id: 'segment', label: 'Segmen pembeli', type: 'textarea', wide: true,
            placeholder: 'Siapa yang membeli, seberapa sensitif terhadap harga.' },
          { id: 'model', label: 'Model harga', type: 'select',
            options: ['Satuan sekali beli', 'Berlangganan bulanan', 'Berjenjang (tiering)', 'Berdasarkan pemakaian',
              'Paket bundling', 'Freemium', 'Harga proyek', 'Belum tahu — sarankan'], default: 'Berjenjang (tiering)' },
          { id: 'goal', label: 'Tujuan penetapan harga', type: 'select',
            options: ['Memaksimalkan laba', 'Merebut pangsa pasar', 'Menaikkan nilai transaksi rata-rata',
              'Menyaring pelanggan yang tepat', 'Bertahan dari perang harga'], default: 'Menaikkan nilai transaksi rata-rata' },
          { id: 'opts', label: 'Sertakan', type: 'multi', wide: true,
            options: ['Tabel paket siap pakai', 'Perhitungan titik impas', 'Alasan psikologis tiap angka',
              'Naskah menjawab "kemahalan"', 'Kebijakan diskon', 'Rencana uji coba harga'],
            default: ['Tabel paket siap pakai', 'Alasan psikologis tiap angka', 'Naskah menjawab "kemahalan"'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah konsultan pricing yang memandang harga sebagai keputusan strategi, bukan hasil ' +
            'menambahkan margin ke biaya.';
          h.push(b.context, v.cost, 'Struktur biaya: ' + v.cost);
          h.push(b.context, v.market, 'Harga pasar dan pesaing: ' + v.market);
          h.push(b.context, v.segment, 'Segmen pembeli: ' + v.segment);
          b.context.push('Tujuan penetapan harga: ' + h.or(v.goal, 'Menaikkan nilai transaksi rata-rata') + '.');

          b.task.push('Susun strategi harga untuk: ' + h.or(v.product, '(isi produk)'));
          b.task.push(v.model === 'Belum tahu — sarankan'
            ? 'Sarankan model harga yang paling cocok beserta alasannya.'
            : 'Gunakan model ' + h.or(v.model, 'berjenjang') + '.');

          b.constraints.push('Setiap angka harga harus bisa dijelaskan dasarnya: biaya, nilai bagi pembeli, atau posisi terhadap pesaing.');
          b.constraints.push('Jangan mengarang biaya atau harga pesaing yang tidak diberikan. Tulis [ISI ANGKA] dan jelaskan cara menghitungnya.');
          b.constraints.push('Sebutkan risiko dari tiap pilihan harga, termasuk kemungkinan kanibalisasi antar paket.');
          h.push(b.constraints, v.extra, v.extra);

          if (h.has(v.opts, 'Tabel paket siap pakai')) b.output.push('Tabel paket: nama paket, untuk siapa, isi paket, harga, batasan.');
          if (h.has(v.opts, 'Perhitungan titik impas')) b.output.push('Perhitungan titik impas beserta rumus dan asumsinya.');
          if (h.has(v.opts, 'Alasan psikologis tiap angka')) b.output.push('Penjelasan alasan di balik tiap angka, termasuk efek jangkar dan urutan penyajian.');
          if (h.has(v.opts, 'Naskah menjawab "kemahalan"')) b.output.push('Naskah menjawab keberatan harga, tanpa langsung memberi diskon.');
          if (h.has(v.opts, 'Kebijakan diskon')) b.output.push('Kebijakan diskon: kapan boleh, berapa maksimal, dan syaratnya.');
          if (h.has(v.opts, 'Rencana uji coba harga')) b.output.push('Rencana menguji harga secara bertahap beserta metrik yang dipantau.');

          b.success.push('Pemilik usaha berani menaikkan harga karena tahu persis alasannya.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'customer',
        name: 'Balasan Pelanggan & Keluhan',
        desc: 'Menjawab komplain, ulasan buruk, dan pertanyaan sulit.',
        tags: ['pelanggan', 'komplain', 'keluhan', 'cs', 'ulasan', 'customer service'],
        fields: [
          { id: 'message', label: 'Pesan dari pelanggan', type: 'textarea', required: true, wide: true,
            placeholder: 'Tempel keluhan atau ulasannya apa adanya.' },
          { id: 'situation', label: 'Apa yang sebenarnya terjadi', type: 'textarea', wide: true,
            placeholder: 'Versi kita: fakta yang diketahui, termasuk bila memang kita yang salah.' },
          { id: 'channel', label: 'Saluran', type: 'select',
            options: ['WhatsApp', 'Email', 'Ulasan marketplace', 'Ulasan Google', 'Komentar media sosial', 'Telepon (naskah bicara)'],
            default: 'WhatsApp' },
          { id: 'severity', label: 'Tingkat kegawatan', type: 'select',
            options: ['Pertanyaan biasa', 'Kecewa ringan', 'Marah', 'Mengancam viral / lapor', 'Berpotensi hukum'],
            default: 'Kecewa ringan' },
          { id: 'offer', label: 'Yang bisa kita tawarkan', type: 'text', wide: true,
            placeholder: 'mis. tukar barang, refund sebagian, voucher. Kosongkan bila belum ada wewenang.' },
          { id: 'limit', label: 'Yang TIDAK bisa dijanjikan', type: 'text', wide: true },
          { id: 'opts', label: 'Sertakan', type: 'multi', wide: true,
            options: ['Dua versi nada berbeda', 'Balasan publik dan balasan pribadi', 'Langkah internal yang perlu dilakukan',
              'Antisipasi balasan berikutnya', 'Versi Bahasa Inggris'],
            default: ['Dua versi nada berbeda', 'Langkah internal yang perlu dilakukan'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah kepala layanan pelanggan yang tenang. Kamu mengakui kesalahan tanpa berlebihan, ' +
            'dan menyelesaikan masalah tanpa menjanjikan yang tidak bisa ditepati.';
          b.context.push('Saluran: ' + h.or(v.channel, 'WhatsApp') + '. Tingkat kegawatan: ' + h.or(v.severity, 'Kecewa ringan') + '.');
          h.push(b.context, v.situation, 'Fakta dari sisi kita: ' + v.situation);
          h.push(b.context, v.offer, 'Yang bisa ditawarkan: ' + v.offer + '.');
          h.push(b.context, v.limit, 'Yang tidak boleh dijanjikan: ' + v.limit + '.');
          b.context.push('Pesan pelanggan:\n"""\n' + h.or(v.message, '[PESAN PELANGGAN]') + '\n"""');

          b.task.push('Tulis balasan untuk pesan pelanggan di atas.');

          b.constraints.push('Akui perasaan pelanggan lebih dulu, baru jelaskan fakta. Jangan membantah di kalimat pertama.');
          b.constraints.push('Jangan menyalahkan pelanggan, ekspedisi, atau pihak lain di depan publik.');
          b.constraints.push('Hanya janjikan yang tercantum sebagai bisa ditawarkan. Jangan menjanjikan kompensasi, tenggat, atau kebijakan yang tidak diberikan.');
          b.constraints.push('Sertakan langkah konkret berikutnya beserta perkiraan waktunya.');
          if (v.severity === 'Berpotensi hukum') b.constraints.push('Untuk kasus berpotensi hukum: jangan mengakui kesalahan secara hukum, tetap empatik, dan arahkan ke jalur penyelesaian resmi. Sarankan konsultasi ke penasihat hukum sebelum dikirim.');
          h.push(b.constraints, v.extra, v.extra);

          if (h.has(v.opts, 'Dua versi nada berbeda')) b.output.push('Dua versi balasan: satu lebih hangat, satu lebih ringkas dan formal.');
          if (h.has(v.opts, 'Balasan publik dan balasan pribadi')) b.output.push('Pisahkan balasan publik yang singkat dan balasan pribadi yang lebih rinci.');
          if (h.has(v.opts, 'Langkah internal yang perlu dilakukan')) b.output.push('Daftar langkah internal yang perlu dilakukan agar masalah ini tidak terulang.');
          if (h.has(v.opts, 'Antisipasi balasan berikutnya')) b.output.push('Antisipasi kemungkinan balasan pelanggan beserta draf jawabannya.');
          if (h.has(v.opts, 'Versi Bahasa Inggris')) b.output.push('Sertakan versi Bahasa Inggris.');

          b.success.push('Pelanggan merasa didengar dan tahu kapan masalahnya selesai.');
          return b;
        }
      }

    ]
  });

})(window.PG);
