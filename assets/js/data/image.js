/* ==========================================================================
   data/image.js — kategori "Gambar"
   Menghasilkan prompt baris tunggal + negative prompt + parameter engine.
   ========================================================================== */

(function (PG) {
  'use strict';
  var h = PG.h, M = PG.MOD;

  var ENGINES = ['Midjourney', 'Stable Diffusion / Flux', 'DALL·E / GPT Image', 'Ideogram', 'Leonardo', 'Umum (semua engine)'];

  var SD_SIZE = {
    '1:1': '1024x1024', '4:3': '1152x896', '3:4': '896x1152', '16:9': '1344x768',
    '9:16': '768x1344', '3:2': '1216x832', '2:3': '832x1216', '21:9': '1536x640',
    '4:5': '912x1144', '5:4': '1144x912'
  };

  /* Blok field yang dipakai semua template gambar. */
  function visualFields() {
    return [
      { section: 'Gaya visual', id: 'style', label: 'Gaya / medium', type: 'multi', wide: true, options: M.styles },
      { section: 'Gaya visual', id: 'lighting', label: 'Pencahayaan', type: 'multi', wide: true, options: M.lighting },
      { section: 'Gaya visual', id: 'camera', label: 'Kamera & lensa', type: 'multi', wide: true, options: M.camera },
      { section: 'Gaya visual', id: 'composition', label: 'Komposisi', type: 'multi', wide: true, options: M.composition },
      { section: 'Gaya visual', id: 'mood', label: 'Suasana', type: 'multi', wide: true, options: M.mood },
      { section: 'Gaya visual', id: 'colors', label: 'Palet warna', type: 'multi', wide: true, options: M.colors },
      { section: 'Gaya visual', id: 'quality', label: 'Penguat kualitas', type: 'multi', wide: true,
        options: M.quality, default: ['highly detailed', 'sharp focus'] },
      { section: 'Gaya visual', id: 'refs', label: 'Referensi gaya tambahan', type: 'text', wide: true,
        placeholder: 'mis. in the style of vintage travel posters',
        hint: 'Hindari menyebut nama seniman yang masih hidup; gunakan deskripsi gaya.' },

      { section: 'Teknis', id: 'engine', label: 'Engine tujuan', type: 'select', options: ENGINES, default: 'Midjourney' },
      { section: 'Teknis', id: 'aspect', label: 'Rasio aspek', type: 'select', options: M.aspect, default: '1:1' },
      { section: 'Teknis', id: 'mjv', label: 'Versi Midjourney', type: 'select',
        options: ['--v 7', '--v 6.1', '--niji 6', '(tanpa versi)'], default: '--v 7' },
      { section: 'Teknis', id: 'stylize', label: 'Stylize (Midjourney)', type: 'range', min: 0, max: 1000, step: 50, default: 100 },
      { section: 'Teknis', id: 'chaos', label: 'Chaos / variasi', type: 'range', min: 0, max: 100, step: 5, default: 0 },
      { section: 'Teknis', id: 'steps', label: 'Steps (SD/Flux)', type: 'range', min: 10, max: 60, step: 5, default: 30 },
      { section: 'Teknis', id: 'cfg', label: 'CFG scale (SD/Flux)', type: 'range', min: 1, max: 20, step: 1, default: 7 },
      { section: 'Teknis', id: 'seed', label: 'Seed', type: 'text', placeholder: 'kosongkan untuk acak' },
      { section: 'Teknis', id: 'negPreset', label: 'Preset negative', type: 'multi', wide: true,
        options: Object.keys(M.negativePresets), default: ['Umum'] },
      { section: 'Teknis', id: 'negCustom', label: 'Negative tambahan', type: 'text', wide: true,
        placeholder: 'pisahkan dengan koma' },
      { section: 'Teknis', id: 'extra', label: 'Tambahan bebas di akhir prompt', type: 'text', wide: true }
    ];
  }

  function negativeText(v) {
    var parts = [];
    (v.negPreset || []).forEach(function (k) { if (M.negativePresets[k]) parts.push(M.negativePresets[k]); });
    if (v.negCustom) parts.push(v.negCustom);
    return h.csv(parts.join(', ').split(','));
  }

  /**
   * Rakit prompt visual: gabungkan bagian inti dengan modifier, lalu
   * susun parameter sesuai engine yang dipilih.
   * @param {object} v nilai form
   * @param {Array} core potongan deskriptif khas template
   */
  function buildVisual(v, core, roleHint) {
    var engine = h.or(v.engine, 'Midjourney');
    var neg = negativeText(v);

    var bits = core.concat([
      h.csv(v.style), h.csv(v.composition), h.csv(v.lighting), h.csv(v.camera),
      h.csv(v.mood), h.csv(v.colors), v.refs, h.csv(v.quality), v.extra
    ]);

    var raw = h.line(bits);
    var params = [];
    var negativeOut = '';

    if (engine === 'Midjourney') {
      params.push('--ar ' + h.or(v.aspect, '1:1'));
      if (v.mjv && v.mjv !== '(tanpa versi)') params.push(v.mjv);
      if (Number(v.stylize) !== 100) params.push('--stylize ' + v.stylize);
      if (Number(v.chaos) > 0) params.push('--chaos ' + v.chaos);
      if (v.seed) params.push('--seed ' + v.seed);
      if (neg) params.push('--no ' + neg);
    } else if (engine === 'Stable Diffusion / Flux' || engine === 'Leonardo') {
      negativeOut = neg;
      params.push('Size: ' + (SD_SIZE[v.aspect] || '1024x1024') + ' (' + h.or(v.aspect, '1:1') + ')');
      params.push('Steps: ' + h.or(v.steps, 30));
      params.push('CFG scale: ' + h.or(v.cfg, 7));
      params.push('Sampler: DPM++ 2M Karras');
      params.push('Seed: ' + h.or(v.seed, '-1'));
    } else if (engine === 'DALL·E / GPT Image') {
      raw = raw + (neg ? '. Hindari: ' + neg : '');
      params.push('Rasio: ' + h.or(v.aspect, '1:1'));
    } else if (engine === 'Ideogram') {
      negativeOut = neg;
      params.push('Aspect ratio: ' + h.or(v.aspect, '1:1'));
      params.push('Magic Prompt: off');
      if (v.seed) params.push('Seed: ' + v.seed);
    } else {
      negativeOut = neg;
      params.push('Rasio: ' + h.or(v.aspect, '1:1'));
      if (v.seed) params.push('Seed: ' + v.seed);
    }

    return {
      role: roleHint || 'Kamu adalah art director yang menulis prompt gambar secara presisi.',
      context: ['Engine tujuan: ' + engine + '.'],
      task: ['Hasilkan gambar sesuai deskripsi berikut.'],
      output: ['Satu gambar sesuai rasio ' + h.or(v.aspect, '1:1') + '.'],
      raw: raw,
      negative: negativeOut,
      params: params.join(engine === 'Midjourney' ? ' ' : ', ')
    };
  }

  function T(def) {
    def.fields = (def.fields || []).map(function (f) {
      if (!f.section) f.section = 'Subjek';
      return f;
    }).concat(visualFields());
    return def;
  }

  PG.registerCategory({
    id: 'image',
    name: 'Gambar',
    icon: '🎨',
    desc: 'Prompt untuk Midjourney, Stable Diffusion, Flux, DALL·E, dan Ideogram.',
    defaultFormat: 'raw',
    templates: [

      T({
        id: 'photo',
        name: 'Fotografi Realistis',
        desc: 'Foto yang terlihat seperti diambil kamera sungguhan.',
        tags: ['foto', 'realistis', 'fotografi', 'photo'],
        fields: [
          { id: 'subject', label: 'Subjek utama', type: 'textarea', required: true, wide: true,
            placeholder: 'mis. seorang nelayan tua memperbaiki jala di dermaga kayu' },
          { id: 'action', label: 'Aksi / momen', type: 'text', wide: true,
            placeholder: 'apa yang sedang terjadi saat ini' },
          { id: 'place', label: 'Lokasi & waktu', type: 'text', wide: true,
            placeholder: 'mis. pelabuhan kecil di Flores, pagi berkabut' },
          { id: 'details', label: 'Detail penting', type: 'textarea', wide: true,
            placeholder: 'pakaian, tekstur, benda di sekitar, cuaca' },
          { id: 'film', label: 'Kesan film', type: 'select',
            options: ['(tanpa)', 'analog film grain', 'digital clean', 'polaroid', 'black and white documentary', 'cross processed'],
            default: '(tanpa)' }
        ],
        build: function (v) {
          var core = [
            h.or(v.subject, 'subjek'),
            v.action, v.place, v.details,
            (v.film && v.film !== '(tanpa)') ? v.film : ''
          ];
          if (!h.csv(v.style)) core.push('photorealistic, editorial photography');
          return buildVisual(v, core,
            'Kamu adalah fotografer editorial yang memperhatikan cahaya, momen, dan detail kecil.');
        }
      }),

      T({
        id: 'illustration',
        name: 'Ilustrasi & Seni Digital',
        desc: 'Ilustrasi, konsep seni, dan gaya artistik.',
        tags: ['ilustrasi', 'seni', 'art', 'digital', 'gambar'],
        fields: [
          { id: 'subject', label: 'Subjek utama', type: 'textarea', required: true, wide: true },
          { id: 'story', label: 'Cerita di balik gambar', type: 'textarea', wide: true,
            placeholder: 'Apa yang ingin dirasakan penonton?' },
          { id: 'elements', label: 'Elemen yang harus ada', type: 'tags', wide: true },
          { id: 'linework', label: 'Karakter garis', type: 'select',
            options: ['(bebas)', 'bold outlines', 'thin delicate linework', 'no outlines, soft shapes', 'rough sketchy lines', 'geometric precision'],
            default: '(bebas)' },
          { id: 'texture', label: 'Tekstur', type: 'select',
            options: ['(bebas)', 'smooth flat colors', 'grainy paper texture', 'canvas texture', 'halftone print', 'painterly brush strokes'],
            default: '(bebas)' }
        ],
        build: function (v) {
          var core = [
            h.or(v.subject, 'subjek'), v.story, h.csv(h.split(v.elements)),
            (v.linework !== '(bebas)') ? v.linework : '',
            (v.texture !== '(bebas)') ? v.texture : ''
          ];
          if (!h.csv(v.style)) core.push('digital illustration');
          return buildVisual(v, core, 'Kamu adalah ilustrator yang kuat dalam komposisi dan cerita visual.');
        }
      }),

      T({
        id: 'logo',
        name: 'Logo & Identitas Merek',
        desc: 'Logo, ikon, dan elemen identitas visual.',
        tags: ['logo', 'brand', 'ikon', 'identitas'],
        fields: [
          { id: 'brand', label: 'Nama merek', type: 'text', required: true, wide: true },
          { id: 'industry', label: 'Bidang usaha', type: 'text', wide: true, placeholder: 'mis. kopi specialty' },
          { id: 'concept', label: 'Konsep / simbol', type: 'textarea', wide: true,
            placeholder: 'mis. biji kopi yang membentuk gelombang laut' },
          { id: 'type', label: 'Jenis logo', type: 'select',
            options: ['Logomark (simbol saja)', 'Wordmark (teks saja)', 'Kombinasi simbol + teks', 'Emblem / badge', 'Monogram'],
            default: 'Logomark (simbol saja)' },
          { id: 'feel', label: 'Kesan yang diinginkan', type: 'tags', wide: true,
            placeholder: 'modern, hangat, terpercaya, playful' },
          { id: 'constraintsIn', label: 'Batasan teknis', type: 'multi', wide: true,
            options: ['Flat vector', 'Satu warna saja', 'Maksimal dua warna', 'Simetris', 'Bekerja dalam ukuran kecil',
              'Latar putih polos', 'Tanpa gradien', 'Tanpa teks'],
            default: ['Flat vector', 'Bekerja dalam ukuran kecil', 'Latar putih polos'] }
        ],
        build: function (v) {
          var cons = (v.constraintsIn || []).map(function (c) {
            return ({
              'Flat vector': 'flat vector logo', 'Satu warna saja': 'single color',
              'Maksimal dua warna': 'two color palette', 'Simetris': 'symmetrical balanced',
              'Bekerja dalam ukuran kecil': 'simple enough to read at small sizes',
              'Latar putih polos': 'plain white background', 'Tanpa gradien': 'no gradients',
              'Tanpa teks': 'no text, no letters'
            })[c] || c;
          });
          var core = [
            (v.type === 'Wordmark (teks saja)' || v.type === 'Kombinasi simbol + teks')
              ? 'logo for "' + h.or(v.brand, 'BRAND') + '"'
              : 'minimalist logo mark for a ' + h.or(v.industry, 'company') + ' brand named ' + h.or(v.brand, 'BRAND'),
            v.concept, h.csv(h.split(v.feel)), h.csv(cons), 'clean negative space, professional brand identity'
          ];
          var b = buildVisual(v, core, 'Kamu adalah desainer identitas merek yang berpikir dalam bentuk sederhana yang tahan lama.');
          b.output.push('Logo harus tetap terbaca ketika dicetak 16x16 piksel.');
          return b;
        }
      }),

      T({
        id: 'product',
        name: 'Foto Produk / Komersial',
        desc: 'Foto produk untuk katalog, iklan, dan marketplace.',
        tags: ['produk', 'komersial', 'katalog', 'iklan', 'jualan'],
        fields: [
          { id: 'product', label: 'Produk', type: 'textarea', required: true, wide: true,
            placeholder: 'mis. botol kaca minyak zaitun 250ml dengan label kraft' },
          { id: 'surface', label: 'Alas / latar', type: 'text', wide: true,
            placeholder: 'mis. meja marmer putih dengan bayangan lembut' },
          { id: 'props', label: 'Properti pendukung', type: 'tags', wide: true,
            placeholder: 'daun zaitun, kain linen, potongan roti' },
          { id: 'shot', label: 'Jenis pengambilan', type: 'select',
            options: ['Studio packshot', 'Lifestyle in use', 'Flat lay', 'Hero shot dramatis', 'Detail makro tekstur', 'Levitasi / floating'],
            default: 'Studio packshot' },
          { id: 'space', label: 'Ruang untuk teks', type: 'select',
            options: ['(tidak perlu)', 'Ruang kosong di kiri', 'Ruang kosong di kanan', 'Ruang kosong di atas', 'Ruang kosong di bawah'],
            default: '(tidak perlu)' }
        ],
        build: function (v) {
          var shot = {
            'Studio packshot': 'clean studio product photography, seamless background',
            'Lifestyle in use': 'lifestyle product photography, natural setting, in use',
            'Flat lay': 'flat lay top down product arrangement',
            'Hero shot dramatis': 'dramatic hero product shot, strong directional light',
            'Detail makro tekstur': 'extreme macro detail of product texture',
            'Levitasi / floating': 'product floating in mid air, dynamic composition'
          }[v.shot] || '';
          var core = [
            h.or(v.product, 'produk'), shot, v.surface, h.csv(h.split(v.props)),
            (v.space && v.space !== '(tidak perlu)') ? v.space.toLowerCase().replace('ruang kosong di ', 'negative space on the ')
              .replace('kiri', 'left').replace('kanan', 'right').replace('atas', 'top').replace('bawah', 'bottom') : '',
            'commercial photography, accurate product proportions, crisp label details'
          ];
          var b = buildVisual(v, core, 'Kamu adalah fotografer produk komersial yang menjaga akurasi bentuk dan warna produk.');
          b.constraints = ['Proporsi dan warna produk harus akurat, jangan diubah demi estetika.'];
          return b;
        }
      }),

      T({
        id: 'character',
        name: 'Karakter & Portrait',
        desc: 'Desain karakter, portrait, dan referensi visual orang.',
        tags: ['karakter', 'orang', 'portrait', 'wajah', 'tokoh'],
        fields: [
          { id: 'who', label: 'Siapa karakternya', type: 'textarea', required: true, wide: true,
            placeholder: 'usia, jenis kelamin, etnis, perawakan, ekspresi' },
          { id: 'wear', label: 'Pakaian & aksesori', type: 'textarea', wide: true },
          { id: 'pose', label: 'Pose & ekspresi', type: 'text', wide: true },
          { id: 'bg', label: 'Latar belakang', type: 'text', wide: true },
          { id: 'shotType', label: 'Jenis shot', type: 'select',
            options: ['Close-up wajah', 'Setengah badan', 'Seluruh badan', 'Turnaround sheet (depan-samping-belakang)', 'Kumpulan ekspresi'],
            default: 'Setengah badan' }
        ],
        build: function (v) {
          var shot = {
            'Close-up wajah': 'close-up portrait', 'Setengah badan': 'medium shot waist up',
            'Seluruh badan': 'full body shot', 'Turnaround sheet (depan-samping-belakang)': 'character turnaround sheet, front side back views, neutral pose, consistent design',
            'Kumpulan ekspresi': 'character expression sheet, multiple facial expressions, consistent design'
          }[v.shotType] || '';
          var core = [h.or(v.who, 'karakter'), v.wear, v.pose, shot, v.bg];
          var b = buildVisual(v, core, 'Kamu adalah character designer yang menjaga konsistensi ciri khas tokoh.');
          b.constraints = ['Anatomi harus benar: jumlah jari, proporsi tubuh, dan arah pandangan mata.'];
          return b;
        }
      }),

      T({
        id: 'scene',
        name: 'Pemandangan & Lingkungan',
        desc: 'Landscape, interior, dan konsep lingkungan.',
        tags: ['pemandangan', 'landscape', 'lingkungan', 'interior', 'scene'],
        fields: [
          { id: 'place', label: 'Tempat', type: 'textarea', required: true, wide: true,
            placeholder: 'mis. kota pesisir yang ditinggalkan, dikuasai tanaman rambat' },
          { id: 'time', label: 'Waktu & cuaca', type: 'text', wide: true },
          { id: 'fore', label: 'Foreground', type: 'text', wide: true, placeholder: 'apa yang dekat dengan kamera' },
          { id: 'mid', label: 'Middleground', type: 'text', wide: true },
          { id: 'back', label: 'Background', type: 'text', wide: true },
          { id: 'scale', label: 'Petunjuk skala', type: 'text', wide: true,
            placeholder: 'mis. sosok manusia kecil di kejauhan untuk menunjukkan besarnya bangunan' }
        ],
        build: function (v) {
          var core = [
            h.or(v.place, 'tempat'), v.time,
            v.fore ? 'foreground: ' + v.fore : '',
            v.mid ? 'midground: ' + v.mid : '',
            v.back ? 'background: ' + v.back : '',
            v.scale, 'layered depth, atmospheric perspective'
          ];
          return buildVisual(v, core, 'Kamu adalah concept artist lingkungan yang membangun kedalaman berlapis.');
        }
      }),

      T({
        id: 'uiux',
        name: 'Mockup UI / Desain Web',
        desc: 'Tampilan antarmuka aplikasi dan situs.',
        tags: ['ui', 'ux', 'mockup', 'web', 'aplikasi', 'desain'],
        fields: [
          { id: 'screen', label: 'Layar yang dibuat', type: 'textarea', required: true, wide: true,
            placeholder: 'mis. dashboard analitik penjualan untuk aplikasi kasir' },
          { id: 'platform', label: 'Platform', type: 'select',
            options: ['Web desktop', 'Mobile app iOS', 'Mobile app Android', 'Tablet', 'Smartwatch', 'Desktop app'],
            default: 'Web desktop' },
          { id: 'components', label: 'Komponen yang terlihat', type: 'tags', wide: true,
            placeholder: 'sidebar, grafik garis, tabel transaksi, kartu statistik' },
          { id: 'designStyle', label: 'Gaya desain', type: 'select',
            options: ['Minimal clean', 'Neumorphism', 'Glassmorphism', 'Brutalist', 'Material Design', 'iOS native', 'Dark mode profesional'],
            default: 'Minimal clean' },
          { id: 'brandColor', label: 'Warna utama merek', type: 'text', wide: true, placeholder: 'mis. biru tua #1B3A6B' }
        ],
        build: function (v) {
          var core = [
            'clean UI design mockup of ' + h.or(v.screen, 'a screen'),
            h.or(v.platform, 'web') + ' interface',
            h.csv(h.split(v.components)),
            h.or(v.designStyle, 'minimal clean') + ' style',
            v.brandColor ? 'primary brand color ' + v.brandColor : '',
            'realistic interface layout, consistent spacing and alignment, legible typography'
          ];
          var b = buildVisual(v, core, 'Kamu adalah UI designer yang memperhatikan hierarki visual dan keterbacaan.');
          b.constraints = ['Tata letak harus masuk akal secara fungsional, bukan sekadar dekoratif.'];
          return b;
        }
      }),

      T({
        id: 'pattern',
        name: 'Pattern, Tekstur & Latar',
        desc: 'Pola berulang, tekstur, dan latar belakang.',
        tags: ['pattern', 'pola', 'tekstur', 'background', 'latar'],
        fields: [
          { id: 'motif', label: 'Motif / tema', type: 'textarea', required: true, wide: true,
            placeholder: 'mis. daun pisang dan burung cenderawasih gaya batik modern' },
          { id: 'kind', label: 'Jenis', type: 'select',
            options: ['Seamless pattern', 'Tekstur permukaan', 'Latar abstrak', 'Border / ornamen', 'Wallpaper'],
            default: 'Seamless pattern' },
          { id: 'density', label: 'Kerapatan', type: 'select',
            options: ['Sangat renggang', 'Renggang', 'Sedang', 'Rapat', 'Sangat rapat'], default: 'Sedang' },
          { id: 'use', label: 'Akan dipakai untuk', type: 'text', wide: true, placeholder: 'mis. kemasan produk, kain, latar situs' }
        ],
        build: function (v) {
          var core = [
            (v.kind === 'Seamless pattern' ? 'seamless repeating pattern of ' : h.or(v.kind, 'pattern').toLowerCase() + ' of ') + h.or(v.motif, 'motif'),
            h.or(v.density, 'medium').toLowerCase() + ' density',
            v.use ? 'designed for ' + v.use : '',
            'flat even lighting, tileable, consistent scale across the frame'
          ];
          var b = buildVisual(v, core, 'Kamu adalah surface designer yang membuat pola berulang tanpa sambungan terlihat.');
          if (v.kind === 'Seamless pattern') b.constraints = ['Pola harus benar-benar seamless: tepi kiri menyambung dengan kanan, atas dengan bawah.'];
          return b;
        }
      })

    ]
  });

})(window.PG);
