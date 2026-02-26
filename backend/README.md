# Carbon-Trace — Industrial Emission Auditor 🏭

**SDG 13: Climate Action** | A FastAPI-powered industrial carbon auditing backend that uses closures and class-based architecture to process large-scale factory emission records.

## 🎯 Overview

Carbon-Trace provides a high-performance API for auditing carbon emissions across industrial sectors. It uses:
- **Python Closures** for secure, encapsulated monthly state management.
- **FastAPI** for a production-ready, multipart/form-data upload pipeline.
- **Pandas** in `web_pipeline.py` for automated data cleaning and normalization.
- **Matplotlib** for generating cumulative emission growth visualizations.

## 📁 Repository Structure

```text
carbon-trace/backend/
├── api/
│   └── main.py         # FastAPI application & endpoints
├── config/
│   └── sectors.json    # Emission factors, caps, & energy multipliers
├── src/
│   ├── closures.py     # Core closure factory (Private State)
│   ├── models.py       # Industry class wrapping auditor closures
│   └── runner.py       # Audit orchestration engine
├── web_pipeline.py     # Data cleaning & validation logic
├── API_DOCS.md         # Detailed Frontend Integration Guide
└── data/
    ├── outputs/        # Job-specific isolated results
    └── uploads/        # Temporary upload storage
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install fastapi uvicorn pandas matplotlib python-multipart
```

### 2. Run the API
```bash
uvicorn api.main:app --reload --port 8000
```

### 3. Test the Audit Pipeline
```bash
# Upload a CSV for auditing
curl -F "file=@data/monthly_production.csv" http://localhost:8000/upload-csv
```

## 🧠 Core Architecture

### API Flow
1. **POST `/upload-csv`**: Receives raw production data.
2. **Clean**: `web_pipeline.py` validates columns and normalizes data variants.
3. **Audit**: `runner.py` instantiates `Industry` closures for each factory to maintain isolated annual state.
4. **Respond**: Returns structured JSON with summaries, violators, and download links for the summary CSV and chart.

### Scalability
The use of closures avoids global state, allowing for thread-safe processing of thousands of factories simultaneously while maintaining strict encapsulation of sensitive emission factors.

## 📄 Documentation

For detailed frontend integration (React examples, JSON schemas), see the [API Documentation](API_DOCS.md).