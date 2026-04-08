import { useState } from 'react'
import { Plus, Pencil, Trash2, Search, Save, Mail, Phone, MapPin } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatDate, getInitials } from '../../utils/calculations'
import Modal from '../../components/ui/Modal'
import CustomerForm from './CustomerForm'

export default function CustomerList() {
  const { customers, quotes, deleteCustomer } = useApp()
  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [viewing, setViewing]     = useState(null)

  const filtered = customers.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  ).sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const quoteCount = (id) => quotes.filter(q => q.customerId === id).length

  const openNew  = () => { setEditing(null); setShowModal(true) }
  const openEdit = (c) => { setEditing(c); setViewing(null); setShowModal(true) }
  const close    = () => { setShowModal(false); setEditing(null) }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{customers.length} registered customers</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={15} /> Add Customer
        </button>
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <Search className="search-icon" />
          <input
            className="search-input"
            placeholder="Search by name, email, or phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Quotes</th>
              <th>Member Since</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr className="empty-row"><td colSpan={7}>No customers found.</td></tr>
            )}
            {filtered.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--navy-700), var(--teal-600))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: 'var(--teal-300)', flexShrink: 0,
                    }}>
                      {getInitials(c.name)}
                    </div>
                    <button
                      style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontWeight: 500, cursor: 'pointer', textAlign: 'left' }}
                      onClick={() => setViewing(c)}
                    >
                      {c.name}
                    </button>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{c.email || '—'}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{c.phone || '—'}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  {c.city && c.state ? `${c.city}, ${c.state}` : c.city || '—'}
                </td>
                <td>
                  <span className="badge badge-teal">{quoteCount(c.id)}</span>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{formatDate(c.createdAt)}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-ghost btn-icon btn-sm" title="Edit" onClick={() => openEdit(c)}>
                      <Pencil size={14} />
                    </button>
                    <button
                      className="btn btn-danger btn-icon btn-sm"
                      title="Delete"
                      onClick={() => { if (confirm(`Delete ${c.name}?`)) deleteCustomer(c.id) }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit modal */}
      {showModal && (
        <Modal
          title={editing ? `Edit ${editing.name}` : 'Add Customer'}
          onClose={close}
          footer={
            <>
              <button className="btn btn-secondary" onClick={close}>Cancel</button>
              <button className="btn btn-primary" form="customer-form" type="submit">
                <Save size={14} /> {editing ? 'Save Changes' : 'Add Customer'}
              </button>
            </>
          }
        >
          <CustomerForm existing={editing} onSuccess={close} />
        </Modal>
      )}

      {/* Detail modal */}
      {viewing && !showModal && (
        <Modal title={viewing.name} onClose={() => setViewing(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="detail-info-grid">
              <div className="detail-field">
                <span className="detail-field-label">Email</span>
                <span className="detail-field-value">{viewing.email || '—'}</span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Phone</span>
                <span className="detail-field-value">{viewing.phone || '—'}</span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Address</span>
                <span className="detail-field-value">{viewing.address || '—'}</span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">City / State</span>
                <span className="detail-field-value">
                  {[viewing.city, viewing.state, viewing.zip].filter(Boolean).join(', ') || '—'}
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Quotes</span>
                <span className="detail-field-value">{quoteCount(viewing.id)}</span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Member Since</span>
                <span className="detail-field-value">{formatDate(viewing.createdAt)}</span>
              </div>
            </div>
            {viewing.notes && (
              <>
                <hr className="divider" />
                <div className="detail-field">
                  <span className="detail-field-label">Notes</span>
                  <span className="detail-field-value" style={{ marginTop: 4 }}>{viewing.notes}</span>
                </div>
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
              <button className="btn btn-secondary" onClick={() => { openEdit(viewing) }}>
                <Pencil size={13} /> Edit
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
