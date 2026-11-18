import { outbreakInfoColorPalette } from 'outbreakInfo';
import data from '../assets/data/h5n1_us_cases.json';

// h5n1_us_cases.json is written by src/assets/data/fetch_h5n1_cases.sh. To keep it small, each host's records are
// [month, state, cases, source] rows, where source indexes data.sources ({ type, name, url }) and type is
// cdc, usda, other or unconfirmed. Unconfirmed cases are the number reported, or 1 if none was given.
const expand = (rows) => rows.map(([month, state, cases, source]) => ({ month, state, cases, ...data.sources[source] }));
const records = { humans: expand(data.humans), cattle: expand(data.cattle), poultry: expand(data.poultry) };

export const GROUPS = ['CDC / USDA APHIS', 'Other reports', 'Unconfirmed reports'];
export const GROUP_COLORS = [outbreakInfoColorPalette[0], outbreakInfoColorPalette[2], outbreakInfoColorPalette[6]]; // blue, orange, red
const groupOf = (r) => ({ cdc: GROUPS[0], usda: GROUPS[0], other: GROUPS[1], unconfirmed: GROUPS[2] })[r.type];

const sum = (list) => list.reduce((n, r) => n + r.cases, 0);
const confirmed = (host) => records[host].filter((r) => r.type !== 'unconfirmed');

export const retrievedAt = data.retrieved_at;

// Confirmed cases, optionally only for one month ("YYYY-MM")
export function getCaseCount(host, month = null) {
  return sum(confirmed(host).filter((r) => month === null || r.month === month));
}

// [{ key: "2024-10", value, group }], one row per record, for TimeSeriesBarChart with isPreBinned.
// Pass a state to keep only that state's records.
export function getCasesByMonth(host, state = null) {
  return records[host]
    .filter((r) => !state || r.state === state)
    .map((r) => ({ key: r.month, value: r.cases, group: groupOf(r) }));
}

// Every state with a record, alphabetical
export function getStates(host) {
  return [...new Set(records[host].map((r) => r.state))].sort();
}

// [{ state, value }], confirmed cases, largest first
export function getCasesByState(host) {
  const states = [...new Set(confirmed(host).map((r) => r.state))];
  return states
    .map((state) => ({ state, value: sum(confirmed(host).filter((r) => r.state === state)) }))
    .sort((a, b) => b.value - a.value);
}

// [{ state, value, group }], one row per state and group
export function getCasesByStateAndGroup(host) {
  const states = [...new Set(records[host].map((r) => r.state))];
  return states.flatMap((state) => GROUPS.map((group) => ({
    state,
    value: sum(records[host].filter((r) => r.state === state && groupOf(r) === group)),
    group,
  })));
}

// [{ group, color, sources: [{ name, url }] }]: each group's distinct record sources, sorted by name
export function getSources(host) {
  return GROUPS.map((group, i) => {
    const urls = new Map(records[host].filter((r) => groupOf(r) === group).map((r) => [r.url, r.name]));
    const sources = [...urls].map(([url, name]) => ({ url, name })).sort((a, b) => a.name.localeCompare(b.name));
    return { group, color: GROUP_COLORS[i], sources };
  }).filter((g) => g.sources.length);
}
