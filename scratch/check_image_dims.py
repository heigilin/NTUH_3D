with open('js/data/floorplans-data.js', 'r', encoding='utf-8') as f:
    text = f.read()

import json, base64, io
from PIL import Image

start = text.find('{')
end = text.rfind('};') + 1
data = json.loads(text[start:end])

fp12 = data.get('E01_MAIN', {}).get('12F')
img_data = fp12['image'].split(',')[1]
img_bytes = base64.b64decode(img_data)
img = Image.open(io.BytesIO(img_bytes))
print('12F image size:', img.size)
print('12F image format:', img.format)

# Also check 7F and 3F
for f_tag in ('3F', '7F', '12F'):
    fp = data.get('E01_MAIN', {}).get(f_tag)
    if fp:
        ib = base64.b64decode(fp['image'].split(',')[1])
        im = Image.open(io.BytesIO(ib))
        print(f'{f_tag} size:', im.size)
