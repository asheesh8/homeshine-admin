import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Briefcase, Users, UserCheck, Droplets, BarChart3, DollarSign,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/cog',       icon: DollarSign,      label: 'Cost of Goods' },
  { to: '/quotes',    icon: FileText,        label: 'Quotes'        },
  { to: '/jobs',      icon: Briefcase,        label: 'Jobs'      },
  { to: '/market',    icon: BarChart3,        label: 'Market Comparison' },
  { to: '/customers', icon: Users,            label: 'Customers' },
  { to: '/employees', icon: UserCheck,        label: 'Employees' },
]

export default function Sidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">
            <Droplets size={18} color="#fff" />
          </div>
          <div>
            <div className="logo-text">Home<span>SHINE</span></div>
            <div className="logo-sub">Admin Portal</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              'nav-item' + (isActive || (to !== '/dashboard' && pathname.startsWith(to)) ? ' active' : '')
            }
          >
            <Icon className="nav-icon" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          HomeSHINE v0.1.0
        </div>
      </div>
    </aside>
  )
}
