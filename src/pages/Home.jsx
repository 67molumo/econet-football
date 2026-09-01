import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Trophy, Users, Calendar, ArrowRight, Star, Award, Target, Lock, LogIn, TrendingUp, Activity } from 'lucide-react'
import { useMatches } from '../hooks/useMatches'
import { usePlayers } from '../hooks/usePlayers'
import Loading from '../components/common/Loading'
import { formatDate } from '../utils/helpers'

// Import the logo
import nchoathiLogo from '/images/nchoathi_logo.png'

// Display face used for scores, numerals and headings; body copy stays on Inter.
// Add to index.html <head>:
// <link rel="preconnect" href="https://fonts.googleapis.com">
// <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
const DISPLAY_FONT = "'Oswald', sans-serif"
const BODY_FONT = "'Inter', sans-serif"

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
      <div className="min-h-screen flex items-center justify-center bg-[#f6f4ef]">
        <Loading size="lg" />
      </div>
    )
  }

  const features = [
    {
      icon: Trophy,
      title: 'Match management',
      description: `Track ${teamStats?.total || 0} matches, scores, and results in one place`
    },
    {
      icon: Users,
      title: 'Player profiles',
      description: `Manage ${players.length} player profiles, statistics, and appearances`
    },
    {
      icon: Award,
      title: 'Top scorers',
      description: `Track top goal scorers and assist leaders in real time`
    },
    {
      icon: Target,
      title: 'Team statistics',
      description: `Analyze team performance with a ${teamStats?.winRate?.toFixed(1) || 0}% win rate`
    }
  ]

  const stats = [
    { label: 'Matches played', value: teamStats?.total || 0 },
    { label: 'Wins', value: teamStats?.wins || 0 },
    { label: 'Squad size', value: players.length },
    { label: 'Goals scored', value: teamStats?.goalsFor || 0 }
  ]

  const resultStyles = {
    win: { bg: '#eaf3ec', text: '#1c5c3f', dot: '#2f8558' },
    draw: { bg: '#f8f0e2', text: '#8a6a1f', dot: '#c99a2e' },
    loss: { bg: '#f6ecea', text: '#9c3b3b', dot: '#b1503f' }
  }

  const getResultStyle = (result) => resultStyles[result] || { bg: '#eef0f2', text: '#5b6472', dot: '#8a97a3' }

  return (
    <div className="min-h-screen" style={{ fontFamily: BODY_FONT }}>
      {/* Hero Section with Background Image */}
      <div
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/images/hero-bg.jpeg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#0b1f2e',
        }}
      >
        {/* Stadium-toned overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(11,31,46,0.88) 0%, rgba(11,31,46,0.72) 45%, rgba(11,31,46,0.92) 100%)' }}
        ></div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img
                src={nchoathiLogo}
                alt="Nchoathi FC Logo"
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain p-2"
                style={{ border: '1px solid rgba(230,126,34,0.5)', borderRadius: '4px' }}
              />
            </div>

            {/* Title */}
<h1
  className="text-4xl sm:text-5xl lg:text-6xl text-white mb-5 leading-[1.05]"
  style={{
    fontFamily: DISPLAY_FONT,
    fontWeight: 600,
    letterSpacing: '0.01em'
  }}
>
  Nchoathi FC
  <span className="block text-[#e67e22]">Football Hub</span>
</h1>

<p
  className="text-base sm:text-lg mb-10 max-w-xl mx-auto"
  style={{ color: '#c3ccd4' }}
>
  Everything Nchoathi FC, all in one place.
  <br />
  Track matches, manage players, follow performance, and
  <br className="hidden sm:block" />
  keep the team moving forward.
