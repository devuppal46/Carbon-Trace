"""Industry and Factory models wrapping auditor closures.

This module provides the `Industry` class (as required by the problem statement)
that encapsulates a factory's identity and its private auditor closure.
"""

from typing import List, Dict, Any, Optional
from .closures import make_emission_auditor


class Industry:
    """
    Represents a single industrial factory with a private emission auditor.

    As specified in the problem statement, this class stores:
    - factory_id   : unique identifier for the factory
    - sector       : industry sector (Steel, Textile, Electronics)
    - _auditor     : private closure for emission calculations (not accessible externally)

    The auditor closure is created once during __init__ and maintains
    independent, isolated emission state for this factory.
    """

    def __init__(
        self,
        factory_id: str,
        sector: str,
        emission_factor: dict,
        carbon_cap_kg: float,
        energy_source_multipliers: Optional[dict] = None,
    ):
        """
        Initialize an Industry instance.

        Parameters
        ----------
        factory_id : str
            Unique factory identifier (e.g. "FAC_STEEL_01").
        sector : str
            Industry sector name.
        emission_factor : dict
            Sector-specific emission factors passed to the closure.
        carbon_cap_kg : float
            Annual carbon cap in kg CO₂.
        energy_source_multipliers : dict, optional
            Energy source type multipliers.
        """
        self._factory_id = factory_id
        self._sector = sector

        # PRIVATE: Each factory gets its own closure — fully isolated state
        self._auditor = make_emission_auditor(
            sector=sector,
            emission_factor=emission_factor,
            carbon_cap_kg=carbon_cap_kg,
            energy_source_multipliers=energy_source_multipliers,
        )

        # History of monthly audit results (for reporting)
        self._history: List[Dict[str, Any]] = []

    # ── Read-only properties ──

    @property
    def factory_id(self) -> str:
        """Read-only factory identifier."""
        return self._factory_id

    @property
    def sector(self) -> str:
        """Read-only sector name."""
        return self._sector

    @property
    def history(self) -> List[Dict[str, Any]]:
        """Read-only copy of emission history."""
        return list(self._history)

    @property
    def total_emissions(self) -> float:
        """Current cumulative emissions in kg CO₂."""
        return self._history[-1]["total_emissions_kg"] if self._history else 0.0

    @property
    def alerts_count(self) -> int:
        """Number of months where the carbon cap was exceeded."""
        return sum(1 for r in self._history if r["status"] == "ALERT")

    @property
    def is_over_cap(self) -> bool:
        """Whether the factory has ever exceeded its carbon cap."""
        return self.alerts_count > 0

    # ── Core method ──

    def record_month(
        self,
        month: int,
        monthly_production_tons: float,
        energy_used_mwh: float,
        energy_source_type: Optional[str] = None,
        raw_material_weight_tons: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Record one month's production data through the auditor closure.

        Parameters
        ----------
        month : int
            Month number (1–12).
        monthly_production_tons : float
            Tons of product manufactured.
        energy_used_mwh : float
            Energy consumed (MWh).
        energy_source_type : str, optional
            Energy source type.
        raw_material_weight_tons : float, optional
            Raw material consumed (tons).

        Returns
        -------
        dict
            Audit result including monthly emissions, cumulative total,
            status (OK/ALERT), and breakdown.
        """
        result = self._auditor(
            monthly_production_tons,
            energy_used_mwh,
            energy_source_type,
            raw_material_weight_tons,
        )

        # Enrich with factory metadata
        result.update({
            "factory_id": self._factory_id,
            "sector": self._sector,
            "month": month,
        })

        self._history.append(result)
        return result

    def __repr__(self) -> str:
        return (
            f"Industry(factory_id='{self._factory_id}', sector='{self._sector}', "
            f"total_emissions={self.total_emissions:,.0f} kg CO₂, "
            f"alerts={self.alerts_count})"
        )
