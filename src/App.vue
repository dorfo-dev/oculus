<template>
  <div class="app-container">
    <Sidebar 
      @pdf-selected="handlePdfSelected"
    />
    <PdfViewer 
      :selectedPdf="selectedPdf"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from './components/Sidebar.vue'
import PdfViewer from './components/PdfViewer.vue'

const selectedPdf = ref(null)

const handlePdfSelected = (pdf) => {
  selectedPdf.value = pdf
}
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: #f5f5f5;
}
</style>
