import { useState } from 'react'
import { Plus, Pencil, Trash2, Search, Save } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatDate, getInitials } from '../../utils/calculations'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import EmployeeForm from './EmployeeForm'

export default function EmployeeList() {
  const { employees, jobs, deleteEmployee } = useApp()
  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [viewing, setViewing]     = useState(null)

  const filtered = employees.filter(e =>
    !search ||
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  )

  const jobCount = (id) => jobs.filter(j => j.employeeIds.includes(id)).length

  const openNew  = () => { setEditing(null); setShowModal(true) }
  const openEdit = (e) => { setEditing(e); setViewing(null); setShowModal(true) }
  const close    = () => { setShowModal(false); setEditing(null) }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">{employees.length} team members</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={15} /> Add Employee
        </button>
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <Search className="search-icon" />
          <input
            className="search-input"
            placeholder="Search by name, role, or email…"
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
              <th>Role</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Jobs</th>
              <th>Hire Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr className="empty-row"><td colSpan={8}>No employees found.</td></tr>
            )}
            {filtered.map(emp => (
              <tr key={emp.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--teal-600), var(--navy-700))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: 'var(--teal-300)', flexShrink: 0,
                    }}>
                      {getInitials(emp.name)}
                    </div>
                    <button
                      style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontWeight: 500, cursor: 'pointer', textAlign: 'left' }}
                      onClick={() => setViewing(emp)}
                    >
                      {emp.name}
                    </button>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{emp.role}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{emp.email || '—'}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{emp.phone || '—'}</td>
                <td>
                  <span className="badge badge-blue">{jobCount(emp.id)}</span>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{formatDate(emp.hireDate)}</td>
                <td><Badge status={emp.status} dot /></td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-ghost btn-icon btn-sm" title="Edit" onClick={() => openEdit(emp)}>
                      <Pencil size={14} />
                    </button>
                    <button
                      className="btn btn-danger btn-icon btn-sm"
                      title="Delete"
                      onClick={() => { if (confirm(`Remove ${emp.name}?`)) deleteEmployee(emp.id) }}
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
          title={editing ? `Edit ${editing.name}` : 'Add Employee'}
          onClose={close}
          footer={
            <>
              <button className="btn btn-secondary" onClick={close}>Cancel</button>
              <button className="btn btn-primary" form="employee-form" type="submit">
                <Save size={14} /> {editing ? 'Save Changes' : 'Add Employee'}
              </button>
            </>
          }
        >
          <EmployeeForm existing={editing} onSuccess={close} />
        </Modal>
      )}

      {/* Detail modal */}
      {viewing && !showModal && (
        <Modal title={viewing.name} onClose={() => setViewing(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="detail-info-grid">
              <div className="detail-field">
                <span className="detail-field-label">Role</span>
                <span className="detail-field-value">{viewing.role}</span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Status</span>
                <Badge status={viewing.status} />
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Email</span>
                <span className="detail-field-value">{viewing.email || '—'}</span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Phone</span>
                <span className="detail-field-value">{viewing.phone || '—'}</span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Hire Date</span>
                <span className="detail-field-value">{formatDate(viewing.hireDate)}</span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Total Jobs</span>
                <span className="detail-field-value">{jobCount(viewing.id)}</span>
              </div>
            </div>
            {viewing.notes && (
              <>
                <hr className="divider" />
                <div className="detail-field">
                  <span className="detail-field-label">Notes</span>
                  <span className="detail-field-value">{viewing.notes}</span>
                </div>
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
              <button className="btn btn-secondary" onClick={() => openEdit(viewing)}>
                <Pencil size={13} /> Edit
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
