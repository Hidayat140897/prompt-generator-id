/* ==========================================================================
   registry.js — inti aplikasi: pendaftaran kategori/template + helper.
   Setiap file di assets/js/data/ memanggil PG.registerCategory({...}).
   Untuk menambah kategori baru: buat file data baru, daftarkan di index.html.
   ========================================================================== */

window.PG = window.PG || {};

(function (PG) {
  'use strict';

  PG.categories = [];
  PG._byId = {};

  /**
   * Daftarkan sebuah kategori beserta template-nya.
   * @param {{id:string,name:string,icon:string,desc:string,defaultFormat?:string,templates:Array}} cat
   */
  PG.registerCategory = function (cat) {
    if (!cat || !cat.id) throw new Error('Kategori butuh id');
    if (PG._byId[cat.id]) throw new Error('Kategori duplikat: ' + cat.id);
    cat.templates = (cat.templates || []).map(function (t) {
      t.categoryId = cat.id;
      t.fields = t.fields || [];
      return t;
    });
    PG._byId[cat.id] = cat;
    PG.categories.push(cat);
    return cat;
  };

  PG.getCategory = function (id) { return PG._byId[id] || null; };

  PG.getTemplate = function (catId, tplId) {
    var c = PG._byId[catId];
    if (!c) return null;
    for (var i = 0; i < c.templates.length; i++) {
      if (c.templates[i].id === tplId) return c.templates[i];
    }
    return null;
  };

  /** Semua template dalam satu array datar. */
  PG.allTemplates = function () {
    var out = [];
    PG.categories.forEach(function (c) {
      c.templates.forEach(function (t) { out.push(t); });
    });
    return out;
  };

  /** Pencarian sederhana berdasarkan nama, deskripsi, dan tag. */
  PG.searchTemplates = function (q) {
    q = (q || '').trim().toLowerCase();
    if (!q) return null;
    var words = q.split(/\s+/);
    return PG.allTemplates().filter(function (t) {
      var hay = (t.name + ' ' + (t.desc || '') + ' ' + (t.tags || []).join(' ') + ' ' +
        (PG.getCategory(t.categoryId) || {}).name).toLowerCase();
      return words.every(function (w) { return hay.indexOf(w) !== -1; });
    });
  };

  /** Nilai awal form untuk sebuah template. */
  PG.defaultValues = function (tpl) {
    var v = {};
    (tpl.fields || []).forEach(function (f) {
      if (f.type === 'multi') v[f.id] = Array.isArray(f.default) ? f.default.slice() : [];
      else if (f.type === 'toggle') v[f.id] = !!f.default;
      else if (f.type === 'range') v[f.id] = f.default != null ? f.default : (f.min || 0);
      else v[f.id] = f.default != null ? f.default : '';
    });
    return v;
  };

  /* ---------------------------------------------------------------------- */
  /* Helper untuk penulis template (dipakai di dalam build()).               */
  /* ---------------------------------------------------------------------- */
  var h = PG.h = {};

  /** Buang nilai kosong dari array, rapikan spasi. */
  h.clean = function (arr) {
    return (arr || []).filter(function (x) {
      return x != null && String(x).trim() !== '';
    }).map(function (x) { return String(x).trim(); });
  };

  /** Nilai atau fallback jika kosong. */
  h.or = function (val, fallback) {
    return (val == null || String(val).trim() === '') ? fallback : String(val).trim();
  };

  /** Gabung array jadi string dipisah koma; array kosong -> ''. */
  h.csv = function (arr) { return h.clean(arr).join(', '); };

  /** Pecah input bertag ("a, b; c") jadi array. */
  h.split = function (s) {
    return h.clean(String(s || '').split(/[,;\n]+/));
  };

  /** Tambahkan baris ke array hanya jika kondisi benar. */
  h.push = function (arr, cond, line) {
    if (cond) arr.push(line);
    return arr;
  };

  /** true jika array multi mengandung nilai. */
  h.has = function (arr, val) {
    return Array.isArray(arr) && arr.indexOf(val) !== -1;
  };

  /** Rangkai bagian-bagian prompt satu baris (untuk gambar/video). */
  h.line = function (parts) { return h.clean(parts).join(', '); };

})(window.PG);
