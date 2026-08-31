import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import supabase from './lib/supabase'
import { testSupabaseConnection } from './lib/supabaseTest'
import MainLayout from './components/Layout/MainLayout'
import Dashboard from './pages/Dashboard'
import Matches from './pages/Matches'
import Players from './pages/Players'
import Statistics from './pages/Statistics'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Loading from './components/common/Loading'
import TestConnection from './pages/TestConnection'

function App() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('testing')

  useEffect(() => {
    // Test Supabase connection
    const testConnection = async () => {
      const result = await testSupabaseConnection()
      setConnectionStatus(result ? 'connected' : 'failed')
    }
    
    testConnection()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
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

  // Show connection status in console
  if (connectionStatus === 'connected') {
    console.log('✅ Supabase connection: SUCCESS')
  } else if (connectionStatus === 'failed') {
    console.error('❌ Supabase connection: FAILED - Check your .env file')
  }

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    if (!session) {
      return <Navigate to="/login" replace />
    }
    return children
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" replace />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="matches" element={<Matches />} />
          <Route path="players" element={<Players />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="/test" element={<TestConnection />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App