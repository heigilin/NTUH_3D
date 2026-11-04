const fs=require('fs'),vm=require('vm');global.window=global;
for(const f of ['js/data/rooms-data.js','js/data/ward-3d-layout-data.js','js/data/ward-bed-ids.js','js/ward-source-traces.js','js/ward-source-6f.js','js/ward-source-floor-review.js','js/ward-source-icu-3-4.js','js/ward-plan-layout.js','js/ward-plan-geometry.js','js/ward-plan-2d.js'])vm.runInThisContext(fs.readFileSync(f,'utf8'));
WardPlanGeometry.prepare(WARD_3D_LAYOUT_DATA,WardPlanGeometry.rawCorridors);
const assert=require('assert');const floors=[];
for(const f of [3,4,5,6,7,8,9,11,12,13,14,15]){
 const l=WARD_3D_LAYOUT_DATA.E01_MAIN[f+'F'],items=[...l.rooms,...l.nursingStations,...l.facilities],conflicts=[],crossings=[],links=l.displayCorridors.filter(c=>c.isInterWing);
 for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++)if((items[i].sourceTrace||items[j].sourceTrace)&&WardPlanGeometry.hit(WardPlanGeometry.rect(items[i].bounds),WardPlanGeometry.rect(items[j].bounds)))conflicts.push([items[i].ward,items[i].roomCode||items[i].name,items[j].ward,items[j].roomCode||items[j].name]);
 for(const c of l.displayCorridors.filter(c=>c.isInterWing||c.sourceTrace&&c.mainSpine))for(const s of items)if(WardPlanGeometry.hit(WardPlanGeometry.rect(c.bounds),WardPlanGeometry.rect(s.bounds)))crossings.push([c.id,s.ward,s.roomCode||s.name]);
 floors.push({floor:f,conflicts,crossings,links:links.length,reviewed:Object.keys(l.sourceTraceWards||{}),unplacedBeds:l.sourceUnplacedBeds?.length||0});
}
fs.writeFileSync('scratch/floor-source-review/geometry-check.json',JSON.stringify(floors,null,2));console.log(JSON.stringify(floors.map(f=>({floor:f.floor,conflicts:f.conflicts.length,crossings:f.crossings.length,links:f.links,reviewed:f.reviewed.length}))));

assert(floors.every(f=>f.conflicts.length===0&&f.crossings.length===0&&f.links>=3),'source geometry or link collision');
for(const plan of [...new Map(WardSourceTraces.plans.map(p=>[[p.building,p.floor,p.ward].join("/"),p])).values()]){const l=WARD_3D_LAYOUT_DATA[plan.building][plan.floor],r=l.rooms.filter(r=>r.ward===plan.ward);assert.equal(r.length,plan.rooms.length);for(const c of l.sourceTraceCorridors.filter(c=>c.ward===plan.ward))for(const s of [...r,...l.facilities.filter(q=>q.ward===plan.ward),...l.nursingStations.filter(q=>q.ward===plan.ward)])assert(!WardPlanGeometry.hit(WardPlanGeometry.rect(c.bounds),WardPlanGeometry.rect(s.bounds)),plan.ward+' source local corridor overlap');const source=Object.values(WARD_BED_IDS[plan.bedWard||plan.ward]||{}).flat().sort(),kept=[...l.beds.filter(b=>b.ward===plan.ward&&!b.bedId.startsWith('SCHEMATIC-')).map(b=>b.bedId),...(l.sourceUnplacedBeds||[]).filter(b=>b.ward===plan.ward).map(b=>b.bedId)].sort();assert.deepEqual(kept,source,plan.ward+' source beds');}
console.log('PASS: 12 floors, source inter-wing segments; no reviewed space/core-link overlaps; source bed IDs retained.');

for(const l of Object.values(WARD_3D_LAYOUT_DATA.E01_MAIN))for(const r of l.rooms.filter(r=>r.sourceTrace)){
 const rb=WardPlanGeometry.rect(r.bounds),beds=l.beds.filter(b=>b.ward===r.ward&&b.roomCode===r.roomCode);
 const rect=b=>({l:b.x-b.width/2,r:b.x+b.width/2,t:b.z-b.depth/2,b:b.z+b.depth/2});
 for(const b of beds){const q=rect(b);assert(q.l>=rb.l-1e-6&&q.r<=rb.r+1e-6&&q.t>=rb.t-1e-6&&q.b<=rb.b+1e-6,r.ward+r.roomCode+' bed overflow');}
 for(let i=0;i<beds.length;i++)for(let j=i+1;j<beds.length;j++)assert(!WardPlanGeometry.hit(rect(beds[i]),rect(beds[j])),r.ward+r.roomCode+' bed overlap');
}
console.log('PASS: source-room bed symbols stay within walls and do not overlap.');

for(const f of [3,4,5,6,7,8,9,11,12,13,14,15]){
 const l=WARD_3D_LAYOUT_DATA.E01_MAIN[f+'F'];assert.equal(WardPlanGeometry.components(l.displayCorridors.filter(c=>c.isInterWing)),1,f+'F B-C link disconnected');
 if(f>=5)assert.equal(WardPlanGeometry.components(l.displayCorridors),1,f+'F source local/core corridors disconnected');
}
console.log('PASS: all 12 B-C routes connected; 10 source-layout floors have one continuous corridor network.');
