<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import MatchList from './components/MatchList.vue'
import ActionPanel from './components/ActionPanel.vue'

const matchesData = ref([])
const userPredictions = reactive({})
const lastCacheUpdate = ref(null) 

onMounted(async () => {
  try {
    const response = await fetch('/.netlify/functions/getMatches')
    const data = await response.json()
    matchesData.value = data.matches
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

// NUEVO: Buscamos si existe al menos un partido 'EN JUEGO'
const inPlayMatch = computed(() => {
  return matchesData.value.find(match => match.status === 'IN_PLAY')
})

// NUEVO: Función para desplazar la vista hacia la tarjeta
const scrollToLiveMatch = () => {
  if (inPlayMatch.value) {
    const element = document.getElementById(`match-${inPlayMatch.value.match_id}`)
    if (element) {
      // Usamos block: 'center' para que la tarjeta quede en medio de la pantalla
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
}

const handlePredictionUpdate = ({ matchId, prediction }) => {
  userPredictions[matchId] = prediction
}

const showLastUpdated = () => {
  if (lastCacheUpdate.value) {
    const date = new Date(lastCacheUpdate.value)
    const formattedDate = new Intl.DateTimeFormat('es-MX', {
      timeZone: 'America/Mexico_City',
      dateStyle: 'long', 
      timeStyle: 'medium'
    }).format(date)
    
    const finishedCount = matchesData.value.filter(match => match.status === 'FINISHED').length
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
    
    <button 
      v-if="inPlayMatch" 
      class="floating-live-btn" 
      @click="scrollToLiveMatch"
      title="Ir al partido en juego"
    >
      🔴 En Vivo
    </button>

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
/* Estilos anteriores intactos */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: sans-serif;
  position: relative; /* Ayuda como contexto para z-index */
}
.header {
  display: flex;
  justify-content: center;
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

/* NUEVO: Estilos del Botón Flotante */
.floating-live-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #d32f2f;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 0.6rem 1.2rem;
  font-size: 0.95rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  z-index: 1001; /* Asegura que pase por encima del ActionPanel que tiene 100 */
  animation: pulse 2s infinite;
  transition: transform 0.2s ease;
}

.floating-live-btn:hover {
  transform: scale(1.05);
}

/* Animación de latido sutil */
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(211, 47, 47, 0); }
  100% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0); }
}

@media (max-width: 600px) {
  .floating-live-btn {
    top: 10px;
    right: 10px;
    font-size: 0.85rem;
    padding: 0.5rem 1rem;
  }
}
</style>