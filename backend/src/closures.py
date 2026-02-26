"""Carbon-Trace: Secure emission auditor closures.

The closure factory encapsulates:
  - emission_factor (private, immutable from outside)
  - total_emissions (private, accumulates across monthly calls)
  - carbon_cap_kg (private threshold)

Each call to `make_emission_auditor()` produces a fully independent
auditor closure with its own state — no shared globals.
"""

from typing import Optional


def make_emission_auditor(
    sector: str,
    emission_factor: dict,
    carbon_cap_kg: float,
    energy_source_multipliers: Optional[dict] = None,
) -> callable:
    """
    Factory function that returns a closure for one factory's emissions.

    Parameters
    ----------
    sector : str
        Industry sector name (e.g. "Steel", "Textile", "Electronics").
    emission_factor : dict
        Sector-specific emission factors, e.g.:
        {
            "production_per_ton": 1850.0,   # kg CO₂ per ton produced
            "energy_per_mwh": 820.0,        # kg CO₂ per MWh consumed
            "material_processing_per_ton": 120.0  # kg CO₂ per ton of raw material
        }
    carbon_cap_kg : float
        Annual carbon cap in kg CO₂. Exceeding this triggers an ALERT.
    energy_source_multipliers : dict, optional
        Multipliers by energy source type (e.g. {"coal": 1.25, "renewable": 0.35}).

    Returns
    -------
    callable
        An auditor closure that accepts monthly production data and returns
        emission results.

    Private State (encapsulated)
    ----------------------------
    - `_factors` : a frozen copy of emission_factor — cannot be modified externally
    - `_total_emissions` : cumulative annual emissions
    - `_cap` : carbon cap threshold
    - `_monthly_log` : detailed per-month emission breakdown
    """

    # ──── PRIVATE: Deep-copy and freeze emission factors ────
    # This prevents external mutation of the factors dict
    _factors = {
        "production_per_ton": float(emission_factor.get("production_per_ton", 0)),
        "energy_per_mwh": float(emission_factor.get("energy_per_mwh", 0)),
        "material_processing_per_ton": float(
            emission_factor.get("material_processing_per_ton", 0)
        ),
    }

    _energy_multipliers = dict(energy_source_multipliers or {})
    _cap = float(carbon_cap_kg)
    _sector = str(sector)

    # ──── PRIVATE STATE: persists across calls ────
    _total_emissions = 0.0
    _monthly_log: list = []

    def auditor(
        monthly_production_tons: float,
        energy_used_mwh: float,
        energy_source_type: Optional[str] = None,
        raw_material_weight_tons: Optional[float] = None,
    ) -> dict:
        """
        Process one month of production data and return emission results.

        Parameters
        ----------
        monthly_production_tons : float
            Tons of product manufactured this month.
        energy_used_mwh : float
            Energy consumed in MWh.
        energy_source_type : str, optional
            Type of energy source (coal, grid, renewable, etc.).
        raw_material_weight_tons : float, optional
            Weight of raw materials consumed (tons).

        Returns
        -------
        dict
            {
                "monthly_emissions_kg": float,
                "total_emissions_kg": float,
                "status": "OK" | "ALERT",
                "alert": str | None,
                "breakdown": dict,   # per-component breakdown
            }
        """
        nonlocal _total_emissions

        # ── Component 1: Production emissions ──
        emissions_production = monthly_production_tons * _factors["production_per_ton"]

        # ── Component 2: Energy emissions ──
        emissions_energy = energy_used_mwh * _factors["energy_per_mwh"]

        # ── Component 3: Raw material processing emissions ──
        emissions_material = 0.0
        if raw_material_weight_tons is not None and raw_material_weight_tons > 0:
            emissions_material = (
                raw_material_weight_tons * _factors["material_processing_per_ton"]
            )

        # ── Total monthly (before energy-source adjustment) ──
        monthly_emissions = emissions_production + emissions_energy + emissions_material

        # ── Energy source multiplier ──
        source_multiplier = 1.0
        if energy_source_type and energy_source_type in _energy_multipliers:
            source_multiplier = _energy_multipliers[energy_source_type]
        # Apply multiplier only to the energy component
        adjusted_energy = emissions_energy * source_multiplier
        monthly_emissions = emissions_production + adjusted_energy + emissions_material

        # ── Accumulate ──
        _total_emissions += monthly_emissions

        # ── Carbon cap check ──
        status = "OK"
        alert = None
        if _total_emissions > _cap:
            status = "ALERT"
            alert = (
                f"🚨 Carbon cap exceeded! "
                f"Total: {_total_emissions:,.0f} kg CO₂ "
                f"(cap: {_cap:,.0f} kg)"
            )

        # ── Detailed breakdown ──
        breakdown = {
            "production_kg": round(emissions_production, 2),
            "energy_kg": round(adjusted_energy, 2),
            "material_kg": round(emissions_material, 2),
            "source_multiplier": source_multiplier,
        }

        month_number = len(_monthly_log) + 1
        _monthly_log.append(round(monthly_emissions, 2))

        return {
            "month_number": month_number,
            "monthly_emissions_kg": round(monthly_emissions, 2),
            "total_emissions_kg": round(_total_emissions, 2),
            "status": status,
            "alert": alert,
            "breakdown": breakdown,
        }

    return auditor
