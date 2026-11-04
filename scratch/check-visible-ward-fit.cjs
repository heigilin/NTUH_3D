const fs=require('fs'),vm=require('vm'),assert=require('assert');
const paths=[...fs.readFileSync('index.html','utf8').matchAll(/src="(js\/[^"?]+)(?:\?[^" ]*)?"/g)].map(m=>m[1]).filter(p=>p.startsWith('js/data/')||p.startsWith('js/ward-'));
function load(legacy){
 const c={console,URLSearchParams,location:{search:''}};c.window=c;vm.createContext(c);
 for(const p of paths){let s=fs.readFileSync(p,'utf8');if(legacy&&p==='js/ward-plan-geometry.js')s=s.replace("if(!Array.isArray(layout.displayCorridors)&&!layout.ignoreLegacyCorridorsForFit)","if(!layout.ignoreLegacyCorridorsForFit)");vm.runInContext(s,c,{filename:p});}
 c.WardPlanGeometry.prepare(c.WARD_3D_LAYOUT_DATA,c.WardPlanGeometry.rawCorridors);return c;
}
const before=load(true),after=load(false),changed=[],cases=[];
for(const [b,floors]of Object.entries(after.WARD_3D_LAYOUT_DATA))for(const[f,l]of Object.entries(floors)){
 if(['missing-source','excluded'].includes(l.sourceCoverage?.status)||!l.rooms.length)continue;
 const old=before.WARD_3D_LAYOUT_DATA[b][f];
 assert.equal(JSON.stringify(l.beds.map(b=>b.bedId)),JSON.stringify(old.beds.map(b=>b.bedId)),'bed IDs changed');
 if(Math.abs(l.buildingFit.scale-old.buildingFit.scale)>1e-8)changed.push({b,f,before:old.buildingFit.scale,after:l.buildingFit.scale});
 for(const w of ['ALL',...new Set([...l.rooms.map(r=>r.ward),...Object.keys(l.sourceTraceWards||{})])]){
  const s=after.WardPlan2D.scene(b,f,w),items=[...s.rooms,...s.spaces,...s.corridors];
  assert(items.length,b+'/'+f+'/'+w+' empty');
  for(const q of items)assert(q.x>=-1e-6&&q.y>=-1e-6&&q.x+q.w<=s.width+1e-6&&q.y+q.h<=s.height+1e-6,'2D crop');
  const rect={left:Math.min(...items.map(q=>q.x)),right:Math.max(...items.map(q=>q.x+q.w)),top:Math.min(...items.map(q=>q.y)),bottom:Math.max(...items.map(q=>q.y+q.h))};
  assert((rect.right-rect.left)/s.width>.5&&(rect.bottom-rect.top)/s.height>.3,'excessive 2D padding');
  cases.push({b,f,w,width:s.width,height:s.height,content:rect});
 }
}
const e1=changed.find(x=>x.b==='W03_EAST'&&x.f==='1F');assert(e1&&e1.after/e1.before>1.5,'04E1 did not improve');
const report={cases:cases.length,floors:new Set(cases.map(c=>c.b+'/'+c.f)).size,changed,cases2D:cases};
fs.writeFileSync('scratch/visible-ward-fit-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify({cases:report.cases,floors:report.floors,changed}));
