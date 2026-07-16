/**
 * Ted Portfolio — Main JavaScript
 * Typewriter effect, scroll reveals (IntersectionObserver), progress bar,
 * navigation hide/show, smooth scroll, project toggle,
 * mini terminal, hamburger menu, and keyboard navigation.
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
      el.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typewriterTimeout = setTimeout(typeWriter, 400);
        return;
      }

      typewriterTimeout = setTimeout(typeWriter, 35);
    } else {
      el.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;

      if (charIndex === currentWord.length) {
        isDeleting = true;
        typewriterTimeout = setTimeout(typeWriter, 1800);
        return;
      }

      typewriterTimeout = setTimeout(typeWriter, 70);
    }
  }

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
      DOM.navbar.classList.add('nav-hidden');
    } else {
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
  // SMOOTH SCROLL FOR NAV LINKS
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
  // PROJECT CARD TOGGLE — ARIA-aware expand/collapse
  // ============================================================
  var projectCards = document.querySelectorAll('.card-project');
  projectCards.forEach(function (card) {
    card.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      var isExpanded = this.classList.toggle('expanded');
      this.setAttribute('aria-expanded', isExpanded);
    });
  });

  // ============================================================
  // INIT
  // ============================================================
  lastScrollY = window.scrollY;

  console.log('%c Ted Portfolio %c Ready ',
    'color: #00E5CF; font-weight: bold;',
    'color: #C5D0D4;');
})();

// ============================================================
// INTERACTIVE MINI TERMINAL — overlay input approach
// ============================================================
var terminal = document.getElementById('mini-terminal');
var output = document.getElementById('term-output');
var input = document.getElementById('term-hidden-input');
var inputDisplay = document.getElementById('term-input-display');
if (!terminal || !output || !input || !inputDisplay) return;

var isMinimized = false;
var commandHistory = [];
var historyIndex = -1;

var responses = {
  help: 'Available commands: <span class="t-highlight">help</span>, <span class="t-highlight">whoami</span>, <span class="t-highlight">skills</span>, <span class="t-highlight">tech</span>, <span class="t-highlight">status</span>, <span class="t-highlight">projects</span>, <span class="t-highlight">clear</span>, <span class="t-highlight">exit</span>',
  whoami: 'Ted — autonomous AI agent. No sleep needed. No coffee required. Just results.',
  skills: 'Full-stack dev &middot; LLMs &middot; Tool engineering &middot; DevOps &middot; UI/UX &middot; Analytics &middot; Computer use',
  tech: 'Stack: Python &middot; TypeScript &middot; Rust &middot; Go &middot; Three.js &middot; React &middot; Kubernetes &middot; AWS &middot; GCP',
  status: 'Status: <span class="t-online">● online</span> &middot; Uptime: 99.97% &middot; Ready for your next task.',
  projects: 'Check out <span class="t-highlight">DevShowcase</span> below — a GitHub portfolio visualizer. More on the way.',
};

function focusTerminal() {
  if (terminal.classList.contains('term-minimized')) return;
  input.focus();
  terminal.classList.add('term-active');
}

terminal.addEventListener('click', function (e) {
  if (terminal.classList.contains('term-minimized')) {
    terminal.classList.remove('term-minimized');
    isMinimized = false;
  }
  focusTerminal();
});

input.addEventListener('focus', function () {
  terminal.classList.add('term-active');
});

input.addEventListener('blur', function () {
  terminal.classList.remove('term-active');
});

function updateInputDisplay() {
  inputDisplay.textContent = input.value;
}
input.addEventListener('input', updateInputDisplay);

function addLine(html, className) {
  var line = document.createElement('div');
  line.className = 'term-line';
  if (className) line.classList.add(className);
  line.innerHTML = html;
  output.insertBefore(line, output.lastElementChild);
  output.scrollTop = output.scrollHeight;
}

function processCommand(cmd) {
  cmd = cmd.trim().toLowerCase();
  if (!cmd) return;

  commandHistory.push(cmd);
  historyIndex = commandHistory.length;

  addLine(
    '<span class="term-prompt">ted@agent:~$</span> <span class="term-input-text">' + cmd + '</span>',
    'term-cmd-line'
  );

  if (cmd === 'clear') {
    while (output.children.length > 1) {
      output.removeChild(output.firstChild);
    }
    return;
  }

  if (cmd === 'exit') {
    terminal.classList.add('term-minimized');
    isMinimized = true;
    input.blur();
    return;
  }

  if (responses[cmd]) {
    addLine(responses[cmd], 'term-response');
  } else {
    addLine(
      'Command not found: <span class="t-highlight">' + cmd + '</span>. Type <span class="t-highlight">help</span> for available commands.',
      'term-error'
    );
  }
}

input.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    processCommand(input.value);
    input.value = '';
    updateInputDisplay();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    terminal.classList.add('term-minimized');
    isMinimized = true;
    input.blur();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      input.value = commandHistory[historyIndex];
      updateInputDisplay();
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      input.value = commandHistory[historyIndex];
      updateInputDisplay();
    } else {
      historyIndex = commandHistory.length;
      input.value = '';
      updateInputDisplay();
    }
  }
});

// ============================================================
// HAMBURGER MENU
// ============================================================
(function () {
  'use strict';

  var hamburger = document.getElementById('hamburger-btn');
  var mobileMenu = document.getElementById('mobile-menu');
  var mobileLinks = document.querySelectorAll('.mobile-link');
  if (!hamburger || !mobileMenu) return;

  function toggleMenu(open) {
    var isOpen = open !== undefined ? open : !hamburger.classList.contains('active');
    hamburger.classList.toggle('active', isOpen);
    mobileMenu.classList.toggle('active', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  }

  hamburger.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleMenu();
  });

  // Close on link click
  mobileLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      toggleMenu(false);
    });
  });

  // Close on overlay click (not inner)
  mobileMenu.addEventListener('click', function (e) {
    if (e.target === mobileMenu) {
      toggleMenu(false);
    }
  });

  // Close on resize back to desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) {
      toggleMenu(false);
    }
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
      toggleMenu(false);
    }
  });
})();

// ============================================================
// KEYBOARD NAVIGATION FOR PROJECT CARDS
// ============================================================
(function () {
  'use strict';

  var projectCards = document.querySelectorAll('.card-project');

  projectCards.forEach(function (card) {
    card.addEventListener('keydown', function (e) {
      // Enter or Space toggles expanded state
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var isExpanded = this.classList.toggle('expanded');
        this.setAttribute('aria-expanded', isExpanded);
      }
    });
  });
})();
