#!/usr/bin/env bash
#
# Update h5_wastewater.json from CDC's table "A(H5) detections in the past six weeks" on
# https://www.cdc.gov/wastewater/emerging-viruses/h5.html: for each state and week, the number of wastewater sites
# where A(H5) was detected and the number that reported a sample. Requires curl and jq.

set -euo pipefail
cd "$(dirname "$0")"

# One row per site, with a column per week ("11/14/2026": "+", "-" or "No Data").
# Kept in a variable so the file is only replaced if everything worked.
data=$(curl -sSf https://www.cdc.gov/wcms/vizdata/NCEZID_DIDRI/NWSS_Detection_metric/NWSSDetectSiteMap.json | jq '
  [.[] | select(.Pathogen_Target == "Influenza A(H5) virus")]
  | ([.[0] | keys[] | select(test("^\\d+/\\d+/\\d+$"))] | sort_by(split("/") | map(tonumber) | [.[2], .[0], .[1]])) as $weeks
  | {
      updated: .[0].Date_Updated,
      weeks: $weeks,
      states: (group_by(.["State/Territory"]) | map({
        state: .[0]["State/Territory"],
        positive: [$weeks[] as $w | map(select(.[$w] == "+")) | length],
        tested: [$weeks[] as $w | map(select(.[$w] == "+" or .[$w] == "-")) | length]
      }))
    }')
echo "$data" > h5_wastewater.json
