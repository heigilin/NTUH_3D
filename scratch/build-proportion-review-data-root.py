import json
from pathlib import Path
ps=json.load(open('scratch/proportion-review/plans-before.json',encoding='utf-8'))
cs=json.load(open('scratch/proportion-check-root/annex-candidates.json',encoding='utf-8'))
by={p['building']+'/'+p['floor']+'/'+p['ward']:p for p in ps};rows=[]
for c in cs:
 p=by[c['building']+'/'+c['floor']+'/'+c['ward']];changes={}
 for a in c['candidates']:
  if p['ward'].startswith('0P')or p['ward']=='15D':continue
  if not a['room'].isascii() and p['ward']!='06W3':continue
  if p['building']=='CHILD_HOSPITAL' and a['side']in['east','west'] and not(p['ward']=='05PW'and a['room']=='01'):continue
  changes[a['room']]={'bed':a['old'],'outer':a['outer'],'basis':'原圖病室與走道間的前室及浴廁帶'}
 if p['building']=='CHILD_HOSPITAL'and p['ward']in['11PW','11PE','12PW','12PE','13PW','13PE']:
  for r in p['rooms']:
   code,x,y,w,h,*_=r
   # A separate front/bath band precedes the next room on the same facade.
   neighbors=[q for q in p['rooms']if q[0]!=code and q[2]+q[4]<y and 15<=y-q[2]-q[4]<=52 and min(x+w,q[1]+q[3])-max(x,q[1])>=min(w,q[3])*.85]
   if neighbors:
    q=min(neighbors,key=lambda q:y-q[2]-q[4]);ny=q[2]+q[4]+1
    old=changes.get(code,{'outer':[x,y,w,h],'bed':[x,y,w,h]});outer=old['outer'];outer=[outer[0],min(ny,outer[1]),outer[2],y+h-min(ny,outer[1])];changes[code]={'bed':[x,y,w,h],'outer':outer,'basis':'原圖同一立面病室前的浴廁／前室帶，保留原床區'}
 if p['ward']=='05PW':
  changes['02']={'bed':[28,72,57,47],'outer':[28,72,77,80],'basis':'原圖02病室東側浴廁及南側前室'}
  changes['08']={'bed':[366,56,50,63],'outer':[366,56,50,96],'basis':'原圖08病室南側前室'}
  changes['09']={'bed':[430,129,57,72],'outer':[389,129,98,72],'basis':'原圖09病室西側前室／浴廁'}
 if p['ward']=='09PW':
  for code in['06','07','08']:
   r=next(r for r in p['rooms']if r[0]==code);changes[code]={'bed':r[1:5],'outer':[r[1],r[2],r[3],173-r[2]],'basis':'原圖北側病室前室／浴廁帶至走道北緣'}
 if p['ward']=='06W3':
  for code,x,w in [('三人房C2',706,66),('三人房C3',774,68),('三人房C4',845,68)]:
   r=next(r for r in p['rooms']if r[0]==code);changes[code]={'bed':[x,70,w,72],'outer':[x,70,w,80],'basis':'原圖黑色隔牆位置，含南側浴廁帶'}
 row={k:c[k]for k in['building','floor','ward','source','image']};row['roomRects']=changes;row['roomCheck']='病室床區與外框逐圖疊合，前室／浴廁帶與床區分開保留';row['corridorCheck']='沿本病房原圖走道邊界核對；未以建築縮放結果代替比例核對';row['stationCheck']='原圖內接範圍，圓弧、斜角保留近似';row['status']='source-reviewed-rectangular-approximation';rows.append(row)
Path('scratch/proportion-check-root/review-data.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
Path('js/data/ward-proportion-review-data.js').write_text('/* Source-pixel room envelopes and retained bed zones. See per-ward source evidence. */\nwindow.WARD_PROPORTION_REVIEW_DATA='+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print('ward entries',len(rows),'room envelopes',sum(len(r['roomRects'])for r in rows))
