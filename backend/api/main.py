"""Carbon-Trace: FastAPI Backend API.

Provides a single POST endpoint that accepts a CSV file upload,
cleans it, runs the full Carbon-Trace audit pipeline, and returns
structured JSON results.

Run:
    uvicorn api.main:app --reload

Test:
    curl -F "file=@data/monthly_production.csv" http://localhost:8000/upload-csv

Docs:
    http://localhost:8000/docs
"""

import os
import sys
import uuid
import shutil
import traceback
from pathlib import Path
from typing import Any, Dict

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

# ── Ensure project root is importable ──
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from web_pipeline import clean_csv
from src.runner import run_audit, write_summary_csv, plot_emissions


# ── Config ──
CONFIG_PATH = str(PROJECT_ROOT / "config" / "sectors.json")
UPLOAD_DIR = PROJECT_ROOT / "data" / "uploads"
OUTPUT_DIR = PROJECT_ROOT / "data" / "outputs"

# ── App ──
app = FastAPI(
    title="Carbon-Trace API",
    description="Industrial Emission Auditor — SDG 13: Climate Action",
    version="1.0.0",
)

# ── CORS (allow any frontend to connect) ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Serve generated output files ──
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/outputs", StaticFiles(directory=str(OUTPUT_DIR)), name="outputs")


@app.get("/", tags=["Health"])
async def health():
    """Health check / root endpoint."""
    return {
        "service": "Carbon-Trace API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.post("/upload-csv", tags=["Audit"])
async def upload_csv(file: UploadFile = File(...)):
    """
    Upload a production CSV → clean → audit → return JSON results.

    **Accepts:** multipart/form-data with a single CSV file.

    **Pipeline:**
    1. Save uploaded file to temp location
    2. `web_pipeline.clean_csv()` → cleaned CSV
    3. `src.runner.run_audit()` → per-factory emission closures
    4. `src.runner.write_summary_csv()` → audit_summary_2026.csv
    5. `src.runner.plot_emissions()` → emissions_chart.png
    6. Return structured JSON

    **Returns:** Summary stats, per-factory details, violator list,
    cleaning report, and downloadable file paths.
    """
    # ── Validate file type ──
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload a .csv file.",
        )

    # ── Create unique job directory for this upload ──
    job_id = uuid.uuid4().hex[:12]
    job_dir = OUTPUT_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)

    raw_path = job_dir / "raw_upload.csv"
    cleaned_path = job_dir / "cleaned.csv"
    summary_path = job_dir / "audit_summary_2026.csv"
    chart_path = job_dir / "emissions_chart.png"

    try:
        # ── Step 1: Save upload ──
        content = await file.read()
        with open(raw_path, "wb") as f:
            f.write(content)

        # ── Step 2: Clean the CSV ──
        _, cleaning_report = clean_csv(str(raw_path), str(cleaned_path))

        # ── Step 3: Run Carbon-Trace audit ──
        factories, records = run_audit(
            input_csv=str(cleaned_path),
            config_path=CONFIG_PATH,
        )

        if not factories:
            raise HTTPException(
                status_code=422,
                detail="No valid factory data found after cleaning. "
                       "Check that your CSV contains the required columns.",
            )

        # ── Step 4: Generate outputs ──
        write_summary_csv(factories, str(summary_path))
        plot_emissions(factories, str(chart_path), config_path=CONFIG_PATH)

        # ── Step 5: Build response ──
        total_emissions = sum(f.total_emissions for f in factories.values())
        total_alerts = sum(f.alerts_count for f in factories.values())

        # Per-factory summary
        factory_details = []
        for factory in factories.values():
            history = factory.history
            monthly_vals = [r["monthly_emissions_kg"] for r in history]
            factory_details.append({
                "factory_id": factory.factory_id,
                "sector": factory.sector,
                "total_emissions_kg": round(factory.total_emissions, 2),
                "max_monthly_kg": round(max(monthly_vals), 2) if monthly_vals else 0,
                "avg_monthly_kg": round(sum(monthly_vals) / len(monthly_vals), 2) if monthly_vals else 0,
                "alerts": factory.alerts_count,
                "status": "EXCEEDED" if factory.is_over_cap else "COMPLIANT",
            })

        # Top violators
        violators = [
            {
                "id": f.factory_id,
                "sector": f.sector,
                "total": round(f.total_emissions, 2),
                "alerts": f.alerts_count,
            }
            for f in factories.values()
            if f.is_over_cap
        ]
        violators.sort(key=lambda v: v["total"], reverse=True)

        # Sector breakdown
        from collections import defaultdict
        sector_totals: Dict[str, float] = defaultdict(float)
        sector_counts: Dict[str, int] = defaultdict(int)
        for f in factories.values():
            sector_totals[f.sector] += f.total_emissions
            sector_counts[f.sector] += 1

        sector_breakdown = {
            sector: {
                "factories": sector_counts[sector],
                "total_emissions_kg": round(sector_totals[sector], 2),
                "avg_per_factory_kg": round(sector_totals[sector] / sector_counts[sector], 2),
            }
            for sector in sorted(sector_totals)
        }

        return {
            "job_id": job_id,
            "summary": {
                "total_factories": len(factories),
                "total_emissions_kg": round(total_emissions, 2),
                "total_emissions_tons": round(total_emissions / 1000, 2),
                "total_alerts": total_alerts,
                "factories_over_cap": len(violators),
            },
            "sector_breakdown": sector_breakdown,
            "violators": violators[:10],
            "factories": factory_details,
            "cleaning_report": cleaning_report,
            "files": {
                "audit_csv": f"/outputs/{job_id}/audit_summary_2026.csv",
                "chart": f"/outputs/{job_id}/emissions_chart.png",
            },
        }

    except ValueError as e:
        # Cleaning/validation errors
        _cleanup_job(job_dir)
        raise HTTPException(status_code=422, detail=str(e))

    except HTTPException:
        raise

    except Exception as e:
        _cleanup_job(job_dir)
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Audit pipeline failed: {str(e)}",
        )


@app.get("/outputs/{job_id}/audit_summary_2026.csv", tags=["Downloads"])
async def download_summary(job_id: str):
    """Download the audit summary CSV for a given job."""
    path = OUTPUT_DIR / job_id / "audit_summary_2026.csv"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Summary file not found.")
    return FileResponse(
        path=str(path),
        media_type="text/csv",
        filename="audit_summary_2026.csv",
    )


@app.get("/outputs/{job_id}/emissions_chart.png", tags=["Downloads"])
async def download_chart(job_id: str):
    """Download the emissions chart PNG for a given job."""
    path = OUTPUT_DIR / job_id / "emissions_chart.png"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Chart file not found.")
    return FileResponse(
        path=str(path),
        media_type="image/png",
        filename="emissions_chart.png",
    )


@app.delete("/outputs/{job_id}", tags=["Cleanup"])
async def cleanup_job(job_id: str):
    """Delete all output files for a completed job."""
    job_dir = OUTPUT_DIR / job_id
    if not job_dir.exists():
        raise HTTPException(status_code=404, detail="Job not found.")
    shutil.rmtree(job_dir)
    return {"message": f"Job {job_id} cleaned up.", "job_id": job_id}


def _cleanup_job(job_dir: Path) -> None:
    """Remove a job directory on error (best effort)."""
    try:
        if job_dir.exists():
            shutil.rmtree(job_dir)
    except Exception:
        pass
