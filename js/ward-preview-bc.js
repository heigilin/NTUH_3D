// A focused view of the production 14F model, without changing the source files.
window.campusApp.init=function(){
  const data=this.ward3DData.E01_MAIN['14F'], wards=new Set(['14B','14C']);
  const select=items=>(items||[]).filter(p=>wards.has(p.ward)||p.isInterWing);
  const bc={...data,rooms:select(data.rooms),beds:select(data.beds),nursingStations:select(data.nursingStations),facilities:select(data.facilities),displayCorridors:select(data.displayCorridors),sourceTraceCorridors:select(data.sourceTraceCorridors)};
  window.WARD_3D_LAYOUT_DATA={E01_MAIN:{'14F':bc}};this.ward3DData=window.WARD_3D_LAYOUT_DATA;
  this.selectedBuilding='E01_MAIN';this.selectedFloor='14F';this.selectedWard='ALL';
  this.initThree();this.scene.background=new THREE.Color('#f3f7fa');this.scene.fog=null;this.sunLight.castShadow=false;this.renderer.shadowMap.enabled=false;
  this.tweenCamera=(position,target)=>{this.camera.position.copy(position);this.controls.target.copy(target);this.controls.update();};
  this.buildWard3DLayout('E01_MAIN','14F');this.focusWardIn3D('E01_MAIN','14F','ALL');
  let mode='3D';const canvas=document.getElementById('plan'),box=document.getElementById('canvas-container');
  const draw=()=>{const s=WardPlan2D.scene('E01_MAIN','14F','ALL'),w=box.clientWidth,h=box.clientHeight,dpr=devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;WardPlan2D.render({wardCtx:canvas.getContext('2d'),wardCanvas:canvas,wardActiveBuildingId:'E01_MAIN',wardActiveFloor:'14F',wardActiveWard:'ALL',wardPan:{x:0,y:0},wardZoom:Math.min(w/s.width,h/s.height)*.95,wardHistory:[],drawSinglePath(){}});};
  document.getElementById('two').onclick=()=>{mode='2D';box.style.visibility='hidden';canvas.hidden=false;draw();document.getElementById('two').classList.add('active');document.getElementById('three').classList.remove('active');};
  document.getElementById('three').onclick=()=>{mode='3D';box.style.visibility='visible';canvas.hidden=true;document.getElementById('three').classList.add('active');document.getElementById('two').classList.remove('active');};
  window.addEventListener('resize',()=>{if(mode==='2D')draw();});
  this.renderer.setAnimationLoop(()=>{this.controls.update();if(mode==='3D')this.renderer.render(this.scene,this.camera);});
};
