import { useApp } from '../context/AppContext'
import { quoteSubtotal, quoteTax, quoteTotal, formatCurrency, formatDate } from '../utils/calculations'
import Badge from '../components/ui/Badge'
import { Users, FileText, Briefcase, DollarSign, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function StatCard({ label, value, sub, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
      <div className="stat-icon" style={{ background: iconBg }}>
        <Icon size={20} color={iconColor} />
      </div>
    </div>
  )
}

function getQuoteTotal(q) {
  const sub = quoteSubtotal(q.lineItems)
  return quoteTotal(sub, quoteTax(sub, q.taxRate))
}

export default function Dashboard() {
  const { customers, employees, quotes, jobs } = useApp()
  const navigate = useNavigate()

  const totalRevenue = quotes
    .filter(q => q.status === 'approved')
    .reduce((sum, q) => sum + getQuoteTotal(q), 0)

  const openQuotes  = quotes.filter(q => ['draft', 'sent'].includes(q.status)).length
  const activeJobs  = jobs.filter(j => ['scheduled', 'in-progress'].includes(j.status)).length
  const recentQuotes = [...quotes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)
  const recentJobs   = [...jobs].sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate)).slice(0, 5)

  const getCustomerName = (id) => customers.find(c => c.id === id)?.name || 'Unknown'

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back</h1>
          <p className="page-subtitle">Here's what's happening with HomeSHINE today.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Total Customers"
          value={customers.length}
          sub={`${customers.length} registered`}
          icon={Users}
          iconBg="rgba(59,130,246,0.15)"
          iconColor="var(--blue)"
        />
        <StatCard
          label="Open Quotes"
          value={openQuotes}
          sub={`${quotes.length} total`}
          icon={FileText}
          iconBg="rgba(234,179,8,0.15)"
          iconColor="var(--yellow)"
        />
        <StatCard
          label="Active Jobs"
          value={activeJobs}
          sub={`${jobs.length} total`}
          icon={Briefcase}
          iconBg="rgba(20,184,166,0.15)"
          iconColor="var(--teal-400)"
        />
        <StatCard
          label="Approved Revenue"
          value={formatCurrency(totalRevenue)}
          sub="From approved quotes"
          icon={DollarSign}
          iconBg="rgba(34,197,94,0.15)"
          iconColor="var(--green)"
        />
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="section-title" style={{ margin: 0 }}>Recent Quotes</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/quotes')}>View all</button>
          </div>
          <ul className="recent-list">
            {recentQuotes.length === 0 && (
              <li style={{ color: 'var(--text-muted)', fontSize: 13 }}>No quotes yet.</li>
            )}
            {recentQuotes.map(q => (
              <li key={q.id} className="recent-item">
                <div className="recent-item-left">
                  <span className="recent-item-name">{getCustomerName(q.customerId)}</span>
                  <span className="recent-item-sub">{formatDate(q.createdAt)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal-400)' }}>
                    {formatCurrency(getQuoteTotal(q))}
                  </span>
                  <Badge status={q.status} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="section-title" style={{ margin: 0 }}>Recent Jobs</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/jobs')}>View all</button>
          </div>
          <ul className="recent-list">
            {recentJobs.length === 0 && (
              <li style={{ color: 'var(--text-muted)', fontSize: 13 }}>No jobs yet.</li>
            )}
            {recentJobs.map(j => (
              <li key={j.id} className="recent-item">
                <div className="recent-item-left">
                  <span className="recent-item-name">{getCustomerName(j.customerId)}</span>
                  <span className="recent-item-sub">{j.serviceType} · {formatDate(j.scheduledDate)}</span>
                </div>
                <Badge status={j.status} dot />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
