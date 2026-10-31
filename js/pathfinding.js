// js/pathfinding.js - 步行路網拓撲圖與 A* 最短路線規劃引擎 (以景福門/仁愛路/凱道為南端基準)
class CampusPathfinding {
  constructor() {
    const childPosition=window.CAMPUS_DATA?.buildings?.find(b=>b.id==='CHILD_HOSPITAL')?.position||{x:-4,z:-56};
    this.walkingSpeed = 1.3; // 步行速度：每秒 1.3 公尺
    
    // 院區道路與廊道路網節點
    this.nodes = {
      // 景福門與南端幹道 (凱達格蘭大道 / 仁愛路一段)
      'N_JINGFU_GATE': { id: 'N_JINGFU_GATE', name: '景福門圓環 (凱道/仁愛路口)', x: 13.7, z: 138.9 },
      'N_KAIDA': { id: 'N_KAIDA', name: '凱達格蘭大道 (往總統府/二二八)', x: -50.0, z: 138.9 },
      'N_RENAI': { id: 'N_RENAI', name: '仁愛路一段 (往醫學院/林森南路)', x: 75.0, z: 138.9 },

      // 常德街幹道
      'N_CHANGDE_W': { id: 'N_CHANGDE_W', name: '常德街西側 (公園路口)', x: -45.0, z: 82.0 },
      'N_CHANGDE_MID': { id: 'N_CHANGDE_MID', name: '常德街正門 (西址大廳前)', x: -8.9, z: 82.0 },
      'N_CHANGDE_E': { id: 'N_CHANGDE_E', name: '常德街東側 (中山南路口)', x: 13.7, z: 82.0 },
      
      // 中山南路幹道 (南北主動脈)
      'N_ZHONGSHAN_S': { id: 'N_ZHONGSHAN_S', name: '中山南路南段 (景福門旁)', x: 13.7, z: 115.0 },
      'N_ZHONGSHAN_MID': { id: 'N_ZHONGSHAN_MID', name: '中山南路中央 (常德街/東址前)', x: 13.7, z: 82.0 },
      'N_ZHONGSHAN_N': { id: 'N_ZHONGSHAN_N', name: '中山南路北段 (青島西路口/兒醫前)', x: 13.7, z: -56.0 },

      // 青島西路幹道與兒醫大樓
      'N_QINGDAO_W': { id: 'N_QINGDAO_W', name: '青島西路西側 (健保門診前)', x: -26.0, z: -56.0 },
      'N_CHILD_MAIN': { id: 'N_CHILD_MAIN', name: '兒童醫療大樓 (正門大廳)', x: childPosition.x, z: childPosition.z },
      
      // 西址中央紅磚主長廊 (南北中軸)
      'N_SPINE_LOBBY': { id: 'N_SPINE_LOBBY', name: '西址中央大廳內部玄關', x: -8.9, z: 55.0 },
      'N_SPINE_1': { id: 'N_SPINE_1', name: '中央長廊 (一二棟交會)', x: -8.9, z: 48.0 },
      'N_SPINE_2': { id: 'N_SPINE_2', name: '中央長廊 (三棟交會)', x: -8.9, z: 32.0 },
      'N_SPINE_3': { id: 'N_SPINE_3', name: '中央長廊 (四棟交會)', x: -8.9, z: 16.0 },
      'N_SPINE_4': { id: 'N_SPINE_4', name: '中央長廊 (五棟交會)', x: -8.9, z: -2.0 },
      
      // 西址各棟病房出入口
      'N_W01_W': { id: 'N_W01_W', name: '西一棟', x: -31.0, z: 48.0 },
      'N_W01_E': { id: 'N_W01_E', name: '東一棟', x: 8.0, z: 48.0 },
      'N_W02_W': { id: 'N_W02_W', name: '西三棟 (03W2)', x: -31.0, z: 32.0 },
      'N_W02_E': { id: 'N_W02_E', name: '東三棟 (03E2)', x: 8.0, z: 32.0 },
      'N_W03_W': { id: 'N_W03_W', name: '西四棟 (4W1/4W2)', x: -31.0, z: 16.0 },
      'N_W03_E': { id: 'N_W03_E', name: '東四棟 (4E1/4E2)', x: 8.0, z: 16.0 },
      'N_W04_W': { id: 'N_W04_W', name: '西五棟 (5W2)', x: -31.0, z: -2.0 },
      'N_W04_E': { id: 'N_W04_E', name: '東五棟 (5E3)', x: 8.0, z: -2.0 },
      'N_W08': { id: 'N_W08', name: '大樓出入口', x: -2.0, z: -24.0 },
      
      // 景福地下通道
      'N_TUNNEL_W': { id: 'N_TUNNEL_W', name: '景福連通道 (西址入口)', x: 14.0, z: 58.8 },
      'N_TUNNEL_E': { id: 'N_TUNNEL_E', name: '景福連通道 (東址出口)', x: 52.0, z: 58.8 },
      
      // 東址大樓與廣場
      'N_EAST_PLAZA': { id: 'N_EAST_PLAZA', name: '東址正門迎賓車道廣場', x: 60.0, z: 70.8 },
      'N_EAST_LOBBY': { id: 'N_EAST_LOBBY', name: '東址 1F 中央大廳/服務台', x: 83.7, z: 70.8 },
      'N_EAST_A': { id: 'N_EAST_A', name: '東址 A區病房走道 (7A/12A)', x: 96.0, z: 82.0 },
      'N_EAST_D': { id: 'N_EAST_D', name: '東址 D區病房走道 (7D/12D)', x: 72.0, z: 58.0 }
    };

    // 雙向路網邊線 (Edges)
    this.edges = [
      // 景福門至凱道、仁愛路與中山南路
      ['N_JINGFU_GATE', 'N_KAIDA'],
      ['N_JINGFU_GATE', 'N_RENAI'],
      ['N_JINGFU_GATE', 'N_ZHONGSHAN_S'],

      // 中山南路主線
      ['N_ZHONGSHAN_S', 'N_ZHONGSHAN_MID'],
      ['N_ZHONGSHAN_MID', 'N_ZHONGSHAN_N'],
      ['N_ZHONGSHAN_N', 'N_CHILD_MAIN'],
      ['N_CHILD_MAIN', 'N_QINGDAO_W'],

      // 常德街幹道
      ['N_CHANGDE_W', 'N_CHANGDE_MID'],
      ['N_CHANGDE_MID', 'N_CHANGDE_E'],
      ['N_CHANGDE_E', 'N_ZHONGSHAN_MID'],
      ['N_CHANGDE_MID', 'N_SPINE_LOBBY'],

      // 西址中央紅磚主長廊
      ['N_SPINE_LOBBY', 'N_SPINE_1'],
      ['N_SPINE_1', 'N_SPINE_2'],
      ['N_SPINE_2', 'N_SPINE_3'],
      ['N_SPINE_3', 'N_SPINE_4'],
      
      // 西址各棟支線
      ['N_SPINE_1', 'N_W01_W'],
      ['N_SPINE_1', 'N_W01_E'],
      ['N_SPINE_2', 'N_W02_W'],
      ['N_SPINE_2', 'N_W02_E'],
      ['N_SPINE_3', 'N_W03_W'],
      ['N_SPINE_3', 'N_W03_E'],
      ['N_SPINE_4', 'N_W04_W'],
      ['N_SPINE_4', 'N_W04_E'],
      ['N_SPINE_4', 'N_W08'],
      
      // 景福地下通道
      ['N_SPINE_LOBBY', 'N_TUNNEL_W'],
      ['N_TUNNEL_W', 'N_TUNNEL_E'],
      ['N_TUNNEL_E', 'N_EAST_PLAZA'],
      ['N_ZHONGSHAN_MID', 'N_EAST_PLAZA'],
      
      // 東址大樓內部
      ['N_EAST_PLAZA', 'N_EAST_LOBBY'],
      ['N_EAST_LOBBY', 'N_EAST_A'],
      ['N_EAST_LOBBY', 'N_EAST_D']
    ];

    this.adjList = {};
    this.buildGraph();
  }

