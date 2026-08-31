import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import supabase from './lib/supabase'
import { useRole } from './hooks/useRole'
import MainLayout from './components/Layout/MainLayout'
import Dashboard from './pages/Dashboard'
import Matches from './pages/Matches'
import Players from './pages/Players'
import Statistics from './pages/Statistics'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Loading from './components/common/Loading'

function App() {
  const { role, isAdmin, loading } = useRole()
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    )
  }

  const AdminRoute = ({ children }) => {
    if (!session) {
      return <Navigate to="/login" replace />
    }
    if (!isAdmin) {
      return <Navigate to="/" replace />
    }
    return children
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" replace />} />
        
        <Route path="/" element={
          <MainLayout isAdmin={isAdmin} session={session} role={role} />
        }>
          <Route index element={<Dashboard isAdmin={isAdmin} role={role} />} />
          <Route path="matches" element={<Matches isAdmin={isAdmin} role={role} />} />
          <Route path="players" element={<Players isAdmin={isAdmin} role={role} />} />
          <Route path="statistics" element={<Statistics isAdmin={isAdmin} role={role} />} />
          <Route path="reports" element={<Reports isAdmin={isAdmin} role={role} />} />
          
          <Route path="settings" element={
            <AdminRoute>
              <Settings isAdmin={isAdmin} role={role} />
            </AdminRoute>
          } />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App