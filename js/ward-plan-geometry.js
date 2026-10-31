/* Display geometry checks. Source rooms are never moved to resolve a conflict. */
(function () {
  const EPS = 1e-6;
  const rect = b => ({ l:b.x-b.width/2, r:b.x+b.width/2, t:b.z-b.depth/2, b:b.z+b.depth/2 });
  const hit = (a,b) => Math.min(a.r,b.r)-Math.max(a.l,b.l)>EPS && Math.min(a.b,b.b)-Math.max(a.t,b.t)>EPS;
  const bounds = r => ({x:(r.l+r.r)/2,z:(r.t+r.b)/2,width:r.r-r.l,depth:r.b-r.t,height:0.05,y:0});
  function subtract(a,b) {
    if (!hit(a,b)) return [a];
    const l=Math.max(a.l,b.l),r=Math.min(a.r,b.r),t=Math.max(a.t,b.t),d=Math.min(a.b,b.b);
    return [{l:a.l,r:a.r,t:a.t,b:t},{l:a.l,r:a.r,t:d,b:a.b},{l:a.l,r:l,t,b:d},{l:r,r:a.r,t,b:d}].filter(q=>q.r-q.l>EPS&&q.b-q.t>EPS);
  }
  function components(corridors) {
    const pending=new Set(corridors.map((_,i)=>i)); let count=0;
    while(pending.size){count++;const queue=[pending.values().next().value];pending.delete(queue[0]);
      while(queue.length){const a=rect(corridors[queue.pop()].bounds);for(const i of pending){const b=rect(corridors[i].bounds);const x=Math.min(a.r,b.r)-Math.max(a.l,b.l),z=Math.min(a.b,b.b)-Math.max(a.t,b.t);if(x>=-EPS&&z>=-EPS&&(x>EPS||z>EPS)){pending.delete(i);queue.push(i);}}}
    }return count;
  }
  function rawCorridors(buildingId, floorTarget, wardLayout) {
    if (!wardLayout || !wardLayout.rooms || wardLayout.rooms.length === 0) {
      return wardLayout ? (wardLayout.corridors || []) : [];
    }

    if (wardLayout.sourceTraceCorridors && !wardLayout.sourceTracePartialCorridors) return wardLayout.sourceTraceCorridors;
    if (buildingId !== 'E01_MAIN') {
      return wardLayout.corridors || [];
    }

    const rooms = wardLayout.rooms;
    const corridors = [];

    // 依 Z 軸空間判斷本樓層實際存在之病房區塊 (Wing A, B, C, D)
    const roomsA = rooms.filter(r => r.bounds && r.bounds.z < -37.0);
    const roomsB = rooms.filter(r => r.bounds && r.bounds.z >= -37.0 && r.bounds.z < -5.0);
    const roomsC = rooms.filter(r => r.bounds && r.bounds.z >= -5.0 && r.bounds.z < 25.0);
    const roomsD = rooms.filter(r => r.bounds && r.bounds.z >= 25.0);

    // A 區病房走廊 (僅當本樓層實際存在 A 區病房時才繪製，如 7F、6F、9F 等；8F、15F 等無 A 區絕不產生幽靈走廊)
    if (roomsA.length > 0) {
      corridors.push({
        id: 'CORR-WING-A-MAIN',
        name: 'A區病房主走廊',
        bounds: { x: 0.0, y: 0, z: -49.6, width: 48.0, depth: 2.0, height: 1.2 }
      });
    }

    // B 區病房走廊 (如 8B、7B、6B、9B、15B 等)
    if (roomsB.length > 0) {
      // 主走道：位於北排與南排病房間距 (z = -19.6, depth = 3.6)，完全不穿透任何病房！
      corridors.push({
        id: 'CORR-WING-B-MAIN',
        name: 'B區病房主走廊',
        bounds: { x: 1.0, y: 0, z: -19.6, width: 60.0, depth: 3.6, height: 1.2 }
      });
      // 03、05 病室專屬連通通道 (確保 03、05 等病室前方走廊完整連通，絕不落單)
      corridors.push({
        id: 'CORR-WING-B-NOOK',
        name: 'B區病室連通走道',
        bounds: { x: -23.4, y: 0, z: -23.5, width: 6.8, depth: 4.0, height: 1.2 }
      });
      // B 區護理站通道
      corridors.push({
        id: 'CORR-WING-B-NS',
        name: 'B區護理站連通道',
        bounds: { x: -5.92, y: 0, z: -22.4, width: 3.6, depth: 2.0, height: 1.2 }
      });
    }

    // C 區病房走廊 (如 8C、7C、9C、12C、13C、14C、15C 等)
    if (roomsC.length > 0) {
      corridors.push({
        id: 'CORR-WING-C-MAIN',
        name: 'C區病房主走廊',
        bounds: { x: 6.0, y: 0, z: 9.8, width: 58.0, depth: 1.15, height: 1.2 }
      });
      corridors.push({
        id: 'CORR-WING-C-NS',
        name: 'C區護理站連通道',
        bounds: { x: 1.68, y: 0, z: 11.0, width: 3.2, depth: 1.2, height: 1.2 }
      });
    }

    // D 區病房走廊 (如 8D、7D、9D、12D、13D、14D 等)
    if (roomsD.length > 0) {
      corridors.push({
        id: 'CORR-WING-D-MAIN',
        name: 'D區病房主走廊',
        bounds: { x: 4.5, y: 0, z: 42.8, width: 55.0, depth: 3.2, height: 1.2 }
      });
      corridors.push({
        id: 'CORR-WING-D-NS',
        name: 'D區護理站連通道',
        bounds: { x: 1.68, y: 0, z: 39.5, width: 3.2, depth: 3.0, height: 1.2 }
      });
    }

    // 核心主動線連通道：僅在實際存在的病房區塊之間連通，絕不延伸穿透至病室內！
    if (roomsA.length > 0 && roomsB.length > 0) {
      corridors.push({
        id: 'CORR-SPINE-AB',
        name: 'AB區連通道',
        bounds: { x: -4.0, y: 0, z: -35.5, width: 3.2, depth: 28.2, height: 1.2 }
      });
    }
    if (roomsC.length > 0 && roomsD.length > 0) {
      corridors.push({
        id: 'CORR-SPINE-CD',
        name: 'CD區連通道',
        bounds: { x: 1.68, y: 0, z: 26.0, width: 3.2, depth: 30.0, height: 1.2 }
      });
    }

    if (buildingId === 'E01_MAIN' && floorTarget === '11F' && window.WARD_11C_CORRIDORS && !wardLayout.sourceTraceWards?.['11C']) {
      return corridors.filter(c => !['CORR-WING-C-MAIN', 'CORR-WING-C-NS'].includes(c.id)).concat(window.WARD_11C_CORRIDORS);
    }
    if (wardLayout.sourceTracePartialCorridors) {
      const groups=wardLayout.sourceTraceReplaceCorridorGroups||['C'];
      // Source core paths replace the template's central spines as well as
      // its wing aisles. Retaining both put desks inside a phantom walkway.
      return corridors.filter(c=>!groups.some(group=>c.id.startsWith('CORR-WING-'+group+'-'))
        && !(c.id==='CORR-SPINE-AB'&&groups.includes('A')&&groups.includes('B'))
        && !(c.id==='CORR-SPINE-CD'&&groups.includes('C')&&groups.includes('D')))
        .concat(wardLayout.sourceTraceCorridors);
    }
    if (wardLayout.sourceTraceCorridors) return wardLayout.sourceTraceCorridors;
    return corridors;
  
  }
  // Source scans use independent pixel scales. Keep their proportions but fit
  // the complete floor to the campus model, rather than enlarging the building.
  function unionLoops(boxes){
    const xs=[...new Set(boxes.flatMap(b=>[b.x-b.width/2,b.x+b.width/2]))].sort((a,b)=>a-b);
    const zs=[...new Set(boxes.flatMap(b=>[b.z-b.depth/2,b.z+b.depth/2]))].sort((a,b)=>a-b);
    const inside=(i,j)=>i>=0&&j>=0&&i<xs.length-1&&j<zs.length-1&&boxes.some(b=>Math.abs((xs[i]+xs[i+1])/2-b.x)<b.width/2+1e-8&&Math.abs((zs[j]+zs[j+1])/2-b.z)<b.depth/2+1e-8);
    const edges=[];for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++)if(inside(i,j)){
      if(!inside(i,j-1))edges.push([[i,j],[i+1,j]]);if(!inside(i+1,j))edges.push([[i+1,j],[i+1,j+1]]);
      if(!inside(i,j+1))edges.push([[i+1,j+1],[i,j+1]]);if(!inside(i-1,j))edges.push([[i,j+1],[i,j]]);
    }
    const loops=[];while(edges.length){const edge=edges.pop(),start=edge[0],loop=[start,edge[1]];let end=edge[1];
      while(end[0]!==start[0]||end[1]!==start[1]){const index=edges.findIndex(e=>e[0][0]===end[0]&&e[0][1]===end[1]);if(index<0)break;end=edges.splice(index,1)[0][1];loop.push(end);}
      loops.push(loop.map(([i,j])=>({x:xs[i],z:zs[j]})));
    }return loops;
  }
  function fitToBuildings(root, buildings=window.CAMPUS_DATA?.buildings||[]) {
    const report=[];
    for(const building of buildings)for(const [floor,layout] of Object.entries(root[building.id]||{})){
      if(layout.buildingFit){report.push(layout.buildingFit);continue;}
      if(!(layout.rooms||[]).length)continue;
      // A source-traced ward can explicitly ignore an unused legacy corridor
      // when its source geometry already replaces that template corridor.
      const keys=['rooms','facilities','nursingStations','beds','sourceTraceCorridors','protectedCorridors','displayCorridors'];
      // prepare() supplies the corridors that are actually rendered. Legacy
      // template aisles can have a different origin (04E1: x=56.95), and must
      // not shrink or displace a source-traced ward that replaced them.
      if(!Array.isArray(layout.displayCorridors)&&!layout.ignoreLegacyCorridorsForFit)keys.push('corridors');
      const objects=keys.flatMap(key=>layout[key]||[]);
      const points=[...new Set(objects.flatMap(item=>[item.bounds||item,...(item.parts||[]),...(item.bedBounds?[item.bedBounds]:[]),...(item.annexBounds||[]),...(item.outline||[])]))].filter(q=>['x','z','width','depth'].every(k=>Number.isFinite(q[k])));
      if(!points.length)continue;
      const minX=Math.min(...points.map(q=>q.x-q.width/2)),maxX=Math.max(...points.map(q=>q.x+q.width/2));
      const minZ=Math.min(...points.map(q=>q.z-q.depth/2)),maxZ=Math.max(...points.map(q=>q.z+q.depth/2));
      const width=maxX-minX,depth=maxZ-minZ,margin=1.5;
      const scale=Math.min(1,(building.dimensions.width-2*margin)/width,(building.dimensions.depth-2*margin)/depth);
      const centerX=(minX+maxX)/2,centerZ=(minZ+maxZ)/2;
      for(const q of points){q.x=(q.x-centerX)*scale;q.z=(q.z-centerZ)*scale;q.width*=scale;q.depth*=scale;}
      const row={building:building.id,floor,scale,centerX,centerZ,original:{minX,maxX,minZ,maxZ,width,depth},footprint:{...building.dimensions},margin};
      layout.buildingFit=row;report.push(row);
    }
    window.WARD_BUILDING_FIT_AUDIT=report;
    return report;
  }
  function prepare(root, rawCorridors) {
    const report=[];
    for(const [building,floors] of Object.entries(root)) for(const [floor,layout] of Object.entries(floors)) {
      if(layout.geometryAudit){report.push(layout.geometryAudit);continue;}
      const rooms=(layout.rooms||[]).filter(r=>r.bounds);
      if(!rooms.length) continue;
      const facilities=(layout.facilities||[]).filter(r=>r.bounds);
      const stations=layout.nursingStations||[];
      let corridors=rawCorridors(building,floor,layout).map(c=>({...c,bounds:{...c.bounds}}));
      const row={building,floor,rooms:rooms.length,stations:stations.length,stationRoomBefore:0,stationCorridorBefore:0,corridorRoomBefore:0,movedStations:[],unplacedStations:[],corridorsRebased:false};
      for(const n of stations){row.stationRoomBefore+=rooms.filter(r=>hit(rect(n.bounds),rect(r.bounds))).length;row.stationCorridorBefore+=corridors.filter(c=>hit(rect(n.bounds),rect(c.bounds))).length;}
      for(const c of corridors) row.corridorRoomBefore+=rooms.filter(r=>hit(rect(c.bounds),rect(r.bounds))).length;
      // Imported west-wing corridors use a different origin from their rooms.
      // Locate the same horizontal aisle in the actual gap between the two rows.
      if(/^W/.test(building)&&!layout.sourceTraceCorridors){
        const xs=rooms.map(r=>rect(r.bounds));const l=Math.min(...xs.map(r=>r.l)),r=Math.max(...xs.map(r=>r.r));
        const spans=xs.map(r=>[r.t,r.b]).sort((a,b)=>a[0]-b[0]);let edge=spans[0][1],gap=null;
        for(const [lo,hi] of spans.slice(1)){if(lo-edge>1&&(!gap||lo-edge>gap[1]-gap[0]))gap=[edge,lo];edge=Math.max(edge,hi);}
        if(gap){corridors=[{id:'DISPLAY-'+building+'-'+floor,name:'病房走道',isSchematic:true,bounds:{x:(l+r)/2,z:(gap[0]+gap[1])/2,width:r-l,depth:gap[1]-gap[0],height:0.05,y:0}}];row.corridorsRebased=true;}
      }
      row.corridorComponentsBefore=components(corridors);
      // These circulation areas were explicitly confirmed clear by the user.
      // Include them as obstacles before choosing any display station position.
      corridors.push(...(layout.protectedCorridors||[]).map(c=>({...c,bounds:{...c.bounds}})));
      const roomRects=rooms.concat(facilities).map(r=>rect(r.bounds));
      const placed=[];
      for(const ns of stations){
        const old={...ns.bounds}, q=rect(old);
        const ward=ns.ward||(rooms.find(r=>String(ns.name||'').includes(r.ward))||{}).ward;
        const own=rooms.filter(r=>!ward||r.ward===ward);
        const ownRects=(own.length?own:rooms).map(r=>rect(r.bounds));
        const extent={l:Math.min(...ownRects.map(r=>r.l)),r:Math.max(...ownRects.map(r=>r.r)),t:Math.min(...ownRects.map(r=>r.t)),b:Math.max(...ownRects.map(r=>r.b))};
        const crosses=corridors.some(c=>{const a=rect(c.bounds);return hit(a,q)&&((a.l<q.l-EPS&&a.r>q.r+EPS)||(a.t<q.t-EPS&&a.b>q.b+EPS));});
        const remote=q.r<extent.l-5||q.l>extent.r+5||q.b<extent.t-5||q.t>extent.b+5;
        const touchesCorridor=corridors.some(c=>hit(rect(c.bounds),q));
        const invalid=!ns.sourceTrace && (roomRects.some(r=>hit(q,r))||placed.some(r=>hit(q,r))||touchesCorridor||remote||(ns.isSchematic&&!ns.fixedDisplayBay));
        if(!invalid){placed.push(q);continue;}
        const obstacles=roomRects.concat(placed,corridors.map(c=>rect(c.bounds)));
        const candidates=[];
        for(const c of corridors){
          const a=rect(c.bounds);
          const xValues=[old.x,(extent.l+extent.r)/2,a.l+old.width/2,a.r-old.width/2,...ownRects.flatMap(r=>[r.l-old.width/2,r.r+old.width/2])];
          const zValues=[old.z,(extent.t+extent.b)/2,a.t+old.depth/2,a.b-old.depth/2,...ownRects.flatMap(r=>[r.t-old.depth/2,r.b+old.depth/2])];
          for(const x of xValues) if(x+old.width/2>a.l+EPS&&x-old.width/2<a.r-EPS) for(const z of [a.t-old.depth/2,a.b+old.depth/2]) candidates.push({x,z});
          for(const z of zValues) if(z+old.depth/2>a.t+EPS&&z-old.depth/2<a.b-EPS) for(const x of [a.l-old.width/2,a.r+old.width/2]) candidates.push({x,z});
        }
        const valid=candidates.map(p=>({...old,...p})).filter(p=>!obstacles.some(o=>hit(rect(p),o)));
        valid.sort((a,b)=>Math.hypot(a.x-(extent.l+extent.r)/2,a.z-(extent.t+extent.b)/2)-Math.hypot(b.x-(extent.l+extent.r)/2,b.z-(extent.t+extent.b)/2));
        if(valid.length){ns.sourceBounds=ns.sourceBounds||old;ns.bounds=valid[0];ns.isSchematic=true;ns.geometryRelocated=true;row.movedStations.push({name:ns.name,from:old,to:{...ns.bounds}});placed.push(rect(ns.bounds));}
        else {row.unplacedStations.push(ns.name);placed.push(q);}
      }
      // Audit the complete walkway before any surface clipping. A station
      // must not pass merely because its footprint was cut out of a walkway.
      row.stationRawCorridorAfter=stations.reduce((n,s)=>n+corridors.filter(c=>hit(rect(c.bounds),rect(s.bounds))).length,0);
      row.sourceStationCorridorConflicts=stations.filter(s=>s.sourceTrace&&corridors.some(c=>hit(rect(c.bounds),rect(s.bounds)))).map(s=>s.name);
      const blockers=roomRects;
      const safe=[];
      for(const c of corridors){
        // Never cut a main circulation spine around a room/desk and thereby
        // conceal an invalid placement. Keep it whole for collision checks.
        if(c.mainSpine){safe.push(c);continue;}
        let pieces=[rect(c.bounds)];for(const b of blockers)pieces=pieces.flatMap(p=>subtract(p,b));pieces.forEach((p,i)=>safe.push({...c,id:(c.id||c.name)+'-safe-'+i,bounds:{...c.bounds,...bounds(p)}}));
      }
      layout.displayCorridors=safe;
      row.corridorComponents=components(safe);
      row.corridorRoomAfter=safe.reduce((n,c)=>n+rooms.filter(r=>hit(rect(c.bounds),rect(r.bounds))).length,0);
      row.stationRoomAfter=stations.reduce((n,s)=>n+rooms.filter(r=>hit(rect(s.bounds),rect(r.bounds))).length,0);
      row.stationCorridorAfter=stations.reduce((n,s)=>n+safe.filter(c=>hit(rect(s.bounds),rect(c.bounds))).length,0);
      row.needsSourceReview=row.movedStations.length>0||row.corridorsRebased||row.corridorComponents>1||row.corridorRoomBefore>0||row.unplacedStations.length>0;
      layout.geometryAudit=row;
      report.push(row);
    }
    window.WARD_GEOMETRY_AUDIT=report;
    fitToBuildings(root);
    window.WardRoomDoors?.prepare(root);
    return report;
  }
  window.WardPlanGeometry={prepare,fitToBuildings,unionLoops,rawCorridors,rect,hit,subtract,components};
})();
