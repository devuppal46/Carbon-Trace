"""Main Carbon-Trace auditing engine.

Orchestrates the end-to-end audit pipeline:
1. Load config (sectors, emission factors, caps)
2. Process monthly CSV through Industry closures
3. Write audit summary CSV
4. Generate cumulative emissions chart
"""

import csv
import json
from typing import Dict, List, Any, Tuple
from pathlib import Path
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt

from .models import Industry


def load_config(config_path: str) -> Dict[str, Any]:
    """Load sector emission factors, caps, and energy multipliers from JSON."""
    with open(config_path, encoding="utf-8") as f:
        return json.load(f)


def run_audit(
    input_csv: str, config_path: str
) -> Tuple[Dict[str, Industry], List[Dict[str, Any]]]:
    """
    Process all monthly data through per-factory Industry closures.

    Parameters
    ----------
    input_csv : str
        Path to monthly_production.csv.
    config_path : str
        Path to sectors.json config.

    Returns
    -------
    tuple[dict[str, Industry], list[dict]]
        - Dictionary of factory_id → Industry instances
        - Flat list of all monthly audit records
    """
    config = load_config(config_path)
    sectors_config = config["sectors"]
    energy_multipliers = config.get("energy_source_multipliers", {})

    factories: Dict[str, Industry] = {}
    all_records: List[Dict[str, Any]] = []

    with open(input_csv, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            fid = row["factory_id"]
            month = int(row["month"])

            # Lazily create Industry instance on first encounter
            if fid not in factories:
                sector = row["sector"]
                sector_cfg = sectors_config.get(sector, {})
                factories[fid] = Industry(
                    factory_id=fid,
                    sector=sector,
                    emission_factor=sector_cfg.get("emission_factor", {}),
                    carbon_cap_kg=sector_cfg.get("carbon_cap_kg", 1_000_000_000),
                    energy_source_multipliers=energy_multipliers,
                )

            factory = factories[fid]
            result = factory.record_month(
                month=month,
                monthly_production_tons=float(row["monthly_production_tons"]),
                energy_used_mwh=float(row["energy_used_mwh"]),
                energy_source_type=row.get("energy_source_type"),
                raw_material_weight_tons=float(row.get("raw_material_weight_tons", 0)),
            )
            all_records.append(result)

    return factories, all_records


def write_summary_csv(factories: Dict[str, Industry], output_path: str) -> None:
    """
    Write year-to-date audit summary per factory.

    Output columns:
        factory_id, sector, total_emissions_kg, max_monthly_emissions_kg,
        avg_monthly_emissions_kg, alerts_count, status
    """
    fieldnames = [
        "factory_id", "sector", "total_emissions_kg",
        "max_monthly_emissions_kg", "avg_monthly_emissions_kg",
        "alerts_count", "status",
    ]

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

        for factory in factories.values():
            history = factory.history
            if history:
                total = factory.total_emissions
                monthly_vals = [r["monthly_emissions_kg"] for r in history]
                max_monthly = max(monthly_vals)
                avg_monthly = sum(monthly_vals) / len(monthly_vals)
                alerts = factory.alerts_count
                status = "EXCEEDED" if factory.is_over_cap else "COMPLIANT"
            else:
                total = max_monthly = avg_monthly = alerts = 0
                status = "NO_DATA"

            writer.writerow({
                "factory_id": factory.factory_id,
                "sector": factory.sector,
                "total_emissions_kg": f"{total:.2f}",
                "max_monthly_emissions_kg": f"{max_monthly:.2f}",
                "avg_monthly_emissions_kg": f"{avg_monthly:.2f}",
                "alerts_count": alerts,
                "status": status,
            })

    print(f"✅ Summary written → {output_path}")


def plot_emissions(
    factories: Dict[str, Industry],
    output_path: str,
    config_path: str | None = None,
) -> None:
    """
    Generate a cumulative emissions line chart.

    Picks the top 4 highest-emitting factories from each sector (up to 12 total)
    so all three industries are visually represented.  Optionally draws dashed
    horizontal lines at each sector's carbon cap.
    """
    from collections import defaultdict

    sector_colors = {
        "Steel": "#E63946",       # Red
        "Textile": "#457B9D",     # Blue
        "Electronics": "#2A9D8F", # Teal
    }
    sector_markers = {
        "Steel": "s",       # square
        "Textile": "^",     # triangle
        "Electronics": "o", # circle
    }

    fig, ax = plt.subplots(figsize=(15, 9))
    fig.patch.set_facecolor("#1a1a2e")
    ax.set_facecolor("#16213e")

    # ── Group factories by sector, then pick top 4 per sector ──
    by_sector: Dict[str, List] = defaultdict(list)
    for fid, factory in factories.items():
        by_sector[factory.sector].append((fid, factory))

    selected: List = []
    for sector, items in by_sector.items():
        top = sorted(items, key=lambda x: x[1].total_emissions, reverse=True)[:4]
        selected.extend(top)

    # Sort selected by total for legend ordering
    selected.sort(key=lambda x: x[1].total_emissions, reverse=True)

    for fid, factory in selected:
        history = factory.history
        monthly = sorted(history, key=lambda r: r["month"])
        months = [r["month"] for r in monthly]
        cumulative = [r["total_emissions_kg"] / 1000 for r in monthly]

        color = sector_colors.get(factory.sector, "#FFFFFF")
        marker = sector_markers.get(factory.sector, "o")

        ax.plot(
            months, cumulative,
            marker=marker, linewidth=2.2, markersize=5,
            color=color, alpha=0.85,
            label=f"{fid} ({factory.sector})",
        )

    # ── Draw carbon cap lines if config is available ──
    if config_path:
        try:
            cfg = load_config(config_path)
            caps_drawn = set()
            for sector, sec_cfg in cfg.get("sectors", {}).items():
                cap_kg = sec_cfg.get("carbon_cap_kg", 0)
                cap_tons = cap_kg / 1000
                if sector not in caps_drawn and cap_tons > 0:
                    color = sector_colors.get(sector, "#FFFFFF")
                    ax.axhline(
                        y=cap_tons, color=color, linestyle="--",
                        linewidth=1.5, alpha=0.5,
                        label=f"{sector} Cap ({cap_tons:,.0f} t)",
                    )
                    caps_drawn.add(sector)
        except Exception:
            pass  # Config not available — skip cap lines

    ax.set_xlabel("Month (2026)", fontsize=13, color="#e0e0e0", fontweight="bold")
    ax.set_ylabel("Cumulative Emissions (metric tons CO₂)", fontsize=13, color="#e0e0e0", fontweight="bold")
    ax.set_title(
        "Carbon-Trace: Cumulative Emissions Growth by Factory",
        fontsize=16, fontweight="bold", color="#f0f0f0", pad=15,
    )
    ax.set_xticks(range(1, 13))
    ax.set_xticklabels(
        ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
         "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        fontsize=10, color="#a0a0a0",
    )
    ax.tick_params(axis="y", colors="#a0a0a0")

    ax.legend(
        bbox_to_anchor=(1.02, 1), loc="upper left",
        fontsize=9, framealpha=0.8,
        facecolor="#1a1a2e", edgecolor="#444",
        labelcolor="#e0e0e0",
    )
    ax.grid(True, alpha=0.15, color="#ffffff")
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color("#444")
    ax.spines["bottom"].set_color("#444")

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()

    print(f"✅ Chart saved → {output_path}")
