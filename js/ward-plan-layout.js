/* Shared display geometry. Supplemental beds are schematic, never patient records. */
(function () {
  // Fit measured text into its own label box; never paint across adjacent rooms.
  window.WardPlanLabels = {
    // One model unit is the public-space caption ceiling in both renderers.
    // The stair exception preserves its existing regular-size caption.
    spaceFontSize(text, pixelsPerUnit=24) {
      return pixelsPerUnit * (/安全梯/.test(String(text)) ? 1.5 : 1);
    },
    room(r) {
      if(r.displayRoomLabel)return r.displayRoomLabel;
      const code=String(r.roomCode||'').trim();
      if (/DIRTY|CLEAN/i.test(code)) return /DIRTY/i.test(code) ? '污物室' : '清潔間';
      const ward=String(r.ward||'');
      const short=ward&&code.startsWith(ward)?code.slice(ward.length).replace(/^[-_\s]+/,''):code;
      if(/^\d+[A-Za-z]?$/.test(short))return /^\d$/.test(short)?short.padStart(2,'0'):short;
      return (r.bedCount>0?code:r.roomName||code).replace(/[⚠️🧹🏥]/gu,'').trim();
    },
    station(point) {
      const raw=point.ward||String(point.name||point.label||'').match(/(?:^|\s)([0-9]+[A-Za-z][A-Za-z0-9]*)/)?.[1]||'';
      const name=String(raw).replace(/^([0-9])(?=[A-Za-z])/,'0$1');
      return name ? name+' 護理站' : '護理站';
    },
    openStations(layout,corridors) {
      const selected=new Map();
      for(const c of corridors||[]){
        if(!c.bounds||!c.isNursingArea||!(layout.rooms||[]).some(r=>r.ward===c.ward)||(layout.nursingStations||[]).some(n=>n.ward===c.ward))continue;
        const old=selected.get(c.ward);
        if(!old||c.bounds.width*c.bounds.depth>old.bounds.width*old.bounds.depth)selected.set(c.ward,c);
      }
      return [...selected.values()];
    },
    // Largest readable strip in a room that does not intersect any bed footprint.
    place(room, beds, text=room.label||'') {
      if(/^\d{1,2}[A-Za-z]?$/.test(String(text))){
        const available=this.spaceBox(room,beds,String(text));
        if(available.clear)return available;
      }
      const margin=Math.min(room.w,room.h)*0.035;
      const left=room.x+margin,right=room.x+room.w-margin,top=room.y+margin,bottom=room.y+room.h-margin;
      const overlaps=(a,b)=>a.x<b.x+b.w+margin && a.x+a.w>b.x-margin && a.y<b.y+b.h+margin && a.y+a.h>b.y-margin;
      for(const fraction of [1,.92,.84,.76,.68,.60,.52,.44,.36,.28,.20]){
        const w=(right-left)*fraction,h=Math.min(w/3.6,(bottom-top)*.35);
        const xs=[(left+right-w)/2,left,right-w,...beds.flatMap(b=>[b.x-w-margin,b.x+b.w+margin])];
        const ys=[(top+bottom-h)/2,top,bottom-h,...beds.flatMap(b=>[b.y-h-margin,b.y+b.h+margin])];
        const candidates=[];
        for(const x of xs)for(const y of ys){const box={x,y,w,h};
          if(x<left-1e-6||x+w>right+1e-6||y<top-1e-6||y+h>bottom+1e-6||beds.some(b=>overlaps(box,b)))continue;
          candidates.push(box);
        }
        candidates.sort((a,b)=>Math.abs(a.y+a.h/2-room.y-room.h/2)+Math.abs(a.x+a.w/2-room.x-room.w/2)-Math.abs(b.y+b.h/2-room.y-room.h/2)-Math.abs(b.x+b.w/2-room.x-room.w/2));
        if(candidates.length)return {...candidates[0],clear:true};
      }
      return {x:left,y:top,w:right-left,h:Math.min((right-left)/3.6,(bottom-top)*.2),clear:false};
    },
    // Use the interior of each service space, with proportional edge clearance.
    spaceBox(room, obstacles=[], text='') {
      const margin=Math.min(room.w,room.h)*0.07;
      const inner={x:room.x+margin,y:room.y+margin,w:room.w-2*margin,h:room.h-2*margin};
      const hit=(a,b)=>a.x<b.x+b.w-1e-6&&a.x+a.w>b.x+1e-6&&a.y<b.y+b.h-1e-6&&a.y+a.h>b.y+1e-6;
      const blocks=obstacles.filter(b=>hit(inner,b));
      if(!blocks.length)return {...inner,clear:true};
      // Some legacy service bays overlap rooms. Keep the text in the visible part
      // of its own bay, without moving or enlarging the source space.
      const xs=[inner.x,inner.x+inner.w];
      for(const b of blocks){
        xs.push(Math.max(inner.x,b.x),Math.min(inner.x+inner.w,b.x+b.w));
      }
      const xx=[...new Set(xs)].sort((a,b)=>a-b);
      let best=null,bestScore=-1;
      for(let l=0;l<xx.length;l++)for(let r=l+1;r<xx.length;r++){
        const x=xx[l],w=xx[r]-x;
        if(w<=0)continue;
        const occupied=blocks.filter(b=>b.x<x+w-1e-6&&b.x+b.w>x+1e-6)
          .map(b=>[Math.max(inner.y,b.y),Math.min(inner.y+inner.h,b.y+b.h)]).sort((a,b)=>a[0]-b[0]);
        let top=inner.y;
        for(const [start,end] of [...occupied,[inner.y+inner.h,inner.y+inner.h]]){
          const box={x,y:top,w,h:start-top};
          const score=text?Math.min(box.w/(String(text).length*.68),box.h/1.15):box.w*box.h;
          if(box.h>0&&(score>bestScore+1e-6||Math.abs(score-bestScore)<1e-6&&(!best||box.w*box.h>best.w*best.h))){best=box;bestScore=score;}
          top=Math.max(top,end);
        }
      }
      return best?{...best,clear:true}:{...inner,clear:false};
    },
    draw(ctx, text, x, y, width, height, maxSize=20) {
      // Safety stairs keep a regular caption size in both 2D and 3D views.
      if (/安全梯/.test(String(text))) maxSize *= 0.5;
      const family='"Microsoft JhengHei", Arial, sans-serif';
      const wrap = size => {
        ctx.font=`600 ${size}px ${family}`;
        const lines=[]; let line='';
        for (const ch of String(text)) {
          if (line && ctx.measureText(line+ch).width>width) { lines.push(line); line=''; }
          line+=ch;
        }
        if (line) lines.push(line);
        return lines;
      };
      let size=maxSize;
      if (/^[A-Za-z0-9-]+$/.test(String(text))) {
        ctx.font=`600 ${size}px ${family}`;
        while (size>6 && ctx.measureText(String(text)).width>width) ctx.font=`600 ${--size}px ${family}`;
      }
      let lines=wrap(size);
      while (size>6 && (lines.length*size*1.15>height || lines.some(l=>ctx.measureText(l).width>width))) lines=wrap(--size);
      if (/^04W2\s*護理站$/.test(String(text))) { size *= .85; lines=wrap(size); }
      if (/^04E1\s*護理站$/.test(String(text))) { size *= .9; lines=wrap(size); }
      ctx.save();ctx.beginPath();ctx.rect(x-width/2,y-height/2,width,height);ctx.clip();
      ctx.textAlign='center';ctx.textBaseline='middle';
      lines.forEach((line,i)=>ctx.fillText(line,x,y+(i-(lines.length-1)/2)*size*1.15));ctx.restore();
      return {size,lines};
    }
  };
  // Display clearance is schematic; it is not a surveyed clinical dimension.
  // Four-bed rooms have two headboards on each east/west wall. Bed IDs
  // remain in source order, including skipped numbers such as 01/02/03/05.
  window.WardBedPlacement = {
    headClearance(roomWidth, count) {
      // Small display gap keeps the headboard visually separate from the wall.
      return Math.min(.22, roomWidth*.055);
    },
    sideClearance: 1.05,
    slot(count, index) {
      const west = count === 4 && index >= 2;
      const perSide = count === 4 ? 2 : count;
      const position = count === 4 ? index % 2 : index;
      return { headSide: west ? 'west' : 'east', fraction: perSide === 1 ? 0.5 : position / (perSide - 1) };
    }
  };
  const root=window.WARD_3D_LAYOUT_DATA;
  // Auxiliary buildings import offset plan coordinates. Rebase each floor to
  // its own building center before the renderer adds the campus position.
  for (const [buildingId, floors] of Object.entries(root || {})) {
    if (buildingId === 'E01_MAIN') continue;
    for (const layout of Object.values(floors)) {
    const rooms = (layout.rooms || []).filter(r => r.bounds);
    if (!rooms.length) continue;
    const cx = (Math.min(...rooms.map(r => r.bounds.x-r.bounds.width/2)) + Math.max(...rooms.map(r => r.bounds.x+r.bounds.width/2))) / 2;
    const cz = (Math.min(...rooms.map(r => r.bounds.z-r.bounds.depth/2)) + Math.max(...rooms.map(r => r.bounds.z+r.bounds.depth/2))) / 2;
    const moved = new Set();
    for (const item of [...rooms, ...(layout.nursingStations || []), ...(layout.nursingStations || []).flatMap(n=>[...(n.parts||[]),...(n.outline||[])]), ...rooms.flatMap(r=>[r.bedBounds,...(r.annexBounds||[])].filter(Boolean)), ...(layout.facilities || []), ...(layout.corridors || []), ...(layout.sourceTraceCorridors || []), ...(layout.protectedCorridors || []), ...(layout.beds || [])]) {
      const point = item.bounds || item;
      if (moved.has(point) || !Number.isFinite(point.x) || !Number.isFinite(point.z)) continue;
      point.x -= cx; point.z -= cz; moved.add(point);
    }
    }
  }
  const floor=root?.E01_MAIN?.['11F'];
  if (!floor) return;
  const spec={rooms:[],spaces:[],corridors:[]};
  const addRoom=(code,x,y,upper)=>spec.rooms.push({code,x,y,w:115,h:240,upper});
  ['06','07','08','09','10'].forEach((n,i)=>addRoom(n,50+i*115,120,true));
  ['11','12','13','15','16','17','18'].forEach((n,i)=>addRoom(n,735+i*115,120,true));
  ['05','03','02','01'].forEach((n,i)=>addRoom(n,50+i*115,470,false));
  ['21','20','19','22'].forEach((n,i)=>addRoom(n,1010+i*115,470,false));
  const addSpace=(x,y,w,h,label,kind='service')=>spec.spaces.push({x,y,w,h,label,kind});
  addSpace(510,470,195,115,'治療室');addSpace(510,585,195,125,'會議室');
  addSpace(735,480,220,110,'護理站','nurse');addSpace(735,615,110,95,'辦公室');addSpace(845,615,110,95,'清潔間');
  addSpace(1470,470,70,240,'女廁');addSpace(510,730,195,65,'男廁');addSpace(735,730,220,65,'電梯廳');
  const bounds=p=>({x:(p.x+p.w/2-800)*0.035,z:12+(p.y+p.h/2-415)*0.035,y:0,width:p.w*0.035,depth:p.h*0.035,height:1.2});
  const count=code=>['01','02','20','21'].includes(code)?3:['07','08','09','10','11','12','13','15','16'].includes(code)?2:1;
  // Same room/bed model as the adjacent wards; these are illustrative counts.
  const replacement=spec.rooms.map(p=>({roomCode:p.code,roomName:'11C'+p.code,ward:'11C',category:'PATIENT_ROOM',bedCount:count(p.code),bounds:bounds(p),upper:p.upper,isSchematic:true,sourceWard:'11C1'}));
  floor.rooms=(floor.rooms||[]).filter(r=>r.ward!=='11C1'&&r.ward!=='11C').concat(replacement);
  floor.nursingStations=(floor.nursingStations||[]).filter(n=>n.ward!=='11C1'&&n.ward!=='11C').concat(spec.spaces.filter(p=>p.kind==='nurse').map(p=>({id:'NS-11C',name:'11C 護理站',ward:'11C',bounds:bounds(p),color:'#168f8b'})));
  floor.facilities=(floor.facilities||[]).filter(f=>f.ward!=='11C1'&&f.ward!=='11C').concat(spec.spaces.filter(p=>p.kind!=='nurse').map((p,i)=>({id:'FAC-11C-'+i,name:p.label,ward:'11C',type:p.kind,bounds:bounds(p)})));
  spec.corridors=[{x:50,y:360,w:1490,h:110},{x:625,y:120,w:110,h:350}].map((p,i)=>({id:'CORR-11C-'+i,name:'走廊',ward:'11C',bounds:bounds(p)}));
  window.WardSourceTraces?.apply(root);
  // 5W2: keep the nursing desk in the ward's room-side band, between the
  // 15/13 side of the ward as shown in 5W2.pdf. Dimensions remain schematic.
  // The previous template put it in the main north/south circulation spine.
  // The legacy 5F demo aliases the same 5W2 plan; keep both entry points consistent.
  for (const west5w2 of Object.values(root.W04_WEST||{}).filter(l=>(l.rooms||[]).some(r=>r.ward==='5W2'))) {
    const room13=west5w2.rooms.find(r=>r.roomCode==='5W2-13');
    const room15=west5w2.rooms.find(r=>r.roomCode==='5W2-15');
    const station=west5w2.nursingStations.find(n=>n.ward==='5W2');
    if(room13 && room15 && station){
      const originalStation={...station.bounds};
      const bayWidth=station.bounds.width+1.0;
      // Open a desk bay without dropping or shrinking any patient room.
      west5w2.rooms.filter(r=>/^5W2-(01|03|05|07|09|11|13)$/.test(r.roomCode)).forEach(r=>r.bounds.x-=bayWidth);
      // Door/window sides follow the aisle, not the relocated desk's Z value.
      west5w2.rooms.filter(r=>r.bedCount>0).forEach(r=>r.upper=r.bounds.z<0);
      const left=room13.bounds.x+room13.bounds.width/2;
      const right=room15.bounds.x-room15.bounds.width/2;
      station.sourceBounds=originalStation;
      station.bounds={...station.bounds,x:(left+right)/2,z:room13.bounds.z,depth:Math.min(station.bounds.depth,room13.bounds.depth)};
      station.fixedDisplayBay=true;
      station.isSchematic=true;
      station.geometryRelocated=false;
      station.placementBasis='5W2.pdf 病室側護理站；位置關係依原圖，房間尺寸與兩排排列仍為示意';
      west5w2.protectedCorridors=[{id:'MAIN-SPINE-5W2',name:'中央通道',mainSpine:true,userConfirmedClear:true,bounds:{x:originalStation.x,z:0,width:7.2,depth:21,y:0,height:0.05}}];
    }
  }
  const lookup={};
  for (const [building, floors] of Object.entries(root)) for (const [tag, layout] of Object.entries(floors)) {
    const beds=[];
    for (const r of layout.rooms||[]) {
      if (!r.bounds) continue;
      const source=r.sourceBedIds||(window.WARD_BED_IDS?.[r.sourceWard||r.ward]?.[r.roomCode]||[]);
      // A traced patient room may have no registry bed IDs. Show one anonymous
      // symbol rather than an empty room; this does not establish its capacity.
      const patient=r.category==='PATIENT_ROOM'||r.category==='ISOLATION'||/^\d+$/.test(r.roomCode);
      if (!(r.bedCount>0)&&patient&&!/DIRTY|CLEAN/i.test(r.roomCode)) {
        if(source.length) r.bedCount=source.length;
        else {
          r.sourceBedCount=r.bedCount||0;r.bedCount=1;r.isSchematic=true;
          r.bedSymbolOnly=true;r.bedClearance=Math.min(.3,r.bounds.width*.15,r.bounds.depth*.15);
          r.bedSymbolBasis='一個匿名床位圖示，僅表示病室用途，非正式床號或實際床數';
        }
      }
      if (!(r.bedCount>0)) continue;
      const bySeq=new Map(source.map(id=>[id.split('-').pop(),id]));
      const slots=r.isSchematic?Array.from({length:r.bedCount},(_,i)=>String(i+1).padStart(2,'0')):source.length?source.map(id=>id.split('-').pop()):Array.from({length:r.bedCount},(_,i)=>String(i+1).padStart(2,'0'));
      const ns=(layout.nursingStations||[]).find(n=>n.ward===r.ward);
      r.upper = r.upper ?? r.bounds.z<(ns?.bounds.z??0);
      r.bedIds=r.bedSymbolOnly?[`SCHEMATIC-${building}-${tag}-${r.ward}-${r.roomCode}-SYMBOL`]:source.length&&!r.isSchematic?source.slice():slots.map(seq=>bySeq.get(seq)||`SCHEMATIC-${r.ward}-${r.roomCode}-${seq}`);
      (lookup[r.ward]??={})[r.roomCode]=r.bedIds;
      const firstRoomBed=beds.length;
      const turnChildBed=building==='CHILD_HOSPITAL'&&r.bedAxis==='north-south';
      slots.forEach((seq,i)=>{
        const bedZone=r.bedBounds||r.bounds;
        const rb=turnChildBed?{...bedZone,x:bedZone.z,z:bedZone.x,width:bedZone.depth,depth:bedZone.width}:bedZone;
        if(['north-one-south-two','west-wall-north-south'].includes(r.bedArrangement)&&slots.length<=4){
          const fourBed=slots.length===4;
          const gap=fourBed?(r.bedClearance??.45):slots.length===3?.05:(r.bedClearance||.45)+.25;
          const rowCount=slots.length===1?1:2;
          const groupCount=slots.length===3?2:slots.length===4?2:1;
          const targetLength=r.bedDisplaySize?.length||1.8,targetWidth=r.bedDisplaySize?.width||.9;
          const requestedRowGap=slots.length===3?.1:r.bedRowGap??.25;
          const rowGap=fourBed&&rowCount>1?Math.max(0,Math.min(requestedRowGap,(rb.depth-gap*2-rowCount*targetLength)/(rowCount-1))):requestedRowGap;
          const bedLength=Math.max(.35,Math.min(targetLength,(rb.depth-gap*2-(rowCount===2?rowGap:0))/rowCount));
          const bedWidthLimit=fourBed||slots.length===3?targetWidth:Math.min(targetWidth,bedLength*.55);
          const bedWidth=Math.max(.25,Math.min(bedWidthLimit,(rb.width-gap*2-(groupCount===2?.2:0))/groupCount));
          const north=slots.length===1?true:slots.length===3?i===0:slots.length===4?i<2:i===0;
          const column=slots.length===3?(i===1?-1:1):slots.length===4?(i%2===0?-1:1):0;
          const x=rb.x+(groupCount===1?0:column*(rb.width/2-gap-bedWidth/2));
          const z=slots.length===1?rb.z:north?rb.z-rb.depth/2+gap+bedLength/2:rb.z+rb.depth/2-gap-bedLength/2;
          beds.push({bedId:r.bedIds[i],displayLabel:`${r.ward}${r.roomCode}-${seq}`,roomCode:r.roomCode,ward:r.ward,
            x,z,y:.35,width:bedWidth,depth:bedLength,height:.7,rotation:0,axis:'north-south',headSide:north?'north':'south',
            isSchematic:!bySeq.has(seq),clearance:gap,positionSchematic:true});
          return;
        }
        if(r.bedGrid){
          const gap=(r.bedClearance||.45)+.25,columns=r.bedGrid.columns,rows=Math.ceil(slots.length/columns);
          const width=Math.min(r.bedDisplaySize?.length||1.8,(rb.width-2*gap-.65*(columns-1))/columns);
          const sideGap=Math.min(gap+.2,Math.max(.01,(rb.depth-.1*rows-.5*(rows-1))/2));
          const depth=Math.min(r.bedDisplaySize?.width||.9,(rb.depth-2*sideGap-.5*(rows-1))/rows);
          const column=i%columns,row=Math.floor(i/columns),edgeX=rb.width/2-gap-width/2,edgeZ=rb.depth/2-sideGap-depth/2;
          beds.push({bedId:r.bedIds[i],bedLabel:r.bedIds[i].split('-').slice(-2).join('-'),displayLabel:r.bedIds[i],roomCode:r.roomCode,ward:r.ward,
            x:rb.x+(columns===1?0:-edgeX+column*edgeX*2/(columns-1)),z:rb.z+(r.upper?1:-1)*(rows===1?0:edgeZ-row*edgeZ*2/(rows-1)),
            y:.35,width,depth,height:.7,rotation:0,headSide:'east',...(r.bedAxis?{axis:r.bedAxis}:{}),isSchematic:false,clearance:gap,positionSchematic:true});
          return;
        }
        // Keep head and side clearance within each source bedroom envelope.
        const clearance=r.bedClearance;
        const fourBed=slots.length===4;
        const headGap=window.WardBedPlacement.headClearance(rb.width,slots.length);
        const perSide=slots.length===4?2:slots.length;
        const displayLength=r.bedDisplaySize?.length||1.8,displayWidth=r.bedDisplaySize?.width||.9;
        const fitWidth=Math.max(.1,(rb.width-2*headGap-(slots.length===4?.3:0))/(slots.length===4?2:1));
        const width=fourBed?Math.min(displayLength,fitWidth):clearance?Math.min(displayLength,fitWidth,(rb.width-clearance*2-(slots.length===4?.6:0))/(slots.length===4?2:1)):Math.min(displayLength,fitWidth);
        // Preserve a realistic bed width first; reduce edge clearance when a
        // narrow room cannot fit both the target beds and the requested gaps.
        const between=fourBed?.25:slots.length===3?.12:.2;
        const requestedSideGap=clearance??window.WardBedPlacement.sideClearance;
        const maxSideGap=Math.max(0,(rb.depth-displayWidth*perSide-between*(perSide-1))/2);
        const sideGap=Math.min(requestedSideGap,maxSideGap);
        const depth=Math.min(displayWidth,Math.max(.1,(rb.depth-sideGap*2-between*(perSide-1))/perSide));
        const edge=rb.depth/2-depth/2-sideGap;
        const slot={...window.WardBedPlacement.slot(slots.length,i),...(r.bedHeadSide?{headSide:r.bedHeadSide}:{})};
        const z=rb.z+(r.upper?1:-1)*(edge-slot.fraction*edge*2);
        const sign=slot.headSide==='west'?-1:1;
        beds.push({bedId:r.bedIds[i],displayLabel:r.bedSymbolOnly?`${r.roomName||r.ward+r.roomCode} 床位示意（非實際床數）`:`${r.ward}${r.roomCode}-${seq}`,roomCode:r.roomCode,ward:r.ward,x:rb.x+sign*(rb.width/2-width/2-headGap),y:0.35,z,width,depth,height:0.7,rotation:0,headSide:slot.headSide,...(r.bedAxis?{axis:r.bedAxis}:{}),isSchematic:!bySeq.has(seq),...(r.bedSymbolOnly?{symbolOnly:true,bedLabel:'示意'}:{}),...(clearance?{clearance}:{})});
      });
      if(turnChildBed)for(const bed of beds.slice(firstRoomBed)){
        [bed.x,bed.z]=[bed.z,bed.x];
        [bed.width,bed.depth]=[bed.depth,bed.width];
        bed.headSide=bed.headSide==='west'?'north':'south';
        bed.axis='north-south';
      }
      const pair=beds.slice(firstRoomBed);
      if(pair.length===2){
        // Spread the two existing symbols within the safe bed zone. Keep
        // their size, headboard direction and source bed IDs unchanged.
        const zone=r.bedBounds||r.bounds;
        const axis=Math.abs(pair[1].x-pair[0].x)>Math.abs(pair[1].z-pair[0].z)?'x':'z';
        const size=axis==='x'?'width':'depth';
        const ordered=[...pair].sort((a,b)=>a[axis]-b[axis]);
        const gapBefore=ordered[1][axis]-ordered[0][axis]-(ordered[0][size]+ordered[1][size])/2;
        const margin=Math.max(r.bedClearance||0,Math.min(.4,zone[size]*.08));
        const low=zone[axis]-zone[size]/2+ordered[0][size]/2+margin;
        const high=zone[axis]+zone[size]/2-ordered[1][size]/2-margin;
        ordered[0][axis]-=Math.min(.5,Math.max(0,ordered[0][axis]-low));
        ordered[1][axis]+=Math.min(.5,Math.max(0,high-ordered[1][axis]));
        const gapAfter=ordered[1][axis]-ordered[0][axis]-(ordered[0][size]+ordered[1][size])/2;
        r.doubleBedSpacing={axis,gapBefore,gapAfter};
        if(gapAfter>gapBefore+1e-8){r.bedSpacingSchematic=true;pair.forEach(b=>b.positionSchematic=true);}
      }
    }
    layout.beds=beds;
  }
  window.WARD_PLAN_BEDS=lookup;
  window.WARD_11C_PLAN=spec;
  window.WARD_11C_CORRIDORS=spec.corridors;
})();
