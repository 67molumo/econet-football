import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { FileText, Download, Calendar, Users, Trophy, BarChart, Printer, ChevronDown, Lock } from 'lucide-react'
import { useMatches } from '../hooks/useMatches'
import { usePlayers } from '../hooks/usePlayers'
import Button from '../components/common/Button'
import Select from '../components/common/Select'
import Loading from '../components/common/Loading'
import { formatDate } from '../utils/helpers'

const Reports = () => {
  // Get isAdmin and role from outlet context
  const { isAdmin, role } = useOutletContext()
  console.log('📊 Reports - isAdmin:', isAdmin, 'role:', role)

  const { matches, loading: matchesLoading, getTeamStats } = useMatches()
  const { players, loading: playersLoading } = usePlayers()
  const [teamStats, setTeamStats] = useState(null)
  const [reportType, setReportType] = useState('season')
  const [generating, setGenerating] = useState(false)
  const [generatedReports, setGeneratedReports] = useState([])

  // Check if user can generate reports (admin or manager)
  const canGenerate = isAdmin || role === 'manager'

  useEffect(() => {
    if (matches.length > 0) {
      loadStats()
    }
  }, [matches])

  const loadStats = async () => {
    try {
      const stats = await getTeamStats()
      setTeamStats(stats)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const generateReport = async () => {
    if (!canGenerate) return
    setGenerating(true)
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const report = {
        id: Date.now(),
        type: reportType,
        title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
        description: `Generated on ${new Date().toLocaleDateString()}`,
        date: new Date().toISOString(),
        data: {
          matches: matches.length,
          players: players.length,
          ...teamStats
        }
      }
      
      setGeneratedReports([report, ...generatedReports])
    } catch (error) {
      alert('Error generating report: ' + error.message)
    } finally {
      setGenerating(false)
    }
  }

  const downloadReport = (report) => {
    // Create a text file with report data
    const content = `
===========================================
ECONET FOOTBALL CLUB
${report.title}
===========================================

Generated: ${formatDate(report.date)}

Summary:
- Total Matches: ${report.data.matches}
- Total Players: ${report.data.players}
- Wins: ${report.data.wins || 0}
- Draws: ${report.data.draws || 0}
- Losses: ${report.data.losses || 0}
- Goals For: ${report.data.goalsFor || 0}
- Goals Against: ${report.data.goalsAgainst || 0}
- Win Rate: ${(report.data.winRate || 0).toFixed(1)}%

===========================================
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.title.toLowerCase().replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (matchesLoading || playersLoading) {
    return (
      <div className="flex justify-center items-center h-48 sm:h-64">
        <Loading size="lg" />
      </div>
    )
  }

  const reportTypes = [
    { value: 'season', label: 'Season Report' },
    { value: 'player', label: 'Player Performance' },
    { value: 'match', label: 'Match Analysis' },
    { value: 'competition', label: 'Competition Report' }
  ]

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-xs sm:text-sm text-gray-500">
              {canGenerate ? 'Generate and view detailed reports' : 'View detailed reports'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Only Badge */}
            {!canGenerate && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
                <Lock className="w-3 h-3" />
                <span>View Only</span>
              </div>
            )}
            
            {/* Manager Badge */}
            {role === 'manager' && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span>Manager</span>
              </div>
            )}
            
            {/* Admin Badge */}
            {isAdmin && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span>Admin</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generate Report Section - Admin or Manager Only */}
      {canGenerate && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-3 sm:mb-4">Generate New Report</h3>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-end">
            <div className="flex-1 w-full sm:w-auto">
              <Select
                label="Report Type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full"
              >
                {reportTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </Select>
            </div>
            <Button
              onClick={generateReport}
              isLoading={generating}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <FileText className="w-4 h-4" />
              Generate Report
            </Button>
          </div>
        </div>
      )}

      {/* Public message when user can't generate */}
      {!canGenerate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm text-blue-700">
            <span className="font-medium">🔍 View Only Mode:</span> You can view all reports. 
            {!isAdmin && role !== 'manager' && ' Sign in as admin or manager to generate new reports.'}
            {role === 'viewer' && ' Contact an admin for report generation access.'}
          </p>
        </div>
      )}

      {/* Stats Summary - Always Visible */}
      {teamStats && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
            <p className="text-[10px] sm:text-sm text-gray-500">Total Matches</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{teamStats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
            <p className="text-[10px] sm:text-sm text-gray-500">Win Rate</p>
            <p className="text-lg sm:text-2xl font-bold text-green-600">{teamStats.winRate.toFixed(1)}%</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
            <p className="text-[10px] sm:text-sm text-gray-500">Goals For</p>
            <p className="text-lg sm:text-2xl font-bold text-blue-600">{teamStats.goalsFor}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
            <p className="text-[10px] sm:text-sm text-gray-500">Goals Against</p>
            <p className="text-lg sm:text-2xl font-bold text-red-600">{teamStats.goalsAgainst}</p>
          </div>
        </div>
      )}

      {/* Generated Reports */}
      {generatedReports.length > 0 ? (
        <div>
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-3 sm:mb-4">Generated Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {generatedReports.map((report) => (
              <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#1a4d7a]/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#1a4d7a]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{report.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{report.description}</p>
                      <p className="text-[10px] sm:text-xs text-gray-400">{formatDate(report.date)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadReport(report)}
                    className="p-1.5 sm:p-2 text-[#1a4d7a] hover:bg-[#1a4d7a]/10 rounded-lg transition-colors flex-shrink-0"
                    title="Download Report"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                  <span className="text-gray-500">Matches: <strong>{report.data.matches}</strong></span>
                  <span className="text-gray-500">Players: <strong>{report.data.players}</strong></span>
                  {report.data.wins !== undefined && (
                    <span className="text-gray-500">W/D/L: <strong>{report.data.wins}/{report.data.draws}/{report.data.losses}</strong></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
          <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">No Reports Generated</h3>
          <p className="text-xs sm:text-sm text-gray-500">
            {canGenerate 
              ? 'Generate your first report using the form above' 
              : 'Reports will appear here once generated by an admin or manager'}
          </p>
        </div>
      )}
    </div>
  )
}

export default Reports