import React, { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { 
  Users, 
  RotateCcw, 
  FileImage, 
  FileText,
  Trash2,
  Plus,
  X,
  Shield,
  Trophy,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Download,
  Printer
} from 'lucide-react'
import { usePlayers } from '../hooks/usePlayers'
import { useMatches } from '../hooks/useMatches'
import Loading from '../components/common/Loading'
import Button from '../components/common/Button'
import { formatDate } from '../utils/helpers'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const TeamSelection = () => {
  const { isAdmin, role } = useOutletContext()
  const contentRef = useRef(null)
  
  const { players, loading: playersLoading, deletePlayer, refreshPlayers } = usePlayers()
  const { matches, loading: matchesLoading } = useMatches()
  
  const [startingXI, setStartingXI] = useState([])
  const [substitutes, setSubstitutes] = useState([])
  const [availablePlayers, setAvailablePlayers] = useState([])
  const [selectedMatch, setSelectedMatch] = useState('')
  const [formation, setFormation] = useState('4-4-2')
  const [isExporting, setIsExporting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [showAvailable, setShowAvailable] = useState(false)
  const [draggedPlayer, setDraggedPlayer] = useState(null)

  const canEdit = isAdmin || role === 'manager' || role === 'coach'

  // Formation positions on the field
  const formationPositions = {
    '4-4-2': {
      label: '4-4-2',
      players: [
        { id: 'gk', label: 'GK', row: 1, col: 50 },
        { id: 'lb', label: 'LB', row: 2, col: 15 },
        { id: 'cb1', label: 'CB', row: 2, col: 38 },
        { id: 'cb2', label: 'CB', row: 2, col: 62 },
        { id: 'rb', label: 'RB', row: 2, col: 85 },
        { id: 'lm', label: 'LM', row: 3, col: 10 },
        { id: 'cm1', label: 'CM', row: 3, col: 38 },
        { id: 'cm2', label: 'CM', row: 3, col: 62 },
        { id: 'rm', label: 'RM', row: 3, col: 90 },
        { id: 'st1', label: 'ST', row: 4, col: 38 },
        { id: 'st2', label: 'ST', row: 4, col: 62 }
      ]
    },
    '4-3-3': {
      label: '4-3-3',
      players: [
        { id: 'gk', label: 'GK', row: 1, col: 50 },
        { id: 'lb', label: 'LB', row: 2, col: 15 },
        { id: 'cb1', label: 'CB', row: 2, col: 38 },
        { id: 'cb2', label: 'CB', row: 2, col: 62 },
        { id: 'rb', label: 'RB', row: 2, col: 85 },
        { id: 'cdm', label: 'CDM', row: 3, col: 30 },
        { id: 'cm1', label: 'CM', row: 3, col: 50 },
        { id: 'cm2', label: 'CM', row: 3, col: 70 },
        { id: 'lw', label: 'LW', row: 4, col: 15 },
        { id: 'st', label: 'ST', row: 4, col: 50 },
        { id: 'rw', label: 'RW', row: 4, col: 85 }
      ]
    },
    '3-5-2': {
      label: '3-5-2',
      players: [
        { id: 'gk', label: 'GK', row: 1, col: 50 },
        { id: 'cb1', label: 'CB', row: 2, col: 25 },
        { id: 'cb2', label: 'CB', row: 2, col: 50 },
        { id: 'cb3', label: 'CB', row: 2, col: 75 },
        { id: 'lm', label: 'LM', row: 3, col: 10 },
        { id: 'cm1', label: 'CM', row: 3, col: 35 },
        { id: 'cm2', label: 'CM', row: 3, col: 50 },
        { id: 'cm3', label: 'CM', row: 3, col: 65 },
        { id: 'rm', label: 'RM', row: 3, col: 90 },
        { id: 'st1', label: 'ST', row: 4, col: 38 },
        { id: 'st2', label: 'ST', row: 4, col: 62 }
      ]
    },
    '5-3-2': {
      label: '5-3-2',
      players: [
        { id: 'gk', label: 'GK', row: 1, col: 50 },
        { id: 'lwb', label: 'LWB', row: 2, col: 10 },
        { id: 'cb1', label: 'CB', row: 2, col: 30 },
        { id: 'cb2', label: 'CB', row: 2, col: 50 },
        { id: 'cb3', label: 'CB', row: 2, col: 70 },
        { id: 'rwb', label: 'RWB', row: 2, col: 90 },
        { id: 'cm1', label: 'CM', row: 3, col: 35 },
        { id: 'cm2', label: 'CM', row: 3, col: 50 },
        { id: 'cm3', label: 'CM', row: 3, col: 65 },
        { id: 'st1', label: 'ST', row: 4, col: 38 },
        { id: 'st2', label: 'ST', row: 4, col: 62 }
      ]
    }
  }

  useEffect(() => {
    if (!playersLoading && players.length > 0) {
      const activePlayers = players.filter(p => p.is_active !== false)
      const firstEleven = activePlayers.slice(0, 11)
      const remaining = activePlayers.slice(11)
      
      setStartingXI(firstEleven)
      setSubstitutes(remaining.slice(0, 7))
      setAvailablePlayers(remaining.slice(7))
    }
  }, [players, playersLoading])

  const moveToStarting = (player) => {
    if (!canEdit || startingXI.length >= 11) return
    setSubstitutes(prev => prev.filter(p => p.id !== player.id))
    setAvailablePlayers(prev => prev.filter(p => p.id !== player.id))
    setStartingXI(prev => [...prev, player])
  }

  const moveToSubstitutes = (player) => {
    if (!canEdit) return
    setStartingXI(prev => prev.filter(p => p.id !== player.id))
    setSubstitutes(prev => [...prev, player])
  }

  const moveToAvailable = (player) => {
    if (!canEdit) return
    setStartingXI(prev => prev.filter(p => p.id !== player.id))
    setSubstitutes(prev => prev.filter(p => p.id !== player.id))
    setAvailablePlayers(prev => [...prev, player])
  }

  const resetTeam = () => {
    if (!canEdit) return
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

  const getPositionColor = (position) => {
    const colors = {
      GK: 'bg-yellow-500',
      DEF: 'bg-blue-500',
      MID: 'bg-green-500',
      FWD: 'bg-red-500'
    }
    return colors[position] || 'bg-gray-500'
  }

  // Assign players to formation positions
  const getFormationPlayers = () => {
    const positions = formationPositions[formation]?.players || formationPositions['4-4-2'].players
    const assigned = []
    const playersCopy = [...startingXI]
    
    positions.forEach((pos, index) => {
      if (index < playersCopy.length) {
        assigned.push({
          ...pos,
          player: playersCopy[index]
        })
      } else {
        assigned.push({
          ...pos,
          player: null
        })
      }
    })
    
    return assigned
  }

  if (playersLoading || matchesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading size="lg" />
      </div>
    )
  }

  const formationPlayers = getFormationPlayers()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Selection</h1>
          <p className="text-sm text-gray-500">
            {canEdit ? 'Select starting XI and substitutes' : 'View team lineup'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedMatch}
            onChange={(e) => setSelectedMatch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#1a4d7a] focus:border-[#1a4d7a] bg-white"
          >
            <option value="">Select Match</option>
            {matches.filter(m => m.status === 'scheduled' || m.status === 'completed').slice(0, 10).map(m => (
              <option key={m.id} value={m.id}>
                {m.opponent} - {formatDate(m.match_date)}
              </option>
            ))}
          </select>

          <select
            value={formation}
            onChange={(e) => setFormation(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#1a4d7a] focus:border-[#1a4d7a] bg-white"
            disabled={!canEdit}
          >
            {Object.entries(formationPositions).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>

          {canEdit && (
            <button
              onClick={resetTeam}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Reset Team"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={exportAsPNG}
            isLoading={isExporting}
            disabled={isExporting}
            className="flex items-center gap-1.5"
          >
            <FileImage className="w-4 h-4" />
            <span className="hidden sm:inline">PNG</span>
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
            <span className="hidden sm:inline">PDF</span>
          </Button>
        </div>
      </div>

      {/* Main Lineup */}
      <div id="lineup-content" ref={contentRef} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a4d7a] to-[#0f3460] text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Nchoathi FC</h2>
              <p className="text-sm opacity-80">
                {selectedMatch ? `vs ${matches.find(m => m.id === selectedMatch)?.opponent || 'Opponent'}` : 'Match Lineup'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{formationPositions[formation]?.label}</p>
              <p className="text-xs opacity-70">Formation</p>
            </div>
          </div>
        </div>

        {/* Football Field */}
        <div className="relative p-4" style={{ background: 'linear-gradient(180deg, #2d8a4e 0%, #1a6b3a 50%, #2d8a4e 100%)' }}>
          {/* Field Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.05) 40px, rgba(255,255,255,0.05) 41px)'
            }}></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20 transform -translate-x-1/2"></div>
            <div className="absolute left-1/2 top-1/2 w-24 h-24 rounded-full border-2 border-white/20 transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute left-1/2 top-0 w-8 h-12 border-2 border-white/20 transform -translate-x-1/2 rounded-b-full"></div>
            <div className="absolute left-1/2 bottom-0 w-8 h-12 border-2 border-white/20 transform -translate-x-1/2 rounded-t-full"></div>
          </div>

          {/* Field Players */}
          <div className="relative z-10 min-h-[480px] sm:min-h-[560px]">
            {/* GK */}
            <div className="absolute left-1/2 top-4 transform -translate-x-1/2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-yellow-400 border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-gray-800">
                GK
              </div>
            </div>

            {/* Other positions based on formation */}
            {formationPlayers.map((pos, index) => {
              if (pos.id === 'gk') return null
              const row = pos.row
              const col = pos.col
              const isTopRow = row === 2
              const isMidRow = row === 3
              const isBottomRow = row === 4
              
              // Calculate position percentages
              const topPos = isTopRow ? '28%' : isMidRow ? '50%' : '72%'
              const leftPos = col + '%'
              
              return (
                <div 
                  key={pos.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ top: topPos, left: leftPos }}
                >
                  {pos.player ? (
                    <div className="relative group">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-[#1a4d7a] shadow-lg flex items-center justify-center text-xs font-bold text-gray-800 hover:scale-110 transition-transform cursor-pointer">
                        {pos.player.shirt_number || '?'}
                      </div>
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-white bg-black/60 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {pos.player.display_name}
                      </div>
                    </div>
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-dashed border-white/50 bg-white/10 flex items-center justify-center text-xs text-white/50">
                      ?
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Bench Info */}
          <div className="relative z-10 mt-4 pt-4 border-t border-white/20">
            <div className="flex flex-wrap items-center justify-center gap-2 text-white/80 text-xs">
              <span className="bg-white/10 px-3 py-1 rounded-full">
                Starting XI: {startingXI.length}/11
              </span>
              <span className="bg-white/10 px-3 py-1 rounded-full">
                Subs: {substitutes.length}/7
              </span>
              <span className="bg-white/10 px-3 py-1 rounded-full">
                {formationPositions[formation]?.label}
              </span>
            </div>
          </div>
        </div>

        {/* Substitutes */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Substitutes
            <span className="text-xs text-gray-400">({substitutes.length}/7)</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {substitutes.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No substitutes selected</p>
            ) : (
              substitutes.map((player) => (
                <div key={player.id} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200 group">
                  <div className={`w-8 h-8 rounded-full ${getPositionColor(player.position)} text-white flex items-center justify-center text-xs font-bold`}>
                    {player.shirt_number || '?'}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{player.display_name}</span>
                  {canEdit && (
                    <button
                      onClick={() => moveToStarting(player)}
                      className="ml-1 text-green-600 hover:text-green-800 transition-colors"
                      title="Move to Starting XI"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => moveToAvailable(player)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Remove from substitutes"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => setShowDeleteConfirm(player)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete player"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Available Players */}
        {canEdit && (
          <div className="p-4 bg-white border-t border-gray-200">
            <button
              onClick={() => setShowAvailable(!showAvailable)}
              className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                Available Players
                <span className="text-xs text-gray-400">({availablePlayers.length})</span>
              </div>
              {showAvailable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showAvailable && (
              <div className="mt-3 flex flex-wrap gap-2">
                {availablePlayers.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No available players</p>
                ) : (
                  availablePlayers.map((player) => (
                    <div key={player.id} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className={`w-8 h-8 rounded-full ${getPositionColor(player.position)} text-white flex items-center justify-center text-xs font-bold`}>
                        {player.shirt_number || '?'}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{player.display_name}</span>
                      <button
                        onClick={() => {
                          if (startingXI.length < 11) {
                            moveToStarting(player)
                          } else {
                            moveToSubstitutes(player)
                          }
                        }}
                        className="text-green-600 hover:text-green-800 transition-colors"
                        title="Add to team"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => setShowDeleteConfirm(player)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete player"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
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