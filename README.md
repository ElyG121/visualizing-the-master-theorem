# Visualizing the Master Theorem

A visual guide to the Master Theorem. It builds the recursion tree for
$T(n) = aT(n/b) + f(n)$, then turns the theorem's three cases into three shapes that are easy to remember:

| Case | Shape | Where the work is | Result |
|---|---|---|---|
| 1 | Triangle | Leaves dominate ($f(n) < n^{\log_b a}$) | $\Theta(n^{\log_b a})$ |
| 2 | Rectangle | Every level is equal ($f(n) = n^{\log_b a}$) | $\Theta(n^{\log_b a}\log n)$ |
| 3 | Inverted triangle | Root dominates ($f(n) > n^{\log_b a}$) | $\Theta(f(n))$ |

**Live site:** https://elyg121.github.io/visualizing-the-master-theorem/

The site has two toggles:
- **Language:** English / עברית (right-to-left layout).
- **Audience:** Student / Educator. Educator mode adds inline "Educator Tip" boxes.

Each combination can be downloaded as a PDF compiled from the original LaTeX.

## Repository layout

```
latex_src_files/   XeLaTeX sources: educators_en, students_en, educators_heb, students_heb
index.html         site shell
content/           hand-converted content: en.html, he.html
js/app.js          language/audience toggles, table of contents, KaTeX rendering
js/figures.js      the TikZ figures redrawn as SVG
css/style.css      styles (light/dark, RTL-aware)
.github/workflows/pages.yml   compiles the PDFs and deploys to GitHub Pages
```

Educator-only content is marked with `data-audience="educator"` in `content/*.html`.

## Run locally

```sh
python3 -m http.server
# open http://localhost:8000
```

The PDF links only work on the deployed site, because the PDFs are built in CI.
To build them locally, run `latexmk -xelatex latex_src_files/<file>.tex`. This needs XeLaTeX
plus the Noto Sans and Liberation Sans fonts.
