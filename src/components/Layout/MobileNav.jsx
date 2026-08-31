import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Trophy, Users, BarChart3 } from 'lucide-react'

const MobileNav = () => {
  const items = [
    { path: '/', icon: LayoutDashboard, label: 'Home' },
    { path: '/matches', icon: Trophy, label: 'Matches' },
    { path: '/players', icon: Users, label: 'Players' },
    { path: '/statistics', icon: BarChart3, label: 'Stats' },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 h-14 sm:h-16">
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center gap-0.5 px-3 py-1
              ${isActive ? 'text-[#e67e22]' : 'text-gray-500'}
            `}
          >
            <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[9px] sm:text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default MobileNav