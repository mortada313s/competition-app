import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { apiGetDB, apiSaveResult, apiCheckToken } from '../utils/api'

const STATES = {
  IDLE: 'idle', RUNNING: 'running', WIN: 'win', LOSE: 'lose',
  CHALLENGE2: 'challenge2', RUNNING2: 'running2', WIN2: 'win2', LOSE2: 'lose2',
  USED: 'used', INVALID: 'invalid', LOADING: 'loading',
}

const defaultConfig = {
  target1: 7, target2: 4, speed1: 100, speed2: 80,
  max1: 10, max2: 10, prize1: 'جائزة أولى',
  prizeA: 'جائزة أ', prizeB: 'جائزة ب', prizeAWeight: 70,
}

const defaultBranding = {
  companyName: 'شركتنا السياحية',
  welcome: 'مرحباً بك! نتمنى لك تجربة ممتعة معنا.',
  logoUrl: null,
}

function pickPrize(cfg) {
  return Math.random() * 100 <= cfg.prizeAWeight ? cfg.prizeA : cfg.prizeB
}

// Clock face component
function ClockFace({ value, max, color, size = 220 }) {
  const radius = (size / 2) - 20
  const circumference = 2 * Math.PI * radius
  const progress = value / max
  const dashOffset = circumference * (1 - progress)
  const angle = progress * 360 - 90
  const rad = (angle * Math.PI) / 180
  const dotX = size/2 + radius * Math.cos(rad)
  const dotY = size/2 + radius * Math.sin(rad)

  // Tick marks
  const ticks = []
  for (let i = 0; i <= max; i++) {
    const a = (i / max) * 360 - 90
    const r = (a * Math.PI) / 180
    const isMajor = i % 5 === 0
    const inner = radius - (isMajor ? 14 : 8)
    const outer = radius - 2
    ticks.push({
      x1: size/2 + inner * Math.cos(r), y1: size/2 + inner * Math.sin(r),
      x2: size/2 + outer * Math.cos(r), y2: size/2 + outer * Math.sin(r),
      major: isMajor, num: i
    })
  }

  return (
    <svg width={size} height={size} style={{ filter: `drop-shadow(0 0 20px ${color}66)` }}>
      {/* Background circle */}
      <circle cx={size/2} cy={size/2} r={radius + 18} fill="rgba(5,15,35,0.9)" stroke="rgba(100,160,255,0.1)" strokeWidth="1"/>

      {/* Track */}
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>

      {/* Progress arc */}
      <circle
        cx={size/2} cy={size/2} r={radius}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 0.1s linear', filter: `drop-shadow(0 0 8px ${color})` }}
      />

      {/* Tick marks */}
      {ticks.map((t, i) => (
        <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke={t.major ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)'}
          strokeWidth={t.major ? 2 : 1}
        />
      ))}

      {/* Moving dot */}
      <circle cx={dotX} cy={dotY} r={6} fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }}/>

      {/* Center value */}
      <text x={size/2} y={size/2 - 10} textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily: 'Orbitron, monospace', fontSize: size * 0.22, fontWeight: 900, fill: color, filter: `drop-shadow(0 0 10px ${color})` }}>
        {value.toFixed(1)}
      </text>
      <text x={size/2} y={size/2 + size * 0.14} textAnchor="middle"
        style={{ fontFamily: 'Tajawal, sans-serif', fontSize: size * 0.07, fill: 'rgba(255,255,255,0.4)' }}>
        ثانية
      </text>
    </svg>
  )
}

