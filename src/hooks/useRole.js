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
          console.log('👤 No session, role: viewer')
          setRole('viewer')
          setIsAdmin(false)
          setLoading(false)
          return
        }

        console.log('🔍 Checking role for user:', session.user.email)

        // Method 1: Check users table directly (most reliable)
        try {
          const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('email', session.user.email)
            .maybeSingle()
          
          if (!error && data) {
            console.log('✅ Role from users table:', data.role)
            const userRole = data.role || 'viewer'
            setRole(userRole)
            // Admin = can edit team selection, manage players, etc.
            setIsAdmin(userRole === 'admin' || userRole === 'manager' || userRole === 'coach')
            setLoading(false)
            return
          } else {
            console.log('⚠️ User not found in users table, checking metadata...')
          }
        } catch (tableError) {
          console.log('⚠️ Users table error:', tableError.message)
        }

        // Method 2: Check app_metadata
        const metadataRole = session.user?.app_metadata?.role || 
                            session.user?.user_metadata?.role
        
        if (metadataRole) {
          console.log('✅ Role from metadata:', metadataRole)
          setRole(metadataRole)
          setIsAdmin(metadataRole === 'admin' || metadataRole === 'manager' || metadataRole === 'coach')
          setLoading(false)
          return
        }

        // Method 3: Email-based fallback
        const roleMap = {
          'admin@econetfc.com': 'admin',
          'manager@econetfc.com': 'manager',
          'coach@econetfc.com': 'coach',
          'viewer@econetfc.com': 'viewer'
        }
        
        const emailRole = roleMap[session.user.email]
        if (emailRole) {
          console.log('✅ Role from email fallback:', emailRole)
          setRole(emailRole)
          setIsAdmin(emailRole === 'admin' || emailRole === 'manager' || emailRole === 'coach')
          setLoading(false)
          return
        }

        // Default
        console.log('👤 Default role: viewer')
        setRole('viewer')
        setIsAdmin(false)
        
      } catch (error) {
        console.error('❌ Error checking role:', error)
        setRole('viewer')
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkRole()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkRole()
    })

    return () => subscription.unsubscribe()
  }, [])

  return { role, isAdmin, loading }
}