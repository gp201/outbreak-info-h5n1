<template>
  <div class="container mt-3 mb-5">
    <div class="d-flex flex-wrap justify-content-between align-items-end gap-3">
      <div>
        <h2>Epidemiology</h2>
        <p class="text-muted mb-0">
          Confirmed H5N1 cases in the United States. Data retrieved {{ retrievedOn }}.
        </p>
      </div>
      <SingleSelect v-model="selected" label="Show" :options="options" :filterable="false" :width="220" />
    </div>

    <!-- :key re-creates the charts when the selection changes -->
    <div :key="selected">
      <div class="row g-3 mt-2">
        <div v-for="tile in host.tiles" :key="tile.label" class="col-sm-4">
          <div class="tile">
            <div class="tile-value">{{ tile.value }}</div>
            <div class="tile-label">{{ tile.label }}</div>
          </div>
        </div>
      </div>
      <p class="small text-muted mt-2">{{ host.note }}</p>

      <h5 class="mt-4">{{ host.unit }} per month</h5>
      <TimeSeriesBarChart
        :data="host.monthly"
        dateKey="date"
        valueKey="cases"
        xLabel=""
        :yLabel="host.unit"
        :tickInterval="host.ticks"
        :autoTickInterval="false"
        :width="1100"
        :height="260"
      />

      <h5 class="mt-4">{{ host.unit }} by state</h5>
      <div class="row align-items-center">
        <div class="col-lg-7">
          <UsChoroplethMap :data="host.byState" :valueLabel="host.unit" colorScheme="YlGnBu" />
        </div>
        <div class="col-lg-5">
          <BarChart
            :data="host.byState.slice(0, TOP)"
            yKey="state"
            xKey="value"
            :xLabel="host.unit"
            yLabel=""
            :width="480"
            :height="Math.min(host.byState.length, TOP) * 22 + 60"
            :marginLeft="110"
            :marginRight="40"
            :marginTop="10"
            :showLabels="true"
            :tickMultiple="host.barStep"
          />
          <p v-if="host.byState.length > TOP" class="small text-muted">
            Top {{ TOP }} of {{ host.byState.length }}. Hover over the map to see every state.
          </p>
        </div>
      </div>

      <p class="small text-muted mt-3">
        Sources:
        <template v-for="(source, i) in host.sources" :key="source.url">
          <a :href="source.url" target="_blank">{{ source.site }}</a><span v-if="i < host.sources.length - 1">, </span>
        </template>
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { BarChart, SingleSelect, TimeSeriesBarChart, UsChoroplethMap } from 'outbreakInfo';
import data from '@/assets/data/h5n1_us_cases.json';

// Each record in h5n1_us_cases.json is { month: "YYYY-MM", state, cases, source }.
const HOSTS = {
  humans: {
    label: 'Humans', title: 'Human cases', unit: 'Cases', ticks: '3 months', barStep: 10,
    note: 'Confirmed by CDC, by month of the CDC surveillance week.',
  },
  cattle: {
    label: 'Dairy cattle', title: 'Affected dairy herds', unit: 'Herds', ticks: '3 months', barStep: 200,
    note: 'Dairy herds confirmed by USDA APHIS, by month of confirmation.',
  },
  poultry: {
    label: 'Poultry', title: 'Affected poultry flocks', unit: 'Flocks', ticks: '6 months', barStep: 50,
    note: 'Commercial and backyard flocks confirmed by USDA APHIS, by month of confirmation.',
  },
};
const TOP = 15;

const options = Object.entries(HOSTS).map(([value, host]) => ({ value, label: host.label }));
// The selection is kept in the URL (?host=cattle), so each view can be linked to.
const route = useRoute();
const router = useRouter();
const selected = ref(HOSTS[route.query.host] ? route.query.host : 'humans');
watch(selected, (key) => router.replace({ query: { host: key } }));
const host = computed(() => summaries[selected.value]);

const retrievedOn = new Date(data.retrieved_at).toLocaleDateString('en-US', { dateStyle: 'medium' });
const currentMonth = data.retrieved_at.slice(0, 7); // month the data was retrieved, "YYYY-MM"

// "2024-10" -> mid-month date, so each bar lands in its own month in any time zone.
const midMonth = (month) => new Date(+month.slice(0, 4), +month.slice(5, 7) - 1, 15);
const monthName = (month) => midMonth(month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

// [[key value, summed cases], ...], largest first
function totalsBy(records, key) {
  const totals = {};
  for (const r of records) totals[r[key]] = (totals[r[key]] || 0) + r.cases;
  return Object.entries(totals).sort((a, b) => b[1] - a[1]);
}

function summarize(key) {
  const host = HOSTS[key];
  const records = data[key];
  const total = records.reduce((n, r) => n + r.cases, 0);
  const byState = totalsBy(records, 'state').map(([state, value]) => ({ state, value }));
  const thisMonth = records.filter((r) => r.month === currentMonth).reduce((n, r) => n + r.cases, 0);
  const months = records.map((r) => r.month).sort();

  return {
    ...host,
    tiles: [
      { value: total.toLocaleString(), label: host.title },
      { value: byState.length, label: byState.some((d) => d.state === 'Puerto Rico') ? 'States and territories' : 'States' },
      { value: thisMonth.toLocaleString(), label: `${host.unit} in ${monthName(currentMonth)} so far` },
    ],
    note: `${host.note} ${monthName(months[0])} to ${monthName(months.at(-1))}.`,
    monthly: records.map((r) => ({ date: midMonth(r.month), cases: r.cases })),
    byState,
    sources: [...new Set(records.map((r) => r.source))].map((url) => ({ url, site: new URL(url).hostname })),
  };
}

const summaries = Object.fromEntries(Object.keys(HOSTS).map((key) => [key, summarize(key)]));
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
</style>
