from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', headless=True)
    page = b.new_page()
    page.goto(r'file:///D:/Users/006340/Downloads/%E8%B3%87%E8%A8%8A%E9%96%8B%E7%99%BC/%E5%B9%B3%E9%9D%A2%E5%9C%96/index.html')
    page.wait_for_timeout(2000)

    # find all elements containing CRAB text
    res = page.evaluate("""() => {
        const matches = [];
        const all = document.querySelectorAll('*');
        all.forEach(el => {
            if (el.innerText && el.innerText.includes('CRAB') && el.children.length === 0) {
                matches.push({
                    tag: el.tagName,
                    id: el.id,
                    className: el.className,
                    text: el.innerText,
                    parent: el.parentElement ? {
                        tag: el.parentElement.tagName,
                        id: el.parentElement.id,
                        className: el.parentElement.className,
                        html: el.parentElement.outerHTML.substring(0, 300)
                    } : null
                });
            }
        });
        return matches;
    }""")
    import json
    print(json.dumps(res, indent=2, ensure_ascii=False))
    b.close()
