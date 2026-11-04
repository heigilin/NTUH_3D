from pathlib import Path
import shutil,re
p=Path.cwd();backup=p/'scratch/before-03a2-complete-spaces';backup.mkdir(exist_ok=True)
for name in ['js/ward-source-traces.js','js/ward-plan-2d.js','js/app.js','index.html']:shutil.copy2(p/name,backup/Path(name).name)
f=p/'js/ward-source-traces.js';t=f.read_text(encoding='utf-8');a=t.index("  plans.push({building:'E01_MAIN',floor:'3F',ward:'03A2'");b=t.index('  const toBounds=',a)
new='''  plans.push({building:'E01_MAIN',floor:'3F',ward:'03A2',source:'E_03F.pdf',image:'floorplans/E_03F.jpg',origin:[550,880],scale:.08,partialCorridors:true,replaceCorridorGroups:['A'],isolationCodes:['01','02','03','05','06','07','08','09','10'],
    rooms:[['01',635,14,67,87,true],['02',702,14,68,87,true],['03',770,14,68,87,true],['05',838,14,68,87,true],['06',906,14,68,87,true],
      ['10',763,300,74,87,false],['09',837,300,68,87,false],['08',905,264,68,89,false],['07',973,260,66,98,false]],
    spaces:[
      ['會談室',476,14,56,48],['護理長室',532,14,42,70],['儀器室',574,14,61,102],
      ['浴廁',526,180,48,34],['男更衣室',526,214,48,30],['值班室',526,244,48,34],
      ['女更衣室',476,308,49,36],['浴廁（更衣區）',432,308,44,36],
      ['前室及家屬更衣室',574,180,61,164],
      ['污物室',635,180,44,103],['醫材及備藥室',679,180,43,108],['儀器室及備藥室',722,180,41,108],
      ['電氣室',635,283,44,61],['管道間',679,288,84,56],['管道間（北側）',974,14,32,150],
      ['負壓前室01',635,101,67,33,'anteroom'],['負壓前室02',702,101,68,33,'anteroom'],
      ['負壓前室03',770,101,68,33,'anteroom'],['負壓前室05',838,101,68,33,'anteroom'],['負壓前室06',906,101,68,33,'anteroom'],
      ['負壓前室10',763,270,74,30,'anteroom'],['負壓前室09',837,270,68,30,'anteroom'],
      ['負壓前室08',905,231,50,33,'anteroom'],['負壓前室07',982,201,57,59,'anteroom'],
      ['負壓前室07入口',974,164,16,37,'anteroom'],
      ['封閉空間',1039,201,21,157]
    ],station:null,
    corridors:[
      ['03A2北排走道',635,134,339,46],
      ['03A2核心區走道',476,84,98,96],['03A2會談室旁走道',476,62,56,22],
      ['03A2儀器室前走道',574,116,61,64],['03A2西側走道',476,180,50,98],['03A2更衣區前走道',476,278,98,30],
      ['03A2前室側走道',563,308,11,36],
      ['03A2開放護理區北段',763,180,211,21],['03A2開放護理區中段',763,201,219,30],
      ['03A2開放護理區南段',763,231,142,39],['03A2開放護理區東段',955,231,27,29],['03A2開放護理區08入口',955,260,18,4],
      ['03A2通往N2走道',990,164,70,37]
    ],
    notes:['依E_03F.pdf補齊9間負壓病室、各室前室、07入口前室、開放護理區、護理長室、會談室、更衣及浴廁、醫材備藥、儀器、污物、電氣、管道與鄰近N2樓梯。',
      '原圖護理區未畫出獨立實體櫃台，因此以可通行的平面區域呈現並隱藏護理站文字，不把護理區當成阻擋走道的房間。',
      '07東側依原圖為封閉空間，已移除先前示意走道；通往N2的走道在07前室北側。',
      '西側核心區含相鄰的會談、更衣與浴廁；房間外框採矩形內接近似，前室門口凹角、家屬更衣室L形小內縮與精細門扇未逐段描繪。床位位置與尺寸為示意，非施工或隔離壓差設計圖。']});
'''
t=t[:a]+new+t[b:]
t=t.replace("plan.spaces.map(([name,x,y,w,h],i)=>({id:","plan.spaces.map(([name,x,y,w,h,type='service'],i)=>({id:")
t=t.replace("name,roomName:name,ward:plan.ward,type:'service',bounds:project", "name,roomName:name,ward:plan.ward,type,bounds:project")
t=t.replace("name,ward:plan.ward,bounds:project(x,y,w,h),sourceTrace:true})))", "name,ward:plan.ward,bounds:project(x,y,w,h),sourceTrace:true,isNursingArea:name.includes('開放護理區')})))")
# A traced shared-area boundary is authoritative, even though it is not a patient room.
t=t.replace("f.sourceTrace=true;f.sourcePlan='E_03F.pdf';", "f.sourceTrace=true;f.sourcePlan='E_03F.pdf';if(id==='FAC-STAIR-N2')f.ward='03A2';")
f.write_text(t,encoding='utf-8')
f=p/'js/ward-plan-2d.js';t=f.read_text(encoding='utf-8');t=t.replace('label,isInterWing:c.isInterWing,id:c.id','label,isInterWing:c.isInterWing,isNursingArea:c.isNursingArea,id:c.id')
t=t.replace("p.isInterWing?'#d8edf5':'#edf3f7'", "p.isNursingArea?'#d5eeea':p.isInterWing?'#d8edf5':'#edf3f7'")
# Carry the room type to the renderer, preserving prior behavior for other public rooms.
t=t.replace('      add(p.x,p.y,p.w,p.h,label);','      add(p.x,p.y,p.w,p.h,label,f.type===\'anteroom\'?\'anteroom\':\'service\');')
t=t.replace("p.kind==='nurse'?C.nurse:C.service", "p.kind==='nurse'?C.nurse:p.kind==='anteroom'?'#faf3df':C.service")
f.write_text(t,encoding='utf-8')
f=p/'js/app.js';t=f.read_text(encoding='utf-8');t=t.replace('color: corr.isInterWing ? 0xc8e6f1 : 0x94a3b8','color: corr.isNursingArea ? 0xd5eeea : corr.isInterWing ? 0xc8e6f1 : 0x94a3b8');f.write_text(t,encoding='utf-8')
for f in p.glob('*.html'):
 t=f.read_text(encoding='utf-8');old=t
 for src in ['js/ward-source-traces.js','js/ward-plan-2d.js','js/app.js']:
  t=re.sub(r'src="'+re.escape(src)+r'(?:\?[^" ]*)?"','src="'+src+'?v=20261031-03a2-complete-1"',t)
 if t!=old:f.write_text(t,encoding='utf-8')
print('03A2 source-traced public spaces, anterooms and open nursing circulation added.')
