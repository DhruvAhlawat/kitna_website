import sys
from playwright.sync_api import sync_playwright
out = sys.argv[1]
page_path = sys.argv[2] if len(sys.argv) > 2 else ''
with sync_playwright() as p:
    b = p.chromium.launch()
    for name, w, h, dpr in [('desk', 1440, 900, 1), ('mobile', 390, 844, 2)]:
        pg = b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=dpr)
        errs = []
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.goto('http://127.0.0.1:8791/' + page_path, wait_until='networkidle')
        pg.wait_for_timeout(2200)
        pg.screenshot(path=f'{out}/{name}-fold.png')
        for y in range(0, 12000, 600):
            pg.evaluate(f'window.scrollTo(0,{y})'); pg.wait_for_timeout(60)
        pg.evaluate('window.scrollTo(0,0)'); pg.wait_for_timeout(600)
        pg.screenshot(path=f'{out}/{name}-full.png', full_page=True)
        sw = pg.evaluate('document.documentElement.scrollWidth')
        print(name, 'scrollWidth', sw, 'errors', errs)
    b.close()
