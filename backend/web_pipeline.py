"""Carbon-Trace: CSV data cleaning and validation pipeline.

Receives a raw uploaded CSV, validates schema, cleans bad rows,
normalizes values, and writes a clean CSV ready for the audit engine.
"""

import pandas as pd
from pathlib import Path
from typing import Tuple

# ── Required columns and their expected types ──
REQUIRED_COLUMNS = [
    "factory_id",
    "sector",
    "month",
    "monthly_production_tons",
    "energy_used_mwh",
    "energy_source_type",
    "raw_material_weight_tons",
]

VALID_SECTORS = {"Steel", "Textile", "Electronics"}
VALID_ENERGY_SOURCES = {"coal", "natural_gas", "grid", "renewable", "nuclear"}


def clean_csv(input_path: str, output_path: str) -> Tuple[str, dict]:
    """
    Clean and validate an uploaded production CSV.

    Steps:
        1. Read CSV and validate required columns exist
        2. Strip whitespace from string columns
        3. Normalize sector names (title-case)
        4. Normalize energy_source_type (lowercase)
        5. Coerce numeric columns; drop rows with NaN in critical fields
        6. Clamp month to 1–12
        7. Drop negative production/energy values
        8. Drop duplicate (factory_id, month) pairs — keep last
        9. Sort by factory_id, month
       10. Write cleaned CSV

    Parameters
    ----------
    input_path : str
        Path to the raw uploaded CSV.
    output_path : str
        Path where the cleaned CSV will be written.

    Returns
    -------
    tuple[str, dict]
        (output_path, cleaning_report)
        The report dict contains row counts and actions taken.

    Raises
    ------
    ValueError
        If required columns are missing or the file is empty.
    """
    # ── Step 1: Read and validate schema ──
    df = pd.read_csv(input_path, encoding="utf-8")
    original_rows = len(df)

    if original_rows == 0:
        raise ValueError("Uploaded CSV is empty — no rows found.")

    # Normalize column names: lowercase, strip whitespace
    df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")

    missing_cols = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing_cols:
        raise ValueError(
            f"Missing required columns: {missing_cols}. "
            f"Expected: {REQUIRED_COLUMNS}"
        )

    report = {
        "original_rows": original_rows,
        "actions": [],
    }

    # ── Step 2: Strip whitespace from string columns ──
    for col in ["factory_id", "sector", "energy_source_type"]:
        df[col] = df[col].astype(str).str.strip()

    # ── Step 3: Normalize sector names ──
    df["sector"] = df["sector"].str.title()
    invalid_sectors = df[~df["sector"].isin(VALID_SECTORS)]
    if len(invalid_sectors) > 0:
        bad_count = len(invalid_sectors)
        df = df[df["sector"].isin(VALID_SECTORS)]
        report["actions"].append(f"Dropped {bad_count} rows with invalid sectors")

    # ── Step 4: Normalize energy_source_type ──
    df["energy_source_type"] = df["energy_source_type"].str.lower().str.strip()
    # Map common variants
    energy_map = {
        "coal": "coal",
        "gas": "natural_gas",
        "natural gas": "natural_gas",
        "nat_gas": "natural_gas",
        "grid": "grid",
        "electrical grid": "grid",
        "electricity": "grid",
        "renewable": "renewable",
        "solar": "renewable",
        "wind": "renewable",
        "hydro": "renewable",
        "nuclear": "nuclear",
        "nan": "grid",       # default unknown → grid
        "none": "grid",
        "": "grid",
    }
    df["energy_source_type"] = df["energy_source_type"].map(energy_map).fillna("grid")

    # ── Step 5: Coerce numeric columns ──
    numeric_cols = [
        "month",
        "monthly_production_tons",
        "energy_used_mwh",
        "raw_material_weight_tons",
    ]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    before = len(df)
    df = df.dropna(subset=["monthly_production_tons", "energy_used_mwh", "month"])
    dropped = before - len(df)
    if dropped > 0:
        report["actions"].append(f"Dropped {dropped} rows with non-numeric critical values")

    # Fill missing raw_material_weight with 0
    df["raw_material_weight_tons"] = df["raw_material_weight_tons"].fillna(0.0)

    # ── Step 6: Clamp month to 1–12 ──
    df["month"] = df["month"].astype(int).clip(1, 12)

    # ── Step 7: Drop negative values ──
    before = len(df)
    df = df[(df["monthly_production_tons"] >= 0) & (df["energy_used_mwh"] >= 0)]
    dropped = before - len(df)
    if dropped > 0:
        report["actions"].append(f"Dropped {dropped} rows with negative production/energy")

    # ── Step 8: Drop duplicate (factory_id, month) — keep last ──
    before = len(df)
    df = df.drop_duplicates(subset=["factory_id", "month"], keep="last")
    dropped = before - len(df)
    if dropped > 0:
        report["actions"].append(f"Removed {dropped} duplicate (factory_id, month) rows")

    # ── Step 9: Sort ──
    df = df.sort_values(["factory_id", "month"]).reset_index(drop=True)

    # ── Step 10: Write cleaned CSV ──
    df[REQUIRED_COLUMNS].to_csv(output_path, index=False)

    report["cleaned_rows"] = len(df)
    report["rows_removed"] = original_rows - len(df)
    report["factories_found"] = df["factory_id"].nunique()
    report["sectors_found"] = sorted(df["sector"].unique().tolist())

    if not report["actions"]:
        report["actions"].append("No issues found — CSV was already clean")

    return output_path, report