</p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center justify-center px-7 py-3 bg-[#e67e22] text-white font-medium hover:bg-[#d35400] transition-colors duration-200"
                style={{ borderRadius: '3px' }}
              >
                <Trophy className="w-4 h-4 mr-2" />
                View dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
              <button
                onClick={() => navigate('/matches')}
                className="inline-flex items-center justify-center px-7 py-3 text-white font-medium transition-colors duration-200"
                style={{ borderRadius: '3px', border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.04)' }}
              >
                <Calendar className="w-4 h-4 mr-2" />
                View matches
              </button>
            </div>

            {/* Scoreboard strip */}
            <div className="flex justify-center mt-16 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
              <div className="flex divide-x" style={{ borderColor: 'rgba(255,255,255,0.14)' }}>
                {stats.map((stat, index) => (
                  <div key={index} className="text-center px-6 sm:px-8 first:pl-0 last:pr-0">
                    <p
                      className="text-3xl sm:text-4xl text-white"
                      style={{ fontFamily: DISPLAY_FONT, fontWeight: 500 }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-xs sm:text-sm mt-1" style={{ color: '#8a97a3' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Scorers & Recent Matches Section */}
      <div className="py-20" style={{ backgroundColor: '#f6f4ef' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Top Scorers */}
            <div className="bg-white p-7" style={{ border: '1px solid #e5e1d8', borderRadius: '4px' }}>
              <h3
                className="text-xl mb-5 flex items-center gap-2 text-[#0b1f2e]"
                style={{ fontFamily: DISPLAY_FONT, fontWeight: 500 }}
              >
                <Award className="w-5 h-5 text-[#e67e22]" />
                Top scorers
              </h3>
              {topScorers.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-600">No scorers yet</p>
                  <p className="text-xs text-gray-400 mt-1">Goals will appear here once matches are completed</p>
                </div>
              ) : (
                <div>
                  {topScorers.map((scorer, index) => (
                    <div
                      key={scorer.id || index}
                      className="flex items-center justify-between py-3"
                      style={{ borderTop: index === 0 ? 'none' : '1px solid #ece8de' }}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className="flex items-center justify-center w-9 h-9 text-sm text-[#1a4d7a]"
                          style={{
                            fontFamily: DISPLAY_FONT,
                            fontWeight: 600,
                            border: '1.5px solid #1a4d7a',
                            borderRadius: '3px'
                          }}
                        >
                          {scorer.shirt_number}
                        </span>
                        <div>
                          <p className="font-medium text-[#0b1f2e]">{scorer.name}</p>
                          <p className="text-xs text-gray-400">Rank {index + 1}</p>
                        </div>
                      </div>
                      <span
                        className="text-2xl text-[#e67e22]"
                        style={{ fontFamily: DISPLAY_FONT, fontWeight: 600 }}
                      >
                        {scorer.goals}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Matches */}
            <div className="bg-white p-7" style={{ border: '1px solid #e5e1d8', borderRadius: '4px' }}>
              <h3
                className="text-xl mb-5 flex items-center gap-2 text-[#0b1f2e]"
                style={{ fontFamily: DISPLAY_FONT, fontWeight: 500 }}
              >
                <Calendar className="w-5 h-5 text-[#1a4d7a]" />
                Recent matches
              </h3>
              {recentMatches.length === 0 ? (
                <p className="text-gray-600 text-center py-10">No matches yet</p>
              ) : (
                <div>
                  {recentMatches.map((match, index) => {
                    const style = getResultStyle(match.result)
                    return (
                      <div
                        key={match.id}
                        className="flex items-center justify-between py-3"
                        style={{ borderTop: index === 0 ? 'none' : '1px solid #ece8de' }}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#0b1f2e]">Econet</span>
                            <span className="text-xs text-gray-400">vs</span>
                            <span className="text-gray-700">{match.opponent}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{formatDate(match.match_date)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className="text-xl text-[#0b1f2e]"
                            style={{ fontFamily: DISPLAY_FONT, fontWeight: 500 }}
                          >
                            {match.home_score} – {match.away_score}
                          </span>
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium"
                            style={{ backgroundColor: style.bg, color: style.text, borderRadius: '3px' }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.dot }}></span>
                            {match.result === 'win' ? 'Win' : match.result === 'draw' ? 'Draw' : match.result === 'loss' ? 'Loss' : match.result}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <h2 className="text-3xl text-[#0b1f2e]" style={{ fontFamily: DISPLAY_FONT, fontWeight: 500 }}>
              Why Nchoathi FC
            </h2>
            <p className="text-gray-600 mt-3">Everything you need to run a football club, in one place.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="flex gap-4 pl-5" style={{ borderLeft: '2px solid #e67e22' }}>
                  <Icon className="w-5 h-5 text-[#1a4d7a] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg text-[#0b1f2e] mb-1.5" style={{ fontFamily: DISPLAY_FONT, fontWeight: 500 }}>
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20" style={{ backgroundColor: '#0b1f2e' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl text-white mb-4" style={{ fontFamily: DISPLAY_FONT, fontWeight: 500 }}>
            Ready to take control?
          </h2>
          <p className="mb-9 max-w-xl mx-auto" style={{ color: '#8a97a3' }}>
            Join Nchoathi FC Management System and start managing your team like a pro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center px-7 py-3 bg-[#e67e22] text-white font-medium hover:bg-[#d35400] transition-colors duration-200"
              style={{ borderRadius: '3px' }}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign in
            </button>
            <button
              onClick={() => navigate('/matches')}
              className="inline-flex items-center justify-center px-7 py-3 text-white font-medium transition-colors duration-200"
              style={{ borderRadius: '3px', border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.04)' }}
            >
              <Star className="w-4 h-4 mr-2" />
              Browse matches
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8" style={{ backgroundColor: '#08161f', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 sm:mb-0">
              <img
                src={nchoathiLogo}
                alt="Nchoathi FC Logo"
                className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
              />
              <span className="text-white font-medium">Nchoathi FC</span>
              <span className="text-sm" style={{ color: '#5b6472' }}>Management System</span>
            </div>
            <div className="flex items-center gap-6 text-sm" style={{ color: '#5b6472' }}>
              <span>© 2026 Nchoathi FC</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home