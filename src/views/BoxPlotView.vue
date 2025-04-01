<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-6xl mx-auto">
      <div class="bg-white rounded-lg shadow-md p-6">
        <BoxPlotChart 
          v-if="processedData.length > 0"
          :data="processedData"
          :height="500"
          :width="1000"
          :marginLeft="150"
          :marginBottom="50"
          :boxColor="outbreakInfoColorPalette[0]"
          xLabel="Abundance (%)"
          yLabel="Lineage"
        />
        <div v-else class="text-center py-8">
          Loading data...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { BoxPlotChart, outbreakInfoColorPalette } from 'outbreakInfo'
import { getAllDemixed } from '../services/elasticsearchApi'

const rawData = ref([])

const processedData = computed(() => {
  return rawData.value.flatMap(entry => 
    entry.lineages.map((category, index) => ({
      category,
      value: entry.abundances[index] * 100 // Convert to percentage
    }))
  )
})

async function fetchData() {
  try {
    const response = await getAllDemixed()
    if (response.hits && response.hits.hits) {
      rawData.value = response.hits.hits.map(hit => ({
        lineages: hit._source.lineages || [],
        abundances: hit._source.abundances || []
      }))
    }
  } catch (error) {
    console.error('Error fetching demixed data:', error)
  }
}

onMounted(fetchData)
</script>

<style scoped>
.container {
  min-height: calc(100vh - 64px); /* Adjust based on header height */
}
</style> 