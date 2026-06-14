<script setup>
import MatchCard from './MatchCard.vue'

defineProps({
  matches: {
    type: Array,
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
      :key="match.id" 
      :match="match" 
      :current-prediction="predictions[match.id]"
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