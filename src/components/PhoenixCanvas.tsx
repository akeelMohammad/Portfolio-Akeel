import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import {
  scrollProgressToTimelineSeconds,
  sampleDevTimelineState,
  clamp,
  lerp,
} from '../utils/math';
import { CASE_STUDIES, CaseStudyData } from '../data/cases';
import { soundManager } from '../utils/audio';
import { CrystalScreenPos } from './StoryChapters';

interface PhoenixCanvasProps {
  scrollProgress: number; // 0 to 1
  onThemeChange?: (theme: 'light' | 'dark') => void;
  reimagineTrigger: number;
  onSelectCase?: (slug: string) => void;
  onHoverCase?: (caseItem: CaseStudyData | null) => void;
  onCrystalPositionsChange?: (positions: Record<string, CrystalScreenPos>) => void;
}

// Exact skeletal animation clip mapping from X.settings.glassAnimationIdToClipName in CbdjwYMp.js
const GLASS_ANIMATION_ID_TO_CLIP_NAME = [
  'Idle_MainPose_flying',
  'Float_WingPulse',
  'Wing_CloseUp',
  'Idle_MainPose_gliding',
];

// Exact crystal hover colors from X.settings.crystalHovers in CbdjwYMp.js
const CRYSTAL_HOVER_COLORS: Array<{
  base: number;
  peaks: number;
  fringe: number;
}> = [
  { base: 16508551, peaks: 16313566, fringe: 16183003 },
  { base: 8891643, peaks: 16313566, fringe: 16183003 },
  { base: 12778185, peaks: 16708857, fringe: 13367271 },
  { base: 16756986, peaks: 15196927, fringe: 14082556 },
  { base: 13360601, peaks: 16371685, fringe: 13489115 },
  { base: 5168111, peaks: 12763391, fringe: 16579836 },
  { base: 14082556, peaks: 16508551, fringe: 12778185 },
];

// Exact GlassSorter back-to-front render order from class Jte in CbdjwYMp.js
const FROM_BACK_ORDER = [
  'neck-bottom',
  'chest',
  'belly',
  'body',
  'legs',
  'back',
  'neck-top',
  'wing-left-bottom',
  'wing-left-center-bottom',
  'wing-left-center-top',
  'wing-left-pole',
  'wing-left-top',
  'wing-right-bottom',
  'wing-right-center-bottom',
  'wing-right-center-top',
  'wing-right-pole',
  'wing-right-top',
  'tail-bottom',
  'tail-center',
  'tail-top',
];

const FROM_FRONT_ORDER = [...FROM_BACK_ORDER].reverse();

// Exact PRNG from class xte in CbdjwYMp.js for deterministic background spots (Ste)
function createSeededRandom(seed = 1111111114) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return (s >>> 0) / 4294967296;
  };
}

// Helper yA(vec3, color) from CbdjwYMp.js: converts 0..255 sRGB Vector3 to THREE.Color
function setFromTimelineRgb255(vec: THREE.Vector3, target: THREE.Color): THREE.Color {
  return target.setRGB(
    clamp(vec.x / 255, 0, 1),
    clamp(vec.y / 255, 0, 1),
    clamp(vec.z / 255, 0, 1),
    THREE.SRGBColorSpace
  );
}

interface TimelineController {
  scene: THREE.Group;
  mixer: THREE.AnimationMixer;
  actions: Array<{ action: THREE.AnimationAction; duration: number }>;
  nodes: Record<string, THREE.Object3D>;
}

function buildTimelineController(gltf: {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
}): TimelineController {
  const mixer = new THREE.AnimationMixer(gltf.scene);
  const actions = (gltf.animations || []).map((clip) => {
    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.enabled = true;
    action.play();
    action.paused = true;
    return {
      action,
      duration: clip.duration,
    };
  });
  const nodes: Record<string, THREE.Object3D> = {};
  gltf.scene.traverse((obj: THREE.Object3D) => {
    if (obj.name) {
      nodes[obj.name] = obj;
    }
  });
  return { scene: gltf.scene, mixer, actions, nodes };
}

function seekTimelineController(ctrl: TimelineController | null, time: number) {
  if (!ctrl) return;
  const t = Math.max(0, time);
  for (let i = 0; i < ctrl.actions.length; i++) {
    const { action, duration } = ctrl.actions[i];
    const safeDuration = Math.max(0, duration - 0.0001);
    action.enabled = true;
    action.play();
    action.paused = true;
    action.time = Math.min(t, safeDuration);
  }
  ctrl.mixer.update(0);
  ctrl.scene.updateMatrixWorld(true);
}

