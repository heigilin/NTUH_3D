const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
global.window=global;
for(const f of ['data/rooms-data','data/ward-3d-layout-data','data/ward-bed-ids','ward-source-traces','ward-source-6f','ward-source-floor-review','ward-plan-layout','ward-plan-geometry','ward-plan-2d'])vm.runInThisContext(fs.readFileSync('js/'+f+'.js','utf8'));
const g=WardPlanGeometry,data=WARD_3D_LAYOUT_DATA,allFloors=[3,4,5,6,7,8,9,11,12,13,14,15],sourcePositions=new Map();
for(const [f,l]of Object.entries(data.E01_MAIN))for(const n of l.nursingStations.filter(n=>n.sourceTrace))sourcePositions.set(f+n.ward,JSON.stringify(n.bounds));
const report=g.prepare(data,g.rawCorridors),rows=[];
for(const n of allFloors){
 const f=n+'F',l=data.E01_MAIN[f],a=report.find(a=>a.building==='E01_MAIN'&&a.floor===f);
 assert.equal(a.stationRawCorridorAfter,0,f+' raw station/corridor collision');assert.equal(a.stationRoomAfter,0,f+' station/room');assert.equal(a.unplacedStations.length,0,f+' unplaced station');
 for(const ns of l.nursingStations.filter(n=>n.sourceTrace))assert.equal(JSON.stringify(ns.bounds),sourcePositions.get(f+ns.ward),'source station moved');
 const wards=[...new Set(l.rooms.map(r=>r.ward))].map(w=>{
  const rooms=l.rooms.filter(r=>r.ward===w&&/^\d+$/.test(r.roomCode)),r=rooms.length;
  return {ward:w,rooms:r,sourceRooms:rooms.filter(r=>r.sourceTrace).length,averageWidth:r?rooms.reduce((s,r)=>s+r.bounds.width,0)/r:0,averageDepth:r?rooms.reduce((s,r)=>s+r.bounds.depth,0)/r:0};
 });
 rows.push({floor:f,rawStationCorridorAfter:a.stationRawCorridorAfter,stationRoomAfter:a.stationRoomAfter,sourceStations:l.nursingStations.filter(n=>n.sourceTrace).length,schematicStations:l.nursingStations.filter(n=>!n.sourceTrace).map(n=>n.ward),wards});
}
const l=data.E01_MAIN['6F'],A=l.rooms.filter(r=>r.ward==='06A'&&/^\d+$/.test(r.roomCode)),B=l.rooms.filter(r=>r.ward==='06B'&&/^\d+$/.test(r.roomCode));
const ratio=A.reduce((s,r)=>s+r.bounds.depth,0)/A.length/(B.reduce((s,r)=>s+r.bounds.depth,0)/B.length);
assert(ratio>.9&&ratio<1.2,'6A/B room-depth ratio');assert(A.every(r=>r.sourceTrace&&r.sourcePlan==='E_06F.pdf'));
for(const w of ['06A','06B']){const s=WardPlan2D.scene('E01_MAIN','6F',w);assert(s.rooms.length>0);assert(s.spaces.some(x=>x.kind==='nurse'));}
const output={scope:'東址病房樓層；依使用者指示排除1F、2F、10F',ratio06A06BDepth:ratio,rows,allBuildingRawStationCollisions:report.filter(r=>r.stationRawCorridorAfter>0),note:'3F的03B1/03B2/03C及4F的04C1/04C2/04D1仍含舊版病室幾何；護理站僅示意位置，不宣稱已依原圖完成定位。'};
fs.writeFileSync('scratch/proportion-review/station-scale-audit.json',JSON.stringify(output,null,2));
console.log(JSON.stringify({floors:rows.length,rawStationCorridorCollisions:rows.reduce((n,r)=>n+r.rawStationCorridorAfter,0),ratio06A06BDepth:ratio,sourceStations:rows.reduce((n,r)=>n+r.sourceStations,0),schematicStations:rows.flatMap(r=>r.schematicStations),otherBuildingCollisions:output.allBuildingRawStationCollisions.length}));
