from pathlib import Path
import json,html
from PIL import Image,ImageDraw
root=Path('兒醫逐層床位方向檢查');a=json.loads(Path('scratch/child-floor-by-floor-bed-audit.json').read_text(encoding='utf-8'));rows=[r for r in a['roomChecks'] if r['w']!='ALL'];assert len(rows)==174 and all(r['twoD'] and r['threeD'] for r in rows)
floors={}
for r in rows:
 d=floors.setdefault(r['f'],{'rooms':0,'beds':0,'wards':set()});d['rooms']+=1;d['beds']+=r['beds'];d['wards'].add(r['ward'])
body='<h1>兒醫逐層床位方向檢查</h1><p>2026-10-31：依13PE邏輯，每張床具長邊為東西向。以正式2D、3D繪圖程式逐床驗證，床號與床數保留。</p><p>174個病室／開放照護空間、369張床；24組配置、48次渲染；348次病室核對、738次床位核對（含全層與病房檢視），方向不符0。</p><p>1–4、7樓無可核實病房原圖，不能列為方向檢查通過。14樓依既有設定排除。房間尺寸與位置沿用原圖近似，本報告驗證床具方向。</p><table><tr><th>樓層</th><th>病房</th><th>病室／空間</th><th>床數</th><th>2D／3D</th></tr>'
summary=[]
for f,d in sorted(floors.items(),key=lambda q:int(q[0][:-1])):
 summary.append({'floor':f,'rooms':d['rooms'],'beds':d['beds'],'wards':sorted(d['wards'])});body+=f"<tr><td>{f}</td><td>{'、'.join(sorted(d['wards']))}</td><td>{d['rooms']}</td><td>{d['beds']}</td><td>通過</td></tr>"
body+='</table>'
for f,d in sorted(floors.items(),key=lambda q:int(q[0][:-1])):
 body+=f'<h2>{f}</h2>'
 for w in sorted(d['wards']):
  body+=f'<h3>{w}</h3><div class="views">'+''.join(f'<a href="{f}_{w}_{m}.png"><img src="{f}_{w}_{m}.png" alt="{w} {m}"></a>' for m in ['2D','3D'])+'</div><table><tr><th>病室／空間</th><th>床數</th><th>2D長邊</th><th>3D床架、床墊、枕頭</th></tr>'
  for r in rows:
   if r['f']==f and r['ward']==w:body+=f"<tr><td>{html.escape(r['room'])}</td><td>{r['beds']}</td><td>東西向 ✓</td><td>東西向 ✓</td></tr>"
  body+='</table>'
(root/'檢查報告.html').write_text('<!doctype html><meta charset="utf-8"><title>兒醫逐層床位方向檢查</title><style>body{font:17px Microsoft JhengHei,sans-serif;margin:32px;color:#203e50}table{border-collapse:collapse;width:100%;margin-bottom:30px}td,th{border:1px solid #cddde4;padding:8px;text-align:left}th{background:#e8f4f8}.views{display:flex}.views a{width:50%}img{width:100%}</style>'+body,encoding='utf-8-sig')
(root/'逐病室檢查紀錄.json').write_text(json.dumps({'floorSummary':summary,'rooms':rows},ensure_ascii=False,indent=2),encoding='utf-8')
for mode in ['2D','3D']:
 paths=sorted(root.glob('*_'+mode+'.png'),key=lambda p:(int(p.stem.split('_')[0][:-1]),p.stem));sheet=Image.new('RGB',(1920,1200),'white');draw=ImageDraw.Draw(sheet)
 for i,p in enumerate(paths):
  im=Image.open(p);im=im.resize((480,270),Image.Resampling.NEAREST);x=(i%4)*480;y=(i//4)*300;sheet.paste(im,(x,y+25));draw.rectangle((x,y,x+480,y+24),fill='#e5edf3')
 sheet.save(root/('總覽_'+mode+'.jpg'))
print(json.dumps(summary,ensure_ascii=False))

