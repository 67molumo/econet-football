import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

export function useMatches(filters = {}) {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMatches()
  }, [JSON.stringify(filters)])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('matches')
        .select(`
          *,
          venues (id, name),
          competitions (id, name, season)
        `)
        .order('match_date', { ascending: false })

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.result) {
        query = query.eq('result', filters.result)
      }
      if (filters.competition) {
        query = query.eq('competition_id', filters.competition)
      }
      if (filters.search) {
        query = query.ilike('opponent', `%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) throw error
      setMatches(data || [])
    } catch (err) {
      console.error('Error fetching matches:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addMatch = async (matchData) => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .insert([matchData])
        .select(`
          *,
          venues (id, name),
          competitions (id, name, season)
        `)
      
      if (error) throw error
      await fetchMatches()
      return data[0]
    } catch (err) {
      console.error('Error adding match:', err)
      throw err
    }
  }

  const updateMatch = async (id, matchData) => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .update(matchData)
        .eq('id', id)
        .select(`
          *,
          venues (id, name),
          competitions (id, name, season)
        `)
      
      if (error) throw error
      await fetchMatches()
      return data[0]
    } catch (err) {
      console.error('Error updating match:', err)
      throw err
    }
  }

  const deleteMatch = async (id) => {
    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await fetchMatches()
      return true
    } catch (err) {
      console.error('Error deleting match:', err)
      throw err
    }
  }

  const getMatchById = async (id) => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          venues (id, name, location),
          competitions (id, name, season, description),
          match_scorers (
            id,
            goals,
            players (id, display_name, shirt_number, position)
          ),
          match_assists (
            id,
            assists,
            players (id, display_name, shirt_number, position)
          ),
          player_cards (
            id,
            card_type,
            minute,
            players (id, display_name, shirt_number)
          )
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    } catch (err) {
      console.error('Error fetching match details:', err)
      throw err
    }
  }

  const addMatchScorer = async (scorerData) => {
    try {
      const { data, error } = await supabase
        .from('match_scorers')
        .insert([scorerData])
        .select()
      
      if (error) throw error
      return data[0]
    } catch (err) {
      console.error('Error adding match scorer:', err)
      throw err
    }
  }

  const removeMatchScorer = async (id) => {
    try {
      const { error } = await supabase
        .from('match_scorers')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (err) {
      console.error('Error removing match scorer:', err)
      throw err
    }
  }

  const addMatchAssist = async (assistData) => {
    try {
      const { data, error } = await supabase
        .from('match_assists')
        .insert([assistData])
        .select()
      
      if (error) throw error
      return data[0]
    } catch (err) {
      console.error('Error adding match assist:', err)
      throw err
    }
  }

  const removeMatchAssist = async (id) => {
    try {
      const { error } = await supabase
        .from('match_assists')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (err) {
      console.error('Error removing match assist:', err)
      throw err
    }
  }

  const addPlayerCard = async (cardData) => {
    try {
      const { data, error } = await supabase
        .from('player_cards')
        .insert([cardData])
        .select()
      
      if (error) throw error
      return data[0]
    } catch (err) {
      console.error('Error adding player card:', err)
      throw err
    }
  }

  const removePlayerCard = async (id) => {
    try {
      const { error } = await supabase
        .from('player_cards')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (err) {
      console.error('Error removing player card:', err)
      throw err
    }
  }

  const getTeamStats = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'completed')
      
      if (error) throw error
      
      const completedMatches = data || []
      const total = completedMatches.length
      const wins = completedMatches.filter(m => m.result === 'win').length
      const draws = completedMatches.filter(m => m.result === 'draw').length
      const losses = completedMatches.filter(m => m.result === 'loss').length
      const goalsFor = completedMatches.reduce((sum, m) => sum + (m.home_score || 0), 0)
      const goalsAgainst = completedMatches.reduce((sum, m) => sum + (m.away_score || 0), 0)
      
      return {
        total,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        winRate: total > 0 ? ((wins / total) * 100) : 0
      }
    } catch (err) {
      console.error('Error fetching team stats:', err)
      throw err
    }
  }

  const getHeadToHead = async (opponent) => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('opponent', opponent)
        .eq('status', 'completed')
        .order('match_date', { ascending: false })
      
      if (error) throw error
      
      const matches = data || []
      const total = matches.length
      const wins = matches.filter(m => m.result === 'win').length
      const draws = matches.filter(m => m.result === 'draw').length
      const losses = matches.filter(m => m.result === 'loss').length
      const goalsFor = matches.reduce((sum, m) => sum + (m.home_score || 0), 0)
      const goalsAgainst = matches.reduce((sum, m) => sum + (m.away_score || 0), 0)
      
      return {
        opponent,
        total,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        matches
      }
    } catch (err) {
      console.error('Error fetching head to head:', err)
      throw err
    }
  }

  return {
    matches,
    loading,
    error,
    fetchMatches,
    addMatch,
    updateMatch,
    deleteMatch,
    getMatchById,
    addMatchScorer,
    removeMatchScorer,
    addMatchAssist,
    removeMatchAssist,
    addPlayerCard,
    removePlayerCard,
    getTeamStats,
    getHeadToHead,
    refreshMatches: fetchMatches
  }
}