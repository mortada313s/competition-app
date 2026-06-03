import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

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

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('competition_config')
    return saved ? JSON.parse(saved) : defaultConfig
  })
  const [results, setResults] = useState(() => {
    const saved = localStorage.getItem('competition_results')
    return saved ? JSON.parse(saved) : []
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth')
    if (!auth) navigate('/admin')
  }, [])

  function handleSave() {
    localStorage.setItem('competition_config', JSON.stringify(config))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleLogout() {
    localStorage.removeItem('admin_auth')
    navigate('/admin')
  }

  function clearResults() {
    localStorage.removeItem('competition_results')
    setResults([])
  }

  const wins = results.filter(r => r.prize).length
  const losses = results.filter(r => !r.prize).length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--accent)',
            letterSpacing: '4px',
            marginBottom: '0.25rem'
          }}>
            ADMIN PANEL
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>لوحة التحكم</h1>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: 'var(--surface2)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '10px 20px',
            fontSize: '0.9rem'
          }}
        >
          تسجيل الخروج
        </button>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {[
          { label: 'إجمالي المشاركين', value: results.length, color: 'var(--text)' },
          { label: 'الفائزون', value: wins, color: '#4caf80' },
          { label: 'الخاسرون', value: losses, color: '#e05a5a' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '1.25rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: s.color, fontFamily: 'var(--font-mono)' }}>
              {s.value}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* Config */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--accent)' }}>
            إعدادات المسابقة
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <div style={{
              background: 'var(--surface2)',
              borderRadius: 8,
              padding: '1rem',
              border: '1px solid var(--border)'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent)', marginBottom: '0.75rem', fontWeight: 700 }}>
                التحدي الأول
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    الرقم المطلوب (1-{config.max1})
                  </label>
                  <input className="input-field" type="number" min="1" max={config.max1}
                    value={config.target1}
                    onChange={e => setConfig({ ...config, target1: +e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    الحد الأقصى للعداد
                  </label>
                  <input className="input-field" type="number" min="5" max="99"
                    value={config.max1}
                    onChange={e => setConfig({ ...config, max1: +e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    سرعة العداد (ms)
                  </label>
                  <input className="input-field" type="number" min="50" max="500"
                    value={config.speed1}
                    onChange={e => setConfig({ ...config, speed1: +e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div style={{
              background: 'var(--surface2)',
              borderRadius: 8,
              padding: '1rem',
              border: '1px solid var(--border)'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent2)', marginBottom: '0.75rem', fontWeight: 700 }}>
                التحدي الثاني
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    الرقم المطلوب (1-{config.max2})
                  </label>
                  <input className="input-field" type="number" min="1" max={config.max2}
                    value={config.target2}
                    onChange={e => setConfig({ ...config, target2: +e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    الحد الأقصى للعداد
                  </label>
                  <input className="input-field" type="number" min="5" max="99"
                    value={config.max2}
                    onChange={e => setConfig({ ...config, max2: +e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    سرعة العداد (ms)
                  </label>
                  <input className="input-field" type="number" min="50" max="500"
                    value={config.speed2}
                    onChange={e => setConfig({ ...config, speed2: +e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div style={{
              background: 'var(--surface2)',
              borderRadius: 8,
              padding: '1rem',
              border: '1px solid var(--border)'
            }}>
              <div style={{ fontSize: '0.8rem', color: '#4caf80', marginBottom: '0.75rem', fontWeight: 700 }}>
                الجوائز
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    جائزة الفوز الأول
                  </label>
                  <input className="input-field" type="text"
                    value={config.prize1}
                    onChange={e => setConfig({ ...config, prize1: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                      جائزة أ
                    </label>
                    <input className="input-field" type="text"
                      value={config.prizeA}
                      onChange={e => setConfig({ ...config, prizeA: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                      جائزة ب
                    </label>
                    <input className="input-field" type="text"
                      value={config.prizeB}
                      onChange={e => setConfig({ ...config, prizeB: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    نسبة أرجحية جائزة أ: {config.prizeAWeight}% — جائزة ب: {100 - config.prizeAWeight}%
                  </label>
                  <input type="range" min="0" max="100"
                    value={config.prizeAWeight}
                    onChange={e => setConfig({ ...config, prizeAWeight: +e.target.value })}
                    style={{ width: '100%', accentColor: 'var(--accent)' }}
                  />
                </div>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleSave}
              style={{ background: saved ? '#4caf80' : 'var(--accent)' }}
            >
              {saved ? 'تم الحفظ ✓' : 'حفظ الإعدادات'}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>
              النتائج
            </h2>
            {results.length > 0 && (
              <button
                onClick={clearResults}
                style={{
                  background: 'transparent',
                  color: '#e05a5a',
                  border: '1px solid #5a2020',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: '0.8rem'
                }}
              >
                مسح الكل
              </button>
            )}
          </div>
          {results.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
              لا توجد نتائج بعد
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 400, overflowY: 'auto' }}>
              {[...results].reverse().map((r, i) => (
                <div key={i} style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{r.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {new Date(r.timestamp).toLocaleString('ar')}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: r.prize ? '#4caf80' : '#e05a5a',
                    background: r.prize ? '#0a2015' : '#2a1015',
                    border: r.prize ? '1px solid #1a5a30' : '1px solid #5a2020',
                    borderRadius: 6,
                    padding: '4px 10px',
                    textAlign: 'center'
                  }}>
                    {r.prize || 'خسارة'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
