import { createContext, useContext, useReducer, useEffect } from 'react'
import { generateId } from '../utils/calculations'

const AppContext = createContext(null)

// ─── Seed data ────────────────────────────────────────────────────────
const SEED = {
  customers: [
    {
      id: 'c1', name: 'Margaret Sullivan', email: 'msullivan@email.com',
      phone: '(555) 201-4891', address: '142 Birchwood Lane', city: 'Naperville',
      state: 'IL', zip: '60540', notes: 'Prefers morning appointments.', createdAt: '2025-11-10',
    },
    {
      id: 'c2', name: 'David Okafor', email: 'dokafor@email.com',
      phone: '(555) 374-2265', address: '89 Riverbend Dr', city: 'Aurora',
      state: 'IL', zip: '60505', notes: '', createdAt: '2025-12-03',
    },
    {
      id: 'c3', name: 'Linda Ferreira', email: 'lferreira@email.com',
      phone: '(555) 520-8814', address: '308 Maplecrest Ct', city: 'Lisle',
      state: 'IL', zip: '60532', notes: 'Two-story, back deck needs extra attention.', createdAt: '2026-01-15',
    },
  ],
  employees: [
    {
      id: 'e1', name: 'Carlos Reyes', email: 'creyes@homeshine.com',
      phone: '(555) 100-2233', role: 'Lead Technician', status: 'active',
      hireDate: '2024-03-01', notes: '',
    },
    {
      id: 'e2', name: 'Ashley Kim', email: 'akim@homeshine.com',
      phone: '(555) 100-4455', role: 'Technician', status: 'active',
      hireDate: '2024-08-15', notes: '',
    },
    {
      id: 'e3', name: 'Jordan Webb', email: 'jwebb@homeshine.com',
      phone: '(555) 100-6677', role: 'Sales / Estimator', status: 'active',
      hireDate: '2025-01-10', notes: '',
    },
  ],
  quotes: [
    {
      id: 'q1', customerId: 'c1', status: 'approved',
      taxRate: 6, notes: 'Full exterior wash + gutter flush.',
      createdAt: '2026-02-20',
      lineItems: [
        { id: 'li1', description: 'Pressure washing - siding', type: 'labor', quantity: 4, rate: 85 },
        { id: 'li2', description: 'Gutter flush & inspection', type: 'labor', quantity: 2, rate: 65 },
        { id: 'li3', description: 'Cleaning solution', type: 'material', quantity: 3, rate: 18 },
      ],
    },
    {
      id: 'q2', customerId: 'c2', status: 'sent',
      taxRate: 6, notes: 'Driveway + walkway only.',
      createdAt: '2026-03-05',
      lineItems: [
        { id: 'li4', description: 'Concrete pressure wash', type: 'labor', quantity: 3, rate: 75 },
        { id: 'li5', description: 'Surface degreaser', type: 'material', quantity: 1, rate: 32 },
        { id: 'li6', description: 'Pressure washer rental', type: 'equipment', quantity: 1, rate: 120 },
      ],
    },
    {
      id: 'q3', customerId: 'c3', status: 'draft',
      taxRate: 6, notes: '',
      createdAt: '2026-04-01',
      lineItems: [
        { id: 'li7', description: 'Full exterior wash', type: 'labor', quantity: 6, rate: 85 },
      ],
    },
  ],
  jobs: [
    {
      id: 'j1', customerId: 'c1', quoteId: 'q1', employeeIds: ['e1', 'e2'],
      status: 'completed', scheduledDate: '2026-03-10', completedDate: '2026-03-10',
      serviceType: 'Full Exterior Wash', notes: 'Customer was very satisfied.',
    },
    {
      id: 'j2', customerId: 'c2', quoteId: 'q2', employeeIds: ['e2'],
      status: 'scheduled', scheduledDate: '2026-04-15', completedDate: '',
      serviceType: 'Driveway & Walkway', notes: '',
    },
    {
      id: 'j3', customerId: 'c3', quoteId: null, employeeIds: ['e1', 'e3'],
      status: 'in-progress', scheduledDate: '2026-04-07', completedDate: '',
      serviceType: 'Full Exterior Wash', notes: 'In progress today.',
    },
  ],
}

// ─── Reducer ──────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, { ...action.payload, id: generateId(), createdAt: new Date().toISOString().slice(0, 10) }] }
    case 'UPDATE_CUSTOMER':
      return { ...state, customers: state.customers.map(c => c.id === action.payload.id ? action.payload : c) }
    case 'DELETE_CUSTOMER':
      return { ...state, customers: state.customers.filter(c => c.id !== action.payload) }

    case 'ADD_EMPLOYEE':
      return { ...state, employees: [...state.employees, { ...action.payload, id: generateId() }] }
    case 'UPDATE_EMPLOYEE':
      return { ...state, employees: state.employees.map(e => e.id === action.payload.id ? action.payload : e) }
    case 'DELETE_EMPLOYEE':
      return { ...state, employees: state.employees.filter(e => e.id !== action.payload) }

    case 'ADD_QUOTE':
      return { ...state, quotes: [...state.quotes, { ...action.payload, id: generateId(), createdAt: new Date().toISOString().slice(0, 10) }] }
    case 'UPDATE_QUOTE':
      return { ...state, quotes: state.quotes.map(q => q.id === action.payload.id ? action.payload : q) }
    case 'DELETE_QUOTE':
      return { ...state, quotes: state.quotes.filter(q => q.id !== action.payload) }

    case 'ADD_JOB':
      return { ...state, jobs: [...state.jobs, { ...action.payload, id: generateId() }] }
    case 'UPDATE_JOB':
      return { ...state, jobs: state.jobs.map(j => j.id === action.payload.id ? action.payload : j) }
    case 'DELETE_JOB':
      return { ...state, jobs: state.jobs.filter(j => j.id !== action.payload) }

    default: return state
  }
}

function loadState() {
  try {
    const stored = localStorage.getItem('homeshine_state')
    return stored ? JSON.parse(stored) : SEED
  } catch {
    return SEED
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState)

  useEffect(() => {
    localStorage.setItem('homeshine_state', JSON.stringify(state))
  }, [state])

  const ctx = {
    ...state,
    dispatch,
    addCustomer:    (data) => dispatch({ type: 'ADD_CUSTOMER', payload: data }),
    updateCustomer: (data) => dispatch({ type: 'UPDATE_CUSTOMER', payload: data }),
    deleteCustomer: (id)   => dispatch({ type: 'DELETE_CUSTOMER', payload: id }),
    addEmployee:    (data) => dispatch({ type: 'ADD_EMPLOYEE', payload: data }),
    updateEmployee: (data) => dispatch({ type: 'UPDATE_EMPLOYEE', payload: data }),
    deleteEmployee: (id)   => dispatch({ type: 'DELETE_EMPLOYEE', payload: id }),
    addQuote:       (data) => dispatch({ type: 'ADD_QUOTE', payload: data }),
    updateQuote:    (data) => dispatch({ type: 'UPDATE_QUOTE', payload: data }),
    deleteQuote:    (id)   => dispatch({ type: 'DELETE_QUOTE', payload: id }),
    addJob:         (data) => dispatch({ type: 'ADD_JOB', payload: data }),
    updateJob:      (data) => dispatch({ type: 'UPDATE_JOB', payload: data }),
    deleteJob:      (id)   => dispatch({ type: 'DELETE_JOB', payload: id }),
  }

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
