/* ==========================================================================
   modifiers.js — pustaka modifier yang dipakai bersama oleh template
   gambar dan video. Ditulis dalam Bahasa Inggris karena itulah bahasa
   yang paling dipahami oleh engine generatif.
   ========================================================================== */

(function (PG) {
  'use strict';

  PG.MOD = {

    /* ------------------------------ Gambar ------------------------------- */

    styles: [
      'photorealistic', 'cinematic film still', 'editorial photography', 'documentary photo',
      'digital illustration', 'oil painting', 'watercolor', 'ink sketch', 'charcoal drawing',
      'flat vector illustration', 'isometric illustration', 'low poly 3D', 'octane render',
      'unreal engine 5 render', 'claymation', 'pixel art', 'anime key visual', 'manga panel',
      'studio ghibli inspired', 'comic book art', 'art deco poster', 'bauhaus graphic',
      'risograph print', 'collage mixed media', 'blueprint technical drawing', 'papercut layered art'
    ],

    lighting: [
      'golden hour light', 'blue hour', 'soft diffused daylight', 'harsh midday sun',
      'overcast soft light', 'studio softbox lighting', 'rembrandt lighting', 'split lighting',
      'rim lighting', 'backlit silhouette', 'volumetric god rays', 'neon glow',
      'candlelight', 'moonlight', 'firelight', 'bioluminescent glow',
      'high key lighting', 'low key chiaroscuro', 'practical lights in frame', 'dappled light through leaves'
    ],

    camera: [
      'shot on 35mm film', 'shot on 85mm portrait lens', 'wide angle 24mm', 'ultra wide 16mm',
      'telephoto 200mm compression', 'macro lens extreme close-up', 'tilt-shift miniature',
      'fisheye distortion', 'shallow depth of field f/1.4', 'deep focus f/16',
      'long exposure motion blur', 'high speed freeze frame', 'drone aerial view',
      'worm eye view', 'bird eye view', 'dutch angle', 'over the shoulder', 'first person POV'
    ],

    composition: [
      'rule of thirds', 'centered symmetrical composition', 'leading lines', 'golden ratio framing',
      'negative space', 'foreground framing', 'extreme close-up', 'medium shot', 'full body shot',
      'wide establishing shot', 'flat lay top down', 'diagonal dynamic composition', 'layered depth'
    ],

    mood: [
      'serene and calm', 'melancholic', 'dramatic and tense', 'joyful and vibrant',
      'mysterious', 'nostalgic', 'epic and heroic', 'intimate and warm', 'cold and clinical',
      'dreamlike surreal', 'gritty and raw', 'luxurious and elegant', 'playful', 'ominous'
    ],

    colors: [
      'warm earth tones', 'cool blue palette', 'monochrome black and white', 'sepia toned',
      'pastel palette', 'vivid saturated colors', 'muted desaturated tones', 'teal and orange grade',
      'high contrast', 'duotone', 'neon cyberpunk palette', 'natural film stock colors',
      'kodak portra 400 look', 'fuji velvia look', 'bleach bypass'
    ],

    quality: [
      'highly detailed', 'sharp focus', '8k resolution', 'professional grade',
      'intricate details', 'photorealistic textures', 'award winning', 'trending on artstation',
      'clean crisp edges', 'subsurface scattering', 'ray traced reflections', 'physically based rendering'
    ],

    negativePresets: {
      'Umum': 'blurry, low quality, jpeg artifacts, watermark, signature, text, logo, cropped, out of frame',
      'Manusia': 'extra fingers, deformed hands, mutated limbs, bad anatomy, asymmetrical eyes, disfigured face, extra limbs, long neck',
      'Produk': 'cluttered background, distracting objects, harsh reflections, dust, scratches, misaligned label, distorted proportions',
      'Ilustrasi': 'muddy colors, inconsistent line weight, unfinished sketch lines, oversaturated, jpeg noise',
      'Arsitektur': 'warped perspective, bent straight lines, floating objects, impossible geometry, lens distortion',
      'Teks bersih': 'misspelled text, gibberish letters, random characters, duplicated words'
    },

    aspect: ['1:1', '4:3', '3:4', '16:9', '9:16', '3:2', '2:3', '21:9', '4:5', '5:4'],

    /* ------------------------------- Video ------------------------------- */

    cameraMove: [
      'static locked-off shot', 'slow push in', 'slow pull out', 'dolly in', 'dolly out',
      'tracking shot following subject', 'orbit around subject', 'crane up reveal', 'crane down',
      'handheld documentary feel', 'steadicam glide', 'whip pan', 'tilt up', 'tilt down',
      'drone flyover', 'drone descend', 'rack focus', 'zoom in slowly', 'parallax side scroll'
    ],

    videoStyle: [
      'cinematic film look', 'documentary realism', 'commercial advertisement polish',
      'music video energy', 'vlog handheld', 'anime animation', '3D animated short',
      'stop motion', 'claymation', 'motion graphics', 'timelapse', 'slow motion 120fps',
      'found footage', 'vintage 16mm grain', 'VHS retro', 'hyperlapse'
    ],

    pacing: [
      'slow contemplative pacing', 'medium steady pacing', 'fast energetic cuts',
      'rhythmic beat-synced cuts', 'one continuous take', 'building crescendo'
    ],

    /* ------------------------------- Audio ------------------------------- */

    voiceTone: [
      'hangat dan ramah', 'tegas dan berwibawa', 'santai dan akrab', 'antusias dan energik',
      'tenang dan menenangkan', 'serius dan informatif', 'dramatis dan sinematik',
      'lembut dan intim', 'percaya diri dan persuasif', 'netral dan profesional'
    ],

    musicGenre: [
      'lo-fi hip hop', 'cinematic orchestral', 'ambient', 'synthwave', 'acoustic folk',
      'indie pop', 'corporate upbeat', 'epic trailer', 'jazz', 'bossa nova', 'EDM',
      'rock', 'gamelan fusion', 'dangdut modern', 'R&B', 'drum and bass', 'classical piano'
    ],

    musicMood: [
      'uplifting', 'melancholic', 'tense and suspenseful', 'hopeful', 'playful',
      'dark and brooding', 'romantic', 'triumphant', 'relaxing', 'nostalgic'
    ]
  };

})(window.PG);
