import React, { useState, useEffect } from 'react'
import supabase from '../../lib/supabase'

const TopScorers = () => {
  const [topScorers, setTopScorers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopScorers()
  }, [])

  const fetchTopScorers = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('match_scorers')
        .select(`
          goals,
          players (
            id,
            display_name,
            shirt_number,
            position
          )
        `)

      if (error) throw error

      const playerGoals = {}
      data?.forEach(item => {
        const player = item.players
        if (player && player.id) {
          if (!playerGoals[player.id]) {
            playerGoals[player.id] = {
              id: player.id,
              name: player.display_name,
              shirt_number: player.shirt_number,
              position: player.position || 'N/A',
              goals: 0
            }
          }
          playerGoals[player.id].goals += item.goals || 0
        }
      })

      const sortedScorers = Object.values(playerGoals)
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 5)

      setTopScorers(sortedScorers)
    } catch (err) {
      console.error('Error fetching top scorers:', err)
    } finally {
      setLoading(false)
    }
  }

  const getPositionLabel = (position) => {
    const positions = {
      GK: 'Goalkeeper',
      DEF: 'Defender',
      MID: 'Midfielder',
      FWD: 'Forward'
    }
    return positions[position] || position || 'N/A'
  }

  if (loading) {
    return <div className="text-center py-3 sm:py-4 text-gray-500 text-xs sm:text-sm">Loading...</div>
  }

  if (topScorers.length === 0) {
    return <div className="text-center py-3 sm:py-4 text-gray-500 text-xs sm:text-sm">No scorers yet</div>
  }

  return (
    <div className="space-y-1.5 sm:space-y-2">
      {topScorers.map((player, index) => (
        <div key={player.id} className="flex items-center justify-between p-2 sm:p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] sm:text-xs font-bold flex-shrink-0 ${
              index === 0 ? 'bg-yellow-400 text-yellow-900' :
              index === 1 ? 'bg-gray-300 text-gray-700' :
              index === 2 ? 'bg-amber-600 text-white' :
              'bg-gray-200 text-gray-600'
            }`}>
              {index + 1}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#1a4d7a] text-white flex items-center justify-center text-[9px] sm:text-xs font-bold flex-shrink-0">
                  {player.shirt_number || '?'}
                </span>
                <span className="font-medium text-gray-900 text-xs sm:text-sm truncate">{player.name}</span>
              </div>
              <span className="text-[9px] sm:text-xs text-gray-500 hidden sm:inline">{getPositionLabel(player.position)}</span>
            </div>
          </div>
          <span className="text-base sm:text-lg font-bold text-[#e67e22] flex-shrink-0">{player.goals}</span>
        </div>
      ))}
    </div>
  )
}

export default TopScorers