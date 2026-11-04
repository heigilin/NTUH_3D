const fs=require('fs'),vm=require('vm');const c={window:{},console};vm.createContext(c);
const wanted=['campus-data.js','rooms-data.js','ward-3d-layout-data.js','ward-bed-ids.js','ward-proportion-review-data.js','ward-plan-layout.js','ward-door-layout.js','ward-plan-geometry.js','ward-plan-2d.js'];
for(const m of fs.readFileSync('index.html','utf8').matchAll(/<script src="([^"]+)"/g)){const p=m[1].split('?')[0];if(p.startsWith('js/ward-source-')||wanted.includes(p.split('/').pop()))vm.runInContext(fs.readFileSync(p,'utf8'),c,{filename:p});}
const w=c.window;w.WardPlanGeometry.prepare(w.WARD_3D_LAYOUT_DATA,w.WardPlanGeometry.rawCorridors);
module.exports=w;
if(require.main===module){const l=w.WARD_3D_LAYOUT_DATA.E01_MAIN['7F'];for(const r of l.rooms.filter(r=>r.ward==='7C'&&['01','02','20','21'].includes(r.roomCode))){const b=r.bounds,beds=l.beds.filter(b=>b.ward===r.ward&&b.roomCode===r.roomCode).map(b=>({x:b.x-b.width/2,y:b.z-b.depth/2,w:b.width,h:b.depth})),area={x:b.x-b.width/2,y:b.z-b.depth/2,w:b.width,h:b.depth};console.log(JSON.stringify({room:r.roomCode,area,beds,label:w.WardPlanLabels.place(area,beds,w.WardPlanLabels.room(r))}));}}

