<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import MatchList from './components/MatchList.vue'
import ActionPanel from './components/ActionPanel.vue'

const matchesData = ref([])
const userPredictions = reactive({})
const lastCacheUpdate = ref(null) 

// NUEVO: Estado para saber si estamos recargando los datos
const isReloading = ref(false)

// NUEVO: Extraemos la petición fetch a una función reutilizable
const loadMatches = async () => {
  if (isReloading.value) return // Previene múltiples clics
  isReloading.value = true
  
  try {
    const response = await fetch('/.netlify/functions/getMatches')
    const data = await response.json()
    matchesData.value = data.matches
    lastCacheUpdate.value = data.cache_date
  } catch (error) {
    console.error("Error obteniendo los resultados:", error)
    alert("Hubo un error al actualizar los resultados.")
  } finally {
    isReloading.value = false
  }
}

// Al montar el componente, llamamos a la función de carga
onMounted(() => {
  loadMatches()
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

const inPlayMatch = computed(() => {
  return matchesData.value.find(match => match.status === 'IN_PLAY')
})

const scrollToLiveMatch = () => {
  if (inPlayMatch.value) {
    const element = document.getElementById(`match-${inPlayMatch.value.match_id}`)
    if (element) {
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
      class="floating-reload-btn" 
      @click="loadMatches"
      :disabled="isReloading"
      title="Actualizar marcadores"
    >
      <span class="icon" :class="{ 'spin': isReloading }">🔄</span>
    </button>

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
/* Estilos base del contenedor */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: sans-serif;
  position: relative; 
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

/* ==========================================
   ESTILOS DE LOS BOTONES FLOTANTES
============================================= */

/* 1. Botón de Recarga (Nuevo - Izquierda) */
.floating-reload-btn {
  position: fixed;
  top: 20px;
  left: 20px; /* Lo anclamos a la esquina superior izquierda */
  background-color: #ffffff;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 50%; /* Circular para que luzca como una app móvil */
  width: 45px;
  height: 45px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0,0,0,0.15);
  z-index: 1001; 
  transition: transform 0.2s ease, background-color 0.2s, box-shadow 0.2s;
}

.floating-reload-btn:hover:not(:disabled) {
  transform: scale(1.05);
  background-color: #f9f9f9;
  box-shadow: 0 6px 8px rgba(0,0,0,0.2);
}

.floating-reload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Animación de rotación para la recarga */
.icon {
  display: inline-block;
}
.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 2. Botón En Vivo (Derecha) */
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
  z-index: 1001; 
  animation: pulse 2s infinite;
  transition: transform 0.2s ease;
}

.floating-live-btn:hover {
  transform: scale(1.05);
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(211, 47, 47, 0); }
  100% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0); }
}

/* Responsividad para pantallas pequeñas (móviles) */
@media (max-width: 600px) {
  .floating-live-btn {
    top: 10px;
    right: 10px;
    font-size: 0.85rem;
    padding: 0.5rem 1rem;
  }
  
  .floating-reload-btn {
    top: 10px;
    left: 10px;
    width: 38px;
    height: 38px;
    font-size: 1rem;
  }
}
</style>