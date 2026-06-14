import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// Definimos el TTL deseado en segundos (Ej. 3600 = 1 hora)
const CACHE_TTL_SECONDS = 900 

export const handler = async (event, context) => {
  try {
    const REDIS_KEY = 'mundial_matches_2026'
    
    // 1. Intentar obtener el contenedor guardado en Redis
    const cachedData = await redis.get(REDIS_KEY)
    
    // 2. Evaluación de la edad del caché (cache_date)
    if (cachedData && cachedData.cache_date) {
      const cacheTimestamp = new Date(cachedData.cache_date).getTime()
      const currentTimestamp = new Date().getTime()
      
      // Calculamos el lapso transcurrido en segundos
      const ageInSeconds = (currentTimestamp - cacheTimestamp) / 1000

      // Si el lapso es menor al TTL, la caché sigue fresca, la devolvemos inmediatamente
      if (ageInSeconds < CACHE_TTL_SECONDS) {
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cachedData)
        }
      }
      
      // Si el código llega aquí, significa que ageInSeconds >= CACHE_TTL_SECONDS
      // La caché existe pero está "caducada". Intentaremos actualizarla en el paso 3.
      console.log(`Caché expirado (Edad: ${Math.floor(ageInSeconds)}s). Renovando...`)
    }

    // 3. Extraer datos de football-data.org 
    let response;
    try {
      response = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
        headers: { 'X-Auth-Token': process.env.SPORTS_API_KEY }
      })
      
      if (!response.ok) throw new Error(`Status API: ${response.status}`)
        
    } catch (apiError) {
      // PATRÓN DE RESPALDO (FALLBACK): 
      // Si la API falla pero tenemos caché caducado, devolvemos el viejo en lugar de fallar
      console.error('La API falló, usando caché viejo como respaldo:', apiError)
      if (cachedData) {
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cachedData)
        }
      }
      throw apiError // Si no hay caché de respaldo, lanzamos el error original
    }

    const rawData = await response.json()

    // 4. Transformar y normalizar los datos al contrato del frontend
    const formattedData = []

    rawData.matches.forEach(match => {
      const homeCode = match.homeTeam?.tla || 'TBD'
      const awayCode = match.awayTeam?.tla || 'TBD'
      const homeName = match.homeTeam?.name || 'Por definir'
      const awayName = match.awayTeam?.name || 'Por definir'
      const homeCrest = match.homeTeam?.crest || ''
      const awayCrest = match.awayTeam?.crest || ''
      const groupName = match.group ? match.group.replace('GROUP_', 'Grupo ') : 'Fase Final'

      let resultStr = null
      if (match.status === 'FINISHED') {
        const homeGoals = match.score.fullTime.home
        const awayGoals = match.score.fullTime.away
        if (homeGoals > awayGoals) resultStr = 'Local'
        else if (homeGoals < awayGoals) resultStr = 'Visitante'
        else resultStr = 'Empate'
      }

      formattedData.push({
        match_id: String(match.id),
        match_name: `${homeCode}_vs_${awayCode}`,
        timestamp: Math.floor(new Date(match.utcDate).getTime() / 1000),
        group: groupName,
        home_crest: homeCrest,
        away_crest: awayCrest,
        home_team: homeName,
        away_team: awayName,
        home_goals: match.score.fullTime.home ?? null,
        away_goals: match.score.fullTime.away ?? null,
        status: match.status,
        result: resultStr,
        last_updated: match.lastUpdated
      })
    })

    // 5. Crear el contenedor con la nueva fecha
    const cachePayload = {
      cache_date: new Date().toISOString(),
      matches: formattedData
    }

    // Guardamos en Redis. 
    // NOTA: Quitamos la propiedad '{ ex: 3600 }' para que Redis no elimine la llave físicamente,
    // dejando que la validación manual de arriba sea la que decida cuándo actualizar y permita el respaldo.
    await redis.set(REDIS_KEY, cachePayload)

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cachePayload)
    }

  } catch (error) {
    console.error('Error en getMatches:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor al procesar los partidos.' })
    }
  }
}