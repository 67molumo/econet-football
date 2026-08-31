import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

export function useStatistics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      
      // Get all completed matches
      const { data: matches, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'completed')

      if (matchError) throw matchError

      // Calculate team statistics
      const total = matches?.length || 0
      const wins = matches?.filter(m => m.result === 'win').length || 0
      const draws = matches?.filter(m => m.result === 'draw').length || 0
      const losses = matches?.filter(m => m.result === 'loss').length || 0
      const goalsFor = matches?.reduce((sum, m) => sum + (m.home_score || 0), 0) || 0
      const goalsAgainst = matches?.reduce((sum, m) => sum + (m.away_score || 0), 0) || 0
      const winRate = total > 0 ? ((wins / total) * 100) : 0

      // Get top scorers
      const { data: scorers, error: scorerError } = await supabase
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

      if (scorerError) throw scorerError

      // Aggregate goals by player
      const playerGoals = {}
      scorers?.forEach(s => {
        const playerId = s.players?.id
        if (playerId) {
          if (!playerGoals[playerId]) {
            playerGoals[playerId] = {
              name: s.players.display_name,
              shirt_number: s.players.shirt_number,
              position: s.players.position,
              goals: 0
            }
          }
          playerGoals[playerId].goals += s.goals || 0
        }
      })

      const topScorers = Object.values(playerGoals)
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 10)

      // Get head to head stats
      const opponents = [...new Set(matches?.map(m => m.opponent) || [])]
      const headToHead = opponents.map(opp => {
        const oppMatches = matches?.filter(m => m.opponent === opp) || []
        return {
          opponent: opp,
          total: oppMatches.length,
          wins: oppMatches.filter(m => m.result === 'win').length,
          draws: oppMatches.filter(m => m.result === 'draw').length,
          losses: oppMatches.filter(m => m.result === 'loss').length,
          goalsFor: oppMatches.reduce((sum, m) => sum + (m.home_score || 0), 0),
          goalsAgainst: oppMatches.reduce((sum, m) => sum + (m.away_score || 0), 0)
        }
      }).sort((a, b) => b.total - a.total)

      setStats({
        team: {
          total,
          wins,
          draws,
          losses,
          goalsFor,
          goalsAgainst,
          winRate,
          goalDifference: goalsFor - goalsAgainst
        },
        topScorers,
        headToHead
      })
    } catch (err) {
      console.error('Error fetching statistics:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    stats,
    loading,
    error,
    refreshStatistics: fetchStatistics
  }
}