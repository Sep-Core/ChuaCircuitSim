import { useMemo } from 'react'
import type { TrajectoryPoint } from '../sim/chua'

type Props = {
  points: TrajectoryPoint[]
}

const SERIES = [
  { key: 'x', label: 'VC₁', color: '#f77e46' },
  { key: 'y', label: 'VC₂', color: '#72c2b0' },
  { key: 'z', label: 'iL', color: '#f4c06a' },
] as const

export function Waveform({ points }: Props) {
  const sampled = useMemo(() => {
    const tail = points.slice(-2200)
    const stride = Math.max(1, Math.floor(tail.length / 360))
    return tail.filter((_, index) => index % stride === 0)
  }, [points])

  const paths = useMemo(
    () =>
      SERIES.map((series) => {
        const values = sampled.map((point) => point[series.key])
        const max = Math.max(0.01, ...values.map(Math.abs))
        const path = values
          .map((value, index) => {
            const x = (index / Math.max(1, values.length - 1)) * 100
            const y = 50 - (value / max) * 35
            return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
          })
          .join(' ')
        return { ...series, path }
      }),
    [sampled],
  )

  return (
    <div className="waveform">
      <div className="waveform-legend">
        {SERIES.map((series) => (
          <span key={series.key}>
            <i style={{ background: series.color }} />
            {series.label}
          </span>
        ))}
        <small>时间 →</small>
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="电压和电流波形">
        <line x1="0" y1="50" x2="100" y2="50" className="wave-axis" />
        {paths.map((series) => (
          <path key={series.key} d={series.path} stroke={series.color} className="wave-path" />
        ))}
      </svg>
    </div>
  )
}
