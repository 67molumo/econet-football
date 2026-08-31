import React, { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Calendar, MapPin, Trophy, Users, Award, AlertCircle, Download, FileImage, FileText, Plus, Trash2, Edit2, X, Lock } from 'lucide-react'
import { useMatches } from '../../hooks/useMatches'
import Loading from '../common/Loading'
import Button from '../common/Button'
import Modal from '../common/Modal'
import AddScorerForm from './AddScorerForm'
import AddAssistForm from './AddAssistForm'
import AddCardForm from './AddCardForm'
import { formatDate, getStatusColor } from '../../utils/helpers'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const MatchDetails = ({ matchId, onClose }) => {
  // Get isAdmin and role from outlet context
  const { isAdmin, role } = useOutletContext()
  console.log('📋 MatchDetails - isAdmin:', isAdmin, 'role:', role)

  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [showAddScorerModal, setShowAddScorerModal] = useState(false)
  const [showAddAssistModal, setShowAddAssistModal] = useState(false)
  const [showAddCardModal, setShowAddCardModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const { getMatchById, removeMatchScorer, removeMatchAssist, removePlayerCard } = useMatches()
  const contentRef = useRef(null)

  // Check if user can edit (admin or manager)
  const canEdit = isAdmin || role === 'manager'

  const loadMatchDetails = async () => {
    try {
      setLoading(true)
      const data = await getMatchById(matchId)
      setMatch(data)
    } catch (error) {
      console.error('Error loading match details:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMatchDetails()
  }, [matchId])

  const refreshMatch = async () => {
    setRefreshing(true)
    await loadMatchDetails()
    setRefreshing(false)
  }

  const handleRemoveScorer = async (id, playerName) => {
    if (!canEdit) return
    if (window.confirm(`Remove ${playerName} from goal scorers?`)) {
      try {
        await removeMatchScorer(id)
        await refreshMatch()
      } catch (error) {
        alert('Error removing scorer: ' + error.message)
      }
    }
  }

  const handleRemoveAssist = async (id, playerName) => {
    if (!canEdit) return
    if (window.confirm(`Remove ${playerName} from assists?`)) {
      try {
        await removeMatchAssist(id)
        await refreshMatch()
      } catch (error) {
        alert('Error removing assist: ' + error.message)
      }
    }
  }

  const handleRemoveCard = async (id, playerName) => {
    if (!canEdit) return
    if (window.confirm(`Remove card from ${playerName}?`)) {
      try {
        await removePlayerCard(id)
        await refreshMatch()
      } catch (error) {
        alert('Error removing card: ' + error.message)
      }
    }
  }

  const exportAsPNG = async () => {
    if (!contentRef.current) return
    
    setExporting(true)
    try {
      const element = contentRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        useCORS: true
      })
      
      const link = document.createElement('a')
      link.download = `match-${match.opponent}-${formatDate(match.match_date)}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Error exporting PNG:', error)
      alert('Error exporting PNG. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const exportAsPDF = async () => {
    if (!contentRef.current) return
    
    setExporting(true)
    try {
      const element = contentRef.current
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
      pdf.save(`match-${match.opponent}-${formatDate(match.match_date)}.pdf`)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Error exporting PDF. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loading size="lg" />
      </div>
    )
  }

  if (!match) {
    return (
      <div className="text-center py-12 text-gray-500">
        Match not found
      </div>
    )
  }

  const getResultBadge = (result) => {
    const styles = {
      win: 'bg-green-100 text-green-800 border-green-200',
      draw: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      loss: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return styles[result] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-4">
      {/* Export Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>Match ID: {matchId.slice(0, 8)}</span>
          {refreshing && <Loading size="sm" />}
          {!canEdit && (
            <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              <Lock className="w-2.5 h-2.5" />
              View Only
            </span>
          )}
          {role === 'manager' && (
            <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              Manager
            </span>
          )}
          {isAdmin && (
            <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              Admin
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportAsPNG}
            isLoading={exporting}
            disabled={exporting}
            className="flex items-center gap-1.5 text-xs"
          >
            <FileImage className="w-3 h-3" />
            PNG
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportAsPDF}
            isLoading={exporting}
            disabled={exporting}
            className="flex items-center gap-1.5 text-xs"
          >
            <FileText className="w-3 h-3" />
            PDF
          </Button>
        </div>
      </div>

      {/* Content to Export */}
      <div ref={contentRef} className="bg-white p-3 sm:p-4 rounded-lg">
        {/* Match Header */}
        <div className="text-center border-b border-gray-200 pb-3 mb-3">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1">
            <span className="text-lg sm:text-xl font-bold text-gray-900">Econet FC</span>
            <span className="text-lg sm:text-xl font-bold text-gray-400">vs</span>
            <span className="text-lg sm:text-xl font-bold text-gray-900">{match.opponent}</span>
          </div>
          {match.status === 'completed' ? (
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <span className="text-2xl sm:text-3xl font-bold text-[#1a4d7a]">{match.home_score}</span>
              <span className="text-xl sm:text-2xl font-bold text-gray-400">-</span>
              <span className="text-2xl sm:text-3xl font-bold text-[#1a4d7a]">{match.away_score}</span>
              <span className={`ml-2 sm:ml-3 inline-flex px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full border ${getResultBadge(match.result)}`}>
                {match.result?.toUpperCase()}
              </span>
            </div>
          ) : (
            <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(match.status)}`}>
              {match.status?.toUpperCase()}
            </span>
          )}
        </div>

        {/* Match Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 bg-gray-50 rounded-lg p-2 sm:p-3 mb-3">
          <div className="text-center">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-auto mb-0.5" />
            <p className="text-[9px] sm:text-[10px] text-gray-500">Date</p>
            <p className="text-[10px] sm:text-xs font-medium text-gray-900">{formatDate(match.match_date)}</p>
          </div>
          <div className="text-center">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-auto mb-0.5" />
            <p className="text-[9px] sm:text-[10px] text-gray-500">Venue</p>
            <p className="text-[10px] sm:text-xs font-medium text-gray-900">{match.venues?.name || 'TBC'}</p>
          </div>
          <div className="text-center">
            <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-auto mb-0.5" />
            <p className="text-[9px] sm:text-[10px] text-gray-500">Competition</p>
            <p className="text-[10px] sm:text-xs font-medium text-gray-900">{match.competitions?.name || 'Friendly'}</p>
          </div>
          <div className="text-center">
            <Award className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-auto mb-0.5" />
            <p className="text-[9px] sm:text-[10px] text-gray-500">Season</p>
            <p className="text-[10px] sm:text-xs font-medium text-gray-900">{match.competitions?.season || '2026'}</p>
          </div>
        </div>

        {/* Match Notes */}
        {match.notes && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
            <p className="text-xs text-blue-800">{match.notes}</p>
          </div>
        )}

        {/* Goal Scorers - With Add/Remove (Admin or Manager Only) */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="font-semibold text-gray-900 text-xs sm:text-sm flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#e67e22]" />
              Goal Scorers
              <span className="text-xs text-gray-400 font-normal">({match.match_scorers?.length || 0})</span>
            </h4>
            {canEdit && match.status !== 'completed' && (
              <button
                onClick={() => setShowAddScorerModal(true)}
                className="flex items-center gap-1 px-2 py-0.5 text-xs text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            )}
          </div>
          {match.match_scorers && match.match_scorers.length > 0 ? (
            <div className="space-y-1">
              {match.match_scorers.map((scorer, index) => (
                <div key={scorer.id || index} className="flex items-center justify-between p-1.5 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#1a4d7a] text-white flex items-center justify-center text-[9px] font-bold">
                      {scorer.players?.shirt_number || '?'}
                    </span>
                    <span className="font-medium text-gray-900 text-sm">{scorer.players?.display_name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#e67e22]">{scorer.goals}</span>
                    <span className="text-[10px] text-gray-500">goal{scorer.goals > 1 ? 's' : ''}</span>
                    {canEdit && match.status !== 'completed' && (
                      <button
                        onClick={() => handleRemoveScorer(scorer.id, scorer.players?.display_name || 'Unknown')}
                        className="p-0.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No goals recorded</p>
          )}
        </div>

        {/* Assists - With Add/Remove (Admin or Manager Only) */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="font-semibold text-gray-900 text-xs sm:text-sm flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              Assists
              <span className="text-xs text-gray-400 font-normal">({match.match_assists?.length || 0})</span>
            </h4>
            {canEdit && match.status !== 'completed' && (
              <button
                onClick={() => setShowAddAssistModal(true)}
                className="flex items-center gap-1 px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            )}
          </div>
          {match.match_assists && match.match_assists.length > 0 ? (
            <div className="space-y-1">
              {match.match_assists.map((assist, index) => (
                <div key={assist.id || index} className="flex items-center justify-between p-1.5 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold">
                      {assist.players?.shirt_number || '?'}
                    </span>
                    <span className="font-medium text-gray-900 text-sm">{assist.players?.display_name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-blue-600">{assist.assists}</span>
                    <span className="text-[10px] text-gray-500">assist{assist.assists > 1 ? 's' : ''}</span>
                    {canEdit && match.status !== 'completed' && (
                      <button
                        onClick={() => handleRemoveAssist(assist.id, assist.players?.display_name || 'Unknown')}
                        className="p-0.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No assists recorded</p>
          )}
        </div>

        {/* Cards - With Add/Remove (Admin or Manager Only) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="font-semibold text-gray-900 text-xs sm:text-sm flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
              Cards
              <span className="text-xs text-gray-400 font-normal">({match.player_cards?.length || 0})</span>
            </h4>
            {canEdit && match.status !== 'completed' && (
              <button
                onClick={() => setShowAddCardModal(true)}
                className="flex items-center gap-1 px-2 py-0.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            )}
          </div>
          {match.player_cards && match.player_cards.length > 0 ? (
            <div className="space-y-1">
              {match.player_cards.map((card, index) => (
                <div key={card.id || index} className="flex items-center justify-between p-1.5 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-[9px] font-bold">
                      {card.players?.shirt_number || '?'}
                    </span>
                    <span className="font-medium text-gray-900 text-sm">{card.players?.display_name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-semibold rounded-full ${
                      card.card_type === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {card.card_type?.toUpperCase()}
                    </span>
                    {card.minute && (
                      <span className="text-[10px] text-gray-500">{card.minute}'</span>
                    )}
                    {canEdit && match.status !== 'completed' && (
                      <button
                        onClick={() => handleRemoveCard(card.id, card.players?.display_name || 'Unknown')}
                        className="p-0.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No cards recorded</p>
          )}
        </div>

        {/* Footer for export */}
        <div className="mt-3 pt-2 border-t border-gray-200 text-center">
          <p className="text-[7px] sm:text-[8px] text-gray-400">
            Generated from Econet Football Management System • {new Date().toLocaleString()}
          </p>
        </div>
      </div>

      {/* Add Scorer Modal - Admin or Manager Only */}
      {canEdit && (
        <Modal
          isOpen={showAddScorerModal}
          onClose={() => setShowAddScorerModal(false)}
          title="Add Goal Scorer"
          size="sm"
        >
          <AddScorerForm
            matchId={matchId}
            onSuccess={() => {
              setShowAddScorerModal(false)
              refreshMatch()
            }}
            onCancel={() => setShowAddScorerModal(false)}
          />
        </Modal>
      )}

      {/* Add Assist Modal - Admin or Manager Only */}
      {canEdit && (
        <Modal
          isOpen={showAddAssistModal}
          onClose={() => setShowAddAssistModal(false)}
          title="Add Assist"
          size="sm"
        >
          <AddAssistForm
            matchId={matchId}
            onSuccess={() => {
              setShowAddAssistModal(false)
              refreshMatch()
            }}
            onCancel={() => setShowAddAssistModal(false)}
          />
        </Modal>
      )}

      {/* Add Card Modal - Admin or Manager Only */}
      {canEdit && (
        <Modal
          isOpen={showAddCardModal}
          onClose={() => setShowAddCardModal(false)}
          title="Add Card"
          size="sm"
        >
          <AddCardForm
            matchId={matchId}
            onSuccess={() => {
              setShowAddCardModal(false)
              refreshMatch()
            }}
            onCancel={() => setShowAddCardModal(false)}
          />
        </Modal>
      )}
    </div>
  )
}

export default MatchDetails