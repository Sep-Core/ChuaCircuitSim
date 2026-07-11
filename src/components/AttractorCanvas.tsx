import { useEffect, useRef } from 'react'
import type { TrajectoryPoint } from '../sim/chua'

export type Projection = 'xy' | 'xz' | 'perspective'

type Props = {
  points: TrajectoryPoint[]
  projection: Projection
  playing: boolean
  speed: number
  resetToken: number
}

const COLORS = {
  grid: 'rgba(236, 225, 204, 0.08)',
  axis: 'rgba(236, 225, 204, 0.18)',
  warm: [247, 126, 70],
  cool: [114, 194, 176],
}

export function AttractorCanvas({ points, projection, playing, speed, resetToken }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(280)

  useEffect(() => {
    progressRef.current = 280
  }, [points, resetToken])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    let frame = 0
    let previousTime = performance.now()

    const render = (now: number) => {
      const rect = canvas.getBoundingClientRect()
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.max(1, Math.round(rect.width * pixelRatio))
      const height = Math.max(1, Math.round(rect.height * pixelRatio))

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      if (playing) {
        const elapsed = Math.min(now - previousTime, 32)
        progressRef.current = Math.min(points.length, progressRef.current + elapsed * speed * 0.24)
      }
      previousTime = now

      drawScene(context, rect.width, rect.height, points, Math.floor(progressRef.current), projection)
      frame = requestAnimationFrame(render)
    }

    frame = requestAnimationFrame(render)
    return () => cancelAnimationFrame(frame)
  }, [playing, points, projection, speed])

  return <canvas ref={canvasRef} className="attractor-canvas" aria-label="蔡氏电路相空间轨迹" />
}

function drawScene(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  points: TrajectoryPoint[],
  visibleCount: number,
  projection: Projection,
) {
  context.clearRect(0, 0, width, height)
  drawGrid(context, width, height)
  if (points.length < 2) return

  const padding = Math.min(width, height) * 0.08
  const projected = points.slice(0, visibleCount).map((point) => project(point, projection))
  const extent = projected.reduce(
    (result, point) => ({
      minX: Math.min(result.minX, point[0]),
      maxX: Math.max(result.maxX, point[0]),
      minY: Math.min(result.minY, point[1]),
      maxY: Math.max(result.maxY, point[1]),
    }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
  )
  const scale = Math.min(
    (width - padding * 2) / Math.max(0.1, extent.maxX - extent.minX),
    (height - padding * 2) / Math.max(0.1, extent.maxY - extent.minY),
  )
  const centerX = (extent.minX + extent.maxX) / 2
  const centerY = (extent.minY + extent.maxY) / 2

  context.lineWidth = Math.max(0.7, Math.min(1.25, width / 600))
  context.lineJoin = 'round'
  context.lineCap = 'round'

  const chunkSize = 220
  for (let start = 1; start < projected.length; start += chunkSize) {
    const end = Math.min(projected.length, start + chunkSize)
    const ratio = start / Math.max(1, projected.length)
    const color = mixColor(COLORS.cool, COLORS.warm, ratio)
    context.strokeStyle = `rgba(${color.join(',')},${0.3 + ratio * 0.6})`
    context.beginPath()
    const first = projected[start - 1]
    context.moveTo(width / 2 + (first[0] - centerX) * scale, height / 2 - (first[1] - centerY) * scale)
    for (let index = start; index < end; index += 1) {
      const point = projected[index]
      context.lineTo(width / 2 + (point[0] - centerX) * scale, height / 2 - (point[1] - centerY) * scale)
    }
    context.stroke()
  }

  const last = projected.at(-1)
  if (last) {
    const x = width / 2 + (last[0] - centerX) * scale
    const y = height / 2 - (last[1] - centerY) * scale
    context.fillStyle = '#f7c66e'
    context.shadowColor = '#f7c66e'
    context.shadowBlur = 12
    context.beginPath()
    context.arc(x, y, 3.5, 0, Math.PI * 2)
    context.fill()
    context.shadowBlur = 0
  }
}

function project(point: TrajectoryPoint, projection: Projection): [number, number] {
  if (projection === 'xy') return [point.x, point.y]
  if (projection === 'xz') return [point.x, point.z]
  return [point.x + point.z * 0.17, point.y * 1.8 - point.z * 0.22]
}

function drawGrid(context: CanvasRenderingContext2D, width: number, height: number) {
  context.strokeStyle = COLORS.grid
  context.lineWidth = 1
  const step = Math.max(36, Math.round(width / 12))
  context.beginPath()
  for (let x = width / 2 % step; x < width; x += step) {
    context.moveTo(x, 0)
    context.lineTo(x, height)
  }
  for (let y = height / 2 % step; y < height; y += step) {
    context.moveTo(0, y)
    context.lineTo(width, y)
  }
  context.stroke()

  context.strokeStyle = COLORS.axis
  context.beginPath()
  context.moveTo(width / 2, 0)
  context.lineTo(width / 2, height)
  context.moveTo(0, height / 2)
  context.lineTo(width, height / 2)
  context.stroke()
}

function mixColor(from: number[], to: number[], amount: number) {
  return from.map((value, index) => Math.round(value + (to[index] - value) * amount))
}
