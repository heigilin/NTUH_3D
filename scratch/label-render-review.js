WardPlanGeometry.prepare(WARD_3D_LAYOUT_DATA,WardPlanGeometry.rawCorridors);
const result={normalSize:0,constrained:0,targets:[],errors:[]},canvas=document.getElementById('label'),ctx=canvas.getContext('2d');
for(const [building,floors]of Object.entries(WARD_3D_LAYOUT_DATA))for(const[floor,l]of Object.entries(floors)){
 if(!WardPlan2D.hasPlan(building,floor))continue;
 for(const r of l.rooms||[]){if(!r.bounds||!r.bedCount)continue;const q=r.bounds,beds=(l.beds||[]).filter(b=>b.ward===r.ward&&b.roomCode===r.roomCode).map(b=>({x:b.x-b.width/2,y:b.z-b.depth/2,w:b.width,h:b.depth}));beds.push(...(r.annexBounds||[]).map(q=>({x:q.x-q.width/2,y:q.z-q.depth/2,w:q.width,h:q.depth,captionSoft:true})));const d=120,max=Math.min(WardPlanLabels.patientFontSize(r),building==='W04_WEST'&&/^(?:0?[56]W)/.test(r.ward)?.65:.92)*d,text=WardPlanLabels.room(r),p=WardPlanLabels.place({x:q.x-q.width/2,y:q.z-q.depth/2,w:q.width,h:q.depth},beds,text,max/d);
  canvas.width=Math.ceil(p.w*d);canvas.height=Math.ceil(p.h*d);const drawn=WardPlanLabels.draw(ctx,text,canvas.width/2,canvas.height/2,canvas.width,canvas.height,max);if(drawn.size>=max-.01)result.normalSize++;else result.constrained++;
  if(building==='E01_MAIN'&&((floor==='7F'&&r.ward==='7C'&&['01','02','20','21'].includes(r.roomCode))||(floor==='12F'&&r.ward==='12D'&&['20','21'].includes(r.roomCode)))){const entry={ward:r.ward,room:r.roomCode,text,box:p,size:drawn.size/d,normalSize:max/d,clear:p.clear};result.targets.push(entry);if(!p.clear||drawn.size<max-.01)result.errors.push(entry);}
 }
}
result.renders2D=0;
const rendered=document.createElement('canvas');rendered.width=1280;rendered.height=720;
const manager={wardCanvas:rendered,wardCtx:rendered.getContext('2d'),wardModal:null,wardPan:{x:0,y:0},wardZoom:1,wardHistory:[],drawSinglePath(){}};
for(const [building,floors]of Object.entries(WARD_3D_LAYOUT_DATA))for(const[floor,l]of Object.entries(floors)){
 if(!WardPlan2D.hasPlan(building,floor))continue;
 for(const ward of ['ALL',...new Set(l.rooms.map(r=>r.ward))]){
  Object.assign(manager,{wardActiveBuildingId:building,wardActiveFloor:floor,wardActiveWard:ward});
  try{WardPlan2D.render(manager);result.renders2D++;}catch(e){result.errors.push({building,floor,ward,error:String(e)});}
 }
}
document.getElementById('result').textContent=JSON.stringify(result);document.body.dataset.labelAudit=JSON.stringify(result);
