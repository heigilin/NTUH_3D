const fs=require('fs'),vm=require('vm');global.window=global;
for(const f of ['js/data/rooms-data.js','js/data/ward-3d-layout-data.js','js/data/ward-bed-ids.js','js/ward-source-traces.js','js/ward-source-6f.js','js/ward-source-floor-review.js','js/ward-plan-layout.js','js/ward-door-layout.js','js/ward-plan-geometry.js','js/ward-plan-2d.js'])vm.runInThisContext(fs.readFileSync(f,'utf8'));
WardPlanGeometry.prepare(WARD_3D_LAYOUT_DATA,WardPlanGeometry.rawCorridors);const a=WARD_DOOR_AUDIT;
fs.writeFileSync('scratch/all-floor-door-audit.json',JSON.stringify(a,null,2));
const assert=require('node:assert/strict');
let checked=0;
for(const [building,floors] of Object.entries(WARD_3D_LAYOUT_DATA))for(const [floor,l] of Object.entries(floors)){
 const scenes=new Map();
 for(const r of l.rooms||[]){
  if(!r.door)continue;
  const d=WardRoomDoors.segment(r),q=r.bounds;
  const length=d.horizontal?q.width:q.depth,center=d.horizontal?q.x:q.z;
  assert(d.start>center-length/2&&d.end<center+length/2,'door crosses corner');
  const parts=WardRoomDoors.walls(r),side=parts.filter(p=>p.side===d.side);
  assert.equal(parts.length,5);
  assert(Math.abs(side.reduce((s,p)=>s+(d.horizontal?p.width:p.depth),0)+d.width-length)<1e-7,'wall fills doorway');
  if(!scenes.has(r.ward))scenes.set(r.ward,WardPlan2D.scene(building,floor,r.ward));
  const two=scenes.get(r.ward).rooms.find(p=>p.code===r.roomCode&&p.ward===r.ward);
  if(two){assert.equal(two.door.side,d.side);assert.equal(two.door.offset,d.offset);assert.equal(two.door.width,d.width);}
  checked++;
 }
}
const b=WARD_3D_LAYOUT_DATA.E01_MAIN['6F'].rooms.filter(r=>r.ward==='06B'&&r.door);
assert.equal(b.length,20);
assert(Math.abs(b.find(r=>r.roomCode==='01').door.offset-.78)<1e-9);
assert(Math.abs(b.find(r=>r.roomCode==='02').door.offset-.22)<1e-9);
assert(b.every(r=>r.door.sourceChecked&&r.door.validation==='clear-access'));
const groups=new Map();
for(const r of a.rows){const key=[r.building,r.floor].join(' / ');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r);}
const report=['全樓層病室門位檢查 2026-10-31',`共 ${groups.size} 個建置樓層、${a.rooms} 間空間；${checked} 個開口邊界與2D/3D共用資料檢查通過。`,
`對照E_06F.pdf的入口朝向與左右入口區：${a.sourceChecked}間（06A、06B、6C、6D）；門寬、門框為示意，原圖無法辨認的門扇開啟方向不繪製。`,
`現有幾何可連到走道或前室：${a.clear}間；未找到清楚通路：${a.pending.length}間。`,
'幾何通過只表示現有模型可接近入口，不能證明精確門位符合原圖。其他樓層精確門位仍需逐圖核實。',
'以下列出每個樓層檢查數及未找到通路的房間；未列出的病室仍可能需要原圖核實。',''];
for(const[key,rows]of groups){const pending=rows.filter(r=>r.door.validation!=='clear-access');report.push(`${key}：${rows.length}間；通路通過 ${rows.length-pending.length}；待核對 ${pending.length}`,pending.length?'  '+pending.map(r=>r.ward+' '+r.room).join('、'):'');}
fs.writeFileSync('全樓層病室門位檢查.txt',report.join('\r\n'));
console.log(JSON.stringify({rooms:a.rooms,sourceChecked:a.sourceChecked,clear:a.clear,pending:a.pending.length,sixth:a.rows.filter(r=>r.building==='E01_MAIN'&&r.floor==='6F').map(r=>({ward:r.ward,room:r.room,side:r.door.side,offset:r.door.offset,valid:r.door.validation}))}));
