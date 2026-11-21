<template>
  <SingleSelect v-model="state" label="State" placeholder="All states" :options="stateOptions" :clearable="true" />
  <BarChart
      :data="chartData"
      :horizontal="false"
      :categoryOrder="chartData.map((d) => d.key)"
      :yMin="0"
      :yMax="Math.max(0.05, ...chartData.map((d) => d.value))"
      :showLabels="true"
      labelKey="label"
      xLabel="Week"
      yLabel="Proportion of sites positive"
      :tooltipDecimalPlaces="3"
      :marginLeft="70"
      :width="1100"
      :height="320"
  />
</template>

<script setup>
import { computed, ref } from 'vue';
import { BarChart, SingleSelect } from 'outbreakInfo';
import { getProportionPositive, states } from '../services/wastewaterService.js';

const state = ref(null);
const stateOptions = states.map((s) => ({ label: s, value: s }));
const chartData = computed(() => getProportionPositive(state.value));
</script>
