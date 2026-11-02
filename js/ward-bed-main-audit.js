// Read-only checks of the real render paths; enabled only by ?verifyChildBeds=1.
(function(){
 if(new URLSearchParams(location.search).get('verifyChildBeds')!=='1')return;
 const records=[];let sequence=0;
 function publish(record){records.push(record);document.body.dataset.childBedMainAudit=JSON.stringify(records);const ticket=++sequence;delete document.body.dataset.childBedMainPainted;requestAnimationFrame(()=>requestAnimationFrame(()=>{if(ticket===sequence)document.body.dataset.childBedMainPainted=record.floor+'/'+record.ward+'/'+record.mode;}));}
 function northSouth(floor,id){const layout=window.WARD_3D_LAYOUT_DATA.CHILD_HOSPITAL[floor],bed=layout.beds.find(b=>b.bedId===id),room=layout.rooms.find(r=>r.ward===bed?.ward&&r.roomCode===bed?.roomCode);return room?.windowSides?.some(s=>s==='east'||s==='west');}
 const render=window.WardPlan2D.render;
 window.WardPlan2D.render=function(manager){const result=render.apply(this,arguments);if(manager.wardActiveBuildingId==='CHILD_HOSPITAL'){const floor=manager.wardActiveFloor,ward=manager.wardActiveWard,scene=window.WardPlan2D.scene('CHILD_HOSPITAL',floor,ward);publish({mode:'2D',floor,ward,canvasId:manager.wardCanvas.id,beds:scene.beds.map(b=>{const ns=northSouth(floor,b.id);return{id:b.id,axis:b.axis,valid:b.axis===(ns?'north-south':'east-west')&&(ns?b.h/b.w:b.w/b.h)>=1.6&&(ns?['north','south']:['east','west']).includes(b.headSide)};})});}return result;};
 const app=window.campusApp;
 function check3D(building,floor,ward){if(building!=='CHILD_HOSPITAL'||!app.ward3DData[building]?.[floor])return;const expected=app.ward3DData[building][floor].beds.filter(b=>ward==='ALL'||b.ward===ward);const beds=expected.map(b=>{const object=app.bedMeshes[b.bedId];if(!object)return{id:b.bedId,valid:false};object.updateWorldMatrix(true,false);const axis=new THREE.Vector3(1,0,0).applyQuaternion(object.getWorldQuaternion(new THREE.Quaternion()));const [frame,mattress,pillow]=object.children;const ns=northSouth(floor,b.bedId);return{id:b.bedId,axis:object.userData.axis,valid:object.userData.axis===(ns?'north-south':'east-west')&&(ns?Math.abs(axis.z)>.999&&Math.abs(axis.x)<.001:Math.abs(axis.x)>.999&&Math.abs(axis.z)<.001)&&frame.geometry.parameters.width/frame.geometry.parameters.depth>=1.6&&mattress.geometry.parameters.width/mattress.geometry.parameters.depth>=1.6&&Math.abs(pillow.position.z)<.001&&Math.sign(pillow.position.x)===(ns?(b.headSide==='north'?1:-1):(b.headSide==='west'?-1:1))};});publish({mode:'3D',floor,ward,sameData:app.ward3DData===window.WARD_3D_LAYOUT_DATA,beds});}
 for(const name of ['buildWard3DLayout','focusWardIn3D']){const original=app[name];app[name]=function(building,floor,ward){const result=original.apply(this,arguments);check3D(building,floor,ward||this.selectedWard||'ALL');return result;};}
})();

// Optional, read-only evidence of the real ward -> whole-building xray transition.
(()=>{
 if(new URLSearchParams(location.search).get('verifyXrayTransition')!=='1')return;
 const app=window.campusApp,original=app.toggleXrayMode;
 app.toggleXrayMode=function(){
  const before={building:this.selectedBuilding,floor:this.selectedFloor,ward:this.selectedWard};
  const result=original.apply(this,arguments);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   const building=this.buildingMeshes[this.selectedBuilding];
   let framed=true;
   if(building){
    const box=new THREE.Box3().setFromObject(building);this.camera.updateMatrixWorld(true);
    for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
     const p=new THREE.Vector3(x,y,z).project(this.camera);if(Math.abs(p.x)>1||Math.abs(p.y)>1)framed=false;
    }
   }
   document.body.dataset.xrayTransitionAudit=JSON.stringify({before,xray:this.xrayMode,floor:this.selectedFloor,ward:this.selectedWard,
    wardObjects:this.floorSliceGroup.children.length,wardLabels:this.wardLabelsGroup.children.length,bedMeshes:Object.keys(this.bedMeshes).length,
    wholeBuildingVisible:building?.visible,framed,cameraViewOffset:!!this.camera.view?.enabled,
    cameraTweenRunning:!!(this.cameraPositionTween?.isPlaying()||this.cameraTargetTween?.isPlaying()),
    modalOpen:window.canvasWhiteboardManager?.wardModal?.style.display!=='none',
    floorBarVisible:document.getElementById('floor-view-switcher-bar')?.style.display!=='none'});
  }));return result;
 };
})();
