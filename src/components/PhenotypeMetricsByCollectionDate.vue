<template>
  <div class="host-view">
    <Divider text="Phenotype over time" title-placement="left" />
    <div v-if="isLoading">
      <LoadingSpinner />
    </div>

    <div v-else-if="chartData.length > 0" class="chart-wrapper mt-3">
      <TextInput
          placeholder="Enter threshold for phenotype value"
          buttonText="Submit"
          :modelValue="phenotypeMetricValueThreshold.phenotype_metric_value"
          @submit="handleSubmit"
      />
      <TimeSeriesBarChart
          :data="chartData"
          :height="300"
          :width="1200"
          dateKey="key"
          groupKey="group"
          binInterval="month"
          :isPreBinned="true"
          tickInterval="3 month"
          :marginBottom="70"
          :marginLeft="100"
          xLabel="Time"
      />
      </div>
  </div>
</template>

<script setup>
import {onMounted, ref, watch} from 'vue';
import { TimeSeriesBarChart, TextInput, LoadingSpinner, Divider } from 'outbreakInfo';
import {
  getPhenotypeMetricCountsForMutationsByCollectionDate,
  getPhenotypeMetricCountsForVariantsByCollectionDate, getPhenotypeMetricValueByMutationsQuantile,
  getPhenotypeMetricValueByVariantsQuantile
} from "../services/munninService.js";

const chartData = ref([])
const isLoading = ref(false);
const phenotypeMetricValueThreshold = ref({phenotype_metric_value: null, quantile:0.5});

const props = defineProps({
  dataField: { type: String, default: "variants" },
  selectedPhenotypeScore : { type: String, default: null },
  selectedHost: { type: Object, default: null },
  selectedIsolationSource: { type: Object, default: null }
})

function ungroupData(data) {
  return data.flatMap(({ date, n_gte, n }) => [
    { key: date, value: n_gte,       group: props.selectedPhenotypeScore + ' >= ' + phenotypeMetricValueThreshold.value.phenotype_metric_value },
    { key: date, value: n - n_gte,   group: props.selectedPhenotypeScore + ' < ' +  phenotypeMetricValueThreshold.value.phenotype_metric_value  }
  ]);
}

async function getPhenotypeMetricCountsForDataFieldByCollectionDate(dataField, phenotypeMetricName, q) {
  if (dataField === "variants") {
    if(phenotypeMetricValueThreshold.value.phenotype_metric_value === null) {
      phenotypeMetricValueThreshold.value = await getPhenotypeMetricValueByVariantsQuantile(phenotypeMetricName, 0.5);
    }
    return await getPhenotypeMetricCountsForVariantsByCollectionDate(phenotypeMetricName, phenotypeMetricValueThreshold.value.phenotype_metric_value, q);
  } else if (dataField === "mutations") {
    if(phenotypeMetricValueThreshold.value.phenotype_metric_value === null) {
      phenotypeMetricValueThreshold.value = await getPhenotypeMetricValueByMutationsQuantile(phenotypeMetricName, 0.5);
    }
    return await getPhenotypeMetricCountsForMutationsByCollectionDate(phenotypeMetricName, phenotypeMetricValueThreshold.value.phenotype_metric_value, q);
  } else {
    return [];
  }
}

async function loadData() {
  if (isLoading.value) return;
  
  chartData.value = [];
  if (props.selectedPhenotypeScore !== "") {
    let q = "";
    if (props.selectedHost.key !== null && props.selectedIsolationSource.key != null) {
      q = `host=${props.selectedHost.key} ^ isolation_source=${props.selectedIsolationSource.key}`
    } else if(props.selectedHost.key !== null) {
      q = `host=${props.selectedHost.key}`
    } else if(props.selectedIsolationSource.key != null) {
      q = `isolation_source=${props.selectedIsolationSource.key}`
    }
    isLoading.value = true;
    const data = await getPhenotypeMetricCountsForDataFieldByCollectionDate(props.dataField,
        props.selectedPhenotypeScore,
        q);
    isLoading.value = false;
    chartData.value = ungroupData(data);
  }
}

async function handleSubmit(value) {
  phenotypeMetricValueThreshold.value.phenotype_metric_value = value;
  loadData();
}

onMounted(loadData);
watch(() => props.selectedPhenotypeScore, () => {
  phenotypeMetricValueThreshold.value.phenotype_metric_value = null;
  loadData();
}, { deep: true });

watch(() => props.selectedHost, () => {
  phenotypeMetricValueThreshold.value.phenotype_metric_value = null;
  loadData();
}, { deep: true });

watch(() => props.selectedIsolationSource, () => {
  phenotypeMetricValueThreshold.value.phenotype_metric_value = null;
  loadData();
}, { deep: true });
</script>

<style scoped>

</style>