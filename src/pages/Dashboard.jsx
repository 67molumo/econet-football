import React, { useState, useEffect } from 'react'
import { Trophy, Users, Calendar, TrendingUp, Activity } from 'lucide-react'
import { useMatches } from '../hooks/useMatches'
import { usePlayers } from '../hooks/usePlayers'
import StatCard from '../components/Dashboard/StatCard'
import RecentMatches from '../components/Dashboard/RecentMatches'
import TopScorers from '../components/Dashboard/TopScorers'
import Loading from '../components/common/Loading'

const Dashboard = () => {
  const { matches, loading: matchesLoading } = useMatches()
  const { players, loading: playersLoading } = usePlayers()
  const [stats, setStats] = useState({
    total: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    winRate: 0,
    goalsFor: 0,
    goalsAgainst: 0
  })

  useEffect(() => {
    if (matches.length > 0) {
      const completedMatches = matches.filter(m => m.status === 'completed')
      const wins = completedMatches.filter(m => m.result === 'win').length
      const draws = completedMatches.filter(m => m.result === 'draw').length
      const losses = completedMatches.filter(m => m.result === 'loss').length
      const total = completedMatches.length
      
      const goalsFor = completedMatches.reduce((sum, m) => sum + (m.home_score || 0), 0)
      const goalsAgainst = completedMatches.reduce((sum, m) => sum + (m.away_score || 0), 0)

      setStats({
        total,
        wins,
        draws,
        losses,
        winRate: total > 0 ? ((wins / total) * 100) : 0,
        goalsFor,
        goalsAgainst
      })
    }
  }, [matches])

  if (matchesLoading || playersLoading) {
    return (
      <div className="flex justify-center items-center h-48 sm:h-64">
        <Loading size="md" />
      </div>
    )
  }

  const statCards = [
    { label: 'Total Matches', value: stats.total, icon: Calendar, color: 'text-blue-600', subtitle: `${stats.wins}W • ${stats.draws}D • ${stats.losses}L` },
    { label: 'Wins', value: stats.wins, icon: Trophy, color: 'text-green-600' },
    { label: 'Win Rate', value: `${stats.winRate.toFixed(1)}%`, icon: TrendingUp, color: 'text-orange-600' },
    { label: 'Goals', value: stats.goalsFor, icon: Activity, color: 'text-purple-600', subtitle: `Conceded: ${stats.goalsAgainst}` },
  ]

  return (
    <div>
      <div className="mb-3 sm:mb-4">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-xs sm:text-sm text-gray-500">Welcome to Econet Football Management System</p>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Recent Matches and Top Scorers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base mb-2 sm:mb-3">Recent Matches</h3>
          <RecentMatches matches={matches} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base mb-2 sm:mb-3">Top Scorers</h3>
          <TopScorers />
        </div>
      </div>
    </div>
  )
}

export default Dashboard