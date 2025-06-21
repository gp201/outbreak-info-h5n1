<template>
  <div class="host-view">
    <h1>Samples by host</h1>
    <div v-for="(data, gene) in chartData" :key="gene" class="chart-section">
      <h2>{{ gene }}</h2>
      <HeatMapChart
          :data="data"
          x="pos"
          y="1"
          val="prev"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { HeatMapChart } from 'outbreakInfo';
import { getLineageMutationIncidence } from '../services/munninService.js';

const chartData = ref([]);

async function loadData() {
  chartData.value = await getLineageMutationIncidence("D1.1");
  console.log(chartData.value);
}

onMounted(loadData);
</script>

<style scoped>

</style>