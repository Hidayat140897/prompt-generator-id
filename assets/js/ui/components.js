/* ==========================================================================
   ui/components.js — perender field form dan utilitas DOM kecil.
   ========================================================================== */

(function (PG) {
  'use strict';

  var UI = PG.ui = PG.ui || {};

  /** Pembuat elemen ringkas: el('div', {class:'x'}, [child, 'teks']) */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') node.addEventListener(k.slice(2), v);
        else if (k === 'dataset') Object.keys(v).forEach(function (d) { node.dataset[d] = v[d]; });
        else node.setAttribute(k, v);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null || c === false) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }
  UI.el = el;

  UI.clear = function (node) { while (node.firstChild) node.removeChild(node.firstChild); };

  /* ------------------------------ Field ---------------------------------- */

  function labelFor(f) {
    var kids = [document.createTextNode(f.label)];
    if (f.required) kids.push(el('span', { class: 'req', text: '*' }));
    return el('label', {}, kids);
  }

  function wrap(f, control) {
    var kids = [labelFor(f), control];
    if (f.hint) kids.push(el('div', { class: 'hint', text: f.hint }));
    return el('div', { class: 'field' + (f.wide ? ' wide' : '') }, kids);
  }

  /**
   * Render satu field.
   * @param {object} f definisi field
   * @param {object} values objek nilai (dimutasi langsung)
   * @param {function} onChange dipanggil setiap nilai berubah
   */
  UI.renderField = function (f, values, onChange) {
    var t = f.type || 'text';
    var val = values[f.id];

    if (t === 'textarea') {
      var ta = el('textarea', {
        class: 'inp', rows: f.rows || 3, placeholder: f.placeholder || '',
        oninput: function () { values[f.id] = ta.value; onChange(); }
      });
      ta.value = val || '';
      return wrap(f, ta);
    }

    if (t === 'select') {
      var sel = el('select', {
        class: 'inp',
        onchange: function () { values[f.id] = sel.value; onChange(); }
      }, (f.options || []).map(function (o) {
        return el('option', { value: o, text: o });
      }));
      sel.value = val != null && val !== '' ? val : (f.default || (f.options || [])[0] || '');
      values[f.id] = sel.value;
      return wrap(f, sel);
    }

    if (t === 'multi') {
      var current = Array.isArray(val) ? val.slice() : [];
      values[f.id] = current;
      var box = el('div', { class: 'chips' }, (f.options || []).map(function (o) {
        var on = current.indexOf(o) !== -1;
        var chip = el('div', {
          class: 'chip' + (on ? ' on' : ''), text: o, role: 'button', tabindex: '0'
        });
        function toggle() {
          var i = current.indexOf(o);
          if (i === -1) current.push(o); else current.splice(i, 1);
          chip.classList.toggle('on');
          onChange();
        }
        chip.addEventListener('click', toggle);
        chip.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        });
        return chip;
      }));
      return wrap(f, box);
    }

    if (t === 'toggle') {
      var input = el('input', { type: 'checkbox' });
      input.checked = !!val;
      input.addEventListener('change', function () { values[f.id] = input.checked; onChange(); });
      var sw = el('label', { class: 'switch' }, [input, el('span', { class: 'track' })]);
      return wrap(f, sw);
    }

    if (t === 'range') {
      var out = el('span', { class: 'val', text: String(val != null ? val : f.default || 0) });
      var rng = el('input', {
        type: 'range', min: f.min != null ? f.min : 0, max: f.max != null ? f.max : 100,
        step: f.step || 1
      });
      rng.value = val != null && val !== '' ? val : (f.default != null ? f.default : f.min || 0);
      values[f.id] = Number(rng.value);
      rng.addEventListener('input', function () {
        values[f.id] = Number(rng.value);
        out.textContent = rng.value;
        onChange();
      });
      return wrap(f, el('div', { class: 'range-row' }, [rng, out]));
    }

    if (t === 'number') {
      var num = el('input', {
        class: 'inp', type: 'number', placeholder: f.placeholder || '',
        min: f.min, max: f.max, step: f.step || 1,
        oninput: function () { values[f.id] = num.value; onChange(); }
      });
      num.value = val != null ? val : '';
      return wrap(f, num);
    }

    // text & tags
    var inp = el('input', {
      class: 'inp', type: 'text', placeholder: f.placeholder || '',
      oninput: function () { values[f.id] = inp.value; onChange(); }
    });
    inp.value = val || '';
    return wrap(f, inp);
  };

  /**
   * Render seluruh field sebuah template, dikelompokkan per section.
   */
  UI.renderFields = function (container, tpl, values, onChange) {
    UI.clear(container);
    var groups = [];
    var index = {};
    (tpl.fields || []).forEach(function (f) {
      var s = f.section || 'Detail';
      if (!index[s]) { index[s] = []; groups.push(s); }
      index[s].push(f);
    });

    groups.forEach(function (name) {
      var grid = el('div', { class: 'grid' }, index[name].map(function (f) {
        return UI.renderField(f, values, onChange);
      }));
      container.appendChild(el('div', { class: 'card' }, [
        el('h3', { text: name }), grid
      ]));
    });
  };

  /* ------------------------------ Toast ---------------------------------- */

  UI.toast = function (msg, kind) {
    var host = document.getElementById('toasts');
    if (!host) return;
    var t = el('div', { class: 'toast' + (kind ? ' ' + kind : ''), text: msg });
    host.appendChild(t);
    setTimeout(function () {
      t.style.transition = 'opacity .25s';
      t.style.opacity = '0';
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 260);
    }, kind === 'err' ? 4200 : 2100);
  };

  /* ------------------------------ Modal ---------------------------------- */

  /**
   * Tampilkan modal sederhana.
   * @param {{title:string, body:Node|Array, actions:Array, wide?:boolean}} o
   * @returns {function} penutup modal
   */
  UI.modal = function (o) {
    var bg = el('div', { class: 'modal-bg on' });
    var body = el('div', { class: 'modal-body' },
      Array.isArray(o.body) ? o.body : [o.body]);

    function close() { if (bg.parentNode) bg.parentNode.removeChild(bg); document.removeEventListener('keydown', esc); }
    function esc(e) { if (e.key === 'Escape') close(); }

    var foot = el('div', { class: 'modal-foot' }, (o.actions || []).map(function (a) {
      return el('button', {
        class: 'btn ' + (a.kind || ''),
        text: a.label,
        onclick: function () { if (!a.onClick || a.onClick(close) !== false) { if (!a.keepOpen) close(); } }
      });
    }));

    var modal = el('div', { class: 'modal' + (o.wide ? ' wide' : '') }, [
      el('div', { class: 'modal-head' }, [
        el('h2', { text: o.title }),
        el('div', { style: 'flex:1' }),
        el('button', { class: 'btn ghost icon', text: '✕', onclick: close })
      ]),
      body,
      (o.actions && o.actions.length) ? foot : null
    ]);

    bg.appendChild(modal);
    bg.addEventListener('mousedown', function (e) { if (e.target === bg) close(); });
    document.addEventListener('keydown', esc);
    document.body.appendChild(bg);
    return close;
  };

  UI.field = function (label, control, hint) {
    var kids = [el('label', { text: label }), control];
    if (hint) kids.push(el('div', { class: 'hint', text: hint }));
    return el('div', { class: 'field' }, kids);
  };

})(window.PG);
