/* ==========================================================================
   store.js — state aplikasi, penyimpanan lokal, ekspor/impor, share URL.
   Semua data (termasuk API key) hanya tersimpan di browser pengguna.
   ========================================================================== */

(function (PG) {
  'use strict';

  var KEY_SETTINGS = 'pg:settings:v1';
  var KEY_LIBRARY = 'pg:library:v1';
  var KEY_DRAFT = 'pg:draft:v1';

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

  Store.saveDraft = function (draft) { write(KEY_DRAFT, draft); };
  Store.loadDraft = function () { return read(KEY_DRAFT, null); };
  Store.clearDraft = function () { try { localStorage.removeItem(KEY_DRAFT); } catch (e) {} };

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
