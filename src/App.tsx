import { useMemo, useState } from 'react'
import { AttractorCanvas, type Projection } from './components/AttractorCanvas'
import { CircuitDiagram } from './components/CircuitDiagram'
import { Waveform } from './components/Waveform'
import {
  DEFAULT_PARAMS,
  PRESETS,
  generateTrajectory,
  type ChuaParams,
  type ChuaState,
} from './sim/chua'
import './styles.css'

type PresetKey = keyof typeof PRESETS
type ParameterKey = keyof Pick<ChuaParams, 'alpha' | 'beta' | 'm0' | 'm1'>

const PARAMETER_CONFIG: Array<{
  key: ParameterKey
  symbol: string
  label: string
  min: number
  max: number
  step: number
}> = [
  { key: 'alpha', symbol: 'α', label: '非线性增益', min: 6, max: 22, step: 0.1 },
  { key: 'beta', symbol: 'β', label: '储能耦合', min: 10, max: 36, step: 0.1 },
  { key: 'm0', symbol: 'm₀', label: '内段斜率', min: -1.5, max: -0.8, step: 0.001 },
  { key: 'm1', symbol: 'm₁', label: '外段斜率', min: -1, max: -0.4, step: 0.001 },
]

export default function App() {
  const [params, setParams] = useState<ChuaParams>(DEFAULT_PARAMS)
  const [seed, setSeed] = useState<ChuaState>(PRESETS.classic.seed)
  const [activePreset, setActivePreset] = useState<PresetKey>('classic')
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [projection, setProjection] = useState<Projection>('perspective')
  const [resetToken, setResetToken] = useState(0)

  const points = useMemo(() => generateTrajectory(params, seed), [params, seed])
  const latest = points.at(-1) ?? seed
  const isStable = points.length > 10000 && Math.max(...points.slice(-100).map((point) => Math.abs(point.x))) < 10

  const updateParameter = (key: ParameterKey, value: number) => {
    setParams((current) => ({ ...current, [key]: value }))
    setActivePreset('classic')
    setResetToken((token) => token + 1)
  }

  const choosePreset = (key: PresetKey) => {
    const preset = PRESETS[key]
    setActivePreset(key)
    setParams({ ...preset.params })
    setSeed({ ...preset.seed })
    setPlaying(true)
    setResetToken((token) => token + 1)
  }

  const reset = () => {
    setParams({ ...PRESETS.classic.params })
    setSeed({ ...PRESETS.classic.seed })
    setActivePreset('classic')
    setPlaying(true)
    setResetToken((token) => token + 1)
  }

  const perturb = () => {
    setSeed((current) => ({
      x: current.x + (Math.random() - 0.5) * 0.002,
      y: current.y + (Math.random() - 0.5) * 0.002,
      z: current.z + (Math.random() - 0.5) * 0.002,
    }))
    setPlaying(true)
    setResetToken((token) => token + 1)
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="混沌实验室首页">
          <span className="brand-mark">χ</span>
          <span>混沌实验室</span>
        </a>
        <nav aria-label="页面导航">
          <a href="#simulator">模拟器</a>
          <a href="#principle">工作原理</a>
        </nav>
        <span className="header-badge">CHUA / 1983</span>
      </header>

      <section className="hero" id="top">
        <div className="hero-kicker"><span /> NONLINEAR DYNAMICS · 01</div>
        <h1>混沌并非随机，<br /><em>它是确定性的诗。</em></h1>
        <p>
          一个电感、两个电容与一段非线性负阻，就足以让严格的方程
          生长出永不重复的双涡卷轨迹。
        </p>
        <div className="hero-meta">
          <span><b>03</b> 状态变量</span>
          <span><b>01</b> 非线性元件</span>
          <span><b>∞</b> 非周期轨迹</span>
        </div>
      </section>

      <section className="simulator-section" id="simulator">
        <div className="section-heading">
          <div>
            <span className="eyebrow">LIVE SIMULATION</span>
            <h2>双涡卷吸引子</h2>
          </div>
          <p>拖动参数，观察确定性系统如何越过秩序的边界。</p>
        </div>

        <div className="simulator-shell">
          <aside className="control-panel">
            <div className="panel-title">
              <div>
                <span>控制台</span>
                <small>PARAMETERS</small>
              </div>
              <span className={`status ${playing ? 'active' : ''}`}>
                <i /> {playing ? '演化中' : '已暂停'}
              </span>
            </div>

            <div className="preset-grid" aria-label="模拟预设">
              {(Object.keys(PRESETS) as PresetKey[]).map((key) => (
                <button
                  key={key}
                  className={activePreset === key ? 'selected' : ''}
                  onClick={() => choosePreset(key)}
                  title={PRESETS[key].description}
                >
                  {PRESETS[key].label}
                </button>
              ))}
            </div>

            <div className="parameter-list">
              {PARAMETER_CONFIG.map((config) => (
                <label className="parameter" key={config.key}>
                  <span className="parameter-heading">
                    <span><b>{config.symbol}</b> {config.label}</span>
                    <output>{params[config.key].toFixed(config.step < 0.01 ? 3 : 1)}</output>
                  </span>
                  <input
                    type="range"
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    value={params[config.key]}
                    onChange={(event) => updateParameter(config.key, Number(event.target.value))}
                  />
                </label>
              ))}
            </div>

            <div className="speed-control">
              <span>演化速度</span>
              <div>
                {[0.5, 1, 2].map((value) => (
                  <button
                    key={value}
                    className={speed === value ? 'selected' : ''}
                    onClick={() => setSpeed(value)}
                  >
                    {value}×
                  </button>
                ))}
              </div>
            </div>

            <div className="primary-controls">
              <button className="play-button" onClick={() => setPlaying((value) => !value)}>
                <span>{playing ? 'Ⅱ' : '▶'}</span>
                {playing ? '暂停演化' : '继续演化'}
              </button>
              <button className="icon-button" onClick={reset} aria-label="重置参数" title="重置参数">↻</button>
            </div>
          </aside>

          <div className="visual-panel">
            <div className="visual-toolbar">
              <div className="projection-tabs" aria-label="投影视图">
                {([
                  ['perspective', '透视'],
                  ['xy', 'VC₁ / VC₂'],
                  ['xz', 'VC₁ / iL'],
                ] as Array<[Projection, string]>).map(([value, label]) => (
                  <button
                    key={value}
                    className={projection === value ? 'selected' : ''}
                    onClick={() => setProjection(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button className="perturb-button" onClick={perturb}>
                <span>✦</span> 施加 0.1% 扰动
              </button>
            </div>

            <div className="canvas-wrap">
              <AttractorCanvas
                points={points}
                projection={projection}
                playing={playing}
                speed={speed}
                resetToken={resetToken}
              />
              <div className="axis-label x-label">{projection === 'xz' ? 'VC₁ →' : 'VC₁ →'}</div>
              <div className="axis-label y-label">{projection === 'xz' ? 'iL →' : 'VC₂ →'}</div>
              <div className="canvas-caption">
                <span className="caption-number">14,000</span>
                <span>积分点 · RK4</span>
              </div>
            </div>

            <div className="visual-footer">
              <div className="live-values">
                <div><span>VC₁</span><b>{latest.x.toFixed(3)}</b></div>
                <div><span>VC₂</span><b>{latest.y.toFixed(3)}</b></div>
                <div><span>iL</span><b>{latest.z.toFixed(3)}</b></div>
              </div>
              <div className="health">
                <span className={isStable ? 'good' : 'warning'}>{isStable ? '数值稳定' : '参数发散'}</span>
                <small>Δt = {params.dt}s</small>
              </div>
            </div>
          </div>
        </div>

        <div className="wave-card">
          <div className="wave-copy">
            <span className="eyebrow">OSCILLOSCOPE</span>
            <h3>永不重复的波形</h3>
            <p>每一刻都由上一刻严格决定，却无法从局部预测漫长的未来。</p>
          </div>
          <Waveform points={points} />
        </div>
      </section>

      <section className="principle-section" id="principle">
        <div className="principle-copy">
          <span className="eyebrow">THE CIRCUIT</span>
          <h2>三个储能元件，<br />一个混沌世界。</h2>
          <p>
            L、C₁ 与 C₂ 构成三阶自治网络。非线性电阻 NR 在不同电压区间改变斜率，
            使系统时而吸收能量、时而注入能量，轨迹因而在两个不稳定平衡点之间跃迁。
          </p>
          <div className="equation">
            <span>f(x) = m₁x + ½(m₀−m₁)(|x+1|−|x−1|)</span>
          </div>
        </div>
        <div className="circuit-card">
          <div className="circuit-card-header">
            <span>蔡氏电路 · 标准拓扑</span>
            <small>CHUA'S CIRCUIT</small>
          </div>
          <CircuitDiagram />
        </div>
      </section>

      <section className="process-section">
        {[
          ['01', '起振', '通电瞬间，电路噪声提供微小的初始扰动。'],
          ['02', '选频', 'LC 网络在固有频率附近选择并放大振荡。'],
          ['03', '能量补充', '非线性负阻补偿电感、电容与线路损耗。'],
          ['04', '混沌稳态', '非线性限幅形成有界、非周期的双涡卷。'],
        ].map(([number, title, description]) => (
          <article key={number}>
            <span>{number}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </section>

      <footer>
        <div><span className="brand-mark">χ</span> 混沌实验室</div>
        <p>确定性方程，也能产生看似随机的丰富行为。</p>
        <a href="#top">回到顶部 ↑</a>
      </footer>
    </main>
  )
}
