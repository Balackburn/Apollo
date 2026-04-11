import './style.css';
import Lenis from 'lenis';
import { animate, inView, stagger, hover, scroll, press } from 'motion';
import { initSpectra } from './spectra.js';

// ═══ BASE URL (for GitHub Pages /Apollo/ path) ═══
const BASE = import.meta.env.BASE_URL || '/';

// ═══ SPECTRA NOISE BACKGROUND ═══
const spectraCanvas = document.getElementById('spectra-bg');
if (spectraCanvas) {
  // Animate hue shift over time for cycling colors
  let hue = 0;
  const cleanup = initSpectra(spectraCanvas, {
    speed: 0.6, hueShift: 0, noise: 0.025, warp: 0.8, scale: 0.5,
  });
  // Override the hue by directly updating the canvas uniform each frame
  const gl = spectraCanvas.getContext('webgl');
  if (gl) {
    const prog = gl.getParameter(gl.CURRENT_PROGRAM);
    const uHue = gl.getUniformLocation(prog, 'uHueShift');
    const tickHue = () => {
      hue = (hue + 0.15) % 360;
      gl.useProgram(prog);
      gl.uniform1f(uHue, hue);
      requestAnimationFrame(tickHue);
    };
    requestAnimationFrame(tickHue);
  }
}

// ═══ ICON CYCLING — gentle opacity + subtle blur, no resize ═══
const TOTAL_ICONS = 156;
const appIcon = document.getElementById('app-icon');
if (appIcon) {
  for (let i = 0; i < 5; i++) { const img = new Image(); img.src = `${BASE}apollo_icons/icon_${Math.floor(Math.random() * TOTAL_ICONS) + 1}.webp`; }

  let lastIdx = 44; // starting icon
  setInterval(() => {
    let idx;
    do { idx = Math.floor(Math.random() * TOTAL_ICONS) + 1; } while (idx === lastIdx);
    lastIdx = idx;
    // Gentle blur — minimal, just enough to mask the swap
    animate(appIcon, { filter: 'blur(2px)' }, { duration: 0.2, easing: [0.4, 0, 1, 1] }).then(() => {
      appIcon.src = `${BASE}apollo_icons/icon_${idx}.webp`;
      animate(appIcon, { filter: 'blur(0px)' }, { duration: 0.4, easing: [0, 0, 0.2, 1] });
    });
  }, 1200);
}

// ═══ FETCH LATEST RELEASE — update all download links dynamically ═══
(async () => {
  try {
    const res = await fetch('https://api.github.com/repos/Balackburn/Apollo/releases/latest');
    const data = await res.json();
    const assets = data.assets || [];

    // Map download dropdown items by variant name
    const variants = {
      'Standard': a => a.name.startsWith('Apollo') && !a.name.includes('NO-EXTENSIONS') && !a.name.includes('GLASS'),
      'No Extensions': a => a.name.startsWith('NO-EXTENSIONS') && !a.name.includes('GLASS'),
      'Liquid Glass': a => a.name.startsWith('GLASS_'),
      'No Ext + Glass': a => a.name.startsWith('NO-EXTENSIONS_GLASS'),
    };

    document.querySelectorAll('#download-dropdown .dropdown-item').forEach(item => {
      const label = item.querySelector('span')?.textContent?.trim();
      const matcher = variants[label];
      if (matcher) {
        const asset = assets.find(a => a.name.endsWith('.ipa') && matcher(a));
        if (asset) {
          item.href = asset.browser_download_url;
          // Update file size
          const sizeEl = item.querySelector('.dropdown-size');
          if (sizeEl) sizeEl.textContent = (asset.size / 1e6).toFixed(1) + ' MB';
        }
      }
    });
  } catch { /* silent — fallback URLs still work */ }
})();

// ═══ LENIS ═══
const lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

