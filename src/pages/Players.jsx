import React, { useState, useEffect } from 'react'
import { Plus, Search, User, Award, Calendar, Shield } from 'lucide-react'
import { usePlayers } from '../hooks/usePlayers'
import { useMatches } from '../hooks/useMatches'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Loading from '../components/common/Loading'
import EmptyState from '../components/common/EmptyState'
import Modal from '../components/common/Modal'
import PlayerForm from '../components/Players/PlayerForm'
import PlayerProfile from '../components/Players/PlayerProfile'

const Players = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [playerStats, setPlayerStats] = useState({})

  const { players, loading, deletePlayer, refreshPlayers } = usePlayers()
  const { getMatchById } = useMatches()

  useEffect(() => {
    loadPlayerStats()
  }, [players])

  const loadPlayerStats = async () => {
    // Calculate stats from matches data
    const stats = {}
    for (const player of players) {
      // Get all matches where this player played
      // This is simplified - in production you'd query the database
      stats[player.id] = {
        appearances: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0
      }
    }
    setPlayerStats(stats)
  }

  const filteredPlayers = players.filter(player =>
    player.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.position?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleViewProfile = (player) => {
    setSelectedPlayer(player)
    setShowProfileModal(true)
  }

  const handleEditPlayer = (player) => {
    setEditingPlayer(player)
    setShowFormModal(true)
  }

  const handleDeletePlayer = async (id) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      try {
        await deletePlayer(id)
        await refreshPlayers()
      } catch (error) {
        alert('Error deleting player: ' + error.message)
      }
    }
  }

  const handleFormSuccess = () => {
    setShowFormModal(false)
    setEditingPlayer(null)
    refreshPlayers()
  }

  const getPositionColor = (position) => {
    const colors = {
      GK: 'bg-yellow-100 text-yellow-800',
      DEF: 'bg-blue-100 text-blue-800',
      MID: 'bg-green-100 text-green-800',
      FWD: 'bg-red-100 text-red-800'
    }
    return colors[position] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Players</h1>
          <p className="text-gray-500">Manage player profiles and statistics</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => {
            setEditingPlayer(null)
            setShowFormModal(true)
          }}
        >
          <Plus className="w-4 h-4" />
          Add Player
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search players by name or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Players Grid */}
      {filteredPlayers.length === 0 ? (
        <EmptyState
          icon="👤"
          title="No players found"
          description={searchTerm ? "Try adjusting your search" : "Start by adding your first player"}
          action={!searchTerm && <Button onClick={() => {
            setEditingPlayer(null)
            setShowFormModal(true)
          }}>Add Player</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPlayers.map((player) => {
            const stats = playerStats[player.id] || { appearances: 0, goals: 0, assists: 0 }
            return (
              <div key={player.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-[#1a4d7a] text-white flex items-center justify-center text-2xl font-bold">
                    {player.shirt_number || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{player.display_name}</h3>
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getPositionColor(player.position)}`}>
                      {player.position || 'N/A'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{stats.appearances || 0}</p>
                    <p className="text-xs text-gray-500">Apps</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#e67e22]">{stats.goals || 0}</p>
                    <p className="text-xs text-gray-500">Goals</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-600">{stats.assists || 0}</p>
                    <p className="text-xs text-gray-500">Assists</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleViewProfile(player)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-[#1a4d7a] border border-[#1a4d7a] rounded-lg hover:bg-[#1a4d7a] hover:text-white transition-all"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => handleEditPlayer(player)}
                    className="px-3 py-2 text-sm font-medium text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-600 hover:text-white transition-all"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Player Profile Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Player Profile"
        size="lg"
      >
        {selectedPlayer && (
          <PlayerProfile 
            playerId={selectedPlayer.id} 
            onClose={() => setShowProfileModal(false)} 
          />
        )}
      </Modal>

      {/* Player Form Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false)
          setEditingPlayer(null)
        }}
        title={editingPlayer ? 'Edit Player' : 'Add New Player'}
      >
        <PlayerForm
          player={editingPlayer}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowFormModal(false)
            setEditingPlayer(null)
          }}
        />
      </Modal>
    </div>
  )
}

export default Players