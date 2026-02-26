# Carbon-Trace

**Industrial Emission Auditor — UN SDG 13: Climate Action**

Carbon-Trace is a full-stack web application that tracks, measures, and audits carbon emissions across industrial factories in three sectors: **Steel**, **Textile**, and **Electronics**. Users upload monthly production data (CSV), and the system runs an automated audit pipeline — cleaning data, computing per-factory emissions using **closure-based auditors**, detecting carbon cap violations, and presenting results through an interactive dashboard.

---

## Tech Stack

| Layer    | Technology                                                    |
| -------- | ------------------------------------------------------------- |
| Backend  | Python · FastAPI · Uvicorn · Pandas · Matplotlib              |
| Frontend | React 19 · Vite 7 · Tailwind CSS 4 · Recharts · Framer Motion |
| Concepts | Closures · Encapsulation · Functional State Management        |

---

## Project Structure

```
Carbon-Trace/
├── backend/
│   ├── api/
│   │   └── main.py                 # FastAPI server — endpoints, CORS, file serving
│   ├── src/
│   │   ├── closures.py             # Core: make_emission_auditor() closure factory
│   │   ├── models.py               # Industry class — wraps closures with read-only interface
│   │   ├── runner.py               # Audit pipeline — CSV → closures → summary CSV + chart
│   │   ├── data_gen.py             # Synthetic data generator (50 factories × 12 months)
│   │   └── __init__.py
│   ├── web_pipeline.py             # 10-step CSV cleaning & validation
│   ├── config/
│   │   └── sectors.json            # Emission factors, carbon caps, energy multipliers
│   ├── data/
│   │   └── monthly_production.csv  # Sample dataset (600 rows)
│   └── tests/
│       └── test_closures.py        # 6 unit tests for closure behavior
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                 # Router: / → Landing, /upload → Upload, /dashboard → Dashboard
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx     # Hero, globe, stats, features, SDG 13 section
│   │   │   ├── UploadPage.jsx      # Drag-and-drop CSV upload
│   │   │   └── DashboardPage.jsx   # Charts, tables, export — displays audit results
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Fixed header with scroll-aware transparency
│   │   │   ├── Footer.jsx          # Site footer with link columns
│   │   │   ├── InteractiveGlobe.jsx # WebGL 3D globe (cobe library)
│   │   │   ├── ui/                 # Reusable UI primitives (shadcn/ui pattern)
│   │   │   └── animations/         # ScrollReveal, TextAnimations, MicroInteractions
│   │   └── lib/
│   │       └── utils.js            # Tailwind class merge utility
│   ├── package.json
│   └── vite.config.js
│
└── README.md                       # ← You are here
```

---

## Backend Architecture

### API Endpoints

| Method   | Endpoint                                   | Purpose                           |
| -------- | ------------------------------------------ | --------------------------------- |
| `GET`    | `/`                                        | Health check                      |
| `POST`   | `/upload-csv`                              | Upload CSV → clean → audit → JSON |
| `GET`    | `/outputs/{job_id}/audit_summary_2026.csv` | Download audit summary CSV        |
| `GET`    | `/outputs/{job_id}/emissions_chart.png`    | Download emissions chart PNG      |
| `DELETE` | `/outputs/{job_id}`                        | Cleanup job output files          |

### Pipeline Flow

```
CSV Upload
    │
    ▼
1. Validate & save file
    │
    ▼
2. web_pipeline.clean_csv()        →  10-step cleaning (normalize, deduplicate, clamp)
    │
    ▼
3. runner.run_audit()              →  Create Industry instances per factory
    │                                  Each Industry creates a closure via make_emission_auditor()
    │                                  Process 12 months of data through each closure
    ▼
4. runner.write_summary_csv()      →  Per-factory summary CSV
   runner.plot_emissions()         →  Cumulative emissions chart (top factories per sector)
    │
    ▼
5. JSON Response                   →  Summary, sector breakdown, violators, factory details,
                                      cleaning report, download file paths
```

