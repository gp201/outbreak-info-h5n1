<template>
  <div class="mutation-view">
    <h2>Mutation Frequency by Phenotype Score</h2>
    
    <div class="controls">
      <div class="field-select">
        <label>Metric:</label>
        <select v-model="selectedMetric">
          <option value="stability">Stability</option>
          <option value="ferret_sera_escape">Ferret sera escape</option>
          <option value="mouse_sera_escape">Mouse sera escape</option>
          <option value="sa26_usage_increase">SA26 receptor usage increase</option>
          <option value="entry_in_293t_cells">Entry in 293T cells</option>
        </select>
      </div>
      
      <div class="field-select">
        <label>Region:</label>
        <select v-model="selectedRegion">
          <option value="HA">HA</option>
          <option value="NA">NA</option>
          <option value="NP">NP</option>
          <option value="NS">NS</option>
          <option value="MP">MP</option>
          <option value="PB2">PB2</option>
          <option value="PB1">PB1</option>
          <option value="PA">PA</option>
        </select>
      </div>
      
      <div class="log-scale-toggle">
        <label>
          <input type="checkbox" v-model="useLogScale">
          Use Log Scale
        </label>
      </div>
    </div>
    
    <div v-if="isLoading" class="loading">Loading data...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <scatter-chart
      v-else
      :data="chartData"
      :point-color="outbreakInfoColorPalette[6]"
      :x-label="'Phenotype Score'"
      :y-label="'Mutation Frequency'"
      :log-scale="useLogScale"
      :tip-format-string="'Mutation: {key}\nFrequency: {y}\nScore: {x}'"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { ScatterChart, outbreakInfoColorPalette } from 'outbreakInfo';
import { getMutationFrequencyByScore } from '../services/postgresApi.js';

const selectedMetric = ref('sa26_usage_increase');
const selectedRegion = ref('HA');
const useLogScale = ref(true);
const chartData = ref([]);
const isLoading = ref(false);
const error = ref(null);

async function loadData() {
  isLoading.value = true;
  error.value = null;
  
  try {
    chartData.value = await getMutationFrequencyByScore(selectedRegion.value, selectedMetric.value);
    
    if (chartData.value.length === 0) {
      error.value = 'No data found for the selected parameters';
    }
  } catch (err) {
    console.error('Error loading mutation frequency data:', err);
    error.value = 'Failed to load data. Please try again later.';
    chartData.value = [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadData);
watch([() => selectedMetric.value, () => selectedRegion.value], loadData);
</script>

<style scoped>
.mutation-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
}

.controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.field-select {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.field-select select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: white;
}

.log-scale-toggle {
  display: flex;
  align-items: center;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
}

.error {
  color: #dc3545;
}

h2 {
  margin-bottom: 1.5rem;
}
</style> 