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
  Shield
} from 'lucide-react'

const Sidebar = ({ onClose }) => {
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/matches', icon: Trophy, label: 'Matches' },
    { path: '/players', icon: Users, label: 'Players' },
    { path: '/statistics', icon: BarChart3, label: 'Statistics' },
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="h-full flex flex-col bg-[#1a1a2e] text-white">
      <div className="p-3 sm:p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-[#e67e22]" />
          <div>
            <h1 className="text-sm sm:text-lg font-bold tracking-tight leading-tight">Econet FC</h1>
            <p className="text-[9px] sm:text-xs text-gray-400 leading-tight hidden sm:block">Management System</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      <nav className="flex-1 p-2 sm:p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
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
          </NavLink>
        ))}
      </nav>

      <div className="p-3 sm:p-4 border-t border-gray-700">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#e67e22] flex items-center justify-center text-[10px] sm:text-sm font-bold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] sm:text-sm font-medium truncate">Admin</p>
            <p className="text-[9px] sm:text-xs text-gray-400 truncate hidden sm:block">admin@econetfc.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar