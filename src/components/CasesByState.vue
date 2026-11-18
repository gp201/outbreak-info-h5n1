<template>
  <div class="row align-items-center">
    <div class="col-lg-7">
      <UsChoroplethMap :data="byState" :valueLabel="unit" colorScheme="YlGnBu" />
    </div>
    <div class="col-lg-5">
      <BarChart
          :data="chartData"
          colorBy="group"
          :stacked="true"
          :categoryOrder="labels"
          :legendDomain="GROUPS"
          :legendRange="GROUP_COLORS"
          :xLabel="unit"
          yLabel=""
          :width="480"
          :height="labels.length * 22 + 60"
          :marginLeft="150"
          :marginTop="10"
          :tickMultiple="tickStep"
      />
      <p v-if="byState.length > top" class="small text-muted">
        Top {{ top }} of {{ byState.length }}. Hover over the map to see every state.
      </p>
    </div>
  </div>
</template>

<script setup>
import { BarChart, UsChoroplethMap } from 'outbreakInfo';
import { getCasesByState, getCasesByStateAndGroup, GROUPS, GROUP_COLORS } from '../services/epidemiologyService.js';

const props = defineProps({
  host: { type: String, required: true },
  unit: { type: String, default: 'Cases' },
  tickStep: { type: Number, default: 10 },
  top: { type: Number, default: 15 },
});

const byState = getCasesByState(props.host);

// Stacked bars can't be labeled at the end, so each label carries the state's total: "California (773)".
const labelOf = Object.fromEntries(byState.map((d) => [d.state, `${d.state} (${d.value.toLocaleString()})`]));
const labels = byState.slice(0, props.top).map((d) => labelOf[d.state]);
const chartData = getCasesByStateAndGroup(props.host)
  .map((d) => ({ key: labelOf[d.state], value: d.value, group: d.group }))
  .filter((d) => labels.includes(d.key));
</script>

<style scoped>

</style>
