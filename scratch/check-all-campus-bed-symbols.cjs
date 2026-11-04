const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');global.window=global;
const paths=[...fs.readFileSync('index.html','utf8').matchAll(/<script[^>]+src="(js\/[^"?]+)(?:\?[^" ]*)?"/g)].map(m=>m[1]).filter(p=>p.startsWith('js/data/')||/^js\/ward-/.test(p));for(const p of paths)vm.runInThisContext(fs.readFileSync(p,'utf8'),{filename:p});WardPlanGeometry.prepare(WARD_3D_LAYOUT_DATA,WardPlanGeometry.rawCorridors);
// Use the same current source modules for both sides: other source-plan edits
// may arrive concurrently and must not be mistaken for this symbol-only fix.
const baseline={console};baseline.window=baseline;vm.createContext(baseline);
for(const p of paths)vm.runInContext(fs.readFileSync(p==='js/ward-plan-layout.js'?'scratch/before-all-campus-bed-symbols/ward-plan-layout.js':p,'utf8'),baseline,{filename:p});
baseline.WardPlanGeometry.prepare(baseline.WARD_3D_LAYOUT_DATA,baseline.WardPlanGeometry.rawCorridors);
const old=JSON.parse(JSON.stringify(baseline.WARD_3D_LAYOUT_DATA)),originalIds=JSON.parse(fs.readFileSync('scratch/before-all-campus-bed-symbols/bed-ids.json','utf8'));
assert.deepEqual(WARD_BED_IDS,originalIds);
const patient=r=>r.category==='PATIENT_ROOM'||r.category==='ISOLATION'||r.bedCount>0||/^\d+$/.test(r.roomCode);
const report={rooms:0,beds:0,added:[],missing:[],outside:[],twoMismatch:[],groups:{},unchangedExistingBeds:0};
for(const[b,floors]of Object.entries(WARD_3D_LAYOUT_DATA))for(const[f,l]of Object.entries(floors)){
 const scenes=new Map();for(const r of l.rooms||[]){if(!patient(r)||/DIRTY|CLEAN/i.test(r.roomCode))continue;report.rooms++;const beds=l.beds.filter(q=>q.ward===r.ward&&q.roomCode===r.roomCode);report.beds+=beds.length;
 const campus=b==='E01_MAIN'?'東址':b==='CHILD_HOSPITAL'?'兒童醫院':'西址';const group=report.groups[campus]??={rooms:0,beds:0,added:0};group.rooms++;group.beds+=beds.length;
 if(!beds.length)report.missing.push({b,f,ward:r.ward,code:r.roomCode});
 if(r.bedSymbolOnly){report.added.push({b,f,ward:r.ward,code:r.roomCode,id:beds[0]?.bedId});group.added++;assert.equal(beds.length,1);assert.equal(beds[0].bedLabel,'示意');assert(beds[0].isSchematic&&beds[0].symbolOnly);}
 for(const bed of beds){const q=r.bounds;if(!(bed.width>0&&bed.depth>0)||Math.abs(bed.x-q.x)+bed.width/2>q.width/2+1e-6||Math.abs(bed.z-q.z)+bed.depth/2>q.depth/2+1e-6)report.outside.push({b,f,ward:r.ward,code:r.roomCode,id:bed.bedId,width:bed.width,depth:bed.depth});}
 if(!scenes.has(r.ward))scenes.set(r.ward,WardPlan2D.scene(b,f,r.ward));const s=scenes.get(r.ward),two=s.rooms.find(p=>p.code===r.roomCode&&p.ward===r.ward);const twoBeds=s.beds.filter(p=>p.room===two);if(!two||JSON.stringify(twoBeds.map(p=>p.id).sort())!==JSON.stringify(beds.map(p=>p.bedId).sort()))report.twoMismatch.push({b,f,ward:r.ward,code:r.roomCode});
 if(r.bedSymbolOnly&&two){for(const bed of twoBeds){assert.equal(bed.label,'示意');assert(bed.x>=two.x&&bed.y>=two.y&&bed.x+bed.w<=two.x+two.w+1e-6&&bed.y+bed.h<=two.y+two.h+1e-6);}assert(WardPlanLabels.place(two,twoBeds).clear,'new symbol leaves no readable room-label area');}
 }
 for(const before of old[b][f].beds){const after=l.beds.find(q=>q.bedId===before.bedId);assert.deepEqual(after,before,`existing bed changed: ${before.bedId}`);report.unchangedExistingBeds++;}
 for(const r of l.rooms||[]){const previous=old[b][f].rooms.find(q=>q.ward===r.ward&&q.roomCode===r.roomCode);assert.deepEqual(r.bounds,previous.bounds,'room outline changed');}
}
fs.writeFileSync('scratch/all-campus-bed-symbols-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,added:report.added.length},null,2));assert.equal(report.missing.length,0);assert.equal(report.twoMismatch.length,0);assert.equal(report.outside.length,0);
