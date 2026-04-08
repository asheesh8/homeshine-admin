import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { getInitials } from '../../utils/calculations'

const TITLES = {
  '/dashboard': 'Dashboard',
  '/cog':       'Cost of Goods',
  '/quotes':    'Quotes',
  '/jobs':      'Jobs',
  '/market':    'Market Comparison',
  '/customers': 'Customers',
  '/employees': 'Employees',
}

const OWNER = 'Admin User'

export default function Header() {
  const { pathname } = useLocation()
  const base = '/' + pathname.split('/')[1]
  const title = TITLES[base] || 'HomeSHINE'

  return (
    <header className="header">
      <div className="header-title">{title}</div>
      <div className="header-right">
        <button className="btn btn-ghost btn-icon" title="Notifications">
          <Bell size={17} />
        </button>
        <div className="header-avatar" title={OWNER}>
          {getInitials(OWNER)}
        </div>
      </div>
    </header>
  )
}
