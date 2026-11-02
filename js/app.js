// js/app.js - 3D 智慧院區導覽與感管動態空間監測系統 (鳥瞰擬 3D 配置圖、時間軸轉床動線、感管個案監控)

class CampusApp {

  constructor() {

    this.campusData = window.CAMPUS_DATA;

    this.roomsData = window.ROOMS_DATA;

    this.floorplansData = window.FLOORPLANS_DATA || {};

    this.ward3DData = window.WARD_3D_LAYOUT_DATA || {};

    this.ipcData = window.IPC_MOVEMENTS_DATA || { cases: [] };

    this.groundTextureBase64 = window.GROUND_TEXTURE_BASE64;

    this.container = document.getElementById('canvas-container');

    this.scene = null;

    this.renderer = null;

    this.camera = null;

    this.controls = null;

    this.raycaster = new THREE.Raycaster();

    this.mouse = new THREE.Vector2();

    // 系統狀態

    this.mode = 'orbit';

    this.currentCampus = 'all'; // 'west' | 'east' | 'children' | 'all'

    this.selectedBuilding = null;

    this.selectedFloor = 'all';

    // 感管動態時間軸狀態

    this.currentDate = '2026-10-15';

    this.currentPathogenFilter = 'ALL';

    this.isPlayingTimeline = false;

    this.timelineInterval = null;

    // 3D 組織群組

    this.buildingsGroup = new THREE.Group();

    this.floorSliceGroup = new THREE.Group();

    this.infectionGroup = new THREE.Group();

    this.arcsGroup = new THREE.Group();

    this.labelsGroup = new THREE.Group();

    this.wardLabelsGroup = new THREE.Group();
    this.xrayDensityGroup = new THREE.Group();
    this.xrayMode = false;
    this.buildingOriginalMaterials = new Map();

    // 映射表與互動清單

    this.buildingMeshes = {};

    this.bedMeshes = {};

    this.roomMeshes = {};

    this.selectedRoomCode = null;        // bedId -> mesh

    this.interactableObjects = [];

    this.pulsingHalos = [];     // 動態呼吸光環

    this.transferParticles = [];// 轉床動線飛行粒子

    // Modal 檢視器

    this.currentModalData = { image: '', title: '', pdf: '' };

    this.modalZoom = 1.0;

    this.modalPan = { x: 0, y: 0 };

    this.isPanningModal = false;

    this.panStart = { x: 0, y: 0 };

    this.clock = new THREE.Clock();

    this.fpsController = null;

    this.minimap = null;

  }

  init() {

    this.initThree();

    this.createGround();

    this.createBuildings();

    this.gardenEnvironment = window.CampusGarden?.create(this);
    this.immersionEnvironment = window.CampusImmersion?.create(this);

    this.initControllers();

    this.initUI();

    this.initTimelineControls();

    this.initPanelToggles();

    this.initHoverAndDoubleClick();

    this.initViewSwitcher();

    this.initOrientationWidget();

    this.initModalViewer();

    this.animate();

    console.log('CampusApp initialized with 3D Ward Layouts & IPC Infection Tracking!');

  }

  initThree() {

    const w = this.container.clientWidth;

    const h = this.container.clientHeight;

    this.scene = new THREE.Scene();

    this.scene.background = new THREE.Color(0xd8e6da); // 清新柔和大氣微霧淡青色，與全區淡雅草坪完美相融，零留白虛無感

    this.scene.fog = new THREE.FogExp2(0xd8e6da, 0.0012);

    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.5, 2000);

