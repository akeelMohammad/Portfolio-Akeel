/**
 * Exact Blender Timeline & Scroll Section math from Noomo's "The Power of Storytelling"
 * Matches CbdjwYMp.js (scrollSections aH, g(scrollTop), cam.glb & dev.glb 0..20s timelines)
 */

export interface Waypoint {
  progress: number;
  camPos: [number, number, number];
  camTarget: [number, number, number];
  phoenixPos: [number, number, number];
  phoenixRot: [number, number, number];
  bgColor: string;
  theme: 'light' | 'dark';
}

export interface ScrollSection {
  id: string;
  scrollLength: number; // in vh units
}

// Exact 20 scroll sections from CbdjwYMp.js aH(isDesktop)
export const DESKTOP_SCROLL_SECTIONS: ScrollSection[] = [
  { id: '1', scrollLength: 100 },
  { id: '2', scrollLength: 150 },
  { id: '3', scrollLength: 300 },
  { id: '4', scrollLength: 300 },
  { id: '5', scrollLength: 200 },
  { id: '6', scrollLength: 300 },
  { id: '7', scrollLength: 500 },
  { id: '8', scrollLength: 200 },
  { id: '9', scrollLength: 80 },
  { id: '10', scrollLength: 80 },
  { id: '11', scrollLength: 170 },
  { id: '12', scrollLength: 190 },
  { id: '13', scrollLength: 280 },
  { id: '14', scrollLength: 50 },
  { id: '15', scrollLength: 50 },
  { id: '16', scrollLength: 100 },
  { id: '17', scrollLength: 140 },
  { id: '18', scrollLength: 1100 },
  { id: '19', scrollLength: 250 },
  { id: '20', scrollLength: 280 },
];

export const MOBILE_SCROLL_SECTIONS: ScrollSection[] = [
  { id: '1', scrollLength: 50 },
  { id: '2', scrollLength: 75 },
  { id: '3', scrollLength: 150 },
  { id: '4', scrollLength: 150 },
  { id: '5', scrollLength: 100 },
  { id: '6', scrollLength: 150 },
  { id: '7', scrollLength: 250 },
  { id: '8', scrollLength: 100 },
  { id: '9', scrollLength: 40 },
  { id: '10', scrollLength: 40 },
  { id: '11', scrollLength: 170 },
  { id: '12', scrollLength: 190 },
  { id: '13', scrollLength: 280 },
  { id: '14', scrollLength: 50 },
  { id: '15', scrollLength: 50 },
  { id: '16', scrollLength: 100 },
  { id: '17', scrollLength: 140 },
  { id: '18', scrollLength: 560 },
  { id: '19', scrollLength: 200 },
  { id: '20', scrollLength: 280 },
];

export const TOTAL_DESKTOP_VH = DESKTOP_SCROLL_SECTIONS.reduce(
  (sum, s) => sum + s.scrollLength,
  0
); // 4820 vh

export const TOTAL_MOBILE_VH = MOBILE_SCROLL_SECTIONS.reduce(
  (sum, s) => sum + s.scrollLength,
  0
); // 3130 vh

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1), 0, 1);
  return t * t * (3 - 2 * t);
}

export function lerpVec3(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    lerp(a[0], b[0], t),
    lerp(a[1], b[1], t),
    lerp(a[2], b[2], t),
  ];
}

/**
 * Cumulative vh helper e(k) from FZFS71Nt.js:
 * Sums scrollLength for sections 0..k inclusive.
 */
export function getCumulativeVh(sectionIndex: number, isMobile = false): number {
  const sections = isMobile ? MOBILE_SCROLL_SECTIONS : DESKTOP_SCROLL_SECTIONS;
  let sum = 0;
  for (let i = 0; i <= sectionIndex && i < sections.length; i++) {
    sum += sections[i].scrollLength;
  }
  return sum;
}

/**
 * Exact g(scrollTop) mapping from CbdjwYMp.js:
 * Maps normalized scroll progress [0, 1] across the 20 weighted scroll sections
 * to the Blender timeline evaluation time [0, 20] seconds used by cam.glb and dev.glb.
 */
