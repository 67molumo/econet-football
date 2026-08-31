import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import supabase from './lib/supabase'
import { useRole } from './hooks/useRole'
import MainLayout from './components/Layout/MainLayout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Matches from './pages/Matches'
import Players from './pages/Players'
import Statistics from './pages/Statistics'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import TeamSelection from './pages/TeamSelection'
import Login from './pages/Login'
import Loading from './components/common/Loading'

function App() {
  const { role, isAdmin, loading: roleLoading } = useRole()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading || roleLoading) {
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
        {/* Public Home Route */}
        <Route path="/" element={<Home />} />

        {/* Login Route */}
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" replace />} />

        {/* Protected Routes with Layout */}
        <Route path="/dashboard" element={
          <MainLayout isAdmin={isAdmin} session={session} role={role} />
        }>
          <Route index element={<Dashboard />} />
        </Route>

        <Route path="/matches" element={
          <MainLayout isAdmin={isAdmin} session={session} role={role} />
        }>
          <Route index element={<Matches />} />
        </Route>

        <Route path="/players" element={
          <MainLayout isAdmin={isAdmin} session={session} role={role} />
        }>  
          <Route index element={<Players />} />
        </Route>

        <Route path="/statistics" element={
          <MainLayout isAdmin={isAdmin} session={session} role={role} />
        }>
          <Route index element={<Statistics />} />
        </Route>

        <Route path="/reports" element={
          <MainLayout isAdmin={isAdmin} session={session} role={role} />
        }>
          <Route index element={<Reports />} />
        </Route>

        <Route path="/team-selection" element={
          <MainLayout isAdmin={isAdmin} session={session} role={role} />
        }>
          <Route index element={<TeamSelection />} />
        </Route>

        <Route path="/settings" element={
          <AdminRoute>
            <MainLayout isAdmin={isAdmin} session={session} role={role} />
          </AdminRoute>
        }>
          <Route index element={<Settings />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App