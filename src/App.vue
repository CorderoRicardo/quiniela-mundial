<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import MatchList from './components/MatchList.vue'
import ActionPanel from './components/ActionPanel.vue'

const matchesData = ref([])
const userPredictions = reactive({})
// NUEVA: Variable para almacenar la fecha del caché
const lastCacheUpdate = ref(null) 

onMounted(async () => {
  try {
    const response = await fetch('/.netlify/functions/getMatches')
    const data = await response.json()
    
    // Asignamos el array de partidos que ahora viene dentro de 'data.matches'
    matchesData.value = data.matches
    // Guardamos la fecha de la caché en el estado global
    lastCacheUpdate.value = data.cache_date
  } catch (error) {
    console.error("Error obteniendo los resultados:", error)
  }
})

const sortedMatches = computed(() => {
  return [...matchesData.value].sort((a, b) => {
    if (a.group < b.group) return -1;
    if (a.group > b.group) return 1;
    return a.timestamp - b.timestamp;
  });
})

const totalScore = computed(() => {
  let points = 0
  for (const predictionId in userPredictions) {
    const match = matchesData.value.find(m => m.match_id === predictionId)
    if (match && match.status === 'FINISHED' && userPredictions[predictionId] === match.result) {
      points++
    }
  }
  return points
})

const handlePredictionUpdate = ({ matchId, prediction }) => {
  userPredictions[matchId] = prediction
}

// NUEVO: Función actualizada para la alerta
const showLastUpdated = () => {
  if (lastCacheUpdate.value) {
    // 1. Formatear la fecha del caché a CDMX
    const date = new Date(lastCacheUpdate.value)
    const formattedDate = new Intl.DateTimeFormat('es-MX', {
      timeZone: 'America/Mexico_City',
      dateStyle: 'long', 
      timeStyle: 'medium'
    }).format(date)
    
    // 2. Contar dinámicamente cuántos partidos tienen el status 'FINISHED'
    const finishedCount = matchesData.value.filter(match => match.status === 'FINISHED').length
    
    // 3. Mostrar la alerta con la nueva estructura
    alert(`Última actualización de datos (Caché):\n🗓️ ${formattedDate} (CDMX)\n\n✅ Partidos finalizados: ${finishedCount}`)
  } else {
    alert('Información de actualización aún no disponible.')
  }
}

const exportJSON = () => {
  const dataStr = JSON.stringify(userPredictions, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'mis_predicciones_mundial.json'
  link.click()
  URL.revokeObjectURL(url)
}

const importJSON = (importedData) => {
  for (const key in userPredictions) delete userPredictions[key]
  Object.assign(userPredictions, importedData)
  alert('¡Predicciones cargadas con éxito!')
}
</script>

<template>
  <main class="container">
    <header class="header">
      <h1>Quiniela Mundial 2026</h1>
    </header>
    
    <p class="subtitle">Selecciona tus pronósticos para la fase de grupos.</p>
    
    <ActionPanel 
      :score="totalScore"
      @show-info="showLastUpdated"
      @export-predictions="exportJSON"
      @import-predictions="importJSON"
    />

    <MatchList 
      :matches="sortedMatches" 
      :predictions="userPredictions"
      @update-prediction="handlePredictionUpdate" 
    />
  </main>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: sans-serif;
}
.header {
  display: flex;
  justify-content: center; /* Centramos el título */
  align-items: center;
  border-bottom: 2px solid #eee;
  padding-bottom: 1rem;
}
h1 {
  margin: 0;
  color: #2c3e50;
}
.subtitle {
  margin-top: 1rem;
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
}
</style>