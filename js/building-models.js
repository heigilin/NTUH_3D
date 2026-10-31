// js/building-models.js - 臺大醫院標誌性建築 3D 造型建構器 (真實照片還原)

// 包含：

// 1. 兒醫大樓 (中山南路東向正面鮮黃倒V型鋼構斜柱、象牙白基座、深灰藍玻璃帷幕、積木紅凸窗、頂樓空中花園圓柱)

// 2. 東址大樓 (達欣工程象牙米白磁磚面磚、深墨青水平連續窗帶、H型階梯退縮雙翼、屋頂直升機停機坪 [H]、1F迎賓雨遮)

// 3. 西址古蹟群 (常德街巴洛克綠銅圓頂大廳、辰野式紅磚白橫帶、希臘山牆古典愛奧尼克白柱、雙坡紅瓦病房長廊)

// 4. 景福門 (硃紅城基拱門、歇山重簷綠琉璃瓦頂)

// 5. 檢驗大樓 (常德街大廳東南方、1F成人第一抽血站與心電圖)

(function(window) {

  'use strict';

  const CampusBuildingModels = {

    build(b, app) {

      const bGroup = new THREE.Group();

      bGroup.userData = { buildingId: b.id, data: b, isBuildingGroup: true };

      if (b.id === 'JINGFU_GATE') {

        this.createJingfuGate(b, bGroup);

      } else if (b.id === 'CHILD_HOSPITAL') {

        // Local +Z facade turns toward world +X (east / Zhongshan South Road).
        // Swap local dimensions so the existing world footprint stays 38 x 34.
        const childModel = new THREE.Group();
        childModel.name = 'children-east-facing-model';
        childModel.position.set(b.position.x, 0, b.position.z);
        childModel.rotation.y = Math.PI / 2;
        this.createChildrenHospital({...b, position:{x:0,z:0}, dimensions:{width:b.dimensions.depth,depth:b.dimensions.width}}, childModel);
        bGroup.add(childModel);

      } else if (b.id === 'E01_MAIN') {

        this.createEastMain(b, bGroup);

      } else if (b.id === 'W01_LOBBY') {

        this.createWestLobby(b, bGroup);

      } else if (b.campus === 'west' && b.id.startsWith('W0')) {

        this.createWestWardWing(b, bGroup);

      } else if (b.id === 'JINGFU_TUNNEL') {
        this.createJingfuTunnel(b, bGroup);
      } else if (b.id === 'W_CORRIDOR' || b.id === 'W01_SPINE') {

        this.createWestCorridor(b, bGroup);

      } else {

        this.createStandardBlock(b, bGroup);

      }

      bGroup.traverse(child => {

        if (child.isMesh) {
          // Share East-campus daylight shadows on West/Children structural
          // masses. Glass and lightweight foliage do not cast opaque blocks.
          let landscape=false,ancestor=child;
          while(ancestor&&ancestor!==bGroup){if(ancestor.userData?.isLandscape){landscape=true;break;}ancestor=ancestor.parent;}
          if((b.campus==='west'||b.id==='CHILD_HOSPITAL')&&!landscape){
            const materials=Array.isArray(child.material)?child.material:[child.material];
            const opaque=materials.every(m=>m&&!m.transparent&&(m.opacity??1)>=1);
            const structural=['BoxGeometry','BufferGeometry','ExtrudeGeometry','CylinderGeometry'].includes(child.geometry?.type);
            child.castShadow=opaque&&(structural||child.castShadow);
            child.receiveShadow=opaque;
          }

          child.userData = { buildingId: b.id, data: b, isBuilding: true };

          if (app && app.interactableObjects) {

            app.interactableObjects.push(child);

          }

        }

      });

      return bGroup;

    },

    // 1. 兒童醫療大樓 (CHILD_HOSPITAL) - 依官方照片與實景

    createChildrenHospital(b, parent) {

      const w = b.dimensions.width;  // 38

      const d = b.dimensions.depth;  // 34

      const totalH = b.height;       // 50.4 (14F)

      const px = b.position.x;

      const pz = b.position.z;

      // 暖磚橘杏色調，對比鮮明絕不與白色背景吃色

      const matPodium = new THREE.MeshStandardMaterial({ color: 0xd6a27e, roughness: 0.55 }); // 活潑暖杏磚橘基座

      const matTower = new THREE.MeshStandardMaterial({ color: 0xe2bd96, roughness: 0.50 });  // 暖磚橘黃外牆主體

      const matGlass = new THREE.MeshStandardMaterial({ color: 0xa4c9d7, roughness: 0.38, metalness: 0.08, emissive: 0x536f80, emissiveIntensity: 0.12 }); // 明亮淡藍玻璃，四面皆可辨識

      const matYellow = new THREE.MeshStandardMaterial({ color: 0xd8b56b, roughness: 0.35, metalness: 0.25 }); // 亮黃標誌性倒V鋼柱

      const matRedBox = new THREE.MeshStandardMaterial({ color: 0xb98177, roughness: 0.40 }); // 積木紅凸窗

      const matOrangeBox = new THREE.MeshStandardMaterial({ color: 0xc59a71, roughness: 0.40 }); // 積木橙凸窗

      const matWhite = new THREE.MeshStandardMaterial({ color: 0xede5d8, roughness: 0.45 }); // 暖白窗台橫帶飾線

      const matGarden = new THREE.MeshStandardMaterial({ color: 0x667f62, roughness: 0.85 }); // 空中花園

      // A. 1F~4F 裙樓基座 (14.4m)

      const podiumH = 14.4;

      const podGeom = new THREE.BoxGeometry(w, podiumH, d);

      const podMesh = new THREE.Mesh(podGeom, matPodium);

      podMesh.position.set(px, podiumH / 2, pz);

      parent.add(podMesh);

      // 基座採光橫窗

      for (let i = 1; i <= 3; i++) {

        const strGeom = new THREE.BoxGeometry(w * 1.006, 0.22, d * 1.006);

        const str = new THREE.Mesh(strGeom, matWhite);

        str.position.set(px, i * 3.6, pz);

        parent.add(str);

      }

      // B. 5F~12F 主塔樓 (28.8m)

      const towerH = 28.8;

      const towerW = w * 0.88;

      const towerD = d * 0.86;

      const towerY = podiumH + towerH / 2;

      const towerZ = pz - 1.5;

      const towerGeom = new THREE.BoxGeometry(towerW, towerH, towerD);

      const towerMesh = new THREE.Mesh(towerGeom, matTower);

      towerMesh.position.set(px, towerY, towerZ);

      parent.add(towerMesh);

      // 正面大型鏡面玻璃帷幕 (面向中山南路東側)

      const frontZ = towerZ + towerD / 2;

      const cwW = towerW * 0.72;

      const cwGeom = new THREE.BoxGeometry(cwW, towerH * 0.95, 0.8);

      const cwMesh = new THREE.Mesh(cwGeom, matGlass);

      cwMesh.position.set(px, towerY, frontZ + 0.4);

      parent.add(cwMesh);

      // 減少每排窗數並加大橫向留白，保留每層與四面採光。
      // 四面開窗：裙樓 1~4F、主塔 5~12F；跟隨整棟朝向旋轉。
      // 窗框與玻璃皆置於實體外牆之外，避免被牆面遮住或產生閃爍。
      const addWindow = (x, y, z, width, side) => {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(width + 0.14, 1.82, 0.16), matWhite);
        const pane = new THREE.Mesh(new THREE.BoxGeometry(width, 1.70, 0.18), matGlass);
        frame.rotation.y = side;
        pane.rotation.y = side;
        frame.position.set(x, y, z);
        pane.position.set(x + Math.sin(side) * 0.09, y, z + Math.cos(side) * 0.09);
        parent.add(frame, pane);
      };
      const addFourSideWindows = (width, depth, centerZ, baseY, floors, isTower) => {
        const columnsX = Math.max(3, Math.floor(width / 7.2));
        const columnsZ = Math.max(3, Math.floor(depth / 7.2));
        for (let floor = 0; floor < floors; floor++) {
          const y = baseY + floor * 3.6 + 1.9;
          for (let col = 0; col < columnsX; col++) {
            const x = px - width / 2 + (col + 0.5) * width / columnsX;
            addWindow(x, y, centerZ + depth / 2 + (isTower ? 0.94 : 0.14), 2.45, 0);
            addWindow(x, y, centerZ - depth / 2 - 0.14, 2.45, Math.PI);
          }
          for (let col = 0; col < columnsZ; col++) {
            const z = centerZ - depth / 2 + (col + 0.5) * depth / columnsZ;
            addWindow(px + width / 2 + 0.14, y, z, 2.45, Math.PI / 2);
            addWindow(px - width / 2 - 0.14, y, z, 2.45, -Math.PI / 2);
          }
        }
      };
      addFourSideWindows(w, d, pz, 0, 4, false);
      addFourSideWindows(towerW, towerD, towerZ, podiumH, 8, true);

      // C. 標誌性鮮黃色巨大倒 V 斜柱門架 (正面中山南路入口最著名地標)

      // 從 1F 向上延伸至 4F 頂部形成壯觀的黃色斜撐倒V門架

      const vH = 15.5;

      const vGeom = new THREE.BoxGeometry(1.6, vH, 1.6);

      const leftV = new THREE.Mesh(vGeom, matYellow);

      leftV.position.set(px - 6.5, vH / 2, pz + d / 2 + 1.2);

      leftV.rotation.z = -0.22;

      parent.add(leftV);

      const rightV = new THREE.Mesh(vGeom, matYellow);

      rightV.position.set(px + 6.5, vH / 2, pz + d / 2 + 1.2);

      rightV.rotation.z = 0.22;

      parent.add(rightV);

      // 入口 1F 弧形玻璃門廊雨遮

      const canopyGeom = new THREE.BoxGeometry(18, 0.8, 6.0);

      const canopy = new THREE.Mesh(canopyGeom, matWhite);

      canopy.position.set(px, 3.8, pz + d / 2 + 3.0);

      parent.add(canopy);

      // D. 立面鮮紅與鮮橙積木凸窗 (Pop-out Toy Blocks)

      const boxCoords = [

        { x: -9.5, y: podiumH + 6.0, color: matRedBox, w: 3.2, h: 3.0 },

        { x: 8.5, y: podiumH + 12.0, color: matOrangeBox, w: 3.0, h: 3.2 },

        { x: -8.0, y: podiumH + 18.0, color: matRedBox, w: 3.2, h: 2.8 },

        { x: 7.0, y: podiumH + 22.0, color: matOrangeBox, w: 2.8, h: 3.0 }

      ];

      boxCoords.forEach(bc => {

        const bGeom = new THREE.BoxGeometry(bc.w, bc.h, 1.8);

        const bMesh = new THREE.Mesh(bGeom, bc.color);

        bMesh.position.set(px + bc.x, bc.y, frontZ + 1.1);

        parent.add(bMesh);

      });

      // E. 頂樓空中花園與白色圓柱景觀格柵 (Sky Garden & Pergola)

      const gardenGeom = new THREE.BoxGeometry(towerW * 0.9, 0.4, towerD * 0.9);

      const gardenMesh = new THREE.Mesh(gardenGeom, matGarden);

      gardenMesh.position.set(px, podiumH + towerH + 0.2, towerZ);

      parent.add(gardenMesh);

      // 4 根純白巨柱

      const colGeom = new THREE.CylinderGeometry(0.8, 0.8, 6.5, 16);

      [

        { x: -towerW * 0.35, z: towerZ - towerD * 0.35 },

        { x: towerW * 0.35, z: towerZ - towerD * 0.35 },

        { x: -towerW * 0.35, z: towerZ + towerD * 0.35 },

        { x: towerW * 0.35, z: towerZ + towerD * 0.35 }

      ].forEach(pos => {

        const cMesh = new THREE.Mesh(colGeom, matWhite);

        cMesh.position.set(px + pos.x, podiumH + towerH + 3.25, pos.z);

        parent.add(cMesh);

      });

      // 頂樓鋼構遮陽屋架 (Pergola Roof)

      const roofGeom = new THREE.BoxGeometry(towerW * 0.82, 0.6, towerD * 0.82);

      const roofMesh = new THREE.Mesh(roofGeom, matWhite);

      roofMesh.position.set(px, podiumH + towerH + 6.5, towerZ);

      parent.add(roofMesh);

    },

    // 輔助函式：建立精準三角山牆斜屋頂模型 (Triangular Gable Prism)

    createGablePrism(lengthX, widthZ, apexH, mat) {

      const hx = lengthX / 2;

      const hz = widthZ / 2;

      const geom = new THREE.BufferGeometry();

      const vertices = new Float32Array([

        // 西向正三角形山牆 (X = -hx, 面向中山南路迎賓大門正面)

        -hx, 0, -hz,    -hx, 0, hz,      -hx, apexH, 0,

        // 東向背三角形 (X = +hx)

        hx, 0, -hz,     hx, apexH, 0,    hx, 0, hz,

        // 南側斜面 (Z > 0)

        -hx, 0, hz,     hx, apexH, 0,    -hx, apexH, 0,

        -hx, 0, hz,     hx, 0, hz,       hx, apexH, 0,

        // 北側斜面 (Z < 0)

        -hx, 0, -hz,    -hx, apexH, 0,   hx, apexH, 0,

        -hx, 0, -hz,    hx, apexH, 0,    hx, 0, -hz,

        // 底面 (Y = 0)

        -hx, 0, -hz,    hx, 0, -hz,      hx, 0, hz,

        -hx, 0, -hz,    hx, 0, hz,       -hx, 0, hz

      ]);

      geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

      geom.computeVertexNormals();

      return new THREE.Mesh(geom, mat);

    },

    // 2. 總院東址大樓 (E01_MAIN) - 依達欣工程與實景照片 (dacin_5.jpg / 官方介紹) 高度擬真建構

    // 特徵包含：

    // 1) 中山南路立面：並排顯著的四座暖黃陶褐二丁掛石磚塔樓 (A棟、B棟、C棟、D棟)

    // 2) 兩兩塔樓之間凹入的橫向深墨青色連續帶狀開窗與暖黃樑帶

    // 3) 中央挑高 15 層樓的深色中庭採光帷幕大廳與南北空中走廊 (Skybridges)

    // 4) 中山南路 1F 正面標誌性迎賓大門門廳：三連經典三角山牆斜頂 (Three Gables) 與花崗石列柱門廊、迎賓車道

    // 5) 向東（校園內部）延伸之病房翼棟與中央機電巡航核心

    // 6) 頂樓 13F~15F 經典階梯式退縮層 (Stepped Setbacks) 與直升機停機坪 [H]

    // 2. 總院東址大樓 (E01_MAIN) - 依官方實景照片 (user_east_reference.jpg / 東址院區.jpg) 與 7F 原始配置圖精確重構

    // 真實結構核心：

    // 由北向南平行排列的四棟雄偉高層黃色大樓 (A棟、B棟、C棟、D棟，橫向貫穿東西)

    // 中間夾著深凹的挑高 15 層黑玻璃帷幕景福中庭 (Central Atrium) 與三連三角山牆迎賓車道大門

    // 2. 總院東址大樓 (E01_MAIN) - 依官方實景照片 (user_east_reference.jpg / 東址院區.jpg) 與 7F 原始配置圖精確重構

    // 真實結構核心：

    // 由北向南平行排列的四棟雄偉高層黃色大樓 (A棟、B棟、C棟、D棟，橫向貫穿東西)

    // 中間夾著深凹的挑高 15 層黑玻璃帷幕景福中庭 (Central Atrium) 與三連三角山牆迎賓車道大門

    // 2. 總院東址大樓 (E01_MAIN) - 依官方實景照片 (user_east_reference.jpg / 東址院區.jpg) 與 7F 原始配置圖精確重構

    // 真實結構核心：

    // 由北向南平行排列的四棟雄偉高層黃色大樓 (A棟、B棟、C棟、D棟，橫向貫穿東西)

    // 中間夾著深凹的挑高 15 層黑玻璃帷幕景福中庭 (Central Atrium) 與三連三角山牆迎賓車道大門

    createEastMain(b, parent) {

      const px = b.position.x; // 83.7

      const pz = b.position.z; // 70.8

      const totalH = b.height; // 54.0m (15F)

      const floorH = 3.6;

      // Visual reference: NTUH official exterior photo, downloaded 2026-10-30.
      // https://www.ntuh.gov.tw/ckfinder_file/ntuhtx/images/東址院區.jpg
      // Match the user-supplied photo: warm beige-gold tile, light stone entrance, neutral grey glass.

      const matOchreTile = new THREE.MeshStandardMaterial({

        color: 0xdfbf8b, // 照片參考：米金黃色面磚

        roughness: 0.58,

        metalness: 0.04

      });

      const matOchreDark = new THREE.MeshStandardMaterial({

        color: 0xb69b75, // 同色系較深的面磚角柱與退縮層

        roughness: 0.65

      });

      const matOchreLight = new THREE.MeshStandardMaterial({

        color: 0xeddbb9, // 淺米色石材水平飾帶

        roughness: 0.45

      });

      const matDarkWindow = new THREE.MeshStandardMaterial({

        color: 0x8a8b81, // 照片中的中性灰褐窗玻璃

        roughness: 0.38,

        metalness: 0.12,
        emissive: 0x000000, emissiveIntensity: 0.0

      });

      const matAtriumGlass = new THREE.MeshStandardMaterial({

        color: 0x8b8484, // 照片中的暖灰色中庭玻璃

        roughness: 0.32,

        metalness: 0.14,
        emissive: 0x000000, emissiveIntensity: 0.0,

        transparent: true,

        opacity: 0.94

      });

      const matAtriumFrame = new THREE.MeshStandardMaterial({color:0x74665c,roughness:0.65});

      // Photo reference: light warm stone columns and fascia; grey roof and green-grey entrance glass.

      const matGranite = new THREE.MeshStandardMaterial({ color: 0xc7c3b4, roughness: 0.55 });

      const matGraniteBase = new THREE.MeshStandardMaterial({ color: 0xa29e91, roughness: 0.65 });

      const matGableRoof = new THREE.MeshStandardMaterial({ color: 0xaaa99d, roughness: 0.50, side: THREE.DoubleSide });

      const matGraniteTrim = new THREE.MeshStandardMaterial({ color: 0xf0eee3, roughness: 0.40, side: THREE.DoubleSide });

      const matGableGlass = new THREE.MeshStandardMaterial({

        color: 0x606c69,

        roughness: 0.12,

        metalness: 0.12,

        transparent: true,

        opacity: 0.88,

        side: THREE.DoubleSide

      });

      const matHelipadDeck = new THREE.MeshStandardMaterial({ color: 0x424953, roughness: 0.85 });

      const matHeliYellow = new THREE.MeshBasicMaterial({ color: 0xf5b041 });

      const matHeliWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });

      const matAsphalt = new THREE.MeshStandardMaterial({ color: 0x36383b, roughness: 0.85 });

      const matGreenery = new THREE.MeshStandardMaterial({ color: 0x667f62, roughness: 0.85 });

      const matCourtyardBase = new THREE.MeshStandardMaterial({ color: 0x3a4049, roughness: 0.85 });

      // ==========================================

      // 1. 底層大面積醫療基座 (1F~3F Podium, 高 10.8m)

      // ==========================================

      // 底層集中了急診、門診大廳與檢驗室，四棟高塔在裙樓上各自挺立

      const podDepthX = 46.0;

      const podWidthZ = 72.0;

      const podH = 10.8;

      const podium = new THREE.Mesh(

        new THREE.BoxGeometry(podDepthX, podH, podWidthZ),

        matOchreTile

      );

      podium.position.set(px + 2.0, podH / 2, pz);

      podium.castShadow = true;

      podium.receiveShadow = true;

      parent.add(podium);

      // 裙樓各層水平飾帶

      for (let pf = 1; pf <= 3; pf++) {

        const pfy = pf * floorH;

        const pBand = new THREE.Mesh(

          new THREE.BoxGeometry(podDepthX + 0.3, 0.4, podWidthZ + 0.3),

          matOchreLight

        );

        pBand.position.set(px + 2.0, pfy, pz);

        parent.add(pBand);

      }

      // 天井底部的深色綠意採光庭院 (讓鳥瞰時四棟樓的間隔無比鮮明)

      [-20.0, 20.0].forEach(courtZ => {

        const courtMesh = new THREE.Mesh(

          new THREE.BoxGeometry(podDepthX * 0.75, 0.3, 5.4),

          matCourtyardBase

        );

        courtMesh.position.set(px - 1.0, podH + 0.15, pz + courtZ);

        parent.add(courtMesh);

        // 庭院綠樹微景觀

        [-10.0, 0, 10.0].forEach(tx => {

          const tree = new THREE.Mesh(

            new THREE.BoxGeometry(2.5, 1.8, 2.5),

            matGreenery

          );

          tree.position.set(px + tx, podH + 1.0, pz + courtZ);

          parent.add(tree);

        });

      });

      // ==========================================

      // 2. 東址四棟獨立高層大樓 (A棟、B棟、C棟、D棟)

      // ==========================================

      // 依照片與平面圖：四棟東西向平行延伸的大樓，由北向南依次排列

      const frontX = px - 25.0; // 西立面基準線 (面向中山南路)

      const bodyH = 43.2;      // 1F~12F 高度

      const towerW_Z = 12.0;   // 每棟大樓的南北寬度

      const fourTowers = [

        {

          id: 'A',

          name: 'A棟 (7A/12A 北外棟)',

          z: pz - 28.5,

          startX: frontX,

          depthX: 47.0,

          isOuter: true,

          outerSide: -1,

          isProminent: false

        },

        {

          id: 'B',

          name: 'B棟 (7B/12B 北內棟)',

          z: pz - 11.5,

          startX: frontX - 2.8, // 依實景照片：中庭兩側內塔在西立面更向前凸出，呈現強烈層次

          depthX: 49.8,

          isOuter: false,

          outerSide: 0,

          isProminent: true

        },

        {

          id: 'C',

          name: 'C棟 (7C/12C 南內棟)',

          z: pz + 11.5,

          startX: frontX - 2.8, // 依實景照片：與 B 棟對稱向前突出

          depthX: 49.8,

          isOuter: false,

          outerSide: 0,

          isProminent: true

        },

        {

          id: 'D',

          name: 'D棟 (7D/12D 南外棟)',

          z: pz + 28.5,

          startX: frontX,

          depthX: 47.0,

          isOuter: true,

          outerSide: 1,

          isProminent: false

        }

      ];

      fourTowers.forEach(tw => {

        const tCenterX = tw.startX + tw.depthX / 2;

        const tCenterZ = tw.z;

        // (1) 1F~12F 主量體 (完全獨立的長條形高樓大廈)

        const tBody = new THREE.Mesh(

          new THREE.BoxGeometry(tw.depthX, bodyH, towerW_Z),

          matOchreTile

        );

        tBody.position.set(tCenterX, bodyH / 2, tCenterZ);

        tBody.castShadow = true;

        tBody.receiveShadow = true;

        parent.add(tBody);

        // (2) 西向端頭正面角柱 (面向中山南路：左右厚重立體垂直磚柱)

        [-towerW_Z / 2 + 1.2, towerW_Z / 2 - 1.2].forEach(colZ => {

          const col = new THREE.Mesh(

            new THREE.BoxGeometry(0.8, bodyH, 2.4),

            matOchreDark

          );

          col.position.set(tw.startX - 0.4, bodyH / 2, tCenterZ + colZ);

          parent.add(col);

        });

        // (3) 西向端頭正面開窗 (1F~12F：兩列縱向深窗與水平樑帶，依 user_east_reference.jpg 實景照片)

        for (let f = 1; f <= 12; f++) {

          const fy = f * floorH - 1.8;

          // 水平石材樓層飾帶

          const sill = new THREE.Mesh(

            new THREE.BoxGeometry(0.5, 0.42, 7.2),

            matOchreLight

          );

          sill.position.set(tw.startX - 0.15, fy - 1.1, tCenterZ);

          parent.add(sill);

          // 兩排豎向深色窗玻璃

          [-1.9, 1.9].forEach(wz => {

            const win = new THREE.Mesh(

              new THREE.BoxGeometry(0.4, 2.1, 2.4),

              matDarkWindow

            );

            win.position.set(tw.startX - 0.1, fy + 0.2, tCenterZ + wz);

            parent.add(win);

          });

        }

        // (4) 長向立面開窗 (南北向兩側長向連續採光窗與樑線，展現四棟大樓的深邃立體縱深)

        const numSideBays = Math.floor(tw.depthX / 6.0);

        for (let bIdx = 1; bIdx < numSideBays; bIdx++) {

          const bayX = tw.startX + bIdx * 6.0;

          for (let f = 4; f <= 12; f += 2) {

            const fy = f * floorH - 1.8;

            [-towerW_Z / 2 - 0.05, towerW_Z / 2 + 0.05].forEach(sideZ => {

              const sWin = new THREE.Mesh(

                new THREE.BoxGeometry(3.6, 1.9, 0.2),

                matDarkWindow

              );

              sWin.position.set(bayX, fy, tCenterZ + sideZ);

              parent.add(sWin);

              const sBand = new THREE.Mesh(

                new THREE.BoxGeometry(4.2, 0.35, 0.22),

                matOchreLight

              );

              sBand.position.set(bayX, fy - 1.0, tCenterZ + sideZ);

              parent.add(sBand);

            });

          }

        }

        // (5) 頂樓第 13F~14F 階梯式第 1 段退縮層 (Stepped Setback 1)

        const s1H = floorH * 2.0; // 7.2m

        const s1DepthX = tw.depthX * 0.88;

        const s1WidthZ = towerW_Z * 0.88;

        const s1Mesh = new THREE.Mesh(

          new THREE.BoxGeometry(s1DepthX, s1H, s1WidthZ),

          matOchreTile

        );

        s1Mesh.position.set(tCenterX, bodyH + s1H / 2, tCenterZ);

        parent.add(s1Mesh);

        // 13F~14F 精緻西向開窗與米黃飾帶

        for (let sf = 1; sf <= 2; sf++) {

          const sy = bodyH + sf * floorH - 1.8;

          const sBand = new THREE.Mesh(

            new THREE.BoxGeometry(s1DepthX * 1.01, 0.38, s1WidthZ * 1.01),

            matOchreLight

          );

          sBand.position.set(tCenterX, sy - 1.1, tCenterZ);

          parent.add(sBand);

          [-1.7, 1.7].forEach(wz => {

            const sWin = new THREE.Mesh(

              new THREE.BoxGeometry(0.35, 2.0, 2.2),

              matDarkWindow

            );

            sWin.position.set(tw.startX + (tw.depthX - s1DepthX) / 2 - 0.05, sy + 0.2, tCenterZ + wz);

            parent.add(sWin);

            });

        }

        // (6) 頂樓第 15F 第 2 段退縮機電閣樓 (Setback 2 & Penthouse)

        const s2H = floorH * 1.0; // 3.6m

        const s2DepthX = tw.depthX * 0.74;

        const s2WidthZ = towerW_Z * 0.74;

        const s2Mesh = new THREE.Mesh(

          new THREE.BoxGeometry(s2DepthX, s2H, s2WidthZ),

          matOchreDark

        );

        s2Mesh.position.set(tCenterX, bodyH + s1H + s2H / 2, tCenterZ);

        parent.add(s2Mesh);

        // 頂部石材護欄女兒牆壓頂

        const cap = new THREE.Mesh(

          new THREE.BoxGeometry(s2DepthX * 1.04, 0.5, s2WidthZ * 1.04),

          matOchreLight

        );

        cap.position.set(tCenterX, totalH + 0.25, tCenterZ);

        parent.add(cap);

        // East-facing ends (+X) also have windows. Place lower-floor panes
        // outside the podium, and follow the actual 13F/14F setback face.
        const eastPaneGeometry = new THREE.BoxGeometry(0.24, 2.1, 2.4);
        const eastSillGeometry = new THREE.BoxGeometry(0.28, 0.35, 7.2);
        for (let f = 1; f <= 14; f++) {
          const wallX = f <= 3
            ? Math.max(tw.startX + tw.depthX, px + 2 + podDepthX / 2)
            : f <= 12 ? tw.startX + tw.depthX : tCenterX + s1DepthX / 2;
          const fy = f * floorH - 1.8;
          const sill = new THREE.Mesh(eastSillGeometry, matOchreLight);
          sill.name = `east-end-sill-${tw.id}-${f}F`;
          sill.position.set(wallX + 0.16, fy - 1.1, tCenterZ);
          parent.add(sill);
          for (const wz of [-1.9, 1.9]) {
            const pane = new THREE.Mesh(eastPaneGeometry, matDarkWindow);
            pane.name = `east-end-window-${tw.id}-${f}F`;
            pane.position.set(wallX + 0.16, fy + 0.2, tCenterZ + wz);
            parent.add(pane);
          }
        }

      });

      // ==========================================

      // 3. A-B棟之間 與 C-D棟之間的採光天井與輕盈空中走廊 (Light Wells & Skybridges)

      // ==========================================

      const skybridgeBays = [

        { name: '北棟天井 (A-B間)', z: pz - 20.0, zSpan: 5.0 },

        { name: '南棟天井 (C-D間)', z: pz + 20.0, zSpan: 5.0 }

      ];

      skybridgeBays.forEach(sb => {

        // 在 7F 與 11F 設置精緻高空連通空中走廊

        [25.2, 39.6].forEach(by => {

          [-4.0, 6.0].forEach(bxOffset => {

            const bridge = new THREE.Mesh(

              new THREE.BoxGeometry(4.2, 3.2, sb.zSpan + 0.2),

              matDarkWindow

            );

            bridge.position.set(px + bxOffset, by, sb.z);

            parent.add(bridge);

            const bridgeTrim = new THREE.Mesh(

              new THREE.BoxGeometry(4.3, 0.35, sb.zSpan + 0.3),

              matOchreLight

            );

            bridgeTrim.position.set(px + bxOffset, by - 1.7, sb.z);

            parent.add(bridgeTrim);

          });

        });

      });

      // ==========================================

      // 4. 中央挑高 15 層黑玻璃帷幕中庭大廳 (Central Glass Atrium)

      // ==========================================

      // 位於 B棟 與 C棟 之間 (center Z = pz, 寬度 11.0m，西立面凹入 5.5m，直達頂層 52m)

      const atrDepthX = 35.0;

      const atrStartX = frontX + 3.0;

      const atrCenterX = atrStartX + atrDepthX / 2;

      const atrH = 51.5;

      const atrWidthZ = 11.0;

      const atrMesh = new THREE.Mesh(

        new THREE.BoxGeometry(atrDepthX, atrH, atrWidthZ),

        matAtriumGlass

      );

      atrMesh.position.set(atrCenterX, atrH / 2, pz);

      parent.add(atrMesh);

      // 中庭正面西立面大玻璃帷幕垂直鋼骨立柱

      [-4.0, 0, 4.0].forEach(colZ => {

        const mullion = new THREE.Mesh(

          new THREE.BoxGeometry(0.7, atrH, 0.6),

          matAtriumFrame

        );

        mullion.position.set(atrStartX - 0.2, atrH / 2, pz + colZ);

        parent.add(mullion);

      });

      // 中庭正面每 3 層樓之深色水平鋼構飾桁

      for (let f = 3; f <= 14; f += 3) {

        const fy = f * floorH;

        const transom = new THREE.Mesh(

          new THREE.BoxGeometry(0.8, 0.6, atrWidthZ + 0.2),

          matAtriumFrame

        );

        transom.position.set(atrStartX - 0.2, fy, pz);

        parent.add(transom);

      }

      // 中庭內部南北向貫穿之中央高空玻璃天橋 (Connecting North & South Complexes)

      [14.4, 25.2, 36.0, 46.8].forEach(by => {

        const cBridge = new THREE.Mesh(

          new THREE.BoxGeometry(6.0, 3.2, atrWidthZ + 0.4),

          matDarkWindow

        );

        cBridge.position.set(atrCenterX, by, pz);

        parent.add(cBridge);

      });

      // ==========================================

      // 5. 中山南路 1F 迎賓大門門廳 (三連經典三角山牆斜屋頂與花崗岩巨柱廊)

      // ==========================================

      // 依實景照片 user_east_reference.jpg / dacin_5.jpg：正面大門座落在中庭正前方，三個連貫的經典三角山牆斜頂、花崗石柱列與落客車道

      const porchLengthX = 14.0; // 西向突出深度

      const porchW_Z = 24.0;     // 橫跨 Z 軸寬度

      const porchCenterX = frontX - porchLengthX / 2;

      const eaveH = 5.8;         // 門廊柱頂與屋簷高度

      // (1) 迎賓門廊花崗岩大巨柱 (6根前排大方柱 + 6根後排壁柱)

      const colZArr = [-10.0, -6.0, -2.0, 2.0, 6.0, 10.0];

      colZArr.forEach(cz => {

        const frontCol = new THREE.Mesh(

          new THREE.BoxGeometry(1.2, eaveH, 1.2),

          matGranite

        );

        frontCol.position.set(frontX - porchLengthX + 0.6, eaveH / 2, pz + cz);

        parent.add(frontCol);

        const frontBase = new THREE.Mesh(

          new THREE.BoxGeometry(1.5, 0.9, 1.5),

          matGraniteBase

        );

        frontBase.position.set(frontX - porchLengthX + 0.6, 0.45, pz + cz);

        parent.add(frontBase);

        const backCol = new THREE.Mesh(

          new THREE.BoxGeometry(1.2, eaveH, 1.2),

          matGranite

        );

        backCol.position.set(frontX - 0.6, eaveH / 2, pz + cz);

        parent.add(backCol);

      });

      // (2) 柱頂連續花崗石過樑 (Entablature Beam)

      const beamFront = new THREE.Mesh(

        new THREE.BoxGeometry(1.4, 0.75, porchW_Z),

        matGranite

      );

      beamFront.position.set(frontX - porchLengthX + 0.6, eaveH - 0.35, pz);

      parent.add(beamFront);

      const beamBack = new THREE.Mesh(

        new THREE.BoxGeometry(1.4, 0.75, porchW_Z),

        matGranite

      );

      beamBack.position.set(frontX - 0.6, eaveH - 0.35, pz);

      parent.add(beamBack);

      colZArr.forEach(cz => {

        const tieBeam = new THREE.Mesh(

          new THREE.BoxGeometry(porchLengthX, 0.65, 0.9),

          matGranite

        );

        tieBeam.position.set(porchCenterX, eaveH - 0.35, pz + cz);

        parent.add(tieBeam);

      });

      // (3) 三連經典三角山牆斜屋頂 (The Three Gables)

      const gables = [

        { z: pz, wZ: 8.8, lenX: porchLengthX + 0.6, apexH: 3.2 },       // 中央主大山牆

        { z: pz - 7.0, wZ: 5.8, lenX: porchLengthX * 0.92, apexH: 2.4 }, // 北側副山牆

        { z: pz + 7.0, wZ: 5.8, lenX: porchLengthX * 0.92, apexH: 2.4 }  // 南側副山牆

      ];

      gables.forEach(g => {

        const gableMesh = this.createGablePrism(g.lenX, g.wZ, g.apexH, matGableRoof);

        gableMesh.position.set(frontX - g.lenX / 2 + 0.3, eaveH, g.z);

        parent.add(gableMesh);

        const trimMesh = this.createGablePrism(0.5, g.wZ * 0.98, g.apexH * 0.98, matGraniteTrim);

        trimMesh.position.set(frontX - g.lenX + 0.6, eaveH + 0.02, g.z);

        parent.add(trimMesh);

        const tympMesh = this.createGablePrism(0.35, g.wZ * 0.82, g.apexH * 0.82, matGableGlass);

        tympMesh.position.set(frontX - g.lenX + 0.45, eaveH + 0.06, g.z);

        parent.add(tympMesh);

      });

      // (4) 車道落客區與入口大廳台階

      const driveMesh = new THREE.Mesh(

        new THREE.BoxGeometry(porchLengthX + 6.0, 0.15, porchW_Z + 10.0),

        matAsphalt

      );

      driveMesh.position.set(porchCenterX - 3.0, 0.08, pz);

      parent.add(driveMesh);

      const lobbyWall = new THREE.Mesh(

        new THREE.BoxGeometry(0.4, eaveH - 0.8, 14.0),

        matDarkWindow

      );

      lobbyWall.position.set(frontX - 1.2, (eaveH - 0.8) / 2, pz);

      parent.add(lobbyWall);

      // (5) 車道兩側花台綠樹景觀

      [-porchW_Z / 2 - 2.8, porchW_Z / 2 + 2.8].forEach(pzPlanter => {

        const planter = new THREE.Mesh(

          new THREE.BoxGeometry(porchLengthX, 0.8, 2.8),

          matGraniteBase

        );

        planter.position.set(porchCenterX, 0.4, pz + pzPlanter);

        parent.add(planter);

        const bush = new THREE.Mesh(

          new THREE.BoxGeometry(porchLengthX * 0.9, 1.3, 2.0),

          matGreenery

        );

        bush.position.set(porchCenterX, 1.25, pz + pzPlanter);

        parent.add(bush);

      });

      // ==========================================

      // 6. 中央貫穿南北的電梯梯廳與垂直管線軸心大樓 (Spine & Core)

      // ==========================================

      const coreDepthX = 12.0;

      const coreCenterX = px + 10.0;

      const coreWidthZ = 70.0;

      const coreMesh = new THREE.Mesh(

        new THREE.BoxGeometry(coreDepthX, totalH, coreWidthZ),

        matOchreDark

      );

      coreMesh.position.set(coreCenterX, totalH / 2, pz);

      parent.add(coreMesh);

      // ==========================================

      // 7. 頂樓標準醫療急救直升機停機坪平台 [H] (Elevated Helipad, 後置於核心頂層)

      // ==========================================

      const heliSize = 15.0;

      const heliY = totalH + 0.6;

      const deckMesh = new THREE.Mesh(

        new THREE.BoxGeometry(heliSize, 0.5, heliSize),

        matHelipadDeck

      );

      deckMesh.position.set(coreCenterX, heliY, pz);

      parent.add(deckMesh);

      const ringGeom = new THREE.RingGeometry(4.5, 5.3, 36);

      const ringMesh = new THREE.Mesh(ringGeom, matHeliYellow);

      ringMesh.rotation.x = -Math.PI / 2;

      ringMesh.position.set(coreCenterX, heliY + 0.28, pz);

      parent.add(ringMesh);

      [-1.4, 1.4].forEach(hx => {

        const stem = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 5.0), matHeliWhite);

        stem.rotation.x = -Math.PI / 2;

        stem.position.set(coreCenterX + hx, heliY + 0.29, pz);

        parent.add(stem);

      });

      const barH = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.9), matHeliWhite);

      barH.rotation.x = -Math.PI / 2;

      barH.position.set(coreCenterX, heliY + 0.30, pz);

      parent.add(barH);

    },

    // 西址古典窗：半圓拱券、洗石子窗框、拱頂石與直橫分格。
    // 共用同棟窗型的幾何與材質，避免逐窗重複配置幾何資料。
    addWestHeritageWindows(b, parent, wallH, stone, reserveEntrance = false, omitFront = false, trimScale = 1) {
      const w = b.dimensions.width, d = b.dimensions.depth;
      const floors = Math.max(1, b.floors || 1);
      const floorH = wallH / floors;
      const winH = Math.min(2.65, floorH * 0.70);
      const winW = Math.min(1.65, winH * 0.66);
      const radius = winW / 2;
      const springY = winH - radius;
      const border = 0.16 * trimScale;
      const archShape = (r, bottom, spring) => {
        const shape = new THREE.Shape();
        shape.moveTo(-r, bottom);
        shape.lineTo(r, bottom);
        shape.lineTo(r, spring);
        shape.absarc(0, spring, r, 0, Math.PI, false);
        shape.lineTo(-r, bottom);
        return shape;
      };
      const frameGeometry = new THREE.ExtrudeGeometry(archShape(radius + border, -border, springY),
        {depth: 0.12 * trimScale, bevelEnabled: false, curveSegments: 12});
      const paneGeometry = new THREE.ShapeGeometry(archShape(radius, 0, springY), 12);
      const paneMaterial = new THREE.MeshStandardMaterial({color: 0x97bdcb,
        roughness: 0.42, metalness: 0.06, emissive: 0x415d6b, emissiveIntensity: 0.10});
      const mullionV = new THREE.BoxGeometry(0.075 * trimScale, winH - 0.07, 0.10 * trimScale);
      const mullionH = new THREE.BoxGeometry(winW, 0.075 * trimScale, 0.10 * trimScale);
      const sillGeometry = new THREE.BoxGeometry(winW + 0.55 * trimScale, 0.17 * trimScale, 0.42 * trimScale);
      const keyGeometry = new THREE.BoxGeometry(0.28 * trimScale, 0.36 * trimScale, 0.22 * trimScale);
      const offset = Math.max(w, d) * 0.01 + 0.10;
      const addWindow = (x, bottom, z, rotation) => {
        const group = new THREE.Group();
        group.name = 'west-heritage-arched-window';
        const frame = new THREE.Mesh(frameGeometry, stone);
        const pane = new THREE.Mesh(paneGeometry, paneMaterial);
        pane.position.z = 0.12 * trimScale + 0.01;
        const vertical = new THREE.Mesh(mullionV, stone);
        vertical.position.set(0, (winH - 0.07) / 2, 0.18);
        const horizontal = new THREE.Mesh(mullionH, stone);
        horizontal.position.set(0, springY * 0.52, 0.18);
        const springBar = new THREE.Mesh(mullionH, stone);
        springBar.position.set(0, springY, 0.18);
        const sill = new THREE.Mesh(sillGeometry, stone);
        sill.position.set(0, -0.17 * trimScale, 0.14);
        const key = new THREE.Mesh(keyGeometry, stone);
        key.position.set(0, winH + 0.03, 0.19);
        group.add(frame, pane, vertical, horizontal, springBar, sill, key);
        group.position.set(x, bottom, z);
        group.rotation.y = rotation;
        parent.add(group);
      };
      const colsX = Math.max(1, Math.floor((w - 1.4) / 3.6));
      const colsZ = Math.max(1, Math.floor((d - 1.4) / 3.6));
      for (let floor = 0; floor < floors; floor++) {
        const bottom = floor * floorH + (floorH - winH) / 2;
        for (let col = 0; col < colsX; col++) {
          const dx = -w / 2 + (col + 0.5) * w / colsX;
          if (!omitFront && (!reserveEntrance || Math.abs(dx) > 7.5)) {
            addWindow(b.position.x + dx, bottom, b.position.z + d / 2 + offset, 0);
          }
          addWindow(b.position.x + dx, bottom, b.position.z - d / 2 - offset, Math.PI);
        }
        for (let col = 0; col < colsZ; col++) {
          const dz = -d / 2 + (col + 0.5) * d / colsZ;
          addWindow(b.position.x + w / 2 + offset, bottom, b.position.z + dz, Math.PI / 2);
          addWindow(b.position.x - w / 2 - offset, bottom, b.position.z + dz, -Math.PI / 2);
        }
      }
    },

    addWestEntrancePalms(b, parent) {
      // Illustrative palms: curved, tapered trunks and arching pinnate fronds.
      const bark=new THREE.MeshStandardMaterial({color:0x9b8a70,roughness:1});
      const greens=[0x49734e,0x628452,0x79945c].map(color=>new THREE.MeshStandardMaterial({color,roughness:.96,side:THREE.DoubleSide}));
      const segment=new THREE.CylinderGeometry(1,1,1,8);
      const frondGeometry=(length,width)=>{
        const vertices=[],tri=(a,b,c)=>vertices.push(...a,...b,...c);
        const axis=t=>[length*t,1.45*Math.sin(Math.PI*t)-1.8*t*t,0];
        for(let j=0;j<20;j++){
          const t=j/20,n=(j+1)/20,a=axis(t),b=axis(n),w=.045*(1-t)+.008;
          tri([a[0],a[1],-w],[b[0],b[1],0],[a[0],a[1],w]);
          if(j<2)continue;
          const spread=width*Math.pow(Math.sin(Math.PI*t),.72);
          for(const side of [-1,1]){
            const tip=[a[0]+.38*(1-t),a[1]-.2-spread*.17,side*spread];
            const base=axis(Math.min(1,t+.038));
            tri(a,tip,base);
          }
        }
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.computeVertexNormals();return g;
      };
      const fronds=[frondGeometry(5.1,.85),frondGeometry(4.5,.95),frondGeometry(5.6,.75)];
      const front=b.position.z+b.dimensions.depth/2;
      const positions=[[-20,4,21],[-26,-1,22.5],[-32,-6,20.8],[20,3,18.8],[26,-2,20.4],[32,-7,19.5]];
      positions.forEach(([x,z,height],i)=>{
        const g=new THREE.Group();g.name='west-entrance-palm-'+(i+1);
        g.userData={isLandscape:true,landmarkFrame:true,treeType:'arching-feather-palm',placementIsSchematic:true};
        g.position.set(b.position.x+x,0,front+z);
        const lean=(i%2?1:-1)*.65,top=height-1;
        const point=t=>new THREE.Vector3(lean*t*t,top*t,.35*Math.sin(t*Math.PI/2+i)*t*t);
        for(let j=0;j<10;j++){
          const t=j/10,a=point(t),b=point((j+1)/10),delta=b.clone().sub(a);
          const trunk=new THREE.Mesh(segment,bark);trunk.scale.set(.30-.14*t,delta.length(),.30-.14*t);
          trunk.position.copy(a).add(b).multiplyScalar(.5);trunk.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());trunk.castShadow=true;g.add(trunk);
        }
        const crown=point(1);
        for(let j=0;j<15;j++){
          const leaf=new THREE.Mesh(fronds[(j+i)%3],greens[(j+i)%3]);leaf.position.copy(crown);leaf.position.y+=(j%3)*.12;
          leaf.rotation.set(0,j*Math.PI*2/9+i*.43,j<9?-.08-(j%3)*.06:.48+(j%2)*.16);
          leaf.scale.setScalar(.9+((j*7+i*3)%9)*.025);leaf.castShadow=true;g.add(leaf);
        }
        parent.add(g);
      });
    },

    createWestLobby(b, parent) {
      const w=b.dimensions.width,d=b.dimensions.depth;
      const h=b.exteriorDisplayHeight||b.height,px=b.position.x,pz=b.position.z;
      const front=pz+d/2;
      const matBrick=new THREE.MeshStandardMaterial({color:0xbf7658,roughness:.80});
      const matWhiteStone=new THREE.MeshStandardMaterial({color:0xbcb9a8,roughness:.80});
      const stoneLight=new THREE.MeshStandardMaterial({color:0xdcd5c2,roughness:.75});
      const stoneShade=new THREE.MeshStandardMaterial({color:0x969683,roughness:.85});
      const roofMaterial=new THREE.MeshStandardMaterial({color:0x717365,roughness:.88});
      const glassMaterial=new THREE.MeshStandardMaterial({color:0x74817b,roughness:.50,metalness:.06});
      const matDarkDoor=new THREE.MeshStandardMaterial({color:0x554a38,roughness:.75});
      const add=(geometry,material,x,y,z,name)=>{
        const mesh=new THREE.Mesh(geometry,material);mesh.position.set(px+x,y,z);mesh.name=name||'west-entrance-detail';mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
      };
      const box=(width,height,depth,material,x,y,z,name)=>add(new THREE.BoxGeometry(width,height,depth),material,x,y,z,name);
      const column=(x,y,z,height,radius,material=matWhiteStone)=>{
        add(new THREE.CylinderGeometry(radius*.90,radius,height,14),material,x,y,z);
        box(radius*2.8,.22,radius*2.8,stoneLight,x,y-height/2+.08,z);
        box(radius*3,.25,radius*3,stoneLight,x,y+height/2-.05,z);
      };
      // Photo-based heritage facade; ornamental dimensions are a visual approximation.
      box(w,h,d,matBrick,0,h/2,pz,'west-entrance-brick-body');
      box(w*1.025,.38,d*1.025,matWhiteStone,0,h+.12,pz);
      const lobbyRoof=this.createGablePrism(w*.92,d*.82,.95,roofMaterial);
      lobbyRoof.position.set(px,h+.30,pz);lobbyRoof.name='west-entrance-slate-roof';parent.add(lobbyRoof);
      // Raised central roof and paired tower caps articulate the historic skyline.
      box(5.8,1.5,4.2,matBrick,0,h+.85,front-4.0,'west-entrance-central-tower');
      box(6.2,.25,4.6,matWhiteStone,0,h+1.70,front-4.0);
      box(5.8,.20,4.2,roofMaterial,0,h+1.91,front-4.0);
      for(const x of [-w*.35,w*.35]){
        box(5.8,.85,3.0,matBrick,x,h+.52,front-1.4,'west-entrance-side-tower');
        box(6.2,.22,3.4,matWhiteStone,x,h+1.05,front-1.4);
        box(5.8,.16,3.0,roofMaterial,x,h+1.24,front-1.4);
      }
      for(const fraction of [.12,.24,.43,.52,.70,.83])box(w*1.01,.24,d*1.01,stoneLight,0,h*fraction,pz);
      for(const x of [-w*.48,-w*.27,w*.27,w*.48]){
        box(.64,h+.35,.70,matWhiteStone,x,h/2,front+.28);
        box(.95,.38,.92,stoneLight,x,h*.52,front+.37);
      }
      // Side and rear retain the common heritage window style.
      this.addWestHeritageWindows(b,parent,h,matWhiteStone,true,true);
      const archShape=(width,height)=>{
        const r=width/2,s=new THREE.Shape();s.moveTo(-r,0);s.lineTo(r,0);s.lineTo(r,height-r);s.absarc(0,height-r,r,0,Math.PI,false);s.lineTo(-r,0);return s;
      };
      const archWindow=(x,bottom,width,height)=>{
        add(new THREE.ShapeGeometry(archShape(width+.48,height+.38)),stoneLight,x,bottom-.12,front+.66,'west-entrance-arch-frame');
        add(new THREE.ShapeGeometry(archShape(width,height)),glassMaterial,x,bottom,front+.70,'west-entrance-arched-window');
        box(.10,height,.12,matWhiteStone,x,bottom+height/2,front+.74);
        box(width,.10,.12,matWhiteStone,x,bottom+height*.46,front+.74);
        box(width+.72,.22,.70,matWhiteStone,x,bottom-.12,front+.64);
        box(.45,.46,.36,stoneLight,x,bottom+height+.02,front+.80);
      };
      for(const x of [-w*.43,w*.43])archWindow(x,1.1,1.45,3.1);
      const upperBase=h*.58;
      for(const x of [-w*.35,w*.35])archWindow(x,upperBase,2.25,3.65);
      for(const x of [-w*.20,w*.20])archWindow(x,upperBase+.25,1.65,2.75);
      for(const x of [-w*.44,-w*.26,-w*.10,w*.10,w*.26,w*.44])column(x,h*.76,front+.62,h*.40,.23);
      // Stone lintel, small dentils and the central ornamental crest.
      for(const y of [h*.53,h*.91]){
        box(w*1.04,.35,1.0,matWhiteStone,0,y,front+.40);
        box(w*1.06,.16,1.12,stoneLight,0,y+.24,front+.46);
        for(let x=-w*.48;x<w*.49;x+=.72)box(.29,.26,.54,stoneShade,x,y-.25,front+.60);
      }
      const crest=new THREE.Shape();crest.moveTo(-2.7,0);crest.lineTo(-2.7,.7);crest.bezierCurveTo(-2.4,1.6,-1.9,2.6,0,2.9);crest.bezierCurveTo(1.9,2.6,2.4,1.6,2.7,.7);crest.lineTo(2.7,0);crest.closePath();
      add(new THREE.ExtrudeGeometry(crest,{depth:.44,bevelEnabled:false,curveSegments:18}),matWhiteStone,0,h-.15,front+.55,'west-entrance-central-crest');
      // Restored clock: white dial and black Roman numerals (NTU, November 2025).
      // The displayed 10:10 is illustrative, rather than a live time service.
      const dial=document.createElement('canvas');dial.width=dial.height=512;
      const clockCtx=dial.getContext('2d');clockCtx.fillStyle='#f5f1e5';clockCtx.fillRect(0,0,512,512);
      clockCtx.fillStyle='#282720';clockCtx.font='bold 42px Georgia, serif';clockCtx.textAlign='center';clockCtx.textBaseline='middle';
      const roman=['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];
      roman.forEach((s,i)=>{const a=i*Math.PI/6-Math.PI/2;clockCtx.fillText(s,256+191*Math.cos(a),256+191*Math.sin(a));});
      const hand=(angle,length,width)=>{clockCtx.strokeStyle='#282720';clockCtx.lineWidth=width;clockCtx.lineCap='round';clockCtx.beginPath();clockCtx.moveTo(256,256);clockCtx.lineTo(256+length*Math.cos(angle),256+length*Math.sin(angle));clockCtx.stroke();};
      hand((305-90)*Math.PI/180,112,15);hand(-Math.PI/6,158,10);clockCtx.beginPath();clockCtx.arc(256,256,14,0,Math.PI*2);clockCtx.fill();
      const clockMaterial=new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(dial),roughness:.85});
      const clock=add(new THREE.CircleGeometry(.69,64),clockMaterial,0,h+1.15,front+1.02,'west-entrance-restored-clock');
      clock.userData={isHeritageClock:true,timeIsIllustrative:true,source:'NTU restored facade clock, 2025-11-17'};
      const medallion=add(new THREE.TorusGeometry(.79,.12,8,32),stoneLight,0,h+1.15,front+1.06);
      for(let i=0;i<12;i++){const a=i*Math.PI/6;const ornament=add(new THREE.SphereGeometry(.13,8,6),stoneLight,Math.cos(a)*1.02,h+1.15+Math.sin(a)*1.02,front+.99);ornament.scale.set(1,.7,.6);}
      for(const x of [-w*.35,w*.35]){
        const triangle=new THREE.Shape();triangle.moveTo(-3.0,0);triangle.lineTo(0,2.15);triangle.lineTo(3.0,0);triangle.closePath();
        add(new THREE.ExtrudeGeometry(triangle,{depth:.60,bevelEnabled:false}),matWhiteStone,x,h-.10,front+.15,'west-entrance-side-pediment');
        const brickTriangle=new THREE.Shape();brickTriangle.moveTo(-2.25,.22);brickTriangle.lineTo(0,1.78);brickTriangle.lineTo(2.25,.22);brickTriangle.closePath();
        add(new THREE.ShapeGeometry(brickTriangle),matBrick,x,h-.10,front+.78);
        add(new THREE.TorusGeometry(.51,.12,8,24),stoneLight,x,h+.68,front+.87);
        add(new THREE.CircleGeometry(.40,24),glassMaterial,x,h+.68,front+.84);
      }
      // Recessed entrance doors remain visible behind the projecting paired-column porch.
      for(const x of [-3.2,0,3.2]){
        box(2.45,h*.36,.22,matDarkDoor,x,h*.18,front+.12);
        box(2.10,h*.24,.12,glassMaterial,x,h*.22,front+.27);
      }
      const porticoW=19.2,porticoD=6.4,porticoH=h*.44,porticoZ=front+porticoD/2;
      box(porticoW*1.10,.40,porticoD+1.0,stoneShade,0,.20,porticoZ,'west-entrance-porch-floor');
      for(const [width,height,z]of [[22.4,.12,front+porticoD+2.0],[21.8,.24,front+porticoD+1.3],[21.2,.36,front+porticoD+.6]])box(width,height,.75,stoneLight,0,height/2,z,'west-entrance-approach-step');
      for(const x of [-8.0,-2.7,2.7,8.0])for(const pair of [-.35,.35]){
        if(Math.abs(x+pair)>8.2){box(.56,porticoH,.56,matWhiteStone,x+pair,porticoH/2,front+porticoD-.52);box(.88,.23,.88,stoneLight,x+pair,porticoH-.08,front+porticoD-.52);}
        else column(x+pair,porticoH/2,front+porticoD-.52,porticoH,.32);
      }
      for(const x of [-8.0,8.0])column(x,porticoH/2,front+porticoD-1.45,porticoH,.32);
      for(const x of [-8.0,8.0])column(x,porticoH/2,front+1.10,porticoH,.35);
      box(porticoW,.52,porticoD,matWhiteStone,0,porticoH+.26,porticoZ,'west-entrance-stone-entablature');
      box(porticoW*1.035,.20,porticoD*1.04,stoneLight,0,porticoH+.62,porticoZ);
      box(porticoW*.98,.14,porticoD*.96,roofMaterial,0,porticoH+.78,porticoZ);
      // Front and side balcony balustrades, rather than a solid red parapet.
      const railY=porticoH+1.35,railFront=front+porticoD-.10;
      for(const y of [railY-.45,railY+.47]){
        box(porticoW,.20,.40,matWhiteStone,0,y,railFront);
        for(const x of [-porticoW/2,porticoW/2])box(.40,.20,porticoD,matWhiteStone,x,y,porticoZ);
      }
      for(let x=-porticoW/2+.38;x<porticoW/2;x+=.62)column(x,railY,railFront,.78,.10);
      for(const x of [-porticoW/2,porticoW/2])for(let z=front+.35;z<railFront;z+=.62)column(x,railY,z,.78,.10);
      this.addWestEntrancePalms(b,parent);

    },

    // 5. 西址歷史病房長條棟 (W01~W06) - 紅磚牆身 + 雙斜紅陶瓦屋頂 + 拱廊迴廊

    createWestWardWing(b, parent) {

      const exterior = b;
      const w = exterior.dimensions.width;

      const d = exterior.dimensions.depth;

      const h = exterior.height;

      const px = exterior.position.x;

      const pz = exterior.position.z;

      const matBrick = new THREE.MeshStandardMaterial({ color: 0xc77960, roughness: 0.75 });

      const matRoof = new THREE.MeshStandardMaterial({ color: 0xb76a54, roughness: 0.70 }); // 依使用者需求：淡淡的磚紅色 (Pale Brick Rose)

      const matWhite = new THREE.MeshStandardMaterial({ color: 0xdedad2, roughness: 0.5 }); // 典雅洗石子柔和飾帶與簷口，告別刺眼死白

      // 主牆身

      const bodyH = h * 0.75;

      const bodyGeom = new THREE.BoxGeometry(w, bodyH, d);

      const bodyMesh = new THREE.Mesh(bodyGeom, matBrick);

      bodyMesh.position.set(px, bodyH / 2, pz);

      parent.add(bodyMesh);

      this.addWestHeritageWindows(exterior, parent, bodyH, matWhite, false, false, 0.75);

      // 白色橫向飾帶

      const bandGeom = new THREE.BoxGeometry(w * 1.005, 0.3, d * 1.005);

      const bandMesh = new THREE.Mesh(bandGeom, matWhite);

      bandMesh.position.set(px, bodyH * 0.6, pz);

      parent.add(bandMesh);

      // 平頂優雅日治紅磚女兒牆與洗石子簷口 (乾淨俐落無菱形圖案)

      const eaveGeom = new THREE.BoxGeometry(w * 1.015, 0.30, d * 1.015);

      const eaveMesh = new THREE.Mesh(eaveGeom, matWhite);

      eaveMesh.position.set(px, bodyH + 0.15, pz);

      parent.add(eaveMesh);

      const parapetH = 1.2;

      const parapetGeom = new THREE.BoxGeometry(w * 1.01, parapetH, d * 1.01);

      const parapetMesh = new THREE.Mesh(parapetGeom, matBrick);

      parapetMesh.position.set(px, bodyH + 0.30 + parapetH / 2, pz);

      parent.add(parapetMesh);

      const roofCapGeom = new THREE.BoxGeometry(w * 1.012, 0.2, d * 1.012);

      const roofCapMesh = new THREE.Mesh(roofCapGeom, matWhite);

      roofCapMesh.position.set(px, bodyH + 0.30 + parapetH + 0.10, pz);

      parent.add(roofCapMesh);

      // 依使用者需求：頂部加蓋整齊典雅的淡淡磚紅色雙坡斜屋頂 (Pale Brick Rose Roof)
      const roofH = 1.35;
      const roofMesh = this.createGablePrism(w * 0.98, d * 0.98, roofH, matRoof);
      roofMesh.position.set(px, bodyH + 0.30 + parapetH + 0.10, pz);
      parent.add(roofMesh);

    },

    // 6. 西址中央古蹟紅磚主長廊

    createWestCorridor(b, parent) {

      const w = b.dimensions.width;

      const d = b.dimensions.depth;

      const h = b.height;

      const px = b.position.x;

      const pz = b.position.z;

      const matCorr = new THREE.MeshStandardMaterial({ color: 0xc77960, roughness: 0.75 });

      const matRoof = new THREE.MeshStandardMaterial({ color: 0xb76a54, roughness: 0.70 });

      const cGeom = new THREE.BoxGeometry(w, h * 0.75, d);

      const cMesh = new THREE.Mesh(cGeom, matCorr);

      cMesh.position.set(px, (h * 0.75) / 2, pz);

      parent.add(cMesh);

      const matWindowStone = new THREE.MeshStandardMaterial({color: 0xdedad2, roughness: 0.50});
      this.addWestHeritageWindows(b, parent, h * 0.75, matWindowStone, false, false, 0.75);

      const rGeom = new THREE.BoxGeometry(w * 1.1, h * 0.3, d * 1.01);

      const rMesh = new THREE.Mesh(rGeom, matRoof);

      rMesh.position.set(px, h * 0.85, pz);

      parent.add(rMesh);

    },

    // 7. 國定古蹟 景福門 (JINGFU_GATE) - 東西拱券門洞 + 歇山重簷綠琉璃瓦

        // 7. 國定古蹟 景福門 (臺北府城東門) - 深灰石砌安山岩城座 + 半圓拱門 + 雙層歇山重簷深綠琉璃瓦 + 朱紅宮殿城樓

    createJingfuGate(b, parent) {

      const px = b.position.x;

      const pz = b.position.z;

      // 依台北旅遊網官方實景照片 (https://www.travel.taipei/zh-tw/attraction/details/95) 還原材質

      const matStoneBase = new THREE.MeshStandardMaterial({ color: 0x858276, roughness: 0.95, metalness: 0 }); // 日間照片中的灰褐石座

      const matArchInner = new THREE.MeshStandardMaterial({ color: 0x23262a, roughness: 0.95 }); // 拱門內部

      const matVermilion = new THREE.MeshStandardMaterial({ color: 0x956a5e, roughness: 0.82 }); // 收斂彩度的暗紅木構

      const matGlazedGreen = new THREE.MeshStandardMaterial({ color: 0x758d80, roughness: 0.76, metalness: 0.02 }); // 灰綠琉璃瓦，保留綠色識別

      const matWhiteTrim = new THREE.MeshStandardMaterial({ color: 0xded9cb, roughness: 0.85 }); // 暖灰白石護欄與額枋

      const matGoldRidge = new THREE.MeshStandardMaterial({ color: 0xb39b6c, roughness: 0.7, metalness: 0.15 }); // 低彩度赭金脊飾

      const matPlaza = new THREE.MeshStandardMaterial({ color: 0x6e8869, roughness: 0.95 }); // 圓環綠地

      // A. 圓環景觀綠化底座 (Ketagalan / Zhongshan S / Renai Roundabout)

      const plazaGeom = new THREE.CylinderGeometry(26, 26, 0.4, 36);

      const plazaMesh = new THREE.Mesh(plazaGeom, matPlaza);

      plazaMesh.position.set(px, 0.2, pz);

      parent.add(plazaMesh);

      // B. 雄偉深灰石砌安山岩城牆底座 (Stone Base)

      const baseW = 18.0;

      const baseH = 6.2;

      const baseD = 14.0;

      const baseGeom = new THREE.BoxGeometry(baseW, baseH, baseD);

      const baseMesh = new THREE.Mesh(baseGeom, matStoneBase);

      baseMesh.position.set(px, baseH / 2, pz);

      baseMesh.castShadow = true;

      baseMesh.receiveShadow = true;

      parent.add(baseMesh);

      // 城座中央貫穿半圓拱門券洞 (Arch Portal)

      const archR = 2.6;

      const archGeom = new THREE.CylinderGeometry(archR, archR, baseD * 1.02, 24, 1, false, 0, Math.PI);

      const archMesh = new THREE.Mesh(archGeom, matArchInner);

      archMesh.rotation.z = Math.PI / 2;

      archMesh.rotation.y = Math.PI / 2;

      archMesh.position.set(px, archR, pz);

      parent.add(archMesh);

      // 拱門上方嵌白石題額「景福門」

      [-1, 1].forEach(dir => {

        const plaque = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.1), matWhiteTrim);

        plaque.position.set(px, 4.4, pz + dir * (baseD / 2 + 0.05));

        if (dir === -1) plaque.rotation.y = Math.PI;

        parent.add(plaque);

      });

      // 城座頂部白石女兒牆與城垛 (Parapet with battlements)

      const parapetGeom = new THREE.BoxGeometry(baseW * 1.02, 0.85, baseD * 1.02);

      const parapetMesh = new THREE.Mesh(parapetGeom, matWhiteTrim);

      parapetMesh.position.set(px, baseH + 0.42, pz);

      parent.add(parapetMesh);

      // C. 城樓主體 (朱紅色北平宮殿式城樓)

      const pavW = 12.8;

      const pavD = 9.2;

      const pavH = 3.6;

      const pavY = baseH + 0.85;

      const pavGeom = new THREE.BoxGeometry(pavW, pavH, pavD);

      const pavMesh = new THREE.Mesh(pavGeom, matVermilion);

      pavMesh.position.set(px, pavY + pavH / 2, pz);

      parent.add(pavMesh);

      // 朱紅檐柱 (12 根朱紅圓柱環繞城樓)

      const colGeom = new THREE.CylinderGeometry(0.32, 0.35, pavH, 12);

      [-pavW / 2 + 0.5, 0, pavW / 2 - 0.5].forEach(cx => {

        [-pavD / 2 + 0.5, pavD / 2 - 0.5].forEach(cz => {

          const col = new THREE.Mesh(colGeom, matVermilion);

          col.position.set(px + cx, pavY + pavH / 2, pz + cz);

          parent.add(col);

        });

      });

      // D. 雙層歇山重簷深綠琉璃瓦大屋頂 (Double-Eaved Imperial Green Roof)

      // 1. 下層副簷 (Lower Eave)

      const lowRoofGeom = new THREE.ConeGeometry(11.2, 2.2, 4);

      const lowRoofMesh = new THREE.Mesh(lowRoofGeom, matGlazedGreen);

      lowRoofMesh.rotation.y = Math.PI / 4;

      lowRoofMesh.position.set(px, pavY + pavH + 0.7, pz);

      lowRoofMesh.scale.set(1.4, 0.8, 1.15);

      parent.add(lowRoofMesh);

      // 2. 上層歇山主簷 (Upper Eave with Ridges)

      const upRoofGeom = new THREE.ConeGeometry(9.6, 3.2, 4);

      const upRoofMesh = new THREE.Mesh(upRoofGeom, matGlazedGreen);

      upRoofMesh.rotation.y = Math.PI / 4;

      upRoofMesh.position.set(px, pavY + pavH + 2.7, pz);

      upRoofMesh.scale.set(1.3, 0.95, 1.05);

      parent.add(upRoofMesh);
    },


    createJingfuTunnel(b, parent) {
      const px = b.position.x;
      const pz = b.position.z;
      const w = b.dimensions.width;
      const d = b.dimensions.depth;

      const matStone = new THREE.MeshStandardMaterial({ color: 0xede5d8, roughness: 0.6 });
      const matGlass = new THREE.MeshStandardMaterial({ color: 0x2b3842, roughness: 0.2, metalness: 0.8, transparent: true, opacity: 0.85 });
      const matFloor = new THREE.MeshStandardMaterial({ color: 0xe2dad0, roughness: 0.8 });

      // 景福通道為地下聯通，地面由綠意草坪與中山南路自然覆蓋，杜絕白色條帶割裂感
      // 依使用者指示移除西址大門右側的地面玻璃亭；地下連通關係保留。

      // 東端出入口採光亭
      const kEast = new THREE.Mesh(new THREE.BoxGeometry(6.5, 2.6, 5.5), matStone);
      kEast.position.set(px + w / 2 - 3.5, 1.3, pz);
      parent.add(kEast);
      const kEastGlass = new THREE.Mesh(new THREE.BoxGeometry(6.1, 1.4, 5.1), matGlass);
      kEastGlass.position.set(px + w / 2 - 3.5, 2.2, pz);
      parent.add(kEastGlass);
    },

    createStandardBlock(b, parent) {

      const w = b.dimensions.width;

      const d = b.dimensions.depth;

      const h = b.height;

      const px = b.position.x;

      const pz = b.position.z;

      const matWall = new THREE.MeshStandardMaterial({ color: 0xd8d3cb, roughness: 0.6 });

      const matWin = new THREE.MeshStandardMaterial({ color: 0x365268, roughness: 0.3 });

      const geom = new THREE.BoxGeometry(w, h, d);

      const mesh = new THREE.Mesh(geom, matWall);

      mesh.position.set(px, h / 2, pz);

      parent.add(mesh);

      for (let f = 1; f < b.floors; f++) {

        const stripe = new THREE.Mesh(new THREE.BoxGeometry(w * 1.002, 0.9, d * 1.002), matWin);

        stripe.position.set(px, f * 3.6, pz);

        parent.add(stripe);

      }

    }

  };

  window.CampusBuildingModels = CampusBuildingModels;

})(window);
