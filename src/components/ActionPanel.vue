<script setup>
defineProps({
  score: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['export-predictions', 'import-predictions', 'show-info'])

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const parsedData = JSON.parse(e.target.result)
      emit('import-predictions', parsedData)
    } catch (error) {
      alert('El archivo no es un JSON válido.')
    }
  }
  reader.readAsText(file)
}
</script>

<template>
  <div class="action-panel">
    <div class="panel-left">
      <button class="info-btn" @click="$emit('show-info')" title="Ver última actualización">
        ℹ️ Info API
      </button>
      <div class="score-board">
        Puntos: <strong>{{ score }}</strong>
      </div>
    </div>

    <div class="panel-right">
      <button @click="$emit('export-predictions')" class="btn">
        💾 Guardar
      </button>
      
      <label class="btn btn-outline">
        📂 Cargar
        <input type="file" accept=".json" @change="handleFileUpload" hidden>
      </label>
    </div>
  </div>
</template>

<style scoped>
.action-panel {
  display: flex;
  justify-content: space-between; /* Separa la info de los botones */
  align-items: center;
  gap: 1rem;
  
  /* Lógica de Sticky Header */
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 1rem; 
  
  /* Efecto translúcido moderno */
  background-color: rgba(255, 255, 255, 0.9); 
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #eaeaea;
  margin-bottom: 1rem;
  border-radius: 0 0 8px 8px; /* Ligero borde redondeado abajo */
}

.panel-left, .panel-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.score-board {
  font-size: 1.2rem;
  background-color: #ffeb3b;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  color: #333;
}

.info-btn {
  background: none;
  border: 1px solid #ccc;
  border-radius: 20px;
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  cursor: pointer;
  background-color: #f5f5f5;
  transition: all 0.2s;
}

.info-btn:hover {
  background-color: #e0e0e0;
}

.btn {
  padding: 0.6rem 1rem;
  font-size: 0.95rem;
  cursor: pointer;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
}

.btn-outline {
  background-color: transparent;
  color: #4CAF50;
  border: 2px solid #4CAF50;
}

.btn:hover {
  opacity: 0.9;
}

/* Diseño responsivo para pantallas pequeñas */
@media (max-width: 600px) {
  .action-panel {
    flex-direction: column;
  }
}
</style>