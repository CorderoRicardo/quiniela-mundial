<script setup>
import { ref } from 'vue'

const props = defineProps({
  match: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['selection-changed'])

// Estado local para saber qué opción eligió el usuario en este partido
const selectedOption = ref('')

const onSelection = () => {
  emit('selection-changed', {
    matchId: props.match.id,
    prediction: selectedOption.value
  })
}
</script>

<template>
  <div class="match-card">
    <div class="teams">
      <span>{{ match.local }}</span>
      <span> vs </span>
      <span>{{ match.visitor }}</span>
    </div>
    
    <div class="options">
      <label>
        <input 
          type="radio" 
          :name="`match-${match.id}`" 
          value="Local" 
          v-model="selectedOption"
          @change="onSelection"
        > Local
      </label>
      
      <label>
        <input 
          type="radio" 
          :name="`match-${match.id}`" 
          value="Empate" 
          v-model="selectedOption"
          @change="onSelection"
        > Empate
      </label>
      
      <label>
        <input 
          type="radio" 
          :name="`match-${match.id}`" 
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
  padding: 1rem;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.teams {
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  text-align: center;
}

.options {
  display: flex;
  justify-content: space-around;
}

label {
  cursor: pointer;
}
</style>