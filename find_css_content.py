import re

with open('css/style.css', 'r', encoding='utf-8') as f:
    text = f.read()

matches = re.findall(r'content:\s*[\'"][^\'"]+[\'"]', text)
for m in matches:
    print(m)
