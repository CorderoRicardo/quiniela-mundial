<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  matchId: { type: [String, Number], required: true },
  match: { type: Object, required: true },
  currentPrediction: { type: String, default: '' },
  show: { type: Boolean, default: false}
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

// Función nativa para formatear el Timestamp UNIX a hora de CDMX
const formatCDMXTime = (unixTimestamp) => {
  if (!unixTimestamp) return 'Fecha por definir'
  
  const date = new Date(unixTimestamp * 1000) // Multiplicamos por 1000 para ms
  
  return new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Mexico_City',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date)
}
</script>

<template>
  <div class="match-card" v-if="show">
    
    <div class="match-meta">
      <span class="group-badge">{{ match.group }}</span>
      <span class="date-badge">📅 {{ formatCDMXTime(match.timestamp) }} (CDMX)</span>
    </div>

    <div class="match-header">
      <span class="status finished" v-if="match.status === 'FINISHED'">Finalizado</span>
      <span class="status in-play" v-else-if="match.status === 'IN_PLAY'">En Juego</span>
      <span class="status scheduled" v-else>Próximamente</span>
    </div>

    <div class="teams">
      <div class="team home">
        <span class="name">{{ match.home_team }}</span>
        <img v-if="match.home_crest" :src="match.home_crest" class="flag" :alt="match.home_team">
        <span class="score" v-if="match.status === 'FINISHED'">{{ match.home_goals }}</span>
      </div>
      
      <span class="vs">vs</span>
      
      <div class="team away">
        <span class="score" v-if="match.status === 'FINISHED'">{{ match.away_goals }}</span>
        <img v-if="match.away_crest" :src="match.away_crest" class="flag" :alt="match.away_team">
        <span class="name">{{ match.away_team }}</span>
      </div>
    </div>
    
    <div class="options">
      <label>
        <input type="radio" :name="`match-${matchId}`" value="Local" v-model="selectedOption" @change="onSelection"> 
        Local
      </label>
      <label>
        <input type="radio" :name="`match-${matchId}`" value="Empate" v-model="selectedOption" @change="onSelection"> 
        Empate
      </label>
      <label>
        <input type="radio" :name="`match-${matchId}`" value="Visitante" v-model="selectedOption" @change="onSelection"> 
        Visitante
      </label>
    </div>
  </div>
</template>

<style scoped>
.match-card {
  border: 1px solid #e0e0e0;
  padding: 1.5rem;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}
.match-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.1);
}

/* Estilos de los nuevos metadatos */
.match-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: #666;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}
.group-badge {
  font-weight: bold;
  color: #333;
  text-transform: uppercase;
}

.match-header {
  text-align: center;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  font-weight: bold;
  text-transform: uppercase;
}
.status.finished { color: #d32f2f; }
.status.in-play { color: #2e7d32; }
.status.scheduled { color: #1976d2; }

.teams {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.team {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex: 1;
}
.team.home { justify-content: flex-end; }
.team.away { justify-content: flex-start; }

/* Estilo para las banderas SVG */
.flag {
  width: 30px;
  height: 20px;
  object-fit: contain;
  border-radius: 2px;
  border: 1px solid #eee;
}

.score {
  background-color: #333;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  font-weight: bold;
  font-size: 1.2rem;
}

.vs {
  color: #aaa;
  font-size: 0.9rem;
  margin: 0 1rem;
  font-weight: bold;
}

.options {
  display: flex;
  justify-content: space-around;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #eee;
}

label {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 500;
  color: #444;
}
</style>