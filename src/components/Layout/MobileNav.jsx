import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Trophy, Users, BarChart3, Settings } from 'lucide-react'

const MobileNav = ({ isAdmin }) => {
  const items = [
    { path: '/', icon: LayoutDashboard, label: 'Home', public: true },
    { path: '/matches', icon: Trophy, label: 'Matches', public: true },
    { path: '/players', icon: Users, label: 'Players', public: true },
    { path: '/statistics', icon: BarChart3, label: 'Stats', public: true },
    { path: '/settings', icon: Settings, label: 'Admin', public: false, admin: true },
  ]

  // Filter items based on admin status
  const visibleItems = items.filter(item => {
    // Show public items to everyone
    if (item.public) return true
    // Show admin items only to admins
    if (item.admin && isAdmin) return true
    return false
  })

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 h-14 sm:h-16">
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center gap-0.5 px-3 py-1 relative
              ${isActive ? 'text-[#e67e22]' : 'text-gray-500'}
            `}
          >
            <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[9px] sm:text-[10px] font-medium">{item.label}</span>
            {item.admin && isAdmin && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default MobileNav