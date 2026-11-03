/* Health Building ward plans are schematic pending official floor drawings. */
(function (window) {
  'use strict';

  const layouts = window.WARD_3D_LAYOUT_DATA || (window.WARD_3D_LAYOUT_DATA = {});
  const floorplans = window.FLOORPLANS_DATA || {};
  const wards = window.ROOMS_DATA?.wards || {};
  const targetCodes = ['07HS', '09HN', '09HS', '10HN', '10HS', '12HN', '12HS'];
  const isHealthWard = code => /H/i.test(String(code || ''));

  // Clear the old, incorrect East-site placement before registering the new
  // building. Remove all H-coded entries so none can appear under East search.
  for (const [buildingId, floors] of Object.entries(layouts)) {
    for (const [floor, layout] of Object.entries(floors || {})) {
      for (const [key, items] of Object.entries(layout || {})) {
        if (Array.isArray(items)) {
          layout[key] = items.filter(item => !isHealthWard(item?.ward));
          layout[key].forEach(item => {
            if (Array.isArray(item?.connects)) item.connects = item.connects.filter(code => !isHealthWard(code));
          });
        }
      }
      if (layout.sourceTraceWards) {
        for (const code of Object.keys(layout.sourceTraceWards)) if (isHealthWard(code)) delete layout.sourceTraceWards[code];
      }
      if (!(layout.rooms || []).length) {
        delete floors[floor];
        if (floorplans[buildingId]) delete floorplans[buildingId][floor];
      }
    }
  }
  for (const floors of Object.values(floorplans)) {
    for (const [floor, plan] of Object.entries(floors || {})) {
      if (!Array.isArray(plan?.wards)) continue;
      plan.wards = plan.wards.filter(code => !isHealthWard(code));
      if (!plan.wards.length) delete floors[floor];
    }
  }

  for (const code of Object.keys(wards)) {
    if (isHealthWard(code)) {
      wards[code].buildingId = 'HEALTH_BUILDING';
      wards[code].campus = 'west';
    }
  }

  const health = layouts.HEALTH_BUILDING = {};
  const makeWard = (code, floor, side) => {
    const source = wards[code];
    if (!source) return [];
    const patientRooms = (source.rooms || []).filter(r => r.category === 'PATIENT_ROOM' || r.category === 'ISOLATION');
    const supportRooms = (source.rooms || []).filter(r => !patientRooms.includes(r));
    const isNorth = side === 'north';
    const rowZ = isNorth ? [-10.1, -2.1] : [2.1, 10.1];
    const rows = [patientRooms.slice(0, Math.ceil(patientRooms.length / 2)), patientRooms.slice(Math.ceil(patientRooms.length / 2))];
    const rooms = [];
    rows.forEach((row, rowIndex) => {
      const n = row.length;
      const cellWidth = Math.min(4.35, 33 / Math.max(n, 1));
      const startX = -(n - 1) * cellWidth / 2;
      row.forEach((room, i) => {
        const x = startX + i * cellWidth;
        rooms.push({
          roomCode: room.roomCode,
          roomName: room.roomName,
          ward: code,
          category: room.category || 'PATIENT_ROOM',
          roomType: room.roomType,
          bedCount: room.bedCount || room.beds?.length || 0,
          sourceBedIds: (room.beds || []).map(b => b.bedId).filter(Boolean),
          bounds: { x, y: 0, z: rowZ[rowIndex], width: cellWidth * 0.94, depth: 4.15, height: 1.2 },
          upper: isNorth ? rowIndex === 0 : false,
          isSchematic: false,
          positionSchematic: true,
          placementBasis: '健康大樓正式平面圖尚未提供；病室位置與尺寸為示意，床號沿用院內病房清冊'
        });
      });
    });
    supportRooms.forEach((room, i) => {
      const x = i === 0 ? -16.2 : 16.2;
      rooms.push({
        roomCode: room.roomCode,
        roomName: room.roomName,
        ward: code,
        category: room.category || 'SERVICE_ROOM',
        roomType: room.roomType,
        bedCount: 0,
        bounds: { x, y: 0, z: isNorth ? -6.1 : 6.1, width: 3.2, depth: 3.2, height: 1.2 },
        isSchematic: false,
        positionSchematic: true,
        placementBasis: '健康大樓正式平面圖尚未提供；服務空間位置為示意'
      });
    });
    return { rooms, station: { id: `NS-${code}`, name: `${code} 護理站`, ward: code,
      bounds: { x: 0, y: 0, z: isNorth ? -6.1 : 6.1, width: 5.2, depth: 2.4, height: 1.2 }, color: '#168f8b' },
      corridor: { id: `CORR-${code}`, name: `${code} 病房走道`, ward: code,
        bounds: { x: 0, y: 0, z: isNorth ? -6.1 : 6.1, width: 31, depth: 1.8, height: 0.08 } } };
  };

  for (const code of targetCodes) {
    const floor = `${String(code).slice(0, 2).replace(/^0/, '')}F`;
    const side = code.endsWith('HN') ? 'north' : 'south';
    const part = makeWard(code, floor, side);
    if (!part.rooms.length) continue;
    const layout = health[floor] ||= { rooms: [], nursingStations: [], facilities: [], corridors: [],
      sourceDisplayNote: '健康大樓正式病房平面圖尚未提供，本樓層為模擬配置；病室位置與大小待原圖核對，床號與床數依病房清冊。' };
    layout.rooms.push(...part.rooms);
    layout.nursingStations.push(part.station);
    layout.corridors.push(part.corridor);
  }
})(window);
