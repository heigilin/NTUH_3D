import base64
from PIL import Image

src_path = r'D:/Users/006340/.gemini/antigravity/brain/e3bdfa44-30aa-4b9c-9b8c-2d4e4ca937b2/.user_uploaded/media_1793268558519_83cc4abb.png'
im = Image.open(src_path).convert('RGB')
im.save('user_campus_map.jpg', quality=95)

with open('user_campus_map.jpg', 'rb') as f:
    b64 = base64.b64encode(f.read()).decode('utf-8')

data_uri = f'data:image/jpeg;base64,{b64}'
with open('js/data/ground-texture-base64.js', 'w', encoding='utf-8') as f:
    f.write(f'window.GROUND_TEXTURE_BASE64 = "{data_uri}";\n')

print('user_campus_map.jpg converted to ground-texture-base64.js! Size:', len(data_uri))
