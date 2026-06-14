<script setup>
import MatchCard from './MatchCard.vue'

defineProps({
  matches: {
    type: Array, // Cambiado de vuelta a Array para iterarlo ordenado
    required: true
  },
  predictions: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update-prediction'])

const forwardPrediction = (data) => {
  emit('update-prediction', data)
}
</script>

<template>
  <div class="match-list">
    <MatchCard 
      v-for="match in matches" 
      :key="match.match_id" 
      :match-id="match.match_id"
      :match="match" 
      :current-prediction="predictions[match.match_id]"
      :show="match.group !== 'Fase Final'"
      @selection-changed="forwardPrediction"
    />
  </div>
</template>

<style scoped>
.match-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}
</style>