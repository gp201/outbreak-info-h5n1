<template>
  <div class="host-view">
    <h4>Phenotype counts over time</h4>
    <TimeSeriesBarChart
        :data="chartData"
        :height="500"
        dateKey="key"
        groupKey="group"
        binInterval="month"
        :isPreBinned="true"
        tickInterval="6 months"
        :marginBottom="70"
        :marginLeft="100"
        xLabel="Time"
    />
  </div>
  <hr>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import { TimeSeriesBarChart } from 'outbreakInfo';
import {getPhenotypeMetricCountsForMutationsByCollectionDate} from "../services/munninService.js";

const chartData = ref([])

function ungroupData(data) {
  return data.flatMap(({ date, n_gte, n }) => [
    { key: date, value: n_gte,       group: 'gte' },
    { key: date, value: n - n_gte,   group: 'lt'  }
  ]);
}

async function loadData() {
  const data = await getPhenotypeMetricCountsForMutationsByCollectionDate("sa26_usage_increase", 2, "host=cattle");
  chartData.value = ungroupData(data);
  console.log(chartData.value);
}

onMounted(loadData);
</script>

<style scoped>

</style>