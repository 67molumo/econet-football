import React from 'react'
import { Calendar, MapPin } from 'lucide-react'
import { formatDate } from '../../utils/helpers'

const RecentMatches = ({ matches }) => {
  const getResultColor = (result) => {
    const colors = {
      win: 'bg-green-100 text-green-800',
      draw: 'bg-yellow-100 text-yellow-800',
      loss: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800'
    }
    return colors[result] || 'bg-gray-100 text-gray-800'
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-4 sm:py-6 text-gray-500 text-xs sm:text-sm">
        No matches found
      </div>
    )
  }

  return (
    <div className="space-y-1.5 sm:space-y-2">
      {matches.slice(0, 5).map((match) => (
        <div key={match.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-2.5 lg:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-1 sm:gap-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              <span className="font-semibold text-gray-900 text-xs sm:text-sm">Econet</span>
              <span className="text-[10px] sm:text-xs text-gray-400">vs</span>
              <span className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{match.opponent}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 mt-0.5 text-[10px] sm:text-xs text-gray-500 flex-wrap">
              <span className="flex items-center gap-0.5">
                <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                {formatDate(match.match_date)}
              </span>
              {match.venues && (
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="truncate max-w-[60px] sm:max-w-[100px]">{match.venues.name}</span>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-center">
            {match.status === 'completed' ? (
              <>
                <span className="font-bold text-gray-900 text-xs sm:text-sm">
                  {match.home_score} - {match.away_score}
                </span>
                <span className={`inline-flex px-1.5 py-0.5 text-[8px] sm:text-[10px] font-semibold rounded-full ${getResultColor(match.result)}`}>
                  {match.result?.toUpperCase() || 'N/A'}
                </span>
              </>
            ) : (
              <span className="text-[8px] sm:text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                {match.status?.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default RecentMatches