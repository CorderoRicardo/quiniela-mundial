<script setup>
import { ref, reactive } from 'vue'
import MatchList from './components/MatchList.vue'

// Estado simulado de los partidos (Fase 1)
const matches = ref([
  { id: 1, local: 'México', visitor: 'Polonia' },
  { id: 2, local: 'Argentina', visitor: 'Arabia Saudita' },
  { id: 3, local: 'Estados Unidos', visitor: 'Gales' }
])

// Objeto reactivo para guardar las selecciones del usuario
const userPredictions = reactive({})

// Función para actualizar la predicción cuando el componente hijo emite un cambio
const handlePredictionUpdate = ({ matchId, prediction }) => {
  userPredictions[matchId] = prediction
  console.log('Predicciones actuales:', userPredictions)
}
</script>

<template>
  <main class="container">
    <h1>Quiniela Mundial 2026</h1>
    <p>Selecciona tus pronósticos para la fase de grupos.</p>
    
    <MatchList 
      :matches="matches" 
      @update-prediction="handlePredictionUpdate" 
    />
  </main>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  font-family: sans-serif;
}
</style>