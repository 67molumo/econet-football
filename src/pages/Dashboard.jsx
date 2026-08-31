import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Trophy, Users, Calendar, TrendingUp, Activity, Lock } from 'lucide-react'
import { useMatches } from '../hooks/useMatches'
import { usePlayers } from '../hooks/usePlayers'
import StatCard from '../components/Dashboard/StatCard'
import RecentMatches from '../components/Dashboard/RecentMatches'
import TopScorers from '../components/Dashboard/TopScorers'
import Loading from '../components/common/Loading'

const Dashboard = () => {
  // Get isAdmin and role from outlet context
  const { isAdmin, role } = useOutletContext()
  console.log('📊 Dashboard - isAdmin:', isAdmin, 'role:', role)

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

  // Check if user has admin or manager role
  const hasAccess = isAdmin || role === 'manager'

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-xs sm:text-sm text-gray-500">
              {hasAccess 
                ? 'Welcome to Econet Football Management System' 
                : 'View Econet Football Club statistics and updates'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Only Badge */}
            {!hasAccess && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
                <Lock className="w-3 h-3" />
                <span>View Only</span>
              </div>
            )}
            
            {/* Manager Badge */}
            {role === 'manager' && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span>Manager</span>
              </div>
            )}
            
            {/* Admin Badge */}
            {isAdmin && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span>Admin</span>
              </div>
            )}
          </div>
        </div>
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
          <RecentMatches matches={matches} isAdmin={hasAccess} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base mb-2 sm:mb-3">Top Scorers</h3>
          <TopScorers />
        </div>
      </div>

      {/* Role Specific Section - Hidden from public */}
      {hasAccess && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg border">
          {isAdmin ? (
            // Admin Message
            <div className="bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <span>🔑</span>
                <span>You have full access to manage matches, players, and statistics</span>
              </div>
            </div>
          ) : role === 'manager' ? (
            // Manager Message
            <div className="bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <span>📋</span>
                <span>You have access to manage matches and players</span>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Public User Message */}
      {!hasAccess && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>👁️</span>
            <span>You are viewing the dashboard in read-only mode. Sign in for full access.</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard