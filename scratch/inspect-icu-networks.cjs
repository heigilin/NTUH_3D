const fs=require('fs'),vm=require('vm'),assert=require('assert');global.window=global;
for(const f of ['js/data/rooms-data.js','js/data/ward-3d-layout-data.js','js/data/ward-bed-ids.js','js/ward-source-traces.js','js/ward-source-6f.js','js/ward-source-floor-review.js','js/ward-source-icu-3-4.js','js/ward-plan-layout.js','js/ward-door-layout.js','js/ward-plan-geometry.js','js/ward-plan-2d.js'])vm.runInThisContext(fs.readFileSync(f,'utf8'));
WardPlanGeometry.prepare(WARD_3D_LAYOUT_DATA,WardPlanGeometry.rawCorridors);

for(const f of ['3F','4F']){const l=WARD_3D_LAYOUT_DATA.E01_MAIN[f],a=l.displayCorridors.concat(l.facilities.filter(r=>r.type==='anteroom')),remaining=new Set(a.map((_,i)=>i)),groups=[];
while(remaining.size){const q=[remaining.values().next().value];remaining.delete(q[0]);const found=[];while(q.length){const i=q.pop();found.push(a[i].name);let r=WardPlanGeometry.rect(a[i].bounds);for(const j of remaining){let s=WardPlanGeometry.rect(a[j].bounds),x=Math.min(r.r,s.r)-Math.max(r.l,s.l),z=Math.min(r.b,s.b)-Math.max(r.t,s.t);if(x>=-1e-6&&z>=-1e-6&&(x>1e-6||z>1e-6)){remaining.delete(j);q.push(j);}}}groups.push(found);}console.log(f,JSON.stringify(groups));}
