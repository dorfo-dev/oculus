<template>
  <div class="pdf-viewer">
    <div v-if="!selectedPdf" class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">📄</div>
        <h2>Nenhum PDF selecionado</h2>
        <p>Selecione um arquivo PDF da lista para visualizar</p>
      </div>
    </div>
    
    <div v-else-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Carregando PDF...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h2>Erro ao carregar PDF</h2>
      <p>{{ error }}</p>
    </div>
    
    <div v-else class="pdf-content">
      <div class="pdf-controls">
        <div class="control-group">
          <button @click="previousPage" :disabled="currentPage <= 1" class="btn-control">
            ← Anterior
          </button>
          <span class="page-info">
            Página {{ currentPage }} de {{ totalPages }}
          </span>
          <button @click="nextPage" :disabled="currentPage >= totalPages" class="btn-control">
            Próxima →
          </button>
        </div>
        
        <div class="control-group">
          <button @click="zoomOut" :disabled="scale <= 0.5" class="btn-control">
            🔍- Reduzir
          </button>
          <span class="zoom-info">{{ Math.round(scale * 100) }}%</span>
          <button @click="zoomIn" :disabled="scale >= 3" class="btn-control">
            🔍+ Ampliar
          </button>
        </div>
        
        <div class="control-group">
          <button @click="rotate" class="btn-control">
            🔄 Girar
          </button>
        </div>
      </div>
      
      <div class="canvas-container" ref="canvasContainer">
        <canvas ref="pdfCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'

const props = defineProps({
  selectedPdf: {
    type: Object,
    default: null
  }
})

// Set worker source
const workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

const pdfCanvas = ref(null)
const canvasContainer = ref(null)
const loading = ref(false)
const error = ref(null)
const pdfDoc = ref(null)
const currentPage = ref(1)
const totalPages = ref(0)
const scale = ref(1.5)
const rotation = ref(0)

const loadPdf = async (pdf) => {
  if (!pdf || !pdf.path) return
  
  loading.value = true
  error.value = null
  currentPage.value = 1
  
  try {
    const result = await window.electronAPI.readPdfFile(pdf.path)
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to read PDF file')
    }
    
    const loadingTask = pdfjsLib.getDocument({ data: result.data })
    pdfDoc.value = await loadingTask.promise
    totalPages.value = pdfDoc.value.numPages
    
    await renderPage(currentPage.value)
    loading.value = false
  } catch (err) {
    console.error('Error loading PDF:', err)
    error.value = err.message || 'Failed to load PDF'
    loading.value = false
  }
}

const renderPage = async (pageNum) => {
  if (!pdfDoc.value || !pdfCanvas.value) return
  
  try {
    const page = await pdfDoc.value.getPage(pageNum)
    const canvas = pdfCanvas.value
    const context = canvas.getContext('2d')
    
    const viewport = page.getViewport({ scale: scale.value, rotation: rotation.value })
    
    canvas.height = viewport.height
    canvas.width = viewport.width
    
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    }
    
    await page.render(renderContext).promise
  } catch (err) {
    console.error('Error rendering page:', err)
    error.value = 'Failed to render PDF page'
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    renderPage(currentPage.value)
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    renderPage(currentPage.value)
  }
}

const zoomIn = () => {
  if (scale.value < 3) {
    scale.value += 0.25
    renderPage(currentPage.value)
  }
}

const zoomOut = () => {
  if (scale.value > 0.5) {
    scale.value -= 0.25
    renderPage(currentPage.value)
  }
}

const rotate = () => {
  rotation.value = (rotation.value + 90) % 360
  renderPage(currentPage.value)
}

// Watch for PDF changes
watch(() => props.selectedPdf, (newPdf) => {
  if (newPdf) {
    scale.value = 1.5
    rotation.value = 0
    loadPdf(newPdf)
  }
}, { immediate: true })

// Keyboard shortcuts
const handleKeydown = (e) => {
  if (!props.selectedPdf) return
  
  switch (e.key) {
    case 'ArrowLeft':
      previousPage()
      break
    case 'ArrowRight':
      nextPage()
      break
    case '+':
    case '=':
      zoomIn()
      break
    case '-':
      zoomOut()
      break
    case 'r':
    case 'R':
      rotate()
      break
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.pdf-viewer {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #ecf0f1;
  overflow: hidden;
}

.empty-state, .loading-state, .error-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 40px;
  text-align: center;
}

.empty-content {
  max-width: 400px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-state h2, .error-state h2 {
  color: #34495e;
  margin-bottom: 10px;
}

.empty-state p, .error-state p {
  color: #7f8c8d;
  font-size: 16px;
}

.loading-state {
  color: #34495e;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #bdc3c7;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.error-state h2 {
  color: #e74c3c;
}

.pdf-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pdf-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  padding: 15px;
  background-color: #34495e;
  color: white;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-control {
  padding: 8px 15px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s;
}

.btn-control:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-control:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
  opacity: 0.5;
}

.page-info, .zoom-info {
  font-size: 14px;
  padding: 0 10px;
  min-width: 120px;
  text-align: center;
}

.canvas-container {
  flex: 1;
  overflow: auto;
  background-color: #95a5a6;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
}

canvas {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  background-color: white;
  max-width: 100%;
  height: auto;
}

/* Custom scrollbar for canvas container */
.canvas-container::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

.canvas-container::-webkit-scrollbar-track {
  background: #7f8c8d;
}

.canvas-container::-webkit-scrollbar-thumb {
  background: #34495e;
  border-radius: 6px;
}

.canvas-container::-webkit-scrollbar-thumb:hover {
  background: #2c3e50;
}
</style>
