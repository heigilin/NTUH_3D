const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const allow=['rooms-data.js','ward-3d-layout-data.js','ward-bed-ids.js','ward-plan-layout.js','ward-door-layout.js','ward-plan-geometry.js','ward-plan-2d.js'];
const modules=[...fs.readFileSync('index.html','utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]).filter(f=>f.startsWith('js/ward-source-')||allow.includes(f.split('/').pop()));
function load(old){const c={window:{},console};vm.createContext(c);for(let f of modules){const name=f.split('/').pop();if(old&&name==='ward-source-west.js')f='scratch/before-05e3-wall-check/'+name;vm.runInContext(fs.readFileSync(f,'utf8'),c);}return c.window;}
const now=load(false),old=load(true),g=now.WardPlanGeometry;g.prepare(now.WARD_3D_LAYOUT_DATA,g.rawCorridors);
const l=now.WARD_3D_LAYOUT_DATA.W04_EAST['3F'],rooms=l.rooms.filter(r=>r.ward==='05E3'),beds=l.beds.filter(r=>r.ward==='05E3');
assert.equal(rooms.length,16);assert.equal(rooms.filter(r=>r.roomCode.endsWith('北')).length,7);assert.equal(rooms.filter(r=>r.roomCode.endsWith('南')).length,9);assert.equal(beds.length,25);
const clinical=Object.values(now.WARD_BED_IDS['05E3']).flat().sort();assert.equal(clinical.length,48);assert.equal(JSON.stringify(l.sourceUnplacedBeds.filter(b=>b.ward==='05E3').map(b=>b.bedId).sort()),JSON.stringify(clinical));assert(beds.every(b=>b.isSchematic&&b.bedId.startsWith('SCHEMATIC-')));
for(const r of rooms){const group=beds.filter(b=>b.roomCode===r.roomCode),q=r.bounds;assert.equal(group.length,r.roomCode.endsWith('北')?1:2);assert(/^北[1-7]$|^南[1-9]$/.test(now.WardPlanLabels.room(r)));
for(const b of group){assert(b.width>b.depth);assert.equal(b.headSide,'east');assert(Math.abs(b.x-q.x)+b.width/2<=q.width/2+1e-6);assert(Math.abs(b.z-q.z)+b.depth/2<=q.depth/2-.449);}
if(group.length===2){assert(group[0].z>group[1].z,'01 should be nearest south corridor');}}
const items=[...rooms,...l.facilities,...l.nursingStations];for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++)assert(!g.hit(g.rect(items[i].bounds),g.rect(items[j].bounds)),'space overlap');
const corridors=g.rawCorridors('W04_EAST','3F',l);assert.equal(g.components(corridors),1);for(const c of corridors)for(const item of items)assert(!g.hit(g.rect(c.bounds),g.rect(item.bounds)),'raw corridor crosses space');
const scene=now.WardPlan2D.scene('W04_EAST','3F','05E3');assert.equal(scene.beds.length,25);assert.equal(scene.rooms.length,16);assert(scene.spaces.some(p=>p.kind==='courtyard'&&p.label==='中庭'));
for(const[b,floors]of Object.entries(now.WARD_3D_LAYOUT_DATA))for(const[f,layout]of Object.entries(floors)){
const previous=old.WARD_3D_LAYOUT_DATA[b][f];assert.equal(JSON.stringify(layout.rooms.filter(r=>r.ward!=='05E3').map(({door,...r})=>r)),JSON.stringify(previous.rooms.filter(r=>r.ward!=='05E3').map(({door,...r})=>r)),'unrelated room changed');assert.equal(JSON.stringify(layout.beds.filter(r=>r.ward!=='05E3')),JSON.stringify(previous.beds.filter(r=>r.ward!=='05E3')),'unrelated beds changed');}
const out={rooms:16,north:7,south:9,bedSymbols:25,formalBedIdsPreserved:48,rawCorridorComponents:1,spaceOverlaps:0,corridorCrossings:0,unrelatedRoomsAndBedsUnchanged:true};fs.writeFileSync('scratch/05e3-source-wall-audit.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out));
