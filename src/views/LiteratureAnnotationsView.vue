<template>
  <div class="container mt-3">
    <h2>Annotations of mutations from scientific literature</h2>
    <div class="row">
      <div class="col-md-12">
        <TabsWrapper :tabs="literatureAnnotationsByPhenotypeTabs" size="large">
          <template #populationLevel>
            <AnnotationsByCollectionDate dataField="mutations"
                                         :selectedHost="selectedHost"
                                         :selectedIsolationSource="selectedIsolationSource"
                                         :selectedLineage="selectedLineage" />
          </template>

          <template #hostLevel>
            <AnnotationsByCollectionDate dataField="variants"
                                         :selectedHost="selectedHost"
                                         :selectedIsolationSource="selectedIsolationSource"
                                         :selectedLineage="selectedLineage" />
          </template>
        </TabsWrapper>
      </div>
    </div>

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
            :marginLeft="60"/>
      </div>

      <div class="col col-md-4">
        <SelectBarChartWithBarGraph
            :data="isolationSourceData"
            fieldName="Isolation Source"
            :selectedItem="selectedIsolationSource"
            @item-selected="isolationSourceBarSelected"
            :width="300"
            :xTickFrequency="6"
            :height="310" />
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
  </div>
</template>

<script setup>
import { TabsWrapper, SelectBarChartWithBarGraph } from 'outbreakInfo';
import AnnotationsByCollectionDate from "../components/AnnotationsByCollectionDate.vue";
import {onMounted, ref} from "vue";
import {getLineageCountBySample, getSampleCountByField} from "../services/munninService.js";

const selectedHost = ref({key: null, value: null});
const selectedIsolationSource = ref({key: null, value: null});
const selectedLineage = ref({key: null, value: null});
const hostData = ref([]);
const isolationSourceData = ref([]);
const isLoadingChart = ref(false);
const lineageCountData = ref([]);

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
    hostData.value = await getSampleCountByField("host");
    isolationSourceData.value = await getSampleCountByField("isolation_source");
    lineageCountData.value = await getLineageCountsAndReformat();
  } catch (err) {
    console.error('Error loading host and isolation source data', err);
  } finally {
    isLoadingChart.value = false;
  }
}

const literatureAnnotationsByPhenotypeTabs = [
  { name: 'Population-level', key: 'populationLevel' },
  { name: 'Host-level', key: 'hostLevel' }
]

onMounted(() => {
  loadHostAndIsolationSourceData();
})
</script>

<style scoped>

</style>