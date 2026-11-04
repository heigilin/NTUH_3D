with open('js/data/ward-3d-layout-data.js', 'r', encoding='utf-8') as f:
    text = f.read()

import json
start = text.find('{')
end = text.rfind('};') + 1
data = json.loads(text[start:end])

e12 = data.get('E01_MAIN', {}).get('12F', {})
rooms = e12.get('rooms', [])
wards = {}
for r in rooms:
    w = r.get('ward', 'OTHER')
    if w not in wards:
        wards[w] = {'minX': 9999, 'maxX': -9999, 'minZ': 9999, 'maxZ': -9999}
    b = r['bounds']
    wards[w]['minX'] = min(wards[w]['minX'], b['x'] - b['width']/2)
    wards[w]['maxX'] = max(wards[w]['maxX'], b['x'] + b['width']/2)
    wards[w]['minZ'] = min(wards[w]['minZ'], b['z'] - b['depth']/2)
    wards[w]['maxZ'] = max(wards[w]['maxZ'], b['z'] + b['depth']/2)

for w, b in sorted(wards.items()):
    print(f'Ward {w}: X=[{b["minX"]:.1f}, {b["maxX"]:.1f}], Z=[{b["minZ"]:.1f}, {b["maxZ"]:.1f}], center=({(b["minX"]+b["maxX"])/2:.1f}, {(b["minZ"]+b["maxZ"])/2:.1f})')
