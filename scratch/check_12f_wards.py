with open('js/data/ward-3d-layout-data.js', 'r', encoding='utf-8') as f:
    text = f.read()

import json
start = text.find('{')
end = text.rfind('};') + 1
data = json.loads(text[start:end])

e12 = data.get('E01_MAIN', {}).get('12F')
if e12:
    rooms = e12.get('rooms', [])
    wards = set(r.get('ward') for r in rooms)
    print('12F wards:', sorted(list(wards)))
    print('12F total rooms:', len(rooms))
    print('12F total beds:', len(e12.get('beds', [])))
    for w in sorted(list(wards)):
        w_rooms = [r for r in rooms if r.get('ward') == w]
        print(f'  Ward {w}: {len(w_rooms)} rooms')
