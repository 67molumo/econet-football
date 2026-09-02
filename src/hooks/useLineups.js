import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

export function useLineups() {
  const [lineups, setLineups] = useState([])
  const [currentLineup, setCurrentLineup] = useState(null)
  const [lineupHistory, setLineupHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLineups = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('lineups')
        .select(`
          *,
          lineup_players (
            *,
            players (*)
          )
        `)
        .eq('archived', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setLineups(data || [])
    } catch (err) {
      console.error('Error fetching lineups:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getLineupByMatch = async (matchId) => {
    try {
      const { data, error } = await supabase
        .from('lineups')
        .select(`
          *,
          lineup_players (
            *,
            players (*)
          )
        `)
        .eq('match_id', matchId)
        .eq('archived', false)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error fetching lineup by match:', err)
      throw err
    }
  }

  const getLineupHistory = async (matchId) => {
    try {
      const { data, error } = await supabase
        .from('lineups')
        .select(`
          *,
          lineup_players (
            *,
            players (*)
          )
        `)
        .eq('match_id', matchId)
        .order('version', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching lineup history:', err)
      throw err
    }
  }

  const getLatestLineup = async () => {
    try {
      const { data, error } = await supabase
        .from('lineups')
        .select(`
          *,
          matches (opponent, match_date),
          lineup_players (
            *,
            players (*)
          )
        `)
        .eq('archived', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error fetching latest lineup:', err)
      throw err
    }
  }

  const saveLineup = async (matchId, formation, players) => {
    try {
      // Get the current version for this match
      const { data: existingLineups, error: countError } = await supabase
        .from('lineups')
        .select('version')
        .eq('match_id', matchId)
        .order('version', { ascending: false })
        .limit(1)

      if (countError) throw countError

      const nextVersion = existingLineups && existingLineups.length > 0 
        ? existingLineups[0].version + 1 
        : 1

      // Archive any existing active lineup for this match
      const { error: archiveError } = await supabase
        .from('lineups')
        .update({ archived: true })
        .eq('match_id', matchId)
        .eq('archived', false)

      if (archiveError) throw archiveError

      // Create new lineup with version
      const { data: lineup, error: lineupError } = await supabase
        .from('lineups')
        .insert({
          match_id: matchId,
          formation: formation,
          version: nextVersion,
          archived: false
        })
        .select()
        .single()

      if (lineupError) throw lineupError

      // Insert lineup players
      const lineupPlayers = players.map((player, index) => ({
        lineup_id: lineup.id,
        player_id: player.id,
        position: player.position || 'N/A',
        position_order: index + 1,
        is_starting: index < 11,
        is_substitute: index >= 11
      }))

      const { error: playersError } = await supabase
        .from('lineup_players')
        .insert(lineupPlayers)

      if (playersError) throw playersError

      await fetchLineups()
      return lineup
    } catch (err) {
      console.error('Error saving lineup:', err)
      throw err
    }
  }

  const getArchivedLineups = async (matchId) => {
    try {
      let query = supabase
        .from('lineups')
        .select(`
          *,
          lineup_players (
            *,
            players (*)
          )
        `)
        .eq('archived', true)
        .order('created_at', { ascending: false })

      if (matchId) {
        query = query.eq('match_id', matchId)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching archived lineups:', err)
      throw err
    }
  }

  const restoreLineup = async (lineupId) => {
    try {
      // First, archive the current active lineup for this match
      const { data: currentLineup, error: currentError } = await supabase
        .from('lineups')
        .select('match_id')
        .eq('id', lineupId)
        .single()

      if (currentError) throw currentError

      // Archive all active lineups for this match
      const { error: archiveError } = await supabase
        .from('lineups')
        .update({ archived: true })
        .eq('match_id', currentLineup.match_id)
        .eq('archived', false)

      if (archiveError) throw archiveError

      // Restore the selected lineup
      const { error: restoreError } = await supabase
        .from('lineups')
        .update({ archived: false })
        .eq('id', lineupId)

      if (restoreError) throw restoreError

      await fetchLineups()
      return true
    } catch (err) {
      console.error('Error restoring lineup:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchLineups()
  }, [])

  return {
    lineups,
    currentLineup,
    lineupHistory,
    loading,
    error,
    getLineupByMatch,
    getLineupHistory,
    getLatestLineup,
    getArchivedLineups,
    saveLineup,
    restoreLineup,
    refreshLineups: fetchLineups
  }
}