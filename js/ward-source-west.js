/* West-campus source coordinates. Unnumbered source rooms use independent
   schematic IDs; clinical bed IDs are never assigned by left-to-right guess. */
(function(){
  const api=window.WardSourceTraces,plans=[];
  const add=(building,floor,ward,bedWard,source,rooms,station,corridors,spaces=[],options={})=>plans.push({
    building,floor:floor+'F',ward,bedWard,source:source+'.pdf',image:'floorplans/'+source+'.jpg',
    origin:[550,300],scale:.065,rooms,station,corridors,spaces,...options,
    notes:['依'+source+'.pdf的本病房區域取內接矩形，不複製其他病房。',
      '浴廁、凹角與門位仍為近似，床具位置和尺寸為示意；床頭、床尾及側邊留白。',
      ...(options.notes||[])]});
  const row=(codes,edges,y,h,upper)=>codes.map((code,i)=>[code,edges[i]+1,y,edges[i+1]-edges[i]-2,h,upper]);
  const generic=n=>Array.from({length:n},(_,i)=>'位置'+String(i+1).padStart(2,'0'));
  add('W04_WEST',1,'05W1','05W1','5W1',[
    ['25',35,315,74,43,true],['23',35,393,74,46,true],['21',35,444,74,64,true],
    ...row(['19','17'],[143,190,233],404,58,true),
    ...row(['15','13','11'],[268,313,363,408],404,58,true),
    ...row(['09','07','05','03','01'],[691,737,786,834,882,931],404,58,true)],
    ['05W1 護理站',563,426,81,33],[['05W1病房主走道',112,484,820,23],['05W1西端走道',111,315,28,169]],
    [['護理長室／值班及討論空間',409,404,153,56],['資料機房',234,404,32,58],['治療室',646,404,44,57]]);
  add('W03_WEST',2,'04W2','04W2','4W2',[
    ['17',25,265,78,77,false],['19',46,219,57,44,true],['15',160,164,81,101,true],
    ['13',243,164,47,101,true],['11',381,164,44,101,true],
    ...row(['09','07','05','03','01'],[618,672,729,784,838,893],165,100,true)],
    ['04W2 護理站',540,165,77,100],
    [['04W2主走道',104,266,789,36],['04W2西側走道',104,193,55,73],['04W2東端樓梯前走道',893,266,85,36]],
    [['陽光會客室',26,86,77,77],['洗衣熱食區',47,165,56,27],['西端廁所',47,194,56,24],
     ['四西B梯',105,128,53,63,'stair'],['庫房（西）',211,303,49,43],
     ['臨床試驗實驗室服務中心',292,164,87,101],['庫房（護理區）',427,164,33,54],
     ['醫師工作區',427,220,33,45],['化療準備室',489,303,71,29],
     ['護理長室',461,165,25,39],['醫師室',488,165,20,39],['更衣室',510,165,28,39],
     ['工作人員用膳空間',461,206,77,59],['護理師更衣室',564,303,69,43],['污物室',635,303,35,43],
     ['腫瘤部會議室',894,108,82,88],['四西A梯',894,198,82,67,'stair']],
    {notes:['依4W2.pdf逐一量取本層掃描圖牆線：13病室位於庫房東側，不佔用庫房；15、13、11及東排病室均保留約100像素的外框進深。',
      '主走道原圖約36像素，東排病室進深約100像素；護理站為73×71像素主區加29×60像素東側轉折，並非單一小方塊。',
      '公共空間採牆線內接矩形；病室內浴廁、前室及門洞尚非逐段施工圖精描。']});
  add('W03_EAST',2,'04E2','04E2','4E2',[
    ...row(['02','06','08','10','12','16'],[211,264,319,375,431,487,540],168,99,true),
    ['18',674,168,44,99,true],['20',722,168,45,99,true],['22',815,168,94,67,true],['26',1000,307,79,53,false]],
    ['04E2 護理站',585,209,87,58],[['04E2主走道',179,272,819,31],['04E2東端走道',953,168,45,104]],
    [['護理長室／醫師值班室',575,168,96,38],['庫房',770,168,43,99],['開水／污物空間',912,202,39,65],['前室／廁所',1001,271,77,34,'anteroom']],
    {notes:['26病室位於主走道最東端南側，上方為前室／廁所；補齊前室，不更動原26病室位置。']});
  add('W03_WEST',1,'04W1','04W1','4W1',[
    ['21',48,103,60,73,true],['19',30,227,76,43,false],['17',165,102,79,74,true],
    ['15',247,102,47,74,true],['13',297,102,38,74,true],['11',338,102,87,74,true],
    ['09',622,103,53,73,true],['07',678,103,108,98,true],['05',790,103,103,73,true]],
    ['04W1 護理站',531,148,88,28],[['04W1主走道',110,204,783,33],[ '04W1西側走道',111,103,50,101]],
    [['活動室',428,103,72,98],['準備／庫房及討論空間',503,103,26,98],['臨床心理中心',897,44,83,88]]);
  // The supplied 3W2/3E2 drawings say "病房" without room numbers.
  add('W02_WEST',2,'03W2','03W2','3W2',[
    ['原圖端部病房',37,297,76,77,false],...row(generic(2),[248,304,355],196,99,true),
    ...row(generic(6).map(x=>x+'東'),[574,631,690,744,800,855,910],196,99,true)],
    ['03W2 護理站',479,230,92,63],[['03W2主走道',116,300,793,31]],
    [['大活動室',168,196,78,97],['治療／保護空間',358,235,118,58]],
    {schematicBeds:{defaultCount:1,counts:{},clearance:.45},notes:['原圖病房未標示可確認房號，使用原圖位置名稱及獨立示意床號；來源03W2床號保留待對照。']});
  add('W02_EAST',2,'03E2','03E2','3E2',[
    ...row(generic(5),[208,263,319,371,427,482],228,99,true),
    ...row(generic(5).map(x=>x+'東'),[651,726,800,853,906,952],228,99,true)],
    ['03E2 護理站',556,274,52,53],[['03E2主走道',178,333,775,28]],
    [['護理／治療及準備空間',484,228,70,99],['護理長室',428,191,126,34]],
    {schematicBeds:{defaultCount:1,counts:{},clearance:.45},notes:['原圖未能逐間確認02至22房號；未以床號清單猜配位置。']});
  // 5W2's real plan lies in one room-side strip, not two invented rows.
  for(const floor of [2,5])add('W04_WEST',floor,'5W2','05W2','5W2',[
    ['31',38,324,66,61,true],
    ...row(['29','27','25','23','21','19','17','15'],[111,151,193,234,275,316,357,399,442],324,47,true),
    ...row(['13','11','09','07','05','03','01'],[532,575,618,662,704,746,789,831],324,47,true)],
    ['5W2 護理站',489,348,41,23],[['5W2主走道',107,375,725,12]],
    [['工作／值班及討論空間',444,324,43,47],['化療藥物存放空間',489,324,41,22]],
    {notes:['2F為實際病房入口；保留既有5F展示別名，兩個入口共用5W2.pdf同一份配置。','病室維持來源單側排列，護理站位於房間帶內，未占下方主走道。']});
  add('W04_WEST',3,'06W3','06W3','5W3_6W3',[
    ['三人房A',44,70,66,72,true],['三人房B',113,70,36,72,true],['三人房C1',152,70,37,72,true],
    ['二人房',193,70,40,72,true],['單人房A',237,70,37,72,true],['單人房B',369,70,42,72,true],
    ['三人房C2',708,70,47,72,true],['三人房C3',758,70,56,72,true],['三人房C4',818,70,39,72,true]],
    ['06W3 護理站',524,113,62,29],[['06W3主走道',42,151,940,21]],
    [['護理長室',587,70,61,39],['器材清洗／治療空間',650,70,54,39],['會談室',650,114,54,28]],
    {origin:[700,300],schematicBeds:{defaultCount:1,counts:{'三人房A':3,'三人房B':3,'三人房C1':3,'二人房':2,'三人房C2':3,'三人房C3':3,'三人房C4':3},clearance:.45},
      notes:['原圖北排以房型標示，未核實其與06W3床號的對照，房型床數僅作示意；來源床號均保留。']});
  add('W04_WEST',3,'05W3','05W3','5W3_6W3',[
    ['41',44,320,72,48,true],['39',44,385,72,47,true],['37',44,439,72,51,true],
    ...row(['35','33','31','29','27','25','23','21'],[143,190,237,285,332,380,427,475,522],416,61,true),
    ...row(['19','17','15','13','11','09','07','05','03','01'],[790,836,883,930,979,1027,1074,1122,1169,1216,1263],416,76,true)],
    ['05W3 護理站',684,447,72,45],[['05W3主走道',141,496,1122,21],['05W3西側走道',118,320,22,176]],
    [['醫師／值班及工作空間',524,416,158,76],['化療藥物存放空間',758,416,30,76]],
    {origin:[700,300],notes:['同一來源圖南排05W3與北排06W3分開保留，沒有以06W3取代05W3。']});
  add('W04_EAST',2,'06E2','06E2','6E2',[
    ['02',425,158,48,62,true],['08',622,159,50,61,true],['12',677,159,48,61,true],
    ['16',729,159,47,61,true],['18',781,159,49,61,true],['20',834,159,49,61,true]],
    ['06E2 護理站',507,186,52,34],[['06E2主走道',393,223,492,17]],
    [['護理長室',509,159,50,24],['庫房',563,159,56,61]],
    {notes:['只定位本圖北側可確認的6E病室；沒有把南側5W2房間算進06E2。06／10／22來源床號保留待對照。']});
  // Actual black partition lines differ from the red structural column grid.
  add('W04_EAST',3,'05E3','05E3','5E3',[
    ...row(generic(7).map(x=>x+'北'),[621,674,719,790,863,908,955,1004],74,77,true),
    ...row(generic(9).map(x=>x+'南'),[531,581,634,676,729,771,823,866,949,999],420,75,true)],
    ['05E3 護理站',399,110,136,40],
    [['05E3北側走道',398,155,606,25],['05E3南側走道',529,500,501,24],
      ['05E3西側走道',501,180,28,344],['05E3東側走道',984,180,20,197],
      ['05E3東南側走道',1001,377,29,147],['05E3治療室前走道',1004,327,27,50]],
    [['會談室',581,105,39,47],['醫材室',539,114,39,38],['中庭',530,184,452,232,'courtyard'],
      ['治療室',1071,329,77,48],['污物間',1033,349,35,28],['陽光會客室',1033,382,75,31],
      ['教室',1033,418,75,75],['樓梯間（東北）',1006,151,103,33],['樓梯間（東南）',1033,498,75,28]],
    {origin:[750,300],scale:.08,schematicBeds:{defaultCount:2,counts:Object.fromEntries(generic(7).map(x=>[x+'北',1])),clearance:.45},
      notes:['以PDF黑色分隔牆線重建北排7個及南排9個病室空間，不使用紅色柱位等距切房。',
        '北1至北7、南1至南9只是圖面位置代稱，不是現行病室房號。',
        '北排以單一匿名圖示表示病室用途，不代表實際床數；南排依原圖二人房各畫2床示意。',
        '02至48的48筆正式床號保留待逐間對照；沒有把正式床號按排序猜配到舊圖。',
        '中庭只呈現開放地坪；治療室及教室移至原圖東側，西南側舊治療室不屬本次東側病房範圍。']});
  // 5W4 contains numbered and older unnumbered rooms. Preserve that mismatch
  // instead of placing 20/21/22 over the beginning of the corridor.
  add('W04_WEST',4,'05W4','05W4','5W4',[
    ...row(generic(7).map(x=>x+'西'),[143,185,226,267,308,350,391,432],368,62,true),
    ['原圖單人病房',716,368,38,62,true],['原圖三人病房',756,368,83,62,true],
    ...row(generic(4).map(x=>x+'中'),[863,903,944,985,1042],368,62,true),
    ...row(generic(6).map(x=>x+'東'),[1237,1279,1320,1361,1402,1443,1519],368,62,true)],
    ['05W4 西側護理站',509,368,88,62],[['05W4主走道',140,434,1380,17]],
    [['會談／工作空間',434,368,73,62],['器材及陽光會客空間',600,368,113,62],['討論／準備空間',1045,368,116,33]],
    {origin:[820,410],extraStations:[['05W4 東側護理站',1100,404,61,26]],
      schematicBeds:{defaultCount:2,counts:{'原圖單人病房':1,'原圖三人病房':3},clearance:.45},
      notes:['本圖部分病室舊號重複、部分只寫房型；尚不能將01至22床號逐間核實。原床號42筆保留待對照，示意床使用SCHEMATIC識別碼。']});
  api.plans.push(...plans);
  const original=api.apply;
  api.apply=function(root){
    original(root);
    for(const p of plans){
      const l=root[p.building][p.floor];l.sourceUnplacedSpaces=l.sourceUnplacedSpaces||[];
      if(p.ward==='04E2')l.ignoreLegacyCorridorsForFit=true;
      if(p.ward==='04W2'){
        const station=l.nursingStations.find(n=>n.ward===p.ward);
        const project=(x,y,w,h)=>({x:(x+w/2-p.origin[0])*p.scale,z:(y+h/2-p.origin[1])*p.scale,width:w*p.scale,depth:h*p.scale,y:0,height:1.2});
        delete station.parts;
        station.sourceParts=[[540,165,77,100]];
        station.userAdjusted=true;
        l.sourceDisplayNote='依使用者修正：15房擴寬，護理站與辦公／工作人員區以等大範圍對調；庫房及化療準備室另排走道南側。圖面尺寸與位置調整為示意，非原圖逐牆線描摹。';
        const room15=l.rooms.find(r=>r.ward===p.ward&&r.roomCode==='15');
        room15.userAdjusted=true;room15.originalSourceRect={x:160,y:164,w:49,h:101};
        l.sourceTraceWards[p.ward].notes=[l.sourceDisplayNote,'床號保留原始資料；17、19床位排列與間距為示意。'];
      }
      if(p.ward==='05E3')l.sourceDisplayNote='北1～北7、南1～南9為原圖位置代稱；床位為示意，正式房號及48筆床號待對照。';
      for(const r of l.rooms.filter(r=>r.ward===p.ward)){
        r.sourceFitBeds=true;r.bedClearance=.45;
        const west=(p.ward==='05W1'&&['25','23','21'].includes(r.roomCode)||['04W1','04W2'].includes(p.ward)&&['17','19','21'].includes(r.roomCode)||r.roomCode==='原圖端部病房');
        const westWallRoom=west||
          p.ward==='5W2'&&r.roomCode==='31'||
          p.ward==='06W3'&&r.roomCode==='三人房A'||
          p.ward==='05W3'&&['41','39','37'].includes(r.roomCode)||
          p.ward==='05W4'&&r.roomCode==='位置01西';
        if(westWallRoom&&r.bedCount>0&&r.bedCount<=4){
          r.bedAxis='north-south';
          r.bedArrangement='west-wall-north-south';
          r.bedSpreadAcrossRoom=true;
          r.bedRowGap=.6;
        }
        if(p.ward==='05E3'){
          const match=/位置(\d+)(北|南)$/.exec(r.roomCode);
          if(match)r.displayRoomLabel=match[2]+Number(match[1]);
          if(r.roomCode.endsWith('北')){r.bedSymbolOnly=true;r.bedSymbolBasis='原圖病室用途圖示，非正式床號或核實容量';}
        }

        r.windowSides=westWallRoom?['west']:p.ward==='04E2'&&r.roomCode==='26'?['east']:['03W2','03E2'].includes(p.ward)?[]:['north'];
      }
      for(const [i,[name,x,y,w,h]]of (p.extraStations||[]).entries())l.nursingStations.push({id:'TRACE-'+p.ward+'-NS-EXTRA-'+i,
        name,ward:p.ward,sourceTrace:true,sourcePlan:p.source,
        bounds:{x:(x+w/2-p.origin[0])*p.scale,z:(y+h/2-p.origin[1])*p.scale,width:w*p.scale,depth:h*p.scale,y:0,height:1.2}});
      for(const key of ['facilities','nursingStations']){
        const old=l[key].filter(q=>!q.sourceTrace&&(!q.ward||q.ward===p.ward));
        l.sourceUnplacedSpaces.push(...old.map(item=>({kind:key,item,reason:'西址舊套圖公共空間，依本病房原圖取代'})));
        l[key]=l[key].filter(q=>!old.includes(q));
      }
    }
    // West-campus wards in east-facing wings also have western-edge rooms.
    // These codes follow the traced room bands on each source plan.
    const westWallCodes={
      '03E2':['位置01'],'04E1':['02'],'04E2':['02'],'06E2':['02'],'05E3':['位置01南']
    };
    for(const [building,floors] of Object.entries(root).filter(([id])=>/^W/.test(id)))for(const layout of Object.values(floors)){
      for(const r of layout.rooms||[]){
        if(!westWallCodes[r.ward]?.includes(r.roomCode))continue;
        r.windowSides=['west'];
        if(r.bedCount>0&&r.bedCount<=4){
          r.bedAxis='north-south';r.bedArrangement='west-wall-north-south';
          r.bedSpreadAcrossRoom=true;r.bedRowGap=.6;
        }
      }
    }
  };
})();

