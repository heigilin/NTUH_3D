from pathlib import Path
import shutil,re
p=Path.cwd();backup=p/'scratch/before-04E1-source-fix';backup.mkdir(exist_ok=True)
for name in ['js/ward-source-traces.js','js/canvas-whiteboard.js','js/ward-plan-geometry.js','index.html']:
 shutil.copy2(p/name,backup/Path(name).name)
f=p/'js/ward-source-traces.js';t=f.read_text(encoding='utf-8');needle='  const toBounds='
assert needle in t
t=t.replace(needle,'''  plans.push({building:'W03_EAST',floor:'1F',ward:'04E1',source:'4E1.pdf',image:'scratch/4E1_original.png',origin:[710,280],scale:0.05,
    rooms:[
      ['02',270,175,67,165,true],['06',337,175,64,165,true],
      ['08',401,175,65,165,true],['10',466,175,65,165,true],
      ['12',531,175,70,165,true],['16',601,175,61,165,true],
      ['18',662,175,59,165,true],
      ['20',871,175,58,165,true],['22',929,175,51,165,true],
      ['26',980,175,54,165,true],['28',1034,175,54,165,true],['30',1088,175,62,165,true]
    ],spaces:[],station:null,corridors:[['04E1走道',270,340,880,43]],
    notes:['依原圖維持12間病室在走廊同側，18與20之間保留原有護理及辦公空間間隔。',
      '依使用者要求移除舊套版污物室、清潔間及示意護理站；原圖公共空間暫不繪製。',
      '病室牆面採矩形外框近似，尚未描繪浴廁凹角及18號靠護理區的不規則邊界；床位保留來源清單，床位位置為示意。']
  });
  const toBounds=''',1)
t=t.replace("    const old=(layout.rooms||[]).filter(r=>r.ward===plan.ward);",'''    const project=plan.origin ? (x,y,w,h)=>({x:(x+w/2-plan.origin[0])*plan.scale,z:(y+h/2-plan.origin[1])*plan.scale,y:0,width:w*plan.scale,depth:h*plan.scale,height:1.2}) : toBounds;
    const old=(layout.rooms||[]).filter(r=>r.ward===plan.ward);
    if(plan.station===null){
      layout.sourceUnplacedSpaces=layout.sourceUnplacedSpaces||[];
      for(const key of ['rooms','nursingStations','facilities']) layout.sourceUnplacedSpaces.push(...(layout[key]||[]).filter(r=>r.ward===plan.ward&&(key!=='rooms'||!/^[0-9]+$/.test(r.roomCode))).map(item=>({kind:key,item,reason:'依使用者要求移除舊套版公共空間'})));
    }''')
t=t.replace('bounds:toBounds(x,y,w,h)','bounds:project(x,y,w,h)')
a="""    const [name,x,y,w,h]=plan.station;
    layout.nursingStations=(layout.nursingStations||[]).filter(r=>r.ward!==plan.ward).concat({id:'TRACE-'+plan.ward+'-NS',name,ward:plan.ward,bounds:project(x,y,w,h),color:'#0ea5e9',sourceTrace:true,sourcePlan:plan.source});"""
b="""    layout.nursingStations=(layout.nursingStations||[]).filter(r=>r.ward!==plan.ward);
    if(plan.station){
      const [name,x,y,w,h]=plan.station;
      layout.nursingStations.push({id:'TRACE-'+plan.ward+'-NS',name,ward:plan.ward,bounds:project(x,y,w,h),color:'#0ea5e9',sourceTrace:true,sourcePlan:plan.source});
    }"""
assert a in t;t=t.replace(a,b);f.write_text(t,encoding='utf-8')
f=p/'js/canvas-whiteboard.js';t=f.read_text(encoding='utf-8');t=re.sub(r'^.*<button id="btn-wcanvas-goto-(?:7f|5w2)".*\n','',t,flags=re.M)
a=t.index('    // 快速切換示範病房');b=t.index('    // 關閉',a);t=t[:a]+t[b:];f.write_text(t,encoding='utf-8')
f=p/'js/ward-plan-geometry.js';t=f.read_text(encoding='utf-8');t=t.replace("    if (buildingId !== 'E01_MAIN') {", "    if (wardLayout.sourceTraceCorridors) return wardLayout.sourceTraceCorridors;\n    if (buildingId !== 'E01_MAIN') {",1);t=t.replace('      if(/^W/.test(building)){','      if(/^W/.test(building)&&!layout.sourceTraceCorridors){');f.write_text(t,encoding='utf-8')
# Refresh changed assets in every local preview as well as the main entry point.
for f in [p/'index.html',p/'全部病房圖面檢查.html',p/'2D病房重繪預覽.html']:
 t=f.read_text(encoding='utf-8')
 for src in ['js/ward-source-traces.js','js/canvas-whiteboard.js','js/ward-plan-geometry.js']:
  t=re.sub(r'src="'+re.escape(src)+r'(?:\?[^" ]*)?"','src="'+src+'?v=20261030-04e1-source"',t)
 f.write_text(t,encoding='utf-8')
print('04E1 traced from supplied PDF; removed demo buttons and legacy public spaces')
