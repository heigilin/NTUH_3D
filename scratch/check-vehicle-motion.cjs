const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),T=require('../libs/three.min.js');
const context={window:{THREE:T}};vm.createContext(context);vm.runInContext(fs.readFileSync('js/campus-life.js','utf8'),context);
const parent=new T.Group(),life=context.window.CampusLife.create(parent);
const cars=life.root.children.filter(o=>o.name==='signal-controlled-car');
assert.equal(cars.length,12);assert.equal(new Set(cars.map(o=>o.userData.vehicleType)).size,6);
const previous=new Map();let starts=0,brakes=0,stops=0,maxAcceleration=0;
const dt=1/60;
for(let frame=0;frame<60*240;frame++){
 life.update(frame*dt,dt,false);
 for(const car of cars){
  if(!car.visible)continue;
  const s=car.userData.motion,old=previous.get(car);
  assert(Number.isFinite(s.speed)&&s.speed>=0&&s.speed<=1.751);
  if(old&&Math.abs(s.position-old.position)<1){
   const a=(s.speed-old.speed)/dt;maxAcceleration=Math.max(maxAcceleration,Math.abs(a));
   assert(a<=.381&&a>=-.701,'abrupt velocity change');
   if(old.speed<.035&&s.speed>old.speed+.001)starts++;
   if(s.braking&&s.speed>0)brakes++;
   if(!s.green){const dir=s.lane%2===0?1:-1;if((s.stopCenter-old.position)*dir>=0)assert((s.position-s.stopCenter)*dir<=.001,'crossed red stop line');}
  }
  if(s.speed<.035)stops++;
  previous.set(car,{...s});
 }
 for(let lane=0;lane<4;lane++){
  const list=cars.filter(c=>c.visible&&c.userData.motion.lane===lane).sort((a,b)=>a.userData.motion.position-b.userData.motion.position);
  for(let i=1;i<list.length;i++){
   const size=c=>new T.Box3().setFromObject(c).getSize(new T.Vector3());
   const longitudinal=c=>lane<2?size(c).z:size(c).x;
   assert(list[i].userData.motion.position-list[i-1].userData.motion.position>(longitudinal(list[i])+longitudinal(list[i-1]))/2+.5,'vehicle overlap');
  }
 }
}
assert(starts>0&&brakes>0&&stops>0);
const positions=cars.map(c=>c.position.clone());for(let i=0;i<120;i++)life.update(241+i*dt,dt,true);
cars.forEach((c,i)=>assert(c.position.equals(positions[i]),'reduced motion moved a vehicle'));
const report={vehicleTypes:[...new Set(cars.map(o=>o.userData.vehicleType))],simulatedSeconds:240,starts,brakes,stops,maxAcceleration,overlaps:0,redLineViolations:0,reducedMotionFrozen:true};
fs.writeFileSync('scratch/vehicle-motion-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
