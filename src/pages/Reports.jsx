import React, { useState, useEffect } from 'react'
import { FileText, Download, Calendar, Users, Trophy, BarChart, Printer, ChevronDown } from 'lucide-react'
import { useMatches } from '../hooks/useMatches'
import { usePlayers } from '../hooks/usePlayers'
import Button from '../components/common/Button'
import Select from '../components/common/Select'
import Loading from '../components/common/Loading'
import { formatDate } from '../utils/helpers'

const Reports = () => {
  const { matches, loading: matchesLoading, getTeamStats } = useMatches()
  const { players, loading: playersLoading } = usePlayers()
  const [teamStats, setTeamStats] = useState(null)
  const [reportType, setReportType] = useState('season')
  const [generating, setGenerating] = useState(false)
  const [generatedReports, setGeneratedReports] = useState([])

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
      <div className="flex justify-center items-center h-64">
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500">Generate and view detailed reports</p>
      </div>

      {/* Generate Report Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Generate New Report</h3>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <Select
              label="Report Type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </Select>
          </div>
          <Button
            onClick={generateReport}
            isLoading={generating}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      {teamStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-500">Total Matches</p>
            <p className="text-2xl font-bold text-gray-900">{teamStats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-500">Win Rate</p>
            <p className="text-2xl font-bold text-green-600">{teamStats.winRate.toFixed(1)}%</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-500">Goals For</p>
            <p className="text-2xl font-bold text-blue-600">{teamStats.goalsFor}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-500">Goals Against</p>
            <p className="text-2xl font-bold text-red-600">{teamStats.goalsAgainst}</p>
          </div>
        </div>
      )}

      {/* Generated Reports */}
      {generatedReports.length > 0 ? (
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Generated Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedReports.map((report) => (
              <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1a4d7a]/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[#1a4d7a]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{report.title}</h4>
                      <p className="text-sm text-gray-500">{report.description}</p>
                      <p className="text-xs text-gray-400">{formatDate(report.date)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadReport(report)}
                    className="p-2 text-[#1a4d7a] hover:bg-[#1a4d7a]/10 rounded-lg transition-colors"
                    title="Download Report"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-sm">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Generated</h3>
          <p className="text-gray-500">
            Generate your first report using the form above
          </p>
        </div>
      )}
    </div>
  )
}

export default Reports