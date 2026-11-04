// js/canvas-whiteboard.js - 建築物、樓層與病房名稱「手繪標註畫布」與「2D 病房平面配置畫布」模組

class CanvasWhiteboardManager {
  constructor(app) {
    this.app = app;
    this.isScreenCanvasActive = false;

    // 繪圖狀態
    this.currentTool = 'pen'; // 'pen' | 'highlighter' | 'arrow' | 'rect' | 'circle' | 'text' | 'eraser'
    this.currentColor = '#ef4444'; // 預設紅色
    this.currentLineWidth = 3;
    this.isDrawing = false;
    this.startX = 0;
    this.startY = 0;
    this.history = [];
    this.historyStep = -1;

    // 螢幕覆蓋畫布元素
    this.overlayCanvas = null;
    this.overlayCtx = null;
    this.toolbarEl = null;

    // 2D 病房平面畫布狀態
    this.wardModal = null;
    this.wardCanvas = null;
    this.wardCtx = null;
    this.wardPan = { x: 0, y: 0 };
    this.wardZoom = 1.0;
    this.isPanningWard = false;
    this.wardPanStart = { x: 0, y: 0 };
    this.wardActiveBuildingId = 'E01_MAIN';
    this.wardActiveFloor = '7F';
    this.wardDrawings = []; // 專屬於當前病房畫布的手繪筆跡
    this.isDrawingOnWard = false;
    this.wardTool = 'pen';
    this.wardColor = '#ef4444';
    this.wardLineWidth = 3;
    this.wardHistory = [];

    this.init();
  }

  init() {
    this.createScreenOverlayCanvas();
    this.createMarkupToolbar();
    this.createWardCanvasModal();
    this.bindGlobalEvents();
  }

