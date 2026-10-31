/* Remaining 3F/4F ICU and treatment areas. Old registry room numbers that
   cannot be located on these source versions are retained as unplaced IDs. */
(function(){
  const api=window.WardSourceTraces,plans=[];
  const add=(floor,ward,rooms,station,corridors,spaces=[],extraStations=[])=>plans.push({
    building:'E01_MAIN',floor:floor+'F',ward,source:'E_0'+floor+'F.pdf',
    image:'scratch/floor-source-review/E_0'+floor+'F.png',origin:floor===3?[550,880]:[335,758],scale:.08,
    partialCorridors:true,replaceCorridorGroups:['A','B','C','D'],rooms,station,corridors,spaces,extraStations,
    schematicBeds:{defaultCount:1,counts:{},clearance:.45},
    notes:['依本層原圖取內接矩形；不沿用普通病房的兩排套圖。',
      '開放護理區只畫內部護理台示意，不將整片開放通行區塗成護理站。',
      '原圖沒有明確對應的來源床號保留待定位；未編號的房間使用獨立示意床號。',
      '矩形不含完整浴廁、前室與凹角；床位位置與尺寸為示意。']});
  add(3,'03B1',[
    ['01',161,685,65,77,true],['02',229,685,65,77,true],['03',25,685,65,97,true],
    ['05',26,874,98,79,false],['06',161,905,65,111,false],['07',229,905,65,111,false],
    ['08',297,905,65,111,false],['09',365,905,62,111,false]],
    ['03B1 護理站',161,794,131,47],
    [['03B1護理台前走道',160,847,266,24],['03B1西側走道',127,784,32,118],['03B1南側走道',160,874,267,28]],
    [['醫師辦公室／實驗室',297,686,81,160],['總醫師辦公室',431,905,62,111]]);
  plans.at(-1).notes.push('原圖10號位置未明確對應，不能以總醫師辦公室補成10病室。');
  add(3,'03B2',[
    ['11',763,686,70,77,true],['12',837,686,64,77,true],['13',975,687,62,106,true],
    ['15',988,956,65,61,false],['16',837,905,64,111,false],['17',769,905,64,111,false],
    ['18',701,905,64,111,false],['19',633,905,64,111,false]],
    ['03B2 護理站',904,816,80,42],
    [['03B2主走道',633,863,421,29],['03B2東側走道',1057,795,29,160]],
    [['準備室',905,687,67,106],['污物／病歷醫材空間',639,767,119,91]]);
  plans.at(-1).notes.push('原圖第二單元以一／二／三／五至九標示，依原來源分區保留11／12／13／15至19；20床號未定位。');
  add(3,'03C',[
    ['05',328,1361,64,51,true],['06',428,1361,65,112,true],['07',496,1361,65,112,true],
    ['08',564,1361,64,112,true],['09',632,1361,64,112,true],
    ['19',903,1361,64,112,true],['18',971,1361,64,112,true],['17',1039,1361,64,112,true],
    ['16',1107,1361,63,112,true],['15',1173,1361,63,51,true],
    ['03',293,1556,64,36,false],['02',429,1620,64,109,false],['01',497,1620,63,109,false],
    ['10',564,1533,80,89,false],['原圖加護病房（十）',293,1597,64,95,false],
    ['11',1031,1617,64,112,false],['12',1100,1622,64,107,false],
    ['13',1239,1556,63,36,false],['20',1239,1597,63,95,false]],
    ['03C 西側護理站',429,1493,128,39],
    [['03C北側走道',293,1477,1009,14],['03C西護理台前走道',293,1535,268,18],
      ['03C東護理台前走道',648,1493,655,38],['03C西側走道',399,1492,27,237]],
    [['護理師更衣室',699,1361,63,112],['值班室',767,1361,63,112],['總醫師室',835,1361,64,112],
      ['污物室',648,1534,47,104],['倉庫',699,1534,79,104]],
    [['03C 東側護理站',1058,1535,124,35]]);
  plans.at(-1).notes.push('原圖同時有10病室與加護病房（十）字樣；後者以來源名稱及示意床保留，不重複配入同一實際床號。');
  add(4,'04C1',[
    ['05',238,796,40,50,true],['06',282,796,31,50,true],
    ['原圖北病房A',356,796,37,50,true],['原圖北病房B',396,796,37,50,true],['原圖北病房C',436,796,37,50,true],
    ['03',199,910,79,35,false],['02',199,948,79,39,false],['原圖南病房',281,964,71,38,false]],
    ['04C1 護理站',307,909,92,25],
    [['04C1北側走道',198,865,275,14],['04C1西側走道',280,880,24,82]],
    [['備藥區',316,796,36,50],['庫房／設備空間',307,882,43,23],['水療室',402,909,30,25],
      ['燒燙傷中心',356,938,76,31],['污物／清潔空間',356,973,76,29]]);
  plans.at(-1).notes.push('北排舊號與床號表07至10無法逐間核實，保留原圖空間及獨立示意床，不疊放來源床號。');
  add(4,'04C2',[
    ...Array.from({length:7},(_,i)=>['原圖北病房'+(i+1),476+i*40,796,37,50,true]),
    ['05',742,904,45,34,false],['03',714,952,73,49,false],['01',634,964,36,37,false],['02',674,964,36,37,false]],
    ['04C2 護理站',601,890,33,25],
    [['04C2北側走道',475,865,313,14],['04C2護理台東側走道',638,881,101,20],
      ['04C2南側走道',638,903,33,57],['04C2東側走道',790,865,23,137]],
    [['護理長室',579,890,19,25],['器材備藥室',579,919,55,19],['家屬諮詢室',552,941,82,19],
      ['污物／清潔間',552,964,78,14],['機房',552,981,36,21],['管道空間',592,981,38,21]]);
  plans.at(-1).notes.push('原圖北排含舊號／隔離房標示，無法對應現有06至11床號時保留待對照；08與09不再占同一個矩形。');
  add(4,'04D1',[
    ['01',554,1348,65,33,false],['02',623,1348,65,33,false]],
    ['04D1 護理站',746,1282,38,27],
    [['04D1東西走道',412,1319,372,25],['04D1護理台西側走道',715,1268,28,51]],
    [['診察室2',425,1267,39,21],['診察室3',469,1267,38,21],['換液室2',425,1292,39,23],['換液室3',469,1292,38,23]]);
  plans.at(-1).notes.push('原圖此區含診察、換液及加護空間；不依舊套版另造03至10普通病室，其床號保留待核對。');
  api.plans.push(...plans);
  const original=api.apply;
  api.apply=function(root){
    original(root);
    for(const p of plans){
      const l=root.E01_MAIN[p.floor];
      for(const r of l.rooms.filter(r=>r.ward===p.ward)){r.sourceFitBeds=true;r.bedClearance=.45;}
      for(const [i,[name,x,y,w,h]]of p.extraStations.entries())l.nursingStations.push({id:'TRACE-'+p.ward+'-NS-EXTRA-'+i,
        name,ward:p.ward,sourceTrace:true,sourcePlan:p.source,bounds:{x:(x+w/2-p.origin[0])*.08,z:(y+h/2-p.origin[1])*.08,width:w*.08,depth:h*.08,y:0,height:1.2}});
      const old=l.facilities.filter(q=>!q.sourceTrace);
      const traced=[...l.rooms,...l.facilities,...l.nursingStations].filter(q=>q.sourceTrace&&q.bounds);
      const hit=(a,b)=>Math.min(a.x+a.width/2,b.x+b.width/2)-Math.max(a.x-a.width/2,b.x-b.width/2)>1e-6&&Math.min(a.z+a.depth/2,b.z+b.depth/2)-Math.max(a.z-a.depth/2,b.z-b.depth/2)>1e-6;
      const remove=old.filter(q=>traced.some(t=>hit(q.bounds,t.bounds)));
      l.sourceUnplacedSpaces.push(...remove.map(item=>({kind:'facilities',item,reason:'舊套圖公共空間與本層原圖重建區衝突，保留待定位'})));
      l.facilities=l.facilities.filter(q=>!remove.includes(q));
      l.sourceTraceReplaceCorridorGroups=['A','B','C','D'];
    }
    const third=root.E01_MAIN['3F'];
    third.sourceTraceCorridors=third.sourceTraceCorridors.filter(c=>!c.isInterWing);
    const project=(x,y,w,h)=>({x:(x+w/2-550)*.08,z:(y+h/2-880)*.08,width:w*.08,depth:h*.08,y:0,height:.05});
    // Retain the previously requested connection cue as an explicitly schematic
    // direction outside the wards. It is not a measured walkable route.
    third.sourceTraceCorridors.push(...[[1057,863,264,25],[1321,863,25,630],[1305,1493,16,38]].map(([x,y,w,h],i)=>({
      id:'DISPLAY-3F-BC-SOURCE-REVIEW-'+i,name:'3B－3C連接方向（示意）',ward:'3BC',connects:['03B1','03B2','03C'],
      bounds:project(x,y,w,h),isInterWing:true,isSchematic:true,mainSpine:true,connectionLabel:i===1,
      connectionText:'3B－3C連接方向（示意）',labelLines:['3B－3C','連','接','方','向','示','意']})));
    third.sourceTraceNotes=['3B－3C線條僅表示連接方向；原圖核心區的實際逐段通行路徑尚待核對，不能作精確導引。'];
  };
})();
