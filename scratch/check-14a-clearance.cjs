const fs=require('fs'),vm=require('vm'),assert=require('assert');const p='D:/Users/006340/Downloads/資訊開發/平面圖/';const ctx={window:{}};vm.createContext(ctx);for(const f of ['js/data/ward-3d-layout-data.js','js/data/ward-bed-ids.js','js/ward-source-traces.js','js/ward-plan-layout.js','js/ward-plan-geometry.js','js/ward-plan-2d.js'])vm.runInContext(fs.readFileSync(p+f,'utf8'),ctx);
let total=0,minHead=Infinity,minSide=Infinity,overlap=0;
for(const [b,floors] of Object.entries(ctx.window.WARD_3D_LAYOUT_DATA))for(const [f,l]of Object.entries(floors))for(const r of l.rooms.filter(r=>r.bedCount>0)){
 const beds=l.beds.filter(b=>b.ward===r.ward&&b.roomCode===r.roomCode), q=r.bounds;
 for(const bed of beds){const xGap=q.width/2-Math.abs(bed.x-q.x)-bed.width/2,zGap=q.depth/2-Math.abs(bed.z-q.z)-bed.depth/2;
 assert(xGap>=.20-1e-6&&zGap>=.45-1e-6,`${b}/${f}/${r.ward}/${r.roomCode} wall gap ${xGap} ${zGap}`);minHead=Math.min(minHead,xGap);minSide=Math.min(minSide,zGap);total++;}
 for(let i=0;i<beds.length;i++)for(let j=i+1;j<beds.length;j++)assert(!(Math.abs(beds[i].x-beds[j].x)<1.8-1e-6&&Math.abs(beds[i].z-beds[j].z)<.9-1e-6),`${b}/${f}/${r.ward}/${r.roomCode} bed overlap`);
}
const l=ctx.window.WARD_3D_LAYOUT_DATA.E01_MAIN['14F'];const spaces=l.facilities.filter(f=>f.ward==='14A'),dirty=spaces.find(f=>f.name==='污物室'),equip=spaces.find(f=>f.name==='設備器材室'),q=ctx.window.WardPlanGeometry.rect;
assert(Math.abs(q(dirty.bounds).l-q(equip.bounds).l)<1e-6);assert(Math.abs(q(dirty.bounds).b-q(equip.bounds).t)<1e-6);
assert(!ctx.window.WardPlanGeometry.hit(q(dirty.bounds),q(l.rooms.find(r=>r.ward==='14A'&&r.roomCode==='01').bounds)));
const scene=ctx.window.WardPlan2D.scene('E01_MAIN','14F','14A');for(const bed of scene.beds){const r=bed.room;const gap=bed.headSide==='west'?bed.x-r.x:r.x+r.w-bed.x-bed.w;assert(Math.abs(gap-.45*24)<1e-5);}
console.log(JSON.stringify({bedsChecked:total,minHeadGap:minHead,minSideGap:minSide,ward14A2DBeds:scene.beds.length,dirtyUtility:'Aligned with equipment room left edge; directly on corridor side',result:'PASS'}));
