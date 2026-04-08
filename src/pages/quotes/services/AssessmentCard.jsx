import { Pencil, Trash2 } from 'lucide-react'
import { SERVICE_TYPES, describeService } from './pricingEngine'
import { formatCurrency } from '../../../utils/calculations'

export default function AssessmentCard({ item, onEdit, onRemove }) {
  const def  = SERVICE_TYPES[item.type] || {}
  const desc = describeService(item.type, item.formData)
  const isBundle = item.type === 'bundle'

  return (
    <div style={{
      background: 'var(--bg-raised)',
      border: `1px solid ${isBundle ? 'rgba(20,184,166,0.35)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-md)',
      padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      {/* Icon */}
      <div style={{
        width: 40, height: 40, borderRadius: 8, flexShrink: 0,
        background: isBundle ? 'rgba(20,184,166,0.15)' : 'var(--bg-surface)',
        border: `1px solid ${isBundle ? 'rgba(20,184,166,0.3)' : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18,
      }}>
        {def.icon}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
          {def.label || item.type}
          {isBundle && (
            <span style={{ marginLeft: 8, fontSize: 10.5, color: 'var(--teal-400)', fontWeight: 600, background: 'rgba(20,184,166,0.12)', padding: '2px 7px', borderRadius: 10 }}>
              10% BUNDLE
            </span>
          )}
        </div>
        {desc && (
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {desc}
          </div>
        )}
      </div>

      {/* Price */}
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--teal-400)', flexShrink: 0 }}>
        {formatCurrency(item.price)}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button className="btn btn-ghost btn-icon btn-sm" title="Edit" onClick={onEdit}>
          <Pencil size={13} />
        </button>
        <button className="btn btn-danger btn-icon btn-sm" title="Remove" onClick={onRemove}>
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
