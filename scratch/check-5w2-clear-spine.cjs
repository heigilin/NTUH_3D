const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');global.window={};
for(const f of ['rooms-data','ward-3d-layout-data','ward-bed-ids'])require(path.join(root,'js/data',f+'.js'));
const original=window.WARD_3D_LAYOUT_DATA.W04_WEST['2F'];
const expectedRooms=original.rooms.filter(r=>r.bedCount>0).map(r=>[r.roomCode,r.bedCount]);
for(const f of ['ward-source-traces','ward-plan-layout','ward-plan-geometry','ward-plan-2d'])require(path.join(root,'js',f+'.js'));
const api=window.WardPlanGeometry;api.prepare(window.WARD_3D_LAYOUT_DATA,api.rawCorridors);
const l=window.WARD_3D_LAYOUT_DATA.W04_WEST['2F'];
assert.deepEqual(l.rooms.filter(r=>r.bedCount>0).map(r=>[r.roomCode,r.bedCount]),expectedRooms);
assert.equal(l.beds.length,36);assert.equal(l.nursingStations.length,1);
const spine=l.protectedCorridors[0],ns=l.nursingStations[0];
for(const object of [...l.rooms,...l.nursingStations])assert(!api.hit(api.rect(spine.bounds),api.rect(object.bounds)),object.roomCode||object.name);
assert.equal(l.geometryAudit.stationRoomAfter,0);assert.equal(l.geometryAudit.stationCorridorAfter,0);
assert(l.displayCorridors.some(c=>c.id===spine.id));
assert.equal(l.geometryAudit.corridorComponents,1);
assert.equal(ns.bounds.z,l.rooms.find(r=>r.roomCode==='5W2-13').bounds.z);
const s=window.WardPlan2D.scene('W04_WEST','2F','5W2');assert.equal(s.rooms.length,16);assert.equal(s.beds.length,36);
for(const r of l.rooms.filter(r=>r.bedCount>0)){
  assert.equal(r.upper,r.bounds.z<0);
  const bs=l.beds.filter(b=>b.roomCode===r.roomCode), first=bs.find(b=>b.bedId.endsWith('-01')),third=bs.find(b=>b.bedId.endsWith('-03'));
  if(third)assert(r.upper?first.z>third.z:first.z<third.z);
}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),app=fs.readFileSync(path.join(root,'js/app.js'),'utf8');
for(const text of ['btn-mode-roam','roaming-hud','virtual-joystick-wrap','js/first-person.js','js/pathfinding.js'])assert(!html.includes(text));
assert(!app.includes('new window.FirstPersonController'));assert(!app.includes("setMode('firstPerson')"));
console.log('PASS: 5W2 retains 16 patient rooms / 36 beds in 2D and 3D; desk is in the room-side bay; the entire central spine is clear and connected. Exploration controls/scripts/HUD are removed.');
