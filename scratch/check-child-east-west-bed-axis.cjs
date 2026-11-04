const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const allow=['rooms-data.js','ward-3d-layout-data.js','ward-bed-ids.js','ward-plan-layout.js','ward-door-layout.js','ward-plan-geometry.js','ward-plan-2d.js'];
const files=[...fs.readFileSync('index.html','utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]).filter(f=>f.startsWith('js/ward-source-')||allow.includes(f.split('/').pop()));
function load(before){const c={window:{},console};vm.createContext(c);for(let f of files){if(before&&f==='js/ward-source-children.js')f='scratch/before-child-east-west-bed-axis/ward-source-children.js';vm.runInContext(fs.readFileSync(f,'utf8'),c);}return c.window;}
const now=load(false),before=load(true),rows=[];let bedsChecked=0,nsRooms=0,nsBeds=0;
for(const[f,l]of Object.entries(now.WARD_3D_LAYOUT_DATA.CHILD_HOSPITAL)){
 const two=now.WardPlan2D.scene('CHILD_HOSPITAL',f,'ALL');let floorBeds=0,floorRooms=0;
 for(const r of l.rooms){const group=l.beds.filter(b=>b.ward===r.ward&&b.roomCode===r.roomCode),target=r.windowSides?.some(s=>s==='north'||s==='south');if(target){nsRooms++;floorRooms++;assert.equal(r.bedAxis,'east-west');}
 for(const bed of group){bedsChecked++;floorBeds++;assert(bed.width/bed.depth>=1.6,'vertical/ambiguous footprint '+bed.bedId);assert.equal(bed.rotation,0);assert(['east','west'].includes(bed.headSide));if(target){nsBeds++;assert.equal(bed.axis,'east-west');}const drawn=two.beds.find(b=>b.id===bed.bedId);assert(drawn&&drawn.w/drawn.h>=1.6);assert.equal(drawn.headSide,bed.headSide);}}
 rows.push({floor:f,rooms:l.rooms.length,northSouthRooms:floorRooms,beds:floorBeds,coverage:l.sourceCoverage?.status});
}
for(const[b,floors]of Object.entries(now.WARD_3D_LAYOUT_DATA))for(const[f,l]of Object.entries(floors)){const old=before.WARD_3D_LAYOUT_DATA[b][f],strip=bs=>JSON.stringify(bs.map(({axis,...bed})=>bed));assert.equal(strip(l.beds),strip(old.beds),'bed IDs/count/positions changed '+b+'/'+f);}
const out={bedsChecked,northSouthRooms:nsRooms,northSouthBeds:nsBeds,idsCountsAndPositionsUnchanged:true,rows};fs.writeFileSync('scratch/child-east-west-bed-axis-audit.json',JSON.stringify(out,null,2));console.log(JSON.stringify({bedsChecked,northSouthRooms:nsRooms,northSouthBeds:nsBeds,idsCountsAndPositionsUnchanged:true}));
