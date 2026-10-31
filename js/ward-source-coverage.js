/* Explicit audit scope and provenance. Preserve withdrawn demo data locally;
   do not present a repeated 16-room template as an actual ward floor. */
(function(){
  const api=window.WardSourceTraces,original=api.apply;
  api.apply=function(root){
    original(root);
    for(const [building,floors]of Object.entries(root))for(const[floor,l]of Object.entries(floors)){
      const ignored=building==='E01_MAIN'&&['1F','2F','10F'].includes(floor);
      const sources=Object.keys(l.sourceTraceWards||{});
      if(ignored){l.sourceCoverage={status:'excluded',message:'依使用者指示不在本次病房校核範圍'};continue;}
      // The old 14F drawing was a copied 5F demo. Its beds exist in the
      // registry, but that does not establish room positions on this floor.
      if(building==='CHILD_HOSPITAL'&&floor==='14F'&&!sources.length){
        l.withdrawnTemplate={rooms:l.rooms,nursingStations:l.nursingStations,facilities:l.facilities,corridors:l.corridors,beds:l.beds};
        l.sourceUnplacedSpaces=l.sourceUnplacedSpaces||[];
        for(const kind of ['rooms','nursingStations','facilities'])l.sourceUnplacedSpaces.push(...(l[kind]||[]).map(item=>({kind,item,reason:'14樓舊套圖混入5樓公共空間，無本層原圖可定位'})));
        l.sourceUnplacedBeds=l.sourceUnplacedBeds||[];
        const saved=new Set(l.sourceUnplacedBeds.map(b=>b.bedId));
        for(const ward of ['14PW','14PE'])for(const[roomCode,ids]of Object.entries(window.WARD_BED_IDS?.[ward]||{}))
          for(const bedId of ids)if(!saved.has(bedId)){l.sourceUnplacedBeds.push({ward,roomCode,bedId,reason:'缺兒醫14樓原圖，保留來源床號待定位'});saved.add(bedId);}
        l.rooms=[];l.nursingStations=[];l.facilities=[];l.corridors=[];l.beds=[];l.displayCorridors=[];
        l.sourceCoverage={status:'excluded',message:'依使用者指示忽略兒醫14樓；已撤下混用5樓的錯誤套圖，來源床號仍保留'};
        continue;
      }
      if(!sources.length&&(l.rooms||[]).length&&(l.rooms||[]).every(r=>!(window.WARD_BED_IDS?.[r.ward]&&Object.keys(window.WARD_BED_IDS[r.ward]).length))){
        l.withdrawnTemplate={rooms:l.rooms,nursingStations:l.nursingStations,facilities:l.facilities,corridors:l.corridors,beds:l.beds};
        l.rooms=[];l.nursingStations=[];l.facilities=[];l.corridors=[];l.beds=[];
        l.sourceCoverage={status:'missing-source',message:'未提供可核實的本層病房原圖；舊示範套圖已撤回，資料保留待核對'};
        continue;
      }
      l.sourceCoverage={status:sources.length?'source-approximated':'schematic',sourceWards:sources,
        message:sources.length?'依本層原圖矩形近似；門位、尺寸與床位精確位置仍需核對':'示意配置，尚未提供可核實的本層原圖'};
    }
    for(const ward of ['0PNO','0PNI','0PIM','0PII']){
      const w=window.ROOMS_DATA?.wards?.[ward];if(w){w.floor='10F';w.buildingId='CHILD_HOSPITAL';w.floorBasis='使用者確認0PNO_0PNI.pdf全區位於兒醫10樓';}
    }
    const neo=root.CHILD_HOSPITAL['10F'];
    const pb=window.ROOMS_DATA?.wards?.['11PB'];if(pb){pb.floor='11F';pb.buildingId='CHILD_HOSPITAL';pb.floorBasis='使用者最新指認為11PW旁兩間觀察室，已由11PE_11PW.pdf確認位置';}
    neo.sourceCoverage.notes=['11PB依使用者最新指認，已改為11PW旁兩間觀察室，歸11樓。',
      '新生兒開放區床號集中示意，未把床號清單補畫成個別隔間。'];
  };
})();