// ═══ VERONA SPRING ═══
const spring = { type: 'spring', stiffness: 350, damping: 40 };
const blurIn = (s, d = 0) => animate(s, { opacity: [0.001, 1], filter: ['blur(10px)', 'blur(0px)'], y: [10, 0] }, { ...spring, delay: d });
const fadeIn = (s, d = 0) => animate(s, { opacity: [0.001, 1] }, { ...spring, delay: d });
const slideIn = (s, d = 0) => animate(s, { opacity: [0.001, 1], y: [20, 0] }, { ...spring, delay: d });

// ═══ HIDDEN STATES — CSS handles initial opacity:0, JS just needs to animate to 1 ═══
// No need for anim-hidden class — elements start hidden via CSS rule

// ═══ HERO ═══
setTimeout(() => {
  // Icon already visible (no CSS opacity:0), just scale entrance
  animate('.hero-icon', { scale: [0.88, 1] }, { type: 'spring', stiffness: 220, damping: 22, delay: 0.05 });
  fadeIn('.hero-glow', 0.15);
  blurIn('.hero-title', 0.15);
  blurIn('.hero-desc', 0.3);
  animate('.hero-actions', { opacity: [0.001, 1], y: [12, 0] }, { ...spring, delay: 0.45 });
}, 60);

// Hero parallax
const heroIcon = document.querySelector('.hero-icon');
const heroGlow = document.querySelector('.hero-glow');
if (heroIcon) { const a = animate(heroIcon, { y: [0, -40], scale: [1, 0.92] }, { duration: 1 }); scroll(a, { target: document.querySelector('.hero'), offset: ['start start', 'end start'] }); }
if (heroGlow) { const a = animate(heroGlow, { opacity: [1, 0], scale: [1, 1.5] }, { duration: 1 }); scroll(a, { target: document.querySelector('.hero'), offset: ['start start', 'end start'] }); }

// ═══ CAROUSEL ═══
inView('.carousel-section', () => {
  blurIn('.carousel-header', 0.05);
  animate('.carousel-item', { opacity: [0.001, 1], y: [24, 0], scale: [0.95, 1] }, { ...spring, delay: stagger(0.04, { start: 0.1 }) });
});

// Carousel parallax per item
document.querySelectorAll('.carousel-item').forEach(item => {
  const a = animate(item, { y: [15, -8] }, { duration: 1 });
  scroll(a, { target: item, offset: ['start end', 'end start'] });
});

// Carousel hover — subtle lift only, no scale (avoids overflow clipping)
hover('.carousel-item', el => {
  animate(el, { y: -6, boxShadow: '0 20px 40px -10px rgba(33,103,255,0.12), 0 8px 20px -4px rgba(0,0,0,0.5)' }, { type: 'spring', stiffness: 400, damping: 28 });
  return () => animate(el, { y: 0, boxShadow: '0 6px 24px -6px rgba(0,0,0,0.4)' }, { type: 'spring', stiffness: 300, damping: 30 });
});

// Carousel press feedback
press('.carousel-item', el => {
  animate(el, { scale: 0.97 }, { duration: 0.1 });
  return () => animate(el, { scale: 1 }, { type: 'spring', stiffness: 400, damping: 20 });
});

// ═══ FEATURES ═══
inView('.features', () => {
  fadeIn('.features-label', 0);
  blurIn('.features-heading', 0.1);
  slideIn('.features-sub', 0.2);
  animate('.feature-row', { opacity: [0.001, 1], x: [-16, 0] }, { ...spring, delay: stagger(0.07, { start: 0.3 }) });
});

// ═══ QUOTE ═══
inView('.quote-section', () => {
  animate('.quote-mark', { opacity: [0, 1], scale: [0.8, 1] }, { type: 'spring', stiffness: 200, damping: 20 });
  blurIn('.quote-text', 0.15);
  fadeIn('.quote-cite', 0.4);
});

// ═══ FOOTER ═══
inView('.footer', () => {
  fadeIn('.footer-grid', 0.1);
  fadeIn('.footer-watermark', 0.25);
});
const wm = document.querySelector('.footer-watermark');
if (wm) { const a = animate(wm, { y: [40, 0], scale: [0.95, 1] }, { duration: 1 }); scroll(a, { target: wm, offset: ['start end', 'end end'] }); }

