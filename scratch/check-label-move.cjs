const fs=require('fs'),assert=require('assert/strict'),w=require('./inspect-label-move.cjs');
const snapshot=JSON.stringify(w.WARD_3D_LAYOUT_DATA),report={rooms3D:0,rooms2D:0,compactRooms:0,noClearArea:[],bedOverlap:[],examples:[]};
const hit=(a,b)=>a.x<b.x+b.w-1e-6&&a.x+a.w>b.x+1e-6&&a.y<b.y+b.h-1e-6&&a.y+a.h>b.y+1e-6;
function check(area,beds,text,key,view){const font=key.startsWith('W04_WEST')?(view==='3D'?.65:15):(view==='3D'?.92:23),p=w.WardPlanLabels.place(area,beds,text,font);report['rooms'+view]++;if(!p.clear){report.noClearArea.push({key,view});return;}assert(p.x>=area.x-1e-6&&p.y>=area.y-1e-6&&p.x+p.w<=area.x+area.w+1e-6&&p.y+p.h<=area.y+area.h+1e-6,'caption outside room '+key);assert(!beds.filter(b=>!b.captionSoft).some(b=>hit(p,b)),'caption overlaps bed '+key);}
for(const [b,floors]of Object.entries(w.WARD_3D_LAYOUT_DATA))for(const[f,l]of Object.entries(floors)){
 if(!w.WardPlan2D.hasPlan(b,f))continue;
 for(const r of l.rooms||[]){if(!r.bounds||!(r.bedCount>0))continue;const q=r.bounds,area={x:q.x-q.width/2,y:q.z-q.depth/2,w:q.width,h:q.depth},beds=(l.beds||[]).filter(v=>v.ward===r.ward&&v.roomCode===r.roomCode).map(v=>({x:v.x-v.width/2,y:v.z-v.depth/2,w:v.width,h:v.depth}));beds.push(...(r.annexBounds||[]).map(q=>({x:q.x-q.width/2,y:q.z-q.depth/2,w:q.width,h:q.depth,captionSoft:true})));check(area,beds,w.WardPlanLabels.room(r),b+'/'+f+'/'+r.ward+'/'+r.roomCode,'3D');if(r.bedCount>=3&&q.width*q.depth<18)report.compactRooms++;}
 for(const ward of ['ALL',...new Set(l.rooms.map(r=>r.ward))]){const s=w.WardPlan2D.scene(b,f,ward);for(const r of s.rooms){check(r,[...s.beds.filter(v=>v.room===r),...(r.annexes||[]).map(q=>({...q,captionSoft:true}))],r.label,b+'/'+f+'/'+ward+'/'+r.code,'2D');}}
}
assert.equal(JSON.stringify(w.WARD_3D_LAYOUT_DATA),snapshot,'Source geometry changed during label placement');
report.sourceGeometryUnchanged=true;fs.writeFileSync('scratch/room-label-move-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
const wanted=['campus-data.js','rooms-data.js','ward-3d-layout-data.js','ward-bed-ids.js','ward-proportion-review-data.js','ward-plan-layout.js','ward-door-layout.js','ward-plan-geometry.js','ward-plan-2d.js'];
const scripts=[...fs.readFileSync('index.html','utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]).filter(p=>p.startsWith('js/ward-source-')||wanted.includes(p.split('/').pop()));
fs.writeFileSync('scratch/room-label-review.html','<!doctype html><meta charset="utf-8"><title>全院病室標示核對</title><body><p id="result">檢查中</p><canvas id="label"></canvas>'+scripts.map(p=>'<script src="../'+p+'"></script>').join('')+'<script src="label-render-review.js"></script>');
