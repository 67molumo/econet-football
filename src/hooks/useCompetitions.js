import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

export function useCompetitions() {
  const [competitions, setCompetitions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCompetitions()
  }, [])

  const fetchCompetitions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setCompetitions(data || [])
    } catch (err) {
      console.error('Error fetching competitions:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addCompetition = async (competitionData) => {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .insert([competitionData])
        .select()
      
      if (error) throw error
      await fetchCompetitions()
      return data[0]
    } catch (err) {
      console.error('Error adding competition:', err)
      throw err
    }
  }

  const updateCompetition = async (id, competitionData) => {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .update(competitionData)
        .eq('id', id)
        .select()
      
      if (error) throw error
      await fetchCompetitions()
      return data[0]
    } catch (err) {
      console.error('Error updating competition:', err)
      throw err
    }
  }

  const deleteCompetition = async (id) => {
    try {
      const { error } = await supabase
        .from('competitions')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await fetchCompetitions()
      return true
    } catch (err) {
      console.error('Error deleting competition:', err)
      throw err
    }
  }

  return {
    competitions,
    loading,
    error,
    addCompetition,
    updateCompetition,
    deleteCompetition,
    refreshCompetitions: fetchCompetitions
  }
}