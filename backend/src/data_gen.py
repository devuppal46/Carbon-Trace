"""Generate synthetic monthly production data for 50 factories.

Creates realistic sector-specific data considering:
- Steel: high tonnage, high energy (blast furnace, EAF)
- Textile: moderate production, chemical processing
- Electronics: lower tonnage, high energy (clean rooms, fab lines)
"""

import csv
import random
from typing import List, Dict


def generate_monthly_data(output_path: str, seed: int = 42) -> None:
    """
    Generate a realistic CSV for 50 factories across 3 sectors.

    Parameters
    ----------
    output_path : str
        File path for the output CSV.
    seed : int
        Random seed for reproducibility.

    Output CSV columns:
        factory_id, sector, month, monthly_production_tons,
        energy_used_mwh, energy_source_type, raw_material_weight_tons
    """

    random.seed(seed)

    # ── Define factory distribution ──
    factory_specs: List[Dict] = []

    # Steel: 20 factories — high production, very high energy
    # Realistic: a medium steel plant produces 800–2000 tons/month
    #            and uses 3000–7000 MWh/month
    for i in range(1, 21):
        factory_specs.append({
            "factory_id": f"FAC_STEEL_{i:02d}",
            "sector": "Steel",
            "base_prod": random.uniform(800, 2000),
            "base_energy": random.uniform(3500, 7000),
            "energy_weights": {"coal": 0.45, "natural_gas": 0.20, "grid": 0.25, "renewable": 0.10},
            "raw_material_ratio": (1.2, 1.5),   # ore/scrap → steel ratio
        })

    # Textile: 15 factories — moderate production, chemical processing
    # Realistic: 200–600 tons/month, 500–1200 MWh/month
    for i in range(1, 16):
        factory_specs.append({
            "factory_id": f"FAC_TEX_{i:02d}",
            "sector": "Textile",
            "base_prod": random.uniform(200, 600),
            "base_energy": random.uniform(500, 1200),
            "energy_weights": {"coal": 0.30, "natural_gas": 0.15, "grid": 0.40, "renewable": 0.15},
            "raw_material_ratio": (1.05, 1.25),  # fiber → fabric ratio
        })

    # Electronics: 15 factories — lower tonnage, high energy
    # Realistic: 100–450 tons/month, 800–1800 MWh/month
    for i in range(1, 16):
        factory_specs.append({
            "factory_id": f"FAC_ELEC_{i:02d}",
            "sector": "Electronics",
            "base_prod": random.uniform(100, 450),
            "base_energy": random.uniform(800, 1800),
            "energy_weights": {"coal": 0.20, "natural_gas": 0.15, "grid": 0.45, "renewable": 0.20},
            "raw_material_ratio": (1.1, 1.4),    # silicon/metals → product
        })

    all_rows: List[Dict] = []

    for spec in factory_specs:
        base_prod = spec["base_prod"]
        base_energy = spec["base_energy"]
        energy_types = list(spec["energy_weights"].keys())
        energy_probs = list(spec["energy_weights"].values())

        for month in range(1, 13):
            # Seasonal variation: ±15% with slight winter bump (months 11–2)
            seasonal_factor = 1.0
            if month in (11, 12, 1, 2):
                seasonal_factor = random.uniform(1.0, 1.10)  # winter production push
            elif month in (6, 7):
                seasonal_factor = random.uniform(0.90, 1.0)  # summer maintenance

            prod = base_prod * random.uniform(0.85, 1.15) * seasonal_factor
            energy = base_energy * random.uniform(0.85, 1.15) * seasonal_factor

            # Select energy source based on sector-specific probability
            energy_source = random.choices(energy_types, weights=energy_probs, k=1)[0]

            # Raw material weight (always > product weight)
            rm_lo, rm_hi = spec["raw_material_ratio"]
            raw_material = prod * random.uniform(rm_lo, rm_hi)

            row = {
                "factory_id": spec["factory_id"],
                "sector": spec["sector"],
                "month": month,
                "monthly_production_tons": round(prod, 1),
                "energy_used_mwh": round(energy, 1),
                "energy_source_type": energy_source,
                "raw_material_weight_tons": round(raw_material, 1),
            }
            all_rows.append(row)

    # ── Write CSV ──
    fieldnames = [
        "factory_id", "sector", "month",
        "monthly_production_tons", "energy_used_mwh",
        "energy_source_type", "raw_material_weight_tons",
    ]

    with open(output_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_rows)

    print(f"✅ Generated {len(all_rows)} rows for {len(factory_specs)} factories → {output_path}")


if __name__ == "__main__":
    generate_monthly_data("../data/monthly_production.csv")
