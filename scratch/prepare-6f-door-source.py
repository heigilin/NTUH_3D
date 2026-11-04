from pathlib import Path
import shutil
p=Path.cwd();b=p/'scratch/before-6f-room-door-fix';b.mkdir(exist_ok=True)
for n in ['js/ward-source-6f.js','js/ward-plan-layout.js','js/ward-plan-2d.js','js/app.js','index.html']:shutil.copy2(p/n,b/Path(n).name)
f=p/'js/ward-source-6f.js';t=f.read_text(encoding='utf-8');mark="  window.WardSourceTraces.plans.push({...common,ward:'6C'"
assert mark in t
t=t.replace(mark,"""  // North A was still a legacy template. Rebuild it from this floor before
  // checking the entire sixth-floor set of room entrances.
  window.WardSourceTraces.plans.push({...common,ward:'06A',schematicBeds:null,replaceCorridorGroups:['A'],
    rooms:[['06',191,109,36,65,true],['07',229,109,38,65,true],['08',269,109,41,65,true],['09',312,109,34,65,true],
      ['10',348,109,44,65,true],['11',394,109,31,65,true],['12',427,109,41,65,true],
      ['13',506,109,43,65,true],['15',551,109,38,65,true],['16',591,109,34,65,true],['17',627,109,39,65,true],['18',668,109,36,65,true],
      ['05',152,237,37,65,false],['03',191,237,33,65,false],['02',234,237,32,88,false],['01',270,237,39,88,false],
      ['21',588,237,37,88,false],['20',628,237,39,88,false],['19',670,237,35,65,false]],
    spaces:[['教室（北）',469,109,36,65],['污物室',312,217,35,20],['檢查治療室',312,237,45,44],['教室（南）',312,281,45,53],
      ['庫房／醫師值班室／衛浴及儲藏空間',503,237,83,88],['儀輔室',706,237,36,65]],
    station:['06A 護理站／護理長室／總醫師室',385,225,84,74],
    corridors:[['06A東西走道',152,193,590,19]],
    notes:['依本層E_06F.pdf重新定位06A，保留12號與13號之間的教室及南側檢查治療／教室；不沿用其他樓層。',
      '病室採內接矩形，衛浴、前室及門口凹角屬未完整描繪區域；入口側與左右位置另由房門資料記錄。']});
  window.WardSourceTraces.plans.push({...common,ward:'6C'""",1);f.write_text(t,encoding='utf-8')
