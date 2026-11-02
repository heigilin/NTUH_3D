/* E_03F/E_04F ICU outlines only. Registry bed identifiers are immutable.
   Open nursing areas are circulation surfaces, not solid desks in an aisle. */
(function(){
 const api=window.WardSourceTraces,added=[];
 const add=(f,w,rooms,spaces,corridors,extra={})=>{const p={building:'E01_MAIN',floor:f+'F',ward:w,source:`E_0${f}F.pdf`,image:`scratch/floor-source-review/E_0${f}F.png`,origin:f===3?[550,1260]:[335,758],scale:f===3?.048:.08,rooms,spaces,corridors,station:null,partialCorridors:true,notes:[],...extra};api.plans.push(p);added.push(p);return p;};
 // B1/B2 are separately numbered ICU units in the drawing. B2 source
 // numerals 1/2/3/5/6/7/8/9 correspond to registry 11/12/13/15/16/17/18/19.
 add(3,'03B1',[
  ['01',230,686,62,75,true],['02',161,686,65,75,true],['03',27,687,62,96,true],['05',62,907,61,55,false],
  ['06',161,905,64,120,false],['07',230,905,62,120,false],['08',297,905,63,120,false],['09',365,905,62,120,false]
 ],[['準備室',95,686,62,96],['前室',27,787,130,32,'anteroom'],['醫師辦公室／實驗室',297,686,81,163],['總醫師辦公室',432,905,62,120],['值班室',498,905,64,120],['護理長辦公室及值班空間',426,686,136,146]],
 [['03B1開放護理區',161,765,132,137],['03B1西側開放護理區',27,819,134,83],['03B1內側通路',293,852,137,50],['03B核心走道',430,834,202,68]],
 {notes:['按E_03F.pdf西側3B1的病室、前室、實驗室與護理區邊界定位。','清單10床保留；原圖相應南排標為總醫師辦公室／值班室，沒有以猜測把10床塞入辦公室。']});
 add(3,'03B2',[
  ['11',764,686,65,76,true],['12',835,686,65,76,true],['13',973,687,62,96,true],['15',938,980,64,45,false],
  ['16',838,905,62,120,false],['17',770,905,62,120,false],['18',703,905,62,120,false],['19',635,905,62,120,false]
 ],[['準備室',904,686,63,108],['辦公室／清潔間',938,905,64,72],['護理師休息室／工作人員用膳室',565,905,66,120],['配膳室／污物室／開藥及醫材區',635,686,126,146]],
 [['03B2開放護理區',764,766,136,136],['03B2東側開放護理區',900,798,69,104],['03B2通往東側核心走道',969,844,121,58],['03B2內側通路',632,834,132,68]],
 {notes:['依東側3B2單元定位，保持11至20來源床號，沒有把東單元改回01至10。','原圖以一、二、三、五至九表示單元內病室；依清單沿用11、12、13、15至19。20床保留待唯一位置確認，不視為錯誤床號。']});
 add(3,'03C',[
  ['01',497,1625,63,82,false],['02',430,1625,63,82,false],['03',294,1557,62,33,false],['05',360,1361,31,62,true],
  ['06',430,1361,62,110,true],['07',497,1361,62,110,true],['08',565,1361,62,110,true],['09',632,1361,63,110,true],['10',575,1546,69,70,false],
  ['11',1037,1630,62,77,false],['12',1106,1630,61,77,false],['13',1207,1363,31,37,true],['15',1174,1363,29,37,true],
  ['16',1106,1363,61,108,true],['17',1038,1363,61,108,true],['18',970,1363,61,108,true],['19',903,1363,61,108,true],['20',1274,1595,62,99,false]
 ],[['浴廁（西）',395,1361,31,40],['污物室（西北）',360,1427,31,71],['護理師更衣及值夜空間',700,1361,130,110],['總醫師室',835,1363,63,108],
  ['加護病房（十）',294,1594,62,100],['準備室（西）',361,1594,64,100],['污物室（西南）',565,1625,80,69],['器材儲放及護理長辦公空間',701,1533,128,161],
  ['辦公室／浴廁／清潔間',1207,1404,31,95],['準備室（東）',1173,1595,64,99],['污物室／倉庫',904,1535,130,90]],
 [['03C西側開放護理區',429,1475,266,55],['03C西側護理通路',360,1530,70,60],['03C西側病室入口通路',430,1530,143,93],
  ['03C東側開放護理區',904,1475,299,57],['03C東側病室入口通路',1036,1532,135,95],['03C東側走道',1203,1502,135,90],
  ['03C中央走道',832,1475,68,152]],
 {notes:['按E_03F.pdf兩個開放護理單元重建，不使用普通雙排病房套版。東單元仍使用床號清單11至20。','原圖同時有中文「加護病房（十）」與明確阿拉伯數字「10病室」；保留兩處空間，只在10病室放置一次10床，沒有重複床號。','東北角依可辨識小隔間呈現13、15；床位在各區內為示意，非實測床具座標。']});
 const beds=(w,codes)=>codes.flatMap(code=>window.WARD_BED_IDS[w]?.[code]||[]);
 add(4,'04C1',[
  ['01',282,975,145,34,false],['02',199,951,77,35,false],['03',199,915,77,32,false],['05',238,797,38,48,true],['06',281,797,32,48,true],
  ['07',359,797,35,48,true],['08',398,797,35,48,true],['09',438,797,34,48,true],['10',477,797,35,48,true]
 ],[['備藥區',319,797,35,48],['浴廁及前室',238,848,75,18,'anteroom'],['北排前室',359,848,153,15,'anteroom'],['庫房／設備室',282,880,77,26],['水療室',365,910,62,28],['燒燙傷中心',282,940,145,31],['污物及清潔空間',434,940,78,45]],
 [['04C1北排走道',317,867,196,12],['04C1開放護理區',278,908,82,28],['04C1西側病室入口',199,879,79,32]],
 {notes:['依E_04F.pdf西側4C1的05／06、備藥區、正壓病房分隔線及南側01／02／03定位。','北排07至10依清單保留兩床配置，沒有把雙床視為兩間病室。','護理區為開放地坪，沒有另外在走道中放置櫃台障礙。']});
 add(4,'04C2',[
  ['11',518,797,34,48,true],['10',557,797,35,48,true],['09',597,797,31,48,true],['08',633,797,35,48,true],['07',674,797,33,48,true],['06',712,797,37,48,true],
  ['05',742,909,45,35,false],['01',638,979,31,29,false],['02',675,979,33,29,false]
 ],[['北排前室',518,848,231,14,'anteroom'],['前室（東）',752,849,35,15,'anteroom'],['護理長室／醫材儲藏室',560,892,74,49],['家屬諮詢室',550,943,84,19],['污物室及清潔間',550,965,84,18],['機房／管道間',550,987,84,21],['加護病房（3）／儀器空間',742,950,45,35]],
 [['04C2北排走道',518,866,269,18],['04C2開放護理區',638,889,101,86],['04C2護理區西側通路',550,884,86,7]],
 {notes:['依E_04F.pdf東側4C2分隔線恢復北排11、10、09、08、07、06，保留原床號。','原圖部分文字只標11／9／7，但分隔線仍有相鄰格位；依床號清單保留完整北排。','原圖東側（3）未有03床號，不改號補造床位，依其空間保留。']});
 // Current 4D1 relationships supplied in the user's 2026-11-02 sketch.
 // Fit the sketch into the existing floor envelope; dimensions are estimates.
 add(4,'04D1', [
  ['01',199,1285,101,92,false],['02',300,1300,100,77,false],['03',400,1300,80,77,false],
  ['05',480,1300,100,77,false],['06',580,1300,100,77,false],['07',680,1300,118,77,false],
  ['08',380,1200,90,60,true],['09',470,1200,90,60,true],['10',560,1200,90,60,true]
 ],[['07前室',680,1280,118,20,'anteroom'],['醫材室',700,1190,98,70]],
 [['04D1中央通道',199,1260,624,20],['04D1病室側通道',300,1280,380,20],['04D1雙床房入口通道',199,1280,101,5]],
 {station:['04D1 護理站',199,1188,181,72],source:'使用者提供4D1配置草圖（2026-11-02）',image:null,userSketch:true,
 notes:['以本次使用者手繪配置取代舊原圖及前次匿名床區推定。','下排由左至右為01、02、03、05、06、07；上排為護理站、08、09、10，右側為醫材室。','01為兩床，07前室位於通道側；9間病室共10個原始床號完整對應。','位置與尺寸按手繪相對關係估算，非實測；照片轉正僅為閱讀，未據此新增實際羅盤方位或門扇方向。']});
 const previous=api.apply;
 api.apply=function(root){
  // Normalize the higher resolution 3F scan to the main-building footprint.
  for(const p of api.plans.filter(p=>p.building==='E01_MAIN'&&p.floor==='3F')){p.origin=[550,1260];p.scale=.048;}
  const a1=api.plans.find(p=>p.ward==='04A1'&&p.floor==='4F');
  if(a1){const c=a1.corridors.find(c=>c[0]==='04A1開放護理區');if(c)c[4]=103;}
  previous(root);
  const project=(f,x,y,w,h)=>{const s=f===3?.048:.08,o=f===3?[550,1260]:[335,758];return{x:(x+w/2-o[0])*s,z:(y+h/2-o[1])*s,width:w*s,depth:h*s,y:0,height:.05};};
  for(const f of [3,4]){
   const l=root.E01_MAIN[f+'F'];
   const source=l.sourceTraceCorridors.filter(c=>!c.isInterWing);
   l.sourceTraceCorridors=source;
   const route=f===3?[[1005,846,85,47],[1060,846,28,480],[1060,1326,310,22],[1342,1326,28,220],[1242,1517,128,27]]:[[626,516,35,28],[638,516,23,254],[638,770,185,21],[802,770,21,114],[710,866,113,18]];
   route.forEach(([x,y,w,h],i)=>l.sourceTraceCorridors.push({id:`SOURCE-${f}F-EAST-BC-${i}`,name:'南北棟東側連通走道',ward:f+'BC',connects:f===3?['03B1','03B2','03C']:['04B1','04B2','04C1','04C2'],bounds:project(f,x,y,w,h),sourceRect:{x,y,w,h},sourceTrace:true,sourcePlan:`E_0${f}F.pdf`,isInterWing:true,mainSpine:true,connectionLabel:i===1,connectionText:'南北棟連通走道',labelLines:['南','北','棟','連','通','走','道']}));
   const core=f===3?[
    ['北棟A區中央連接',432,132,44,44],['北棟A區核心南側走道',525,344,104,43],['北棟A/B核心走道',574,387,55,447],
    ['3C西側中央連接',695,1475,137,55],['3C東側中央連接',900,1475,4,57]
   ]:[
    ['4A1南側連接',94,167,28,6],['4A1內側連接',274,143,55,24],['北棟A/B核心走道',329,143,33,389],['4A2內側連接',362,143,38,24],
    ['4A2北側入口連接',445,64,1,30],['4A2東側入口連接',583,97,1,19],
    ['4B1內側入口連接',202,500,1,29],['4B1內側南連接',203,529,55,2],['4B中央走道',258,500,143,29],
    ['4B2內側入口連接',472,500,1,32],['4B2內側南連接',401,532,71,1],['4B2東側出口連接',595,516,31,28],
    ['4C1西北側走道',199,867,118,12],['4C北排中央連接',513,866,5,13],['4C2護理區入口連接',638,884,101,5],['4C2西側通路連接',636,884,2,7],
    ['南棟C/D東側走道',802,884,21,411]
   ];
   l.sourceTraceCorridors.push(...core.map(([name,x,y,w,h],i)=>{
    const owned=f===3&&name.startsWith('3C')?'03C':/^4[ABCD][12]/.test(name)?'0'+name.match(/^4[ABCD][12]/)[0]:f+'CORE';
    return{id:`SOURCE-${f}F-ICU-CORE-${i}`,name,ward:owned,bounds:project(f,x,y,w,h),sourceRect:{x,y,w,h},sourceTrace:true,sourcePlan:`E_0${f}F.pdf`,mainSpine:true};
   }));
   const shared=f===3?[
    ['3B共用東西走道',632,850,373,22,['03B1','03B2']]
   ]:[
    
   ];
   l.sourceTraceCorridors.push(...shared.map(([name,x,y,w,h,connects],i)=>({id:`SOURCE-${f}F-SHARED-${i}`,name,ward:f+'SHARED',connects,bounds:project(f,x,y,w,h),sourceRect:{x,y,w,h},sourceTrace:true,sourcePlan:`E_0${f}F.pdf`,mainSpine:true})));
   if(f===4)for(const c of l.sourceTraceCorridors){
    if(/^04B[12]$/.test(c.ward)||c.name.startsWith('4B'))c.connects=['04B1','04B2'];
    if(/^04C[12]$/.test(c.ward)||c.name.startsWith('4C'))c.connects=['04C1','04C2'];
   }
   // Retain reviewed 3A/4A/4B outlines; replace all legacy C/D room imports.
   l.sourceTracePartialCorridors=false;
   for(const r of l.rooms.filter(r=>r.sourceTrace)){r.sourceFitBeds=!r.bedClearance;if(r.ward==='04D1'){r.openBay=false;r.roomName='04D1'+r.roomCode;r.displayRoomLabel=r.roomCode;r.isSchematic=false;r.positionIsSchematic=true;r.geometryBasis='user-sketch-proportional';delete r.bedSymbolOnly;delete r.bedSymbolBasis;r.door={side:r.upper?'south':'north',offset:.5,sourceChecked:true,sourcePlan:'使用者4D1配置草圖',basis:'手繪所示面向中央通道／07前室；門寬與位置為示意'};}}
   for(const fac of l.facilities.filter(fac=>fac.sourceTrace&&fac.sourceRect))fac.bounds={...fac.bounds,...project(f,fac.sourceRect.x,fac.sourceRect.y,fac.sourceRect.w,fac.sourceRect.h)};
   const hit=(a,b)=>Math.min(a.x+a.width/2,b.x+b.width/2)-Math.max(a.x-a.width/2,b.x-b.width/2)>1e-6&&Math.min(a.z+a.depth/2,b.z+b.depth/2)-Math.max(a.z-a.depth/2,b.z-b.depth/2)>1e-6;
   const valid=[...l.rooms,...l.facilities,...l.nursingStations,...l.sourceTraceCorridors.filter(c=>c.mainSpine)].filter(q=>q.sourceTrace);
   const bad=l.facilities.filter(q=>!q.sourceTrace&&valid.some(v=>hit(q.bounds,v.bounds)));
   l.sourceUnplacedSpaces.push(...bad.map(item=>({kind:'facilities',item,reason:'原圖重建ICU區後，舊套版設施保留待定位'})));l.facilities=l.facilities.filter(q=>!bad.includes(q));
  }
 };
})();
