import { SERVICE_TYPES } from './pricingEngine'

const ORDER = ['house-wash', 'gutter', 'roof-wash', 'driveway', 'window', 'deck', 'bundle']

export default function ServicePicker({ onSelect }) {
  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>
        Select a service to assess pricing for this quote.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {ORDER.map(key => {
          const svc = SERVICE_TYPES[key]
          const isBundle = key === 'bundle'
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px',
                background: isBundle ? 'rgba(20,184,166,0.08)' : 'var(--bg-raised)',
                border: `1px solid ${isBundle ? 'rgba(20,184,166,0.35)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--teal-500)'; e.currentTarget.style.background = 'rgba(20,184,166,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = isBundle ? 'rgba(20,184,166,0.35)' : 'var(--border)'; e.currentTarget.style.background = isBundle ? 'rgba(20,184,166,0.08)' : 'var(--bg-raised)' }}
            >
              <span style={{ fontSize: 22, lineHeight: 1 }}>{svc.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {svc.label}
                  {isBundle && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--teal-400)', fontWeight: 700 }}>10% OFF</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{svc.range}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
