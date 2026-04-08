import { useState, useCallback } from 'react'
import { Save, RotateCcw, AlertTriangle, Check } from 'lucide-react'
import { COG_DEFAULTS, getCOG, saveCOG, getCOGSavedAt } from '../../data/cogDefaults'

// ─── Field definitions ────────────────────────────────────────────────
// type: 'dollar' | 'percent' | 'count' | 'text'

const SECTIONS = [
  {
    id: 'window',
    title: 'Window Cleaning',
    icon: '🪟',
    keys: [
      'window_floor1_rate', 'window_floor2_rate',
      'window_screen_rate', 'window_heavy_buildup_pct',
      'window_minimum',
    ],
  },
  {
    id: 'gutter',
    title: 'Gutter Cleaning',
    icon: '🍂',
    keys: [
      'gutter_base_rate', 'gutter_rate_per_side',
      'gutter_double_story_upcharge', 'gutter_heavy_clog_surcharge',
      'gutter_minimum',
    ],
  },
  {
    id: 'roof',
    title: 'Roof Soft Wash',
    icon: '🏗️',
    keys: [
      'roof_base_under_1500', 'roof_base_1500_2500',
      'roof_base_2500_3500', 'roof_base_3500_plus',
      'roof_cedar_tile_upcharge', 'roof_age_15_plus_upcharge',
      'roof_heavy_shade_upcharge', 'roof_per_organic_upcharge',
      'roof_minimum',
    ],
  },
  {
    id: 'house',
    title: 'House Wash',
    icon: '🏠',
    keys: [
      'house_base_under_1500', 'house_base_1500_2500',
      'house_base_2500_3500', 'house_base_3500_plus',
      'house_story_2_upcharge', 'house_story_3_upcharge',
      'house_stucco_upcharge', 'house_cedar_upcharge',
      'house_heavy_buildup_pct', 'house_minimum',
    ],
  },
  {
    id: 'driveway',
    title: 'Driveway Wash',
    icon: '🚗',
    keys: [
      'driveway_small_rate', 'driveway_medium_rate',
      'driveway_large_rate', 'driveway_pavers_upcharge',
      'driveway_oil_stain_surcharge', 'driveway_minimum',
    ],
  },
  {
    id: 'deck',
    title: 'Deck Wash',
    icon: '🪵',
    keys: [
      'deck_small_rate', 'deck_medium_rate',
      'deck_large_rate', 'deck_xl_rate',
      'deck_composite_discount', 'deck_heavy_condition_upcharge',
      'deck_sealing_addon', 'deck_minimum',
    ],
  },
  {
    id: 'bundle',
    title: 'Full Exterior Bundle',
    icon: '⚡',
    keys: [
      'bundle_discount_pct',
      'bundle_minimum_services',
    ],
  },
  {
    id: 'tax',
    title: 'Tax & Labor',
    icon: '📋',
    keys: [
      'default_tax_rate', 'tax_label',
      'hourly_labor_rate', 'travel_surcharge',
    ],
  },
]

