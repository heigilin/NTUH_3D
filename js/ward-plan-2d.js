/* Vector ward plans; source beds and supplemental schematic beds share one layout. */
(function () {
  const C = { wall: '#486273', ink: '#203e50', room: '#e9efe3', blue: '#2385aa', window: '#6fc7df', service: '#e8f3ed', nurse: '#d5eeea' };
  const unavailableMessage='本區無病房單位，不呈現平面圖';
  function hasPlan(building,floor,ward='ALL') {
    const data=window.WARD_3D_LAYOUT_DATA?.[building]?.[floor];
    if(!data||['missing-source','excluded','schematic'].includes(data.sourceCoverage?.status))return false;
    return (data.rooms||[]).some(r=>r.bounds&&(ward==='ALL'||!ward||r.ward===ward));
  }
  function registry(ward, room) {
    return ((window.WARD_PLAN_BEDS || {})[ward] || {})[room] || ((window.WARD_BED_IDS || {})[ward] || {})[room] || [];
  }
  function fitScene(s) {
    const items = s.rooms.concat(s.spaces,s.corridors||[]);
    if (!items.length) return s;
    const left = Math.min(...items.map(p => p.x));
    const top = Math.min(...items.map(p => p.y));
    const right = Math.max(...items.map(p => p.x + p.w));
    const bottom = Math.max(...items.map(p => p.y + p.h));
    s.width = right - left + 100;
    s.height = bottom - top + 160;
    items.concat(s.beds,s.rooms.flatMap(r=>r.annexes||[]),s.spaces.flatMap(p=>(p.polygons||[]).flat())).forEach(p => { p.x += 50 - left; p.y += 110 - top; });
    return s;
  }
  function scene(building, floor, ward) {
    const data = window.WARD_3D_LAYOUT_DATA?.[building]?.[floor];
    const s = { width: 1800, height: 850, rooms: [], spaces: [], beds: [], corridors: [], title: `${floor} ${ward === 'ALL' ? '病房區' : ward + ' 病房區'}` };
    s.notice=data?.sourceDisplayNote||'';
    const add = (x,y,w,h,label,kind='service') => s.spaces.push({x,y,w,h,label,kind});
    const room = (x,y,w,h,code,sourceWard,upper,displayWard=sourceWard,label=null) => {
      const r = {x,y,w,h,label: label || window.WardPlanLabels.room({roomCode:code,ward:displayWard,bedCount:1}), code, ward:sourceWard, upper};
      s.rooms.push(r);
      const ids=registry(sourceWard,code);
      const modelRoom=(data.rooms||[]).find(q=>q.ward===sourceWard&&q.roomCode===code);
      r.bedCount=modelRoom?.bedCount||ids.length;
      r.compactMultiBedRoom=r.bedCount>=3&&!!modelRoom?.bounds&&modelRoom.bounds.width*modelRoom.bounds.depth<18;
      const pixelsPerUnit=modelRoom?.bounds ? w/modelRoom.bounds.width : 24;
      r.door=window.WardRoomDoors?.get(modelRoom||{bounds:{width:w/24,depth:h/24},upper});
      r.pixelsPerUnit=pixelsPerUnit; r.openBay=!!modelRoom?.openBay;
      r.windowSides=modelRoom?.windowSides;
      r.annexes=(modelRoom?.annexBounds||[]).map(q=>({x:x+(q.x-q.width/2-modelRoom.bounds.x+modelRoom.bounds.width/2)*pixelsPerUnit,y:y+(q.z-q.depth/2-modelRoom.bounds.z+modelRoom.bounds.depth/2)*pixelsPerUnit,w:q.width*pixelsPerUnit,h:q.depth*pixelsPerUnit}));
      r.positionSchematic=!!(modelRoom?.sourceFitBeds||modelRoom?.bedGrid||modelRoom?.bedClearance||modelRoom?.bedSpacingSchematic);
      if(modelRoom?.bounds && (data.beds||[]).some(b=>b.ward===sourceWard&&b.roomCode===code)){
        const rb=modelRoom.bounds;
        (data.beds||[]).filter(b=>b.ward===sourceWard&&b.roomCode===code).forEach(b=>{
          s.beds.push({x:x+(b.x-b.width/2-rb.x+rb.width/2)*pixelsPerUnit,
            y:y+(b.z-b.depth/2-rb.z+rb.depth/2)*pixelsPerUnit,
            w:b.width*pixelsPerUnit,h:b.depth*pixelsPerUnit,label:b.bedLabel||b.bedId.split('-').pop(),
            id:b.bedId,headSide:b.headSide,axis:b.axis||modelRoom?.bedAxis,room:r,isSchematic:b.isSchematic});
        });
        return;
      }
      const roomWidth=modelRoom?.bounds?.width || w/pixelsPerUnit;
      const headGap=window.WardBedPlacement.headClearance(roomWidth,ids.length)*pixelsPerUnit;
      ids.forEach((id,i) => {
        const seq=id.split('-').pop();
        const slot=window.WardBedPlacement.slot(ids.length,i);
        const bw=Math.min(65,w*(ids.length===4?0.42:0.65),ids.length===4 ? w/2-headGap-0.225*pixelsPerUnit : w-headGap-0.20*pixelsPerUnit), bh=Math.min(26,h*0.14);
        const near=y+Math.min(57,h*0.34), far=y+h-bh-Math.min(17,h*0.08);
        const by=upper ? far-slot.fraction*(far-near) : near+slot.fraction*(far-near);
        s.beds.push({x:slot.headSide==='west'?x+headGap:x+w-headGap-bw,y:by,w:bw,h:bh,label:seq,id,headSide:slot.headSide,room:r});
      });
    };
    // This wing is traced from the supplied 11C reference, not from generated room bounds.
    if (building === 'E01_MAIN' && floor === '11F' && (ward === '11C' || ward === '11C1') && !data?.sourceTraceWards?.['11C']) {
      s.title='11C 病房配置';
      const spec=window.WARD_11C_PLAN;
      if (!spec) return s;
      spec.rooms.forEach(p=>room(p.x,p.y,p.w,p.h,p.code,'11C',p.upper));
      spec.spaces.forEach(p=>add(p.x,p.y,p.w,p.h,p.label,p.kind));
      return fitScene(s);
    }
    if (!hasPlan(building,floor,ward)) {s.emptyMessage=unavailableMessage;s.notice='';return s;}
    let rooms=(data.rooms || []).filter(r=>r.bounds);
    if (ward !== 'ALL') rooms=rooms.filter(r=>r.ward===ward);
    // The building/floor layout is authoritative; ward metadata can contain 32F/42F parsing errors.
    if (!rooms.length) {
      s.emptyMessage=unavailableMessage;
      return s;
    }
    const minX=Math.min(...rooms.map(r=>r.bounds.x-r.bounds.width/2));
    const maxX=Math.max(...rooms.map(r=>r.bounds.x+r.bounds.width/2));
    const minZ=Math.min(...rooms.map(r=>r.bounds.z-r.bounds.depth/2));
    const maxZ=Math.max(...rooms.map(r=>r.bounds.z+r.bounds.depth/2));
    const k=24/(data.buildingFit?.scale||1);
    const xy=b=>({x:70+(b.x-b.width/2-minX+4)*k,y:110+(b.z-b.depth/2-minZ+4)*k,w:b.width*k,h:b.depth*k});
    const corridorSource=data.displayCorridors||data.sourceTraceCorridors||[];
    const openStations=new Set(window.WardPlanLabels.openStations(data,corridorSource));
    for(const c of corridorSource){
      if(!c.bounds || (ward!=='ALL' && c.ward!==ward && !c.connects?.includes(ward))) continue;
      let b=c.bounds,label=openStations.has(c)&&(ward==='ALL'||c.ward===ward)?window.WardPlanLabels.station(c):c.connectionLabel?(c.connectionText||'B–C 連通道'):'';
      if(ward!=='ALL' && c.isInterWing){
        const top=Math.max(b.z-b.depth/2,minZ-4),bottom=Math.min(b.z+b.depth/2,maxZ+4);
        if(bottom<=top) continue;
        b={...b,z:(top+bottom)/2,depth:bottom-top};
        const ownWing=/^[0-9]+([BC])/.exec(ward)?.[1];
        const targets=(c.connects||[]).filter(w=>w!==ward&&(!ownWing||/^[0-9]+([BC])/.exec(w)?.[1]!==ownWing));
        label=c.connectionLabel?('通往'+targets.join('／')):'';
      }
      s.corridors.push({...xy(b),label,isInterWing:c.isInterWing,isNursingArea:c.isNursingArea,id:c.id});
    }
    rooms.forEach(r=>{
      const p=xy(r.bounds);
      const ns=(data.nursingStations||[]).find(n=>n.ward===r.ward);
      if (/DIRTY|CLEAN/i.test(r.roomCode) || (!r.bedCount && !/^\d+$/.test(r.roomCode) && r.category!=='PATIENT_ROOM' && r.category!=='ISOLATION')) { add(p.x,p.y,p.w,p.h,window.WardPlanLabels.room(r)); return; }
      room(p.x,p.y,p.w,p.h,r.roomCode,r.ward,r.upper??r.bounds.z<(ns?.bounds.z??(minZ+maxZ)/2),r.ward,window.WardPlanLabels.room(r));
    });
    const selected=new Set(rooms.map(r=>r.ward));
    (data.nursingStations||[]).filter(n=>selected.has(n.ward)).forEach(n=>{
      const p=xy(n.bounds),loops=n.outline?[n.outline]:window.WardPlanGeometry.unionLoops([n.bounds,...(n.parts||[])]);
      const polygons=loops.map(loop=>loop.map(q=>({x:p.x+(q.x-n.bounds.x+n.bounds.width/2)*k,y:p.y+(q.z-n.bounds.z+n.bounds.depth/2)*k})));
      s.spaces.push({...p,label:window.WardPlanLabels.station(n),kind:'nurse',polygons});
    });
    const facilities=(data.facilities||[]).concat((data.rooms||[]).filter(r=>selected.has(r.ward)&&!/^\d+$/.test(r.roomCode)));
    facilities.forEach(f=>{
      if (ward!=='ALL' && data.sourceTraceWards?.[ward] && !f.ward) return;
      if (!f.bounds || (f.ward && !selected.has(f.ward)) || rooms.includes(f)) return;
      const rawName=(f.name||f.roomName||'').replace(/[⚠️🧹🏥]/gu,'').trim();
      const name=f.sourceTrace?rawName:rawName.replace(/\S+區\s*/,'').trim();
      if (!f.sourceTrace && /預測|管道|管線|研究|封閉|機房/.test(name)) return;
      if (!f.sourceTrace && !/清潔|污物|會議|治療|辦公|廁|電梯/.test(name)) return;
      const p=xy(f.bounds);

      const label=f.sourceTrace?name:name.includes('清潔')?'清潔間':name.includes('污物')?'污物室':name.includes('會議')?'會議室':name.includes('治療')?'治療室':name.includes('辦公')?'辦公室':name;
      add(p.x,p.y,p.w,p.h,label,f.type==='courtyard'?'courtyard':f.type==='anteroom'?'anteroom':'service');
    });
    return fitScene(s);
  }
  function render(manager) {
    const ctx=manager.wardCtx,canvas=manager.wardCanvas,dpr=window.devicePixelRatio||1;
    const w=canvas.width/dpr,h=canvas.height/dpr;
    const s=scene(manager.wardActiveBuildingId,manager.wardActiveFloor,manager.wardActiveWard);
    manager.redrawnScene=s;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const backdrop=ctx.createLinearGradient(0,0,w*.3,h);backdrop.addColorStop(0,'#cbd9cc');backdrop.addColorStop(1,'#e1e6d8');ctx.fillStyle=backdrop;ctx.fillRect(0,0,w,h);
    const legend=manager.wardModal?.querySelector('.ward-canvas-legend');
    if(legend){legend.hidden=!!s.emptyMessage;legend.style.display=s.emptyMessage?'none':'';}
    if(s.emptyMessage){
      ctx.fillStyle=C.ink;ctx.font='600 22px "Microsoft JhengHei", sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(unavailableMessage,w/2,h/2,Math.max(1,w-40));
      const button=manager.wardModal?.querySelector('#btn-wcanvas-switch-3d');if(button)button.disabled=true;
      return;
    }
    ctx.save();ctx.translate(w/2+manager.wardPan.x,h/2+manager.wardPan.y);ctx.scale(manager.wardZoom,manager.wardZoom);ctx.translate(-s.width/2,-s.height/2);
    const box=(p,fill,stroke=C.wall,lineWidth=2)=>{ctx.fillStyle=fill;ctx.fillRect(p.x,p.y,p.w,p.h);ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.strokeRect(p.x,p.y,p.w,p.h);};
    const txt=(t,x,y,size=20,col=C.ink,align='center')=>{ctx.fillStyle=col;ctx.font=`600 ${size}px "Microsoft JhengHei", sans-serif`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(t,x,y);};
    // Let the plan sit directly in the calm landscape palette, without a white paper rectangle.
    ctx.font='600 30px "Microsoft JhengHei", sans-serif';
    const titleSize=Math.min(30,30*Math.max(1,s.width-170)/Math.max(1,ctx.measureText(s.title).width));
    ctx.fillStyle='#168f8b';ctx.fillRect(50,45,6,39);txt(s.title,75,65,titleSize,C.ink,'left');
    txt('2D',s.width-55,65,20,'#7b96a5','right');
    if(s.rooms.length){
      const x=Math.min(...s.rooms.map(r=>r.x)),y=Math.min(...s.rooms.map(r=>r.y));
      const right=Math.max(...s.rooms.map(r=>r.x+r.w)),bottom=Math.max(...s.rooms.map(r=>r.y+r.h));
      ctx.fillStyle='rgba(219,228,212,.42)';ctx.fillRect(x,y,right-x,bottom-y);
    } else txt(s.emptyMessage||'此分區沒有可用的病室配置',s.width/2,s.height/2,27,'#718693');
    const switch3D=manager.wardModal?.querySelector('#btn-wcanvas-switch-3d');
    if(switch3D)switch3D.disabled=!s.rooms.length;
    s.corridors.forEach(p=>{ctx.fillStyle=p.isNursingArea?'#d5eeea':p.isInterWing?'#d8edf5':'#dedfcf';ctx.fillRect(p.x,p.y,p.w,p.h);if(p.label){ctx.fillStyle='#366c86';window.WardPlanLabels.draw(ctx,p.label,p.x+p.w/2,p.y+p.h/2,Math.max(1,p.w-6),Math.max(1,p.h-6),19);}});
    s.spaces.forEach(p=>{if(p.polygons){ctx.fillStyle=C.nurse;ctx.strokeStyle=C.wall;ctx.lineWidth=1.3;for(const polygon of p.polygons){ctx.beginPath();polygon.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.closePath();ctx.fill();ctx.stroke();}}else if(p.kind==='courtyard'){ctx.fillStyle='#f0f3f4';ctx.fillRect(p.x,p.y,p.w,p.h);}else box(p,p.kind==='research'?'#eef0f4':p.kind==='nurse'?C.nurse:p.kind==='anteroom'?'#faf3df':C.service);if(!p.suppressLabel&&(p.kind==='nurse'||!/護理站/.test(p.label))){ctx.fillStyle=C.ink;const label=window.WardPlanLabels.spaceBox(p,s.rooms),text=p.kind==='nurse'?window.WardPlanLabels.station({name:p.label}):p.label;window.WardPlanLabels.draw(ctx,text,label.x+label.w/2,label.y+label.h/2,label.w,label.h,p.kind==='nurse'?32:window.WardPlanLabels.spaceFontSize(p.label));}});
    s.rooms.forEach(r=>{
      if(r.openBay){ctx.fillStyle=C.room;ctx.fillRect(r.x,r.y,r.w,r.h);return;}
      box(r,manager.selectedRoomCode===r.code?'#fff2c7':C.room);

      for(const side of r.windowSides??[r.upper?'north':'south']){
        const horizontal=side==='north'||side==='south',edge=side==='north'?r.y:side==='south'?r.y+r.h:side==='west'?r.x:r.x+r.w;
        const length=horizontal?r.w:r.h,margin=Math.min(25,length*.2);
        ctx.strokeStyle=C.window;ctx.lineWidth=5;ctx.beginPath();
        if(horizontal){ctx.moveTo(r.x+margin,edge);ctx.lineTo(r.x+r.w-margin,edge);}
        else{ctx.moveTo(edge,r.y+margin);ctx.lineTo(edge,r.y+r.h-margin);}
        ctx.stroke();
      }
      const door=r.door||{side:r.upper?'south':'north',offset:.22,width:1};
      const horizontal=door.side==='north'||door.side==='south',len=horizontal?r.w:r.h;
      const center=(horizontal?r.x:r.y)+len*door.offset;
      const width=Math.min(door.width*(r.pixelsPerUnit||24),len*.32);
      const fixed=horizontal?r.y+(door.side==='south'?r.h:0):r.x+(door.side==='east'?r.w:0);
      const sign=door.side==='north'||door.side==='west'?-1:1;
      ctx.strokeStyle=C.room;ctx.lineWidth=7;ctx.beginPath();
      if(horizontal){ctx.moveTo(center-width/2,fixed);ctx.lineTo(center+width/2,fixed);}
      else{ctx.moveTo(fixed,center-width/2);ctx.lineTo(fixed,center+width/2);}ctx.stroke();
      ctx.strokeStyle='#738d9b';ctx.lineWidth=1.5;
      for(const edge of [center-width/2,center+width/2]){ctx.beginPath();
        if(horizontal){ctx.moveTo(edge,fixed);ctx.lineTo(edge,fixed+sign*7);}
        else{ctx.moveTo(fixed,edge);ctx.lineTo(fixed+sign*7,edge);}ctx.stroke();}

    });
    s.rooms.forEach(r=>(r.annexes||[]).forEach(q=>{ctx.fillStyle='#edf2f3';ctx.fillRect(q.x,q.y,q.w,q.h);ctx.strokeStyle='#a6b8bf';ctx.lineWidth=.6;ctx.strokeRect(q.x,q.y,q.w,q.h);}));
    s.beds.forEach(b=>{box(b,'#ffffff','#80adbf',0.8);ctx.fillStyle='#d2e9f1';ctx.strokeStyle='#80adbf';ctx.lineWidth=0.8;ctx.beginPath();let labelX;if(b.axis==='north-south'){const north=b.headSide==='north',headY=north?b.y:b.y+b.h;ctx.fillRect(b.x+b.w*.15,b.y+b.h*(north?.08:.74),b.w*.7,b.h*.18);ctx.moveTo(b.x-1,headY);ctx.lineTo(b.x+b.w+1,headY);labelX=b.x+b.w/2;}else{ctx.fillRect(b.x+b.w*(b.headSide==='west'?.08:.74),b.y+b.h*.15,b.w*.18,b.h*.7);const headX=b.headSide==='west'?b.x:b.x+b.w;ctx.moveTo(headX,b.y-1);ctx.lineTo(headX,b.y+b.h+1);labelX=b.x+b.w*(b.headSide==='west'?.65:.35);}ctx.stroke();txt(b.label,labelX,b.y+b.h/2,Math.min(15,Math.min(b.w,b.h)*0.64),C.blue);});
    s.rooms.forEach(r=>{
      const label=window.WardPlanLabels.place(r,[...s.beds.filter(b=>b.room===r),...(r.annexes||[])]);
      ctx.fillStyle=C.ink;
      const roomFontLimit=r.compactMultiBedRoom?9:manager.wardActiveBuildingId==='W04_WEST'?15:23;
      window.WardPlanLabels.draw(ctx,r.label,label.x+label.w/2,label.y+label.h/2,label.w,label.h,roomFontLimit);
    });
    if(s.notice)txt(s.notice,50,s.height-22,16,'#526c7c','left');
    ctx.translate(s.width/2,s.height/2);manager.wardHistory.forEach(p=>manager.drawSinglePath(ctx,p));ctx.restore();
    if(legend){
      const pending=s.rooms.filter(r=>r.door?.validation==='needs-source-review').length;
      const layout=window.WARD_3D_LAYOUT_DATA?.[manager.wardActiveBuildingId]?.[manager.wardActiveFloor];
      const unplaced=new Set((layout?.sourceUnplacedBeds||[]).filter(b=>manager.wardActiveWard==='ALL'||b.ward===manager.wardActiveWard).map(b=>b.bedId)).size;
      legend.textContent='病室  ·  清潔間／公共空間  ·  藍線：窗戶示意'+(s.rooms.some(r=>r.positionSchematic)||s.beds.some(b=>b.isSchematic)?'  ·  床位位置為示意':'')+(unplaced?`  ·  ${unplaced}筆來源床號待定位`:'')+(pending?`  ·  ${pending}間門位待核對`:'');
    }
  }
  window.WardPlan2D={scene,render,hasPlan,unavailableMessage};
})();