  // 1. 建立 3D 螢幕塗鴉標註覆蓋畫布
  createScreenOverlayCanvas() {
    const container = document.getElementById('canvas-container') || document.body;
    const canvas = document.createElement('canvas');
    canvas.id = 'markup-overlay-canvas';
    canvas.className = 'markup-overlay-canvas';
    canvas.style.display = 'none';

    container.appendChild(canvas);
    this.overlayCanvas = canvas;
    this.overlayCtx = canvas.getContext('2d');

    this.resizeScreenCanvas();
    window.addEventListener('resize', () => this.resizeScreenCanvas());

    // 繪圖事件綁定
    canvas.addEventListener('mousedown', (e) => this.onPointerDown(e, canvas, this.overlayCtx, this.history, false));
    window.addEventListener('mousemove', (e) => this.onPointerMove(e, canvas, this.overlayCtx, false));
    window.addEventListener('mouseup', (e) => this.onPointerUp(e, canvas, this.overlayCtx, this.history, false));

    // 觸控支援
    canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', { clientX: touch.clientX, clientY: touch.clientY });
      canvas.dispatchEvent(mouseEvent);
    }, { passive: false });
    window.addEventListener('touchmove', (e) => {
      if (!this.isDrawing) return;
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', { clientX: touch.clientX, clientY: touch.clientY });
      window.dispatchEvent(mouseEvent);
    }, { passive: false });
    window.addEventListener('touchend', () => {
      const mouseEvent = new MouseEvent('mouseup', {});
      window.dispatchEvent(mouseEvent);
    });
  }

  resizeScreenCanvas() {
    if (!this.overlayCanvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.overlayCanvas.width = w * dpr;
    this.overlayCanvas.height = h * dpr;
    this.overlayCanvas.style.width = w + 'px';
    this.overlayCanvas.style.height = h + 'px';
    this.overlayCtx.scale(dpr, dpr);
    this.redrawHistory(this.overlayCtx, this.history);
  }

  // 2. 建立螢幕浮動手繪標註工具列
  createMarkupToolbar() {
    const bar = document.createElement('div');
    bar.id = 'canvas-markup-toolbar';
    bar.className = 'canvas-markup-toolbar glass-panel';
    bar.style.display = 'none';

    bar.innerHTML = `
      <div class="toolbar-drag-handle" title="拖曳工具列">
        <span>🎨 畫布手繪標註工具</span>
      </div>
      <div class="toolbar-tool-group">
        <button class="tool-btn active" data-tool="pen" title="自由手繪畫筆">✏️ 畫筆</button>
        <button class="tool-btn" data-tool="highlighter" title="半透明螢光標記筆">🖍️ 螢光筆</button>
        <button class="tool-btn" data-tool="arrow" title="繪製指示箭頭">➡️ 箭頭</button>
        <button class="tool-btn" data-tool="rect" title="繪製矩形框">🔲 矩形</button>
        <button class="tool-btn" data-tool="circle" title="繪製圈選標記">⭕ 圓圈</button>
        <button class="tool-btn" data-tool="text" title="點擊畫布加入文字註記">🔤 文字</button>
        <button class="tool-btn" data-tool="eraser" title="橡皮擦擦除">🧹 橡皮擦</button>
      </div>

      <div class="toolbar-separator"></div>

      <div class="toolbar-colors">
        <span class="color-dot active" data-color="#ef4444" style="background:#ef4444;" title="警戒紅"></span>
        <span class="color-dot" data-color="#f59e0b" style="background:#f59e0b;" title="警告黃"></span>
        <span class="color-dot" data-color="#10b981" style="background:#10b981;" title="安全綠"></span>
        <span class="color-dot" data-color="#3b82f6" style="background:#3b82f6;" title="醫療藍"></span>
        <span class="color-dot" data-color="#8b5cf6" style="background:#8b5cf6;" title="管控紫"></span>
        <span class="color-dot" data-color="#ffffff" style="background:#ffffff;border:1px solid #999;" title="純白"></span>
      </div>

      <div class="toolbar-separator"></div>

      <div class="toolbar-size">
        <button class="size-btn" data-size="2" title="細">細</button>
        <button class="size-btn active" data-size="4" title="中">中</button>
        <button class="size-btn" data-size="8" title="粗">粗</button>
      </div>

      <div class="toolbar-separator"></div>

      <div class="toolbar-actions">
        <button id="btn-markup-undo" class="action-btn" title="復原上一步">↩️ 復原</button>
        <button id="btn-markup-clear" class="action-btn" title="清除所有筆跡">🗑️ 清除</button>
        <button id="btn-markup-export" class="action-btn primary" title="下載標註圖檔">💾 下載截圖</button>
      </div>
      <button id="btn-markup-close" class="action-btn close-btn window-close" title="關閉畫布" aria-label="關閉畫布">✕ 關閉</button>
    `;

    document.body.appendChild(bar);
    this.toolbarEl = bar;

    // 綁定工具切換
    bar.querySelectorAll('.tool-btn').forEach(btn => {
      btn.onclick = () => {
        bar.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTool = btn.dataset.tool;
      };
    });

    // 顏色切換
    bar.querySelectorAll('.color-dot').forEach(dot => {
      dot.onclick = () => {
        bar.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        this.currentColor = dot.dataset.color;
      };
    });

    // 粗細切換
    bar.querySelectorAll('.size-btn').forEach(btn => {
      btn.onclick = () => {
        bar.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentLineWidth = parseInt(btn.dataset.size, 10);
      };
    });

    // 功能按鈕
    bar.querySelector('#btn-markup-undo').onclick = () => this.undo(this.overlayCtx, this.history);
    bar.querySelector('#btn-markup-clear').onclick = () => this.clear(this.overlayCtx, this.history);
    bar.querySelector('#btn-markup-export').onclick = () => this.exportSnapshot();
    bar.querySelector('#btn-markup-close').onclick = () => this.toggleScreenCanvas(false);
  }

  // 切換螢幕手繪畫布模式
  toggleScreenCanvas(enable) {
    if (enable === undefined) {
      enable = !this.isScreenCanvasActive;
    }
    this.isScreenCanvasActive = enable;

    const navBtn = document.getElementById('btn-toggle-canvas');
    if (navBtn) {
      if (enable) {
        navBtn.classList.add('active');
        navBtn.innerHTML = '🎨 畫布模式中 (開啟)';
      } else {
        navBtn.classList.remove('active');
        navBtn.innerHTML = '🎨 畫布功能';
      }
    }

    if (enable) {
      this.overlayCanvas.style.display = 'block';
      this.toolbarEl.style.display = 'flex';
      this.overlayCanvas.style.pointerEvents = 'auto';
      this.resizeScreenCanvas();
    } else {
      this.overlayCanvas.style.display = 'none';
      this.toolbarEl.style.display = 'none';
      this.overlayCanvas.style.pointerEvents = 'none';
    }
  }

  // 繪圖通用指標處理
  onPointerDown(e, canvas, ctx, historyList, isWardMode) {
    if (e.button !== 0 && !e.touches) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    const tool = isWardMode ? this.wardTool : this.currentTool;
    const color = isWardMode ? this.wardColor : this.currentColor;
    const width = isWardMode ? this.wardLineWidth : this.currentLineWidth;

    if (tool === 'text') {
      const text = prompt('請輸入要標註在畫布上的文字 (如: 加強清消 / 隔離病室 / 轉床備忘):');
      if (text) {
        historyList.push({
          type: 'text',
          text,
          x,
          y,
          color,
          fontSize: width * 4 + 12
        });
        this.redrawHistory(ctx, historyList);
      }
      return;
    }

    this.isDrawing = true;
    this.startX = x;
    this.startY = y;

    // 開啟一條新筆畫
    this.currentPath = {
      type: tool,
      color: color,
      width: width,
      points: [{ x, y }],
      startX: x,
      startY: y,
      endX: x,
      endY: y
    };
  }

  onPointerMove(e, canvas, ctx, isWardMode) {
    if (!this.isDrawing || !this.currentPath) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    const tool = this.currentPath.type;
    const historyList = isWardMode ? this.wardHistory : this.history;

    if (tool === 'pen' || tool === 'highlighter' || tool === 'eraser') {
      this.currentPath.points.push({ x, y });
      this.redrawHistory(ctx, historyList);
      this.drawSinglePath(ctx, this.currentPath);
    } else if (tool === 'arrow' || tool === 'rect' || tool === 'circle') {
      this.currentPath.endX = x;
      this.currentPath.endY = y;
      this.redrawHistory(ctx, historyList);
      this.drawSinglePath(ctx, this.currentPath);
    }
  }

  onPointerUp(e, canvas, ctx, historyList, isWardMode) {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    if (this.currentPath) {
      historyList.push(this.currentPath);
      this.currentPath = null;
      this.redrawHistory(ctx, historyList);
    }
  }

  drawSinglePath(ctx, item) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (item.type === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = item.width * 4;
      ctx.beginPath();
      item.points.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
    } else if (item.type === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = item.color;
      ctx.lineWidth = item.width;
      ctx.beginPath();
      item.points.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
    } else if (item.type === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = item.color;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = item.width * 3.5;
      ctx.beginPath();
      item.points.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
    } else if (item.type === 'arrow') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = item.color;
      ctx.fillStyle = item.color;
      ctx.lineWidth = item.width;
      this.drawArrow(ctx, item.startX, item.startY, item.endX, item.endY, item.width * 3);
    } else if (item.type === 'rect') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = item.color;
      ctx.lineWidth = item.width;
      const w = item.endX - item.startX;
      const h = item.endY - item.startY;
      ctx.strokeRect(item.startX, item.startY, w, h);
    } else if (item.type === 'circle') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = item.color;
      ctx.lineWidth = item.width;
      const rx = Math.abs(item.endX - item.startX) / 2;
      const ry = Math.abs(item.endY - item.startY) / 2;
      const cx = (item.startX + item.endX) / 2;
      const cy = (item.startY + item.endY) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (item.type === 'text') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = item.color;
      ctx.font = `bold ${item.fontSize || 16}px 'Noto Sans TC', sans-serif`;
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(item.text, item.x, item.y);
    }

    ctx.restore();
  }

  drawArrow(ctx, fromX, fromY, toX, toY, headLength = 12) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // 箭頭頂點
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  }

  redrawHistory(ctx, historyList) {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    historyList.forEach(item => {
      this.drawSinglePath(ctx, item);
    });
  }

  undo(ctx, historyList) {
    if (historyList.length > 0) {
      historyList.pop();
      this.redrawHistory(ctx, historyList);
    }
  }

  clear(ctx, historyList) {
    if (confirm('確定要清除畫布上的所有手繪標註嗎？')) {
      historyList.length = 0;
      this.redrawHistory(ctx, historyList);
    }
  }

  // 下載截圖 (將 3D WebGL 畫布與手繪 Overlay 合成匯出)
  exportSnapshot() {
    const threeCanvas = this.app.renderer ? this.app.renderer.domElement : null;
    const overlayCanvas = this.overlayCanvas;
    if (!threeCanvas || !overlayCanvas) return;

    // 先強制 Three.js 渲染一幀
    this.app.renderer.render(this.app.scene, this.app.camera);

    const merged = document.createElement('canvas');
    merged.width = overlayCanvas.width;
    merged.height = overlayCanvas.height;
    const mCtx = merged.getContext('2d');

    // 底圖為 3D 場景
    mCtx.drawImage(threeCanvas, 0, 0, merged.width, merged.height);
    // 疊加手繪標註
    mCtx.drawImage(overlayCanvas, 0, 0, merged.width, merged.height);

    // 水印標記
    mCtx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    mCtx.fillRect(16, merged.height - 48, 480, 36);
    mCtx.fillStyle = '#ffffff';
    mCtx.font = 'bold 16px "Noto Sans TC", sans-serif';
    const nowStr = new Date().toLocaleString('zh-TW', { hour12: false });
    mCtx.fillText(`臺大醫院智慧監測系統標註檔 (${nowStr})`, 28, merged.height - 24);

    const link = document.createElement('a');
    link.download = `NTUH_3D_Annotation_${Date.now()}.png`;
    link.href = merged.toDataURL('image/png');
    link.click();
  }

  // ========================================================
  // 3. 專屬「樓層與病房名稱平面配置畫布」 (2D Ward Canvas)
  // ========================================================
  createWardCanvasModal() {
    const modal = document.createElement('div');
    modal.id = 'ward-canvas-modal';
    modal.className = 'ward-canvas-modal';
    modal.style.display = 'none';

    modal.innerHTML = `
      <div class="ward-canvas-dialog">
        <div class="ward-canvas-header">
          <div class="ward-canvas-title-group" style="display:flex;align-items:center;gap:8px;">
            <span class="ward-canvas-badge">2D 畫布檢視</span>
            <span id="ward-canvas-title" class="ward-canvas-title">建物與病房名稱配置畫布</span>
            <div id="ward-canvas-wing-tabs" style="display:flex;gap:4px;margin-left:8px;"></div>
          </div>
          <div class="ward-canvas-tools-bar">
            <!-- 畫筆切換 -->
            <button class="w-tool-btn active" data-tool="pen" title="畫筆">✏️ 標註</button>
            <button class="w-tool-btn" data-tool="highlighter" title="螢光筆">🖍️ 螢光</button>
            <button class="w-tool-btn" data-tool="arrow" title="箭頭">➡️ 箭頭</button>
            <button class="w-tool-btn" data-tool="circle" title="圈選">⭕ 圈選</button>
            <button class="w-tool-btn" data-tool="text" title="文字">🔤 文字</button>
            <button class="w-tool-btn" data-tool="eraser" title="橡皮擦">🧹 擦除</button>

            <span class="w-sep"></span>

            <!-- 色彩選擇 -->
            <span class="w-color-dot active" data-color="#ef4444" style="background:#ef4444;"></span>
            <span class="w-color-dot" data-color="#f59e0b" style="background:#f59e0b;"></span>
            <span class="w-color-dot" data-color="#10b981" style="background:#10b981;"></span>
            <span class="w-color-dot" data-color="#3b82f6" style="background:#3b82f6;"></span>

            <span class="w-sep"></span>

            <!-- 視圖控制 -->
            <button id="btn-wcanvas-zoom-in" class="w-action-btn" title="放大">+</button>
            <button id="btn-wcanvas-zoom-out" class="w-action-btn" title="縮小">-</button>
            <button id="btn-wcanvas-zoom-reset" class="w-action-btn" title="重設視角">100%</button>
            <button id="btn-wcanvas-undo" class="w-action-btn" title="復原">↩️</button>
            <button id="btn-wcanvas-clear" class="w-action-btn" title="清除手繪">🗑️</button>
            <button id="btn-wcanvas-export" class="w-action-btn primary" title="儲存畫布圖檔">💾 下載圖檔</button>
            <button id="btn-wcanvas-switch-3d" class="w-action-btn primary" style="background:#0284c7;color:#fff;" title="切換至 3D 鳥瞰透視圖">🏢 3D 透視</button>
          </div>
          <button id="btn-wcanvas-close" class="w-action-btn close window-close" title="關閉平面圖" aria-label="關閉平面圖">✕ 關閉</button>
        </div>

        <div class="ward-canvas-body" id="ward-canvas-body">
          <canvas id="ward-plan-canvas"></canvas>
          <div class="ward-canvas-legend">
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
              <span style="font-weight:800;color:#0f172a;">🗺️ 平面圖標註圖例：</span>
              <span><span class="legend-box" style="background:#e0f2fe;border-color:#0284c7;"></span> 一般病室</span>
              <span><span class="legend-box" style="background:#fee2e2;border-color:#dc2626;"></span> 負壓隔離房</span>
              <span><span class="legend-box" style="background:#fef3c7;border-color:#d97706;"></span> 護理站</span>
              <span><span class="legend-box" style="background:#fed7aa;border-color:#ea580c;"></span> 污物室</span>
              <span><span class="legend-box" style="background:#dcfce7;border-color:#16a34a;"></span> 清潔間</span>
              <span><span class="legend-box" style="background:#cbd5e1;border-color:#475569;"></span> 走廊/公共區</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;border-top:1px solid #e2e8f0;padding-top:4px;margin-top:2px;">
              <span style="font-weight:800;color:#b45309;">🛏️ 床位感管屬性：</span>
              <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#ef4444;vertical-align:middle;margin-right:2px;"></span> CRAB (鮮紅)</span>
              <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#f97316;vertical-align:middle;margin-right:2px;"></span> CRE (橙橘)</span>
              <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#a855f7;vertical-align:middle;margin-right:2px;"></span> VRE (紫色)</span>
              <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#eab308;vertical-align:middle;margin-right:2px;"></span> MRSA (金黃)</span>
              <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#ec4899;vertical-align:middle;margin-right:2px;"></span> 接觸隔離 (桃紅)</span>
              <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#10b981;vertical-align:middle;margin-right:2px;"></span> 導管留置 (翠綠)</span>
              <span style="color:#64748b;font-size:10px;font-weight:normal;">(2種以上：多層疊加框線 + 並列圓點)</span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.wardModal = modal;
    this.wardCanvas = modal.querySelector('#ward-plan-canvas');
    this.wardCtx = this.wardCanvas.getContext('2d');

    this.bindWardCanvasEvents();
  }

  bindWardCanvasEvents() {
    const modal = this.wardModal;
    const canvas = this.wardCanvas;

    // 工具按鈕事件
    modal.querySelectorAll('.w-tool-btn').forEach(btn => {
      btn.onclick = () => {
        modal.querySelectorAll('.w-tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.wardTool = btn.dataset.tool;
      };
    });

    // 顏色點選
    modal.querySelectorAll('.w-color-dot').forEach(dot => {
      dot.onclick = () => {
        modal.querySelectorAll('.w-color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        this.wardColor = dot.dataset.color;
      };
    });

    // 縮放按鈕
    modal.querySelector('#btn-wcanvas-zoom-in').onclick = () => {
      this.wardZoom = Math.min(3.0, this.wardZoom * 1.2);
      this.renderWardCanvas();
    };
    modal.querySelector('#btn-wcanvas-zoom-out').onclick = () => {
      this.wardZoom = Math.max(0.1, this.wardZoom / 1.2);
      this.renderWardCanvas();
    };
    modal.querySelector('#btn-wcanvas-zoom-reset').onclick = () => {
      this.applyWardFocus(this.wardActiveWard);
      this.renderWardCanvas();
    };

    // 復原與清除
    modal.querySelector('#btn-wcanvas-undo').onclick = () => {
      this.undo(this.wardCtx, this.wardHistory);
      this.renderWardCanvas();
    };
    modal.querySelector('#btn-wcanvas-clear').onclick = () => {
      if (confirm('確定要清除病房畫布上的所有手繪標註嗎？')) {
        this.wardHistory.length = 0;
        this.renderWardCanvas();
      }
    };

    // 匯出下載
    modal.querySelector('#btn-wcanvas-export').onclick = () => this.exportWardCanvas();

    // 關閉
    const btnSwitch3D = modal.querySelector('#btn-wcanvas-switch-3d');
    if (btnSwitch3D) {
      btnSwitch3D.onclick = () => {
        modal.style.display = 'none';
        if (this.app) {
          if (this.app.switchTo3DView) {
            this.app.switchTo3DView();
          } else {
            this.app.sliceBuildingFloor(this.wardActiveBuildingId, this.wardActiveFloor);
          }
          if (this.app.focusWardIn3D) {
            this.app.focusWardIn3D(this.wardActiveBuildingId, this.wardActiveFloor, this.wardActiveWard);
          }
        }
      };
    }

    modal.querySelector('#btn-wcanvas-close').onclick = () => {
      modal.style.display = 'none';
    };

    // 畫布點擊偵測病房 (當非拖曳平移且非繪圖時，點選病房)
    canvas.addEventListener('click', (e) => {
      if (this.isPanningWard || this.wardTool !== 'pen') return;
      if (this.redrawnScene) {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width/2 - this.wardPan.x) / this.wardZoom + this.redrawnScene.width / 2;
        const y = (e.clientY - rect.top - rect.height/2 - this.wardPan.y) / this.wardZoom + this.redrawnScene.height / 2;
        const hit = this.redrawnScene.rooms.find(r => x >= r.x && x <= r.x+r.w && y >= r.y && y <= r.y+r.h);
        if (hit) {
          this.selectedRoomCode = hit.code;
          this.renderWardCanvas();
          if (this.app?.syncSelectedWard) this.app.syncSelectedWard(hit.ward);
          if (this.app?.selectWardRoom) this.app.selectWardRoom(hit.code);
        }
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const mx = (e.clientX - rect.left);
      const my = (e.clientY - rect.top);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const scaleFactor = 9.5;

      const worldX = (mx - (w / 2 + this.wardPan.x)) / this.wardZoom / scaleFactor;
      const worldZ = (my - (h / 2 + this.wardPan.y)) / this.wardZoom / scaleFactor;

      const wardData = (window.WARD_3D_LAYOUT_DATA && window.WARD_3D_LAYOUT_DATA[this.wardActiveBuildingId])
        ? window.WARD_3D_LAYOUT_DATA[this.wardActiveBuildingId][this.wardActiveFloor]
        : null;

      if (wardData && wardData.rooms) {
        const hitRoom = wardData.rooms.find(r => {
          const b = r.bounds;
          return worldX >= (b.x - b.width / 2) && worldX <= (b.x + b.width / 2) &&
                 worldZ >= (b.z - b.depth / 2) && worldZ <= (b.z + b.depth / 2);
        });

        if (hitRoom) {
          this.selectedRoomCode = hitRoom.roomCode;
          this.renderWardCanvas();
          if (this.app && this.app.selectWardRoom) {
            this.app.selectWardRoom(hitRoom.roomCode);
          }
        }
      }
    });

    // 畫布滑鼠事件 (支援拖曳平移與手繪塗鴉)
    canvas.addEventListener('mousedown', (e) => {
      if (e.shiftKey || e.button === 1 || e.button === 2) {
        // Shift 或中鍵/右鍵拖曳平移
        this.isPanningWard = true;
        this.wardPanStart = { x: e.clientX - this.wardPan.x, y: e.clientY - this.wardPan.y };
        return;
      }
      this.onPointerDown(e, canvas, this.wardCtx, this.wardHistory, true);
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isPanningWard) {
        this.wardPan.x = e.clientX - this.wardPanStart.x;
        this.wardPan.y = e.clientY - this.wardPanStart.y;
        this.renderWardCanvas();
        return;
      }
      if (this.isDrawing) {
        this.onPointerMove(e, canvas, this.wardCtx, true);
        this.renderWardCanvas();
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (this.isPanningWard) {
        this.isPanningWard = false;
        return;
      }
      if (this.isDrawing) {
        this.onPointerUp(e, canvas, this.wardCtx, this.wardHistory, true);
        this.renderWardCanvas();
      }
    });

    // 滾輪縮放
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      this.wardZoom = Math.min(3.5, Math.max(0.1, this.wardZoom * zoomFactor));
      this.renderWardCanvas();
    }, { passive: false });
  }

  // 根據選擇之病房分區自動設定畫布縮放與視角中心
  applyWardFocus(ward) {
    if (window.WardPlan2D) {
      const body = document.getElementById('ward-canvas-body');
      this.wardPan = { x: 0, y: 0 };
      const scene = window.WardPlan2D.scene(this.wardActiveBuildingId, this.wardActiveFloor, ward);
      this.wardZoom = Math.min((body?.clientWidth || 1600) / scene.width, (body?.clientHeight || 800) / scene.height) * 0.94;
      return;
    }
    if (!ward || ward === 'ALL') {
      this.wardPan = { x: 0, y: 0 };
      this.wardZoom = 0.85;
      return;
    }
    const w = String(ward).toUpperCase();
    if (w.endsWith('C')) {
      this.wardPan = { x: 0, y: -160 };
      this.wardZoom = 1.45;
    } else if (w.endsWith('A')) {
      this.wardPan = { x: 0, y: 380 };
      this.wardZoom = 1.45;
    } else if (w.endsWith('B')) {
      this.wardPan = { x: 0, y: 150 };
      this.wardZoom = 1.45;
    } else if (w.endsWith('D')) {
      this.wardPan = { x: 0, y: -400 };
      this.wardZoom = 1.45;
    } else {
      this.wardPan = { x: 0, y: 0 };
      this.wardZoom = 1.1;
    }
  }

  // 動態渲染 2D 畫布頂部之病房翼區切換標籤 (如 全部, 12A, 12B, 12C, 12D)
  renderModalWingTabs() {
    const tabsContainer = document.getElementById('ward-canvas-wing-tabs');
    if (!tabsContainer) return;
    tabsContainer.innerHTML = '';

    const bId = this.wardActiveBuildingId;
    const fTag = this.wardActiveFloor;
    const wings = ['ALL'];
    const wardData=window.WARD_3D_LAYOUT_DATA?.[bId]?.[fTag];
    for(const r of wardData?.rooms||[])if(r.ward&&!wings.includes(r.ward))wings.push(r.ward);
    for(const ward of Object.keys(wardData?.sourceTraceWards||{}))if(!wings.includes(ward))wings.push(ward);
    wings.splice(1,wings.length-1,...wings.slice(1).sort((a,b)=>a.localeCompare(b,'en',{numeric:true})));


    wings.forEach(w => {
      const tab = document.createElement('button');
      const isActive = (this.wardActiveWard === w);
      tab.className = `w-action-btn ${isActive ? 'primary' : ''}`;
      tab.style.fontSize = '11px';
      tab.style.padding = '3px 8px';
      tab.style.cursor = 'pointer';
      tab.style.borderRadius = '4px';
      tab.style.background = isActive ? '#0284c7' : '#f1f5f9';
      tab.style.color = isActive ? '#ffffff' : '#334155';
      tab.style.border = isActive ? '1px solid #0284c7' : '1px solid #cbd5e1';
      tab.innerText = (w === 'ALL') ? '全部' : `${w}`;
      tab.onclick = () => {
        this.wardActiveWard = w;
        this.applyWardFocus(w);
        this.renderModalWingTabs();
        this.renderWardCanvas();
        if (this.app && this.app.syncSelectedWard) {
          this.app.syncSelectedWard(w);
        }
      };
      tabsContainer.appendChild(tab);
    });
  }

  // 開啟並渲染特定建物與樓層之「2D 病房平面畫布」 (依需求優先呈現官方高解析建築圖紙，清晰無遮擋)
  openWardCanvas(buildingId, floorTarget, targetRoomCode = null, targetWard = 'ALL') {
    this.wardActiveBuildingId = buildingId || 'E01_MAIN';
    this.wardActiveFloor = floorTarget || '12F';
    this.selectedRoomCode = targetRoomCode;
    this.wardActiveWard = targetWard || 'ALL';
    this.wardModal.style.display = 'flex';

    // 自動聚焦該分區
    this.applyWardFocus(this.wardActiveWard);

    const b = (this.app.campusData && this.app.campusData.buildings)
      ? this.app.campusData.buildings.find(item => item.id === this.wardActiveBuildingId)
      : null;
    const bName = b ? b.name.split(' (')[0] : this.wardActiveBuildingId;

    const titleEl = document.getElementById('ward-canvas-title');
    if (titleEl) {
      titleEl.innerText = `${bName} ${this.wardActiveFloor} • 2D 病房配置圖`;
    }

    // 動態載入頂部分區按鈕
    this.renderModalWingTabs();

    this.resizeWardCanvas();
    this.renderWardCanvas();
    if (!this.wardResizeObserver && window.ResizeObserver) {
      this.wardResizeObserver = new ResizeObserver(() => {
        if (this.wardModal.style.display !== 'none') { this.resizeWardCanvas(); this.renderWardCanvas(); }
      });
      this.wardResizeObserver.observe(document.getElementById('ward-canvas-body'));
    }
  }

  resizeWardCanvas() {
    const body = document.getElementById('ward-canvas-body');
    if (!body || !this.wardCanvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = body.clientWidth;
    const h = body.clientHeight;

    this.wardCanvas.width = w * dpr;
    this.wardCanvas.height = h * dpr;
    this.wardCanvas.style.width = w + 'px';
    this.wardCanvas.style.height = h + 'px';
    this.wardCtx.scale(dpr, dpr);
    if (window.WardPlan2D) this.applyWardFocus(this.wardActiveWard);
  }

  // 繪製 2D 病房平面畫布主邏輯 (清晰呈現建物名稱、樓層、所有病房名稱、設施與病床)
  renderWardCanvas() {
    if (window.WardPlan2D) return window.WardPlan2D.render(this);
    const ctx = this.wardCtx;
    const canvas = this.wardCanvas;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    // 清空背景
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // 繪製建築藍圖底色與網格
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);

    // 繪製溫潤建築網格
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    const gridSize = 25 * this.wardZoom;
    const offsetX = (this.wardPan.x % gridSize);
    const offsetY = (this.wardPan.y % gridSize);
    for (let x = offsetX; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = offsetY; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    ctx.save();
    // 應用平移與縮放矩陣
    ctx.translate(w / 2 + this.wardPan.x, h / 2 + this.wardPan.y);
    ctx.scale(this.wardZoom, this.wardZoom);

    // 取得病房與隔間資料
    const bId = this.wardActiveBuildingId;
    const fTag = this.wardActiveFloor;
    const wardData = (window.WARD_3D_LAYOUT_DATA && window.WARD_3D_LAYOUT_DATA[bId])
      ? window.WARD_3D_LAYOUT_DATA[bId][fTag]
      : null;
    const fpInfo = (window.FLOORPLANS_DATA && window.FLOORPLANS_DATA[bId])
      ? window.FLOORPLANS_DATA[bId][fTag]
      : null;

    if (!this.cachedFloorplanImages) {
      this.cachedFloorplanImages = {};
    }

    const legendEl = this.wardModal ? this.wardModal.querySelector('.ward-canvas-legend') : null;
    if (legendEl && wardData) {
      legendEl.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <span style="font-weight:800;color:#0f172a;">🗺️ 平面圖標註圖例：</span>
          <span><span class="legend-box" style="background:#e0f2fe;border-color:#0284c7;"></span> 一般病室</span>
          <span><span class="legend-box" style="background:#fee2e2;border-color:#dc2626;"></span> 負壓隔離房</span>
          <span><span class="legend-box" style="background:#fef3c7;border-color:#d97706;"></span> 護理站</span>
          <span><span class="legend-box" style="background:#fed7aa;border-color:#ea580c;"></span> 污物室</span>
          <span><span class="legend-box" style="background:#dcfce7;border-color:#16a34a;"></span> 清潔間</span>
          <span><span class="legend-box" style="background:#cbd5e1;border-color:#475569;"></span> 走廊/公共區</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;border-top:1px solid #e2e8f0;padding-top:4px;margin-top:2px;">
          <span style="font-weight:800;color:#b45309;">🛏️ 床位感管屬性：</span>
          <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#ef4444;vertical-align:middle;margin-right:2px;"></span> CRAB (鮮紅)</span>
          <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#f97316;vertical-align:middle;margin-right:2px;"></span> CRE (橙橘)</span>
          <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#a855f7;vertical-align:middle;margin-right:2px;"></span> VRE (紫色)</span>
          <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#eab308;vertical-align:middle;margin-right:2px;"></span> MRSA (金黃)</span>
          <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#ec4899;vertical-align:middle;margin-right:2px;"></span> 接觸隔離 (桃紅)</span>
          <span><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#10b981;vertical-align:middle;margin-right:2px;"></span> 導管留置 (翠綠)</span>
          <span style="color:#64748b;font-size:10px;font-weight:normal;">(2種以上：多層疊加框線 + 並列圓點)</span>
        </div>
      `;
    }

    const scaleFactor = 9.5; // 公尺轉畫布像素比例

    
    if (fpInfo && fpInfo.image) {
      // 官方真實高解析建築平面圖 (依使用者明確指示：圖片清楚就行，清晰完整呈現建築原始圖紙)
      if (legendEl) {
        legendEl.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <span style="font-weight:700;color:#0f172a;display:inline-flex;align-items:center;gap:4px;">🗺️ ${fpInfo.title || `${fTag} 建築平面圖`}</span>
            <span style="color:#0369a1;background:#e0f2fe;padding:2px 8px;border-radius:12px;font-weight:600;font-size:11px;">📍 當前分區：${this.wardActiveWard === 'ALL' ? '全棟平面' : `${this.wardActiveWard}`}</span>
            <span style="color:#475569;font-size:11px;">🔍 滾輪縮放 / 按住拖曳平移 / 上方標註工具</span>
          </div>
        `;
      }

      let img = this.cachedFloorplanImages[fpInfo.image];
      if (!img) {
        img = new Image();
        img.src = fpInfo.image;
        img.onload = () => this.renderWardCanvas();
        this.cachedFloorplanImages[fpInfo.image] = img;
      }

      if (img.complete && img.naturalWidth > 0) {
        const imgW = img.naturalWidth;
        const imgH = img.naturalHeight;
        const targetW = 960;
        const targetH = targetW * (imgH / imgW);

        // 高品質平滑繪製與抗鋸齒
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // 繪製紙張底板與立體柔和陰影
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
        ctx.shadowBlur = 24;
        ctx.fillRect(-targetW / 2 - 12, -targetH / 2 - 12, targetW + 24, targetH + 24);
        ctx.shadowBlur = 0;

        // 繪製建築圖紙本體 (完整清晰原圖)
        ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
        ctx.restore();

        // 若指定特定病房分區 (例如 12C 區)，在圖面上標示當前聚焦分區標籤與輔助導引
        if (this.wardActiveWard && this.wardActiveWard !== 'ALL') {
          ctx.save();
          let tagY = 0;
          const wName = String(this.wardActiveWard).toUpperCase();
          if (wName.endsWith('A')) tagY = -targetH * 0.35;
          else if (wName.endsWith('B')) tagY = -targetH * 0.12;
          else if (wName.endsWith('C')) tagY = targetH * 0.12;
          else if (wName.endsWith('D')) tagY = targetH * 0.35;

          // 標記分區膠囊徽章
          const badgeText = `📍 ${this.wardActiveWard} (已自動聚焦)`;
          ctx.font = 'bold 15px "Noto Sans TC", sans-serif';
          const tw = ctx.measureText(badgeText).width;
          ctx.fillStyle = 'rgba(2, 132, 199, 0.95)';
          if (typeof ctx.roundRect === 'function') {
            ctx.beginPath();
            ctx.roundRect(-tw / 2 - 12, tagY - 15, tw + 24, 30, 6);
            ctx.fill();
          } else {
            ctx.fillRect(-tw / 2 - 12, tagY - 15, tw + 24, 30);
          }
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(badgeText, 0, tagY);

          // 柔和外框指引 (不遮擋建築線條與房號)
          ctx.strokeStyle = 'rgba(2, 132, 199, 0.45)';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([8, 6]);
          ctx.strokeRect(-targetW / 2 + 20, tagY - 105, targetW - 40, 210);
          ctx.restore();
        }

        // 頂部樓層平面圖標題
        ctx.save();
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 15px "Noto Sans TC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`🗺️ ${fpInfo.title || `${fTag} 建築平面圖`}`, 0, -targetH / 2 - 28);
        ctx.fillStyle = '#64748b';
        ctx.font = '12px "Noto Sans TC", sans-serif';
        ctx.fillText('（支援滑鼠滾輪縮放、按住拖曳平移畫布、上方螢光筆/箭頭/文字手繪批註）', 0, -targetH / 2 - 10);
        ctx.restore();
      } else {
        ctx.fillStyle = '#64748b';
        ctx.font = '15px "Noto Sans TC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`⏳ 正在載入 ${fTag} 官方建築平面圖，請稍候...`, 0, 0);
      }
    } else if (wardData) {

      // 1. 繪製走廊 (Corridors)
      (wardData.corridors || []).forEach(corr => {
        const b = corr.bounds;
        const px = b.x * scaleFactor;
        const py = b.z * scaleFactor;
        const pw = b.width * scaleFactor;
        const pd = b.depth * scaleFactor;
        ctx.fillStyle = '#cbd5e1';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.fillRect(px - pw / 2, py - pd / 2, pw, pd);
        ctx.strokeRect(px - pw / 2, py - pd / 2, pw, pd);
      });

      // 2. 繪製設施 (污物室、清潔間、電梯、公共設施)
      (wardData.facilities || []).forEach(fac => {
        const b = fac.bounds;
        const px = b.x * scaleFactor;
        const py = b.z * scaleFactor;
        const pw = b.width * scaleFactor;
        const pd = b.depth * scaleFactor;

        let fillCol = '#f1f5f9';
        let strokeCol = '#64748b';
        if (fac.type === 'dirty_utility') {
          fillCol = '#fed7aa'; // 污物室 橙粉
          strokeCol = '#ea580c';
        } else if (fac.type === 'clean_utility') {
          fillCol = '#dcfce7'; // 清潔間 淺綠
          strokeCol = '#16a34a';
        } else if (fac.type === 'isolation') {
          fillCol = '#fee2e2'; // 負壓隔離房 淺紅
          strokeCol = '#dc2626';
        }

        const isSelected = (this.selectedRoomCode === fac.id);
        if (isSelected) {
          ctx.fillStyle = '#fef08a'; // 明亮金黃高亮
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3.5;
        } else {
          ctx.fillStyle = fillCol;
          ctx.strokeStyle = strokeCol;
          ctx.lineWidth = 2;
        }
        ctx.fillRect(px - pw / 2, py - pd / 2, pw, pd);
        ctx.strokeRect(px - pw / 2, py - pd / 2, pw, pd);

        if (isSelected) {
          ctx.save();
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(px - pw / 2 - 3, py - pd / 2 - 3, pw + 6, pd + 6);
          ctx.restore();
        }

        // 繪製設施名稱文字標籤
        ctx.fillStyle = strokeCol;
        ctx.font = 'bold 11px "Noto Sans TC", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(fac.name, px, py);
      });

      // 3. 繪製護理站 (Nursing Stations)
      (wardData.nursingStations || []).forEach(ns => {
        const b = ns.bounds;
        const px = b.x * scaleFactor;
        const py = b.z * scaleFactor;
        const pw = b.width * scaleFactor;
        const pd = b.depth * scaleFactor;

        ctx.fillStyle = '#fef3c7';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2.5;
        ctx.fillRect(px - pw / 2, py - pd / 2, pw, pd);
        ctx.strokeRect(px - pw / 2, py - pd / 2, pw, pd);

        // 護理站名稱標籤
        ctx.fillStyle = '#b45309';
        ctx.font = 'bold 13px "Noto Sans TC", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`🏥 ${ns.name}`, px, py);
      });

      // 4. 繪製所有病房與病房名稱 (Rooms)
      (wardData.rooms || []).forEach(room => {
        const b = room.bounds;
        const px = b.x * scaleFactor;
        const py = b.z * scaleFactor;
        const pw = b.width * scaleFactor;
        const pd = b.depth * scaleFactor;

        let fillCol = '#e0f2fe';
        let strokeCol = '#0284c7';
        if (room.isNegativePressure) {
          fillCol = '#fee2e2';
          strokeCol = '#dc2626';
        }

        const isSelected = (this.selectedRoomCode === room.roomCode);
        if (isSelected) {
          ctx.fillStyle = '#fef08a'; // 明亮金黃高亮
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3.5;
        } else {
          ctx.fillStyle = fillCol;
          ctx.strokeStyle = strokeCol;
          ctx.lineWidth = 2;
        }
        ctx.fillRect(px - pw / 2, py - pd / 2, pw, pd);
        ctx.strokeRect(px - pw / 2, py - pd / 2, pw, pd);

        if (isSelected) {
          ctx.save();
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(px - pw / 2 - 3, py - pd / 2 - 3, pw + 6, pd + 6);
          ctx.restore();
        }

        // 病房編號標籤 (大字加粗)
        ctx.fillStyle = strokeCol;
        ctx.font = 'bold 12px "Noto Sans TC", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(room.roomCode, px, py - pd / 2 + 12);

        // 病房類型 (如 負壓 / 單人 / 雙人)
        ctx.fillStyle = '#475569';
        ctx.font = '10px "Noto Sans TC", sans-serif';
        const typeStr = room.isNegativePressure ? '負壓隔離' : (room.bedCount ? `${room.bedCount}人房` : '');
        ctx.fillText(typeStr, px, py + pd / 2 - 10);
      });

      // 5. 繪製病床位置與床號 (依使用者需求：平面圖標註床位屬性 CRAB/CRE/VRE/MRSA/接觸隔離/導管，若2種以上自動疊加框線+並列圓點)
      const curDate = (window.app && window.app.currentDate) ? window.app.currentDate : '2026-10-15';

      (wardData.beds || []).forEach(bed => {
        const px = bed.x * scaleFactor;
        const py = bed.z * scaleFactor;
        const bw = 1.8 * scaleFactor;
        const bd = 0.9 * scaleFactor;

        // 查詢該床位在當前日期的感管個案資訊
        let matchedCase = null;
        if (window.app && window.app.ipcData && window.app.ipcData.cases) {
          window.app.ipcData.cases.forEach(cs => {
            if (!cs || cs.pathogen === 'NORMAL' || cs.pathogen === 'NORMAL_BED') return;
            (cs.movement_history || []).forEach(m => {
              if (m.bed_id === bed.bedId && curDate >= m.start_date && curDate <= m.end_date) {
                matchedCase = cs;
              }
            });
          });
        }

        const defs = [];
        if (matchedCase) {
          const pathogenDefs = {
            'CRAB': { color: '#ef4444', name: 'CRAB', tag: 'CRAB' },
            'CRE':  { color: '#f97316', name: 'CRE', tag: 'CRE' },
            'VRE':  { color: '#a855f7', name: 'VRE', tag: 'VRE' },
            'MRSA': { color: '#eab308', name: 'MRSA', tag: 'MRSA' }
          };
          if (matchedCase.pathogen && pathogenDefs[matchedCase.pathogen]) {
            defs.push(pathogenDefs[matchedCase.pathogen]);
          }
          if (matchedCase.isolation_type) {
            if (matchedCase.isolation_type.includes('Contact') || matchedCase.isolation_type.includes('接觸')) {
              defs.push({ color: '#ec4899', name: '接觸隔離', tag: '接觸隔離' });
            } else if (matchedCase.isolation_type.includes('Isolation') || matchedCase.isolation_type.includes('負壓')) {
              defs.push({ color: '#06b6d4', name: '負壓隔離', tag: '負壓隔離' });
            }
          }
          if (matchedCase.device_days) {
            const dItems = [];
            if (matchedCase.device_days.CVC > 0) dItems.push('CVC');
            if (matchedCase.device_days.Foley > 0) dItems.push('Foley');
            if (matchedCase.device_days.Endotracheal > 0) dItems.push('Endo');
            if (dItems.length > 0) {
              defs.push({ color: '#10b981', name: '導管留置', tag: '導管' });
            }
          }
          if (matchedCase.movement_history && matchedCase.movement_history.length >= 2) {
            defs.push({ color: '#3b82f6', name: '轉床歷程', tag: '轉床' });
          }
        }

        // 床底色與第 1 層邊框 (外框線)
        ctx.fillStyle = matchedCase ? '#fefce8' : '#ffffff';
        ctx.strokeStyle = defs.length > 0 ? defs[0].color : '#475569';
        ctx.lineWidth = defs.length > 0 ? 2.5 : 1.5;
        ctx.fillRect(px - bw / 2, py - bd / 2, bw, bd);
        ctx.strokeRect(px - bw / 2, py - bd / 2, bw, bd);

        // 若符合 2 種以上屬性：多層疊加框線 (Stacked Borders)
        if (defs.length >= 2) {
          ctx.strokeStyle = defs[1].color;
          ctx.lineWidth = 2.0;
          ctx.strokeRect(px - bw / 2 + 2.5, py - bd / 2 + 2.5, bw - 5, bd - 5);
        }
        if (defs.length >= 3) {
          ctx.strokeStyle = defs[2].color;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px - bw / 2 + 5, py - bd / 2 + 5, bw - 10, bd - 10);
        }

        // 枕頭 (西側靠牆端)
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(px - bw / 2 + 1, py - bd / 2 + 1, bw * 0.22, bd - 2);

        // 若有感管屬性：床前並列彩色圓點 (Side-by-side color dots)
        if (defs.length > 0) {
          const dotR = 3.5;
          const dotGap = 9;
          const startDotX = px - ((defs.length - 1) * dotGap) / 2;
          defs.forEach((d, dIdx) => {
            const dx = startDotX + dIdx * dotGap;
            const dy = py - bd / 2 - 5;
            ctx.beginPath();
            ctx.arc(dx, dy, dotR, 0, Math.PI * 2);
            ctx.fillStyle = d.color;
            ctx.fill();
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1;
            ctx.stroke();
          });
        }

        // 床號標示 (清晰標記病床號碼如 1床、2床、3床，含高對比度白底膠囊)
        const parts = bed.bedId.split('-');
        const bedSub = parts[parts.length - 1] || '1';
        let bedLabelText = `${bedSub}床`;
        if (defs.length > 0) {
          bedLabelText += ` (${defs[0].tag})`;
        }

        ctx.font = 'bold 9px "Noto Sans TC", sans-serif';
        const tw = ctx.measureText(bedLabelText).width;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(px + bw * 0.12 - tw / 2 - 2, py - 6, tw + 4, 12);
        ctx.strokeStyle = defs.length > 0 ? defs[0].color : '#94a3b8';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(px + bw * 0.12 - tw / 2 - 2, py - 6, tw + 4, 12);

        ctx.fillStyle = defs.length > 0 ? defs[0].color : '#0f172a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bedLabelText, px + bw * 0.12, py);
      });
      ctx.textAlign = 'center';
      ctx.fillText(`本樓層 (${fTag}) 尚無平面圖圖資，請切換至已建置樓層 (如東址 7F、12F、西五棟 5W2)`, 0, 0);
    }

    // 繪製使用者在 2D 病房畫布上的手繪標註歷史 (筆畫與箭頭)
    this.wardHistory.forEach(item => {
      this.drawSinglePath(ctx, item);
    });

    ctx.restore();
  }

  // 匯出 2D 病房畫布為高畫質圖檔
  exportWardCanvas() {
    let canvas = this.wardCanvas;
    if (!canvas) return;
    if (window.WardPlan2D) {
      const full = document.createElement('canvas');
      const dpr = window.devicePixelRatio || 1;
      const scene = window.WardPlan2D.scene(this.wardActiveBuildingId, this.wardActiveFloor, this.wardActiveWard);
      const scale = Math.min(3, 4000 / Math.max(scene.width, scene.height));
      full.width = Math.ceil(scene.width * scale * dpr);
      full.height = Math.ceil(scene.height * scale * dpr);
      const exportManager = Object.assign(Object.create(this), {
        wardCanvas: full, wardCtx: full.getContext('2d'),
        wardZoom: scale, wardPan: { x: 0, y: 0 }, wardModal: null
      });
      window.WardPlan2D.render(exportManager);
      canvas = full;
    }
    const link = document.createElement('a');
    link.download = `NTUH_${this.wardActiveBuildingId}_${this.wardActiveFloor}_Ward_Canvas_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  bindGlobalEvents() {
    // 綁定頂部導航列「🎨 畫布功能」按鈕
    const navBtn = document.getElementById('btn-toggle-canvas');
    if (navBtn) {
      navBtn.onclick = () => this.toggleScreenCanvas();
    }
  }
}

// 實例化並暴露於全域
window.canvasWhiteboardManager = null;
window.addEventListener('DOMContentLoaded', () => {
  const startWhiteboard = () => {
    if (window.campusApp && !window.canvasWhiteboardManager) {
      window.canvasWhiteboardManager = new CanvasWhiteboardManager(window.campusApp);
      window.campusApp.whiteboard = window.canvasWhiteboardManager;
      console.log('CanvasWhiteboardManager successfully attached to window.campusApp!');
    }
  };
  startWhiteboard();
  setTimeout(startWhiteboard, 100);
});
