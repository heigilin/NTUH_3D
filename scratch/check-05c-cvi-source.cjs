const fs=require('fs'),vm=require('vm'),assert=require('assert');global.window=global;
for(const f of ['js/data/rooms-data.js','js/data/ward-3d-layout-data.js','js/data/ward-bed-ids.js','js/ward-source-traces.js','js/ward-plan-layout.js','js/ward-plan-geometry.js','js/ward-plan-2d.js'])vm.runInThisContext(fs.readFileSync(f,'utf8'));
WardPlanGeometry.prepare(WARD_3D_LAYOUT_DATA,WardPlanGeometry.rawCorridors);
const l=WARD_3D_LAYOUT_DATA.E01_MAIN['5F'],wards=['05C','5CVI'];
const spaces=[...l.rooms,...l.facilities,...l.nursingStations];
let conflicts=[];for(let i=0;i<spaces.length;i++)for(let j=i+1;j<spaces.length;j++)if((wards.includes(spaces[i].ward)||wards.includes(spaces[j].ward))&&WardPlanGeometry.hit(WardPlanGeometry.rect(spaces[i].bounds),WardPlanGeometry.rect(spaces[j].bounds)))conflicts.push([spaces[i].ward,spaces[i].roomCode||spaces[i].name,spaces[j].ward,spaces[j].roomCode||spaces[j].name]);
console.log(JSON.stringify({wards:wards.map(w=>({ward:w,rooms:l.rooms.filter(r=>r.ward===w).length,beds:l.beds.filter(b=>b.ward===w).length,unplaced:l.sourceUnplacedBeds.filter(b=>b.ward===w)})),conflicts,corridors:l.displayCorridors.length},null,2));
assert.equal(conflicts.length,0);
for(const w of wards){const r=l.rooms.filter(r=>r.ward===w);assert(r.every(r=>r.sourceTrace));assert.deepEqual([...l.beds.filter(b=>b.ward===w).map(b=>b.bedId),...l.sourceUnplacedBeds.filter(b=>b.ward===w).map(b=>b.bedId)].sort(),Object.values(WARD_BED_IDS[w]).flat().sort());for(const c of l.displayCorridors)for(const s of spaces.filter(s=>s.ward===w))assert(!WardPlanGeometry.hit(WardPlanGeometry.rect(c.bounds),WardPlanGeometry.rect(s.bounds)));}
assert(Math.max(...l.rooms.filter(r=>r.ward==='5CVI').map(r=>r.bounds.z))<Math.min(...l.rooms.filter(r=>r.ward==='05C').map(r=>r.bounds.z)));
console.log('PASS source ward separation, IDs preserved, no target space or corridor overlaps');
