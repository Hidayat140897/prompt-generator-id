/* ==========================================================================
   data/text.js — kategori "Teks & Tulisan"
   ========================================================================== */

(function (PG) {
  'use strict';
  var h = PG.h;

  var TONES = ['Profesional', 'Santai & akrab', 'Persuasif', 'Informatif & netral', 'Hangat & empatik',
    'Tegas & to the point', 'Humoris', 'Inspiratif', 'Akademis', 'Storytelling'];

  var LEVELS = ['Awam / pemula', 'Umum', 'Praktisi', 'Ahli / teknis'];

  function fAudience(extra) {
    return { id: 'audience', label: 'Target pembaca', type: 'text', default: '',
      placeholder: extra || 'mis. pemilik UMKM usia 25-40 di kota besar',
      hint: 'Makin spesifik pembacanya, makin tepat sasaran tulisannya.' };
  }
  function fTone() {
    return { id: 'tone', label: 'Gaya bahasa', type: 'select', options: TONES, default: 'Profesional' };
  }
  function fLevel() {
    return { id: 'level', label: 'Tingkat kedalaman', type: 'select', options: LEVELS, default: 'Umum' };
  }
  function fExtra() {
    return { id: 'extra', label: 'Instruksi tambahan', type: 'textarea', wide: true,
      placeholder: 'Hal khusus yang wajib ada atau wajib dihindari.',
      hint: 'Opsional. Ditempel apa adanya ke bagian batasan.' };
  }

  PG.registerCategory({
    id: 'text',
    name: 'Teks & Tulisan',
    icon: '✍️',
    desc: 'Artikel, copywriting, email, ringkasan, riset, dan naskah kreatif.',
    defaultFormat: 'structured',
    templates: [

      /* ------------------------------------------------------------------ */
      {
        id: 'article',
        name: 'Artikel / Blog SEO',
        desc: 'Artikel panjang yang terstruktur dan ramah mesin pencari.',
        tags: ['artikel', 'blog', 'seo', 'konten'],
        fields: [
          { id: 'topic', label: 'Topik artikel', type: 'textarea', required: true, wide: true,
            placeholder: 'mis. cara memilih software akuntansi untuk UMKM',
            hint: 'Tulis satu kalimat utuh, bukan hanya kata kunci.' },
          fAudience(),
          { id: 'goal', label: 'Tujuan artikel', type: 'select',
            options: ['Mengedukasi', 'Menarik trafik organik', 'Membangun otoritas merek', 'Mendorong konversi', 'Membandingkan pilihan'],
            default: 'Mengedukasi' },
          fTone(),
          { id: 'words', label: 'Panjang (kata)', type: 'select',
            options: ['500-800', '800-1200', '1200-1800', '1800-2500', '2500+'], default: '1200-1800' },
          { id: 'keyword', label: 'Kata kunci utama', type: 'text', placeholder: 'mis. software akuntansi UMKM' },
          { id: 'secondary', label: 'Kata kunci turunan', type: 'tags', placeholder: 'pisahkan dengan koma' },
          { id: 'angle', label: 'Sudut pandang / angle', type: 'text', wide: true,
            placeholder: 'mis. dari kacamata pemilik toko yang gagap teknologi' },
          { id: 'sections', label: 'Elemen wajib', type: 'multi',
            options: ['Ringkasan di awal', 'Daftar isi', 'Tabel perbandingan', 'Studi kasus', 'Kutipan ahli',
              'FAQ', 'Checklist praktis', 'Kesimpulan + CTA', 'Meta title & description'],
            default: ['Ringkasan di awal', 'FAQ', 'Kesimpulan + CTA'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah penulis konten senior sekaligus SEO strategist dengan pengalaman 10 tahun ' +
            'menulis artikel yang menempati peringkat atas mesin pencari tanpa mengorbankan kualitas bacaan.';

          h.push(b.context, v.audience, 'Pembaca sasaran: ' + v.audience + '.');
          b.context.push('Tingkat kedalaman: ' + h.or(v.level, 'Umum') + '.');
          h.push(b.context, v.angle, 'Sudut pandang yang diminta: ' + v.angle + '.');
          b.context.push('Tujuan artikel: ' + h.or(v.goal, 'Mengedukasi') + '.');

          b.task.push('Tulis satu artikel utuh dengan topik: ' + h.or(v.topic, '(isi topik)') + '.');
          b.task.push('Susun struktur H2/H3 yang logis, lalu isi setiap bagian dengan penjelasan konkret, ' +
            'contoh nyata, dan langkah yang bisa langsung dipraktikkan.');

          b.constraints.push('Panjang target: ' + h.or(v.words, '1200-1800') + ' kata.');
          b.constraints.push('Gaya bahasa: ' + h.or(v.tone, 'Profesional') + '.');
          if (v.keyword) {
            b.constraints.push('Kata kunci utama "' + v.keyword + '" muncul di judul, paragraf pembuka, ' +
              'minimal satu subjudul, dan penutup. Kepadatan wajar, jangan dipaksakan.');
          }
          var sec = h.split(v.secondary);
          if (sec.length) b.constraints.push('Selipkan kata kunci turunan secara alami: ' + sec.join(', ') + '.');
          b.constraints.push('Paragraf maksimal 4 kalimat. Hindari kalimat pasif berlebihan dan jargon tanpa penjelasan.');
          b.constraints.push('Jangan mengarang statistik, nama orang, atau kutipan. Jika butuh data, tulis ' +
            '[BUTUH DATA: ...] sebagai penanda.');
          h.push(b.constraints, v.extra, v.extra);

          b.output.push('Format Markdown dengan hierarki heading yang benar.');
          if (h.has(v.sections, 'Meta title & description'))
            b.output.push('Awali dengan blok meta: Meta Title (maks 60 karakter) dan Meta Description (maks 155 karakter).');
          if (h.has(v.sections, 'Ringkasan di awal'))
            b.output.push('Setelah judul, tulis ringkasan 3-4 poin "Yang akan kamu dapat dari artikel ini".');
          if (h.has(v.sections, 'Daftar isi')) b.output.push('Sertakan daftar isi berupa tautan anchor.');
          if (h.has(v.sections, 'Tabel perbandingan')) b.output.push('Sertakan minimal satu tabel perbandingan.');
          if (h.has(v.sections, 'Studi kasus')) b.output.push('Sertakan satu studi kasus ilustratif yang ditandai sebagai contoh.');
          if (h.has(v.sections, 'Kutipan ahli')) b.output.push('Sisipkan satu kutipan ahli; tandai [BUTUH SUMBER] jika belum ada rujukan nyata.');
          if (h.has(v.sections, 'FAQ')) b.output.push('Tutup dengan bagian FAQ berisi 4-6 pertanyaan yang benar-benar sering ditanyakan.');
          if (h.has(v.sections, 'Checklist praktis')) b.output.push('Sertakan checklist praktis berbentuk daftar centang.');
          if (h.has(v.sections, 'Kesimpulan + CTA')) b.output.push('Akhiri dengan kesimpulan singkat dan satu ajakan bertindak yang jelas.');

          b.success.push('Pembaca bisa mengambil keputusan atau tindakan setelah membaca, bukan sekadar tahu definisi.');
          b.success.push('Tidak ada paragraf pengisi yang bisa dihapus tanpa mengurangi makna.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'copy',
        name: 'Copywriting & Iklan',
        desc: 'Headline, landing page, iklan, dan teks penjualan.',
        tags: ['copywriting', 'iklan', 'marketing', 'jualan', 'landing page'],
        fields: [
          { id: 'product', label: 'Produk / layanan', type: 'textarea', required: true, wide: true,
            placeholder: 'Apa yang dijual, dan apa yang membuatnya berbeda?' },
          fAudience('mis. ibu rumah tangga yang baru mulai jualan online'),
          { id: 'channel', label: 'Media penempatan', type: 'select',
            options: ['Landing page', 'Iklan Meta/Instagram', 'Iklan Google', 'TikTok script', 'Email marketing',
              'Katalog marketplace', 'Brosur cetak', 'Billboard / OOH'], default: 'Landing page' },
          { id: 'pain', label: 'Masalah utama pembeli', type: 'textarea',
            placeholder: 'Rasa frustrasi apa yang ingin mereka hilangkan?' },
          { id: 'benefit', label: 'Manfaat utama', type: 'textarea',
            placeholder: 'Hasil konkret yang mereka dapat.' },
          { id: 'proof', label: 'Bukti / pembeda', type: 'tags',
            placeholder: 'garansi 30 hari, 12.000 pengguna, sertifikat halal' },
          { id: 'framework', label: 'Kerangka copy', type: 'select',
            options: ['AIDA', 'PAS (Problem-Agitate-Solve)', 'BAB (Before-After-Bridge)', '4P', 'FAB', 'Bebas — pilih yang paling pas'],
            default: 'PAS (Problem-Agitate-Solve)' },
          fTone(),
          { id: 'cta', label: 'Ajakan bertindak', type: 'text', placeholder: 'mis. Coba gratis 14 hari' },
          { id: 'variants', label: 'Jumlah variasi', type: 'range', min: 1, max: 10, default: 3 },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah copywriter direct response berpengalaman. Kamu menulis kalimat yang ' +
            'menjual tanpa terdengar murahan, dan kamu menolak klaim berlebihan yang tidak bisa dibuktikan.';

          b.context.push('Produk/layanan: ' + h.or(v.product, '(isi produk)'));
          h.push(b.context, v.audience, 'Target pembeli: ' + v.audience);
          h.push(b.context, v.pain, 'Masalah yang dirasakan pembeli: ' + v.pain);
          h.push(b.context, v.benefit, 'Manfaat utama: ' + v.benefit);
          var proof = h.split(v.proof);
          if (proof.length) b.context.push('Bukti dan pembeda yang boleh dipakai: ' + proof.join(', ') + '.');
          b.context.push('Media penempatan: ' + h.or(v.channel, 'Landing page') + '.');

          b.task.push('Tulis ' + h.or(v.variants, 3) + ' variasi copy untuk media di atas.');
          b.task.push('Gunakan kerangka ' + h.or(v.framework, 'PAS') + ' sebagai tulang punggung argumen.');
          b.task.push('Setiap variasi harus punya pendekatan emosional yang berbeda, bukan sekadar ganti kata.');

          b.constraints.push('Gaya bahasa: ' + h.or(v.tone, 'Persuasif') + '.');
          b.constraints.push('Hanya gunakan klaim yang bisa didukung bukti di atas. Dilarang mengarang angka, testimoni, atau sertifikasi.');
          b.constraints.push('Hindari kata klise: "solusi terbaik", "nomor satu", "revolusioner", "terpercaya sejak dulu".');
          b.constraints.push('Bahasa Indonesia yang wajar diucapkan orang, bukan terjemahan kaku.');
          if (v.channel === 'Iklan Meta/Instagram') b.constraints.push('Primary text maksimal 125 karakter sebelum terpotong; headline maksimal 40 karakter.');
          if (v.channel === 'Iklan Google') b.constraints.push('Headline maksimal 30 karakter, deskripsi maksimal 90 karakter.');
          if (v.channel === 'TikTok script') b.constraints.push('Hook harus mengunci perhatian dalam 2 detik pertama.');
          h.push(b.constraints, v.extra, v.extra);

          b.output.push('Tampilkan sebagai daftar bernomor per variasi.');
          b.output.push('Tiap variasi berisi: Nama pendekatan, Headline, Body copy, CTA, dan satu kalimat alasan kenapa ini bekerja.');
          if (v.cta) b.output.push('CTA mengarah ke: ' + v.cta + '.');
          b.output.push('Tutup dengan rekomendasi variasi mana yang sebaiknya diuji lebih dulu beserta alasannya.');

          b.success.push('Pembaca sasaran merasa copy ini berbicara tentang masalah mereka sendiri, bukan tentang produknya.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'email',
        name: 'Email & Pesan Bisnis',
        desc: 'Email profesional, follow-up, negosiasi, dan pesan sulit.',
        tags: ['email', 'bisnis', 'komunikasi', 'surat'],
        fields: [
          { id: 'purpose', label: 'Tujuan email', type: 'textarea', required: true, wide: true,
            placeholder: 'mis. menagih invoice yang telat 3 minggu tanpa merusak hubungan' },
          { id: 'recipient', label: 'Penerima', type: 'text', placeholder: 'mis. manajer procurement klien lama' },
          { id: 'relation', label: 'Hubungan', type: 'select',
            options: ['Atasan', 'Rekan setara', 'Bawahan / tim', 'Klien', 'Vendor', 'Kandidat / pelamar', 'Belum kenal'],
            default: 'Klien' },
          { id: 'tone', label: 'Nada', type: 'select',
            options: ['Formal', 'Profesional hangat', 'Santai profesional', 'Tegas', 'Meminta maaf', 'Mendesak tapi sopan'],
            default: 'Profesional hangat' },
          { id: 'background', label: 'Latar belakang', type: 'textarea', wide: true,
            placeholder: 'Riwayat singkat: apa yang sudah terjadi sebelumnya.' },
          { id: 'ask', label: 'Yang diminta dari penerima', type: 'text', wide: true,
            placeholder: 'mis. konfirmasi tanggal pembayaran sebelum Jumat' },
          { id: 'length', label: 'Panjang', type: 'select', options: ['Sangat singkat (3-4 kalimat)', 'Singkat', 'Sedang', 'Detail'], default: 'Singkat' },
          { id: 'opts', label: 'Tambahan', type: 'multi',
            options: ['Beri 3 opsi subjek email', 'Sertakan versi lebih tegas', 'Sertakan versi lebih lembut', 'Siapkan balasan untuk penolakan', 'Sertakan versi Bahasa Inggris'],
            default: ['Beri 3 opsi subjek email'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah profesional yang piawai menulis email bisnis: jelas, singkat, sopan, ' +
            'dan tetap mendapatkan apa yang dibutuhkan tanpa membuat penerima defensif.';

          h.push(b.context, v.recipient, 'Penerima: ' + v.recipient + '.');
          b.context.push('Hubungan dengan penerima: ' + h.or(v.relation, 'Klien') + '.');
          h.push(b.context, v.background, 'Latar belakang: ' + v.background);

          b.task.push('Tulis email dengan tujuan: ' + h.or(v.purpose, '(isi tujuan)'));
          h.push(b.task, v.ask, 'Permintaan konkret yang harus tersampaikan: ' + v.ask + '.');

          b.constraints.push('Nada: ' + h.or(v.tone, 'Profesional hangat') + '. Panjang: ' + h.or(v.length, 'Singkat') + '.');
          b.constraints.push('Langsung ke inti pada dua kalimat pertama. Tanpa basa-basi panjang.');
          b.constraints.push('Satu email, satu permintaan utama. Jangan menumpuk banyak permintaan.');
          b.constraints.push('Jangan mengarang detail yang tidak diberikan; gunakan [PLACEHOLDER] bila ada informasi yang kurang.');
          h.push(b.constraints, v.extra, v.extra);

          if (h.has(v.opts, 'Beri 3 opsi subjek email')) b.output.push('Awali dengan 3 pilihan subjek email.');
          b.output.push('Tulis badan email lengkap dengan salam pembuka dan penutup.');
          if (h.has(v.opts, 'Sertakan versi lebih tegas')) b.output.push('Tambahkan versi alternatif dengan nada lebih tegas.');
          if (h.has(v.opts, 'Sertakan versi lebih lembut')) b.output.push('Tambahkan versi alternatif dengan nada lebih lembut.');
          if (h.has(v.opts, 'Siapkan balasan untuk penolakan')) b.output.push('Tambahkan draf balasan singkat seandainya penerima menolak atau menunda.');
          if (h.has(v.opts, 'Sertakan versi Bahasa Inggris')) b.output.push('Sertakan terjemahan Bahasa Inggris dari versi utama.');

          b.success.push('Penerima tahu persis apa yang harus dilakukan dan kapan, hanya dengan sekali baca.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'summary',
        name: 'Ringkasan & Ekstraksi',
        desc: 'Meringkas dokumen panjang atau menarik data terstruktur.',
        tags: ['ringkasan', 'summary', 'ekstraksi', 'notulen', 'analisis'],
        fields: [
          { id: 'source', label: 'Teks sumber', type: 'textarea', required: true, wide: true,
            placeholder: 'Tempel dokumen, transkrip, atau artikel di sini.',
            hint: 'Bisa juga ditulis [TEKS DISISIPKAN DI SINI] jika sumbernya dilampirkan terpisah.' },
          { id: 'kind', label: 'Jenis sumber', type: 'select',
            options: ['Artikel / laporan', 'Transkrip rapat', 'Transkrip wawancara', 'Dokumen legal / kontrak',
              'Paper ilmiah', 'Ulasan pelanggan', 'Thread diskusi', 'Lainnya'], default: 'Artikel / laporan' },
          { id: 'mode', label: 'Bentuk hasil', type: 'select',
            options: ['Ringkasan naratif', 'Poin-poin utama', 'Notulen + action item', 'Tabel terstruktur',
              'JSON terstruktur', 'Ringkasan berlapis (1 kalimat / 1 paragraf / 1 halaman)'], default: 'Poin-poin utama' },
          { id: 'focus', label: 'Fokus ekstraksi', type: 'textarea', wide: true,
            placeholder: 'mis. hanya ambil keputusan, tenggat, dan penanggung jawab' },
          { id: 'ratio', label: 'Tingkat pemadatan', type: 'select',
            options: ['Sangat padat (~5%)', 'Padat (~10%)', 'Sedang (~25%)', 'Longgar (~40%)'], default: 'Padat (~10%)' },
          { id: 'opts', label: 'Tambahan', type: 'multi',
            options: ['Sertakan kutipan pendukung', 'Tandai poin yang ambigu', 'Pisahkan fakta vs opini',
              'Urutkan berdasarkan prioritas', 'Sebutkan yang TIDAK dibahas'],
            default: ['Tandai poin yang ambigu'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah analis yang teliti dalam memadatkan informasi tanpa kehilangan nuansa penting.';

          b.context.push('Jenis sumber: ' + h.or(v.kind, 'Artikel / laporan') + '.');
          b.context.push('Teks sumber:\n"""\n' + h.or(v.source, '[TEKS DISISIPKAN DI SINI]') + '\n"""');

          b.task.push('Ringkas teks sumber di atas menjadi ' + h.or(v.mode, 'poin-poin utama') + '.');
          h.push(b.task, v.focus, 'Fokus khusus: ' + v.focus);

          b.constraints.push('Tingkat pemadatan: ' + h.or(v.ratio, 'Padat (~10%)') + ' dari panjang asli.');
          b.constraints.push('Hanya gunakan informasi yang benar-benar ada di teks sumber. Dilarang menambah pengetahuan luar.');
          b.constraints.push('Pertahankan angka, nama, dan tanggal persis seperti aslinya.');
          if (h.has(v.opts, 'Pisahkan fakta vs opini')) b.constraints.push('Bedakan secara eksplisit mana pernyataan fakta dan mana opini penulis.');
          if (h.has(v.opts, 'Tandai poin yang ambigu')) b.constraints.push('Beri tanda [AMBIGU] pada bagian yang tidak jelas di sumber, jangan ditebak.');
          h.push(b.constraints, v.extra, v.extra);

          if (v.mode === 'JSON terstruktur') b.output.push('Keluarkan JSON valid saja, tanpa teks pembungkus.');
          if (v.mode === 'Notulen + action item') b.output.push('Struktur: Ringkasan, Keputusan, Action item (tugas - penanggung jawab - tenggat), Isu terbuka.');
          if (v.mode === 'Ringkasan berlapis (1 kalimat / 1 paragraf / 1 halaman)') b.output.push('Tiga lapis ringkasan dengan judul jelas: TL;DR, Ringkasan, Detail.');
          if (h.has(v.opts, 'Sertakan kutipan pendukung')) b.output.push('Setiap poin utama disertai kutipan pendek dari sumber sebagai bukti.');
          if (h.has(v.opts, 'Urutkan berdasarkan prioritas')) b.output.push('Urutkan poin dari yang paling berdampak.');
          if (h.has(v.opts, 'Sebutkan yang TIDAK dibahas')) b.output.push('Tutup dengan daftar singkat hal penting yang justru tidak dibahas di sumber.');

          b.success.push('Orang yang belum membaca sumber aslinya bisa mengambil keputusan dari ringkasan ini.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'translate',
        name: 'Terjemahan & Lokalisasi',
        desc: 'Terjemahan yang menyesuaikan budaya, bukan kata per kata.',
        tags: ['terjemahan', 'translate', 'lokalisasi', 'bahasa'],
        fields: [
          { id: 'source', label: 'Teks yang diterjemahkan', type: 'textarea', required: true, wide: true },
          { id: 'from', label: 'Dari bahasa', type: 'text', default: 'Bahasa Indonesia' },
          { id: 'to', label: 'Ke bahasa', type: 'text', default: 'Bahasa Inggris' },
          { id: 'domain', label: 'Bidang', type: 'select',
            options: ['Umum', 'Bisnis / korporat', 'Teknis / IT', 'Hukum', 'Medis', 'Pemasaran', 'Sastra / kreatif', 'Akademik'],
            default: 'Umum' },
          { id: 'register', label: 'Tingkat formalitas', type: 'select',
            options: ['Sangat formal', 'Formal', 'Netral', 'Kasual', 'Sangat kasual / gaul'], default: 'Netral' },
          { id: 'glossary', label: 'Istilah yang dipertahankan', type: 'tags',
            placeholder: 'nama merek, istilah teknis yang tidak boleh diterjemahkan' },
          { id: 'opts', label: 'Tambahan', type: 'multi',
            options: ['Sertakan teks asli berdampingan', 'Jelaskan pilihan terjemahan yang sulit',
              'Beri 2 alternatif untuk kalimat kunci', 'Sesuaikan idiom dengan budaya sasaran'],
            default: ['Sesuaikan idiom dengan budaya sasaran'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah penerjemah profesional bersertifikat yang menerjemahkan makna dan maksud, ' +
            'bukan sekadar mengganti kata.';
          b.context.push('Bidang teks: ' + h.or(v.domain, 'Umum') + '. Tingkat formalitas sasaran: ' + h.or(v.register, 'Netral') + '.');
          b.context.push('Teks sumber:\n"""\n' + h.or(v.source, '[TEKS]') + '\n"""');
          b.task.push('Terjemahkan teks di atas dari ' + h.or(v.from, 'Bahasa Indonesia') + ' ke ' + h.or(v.to, 'Bahasa Inggris') + '.');
          b.constraints.push('Hasil harus terdengar seperti ditulis langsung oleh penutur asli, bukan hasil terjemahan.');
          var g = h.split(v.glossary);
          if (g.length) b.constraints.push('Jangan terjemahkan istilah berikut, pertahankan apa adanya: ' + g.join(', ') + '.');
          b.constraints.push('Pertahankan format asli: paragraf, daftar, penekanan, dan tanda baca khas.');
          if (h.has(v.opts, 'Sesuaikan idiom dengan budaya sasaran'))
            b.constraints.push('Ganti idiom dan referensi budaya dengan padanan yang dikenal pembaca sasaran.');
          h.push(b.constraints, v.extra, v.extra);
          if (h.has(v.opts, 'Sertakan teks asli berdampingan')) b.output.push('Tampilkan tabel dua kolom: teks asli dan terjemahan, dipisah per paragraf.');
          if (h.has(v.opts, 'Jelaskan pilihan terjemahan yang sulit')) b.output.push('Tambahkan catatan penerjemah untuk bagian yang punya lebih dari satu tafsir.');
          if (h.has(v.opts, 'Beri 2 alternatif untuk kalimat kunci')) b.output.push('Untuk judul dan kalimat kunci, berikan dua alternatif terjemahan.');
          b.success.push('Pembaca asli bahasa sasaran tidak bisa menebak bahwa teks ini hasil terjemahan.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'research',
        name: 'Riset & Analisis',
        desc: 'Analisis mendalam, perbandingan, dan pengambilan keputusan.',
        tags: ['riset', 'analisis', 'strategi', 'keputusan', 'perbandingan'],
        fields: [
          { id: 'question', label: 'Pertanyaan riset', type: 'textarea', required: true, wide: true,
            placeholder: 'mis. apakah lebih baik membangun tim internal atau outsourcing untuk customer support?' },
          { id: 'context', label: 'Konteks situasi', type: 'textarea', wide: true,
            placeholder: 'Ukuran perusahaan, anggaran, batas waktu, kondisi pasar.' },
          { id: 'method', label: 'Pendekatan analisis', type: 'select',
            options: ['Pro & kontra', 'SWOT', 'Analisis biaya-manfaat', 'Matriks keputusan berbobot',
              'First principles', 'Skenario terbaik/terburuk/paling mungkin', 'Analisis akar masalah (5 Why)'],
            default: 'Pro & kontra' },
          { id: 'options', label: 'Opsi yang dibandingkan', type: 'tags', wide: true,
            placeholder: 'pisahkan dengan koma; kosongkan jika ingin model yang mengusulkan' },
          { id: 'criteria', label: 'Kriteria penilaian', type: 'tags', wide: true,
            placeholder: 'biaya, kecepatan, risiko, skalabilitas' },
          fLevel(),
          { id: 'opts', label: 'Tambahan', type: 'multi',
            options: ['Beri rekomendasi tegas', 'Sebutkan asumsi yang dipakai', 'Tandai tingkat keyakinan',
              'Sertakan argumen tandingan', 'Usulkan langkah 30 hari pertama', 'Sebutkan data yang perlu dicari'],
            default: ['Beri rekomendasi tegas', 'Sebutkan asumsi yang dipakai'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah analis strategi yang jujur dan tidak menyenangkan hati. Kamu memisahkan ' +
            'fakta dari asumsi, dan kamu berani memberi rekomendasi meski tidak populer.';
          h.push(b.context, v.context, v.context);
          b.context.push('Tingkat kedalaman pembaca: ' + h.or(v.level, 'Umum') + '.');
          var opts = h.split(v.options);
          if (opts.length) b.context.push('Opsi yang sedang dipertimbangkan: ' + opts.join(', ') + '.');
          var crit = h.split(v.criteria);
          if (crit.length) b.context.push('Kriteria penilaian: ' + crit.join(', ') + '.');

          b.task.push('Jawab pertanyaan berikut secara analitis: ' + h.or(v.question, '(isi pertanyaan)'));
          b.task.push('Gunakan kerangka ' + h.or(v.method, 'Pro & kontra') + '.');
          if (!opts.length) b.task.push('Identifikasi sendiri opsi-opsi yang realistis sebelum menganalisis.');

          b.constraints.push('Bedakan dengan jelas antara fakta, asumsi, dan dugaan.');
          b.constraints.push('Jangan mengarang angka atau riset. Jika butuh data, sebut jenis data dan di mana biasanya dicari.');
          b.constraints.push('Hindari jawaban "tergantung" tanpa penjelasan; sebutkan tergantung faktor apa dan bagaimana faktor itu mengubah kesimpulan.');
          if (h.has(v.opts, 'Sertakan argumen tandingan')) b.constraints.push('Setelah rekomendasi, tulis argumen terkuat yang menentangnya.');
          h.push(b.constraints, v.extra, v.extra);

          b.output.push('Mulai dengan jawaban ringkas satu paragraf, baru uraikan analisisnya.');
          if (v.method === 'Matriks keputusan berbobot') b.output.push('Sertakan tabel matriks dengan bobot, skor per kriteria, dan total.');
          if (h.has(v.opts, 'Sebutkan asumsi yang dipakai')) b.output.push('Cantumkan daftar asumsi di bagian terpisah.');
          if (h.has(v.opts, 'Tandai tingkat keyakinan')) b.output.push('Beri label tingkat keyakinan (tinggi/sedang/rendah) pada setiap kesimpulan.');
          if (h.has(v.opts, 'Beri rekomendasi tegas')) b.output.push('Tutup dengan satu rekomendasi tunggal yang tegas, bukan daftar pilihan.');
          if (h.has(v.opts, 'Usulkan langkah 30 hari pertama')) b.output.push('Tambahkan rencana aksi 30 hari pertama.');
          if (h.has(v.opts, 'Sebutkan data yang perlu dicari')) b.output.push('Sebutkan data apa yang perlu dikumpulkan untuk menaikkan keyakinan.');

          b.success.push('Pembaca bisa mengambil keputusan hari ini juga, dan tahu apa yang bisa membatalkan keputusan itu.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'social',
        name: 'Konten Media Sosial',
        desc: 'Caption, thread, carousel, dan naskah video pendek.',
        tags: ['sosmed', 'instagram', 'tiktok', 'linkedin', 'twitter', 'caption'],
        fields: [
          { id: 'topic', label: 'Topik / pesan utama', type: 'textarea', required: true, wide: true },
          { id: 'platform', label: 'Platform', type: 'select',
            options: ['Instagram (caption)', 'Instagram (carousel)', 'TikTok / Reels (script)', 'LinkedIn',
              'X / Twitter (thread)', 'Facebook', 'YouTube (deskripsi)', 'Threads'], default: 'Instagram (caption)' },
          fAudience(),
          fTone(),
          { id: 'goal', label: 'Tujuan', type: 'select',
            options: ['Menaikkan awareness', 'Mendorong interaksi', 'Mengarahkan ke link', 'Membangun personal branding', 'Menjual langsung'],
            default: 'Mendorong interaksi' },
          { id: 'count', label: 'Jumlah konten', type: 'range', min: 1, max: 10, default: 3 },
          { id: 'opts', label: 'Tambahan', type: 'multi',
            options: ['Sertakan hook alternatif', 'Sertakan hashtag', 'Sertakan ide visual', 'Sertakan CTA di akhir',
              'Tanpa emoji', 'Sertakan pertanyaan pemancing komentar'],
            default: ['Sertakan hook alternatif', 'Sertakan CTA di akhir'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah social media strategist yang paham bahwa detik pertama menentukan segalanya, ' +
            'dan bahwa konten yang baik memberi nilai sebelum meminta apapun.';
          b.context.push('Platform: ' + h.or(v.platform, 'Instagram') + '. Tujuan: ' + h.or(v.goal, 'Mendorong interaksi') + '.');
          h.push(b.context, v.audience, 'Audiens: ' + v.audience + '.');
          b.task.push('Buat ' + h.or(v.count, 3) + ' konten dengan pesan utama: ' + h.or(v.topic, '(isi topik)'));
          b.constraints.push('Gaya bahasa: ' + h.or(v.tone, 'Santai & akrab') + '.');
          b.constraints.push('Kalimat pertama harus berdiri sendiri sebagai hook yang membuat orang berhenti scroll.');
          if (/TikTok/.test(v.platform)) b.constraints.push('Naskah untuk video 30-45 detik, tulis dalam bahasa lisan yang enak diucapkan.');
          if (/carousel/.test(v.platform)) b.constraints.push('Pecah menjadi 6-8 slide, satu ide per slide, teks per slide maksimal 20 kata.');
          if (/LinkedIn/.test(v.platform)) b.constraints.push('Tiga baris pertama menentukan apakah orang klik "lihat selengkapnya". Hindari nada jualan.');
          if (/thread/.test(v.platform)) b.constraints.push('Tiap tweet berdiri sendiri namun menarik ke tweet berikutnya. Maksimal 280 karakter per tweet.');
          if (h.has(v.opts, 'Tanpa emoji')) b.constraints.push('Jangan gunakan emoji sama sekali.');
          b.constraints.push('Jangan mengarang statistik atau klaim yang tidak bisa dibuktikan.');
          h.push(b.constraints, v.extra, v.extra);
          b.output.push('Nomori setiap konten dan beri label pendekatan yang dipakai.');
          if (h.has(v.opts, 'Sertakan hook alternatif')) b.output.push('Sertakan 3 alternatif kalimat pembuka untuk tiap konten.');
          if (h.has(v.opts, 'Sertakan ide visual')) b.output.push('Tambahkan saran visual/footage yang cocok untuk tiap konten.');
          if (h.has(v.opts, 'Sertakan hashtag')) b.output.push('Sertakan 8-12 hashtag campuran (besar, menengah, niche) di bagian terpisah.');
          if (h.has(v.opts, 'Sertakan CTA di akhir')) b.output.push('Akhiri tiap konten dengan satu CTA yang spesifik.');
          if (h.has(v.opts, 'Sertakan pertanyaan pemancing komentar')) b.output.push('Sertakan satu pertanyaan terbuka untuk memancing komentar.');
          b.success.push('Konten memberi nilai nyata meski pembaca tidak pernah membeli apapun.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'story',
        name: 'Cerita & Naskah Kreatif',
        desc: 'Fiksi, naskah, dongeng, dan pengembangan karakter.',
        tags: ['cerita', 'fiksi', 'naskah', 'kreatif', 'novel'],
        fields: [
          { id: 'premise', label: 'Premis cerita', type: 'textarea', required: true, wide: true,
            placeholder: 'mis. seorang penjaga mercusuar menemukan surat dari dirinya sendiri 20 tahun lalu' },
          { id: 'form', label: 'Bentuk', type: 'select',
            options: ['Cerita pendek', 'Bab novel', 'Naskah film / skenario', 'Naskah drama panggung',
              'Dongeng anak', 'Puisi', 'Flash fiction (<500 kata)', 'Outline cerita'], default: 'Cerita pendek' },
          { id: 'genre', label: 'Genre', type: 'select',
            options: ['Drama', 'Fiksi ilmiah', 'Fantasi', 'Misteri / thriller', 'Horor', 'Romansa',
              'Komedi', 'Realisme magis', 'Sejarah', 'Slice of life'], default: 'Drama' },
          { id: 'pov', label: 'Sudut pandang', type: 'select',
            options: ['Orang pertama', 'Orang ketiga terbatas', 'Orang ketiga serba tahu', 'Orang kedua'], default: 'Orang ketiga terbatas' },
          { id: 'setting', label: 'Latar', type: 'text', wide: true, placeholder: 'tempat dan waktu' },
          { id: 'chars', label: 'Karakter utama', type: 'textarea', wide: true,
            placeholder: 'Nama, keinginan, dan hal yang menghalanginya.' },
          { id: 'tone', label: 'Nuansa', type: 'select',
            options: ['Hangat', 'Muram', 'Menegangkan', 'Jenaka', 'Melankolis', 'Epik', 'Absurd', 'Tenang kontemplatif'],
            default: 'Melankolis' },
          { id: 'length', label: 'Panjang', type: 'select', options: ['300-500 kata', '500-1000 kata', '1000-2000 kata', '2000+ kata'], default: '1000-2000 kata' },
          { id: 'opts', label: 'Teknik yang diminta', type: 'multi',
            options: ['Show, don\'t tell', 'Buka dengan aksi (in medias res)', 'Akhir terbuka', 'Twist di akhir',
              'Dialog dominan', 'Deskripsi indrawi kaya', 'Hindari klise genre'],
            default: ['Show, don\'t tell', 'Hindari klise genre'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah penulis fiksi yang percaya bahwa detail konkret mengalahkan kata sifat, ' +
            'dan bahwa pembaca lebih pintar dari yang penulis kira.';
          b.context.push('Genre: ' + h.or(v.genre, 'Drama') + '. Nuansa: ' + h.or(v.tone, 'Melankolis') + '.');
          h.push(b.context, v.setting, 'Latar: ' + v.setting + '.');
          h.push(b.context, v.chars, 'Karakter: ' + v.chars);
          b.task.push('Tulis ' + h.or(v.form, 'cerita pendek').toLowerCase() + ' berdasarkan premis: ' + h.or(v.premise, '(isi premis)'));
          b.constraints.push('Sudut pandang: ' + h.or(v.pov, 'Orang ketiga terbatas') + '. Panjang: ' + h.or(v.length, '1000-2000 kata') + '.');
          if (h.has(v.opts, 'Show, don\'t tell')) b.constraints.push('Tunjukkan emosi lewat tindakan, dialog, dan detail fisik. Jangan menyebut nama emosinya.');
          if (h.has(v.opts, 'Buka dengan aksi (in medias res)')) b.constraints.push('Mulai di tengah kejadian, bukan dengan penjelasan latar.');
          if (h.has(v.opts, 'Akhir terbuka')) b.constraints.push('Akhiri dengan ketidakpastian yang disengaja, bukan penyelesaian rapi.');
          if (h.has(v.opts, 'Twist di akhir')) b.constraints.push('Siapkan petunjuk sejak awal agar twist terasa adil, bukan mendadak.');
          if (h.has(v.opts, 'Dialog dominan')) b.constraints.push('Lebih dari separuh teks berupa dialog yang mengungkap karakter.');
          if (h.has(v.opts, 'Deskripsi indrawi kaya')) b.constraints.push('Libatkan minimal tiga indra selain penglihatan.');
          if (h.has(v.opts, 'Hindari klise genre')) b.constraints.push('Hindari klise genre yang sudah usang; cari sudut yang belum sering dipakai.');
          b.constraints.push('Hindari kalimat pembuka yang menjelaskan cuaca atau bangun tidur.');
          h.push(b.constraints, v.extra, v.extra);
          if (v.form === 'Naskah film / skenario') b.output.push('Gunakan format skenario standar: SLUGLINE, aksi, nama karakter, dialog.');
          if (v.form === 'Outline cerita') b.output.push('Susun outline per adegan: tujuan adegan, konflik, dan perubahan yang terjadi.');
          b.output.push('Tulis prosa langsung tanpa pengantar atau penjelasan dari penulis.');
          b.success.push('Ada minimal satu kalimat yang ingin dibaca ulang oleh pembaca.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'edit',
        name: 'Edit & Perbaiki Tulisan',
        desc: 'Menyunting draf agar lebih tajam, jelas, dan enak dibaca.',
        tags: ['edit', 'proofread', 'revisi', 'perbaiki'],
        fields: [
          { id: 'draft', label: 'Draf yang diedit', type: 'textarea', required: true, wide: true },
          { id: 'depth', label: 'Kedalaman penyuntingan', type: 'select',
            options: ['Proofread (ejaan & tanda baca saja)', 'Line edit (kalimat per kalimat)',
              'Copy edit (kejelasan & konsistensi)', 'Developmental edit (struktur & argumen)'],
            default: 'Line edit (kalimat per kalimat)' },
          { id: 'goal', label: 'Sasaran perbaikan', type: 'multi', wide: true,
            options: ['Lebih ringkas', 'Lebih jelas', 'Lebih persuasif', 'Lebih formal', 'Lebih santai',
              'Hilangkan pengulangan', 'Perbaiki alur logika', 'Perkuat pembuka & penutup', 'Konsisten istilah'],
            default: ['Lebih jelas', 'Lebih ringkas'] },
          fAudience(),
          { id: 'keep', label: 'Yang tidak boleh diubah', type: 'textarea', wide: true,
            placeholder: 'mis. istilah teknis, nama produk, struktur bab' },
          { id: 'opts', label: 'Bentuk hasil', type: 'multi',
            options: ['Tampilkan versi bersih', 'Tampilkan daftar perubahan + alasan', 'Tandai bagian yang dihapus',
              'Beri catatan untuk penulis', 'Beri skor sebelum & sesudah'],
            default: ['Tampilkan versi bersih', 'Tampilkan daftar perubahan + alasan'] },
          fExtra()
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah editor berpengalaman yang menghormati suara penulis. Kamu memotong tanpa ampun, ' +
            'tapi tidak pernah mengganti gaya penulis dengan gayamu sendiri.';
          h.push(b.context, v.audience, 'Tulisan ini ditujukan untuk: ' + v.audience + '.');
          b.context.push('Draf:\n"""\n' + h.or(v.draft, '[DRAF]') + '\n"""');
          b.task.push('Lakukan ' + h.or(v.depth, 'line edit') + ' pada draf di atas.');
          var goals = Array.isArray(v.goal) ? v.goal : [];
          if (goals.length) b.task.push('Sasaran perbaikan: ' + goals.join(', ') + '.');
          b.constraints.push('Pertahankan suara dan kepribadian penulis. Jangan menyeragamkan menjadi bahasa korporat.');
          b.constraints.push('Jangan menambahkan informasi, klaim, atau contoh baru yang tidak ada di draf.');
          h.push(b.constraints, v.keep, 'Jangan ubah: ' + v.keep);
          h.push(b.constraints, v.extra, v.extra);
          if (h.has(v.opts, 'Tampilkan versi bersih')) b.output.push('Bagian 1: versi final yang sudah bersih dan siap pakai.');
          if (h.has(v.opts, 'Tampilkan daftar perubahan + alasan')) b.output.push('Bagian 2: tabel perubahan berisi kalimat asli, kalimat baru, dan alasan.');
          if (h.has(v.opts, 'Tandai bagian yang dihapus')) b.output.push('Tandai teks yang dibuang beserta alasan kenapa tidak diperlukan.');
          if (h.has(v.opts, 'Beri catatan untuk penulis')) b.output.push('Tambahkan catatan editor: pola kesalahan yang berulang dan cara menghindarinya.');
          if (h.has(v.opts, 'Beri skor sebelum & sesudah')) b.output.push('Beri skor kejelasan, keringkasan, dan daya pikat (0-10) sebelum dan sesudah edit.');
          b.success.push('Versi hasil edit lebih pendek namun menyampaikan lebih banyak.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'custom',
        name: 'Prompt Kustom (Bebas)',
        desc: 'Kerangka kosong untuk kebutuhan apa pun yang belum ada templatenya.',
        tags: ['custom', 'bebas', 'umum', 'apa saja'],
        fields: [
          { id: 'role', label: 'Peran yang dimainkan model', type: 'text', wide: true,
            placeholder: 'mis. konsultan pajak untuk usaha kecil di Indonesia' },
          { id: 'task', label: 'Tugas yang diminta', type: 'textarea', required: true, wide: true,
            placeholder: 'Jelaskan sedetail mungkin apa yang harus dikerjakan.' },
          { id: 'context', label: 'Konteks & latar', type: 'textarea', wide: true,
            placeholder: 'Situasi, data yang tersedia, siapa yang akan memakai hasilnya.' },
          { id: 'constraints', label: 'Batasan & aturan', type: 'textarea', wide: true,
            placeholder: 'Satu aturan per baris.' },
          { id: 'output', label: 'Format output yang diinginkan', type: 'textarea', wide: true,
            placeholder: 'mis. tabel Markdown dengan kolom A, B, C' },
          { id: 'examples', label: 'Contoh (few-shot)', type: 'textarea', wide: true,
            placeholder: 'Contoh input dan output yang diharapkan.' },
          { id: 'success', label: 'Kriteria berhasil', type: 'textarea', wide: true,
            placeholder: 'Hasil dianggap baik jika ...' },
          { id: 'think', label: 'Minta model berpikir bertahap', type: 'toggle', default: true },
          { id: 'ask', label: 'Boleh bertanya jika informasi kurang', type: 'toggle', default: false }
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          if (v.role) b.role = 'Kamu adalah ' + v.role.replace(/^kamu adalah\s*/i, '') + '.';
          b.context = h.clean(String(v.context || '').split('\n'));
          b.task = h.clean(String(v.task || '').split('\n'));
          b.constraints = h.clean(String(v.constraints || '').split('\n'));
          b.output = h.clean(String(v.output || '').split('\n'));
          b.success = h.clean(String(v.success || '').split('\n'));
          b.examples = String(v.examples || '').trim();
          if (v.think) b.constraints.push('Pikirkan langkah demi langkah sebelum menjawab, lalu tampilkan hanya kesimpulan yang rapi.');
          if (v.ask) b.constraints.push('Jika ada informasi penting yang kurang, ajukan pertanyaan klarifikasi lebih dulu sebelum mengerjakan.');
          return b;
        }
      }

    ]
  });

})(window.PG);
