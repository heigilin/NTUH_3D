const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),T=require('../libs/three.min.js');
const ctx={window:{THREE:T}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('js/data/campus-data.js','utf8'),ctx);vm.runInContext(fs.readFileSync('js/campus-life.js','utf8'),ctx);
const life=ctx.window.CampusLife.create(new T.Group()),cars=life.root.children.filter(o=>o.name==='signal-controlled-car');
assert.equal(life.root.getObjectByName('roundabout-carriageway').position.z,ctx.window.CAMPUS_DATA.buildings.find(b=>b.id==='JINGFU_GATE').position.z);
const prior=new Map(),signals=new Set(),stages=new Set();let approaching=0,blinkOn=0,blinkOff=0,maxHeadingStep=0,maxAcceleration=0;
const dt=1/60;
for(let frame=0;frame<240*60;frame++){
 life.update(frame*dt,dt,false);
 for(const c of cars){
  const turn=c.userData.turn;if(!turn||!c.visible)continue;
  stages.add(turn.stage);if(turn.signal)signals.add(turn.signal);
  if(turn.approachingEntry||turn.approachingExit)approaching++;
  if(turn.signal){turn.blink?blinkOn++:blinkOff++;}
  if(turn.stage==='depart')assert.equal(turn.signal,null,'indicator did not cancel');
  for(const side of ['left','right']){
   const lamp=c.children[0].children.find(o=>o.name==='turn-indicator-'+side);assert(lamp,'missing indicator');
   assert.equal(lamp.material.color.getHex(),turn.blink&&turn.signal===side?0xd9ac5d:0x756b53,'wrong side illuminated');
  }
  const old=prior.get(c);
  if(old&&old.route===turn.route&&c.position.distanceTo(old.position)<1){
   const angle=Math.abs(Math.atan2(Math.sin(c.rotation.y-old.heading),Math.cos(c.rotation.y-old.heading)));
   maxHeadingStep=Math.max(angle,maxHeadingStep);assert(angle<.08,'abrupt turn heading');
   const a=Math.abs(turn.speed-old.speed)/dt;maxAcceleration=Math.max(a,maxAcceleration);assert(a<.701,'abrupt turn acceleration');
  }
  prior.set(c,{route:turn.route,position:c.position.clone(),heading:c.rotation.y,speed:turn.speed});
 }
}
assert(approaching>0&&blinkOn>0&&blinkOff>0&&stages.has('exit')&&stages.has('depart'));
const positions=cars.map(c=>c.position.clone()),headings=cars.map(c=>c.rotation.y);
for(let i=0;i<60;i++)life.update(241+i*dt,dt,true);
cars.forEach((c,i)=>{assert(c.position.equals(positions[i]));assert.equal(c.rotation.y,headings[i]);});
const report={seconds:240,cars:cars.length,signalSides:[...signals],stages:[...stages],approaching,blinkOn,blinkOff,maxHeadingStep,maxAcceleration,reducedMotionFrozen:true,routes:life.root.userData.status.roundaboutRoutes};
fs.writeFileSync('scratch/vehicle-turns-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
