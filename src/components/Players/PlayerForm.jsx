import React, { useState, useEffect } from 'react'
import { usePlayers } from '../../hooks/usePlayers'
import { useMatches } from '../../hooks/useMatches'
import Button from '../common/Button'
import Input from '../common/Input'
import Select from '../common/Select'
import Loading from '../common/Loading'

const PlayerForm = ({ player, onSuccess, onCancel }) => {
  const { addPlayer, updatePlayer } = usePlayers()
  const { matches } = useMatches()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    display_name: '',
    shirt_number: '',
    position: '',
    first_name: '',
    last_name: '',
    is_active: true,
    joined_date: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (player) {
      setFormData({
        display_name: player.display_name || '',
        shirt_number: player.shirt_number || '',
        position: player.position || '',
        first_name: player.first_name || '',
        last_name: player.last_name || '',
        is_active: player.is_active !== undefined ? player.is_active : true,
        joined_date: player.joined_date || ''
      })
    }
  }, [player])

  const validate = () => {
    const newErrors = {}
    if (!formData.display_name.trim()) {
      newErrors.display_name = 'Display name is required'
    }
    if (!formData.shirt_number) {
      newErrors.shirt_number = 'Shirt number is required'
    } else if (isNaN(formData.shirt_number) || formData.shirt_number < 1 || formData.shirt_number > 99) {
      newErrors.shirt_number = 'Shirt number must be between 1 and 99'
    }
    if (!formData.position) {
      newErrors.position = 'Position is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const data = {
        ...formData,
        shirt_number: parseInt(formData.shirt_number)
      }

      if (player) {
        await updatePlayer(player.id, data)
      } else {
        await addPlayer(data)
      }
      onSuccess()
    } catch (error) {
      alert('Error saving player: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const positions = [
    { value: 'GK', label: 'Goalkeeper' },
    { value: 'DEF', label: 'Defender' },
    { value: 'MID', label: 'Midfielder' },
    { value: 'FWD', label: 'Forward' }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Display Name *"
          name="display_name"
          value={formData.display_name}
          onChange={handleChange}
          error={errors.display_name}
          placeholder="e.g., Moeketsi"
          required
        />
        <Input
          label="Shirt Number *"
          name="shirt_number"
          type="number"
          value={formData.shirt_number}
          onChange={handleChange}
          error={errors.shirt_number}
          placeholder="e.g., 10"
          min="1"
          max="99"
          required
        />
        <Select
          label="Position *"
          name="position"
          value={formData.position}
          onChange={handleChange}
          error={errors.position}
          required
        >
          <option value="">Select Position</option>
          {positions.map(pos => (
            <option key={pos.value} value={pos.value}>{pos.label}</option>
          ))}
        </Select>
        <Input
          label="First Name"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          placeholder="e.g., Moeketsi"
        />
        <Input
          label="Last Name"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          placeholder="e.g., Letsoela"
        />
        <Input
          label="Joined Date"
          name="joined_date"
          type="date"
          value={formData.joined_date}
          onChange={handleChange}
        />
      </div>
      
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="is_active"
          id="is_active"
          checked={formData.is_active}
          onChange={handleChange}
          className="w-4 h-4 text-[#1a4d7a] border-gray-300 rounded focus:ring-[#1a4d7a]"
        />
        <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
          Active Player
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="secondary" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" isLoading={loading}>
          {player ? 'Update Player' : 'Add Player'}
        </Button>
      </div>
    </form>
  )
}

export default PlayerForm