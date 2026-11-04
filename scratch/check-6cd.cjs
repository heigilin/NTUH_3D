const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
function load(extra){const c={window:{}};vm.createContext(c);for(const f of ['data/rooms-data','data/ward-3d-layout-data','data/ward-bed-ids','ward-source-traces',...(extra?['ward-source-6f']:[]),...(fs.existsSync('js/ward-source-floor-review.js')?['ward-source-floor-review']:[]),'ward-plan-layout','ward-plan-geometry','ward-plan-2d'])vm.runInContext(fs.readFileSync('js/'+f+'.js','utf8'),c);return c.window;}
const before=load(false),after=load(true),root=after.WARD_3D_LAYOUT_DATA;
for(const [b,floors] of Object.entries(root))for(const [f,l] of Object.entries(floors)){
 const original=before.WARD_3D_LAYOUT_DATA[b][f];
 assert.equal(JSON.stringify(l.rooms.filter(r=>!['6C','6D'].includes(r.ward))),JSON.stringify(original.rooms));
 assert.equal(JSON.stringify(l.beds.filter(b=>!['6C','6D'].includes(b.ward))),JSON.stringify(original.beds));
}
const audit=after.WardPlanGeometry.prepare(root,after.WardPlanGeometry.rawCorridors).find(r=>r.building==='E01_MAIN'&&r.floor==='6F');
assert.equal(audit.stationRoomAfter,0);assert.equal(audit.stationCorridorAfter,0);assert.equal(audit.corridorRoomAfter,0);
for(const ward of ['6C','6D']){
 const scene=after.WardPlan2D.scene('E01_MAIN','6F',ward),l=root.E01_MAIN['6F'];
 assert(scene.rooms.length>0,'non-empty ward');assert(scene.spaces.length>0);assert.equal(scene.beds.length,ward==='6C'?36:37);
 assert.equal(new Set(scene.rooms.map(r=>r.code)).size,scene.rooms.length);
 assert.equal(l.rooms.filter(r=>r.ward===ward).length,scene.rooms.length);
 for(const room of l.rooms.filter(r=>r.ward===ward))assert.equal(room.sourcePlan,'E_06F.pdf');
 const beds=l.beds.filter(b=>b.ward===ward);
 assert.deepEqual(JSON.parse(JSON.stringify(scene.beds.map(b=>b.id).sort())),JSON.parse(JSON.stringify(beds.map(b=>b.bedId).sort())));
 for(const b of beds){
   assert(b.isSchematic&&b.bedId.startsWith('SCHEMATIC-'));
   const r=l.rooms.find(r=>r.ward===ward&&r.roomCode===b.roomCode),rb=r.bounds;
   assert(rb.width/2-Math.abs(b.x-rb.x)-b.width/2>=.45-1e-6,b.bedId+' head/foot clearance');
   assert(rb.depth/2-Math.abs(b.z-rb.z)-b.depth/2>=.45-1e-6,b.bedId+' side clearance');
   const sr=scene.rooms.find(r=>r.code===b.roomCode),sb=scene.beds.find(q=>q.id===b.bedId),k=sr.w/rb.width;
   assert(Math.abs((sb.x-sr.x)/k-(b.x-b.width/2-rb.x+rb.width/2))<1e-6,'2D/3D X');
   assert(Math.abs((sb.y-sr.y)/k-(b.z-b.depth/2-rb.z+rb.depth/2))<1e-6,'2D/3D Z');
 }
 for(const r of l.rooms.filter(r=>r.ward===ward)){
   const group=beds.filter(b=>b.roomCode===r.roomCode);
   for(let i=0;i<group.length;i++)for(let j=i+1;j<group.length;j++){
     const a=group[i],b=group[j];assert(Math.abs(a.x-b.x)>=(a.width+b.width)/2-1e-6||Math.abs(a.z-b.z)>=(a.depth+b.depth)/2-1e-6,'beds overlap');
   }
   const first=group.find(b=>b.bedId.endsWith('-01')),third=group.find(b=>b.bedId.endsWith('-03'));
   if(third)assert(r.upper?first.z>third.z:first.z<third.z,'01 corridor / 03 window');
 }
 console.log(ward+': '+scene.rooms.length+' rooms / '+beds.length+' schematic beds; 2D/3D match; wall margins >= 0.45; no overlaps.');
}
assert.equal(root.E01_MAIN['6F'].rooms.find(r=>r.ward==='6C'&&r.roomCode==='22').category,'ISOLATION');
console.log('PASS: existing rooms and beds unchanged; 6F corridor/room/station intersections = 0.');
fs.writeFileSync('scratch/6cd-geometry-audit.json',JSON.stringify(audit,null,2));
