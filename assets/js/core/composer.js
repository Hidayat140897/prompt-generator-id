/* ==========================================================================
   composer.js — merakit blok prompt menjadi teks akhir.
   Blok yang dihasilkan template: { role, context[], task[], constraints[],
   output[], success[], examples, raw, negative, params, notes[] }
   ========================================================================== */

(function (PG) {
  'use strict';

  var LABELS = {
    id: {
      role: 'PERAN', context: 'KONTEKS', task: 'TUGAS', constraints: 'BATASAN & ATURAN',
      output: 'FORMAT OUTPUT', examples: 'CONTOH', success: 'KRITERIA BERHASIL',
      negative: 'HINDARI', params: 'PARAMETER', notes: 'CATATAN'
    },
    en: {
      role: 'ROLE', context: 'CONTEXT', task: 'TASK', constraints: 'CONSTRAINTS & RULES',
      output: 'OUTPUT FORMAT', examples: 'EXAMPLES', success: 'SUCCESS CRITERIA',
      negative: 'AVOID', params: 'PARAMETERS', notes: 'NOTES'
    }
  };

  var XML_TAGS = {
    role: 'role', context: 'context', task: 'task', constraints: 'constraints',
    output: 'output_format', examples: 'examples', success: 'success_criteria',
    negative: 'avoid', params: 'parameters', notes: 'notes'
  };

  var ANSWER_LANG = {
    id: { id: 'Tulis seluruh jawaban dalam Bahasa Indonesia yang natural.', en: 'Write the entire answer in natural Indonesian.' },
    en: { id: 'Tulis seluruh jawaban dalam Bahasa Inggris.', en: 'Write the entire answer in English.' },
    same: { id: 'Jawab menggunakan bahasa yang sama dengan bahasa input.', en: 'Answer in the same language as the input.' }
  };

  var ORDER = ['role', 'context', 'task', 'constraints', 'output', 'examples', 'success', 'notes'];

  function asLines(v) {
    if (v == null) return [];
    if (Array.isArray(v)) return PG.h.clean(v);
    var s = String(v).trim();
    return s ? [s] : [];
  }

  function bullets(lines) {
    return lines.map(function (l) {
      return /^[-*\d]/.test(l) ? l : '- ' + l;
    }).join('\n');
  }

  /**
   * Rakit prompt final.
   * @param {object} blocks hasil template.build()
   * @param {object} s      pengaturan { format, lang, answerLang, numbering }
   * @returns {string}
   */
  PG.compose = function (blocks, s) {
    blocks = blocks || {};
    s = s || {};
    var lang = s.lang === 'en' ? 'en' : 'id';
    var L = LABELS[lang];
    var fmt = s.format || 'structured';

    // Format baris tunggal (prompt gambar/video/musik).
    if (fmt === 'raw' || (blocks.raw && fmt === 'auto')) {
      return composeRaw(blocks, L);
    }

    // Salin blok agar aman dimodifikasi.
    var b = {
      role: asLines(blocks.role),
      context: asLines(blocks.context),
      task: asLines(blocks.task),
      constraints: asLines(blocks.constraints),
      output: asLines(blocks.output),
      examples: asLines(blocks.examples),
      success: asLines(blocks.success),
      notes: asLines(blocks.notes)
    };

    // Instruksi bahasa jawaban.
    if (s.answerLang && ANSWER_LANG[s.answerLang]) {
      b.constraints.push(ANSWER_LANG[s.answerLang][lang]);
    }
    // Blok khusus gambar/video yang tetap berguna di format terstruktur.
    if (blocks.raw) b.task.push((lang === 'id' ? 'Prompt inti: ' : 'Core prompt: ') + blocks.raw);
    if (blocks.negative) b.constraints.push(L.negative + ': ' + blocks.negative);
    if (blocks.params) b.notes.push(L.params + ': ' + blocks.params);

    if (fmt === 'json') return composeJson(b, L);
    if (fmt === 'xml') return composeXml(b);
    if (fmt === 'compact') return composeCompact(b, lang);
    return composeStructured(b, L, !!s.numbering);
  };

  function composeStructured(b, L, numbering) {
    var out = [], n = 0;
    ORDER.forEach(function (k) {
      if (!b[k].length) return;
      n++;
      var head = numbering ? '## ' + n + '. ' + L[k] : '## ' + L[k];
      var body = (k === 'role' || k === 'examples')
        ? b[k].join('\n')
        : (b[k].length === 1 ? b[k][0] : bullets(b[k]));
      out.push(head + '\n' + body);
    });
    return out.join('\n\n').trim();
  }

  function composeXml(b) {
    var out = [];
    ORDER.forEach(function (k) {
      if (!b[k].length) return;
      var tag = XML_TAGS[k];
      var body = (k === 'role' || k === 'examples') ? b[k].join('\n') : bullets(b[k]);
      out.push('<' + tag + '>\n' + indent(body) + '\n</' + tag + '>');
    });
    return out.join('\n\n').trim();
  }

  function indent(s) {
    return s.split('\n').map(function (l) { return l ? '  ' + l : l; }).join('\n');
  }

  var COMPACT_WORDS = {
    id: { context: 'Konteks: ', task: 'Tugas: ', constraints: 'Aturan: ', output: 'Output: ', success: 'Berhasil jika: ', examples: 'Contoh: ' },
    en: { context: 'Context: ', task: 'Task: ', constraints: 'Rules: ', output: 'Output: ', success: 'Done well if: ', examples: 'Examples: ' }
  };

  function composeCompact(b, lang) {
    var W = COMPACT_WORDS[lang === 'en' ? 'en' : 'id'];
    var parts = [];
    if (b.role.length) parts.push(b.role.join(' '));
    ['context', 'task', 'constraints', 'output', 'success', 'examples'].forEach(function (k) {
      if (b[k].length) parts.push(W[k] + b[k].join(' '));
    });
    if (b.notes.length) parts.push(b.notes.join(' '));
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  }

  function composeJson(b) {
    var o = {};
    ORDER.forEach(function (k) {
      if (!b[k].length) return;
      o[k] = b[k].length === 1 ? b[k][0] : b[k];
    });
    return JSON.stringify(o, null, 2);
  }

  function composeRaw(blocks, L) {
    var out = [];
    var core = blocks.raw || PG.h.csv(asLines(blocks.task));
    if (core) out.push(core);
    if (blocks.negative) out.push('\n' + L.negative + ': ' + blocks.negative);
    if (blocks.params) out.push('\n' + blocks.params);
    return out.join('\n').trim();
  }

  /** Daftar format yang tersedia untuk sebuah kategori. */
  PG.FORMATS = [
    { id: 'structured', name: 'Terstruktur', desc: 'Markdown dengan judul bagian. Paling andal untuk ChatGPT/Claude/Gemini.' },
    { id: 'xml', name: 'XML', desc: 'Tag XML. Format favorit Claude untuk instruksi panjang.' },
    { id: 'compact', name: 'Ringkas', desc: 'Satu paragraf mengalir. Cocok untuk chat cepat.' },
    { id: 'json', name: 'JSON', desc: 'Objek JSON. Cocok dipakai lewat API atau disimpan di kode.' },
    { id: 'raw', name: 'Baris Tunggal', desc: 'Prompt polos + parameter. Untuk Midjourney, SD, Flux, Sora, Suno.' }
  ];

  /** Estimasi jumlah token (kasar, ~4 karakter per token). */
  PG.estimateTokens = function (text) {
    if (!text) return 0;
    return Math.max(1, Math.round(text.length / 4));
  };

  PG.countWords = function (text) {
    if (!text) return 0;
    var m = text.trim().match(/\S+/g);
    return m ? m.length : 0;
  };

})(window.PG);
