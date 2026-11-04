from pathlib import Path
import re,shutil
p=Path('.')
f=p/'js/ward-source-icu-review.js';shutil.copy2(f,p/'scratch/before-all-campus-integration/alternative-icu-review.js')
for f in p.glob('*.html'):
 t=f.read_text(encoding='utf-8');u=re.sub(r'\s*<script src="js/ward-source-icu-review\.js[^"\n]*"></script>','',t)
 if t!=u:f.write_text(u,encoding='utf-8')
f=p/'scratch/check-all-campus-source.cjs';t=f.read_text(encoding='utf-8')
a=t.index('const modules=');b=t.index('\nfor(const f of modules)',a)
t=t[:a]+'''const html=fs.readFileSync('index.html','utf8');
const modules=[...html.matchAll(/<script src="(js\/(?:data\/(?:rooms-data|ward-3d-layout-data|ward-bed-ids)|ward-(?:source[^"?]*|plan-layout|door-layout|plan-geometry|plan-2d))\.js)(?:\?[^"\n]*)?"/g)].map(m=>m[1].slice(3,-3));'''+t[b:]
f.write_text(t,encoding='utf-8')
