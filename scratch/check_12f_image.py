with open('js/data/floorplans-data.js', 'r', encoding='utf-8') as f:
    text = f.read()

import json
# remove 'window.FLOORPLANS_DATA = ' and 'module.exports...'
start = text.find('{')
end = text.rfind('};') + 1
data = json.loads(text[start:end])

fp12 = data.get('E01_MAIN', {}).get('12F')
if fp12:
    print('12F title:', fp12.get('title'))
    print('12F image length:', len(fp12.get('image', '')))
    print('12F image prefix:', fp12.get('image', '')[:50])
else:
    print('No 12F in E01_MAIN')
