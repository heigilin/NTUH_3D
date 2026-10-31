/* Manually traced coordinates from the supplied source plans, in source pixels.
   A trace is never cloned to another ward or floor. */
(function(){
  const plan={building:'E01_MAIN',floor:'14F',ward:'14A',isolationCodes:['21'],source:'E_14F.pdf',image:'floorplans/E_14F.jpg',
    rooms:[
      ['06',149,14,36,67,true],['07',185,14,44,67,true],
      ['08',229,14,36,67,true],['09',265,14,43,67,true],
      ['10',308,14,35,67,true],['11',343,14,46,67,true],
      ['12',462,14,43,69,true],['13',505,14,36,69,true],
      ['15',541,14,43,69,true],['16',584,14,36,69,true],['17',620,14,43,69,true],
      ['05',110,140,40,68,false],['03',150,140,35,68,false],
      ['02',192,140,37,90,false],['01',229,140,42,90,false],
      ['20',547,140,35,92,false],['19',582,140,36,92,false],
      ['18',618,140,43,70,false],['21',661,158,41,52,false]
    ],
    spaces:[
      ['會議室兼教室',389,14,73,69,'service'],
      ['設備器材室',271,140,47,48,'service'],
      ['工作人員用膳室',271,188,47,42,'service'],
      ['污物室',271,122,24,18,'service'],
      ['醫護人員專用污物室',460,123,87,17,'service'],
      ['庫房',460,140,31,34,'service'],['醫師值班室',491,140,49,34,'service'],
      ['儲藏室',460,174,31,32,'service'],['管道間',491,174,49,32,'service'],
      ['前室',661,140,41,18,'service']
    ],
    station:['14A 護理站／護理長室／總醫師室',343,125,87,81],
    corridors:[['14A東西走道',110,104,592,18],['14A中央側走道',430,124,30,108]],
    notes:['污物室依原圖位於設備器材室北端靠走道側，與設備器材室左界對齊。','原圖 14A02 西南邊界有內縮；目前採內接矩形，未畫出該小段凹角。','原圖沒有可確認的 14A22 房號，來源床號保留為未定位。']
  };
  const plans=[plan,
    {building:'E01_MAIN',floor:'14F',ward:'14B',isolationCodes:['22'],source:'E_14F.pdf',image:'floorplans/E_14F.jpg',rooms:[
      ['05',110,405,39,69,false],['03',149,405,35,69,false],['02',192,385,36,89,false],['01',228,385,35,89,false],
      ['21',547,405,35,69,false],['20',582,405,44,69,false],['19',626,407,35,67,false],['22',661,422,38,52,false],
      ['06',149,534,35,66,true],['07',184,534,43,66,true],['08',227,534,36,66,true],['09',263,534,44,66,true],
      ['10',307,534,35,66,true],['11',342,534,44,66,true],['12',386,534,34,66,true],['13',420,534,44,66,true],
      ['15',464,534,43,66,true],['16',539,534,43,66,true],['17',582,534,36,66,true],['18',618,534,43,66,true]
    ],spaces:[['教室',263,385,54,24,'service'],['檢查治療室',263,409,54,65,'service'],['督導室',460,410,30,33,'service'],['管道間',490,410,49,33,'service'],['庫房',460,443,30,31,'service'],['醫師值班室',490,443,49,31,'service'],['前室',661,407,38,15,'service']],station:['14B 護理站／護理長室／總醫師室',342,409,87,79],corridors:[['14B東西走道',110,489,589,20],['14B中央側走道',429,409,31,80]],notes:['護理站斜角及 14B02 西側內縮暫採內接矩形；未補畫樓梯、電梯核心內部。']},
    {building:'E01_MAIN',floor:'14F',ward:'14C',source:'E_14F.pdf',image:'floorplans/E_14F.jpg',rooms:[
      ['06',306,799,34,68,true],['07',340,799,44,68,true],['08',384,799,35,68,true],['09',419,799,44,68,true],['10',463,799,44,68,true],
      ['11',536,799,45,68,true],['12',581,799,36,68,true],['13',617,799,43,68,true],['15',660,799,35,68,true],['16',695,799,43,68,true],['17',738,799,36,68,true],['18',774,799,43,68,true],
      ['05',265,927,39,67,false],['03',304,927,36,67,false],['02',347,927,36,88,false],['01',383,927,43,88,false],
      ['21',705,927,33,90,false],['20',738,927,43,90,false],['19',781,927,35,68,false],['22',816,942,39,53,false]
    ],spaces:[['鋼琴講堂',426,927,46,117,'service'],['器材、工作人員用膳室及輸送梯開水機室',497,991,87,52,'service'],['污物室',426,911,23,16,'service'],['庫房',615,927,31,33,'service'],['醫師值班室',646,927,59,33,'service'],['督導室',615,960,31,31,'service'],['管道間',646,960,48,31,'service'],['護理師更衣室',615,991,90,19,'service'],['女廁及管道',615,1010,90,33,'service'],['前室',816,927,39,15,'service']],station:['14C 護理站／護理長室／總醫師室',497,913,87,78],corridors:[['14C東西走道',265,891,590,19],['14C中央側走道',584,910,31,133]],notes:['護理站斜角及 14C02 西側內縮暫採內接矩形；未補畫樓梯、電梯核心內部。']},
    {building:'E01_MAIN',floor:'14F',ward:'14D',source:'E_14F.pdf',image:'floorplans/E_14F.jpg',rooms:[
      ['05',265,1190,38,68,true],['03',303,1190,36,68,true],['02',347,1168,35,90,true],['01',382,1168,43,90,true],
      ['21',694,1190,43,70,true],['20',737,1190,43,70,true],['19',780,1190,36,70,true],['22',816,1190,39,52,true],
      ['06',305,1318,41,68,false],['07',346,1318,36,68,false],['08',382,1318,43,68,false],['09',425,1318,36,68,false],['10',461,1318,43,68,false],['11',504,1318,36,68,false],
      ['15',657,1318,37,68,false],['16',694,1318,43,68,false],['17',737,1318,43,68,false],['18',780,1318,35,68,false]
    ],spaces:[['教室',425,1168,47,42,'service'],['檢查治療室',425,1210,47,48,'service'],['儲藏室',615,1196,30,31,'service'],['管道間',645,1196,49,31,'service'],['庫房',615,1227,30,33,'service'],['醫師值班室',645,1227,49,33,'service'],['前室',816,1242,39,18,'service'],['污物室',425,1258,47,19,'service'],['工作人員用膳室',540,1318,117,68,'service']],station:['14D 護理站／護理長室／總醫師室',497,1198,87,77],corridors:[['14D東西走道',265,1297,590,19],['14D中央側走道',584,1198,31,118]],notes:['原圖 14D12～14D13 範圍標為工作人員用膳室，沒有把床號清單轉成兩間病室。','護理站斜角及 14D02 西側內縮暫採內接矩形；未補畫樓梯、電梯核心內部。']}
  ];
  plans.push({building:'W03_EAST',floor:'1F',ward:'04E1',source:'4E1.pdf',image:'scratch/4E1_original.png',origin:[710,280],scale:0.05,
    rooms:[
      ['02',270,175,67,165,true],['06',337,175,64,165,true],
      ['08',401,175,65,165,true],['10',466,175,65,165,true],
      ['12',531,175,70,165,true],['16',601,175,61,165,true],
      ['18',662,175,59,165,true],
      ['20',871,175,58,165,true],['22',929,175,51,165,true],
      ['26',980,175,54,165,true],['28',1034,175,54,165,true],['30',1088,175,62,165,true]
    ],spaces:[
      ['庫房',721,270,50,70,'service'],
      ['辦公室／護理長室',828,265,43,39,'service'],
      ['總醫師室',828,220,43,45,'service'],
      ['護理師值班室',721,175,65,45,'service'],
      ['討論室',786,175,76,45,'service'],
      ['訪談室／治療室',620,383,133,40,'service'],
      ['研究及治療室',753,383,129,87,'service'],
      ['中庭',882,383,218,87,'service'],
      ['污物室',1100,383,50,61,'service'],
      ['復健講堂',1204,340,96,98,'service']
    ],station:['04E1 護理站／醫務室',771,220,57,120],corridors:[['04E1走道',270,340,880,43],['04E1東端走道',1150,340,54,130]],
    notes:['依原圖維持12間病室在走廊同側，18與20之間保留原有護理及辦公空間間隔。',
      '依使用者補充圖恢復護理站、辦公室與走道對面的訪談／治療室、研究及治療室、中庭、污物室及復健講堂；保留原圖名稱，污物室不改稱清潔間。',
      '病室牆面採矩形外框近似，尚未描繪浴廁凹角及18號靠護理區的不規則邊界；床位保留來源清單，床位位置為示意。']
  });
  // 5F: 5C is the south ward; 5CVI is the north-east ICU, not a C-wing clone.
  plans.push({building:'E01_MAIN',floor:'5F',ward:'05C',source:'E_05F.pdf',image:'floorplans/E_05F.jpg',origin:[304,575],scale:0.1066666667,partialCorridors:true,
    rooms:[['06',179,601,57,51,true],['07',236,601,59,51,true],['08',295,601,32,51,true],['09',352,601,31,51,true],['10',383,601,60,51,true],['11',443,601,59,51,true],['13',502,601,58,51,true],
      ['05',146,711,31,38,false],['03',177,711,30,38,false],['02',207,721,30,44,false],['01',237,721,33,44,false],['17',472,721,30,44,false],['16',502,721,29,44,false],['15',531,711,29,38,false],['18',560,711,29,38,false]],
    spaces:[['檢查治療室',237,703,90,18,'service'],['庫房',270,721,33,30,'service'],['會議室／用餐室',303,752,80,20,'service'],['護理長室',413,722,59,22,'service'],['值班室',443,703,29,19,'service'],['清潔間',413,703,30,19,'service'],['休息室',413,765,60,14,'service']],
    station:['05C 護理站',328,685,55,66],corridors:[['05C東西走道',146,673,443,12],['05C北向連通道',327,601,25,72],['05C護理站側走道',383,685,30,94]],
    notes:['依E_05F.pdf重建南側5C，未與北側東邊ICU區混用座標。','原圖可辨認5C13，未能確認5C12位置；12床號保留為待定位。','病室採內接矩形，未描繪浴廁、前室及小凹角；床位位置為示意。']});
  plans.push({building:'E01_MAIN',floor:'5F',ward:'5CVI',source:'E_05F.pdf',image:'floorplans/E_05F.jpg',origin:[304,575],scale:0.1066666667,partialCorridors:true,
    rooms:[
      ...['03','05','06','07','08','09','10','11','12','13','15','16','17','18'].map((code,i)=>[code,[531,563,593,623,652,682,711,741,770,800,830,859,889,918][i],15,i===0?32:29,49,true]),
      ['19',978,16,29,36,true],['20',1007,16,29,36,true],
      ['01',531,100,32,38,false],['02',564,100,31,38,false],
      ...['33','32','31','30','29','28','27'].map((code,i)=>[code,[682,711,741,770,800,830,859][i],101,29,38,false]),
      ['26',944,103,33,37,false],['25',978,103,29,37,false],['23',1007,103,29,37,false],['22',1037,103,29,37,false],['21',1066,103,29,37,false]
    ],spaces:[['清潔間',596,100,24,38,'service'],['護理長室',621,100,30,15,'service'],['備藥區',621,116,30,22,'service'],['器材室',948,16,29,36,'service'],['前室（19）',978,54,29,16,'service'],['前室（20）',1007,54,29,16,'service'],['污物室2',1049,64,69,17,'service']],
    station:['5CVI 護理站',652,100,29,15],corridors:[['5CVI主走道',531,71,505,19],['5CVI東段走道',944,90,151,11]],
    notes:['依E_05F.pdf北側東邊ICU區房號定位，維持5CVI床號歸屬。','原圖ICU-01及02位於西南角；03至20在北排；21至33在南排，依原圖跳號。','房間採內接矩形，未描繪門口小凹角；床位位置為示意。']});
  // 3F north wards: coordinates measured from the embedded E_03F scan (2277 x 3233).
  plans.push({building:'E01_MAIN',floor:'3F',ward:'03A1',source:'E_03F.pdf',image:'floorplans/E_03F.jpg',origin:[550,880],scale:.08,partialCorridors:true,replaceCorridorGroups:['A'],
    rooms:[['06',93,14,69,83,true],['05',162,14,73,118,true],['03',235,14,62,118,true],['02',297,14,74,118,true],['01',371,14,61,118,true],
      ['07',26,229,62,119,false],['08',88,229,72,119,false],['09',160,276,70,108,false]],
    spaces:[['醫材及備藥室',230,276,66,108],['儀器室',296,276,49,73],['污物室',369,181,70,50]],station:null,
    corridors:[['03A1病房走道',26,176,343,53],['03A1北側走道',162,132,270,44],['03A1西側走道',26,132,67,44]],
    notes:['依原圖將03A1定位於北側西半部，06/05/03/02/01在北排，07/08/09在南排。','03A1病室與03A2負壓病室不交換床號歸屬；病室採矩形內接近似，未描繪凹角、浴廁及所有附屬空間。']});
  plans.push({building:'E01_MAIN',floor:'3F',ward:'03A2',source:'E_03F.pdf',image:'floorplans/E_03F.jpg',origin:[550,880],scale:.08,partialCorridors:true,replaceCorridorGroups:['A'],isolationCodes:['01','02','03','05','06','07','08','09','10'],
    rooms:[['01',635,14,67,87,true],['02',702,14,68,87,true],['03',770,14,68,87,true],['05',838,14,68,87,true],['06',906,14,68,87,true],
      ['10',763,300,74,87,false],['09',837,300,68,87,false],['08',905,264,68,89,false],['07',973,260,66,98,false]],
    spaces:[
      ['會談室',476,14,56,48],['護理長室',532,14,42,70],['儀器室',574,14,61,102],
      ['浴廁',526,180,48,34],['男更衣室',526,214,48,30],['值班室',526,244,48,34],
      ['女更衣室',476,308,49,36],['浴廁（更衣區）',432,308,44,36],
      ['前室及家屬更衣室',574,180,61,164],
      ['污物室',635,180,44,103],['醫材及備藥室',679,180,43,108],['儀器室及備藥室',722,180,41,108],
      ['電氣室',635,283,44,61],['管道間',679,288,84,56],['管道間（北側）',974,14,32,150],
      ['負壓前室01',635,101,67,33,'anteroom'],['負壓前室02',702,101,68,33,'anteroom'],
      ['負壓前室03',770,101,68,33,'anteroom'],['負壓前室05',838,101,68,33,'anteroom'],['負壓前室06',906,101,68,33,'anteroom'],
      ['負壓前室10',763,270,74,30,'anteroom'],['負壓前室09',837,270,68,30,'anteroom'],
      ['負壓前室08',905,231,50,33,'anteroom'],['負壓前室07',982,201,57,59,'anteroom'],
      ['07入口',974,164,16,37,'anteroom'],
      ['封閉空間',1039,201,21,157]
    ],station:null,
    corridors:[
      ['03A2北排走道',635,134,339,46],
      ['03A2核心區走道',476,84,98,96],['03A2會談室旁走道',476,62,56,22],
      ['03A2儀器室前走道',574,116,61,64],['03A2西側走道',476,180,50,98],['03A2更衣區前走道',476,278,98,30],
      ['03A2前室側走道',563,308,11,36],
      ['03A2開放護理區北段',763,180,211,21],['03A2開放護理區中段',763,201,219,30],
      ['03A2開放護理區南段',763,231,142,39],['03A2開放護理區東段',955,231,27,29],['03A2開放護理區08入口',955,260,18,4],
      ['03A2通往N2走道',990,164,70,37]
    ],
    notes:['依E_03F.pdf補齊9間負壓病室、各室前室、07入口前室、開放護理區、護理長室、會談室、更衣及浴廁、醫材備藥、儀器、污物、電氣、管道與鄰近N2樓梯。',
      '原圖護理區未畫出獨立實體櫃台，因此以可通行的平面區域呈現並隱藏護理站文字，不把護理區當成阻擋走道的房間。',
      '07東側依原圖為封閉空間，已移除先前示意走道；通往N2的走道在07前室北側。',
      '西側核心區含相鄰的會談、更衣與浴廁；房間外框採矩形內接近似，前室門口凹角、家屬更衣室L形小內縮與精細門扇未逐段描繪。床位位置與尺寸為示意，非施工或隔離壓差設計圖。']});
  const toBounds=(x,y,w,h)=>({x:(x+w/2-405)*0.08,z:(y+h/2-764)*0.08,y:0,width:w*0.08,depth:h*0.08,height:1.2});
  function apply(root){
    // A ward from a different numbered main-building floor cannot be located
    // here just because a template reused its geometry. Retain it for review.
    for (const [floorTag, l] of Object.entries(root?.E01_MAIN || {})) {
      const floorNumber=parseInt(floorTag,10);
      const wrong = item => { const m=/^(\d+)[A-D]/.exec(item.ward||''); return m && Number(m[1])!==floorNumber; };
      l.sourceUnplacedSpaces=[];
      for (const key of ['rooms','nursingStations','facilities']) {
        l.sourceUnplacedSpaces.push(...(l[key]||[]).filter(wrong).map(item=>({kind:key,item,reason:'病房代碼樓層與目前樓層不符'})));
        l[key]=(l[key]||[]).filter(item=>!wrong(item));
      }
    }

    for (const plan of plans) {
    const layout=root?.[plan.building]?.[plan.floor];if(!layout)continue;
    const project=plan.origin ? (x,y,w,h)=>({x:(x+w/2-plan.origin[0])*plan.scale,z:(y+h/2-plan.origin[1])*plan.scale,y:0,width:w*plan.scale,depth:h*plan.scale,height:1.2}) : toBounds;
    if(plan.partialCorridors) layout.sourceTracePartialCorridors=true;
    if(plan.replaceCorridorGroups) layout.sourceTraceReplaceCorridorGroups=Array.from(new Set([...(layout.sourceTraceReplaceCorridorGroups||[]),...plan.replaceCorridorGroups]));
    const old=(layout.rooms||[]).filter(r=>r.ward===plan.ward);
    if(plan.station===null){
      layout.sourceUnplacedSpaces=layout.sourceUnplacedSpaces||[];
      for(const key of ['rooms','nursingStations','facilities']) layout.sourceUnplacedSpaces.push(...(layout[key]||[]).filter(r=>r.ward===plan.ward&&(key!=='rooms'||!/^[0-9]+$/.test(r.roomCode))).map(item=>({kind:key,item,reason:'依使用者要求移除舊套版公共空間'})));
    }
    const sourceBeds=window.WARD_BED_IDS?.[plan.bedWard||plan.ward]||{};
    const traced=plan.rooms.map(([code,x,y,w,h,upper])=>{
      const original=old.find(r=>r.roomCode===code)||{};
      const ids=plan.roomBeds?.[code]||sourceBeds[code]||[];
      const schematic=!ids.length&&plan.schematicBeds;
      return {...original,roomCode:code,roomName:plan.ward+code,ward:plan.ward,sourceWard:plan.bedWard||plan.ward,category:(plan.isolationCodes||[]).includes(code)?'ISOLATION':'PATIENT_ROOM',bedCount:ids.length||(schematic?(schematic.counts[code]??schematic.defaultCount):0),bounds:project(x,y,w,h),upper:(plan.ward==='14B'||plan.flipUpper)?!upper:upper,sourceTrace:true,sourcePlan:plan.source,sourceRect:{x,y,w,h},isSchematic:!!schematic,...(schematic?{bedClearance:schematic.clearance}:{}),...(plan.roomBeds?.[code]?{sourceBedIds:ids.slice()}:{}),...(plan.bedGrids?.[code]?{bedGrid:plan.bedGrids[code]}:{})};
    });
    const placedIds=new Set(traced.flatMap(r=>r.sourceBedIds||sourceBeds[r.roomCode]||[]));
    layout.sourceUnplacedBeds=(layout.sourceUnplacedBeds||[]).concat(Object.entries(sourceBeds).flatMap(([code,beds])=>beds.filter(bedId=>!placedIds.has(bedId)).map(bedId=>({ward:plan.ward,roomCode:code,bedId,reason:'來源平面圖尚無可確認房間位置'}))));
    layout.rooms=(layout.rooms||[]).filter(r=>r.ward!==plan.ward).concat(traced);
    layout.facilities=(layout.facilities||[]).filter(r=>r.ward!==plan.ward).concat(plan.spaces.map(([name,x,y,w,h,type='service'],i)=>({id:'TRACE-'+plan.ward+'-SERVICE-'+i,name,roomName:name,ward:plan.ward,type,bounds:project(x,y,w,h),sourceTrace:true,sourcePlan:plan.source})));
    layout.nursingStations=(layout.nursingStations||[]).filter(r=>r.ward!==plan.ward);
    if(plan.station){
      const [name,x,y,w,h]=plan.station;
      layout.nursingStations.push({id:'TRACE-'+plan.ward+'-NS',name,ward:plan.ward,bounds:project(x,y,w,h),color:'#0ea5e9',sourceTrace:true,sourcePlan:plan.source});
    }
    layout.sourceTraceCorridors=(layout.sourceTraceCorridors||[]).concat(plan.corridors.map(([name,x,y,w,h],i)=>({id:'TRACE-'+plan.ward+'-CORRIDOR-'+i,name,ward:plan.ward,bounds:project(x,y,w,h),sourceTrace:true,isNursingArea:name.includes('開放護理區')})));
    layout.sourceTraceWards={...(layout.sourceTraceWards||{}),[plan.ward]:{source:plan.source,image:plan.image,rooms:traced.length,notes:plan.notes}};
    }
    const fifth=root?.E01_MAIN?.['5F'];
    if(fifth){
      // The old template invented 5A11 in the source ICU footprint; the PDF
      // north row reads 5A06/07/08/09/10/12. Keep its records for source review.
      const unknown=fifth.rooms.filter(r=>r.ward==='05A'&&r.roomCode==='11');
      fifth.sourceUnplacedSpaces.push(...unknown.map(item=>({kind:'rooms',item,reason:'E_05F.pdf未能確認5A11；舊套版位置與原圖ICU重疊'})));
      fifth.sourceUnplacedBeds=(fifth.sourceUnplacedBeds||[]).concat(unknown.flatMap(r=>(window.WARD_BED_IDS?.['05A']?.[r.roomCode]||[]).map(bedId=>({ward:'05A',roomCode:r.roomCode,bedId,reason:'原圖尚無可確認位置'}))));
      fifth.rooms=fifth.rooms.filter(r=>!unknown.includes(r));
      const traced=[...fifth.rooms,...fifth.nursingStations,...fifth.facilities].filter(r=>r.sourceTrace);
      const overlap=(a,b)=>Math.min(a.x+a.width/2,b.x+b.width/2)-Math.max(a.x-a.width/2,b.x-b.width/2)>1e-6&&Math.min(a.z+a.depth/2,b.z+b.depth/2)-Math.max(a.z-a.depth/2,b.z-b.depth/2)>1e-6;
      const unverified=fifth.facilities.filter(f=>!f.sourceTrace&&traced.some(r=>overlap(f.bounds,r.bounds)));
      fifth.sourceUnplacedSpaces.push(...unverified.map(item=>({kind:'facilities',item,reason:'5F舊套版公共空間與原圖重建區重疊，保留待定位'})));
      fifth.facilities=fifth.facilities.filter(f=>!unverified.includes(f));
    }
    // E_03F shows the 3B-to-3C route through the east-side core.
    // 3B/3C room outlines still use the legacy geometry; widths/lengths below
    // express that connectivity around their extents, not surveyed source dimensions.
    const third=root?.E01_MAIN?.['3F'];
    if(third){
      for(const [id,x,y,w,h] of [['FAC-STAIR-N1',3,15,56,117],['FAC-STAIR-N2',1012,16,70,144]]){
        const f=(third.facilities||[]).find(f=>f.id===id);if(!f)continue;
        f.sourceBounds={...f.bounds};f.bounds={x:(x+w/2-550)*.08,z:(y+h/2-880)*.08,width:w*.08,depth:h*.08,y:0,height:1.2};f.sourceRect={x,y,w,h};f.sourceTrace=true;f.sourcePlan='E_03F.pdf';if(id==='FAC-STAIR-N2')f.ward='03A2';
      }
      const route=[
        ['B-ACCESS',38.5,-19.6,18,2.6,false],
        ['EAST-CORE',46,-4.9,3,32,true],
        ['C-ACCESS',39.5,9.8,16,1.0,false]
      ];
      third.sourceTraceCorridors=(third.sourceTraceCorridors||[]).concat(route.map(([id,x,z,width,depth,label])=>({id:'DISPLAY-3F-BC-'+id,name:'3B－3C連接通道（走道示意）',ward:'3BC',connects:['03B1','03B2','03C'],bounds:{x,z,width,depth,y:0,height:.05},isInterWing:true,mainSpine:true,connectionLabel:label,connectionText:'3B－3C連接通道',labelLines:['3B－3C','連','接','通','道'],sourcePlan:'E_03F.pdf',isSchematic:true})));
      third.sourceTraceNotes=['03A1／03A2依原圖逐間定位；03B1、03B2及03C仍保留原病室幾何。3B－3C連接通道依原圖東側核心區的連通關係補繪，尺寸與長度為示意，未宣稱全樓層已逐間重建。'];
    }
    // Unassigned legacy elevator rectangles belong to the old template, not
    // to any traced 14F room. Keep them unplaced until the core is traced.
    const tracedFloor=root?.E01_MAIN?.['14F'];
    if(tracedFloor){
      // Conservative inner strip of the source B–C passage. It runs through
      // B15/B16 and C10/C11 gaps; no room or desk is placed on this spine.
      const links=[
        ['BC-B-ACCESS',507,489,29,111,false],
        ['BC-LINK',507,600,29,199,true],
        ['BC-C-ACCESS',507,799,29,111,false]
      ];
      tracedFloor.sourceTraceCorridors=tracedFloor.sourceTraceCorridors.filter(c=>!c.isInterWing).concat(links.map(([id,x,y,w,h,label])=>({id:'TRACE-14F-'+id,name:'B–C 棟連通道',ward:'BC',connects:['14B','14C'],bounds:toBounds(x,y,w,h),sourceRect:{x,y,w,h},sourceTrace:true,sourcePlan:'E_14F.pdf',isInterWing:true,mainSpine:true,connectionLabel:label})));
      const cInfo=tracedFloor.sourceTraceWards['14C'];
      cInfo.notes.push('污物室依原圖位於鋼琴講堂上方，與講堂左界對齊；講堂西側內縮仍採內接矩形。');
      tracedFloor.sourceUnplacedSpaces.push(...tracedFloor.facilities.filter(f=>!f.sourceTrace).map(item=>({kind:'facilities',item,reason:'14F舊套版公共空間，尚未依原圖定位'})));
      tracedFloor.facilities=tracedFloor.facilities.filter(f=>f.sourceTrace);
    }
  }
  window.WardSourceTraces={apply,plans};
})();
