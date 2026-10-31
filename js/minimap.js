// js/minimap.js - 2D 即時校園小地圖 (奶茶色系即時視角扇形、點擊傳送移動)

class CampusMinimap {

  constructor(canvasElement, campusData, onTeleportCallback) {

    this.canvas = canvasElement;

    this.ctx = canvasElement.getContext('2d');

    this.campusData = campusData;

    this.onTeleport = onTeleportCallback;

    

    // 座標映射參數 (場景範圍對應 380m x 333.3m，北上南下，景福門/仁愛路/凱道在南端)

    this.worldBounds = {

      minX: -190, maxX: 190,

      minZ: -166.7, maxZ: 166.7

    };

    

    this.initEvents();

  }

  initEvents() {

    this.canvas.addEventListener('click', (e) => {

      const rect = this.canvas.getBoundingClientRect();

      const clickX = e.clientX - rect.left;

      const clickY = e.clientY - rect.top;

      

      const worldPos = this.mapToWorld(clickX, clickY);

      if (this.onTeleport) {

        this.onTeleport(worldPos.x, worldPos.z);

      }

    });

  }

  worldToMap(wx, wz) {

    const normX = (wx - this.worldBounds.minX) / (this.worldBounds.maxX - this.worldBounds.minX);

    const normZ = (wz - this.worldBounds.minZ) / (this.worldBounds.maxZ - this.worldBounds.minZ);

    return {

      x: normX * this.canvas.width,

      y: normZ * this.canvas.height

    };

  }

  mapToWorld(mx, my) {

    const normX = mx / this.canvas.width;

    const normZ = my / this.canvas.height;

    return {

      x: this.worldBounds.minX + normX * (this.worldBounds.maxX - this.worldBounds.minX),

      z: this.worldBounds.minZ + normZ * (this.worldBounds.maxZ - this.worldBounds.minZ)

    };

  }

