from pathlib import Path
import shutil,re
p=Path(__file__).resolve().parents[1]
backup=p/'scratch/before-no-roam-clear-spine';backup.mkdir(exist_ok=True)
for name in ['index.html','js/app.js','js/ward-plan-layout.js','js/ward-plan-geometry.js']:
    dest=backup/Path(name).name
    if not dest.exists():shutil.copy2(p/name,dest)
f=p/'index.html';t=f.read_text(encoding='utf-8')
t=re.sub(r'\s*<button id="btn-mode-roam"[^>]*>.*?</button>','',t)
start=t.index('  <!-- 探索模式操作說明 HUD -->');end=t.index('  <!-- 提示訊息 Toast -->',start)
t=t[:start]+t[end:]
t=re.sub(r'\s*<script src="js/(?:first-person|pathfinding)\.js"></script>','',t)
f.write_text(t,encoding='utf-8')
f=p/'js/app.js';t=f.read_text(encoding='utf-8')
start=t.index('  initControllers() {');end=t.index('  tweenCamera(',start)
t=t[:start]+'''  initControllers() {
    // Floor plans use the orbit controls only; no walking controller is registered.
  }

'''+t[end:]
start=t.index('  setMode(newMode) {');end=t.index('  initUI() {',start)
t=t[:start]+'''  setMode() {
    this.mode = 'orbit';
    this.controls.enabled = true;
    this.tweenCamera(new THREE.Vector3(0, 68, 148), new THREE.Vector3(16, 12, 28), 1200);
    this.showToast('已切換為【3D 全區鳥瞰模式】');
  }

'''+t[end:]
start=t.index("    document.getElementById('btn-mode-roam').addEventListener")
end=t.index('    const btnXray',start)
t=t[:start]+t[end:]
t=t.replace("['btn-mode-orbit', 'btn-mode-roam']","['btn-mode-orbit']")
t=t.replace("this.mode = 'orbit'; // 'orbit' | 'firstPerson'","this.mode = 'orbit';")
t=t.replace('可拖曳旋轉探索空間','可拖曳旋轉檢視病房')
t=t.replace(" || this.currentMode === 'roam'",'')
t=t.replace("    if (this.currentMode === 'roam' || this.currentMode === 'firstPerson') return;\n",'')
t=t.replace("    } else if (this.mode === 'firstPerson' && this.fpsController) {\n\n      this.fpsController.update(delta);\n",'')
f.write_text(t,encoding='utf-8')
print('Removed exploration UI, controls, HUD and script loading')
