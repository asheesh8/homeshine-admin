import { useState } from 'react'
import { Plus, Pencil, Trash2, Search, Save } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatDate } from '../../utils/calculations'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import JobForm from './JobForm'

export default function JobList() {
  const { jobs, customers, employees, deleteJob } = useApp()
  const [search, setSearch]       = useState('')
  const [filterStatus, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState(null)

  const getCustomer = (id) => customers.find(c => c.id === id)
  const getEmployee = (id) => employees.find(e => e.id === id)

  const filtered = jobs.filter(j => {
    const cname = getCustomer(j.customerId)?.name?.toLowerCase() || ''
    const matchS = !search || cname.includes(search.toLowerCase()) || j.serviceType.toLowerCase().includes(search.toLowerCase())
    const matchF = filterStatus === 'all' || j.status === filterStatus
    return matchS && matchF
  }).sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate))

  const openNew  = () => { setEditing(null); setShowModal(true) }
  const openEdit = (j) => { setEditing(j);   setShowModal(true) }
  const close    = () => { setShowModal(false); setEditing(null) }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Jobs</h1>
          <p className="page-subtitle">{jobs.length} total jobs</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={15} /> New Job
        </button>
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <Search className="search-icon" />
          <input
            className="search-input"
            placeholder="Search by customer or service…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select"
          style={{ width: 'auto' }}
          value={filterStatus}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Job #</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Scheduled</th>
              <th>Crew</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr className="empty-row"><td colSpan={7}>No jobs found.</td></tr>
            )}
            {filtered.map(j => (
              <tr key={j.id}>
                <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                  #{j.id.toUpperCase().slice(-6)}
                </td>
                <td style={{ fontWeight: 500 }}>{getCustomer(j.customerId)?.name || '—'}</td>
                <td>{j.serviceType || '—'}</td>
                <td>{formatDate(j.scheduledDate)}</td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {j.employeeIds.length === 0
                      ? <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Unassigned</span>
                      : j.employeeIds.map(eid => {
                          const emp = getEmployee(eid)
                          return emp ? (
                            <span key={eid} className="badge badge-teal" style={{ fontSize: 11 }}>
                              {emp.name.split(' ')[0]}
                            </span>
                          ) : null
                        })
                    }
                  </div>
                </td>
                <td><Badge status={j.status} dot /></td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-ghost btn-icon btn-sm" title="Edit" onClick={() => openEdit(j)}>
                      <Pencil size={14} />
                    </button>
                    <button
                      className="btn btn-danger btn-icon btn-sm"
                      title="Delete"
                      onClick={() => { if (confirm('Delete this job?')) deleteJob(j.id) }}
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

      {showModal && (
        <Modal
          title={editing ? 'Edit Job' : 'New Job'}
          onClose={close}
          size="lg"
          footer={
            <>
              <button className="btn btn-secondary" onClick={close}>Cancel</button>
              <button className="btn btn-primary" form="job-form" type="submit">
                <Save size={14} /> {editing ? 'Save Changes' : 'Create Job'}
              </button>
            </>
          }
        >
          <JobForm existing={editing} onSuccess={close} />
        </Modal>
      )}
    </>
  )
}
