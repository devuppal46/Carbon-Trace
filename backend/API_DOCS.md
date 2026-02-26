# Carbon-Trace API Documentation

> **Base URL:** `http://localhost:8000`  
> **Interactive Docs (Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)  
> **CORS:** Enabled for all origins — any frontend can connect directly.

---

## Quick Start

```bash
# Start the backend server
cd backend
uvicorn api.main:app --reload --port 8000
```

---

## Endpoints Overview

| Method   | Endpoint                                    | Description                            |
|----------|---------------------------------------------|----------------------------------------|
| `GET`    | `/`                                         | Health check                           |
| `POST`   | `/upload-csv`                               | Upload CSV → run audit → get results   |
| `GET`    | `/outputs/{job_id}/audit_summary_2026.csv`  | Download audit summary CSV             |
| `GET`    | `/outputs/{job_id}/emissions_chart.png`     | Download emissions chart image         |
| `DELETE` | `/outputs/{job_id}`                         | Delete job output files (cleanup)      |

---

## 1. Health Check

### `GET /`

Check if the API is running.

**Response** `200 OK`

```json
{
  "service": "Carbon-Trace API",
  "version": "1.0.0",
  "status": "running",
  "docs": "/docs"
}
```

**Frontend usage:**

```js
const res = await fetch("http://localhost:8000/");
const data = await res.json();
// data.status === "running"
```

---

## 2. Upload CSV & Run Audit ⭐ (Main Endpoint)

### `POST /upload-csv`

This is the **primary endpoint** your frontend will call. It accepts a CSV file, cleans it, runs the full emission audit, and returns all results as JSON.

### Request

| Field  | Type   | Required | Description              |
|--------|--------|----------|--------------------------|
| `file` | File   | ✅ Yes   | `.csv` file (multipart)  |

**Content-Type:** `multipart/form-data`

### CSV File Format

The uploaded CSV **must** contain these 7 columns:

| Column                      | Type    | Description                          | Example          |
|-----------------------------|---------|--------------------------------------|------------------|
| `factory_id`                | string  | Unique factory identifier            | `FAC_STEEL_01`   |
| `sector`                    | string  | Industry sector                      | `Steel`          |
| `month`                     | integer | Month number (1–12)                  | `3`              |
| `monthly_production_tons`   | float   | Tons produced that month             | `1673.0`         |
| `energy_used_mwh`           | float   | Energy consumed in MWh               | `3787.4`         |
| `energy_source_type`        | string  | Energy source type                   | `coal`           |
| `raw_material_weight_tons`  | float   | Raw material consumed (tons)         | `2141.5`         |

**Accepted sectors:** `Steel`, `Textile`, `Electronics`  
**Accepted energy sources:** `coal`, `natural_gas`, `gas`, `grid`, `electricity`, `renewable`, `solar`, `wind`, `hydro`, `nuclear`

> **Note:** The backend automatically cleans/normalizes your CSV — it handles whitespace, casing inconsistencies, missing values, duplicates, and invalid rows. You'll see what was cleaned in the `cleaning_report` field of the response.

### Frontend Code Example

```js
async function uploadCSV(file) {
  const formData = new FormData();
  formData.append("file", file);  // file from <input type="file">

  const response = await fetch("http://localhost:8000/upload-csv", {
    method: "POST",
    body: formData,
    // Do NOT set Content-Type header — browser sets it automatically with boundary
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail);
  }

  return await response.json();
}
```

**React example with file input:**

