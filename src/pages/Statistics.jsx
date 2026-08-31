import React, { useState, useEffect } from 'react'
import { Trophy, Users, Calendar, TrendingUp, Award, Target, Shield, Crown } from 'lucide-react'
import { useMatches } from '../hooks/useMatches'
import { usePlayers } from '../hooks/usePlayers'
import Loading from '../components/common/Loading'
import StatCard from '../components/Dashboard/StatCard'
import supabase from '../lib/supabase'

const Statistics = () => {
  const { matches, loading: matchesLoading, getTeamStats, getHeadToHead } = useMatches()
  const { players, loading: playersLoading } = usePlayers()
  const [teamStats, setTeamStats] = useState(null)
  const [headToHead, setHeadToHead] = useState([])
  const [topScorers, setTopScorers] = useState([])
  const [topAssists, setTopAssists] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (matches.length > 0) {
      calculateStats()
      fetchTopScorersAndAssists()
    }
  }, [matches])

  const calculateStats = async () => {
    try {
      // Team Stats
      const stats = await getTeamStats()
      setTeamStats(stats)

      // Get unique opponents
      const opponents = [...new Set(matches.map(m => m.opponent))]
      const h2h = []
      for (const opp of opponents) {
        const data = await getHeadToHead(opp)
        if (data.total > 0) {
          h2h.push(data)
        }
      }
      setHeadToHead(h2h.slice(0, 10)) // Top 10 opponents
    } catch (error) {
      console.error('Error calculating stats:', error)
    }
  }

  const fetchTopScorersAndAssists = async () => {
    try {
      setLoadingStats(true)
      
      // Get all match scorers with player info
      const { data: scorersData, error: scorersError } = await supabase
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

      if (scorersError) throw scorersError

      // Aggregate goals by player
      const playerGoals = {}
      scorersData?.forEach(item => {
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

      // Get top 10 scorers
      const sortedScorers = Object.values(playerGoals)
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 10)

      setTopScorers(sortedScorers)

      // Get assists data
      const { data: assistsData, error: assistsError } = await supabase
        .from('match_assists')
        .select(`
          assists,
          players (
            id,
            display_name,
            shirt_number,
            position
          )
        `)

      if (assistsError) throw assistsError

      // Aggregate assists by player
      const playerAssists = {}
      assistsData?.forEach(item => {
        const player = item.players
        if (player && player.id) {
          if (!playerAssists[player.id]) {
            playerAssists[player.id] = {
              id: player.id,
              name: player.display_name,
              shirt_number: player.shirt_number,
              position: player.position || 'N/A',
              assists: 0
            }
          }
          playerAssists[player.id].assists += item.assists || 0
        }
      })

      const sortedAssists = Object.values(playerAssists)
        .sort((a, b) => b.assists - a.assists)
        .slice(0, 10)

      setTopAssists(sortedAssists)

    } catch (error) {
      console.error('Error fetching top scorers:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  // Helper to get position label
  const getPositionLabel = (position) => {
    const positions = {
      GK: 'Goalkeeper',
      DEF: 'Defender',
      MID: 'Midfielder',
      FWD: 'Forward'
    }
    return positions[position] || position || 'N/A'
  }

  if (matchesLoading || playersLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading size="lg" />
      </div>
    )
  }

  const statCards = teamStats ? [
    { label: 'Total Matches', value: teamStats.total, icon: Calendar, color: 'text-blue-600' },
    { label: 'Wins', value: teamStats.wins, icon: Trophy, color: 'text-green-600' },
    { label: 'Draws', value: teamStats.draws, icon: Users, color: 'text-yellow-600' },
    { label: 'Losses', value: teamStats.losses, icon: Shield, color: 'text-red-600' },
    { label: 'Goals For', value: teamStats.goalsFor, icon: Target, color: 'text-purple-600' },
    { label: 'Goals Against', value: teamStats.goalsAgainst, icon: Target, color: 'text-orange-600' },
    { label: 'Win Rate', value: `${teamStats.winRate.toFixed(1)}%`, icon: TrendingUp, color: 'text-green-600' },
  ] : []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
        <p className="text-gray-500">Team and player performance analytics</p>
      </div>

      {/* Team Stats */}
      {teamStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Scorers */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#e67e22]" />
            Top Goal Scorers
          </h3>
          {loadingStats ? (
            <div className="flex justify-center py-8">
              <Loading size="md" />
            </div>
          ) : topScorers.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No scorers yet</p>
          ) : (
            <div className="space-y-2">
              {topScorers.map((player, index) => (
                <div key={player.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-amber-600 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#1a4d7a] text-white flex items-center justify-center text-xs font-bold">
                          {player.shirt_number || '?'}
                        </span>
                        <span className="font-medium text-gray-900">{player.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{getPositionLabel(player.position)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-[#e67e22]">{player.goals}</span>
                    <span className="text-xs text-gray-400">goals</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Assists */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            Top Assists
          </h3>
          {loadingStats ? (
            <div className="flex justify-center py-8">
              <Loading size="md" />
            </div>
          ) : topAssists.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No assists yet</p>
          ) : (
            <div className="space-y-2">
              {topAssists.map((player, index) => (
                <div key={player.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-amber-600 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                          {player.shirt_number || '?'}
                        </span>
                        <span className="font-medium text-gray-900">{player.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{getPositionLabel(player.position)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-blue-600">{player.assists}</span>
                    <span className="text-xs text-gray-400">assists</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Head to Head */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Head to Head
        </h3>
        {headToHead.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opponent</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">P</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">W</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">D</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">L</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">GF</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">GA</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">GD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {headToHead.map((opp, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{opp.opponent}</td>
                    <td className="px-4 py-2 text-sm text-center text-gray-600">{opp.total}</td>
                    <td className="px-4 py-2 text-sm text-center text-green-600 font-medium">{opp.wins}</td>
                    <td className="px-4 py-2 text-sm text-center text-yellow-600 font-medium">{opp.draws}</td>
                    <td className="px-4 py-2 text-sm text-center text-red-600 font-medium">{opp.losses}</td>
                    <td className="px-4 py-2 text-sm text-center text-gray-700">{opp.goalsFor}</td>
                    <td className="px-4 py-2 text-sm text-center text-gray-700">{opp.goalsAgainst}</td>
                    <td className={`px-4 py-2 text-sm text-center font-medium ${
                      opp.goalsFor - opp.goalsAgainst > 0 ? 'text-green-600' : 
                      opp.goalsFor - opp.goalsAgainst < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {opp.goalsFor - opp.goalsAgainst > 0 ? '+' : ''}{opp.goalsFor - opp.goalsAgainst}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Statistics