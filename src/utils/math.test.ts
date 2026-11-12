import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  clamp,
  lerp,
  lerpVec3,
  getInterpolatedWaypoint,
  getNextPalette,
  PHOENIX_PALETTES,
  Waypoint,
  scrollProgressToTimelineSeconds,
  sampleDevTimelineState,
  TOTAL_DESKTOP_VH,
  getCumulativeVh,
} from './math.ts';

const MOCK_WAYPOINTS: Waypoint[] = [
  {
    progress: 0,
    camPos: [0, 0, 10],
    camTarget: [0, 0, 0],
    phoenixPos: [0, 0, 0],
    phoenixRot: [0, 0, 0],
    bgColor: '#e5def9',
    theme: 'light',
  },
  {
    progress: 0.5,
    camPos: [0, 5, 5],
    camTarget: [0, 1, 0],
    phoenixPos: [2, 2, 0],
    phoenixRot: [0, 1, 0],
    bgColor: '#060a17',
    theme: 'dark',
  },
  {
    progress: 1,
    camPos: [0, 0, 8],
    camTarget: [0, 0, 0],
    phoenixPos: [0, -1, 0],
    phoenixRot: [0, 2, 0],
    bgColor: '#060a17',
    theme: 'dark',
  },
];

describe('Math & 3D Flight Path Utilities', () => {
  it('clamps numbers within bounds', () => {
    assert.equal(clamp(-5, 0, 1), 0);
    assert.equal(clamp(0.4, 0, 1), 0.4);
    assert.equal(clamp(2.5, 0, 1), 1);
  });

  it('linearly interpolates scalars and vectors', () => {
    assert.equal(lerp(0, 10, 0.5), 5);
    assert.deepEqual(lerpVec3([0, 0, 0], [10, 20, 30], 0.25), [2.5, 5, 7.5]);
  });

  it('interpolates waypoints accurately across scroll progress', () => {
    const start = getInterpolatedWaypoint(MOCK_WAYPOINTS, 0);
    assert.deepEqual(start.phoenixPos, [0, 0, 0]);
    assert.equal(start.theme, 'light');

    const quarter = getInterpolatedWaypoint(MOCK_WAYPOINTS, 0.25);
    assert.deepEqual(quarter.phoenixPos, [1, 1, 0]);
    assert.deepEqual(quarter.camPos, [0, 2.5, 7.5]);

    const end = getInterpolatedWaypoint(MOCK_WAYPOINTS, 1);
    assert.deepEqual(end.phoenixPos, [0, -1, 0]);
    assert.equal(end.theme, 'dark');
  });

  it('maps scroll progress [0..1] to Blender timeline seconds [0..20]', () => {
    assert.equal(TOTAL_DESKTOP_VH, 4820);
    assert.equal(scrollProgressToTimelineSeconds(0), 0);
    assert.equal(scrollProgressToTimelineSeconds(1), 20);

    // At end of section 10 (e(9) = 2210 vh), timeline time is exactly 10.0s
    const pAtSection10 = getCumulativeVh(9) / TOTAL_DESKTOP_VH;
    assert.ok(Math.abs(scrollProgressToTimelineSeconds(pAtSection10) - 10) < 1e-6);

    // At end of section 11 (e(10) = 2380 vh), timeline time is 11.0s
    const pAtSection11 = getCumulativeVh(10) / TOTAL_DESKTOP_VH;
    assert.ok(Math.abs(scrollProgressToTimelineSeconds(pAtSection11) - 11) < 1e-6);
  });

  it('evaluates dev.glb color and animation tracks accurately', () => {
    const startState = sampleDevTimelineState(0);
    assert.equal(startState.envBackgroundHex, '#e5def9');
    assert.equal(startState.theme, 'light');
    assert.equal(startState.animationId, 2); // Wing_CloseUp at hero start

    const flyState = sampleDevTimelineState(5);
    assert.equal(flyState.animationId, 0); // Idle_MainPose_flying
    assert.equal(flyState.theme, 'light');

    const darkTransition = sampleDevTimelineState(11.5);
    assert.equal(darkTransition.envBackgroundHex, '#060a17');
    assert.equal(darkTransition.theme, 'dark');
    assert.equal(darkTransition.featherVisible, true);

    const crystalState = sampleDevTimelineState(17.5);
    assert.equal(crystalState.projectsVisible, true);
    assert.equal(crystalState.animationId, 1); // Float_WingPulse

    const fireState = sampleDevTimelineState(19.6);
    assert.equal(fireState.isBurning, true);
    assert.equal(fireState.peaksColorRgb[0], 255);
  });

  it('cycles through Phoenix color palettes cleanly', () => {
    let idx = 0;
    for (let i = 0; i < PHOENIX_PALETTES.length; i++) {
      idx = getNextPalette(idx);
    }
    assert.equal(idx, 0);
  });
});
