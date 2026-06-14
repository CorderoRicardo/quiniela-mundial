<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  matchId: {
    type: [String, Number],
    required: true
  },
  match: {
    type: Object,
    required: true
  },
  currentPrediction: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['selection-changed'])

const selectedOption = ref(props.currentPrediction)

watch(() => props.currentPrediction, (newValue) => {
  selectedOption.value = newValue || ''
})

const onSelection = () => {
  emit('selection-changed', {
    matchId: props.matchId,
    prediction: selectedOption.value
  })
}
</script>

<template>
  <div class="match-card">
    <div class="match-header">
      <span class="status finished" v-if="match.status === 'FINISHED'">Finalizado</span>
      <span class="status scheduled" v-else>Próximamente</span>
    </div>

    <div class="teams">
      <div class="team">
        <span class="name">{{ match.home_team }}</span>
        <span class="score" v-if="match.status === 'FINISHED'">{{ match.home_goals }}</span>
      </div>
      <span class="vs">vs</span>
      <div class="team">
        <span class="score" v-if="match.status === 'FINISHED'">{{ match.away_goals }}</span>
        <span class="name">{{ match.away_team }}</span>
      </div>
    </div>
    
    <div class="options">
      <label>
        <input 
          type="radio" 
          :name="`match-${matchId}`" 
          value="Local" 
          v-model="selectedOption"
          @change="onSelection"
        > Local
      </label>
      <label>
        <input 
          type="radio" 
          :name="`match-${matchId}`" 
          value="Empate" 
          v-model="selectedOption"
          @change="onSelection"
        > Empate
      </label>
      <label>
        <input 
          type="radio" 
          :name="`match-${matchId}`" 
          value="Visitante" 
          v-model="selectedOption"
          @change="onSelection"
        > Visitante
      </label>
    </div>
  </div>
</template>

<style scoped>
.match-card {
  border: 1px solid #ccc;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.match-header {
  text-align: center;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  font-weight: bold;
  text-transform: uppercase;
}

.status.finished { color: #d32f2f; }
.status.scheduled { color: #1976d2; }

.teams {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.team {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.team:first-child { justify-content: flex-end; }
.team:last-child { justify-content: flex-start; }

.score {
  background-color: #333;
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-weight: bold;
}

.vs {
  color: #888;
  font-size: 0.9rem;
  margin: 0 1rem;
}

.options {
  display: flex;
  justify-content: space-around;
  background-color: #f5f5f5;
  padding: 0.8rem;
  border-radius: 4px;
}

label {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
</style>