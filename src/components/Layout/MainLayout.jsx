import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import MobileNav from './MobileNav'

const MainLayout = ({ isAdmin, session, role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden lg:block fixed inset-y-0 left-0 z-40 w-64">
        <Sidebar isAdmin={isAdmin} session={session} role={role} />
      </div>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-[280px] max-w-[75vw] bg-white shadow-xl animate-slide-in">
            <Sidebar 
              onClose={() => setSidebarOpen(false)} 
              isAdmin={isAdmin} 
              session={session}
              role={role}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          isAdmin={isAdmin} 
          session={session}
          role={role}
        />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 pb-20 lg:pb-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet context={{ isAdmin, session, role }} />
          </div>
        </main>
        <MobileNav isAdmin={isAdmin} role={role} />
      </div>
    </div>
  )
}

export default MainLayout