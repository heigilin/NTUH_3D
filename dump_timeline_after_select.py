import sys
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', headless=True)
    page = b.new_page(viewport={"width": 1400, "height": 900})
    page.goto(r'file:///D:/Users/006340/Downloads/%E8%B3%87%E8%A8%8A%E9%96%8B%E7%99%BC/%E5%B9%B3%E9%9D%A2%E5%9C%96/index.html')
    page.wait_for_function("() => window.app != null")
    page.wait_for_timeout(1000)

    page.evaluate("window.app.switchCampusView('west')")
    page.evaluate("window.app.selectBuilding('W04_EAST', true)")

    timeline_html = page.evaluate("document.getElementById('ipc-timeline-bar').innerHTML")
    with open('timeline_after_select.html', 'w', encoding='utf-8') as f:
        f.write(timeline_html)
    print("Saved timeline_after_select.html")
    b.close()
