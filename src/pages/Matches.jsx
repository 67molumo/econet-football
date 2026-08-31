import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Search, Filter, Eye, Edit, Trash2, Calendar, MapPin, Trophy, ChevronDown, ChevronUp, Download, Lock } from 'lucide-react'
import { useMatches } from '../hooks/useMatches'
import { useCompetitions } from '../hooks/useCompetitions'
import { useVenues } from '../hooks/useVenues'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Select from '../components/common/Select'
import Loading from '../components/common/Loading'
import EmptyState from '../components/common/EmptyState'
import Modal from '../components/common/Modal'
import MatchForm from '../components/Matches/MatchForm'
import MatchDetails from '../components/Matches/MatchDetails'
import { formatDate, getResultColor, getStatusColor } from '../utils/helpers'

const Matches = ({ isAdmin }) => {
    console.log('⚽ Matches received isAdmin:', isAdmin)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    result: '',
    competition: ''
  })
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingMatch, setEditingMatch] = useState(null)
  const [sortField, setSortField] = useState('match_date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [viewMode, setViewMode] = useState('table')

  const { matches, loading, deleteMatch, refreshMatches } = useMatches(filters)
  const { competitions, loading: compsLoading } = useCompetitions()
  const { venues, loading: venuesLoading } = useVenues()

  // Smart sorting
  const sortedMatches = useMemo(() => {
    if (!matches) return []
    const sorted = [...matches]
    sorted.sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]
      
      if (sortField === 'match_date') {
        aVal = new Date(aVal)
        bVal = new Date(bVal)
      }
      
      if (sortField === 'home_score' || sortField === 'away_score') {
        aVal = aVal || 0
        bVal = bVal || 0
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [matches, sortField, sortDirection])

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value })
  }

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value })
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleViewMatch = (match) => {
    setSelectedMatch(match)
    setShowDetailsModal(true)
  }

  const handleEditMatch = (match) => {
    if (!isAdmin) return
    setEditingMatch(match)
    setShowFormModal(true)
  }

  const handleDeleteMatch = async (id) => {
    if (!isAdmin) return
    if (window.confirm('Are you sure you want to delete this match?')) {
      try {
        await deleteMatch(id)
        await refreshMatches()
      } catch (error) {
        alert('Error deleting match: ' + error.message)
      }
    }
  }

  const handleFormSuccess = () => {
    setShowFormModal(false)
    setEditingMatch(null)
    refreshMatches()
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Opponent', 'Score', 'Venue', 'Competition', 'Status', 'Result']
    const rows = sortedMatches.map(m => [
      formatDate(m.match_date),
      m.opponent,
      m.status === 'completed' ? `${m.home_score}-${m.away_score}` : 'TBD',
      m.venues?.name || 'TBC',
      m.competitions?.name || 'Friendly',
      m.status,
      m.result || 'pending'
    ])
    
    let csv = headers.join(',') + '\n'
    rows.forEach(row => {
      csv += row.join(',') + '\n'
    })
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `matches_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading || compsLoading || venuesLoading) {
    return (
      <div className="flex justify-center items-center h-48 sm:h-64">
        <Loading size="lg" />
      </div>
    )
  }

  const getSortIcon = (field) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Matches</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {isAdmin ? 'Manage all match fixtures and results' : 'View all match fixtures and results'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Only Badge for Public Users */}
          {!isAdmin && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
              <Lock className="w-3 h-3" />
              <span className="hidden sm:inline">View Only</span>
            </div>
          )}
          
          {/* Export Button - Always visible */}
          <Button 
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            className="flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1.5"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          
          {/* Add Match - Admin Only */}
          {isAdmin && (
            <Button 
              className="flex items-center gap-2 text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2"
              onClick={() => {
                setEditingMatch(null)
                setShowFormModal(true)
              }}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Add Match</span>
              <span className="sm:hidden">Add</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex-1 min-w-[140px] sm:min-w-[180px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
            <Input
              placeholder="Search opponent..."
              value={filters.search}
              onChange={handleSearch}
              className="pl-8 sm:pl-9 text-sm h-9 sm:h-10"
            />
          </div>
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-auto min-w-[100px] sm:min-w-[130px] text-sm h-9 sm:h-10"
          >
            <option value="">Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="postponed">Postponed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <Select
            value={filters.result}
            onChange={(e) => handleFilterChange('result', e.target.value)}
            className="w-auto min-w-[100px] sm:min-w-[130px] text-sm h-9 sm:h-10"
          >
            <option value="">Result</option>
            <option value="win">Win</option>
            <option value="draw">Draw</option>
            <option value="loss">Loss</option>
          </Select>
          <Select
            value={filters.competition}
            onChange={(e) => handleFilterChange('competition', e.target.value)}
            className="w-auto min-w-[120px] sm:min-w-[150px] text-sm h-9 sm:h-10"
          >
            <option value="">Competition</option>
            {competitions.slice(0, 10).map(comp => (
              <option key={comp.id} value={comp.id}>{comp.name}</option>
            ))}
          </Select>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {sortedMatches.length} matches
          </span>
        </div>
      </div>

      {/* Matches Table */}
      {sortedMatches.length === 0 ? (
        <EmptyState
          icon="⚽"
          title="No matches found"
          description="Try adjusting your filters or add a new match"
          action={
            isAdmin ? (
              <Button onClick={() => {
                setEditingMatch(null)
                setShowFormModal(true)
              }}>
                Add Match
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Smart Table - Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors"
                    onClick={() => handleSort('match_date')}
                  >
                    <div className="flex items-center gap-1">
                      Date
                      {getSortIcon('match_date')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors"
                    onClick={() => handleSort('opponent')}
                  >
                    <div className="flex items-center gap-1">
                      Opponent
                      {getSortIcon('opponent')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors"
                    onClick={() => handleSort('home_score')}
                  >
                    <div className="flex items-center gap-1">
                      Score
                      {getSortIcon('home_score')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Venue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Competition</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedMatches.map((match) => (
                  <tr 
                    key={match.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleViewMatch(match)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{formatDate(match.match_date)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">Econet</span>
                        <span className="text-xs text-gray-400">vs</span>
                        <span className="font-medium text-gray-700 text-sm">{match.opponent}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {match.status === 'completed' ? (
                        <span className="font-bold text-gray-900 text-sm">
                          {match.home_score} - {match.away_score}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-600">{match.venues?.name || 'TBC'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <span className="text-sm text-gray-600">{match.competitions?.name || 'Friendly'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(match.status)}`}>
                          {match.status?.toUpperCase() || 'SCHEDULED'}
                        </span>
                        {match.status === 'completed' && (
                          <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getResultColor(match.result)}`}>
                            {match.result?.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleViewMatch(match)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleEditMatch(match)}
                              className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Edit Match"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMatch(match.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Match"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card View - Mobile & Tablet */}
          <div className="md:hidden divide-y divide-gray-100">
            {sortedMatches.map((match) => (
              <div 
                key={match.id} 
                className="p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleViewMatch(match)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">Econet</span>
                      <span className="text-xs text-gray-400">vs</span>
                      <span className="font-medium text-gray-700 text-sm truncate">{match.opponent}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(match.match_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {match.venues?.name || 'TBC'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        {match.competitions?.name || 'Friendly'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-2">
                    {match.status === 'completed' ? (
                      <span className="font-bold text-gray-900 text-base">
                        {match.home_score} - {match.away_score}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full ${getStatusColor(match.status)}`}>
                      {match.status?.toUpperCase() || 'SCHEDULED'}
                    </span>
                    {match.status === 'completed' && (
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full ${getResultColor(match.result)}`}>
                        {match.result?.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleViewMatch(match)}
                    className="px-2.5 py-1 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Details
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleEditMatch(match)}
                        className="px-2.5 py-1 text-xs text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMatch(match.id)}
                        className="px-2.5 py-1 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Table Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing <span className="font-medium text-gray-700">{sortedMatches.length}</span> matches
            </span>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50">
                Previous
              </button>
              <button className="px-3 py-1 rounded bg-[#1a4d7a] text-white">1</button>
              <button className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-100 transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Match Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Match Details"
        size="lg"
      >
        {selectedMatch && (
          <MatchDetails 
            matchId={selectedMatch.id} 
            onClose={() => setShowDetailsModal(false)}
            isAdmin={isAdmin}
          />
        )}
      </Modal>

      {/* Match Form Modal - Admin Only */}
      {isAdmin && (
        <Modal
          isOpen={showFormModal}
          onClose={() => {
            setShowFormModal(false)
            setEditingMatch(null)
          }}
          title={editingMatch ? 'Edit Match' : 'Add New Match'}
          size="lg"
        >
          <MatchForm
            match={editingMatch}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowFormModal(false)
              setEditingMatch(null)
            }}
          />
        </Modal>
      )}
    </div>
  )
}

export default Matches