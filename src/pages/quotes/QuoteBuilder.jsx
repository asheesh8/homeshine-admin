import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, ArrowLeft, Save, FileDown } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { quoteSubtotal, quoteTax, quoteTotal, formatCurrency } from '../../utils/calculations'
import { exportQuotePDF } from '../../utils/pdfExport'
import AssessmentCard from './services/AssessmentCard'
import ServiceAssessmentModal from './services/ServiceAssessmentModal'
import { SERVICE_TYPES, describeService } from './services/pricingEngine'

const STATUS_OPTIONS = ['draft', 'sent', 'approved', 'rejected', 'expired']

/** Convert assessment items → legacy lineItems for storage/PDF compat. */
function toLineItems(assessmentItems) {
  return assessmentItems.map(item => ({
    id:          item.id,
    description: `${SERVICE_TYPES[item.type]?.label || item.type}${describeService(item.type, item.formData) ? ' — ' + describeService(item.type, item.formData) : ''}`,
    type:        'labor',
    quantity:    1,
    rate:        item.price,
  }))
}

export default function QuoteBuilder() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { customers, quotes, addQuote, updateQuote } = useApp()

  const existing = id ? quotes.find(q => q.id === id) : null

  // Load assessment items from saved quote, or empty
  const initItems = () => {
    if (existing?.assessmentData?.length) return existing.assessmentData
    // Legacy quote fallback — no assessment data, start empty
    return []
  }

  const [customerId, setCustomerId] = useState(existing?.customerId || '')
  const [status,     setStatus]     = useState(existing?.status     || 'draft')
  const [taxRate,    setTaxRate]    = useState(existing?.taxRate     ?? 6)
  const [notes,      setNotes]      = useState(existing?.notes       || '')
  const [items,      setItems]      = useState(initItems)

  // Modal state
  const [showModal,   setShowModal]   = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  // ── Calculations ──
  const subtotal = items.reduce((s, i) => s + i.price, 0)
  const tax      = quoteTax(subtotal, taxRate)
  const total    = quoteTotal(subtotal, tax)

  // ── CRUD ──
  const openAdd  = ()    => { setEditingItem(null); setShowModal(true) }
  const openEdit = (itm) => { setEditingItem(itm);  setShowModal(true) }
  const closeModal = ()  => { setShowModal(false); setEditingItem(null) }

  const handleSaveItem = (item) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === item.id)
      if (idx >= 0) {
        const next = [...prev]; next[idx] = item; return next
      }
      return [...prev, item]
    })
  }

  const removeItem = (itemId) =>
    setItems(prev => prev.filter(i => i.id !== itemId))

  // ── Save quote ──
  const handleSave = () => {
    if (!customerId) { alert('Please select a customer.'); return }
    const lineItems     = toLineItems(items)
    const assessmentData = items
    const payload = { customerId, status, taxRate: parseFloat(taxRate), notes, lineItems, assessmentData }
    if (existing) {
      updateQuote({ ...existing, ...payload })
    } else {
      addQuote(payload)
    }
    navigate('/quotes')
  }

  // ── PDF export ──
  const handleExportPDF = () => {
    if (!customerId) { alert('Please select a customer before exporting.'); return }
    const customer   = customers.find(c => c.id === customerId)
    const lineItems  = toLineItems(items)
    const quoteData  = existing
      ? { ...existing, customerId, status, taxRate: parseFloat(taxRate), notes, lineItems }
      : { id: 'preview', customerId, status, taxRate: parseFloat(taxRate), notes, lineItems, createdAt: new Date().toISOString().slice(0,10) }
    exportQuotePDF({ quote: quoteData, customer })
  }

  return (
    <>
      {/* ── Page header ── */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/quotes')}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="page-title">{existing ? 'Edit Quote' : 'New Quote'}</h1>
            <p className="page-subtitle">
              {existing ? `#${existing.id.toUpperCase().slice(-6)}` : 'Build a service quote'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={handleExportPDF} title="Download 2-page PDF" disabled={items.length === 0}>
            <FileDown size={15} /> Download PDF
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={15} /> Save Quote
          </button>
        </div>
      </div>

      <div className="quote-builder">
        {/* ── Quote details ── */}
        <div className="card">
          <div className="section-title">Quote Details</div>
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Customer *</label>
              <select className="form-select" value={customerId} onChange={e => setCustomerId(e.target.value)}>
                <option value="">Select customer…</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tax Rate (%)</label>
              <input className="form-input" type="number" min={0} max={100} step={0.1}
                value={taxRate} onChange={e => setTaxRate(e.target.value)} />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: 14 }}>
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" placeholder="Add any notes for this quote…"
              value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>

        {/* ── Services ── */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div className="section-title" style={{ margin: 0 }}>Services</div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                {items.length === 0
                  ? 'Add services to build the quote. Each has a smart pricing form.'
                  : `${items.length} service${items.length > 1 ? 's' : ''} added`}
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={openAdd}>
              <Plus size={13} /> Add Service
            </button>
          </div>

          {items.length === 0 ? (
            <div style={{
              border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)',
              padding: '36px 20px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🪣</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                No services yet
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                Click "Add Service" to pick a service type and fill out the assessment form.
              </div>
              <button className="btn btn-primary btn-sm" onClick={openAdd}>
                <Plus size={13} /> Add First Service
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map(item => (
                <AssessmentCard
                  key={item.id}
                  item={item}
                  onEdit={() => openEdit(item)}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Totals ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div className="quote-totals">
            <div className="total-row">
              <span className="label">Subtotal</span>
              <span className="value">{formatCurrency(subtotal)}</span>
            </div>
            <div className="total-row">
              <div className="tax-rate-wrap">
                <span className="label">Tax</span>
                <input
                  className="tax-rate-input" type="number" min={0} max={100} step={0.1}
                  value={taxRate} onChange={e => setTaxRate(e.target.value)} title="Edit tax rate"
                />
                <span className="label">%</span>
              </div>
              <span className="value">{formatCurrency(tax)}</span>
            </div>
            <hr className="total-divider" />
            <div className="total-row grand">
              <span className="label">Total</span>
              <span className="value">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Assessment modal ── */}
      {showModal && (
        <ServiceAssessmentModal
          existing={editingItem}
          onSave={handleSaveItem}
          onClose={closeModal}
        />
      )}
    </>
  )
}
