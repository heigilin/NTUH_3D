/* Medical-campus context, north = -Z. Footprint relationships checked against:
 * https://www.ntu.edu.tw/about/map/B_03_A.pdf (2020 campus plan)
 * https://www.ntuh.gov.tw/ntuh/Fpage.action?fid=9196&muid=8055 (East 1F plan)
 * https://ga.ntu.edu.tw/main_ch/fileRename/fileRename/2556/7600/2/1/29-MD.pdf
 * (2022 annotated aerial; Basic Medical Science Building has 15 floors).
 * No surveyed dimensions were available: footprints are proportioned to the
 * existing East model. Heights use its 3.6 m floor convention. No ward data.
 */
(function(){const T=window.THREE;
 window.CampusMedical={create(parent,data){
  const east=data.buildings.find(b=>b.id==='E01_MAIN')||{position:{x:83.7,z:70.8},dimensions:{width:64,depth:76}};
  const dx=east.position.x-83.7,dz=east.position.z-70.8;
  const material=color=>new T.MeshStandardMaterial({color,roughness:.8});
  const wall=material(0xcbb797),trim=material(0xe0d3bb),glass=material(0x829395),roof=material(0xa9a897),paving=material(0xbfc0ae);
  glass.side=T.DoubleSide;
  function group(name,x,z){const g=new T.Group();g.name=name;g.position.set(x+dx,0,z+dz);parent.add(g);return g;}
  function box(g,w,h,d,m,x,y,z,name){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.name=name||'';o.castShadow=h>2;o.receiveShadow=true;g.add(o);return o;}
  function glazing(g,w,h,d,floors,step=3.6){
   const positions=[];
   for(let f=0;f<floors;f++){
    const y=1.8+f*step;if(y>h-1)break;
    for(let x=-w/2+2;x<w/2-1;x+=3.8)for(const s of [-1,1])positions.push([x,y,s*(d/2+.035),0]);
    for(let z=-d/2+2;z<d/2-1;z+=3.8)for(const s of [-1,1])positions.push([s*(w/2+.035),y,z,Math.PI/2]);
   }
   const windows=new T.InstancedMesh(new T.PlaneGeometry(2.3,1.65),glass,positions.length),pose=new T.Object3D();windows.name=g.name+'-windows';
   positions.forEach(([x,y,z,r],i)=>{pose.position.set(x,y,z);pose.rotation.set(0,r,0);pose.updateMatrix();windows.setMatrixAt(i,pose.matrix);});g.add(windows);
  }
  // A long, narrow east-west slab SOUTH of the South ward tower, not two
  // large towers in an imaginary eastward row. Fifteen storeys, as documented.
  const college=group('city-ntu-college-of-medicine',104.5,117.75);
  const basic=new T.Group();basic.name='college-basic-volume';basic.position.z=3.25;college.add(basic);
  box(basic,47,54,7,wall,0,27,0,'college-basic-medical-science');glazing(basic,47,54,7,15);
  for(let f=1;f<=15;f++)box(basic,47.2,.18,7.2,trim,0,f*3.6,0);
  box(basic,47.5,.6,7.5,roof,0,54.3,0);
  // C lecture rooms / library occupy the shallow northern edge shown on the
  // East floor plan, linked directly to the college entrance, near South ward.
  box(college,47,7,3.8,trim,0,3.5,-5.1,'college-lecture-podium');
  box(college,47,.3,4,roof,0,7.15,-5.1);
  for(const x of [-22,22])box(college,3,7,7.4,trim,x,3.5,-.5);
  box(college,40,.12,2.6,paving,0,.06,-1.8,'college-inner-courtyard');
  const entrance=group('college-hospital-entrance',96,110.65);
  box(entrance,8.6,.12,1.8,paving,0,.06,0,'college-entrance-forecourt');
  box(entrance,6.2,4.2,.06,glass,0,2.1,.03,'college-hospital-entry-doors');
  for(const x of [-3.2,3.2])box(entrance,.36,4.5,.4,trim,x,2.25,0);
  box(entrance,7.2,.35,1.8,trim,0,4.6,-.2,'college-entrance-lintel');
  // Public door on Renai Road and the separate northward hospital connection
  // are both visible on the medical-college route plan (2023/19d23e73...pdf).
  box(basic,7.4,4.8,.08,glass,-2.5,2.4,3.56,'college-renai-entrance');
  box(basic,8,.35,1.5,trim,-2.5,5,3.8);
  box(basic,8.5,.12,1.2,paving,-2.5,.06,4.0);
  college.userData.entry=entrance.position.clone();
  // Two-storey L-shaped Medical Humanities Museum (Building No. 2), west
  // of the college entrance. Present-day arcade and pilasters, flat parapet;
  // do not reconstruct the Mansard roof lost in the 1930 fire.
  const museum=group('college-building-2-medical-humanities',61,117);
  const museumWall=material(0xe1d2ad),museumTrim=material(0xece1c5),museumBase=material(0x777b71),recess=material(0x666a5d),timber=material(0x685346);
  box(museum,6,9.1,14,museumWall,-8.5,4.55,0);
  box(museum,23,9.1,6,museumWall,0,4.55,4);
  box(museum,6.4,.38,14.4,museumTrim,-8.5,9.25,0);box(museum,23.4,.38,6.4,museumTrim,0,9.25,4);
  for(const y of [.5,4.55,8.8]){box(museum,6.2,.24,14.2,y<1?museumBase:museumTrim,-8.5,y,0);box(museum,23.2,.24,6.2,y<1?museumBase:museumTrim,0,y,4);}
  function archedShape(r,straight){const s=new T.Shape();s.moveTo(-r,0);s.lineTo(r,0);s.lineTo(r,straight);s.absarc(0,straight,r,0,Math.PI,false);s.lineTo(-r,0);return s;}
  function arcade(x,z,rotation,count,spacing,openUpper=false){
   const face=new T.Group();face.position.set(x,0,z);face.rotation.y=rotation;museum.add(face);
   for(let i=0;i<count;i++){
    const q=(i-(count-1)/2)*spacing;
    // Deep shadowed arch opening, with a raised cream archivolt and columns.
    const opening=new T.Mesh(new T.ShapeGeometry(archedShape(1.02,2.05)),recess);opening.material.side=T.DoubleSide;opening.position.set(q,.65,.12);face.add(opening);
    const arch=new T.Mesh(new T.TorusGeometry(1.13,.13,5,16,Math.PI),museumTrim);arch.position.set(q,2.7,.2);face.add(arch);
    for(const s of [-1,1])box(face,.26,2.4,.3,museumTrim,q+s*1.14,1.65,.23);
    if(openUpper){
     box(face,2.45,2.9,.08,recess,q,6.65,.13);
     box(face,2.5,.38,.28,museumTrim,q,5.35,.3);
    }else{
     const upper=new T.Mesh(new T.ShapeGeometry(archedShape(.85,1.65)),timber);upper.position.set(q,5.25,.13);face.add(upper);
     box(face,.1,2.25,.12,museumTrim,q,6.4,.23);box(face,1.75,.1,.12,museumTrim,q,6.3,.23);
    }
    for(const s of [-1,1]){box(face,.22,3.4,.28,museumTrim,q+s*1.28,6.6,.2);box(face,.4,.2,.4,museumTrim,q+s*1.28,8.25,.24);}
   }
  }
  arcade(1,1,-Math.PI,6,3.2);arcade(-5.5,-.5,Math.PI/2,4,3.1);
  arcade(0,7.02,0,6,3.2);arcade(-11.52,-.5,-Math.PI/2,4,3.1,true);
  // Central historic entrance projects toward the quiet courtyard.
  box(museum,6.4,9.3,2,museumWall,6,4.65,.1);arcade(6,-.94,Math.PI,1,3);
  for(let i=0;i<4;i++)box(museum,6.8+i*.45,.18,1,museumBase,6,.6-i*.15,-1.7-i*.6);
  // User photo 307356.jpg (Zhongshan S. Rd., near the roundabout): the
  // museum stands in front of East Hospital, INSIDE the campus. Preserve
  // a visible forecourt between these buildings and the Renai carriageway.
  // This visual setback is illustrative, not a measured property boundary.
  const grounds=group('medical-south-forecourt',90,130);
  const garden=material(0x9eae90),iron=material(0x62716a),bark=material(0x85765f),foliage=material(0x718f68),foliageLight=material(0x829b70);
  foliage.side=foliageLight.side=T.DoubleSide;
  box(grounds,84,.045,11,garden,0,.025,0,'medical-forecourt-garden');
  box(grounds,3.4,.07,11.2,paving,12,.045,0,'college-renai-walkway');
  box(grounds,20,.07,2,paving,-26,.045,-3,'museum-garden-walkway');
  for(const z of [110,112,114,116,118,120,122,124,126,128,130,132,134]){
   box(grounds,.07,1.25,.07,iron,-44.2,.7,z-130);
  }
  for(const y of [.5,1.18])box(grounds,.07,.07,24,iron,-44.2,y,-8);
  // Airy street trees: forked limbs and small pointed-leaf sprays, with no
  // overlapping spherical crowns. These are the three trees by the museum.
  const leafVertices=[];
  for(let i=0;i<9;i++){
   const a=i*Math.PI*2/9,radial=new T.Vector3(Math.cos(a),0,Math.sin(a)),side=new T.Vector3(-Math.sin(a),0,Math.cos(a));
   const root=new T.Vector3(0,0,0),mid=radial.clone().multiplyScalar(.42).add(new T.Vector3(0,.1,0)),tip=radial.clone().multiplyScalar(.82).add(new T.Vector3(0,.18,0)),halfWidth=side.multiplyScalar(.17);
   const left=mid.clone().add(halfWidth),right=mid.clone().sub(halfWidth);
   // Two non-degenerate triangles form a pointed leaf from root to tip.
   leafVertices.push(...root.toArray(),...left.toArray(),...right.toArray(),...left.toArray(),...tip.toArray(),...right.toArray());
  }
  const leafGeo=new T.BufferGeometry();leafGeo.setAttribute('position',new T.Float32BufferAttribute(leafVertices,3));leafGeo.computeVertexNormals();
  const up=new T.Vector3(0,1,0),limbGeo=new T.CylinderGeometry(.055,.12,1,5);
  for(const [x,z,index]of [[46.8,112.5,0],[46.8,127.5,1],[66,131,2]]){
   const tree=new T.Group();tree.name='museum-broadleaf-tree';tree.position.set(x-90,0,z-130);grounds.add(tree);
   const trunk=new T.Mesh(new T.CylinderGeometry(.19,.34,7,7),bark);trunk.position.y=3.5;tree.add(trunk);
   const branchMatrices=[],sprayMatrices=[],dummy=new T.Object3D();
   for(let arm=0;arm<9;arm++){
    const angle=arm*2.39996+index*.61,reach=2.4+((arm*7+index*3)%5)*.22;
    const start=new T.Vector3(0,4.2,0),end=new T.Vector3(Math.cos(angle)*reach,7.8+Math.sin(arm*1.9+index)*.65,Math.sin(angle)*reach*.82);
    const delta=end.clone().sub(start);dummy.position.copy(start).add(end).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(up,delta.clone().normalize());dummy.scale.set(1,delta.length(),1);dummy.updateMatrix();branchMatrices.push(dummy.matrix.clone());
    for(let j=0;j<3;j++){
     const t=.45+j*.22,pos=start.clone().lerp(end,t);pos.x+=Math.cos(angle+Math.PI/2)*(j%2?-.38:.38);pos.z+=Math.sin(angle+Math.PI/2)*(j%2?-.38:.38);pos.y+=.13*((arm+j+index)%3-1);
     dummy.position.copy(pos);dummy.rotation.set((j%2?-.35:.35),angle+j*2.1,(j-1)*.22);dummy.scale.set(.85,1,.85);dummy.updateMatrix();sprayMatrices.push(dummy.matrix.clone());
    }
   }
   const limbs=new T.InstancedMesh(limbGeo,bark,branchMatrices.length);branchMatrices.forEach((m,i)=>limbs.setMatrixAt(i,m));tree.add(limbs);
   const sprays=new T.InstancedMesh(leafGeo,foliage,sprayMatrices.length);sprayMatrices.forEach((m,i)=>sprays.setMatrixAt(i,m));tree.add(sprays);
   // A few brighter sprays break up the crown while keeping gaps between limbs.
   for(let i=0;i<4;i++){
    const a=i*2.39996+index*.4,cluster=new T.Mesh(leafGeo,foliageLight);cluster.position.set(Math.cos(a)*1.35,8.1+(i%2)*.45,Math.sin(a)*1.15);cluster.rotation.y=a;cluster.scale.set(.9,.9,.9);tree.add(cluster);
   }
  }
  // Clinical research is behind the ward towers, within the hospital precinct.
  const research=group('city-east-medical-research',120,72);
  box(research,18,28.8,24,wall,0,14.4,0,'clinical-research-block');glazing(research,18,28.8,24,8);
  box(research,18.5,.5,24.5,trim,0,29.05,0);
  box(research,3.8,7,5,trim,-10.5,3.5,0,'hospital-research-link');
  // Distinct from clinical research: Convention Center / Medical Research
  // Building stands farther east, as identified on the university campus map.
  const convention=group('city-convention-medical-research',145,57);
  box(convention,22,36,29,wall,0,18,0,'convention-research-block');glazing(convention,22,36,29,10);
  box(convention,22.6,.6,29.6,trim,0,36.3,0);
  box(convention,22,7.2,8,trim,0,3.6,17,'convention-podium');
  return{college,research,convention,museum,entrance,grounds};
 }};
})();
