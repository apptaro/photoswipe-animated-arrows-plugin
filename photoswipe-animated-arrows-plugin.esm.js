/**
 * photoswipe-animated-arrows-plugin.esm.js
 * ----------------------------------------
 * PhotoSwipe v5.x plugin that adds animated next/prev arrows
 * with seamless looping transitions. (Tested with v5.4.4)
 *
 * Usage:
 *   import { PhotoSwipeAnimatedArrowsPlugin } from './photoswipe-animated-arrows-plugin.esm.js';
 *   const animatedArrows = new PhotoSwipeAnimatedArrowsPlugin(lightbox, { options });
 *
 * Author: apptaro
 * License: MIT
 * Repository: https://github.com/apptaro/photoswipe-animated-arrows-plugin
 */

export class PhotoSwipeAnimatedArrowsPlugin {
  /**
   * @param {PhotoSwipeLightbox} lightbox - PhotoSwipe lightbox instance
   * @param {Object} [options={}] - configuration options
   */
  constructor(lightbox, options = {}) {
    this.lightbox = lightbox;
    this.options = {
      animationDuration: options.animationDuration ?? 333,
      easing: options.easing ?? 'ease',
      classPrefix: options.classPrefix ?? 'pswp-animated',
    };
    this._registerUI();
  }

