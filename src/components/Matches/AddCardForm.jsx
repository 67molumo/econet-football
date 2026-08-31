import React, { useState, useEffect } from 'react'
import { usePlayers } from '../../hooks/usePlayers'
import Button from '../common/Button'
import Input from '../common/Input'
import Select from '../common/Select'
import Loading from '../common/Loading'

const AddCardForm = ({ matchId, onSuccess, onCancel }) => {
  const { players, loading: playersLoading } = usePlayers()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    player_id: '',
    card_type: 'yellow',
    minute: ''
  })
  const [errors, setErrors] = useState({})

  const activePlayers = players.filter(p => p.is_active !== false)

  const validate = () => {
    const newErrors = {}
    if (!formData.player_id) newErrors.player_id = 'Please select a player'
    if (!formData.card_type) newErrors.card_type = 'Please select card type'
    if (formData.minute && (isNaN(formData.minute) || formData.minute < 1 || formData.minute > 120)) {
      newErrors.minute = 'Minute must be between 1 and 120'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const { addPlayerCard } = useMatches()
      await addPlayerCard({
        match_id: matchId,
        player_id: formData.player_id,
        card_type: formData.card_type,
        minute: formData.minute ? parseInt(formData.minute) : null
      })
      onSuccess()
    } catch (error) {
      alert('Error adding card: ' + error.message)
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

      <Select
        label="Card Type"
        name="card_type"
        value={formData.card_type}
        onChange={handleChange}
        error={errors.card_type}
        required
      >
        <option value="yellow">🟨 Yellow Card</option>
        <option value="red">🟥 Red Card</option>
      </Select>

      <Input
        label="Minute (optional)"
        name="minute"
        type="number"
        value={formData.minute}
        onChange={handleChange}
        error={errors.minute}
        placeholder="e.g., 45"
        min="1"
        max="120"
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" isLoading={loading}>
          Add Card
        </Button>
      </div>
    </form>
  )
}

export default AddCardForm