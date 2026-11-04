from pathlib import Path
import shutil
p=Path(__file__).resolve().parents[1];backup=p/'scratch/before-14f-labels-bc';backup.mkdir(exist_ok=True)
for name in ['js/app.js','js/ward-source-traces.js','js/ward-plan-2d.js']:
    dest=backup/Path(name).name
    if not dest.exists():shutil.copy2(p/name,dest)
f=p/'js/app.js';t=f.read_text(encoding='utf-8')
start=t.index('  buildWard3DLayout(');end=t.index('  createFloatingLabel(',start)
part=t[start:end]
for ctx in ['nctx','lctx','rctx','bctx']:
    marker=ctx+'.fillStyle = '
    a=part.index(marker,part.index('const '+ctx+' ='))
    b=part.index(ctx+'.font = ',a)
    part=part[:a]+part[b:]
part=part.replace("nctx.fillStyle = '#0284c7';","nctx.fillStyle = '#ffffff';")
part=part.replace("rctx.font = 'bold 28px", "rctx.font = 'bold 34px")
part=part.replace('80, 35, 136, 50, 28','80, 35, 148, 58, 34')
t=t[:start]+part+t[end:];f.write_text(t,encoding='utf-8')
f=p/'js/ward-source-traces.js';t=f.read_text(encoding='utf-8')
old="['污物室',400,911,27,16,'service']";assert old in t
t=t.replace(old,"['污物室',426,911,23,16,'service']",1)
needle="    if(tracedFloor){\n"
assert needle in t
t=t.replace(needle,"""    if(tracedFloor){
      // Conservative inner strip of the source B–C passage. It runs through
      // B15/B16 and C10/C11 gaps; no room or desk is placed on this spine.
      const links=[
        ['BC-B-ACCESS',507,489,29,111,false],
        ['BC-LINK',507,600,29,199,true],
        ['BC-C-ACCESS',507,799,29,111,false]
      ];
      tracedFloor.sourceTraceCorridors=tracedFloor.sourceTraceCorridors.filter(c=>!c.isInterWing).concat(links.map(([id,x,y,w,h,label])=>({id:'TRACE-14F-'+id,name:'B–C 棟連通道',ward:'BC',connects:['14B','14C'],bounds:toBounds(x,y,w,h),sourceRect:{x,y,w,h},sourceTrace:true,sourcePlan:'E_14F.pdf',isInterWing:true,mainSpine:true,connectionLabel:label})));
      const cInfo=tracedFloor.sourceTraceWards['14C'];
      cInfo.notes.push('污物室依原圖位於鋼琴講堂上方，與講堂左界對齊；講堂西側內縮仍採內接矩形。');
""",1)
f.write_text(t,encoding='utf-8')
print('Removed label frames; corrected 14C utility bay; added source B-C passage')
