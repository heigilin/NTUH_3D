from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', headless=True)
    page = b.new_page()
    page.goto(r'file:///D:/Users/006340/Downloads/%E8%B3%87%E8%A8%8A%E9%96%8B%E7%99%BC/%E5%B9%B3%E9%9D%A2%E5%9C%96/index.html')
    page.wait_for_timeout(2000)
    html = page.evaluate("document.getElementById('ipc-timeline-bar').outerHTML")
    with open('timeline_dump.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Dumped timeline html")
    b.close()
