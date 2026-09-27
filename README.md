# Kitna website

Landing page and privacy policy for **Kitna**, the Android spending tracker in `../BudgetApp` (package `com.datron.budjet_spendtracker`).

Live URL once deployed: https://kitna.datronapps.com/

Plain static HTML and CSS with one small script. No build step, hosted on GitHub Pages.

## Layout

| Path | What it is |
| --- | --- |
| `index.html` | Landing page |
| `privacy.html` | Privacy policy (also the Play Store privacy URL) |
| `styles.css` | Whole design system: paper and ink from the app, brand teal for actions, graphite for the privacy band. Unbounded for headlines, IBM Plex Sans for text. |
| `ring.js` | The interactive category ring in the hero (August from the demo ledger, app category colours) |
| `assets/screenshots/*.webp` | App screenshots, 412x892 logical (9:19.5), captured from the Windows build with the demo statement |
| `assets/og_banner.png` | 1200x630 share image, rendered from `tools/og_banner.html` |
| `tools/screenshots/` | Everything used to regenerate the screenshots (see below) |
| `_private/` | Gitignored. Screenshots taken with real statements. Never commit these. |

## Preview

```
python -m http.server 8791
```

Then open http://127.0.0.1:8791/.

## Screenshots

The published screenshots use `tools/screenshots/demo_statement.csv`, a made-up HDFC-format statement (Aarav Mehta, account 4321) from `make_demo.py`. Keep real statements out of anything that is pushed.

To regenerate them:

1. Copy `../BudgetApp` to a short path (for example `C:\Users\admin\sdapp`, CMake fails on long paths), without `build`, `statements` or `sms_samples`.
2. In the copy, change `CompanyName` and `ProductName` in `windows/runner/Runner.rc` (for example `com.datron.sitedemo` / `budget_app_sitedemo`) so the demo gets its own app data folder and never touches the real one.
3. Apply `main_dart_hooks.diff` to the copy's `lib/main.dart`, and put `review_app.dart` and `website_shots_test.dart` in its `test_driver/`.
4. Put `win.ps1` and a folder `demo/` holding `demo_statement.csv` in one directory, then run from the copy:

```
SHOTS_DIR=<that directory> SHOTS_SUB=shots_demo UPLOAD_SUB=demo COMPARE_STEPS=1 \
  flutter drive -d windows --target=test_driver/review_app.dart --driver=test_driver/website_shots_test.dart
```

The driver works inside the app only (flutter_driver taps plus an in-app upload hook). It sends no keystrokes or mouse input, and `win.ps1` captures the window with PrintWindow, so you can keep using the PC while it runs.

Convert the PNGs you want to WebP into `assets/screenshots/` with Pillow:

```
python -c "from PIL import Image; Image.open('06-home.png').convert('RGB').save('home.webp', 'WEBP', quality=88, method=6)"
```

## Deploy on GitHub Pages

1. Create the GitHub repo **kitna_website** (public).
2. `git remote add origin https://github.com/<you>/kitna_website.git` then `git push -u origin main`.
3. In the repo: Settings, Pages. Source: Deploy from a branch, `main`, `/ (root)`.
4. Custom domain: `kitna.datronapps.com` (already in `CNAME`). Add a DNS CNAME record `kitna` pointing to `<you>.github.io`, then tick Enforce HTTPS.

## Before launch

- The Google Play links point to `com.datron.budjet_spendtracker`. They 404 until the listing is public.
- The app is still called Spend insights inside the app. Rename it to Kitna (launcher label, `MaterialApp.title`, the ledger bar) when the name is settled.
- House style: no em dashes or en dashes anywhere.
