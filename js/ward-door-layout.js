/* Room entrance placement is independent of bed order. Door swings are not
   inferred from the source scan: render an opening/jamb, not a guessed leaf. */
(function(){
  const right={
    '06A':['01','03','06','08','10','12','15','17','20'],
    '06B':['01','03','06','08','10','12','15','17','20','22'],
    '6C':['01','03','06','08','10','12','15','17','20'],
    '6D':['01','03','06','08','10','12','15','17','20','22']
  };
  const aisleY={'06A':193,'06B':587,'6C':986,'6D':1380};
  function get(room){
    const q=room.bounds||{width:room.w,depth:room.h};
    const saved=room.door||{};
    const side=saved.side||(room.upper?'south':'north');
    const length=['north','south'].includes(side)?q.width:q.depth;
    return {...saved,side,offset:saved.offset??.22,width:Math.min(saved.width||.95,length*.32),sourceChecked:!!saved.sourceChecked};
  }
  function segment(room){
    const q=room.bounds,d=get(room),horizontal=d.side==='north'||d.side==='south';
    const length=horizontal?q.width:q.depth,start=(horizontal?q.x:q.z)-length/2;
    const center=start+length*d.offset;
    return {...d,horizontal,start:center-d.width/2,end:center+d.width/2,center,
      fixed:horizontal?q.z+(d.side==='north'?-1:1)*q.depth/2:q.x+(d.side==='west'?-1:1)*q.width/2};
  }
  function walls(room){
    const q=room.bounds,door=segment(room),parts=[];
    const add=(side,lo,hi,fixed)=>{if(hi-lo<1e-5)return;const horizontal=side==='north'||side==='south';parts.push({side,x:horizontal?(lo+hi)/2:fixed,z:horizontal?fixed:(lo+hi)/2,width:horizontal?hi-lo:.045,depth:horizontal?.045:hi-lo});};
    for(const side of ['north','south','west','east']){
      const horizontal=side==='north'||side==='south',len=horizontal?q.width:q.depth,center=horizontal?q.x:q.z;
      const fixed=horizontal?q.z+(side==='north'?-1:1)*q.depth/2:q.x+(side==='west'?-1:1)*q.width/2;
      if(side===door.side){add(side,center-len/2,door.start,fixed);add(side,door.end,center+len/2,fixed);}
      else add(side,center-len/2,center+len/2,fixed);
    }
    return parts;
  }
  const floor=window.WARD_3D_LAYOUT_DATA?.E01_MAIN?.['6F'];
  for(const r of floor?.rooms||[]){
    if(!r.sourceRect||!right[r.ward]||!/^\d+$/.test(r.roomCode))continue;
    r.door={side:r.sourceRect.y<aisleY[r.ward]?'south':'north',offset:right[r.ward].includes(r.roomCode)?.78:.22,
      sourceChecked:true,sourcePlan:'E_06F.pdf',basis:'source entrance side and left/right bay; jamb and width approximate'};
  }
  function prepare(root){
    const rows=[];
    const rect=q=>({l:q.x-q.width/2,r:q.x+q.width/2,t:q.z-q.depth/2,b:q.z+q.depth/2});
    const hit=(a,b)=>Math.min(a.r,b.r)-Math.max(a.l,b.l)>1e-5&&Math.min(a.b,b.b)-Math.max(a.t,b.t)>1e-5;
    for(const [building,floors]of Object.entries(root))for(const[floor,l]of Object.entries(floors)){
      const rooms=(l.rooms||[]).filter(r=>r.bounds&&((r.bedCount||0)>0||/^\d+$/.test(r.roomCode)));
      const facilities=(l.facilities||[]).concat(l.nursingStations||[]).filter(r=>r.bounds);
      const access=[...(l.displayCorridors||l.sourceTraceCorridors||l.corridors||[]).filter(c=>c.bounds).map(c=>({...c,accessKind:'corridor'})),
        ...facilities.filter(f=>f.type==='anteroom'||/前室/.test(f.name||f.roomName||'')).map(f=>({...f,accessKind:'anteroom'}))];
      for(const r of rooms){
        const own=rect(r.bounds),old=get(r),sourceChecked=old.sourceChecked,candidates=[];
        const blockedBy=rooms.filter(q=>q!==r).concat(facilities);
        for(const target of access){
          const a=rect(target.bounds);
          const sides=sourceChecked?[old.side]:['north','south','west','east'];
          for(const side of sides){
            const horizontal=side==='north'||side==='south';
            const length=horizontal?r.bounds.width:r.bounds.depth;
            const width=Math.min(.95,length*.32),half=width/2;
            const lower=horizontal?own.l:own.t,upper=horizontal?own.r:own.b;
            const alo=horizontal?a.l:a.t,ahi=horizontal?a.r:a.b;
            const min=Math.max(lower+half+.02,alo+half),max=Math.min(upper-half-.02,ahi-half);
            if(min>max)continue;
            const fixed=side==='north'?own.t:side==='south'?own.b:side==='west'?own.l:own.r;
            const end=side==='north'?a.b:side==='south'?a.t:side==='west'?a.r:a.l;
            const gap=(side==='north'||side==='west')?fixed-end:end-fixed;
            if(gap<-.08||gap>8)continue;
            const options=sourceChecked?[lower+length*old.offset]:[lower+length*.22,lower+length*.5,lower+length*.78,(min+max)/2];
            for(const value of options){
              if(value<min-1e-5||value>max+1e-5)continue;
              const path=horizontal?{l:value-half,r:value+half,t:Math.min(fixed,end),b:Math.max(fixed,end)}:{l:Math.min(fixed,end),r:Math.max(fixed,end),t:value-half,b:value+half};
              const bad=blockedBy.filter(q=>q!==target && !(q.id&&q.id===target.id)).some(q=>hit(path,rect(q.bounds)));
              if(bad)continue;
              candidates.push({side,offset:(value-lower)/length,width,sourceChecked,sourcePlan:old.sourcePlan,
                accessId:target.id||target.name,accessKind:target.accessKind,gap:Math.max(0,gap),validation:'clear-access',
                score:Math.max(0,gap)+(side===old.side?0:.35)+Math.abs((value-lower)/length-old.offset)*.08});
            }
          }
        }
        candidates.sort((a,b)=>a.score-b.score);
        if(candidates.length){
          const chosen=candidates[0];delete chosen.score;
          r.door={...old,...chosen,basis:sourceChecked?old.basis:'clear geometric approach to corridor/anteroom; precise door bay pending source'};
        }else r.door={...old,validation:'needs-source-review',basis:old.basis||'no clear approach in existing plan geometry'};
        rows.push({building,floor,ward:r.ward,room:r.roomCode,door:{...r.door}});
      }
    }
    window.WARD_DOOR_AUDIT={rooms:rows.length,sourceChecked:rows.filter(r=>r.door.sourceChecked).length,
      clear:rows.filter(r=>r.door.validation==='clear-access').length,pending:rows.filter(r=>r.door.validation!=='clear-access'),rows};
    return window.WARD_DOOR_AUDIT;
  }
  window.WardRoomDoors={get,segment,walls,prepare};
})();
