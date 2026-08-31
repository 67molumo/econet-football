import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { 
  Users, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Download, 
  FileImage, 
  FileText,
  Trash2,
  Plus,
  X,
  Check,
  Shield,
  Trophy
} from 'lucide-react'
import { usePlayers } from '../hooks/usePlayers'
import { useMatches } from '../hooks/useMatches'
import Loading from '../components/common/Loading'
import Button from '../components/common/Button'
import { formatDate } from '../utils/helpers'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const TeamSelection = () => {
     console.log('🏆 TeamSelection - isAdmin:', isAdmin, 'role:', role)
  const { isAdmin, role } = useOutletContext()
  const { players, loading: playersLoading, deletePlayer, refreshPlayers } = usePlayers()
  const { matches, loading: matchesLoading } = useMatches()
  
  const [startingXI, setStartingXI] = useState([])
  const [substitutes, setSubstitutes] = useState([])
  const [availablePlayers, setAvailablePlayers] = useState([])
  const [selectedMatch, setSelectedMatch] = useState('')
  const [formation, setFormation] = useState('4-4-2')
  const [isExporting, setIsExporting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false)

  // Formation templates
  const formations = {
    '4-4-2': { label: '4-4-2', positions: ['GK', 'LB', 'CB', 'CB', 'RB', 'LM', 'CM', 'CM', 'RM', 'ST', 'ST'] },
    '4-3-3': { label: '4-3-3', positions: ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CM', 'CM', 'LW', 'ST', 'RW'] },
    '3-5-2': { label: '3-5-2', positions: ['GK', 'CB', 'CB', 'CB', 'LM', 'CM', 'CM', 'CM', 'RM', 'ST', 'ST'] },
    '5-3-2': { label: '5-3-2', positions: ['GK', 'LWB', 'CB', 'CB', 'CB', 'RWB', 'CM', 'CM', 'CM', 'ST', 'ST'] }
  }

  useEffect(() => {
    if (!playersLoading && players.length > 0) {
      // Initialize with first 11 players as starting XI
      const activePlayers = players.filter(p => p.is_active !== false)
      const firstEleven = activePlayers.slice(0, 11)
      const remaining = activePlayers.slice(11)
      
      setStartingXI(firstEleven)
      setSubstitutes(remaining.slice(0, 7))
      setAvailablePlayers(remaining.slice(7))
    }
  }, [players, playersLoading])

  const moveToStarting = (player) => {
    setSubstitutes(prev => prev.filter(p => p.id !== player.id))
    setAvailablePlayers(prev => prev.filter(p => p.id !== player.id))
    setStartingXI(prev => [...prev, player])
  }

  const moveToSubstitutes = (player) => {
    setStartingXI(prev => prev.filter(p => p.id !== player.id))
    setSubstitutes(prev => [...prev, player])
  }

  const moveToAvailable = (player) => {
    setStartingXI(prev => prev.filter(p => p.id !== player.id))
    setSubstitutes(prev => prev.filter(p => p.id !== player.id))
    setAvailablePlayers(prev => [...prev, player])
  }

  const resetTeam = () => {
    const activePlayers = players.filter(p => p.is_active !== false)
    const firstEleven = activePlayers.slice(0, 11)
    const remaining = activePlayers.slice(11)
    
    setStartingXI(firstEleven)
    setSubstitutes(remaining.slice(0, 7))
    setAvailablePlayers(remaining.slice(7))
  }

  const handleDeletePlayer = async (playerId) => {
    if (!isAdmin) return
    try {
      await deletePlayer(playerId)
      await refreshPlayers()
      setShowDeleteConfirm(null)
      // Remove from all lists
      setStartingXI(prev => prev.filter(p => p.id !== playerId))
      setSubstitutes(prev => prev.filter(p => p.id !== playerId))
      setAvailablePlayers(prev => prev.filter(p => p.id !== playerId))
    } catch (error) {
      alert('Error deleting player: ' + error.message)
    }
  }

  const exportAsPNG = async () => {
    const element = document.getElementById('lineup-content')
    if (!element) return
    
    setIsExporting(true)
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        useCORS: true
      })
      
      const link = document.createElement('a')
      link.download = `lineup_${new Date().toISOString().split('T')[0]}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Error exporting PNG:', error)
      alert('Error exporting PNG. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const exportAsPDF = async () => {
    const element = document.getElementById('lineup-content')
    if (!element) return
    
    setIsExporting(true)
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        useCORS: true
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`lineup_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Error exporting PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  if (playersLoading || matchesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading size="lg" />
      </div>
    )
  }

  const canEdit = isAdmin || role === 'manager' || role === 'coach'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Selection</h1>
          <p className="text-sm text-gray-500">
            {canEdit ? 'Select starting XI and substitutes' : 'View team lineup'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Match Selector */}
          <select
            value={selectedMatch}
            onChange={(e) => setSelectedMatch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#1a4d7a] focus:border-[#1a4d7a]"
          >
            <option value="">Select Match</option>
            {matches.filter(m => m.status === 'scheduled' || m.status === 'completed').map(m => (
              <option key={m.id} value={m.id}>
                {m.opponent} - {formatDate(m.match_date)}
              </option>
            ))}
          </select>

          {/* Formation Selector */}
          <select
            value={formation}
            onChange={(e) => setFormation(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#1a4d7a] focus:border-[#1a4d7a]"
          >
            {Object.entries(formations).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>

          {canEdit && (
            <button
              onClick={resetTeam}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}

          {/* Export Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={exportAsPNG}
            isLoading={isExporting}
            disabled={isExporting}
            className="flex items-center gap-1.5"
          >
            <FileImage className="w-4 h-4" />
            PNG
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportAsPDF}
            isLoading={isExporting}
            disabled={isExporting}
            className="flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Lineup Display */}
      <div id="lineup-content" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Nchoathi FC</h2>
          <p className="text-sm text-gray-500">
            {selectedMatch ? `vs ${matches.find(m => m.id === selectedMatch)?.opponent || 'Opponent'}` : 'Match Lineup'}
          </p>
          <p className="text-xs text-gray-400">Formation: {formations[formation]?.label || '4-4-2'}</p>
        </div>

        {/* Starting XI */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#e67e22]" />
            Starting XI
            <span className="text-xs text-gray-400">({startingXI.length}/11)</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {startingXI.map((player, index) => (
              <div key={player.id} className="bg-gray-50 rounded-lg p-3 text-center relative group">
                <div className="w-12 h-12 rounded-full bg-[#1a4d7a] text-white flex items-center justify-center text-lg font-bold mx-auto">
                  {player.shirt_number || '?'}
                </div>
                <p className="text-sm font-medium text-gray-900 mt-1 truncate">{player.display_name}</p>
                <p className="text-xs text-gray-500">{player.position || 'N/A'}</p>
                <span className="absolute top-1 right-1 text-xs text-gray-400 bg-white px-1.5 rounded">
                  {index + 1}
                </span>
                {canEdit && (
                  <button
                    onClick={() => moveToSubstitutes(player)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1"
                  >
                    <ArrowRight className="w-4 h-4 text-white" />
                    <span className="text-white text-xs">Bench</span>
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => setShowDeleteConfirm(player)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Substitutes */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Substitutes
            <span className="text-xs text-gray-400">({substitutes.length}/7)</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {substitutes.map((player) => (
              <div key={player.id} className="bg-gray-50 rounded-lg p-3 text-center relative group">
                <div className="w-12 h-12 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-lg font-bold mx-auto">
                  {player.shirt_number || '?'}
                </div>
                <p className="text-sm font-medium text-gray-900 mt-1 truncate">{player.display_name}</p>
                <p className="text-xs text-gray-500">{player.position || 'N/A'}</p>
                {canEdit && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <button
                      onClick={() => moveToStarting(player)}
                      className="p-1 hover:bg-white/20 rounded"
                    >
                      <ArrowLeft className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => moveToAvailable(player)}
                      className="p-1 hover:bg-white/20 rounded"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}
                {isAdmin && (
                  <button
                    onClick={() => setShowDeleteConfirm(player)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Available Players */}
        {canEdit && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              Available Players
              <span className="text-xs text-gray-400">({availablePlayers.length})</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {availablePlayers.slice(0, 10).map((player) => (
                <div key={player.id} className="bg-gray-50 rounded-lg p-3 text-center relative group">
                  <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-lg font-bold mx-auto">
                    {player.shirt_number || '?'}
                  </div>
                  <p className="text-sm font-medium text-gray-900 mt-1 truncate">{player.display_name}</p>
                  <p className="text-xs text-gray-500">{player.position || 'N/A'}</p>
                  {canEdit && (
                    <button
                      onClick={() => {
                        setStartingXI(prev => [...prev, player])
                        setAvailablePlayers(prev => prev.filter(p => p.id !== player.id))
                      }}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
                    >
                      <Plus className="w-6 h-6 text-white" />
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => setShowDeleteConfirm(player)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Player</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <strong>{showDeleteConfirm.display_name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePlayer(showDeleteConfirm.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete Player
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamSelection