<template>
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
import { TimeSeriesBarChart } from 'outbreakInfo';
import { getCasesByMonth, GROUPS, GROUP_COLORS } from '../services/epidemiologyService.js';

const props = defineProps({
  host: { type: String, required: true },
  yLabel: { type: String, default: 'Cases' },
  tickInterval: { type: String, default: '3 months' },
});

const chartData = getCasesByMonth(props.host);
</script>

<style scoped>

</style>
