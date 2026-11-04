from pathlib import Path
import re,shutil
p=Path('.')
f=p/'js/ward-source-scale-fix.js'
shutil.copy2(f,p/'scratch/before-scale-station-fix/alternative-source-traces.js')
for f in p.glob('*.html'):
 t=f.read_text(encoding='utf-8');u=re.sub(r'\s*<script src="js/ward-source-scale-fix\.js[^"\n]*"></script>','',t)
 if u!=t:f.write_text(u,encoding='utf-8')
for name in ['check-floor-source-review.cjs','check-6cd.cjs']:
 f=p/'scratch'/name;t=f.read_text(encoding='utf-8').replace("'js/ward-source-scale-fix.js',",'').replace("'ward-source-scale-fix',",'');f.write_text(t,encoding='utf-8')