  _registerUI() {
    const { lightbox, options: cfg } = this;

    const buildCSS = (scopeId) => {
      const scope = `[data-aa="${scopeId}"]`;
      const css = `
        ${scope} .${cfg.classPrefix}-ghost {
            position: absolute; inset: 0; z-index: 10000;
            overflow: hidden; background: transparent !important; pointer-events: none;
        }
        ${scope} .${cfg.classPrefix}-ghost-track {
            position: absolute; top: 0; left: 0; height: 100%; width: 300%;
            display: flex;
            transition: transform ${cfg.animationDuration}ms ${cfg.easing};
            will-change: transform;
        }
        ${scope} .${cfg.classPrefix}-ghost-slide {
            flex: 0 0 33.3333%; height: 100%;
            display: flex; align-items: center; justify-content: center;
        }
        ${scope} .${cfg.classPrefix}-ghost-slide img {
            width: 100%; height: 100%; object-fit: contain; display: block;
        }
      `;
      return css;
    };

    const getSrcForIndex = (i) => {
      const pswp = lightbox.pswp;
      const d = pswp.getItemData(i);
      if (!d) return null;
      if (d.src) return d.src;
      const el = d.element;
      if (el) {
        if (el.tagName === 'A' && el.getAttribute('href')) return el.getAttribute('href');
        const img = el.querySelector('img');
        if (img) {
          if (img.currentSrc) return img.currentSrc;
          if (img.src) return img.src;
        }
      }
      return d.msrc || null;
    };

    const preloadImage = (src) => new Promise((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
      if (img.complete) return resolve(img.naturalWidth > 0 ? img : null);
      if (typeof img.decode === 'function') {
        img.decode()
        .then(() => resolve(img))
        .catch(() => { // decode error happens with Safari, so we workaround here
          if (img.complete) return resolve(img.naturalWidth > 0 ? img : null);
          img.addEventListener('load', () => resolve(img), { once: true });
          img.addEventListener('error', () => resolve(null), { once: true });
        });
      } else {
        img.addEventListener('load', () => resolve(img), { once: true });
        img.addEventListener('error', () => resolve(null), { once: true });
      }
    });

    let ghosting = false;
    const ghostWrap = async (dir /* 'next' | 'prev' */) => {
      if (ghosting) return;
      const pswp = lightbox.pswp;
      const numItems = pswp.getNumItems();
      if (numItems < 2) return;

      ghosting = true;

      let ghost, track, timeout;
      const cleanup = () => {
        ghost?.remove();
        ghost = null;
        track?.removeEventListener('transitionend', cleanup);
        track = null;
        if (timeout) clearTimeout(timeout);
        timeout = null;
        ghosting = false;
      };
      try {
        const i = pswp.currIndex;
        const root = pswp.element;

        let idxA, idxB, idxC, startX, endX, snapTo;

        if (dir === 'next') {
          // last → first
          const prev = (numItems + i - 1) % numItems;
          const last = i;
          const first = 0;
          idxA = prev; idxB = last; idxC = first;
          startX = '-33.3333%'; endX = '-66.6666%'; snapTo = first;
        } else {
          // first → last
          const last = (numItems + i - 1) % numItems;
          const first = i;
          const next = (i + 1) % numItems;
          idxA = last; idxB = first; idxC = next;
          startX = '-33.3333%'; endX = '0%'; snapTo = last;
        }

        const [imgA, imgB, imgC] = await Promise.all([
          preloadImage(getSrcForIndex(idxA)),
          preloadImage(getSrcForIndex(idxB)),
          preloadImage(getSrcForIndex(idxC)),
        ]);

        ghost = document.createElement('div');
        ghost.className = `${cfg.classPrefix}-ghost`;
        track = document.createElement('div');
        track.className = `${cfg.classPrefix}-ghost-track`;

        const makeSlide = (img) => {
          const s = document.createElement('div');
          s.className = `${cfg.classPrefix}-ghost-slide`;
          if (img) s.appendChild(img);
          return s;
        };
        track.appendChild(makeSlide(imgA));
        track.appendChild(makeSlide(imgB));
        track.appendChild(makeSlide(imgC));
        ghost.appendChild(track);

        // stop transition and prepare
        track.style.transition = 'none';
        track.style.transform = `translate3d(${startX}, 0, 0)`;
        pswp.goTo(snapTo);
        root.appendChild(ghost);
        track.getBoundingClientRect(); // force reflow

        // start transition
        requestAnimationFrame(() => {
          track.style.transition = '';
          track.style.transform = `translate3d(${endX}, 0, 0)`;
        });

        track.addEventListener('transitionend', cleanup, { once: true });
        timeout = setTimeout(cleanup, cfg.animationDuration + 250);
      } catch {
        cleanup();
      }
    };

    const onClickPrev = (e) => {
      const pswp = lightbox.pswp;
      if (pswp.currIndex === 0 && pswp.options.loop) ghostWrap('prev');
      else pswp.mainScroll.moveIndexBy(-1, true);
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    };

    const onClickNext = (e) => {
      const pswp = lightbox.pswp;
      const last = pswp.getNumItems() - 1;
      if (pswp.currIndex === last && pswp.options.loop) ghostWrap('next');
      else pswp.mainScroll.moveIndexBy(1, true);
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    };

    lightbox.on('afterInit', () => {
      const pswp = lightbox.pswp;

      const scopeId = `pswp-aa_${Math.random().toString(36).slice(2)}`;
      const css = buildCSS(scopeId);
      this._styleEl = document.createElement('style');
      this._styleEl.textContent = css;
      document.head.appendChild(this._styleEl);
      pswp.element.setAttribute('data-aa', scopeId);

      this._prevElm = pswp.element.querySelector(".pswp__button--arrow--prev");
      this._nextElm = pswp.element.querySelector(".pswp__button--arrow--next");
      if (this._prevElm) {
        this._prevElm.addEventListener('click', onClickPrev, { capture: true });
      }
      if (this._nextElm){
        this._nextElm.addEventListener('click', onClickNext, { capture: true });
      }

      pswp.on('destroy', () => {
        try {
          pswp.element.querySelectorAll(`.${cfg.classPrefix}-ghost`).forEach(el => el.remove());
        } catch {}
        pswp.element.removeAttribute('data-aa');
        if (this._styleEl) {
          document.head.removeChild(this._styleEl);
          this._styleEl = null;
        }
        if (this._prevElm) {
          this._prevElm.removeEventListener('click', onClickPrev, { capture: true });
          this._prevElm = null;
        }
        if (this._nextElm){
          this._nextElm.removeEventListener('click', onClickNext, { capture: true });
          this._nextElm = null;
        }
      });
    });
  }
}