export const PhoenixCanvas: React.FC<PhoenixCanvasProps> = ({
  scrollProgress,
  onThemeChange,
  reimagineTrigger,
  onSelectCase,
  onHoverCase,
  onCrystalPositionsChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(scrollProgress);
  const lastThemeRef = useRef<'light' | 'dark'>('light');
  const onSelectCaseRef = useRef(onSelectCase);
  const onHoverCaseRef = useRef(onHoverCase);
  const onCrystalPositionsRef = useRef(onCrystalPositionsChange);

  // Reimagine Phoenix color override state (mirrors class T0 & nne in CbdjwYMp.js)
  const customColorStateRef = useRef<{
    enabled: boolean;
    baseColor: THREE.Color;
    peaksColor: THREE.Color;
    fringeColor: THREE.Color;
    lastForceTimeline: number;
  }>({
    enabled: false,
    baseColor: new THREE.Color('#d4eaff'),
    peaksColor: new THREE.Color('#fdd0dd'),
    fringeColor: new THREE.Color('#f3d0f2'),
    lastForceTimeline: 0,
  });

  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    onSelectCaseRef.current = onSelectCase;
  }, [onSelectCase]);

  useEffect(() => {
    onHoverCaseRef.current = onHoverCase;
  }, [onHoverCase]);

  useEffect(() => {
    onCrystalPositionsRef.current = onCrystalPositionsChange;
  }, [onCrystalPositionsChange]);

  // Trigger exact HSL randomization from class nne in CbdjwYMp.js when "Reimagine Phoenix" is clicked
  useEffect(() => {
    if (reimagineTrigger === 0) return;
    const randomizeColor = (c: THREE.Color) => {
      const h = Math.random();
      const t = Math.random();
      const s = 1 - t * t * t;
      const r = Math.random();
      const l = Math.max(0.35, Math.min(0.85, 1 - r * r));
      c.setHSL(h, s, l);
    };
    randomizeColor(customColorStateRef.current.baseColor);
    randomizeColor(customColorStateRef.current.peaksColor);
    randomizeColor(customColorStateRef.current.fringeColor);
    customColorStateRef.current.enabled = true;
  }, [reimagineTrigger]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera (exact fov=25, near=0.1, far=500 from X.settings.camera in CbdjwYMp.js)
    const scene = new THREE.Scene();
    const bgColor = new THREE.Color('#e5def9');
    scene.background = bgColor;

    const camera = new THREE.PerspectiveCamera(
      25,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );
    camera.position.set(-34.448, 0, 0);
    camera.lookAt(-0.019, 0, 0);

    let renderer: THREE.WebGLRenderer;
    let isSoftwareGl = false;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
      });
      const gl = renderer.getContext();
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const rendererStr = debugInfo
        ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
        : '';
      isSoftwareGl = /SwiftShader|llvmpipe|Software|SubZero/i.test(rendererStr);

      const scaleFactor = isSoftwareGl ? 0.5 : 1;
      renderer.setSize(
        Math.max(1, Math.floor(window.innerWidth * scaleFactor)),
        Math.max(1, Math.floor(window.innerHeight * scaleFactor)),
        false
      );
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
    } catch {
      return;
    }

    container.appendChild(renderer.domElement);

    // 2. Background Spots (exact class Ste from CbdjwYMp.js: 32 Fibonacci-sphere planes around camera)
    const spotsRand = createSeededRandom(1111111114);
    const spotsPalette = [
      13681392, 11509480, 11390194, 13681392, 11509480, 11390194, 13681392,
      11509480, 11390194, 14083839, 14154232, 16507104, 15062255,
    ].map((hex) => new THREE.Color(hex));

    const spotsUniforms = {
      uDarkness: { value: 0 },
    };
    const spotsGeo = new THREE.PlaneGeometry(50, 50, 1, 1);
    const spotsMat = new THREE.ShaderMaterial({
      uniforms: spotsUniforms,
      vertexShader: `
        varying vec3 vColor;
        varying vec2 vUv;
        void main() {
          vColor = instanceColor;
          vUv = uv;
          vec4 worldPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying vec2 vUv;
        uniform float uDarkness;
        void main() {
          vec2 uv = vUv * (1.0 - vUv) * 0.99 + 0.005;
          float a = pow(16.0 * uv.x * uv.y, 2.0);
          gl_FragColor = vec4(vColor, a * 0.65 * (1.0 - uDarkness));
        }
      `,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    const spotsCount = 32;
    const spotsMesh = new THREE.InstancedMesh(spotsGeo, spotsMat, spotsCount);
    spotsMesh.frustumCulled = false;
    spotsMesh.renderOrder = -10;
    const spotDummyMat = new THREE.Matrix4();
    const spotScale = new THREE.Vector3(1, 1, 1);
    for (let i = 0; i < spotsCount; i++) {
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const y = 1 - (i / (spotsCount - 1)) * 2;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i;
      const pos = new THREE.Vector3(
        Math.cos(theta) * radiusAtY,
        y,
        Math.sin(theta) * radiusAtY
      ).multiplyScalar(50);
      const quat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        pos.clone().normalize()
      );
      spotDummyMat.compose(pos, quat, spotScale);
      spotsMesh.setMatrixAt(i, spotDummyMat);
      const col = spotsPalette[Math.floor(spotsRand() * spotsPalette.length)];
      spotsMesh.setColorAt(i, col);
    }
    spotsMesh.instanceMatrix.needsUpdate = true;
    if (spotsMesh.instanceColor) spotsMesh.instanceColor.needsUpdate = true;
    scene.add(spotsMesh);

    // 3. Lighting & Studio HDR Environment
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(5, 10, 8);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xd4bbfb, 4.0, 35);
    rimLight.position.set(-4, 3, -5);
    scene.add(rimLight);

    const fireLight = new THREE.PointLight(0xff6b1a, 0, 25);
    fireLight.position.set(0, -1, 2);
    scene.add(fireLight);

    const textureLoader = new THREE.TextureLoader();
    const colorsMapTex = textureLoader.load('/textures/colorsMap.png');
    colorsMapTex.minFilter = THREE.LinearFilter;
    colorsMapTex.magFilter = THREE.LinearFilter;
    colorsMapTex.colorSpace = THREE.SRGBColorSpace;

    if (!isSoftwareGl) {
      const rgbeLoader = new RGBELoader();
      rgbeLoader.load('/textures/wooden_studio_19_1k.hdr', (hdrTex) => {
        hdrTex.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = hdrTex;
      });
    }

    // 4. Shared Uniforms for Phoenix Glass Shader (driven by dev.glb)
    const glassUniforms = {
      uBaseColor: { value: new THREE.Color('#d4eaff') },
      uPeaksColor: { value: new THREE.Color('#fdd0dd') },
      uFringeColor: { value: new THREE.Color('#f3d0f2') },
      uPeaksFactor: { value: 3.0 },
      uFringeCurve: { value: 4.0 },
      uFringeMix: { value: 0.55 },
      uColorBoost: { value: 1.55 },
      uColorFactor: { value: 1.0 },
      uColorCurve: { value: 0.95 },
      uReflectionIri: { value: 0.2 },
      uEnvReflection: { value: 1.0 },
      uDistancesFactor: { value: 1.0 },
      uResetDistances: { value: 0.0 },
      uDecayFactor: { value: 20.0 },
      uIsBurning: { value: 0.0 },
      uTime: { value: 0.0 },
      uColorsMap: { value: colorsMapTex },
    };

    // Create authentic Noomo Glass Material that uses v20.glb's _peaks & _thickness attributes
    const phoenixGlassMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#ffffff'),
      emissive: new THREE.Color('#1a1025'),
      emissiveIntensity: 0.22,
      roughness: 0.08,
      metalness: 0.05,
      transmission: isSoftwareGl ? 0 : 0.88,
      thickness: 1.8,
      ior: 1.38,
      iridescence: 1.0,
      iridescenceIOR: 1.42,
      iridescenceThicknessRange: [120, 720],
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      depthWrite: !isSoftwareGl,
    });

    phoenixGlassMaterial.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, glassUniforms);

      shader.vertexShader =
        `
        attribute float _thickness;
        attribute float _peaks;
        varying float vGlassThickness;
        varying float vGlassPeaks;
        varying vec3 vWorldPos;
        varying vec3 vWorldNorm;
        ` + shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        vGlassThickness = _thickness;
        vGlassPeaks = _peaks;
        `
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <worldpos_vertex>',
        `
        #include <worldpos_vertex>
        vec4 wp = modelMatrix * vec4(transformed, 1.0);
        vWorldPos = wp.xyz;
        vWorldNorm = normalize(mat3(modelMatrix) * objectNormal);
        `
      );

      shader.fragmentShader =
        `
        varying float vGlassThickness;
        varying float vGlassPeaks;
        varying vec3 vWorldPos;
        varying vec3 vWorldNorm;
        uniform vec3 uBaseColor;
        uniform vec3 uPeaksColor;
        uniform vec3 uFringeColor;
        uniform float uPeaksFactor;
        uniform float uFringeCurve;
        uniform float uFringeMix;
        uniform float uColorBoost;
        uniform float uColorFactor;
        uniform float uReflectionIri;
        uniform float uDistancesFactor;
        uniform float uResetDistances;
        uniform float uDecayFactor;
        uniform float uIsBurning;
        uniform float uTime;
        uniform sampler2D uColorsMap;
        ` + shader.fragmentShader;

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `
        vec3 viewDir = normalize(vWorldPos - cameraPosition);
        vec3 nrm = normalize(vWorldNorm);
        float cosTheta = clamp(abs(dot(viewDir, nrm)), 0.0, 1.0);
        float fresnel = 0.04 + 0.96 * pow(1.0 - cosTheta, 4.0);

        // Exact vGlassColor formula from w1 in CbdjwYMp.js:
        float peaksMix = clamp(vGlassPeaks * uPeaksFactor, 0.0, 1.0);
        vec3 glassTint = mix(uBaseColor, uPeaksColor, peaksMix);

        // Thickness attenuation & fringe glow from x1 in CbdjwYMp.js:
        float effThickness = mix(vGlassThickness * uDistancesFactor, 0.1, uResetDistances);
        float decay = exp(-effThickness * uDecayFactor * 0.015);
        vec3 tinted = mix(glassTint, vec3(1.0), decay * 0.35);

        float fringeness = uFringeMix * pow(clamp(1.0 - cosTheta, 0.0, 1.0), max(0.5, uFringeCurve * 0.65));
        tinted = mix(tinted, uFringeColor, fringeness);

        // Iridescence lookup from colorsMap.png
        vec3 iriSample = texture2D(uColorsMap, vec2((1.0 - cosTheta) * 0.3 + 0.08, 0.85)).rgb;
        vec3 iri = mix(vec3(1.0), iriSample * 1.35, uReflectionIri);

        // Combine physical shading with Noomo glass color & dispersion
        vec3 finalRgb = mix(gl_FragColor.rgb * tinted, tinted * iri, 0.62) * uColorFactor;
        float lum = dot(finalRgb, vec3(0.2126, 0.7152, 0.0722));
        finalRgb = max(vec3(0.0), (finalRgb - lum) * uColorBoost + lum);
        finalRgb += uFringeColor * fresnel * 0.42 * iri;

        // Fire / ember glow when isBurning > 0 (Chapters 15-17 & Footer)
        if (uIsBurning > 0.01) {
          float emberPulse = 0.75 + 0.25 * sin(uTime * 5.0 + vWorldPos.y * 4.0);
          vec3 fireTint = mix(vec3(1.0, 0.38, 0.05), vec3(1.0, 0.78, 0.2), peaksMix);
          finalRgb = mix(finalRgb, finalRgb * fireTint + fireTint * (fresnel * 0.85 + peaksMix * 0.55) * emberPulse, uIsBurning);
        }

        gl_FragColor.rgb = clamp(finalRgb, 0.0, 3.5);
        #include <dithering_fragment>
        `
      );
    };

    // 5. Load GLTF Timelines (cam.glb & dev.glb) and 3D Models (v20.glb, feather.glb, crystal0..6.glb)
    let isDisposed = false;

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    // Resilient GLTF loader with exponential backoff and error recovery for Cloud Run rate limits (HTTP 429)
    const safeLoadGLTF = (
      url: string,
      onSuccess: (gltf: GLTF) => void,
      onErrorFallback?: () => void,
      maxRetries = 4,
      initialDelay = 400
    ) => {
      let attempts = 0;
      const execute = () => {
        if (isDisposed) return;
        attempts++;
        gltfLoader.load(
          url,
          (gltf) => {
            if (isDisposed) return;
            onSuccess(gltf);
          },
          undefined,
          (err) => {
            if (isDisposed) return;
            console.warn(`[3D] Failed to load ${url} (attempt ${attempts}/${maxRetries}):`, err);
            if (attempts < maxRetries) {
              const delay = initialDelay * Math.pow(1.8, attempts - 1) + Math.random() * 200;
              setTimeout(execute, delay);
            } else {
              console.warn(`[3D] Max retries reached for ${url}, activating fallback.`);
              onErrorFallback?.();
            }
          }
        );
      };
      execute();
    };

    let camTimeline: TimelineController | null = null;
    let devTimeline: TimelineController | null = null;

    safeLoadGLTF('/timelines/cam.glb', (gltf) => {
      camTimeline = buildTimelineController(gltf);
      const initT = scrollProgressToTimelineSeconds(scrollRef.current);
      seekTimelineController(camTimeline, initT);
    });

    safeLoadGLTF('/timelines/dev.glb', (gltf) => {
      devTimeline = buildTimelineController(gltf);
      const initT = scrollProgressToTimelineSeconds(scrollRef.current);
      seekTimelineController(devTimeline, initT);
    });

    // Phoenix Container & Skeletal Animation state
    const phoenixGroup = new THREE.Group();
    phoenixGroup.position.set(-33.27, 0.053, 0.666);
    scene.add(phoenixGroup);

    let phoenixModelRoot: THREE.Object3D | null = null;
    let phoenixMixer: THREE.AnimationMixer | null = null;
    let phoenixClips: THREE.AnimationClip[] = [];
    let currentPhoenixAction: THREE.AnimationAction | null = null;
    let currentAnimId = -1;
    let neckBone: THREE.Bone | null = null;
    const neckBaseRot = new THREE.Euler();
    const phoenixGlassMeshes: Record<string, THREE.Mesh> = {};

    const selectPhoenixClip = (animId: number) => {
      if (!phoenixMixer || phoenixClips.length === 0) return;
      const idx = clamp(Math.round(animId), 0, GLASS_ANIMATION_ID_TO_CLIP_NAME.length - 1);
      if (idx === currentAnimId) return;
      currentAnimId = idx;
      const clipName = GLASS_ANIMATION_ID_TO_CLIP_NAME[idx];
      const clip =
        phoenixClips.find((c) => c.name === clipName) || phoenixClips[0];
      if (!clip) return;
      const nextAction = phoenixMixer.clipAction(clip);
      if (currentPhoenixAction && currentPhoenixAction !== nextAction) {
        currentPhoenixAction.fadeOut(0.35);
      }
      nextAction.reset().fadeIn(0.35).play();
      currentPhoenixAction = nextAction;
    };

    safeLoadGLTF('/models/v20.glb', (gltf) => {
      const root = gltf.scene.children[0] || gltf.scene;
      phoenixModelRoot = root;

      root.traverse((child: THREE.Object3D) => {
        if ((child as THREE.Bone).isBone && child.name === 'b_neck') {
          neckBone = child as THREE.Bone;
          neckBaseRot.copy(neckBone.rotation);
        }
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          // In CbdjwYMp.js (class as / GlassSupport), mesh.name === "trail" is a particle emitter helper, NOT a solid mesh!
          if (mesh.name === 'trail') {
            mesh.visible = false;
            return;
          }
          // Fix 4-component tangent attribute just like function nk(n) in CbdjwYMp.js
          const tangentAttr = mesh.geometry.getAttribute('tangent');
          if (tangentAttr && tangentAttr.itemSize === 4) {
            const count = tangentAttr.count;
            const arr = new Float32Array(count * 3);
            for (let i = 0; i < count; i++) {
              arr[i * 3 + 0] = tangentAttr.getX(i);
              arr[i * 3 + 1] = tangentAttr.getY(i);
              arr[i * 3 + 2] = tangentAttr.getZ(i);
            }
            mesh.geometry.setAttribute(
              'tangent',
              new THREE.BufferAttribute(arr, 3, tangentAttr.normalized)
            );
          }
          mesh.material = phoenixGlassMaterial;
          mesh.frustumCulled = false;
          phoenixGlassMeshes[mesh.name] = mesh;
        }
      });

      phoenixGroup.add(root);

      if (gltf.animations && gltf.animations.length > 0) {
        phoenixClips = gltf.animations;
        phoenixMixer = new THREE.AnimationMixer(root);
        selectPhoenixClip(2); // Starts with Wing_CloseUp at t=0
      }
    });

    // 6. Sun Glow Sprite (matches class hl in CbdjwYMp.js)
    const sunTex = textureLoader.load('/textures/icon.png', undefined, undefined, () => {});
    const sunMat = new THREE.SpriteMaterial({
      map: sunTex,
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });
    const sunSprite = new THREE.Sprite(sunMat);
    sunSprite.visible = false;
    scene.add(sunSprite);

    // 7. Falling Hero Feather (matches class vne in CbdjwYMp.js)
    const featherGroup = new THREE.Group();
    featherGroup.visible = false;
    scene.add(featherGroup);

    const spriteTex = textureLoader.load('/textures/sprite.png', undefined, undefined, () => {});
    const featherGlowMat = new THREE.SpriteMaterial({
      map: spriteTex,
      color: 0xa5b4fc,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const featherGlow = new THREE.Sprite(featherGlowMat);
    featherGlow.scale.set(2.2, 2.2, 1);
    featherGroup.add(featherGlow);

    let featherMesh: THREE.Object3D | null = null;
    safeLoadGLTF('/models/feather.glb', (gltf) => {
      const mesh = gltf.scene;
      featherMesh = mesh;
      mesh.traverse((child: THREE.Object3D) => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).material = phoenixGlassMaterial;
        }
      });
      featherGroup.add(mesh);
    });

    // 8. 7 Interactive Case Study Crystals (matches class Jh, function oie & class sie in CbdjwYMp.js)
    const crystalsGroup = new THREE.Group();
    crystalsGroup.visible = false;
    scene.add(crystalsGroup);

    const crystalContainers: THREE.Group[] = [];
    const crystalMaterials: THREE.MeshPhysicalMaterial[] = [];
    const crystalHoverProgress: number[] = new Array(7).fill(0);
    let hoveredCrystalIndex: number | null = null;

    // Exact IconMaterial (class sie in CbdjwYMp.js) for the suspended inner 3D icon inside each crystal
    const crystalIconMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vPosition = worldPosition.xyz;
          vNormal = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
          gl_Position.xy /= 1.25;
        }
      `,
      fragmentShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        void main() {
          vec3 ray = normalize(cameraPosition - vPosition);
          ray = reflect(ray, normalize(vNormal));
          vec3 color = abs(ray.z) * 0.2 + vec3(0.5);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    // Invisible raycast material for ConvexHull intersectorMesh (matches Jh.onRaycaster in CbdjwYMp.js)
    const convexHullMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
      colorWrite: false,
    });

    CASE_STUDIES.forEach((caseItem, idx) => {
      const holder = new THREE.Group();
      holder.userData = { caseIndex: idx, slug: caseItem.slug };
      crystalsGroup.add(holder);
      crystalContainers.push(holder);

      const normalMap = textureLoader.load(
        `/textures/crystals/${idx}.jpg`,
        undefined,
        undefined,
        () => {}
      );
      normalMap.wrapS = THREE.RepeatWrapping;
      normalMap.wrapT = THREE.RepeatWrapping;

      const crystalMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xffffff),
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.22,
        roughness: 0.08,
        metalness: 0.05,
        transmission: isSoftwareGl ? 0 : 0.92,
        thickness: 2.4,
        ior: 1.35,
        iridescence: 0.55,
        iridescenceIOR: 1.45,
        normalMap,
        normalScale: new THREE.Vector2(0.55, 0.55),
        clearcoat: 1.0,
        clearcoatRoughness: 0.06,
        transparent: true,
        opacity: isSoftwareGl ? 0.86 : 0.96,
        depthWrite: false,
      });
      crystalMaterials.push(crystalMat);

      // 1. Immediate Procedural Faceted Crystal Placeholder (guarantees zero missing models & instant raycasting)
      const placeholderGroup = new THREE.Group();
      placeholderGroup.name = `PlaceholderGroup_${idx}`;

      const crystalGeo = new THREE.OctahedronGeometry(1.0, 0);
      crystalGeo.scale(1.0, 1.8, 1.0);
      const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
      crystalMesh.name = `Crystal_${idx}`;
      crystalMesh.renderOrder = 2;
      crystalMesh.userData = { caseIndex: idx, slug: caseItem.slug };
      placeholderGroup.add(crystalMesh);

      const iconGeo = new THREE.OctahedronGeometry(0.42, 0);
      const iconMesh = new THREE.Mesh(iconGeo, crystalIconMaterial);
      iconMesh.name = 'Icon';
      iconMesh.renderOrder = 1;
      iconMesh.userData = { caseIndex: idx, slug: caseItem.slug };
      placeholderGroup.add(iconMesh);

      const hullGeo = new THREE.OctahedronGeometry(1.25, 0);
      hullGeo.scale(1.0, 1.9, 1.0);
      const hullMesh = new THREE.Mesh(hullGeo, convexHullMaterial);
      hullMesh.name = 'ConvexHull';
      hullMesh.renderOrder = 0;
      hullMesh.userData = { caseIndex: idx, slug: caseItem.slug };
      placeholderGroup.add(hullMesh);

      holder.add(placeholderGroup);

      // 2. Staggered load to avoid Cloud Run concurrent burst limits (HTTP 429) + automatic exponential backoff
      setTimeout(() => {
        if (isDisposed) return;
        safeLoadGLTF(`/models/crystal${idx}.glb`, (gltf) => {
          if (isDisposed) return;
          const model = gltf.scene;
          model.traverse((child: THREE.Object3D) => {
            if ((child as THREE.Mesh).isMesh) {
              const m = child as THREE.Mesh;
              m.geometry.deleteAttribute('_coverage');
              m.geometry.deleteAttribute('_numnonpacked');

              // Exact 4-component tangent fix from function oie(n,e,t) in CbdjwYMp.js
              const tangentAttr = m.geometry.getAttribute('tangent');
              if (tangentAttr && tangentAttr.itemSize === 4) {
                const count = tangentAttr.count;
                const arr = new Float32Array(count * 3);
                for (let i = 0; i < count; i++) {
                  arr[i * 3 + 0] = tangentAttr.getX(i);
                  arr[i * 3 + 1] = tangentAttr.getY(i);
                  arr[i * 3 + 2] = tangentAttr.getZ(i);
                }
                m.geometry.setAttribute(
                  'tangent',
                  new THREE.BufferAttribute(arr, 3, tangentAttr.normalized)
                );
              }

              if (m.name === 'ConvexHull') {
                m.material = convexHullMaterial;
                m.renderOrder = 0;
              } else if (m.name === 'Icon') {
                m.material = crystalIconMaterial;
                m.renderOrder = 1;
              } else {
                m.material = crystalMat;
                m.renderOrder = 2;
              }
              m.userData = { caseIndex: idx, slug: caseItem.slug };
            }
          });
          // Swap out the procedural placeholder with the loaded high-poly GLB
          holder.remove(placeholderGroup);
          holder.add(model);
        });
      }, 300 + idx * 220);
    });

    // 9. Atmospheric Sparkle / Ember Particles around Phoenix & Feather
    const particleCount = isSoftwareGl ? 70 : 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 14;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    particleGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(particlePositions, 3)
    );
    const particleMat = new THREE.PointsMaterial({
      size: 0.16,
      map: spriteTex,
      transparent: true,
      opacity: 0.45,
      color: 0xd8b4fe,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 10. Pointer & Raycaster Interaction (matches class _v spherical offset & Jh raycaster)
    const pointerNdc = new THREE.Vector2(0, 0);
    const smoothPointer = new THREE.Vector2(0, 0);
    const raycaster = new THREE.Raycaster();

    const handleMouseMove = (e: MouseEvent) => {
      pointerNdc.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerNdc.y = -(e.clientY / window.innerHeight) * 2 + 1;

      if (crystalsGroup.visible) {
        raycaster.setFromCamera(pointerNdc, camera);
        const hits = raycaster.intersectObjects(crystalsGroup.children, true);
        if (hits.length > 0) {
          let obj: THREE.Object3D | null = hits[0].object;
          while (obj && obj.userData?.caseIndex === undefined) {
            obj = obj.parent;
          }
          const hitIndex = obj?.userData?.caseIndex;
          if (typeof hitIndex === 'number') {
            if (hoveredCrystalIndex !== hitIndex) {
              hoveredCrystalIndex = hitIndex;
              soundManager.playHover();
              onHoverCaseRef.current?.(CASE_STUDIES[hitIndex]);
            }
            return;
          }
        }
        if (hoveredCrystalIndex !== null) {
          hoveredCrystalIndex = null;
          onHoverCaseRef.current?.(null);
        }
      } else if (hoveredCrystalIndex !== null) {
        hoveredCrystalIndex = null;
        onHoverCaseRef.current?.(null);
      }
    };

    const handleClick = () => {
      if (hoveredCrystalIndex !== null && crystalsGroup.visible) {
        const targetCase = CASE_STUDIES[hoveredCrystalIndex];
        if (targetCase && onSelectCaseRef.current) {
          soundManager.playRelease();
          onSelectCaseRef.current(targetCase.slug);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      const scaleFactor = isSoftwareGl ? 0.5 : 1;
      renderer.setSize(
        Math.max(1, Math.floor(window.innerWidth * scaleFactor)),
        Math.max(1, Math.floor(window.innerHeight * scaleFactor)),
        false
      );
    };
    window.addEventListener('resize', handleResize);

    // 11. Main Animation & Timeline Evaluation Loop
    let clock = new THREE.Clock();
    let frameId = 0;
    isDisposed = false;
    let lastCrystalEmitTime = 0;

    // Reusable objects for zero-allocation frame loop
    const camPosVec = new THREE.Vector3(-34.448, 0, 0);
    const camTargetVec = new THREE.Vector3(-0.019, 0, 0);
    const camOffsetVec = new THREE.Vector3();
    const spherical = new THREE.Spherical();
    const targetBgColor = new THREE.Color('#e5def9');
    const targetGlassColor = new THREE.Color('#d4eaff');
    const targetPeaksColor = new THREE.Color('#fdd0dd');
    const targetFringeColor = new THREE.Color('#f3d0f2');
    const crystalNdc = new THREE.Vector3();

    const animate = () => {
      if (isDisposed) return;

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      glassUniforms.uTime.value = elapsed;

      const p = scrollRef.current;
      // Convert scrollProgress [0..1] to exact Blender timeline time [0..20] seconds
      const timelineSeconds = scrollProgressToTimelineSeconds(p, window.innerWidth < 768);

      // Step 1: Seek cam.glb and dev.glb timelines to exact timelineSeconds
      seekTimelineController(camTimeline, timelineSeconds);
      seekTimelineController(devTimeline, timelineSeconds);

      smoothPointer.x += (pointerNdc.x - smoothPointer.x) * 0.08;
      smoothPointer.y += (pointerNdc.y - smoothPointer.y) * 0.08;

      // Step 2: Evaluate dev.glb parameters (or fallback to pure sampleDevTimelineState before GLB loads)
      const fallbackDev = sampleDevTimelineState(timelineSeconds);
      let pointerInfluence = 5.0;
      let isFollowing = 0.0;
      let envDarkness = fallbackDev.envDarkness;

      if (devTimeline) {
        const dn = devTimeline.nodes;
        if (dn.Env_background) {
          setFromTimelineRgb255(dn.Env_background.position, targetBgColor);
        } else {
          targetBgColor.set(fallbackDev.envBackgroundHex);
        }

        if (dn.Env_darkness) {
          envDarkness = clamp(dn.Env_darkness.position.x, 0, 1);
        }

        // Check Glass_forceTimeline to restore timeline colors after Reimagine Phoenix
        if (dn.Glass_forceTimeline) {
          const ft = dn.Glass_forceTimeline.position.x;
          if (ft > 0.01 && customColorStateRef.current.lastForceTimeline <= 0.01) {
            customColorStateRef.current.enabled = false;
          }
          customColorStateRef.current.lastForceTimeline = ft;
        }

        if (customColorStateRef.current.enabled) {
          targetGlassColor.copy(customColorStateRef.current.baseColor);
          targetPeaksColor.copy(customColorStateRef.current.peaksColor);
          targetFringeColor.copy(customColorStateRef.current.fringeColor);
        } else {
          if (dn.Glass_color) {
            setFromTimelineRgb255(dn.Glass_color.position, targetGlassColor);
          }
          if (dn.Glass_peaksColor) {
            setFromTimelineRgb255(dn.Glass_peaksColor.position, targetPeaksColor);
          }
          if (dn.Glass_fringeColor) {
            setFromTimelineRgb255(dn.Glass_fringeColor.position, targetFringeColor);
          }
        }

        // Shader curve & dispersion tracks from dev.glb
        if (dn.Glass_convexConcavePeaks) {
          glassUniforms.uPeaksFactor.value = dn.Glass_convexConcavePeaks.position.z;
        }
        if (dn.Glass_fringeCurveMix) {
          glassUniforms.uFringeCurve.value = dn.Glass_fringeCurveMix.position.x;
          glassUniforms.uFringeMix.value = dn.Glass_fringeCurveMix.position.y;
        }
        if (dn.Glass_colorBoostFactorCurve) {
          glassUniforms.uColorBoost.value = dn.Glass_colorBoostFactorCurve.position.x;
          glassUniforms.uColorFactor.value = dn.Glass_colorBoostFactorCurve.position.y;
          glassUniforms.uColorCurve.value = dn.Glass_colorBoostFactorCurve.position.z;
        }
        if (dn.Glass_reflectionVIri) {
          glassUniforms.uEnvReflection.value = dn.Glass_reflectionVIri.position.x;
          glassUniforms.uReflectionIri.value = dn.Glass_reflectionVIri.position.y;
        }
        if (dn.Glass_distResetX) {
          glassUniforms.uResetDistances.value = dn.Glass_distResetX.position.x;
          glassUniforms.uDistancesFactor.value = dn.Glass_distResetX.position.y;
        }
        if (dn.Glass_colorMaxvalDecayUsetransmittance) {
          glassUniforms.uDecayFactor.value =
            dn.Glass_colorMaxvalDecayUsetransmittance.position.y;
        }
        if (dn.Glass_iorVDeltaXshift) {
          phoenixGlassMaterial.ior = clamp(dn.Glass_iorVDeltaXshift.position.x, 1.05, 2.2);
        }

        // Phoenix skeletal animation ID from dev.glb
        if (dn.Phoenix_animationId) {
          selectPhoenixClip(dn.Phoenix_animationId.position.x);
        }

        // GlassSorter render order from dev.glb
        if (dn.GlassSorter) {
          const orderIdx = Math.floor(dn.GlassSorter.position.x);
          const orderList = orderIdx === 1 ? FROM_FRONT_ORDER : FROM_BACK_ORDER;
          orderList.forEach((partName, rIdx) => {
            const partMesh = phoenixGlassMeshes[partName];
            if (partMesh) partMesh.renderOrder = rIdx + 1;
          });
        }

        // Fire / burning state at end of story (t >= 19.0)
        const burningVal = dn.isBurning ? dn.isBurning.position.x : fallbackDev.isBurning ? 1 : 0;
        glassUniforms.uIsBurning.value = lerp(
          glassUniforms.uIsBurning.value,
          burningVal > 0.5 ? 1.0 : 0.0,
          0.08
        );
        fireLight.intensity = glassUniforms.uIsBurning.value * 8.5;

        // Feather visibility from dev.glb
        const featherOp = dn.Feather_opacity ? dn.Feather_opacity.position.x : 0;
        featherGroup.visible = featherOp > 0.01;

        // Projects (Crystals) visibility from dev.glb
        const projVis = dn.Projects_visible ? dn.Projects_visible.position.x : 0;
        crystalsGroup.visible = projVis > 0.5;

        // Sun opacity & size from dev.glb
        const sunOp = dn.Sun_opacity ? dn.Sun_opacity.position.x : 0;
        sunSprite.visible = sunOp > 0.01;
        sunMat.opacity = clamp(sunOp * 0.65, 0, 1);
        if (dn.Sun_sizeAmp) {
          const sunSize = Math.max(0.5, dn.Sun_sizeAmp.position.x);
          sunSprite.scale.setScalar(sunSize * (1 + Math.sin(elapsed * 0.57) * 0.05));
        }

        if (dn.Camera_pointerInfluence) {
          pointerInfluence = dn.Camera_pointerInfluence.position.x;
        }
        if (dn.isFollowing) {
          isFollowing = dn.isFollowing.position.x;
        }
      } else {
        targetBgColor.set(fallbackDev.envBackgroundHex);
        setFromTimelineRgb255(
          new THREE.Vector3(...fallbackDev.glassColorRgb),
          targetGlassColor
        );
        setFromTimelineRgb255(
          new THREE.Vector3(...fallbackDev.peaksColorRgb),
          targetPeaksColor
        );
        setFromTimelineRgb255(
          new THREE.Vector3(...fallbackDev.fringeColorRgb),
          targetFringeColor
        );
        selectPhoenixClip(fallbackDev.animationId);
        featherGroup.visible = fallbackDev.featherVisible;
        crystalsGroup.visible = fallbackDev.projectsVisible;
      }

      // Smooth spring interpolation for Glass colors (matches class T0 in CbdjwYMp.js)
      glassUniforms.uBaseColor.value.lerp(targetGlassColor, 0.14);
      glassUniforms.uPeaksColor.value.lerp(targetPeaksColor, 0.14);
      glassUniforms.uFringeColor.value.lerp(targetFringeColor, 0.14);
      phoenixGlassMaterial.emissive.copy(glassUniforms.uPeaksColor.value).multiplyScalar(0.22);
      rimLight.color.copy(glassUniforms.uFringeColor.value);

      // Update background color & spots darkness (matches class ml & Ste in CbdjwYMp.js)
      bgColor.copy(targetBgColor);
      document.body.style.backgroundColor = `#${bgColor.getHexString()}`;
      spotsUniforms.uDarkness.value = envDarkness;
      spotsMesh.visible = envDarkness < 0.995;

      const currentTheme: 'light' | 'dark' = envDarkness >= 0.5 ? 'dark' : 'light';
      if (currentTheme !== lastThemeRef.current) {
        lastThemeRef.current = currentTheme;
        onThemeChange?.(currentTheme);
      }

      // Step 3: Evaluate cam.glb positions & rotations for Camera, Target, Phoenix, Feather, Sun, and Crystals
      if (camTimeline) {
        const cn = camTimeline.nodes;

        // Camera & Target (exact spherical pointer offset around Target from class _v in CbdjwYMp.js)
        if (cn.Camera && cn.Target) {
          camPosVec.copy(cn.Camera.position);
          camTargetVec.copy(cn.Target.position);

          camOffsetVec.copy(camPosVec).sub(camTargetVec);
          spherical.setFromVector3(camOffsetVec);
          const radX = (smoothPointer.x * Math.PI) / 180;
          const radY = (smoothPointer.y * Math.PI) / 180;
          spherical.theta += radX * pointerInfluence;
          spherical.phi = clamp(
            spherical.phi - radY * pointerInfluence,
            0.05,
            Math.PI - 0.05
          );
          camera.position.setFromSpherical(spherical).add(camTargetVec);
          camera.lookAt(camTargetVec);
        }

        // Phoenix exact position & quaternion from cam.glb (matches class Mn in CbdjwYMp.js)
        if (cn.Phoenix) {
          phoenixGroup.position.copy(cn.Phoenix.position);
          phoenixGroup.quaternion.copy(cn.Phoenix.quaternion);
        }

        // Sun position from cam.glb
        if (cn.Sun) {
          sunSprite.position.copy(cn.Sun.position);
        }

        // Feather position, rotation, and scale from cam.glb (matches class vne in CbdjwYMp.js)
        if (cn.Feather && featherGroup.visible) {
          featherGroup.position.copy(cn.Feather.position);
          featherGroup.position.y += Math.sin(elapsed) * 0.1;
          featherGroup.quaternion.copy(cn.Feather.quaternion);
          featherGroup.scale.copy(cn.Feather.scale);
          if (featherMesh) {
            featherMesh.rotation.y = (elapsed * Math.PI * 2) / 3;
          }
        }

        // 7 Crystal Case Study positions, rotations, scales & 2D viewport projections (matches class Jh in CbdjwYMp.js)
        if (crystalsGroup.visible) {
          const screenPositions: Record<string, CrystalScreenPos> = {};
          for (let i = 0; i < crystalContainers.length; i++) {
            const projNode = cn[`project${i}`];
            const holder = crystalContainers[i];
            if (projNode && holder) {
              holder.position.copy(projNode.position);
              holder.quaternion.copy(projNode.quaternion);
              holder.scale.copy(projNode.scale);

              const isHovered = hoveredCrystalIndex === i;
              crystalHoverProgress[i] +=
                ((isHovered ? 1 : 0) - crystalHoverProgress[i]) * 0.12;
              const hp = crystalHoverProgress[i];
              const rotSign = i % 2 === 0 ? 1 : -1;
              holder.rotateOnWorldAxis(
                holder.up,
                hp * ((15 * Math.PI) / 180) * rotSign
              );

              if (crystalMaterials[i]) {
                const hoverCfg = CRYSTAL_HOVER_COLORS[i] || CRYSTAL_HOVER_COLORS[0];
                crystalMaterials[i].color
                  .setHex(0xffffff)
                  .lerp(new THREE.Color(hoverCfg.base), hp * 0.85);
                crystalMaterials[i].emissive
                  .setHex(0xffffff)
                  .lerp(new THREE.Color(hoverCfg.fringe), hp);
                crystalMaterials[i].emissiveIntensity = 0.22 + hp * 0.65;
                crystalMaterials[i].iridescence = 0.55 + hp * 0.45;
              }

              // Project 3D crystal position to normalized 2D screen coords (0..1)
              crystalNdc.copy(holder.position).project(camera);
              const inView =
                crystalNdc.x > -1.5 &&
                crystalNdc.x < 1.5 &&
                crystalNdc.y > -1.5 &&
                crystalNdc.y < 1.5 &&
                holder.scale.x > 0.05;
              screenPositions[`crystal${i}`] = {
                x: crystalNdc.x * 0.5 + 0.5,
                y: crystalNdc.y * 0.5 + 0.5,
                visible: inView,
              };
            }
          }

          if (elapsed - lastCrystalEmitTime > 0.05) {
            lastCrystalEmitTime = elapsed;
            onCrystalPositionsRef.current?.(screenPositions);
          }
        }
      }

      // Keep background spots centered on camera (matches Ste.onTick in CbdjwYMp.js)
      if (spotsMesh.visible) {
        spotsMesh.position.copy(camera.position);
        spotsMesh.rotation.y = elapsed * 0.03;
      }

      // Update Phoenix skeletal animation mixer & neck pointer tracking (matches Zte & ene in CbdjwYMp.js)
      if (phoenixMixer) {
        phoenixMixer.update(delta);
        if (neckBone && isFollowing > 0.01) {
          const rotX = smoothPointer.y * 0.5 - Math.PI;
          const rotY = Math.PI * 0.25 - smoothPointer.x * 0.5;
          neckBone.rotation.x = lerp(neckBone.rotation.x, rotX, isFollowing * 0.35);
          neckBone.rotation.y = lerp(neckBone.rotation.y, rotY, isFollowing * 0.35);
        }
      }

      // Center sparkle particles around Phoenix
      particles.position.copy(phoenixGroup.position);
      particles.rotation.y = elapsed * 0.06;
      particleMat.color.copy(
        glassUniforms.uIsBurning.value > 0.3
          ? new THREE.Color(0xff7b29)
          : glassUniforms.uFringeColor.value
      );
      particleMat.opacity = envDarkness > 0.5 ? 0.55 : 0.22;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        frameId = window.setTimeout(
          () => requestAnimationFrame(animate),
          140
        ) as unknown as number;
      } else {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      dracoLoader.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};
