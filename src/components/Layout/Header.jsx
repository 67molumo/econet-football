import React from 'react'
import { Menu, Bell, User, LogOut, Shield, LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import supabase from '../../lib/supabase'

const Header = ({ onMenuClick, isAdmin, session, role }) => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const handleLogin = () => {
    navigate('/login')
  }

  // Get role badge color
  const getRoleBadgeColor = () => {
    switch(role) {
      case 'admin': return 'bg-green-100 text-green-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-12 sm:h-14 lg:h-16">
      <div className="flex items-center justify-between px-3 sm:px-4 h-full">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="lg:hidden flex items-center gap-1.5">
            <Shield className="w-5 h-5 text-[#e67e22]" />
            <h2 className="text-sm sm:text-base font-bold text-[#1a1a2e]">Econet FC</h2>
          </div>
          <div className="hidden lg:block">
            <h2 className="text-sm font-medium text-gray-600">Dashboard</h2>
          </div>
          {isAdmin && (
            <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full bg-green-100 text-green-800">
              Admin
            </span>
          )}
          {role === 'manager' && !isAdmin && (
            <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-100 text-blue-800">
              Manager
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          </button>
          
          {session ? (
            <>
              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
              <button
                onClick={handleLogout}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-red-500"
                title="Logout"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#1a4d7a] hover:bg-blue-50 rounded-lg transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header