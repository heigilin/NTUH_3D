from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
import json,sys
out=Path('scratch/proportion-check-root');ps=json.load(open(out/'after-plans.json',encoding='utf-8'));font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',12)
for p in ps:
 if p['ward']!=sys.argv[1]:continue
 rects=[q[1:5]for q in p['rooms']+p.get('spaces',[])+p['corridors']+([p['station']]if p.get('station')else[])]+p.get('reviewStationParts',[])
 left=max(0,min(q[0]for q in rects)-20);top=max(0,min(q[1]for q in rects)-20)
 with Image.open(p['image'])as src:
  right=min(src.width,max(q[0]+q[2]for q in rects)+20);bottom=min(src.height,max(q[1]+q[3]for q in rects)+20);im=src.crop((left,top,right,bottom)).convert('RGBA')
 bg=Image.new('RGBA',im.size,'white');bg.alpha_composite(im);layer=Image.new('RGBA',im.size);d=ImageDraw.Draw(layer)
 def rect(q,col,fill=None):
  x,y,w,h=q;d.rectangle((x-left,y-top,x+w-left,y+h-top),outline=col,fill=fill,width=1)
 for code,x,y,w,h,*_ in p['rooms']:
  rect([x,y,w,h],(220,30,30,240),(255,0,0,12))
  if code in p.get('reviewBedRects',{}):rect(p['reviewBedRects'][code],(110,70,30,160))
  if code.isascii():d.text((x-left+2,y-top+2),code,fill=(160,0,0),font=font)
 for q in p.get('spaces',[]):rect(q[1:5],(120,60,170,200))
 for q in p['corridors']:rect(q[1:5],(200,140,0,230),(240,220,0,20))
 if p.get('station'):
  if p.get('reviewStationOutline'):d.polygon([(x-left,y-top)for x,y in p['reviewStationOutline']],fill=(0,170,190,30),outline=(0,130,150,255),width=2)
  else:
   for q in[p['station'][1:]]+p.get('reviewStationParts',[]):rect(q,(0,130,150,255),(0,170,190,30))
 bg.alpha_composite(layer);bg.convert('RGB').save(out/(p['ward']+'_'+p['floor']+'_after.png'))
print(sys.argv[1])
