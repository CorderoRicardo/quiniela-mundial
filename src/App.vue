<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import MatchList from './components/MatchList.vue'
import ActionPanel from './components/ActionPanel.vue'

const matchesData = ref({})
const userPredictions = reactive({})

onMounted(async () => {
  try {
    const response = await fetch('/.netlify/functions/getMatches')
    const data = await response.json()
    matchesData.value = data
  } catch (error) {
    console.error("Error obteniendo los resultados:", error)
  }
})

// NUEVO 1: Computed property para ordenar por Grupo y luego por Timestamp
const sortedMatches = computed(() => {
  return Object.entries(matchesData.value)
    // Convertimos el diccionario a un arreglo incluyendo el ID
    .map(([id, match]) => ({ id, ...match })) 
    .sort((a, b) => {
      // 1. Ordenar por grupo alfabéticamente (Ej. Grupo A -> Grupo B)
      if (a.group < b.group) return -1;
      if (a.group > b.group) return 1;
      // 2. Si son del mismo grupo, ordenar por fecha/hora (timestamp)
      return a.timestamp - b.timestamp;
    });
})

const totalScore = computed(() => {
  let points = 0
  for (const matchId in userPredictions) {
    const match = matchesData.value[matchId]
    if (match && match.status === 'FINISHED' && userPredictions[matchId] === match.result) {
      points++
    }
  }
  return points
})

const handlePredictionUpdate = ({ matchId, prediction }) => {
  userPredictions[matchId] = prediction
}

// NUEVO 2: Función para mostrar la fecha de actualización de la API
const showLastUpdated = () => {
  const firstMatch = Object.values(matchesData.value)[0]
  if (firstMatch && firstMatch.last_updated) {
    const date = new Date(firstMatch.last_updated)
    const formattedDate = new Intl.DateTimeFormat('es-MX', {
      timeZone: 'America/Mexico_City',
      dateStyle: 'long', 
      timeStyle: 'medium'
    }).format(date)
    
    alert(`Última actualización de resultados reales:\n🗓️ ${formattedDate} (Tiempo de CDMX)`)
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