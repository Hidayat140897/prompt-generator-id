/* ==========================================================================
   quality.js — penilaian kualitas prompt secara heuristik (tanpa API).
   Memberi skor 0-100 plus saran perbaikan yang bisa ditindaklanjuti.
   ========================================================================== */

(function (PG) {
  'use strict';

  var CHECKS = [
    {
      id: 'role', weight: 12, label: 'Peran / persona ditetapkan',
      tip: 'Tambahkan peran ("Kamu adalah editor senior...") agar model punya sudut pandang yang jelas.',
      test: function (b) { return len(b.role) > 15; }
    },
    {
      id: 'context', weight: 18, label: 'Konteks cukup detail',
      tip: 'Isi kolom konteks lebih rinci: latar, audiens, dan batasan dunia nyata.',
      test: function (b) { return len(b.context) > 60; }
    },
    {
      id: 'task', weight: 20, label: 'Tugas spesifik dan terukur',
      tip: 'Perjelas tugasnya. Hindari kata umum seperti "buatkan sesuatu tentang ...".',
      test: function (b) { return len(b.task) > 40; }
    },
    {
      id: 'constraints', weight: 14, label: 'Batasan / aturan disebutkan',
      tip: 'Tambahkan batasan: panjang, gaya, hal yang harus dihindari, atau sumber yang boleh dipakai.',
      test: function (b) { return len(b.constraints) > 20; }
    },
    {
      id: 'output', weight: 16, label: 'Format output didefinisikan',
      tip: 'Sebutkan bentuk keluaran yang diinginkan (tabel, JSON, poin, jumlah kata).',
      test: function (b) { return len(b.output) > 20; }
    },
    {
      id: 'examples', weight: 10, label: 'Ada contoh (few-shot)',
      tip: 'Satu contoh input-output menaikkan konsistensi hasil secara drastis.',
      test: function (b) { return len(b.examples) > 20; }
    },
    {
      id: 'success', weight: 10, label: 'Kriteria berhasil jelas',
      tip: 'Tuliskan tolok ukur "hasil dianggap baik jika ..." supaya model bisa mengoreksi diri.',
      test: function (b) { return len(b.success) > 15; }
    }
  ];

  // Untuk prompt baris tunggal (gambar/video) kriterianya berbeda.
  var RAW_CHECKS = [
    {
      id: 'subject', weight: 30, label: 'Subjek utama jelas',
      tip: 'Sebutkan subjek utama secara konkret di awal prompt.',
      test: function (b) { return len(b.raw) > 25; }
    },
    {
      id: 'detail', weight: 25, label: 'Detail visual memadai',
      tip: 'Tambahkan detail: gaya, pencahayaan, komposisi, suasana, warna.',
      test: function (b) { return String(b.raw || '').split(',').length >= 5; }
    },
    {
      id: 'style', weight: 20, label: 'Gaya / medium disebut',
      tip: 'Pilih gaya atau medium (fotografi, ilustrasi, 3D render, sinematik).',
      test: function (b) {
        return /photo|cinematic|illustration|render|anime|paint|sketch|3d|film|foto|lukis|realis/i.test(String(b.raw || ''));
      }
    },
    {
      id: 'params', weight: 15, label: 'Parameter teknis diatur',
      tip: 'Set rasio aspek dan parameter engine agar hasil sesuai kebutuhan.',
      test: function (b) { return len(b.params) > 2; }
    },
    {
      id: 'negative', weight: 10, label: 'Negative prompt diisi',
      tip: 'Isi daftar hal yang ingin dihindari untuk menekan artefak.',
      test: function (b) { return len(b.negative) > 3; }
    }
  ];

  function len(v) {
    if (v == null) return 0;
    if (Array.isArray(v)) return v.join(' ').trim().length;
    return String(v).trim().length;
  }

  /**
   * Nilai kualitas berdasarkan blok mentah (bukan teks jadi), supaya
   * penilaian tidak terpengaruh format output yang dipilih.
   * @returns {{score:number, label:string, color:string, checks:Array}}
   */
  PG.scorePrompt = function (blocks, opts) {
    blocks = blocks || {};
    opts = opts || {};
    var isRaw = opts.raw || (!!blocks.raw && !len(blocks.context) && !len(blocks.task));
    var set = isRaw ? RAW_CHECKS : CHECKS;

    var total = 0, max = 0, results = [];
    set.forEach(function (c) {
      var pass = false;
      try { pass = !!c.test(blocks); } catch (e) { pass = false; }
      max += c.weight;
      if (pass) total += c.weight;
      results.push({ id: c.id, label: c.label, tip: c.tip, pass: pass, weight: c.weight });
    });

    var score = max ? Math.round((total / max) * 100) : 0;
    return {
      score: score,
      label: labelFor(score),
      color: colorFor(score),
      checks: results
    };
  };

  function labelFor(s) {
    if (s >= 88) return 'Sangat kuat';
    if (s >= 70) return 'Bagus';
    if (s >= 50) return 'Cukup';
    if (s >= 28) return 'Lemah';
    return 'Terlalu tipis';
  }

  function colorFor(s) {
    if (s >= 88) return 'var(--accent-2)';
    if (s >= 70) return '#7bc96f';
    if (s >= 50) return 'var(--warn)';
    return 'var(--danger)';
  }

})(window.PG);
