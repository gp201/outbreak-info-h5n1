<template>
  <h5>Literature annotations over time</h5>
  <InfoComponent :embedded="true" class="mb-3">
    <span v-html="helpText.literatureSurveillance.literatureAnnotationsOverTime"></span>
  </InfoComponent>
  <MultiSelectComponent
      class="mb-1"
      :multiple="false"
      :options="allAnnotationEffects"
      label="Select an annotation effect. You can filter by host, isolation source, and lineage by expanding the filters below."
      placeholder="Select annotation effect"
      :showButton="false"
      v-model="selectedEffectDetailObject"
  />

  <CollapseWrapper :items="filterItems" :v-model="expandedFilterItems">
    <template #filters>
      <div class="row">
        <div class="col col-md-4">
          <SelectBarChartWithBarGraph
              :data="hostData"
              fieldName="Host"
              :selectedItem="selectedHost"
              @item-selected="hostBarSelected"
              :width="300"
              :height="310"
              :xTickFrequency="6"
              :marginLeft="100"/>
        </div>

        <div class="col col-md-4">
          <SelectBarChartWithBarGraph
              :data="isolationSourceData"
              fieldName="Isolation Source"
              :selectedItem="selectedIsolationSource"
              @item-selected="isolationSourceBarSelected"
              :width="300"
              :xTickFrequency="6"
              :height="310"
              :marginLeft="100" />
        </div>

        <div class="col col-md-4">
          <SelectBarChartWithBarGraph
              :data="lineageCountData"
              fieldName="Lineage"
              :selectedItem="selectedLineage"
              @item-selected="lineageBarSelected"
              :width="300"
              :xTickFrequency="6"
              :height="310" />
        </div>
      </div>
    </template>
  </CollapseWrapper>

  <div class="row">
    <div class="col">
      <TagComponent class="d-inline m-1" v-if="selectedHost.key" type="error" :text="'Filter by host: ' + selectedHost.key" />
      <TagComponent class="d-inline m-1" v-if="selectedIsolationSource.key" type="error" :text="'Filter by isolation source: ' + selectedIsolationSource.key" />
      <TagComponent class="d-inline m-1" v-if="selectedLineage.key" type="error" :text="'Filter by lineage: ' + selectedLineage.key" />
    </div>
  </div>

  <hr>

  <div v-if="isLoading" class="loading">
    <LoadingSpinner />
  </div>
  <div v-else-if="error" class="error-message">
    {{ error }}
  </div>
  <div class="row" v-else>
    <div class="col col-md-12">
      <TimeSeriesBarChart
          :data="chartData"
          :height="300"
          :width="1200"
          dateKey="key"
          valueKey="value"
          groupKey="group"
          binInterval="month"
          :isPreBinned="true"
          tickInterval="3 month"
          :marginBottom="50"
          :marginLeft="100"
          :marginTop="40"
          xLabel="Month"
          yLabel="Proportion of unique mutations"
          :rangeColor="outbreakInfoColorPalette.slice(6, 10)"
      />
    </div>
    <div class="col col-md-12">
      <TimeSeriesBarChart
          :data="chartDataCounts"
          :height="150"
          :width="1200"
          dateKey="key"
          valueKey="value"
          groupKey="group"
          binInterval="month"
          :isPreBinned="true"
          tickInterval="3 month"
          :marginBottom="50"
          :marginLeft="100"
          :marginTop="40"
          xLabel="Time"
          yLabel="Count of unique mutations"
          :rangeColor="outbreakInfoColorPalette.slice(6,10)"
      />
    </div>
  </div>
  <div class="row">
    <div class="col col-md-12">
      <AnnotationsByAminoAcidPosition
          :dataField="props.dataField"
          :selectedHost="selectedHost"
          :selectedIsolationSource="selectedIsolationSource"
          :selectedLineage="selectedLineage"
          :selectedEffectDetail="selectedEffectDetail"
      />
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, watch, computed} from 'vue';
import { SelectBarChartWithBarGraph, MultiSelectComponent, InfoComponent, TimeSeriesBarChart, LoadingSpinner, outbreakInfoColorPalette, TagComponent, CollapseWrapper } from 'outbreakInfo';
import {
  getAnnotationsByVariantsAndCollectionDate,
  getAnnotationsByMutationsAndCollectionDate,
  getAllAnnotationEffects,
  buildStringQuery, getLineageCountBySample, getSampleCountByField
} from '../services/munninService.js';
import helpText from "../helpInfo/helpInfoText.json";
import { defaultValues } from "../constants/labels.js";
import AnnotationsByAminoAcidPosition from "./AnnotationsByAminoAcidPosition.vue";

