<template>
  <div v-for="(data, region_or_gff_feature) in chartData" :key="region_or_gff_feature" class="chart-section">
    <h2>{{ region_or_gff_feature }}</h2>
    <DumbbellChart
        :data="data"
        :width="800"
        :height="800"
        categoryKey="mut"
        time1Key="variants_start_date"
        time2Key="mutations_start_date"
        time1Label="Variants"
        time2Label="Mutations"
        xLabel="Time"
        yLabel="Mutations"
    />
  </div>

</template>

<script setup>
import { ref, onMounted } from 'vue';
import { DumbbellChart } from 'outbreakInfo';
import {getVariantMutationLag} from "../services/munninService.js";

const chartData = ref([]);

async function loadData() {
  chartData.value = await getVariantMutationLag("B3.13", "usda_genoflu");
  console.log(chartData.value)
}

onMounted(loadData);
</script>

<style scoped>

</style>