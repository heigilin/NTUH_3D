const fs=require('fs'),vm=require('vm'),assert=require('assert');
const paths=[...fs.readFileSync('index.html','utf8').matchAll(/<script[^>]+src="(js\/[^"?]+)(?:\?[^" ]*)?"/g)].map(m=>m[1]).filter(p=>p.startsWith('js/data/')||/^js\/ward-/.test(p));
function load(before){const c={location:{search:''},URLSearchParams};c.window=c;vm.createContext(c);for(const f of paths){if(before&&/ward-source-proportions|ward-proportion-review-data/.test(f))continue;vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});}c.WardPlanGeometry.prepare(c.WARD_3D_LAYOUT_DATA,c.WardPlanGeometry.rawCorridors);return c;}
const before=load(true),after=load(false),hit=(a,b)=>Math.min(a.x+a.width/2,b.x+b.width/2)-Math.max(a.x-a.width/2,b.x-b.width/2)>1e-5&&Math.min(a.z+a.depth/2,b.z+b.depth/2)-Math.max(a.z-a.depth/2,b.z-b.depth/2)>1e-5;
const rows=[],issues=[];let beds=0;
for(const e of after.WARD_PROPORTION_REVIEW){const l=after.WARD_3D_LAYOUT_DATA[e.building][e.floor],old=before.WARD_3D_LAYOUT_DATA[e.building][e.floor],objects=[];
 for(const kind of ['rooms','facilities','nursingStations'])for(const q of l[kind].filter(q=>q.ward===e.ward)){objects.push({kind,name:q.roomCode||q.name,b:q.bounds});for(const[p,b]of(q.parts||[]).entries())objects.push({kind,name:q.name+' part '+p,b});}
 const conflicts=[];for(let i=0;i<objects.length;i++)for(let j=i+1;j<objects.length;j++)if(hit(objects[i].b,objects[j].b))conflicts.push([objects[i].name,objects[j].name]);
 const crossings=[];for(const c of(l.sourceTraceCorridors||[]).filter(c=>c.ward===e.ward))for(const q of objects)if(hit(c.bounds,q.b))crossings.push([c.name,q.name]);
 const ids=l.beds.filter(b=>b.ward===e.ward&&!b.bedId.startsWith('SCHEMATIC')).map(b=>b.bedId).sort(),oldIds=old.beds.filter(b=>b.ward===e.ward&&!b.bedId.startsWith('SCHEMATIC')).map(b=>b.bedId).sort();assert.equal(JSON.stringify(ids),JSON.stringify(oldIds),e.ward+' actual IDs changed');
 const pendingIds=x=>(x.sourceUnplacedBeds||[]).filter(b=>b.ward===e.ward).map(b=>b.bedId).sort();assert.equal(JSON.stringify(pendingIds(l)),JSON.stringify(pendingIds(old)),e.ward+' pending IDs changed');
 const bedErrors=[];for(const r of l.rooms.filter(r=>r.ward===e.ward))for(const b of l.beds.filter(b=>b.ward===e.ward&&b.roomCode===r.roomCode)){beds++;if(Math.abs(b.x-r.bounds.x)+b.width/2>r.bounds.width/2+1e-5||Math.abs(b.z-r.bounds.z)+b.depth/2>r.bounds.depth/2+1e-5)bedErrors.push(b.bedId+' outside room');for(const q of r.annexBounds||[])if(hit(b,q))bedErrors.push(b.bedId+' in front/bath zone');}
 const scene=after.WardPlan2D.scene(e.building,e.floor,e.ward);for(const r of scene.rooms)for(const q of r.annexes||[])assert(q.x>=r.x-1e-5&&q.y>=r.y-1e-5&&q.x+q.w<=r.x+r.w+1e-5&&q.y+q.h<=r.y+r.h+1e-5,e.ward+' 2D annex overflow');
 const row={...e,rooms:objects.filter(q=>q.kind==='rooms').length,roomEnvelopes:Object.keys(e.roomRects).length,conflicts,crossings,bedErrors};rows.push(row);if(conflicts.length||crossings.length||bedErrors.length)issues.push({ward:e.ward,floor:e.floor,conflicts,crossings,bedErrors});}
function globalPairs(c){const pairs=new Map;for(const[b,fs]of Object.entries(c.WARD_3D_LAYOUT_DATA))for(const[f,l]of Object.entries(fs)){if(b==='E01_MAIN'&&['1F','2F','10F'].includes(f))continue;
 const list=[];for(const kind of ['rooms','facilities','nursingStations'])for(const q of l[kind]||[]){const name=kind+':'+q.ward+':'+(q.roomCode||q.name);list.push({name,b:q.bounds});for(const[i,bounds]of(q.parts||[]).entries())list.push({name:name+':part'+i,b:bounds});}
 for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++)if(hit(list[i].b,list[j].b))pairs.set(b+'/'+f+'/'+[list[i].name,list[j].name].sort().join('|'),[b,f,list[i].name,list[j].name]);
 for(const r of list)for(const co of l.sourceTraceCorridors||[])if(hit(r.b,co.bounds))pairs.set(b+'/'+f+'/'+r.name+'|'+co.id,[b,f,r.name,co.name]);
 }return pairs;}
const oldPairs=globalPairs(before),newPairs=globalPairs(after),newGlobalConflicts=[...newPairs].filter(([key])=>!oldPairs.has(key)).map(([,value])=>value);
fs.writeFileSync('scratch/proportion-check-root/audit.json',JSON.stringify({rows,issues,beds,newGlobalConflicts,globalConflicts:[...newPairs.values()]},null,2));console.log(JSON.stringify({wards:rows.length,beds,issues,newGlobalConflicts},null,2));

assert.equal(issues.length,0,"source proportion issues");assert.equal(newPairs.size,0,"global source-space/corridor conflicts");
