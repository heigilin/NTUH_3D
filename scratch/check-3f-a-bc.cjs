const fs=require('fs'),vm=require('vm'),assert=require('assert');global.window=global;
for(const f of ['js/data/rooms-data.js','js/data/ward-3d-layout-data.js','js/data/ward-bed-ids.js','js/ward-source-traces.js','js/ward-plan-layout.js','js/ward-plan-geometry.js','js/ward-plan-2d.js'])vm.runInThisContext(fs.readFileSync(f,'utf8'));
const g=WardPlanGeometry;g.prepare(WARD_3D_LAYOUT_DATA,g.rawCorridors);const l=WARD_3D_LAYOUT_DATA.E01_MAIN['3F'];
const a1=l.rooms.filter(r=>r.ward==='03A1'),a2=l.rooms.filter(r=>r.ward==='03A2');assert.equal(a1.length,8);assert.equal(a2.length,9);
assert(a1.every(r=>r.bounds.x<0&&r.sourceTrace));assert(a2.every(r=>r.bounds.x>0&&r.sourceTrace));
assert.deepEqual(a1.filter(r=>r.upper).sort((a,b)=>a.bounds.x-b.bounds.x).map(r=>r.roomCode),['06','05','03','02','01']);
assert.deepEqual(a2.filter(r=>r.upper).sort((a,b)=>a.bounds.x-b.bounds.x).map(r=>r.roomCode),['01','02','03','05','06']);
for(const w of ['03A1','03A2'])assert.deepEqual(l.beds.filter(b=>b.ward===w).map(b=>b.bedId).sort(),Object.values(WARD_BED_IDS[w]).flat().sort());
const all=l.rooms.filter(r=>r.bounds);for(const a of [...a1,...a2])for(const b of all)if(a!==b)assert(!g.hit(g.rect(a.bounds),g.rect(b.bounds)),a.roomName+' overlaps '+b.roomName);
const link=l.displayCorridors.filter(c=>c.isInterWing&&c.id.includes('3F-BC'));assert.equal(link.length,3);
for(const c of link)for(const r of [...l.rooms,...l.facilities,...l.nursingStations])assert(!g.hit(g.rect(c.bounds),g.rect(r.bounds)),c.id+' overlaps '+(r.roomName||r.name));
const bc=l.displayCorridors.filter(c=>/^CORR-WING-[BC]-MAIN/.test(c.id)||c.isInterWing);assert.equal(g.components(bc),1,'3B aisle, east core, 3C aisle must form one connected network');
const s=WardPlan2D.scene('E01_MAIN','3F','ALL');assert.equal(s.corridors.filter(c=>c.isInterWing).length,3);assert(s.corridors.some(c=>c.label.includes('3B')));
for(const w of ['03B1','03C']){const scene=WardPlan2D.scene('E01_MAIN','3F',w);assert(scene.corridors.some(c=>c.isInterWing),'Missing selected-ward passage cue: '+w);assert(!scene.corridors.some(c=>/14[B-C]/.test(c.label)),'Wrong floor passage label');}
const report={date:'2026-10-31',a1Rooms:a1.map(r=>({code:r.roomCode,sourceRect:r.sourceRect})),a2Rooms:a2.map(r=>({code:r.roomCode,sourceRect:r.sourceRect})),a1Beds:l.beds.filter(b=>b.ward==='03A1').length,a2Beds:l.beds.filter(b=>b.ward==='03A2').length,passagePieces:link.length,bcComponents:g.components(bc),note:l.sourceTraceNotes};fs.writeFileSync('scratch/3f-a-bc-audit.json',JSON.stringify(report,null,2));console.log('PASS: A1 west (8 rooms) / A2 east (9 rooms), bed IDs preserved, no north-room overlap, 3B-C network connected and free of rooms/desks, 2D passage cues correct.');