    this.camera.position.set(15, 86, 215);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });

    this.renderer.setSize(w, h);

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.renderer.shadowMap.enabled = true;

    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

    this.controls.screenSpacePanning = false; // 依使用者需求：沿地平面平移，拖曳時畫面如地圖般平滑滑動尋找建物！

    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,                 // 依使用者需求：預設滑鼠左鍵拖曳 = 移動畫面 (平移地圖)！
      MIDDLE: THREE.MOUSE.DOLLY,             // 滾輪 = 縮放 (拉近拉遠)
      RIGHT: THREE.MOUSE.ROTATE              // 滑鼠右鍵拖曳 = 旋轉 3D 視角
    };

    this.controls.touches = {
      ONE: THREE.TOUCH.PAN,                  // 單指 = 平移移動畫面
      TWO: THREE.TOUCH.DOLLY_PAN             // 雙指 = 縮放與平移
    };

    this.mouseDragMode = 'pan';

    this.container.style.cursor = 'grab';

    this.controls.rotateSpeed = 0.65;        // 溫和細膩的旋轉速度

    this.controls.panSpeed = 1.15;           // 流暢舒適的平移滑動速度

    this.controls.zoomSpeed = 0.9;

    this.controls.enableDamping = true;

    this.controls.dampingFactor = 0.09;

    this.controls.maxPolarAngle = Math.PI / 2 - 0.04;

    this.controls.minDistance = 5;

    this.controls.maxDistance = 600;

    this.controls.target.set(36, 22, 18);

    // Balanced daylight preserves brick and window colors without washed-out highlights.

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.38);

    // 西向立面柔和天空補光 (襯托東址正面立體感)

    const westFillLight = new THREE.DirectionalLight(0xf6f7f4, 0.12);

    westFillLight.position.set(-150, 180, 80);

    this.scene.add(westFillLight);

    this.scene.add(ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xfffdf8, 0.55);
    const sunLight = this.sunLight;

    sunLight.position.set(120, 250, 150);

    sunLight.castShadow = true;

    sunLight.shadow.mapSize.width = 2048;

    sunLight.shadow.mapSize.height = 2048;

    sunLight.shadow.camera.near = 10;

    sunLight.shadow.camera.far = 600;
    sunLight.shadow.bias = -0.00015;
    sunLight.shadow.normalBias = 0.035;

    const sCam = 180;

    sunLight.shadow.camera.left = -sCam;

    sunLight.shadow.camera.right = sCam;

    sunLight.shadow.camera.top = sCam;

    sunLight.shadow.camera.bottom = -sCam;

    this.scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0xf1f5ef, 0x85917b, 0.25);

    this.scene.add(hemiLight);

    // 加入組織群組

    this.scene.add(this.buildingsGroup);

    this.scene.add(this.floorSliceGroup);

    this.scene.add(this.infectionGroup);
    this.scene.add(this.xrayDensityGroup);

    this.scene.add(this.arcsGroup);

    this.scene.add(this.labelsGroup);

    // 依使用者需求：建築物不用常駐文字標示，特色出來最重要

    this.labelsGroup.visible = false;

    this.scene.add(this.wardLabelsGroup);

    window.addEventListener('resize', () => this.onWindowResize());

  }

  // 地面地圖貼圖 (高解析指引地圖)

  // 地面與景觀建構 (將西址旁雜亂文字底圖全面升級為優雅淡草皮、二二八和平公園與西址庭園)
  createGround() {
    const groundGroup = new THREE.Group();
    this.scene.add(groundGroup);
    const zhongshanRoadLayout = { x: 31, z: 30, width: 16, depth: 340 };

    // ==========================================
    // 1. 【全域廣袤淡雅草地基底】(1500m x 1500m 延伸至天際線)
    // 建築物以外所有空地全數覆蓋淡淡的草坪，徹底杜絕任何留白與虛無感
    // ==========================================
    const baseGeom = new THREE.PlaneGeometry(4000.0, 4000.0, 1, 1);
    const matBaseGrass = new THREE.MeshStandardMaterial({
      color: 0x91aa88, // 柔和自然淡草綠 (Soft Meadow Lawn Green)，純淨優雅不刺眼、無任何留白
      roughness: 0.92,
      metalness: 0.01
    });
    const mainBaseLawn = new THREE.Mesh(baseGeom, matBaseGrass);
    mainBaseLawn.rotation.x = -Math.PI / 2;
    mainBaseLawn.position.set(0, -0.05, 0);
    mainBaseLawn.receiveShadow = true;
    groundGroup.add(mainBaseLawn);

    // 2. 景觀與道路材質定義
    const matCourtyardGrass = new THREE.MeshStandardMaterial({
      color: 0x849e7b, // 西址與各中庭微升修剪草坪
      roughness: 0.90,
      metalness: 0.01
    });
    const matEntryThreshold = new THREE.MeshStandardMaterial({
      color: 0x8a847b, // 雅緻深暖灰花崗岩大門迎賓踏階 (絕不反光過曝變白)
      roughness: 0.85
    });
    const matRoadAsphalt = new THREE.MeshStandardMaterial({
      color: 0x62666a, // 柔和深灰柏油路面
      roughness: 0.88
    });
    const matRoadMarking = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });

    // 3. 【二二八和平公園】純淨淡雅草坪主體 (X: -188 ~ -54, Z: -65 ~ 125)
    const parkW_X = 134.0;
    const parkD_Z = 190.0;
    const parkCenterX = -121.0;
    const parkCenterZ = 30.0;
    const matParkLawn = new THREE.MeshStandardMaterial({
      color: 0x8ba583, // 二二八淡雅草皮
      roughness: 0.92,
      metalness: 0.01
    });
    const parkLawn = new THREE.Mesh(
      new THREE.BoxGeometry(parkW_X, 0.08, parkD_Z),
      matParkLawn
    );
    parkLawn.position.set(parkCenterX, 0.04, parkCenterZ);
    parkLawn.receiveShadow = true;
    groundGroup.add(parkLawn);

    // 4. 【西址各護理翼棟間中庭綠化草帶】
    const westCourtyardZones = [
      { x: -33.0, z: 40.0, w: 38.0, d: 6.2 },
      { x: -34.0, z: 24.0, w: 40.0, d: 6.2 },
      { x: -35.0, z: 8.0, w: 42.0, d: 6.2 }
    ];
    westCourtyardZones.forEach(cz => {
      const cLawn = new THREE.Mesh(
        new THREE.BoxGeometry(cz.w, 0.12, cz.d),
        matCourtyardGrass
      );
      cLawn.position.set(cz.x, 0.06, cz.z);
      cLawn.receiveShadow = true;
      groundGroup.add(cLawn);
    });

    const eastCourtyardZones = [
      { x: 23.0, z: 40.0, w: 26.0, d: 6.2 },
      { x: 24.0, z: 24.0, w: 28.0, d: 6.2 },
      { x: 25.0, z: 8.0, w: 30.0, d: 6.2 }
    ];
    eastCourtyardZones.forEach((cz, index) => {
      // Raised courtyard turf must stop before the continuous carriageway.
      const left = cz.x - cz.w / 2;
      const right = Math.min(cz.x + cz.w / 2, zhongshanRoadLayout.x - zhongshanRoadLayout.width / 2 - 0.15);
      if (right <= left) return;
      const cLawn = new THREE.Mesh(
        new THREE.BoxGeometry(right - left, 0.12, cz.d),
        matCourtyardGrass
      );
      cLawn.name = `east-courtyard-lawn-${index}`;
      cLawn.position.set((left + right) / 2, 0.06, cz.z);
      cLawn.receiveShadow = true;
      groundGroup.add(cLawn);
    });

    // 西五/六棟後花園綠地
    const northGarden = new THREE.Mesh(
      new THREE.BoxGeometry(55.0, 0.12, 14.0),
      matCourtyardGrass
    );
    northGarden.position.set(-10.0, 0.06, -14.0);
    groundGroup.add(northGarden);

    // 5. 【建築大門小巧迎賓踏階】(保留建築基座真實感，但不再使用大片白石板，空地全部歸還淡淡草坪)
    // 東址主大樓大門踏階
    const eastEntry = new THREE.Mesh(
      new THREE.BoxGeometry(22.0, 0.10, 8.0),
      matEntryThreshold
    );
    eastEntry.position.set(53.0, 0.05, 70.8);
    groundGroup.add(eastEntry);

    // 兒童醫院大門踏階
    const childEntry = new THREE.Mesh(
      new THREE.BoxGeometry(5.0, 0.10, 18.0),
      matEntryThreshold
    );
    const childBuilding=this.campusData.buildings.find(b=>b.id==='CHILD_HOSPITAL');
    const childPosition=childBuilding?.position||{x:-4,z:-56};
    childEntry.position.set(childPosition.x+(childBuilding?.dimensions.width||38)/2+2.5,0.05,childPosition.z);
    childEntry.name = 'children-east-entry-threshold';
    groundGroup.add(childEntry);

    // 景福門圓環綠島 (草坪圓環)
    const jingfuLawnRing = new THREE.Mesh(
      new THREE.CylinderGeometry(24.0, 24.0, 0.12, 36),
      matCourtyardGrass
    );
    const southernRoadOffset=this.campusData.sceneLayout?.southernRoadOffset||0;
    jingfuLawnRing.position.set(13.7, 0.06, 138.9+southernRoadOffset);
    groundGroup.add(jingfuLawnRing);

    // 6. 【周邊幹道道路系統】(整齊俐落的柏油道路貫穿綠意草坪，對比清爽分明)
    // A. 公園路 (Gongyuan Rd.)
    const gongyuanRoad = new THREE.Mesh(
      new THREE.BoxGeometry(6.5, 0.10, 240.0),
      matRoadAsphalt
    );
    gongyuanRoad.position.set(-53.5, 0.05, parkCenterZ);
    groundGroup.add(gongyuanRoad);

    // B. 常德街 (Changde St.): keep the full carriageway beyond the lobby steps.
    const changdeStreetZ=82.0,streetLeft=-59.0,streetRight=57.0;
    const changdeStreet=new THREE.Mesh(new THREE.BoxGeometry(streetRight-streetLeft,.10,9.0),matRoadAsphalt);
    changdeStreet.position.set((streetLeft+streetRight)/2,.05,changdeStreetZ);changdeStreet.receiveShadow=true;groundGroup.add(changdeStreet);
    const westGateBuilding=this.campusData.buildings.find(b=>b.id==='W01_LOBBY');
    const forecourtWidth=(westGateBuilding?.dimensions.width||40)*1.1,westGateX=westGateBuilding?.position.x??-8.9;
    const westEntrancePlaza=new THREE.Mesh(new THREE.BoxGeometry(forecourtWidth,.08,27.0),matEntryThreshold);
    westEntrancePlaza.name='west-entrance-stone-forecourt';
    westEntrancePlaza.position.set(westGateX,.04,63.2);westEntrancePlaza.receiveShadow=true;groundGroup.add(westEntrancePlaza);

    // C. 中山南路 (Zhongshan S. Rd.)
    const zhongshanRoad = new THREE.Mesh(
      new THREE.BoxGeometry(zhongshanRoadLayout.width, 0.10, zhongshanRoadLayout.depth),
      matRoadAsphalt
    );
    zhongshanRoad.name = 'zhongshan-south-carriageway';
    zhongshanRoad.position.set(zhongshanRoadLayout.x, 0.05, zhongshanRoadLayout.z);
    groundGroup.add(zhongshanRoad);

    // 中山南路中央綠帶分隔島 (草坪)
    const medianStrip = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.18, 330.0),
      matCourtyardGrass
    );
    medianStrip.position.set(31.0, 0.09, 30.0);
    groundGroup.add(medianStrip);

    // D. 凱達格蘭大道 (Ketagalan Blvd.)
    const ketagalanBlvd = new THREE.Mesh(
      new THREE.BoxGeometry(180.0, 0.10, 15.0),
      matRoadAsphalt
    );
    ketagalanBlvd.position.set(-55.0, 0.05, 134.0+southernRoadOffset);
    groundGroup.add(ketagalanBlvd);

    // E. 仁愛路一段 (Ren'ai Rd. Sec. 1)
    const renaiRoad = new THREE.Mesh(
      new THREE.BoxGeometry(180.0, 0.10, 15.0),
      matRoadAsphalt
    );
    renaiRoad.name='renai-carriageway';
    renaiRoad.position.set(95.0, 0.05, 134.0+southernRoadOffset);
    groundGroup.add(renaiRoad);

    // F. 青島西路 / 青島東路 (北側界線幹道)
    const qingdaoRoad = new THREE.Mesh(
      new THREE.BoxGeometry(280.0, 0.10, 10.0),
      matRoadAsphalt
    );
    qingdaoRoad.position.set(0.0, 0.05, -78.0);
    groundGroup.add(qingdaoRoad);

    // G. 徐州路 is NORTH of East Hospital. The former south-side road
    // incorrectly separated the South ward from the College of Medicine.
    // Reference: NTUH East 1F plan and NTU downtown-campus map B_03_A.pdf.
    const eastBuilding=this.campusData.buildings.find(b=>b.id==='E01_MAIN');
    const eastNorth=eastBuilding.position.z-eastBuilding.dimensions.depth/2;
    const eastSouth=eastBuilding.position.z+eastBuilding.dimensions.depth/2;
    const southWalkWidth=1.5,xuzhouWidth=8.5;
    const xuzhouRoad = new THREE.Mesh(
      new THREE.BoxGeometry(110.0, 0.10, xuzhouWidth),
      matRoadAsphalt
    );
    xuzhouRoad.name='xuzhou-north-carriageway';
    xuzhouRoad.position.set(94.0, 0.05, eastNorth-southWalkWidth-xuzhouWidth/2);
    groundGroup.add(xuzhouRoad);
    const southWalk=new THREE.Mesh(
      new THREE.BoxGeometry(eastBuilding.dimensions.width,.08,southWalkWidth),
      new THREE.MeshStandardMaterial({color:0xb9baa8,roughness:.95})
    );
    southWalk.name='east-south-sidewalk';
    southWalk.position.set(eastBuilding.position.x,.04,eastSouth+southWalkWidth/2);
    groundGroup.add(southWalk);
  }

  createBuildings() {

    // 依使用者需求建立交通幹道：中山南路 (Zhongshan S. Rd.)、常德街、凱達格蘭大道與仁愛路

    if (window.CampusBuildingModels && window.CampusBuildingModels.createRoadNetwork) {

      window.CampusBuildingModels.createRoadNetwork(this.scene);

    }

    this.campusData.buildings.forEach(b => {

      let bGroup;

      if (window.CampusBuildingModels) {

        bGroup = window.CampusBuildingModels.build(b, this);

      } else {

        bGroup = new THREE.Group();

      }

      const h = b.exteriorDisplayHeight || b.height;

      const labelSprite = this.createBuildingLabelSprite(b.name, b.floors, b.campus);

      labelSprite.position.set(b.position.x, h + 3.8, b.position.z);

      this.labelsGroup.add(labelSprite);

      this.buildingsGroup.add(bGroup);

      this.buildingMeshes[b.id] = bGroup;

    });

  }

  createBuildingLabelSprite(name, floors, campus) {

    const canvas = document.createElement('canvas');

    canvas.width = 300;

    canvas.height = 70;

    const ctx = canvas.getContext('2d');

    let bgColor = 'rgba(151, 96, 80, 0.94)';

    let strokeColor = '#f2d5cb';

    if (campus === 'east') {

      bgColor = 'rgba(67, 111, 135, 0.92)';

      strokeColor = '#dbe8ef';

    } else if (campus === 'children') {

      bgColor = 'rgba(177, 139, 112, 0.94)';

      strokeColor = '#fae4d2';

    } else if (campus === 'link') {

      bgColor = 'rgba(60, 126, 90, 0.92)';

      strokeColor = '#dcf0e7';

    }

    ctx.fillStyle = bgColor;

    ctx.roundRect(4, 4, 292, 62, 10);

    ctx.fill();

    ctx.lineWidth = 2;

    ctx.strokeStyle = strokeColor;

    ctx.stroke();

    ctx.font = 'bold 23px Arial, "Microsoft JhengHei"';

    ctx.fillStyle = '#ffffff';

    ctx.textAlign = 'center';

    ctx.textBaseline = 'middle';

    ctx.fillText(name.split(' (')[0], 150, 26);

    ctx.font = '15px Arial, "Microsoft JhengHei"';

    ctx.fillStyle = '#f8f4ed';

    ctx.fillText(`${floors} 層樓 (${(floors * 3.6).toFixed(1)}m)`, 150, 50);

    const texture = new THREE.CanvasTexture(canvas);

    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });

    const sprite = new THREE.Sprite(mat);

    sprite.scale.set(15, 3.5, 1);

    return sprite;

  }

  // 院區切換 (東址 / 西址 / 兒醫 / 全院總覽)

  switchCampusView(campusId) {

    this.currentCampus = campusId;

    ['btn-campus-west', 'btn-campus-east', 'btn-campus-children', 'btn-campus-all'].forEach(id => {

      const btn = document.getElementById(id);

      if (btn) btn.classList.remove('active');

    });

    const activeMap = {

      'west': 'btn-campus-west',

      'east': 'btn-campus-east',

      'children': 'btn-campus-children',

      'all': 'btn-campus-all'

    };

    const activeBtn = document.getElementById(activeMap[campusId]);

    if (activeBtn) activeBtn.classList.add('active');

    // Leaving a ward must fully restore campus navigation before applying the new campus filter.
    this.selectedBuilding = null;
    this.selectedFloor = 'all';
    this.selectedWard = 'ALL';
    this.selectedRoomCode = null;
    Object.values(this.buildingMeshes).forEach(mesh => {
      if (mesh) mesh.visible = true;
    });
    this.floorSliceGroup.clear();
    this.wardLabelsGroup.clear();
    this.infectionGroup.clear();
    this.arcsGroup.clear();
    this.selectedFloor = 'all';

    const rightPanel = document.getElementById('right-panel');
    rightPanel?.classList.add('panel-collapsed-right');
    document.body.classList.remove('has-right-panel');
    const expandRight = document.getElementById('btn-expand-right');
    if (expandRight) expandRight.style.display = 'none';
    if (window.canvasWhiteboardManager?.wardModal) window.canvasWhiteboardManager.wardModal.style.display = 'none';
    if (this.collapseTimelineBar && window.innerWidth <= 900) this.collapseTimelineBar(true);

    const topSwitcher = document.getElementById('floor-view-switcher-bar');
    if (topSwitcher) topSwitcher.style.display = 'none'; document.body.classList.remove('has-floor-view');
    const hoverCard = document.getElementById('building-hover-canvas-card');
    if (hoverCard) hoverCard.style.display = 'none';

    if (campusId === 'west') {
      this.tweenCamera(new THREE.Vector3(-10, 90, 240), new THREE.Vector3(-10, 12, 39), 1200);
      this.filterBuildingList('west');
      this.showToast('已聚焦【西址】');
    } else if (campusId === 'east') {
      this.tweenCamera(new THREE.Vector3(-50, 95, 240), new THREE.Vector3(76, 20, 71), 1200);
      this.filterBuildingList('east');
      this.showToast('已聚焦【東址】');
    } else if (campusId === 'children') {
      const childPosition=this.campusData.buildings.find(b=>b.id==='CHILD_HOSPITAL')?.position||{x:-4,z:-56};
      this.tweenCamera(new THREE.Vector3(165, 90, 30), new THREE.Vector3(childPosition.x, 22, childPosition.z), 1200);
      this.filterBuildingList('children');
      this.showToast('已聚焦【兒醫】');
    } else {
      this.tweenCamera(new THREE.Vector3(15, 86, 215), new THREE.Vector3(36, 22, 18), 1200);
      this.filterBuildingList('all');
      this.showToast('已切換至【全院】');
    }

  }

  isNonWardBuilding(buildingId) {
    if (!buildingId) return true;
    const nonWardIds = [
      'JINGFU_GATE',
      'W01_LOBBY',
      'W01_SPINE',
      'W_CORRIDOR',
      'JINGFU_TUNNEL',
      'W01_WEST',
      'W01_EAST'
    ];
    return nonWardIds.includes(buildingId);
  }

  filterBuildingList(campusId) {

    const listWrap = document.getElementById('building-list-box');

    if (!listWrap) return;

    listWrap.innerHTML = '';

    // 依使用者需求：不列出與病房單位無關的景福門、常德街中央大廳、中央紅磚長廊

    const priorityOrder = ['E01_MAIN', 'CHILD_HOSPITAL', 'W04_WEST', 'W03_WEST', 'W04_EAST', 'W03_EAST', 'W02_WEST', 'W02_EAST'];

    const filtered = this.campusData.buildings

      .filter(b => {

        if (this.isNonWardBuilding(b.id)) return false;

        if (campusId === 'all') return true;

        return b.campus === campusId || b.campus === 'both';

      })

      .sort((a, b) => {

        const ia = priorityOrder.indexOf(a.id);

        const ib = priorityOrder.indexOf(b.id);

        if (ia !== -1 && ib !== -1) return ia - ib;

        if (ia !== -1) return -1;

        if (ib !== -1) return 1;

        return 0;

      });

    filtered.forEach(b => {

      const card = document.createElement('div');

      card.className = 'building-card';

      card.dataset.id = b.id;

      let badgeColor = '#9e4635';

      if (b.campus === 'east') badgeColor = '#436f87';

      else if (b.campus === 'children') badgeColor = '#c96b28';

      card.innerHTML = `

        <div>

          <div style="font-weight:700;font-size:13px;color:#382820;">${b.name.split(' (')[0]}</div>

          <div style="font-size:11px;color:#705d51;">${b.category}</div>

        </div>

        <div style="font-size:11px;color:${badgeColor};font-weight:800;background:#f3ece1;padding:2px 8px;border-radius:6px;">${b.floors}F</div>

      `;

      card.onclick = () => this.selectBuilding(b.id);

      listWrap.appendChild(card);

    });

  }

  // 游標靠近出現懸浮畫布預覽 (包括建築物、病房名稱)，點 2 下進入該樓層

  initHoverAndDoubleClick() {
    const hoverCard = document.getElementById('building-hover-canvas-card');
    const hoverTitle = document.getElementById('hover-card-title');
    const hoverBadge = document.getElementById('hover-card-badge');
    const floorChipsWrap = document.getElementById('hover-card-floor-chips');
    const btnCloseCard = document.getElementById('btn-close-hover-card');

    let isMouseOverCard = false;
    let isCardPinned = false;
    let hideTimer = null;
    let activeBuilding = null;

    const clearHideTimer = () => {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
    };

    const hideCard = (force = false) => {
      if (!force && (isMouseOverCard || isCardPinned)) return;
      clearHideTimer();
      if (hoverCard) {
        hoverCard.style.display = 'none';
        hoverCard.dataset.buildingId = '';
        hoverCard.dataset.positionedId = '';
        hoverCard.dataset.pinned = 'false';
      }
      activeBuilding = null;
      isCardPinned = false;
      isMouseOverCard = false;
    };

    const showCardForBuilding = (building, clientX, clientY, pin = false) => {
      if (!hoverCard || !building || this.isNonWardBuilding(building.id)) return;

      // 絕不出現雙層選單：若右側大面板已開啟或已下鑽樓層中，絕不彈出懸浮卡片
      const rightPanel = document.getElementById('right-panel');
      const isRightOpen = rightPanel && rightPanel.style.display !== 'none' && !rightPanel.classList.contains('panel-collapsed-right');
      if (!pin && (isRightOpen || (this.selectedFloor && this.selectedFloor !== 'all'))) {
        hoverCard.style.display = 'none';
        return;
      }
      clearHideTimer();
      activeBuilding = building;
      if (pin) {
        isCardPinned = true;
        hoverCard.dataset.pinned = 'true';
      }

      if (hoverTitle) hoverTitle.innerText = building.name.split(' (')[0];
      if (hoverBadge) hoverBadge.innerText = `${building.floors} 層樓`;

      // 依使用者需求：專注精簡呈現樓層選項，移除多餘鳥瞰圖與介紹文字
      if (floorChipsWrap && hoverCard.dataset.buildingId !== building.id) {
        hoverCard.dataset.buildingId = building.id;
        floorChipsWrap.innerHTML = '';
        const floors = this.getBuildingFloors(building.id);
        floors.forEach(f => {
          const chip = document.createElement('button');
          chip.className = `hover-card-floor-chip ${f.featured ? 'featured' : ''}`;
          chip.innerHTML = `${f.icon} ${f.label}`;
          chip.style.pointerEvents = 'auto';
          chip.style.cursor = 'pointer';

          chip.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            hideCard(true);
            this.drillDownToFloor(building.id, f.tag);
          });
          floorChipsWrap.appendChild(chip);
        });
      }

      hoverCard.style.display = 'flex';

      // 輕量化定位 (緊貼游標、保持在可視範圍內)
      if (!isMouseOverCard && hoverCard.dataset.positionedId !== building.id) {
        hoverCard.dataset.positionedId = building.id;
        const cardW = 360;
        const cardH = 220;
        let posX = clientX + 16;
        let posY = clientY + 16;

        if (posX + cardW > window.innerWidth - 16) {
          posX = clientX - cardW - 16;
        }
        if (posY + cardH > window.innerHeight - 16) {
          posY = window.innerHeight - cardH - 16;
        }
        if (posY < 72) posY = 72;

        hoverCard.style.left = posX + 'px';
        hoverCard.style.top = posY + 'px';
      }

      this.container.style.cursor = 'pointer';
    };

    // 卡片自身的滑鼠事件監聽 (確保進入卡片後絕不消失，隨意點選選項)
    if (hoverCard) {
      hoverCard.addEventListener('mouseenter', () => {
        isMouseOverCard = true;
        clearHideTimer();
      });

      hoverCard.addEventListener('mouseleave', () => {
        isMouseOverCard = false;
        if (!isCardPinned) {
          clearHideTimer();
          hideTimer = setTimeout(() => {
            if (!isMouseOverCard && !isCardPinned) {
              hideCard(true);
            }
          }, 400);
        }
      });

      if (btnCloseCard) {
        btnCloseCard.onclick = (e) => {
          e.stopPropagation();
          hideCard(true);
        };
      }
    }

    // 滑鼠游標靠近偵測 (Hover)
    this.container.addEventListener('mousemove', (event) => {
      // 絕不出現雙層選單：若右側大面板開啟、已在樓層下鑽中、或畫布模式開啟，絕不彈出懸浮卡片
      const rightPanel = document.getElementById('right-panel');
      const isRightOpen = rightPanel && rightPanel.style.display !== 'none' && !rightPanel.classList.contains('panel-collapsed-right');
      if (isRightOpen || (this.selectedFloor && this.selectedFloor !== 'all') || (this.whiteboard && this.whiteboard.isScreenCanvasActive)) {
        if (hoverCard) {
          hoverCard.style.display = 'none';
          hoverCard.dataset.pinned = 'false';
          isCardPinned = false;
        }
        return;
      }

      // 如果游標正在卡片上方或已釘選，完全不干擾游標操作
      if (isMouseOverCard || (hoverCard && hoverCard.contains(event.target))) {
        clearHideTimer();
        return;
      }

      const rect = this.container.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.buildingsGroup.children, true);

      let foundBuilding = null;
      for (let i = 0; i < intersects.length; i++) {
        const hit = intersects[i].object;
        const u = hit.userData || (hit.parent ? hit.parent.userData : null);
        if (u && (u.isBuilding || u.buildingId)) {
          const bId = u.buildingId || u.id;
          if (this.isNonWardBuilding(bId)) continue;
          foundBuilding = this.campusData.buildings.find(b => b.id === bId);
          if (foundBuilding) break;
        }
      }

      if (foundBuilding) {
        showCardForBuilding(foundBuilding, event.clientX, event.clientY, false);
      } else {
        this.container.style.cursor = 'default';
        if (!isCardPinned && !isMouseOverCard) {
          clearHideTimer();
          hideTimer = setTimeout(() => {
            if (!isMouseOverCard && !isCardPinned) {
              hideCard(true);
            }
          }, 600); // 充裕緩衝
        }
      }
    });

    // 點選 3D 建築物時「釘選鎖定」選項卡片，讓游標可悠閒操作樓層選項
    this.container.addEventListener('click', (event) => {
      // 依使用者需求：若使用者剛剛正在拖曳移動畫面，放開時絕不誤觸點擊建築物！
      if (this.isViewDragging) return;

      // 絕不出現雙層選單：若右側大面板開啟或已在樓層下鑽中，點擊畫布不彈出懸浮卡片
      const rightPanel = document.getElementById('right-panel');
      const isRightOpen = rightPanel && rightPanel.style.display !== 'none' && !rightPanel.classList.contains('panel-collapsed-right');
      if (isRightOpen || (this.selectedFloor && this.selectedFloor !== 'all')) {
        if (hoverCard) hoverCard.style.display = 'none';
        return;
      }
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.buildingsGroup.children, true);

      let foundBuilding = null;
      for (let i = 0; i < intersects.length; i++) {
        const hit = intersects[i].object;
        let bId = null;
        let curr = hit;
        while (curr && curr !== this.scene) {
          if (curr.userData && (curr.userData.buildingId || curr.userData.id)) {
            bId = curr.userData.buildingId || curr.userData.id;
            break;
          }
          curr = curr.parent;
        }
        if (bId) {
          if (this.isNonWardBuilding(bId)) {
            const b = this.campusData.buildings.find(item => item.id === bId);
            const bName = b ? b.name.split(' (')[0] : '此處';
            this.showToast('本區無病房單位，不呈現平面圖');
            hideCard(true);
            if (this.buildingMeshes[bId]) this.buildingMeshes[bId].visible = true;
            return;
          }
          foundBuilding = this.campusData.buildings.find(b => b.id === bId);
          if (foundBuilding) break;
        }
      }

      if (foundBuilding) {
        showCardForBuilding(foundBuilding, event.clientX, event.clientY, true);
        this.selectBuilding(foundBuilding.id, true);
        this.showToast(`已選取【${foundBuilding.name.split(' (')[0]}】：請點選樓層按鈕進入平面圖，或直接雙擊建築物`);
      } else {
        // 點擊空地解除釘選並隱藏
        if (!isMouseOverCard) {
          hideCard(true);
        }
      }
    });

    // 點 2 下進入該樓層 (Double Click)
    this.container.addEventListener('dblclick', (event) => {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.buildingsGroup.children, true);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        let bId = null;
        let curr = hit;
        while (curr && curr !== this.scene) {
          if (curr.userData && (curr.userData.buildingId || curr.userData.id)) {
            bId = curr.userData.buildingId || curr.userData.id;
            break;
          }
          curr = curr.parent;
        }
        if (bId) {
          if (this.isNonWardBuilding(bId)) {
            const b = this.campusData.buildings.find(item => item.id === bId);
            const bName = b ? b.name.split(' (')[0] : '此處';
            this.showToast('本區無病房單位，不呈現平面圖');
            if (this.buildingMeshes[bId]) this.buildingMeshes[bId].visible = true;
            return;
          }
          const b = this.campusData.buildings.find(item => item.id === bId);
          if (b) {
            hideCard(true);
            const targetFloor = this.getDefaultFloor(bId);
            this.drillDownToFloor(b.id, targetFloor);
            this.showToast(`🚀 已直接進入【${b.name.split(' (')[0]} ${targetFloor}】：可切換 3D 鳥瞰透視或 2D 平面圖`);
          }
        }
      }
    });
  }

  // 取得建物推薦/示範樓層 (預設下鑽樓層)
  getDefaultFloor(buildingId) {
    const floors = this.getBuildingFloors(buildingId);
    if (!floors || floors.length === 0) return '1F';
    const featured = floors.find(f => f.featured);
    return featured ? featured.tag : floors[0].tag;
  }

  // 釘選建築物樓層選擇卡片 (隨手可選樓層)
  pinFloorCardForBuilding(building, clientX, clientY) {
    const hoverCard = document.getElementById('building-hover-canvas-card');
    if (!hoverCard || !building || this.isNonWardBuilding(building.id)) return;

    const hoverTitle = document.getElementById('hover-card-title');
    const hoverBadge = document.getElementById('hover-card-badge');
    const floorChipsWrap = document.getElementById('hover-card-floor-chips');

    if (hoverTitle) hoverTitle.innerText = building.name.split(' (')[0];
    if (hoverBadge) hoverBadge.innerText = `${building.floors} 層樓`;

    if (floorChipsWrap) {
      hoverCard.dataset.buildingId = building.id;
      floorChipsWrap.innerHTML = '';
      const floors = this.getBuildingFloors(building.id);
      floors.forEach(f => {
        const chip = document.createElement('button');
        chip.className = `hover-card-floor-chip ${f.featured ? 'featured' : ''}`;
        chip.innerHTML = `${f.icon} ${f.label}`;
        chip.style.pointerEvents = 'auto';
        chip.style.cursor = 'pointer';

        chip.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          hoverCard.style.display = 'none';
          hoverCard.dataset.pinned = 'false';
          this.drillDownToFloor(building.id, f.tag);
        });
        floorChipsWrap.appendChild(chip);
      });
    }

    hoverCard.dataset.pinned = 'true';
    hoverCard.style.display = 'flex';

    const cardW = 360;
    const cardH = 200;
    let posX = (clientX || (window.innerWidth / 2 - cardW / 2)) + 16;
    let posY = (clientY || 120) + 16;

    if (posX + cardW > window.innerWidth - 380) {
      posX = Math.max(20, (clientX || window.innerWidth / 2) - cardW - 16);
    }
    if (posY + cardH > window.innerHeight - 20) {
      posY = window.innerHeight - cardH - 20;
    }
    if (posY < 76) posY = 76;

    hoverCard.style.left = posX + 'px';
    hoverCard.style.top = posY + 'px';
  }

  // 取得各建物之樓層清單 (依使用者需求：純粹標示樓層如 1F~15F，不含 (7A~7D) 等括號選項)
  getBuildingFloors(buildingId) {
    if (this.isNonWardBuilding(buildingId)) {
      return [];
    }

    if (buildingId === 'E01_MAIN') {
      return [
        { tag: '1F', label: '1F', icon: '🏢' },
        { tag: '2F', label: '2F', icon: '🏢' },
        { tag: '3F', label: '3F', icon: '🏢' },
        { tag: '4F', label: '4F', icon: '🏢' },
        { tag: '5F', label: '5F', icon: '🏢' },
        { tag: '6F', label: '6F', icon: '🏢' },
        { tag: '7F', label: '7F', icon: '🏢', featured: true },
        { tag: '8F', label: '8F', icon: '🏢' },
        { tag: '9F', label: '9F', icon: '🏢' },
        { tag: '10F', label: '10F', icon: '🏢' },
        { tag: '11F', label: '11F', icon: '🏢' },
        { tag: '12F', label: '12F', icon: '🏢', featured: true },
        { tag: '13F', label: '13F', icon: '🏢' },
        { tag: '14F', label: '14F', icon: '🏢' },
        { tag: '15F', label: '15F', icon: '🏢' }
      ];
    } else if (buildingId === 'CHILD_HOSPITAL') {
      return [
        { tag: '1F', label: '1F', icon: '🏢' },
        { tag: '2F', label: '2F', icon: '🏢' },
        { tag: '3F', label: '3F', icon: '🏢' },
        { tag: '4F', label: '4F', icon: '🏢' },
        { tag: '5F', label: '5F', icon: '🏢', featured: true },
        { tag: '6F', label: '6F', icon: '🏢' },
        { tag: '7F', label: '7F', icon: '🏢' },
        { tag: '8F', label: '8F', icon: '🏢' },
        { tag: '9F', label: '9F', icon: '🏢' },
        { tag: '10F', label: '10F', icon: '🏢' },
        { tag: '11F', label: '11F', icon: '🏢' },
        { tag: '12F', label: '12F', icon: '🏢' },
        { tag: '13F', label: '13F', icon: '🏢' },
        { tag: '14F', label: '14F', icon: '🏢' }
      ];
    } else if (buildingId === 'W04_WEST') {
      return [
        { tag: '1F', label: '1F', icon: '🏢' },
        { tag: '2F', label: '2F', icon: '🏢', featured: true },
        { tag: '3F', label: '3F', icon: '🏢' },
        { tag: '4F', label: '4F', icon: '🏢' }
      ];
    } else if (buildingId === 'W04_EAST') {
      return [
        { tag: '1F', label: '1F', icon: '🏢' },
        { tag: '2F', label: '2F', icon: '🏢' },
        { tag: '3F', label: '3F', icon: '🏢', featured: true }
      ];
    } else if (buildingId === 'W03_WEST') {
      return [
        { tag: '1F', label: '1F', icon: '🏢', featured: true },
        { tag: '2F', label: '2F', icon: '🏢' }
      ];
    } else if (buildingId === 'W03_EAST') {
      return [
        { tag: '1F', label: '1F', icon: '🏢', featured: true },
        { tag: '2F', label: '2F', icon: '🏢' }
      ];
    } else if (buildingId === 'W02_WEST') {
      return [
        { tag: '1F', label: '1F', icon: '🏢' },
        { tag: '2F', label: '2F', icon: '🏢', featured: true }
      ];
    } else if (buildingId === 'W02_EAST') {
      return [
        { tag: '1F', label: '1F', icon: '🏢' },
        { tag: '2F', label: '2F', icon: '🏢', featured: true }
      ];
    }

    return [
      { tag: '1F', label: '1F', icon: '🏢' },
      { tag: '2F', label: '2F', icon: '🏢' },
      { tag: '3F', label: '3F', icon: '🏢' },
      { tag: '4F', label: '4F', icon: '🏢' }
    ];
  }

  // 點選建築物樓層後「直接下鑽進到該樓層」
  drillDownToFloor(buildingId, floorTarget = '7F') {
    if (this.isNonWardBuilding(buildingId)) {
      const b = this.campusData.buildings.find(item => item.id === buildingId);
      const bName = b ? b.name.split(' (')[0] : '此處';
      this.showToast('本區無病房單位，不呈現平面圖');
      if (this.buildingMeshes[buildingId]) {
        this.buildingMeshes[buildingId].visible = true;
      }
      return;
    }

    const previousBuildingId = this.selectedBuilding;
    if (previousBuildingId && previousBuildingId !== buildingId && this.buildingMeshes[previousBuildingId]) {
      this.buildingMeshes[previousBuildingId].visible = true;
    }

    const b = this.campusData.buildings.find(item => item.id === buildingId);

    if (!b) return;

    this.selectedBuilding = buildingId;

    this.selectedFloor = floorTarget;
    document.getElementById('ward-source-notice')?.remove();

    const hoverCardEl = document.getElementById('building-hover-canvas-card');
    if (hoverCardEl) {
      hoverCardEl.style.display = 'none';
      hoverCardEl.dataset.pinned = 'false';
    }

    const hoverCard = document.getElementById('building-hover-canvas-card');

    if (hoverCard) {

      hoverCard.style.display = 'none';

      hoverCard.dataset.buildingId = '';

    }

    // 顯示頂部 3D/2D 浮動切換列

    const rightPanel = document.getElementById('right-panel');
    rightPanel?.classList.add('panel-collapsed-right');
    document.body.classList.remove('has-right-panel');
    const expandRight = document.getElementById('btn-expand-right');
    if (expandRight) expandRight.style.display = 'none';
    if (window.canvasWhiteboardManager?.wardModal) window.canvasWhiteboardManager.wardModal.style.display = 'none';
    if (this.collapseTimelineBar && window.innerWidth <= 900) this.collapseTimelineBar(true);

    const topSwitcher = document.getElementById('floor-view-switcher-bar');

    if (topSwitcher) topSwitcher.style.display = 'flex'; document.body.classList.add('has-floor-view');

    const btn3d = document.getElementById('switcher-btn-3d');

    const btn2d = document.getElementById('switcher-btn-2d');

    if (btn3d) btn3d.classList.add('active');

    if (btn2d) btn2d.classList.remove('active');

    // 右側面板展開並載入樓層配置

    this.selectBuilding(buildingId, true);

    this.sliceBuildingFloor(buildingId, floorTarget);

    this.focusWardIn3D(buildingId, floorTarget, 'ALL');

    if (this.collapseTimelineBar) this.collapseTimelineBar(true);

    this.showToast(`🚀 已直接下鑽進到【${b.name.split(' (')[0]} ${floorTarget}】：可點選病房或切換 3D/2D 俯瞰圖`);

  }

    selectBuilding(buildingId, openPanel = false) {
    const b = this.campusData.buildings.find(item => item.id === buildingId);
    if (!b) return;

    const previousBuildingId = this.selectedBuilding;
    if (previousBuildingId && previousBuildingId !== buildingId && this.buildingMeshes[previousBuildingId]) {
      this.buildingMeshes[previousBuildingId].visible = true;
    }

    if(buildingId==='W01_LOBBY'){
      this.selectedFloor=null;this.camera.clearViewOffset();
      this.tweenCamera(new THREE.Vector3(b.position.x+14,18,b.position.z+b.dimensions.depth/2+53),new THREE.Vector3(b.position.x,8,b.position.z+b.dimensions.depth/2+1),1000);
      this.showToast('西址歷史大門 · 山牆時鐘與雙柱門廊');
      return;
    }

    if (this.isNonWardBuilding(buildingId)) {
      const bName = b.name.split(' (')[0];
      this.showToast('本區無病房單位，不呈現平面圖');
      return;
    }

    this.selectedBuilding = buildingId;

    const rightPanel = document.getElementById('right-panel');

    const expandRight = document.getElementById('btn-expand-right');

    if (openPanel) {
      document.body.classList.add('has-right-panel');
      rightPanel.style.display = 'flex';

      rightPanel.classList.remove('panel-collapsed-right');

      if (expandRight) expandRight.style.display = 'none';

    }

    document.getElementById('b-detail-name').innerText = b.name;

    document.getElementById('b-detail-badge').innerText = `${b.category} | ${b.floors} 層樓`;

    // 依使用者需求：樓高幾m不是重點，已取消標示

    const hEl = document.getElementById('b-detail-height'); if (hEl) hEl.remove();

    const descEl = document.getElementById('b-detail-desc');

    const floorBtnWrap = document.getElementById('b-floor-buttons');

    floorBtnWrap.innerHTML = '';

    if (descEl) descEl.style.display = 'none';

    // 右側面板樓層選擇：乾淨俐落，與懸浮卡片樓層代碼完全一致，不再重複顯示 (3D/圖) 贅字
    const selectorBox = document.createElement('div');
    selectorBox.style.width = '100%';

    const pillRow = document.createElement('div');
    pillRow.className = 'floor-selector-pill-row';

    const allBtn = document.createElement('button');
    allBtn.className = `btn-floor-tag ${(!this.selectedFloor || this.selectedFloor === 'all') ? 'active' : ''}`;
    allBtn.dataset.floorTag = 'all';
    allBtn.innerText = '🏢 全棟 3D';
    allBtn.onclick = () => {
      pillRow.querySelectorAll('.btn-floor-tag').forEach(btn => btn.classList.remove('active'));
      allBtn.classList.add('active');
      this.selectedFloor = 'all';
      this.selectedWard = 'ALL';
      const step2 = document.getElementById('step-2-ward-wrap'); if (step2) step2.style.display = 'none';
      const step3 = document.getElementById('step-3-mode-wrap'); if (step3) step3.style.display = 'none';
      this.sliceBuildingFloor(buildingId, 'all');
      const rightPanel = document.getElementById('right-panel');
    rightPanel?.classList.add('panel-collapsed-right');
    document.body.classList.remove('has-right-panel');
    const expandRight = document.getElementById('btn-expand-right');
    if (expandRight) expandRight.style.display = 'none';
    if (window.canvasWhiteboardManager?.wardModal) window.canvasWhiteboardManager.wardModal.style.display = 'none';
    if (this.collapseTimelineBar && window.innerWidth <= 900) this.collapseTimelineBar(true);

    const topSwitcher = document.getElementById('floor-view-switcher-bar');
      if (topSwitcher) topSwitcher.style.display = 'none'; document.body.classList.remove('has-floor-view');
    };
    pillRow.appendChild(allBtn);

    const availableFloors = this.getBuildingFloors(buildingId);
    if (availableFloors && availableFloors.length > 0) {
      availableFloors.forEach(f => {
        const btn = document.createElement('button');
        btn.className = `btn-floor-tag ${this.selectedFloor === f.tag ? 'active' : ''}`;
        btn.dataset.floor = f.tag.replace('F', '');
        btn.dataset.floorTag = f.tag;
        btn.innerText = f.label;
        btn.onclick = () => {
          pillRow.querySelectorAll('.btn-floor-tag').forEach(el => el.classList.remove('active'));
          btn.classList.add('active');
          this.selectedFloor = f.tag;
          this.sliceBuildingFloor(buildingId, f.tag);
          this.renderWardWingSelector(buildingId, f.tag);
          const rightPanel = document.getElementById('right-panel');
    rightPanel?.classList.add('panel-collapsed-right');
    document.body.classList.remove('has-right-panel');
    const expandRight = document.getElementById('btn-expand-right');
    if (expandRight) expandRight.style.display = 'none';
    if (window.canvasWhiteboardManager?.wardModal) window.canvasWhiteboardManager.wardModal.style.display = 'none';
    if (this.collapseTimelineBar && window.innerWidth <= 900) this.collapseTimelineBar(true);

    const topSwitcher = document.getElementById('floor-view-switcher-bar');
          if (topSwitcher) topSwitcher.style.display = 'flex'; document.body.classList.add('has-floor-view');
        };
        pillRow.appendChild(btn);
      });
    } else {
      for (let f = 1; f <= b.floors; f++) {
        const fTag = `${f}F`;
        const btn = document.createElement('button');
        btn.className = `btn-floor-tag ${this.selectedFloor === fTag ? 'active' : ''}`;
        btn.dataset.floor = f;
        btn.dataset.floorTag = fTag;
        btn.innerText = fTag;
        btn.onclick = () => {
          pillRow.querySelectorAll('.btn-floor-tag').forEach(el => el.classList.remove('active'));
          btn.classList.add('active');
          this.selectedFloor = fTag;
          this.sliceBuildingFloor(buildingId, fTag);
          this.renderWardWingSelector(buildingId, fTag);
        };
        pillRow.appendChild(btn);
      }
    }
    selectorBox.appendChild(pillRow);

    // 2D 平面圖 / 3D 透視 即時切換列 (點2下進入該樓層，再選擇看平面圖或3D)

    const modeBar = document.createElement('div');

    modeBar.id = 'floor-mode-pill-bar';

    modeBar.className = 'floor-mode-pill-bar';

    modeBar.style.display = 'none';

    modeBar.innerHTML = `

      <button id="btn-view-mode-3d" class="floor-mode-pill-btn active">🏢 3D 鳥瞰透視</button>

      <button id="btn-view-mode-2d" class="floor-mode-pill-btn">🗺️ 平面圖 / 畫布</button>

    `;


    floorBtnWrap.appendChild(selectorBox);

    const btn3D = modeBar.querySelector('#btn-view-mode-3d');

    const btn2D = modeBar.querySelector('#btn-view-mode-2d');

    btn3D.onclick = () => {

      btn3D.classList.add('active');

      btn2D.classList.remove('active');

      if (this.floorSliceGroup) this.floorSliceGroup.visible = true;

      if (this.buildingMeshes[this.selectedBuilding]) this.buildingMeshes[this.selectedBuilding].visible = false;

    };

    btn2D.onclick = () => {

      btn2D.classList.add('active');

      btn3D.classList.remove('active');

      if (window.canvasWhiteboardManager) {

        window.canvasWhiteboardManager.openWardCanvas(this.selectedBuilding, this.selectedFloor);

      }

    };

    if (openPanel) {

      if (buildingId === 'E01_MAIN') {

        this.tweenCamera(

          new THREE.Vector3(b.position.x - 85, 45, b.position.z + 55),

          new THREE.Vector3(b.position.x - 5, 20, b.position.z),

          1000

        );

      } else {

        this.tweenCamera(

          new THREE.Vector3(b.position.x, b.height + 40, b.position.z + 55),

          new THREE.Vector3(b.position.x, b.height / 2, b.position.z),

          1000

        );

      }

    }

    this.sliceBuildingFloor(buildingId, 'all');

  }

  // 樓層立體空間切換 (若為全棟展示巨觀；若為樓層則建構「鳥瞰擬 3D 空間配置圖」與感管動態)

  sliceBuildingFloor(buildingId, floorTarget = 'all') {
    for(const group of [this.floorSliceGroup,this.wardLabelsGroup,this.infectionGroup,this.arcsGroup])if(group)group.visible=true;
    if (typeof buildingId === 'object' && buildingId !== null) {
      buildingId = buildingId.id;
    }
    if (this.isNonWardBuilding(buildingId)) {
      const b = this.campusData.buildings.find(item => item.id === buildingId);
      const bName = b ? b.name.split(' (')[0] : '此處';
      this.showToast('本區無病房單位，不呈現平面圖');
      return;
    }

    this.selectedBuilding = buildingId;

    this.selectedFloor = floorTarget;
    document.getElementById('ward-source-notice')?.remove();

    // 同步更新右側選單樓層按鈕 active 樣式
    document.querySelectorAll('.floor-selector-pill-row .btn-floor-tag').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.floorTag === floorTarget);
    });

    this.floorSliceGroup.clear();

    this.wardLabelsGroup.clear();

    this.infectionGroup.clear();

    this.arcsGroup.clear();

    this.bedMeshes = {};

    this.roomMeshes = {};

    this.selectedRoomCode = null;

    this.pulsingHalos = [];

    this.transferParticles = [];

    const statsWrap = document.getElementById('floor-3d-stats-wrap');

    const casesWrap = document.getElementById('floor-cases-wrap');

    if (floorTarget === 'all') {

      if (this.buildingMeshes[buildingId]) {

        this.buildingMeshes[buildingId].visible = true;

      }

      if (statsWrap) statsWrap.style.display = 'none';

      if (casesWrap) casesWrap.style.display = 'none';

      const mb = document.getElementById('floor-mode-pill-bar'); if (mb) mb.style.display = 'none';

      this.renderWardDirectory(buildingId, 'all');

      return;

    }

    const wardLayout = this.ward3DData[buildingId] ? this.ward3DData[buildingId][floorTarget] : null;
    const fpInfo = this.floorplansData[buildingId] ? this.floorplansData[buildingId][floorTarget] : null;


    if (this.buildingMeshes[buildingId]) {

      this.buildingMeshes[buildingId].visible = false;

    }

    // 建造該樓層之「鳥瞰擬 3D 空間配置圖」

    const mb = document.getElementById('floor-mode-pill-bar'); if (mb) mb.style.display = 'flex';

    this.buildWard3DLayout(buildingId, floorTarget);

    this.renderWardDirectory(buildingId, floorTarget);

    // Floor layouts need the canvas on compact screens, where the controls are floating overlays.
    if (window.innerWidth <= 900) {
      if (this.collapseTimelineBar) this.collapseTimelineBar(true);
      const rightPanel = document.getElementById('right-panel');
      if (rightPanel && !rightPanel.classList.contains('panel-collapsed-right')) {
        document.getElementById('btn-collapse-right')?.click();
      }
    }

  }

  // 建構真實 3D 鳥瞰擬 3D 空間配置 (1.2m 透視矮牆、污物室、清潔間、負壓隔離房、立體病床與建築圖紙底板)

  
  // 動態精確計算樓層病房走廊（依據該樓層實際病室與護理站分佈，杜絕幽靈走廊與病房穿透衝突）
  getFloorCorridors(buildingId, floorTarget, wardLayout) {
    return wardLayout?.displayCorridors || this.getRawFloorCorridors(buildingId, floorTarget, wardLayout);
  }

  getRawFloorCorridors(buildingId, floorTarget, wardLayout) {
    return window.WardPlanGeometry.rawCorridors(buildingId, floorTarget, wardLayout);
  }

  buildWard3DLayout(buildingId, floorTarget) {
    this.syncCampusShadowMode();

    const b = this.campusData.buildings.find(item => item.id === buildingId);

    if (!b) return;

    const floorNum = parseInt(floorTarget.replace('F', ''), 10) || 1;

    const floorY = (floorNum - 1) * 3.6 + (b.campus === 'west' ? 0.2 : 0);

    const w = b.dimensions.width;

    const d = b.dimensions.depth;

    const statsWrap = document.getElementById('floor-3d-stats-wrap');

    const casesWrap = document.getElementById('floor-cases-wrap');

    // statsWrap permanently hidden per user request

    if (casesWrap) casesWrap.style.display = 'block';

    const wardLayout = this.ward3DData[buildingId] ? this.ward3DData[buildingId][floorTarget] : null;
    document.getElementById('ward-source-notice')?.remove();
    for(const group of [this.floorSliceGroup,this.wardLabelsGroup,this.infectionGroup,this.arcsGroup])if(group)group.visible=true;
    if(window.WardPlan2D&&!window.WardPlan2D.hasPlan(buildingId,floorTarget,'ALL')){
      this.showUnavailableWardNotice();
      if(casesWrap)casesWrap.style.display='none';
      return;
    }
    let floorCorridors = this.getFloorCorridors(buildingId, floorTarget, wardLayout);

    // 1. 擬 3D 建築圖紙底板 (若有真實建築平面圖，貼上清晰底圖，使建築線條透視可見)

    const fpInfo = this.floorplansData[buildingId] ? this.floorplansData[buildingId][floorTarget] : null;

    // The slab shares the original campus-building footprint. Geometry is
    // fitted uniformly by WardPlanGeometry before any 2D/3D view is created.
    const slabW=w,slabD=d,slabOffsetX=0,slabOffsetZ=0;
    const validFacilities=(wardLayout?.facilities||[]).filter(fac=>fac.bounds);

    const basePlateGeom = new THREE.PlaneGeometry(slabW * 0.99, slabD * 0.99);

    const basePlateMat = new THREE.MeshStandardMaterial({
      color: 0xcdd7c8,
      roughness: 0.88,
      metalness: 0.02
    });

    const basePlate = new THREE.Mesh(basePlateGeom, basePlateMat);
    basePlate.rotation.x = -Math.PI / 2;
    basePlate.position.set(b.position.x + slabOffsetX, floorY + 0.02, b.position.z + slabOffsetZ);
    basePlate.receiveShadow = false;
    this.floorSliceGroup.add(basePlate);

    // 深色邊框台座
    const slabGeom = new THREE.BoxGeometry(slabW, 0.4, slabD);
    const slabMesh = new THREE.Mesh(slabGeom, new THREE.MeshStandardMaterial({ color: 0x788574, roughness: 0.9 }));
    slabMesh.position.set(b.position.x + slabOffsetX, floorY - 0.2, b.position.z + slabOffsetZ);
    this.floorSliceGroup.add(slabMesh);

    // 2. 若存在專屬 3D 空間配置資料 (如東址 7F、12F、西五棟 5W2、兒醫 5F 等)

    if (wardLayout) {

      let roomCount = 0;

      let bedCount = 0;

      let isoCount = 0;

      const addStationLabel=(point,aboveFloor)=>{
        const text=window.WardPlanLabels.station(point),nb=point.bounds;if(!text||!nb)return;
        const area=window.WardPlanLabels.spaceBox({x:nb.x-nb.width/2,y:nb.z-nb.depth/2,w:nb.width,h:nb.depth});
        const density=Math.min(120,2048/Math.max(area.w,area.h)),canvas=document.createElement('canvas');
        canvas.width=Math.max(1,Math.ceil(area.w*density));canvas.height=Math.max(1,Math.ceil(area.h*density));
        const ctx=canvas.getContext('2d');ctx.fillStyle='#245467';
        window.WardPlanLabels.draw(ctx,text,canvas.width/2,canvas.height/2,canvas.width,canvas.height,1.1*density);
        const label=new THREE.Mesh(new THREE.PlaneGeometry(area.w,area.h),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,depthWrite:false,depthTest:false}));
        label.name='station-label-'+text;label.userData={isNursingLabel:true,ward:point.ward,label:text};label.renderOrder=101;
        label.rotation.x=-Math.PI/2;label.position.set(b.position.x+nb.x,floorY+aboveFloor,b.position.z+nb.z);this.floorSliceGroup.add(label);
      };
      const openStationPoints=new Set(window.WardPlanLabels.openStations(wardLayout,floorCorridors));

      // A. 中央主走廊 (3D 走廊深灰地坪)

      (floorCorridors || []).forEach(corr => {

        const cb = corr.bounds;

        if (!cb) return;

        const cMesh = new THREE.Mesh(

          new THREE.BoxGeometry(cb.width, 0.05, cb.depth),

          new THREE.MeshStandardMaterial({ color: corr.isNursingArea ? 0xd5eeea : corr.isInterWing ? 0xf1e5b9 : 0xf3eacb, roughness: 0.68, metalness: 0.05 })

        );

        cMesh.position.set(b.position.x + cb.x, floorY + 0.05, b.position.z + cb.z);

        this.floorSliceGroup.add(cMesh);
        if(openStationPoints.has(corr))addStationLabel(corr,.11);
        if(corr.connectionLabel){
          const labelCanvas=document.createElement('canvas');labelCanvas.width=160;labelCanvas.height=512;
          const labelCtx=labelCanvas.getContext('2d');labelCtx.fillStyle='#28576e';labelCtx.font='bold 54px "Microsoft JhengHei", sans-serif';labelCtx.textAlign='center';labelCtx.textBaseline='middle';
          (corr.labelLines||['B–C','連','通','道']).forEach((text,i,lines)=>labelCtx.fillText(text,80,48+i*(416/Math.max(1,lines.length-1))));
          const label=new THREE.Mesh(new THREE.PlaneGeometry(cb.width*.86,Math.min(cb.depth*.70,8)),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(labelCanvas),transparent:true,depthWrite:false}));
          label.rotation.x=-Math.PI/2;label.position.set(b.position.x+cb.x,floorY+.10,b.position.z+cb.z);this.floorSliceGroup.add(label);
        }

      });

      // B. 護理站：淡色半透明參考點

      (wardLayout.nursingStations || []).forEach(ns => {
        const loops=ns.outline?[ns.outline]:window.WardPlanGeometry.unionLoops([ns.bounds,...(ns.parts||[])]);
        const shapes=loops.map(loop=>{const shape=new THREE.Shape();loop.forEach((q,i)=>i?shape.lineTo(q.x,-q.z):shape.moveTo(q.x,-q.z));shape.closePath();return shape;});
        const geometry=new THREE.ExtrudeGeometry(shapes,{depth:1.1,bevelEnabled:false,steps:1});geometry.rotateX(-Math.PI/2);
        const nsMesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:new THREE.Color(ns.color||0x0284c7).lerp(new THREE.Color(0xffffff),.7),transparent:true,opacity:.55,depthWrite:false,roughness:.85,metalness:0}));
        // 04E1 already meets the corridor in plan. Align its visible base with
        // the corridor's top surface (.05 centre + .025 half-height), rather
        // than drawing the station below that surface and hiding the joint.
        const stationBase=ns.ward==='04E1'?.075:0;
        nsMesh.name='nursing-station-volume-'+ns.ward;
        nsMesh.position.set(b.position.x,floorY+stationBase,b.position.z);this.floorSliceGroup.add(nsMesh);
        const outline=new THREE.LineSegments(new THREE.EdgesGeometry(geometry),new THREE.LineBasicMaterial({color:0x527d87,transparent:true,opacity:.65,depthWrite:false}));outline.position.copy(nsMesh.position);this.floorSliceGroup.add(outline);
        addStationLabel(ns,1.12+stationBase);
      });

            // C. 特殊設施點 (污物室、清潔間、負壓房)

      (validFacilities || wardLayout.facilities || []).forEach(fac => {

        const fb = fac.bounds;

        if (!fb) return;

        let floorColor = 0xe1e5d7;

        let wallColor = 0x64748b;

        if(fac.type==='anteroom'){floorColor=0xfaf3df;wallColor=0xa89e7d;}
        if(fac.type==='courtyard')floorColor=0xf0f3f4;
        let labelText = (fac.roomName || fac.name || '').replace(/^[A-Za-z0-9-]+\s+(?=[\u4e00-\u9fff])/,'');

        if (fac.category === 'DIRTY_UTILITY') {

          floorColor = 0xfef3c7; // 赭黃色

          wallColor = 0xb45309;

        } else if (fac.category === 'CLEAN_UTILITY') {

          floorColor = 0xd1fae5; // 薄荷綠

          wallColor = 0x059669;

        } else if (fac.category === 'ISOLATION') {

          floorColor = 0xfee2e2; // 警戒粉紅/琥珀

          wallColor = 0xd97706;

          isoCount++;

        }

        // 地坪

        const fPlate = new THREE.Mesh(

          new THREE.BoxGeometry(fb.width * 0.95, 0.08, fb.depth * 0.95),

          new THREE.MeshStandardMaterial({ color: floorColor, roughness: 0.5 })

        );

        fPlate.position.set(b.position.x + fb.x, floorY + 0.06, b.position.z + fb.z);

        this.floorSliceGroup.add(fPlate);

        if(fac.type!=='courtyard'){
        // 1.2m 透視矮牆隔間

        const wGeom = new THREE.BoxGeometry(fb.width, 1.2, fb.depth);

        const wEdges = new THREE.EdgesGeometry(wGeom);

        const wLine = new THREE.LineSegments(wEdges, new THREE.LineBasicMaterial({ color: 0xaab6bc, transparent: true, opacity: .35, depthWrite: false }));

        wLine.position.set(b.position.x + fb.x, floorY + 0.6, b.position.z + fb.z);

        this.floorSliceGroup.add(wLine);

        // 半透明薄牆

        const wallMesh = new THREE.Mesh(

          wGeom,

          new THREE.MeshStandardMaterial({ color: wallColor, transparent: true, opacity: 0.22, roughness: 0.3 })

        );

        wallMesh.position.copy(wLine.position);

        this.floorSliceGroup.add(wallMesh);

        }

        if (labelText && !/護理站/.test(labelText)) {
          const roomObstacles=(wardLayout.rooms||[]).filter(r=>r.bounds).map(r=>({x:r.bounds.x-r.bounds.width/2,y:r.bounds.z-r.bounds.depth/2,w:r.bounds.width,h:r.bounds.depth}));
          const labelBox=window.WardPlanLabels.spaceBox({x:fb.x-fb.width/2,y:fb.z-fb.depth/2,w:fb.width,h:fb.depth},roomObstacles);
          // Match texture and plane aspect ratios so Chinese glyphs are not compressed.
          const density=Math.min(120,2048/Math.max(labelBox.w,labelBox.h));
          const lCanvas = document.createElement('canvas');
          lCanvas.width = Math.max(1,Math.ceil(labelBox.w*density));
          lCanvas.height = Math.max(1,Math.ceil(labelBox.h*density));
          const lctx = lCanvas.getContext('2d');
          lctx.fillStyle = '#102f43';
          window.WardPlanLabels.draw(lctx,labelText,lCanvas.width/2,lCanvas.height/2,lCanvas.width,lCanvas.height,window.WardPlanLabels.spaceFontSize(labelText,density));
          const lMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(labelBox.w,labelBox.h),
            new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(lCanvas),transparent:true,depthWrite:false,depthTest:false})
          );
          lMesh.name='space-label-'+(fac.ward||'')+'-'+labelText;
          lMesh.userData={isSpaceLabel:true,labelText,labelBox};
          lMesh.renderOrder=100;
          lMesh.rotation.x = -Math.PI / 2;
          lMesh.position.set(b.position.x + labelBox.x+labelBox.w/2, floorY + 0.13, b.position.z + labelBox.y+labelBox.h/2);
          this.floorSliceGroup.add(lMesh);
        }

      });

      // D. 一般住院病室 (84間/18間 病室立體矮牆與內部配置)

      (wardLayout.rooms || []).forEach(rm => {

        const rb = rm.bounds;

        if (!rb) return;

        if(!rm.openBay) roomCount++;

        let floorCol = 0xe5e8dc;

        let wallCol = 0x718096;

        if (rm.category === 'ISOLATION') {

          floorCol = 0xfef3c7;

          wallCol = 0xd97706;

          isoCount++;

        }

        // 病室地板

        const rFloor = new THREE.Mesh(

          new THREE.BoxGeometry(rb.width * 0.94, 0.08, rb.depth * 0.94),

          new THREE.MeshStandardMaterial({ color: floorCol, roughness: 0.5 })

        );

        rFloor.position.set(b.position.x + rb.x, floorY + 0.06, b.position.z + rb.z);

        this.floorSliceGroup.add(rFloor);
        for(const q of rm.annexBounds||[]){
          const zone=new THREE.Mesh(new THREE.PlaneGeometry(q.width,q.depth),new THREE.MeshStandardMaterial({color:0xedf2f3,roughness:.9}));
          zone.rotation.x=-Math.PI/2;zone.position.set(b.position.x+q.x,floorY+.125,b.position.z+q.z);this.floorSliceGroup.add(zone);
        }


        // Low walls retain the same room outline, with a real entrance opening.
        const roomWallMaterial=new THREE.MeshStandardMaterial({color:wallCol,transparent:true,opacity:.14,depthWrite:false});
        const doorApi=window.WardRoomDoors;
        const wallParts=doorApi&&!rm.openBay?doorApi.walls(rm):[];
        for(const part of wallParts){
          const geometry=new THREE.BoxGeometry(part.width,1.2,part.depth);
          const wall=new THREE.Mesh(geometry,roomWallMaterial);
          wall.position.set(b.position.x+part.x,floorY+.6,b.position.z+part.z);this.floorSliceGroup.add(wall);
          const edgeMaterial=new THREE.LineBasicMaterial({color:0xaab6bc,transparent:true,opacity:.28,depthWrite:false});
          const edge=new THREE.LineSegments(new THREE.EdgesGeometry(geometry),edgeMaterial);edge.position.copy(wall.position);this.floorSliceGroup.add(edge);
        }
        if(doorApi&&!rm.openBay){
          const door=doorApi.segment(rm);
          const threshold=new THREE.Mesh(new THREE.PlaneGeometry(door.horizontal?door.width:.10,door.horizontal?.10:door.width),new THREE.MeshBasicMaterial({color:0xb7a58b,side:THREE.DoubleSide}));
          threshold.rotation.x=-Math.PI/2;
          threshold.position.set(b.position.x+(door.horizontal?door.center:door.fixed),floorY+.12,b.position.z+(door.horizontal?door.fixed:door.center));
          threshold.name='room-door-'+rm.ward+'-'+rm.roomCode;threshold.userData={isRoomDoor:true,ward:rm.ward,roomCode:rm.roomCode,side:door.side,offset:door.offset,sourceChecked:door.sourceChecked};this.floorSliceGroup.add(threshold);
        }

        const labelBeds=(wardLayout.beds||[]).filter(bed=>bed.ward===rm.ward&&bed.roomCode===rm.roomCode).map(bed=>({x:bed.x-(bed.width||1.8)/2,y:bed.z-(bed.depth||0.9)/2,w:bed.width||1.8,h:bed.depth||0.9}));
        labelBeds.push(...(rm.annexBounds||[]).map(q=>({x:q.x-q.width/2,y:q.z-q.depth/2,w:q.width,h:q.depth})));
        const isServiceSpace=rm.openBay||/DIRTY|CLEAN/i.test(rm.roomCode)||(!rm.bedCount&&!/^\d+$/.test(rm.roomCode));
        const labelArea={x:rb.x-rb.width/2,y:rb.z-rb.depth/2,w:rb.width,h:rb.depth};
        const labelBox=rm.openBay?window.WardPlanLabels.place(labelArea,labelBeds):isServiceSpace?window.WardPlanLabels.spaceBox(labelArea):window.WardPlanLabels.place(labelArea,labelBeds,window.WardPlanLabels.room(rm));
        const roomCanvas = document.createElement('canvas');
        const labelDensity=Math.min(120,2048/Math.max(labelBox.w,labelBox.h));
        roomCanvas.width = Math.max(1,Math.ceil(labelBox.w*labelDensity));
        roomCanvas.height = Math.max(1,Math.ceil(labelBox.h*labelDensity));
        const rctx = roomCanvas.getContext('2d');
        rctx.fillStyle = '#102f43';
        const westFiveSixRoom=buildingId==='W04_WEST'&&/^(?:0?[56]W)/.test(String(rm.ward||''));
        const roomLabelLimit=isServiceSpace ? window.WardPlanLabels.spaceFontSize(window.WardPlanLabels.room(rm),labelDensity) : (westFiveSixRoom ? 0.65 : 0.92)*labelDensity;
        window.WardPlanLabels.draw(rctx,window.WardPlanLabels.room(rm),roomCanvas.width/2,roomCanvas.height/2,roomCanvas.width,roomCanvas.height,roomLabelLimit);
        const rLabelMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(labelBox.w,labelBox.h),
          new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(roomCanvas),transparent:true,depthWrite:false,depthTest:false})
        );
        rLabelMesh.name='room-label-'+rm.ward+'-'+rm.roomCode;
        rLabelMesh.userData={isRoomLabel:true,ward:rm.ward,roomCode:rm.roomCode,labelBox};
        rLabelMesh.renderOrder=100;
        rLabelMesh.rotation.x=-Math.PI/2;
        rLabelMesh.position.set(b.position.x+labelBox.x+labelBox.w/2,floorY+0.16,b.position.z+labelBox.y+labelBox.h/2);
        this.floorSliceGroup.add(rLabelMesh);

      });

      // E. 立體病床：預設東西向；個別來源配置可指定南北向。
      (wardLayout.beds || []).forEach(bed => {
        bedCount++;
        const bedGroup = new THREE.Group();
        const northSouth=bed.axis==='north-south';
        bedGroup.rotation.y=northSouth?Math.PI/2:0;
        bedGroup.position.set(b.position.x + bed.x, floorY + (bed.y || 0.35), b.position.z + bed.z);

        // Bed geometry is created east-west locally, then rotated for north-south beds.
        const bedLen = northSouth ? (bed.depth || 1.8) : (bed.width || 1.8);
        const bedWid = northSouth ? (bed.width || 0.9) : (bed.depth || 0.9);
        const headSign = northSouth ? (bed.headSide === 'north' ? 1 : -1) : (bed.headSide === 'west' ? -1 : 1);
        const frameGeom = new THREE.BoxGeometry(bedLen, 0.22, bedWid);
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x3c819e, roughness: 0.6, metalness: 0.05 });
        const frameMesh = new THREE.Mesh(frameGeom, frameMat);
        bedGroup.add(frameMesh);

        // 床墊 (東西向白石奶霜)
        const matGeom = new THREE.BoxGeometry(bedLen * 0.92, 0.15, bedWid * 0.92);
        const matMesh = new THREE.Mesh(matGeom, new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 }));
        matMesh.position.y = 0.16;
        bedGroup.add(matMesh);

        // 枕頭 (位於東西向西端靠牆 x = -0.55，寬度沿 Z 軸 0.6m，厚度沿 X 軸 0.38m)
        const pillowGeom = new THREE.BoxGeometry(Math.min(0.38, bedLen * 0.21), 0.08, bedWid * 0.65);
        const pillowMesh = new THREE.Mesh(pillowGeom, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }));
        pillowMesh.position.set(headSign * bedLen * 0.32, 0.26, 0);
        bedGroup.add(pillowMesh);

        // 床號標示 (依需求：平貼於東西向床尾床墊上，清楚標示病床床號如 7A06-1，立體無浮空標籤遮蔽)
        const bedLabelCanvas = document.createElement('canvas');
        bedLabelCanvas.width = 140;
        bedLabelCanvas.height = 54;
        const bctx = bedLabelCanvas.getContext('2d');
        bctx.font = 'bold 34px Arial, sans-serif';
        bctx.fillStyle = '#0f172a';
        bctx.textAlign = 'center';
        bctx.textBaseline = 'middle';
        bctx.fillText(bed.bedLabel||bed.bedId.split('-').pop().padStart(2, '0'), 70, 27);

        const bedTex = new THREE.CanvasTexture(bedLabelCanvas);
        const bedNumMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(Math.min(1.15,bedLen*0.64), Math.min(0.40,bedWid*0.5)),
          new THREE.MeshBasicMaterial({ map: bedTex, transparent: true, depthWrite: false })
        );
        bedNumMesh.rotation.x = -Math.PI / 2;
        bedNumMesh.position.set(-headSign * bedLen * 0.12, 0.245, 0);
        bedGroup.add(bedNumMesh);

        // 專屬個案屬性標記群組 (用於正面邊框著色、多重定義疊加框線、彩色點點)
        const indicatorGroup = new THREE.Group();
        indicatorGroup.name = 'indicatorGroup';
        bedGroup.add(indicatorGroup);
        bedGroup.indicatorGroup = indicatorGroup;

        bedGroup.userData = { isBed: true, axis:bed.axis||'east-west', bedId: bed.bedId, roomCode: bed.roomCode, ward: bed.ward, displayLabel: bed.displayLabel, isSchematic: bed.isSchematic, indicatorGroup: indicatorGroup };
        frameMesh.userData = bedGroup.userData;
        matMesh.userData = bedGroup.userData;

        this.floorSliceGroup.add(bedGroup);
        this.interactableObjects.push(frameMesh);
        this.interactableObjects.push(matMesh);
        this.bedMeshes[bed.bedId] = bedGroup;
      });

      // 更新統計數值

      document.getElementById('stat-rooms-count').innerText = `${roomCount} 間`;

      document.getElementById('stat-beds-count').innerText = `${bedCount} 床`+((wardLayout.beds||[]).some(b=>b.clearance)?'（含示意）':'');

      document.getElementById('stat-iso-count').innerText = `${Math.max(1, isoCount)} 間`;

    }

    // 3. 呼叫感管個案動態分布與時間軸轉床歷程計算

    this.updateInfectionVisualization();
    if (this.xrayMode) {
      this.renderXrayDensityMarkers();
    }

    // Use the same bounds-aware camera for floors and individual wards.
    this.focusWardIn3D(buildingId, floorTarget, 'ALL');
  }

  // 繪製 3D 浮空標籤 (Canvas 紋理 Sprite)

  createFloatingLabel(text, colorStr = '#334155', fontSize = 20) {

    const canvas = document.createElement('canvas');

    canvas.width = 180;

    canvas.height = 46;

    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';

    ctx.roundRect(4, 4, 172, 38, 8);

    ctx.fill();

    ctx.lineWidth = 2;

    ctx.strokeStyle = colorStr;

    ctx.stroke();

    ctx.font = `bold ${fontSize}px Arial, "Microsoft JhengHei"`;

    ctx.fillStyle = colorStr;

    ctx.textAlign = 'center';

    ctx.textBaseline = 'middle';

    ctx.fillText(text, 90, 23);

    const texture = new THREE.CanvasTexture(canvas);

    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });

    const sprite = new THREE.Sprite(mat);

    sprite.scale.set(6.0, 1.5, 1.0);

    return sprite;

  }

  // 感管動態空間監測：計算當前日期在當前樓層的個案分布、呼吸光暈與轉床動線飛弧
  // 感管動態空間監測：計算當前日期在當前樓層的個案分布、正面邊框著色、多重定義疊加框線、彩色指示點點與轉床動線飛弧
  updateInfectionVisualization() {
    this.infectionGroup.clear();
    this.arcsGroup.clear();
    this.pulsingHalos = [];
    this.transferParticles = [];

    // 先清除所有病床的正面邊框與彩色標記點點，確保狀態乾淨重繪
    Object.values(this.bedMeshes).forEach(bg => {
      if (bg && bg.indicatorGroup) {
        bg.indicatorGroup.clear();
      }
    });

    const casesListWrap = document.getElementById('floor-cases-list');
    const casesCountLabel = document.getElementById('cases-count-label');
    const timelineCaseBadge = document.getElementById('timeline-case-badge');
    if (casesListWrap) casesListWrap.innerHTML = '';

    const curDate = this.currentDate;
    const activeCases = [];

    // 篩選當前日期活躍的感染管制個案 (徹底排除 NORMAL，絕不顯示巨大干擾看板)
    this.ipcData.cases.forEach(cs => {
      if (!cs || cs.pathogen === 'NORMAL' || cs.pathogen === 'NORMAL_BED') {
        return; // 一般正常住院病患維持乾淨呈現，零視覺干擾
      }

      if (this.currentPathogenFilter !== 'ALL' && cs.pathogen !== this.currentPathogenFilter) {
        return;
      }

      // 檢查個案在 curDate 時位於哪張病床
      let activeMove = null;
      (cs.movement_history || []).forEach(m => {
        if (curDate >= m.start_date && curDate <= m.end_date) {
          activeMove = m;
        }
      });

      if (activeMove && this.bedMeshes[activeMove.bed_id]) {
        activeCases.push({
          caseData: cs,
          activeMove: activeMove,
          bedMesh: this.bedMeshes[activeMove.bed_id]
        });
      }
    });

    if (casesCountLabel) casesCountLabel.innerText = activeCases.length;
    if (timelineCaseBadge) {
      timelineCaseBadge.innerText = `⚠️ 監控中個案：${activeCases.length} 例 (${curDate})`;
    }

    // 遍歷所有處於當前樓層的監控個案
    activeCases.forEach((item, idx) => {
      const cs = item.caseData;
      const bMesh = item.bedMesh;
      if (!bMesh) return;

      // 解析該個案符合的所有個案屬性定義 (Case Definitions)
      const defs = [];

      // 1. 菌種屬性定義 (MDRO Pathogen)
      const pathogenDefs = {
        'CRAB': { hex: 0xef4444, str: '#ef4444', name: 'CRAB (鮑氏不動桿菌)', tag: 'CRAB' },
        'CRE':  { hex: 0xf97316, str: '#f97316', name: 'CRE (抗碳青黴烯腸桿菌)', tag: 'CRE' },
        'VRE':  { hex: 0xa855f7, str: '#a855f7', name: 'VRE (抗萬古黴素腸球菌)', tag: 'VRE' },
        'MRSA': { hex: 0xeab308, str: '#eab308', name: 'MRSA (抗藥性金黃色葡萄球菌)', tag: 'MRSA' }
      };

      if (cs.pathogen && pathogenDefs[cs.pathogen]) {
        defs.push(pathogenDefs[cs.pathogen]);
      }

      // 2. 隔離措施定義 (Isolation Precautions)
      if (cs.isolation_type) {
        if (cs.isolation_type.includes('Contact') || cs.isolation_type.includes('接觸')) {
          defs.push({
            hex: 0xec4899, // 桃紅色
            str: '#ec4899',
            name: '接觸隔離 (Contact Precautions)',
            tag: '接觸隔離'
          });
        } else if (cs.isolation_type.includes('Isolation') || cs.isolation_type.includes('負壓')) {
          defs.push({
            hex: 0x06b6d4, // 亮天藍色
            str: '#06b6d4',
            name: '專責/負壓隔離 (Isolation Room)',
            tag: '負壓隔離'
          });
        }
      }

      // 3. 侵入性管路高風險定義 (Invasive Devices)
      if (cs.device_days) {
        const dItems = [];
        if (cs.device_days.CVC > 0) dItems.push(`CVC(${cs.device_days.CVC}d)`);
        if (cs.device_days.Foley > 0) dItems.push(`Foley(${cs.device_days.Foley}d)`);
        if (cs.device_days.Endotracheal > 0) dItems.push(`Endo(${cs.device_days.Endotracheal}d)`);
        if (dItems.length > 0) {
          defs.push({
            hex: 0x10b981, // 翠綠色
            str: '#10b981',
            name: `侵入性導管留置 (${dItems.join(', ')})`,
            tag: '導管留置'
          });
        }
      }

      // 4. 跨區/轉床動線警示 (Transfer Alert)
      if (cs.movement_history && cs.movement_history.length >= 2) {
        defs.push({
          hex: 0x3b82f6, // 寶藍色
          str: '#3b82f6',
          name: `轉床歷程 (${cs.movement_history.length}次轉床)`,
          tag: '轉床歷程'
        });
      }

      if (defs.length === 0) return;

      const primaryColor = defs[0].hex;

      // ==========================================
      // A. 床正面邊框加顏色 (第 1 種個案定義：外邊框亮色線)
      // ==========================================
      const outerBorderGeom = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.82, 0.24, 0.92));
      const outerBorderMat = new THREE.LineBasicMaterial({
        color: primaryColor,
        linewidth: 3,
        depthTest: true
      });
      const outerBorderLine = new THREE.LineSegments(outerBorderGeom, outerBorderMat);
      if (bMesh.indicatorGroup) bMesh.indicatorGroup.add(outerBorderLine);

      // ==========================================
      // B. 若同時符合 2 種以上個案定義：疊加框線 (Stacked Borders)
      // ==========================================
      if (defs.length >= 2) {
        // 疊加第 2 層邊框線 (床墊頂面同心邊緣，清爽凸顯雙重屬性)
        const innerBorderGeom = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.68, 0.16, 0.84));
        const innerBorderMat = new THREE.LineBasicMaterial({
          color: defs[1].hex,
          linewidth: 2,
          depthTest: true
        });
        const innerBorderLine = new THREE.LineSegments(innerBorderGeom, innerBorderMat);
        innerBorderLine.position.y = 0.16;
        if (bMesh.indicatorGroup) bMesh.indicatorGroup.add(innerBorderLine);
      }

      // 若符合 3 種以上個案定義：正面床欄疊加第 3 層高亮彩條
      if (defs.length >= 3) {
        const railGeom = new THREE.CylinderGeometry(0.02, 0.02, 1.76, 8);
        const railMat = new THREE.MeshBasicMaterial({ color: defs[2].hex });
        const railMesh = new THREE.Mesh(railGeom, railMat);
        railMesh.rotation.z = Math.PI / 2;
        railMesh.position.set(0, 0.22, 0.45);
        if (bMesh.indicatorGroup) bMesh.indicatorGroup.add(railMesh);
      }

      // ==========================================
      // C. 不同顏色標點點 (立體彩色指示圓點排列於床正面)
      // ==========================================
      const dotCount = defs.length;
      const dotSpacing = 0.20;
      const startX = -((dotCount - 1) * dotSpacing) / 2;

      defs.forEach((d, dIdx) => {
        const dotX = startX + dIdx * dotSpacing;

        // 1. 發光彩色圓點
        const dotGeom = new THREE.SphereGeometry(0.075, 16, 16);
        const dotMat = new THREE.MeshBasicMaterial({ color: d.hex });
        const dotMesh = new THREE.Mesh(dotGeom, dotMat);
        dotMesh.position.set(dotX, 0.38, 0.47);
        if (bMesh.indicatorGroup) bMesh.indicatorGroup.add(dotMesh);

        // 2. 深色外圈圓環襯底 (高對比度，在任何光影下清晰可辨)
        const ringGeom = new THREE.RingGeometry(0.075, 0.105, 16);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x0f172a, side: THREE.DoubleSide });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.position.set(dotX, 0.38, 0.469);
        if (bMesh.indicatorGroup) bMesh.indicatorGroup.add(ringMesh);
      });

