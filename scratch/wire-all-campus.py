from pathlib import Path
import re,shutil
p=Path('.')
b=p/'scratch/before-all-campus-integration';b.mkdir(exist_ok=True)
modules=['ward-source-floor-review','ward-source-children','ward-source-west','ward-source-icu-review','ward-source-coverage']
for f in p.glob('*.html'):
 t=f.read_text(encoding='utf-8')
 if 'src="js/ward-plan-layout.js' not in t:continue
 if 'src="js/ward-source-traces.js' not in t:continue
 shutil.copy2(f,b/f.name)
 for name in modules:t=re.sub(r'\s*<script src="js/'+name+r'\.js[^"\n]*"></script>','',t)
 scripts='\n'+''.join('<script src="js/'+name+'.js?v=20261031-all-campus-1"></script>\n' for name in modules)
 t=re.sub(r'(?=<script src="js/ward-plan-layout\.js)',scripts,t,count=1)
 for name in ['ward-source-traces','ward-plan-layout','ward-plan-2d','ward-plan-geometry','app','canvas-whiteboard']:
  t=re.sub(r'(src="js/'+name+r'\.js)(?:\?[^"\n]*)?"',r'\1?v=20261031-all-campus-1"',t)
 f.write_text(t,encoding='utf-8')
 print(f.name)
f=p/'scratch/check-all-campus-source.cjs';t=f.read_text(encoding='utf-8').replace("'ward-source-icu-review','ward-plan-layout'","'ward-source-icu-review','ward-source-coverage','ward-plan-layout'")
f.write_text(t,encoding='utf-8')
