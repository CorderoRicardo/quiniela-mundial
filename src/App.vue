<script setup>
import { ref, reactive, computed } from 'vue'
import MatchList from './components/MatchList.vue'
import ActionPanel from './components/ActionPanel.vue'

// Mock data: Contrato de la futura Netlify Function
const matchesData = ref({
  "1": {
    "match_name": "MEX_vs_POL",
    "timestamp": 1782259200,
    "home_team": "México",
    "away_team": "Polonia",
    "home_goals": 0,
    "away_goals": 0,
    "status": "FINISHED",
    "result": "Empate"
  },
  "2": {
    "match_name": "ARG_vs_KSA",
    "timestamp": 1782345600,
    "home_team": "Argentina",
    "away_team": "Arabia Saudita",
    "home_goals": 1,
    "away_goals": 2,
    "status": "FINISHED",
    "result": "Visitante"
  },
  "3": {
    "match_name": "USA_vs_WAL",
    "timestamp": 1782432000,
    "home_team": "Estados Unidos",
    "away_team": "Gales",
    "home_goals": null,
    "away_goals": null,
    "status": "SCHEDULED",
    "result": null
  }
})

// Estado de las predicciones del usuario
const userPredictions = reactive({})

// Lógica de cálculo automático ajustada
const totalScore = computed(() => {
  let points = 0
  for (const matchId in userPredictions) {
    const match = matchesData.value[matchId]
    // Solo otorgamos puntos si el partido ya finalizó y la predicción es correcta
    if (match && match.status === 'FINISHED' && userPredictions[matchId] === match.result) {
      points++
    }
  }
  return points
})

// Manejadores de eventos
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
      :matches="matchesData" 
      :predictions="userPredictions"
      @update-prediction="handlePredictionUpdate" 
    />
  </main>
</template>