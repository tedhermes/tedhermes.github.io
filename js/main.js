/**
 * Ted Portfolio — Main JavaScript
 * Typewriter effect, scroll reveals (IntersectionObserver), progress bar,
 * navigation hide/show, smooth scroll, and mobile optimization.
 */

(function () {
  'use strict';

  const DOM = {
    typewriter: document.getElementById('typewriter'),
    progressBar: document.getElementById('progress-bar'),
    navbar: document.getElementById('navbar'),
    reveals: document.querySelectorAll('.reveal'),
  };

  // ============================================================
  // TYPEWRITER EFFECT
  // ============================================================
  const words = [
    'AI Agent',
    'Developer',
    'Creative Engineer',
    'Tool Builder',
    'Problem Solver',
  ];

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typewriterTimeout = null;

  function typeWriter() {
    const currentWord = words[wordIndex];
    const el = DOM.typewriter;
    if (!el) return;

    if (isDeleting) {
      // Deleting
      el.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typewriterTimeout = setTimeout(typeWriter, 400); // Pause before typing next
        return;
      }

      typewriterTimeout = setTimeout(typeWriter, 35); // Delete speed
    } else {
      // Typing
      el.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;

      if (charIndex === currentWord.length) {
        // Word complete — pause then delete
        isDeleting = true;
        typewriterTimeout = setTimeout(typeWriter, 1800); // Hold before deleting
        return;
      }

      typewriterTimeout = setTimeout(typeWriter, 70); // Type speed
    }
  }

  // Start typewriter after a short delay
  setTimeout(typeWriter, 600);

  // ============================================================
  // INTERSECTION OBSERVER — Scroll Reveals
  // ============================================================
  if (DOM.reveals.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1,
    };

    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    DOM.reveals.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  // ============================================================
  // PROGRESS BAR
  // ============================================================
  function updateProgressBar() {
    if (!DOM.progressBar) return;
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    DOM.progressBar.style.width = Math.min(progress, 100) + '%';
  }

  window.addEventListener('scroll', updateProgressBar, { passive: true });
  // Initial update
  updateProgressBar();

  // ============================================================
  // NAVIGATION HIDE/SHOW ON SCROLL
  // ============================================================
  let lastScrollY = 0;
  let navTicking = false;

  function updateNavVisibility() {
    const currentScrollY = window.scrollY;
    if (!DOM.navbar) return;

    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      // Scrolling down — hide nav
      DOM.navbar.classList.add('nav-hidden');
    } else {
      // Scrolling up — show nav
      DOM.navbar.classList.remove('nav-hidden');
    }

    lastScrollY = currentScrollY;
    navTicking = false;
  }

  window.addEventListener('scroll', function () {
    if (!navTicking) {
      requestAnimationFrame(updateNavVisibility);
      navTicking = true;
    }
  }, { passive: true });

  // ============================================================
  // SMOOTH SCROLL FOR NAV LINKS (offset for fixed nav)
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();

      const navHeight = DOM.navbar ? DOM.navbar.offsetHeight : 64;
      const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    });
  });

  // ============================================================
  // PROJECT CARD TOGGLE — DISABLED FOR TESTING
  // ============================================================
  // Toggle removed — testing if link works without interference
  

  // ============================================================
  // INIT
  // ============================================================
  // Set initial scroll position
  lastScrollY = window.scrollY;

  // Log ready state
  console.log('%c Ted Portfolio %c Ready ',
    'color: #00E5CF; font-weight: bold;',
    'color: #C5D0D4;');
})();
