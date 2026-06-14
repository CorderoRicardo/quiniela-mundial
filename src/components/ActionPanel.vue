<script setup>
const emit = defineEmits(['export-predictions', 'import-predictions'])

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
  // Leemos el contenido del archivo subido sin enviarlo a un servidor
  reader.readAsText(file)
}
</script>

<template>
  <div class="action-panel">
    <button @click="$emit('export-predictions')" class="btn">
      💾 Guardar mis predicciones
    </button>
    
    <label class="btn btn-outline">
      📂 Cargar archivo previo
      <input type="file" accept=".json" @change="handleFileUpload" hidden>
    </label>
  </div>
</template>

<style scoped>
.action-panel {
  display: flex;
  gap: 1rem;
  justify-content: center;
  
  /* NUEVO: Lógica de Sticky Header */
  position: sticky;
  top: 0; /* Se pegará en la parte superior del contenedor */
  z-index: 100; /* Asegura que pase por encima de las tarjetas */
  padding: 1rem 0; /* Espaciado para que se vea limpio */
  
  /* Efecto translúcido moderno */
  background-color: rgba(255, 255, 255, 0.9); 
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #eaeaea;
  margin-bottom: 1rem;
}

.btn {
  padding: 0.8rem 1.2rem;
  font-size: 1rem;
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
</style>