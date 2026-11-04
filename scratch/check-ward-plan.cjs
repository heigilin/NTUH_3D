const assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');global.window={};
for(const f of ['rooms-data','ward-3d-layout-data','ward-bed-ids'])require(path.join(root,'js/data',f+'.js'));
require(path.join(root,'js/ward-plan-layout.js'));require(path.join(root,'js/ward-plan-2d.js'));
const expected=['01','02','03','05','06','07','08','09','10','11','12','13','15','16','17','18','19','20','21','22'];
const layout=window.WARD_3D_LAYOUT_DATA.E01_MAIN['11F'];
const scene=window.WardPlan2D.scene('E01_MAIN','11F','11C');
const rooms=layout.rooms.filter(r=>r.ward==='11C'),beds=layout.beds.filter(b=>b.ward==='11C');
assert.deepEqual(rooms.map(r=>r.roomCode).sort(),expected);
assert.deepEqual(scene.rooms.map(r=>r.code).sort(),expected);
assert.equal(beds.length,37);assert.equal(scene.beds.length,37);
assert.deepEqual(scene.beds.map(b=>b.id).sort(),beds.map(b=>b.bedId).sort());
let allBeds=0;
for(const floors of Object.values(window.WARD_3D_LAYOUT_DATA))for(const l of Object.values(floors)){
  assert.equal(new Set(l.beds.map(b=>b.bedId)).size,l.beds.length);
  for(const b of l.beds){
    const r=l.rooms.find(r=>r.ward===b.ward&&r.roomCode===b.roomCode);assert(r);
    assert(Math.abs(b.x-r.bounds.x)+.9<=r.bounds.width/2+.001,b.bedId+' x');
    assert(Math.abs(b.z-r.bounds.z)+.45<=r.bounds.depth/2+.001,b.bedId+' z');
    if(!b.isSchematic)assert(window.WARD_BED_IDS[r.sourceWard||r.ward][r.roomCode].includes(b.bedId));
    allBeds++;
  }
}
for(const r of scene.rooms){
  const group=scene.beds.filter(b=>b.room===r);assert(group.length>0);
  assert.equal(new Set(group.map(b=>b.x+b.w)).size,1);
  const first=group.find(b=>b.label==='01'),third=group.find(b=>b.label==='03');
  if(third)assert(r.upper?first.y>third.y:first.y<third.y);
  for(const b of group)assert(b.y>=r.y&&b.y+b.h<=r.y+r.h);
}
for(const r of rooms){
  const group=beds.filter(b=>b.roomCode===r.roomCode);assert.equal(new Set(group.map(b=>b.x)).size,1);
  const first=group.find(b=>b.displayLabel.endsWith('-01')),third=group.find(b=>b.displayLabel.endsWith('-03'));
  if(third)assert(r.upper?first.z>third.z:first.z<third.z);
}
console.log(`PASS: 11C has the same 20 rooms and 37 beds in 2D/3D. All ${allBeds} layout beds are inside their rooms; 01/03 order and east-wall alignment pass.`);
