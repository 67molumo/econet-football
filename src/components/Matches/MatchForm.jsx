import React, { useState, useEffect } from 'react'
import { useMatches } from '../../hooks/useMatches'
import { useCompetitions } from '../../hooks/useCompetitions'
import { useVenues } from '../../hooks/useVenues'
import Button from '../common/Button'
import Input from '../common/Input'
import Select from '../common/Select'
import Loading from '../common/Loading'
import supabase from '../../lib/supabase'

const MatchForm = ({ match, onSuccess, onCancel }) => {
  const { addMatch, updateMatch } = useMatches()
  const { competitions, loading: compsLoading, refreshCompetitions } = useCompetitions()
  const { venues, loading: venuesLoading, refreshVenues } = useVenues()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    opponent: '',
    match_date: '',
    venue_id: '',
    venue_name: '',
    competition_id: '',
    competition_name: '',
    home_score: '',
    away_score: '',
    status: 'scheduled',
    result: 'pending',
    notes: ''
  })
  const [errors, setErrors] = useState({})
  const [isCustomVenue, setIsCustomVenue] = useState(false)
  const [isCustomCompetition, setIsCustomCompetition] = useState(false)

  useEffect(() => {
    if (match) {
      setFormData({
        opponent: match.opponent || '',
        match_date: match.match_date ? match.match_date.split('T')[0] : '',
        venue_id: match.venue_id || '',
        venue_name: match.venues?.name || '',
        competition_id: match.competition_id || '',
        competition_name: match.competitions?.name || '',
        home_score: match.home_score || '',
        away_score: match.away_score || '',
        status: match.status || 'scheduled',
        result: match.result || 'pending',
        notes: match.notes || ''
      })
    }
  }, [match])

  const validate = () => {
    const newErrors = {}
    if (!formData.opponent.trim()) newErrors.opponent = 'Opponent is required'
    if (!formData.match_date) newErrors.match_date = 'Date is required'
    
    // Validate venue - either venue_id or custom venue name
    if (!formData.venue_id && !formData.venue_name.trim()) {
      newErrors.venue = 'Venue is required'
    }
    
    // Validate competition - either competition_id or custom competition name
    if (!formData.competition_id && !formData.competition_name.trim()) {
      newErrors.competition = 'Competition is required'
    }
    
    if (!formData.status) newErrors.status = 'Status is required'
    
    if (formData.status === 'completed') {
      if (formData.home_score === '' || isNaN(formData.home_score)) {
        newErrors.home_score = 'Valid home score is required'
      }
      if (formData.away_score === '' || isNaN(formData.away_score)) {
        newErrors.away_score = 'Valid away score is required'
      }
      if (!formData.result || formData.result === 'pending') {
        newErrors.result = 'Result is required for completed matches'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      let venueId = formData.venue_id
      let competitionId = formData.competition_id

      // If custom venue is entered, create it first
      if (isCustomVenue && formData.venue_name.trim()) {
        // Check if venue already exists
        const { data: existingVenue, error: checkError } = await supabase
          .from('venues')
          .select('id')
          .eq('name', formData.venue_name.trim())
          .maybeSingle()

        if (checkError && checkError.code !== 'PGRST116') throw checkError

        if (existingVenue) {
          venueId = existingVenue.id
        } else {
          // Create new venue
          const { data: newVenue, error: venueError } = await supabase
            .from('venues')
            .insert({ name: formData.venue_name.trim() })
            .select()
            .single()

          if (venueError) throw venueError
          venueId = newVenue.id
          // Refresh venues list
          await refreshVenues()
        }
      }

      // If custom competition is entered, create it first
      if (isCustomCompetition && formData.competition_name.trim()) {
        // Check if competition already exists
        const { data: existingComp, error: checkError } = await supabase
          .from('competitions')
          .select('id')
          .eq('name', formData.competition_name.trim())
          .maybeSingle()

        if (checkError && checkError.code !== 'PGRST116') throw checkError

        if (existingComp) {
          competitionId = existingComp.id
        } else {
          // Create new competition
          const { data: newCompetition, error: compError } = await supabase
            .from('competitions')
            .insert({ 
              name: formData.competition_name.trim(),
              season: new Date().getFullYear().toString(),
              description: ''
            })
            .select()
            .single()

          if (compError) throw compError
          competitionId = newCompetition.id
          // Refresh competitions list
          await refreshCompetitions()
        }
      }

      const data = {
        opponent: formData.opponent,
        match_date: formData.match_date,
        venue_id: venueId,
        competition_id: competitionId,
        home_score: formData.home_score ? parseInt(formData.home_score) : null,
        away_score: formData.away_score ? parseInt(formData.away_score) : null,
        status: formData.status,
        result: formData.result,
        notes: formData.notes
      }

      if (match) {
        await updateMatch(match.id, data)
      } else {
        await addMatch(data)
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving match:', error)
      alert('Error saving match: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleStatusChange = (e) => {
    const status = e.target.value
    setFormData(prev => ({
      ...prev,
      status: status,
      result: status === 'completed' ? prev.result : 'pending',
      home_score: status === 'completed' ? prev.home_score : '',
      away_score: status === 'completed' ? prev.away_score : ''
    }))
    if (errors.status) {
      setErrors(prev => ({ ...prev, status: '' }))
    }
  }

  const toggleCustomVenue = () => {
    setIsCustomVenue(!isCustomVenue)
    setFormData(prev => ({ 
      ...prev, 
      venue_id: '',
      venue_name: ''
    }))
  }

  const toggleCustomCompetition = () => {
    setIsCustomCompetition(!isCustomCompetition)
    setFormData(prev => ({ 
      ...prev, 
      competition_id: '',
      competition_name: ''
    }))
  }

  if (compsLoading || venuesLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loading size="md" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Opponent */}
        <Input
          label="Opponent *"
          name="opponent"
          value={formData.opponent}
          onChange={handleChange}
          error={errors.opponent}
          placeholder="e.g., LHDA"
          required
        />

        {/* Match Date */}
        <Input
          label="Match Date *"
          name="match_date"
          type="date"
          value={formData.match_date}
          onChange={handleChange}
          error={errors.match_date}
          required
        />

        {/* Venue - Select or Type */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Venue *
            </label>
            <button
              type="button"
              onClick={toggleCustomVenue}
              className="text-xs text-[#1a4d7a] hover:text-[#e67e22] transition-colors"
            >
              {isCustomVenue ? 'Select from list' : 'Type custom venue'}
            </button>
          </div>
          
          {isCustomVenue ? (
            <Input
              name="venue_name"
              value={formData.venue_name}
              onChange={handleChange}
              error={errors.venue}
              placeholder="e.g., New Stadium, TBC"
            />
          ) : (
            <Select
              name="venue_id"
              value={formData.venue_id}
              onChange={handleChange}
              error={errors.venue}
            >
              <option value="">Select Venue</option>
              {venues.map(venue => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} {venue.location ? `(${venue.location})` : ''}
                </option>
              ))}
            </Select>
          )}
        </div>

        {/* Competition - Select or Type */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Competition *
            </label>
            <button
              type="button"
              onClick={toggleCustomCompetition}
              className="text-xs text-[#1a4d7a] hover:text-[#e67e22] transition-colors"
            >
              {isCustomCompetition ? 'Select from list' : 'Type custom competition'}
            </button>
          </div>
          
          {isCustomCompetition ? (
            <Input
              name="competition_name"
              value={formData.competition_name}
              onChange={handleChange}
              error={errors.competition}
              placeholder="e.g., Champions League, Friendly"
            />
          ) : (
            <Select
              name="competition_id"
              value={formData.competition_id}
              onChange={handleChange}
              error={errors.competition}
            >
              <option value="">Select Competition</option>
              {competitions.map(comp => (
                <option key={comp.id} value={comp.id}>
                  {comp.name} {comp.season ? `(${comp.season})` : ''}
                </option>
              ))}
            </Select>
          )}
        </div>

        {/* Status */}
        <Select
          label="Status *"
          name="status"
          value={formData.status}
          onChange={handleStatusChange}
          error={errors.status}
          required
        >
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="postponed">Postponed</option>
          <option value="cancelled">Cancelled</option>
        </Select>

        {/* Result */}
        <Select
          label="Result"
          name="result"
          value={formData.result}
          onChange={handleChange}
          error={errors.result}
          disabled={formData.status !== 'completed'}
        >
          <option value="pending">Pending</option>
          <option value="win">Win</option>
          <option value="draw">Draw</option>
          <option value="loss">Loss</option>
        </Select>

        {/* Home Score */}
        <Input
          label="Home Score"
          name="home_score"
          type="number"
          value={formData.home_score}
          onChange={handleChange}
          error={errors.home_score}
          placeholder="0"
          disabled={formData.status !== 'completed'}
          min="0"
        />

        {/* Away Score */}
        <Input
          label="Away Score"
          name="away_score"
          type="number"
          value={formData.away_score}
          onChange={handleChange}
          error={errors.away_score}
          placeholder="0"
          disabled={formData.status !== 'completed'}
          min="0"
        />
      </div>

      {/* Notes */}
      <div>
        <Input
          label="Notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Match notes, goalscorers, cards, etc."
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="secondary" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" isLoading={loading}>
          {match ? 'Update Match' : 'Create Match'}
        </Button>
      </div>
    </form>
  )
}

export default MatchForm