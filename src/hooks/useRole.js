import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

export const useRole = () => {
  const [role, setRole] = useState('viewer')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          setRole('viewer')
          setIsAdmin(false)
          setLoading(false)
          return
        }

        // Check using secure function
        const { data: isAdminResult, error: functionError } = await supabase
          .rpc('is_admin')
        
        if (!functionError) {
          setIsAdmin(isAdminResult)
          setRole(isAdminResult ? 'admin' : 'viewer')
        } else {
          // Fallback to metadata
          const userRole = session.user?.app_metadata?.role || 
                          session.user?.user_metadata?.role || 
                          'viewer'
          setRole(userRole)
          setIsAdmin(userRole === 'admin' || userRole === 'manager')
        }
      } catch (error) {
        console.error('Error checking role:', error)
        setRole('viewer')
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkRole()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkRole()
    })

    return () => subscription.unsubscribe()
  }, [])

  return { role, isAdmin, loading }
}