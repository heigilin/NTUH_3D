/* Decorative landscape only: never changes campus footprints, routes or ward data. */
(function(){
 const T=window.THREE;
 window.CampusGarden={create(app){
  const root=new T.Group();root.name='campus-garden';app.scene.add(root);
  const low=new T.Group(),high=new T.Group(),horizon=new T.Group(),mountains=new T.Group();horizon.add(mountains);
  low.name='low-garden';high.name='outer-trees';horizon.name='distant-scenery';root.add(low,high,horizon);
  const trees=[],birds=[],clouds=[];const verify=new URLSearchParams(location.search).has('verifyGarden');let reduceMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const material=(color,opacity=1)=>new T.MeshStandardMaterial({color,roughness:1,transparent:opacity<1,opacity});
  const sage=material(0x809d82),stone=material(0xc4bba6),wood=material(0xa88c6a),iron=material(0x788980);
  const mesh=(geometry,mat,x,y,z,parent=low)=>{const m=new T.Mesh(geometry,mat);m.position.set(x,y,z);m.receiveShadow=true;parent.add(m);return m;};
  const box=(w,h,d,mat,x,y,z,parent)=>mesh(new T.BoxGeometry(w,h,d),mat,x,y,z,parent);
  const buildings=app.campusData.buildings.filter(b=>b.id!=='JINGFU_TUNNEL');
  const childModel=app.buildingMeshes.CHILD_HOSPITAL;
  if(childModel?.isObject3D)childModel.updateWorldMatrix(true,true);
  const childExterior=childModel?.isObject3D?new T.Box3().setFromObject(childModel):null;
  const clear=(x,z,w,d)=>!buildings.some(b=>{
   if(b.id==='CHILD_HOSPITAL'&&childExterior&&!childExterior.isEmpty())return x+w/2>childExterior.min.x-.35&&x-w/2<childExterior.max.x+.35&&z+d/2>childExterior.min.z-.35&&z-d/2<childExterior.max.z+.35;
   return Math.abs(x-b.position.x)<(w+b.dimensions.width)/2+.35&&Math.abs(z-b.position.z)<(d+b.dimensions.depth)/2+.35;
  });
  // Park promenade: an ornamental loop entirely inside the existing park lawn.
  const promenade=mesh(new T.RingGeometry(37,39,80,1,Math.PI*.05,Math.PI*1.5),stone,-120,.115,25);promenade.rotation.x=-Math.PI/2;promenade.scale.y=1.55;
  promenade.name='park-promenade';
  function flowerbed(x,z,w,d,child=false){if(!clear(x,z,w,d))return;
   const group=new T.Group();group.name='low-flowerbed';group.userData={height:.64,bounds:{x,z,width:w,depth:d}};low.add(group);
   box(w,.14,d,stone,x,.16,z,group);box(w-.18,.12,d-.18,sage,x,.27,z,group);
   const count=Math.max(8,Math.round(w*d*1.5)),matrix=new T.Matrix4(),colors=[0xf0d29a,0xf6f0e5,0xe9c6c4];
   for(let c=0;c<3;c++){const flowers=new T.InstancedMesh(new T.SphereGeometry(child?.22:.19,6,4),material(colors[c]),Math.ceil(count/3));
    for(let i=0;i<Math.ceil(count/3);i++){const u=((i*7+c*3)%19)/18,v=((i*11+c*5)%17)/16;matrix.makeScale(1,.6,1);matrix.setPosition(x+(u-.5)*(w-.4),.43+(i%3)*.035,z+(v-.5)*(d-.4));flowers.setMatrixAt(i,matrix);}group.add(flowers);}
  }
  // Low accents in existing inter-wing lawns; entrances and roadway centres stay open.
  // Clear park-side pedestrian path beside Gongyuan Road; keep walkers out of the tree canopy and carriageway.
  const parkSidewalk=box(2.4,.08,134,stone,-62,.12,30,low);parkSidewalk.name='park-sidewalk';
  for(const z of [40,24]){flowerbed(-32,z,12,.8);flowerbed(18,z,10,.8);}
  for(const p of [[-151,3,7,2.6],[-124,40,12,5],[-107,12,8,3.5],[-137,83,9,3],[-88,45,5,2.2],[128,45,3,7],[127,96,4,5],[7,-77,10,1.5],[29,-76,3,1.5]])flowerbed(...p,p[1]<-70);
  function bench(x,z,angle=0){if(!clear(x,z,3.5,1.5))return;
   const g=new T.Group();g.name='garden-bench';g.position.set(x,0,z);g.rotation.y=angle;low.add(g);
   for(const zz of [-.3,0,.3])box(3,.12,.24,wood,0,.53,zz,g);
   for(const y of [.9,1.17])box(3,.15,.13,wood,0,y,-.43,g);
   for(const xx of [-1.1,1.1]){box(.12,.5,.72,iron,xx,.26,0,g);box(.1,.85,.1,iron,xx,.8,-.43,g);}
  }
  bench(-151,34,Math.PI/2);bench(-120,88);bench(-88,15,-Math.PI/2);bench(130,80,Math.PI/2);
  const treeStyles=[
   {name:'round-canopy',bark:0x88745d,leaf:0x73956d,accent:0x91aa79},
   {name:'evergreen',bark:0x796b58,leaf:0x527b66,accent:0x71917a},
   {name:'spreading-canopy',bark:0x9a8164,leaf:0x809c72,accent:0xa7b987},
   {name:'blossom-canopy',bark:0x927c68,leaf:0x78936e,accent:0x8e9d77},
   {name:'upright-broadleaf',bark:0x827159,leaf:0x507258,accent:0x6e8d64},
   {name:'irregular-branching',bark:0x9b866a,leaf:0x8b9e65,accent:0x8b9d6f}
  ];
  // Open sprays of individual pointed leaves replace solid spherical crowns.
  const foliageGeometry=(phase)=>{
   const vertices=[],tri=(a,b,c)=>vertices.push(...a,...b,...c);
   const rand=n=>{const v=Math.sin(n*127.1+phase*311.7)*43758.5453;return v-Math.floor(v);};
   for(let branch=0;branch<9;branch++){
    const angle=branch*2.39996+phase,reach=.55+rand(branch+7)*.5;
    for(let j=0;j<24;j++){
     const t=.15+.85*rand(branch*53+j),a=angle+(rand(j+branch*31)-.5)*1.3;
     const center=new T.Vector3(Math.cos(a)*t*reach,(rand(j*7+branch)-.5)*.65+.2*Math.sin(t*3),Math.sin(a)*t*reach);
     const length=.13+rand(j+branch*83)*.16,width=length*(.35+rand(j*3)*.2);
     const along=new T.Vector3(Math.cos(a+.3),.15+rand(j*11)*.6,Math.sin(a+.3)).normalize().multiplyScalar(length);
     const side=new T.Vector3(-Math.sin(a),.3*Math.sin(j),Math.cos(a)).normalize().multiplyScalar(width);
     const tip=center.clone().add(along),root=center.clone().sub(along),left=center.clone().add(side),right=center.clone().sub(side);
     tri(root.toArray(),left.toArray(),tip.toArray());tri(root.toArray(),tip.toArray(),right.toArray());
    }
   }
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.computeVertexNormals();return geo;
  };
  const roundGeo=foliageGeometry(.8),coneGeo=new T.ConeGeometry(1,1,8),crownGeo=foliageGeometry(2.3);
  function tree(x,z,height=4.8){if(!clear(x,z,5,5))return;
   const seed=Math.abs(Math.round(x*37+z*19)),kind=trees.length%treeStyles.length,style=treeStyles[kind];
   const inPark=x>-188&&x<-54&&z>-65&&z<125;
   const variation=.82+((seed*13)%23)/22*.42;
   const actualHeight=height*variation*(inPark?1.7:1);
   const crownSpread=.9+((seed*7)%17)/16*.35;
   const crownRadius=Math.max(1.2,actualHeight*(kind===2?.31:.265)*crownSpread*(inPark?1.24:1));
   const g=new T.Group();g.name='outer-garden-tree';g.userData.treeType=style.name;g.position.set(x,0,z);g.rotation.y=seed*2.39996;high.add(g);
   const bark=material(style.bark),leaf=material(style.leaf),accent=material(style.accent),mats=[bark,leaf,accent];
   for(const m of mats){m.transparent=true;m.depthWrite=false;m.side=T.DoubleSide;}
   const trunkH=actualHeight*(kind===1?.78:.35),trunk=mesh(new T.CylinderGeometry(actualHeight*.017,actualHeight*.028,trunkH,7),bark,0,trunkH/2,0,g);
   trunk.rotation.z=((seed%7)-3)*.025;
   const crownY=actualHeight*.72;
   const crown=(geo,mat,px,py,pz,sx,sy,sz)=>{const m=mesh(geo,mat,px,py,pz,g);m.scale.set(sx,sy,sz);return m;};
   if(kind===0){
    for(let i=0;i<7;i++){const a=i*2.4+seed*.013,s=.49+(i%3)*.09;crown(i%2?roundGeo:crownGeo,i%3?leaf:accent,Math.cos(a)*crownRadius*.55,crownY+Math.sin(i*1.8)*crownRadius*.35,Math.sin(a)*crownRadius*.58,crownRadius*s,crownRadius*s*.85,crownRadius*s*.9);}
   }else if(kind===1){
    for(let i=0;i<4;i++){const t=i/3,r=crownRadius*(1-t*.74),h=actualHeight*(.28-t*.035),y=actualHeight*.43+i*actualHeight*.135;const layer=mesh(coneGeo,i%2?accent:leaf,0,y,0,g);layer.scale.set(r,h,r);}
   }else if(kind===2){
    crown(crownGeo,leaf,0,crownY,0,crownRadius*1.45,crownRadius*.52,crownRadius*1.12);
    for(let i=0;i<3;i++){const a=i*Math.PI*2/3+seed*.009;crown(roundGeo,accent,Math.cos(a)*crownRadius*.55,crownY+crownRadius*.35,Math.sin(a)*crownRadius*.55,crownRadius*.68,crownRadius*.5,crownRadius*.66);}
   }else if(kind===3){
    for(let i=0;i<5;i++){const a=i*2.4;crown(crownGeo,leaf,Math.cos(a)*crownRadius*.46,crownY+Math.sin(i*2)*crownRadius*.27,Math.sin(a)*crownRadius*.48,crownRadius*.65,crownRadius*.57,crownRadius*.65);}
    for(let i=0;i<6;i++){const a=i*Math.PI/3+seed*.01,t=i/6;crown(roundGeo,accent,Math.cos(a)*crownRadius*.72,crownY+(i%2?1:-1)*crownRadius*.34,Math.sin(a)*crownRadius*.72,crownRadius*.16,crownRadius*.13,crownRadius*.16);}
   }
   if(kind===4){
    crown(crownGeo,leaf,0,actualHeight*.71,0,crownRadius*.77,actualHeight*.38,crownRadius*.75);
    for(let i=0;i<4;i++){const a=i*2.4; crown(roundGeo,i%2?accent:leaf,Math.cos(a)*crownRadius*.45,actualHeight*(.56+i*.1),Math.sin(a)*crownRadius*.42,crownRadius*.6,crownRadius*.85,crownRadius*.55);}
   }
   if(kind===5){
    for(let i=0;i<4;i++){
     const a=i*2.1,tip=new T.Vector3(Math.cos(a)*crownRadius*.83,actualHeight*(.68+(i%3)*.1),Math.sin(a)*crownRadius*.8),base=new T.Vector3(0,trunkH*.7,0),delta=tip.clone().sub(base);
     const branch=mesh(new T.CylinderGeometry(.075,.14,delta.length(),6),bark,0,0,0,g);branch.position.copy(base).add(tip).multiplyScalar(.5);branch.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());
     crown(crownGeo,i%2?accent:leaf,tip.x,tip.y,tip.z,crownRadius*(.7+i*.05),crownRadius*.7,crownRadius*.7);
    }
   }
   if(kind!==1&&kind!==5){
    for(let i=0;i<3;i++){
     const a=i*2.3+seed*.1,base=new T.Vector3(0,trunkH*.58,0),tip=new T.Vector3(Math.cos(a)*crownRadius*.62,crownY+Math.sin(i)*crownRadius*.1,Math.sin(a)*crownRadius*.62),d=tip.clone().sub(base);
     const limb=mesh(new T.CylinderGeometry(actualHeight*.009,actualHeight*.019,d.length(),6),bark,0,0,0,g);limb.position.copy(base).add(tip).multiplyScalar(.5);limb.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());
    }
   }
   const bounds=new T.Box3().setFromObject(g),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
   trees.push({object:g,mats,height:size.y,radius:Math.max(size.x,size.z)/2,center,baseY:bounds.min.y,alpha:1,swayPhase:seed*.17,sway:.012,baseRotation:g.rotation.z});
  }
  for(const p of [[-166,-20,5],[-168,65,5.3],[-149,108,4.8],[-87,94,4.6],[-83,-42,4.5],[144,22,5],[143,110,5],[ -28,-83,4.6]])tree(...p);
  // Green park edges and street trees; keep the promenade and entry axes open.
  for(let i=0;i<9;i++) {
   tree(-178,-48+i*19,6.5+(i%3)*.6);
   tree(-68,-48+i*19,5.8+(i%3)*.5);
  }
  for(const p of [[-155,-40,7],[-134,-46,7.5],[-109,-41,7],[-153,103,7.5],[-127,112,7],[-101,105,7],[-164,4,6.8],[-161,54,7.2],[20,-50,5.5],[42,-40,5.5],[20,94,5.5],[43,97,5.5]])tree(...p);
  for(const p of [[-149,-13,8],[-132,-20,8.5],[-107,-12,8],[-153,28,8],[-141,79,8.5],[-111,78,8],[-92,60,8],[-89,7,8]])tree(...p);
  // Photo-led impression of mature banyan/broadleaf groves, not a tree survey.
  // Per-tree instancing keeps overlapping crowns to one draw per tree and
  // preserves individual fading when a crown crosses a hospital sightline.
  const groveTrunkGeo=new T.CylinderGeometry(.25,.42,1,7);
  const groveMatrix=new T.Matrix4(),grovePosition=new T.Vector3(),groveScale=new T.Vector3(),groveRotation=new T.Quaternion();
  function matureParkTree(x,z,seed) {
   if(!clear(x,z,10,10))return;
   const height=12+(seed%9)*.55,radius=4.5+(seed%5)*.35;
   const g=new T.Group();g.name='park-mature-broadleaf';g.userData.treeType='mature-spreading-broadleaf';g.position.set(x,0,z);high.add(g);
   const bark=material(0x82765f),leaf=material([0x6e8967,0x78916c,0x647f61,0x819773][seed%4]);
   for(const m of [bark,leaf]){m.transparent=true;m.depthWrite=false;m.side=T.DoubleSide;}
   const trunk=mesh(groveTrunkGeo,bark,0,height*.17,0,g);trunk.scale.y=height*.34;
   for(let k=0;k<6;k++){
    const a=k*2.4+seed*.7,base=new T.Vector3(0,height*.23,0),tip=new T.Vector3(Math.cos(a)*radius*.72,height*(.6+(k%3)*.08),Math.sin(a)*radius*.72),delta=tip.clone().sub(base);
    const limb=mesh(new T.CylinderGeometry(.10,.26,delta.length(),6),bark,0,0,0,g);limb.position.copy(base).add(tip).multiplyScalar(.5);limb.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());
   }
   const crowns=new T.InstancedMesh(crownGeo,leaf,7);
   for(let i=0;i<7;i++){
    const a=i*2.39996+seed*.7,r=i===0?0:radius*.64;
    grovePosition.set(Math.cos(a)*r,height*(.66+(i%3)*.055),Math.sin(a)*r);
    groveScale.set(radius*(i===0?1.12:.72),radius*(.48+(i%3)*.09),radius*(i===0?1.03:.78));
    groveMatrix.compose(grovePosition,groveRotation,groveScale);crowns.setMatrixAt(i,groveMatrix);
   }
   g.add(crowns);trees.push({object:g,mats:[bark,leaf],height:height+2,radius:radius*1.5,alpha:1,swayPhase:seed*.23,sway:.022,baseRotation:g.rotation.z});
  }
  let groveSeed=0;
  for(let row=0;row<12;row++)for(let col=0;col<8;col++) {
   const seed=groveSeed++,x=-176+col*13+(row%2)*3+Math.sin(seed*2.1)*2,z=-52+row*14+Math.cos(seed*1.7)*2;
   // Keep trunks out of the promenade, pond, memorial and pavilion clearings.
   const promenadeDistance=Math.abs(Math.hypot((x+120)/38,(z-25)/58.9)-1);
   if(promenadeDistance<.075||Math.hypot((x+103)/25,(z-34)/20)<1||Math.hypot(x+126,z-5)<23||Math.hypot(x+147,z-64)<16)continue;
   matureParkTree(x,z,seed);
  }
  // Irregular groves with open paths, pond and memorial forecourt.
  const parkTrunks=trees.filter(t=>t.object.position.x<-54).map(t=>t.object.position.clone());
  for(let row=0;row<10;row++)for(let col=0;col<8;col++){
   const n=row*8+col,h=((n*73+29)%101)/100;
   const x=-179+col*14+Math.sin(n*2.31)*3.4,z=-49+row*17+Math.cos(n*1.73)*3.2;
   const loopRadius=Math.hypot(x+120,(z-25)/1.55);
   if(Math.abs(loopRadius-38)<5||Math.hypot((x+103)/18,(z-34)/13)<1||Math.hypot(x+126,z-5)<17)continue;
   if(parkTrunks.some(p=>Math.hypot(x-p.x,z-p.z)<8))continue;
   if(h<.13)continue;
   tree(x,z,5.6+h*3.5);parkTrunks.push(new T.Vector3(x,0,z));
  }
  const streetLife=window.CampusLife?.create(root);
  // Existing model vegetation follows the same sightline rule; architecture stays intact.
  for(const building of Object.values(app.buildingMeshes))if(building?.traverse)building.traverse(object=>{
   if(!object.userData?.isLandscape)return;
   const bounds=new T.Box3().setFromObject(object),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3()),mats=[],copies=new Map();
   object.traverse(part=>{if(!part.material)return;const clone=m=>{if(!copies.has(m)){const copy=m.clone();copy.transparent=true;copy.depthWrite=false;copies.set(m,copy);mats.push(copy);}return copies.get(m);};part.material=Array.isArray(part.material)?part.material.map(clone):clone(part.material);});
   trees.push({object,mats,height:size.y,radius:Math.max(size.x,size.z)/2,center,baseY:bounds.min.y,alpha:1,external:true,landmark:!!object.userData.landmarkFrame});
  });
  // Soft layered ridges beyond the modelled campus, not navigable terrain.
  for(let layer=0;layer<3;layer++){
   const positions=[],indices=[],segments=96,radius=1000+layer*100;
   for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2,peak=29+layer*7+22*Math.pow(.5+.5*Math.sin(a*5+layer*.9),2)+14*Math.sin(a*3+.8);const x=Math.cos(a)*radius,z=Math.sin(a)*radius;positions.push(x,-16,z,x,peak*1.25,z);if(i<segments){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}}
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();
   const ridge=new T.Mesh(geo,new T.MeshBasicMaterial({color:[0xc5d6da,0xd2dfe2,0xdde7e8][layer],side:T.DoubleSide,fog:false}));ridge.name='distant-mountain-ridge';mountains.add(ridge);
  }
  for(let i=0;i<9;i++){
   const g=new T.Group();g.name='slow-white-cloud';const a=i/9*Math.PI*2,r=430+(i%3)*40;g.position.set(Math.cos(a)*r,66+(i%3)*7,Math.sin(a)*r);
   const mat=new T.MeshBasicMaterial({color:0xfffef8,transparent:true,opacity:.66,depthWrite:false,fog:true});
   for(const[dx,dy,sz]of[[-16,0,12],[0,4,18],[18,0,11],[3,-3,15]]){const puff=mesh(new T.SphereGeometry(sz,10,7),mat,dx,dy,0,g);puff.scale.set(1,.35,.55);}
   horizon.add(g);clouds.push({object:g,origin:g.position.clone(),phase:i,mat,alpha:.66});
  }
  for(let i=0;i<3;i++){
   const silhouette=new T.Shape();silhouette.moveTo(-4.8,1.35);silhouette.quadraticCurveTo(-3.5,.35,-2.5,-.65);silhouette.lineTo(-.95,-.25);silhouette.lineTo(0,-.85);silhouette.lineTo(.95,-.25);silhouette.lineTo(2.5,-.65);silhouette.quadraticCurveTo(3.5,.35,4.8,1.35);silhouette.lineTo(1.75,.45);silhouette.lineTo(0,.05);silhouette.lineTo(-1.75,.45);silhouette.closePath();
   const mat=new T.MeshBasicMaterial({color:0x465b64,side:T.DoubleSide,transparent:true,opacity:.96,depthTest:false,depthWrite:false});const bird=new T.Mesh(new T.ShapeGeometry(silhouette),mat);bird.name='distant-bird';bird.renderOrder=10;horizon.add(bird);birds.push({object:bird,mat,phase:i*2.1,alpha:.96});
  }
  const sky=document.createElement('canvas');sky.width=8;sky.height=256;const context=sky.getContext('2d'),gradient=context.createLinearGradient(0,0,0,256);gradient.addColorStop(0,'#cfe4ee');gradient.addColorStop(.6,'#e3edf0');gradient.addColorStop(1,'#e2eadb');context.fillStyle=gradient;context.fillRect(0,0,8,256);
  const skyTexture=new T.CanvasTexture(sky),originalBackground=app.scene.background,originalFog=app.scene.fog?.color.clone();let overview;
  const v=new T.Vector3(),cameraPosition=new T.Vector3(),birdForward=new T.Vector3(),birdRight=new T.Vector3(),birdUp=new T.Vector3(),birdCenter=new T.Vector3();
  function rect(x,y,z,w,h,d){let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;for(const dx of [-1,1])for(const dy of [0,1])for(const dz of [-1,1]){v.set(x+dx*w/2,y+dy*h,z+dz*d/2).project(app.camera);if(v.z<-1||v.z>1)continue;left=Math.min(left,v.x);right=Math.max(right,v.x);top=Math.min(top,v.y);bottom=Math.max(bottom,v.y);}return{left,right,top,bottom};}
  const overlap=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
  function update(time,delta){
   const inWard=(!!app.selectedFloor&&app.selectedFloor!=='all')||app.xrayMode;const isOverview=!inWard;
   if(overview!==isOverview){overview=isOverview;root.visible=isOverview;app.scene.background=isOverview?skyTexture:originalBackground;if(app.scene.fog&&originalFog)app.scene.fog.color.copy(isOverview?new T.Color(0xdde8e7):originalFog);}
   if(!isOverview){for(const t of trees)if(t.external)t.object.visible=false;if(verify)document.body.dataset.gardenStatus=JSON.stringify({visible:false,floor:app.selectedFloor});return;}
   app.camera.updateMatrixWorld();cameraPosition.copy(app.camera.position);mountains.position.set(cameraPosition.x,0,cameraPosition.z);
   streetLife?.update(time,delta,reduceMotion);
   const protectedAreas=buildings.filter(b=>app.buildingMeshes[b.id]?.visible!==false).map(b=>({id:b.id,box:rect(b.position.x,0,b.position.z,b.dimensions.width+3,b.height||b.floors*b.floorHeight||18,b.dimensions.depth+3),landmarkBox:b.id==='W01_LOBBY'?rect(b.position.x,0,b.position.z+b.dimensions.depth/2+2,20,17,12):null,distance:Math.hypot(cameraPosition.x-b.position.x,cameraPosition.z-b.position.z)}));
   const blocked=t=>{const p=t.center||t.object.position,a=rect(p.x,t.baseY||0,p.z,t.radius*2,t.height,t.radius*2),distance=cameraPosition.distanceTo(p);return protectedAreas.some(b=>(!t.landmark||b.id==='W01_LOBBY')&&distance<b.distance+20&&overlap(a,t.landmark?b.landmarkBox:b.box));};
   for(const t of trees){if(t.sway!==undefined){const wind=reduceMotion?0:Math.sin(time*.65+t.swayPhase);t.object.rotation.z=t.baseRotation+wind*t.sway;t.object.rotation.x=reduceMotion?0:Math.cos(time*.52+t.swayPhase)*t.sway*.45;}const hidden=blocked(t);t.alpha=T.MathUtils.lerp(t.alpha,hidden?0:1,Math.min(1,delta*7));t.mats.forEach(m=>m.opacity=t.alpha);t.object.visible=t.alpha>.015;}
   for(const c of clouds){const wind=reduceMotion?0:time*.003;c.object.position.set(c.origin.x+Math.sin(wind+c.phase)*8,c.origin.y+(reduceMotion?0:Math.sin(time*.28+c.phase)*1.2),c.origin.z+Math.cos(wind+c.phase)*5);const p=c.object.position,hidden=protectedAreas.some(b=>overlap(rect(p.x,p.y-12,p.z,100,28,35),b.box));c.alpha=T.MathUtils.lerp(c.alpha,hidden?0:.66,Math.min(1,delta*6));c.mat.opacity=c.alpha;}
   app.camera.getWorldDirection(birdForward);birdRight.set(1,0,0).applyQuaternion(app.camera.quaternion);birdUp.set(0,1,0).applyQuaternion(app.camera.quaternion);
   birdCenter.copy(cameraPosition).addScaledVector(birdForward,160).addScaledVector(birdUp,43);
   for(const b of birds){b.object.visible=!reduceMotion;const drift=Math.sin(time*.075+b.phase)*32,lift=Math.cos(time*.075+b.phase)*3;b.object.position.copy(birdCenter).addScaledVector(birdRight,drift).addScaledVector(birdUp,lift);b.object.rotation.copy(app.camera.rotation);const obscures=app.immersionEnvironment?.blocksSkyObject(b.object);b.object.visible=!reduceMotion&&!obscures;b.mat.opacity=reduceMotion||obscures?0:.96;}
   if(verify)document.body.dataset.gardenStatus=JSON.stringify({visible:true,flowerbeds:low.children.filter(o=>o.name==='low-flowerbed').length,benches:low.children.filter(o=>o.name==='garden-bench').length,trees:trees.length,landmarkTrees:trees.filter(t=>t.landmark).length,visibleLandmarkTrees:trees.filter(t=>t.landmark&&t.object.visible).length,visibleTrees:trees.filter(t=>t.alpha>.05).length,treeTypes:[...new Set(trees.map(t=>t.object.userData.treeType).filter(Boolean))],clouds:clouds.length,birds:birds.length,blockingTrees:trees.filter(t=>t.alpha>.05&&blocked(t)).length,streetLife:streetLife?.root.userData.status});
  }
  // Expose compact status for visual QA without adding controls or labels to the map.
  return {root,low,high,horizon,update,setReducedMotion(value){reduceMotion=!!value;},getStatus(){return{visible:root.visible,flowerbeds:low.children.filter(o=>o.name==='low-flowerbed').length,benches:low.children.filter(o=>o.name==='garden-bench').length,trees:trees.length,landmarkTrees:trees.filter(t=>t.landmark).length,visibleLandmarkTrees:trees.filter(t=>t.landmark&&t.object.visible).length,visibleTrees:trees.filter(t=>t.object.visible).length,clouds:clouds.length,birds:birds.length};}};
 }};
})();