// 依需求：不需要3D浮空標籤，個案屬性全由床正面邊框、疊加框線與彩色圓點精準標示

      // ==========================================
      // E. 床位周邊呼吸動態微光環
      // ==========================================
      const haloGeom = new THREE.RingGeometry(1.0, 1.45, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: primaryColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65
      });
      const haloMesh = new THREE.Mesh(haloGeom, haloMat);
      haloMesh.rotation.x = -Math.PI / 2;
      haloMesh.position.copy(bMesh.position);
      haloMesh.position.y += 0.05;
      this.infectionGroup.add(haloMesh);
      this.pulsingHalos.push({ mesh: haloMesh, baseScale: 1.0, speed: 2.2 + idx * 0.2 });

      // ==========================================
      // F. 轉床動線飛弧 (Transfer Arc)
      // ==========================================
      const moves = cs.movement_history || [];
      if (moves.length >= 2) {
        for (let i = 0; i < moves.length - 1; i++) {
          const m1 = moves[i];
          const m2 = moves[i + 1];
          const bed1 = this.bedMeshes[m1.bed_id];
          const bed2 = this.bedMeshes[m2.bed_id];
          if (bed1 && bed2) {
            const p1 = bed1.position.clone();
            const p2 = bed2.position.clone();
            const mid = p1.clone().lerp(p2, 0.5);
            mid.y += Math.min(10.0, p1.distanceTo(p2) * 0.35 + 3.0);
            const curve = new THREE.CatmullRomCurve3([p1, mid, p2]);
            const pts = curve.getPoints(50);
            const arcGeom = new THREE.BufferGeometry().setFromPoints(pts);
            const arcMat = new THREE.LineBasicMaterial({
              color: primaryColor,
              transparent: true,
              opacity: 0.75,
              linewidth: 3
            });
            const arcLine = new THREE.Line(arcGeom, arcMat);
            this.arcsGroup.add(arcLine);

            const pGeom = new THREE.SphereGeometry(0.35, 8, 8);
            const pMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const pMesh = new THREE.Mesh(pGeom, pMat);
            this.arcsGroup.add(pMesh);
            this.transferParticles.push({ mesh: pMesh, curve, progress: (idx * 0.2) % 1.0 });
          }
        }
      }

      // ==========================================
      // G. 右側邊欄迷你個案卡片
      // ==========================================
      if (casesListWrap) {
        const card = document.createElement('div');
        card.className = 'case-card-mini';
        const defBadges = defs.map(d => `<span style="display:inline-block;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700;color:#fff;background:${d.str};margin-right:4px;">${d.tag}</span>`).join('');
        card.innerHTML = `
          <div>
            ${defBadges}
            <span style="font-weight:700;margin-left:4px;font-size:12px;">${cs.case_id}</span>
          </div>
          <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">床號：<b>${item.activeMove.bed_id}</b> (${item.activeMove.ward} 護理站)</div>
        `;
        card.onclick = () => {
          this.tweenCamera(
            new THREE.Vector3(bMesh.position.x, bMesh.position.y + 15, bMesh.position.z + 18),
            bMesh.position,
            900
          );
          this.showBedDetailHUD(item.activeMove.bed_id, cs);
        };
        casesListWrap.appendChild(card);
      }
    });

    if (activeCases.length === 0 && casesListWrap) {
      casesListWrap.innerHTML = '<div style="font-size:12px;color:var(--text-muted);padding:8px 4px;">此日期本樓層未發現監控菌種個案。</div>';
    }
  }

  // 顯示病床與個案詳細感管資訊 HUD 卡片 (支援多重個案定義展示)
  showBedDetailHUD(bedId, caseData) {
    const hud = document.getElementById('bed-detail-hud');
    if (!hud) return;

    const bedInfo = this.bedMeshes[bedId]?.userData;
    document.getElementById('hud-bed-id').innerText = `${bedInfo?.displayLabel || bedId} 床位 (東西向)`;
    if (bedInfo?.isSchematic) {
      document.getElementById('hud-pathogen-badge').style.display = 'none';
      document.getElementById('hud-case-id').innerText = '空間示意床位';
      document.getElementById('hud-room-name').innerText = `${bedInfo.ward}${bedInfo.roomCode} 病室`;
      for (const id of ['hud-sample-site','hud-sample-date','hud-iso-type','hud-devices']) document.getElementById(id).innerText = '—';
      document.getElementById('hud-movement-steps').textContent = '此床位用於完整呈現房間配置，沒有連結收住或檢驗資料。';
      hud.style.display = 'flex';
      return;
    }

    if (caseData && caseData.pathogen !== 'NORMAL' && caseData.pathogen !== 'NORMAL_BED') {
      const pBadge = document.getElementById('hud-pathogen-badge');
      pBadge.innerText = caseData.pathogen;
      pBadge.className = `hud-pathogen-tag ${caseData.pathogen.toLowerCase()}`;
      pBadge.style.display = 'inline-block';

      document.getElementById('hud-case-id').innerText = caseData.case_id;
      document.getElementById('hud-room-name').innerText = `${caseData.case_id} 收治病室`;
      document.getElementById('hud-sample-site').innerText = caseData.infection_site || '臨床檢體';
      document.getElementById('hud-sample-date').innerText = caseData.sample_date || '2026-10';
      document.getElementById('hud-iso-type').innerText = caseData.isolation_type || '標準接觸防護措施';

      const dev = caseData.device_days || {};
      document.getElementById('hud-devices').innerText = `CVC: ${dev.CVC || 0}天 / Foley: ${dev.Foley || 0}天 / 氣管內管: ${dev.Endotracheal || 0}天`;

      const stepsWrap = document.getElementById('hud-movement-steps');
      stepsWrap.innerHTML = '';
      (caseData.movement_history || []).forEach(m => {
        const item = document.createElement('div');
        item.className = 'hud-step-item';
        item.innerHTML = `<b>${m.start_date} ~ ${m.end_date}</b>：${m.bed_id} (${m.ward} 護理站)`;
        stepsWrap.appendChild(item);
      });
    } else {
      document.getElementById('hud-pathogen-badge').style.display = 'none';
      document.getElementById('hud-case-id').innerText = '一般住院床位 (無抗藥性或特殊感染)';
      document.getElementById('hud-room-name').innerText = '常規收治病室';
      document.getElementById('hud-sample-site').innerText = '常規檢驗正常';
      document.getElementById('hud-sample-date').innerText = '--';
      document.getElementById('hud-iso-type').innerText = '標準防護';
      document.getElementById('hud-devices').innerText = '無特殊侵入性導管警示';
      document.getElementById('hud-movement-steps').innerHTML = '<div style="font-size:11px;color:var(--text-muted);">該床位尚無跨病室轉移歷程。</div>';
    }

    hud.style.display = 'flex';
  }

  // 左右側邊欄收起 / 展開機制

    renderHoverCardCanvas(buildingId) {

    const canvas = document.getElementById('hover-card-canvas');

    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const w = canvas.width;

    const h = canvas.height;

    // 清空背景 (細緻米茶色底圖)

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = '#fbf7ee';

    ctx.fillRect(0, 0, w, h);

    // 輕量微網格

    ctx.strokeStyle = '#f1e7d8';

    ctx.lineWidth = 1;

    for (let x = 15; x < w; x += 18) {

      ctx.beginPath();

      ctx.moveTo(x, 0);

      ctx.lineTo(x, h);

      ctx.stroke();

    }

    for (let y = 15; y < h; y += 18) {

      ctx.beginPath();

      ctx.moveTo(0, y);

      ctx.lineTo(w, y);

      ctx.stroke();

    }

    if (buildingId === 'E01_MAIN') {

      // 1. 中央貫穿南北的電梯梯廳與垂直管線軸心

      ctx.fillStyle = '#8f654f';

      ctx.fillRect(200, 10, 32, 148);

      // 2. 中央挑高 15 層黑玻璃帷幕中庭 (B棟與C棟之間)

      ctx.fillStyle = 'rgba(20, 22, 26, 0.9)';

      ctx.strokeStyle = '#3a424f';

      ctx.lineWidth = 1;

      ctx.fillRect(36, 73, 168, 20);

      ctx.strokeRect(36, 73, 168, 20);

      // 3. 東址四棟暖黃色二丁掛獨立病房大樓 (A/B/C/D棟：由北向南平行排列)

      const twList = [

        { id: 'A', name: 'A棟 (北外)', sub: '7A/12A 病房棟', x: 24, y: 12, w: 206, h: 26 },

        { id: 'B', name: 'B棟 (北內)', sub: '7B/12B 病房棟', x: 14, y: 44, w: 216, h: 26 },

        { id: 'C', name: 'C棟 (南內)', sub: '7C/12C 病房棟', x: 14, y: 96, w: 216, h: 26 },

        { id: 'D', name: 'D棟 (南外)', sub: '7D/12D 病房棟', x: 24, y: 128, w: 206, h: 26 }

      ];

      twList.forEach(t => {

        // 主體暖黃色二丁掛磚色

        ctx.fillStyle = '#e0a647';

        ctx.strokeStyle = '#a46714';

        ctx.lineWidth = 1.5;

        ctx.fillRect(t.x, t.y, t.w, t.h);

        ctx.strokeRect(t.x, t.y, t.w, t.h);

        // 頂樓階梯退縮層次

        ctx.fillStyle = '#f6cb74';

        ctx.fillRect(t.x + 6, t.y + 5, t.w - 12, t.h - 10);

        // 白色連續窗下樑飾帶

        ctx.fillStyle = '#ffffff';

        ctx.fillRect(t.x + 8, t.y + t.h - 9, t.w - 16, 2);

        // 文字標示

        ctx.fillStyle = '#5c3700';

        ctx.font = 'bold 11px sans-serif';

        ctx.textAlign = 'center';

        ctx.textBaseline = 'top';

        ctx.fillText(t.name, t.x + t.w / 2, t.y + 7);

        ctx.fillStyle = '#7a4b08';

        ctx.font = '9px sans-serif';

        ctx.fillText(t.sub, t.x + t.w / 2, t.y + 22);

      });

      // 3. 頂樓直升機停機坪平台 [H]

      const hx = 148;

      const hy = 58;

      const hw = 44;

      const hh = 44;

      ctx.fillStyle = '#223528';

      ctx.strokeStyle = '#142219';

      ctx.lineWidth = 1.5;

      ctx.fillRect(hx - hw / 2, hy - hh / 2, hw, hh);

      ctx.strokeRect(hx - hw / 2, hy - hh / 2, hw, hh);

      // 黃色導引同心圓

      ctx.beginPath();

      ctx.arc(hx, hy, 16, 0, Math.PI * 2);

      ctx.strokeStyle = '#f5b041';

      ctx.lineWidth = 2;

      ctx.stroke();

      // 白色 H

      ctx.fillStyle = '#ffffff';

      ctx.font = 'bold 16px sans-serif';

      ctx.textAlign = 'center';

      ctx.textBaseline = 'middle';

      ctx.fillText('H', hx, hy - 1);

      // 停機坪標籤小字

      ctx.fillStyle = '#e2e8f0';

      ctx.font = 'bold 7px sans-serif';

      ctx.fillText('停機坪', hx, hy + 13);

      // 4. 西側迎賓大門雨遮

      ctx.fillStyle = 'rgba(90, 148, 168, 0.85)';

      ctx.strokeStyle = '#36647e';

      ctx.lineWidth = 1;

      ctx.beginPath();

      ctx.arc(14, 58, 12, -Math.PI / 2, Math.PI / 2);

      ctx.closePath();

      ctx.fill();

      ctx.stroke();

    } else if (buildingId === 'W01_LOBBY') {

      // 常德街西址大門、綠銅穹頂與愛奧尼克門廊

      ctx.fillStyle = '#c77960';

      ctx.strokeStyle = '#946b5e';

      ctx.lineWidth = 1.5;

      ctx.fillRect(38, 28, 220, 60);

      ctx.strokeRect(38, 28, 220, 60);

      // 中央綠銅穹頂

      ctx.beginPath();

      ctx.arc(148, 58, 24, 0, Math.PI * 2);

      ctx.fillStyle = '#4a927a';

      ctx.fill();

      ctx.strokeStyle = '#275848';

      ctx.lineWidth = 2;

      ctx.stroke();

      ctx.fillStyle = '#ffffff';

      ctx.font = 'bold 11px sans-serif';

      ctx.textAlign = 'center';

      ctx.textBaseline = 'middle';

      ctx.fillText('🏛️ 百年綠銅穹頂大廳', 148, 58);

    } else if (buildingId === 'CHILD_HOSPITAL') {

      // 兒醫大樓

      ctx.fillStyle = '#d6a27e';

      ctx.strokeStyle = '#a88068';

      ctx.lineWidth = 1.5;

      ctx.fillRect(48, 20, 200, 76);

      ctx.strokeRect(48, 20, 200, 76);

      // 鮮黃倒 V 鋼構門廳

      ctx.fillStyle = '#f5b041';

      ctx.fillRect(118, 54, 60, 42);

      ctx.fillStyle = '#78350f';

      ctx.font = 'bold 11px sans-serif';

      ctx.textAlign = 'center';

      ctx.textBaseline = 'middle';

      ctx.fillText('鮮黃倒 V 挑空門廳', 148, 75);

    } else {

      // 通用簡圖

      ctx.fillStyle = '#64748b';

      ctx.strokeStyle = '#334155';

      ctx.lineWidth = 1.5;

      ctx.fillRect(48, 24, 200, 68);

      ctx.strokeRect(48, 24, 200, 68);

      ctx.fillStyle = '#ffffff';

      ctx.font = 'bold 12px sans-serif';

      ctx.textAlign = 'center';

      ctx.textBaseline = 'middle';

      ctx.fillText('醫療設施配置鳥瞰圖', 148, 58);

    }

  }

  initPanelToggles() {

    const leftPanel = document.getElementById('left-panel');

    const rightPanel = document.getElementById('right-panel');

    const btnCollapseLeft = document.getElementById('btn-collapse-left');

    const btnExpandLeft = document.getElementById('btn-expand-left');

    const btnCollapseRight = document.getElementById('btn-collapse-right');

    const btnExpandRight = document.getElementById('btn-expand-right');

    if (btnCollapseLeft && leftPanel) {

      btnCollapseLeft.onclick = () => {

        leftPanel.classList.add('panel-collapsed-left');

        if (btnExpandLeft) btnExpandLeft.style.display = 'block';

      };

    }

    if (btnExpandLeft && leftPanel) {

      btnExpandLeft.onclick = () => {

        leftPanel.classList.remove('panel-collapsed-left');

        btnExpandLeft.style.display = 'none';

      };

    }

    if (btnCollapseRight && rightPanel) {

      btnCollapseRight.onclick = () => {
        document.body.classList.remove('has-right-panel');
        rightPanel.classList.add('panel-collapsed-right');
        if (this.selectedFloor && this.selectedFloor !== 'all') this.focusWardIn3D(this.selectedBuilding,this.selectedFloor,this.selectedWard || 'ALL');
        else this.updateWardViewport();

        if (btnExpandRight) btnExpandRight.style.display = 'block';

      };

    }

        // 依使用者需求：即時小地圖要能收起與展開

    const btnToggleMinimap = document.getElementById('btn-toggle-minimap');

    const minimapHeader = document.getElementById('minimap-header');

    const minimapContainer = document.getElementById('minimap-container');

    const toggleMinimapFn = (e) => {

      if (e) e.stopPropagation();

      if (!minimapContainer) return;

      minimapContainer.classList.toggle('collapsed');

      const isCollapsed = minimapContainer.classList.contains('collapsed');

      if (btnToggleMinimap) btnToggleMinimap.innerText = isCollapsed ? '展開 ▴' : '收起 ▾';

    };

    if (btnToggleMinimap) btnToggleMinimap.onclick = toggleMinimapFn;

    if (minimapHeader) minimapHeader.onclick = toggleMinimapFn;

    if (btnExpandRight && rightPanel) {

      btnExpandRight.onclick = () => {
        document.body.classList.add('has-right-panel');
        rightPanel.classList.remove('panel-collapsed-right');
        if (this.selectedFloor && this.selectedFloor !== 'all') this.focusWardIn3D(this.selectedBuilding,this.selectedFloor,this.selectedWard || 'ALL');
        else this.updateWardViewport();

        btnExpandRight.style.display = 'none';

      };

    }

    // 樓層與病房 2D 畫布彈窗按鈕

    const btnOpenWardCanvas = document.getElementById('btn-open-ward-canvas');

    if (btnOpenWardCanvas) {

      btnOpenWardCanvas.onclick = () => {

        if (window.canvasWhiteboardManager) {

          window.canvasWhiteboardManager.openWardCanvas(this.selectedBuilding, this.selectedFloor);

        }

      };

    }

    // 3D 病房標籤切換按鈕

    const btnToggleWardLabels = document.getElementById('btn-toggle-ward-labels');

    if (btnToggleWardLabels) {

      btnToggleWardLabels.onclick = () => {

        if (this.wardLabelsGroup) {

          this.wardLabelsGroup.visible = !this.wardLabelsGroup.visible;

          btnToggleWardLabels.style.background = this.wardLabelsGroup.visible ? '#e0f2fe' : '#ffffff';

          btnToggleWardLabels.style.borderColor = this.wardLabelsGroup.visible ? '#0284c7' : 'var(--border-color)';

        }

      };

    }

    const btnCloseHud = document.getElementById('btn-close-hud');

    if (btnCloseHud) {

      btnCloseHud.onclick = () => {

        const hud = document.getElementById('bed-detail-hud');

        if (hud) hud.style.display = 'none';

      };

    }

  }

  // 感管動態時間軸控制項 (播放/暫停、日期滑桿、菌種過濾)

  initTimelineControls() {

    const bar = document.getElementById('ipc-timeline-bar');

    const btnToggle = document.getElementById('btn-toggle-timeline');

    const toggleText = document.getElementById('timeline-toggle-text');

    const slider = document.getElementById('timeline-slider');

    const dateDisplay = document.getElementById('timeline-date-display');

    const btnPlay = document.getElementById('btn-timeline-play');

    let autoCollapseTimeout = null;

    const setCollapsed = (collapsed) => {

      if (!bar) return;

      if (collapsed) {

        bar.classList.add('collapsed');

        if (toggleText) toggleText.innerText = '展開 ▴';

      } else {

        bar.classList.remove('collapsed');

        if (toggleText) toggleText.innerText = '收起 ▾';

      }

    };

    this.collapseTimelineBar = setCollapsed;

    // 手動收合/展開按鈕切換

    if (btnToggle) {

      btnToggle.onclick = (e) => {

        e.stopPropagation();

        const isCurrentlyCollapsed = bar.classList.contains('collapsed');

        setCollapsed(!isCurrentlyCollapsed);

      };

    }

    // 點擊折疊膠囊本體展開

    if (bar) {

      bar.addEventListener('click', (e) => {

        if (bar.classList.contains('collapsed')) {

          setCollapsed(false);

        }

      });

      // 滑鼠靠近自動展開

      bar.addEventListener('mouseenter', () => {

        if (autoCollapseTimeout) {

          clearTimeout(autoCollapseTimeout);

          autoCollapseTimeout = null;

        }

        setCollapsed(false);

      });

      // 滑鼠離開後 2.5 秒若未播放則「自動收合」

      bar.addEventListener('mouseleave', () => {

        if (this.isPlayingTimeline) return;

        if (autoCollapseTimeout) clearTimeout(autoCollapseTimeout);

        autoCollapseTimeout = setTimeout(() => {

          if (!this.isPlayingTimeline) {

            setCollapsed(true);

          }

        }, 2500);

      });

    }

    const updateDate = (dayNum) => {

      const dayStr = String(dayNum).padStart(2, '0');

      this.currentDate = `2026-10-${dayStr}`;

      if (dateDisplay) dateDisplay.innerText = `📅 2026-10-${dayStr}`;

      this.updateInfectionVisualization();
    if (this.xrayMode) {
      this.renderXrayDensityMarkers();
    }

    };

    if (slider) {

      slider.addEventListener('input', (e) => {

        updateDate(e.target.value);

      });

    }

    if (btnPlay) {

      btnPlay.onclick = () => {

        this.isPlayingTimeline = !this.isPlayingTimeline;

        if (this.isPlayingTimeline) {

          btnPlay.innerHTML = '⏸ 暫停動線';

          btnPlay.style.background = '#d97706';

          this.timelineInterval = setInterval(() => {

            let nextVal = parseInt(slider.value, 10) + 1;

            if (nextVal > 31) nextVal = 1;

            slider.value = nextVal;

            updateDate(nextVal);

          }, 1400);

        } else {

          btnPlay.innerHTML = '▶ 播放動線';

          btnPlay.style.background = 'var(--color-success)';

          clearInterval(this.timelineInterval);

        }

      };

    }

    // 菌種過濾按鈕

    document.querySelectorAll('.pathogen-pill').forEach(btn => {

      btn.onclick = () => {

        document.querySelectorAll('.pathogen-pill').forEach(b => b.classList.remove('active'));

        btn.classList.add('active');

        this.currentPathogenFilter = btn.getAttribute('data-pathogen');

        this.updateInfectionVisualization();
    if (this.xrayMode) {
      this.renderXrayDensityMarkers();
    }

        this.showToast(`已切換感管菌種過濾：【${this.currentPathogenFilter}】`);

      };

    });

  }

  // 原始建築平面圖檢視區 (維持高清圖面核對)

  renderFloorPlan(buildingId, floorTarget, subIndex = 0) {

    const titleEl = document.getElementById('fp-title');

    const pdfLinkEl = document.getElementById('fp-pdf-link');

    const subTabsEl = document.getElementById('fp-sub-tabs');

    const imgEl = document.getElementById('fp-image-preview');

    const summaryEl = document.getElementById('fp-summary');

    if (!titleEl || !imgEl) return;

    const b = this.campusData.buildings.find(item => item.id === buildingId);

    const bPlans = this.floorplansData[buildingId];

    if (!bPlans) {

      titleEl.innerText = `${b ? b.name : '建物'} 平面配置`;

      pdfLinkEl.style.display = 'none';

      subTabsEl.style.display = 'none';

      imgEl.src = '';

      imgEl.alt = '此建物暫無建築平面圖';

      summaryEl.innerText = `${b ? b.description : '該建物主要為行政、門診或非住院空間。'}`;

      return;

    }

    if (floorTarget === 'all') {

      const availableFloors = Object.keys(bPlans);

      const firstFp = bPlans[availableFloors[0]];

      titleEl.innerText = `🏢 ${b.name} 各樓層建築平面圖`;

      pdfLinkEl.href = firstFp.pdf;

      pdfLinkEl.style.display = 'inline-flex';

      subTabsEl.innerHTML = '';

      subTabsEl.style.display = 'flex';

      availableFloors.forEach(f => {

        const btn = document.createElement('button');

        btn.className = 'sub-tab-btn';

        btn.innerText = `🗺️ ${f}`;

        btn.onclick = () => {

          this.sliceBuildingFloor(buildingId, f);

        };

        subTabsEl.appendChild(btn);

      });

      imgEl.src = firstFp.image;

      this.currentModalData = { image: firstFp.image, title: firstFp.title, pdf: firstFp.pdf };

      summaryEl.innerHTML = `<b>建物樓層概況</b>：全棟包含 ${availableFloors.join('、')} 等樓層。點選上方樓層標籤可直接立體剖切並載入鳥瞰擬 3D 隔間。`;

      return;

    }

    const fp = bPlans[floorTarget];

    if (!fp) {

      titleEl.innerText = `${b.name} ${floorTarget} 平面圖`;

      pdfLinkEl.style.display = 'none';

      subTabsEl.style.display = 'none';

      imgEl.src = '';

      imgEl.alt = '該樓層暫無平面圖';

      summaryEl.innerText = `該樓層主要為行政、公用設施或醫事檢查專區。`;

      return;

    }

    let activePlan = fp;

    if (fp.subPlans && fp.subPlans.length > 0) {

      subTabsEl.style.display = 'flex';

      subTabsEl.innerHTML = '';

      const safeIdx = Math.min(subIndex, fp.subPlans.length - 1);

      activePlan = fp.subPlans[safeIdx];

      fp.subPlans.forEach((sub, idx) => {

        const btn = document.createElement('button');

        btn.className = `sub-tab-btn ${idx === safeIdx ? 'active' : ''}`;

        btn.innerText = sub.name;

        btn.onclick = () => {

          this.renderFloorPlan(buildingId, floorTarget, idx);

        };

        subTabsEl.appendChild(btn);

      });

    } else {

      subTabsEl.style.display = 'none';

    }

    titleEl.innerText = activePlan.title || `${b.name} ${floorTarget} 平面圖`;

    pdfLinkEl.href = activePlan.pdf;

    pdfLinkEl.style.display = 'inline-flex';

    imgEl.src = activePlan.image;

    this.currentModalData = {

      image: activePlan.image,

      title: activePlan.title || `${b.name} ${floorTarget} 平面圖`,

      pdf: activePlan.pdf

    };

    summaryEl.innerHTML = `

      <div style="font-weight:700;margin-bottom:3px;color:var(--text-primary);">${activePlan.title || fp.title}</div>

      <div style="font-size:12px;color:var(--text-secondary);">${fp.summary || ''}</div>

      ${fp.wards ? `<div style="font-size:12px;color:var(--color-primary);margin-top:4px;"><b>所屬護理站</b>：${fp.wards.join('、')}</div>` : ''}

    `;

  }

  // 全螢幕高解析平面圖檢視彈窗 (Modal Viewer)

  initModalViewer() {

    const modal = document.getElementById('floorplan-modal');

    const modalImg = document.getElementById('modal-image');

    const modalTitle = document.getElementById('modal-title');

    const modalPdf = document.getElementById('modal-pdf-link');

    const modalBody = document.getElementById('modal-body');

    if (!modal) return;

    const openModal = () => {

      if (!this.currentModalData || !this.currentModalData.image) return;

      modalTitle.innerText = this.currentModalData.title || '樓層建築平面圖';

      modalImg.src = this.currentModalData.image;

      modalPdf.href = this.currentModalData.pdf || '#';

      this.modalZoom = 1.0;

      this.modalPan = { x: 0, y: 0 };

      modalImg.style.transform = `scale(1) translate(0px, 0px)`;

      modal.style.display = 'flex';

    };

    const closeModal = () => {

      modal.style.display = 'none';

    };

    const updateTransform = () => {

      modalImg.style.transform = `scale(${this.modalZoom}) translate(${this.modalPan.x}px, ${this.modalPan.y}px)`;

    };

    const previewWrap = document.getElementById('fp-canvas-container');

    if (previewWrap) {

      previewWrap.onclick = openModal;

    }

    const closeBtn = document.getElementById('modal-close');

    if (closeBtn) closeBtn.onclick = closeModal;

    modal.onclick = (e) => {

      if (e.target === modal) closeModal();

    };

    window.addEventListener('keydown', (e) => {

      if (e.key === 'Escape') closeModal();

    });

    document.getElementById('modal-zoom-in')?.addEventListener('click', () => {

      this.modalZoom = Math.min(3.5, this.modalZoom + 0.25);

      updateTransform();

    });

    document.getElementById('modal-zoom-out')?.addEventListener('click', () => {

      this.modalZoom = Math.max(0.5, this.modalZoom - 0.25);

      updateTransform();

    });

    document.getElementById('modal-zoom-reset')?.addEventListener('click', () => {

      this.modalZoom = 1.0;

      this.modalPan = { x: 0, y: 0 };

      updateTransform();

    });

    modalBody?.addEventListener('wheel', (e) => {

      e.preventDefault();

      const zoomDelta = e.deltaY > 0 ? -0.15 : 0.15;

      this.modalZoom = Math.min(4.0, Math.max(0.4, this.modalZoom + zoomDelta));

      updateTransform();

    }, { passive: false });

    modalBody?.addEventListener('mousedown', (e) => {

      if (e.target === modalImg || e.target === modalBody) {

        this.isPanningModal = true;

        this.panStart = { x: e.clientX - this.modalPan.x, y: e.clientY - this.modalPan.y };

      }

    });

    window.addEventListener('mousemove', (e) => {

      if (this.isPanningModal) {

        this.modalPan.x = e.clientX - this.panStart.x;

        this.modalPan.y = e.clientY - this.panStart.y;

        updateTransform();

      }

    });

    window.addEventListener('mouseup', () => {

      this.isPanningModal = false;

    });

  }

  initControllers() {
    // Floor plans use the orbit controls only; no walking controller is registered.
  }

  tweenCamera(targetPos, targetLookAt, duration = 1000) {
    this.cameraPositionTween?.stop();
    this.cameraTargetTween?.stop();
    this.camera.clearViewOffset();

    this.cameraPositionTween = new TWEEN.Tween(this.camera.position)

      .to(targetPos, duration)

      .easing(TWEEN.Easing.Cubic.Out)

      .start();

    this.cameraTargetTween = new TWEEN.Tween(this.controls.target)

      .to(targetLookAt, duration)

      .easing(TWEEN.Easing.Cubic.Out)

      .onUpdate(() => this.controls.update())

      .start();

  }

  setMode() {
    this.mode = 'orbit';
    this.controls.enabled = true;
    this.tweenCamera(new THREE.Vector3(15, 86, 215), new THREE.Vector3(36, 22, 18), 1200);
    this.showToast('已切換為【3D 全區鳥瞰模式】');
  }

  initUI() {

    document.getElementById('btn-campus-west')?.addEventListener('click', () => this.switchCampusView('west'));

    document.getElementById('btn-campus-east')?.addEventListener('click', () => this.switchCampusView('east'));

    document.getElementById('btn-campus-children')?.addEventListener('click', () => this.switchCampusView('children'));

    document.getElementById('btn-campus-all')?.addEventListener('click', () => this.switchCampusView('all'));

    document.getElementById('btn-mode-orbit').addEventListener('click', () => {

      this.updateActiveBtn('btn-mode-orbit');

      this.setMode('orbit');

    });

    const btnXray = document.getElementById('btn-toggle-xray');
    if (btnXray) {
      btnXray.addEventListener('click', () => this.toggleXrayMode());
    }

    document.getElementById('btn-reset-view').addEventListener('click', () => {

      this.sliceBuildingFloor(this.selectedBuilding, 'all');

      this.setMode('orbit');

      this.switchCampusView('all');

    });

        let pointerDownScreenPos = { x: 0, y: 0 };

    this.isViewDragging = false;

    this.container.addEventListener('pointerdown', (e) => {

      pointerDownScreenPos = { x: e.clientX, y: e.clientY };

      this.isViewDragging = false;

      if (this.mouseDragMode === 'pan' && this.currentMode === 'orbit') {
        this.container.style.cursor = 'grabbing';
      }

    });

    this.container.addEventListener('pointermove', (e) => {

      if (e.buttons > 0) {

        if (Math.hypot(e.clientX - pointerDownScreenPos.x, e.clientY - pointerDownScreenPos.y) > 6) {

          this.isViewDragging = true;

        }

      }

    });

    this.container.addEventListener('pointerup', (e) => {

      if (this.mouseDragMode === 'pan' && this.currentMode === 'orbit') {
        this.container.style.cursor = 'grab';
      }

      if (this.isViewDragging) {

        // 使用者正在拖曳旋轉/平移 3D 視角，絕對不誤觸選取建物或彈出選單！

        return;

      }

      // 單純點擊 (原地放開，未拖曳)：

      this.onPointerClick(e);

    });

    this.initSearch();

    this.filterBuildingList('all');

  }

  updateActiveBtn(activeId) {

    ['btn-mode-orbit'].forEach(id => {

      const el = document.getElementById(id);

      if (el) el.classList.toggle('active', id === activeId);

    });

  }

  initSearch() {

    const input = document.getElementById('search-input');

    const dropdown = document.getElementById('search-dropdown');

    input.addEventListener('input', (e) => {

      const val = e.target.value.trim().toUpperCase();

      if (!val) {

        dropdown.style.display = 'none';

        return;

      }

      dropdown.innerHTML = '';

      const matches = [];
      const normalizeWard = value => String(value || '').toUpperCase().replace(/^0+(?=\d)/, '');
      const wardCodes = [...val.matchAll(/\d{1,2}[A-Z]{1,2}\d{0,2}/g)]
        .map(match => normalizeWard(match[0]))
        .filter(code => !/^\d{1,2}F\d*$/.test(code));
      const requestedCampus = /兒醫/.test(val) ? 'children' : /東址/.test(val) ? 'east' : /西址/.test(val) ? 'west' : null;
      const planQuery = val.replace(/東址|西址|兒醫|大樓?/g, '').trim();

      const nonWardSearchIds = ['JINGFU_GATE', 'W01_LOBBY', 'W_CORRIDOR', 'W01_SPINE', 'JINGFU_TUNNEL', 'W01_WEST', 'W01_EAST'];

      this.campusData.buildings.forEach(b => {

        if (nonWardSearchIds.includes(b.id)) return;

        if (b.name.toUpperCase().includes(val) || b.code.toUpperCase().includes(val) || b.category.toUpperCase().includes(val)) {

          matches.push({ type: '建物', title: b.name, id: b.id, isBuilding: true });

        }

      });

      // Search each building's ward layout so a ward code opens that ward
      // directly across East, West, and the Children's Hospital.
      if (wardCodes.length) {
        this.campusData.buildings.forEach(b => {
          if (requestedCampus && b.campus !== requestedCampus) return;
          const bName = b.name.split(' (')[0];
          Object.entries(this.ward3DData[b.id] || {}).forEach(([floor, layout]) => {
            const wards = new Set([
              ...(layout.rooms || []).map(room => room.ward),
              ...Object.keys(layout.sourceTraceWards || {}),
              ...(layout.nursingStations || []).map(station => station.ward)
            ].filter(Boolean));
            wards.forEach(ward => {
              if (!wardCodes.includes(normalizeWard(ward))) return;
              matches.push({
                type: '病房區', title: `${bName} ${ward} 病房區 (${floor})`,
                buildingId: b.id, floor, ward, isWard: true
              });
            });
          });
        });
      }

      Object.keys(this.floorplansData).forEach(bId => {

        const bPlans = this.floorplansData[bId];

        const b = this.campusData.buildings.find(item => item.id === bId);

        const bName = b ? b.name.split(' (')[0] : bId;

        Object.keys(bPlans).forEach(fTag => {

          const fp = bPlans[fTag];

          const hasWardMatch = !wardCodes.length && fp.wards && fp.wards.some(w => w.toUpperCase().includes(val));

          const hasTitleMatch = fp.title.toUpperCase().includes(planQuery || val);

          const hasSummaryMatch = fp.summary && fp.summary.toUpperCase().includes(planQuery || val);

          const hasFloorMatch = fTag.toUpperCase().includes(planQuery || val);

          if (hasWardMatch || hasTitleMatch || hasSummaryMatch || hasFloorMatch) {

            matches.push({

              type: '平面圖',

              title: `${bName} ${fTag} (${fp.wards ? fp.wards.join('/') : ''})`,

              buildingId: bId,

              floor: fTag

            });

          }

        });

      });

      if (matches.length > 0) {

        matches.slice(0, 8).forEach(m => {

          const item = document.createElement('div');

          item.className = 'search-item';

          const title = document.createElement('span');
          title.textContent = m.title;
          const type = document.createElement('span');
          type.textContent = m.type;
          type.style.cssText = 'font-size:11px;color:#9e4635;font-weight:700;';
          item.append(title, type);

          item.onclick = () => {

            dropdown.style.display = 'none';

            input.value = m.title.split(' (')[0];

            if (m.isBuilding) {
              this.selectedWard = 'ALL';
              this.selectBuilding(m.id, true);

            } else {

              this.selectedWard = m.ward || 'ALL';
              this.drillDownToFloor(m.buildingId, m.floor);
              this.renderWardWingSelector(m.buildingId, m.floor);
              this.focusWardIn3D(m.buildingId, m.floor, this.selectedWard);
              if (!m.isWard) this.showToast(`已切換至 ${m.floor} 鳥瞰擬 3D 配置圖：${m.title}`);

            }

          };

          dropdown.appendChild(item);

        });

        dropdown.style.display = 'block';

      } else {

        dropdown.style.display = 'none';

      }

    });

    document.addEventListener('click', (e) => {

      if (!e.target.closest('.search-container')) {

        dropdown.style.display = 'none';

      }

    });

  }

    onPointerClick(event) {

    const rect = this.container.getBoundingClientRect();

    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;

    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const allTargets = [...this.buildingsGroup.children, ...this.floorSliceGroup.children];

    const targetsIntersects = this.raycaster.intersectObjects(allTargets, true);

    if (targetsIntersects.length > 0) {

      const hit = targetsIntersects[0].object;

      const data = hit.userData || (hit.parent ? hit.parent.userData : null);

      if (data && data.isRoom) {

        this.selectWardRoom(data.roomCode);

        return;

      }

      if (data && data.isBed) {

        const curDate = this.currentDate;

        let matchedCase = null;

        this.ipcData.cases.forEach(cs => {

          (cs.movement_history || []).forEach(m => {

            if (m.bed_id === data.bedId && curDate >= m.start_date && curDate <= m.end_date) {

              matchedCase = cs;

            }

          });

        });

        this.showBedDetailHUD(data.bedId, matchedCase);

        this.showToast(`已選取病床：${data.bedId} (點選查看空間感管動線)`);

        return;

      }

      let bId = null;
      let curr = hit;
      while (curr && curr !== this.scene) {
        if (curr.userData && (curr.userData.buildingId || curr.userData.id)) {
          bId = curr.userData.buildingId || curr.userData.id;
          break;
        }
        curr = curr.parent;
      }

      if (bId) {
        const b = this.campusData.buildings.find(item => item.id === bId);
        const bName = b ? b.name.split(' (')[0] : '此處';

        if(bId==='W01_LOBBY'){this.selectBuilding(bId,false);return;}
        if (this.isNonWardBuilding(bId)) {
          this.showToast('本區無病房單位，不呈現平面圖');
          if (this.buildingMeshes[bId]) this.buildingMeshes[bId].visible = true;
          return;
        }

        if (this.selectedFloor && this.selectedFloor !== 'all') {
          return;
        }

        this.selectBuilding(bId, true);
        if (b) {
          this.pinFloorCardForBuilding(b, event.clientX, event.clientY);
          this.showToast(`已選取【${bName}】：請點選樓層按鈕進入平面圖，或直接雙擊建築物`);
        }
        return;
      }

      if (data && data.isBuilding) {
        if(data.buildingId==='W01_LOBBY'){this.selectBuilding(data.buildingId,false);return;}
        if (this.selectedFloor && this.selectedFloor !== 'all') {
          return;
        }
        const b = this.campusData.buildings.find(item => item.id === data.buildingId);
        const bName = b ? b.name.split(' (')[0] : '此處';

        if (this.isNonWardBuilding(data.buildingId)) {
          this.showToast('本區無病房單位，不呈現平面圖');
          return;
        }

        // 單純點擊建物：僅選取並顯示輕量化資訊卡，絕對不強制彈出右側大選單干擾！
        this.selectBuilding(data.buildingId, false);
        if (b) {
          this.showToast(`已選取【${bName}】(雙擊進入樓層或點右側標籤展開)`);
        }
      }

    }

  }

  showToast(msg) {
    const t = document.getElementById('toast-msg');
    if (!t) return;
    if (this._toastTimer) clearTimeout(this._toastTimer);
    t.innerText = msg;
    t.classList.add('show');
    this._toastTimer = setTimeout(() => {
      t.classList.remove('show');
      this._toastTimer = null;
    }, 3200);
  }

  onWindowResize() {

    const w = this.container.clientWidth;

    const h = this.container.clientHeight;

    this.camera.aspect = w / h;

    this.camera.updateProjectionMatrix();

    this.renderer.setSize(w, h);

    if (this.selectedFloor && this.selectedFloor !== 'all') this.focusWardIn3D(this.selectedBuilding,this.selectedFloor,this.selectedWard || 'ALL');
    else this.updateWardViewport();

  }

  syncCampusShadowMode() {
    const mode=this.xrayMode?'xray':this.selectedFloor&&this.selectedFloor!=='all'?'ward':'exterior';
    const enabled=mode==='exterior';
    if(this.renderer?.shadowMap&&this.renderer.shadowMap.enabled!==enabled){
      this.renderer.shadowMap.enabled=enabled;this.renderer.shadowMap.needsUpdate=true;
    }
    if(this.sunLight)this.sunLight.castShadow=enabled;
    if(this._verifyShadows===undefined)this._verifyShadows=new URLSearchParams(location.search).has('verifyShadows');
    if(this._verifyShadows)document.body.dataset.shadowStatus=JSON.stringify({mode,enabled,sun:this.sunLight?.castShadow,floorReceivers:this.floorSliceGroup?.children.filter(o=>o.receiveShadow).length||0});
  }

  animate() {

    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();

    const elapsedTime = this.clock.getElapsedTime();

    this.syncCampusShadowMode();

    TWEEN.update();

    // 3D 視角羅盤動態指針同步 (根據相機即時視角旋轉指針)

    this.updateCompassNeedle();

    if (this.mode === 'orbit') {

      this.controls.update();


    }

    // Guard sky effects against the camera pose that will actually be rendered.
    this.gardenEnvironment?.update(elapsedTime, delta);
    this.immersionEnvironment?.update(elapsedTime, delta);

    // 動態呼吸光環動畫 (Pulsing Glow Halo)

    if (this.xrayMode && this.xrayDensityGroup) {
      const pulseScale = 1.0 + Math.sin(elapsedTime * 3.5) * 0.12;
      this.xrayDensityGroup.children.forEach(ch => {
        if (ch.isMesh && ch.geometry && ch.geometry.type === 'SphereGeometry') {
          ch.scale.set(pulseScale, pulseScale, pulseScale);
        }
      });
    }

    this.pulsingHalos.forEach(ph => {

      const s = ph.baseScale + 0.16 * Math.sin(elapsedTime * ph.speed);

      ph.mesh.scale.set(s, s, s);

    });

    // 沿轉床動線飛行的粒子動畫

    this.transferParticles.forEach(tp => {

      tp.progress = (tp.progress + 0.007) % 1.0;

      const pt = tp.curve.getPoint(tp.progress);

      tp.mesh.position.copy(pt);

    });

    // 小地圖已刪除
    if (this.minimap) {
      this.minimap.render(this.camera.position, this.fpsController ? this.fpsController.yaw : 0);
    }

    this.renderer.render(this.scene, this.camera);

  }

  // 點選病房：在 3D 與 2D 畫布中高亮並聚焦顯示病房資訊

  selectWardRoom(roomCode) {

    this.selectedRoomCode = roomCode;

    // 1. 重設 3D 所有病房地板高亮

    Object.keys(this.roomMeshes).forEach(code => {

      const item = this.roomMeshes[code];

      if (item && item.floor) {

        const isIso = item.data && (item.data.category === 'ISOLATION' || item.data.isNegativePressure);

        item.floor.material.color.setHex(isIso ? 0xfef3c7 : 0xe5e8dc);

      }

    });

    // 2. 高亮當前選取的病房

    const cur = this.roomMeshes[roomCode];

    if (cur && cur.floor) {

      cur.floor.material.color.setHex(0x38bdf8); // 湛藍發光高亮

      // 平滑平移至該病房上方

      const b = this.campusData.buildings.find(item => item.id === this.selectedBuilding);

      if (b && cur.data && cur.data.bounds) {

        const floorNum = parseInt((this.selectedFloor || '7F').replace('F', ''), 10) || 1;

        const floorY = (floorNum - 1) * 3.6;

        const rx = b.position.x + cur.data.bounds.x;

        const rz = b.position.z + cur.data.bounds.z;

        this.tweenCamera(

          new THREE.Vector3(rx, floorY + 16, rz + 18),

          new THREE.Vector3(rx, floorY, rz),

          700

        );

      }

    }

    // 3. 顯示病房即時資訊 HUD

    this.showWardRoomHUD(roomCode);

    // 4. 同步右側病房目錄晶片

    const panel = document.getElementById('ward-directory-panel');

    if (panel) {

      panel.querySelectorAll('.wd-room-chip').forEach(chip => {

        chip.classList.toggle('active', chip.dataset.room === roomCode);

      });

    }

    this.showToast(`🏥 已選取病房：${roomCode} (可點選 2D 畫布檢視或在空間中旋轉)`);

  }

  // 顯示病房資訊 HUD

  showWardRoomHUD(roomCode) {

    const hud = document.getElementById('bed-detail-hud');

    if (!hud) return;

    const b = this.campusData.buildings.find(item => item.id === this.selectedBuilding);

    const wardLayout = this.ward3DData[this.selectedBuilding] ? this.ward3DData[this.selectedBuilding][this.selectedFloor] : null;

    const rm = wardLayout && wardLayout.rooms ? wardLayout.rooms.find(r => r.roomCode === roomCode && (!this.selectedWard || this.selectedWard === 'ALL' || r.ward === this.selectedWard)) : null;

    const beds = wardLayout && wardLayout.beds ? wardLayout.beds.filter(bd => bd.roomCode === roomCode && (!rm || bd.ward === rm.ward)) : [];

    const titleEl = document.getElementById('hud-bed-id');

    const badgeEl = document.getElementById('hud-pathogen-badge');

    const caseIdEl = document.getElementById('hud-case-id');

    const roomNameEl = document.getElementById('hud-room-name');

    const sampleSiteEl = document.getElementById('hud-sample-site');

    const sampleDateEl = document.getElementById('hud-sample-date');

    const isoTypeEl = document.getElementById('hud-iso-type');

    const devicesEl = document.getElementById('hud-devices');

    const stepsEl = document.getElementById('hud-movement-steps');

    const btnGoto2D = document.getElementById('hud-btn-goto-2d');

    if (titleEl) titleEl.innerText = `${roomCode} 病室 (${beds.length} 床)`;

    if (roomNameEl) roomNameEl.innerText = `${b ? b.name.split(' (')[0] : ''} ${this.selectedFloor} ${rm ? (rm.ward || '') + ' ' + (rm.roomName || '住院病室') : ''}`;

    const isIso = rm && (rm.category === 'ISOLATION' || rm.isNegativePressure);

    if (badgeEl) {

      badgeEl.innerText = isIso ? '負壓防護' : '標準防護';

      badgeEl.className = `hud-pathogen-tag ${isIso ? 'cre' : 'all'}`;

    }

    if (caseIdEl) caseIdEl.innerText = isIso ? 'ISO-WARD-MONITOR' : 'STANDARD-WARD';

    if (sampleSiteEl) sampleSiteEl.innerText = '常規環境採檢 (陰性 / 合格)';

    if (sampleDateEl) sampleDateEl.innerText = '2026-10-28';

    if (isoTypeEl) {

      isoTypeEl.innerText = isIso ? '負壓空氣隔離 (Airborne Precautions)' : '標準防護 (Standard Precautions)';

      isoTypeEl.style.color = isIso ? '#b91c1c' : '#16a34a';

    }

    if (devicesEl) devicesEl.innerText = beds.length > 0 ? `床位清單：${beds.map(bd => bd.displayLabel || bd.bedId).join('、')}` : '一般住院病室無常態管路';

    if (stepsEl) {

      stepsEl.innerHTML = `

        <div style="font-size:11px;color:#334155;line-height:1.5;">

          • 房間尺寸：${rm && rm.bounds ? `${rm.bounds.width.toFixed(1)}m × ${rm.bounds.depth.toFixed(1)}m` : '標準規格'}<br>

          • 鄰近走廊：臨中央主走廊，往護理站動線暢通<br>

          • 清消狀態：日班與夜班常態消毒、環境整潔

        </div>

      `;

    }

    if (btnGoto2D) {

      btnGoto2D.onclick = () => {

        this.switchTo2DView();

      };

    }

    hud.style.display = 'block';

  }

  // 渲染右側面板之病房空間分區與即時點選目錄 (取代原始掃描平面圖)

  // 依使用者需求：完全隱藏 84 間病室卡片目錄，由分區與檢視模式取代
  renderWardDirectory(buildingId, floorTarget) {
    const panel = document.getElementById('ward-directory-panel');
    if (panel) {
      panel.style.display = 'none';
    }
  }

  // 步驟 2: 依選取之樓層動態生成病房分區 (例如 全部, 12A, 12B, 12C, 12D)
  renderWardWingSelector(buildingId, floorTarget) {
    const step2Wrap = document.getElementById('step-2-ward-wrap');
    const step3Wrap = document.getElementById('step-3-mode-wrap');
    const wardBtnContainer = document.getElementById('b-ward-buttons');
    const badgeEl = document.getElementById('selected-ward-badge');

    if (!step2Wrap || !wardBtnContainer) return;

    if (!floorTarget || floorTarget === 'all') {
      step2Wrap.style.display = 'none';
      if (step3Wrap) step3Wrap.style.display = 'none';
      return;
    }

    step2Wrap.style.display = 'block';
    if (step3Wrap) step3Wrap.style.display = 'block';
    wardBtnContainer.innerHTML = '';

    // 取得該樓層所有分區
    const wings = ['ALL'];
    const wardLayout=this.ward3DData?.[buildingId]?.[floorTarget];
    for(const r of wardLayout?.rooms||[])if(r.ward&&!wings.includes(r.ward))wings.push(r.ward);
    for(const ward of Object.keys(wardLayout?.sourceTraceWards||{}))if(!wings.includes(ward))wings.push(ward);
    wings.splice(1,wings.length-1,...wings.slice(1).sort((a,b)=>a.localeCompare(b,'en',{numeric:true})));


    if (!this.selectedWard || !wings.includes(this.selectedWard)) {
      this.selectedWard = 'ALL';
    }

    if (badgeEl) {
      badgeEl.innerText = this.selectedWard === 'ALL' ? '全部' : `已選 ${this.selectedWard}`;
    }

    wings.forEach(w => {
      const btn = document.createElement('button');
      const isActive = (this.selectedWard === w);
      btn.className = `btn-floor-tag ${isActive ? 'active' : ''}`;
      btn.style.fontSize = '12px';
      btn.style.padding = '5px 10px';
      btn.style.borderRadius = '6px';
      btn.style.cursor = 'pointer';
      btn.innerText = (w === 'ALL') ? '全部' : `${w}`;

      btn.onclick = () => {
        wardBtnContainer.querySelectorAll('.btn-floor-tag').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedWard = w;
        if (badgeEl) {
          badgeEl.innerText = (w === 'ALL') ? '全部' : `已選 ${w}`;
        }
        if(w!=='ALL'&&!(wardLayout?.rooms||[]).some(r=>r.ward===w)){
          if(badgeEl)badgeEl.innerText=`${w}（區界待確認）`;
          window.canvasWhiteboardManager?.openWardCanvas(buildingId,floorTarget,null,w);
          return;
        }
        // 若在 3D 透視視角，鏡頭滑順飛往該分區
        this.focusWardIn3D(buildingId, floorTarget, w);
        // 若 2D 畫布開啟中，同步更新 2D 畫布之分區焦點
        if (window.canvasWhiteboardManager && window.canvasWhiteboardManager.wardModal && window.canvasWhiteboardManager.wardModal.style.display !== 'none') {
          window.canvasWhiteboardManager.openWardCanvas(buildingId, floorTarget, null, w);
        }
      };

      wardBtnContainer.appendChild(btn);
    });

    // 綁定步驟 3 檢視模式切換
    this.bindViewModeButtons();
  }

  // 步驟 3: 綁定「3D 透視」與「2D 平面圖」切換
  bindViewModeButtons() {
    const btn3D = document.getElementById('btn-view-mode-3d');
    const btn2D = document.getElementById('btn-view-mode-2d');

    if (btn3D) {
      btn3D.onclick = () => {
        btn3D.style.background = '#0284c7';
        if (btn2D) btn2D.style.background = '#64748b';
        // 關閉 2D 畫布彈窗
        if (window.canvasWhiteboardManager && window.canvasWhiteboardManager.wardModal) {
          window.canvasWhiteboardManager.wardModal.style.display = 'none';
        }
        // 切分 3D 樓層並聚焦該分區
        this.sliceBuildingFloor(this.selectedBuilding, this.selectedFloor);
        this.focusWardIn3D(this.selectedBuilding, this.selectedFloor, this.selectedWard);
      };
    }

    if (btn2D) {
      btn2D.onclick = () => {
        btn2D.style.background = '#059669';
        if (btn3D) btn3D.style.background = '#64748b';
        if (window.canvasWhiteboardManager) {
          window.canvasWhiteboardManager.openWardCanvas(this.selectedBuilding, this.selectedFloor, null, this.selectedWard);
        }
      };
    }
  }

  // 3D 視角中將鏡頭平滑導引並對焦至指定病房分區 (例如 12C 區)
  showUnavailableWardNotice() {
    for(const group of [this.floorSliceGroup,this.wardLabelsGroup,this.infectionGroup,this.arcsGroup])if(group)group.visible=false;
    const container=document.getElementById('canvas-container');
    if(!container)return;
    let note=document.getElementById('ward-source-notice');
    if(!note){note=document.createElement('div');note.id='ward-source-notice';note.setAttribute('role','status');container.append(note);}
    note.style.cssText='position:absolute;left:50%;top:45%;transform:translate(-50%,-50%);max-width:90%;padding:20px 24px;border-radius:12px;background:rgba(231,236,221,.95);color:#203e50;font:600 20px/1.7 "Microsoft JhengHei",sans-serif;text-align:center;pointer-events:none;z-index:12';
    note.textContent='本區無病房單位，不呈現平面圖';
  }

  focusWardIn3D(buildingId, floorTarget, wardWing) {
    if (!floorTarget || floorTarget === 'all') return;
    if(window.WardPlan2D&&!window.WardPlan2D.hasPlan(buildingId,floorTarget,wardWing||'ALL')){
      this.showUnavailableWardNotice();return;
    }
    document.getElementById('ward-source-notice')?.remove();
    for(const group of [this.floorSliceGroup,this.wardLabelsGroup,this.infectionGroup,this.arcsGroup])if(group)group.visible=true;
    const b = this.campusData.buildings.find(item => item.id === buildingId);
    const layout = this.ward3DData[buildingId]?.[floorTarget];
    if (!b || !layout) return;
    const all = !wardWing || wardWing === 'ALL';
    const owned = item => all || item.ward === wardWing;
    const items = [...(layout.rooms || []), ...(layout.nursingStations || []),
      ...(layout.facilities || []), ...(layout.displayCorridors || [])]
      .filter(item => owned(item) && item.bounds &&
        ['x','z','width','depth'].every(key => Number.isFinite(item.bounds[key])));
    if (!items.length) return;
    const minX = Math.min(...items.map(r => r.bounds.x-r.bounds.width/2));
    const maxX = Math.max(...items.map(r => r.bounds.x+r.bounds.width/2));
    const minZ = Math.min(...items.map(r => r.bounds.z-r.bounds.depth/2));
    const maxZ = Math.max(...items.map(r => r.bounds.z+r.bounds.depth/2));
    const floorY = ((parseInt(floorTarget, 10) || 1)-1)*3.6 + (b.campus === 'west' ? 0.2 : 0);
    const target = new THREE.Vector3(b.position.x+(minX+maxX)/2, floorY+0.9, b.position.z+(minZ+maxZ)/2);
    // Oblique perspective exposes wall/bed depth while keeping room rows level.
    // The distance calculation below still includes every edge of the plan.
    const direction = new THREE.Vector3(0, 1, 0.95).normalize();
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0), direction).normalize();
    const up = new THREE.Vector3().crossVectors(direction, right).normalize();
    const viewport = this.getWardViewport();
    const tan = Math.tan(THREE.MathUtils.degToRad(this.camera.fov/2));
    const tanH = tan*this.camera.aspect*viewport.width/this.container.clientWidth;
    const tanV = tan*viewport.height/this.container.clientHeight;
    let distance = 1;
    // Include the slab margin as well as rooms, stations and public spaces.
    const framingMargin = Math.max(0.35, Math.min(3, Math.max(maxX-minX,maxZ-minZ)*0.05));
    for (const x of [minX-framingMargin,maxX+framingMargin]) for (const z of [minZ-framingMargin,maxZ+framingMargin]) for (const y of [-0.4,1.8]) {
      const v = new THREE.Vector3(b.position.x+x, floorY+y, b.position.z+z).sub(target);
      const toward = v.dot(direction);
      distance = Math.max(distance, toward+Math.abs(v.dot(right))/tanH/0.92,
        toward+Math.abs(v.dot(up))/tanV/0.92);
    }
    this.tweenCamera(target.clone().addScaledVector(direction,distance),target,800);
    this.updateWardViewport();
  }

  getWardViewport() {
    const width=this.container.clientWidth, height=this.container.clientHeight;
    const base=this.container.getBoundingClientRect();
    const sx=width/(base.width||width), sy=height/(base.height||height);
    const panel=document.getElementById('right-panel');
    const pr=panel?.getBoundingClientRect();
    // On narrow screens the right panel floats over the canvas; it does not reduce the camera viewport.
    const panelWidth=base.width>900 && pr?.height && panel.style.display!=='none' && !panel.classList.contains('panel-collapsed-right') ? pr.width*sx+24 : 0;
    let top=16, bottom=16;
    for(const id of ['top-navbar','floor-view-switcher-bar']){
      const r=document.getElementById(id)?.getBoundingClientRect();
      if(r?.height && r.width) top=Math.max(top,(r.bottom-base.top)*sy+16);
    }
    const timeline=document.getElementById('timeline-header-bar')?.getBoundingClientRect();
    if(timeline?.height && timeline.width) bottom=Math.max(bottom,(base.bottom-timeline.top)*sy+16);
    return {width:Math.max(1,width-panelWidth-32),height:Math.max(1,height-top-bottom),
      offsetX:panelWidth/2,offsetY:(bottom-top)/2};
  }

  updateWardViewport() {
    if (!this.camera) return;
    if (!this.selectedFloor || this.selectedFloor==='all') {
      this.camera.clearViewOffset(); return;
    }
    const viewport=this.getWardViewport();
    if (!viewport.offsetX && !viewport.offsetY) { this.camera.clearViewOffset(); return; }
    const w=this.container.clientWidth,h=this.container.clientHeight;
    this.camera.setViewOffset(w,h,viewport.offsetX,viewport.offsetY,w,h);
  }

  // 同步選取的病房分區
  syncSelectedWard(ward) {
    this.selectedWard = ward;
    const badgeEl = document.getElementById('selected-ward-badge');
    if (badgeEl) {
      badgeEl.innerText = (ward === 'ALL') ? '全部' : `已選 ${ward}`;
    }
    const wardBtnContainer = document.getElementById('b-ward-buttons');
    if (wardBtnContainer) {
      wardBtnContainer.querySelectorAll('.btn-floor-tag').forEach(btn => {
        const isMatch = (ward === 'ALL' && btn.innerText === '全部') || btn.innerText.startsWith(ward);
        btn.classList.toggle('active', isMatch);
      });
    }
  }

  initViewSwitcher() {

    const btn3d = document.getElementById('switcher-btn-3d');

    const btn2d = document.getElementById('switcher-btn-2d');

    const btnBack = document.getElementById('switcher-btn-back');

    if (btn3d) {

      btn3d.onclick = () => this.switchTo3DView();

    }

    if (btn2d) {

      btn2d.onclick = () => this.switchTo2DView();

    }

    if (btnBack) {

      btnBack.onclick = () => this.exitFloorDrillDown();

    }

  }

  // 切換至 3D 鳥瞰透視圖

  switchTo3DView() {

    const btn3d = document.getElementById('switcher-btn-3d');

    const btn2d = document.getElementById('switcher-btn-2d');

    if (btn3d) btn3d.classList.add('active');

    if (btn2d) btn2d.classList.remove('active');

    const wardModal = document.getElementById('ward-canvas-modal');

    if (wardModal) wardModal.style.display = 'none';

    if (this.floorSliceGroup) this.floorSliceGroup.visible = true;

    if (this.buildingMeshes[this.selectedBuilding]) {

      this.buildingMeshes[this.selectedBuilding].visible = false;

    }

    this.focusWardIn3D(this.selectedBuilding,this.selectedFloor,this.selectedWard || 'ALL');

    this.showToast(`🏢 已切換至【${this.selectedFloor} 3D 鳥瞰透視圖】：可拖曳旋轉檢視病房`);

  }

  // 切換至 2D 俯瞰圖 (向量美觀畫布)

  switchTo2DView() {

    const btn3d = document.getElementById('switcher-btn-3d');

    const btn2d = document.getElementById('switcher-btn-2d');

    if (btn2d) btn2d.classList.add('active');

    if (btn3d) btn3d.classList.remove('active');

    if (window.canvasWhiteboardManager) {

      window.canvasWhiteboardManager.openWardCanvas(this.selectedBuilding, this.selectedFloor, this.selectedRoomCode, this.selectedWard || 'ALL');

    }

    this.showToast(`🗺️ 已切換至【${this.selectedFloor} 2D 俯瞰圖】：可點選病房、縮放或手繪標註`);

  }

  // 退出樓層下鑽，返回全院區鳥瞰

  exitFloorDrillDown() {

    const rightPanel = document.getElementById('right-panel');
    rightPanel?.classList.add('panel-collapsed-right');
    document.body.classList.remove('has-right-panel');
    const expandRight = document.getElementById('btn-expand-right');
    if (expandRight) expandRight.style.display = 'none';
    if (window.canvasWhiteboardManager?.wardModal) window.canvasWhiteboardManager.wardModal.style.display = 'none';
    if (this.collapseTimelineBar && window.innerWidth <= 900) this.collapseTimelineBar(true);

    const topSwitcher = document.getElementById('floor-view-switcher-bar');

    if (topSwitcher) topSwitcher.style.display = 'none'; document.body.classList.remove('has-floor-view');

    const wardModal = document.getElementById('ward-canvas-modal');

    if (wardModal) wardModal.style.display = 'none';

    const hud = document.getElementById('bed-detail-hud');

    if (hud) hud.style.display = 'none';

    this.sliceBuildingFloor(this.selectedBuilding, 'all');

    this.showToast(`↩️ 已返回全院區鳥瞰視野`);

  }

  // ========================================================

  // v8.5: 3D 視角導航羅盤與快捷調向工具箱 (解決調方向不好調問題)

  // ========================================================

  updateCompassNeedle() {
    if (!this.controls || !this.camera) return;
    const dx = this.camera.position.x - this.controls.target.x;
    const dz = this.camera.position.z - this.controls.target.z;
    const azimuth = Math.atan2(dx, dz);
    const rotation = `rotate(${-azimuth * 180 / Math.PI}deg)`;
    (this.compassNeedleEls || [this.compassNeedleEl]).filter(Boolean).forEach(el => { el.style.transform = rotation; });
  }

  initOrientationWidget() {

    this.compassNeedleEl = document.getElementById('compass-needle');
    this.compassNeedleEls = [this.compassNeedleEl, ...document.querySelectorAll('[data-compass-needle]')].filter(Boolean);

    const widget = document.getElementById('view-orientation-widget');

    // 1. 羅盤指針點擊立即「正北朝上」

    const btnNorth = document.getElementById('btn-compass-north');

    if (btnNorth) {

      btnNorth.onclick = () => this.setCameraOrientation('north');

    }

    const miniCompass = document.getElementById('mini-compass-north');
    if (miniCompass) miniCompass.onclick = () => this.setCameraOrientation('north');

    // 2. 快捷視角預設角度按鈕

    const btnTop = document.getElementById('btn-view-top');

    const btnIso = document.getElementById('btn-view-iso');

    const btnFront = document.getElementById('btn-view-front');

    const btnCcw = document.getElementById('btn-rotate-ccw');

    const btnCw = document.getElementById('btn-rotate-cw');

    const btnReset = document.getElementById('btn-reset-orientation');

    if (btnTop) btnTop.onclick = () => this.setCameraOrientation('top');

    // 滑鼠拖曳模式切換 (左鍵移動畫面 vs 旋轉視角)
    const btnDragPan = document.getElementById('btn-drag-pan');
    const btnDragRotate = document.getElementById('btn-drag-rotate');
    if (btnDragPan) btnDragPan.onclick = () => this.setMouseDragMode('pan');
    if (btnDragRotate) btnDragRotate.onclick = () => this.setMouseDragMode('rotate');

    if (btnIso) btnIso.onclick = () => this.setCameraOrientation('iso');

    if (btnFront) btnFront.onclick = () => this.setCameraOrientation('front');

    if (btnCcw) btnCcw.onclick = () => this.rotateCameraAngle(-Math.PI / 4, 380);

    if (btnCw) btnCw.onclick = () => this.rotateCameraAngle(Math.PI / 4, 380);

    if (btnReset) btnReset.onclick = () => this.resetCameraOrientation();

    // XYZ 軸微調控制項綁定

    const btnPitchDown = document.getElementById('btn-pitch-down');

    const btnPitchUp = document.getElementById('btn-pitch-up');

    const btnYawLeft = document.getElementById('btn-yaw-left');

    const btnYawRight = document.getElementById('btn-yaw-right');

    const btnZoomIn = document.getElementById('btn-zoom-in');

    const btnZoomOut = document.getElementById('btn-zoom-out');

    if (btnPitchDown) btnPitchDown.onclick = () => this.pitchCameraAngle(-0.26, 300);  // 俯看：增加由上往下看的角度

    if (btnPitchUp) btnPitchUp.onclick = () => this.pitchCameraAngle(0.26, 300);       // 仰看：降低俯視程度，看向建築立面

    if (btnYawLeft) btnYawLeft.onclick = () => this.rotateCameraAngle(-Math.PI / 6, 300); // Y軸 旋左30°

    if (btnYawRight) btnYawRight.onclick = () => this.rotateCameraAngle(Math.PI / 6, 300); // Y軸 旋右30°

    if (btnZoomIn) btnZoomIn.onclick = () => this.zoomCameraDistance(0.8, 300);       // Z軸 推進拉近

    if (btnZoomOut) btnZoomOut.onclick = () => this.zoomCameraDistance(1.25, 300);    // Z軸 拉遠遠景

    // 3. 鍵盤快速調向監聽 (方向鍵 ◀ ▶ 快速旋轉方向，▲ ▼ 微調俯仰)

    window.addEventListener('keydown', (e) => {

      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      if (e.key === 'ArrowLeft') {

        e.preventDefault();

        this.rotateCameraAngle(-Math.PI / 12, 200); // 15度

      } else if (e.key === 'ArrowRight') {

        e.preventDefault();

        this.rotateCameraAngle(Math.PI / 12, 200); // 15度

      } else if (e.key === 'ArrowUp') {

        e.preventDefault();

        this.pitchCameraAngle(0.12, 200);

      } else if (e.key === 'ArrowDown') {

        e.preventDefault();

        this.pitchCameraAngle(-0.12, 200);

      } else if (e.key === 'n' || e.key === 'N') {

        this.setCameraOrientation('north');

      } else if (e.key === 't' || e.key === 'T') {

        this.setCameraOrientation('top');

      }

    });

    // 4. 與右側面板折疊/展開同步停靠位置

    const btnCollapseRight = document.getElementById('btn-collapse-right');

    const btnExpandRight = document.getElementById('btn-expand-right');

    if (btnCollapseRight && widget) {

      btnCollapseRight.addEventListener('click', () => {

        if (!widget.dataset.dragged) widget.classList.add('dock-right');

      });

    }

    if (btnExpandRight && widget) {

      btnExpandRight.addEventListener('click', () => {

        if (!widget.dataset.dragged) widget.classList.remove('dock-right');

      });

    }

    // 可控制位置之拖曳機制與收起/展開

    this.initOrientationWidgetDrag(widget);
    this.initOrientationJoystick();
    this.initOrientationJoystickMove();

    // 頂部導航鈕與右上角關閉鈕控制調向面板顯示/隱藏
    const navBtn = document.getElementById('btn-nav-orient');
    const closeBtn = document.getElementById('btn-close-orient');

    const joystickDock = document.getElementById('orientation-joystick-dock');
    const togglePanelVisibility = (show) => {
      const isVisible = typeof show === 'boolean' ? show : widget.classList.contains('hidden');
      widget.classList.toggle('hidden', !isVisible);
      if (isVisible) {
        widget.classList.remove('collapsed');
        const toggleBtn = document.getElementById('btn-toggle-orient');
        if (toggleBtn) toggleBtn.innerText = '收起 ▾';
      }
      if (joystickDock) joystickDock.hidden = isVisible;
      if (navBtn) {
        navBtn.classList.toggle('active', isVisible);
        navBtn.setAttribute('aria-expanded', String(isVisible));
        navBtn.setAttribute('aria-controls', 'view-orientation-widget');
      }
    };
    togglePanelVisibility(false);

    if (navBtn) {
      navBtn.onclick = () => togglePanelVisibility();
    }
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        togglePanelVisibility(false);
      };
    }

  }

  // 3D 調向控制面板自由拖曳與收起/展開

  initOrientationJoystickMove() {
    const dock=document.getElementById('orientation-joystick-dock');
    const handle=document.getElementById('orientation-joystick-move');
    if(!dock||!handle)return;
    let drag=null;
    const move=(left,top)=>{
      const rect=dock.getBoundingClientRect();
      const navbar=document.getElementById('top-navbar')?.getBoundingClientRect();
      const minTop=Math.min((navbar?.bottom||0)+8,Math.max(8,window.innerHeight-rect.height-8));
      dock.dataset.dragged='true';
      dock.style.left=Math.max(8,Math.min(left,window.innerWidth-rect.width-8))+'px';
      dock.style.top=Math.max(minTop,Math.min(top,window.innerHeight-rect.height-8))+'px';
      dock.style.right='auto';
    };
    const reset=()=>{
      delete dock.dataset.dragged;
      dock.style.removeProperty('left');dock.style.removeProperty('top');dock.style.removeProperty('right');
    };
    handle.addEventListener('pointerdown',event=>{
      if(drag||event.pointerType==='mouse'&&event.button!==0)return;
      const rect=dock.getBoundingClientRect();
      drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:rect.left,top:rect.top};
      handle.setPointerCapture(event.pointerId);handle.classList.add('is-moving');
      event.preventDefault();event.stopPropagation();
    });
    handle.addEventListener('pointermove',event=>{
      if(!drag||event.pointerId!==drag.id)return;
      move(drag.left+event.clientX-drag.x,drag.top+event.clientY-drag.y);
      event.stopPropagation();
    });
    const stop=event=>{
      if(!drag||event.pointerId!==drag.id)return;
      drag=null;handle.classList.remove('is-moving');
      if(handle.hasPointerCapture(event.pointerId))handle.releasePointerCapture(event.pointerId);
    };
    for(const name of ['pointerup','pointercancel','lostpointercapture'])handle.addEventListener(name,stop);
    handle.addEventListener('dblclick',reset);
    handle.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key))return;
      event.preventDefault();event.stopPropagation();
      if(event.key==='Home'){reset();return;}
      const rect=dock.getBoundingClientRect(),step=event.shiftKey?30:10;
      move(rect.left+(event.key==='ArrowLeft'?-step:event.key==='ArrowRight'?step:0),
        rect.top+(event.key==='ArrowUp'?-step:event.key==='ArrowDown'?step:0));
    });
    window.addEventListener('resize',()=>{
      if(!dock.dataset.dragged||dock.hidden)return;
      const rect=dock.getBoundingClientRect();move(rect.left,rect.top);
    });
  }

  initOrientationJoystick() {
    const pad = document.getElementById('orientation-joystick');
    const knob = document.getElementById('orientation-joystick-knob');
    const stem = document.getElementById('orientation-joystick-stem');
    if (!pad || !knob || !stem) return;

    const travel = 34;
    // The raised grip rests above the socket, like a physical joystick.
    const gripLift = 20;
    const stemLength = 42;
    let pointerId = null;
    let axisX = 0;
    let axisY = 0;
    let frameId = 0;
    let lastFrame = 0;

    const updateKnob = (event) => {
      const rect = pad.getBoundingClientRect();
      let dx = event.clientX - (rect.left + rect.width / 2);
      let dy = event.clientY - (rect.top + rect.height / 2 - gripLift);
      const distance = Math.hypot(dx, dy);
      if (distance > travel) {
        const scale = travel / distance;
        dx *= scale;
        dy *= scale;
      }
      axisX = dx / travel;
      axisY = dy / travel;
      knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      stem.style.height = `${Math.hypot(dx, dy - stemLength)}px`;
      stem.style.transform = `translateX(-50%) rotate(${Math.atan2(-dx, dy - stemLength) * 180 / Math.PI}deg)`;
    };

    const animate = (time) => {
      if (pointerId === null) return;
      const dt = lastFrame ? Math.min((time - lastFrame) / 1000, 0.05) : 0;
      lastFrame = time;
      if (Math.abs(axisX) > 0.04 || Math.abs(axisY) > 0.04) {
        const target = this.controls.target;
        const dx = this.camera.position.x - target.x;
        const dy = this.camera.position.y - target.y;
        const dz = this.camera.position.z - target.z;
        const radius = Math.hypot(dx, dy, dz) || 100;
        const theta = Math.atan2(dx, dz) + axisX * 1.55 * dt;
        // Upper joystick direction looks down; lower direction looks up.
        const phi = THREE.MathUtils.clamp(Math.acos(THREE.MathUtils.clamp(dy / radius, -1, 1)) + axisY * 1.05 * dt, 0.06, Math.PI / 2 - 0.05);
        this.camera.position.set(
          target.x + radius * Math.sin(phi) * Math.sin(theta),
          target.y + radius * Math.cos(phi),
          target.z + radius * Math.sin(phi) * Math.cos(theta)
        );
        this.camera.lookAt(target);
        this.controls.update();
        this.updateCompassNeedle();
      }
      frameId = requestAnimationFrame(animate);
    };

    const stop = (event) => {
      if (pointerId === null || (event && event.pointerId !== pointerId)) return;
      pointerId = null;
      axisX = 0;
      axisY = 0;
      lastFrame = 0;
      cancelAnimationFrame(frameId);
      pad.classList.remove('is-active');
      knob.style.transform = 'translate(-50%, -50%)';
      stem.style.height = `${stemLength}px`;
      stem.style.transform = 'translateX(-50%) rotate(180deg)';
      if (event && pad.hasPointerCapture?.(event.pointerId)) pad.releasePointerCapture(event.pointerId);
    };

    pad.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button')) return;
      if (pointerId !== null) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      pointerId = event.pointerId;
      this.cameraPositionTween?.stop();
      this.cameraTargetTween?.stop();
      pad.classList.add('is-active');
      pad.setPointerCapture?.(pointerId);
      updateKnob(event);
      frameId = requestAnimationFrame(animate);
      event.preventDefault();
    });
    pad.addEventListener('pointermove', (event) => {
      if (event.pointerId === pointerId) updateKnob(event);
    });
    pad.addEventListener('pointerup', stop);
    pad.addEventListener('pointercancel', stop);
    pad.addEventListener('lostpointercapture', stop);
    pad.querySelectorAll('[data-direction]').forEach(button => {
      button.addEventListener('click', () => {
        const direction = button.dataset.direction;
        if (direction === 'up') this.pitchCameraAngle(0.12, 200);
        if (direction === 'down') this.pitchCameraAngle(-0.12, 200);
        if (direction === 'left') this.rotateCameraAngle(-Math.PI / 12, 200);
        if (direction === 'right') this.rotateCameraAngle(Math.PI / 12, 200);
      });
    });
  }

  initOrientationWidgetDrag(widget) {
    if (!widget) return;
    const header = document.getElementById('orient-header');
    const toggleBtn = document.getElementById('btn-toggle-orient');

    // 收起/展開按鈕切換
    if (toggleBtn) {
      toggleBtn.onclick = (e) => {
        e.stopPropagation();
        widget.classList.toggle('collapsed');
        const isCollapsed = widget.classList.contains('collapsed');
        toggleBtn.innerText = isCollapsed ? '展開 ▴' : '收起 ▾';
      };
    }

    // 雙擊標題列收起/展開
    if (header) {
      header.ondblclick = (e) => {
        if (e.target.closest('#btn-toggle-orient')) return;
        widget.classList.toggle('collapsed');
        const isCollapsed = widget.classList.contains('collapsed');
        if (toggleBtn) toggleBtn.innerText = isCollapsed ? '展開 ▴' : '收起 ▾';
      };
    }

    let isDragging = false;
    let startMouseX = 0, startMouseY = 0;
    let startWidgetLeft = 0, startWidgetTop = 0;

    const onDragStart = (clientX, clientY, target) => {
      // 若點擊的是按鈕、羅盤圓盤、按鍵項目或切換鈕，不觸發拖曳
      if (target.closest('button, .compass-circle-wrap, .orient-key-item, .orientation-joystick-pad, input, a, select')) {
        return false;
      }

      isDragging = true;
      widget.dataset.dragged = 'true';
      widget.classList.remove('dock-right');
      widget.classList.add('is-dragging');

      startMouseX = clientX;
      startMouseY = clientY;

      const rect = widget.getBoundingClientRect();
      startWidgetLeft = rect.left;
      startWidgetTop = rect.top;

      widget.style.setProperty('right', 'auto', 'important');
      widget.style.left = startWidgetLeft + 'px';
      widget.style.top = startWidgetTop + 'px';

      document.body.style.userSelect = 'none';
      return true;
    };

    const onDragMove = (clientX, clientY) => {
      if (!isDragging) return;
      const dx = clientX - startMouseX;
      const dy = clientY - startMouseY;
      const maxLeft = Math.max(10, window.innerWidth - widget.offsetWidth - 10);
      const maxTop = Math.max(50, window.innerHeight - widget.offsetHeight - 10);
      const newLeft = Math.max(10, Math.min(maxLeft, startWidgetLeft + dx));
      const newTop = Math.max(50, Math.min(maxTop, startWidgetTop + dy));
      widget.style.left = newLeft + 'px';
      widget.style.top = newTop + 'px';
    };

    const onDragEnd = () => {
      if (isDragging) {
        isDragging = false;
        widget.classList.remove('is-dragging');
        document.body.style.userSelect = '';
      }
    };

    // 支援滑鼠拖曳（標題列或面板背景皆可按住拖動）
    widget.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // 僅限滑鼠左鍵
      onDragStart(e.clientX, e.clientY, e.target);
    });

    window.addEventListener('mousemove', (e) => {
      onDragMove(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', onDragEnd);

    // 支援觸控螢幕拖曳 (Touch Events)
    widget.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        if (onDragStart(touch.clientX, touch.clientY, e.target)) {
          e.preventDefault();
        }
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches.length === 1) {
        const touch = e.touches[0];
        onDragMove(touch.clientX, touch.clientY);
        e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('touchend', onDragEnd);
    window.addEventListener('touchcancel', onDragEnd);
  }

  setCameraOrientation(preset) {


    const t = this.controls.target;

    const dx = this.camera.position.x - t.x;

    const dy = this.camera.position.y - t.y;

    const dz = this.camera.position.z - t.z;

    const r = Math.sqrt(dx * dx + dy * dy + dz * dz) || 120;

    let targetX, targetY, targetZ;

    let toastMsg = '';

    const btnTop = document.getElementById('btn-view-top');

    const btnIso = document.getElementById('btn-view-iso');

    const btnFront = document.getElementById('btn-view-front');

    [btnTop, btnIso, btnFront].forEach(b => b && b.classList.remove('active'));

    if (preset === 'north') {

      // 保持目前仰角，水平旋轉至正北方 (Z 軸正向朝外，相機看往正北)

      const phi = this.controls.getPolarAngle() || (Math.PI / 4);

      targetX = t.x;

      targetY = t.y + r * Math.cos(phi);

      targetZ = t.z + r * Math.sin(phi);

      toastMsg = '🧭 已校正為【正北朝上 (True North)】';

      if (btnIso) btnIso.classList.add('active');

    } else if (preset === 'top') {

      // 90 度垂直俯瞰 (建築藍圖視角)

      targetX = t.x;

      targetY = t.y + r * 0.98;

      targetZ = t.z + 0.15; // 避免極點退化

      toastMsg = '📐 已切換為【90° 正上方垂直俯瞰】';

      if (btnTop) btnTop.classList.add('active');

    } else if (preset === 'iso') {

      // 經典 45 度建築等角視角 (東南東斜視)

      const phi = Math.PI / 3.6;

      const theta = Math.PI / 4;

      targetX = t.x + r * Math.sin(phi) * Math.sin(theta);

      targetY = t.y + r * Math.cos(phi);

      targetZ = t.z + r * Math.sin(phi) * Math.cos(theta);

      toastMsg = '🌐 已切換為【45° 經典建築等角視角】';

      if (btnIso) btnIso.classList.add('active');

    } else if (preset === 'front') {

      // 正立面平視角 (水平 0 度)

      const phi = Math.PI / 2 - 0.08;

      targetX = t.x;

      targetY = t.y + r * Math.cos(phi);

      targetZ = t.z + r * Math.sin(phi);

      toastMsg = '🏢 已切換為【正面水平立面視角】';

      if (btnFront) btnFront.classList.add('active');

    }

    this.tweenCamera(

      new THREE.Vector3(targetX, targetY, targetZ),

      new THREE.Vector3(t.x, t.y, t.z),

      600

    );

    this.showToast(toastMsg);

  }

  // 水平旋轉目前相機視角 (支援 ↺ 逆時針 / ↻ 順時針 微調旋轉)

  rotateCameraAngle(deltaAngle, duration = 400) {


    const t = this.controls.target;

    const dx = this.camera.position.x - t.x;

    const dz = this.camera.position.z - t.z;

    const currentAngle = Math.atan2(dx, dz);

    const newAngle = currentAngle + deltaAngle;

    const radiusHorizontal = Math.sqrt(dx * dx + dz * dz);

    const newX = t.x + radiusHorizontal * Math.sin(newAngle);

    const newZ = t.z + radiusHorizontal * Math.cos(newAngle);

    this.tweenCamera(

      new THREE.Vector3(newX, this.camera.position.y, newZ),

      new THREE.Vector3(t.x, t.y, t.z),

      duration

    );

    const deg = Math.round(Math.abs(deltaAngle * 180 / Math.PI));

    this.showToast(deltaAngle > 0 ? `↻ 順旋 ${deg}°` : `↺ 逆旋 ${deg}°`);

  }

  // Z 軸推進拉遠 (縮放)

  zoomCameraDistance(factor, duration = 300) {


    const t = this.controls.target;

    const dx = this.camera.position.x - t.x;

    const dy = this.camera.position.y - t.y;

    const dz = this.camera.position.z - t.z;

    const r = Math.sqrt(dx * dx + dy * dy + dz * dz) || 100;

    const newR = Math.max(10, Math.min(550, r * factor));

    const scale = newR / r;

    const newX = t.x + dx * scale;

    const newY = t.y + dy * scale;

    const newZ = t.z + dz * scale;

    this.tweenCamera(

      new THREE.Vector3(newX, newY, newZ),

      new THREE.Vector3(t.x, t.y, t.z),

      duration

    );

  }

  // 垂直俯仰角微調

  pitchCameraAngle(deltaPitch, duration = 300) {


    const t = this.controls.target;

    const dx = this.camera.position.x - t.x;

    const dy = this.camera.position.y - t.y;

    const dz = this.camera.position.z - t.z;

    const r = Math.sqrt(dx * dx + dy * dy + dz * dz) || 100;

    let phi = this.controls.getPolarAngle() + deltaPitch;

    phi = Math.max(0.06, Math.min(Math.PI / 2 - 0.05, phi));

    const theta = Math.atan2(dx, dz);

    const newX = t.x + r * Math.sin(phi) * Math.sin(theta);

    const newY = t.y + r * Math.cos(phi);

    const newZ = t.z + r * Math.sin(phi) * Math.cos(theta);

    this.tweenCamera(

      new THREE.Vector3(newX, newY, newZ),

      new THREE.Vector3(t.x, t.y, t.z),

      duration

    );

  }

  // 重置相機方向為置中且對齊標準視角

  // 依使用者需求：滑鼠左鍵模式切換 (預設【平移移動畫面】，亦可切換【旋轉視角】)
  setMouseDragMode(mode = 'pan') {
    this.mouseDragMode = mode;
    if (mode === 'pan') {
      this.controls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE
      };
      this.container.style.cursor = 'grab';
      this.showToast('✋ 已切換為【左鍵移動畫面】：按住滑鼠左鍵即可拖曳移動畫面尋找建築物');
    } else {
      this.controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      };
      this.container.style.cursor = 'default';
      this.showToast('🔄 已切換為【左鍵旋轉視角】：按住滑鼠左鍵旋轉，右鍵拖曳移動畫面');
    }
    const btnPan = document.getElementById('btn-drag-pan');
    const btnRot = document.getElementById('btn-drag-rotate');
    if (btnPan) btnPan.classList.toggle('active', mode === 'pan');
    if (btnRot) btnRot.classList.toggle('active', mode === 'rotate');
  }

  resetCameraOrientation() {

    const t = this.controls.target;

    const phi = Math.PI / 3.4;

    const theta = Math.PI / 6;

    const r = Math.min(220, Math.max(50, this.camera.position.distanceTo(t)));

    const newX = t.x + r * Math.sin(phi) * Math.sin(theta);

    const newY = t.y + r * Math.cos(phi);

    const newZ = t.z + r * Math.sin(phi) * Math.cos(theta);

    this.tweenCamera(

      new THREE.Vector3(newX, newY, newZ),

      new THREE.Vector3(t.x, t.y, t.z),

      600

    );

    const btnIso = document.getElementById('btn-view-iso');

    if (btnIso) btnIso.classList.add('active');

    this.showToast('🎯 已將視角對齊置中與標準透視');
  }

  // ========================================================
  // v9.0: 全棟建築 X-Ray 透視與多層感管個案密集度熱區檢視
  // ========================================================
  toggleXrayMode() {
    this.xrayMode = !this.xrayMode;
    const btn = document.getElementById('btn-toggle-xray');
    if (this.xrayMode) {
      if (btn) {
        btn.classList.add('active');
        btn.style.background = '#ef4444';
        btn.style.color = '#ffffff';
        btn.innerHTML = '🔬 關閉透視 (正常外觀)';
      }
      this.enableXrayMode();
      this.showToast('🔬 已開啟【全棟建築透視】：外牆玻璃半透明化，立體透視整棟大樓內部個案密集度');
    } else {
      if (btn) {
        btn.classList.remove('active');
        btn.style.background = 'rgba(239, 68, 68, 0.12)';
        btn.style.color = '#991b1b';
        btn.innerHTML = '🔬 全棟透視 (個案密集度)';
      }
      this.disableXrayMode();
      this.showToast('🏢 已恢復建築物原始外觀');
    }
  }

  enableXrayMode() {
    // 依使用者需求：透視時影子應消失！關閉陽光投影與建築物陰影投射，消除黑色大片陰影
    if (this.sunLight) {
      this.sunLight.castShadow = false;
    }
    if (this.renderer && this.renderer.shadowMap) {
      this.renderer.shadowMap.enabled = false;
    }

    // 1. 將所有建築物 Mesh 材質轉換為通透玻璃透視風格，並關閉陰影投射
    this.buildingOriginalMaterials.clear();
    this.buildingsGroup.traverse(child => {
      if (child.isMesh) {
        child.userData.prevCastShadow = child.castShadow;
        child.userData.prevReceiveShadow = child.receiveShadow;
        child.castShadow = false;
        child.receiveShadow = false;

        if (child.material) {
          this.buildingOriginalMaterials.set(child, child.material);
          const origColor = (child.material.color) ? child.material.color.clone() : new THREE.Color(0x38bdf8);
          const ghostMat = new THREE.MeshPhysicalMaterial({
            color: origColor,
            transparent: true,
            opacity: 0.14,
            roughness: 0.2,
            metalness: 0.05,
            transmission: 0.88,
            ior: 1.25,
            depthWrite: false,
            wireframe: false
          });
          child.material = ghostMat;
        }
      }
    });

    // 2. 繪製全棟各樓層感管個案立體密集度標記
    this.renderXrayDensityMarkers();
  }

  disableXrayMode() {
    // 恢復原始材質與陰影投射
    if (this.sunLight) {
      this.sunLight.castShadow = true;
    }
    if (this.renderer && this.renderer.shadowMap) {
      this.renderer.shadowMap.enabled = true;
    }

    this.buildingsGroup.traverse(child => {
      if (child.isMesh) {
        if (child.userData.prevCastShadow !== undefined) {
          child.castShadow = child.userData.prevCastShadow;
        }
        if (child.userData.prevReceiveShadow !== undefined) {
          child.receiveShadow = child.userData.prevReceiveShadow;
        }
      }
    });

    this.buildingOriginalMaterials.forEach((origMat, mesh) => {
      if (mesh) mesh.material = origMat;
    });
    this.buildingOriginalMaterials.clear();
    this.xrayDensityGroup.clear();
  }

  renderXrayDensityMarkers() {
    this.xrayDensityGroup.clear();
    const curDate = this.currentDate;

    // 統計當前日期各病房/樓層的活躍個案
    const activeCases = [];
    (this.ipcData.cases || []).forEach(cs => {
      if (!cs || cs.pathogen === 'NORMAL' || cs.pathogen === 'NORMAL_BED') return;
      if (this.currentPathogenFilter !== 'ALL' && cs.pathogen !== this.currentPathogenFilter) return;

      (cs.movement_history || []).forEach(m => {
        if (curDate >= m.start_date && curDate <= m.end_date) {
          activeCases.push({
            caseData: cs,
            move: m
          });
        }
      });
    });

    if (activeCases.length === 0) return;

    // 依病房與建物進行分群匯總
    const wardClusters = {};
    activeCases.forEach(item => {
      const ward = item.move.ward || 'OTHER';
      if (!wardClusters[ward]) {
        wardClusters[ward] = {
          ward: ward,
          campus: item.move.campus,
          cases: [],
          pathogens: {}
        };
      }
      wardClusters[ward].cases.push(item);
      const p = item.caseData.pathogen;
      wardClusters[ward].pathogens[p] = (wardClusters[ward].pathogens[p] || 0) + 1;
    });

    // 計算各病房在 3D 空間中的中心坐標
    const childPosition=this.campusData.buildings.find(b=>b.id==='CHILD_HOSPITAL')?.position||{x:-4,z:-56};
    const wardLocations = {
      // 東址各樓層
      '7A': { x: 83.7 - 5.0, y: (7 - 1) * 3.6 + 1.8, z: 70.8 - 45.0, bldg: 'E01_MAIN' },
      '7B': { x: 83.7 - 5.0, y: (7 - 1) * 3.6 + 1.8, z: 70.8 - 20.0, bldg: 'E01_MAIN' },
      '7C': { x: 83.7 + 5.0, y: (7 - 1) * 3.6 + 1.8, z: 70.8 + 15.0, bldg: 'E01_MAIN' },
      '7D': { x: 83.7 + 5.0, y: (7 - 1) * 3.6 + 1.8, z: 70.8 + 40.0, bldg: 'E01_MAIN' },
      '12A': { x: 83.7 - 5.0, y: (12 - 1) * 3.6 + 1.8, z: 70.8 - 45.0, bldg: 'E01_MAIN' },
      '12B': { x: 83.7 - 5.0, y: (12 - 1) * 3.6 + 1.8, z: 70.8 - 20.0, bldg: 'E01_MAIN' },
      '12C': { x: 83.7 + 5.0, y: (12 - 1) * 3.6 + 1.8, z: 70.8 + 15.0, bldg: 'E01_MAIN' },
      '12D': { x: 83.7 + 5.0, y: (12 - 1) * 3.6 + 1.8, z: 70.8 + 40.0, bldg: 'E01_MAIN' },
      '03A1': { x: 83.7 - 5.0, y: (3 - 1) * 3.6 + 1.8, z: 70.8 - 45.0, bldg: 'E01_MAIN' },
      '03A2': { x: 83.7 - 5.0, y: (3 - 1) * 3.6 + 1.8, z: 70.8 - 35.0, bldg: 'E01_MAIN' },
      '03B1': { x: 83.7 - 5.0, y: (3 - 1) * 3.6 + 1.8, z: 70.8 - 25.0, bldg: 'E01_MAIN' },
      '03B2': { x: 83.7 - 5.0, y: (3 - 1) * 3.6 + 1.8, z: 70.8 - 15.0, bldg: 'E01_MAIN' },
      '03C':  { x: 83.7 + 5.0, y: (3 - 1) * 3.6 + 1.8, z: 70.8 + 15.0, bldg: 'E01_MAIN' },
      // 西址病房
      '5W2':  { x: -36.0, y: (2 - 1) * 3.6 + 1.8, z: -2.0 + 38.0, bldg: 'W04_WEST' },
      '5W1':  { x: -36.0, y: (1 - 1) * 3.6 + 1.8, z: -2.0 + 38.0, bldg: 'W04_WEST' },
      '5W3':  { x: -36.0, y: (3 - 1) * 3.6 + 1.8, z: -2.0 + 38.0, bldg: 'W04_WEST' },
      '5W4':  { x: -36.0, y: (4 - 1) * 3.6 + 1.8, z: -2.0 + 38.0, bldg: 'W04_WEST' },
      // 兒醫各樓層
      '05PW': { x: childPosition.x - 6.0, y: (5 - 1) * 3.6 + 1.8, z: childPosition.z, bldg: 'CHILD_HOSPITAL' },
      '05PE': { x: childPosition.x + 6.0, y: (5 - 1) * 3.6 + 1.8, z: childPosition.z, bldg: 'CHILD_HOSPITAL' },
      '06PE': { x: childPosition.x + 6.0, y: (6 - 1) * 3.6 + 1.8, z: childPosition.z, bldg: 'CHILD_HOSPITAL' }
    };

    Object.values(wardClusters).forEach(cl => {
      let loc = wardLocations[cl.ward];
      if (!loc) {
        // 自動估算樓層高度
        const num = parseInt(cl.ward.replace(/[^0-9]/g, ''), 10) || 5;
        loc = { x: 83.7, y: (num - 1) * 3.6 + 1.8, z: 70.8, bldg: 'E01_MAIN' };
      }

      const count = cl.cases.length;
      // 密集度顏色：1~2例為橙色警戒、3例以上為紅色高密集警報
      let sphereColor = 0xf59e0b;
      let strokeColor = '#f59e0b';
      if (count >= 3) {
        sphereColor = 0xef4444;
        strokeColor = '#ef4444';
      } else if (count === 1) {
        sphereColor = 0x3b82f6;
        strokeColor = '#3b82f6';
      }

      // 1. 立體發光密集度熱區球體 (Glow Heat Sphere)
      const radius = 2.2 + Math.min(count * 1.2, 5.5);
      const sphereGeom = new THREE.SphereGeometry(radius, 24, 24);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: sphereColor,
        transparent: true,
        opacity: 0.65,
        wireframe: false,
        depthTest: false
      });
      const sphereMesh = new THREE.Mesh(sphereGeom, sphereMat);
      sphereMesh.position.set(loc.x, loc.y, loc.z);
      this.xrayDensityGroup.add(sphereMesh);

      // 2. 外圍立體擴散波紋環
      const ringGeom = new THREE.RingGeometry(radius + 0.2, radius + 1.4, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: sphereColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
        depthTest: false
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.set(loc.x, loc.y + 0.1, loc.z);
      this.xrayDensityGroup.add(ringMesh);

      // 3. 立體多病原懸浮標籤
      const pSummary = Object.entries(cl.pathogens).map(([k, v]) => `${k}:${v}`).join(' ');
      const labelText = `⚠️ ${cl.ward} (${count}例) [${pSummary}]`;
      const sprite = this.createFloatingLabel(labelText, strokeColor, 18);
      sprite.position.set(loc.x, loc.y + radius + 1.6, loc.z);
      this.xrayDensityGroup.add(sprite);
    });
  }
}

if (window.WardPlanGeometry) {
  window.WardPlanGeometry.prepare(window.WARD_3D_LAYOUT_DATA,
    (building, floor, layout) => CampusApp.prototype.getRawFloorCorridors.call({}, building, floor, layout));
}

window.campusApp = new CampusApp();

window.addEventListener('DOMContentLoaded', () => {

  window.campusApp.init();

});

window.app = window.campusApp;
