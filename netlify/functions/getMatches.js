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
      // Manejo de equipos aún no definidos en la fase de grupos
      const homeCode = match.homeTeam.tla || 'TBD'
      const awayCode = match.awayTeam.tla || 'TBD'
      const homeName = match.homeTeam.name || 'Por definir'
      const awayName = match.awayTeam.name || 'Por definir'

      // Determinar el resultado en base a los goles si el partido terminó
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
        // football-data envía utcDate (ISO 8601), lo pasamos a UNIX timestamp en segundos
        timestamp: Math.floor(new Date(match.utcDate).getTime() / 1000),
        home_team: homeName,
        away_team: awayName,
        home_goals: match.score.fullTime.home ?? null,
        away_goals: match.score.fullTime.away ?? null,
        status: match.status, // Valores típicos: SCHEDULED, TIMED, IN_PLAY, FINISHED
        result: resultStr
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