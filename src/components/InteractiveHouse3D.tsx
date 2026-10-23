import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Eye,
  EyeOff,
  RotateCcw,
  Sun,
  Sunset,
  Moon,
  ZoomIn,
  ZoomOut,
  Layers,
  Compass,
} from 'lucide-react';
import { HouseModel } from '../config/siteConfig';
import { HouseCardCanvas } from './ProceduralArchIllustration';

interface InteractiveHouse3DProps {
  selectedModel: HouseModel;
  onSelectModel?: (modelId: string) => void;
  allModels?: HouseModel[];
  compactMode?: boolean;
}

type LightingPreset = 'golden' | 'daylight' | 'night';
type CameraPreset = 'perspective' | 'front' | 'poolside' | 'top';

const _targetCamPos = new THREE.Vector3();

export const InteractiveHouse3D: React.FC<InteractiveHouse3DProps> = ({
  selectedModel,
  onSelectModel,
  allModels = [],
  compactMode = false,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('golden');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('perspective');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [explodeFactor, setExplodeFactor] = useState<number>(0);

  const stateRef = useRef({
    model: selectedModel,
    lighting: 'golden' as LightingPreset,
    autoRotate: true,
    explodeTarget: 0,
    explodeCurrent: 0,
    pointerX: 0,
    pointerY: 0,
    cameraTransitionActive: false,
    camTargetPos: new THREE.Vector3(11.5, 6.2, 12.5),
    camLookTarget: new THREE.Vector3(0, 1.4, 0),
    reducedMotion: false,
    tabHidden: false,
    inViewport: true,
  });

  const sceneActionsRef = useRef<{
    rebuildHouse: (model: HouseModel) => void;
    applyLighting: (preset: LightingPreset) => void;
    zoomDelta: (delta: number) => void;
    setCameraView: (preset: CameraPreset) => void;
    requestSingleRender: () => void;
  } | null>(null);

  useEffect(() => {
    stateRef.current.model = selectedModel;
    sceneActionsRef.current?.rebuildHouse(selectedModel);
    sceneActionsRef.current?.requestSingleRender();
  }, [selectedModel]);

  useEffect(() => {
    stateRef.current.lighting = lightingPreset;
    sceneActionsRef.current?.applyLighting(lightingPreset);
    sceneActionsRef.current?.requestSingleRender();
  }, [lightingPreset]);

  useEffect(() => {
    stateRef.current.autoRotate = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    stateRef.current.explodeTarget = explodeFactor;
  }, [explodeFactor]);

  useEffect(() => {
    const mountEl = canvasMountRef.current;
    const wrapperEl = wrapperRef.current;
    if (!mountEl || !wrapperEl) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    stateRef.current.reducedMotion = mediaQuery.matches;
    if (mediaQuery.matches) {
      setAutoRotate(false);
      stateRef.current.autoRotate = false;
    }

    let isSoftwareGl = false;
    try {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
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

    const width = mountEl.clientWidth || 800;
    const height = mountEl.clientHeight || 460;
    renderer.setSize(width, height);
    // Cap pixel ratio at 1.5 for silky-smooth 60fps during page scroll and interaction
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    mountEl.innerHTML = '';
    mountEl.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#161B17');
    scene.fog = new THREE.FogExp2('#161B17', 0.018);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(11.5, 6.2, 12.5);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 5.5;
    controls.maxDistance = 24;
    controls.target.set(0, 1.4, 0);

    controls.addEventListener('start', () => {
      stateRef.current.cameraTransitionActive = false;
    });

    // Studio & Architectural Lighting Rig
    const hemiLight = new THREE.HemisphereLight('#FFE6C2', '#233024', 0.8);
    hemiLight.position.set(0, 25, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#FFD59E', 2.2);
    keyLight.position.set(12, 16, 10);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 512;
    keyLight.shadow.mapSize.height = 512;
    const d = 9.5;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 36;
    keyLight.shadow.bias = -0.0008;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#7CA39B', 0.75);
    rimLight.position.set(-12, 9, -10);
    scene.add(rimLight);

    const interiorWarmLight = new THREE.PointLight('#FFA94D', 2.4, 11, 1.8);
    interiorWarmLight.position.set(0.4, 1.6, 0.2);
    scene.add(interiorWarmLight);

    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // Extended Ground & Orbit Ring
    const groundGeo = new THREE.CircleGeometry(26, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#1A211B',
      roughness: 0.92,
      metalness: 0.05,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.02;
    groundMesh.receiveShadow = true;
    worldGroup.add(groundMesh);

    const ringGroup = new THREE.Group();
    ringGroup.position.y = 0.01;
    const outerRingGeo = new THREE.RingGeometry(7.2, 7.26, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: '#B87D4B',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, ringMat);
    outerRing.rotation.x = -Math.PI / 2;
    ringGroup.add(outerRing);

    const innerRingGeo = new THREE.RingGeometry(5.8, 5.83, 64);
    const innerRingMat = ringMat.clone();
    innerRingMat.opacity = 0.22;
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = -Math.PI / 2;
    ringGroup.add(innerRing);
    worldGroup.add(ringGroup);

    const houseRoot = new THREE.Group();
    const groundFloorGroup = new THREE.Group();
    const secondFloorGroup = new THREE.Group();
    const roofGroup = new THREE.Group();
    houseRoot.add(groundFloorGroup);
    houseRoot.add(secondFloorGroup);
    houseRoot.add(roofGroup);
    worldGroup.add(houseRoot);

    const clearGroup = (group: THREE.Group) => {
      while (group.children.length > 0) {
        const child = group.children[0];
        group.remove(child);
        child.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            const m = obj as THREE.Mesh;
            m.geometry?.dispose();
            if (Array.isArray(m.material)) {
              m.material.forEach((mat) => mat.dispose());
            } else {
              m.material?.dispose();
            }
          }
        });
      }
    };

    const rebuildHouse = (model: HouseModel) => {
      clearGroup(groundFloorGroup);
      clearGroup(secondFloorGroup);
      clearGroup(roofGroup);

      const c = model.config3D;
      const sx = c.footprintScaleX;
      const sz = c.footprintScaleZ;

      // Single-pass fast PBR materials (Zero multi-pass transmission bottleneck!)
      const mainWallMat = new THREE.MeshStandardMaterial({
        color: c.wallColor,
        roughness: 0.78,
        metalness: 0.04,
      });
      const secWallMat = new THREE.MeshStandardMaterial({
        color: c.secondaryWallColor,
        roughness: 0.85,
        metalness: 0.06,
      });
      const stoneMat = new THREE.MeshStandardMaterial({
        color: c.stoneColor,
        roughness: 0.92,
        metalness: 0.08,
      });
      const woodMat = new THREE.MeshStandardMaterial({
        color: c.woodColor,
        roughness: 0.48,
        metalness: 0.12,
      });
      const roofMat = new THREE.MeshStandardMaterial({
        color: c.roofColor,
        roughness: 0.62,
        metalness: 0.22,
      });
      const metalMat = new THREE.MeshStandardMaterial({
        color: c.metalColor,
        roughness: 0.28,
        metalness: 0.85,
      });
      const glassMat = new THREE.MeshStandardMaterial({
        color: '#C7E8E2',
        roughness: 0.12,
        metalness: 0.35,
        transparent: true,
        opacity: 0.46,
      });
      const warmCoreMat = new THREE.MeshStandardMaterial({
        color: '#FCE5C2',
        emissive: '#FF9E3D',
        emissiveIntensity: 0.55,
        roughness: 0.6,
      });

      // Part 1: Courtyard Lawn & Stone Plinth
      const lawn = new THREE.Mesh(
        new THREE.BoxGeometry(8.8 * sx, 0.16, 7.6 * sz),
        new THREE.MeshStandardMaterial({ color: '#2B3A29', roughness: 0.9 })
      );
      lawn.position.set(0, 0.08, 0);
      lawn.receiveShadow = true;
      groundFloorGroup.add(lawn);

      const plinth = new THREE.Mesh(new THREE.BoxGeometry(6.6 * sx, 0.28, 4.8 * sz), stoneMat);
      plinth.position.set(-0.2, 0.22, -0.4);
      plinth.castShadow = true;
      plinth.receiveShadow = true;
      groundFloorGroup.add(plinth);

      // Part 2: Timber Terrace Deck
      const deck = new THREE.Mesh(new THREE.BoxGeometry(4.2 * sx, 0.12, 2.2 * sz), woodMat);
      deck.position.set(0.8 * sx, 0.32, 1.5 * sz);
      deck.receiveShadow = true;
      groundFloorGroup.add(deck);

      // Part 3: Ground Floor Left Wing
      const leftWingW = 2.4 * sx;
      const leftWingH = 2.6;
      const leftWingD = 3.8 * sz;
      const leftWing = new THREE.Mesh(
        new THREE.BoxGeometry(leftWingW, leftWingH, leftWingD),
        secWallMat
      );
      leftWing.position.set(-1.8 * sx, 0.36 + leftWingH / 2, -0.4 * sz);
      leftWing.castShadow = true;
      leftWing.receiveShadow = true;
      groundFloorGroup.add(leftWing);

      // Part 4: Main Living Pavilion
      const mainWingW = 3.8 * sx;
      const mainWingH = 2.75;
      const mainWingD = 3.4 * sz;

      const backWall = new THREE.Mesh(new THREE.BoxGeometry(mainWingW, mainWingH, 0.25), mainWallMat);
      backWall.position.set(1.0 * sx, 0.36 + mainWingH / 2, -1.9 * sz);
      backWall.castShadow = true;
      backWall.receiveShadow = true;
      groundFloorGroup.add(backWall);

      const rightWall = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, mainWingH, mainWingD),
        mainWallMat
      );
      rightWall.position.set(2.8 * sx, 0.36 + mainWingH / 2, -0.35 * sz);
      rightWall.castShadow = true;
      rightWall.receiveShadow = true;
      groundFloorGroup.add(rightWall);

      const coreFloor = new THREE.Mesh(
        new THREE.BoxGeometry(mainWingW - 0.3, 0.1, mainWingD - 0.3),
        warmCoreMat
      );
      coreFloor.position.set(1.0 * sx, 0.42, -0.35 * sz);
      groundFloorGroup.add(coreFloor);

      const sofa = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 0.85), woodMat);
      sofa.position.set(0.9 * sx, 0.65, -0.6 * sz);
      groundFloorGroup.add(sofa);

      // Panoramic Glass & Mullions
      const glassPane = new THREE.Mesh(
        new THREE.BoxGeometry(mainWingW - 0.35, mainWingH - 0.3, 0.06),
        glassMat
      );
      glassPane.position.set(0.95 * sx, 0.36 + mainWingH / 2, 1.25 * sz);
      groundFloorGroup.add(glassPane);

      for (let i = 0; i <= 3; i++) {
        const mullion = new THREE.Mesh(
          new THREE.BoxGeometry(0.05, mainWingH - 0.2, 0.1),
          metalMat
        );
        const mx = -0.65 * sx + i * ((mainWingW - 0.4) / 3);
        mullion.position.set(mx, 0.36 + mainWingH / 2, 1.26 * sz);
        groundFloorGroup.add(mullion);
      }

      // Part 5: Secondary Skin Timber Louvers
      const louverCount = c.louverCount;
      const slatGeo = new THREE.BoxGeometry(0.06, leftWingH - 0.2, 0.16);
      for (let i = 0; i < louverCount; i++) {
        const slat = new THREE.Mesh(slatGeo, woodMat);
        const lx = -2.65 * sx + (i / Math.max(louverCount - 1, 1)) * (1.7 * sx);
        slat.position.set(lx, 0.36 + leftWingH / 2, 1.52 * sz);
        groundFloorGroup.add(slat);
      }

      // Optional Pendopo Columns
      if (c.hasPendopo) {
        const colGeo = new THREE.CylinderGeometry(0.09, 0.11, 2.5, 10);
        const umpakGeo = new THREE.BoxGeometry(0.28, 0.22, 0.28);
        const colPositions = [
          [-0.4 * sx, 2.3 * sz],
          [2.1 * sx, 2.3 * sz],
          [-0.4 * sx, 1.4 * sz],
          [2.1 * sx, 1.4 * sz],
        ];
        colPositions.forEach(([cx, cz]) => {
          const col = new THREE.Mesh(colGeo, woodMat);
          col.position.set(cx, 0.36 + 1.25, cz);
          groundFloorGroup.add(col);

          const umpak = new THREE.Mesh(umpakGeo, stoneMat);
          umpak.position.set(cx, 0.45, cz);
          groundFloorGroup.add(umpak);
        });
      }

      // Optional Arches
      if (c.hasArches) {
        const pillarGeo = new THREE.BoxGeometry(0.24, 2.5, 0.24);
        for (let i = 0; i < 3; i++) {
          const pillar = new THREE.Mesh(pillarGeo, mainWallMat);
          pillar.position.set(-0.4 * sx + i * 1.3 * sx, 0.36 + 1.25, 1.55 * sz);
          groundFloorGroup.add(pillar);
        }
      }

      // Part 6: Reflecting Pool
      if (c.hasPool) {
        const poolBasin = new THREE.Mesh(
          new THREE.BoxGeometry(3.8 * sx, 0.22, 1.65 * sz),
          stoneMat
        );
        poolBasin.position.set(1.1 * sx, 0.14, 2.65 * sz);
        groundFloorGroup.add(poolBasin);

        const waterMat = new THREE.MeshStandardMaterial({
          color: '#257078',
          roughness: 0.08,
          metalness: 0.35,
        });
        const water = new THREE.Mesh(new THREE.PlaneGeometry(3.55 * sx, 1.42 * sz), waterMat);
        water.rotation.x = -Math.PI / 2;
        water.position.set(1.1 * sx, 0.27, 2.65 * sz);
        groundFloorGroup.add(water);
      }

      // Part 7: Stepping Stones & Tropical Trees
      const stepGeo = new THREE.BoxGeometry(0.65, 0.06, 0.42);
      for (let s = 0; s < 4; s++) {
        const step = new THREE.Mesh(stepGeo, stoneMat);
        step.position.set(-1.6 * sx, 0.18, 1.9 * sz + s * 0.62);
        groundFloorGroup.add(step);
      }

      const trunkMat = new THREE.MeshStandardMaterial({ color: '#5A4230', roughness: 0.85 });
      const leafMat = new THREE.MeshStandardMaterial({ color: '#375438', roughness: 0.78 });

      const createTree = (tx: number, tz: number, scale: number) => {
        const treeGrp = new THREE.Group();
        treeGrp.position.set(tx, 0.16, tz);
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08 * scale, 0.13 * scale, 1.7 * scale, 7),
          trunkMat
        );
        trunk.position.y = 0.85 * scale;
        treeGrp.add(trunk);

        const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(0.78 * scale, 0), leafMat);
        canopy.position.set(0, 1.8 * scale, 0);
        canopy.castShadow = true;
        treeGrp.add(canopy);

        const subCanopy = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55 * scale, 0), leafMat);
        subCanopy.position.set(0.38 * scale, 1.55 * scale, 0.22 * scale);
        treeGrp.add(subCanopy);

        groundFloorGroup.add(treeGrp);
      };

      createTree(-3.4 * sx, 2.1 * sz, 1.05);
      createTree(3.55 * sx, -1.5 * sz, 0.92);

      // Part 8: Optional Second Floor Volume
      let roofBaseY = 0.36 + mainWingH;
      if (c.stories === 2) {
        const slab = new THREE.Mesh(new THREE.BoxGeometry(6.2 * sx, 0.22, 4.2 * sz), roofMat);
        slab.position.set(0.3 * sx, roofBaseY, -0.3 * sz);
        secondFloorGroup.add(slab);

        const upperH = 2.35;
        const upperBox = new THREE.Mesh(
          new THREE.BoxGeometry(4.1 * sx, upperH, 3.2 * sz),
          mainWallMat
        );
        upperBox.position.set(0.65 * sx, roofBaseY + 0.11 + upperH / 2, -0.45 * sz);
        upperBox.castShadow = true;
        secondFloorGroup.add(upperBox);

        const upperGlass = new THREE.Mesh(
          new THREE.BoxGeometry(2.8 * sx, 1.75, 0.08),
          glassMat
        );
        upperGlass.position.set(0.75 * sx, roofBaseY + 1.2, 1.16 * sz);
        secondFloorGroup.add(upperGlass);

        const balconyRail = new THREE.Mesh(
          new THREE.BoxGeometry(3.8 * sx, 0.65, 0.05),
          glassMat
        );
        balconyRail.position.set(0.65 * sx, roofBaseY + 0.42, 1.68 * sz);
        secondFloorGroup.add(balconyRail);

        roofBaseY += upperH + 0.15;
      }

      // Part 9: Roof Archetypes
      roofGroup.position.y = 0;

      if (c.roofType === 'joglo-kontemporer') {
        const lowerRoof = new THREE.Mesh(new THREE.ConeGeometry(4.8 * sx, 1.15, 4), roofMat);
        lowerRoof.rotation.y = Math.PI / 4;
        lowerRoof.scale.set(1.15, 1, 0.85);
        lowerRoof.position.set(0.3 * sx, roofBaseY + 0.52, -0.15 * sz);
        lowerRoof.castShadow = true;
        roofGroup.add(lowerRoof);

        const upperCrown = new THREE.Mesh(new THREE.ConeGeometry(2.45 * sx, 1.65, 4), roofMat);
        upperCrown.rotation.y = Math.PI / 4;
        upperCrown.scale.set(1.1, 1, 0.8);
        upperCrown.position.set(0.3 * sx, roofBaseY + 1.45, -0.15 * sz);
        upperCrown.castShadow = true;
        roofGroup.add(upperCrown);
      } else if (c.roofType === 'japandi-gable') {
        const shape = new THREE.Shape();
        const halfW = 3.55 * sx;
        const ridgeH = 1.45;
        shape.moveTo(-halfW, 0);
        shape.lineTo(0, ridgeH);
        shape.lineTo(halfW, 0);
        shape.lineTo(-halfW, 0);

        const extrudeGeo = new THREE.ExtrudeGeometry(shape, {
          depth: 4.5 * sz,
          bevelEnabled: false,
        });
        const gableMesh = new THREE.Mesh(extrudeGeo, roofMat);
        gableMesh.position.set(0.25 * sx, roofBaseY - 0.05, -2.5 * sz);
        gableMesh.castShadow = true;
        roofGroup.add(gableMesh);
      } else if (c.roofType === 'tropical-hip' || c.roofType === 'mediterranean-arch') {
        const hipRoof = new THREE.Mesh(new THREE.ConeGeometry(4.7 * sx, 1.45, 4), roofMat);
        hipRoof.rotation.y = Math.PI / 4;
        hipRoof.scale.set(1.18, 1, 0.88);
        hipRoof.position.set(0.35 * sx, roofBaseY + 0.68, -0.25 * sz);
        hipRoof.castShadow = true;
        roofGroup.add(hipRoof);
      } else if (c.roofType === 'industrial-sawtooth') {
        for (let r = 0; r < 2; r++) {
          const shed = new THREE.Mesh(
            new THREE.BoxGeometry(2.9 * sx, 0.18, 4.3 * sz),
            roofMat
          );
          shed.rotation.z = 0.18;
          shed.position.set((-1.1 + r * 2.5) * sx, roofBaseY + 0.35, -0.35 * sz);
          shed.castShadow = true;
          roofGroup.add(shed);
        }
      } else if (c.roofType === 'compact-mono') {
        const monoRoof = new THREE.Mesh(
          new THREE.BoxGeometry(5.2 * sx, 0.22, 4.1 * sz),
          roofMat
        );
        monoRoof.rotation.z = 0.14;
        monoRoof.position.set(0.2 * sx, roofBaseY + 0.38, -0.25 * sz);
        monoRoof.castShadow = true;
        roofGroup.add(monoRoof);
      } else {
        const topSlab = new THREE.Mesh(
          new THREE.BoxGeometry(6.7 * sx, 0.24, 4.7 * sz),
          roofMat
        );
        topSlab.position.set(0.35 * sx, roofBaseY + 0.12, -0.2 * sz);
        topSlab.castShadow = true;
        roofGroup.add(topSlab);

        const soffit = new THREE.Mesh(
          new THREE.BoxGeometry(6.5 * sx, 0.06, 4.5 * sz),
          woodMat
        );
        soffit.position.set(0.35 * sx, roofBaseY - 0.02, -0.2 * sz);
        roofGroup.add(soffit);
      }
    };

    const applyLighting = (preset: LightingPreset) => {
      if (preset === 'golden') {
        scene.background = new THREE.Color('#161B17');
        scene.fog = new THREE.FogExp2('#161B17', 0.018);
        hemiLight.color.set('#FFE6C2');
        hemiLight.groundColor.set('#233024');
        hemiLight.intensity = 0.78;
        keyLight.color.set('#FFC98B');
        keyLight.intensity = 2.3;
        keyLight.position.set(12, 14, 10);
        interiorWarmLight.intensity = 2.8;
      } else if (preset === 'daylight') {
        scene.background = new THREE.Color('#232D26');
        scene.fog = new THREE.FogExp2('#232D26', 0.014);
        hemiLight.color.set('#FFFFFF');
        hemiLight.groundColor.set('#3A473B');
        hemiLight.intensity = 1.15;
        keyLight.color.set('#FFFDF8');
        keyLight.intensity = 2.6;
        keyLight.position.set(8, 20, 8);
        interiorWarmLight.intensity = 1.2;
      } else {
        scene.background = new THREE.Color('#0D110E');
        scene.fog = new THREE.FogExp2('#0D110E', 0.022);
        hemiLight.color.set('#3A4F66');
        hemiLight.groundColor.set('#101411');
        hemiLight.intensity = 0.4;
        keyLight.color.set('#8AB4F8');
        keyLight.intensity = 0.65;
        keyLight.position.set(-10, 15, -8);
        interiorWarmLight.intensity = 4.2;
      }
    };

    const setCameraView = (preset: CameraPreset) => {
      stateRef.current.cameraTransitionActive = true;
      if (preset === 'perspective') {
        stateRef.current.camTargetPos.set(11.5, 6.2, 12.5);
        stateRef.current.camLookTarget.set(0, 1.4, 0);
      } else if (preset === 'front') {
        stateRef.current.camTargetPos.set(0.4, 3.2, 13.5);
        stateRef.current.camLookTarget.set(0.4, 1.6, 0);
      } else if (preset === 'poolside') {
        stateRef.current.camTargetPos.set(6.2, 2.2, 7.8);
        stateRef.current.camLookTarget.set(0.5, 1.3, 0.5);
      } else if (preset === 'top') {
        stateRef.current.camTargetPos.set(0.2, 16.5, 4.5);
        stateRef.current.camLookTarget.set(0, 0.5, 0);
      }
    };

    const zoomDelta = (delta: number) => {
      stateRef.current.cameraTransitionActive = false;
      _targetCamPos.copy(camera.position).sub(controls.target);
      const currentDist = _targetCamPos.length();
      const nextDist = THREE.MathUtils.clamp(
        currentDist + delta,
        controls.minDistance,
        controls.maxDistance
      );
      _targetCamPos.normalize().multiplyScalar(nextDist);
      camera.position.copy(controls.target).add(_targetCamPos);
      controls.update();
      renderer.render(scene, camera);
    };

    const requestSingleRender = () => {
      controls.update();
      renderer.render(scene, camera);
    };

    sceneActionsRef.current = {
      rebuildHouse,
      applyLighting,
      zoomDelta,
      setCameraView,
      requestSingleRender,
    };

    rebuildHouse(stateRef.current.model);
    applyLighting(stateRef.current.lighting);

    // Pause WebGL loop automatically when Hero 3D is scrolled out of view!
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]) {
          stateRef.current.inViewport = entries[0].isIntersecting;
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(wrapperEl);

    const onVisibilityChange = () => {
      stateRef.current.tabHidden = document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const onResize = () => {
      if (!mountEl) return;
      const w = mountEl.clientWidth || 800;
      const h = mountEl.clientHeight || 460;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.render(scene, camera);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
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

    function tick() {
      const dt = Math.min(clock.getDelta(), 0.1);

      // Only render when visible in viewport and tab is active (Eliminates scroll lag!)
      if (!stateRef.current.tabHidden && stateRef.current.inViewport) {
        stateRef.current.explodeCurrent = THREE.MathUtils.damp(
          stateRef.current.explodeCurrent,
          stateRef.current.explodeTarget,
          6,
          dt
        );
        const exp = stateRef.current.explodeCurrent;
        secondFloorGroup.position.y = exp * 1.6;
        roofGroup.position.y = exp * 3.2;

        if (stateRef.current.cameraTransitionActive) {
          camera.position.lerp(stateRef.current.camTargetPos, 1 - Math.exp(-5 * dt));
          controls.target.lerp(stateRef.current.camLookTarget, 1 - Math.exp(-5 * dt));
          if (camera.position.distanceTo(stateRef.current.camTargetPos) < 0.08) {
            stateRef.current.cameraTransitionActive = false;
          }
        }

        if (!stateRef.current.reducedMotion && !isSoftwareGl) {
          if (stateRef.current.autoRotate && !stateRef.current.cameraTransitionActive) {
            worldGroup.rotation.y += dt * 0.14;
          }
          ringGroup.rotation.z -= dt * 0.04;
        }

        controls.update();
        renderer.render(scene, camera);
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  if (!webglSupported) {
    return (
      <div className="relative w-full h-full min-h-[460px] rounded-xl overflow-hidden border border-[#2F3A30] bg-[#161B17]">
        <HouseCardCanvas model={selectedModel} />
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="w-full h-full flex flex-col rounded-xl overflow-hidden bg-[#161B17] border border-[#2C362D] select-none"
    >
      {/* Upper Area: Unobstructed 3D WebGL Viewport */}
      <div className="relative flex-grow w-full min-h-[380px] sm:min-h-[430px]">
        <div
          ref={canvasMountRef}
          className="w-full h-full min-h-[380px] sm:min-h-[430px] cursor-grab active:cursor-grabbing"
          role="img"
          aria-label={`Visualisasi 3D interaktif ${selectedModel.name}`}
        />

        {/* Top-Left Spec Badge */}
        <div className="absolute top-3.5 left-3.5 z-10 pointer-events-none bg-[#161915]/90 border border-white/10 px-3.5 py-2 rounded-lg max-w-[280px]">
          <div className="text-[10px] font-mono-tabular text-[#C99A63] tracking-wider uppercase">
            MODEL AKTIF · {selectedModel.floors} LANTAI
          </div>
          <div className="text-sm sm:text-base font-display font-semibold text-[#F6F3EC] leading-snug">
            {selectedModel.name}
          </div>
          <div className="text-[11px] text-[#F6F3EC]/70 font-mono-tabular">
            Lahan {selectedModel.idealLandSize} · Bangunan {selectedModel.buildingArea}
          </div>
        </div>

        {/* Top-Right Quick Zoom & Reset Buttons */}
        <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1 bg-[#161915]/90 border border-white/10 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => sceneActionsRef.current?.zoomDelta(-2.2)}
            title="Perbesar tampilan 3D"
            aria-label="Perbesar tampilan 3D"
            className="p-1.5 text-[#F6F3EC]/80 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => sceneActionsRef.current?.zoomDelta(2.2)}
            title="Perkecil tampilan 3D"
            aria-label="Perkecil tampilan 3D"
            className="p-1.5 text-[#F6F3EC]/80 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setCameraPreset('perspective');
              setExplodeFactor(0);
              sceneActionsRef.current?.setCameraView('perspective');
            }}
            title="Reset sudut pandang kamera"
            aria-label="Reset sudut pandang kamera"
            className="p-1.5 text-[#F6F3EC]/80 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Toggle Button at Bottom-Right of Canvas */}
        <div className="absolute bottom-3 right-3.5 z-10">
          <button
            type="button"
            onClick={() => setDockCollapsed((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#F6F3EC] bg-[#161915]/90 border border-white/15 rounded-lg hover:bg-[#222822] transition-colors cursor-pointer"
          >
            {dockCollapsed ? (
              <>
                <Eye className="w-3.5 h-3.5 text-[#C99A63]" />
                <span>Tampilkan Kontrol 3D</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-[#C99A63]" />
                <span>Sembunyikan Kontrol</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Docked Control Panel Below Canvas (Never overlaps or blocks the 3D House!) */}
      {!dockCollapsed && (
        <div className="bg-[#141814] border-t border-white/10 p-3 text-[#F6F3EC] space-y-2.5">
          {/* Row 1: Camera Presets & Lighting Presets */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
            <div className="sm:col-span-7 grid grid-cols-4 gap-1 bg-[#1E241E] p-1 rounded-lg">
              {(
                [
                  { id: 'perspective', label: 'Perspektif' },
                  { id: 'front', label: 'Fasad' },
                  { id: 'poolside', label: 'Teras' },
                  { id: 'top', label: 'Denah Atas' },
                ] as { id: CameraPreset; label: string }[]
              ).map((cam) => (
                <button
                  key={cam.id}
                  type="button"
                  onClick={() => {
                    setCameraPreset(cam.id);
                    sceneActionsRef.current?.setCameraView(cam.id);
                  }}
                  className={`py-1.5 px-2 text-xs font-medium rounded-md transition-colors cursor-pointer text-center truncate ${
                    cameraPreset === cam.id
                      ? 'bg-[#B87D4B] text-[#161915] font-semibold'
                      : 'text-[#F6F3EC]/75 hover:text-white'
                  }`}
                >
                  {cam.label}
                </button>
              ))}
            </div>

            <div className="sm:col-span-5 grid grid-cols-3 gap-1 bg-[#1E241E] p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setLightingPreset('golden')}
                className={`flex items-center justify-center gap-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  lightingPreset === 'golden'
                    ? 'bg-[#B87D4B] text-[#161915] font-semibold'
                    : 'text-[#F6F3EC]/75 hover:text-white'
                }`}
              >
                <Sunset className="w-3.5 h-3.5 shrink-0" />
                <span>Sore</span>
              </button>
              <button
                type="button"
                onClick={() => setLightingPreset('daylight')}
                className={`flex items-center justify-center gap-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  lightingPreset === 'daylight'
                    ? 'bg-[#B87D4B] text-[#161915] font-semibold'
                    : 'text-[#F6F3EC]/75 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5 shrink-0" />
                <span>Siang</span>
              </button>
              <button
                type="button"
                onClick={() => setLightingPreset('night')}
                className={`flex items-center justify-center gap-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  lightingPreset === 'night'
                    ? 'bg-[#B87D4B] text-[#161915] font-semibold'
                    : 'text-[#F6F3EC]/75 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5 shrink-0" />
                <span>Malam</span>
              </button>
            </div>
          </div>

          {/* Row 2: Exploded Structure Slider & Rotation Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
            <div className="sm:col-span-8 flex items-center gap-3 bg-[#1E241E] px-3 py-1.5 rounded-lg h-9">
              <div className="flex items-center gap-1.5 shrink-0">
                <Layers className="w-3.5 h-3.5 text-[#C99A63]" />
                <label htmlFor="explode-slider" className="text-xs text-[#F6F3EC]/85 whitespace-nowrap">
                  Bedah Struktur
                </label>
              </div>
              <input
                id="explode-slider"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={explodeFactor}
                onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
                className="w-full accent-[#B87D4B] cursor-pointer"
              />
              <span className="text-[11px] font-mono-tabular text-[#C99A63] w-8 text-right shrink-0">
                {Math.round(explodeFactor * 100)}%
              </span>
            </div>

            <button
              type="button"
              onClick={() => setAutoRotate((prev) => !prev)}
              className={`sm:col-span-4 h-9 flex items-center justify-center gap-1.5 px-3 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                autoRotate
                  ? 'bg-[#283329] border-[#B87D4B]/60 text-[#F6F3EC]'
                  : 'bg-[#1E241E] border-white/10 text-[#F6F3EC]/65 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#C99A63] shrink-0" />
              <span>{autoRotate ? 'Rotasi Aktif' : 'Rotasi Berhenti'}</span>
            </button>
          </div>

          {/* Row 3: Symmetrical 4-Column Quick Model Switcher */}
          {!compactMode && allModels.length > 0 && onSelectModel && (
            <div className="pt-2 border-t border-white/10">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {allModels.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onSelectModel(m.id)}
                    className={`px-2.5 py-1.5 text-[11px] rounded-md transition-colors cursor-pointer truncate text-center ${
                      selectedModel.id === m.id
                        ? 'bg-[#F6F3EC] text-[#161915] font-semibold'
                        : 'bg-[#1E241E] text-[#F6F3EC]/75 hover:bg-[#2A332A] hover:text-white'
                    }`}
                  >
                    {m.name.replace('Rumah ', '').replace(' Keluarga', '')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
