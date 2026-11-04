const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const allowed=new Set(['js/data/rooms-data.js','js/data/ward-3d-layout-data.js','js/data/ward-bed-ids.js','js/ward-plan-layout.js','js/ward-door-layout.js','js/ward-plan-geometry.js','js/ward-plan-2d.js']);
const files=[...fs.readFileSync('index.html','utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]).filter(f=>f.startsWith('js/ward-source-')||allowed.has(f));
function load(before){const ctx={window:{},console};vm.createContext(ctx);for(const file of files){const path=before&&file==='js/ward-source-coverage.js'?'scratch/before-child-west-overlap-fix/ward-source-coverage.js':file;vm.runInContext(fs.readFileSync(path,'utf8'),ctx,{filename:path});}return ctx.window;}
const now=load(false),old=load(true),g=now.WardPlanGeometry,rows=[];g.prepare(now.WARD_3D_LAYOUT_DATA,g.rawCorridors);
function clashes(l,raw){const items=[...l.rooms,...l.facilities,...l.nursingStations].filter(x=>x.bounds),pairs=[],walk=[];const name=i=>i.ward+' '+(i.roomCode||i.name||i.roomName);
for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++)if(g.hit(g.rect(items[i].bounds),g.rect(items[j].bounds)))pairs.push([name(items[i]),name(items[j])]);
for(const c of raw)for(const item of items)if(g.hit(g.rect(c.bounds),g.rect(item.bounds)))walk.push([c.name,name(item)]);return {pairs,walk};}
const old14=old.WARD_3D_LAYOUT_DATA.CHILD_HOSPITAL['14F'],old14Conflicts=clashes(old14,old.WardPlanGeometry.rawCorridors('CHILD_HOSPITAL','14F',old14));old.WardPlanGeometry.prepare(old.WARD_3D_LAYOUT_DATA,old.WardPlanGeometry.rawCorridors);
for(const[b,floors]of Object.entries(now.WARD_3D_LAYOUT_DATA))if(b==='CHILD_HOSPITAL'||b.startsWith('W'))for(const[f,l]of Object.entries(floors)){
 const conflicts=clashes(l,g.rawCorridors(b,f,l)),previous=old.WARD_3D_LAYOUT_DATA[b][f],before=b==='CHILD_HOSPITAL'&&f==='14F'?old14Conflicts:clashes(previous,old.WardPlanGeometry.rawCorridors(b,f,previous));
 assert.equal(conflicts.pairs.length,0,b+'/'+f+' room/service overlap');assert.equal(conflicts.walk.length,0,b+'/'+f+' raw corridor crossing');
 if(b==='CHILD_HOSPITAL'&&f==='14F'){
  assert.equal(l.sourceCoverage.status,'excluded');assert.equal(l.rooms.length,0);
  const source=['14PW','14PE'].flatMap(w=>Object.values(now.WARD_BED_IDS[w]).flat()).sort();
  assert.equal(JSON.stringify(l.sourceUnplacedBeds.map(b=>b.bedId).sort()),JSON.stringify(source));assert.equal(source.length,51);
 }else for(const k of ['rooms','facilities','nursingStations','beds'])assert.equal(JSON.stringify(l[k]),JSON.stringify(previous[k]),b+'/'+f+' '+k+' altered outside 14F');
 const label={building:b,floor:f,status:l.sourceCoverage?.status,rooms:l.rooms.length,beds:l.beds.length,beforeRoomConflicts:before.pairs.length,beforeRawCorridorCrossings:before.walk.length,...conflicts};rows.push(label);
}
fs.writeFileSync('scratch/child-west-space-correction-audit.json',JSON.stringify({floors:rows.length,sourceFloors:rows.filter(r=>r.rooms>0).length,missing:rows.filter(r=>r.status==='missing-source'),rows},null,2));
console.log(JSON.stringify({floors:rows.length,sourceFloors:rows.filter(r=>r.rooms>0).length,missingFloors:rows.filter(r=>r.status==='missing-source').length,roomConflicts:rows.reduce((n,r)=>n+r.pairs.length,0),rawCorridorCrossings:rows.reduce((n,r)=>n+r.walk.length,0),withdrawn14F:{roomConflicts:rows.find(r=>r.building==='CHILD_HOSPITAL'&&r.floor==='14F').beforeRoomConflicts,sourceBedIdsPreserved:51}}));
