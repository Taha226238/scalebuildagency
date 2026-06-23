/* ═══════════════════════════════════════════════
   ScaleBuild — Main Script
═══════════════════════════════════════════════ */

/* ─── LOADER ────────────────────────────────── */
const loader = document.getElementById('loader');
if (loader) {
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 2400);
  });
}

/* ─── NAV ───────────────────────────────────── */
const nav        = document.getElementById('nav');
const burger     = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

function updateNav() {
  if (!nav) return;
  nav.classList.toggle('scrolled', window.scrollY > 20);
  let dark = false;
  document.querySelectorAll('.dark-section').forEach(s => {
    const r = s.getBoundingClientRect();
    if (r.top < 80 && r.bottom > 0) dark = true;
  });
  nav.classList.toggle('nav--dark', dark);
}
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    burger.classList.toggle('open', open);
  });
  mobileMenu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      burger.classList.remove('open');
    })
  );
}

/* ─── FAQ ACCORDION ─────────────────────────── */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.faq-q').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.nextElementSibling.classList.remove('open');
    });
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      btn.nextElementSibling.classList.add('open');
    }
  });
});

/* ─── SMOOTH CURSOR GLOW (desktop only) ─────── */
if (window.matchMedia('(pointer:fine)').matches) {
  const glow = document.createElement('div');
  glow.style.cssText = 'position:fixed;pointer-events:none;z-index:9990;width:380px;height:380px;border-radius:50%;background:radial-gradient(circle,rgba(108,71,255,.05) 0%,transparent 68%);top:0;left:0;transform:translate(-50%,-50%)';
  document.body.appendChild(glow);
  let mx = -999, my = -999, cx = -999, cy = -999;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  (function lerp() {
    cx += (mx - cx) * 0.09;
    cy += (my - cy) * 0.09;
    glow.style.left = cx + 'px';
    glow.style.top  = cy + 'px';
    requestAnimationFrame(lerp);
  })();
}

/* ═══════════════════════════════════════════════
   GSAP + SCROLLTRIGGER
═══════════════════════════════════════════════ */
window.addEventListener('load', () => {
  setTimeout(() => {
    requestAnimationFrame(initAnimations);
  }, 100); // small delay so layout is settled
});

