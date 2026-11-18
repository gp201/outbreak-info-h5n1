<template>
  <SingleSelect v-model="state" label="State" placeholder="All states" :options="stateOptions" :clearable="true" />
  <TimeSeriesBarChart
      :data="chartData"
      :isPreBinned="true"
      groupKey="group"
      binInterval="month"
      :tickInterval="tickInterval"
      :autoTickInterval="false"
      :legendDomain="GROUPS"
      :legendRange="GROUP_COLORS"
      xLabel=""
      :yLabel="yLabel"
      :width="1100"
      :height="260"
  />
</template>

<script setup>
import { computed, ref } from 'vue';
import { SingleSelect, TimeSeriesBarChart } from 'outbreakInfo';
import { getCasesByMonth, getStates, GROUPS, GROUP_COLORS } from '../services/epidemiologyService.js';

const props = defineProps({
  host: { type: String, required: true },
  yLabel: { type: String, default: 'Cases' },
  tickInterval: { type: String, default: '3 months' },
});

const state = ref(null);
const stateOptions = getStates(props.host).map((s) => ({ label: s, value: s }));
// Zero rows at the first and last month keep the full date range when one state is selected
const months = getCasesByMonth(props.host).map((d) => d.key).sort();
const ends = [months[0], months.at(-1)].map((key) => ({ key, value: 0, group: GROUPS[0] }));
const chartData = computed(() => [...getCasesByMonth(props.host, state.value), ...ends]);
</script>

<style scoped>

</style>
