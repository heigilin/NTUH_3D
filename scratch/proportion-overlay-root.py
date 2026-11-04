from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
import json,gc,traceback
out=Path('scratch/proportion-check-root');out.mkdir(exist_ok=True)
ps=json.load(open('scratch/proportion-review/plans-before.json',encoding='utf-8'))
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',13)
for p in ps:
 if p['ward']in['6C','6D']:p['image']='scratch/E_06F_source.png'
import sys
for p in ps:
 if len(sys.argv)>1 and p['ward']!=sys.argv[1]:continue
 try:
  print(p['ward'],flush=True)
  rects=[q[1:5]for q in p['rooms']+p.get('spaces',[])+p['corridors']+([p['station']]if p.get('station')else[])]
  l=max(0,min(q[0]for q in rects)-25);t=max(0,min(q[1]for q in rects)-25)
  with Image.open(p['image'])as full:
   r=min(full.width,max(q[0]+q[2]for q in rects)+25);b=min(full.height,max(q[1]+q[3]for q in rects)+25)
   im=full.crop((l,t,r,b)).convert('RGBA')
  bg=Image.new('RGBA',im.size,'white');bg.alpha_composite(im);im=bg
  layer=Image.new('RGBA',im.size);d=ImageDraw.Draw(layer)
  for label,x,y,w,h,*_ in p['rooms']:
   x-=l;y-=t;d.rectangle((x,y,x+w,y+h),fill=(255,0,0,18),outline=(225,40,40,230),width=2);d.text((x+2,y+2),label if label.isascii() else "room",fill=(180,0,0),font=font)
  for label,x,y,w,h,*_ in p.get('spaces',[]):d.rectangle((x-l,y-t,x-l+w,y-t+h),outline=(115,60,190,180),width=2)
  for label,x,y,w,h,*_ in p['corridors']:d.rectangle((x-l,y-t,x-l+w,y-t+h),fill=(255,210,0,35),outline=(205,130,0,240),width=2)
  if p.get('station'):
   label,x,y,w,h=p['station'];d.rectangle((x-l,y-t,x-l+w,y-t+h),fill=(0,180,200,30),outline=(0,130,150,255),width=3)
  im.alpha_composite(layer);im.convert('RGB').save(out/(p['ward']+'_'+p['floor']+'_before.png'))
  im.close();layer.close();gc.collect()
 except Exception as e: print('ERROR',p['ward'],str(e))
print('done',len(list(out.glob('*.png'))))
