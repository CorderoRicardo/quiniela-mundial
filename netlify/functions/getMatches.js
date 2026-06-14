import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export const handler = async (event, context) => {
  try {
    const REDIS_KEY = 'mundial_matches_2026'
    
    // 1. Verificar si hay datos cacheados
    const cachedData = await redis.get(REDIS_KEY)
    
    if (cachedData) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cachedData)
      }
    }

    // 2. Extraer datos de football-data.org si no hay caché
    const response = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
      headers: { 'X-Auth-Token': process.env.SPORTS_API_KEY }
    })

    if (!response.ok) {
      throw new Error(`Error en la API deportiva: ${response.status}`)
    }

    const rawData = await response.json()

    // 3. Transformar y normalizar los datos al contrato del frontend
    const formattedData = {}

    rawData.matches.forEach(match => {
      const homeCode = match.homeTeam?.tla || 'TBD'
      const awayCode = match.awayTeam?.tla || 'TBD'
      const homeName = match.homeTeam?.name || 'Por definir'
      const awayName = match.awayTeam?.name || 'Por definir'
      
      // Extraemos las banderas (crest)
      const homeCrest = match.homeTeam?.crest || ''
      const awayCrest = match.awayTeam?.crest || ''

      // Limpiamos el texto del grupo (ej. de "GROUP_A" a "Grupo A")
      const groupName = match.group ? match.group.replace('GROUP_', 'Grupo ') : 'Fase Final'

      let resultStr = null
      if (match.status === 'FINISHED') {
        const homeGoals = match.score.fullTime.home
        const awayGoals = match.score.fullTime.away
        if (homeGoals > awayGoals) resultStr = 'Local'
        else if (homeGoals < awayGoals) resultStr = 'Visitante'
        else resultStr = 'Empate'
      }

      formattedData[match.id] = {
        match_name: `${homeCode}_vs_${awayCode}`,
        timestamp: Math.floor(new Date(match.utcDate).getTime() / 1000),
        group: groupName,        // <-- NUEVO
        home_crest: homeCrest,   // <-- NUEVO
        away_crest: awayCrest,   // <-- NUEVO
        home_team: homeName,
        away_team: awayName,
        home_goals: match.score.fullTime.home ?? null,
        away_goals: match.score.fullTime.away ?? null,
        status: match.status,
        result: resultStr,
        last_updated: match.lastUpdated
      }
    })

    // 4. Cargar los datos a Redis. 
    // Usamos 'ex: 3600' para que el TTL sea de 1 hora.
    // Durante el mundial, podrías bajar este TTL a 300 (5 minutos) para mayor inmediatez.
    await redis.set(REDIS_KEY, formattedData, { ex: 3600 })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formattedData)
    }

  } catch (error) {
    console.error('Error en getMatches:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor al procesar los partidos.' })
    }
  }
}