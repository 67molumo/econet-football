import React, { useState, useEffect } from 'react'
import { User, Award, Calendar, Shield, Target, TrendingUp } from 'lucide-react'
import { usePlayers } from '../../hooks/usePlayers'
import { useMatches } from '../../hooks/useMatches'
import supabase from '../../lib/supabase'
import Loading from '../common/Loading'
import { formatDate } from '../../utils/helpers'

const PlayerProfile = ({ playerId, onClose }) => {
  const [player, setPlayer] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentMatches, setRecentMatches] = useState([])
  const { getPlayerStats } = usePlayers()
  const { getMatchById } = useMatches()

  useEffect(() => {
    loadPlayerData()
  }, [playerId])

  const loadPlayerData = async () => {
    try {
      setLoading(true)
      
      // Get player details
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single()
      
      if (playerError) throw playerError
      setPlayer(playerData)

      // Get player stats using the database function
      const statsData = await getPlayerStats(playerId)
      setStats(statsData || { total_matches: 0, total_goals: 0, total_assists: 0, yellow_cards: 0, red_cards: 0 })

      // Get recent matches where player appeared
      const { data: appearances, error: appError } = await supabase
        .from('player_appearances')
        .select(`
          match_id,
          matches (
            id,
            opponent,
            match_date,
            home_score,
            away_score,
            result,
            venues (name)
          )
        `)
        .eq('player_id', playerId)
        .order('match_date', { foreignTable: 'matches', ascending: false })
        .limit(5)

      if (!appError && appearances) {
        setRecentMatches(appearances.map(a => a.matches).filter(Boolean))
      }

    } catch (error) {
      console.error('Error loading player profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPositionColor = (position) => {
    const colors = {
      GK: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      DEF: 'bg-blue-100 text-blue-800 border-blue-200',
      MID: 'bg-green-100 text-green-800 border-green-200',
      FWD: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[position] || 'bg-gray-100 text-gray-800'
  }

  const getResultBadge = (result) => {
    const styles = {
      win: 'bg-green-100 text-green-800',
      draw: 'bg-yellow-100 text-yellow-800',
      loss: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800'
    }
    return styles[result] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loading size="lg" />
      </div>
    )
  }

  if (!player) {
    return (
      <div className="text-center py-12 text-gray-500">
        Player not found
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Player Header */}
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-[#1a4d7a] text-white flex items-center justify-center text-4xl font-bold">
          {player.shirt_number || '?'}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{player.display_name}</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full border ${getPositionColor(player.position)}`}>
              {player.position || 'N/A'}
            </span>
            {player.is_active ? (
              <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Active
              </span>
            ) : (
              <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                Inactive
              </span>
            )}
          </div>
          {player.joined_date && (
            <p className="text-sm text-gray-500 mt-1">
              Joined: {formatDate(player.joined_date)}
            </p>
          )}
        </div>
      </div>

      {/* Player Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats?.total_matches || 0}</p>
          <p className="text-xs text-gray-500">Appearances</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-[#e67e22]">{stats?.total_goals || 0}</p>
          <p className="text-xs text-gray-500">Goals</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats?.total_assists || 0}</p>
          <p className="text-xs text-gray-500">Assists</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <Shield className="w-4 h-4 text-yellow-500" />
            <span className="text-xl font-bold text-gray-900">{stats?.yellow_cards || 0}</span>
            <Shield className="w-4 h-4 text-red-500 ml-2" />
            <span className="text-xl font-bold text-gray-900">{stats?.red_cards || 0}</span>
          </div>
          <p className="text-xs text-gray-500">Cards (Y/R)</p>
        </div>
      </div>

      {/* Recent Matches */}
      {recentMatches.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            Recent Matches
          </h4>
          <div className="space-y-2">
            {recentMatches.map((match) => (
              <div key={match.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Econet vs {match.opponent}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(match.match_date)} • {match.venues?.name || 'TBC'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {match.status === 'completed' ? (
                    <>
                      <span className="text-sm font-bold text-gray-900">
                        {match.home_score} - {match.away_score}
                      </span>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getResultBadge(match.result)}`}>
                        {match.result?.toUpperCase()}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-500">{match.status?.toUpperCase()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Player Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Player Information</h4>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-gray-500">Full Name</dt>
            <dd className="font-medium text-gray-900">
              {player.first_name || player.last_name ? 
                `${player.first_name || ''} ${player.last_name || ''}`.trim() : 
                player.display_name
              }
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Shirt Number</dt>
            <dd className="font-medium text-gray-900">{player.shirt_number || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Position</dt>
            <dd className="font-medium text-gray-900">{player.position || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Status</dt>
            <dd className="font-medium text-gray-900">
              {player.is_active ? 'Active' : 'Inactive'}
            </dd>
          </div>
          {player.joined_date && (
            <div className="col-span-2">
              <dt className="text-gray-500">Joined</dt>
              <dd className="font-medium text-gray-900">{formatDate(player.joined_date)}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}

export default PlayerProfile