### Core Modules

- **`closures.py`** — `make_emission_auditor()` returns a closure that computes and accumulates emissions per factory. Private state includes emission factors, cumulative totals, carbon cap, and monthly log.
- **`models.py`** — `Industry` class wraps the closure with a clean public interface: `record_month()`, and read-only properties (`total_emissions`, `alerts_count`, `is_over_cap`, `history`).
- **`runner.py`** — Orchestrates the full audit: loads config, reads CSV rows, creates `Industry` per factory, calls `record_month()` for each row, generates summary CSV and matplotlib chart.
- **`web_pipeline.py`** — Cleans raw CSV in 10 steps: column validation, whitespace stripping, sector normalization, energy source mapping, numeric coercion, month clamping, negative removal, deduplication, sorting.
- **`data_gen.py`** — Generates synthetic production data for 50 factories across 3 sectors with seasonal variation and weighted energy source selection.

### Configuration — `config/sectors.json`

| Sector      | Carbon Cap (kg CO₂) | Production Factor | Energy Factor | Material Factor |
| ----------- | ------------------- | ----------------- | ------------- | --------------- |
| Steel       | 90,000,000          | 1,850 /ton        | 820 /MWh      | 120 /ton        |
| Textile     | 7,500,000           | 450 /ton          | 520 /MWh      | 65 /ton         |
| Electronics | 13,000,000          | 760 /ton          | 680 /MWh      | 95 /ton         |

Energy source multipliers: Coal 1.25× · Natural Gas 0.85× · Grid 1.0× · Renewable 0.35× · Nuclear 0.15×

---

## Frontend Architecture

### Pages & Routing

| Route        | Page            | Description                                                                           |
| ------------ | --------------- | ------------------------------------------------------------------------------------- |
| `/`          | `LandingPage`   | Hero with parallax, interactive 3D globe, animated stats, features, SDG 13 mission    |
| `/upload`    | `UploadPage`    | Drag-and-drop CSV upload zone, validates file, sends to backend                       |
| `/dashboard` | `DashboardPage` | Summary cards, pie chart (sectors), bar chart (violators), tabbed data tables, export |

### Data Flow

```
LandingPage  →  "Get Started" button  →  UploadPage
                                              │
                                         User drops CSV
                                              │
                                         POST /upload-csv (FormData)
                                              │
                                         Backend returns JSON
                                              │
                                         Navigate to /dashboard
                                         (pass auditData via React Router state)
                                              │
                                         DashboardPage renders:
                                           • 3 summary cards
                                           • Pie chart (emissions by sector)
                                           • Bar chart (top 5 violators)
                                           • Factory/Violator/Sector tables (tabbed)
                                           • Server-generated emissions chart (PNG)
                                           • Export CSV button
```

### Key Components

- **InteractiveGlobe** — WebGL 3D globe using `cobe` with 15 location markers, drag interaction, auto-rotation
- **Navbar** — Fixed position, scroll-aware background opacity, responsive with mobile hamburger menu
- **Animation System** — `ScrollReveal`, `StaggerContainer`, `AnimatedCounter`, `TextReveal`, `MagneticButton`, `FloatingElement` powered by Framer Motion

---

## Curriculum Focus: Closures

The backend architecture is intentionally designed around **closures** as the core computation pattern. The function `make_emission_auditor()` in `closures.py` is a **closure factory** — it returns an inner function that carries private state with it.

### Why Closures?

#### 1. Data Security

Closures provide **true data privacy** without relying on naming conventions or access modifiers.

- **Lexical scoping** — Variables like `_factors`, `_total_emissions`, `_cap`, and `_monthly_log` are defined inside `make_emission_auditor()` and are **only accessible** to the returned inner function. No external code can read or modify them directly.

