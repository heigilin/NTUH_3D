from pathlib import Path
import shutil,re,json
p=Path.cwd();backup=p/'scratch/before-west-heritage-entrance';backup.mkdir(exist_ok=True)
for name in ['js/building-models.js','js/data/campus-data.js','js/app.js','index.html']:shutil.copy2(p/name,backup/Path(name).name)
f=p/'js/building-models.js';t=f.read_text(encoding='utf-8');a=t.index('    createWestLobby(b, parent) {');end=t.index('      // D. 常德街',a)
prefix='''    createWestLobby(b, parent) {
      const w=b.dimensions.width,d=b.dimensions.depth;
      const h=b.exteriorDisplayHeight||b.height,px=b.position.x,pz=b.position.z;
      const front=pz+d/2;
      const matBrick=new THREE.MeshStandardMaterial({color:0xbf7658,roughness:.80});
      const matWhiteStone=new THREE.MeshStandardMaterial({color:0xbcb9a8,roughness:.80});
      const stoneLight=new THREE.MeshStandardMaterial({color:0xdcd5c2,roughness:.75});
      const stoneShade=new THREE.MeshStandardMaterial({color:0x969683,roughness:.85});
      const roofMaterial=new THREE.MeshStandardMaterial({color:0x717365,roughness:.88});
      const glassMaterial=new THREE.MeshStandardMaterial({color:0x74817b,roughness:.50,metalness:.06});
      const matDarkDoor=new THREE.MeshStandardMaterial({color:0x554a38,roughness:.75});
      const add=(geometry,material,x,y,z,name)=>{
        const mesh=new THREE.Mesh(geometry,material);mesh.position.set(px+x,y,z);mesh.name=name||'west-entrance-detail';mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
      };
      const box=(width,height,depth,material,x,y,z,name)=>add(new THREE.BoxGeometry(width,height,depth),material,x,y,z,name);
      const column=(x,y,z,height,radius,material=matWhiteStone)=>{
        add(new THREE.CylinderGeometry(radius*.90,radius,height,14),material,x,y,z);
        box(radius*2.8,.22,radius*2.8,stoneLight,x,y-height/2+.08,z);
        box(radius*3,.25,radius*3,stoneLight,x,y+height/2-.05,z);
      };
      // Photo-based heritage facade; ornamental dimensions are a visual approximation.
      box(w,h,d,matBrick,0,h/2,pz,'west-entrance-brick-body');
      box(w*1.025,.38,d*1.025,matWhiteStone,0,h+.12,pz);
      box(w*.96,.35,d*.96,roofMaterial,0,h+.42,pz);
      for(const fraction of [.12,.24,.43,.52,.70,.83])box(w*1.01,.24,d*1.01,stoneLight,0,h*fraction,pz);
      for(const x of [-w*.48,-w*.27,w*.27,w*.48]){
        box(.64,h+.35,.70,matWhiteStone,x,h/2,front+.28);
        box(.95,.38,.92,stoneLight,x,h*.52,front+.37);
      }
      // Side and rear retain the common heritage window style.
      this.addWestHeritageWindows(b,parent,h,matWhiteStone,true);
      const archShape=(width,height)=>{
        const r=width/2,s=new THREE.Shape();s.moveTo(-r,0);s.lineTo(r,0);s.lineTo(r,height-r);s.absarc(0,height-r,r,0,Math.PI,false);s.lineTo(-r,0);return s;
      };
      const archWindow=(x,bottom,width,height)=>{
        add(new THREE.ShapeGeometry(archShape(width+.48,height+.38)),stoneLight,x,bottom-.12,front+.66,'west-entrance-arch-frame');
        add(new THREE.ShapeGeometry(archShape(width,height)),glassMaterial,x,bottom,front+.70,'west-entrance-arched-window');
        box(.10,height,.12,matWhiteStone,x,bottom+height/2,front+.74);
        box(width,.10,.12,matWhiteStone,x,bottom+height*.46,front+.74);
        box(width+.72,.22,.70,matWhiteStone,x,bottom-.12,front+.64);
        box(.45,.46,.36,stoneLight,x,bottom+height+.02,front+.80);
      };
      const upperBase=h*.58;
      for(const x of [-w*.35,w*.35])archWindow(x,upperBase,2.25,3.65);
      for(const x of [-w*.20,w*.20])archWindow(x,upperBase+.25,1.65,2.75);
      for(const x of [-w*.44,-w*.26,-w*.10,w*.10,w*.26,w*.44])column(x,h*.76,front+.62,h*.40,.23);
      // Stone lintel, small dentils and the central ornamental crest.
      for(const y of [h*.53,h*.91]){
        box(w*1.04,.35,1.0,matWhiteStone,0,y,front+.40);
        box(w*1.06,.16,1.12,stoneLight,0,y+.24,front+.46);
        for(let x=-w*.48;x<w*.49;x+=.72)box(.29,.26,.54,stoneShade,x,y-.25,front+.60);
      }
      const crest=new THREE.Shape();crest.moveTo(-2.7,0);crest.lineTo(-2.7,.7);crest.bezierCurveTo(-2.4,1.6,-1.9,2.6,0,2.9);crest.bezierCurveTo(1.9,2.6,2.4,1.6,2.7,.7);crest.lineTo(2.7,0);crest.closePath();
      add(new THREE.ExtrudeGeometry(crest,{depth:.44,bevelEnabled:false,curveSegments:18}),matWhiteStone,0,h-.15,front+.55,'west-entrance-central-crest');
      add(new THREE.CircleGeometry(.69,28),stoneShade,0,h+1.15,front+1.02,'west-entrance-crest-medallion');
      const medallion=add(new THREE.TorusGeometry(.79,.12,8,32),stoneLight,0,h+1.15,front+1.06);
      box(.13,1.40,.16,stoneLight,0,h+1.15,front+1.20);
      for(const x of [-w*.35,w*.35]){
        const triangle=new THREE.Shape();triangle.moveTo(-3.0,0);triangle.lineTo(0,2.15);triangle.lineTo(3.0,0);triangle.closePath();
        add(new THREE.ExtrudeGeometry(triangle,{depth:.60,bevelEnabled:false}),matWhiteStone,x,h-.10,front+.15,'west-entrance-side-pediment');
        const brickTriangle=new THREE.Shape();brickTriangle.moveTo(-2.25,.22);brickTriangle.lineTo(0,1.78);brickTriangle.lineTo(2.25,.22);brickTriangle.closePath();
        add(new THREE.ShapeGeometry(brickTriangle),matBrick,x,h-.10,front+.78);
        add(new THREE.TorusGeometry(.51,.12,8,24),stoneLight,x,h+.68,front+.87);
        add(new THREE.CircleGeometry(.40,24),glassMaterial,x,h+.68,front+.84);
      }
      // Recessed entrance doors remain visible behind the projecting paired-column porch.
      for(const x of [-3.2,0,3.2]){
        box(2.45,h*.36,.22,matDarkDoor,x,h*.18,front+.12);
        box(2.10,h*.24,.12,glassMaterial,x,h*.22,front+.27);
      }
      const porticoW=19.2,porticoD=6.4,porticoH=h*.44,porticoZ=front+porticoD/2;
      box(porticoW*1.10,.18,porticoD+1.0,stoneShade,0,.09,porticoZ,'west-entrance-porch-floor');
      for(const x of [-8.0,-2.7,2.7,8.0])for(const pair of [-.35,.35])column(x+pair,porticoH/2,front+porticoD-.52,porticoH,.32);
      for(const x of [-8.0,8.0])column(x,porticoH/2,front+1.10,porticoH,.35);
      box(porticoW,.52,porticoD,matWhiteStone,0,porticoH+.26,porticoZ,'west-entrance-stone-entablature');
      box(porticoW*1.035,.20,porticoD*1.04,stoneLight,0,porticoH+.62,porticoZ);
      box(porticoW*.98,.14,porticoD*.96,roofMaterial,0,porticoH+.78,porticoZ);
      // Front and side balcony balustrades, rather than a solid red parapet.
      const railY=porticoH+1.35,railFront=front+porticoD-.10;
      for(const y of [railY-.45,railY+.47]){
        box(porticoW,.20,.40,matWhiteStone,0,y,railFront);
        for(const x of [-porticoW/2,porticoW/2])box(.40,.20,porticoD,matWhiteStone,x,y,porticoZ);
      }
      for(let x=-porticoW/2+.38;x<porticoW/2;x+=.62)column(x,railY,railFront,.78,.10);
      for(const x of [-porticoW/2,porticoW/2])for(let z=front+.35;z<railFront;z+=.62)column(x,railY,z,.78,.10);
''' 
t=t[:a]+prefix+t[end:];f.write_text(t,encoding='utf-8')
f=p/'js/data/campus-data.js';t=f.read_text(encoding='utf-8');prefix=t[:t.index('=')+1];data=json.loads(t[t.index('=')+1:].strip().rstrip(';'))
for b in data['buildings']:
 if b['id']=='W01_LOBBY':
  b['exteriorDisplayHeight']=12.6;b['color']='#bf7658';b['roofColor']='#717365';b['hasRoofDome']=False
  b['description']='西址歷史大門：紅磚與灰米色石材橫帶、古典雙柱門廊、陽台欄杆、中央曲線山牆及兩側山牆；依提供照片作辨識性造型，尺寸非實測。'
f.write_text(prefix+' '+json.dumps(data,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
f=p/'js/app.js';t=f.read_text(encoding='utf-8');start=t.index('  createBuildings() {');end=t.index('  createBuildingLabelSprite',start);part=t[start:end].replace('const h = b.height;','const h = b.exteriorDisplayHeight || b.height;');t=t[:start]+part+t[end:];f.write_text(t,encoding='utf-8')
f=p/'index.html';t=f.read_text(encoding='utf-8')
for src in ['js/building-models.js','js/data/campus-data.js','js/app.js']:
 t=re.sub(r'src="'+re.escape(src)+r'(?:\?[^" ]*)?"','src="'+src+'?v=20261030-west-entrance-heritage-1"',t)
f.write_text(t,encoding='utf-8')
print('West entrance heritage facade rebuilt; original footprint and lighting retained.')