```jsx
function CSVUploader() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/upload-csv", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleUpload} />
      {loading && <p>Processing audit...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {result && (
        <div>
          <h3>Audit Complete!</h3>
          <p>Factories: {result.summary.total_factories}</p>
          <p>Total Emissions: {result.summary.total_emissions_tons.toLocaleString()} tons CO₂</p>
          <p>Violators: {result.summary.factories_over_cap}</p>

          {/* Display the chart */}
          <img
            src={`http://localhost:8000${result.files.chart}`}
            alt="Emissions Chart"
          />

          {/* Download CSV link */}
          <a href={`http://localhost:8000${result.files.audit_csv}`} download>
            Download Audit Summary CSV
          </a>
        </div>
      )}
    </div>
  );
}
```

### Response `200 OK`

```json
{
  "job_id": "48094428ab31",

  "summary": {
    "total_factories": 50,
    "total_emissions_kg": 2034611129.6,
    "total_emissions_tons": 2034611.13,
    "total_alerts": 44,
    "factories_over_cap": 23
  },

  "sector_breakdown": {
    "Electronics": {
      "factories": 15,
      "total_emissions_kg": 194272353.5,
      "avg_per_factory_kg": 12951490.23
    },
    "Steel": {
      "factories": 20,
      "total_emissions_kg": 1732699087.7,
      "avg_per_factory_kg": 86634954.39
    },
    "Textile": {
      "factories": 15,
      "total_emissions_kg": 107639688.4,
      "avg_per_factory_kg": 7175979.23
    }
  },

  "violators": [
    {
      "id": "FAC_STEEL_15",
      "sector": "Steel",
      "total": 112067606.5,
      "alerts": 3
    },
    {
      "id": "FAC_STEEL_11",
      "sector": "Steel",
      "total": 107168308.2,
      "alerts": 2
    }
  ],

  "factories": [
    {
      "factory_id": "FAC_STEEL_01",
      "sector": "Steel",
      "total_emissions_kg": 80543210.5,
      "max_monthly_kg": 7698196.5,
      "avg_monthly_kg": 6711934.21,
      "alerts": 0,
      "status": "COMPLIANT"
    },
    {
      "factory_id": "FAC_STEEL_02",
      "sector": "Steel",
      "total_emissions_kg": 69150300.1,
      "max_monthly_kg": 6700653.0,
      "avg_monthly_kg": 5762525.01,
      "alerts": 0,
      "status": "COMPLIANT"
    }
  ],

  "cleaning_report": {
    "original_rows": 600,
    "actions": [
      "No issues found — CSV was already clean"
    ],
    "cleaned_rows": 600,
    "rows_removed": 0,
    "factories_found": 50,
    "sectors_found": ["Electronics", "Steel", "Textile"]
  },

  "files": {
    "audit_csv": "/outputs/48094428ab31/audit_summary_2026.csv",
    "chart": "/outputs/48094428ab31/emissions_chart.png"
  }
}
```

### Response Field Reference

| Field                               | Type     | Description                                                     |
|-------------------------------------|----------|-----------------------------------------------------------------|
| `job_id`                            | string   | Unique ID for this audit job (use for file downloads & cleanup) |
| `summary.total_factories`           | int      | Number of unique factories in the dataset                       |
| `summary.total_emissions_kg`        | float    | Grand total emissions across all factories (kg CO₂)             |
| `summary.total_emissions_tons`      | float    | Same as above but in metric tons (÷ 1000)                       |
| `summary.total_alerts`              | int      | Total number of months where any factory exceeded its cap       |
| `summary.factories_over_cap`        | int      | Count of factories that exceeded their annual carbon cap        |
| `sector_breakdown.{Sector}`         | object   | Per-sector aggregated stats                                     |
| `.factories`                        | int      | Number of factories in this sector                              |
| `.total_emissions_kg`               | float    | Sector-wide total emissions (kg)                                |
| `.avg_per_factory_kg`               | float    | Average emissions per factory in this sector (kg)               |
| `violators[]`                       | array    | Top 10 factories that exceeded their carbon cap (sorted desc)   |
| `violators[].id`                    | string   | Factory ID                                                      |
| `violators[].sector`                | string   | Sector name                                                     |
| `violators[].total`                 | float    | Total annual emissions (kg)                                     |
| `violators[].alerts`                | int      | Number of months the cap was exceeded                           |
| `factories[]`                       | array    | Full per-factory breakdown (all factories)                      |
| `factories[].factory_id`            | string   | Factory ID                                                      |
| `factories[].sector`                | string   | Sector name                                                     |
| `factories[].total_emissions_kg`    | float    | Annual cumulative emissions (kg)                                |
| `factories[].max_monthly_kg`        | float    | Highest single-month emissions (kg)                             |
| `factories[].avg_monthly_kg`        | float    | Average monthly emissions (kg)                                  |
| `factories[].alerts`                | int      | Number of ALERT months                                          |
| `factories[].status`                | string   | `"COMPLIANT"` or `"EXCEEDED"`                                   |
| `cleaning_report.original_rows`     | int      | Rows in the uploaded CSV before cleaning                        |
| `cleaning_report.cleaned_rows`      | int      | Rows remaining after cleaning                                   |
| `cleaning_report.rows_removed`      | int      | Number of rows dropped during cleanup                           |
| `cleaning_report.factories_found`   | int      | Unique factory IDs found                                        |
| `cleaning_report.sectors_found`     | string[] | List of sectors detected                                        |
| `cleaning_report.actions`           | string[] | Human-readable list of cleanup actions performed                |
| `files.audit_csv`                   | string   | Relative URL path to download the audit summary CSV             |
| `files.chart`                       | string   | Relative URL path to download/display the emissions chart PNG   |

### Using File URLs

The `files` object returns **relative paths**. Prepend the base URL to use them:

```js
const BASE_URL = "http://localhost:8000";

