/**
 * MAISON DORÉE — Script Principal
 * ──────────────────────────────────────────────────────
 * Funcionalidades:
 * 1. Navbar — efecto scrolled + menú hamburguesa móvil
 * 2. Reveal animations — Intersection Observer API
 * 3. Galería — drag-to-scroll con mouse (desktop)
 * 4. Footer — año actual dinámico
 * 5. Smooth scroll — fallback para Safari antiguo
 * ──────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  /* ════════════════════════════════════════════════
     1. NAVBAR — Sticky con efecto scroll + hamburger
     ════════════════════════════════════════════════ */

  const navbar       = document.getElementById('navbar');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu   = document.getElementById('mobileMenu');
  const closeLinks   = document.querySelectorAll('[data-close-menu]');

  // Añadir clase .scrolled cuando se desplaza hacia abajo
  function onScroll() {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // ejecutar al cargar

  // Abrir / cerrar menú hamburguesa
  function toggleMenu(forceClose) {
    const isOpen = hamburgerBtn.classList.contains('is-open');
    const shouldOpen = forceClose ? false : !isOpen;

    hamburgerBtn.classList.toggle('is-open', shouldOpen);
    hamburgerBtn.setAttribute('aria-expanded', shouldOpen.toString());
    mobileMenu.classList.toggle('is-open', shouldOpen);

    // Prevenir scroll del body cuando el menú está abierto
    document.body.style.overflow = shouldOpen ? 'hidden' : '';
  }

  hamburgerBtn.addEventListener('click', () => toggleMenu());

  // Cerrar menú al hacer click en un enlace
  closeLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(true));
  });

  // Cerrar con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
      toggleMenu(true);
      hamburgerBtn.focus();
    }
  });


  /* ════════════════════════════════════════════════
     2. REVEAL ANIMATIONS — Intersection Observer
     ════════════════════════════════════════════════ */

  // Seleccionar todos los elementos con clase .reveal
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Dejar de observar el elemento una vez que fue revelado
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,       // 12% del elemento visible dispara la animación
        rootMargin: '0px 0px -40px 0px' // un poco antes del borde inferior
      }
    );

    revealElements.forEach(el => revealObserver.observe(el));

  } else {
    // Fallback: mostrar todo si el navegador no soporta IntersectionObserver
    revealElements.forEach(el => el.classList.add('is-visible'));
  }


  /* ════════════════════════════════════════════════
     3. GALERÍA — Drag to scroll (mouse en desktop)
     ════════════════════════════════════════════════ */

  const galeriaTrack = document.getElementById('galeriaTrack');

  if (galeriaTrack) {
    let isDragging  = false;
    let startX      = 0;
    let scrollStart = 0;
    let velX        = 0;
    let lastX       = 0;
    let lastTime    = 0;
    let rafId       = null;

    function applyMomentum() {
      if (Math.abs(velX) < 0.4) { velX = 0; return; }
      galeriaTrack.scrollLeft -= velX;
      velX *= 0.93;
      rafId = requestAnimationFrame(applyMomentum);
    }

    galeriaTrack.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isDragging  = true;
      startX      = e.clientX;
      scrollStart = galeriaTrack.scrollLeft;
      lastX       = e.clientX;
      lastTime    = Date.now();
      velX        = 0;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      galeriaTrack.classList.add('is-dragging');
      galeriaTrack.style.scrollSnapType = 'none';
    });

    function endDrag() {
      if (!isDragging) return;
      isDragging = false;
      galeriaTrack.classList.remove('is-dragging');
      galeriaTrack.style.scrollSnapType = '';
      rafId = requestAnimationFrame(applyMomentum);
    }

    document.addEventListener('mouseup',    endDrag);
    document.addEventListener('mouseleave', endDrag);

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const now = Date.now();
      const dt  = Math.max(now - lastTime, 1);
      velX      = (e.clientX - lastX) / dt * 16;
      lastX     = e.clientX;
      lastTime  = now;
      galeriaTrack.scrollLeft = scrollStart - (e.clientX - startX);
    });

    galeriaTrack.addEventListener('click', (e) => {
      if (Math.abs(galeriaTrack.scrollLeft - scrollStart) > 5) {
        e.preventDefault();
      }
    });
  }


  /* ════════════════════════════════════════════════
     4. FOOTER — Año actual dinámico
     ════════════════════════════════════════════════ */

  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }


  /* ════════════════════════════════════════════════
     5. SMOOTH SCROLL — Fallback para navegadores sin
        soporte nativo de scroll-behavior: smooth
     ════════════════════════════════════════════════ */

  // Solo activar si el navegador NO soporta scroll-behavior nativo
  if (!CSS.supports('scroll-behavior', 'smooth')) {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetEl = document.querySelector(targetId);
        if (!targetEl) return;

        e.preventDefault();

        const navHeight  = navbar ? navbar.offsetHeight : 0;
        const targetTop  = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight;

        window.scrollTo({
          top: targetTop,
          behavior: 'smooth'
        });
      });
    });
  }


  /* ════════════════════════════════════════════════
     6. ACCESIBILIDAD — Reducir animaciones si el
        usuario lo prefiere en su sistema operativo
     ════════════════════════════════════════════════ */

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (prefersReducedMotion.matches) {
    // Si prefiere menos movimiento, mostrar elementos sin animación
    revealElements.forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.transition = 'none';
    });
  }

})(); // IIFE — evitar contaminación del scope global
