/* Ambient city impressions, not surveyed navigation or live aviation data.
 Sources: president.gov.tw/Page/91; travel.taipei/zh-tw/attraction/details/31;
 skm.com.tw/branch/2/1111. Positions and façade detail are illustrative. */
(function(){const T=window.THREE;window.CampusImmersion={create(app){
 const root=new T.Group();root.name='campus-immersion';app.scene.add(root);const city=new T.Group(),air=new T.Group();root.add(city,air);
 const motionQuery=window.matchMedia?.('(prefers-reduced-motion: reduce)'),reduced=motionQuery?.matches,verify=new URLSearchParams(location.search).has('verifyImmersion');
 let quiet=!!reduced,now=0,flyStart=-100,flightStart=-100,nextBird=4,nextFlight=14,pose=null,mode=null;
 const mat=(color)=>new T.MeshStandardMaterial({color,roughness:.9});const cream=mat(0xe6dbca),brick=mat(0xb97c72),glass=mat(0x9caeb1),stone=mat(0xbfc7be),leaf=mat(0x94a68e),wood=mat(0x88775f);
 function box(parent,w,h,d,m,x,y,z){const q=new T.Mesh(new T.BoxGeometry(w,h,d),m);q.position.set(x,y,z);parent.add(q);return q;}
 function cylinder(parent,r,h,m,x,y,z){const q=new T.Mesh(new T.CylinderGeometry(r,r,h,12),m);q.position.set(x,y,z);parent.add(q);return q;}

 const palace=new T.Group();palace.name='city-presidential-office';palace.position.set(-425,0,135);city.add(palace);
 box(palace,85,24,140,brick,0,12,0);box(palace,85,2,142,cream,0,25,0);for(const y of [5,10,15,20])box(palace,86,.75,141,cream,0,y,0);
 // East-facing frontage: central tower, light stone bands, symmetric side towers.
 box(palace,21,55,19,brick,43,27.5,0);box(palace,23,3,21,cream,43,55,0);box(palace,16,4,15,cream,43,59,0);
 for(const z of [-61,61]){box(palace,19,30,19,brick,38,15,z);box(palace,21,2,21,cream,38,31,z);}
 for(let z=-52;z<=52;z+=9)for(const y of [6,13,20])box(palace,.5,3.8,2.8,glass,43.1,y,z);
 for(const z of [-5,0,5])box(palace,3,11,1.1,cream,55,5.5,z);
 for(const z of [-8.8,8.8])box(palace,1.5,50,1.4,cream,53.7,28,z);
 for(const y of [18,27,36,45]){box(palace,.5,6,4,glass,54, y,0);box(palace,22,.65,20,cream,43,y-4,0);}
 box(palace,68,1.2,116,mat(0x89918a),-4,26,0);box(palace,8,1.4,19,cream,56,11,0);box(palace,.5,9,11,glass,54.1,5,0);
 const cap=new T.Mesh(new T.ConeGeometry(11,3,4),mat(0x8b948a));cap.position.set(43,63,0);cap.rotation.y=Math.PI/4;palace.add(cap);
 const tower=new T.Group();tower.name='city-shinkong-tower';tower.position.set(-140,0,-650);city.add(tower);
 box(tower,65,38,55,mat(0xbca5a3),0,19,0);box(tower,43,177,40,mat(0xb5a3a5),0,126.5,0);
 box(tower,38,16,35,cream,0,223,0);box(tower,28,8,26,glass,0,235,0);cylinder(tower,3,6,cream,0,242,0);
 for(let y=43;y<211;y+=5){box(tower,43.3,.55,40.3,glass,0,y,0);}for(const x of [-16,-8,0,8,16])box(tower,.8,169,.4,cream,x,126,20.3);
 // Southeast of the hospital: a distant, simplified orientation landmark.
 // White walls / blue octagonal roof: travel.taipei/zh-tw/attraction/details/23.
 const cks=new T.Group();cks.name='city-chiang-kai-shek-memorial';cks.position.set(330,0,570);cks.rotation.y=-Math.PI*3/4;city.add(cks);
 const memorialWhite=mat(0xe6e4da),memorialBlue=mat(0x65768e),memorialStone=mat(0xc8c8bd),doorBronze=mat(0x58625c);
 box(cks,136,.25,180,memorialStone,0,.12,92);
 for(let i=0;i<3;i++)box(cks,70-i*6,3.2,70-i*6,memorialWhite,0,1.6+i*3.2,0);
 box(cks,50,30,50,memorialWhite,0,24.6,0);
 box(cks,54,2.4,54,memorialWhite,0,40.8,0);
 const lowerRoof=new T.Mesh(new T.CylinderGeometry(33,40,6,8),memorialBlue);lowerRoof.position.y=45;cks.add(lowerRoof);
 const upperRoof=new T.Mesh(new T.ConeGeometry(35,20,8),memorialBlue);upperRoof.position.y=57;cks.add(upperRoof);
 cylinder(cks,1,3,mat(0xb9ad88),0,68.5,0);
 const doorway=new T.Shape();doorway.moveTo(-7,0);doorway.lineTo(7,0);doorway.lineTo(7,13);doorway.absarc(0,13,7,0,Math.PI,false);doorway.lineTo(-7,0);
 const door=new T.Mesh(new T.ShapeGeometry(doorway),doorBronze);door.position.set(0,9.7,25.15);cks.add(door);
 for(let i=0;i<10;i++)box(cks,34,1,2,memorialWhite,0,9.3-i*.9,26+i*1.8);
 // Forecourt edge trees establish ground contact without billboard labels.
 for(const x of [-75,75])for(let i=0;i<8;i++){
  cylinder(cks,.32,7,wood,x,3.5,18+i*22);
  const crown=new T.Mesh(new T.SphereGeometry(5.5,8,6),leaf);crown.position.set(x,9,18+i*22);crown.scale.y=.75;cks.add(crown);
 }
 const park=new T.Group();park.name='city-228-park';city.add(park);
 const pond=new T.Mesh(new T.CircleGeometry(12,36),new T.MeshStandardMaterial({color:0xb1cfd0,roughness:.5}));pond.rotation.x=-Math.PI/2;pond.scale.y=.65;pond.position.set(-103,.14,34);park.add(pond);
 // Small landscaped cascade on the pond shore; location is illustrative.
 const cascade=new T.Group();cascade.name='park-small-waterfall';cascade.position.set(-108,0,27);park.add(cascade);
 const rockMat=mat(0x8c9384),rockGeo=new T.DodecahedronGeometry(1,0);
 for(let i=0;i<12;i++){const rock=new T.Mesh(rockGeo,rockMat);rock.position.set((i%4-1.5)*1.7,1+(i%3)*.8,-.9-Math.floor(i/4)*.7);rock.scale.set(1.4+(i%2)*.4,1.1+(i%3)*.3,1.1);rock.rotation.set(i*.7,i*.9,.3*i);cascade.add(rock);}
 const waterCanvas=document.createElement('canvas');waterCanvas.width=128;waterCanvas.height=256;const wc=waterCanvas.getContext('2d');
 wc.fillStyle='#a7d4d5';wc.fillRect(0,0,128,256);
 for(let i=0;i<48;i++){wc.fillStyle=i%3?'rgba(241,255,250,.5)':'rgba(255,255,255,.8)';wc.fillRect((i*41)%128,(i*73)%256,1+i%3,14+i%29);}
 const waterTexture=new T.CanvasTexture(waterCanvas);waterTexture.wrapS=waterTexture.wrapT=T.RepeatWrapping;
 const waterGeo=new T.BufferGeometry(),wp=[],uv=[],wi=[];
 for(let i=0;i<=16;i++){const t=i/16,y=3.5*(1-t)+.22,z=.15+2.6*t*t;wp.push(-2.3,y,z,2.3,y,z);uv.push(0,t*2,1,t*2);if(i<16){const k=i*2;wi.push(k,k+2,k+1,k+1,k+2,k+3);}}
 waterGeo.setAttribute('position',new T.Float32BufferAttribute(wp,3));waterGeo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));waterGeo.setIndex(wi);waterGeo.computeVertexNormals();
 const sheet=new T.Mesh(waterGeo,new T.MeshStandardMaterial({map:waterTexture,color:0xc6e8e5,roughness:.3,transparent:true,opacity:.85,side:T.DoubleSide,depthWrite:false}));cascade.add(sheet);
 const spray=new T.InstancedMesh(new T.SphereGeometry(.07,5,4),new T.MeshBasicMaterial({color:0xf1fffa,transparent:true,opacity:.7,depthWrite:false}),48);cascade.add(spray);const sprayPose=new T.Object3D();
 const ripples=[];
 for(let i=0;i<4;i++){const r=new T.Mesh(new T.RingGeometry(.93,1,32),new T.MeshBasicMaterial({color:0xe7f8ec,transparent:true,opacity:.5,side:T.DoubleSide,depthWrite:false}));r.rotation.x=-Math.PI/2;r.position.set(0,.24+i*.007,2.8);cascade.add(r);ripples.push(r);}
 let waterPhase=0;
 function updateWater(time){
  waterPhase=quiet?0:time;waterTexture.offset.y=-waterPhase*.65;
  for(let i=0;i<48;i++){const t=(waterPhase*.8+i*.618)%1;const x=(i%13/12-.5)*4.7;sprayPose.position.set(x+(t-.5)*.2,.3+Math.sin(t*Math.PI)*(.35+(i%4)*.12),2.6+t*.95);sprayPose.scale.set(.7,1.2,.7);sprayPose.updateMatrix();spray.setMatrixAt(i,sprayPose.matrix);}spray.instanceMatrix.needsUpdate=true;
  ripples.forEach((r,i)=>{const t=(waterPhase*.5+i/4)%1;r.scale.set(1+t*3,.45+t*1.2,1);r.material.opacity=(1-t)*.4;});
 }
 // Four stone piers and a circular centre evoke the peace memorial, at reduced detail.
 const memorial=new T.Group();memorial.position.set(-126,.15,5);park.add(memorial);cylinder(memorial,10,.35,stone,0,.18,0);
 for(const[x,z]of[[-3,-3],[3,-3],[-3,3],[3,3]])box(memorial,2,10,2,stone,x,5,z);
 const ring=new T.Mesh(new T.TorusGeometry(3.1,.75,8,24),stone);ring.position.set(0,8,0);memorial.add(ring);
 const pavilion=new T.Group();pavilion.position.set(-147,.1,64);park.add(pavilion);cylinder(pavilion,5,.3,stone,0,.15,0);
 for(let i=0;i<6;i++){const a=i*Math.PI/3;cylinder(pavilion,.18,4,wood,Math.cos(a)*3.6,2,Math.sin(a)*3.6);}const roof=new T.Mesh(new T.ConeGeometry(5.6,2,6),mat(0x7c9d91));roof.position.y=5;pavilion.add(roof);
 // College campus east of the hospital, north of Renai Road. Photo-led,
 // simplified massing, not a surveyed floor plan: mc.ntu.edu.tw/ntucm/Index.action;
 // tcmb.culture.tw historic record 19980325000002 (old college arcade).
 const college=new T.Group();college.name='city-ntu-college-of-medicine';college.position.set(163,0,78);college.scale.setScalar(.75);city.add(college);
 const collegeWall=mat(0xcbbb9d),collegeTrim=mat(0xe0d5bd),collegeGlass=mat(0x798d91),collegeRoof=mat(0x92958a);
 const collegeWindows=[],windowPose=new T.Object3D();
 function collegeBlock(w,h,d,x,z){
  box(college,w,h,d,collegeWall,x,h/2,z);box(college,w+.5,.65,d+.5,collegeTrim,x,h+.15,z);
  for(let y=5;y<h-2;y+=3.4){
   for(let xx=-w/2+2.5;xx<w/2-1;xx+=4.3)for(const side of [-1,1])collegeWindows.push([x+xx,y,z+side*(d/2+.03),0]);
   for(let zz=-d/2+2.5;zz<d/2-1;zz+=4.3)for(const side of [-1,1])collegeWindows.push([x+side*(w/2+.03),y,z+zz,Math.PI/2]);
  }
 }
 collegeBlock(34,43,45,-18,-6);collegeBlock(34,47,52,18,-2.5);
 box(college,70,7,16,collegeWall,0,3.5,22);box(college,71,.7,17,collegeTrim,0,7.2,22);
 for(let x=-30;x<=30;x+=4.3)collegeWindows.push([x,3.6,30.04,0]);
 const collegeGlazing=new T.InstancedMesh(new T.PlaneGeometry(2.5,1.75),collegeGlass,collegeWindows.length);collegeGlazing.name='college-grid-windows';
 collegeWindows.forEach(([x,y,z,rotation],i)=>{windowPose.position.set(x,y,z);windowPose.rotation.set(0,rotation,0);windowPose.updateMatrix();collegeGlazing.setMatrixAt(i,windowPose.matrix);});
 collegeGlazing.material.side=T.DoubleSide;college.add(collegeGlazing);
 // Old school wing, on the southwest corner: cream pilasters, arched openings,
 // a restrained slate-coloured hipped roof and a small central entrance.
 const oldCollege=new T.Group();oldCollege.name='college-old-school-wing';oldCollege.position.set(4,0,38);college.add(oldCollege);
 box(oldCollege,36,8,15,collegeWall,0,4,0);box(oldCollege,37,.6,16,collegeTrim,0,8,0);
 const hipGeo=new T.CylinderGeometry(.68,1,3,4);hipGeo.rotateY(Math.PI/4);hipGeo.scale(26,1,12);
 const hip=new T.Mesh(hipGeo,collegeRoof);hip.position.y=9.7;oldCollege.add(hip);
 const arch=new T.Shape();arch.moveTo(-1.25,0);arch.lineTo(1.25,0);arch.lineTo(1.25,2.7);arch.absarc(0,2.7,1.25,0,Math.PI,false);arch.lineTo(-1.25,0);
 const archGeo=new T.ShapeGeometry(arch);
 for(let x=-15;x<=15;x+=5){const a=new T.Mesh(archGeo,collegeGlass);a.position.set(x,.5,7.54);oldCollege.add(a);box(oldCollege,.45,7.3,.5,collegeTrim,x-2.2,4,7.65);box(oldCollege,2.7,1.6,.1,collegeGlass,x,6.2,7.56);}
 box(oldCollege,7,.6,3,collegeTrim,0,4.8,8.6);for(const x of [-2.8,2.8])cylinder(oldCollege,.23,4.5,collegeTrim,x,2.25,9.5);
 // Low planting frames the frontage without hiding the arcade or spanning roads.
 for(const x of [40])for(const z of [-20,18]){cylinder(college,.22,5,wood,x,2.5,z);const crown=new T.Mesh(new T.SphereGeometry(3.8,8,6),leaf);crown.position.set(x,6.5,z);crown.scale.y=.8;college.add(crown);}
 // The research block belongs beside the East hospital, rather than leaving
 // an empty lawn between the hospital and college (ntu.edu.tw/about/map/B_03_A.pdf).
 // Overall scene scale is schematic; this block has no invented ward plans.
 const research=new T.Group();research.name='city-east-medical-research';research.position.set(123,0,72);city.add(research);
 const researchWall=mat(0xcab895),researchTrim=mat(0xdcd0b8),researchGlass=mat(0x839498);
 box(research,22,37,52,researchWall,0,18.5,0);box(research,23,.7,53,researchTrim,0,37.3,0);
 box(research,22,4,52,researchTrim,0,2,0);
 const researchWindows=[],researchPose=new T.Object3D();
 for(let y=6;y<36;y+=3.4){
  for(let z=-22;z<=22;z+=4.4)for(const side of [-1,1])researchWindows.push([side*11.04,y,z,Math.PI/2]);
  for(let x=-7.5;x<=7.5;x+=5)for(const side of [-1,1])researchWindows.push([x,y,side*26.04,0]);
 }
 const researchGlazing=new T.InstancedMesh(new T.PlaneGeometry(2.8,1.9),researchGlass,researchWindows.length);researchGlazing.name='research-grid-windows';researchGlass.side=T.DoubleSide;
 researchWindows.forEach(([x,y,z,r],i)=>{researchPose.position.set(x,y,z);researchPose.rotation.set(0,r,0);researchPose.updateMatrix();researchGlazing.setMatrixAt(i,researchPose.matrix);});research.add(researchGlazing);
 const landmarks={palace:{object:palace},park:{object:park},tower:{object:tower},cks:{object:cks},college:{object:college},research:{object:research}};
 // Warm entrance lights are overview-only and do not alter ward lighting.
 const childBuilding=app.campusData.buildings.find(b=>b.id==='CHILD_HOSPITAL'),childPosition=childBuilding?.position||{x:-4,z:-56};
 for(const[x,y,z]of[[-8.9,4,68],[50,4,70.8],[childPosition.x+(childBuilding?.dimensions.width||38)/2+1.8,3,childPosition.z]]){const light=new T.PointLight(0xffd9a4,.32,15,2);light.position.set(x,y,z);root.add(light);}
 const glowCanvas=document.createElement('canvas');glowCanvas.width=128;glowCanvas.height=128;const gc=glowCanvas.getContext('2d'),gr=gc.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,243,202,.45)');gr.addColorStop(.25,'rgba(255,229,160,.16)');gr.addColorStop(1,'rgba(255,239,199,0)');gc.fillStyle=gr;gc.fillRect(0,0,128,128);
 const sun=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(glowCanvas),transparent:true,depthWrite:false,opacity:.5,fog:false}));sun.name='soft-sun-halo';sun.scale.set(80,80,1);air.add(sun);
 const originalSun=app.sunLight?.color.clone();
 const swoop=new T.Group();swoop.name='near-view-birds';air.add(swoop);const nearBirds=[];
 for(let i=0;i<2;i++){const geo=new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3(-.9,.3,0),new T.Vector3(-.35,.05,0),new T.Vector3(),new T.Vector3(.9,.3,0),new T.Vector3(.35,.05,0),new T.Vector3(0,.06,0),new T.Vector3(-.07,-.18,0),new T.Vector3(.07,-.18,0)]);const q=new T.Mesh(geo,new T.MeshBasicMaterial({color:0x344c58,side:T.DoubleSide,transparent:true,opacity:0,depthWrite:false,fog:false}));q.scale.setScalar(1.45);swoop.add(q);nearBirds.push(q);}
 const flight=new T.Group();flight.name='ceremonial-flag-helicopter';flight.scale.setScalar(.8);air.add(flight);const rotorMaterial=new T.MeshBasicMaterial({color:0x65736b,transparent:true,opacity:.65,side:T.DoubleSide,depthWrite:false});
 box(flight,14,3.5,3.6,mat(0x879184),0,0,0);box(flight,3,2,3,glass,6,0,0);const rotors=[];
 for(const x of [-4.5,4.5]){box(flight,1,1.6,1,wood,x,2.2,0);const r=box(flight,13,.08,.38,rotorMaterial,x,3.1,0);rotors.push(r);}
 for(const z of [-11,11]){const escort=new T.Group();escort.position.set(-14,1,z);flight.add(escort);box(escort,6,1.6,1.7,mat(0x8b958b),0,0,0);box(escort,3,.5,.5,wood,-4,0,0);const r=box(escort,8,.06,.22,rotorMaterial,0,1.5,0);rotors.push(r);}
 const rope=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(0,-2,0),new T.Vector3(0,-10,0)]),new T.LineBasicMaterial({color:0x89928e}));flight.add(rope);
 const flagCanvas=document.createElement('canvas');flagCanvas.width=240;flagCanvas.height=160;const fc=flagCanvas.getContext('2d');fc.fillStyle='#d03438';fc.fillRect(0,0,240,160);fc.fillStyle='#20478c';fc.fillRect(0,0,120,80);fc.fillStyle='#fff';fc.beginPath();for(let i=0;i<24;i++){const a=i*Math.PI/12-Math.PI/2,r=i%2?15:28,x=60+Math.cos(a)*r,y=40+Math.sin(a)*r;i?fc.lineTo(x,y):fc.moveTo(x,y);}fc.closePath();fc.fill();fc.beginPath();fc.arc(60,40,14,0,Math.PI*2);fc.fill();
 const flag=new T.Mesh(new T.PlaneGeometry(14,9.3,12,6),new T.MeshBasicMaterial({map:new T.CanvasTexture(flagCanvas),side:T.DoubleSide,transparent:true,depthWrite:false}));flag.position.set(0,-14.5,0);flight.add(flag);flight.traverse(o=>{if(o.material){for(const m of (Array.isArray(o.material)?o.material:[o.material]))m.fog=false;}});const flagBase=flag.geometry.attributes.position.array.slice();
 const cameraRight=new T.Vector3(),cameraUp=new T.Vector3(),forward=new T.Vector3(),v=new T.Vector3();
 function startBird(preview=false){if(quiet)return;flyStart=now-(preview?3.6:0);pose={position:app.camera.position.clone(),quaternion:app.camera.quaternion.clone()};nextBird=now+28;}
 function startFlight(){if(quiet)return;flightStart=now;nextFlight=now+65;}
 // Ambient scenery has no menu, billboard labels or camera jumps.
 function motionPreference(){app.gardenEnvironment?.setReducedMotion(quiet);if(quiet){flyStart=flightStart=-100;}else{nextBird=now+4;nextFlight=now+14;}}
 motionQuery?.addEventListener?.('change',event=>{quiet=event.matches;motionPreference();});motionPreference();
 if(verify){const preview=new URLSearchParams(location.search).get('previewSky');if(preview==='birds')nextBird=2;if(preview==='flight')nextFlight=2;}
 const crownMotion=(app.gardenEnvironment?.high.children||[]).flatMap(g=>g.children.filter(c=>c.geometry?.type==='SphereGeometry').map(c=>({object:c,z:c.rotation.z})));
 function projectBox(x,y,z,w,h,d){let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;for(const dx of [-1,1])for(const dy of [0,1])for(const dz of [-1,1]){v.set(x+dx*w/2,y+dy*h,z+dz*d/2).project(app.camera);if(v.z< -1||v.z>1)continue;left=Math.min(left,v.x);right=Math.max(right,v.x);top=Math.min(top,v.y);bottom=Math.max(bottom,v.y);}return{left,right,top,bottom};}
 const overlaps=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
 const protectedBuildings=app.campusData.buildings.filter(b=>b.id!=='JINGFU_TUNNEL').map(b=>{
  const object=app.buildingMeshes[b.id];let bounds;
  if(object?.isObject3D){object.updateWorldMatrix(true,true);bounds=new T.Box3().setFromObject(object);}
  if(!bounds||bounds.isEmpty())bounds=new T.Box3(new T.Vector3(b.position.x-b.dimensions.width/2,0,b.position.z-b.dimensions.depth/2),new T.Vector3(b.position.x+b.dimensions.width/2,b.exteriorDisplayHeight||b.height,b.position.z+b.dimensions.depth/2));
  return{id:b.id,object,bounds};
 });
 for(const object of [palace,tower,cks,college,research]){object.updateWorldMatrix(true,true);protectedBuildings.push({id:object.name,object,bounds:new T.Box3().setFromObject(object)});}
 let protectedFrame=-1,protectedCache=[];
 function protectedBoxes(){
  const result=protectedBuildings.filter(b=>b.object?.visible!==false).map(({bounds})=>{const c=bounds.getCenter(new T.Vector3()),s=bounds.getSize(new T.Vector3());return projectBox(c.x,bounds.min.y,c.z,s.x,s.y,s.z);});
  const canvas=app.renderer.domElement.getBoundingClientRect();
  const controls=new Set(document.querySelectorAll('#top-navbar,#right-panel,#timeline-header-bar,#orientation-joystick-dock,#orientation-controls,button,[role="button"],input,select'));
  for(const el of controls){if(!el.getClientRects().length)continue;const r=el.getBoundingClientRect();result.push({left:(r.left-canvas.left)/canvas.width*2-1,right:(r.right-canvas.left)/canvas.width*2-1,top:1-(r.bottom-canvas.top)/canvas.height*2,bottom:1-(r.top-canvas.top)/canvas.height*2});}
  const padX=20/canvas.width,padY=20/canvas.height;
  return result.map(q=>({left:q.left-padX,right:q.right+padX,top:q.top-padY,bottom:q.bottom+padY}));
 }
 function currentProtection(){const frame=app.renderer.info.render.frame;if(frame!==protectedFrame){protectedFrame=frame;protectedCache=protectedBoxes();}return protectedCache;}
 function screenBounds(object,width,height,depth){
  if(object.isSprite){const p=object.position;return projectBox(p.x,p.y-height/2,p.z,width,height,depth);}
  object.updateWorldMatrix(true,true);const bounds=new T.Box3().setFromObject(object),size=bounds.getSize(new T.Vector3()),centre=bounds.getCenter(new T.Vector3());
  return projectBox(centre.x,bounds.min.y,centre.z,size.x,size.y,size.z);
 }
 function hideAt(object,width,height,depth,boxes){const q=screenBounds(object,width,height,depth);return boxes.some(b=>overlaps(q,b));}
 function update(time,delta){now=time;const overview=(!app.selectedFloor||app.selectedFloor==='all')&&!app.xrayMode;root.visible=overview;
  if(mode!==overview){mode=overview;if(app.sunLight&&originalSun)app.sunLight.color.copy(overview?new T.Color(0xfff1d9):originalSun);if(!overview){flyStart=flightStart=-100;}}
  if(!overview){if(verify)document.body.dataset.immersionStatus=JSON.stringify({visible:false,flight:false,flyby:false});return;}
  updateWater(time);
  app.camera.updateMatrixWorld();const boxes=currentProtection();cameraRight.setFromMatrixColumn(app.camera.matrixWorld,0);cameraUp.setFromMatrixColumn(app.camera.matrixWorld,1);forward.setFromMatrixColumn(app.camera.matrixWorld,2).negate();
  sun.position.copy(app.camera.position).addScaledVector(forward,850).addScaledVector(cameraRight,245).addScaledVector(cameraUp,200);sun.visible=!hideAt(sun,80,80,5,boxes);
  for(let i=0;i<crownMotion.length;i++){const c=crownMotion[i];c.object.rotation.z=c.z+(quiet?0:Math.sin(time*.55+i*.8)*.012);}
  if(!quiet&&time>nextBird)startBird(verify&&new URLSearchParams(location.search).get('previewSky')==='birds');if(!quiet&&time>nextFlight)startFlight();
  const bu=(time-flyStart)/12;swoop.visible=!quiet&&bu>=0&&bu<=1;
  if(swoop.visible){const right=new T.Vector3(1,0,0).applyQuaternion(pose.quaternion),up=new T.Vector3(0,1,0).applyQuaternion(pose.quaternion),ahead=new T.Vector3(0,0,-1).applyQuaternion(pose.quaternion);nearBirds.forEach((b,i)=>{b.position.copy(pose.position).addScaledVector(ahead,32+i*5).addScaledVector(right,(bu-.5)*38-i*2).addScaledVector(up,8+Math.sin(bu*Math.PI)*.5+i*.7);b.rotation.copy(app.camera.rotation);const wing=.2+Math.sin(time*3+i)*.28;b.geometry.attributes.position.setY(1,wing);b.geometry.attributes.position.setY(4,wing);b.geometry.attributes.position.needsUpdate=true;b.geometry.computeBoundingBox();b.geometry.computeBoundingSphere();const hidden=hideAt(b,2,1,1,boxes);b.material.opacity=hidden?0:Math.sin(bu*Math.PI)*.9;});}
  const fu=(time-flightStart)/30;flight.visible=!quiet&&fu>=0&&fu<=1;
  if(flight.visible){const distance=240,halfHeight=Math.tan(T.MathUtils.degToRad(app.camera.fov/2))*distance;
    flight.position.copy(app.camera.position).addScaledVector(forward,distance).addScaledVector(cameraRight,(fu*2-1)*halfHeight*app.camera.aspect*1.15).addScaledVector(cameraUp,halfHeight*.59);
    flight.quaternion.copy(app.camera.quaternion);for(const r of rotors)r.rotation.y=time*3;const a=flag.geometry.attributes.position;for(let i=0;i<a.count;i++)a.setZ(i,flagBase[i*3+2]+Math.sin(flagBase[i*3]*.6+time*1.4)*.22);a.needsUpdate=true;flag.geometry.computeBoundingBox();flight.visible=!hideAt(flight,45,32,34,boxes);}
  // Landmarks remain in world space: the camera frustum, depth and fog
  // reveal them naturally as the user turns the joystick.
  palace.visible=tower.visible=cks.visible=true;
  if(verify)document.body.dataset.immersionStatus=JSON.stringify({visible:true,quiet,waterfall:{active:!quiet,phase:waterPhase,textureOffset:waterTexture.offset.y,spray:48,ripples:4},sun:sun.visible,flyby:swoop.visible,flight:flight.visible,landmarks:Object.keys(landmarks),birdScale:1.45,flightScale:.8,guardPixels:10,nearBirds:nearBirds.filter(b=>swoop.visible&&b.material.opacity>.02).length,blockingNearBirds:nearBirds.filter(b=>swoop.visible&&b.material.opacity>.02&&hideAt(b,2,1,1,boxes)).length,blockingFlight:flight.visible&&hideAt(flight,45,32,34,boxes),birdScreens:nearBirds.map(b=>{const q=b.position.clone().project(app.camera);return{x:q.x,y:q.y,z:q.z,opacity:b.material.opacity};}),warmLights:root.children.filter(c=>c.isPointLight).length,windCrowns:crownMotion.length,flagSunRays:12});
 }
 return{root,update,blocksSkyObject(object){app.camera.updateMatrixWorld();return hideAt(object,0,0,0,currentProtection());}};
}};})();
