const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function load(review){const c={window:{},console};vm.createContext(c);for(const p of ['js/data/rooms-data.js','js/data/ward-3d-layout-data.js','js/data/ward-bed-ids.js','js/ward-source-traces.js','js/ward-source-6f.js',review,'js/ward-plan-layout.js','js/ward-door-layout.js','js/ward-plan-geometry.js','js/ward-plan-2d.js'])vm.runInContext(fs.readFileSync(p,'utf8'),c,{filename:p});return c.window;}
const old=load('scratch/before-4f-north-proportions/ward-source-floor-review.js'),now=load('js/ward-source-floor-review.js');
const l=now.WARD_3D_LAYOUT_DATA.E01_MAIN['4F'],before=old.WARD_3D_LAYOUT_DATA.E01_MAIN['4F'];
const wards=['04A1','04A2','04B1','04B2'],rooms=l.rooms.filter(r=>wards.includes(r.ward));
assert.equal(rooms.length,40);
const hit=(a,b)=>Math.min(a.x+a.width/2,b.x+b.width/2)-Math.max(a.x-a.width/2,b.x-b.width/2)>1e-5&&Math.min(a.z+a.depth/2,b.z+b.depth/2)-Math.max(a.z-a.depth/2,b.z-b.depth/2)>1e-5;
for(const r of rooms){assert(Math.abs(r.bounds.width/r.bounds.depth-r.sourceRect.w/r.sourceRect.h)<1e-9);for(const q of rooms)if(q!==r)assert(!hit(r.bounds,q.bounds),r.ward+r.roomCode+' overlaps '+q.ward+q.roomCode);for(const f of l.facilities.filter(f=>wards.includes(f.ward)))assert(!hit(r.bounds,f.bounds),r.ward+r.roomCode+' overlaps '+f.name);}
for(const w of wards){assert.equal(rooms.filter(r=>r.ward===w).length,10);assert.equal(JSON.stringify(l.beds.filter(b=>b.ward===w).map(b=>b.bedId).sort()),JSON.stringify(before.beds.filter(b=>b.ward===w).map(b=>b.bedId).sort()));assert(!l.nursingStations.some(s=>s.ward===w));}
assert.deepEqual(JSON.stringify(l.rooms.filter(r=>!wards.includes(r.ward))),JSON.stringify(before.rooms.filter(r=>!wards.includes(r.ward))));
for(const bed of l.beds.filter(b=>wards.includes(b.ward))){const r=rooms.find(r=>r.ward===bed.ward&&r.roomCode===bed.roomCode),q=r.bounds;assert(Math.abs(bed.x-q.x)+bed.width/2<=q.width/2+1e-6);assert(Math.abs(bed.z-q.z)+bed.depth/2<=q.depth/2+1e-6);}
const changes=rooms.map(r=>{const o=before.rooms.find(q=>q.ward===r.ward&&q.roomCode===r.roomCode);return {ward:r.ward,room:r.roomCode,old:o.sourceRect,corrected:r.sourceRect};});
fs.writeFileSync('scratch/4f-north-proportions-audit.json',JSON.stringify({rooms:rooms.length,beds:l.beds.filter(b=>wards.includes(b.ward)).length,changes},null,2));
console.log('PASS: 40 source-proportional rooms, stable bed IDs, no room/room or room/service overlaps; other 4F rooms unchanged.');