const FIELD_META = {
  // Window
  window_floor1_rate:        { label: '1st Floor Window — price per window',       type: 'dollar',  hint: 'Charged per individual pane' },
  window_floor2_rate:        { label: '2nd Floor Window — price per window',        type: 'dollar',  hint: 'Higher rate for ladder access' },
  window_screen_rate:        { label: 'Screen — price per screen',                  type: 'dollar',  hint: 'Applied to both floors equally' },
  window_heavy_buildup_pct:  { label: 'Heavy Buildup Surcharge',                    type: 'percent', hint: '% upcharge applied on top of total' },
  window_minimum:            { label: 'Minimum Job Charge',                         type: 'dollar',  hint: 'Applied even on small window counts' },
  // Gutter
  gutter_base_rate:              { label: 'Base Rate',                              type: 'dollar',  hint: 'Flat fee before side count' },
  gutter_rate_per_side:          { label: 'Rate Per Side',                          type: 'dollar',  hint: 'Multiplied by number of sides (1–4)' },
  gutter_double_story_upcharge:  { label: 'Double Story Upcharge',                  type: 'dollar',  hint: 'Added for 2-story homes' },
  gutter_heavy_clog_surcharge:   { label: 'Heavy Clog Surcharge',                   type: 'dollar',  hint: 'Added for heavily clogged gutters' },
  gutter_minimum:                { label: 'Minimum Job Charge',                     type: 'dollar',  hint: '' },
  // Roof
  roof_base_under_1500:       { label: 'Base Rate — under 1,500 sqft',              type: 'dollar',  hint: '' },
  roof_base_1500_2500:        { label: 'Base Rate — 1,500 to 2,500 sqft',           type: 'dollar',  hint: '' },
  roof_base_2500_3500:        { label: 'Base Rate — 2,500 to 3,500 sqft',           type: 'dollar',  hint: '' },
  roof_base_3500_plus:        { label: 'Base Rate — 3,500+ sqft',                   type: 'dollar',  hint: '' },
  roof_cedar_tile_upcharge:   { label: 'Cedar / Tile Upcharge',                     type: 'dollar',  hint: 'Applied for cedar shake or tile roofs' },
  roof_age_15_plus_upcharge:  { label: 'Roof Age 15+ Years Upcharge',               type: 'dollar',  hint: 'Older roofs require more care' },
  roof_heavy_shade_upcharge:  { label: 'Heavy Shade Upcharge',                      type: 'dollar',  hint: 'Heavily shaded roofs have more organic growth' },
  roof_per_organic_upcharge:  { label: 'Per Organic Type (mold / algae / lichen / moss)', type: 'dollar', hint: 'Charged per checked organic type' },
  roof_minimum:               { label: 'Minimum Job Charge',                        type: 'dollar',  hint: '' },
  // House
  house_base_under_1500:    { label: 'Base Rate — under 1,500 sqft',                type: 'dollar',  hint: '' },
  house_base_1500_2500:     { label: 'Base Rate — 1,500 to 2,500 sqft',             type: 'dollar',  hint: '' },
  house_base_2500_3500:     { label: 'Base Rate — 2,500 to 3,500 sqft',             type: 'dollar',  hint: '' },
  house_base_3500_plus:     { label: 'Base Rate — 3,500+ sqft',                     type: 'dollar',  hint: '' },
  house_story_2_upcharge:   { label: '2-Story Upcharge',                            type: 'dollar',  hint: 'Added for 2-story homes' },
  house_story_3_upcharge:   { label: '3+ Story Upcharge',                           type: 'dollar',  hint: 'Added for 3 or more stories' },
  house_stucco_upcharge:    { label: 'Stucco Siding Upcharge',                      type: 'dollar',  hint: 'Stucco requires extra care' },
  house_cedar_upcharge:     { label: 'Cedar Siding Upcharge',                       type: 'dollar',  hint: 'Cedar requires low-pressure soft wash' },
  house_heavy_buildup_pct:  { label: 'Heavy Buildup Surcharge',                     type: 'percent', hint: '% upcharge multiplied on subtotal' },
  house_minimum:            { label: 'Minimum Job Charge',                          type: 'dollar',  hint: '' },
  // Driveway
  driveway_small_rate:          { label: 'Small Driveway — under 500 sqft',         type: 'dollar',  hint: '' },
  driveway_medium_rate:         { label: 'Medium Driveway — 500 to 1,000 sqft',     type: 'dollar',  hint: '' },
  driveway_large_rate:          { label: 'Large Driveway — 1,000+ sqft',            type: 'dollar',  hint: '' },
  driveway_pavers_upcharge:     { label: 'Pavers Upcharge',                         type: 'dollar',  hint: 'Pavers require lower pressure & more time' },
  driveway_oil_stain_surcharge: { label: 'Oil Stain Surcharge',                     type: 'dollar',  hint: 'Degreaser application required' },
  driveway_minimum:             { label: 'Minimum Job Charge',                      type: 'dollar',  hint: '' },
  // Deck
  deck_small_rate:                { label: 'Small Deck — under 200 sqft',           type: 'dollar',  hint: '' },
  deck_medium_rate:               { label: 'Medium Deck — 200 to 400 sqft',         type: 'dollar',  hint: '' },
  deck_large_rate:                { label: 'Large Deck — 400 to 600 sqft',          type: 'dollar',  hint: '' },
  deck_xl_rate:                   { label: 'XL Deck — 600+ sqft',                   type: 'dollar',  hint: '' },
  deck_composite_discount:        { label: 'Composite Material Discount',           type: 'dollar',  hint: 'Subtracted — composite is faster to clean' },
  deck_heavy_condition_upcharge:  { label: 'Heavy Condition Upcharge',              type: 'dollar',  hint: '' },
  deck_sealing_addon:             { label: 'Deck Sealing Add-On',                   type: 'dollar',  hint: 'Optional — customer opt-in' },
  deck_minimum:                   { label: 'Minimum Job Charge',                    type: 'dollar',  hint: '' },
  // Bundle
  bundle_discount_pct:      { label: 'Full Exterior Bundle Discount',               type: 'percent', hint: 'Applied to combined house + gutter + driveway total' },
  bundle_minimum_services:  { label: 'Minimum Services for Bundle Price',           type: 'count',   hint: 'Quote must include at least this many services' },
  // Tax & Labor
  default_tax_rate:    { label: 'Default Tax Rate',                                 type: 'percent', hint: 'Pre-filled on every new quote — editable per quote' },
  tax_label:           { label: 'Tax Label shown on quote',                         type: 'text',    hint: 'e.g. "VT Sales Tax", "HST", "No Tax"' },
  hourly_labor_rate:   { label: 'Hourly Labor Rate — internal only',                type: 'dollar',  hint: 'Not shown to customers; for your job costing' },
  travel_surcharge:    { label: 'Travel / Fuel Surcharge per job — internal only',  type: 'dollar',  hint: 'Not shown to customers' },
}

