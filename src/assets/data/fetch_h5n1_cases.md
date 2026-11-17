# Update the US H5N1 case data

Write `h5n1_us_cases.json` in this directory. Keep the old file until everything below has worked.

```json
{
  "retrieved_at": "2026-11-17T04:00:00Z",
  "humans":  [{ "month": "2024-10", "state": "California", "cases": 19, "source": "https://www.cdc.gov/..." }],
  "cattle":  [ "... one case = one affected dairy herd ..." ],
  "poultry": [ "... one case = one affected commercial or backyard flock ..." ]
}
```

One record per month (`YYYY-MM`) and state (full name), sorted by month then state. Every record cites the URL its number came from. Put scratch files in a temp directory, not here.


## 1. Cattle and poultry: USDA APHIS tables

USDA publishes its per-herd and per-flock tables only inside Tableau dashboards. Download them with the same HTTP calls the dashboards' "Download Crosstab" button makes (run this as one command):

```bash
TMP=$(mktemp -d)
tableau_csv() {  # workbook sheet -> crosstab on stdout
  local url="https://publicdashboards.dl.usda.gov/vizql/t/MRP_PUB/w/$1/v/HPAI2022ConfirmedDetections" session sid doc key
  local post=(curl -sSf -b "$TMP/cookies" -c "$TMP/cookies")
  session=$("${post[@]}" --data '' "$url/startSession/viewing?:embed=y")
  sid=$(jq -r .sessionid <<<"$session")
  "${post[@]}" -o /dev/null "$url/bootstrapSession/sessions/$sid" \
    --data-urlencode "sheet_id=$(jq -r .sheetId <<<"$session")" --data-urlencode "showParams=$(jq -r .showParams <<<"$session")"
  doc=$("${post[@]}" -F 'thumbnailUris={}' "$url/sessions/$sid/commands/tabsrv/export-crosstab-server-dialog" \
    | jq -er --arg s "$2" '[.. | .thumbnailSheetPickerItems? // empty | .[] | select(.sheetName == $s).sheetdocId][0]')
  key=$("${post[@]}" -F "sheetdocId=$doc" -F useTabs=true -F sendNotifications=true \
    "$url/sessions/$sid/commands/tabsrv/export-crosstab-to-csvserver" | jq -er '[.. | .resultKey? // empty][0]')
  "${post[@]}" "$url/tempfile/sessions/$sid/?key=$key&keepfile=yes&attachment=yes"
}

tableau_csv VS_Cattle_HPAIConfirmedDetections2024 "Table Details by Date"          > "$TMP/cattle.csv"
tableau_csv VS_Avian_HPAIConfirmedDetections2022  "X - Table by Confirmation Date" > "$TMP/poultry.csv"
```

Each file is UTF-16 and tab-separated, with two header rows and then one row per herd or flock. Column 1 is the confirmation date (`10-Nov-26` or `13-Nov-2026`) and column 2 is the state.

- **cattle**: rows whose production (column 4) is `Dairy Milking Cows`.
  Source: https://www.aphis.usda.gov/livestock-poultry-disease/avian/avian-influenza/hpai-detections/hpai-confirmed-cases-livestock
- **poultry**: every row.
  Source: https://www.aphis.usda.gov/livestock-poultry-disease/avian/avian-influenza/hpai-detections/commercial-backyard-flocks

Count rows per month and state, and note each table's latest date.


## 2. Humans: CDC H5 monitoring data

cdc.gov only answers real browsers, so read CDC's two data files with headless Chrome, which wraps the JSON in `<pre>`:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --dump-dom \
  https://www.cdc.gov/wcms/vizdata/NCIRD_FLU/H5Viz/states.json   # and .../weeks.json
```

- `states.json`: human cases per state and exposure category (`total_human_detections` by `animal_category`; "All Animals" is the state total), as of `epi_week`.
- `weeks.json`: human cases per week (`MMWREND`, the week ending) and exposure (`Exposure`, `Cases`).

Place every CDC case in a month (of its week ending) and a state so the records match both files exactly.
Source: https://www.cdc.gov/bird-flu/h5-monitoring/index.html


## 3. Newer cases from deep research

Official data lags. Search for anything confirmed after each source's latest date:

- human cases after CDC's `epi_week`, dated by month of confirmation;
- dairy herds after the cattle table's latest date;
- flocks after the poultry table's latest date.

Check news and state announcements, and compare successive reports before deciding a case is new. Use extended web search, cross-check every number, and never guess. Add only what you can confirm, citing the report.


## Rules

- Cite only CDC, USDA, state health or agriculture departments, or news reports. Never GitHub, blogs or trackers.
- If a site blocks a request, don't work around it (for example with spoofed headers). Use the methods above.
- When done, print the totals: human cases (next to CDC's own total), dairy herds, poultry flocks, and each record you added from step 3.
