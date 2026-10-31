// js/first-person.js - 第一人稱漫遊控制器 (WASD、拖曳轉頭、碰撞檢測、自動尋路行走、手機搖桿)
class FirstPersonController {
  constructor(camera, domElement, campusData) {
    this.camera = camera;
    this.domElement = domElement;
    this.campusData = campusData;
    
    this.enabled = false;
    this.moveSpeed = 16.0; // 漫遊移動速度
    this.eyeHeight = 1.7;  // 視角高度 1.7 公尺
    
    // 運動狀態
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    
    // 視角旋轉
    this.yaw = 0;
    this.pitch = 0;
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    
    // 虛擬搖桿向量
    this.joystickDelta = { x: 0, y: 0 };
    
    // 自動循跡漫遊
    this.isAutoWalking = false;
    this.autoPath = [];
    this.currentPathIndex = 0;
    this.autoWalkSpeed = 10.0;
    
    // 建物碰撞邊界 (AABB)
    this.collisionBoxes = [];
    this.initColliders();
    this.initEventListeners();
  }

  initColliders() {
    this.collisionBoxes = [];
    if (!this.campusData || !this.campusData.buildings) return;
    
    this.campusData.buildings.forEach(b => {
      const p = b.position;
      const d = b.dimensions;
      // 擴展碰撞緩衝區
      this.collisionBoxes.push({
        id: b.id,
        name: b.name,
        minX: p.x - d.width / 2 - 1.2,
        maxX: p.x + d.width / 2 + 1.2,
        minZ: p.z - d.depth / 2 - 1.2,
        maxZ: p.z + d.depth / 2 + 1.2
      });
    });
  }

  checkCollision(nextX, nextZ) {
    for (const box of this.collisionBoxes) {
      if (nextX >= box.minX && nextX <= box.maxX && nextZ >= box.minZ && nextZ <= box.maxZ) {
        return true; // 發生碰撞
      }
    }
    return false;
  }

  initEventListeners() {
    // 鍵盤移動監聽
    window.addEventListener('keydown', (e) => {
      if (!this.enabled) return;
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': this.moveForward = true; break;
        case 'KeyS': case 'ArrowDown': this.moveBackward = true; break;
        case 'KeyA': case 'ArrowLeft': this.moveLeft = true; break;
        case 'KeyD': case 'ArrowRight': this.moveRight = true; break;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (!this.enabled) return;
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': this.moveForward = false; break;
        case 'KeyS': case 'ArrowDown': this.moveBackward = false; break;
        case 'KeyA': case 'ArrowLeft': this.moveLeft = false; break;
        case 'KeyD': case 'ArrowRight': this.moveRight = false; break;
      }
    });

    // 滑鼠拖曳轉頭
    this.domElement.addEventListener('pointerdown', (e) => {
      if (!this.enabled) return;
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.enabled || !this.isDragging) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.yaw -= deltaX * 0.0035;
      this.pitch -= deltaY * 0.0035;
      this.pitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.pitch));

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
      this.updateCameraRotation();
    });

    window.addEventListener('pointerup', () => {
      this.isDragging = false;
    });
  }

  updateCameraRotation() {
    // Euler 視角更新
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    euler.x = this.pitch;
    euler.y = this.yaw;
    this.camera.quaternion.setFromEuler(euler);
  }

  startAutoWalking(pathNodes) {
    if (!pathNodes || pathNodes.length < 2) return;
    this.autoPath = pathNodes;
    this.currentPathIndex = 0;
    this.isAutoWalking = true;
    
    // 設定初始位置為起點
    this.teleportTo(pathNodes[0].x, pathNodes[0].z);
  }

  stopAutoWalking() {
    this.isAutoWalking = false;
  }

  teleportTo(x, z) {
    this.camera.position.set(x, this.eyeHeight, z);
  }

  update(delta) {
    if (!this.enabled) return;

    // 1. 自動尋路沿線行走
    if (this.isAutoWalking && this.autoPath.length > 0) {
      const targetNode = this.autoPath[this.currentPathIndex];
      const curX = this.camera.position.x;
      const curZ = this.camera.position.z;
      const dx = targetNode.x - curX;
      const dz = targetNode.z - curZ;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < 1.0) {
        this.currentPathIndex++;
        if (this.currentPathIndex >= this.autoPath.length) {
          this.isAutoWalking = false;
          if (window.showToast) window.showToast('已抵達路徑目的地！');
          return;
        }
      } else {
        const step = Math.min(dist, this.autoWalkSpeed * delta);
        this.camera.position.x += (dx / dist) * step;
        this.camera.position.z += (dz / dist) * step;
        
        // 平滑旋轉朝向目標
        this.yaw = Math.atan2(-dx, -dz);
        this.updateCameraRotation();
      }
      return;
    }

    // 2. 玩家手動鍵盤 / 搖桿移動
    const moveX = (this.moveRight ? 1 : 0) - (this.moveLeft ? 1 : 0) + this.joystickDelta.x;
    const moveZ = (this.moveBackward ? 1 : 0) - (this.moveForward ? 1 : 0) + this.joystickDelta.y;

    if (moveX !== 0 || moveZ !== 0) {
      const forward = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, this.yaw, 0));
      const right = new THREE.Vector3(1, 0, 0).applyEuler(new THREE.Euler(0, this.yaw, 0));

      const dir = forward.clone().multiplyScalar(-moveZ).add(right.clone().multiplyScalar(moveX)).normalize();
      const stepDist = this.moveSpeed * delta;

      const nextX = this.camera.position.x + dir.x * stepDist;
      const nextZ = this.camera.position.z + dir.z * stepDist;

      // 建物碰撞阻擋測試
      if (!this.checkCollision(nextX, nextZ)) {
        this.camera.position.x = nextX;
        this.camera.position.z = nextZ;
      }
    }

    // 恆定視角高度
    this.camera.position.y = this.eyeHeight;
  }
}

window.FirstPersonController = FirstPersonController;
