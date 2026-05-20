import { useState } from 'react'
import Dashboard from './components/Dashboard'
import ReportsPage from './components/ReportsPage'
import './App.css'

function App() {
  const [page, setPage] = useState<'dashboard' | 'reports'>('dashboard')

  if (page === 'reports') {
    return <ReportsPage onNavigate={setPage} />
  }

  return <Dashboard onNavigate={setPage} />
}

export default App
