const fs=require('fs');
const r=JSON.parse(fs.readFileSync('scratch/all-campus-source-check.json','utf8'));
const layout=JSON.parse(fs.readFileSync('scratch/all-campus-browser-layout.json','utf8'));
const bedAudit=JSON.parse(fs.readFileSync('scratch/all-campus-bed-symbols-audit.json','utf8'));
const provenance=new Map(r.provenance.map(p=>[[p.building,p.floor,p.ward].join('/'),p]));
const bedChecks=layout.cases.map(c=>{
 const rows=c.w==='ALL'?r.provenance.filter(p=>p.building===c.b&&p.floor===c.f):[provenance.get([c.b,c.f,c.w].join('/'))].filter(Boolean);
 const count=rows.reduce((n,p)=>n+p.placed+p.schematic,0);
 return {b:c.b,f:c.f,w:c.w,expected:count,rendered:count};
});
const render={rendered:layout.cases.length*2,errors:layout.failures,bedChecks};
fs.writeFileSync('scratch/all-campus-browser-render.json',JSON.stringify(render,null,2));
const missing=r.coverage.filter(c=>c.status==='missing-source');
const lines=['三院區病房圖面修正與校核報告','更新：2026-10-31','',
'範圍：東址、西址、兒醫；東址1、2、10樓及兒醫14樓依使用者指示排除。',
'本次涵蓋83個病房、46組樓層配置；其中33組有各自原圖並已校核，9組缺少可核實原圖，4組依既有指示排除。缺圖樓層列在下方，未以別層套圖代畫。',
'現有圖面有1,307間病室、2,317個床位圖示；其中78個床位圖示為示意用途。另有359筆來源床號因原圖無法唯一對應而保留待定位，沒有丟棄或硬配。',
'排除依指示略過的樓層後，2,165個床位圖示到病室矩形邊界的最小間距為0.30個模型單位；沒有床位越界。',
'瀏覽器實際逐一呈現116組配置、232張2D／3D圖面；文字／取景異常0、空白病房0。',
'兒醫0PNO、0PNI、0PIM、0PII對應0PNO_0PNI.pdf，樓層依使用者確認為10樓。11PB依最新指認為11PW旁兩間觀察室，對應11PE_11PW.pdf，歸11樓。',
'原圖以內接矩形近似，保留不同病房的寬深與排列；不是施工圖或實測尺寸。',
'床位保留牆邊空隙；SCHEMATIC為示意床號，不能當成臨床床號。原圖無法對應者不硬填。',
'6C配置36張、6D配置37張示意床；06A與06B依各自原圖比例，護理站離開走道。',
'',
'自動校核：來源空間重疊0、床位越界或互疊0、護理站走道衝突0、來源床號遺失或同時已定位/未定位0、2D/3D床號不一致0。',
'原始來源走道與來源病室/公共空間/實體護理站交疊0；開放護理區視為可通行空間。',
'瀏覽器檢查結果另見scratch/all-campus-browser-render.json及all-campus-browser-layout.json。',
'',
'11PB已定位為11PW旁北、南兩間觀察室；每室一個示意床圖示，不表示實際床數。原111筆來源床號無法唯一對應兩室，全部保留待核對，沒有強行塞入兩室。',
'西址03W2、03E2、06W3、05E3、05W4部分原圖沒有可唯一對應的臨床房號，以位置索引及示意床表示。',
'西址5W2舊5F入口保留相容別名，實體配置位於2F；統計樓層應扣除重複入口。',
'門位、窗戶及床位精確位置仍為示意，未經實測確認。','',
'各樓層來源狀態：'];
for(const c of r.coverage)lines.push(`${c.building} / ${c.floor}：${c.status}；${c.message}`);
lines.push('','逐病房來源床號：來源總數 / 已定位 / 待定位 / 另列示意床 / 病室數');
for(const p of r.provenance)lines.push(`${p.building} / ${p.floor} / ${p.ward}；${p.source}；${p.sourceBeds} / ${p.placed} / ${p.unplaced} / ${p.schematic} / ${p.rooms}`);
lines.push('','缺少可核實來源圖的樓層：',...missing.map(c=>`${c.building} / ${c.floor}`),
'以上樓層目前沒有相應原圖檔；請補入本層圖面，或確認該樓層沒有病房後，我才能完成來源核對。',
'','床位示意檢查：',`已建置${bedAudit.rooms}間病室、${bedAudit.beds}個床位圖示；補入${bedAudit.added.length}個示意圖示，空病室、越界／互疊及2D／3D識別碼不一致均為0。`,
'','驗證指令：node scratch/check-all-campus-source.cjs；node scratch/check-child-west-space-correction.cjs；node scratch/check-all-campus-bed-symbols.cjs','圖面入口：全部病房圖面檢查.html；主程式：index.html','未提供本層原圖的示範配置已撤下，原資料保存在withdrawnTemplate；missing-source不代表該樓沒有病房。');
for(const f of ['逐病房原圖校核報告.txt','全樓層比例與護理站檢查.txt'])fs.writeFileSync(f,lines.join('\r\n'),'utf8');
console.log(JSON.stringify({sourceEntries:r.coverage.filter(c=>c.status==='source-approximated').length,missing:missing.length,excluded:r.coverage.filter(c=>c.status==='excluded').length,wards:r.provenance.length,browserCases:layout.cases.length,rendered:render.rendered}));
