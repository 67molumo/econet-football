import React from 'react'
import { Shield, Zap, Target, User } from 'lucide-react'

const LineupField = ({ lineup, formation = '4-4-2', showNames = true, compact = false }) => {
  if (!lineup || !lineup.lineup_players) return null

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

  const getPositionColor = (position) => {
    const colors = {
      GK: 'bg-yellow-500',
      DEF: 'bg-blue-500',
      MID: 'bg-green-500',
      FWD: 'bg-red-500'
    }
    return colors[position] || 'bg-gray-500'
  }

  const getPositionIcon = (position) => {
    const icons = {
      GK: <Shield className="w-3 h-3" />,
      DEF: <Shield className="w-3 h-3" />,
      MID: <Zap className="w-3 h-3" />,
      FWD: <Target className="w-3 h-3" />
    }
    return icons[position] || <User className="w-3 h-3" />
  }

  const getFormationPlayers = () => {
    const positions = formationPositions[formation]?.players || formationPositions['4-4-2'].players
    const startingPlayers = lineup.lineup_players?.filter(p => p.is_starting) || []
    const assigned = []
    
    positions.forEach((pos, index) => {
      if (index < startingPlayers.length) {
        assigned.push({
          ...pos,
          player: startingPlayers[index]
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

  const formationPlayers = getFormationPlayers()
  const startingCount = lineup.lineup_players?.filter(p => p.is_starting).length || 0
  const substituteCount = lineup.lineup_players?.filter(p => p.is_substitute).length || 0

  if (compact) {
    // Compact view for Dashboard
    return (
      <div className="relative p-3 rounded-lg overflow-hidden" style={{ 
        background: 'linear-gradient(180deg, #1a9e4a 0%, #2daf5e 25%, #3abf6e 50%, #2daf5e 75%, #1a9e4a 100%)',
        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.1)',
        minHeight: '200px'
      }}>
        {/* Field Markings */}
        <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20 transform -translate-x-1/2"></div>
          <div className="absolute left-1/2 top-1/2 w-16 h-16 rounded-full border border-white/20 transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute left-1/2 top-0 w-10 h-8 border border-white/20 transform -translate-x-1/2 rounded-b-full"></div>
          <div className="absolute left-1/2 bottom-0 w-10 h-8 border border-white/20 transform -translate-x-1/2 rounded-t-full"></div>
        </div>

        {/* Grass Texture */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.05) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(255,255,255,0.05) 0%, transparent 50%),
            repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 21px)
          `,
          pointerEvents: 'none'
        }}></div>

        {/* Players on Field - Compact */}
        <div className="relative z-10 min-h-[180px]">
          {/* GK */}
          <div className="absolute left-1/2 top-2 transform -translate-x-1/2">
            {formationPlayers[0]?.player ? (
              <div className="text-center">
                <div className={`w-8 h-8 rounded-full border-2 border-yellow-300 shadow-lg flex items-center justify-center text-xs font-bold text-white ${getPositionColor('GK')} mx-auto`}>
                  {formationPlayers[0].player.players?.shirt_number || '?'}
                </div>
                {showNames && (
                  <p className="text-[8px] font-medium text-white mt-0.5 bg-black/50 px-1 py-0.5 rounded truncate max-w-[40px] mx-auto">
                    {formationPlayers[0].player.players?.display_name}
                  </p>
                )}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full border border-dashed border-white/40 bg-white/10 flex items-center justify-center text-[8px] text-white/40 mx-auto">
                GK
              </div>
            )}
          </div>

          {/* Other positions - Compact */}
          {formationPlayers.map((pos, index) => {
            if (pos.id === 'gk') return null
            const row = pos.row
            const col = pos.col
            
            const topPos = row === 2 ? '22%' : row === 3 ? '45%' : '68%'
            const leftPos = col + '%'
            
            return (
              <div 
                key={pos.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 text-center"
                style={{ top: topPos, left: leftPos }}
              >
                {pos.player ? (
                  <>
                    <div className={`w-7 h-7 rounded-full border border-white shadow-lg flex items-center justify-center text-[9px] font-bold text-white ${getPositionColor(pos.player.players?.position)} mx-auto`}>
                      {pos.player.players?.shirt_number || '?'}
                    </div>
                    {showNames && (
                      <p className="text-[7px] font-medium text-white mt-0.5 bg-black/50 px-1 py-0.5 rounded truncate max-w-[35px] mx-auto">
                        {pos.player.players?.display_name}
                      </p>
                    )}
                    <p className="text-[6px] font-bold text-white/70 mt-0.5">{pos.label}</p>
                  </>
                ) : (
                  <div className="w-7 h-7 rounded-full border border-dashed border-white/40 bg-white/10 flex items-center justify-center text-[7px] text-white/40 mx-auto">
                    {pos.label}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Stats on Field - Compact */}
        <div className="relative z-10 mt-1 pt-1 border-t border-white/20 text-center">
          <span className="text-[8px] text-white/70 bg-black/30 px-2 py-0.5 rounded-full">
            {formation} • {startingCount}/11
          </span>
        </div>
      </div>
    )
  }

  // Full field view for Home page
  return (
    <div className="relative p-4 rounded-lg overflow-hidden" style={{ 
      background: 'linear-gradient(180deg, #1a9e4a 0%, #2daf5e 25%, #3abf6e 50%, #2daf5e 75%, #1a9e4a 100%)',
      boxShadow: 'inset 0 0 60px rgba(0,0,0,0.1)',
      minHeight: '400px'
    }}>
      {/* Field Markings */}
      <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/30 transform -translate-x-1/2"></div>
        <div className="absolute left-1/2 top-1/2 w-24 h-24 rounded-full border-2 border-white/30 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute left-1/2 top-0 w-16 h-12 border-2 border-white/30 transform -translate-x-1/2 rounded-b-full"></div>
        <div className="absolute left-1/2 bottom-0 w-16 h-12 border-2 border-white/30 transform -translate-x-1/2 rounded-t-full"></div>
        <div className="absolute left-1/2 top-2 w-4 h-3 border-2 border-white/30 transform -translate-x-1/2 rounded-b-full"></div>
        <div className="absolute left-1/2 bottom-2 w-4 h-3 border-2 border-white/30 transform -translate-x-1/2 rounded-t-full"></div>
      </div>

      {/* Grass Texture */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.05) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 70%, rgba(255,255,255,0.05) 0%, transparent 50%),
          repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.04) 40px, rgba(255,255,255,0.04) 41px)
        `,
        pointerEvents: 'none'
      }}></div>

      {/* Players on Field */}
      <div className="relative z-10 min-h-[380px]">
        {/* GK */}
        <div className="absolute left-1/2 top-4 transform -translate-x-1/2">
          {formationPlayers[0]?.player ? (
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full border-2 border-yellow-300 shadow-lg flex items-center justify-center text-sm font-bold text-white ${getPositionColor('GK')} mx-auto`}>
                {formationPlayers[0].player.players?.shirt_number || '?'}
              </div>
              {showNames && (
                <p className="text-xs font-semibold text-white mt-1 bg-black/50 px-2 py-0.5 rounded">
                  {formationPlayers[0].player.players?.display_name}
                </p>
              )}
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/50 bg-white/10 flex items-center justify-center text-xs text-white/50 mx-auto">
              GK
            </div>
          )}
        </div>

        {/* Other positions */}
        {formationPlayers.map((pos, index) => {
          if (pos.id === 'gk') return null
          const row = pos.row
          const col = pos.col
          
          const topPos = row === 2 ? '28%' : row === 3 ? '50%' : '72%'
          const leftPos = col + '%'
          
          return (
            <div 
              key={pos.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 text-center"
              style={{ top: topPos, left: leftPos }}
            >
              {pos.player ? (
                <>
                  <div className={`w-10 h-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-white ${getPositionColor(pos.player.players?.position)} mx-auto`}>
                    {pos.player.players?.shirt_number || '?'}
                  </div>
                  {showNames && (
                    <p className="text-[10px] font-medium text-white mt-0.5 bg-black/50 px-1.5 py-0.5 rounded truncate max-w-[60px] mx-auto">
                      {pos.player.players?.display_name}
                    </p>
                  )}
                  <p className="text-[8px] font-bold text-white/80 mt-0.5">{pos.label}</p>
                </>
              ) : (
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-white/50 bg-white/10 flex items-center justify-center text-[10px] text-white/50 mx-auto">
                  {pos.label}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Stats on Field */}
      <div className="relative z-10 mt-2 pt-2 border-t border-white/20 text-center">
        <span className="text-xs text-white/70 bg-black/30 px-3 py-1 rounded-full">
          {formation} • {startingCount}/11
        </span>
      </div>
    </div>
  )
}

export default LineupField