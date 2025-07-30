<template>
  <MultiSelectComponent
      :multiple="props.multiple"
      :options="phenotypes"
      label="Select a phenotypes"
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

async function getSelectPhenotypeMetrics(){
  const resp = await getPhenotypeMetrics();
  return resp.map(phenotype => ({
    label: phenotype.name,
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