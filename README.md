# PhotoSwipe Animated Arrows Plugin

A tiny plugin for **PhotoSwipe v5** that replaces the default next/prev buttons  
with animated slide transitions — including seamless looping between the last and first slides.

> This repository contains the ESM plugin (`photoswipe-animated-arrows-plugin.esm.js`),  
> a minimal `index.html` demo, and `package.json` ready for GitHub distribution.

---

## ✨ Features

- Smooth animated transition on arrow click (same as swipe motion)
- Seamless wrap-around animation when `loop: true`
- Zero dependency, safe for repeated init/destroy
- Fully compatible with **PhotoSwipe v5.4.4**

---

## 📂 File Structure

```
.
├── photoswipe-animated-arrows-plugin.esm.js
├── index.html
├── package.json
└── README.md
```

---

## 🚀 Quick Start (no build)

1. Open `index.html` using any static server  
   (e.g. `python3 -m http.server`)
2. Ensure internet access to load PhotoSwipe from UNPKG CDN.
3. Click the arrows to see the animated looping transition.

---

## 💡 Usage (ESM)

```html
<link rel="stylesheet" href="https://unpkg.com/photoswipe@5/dist/photoswipe.css">
<script type="module">
  import PhotoSwipeLightbox from 'https://unpkg.com/photoswipe@5/dist/photoswipe-lightbox.esm.js';
  import { PhotoSwipeAnimatedArrowsPlugin } from './photoswipe-animated-arrows-plugin.esm.js';

  const lightbox = new PhotoSwipeLightbox({
    gallery: '#gallery',
    children: 'a',
    pswpModule: () => import('https://unpkg.com/photoswipe@5/dist/photoswipe.esm.js'),
    loop: true
  });

  // Initialize plugin
  new PhotoSwipeAnimatedArrowsPlugin(lightbox);

  lightbox.init();
</script>
```

---

## ⚙️ Options

| Option | Type | Default | Description |
|---|---|---|---|
| `animationDuration` | number | `333` | Animation duration in milliseconds. |
| `easing` | string | `'ease'` | CSS transition easing function. |
| `classPrefix` | string | `'pswp-animated'` | CSS class prefix for injected DOM elements. |

---

## 🛠 Development

No build step is required.  
The plugin is a single **ES module** file.  
If you plan to publish to npm, update the `name`, `version`, and `exports` fields in `package.json`.

---

## 📄 License

MIT
Copyright (c) 2025 [apptaro](https://github.com/apptaro)
