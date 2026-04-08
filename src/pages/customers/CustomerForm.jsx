import { useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function CustomerForm({ existing, onSuccess }) {
  const { addCustomer, updateCustomer } = useApp()

  const [form, setForm] = useState({
    name:    existing?.name    || '',
    email:   existing?.email   || '',
    phone:   existing?.phone   || '',
    address: existing?.address || '',
    city:    existing?.city    || '',
    state:   existing?.state   || '',
    zip:     existing?.zip     || '',
    notes:   existing?.notes   || '',
  })

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) { alert('Name is required.'); return }
    if (existing) {
      updateCustomer({ ...existing, ...form })
    } else {
      addCustomer(form)
    }
    onSuccess()
  }

  return (
    <form id="customer-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input className="form-input" placeholder="Jane Smith" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="jane@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" type="tel" placeholder="(555) 000-0000" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Street Address</label>
          <input className="form-input" placeholder="123 Main St" value={form.address} onChange={e => set('address', e.target.value)} />
        </div>

        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">City</label>
            <input className="form-input" placeholder="Naperville" value={form.city} onChange={e => set('city', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">State</label>
            <input className="form-input" placeholder="IL" value={form.state} onChange={e => set('state', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">ZIP</label>
            <input className="form-input" placeholder="60540" value={form.zip} onChange={e => set('zip', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="form-textarea" placeholder="Any special notes about this customer…" value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
      </div>
    </form>
  )
}
