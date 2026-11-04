const fs=require('fs'),vm=require('vm'),assert=require('assert');global.window=global;
for(const f of ['js/data/rooms-data.js','js/data/ward-3d-layout-data.js','js/data/ward-bed-ids.js','js/ward-source-traces.js','js/ward-source-6f.js','js/ward-source-floor-review.js','js/ward-source-icu-3-4.js','js/ward-plan-layout.js','js/ward-door-layout.js','js/ward-plan-geometry.js','js/ward-plan-2d.js'])vm.runInThisContext(fs.readFileSync(f,'utf8'));
WardPlanGeometry.prepare(WARD_3D_LAYOUT_DATA,WardPlanGeometry.rawCorridors);
const rows=[];
for(const f of ['3F','4F']){
 const l=WARD_3D_LAYOUT_DATA.E01_MAIN[f],items=[...l.rooms,...l.nursingStations,...l.facilities],conflicts=[],crossings=[];
 const label=r=>r.ward+':'+(r.roomCode||r.name);
 for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++)if(WardPlanGeometry.hit(WardPlanGeometry.rect(items[i].bounds),WardPlanGeometry.rect(items[j].bounds)))conflicts.push([label(items[i]),label(items[j])]);
 for(const c of l.sourceTraceCorridors)for(const s of items)if(WardPlanGeometry.hit(WardPlanGeometry.rect(c.bounds),WardPlanGeometry.rect(s.bounds)))crossings.push([c.id,label(s)]);
 rows.push({floor:f,wards:Object.keys(l.sourceTraceWards),conflicts,crossings,network:WardPlanGeometry.components(l.displayCorridors),networkWithAnterooms:WardPlanGeometry.components([...l.displayCorridors,...l.facilities.filter(q=>(q.ward==='03A2'&&['07入口','負壓前室07'].includes(q.name))||(q.ward==='04D1'&&q.type==='anteroom'))]),unplaced:l.sourceUnplacedBeds});
}
fs.writeFileSync('scratch/floor-source-review/icu-3-4-check.json',JSON.stringify(rows,null,2));console.log(JSON.stringify(rows,null,2));

for(const row of rows){assert.equal(row.conflicts.length,0,row.floor+' space overlap');assert.equal(row.crossings.length,0,row.floor+' source corridor overlap');assert.equal(row.networkWithAnterooms,1,row.floor+' circulation with source anterooms disconnected');}
for(const f of ['3F','4F']){
 const l=WARD_3D_LAYOUT_DATA.E01_MAIN[f];
 for(const w of new Set(l.rooms.map(r=>r.ward))){const plan=WardSourceTraces.plans.find(p=>p.floor===f&&p.ward===w);if(!plan)continue;
 const source=Object.values(WARD_BED_IDS[plan.bedWard||w]||{}).flat().sort(),kept=[...l.beds.filter(b=>b.ward===w&&!b.symbolOnly).map(b=>b.bedId),...(l.sourceUnplacedBeds||[]).filter(b=>b.ward===w).map(b=>b.bedId)].sort();assert.deepEqual(kept,source,w+' IDs changed/lost/duplicated');
 }
 for(const r of l.rooms){const b=l.beds.filter(b=>b.ward===r.ward&&b.roomCode===r.roomCode),q=WardPlanGeometry.rect(r.bounds),rect=b=>({l:b.x-b.width/2,r:b.x+b.width/2,t:b.z-b.depth/2,b:b.z+b.depth/2});
 for(const bed of b){const p=rect(bed);assert(p.l>=q.l-1e-6&&p.r<=q.r+1e-6&&p.t>=q.t-1e-6&&p.b<=q.b+1e-6,r.ward+r.roomCode+' overflow');}
 for(let i=0;i<b.length;i++)for(let j=i+1;j<b.length;j++)assert(!WardPlanGeometry.hit(rect(b[i]),rect(b[j])),r.ward+r.roomCode+' bed overlap');
 }
}
console.log('PASS 3F/4F source spaces/corridors, anteroom access, unchanged bed IDs, bed fit.');