// Display chart image
const chartUrl = `${BASE_URL}${data.files.chart}`;
// → "http://localhost:8000/outputs/48094428ab31/emissions_chart.png"

// Download CSV
const csvUrl = `${BASE_URL}${data.files.audit_csv}`;
// → "http://localhost:8000/outputs/48094428ab31/audit_summary_2026.csv"
```

### Error Responses

| Status | When                                      | Response Body                                       |
|--------|-------------------------------------------|-----------------------------------------------------|
| `400`  | Non-CSV file uploaded                     | `{ "detail": "Invalid file type. Please upload a .csv file." }` |
| `422`  | CSV missing required columns              | `{ "detail": "Missing required columns: ['sector', ...]. Expected: [...]" }` |
| `422`  | CSV is empty                              | `{ "detail": "Uploaded CSV is empty — no rows found." }` |
| `422`  | No valid factories after cleaning         | `{ "detail": "No valid factory data found after cleaning..." }` |
| `500`  | Unexpected server error                   | `{ "detail": "Audit pipeline failed: <error message>" }` |

**Frontend error handling:**

```js
const res = await fetch("http://localhost:8000/upload-csv", {
  method: "POST",
  body: formData,
});

if (!res.ok) {
  const err = await res.json();
  
  switch (res.status) {
    case 400:
      alert("Please upload a .csv file");
      break;
    case 422:
      alert(`Invalid CSV: ${err.detail}`);
      break;
    case 500:
      alert("Server error — please try again");
      break;
  }
  return;
}

const data = await res.json();
```

---

## 3. Download Audit Summary CSV

### `GET /outputs/{job_id}/audit_summary_2026.csv`

Download the generated audit summary CSV file.

| Parameter | Type   | Description                             |
|-----------|--------|-----------------------------------------|
| `job_id`  | string | The `job_id` returned from `/upload-csv` |

**Response:** CSV file download (`text/csv`)

**CSV columns:**

| Column                    | Description                               |
|---------------------------|-------------------------------------------|
| `factory_id`              | Factory identifier                        |
| `sector`                  | Industry sector                           |
| `total_emissions_kg`      | Annual total emissions (kg CO₂)           |
| `max_monthly_emissions_kg`| Highest single-month emissions (kg)       |
| `avg_monthly_emissions_kg`| Average monthly emissions (kg)            |
| `alerts_count`            | Number of months cap was exceeded         |
| `status`                  | `COMPLIANT` or `EXCEEDED`                 |

**Frontend usage:**

```js
// Trigger CSV download
function downloadCSV(jobId) {
  const url = `http://localhost:8000/outputs/${jobId}/audit_summary_2026.csv`;
  const a = document.createElement("a");
  a.href = url;
  a.download = "audit_summary_2026.csv";
  a.click();
}
```

**Error:** `404` if job_id doesn't exist.

---

## 4. Download Emissions Chart

### `GET /outputs/{job_id}/emissions_chart.png`

Download or display the cumulative emissions chart image.

| Parameter | Type   | Description                             |
|-----------|--------|-----------------------------------------|
| `job_id`  | string | The `job_id` returned from `/upload-csv` |

**Response:** PNG image (`image/png`)

**Frontend usage:**

```jsx
// Display chart in an <img> tag
<img
  src={`http://localhost:8000/outputs/${jobId}/emissions_chart.png`}
  alt="Carbon-Trace Emissions Chart"
  style={{ maxWidth: "100%", borderRadius: "8px" }}
/>
```

**Error:** `404` if job_id doesn't exist.

---

## 5. Cleanup Job Files

### `DELETE /outputs/{job_id}`

Delete all generated files for a completed job. Call this after the user is done viewing results to free server storage.

| Parameter | Type   | Description                             |
|-----------|--------|-----------------------------------------|
| `job_id`  | string | The `job_id` returned from `/upload-csv` |

**Response** `200 OK`

```json
{
  "message": "Job 48094428ab31 cleaned up.",
  "job_id": "48094428ab31"
}
```

**Frontend usage:**

```js
// Clean up after user is done
async function cleanupJob(jobId) {
  await fetch(`http://localhost:8000/outputs/${jobId}`, {
    method: "DELETE",
  });
}

