import { describe, expect, it } from 'vitest'
import {
  DEFAULT_PARAMS,
  chuaDiode,
  derivative,
  generateTrajectory,
  rk4Step,
} from './chua'

describe('Chua circuit model', () => {
  it('keeps the piecewise-linear diode function continuous at breakpoints', () => {
    const epsilon = 1e-8
    const left = chuaDiode(1 - epsilon, DEFAULT_PARAMS.m0, DEFAULT_PARAMS.m1)
    const right = chuaDiode(1 + epsilon, DEFAULT_PARAMS.m0, DEFAULT_PARAMS.m1)

    expect(Math.abs(left - right)).toBeLessThan(1e-6)
    expect(chuaDiode(-1, DEFAULT_PARAMS.m0, DEFAULT_PARAMS.m1)).toBeCloseTo(
      -chuaDiode(1, DEFAULT_PARAMS.m0, DEFAULT_PARAMS.m1),
      12,
    )
  })

  it('has an equilibrium at the origin', () => {
    expect(derivative({ x: 0, y: 0, z: 0 }, DEFAULT_PARAMS)).toEqual({ x: 0, y: 0, z: -0 })
  })

  it('advances a finite state with fourth-order integration', () => {
    const next = rk4Step({ x: 0.7, y: 0, z: 0 }, DEFAULT_PARAMS)

    expect(next.x).toBeGreaterThan(0.7)
    expect(next.x).toBeLessThan(0.72)
    expect(Object.values(next).every(Number.isFinite)).toBe(true)
  })

  it('produces a bounded trajectory that visits both scrolls', () => {
    const trajectory = generateTrajectory(DEFAULT_PARAMS, { x: 0.7, y: 0, z: 0 }, 8000, 1200)
    const xValues = trajectory.map((point) => point.x)

    expect(trajectory).toHaveLength(8000)
    expect(Math.min(...xValues)).toBeLessThan(-1)
    expect(Math.max(...xValues)).toBeGreaterThan(1)
    expect(Math.max(...xValues.map(Math.abs))).toBeLessThan(4)
  })

  it('amplifies a tiny initial perturbation over time', () => {
    const first = generateTrajectory(DEFAULT_PARAMS, { x: 0.7, y: 0, z: 0 }, 5000, 0)
    const second = generateTrajectory(DEFAULT_PARAMS, { x: 0.700001, y: 0, z: 0 }, 5000, 0)
    const initialDistance = Math.abs(first[0].x - second[0].x)
    const finalDistance = Math.abs(first.at(-1)!.x - second.at(-1)!.x)

    expect(finalDistance).toBeGreaterThan(initialDistance * 100)
  })
})
