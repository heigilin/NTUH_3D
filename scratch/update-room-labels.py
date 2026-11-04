from pathlib import Path
import shutil,re
p=Path.cwd();backup=p/'scratch/before-room-label-priority';backup.mkdir(exist_ok=True)
for name in ['js/ward-plan-layout.js','js/ward-plan-2d.js','js/app.js','index.html']:shutil.copy2(p/name,backup/Path(name).name)
f=p/'js/ward-plan-layout.js';t=f.read_text(encoding='utf-8');mark='    draw(ctx, text, x, y, width, height, maxSize=20) {'
assert mark in t;t=t.replace(mark,'''    // Largest readable strip in a room that does not intersect any bed footprint.
    place(room, beds) {
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
''' +mark,1);f.write_text(t,encoding='utf-8')
f=p/'js/app.js';t=f.read_text(encoding='utf-8');a=t.index('        // 護理站檯面平面標示');b=t.index('\n      });',a);t=t[:a]+'''        // Keep the desk geometry; omit its text to prioritize room information.
''' +t[b:]
a=t.index('        // 病室地坪平面標示');b=t.index('\n      });',a)
t=t[:a]+'''        const labelBeds=(wardLayout.beds||[]).filter(bed=>bed.ward===rm.ward&&bed.roomCode===rm.roomCode).map(bed=>({x:bed.x-.9,y:bed.z-.45,w:1.8,h:.9}));
        const labelBox=window.WardPlanLabels.place({x:rb.x-rb.width/2,y:rb.z-rb.depth/2,w:rb.width,h:rb.depth},labelBeds);
        const roomCanvas = document.createElement('canvas');
        roomCanvas.width = 512;roomCanvas.height = 144;
        const rctx = roomCanvas.getContext('2d');
        rctx.fillStyle = '#102f43';
        window.WardPlanLabels.draw(rctx,window.WardPlanLabels.room(rm),256,72,496,128,96);
        const rLabelMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(labelBox.w,labelBox.h),
          new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(roomCanvas),transparent:true,depthWrite:false,depthTest:false})
        );
        rLabelMesh.name='room-label-'+rm.ward+'-'+rm.roomCode;
        rLabelMesh.userData={isRoomLabel:true,ward:rm.ward,roomCode:rm.roomCode,labelBox};
        rLabelMesh.renderOrder=100;
        rLabelMesh.rotation.x=-Math.PI/2;
        rLabelMesh.position.set(b.position.x+labelBox.x+labelBox.w/2,floorY+1.32,b.position.z+labelBox.y+labelBox.h/2);
        this.floorSliceGroup.add(rLabelMesh);
''' +t[b:]
t=t.replace('        if (labelText) {','        if (labelText && !/護理站/.test(labelText)) {',1);f.write_text(t,encoding='utf-8')
f=p/'js/ward-plan-2d.js';t=f.read_text(encoding='utf-8');t=t.replace("ctx.fillStyle=C.ink;window.WardPlanLabels.draw(ctx,p.label,p.x+p.w/2,p.y+p.h/2,Math.max(1,p.w-12),Math.max(1,p.h-12),22);", "if(p.kind!=='nurse'&&!/護理站/.test(p.label)){ctx.fillStyle=C.ink;window.WardPlanLabels.draw(ctx,p.label,p.x+p.w/2,p.y+p.h/2,Math.max(1,p.w-12),Math.max(1,p.h-12),22);}")
t=t.replace("      ctx.fillStyle=C.ink;window.WardPlanLabels.draw(ctx,r.label,r.x+r.w/2,r.y+24,Math.max(1,r.w-12),34,20);",'')
needle='    ctx.translate(s.width/2,s.height/2);manager.wardHistory'
assert needle in t;t=t.replace(needle,'''    s.rooms.forEach(r=>{
      const label=window.WardPlanLabels.place(r,s.beds.filter(b=>b.room===r));
      ctx.fillStyle=C.ink;
      window.WardPlanLabels.draw(ctx,r.label,label.x+label.w/2,label.y+label.h/2,label.w,label.h,34);
    });
    ctx.translate(s.width/2,s.height/2);manager.wardHistory''');f.write_text(t,encoding='utf-8')
for f in p.glob('*.html'):
 t=f.read_text(encoding='utf-8');original=t
 for src in ['js/app.js','js/ward-plan-layout.js','js/ward-plan-2d.js']:
  t=re.sub(r'src="'+re.escape(src)+r'(?:\?[^" ]*)?"','src="'+src+'?v=20261030-room-label-priority-1"',t)
 if t!=original:f.write_text(t,encoding='utf-8')
print('Applied shared room-label rules and removed nursing-station captions.')
