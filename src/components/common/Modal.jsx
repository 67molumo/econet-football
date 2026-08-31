import React from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/helpers'

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className
}) => {
  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={onClose}></div>
      <div className={cn(
        'relative bg-white rounded-xl shadow-2xl w-full max-h-[90vh] overflow-y-auto',
        sizes[size],
        className
      )}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-3 sm:p-4 lg:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal