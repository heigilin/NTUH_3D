/* Source-proportion corrections are applied before campus-model fitting.
   Room envelopes and safe bed zones are deliberately separate. */
(function(){
 const api=window.WardSourceTraces,entries=window.WARD_PROPORTION_REVIEW_DATA||[];
 const key=p=>p.building+'/'+p.floor+'/'+p.ward;
 const effective=new Map;for(const p of api.plans)effective.set(key(p),p);
 const record=new Map(entries.map(e=>[key(e),e]));
 const get=w=>[...effective.values()].filter(p=>p.ward===w);
 const setStation=(p,rect,parts=[],spaces=[])=>{
  p.station=[p.ward+' 護理站',...rect];p.reviewStationParts=parts;
  p.spaces.push(...spaces);const e=record.get(key(p));if(e)e.stationCheck='依本張原圖分開護理站、附屬辦公／用餐空間；斜角圓弧採分段內接矩形';
 };
 for(const p of effective.values()){
  const e=record.get(key(p));if(!e)continue;
  p.reviewBedRects={};
  for(const r of p.rooms){const c=e.roomRects[r[0]];if(!c)continue;p.reviewBedRects[r[0]]=c.bed.slice();r.splice(1,4,...c.outer);}
  if(['6C','6D'].includes(p.ward))p.image='scratch/E_06F_source.png';
  if(p.building==='E01_MAIN'&&p.station&&/護理長室/.test(p.station[0])&&!['15C','6D'].includes(p.ward)){
   const [,x,y,w,h]=p.station,flip=/B$|D$/.test(p.ward),a=(xx,yy,ww,hh)=>[x+xx*w,y+yy*h,ww*w,hh*h];
   const parts=flip?[a(.34,0,.66,.55),a(0,.55,1,.25),a(.2,.8,.6,.2)]:[a(.34,.45,.66,.55),a(0,.2,1,.25),a(.2,0,.6,.2)];
   const poly=[[.2,0],[.8,0],[1,.2],[1,1],[.34,1],[.34,.45],[0,.45],[0,.2]];
   p.reviewStationOutline=poly.map(([xx,yy])=>[x+xx*w,y+(flip?1-yy:yy)*h]);
   const offices=flip?[a(0,0,.32,.26),a(0,.29,.32,.26)]:[a(0,.45,.32,.26),a(0,.73,.32,.27)];
   const names=flip||p.ward==='6C'?['總醫師室','護理長室']:['護理長室','總醫師室'];
   setStation(p,parts[0],parts.slice(1),offices.map((r,i)=>[names[i],...r]));
  }
 }
 for(const p of get('6D'))setStation(p,[540,1336,85,23],[[556,1359,59,16]],
  [['護理長室',540,1299,27,18],['總醫師室',540,1319,27,16],['電訊機房',569,1299,57,36]]);
 for(const p of get('15D')){
  p.station=null;p.corridors.push(['15D開放護理區',627,1253,161,41]);
  record.get(key(p)).stationCheck='原圖為護理站／走道的開放區，改為開放護理地坪，不畫成控制室內的櫃台';
 }
 for(const p of get('15C')){
  p.station=null;p.spaces.push(['護理長室／會談空間',428,908,85,77]);
  const e=record.get(key(p));e.stationCheck='原圖此區標示護理長室／會談及未命名空間，不能據此核實封閉護理站；撤回原合併方塊，保留待核對紀錄';e.status='station-source-unresolved';
 }
 for(const p of get('04E1')){
  p.reviewStationParts=[[828,305,43,35]];p.spaces.push(['護理助理辦公室',721,221,50,48]);
  record.get(key(p)).stationCheck='保留護理站／醫務室主區，補回南側轉折，護理助理辦公室獨立呈現';
 }
 for(const p of get('04E2')){
  p.spaces=p.spaces.filter(s=>s[0]!=='護理長室／醫師值班室');
  setStation(p,[619,208,53,59],[[586,245,33,22]],
   [['醫師值班室',576,187,41,31],['庫房（護理站側）',576,220,41,24],['護理長室',641,169,30,37]]);
 }
 for(const p of get('03W2'))setStation(p,[479,230,63,63],[[542,230,29,26]],[['護理長室',543,257,28,36]]);
 for(const p of get('03E2')){
  p.spaces=p.spaces.filter(s=>s[0]!=='護理／治療及準備空間');
  setStation(p,[516,229,38,98],[[554,229,50,14],[554,243,28,16]],
   [['護理長室（站側）',486,229,28,38],['護理準備區',486,269,28,58],['護理站前室',556,261,52,66,'anteroom'],['治療室',608,229,42,43]]);
 }
 for(const p of get('06W3')){
  p.rooms.push(['三人房C5',916,70,69,80,true]);p.reviewBedRects['三人房C5']=[916,70,69,72];
  p.schematicBeds.counts['三人房C5']=3;
  p.spaces=[['護理長室',600,69,29,25],['器械清洗室',600,97,29,21],['陽光會客室',600,121,47,26],['治療室',632,69,71,48],['會談室',650,121,53,26]];
  setStation(p,[522,69,75,78]);
  record.get(key(p)).roomCheck='東段依704/773/844/915/987黑色分隔牆核對四間三人房，補回第4格；房型床位為示意，正式床號仍待對照';
 }
 for(const p of get('05W3')){
  p.spaces=[['醫師／值班及工作空間',525,412,114,80],['護理長室',641,412,37,35],['工作區',641,465,14,27],['化療藥物存放室',679,412,109,22],['庫房',757,436,31,56]];
  setStation(p,[656,449,100,43],[[641,449,15,15],[679,436,77,13]]);
 }
 for(const p of get('05W4'))setStation(p,[532,368,65,62],[[509,392,23,38]],[['工作室',509,368,21,22]]);
 for(const p of get('06E2')){
  p.spaces=[['護理秘書室',509,159,50,24],['醫師值班室',509,201,28,19],['庫房',563,159,56,24],['護理長室',563,186,56,34]];
  setStation(p,[509,186,52,14],[[538,200,23,20]]);
 }
 for(const p of get('05PW')){
  p.spaces=p.spaces.filter(s=>s[0]!=='衛教室');
  setStation(p,[220,196,42,56],[[262,196,72,23]],[['衛教室',264,220,70,32],['09前室／浴廁',389,153,41,48,'anteroom']]);
 }
 for(const p of get('11PE'))setStation(p,[231,659,65,43],[[219,649,77,10],[296,686,47,16],[259,702,58,17]]);
 for(const p of get('12PE')){
  p.spaces=p.spaces.filter(s=>s[0]!=='用餐室');
  setStation(p,[234,634,64,53],[[221,616,77,18],[298,654,51,33],[262,687,58,22]],[['用餐室',300,620,50,32]]);
 }
 for(const p of get('13PE')){
  p.spaces=p.spaces.filter(s=>s[0]!=='用餐／洗衣空間');
  setStation(p,[229,624,64,71],[[216,606,77,18],[293,643,51,51],[259,695,58,20]],[['用餐室',294,607,50,33]]);
 }
 for(const p of get('12PW'))setStation(p,[446,242,72,76],[[405,228,91,14],[396,242,48,19]],
  [['儲藏空間（主站側）',394,263,49,16],['開水／熱食間',394,281,49,37]]);
 for(const p of get('13PW'))setStation(p,[441,229,81,73],[[403,215,104,14],[395,230,44,19]],
  [['儲藏空間（主站側）',395,251,44,16],['開水／熱食間',395,269,44,33]]);
 const original=api.apply;
 api.apply=function(root){
  original(root);
  const project=(p,r)=>{const o=p.origin||[405,764],s=p.scale||.08;return{x:(r[0]+r[2]/2-o[0])*s,z:(r[1]+r[3]/2-o[1])*s,width:r[2]*s,depth:r[3]*s,y:0,height:.05};};
  const subtract=(outer,bed)=>{
   const [x,y,w,h]=outer,[bx,by,bw,bh]=bed,parts=[];
   if(bx>x+.1)parts.push([x,y,bx-x,h]);if(bx+bw<x+w-.1)parts.push([bx+bw,y,x+w-bx-bw,h]);
   const left=Math.max(x,bx),right=Math.min(x+w,bx+bw);
   if(by>y+.1)parts.push([left,y,right-left,by-y]);if(by+bh<y+h-.1)parts.push([left,by+bh,right-left,y+h-by-bh]);return parts;
  };
  for(const p of effective.values()){
   const e=record.get(key(p));if(!e)continue;const l=root[p.building]?.[p.floor];if(!l)continue;
   for(const r of l.rooms.filter(r=>r.ward===p.ward)){
    const bed=p.reviewBedRects?.[r.roomCode];if(!bed)continue;
    r.bedBounds=project(p,bed);r.sourceBedRect=bed.slice();
    const outer=p.rooms.find(q=>q[0]===r.roomCode).slice(1,5);
    r.annexBounds=subtract(outer,bed).map(q=>project(p,q));r.sourceAnnexRects=subtract(outer,bed);
   }
   const station=l.nursingStations.find(n=>n.ward===p.ward);
   if(station&&p.reviewStationParts){station.parts=p.reviewStationParts.map(r=>project(p,r));station.sourceParts=[p.station.slice(1),...p.reviewStationParts];if(p.reviewStationOutline)station.outline=p.reviewStationOutline.map(([x,y])=>{const q=project(p,[x,y,0,0]);return q;});}
   l.sourceProportionReviews={...(l.sourceProportionReviews||{}),[p.ward]:{...e,roomEnvelopes:Object.keys(p.reviewBedRects||{}).length,sourcePixelEvidence:true}};
  }
 };
 window.WARD_PROPORTION_REVIEW=entries;
})();
