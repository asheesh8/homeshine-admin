import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import QuoteList from './pages/quotes/QuoteList'
import QuoteBuilder from './pages/quotes/QuoteBuilder'
import JobList from './pages/jobs/JobList'
import CostOfGoods from './pages/cog/CostOfGoods'
import MarketComparison from './pages/market/MarketComparison'
import CustomerList from './pages/customers/CustomerList'
import EmployeeList from './pages/employees/EmployeeList'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="cog" element={<CostOfGoods />} />
        <Route path="quotes" element={<QuoteList />} />
        <Route path="quotes/new" element={<QuoteBuilder />} />
        <Route path="quotes/:id/edit" element={<QuoteBuilder />} />
        <Route path="jobs" element={<JobList />} />
        <Route path="market" element={<MarketComparison />} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="employees" element={<EmployeeList />} />
      </Route>
    </Routes>
  )
}
