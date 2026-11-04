const fs=require('fs'),vm=require('vm');global.window=global;
for(const f of ['js/data/rooms-data.js','js/data/ward-3d-layout-data.js','js/data/ward-bed-ids.js','js/ward-source-traces.js','js/ward-plan-layout.js','js/ward-plan-geometry.js','js/ward-plan-2d.js'])vm.runInThisContext(fs.readFileSync(f,'utf8'));
WardPlanGeometry.prepare(WARD_3D_LAYOUT_DATA,WardPlanGeometry.rawCorridors);
const failures=[],results=[];let rooms3d=0,rooms2d=0;
for(const [building,floors]of Object.entries(WARD_3D_LAYOUT_DATA))for(const[floor,l]of Object.entries(floors)){
 for(const r of l.rooms||[]){if(!r.bounds)continue;const q=r.bounds, beds=(l.beds||[]).filter(b=>b.ward===r.ward&&b.roomCode===r.roomCode).map(b=>({x:b.x-.9,y:b.z-.45,w:1.8,h:.9}));const p=WardPlanLabels.place({x:q.x-q.width/2,y:q.z-q.depth/2,w:q.width,h:q.depth},beds);rooms3d++;if(!p.clear)failures.push({building,floor,ward:r.ward,room:r.roomCode,view:'3D',bounds:q,beds});}
 for(const ward of ['ALL',...new Set((l.rooms||[]).map(r=>r.ward))]){const s=WardPlan2D.scene(building,floor,ward);for(const r of s.rooms){const p=WardPlanLabels.place(r,s.beds.filter(b=>b.room===r));rooms2d++;if(!p.clear)failures.push({building,floor,ward,room:r.code,view:'2D',bounds:r,beds:s.beds.filter(b=>b.room===r).map(b=>({x:b.x,y:b.y,w:b.w,h:b.h}))});}results.push({building,floor,ward});}
}
fs.writeFileSync('scratch/room-label-clearance-audit.json',JSON.stringify({configs:results.length,rooms3d,rooms2d,failures},null,2));console.log(JSON.stringify({configs:results.length,rooms3d,rooms2d,failures:failures.length,examples:failures.slice(0,4)}));
