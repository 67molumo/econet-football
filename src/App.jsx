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
  const [isAdmin, setIsAdmin] = useState(false)
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
      if (session) {
        checkAdminStatus(session)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        checkAdminStatus(session)
      } else {
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAdminStatus = async (session) => {
    if (session?.user) {
      try {
        // Check if user has admin role
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        if (!error && data) {
          setIsAdmin(data.role === 'admin' || data.role === 'manager')
        } else {
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      }
    } else {
      setIsAdmin(false)
    }
  }

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

  // Protected Route for Admin Only
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
          <MainLayout isAdmin={isAdmin} session={session} />
        }>
          {/* Public Routes - Everyone can view */}
          <Route index element={<Dashboard isAdmin={isAdmin} />} />
          <Route path="matches" element={<Matches isAdmin={isAdmin} />} />
          <Route path="players" element={<Players isAdmin={isAdmin} />} />
          <Route path="statistics" element={<Statistics isAdmin={isAdmin} />} />
          <Route path="reports" element={<Reports isAdmin={isAdmin} />} />
          <Route path="test" element={<TestConnection />} />
          
          {/* Admin Only Routes */}
          <Route path="settings" element={
            <AdminRoute>
              <Settings isAdmin={isAdmin} />
            </AdminRoute>
          } />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App