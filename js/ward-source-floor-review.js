/* Floor-by-floor E_**F.pdf review. Source-pixel inner rectangles preserve
   row order and the B-C passage; they are not surveyed dimensions. */
(function(){
  const api=window.WardSourceTraces;
  const sourceFloors=[7,8,9,11,12,13,15];
  const row=(codes,edges,y,h,upper)=>codes.map((code,i)=>[code,edges[i]+1,y,edges[i+1]-edges[i]-2,h,upper]);
  const common=(floor,ward,bedWard)=>({building:'E01_MAIN',floor:floor+'F',ward,bedWard:bedWard||ward,flipUpper:/^[0-9]+B$/.test(ward),source:`E_${String(floor).padStart(2,'0')}F.pdf`,image:`scratch/floor-source-review/E_${String(floor).padStart(2,'0')}F.png`,origin:[335,758],scale:.08,partialCorridors:true,replaceCorridorGroups:['B','C']});
  const definitions={
    7:{b:'7B',c:'7C',bb:'07B',cb:'07C',dy:0,cService:'檢查治療室／會議室'},
    8:{b:'08B',c:'08C',dy:0,cService:'檢查治療室／會議室'},
    9:{b:'09B',c:'09C',dy:0,cService:'傷口造口小組辦公室／治療室／會議室'},
    11:{b:'11B',c:'11C',cb:'11C1',dy:-4,cService:'檢查治療室／會議室'},
    12:{b:'12B',c:'12C',dy:0,cService:'檢查治療室／教室'},
    13:{b:'13B',c:'13C',dy:0,cService:'治療室／教室'},
    15:{b:'15B',c:'15C',dy:0,cService:'睡眠檢查區'}
  };
  for(const floor of sourceFloors){
    const d=definitions[floor],dy=d.dy;
    const b={...common(floor,d.b,d.bb),rooms:[
      ['05',41,400+dy,37,66,false],['03',80,400+dy,33,66,false],['02',124,380+dy,32,86,false],['01',159,380+dy,40,86,false],
      ['21',479,380+dy,32,86,false],['20',514,380+dy,40,86,false],['19',558,403+dy,32,63,false],['22',594,403+dy,34,49,false],
      ...row(['06','07','08','09','10','11','12','13','15'],[79,114,157,193,236,271,315,350,394,437],530+dy,63,true),
      ...row(['16','17','18'],[469,512,548,591],530+dy,63,true)
    ],spaces:[['會議室／檢查治療室',202,380+dy,44,86],['庫房／醫師值班室',391,439+dy,85,27],['督導室／管道空間',391,406+dy,85,31],['污物室',202,468+dy,44,14]],
    station:[d.b+' 護理站／護理長室／總醫師室',274,405+dy,83,74],
    corridors:[[d.b+'東西走道',41,483+dy,589,20],[d.b+'護理站側走道',359,403+dy,31,80]],
    notes:[`逐層比對E_${String(floor).padStart(2,'0')}F.pdf，重建B區兩排病室與護理站；沒有直接複製舊套版座標。`,'南排15與16之間保留原圖南北棟連通口。','病室／公共空間採內接矩形；門、浴廁與斜角仍為近似。']};
    // 15B also has an 18 room at the east end; no inferred extra room is added.
    const c={...common(floor,d.c,d.cb),rooms:[
      ...row(['06','07','08','09','10'],[236,270,314,349,393,437],794+dy,65,true),
      ...row(['11','12','13','15','16','17','18'],[467,511,547,590,625,668,704,747],794+dy,65,true),
      ['05',197,923+dy,36,63,false],['03',235,923+dy,34,63,false],['02',278,923+dy,33,85,false],['01',314,923+dy,41,85,false],
      ['21',638,923+dy,29,85,false],['20',669,923+dy,40,85,false],['19',713,923+dy,32,63,false],['22',749,940+dy,39,46,false]
    ],spaces:[[d.cService,358,923+dy,44,85],['設備器材及工作人員用膳室',428,991+dy,85,45],['庫房／督導室',546,923+dy,29,62],['醫師值班室／管道空間',578,923+dy,57,62],['污物室',358,906+dy,22,15]],
    station:[d.c+' 護理站／護理長室／總醫師室',428,908+dy,85,77],
    corridors:[[d.c+'東西走道',197,885+dy,591,19],[d.c+'護理站側走道',515,904+dy,29,132]],
    notes:[`逐層比對E_${String(floor).padStart(2,'0')}F.pdf，重建C區病室相對位置。`,'北排10與11之間保留原圖南北棟連通口。','只使用來源床號；來源缺少的病室不補造床位。矩形不包含所有浴廁、前室與小凹角。']};
    if(floor===15){
      c.rooms=[...row(['05','06','07'],[236,314,393,437],794,49,true),...row(['08','09','10','11'],[467,511,590,668,747],794,49,true),['03',197,923,71,63,false],['01',272,923,74,85,false],['15',628,923,38,85,false],['13',670,923,39,85,false],['12',713,943,75,43,false]];
      c.spaces=[['清洗室／儀器及檢查空間',348,923,54,62],['治療室',546,923,78,61],['工作人員休息及用膳空間',428,991,85,45],['電氣室',348,906,54,15]];
      c.notes=['依E_15F.pdf逐間定位15C；05、06、09、10、11為較寬病室，不能套用一般C區的12格北排。','原圖未確認15C02；保留其床號待定位。病室使用內接矩形，前室及浴廁未完整描繪。'];
    }
    api.plans.push(b,c);
  }
  api.plans.push({...common(5,'05B'),origin:[304,575],scale:.1066666667,image:'scratch/05F_source_0_0.png',
    rooms:[['05',31,307,27,42,false],['03',61,307,26,42,false],['02',94,286,24,63,false],['01',121,286,29,63,false],['17',355,287,28,62,false],['16',386,288,28,61,false],['15',417,308,25,41,false],
      ...row(['06','07','08','09','10'],[59,119,178,237,296,328],398,56,true),...row(['11','12'],[352,384,443],398,56,true)],
    spaces:[['心臟復健室／檢查治療室',152,307,33,42],['護理長室／值班室／清潔間',298,307,54,42]],station:['05B 護理站',206,307,63,61],corridors:[['05B東西走道',31,372,412,20]],
    notes:['E_05F.pdf原圖B區南排06至12，10與11之間為南北棟連通口。','原圖未能確認5B13、15至18之南排病室；不按床號清單另外製造房間。']});
  api.plans.push({...common(6,'06B'),origin:[482,909],scale:.0672268907563,image:'scratch/E_06F_source.png',
    rooms:[['05',152,503,37,65,false],['03',191,503,33,65,false],['02',234,481,32,87,false],['01',270,481,39,87,false],['21',588,481,37,87,false],['20',628,481,39,87,false],['19',670,504,32,64,false],['22',706,504,36,49,false],
      ...row(['06','07','08','09','10','11','12','13','15'],[190,228,268,311,347,393,426,469,508,550],633,63,true),...row(['16','17','18'],[582,624,667,705],633,63,true)],
    spaces:[['會議室／檢查治療室',312,481,45,87],['庫房／醫師值班室',503,542,83,26],['督導室／安寧照護空間',503,507,83,32]],station:['06B 護理站／護理長室／總醫師室',385,507,84,74],corridors:[['06B東西走道',152,587,590,19]],
    notes:['依E_06F.pdf重建北棟B區，南排15與16之間保留原圖連通口。','和既有6C／6D使用同一份1190×1684原圖座標，不套用其他樓層。']});
  // North A and south D are reviewed separately: service blocks and room
  // numbers differ by floor, even where wall lines share a structural grid.
  for(const floor of sourceFloors){
    const d=definitions[floor],dy=d.dy,a=floor===7?'7A':floor<10?'0'+floor+'A':floor+'A',wardD=floor===7?'7D':floor<10?'0'+floor+'D':floor+'D';
    const aliasA=floor===7?'07A':a,aliasD=floor===7?'07D':wardD;
    let aNorth=row(['06','07','08','09','10','11','12'],[80,115,159,194,238,273,317,359],9+dy,64,true).concat(row(['13','15','16','17','18'],[394,437,474,517,553,590],9+dy,64,true));
    let aEast=[['21',480,136+dy,32,86,false],['20',515,136+dy,40,86,false],['19',559,137+dy,32,64,false],['22',595,154+dy,35,47,false]];
    const aSpaces=[['污物室',202,119+dy,22,14],['檢查治療及附屬空間',202,136+dy,44,86],['庫房／醫師值班室／儲藏空間',392,136+dy,85,86]];
    if(floor===7){aNorth=row(['06','07','08','09','10'],[80,115,159,194,238,280],9,64,true).concat(row(['11','12','13','15','16'],[360,394,438,481,525,590],9,64,true));aEast=[['19',480,136,32,86,false],['18',515,136,40,86,false],['20',559,154,71,47,false]];aSpaces.push(['工作人員用膳室',281,9,77,64]);}
    else if(floor===13){aNorth=row(['06','07','08','09','10','11'],[80,115,159,194,238,273,317],9,64,true).concat(row(['12','13','15','16','17'],[394,437,474,517,553,590],9,64,true));aEast=[['20',480,136,32,86,false],['19',515,136,40,86,false],['18',559,137,32,64,false],['21',595,154,35,47,false]];aSpaces.push(['會議室／教室',318,9,74,64]);}
    else if(floor===15){aNorth=row(['06','07','08','09','10'],[80,123,159,202,238,274],9,50,true).concat(row(['11','12','13','15','16'],[394,437,474,517,553,590],9,64,true));aEast=[['19',480,136,32,86,false],['18',515,136,40,86,false],['17',559,137,32,64,false],['20',595,154,35,47,false]];aSpaces.push(['教室及更衣空間',275,9,117,84]);}
    else if(floor===11){aNorth=aNorth.filter(r=>r[0]!=='12');aSpaces.push(['控制室／影像工作室／X光室',318,9+dy,74,64]);}
    else aSpaces.push([floor===8?'工作人員用膳空間':'教室',360,9+dy,32,64]);
    let aWest=[['05',42,136+dy,36,64,false],['03',80,136+dy,33,64,false],['02',125,136+dy,32,86,false],['01',160,136+dy,39,86,false]];
    if(floor===15)aWest=[['05',42,136,36,64,false],['03',80,136,33,64,false],['01',145,154,54,28,false],['02',145,185,54,36,false]];
    api.plans.push({...common(floor,a,aliasA),...(floor===15?{schematicBeds:{defaultCount:1,counts:{},clearance:.3}}:{}),rooms:[...aNorth,...aWest,...aEast],spaces:aSpaces,station:[a+' 護理站／護理長室／總醫師室',274,124+dy,84,74],corridors:[[a+'東西走道',42,99+dy,589,19]],notes:[`依本層E_${String(floor).padStart(2,'0')}F.pdf核對北棟A區排列，保留教室、工作人員及影像空間造成的病室缺口。`,'病室、護理站及服務空間採內接矩形，前室／浴廁與斜角未逐段描繪。',floor===15?'15A未列於來源床號檔：每間病室補1床示意，非已確認的實際床數；示意識別碼與正式床號分開。':'沒有來源床號的區域不製造床位。']});
    if(floor===15){
      api.plans.push({...common(floor,'15D'),rooms:[['景福病房區',627,1187,161,64,true]],spaces:[['安客室',197,1187,79,106],['聯絡中心／會議室',279,1187,76,106],['檢查及衛浴休息空間',428,1216,86,75],['控制及清潔空間',547,1187,77,66],['辦公及會議空間',627,1317,161,62]],station:['15D 護理區',547,1257,77,34],corridors:[['15D東西走道',357,1295,431,18],['15D西側走道',357,1187,27,108]],notes:['E_15F.pdf南棟D區為景福病房及其會議、服務空間，不能套用一般20間病室。','未有15D床號清單，僅依原圖畫出可確認區域，沒有推估房號或床位。']});continue;
    }
    let dNorth=[['05',197,1186+dy,35,65,true],['03',235,1186+dy,33,65,true],['02',279,1164+dy,32,87,true],['01',315,1164+dy,39,87,true],['21',627,1186+dy,39,65,true],['20',670,1186+dy,39,65,true],['19',713,1186+dy,32,65,true],['22',749,1186+dy,39,48,true]];
    let dSouth=row(['06','07','08','09','10','11'],[236,277,313,356,392,435,471],1314+dy,63,false).concat(row(['15','16','17','18'],[588,625,668,711,747],1314+dy,63,false));
    let dSpaces=[['教室／檢查治療室',358,1164+dy,44,87],['工作人員用膳室',472,1314+dy,114,63],['污物室',358,1272+dy,44,17],['庫房／醫師值班室／儲藏空間',546,1192+dy,79,59]];
    if(floor===9){dNorth=dNorth.map(r=>{if(['21','20','19','22'].includes(r[0]))r[0]=({'21':'19','20':'18','19':'17','22':'20'})[r[0]];return r;});dSouth=row(['06','07','08','09','10','11'],[236,277,313,356,392,435,479],1314,63,false).concat(row(['12','13','15','16'],[596,633,669,712,747],1314,63,false));dSpaces[1]=['會議室／教室',480,1314,114,63];}
    api.plans.push({...common(floor,wardD,aliasD),rooms:[...dNorth,...dSouth],spaces:dSpaces,station:[wardD+' 護理站／護理長室／總醫師室',428,1193+dy,85,75],corridors:[[wardD+'東西走道',197,1291+dy,591,19]],notes:[`依本層E_${String(floor).padStart(2,'0')}F.pdf重建南棟D區；不將工作人員用膳／會議區誤畫成病室。`,'矩形為原圖內接近似；未知或版本不同的床號保留待定位。']});
  }
  // 4F north block: use the room wall extents, rather than undersized
  // interior patches. Coordinates refer to the cropped source image below.
  const north4={
    '04A1':{
      rooms:[...row(['06','07','08','09','10'],[82,122,162,201,240,279],9,52,true),
        ['05',44,116,48,39,false],['03',44,158,48,45,false],
        ['02',123,175,38,48,false],['01',163,175,38,48,false],['11',234,103,40,38,false]],
      spaces:[['前室',94,182,27,21,'anteroom'],['庫房／污物室',203,169,29,31],['清潔間',234,169,30,31],
        ['前室／浴廁',203,203,40,20,'anteroom'],['護理長室',276,96,52,21],['督導長室',276,118,52,22]],
      corridors:[['04A1開放護理區',94,64,138,108],['04A1西側入口',44,96,50,18],
        ['04A1南側通路',94,173,28,8],['04A1內側通路',203,143,71,24]]
    },
    '04A2':{
      rooms:[...row(['10','09','08','07','06'],[398,438,478,518,557,598],9,53,true),
        ['05',585,118,48,39,false],['03',585,160,48,44,false],
        ['01',474,175,42,49,false],['02',518,175,37,49,false],['11',400,104,44,38,false]],
      spaces:[['前室',557,184,26,20,'anteroom'],['設備器材室',334,96,60,45]],
      corridors:[['04A2開放護理區',446,64,137,109],['04A2內側北通路',400,64,45,30],
        ['04A2內側南通路',400,144,74,23],['04A2東側入口',584,97,42,19]]
    },
    '04B1':{
      rooms:[['02',120,381,39,48,true],['01',161,381,35,48,true],
        ['03',43,400,48,45,true],['05',43,448,48,38,true],['11',204,454,40,43,true],
        ...row(['06','07','08','09','10'],[80,121,161,201,240,279],543,52,false)],
      spaces:[['前室',93,400,25,23,'anteroom'],['支氣管清洗室',198,401,45,30],['前室',217,438,27,15,'anteroom']],
      corridors:[['04B1開放護理區',94,432,108,110],['04B1內側通路',203,500,55,29],
        ['04B1南排走道',94,531,185,11]]
    },
    '04B2':{
      rooms:[['01',473,381,41,48,true],['02',516,381,40,48,true],
        ['03',584,402,48,44,true],['05',584,449,48,39,true],['11',426,436,45,34,true],
        ...row(['10','09','08','07','06'],[399,437,477,516,556,595],546,51,false)],
      spaces:[['前室',558,402,24,23,'anteroom'],['前室',363,403,38,42,'anteroom'],
        ['電氣室／管道間',403,403,68,31],['清潔間／污物室',363,449,61,22],['RO水儲藏室',363,473,108,24]],
      corridors:[['04B2開放護理區',473,431,110,113],['04B2內側通路',401,500,71,32],
        ['04B2南排走道',399,533,196,11]]
    }
  };
  for(const [ward,shape] of Object.entries(north4))api.plans.push({
    ...common(4,ward),replaceCorridorGroups:['A','B'],...shape,station:null,
    notes:['依E_04F.pdf北棟病室主牆邊界重畫寬深比例，沒有再以縮小的內接塊代替病室。',
      '4A1／4B1在西、4A2／4B2在東；4B2的11病室位於清潔間東側。',
      '護理區依原圖以可通行的開放區域呈現；矩形仍近似門口小凹角與斜角，並非施工尺寸。']
  });
  api.plans.push({...common(5,'05A'),flipUpper:false,origin:[304,575],scale:.1066666667,image:'scratch/05F_source_0_0.png',
    rooms:[...row(['06','07','08','09','10','12'],[61,120,179,238,297,356,445],15,48,true),['05',32,105,26,38,false],['03',62,105,26,38,false],['02',93,105,25,69,false],['01',122,105,27,69,false],['17',357,105,26,69,false],['16',387,105,26,69,false],['15',417,105,26,38,false],['13',447,105,26,38,false]],
    spaces:[['檢查治療室／護理長室／醫師辦公室',152,105,33,69],['消機器設備室／庫房',298,105,56,48]],station:['05A 護理站',206,101,63,55],corridors:[['05A東西走道',32,80,441,15]],notes:['依E_05F.pdf重建5A，北排06、07、08、09、10、12，12為較寬空間；沒有按舊套版補造11。','病室使用內接矩形，浴廁與門口凹角未完整描繪；11來源床號保留待定位。']});
  api.plans.push({...common(5,'05D'),flipUpper:false,origin:[304,575],scale:.1066666667,image:'scratch/05F_source_0_0.png',
    rooms:[['05',148,897,25,61,true],['03',177,897,26,61,true],['02',213,881,20,77,true],['01',237,881,29,77,true],['17',473,900,25,58,true],['16',503,900,25,58,true],['15',533,917,24,41,true],['12',562,917,25,41,true],...row(['06','07','08'],[176,235,295,354],1008,33,false),...row(['09','10','11'],[383,442,502,560],1008,33,false)],
    spaces:[['醫師辦公室／護理長室／檢查治療室',270,881,48,77],['儀器設備室／清潔間／值班室',414,900,57,58],['衛教室',355,1008,26,33]],station:['05D 護理站',322,907,57,48],corridors:[['05D東西走道',148,973,439,14]],notes:['依E_05F.pdf重建5D；南排06／07／08、衛教室、09／10／11，不按原套版連續房號填滿。','北排東側依原圖17／16／15／12定位；無法在原圖定位的床號保留待核對。']});
  api.plans.push({...common(6,'06A'),flipUpper:false,origin:[482,909],scale:.0672268907563,image:'scratch/E_06F_source.png',
    rooms:[...row(['06','07','08','09','10','11','12'],[194,227,270,306,349,384,428,471],109,64,true),...row(['13','15','16','17','18'],[504,547,583,627,662,706],109,64,true),['05',153,239,35,61,false],['03',191,239,32,61,false],['02',235,239,32,84,false],['01',271,239,39,84,false],['21',588,239,35,84,false],['20',627,239,39,84,false]],
    spaces:[['教室（北）',473,109,29,64],['檢查治療室／教室',313,239,44,84],['污物室',313,216,44,21],['庫房／醫師值班室／盥洗空間',504,239,81,84],['6A19 輔導空間',670,239,71,61]],station:['06A 護理站／護理長室／總醫師室',386,239,81,61],corridors:[['06A東西走道',153,195,588,18]],notes:['依E_06F.pdf重建北棟6A，06至18分列於北排，教室留在12與13之間。','原圖6A19標為輔導空間，依公共空間保留；其來源床號待版本核對。','浴廁、前室與護理站斜角使用內接矩形近似。']});
  const original=api.apply;
  api.apply=function(root){
    original(root);
    for(const l of Object.values(root.E01_MAIN))for(const r of l.rooms||[])if(r.sourceTrace&&!r.bedClearance)r.sourceFitBeds=true;
    const project=(origin,scale,x,y,w,h)=>({x:(x+w/2-origin[0])*scale,z:(y+h/2-origin[1])*scale,width:w*scale,depth:h*scale,y:0,height:.05});
    for(const f of [5,6,...sourceFloors,14]){
      const l=root.E01_MAIN[f+'F'];if(!l)continue;
      const d=definitions[f],b=d?.b||(f===5?'05B':f===6?'06B':'14B'),c=d?.c||(f===5?'05C':f===6?'6C':'14C');
      const origin=f===5?[304,575]:f===6?[482,909]:f===14?[405,764]:[335,758];
      const scale=f===5?.1066666667:f===6?.0672268907563:.08,dy=d?.dy||0;
      const segments=f===5?[[328,372,24,82,false],[328,454,24,147,true],[328,601,24,84,false]]:
        f===6?[[550,587,32,110,false],[550,697,32,200,true],[550,897,32,106,false]]:
        f===14?[[507,489,29,111,false],[507,600,29,199,true],[507,799,29,111,false]]:
        [[438,483+dy,27,112,false],[438,595+dy,27,199,true],[438,794+dy,27,110,false]];
      l.sourceTraceReplaceCorridorGroups=(sourceFloors.includes(f)||f===5||f===6)?['A','B','C','D']:[...new Set([...(l.sourceTraceReplaceCorridorGroups||[]),'B','C'])];
      l.sourceTraceCorridors=(l.sourceTraceCorridors||[]).filter(q=>!q.isInterWing).concat(segments.map(([x,y,w,h,label],i)=>({id:`SOURCE-${f}F-BC-${i}`,name:'南棟往北棟走廊',ward:f+'BC',connects:[b,c],bounds:project(origin,scale,x,y,w,h),sourceRect:{x,y,w,h},sourceTrace:true,sourcePlan:`E_${String(f).padStart(2,'0')}F.pdf`,isInterWing:true,mainSpine:true,connectionLabel:label,connectionText:'南棟往北棟走廊',labelLines:['南','棟','往','北','棟','走','廊']})));
      l.sourceTracePartialCorridors=false;
      const coreSegments=sourceFloors.includes(f)?[[360,118+dy,29,365],[515,904+dy,29,406]]:f===14?[[430,122,30,367],[584,910,31,406]]:f===6?[[470,213,31,374],[626,1003,29,395]]:f===5?[[272,95,23,277],[384,685,28,302]]:[];
      l.sourceTraceCorridors.push(...coreSegments.map(([x,y,w,h],i)=>({id:`SOURCE-${f}F-CORE-${i}`,name:i===0&&f!==6?'北棟A/B核心走道':'南棟C/D核心走道',ward:f+'CORE',bounds:project(origin,scale,x,y,w,h),sourceRect:{x,y,w,h},sourceTrace:true,sourcePlan:`E_${String(f).padStart(2,'0')}F.pdf`,mainSpine:true})));
      if(f===5)l.sourceTraceCorridors.push({id:'SOURCE-5F-CVI-ACCESS',name:'北棟東側ICU連接走道',ward:'5CORE',connects:['05A','5CVI'],bounds:project(origin,scale,473,80,58,15),sourceRect:{x:473,y:80,w:58,h:15},sourceTrace:true,sourcePlan:'E_05F.pdf',mainSpine:true});
      // Unassigned template elevators are not measurements of the reviewed B/C core.
      const target=[...l.rooms,...l.nursingStations,...l.facilities,...l.sourceTraceCorridors.filter(q=>q.mainSpine)].filter(q=>q.sourceTrace);
      const overlap=(a,b)=>Math.min(a.x+a.width/2,b.x+b.width/2)-Math.max(a.x-a.width/2,b.x-b.width/2)>1e-6&&Math.min(a.z+a.depth/2,b.z+b.depth/2)-Math.max(a.z-a.depth/2,b.z-b.depth/2)>1e-6;
      const bad=l.facilities.filter(q=>!q.sourceTrace&&(!q.ward||[b,c].includes(q.ward))&&target.some(t=>overlap(q.bounds,t.bounds)));
      l.sourceUnplacedSpaces.push(...bad.map(item=>({kind:'facilities',item,reason:'舊套版公共空間與本層原圖B/C配置重疊，待原圖定位'})));
      l.facilities=l.facilities.filter(q=>!bad.includes(q));
    }
    // E_09F shows A/B/C/D, with no identifiable HN/HS footprint. The
    // previous import duplicated these records over A/B. Preserve, do not guess.
    const ninth=root.E01_MAIN['9F'];
    if(ninth){
      const unverified=new Set(['09HN','09HS']);
      for(const key of ['rooms','facilities','nursingStations']){
        const removed=ninth[key].filter(q=>unverified.has(q.ward));
        ninth.sourceUnplacedSpaces.push(...removed.map(item=>({kind:key,item,reason:'E_09F.pdf未能確認HN/HS位置；舊套版重疊A/B，保留待核對版本'})));
        if(key==='rooms')for(const r of removed)for(const bedId of window.WARD_BED_IDS?.[r.ward]?.[r.roomCode]||[])ninth.sourceUnplacedBeds.push({ward:r.ward,roomCode:r.roomCode,bedId,reason:'原圖未確認HN/HS位置'});
        ninth[key]=ninth[key].filter(q=>!unverified.has(q.ward));
      }
    }
    for(const floor of ['3F','4F']){
      const l=root.E01_MAIN[floor],target=[...l.rooms,...l.nursingStations,...l.facilities].filter(q=>q.sourceTrace);
      const overlap=(a,b)=>Math.min(a.x+a.width/2,b.x+b.width/2)-Math.max(a.x-a.width/2,b.x-b.width/2)>1e-6&&Math.min(a.z+a.depth/2,b.z+b.depth/2)-Math.max(a.z-a.depth/2,b.z-b.depth/2)>1e-6;
      const bad=l.facilities.filter(q=>!q.sourceTrace&&target.some(t=>overlap(q.bounds,t.bounds)));
      l.sourceUnplacedSpaces.push(...bad.map(item=>({kind:'facilities',item,reason:'舊套版公共空間與本層原圖重建區重疊，保留待定位'})));l.facilities=l.facilities.filter(q=>!bad.includes(q));
    }
    // 4F uses the east core/platform; it is not the central straight bridge
    // found on the general ward floors. Retain legacy room geometry for review.
    const fourth=root.E01_MAIN['4F'];
    if(fourth&&!api.plans.some(p=>p.building==='E01_MAIN'&&p.floor==='4F'&&p.ward==='04D1')){
      const paths=[['B出口',32.5,-17.68,26,.8,false],['東側連通動線',44.5,-3.9,2.8,30,true],['C入口',37.7,9.8,16,1.0,false]];
      fourth.sourceTracePartialCorridors=true;fourth.sourceTraceReplaceCorridorGroups=['A','B'];
      fourth.sourceTraceCorridors=(fourth.sourceTraceCorridors||[]).concat(paths.map(([id,x,z,width,depth,label])=>({id:'DISPLAY-4F-BC-'+id,name:'南北棟東側連通動線（示意）',ward:'4BC',connects:['04B1','04B2','04C1','04C2'],bounds:{x,z,width,depth,y:0,height:.05},isInterWing:true,mainSpine:true,connectionLabel:label,connectionText:'南北棟連通動線',sourcePlan:'E_04F.pdf',isSchematic:true})));
    }
  };
})();
