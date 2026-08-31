import supabase from './supabase'

export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test 1: Check if we can query the teams table
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .limit(1)
    
    if (teamsError) {
      console.error('❌ Supabase connection failed:', teamsError)
      return false
    }
    
    console.log('✅ Supabase connected successfully!')
    console.log('Teams found:', teams)
    
    // Test 2: Check if we can query matches
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .limit(5)
    
    if (matchesError) {
      console.warn('⚠️ Could not fetch matches:', matchesError)
    } else {
      console.log(`✅ Found ${matches?.length || 0} matches`)
    }
    
    // Test 3: Check if we can query players
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .limit(5)
    
    if (playersError) {
      console.warn('⚠️ Could not fetch players:', playersError)
    } else {
      console.log(`✅ Found ${players?.length || 0} players`)
    }
    
    return true
  } catch (error) {
    console.error('❌ Connection test failed:', error)
    return false
  }
}