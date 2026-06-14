import { Redis } from '@upstash/redis'

// Inicializamos la conexión a Redis usando variables de entorno
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export const handler = async (event, context) => {
  try {
    const REDIS_KEY = 'mundial_matches_2026'
    
    // 1. Intentar obtener los datos cacheados de Redis
    const cachedData = await redis.get(REDIS_KEY)
    
    if (cachedData) {
      // Si existen, los devolvemos directamente (Súper rápido y ahorra llamadas a la API)
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cachedData)
      }
    }

    // 2. Si no hay caché, consultamos la API Deportiva (Ej. football-data.org o API-Football)
    // NOTA: Esta es una URL de ejemplo, la ajustaremos según la API que elijas
    const apiResponse = await fetch('URL_DE_TU_API_DEPORTIVA_AQUI', {
      headers: { 'X-Auth-Token': process.env.SPORTS_API_KEY }
    })
    
    const rawData = await apiResponse.json()

    // 3. Transformar los datos crudos al contrato JSON que tu frontend (Vue) ya entiende
    const formattedData = {}
    
    // (Aquí iteraremos rawData para construir formattedData)
    // Ejemplo de un registro formateado:
    // "1": { match_name: "MEX_vs_POL", status: "FINISHED", ... }

    // 4. Guardar los datos transformados en Redis con un tiempo de expiración (ej. 1 hora)
    // Así los datos se refrescan automáticamente pero sin abusar de tu plan gratuito
    await redis.set(REDIS_KEY, formattedData, { ex: 3600 })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formattedData)
    }

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor' })
    }
  }
}