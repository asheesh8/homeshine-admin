import { useState } from 'react'
import { TrendingUp, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { SERVICES, COMPETITORS } from '../../data/marketData'

const STORAGE_KEY = 'homeshine_market'

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch { return {} }
}

// ─── Helpers ──────────────────────────────────────────────────────────
function getPositioning(rate, _low, avg, _high) {
  const ratio = rate / avg
  if (ratio <= 0.93) return { label: 'Competitive', color: 'var(--teal-400)',  bg: 'rgba(20,184,166,0.12)',  desc: 'Below market avg' }
  if (ratio <= 1.08) return { label: 'At Market',   color: 'var(--yellow)',    bg: 'rgba(234,179,8,0.12)',   desc: 'Near market avg' }
  return               { label: 'Premium',       color: 'var(--blue)',      bg: 'rgba(59,130,246,0.12)',  desc: 'Above market avg' }
}

// Position within extended range [low*0.65 … high*1.35]
function barPercent(value, low, high) {
  const min = low * 0.65
  const max = high * 1.35
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
}

function fmt(n) {
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

// ─── ServiceCard ──────────────────────────────────────────────────────
function ServiceCard({ service, rate, notes, onRateChange, onNotesChange }) {
  const [expanded, setExpanded] = useState(false)

  const pos        = getPositioning(rate, service.marketLow, service.vtAvg, service.marketHigh)
  const lowPct     = barPercent(service.marketLow, service.marketLow, service.marketHigh)
  const highPct    = barPercent(service.marketHigh, service.marketLow, service.marketHigh)
  const avgPct     = barPercent(service.vtAvg, service.marketLow, service.marketHigh)
  const ratePct    = barPercent(rate, service.marketLow, service.marketHigh)
  const competitors = service.competitorIds.map(id => COMPETITORS.find(c => c.id === id)).filter(Boolean)

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
    }}>
      {/* Card header */}
      <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{service.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{service.description}</div>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            color: pos.color, background: pos.bg, whiteSpace: 'nowrap',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: pos.color, display: 'inline-block' }} />
            {pos.label}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 20px' }}>

        {/* Market range labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>VT Market Range</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {fmt(service.marketLow)} – {fmt(service.marketHigh)}
            {service.nationalNote && (
              <span style={{ marginLeft: 6, color: 'var(--teal-600)' }}>· {service.nationalNote}</span>
            )}
          </span>
        </div>

        {/* Bar track */}
        <div style={{ position: 'relative', height: 10, borderRadius: 6, background: 'var(--bg-raised)', marginBottom: 20 }}>

          {/* Filled market range */}
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${lowPct}%`, width: `${highPct - lowPct}%`,
            background: 'linear-gradient(90deg, rgba(20,184,166,0.25) 0%, rgba(234,179,8,0.3) 55%, rgba(59,130,246,0.3) 100%)',
            borderRadius: 6,
          }} />

          {/* VT Avg tick */}
          <div style={{
            position: 'absolute', top: -4, bottom: -4,
            left: `${avgPct}%`, transform: 'translateX(-50%)',
            width: 2, background: 'var(--yellow)', borderRadius: 2, opacity: 0.85,
          }} />

          {/* HomeSHINE dot */}
          <div style={{
            position: 'absolute', top: '50%', left: `${ratePct}%`,
            transform: 'translate(-50%, -50%)',
            width: 14, height: 14, borderRadius: '50%',
            background: pos.color,
            border: '2px solid var(--bg-surface)',
            boxShadow: `0 0 0 2px ${pos.color}55`,
            zIndex: 2,
          }} />

          {/* HomeSHINE label below dot */}
          <div style={{
            position: 'absolute', top: 16,
            left: `${ratePct}%`, transform: 'translateX(-50%)',
            fontSize: 10, fontWeight: 700, color: pos.color, whiteSpace: 'nowrap',
          }}>
            {fmt(rate)}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, marginTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 2, height: 10, background: 'var(--yellow)', borderRadius: 1 }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>VT avg {fmt(service.vtAvg)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: pos.color }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>HomeSHINE · {pos.desc}</span>
          </div>
        </div>

        {/* Stat boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Market Low', value: fmt(service.marketLow), muted: true },
            { label: 'VT Average', value: fmt(service.vtAvg),     muted: false },
            { label: 'Market High', value: fmt(service.marketHigh), muted: true },
            { label: 'HomeSHINE', value: fmt(rate), highlight: true, color: pos.color },
          ].map(s => (
            <div key={s.label} style={{
              background: s.highlight ? `${pos.color}18` : 'var(--bg-raised)',
              border: `1px solid ${s.highlight ? pos.color + '44' : 'var(--border)'}`,
              borderRadius: 8, padding: '8px 10px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {s.label}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: s.color || (s.muted ? 'var(--text-secondary)' : 'var(--text-primary)') }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* HomeSHINE rate input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            Your Rate:
          </label>
          <div style={{ position: 'relative', width: 120 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 13, pointerEvents: 'none' }}>$</span>
            <input
              type="number"
              min={0}
              step={5}
              value={rate}
              onChange={e => onRateChange(Number(e.target.value))}
              style={{
                width: '100%', paddingLeft: 22, paddingRight: 10, paddingTop: 7, paddingBottom: 7,
                background: 'var(--bg-raised)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: 13,
                fontWeight: 600,
              }}
            />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {rate < service.marketLow
              ? `${fmt(service.marketLow - rate)} below floor`
              : rate > service.marketHigh
              ? `${fmt(rate - service.marketHigh)} above ceiling`
              : `${Math.round(((rate - service.vtAvg) / service.vtAvg) * 100) > 0 ? '+' : ''}${Math.round(((rate - service.vtAvg) / service.vtAvg) * 100)}% vs avg`
            }
          </span>
        </div>

        {/* Competitors (expandable) */}
        <div>
          <button
            onClick={() => setExpanded(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, background: 'none',
              border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              fontSize: 12, fontWeight: 500, padding: 0, marginBottom: expanded ? 10 : 0,
            }}
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {competitors.length} local competitor{competitors.length !== 1 ? 's' : ''} in this service
          </button>
          {expanded && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {competitors.map(c => (
                <span key={c.id} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 9px', borderRadius: 20,
                  background: 'var(--bg-raised)', border: '1px solid var(--border)',
                  fontSize: 12, color: 'var(--text-secondary)',
                }}>
                  {c.name}
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>· {c.area}</span>
                  {c.url && (
                    <a href={c.url} target="_blank" rel="noopener noreferrer"
                      style={{ color: 'var(--teal-500)', lineHeight: 0 }}
                      title={c.url}
                    >
                      <ExternalLink size={11} />
                    </a>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <textarea
          placeholder="Add notes, seasonal pricing context, upsell strategy…"
          value={notes}
          onChange={e => onNotesChange(e.target.value)}
          rows={2}
          style={{
            width: '100%', background: 'var(--bg-raised)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)', fontSize: 12.5, padding: '8px 10px',
            resize: 'vertical', marginTop: 10,
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--teal-500)'; e.target.style.outline = 'none' }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
        />
      </div>
    </div>
  )
}

// ─── Summary bar ──────────────────────────────────────────────────────
function SummaryRow({ rates }) {
  const counts = SERVICES.reduce((acc, svc) => {
    const pos = getPositioning(rates[svc.id] ?? svc.defaultRate, svc.marketLow, svc.vtAvg, svc.marketHigh)
    acc[pos.label] = (acc[pos.label] || 0) + 1
    return acc
  }, {})

  const pills = [
    { label: 'Competitive', color: 'var(--teal-400)',  bg: 'rgba(20,184,166,0.12)'  },
    { label: 'At Market',   color: 'var(--yellow)',    bg: 'rgba(234,179,8,0.12)'   },
    { label: 'Premium',     color: 'var(--blue)',      bg: 'rgba(59,130,246,0.12)'  },
  ]

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: '14px 20px',
      marginBottom: 24, flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginRight: 8 }}>
        <TrendingUp size={16} color="var(--teal-400)" />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Pricing Snapshot</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>across {SERVICES.length} services</span>
      </div>
      {pills.map(p => (
        <span key={p.label} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 20, fontSize: 12.5, fontWeight: 600,
          color: p.color, background: p.bg,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          {counts[p.label] || 0} {p.label}
        </span>
      ))}
      <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
        Vermont / Burlington area · 2024–2025 data
      </span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────
export default function MarketComparison() {
  const [saved, setSaved] = useState(loadSaved)

  const getRate  = (id) => saved[id]?.rate  ?? SERVICES.find(s => s.id === id).defaultRate
  const getNotes = (id) => saved[id]?.notes ?? ''

  const update = (id, patch) => {
    setSaved(prev => {
      const next = { ...prev, [id]: { ...prev[id], ...patch } }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Market Comparison</h1>
          <p className="page-subtitle">
            HomeSHINE pricing vs Vermont / Burlington-area competitors · Rates are editable and saved locally
          </p>
        </div>
      </div>

      <SummaryRow rates={Object.fromEntries(SERVICES.map(s => [s.id, getRate(s.id)]))} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: 16 }}>
        {SERVICES.map(svc => (
          <ServiceCard
            key={svc.id}
            service={svc}
            rate={getRate(svc.id)}
            notes={getNotes(svc.id)}
            onRateChange={v  => update(svc.id, { rate: v })}
            onNotesChange={v => update(svc.id, { notes: v })}
          />
        ))}
      </div>
    </>
  )
}
