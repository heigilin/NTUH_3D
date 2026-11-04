const fs=require('fs');
const a=JSON.parse(fs.readFileSync('scratch/proportion-review/station-scale-audit.json','utf8'));
const b=JSON.parse(fs.readFileSync('scratch/all-ward-source-audit.json','utf8'));
const eastPending=b.rows.filter(r=>r.building==='E01_MAIN'&&r.conflicts.length);
const lines=['全樓層病室比例與護理站走道檢查（2026-10-31）',
'範圍：東址3、4、5、6、7、8、9、11、12、13、14、15樓，共12層。依使用者指示排除無病房的1、2、10樓。',
'',
'已修正：06A舊套版與06B原圖比例混用；目前6樓各區使用同一E_06F.pdf座標比例。',
'06A／06B平均病室深度比：'+a.ratio06A06BDepth.toFixed(4)+'；比值約1，保留原圖各房型的實際相對差異。',
'共同修正：原圖核心走道取代舊版AB／CD中央走道，不再重複繪製。',
'護理站若僅局部侵入走道也列為衝突；檢查未裁切走道的完整範圍。走道不再靠扣除護理站面積而通過檢查。',
'12層：護理站／完整走道相交0；護理站／病室相交0；原圖已定位護理站45個，位置未被自動挪動。',
'3、4樓的6個未完成原圖定位護理站仍為示意位置；不能把無碰撞當成已證實實際位置。',
'',
'樓層\t完整走道與護理站相交\t已依原圖定位護理站\t仍為示意的護理站',
...a.rows.map(r=>[r.floor,r.rawStationCorridorAfter,r.sourceStations,r.schematicStations.join('、')||'無'].join('\t')),
'',
'尚未完成的配置校正：',
'03B1、03B2、03C及04C1、04C2、04D1仍包含舊版病室幾何，尚不能宣稱全層配置已依原圖重建。',
...eastPending.map(r=>r.floor+' '+r.ward+'：病室／公共空間重疊'+r.conflicts.length+'對；'+r.conflicts.map(c=>c.a+'／'+c.b).join('；')),
'其餘院區的初篩結果另見逐病房原圖校核報告.txt。此次不宣稱西址、兒醫配置已逐間核實。',
'',
'驗證：語法檢查、12層原圖重建區／連通走道檢查、完整走道與護理站檢查、6C／6D示意床位回歸檢查通過；瀏覽器已檢視6樓全層3D及06B的2D／3D。',
'程式檢查：scratch/check-floor-scale-stations.cjs；scratch/check-floor-source-review.cjs；scratch/check-6cd.cjs。',
'畫面：Documents/ChatGPT/平面圖/06B_護理站離開走道_2D.jpg、06B_護理站離開走道_3D.jpg、6樓_統一比例_3D.jpg。'];
fs.writeFileSync('全樓層比例與護理站檢查.txt',lines.join('\n'));
const f='6CD_原圖重建說明.txt';let t=fs.readFileSync(f,'utf8');t=t.replace('6樓仍保留A、B既有配置，本次未宣稱已校核A、B。','後續已核對06A／06B原圖比例與護理站走道位置，詳見全樓層比例與護理站檢查.txt。');fs.writeFileSync(f,t);
console.log(JSON.stringify({report:'全樓層比例與護理站檢查.txt',remainingEastRoomConflicts:eastPending.map(r=>({ward:r.ward,pairs:r.conflicts.length}))}));
