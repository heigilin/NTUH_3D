const assert=require('node:assert/strict'),fs=require('node:fs');global.window={};
for(const name of ['rooms-data','ward-3d-layout-data','ward-bed-ids'])require('../js/data/'+name+'.js');
for(const name of ['ward-source-traces','ward-source-6f','ward-source-floor-review','ward-plan-layout','ward-door-layout','ward-plan-geometry','ward-plan-2d'])require('../js/'+name+'.js');
const report={checked:0,fullyCovered:[]};
for(const [building,floors] of Object.entries(window.WARD_3D_LAYOUT_DATA)){
 for(const [floor,layout] of Object.entries(floors))for(const facility of layout.facilities||[]){
  if(!facility.bounds)continue;
  const b=facility.bounds,area={x:b.x-b.width/2,y:b.z-b.depth/2,w:b.width,h:b.depth};
  const obstacles=(layout.rooms||[]).filter(r=>r.bounds).map(r=>({x:r.bounds.x-r.bounds.width/2,y:r.bounds.z-r.bounds.depth/2,w:r.bounds.width,h:r.bounds.depth}));
  const box=window.WardPlanLabels.spaceBox(area,obstacles);report.checked++;
  assert(box.x>=area.x-1e-6&&box.y>=area.y-1e-6&&box.x+box.w<=area.x+area.w+1e-6&&box.y+box.h<=area.y+area.h+1e-6);
  if(box.clear)assert(!obstacles.some(o=>box.x<o.x+o.w-1e-6&&box.x+box.w>o.x+1e-6&&box.y<o.y+o.h-1e-6&&box.y+box.h>o.y+1e-6));
  else report.fullyCovered.push({building,floor,name:facility.name||facility.roomName});
 }
}
fs.writeFileSync(require('node:path').join(__dirname,'space-label-containment.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({checked:report.checked,fullyCovered:report.fullyCovered.length}));
