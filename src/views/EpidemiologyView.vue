<template>
  <div class="container mt-3 mb-5">
    <h2>Epidemiology</h2>
    <InfoComponent :embedded="true" class="mb-3">
      <span v-html="helpText.epidemiology.overview"></span> <strong>Data retrieved {{ retrievedOn }}.</strong>
    </InfoComponent>

    <TabsWrapper :tabs="tabs" size="large">
      <template v-for="(host, key) in hosts" :key="key" v-slot:[key]>
        <div class="row g-3">
          <div v-for="tile in tilesFor(key, host)" :key="tile.label" class="col-sm-4">
            <div class="tile">
              <div class="tile-value">{{ tile.value }}</div>
              <div class="tile-label">{{ tile.label }}</div>
            </div>
          </div>
        </div>

        <h5 class="mt-4">{{ host.unit }} per month</h5>
        <InfoComponent :embedded="true">
          <span v-html="helpText.epidemiology[key]"></span>
        </InfoComponent>
        <CasesByMonth :host="key" :yLabel="host.unit" :tickInterval="host.tickInterval" />

        <h5 class="mt-4">{{ host.unit }} by state</h5>
        <CasesByState :host="key" :unit="host.unit" :tickStep="host.tickStep" />

        <h5 class="mt-5">Sources</h5>
        <InfoComponent :embedded="true">
          <span v-html="helpText.epidemiology.sources"></span>
        </InfoComponent>
        <template v-for="group in getSources(key)" :key="group.group">
          <h6 class="mt-3"><span class="swatch" :style="{ background: group.color }"></span> {{ group.group }}</h6>
          <ol class="small">
            <li v-for="source in group.sources" :key="source.url">
              <a :href="source.url" target="_blank">{{ source.name }}</a>
            </li>
          </ol>
        </template>
      </template>
    </TabsWrapper>
  </div>
</template>

<script setup>
import { InfoComponent, TabsWrapper } from 'outbreakInfo';
import CasesByMonth from "../components/CasesByMonth.vue";
import CasesByState from "../components/CasesByState.vue";
import { getCaseCount, getCasesByState, getSources, retrievedAt } from '../services/epidemiologyService.js';
import helpText from "../helpInfo/helpInfoText.json";

const hosts = {
  humans: { name: 'Humans', title: 'Human cases', unit: 'Cases', tickInterval: '3 months', tickStep: 10 },
  cattle: { name: 'Dairy cattle', title: 'Affected dairy herds', unit: 'Herds', tickInterval: '3 months', tickStep: 200 },
  poultry: { name: 'Poultry', title: 'Affected poultry flocks', unit: 'Flocks', tickInterval: '6 months', tickStep: 50 },
};
const tabs = Object.entries(hosts).map(([key, host]) => ({ name: host.name, key }));

const retrievedOn = new Date(retrievedAt).toLocaleDateString('en-US', { dateStyle: 'medium' });

// "This month" is the month the data was retrieved, so the tile matches the data.
const currentMonth = retrievedAt.slice(0, 7);
const currentMonthName = new Date(`${currentMonth}-15`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

function tilesFor(key, host) {
  return [
    { value: getCaseCount(key).toLocaleString(), label: host.title },
    { value: getCasesByState(key).length, label: 'States and territories' },
    { value: getCaseCount(key, currentMonth), label: `${host.unit} in ${currentMonthName} so far` },
  ];
}
</script>

<style scoped>
.tile {
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 0.75rem 1rem;
}

.tile-value {
  font-size: 1.75rem;
  font-weight: 500;
  line-height: 1.2;
}

.tile-label {
  color: #6c757d;
  font-size: 0.9rem;
}

.swatch {
  display: inline-block;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 2px;
}
</style>