function initAnimations() {

  /* No GSAP — show everything */
  if (typeof gsap === 'undefined') {
    document.querySelectorAll('.reveal-up').forEach(el => el.classList.add('visible'));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* Reduced motion — skip animations */
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
    document.querySelectorAll('.reveal-up').forEach(el => el.classList.add('visible'));
    return;
  }

  /* Mark reveal-up as handled */
  document.querySelectorAll('.reveal-up').forEach(el => el.classList.add('visible'));

  /* ─────────────────────────────────────────────
     HERO — fires after loader (2.5s delay)
  ───────────────────────────────────────────── */
  gsap.set(['.hero__eyebrow','.hero__headline','.hero__sub','.hero__ctas','.hero__img-card'], {
    opacity: 0
  });

  gsap.timeline({ delay: 2.5 })
    .to('.hero__eyebrow',
      { opacity:1, y:0, duration:.6, ease:'power2.out' }, 0)
    .fromTo('.hero__headline',
      { y:50, opacity:0 },
      { y:0, opacity:1, duration:.95, ease:'power3.out' }, .2)
    .fromTo('.hero__sub',
      { y:28, opacity:0 },
      { y:0, opacity:1, duration:.75, ease:'power2.out' }, .5)
    .fromTo('.hero__ctas',
      { y:22, opacity:0 },
      { y:0, opacity:1, duration:.65, ease:'power2.out' }, .7)
    .fromTo('.hero__img-card',
      { y:55, opacity:0, scale:.96 },
      { y:0, opacity:1, scale:1, duration:.85, ease:'power3.out', stagger:.12 }, .55);

  /* ─────────────────────────────────────────────
     HERO CARDS — subtle parallax on scroll
  ───────────────────────────────────────────── */
  const cardSpeeds = [-40, -25, -55, -32];
  document.querySelectorAll('.hero__img-card').forEach((card, i) => {
    gsap.to(card, {
      y: cardSpeeds[i],
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.8
      }
    });
  });

  /* ─────────────────────────────────────────────
     HELPER — scroll-triggered fade-up
  ───────────────────────────────────────────── */
  function fadeUp(selector, trigger, options = {}) {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;
    gsap.from(els, {
      y:      options.y       ?? 42,
      opacity: 0,
      duration: options.dur   ?? .75,
      ease:   options.ease    ?? 'power3.out',
      stagger: options.stagger ?? 0,
      delay:  options.delay   ?? 0,
      clearProps: 'all',             // ← removes inline styles after animation
      scrollTrigger: {
        trigger: document.querySelector(trigger || selector),
        start: options.start ?? 'top 86%',
        toggleActions: 'play none none none'
      }
    });
  }

  function fadeFrom(selector, trigger, from = {}, options = {}) {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;
    gsap.from(els, {
      ...from,
      opacity: 0,
      duration: options.dur  ?? .8,
      ease:   options.ease   ?? 'power3.out',
      stagger: options.stagger ?? 0,
      clearProps: 'all',
      scrollTrigger: {
        trigger: document.querySelector(trigger || selector),
        start: options.start ?? 'top 86%',
        toggleActions: 'play none none none'
      }
    });
  }

  /* ─────────────────────────────────────────────
     LOGOS
  ───────────────────────────────────────────── */
  fadeUp('.logo-item', '.logos-section', { y:18, dur:.55, stagger:.09, start:'top 92%' });

  /* ─────────────────────────────────────────────
     PROJECTS
  ───────────────────────────────────────────── */
  fadeUp('.projects .section-header', '.projects .section-header', { y:35, dur:.8 });
  fadeUp('.project-card', '.projects__grid', { y:55, dur:.85, stagger:.14, start:'top 88%' });

  /* ─────────────────────────────────────────────
     QUOTE
  ───────────────────────────────────────────── */
  fadeUp('.quote p',       '.quote-section', { y:48, dur:1,  start:'top 80%' });
  fadeUp('.quote__author', '.quote-section', { y:24, dur:.7, start:'top 75%', delay:.25 });

  /* ─────────────────────────────────────────────
     SERVICES
  ───────────────────────────────────────────── */
  fadeFrom('.services__left', '.services', { x:-48 }, { dur:.9, start:'top 82%' });
  fadeUp('.service-item', '.services__right', { y:28, dur:.65, stagger:.1, start:'top 84%' });
  gsap.from('.si-icon', {
    scale: .4, opacity: 0, duration:.45, ease:'back.out(2)', stagger:.08, clearProps:'all',
    scrollTrigger: { trigger:'.services__right', start:'top 84%' }
  });

  /* ─────────────────────────────────────────────
     PRICING
  ───────────────────────────────────────────── */
  fadeUp('.pricing .section-header', '.pricing .section-header', { y:35, dur:.8 });
  gsap.from('.pricing-card', {
    y:48, opacity:0, scale:.96, duration:.85,
    ease:'back.out(1.4)', stagger:.17, clearProps:'all',
    scrollTrigger: { trigger:'.pricing__grid', start:'top 86%' }
  });

  /* ─────────────────────────────────────────────
     TESTIMONIALS
  ───────────────────────────────────────────── */
  fadeUp('.testimonials-section .section-header', '.testimonials-section', { y:35, start:'top 82%' });
  fadeUp('.tcard', '.testimonials__grid', { y:50, dur:.8, stagger:.1, start:'top 86%' });

  /* ─────────────────────────────────────────────
     FAQ
  ───────────────────────────────────────────── */
  fadeFrom('.faq__left', '.faq', { x:-40 }, { dur:.9, start:'top 82%' });
  fadeUp('.faq-item', '.faq__right', { y:22, dur:.6, stagger:.09, start:'top 84%' });

  /* ─────────────────────────────────────────────
     CTA
  ───────────────────────────────────────────── */
  fadeUp('.cta__headline',   '.cta-section', { y:55, dur:1,  start:'top 82%' });
  fadeUp('.cta__inner .btn', '.cta-section', { y:24, dur:.65, start:'top 78%', delay:.28 });
  fadeUp('.cta__email',      '.cta-section', { y:16, dur:.55, start:'top 76%', delay:.45 });

  /* ─────────────────────────────────────────────
     FOOTER
  ───────────────────────────────────────────── */
  fadeUp('.footer__top',      '.footer', { y:28, dur:.75, start:'top 92%' });
  gsap.from('.footer__wordmark', {
    scale:.82, opacity:0, duration:1.3, ease:'power3.out', clearProps:'all',
    scrollTrigger:{ trigger:'.footer__wordmark', start:'top 95%' }
  });

  /* ─────────────────────────────────────────────
     SECTION LABELS
  ───────────────────────────────────────────── */
  document.querySelectorAll('.section-label').forEach(el => {
    gsap.from(el, {
      x:-18, opacity:0, duration:.55, ease:'power2.out', clearProps:'all',
      scrollTrigger:{ trigger:el, start:'top 90%' }
    });
  });

  /* ─────────────────────────────────────────────
     PROJECT CARD NUMBER BADGES
  ───────────────────────────────────────────── */
  gsap.from('.project-card__num', {
    scale:0, opacity:0, duration:.5, ease:'back.out(2)', stagger:.15, clearProps:'all',
    scrollTrigger:{ trigger:'.projects__grid', start:'top 88%' }
  });

  /* Done */
  ScrollTrigger.refresh();
}
