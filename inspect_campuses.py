import json

with open('js/data/campus-data.js', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('{')
end = text.rfind('}') + 1
data = json.loads(text[start:end])

for b in data['buildings']:
    print(f"{b['id']}: name='{b['name']}', campus='{b['campus']}', pos={b['position']}, dims={b['dimensions']}")
