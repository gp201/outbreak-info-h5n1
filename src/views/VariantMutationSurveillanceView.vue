<template>
  <div class="container mt-3">
    <div class="row">
      <h2>First detection of mutation at host- and population-level</h2>
      <hr>
      <VariantMutationLag />
    </div>
  </div>
  <div class="container mt-3">
    <div class="row">
      <h2>Host-level frequency and population-level mutations over time</h2>
      <hr>
      <VariantFrequencyAndMutationsByCollectionDate />
    </div>
  </div>
</template>

<script setup>
import VariantMutationLag from "../components/VariantMutationLag.vue";
import VariantFrequencyAndMutationsByCollectionDate from "../components/VariantFrequencyAndMutationsByCollectionDate.vue";
</script>

<style scoped>

</style>