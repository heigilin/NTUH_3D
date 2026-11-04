const fs=require('fs');global.window=global;const h=fs.readFileSync('index.html','utf8'),allow=['rooms-data.js','ward-3d-layout-data.js','ward-bed-ids.js','ward-plan-layout.js','ward-door-layout.js','ward-plan-geometry.js','ward-plan-2d.js'];
for(const f of [...h.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]).filter(f=>f.startsWith('js/ward-source-')||allow.includes(f.split('/').pop())))require('../'+f);
const s=WardPlan2D.scene('W03_EAST','2F','04E2'),r=s.rooms.find(r=>r.code==='26'),b=s.beds.filter(b=>b.room===r);
console.log(JSON.stringify({room:r,beds:b.map(({room,...bed})=>bed),label:WardPlanLabels.place(r,b)},null,2));
