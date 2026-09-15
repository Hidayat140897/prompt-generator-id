/* ==========================================================================
   ui/app.js — kontroler utama aplikasi.
   ========================================================================== */

(function (PG) {
  'use strict';

  var UI = PG.ui, el = UI.el, Store = PG.store, S = Store.settings;

  var App = PG.app = {
    state: {
      catId: null,
      tplId: null,
      values: {},
      tab: 'preview',
      search: '',
      openCats: {},
      editingId: null,
      lastOutput: ''
    }
  };

  var dom = {};
  var saveTimer = null;

  /* ========================================================================
     Inisialisasi
     ======================================================================== */

  App.init = function () {
    dom.sidebar = document.getElementById('sidebar');
    dom.workspace = document.getElementById('workspace');
    dom.pane = document.getElementById('pane');
    dom.paneBody = document.getElementById('paneBody');
    dom.paneFoot = document.getElementById('paneFoot');
    dom.paneTabs = document.getElementById('paneTabs');
    dom.search = document.getElementById('search');
    dom.mobTabs = document.getElementById('mobTabs');

    applyTheme();

    dom.search.addEventListener('input', function () {
      App.state.search = dom.search.value;
      renderSidebar();
    });

    document.getElementById('themeBtn').addEventListener('click', function () {
      S.theme = S.theme === 'dark' ? 'light' : 'dark';
      Store.saveSettings();
      applyTheme();
    });

    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('helpBtn').addEventListener('click', openHelp);

    dom.paneTabs.addEventListener('click', function (e) {
      var t = e.target.closest('[data-tab]');
      if (!t) return;
      App.state.tab = t.dataset.tab;
      renderPane();
    });

    if (dom.mobTabs) {
      dom.mobTabs.addEventListener('click', function (e) {
        var t = e.target.closest('[data-mob]');
        if (!t) return;
        setMobView(t.dataset.mob);
      });
    }

    document.addEventListener('keydown', onKey);
    window.addEventListener('hashchange', loadFromUrl);
    window.addEventListener('resize', syncResponsive);

    renderSidebar();
    syncResponsive();

    // Prioritas pemulihan: URL share > draf terakhir > template pertama.
    if (!loadFromUrl()) {
      var d = Store.loadDraft();
      if (d && PG.getTemplate(d.catId, d.tplId)) {
        selectTemplate(d.catId, d.tplId, d.values);
      } else {
        var first = PG.categories[0];
        if (first && first.templates[0]) selectTemplate(first.id, first.templates[0].id);
      }
    }
  };

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', S.theme === 'light' ? 'light' : 'dark');
    var b = document.getElementById('themeBtn');
    if (b) b.textContent = S.theme === 'light' ? '🌙' : '☀️';
  }

  // Di layar sempit ketiga panel bergantian; di layar lebar ketiganya tampil.
  var narrowMode = false;

  function syncResponsive() {
    var narrow = window.innerWidth <= 980;
    if (narrow === narrowMode) return;
    narrowMode = narrow;
    if (narrow) {
      setMobView('workspace');
    } else {
      ['sidebar', 'workspace', 'pane'].forEach(function (k) {
        if (dom[k]) dom[k].classList.remove('hide-mob');
      });
    }
  }

  function setMobView(which) {
    ['sidebar', 'workspace', 'pane'].forEach(function (k) {
      var node = dom[k];
      if (node) node.classList.toggle('hide-mob', k !== which);
    });
    if (dom.mobTabs) {
      Array.prototype.forEach.call(dom.mobTabs.querySelectorAll('[data-mob]'), function (t) {
        t.classList.toggle('on', t.dataset.mob === which);
      });
    }
  }

  function onKey(e) {
    var mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); dom.search.focus(); dom.search.select(); }
    else if (mod && e.shiftKey && e.key.toLowerCase() === 'c') { e.preventDefault(); copyOutput(); }
    else if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); openSaveDialog(); }
  }

  /* ========================================================================
     Sidebar
     ======================================================================== */

  function renderSidebar() {
    var host = dom.sidebar;
    UI.clear(host);

    var q = App.state.search;
    if (q && q.trim()) {
      var found = PG.searchTemplates(q) || [];
      host.appendChild(el('div', { class: 'side-head', text: 'Hasil pencarian (' + found.length + ')' }));
      if (!found.length) {
        host.appendChild(el('div', { class: 'side-empty', text: 'Tidak ada template yang cocok. Coba kata lain, atau pakai "Prompt Kustom (Bebas)".' }));
        return;
      }
      found.forEach(function (t) {
        var cat = PG.getCategory(t.categoryId);
        host.appendChild(el('button', {
          class: 'tpl-btn' + (isActive(t) ? ' active' : ''),
          'aria-label': cat.name + ' — ' + t.name,
          onclick: function () { selectTemplate(t.categoryId, t.id); }
        }, [document.createTextNode(cat.icon + '  ' + t.name)]));
      });
      return;
    }

    host.appendChild(el('div', { class: 'side-head', text: 'Kategori' }));

    PG.categories.forEach(function (cat) {
      var open = App.state.openCats[cat.id] !== false && (App.state.catId === cat.id || App.state.openCats[cat.id] === true);
      var list = el('div', { class: 'tpl-list' + (open ? ' open' : '') },
        cat.templates.map(function (t) {
          return el('button', {
            class: 'tpl-btn' + (isActive(t) ? ' active' : ''),
            title: t.desc || '',
            'aria-label': t.name,
            onclick: function () { selectTemplate(cat.id, t.id); }
          }, [document.createTextNode(t.name)]);
        }));

      var btn = el('button', {
        class: 'cat-btn' + (open ? ' open' : ''),
        'aria-label': cat.name,
        'aria-expanded': open ? 'true' : 'false'
      }, [
        el('span', { class: 'emo', text: cat.icon }),
        el('span', { text: cat.name }),
        el('span', { class: 'chev', text: '▶' })
      ]);
      btn.addEventListener('click', function () {
        App.state.openCats[cat.id] = !open;
        renderSidebar();
      });

      host.appendChild(el('div', { class: 'cat' }, [btn, list]));
    });

    host.appendChild(el('div', { class: 'side-head', text: 'Pustaka' }));
    host.appendChild(el('button', {
      class: 'tpl-btn',
      onclick: function () { App.state.tab = 'library'; renderPane(); setMobView('pane'); }
    }, [document.createTextNode('📚  Prompt tersimpan (' + Store.library.length + ')')]));
  }

  function isActive(t) {
    return App.state.catId === t.categoryId && App.state.tplId === t.id;
  }

  /* ========================================================================
     Pemilihan template & workspace
     ======================================================================== */

  function selectTemplate(catId, tplId, values) {
    var tpl = PG.getTemplate(catId, tplId);
    if (!tpl) return;
    var cat = PG.getCategory(catId);

    App.state.catId = catId;
    App.state.tplId = tplId;
    App.state.values = values ? mergeValues(tpl, values) : PG.defaultValues(tpl);
    App.state.editingId = null;

    if (!S.lockFormat && cat.defaultFormat) S.format = cat.defaultFormat;

    renderSidebar();
    renderWorkspace();
    update();
    if (narrowMode) setMobView('workspace');
  }
  App.selectTemplate = selectTemplate;

  function mergeValues(tpl, saved) {
    var base = PG.defaultValues(tpl);
    Object.keys(saved || {}).forEach(function (k) { base[k] = saved[k]; });
    return base;
  }

  function currentTemplate() {
    return PG.getTemplate(App.state.catId, App.state.tplId);
  }

  function renderWorkspace() {
    var tpl = currentTemplate();
    var cat = PG.getCategory(App.state.catId);
    var host = dom.workspace;
    UI.clear(host);
    if (!tpl) return;

    host.appendChild(el('div', { class: 'ws-head' }, [
      el('div', { class: 'ws-crumb', text: cat.icon + ' ' + cat.name }),
      el('h1', { text: tpl.name }),
      el('p', { text: tpl.desc || '' })
    ]));

    var actions = el('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px' }, [
      el('button', { class: 'btn sm', text: '🎲 Acak modifier', title: 'Isi acak pilihan gaya untuk memancing ide', onclick: randomize }),
      el('button', { class: 'btn sm', text: '↺ Kosongkan', onclick: function () {
        App.state.values = PG.defaultValues(tpl);
        renderWorkspace(); update();
      } })
    ]);
    host.appendChild(actions);

    var form = el('div', {});
    host.appendChild(form);
    UI.renderFields(form, tpl, App.state.values, update);
  }

  function randomize() {
    var tpl = currentTemplate();
    if (!tpl) return;
    var changed = 0;
    tpl.fields.forEach(function (f) {
      if (f.type !== 'multi' || !f.options || f.options.length < 4) return;
      var n = 1 + Math.floor(Math.random() * 2);
      var pool = f.options.slice();
      var picked = [];
      while (picked.length < n && pool.length) {
        picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
      }
      App.state.values[f.id] = picked;
      changed++;
    });
    if (!changed) { UI.toast('Template ini tidak punya pilihan gaya untuk diacak.'); return; }
    renderWorkspace();
    update();
    UI.toast('Modifier diacak', 'ok');
  }

  /* ========================================================================
     Perhitungan output
     ======================================================================== */

  function buildCurrent() {
    var tpl = currentTemplate();
    if (!tpl) return { blocks: {}, output: '' };
    var blocks;
    try {
      blocks = tpl.build(App.state.values) || {};
    } catch (err) {
      console.error(err);
      return { blocks: {}, output: '⚠️ Gagal merakit prompt: ' + err.message };
    }
    var out = PG.compose(blocks, {
      format: S.format, lang: S.lang, answerLang: S.answerLang, numbering: S.numbering
    });
    return { tpl: tpl, blocks: blocks, output: out };
  }

  function update() {
    var r = buildCurrent();
    App.state.lastOutput = r.output;
    renderPane();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      Store.saveDraft({ catId: App.state.catId, tplId: App.state.tplId, values: App.state.values });
    }, 400);
  }
  App.update = update;

  /* ========================================================================
     Panel kanan
     ======================================================================== */

  function renderPane() {
    Array.prototype.forEach.call(dom.paneTabs.querySelectorAll('[data-tab]'), function (t) {
      t.classList.toggle('on', t.dataset.tab === App.state.tab);
    });
    UI.clear(dom.paneBody);
    UI.clear(dom.paneFoot);

    if (App.state.tab === 'library') return renderLibrary();
    if (App.state.tab === 'quality') return renderQuality();
    renderPreview();
  }

  function renderPreview() {
    var r = buildCurrent();
    var out = r.output;

    dom.paneBody.appendChild(outputControls());

    var pre = el('div', { class: 'preview' + (out ? '' : ' empty') },
      [document.createTextNode(out || 'Isi form di sebelah kiri, hasilnya muncul di sini secara langsung.')]);
    dom.paneBody.appendChild(pre);

    dom.paneBody.appendChild(el('div', { class: 'meta-row' }, [
      el('span', { html: '<b>' + PG.countWords(out) + '</b> kata' }),
      el('span', { html: '<b>' + out.length + '</b> karakter' }),
      el('span', { html: '~<b>' + PG.estimateTokens(out) + '</b> token' })
    ]));

    // Engine gambar/video jauh lebih akurat dengan Bahasa Inggris.
    if (r.blocks.raw && /(^|\s)(yang|dengan|dan|dari|sedang|seorang|sebuah|pada|untuk|di|ke)(\s|$)/i.test(r.blocks.raw)) {
      dom.paneBody.appendChild(el('div', { class: 'note', style: 'margin-top:12px',
        text: 'Prompt ini masih memuat Bahasa Indonesia. Engine gambar dan video umumnya jauh lebih akurat dengan Bahasa Inggris — pakai tombol AI lalu pilih "Ke Inggris", atau tulis langsung dalam Bahasa Inggris.' }));
    }

    var missing = requiredMissing();
    if (missing.length) {
      dom.paneBody.appendChild(el('div', { class: 'note warn', style: 'margin-top:12px',
        text: 'Field wajib masih kosong: ' + missing.join(', ') + '. Prompt tetap bisa dipakai, tapi hasilnya akan generik.' }));
    }

    dom.paneFoot.appendChild(el('button', { class: 'btn primary', text: '📋 Salin', onclick: copyOutput }));
    dom.paneFoot.appendChild(el('button', { class: 'btn', text: '💾 Simpan', onclick: openSaveDialog }));
    dom.paneFoot.appendChild(el('button', { class: 'btn', text: '⬇ Unduh', onclick: openDownload }));
    dom.paneFoot.appendChild(el('button', { class: 'btn', text: '🔗 Bagikan', onclick: shareLink }));
    dom.paneFoot.appendChild(el('button', { class: 'btn', text: '✨ AI', title: 'Perhalus prompt dengan model AI', onclick: openAiMenu }));
  }

  function outputControls() {
    var fmt = el('select', { class: 'inp', onchange: function () { S.format = fmt.value; Store.saveSettings(); update(); } },
      PG.FORMATS.map(function (f) { return el('option', { value: f.id, text: f.name }); }));
    fmt.value = S.format;

    var lang = el('select', { class: 'inp', onchange: function () { S.lang = lang.value; Store.saveSettings(); update(); } }, [
      el('option', { value: 'id', text: 'Label: Indonesia' }),
      el('option', { value: 'en', text: 'Label: English' })
    ]);
    lang.value = S.lang;

    var ans = el('select', { class: 'inp', onchange: function () { S.answerLang = ans.value; Store.saveSettings(); update(); } }, [
      el('option', { value: 'id', text: 'Jawab: Indonesia' }),
      el('option', { value: 'en', text: 'Jawab: Inggris' }),
      el('option', { value: 'same', text: 'Jawab: ikuti input' }),
      el('option', { value: '', text: 'Jawab: tidak diatur' })
    ]);
    ans.value = S.answerLang || '';

    var desc = '';
    PG.FORMATS.forEach(function (f) { if (f.id === S.format) desc = f.desc; });

    return el('div', { style: 'margin-bottom:12px' }, [
      el('div', { style: 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px' }, [fmt, lang, ans]),
      el('div', { class: 'hint', style: 'margin-top:6px', text: desc })
    ]);
  }

  function requiredMissing() {
    var tpl = currentTemplate();
    if (!tpl) return [];
    return tpl.fields.filter(function (f) {
      if (!f.required) return false;
      var v = App.state.values[f.id];
      return v == null || String(v).trim() === '';
    }).map(function (f) { return f.label; });
  }

  function renderQuality() {
    var r = buildCurrent();
    // Kriteria penilaian ditentukan oleh jenis promptnya (baris tunggal untuk
    // gambar/video), bukan oleh format tampilan yang sedang dipilih.
    var q = PG.scorePrompt(r.blocks, { raw: !!r.blocks.raw });

    dom.paneBody.appendChild(el('div', { class: 'qm' }, [
      el('div', { class: 'qm-top' }, [
        el('span', { class: 'qm-score', text: q.score + '', style: 'color:' + q.color }),
        el('span', { class: 'qm-label', text: '/ 100 — ' + q.label })
      ]),
      el('div', { class: 'qm-bar' }, [
        el('div', { class: 'qm-fill', style: 'width:' + q.score + '%;background:' + q.color })
      ]),
      el('ul', { class: 'qm-tips' }, q.checks.map(function (c) {
        return el('li', { class: c.pass ? 'ok' : '' }, [
          el('span', { class: 'dot', text: c.pass ? '✓' : '!' }),
          el('span', { text: c.pass ? c.label : c.tip })
        ]);
      }))
    ]));

    dom.paneBody.appendChild(el('div', { class: 'note',
      text: 'Skor ini dihitung dari kelengkapan struktur, bukan dari isi. Prompt bernilai 100 tetap perlu isi yang akurat.' }));

    dom.paneFoot.appendChild(el('button', { class: 'btn', text: '← Pratinjau', onclick: function () { App.state.tab = 'preview'; renderPane(); } }));
    dom.paneFoot.appendChild(el('button', { class: 'btn primary', text: '🔍 Minta AI mengkritik', onclick: function () { runAi('critique'); } }));
  }

  /* ========================================================================
     Pustaka
     ======================================================================== */

  function renderLibrary() {
    var list = Store.library;
    if (!list.length) {
      dom.paneBody.appendChild(el('div', { class: 'empty-state' }, [
        el('div', { class: 'big', text: '📚' }),
        el('div', { text: 'Belum ada prompt tersimpan.' }),
        el('div', { class: 'hint', style: 'margin-top:6px', text: 'Tekan Simpan di tab Pratinjau untuk menyimpan prompt ke sini.' })
      ]));
    } else {
      var sorted = list.slice().sort(function (a, b) {
        return (b.fav ? 1 : 0) - (a.fav ? 1 : 0) || b.updatedAt - a.updatedAt;
      });
      sorted.forEach(function (p) {
        var cat = PG.getCategory(p.categoryId);
        var tpl = PG.getTemplate(p.categoryId, p.templateId);
        dom.paneBody.appendChild(el('div', { class: 'lib-item' }, [
          el('div', { class: 't', onclick: function () { loadPrompt(p.id); } }, [
            el('span', { text: p.fav ? '★' : '☆' }),
            el('span', { text: p.name })
          ]),
          el('div', { class: 's' }, [
            el('span', { text: (cat ? cat.icon + ' ' + cat.name : p.categoryId) }),
            el('span', { text: tpl ? tpl.name : p.templateId }),
            el('span', { text: new Date(p.updatedAt).toLocaleDateString('id-ID') })
          ]),
          el('div', { class: 'acts' }, [
            el('button', { class: 'btn sm', text: 'Buka', onclick: function () { loadPrompt(p.id); } }),
            el('button', { class: 'btn sm', text: 'Salin', onclick: function () {
              Store.copy(p.output || '').then(function () { UI.toast('Tersalin', 'ok'); });
            } }),
            el('button', { class: 'btn sm', text: p.fav ? '★' : '☆', onclick: function () {
              Store.toggleFav(p.id); renderPane();
            } }),
            el('button', { class: 'btn sm danger', text: 'Hapus', onclick: function () { confirmDelete(p); } })
          ])
        ]));
      });
    }

    dom.paneFoot.appendChild(el('button', { class: 'btn', text: '⬆ Ekspor', onclick: function () {
      Store.download('prompt-library-' + new Date().toISOString().slice(0, 10) + '.json', Store.exportLibrary(), 'application/json');
      UI.toast('Pustaka diekspor', 'ok');
    } }));
    dom.paneFoot.appendChild(el('button', { class: 'btn', text: '⬇ Impor', onclick: importLibrary }));
    dom.paneFoot.appendChild(el('button', { class: 'btn', text: '← Pratinjau', onclick: function () { App.state.tab = 'preview'; renderPane(); } }));
  }

  function confirmDelete(p) {
    UI.modal({
      title: 'Hapus prompt?',
      body: el('div', { text: '"' + p.name + '" akan dihapus permanen dari browser ini. Tindakan ini tidak bisa dibatalkan.' }),
      actions: [
        { label: 'Batal' },
        { label: 'Hapus', kind: 'danger', onClick: function () {
          Store.deletePrompt(p.id);
          renderPane(); renderSidebar();
          UI.toast('Prompt dihapus');
        } }
      ]
    });
  }

  function loadPrompt(id) {
    var p = Store.getPrompt(id);
    if (!p) return;
    if (!PG.getTemplate(p.categoryId, p.templateId)) {
      UI.toast('Template untuk prompt ini tidak ditemukan.', 'err');
      return;
    }
    if (p.settings) {
      if (p.settings.format) S.format = p.settings.format;
      if (p.settings.lang) S.lang = p.settings.lang;
      if ('answerLang' in p.settings) S.answerLang = p.settings.answerLang;
    }
    selectTemplate(p.categoryId, p.templateId, p.values);
    App.state.editingId = p.id;
    App.state.tab = 'preview';
    renderPane();
    setMobView('workspace');
    UI.toast('Prompt dimuat: ' + p.name, 'ok');
  }

  function importLibrary() {
    var input = el('input', { type: 'file', accept: '.json,application/json' });
    input.addEventListener('change', function () {
      var file = input.files && input.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var n = Store.importLibrary(String(reader.result));
          renderPane(); renderSidebar();
          UI.toast(n + ' prompt diimpor', 'ok');
        } catch (err) {
          UI.toast('Gagal impor: ' + err.message, 'err');
        }
      };
      reader.readAsText(file);
    });
    input.click();
  }

  /* ========================================================================
     Aksi output
     ======================================================================== */

  function copyOutput() {
    var out = buildCurrent().output;
    if (!out) { UI.toast('Belum ada yang bisa disalin.', 'err'); return; }
    Store.copy(out).then(function () {
      UI.toast('Prompt tersalin ke clipboard', 'ok');
    }).catch(function () {
      UI.toast('Browser menolak akses clipboard. Salin manual dari pratinjau.', 'err');
    });
  }

  function openSaveDialog() {
    var tpl = currentTemplate();
    if (!tpl) return;
    var existing = App.state.editingId ? Store.getPrompt(App.state.editingId) : null;

    var nameInput = el('input', { class: 'inp', type: 'text', placeholder: 'mis. Artikel SEO — software akuntansi' });
    nameInput.value = existing ? existing.name : (tpl.name + ' — ' + new Date().toLocaleDateString('id-ID'));

    var tagInput = el('input', { class: 'inp', type: 'text', placeholder: 'pisahkan dengan koma' });
    tagInput.value = existing ? (existing.tags || []).join(', ') : '';

    UI.modal({
      title: existing ? 'Perbarui prompt tersimpan' : 'Simpan prompt',
      body: [
        UI.field('Nama', nameInput),
        UI.field('Tag', tagInput, 'Opsional, memudahkan pencarian nanti.'),
        el('div', { class: 'note', text: 'Prompt disimpan di localStorage browser ini saja. Gunakan Ekspor untuk memindahkannya ke perangkat lain.' })
      ],
      actions: [
        { label: 'Batal' },
        existing ? { label: 'Simpan sebagai baru', onClick: function () { doSave(nameInput.value, tagInput.value, null); } } : null,
        { label: existing ? 'Perbarui' : 'Simpan', kind: 'primary', onClick: function () {
          doSave(nameInput.value, tagInput.value, existing ? existing.id : null);
        } }
      ].filter(Boolean)
    });
  }

  function doSave(name, tags, id) {
    var r = buildCurrent();
    var rec = Store.savePrompt({
      id: id || undefined,
      name: (name || '').trim() || 'Tanpa judul',
      categoryId: App.state.catId,
      templateId: App.state.tplId,
      values: App.state.values,
      settings: { format: S.format, lang: S.lang, answerLang: S.answerLang },
      output: r.output,
      tags: PG.h.split(tags)
    });
    App.state.editingId = rec.id;
    renderSidebar();
    UI.toast('Tersimpan di pustaka', 'ok');
  }

  function openDownload() {
    var r = buildCurrent();
    var tpl = currentTemplate();
    var base = slug(tpl ? tpl.name : 'prompt');

    UI.modal({
      title: 'Unduh prompt',
      body: el('div', { class: 'hint', text: 'Pilih format berkas yang ingin diunduh.' }),
      actions: [
        { label: '.txt', onClick: function () { Store.download(base + '.txt', r.output, 'text/plain'); } },
        { label: '.md', onClick: function () { Store.download(base + '.md', '# ' + (tpl ? tpl.name : 'Prompt') + '\n\n' + r.output, 'text/markdown'); } },
        { label: '.json', kind: 'primary', onClick: function () {
          Store.download(base + '.json', JSON.stringify({
            template: App.state.tplId, category: App.state.catId,
            settings: { format: S.format, lang: S.lang, answerLang: S.answerLang },
            values: App.state.values, prompt: r.output
          }, null, 2), 'application/json');
        } }
      ]
    });
  }

  function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'prompt';
  }

  function shareLink() {
    var url = Store.shareUrl({
      c: App.state.catId, t: App.state.tplId, v: App.state.values,
      s: { format: S.format, lang: S.lang, answerLang: S.answerLang }
    });
    if (url.length > 7500) {
      UI.toast('Isi prompt terlalu panjang untuk dibagikan lewat tautan. Gunakan Unduh atau Ekspor.', 'err');
      return;
    }
    Store.copy(url).then(function () {
      UI.toast('Tautan tersalin. Buka di perangkat lain untuk memuat isian yang sama.', 'ok');
      history.replaceState(null, '', url);
    }).catch(function () {
      UI.modal({ title: 'Tautan berbagi', body: el('textarea', { class: 'inp', rows: 4, readonly: 'readonly' }, [document.createTextNode(url)]) });
    });
  }

  function loadFromUrl() {
    var st = Store.readUrlState();
    if (!st || !st.c || !st.t) return false;
    if (!PG.getTemplate(st.c, st.t)) return false;
    if (st.s) {
      if (st.s.format) { S.format = st.s.format; S.lockFormat = true; }
      if (st.s.lang) S.lang = st.s.lang;
      if ('answerLang' in st.s) S.answerLang = st.s.answerLang;
    }
    selectTemplate(st.c, st.t, st.v);
    UI.toast('Isian dimuat dari tautan', 'ok');
    return true;
  }

  /* ========================================================================
     AI opsional
     ======================================================================== */

  function openAiMenu() {
    if (!S.ai.apiKey) {
      UI.modal({
        title: 'API key belum diisi',
        body: [
          el('div', { text: 'Fitur AI memerlukan API key milikmu sendiri. Semua template dan pratinjau tetap berfungsi penuh tanpa ini.' }),
          el('div', { class: 'note', text: 'Key disimpan di browser ini saja dan dikirim langsung ke penyedia model, tidak melewati server lain.' })
        ],
        actions: [
          { label: 'Nanti' },
          { label: 'Buka Pengaturan AI', kind: 'primary', onClick: openSettings }
        ]
      });
      return;
    }

    UI.modal({
      title: 'Sempurnakan dengan AI',
      body: el('div', { style: 'display:flex;flex-direction:column;gap:8px' },
        PG.ai.ACTIONS.map(function (a) {
          return el('button', {
            class: 'btn', style: 'justify-content:flex-start;padding:12px 14px;text-align:left',
            onclick: function () { closeAll(); runAi(a.id); }
          }, [
            el('span', { style: 'font-size:16px', text: a.icon }),
            el('span', {}, [
              el('div', { text: a.name, style: 'font-weight:700' }),
              el('div', { class: 'hint', text: a.desc })
            ])
          ]);
        }))
    });
  }

  function closeAll() {
    Array.prototype.forEach.call(document.querySelectorAll('.modal-bg'), function (m) {
      if (m.parentNode) m.parentNode.removeChild(m);
    });
  }

  function runAi(action) {
    if (!S.ai.apiKey) { openAiMenu(); return; }
    var prompt = buildCurrent().output;
    var tpl = currentTemplate();

    var body = el('div', { style: 'display:flex;align-items:center;gap:10px' }, [
      el('span', { class: 'spin' }),
      el('span', { text: 'Menghubungi ' + PG.ai.getProvider(S.ai.provider).name + '…' })
    ]);
    var close = UI.modal({ title: 'Memproses', body: body, wide: true });

    PG.ai.run(action, prompt, S.ai, tpl ? tpl.name : '')
      .then(function (text) {
        close();
        showAiResult(action, text);
      })
      .catch(function (err) {
        close();
        UI.modal({
          title: 'Gagal memanggil AI',
          body: [
            el('div', { text: err.message || String(err) }),
            el('div', { class: 'note warn', text: 'Penyebab tersering: API key salah, kuota habis, atau halaman dibuka langsung dari berkas (file://) sehingga permintaan diblokir CORS. Jalankan lewat server lokal atau hosting.' })
          ],
          actions: [{ label: 'Tutup' }, { label: 'Buka Pengaturan', kind: 'primary', onClick: openSettings }]
        });
      });
  }

  function showAiResult(action, text) {
    var ta = el('textarea', { class: 'inp', rows: 16, style: 'font-family:var(--mono);font-size:12.5px' });
    ta.value = text || '(kosong)';

    var acts = [
      { label: 'Tutup' },
      { label: '📋 Salin', onClick: function () {
        Store.copy(ta.value).then(function () { UI.toast('Tersalin', 'ok'); });
        return false;
      }, keepOpen: true }
    ];

    if (action === 'refine' || action === 'translate') {
      acts.push({ label: 'Simpan sebagai prompt baru', kind: 'primary', onClick: function () {
        Store.savePrompt({
          name: (currentTemplate() || {}).name + ' — hasil AI',
          categoryId: App.state.catId, templateId: App.state.tplId,
          values: App.state.values,
          settings: { format: S.format, lang: S.lang, answerLang: S.answerLang },
          output: ta.value, tags: ['ai']
        });
        renderSidebar();
        UI.toast('Disimpan ke pustaka', 'ok');
      } });
    }

    UI.modal({
      title: 'Hasil AI — ' + action,
      wide: true,
      body: [
        el('div', { class: 'hint', text: 'Teks ini bisa disunting langsung sebelum disalin atau disimpan.' }),
        ta
      ],
      actions: acts
    });
  }

  /* ========================================================================
     Pengaturan
     ======================================================================== */

  function openSettings() {
    var provSel = el('select', { class: 'inp' }, PG.ai.PROVIDERS.map(function (p) {
      return el('option', { value: p.id, text: p.name });
    }));
    provSel.value = S.ai.provider;

    var modelSel = el('input', { class: 'inp', type: 'text', placeholder: 'nama model' });
    modelSel.value = S.ai.model || '';

    var modelList = el('div', { class: 'chips' });
    function fillModels() {
      UI.clear(modelList);
      PG.ai.getProvider(provSel.value).models.forEach(function (m) {
        modelList.appendChild(el('div', { class: 'chip', text: m, onclick: function () { modelSel.value = m; } }));
      });
    }
    fillModels();

    var keyInput = el('input', { class: 'inp', type: 'password', placeholder: 'API key' });
    keyInput.value = S.ai.apiKey || '';

    var baseInput = el('input', { class: 'inp', type: 'text', placeholder: 'https://... (khusus provider custom)' });
    baseInput.value = S.ai.baseUrl || '';

    var tempInput = el('input', { class: 'inp', type: 'number', min: 0, max: 2, step: 0.1 });
    tempInput.value = S.ai.temperature;

    var rememberBox = el('input', { type: 'checkbox' });
    rememberBox.checked = S.ai.remember !== false;

    var lockBox = el('input', { type: 'checkbox' });
    lockBox.checked = !!S.lockFormat;

    var numBox = el('input', { type: 'checkbox' });
    numBox.checked = !!S.numbering;

    var keyHint = el('div', { class: 'hint', text: PG.ai.getProvider(provSel.value).keyHint });
    provSel.addEventListener('change', function () {
      fillModels();
      keyHint.textContent = PG.ai.getProvider(provSel.value).keyHint;
      var models = PG.ai.getProvider(provSel.value).models;
      if (models.length) modelSel.value = models[0];
    });

    UI.modal({
      title: 'Pengaturan',
      wide: true,
      body: [
        el('h3', { text: 'Tampilan prompt', style: 'margin:0;font-size:12px;letter-spacing:.08em;color:var(--text-faint)' }),
        UI.field('Nomori setiap bagian', el('label', { class: 'switch' }, [numBox, el('span', { class: 'track' })])),
        UI.field('Kunci format output', el('label', { class: 'switch' }, [lockBox, el('span', { class: 'track' })]),
          'Jika aktif, format tidak berubah otomatis saat berpindah kategori.'),

        el('hr', { style: 'border:0;border-top:1px solid var(--border);margin:4px 0' }),
        el('h3', { text: 'Penyempurnaan AI (opsional)', style: 'margin:0;font-size:12px;letter-spacing:.08em;color:var(--text-faint)' }),
        el('div', { class: 'note', text: 'API key disimpan di localStorage browser ini dan dikirim langsung ke penyedia model. Jangan gunakan fitur ini di komputer bersama.' }),
        UI.field('Provider', provSel),
        UI.field('Model', modelSel),
        modelList,
        UI.field('API key', keyInput, PG.ai.getProvider(provSel.value).keyHint),
        keyHint,
        UI.field('Base URL', baseInput, 'Hanya untuk provider custom / server lokal yang kompatibel OpenAI.'),
        UI.field('Temperature', tempInput, '0 = konsisten, 1 = kreatif.'),
        UI.field('Ingat API key di browser ini', el('label', { class: 'switch' }, [rememberBox, el('span', { class: 'track' })])),

        el('hr', { style: 'border:0;border-top:1px solid var(--border);margin:4px 0' }),
        el('button', { class: 'btn danger', text: 'Hapus semua data lokal', onclick: function () {
          UI.modal({
            title: 'Hapus semua data?',
            body: el('div', { text: 'Seluruh prompt tersimpan, draf, dan pengaturan di browser ini akan dihapus permanen.' }),
            actions: [
              { label: 'Batal' },
              { label: 'Hapus semua', kind: 'danger', onClick: function () {
                Store.clearLibrary(); Store.clearDraft(); Store.resetSettings();
                location.reload();
              } }
            ]
          });
        } })
      ],
      actions: [
        { label: 'Batal' },
        { label: 'Simpan', kind: 'primary', onClick: function () {
          S.numbering = numBox.checked;
          S.lockFormat = lockBox.checked;
          S.ai.provider = provSel.value;
          S.ai.model = modelSel.value.trim();
          S.ai.apiKey = keyInput.value.trim();
          S.ai.baseUrl = baseInput.value.trim();
          S.ai.temperature = parseFloat(tempInput.value);
          S.ai.remember = rememberBox.checked;
          Store.saveSettings();
          update();
          UI.toast('Pengaturan disimpan', 'ok');
        } }
      ]
    });
  }

  function openHelp() {
    UI.modal({
      title: 'Cara pakai',
      wide: true,
      body: [
        el('div', { html:
          '<p style="margin:0 0 10px"><b>1.</b> Pilih kategori lalu template di panel kiri.</p>' +
          '<p style="margin:0 0 10px"><b>2.</b> Isi form di tengah. Field bertanda <span class="req">*</span> paling menentukan kualitas hasil.</p>' +
          '<p style="margin:0 0 10px"><b>3.</b> Prompt terbentuk otomatis di panel kanan. Ganti format sesuai model tujuan: <b>XML</b> untuk Claude, <b>Terstruktur</b> untuk ChatGPT/Gemini, <b>Baris Tunggal</b> untuk Midjourney dan sejenisnya.</p>' +
          '<p style="margin:0 0 10px"><b>4.</b> Cek tab <b>Kualitas</b> untuk melihat bagian mana yang masih kurang.</p>' +
          '<p style="margin:0"><b>5.</b> Salin, simpan ke pustaka, unduh, atau bagikan lewat tautan.</p>'
        }),
        el('div', { class: 'note', html:
          'Pintasan: <span class="kbd">Ctrl</span>+<span class="kbd">K</span> cari template · ' +
          '<span class="kbd">Ctrl</span>+<span class="kbd">S</span> simpan · ' +
          '<span class="kbd">Ctrl</span>+<span class="kbd">Shift</span>+<span class="kbd">C</span> salin prompt'
        }),
        el('div', { class: 'hint', text:
          'Seluruh data tersimpan di browser ini. Tidak ada server, tidak ada akun, tidak ada data yang dikirim ke mana pun kecuali saat kamu menekan tombol AI.' })
      ]
    });
  }

})(window.PG);