const chartData = ref([]);
const chartDataCounts = ref([]);
const allAnnotationEffects = ref([]);
const isLoading = ref(false);
const error = ref(null);
const selectedEffectDetailObject = ref(defaultValues.effectDetail);

const filterItems = [
  { title: 'Filters', key: 'filters' },
];
const expandedFilterItems = ref(['0']);

const selectedEffectDetail = computed(() => {
  if(selectedEffectDetailObject.value === null)
    return null;
  return selectedEffectDetailObject.value.value;
})

const props = defineProps({
  dataField: { type: String, default: "variants" },
})

const hostData = ref([]);
const isolationSourceData = ref([]);
const isLoadingChart = ref(false);
const lineageCountData = ref([]);
const selectedHost = ref({key: null, value: null});
const selectedIsolationSource = ref({key: null, value: null});
const selectedLineage = ref({key: null, value: null});

// TODO: Bind this using v-model. Requires modifying SelectBarChartWithBarGraph
const hostBarSelected = (item) => {
  selectedHost.value = item;
};

const isolationSourceBarSelected = (item) => {
  selectedIsolationSource.value = item;
}

const lineageBarSelected = (item) => {
  selectedLineage.value = item;
}

async function getLineageCountsAndReformat() {
  let res = await getLineageCountBySample();
  return res.filter(item => item.lineage_system === "usda_genoflu").map(item => ({
    key: item.lineage,
    value: item.count
  }))
}

async function loadHostAndIsolationSourceData(){
  isLoadingChart.value = true;
  try {
    [hostData.value, isolationSourceData.value, lineageCountData.value] = await Promise.all([
      getSampleCountByField("host"),
      getSampleCountByField("isolation_source"),
      getLineageCountsAndReformat()
    ]);
  } catch (err) {
    console.error('Error loading host and isolation source data', err);
  } finally {
    isLoadingChart.value = false;
  }
}

async function loadData() {
  let resp = await getAllAnnotationEffects();
  allAnnotationEffects.value = resp.map(effect => ({
    label: effect,
    value: effect,
  }));
}

async function renderChart() {
  isLoading.value = true;
  error.value = null;
  let resp;
  try {
    const q =  buildStringQuery([
      { field: "host", value: selectedHost.key },
      { field: "isolation_source", value: selectedIsolationSource.key },
      { field: "lineage_name", value: selectedLineage.key },
    ]);
    if(props.dataField === "variants") {
      resp = await getAnnotationsByVariantsAndCollectionDate(selectedEffectDetail.value, q);
    } else if(props.dataField === "mutations") {
      resp = await getAnnotationsByMutationsAndCollectionDate(selectedEffectDetail.value, q);
    }
    chartData.value = resp.flatMap(({ date, proportion }) => [
      { key: date, value: proportion ,       group: selectedEffectDetail.value},
      { key: date, value: 1 - proportion,   group:  "Not annotated with " + selectedEffectDetail.value}
    ]);
    chartDataCounts.value = resp.flatMap(({ date, n, n_total }) => [
      { key: date, value: n ,       group: selectedEffectDetail.value},
      { key: date, value: n_total - n,   group:  "Not annotated with " + selectedEffectDetail.value}
    ])
  } catch (err) {
    console.error('Error searching site:', err);
    error.value = err.message || 'Failed to search for site. Please try again.';
    chartData.value = [];
    chartDataCounts.value = [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadData();
  loadHostAndIsolationSourceData();
  renderChart();
});

watch(() => selectedHost, () => {
  renderChart();
}, { deep: true });

watch(() => selectedIsolationSource, () => {
  renderChart();
}, { deep: true });

watch(() => selectedLineage, () => {
  renderChart();
}, { deep: true });

watch(() => selectedEffectDetailObject, () => {
  renderChart();
}, { deep: true });

</script>

<style scoped>

</style>