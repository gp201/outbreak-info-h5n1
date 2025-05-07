<template>
  <div class="row">
    <div class="col col-md-6">
      <div v-if="isLoadingChart" class="loading">Loading data...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-for="(value, key) in transformedData" :key="key">
        <h4>{{ lineageSystemLabels[key] }}</h4>
        <BarChart
            :data="value"
            :horizontal="false"
            :height="500"
            :marginLeft="180"
            :marginBottom="100"
            :barColor="outbreakInfoColorPalette[0]"
            xLabel="Lineage"
            yLabel="Count"
        />
      </div>
    </div>

    <div class="col col-md-3">
      <SelectBarChartWithBarGraph
          :data="hostData"
          fieldName="Host"
          :selectedItem="selectedHost"
          @item-selected="hostBarSelected"
          :width="330"
          :height="310"
          :marginLeft="60" />
    </div>

    <div class="col col-md-3">
      <SelectBarChartWithBarGraph
          :data="isolationSourceData"
          fieldName="Isolation Source"
          :selectedItem="selectedIsolationSource"
          @item-selected="isolationSourceBarSelected"
          :width="300"
          :height="310" />
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, computed, useId, watch} from 'vue';
import { BarChart, outbreakInfoColorPalette, SelectBarChartWithBarGraph } from 'outbreakInfo';
import {getLineageCountBySample, getSampleCountByField} from '../services/munninService.js';

const transformedData = ref([]);
const isLoadingChart = ref(false);
const error = ref(null);
const hostData = ref([]);
const selectedHost = ref({key: null, value: null});
const lineageSystemLabels = ref({ //TODO: Store system label in API
  "usda_genoflu": "USDA GenoFLU",
  "freyja_demixed": "Custom Nomenclature"
});

const isolationSourceData = ref([]);
const selectedIsolationSource = ref({key: null, value: null});

const uuid = useId();

const hostBarSelected = (item) => {
  selectedHost.value = item;
};

const isolationSourceBarSelected = (item) => {
  selectedIsolationSource.value = item;
}

function transformData(data) {
  const result = {};

  data.forEach(item => {
    const system = item.lineage_system || "unknown";

    if (!result[system]) {
      result[system] = [];
    }

    result[system].push({
      key: item.lineage || "unknown",
      value: item.count
    });
  });

  return result;
}

async function getLineageCountsFilterByHostAndIsolationSource(host, isolationSource) {
  let q = null;
  if(host !== null && isolationSource !== null){
    q = `host=${host} ^ isolation_source=${isolationSource}`;
  } else if (host !== null) {
    q = `host=${host}`;
  } else if(isolationSource !== null){
    q = `isolation_source=${isolationSource}`;
  }
  return getLineageCountBySample(q);
}


async function loadData() {
  isLoadingChart.value = true;
  error.value = null;

  try {
    hostData.value = await getSampleCountByField("host");
    isolationSourceData.value = await getSampleCountByField("isolation_source");
    let rawData = await getLineageCountsFilterByHostAndIsolationSource(selectedHost.value.key, selectedIsolationSource.value.key);
    transformedData.value = transformData(rawData);

    if (transformedData.value.length === 0) {
      error.value = 'No data found for the selected filters';
    }
  } catch (err) {
    console.error('Error loading lineage counts:', err);
    error.value = 'Failed to load data. Please try again later.';
  } finally {
    isLoadingChart.value = false;
  }
}

onMounted(loadData);
watch(() => selectedHost.value, loadData);
watch(() => selectedIsolationSource.value, loadData);
</script>

<style scoped>

</style>