// ─── Prefix badge ─────────────────────────────────────────────────────
function Prefix({ type }) {
  const map = { dollar: '$', percent: '%', count: '#', text: null }
  const char = map[type]
  if (!char) return null
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 28, height: '100%',
      background: 'var(--navy-700)', borderRight: '1px solid var(--border)',
      color: 'var(--teal-400)', fontSize: 12, fontWeight: 700,
      borderRadius: '6px 0 0 6px', flexShrink: 0,
    }}>
      {char}
    </span>
  )
}

// ─── Single field row ─────────────────────────────────────────────────
function FieldRow({ fieldKey, value, onChange }) {
  const meta = FIELD_META[fieldKey] || { label: fieldKey, type: 'dollar', hint: '' }
  const isText = meta.type === 'text'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
        {meta.label}
      </label>
      <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-base)' }}>
        <Prefix type={meta.type} />
        <input
          type={isText ? 'text' : 'number'}
          min={0}
          step={meta.type === 'percent' ? 0.5 : 1}
          value={value}
          onChange={e => onChange(isText ? e.target.value : Number(e.target.value))}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--text-primary)', fontSize: 13.5, fontWeight: 500,
            padding: '8px 10px',
          }}
          onFocus={e => e.target.closest('div').style.borderColor = 'var(--teal-500)'}
          onBlur={e => e.target.closest('div').style.borderColor = 'var(--border)'}
        />
      </div>
      {meta.hint && (
        <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{meta.hint}</span>
      )}
    </div>
  )
}

