# Update the US H5N1 case data

Rewrite `h5n1_us_cases.json` in this directory, replacing the old file only once everything below has worked. Put scratch files in a temp directory.

```json
{
  "retrieved_at": "2026-11-17T04:00:00Z",
  "sources": [
    {"type": "cdc", "name": "CDC: A(H5) Bird Flu Surveillance and Human Monitoring", "url": "https://www.cdc.gov/bird-flu/h5-monitoring/index.html"}
  ],
  "humans": [
    ["2024-10", "California", 19, 0]
  ],
  "cattle": [],
  "poultry": []
}
```

- A record is `[month (YYYY-MM), state (full name), cases, index into sources]`: one per month, state and source, sorted by month then state, one per line. A cattle case is an affected dairy herd; a poultry case is an affected commercial or backyard flock.
- Each source appears once, one per line. `type` is `cdc`, `usda`, `other` (another confirmed report) or `unconfirmed`, and `name` is "publisher: title".


## 1. Cattle and poultry: USDA APHIS

Download the per-herd and per-flock tables from USDA's Tableau dashboards (run as one command):

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

The files are UTF-16 and tab-separated, with two header rows and then one row per herd or flock. Column 1 is the confirmation date (`10-Nov-26` or `13-Nov-2026`) and column 2 is the state. Count rows per month and state, and note each table's latest date.

- **cattle**: rows whose column 4 is `Dairy Milking Cows`. Source: `usda`, "USDA APHIS: HPAI confirmed cases in livestock", https://www.aphis.usda.gov/livestock-poultry-disease/avian/avian-influenza/hpai-detections/hpai-confirmed-cases-livestock
- **poultry**: every row. Source: `usda`, "USDA APHIS: confirmed HPAI in commercial and backyard flocks", https://www.aphis.usda.gov/livestock-poultry-disease/avian/avian-influenza/hpai-detections/commercial-backyard-flocks


## 2. Humans: CDC

cdc.gov blocks curl, so read its two data files with headless Chrome (`google-chrome` on Linux), which wraps the JSON in `<pre>`:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --dump-dom \
  https://www.cdc.gov/wcms/vizdata/NCIRD_FLU/H5Viz/states.json   # and .../weeks.json
```

- `states.json`: cases per state and exposure (`total_human_detections`; "All Animals" is the state total), as of `epi_week`.
- `weeks.json`: cases per week ending (`MMWREND`) and exposure (`Exposure`, `Cases`).

Place every case in the month of its week ending and in a state, so the records match both files exactly. Source: `cdc`, "CDC: A(H5) Bird Flu Surveillance and Human Monitoring", https://www.cdc.gov/bird-flu/h5-monitoring/index.html


## 3. Newer reports

Official data lags. Use extended web search to look for cases after CDC's `epi_week` and after each USDA table's latest date, in news, state announcements and posts from verified accounts. Compare successive reports, cross-check every number, and never guess.

- **Confirmed cases**: add them by month of confirmation, citing the report (type `other`, or `cdc`/`usda` if the report is theirs).
- **Unconfirmed reports** (for example a preliminary positive, or workers sick but untested): type `unconfirmed`, one record per month and state, with the number reported, or 1 if none is given. Never count them in the totals, and drop one once official data includes it.


## Rules

- Cite only CDC, USDA, state health or agriculture departments, news reports, or verified accounts. A verified account is a Bluesky account whose profile has `verification.verifiedStatus` of `valid`, or an account the organization links to from its own website. Verification shows who is speaking, not that a case is confirmed. Never cite GitHub, blogs or trackers.
- Read Bluesky through its API: `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=<handle>` for a profile, and `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=at://<handle>/app.bsky.feed.post/<post id>` for a post.
- If a site blocks a request, don't work around it (for example with spoofed headers).
- When done, print the confirmed totals (human cases next to CDC's own total, dairy herds and poultry flocks) and every record added in step 3.
