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
  </div>
</template>

<script setup>
import { TabsWrapper } from 'outbreakInfo';
import AnnotationsByCollectionDate from "../components/AnnotationsByCollectionDate.vue";

const literatureAnnotationsByPhenotypeTabs = [
  { name: 'Population-level', key: 'populationLevel' },
  { name: 'Host-level', key: 'hostLevel' }
]
</script>

<style scoped>

</style>