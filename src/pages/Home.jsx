import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Trophy, Users, Calendar, ArrowRight, Star, Award, Target, Lock, LogIn, TrendingUp, Activity } from 'lucide-react'
import { useMatches } from '../hooks/useMatches'
import { usePlayers } from '../hooks/usePlayers'
import Loading from '../components/common/Loading'
import { formatDate } from '../utils/helpers'

// Import the logo
import nchoathiLogo from '/images/nchoathi_logo.png'

const Home = () => {
  const navigate = useNavigate()
  const { matches, loading: matchesLoading, getTeamStats } = useMatches()
  const { players, loading: playersLoading } = usePlayers()
  const [teamStats, setTeamStats] = useState(null)
  const [topScorers, setTopScorers] = useState([])
  const [recentMatches, setRecentMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!matchesLoading && !playersLoading) {
      loadHomeData()
    }
  }, [matches, players, matchesLoading, playersLoading])

  const loadHomeData = async () => {
    try {
      setLoading(true)
      console.log('📊 Loading home data...')
      console.log('📊 Matches:', matches?.length)
      console.log('📊 Players:', players?.length)
      
      const stats = await getTeamStats()
      console.log('📊 Team stats:', stats)
      setTeamStats(stats)

      // Get top scorers
      const scorerMap = {}
      for (const match of matches) {
        if (match.status === 'completed') {
          if (match.match_scorers && match.match_scorers.length > 0) {
            for (const scorer of match.match_scorers) {
              const playerName = scorer.players?.display_name || 'Unknown'
              const playerId = scorer.players?.id
              if (!scorerMap[playerId]) {
                scorerMap[playerId] = {
                  id: playerId,
                  name: playerName,
                  goals: 0,
                  shirt_number: scorer.players?.shirt_number || '?'
                }
              }
              scorerMap[playerId].goals += scorer.goals || 0
            }
          }
        }
      }
      
      const scorers = Object.values(scorerMap)
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 3)
      
      console.log('📊 Top scorers found:', scorers)
      setTopScorers(scorers)

      const completedMatches = matches
        .filter(m => m.status === 'completed')
        .sort((a, b) => new Date(b.match_date) - new Date(a.match_date))
        .slice(0, 5)
      
      console.log('📊 Recent matches:', completedMatches.length)
      setRecentMatches(completedMatches)

    } catch (error) {
      console.error('❌ Error loading home data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || matchesLoading || playersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" />
      </div>
    )
  }

  const features = [
    {
      icon: Trophy,
      title: 'Match Management',
      description: `Track ${teamStats?.total || 0} matches, scores, and results in one place`
    },
    {
      icon: Users,
      title: 'Player Profiles',
      description: `Manage ${players.length} player profiles, statistics, and appearances`
    },
    {
      icon: Award,
      title: 'Top Scorers',
      description: `Track top goal scorers and assist leaders in real-time`
    },
    {
      icon: Target,
      title: 'Team Statistics',
      description: `Analyze team performance with ${teamStats?.winRate?.toFixed(1) || 0}% win rate`
    }
  ]

  const stats = [
    { label: 'Total Matches', value: teamStats?.total || 0, icon: Calendar },
    { label: 'Wins', value: teamStats?.wins || 0, icon: Trophy },
    { label: 'Players', value: players.length, icon: Users },
    { label: 'Goals Scored', value: teamStats?.goalsFor || 0, icon: Activity }
  ]

  const getResultBadge = (result) => {
    const styles = {
      win: 'bg-green-100 text-green-800',
      draw: 'bg-yellow-100 text-yellow-800',
      loss: 'bg-red-100 text-red-800'
    }
    return styles[result] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <div 
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/images/hero-bg.jpeg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#1a1a2e',
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img 
                src={nchoathiLogo} 
                alt="Nchoathi FC Logo" 
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain rounded-2xl shadow-2xl bg-white/10 p-2"
              />
            </div>
            
            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Nchoathi FC
              <span className="block text-[#e67e22]">Management System</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              The complete football management platform for tracking matches, 
              players, and statistics. Built for teams who want to stay ahead.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center justify-center px-6 py-3 bg-[#e67e22] text-white font-semibold rounded-lg hover:bg-[#d35400] transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <Trophy className="w-5 h-5 mr-2" />
                View Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
              <button
                onClick={() => navigate('/matches')}
                className="inline-flex items-center justify-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition-colors duration-200 border border-white/20"
              >
                <Calendar className="w-5 h-5 mr-2" />
                View Matches
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/10">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center">
                    <Icon className="w-6 h-6 text-[#e67e22] mx-auto mb-1" />
                    <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </div>
      </div>

      {/* Top Scorers & Recent Matches Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Scorers */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#e67e22]" />
                Top Scorers
              </h3>
              {topScorers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No scorers yet</p>
                  <p className="text-xs text-gray-400 mt-1">Goals will appear here once matches are completed</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topScorers.map((scorer, index) => (
                    <div key={scorer.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-300 text-gray-700' :
                          'bg-amber-600 text-white'
                        }`}>
                          {index + 1}
                        </span>
                        <div>
                          <span className="font-medium text-gray-900">{scorer.name}</span>
                          <span className="text-xs text-gray-500 ml-2">#{scorer.shirt_number}</span>
                        </div>
                      </div>
                      <span className="text-xl font-bold text-[#e67e22]">{scorer.goals}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Matches */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Recent Matches
              </h3>
              {recentMatches.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No matches yet</p>
              ) : (
                <div className="space-y-3">
                  {recentMatches.map((match) => (
                    <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">Econet</span>
                          <span className="text-xs text-gray-400">vs</span>
                          <span className="font-medium text-gray-700">{match.opponent}</span>
                        </div>
                        <p className="text-xs text-gray-500">{formatDate(match.match_date)}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">
                          {match.home_score} - {match.away_score}
                        </span>
                        <span className={`ml-2 inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getResultBadge(match.result)}`}>
                          {match.result?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Nchoathi FC?</h2>
            <p className="text-gray-600 mt-2">Everything you need to manage your football team</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow duration-200 border border-gray-100">
                  <div className="w-12 h-12 bg-[#1a4d7a]/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[#1a4d7a]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-[#1a1a2e]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to take control?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join Nchoathi FC Management System and start managing your team like a pro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center px-6 py-3 bg-[#e67e22] text-white font-semibold rounded-lg hover:bg-[#d35400] transition-colors duration-200"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </button>
            <button
              onClick={() => navigate('/matches')}
              className="inline-flex items-center justify-center px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors duration-200 border border-white/20"
            >
              <Star className="w-5 h-5 mr-2" />
              Browse Matches
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0f0f1a] py-8 border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 sm:mb-0">
              <img 
                src={nchoathiLogo} 
                alt="Nchoathi FC Logo" 
                className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
              />
              <span className="text-white font-semibold">Nchoathi FC</span>
              <span className="text-gray-500 text-sm">Management System</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>© 2026 Nchoathi FC</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home