  buildGraph() {
    Object.keys(this.nodes).forEach(id => {
      this.adjList[id] = [];
    });

    this.edges.forEach(([u, v]) => {
      if (this.nodes[u] && this.nodes[v]) {
        const dist = this.euclideanDistance(this.nodes[u], this.nodes[v]);
        this.adjList[u].push({ node: v, weight: dist });
        this.adjList[v].push({ node: u, weight: dist });
      }
    });
  }

  euclideanDistance(a, b) {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  findShortestPath(startId, goalId) {
    if (!this.nodes[startId] || !this.nodes[goalId]) return null;

    const openSet = new Set([startId]);
    const cameFrom = {};

    const gScore = {};
    const fScore = {};
    Object.keys(this.nodes).forEach(id => {
      gScore[id] = Infinity;
      fScore[id] = Infinity;
    });

    gScore[startId] = 0;
    fScore[startId] = this.euclideanDistance(this.nodes[startId], this.nodes[goalId]);

    while (openSet.size > 0) {
      let current = null;
      let lowestF = Infinity;
      openSet.forEach(nodeId => {
        if (fScore[nodeId] < lowestF) {
          lowestF = fScore[nodeId];
          current = nodeId;
        }
      });

      if (current === goalId) {
        return this.reconstructPath(cameFrom, current, gScore[goalId]);
      }

      openSet.delete(current);

      const neighbors = this.adjList[current] || [];
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        const tentativeG = gScore[current] + neighbor.weight;

        if (tentativeG < gScore[neighbor.node]) {
          cameFrom[neighbor.node] = current;
          gScore[neighbor.node] = tentativeG;
          fScore[neighbor.node] = tentativeG + this.euclideanDistance(this.nodes[neighbor.node], this.nodes[goalId]);
          openSet.add(neighbor.node);
        }
      }
    }

    return null;
  }

  reconstructPath(cameFrom, current, totalDist) {
    const totalPath = [current];
    while (cameFrom[current]) {
      current = cameFrom[current];
      totalPath.unshift(current);
    }

    const pathNodes = totalPath.map(id => this.nodes[id]);
    const walkSeconds = Math.round(totalDist / this.walkingSpeed);
    const walkMinutes = (walkSeconds / 60).toFixed(1);

    const instructions = [];
    for (let i = 0; i < pathNodes.length - 1; i++) {
      const from = pathNodes[i];
      const to = pathNodes[i + 1];
      const dist = Math.round(this.euclideanDistance(from, to));
      instructions.push(`從「${from.name}」前往「${to.name}」(${dist} 公尺)`);
    }

    const directions = [];
    for (let i = 0; i < pathNodes.length - 1; i++) {
      directions.push({
        from: pathNodes[i].name,
        to: pathNodes[i + 1].name,
        dist: Math.round(this.euclideanDistance(pathNodes[i], pathNodes[i + 1]))
      });
    }

    return {
      nodeIds: totalPath,
      pathNodes: pathNodes,
      totalDistance: Math.round(totalDist),
      totalDistanceMeters: Math.round(totalDist),
      walkingSeconds: walkSeconds,
      walkingMinutes: walkMinutes,
      instructions: instructions,
      directions: directions
    };
  }
}

window.campusPathfinding = new CampusPathfinding();