// ─── Service section card ─────────────────────────────────────────────
function SectionCard({ section, form, onChange }) {
  const sectionDefaults = {}
  section.keys.forEach(k => { sectionDefaults[k] = COG_DEFAULTS[k] })

  const handleReset = () => {
    onChange(sectionDefaults)
  }

  // Check if any field in this section differs from defaults
  const isDirty = section.keys.some(k => form[k] !== COG_DEFAULTS[k])

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
    }}>
      {/* Navy header */}
      <div style={{
        background: 'var(--navy-800)',
        borderBottom: '1px solid var(--navy-700)',
        padding: '12px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>{section.icon}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              {section.title}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
              {section.keys.length} configurable rate{section.keys.length !== 1 ? 's' : ''}
              {isDirty && (
                <span style={{ marginLeft: 8, color: 'var(--teal-400)', fontWeight: 600 }}>
                  · modified
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="btn btn-ghost btn-sm"
          style={{ color: 'var(--text-muted)', fontSize: 12 }}
          title="Reset this section to defaults"
        >
          <RotateCcw size={12} /> Reset to Defaults
        </button>
      </div>

      {/* Input grid */}
      <div style={{
        padding: '18px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px 20px',
      }}>
        {section.keys.map(k => (
          <FieldRow
            key={k}
            fieldKey={k}
            value={form[k] ?? COG_DEFAULTS[k]}
            onChange={val => onChange({ [k]: val })}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────
function Toast({ visible }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      background: 'var(--green)', color: '#fff',
      padding: '10px 18px', borderRadius: 8,
      display: 'flex', alignItems: 'center', gap: 8,
      fontSize: 13.5, fontWeight: 600,
      boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
      transition: 'all 0.25s',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
      pointerEvents: 'none',
      zIndex: 999,
    }}>
      <Check size={15} /> Saved!
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────
export default function CostOfGoods() {
  const [form,      setForm]      = useState(() => getCOG())
  const [toast,     setToast]     = useState(false)
  const [lastSaved, setLastSaved] = useState(() => getCOGSavedAt())

  const handleChange = useCallback((patch) => {
    setForm(prev => ({ ...prev, ...patch }))
  }, [])

  const handleSaveAll = () => {
    const ts = saveCOG(form)
    setLastSaved(ts)
    setToast(true)
    setTimeout(() => setToast(false), 2500)
  }

  const handleResetAll = () => {
    if (!confirm('Reset ALL rates to factory defaults?')) return
    setForm({ ...COG_DEFAULTS })
  }

  const formattedTs = lastSaved
    ? new Date(lastSaved).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : null

  return (
    <>
      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Cost of Goods</h1>
          <p className="page-subtitle">
            Pricing rates used by the quote calculator — changes apply immediately to new quotes
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={handleResetAll} style={{ color: 'var(--text-muted)' }}>
            <RotateCcw size={13} /> Reset All
          </button>
          <button className="btn btn-primary" onClick={handleSaveAll}>
            <Save size={15} /> Save All
          </button>
        </div>
      </div>

      {/* ── Info banner ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        background: 'rgba(234,179,8,0.1)',
        border: '1px solid rgba(234,179,8,0.35)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        marginBottom: 24,
      }}>
        <AlertTriangle size={16} color="var(--yellow)" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--yellow)' }}>
            These rates power your quote calculator.
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 6 }}>
            Changes take effect immediately on new quotes. Existing saved quotes are not affected.
          </span>
        </div>
      </div>

      {/* ── Sections ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {SECTIONS.map(section => (
          <SectionCard
            key={section.id}
            section={section}
            form={form}
            onChange={handleChange}
          />
        ))}
      </div>

      {/* ── Footer timestamp ── */}
      <div style={{ textAlign: 'right', marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
        {formattedTs
          ? <>Last saved: <strong style={{ color: 'var(--text-secondary)' }}>{formattedTs}</strong></>
          : 'Not yet saved — click "Save All" to persist your rates.'}
      </div>

      <Toast visible={toast} />
    </>
  )
}