// ═══ HOVER ═══
hover('.btn-primary', el => {
  animate(el, { scale: 1.04 }, { type: 'spring', stiffness: 400, damping: 18 });
  return () => animate(el, { scale: 1 }, { type: 'spring', stiffness: 400, damping: 18 });
});
hover('.btn-ghost, .btn-glass', el => {
  animate(el, { scale: 1.02 }, { type: 'spring', stiffness: 400, damping: 20 });
  return () => animate(el, { scale: 1 }, { type: 'spring', stiffness: 400, damping: 20 });
});
hover('.feature-row', el => {
  animate(el, { x: 8 }, { duration: 0.2 });
  return () => animate(el, { x: 0 }, { duration: 0.15 });
});
press('.btn-primary', el => {
  animate(el, { scale: 0.96 }, { duration: 0.08 });
  return () => animate(el, { scale: 1 }, { type: 'spring', stiffness: 400, damping: 18 });
});

// ═══ INSTALL DROPDOWN ═══
const dropdownBtn = document.getElementById('install-trigger');
const dropdown = document.getElementById('install-dropdown');
let dropdownOpen = false;

function openDropdown() {
  if (dropdownOpen) return;
  dropdownOpen = true;
  dropdown.style.display = 'block';
  animate(dropdown, { opacity: [0, 1], y: [-8, 0], scale: [0.96, 1] }, { type: 'spring', stiffness: 500, damping: 30 });
}

function closeDropdown() {
  if (!dropdownOpen) return;
  dropdownOpen = false;
  animate(dropdown, { opacity: 0, y: -6, scale: 0.97 }, { duration: 0.12, easing: 'ease-in' }).then(() => {
    dropdown.style.display = 'none';
  });
}

if (dropdownBtn && dropdown) {
  dropdownBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropdownOpen ? closeDropdown() : openDropdown();
  });

  // Close handled by global listener below

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dropdownOpen) closeDropdown();
  });

  // Submenu expand/collapse
  document.querySelectorAll('.dropdown-group-title').forEach(title => {
    title.addEventListener('click', (e) => {
      e.stopPropagation();
      const group = title.closest('.dropdown-group');
      const items = group.querySelector('.dropdown-items');
      const isOpen = group.classList.contains('open');

      // Close all other groups
      document.querySelectorAll('.dropdown-group.open').forEach(g => {
        if (g !== group) {
          g.classList.remove('open');
          animate(g.querySelector('.dropdown-items'), { height: 0, opacity: 0 }, { duration: 0.15 });
        }
      });

      if (isOpen) {
        group.classList.remove('open');
        animate(items, { height: 0, opacity: 0 }, { duration: 0.15 });
      } else {
        group.classList.add('open');
        const h = items.scrollHeight;
        animate(items, { height: [0, h], opacity: [0, 1] }, { type: 'spring', stiffness: 500, damping: 35 });
      }
    });
  });

  // Hover on dropdown items
  hover('.dropdown-item', el => {
    animate(el, { x: 4, backgroundColor: 'rgba(255,255,255,0.06)' }, { duration: 0.12 });
    return () => animate(el, { x: 0, backgroundColor: 'rgba(255,255,255,0)' }, { duration: 0.1 });
  });
}

// ═══ DOWNLOAD DROPDOWN (same pattern) ═══
const dlBtn = document.getElementById('download-trigger');
const dlMenu = document.getElementById('download-dropdown');
let dlOpen = false;

if (dlBtn && dlMenu) {
  dlBtn.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    if (dlOpen) {
      dlOpen = false;
      animate(dlMenu, { opacity: 0, y: -6, scale: 0.97 }, { duration: 0.12 }).then(() => dlMenu.style.display = 'none');
    } else {
      dlOpen = true;
      dlMenu.style.display = 'block';
      animate(dlMenu, { opacity: [0, 1], y: [-8, 0], scale: [0.96, 1] }, { type: 'spring', stiffness: 500, damping: 30 });
    }
    // Close other dropdown if open
    if (dropdownOpen) closeDropdown();
  });
  // Close handled by global listener below

  // Hover on download items
  hover('.dropdown-item', el => {
    animate(el, { x: 4, backgroundColor: 'rgba(255,255,255,0.06)' }, { duration: 0.12 });
    return () => animate(el, { x: 0, backgroundColor: 'rgba(255,255,255,0)' }, { duration: 0.1 });
  });
}

