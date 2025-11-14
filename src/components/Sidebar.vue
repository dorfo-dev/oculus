<template>
  <div class="sidebar-container">
    <div class="sidebar" :style="{ width: sidebarWidth + 'px' }">
      <div class="sidebar-header">
        <h2>Oculus</h2>
        <button @click="selectDirectory" class="btn-select-directory">
          📁 Selecionar Diretório
        </button>
      </div>
      
      <div class="directory-info" v-if="currentDirectory">
        <div class="directory-path">
          <strong>Diretório:</strong>
          <span class="path-text">{{ currentDirectory }}</span>
        </div>
      </div>
      
      <div class="pdf-list-container">
        <div v-if="!currentDirectory" class="empty-state">
          <p>Selecione um diretório para começar</p>
        </div>
        
        <div v-else-if="pdfFiles.length === 0" class="empty-state">
          <p>Nenhum arquivo PDF encontrado</p>
        </div>
        
        <div v-else class="pdf-list">
          <div 
            v-for="pdf in pdfFiles" 
            :key="pdf.path"
            @click="selectPdf(pdf)"
            :class="['pdf-item', { active: selectedPdfPath === pdf.path }]"
          >
            <div class="pdf-icon">📄</div>
            <div class="pdf-info">
              <div class="pdf-name">{{ pdf.name }}</div>
              <div class="pdf-extension">{{ pdf.extension }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div 
      class="resizer"
      @mousedown="startResize"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['pdf-selected'])

const currentDirectory = ref(null)
const pdfFiles = ref([])
const selectedPdfPath = ref(null)
const sidebarWidth = ref(300)
const isResizing = ref(false)
const startX = ref(0)
const startWidth = ref(0)

const selectDirectory = async () => {
  try {
    const dirPath = await window.electronAPI.openDirectory()
    
    if (dirPath) {
      currentDirectory.value = dirPath
      await loadPdfFiles(dirPath)
    }
  } catch (error) {
    console.error('Error selecting directory:', error)
  }
}

const loadPdfFiles = async (dirPath) => {
  try {
    const files = await window.electronAPI.readDirectory(dirPath)
    pdfFiles.value = files
    selectedPdfPath.value = null
    
    // Auto-select first PDF if available
    if (files.length > 0) {
      selectPdf(files[0])
    }
  } catch (error) {
    console.error('Error loading PDF files:', error)
  }
}

const selectPdf = (pdf) => {
  selectedPdfPath.value = pdf.path
  emit('pdf-selected', pdf)
}

// Resize functionality
const startResize = (e) => {
  isResizing.value = true
  startX.value = e.clientX
  startWidth.value = sidebarWidth.value
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  
  e.preventDefault()
}

const handleResize = (e) => {
  if (!isResizing.value) return
  
  const delta = e.clientX - startX.value
  const newWidth = startWidth.value + delta
  
  // Constrain width between 200px and 600px
  if (newWidth >= 200 && newWidth <= 600) {
    sidebarWidth.value = newWidth
  }
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
})
</script>

<style scoped>
.sidebar-container {
  display: flex;
  position: relative;
  background-color: #2c3e50;
  color: #ecf0f1;
}

.sidebar {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  min-width: 200px;
  max-width: 600px;
}

.sidebar-header {
  padding: 20px;
  background-color: #34495e;
  border-bottom: 1px solid #1a252f;
}

.sidebar-header h2 {
  margin-bottom: 15px;
  font-size: 24px;
  color: #3498db;
}

.btn-select-directory {
  width: 100%;
  padding: 10px 15px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-select-directory:hover {
  background-color: #2980b9;
}

.directory-info {
  padding: 15px 20px;
  background-color: #34495e;
  border-bottom: 1px solid #1a252f;
  font-size: 12px;
}

.directory-path {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.path-text {
  color: #bdc3c7;
  word-break: break-all;
  font-size: 11px;
}

.pdf-list-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  text-align: center;
  color: #95a5a6;
}

.pdf-list {
  padding: 10px;
}

.pdf-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background-color: #34495e;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.pdf-item:hover {
  background-color: #3d566e;
}

.pdf-item.active {
  background-color: #3498db;
}

.pdf-icon {
  font-size: 24px;
  margin-right: 12px;
}

.pdf-info {
  flex: 1;
  min-width: 0;
}

.pdf-name {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pdf-extension {
  font-size: 11px;
  color: #95a5a6;
  margin-top: 2px;
}

.resizer {
  width: 4px;
  cursor: col-resize;
  background-color: #1a252f;
  transition: background-color 0.2s;
}

.resizer:hover {
  background-color: #3498db;
}

/* Custom scrollbar */
.pdf-list-container::-webkit-scrollbar {
  width: 8px;
}

.pdf-list-container::-webkit-scrollbar-track {
  background: #2c3e50;
}

.pdf-list-container::-webkit-scrollbar-thumb {
  background: #34495e;
  border-radius: 4px;
}

.pdf-list-container::-webkit-scrollbar-thumb:hover {
  background: #3d566e;
}
</style>
