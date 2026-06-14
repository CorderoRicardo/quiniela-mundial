<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import MatchList from './components/MatchList.vue'
import ActionPanel from './components/ActionPanel.vue'

// 1. Ahora inicializamos matchesData como un Array vacío [] en lugar de {}
const matchesData = ref([])
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

const sortedMatches = computed(() => {
  // 2. Como ya es un Array, ya no necesitamos Object.entries. 
  // Clonamos el array con [...matchesData.value] para no mutar el original y lo ordenamos.
  return [...matchesData.value].sort((a, b) => {
    if (a.group < b.group) return -1;
    if (a.group > b.group) return 1;
    return a.timestamp - b.timestamp;
  });
})

const totalScore = computed(() => {
  let points = 0
  for (const predictionId in userPredictions) {
    // 3. En lugar de acceso directo por índice, buscamos el partido por su match_id
    const match = matchesData.value.find(m => m.match_id === predictionId)
    
    if (match && match.status === 'FINISHED' && userPredictions[predictionId] === match.result) {
      points++
    }
  }
  return points
})

const showLastUpdated = () => {
  // 4. Extraemos el primer elemento directamente del array
  const firstMatch = matchesData.value[0]
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