export default function ChallengePage() {
  const { token } = useParams()
  const [state, setState] = useState(STATES.LOADING)
  const [count, setCount] = useState(0)
  const [prize, setPrize] = useState(null)
  const [name, setName] = useState('')
  const [cfg, setCfg] = useState(defaultConfig)
  const [branding, setBranding] = useState(defaultBranding)
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)

  useEffect(() => {
    async function init() {
      const db = await apiGetDB()
      if (db.config) setCfg(db.config)
      if (db.branding) setBranding({ ...defaultBranding, ...db.branding })
      if (!db.participants || !db.participants[token]) { setState(STATES.INVALID); return }
      setName(db.participants[token].name)
      const check = await apiCheckToken(token)
      if (check.used) { setState(STATES.USED); return }
      setState(STATES.IDLE)
    }
    init()
  }, [token])

  function startCounter(n) {
    setCount(0)
    startTimeRef.current = Date.now()
    setState(n === 1 ? STATES.RUNNING : STATES.RUNNING2)
  }

  useEffect(() => {
    if (state === STATES.RUNNING || state === STATES.RUNNING2) {
      const speed = state === STATES.RUNNING ? cfg.speed1 : cfg.speed2
      const max   = state === STATES.RUNNING ? cfg.max1   : cfg.max2
      startTimeRef.current = Date.now()
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000
        if (elapsed >= max) {
          clearInterval(intervalRef.current)
          setCount(parseFloat(max.toFixed(1)))
        } else {
          setCount(parseFloat(elapsed.toFixed(1)))
        }
      }, 50)
    }
    return () => clearInterval(intervalRef.current)
  }, [state, cfg])

  async function handleStop() {
    clearInterval(intervalRef.current)
    const stopped = parseFloat(count.toFixed(1))
    const db = await apiGetDB()
    const c = db.config || defaultConfig

    if (state === STATES.RUNNING) {
      if (stopped === parseFloat(c.target1)) {
        setPrize(c.prize1); setState(STATES.WIN)
        await apiSaveResult(name||token, token, c.prize1, 1)
      } else setState(STATES.LOSE)
    } else if (state === STATES.RUNNING2) {
      if (stopped === parseFloat(c.target2)) {
        const w = pickPrize(c); setPrize(w); setState(STATES.WIN2)
        await apiSaveResult(name||token, token, w, 2)
      } else {
        setState(STATES.LOSE2)
        await apiSaveResult(name||token, token, null, 2)
      }
    }
  }

  const isC1 = state === STATES.RUNNING
  const counterColor = isC1 ? '#00d4ff' : '#f0b940'
  const currentMax = isC1 ? cfg.max1 : cfg.max2
  const currentTarget = isC1 ? cfg.target1 : cfg.target2

  const W = ({ children }) => (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', textAlign: 'center' }}>
      <div className="grid-bg" />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, var(--blue), var(--cyan), transparent)' }} />
      {/* Company header */}
      <div style={{ position: 'absolute', top: '1.5rem', left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
        {branding.logoUrl && <img src={branding.logoUrl} alt="logo" style={{ height: 36, objectFit: 'contain' }} />}
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: 2 }}>{branding.companyName}</span>
      </div>
      {children}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, var(--gold), var(--cyan), transparent)' }} />
    </div>
  )

  if (state === STATES.LOADING) return (
    <W><div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: 48, height: 48, border: '3px solid var(--border)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin3d 0.8s linear infinite' }} />
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: 3 }}>LOADING...</div>
    </div></W>
  )

  if (state === STATES.INVALID) return (
    <W><div className="animate-fadeUp" style={{ maxWidth: 380 }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
      <div className="tag" style={{ marginBottom: '1rem' }}>INVALID TOKEN</div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--red)', marginBottom: '0.75rem' }}>باركود غير صالح</h1>
      <p style={{ color: 'var(--text-muted)' }}>هذا الباركود غير مسجل في النظام</p>
    </div></W>
  )

  if (state === STATES.USED) return (
    <W><div className="animate-fadeUp" style={{ maxWidth: 380 }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
      <div className="tag" style={{ marginBottom: '1rem' }}>ALREADY USED</div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.75rem' }}>تم استخدام هذا الباركود</h1>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>مرحباً <b style={{ color: 'var(--gold)' }}>{name}</b>، لقد شاركت في المسابقة مسبقاً.</p>
    </div></W>
  )

  if (state === STATES.IDLE) return (
    <W><div className="animate-fadeUp" style={{ maxWidth: 460 }}>
      {/* Welcome message from company */}
      <div className="card-neon" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(26,108,240,0.05)' }}>
        <p style={{ color: 'var(--text)', lineHeight: 1.9, fontSize: '1rem' }}>{branding.welcome}</p>
      </div>
      <div className="animate-float" style={{ fontSize: '4.5rem', marginBottom: '1.25rem', filter: 'drop-shadow(0 0 30px rgba(240,185,64,0.5))' }}>🏆</div>
      <div className="tag tag-gold" style={{ marginBottom: '1rem' }}>CHALLENGE 01</div>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem', background: 'linear-gradient(135deg, var(--text) 0%, var(--cyan) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        التحدي الأول
      </h1>
      <p style={{ color: 'var(--gold)', fontWeight: 600, marginBottom: '0.5rem' }}>مرحباً {name} 👋</p>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.8 }}>
        أوقف الوقت عند <b style={{ color: 'var(--cyan)', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>{parseFloat(cfg.target1).toFixed(1)}</b> ثانية للفوز
      </p>
      <button className="btn-gold" style={{ maxWidth: 300, fontSize: '1.1rem', padding: '18px' }} onClick={() => startCounter(1)}>
        🚀 ابدأ التحدي الآن
      </button>
    </div></W>
  )

  if (state === STATES.RUNNING || state === STATES.RUNNING2) return (
    <W><div style={{ maxWidth: 400 }}>
      <div className="tag" style={{ marginBottom: '1.5rem', color: isC1 ? 'var(--cyan)' : 'var(--gold)', borderColor: isC1 ? 'rgba(0,212,255,0.3)' : 'rgba(240,185,64,0.3)', background: isC1 ? 'rgba(0,212,255,0.08)' : 'rgba(240,185,64,0.08)' }}>
        {isC1 ? 'CHALLENGE 01' : 'CHALLENGE 02'}
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        أوقف الوقت عند <b style={{ color: counterColor, fontFamily: 'var(--font-display)' }}>{parseFloat(currentTarget).toFixed(1)}</b> ثانية
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <ClockFace value={count} max={currentMax} color={counterColor} size={240} />
      </div>

      <button onClick={handleStop} style={{
        maxWidth: 300, width: '100%', fontSize: '1.4rem', fontWeight: 900,
        fontFamily: 'var(--font-ar)', padding: '20px 40px', border: 'none', borderRadius: 14,
        cursor: 'pointer',
        background: isC1 ? 'linear-gradient(135deg, #006080 0%, #00b8d4 100%)' : 'linear-gradient(135deg, #a06800 0%, #f0b940 100%)',
        color: isC1 ? '#fff' : '#0a0800',
        boxShadow: isC1 ? '0 6px 30px rgba(0,184,212,0.5)' : '0 6px 30px rgba(240,185,64,0.5)',
        transition: 'all 0.15s', letterSpacing: 1,
      }}>
        ⏹ أوقف!
      </button>
    </div></W>
  )

  if (state === STATES.WIN || state === STATES.WIN2) return (
    <W><div className="animate-fadeUp" style={{ maxWidth: 420 }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'float 2s ease-in-out infinite', filter: 'drop-shadow(0 0 30px gold)' }}>🎊</div>
      <div className="tag tag-gold" style={{ marginBottom: '1rem' }}>WINNER!</div>
      <h1 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: '0.5rem', background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>مبروك!</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>أحسنت يا <b style={{ color: 'var(--gold)' }}>{name}</b> 🎉 لقد فزت بـ</p>
      <div style={{ background: 'linear-gradient(135deg, rgba(240,185,64,0.1), rgba(240,185,64,0.05))', border: '1px solid rgba(240,185,64,0.4)', borderRadius: 16, padding: '2rem', marginBottom: '1.5rem', animation: 'pulse-gold 2s ease-in-out infinite' }}>
        <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--gold)' }}>{prize}</div>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>تواصل مع المندوب للحصول على جائزتك</p>
    </div></W>
  )

  if (state === STATES.LOSE) return (
    <W><div className="animate-fadeUp" style={{ maxWidth: 420 }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😤</div>
      <div className="tag" style={{ marginBottom: '1rem' }}>TRY AGAIN</div>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem' }}>لم تصب الوقت!</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: 1.8 }}>
        لا تستسلم يا <b style={{ color: 'var(--cyan)' }}>{name}</b>!<br/>لديك فرصة ثانية في التحدي القادم
      </p>
      <button className="btn-primary" style={{ maxWidth: 280, padding: '16px' }} onClick={() => setState(STATES.CHALLENGE2)}>⚡ التحدي الثاني</button>
    </div></W>
  )

  if (state === STATES.CHALLENGE2) return (
    <W><div className="animate-fadeUp" style={{ maxWidth: 420 }}>
      <div className="animate-float" style={{ fontSize: '4.5rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 20px rgba(240,185,64,0.4))' }}>⚡</div>
      <div className="tag tag-gold" style={{ marginBottom: '1rem' }}>CHALLENGE 02</div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', background: 'linear-gradient(135deg, var(--gold), var(--gold2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>التحدي الثاني</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.8 }}>
        فرصتك الأخيرة يا <b style={{ color: 'var(--gold)' }}>{name}</b>!
      </p>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
        أوقف الوقت عند <b style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)' }}>{parseFloat(cfg.target2).toFixed(1)}</b> ثانية
      </p>
      <button className="btn-gold" style={{ maxWidth: 300, padding: '18px' }} onClick={() => startCounter(2)}>🎯 ابدأ التحدي الثاني</button>
    </div></W>
  )

  if (state === STATES.LOSE2) return (
    <W><div className="animate-fadeUp" style={{ maxWidth: 420 }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💪</div>
      <div className="tag" style={{ marginBottom: '1rem' }}>GAME OVER</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.75rem', color: 'var(--text-muted)' }}>للأسف لم تفز هذه المرة</h1>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>شكراً على مشاركتك يا <b style={{ color: 'var(--cyan)' }}>{name}</b>!<br/><span style={{ fontSize: '0.9rem' }}>الحظ معك في المرة القادمة</span></p>
    </div></W>
  )

  return null
}
