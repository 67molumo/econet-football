import React from 'react'
import { cn } from '../../utils/helpers'

const EmptyState = ({
  icon,
  title,
  description,
  action,
  className
}) => {
  return (
    <div className={cn(
      'text-center py-12 px-4',
      'border-2 border-dashed border-gray-300 rounded-xl',
      className
    )}>
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-500 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export default EmptyState