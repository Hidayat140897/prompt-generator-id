/* ==========================================================================
   data/video.js — kategori "Video & Audio"
   ========================================================================== */

(function (PG) {
  'use strict';
  var h = PG.h, M = PG.MOD;

  var VID_ENGINES = ['Sora', 'Google Veo', 'Runway Gen-3', 'Kling', 'Pika', 'Luma Dream Machine', 'Umum (semua engine)'];

  function videoTech(defAspect) {
    return [
      { section: 'Teknis', id: 'engine', label: 'Engine tujuan', type: 'select', options: VID_ENGINES, default: 'Sora' },
      { section: 'Teknis', id: 'aspect', label: 'Rasio aspek', type: 'select', options: ['16:9', '9:16', '1:1', '21:9', '4:5'], default: defAspect || '16:9' },
      { section: 'Teknis', id: 'duration', label: 'Durasi (detik)', type: 'range', min: 3, max: 60, step: 1, default: 8 },
      { section: 'Teknis', id: 'fps', label: 'Frame rate', type: 'select', options: ['24 fps', '25 fps', '30 fps', '60 fps', '120 fps (slow motion)'], default: '24 fps' },
      { section: 'Teknis', id: 'avoid', label: 'Yang harus dihindari', type: 'text', wide: true,
        placeholder: 'mis. teks di layar, wajah berubah bentuk, gerakan kamera berlebihan' },
      { section: 'Teknis', id: 'extra', label: 'Tambahan bebas', type: 'text', wide: true }
    ];
  }

  function videoParams(v) {
    var p = ['Aspect ratio: ' + h.or(v.aspect, '16:9'), 'Duration: ' + h.or(v.duration, 8) + 's', h.or(v.fps, '24 fps')];
    return p.join(', ');
  }

  PG.registerCategory({
    id: 'video',
    name: 'Video & Audio',
    icon: '🎬',
    desc: 'Klip video generatif, iklan, animasi, voice-over, musik, dan naskah.',
    defaultFormat: 'raw',
    templates: [

      /* ------------------------------------------------------------------ */
      {
        id: 'clip',
        name: 'Klip Video Generatif',
        desc: 'Satu adegan untuk Sora, Veo, Runway, Kling, atau Pika.',
        tags: ['video', 'sora', 'veo', 'runway', 'kling', 'klip'],
        fields: [
          { section: 'Adegan', id: 'subject', label: 'Subjek utama', type: 'textarea', required: true, wide: true,
            placeholder: 'mis. seorang penari topeng bergerak perlahan di tengah sawah' },
          { section: 'Adegan', id: 'action', label: 'Aksi & perubahan', type: 'textarea', wide: true,
            placeholder: 'Apa yang berubah dari detik pertama ke detik terakhir? Ini bagian terpenting.',
            hint: 'Video butuh perubahan. Jelaskan awal dan akhir gerakan.' },
          { section: 'Adegan', id: 'setting', label: 'Latar & waktu', type: 'text', wide: true },
          { section: 'Adegan', id: 'camera', label: 'Gerakan kamera', type: 'multi', wide: true, options: M.cameraMove, default: ['slow push in'] },
          { section: 'Adegan', id: 'style', label: 'Gaya visual', type: 'multi', wide: true, options: M.videoStyle, default: ['cinematic film look'] },
          { section: 'Adegan', id: 'lighting', label: 'Pencahayaan', type: 'multi', wide: true, options: M.lighting },
          { section: 'Adegan', id: 'mood', label: 'Suasana', type: 'multi', wide: true, options: M.mood },
          { section: 'Adegan', id: 'colors', label: 'Palet warna', type: 'multi', wide: true, options: M.colors },
          { section: 'Adegan', id: 'pacing', label: 'Tempo', type: 'select', options: M.pacing, default: 'slow contemplative pacing' },
          { section: 'Adegan', id: 'audio', label: 'Suara yang diinginkan', type: 'text', wide: true,
            placeholder: 'mis. suara angin dan gamelan pelan di kejauhan' }
        ].concat(videoTech('16:9')),
        build: function (v) {
          var core = [
            h.or(v.subject, 'subjek'), v.action, v.setting,
            h.csv(v.camera), h.csv(v.style), h.csv(v.lighting), h.csv(v.mood), h.csv(v.colors),
            v.pacing, v.audio ? 'ambient audio: ' + v.audio : '', v.extra
          ];
          return {
            role: 'Kamu adalah sutradara yang menulis satu adegan video secara presisi.',
            context: ['Engine tujuan: ' + h.or(v.engine, 'Sora') + '.'],
            task: ['Hasilkan klip video sesuai deskripsi adegan.'],
            constraints: v.avoid ? ['Hindari: ' + v.avoid] : [],
            output: ['Satu klip ' + h.or(v.duration, 8) + ' detik, rasio ' + h.or(v.aspect, '16:9') + '.'],
            raw: h.line(core),
            negative: v.avoid || '',
            params: videoParams(v)
          };
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'ad',
        name: 'Iklan Video Produk',
        desc: 'Iklan pendek berisi beberapa shot yang terhubung.',
        tags: ['iklan', 'ads', 'produk', 'komersial', 'video'],
        fields: [
          { section: 'Brief', id: 'product', label: 'Produk', type: 'textarea', required: true, wide: true },
          { section: 'Brief', id: 'message', label: 'Pesan utama', type: 'text', wide: true,
            placeholder: 'Satu kalimat yang harus diingat penonton.' },
          { section: 'Brief', id: 'audience', label: 'Target penonton', type: 'text', wide: true },
          { section: 'Brief', id: 'platform', label: 'Platform', type: 'select',
            options: ['TikTok / Reels (vertikal)', 'YouTube pre-roll', 'Instagram feed', 'Layar toko / LED', 'Website hero'],
            default: 'TikTok / Reels (vertikal)' },
          { section: 'Brief', id: 'shots', label: 'Jumlah shot', type: 'range', min: 2, max: 12, default: 5 },
          { section: 'Brief', id: 'style', label: 'Gaya visual', type: 'multi', wide: true, options: M.videoStyle, default: ['commercial advertisement polish'] },
          { section: 'Brief', id: 'mood', label: 'Suasana', type: 'multi', wide: true, options: M.mood },
          { section: 'Brief', id: 'cta', label: 'Ajakan bertindak', type: 'text', wide: true },
          { section: 'Brief', id: 'opts', label: 'Sertakan', type: 'multi', wide: true,
            options: ['Prompt terpisah per shot', 'Naskah voice-over', 'Saran musik', 'Teks on-screen', 'Catatan transisi'],
            default: ['Prompt terpisah per shot', 'Naskah voice-over', 'Catatan transisi'] }
        ].concat(videoTech('9:16')),
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah sutradara iklan yang tahu bahwa tiga detik pertama menentukan apakah iklan ditonton.';
          b.context.push('Produk: ' + h.or(v.product, '(isi produk)'));
          h.push(b.context, v.audience, 'Target penonton: ' + v.audience + '.');
          b.context.push('Platform: ' + h.or(v.platform, 'TikTok / Reels') + '. Durasi total: ' + h.or(v.duration, 15) + ' detik.');
          b.context.push('Engine video: ' + h.or(v.engine, 'Sora') + '.');
          h.push(b.context, v.message, 'Pesan utama: ' + v.message);

          b.task.push('Rancang iklan video terdiri dari ' + h.or(v.shots, 5) + ' shot yang mengalir menjadi satu cerita.');
          b.task.push('Gaya visual: ' + h.or(h.csv(v.style), 'commercial advertisement polish') + '. Suasana: ' + h.or(h.csv(v.mood), 'energik') + '.');

          b.constraints.push('Shot pertama harus menghentikan scroll dalam 2 detik tanpa mengandalkan teks.');
          b.constraints.push('Produk harus terlihat jelas dan proporsinya akurat di minimal dua shot.');
          b.constraints.push('Jangan mengarang klaim produk yang tidak disebutkan.');
          h.push(b.constraints, v.avoid, 'Hindari: ' + v.avoid);
          h.push(b.constraints, v.extra, v.extra);

          b.output.push('Tabel storyboard: nomor shot, durasi, deskripsi visual, gerakan kamera, audio.');
          if (h.has(v.opts, 'Prompt terpisah per shot')) b.output.push('Untuk tiap shot, tulis prompt siap tempel ke ' + h.or(v.engine, 'engine video') + ' dalam Bahasa Inggris, satu baris per shot.');
          if (h.has(v.opts, 'Naskah voice-over')) b.output.push('Naskah voice-over lengkap dengan penanda waktu.');
          if (h.has(v.opts, 'Saran musik')) b.output.push('Saran genre dan tempo musik latar.');
          if (h.has(v.opts, 'Teks on-screen')) b.output.push('Teks yang muncul di layar per shot, maksimal 6 kata.');
          if (h.has(v.opts, 'Catatan transisi')) b.output.push('Catatan transisi antar shot.');
          if (v.cta) b.output.push('Shot terakhir menutup dengan ajakan: ' + v.cta + '.');
          b.success.push('Penonton paham produknya dan alasan membeli meski menonton tanpa suara.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'animation',
        name: 'Animasi & Motion Graphics',
        desc: 'Animasi karakter, motion graphics, dan logo animation.',
        tags: ['animasi', 'motion', 'grafis', 'after effects'],
        fields: [
          { section: 'Adegan', id: 'subject', label: 'Yang dianimasikan', type: 'textarea', required: true, wide: true },
          { section: 'Adegan', id: 'motion', label: 'Gerakan yang diinginkan', type: 'textarea', wide: true,
            placeholder: 'Jelaskan dari keadaan awal ke keadaan akhir.' },
          { section: 'Adegan', id: 'kind', label: 'Jenis animasi', type: 'select',
            options: ['2D karakter', '3D karakter', 'Motion graphics', 'Logo animation', 'Infografis bergerak',
              'Transisi / stinger', 'Loop pendek', 'Explainer'], default: 'Motion graphics' },
          { section: 'Adegan', id: 'easing', label: 'Karakter gerakan', type: 'select',
            options: ['Smooth ease in-out', 'Snappy dan cepat', 'Bouncy / elastis', 'Linear mekanis', 'Organik dan lembut'],
            default: 'Smooth ease in-out' },
          { section: 'Adegan', id: 'style', label: 'Gaya visual', type: 'multi', wide: true, options: M.videoStyle },
          { section: 'Adegan', id: 'colors', label: 'Palet warna', type: 'multi', wide: true, options: M.colors },
          { section: 'Adegan', id: 'loop', label: 'Harus loop mulus', type: 'toggle', default: false }
        ].concat(videoTech('16:9')),
        build: function (v) {
          var core = [
            h.or(v.kind, 'motion graphics').toLowerCase() + ' of ' + h.or(v.subject, 'subjek'),
            v.motion, h.csv(v.style), h.csv(v.colors),
            h.or(v.easing, 'smooth ease in-out').toLowerCase() + ' motion',
            v.loop ? 'perfectly seamless loop, first frame matches last frame' : '',
            v.extra
          ];
          return {
            role: 'Kamu adalah motion designer yang memperhatikan timing dan easing.',
            context: ['Engine tujuan: ' + h.or(v.engine, 'Sora') + '. Jenis: ' + h.or(v.kind, 'Motion graphics') + '.'],
            task: ['Hasilkan animasi sesuai deskripsi.'],
            constraints: h.clean([v.avoid ? 'Hindari: ' + v.avoid : '', v.loop ? 'Frame pertama dan terakhir harus identik agar loop tidak terlihat sambungannya.' : '']),
            output: ['Animasi ' + h.or(v.duration, 8) + ' detik, rasio ' + h.or(v.aspect, '16:9') + '.'],
            raw: h.line(core),
            negative: v.avoid || '',
            params: videoParams(v)
          };
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'voice',
        name: 'Voice-over & Narasi',
        desc: 'Naskah dan arahan pengisi suara untuk TTS atau talent.',
        tags: ['voice', 'narasi', 'tts', 'suara', 'dubbing', 'elevenlabs'],
        fields: [
          { section: 'Naskah', id: 'purpose', label: 'Untuk apa suaranya', type: 'textarea', required: true, wide: true,
            placeholder: 'mis. narasi video edukasi tentang cara menabung emas' },
          { section: 'Naskah', id: 'script', label: 'Naskah (jika sudah ada)', type: 'textarea', wide: true,
            placeholder: 'Kosongkan jika ingin naskahnya dibuatkan.' },
          { section: 'Naskah', id: 'duration', label: 'Target durasi', type: 'select',
            options: ['15 detik', '30 detik', '60 detik', '2 menit', '5 menit', '10 menit+'], default: '60 detik' },
          { section: 'Suara', id: 'tone', label: 'Nada suara', type: 'multi', wide: true, options: M.voiceTone, default: ['hangat dan ramah'] },
          { section: 'Suara', id: 'gender', label: 'Karakter suara', type: 'select',
            options: ['Bebas', 'Suara pria dewasa', 'Suara wanita dewasa', 'Suara muda / remaja', 'Suara paruh baya', 'Suara anak'],
            default: 'Bebas' },
          { section: 'Suara', id: 'pace', label: 'Kecepatan bicara', type: 'select',
            options: ['Lambat dan jelas', 'Sedang', 'Cepat dan energik', 'Bervariasi mengikuti isi'], default: 'Sedang' },
          { section: 'Suara', id: 'lang', label: 'Bahasa & aksen', type: 'text', wide: true,
            placeholder: 'mis. Bahasa Indonesia baku, aksen Jakarta netral' },
          { section: 'Suara', id: 'opts', label: 'Sertakan', type: 'multi', wide: true,
            options: ['Penanda jeda dan penekanan', 'Petunjuk emosi per kalimat', 'Panduan pengucapan istilah asing',
              'Estimasi durasi per paragraf', 'Versi lebih pendek'],
            default: ['Penanda jeda dan penekanan', 'Estimasi durasi per paragraf'] },
          { section: 'Suara', id: 'extra', label: 'Instruksi tambahan', type: 'textarea', wide: true }
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah penulis naskah voice-over yang menulis untuk telinga, bukan untuk mata.';
          b.context.push('Keperluan: ' + h.or(v.purpose, '(isi keperluan)'));
          b.context.push('Target durasi: ' + h.or(v.duration, '60 detik') + '.');
          h.push(b.context, v.lang, 'Bahasa dan aksen: ' + v.lang + '.');
          if (v.script) b.context.push('Naskah yang sudah ada:\n"""\n' + v.script + '\n"""');

          b.task.push(v.script ? 'Perbaiki dan beri arahan pembacaan untuk naskah di atas.' : 'Tulis naskah voice-over sesuai keperluan di atas.');
          b.task.push('Tentukan arahan suara: ' + h.or(h.csv(v.tone), 'hangat dan ramah') + '. Karakter suara: ' +
            h.or(v.gender, 'Bebas') + '. Kecepatan: ' + h.or(v.pace, 'Sedang') + '.');

          b.constraints.push('Gunakan kalimat pendek yang mudah diucapkan dalam satu tarikan napas.');
          b.constraints.push('Hindari angka panjang, singkatan, dan kata yang ambigu pengucapannya; tulis apa adanya cara membacanya.');
          b.constraints.push('Perkiraan kecepatan baca: 150 kata per menit untuk Bahasa Indonesia.');
          h.push(b.constraints, v.extra, v.extra);

          b.output.push('Naskah final siap baca.');
          if (h.has(v.opts, 'Penanda jeda dan penekanan')) b.output.push('Gunakan [jeda] untuk jeda dan **tebal** untuk kata yang ditekankan.');
          if (h.has(v.opts, 'Petunjuk emosi per kalimat')) b.output.push('Beri petunjuk emosi dalam kurung di awal tiap paragraf, mis. (hangat, pelan).');
          if (h.has(v.opts, 'Panduan pengucapan istilah asing')) b.output.push('Sertakan panduan pengucapan untuk istilah asing.');
          if (h.has(v.opts, 'Estimasi durasi per paragraf')) b.output.push('Cantumkan estimasi durasi di tiap paragraf.');
          if (h.has(v.opts, 'Versi lebih pendek')) b.output.push('Sertakan versi yang 30% lebih pendek.');
          b.success.push('Naskah terdengar natural ketika dibaca keras, bukan seperti teks yang dibacakan.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'music',
        name: 'Musik & Sound Design',
        desc: 'Prompt untuk Suno, Udio, dan generator musik lain.',
        tags: ['musik', 'suno', 'udio', 'lagu', 'sound', 'audio'],
        fields: [
          { section: 'Musik', id: 'purpose', label: 'Untuk apa musiknya', type: 'textarea', required: true, wide: true,
            placeholder: 'mis. musik latar video profil perusahaan konstruksi' },
          { section: 'Musik', id: 'genre', label: 'Genre', type: 'multi', wide: true, options: M.musicGenre, default: ['cinematic orchestral'] },
          { section: 'Musik', id: 'mood', label: 'Suasana', type: 'multi', wide: true, options: M.musicMood, default: ['uplifting'] },
          { section: 'Musik', id: 'instruments', label: 'Instrumen utama', type: 'tags', wide: true,
            placeholder: 'piano, string section, kendang, gitar akustik' },
          { section: 'Musik', id: 'tempo', label: 'Tempo', type: 'select',
            options: ['Sangat lambat (60-70 BPM)', 'Lambat (70-90 BPM)', 'Sedang (90-110 BPM)',
              'Cepat (110-130 BPM)', 'Sangat cepat (130+ BPM)'], default: 'Sedang (90-110 BPM)' },
          { section: 'Musik', id: 'structure', label: 'Struktur', type: 'select',
            options: ['Loop instrumental', 'Intro - build - drop', 'Verse - chorus - verse - chorus', 'Naik perlahan sepanjang lagu', 'Ambient tanpa struktur'],
            default: 'Naik perlahan sepanjang lagu' },
          { section: 'Musik', id: 'vocal', label: 'Vokal', type: 'select',
            options: ['Instrumental tanpa vokal', 'Vokal pria', 'Vokal wanita', 'Paduan suara', 'Vokal tanpa lirik (humming)'],
            default: 'Instrumental tanpa vokal' },
          { section: 'Musik', id: 'lyricTheme', label: 'Tema lirik (jika ada vokal)', type: 'textarea', wide: true },
          { section: 'Musik', id: 'duration', label: 'Durasi', type: 'select',
            options: ['15 detik', '30 detik', '1 menit', '2 menit', '3 menit+'], default: '1 menit' },
          { section: 'Musik', id: 'avoid', label: 'Yang dihindari', type: 'text', wide: true,
            placeholder: 'mis. drum elektronik, suara terlalu ramai' },
          { section: 'Musik', id: 'opts', label: 'Sertakan', type: 'multi', wide: true,
            options: ['Tulis lirik lengkap', 'Sertakan tag gaya siap tempel', 'Sertakan versi alternatif', 'Sertakan catatan mixing'],
            default: ['Sertakan tag gaya siap tempel'] },
          { section: 'Musik', id: 'extra', label: 'Instruksi tambahan', type: 'textarea', wide: true }
        ],
        build: function (v) {
          var tagLine = h.line([
            h.csv(v.genre), h.csv(v.mood), h.csv(h.split(v.instruments)),
            h.or(v.tempo, '').replace(/^[^(]*\(/, '').replace(/\)$/, ''),
            v.vocal === 'Instrumental tanpa vokal' ? 'instrumental' : String(v.vocal || '').toLowerCase(),
            v.extra
          ]);

          var b = {
            role: 'Kamu adalah music director yang menerjemahkan kebutuhan visual menjadi arahan musik.',
            context: ['Keperluan: ' + h.or(v.purpose, '(isi keperluan)'), 'Durasi: ' + h.or(v.duration, '1 menit') + '.'],
            task: ['Rancang musik dengan struktur ' + h.or(v.structure, 'naik perlahan') + '.'],
            constraints: h.clean([
              v.avoid ? 'Hindari: ' + v.avoid : '',
              'Musik tidak boleh menutupi narasi; sisakan ruang di frekuensi tengah.'
            ]),
            output: [],
            raw: tagLine,
            negative: v.avoid || '',
            params: 'Durasi: ' + h.or(v.duration, '1 menit') + ', Tempo: ' + h.or(v.tempo, 'Sedang')
          };

          if (h.has(v.opts, 'Sertakan tag gaya siap tempel')) b.output.push('Satu baris tag gaya siap tempel ke Suno/Udio (Bahasa Inggris).');
          if (h.has(v.opts, 'Tulis lirik lengkap') && v.vocal !== 'Instrumental tanpa vokal') {
            b.output.push('Lirik lengkap dengan penanda [Verse], [Chorus], [Bridge].');
            if (v.lyricTheme) b.task.push('Tema lirik: ' + v.lyricTheme);
          }
          if (h.has(v.opts, 'Sertakan versi alternatif')) b.output.push('Dua alternatif arahan dengan karakter berbeda.');
          if (h.has(v.opts, 'Sertakan catatan mixing')) b.output.push('Catatan mixing singkat: dinamika, ruang, dan instrumen yang menonjol.');
          return b;
        }
      },

      /* ------------------------------------------------------------------ */
      {
        id: 'script',
        name: 'Naskah & Storyboard Video',
        desc: 'Naskah video YouTube, edukasi, atau company profile.',
        tags: ['naskah', 'script', 'storyboard', 'youtube', 'video'],
        fields: [
          { section: 'Naskah', id: 'topic', label: 'Topik video', type: 'textarea', required: true, wide: true },
          { section: 'Naskah', id: 'format', label: 'Format video', type: 'select',
            options: ['YouTube edukasi', 'YouTube hiburan', 'Short / Reels', 'Company profile', 'Tutorial langkah demi langkah',
              'Dokumenter pendek', 'Wawancara', 'Product demo'], default: 'YouTube edukasi' },
          { section: 'Naskah', id: 'duration', label: 'Durasi target', type: 'select',
            options: ['30 detik', '1 menit', '3 menit', '5 menit', '10 menit', '20 menit+'], default: '5 menit' },
          { section: 'Naskah', id: 'audience', label: 'Target penonton', type: 'text', wide: true },
          { section: 'Naskah', id: 'goal', label: 'Yang harus penonton lakukan setelah menonton', type: 'text', wide: true },
          { section: 'Naskah', id: 'tone', label: 'Gaya penyampaian', type: 'select',
            options: ['Santai dan akrab', 'Profesional', 'Energik', 'Tenang dan naratif', 'Lucu', 'Inspiratif'],
            default: 'Santai dan akrab' },
          { section: 'Naskah', id: 'points', label: 'Poin yang wajib masuk', type: 'textarea', wide: true },
          { section: 'Naskah', id: 'opts', label: 'Sertakan', type: 'multi', wide: true,
            options: ['Hook 5 detik pertama', 'Petunjuk visual / B-roll', 'Penanda waktu', 'Teks on-screen',
              'Saran judul & thumbnail', 'Saran musik', 'CTA di akhir', 'Storyboard tabel'],
            default: ['Hook 5 detik pertama', 'Petunjuk visual / B-roll', 'Penanda waktu', 'CTA di akhir'] },
          { section: 'Naskah', id: 'extra', label: 'Instruksi tambahan', type: 'textarea', wide: true }
        ],
        build: function (v) {
          var b = { context: [], task: [], constraints: [], output: [], success: [] };
          b.role = 'Kamu adalah penulis naskah video yang tahu bahwa penonton bisa pergi kapan saja, ' +
            'jadi setiap 20 detik harus ada alasan untuk bertahan.';
          b.context.push('Format: ' + h.or(v.format, 'YouTube edukasi') + '. Durasi target: ' + h.or(v.duration, '5 menit') + '.');
          h.push(b.context, v.audience, 'Target penonton: ' + v.audience + '.');
          h.push(b.context, v.goal, 'Tindakan yang diharapkan setelah menonton: ' + v.goal + '.');
          b.task.push('Tulis naskah video dengan topik: ' + h.or(v.topic, '(isi topik)'));
          h.push(b.task, v.points, 'Poin yang wajib masuk: ' + v.points);
          b.constraints.push('Gaya penyampaian: ' + h.or(v.tone, 'Santai dan akrab') + '. Tulis dalam bahasa lisan, bukan bahasa tulis.');
          b.constraints.push('Hindari pengantar bertele-tele. Masuk ke inti sebelum detik ke-15.');
          b.constraints.push('Jangan mengarang data atau sumber. Tandai [BUTUH DATA] bila perlu.');
          h.push(b.constraints, v.extra, v.extra);
          if (h.has(v.opts, 'Hook 5 detik pertama')) b.output.push('Tiga alternatif hook untuk 5 detik pertama.');
          if (h.has(v.opts, 'Storyboard tabel')) b.output.push('Tabel storyboard: waktu, narasi, visual, teks on-screen.');
          else b.output.push('Naskah mengalir dengan penanda bagian.');
          if (h.has(v.opts, 'Petunjuk visual / B-roll')) b.output.push('Petunjuk visual dan B-roll di setiap bagian.');
          if (h.has(v.opts, 'Penanda waktu')) b.output.push('Penanda waktu perkiraan di setiap bagian.');
          if (h.has(v.opts, 'Teks on-screen')) b.output.push('Teks on-screen singkat, maksimal 6 kata per tampilan.');
          if (h.has(v.opts, 'Saran judul & thumbnail')) b.output.push('Lima alternatif judul dan konsep thumbnail.');
          if (h.has(v.opts, 'Saran musik')) b.output.push('Saran musik latar per bagian.');
          if (h.has(v.opts, 'CTA di akhir')) b.output.push('Penutup dengan satu ajakan bertindak yang jelas.');
          b.success.push('Penonton bertahan sampai akhir karena setiap bagian membuka rasa penasaran berikutnya.');
          return b;
        }
      }

    ]
  });

})(window.PG);
