from pathlib import Path
import re
p=Path.cwd()
code='''/* Room entrance placement is independent of bed order. Door swings are not
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
    if(!r.sourceRect||!right[r.ward]||!/^\\d+$/.test(r.roomCode))continue;
    r.door={side:r.sourceRect.y<aisleY[r.ward]?'south':'north',offset:right[r.ward].includes(r.roomCode)?.78:.22,
      sourceChecked:true,sourcePlan:'E_06F.pdf',basis:'source entrance side and left/right bay; jamb and width approximate'};
  }
  window.WardRoomDoors={get,segment,walls};
})();
'''
(p/'js/ward-door-layout.js').write_text(code,encoding='utf-8')
f=p/'js/ward-plan-2d.js';t=f.read_text(encoding='utf-8');mark="      const pixelsPerUnit=modelRoom?.bounds ? w/modelRoom.bounds.width : 24;"
assert mark in t;t=t.replace(mark,mark+"\n      r.door=window.WardRoomDoors?.get(modelRoom||{bounds:{width:w/24,depth:h/24},upper});\n      r.pixelsPerUnit=pixelsPerUnit;")
a=t.index('      const doorY=r.upper?');b=t.index('\n    });',a)
t=t[:a]+'''      const door=r.door||{side:r.upper?'south':'north',offset:.22,width:1};
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
''' +t[b:];f.write_text(t,encoding='utf-8')
f=p/'js/app.js';t=f.read_text(encoding='utf-8');a=t.index('        // 1.2m 透視矮牆',t.index('// D. 一般住院病室'));b=t.index('        const labelBeds=',a)
t=t[:a]+'''        // Low walls retain the same room outline, with a real entrance opening.
        const roomWallMaterial=new THREE.MeshStandardMaterial({color:wallCol,transparent:true,opacity:.14,depthWrite:false});
        const doorApi=window.WardRoomDoors;
        const wallParts=doorApi?doorApi.walls(rm):[];
        for(const part of wallParts){
          const geometry=new THREE.BoxGeometry(part.width,1.2,part.depth);
          const wall=new THREE.Mesh(geometry,roomWallMaterial);
          wall.position.set(b.position.x+part.x,floorY+.6,b.position.z+part.z);this.floorSliceGroup.add(wall);
          const edge=new THREE.LineSegments(new THREE.EdgesGeometry(geometry),new THREE.LineBasicMaterial({color:wallCol}));edge.position.copy(wall.position);this.floorSliceGroup.add(edge);
        }
        if(doorApi){
          const door=doorApi.segment(rm);
          const threshold=new THREE.Mesh(new THREE.PlaneGeometry(door.horizontal?door.width:.10,door.horizontal?.10:door.width),new THREE.MeshBasicMaterial({color:0xb7a58b,side:THREE.DoubleSide}));
          threshold.rotation.x=-Math.PI/2;
          threshold.position.set(b.position.x+(door.horizontal?door.center:door.fixed),floorY+.12,b.position.z+(door.horizontal?door.fixed:door.center));
          threshold.name='room-door-'+rm.ward+'-'+rm.roomCode;threshold.userData={isRoomDoor:true,ward:rm.ward,roomCode:rm.roomCode,side:door.side,offset:door.offset,sourceChecked:door.sourceChecked};this.floorSliceGroup.add(threshold);
        }

''' +t[b:];f.write_text(t,encoding='utf-8')
# Load the shared entrance data after the ward/bed model, before either renderer.
for f in p.glob('*.html'):
 t=f.read_text(encoding='utf-8');old=t
 if 'js/ward-plan-layout.js' in t and 'js/ward-door-layout.js' not in t:
  t=re.sub(r'(<script src="js/ward-plan-layout.js(?:\?[^" ]*)?"></script>)',r'\1<script src="js/ward-door-layout.js?v=20261031-6f-doors-1"></script>',t)
 for src in ['js/ward-source-6f.js','js/ward-plan-2d.js','js/app.js']:
  t=re.sub(r'src="'+re.escape(src)+r'(?:\?[^" ]*)?"','src="'+src+'?v=20261031-6f-doors-1"',t)
 if t!=old:f.write_text(t,encoding='utf-8')
print('Explicit sixth-floor door entries and shared 2D/3D openings applied.')
