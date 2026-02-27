<div align="center">

# 🌍 Carbon-Trace

### Industrial Emission Auditor for Climate Action

**UN SDG 13: Climate Action**

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

*A full-stack carbon auditing platform demonstrating Python **closures** for secure, isolated state management in industrial emission tracking.*

[Features](#-key-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Closures Deep Dive](#-the-closures-architecture) • [API](#-api-reference)

---

</div>

## 📋 Overview

**Carbon-Trace** is an industrial carbon emission auditing system that processes monthly production data from factories across **Steel**, **Textile**, and **Electronics** sectors. The application demonstrates how **Python closures** can provide:

- 🔒 **True Data Privacy** — Emission factors and cumulative totals are encapsulated within function scope
- 🏭 **Factory Independence** — Each factory gets its own isolated auditor with zero cross-contamination
- 📊 **Stateful Computation** — Running totals persist across monthly calls without global state

### How It Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CARBON-TRACE WORKFLOW                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   📁 CSV Upload    →    🧹 10-Step Cleaning    →    🏭 Closure Auditors     │
│                                                                             │
│   ┌───────────┐         ┌───────────────┐          ┌──────────────────┐    │
│   │ 50 factories       │ • Validate     │          │ Each factory gets│    │
│   │ × 12 months │  →   │ • Normalize    │  →       │ its own closure  │    │
│   │ = 600 rows  │       │ • Deduplicate  │          │ with private     │    │
│   └───────────┘         └───────────────┘          │ state variables  │    │
│                                                     └────────┬─────────┘    │
│                                                              │              │
│   ┌─────────────────────────────────────────────────────────▼───────────┐  │
│   │                        AUDIT RESULTS                                 │  │
│   │   📊 Summary CSV  •  📈 Emissions Chart  •  🚨 Cap Violation Alerts  │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔐 **Closure-Based Auditors** | Each factory's emission calculator is a closure with private state — impossible to tamper with from outside |
| 📤 **CSV Upload & Validation** | 10-step cleaning pipeline: whitespace stripping, sector normalization, energy source mapping, deduplication |
| 📊 **Real-Time Dashboard** | Interactive pie charts, bar graphs, tabbed data tables with sorting and filtering |
| 🚨 **Carbon Cap Monitoring** | Automatic detection and alerting when factories exceed their annual emission limits |
| 📈 **Cumulative Emission Charts** | Server-generated matplotlib visualizations showing emission growth over 12 months |
| 🌐 **Interactive 3D Globe** | WebGL globe with factory location markers using the `cobe` library |
| 📱 **Responsive Design** | Full mobile support with dark mode, smooth animations via Framer Motion |

---

## 🚀 Quick Start

### Prerequisites

- **Python** 3.10+
- **Node.js** 18+

### 1️⃣ Clone & Setup Backend

```bash
git clone https://github.com/your-username/Carbon-Trace.git
cd Carbon-Trace/backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate        # Linux/macOS
# .venv\Scripts\Activate.ps1     # Windows PowerShell

# Install dependencies
pip install fastapi uvicorn pandas matplotlib python-multipart

# Start server
uvicorn api.main:app --reload --port 8000
```

✅ **Backend running at:** http://localhost:8000  
📚 **API Docs:** http://localhost:8000/docs

### 2️⃣ Setup Frontend

```bash
cd ../frontend
npm install
npm run dev
```

✅ **App running at:** http://localhost:5173

### 3️⃣ Try It Out

1. Open http://localhost:5173
2. Click **"Start Auditing"**
3. Upload `backend/data/monthly_production.csv` (sample dataset included)
4. View the audit dashboard with charts, tables, and violator reports

---

## 🏗 Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Backend** | Python · FastAPI · Uvicorn | REST API server with async support |
| **Data Processing** | Pandas · Matplotlib | CSV manipulation and chart generation |
| **Frontend** | React 19 · Vite 7 | Modern SPA with hot module replacement |
| **Styling** | Tailwind CSS 4 | Utility-first CSS framework |
| **Charts** | Recharts | React-based charting library |
| **Animations** | Framer Motion | Production-ready motion library |
| **3D Globe** | Cobe | WebGL-based interactive earth globe |

### Project Structure

```
Carbon-Trace/
├── 📁 backend/
│   ├── api/
│   │   └── main.py                 # FastAPI endpoints, CORS, file serving
│   ├── src/
│   │   ├── closures.py             # 🔑 Core: make_emission_auditor() closure factory
│   │   ├── models.py               # Industry class wrapping closures
│   │   ├── runner.py               # Audit orchestration pipeline
│   │   └── data_gen.py             # Synthetic data generator
│   ├── web_pipeline.py             # 10-step CSV cleaning
│   ├── config/
│   │   └── sectors.json            # Emission factors & carbon caps
│   ├── data/
│   │   └── monthly_production.csv  # Sample dataset (600 rows)
│   └── tests/
│       └── test_closures.py        # 6 unit tests for closure behavior
│
├── 📁 frontend/
│   ├── src/
│   │   ├── App.jsx                 # React Router setup
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx     # Hero, globe, features
│   │   │   ├── UploadPage.jsx      # Drag-and-drop CSV upload
│   │   │   └── DashboardPage.jsx   # Charts, tables, export
│   │   └── components/
│   │       ├── InteractiveGlobe.jsx
│   │       ├── Navbar.jsx
│   │       ├── animations/         # Scroll, text, micro-interactions
│   │       └── ui/                 # shadcn/ui components
│   └── package.json
│
└── README.md
```

---

## 🔐 The Closures Architecture

> **This is the core curriculum focus of the project — demonstrating how closures provide data security and state isolation in Python.**

### What is a Closure?

A closure is a function that **remembers** variables from its enclosing scope even after that scope has finished executing. In Carbon-Trace, each factory gets its own **auditor closure** that:

1. **Encapsulates private state** — emission factors, running totals, and history
2. **Persists across calls** — each month's data adds to the cumulative total
3. **Cannot be tampered with** — no external code can access or modify the internal state

### The Closure Factory Pattern

```python
# closures.py — Simplified view

def make_emission_auditor(sector, emission_factor, carbon_cap_kg, energy_multipliers):
    """
    Factory function that returns a closure for one factory's emissions.
    All variables defined here become PRIVATE to the returned function.
    """
    
    # ═══════════════════════════════════════════════════════════════
    # PRIVATE STATE — Only accessible to the inner function
    # ═══════════════════════════════════════════════════════════════
    _factors = {                          # Deep-copied, immutable from outside
        "production_per_ton": float(emission_factor.get("production_per_ton", 0)),
        "energy_per_mwh": float(emission_factor.get("energy_per_mwh", 0)),
        "material_processing_per_ton": float(emission_factor.get("material_processing_per_ton", 0)),
    }
    _total_emissions = 0.0                 # Accumulates via nonlocal
    _cap = float(carbon_cap_kg)            # Carbon cap threshold
    _monthly_log = []                      # History of monthly emissions
    
    # ═══════════════════════════════════════════════════════════════
    # THE CLOSURE — Returned to caller, carries private state with it
    # ═══════════════════════════════════════════════════════════════
    def auditor(production_tons, energy_mwh, energy_source=None, raw_material_tons=None):
        nonlocal _total_emissions          # Access outer scope variable
        
        # Compute emissions from all components
        emissions = (
            production_tons * _factors["production_per_ton"] +
            energy_mwh * _factors["energy_per_mwh"] +
            (raw_material_tons or 0) * _factors["material_processing_per_ton"]
        )
        
        # Apply energy source multiplier
        multiplier = _energy_multipliers.get(energy_source, 1.0)
        emissions *= multiplier
        
        # Accumulate state (persists across calls!)
        _total_emissions += emissions
        _monthly_log.append(emissions)
        
        return {
            "monthly_emissions_kg": emissions,
            "total_emissions_kg": _total_emissions,
            "status": "ALERT" if _total_emissions > _cap else "OK"
        }
    
    return auditor   # Return the closure, not call it
```

### Why Closures Instead of Classes?

| Aspect | Regular Class | Closure |
|--------|--------------|---------|
| **Data Privacy** | Convention only (`self._private`) — can still be accessed | True privacy — variables exist only in function scope |
| **External Mutation** | `obj._total = 0` works | ❌ Impossible — no reference to internal state |
| **State Isolation** | Must manually prevent sharing | Automatic — each closure is independent |
| **Memory Footprint** | Full object overhead | Lightweight function + captured variables |

### Tested & Verified

```bash
cd backend
python tests/test_closures.py
```

| Test | What It Validates |
|------|-------------------|
| `test_state_persistence` | 12 monthly calls correctly accumulate emissions |
| `test_encapsulation` | Mutating original factors dict has ZERO effect on closure |
| `test_carbon_cap_alert` | ALERT status triggers when cap is exceeded |
| `test_factory_independence` | Two factories maintain completely separate state |
| `test_raw_material_impact` | Material weight contributes to emission total |
| `test_energy_source_multiplier` | Coal (1.25×) vs Renewable (0.35×) produces different results |

---

## 📚 API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check — returns API status |
| `POST` | `/upload-csv` | Upload CSV → clean → audit → return JSON |
| `GET` | `/outputs/{job_id}/audit_summary_2026.csv` | Download audit summary CSV |
| `GET` | `/outputs/{job_id}/emissions_chart.png` | Download cumulative emissions chart |
| `DELETE` | `/outputs/{job_id}` | Cleanup job output files |

### Upload Response Schema

```json
{
  "job_id": "a1b2c3d4e5f6",
  "summary": {
    "total_factories": 50,
    "total_emissions_kg": 1234567890.00,
    "total_emissions_tons": 1234567.89,
    "total_alerts": 12,
    "factories_over_cap": 8
  },
  "sector_breakdown": {
    "Steel": { "factories": 20, "total_emissions_kg": 800000000 },
    "Textile": { "factories": 15, "total_emissions_kg": 200000000 },
    "Electronics": { "factories": 15, "total_emissions_kg": 234567890 }
  },
  "violators": [...],
  "factories": [...],
  "files": {
    "audit_csv": "/outputs/a1b2c3d4e5f6/audit_summary_2026.csv",
    "chart": "/outputs/a1b2c3d4e5f6/emissions_chart.png"
  }
}
```

---

## ⚙️ Configuration

### Sector Emission Factors (`config/sectors.json`)

| Sector | Carbon Cap | Production Factor | Energy Factor | Material Factor |
|--------|------------|-------------------|---------------|-----------------|
| **Steel** | 90,000 tons | 1,850 kg/ton | 820 kg/MWh | 120 kg/ton |
| **Textile** | 7,500 tons | 450 kg/ton | 520 kg/MWh | 65 kg/ton |
| **Electronics** | 13,000 tons | 760 kg/ton | 680 kg/MWh | 95 kg/ton |

### Energy Source Multipliers

| Source | Multiplier | Description |
|--------|------------|-------------|
| Coal | 1.25× | High carbon intensity |
| Natural Gas | 0.85× | Lower than coal |
| Grid | 1.00× | Baseline (mixed sources) |
| Renewable | 0.35× | Solar, wind, hydro |
| Nuclear | 0.15× | Lowest carbon intensity |

---

## 📊 Sample Data

A pre-generated dataset is included at `backend/data/monthly_production.csv`:

- **50 factories** across 3 sectors
- **12 months** of production data per factory (600 rows total)
- Realistic values with seasonal variation
- Weighted energy source distribution by sector

To regenerate with different parameters:

```bash
cd backend
python -c "from src.data_gen import generate_monthly_data; generate_monthly_data('data/monthly_production.csv')"
```

---

## 🎯 SDG 13: Climate Action

This project contributes to **United Nations Sustainable Development Goal 13** by providing tools for:

- **Measuring** industrial carbon emissions with precision
- **Monitoring** compliance with carbon caps
- **Identifying** high-emission factories for targeted reduction efforts
- **Enabling** data-driven climate action decisions

---

## 📄 License

Academic project — SIC Program

---

<div align="center">

**Built with 💚 for Climate Action**

*Demonstrating closures, encapsulation, and functional state management in a real-world sustainability context*

</div>
