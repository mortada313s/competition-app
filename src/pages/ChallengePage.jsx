import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'

const STATES = {
  IDLE: 'idle',
  RUNNING: 'running',
  WIN: 'win',
  LOSE: 'lose',
  CHALLENGE2: 'challenge2',
  RUNNING2: 'running2',
  WIN2: 'win2',
  LOSE2: 'lose2',
}

const defaultConfig = {
  target1: 7,
  target2: 4,
  speed1: 100,
  speed2: 80,
  max1: 10,
  max2: 10,
  prize1: 'آيفون 15 برو',
  prizeA: 'بطاقة شحن 50$',
  prizeB: 'قسيمة خصم 20%',
  prizeAWeight: 70,
}

function getConfig() {
  const saved = localStorage.getItem('competition_config')
  return saved ? JSON.parse(saved) : defaultConfig
}

function pickPrize(cfg) {
  const rand = Math.random() * 100
  return rand <= cfg.prizeAWeight ? cfg.prizeA : cfg.prizeB
}

function saveResult(name, token, prize) {
  const prev = localStorage.getItem('competition_results')
  const results = prev ? JSON.parse(prev) : []
  results.push({ name, token, prize, timestamp: Date.now() })
  localStorage.setItem('competition_results', JSON.stringify(results))
}

export default function ChallengePage() {
  const { token } = useParams()
  const [state, setState] = useState(STATES.IDLE)
  const [count, setCount] = useState(0)
  const [prize, setPrize] = useState(null)
  const [name, setName] = useState('')
  const [cfg, setCfg] = useState(defaultConfig)
  const intervalRef = useRef(null)

  useEffect(() => {
    const config = getConfig()
    setCfg(config)
    const results = localStorage.getItem('competition_results')
    const all = results ? JSON.parse(results) : []
    const found = all.find(r => r.token === token)
    if (found) setName(found.name)
  }, [token])

  function startCounter(challengeNum) {
    setCount(0)
    setState(challengeNum === 1 ? STATES.RUNNING : STATES.RUNNING2)
  }

  useEffect(() => {
    if (state === STATES.RUNNING) {
      intervalRef.current = setInterval(() => {
        setCount(prev => {
          const next = prev + 1
          if (next > cfg.max1) { clearInterval(intervalRef.current); return prev }
          return next
        })
      }, cfg.speed1)
    } else if (state === STATES.RUNNING2) {
      intervalRef.current = setInterval(() => {
        setCount(prev => {
          const next = prev + 1
          if (next > cfg.max2) { clearInterval(intervalRef.current); return prev }
          return next
        })
      }, cfg.speed2)
    }
    return () => clearInterval(intervalRef.current)
  }, [state, cfg])

  function handleStop() {
    clearInterval(intervalRef.current)
    const config = getConfig()
    if (state === STATES.RUNNING) {
      if (count === config.target1) {
        setPrize(config.prize1)
        setState(STATES.WIN)
        saveResult(name || token, token, config.prize1)
      } else {
        setState(STATES.LOSE)
      }
    } else if (state === STATES.RUNNING2) {
      if (count === config.target2) {
        const won = pickPrize(config)
        setPrize(won)
        setState(STATES.WIN2)
        saveResult(name || token, token, won)
      } else {
        setState(STATES.LOSE2)
        saveResult(name || token, token, null)
      }
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'var(--bg)'
    }}>

      {state === STATES.IDLE && (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--accent)',
            letterSpacing: '4px',
            marginBottom: '1rem'
          }}>CHALLENGE 01</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>التحدي الأول</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
            أوقف العداد على الرقم الصحيح للفوز
          </p>
          <button className="btn-primary" style={{ maxWidth: 280 }} onClick={() => startCounter(1)}>
            ابدأ التحدي
          </button>
        </div>
      )}

      {(state === STATES.RUNNING || state === STATES.RUNNING2) && (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: state === STATES.RUNNING ? 'var(--accent)' : 'var(--accent2)',
            letterSpacing: '4px',
            marginBottom: '1.5rem'
          }}>
            {state === STATES.RUNNING ? 'CHALLENGE 01' : 'CHALLENGE 02'}
          </div>
          <div style={{
            fontSize: '9rem',
            fontWeight: 900,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text)',
            lineHeight: 1,
            marginBottom: '2.5rem',
            minWidth: 220,
            textAlign: 'center'
          }}>
            {count}
          </div>
          <button
            className="btn-primary"
            style={{
              maxWidth: 280,
              fontSize: '1.3rem',
              padding: '20px 32px',
              background: state === STATES.RUNNING ? 'var(--accent)' : 'var(--accent2)'
            }}
            onClick={handleStop}
          >
            أوقف!
          </button>
        </div>
      )}

      {state === STATES.WIN && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏆</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent)', marginBottom: '0.5rem' }}>
            مبروك!
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>لقد فزت بـ</p>
          <div className="card" style={{ marginBottom: '2rem', minWidth: 260 }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent)' }}>{prize}</div>
          </div>
        </div>
      )}

      {state === STATES.LOSE && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😅</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>حظ أوفر!</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            لديك فرصة ثانية في التحدي القادم
          </p>
          <button className="btn-primary" style={{ maxWidth: 280 }} onClick={() => setState(STATES.CHALLENGE2)}>
            التحدي الثاني
          </button>
        </div>
      )}

      {state === STATES.CHALLENGE2 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--accent2)',
            letterSpacing: '4px',
            marginBottom: '1rem'
          }}>CHALLENGE 02</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>التحدي الثاني</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
            فرصتك الأخيرة — أوقف العداد على الرقم الصحيح
          </p>
          <button
            className="btn-primary"
            style={{ maxWidth: 280, background: 'var(--accent2)' }}
            onClick={() => startCounter(2)}
          >
            ابدأ التحدي الثاني
          </button>
        </div>
      )}

      {state === STATES.WIN2 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent)', marginBottom: '0.5rem' }}>
            مبروك!
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>لقد فزت بـ</p>
          <div className="card" style={{ marginBottom: '2rem', minWidth: 260 }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent)' }}>{prize}</div>
          </div>
        </div>
      )}

      {state === STATES.LOSE2 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💪</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>
            للأسف لم تفز هذه المرة
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>شكراً على مشاركتك</p>
        </div>
      )}

    </div>
  )
}
