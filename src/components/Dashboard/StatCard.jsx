import React from 'react'

const StatCard = ({ label, value, icon: Icon, color = 'text-blue-600', subtitle }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-2 sm:p-3 lg:p-4 border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <p className="text-[10px] sm:text-xs text-gray-500 font-medium truncate">{label}</p>
        {Icon && <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${color} flex-shrink-0`} />}
      </div>
      <p className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      {subtitle && <p className="text-[8px] sm:text-[10px] text-gray-400 mt-0.5 truncate">{subtitle}</p>}
    </div>
  )
}

export default StatCard