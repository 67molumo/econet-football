import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  BarChart3, 
  FileText, 
  Settings,
  X,
  LogIn,
  LogOut,
  Home,
  Shield
} from 'lucide-react'
import supabase from '../../lib/supabase'

// Import the logo
import nchoathiLogo from '/images/nchoathi_logo.png'

const Sidebar = ({ onClose, isAdmin, session, role }) => {
const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'manager', 'viewer'] },
  { path: '/matches', icon: Trophy, label: 'Matches', roles: ['admin', 'manager', 'viewer'] },
  { path: '/players', icon: Users, label: 'Players', roles: ['admin', 'manager', 'viewer'] },
  { path: '/team-selection', icon: Shield, label: 'Team Selection', roles: ['admin', 'manager', 'coach', 'viewer'] },
  { path: '/statistics', icon: BarChart3, label: 'Statistics', roles: ['admin', 'manager', 'viewer'] },
  { path: '/reports', icon: FileText, label: 'Reports', roles: ['admin', 'manager', 'viewer'] },
  { path: '/settings', icon: Settings, label: 'Settings', roles: ['admin'] },
]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const handleLogin = () => {
    window.location.href = '/login'
  }

  const hasAccess = (item) => {
    return item.roles.includes(role) || (item.roles.includes('admin') && isAdmin)
  }

  const getUserInitials = () => {
    if (session?.user?.email) {
      return session.user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const getUserName = () => {
    if (isAdmin) return 'Admin'
    if (role === 'manager') return 'Manager'
    if (session?.user?.email) {
      const name = session.user.email.split('@')[0]
      return name.charAt(0).toUpperCase() + name.slice(1)
    }
    return 'User'
  }

  const getRoleBadgeColor = () => {
    switch(role) {
      case 'admin': return 'bg-green-600/30 text-green-300'
      case 'manager': return 'bg-blue-600/30 text-blue-300'
      default: return 'bg-gray-600/30 text-gray-300'
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#1a1a2e] text-white">
      {/* Logo Section - Clickable to Home */}
      <div className="p-3 sm:p-4 border-b border-gray-700 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
          <img 
            src={nchoathiLogo} 
            alt="Nchoathi FC Logo" 
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-lg bg-white/10 p-1"
          />
          <div>
            <h1 className="text-sm sm:text-lg font-bold tracking-tight leading-tight">Nchoathi FC</h1>
            <p className="text-[9px] sm:text-xs text-gray-400 leading-tight hidden sm:block">Management System</p>
          </div>
        </NavLink>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 sm:p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          if (!hasAccess(item)) return null
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-all duration-200 text-xs sm:text-sm
                ${isActive 
                  ? 'bg-[#e67e22] text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">{item.label}</span>
              {item.roles.includes('admin') && isAdmin && (
                <span className="ml-auto text-[8px] sm:text-[9px] px-1.5 py-0.5 bg-green-600/30 text-green-300 rounded-full">
                  Admin
                </span>
              )}
            </NavLink>
          )
        })}
        
        {/* Home Link at bottom of nav */}
        <NavLink
          to="/"
          onClick={onClose}
          className={({ isActive }) => `
            flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-all duration-200 text-xs sm:text-sm mt-2 border-t border-gray-700 pt-3
            ${isActive 
              ? 'bg-[#e67e22] text-white shadow-lg' 
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }
          `}
        >
          <Home className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-medium">Home</span>
        </NavLink>
      </nav>

      {/* User Profile / Auth Section */}
      <div className="p-3 sm:p-4 border-t border-gray-700 space-y-2">
        {session ? (
          <>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#e67e22] flex items-center justify-center text-[10px] sm:text-sm font-bold flex-shrink-0">
                {getUserInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] sm:text-sm font-medium truncate">
                  {getUserName()}
                  <span className={`ml-1.5 text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full ${getRoleBadgeColor()}`}>
                    {role.toUpperCase()}
                  </span>
                </p>
                <p className="text-[9px] sm:text-xs text-gray-400 truncate hidden sm:block">
                  {session.user.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs sm:text-sm text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs sm:text-sm text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Sign In
          </button>
        )}
        
        {!session && (
          <p className="text-[8px] sm:text-[9px] text-gray-500 text-center">
            Public View • Read Only
          </p>
        )}
      </div>
    </div>
  )
}

export default Sidebar