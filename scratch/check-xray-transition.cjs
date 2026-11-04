const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),THREE=require('../libs/three.min.js');
const source=fs.readFileSync('js/app.js','utf8');
function element(){return {style:{display:'block'},classList:{add(){},remove(){},toggle(){}},remove(){this.removed=true;}};}
const nodes=new Map();
const document={getElementById(id){if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);},querySelectorAll(){return[];},body:{classList:{remove(){}}}};
const c={THREE,document,window:{innerWidth:1280,canvasWhiteboardManager:{wardModal:element()}}};vm.createContext(c);
vm.runInContext(source.slice(0,source.indexOf('\nif (window.WardPlanGeometry)'))+'\nglobalThis.TestApp=CampusApp;',c);
const results=[];
for(const id of ['E01_MAIN','CHILD_HOSPITAL','W04_WEST'])for(const mode of ['3D','2D']){
 const app=Object.create(c.TestApp.prototype);
 app.selectedBuilding=id;app.selectedFloor='4F';app.selectedWard='04D1';app.selectedRoomCode='01';
 for(const key of ['floorSliceGroup','wardLabelsGroup','infectionGroup','arcsGroup','xrayDensityGroup']){app[key]=new THREE.Group();app[key].add(new THREE.Object3D());}
 app.buildingsGroup=new THREE.Group();const building=new THREE.Group();
 const height=id==='CHILD_HOSPITAL'?60:id==='E01_MAIN'?68:25;
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(50,height,38),new THREE.MeshStandardMaterial());mesh.position.y=height/2;building.add(mesh);
 const canopy=new THREE.Mesh(new THREE.BoxGeometry(20,2,12),new THREE.MeshStandardMaterial());canopy.position.set(0,3,24);building.add(canopy);
 building.visible=false;app.buildingsGroup.add(building);app.buildingMeshes={[id]:building};
 app.buildingOriginalMaterials=new Map();app.bedMeshes={oldBed:mesh};app.roomMeshes={oldRoom:mesh};app.pulsingHalos=[1];app.transferParticles=[1];
 app.camera=new THREE.PerspectiveCamera(45,1280/720,.5,2000);app.camera.position.set(0,8,12);app.camera.setViewOffset(1280,720,0,100,1280,720);
 app.controls={enabled:false,target:new THREE.Vector3(),update(){app.camera.lookAt(this.target);app.camera.updateMatrixWorld(true);}};
 app.container={clientWidth:1280,clientHeight:720};app.getWardViewport=()=>({width:1248,height:490,offsetX:0,offsetY:-35});
 app.cameraPositionTween={stop(){this.stopped=true;}};app.cameraTargetTween={stop(){this.stopped=true;}};
 app.renderWardDirectory=()=>{};app.showToast=()=>{};app.sunLight={castShadow:true};app.renderer={shadowMap:{enabled:true}};
 app.renderXrayDensityMarkers=()=>{assert.equal(app.selectedFloor,'all');assert(building.visible);assert.equal(app.floorSliceGroup.children.length,0);app.densityRendered=true;};
 c.window.canvasWhiteboardManager.wardModal.style.display=mode==='2D'?'flex':'none';app.xrayMode=false;
 app.toggleXrayMode();
 assert(app.xrayMode&&app.densityRendered);assert.equal(app.selectedFloor,'all');assert.equal(app.selectedWard,'ALL');assert.equal(app.selectedRoomCode,null);
 assert.equal(Object.keys(app.bedMeshes).length,0);assert.equal(Object.keys(app.roomMeshes).length,0);
 for(const key of ['floorSliceGroup','wardLabelsGroup','infectionGroup','arcsGroup'])assert.equal(app[key].children.length,0,key);
 assert.equal(c.window.canvasWhiteboardManager.wardModal.style.display,'none');assert.equal(nodes.get('floor-view-switcher-bar').style.display,'none');
 assert(app.cameraPositionTween.stopped&&app.cameraTargetTween.stopped);assert.equal(app.camera.view.enabled,false);
 const box=new THREE.Box3().setFromObject(building);
 for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
  const p=new THREE.Vector3(x,y,z).project(app.camera);assert(Math.abs(p.x)<.95&&Math.abs(p.y)<.7,'whole exterior clipped');
 }
 app.toggleXrayMode();assert(!app.xrayMode);assert.equal(app.selectedFloor,'all');assert.equal(mesh.material.transparent,false);assert.equal(app.buildingOriginalMaterials.size,0);
 app.toggleXrayMode();assert(app.xrayMode);assert.equal(app.floorSliceGroup.children.length,0);
 results.push({building:id,from:mode,fullExteriorRestored:true,wardObjectsCleared:true,cameraFits:true,repeatToggle:true});
}
console.log(JSON.stringify({cases:results.length,results}));
