from pathlib import Path
import re
p=Path('.')
for f in p.glob('*.html'):
 t=f.read_text(encoding='utf-8');old=t
 if 'src="js/ward-source-floor-review.js' in t:
  t=re.sub(r'(<script src="js/ward-source-floor-review\.js[^"\n]*"></script>)(?!\s*<script src="js/ward-source-scale-fix)',r'\1\n<script src="js/ward-source-scale-fix.js?v=20261031-scale-stations-1"></script>',t)
 elif 'src="js/ward-source-6f.js' in t:
  t=re.sub(r'(<script src="js/ward-source-6f\.js[^"\n]*"></script>)',r'\1\n<script src="js/ward-source-scale-fix.js?v=20261031-scale-stations-1"></script>',t)
 for name in ['ward-plan-geometry','ward-source-6f','ward-plan-layout']:
  t=re.sub(r'(src="js/'+name+r'\.js)(?:\?[^"\n]*)?"',r'\1?v=20261031-scale-stations-1"',t)
 if old!=t:f.write_text(t,encoding='utf-8')
for name in ['check-floor-source-review.cjs','check-6cd.cjs']:
 f=p/'scratch'/name;t=f.read_text(encoding='utf-8')
 if name=='check-floor-source-review.cjs':t=t.replace("'js/ward-source-floor-review.js','js/ward-plan-layout.js'","'js/ward-source-floor-review.js','js/ward-source-scale-fix.js','js/ward-plan-layout.js'")
 else:t=t.replace("'ward-source-floor-review']:[]),'ward-plan-layout'","'ward-source-floor-review']:[]),'ward-source-scale-fix','ward-plan-layout'")
 f.write_text(t,encoding='utf-8')
