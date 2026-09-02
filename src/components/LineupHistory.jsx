import React, { useState, useEffect } from 'react'
import { Clock, History, Calendar, Users, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { useLineups } from '../hooks/useLineups'
import { formatDate } from '../utils/helpers'
import Loading from './common/Loading'

const LineupHistory = ({ matchId }) => {
  const { getLineupHistory, getArchivedLineups, restoreLineup, loading } = useLineups()
  const [history, setHistory] = useState([])
  const [archived, setArchived] = useState([])
  const [expanded, setExpanded] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [matchId])

  const loadHistory = async () => {
    setLoadingHistory(true)
    try {
      const historyData = await getLineupHistory(matchId)
      setHistory(historyData)
      
      const archivedData = await getArchivedLineups(matchId)
      setArchived(archivedData)
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleRestore = async (lineupId) => {
    if (window.confirm('This will make this lineup the active one. Continue?')) {
      try {
        await restoreLineup(lineupId)
        await loadHistory()
      } catch (error) {
        alert('Error restoring lineup: ' + error.message)
      }
    }
  }

  const allLineups = [...history, ...archived].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  )

  const getPositionColor = (position) => {
    const colors = {
      GK: 'bg-yellow-500',
      DEF: 'bg-blue-500',
      MID: 'bg-green-500',
      FWD: 'bg-red-500'
    }
    return colors[position] || 'bg-gray-500'
  }

  if (loadingHistory || loading) {
    return <Loading size="sm" />
  }

  if (allLineups.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <History className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No lineup history for this match</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <History className="w-4 h-4 text-[#1a4d7a]" />
          Lineup History
          <span className="text-xs text-gray-400">({allLineups.length} versions)</span>
        </h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-[#1a4d7a] hover:text-[#e67e22] transition-colors flex items-center gap-1"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {!expanded ? (
        // Compact view - show latest 3
        <div className="space-y-3">
          {allLineups.slice(0, 3).map((lineup) => (
            <LineupHistoryItem 
              key={lineup.id} 
              lineup={lineup} 
              onRestore={handleRestore}
              getPositionColor={getPositionColor}
            />
          ))}
        </div>
      ) : (
        // Expanded view - show all
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {allLineups.map((lineup) => (
            <LineupHistoryItem 
              key={lineup.id} 
              lineup={lineup} 
              onRestore={handleRestore}
              getPositionColor={getPositionColor}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const LineupHistoryItem = ({ lineup, onRestore, getPositionColor }) => {
  const startingCount = lineup.lineup_players?.filter(p => p.is_starting).length || 0
  const substituteCount = lineup.lineup_players?.filter(p => p.is_substitute).length || 0
  const isActive = !lineup.archived

  return (
    <div className={`border rounded-lg p-3 ${isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-600">
              {formatDate(lineup.created_at)}
            </span>
          </div>
          <span className="text-xs font-medium text-gray-700">
            v{lineup.version}
          </span>
          {isActive && (
            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
              Active
            </span>
          )}
          <span className="text-xs text-gray-500">
            {lineup.formation || '4-4-2'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {startingCount} players • {substituteCount} subs
          </span>
          {!isActive && (
            <button
              onClick={() => onRestore(lineup.id)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Restore
            </button>
          )}
        </div>
      </div>
      
      {/* Quick preview of players */}
      <div className="mt-2 flex flex-wrap gap-1">
        {lineup.lineup_players?.filter(p => p.is_starting).slice(0, 5).map((item) => (
          <span key={item.id} className="text-xs px-2 py-0.5 bg-white rounded-full border border-gray-200 flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${getPositionColor(item.players?.position)}`}></span>
            {item.players?.display_name}
          </span>
        ))}
        {lineup.lineup_players?.filter(p => p.is_starting).length > 5 && (
          <span className="text-xs text-gray-400">
            +{lineup.lineup_players?.filter(p => p.is_starting).length - 5} more
          </span>
        )}
      </div>
    </div>
  )
}

export default LineupHistory