(function () {
  'use strict';

  const LANGS = ['en', 'he'];
  const MODES = ['student', 'educator'];

  const UI = {
    en: {
      brand: 'Visualizing the Master Theorem',
      title: 'Visualizing the Master Theorem',
      student: 'Student', educator: 'Educator',
      pdf: 'PDF', pdfTitle: 'Download this version as a PDF',
      contents: 'Contents', loading: 'Loading…',
      langGroup: 'Language', modeGroup: 'Audience',
      footer: 'Written in LaTeX, available as PDF in English and Hebrew.',
      source: 'Source on GitHub',
      error: 'Could not load the content. Please refresh the page.',
    },
    he: {
      brand: 'המחשת משפט האב',
      title: 'המחשת משפט האב',
      student: 'סטודנטים', educator: 'צוות הוראה',
      pdf: 'PDF', pdfTitle: 'הורדת גרסה זו כקובץ PDF',
      contents: 'תוכן העניינים', loading: 'טוען…',
      langGroup: 'שפה', modeGroup: 'קהל יעד',
      footer: 'נכתב ב-LaTeX, זמין כ-PDF בעברית ובאנגלית.',
      source: 'קוד המקור ב-GitHub',
      error: 'לא ניתן היה לטעון את התוכן. נסו לרענן את הדף.',
    },
  };

  const html = document.documentElement;
  const main = document.getElementById('content');
  const tocList = document.getElementById('toc-list');
  const pdfLink = document.getElementById('pdf-link');
  const cache = {};
  // Reuse the ?v= tag from this script's URL so bumping it in index.html also refreshes the content
  const VERSION = new URL(document.currentScript.src).searchParams.get('v') || '';
  let state = { lang: 'en', mode: 'student' };
  let loadedLang = null;

  function store(key, val) {
    try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) { return null; }
    return null;
  }

  function initialState() {
    const q = new URLSearchParams(location.search);
    const lang = q.get('lang') || store('vmt-lang') ||
      ((navigator.language || '').toLowerCase().startsWith('he') ? 'he' : 'en');
    const mode = q.get('mode') || store('vmt-mode') || 'student';
    return { lang: LANGS.includes(lang) ? lang : 'en', mode: MODES.includes(mode) ? mode : 'student' };
  }

  function writeUrl() {
    const q = new URLSearchParams(location.search);
    q.set('lang', state.lang);
    q.set('mode', state.mode);
    history.replaceState(null, '', `${location.pathname}?${q}${location.hash}`);
    store('vmt-lang', state.lang);
    store('vmt-mode', state.mode);
  }

  function applyChrome() {
    const t = UI[state.lang];
    html.lang = state.lang;
    html.dir = state.lang === 'he' ? 'rtl' : 'ltr';
    html.dataset.lang = state.lang;
    html.dataset.mode = state.mode;
    document.title = t.title;
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t[el.dataset.i18n]; });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t[el.dataset.i18nAria]); });
    document.querySelectorAll('[data-set-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setLang === state.lang)));
    document.querySelectorAll('[data-set-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setMode === state.mode)));
    pdfLink.href = `pdf/${state.lang}-${state.mode}.pdf`;
    pdfLink.title = t.pdfTitle;
  }

  async function fetchContent(lang) {
    if (!cache[lang]) {
      const res = await fetch(`content/${lang}.html?v=${VERSION}`);
      if (!res.ok) throw new Error(res.status);
      cache[lang] = await res.text();
    }
    return cache[lang];
  }

  function renderMath(root) {
    if (!window.renderMathInElement) return;
    window.renderMathInElement(root, {
      delimiters: [
        { left: '\\[', right: '\\]', display: true },
        { left: '$', right: '$', display: false },
      ],
      throwOnError: false,
    });
  }

  async function loadContent() {
    if (loadedLang === state.lang) return;
    try {
      main.innerHTML = await fetchContent(state.lang);
    } catch (e) {
      main.innerHTML = `<p class="loading">${UI[state.lang].error}</p>`;
      return;
    }
    loadedLang = state.lang;
    window.Figures.render(main, state.lang);
    renderMath(main);
  }

  // Table of contents from visible h2/h3 headings
  let observer;
  function buildToc() {
    tocList.innerHTML = '';
    if (observer) observer.disconnect();
    const heads = [...main.querySelectorAll('h2[id], h3[id]')].filter((h) => h.offsetParent !== null);
    const links = new Map();
    heads.forEach((h) => {
      const li = document.createElement('li');
      if (h.tagName === 'H3') li.className = 'sub';
      const a = document.createElement('a');
      a.href = `#${h.id}`;
      a.textContent = h.dataset.toc || h.textContent;
      li.appendChild(a);
      tocList.appendChild(li);
      links.set(h, a);
    });
    observer = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          links.forEach((a) => a.classList.remove('active'));
          links.get(en.target)?.classList.add('active');
        }
      });
    }, { rootMargin: '-70px 0px -70% 0px' });
    heads.forEach((h) => observer.observe(h));
  }

  async function update(next) {
    state = { ...state, ...next };
    writeUrl();
    applyChrome();
    await loadContent();
    buildToc();
    if (location.hash) {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target && target.offsetParent !== null) target.scrollIntoView();
    }
  }

  document.addEventListener('click', (e) => {
    const l = e.target.closest('[data-set-lang]');
    const m = e.target.closest('[data-set-mode]');
    if (l && l.dataset.setLang !== state.lang) update({ lang: l.dataset.setLang });
    if (m && m.dataset.setMode !== state.mode) update({ mode: m.dataset.setMode });
  });

  // Keep anchor offsets in sync with the sticky header, which wraps on small screens
  const topbar = document.querySelector('.topbar');
  new ResizeObserver(() => html.style.setProperty('--header-h', `${topbar.offsetHeight}px`)).observe(topbar);

  // Collapse the TOC by default on small screens
  if (window.matchMedia('(max-width: 900px)').matches) {
    document.querySelector('.toc details').removeAttribute('open');
  }

  update(initialState());
})();