export function scrollProgressToTimelineSeconds(
  scrollProgress: number,
  isMobile = false
): number {
  const sections = isMobile ? MOBILE_SCROLL_SECTIONS : DESKTOP_SCROLL_SECTIONS;
  const totalVh = isMobile ? TOTAL_MOBILE_VH : TOTAL_DESKTOP_VH;
  const currentVh = clamp(scrollProgress, 0, 1) * totalVh;

  let accVh = 0;
  for (let i = 0; i < sections.length; i++) {
    const len = sections[i].scrollLength;
    const startVh = accVh;
    const endVh = accVh + len;
    if (currentVh >= startVh && currentVh <= endVh) {
      const k = len > 0 ? (currentVh - startVh) / len : 0;
      const val = i + 1 + k;
      return clamp(val, 1, sections.length + 1) - 1;
    }
    accVh += len;
  }
  return sections.length;
}

/**
 * Converts a 0..255 RGB tuple to a CSS hex color string.
 */
export function rgb255ToHex(rgb: [number, number, number]): string {
  const toHex = (n: number) =>
    clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`;
}

function interpolateTrackVec3(
  keyframes: Array<{ t: number; v: [number, number, number] }>,
  time: number
): [number, number, number] {
  if (time <= keyframes[0].t) return [...keyframes[0].v];
  if (time >= keyframes[keyframes.length - 1].t) {
    return [...keyframes[keyframes.length - 1].v];
  }
  for (let i = 0; i < keyframes.length - 1; i++) {
    const k0 = keyframes[i];
    const k1 = keyframes[i + 1];
    if (time >= k0.t && time <= k1.t) {
      const u = (time - k0.t) / (k1.t - k0.t || 1);
      return lerpVec3(k0.v, k1.v, u);
    }
  }
  return [...keyframes[keyframes.length - 1].v];
}

// Exact keyframe tracks extracted from /public/timelines/dev.glb
const GLASS_COLOR_KEYS: Array<{ t: number; v: [number, number, number] }> = [
  { t: 0.0, v: [212, 234, 255] },
  { t: 0.92, v: [207.78, 215.44, 222.09] },
  { t: 3.67, v: [209.33, 210.96, 211.85] },
  { t: 3.92, v: [215.33, 208.3, 201.19] },
  { t: 5.17, v: [218.89, 211.48, 204.07] },
  { t: 5.92, v: [254.23, 254.08, 253.92] },
  { t: 6.67, v: [248, 234, 244] },
  { t: 7.5, v: [255, 195, 222] },
  { t: 10.5, v: [191, 211, 255] },
  { t: 12.0, v: [255, 255, 255] },
  { t: 20.0, v: [255, 255, 255] },
];

const GLASS_PEAKS_COLOR_KEYS: Array<{ t: number; v: [number, number, number] }> = [
  { t: 0.0, v: [253, 208, 221] },
  { t: 0.75, v: [208.48, 230.56, 252.66] },
  { t: 3.63, v: [206.09, 210.75, 232.5] },
  { t: 4.0, v: [212, 204, 192] },
  { t: 5.75, v: [217.91, 235.22, 229.13] },
  { t: 6.63, v: [224.91, 225.81, 239.38] },
  { t: 7.33, v: [211.19, 226.7, 224.44] },
  { t: 10.21, v: [211.64, 232.89, 232.54] },
  { t: 11.96, v: [254.33, 254.72, 255] },
  { t: 18.83, v: [255, 238.97, 224.84] },
  { t: 19.21, v: [255, 196.79, 145.45] },
  { t: 19.58, v: [255, 151.95, 61.08] },
  { t: 20.0, v: [255, 128, 16] },
];

const GLASS_FRINGE_COLOR_KEYS: Array<{ t: number; v: [number, number, number] }> = [
  { t: 0.0, v: [243, 208, 242] },
  { t: 1.0, v: [219, 209, 249] },
  { t: 3.83, v: [228.63, 217.15, 212.7] },
  { t: 5.17, v: [233.7, 222.59, 204.07] },
  { t: 5.83, v: [253.3, 252.41, 250.93] },
  { t: 6.67, v: [255, 246, 243] },
  { t: 7.5, v: [230.56, 230.56, 230.56] },
  { t: 8.0, v: [255, 255, 255] },
  { t: 10.5, v: [179, 150, 255] },
  { t: 12.0, v: [255, 255, 255] },
  { t: 20.0, v: [254, 255, 253] },
];

export interface DevTimelineSample {
  time: number;
  envBackgroundRgb: [number, number, number];
  envBackgroundHex: string;
  envDarkness: number;
  theme: 'light' | 'dark';
  glassColorRgb: [number, number, number];
  peaksColorRgb: [number, number, number];
  fringeColorRgb: [number, number, number];
  animationId: number;
  isBurning: boolean;
  featherVisible: boolean;
  projectsVisible: boolean;
}

/**
 * Pure evaluator of /public/timelines/dev.glb at timeline time t in [0, 20].
 */
export function sampleDevTimelineState(time: number): DevTimelineSample {
  const t = clamp(time, 0, 20);
  // Env_darkness and Env_background transition smoothly between t=10.0 and t=11.0
  const envDarkness = smoothstep(10.0, 11.0, t);
  const envBackgroundRgb = lerpVec3([229, 222, 249], [6, 10, 23], envDarkness);
  const envBackgroundHex = rgb255ToHex(envBackgroundRgb);

  const glassColorRgb = interpolateTrackVec3(GLASS_COLOR_KEYS, t);
  const peaksColorRgb = interpolateTrackVec3(GLASS_PEAKS_COLOR_KEYS, t);
  const fringeColorRgb = interpolateTrackVec3(GLASS_FRINGE_COLOR_KEYS, t);

  // Phoenix_animationId in dev.glb:
  // t=0.00..0.67 -> 2 (Wing_CloseUp)
  // t=0.67..17.00 -> 0 (Idle_MainPose_flying)
  // t=17.00..20.00 -> 1 (Float_WingPulse)
  const animationId = t < 0.67 ? 2 : t < 17.0 ? 0 : 1;

  return {
    time: t,
    envBackgroundRgb,
    envBackgroundHex,
    envDarkness,
    theme: envDarkness >= 0.5 ? 'dark' : 'light',
    glassColorRgb,
    peaksColorRgb,
    fringeColorRgb,
    animationId,
    isBurning: t >= 18.85,
    featherVisible: t >= 11.0 && t < 19.0,
    projectsVisible: t >= 16.96 && t <= 18.25,
  };
}

export function getInterpolatedWaypoint(
  waypoints: Waypoint[],
  progress: number
): Waypoint {
  const p = clamp(progress, 0, 1);
  if (waypoints.length === 0) {
    throw new Error('Waypoints array cannot be empty');
  }
  if (p <= waypoints[0].progress) return waypoints[0];
  if (p >= waypoints[waypoints.length - 1].progress) return waypoints[waypoints.length - 1];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const w1 = waypoints[i];
    const w2 = waypoints[i + 1];
    if (p >= w1.progress && p <= w2.progress) {
      const segT = (p - w1.progress) / (w2.progress - w1.progress || 1);
      return {
        progress: p,
        camPos: lerpVec3(w1.camPos, w2.camPos, segT),
        camTarget: lerpVec3(w1.camTarget, w2.camTarget, segT),
        phoenixPos: lerpVec3(w1.phoenixPos, w2.phoenixPos, segT),
        phoenixRot: lerpVec3(w1.phoenixRot, w2.phoenixRot, segT),
        bgColor: segT < 0.5 ? w1.bgColor : w2.bgColor,
        theme: segT < 0.5 ? w1.theme : w2.theme,
      };
    }
  }

  return waypoints[waypoints.length - 1];
}

export const PHOENIX_PALETTES = [
  { name: 'Celestial Violet', body: '#e0c3fc', emissive: '#8ec5fc', light: '#d4bbfb' },
  { name: 'Solar Amber', body: '#ffeaa7', emissive: '#ff7675', light: '#fdcb6e' },
  { name: 'Ethereal Azure', body: '#74b9ff', emissive: '#a29bfe', light: '#81ecec' },
  { name: 'Rose Quartz', body: '#fab1a0', emissive: '#e84393', light: '#fd79a8' },
  { name: 'Emerald Mirage', body: '#55efc4', emissive: '#00cec9', light: '#81ecec' },
];

export function getNextPalette(currentIndex: number): number {
  return (currentIndex + 1) % PHOENIX_PALETTES.length;
}
