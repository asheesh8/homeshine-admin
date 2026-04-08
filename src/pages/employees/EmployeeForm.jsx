import { useState } from 'react'
import { useApp } from '../../context/AppContext'

const ROLES = [
  'Lead Technician',
  'Technician',
  'Sales / Estimator',
  'Office Manager',
  'Operations Manager',
  'Driver',
  'Other',
]

export default function EmployeeForm({ existing, onSuccess }) {
  const { addEmployee, updateEmployee } = useApp()

  const [form, setForm] = useState({
    name:     existing?.name     || '',
    email:    existing?.email    || '',
    phone:    existing?.phone    || '',
    role:     existing?.role     || '',
    status:   existing?.status   || 'active',
    hireDate: existing?.hireDate || '',
    notes:    existing?.notes    || '',
  })

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) { alert('Name is required.'); return }
    if (!form.role)        { alert('Role is required.'); return }
    if (existing) {
      updateEmployee({ ...existing, ...form })
    } else {
      addEmployee(form)
    }
    onSuccess()
  }

  return (
    <form id="employee-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input className="form-input" placeholder="Carlos Reyes" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Role *</label>
            <select className="form-select" value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="">Select role…</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="employee@homeshine.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" type="tel" placeholder="(555) 000-0000" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Hire Date</label>
          <input className="form-input" type="date" value={form.hireDate} onChange={e => set('hireDate', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="form-textarea" placeholder="Certifications, skills, notes…" value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
      </div>
    </form>
  )
}
