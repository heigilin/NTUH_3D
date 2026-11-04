const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const wanted=['campus-data.js','rooms-data.js','ward-3d-layout-data.js','ward-bed-ids.js','ward-proportion-review-data.js','ward-plan-layout.js','ward-door-layout.js','ward-plan-geometry.js','ward-plan-2d.js'];
const files=[...fs.readFileSync('index.html','utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]).filter(p=>p.startsWith('js/ward-source-')||wanted.includes(p.split('/').pop()));
function load(old){const c={window:{},console};vm.createContext(c);for(const p of files){const name=p.split('/').pop(),file=old&&['ward-plan-layout.js','ward-plan-2d.js'].includes(name)?'scratch/before-bed-label-balance/'+name:p;vm.runInContext(fs.readFileSync(file,'utf8'),c);}const w=c.window;w.WardPlanGeometry.prepare(w.WARD_3D_LAYOUT_DATA,w.WardPlanGeometry.rawCorridors);return w;}
const before=load(true),after=load(false),report={beds:0,movedBeds:0,changedRooms:0,targets:[],sourceBoundsUnchanged:true,bedSizesAndIdsUnchanged:true};
const rect=b=>({x:b.x-b.width/2,y:b.z-b.depth/2,w:b.width,h:b.depth});
const hit=(a,b)=>a.x<b.x+b.w-1e-6&&a.x+a.w>b.x+1e-6&&a.y<b.y+b.h-1e-6&&a.y+a.h>b.y+1e-6;
for(const [building,floors]of Object.entries(after.WARD_3D_LAYOUT_DATA))for(const[floor,l]of Object.entries(floors)){
 const previous=before.WARD_3D_LAYOUT_DATA[building][floor],oldBeds=new Map(previous.beds.map(b=>[b.bedId,b]));assert.equal(l.beds.length,previous.beds.length);
 for(const r of l.rooms){const old=previous.rooms.find(q=>q.ward===r.ward&&q.roomCode===r.roomCode);for(const key of ['bounds','bedBounds','annexBounds'])assert.equal(JSON.stringify(r[key]),JSON.stringify(old[key]),'Source zone changed '+r.ward+'/'+r.roomCode);}
 const changed=new Set();
 for(const b of l.beds){const old=oldBeds.get(b.bedId);assert(old);report.beds++;for(const key of ['width','depth','bedId','headSide','axis'])assert.equal(b[key],old[key],key+' changed '+b.bedId);
  if(Math.abs(b.x-old.x)+Math.abs(b.z-old.z)<1e-7)continue;report.movedBeds++;const r=l.rooms.find(r=>r.ward===b.ward&&r.roomCode===b.roomCode);assert.equal(r.bedCount,3,'Non-triple bedroom moved');changed.add(r.ward+'/'+r.roomCode);
  const z=r.bedBounds||r.bounds;assert(b.x-b.width/2>=z.x-z.width/2-1e-6&&b.x+b.width/2<=z.x+z.width/2+1e-6&&b.z-b.depth/2>=z.z-z.depth/2-1e-6&&b.z+b.depth/2<=z.z+z.depth/2+1e-6,'Bed escaped source zone '+b.bedId);
  assert(!l.beds.some(q=>q!==b&&q.ward===b.ward&&q.roomCode===b.roomCode&&hit(rect(b),rect(q))),'Beds overlap '+b.bedId);
 }
 report.changedRooms+=changed.size;
 if(building==='E01_MAIN'&&floor==='12F')for(const r of l.rooms.filter(r=>r.ward==='12D'&&['20','21'].includes(r.roomCode))){const gap=beds=>{const bb=beds.filter(b=>b.ward===r.ward&&b.roomCode===r.roomCode).sort((a,b)=>a.z-b.z);return bb[1].z-bb[0].z-(bb[0].depth+bb[1].depth)/2;};const oldGap=gap(previous.beds),newGap=gap(l.beds);assert(newGap>oldGap);report.targets.push({ward:r.ward,room:r.roomCode,oldGap,newGap,labelSize:after.WardPlanLabels.patientFontSize(r)});}
}
fs.writeFileSync('scratch/bed-label-balance-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
