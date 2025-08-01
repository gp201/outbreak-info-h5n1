<template>
  <MultiSelectComponent
      :multiple="props.multiple"
      :options="phenotypes"
      label="Select a phenotype"
      placeholder="Select a phenotype"
      :showButton="props.showButton"
      @buttonClick="phenotypeSelectedButtonClick"
      @update:modelValue="updateModelValue"
  />
</template>

<script setup>
import { MultiSelectComponent } from 'outbreakInfo';
import {onMounted, ref} from "vue";
import { getPhenotypeMetrics } from "../services/munninService.js";

const props = defineProps({
  multiple: { type: Boolean, default: false },
  showButton: { type: Boolean, default: false }
});

const emit = defineEmits(['phenotypeSelectedButtonClick', 'update:modelValue']);
const phenotypes = ref([]);

// TODO: Pull these labels from database
const phenotypeMetricLabels = {
  "entry_in_293t_cells": "Entry in 293T cells",
  "sa26_usage_increase": "Increase in a2,6 sialic acid usage",
  "mouse_sera_escape": "Neutralization escape cause for mouse sera",
  "stability": "HA stability",
  "ferret_sera_escape": "Neutralization escape cause for ferret sera",
  "evescape_sigmoid": "EVE",
}

async function getSelectPhenotypeMetrics(){
  const resp = await getPhenotypeMetrics();
  return resp.filter(
      phenotype => phenotype.name in phenotypeMetricLabels
  ).map(phenotype => ({
    label: phenotypeMetricLabels[phenotype.name],
    value: phenotype.name,
    ...phenotype
  }));
}

async function loadData() {
  phenotypes.value = await getSelectPhenotypeMetrics();
}

async function phenotypeSelectedButtonClick(selectedPhenotypes) {
  emit('phenotypeSelectedButtonClick', selectedPhenotypes);
}

async function updateModelValue(selectedPhenotypes) {
  emit('update:modelValue', selectedPhenotypes);
}


onMounted(loadData)

</script>



<style scoped>

</style>