const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const ctx={window:{}};vm.createContext(ctx);
for(const f of ['js/data/rooms-data.js','js/data/ward-3d-layout-data.js','js/data/ward-bed-ids.js','js/ward-source-traces.js','js/ward-plan-layout.js','js/ward-plan-geometry.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
const data=ctx.window.WARD_3D_LAYOUT_DATA;
const snapshot=JSON.stringify(Object.values(data).flatMap(fs=>Object.values(fs).map(l=>({rooms:l.rooms,beds:l.beds}))));
const api=ctx.window.WardPlanGeometry;
const report=api.prepare(data,api.rawCorridors);
assert.equal(report.length,46);
const stationCount=report.reduce((n,r)=>n+r.stations,0);
assert.equal(stationCount,98,'five cross-floor station copies must remain unplaced');
for(const r of report){
  assert.equal(r.stationRoomAfter,0,r.building+r.floor+' station intersects room');
  assert.equal(r.corridorRoomAfter,0,r.building+r.floor+' corridor intersects room');
  assert.equal(r.stationCorridorAfter,0,r.building+r.floor+' station blocks corridor');
  assert.equal(r.unplacedStations.length,0,r.building+r.floor+' no valid station bay');
  const l=data[r.building][r.floor];
  const ns=l.nursingStations||[];
  for(let i=0;i<ns.length;i++)for(let j=i+1;j<ns.length;j++)assert(!api.hit(api.rect(ns[i].bounds),api.rect(ns[j].bounds)),r.building+r.floor+' stations overlap');
  for(const c of l.displayCorridors)assert(c.bounds.width>0&&c.bounds.depth>0,'degenerate corridor');
}
assert.equal(JSON.stringify(Object.values(data).flatMap(fs=>Object.values(fs).map(l=>({rooms:l.rooms,beds:l.beds})))),snapshot,'room or bed coordinates changed');
const after=JSON.stringify(data);api.prepare(data,api.rawCorridors);assert.equal(JSON.stringify(data),after,'preparation must be idempotent');
fs.writeFileSync(path.join(root,'scratch/ward-geometry-audit.json'),JSON.stringify(report,null,2));
const total=k=>report.reduce((n,r)=>n+r[k],0);
const moves=report.reduce((n,r)=>n+r.movedStations.length,0);
const review=report.filter(r=>r.corridorComponents>1);
const lines=[
  '病房顯示配置檢查報告（2026-10-30）',
  `範圍：現有資料全部 46 個樓層、${stationCount} 個護理站；不包含尚未建置的實際樓層。`,
  '這是程式矩形幾何檢查，不代表已核實醫院實際格局或通行寬度。',
  `原顯示：護理站與病室重疊 ${total('stationRoomBefore')} 對；護理站與走道重疊 ${total('stationCorridorBefore')} 對；走道與病室重疊 ${total('corridorRoomBefore')} 對。`,
  `修正：${moves} 個護理站改為走道旁不重疊的示意位置；西址走道依兩排病室間隙校正。`,
  '原病室與床位的座標、尺寸及識別碼均保留；調整前的護理站座標保留於 sourceBounds 與 JSON 報告。',
  '修正後：護理站／病室、護理站／走道、走道／病室、護理站互相重疊皆為 0。',
  `限制：${review.length} 個樓層的走道呈多段或多個區塊，尚不能以本檢查保證相互連通；未擅自新增繞行路徑或出入口。`,
  '所有移位護理站均為示意位置，須依原始平面圖確認。不同病房的走道分離未必是錯誤，需逐圖覆核。',
  '',
  '建物\t樓層\t病室數\t護理站數\t移位數\t走道區塊(前→後)\t修正後三類重疊',
  ...report.map(r=>`${r.building}\t${r.floor}\t${r.rooms}\t${r.stations}\t${r.movedStations.length}\t${r.corridorComponentsBefore}→${r.corridorComponents}\t${r.stationRoomAfter}/${r.stationCorridorAfter}/${r.corridorRoomAfter}`),
  '',
  '個別護理站調整（完整座標見 scratch/ward-geometry-audit.json）：',
  ...report.flatMap(r=>r.movedStations.map(n=>`${r.building} ${r.floor} ${n.name}: (${n.from.x.toFixed(2)}, ${n.from.z.toFixed(2)}) → (${n.to.x.toFixed(2)}, ${n.to.z.toFixed(2)})，示意待原圖覆核`))
];
fs.writeFileSync(path.join(root,'病房空間檢查報告.txt'),lines.join('\n'));
console.log(`PASS: ${report.length} floors, ${stationCount} stations; ${moves} display station moves; no geometry intersections; rooms and beds unchanged; idempotent. ${review.length} floors require connectivity review.`);