- **Deep-copied factors** — When a closure is created, the emission factors dictionary is **deep-copied**. Even if the original dict is mutated afterward, the closure's internal copy remains unchanged. This prevents accidental or malicious data corruption.

- **No public attributes** — Unlike a regular class where `self.total_emissions` could be reassigned from outside (`factory.total_emissions = 0`), closure variables cannot be reached. The `Industry` class in `models.py` further reinforces this by exposing only **read-only `@property` methods** and keeping the `_auditor` closure as a private attribute.

- **Tested & verified** — `test_encapsulation` in the test suite explicitly confirms that mutating the original factors dict after closure creation has **zero effect** on the closure's computations.

#### 2. State Management

Closures provide **persistent, isolated state** without global variables or databases.

- **`nonlocal` accumulation** — The `_total_emissions` variable persists across multiple calls to the same closure via Python's `nonlocal` keyword. Each call to the auditor adds that month's emissions to the running total. This is the equivalent of a stateful counter that lives entirely inside the function's scope.

- **Monthly history log** — Each closure maintains its own `_monthly_log` list, building up a complete 12-month emission timeline without any external storage.

- **Factory independence** — Each factory gets **its own closure instance** with completely isolated state. Factory A's cumulative emissions have no connection to Factory B's. There is no shared mutable state, no global dictionary, and no risk of cross-contamination between factories.

- **Cap monitoring** — The closure tracks whether cumulative emissions exceed the carbon cap and returns an `"ALERT"` or `"OK"` status on every call — stateful compliance checking baked into the function itself.

### How It Works

```
make_emission_auditor(sector, factors, cap, multipliers)
    │
    │  Creates private variables:
    │    _factors            ← deep copy of emission factors (immutable from outside)
    │    _total_emissions    ← starts at 0 (accumulates via nonlocal)
    │    _cap               ← carbon cap threshold
    │    _monthly_log       ← empty list (grows each month)
    │    _energy_multipliers ← source-specific multipliers
    │
    └── Returns: auditor(production, energy, source, material)
                    │
                    │  On each call:
                    │    1. Compute monthly emissions (production + energy + material)
                    │    2. Apply energy source multiplier
                    │    3. Add to _total_emissions (nonlocal)
                    │    4. Append to _monthly_log
                    │    5. Check _total_emissions vs _cap
                    │    6. Return { emissions, total, status, breakdown }
                    │
                    └── State persists between calls. No external access to internals.
```

### Closures vs Alternatives

| Approach             | Data Security             | State Management                 | Used Here? |
| -------------------- | ------------------------- | -------------------------------- | ---------- |
| **Global variables** | None — anyone can modify  | Shared, error-prone              | No         |
| **Plain classes**    | Convention only (`_name`) | Works, but attributes exposed    | No         |
| **Closures**         | True privacy via scoping  | `nonlocal` persistence, isolated | **Yes**    |

---

## Setup & Run

### Prerequisites

- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1          # Windows PowerShell
pip install fastapi uvicorn pandas matplotlib python-multipart
uvicorn api.main:app --reload --port 8000
```

- Health check: http://localhost:8000
- Swagger docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

- App: http://localhost:5173

> Both servers must run simultaneously. CORS is pre-configured — no proxy needed.

---

## Testing

```bash
cd backend
python tests/test_closures.py
```

Runs **6 tests** covering:

| Test                            | Validates                                               |
| ------------------------------- | ------------------------------------------------------- |
| `test_state_persistence`        | 12-month emission accumulation in closure               |
| `test_encapsulation`            | External dict mutation doesn't affect closure internals |
| `test_carbon_cap_alert`         | ALERT status when cumulative emissions exceed cap       |
| `test_factory_independence`     | Two factories maintain completely separate state        |
| `test_raw_material_impact`      | Material processing correctly increases emissions       |
| `test_energy_source_multiplier` | Coal vs renewable multipliers applied correctly         |

---

## License

Academic project — SIC Program.
