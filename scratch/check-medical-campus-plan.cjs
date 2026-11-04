const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),T=require('../libs/three.min.js');
const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
const body={dataset:{}},document={body,createElement:()=>({getContext:()=>ctx}),querySelectorAll:()=>[],getElementById:()=>null};
const sandbox={THREE:T,document,location:{search:'?verifyImmersion=1'},URLSearchParams,console,addEventListener(){},matchMedia:()=>({matches:true,addEventListener(){}})};sandbox.window=sandbox;vm.createContext(sandbox);
for(const p of ['js/data/campus-data.js','js/building-models.js','js/campus-medical.js','js/campus-immersion.js','js/app.js'])vm.runInContext(fs.readFileSync(p,'utf8'),sandbox,{filename:p});
const app=sandbox.campusApp;app.scene=new T.Scene();app.buildingMeshes={};app.createGround();
app.camera=new T.PerspectiveCamera(45,1,.1,2000);app.camera.position.set(0,150,300);app.camera.lookAt(0,0,0);
app.renderer={info:{render:{frame:1}},domElement:{getBoundingClientRect:()=>({left:0,top:0,width:1280,height:720})}};
const env=sandbox.CampusImmersion.create(app),root=env.root;
function bounds(object){object.updateWorldMatrix(true,true);const out=new T.Box3(),m=new T.Matrix4();object.traverse(o=>{if(!o.isMesh)return;o.geometry.computeBoundingBox();if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);out.union(o.geometry.boundingBox.clone().applyMatrix4(m).applyMatrix4(o.matrixWorld));}}else out.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld));});return out;}
const b=app.campusData.buildings.find(b=>b.id==='E01_MAIN'),east=bounds(sandbox.CampusBuildingModels.build(b)),wardSouth=b.position.z+b.dimensions.depth/2;
const college=root.getObjectByName('city-ntu-college-of-medicine'),research=root.getObjectByName('city-east-medical-research'),convention=root.getObjectByName('city-convention-medical-research'),museum=root.getObjectByName('college-building-2-medical-humanities'),entrance=root.getObjectByName('college-hospital-entrance');
const cb=bounds(college),rb=bounds(research.getObjectByName('clinical-research-block')),vb=bounds(convention),mb=bounds(museum),eb=bounds(entrance);
assert(cb.min.z>wardSouth&&cb.min.z-wardSouth<3,'College must be just SOUTH of South ward');
assert(eb.min.z-wardSouth>0&&eb.min.z-wardSouth<3,'College entrance must be near South ward');
assert(mb.max.x<eb.min.x,'Building No. 2 is WEST of college entrance');
assert(mb.max.y<11&&cb.max.y>53,'Two-storey museum vs fifteen-storey basic medical slab');
assert(cb.getSize(new T.Vector3()).x/cb.getSize(new T.Vector3()).z>3,'Basic medical is a narrow east-west slab');
assert(rb.min.x>east.max.x&&rb.min.x-east.max.x<3,'Clinical research joins rear of hospital');
assert(vb.min.x>rb.max.x,'Convention research is a separate building farther east');
const roadBounds=bounds(app.scene.getObjectByName('xuzhou-north-carriageway'));
assert(roadBounds.max.z<b.position.z-b.dimensions.depth/2,'Xuzhou Road is north of hospital');
const renai=bounds(app.scene.getObjectByName('renai-carriageway'));renai.min.y=-1;renai.max.y=100;
const grounds=bounds(root.getObjectByName('medical-south-forecourt'));
assert(!grounds.intersectsBox(renai),'Forecourt, trees and fence stay inside campus');
assert(renai.min.z-mb.max.z>=10,'Museum must have a visible courtyard setback from Renai');
assert(renai.min.z-cb.max.z>=10,'College must remain inside campus, not on Renai');
const gate=app.campusData.buildings.find(b=>b.id==='JINGFU_GATE');
assert(Math.abs(gate.position.z-(138.9+app.campusData.sceneLayout.southernRoadOffset))<1e-6,'Gate and roundabout must share southern alignment');
for(const q of [cb,rb,vb,mb,eb]){assert(!q.intersectsBox(roadBounds),'Medical context crosses Xuzhou');assert(!q.intersectsBox(renai),'Medical context crosses Renai');}
for(const [a,c]of [[cb,mb],[cb,rb],[cb,vb],[rb,vb]])assert(!a.intersectsBox(c),'Separate buildings overlap');
env.update(0,0);assert(root.visible);
for(const mode of ['ward','xray']){app.selectedFloor=mode==='ward'?'5F':'all';app.xrayMode=mode==='xray';env.update(1,0);assert(!root.visible);}
app.selectedFloor='all';app.xrayMode=false;env.update(3,0);assert(root.visible);
const report={source:'official campus plan / hospital 1F plan / annotated aerial',dimensionsAreSurveyed:false,hospitalSouth:wardSouth,entranceClearance:eb.min.z-wardSouth,collegeClearance:cb.min.z-wardSouth,college:{min:cb.min,max:cb.max},museum:{min:mb.min,max:mb.max},clinicalResearch:{min:rb.min,max:rb.max},convention:{min:vb.min,max:vb.max},xuzhou:{min:roadBounds.min,max:roadBounds.max},roadsClear:true,hiddenInWardAndXray:true};fs.writeFileSync('scratch/medical-campus-plan-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
