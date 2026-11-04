const fs=require('fs');global.window=global;const html=fs.readFileSync('index.html','utf8');
const allowed=new Set(['js/data/rooms-data.js','js/data/ward-3d-layout-data.js','js/data/ward-bed-ids.js','js/ward-plan-layout.js','js/ward-door-layout.js','js/ward-plan-geometry.js','js/ward-plan-2d.js']);
for(const f of [...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]).filter(f=>f.startsWith('js/ward-source-')||allowed.has(f)))require('../'+f);
const rows=[];for(const[b,fsx]of Object.entries(WARD_3D_LAYOUT_DATA))if(b==='CHILD_HOSPITAL'||/^W/.test(b))for(const[f,l]of Object.entries(fsx)){
 const items=[...l.rooms,...l.facilities,...l.nursingStations].filter(x=>x.bounds),conflicts=[],corridorConflicts=[];
 const g=WardPlanGeometry,raw=g.rawCorridors(b,f,l),name=x=>x.ward+' '+(x.roomCode||x.roomName||x.name);
 for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++)if(g.hit(g.rect(items[i].bounds),g.rect(items[j].bounds)))conflicts.push([name(items[i]),name(items[j])]);
 for(const c of raw)for(const item of items)if(g.hit(g.rect(c.bounds),g.rect(item.bounds)))corridorConflicts.push([c.name,name(item)]);
 rows.push({building:b,floor:f,rooms:l.rooms.length,facilities:l.facilities.length,stations:l.nursingStations.length,conflicts,corridorConflicts});
}fs.writeFileSync('scratch/west-child-geometry-before.json',JSON.stringify(rows,null,2));console.log(JSON.stringify(rows.filter(r=>r.conflicts.length||r.corridorConflicts.length),null,2));
