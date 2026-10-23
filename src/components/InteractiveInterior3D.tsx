import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { InteriorRoom, InteriorStyleConfig } from '../config/siteConfig';
import { InteriorCardCanvas } from './ProceduralArchIllustration';

interface InteractiveInterior3DProps {
  selectedRoom: InteriorRoom;
  selectedStyle: InteriorStyleConfig;
}

export const InteractiveInterior3D: React.FC<InteractiveInterior3DProps> = ({
  selectedRoom,
  selectedStyle,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  const sceneUpdaterRef = useRef<{
    updateRoomAndStyle: (room: InteriorRoom, style: InteriorStyleConfig) => void;
    resetCamera: () => void;
    zoom: (delta: number) => void;
  } | null>(null);

  useEffect(() => {
    sceneUpdaterRef.current?.updateRoomAndStyle(selectedRoom, selectedStyle);
  }, [selectedRoom, selectedStyle]);

  useEffect(() => {
    const mountEl = mountRef.current;
    if (!mountEl) return;

    let isSoftwareGl = false;
    try {
      const probe = document.createElement('canvas');
      const gl = probe.getContext('webgl2') || probe.getContext('webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } catch {
      setWebglSupported(false);
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglSupported(false);
      return;
    }

    const width = mountEl.clientWidth || 720;
    const height = mountEl.clientHeight || 440;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountEl.innerHTML = '';
    mountEl.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#191F1A');

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 80);
    camera.position.set(5.8, 4.2, 6.2);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.target.set(0, 1.1, 0);
    controls.minDistance = 3.5;
    controls.maxDistance = 12;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;

    // Lighting
    const hemiLight = new THREE.HemisphereLight('#FFF5E4', '#2E352F', 0.85);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight('#FFE5B8', 2.0);
    dirLight.position.set(6, 8, 5);
    dirLight.castShadow = !isSoftwareGl;
    dirLight.shadow.mapSize.set(1024, 1024);
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    const warmPendantLight = new THREE.PointLight('#FFBC6B', 2.2, 9, 1.6);
    warmPendantLight.position.set(0, 2.3, 0);
    scene.add(warmPendantLight);

    const dioramaRoot = new THREE.Group();
    scene.add(dioramaRoot);

    let renderBusy = false;
    let renderDirty = false;
    let frameId = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function requestRender() {
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        renderDirty = false;
        controls.update();
        renderer.render(scene, camera);
        const done = () => {
          renderBusy = false;
          if (renderDirty) requestRender();
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    controls.addEventListener('change', requestRender);

    const clearGroup = (group: THREE.Group) => {
      while (group.children.length > 0) {
        const child = group.children[0];
        group.remove(child);
        child.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            const m = obj as THREE.Mesh;
            m.geometry?.dispose();
            if (Array.isArray(m.material)) m.material.forEach((mt) => mt.dispose());
            else m.material?.dispose();
          }
        });
      }
    };

    const buildInteriorDiorama = (room: InteriorRoom, style: InteriorStyleConfig) => {
      clearGroup(dioramaRoot);

      const wallMat = new THREE.MeshStandardMaterial({ color: style.wallHex, roughness: 0.82 });
      const floorMat = new THREE.MeshStandardMaterial({ color: style.floorHex, roughness: 0.55 });
      const woodMat = new THREE.MeshStandardMaterial({ color: style.woodHex, roughness: 0.42, metalness: 0.08 });
      const fabricMat = new THREE.MeshStandardMaterial({ color: style.fabricHex, roughness: 0.88 });
      const accentMat = new THREE.MeshStandardMaterial({ color: style.accentHex, roughness: 0.65 });
      const metalMat = new THREE.MeshStandardMaterial({ color: style.metalHex, roughness: 0.25, metalness: 0.85 });
      const rugMat = new THREE.MeshStandardMaterial({ color: style.rugHex, roughness: 0.95 });

      warmPendantLight.color.set(style.lightWarmthHex);

      // 1. Floor Slab & Back/Left Cutaway Walls
      const floor = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.18, 4.6), floorMat);
      floor.position.set(0, 0.09, 0);
      floor.receiveShadow = true;
      dioramaRoot.add(floor);

      const backWall = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.9, 0.18), wallMat);
      backWall.position.set(0, 1.54, -2.21);
      backWall.castShadow = true;
      backWall.receiveShadow = true;
      dioramaRoot.add(backWall);

      const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.9, 4.6), wallMat);
      leftWall.position.set(-2.51, 1.54, 0);
      leftWall.castShadow = true;
      leftWall.receiveShadow = true;
      dioramaRoot.add(leftWall);

      // 2. Wood Slat Acoustic Feature Wall on Back Wall
      for (let i = 0; i < 14; i++) {
        const slat = new THREE.Mesh(new THREE.BoxGeometry(0.07, 2.75, 0.08), woodMat);
        slat.position.set(-2.1 + i * 0.14, 1.54, -2.09);
        slat.castShadow = true;
        dioramaRoot.add(slat);
      }

      // 3. Architectural Daylight Window Frame on Left Wall
      const winFrame = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.7, 1.9), metalMat);
      winFrame.position.set(-2.5, 1.65, 0.4);
      dioramaRoot.add(winFrame);

      const winGlass = new THREE.Mesh(
        new THREE.BoxGeometry(0.26, 1.54, 1.74),
        new THREE.MeshBasicMaterial({ color: style.lightWarmthHex })
      );
      winGlass.position.set(-2.49, 1.65, 0.4);
      dioramaRoot.add(winGlass);

      // 4. Area Rug (offset on Y to avoid Z-fighting)
      const rug = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.03, 2.4), rugMat);
      rug.position.set(0.2, 0.195, 0.2);
      rug.receiveShadow = true;
      dioramaRoot.add(rug);

      // 5. Room-Specific 3D Furniture Assembly
      if (room.id === 'kamar-tidur-utama' || room.id === 'kamar-anak') {
        // Platform Bed + Headboard + Mattress + Pillows + Nightstands
        const bedPlatform = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.24, 2.3), woodMat);
        bedPlatform.position.set(0.2, 0.3, -0.75);
        bedPlatform.castShadow = true;
        dioramaRoot.add(bedPlatform);

        const headboard = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.15, 0.14), woodMat);
        headboard.position.set(0.2, 0.78, -1.98);
        dioramaRoot.add(headboard);

        const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.26, 2.05), fabricMat);
        mattress.position.set(0.2, 0.52, -0.8);
        mattress.castShadow = true;
        dioramaRoot.add(mattress);

        const blanket = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.28, 1.1), accentMat);
        blanket.position.set(0.2, 0.53, -0.32);
        dioramaRoot.add(blanket);

        for (let p = -1; p <= 1; p += 2) {
          const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.16, 0.42), accentMat);
          pillow.position.set(0.2 + p * 0.48, 0.7, -1.55);
          dioramaRoot.add(pillow);
        }
      } else if (room.id === 'dapur-modern' || room.id === 'ruang-makan') {
        // Rear Cabinetry + Central Stone & Wood Island / Dining Table + Chairs
        const rearCabinet = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.9, 0.65), woodMat);
        rearCabinet.position.set(0.4, 0.63, -1.75);
        rearCabinet.castShadow = true;
        dioramaRoot.add(rearCabinet);

        const islandBase = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.82, 1.05), woodMat);
        islandBase.position.set(0.3, 0.59, 0.15);
        islandBase.castShadow = true;
        dioramaRoot.add(islandBase);

        const islandTop = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.08, 1.2), wallMat);
        islandTop.position.set(0.3, 1.04, 0.15);
        islandTop.castShadow = true;
        dioramaRoot.add(islandTop);

        for (let s = -1; s <= 1; s++) {
          const stoolSeat = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 16), accentMat);
          stoolSeat.position.set(0.3 + s * 0.72, 0.72, 0.92);
          dioramaRoot.add(stoolSeat);
          const stoolLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.55, 8), metalMat);
          stoolLeg.position.set(0.3 + s * 0.72, 0.44, 0.92);
          dioramaRoot.add(stoolLeg);
        }
      } else if (room.id === 'home-office') {
        // Executive Timber Desk + Bookshelf Wall + Ergonomic Chair
        const bookshelf = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.2, 0.38), woodMat);
        bookshelf.position.set(0.5, 1.28, -1.9);
        bookshelf.castShadow = true;
        dioramaRoot.add(bookshelf);

        const deskTop = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 0.95), woodMat);
        deskTop.position.set(0.3, 0.86, 0.1);
        deskTop.castShadow = true;
        dioramaRoot.add(deskTop);

        const deskLegL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.85), metalMat);
        deskLegL.position.set(-0.6, 0.5, 0.1);
        dioramaRoot.add(deskLegL);

        const deskLegR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.85), metalMat);
        deskLegR.position.set(1.2, 0.5, 0.1);
        dioramaRoot.add(deskLegR);

        const chair = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.95, 0.62), accentMat);
        chair.position.set(0.3, 0.65, 0.85);
        dioramaRoot.add(chair);
      } else {
        // Living / Lounge / Compact / Bathroom / Garden Default Modular L-Sofa + Coffee Table + Credenza
        const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.22, 0.95), woodMat);
        sofaBase.position.set(0.35, 0.3, -0.95);
        sofaBase.castShadow = true;
        dioramaRoot.add(sofaBase);

        const sofaSeat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.26, 0.88), fabricMat);
        sofaSeat.position.set(0.35, 0.5, -0.92);
        sofaSeat.castShadow = true;
        dioramaRoot.add(sofaSeat);

        const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.48, 0.24), fabricMat);
        sofaBack.position.set(0.35, 0.78, -1.26);
        sofaBack.castShadow = true;
        dioramaRoot.add(sofaBack);

        // Accent Cushions
        const cushion1 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.36, 0.18), accentMat);
        cushion1.position.set(-0.45, 0.76, -1.08);
        dioramaRoot.add(cushion1);

        const cushion2 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.36, 0.18), accentMat);
        cushion2.position.set(1.1, 0.76, -1.08);
        dioramaRoot.add(cushion2);

        // Coffee Table
        const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.08, 24), woodMat);
        tableTop.position.set(0.35, 0.48, 0.35);
        tableTop.castShadow = true;
        dioramaRoot.add(tableTop);

        const tableBase = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 0.3, 16), metalMat);
        tableBase.position.set(0.35, 0.32, 0.35);
        dioramaRoot.add(tableBase);
      }

      // 6. Indoor Tropical Plant in Ceramic Planter
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.2, 0.45, 16), accentMat);
      pot.position.set(1.95, 0.4, -1.55);
      pot.castShadow = true;
      dioramaRoot.add(pot);

      const foliage = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.48, 1),
        new THREE.MeshStandardMaterial({ color: '#39573B', roughness: 0.7 })
      );
      foliage.position.set(1.95, 1.05, -1.55);
      foliage.castShadow = true;
      dioramaRoot.add(foliage);

      // 7. Linear Architectural Pendant Lamp
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.9, 8), metalMat);
      cord.position.set(0.3, 2.45, 0.15);
      dioramaRoot.add(cord);

      const lampBar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.07, 0.12), metalMat);
      lampBar.position.set(0.3, 2.0, 0.15);
      dioramaRoot.add(lampBar);

      requestRender();
    };

    const resetCamera = () => {
      camera.position.set(5.8, 4.2, 6.2);
      controls.target.set(0, 1.1, 0);
      controls.update();
      requestRender();
    };

    const zoom = (delta: number) => {
      const dir = camera.position.clone().sub(controls.target);
      const len = THREE.MathUtils.clamp(dir.length() + delta, controls.minDistance, controls.maxDistance);
      dir.normalize().multiplyScalar(len);
      camera.position.copy(controls.target).add(dir);
      controls.update();
      requestRender();
    };

    sceneUpdaterRef.current = {
      updateRoomAndStyle: buildInteriorDiorama,
      resetCamera,
      zoom,
    };

    buildInteriorDiorama(selectedRoom, selectedStyle);

    const onResize = () => {
      if (!mountEl) return;
      const w = mountEl.clientWidth || 640;
      const h = mountEl.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  if (!webglSupported) {
    return (
      <div className="w-full h-[420px] rounded-xl overflow-hidden border border-[#2F3A30]">
        <InteriorCardCanvas room={selectedRoom} styleConfig={selectedStyle} />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[420px] lg:h-[460px] rounded-xl overflow-hidden bg-[#191F1A] border border-[#2F3A30] select-none">
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        role="img"
        aria-label={`Simulasi 3D ruang interior ${selectedRoom.name} dengan gaya ${selectedStyle.name}`}
      />

      {/* Top-Left Room & Style Spec Overlay */}
      <div className="absolute top-3.5 left-3.5 z-10 pointer-events-none bg-[#161915]/90 border border-white/10 px-3.5 py-2 rounded-lg">
        <div className="text-[11px] font-mono-tabular text-[#C99A63] uppercase">
          SIMULASI RUANG 3D · {selectedStyle.name}
        </div>
        <div className="text-sm font-semibold text-[#F6F3EC]">{selectedRoom.name}</div>
        <div className="text-[11px] text-[#F6F3EC]/70 font-mono-tabular">{selectedRoom.dimensions}</div>
      </div>

      {/* Top-Right Camera Controls */}
      <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1 bg-[#161915]/90 border border-white/10 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => sceneUpdaterRef.current?.zoom(-1.2)}
          aria-label="Perbesar ruang 3D"
          className="p-1.5 text-[#F6F3EC]/80 hover:text-white hover:bg-white/10 rounded cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => sceneUpdaterRef.current?.zoom(1.2)}
          aria-label="Perkecil ruang 3D"
          className="p-1.5 text-[#F6F3EC]/80 hover:text-white hover:bg-white/10 rounded cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => sceneUpdaterRef.current?.resetCamera()}
          aria-label="Reset kamera interior"
          className="p-1.5 text-[#F6F3EC]/80 hover:text-white hover:bg-white/10 rounded cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Swatch Indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-[#161915]/92 border border-white/15 px-4 py-2 rounded-lg text-xs text-[#F6F3EC]">
        <span className="text-[#F6F3EC]/70 whitespace-nowrap">Palet Material Aktif:</span>
        <div className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded-sm border border-white/20 inline-block"
            style={{ backgroundColor: selectedStyle.wallHex }}
            title="Dinding"
          />
          <span
            className="w-4 h-4 rounded-sm border border-white/20 inline-block"
            style={{ backgroundColor: selectedStyle.woodHex }}
            title="Kayu Utama"
          />
          <span
            className="w-4 h-4 rounded-sm border border-white/20 inline-block"
            style={{ backgroundColor: selectedStyle.fabricHex }}
            title="Tekstil / Furnitur"
          />
          <span
            className="w-4 h-4 rounded-sm border border-white/20 inline-block"
            style={{ backgroundColor: selectedStyle.accentHex }}
            title="Aksen Ruang"
          />
        </div>
        <span className="hidden sm:inline text-[#F6F3EC]/60">· Geser untuk memutar 360°</span>
      </div>
    </div>
  );
};
