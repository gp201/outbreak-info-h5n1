import data from '../assets/data/h5_wastewater.json';

// h5_wastewater.json is written by src/assets/data/fetch_h5_wastewater.sh from CDC's table "A(H5) detections in the
// past six weeks". Each state's positive and tested arrays have one number per week in data.weeks ("11/14/2026", the
// Saturday the week ends): the sites where A(H5) was detected, and the sites that reported a sample.

export const updated = data.updated;
export const states = data.states.map((d) => d.state);

// [{ key: "Nov 14", value, label }], one row per week for BarChart: the proportion of tested sites that were positive,
// labeled "positive of tested". Pass a state to count only its sites.
export function getProportionPositive(state = null) {
  const rows = data.states.filter((d) => !state || d.state === state);
  return data.weeks.map((week, i) => {
    const positive = rows.reduce((n, d) => n + d.positive[i], 0);
    const tested = rows.reduce((n, d) => n + d.tested[i], 0);
    const [month, day, year] = week.split('/');
    return {
      key: new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: tested ? positive / tested : 0,
      label: tested ? `${positive} of ${tested}` : 'No samples',
    };
  });
}
