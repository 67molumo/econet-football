import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

export function usePlayers() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('shirt_number', { ascending: true })

      if (error) throw error
      setPlayers(data || [])
    } catch (err) {
      console.error('Error fetching players:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getPlayerStats = async (playerId) => {
    try {
      // Get player stats from match_scorers, match_assists, player_appearances
      const { data: scorers, error: scorerError } = await supabase
        .from('match_scorers')
        .select('goals')
        .eq('player_id', playerId)

      if (scorerError) throw scorerError

      const { data: assists, error: assistError } = await supabase
        .from('match_assists')
        .select('assists')
        .eq('player_id', playerId)

      if (assistError) throw assistError

      const { data: appearances, error: appError } = await supabase
        .from('player_appearances')
        .select('id')
        .eq('player_id', playerId)

      if (appError) throw appError

      const { data: cards, error: cardError } = await supabase
        .from('player_cards')
        .select('card_type')
        .eq('player_id', playerId)

      if (cardError) throw cardError

      const total_goals = scorers?.reduce((sum, s) => sum + (s.goals || 0), 0) || 0
      const total_assists = assists?.reduce((sum, a) => sum + (a.assists || 0), 0) || 0
      const total_matches = appearances?.length || 0
      const yellow_cards = cards?.filter(c => c.card_type === 'yellow').length || 0
      const red_cards = cards?.filter(c => c.card_type === 'red').length || 0

      return {
        total_matches,
        total_goals,
        total_assists,
        yellow_cards,
        red_cards
      }
    } catch (err) {
      console.error('Error getting player stats:', err)
      throw err
    }
  }

  const addPlayer = async (playerData) => {
    try {
      const { data, error } = await supabase
        .from('players')
        .insert([playerData])
        .select()
      
      if (error) throw error
      await fetchPlayers()
      return data[0]
    } catch (err) {
      console.error('Error adding player:', err)
      throw err
    }
  }

  const updatePlayer = async (id, playerData) => {
    try {
      const { data, error } = await supabase
        .from('players')
        .update(playerData)
        .eq('id', id)
        .select()
      
      if (error) throw error
      await fetchPlayers()
      return data[0]
    } catch (err) {
      console.error('Error updating player:', err)
      throw err
    }
  }

  const deletePlayer = async (id) => {
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await fetchPlayers()
      return true
    } catch (err) {
      console.error('Error deleting player:', err)
      throw err
    }
  }

  return {
    players,
    loading,
    error,
    getPlayerStats,
    addPlayer,
    updatePlayer,
    deletePlayer,
    refreshPlayers: fetchPlayers
  }
}