with open('js/data/ward-3d-layout-data.js', 'r', encoding='utf-8') as f:
    text = f.read()

import json
start = text.find('{')
end = text.rfind('};') + 1
data = json.loads(text[start:end])

for b_id, b_data in data.items():
    print(f'Building: {b_id}')
    for f_tag, f_data in b_data.items():
        rooms = f_data.get('rooms', [])
        wards = set(r.get('ward') for r in rooms if r.get('ward'))
        beds = f_data.get('beds', [])
        print(f'  {f_tag}: {len(rooms)} rooms, {len(beds)} beds, wards={sorted(list(wards))}')
