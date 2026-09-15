/* ==========================================================================
   data/education.js — kategori "Pendidikan"
   ========================================================================== */

(function (PG) {
  'use strict';
  var h = PG.h;

  var JENJANG = ['PAUD / TK', 'SD kelas 1-3', 'SD kelas 4-6', 'SMP', 'SMA / SMK',
    'Kuliah S1', 'Pascasarjana', 'Pelatihan profesional', 'Umum / otodidak'];

  function fJenjang() {
    return { id: 'jenjang', label: 'Jenjang', type: 'select', options: JENJANG, default: 'SMP' };
  }
  function fExtra() {
    return { id: 'extra', label: 'Instruksi tambahan', type: 'textarea', wide: true,
      placeholder: 'Kurikulum yang dipakai, kebiasaan kelas, atau batasan lain.' };
  }

  PG.registerCategory({
    id: 'education',
    name: 'Pendidikan',
    icon: '🎓',
    desc: 'Materi ajar, soal, rubrik, umpan balik, dan rencana belajar.',
    defaultFormat: 'structured',
    templates: [

      /* ------------------------------------------------------------------ */
      {
        id: 'lesson',
        name: 'Materi Ajar & Rencana Pembelajaran',
        desc: 'Menyusun satu sesi belajar lengkap dengan kegiatannya.',
        tags: ['rpp', 'materi', 'mengajar', 'silabus', 'pembelajaran', 'guru'],
        fields: [
          { id: 'topic', label: 'Topik yang diajarkan', type: 'textarea', required: true, wide: true,
            placeholder: 'mis. konsep tekanan zat cair dan penerapannya sehari-hari' },
          fJenjang(),
          { id: 'subject', label: 'Mata pelajaran', type: 'text', placeholder: 'mis. IPA' },
          { id: 'duration', label: 'Durasi', type: 'select',
            options: ['30 menit', '45 menit', '1 jam pelajaran (40 menit)', '2 jam pelajaran', '90 menit', 'Beberapa pertemuan'],
            default: '2 jam pelajaran' },
          { id: 'goal', label: 'Tujuan pembelajaran', type: 'textarea', wide: true,
            placeholder: 'Setelah sesi ini, siswa mampu ...' },
          { id: 'prior', label: 'Pengetahuan awal siswa', type: 'text', wide: true,
            placeholder: 'Apa yang sudah mereka kuasai sebelum sesi ini.' },
          { id: 'facility', label: 'Fasilitas yang tersedia', type: 'multi', wide: true,
            options: ['Papan tulis saja', 'Proyektor', 'Internet', 'Laptop / tablet siswa', 'Laboratorium',
              'Alat peraga sederhana', 'Ruang terbatas', 'Kelas besar (30+ siswa)'],
            default: ['Papan tulis saja'] },
          { id: 'method', label: 'Pendekatan mengajar', type: 'select',
            options: ['Ceramah + tanya jawab', 'Diskusi kelompok', 'Pembelajaran berbasis masalah', 'Praktik / eksperimen',
              'Pembelajaran berbasis proyek', 'Belajar lewat permainan', 'Kelas terbalik (flipped)'],
            default: 'Pembelajaran berbasis masalah' },
          { id: 'opts', label: 'Sertakan', type: 'multi', wide: true,
            options: ['Pemantik di awal', 'Kegiatan langkah demi langkah dengan alokasi waktu', 'Contoh & analogi sehari-hari',
              'Pertanyaan pemandu', 'Lembar kerja siswa', 'Cara menangani siswa yang tertinggal',
              'Pengayaan untuk siswa cepat', 'Penilaian singkat di akhir', 'Miskonsepsi yang sering terjadi'],
            default: ['Pemantik di awal', 'Kegiatan langkah demi langkah dengan alokasi waktu', 'Contoh & analogi sehari-hari', 'Penilaian singkat di akhir', 'Miskonsepsi yang sering terjadi'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah guru berpengalaman yang tahu bahwa satu contoh konkret mengalahkan tiga definisi, ' +
            'dan bahwa kelas nyata jarang berjalan sesuai rencana ideal.';
          b.context.push('Jenjang: ' + h.or(v.jenjang, 'SMP') + (v.subject ? '. Mata pelajaran: ' + v.subject : '') + '.');
          b.context.push('Durasi: ' + h.or(v.duration, '2 jam pelajaran') + '. Pendekatan: ' + h.or(v.method, 'Pembelajaran berbasis masalah') + '.');
          h.push(b.context, v.prior, 'Pengetahuan awal siswa: ' + v.prior);
          h.push(b.context, v.goal, 'Tujuan pembelajaran: ' + v.goal);
          var fac = Array.isArray(v.facility) ? v.facility : [];
          if (fac.length) b.context.push('Fasilitas yang tersedia: ' + fac.join(', ') + '.');

          b.task.push('Susun rencana pembelajaran untuk topik: ' + h.or(v.topic, '(isi topik)'));
          if (!v.goal) b.task.push('Rumuskan dulu tujuan pembelajaran yang spesifik dan bisa diukur.');

          b.constraints.push('Bahasa dan contoh harus sesuai jenjang di atas. Jangan memakai istilah yang belum diajarkan tanpa menjelaskannya.');
          b.constraints.push('Kegiatan hanya boleh memakai fasilitas yang tersedia. Jangan menuntut alat yang tidak ada.');
          b.constraints.push('Gunakan konteks Indonesia yang akrab bagi siswa dalam contoh dan soal.');
          b.constraints.push('Jangan mengarang kutipan kurikulum atau nomor kompetensi dasar. Tandai [SESUAIKAN KURIKULUM] bila perlu.');
          h.push(b.constraints, v.extra, v.extra);

          if (h.has(v.opts, 'Pemantik di awal')) b.output.push('Kegiatan pemantik 5 menit yang memancing rasa ingin tahu.');
          if (h.has(v.opts, 'Kegiatan langkah demi langkah dengan alokasi waktu')) b.output.push('Rangkaian kegiatan dengan alokasi menit, apa yang dilakukan guru, dan apa yang dilakukan siswa.');
          if (h.has(v.opts, 'Contoh & analogi sehari-hari')) b.output.push('Minimal dua analogi dari kehidupan sehari-hari, lengkap dengan batas keberlakuannya.');
          if (h.has(v.opts, 'Pertanyaan pemandu')) b.output.push('Pertanyaan pemandu bertingkat dari mudah ke sulit.');
          if (h.has(v.opts, 'Lembar kerja siswa')) b.output.push('Lembar kerja siswa yang siap difotokopi.');
          if (h.has(v.opts, 'Miskonsepsi yang sering terjadi')) b.output.push('Daftar miskonsepsi yang sering muncul beserta cara meluruskannya.');
          if (h.has(v.opts, 'Cara menangani siswa yang tertinggal')) b.output.push('Cara menangani siswa yang tertinggal tanpa menghambat kelas.');
          if (h.has(v.opts, 'Pengayaan untuk siswa cepat')) b.output.push('Kegiatan pengayaan untuk siswa yang cepat selesai.');
          if (h.has(v.opts, 'Penilaian singkat di akhir')) b.output.push('Penilaian singkat di akhir sesi untuk mengecek pemahaman.');

          b.success.push('Guru bisa langsung mengajar dengan dokumen ini tanpa menyiapkan apa pun lagi.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'quiz',
        name: 'Soal & Kunci Jawaban',
        desc: 'Membuat soal ujian, latihan, atau kuis beserta pembahasannya.',
        tags: ['soal', 'ujian', 'kuis', 'latihan', 'tes', 'penilaian'],
        fields: [
          { id: 'topic', label: 'Materi yang diujikan', type: 'textarea', required: true, wide: true },
          fJenjang(),
          { id: 'count', label: 'Jumlah soal', type: 'range', min: 3, max: 50, step: 1, default: 10 },
          { id: 'types', label: 'Bentuk soal', type: 'multi', wide: true,
            options: ['Pilihan ganda', 'Benar / salah', 'Isian singkat', 'Uraian pendek', 'Uraian panjang',
              'Menjodohkan', 'Studi kasus', 'Soal hitungan'],
            default: ['Pilihan ganda', 'Uraian pendek'] },
          { id: 'level', label: 'Tingkat berpikir (Bloom)', type: 'multi', wide: true,
            options: ['Mengingat', 'Memahami', 'Menerapkan', 'Menganalisis', 'Mengevaluasi', 'Mencipta'],
            default: ['Memahami', 'Menerapkan', 'Menganalisis'] },
          { id: 'difficulty', label: 'Komposisi kesulitan', type: 'select',
            options: ['Mudah semua', 'Banyak mudah, sedikit sulit', 'Seimbang (30-50-20)', 'Cenderung sulit', 'Sulit semua'],
            default: 'Seimbang (30-50-20)' },
          { id: 'context', label: 'Konteks soal', type: 'text', wide: true,
            placeholder: 'mis. situasi pasar tradisional, sawah, atau kehidupan sekolah' },
          { id: 'opts', label: 'Sertakan', type: 'multi', wide: true,
            options: ['Kunci jawaban', 'Pembahasan langkah demi langkah', 'Pengecoh yang masuk akal',
              'Kisi-kisi soal', 'Bobot nilai per soal', 'Perkiraan waktu pengerjaan', 'Variasi soal cadangan'],
            default: ['Kunci jawaban', 'Pembahasan langkah demi langkah', 'Pengecoh yang masuk akal', 'Kisi-kisi soal'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah penyusun soal yang menguji pemahaman, bukan hafalan kata kunci atau kejelian ' +
            'membaca soal yang menjebak.';
          b.context.push('Jenjang: ' + h.or(v.jenjang, 'SMP') + '.');
          var lv = Array.isArray(v.level) ? v.level : [];
          if (lv.length) b.context.push('Tingkat berpikir yang disasar: ' + lv.join(', ') + '.');
          b.context.push('Komposisi kesulitan: ' + h.or(v.difficulty, 'Seimbang (30-50-20)') + '.');
          h.push(b.context, v.context, 'Konteks yang dipakai dalam soal: ' + v.context + '.');

          b.task.push('Buat ' + h.or(v.count, 10) + ' soal untuk materi: ' + h.or(v.topic, '(isi materi)'));
          var types = Array.isArray(v.types) ? v.types : [];
          if (types.length) b.task.push('Bentuk soal: ' + types.join(', ') + '. Sebarkan secara proporsional.');

          b.constraints.push('Setiap soal hanya punya satu jawaban yang benar-benar tepat, dan bisa dipertanggungjawabkan.');
          b.constraints.push('Hindari soal jebakan berbasis kata-kata, negasi ganda, dan pilihan "semua benar" / "semua salah".');
          if (h.has(v.opts, 'Pengecoh yang masuk akal')) b.constraints.push('Setiap pengecoh harus mencerminkan kesalahan berpikir yang nyata, bukan pilihan asal.');
          b.constraints.push('Bahasa soal jelas dan sesuai jenjang. Satu soal menguji satu hal.');
          b.constraints.push('Untuk soal hitungan, pastikan angkanya benar dan hasilnya wajar. Periksa ulang perhitungannya.');
          h.push(b.constraints, v.extra, v.extra);

          b.output.push('Bagian soal dipisahkan dari bagian kunci, agar bisa dicetak terpisah.');
          if (h.has(v.opts, 'Kisi-kisi soal')) b.output.push('Kisi-kisi berbentuk tabel: nomor, indikator, tingkat berpikir, tingkat kesulitan.');
          if (h.has(v.opts, 'Bobot nilai per soal')) b.output.push('Bobot nilai per soal beserta total.');
          if (h.has(v.opts, 'Perkiraan waktu pengerjaan')) b.output.push('Perkiraan waktu pengerjaan keseluruhan.');
          if (h.has(v.opts, 'Kunci jawaban')) b.output.push('Kunci jawaban lengkap.');
          if (h.has(v.opts, 'Pembahasan langkah demi langkah')) b.output.push('Pembahasan langkah demi langkah, termasuk alasan pilihan lain salah.');
          if (h.has(v.opts, 'Variasi soal cadangan')) b.output.push('Tiga soal cadangan sebagai pengganti bila ada soal yang bocor.');

          b.success.push('Siswa yang paham konsep pasti bisa menjawab; yang hanya menghafal pasti kesulitan.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'explain',
        name: 'Penjelasan Bertingkat',
        desc: 'Menjelaskan konsep sulit dari yang paling sederhana ke mendalam.',
        tags: ['penjelasan', 'konsep', 'belajar', 'paham', 'analogi'],
        fields: [
          { id: 'concept', label: 'Konsep yang dijelaskan', type: 'textarea', required: true, wide: true,
            placeholder: 'mis. kenapa inflasi bisa naik padahal produksi juga naik' },
          fJenjang(),
          { id: 'levels', label: 'Tingkat penjelasan', type: 'multi', wide: true,
            options: ['Untuk anak 5 tahun', 'Untuk pemula total', 'Untuk yang sudah tahu dasarnya',
              'Untuk praktisi', 'Penjelasan teknis lengkap'],
            default: ['Untuk pemula total', 'Untuk yang sudah tahu dasarnya'] },
          { id: 'why', label: 'Kenapa perlu paham ini', type: 'text', wide: true,
            placeholder: 'mis. mau menjelaskan ke murid minggu depan' },
          { id: 'stuck', label: 'Bagian yang membingungkan', type: 'textarea', wide: true,
            placeholder: 'Bagian mana yang selama ini tidak masuk akal.' },
          { id: 'opts', label: 'Sertakan', type: 'multi', wide: true,
            options: ['Analogi sehari-hari', 'Contoh dari Indonesia', 'Gambaran visual dalam kata',
              'Kesalahpahaman umum', 'Cara menguji pemahaman sendiri', 'Bacaan lanjutan', 'Rangkuman satu kalimat'],
            default: ['Analogi sehari-hari', 'Contoh dari Indonesia', 'Kesalahpahaman umum', 'Rangkuman satu kalimat'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah pengajar yang sabar dan tidak pernah merendahkan. Kamu tahu bahwa kebingungan ' +
            'biasanya bukan karena orangnya bodoh, tapi karena ada satu langkah yang dilewati.';
          b.context.push('Jenjang pembaca: ' + h.or(v.jenjang, 'SMP') + '.');
          h.push(b.context, v.why, 'Alasan perlu memahaminya: ' + v.why + '.');
          h.push(b.context, v.stuck, 'Bagian yang selama ini membingungkan: ' + v.stuck);

          b.task.push('Jelaskan konsep: ' + h.or(v.concept, '(isi konsep)'));
          var lv = Array.isArray(v.levels) ? v.levels : [];
          if (lv.length) b.task.push('Susun penjelasan bertingkat: ' + lv.join(' → ') + '.');

          b.constraints.push('Setiap tingkat harus utuh dan bisa dibaca sendiri, bukan potongan dari tingkat berikutnya.');
          b.constraints.push('Jelaskan setiap istilah teknis saat pertama kali muncul.');
          b.constraints.push('Jangan menyederhanakan sampai menjadi salah. Bila analogi punya batas, sebutkan batasnya.');
          b.constraints.push('Jangan mengarang angka, tahun, atau nama tokoh. Bila ragu, katakan ragu.');
          h.push(b.constraints, v.extra, v.extra);

          if (h.has(v.opts, 'Analogi sehari-hari')) b.output.push('Analogi sehari-hari di setiap tingkat, beserta di mana analogi itu tidak lagi berlaku.');
          if (h.has(v.opts, 'Contoh dari Indonesia')) b.output.push('Contoh nyata dari konteks Indonesia.');
          if (h.has(v.opts, 'Gambaran visual dalam kata')) b.output.push('Gambaran visual yang bisa dibayangkan pembaca, dijelaskan dengan kata-kata.');
          if (h.has(v.opts, 'Kesalahpahaman umum')) b.output.push('Daftar kesalahpahaman umum beserta koreksinya.');
          if (h.has(v.opts, 'Cara menguji pemahaman sendiri')) b.output.push('Dua atau tiga pertanyaan untuk menguji pemahaman sendiri, beserta jawabannya.');
          if (h.has(v.opts, 'Rangkuman satu kalimat')) b.output.push('Rangkuman satu kalimat di bagian paling akhir.');
          if (h.has(v.opts, 'Bacaan lanjutan')) b.output.push('Saran jenis bacaan lanjutan. Jangan mengarang judul atau tautan yang tidak dipastikan ada.');

          b.success.push('Pembaca bisa menjelaskan ulang konsep ini ke orang lain dengan kata-katanya sendiri.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'rubric',
        name: 'Rubrik Penilaian',
        desc: 'Kriteria penilaian yang adil, jelas, dan konsisten.',
        tags: ['rubrik', 'penilaian', 'kriteria', 'nilai', 'asesmen'],
        fields: [
          { id: 'task', label: 'Tugas yang dinilai', type: 'textarea', required: true, wide: true,
            placeholder: 'mis. presentasi kelompok tentang hasil percobaan sederhana' },
          fJenjang(),
          { id: 'criteria', label: 'Aspek yang dinilai', type: 'tags', wide: true,
            placeholder: 'isi, struktur, penyampaian, kerja sama; kosongkan bila ingin disarankan' },
          { id: 'scale', label: 'Skala penilaian', type: 'select',
            options: ['4 tingkat (Sangat baik - Perlu bimbingan)', '5 tingkat (skala 1-5)', 'Skor 0-100', 'Lulus / belum lulus'],
            default: '4 tingkat (Sangat baik - Perlu bimbingan)' },
          { id: 'weight', label: 'Pembobotan', type: 'select',
            options: ['Rata semua aspek', 'Isi lebih berat', 'Proses lebih berat', 'Tentukan sendiri yang paling masuk akal'],
            default: 'Tentukan sendiri yang paling masuk akal' },
          { id: 'opts', label: 'Sertakan', type: 'multi', wide: true,
            options: ['Deskripsi tiap tingkat per aspek', 'Contoh pekerjaan tiap tingkat', 'Rubrik versi siswa',
              'Catatan umpan balik siap pakai', 'Cara menghitung nilai akhir', 'Cara menjaga konsistensi antar penilai'],
            default: ['Deskripsi tiap tingkat per aspek', 'Rubrik versi siswa', 'Cara menghitung nilai akhir'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah ahli asesmen yang membuat rubrik sehingga dua penilai berbeda memberi nilai ' +
            'yang hampir sama untuk pekerjaan yang sama.';
          b.context.push('Jenjang: ' + h.or(v.jenjang, 'SMP') + '. Skala: ' + h.or(v.scale, '4 tingkat') + '.');
          var crit = h.split(v.criteria);
          if (crit.length) b.context.push('Aspek yang dinilai: ' + crit.join(', ') + '.');
          b.context.push('Pembobotan: ' + h.or(v.weight, 'Tentukan sendiri yang paling masuk akal') + '.');

          b.task.push('Susun rubrik penilaian untuk tugas: ' + h.or(v.task, '(isi tugas)'));
          if (!crit.length) b.task.push('Tentukan dulu 4-6 aspek penilaian yang paling relevan untuk tugas ini.');

          b.constraints.push('Deskripsi tiap tingkat harus bisa diamati, bukan penilaian rasa. Hindari kata "cukup baik", "kurang", "biasa saja" tanpa penjelasan.');
          b.constraints.push('Bedakan antar tingkat dengan ciri yang konkret, bukan hanya dengan kata "lebih" atau "kurang".');
          b.constraints.push('Aspek penilaian tidak boleh tumpang tindih satu sama lain.');
          h.push(b.constraints, v.extra, v.extra);

          b.output.push('Rubrik utama berbentuk tabel: baris aspek, kolom tingkat.');
          if (h.has(v.opts, 'Deskripsi tiap tingkat per aspek')) b.output.push('Setiap sel berisi deskripsi perilaku atau hasil yang bisa diamati.');
          if (h.has(v.opts, 'Contoh pekerjaan tiap tingkat')) b.output.push('Contoh singkat pekerjaan untuk tingkat tertinggi dan terendah.');
          if (h.has(v.opts, 'Rubrik versi siswa')) b.output.push('Versi rubrik dengan bahasa yang bisa dipahami siswa sendiri.');
          if (h.has(v.opts, 'Catatan umpan balik siap pakai')) b.output.push('Kalimat umpan balik siap pakai untuk tiap tingkat.');
          if (h.has(v.opts, 'Cara menghitung nilai akhir')) b.output.push('Cara menghitung nilai akhir beserta contoh perhitungannya.');
          if (h.has(v.opts, 'Cara menjaga konsistensi antar penilai')) b.output.push('Tips menjaga konsistensi bila dinilai lebih dari satu orang.');

          b.success.push('Siswa tahu persis apa yang harus dilakukan untuk mendapat nilai tertinggi sebelum mengerjakan.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'feedback',
        name: 'Umpan Balik untuk Siswa',
        desc: 'Komentar yang membangun dan benar-benar membantu perbaikan.',
        tags: ['umpan balik', 'feedback', 'komentar', 'penilaian', 'siswa'],
        fields: [
          { id: 'work', label: 'Pekerjaan siswa', type: 'textarea', required: true, wide: true,
            placeholder: 'Tempel tulisan, jawaban, atau deskripsi hasil kerjanya.' },
          fJenjang(),
          { id: 'assignment', label: 'Tugas yang diberikan', type: 'text', wide: true },
          { id: 'focus', label: 'Fokus umpan balik', type: 'multi', wide: true,
            options: ['Isi & gagasan', 'Struktur', 'Bahasa & ejaan', 'Ketepatan konsep', 'Kreativitas',
              'Kelengkapan', 'Proses kerja'], default: ['Isi & gagasan', 'Struktur', 'Ketepatan konsep'] },
          { id: 'tone', label: 'Nada', type: 'select',
            options: ['Mendorong semangat', 'Netral profesional', 'Tegas dan langsung'], default: 'Mendorong semangat' },
          { id: 'situation', label: 'Kondisi siswa', type: 'text', wide: true,
            placeholder: 'mis. sedang kehilangan motivasi, atau justru sangat percaya diri' },
          { id: 'opts', label: 'Sertakan', type: 'multi', wide: true,
            options: ['Sebutkan yang sudah baik lebih dulu', 'Maksimal 3 hal untuk diperbaiki', 'Contoh perbaikan konkret',
              'Satu langkah berikutnya', 'Pertanyaan reflektif untuk siswa', 'Perkiraan nilai beserta alasannya'],
            default: ['Sebutkan yang sudah baik lebih dulu', 'Maksimal 3 hal untuk diperbaiki', 'Contoh perbaikan konkret', 'Satu langkah berikutnya'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah guru yang memberi umpan balik seperti pelatih: jujur tentang apa yang belum ' +
            'berhasil, tapi selalu menunjukkan jalan keluarnya.';
          b.context.push('Jenjang: ' + h.or(v.jenjang, 'SMP') + '. Nada: ' + h.or(v.tone, 'Mendorong semangat') + '.');
          h.push(b.context, v.assignment, 'Tugas yang diberikan: ' + v.assignment);
          h.push(b.context, v.situation, 'Kondisi siswa: ' + v.situation + '.');
          b.context.push('Pekerjaan siswa:\n"""\n' + h.or(v.work, '[PEKERJAAN SISWA]') + '\n"""');

          b.task.push('Berikan umpan balik atas pekerjaan siswa di atas.');
          var f = Array.isArray(v.focus) ? v.focus : [];
          if (f.length) b.task.push('Fokus pada: ' + f.join(', ') + '.');

          b.constraints.push('Komentari pekerjaannya, bukan pribadinya. Hindari kata "kamu malas" atau "kamu tidak teliti".');
          b.constraints.push('Setiap kritik wajib disertai cara memperbaikinya, bukan sekadar menunjuk kesalahan.');
          b.constraints.push('Gunakan bahasa yang dipahami siswa sesuai jenjangnya.');
          if (h.has(v.opts, 'Maksimal 3 hal untuk diperbaiki')) b.constraints.push('Pilih maksimal tiga hal terpenting untuk diperbaiki. Jangan menumpuk semua kesalahan sekaligus.');
          b.constraints.push('Jangan memuji berlebihan untuk pekerjaan yang jelas belum selesai.');
          h.push(b.constraints, v.extra, v.extra);

          if (h.has(v.opts, 'Sebutkan yang sudah baik lebih dulu')) b.output.push('Mulai dengan hal yang sudah dikerjakan dengan baik, secara spesifik.');
          b.output.push('Bagian perbaikan: apa yang kurang, kenapa itu penting, dan bagaimana memperbaikinya.');
          if (h.has(v.opts, 'Contoh perbaikan konkret')) b.output.push('Tunjukkan contoh perbaikan langsung dari pekerjaan siswa itu sendiri.');
          if (h.has(v.opts, 'Satu langkah berikutnya')) b.output.push('Tutup dengan satu langkah konkret berikutnya.');
          if (h.has(v.opts, 'Pertanyaan reflektif untuk siswa')) b.output.push('Sertakan satu pertanyaan reflektif untuk dijawab siswa.');
          if (h.has(v.opts, 'Perkiraan nilai beserta alasannya')) b.output.push('Perkiraan nilai beserta alasan singkat.');

          b.success.push('Siswa tahu persis apa yang harus dikerjakan berikutnya dan merasa mampu melakukannya.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'studyplan',
        name: 'Rencana Belajar Mandiri',
        desc: 'Jadwal belajar realistis untuk menguasai sesuatu dari nol.',
        tags: ['belajar', 'jadwal', 'kurikulum', 'otodidak', 'roadmap'],
        fields: [
          { id: 'goal', label: 'Yang ingin dikuasai', type: 'textarea', required: true, wide: true,
            placeholder: 'mis. bisa membuat laporan keuangan sederhana untuk usaha sendiri' },
          { id: 'now', label: 'Titik awal sekarang', type: 'textarea', wide: true,
            placeholder: 'Apa yang sudah dikuasai dan apa yang belum sama sekali.' },
          { id: 'time', label: 'Waktu yang tersedia', type: 'text', wide: true,
            placeholder: 'mis. 1 jam per hari kerja, 3 jam akhir pekan' },
          { id: 'deadline', label: 'Target waktu', type: 'select',
            options: ['2 minggu', '1 bulan', '3 bulan', '6 bulan', '1 tahun', 'Tanpa tenggat'], default: '3 bulan' },
          { id: 'style', label: 'Cara belajar yang cocok', type: 'multi', wide: true,
            options: ['Baca teks', 'Tonton video', 'Langsung praktik', 'Ikut kelas', 'Diskusi dengan orang',
              'Kerjakan proyek nyata', 'Latihan soal'], default: ['Langsung praktik', 'Kerjakan proyek nyata'] },
          { id: 'obstacle', label: 'Hambatan yang diperkirakan', type: 'text', wide: true,
            placeholder: 'mis. sering batal karena lembur, cepat bosan' },
          { id: 'opts', label: 'Sertakan', type: 'multi', wide: true,
            options: ['Urutan topik beserta alasannya', 'Jadwal mingguan', 'Proyek latihan tiap tahap',
              'Cara mengukur kemajuan', 'Jenis sumber belajar yang dicari', 'Rencana cadangan bila tertinggal',
              'Tanda bahwa sudah boleh lanjut'],
            default: ['Urutan topik beserta alasannya', 'Jadwal mingguan', 'Proyek latihan tiap tahap', 'Cara mengukur kemajuan', 'Rencana cadangan bila tertinggal'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah mentor belajar yang realistis. Kamu membuat rencana yang bertahan sampai minggu ' +
            'keenam, bukan rencana yang terlihat mengesankan di hari pertama.';
          h.push(b.context, v.now, 'Titik awal: ' + v.now);
          h.push(b.context, v.time, 'Waktu yang tersedia: ' + v.time + '.');
          b.context.push('Target waktu: ' + h.or(v.deadline, '3 bulan') + '.');
          var st = Array.isArray(v.style) ? v.style : [];
          if (st.length) b.context.push('Cara belajar yang cocok: ' + st.join(', ') + '.');
          h.push(b.context, v.obstacle, 'Hambatan yang diperkirakan: ' + v.obstacle + '.');

          b.task.push('Susun rencana belajar untuk mencapai: ' + h.or(v.goal, '(isi tujuan)'));

          b.constraints.push('Rencana harus muat di waktu yang tersedia. Bila tujuannya terlalu besar untuk tenggatnya, katakan terus terang dan usulkan tujuan yang lebih realistis.');
          b.constraints.push('Setiap tahap harus menghasilkan sesuatu yang bisa ditunjukkan, bukan sekadar "sudah membaca".');
          b.constraints.push('Jangan mengarang judul buku, nama kursus, atau tautan. Sebutkan jenis sumber dan ciri sumber yang bagus.');
          b.constraints.push('Sisakan ruang untuk minggu yang berantakan; jangan menjadwalkan 100% kapasitas.');
          h.push(b.constraints, v.extra, v.extra);

          if (h.has(v.opts, 'Urutan topik beserta alasannya')) b.output.push('Urutan topik dari awal sampai akhir beserta alasan urutannya.');
          if (h.has(v.opts, 'Jadwal mingguan')) b.output.push('Jadwal mingguan berbentuk tabel dengan alokasi jam.');
          if (h.has(v.opts, 'Proyek latihan tiap tahap')) b.output.push('Satu proyek latihan konkret di tiap tahap.');
          if (h.has(v.opts, 'Tanda bahwa sudah boleh lanjut')) b.output.push('Tanda yang menunjukkan sebuah tahap sudah cukup dikuasai untuk lanjut.');
          if (h.has(v.opts, 'Cara mengukur kemajuan')) b.output.push('Cara mengukur kemajuan tanpa perlu ujian formal.');
          if (h.has(v.opts, 'Jenis sumber belajar yang dicari')) b.output.push('Jenis sumber belajar yang perlu dicari beserta ciri sumber yang layak dipercaya.');
          if (h.has(v.opts, 'Rencana cadangan bila tertinggal')) b.output.push('Rencana cadangan bila tertinggal dua minggu.');

          b.success.push('Rencananya masih bisa dijalankan pada minggu keenam, bukan hanya minggu pertama.');
          return b;
        }
      }

    ]
  });

})(window.PG);
