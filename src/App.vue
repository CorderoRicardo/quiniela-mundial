<script setup>
import { ref, reactive, computed } from 'vue'
import MatchList from './components/MatchList.vue'
import ActionPanel from './components/ActionPanel.vue'

// 1. Partidos a mostrar
const matches = ref([
  { id: 1, local: 'México', visitor: 'Polonia' },
  { id: 2, local: 'Argentina', visitor: 'Arabia Saudita' },
  { id: 3, local: 'Estados Unidos', visitor: 'Gales' }
])

// 2. Resultados reales simulados (Lo que vendrá de tu Netlify Function en la Fase 1)
const realResults = ref({
  1: 'Empate',
  2: 'Visitante',
  3: 'Empate'
})

// 3. Estado de las predicciones del usuario
const userPredictions = reactive({})

// 4. Lógica de cálculo automático
const totalScore = computed(() => {
  let points = 0
  for (const matchId in userPredictions) {
    // Si la predicción coincide con el resultado real, sumamos 1 punto
    if (userPredictions[matchId] === realResults.value[matchId]) {
      points++
    }
  }
  return points
})

// 5. Manejadores de eventos
const handlePredictionUpdate = ({ matchId, prediction }) => {
  userPredictions[matchId] = prediction
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
  // Limpiamos las predicciones actuales y asignamos las nuevas
  for (const key in userPredictions) delete userPredictions[key]
  Object.assign(userPredictions, importedData)
  alert('¡Predicciones cargadas con éxito!')
}
</script>

<template>
  <main class="container">
    <header class="header">
      <h1>Quiniela Mundial 2026</h1>
      <div class="score-board">
        Puntos: <strong>{{ totalScore }}</strong>
      </div>
    </header>
    
    <p>Selecciona tus pronósticos para la fase de grupos.</p>
    
    <ActionPanel 
      @export-predictions="exportJSON"
      @import-predictions="importJSON"
    />

    <MatchList 
      :matches="matches" 
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
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #eee;
  padding-bottom: 1rem;
}

.score-board {
  font-size: 1.5rem;
  background-color: #ffeb3b;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}
</style>