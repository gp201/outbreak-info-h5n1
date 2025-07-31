<template>
  <div class="container mt-3">
    <div class="row">
      <div class="col">
        <h2>Compare lineages</h2>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12 mb-5">
        <LineageComparisonHeatMap />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <MutationProfileComparison />
      </div>
    </div>
  </div>
</template>

<script setup>
import LineageComparisonHeatMap from "../components/LineageComparisonHeatMap.vue";
import MutationProfileComparison from "../components/MutationProfileComparison.vue";
</script>

<style scoped>

</style>