import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

export function useVenues() {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchVenues()
  }, [])

  const fetchVenues = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setVenues(data || [])
    } catch (err) {
      console.error('Error fetching venues:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addVenue = async (venueData) => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .insert([venueData])
        .select()
      
      if (error) throw error
      await fetchVenues()
      return data[0]
    } catch (err) {
      console.error('Error adding venue:', err)
      throw err
    }
  }

  const updateVenue = async (id, venueData) => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .update(venueData)
        .eq('id', id)
        .select()
      
      if (error) throw error
      await fetchVenues()
      return data[0]
    } catch (err) {
      console.error('Error updating venue:', err)
      throw err
    }
  }

  const deleteVenue = async (id) => {
    try {
      const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      await fetchVenues()
      return true
    } catch (err) {
      console.error('Error deleting venue:', err)
      throw err
    }
  }

  return {
    venues,
    loading,
    error,
    addVenue,
    updateVenue,
    deleteVenue,
    refreshVenues: fetchVenues
  }
}