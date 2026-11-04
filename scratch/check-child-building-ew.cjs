const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const allow=['rooms-data.js','ward-3d-layout-data.js','ward-bed-ids.js','ward-plan-layout.js','ward-door-layout.js','ward-plan-geometry.js','ward-plan-2d.js'];
const files=[...fs.readFileSync('index.html','utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]).filter(f=>f.startsWith('js/ward-source-')||allow.includes(f.split('/').pop()));
function load(before){const c={window:{},console};vm.createContext(c);for(let f of files){if(before&&['js/ward-source-children.js','js/ward-plan-layout.js'].includes(f))f='scratch/before-child-building-ew/'+f.split('/').pop();vm.runInContext(fs.readFileSync(f,'utf8'),c);}return c.window;}
const now=load(false),old=load(true),rows=[];let rooms=0,beds=0;
for(const[b,floors]of Object.entries(now.WARD_3D_LAYOUT_DATA))for(const[f,l]of Object.entries(floors)){
 const prev=old.WARD_3D_LAYOUT_DATA[b][f],targets=l.rooms.filter(r=>b==='CHILD_HOSPITAL'),keys=new Set(targets.map(r=>r.ward+'/'+r.roomCode));
 assert.equal(JSON.stringify(l.beds.map(p=>p.bedId)),JSON.stringify(prev.beds.map(p=>p.bedId)));
 assert.equal(JSON.stringify(l.beds.filter(p=>!keys.has(p.ward+'/'+p.roomCode))),JSON.stringify(prev.beds.filter(p=>!keys.has(p.ward+'/'+p.roomCode))));
 const scene=now.WardPlan2D.scene(b,f,'ALL');
 for(const r of targets){const group=l.beds.filter(p=>p.ward===r.ward&&p.roomCode===r.roomCode);rooms++;beds+=group.length;assert.equal(r.bedAxis,'east-west');for(const p of group){assert.equal(p.axis,'east-west');assert.equal(p.rotation,0);assert(p.width/p.depth>=3,'ratio '+p.bedId+' '+p.width/p.depth);assert(Math.abs(p.x-r.bounds.x)+p.width/2<=r.bounds.width/2+1e-6);assert(Math.abs(p.z-r.bounds.z)+p.depth/2<=r.bounds.depth/2+1e-6);const drawn=scene.beds.find(q=>q.id===p.bedId);assert(drawn&&drawn.w/drawn.h>=3);}for(let i=0;i<group.length;i++)for(let j=i+1;j<group.length;j++){const a=group[i],b=group[j];assert(Math.abs(a.x-b.x)>=(a.width+b.width)/2-1e-6||Math.abs(a.z-b.z)>=(a.depth+b.depth)/2-1e-6,'overlap '+a.bedId+' '+b.bedId);}rows.push({floor:f,ward:r.ward,room:r.roomCode,beds:group.length});}
}
const out={rooms,beds,idsAndCountsPreserved:true,unrelatedBedsUnchanged:true,rows};fs.writeFileSync('scratch/child-building-ew-audit.json',JSON.stringify(out,null,2));console.log(JSON.stringify({...out,rows:undefined}));
