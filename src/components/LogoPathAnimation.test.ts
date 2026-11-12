import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { LOGO_PATH_A, LOGO_PATH_M } from './LogoPathAnimation';

describe('LogoPathAnimation Path Data Integrity', () => {
  test('LOGO_PATH_A is a valid, closed SVG path', () => {
    assert.ok(typeof LOGO_PATH_A === 'string');
    assert.ok(LOGO_PATH_A.length > 500, 'Path A should contain complete cubic bezier data');
    assert.ok(LOGO_PATH_A.trim().startsWith('M'), 'Path A should begin with MoveTo command');
    assert.ok(LOGO_PATH_A.trim().endsWith('Z'), 'Path A should be closed with Z command');
  });

  test('LOGO_PATH_M is a valid, closed SVG path', () => {
    assert.ok(typeof LOGO_PATH_M === 'string');
    assert.ok(LOGO_PATH_M.length > 500, 'Path M should contain complete cubic bezier data');
    assert.ok(LOGO_PATH_M.trim().startsWith('M'), 'Path M should begin with MoveTo command');
    assert.ok(LOGO_PATH_M.trim().endsWith('Z'), 'Path M should be closed with Z command');
  });

  test('Both paths fit within the 1369x526 viewBox bounds', () => {
    // Extract numeric coordinates from the paths
    const extractCoordinates = (d: string) => {
      const numbers = d.match(/-?\d+(\.\d+)?/g);
      return numbers ? numbers.map(Number) : [];
    };

    const numsA = extractCoordinates(LOGO_PATH_A);
    const numsM = extractCoordinates(LOGO_PATH_M);

    assert.ok(numsA.length > 50);
    assert.ok(numsM.length > 50);

    // Verify all points remain within reasonable viewBox bounds (with margin)
    for (let i = 0; i < numsA.length; i += 2) {
      const x = numsA[i];
      const y = numsA[i + 1];
      if (x !== undefined && y !== undefined) {
        assert.ok(x >= -50 && x <= 1400, `X coordinate out of bounds: ${x}`);
        assert.ok(y >= -50 && y <= 550, `Y coordinate out of bounds: ${y}`);
      }
    }

    for (let i = 0; i < numsM.length; i += 2) {
      const x = numsM[i];
      const y = numsM[i + 1];
      if (x !== undefined && y !== undefined) {
        assert.ok(x >= -50 && x <= 1400, `X coordinate out of bounds: ${x}`);
        assert.ok(y >= -50 && y <= 550, `Y coordinate out of bounds: ${y}`);
      }
    }
  });
});
