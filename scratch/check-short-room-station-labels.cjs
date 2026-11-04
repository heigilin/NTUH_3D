const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const allowed=['rooms-data.js','ward-3d-layout-data.js','ward-bed-ids.js','ward-plan-layout.js','ward-door-layout.js','ward-plan-geometry.js','ward-plan-2d.js'];
const modules=[...fs.readFileSync('index.html','utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]).filter(f=>f.startsWith('js/ward-source-')||allowed.includes(f.split('/').pop()));
function load(before){const c={window:{},console};vm.createContext(c);for(let f of modules){const name=f.split('/').pop();if(before&&['ward-plan-layout.js','ward-plan-2d.js','ward-source-west.js'].includes(name))f='scratch/before-short-room-labels/'+name;vm.runInContext(fs.readFileSync(f,'utf8'),c);}return c.window;}
const now=load(false),old=load(true),g=now.WardPlanGeometry;g.prepare(now.WARD_3D_LAYOUT_DATA,g.rawCorridors);
assert.match(now.WardPlanLabels.station({ward:'04E2'}),/^04E2(?: 護理站)?$/);assert.match(now.WardPlanLabels.station({ward:'5W2'}),/^05W2(?: 護理站)?$/);assert.equal(now.WardPlanLabels.room({ward:'04E2',roomCode:'26'}),'26');assert.equal(now.WardPlanLabels.room({ward:'05PE',roomCode:'05PE-01',bedCount:1}),'01');
let rooms=0,stations=0,shortLabels=0;
for(const[b,floors]of Object.entries(now.WARD_3D_LAYOUT_DATA))for(const[f,l]of Object.entries(floors)){
 const previous=old.WARD_3D_LAYOUT_DATA[b][f];assert.equal(JSON.stringify(l.beds),JSON.stringify(previous.beds),'bed data changed '+b+'/'+f);
 for(const r of l.rooms){const p=previous.rooms.find(p=>p.ward===r.ward&&p.roomCode===r.roomCode);assert.equal(JSON.stringify(r.bounds),JSON.stringify(p.bounds),'room moved '+b+'/'+f);rooms++;}
 const s=now.WardPlan2D.scene(b,f,'ALL');
 for(const r of s.rooms){const label=r.label;if(/^\d+[A-Za-z]?$/.test(r.code)){assert.equal(label,r.code);shortLabels++;}const beds=s.beds.filter(bed=>bed.room===r),box=now.WardPlanLabels.place(r,beds);if(box.clear){assert(box.x>=r.x-1e-6&&box.y>=r.y-1e-6&&box.x+box.w<=r.x+r.w+1e-6&&box.y+box.h<=r.y+r.h+1e-6);assert(!beds.some(b=>box.x<b.x+b.w-1e-6&&box.x+box.w>b.x+1e-6&&box.y<b.y+b.h-1e-6&&box.y+box.h>b.y+1e-6));}}
 for(const station of s.spaces.filter(p=>p.kind==='nurse')){assert(l.nursingStations.some(n=>now.WardPlanLabels.station(n)===station.label));stations++;}
}
const l=now.WARD_3D_LAYOUT_DATA.W03_EAST['2F'],room=l.rooms.find(r=>r.roomCode==='26'),front=l.facilities.find(r=>r.name==='前室／廁所');assert(front);assert(front.bounds.z+front.bounds.depth/2<room.bounds.z-room.bounds.depth/2);assert(front.bounds.x>=room.bounds.x-room.bounds.width/2&&front.bounds.x<=room.bounds.x+room.bounds.width/2);assert.equal(room.door.side,'north');assert.equal(room.door.validation,'clear-access');
fs.writeFileSync('scratch/short-room-station-labels-audit.json',JSON.stringify({rooms,shortLabels,stationLabels2D:stations,bedDataUnchanged:true,roomPositionsUnchanged:true,room26Door:room.door},null,2));console.log(JSON.stringify({rooms,shortLabels,stationLabels2D:stations,room26Door:room.door.validation,bedDataUnchanged:true}));
