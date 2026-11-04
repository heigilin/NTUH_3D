const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const html = fs.readFileSync('index.html', 'utf8').replace(/<!--[\s\S]*?-->/g, '');
const files = [...html.matchAll(/src="(js\/[^"?]+)(?:\?[^" ]*)?"/g)].map(m => m[1])
  .filter(p => /js\/data\/(campus-data|rooms-data|ward-3d-layout-data|ward-bed-ids|ward-proportion-review-data)\.js$/.test(p) || /js\/ward-(source-|plan-layout|door-layout|plan-geometry|plan-2d)/.test(p));
const c = { window: {}, console }; vm.createContext(c);
for (const p of files) vm.runInContext(fs.readFileSync(p, 'utf8'), c, { filename: p });
const w = c.window; w.WardPlanGeometry.prepare(w.WARD_3D_LAYOUT_DATA, w.WardPlanGeometry.rawCorridors);
const l=w.WARD_3D_LAYOUT_DATA.CHILD_HOSPITAL['14F'];
assert.equal(l.sourceCoverage.status,'source-approximated');
assert.equal(l.rooms.length,29);assert.equal(l.beds.length,51);
const rows=[];
for(const ward of ['14PW','14PE']){
 const rooms=l.rooms.filter(r=>r.ward===ward),beds=l.beds.filter(b=>b.ward===ward);
 const ids=Object.values(w.WARD_BED_IDS[ward]).flat().sort();
 assert.equal(JSON.stringify(beds.map(b=>b.bedId).sort()),JSON.stringify(ids));
 assert(!l.sourceUnplacedBeds.some(b=>b.ward===ward));
 for(const r of rooms){
  assert.equal(r.sourcePlan,'14PE_14PW.pdf');
  const ns=r.windowSides.some(s=>s==='east'||s==='west');assert.equal(r.bedAxis,ns?'north-south':'east-west');
  for(const b of beds.filter(b=>b.roomCode===r.roomCode)){
   assert.equal(b.axis,ns?'north-south':'east-west');
   const q=r.bedBounds||r.bounds;
   assert(Math.abs(b.x-q.x)+b.width/2<=q.width/2+1e-6 && Math.abs(b.z-q.z)+b.depth/2<=q.depth/2+1e-6,'bed outside safe zone');
   for(const other of beds.filter(a=>a.roomCode===r.roomCode&&a!==b))assert(Math.abs(b.x-other.x)>=(b.width+other.width)/2-1e-6||Math.abs(b.z-other.z)>=(b.depth+other.depth)/2-1e-6,'bed overlap');
   assert(Math.abs(b.x-r.bounds.x)+b.width/2<=r.bounds.width/2+1e-6,'bed x overflow');
   assert(Math.abs(b.z-r.bounds.z)+b.depth/2<=r.bounds.depth/2+1e-6,'bed z overflow');
  }
 }
 const s=w.WardPlan2D.scene('CHILD_HOSPITAL','14F',ward);assert.equal(s.beds.length,ids.length);
 rows.push({ward,rooms:rooms.length,beds:beds.length});
}
const rect=q=>w.WardPlanGeometry.rect(q.bounds),all=[...l.rooms,...l.facilities,...l.nursingStations],conflicts=[],crossings=[];
for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++)if(w.WardPlanGeometry.hit(rect(all[i]),rect(all[j])))conflicts.push([(all[i].ward||'')+':'+(all[i].roomCode||all[i].name),(all[j].ward||'')+':'+(all[j].roomCode||all[j].name)]);
for(const c of l.sourceTraceCorridors)for(const r of all)if(w.WardPlanGeometry.hit(rect(c),rect(r)))crossings.push([c.name,r.name||r.roomCode]);
console.log(JSON.stringify({rows,conflicts,crossings}));
assert.equal(conflicts.length,0,'space overlaps');assert.equal(crossings.length,0,'corridor overlap');
