import { useState } from 'react'
import { useApp } from '../../context/AppContext'

const STATUS_OPTIONS = ['scheduled', 'in-progress', 'completed', 'cancelled']
const SERVICE_TYPES  = [
  'Full Exterior Wash',
  'Driveway & Walkway',
  'Roof Soft Wash',
  'Deck & Patio',
  'Window Washing',
  'Gutter Flush',
  'Fence Cleaning',
  'Other',
]

export default function JobForm({ existing, onSuccess }) {
  const { customers, employees, quotes, addJob, updateJob } = useApp()

  const [form, setForm] = useState({
    customerId:    existing?.customerId    || '',
    quoteId:       existing?.quoteId       || '',
    employeeIds:   existing?.employeeIds   || [],
    status:        existing?.status        || 'scheduled',
    serviceType:   existing?.serviceType   || '',
    scheduledDate: existing?.scheduledDate || '',
    completedDate: existing?.completedDate || '',
    notes:         existing?.notes         || '',
  })

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const toggleEmployee = (eid) => {
    set('employeeIds',
      form.employeeIds.includes(eid)
        ? form.employeeIds.filter(id => id !== eid)
        : [...form.employeeIds, eid]
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.customerId)    { alert('Select a customer.'); return }
    if (!form.serviceType)   { alert('Enter a service type.'); return }
    if (!form.scheduledDate) { alert('Enter a scheduled date.'); return }

    if (existing) {
      updateJob({ ...existing, ...form })
    } else {
      addJob(form)
    }
    onSuccess()
  }

  const customerQuotes = quotes.filter(q => q.customerId === form.customerId)

  return (
    <form id="job-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Customer *</label>
            <select className="form-select" value={form.customerId} onChange={e => set('customerId', e.target.value)}>
              <option value="">Select customer…</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Linked Quote</label>
            <select
              className="form-select"
              value={form.quoteId}
              onChange={e => set('quoteId', e.target.value)}
              disabled={!form.customerId}
            >
              <option value="">None</option>
              {customerQuotes.map(q => (
                <option key={q.id} value={q.id}>
                  #{q.id.toUpperCase().slice(-6)} — {q.status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Service Type *</label>
            <select className="form-select" value={form.serviceType} onChange={e => set('serviceType', e.target.value)}>
              <option value="">Select service…</option>
              {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Scheduled Date *</label>
            <input className="form-input" type="date" value={form.scheduledDate} onChange={e => set('scheduledDate', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Completed Date</label>
            <input className="form-input" type="date" value={form.completedDate} onChange={e => set('completedDate', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Assign Employees</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {employees.map(emp => {
              const selected = form.employeeIds.includes(emp.id)
              return (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => toggleEmployee(emp.id)}
                  className={selected ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                >
                  {emp.name} · {emp.role}
                </button>
              )
            })}
            {employees.length === 0 && (
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>No employees added yet.</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="form-textarea" placeholder="Job notes…" value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
      </div>
    </form>
  )
}
