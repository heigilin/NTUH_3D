const fs=require('fs');global.window=global;const allow=['rooms-data.js','ward-3d-layout-data.js','ward-bed-ids.js','ward-plan-layout.js','ward-door-layout.js','ward-plan-geometry.js','ward-plan-2d.js'];
for(const f of [...fs.readFileSync('index.html','utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]).filter(f=>f.startsWith('js/ward-source-')||allow.includes(f.split('/').pop())))require('../'+f);
const l=WARD_3D_LAYOUT_DATA.CHILD_HOSPITAL['5F'],codes=new Set(['01','02','03','05','06']);
const rows=l.rooms.filter(r=>r.ward==='05PE'&&codes.has(r.roomCode)).map(r=>({code:r.roomCode,bounds:r.bounds,windows:r.windowSides,door:r.door,beds:l.beds.filter(b=>b.ward===r.ward&&b.roomCode===r.roomCode).map(b=>({id:b.bedId,x:b.x,z:b.z,width:b.width,depth:b.depth,headSide:b.headSide}))}));
fs.writeFileSync('scratch/05pe-01-06-bed-direction-before.json',JSON.stringify(rows,null,2));console.log(JSON.stringify(rows));
