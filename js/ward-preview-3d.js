// Focused preview uses the production 3D builder and the shared 11C geometry.
window.campusApp.init=function () {
  const full=this.ward3DData.E01_MAIN['11F'];
  const onlyC={...full,rooms:full.rooms.filter(r=>r.ward==='11C'),beds:full.beds.filter(b=>b.ward==='11C'),nursingStations:full.nursingStations.filter(n=>n.ward==='11C'),facilities:full.facilities.filter(f=>f.ward==='11C'),corridors:window.WARD_11C_CORRIDORS};
  this.ward3DData={E01_MAIN:{'11F':onlyC}};
  this.selectedBuilding='E01_MAIN';this.selectedFloor='11F';this.selectedWard='11C';
  this.campusData={...this.campusData,buildings:this.campusData.buildings.map(b=>b.id==='E01_MAIN'?{...b,dimensions:{...b.dimensions,width:60,depth:28}}:b)};
  this.initThree();this.scene.background=new THREE.Color('#f3f7fa');this.scene.fog=null;this.sunLight.castShadow=false;this.renderer.shadowMap.enabled=false;
  this.tweenCamera=(position,target)=>{this.camera.position.copy(position);this.controls.target.copy(target);this.controls.update();};
  this.buildWard3DLayout('E01_MAIN','11F');this.focusWardIn3D('E01_MAIN','11F','11C');
  this.renderer.setAnimationLoop(()=>{TWEEN.update();this.controls.update();this.renderer.render(this.scene,this.camera);});
};
