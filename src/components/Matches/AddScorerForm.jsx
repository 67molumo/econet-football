import React, { useState, useEffect } from 'react'
import { usePlayers } from '../../hooks/usePlayers'
import Button from '../common/Button'
import Input from '../common/Input'
import Select from '../common/Select'
import Loading from '../common/Loading'

const AddScorerForm = ({ matchId, onSuccess, onCancel }) => {
  const { players, loading: playersLoading } = usePlayers()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    player_id: '',
    goals: 1
  })
  const [errors, setErrors] = useState({})

  // Filter active players only
  const activePlayers = players.filter(p => p.is_active !== false)

  const validate = () => {
    const newErrors = {}
    if (!formData.player_id) newErrors.player_id = 'Please select a player'
    if (!formData.goals || formData.goals < 1) newErrors.goals = 'Goals must be at least 1'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const { addMatchScorer } = useMatches()
      await addMatchScorer({
        match_id: matchId,
        player_id: formData.player_id,
        goals: parseInt(formData.goals)
      })
      onSuccess()
    } catch (error) {
      alert('Error adding scorer: ' + error.message)
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

  if (playersLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loading size="md" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Player"
        name="player_id"
        value={formData.player_id}
        onChange={handleChange}
        error={errors.player_id}
        required
      >
        <option value="">Select Player</option>
        {activePlayers.map(player => (
          <option key={player.id} value={player.id}>
            #{player.shirt_number} {player.display_name} ({player.position || 'N/A'})
          </option>
        ))}
      </Select>

      <Input
        label="Number of Goals"
        name="goals"
        type="number"
        value={formData.goals}
        onChange={handleChange}
        error={errors.goals}
        min="1"
        max="10"
        required
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" isLoading={loading}>
          Add Scorer
        </Button>
      </div>
    </form>
  )
}

export default AddScorerForm