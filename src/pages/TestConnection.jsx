import React, { useState, useEffect } from 'react'
import supabase from '../lib/supabase'
import Loading from '../components/common/Loading'

const TestConnection = () => {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    testAll()
  }, [])

  const testAll = async () => {
    const tests = {}
    
    // Test 1: Teams
    try {
      const { data, error } = await supabase.from('teams').select('*')
      tests.teams = { success: !error, data: data || [], error: error?.message }
    } catch (e) {
      tests.teams = { success: false, error: e.message }
    }

    // Test 2: Players
    try {
      const { data, error } = await supabase.from('players').select('*')
      tests.players = { success: !error, data: data || [], error: error?.message }
    } catch (e) {
      tests.players = { success: false, error: e.message }
    }

    // Test 3: Matches
    try {
      const { data, error } = await supabase.from('matches').select('*')
      tests.matches = { success: !error, data: data || [], error: error?.message }
    } catch (e) {
      tests.matches = { success: false, error: e.message }
    }

    // Test 4: Competitions
    try {
      const { data, error } = await supabase.from('competitions').select('*')
      tests.competitions = { success: !error, data: data || [], error: error?.message }
    } catch (e) {
      tests.competitions = { success: false, error: e.message }
    }

    // Test 5: Venues
    try {
      const { data, error } = await supabase.from('venues').select('*')
      tests.venues = { success: !error, data: data || [], error: error?.message }
    } catch (e) {
      tests.venues = { success: false, error: e.message }
    }

    setResults(tests)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading size="lg" />
      </div>
    )
  }

  const allSuccess = Object.values(results).every(r => r.success)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      <div className={`p-4 rounded-lg mb-6 ${allSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {allSuccess ? '✅ All tests passed! Database is connected.' : '❌ Some tests failed. Check the details below.'}
      </div>

      <div className="space-y-4">
        {Object.entries(results).map(([name, test]) => (
          <div key={name} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg capitalize">{name}</h3>
              <span className={`px-2 py-1 rounded text-sm ${test.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {test.success ? '✅ Connected' : '❌ Failed'}
              </span>
            </div>
            {test.success ? (
              <div>
                <p className="text-sm text-gray-600">Found {test.data?.length || 0} records</p>
                {test.data && test.data.length > 0 && (
                  <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(test.data.slice(0, 3), null, 2)}
                  </pre>
                )}
              </div>
            ) : (
              <p className="text-sm text-red-600">Error: {test.error}</p>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={testAll}
        className="mt-6 px-4 py-2 bg-[#1a4d7a] text-white rounded-lg hover:bg-[#0f3460] transition-colors"
      >
        Run Tests Again
      </button>
    </div>
  )
}

export default TestConnection