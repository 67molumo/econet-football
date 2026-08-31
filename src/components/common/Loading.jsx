import React from 'react'

const Loading = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  }

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`${sizes[size]} border-4 border-[#1a4d7a] border-t-transparent rounded-full animate-spin`}></div>
    </div>
  )
}

export default Loading