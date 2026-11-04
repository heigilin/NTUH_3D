const fs=require('fs'),vm=require('vm'),assert=require('assert');global.window=global;global.location={search:""};
const paths=[...fs.readFileSync('index.html','utf8').matchAll(/<script[^>]+src="(js\/[^"?]+)(?:\?[^" ]*)?"/g)].map(m=>m[1]).filter(p=>p.startsWith('js/data/')||/^js\/ward-/.test(p));
for(const p of paths)vm.runInThisContext(fs.readFileSync(p,'utf8'),{filename:p});
const before=new Map();for(const [b,floors]of Object.entries(WARD_3D_LAYOUT_DATA))for(const [f,l]of Object.entries(floors))before.set(b+'/'+f,{ids:(l.beds||[]).map(b=>b.bedId),ratios:(l.rooms||[]).map(r=>r.bounds.width/r.bounds.depth)});
WardPlanGeometry.prepare(WARD_3D_LAYOUT_DATA,WardPlanGeometry.rawCorridors);
const rows=[];for(const b of CAMPUS_DATA.buildings)for(const [f,l]of Object.entries(WARD_3D_LAYOUT_DATA[b.id]||{})){
 if(!l.rooms.length||(b.id==='E01_MAIN'&&['1F','2F','10F'].includes(f)))continue;
 const old=before.get(b.id+'/'+f);assert.deepEqual(l.beds.map(b=>b.bedId),old.ids);
 l.rooms.forEach((r,i)=>assert(Math.abs(r.bounds.width/r.bounds.depth-old.ratios[i])<1e-8,'aspect changed'));
 const items=['rooms','facilities','nursingStations','beds','displayCorridors'].flatMap(key=>l[key]||[]).flatMap(i=>[i,...(i.parts||[])]);let outside=0;
 for(const i of items){const q=i.bounds||i;if(Math.abs(q.x)+q.width/2>b.dimensions.width/2+1e-6||Math.abs(q.z)+q.depth/2>b.dimensions.depth/2+1e-6)outside++;}
 assert.equal(outside,0,b.id+'/'+f+' overflow');
 const fit=l.buildingFit;rows.push({building:b.id,floor:f,wards:[...new Set(l.rooms.map(r=>r.ward))],scale:+fit.scale.toFixed(4),sourceExtent:{width:+fit.original.width.toFixed(2),depth:+fit.original.depth.toFixed(2)},buildingSize:b.dimensions,outside});
}
const once=JSON.stringify(WARD_3D_LAYOUT_DATA);WardPlanGeometry.prepare(WARD_3D_LAYOUT_DATA,WardPlanGeometry.rawCorridors);assert.equal(JSON.stringify(WARD_3D_LAYOUT_DATA),once,'not idempotent');
fs.writeFileSync('scratch/building-footprint-audit.json',JSON.stringify(rows,null,2));
fs.writeFileSync('建築範圍比例檢查.txt','建築範圍與病房配置比例檢查\n'+rows.map(r=>`${r.building} ${r.floor} ${r.wards.join('/')}：原配置 ${r.sourceExtent.width} × ${r.sourceExtent.depth}；建築 ${r.buildingSize.width} × ${r.buildingSize.depth}；等比例係數 ${r.scale}；超界 ${r.outside}`).join('\n')+'\n\n配置等比例縮放並置於原建築外框內，保留房間長寬比及床號。這是院區模型中的顯示比例校正，並非建築實測尺寸或細部牆線核實。東址1、2、10樓依指定不列入病房檢查。\n');
console.log(JSON.stringify({floors:rows.length,buildings:new Set(rows.map(r=>r.building)).size,outside:rows.reduce((n,r)=>n+r.outside,0),w04:rows.find(r=>r.building==='W03_WEST'&&r.floor==='2F')}));
