from pathlib import Path
import shutil,json
p=Path.cwd();backup=p/'scratch/before-east-entry-soft-colors';backup.mkdir(exist_ok=True)
for n in ['js/building-models.js','js/app.js','js/data/campus-data.js']:
 shutil.copy2(p/n,backup/Path(n).name)
f=p/'js/building-models.js';t=f.read_text(encoding='utf-8');a='        this.createChildrenHospital(b, bGroup);';b='''        // Local +Z facade turns toward world +X (east / Zhongshan South Road).
        // Swap local dimensions so the existing world footprint stays 38 x 34.
        const childModel = new THREE.Group();
        childModel.name = 'children-east-facing-model';
        childModel.position.set(b.position.x, 0, b.position.z);
        childModel.rotation.y = Math.PI / 2;
        this.createChildrenHospital({...b, position:{x:0,z:0}, dimensions:{width:b.dimensions.depth,depth:b.dimensions.width}}, childModel);
        bGroup.add(childModel);''';assert a in t;t=t.replace(a,b,1)
t=t.replace('青島西路正面','中山南路東向正面').replace('面向青島西路南側','面向中山南路東側').replace('正面青島西路入口','正面中山南路入口')
for a,b in {'0x943d2c':'0xb98170','0x753428':'0xa66f61','0xcc7748':'0xc7957c','0xdc8c5c':'0xd8ae94','0xf8a682':'0xe4bba8','0xe2a84a':'0xd8b56b','0xb84b3c':'0xb98177','0xd47535':'0xc59a71','0x2d7a64':'0x62877a'}.items():t=t.replace(a,b)
f.write_text(t,encoding='utf-8')
f=p/'js/app.js';t=f.read_text(encoding='utf-8');t=t.replace('new THREE.BoxGeometry(18.0, 0.10, 5.0)','new THREE.BoxGeometry(5.0, 0.10, 18.0)',1).replace('childEntry.position.set(7.2, 0.05, -39.0);','childEntry.position.set(28.7, 0.05, -56.0);\n    childEntry.name = \'children-east-entry-threshold\';')
for a,b in {'0x7da276':'0x91aa88','0x73976c':'0x849e7b','0x769a6f':'0x8ba583','0x484b50':'0x62666a',"rgba(150, 44, 32, 0.92)":"rgba(158, 113, 99, 0.94)","rgba(217, 119, 54, 0.92)":"rgba(177, 139, 112, 0.94)","'#a84c36'":"'#b98170'","'#7c2d1b'":"'#946b5e'","'#d97736'":"'#c7957c'","'#a44e19'":"'#a88068'"}.items():t=t.replace(a,b)
f.write_text(t,encoding='utf-8')
f=p/'js/data/campus-data.js';t=f.read_text(encoding='utf-8');prefix=t[:t.index('=')+1];d=json.loads(t[t.index('=')+1:].strip().rstrip(';'))
for item in d['buildings']:
 if item.get('campus')=='west' and item['id']!='JINGFU_GATE':
  item['color']='#b98170'
  if 'roofColor' in item and item['id']!='W01_LOBBY':item['roofColor']='#a66f61'
 if item['id']=='CHILD_HOSPITAL':
  item['color']='#c7957c';item['roofColor']='#d8ae94';item['entranceDirection']='east';item['entranceRoad']='中山南路'
  item['description']=item['description'].replace('位於西址北側。','位於西址北側，主要入口朝東、面向中山南路。')
for key,val in d.get('campuses',{}).items():
 if key=='west':val['color']='#b98170'
 if key=='children':val['color']='#c7957c'
f.write_text(prefix+' '+json.dumps(d,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
print('Updated entry direction and soft campus palette; backup:',backup)
