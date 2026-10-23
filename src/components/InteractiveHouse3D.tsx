import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Eye, EyeOff, RotateCcw, Sun, Sunset, Moon, ZoomIn, ZoomOut, Layers, Compass } from 'lucide-react';
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

// Pre-allocated math helpers at module scope (Zero GC in render loop)
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();

export const InteractiveHouse3D: React.FC<InteractiveHouse3DProps> = ({
  selectedModel,
  onSelectModel,
  allModels = [],
  compactMode = false,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('golden');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('perspective');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [explodeFactor, setExplodeFactor] = useState<number>(0);

  // Mutable refs for Three.js loop access without tearing down canvas
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
  });

  const sceneActionsRef = useRef<{
    rebuildHouse: (model: HouseModel) => void;
    applyLighting: (preset: LightingPreset) => void;
    zoomDelta: (delta: number) => void;
    setCameraView: (preset: CameraPreset) => void;
  } | null>(null);

  useEffect(() => {
    stateRef.current.model = selectedModel;
    sceneActionsRef.current?.rebuildHouse(selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    stateRef.current.lighting = lightingPreset;
    sceneActionsRef.current?.applyLighting(lightingPreset);
  }, [lightingPreset]);

  useEffect(() => {
    stateRef.current.autoRotate = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    stateRef.current.explodeTarget = explodeFactor;
  }, [explodeFactor]);

  useEffect(() => {
    const mountEl = canvasMountRef.current;
    if (!mountEl) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    stateRef.current.reducedMotion = mediaQuery.matches;
    if (mediaQuery.matches) {
      setAutoRotate(false);
      stateRef.current.autoRotate = false;
    }

    // 1. Detect Software WebGL per threejs skill directive
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

    // 2. Initialize WebGLRenderer
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

    const width = mountEl.clientWidth || 960;
    const height = mountEl.clientHeight || 560;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountEl.innerHTML = '';
    mountEl.appendChild(renderer.domElement);

    // 3. Scene, Environment & Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#161B17');
    scene.fog = new THREE.FogExp2('#161B17', 0.018);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Camera & OrbitControls
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 120);
    camera.position.set(11.5, 6.2, 12.5);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 5.5;
    controls.maxDistance = 24;
    controls.target.set(0, 1.4, 0);

    controls.addEventListener('start', () => {
      stateRef.current.cameraTransitionActive = false;
    });

    // 5. Balanced 3-Point Studio & Architectural Lighting Rig
    const hemiLight = new THREE.HemisphereLight('#FFE6C2', '#233024', 0.75);
    hemiLight.position.set(0, 25, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#FFD59E', 2.2);
    keyLight.position.set(12, 16, 10);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    const d = 10;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 42;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#7CA39B', 0.8);
    rimLight.position.set(-12, 9, -10);
    scene.add(rimLight);

    const interiorWarmLight = new THREE.PointLight('#FFA94D', 2.6, 12, 1.8);
    interiorWarmLight.position.set(0.4, 1.6, 0.2);
    scene.add(interiorWarmLight);

    const poolLight = new THREE.PointLight('#4DD0E1', 1.2, 8, 2);
    poolLight.position.set(1.2, 0.3, 3.3);
    scene.add(poolLight);

    // 6. Ground Plinth, Landscape & Architectural Orbit Ring
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // Extended Dark Olive Landscape Ground
    const groundGeo = new THREE.CircleGeometry(28, 64);
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

    // Architectural Orbit Ring & Compass Ticks (Coplanar Z-fighting safe via polygonOffset)
    const ringGroup = new THREE.Group();
    ringGroup.position.y = 0.01;
    const outerRingGeo = new THREE.RingGeometry(7.2, 7.26, 96);
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

    const innerRingGeo = new THREE.RingGeometry(5.8, 5.83, 96);
    const innerRingMat = ringMat.clone();
    innerRingMat.opacity = 0.22;
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = -Math.PI / 2;
    ringGroup.add(innerRing);
    worldGroup.add(ringGroup);

    // Dynamic House Container with Explodable Sub-Groups
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

    // Procedural House Builder (Composite 10+ Part Architectural Group)
    const rebuildHouse = (model: HouseModel) => {
      clearGroup(groundFloorGroup);
      clearGroup(secondFloorGroup);
      clearGroup(roofGroup);

      const c = model.config3D;
      const sx = c.footprintScaleX;
      const sz = c.footprintScaleZ;

      // PBR Materials with distinct roughness/metalness contrast (>= 0.25 diff)
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
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: '#D8EFEA',
        roughness: 0.08,
        metalness: 0.1,
        transmission: isSoftwareGl ? 0 : 0.75,
        transparent: true,
        opacity: isSoftwareGl ? 0.42 : 0.9,
        ior: 1.52,
        reflectivity: 0.9,
      });
      const warmCoreMat = new THREE.MeshStandardMaterial({
        color: '#FCE5C2',
        emissive: '#FF9E3D',
        emissiveIntensity: 0.55,
        roughness: 0.6,
      });

      // Part 1: Raised Courtyard Lawn & Stone Plinth Base
      const lawnGeo = new THREE.BoxGeometry(8.8 * sx, 0.16, 7.6 * sz);
      const lawnMat = new THREE.MeshStandardMaterial({ color: '#2B3A29', roughness: 0.9 });
      const lawn = new THREE.Mesh(lawnGeo, lawnMat);
      lawn.position.set(0, 0.08, 0);
      lawn.receiveShadow = true;
      groundFloorGroup.add(lawn);

      const plinthGeo = new THREE.BoxGeometry(6.6 * sx, 0.28, 4.8 * sz);
      const plinth = new THREE.Mesh(plinthGeo, stoneMat);
      plinth.position.set(-0.2, 0.22, -0.4);
      plinth.castShadow = true;
      plinth.receiveShadow = true;
      groundFloorGroup.add(plinth);

      // Part 2: Timber Engawa / Terrace Deck
      const deckGeo = new THREE.BoxGeometry(4.2 * sx, 0.12, 2.2 * sz);
      const deck = new THREE.Mesh(deckGeo, woodMat);
      deck.position.set(0.8 * sx, 0.32, 1.5 * sz);
      deck.receiveShadow = true;
      groundFloorGroup.add(deck);

      // Part 3: Ground Floor Left Wing (Andesite / Secondary Wall)
      const leftWingW = 2.4 * sx;
      const leftWingH = 2.6;
      const leftWingD = 3.8 * sz;
      const leftWingGeo = new THREE.BoxGeometry(leftWingW, leftWingH, leftWingD);
      const leftWing = new THREE.Mesh(leftWingGeo, secWallMat);
      leftWing.position.set(-1.8 * sx, 0.36 + leftWingH / 2, -0.4 * sz);
      leftWing.castShadow = true;
      leftWing.receiveShadow = true;
      groundFloorGroup.add(leftWing);

      // Part 4: Ground Floor Main Living Pavilion + Illuminated Interior Core
      const mainWingW = 3.8 * sx;
      const mainWingH = 2.75;
      const mainWingD = 3.4 * sz;

      // Back & Side Structural Walls of Living Pavilion
      const backWallGeo = new THREE.BoxGeometry(mainWingW, mainWingH, 0.25);
      const backWall = new THREE.Mesh(backWallGeo, mainWallMat);
      backWall.position.set(1.0 * sx, 0.36 + mainWingH / 2, -1.9 * sz);
      backWall.castShadow = true;
      backWall.receiveShadow = true;
      groundFloorGroup.add(backWall);

      const rightWallGeo = new THREE.BoxGeometry(0.28, mainWingH, mainWingD);
      const rightWall = new THREE.Mesh(rightWallGeo, mainWallMat);
      rightWall.position.set(2.8 * sx, 0.36 + mainWingH / 2, -0.35 * sz);
      rightWall.castShadow = true;
      rightWall.receiveShadow = true;
      groundFloorGroup.add(rightWall);

      // Illuminated Interior Living Core (Sofa + Wood Feature Wall inside)
      const coreFloorGeo = new THREE.BoxGeometry(mainWingW - 0.3, 0.1, mainWingD - 0.3);
      const coreFloor = new THREE.Mesh(coreFloorGeo, warmCoreMat);
      coreFloor.position.set(1.0 * sx, 0.42, -0.35 * sz);
      groundFloorGroup.add(coreFloor);

      const sofaGeo = new THREE.BoxGeometry(1.8, 0.45, 0.85);
      const sofa = new THREE.Mesh(sofaGeo, woodMat);
      sofa.position.set(0.9 * sx, 0.65, -0.6 * sz);
      groundFloorGroup.add(sofa);

      // Floor-to-Ceiling Panoramic Glass Facade + Mullions
      const glassPaneGeo = new THREE.BoxGeometry(mainWingW - 0.35, mainWingH - 0.3, 0.06);
      const glassPane = new THREE.Mesh(glassPaneGeo, glassMat);
      glassPane.position.set(0.95 * sx, 0.36 + mainWingH / 2, 1.25 * sz);
      groundFloorGroup.add(glassPane);

      for (let i = 0; i <= 3; i++) {
        const mullionGeo = new THREE.BoxGeometry(0.05, mainWingH - 0.2, 0.1);
        const mullion = new THREE.Mesh(mullionGeo, metalMat);
        const mx = -0.65 * sx + i * ((mainWingW - 0.4) / 3);
        mullion.position.set(mx, 0.36 + mainWingH / 2, 1.26 * sz);
        groundFloorGroup.add(mullion);
      }

      // Part 5: Architectural Secondary Skin Timber Louvers
      const louverCount = c.louverCount;
      for (let i = 0; i < louverCount; i++) {
        const slatGeo = new THREE.BoxGeometry(0.06, leftWingH - 0.2, 0.16);
        const slat = new THREE.Mesh(slatGeo, woodMat);
        const lx = -2.65 * sx + (i / Math.max(louverCount - 1, 1)) * (1.7 * sx);
        slat.position.set(lx, 0.36 + leftWingH / 2, 1.52 * sz);
        slat.castShadow = true;
        groundFloorGroup.add(slat);
      }

      // Optional Javanese Pendopo Front Pavilion (Saka Guru Columns)
      if (c.hasPendopo) {
        const colPositions = [
          [-0.4 * sx, 2.3 * sz],
          [2.1 * sx, 2.3 * sz],
          [-0.4 * sx, 1.4 * sz],
          [2.1 * sx, 1.4 * sz],
        ];
        colPositions.forEach(([cx, cz]) => {
          const colGeo = new THREE.CylinderGeometry(0.09, 0.11, 2.5, 12);
          const col = new THREE.Mesh(colGeo, woodMat);
          col.position.set(cx, 0.36 + 1.25, cz);
          col.castShadow = true;
          groundFloorGroup.add(col);

          // Umpak Stone Pedestal
          const umpakGeo = new THREE.BoxGeometry(0.28, 0.22, 0.28);
          const umpak = new THREE.Mesh(umpakGeo, stoneMat);
          umpak.position.set(cx, 0.45, cz);
          groundFloorGroup.add(umpak);
        });
      }

      // Optional Mediterranean Arch Colonnade
      if (c.hasArches) {
        for (let i = 0; i < 3; i++) {
          const pillarGeo = new THREE.BoxGeometry(0.24, 2.5, 0.24);
          const pillar = new THREE.Mesh(pillarGeo, mainWallMat);
          pillar.position.set(-0.4 * sx + i * 1.3 * sx, 0.36 + 1.25, 1.55 * sz);
          pillar.castShadow = true;
          groundFloorGroup.add(pillar);
        }
      }

      // Part 6: Reflecting Pool / Swimming Pool in Courtyard
      if (c.hasPool) {
        const poolBasinGeo = new THREE.BoxGeometry(3.8 * sx, 0.22, 1.65 * sz);
        const poolBasin = new THREE.Mesh(poolBasinGeo, stoneMat);
        poolBasin.position.set(1.1 * sx, 0.14, 2.65 * sz);
        poolBasin.receiveShadow = true;
        groundFloorGroup.add(poolBasin);

        const waterGeo = new THREE.PlaneGeometry(3.55 * sx, 1.42 * sz);
        const waterMat = new THREE.MeshPhysicalMaterial({
          color: '#26737B',
          roughness: 0.06,
          metalness: 0.15,
          clearcoat: 1.0,
          clearcoatRoughness: 0.05,
        });
        const water = new THREE.Mesh(waterGeo, waterMat);
        water.rotation.x = -Math.PI / 2;
        water.position.set(1.1 * sx, 0.27, 2.65 * sz);
        groundFloorGroup.add(water);
      }

      // Part 7: Stepping Stones & Tropical Courtyard Trees
      for (let s = 0; s < 4; s++) {
        const stepGeo = new THREE.BoxGeometry(0.65, 0.06, 0.42);
        const step = new THREE.Mesh(stepGeo, stoneMat);
        step.position.set(-1.6 * sx, 0.18, 1.9 * sz + s * 0.62);
        step.receiveShadow = true;
        groundFloorGroup.add(step);
      }

      // Multi-part Tropical Trees (Trunk + 3 Canopy Spheres/Dodecahedrons)
      const createTree = (tx: number, tz: number, scale: number) => {
        const treeGrp = new THREE.Group();
        treeGrp.position.set(tx, 0.16, tz);
        const trunkGeo = new THREE.CylinderGeometry(0.08 * scale, 0.13 * scale, 1.7 * scale, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ color: '#5A4230', roughness: 0.85 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 0.85 * scale;
        trunk.castShadow = true;
        treeGrp.add(trunk);

        const foliageColors = ['#2E4730', '#3A573B', '#486847'];
        const offsets = [
          [0, 1.85 * scale, 0, 0.78 * scale],
          [0.42 * scale, 1.6 * scale, 0.25 * scale, 0.58 * scale],
          [-0.38 * scale, 1.55 * scale, -0.2 * scale, 0.52 * scale],
        ];
        offsets.forEach(([ox, oy, oz, rad], idx) => {
          const leafGeo = new THREE.DodecahedronGeometry(rad, 1);
          const leafMat = new THREE.MeshStandardMaterial({
            color: foliageColors[idx % foliageColors.length],
            roughness: 0.75,
          });
          const leaf = new THREE.Mesh(leafGeo, leafMat);
          leaf.position.set(ox, oy, oz);
          leaf.castShadow = true;
          treeGrp.add(leaf);
        });
        groundFloorGroup.add(treeGrp);
      };

      createTree(-3.4 * sx, 2.1 * sz, 1.1);
      createTree(3.55 * sx, -1.5 * sz, 0.95);
      createTree(-3.2 * sx, -2.0 * sz, 0.8);

      // Part 8: Optional Second Floor Volume (when model.config3D.stories === 2)
      let roofBaseY = 0.36 + mainWingH;
      if (c.stories === 2) {
        const slabGeo = new THREE.BoxGeometry(6.2 * sx, 0.22, 4.2 * sz);
        const slab = new THREE.Mesh(slabGeo, roofMat);
        slab.position.set(0.3 * sx, roofBaseY, -0.3 * sz);
        slab.castShadow = true;
        secondFloorGroup.add(slab);

        const upperH = 2.35;
        const upperBoxGeo = new THREE.BoxGeometry(4.1 * sx, upperH, 3.2 * sz);
        const upperBox = new THREE.Mesh(upperBoxGeo, mainWallMat);
        upperBox.position.set(0.65 * sx, roofBaseY + 0.11 + upperH / 2, -0.45 * sz);
        upperBox.castShadow = true;
        upperBox.receiveShadow = true;
        secondFloorGroup.add(upperBox);

        // Upper floor panoramic glass & balcony railing
        const upperGlassGeo = new THREE.BoxGeometry(2.8 * sx, 1.75, 0.08);
        const upperGlass = new THREE.Mesh(upperGlassGeo, glassMat);
        upperGlass.position.set(0.75 * sx, roofBaseY + 1.2, 1.16 * sz);
        secondFloorGroup.add(upperGlass);

        const balconyRailGeo = new THREE.BoxGeometry(3.8 * sx, 0.65, 0.05);
        const balconyRail = new THREE.Mesh(balconyRailGeo, glassMat);
        balconyRail.position.set(0.65 * sx, roofBaseY + 0.42, 1.68 * sz);
        secondFloorGroup.add(balconyRail);

        roofBaseY += upperH + 0.15;
      }

      // Part 9: Dynamic Architectural Roof System by Archetype
      roofGroup.position.y = 0;

      if (c.roofType === 'joglo-kontemporer') {
        // Tier 1: Wide Brunjung / Penanggap Eave
        const lowerRoofGeo = new THREE.ConeGeometry(4.8 * sx, 1.15, 4);
        const lowerRoof = new THREE.Mesh(lowerRoofGeo, roofMat);
        lowerRoof.rotation.y = Math.PI / 4;
        lowerRoof.scale.set(1.15, 1, 0.85);
        lowerRoof.position.set(0.3 * sx, roofBaseY + 0.52, -0.15 * sz);
        lowerRoof.castShadow = true;
        roofGroup.add(lowerRoof);

        // Tier 2: Iconic Steep Javanese Joglo Tajug Crown
        const upperCrownGeo = new THREE.ConeGeometry(2.45 * sx, 1.65, 4);
        const upperCrown = new THREE.Mesh(upperCrownGeo, roofMat);
        upperCrown.rotation.y = Math.PI / 4;
        upperCrown.scale.set(1.1, 1, 0.8);
        upperCrown.position.set(0.3 * sx, roofBaseY + 1.45, -0.15 * sz);
        upperCrown.castShadow = true;
        roofGroup.add(upperCrown);
      } else if (c.roofType === 'japandi-gable') {
        // Clean Pitched Gable Roof with Wood Soffit Trim
        const shape = new THREE.Shape();
        const halfW = 3.55 * sx;
        const ridgeH = 1.45;
        shape.moveTo(-halfW, 0);
        shape.lineTo(0, ridgeH);
        shape.lineTo(halfW, 0);
        shape.lineTo(-halfW, 0);

        const extrudeGeo = new THREE.ExtrudeGeometry(shape, {
          depth: 4.5 * sz,
          bevelEnabled: true,
          bevelThickness: 0.06,
          bevelSize: 0.06,
          bevelSegments: 2,
        });
        const gableMesh = new THREE.Mesh(extrudeGeo, roofMat);
        gableMesh.position.set(0.25 * sx, roofBaseY - 0.05, -2.5 * sz);
        gableMesh.castShadow = true;
        roofGroup.add(gableMesh);
      } else if (c.roofType === 'tropical-hip' || c.roofType === 'mediterranean-arch') {
        // Tropical Hip Roof with Deep Overhang
        const hipGeo = new THREE.ConeGeometry(4.7 * sx, 1.45, 4);
        const hipRoof = new THREE.Mesh(hipGeo, roofMat);
        hipRoof.rotation.y = Math.PI / 4;
        hipRoof.scale.set(1.18, 1, 0.88);
        hipRoof.position.set(0.35 * sx, roofBaseY + 0.68, -0.25 * sz);
        hipRoof.castShadow = true;
        roofGroup.add(hipRoof);
      } else if (c.roofType === 'industrial-sawtooth') {
        // Dual Asymmetrical Sawtooth / Shed Roofs
        for (let r = 0; r < 2; r++) {
          const shedGeo = new THREE.BoxGeometry(2.9 * sx, 0.18, 4.3 * sz);
          const shed = new THREE.Mesh(shedGeo, roofMat);
          shed.rotation.z = 0.18;
          shed.position.set((-1.1 + r * 2.5) * sx, roofBaseY + 0.35, -0.35 * sz);
          shed.castShadow = true;
          roofGroup.add(shed);
        }
      } else if (c.roofType === 'compact-mono') {
        // Monopitch Sloped Roof for Compact House
        const monoGeo = new THREE.BoxGeometry(5.2 * sx, 0.22, 4.1 * sz);
        const monoRoof = new THREE.Mesh(monoGeo, roofMat);
        monoRoof.rotation.z = 0.14;
        monoRoof.position.set(0.2 * sx, roofBaseY + 0.38, -0.25 * sz);
        monoRoof.castShadow = true;
        roofGroup.add(monoRoof);
      } else {
        // Flat Cantilever Architectural Slab + Warm Timber Soffit
        const topSlabGeo = new THREE.BoxGeometry(6.7 * sx, 0.24, 4.7 * sz);
        const topSlab = new THREE.Mesh(topSlabGeo, roofMat);
        topSlab.position.set(0.35 * sx, roofBaseY + 0.12, -0.2 * sz);
        topSlab.castShadow = true;
        roofGroup.add(topSlab);

        const soffitGeo = new THREE.BoxGeometry(6.5 * sx, 0.06, 4.5 * sz);
        const soffit = new THREE.Mesh(soffitGeo, woodMat);
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
      const nextDist = THREE.MathUtils.clamp(currentDist + delta, controls.minDistance, controls.maxDistance);
      _targetCamPos.normalize().multiplyScalar(nextDist);
      camera.position.copy(controls.target).add(_targetCamPos);
      controls.update();
    };

    sceneActionsRef.current = {
      rebuildHouse,
      applyLighting,
      zoomDelta,
      setCameraView,
    };

    rebuildHouse(stateRef.current.model);
    applyLighting(stateRef.current.lighting);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Pointer Parallax Handler
    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      stateRef.current.pointerX = nx;
      stateRef.current.pointerY = ny;
    };
    renderer.domElement.addEventListener('pointermove', onPointerMove, { passive: true });

    // Visibility Change Listener (pause animation when tab inactive)
    const onVisibilityChange = () => {
      stateRef.current.tabHidden = document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Resize Observer
    const onResize = () => {
      if (!mountEl) return;
      const w = mountEl.clientWidth || 800;
      const h = mountEl.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // 7. Render Loop with Software-WebGL Fence Sync Pacing & Exponential Damping
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

      if (!stateRef.current.tabHidden) {
        // Smoothly damp exploded view separation
        stateRef.current.explodeCurrent = THREE.MathUtils.damp(
          stateRef.current.explodeCurrent,
          stateRef.current.explodeTarget,
          6,
          dt
        );
        const exp = stateRef.current.explodeCurrent;
        secondFloorGroup.position.y = exp * 1.6;
        roofGroup.position.y = exp * 3.2;

        // Smooth camera preset interpolation
        if (stateRef.current.cameraTransitionActive) {
          camera.position.lerp(stateRef.current.camTargetPos, 1 - Math.exp(-5 * dt));
          controls.target.lerp(stateRef.current.camLookTarget, 1 - Math.exp(-5 * dt));
          if (camera.position.distanceTo(stateRef.current.camTargetPos) < 0.08) {
            stateRef.current.cameraTransitionActive = false;
          }
        }

        // Gentle rotation & mouse parallax when active and not in reduced-motion mode
        if (!stateRef.current.reducedMotion && !isSoftwareGl) {
          if (stateRef.current.autoRotate && !stateRef.current.cameraTransitionActive) {
            worldGroup.rotation.y += dt * 0.14;
          }
          // Subtle parallax tilt on worldGroup
          const targetRotX = stateRef.current.pointerY * 0.03;
          worldGroup.rotation.x = THREE.MathUtils.damp(worldGroup.rotation.x, targetRotX, 4, dt);
          ringGroup.rotation.z -= dt * 0.05;
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
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  if (!webglSupported) {
    return (
      <div className="relative w-full h-full min-h-[460px] rounded-xl overflow-hidden border border-[#2F3A30] bg-[#161B17]">
        <HouseCardCanvas model={selectedModel} />
        <div className="absolute bottom-4 left-4 right-4 bg-[#161915]/90 border border-white/10 p-4 rounded-lg text-[#F6F3EC] text-xs">
          Mode Pratinjau Kanvas Arsitektur Aktif (WebGL tidak tersedia pada perangkat ini).
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[500px] lg:min-h-[580px] rounded-xl overflow-hidden bg-[#161B17] border border-[#2C362D] select-none">
      {/* Isolated WebGL Canvas Container */}
      <div
        ref={canvasMountRef}
        className="w-full h-full min-h-[500px] lg:min-h-[580px] cursor-grab active:cursor-grabbing"
        role="img"
        aria-label={`Visualisasi 3D interaktif ${selectedModel.name}. Gunakan mouse atau sentuhan untuk memutar dan memperbesar model bangunan.`}
      />

      {/* Top-Left Minimal Spec Header Overlay (Zero Center Occlusion) */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-1 bg-[#161915]/88 border border-white/10 px-4 py-2.5 rounded-lg max-w-[310px]">
        <div className="text-[11px] font-mono-tabular text-[#C99A63] tracking-wider uppercase">
          MODEL AKTIF · {selectedModel.floors} LANTAI
        </div>
        <div className="text-base font-display font-semibold text-[#F6F3EC] leading-snug">
          {selectedModel.name}
        </div>
        <div className="text-xs text-[#F6F3EC]/70 font-mono-tabular">
          Lahan {selectedModel.idealLandSize} · Bangunan {selectedModel.buildingArea}
        </div>
      </div>

      {/* Top-Right Quick Zoom & Reset Buttons */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-[#161915]/88 border border-white/10 p-1.5 rounded-lg">
        <button
          type="button"
          onClick={() => sceneActionsRef.current?.zoomDelta(-2.2)}
          title="Perbesar tampilan 3D"
          aria-label="Perbesar tampilan 3D"
          className="p-2 text-[#F6F3EC]/80 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => sceneActionsRef.current?.zoomDelta(2.2)}
          title="Perkecil tampilan 3D"
          aria-label="Perkecil tampilan 3D"
          className="p-2 text-[#F6F3EC]/80 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
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
          className="p-2 text-[#F6F3EC]/80 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Unified Collapsible Bottom Control Dock */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 w-[95%] max-w-[780px]">
        {/* Collapse / Expand Toggle Tab */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setDockCollapsed((prev) => !prev)}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-[#F6F3EC] bg-[#161915]/95 border border-white/15 hover:bg-[#222822] transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              dockCollapsed
                ? 'rounded-lg shadow-xl'
                : 'rounded-t-lg border-b-0 -mb-px'
            }`}
          >
            {dockCollapsed ? (
              <>
                <Eye className="w-3.5 h-3.5 text-[#C99A63]" />
                <span>▴ Tampilkan Kontrol 3D</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-[#C99A63]" />
                <span>▾ Sembunyikan Kontrol</span>
              </>
            )}
          </button>
        </div>

        {/* Main Control Bar Surface */}
        {!dockCollapsed && (
          <div className="bg-[#161915]/95 border border-white/15 rounded-xl p-3 text-[#F6F3EC] shadow-2xl space-y-2">
            {/* Row 1: Camera Presets & Lighting Presets (Symmetrical 12-Col Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              {/* Camera View Presets (7 Cols) */}
              <div className="sm:col-span-7 grid grid-cols-4 gap-1 bg-[#222822] p-1 rounded-lg">
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

              {/* Lighting Presets (5 Cols) */}
              <div className="sm:col-span-5 grid grid-cols-3 gap-1 bg-[#222822] p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setLightingPreset('golden')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
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
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
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
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
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

            {/* Row 2: Exploded View Slider & Auto-Rotate Toggle (Symmetrical 12-Col Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <div className="sm:col-span-8 flex items-center gap-3 bg-[#222822] px-3 py-1.5 rounded-lg h-9">
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
                    : 'bg-[#222822] border-white/10 text-[#F6F3EC]/65 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-[#C99A63] shrink-0" />
                <span>{autoRotate ? 'Rotasi Aktif' : 'Rotasi Berhenti'}</span>
              </button>
            </div>

            {/* Row 3: Quick Model Switcher Grid (Zero Scrollbar, Symmetrical 4-Column Grid) */}
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
                          : 'bg-[#222822] text-[#F6F3EC]/75 hover:bg-[#2E362E] hover:text-white'
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
    </div>
  );
};
