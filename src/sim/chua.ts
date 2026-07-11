export type ChuaState = {
  x: number
  y: number
  z: number
}

export type ChuaParams = {
  alpha: number
  beta: number
  m0: number
  m1: number
  dt: number
}

export type TrajectoryPoint = ChuaState & {
  t: number
}

export const DEFAULT_PARAMS: ChuaParams = {
  alpha: 15.6,
  beta: 28,
  m0: -1.143,
  m1: -0.714,
  dt: 0.006,
}

export const PRESETS = {
  classic: {
    label: '经典双涡卷',
    description: '两个不稳定平衡点之间持续跃迁',
    params: DEFAULT_PARAMS,
    seed: { x: 0.7, y: 0, z: 0 },
  },
  spiral: {
    label: '螺旋吸引子',
    description: '轨迹围绕单侧区域形成致密螺旋',
    params: { ...DEFAULT_PARAMS, alpha: 9, beta: 14.286, m0: -1.143, m1: -0.714 },
    seed: { x: 0.4, y: 0, z: 0 },
  },
  periodic: {
    label: '周期轨道',
    description: '参数移出混沌区后收敛到稳定周期',
    params: { ...DEFAULT_PARAMS, alpha: 10, beta: 14.87, m0: -1.2, m1: -0.7 },
    seed: { x: 0.3, y: 0, z: 0 },
  },
} as const

export function chuaDiode(x: number, m0: number, m1: number) {
  return m1 * x + 0.5 * (m0 - m1) * (Math.abs(x + 1) - Math.abs(x - 1))
}

export function derivative(state: ChuaState, params: ChuaParams): ChuaState {
  const { x, y, z } = state
  return {
    x: params.alpha * (y - x - chuaDiode(x, params.m0, params.m1)),
    y: x - y + z,
    z: -params.beta * y,
  }
}

export function rk4Step(state: ChuaState, params: ChuaParams): ChuaState {
  const { dt } = params
  const k1 = derivative(state, params)
  const k2 = derivative(addScaled(state, k1, dt / 2), params)
  const k3 = derivative(addScaled(state, k2, dt / 2), params)
  const k4 = derivative(addScaled(state, k3, dt), params)

  return {
    x: state.x + (dt / 6) * (k1.x + 2 * k2.x + 2 * k3.x + k4.x),
    y: state.y + (dt / 6) * (k1.y + 2 * k2.y + 2 * k3.y + k4.y),
    z: state.z + (dt / 6) * (k1.z + 2 * k2.z + 2 * k3.z + k4.z),
  }
}

function addScaled(state: ChuaState, delta: ChuaState, scale: number): ChuaState {
  return {
    x: state.x + delta.x * scale,
    y: state.y + delta.y * scale,
    z: state.z + delta.z * scale,
  }
}

export function generateTrajectory(
  params: ChuaParams,
  seed: ChuaState,
  count = 14000,
  warmup = 1600,
): TrajectoryPoint[] {
  let state = { ...seed }
  const points: TrajectoryPoint[] = []

  for (let index = 0; index < count + warmup; index += 1) {
    state = rk4Step(state, params)
    if (!Number.isFinite(state.x + state.y + state.z)) return []
    if (index >= warmup) {
      points.push({ ...state, t: (index - warmup) * params.dt })
    }
  }

  return points
}
