const fs=require('fs'),assert=require('node:assert/strict');global.window=global;
const html=fs.readFileSync('index.html','utf8');
const allowed=new Set(['js/data/rooms-data.js','js/data/ward-3d-layout-data.js','js/data/ward-bed-ids.js','js/ward-plan-layout.js','js/ward-door-layout.js','js/ward-plan-geometry.js','js/ward-plan-2d.js']);
const modules=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]).filter(f=>f.startsWith('js/ward-source-')||allowed.has(f)).map(f=>f.slice(3,-3));
for(const f of modules)require('../js/'+f+'.js');

const g=WardPlanGeometry,data=WARD_3D_LAYOUT_DATA;
const report=g.prepare(data,g.rawCorridors),conflicts=[],bedIssues=[],stationIssues=[];
for(const [building,floors]of Object.entries(data))for(const[floor,l]of Object.entries(floors)){
 const items=[...(l.rooms||[]),...(l.facilities||[]),...(l.nursingStations||[])].filter(x=>x.bounds);
 for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++)if((items[i].sourceTrace||items[j].sourceTrace)&&g.hit(g.rect(items[i].bounds),g.rect(items[j].bounds)))conflicts.push({building,floor,a:items[i].ward+' '+(items[i].roomCode||items[i].name),b:items[j].ward+' '+(items[j].roomCode||items[j].name)});
 const row=report.find(x=>x.building===building&&x.floor===floor);
 if(row?.stationRawCorridorAfter)stationIssues.push({building,floor,raw:row.stationRawCorridorAfter,names:row.sourceStationCorridorConflicts});
 for(const ward of new Set((l.rooms||[]).filter(r=>r.sourceTrace).map(r=>r.ward))){
  const beds=l.beds.filter(b=>b.ward===ward),scene=WardPlan2D.scene(building,floor,ward);
  if(new Set(beds.map(b=>b.bedId)).size!==beds.length)bedIssues.push({building,floor,ward,kind:'duplicate-bed-id'});
  if(JSON.stringify(scene.beds.map(b=>b.id).sort())!==JSON.stringify(beds.map(b=>b.bedId).sort()))bedIssues.push({building,floor,ward,kind:'2d3d-bed-mismatch'});
  for(const r of l.rooms.filter(r=>r.ward===ward&&r.sourceTrace)){
   const rb=g.rect(r.bounds),group=beds.filter(b=>b.roomCode===r.roomCode);
   for(const b of group){const q={l:b.x-b.width/2,r:b.x+b.width/2,t:b.z-b.depth/2,b:b.z+b.depth/2};
    if(!(b.width>0&&b.depth>0)||q.l<rb.l-1e-6||q.r>rb.r+1e-6||q.t<rb.t-1e-6||q.b>rb.b+1e-6)bedIssues.push({building,floor,ward,room:r.roomCode,bed:b.bedId,kind:'bed-bounds'});
   }
   for(let i=0;i<group.length;i++)for(let j=i+1;j<group.length;j++)if(Math.abs(group[i].x-group[j].x)<(group[i].width+group[j].width)/2-1e-6&&Math.abs(group[i].z-group[j].z)<(group[i].depth+group[j].depth)/2-1e-6)bedIssues.push({building,floor,ward,room:r.roomCode,kind:'bed-overlap'});
  }
 }
}
const output={conflicts,bedIssues,stationIssues,floors:report.map(r=>({building:r.building,floor:r.floor,rawStationCorridorAfter:r.stationRawCorridorAfter,sourceStations:(data[r.building][r.floor].nursingStations||[]).filter(n=>n.sourceTrace).length,sourceWards:Object.keys(data[r.building][r.floor].sourceTraceWards||{})}))};
const effective=new Map(WardSourceTraces.plans.map(p=>[[p.building,p.floor,p.ward].join('/'),p]));
output.provenance=[];output.idIssues=[];output.rawCorridorIssues=[];output.coverage=[];
for(const [building,floors]of Object.entries(data))for(const[floor,l]of Object.entries(floors)){
 output.coverage.push({building,floor,...l.sourceCoverage});
 const raw=g.rawCorridors(building,floor,l);
 for(const item of [...(l.rooms||[]),...(l.facilities||[]),...(l.nursingStations||[])].filter(x=>x.sourceTrace&&x.bounds&&!x.isNursingArea))
  for(const c of raw)if(c.bounds&&g.hit(g.rect(item.bounds),g.rect(c.bounds)))output.rawCorridorIssues.push({building,floor,item:item.roomCode||item.name,corridor:c.name});
}
for(const p of effective.values()){
 const l=data[p.building]?.[p.floor];if(!l)continue;
 const source=new Set(Object.values(WARD_BED_IDS[p.bedWard||p.ward]||{}).flat());
 const placed=new Set(l.beds.filter(b=>b.ward===p.ward&&!b.isSchematic).map(b=>b.bedId));
 const unplaced=new Set((l.sourceUnplacedBeds||[]).filter(b=>b.ward===p.ward).map(b=>b.bedId));
 for(const id of source)if(!placed.has(id)&&!unplaced.has(id)||placed.has(id)&&unplaced.has(id))output.idIssues.push({ward:p.ward,id});
 output.provenance.push({building:p.building,floor:p.floor,ward:p.ward,source:p.source,sourceBeds:source.size,placed:[...source].filter(id=>placed.has(id)).length,unplaced:[...source].filter(id=>unplaced.has(id)).length,schematic:l.beds.filter(b=>b.ward===p.ward&&b.isSchematic).length,rooms:l.rooms.filter(r=>r.ward===p.ward).length});
}
assert.equal(data.E01_MAIN['6F'].beds.filter(b=>b.ward==='6C').length,36);
assert.equal(data.E01_MAIN['6F'].beds.filter(b=>b.ward==='6D').length,37);
fs.writeFileSync('scratch/all-campus-source-check.json',JSON.stringify(output,null,2));
console.log(JSON.stringify({conflicts,bedIssues,stationIssues,idIssues:output.idIssues,rawCorridorIssues:output.rawCorridorIssues},null,2));
for(const key of ['conflicts','bedIssues','stationIssues','idIssues','rawCorridorIssues'])assert.equal(output[key].length,0,key);