// Example: cleanup when user navigates away
window.addEventListener("beforeunload", () => {
  if (currentJobId) {
    navigator.sendBeacon(`http://localhost:8000/outputs/${currentJobId}`);
  }
});
```

**Error:** `404` if job_id doesn't exist.

---

## Complete Frontend Integration Flow

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND FLOW                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User selects CSV file                                    │
│       ↓                                                      │
│  2. POST /upload-csv  (FormData with file)                   │
│       ↓                                                      │
│  3. Show loading spinner while processing...                 │
│       ↓                                                      │
│  4. Receive JSON response                                    │
│       ↓                                                      │
│  5. Display dashboard:                                       │
│     ┌─────────────────────────────────────────────┐          │
│     │  Summary Cards                              │          │
│     │  ┌──────┐ ┌──────────┐ ┌────────────────┐  │          │
│     │  │  50  │ │ 2,034 kt │ │  23 Violators  │  │          │
│     │  │ Fac. │ │  CO₂     │ │                │  │          │
│     │  └──────┘ └──────────┘ └────────────────┘  │          │
│     ├─────────────────────────────────────────────┤          │
│     │  Sector Breakdown Table                     │          │
│     │  (use response.sector_breakdown)            │          │
│     ├─────────────────────────────────────────────┤          │
│     │  Emissions Chart                            │          │
│     │  <img src="{BASE_URL}{files.chart}" />      │          │
│     ├─────────────────────────────────────────────┤          │
│     │  Violators Table                            │          │
│     │  (use response.violators)                   │          │
│     ├─────────────────────────────────────────────┤          │
│     │  All Factories Table (sortable/filterable)  │          │
│     │  (use response.factories)                   │          │
│     ├─────────────────────────────────────────────┤          │
│     │  [Download CSV]  [Download Chart]           │          │
│     │  (use response.files.audit_csv / .chart)    │          │
│     └─────────────────────────────────────────────┘          │
│       ↓                                                      │
│  6. (Optional) DELETE /outputs/{job_id} on page leave        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Environment Setup

```bash
# Install backend dependencies
pip install fastapi uvicorn pandas matplotlib python-multipart

# Start development server
cd backend
uvicorn api.main:app --reload --port 8000

# The API will be available at:
#   http://localhost:8000          → Health check
#   http://localhost:8000/docs     → Swagger UI (test endpoints)
#   http://localhost:8000/upload-csv  → Main audit endpoint
```

---

## Testing with cURL

```bash
# Health check
curl http://localhost:8000/

# Upload CSV and run audit
curl -F "file=@data/monthly_production.csv" http://localhost:8000/upload-csv

# Download generated chart (replace JOB_ID)
curl -O http://localhost:8000/outputs/JOB_ID/emissions_chart.png

# Download generated CSV (replace JOB_ID)
curl -O http://localhost:8000/outputs/JOB_ID/audit_summary_2026.csv

# Cleanup job files (replace JOB_ID)
curl -X DELETE http://localhost:8000/outputs/JOB_ID
```

---

## Notes for Frontend Developers

1. **No `Content-Type` header needed** — When sending `FormData`, the browser automatically sets `Content-Type: multipart/form-data` with the correct boundary. Do NOT manually set this header.

2. **File URLs are relative** — Always prepend `BASE_URL` to paths in `files.audit_csv` and `files.chart`.

3. **Processing time** — The audit pipeline takes ~2–5 seconds depending on CSV size. Show a loading indicator.

4. **Job cleanup** — Each upload creates files on the server. Call `DELETE /outputs/{job_id}` when the user is done, or files will persist until manually cleaned.

5. **Error messages are user-friendly** — The `detail` field in error responses can be shown directly to users.

6. **CORS is fully open** — The backend accepts requests from any origin, so no proxy configuration is needed during development.

7. **Max file size** — There's no explicit limit, but very large CSVs (>100MB) may cause timeouts. Typical files (50 factories × 12 months = 600 rows) process in under 3 seconds.

8. **Swagger UI** — Visit `http://localhost:8000/docs` to test all endpoints interactively in the browser.
