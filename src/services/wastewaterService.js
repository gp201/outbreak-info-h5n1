import data from '../assets/data/h5_wastewater.json';

// h5_wastewater.json is written by src/assets/data/fetch_h5_wastewater.sh from CDC's table "A(H5) detections in the
// past six weeks". Each state's positive and tested arrays have one number per week in data.weeks ("11/14/2026", the
// Saturday the week ends): the sites where A(H5) was detected, and the sites that reported a sample.

export const updated = data.updated;
export const states = data.states.map((d) => d.state);

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

// "11/14/2026" -> [Sunday Nov 8, Saturday Nov 14]
function weekDates(week) {
  const [month, day, year] = week.split('/');
  return [new Date(year, month - 1, day - 6), new Date(year, month - 1, day)];
}

// "11/14/2026" -> "Nov 8 – 14"
const weekRange = (week) => dateFormat.formatRange(...weekDates(week));

export const lastWeek = weekRange(data.weeks.at(-1)); // "Nov 8 – 14"
export const allWeeks = dateFormat.formatRange(weekDates(data.weeks[0])[0], weekDates(data.weeks.at(-1))[1]); // "Oct 4 – Nov 14"

// [{ key: "Nov 8 – 14", value, label }], one row per week for BarChart: the proportion of tested sites that were
// positive, labeled "positive of tested". Pass a state to count only its sites.
export function getProportionPositive(state = null) {
  const rows = data.states.filter((d) => !state || d.state === state);
  return data.weeks.map((week, i) => {
    const positive = rows.reduce((n, d) => n + d.positive[i], 0);
    const tested = rows.reduce((n, d) => n + d.tested[i], 0);
    return {
      key: weekRange(week),
      value: tested ? positive / tested : 0,
      label: tested ? `${positive} of ${tested}` : 'No samples',
    };
  });
}

// [{ state, value }] for UsChoroplethMap: each state's proportion of tested sites that were positive in the last week,
// rounded because the map's tooltip shows the value as is. States with no samples that week are left out, so the map
// shows them as "No data". The map's shapes call DC "Washington DC".
export function getProportionPositiveByState() {
  const i = data.weeks.length - 1;
  return data.states
    .filter((d) => d.tested[i])
    .map((d) => ({
      state: d.state === 'District of Columbia' ? 'Washington DC' : d.state,
      value: Math.round((d.positive[i] / d.tested[i]) * 1000) / 1000,
    }));
}