// ═══ GLOBAL CLICK — close all dropdowns when clicking outside ═══
document.addEventListener('click', (e) => {
  // Close install dropdown
  if (dropdownOpen && dropdown && !dropdown.contains(e.target) && dropdownBtn && !dropdownBtn.contains(e.target)) {
    closeDropdown();
  }
  // Close download dropdown
  if (dlOpen && dlMenu && !dlMenu.contains(e.target) && dlBtn && !dlBtn.contains(e.target)) {
    dlOpen = false;
    animate(dlMenu, { opacity: 0, y: -6, scale: 0.97 }, { duration: 0.12, easing: 'ease-in' }).then(() => { dlMenu.style.display = 'none'; });
  }
});

// ═══ DRAG CAROUSEL ═══
let hasDragged = false;
const track = document.getElementById('carousel');
if (track) {
  let isDown = false, startX, sl;
  track.addEventListener('pointerdown', e => { isDown = true; hasDragged = false; startX = e.pageX - track.offsetLeft; sl = track.scrollLeft; });
  track.addEventListener('pointerup', () => (isDown = false));
  track.addEventListener('pointerleave', () => (isDown = false));
  track.addEventListener('pointermove', e => {
    if (!isDown) return; e.preventDefault();
    const walk = (e.pageX - track.offsetLeft - startX) * 1.5;
    if (Math.abs(walk) > 5) hasDragged = true;
    track.scrollLeft = sl - walk;
  });
}

// ═══ LIGHTBOX ═══
const overlay = document.getElementById('lightbox');
const lbImg = document.getElementById('lightbox-img');
const shots = Array.from({ length: 8 }, (_, i) => `${BASE}images/image_${i + 1}.webp`);
let curIdx = 0, lbOpen = false;

function openLB(idx) {
  curIdx = idx; lbImg.src = shots[idx]; lbOpen = true;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  animate(overlay, { opacity: [0, 1] }, { duration: 0.2 });
  animate(lbImg, { scale: [0.88, 1], opacity: [0, 1] }, { type: 'spring', stiffness: 300, damping: 28 });
}
function closeLB() {
  lbOpen = false;
  animate(overlay, { opacity: 0 }, { duration: 0.15 }).then(() => { overlay.classList.remove('active'); document.body.style.overflow = ''; });
}
function navLB(dir) {
  curIdx = (curIdx + dir + shots.length) % shots.length;
  animate(lbImg, { opacity: 0, filter: 'blur(4px)', scale: 0.97 }, { duration: 0.1 }).then(() => {
    lbImg.src = shots[curIdx];
    animate(lbImg, { opacity: 1, filter: 'blur(0px)', scale: 1 }, { duration: 0.12 });
  });
}

document.querySelectorAll('.carousel-item').forEach(item => {
  item.addEventListener('click', () => { if (!hasDragged) openLB(parseInt(item.dataset.idx, 10)); });
});
document.querySelector('.lightbox-close')?.addEventListener('click', e => { e.stopPropagation(); closeLB(); });
document.querySelector('.lightbox-prev')?.addEventListener('click', e => { e.stopPropagation(); navLB(-1); });
document.querySelector('.lightbox-next')?.addEventListener('click', e => { e.stopPropagation(); navLB(1); });
overlay?.addEventListener('click', e => { if (e.target === overlay) closeLB(); });
document.addEventListener('keydown', e => {
  if (!lbOpen) return;
  if (e.key === 'Escape') closeLB();
  if (e.key === 'ArrowLeft') navLB(-1);
  if (e.key === 'ArrowRight') navLB(1);
});
