/*
 * Figures, redrawn from the TikZ sources in latex_src_files/.
 * Coordinates are the original TikZ coordinates (1 unit = 1 cm, y up).
 * Shapes are drawn in SVG; text labels are HTML overlays so KaTeX can render the math
 * and Hebrew text gets proper bidi handling.
 */
(function () {
  'use strict';

  const S = 40; // px per TikZ unit (viewBox scale only; figures scale fluidly)

  const LABELS = {
    en: {
      mergeSort: 'Merge Sort', binarySearch: 'Binary Search', total: 'Total:',
      root: 'Root:', leaves: 'Leaves:',
      light: '(Light Work)', heavy: '(Heavy Work)', balanced: '(Balanced Work)',
      inc: 'Work increases per level', same: 'Work is constant per level', dec: 'Work decreases per level',
    },
    he: {
      mergeSort: 'Merge Sort', binarySearch: 'Binary Search', total: 'סה״כ:',
      root: 'שורש:', leaves: 'עלים:',
      light: '(עבודה קלה)', heavy: '(עבודה כבדה)', balanced: '(עבודה מאוזנת)',
      inc: 'העבודה גדלה בכל רמה', same: 'העבודה קבועה בכל רמה', dec: 'העבודה קטנה בכל רמה',
    },
  };

  // Build a figure from TikZ-space primitives.
  function canvas(view, fontUnits) {
    const W = (view.x1 - view.x0) * S;
    const H = (view.y0 - view.y1) * S;
    const X = (x) => +((x - view.x0) * S).toFixed(2);
    const Y = (y) => +((view.y0 - y) * S).toFixed(2);
    const parts = [];
    const labels = [];
    const api = {
      X, Y,
      add(s) { parts.push(s); },
      line(x1, y1, x2, y2, cls = 's-ink', extra = '') {
        parts.push(`<line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" class="${cls}" ${extra}/>`);
      },
      poly(pts, cls) {
        parts.push(`<polygon points="${pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')}" class="${cls}"/>`);
      },
      rect(x, y, w, h, cls) { // (x, y) is the bottom-left corner in TikZ space
        parts.push(`<rect x="${X(x)}" y="${Y(y + h)}" width="${w * S}" height="${h * S}" class="${cls}"/>`);
      },
      // TikZ "to[bend right=20]" between two points at the same height: a cubic curving downward.
      arc(x1, y1, x2, y2, cls = 's-ink', width = 1.2) {
        const d = Math.hypot(x2 - x1, y2 - y1) * 0.3915;
        const t = (20 * Math.PI) / 180;
        const c1 = [x1 + d * Math.cos(t), y1 - d * Math.sin(t)];
        const c2 = [x2 - d * Math.cos(t), y2 - d * Math.sin(t)];
        parts.push(`<path d="M${X(x1)} ${Y(y1)} C${X(c1[0])} ${Y(c1[1])} ${X(c2[0])} ${Y(c2[1])} ${X(x2)} ${Y(y2)}" class="${cls}" stroke-width="${width}"/>`);
      },
      // anchor: c (centered), above, below, east (text starts at the point and runs right)
      label(x, y, html, anchor = 'c', opts = {}) {
        labels.push({ x, y, html, anchor, ...opts });
      },
      html(cls = '', maxWidth) {
        const tf = { c: 'translate(-50%,-50%)', above: 'translate(-50%,-100%)', below: 'translate(-50%,0)', east: 'translate(0,-50%)' };
        const lab = labels.map((l) => {
          const left = ((X(l.x) / W) * 100).toFixed(3);
          const top = ((Y(l.y) / H) * 100).toFixed(3);
          const fs = (((l.size || 1) * fontUnits) / (view.x1 - view.x0)) * 100;
          const lang = l.lang ? ` lang="${l.lang}"` : '';
          return `<div class="fig-label${l.bg ? ' bg' : ''}"${lang} style="left:${left}%;top:${top}%;transform:${tf[l.anchor]};--fs:${fs.toFixed(3)}">${l.html}</div>`;
        }).join('');
        const style = maxWidth ? ` style="max-width:${maxWidth}px"` : '';
        return `<div class="fig-canvas ${cls}"${style}>` +
          `<svg viewBox="0 0 ${W.toFixed(1)} ${H.toFixed(1)}" role="img" aria-hidden="true">` +
          `<defs><marker id="stealth-${cls || 'x'}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 L3 5 z" class="f-ink"/></marker></defs>` +
          parts.join('') + `</svg>${lab}</div>`;
      },
    };
    return api;
  }

  // Figure 1: Merge Sort vs Binary Search
  function arrays(lang) {
    const L = LABELS[lang];
    const c = canvas({ x0: -5.1, x1: 8.4, y0: 6.6, y1: -0.15 }, 0.39);
    const wedges = [
      // Merge sort
      [[-4.0, 4.5], [-2.0, 4.5], [-3.4, 3.6]], [[-2.0, 4.5], [0.0, 4.5], [-0.6, 3.6]],
      [[-4.4, 3.0], [-3.4, 3.0], [-4.1, 2.1]], [[-3.4, 3.0], [-2.4, 3.0], [-2.7, 2.1]],
      [[-1.6, 3.0], [-0.6, 3.0], [-1.3, 2.1]], [[-0.6, 3.0], [0.4, 3.0], [0.1, 2.1]],
      [[-4.6, 1.5], [-4.1, 1.5], [-4.45, 0.6]], [[-4.1, 1.5], [-3.6, 1.5], [-3.75, 0.6]],
      [[-3.2, 1.5], [-2.7, 1.5], [-3.05, 0.6]], [[-2.7, 1.5], [-2.2, 1.5], [-2.35, 0.6]],
      [[-1.8, 1.5], [-1.3, 1.5], [-1.65, 0.6]], [[-1.3, 1.5], [-0.8, 1.5], [-0.95, 0.6]],
      [[-0.4, 1.5], [0.1, 1.5], [-0.25, 0.6]], [[0.1, 1.5], [0.6, 1.5], [0.45, 0.6]],
      // Binary search
      [[4.0, 4.5], [6.0, 4.5], [4.6, 3.6]], [[4.6, 3.0], [5.6, 3.0], [5.3, 2.1]], [[4.8, 1.5], [5.3, 1.5], [4.95, 0.6]],
    ];
    wedges.forEach((w) => c.poly(w, 'wedge'));
    const rows = [
      [4.5, [-4.0, -3.5, -3.0, -2.5, -2.0, -1.5, -1.0, -0.5]],
      [3.0, [-4.4, -3.9, -3.4, -2.9, -1.6, -1.1, -0.6, -0.1]],
      [1.5, [-4.6, -4.1, -3.2, -2.7, -1.8, -1.3, -0.4, 0.1]],
      [0.0, [-4.7, -4.0, -3.3, -2.6, -1.9, -1.2, -0.5, 0.2]],
      [4.5, [4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5]],
      [3.0, [3.6, 4.1, 4.6, 5.1]],
      [1.5, [4.8, 5.3]],
      [0.0, [4.7]],
    ];
    rows.forEach(([y, xs]) => xs.forEach((x) => c.rect(x, y, 0.5, 0.6, 'box')));
    c.label(-2.0, 6.0, L.mergeSort, 'c', { size: 1.4 });
    c.label(6.0, 6.0, L.binarySearch, 'c', { size: 1.4 });
    return c.html('fig-arrays', 640);
  }

  // Figure 2: the recursion tree (structure adapted from CLRS)
  function tree(lang) {
    const L = LABELS[lang];
    const c = canvas({ x0: -10.3, x1: 15.2, y0: 0.5, y1: -8.4 }, 0.44);
    const node = (x, y, tex, opts) => c.label(x, y, tex, 'c', opts);
    // Edge between two node centres 2 units apart vertically, clipped at the node text.
    const edge = (x1, y1, x2, y2) => {
      const t = 0.3 / Math.abs(y2 - y1);
      c.line(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, x2 - (x2 - x1) * t, y2 - (y2 - y1) * t, 's-ink', 'stroke-width="1.2"');
    };

    node(0, 0, '$f(n)$');
    [[-6.5, '$f(n/b)$'], [-1.5, '$f(n/b)$'], [2.5, '$\\cdots$'], [6.5, '$f(n/b)$']].forEach(([x, t]) => node(x, -2, t));
    [-6.5, -1.5, 6.5].forEach((x) => edge(0, 0, x, -2));
    c.arc(-2, -0.5, 2, -0.5);
    node(0, -1.1, '$a$');

    [[-6.5, -8, -5], [-1.5, -3, 0], [6.5, 5, 8]].forEach(([p, l, r]) => {
      node(l, -4, '$f(n/b^2)$');
      node(p, -4, '$\\cdots$');
      node(r, -4, '$f(n/b^2)$');
      edge(p, -2, l, -4);
      edge(p, -2, r, -4);
      c.arc(p - 0.7, -2.6, p + 0.7, -2.6);
      node(p, -2.9, '$a$');
    });

    [-6.5, -1.5, 2.5, 6.5].forEach((x) => { node(x, -5, '$\\vdots$'); node(x, -6, '$\\cdots$'); });

    [-8, -5, -3, 0, 5, 8].forEach((x) => {
      c.line(x, -4.3, x - 0.45, -5.0, 's-ink', 'stroke-width="1.2"');
      c.line(x, -4.3, x + 0.45, -5.0, 's-ink', 'stroke-width="1.2"');
      c.arc(x - 0.3, -4.6, x + 0.3, -4.6, 's-ink', 1);
      node(x, -4.85, '$a$', { size: 0.75 });
      c.line(x - 0.45, -5.0, x - 0.45, -5.6, 's-ink', 'stroke-width="0.8" stroke-dasharray="4 3"');
      c.line(x + 0.45, -5.0, x + 0.45, -5.6, 's-ink', 'stroke-width="0.8" stroke-dasharray="4 3"');
      node(x, -5.3, '$\\dots$', { size: 0.75 });
      node(x - 0.45, -6, '$\\Theta(1)$', { size: 0.85 });
      node(x + 0.45, -6, '$\\Theta(1)$', { size: 0.85 });
    });

    // Row sums on the right
    const sums = ['$f(n)$', '$a f(n/b)$', '$a^2 f(n/b^2)$', '$\\Theta(n^{\\log_b a})$'];
    sums.forEach((t, i) => c.label(10, -2 * i, t, 'east'));
    const mk = 'marker-end="url(#stealth-fig-tree)"';
    const dotted = 's-dot';
    c.line(0.7, 0, 9.9, 0, dotted, `stroke-width="1.6" ${mk}`);
    c.line(7.3, -2, 9.9, -2, dotted, `stroke-width="1.6" ${mk}`);
    c.line(8.9, -4, 9.9, -4, dotted, `stroke-width="1.6" ${mk}`);
    c.line(9.0, -6, 9.9, -6, dotted, `stroke-width="1.6" ${mk}`);

    // Depth arrow
    c.line(-9.5, 0, -9.5, -6, 's-ink', 'stroke-width="1.2" marker-start="url(#stealth-fig-tree)" marker-end="url(#stealth-fig-tree)"');
    c.label(-9.5, -3, '$\\log_b n$', 'c', { bg: true });

    // Brace under the leaves
    const a = 0.35, y = -6.3, l = -8.6, r = 8.6, m = 0;
    const X = c.X, Y = c.Y;
    c.add(`<path class="s-ink" stroke-width="1.6" d="M${X(l)} ${Y(y)} Q${X(l)} ${Y(y - a / 2)} ${X(l + a)} ${Y(y - a / 2)} L${X(m - a)} ${Y(y - a / 2)} Q${X(m)} ${Y(y - a / 2)} ${X(m)} ${Y(y - a)} Q${X(m)} ${Y(y - a / 2)} ${X(m + a)} ${Y(y - a / 2)} L${X(r - a)} ${Y(y - a / 2)} Q${X(r)} ${Y(y - a / 2)} ${X(r)} ${Y(y)}"/>`);
    c.label(0, y - a - 0.12, '$n^{\\log_b a}$', 'below');

    // Total
    c.label(5, -7.8, `${L.total} $\\Theta(n^{\\log_b a}) + \\displaystyle\\sum_{j=0}^{\\log_b n - 1} a^j f(n/b^j)$`, 'east', { lang: lang === 'he' ? 'he' : undefined });
    return `<div class="fig-scroll">${c.html('fig-tree')}</div>`;
  }

  // Figures 3-5: the three shapes
  function shape(kind, lang) {
    const L = LABELS[lang];
    const c = canvas({ x0: -5.4, x1: 10.4, y0: 0.95, y1: -4.95 }, 0.39);
    const cfg = {
      triangle: { pts: [[0, 0], [4, -4], [-4, -4]], levels: [[-1, 1], [-2, 2], [-3, 3]], ax: 4.5, top: L.light, bottom: L.heavy, side: L.inc, both: false },
      rectangle: { pts: [[-2.5, 0], [2.5, 0], [2.5, -4], [-2.5, -4]], levels: [[-2.5, 2.5], [-2.5, 2.5], [-2.5, 2.5]], ax: 3.5, top: L.balanced, bottom: L.balanced, side: L.same, both: true },
      inverted: { pts: [[-4, 0], [4, 0], [0, -4]], levels: [[-3, 3], [-2, 2], [-1, 1]], ax: 4.5, top: L.heavy, bottom: L.light, side: L.dec, both: false },
    }[kind];
    c.poly(cfg.pts, 'shape-fill');
    cfg.levels.forEach(([x1, x2], i) => c.line(x1, -(i + 1), x2, -(i + 1), 'shape-level'));
    const id = `fig-${kind}`;
    c.add(`<defs><marker id="head-${kind}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" class="shape-arrow-head"/></marker></defs>`);
    c.line(cfg.ax, -0.5, cfg.ax, -3.5, 'shape-arrow', `marker-end="url(#head-${kind})"${cfg.both ? ` marker-start="url(#head-${kind})"` : ''}`);
    const he = lang === 'he' ? 'he' : undefined;
    c.label(0, 0.08, `${L.root} $f(n)$ ${cfg.top}`, 'above', { lang: he });
    c.label(0, -4.08, `${L.leaves} $n^{\\log_b a}$ ${cfg.bottom}`, 'below', { lang: he });
    c.label(cfg.ax + 0.2, -2, cfg.side, 'east', { lang: he });
    return c.html(id, 600);
  }

  // Small icon used in the mnemonic strip and hero
  function icon(kind) {
    const p = {
      triangle: 'M32 4 60 44H4z',
      rectangle: 'M14 4h36v40H14z',
      inverted: 'M4 4h56L32 44z',
    }[kind];
    return `<svg viewBox="0 0 64 48" aria-hidden="true"><path d="${p}" class="shape-fill"/></svg>`;
  }

  const BUILDERS = {
    arrays, tree,
    triangle: (l) => shape('triangle', l),
    rectangle: (l) => shape('rectangle', l),
    inverted: (l) => shape('inverted', l),
  };

  window.Figures = {
    render(root, lang) {
      root.querySelectorAll('[data-figure]').forEach((el) => {
        const b = BUILDERS[el.dataset.figure];
        if (b) el.innerHTML = b(lang);
      });
      root.querySelectorAll('[data-icon]').forEach((el) => { el.innerHTML = icon(el.dataset.icon); });
    },
  };
})();
