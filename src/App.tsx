import { useState } from 'react'
import Dashboard from './components/Dashboard'
import ReportsPage from './components/ReportsPage'
import './App.css'

function App() {
  const [page, setPage] = useState<'dashboard' | 'reports'>('dashboard')

  return page === 'reports' ? <ReportsPage onNavigate={setPage} /> : <Dashboard onNavigate={setPage} />
}

export default App
