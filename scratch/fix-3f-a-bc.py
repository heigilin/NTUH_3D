from pathlib import Path
import shutil,re
p=Path.cwd();backup=p/'scratch/before-3f-a-wards-bc-link';backup.mkdir(exist_ok=True)
for name in ['js/ward-source-traces.js','js/ward-plan-geometry.js','js/ward-plan-2d.js','js/app.js','index.html']:shutil.copy2(p/name,backup/Path(name).name)
f=p/'js/ward-source-traces.js';t=f.read_text(encoding='utf-8');mark='  const toBounds='
assert mark in t
t=t.replace(mark,'''  // 3F north wards: coordinates measured from the embedded E_03F scan (2277 x 3233).
  plans.push({building:'E01_MAIN',floor:'3F',ward:'03A1',source:'E_03F.pdf',image:'floorplans/E_03F.jpg',origin:[550,880],scale:.08,partialCorridors:true,replaceCorridorGroups:['A'],
    rooms:[['06',93,14,69,83,true],['05',162,14,73,118,true],['03',235,14,62,118,true],['02',297,14,74,118,true],['01',371,14,61,118,true],
      ['07',26,229,62,119,false],['08',88,229,72,119,false],['09',160,276,70,108,false]],
    spaces:[['醫材及備藥室',230,276,66,108],['儀器室',296,276,49,73],['污物室',369,181,70,50]],station:null,
    corridors:[['03A1病房走道',26,176,406,53],['03A1北側走道',162,132,270,44],['03A1西側走道',26,132,67,44]],
    notes:['依原圖將03A1定位於北側西半部，06/05/03/02/01在北排，07/08/09在南排。','03A1病室與03A2負壓病室不交換床號歸屬；病室採矩形內接近似，未描繪凹角、浴廁及所有附屬空間。']});
  plans.push({building:'E01_MAIN',floor:'3F',ward:'03A2',source:'E_03F.pdf',image:'floorplans/E_03F.jpg',origin:[550,880],scale:.08,partialCorridors:true,replaceCorridorGroups:['A'],isolationCodes:['01','02','03','05','06','07','08','09','10'],
    rooms:[['01',635,14,67,87,true],['02',702,14,68,87,true],['03',770,14,68,87,true],['05',838,14,68,87,true],['06',906,14,68,87,true],
      ['10',762,298,76,89,false],['09',838,298,67,89,false],['08',905,264,68,89,false],['07',973,260,66,93,false]],
    spaces:[['儀器室',573,14,62,102]],station:null,
    corridors:[['03A2北排走道',635,135,339,45],['03A2東側走道',1039,180,19,173],['03A2南排走道',762,230,143,34]],
    notes:['依原圖將03A2負壓病室定位於北側東半部，01/02/03/05/06在北排，10/09/08/07沿南側轉角排列。','負壓前室、護理站及不規則牆線尚未完整描繪，床位位置為示意。']});
  const toBounds=''',1)
t=t.replace('    if(plan.partialCorridors) layout.sourceTracePartialCorridors=true;', '''    if(plan.partialCorridors) layout.sourceTracePartialCorridors=true;
    if(plan.replaceCorridorGroups) layout.sourceTraceReplaceCorridorGroups=Array.from(new Set([...(layout.sourceTraceReplaceCorridorGroups||[]),...plan.replaceCorridorGroups]));''')
mark='    // Unassigned legacy elevator rectangles belong to the old template, not'
assert mark in t
t=t.replace(mark,'''    // E_03F shows the 3B-to-3C route through the east-side core.
    // 3B/3C room outlines still use the legacy geometry; widths/lengths below
    // express that connectivity around their extents, not surveyed source dimensions.
    const third=root?.E01_MAIN?.['3F'];
    if(third){
      const route=[
        ['B-ACCESS',38.5,-19.6,18,2.6,false],
        ['EAST-CORE',46,-4.9,3,32,true],
        ['C-ACCESS',39.5,9.8,16,1.0,false]
      ];
      third.sourceTraceCorridors=(third.sourceTraceCorridors||[]).concat(route.map(([id,x,z,width,depth,label])=>({id:'DISPLAY-3F-BC-'+id,name:'3B－3C連接通道（走道示意）',ward:'3BC',connects:['03B1','03B2','03C'],bounds:{x,z,width,depth,y:0,height:.05},isInterWing:true,mainSpine:true,connectionLabel:label,connectionText:'3B－3C連接通道',labelLines:['3B－3C','連','接','通','道'],sourcePlan:'E_03F.pdf',isSchematic:true})));
      third.sourceTraceNotes=['03A1／03A2依原圖逐間定位；03B1、03B2及03C仍保留原病室幾何。3B－3C連接通道依原圖東側核心區的連通關係補繪，尺寸與長度為示意，未宣稱全樓層已逐間重建。'];
    }
''' +mark,1);f.write_text(t,encoding='utf-8')
f=p/'js/ward-plan-geometry.js';t=f.read_text(encoding='utf-8');a="if (wardLayout.sourceTracePartialCorridors) return corridors.filter(c=>!/^CORR-WING-C-/.test(c.id)).concat(wardLayout.sourceTraceCorridors);";b="if (wardLayout.sourceTracePartialCorridors) return corridors.filter(c=>!(wardLayout.sourceTraceReplaceCorridorGroups||['C']).some(group=>c.id.startsWith('CORR-WING-'+group+'-'))).concat(wardLayout.sourceTraceCorridors);";assert a in t;t=t.replace(a,b);f.write_text(t,encoding='utf-8')
f=p/'js/ward-plan-2d.js';t=f.read_text(encoding='utf-8');t=t.replace("label=c.connectionLabel?'B–C 連通道':''", "label=c.connectionLabel?(c.connectionText||'B–C 連通道'):''");t=t.replace("label=c.connectionLabel?(ward==='14B'?'通往14C':'通往14B'):'';", "label=c.connectionLabel?('通往'+(c.connects||[]).filter(w=>w!==ward).join('／')):'';")
f.write_text(t,encoding='utf-8')
f=p/'js/app.js';t=f.read_text(encoding='utf-8');t=t.replace("['B–C','連','通','道'].forEach((text,i)=>labelCtx.fillText(text,80,76+i*116));", "(corr.labelLines||['B–C','連','通','道']).forEach((text,i,lines)=>labelCtx.fillText(text,80,48+i*(416/Math.max(1,lines.length-1))));")
f.write_text(t,encoding='utf-8')
for f in p.glob('*.html'):
 t=f.read_text(encoding='utf-8');original=t
 for src in ['js/ward-source-traces.js','js/ward-plan-geometry.js','js/ward-plan-2d.js','js/app.js']:
  t=re.sub(r'src="'+re.escape(src)+r'(?:\?[^" ]*)?"','src="'+src+'?v=20261031-3f-a-bc-1"',t)
 if t!=original:f.write_text(t,encoding='utf-8')
print('3F A1/A2 source rooms and east-core BC connectivity updated; legacy B/C room locations explicitly retained.')
