/* Health Building ward plans are schematic pending official floor drawings. */
(function (window) {
  'use strict';
  const layouts = window.WARD_3D_LAYOUT_DATA || (window.WARD_3D_LAYOUT_DATA = {});
  const floorplans = window.FLOORPLANS_DATA || {};
  const wards = window.ROOMS_DATA?.wards || {};
  const targetCodes = ['07HS', '09HN', '09HS', '10HN', '10HS', '12HN', '12HS'];
  const isHealthWard = code => /H/i.test(String(code || ''));

  for (const [buildingId, floors] of Object.entries(layouts)) {
    for (const [floor, layout] of Object.entries(floors || {})) {
      for (const [key, items] of Object.entries(layout || {})) if (Array.isArray(items)) {
        layout[key] = items.filter(item => !isHealthWard(item?.ward));
        layout[key].forEach(item => { if (Array.isArray(item?.connects)) item.connects = item.connects.filter(code => !isHealthWard(code)); });
      }
      if (layout.sourceTraceWards) for (const code of Object.keys(layout.sourceTraceWards)) if (isHealthWard(code)) delete layout.sourceTraceWards[code];
      if (!(layout.rooms || []).length) { delete floors[floor]; if (floorplans[buildingId]) delete floorplans[buildingId][floor]; }
    }
  }
  for (const floors of Object.values(floorplans)) for (const [floor, plan] of Object.entries(floors || {})) if (Array.isArray(plan?.wards)) {
    plan.wards = plan.wards.filter(code => !isHealthWard(code));
    if (!plan.wards.length) delete floors[floor];
  }
  for (const code of Object.keys(wards)) if (isHealthWard(code)) { wards[code].buildingId = 'HEALTH_BUILDING'; wards[code].campus = 'west'; }

  const health = layouts.HEALTH_BUILDING = {};
  const makeWard = (code, side) => {
    const source = wards[code]; if (!source) return null;
    const patient = (source.rooms || []).filter(r => r.category === 'PATIENT_ROOM' || r.category === 'ISOLATION');
    const support = (source.rooms || []).filter(r => !patient.includes(r));
    const north = side === 'north', rowZ = north ? [-10.1, -2.1] : [2.1, 10.1];
    const rows = [patient.slice(0, Math.ceil(patient.length / 2)), patient.slice(Math.ceil(patient.length / 2))];
    const rooms = [];
    rows.forEach((row, ri) => {
      const cell = Math.min(4.35, 33 / Math.max(row.length, 1)), start = -(row.length - 1) * cell / 2;
      row.forEach((r, i) => rooms.push({ roomCode:r.roomCode, roomName:r.roomName, ward:code,
        category:r.category || 'PATIENT_ROOM', roomType:r.roomType, bedCount:r.bedCount || r.beds?.length || 0,
        sourceBedIds:(r.beds || []).map(b => b.bedId).filter(Boolean),
        bounds:{x:start+i*cell,y:0,z:rowZ[ri],width:cell*.94,depth:4.15,height:1.2},
        upper:north ? ri===0 : false, isSchematic:false, positionSchematic:true,
        placementBasis:'健康大樓正式平面圖尚未提供；病室位置與尺寸為示意，床號沿用院內病房清冊' }));
    });
    support.forEach((r,i) => rooms.push({ roomCode:r.roomCode,roomName:r.roomName,ward:code,
      category:r.category || 'SERVICE_ROOM',roomType:r.roomType,bedCount:0,
      bounds:{x:i===0?-16.2:16.2,y:0,z:north?-6.1:6.1,width:3.2,depth:3.2,height:1.2},
      isSchematic:false,positionSchematic:true,placementBasis:'健康大樓正式平面圖尚未提供；服務空間位置為示意' }));
    return {rooms,station:{id:`NS-${code}`,name:`${code} 護理站`,ward:code,bounds:{x:0,y:0,z:north?-6.1:6.1,width:5.2,depth:2.4,height:1.2},color:'#168f8b'},
      corridor:{id:`CORR-${code}`,name:`${code} 病房走道`,ward:code,bounds:{x:0,y:0,z:north?-6.1:6.1,width:31,depth:1.8,height:.08}}};
  };
  for (const code of targetCodes) {
    const floor = `${Number(code.slice(0,2))}F`, side = code.endsWith('HN') ? 'north' : 'south';
    const part = makeWard(code,side); if (!part?.rooms.length) continue;
    const layout = health[floor] ||= {rooms:[],nursingStations:[],facilities:[],corridors:[],
      sourceDisplayNote:'健康大樓正式病房平面圖尚未提供，本樓層為模擬配置；病室位置與大小待原圖核對，床號與床數依病房清冊。'};
    layout.rooms.push(...part.rooms); layout.nursingStations.push(part.station); layout.corridors.push(part.corridor);
  }
})(window);