  render(playerPos, playerYaw, pathNodes = null) {

    const w = this.canvas.width;

    const h = this.canvas.height;

    const ctx = this.ctx;

    // 清空背景 (溫暖米茶色底)

    ctx.fillStyle = '#d5e5d3'; // 全區柔和淡草地底色，杜絕留白虛無感

    ctx.fillRect(0, 0, w, h);

        // 繪製幹道 (中山南路、凱達格蘭大道、仁愛路、常德街、青島西路)
    // 0. 二二八公園綠地 (西側柔和淡雅鼠尾草綠)
    const pk1 = this.worldToMap(-188, -65);
    const pk2 = this.worldToMap(-54, 125);
    ctx.fillStyle = 'rgba(110, 142, 103, 0.25)';
    ctx.fillRect(pk1.x, pk1.y, pk2.x - pk1.x, pk2.y - pk1.y);


    ctx.fillStyle = '#ded6ca';

    // 1. 中山南路 (南北幹道)

    const zs1 = this.worldToMap(2, -165);

    const zs2 = this.worldToMap(24, 165);

    ctx.fillRect(zs1.x, zs1.y, zs2.x - zs1.x, zs2.y - zs1.y);

    // 2. 凱達格蘭大道與仁愛路一段 (南端橫向幹道，景福門圓環處)

    const rEast1 = this.worldToMap(-190, 132);

    const rEast2 = this.worldToMap(190, 146);

    ctx.fillRect(rEast1.x, rEast1.y, rEast2.x - rEast1.x, rEast2.y - rEast1.y);

    // 3. 常德街 (西址門前橫向街道)

    const cd1 = this.worldToMap(-60, 54);

    const cd2 = this.worldToMap(20, 64);

    ctx.fillRect(cd1.x, cd1.y, cd2.x - cd1.x, cd2.y - cd1.y);

    // 4. 青島西路 (兒醫門前橫向街道)

    const qd1 = this.worldToMap(-50, -62);

    const qd2 = this.worldToMap(24, -50);

    ctx.fillRect(qd1.x, qd1.y, qd2.x - qd1.x, qd2.y - qd1.y);

    // 繪製建物輪廓

    if (this.campusData && this.campusData.buildings) {

      this.campusData.buildings.forEach(b => {

        const p = b.position;

        const d = b.dimensions;

        const p1 = this.worldToMap(p.x - d.width / 2, p.z - d.depth / 2);

        const p2 = this.worldToMap(p.x + d.width / 2, p.z + d.depth / 2);

        // 東址四棟暖黃色二丁掛病房大樓 (A/B/C/D棟) 與頂樓停機坪 [H]

        if (b.id === 'E01_MAIN') {

          const px = p.x;

          const pz = p.z;

          

          // 1. 中央貫穿南北的電梯梯廳與垂直管線軸心
          const sp1 = this.worldToMap(px, pz - 35);
          const sp2 = this.worldToMap(px + 14, pz + 35);
          ctx.fillStyle = '#8f654f';
          ctx.fillRect(sp1.x, sp1.y, sp2.x - sp1.x, sp2.y - sp1.y);

          // 2. 中央挑高 15 層黑玻璃帷幕中庭 (B棟與C棟之間)
          const at1 = this.worldToMap(px - 22, pz - 5.5);
          const at2 = this.worldToMap(px + 14, pz + 5.5);
          ctx.fillStyle = 'rgba(20, 22, 26, 0.9)';
          ctx.strokeStyle = '#3a424f';
          ctx.lineWidth = 1;
          ctx.fillRect(at1.x, at1.y, at2.x - at1.x, at2.y - at1.y);
          ctx.strokeRect(at1.x, at1.y, at2.x - at1.x, at2.y - at1.y);

          // 3. 東址四棟暖黃色獨立大樓 (A/B/C/D棟：由北向南平行排列，東西向延伸)
          const towers = [
            { id: 'A', ox: -1.0, oz: -28.5, w: 48.0, d: 12.0 },
            { id: 'B', ox: -2.4, oz: -11.5, w: 50.8, d: 12.0 },
            { id: 'C', ox: -2.4, oz: 11.5, w: 50.8, d: 12.0 },
            { id: 'D', ox: -1.0, oz: 28.5, w: 48.0, d: 12.0 }
          ];

          towers.forEach(tw => {
            const tx = px + tw.ox;
            const tz = pz + tw.oz;
            const tp1 = this.worldToMap(tx - tw.w / 2, tz - tw.d / 2);
            const tp2 = this.worldToMap(tx + tw.w / 2, tz + tw.d / 2);
            const twPx = tp2.x - tp1.x;
            const thPx = tp2.y - tp1.y;

            // 暖黃色二丁掛磁磚主色
            ctx.fillStyle = '#c89872';
            ctx.strokeStyle = '#a47452';
            ctx.lineWidth = 1;
            ctx.fillRect(tp1.x, tp1.y, twPx, thPx);
            ctx.strokeRect(tp1.x, tp1.y, twPx, thPx);

            // 頂樓階梯退縮層次
            ctx.fillStyle = '#e0cfbe';
            ctx.fillRect(tp1.x + twPx * 0.12, tp1.y + thPx * 0.15, twPx * 0.76, thPx * 0.7);

            // A/B/C/D 棟標示
            ctx.fillStyle = '#543b2a';
            ctx.font = 'bold 7px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(tw.id, (tp1.x + tp2.x) / 2, (tp1.y + tp2.y) / 2);
          });

          // 4. 頂樓直升機停機坪平台 [H]
          const heliW = 18.0;
          const hp1 = this.worldToMap(px + 6.0 - heliW / 2, pz - heliW / 2);
          const hp2 = this.worldToMap(px + 6.0 + heliW / 2, pz + heliW / 2);
          const hw = hp2.x - hp1.x;
          const hh = hp2.y - hp1.y;
          const hx = (hp1.x + hp2.x) / 2;
          const hy = (hp1.y + hp2.y) / 2;

          ctx.fillStyle = '#424953';
          ctx.strokeStyle = '#2b313a';
          ctx.lineWidth = 1;
          ctx.fillRect(hp1.x, hp1.y, hw, hh);
          ctx.strokeRect(hp1.x, hp1.y, hw, hh);

          ctx.beginPath();
          ctx.arc(hx, hy, hw * 0.36, 0, Math.PI * 2);
          ctx.strokeStyle = '#dfaa4e';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('H', hx, hy);

          // 5. 西側迎賓大門雨遮 (三連三角山牆迎賓車道)
          const can1 = this.worldToMap(px - 39, pz - 12);
          const can2 = this.worldToMap(px - 25, pz + 12);
          ctx.fillStyle = 'rgba(102, 105, 112, 0.85)';
          ctx.fillRect(can1.x, can1.y, can2.x - can1.x, can2.y - can1.y);

          return;

        }

        if (b.campus === 'east') {

          ctx.fillStyle = 'rgba(74, 122, 150, 0.65)';

          ctx.strokeStyle = '#36647e';

        } else if (b.campus === 'children') {

          ctx.fillStyle = 'rgba(220, 140, 92, 0.75)';

          ctx.strokeStyle = '#b85d3b';

        } else {

          ctx.fillStyle = 'rgba(148, 61, 44, 0.75)';

          ctx.strokeStyle = '#753428';

        }

        ctx.lineWidth = 1;

        ctx.fillRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);

        ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);

      });

    }

    // 繪製 A* 規劃路徑線

    if (pathNodes && pathNodes.length > 1) {

      ctx.beginPath();

      const start = this.worldToMap(pathNodes[0].x, pathNodes[0].z);

      ctx.moveTo(start.x, start.y);

      for (let i = 1; i < pathNodes.length; i++) {

        const pt = this.worldToMap(pathNodes[i].x, pathNodes[i].z);

        ctx.lineTo(pt.x, pt.y);

      }

      ctx.strokeStyle = '#3c7e5a';

      ctx.lineWidth = 3;

      ctx.setLineDash([4, 2]);

      ctx.stroke();

      ctx.setLineDash([]);

    }

    // 繪製玩家目前位置與視角扇形

    if (playerPos) {

      const p = this.worldToMap(playerPos.x, playerPos.z);

      

      // 視角扇形 (FOV Frustum)

      ctx.save();

      ctx.translate(p.x, p.y);

      const angle = (playerYaw || 0) - Math.PI / 2;

      ctx.rotate(angle);

      ctx.beginPath();

      ctx.moveTo(0, 0);

      ctx.arc(0, 0, 24, -Math.PI / 4, Math.PI / 4);

      ctx.closePath();

      ctx.fillStyle = 'rgba(184, 122, 85, 0.35)';

      ctx.fill();

      // 玩家圓點

      ctx.beginPath();

      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);

      ctx.fillStyle = '#b87a55';

      ctx.fill();

      ctx.strokeStyle = '#ffffff';

      ctx.lineWidth = 1.5;

      ctx.stroke();

      ctx.restore();

    }

  }

}

window.CampusMinimap = CampusMinimap;

