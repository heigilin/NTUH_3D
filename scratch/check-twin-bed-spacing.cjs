const fs=require('fs'),vm=require('vm'),assert=require('assert');
const paths=[...fs.readFileSync('index.html','utf8').matchAll(/src="(js\/[^"?]+)(?:\?[^" ]*)?"/g)].map(m=>m[1]).filter(p=>p.startsWith('js/data/')||p.startsWith('js/ward-'));
function load(previous){const c={console,URLSearchParams,location:{search:''}};c.window=c;vm.createContext(c);for(const p of paths){let s=fs.readFileSync(p,'utf8');if(previous&&p==='js/ward-plan-layout.js')s=s.replace('if(pair.length===2){','if(false&&pair.length===2){');vm.runInContext(s,c,{filename:p});}c.WardPlanGeometry.prepare(c.WARD_3D_LAYOUT_DATA,c.WardPlanGeometry.rawCorridors);return c;}
const old=load(true),now=load(false),rows=[];let unchangedRooms=0;
for(const [building,floors]of Object.entries(now.WARD_3D_LAYOUT_DATA))for(const[floor,l]of Object.entries(floors)){
 if(['excluded','missing-source'].includes(l.sourceCoverage?.status))continue;
 const prior=old.WARD_3D_LAYOUT_DATA[building][floor],byId=new Map(prior.beds.map(b=>[b.bedId,b]));
 assert.equal(l.beds.length,prior.beds.length);
 for(const r of l.rooms){
  const beds=l.beds.filter(b=>b.ward===r.ward&&b.roomCode===r.roomCode),zone=r.bedBounds||r.bounds;
  for(const b of beds){const a=byId.get(b.bedId);assert(a);for(const k of ['width','depth','headSide','axis'])assert.equal(b[k],a[k]);if(b.x!==a.x||b.z!==a.z){assert.equal(beds.length,2);assert(Math.abs(b.x-zone.x)+b.width/2<=zone.width/2+1e-8);assert(Math.abs(b.z-zone.z)+b.depth/2<=zone.depth/2+1e-8);}}
  if(!r.doubleBedSpacing){unchangedRooms++;continue;}
  const {axis,gapBefore,gapAfter}=r.doubleBedSpacing;assert(gapAfter>=gapBefore-1e-8);
  const size=axis==='x'?'width':'depth',a=byId.get(beds[0].bedId),b=byId.get(beds[1].bedId);
  const beforeGap=Math.abs(a[axis]-b[axis])-(a[size]+b[size])/2,afterGap=Math.abs(beds[0][axis]-beds[1][axis])-(beds[0][size]+beds[1][size])/2;
  assert(afterGap>=beforeGap-1e-8);
  rows.push({building,floor,ward:r.ward,room:r.roomCode,axis,beforeGap,afterGap,increased:afterGap>beforeGap+1e-8});
 }
}
const report={twinRooms:rows.length,increased:rows.filter(r=>r.increased).length,unchangedOtherRooms:unchangedRooms,bedIdsAndSizesPreserved:true,movedBedsContained:true,rows};
fs.writeFileSync('scratch/twin-bed-spacing-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,rows:undefined}));
