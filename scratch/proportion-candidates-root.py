import json
from pathlib import Path
ps=json.load(open('scratch/proportion-review/plans-before.json',encoding='utf-8'))
rows=[]
def hit(a,b):
 return min(a[0]+a[2],b[0]+b[2])-max(a[0],b[0])>.1 and min(a[1]+a[3],b[1]+b[3])-max(a[1],b[1])>.1
for p in ps:
 if p['ward']=='04W2':continue
 rectangles=[(q[0],q[1:5])for q in p['rooms']+p.get('spaces',[])+([p['station']]if p.get('station')else[])]
 changes=[]
 if p['source']not in ['E_03F.pdf','E_04F.pdf']:
  for room in p['rooms']:
   code,x,y,w,h,*_=room;candidates=[]
   for _,cx,cy,cw,ch,*_ in p['corridors']:
    if cw>ch*5 and min(x+w,cx+cw)-max(x,cx)>=w*.65:
     if 8<=cy-(y+h)<=45:candidates.append((cy-(y+h),'south',[x,y,w,cy-y-1]))
     if 8<=y-(cy+ch)<=45:candidates.append((y-(cy+ch),'north',[x,cy+ch+1,w,y+h-cy-ch-1]))
    if ch>cw*3 and min(y+h,cy+ch)-max(y,cy)>=h*.65:
     if 8<=cx-(x+w)<=45:candidates.append((cx-(x+w),'east',[x,y,cx-x-1,h]))
     if 8<=x-(cx+cw)<=45:candidates.append((x-(cx+cw),'west',[cx+cw+1,y,x+w-cx-cw-1,h]))
   for gap,side,full in sorted(candidates):
    blockers=[n for n,r in rectangles if n!=code and hit(full,r)]
    if any(hit(full,c[1:5]) for c in p['corridors']):continue
    if not blockers:
     changes.append({'room':code,'old':[x,y,w,h],'outer':full,'side':side,'gap':gap});break
 rows.append({'building':p['building'],'floor':p['floor'],'ward':p['ward'],'source':p['source'],'image':p['image'],'rooms':len(p['rooms']),'candidates':changes})
Path('scratch/proportion-check-root/annex-candidates.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
print('wards',len(rows),'candidate rooms',sum(len(r['candidates'])for r in rows))
for r in rows:print(r['ward'],len(r['candidates']),','.join(c['room']+':'+c['side']+str(c['gap'])for c in r['candidates']))
