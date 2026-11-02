/* Illustrative street life, not live traffic or a surveyed planting inventory. */
(function () {
  const T = window.THREE;
  window.CampusLife = { create(parent) {
    const root = new T.Group(); root.name = 'campus-street-life'; parent.add(root);
    const mats = new Map();
    const mat = color => { if (!mats.has(color)) mats.set(color, new T.MeshStandardMaterial({color, roughness:.8})); return mats.get(color); };
    const cube = new T.BoxGeometry(1,1,1), sphere = new T.SphereGeometry(1,8,6);
    function part(g, geo, color, x,y,z, sx,sy,sz) {
      const m = new T.Mesh(geo,mat(color)); m.position.set(x,y,z); m.scale.set(sx,sy,sz); g.add(m); return m;
    }
    const box = (g,c,x,y,z,w,h,d) => part(g,cube,c,x,y,z,w,h,d);
    const ball = (g,c,x,y,z,r) => part(g,sphere,c,x,y,z,r,r,r);
    const wheelGeo = new T.TorusGeometry(.39,.065,5,12);
    const actors = [], lanes = [], signals = [];
    const dark=0x38454b, skin=0xe0b18e;
    function wheel(g,x,y,z) { const w=part(g,wheelGeo,dark,x,y,z,1,1,1); w.rotation.y=Math.PI/2; return w; }
    function person(i,kind,route='park') {
      const g = new T.Group(); g.name = kind+'-'+route+'-visitor';g.scale.setScalar(1.22);root.add(g);
      const riding=kind!=='walking', happy=i%3!==0;
      const torso=box(g,[0x6b929c,0xd19379,0xe1bd62,0x8c9e78][i%4],0,1.25,0,.48,.66,.29);
      const head=ball(g,skin,0,1.87,0,.22);
      for(const x of [-.07,.07])ball(g,dark,x,1.91,.195,.023);
      if(happy){
        const smile=new T.Mesh(new T.TorusGeometry(.075,.012,3,10,Math.PI),mat(dark)); smile.position.set(0,1.85,.207); smile.rotation.z=Math.PI; g.add(smile);
      } else ball(g,dark,0,1.8,.208,.042);
      const legs=[-.14,.14].map(x=>{const p=new T.Group();p.position.set(x,.96,0);g.add(p);box(p,0x596675,0,-.36,0,.15,.72,.18);return p;});
      const arms=[-.31,.31].map(x=>{const p=new T.Group();p.position.set(x,1.52,0);g.add(p);box(p,skin,0,-.27,0,.12,.54,.13);ball(p,skin,0,-.55,0,.075);return p;});
      const hair=[];
      if(i%3===1){
        part(g,sphere,0x514137,0,1.98,-.045,.23,.16,.22);
        for(let j=0;j<4;j++) {const strand=box(g,0x514137,(j-1.5)*.1,1.65,-.2,.11,.6,.12);hair.push(strand);}
      } else part(g,sphere,0x665448,0,2.015,-.025,.225,.095,.21);
      const wheels=[];
      if(riding) {
        g.position.y=.3;
        if(kind==='bicycle') {
          wheels.push(wheel(g,0,.39,-.65),wheel(g,0,.39,.65));
          const frame=box(g,0x718e87,0,.66,0,.12,.12,1.22);frame.rotation.x=.25;
          box(g,dark,0,.89,-.25,.32,.08,.25);box(g,0x718e87,0,.9,.62,.1,.95,.1);box(g,dark,0,1.36,.62,.65,.07,.07);
        } else {
          for(const z of [-.45,.5]){const w=wheel(g,0,.14,z);w.scale.setScalar(.36);wheels.push(w);}
          box(g,0xc29a64,0,.22,0,.32,.1,1.1);box(g,dark,0,.79,.5,.06,1.1,.06);box(g,dark,0,1.35,.5,.55,.07,.07);
        }
        arms.forEach(a=>a.rotation.x=-.9);
      }
      actors.push({g,i,kind,route,head,torso,legs,arms,hair,wheels,happy,angle:i*.53,baseY:kind==='walking'?.13:.25});
    }
    for(let i=0;i<12;i++)person(i,i<7?'walking':i<10?'bicycle':'scooter');
    // The East entrance forecourt stays free of motor vehicles.
    for(let i=0;i<8;i++)person(12+i,i<6?'walking':'bicycle','east-entrance');
    const vehicleSpecs = [
      {type:'sedan',length:3.3,width:1.65,cabin:.55,roof:.52},
      {type:'hatchback',length:2.85,width:1.6,cabin:.66,roof:.58},
      {type:'suv',length:3.8,width:1.78,cabin:.82,roof:.65},
      {type:'taxi',length:3.4,width:1.65,cabin:.58,roof:.53,color:0xd5b465},
      {type:'minibus',length:4.8,width:1.85,cabin:1.05,roof:.83,color:0xd8d3bd},
      {type:'bus',length:6.4,width:1.95,cabin:1.2,roof:.9,color:0x7d9c9e}
    ];
    function car(spec,color) {
      const g=new T.Group();g.name='signal-controlled-car';root.add(g);
      const body=new T.Group();g.add(body);
      const {length,width,cabin,roof,type}=spec,paint=spec.color||color;
      box(body,paint,0,.65,0,width,.72,length);
      const cabinLength=length*roof,cabinY=1.01+cabin/2;
      box(body,paint,0,cabinY,-.12,width*.88,cabin,cabinLength);
      const glassY=cabinY+.02,glassH=cabin*.68;
      box(body,0x748f98,0,glassY,cabinLength/2-.095,width*.77,glassH,.055);
      box(body,0x748f98,0,glassY,-cabinLength/2-.15,width*.77,glassH,.055);
      const bays=type==='bus'?5:type==='minibus'?3:2;
      for(const side of [-1,1])for(let i=0;i<bays;i++)
        box(body,0x748f98,side*(width*.44+.025),glassY,-.12+(i-(bays-1)/2)*cabinLength/bays,.055,glassH,cabinLength/bays*.78);
      for(const x of [-width/2,width/2])for(const z of [-length*.3,length*.3])part(g,sphere,dark,x,.36,z,.17,.3,.3);
      for(const x of [-width*.32,width*.32])box(body,0xffedb6,x,.7,length/2+.025,.27,.14,.055);
      const brakeLights=[];
      for(const x of [-width*.32,width*.32]){
        const lamp=new T.Mesh(cube,new T.MeshBasicMaterial({color:0x91615a}));
        lamp.position.set(x,.72,-length/2-.03);lamp.scale.set(.28,.14,.06);body.add(lamp);brakeLights.push(lamp);
      }
      const indicators={};
      // +Z is the vehicle's front: its left side is local +X.
      for(const [side,sign] of [['left',1],['right',-1]]){
        const lamps=new T.InstancedMesh(cube,new T.MeshBasicMaterial({color:0x756b53}),2);
        lamps.name='turn-indicator-'+side;
        const pose=new T.Object3D();
        for(let i=0;i<2;i++){
          pose.position.set(sign*width*.43,.74,(i?1:-1)*(length/2+.045));
          pose.scale.set(.17,.14,.07);pose.updateMatrix();lamps.setMatrixAt(i,pose.matrix);
        }
        body.add(lamps);indicators[side]=lamps;
      }
      if(type==='taxi')box(body,0xf0e4ba,0,1.01+cabin+.09,-.12,.5,.18,.3);
      if(type==='bus')box(body,0xe4e0cf,0,.59,0,width+.02,.18,length*.94);
      if(type==='suv')for(const side of [-1,1])box(body,dark,side*.55,1.01+cabin+.05,-.12,.07,.1,cabinLength*.83);
      g.userData.vehicleType=type;
      return {g,body,brakeLights,indicators,length,type,speed:0,braking:false};
    }
    const colors=[0xe7e0cf,0x769ba3,0xb8796b,0xd7b86c,0x85947f,0xe0d9ca];
    // Four approaches at the existing Zhongshan / Changde intersection.
    for(const [axis,fixed,start,end,stop,dir,ns] of [
      ['z',27,-65,116,56,1,true],['z',35,116,-65,75,-1,true],
      ['x',84.5,-48,18,8,1,false],['x',79,18,-48,12,-1,false]
    ]) {
      const lane={axis,fixed,start,end,stop,dir,ns,cars:[]};
      for(let i=0;i<3;i++)lane.cars.push({...car(vehicleSpecs[(lanes.length*3+i)%vehicleSpecs.length],colors[(lanes.length*2+i)%colors.length]),p:start+dir*i*12,stopped:false,cruise:1.55+i*.1});
      lanes.push(lane);
    }
    for(const [x,z,ns] of [[23,55,true],[39,76,true],[20,72,false],[42,59,false]]) {
      const g=new T.Group();root.add(g);g.position.set(x,0,z);g.name='illustrative-traffic-signal';
      box(g,dark,0,1.8,0,.12,3.6,.12);box(g,dark,0,3.25,0,.5,1.2,.35);
      const lights=[0xe85f51,0xe9c25b,0x79aa84].map((c,i)=>{const m=new T.MeshBasicMaterial({color:c});const o=new T.Mesh(sphere,m);o.position.set(0,3.62-i*.35,.2);o.scale.setScalar(.14);g.add(o);return o;});
      signals.push({ns,lights});
    }
    // Additional traffic stays on the outer streets, away from the East forecourt.
    for(const [axis,fixed,start,end,dir] of [
      ['x',-80,-128,125,1],['x',-76,125,-128,-1],
      ['z',-55,-58,114,1],['z',-52,114,-58,-1]
    ]){
      const lane={axis,fixed,start,end,stop:Infinity,dir,ns:null,cars:[]};
      for(let i=0;i<3;i++)lane.cars.push({...car(vehicleSpecs[(lanes.length+i)%vehicleSpecs.length],colors[(lanes.length+i*2)%colors.length]),p:start+dir*i*Math.abs(end-start)/3,stopped:false,cruise:1.7+i*.17});
      lanes.push(lane);
    }
    const southernRoadOffset=window.CAMPUS_DATA?.sceneLayout?.southernRoadOffset||0;
    const ringRoad=new T.Mesh(new T.RingGeometry(24.4,32.5,96),mat(0x62666a));ringRoad.name='roundabout-carriageway';ringRoad.rotation.x=-Math.PI/2;ringRoad.position.set(13.7,.115,138.9+southernRoadOffset);root.add(ringRoad);
    const point=(x,z)=>new T.Vector3(x,.12,z+southernRoadOffset),cx=13.7,cz=138.9,r=28.4;
    const ringPoint=a=>point(cx+Math.cos(a)*r,cz+Math.sin(a)*r);
    const routes=[];
    function makeRoute(name,source,destination,startAngle,endAngle){
      const path=new T.CurvePath(),stages=[];
      const add=(curve,stage)=>{path.add(curve);stages.push({end:path.getLength(),stage});};
      const entry=ringPoint(startAngle),exit=ringPoint(endAngle);
      const start=source==='west'?point(-138,131):source==='east'?point(180,137):point(27,98);
      const near=source==='west'?point(-38,131):source==='east'?point(65,137):point(27,102);
      add(new T.LineCurve3(start,near),'approach');
      const incoming=source==='west'?point(-24,131):source==='east'?point(52,137):point(27,114);
      const entryControl=entry.clone().sub(new T.Vector3(Math.sin(startAngle),0,-Math.cos(startAngle)).multiplyScalar(9));
      add(new T.CubicBezierCurve3(near,incoming,entryControl,entry),'enter');
      const arc=[];for(let i=0;i<=80;i++)arc.push(ringPoint(startAngle+(endAngle-startAngle)*i/80));
      add(new T.CatmullRomCurve3(arc),'roundabout');
      const far=destination==='west'?point(-38,137):destination==='east'?point(65,131):point(35,102);
      const exitControl=exit.clone().add(new T.Vector3(Math.sin(endAngle),0,-Math.cos(endAngle)).multiplyScalar(10));
      const outgoing=destination==='west'?point(-25,137):destination==='east'?point(52,131):point(35,116);
      add(new T.CubicBezierCurve3(exit,exitControl,outgoing,far),'exit');
      const end=destination==='west'?point(-138,137):destination==='east'?point(180,131):point(35,98);
      add(new T.LineCurve3(far,end),'depart');
      const length=path.getLength();
      const directionBetween=(from,to)=>{
        const a=path.getTangentAt(Math.max(0,from)/length),b=path.getTangentAt(Math.min(length,to)/length);
        const delta=Math.atan2(Math.sin(Math.atan2(b.x,b.z)-Math.atan2(a.x,a.z)),Math.cos(Math.atan2(b.x,b.z)-Math.atan2(a.x,a.z)));
        return delta<0?'right':'left';
      };
      routes.push({name,path,stages,length,entrySignal:directionBetween(stages[0].end-.5,stages[1].end-.5),exitSignal:directionBetween(stages[2].end-.5,stages[3].end+.5)});
    }
    makeRoute('west-east','west','east',Math.PI,0);
    makeRoute('east-west','east','west',0,-Math.PI);
    makeRoute('north-west','north','west',-Math.PI/2,-Math.PI);
    makeRoute('north-east','north','east',-Math.PI/2,-Math.PI*2);
    makeRoute('west-north','west','north',Math.PI,0);
    const circulating=[];
    for(let i=0;i<6;i++){
      const c=car(vehicleSpecs[i],colors[i]);c.route=routes[i%routes.length];
      c.distance=i<2?c.route.stages[1].end-12:i<4?c.route.stages[2].end+12:c.route.length*.12;
      c.speed=1.4;c.wait=0;c.trip=0;c.stage='approach';circulating.push(c);
    }
    let phase=0;
    function update(time,delta,reduced) {
      if(reduced)time=0;
      const dt=Math.min(delta,.05); if(!reduced)phase=(phase+dt)%30;
      const nsGreen=phase<12,ewGreen=phase>=15&&phase<27;
      for(const s of signals){const green=s.ns?nsGreen:ewGreen,amber=s.ns?phase>=12&&phase<15:phase>=27; s.lights.forEach((l,i)=>l.material.color.setHex(i===(green?2:amber?1:0)?[0xff6758,0xffd86b,0x8cdda0][i]:0x39413c));}
      let stoppedCars=0;
      for(const l of lanes) {
        const green=l.ns===null?true:l.ns?nsGreen:ewGreen;
        const ordered=[...l.cars].sort((a,b)=>(b.p-a.p)*l.dir);
        let leader=null;
        for(const c of ordered) {
          // Respawn only into an empty lane entrance; no overtaking or overlap.
          if((c.p-l.end)*l.dir>=0){
            const entranceClear=l.cars.every(other=>other===c||(other.p-l.start)*l.dir>(other.length+c.length)/2+2);
            if(entranceClear){c.p=l.start;c.speed=0;c.g.visible=true;}
            else{c.g.visible=false;c.speed=0;continue;}
          }
          let gap=Infinity;
          const stopCenter=l.stop-l.dir*(c.length/2+.35),approach=(stopCenter-c.p)*l.dir;
          if(!green&&approach>=-.001)gap=Math.max(0,approach);
          if(leader&&(leader.p-c.p)*l.dir>0)gap=Math.min(gap,Math.max(0,(leader.p-c.p)*l.dir-(leader.length+c.length)/2-1.8));
          const previous=c.speed,acceleration=.38,deceleration=.7;
          const desired=gap<.045?0:Math.min(c.cruise,Math.sqrt(2*deceleration*gap)*.82);
          if(!reduced)c.speed=T.MathUtils.clamp(desired,Math.max(0,previous-deceleration*dt),previous+acceleration*dt);
          const advance=reduced?0:Math.min(gap,(previous+c.speed)*.5*dt);
          c.p=Math.min((c.p+advance*l.dir)*l.dir,l.end*l.dir)*l.dir;
          c.stopped=c.speed<.035; if(c.stopped)stoppedCars++;
          c.braking=!reduced&&(c.speed<previous-.001||(!green&&approach>=0&&c.stopped));
          c.brakeLights.forEach(lamp=>lamp.material.color.setHex(c.braking?0xd47b68:0x91615a));
          // Subtle body weight transfer; no flashing lights or camera movement.
          if(!reduced)c.body.rotation.x=T.MathUtils.lerp(c.body.rotation.x,(c.speed-previous)/Math.max(dt,.001)*-.018,Math.min(1,dt*5));
          c.g.position.set(l.axis==='z'?l.fixed:c.p,.12,l.axis==='z'?c.p:l.fixed);
          c.g.rotation.y=l.axis==='z'?(l.dir>0?0:Math.PI):(l.dir>0?Math.PI/2:-Math.PI/2);
          c.g.userData.motion={speed:c.speed,position:c.p,lane:lanes.indexOf(l),braking:c.braking,green,stopCenter};
          leader=c;
        }
      }
      for(const c of circulating){
        if(c.wait>0){if(!reduced)c.wait-=dt;c.g.visible=false;if(c.wait>0)continue;c.distance=0;c.route=routes[(routes.indexOf(c.route)+2)%routes.length];c.g.visible=true;}
        const route=c.route,stage=route.stages.find(s=>c.distance<=s.end)?.stage||'depart';c.stage=stage;
        const approachingEntry=stage==='approach'&&route.stages[0].end-c.distance<10;
        const approachingExit=stage==='roundabout'&&route.stages[2].end-c.distance<10;
        const signal=stage==='enter'||approachingEntry?route.entrySignal:stage==='exit'||approachingExit?route.exitSignal:null;
        const blink=signal&&!reduced&&phase%1<.5;
        for(const side of ['left','right'])c.indicators[side].material.color.setHex(blink&&side===signal?0xd9ac5d:0x756b53);
        const desired=stage==='enter'||stage==='exit'||approachingEntry||approachingExit?1.25:stage==='roundabout'?1.75:2.5;
        const ahead=route.path.getPointAt(Math.min(1,(c.distance+4)/route.length));
        const traffic=[...circulating,...lanes.flatMap(l=>l.cars)].filter(other=>other!==c&&other.g.visible);
        const heading=route.path.getTangentAt(Math.min(1,c.distance/route.length));
        let clearance=Infinity;
        const blocked=traffic.some(other=>{
          const offset=other.g.position.clone().sub(c.g.position),forward=offset.dot(heading),lateral=Math.sqrt(Math.max(0,offset.lengthSq()-forward*forward));
          const following=forward>0&&forward<(other.length+c.length)/2+2.2&&lateral<2.2;
          const yielding=stage==='enter'&&other.stage==='roundabout'&&ahead.distanceTo(other.g.position)<7;
          return following||yielding;
        });
        for(const other of traffic){
          const offset=other.g.position.clone().sub(c.g.position),forward=offset.dot(heading),lateral=Math.sqrt(Math.max(0,offset.lengthSq()-forward*forward));
          if(forward>0&&lateral<2.2)clearance=Math.min(clearance,Math.max(0,forward-(other.length+c.length)/2-1.8));
        }
        const previous=c.speed;
        if(!reduced){
          const target=Math.min(blocked?0:desired,Math.sqrt(2*.7*clearance)*.82);
          c.speed=T.MathUtils.clamp(target,Math.max(0,previous-.7*dt),previous+.38*dt);
          c.distance+=Math.min(clearance,(previous+c.speed)*.5*dt);
          c.body.rotation.x=T.MathUtils.lerp(c.body.rotation.x,(c.speed-previous)/Math.max(dt,.001)*-.018,Math.min(1,dt*5));
        }
        const t=Math.min(1,c.distance/route.length),pos=route.path.getPointAt(t),tangent=route.path.getTangentAt(t);
        c.g.position.copy(pos);c.g.rotation.y=Math.atan2(tangent.x,tangent.z);c.braking=blocked||c.speed<previous-.001;
        c.brakeLights.forEach(lamp=>lamp.material.color.setHex(c.braking?0xd47b68:0x91615a));
        c.g.userData.turn={route:route.name,stage,signal,blink:!!blink,speed:c.speed,distance:c.distance,approachingEntry,approachingExit};
        if(c.distance>=route.length){c.trip++;c.wait=4;c.g.visible=false;c.speed=0;}
      }
      for(const a of actors) {
        if(!reduced)a.angle+=dt*(a.kind==='walking'?.009:a.kind==='bicycle'?.019:.015);
        const r=a.kind==='walking'?2.4:a.kind==='bicycle'?3.2:2.8;
        const breeze=reduced?0:Math.sin(time*.75+a.i*1.7);
        const step=reduced?0:Math.sin(time*1.8+a.i);
        a.g.position.set(-62+Math.cos(a.angle)*r,a.baseY+(a.kind==='walking'?Math.abs(step)*.035:0)+breeze*.012,30+Math.sin(a.angle)*(a.kind==='walking'?64:66));
        a.g.rotation.y=Math.atan2(-Math.sin(a.angle),Math.cos(a.angle)*1.55);
        if(a.route==='east-entrance'){
          const speed=a.kind==='bicycle'?2.4:.95,p=(time*speed+a.i*7.3)%88,forward=p<44;
          a.g.position.set(a.kind==='bicycle'?45.2:48+(a.i%3-1)*.65,a.baseY+(a.kind==='walking'?Math.abs(step)*.035:0),49+(forward?p:88-p));
          a.g.rotation.y=forward?0:Math.PI;
        }
        a.g.rotation.z=breeze*.018;
        const swing=reduced?0:Math.sin(time*1.8+a.i);
        a.legs.forEach((p,i)=>p.rotation.x=swing*(i?1:-1)*(a.kind==='walking'?.35:.2));
        if(a.kind==='walking') {
          a.arms[0].rotation.x=-swing*.24;
          const yawn=!a.happy&&Math.sin(time*.35+a.i)>.25;
          a.arms[1].rotation.x=yawn?-2.35:swing*.24;
          a.head.rotation.x=yawn?-.15:0;
          if(a.happy)a.arms[1].rotation.z=reduced?-.2:-.25+Math.sin(time*1.8+a.i)*.15;
        }
        a.hair.forEach((h,i)=>{h.rotation.x=reduced?0:.16+Math.sin(time*1.5+i*.4+a.i)*.16;h.rotation.z=reduced?0:Math.sin(time*1.1+i*.3)*.09;});
        a.wheels.forEach(w=>w.rotation.x=reduced?0:time*2);
      }
      root.userData.status={cars:lanes.reduce((n,l)=>n+l.cars.length,0)+circulating.length,roundaboutCars:circulating.length,roundaboutRoutes:circulating.map(c=>({route:c.route.name,stage:c.stage,signal:c.g.userData.turn?.signal||null,blink:!!c.g.userData.turn?.blink,speed:+c.speed.toFixed(2),distance:+c.distance.toFixed(2),trips:c.trip,x:+c.g.position.x.toFixed(2),z:+c.g.position.z.toFixed(2)})),vehicleTypes:[...new Set(lanes.flatMap(l=>l.cars).map(c=>c.type))],stoppedCars,brakingCars:lanes.flatMap(l=>l.cars).filter(c=>c.braking).length,speeds:lanes.flatMap(l=>l.cars).map(c=>+c.speed.toFixed(3)),walking:actors.filter(a=>a.kind==='walking').length,bicycles:actors.filter(a=>a.kind==='bicycle').length,scooters:2,longHair:actors.filter(a=>a.hair.length).length,trafficPhase:phase,eastEntrance:{cars:lanes.flatMap(l=>l.cars).filter(c=>c.g.position.x>44&&c.g.position.x<58&&c.g.position.z>48&&c.g.position.z<95).length,walking:6,bicycles:2,positions:actors.filter(a=>a.route==='east-entrance').map(a=>({kind:a.kind,x:a.g.position.x,z:a.g.position.z}))}};
    }
    return {root,update};
  }};
})();
