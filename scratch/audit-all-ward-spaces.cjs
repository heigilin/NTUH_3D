const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),ctx={window:{}};vm.createContext(ctx);
for(const f of ['js/data/rooms-data.js','js/data/ward-3d-layout-data.js','js/data/ward-bed-ids.js','js/ward-source-traces.js','js/ward-source-6f.js','js/ward-source-floor-review.js','js/ward-source-icu-3-4.js','js/ward-plan-layout.js','js/ward-plan-geometry.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
const data=ctx.window.WARD_3D_LAYOUT_DATA,api=ctx.window.WardPlanGeometry;
api.prepare(data,api.rawCorridors);
const rows=[],quarantine=[];
for(const [building,floors] of Object.entries(data))for(const [floor,l] of Object.entries(floors)){
 if(building==='E01_MAIN'&&['1F','2F','10F'].includes(floor))continue;
 quarantine.push(...(l.sourceUnplacedSpaces||[]).map(q=>({building,floor,...q})),...(l.sourceUnplacedBeds||[]).map(q=>({building,floor,...q})));
 const items=[...(l.rooms||[]),...(l.facilities||[]),...(l.nursingStations||[])].filter(i=>i.bounds);
 for(const ward of new Set(items.map(i=>i.ward).filter(Boolean))){
  const own=items.filter(i=>i.ward===ward),conflicts=[],duplicates=[];
  const label=i=>i.roomName||i.name||i.roomCode;
  for(let i=0;i<own.length;i++)for(let j=i+1;j<own.length;j++){
   if(api.hit(api.rect(own[i].bounds),api.rect(own[j].bounds)))conflicts.push({a:label(own[i]),b:label(own[j])});
   if(label(own[i])===label(own[j]) && (own[i].roomCode&&own[j].roomCode ? own[i].roomCode===own[j].roomCode : ['x','z','width','depth'].every(k=>Math.abs(own[i].bounds[k]-own[j].bounds[k])<1e-6)))duplicates.push(label(own[i]));
  }
  let source=null;
  if(building==='E01_MAIN')source='E_'+String(parseInt(floor,10)).padStart(2,'0')+'F.pdf';
  else if(building.startsWith('W'))source=ward.replace(/^0/,'')+'.pdf';
  else if(building==='CHILD_HOSPITAL'){
   const suffix=ward.replace(/^\d+/,'');
   const candidates=[ward+'.pdf',ward.replace(/P[EW]$/,'PE_PW')+'.pdf',ward.replace(/P[EW]$/,'PW_PE')+'.pdf'];
   const available=fs.readdirSync(root).filter(f=>f.toLowerCase().endsWith('.pdf'));
   source=available.find(f=>f.startsWith(ward.slice(0,2))&&f.includes(suffix))||candidates.find(f=>fs.existsSync(path.join(root,f)))||null;
  }
  if(source&&!fs.existsSync(path.join(root,source)))source=null;
  rows.push({building,floor,ward,rooms:(l.rooms||[]).filter(r=>r.ward===ward).length,conflicts,duplicates,source,sourceReviewed:!!l.sourceTraceWards?.[ward],status:l.sourceTraceWards?.[ward]?'依原圖重建，矩形近似邊界見備註':source?'原圖待逐間重建':'缺少可對應原圖，待確認',notes:l.sourceTraceWards?.[ward]?.notes||[]});
 }
}
for(const plan of [...new Map(ctx.window.WardSourceTraces.plans.map(p=>[[p.building,p.floor,p.ward].join("/"),p])).values()]){
 const row=rows.find(r=>r.ward===plan.ward&&r.floor===plan.floor&&r.building===plan.building);
 assert.equal(row.rooms,plan.rooms.length,plan.ward+' source room count');
 assert.equal(row.conflicts.length,0,plan.ward+' rooms/public spaces overlap');
 assert.equal(row.duplicates.length,0,plan.ward+' duplicate labels');
 const floor=data[plan.building][plan.floor];
 if(plan.station){
 assert(floor.nursingStations.find(s=>s.ward===plan.ward).sourceTrace);
 assert(!floor.nursingStations.find(s=>s.ward===plan.ward).geometryRelocated);
 }
 const spaces=[...floor.rooms,...floor.facilities,...floor.nursingStations].filter(s=>s.ward===plan.ward);
 for(const corridor of floor.sourceTraceCorridors.filter(c=>c.ward===plan.ward))for(const space of spaces)assert(!api.hit(api.rect(corridor.bounds),api.rect(space.bounds)),plan.ward+' source walkway intersects space');
}
const a=rows.find(r=>r.ward==='14A'&&r.floor==='14F');assert(a&&a.rooms===19);assert.equal(a.conflicts.length,0);assert.equal(a.duplicates.length,0);
const l=data.E01_MAIN['14F'],rs=l.rooms.filter(r=>r.ward==='14A');
assert(!rs.some(r=>r.roomCode==='22'));
assert(l.sourceUnplacedBeds.some(b=>b.roomCode==='22'));
assert.equal(rs.find(r=>r.roomCode==='06').sourceRect.y,14);
assert.equal(rs.find(r=>r.roomCode==='01').sourceRect.y,140);
assert(l.nursingStations.find(r=>r.ward==='14A').sourceTrace);
assert(!l.nursingStations.find(r=>r.ward==='14A').geometryRelocated);
for(const c of l.displayCorridors)for(const r of [...l.rooms,...l.facilities,...l.nursingStations].filter(r=>r.ward==='14A'))assert(!api.hit(api.rect(c.bounds),api.rect(r.bounds)),'14A corridor intersects '+(r.name||r.roomName));
const out={date:'2026-10-31',scope:'病房結構幾何初篩；東址1、2、10樓依使用者指定排除；原圖逐間重建分開紀錄',wards:rows.length,conflictWards:rows.filter(r=>r.conflicts.length).length,roomSpaceConflictPairs:rows.reduce((n,r)=>n+r.conflicts.length,0),sourceRebuilt:rows.filter(r=>r.sourceReviewed).length,rows,quarantine};
fs.writeFileSync(path.join(root,'scratch/all-ward-source-audit.json'),JSON.stringify(out,null,2));
const text=[
 '逐病房空間與原圖校核進度（2026-10-31）',
 `範圍：${rows.length} 組樓層／病房。每組均檢查房間與公共空間彼此重疊、重複名稱、原圖檔案對應。`,
 `目前仍有 ${out.conflictWards} 組病房共 ${out.roomSpaceConflictPairs} 對空間重疊；原圖逐間重建目前完成 ${ctx.window.WardSourceTraces.plans.map(p=>p.ward).join("、")}。`,
 '先前「走道與病室重疊為 0」只代表走道被裁切，沒有涵蓋病室彼此、公共空間與病室的重疊，也不代表房號符合原圖。',
 '本報告明確撤回把舊幾何檢查當成整體配置正確的解讀。',
 '',
 '14A：依 E_14F.pdf 重新定位 19 間病室、護理站與公共空間。上排為 06/07/08/09/10/11、會議室兼教室、12/13/15/16/17；下排左 05/03/02/01，右 20/19/18/21。',
 '14A22：來源床號存在，但本份原圖未確認房間，保留於待定位清單，不繪製在走道上。原圖與床號清單可能有版本差異，待確認。',
 '14A02：西南內縮角暫採內接矩形；所有矩形均為依原圖相對位置重建，不是工程測量。',
 '14A、14B、14C、14D 修正後：房間／公共空間重疊 0、走道穿越空間 0；原圖護理站不再被自動挪位。',
 '14D12、14D13 範圍在原圖標為工作人員用膳室；相關來源床號保留未定位。',
 '',
 '建物\t樓層\t病房\t空間重疊對數\t重複名稱數\t來源圖\t校核狀態',
 ...rows.map(r=>[r.building,r.floor,r.ward,r.conflicts.length,r.duplicates.length,r.source||'無對應',r.status].join('\t')),
 '',
 '尚有重疊的空間（供後續依原圖逐一重建，不自動挪位）：',
 ...rows.flatMap(r=>r.conflicts.map(c=>`${r.floor} ${r.ward}: ${c.a} / ${c.b}`)),
 '',
 '未定位資料保留清單：',
 ...quarantine.map(q=>`${q.building} ${q.floor}: ${q.bedId||q.item?.roomName||q.item?.name||q.item?.roomCode}；${q.reason}`)
];
fs.writeFileSync(path.join(root,'逐病房原圖校核報告.txt'),text.join('\n'));
console.log(JSON.stringify({wards:out.wards,conflictWards:out.conflictWards,conflictPairs:out.roomSpaceConflictPairs,sourceRebuilt:out.sourceRebuilt,quarantined:quarantine.length,trace14A:'PASS'}));
