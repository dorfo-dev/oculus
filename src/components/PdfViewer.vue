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
      <div class="pdf-header">
        <h3>{{ selectedPdf.name }}</h3>
      </div>

      <div class="pdf-container">
        <embed
          v-if="pdfBlobUrl"
          :src="pdfBlobUrl"
          type="application/pdf"
          class="pdf-embed"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  selectedPdf: {
    type: Object,
    default: null
  }
})

const pdfBlobUrl = ref(null)
const loading = ref(false)
const error = ref(null)

const loadPdfBlob = async (pdf) => {
  if (!pdf || !pdf.path) return

  loading.value = true
  error.value = null

  // Revoke previous blob URL to free memory
  if (pdfBlobUrl.value) {
    URL.revokeObjectURL(pdfBlobUrl.value)
    pdfBlobUrl.value = null
  }

  try {
    console.log('Loading PDF from:', pdf.path)
    const result = await window.electronAPI.readPdfFile(pdf.path)

    if (!result.success) {
      throw new Error(result.error || 'Failed to read PDF file')
    }

    // Convert to Uint8Array if needed
    let data = result.data
    if (data.type === 'Buffer' && Array.isArray(data.data)) {
      data = new Uint8Array(data.data)
    } else if (!(data instanceof Uint8Array)) {
      if (data instanceof ArrayBuffer) {
        data = new Uint8Array(data)
      } else if (Array.isArray(data)) {
        data = new Uint8Array(data)
      } else {
        throw new Error('Unsupported PDF data format')
      }
    }

    console.log('PDF data loaded, size:', data.byteLength, 'bytes')

    // Create Blob from data
    const blob = new Blob([data], { type: 'application/pdf' })

    // Create Blob URL
    pdfBlobUrl.value = URL.createObjectURL(blob)
    console.log('PDF Blob URL created:', pdfBlobUrl.value)

    loading.value = false
  } catch (err) {
    console.error('Error loading PDF:', err)
    error.value = err.message || 'Failed to load PDF'
    loading.value = false
  }
}

// Watch for PDF selection changes
watch(() => props.selectedPdf, (newPdf) => {
  if (newPdf) {
    loadPdfBlob(newPdf)
  }
}, { immediate: true })
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

.pdf-header {
  padding: 15px 20px;
  background-color: #34495e;
  color: white;
  border-bottom: 2px solid #2c3e50;
}

.pdf-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pdf-container {
  flex: 1;
  display: flex;
  background-color: #525252;
  overflow: hidden;
}

.pdf-embed {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
