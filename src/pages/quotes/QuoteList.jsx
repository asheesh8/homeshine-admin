import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Search, FileDown } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import {
  quoteSubtotal, quoteTax, quoteTotal,
  formatCurrency, formatDate,
} from '../../utils/calculations'
import { exportQuotePDF } from '../../utils/pdfExport'
import Badge from '../../components/ui/Badge'

function getTotal(q) {
  const sub = quoteSubtotal(q.lineItems)
  return quoteTotal(sub, quoteTax(sub, q.taxRate))
}

export default function QuoteList() {
  const { quotes, customers, deleteQuote } = useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const getCustomer = (id) => customers.find(c => c.id === id)

  const filtered = quotes.filter(q => {
    const customer = getCustomer(q.customerId)
    const name = customer?.name?.toLowerCase() || ''
    const matchSearch = !search || name.includes(search.toLowerCase()) || q.id.includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || q.status === filterStatus
    return matchSearch && matchStatus
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quotes</h1>
          <p className="page-subtitle">{quotes.length} total quotes</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/quotes/new')}>
          <Plus size={15} /> New Quote
        </button>
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <Search className="search-icon" />
          <input
            className="search-input"
            placeholder="Search by customer or ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select"
          style={{ width: 'auto' }}
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Quote #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Tax Rate</th>
              <th>Total</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr className="empty-row"><td colSpan={8}>No quotes found.</td></tr>
            )}
            {filtered.map(q => {
              const customer = getCustomer(q.customerId)
              return (
                <tr key={q.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    #{q.id.toUpperCase().slice(-6)}
                  </td>
                  <td style={{ fontWeight: 500 }}>{customer?.name || '—'}</td>
                  <td>{formatDate(q.createdAt)}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{q.lineItems.length}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{q.taxRate}%</td>
                  <td style={{ fontWeight: 600, color: 'var(--teal-400)' }}>
                    {formatCurrency(getTotal(q))}
                  </td>
                  <td><Badge status={q.status} /></td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        title="Download PDF"
                        onClick={() => exportQuotePDF({ quote: q, customer })}
                      >
                        <FileDown size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        title="Edit"
                        onClick={() => navigate(`/quotes/${q.id}/edit`)}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="btn btn-danger btn-icon btn-sm"
                        title="Delete"
                        onClick={() => { if (confirm('Delete this quote?')) deleteQuote(q.id) }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
