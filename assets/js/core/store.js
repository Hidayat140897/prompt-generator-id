/* ==========================================================================
   store.js — state aplikasi, penyimpanan lokal, ekspor/impor, share URL.
   Semua data (termasuk API key) hanya tersimpan di browser pengguna.
   ========================================================================== */

(function (PG) {
  'use strict';

  var KEY_SETTINGS = 'pg:settings:v1';
  var KEY_LIBRARY = 'pg:library:v1';
  var KEY_DRAFT = 'pg:draft:v1';      // versi lama: satu draf global
  var KEY_DRAFTS = 'pg:drafts:v1';    // draf per template: { "kategori/template": {values, ts} }
  var KEY_LAST = 'pg:last:v1';        // template yang terakhir dibuka
  var KEY_RECENT = 'pg:recent:v1';    // template yang baru dipakai
  var KEY_FAVTPL = 'pg:favtpl:v1';    // template favorit
  var KEY_AIHIST = 'pg:aihist:v1';    // riwayat hasil AI

  var MAX_RECENT = 8;
  var MAX_AIHIST = 20;
  var MAX_DRAFTS = 60;

  var DEFAULTS = {
    theme: 'dark',
    format: 'structured',
    lang: 'id',           // bahasa label struktur prompt
    answerLang: 'id',     // bahasa jawaban yang diminta ke model
    numbering: false,
    ai: {
      provider: 'anthropic',
      model: 'claude-sonnet-5',
      apiKey: '',
      baseUrl: '',
      temperature: 0.7,
      remember: true
    }
  };

  function safeParse(s, fallback) {
    try { return s ? JSON.parse(s) : fallback; } catch (e) { return fallback; }
  }

  function read(key, fallback) {
    try { return safeParse(localStorage.getItem(key), fallback); } catch (e) { return fallback; }
  }

  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }
  }

  function deepMerge(base, over) {
    var out = {};
    Object.keys(base).forEach(function (k) {
      if (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) {
        out[k] = deepMerge(base[k], (over && over[k]) || {});
      } else {
        out[k] = (over && over[k] !== undefined) ? over[k] : base[k];
      }
    });
    if (over) Object.keys(over).forEach(function (k) { if (!(k in out)) out[k] = over[k]; });
    return out;
  }

  /* ------------------------------- Settings ------------------------------ */

  var Store = PG.store = {};

  Store.settings = deepMerge(DEFAULTS, read(KEY_SETTINGS, {}));

  Store.saveSettings = function () {
    var s = JSON.parse(JSON.stringify(Store.settings));
    if (!s.ai.remember) s.ai.apiKey = '';
    write(KEY_SETTINGS, s);
  };

  Store.resetSettings = function () {
    Store.settings = JSON.parse(JSON.stringify(DEFAULTS));
    Store.saveSettings();
  };

  /* -------------------------------- Draft -------------------------------- */

  /* Draf disimpan per template supaya isian tidak hilang saat berpindah. */

  function tkey(catId, tplId) { return catId + '/' + tplId; }
  Store.tkey = tkey;

  var drafts = read(KEY_DRAFTS, null);
  if (!drafts) {
    drafts = {};
    // Migrasi dari versi lama yang hanya menyimpan satu draf.
    var old = read(KEY_DRAFT, null);
    if (old && old.catId && old.tplId) {
      drafts[tkey(old.catId, old.tplId)] = { values: old.values || {}, ts: Date.now() };
      write(KEY_DRAFTS, drafts);
      try { localStorage.removeItem(KEY_DRAFT); } catch (e) {}
    }
  }

  Store.saveDraft = function (catId, tplId, values) {
    drafts[tkey(catId, tplId)] = { values: values, ts: Date.now() };
    // Buang draf terlama bila sudah terlalu banyak.
    var keys = Object.keys(drafts);
    if (keys.length > MAX_DRAFTS) {
      keys.sort(function (a, b) { return (drafts[a].ts || 0) - (drafts[b].ts || 0); })
        .slice(0, keys.length - MAX_DRAFTS)
        .forEach(function (k) { delete drafts[k]; });
    }
    write(KEY_DRAFTS, drafts);
    write(KEY_LAST, { catId: catId, tplId: tplId });
  };

  Store.loadDraft = function (catId, tplId) {
    var d = drafts[tkey(catId, tplId)];
    return d ? d.values : null;
  };

  Store.lastOpened = function () { return read(KEY_LAST, null); };

  Store.clearDrafts = function () {
    drafts = {};
    try { localStorage.removeItem(KEY_DRAFTS); localStorage.removeItem(KEY_LAST); } catch (e) {}
  };

  /* ------------------- Template: terakhir dipakai & favorit ---------------- */

  Store.recent = read(KEY_RECENT, []);

  Store.touchTemplate = function (catId, tplId) {
    var k = tkey(catId, tplId);
    Store.recent = [k].concat(Store.recent.filter(function (x) { return x !== k; })).slice(0, MAX_RECENT);
    write(KEY_RECENT, Store.recent);
  };

  Store.favTemplates = read(KEY_FAVTPL, []);

  Store.isFavTemplate = function (catId, tplId) {
    return Store.favTemplates.indexOf(tkey(catId, tplId)) !== -1;
  };

  Store.toggleFavTemplate = function (catId, tplId) {
    var k = tkey(catId, tplId);
    var i = Store.favTemplates.indexOf(k);
    if (i === -1) Store.favTemplates.push(k); else Store.favTemplates.splice(i, 1);
    write(KEY_FAVTPL, Store.favTemplates);
    return i === -1;
  };

  /* ---------------------------- Riwayat hasil AI -------------------------- */

  Store.aiHistory = read(KEY_AIHIST, []);

  Store.addAiHistory = function (rec) {
    rec.id = Store.uid();
    rec.ts = Date.now();
    Store.aiHistory.unshift(rec);
    Store.aiHistory = Store.aiHistory.slice(0, MAX_AIHIST);
    write(KEY_AIHIST, Store.aiHistory);
    return rec;
  };

  Store.clearAiHistory = function () {
    Store.aiHistory = [];
    try { localStorage.removeItem(KEY_AIHIST); } catch (e) {}
  };

  /* ------------------------------- Library ------------------------------- */

  Store.library = read(KEY_LIBRARY, []);

  function persistLibrary() { return write(KEY_LIBRARY, Store.library); }

  Store.uid = function () {
    return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  };

  /**
   * Simpan prompt ke pustaka.
   * @param {{name:string,categoryId:string,templateId:string,values:object,settings:object,output:string,tags?:Array}} item
   */
  Store.savePrompt = function (item) {
    var now = Date.now();
    var rec = {
      id: item.id || Store.uid(),
      name: item.name || 'Tanpa judul',
      categoryId: item.categoryId,
      templateId: item.templateId,
      values: item.values || {},
      settings: item.settings || {},
      output: item.output || '',
      tags: item.tags || [],
      fav: !!item.fav,
      createdAt: item.createdAt || now,
      updatedAt: now
    };
    var idx = -1;
    for (var i = 0; i < Store.library.length; i++) {
      if (Store.library[i].id === rec.id) { idx = i; break; }
    }
    if (idx >= 0) Store.library[idx] = rec; else Store.library.unshift(rec);
    persistLibrary();
    return rec;
  };

  Store.deletePrompt = function (id) {
    Store.library = Store.library.filter(function (p) { return p.id !== id; });
    persistLibrary();
  };

  Store.toggleFav = function (id) {
    Store.library.forEach(function (p) { if (p.id === id) p.fav = !p.fav; });
    persistLibrary();
  };

  Store.getPrompt = function (id) {
    for (var i = 0; i < Store.library.length; i++) {
      if (Store.library[i].id === id) return Store.library[i];
    }
    return null;
  };

  Store.clearLibrary = function () { Store.library = []; persistLibrary(); };

  /** Hapus seluruh jejak aplikasi di browser ini. */
  Store.clearAll = function () {
    Store.clearLibrary();
    Store.clearDrafts();
    Store.clearAiHistory();
    Store.recent = [];
    Store.favTemplates = [];
    [KEY_RECENT, KEY_FAVTPL].forEach(function (k) {
      try { localStorage.removeItem(k); } catch (e) {}
    });
    Store.resetSettings();
  };

  /* --------------------------- Ekspor / Impor ---------------------------- */

  Store.exportLibrary = function () {
    return JSON.stringify({
      app: 'prompt-generator',
      version: 1,
      exportedAt: new Date().toISOString(),
      prompts: Store.library
    }, null, 2);
  };

  /**
   * Impor JSON pustaka. Mengembalikan jumlah item yang masuk.
   * Item dengan id sama akan diberi id baru agar tidak menimpa.
   */
  Store.importLibrary = function (json) {
    var data = typeof json === 'string' ? safeParse(json, null) : json;
    if (!data) throw new Error('File tidak bisa dibaca sebagai JSON.');
    var list = Array.isArray(data) ? data : data.prompts;
    if (!Array.isArray(list)) throw new Error('Struktur file tidak dikenali.');
    var existing = {};
    Store.library.forEach(function (p) { existing[p.id] = true; });
    var n = 0;
    list.forEach(function (p) {
      if (!p || !p.templateId) return;
      var rec = JSON.parse(JSON.stringify(p));
      if (!rec.id || existing[rec.id]) rec.id = Store.uid();
      rec.createdAt = rec.createdAt || Date.now();
      rec.updatedAt = Date.now();
      Store.library.unshift(rec);
      existing[rec.id] = true;
      n++;
    });
    persistLibrary();
    return n;
  };

  /* ------------------------------ Share URL ------------------------------ */

  function b64encode(str) {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function b64decode(str) {
    var s = str.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    return decodeURIComponent(escape(atob(s)));
  }

  Store.encodeState = function (state) {
    try { return b64encode(JSON.stringify(state)); } catch (e) { return ''; }
  };

  Store.decodeState = function (hash) {
    try { return JSON.parse(b64decode(hash)); } catch (e) { return null; }
  };

  Store.shareUrl = function (state) {
    var base = location.href.split('#')[0];
    return base + '#s=' + Store.encodeState(state);
  };

  Store.readUrlState = function () {
    var m = location.hash.match(/[#&]s=([^&]+)/);
    return m ? Store.decodeState(m[1]) : null;
  };

  /* ------------------------------ Utilitas ------------------------------- */

  Store.download = function (filename, text, mime) {
    var blob = new Blob([text], { type: (mime || 'text/plain') + ';charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  };

  Store.copy = function (text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); resolve(); }
      catch (e) { reject(e); }
      finally { document.body.removeChild(ta); }
    });
  };

})(window.PG);
