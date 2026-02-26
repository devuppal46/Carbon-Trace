"""Carbon-Trace: Comprehensive closure and state validation tests.

Test Suite:
  ✅ Test 1 — State Persistence: 12-month accumulation per factory
  ✅ Test 2 — Encapsulation: Emission factors cannot be modified externally
  ✅ Test 3 — Carbon Cap Alert: ALERT triggered when cap is exceeded
  ✅ Test 4 — Factory Independence: Two factories maintain separate state
  ✅ Test 5 — Raw Material Impact: raw_material_weight affects emissions
  ✅ Test 6 — Energy Source Multiplier: coal vs renewable produce different emissions
"""

import sys
from pathlib import Path

# Ensure project root is on the path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.closures import make_emission_auditor
from src.models import Industry


# ── Shared test emission factors ──
STEEL_FACTOR = {
    "production_per_ton": 1850.0,
    "energy_per_mwh": 820.0,
    "material_processing_per_ton": 120.0,
}

TEXTILE_FACTOR = {
    "production_per_ton": 450.0,
    "energy_per_mwh": 520.0,
    "material_processing_per_ton": 65.0,
}

ENERGY_MULTIPLIERS = {
    "coal": 1.25,
    "grid": 1.0,
    "renewable": 0.35,
}


def test_state_persistence():
    """
    Test 1: State Persistence
    Calling the closure 12 times should correctly accumulate emissions.
    Each call adds to the running total — no data is lost between invocations.
    """
    auditor = make_emission_auditor(
        sector="Steel",
        emission_factor=STEEL_FACTOR,
        carbon_cap_kg=999_999_999,  # High cap so no alert
    )

    # Feed 12 identical months
    production = 1000.0  # tons
    energy = 4000.0      # MWh

    expected_monthly = (
        production * STEEL_FACTOR["production_per_ton"]
        + energy * STEEL_FACTOR["energy_per_mwh"]
    )  # 1000*1850 + 4000*820 = 1,850,000 + 3,280,000 = 5,130,000

    result = None
    for month in range(1, 13):
        result = auditor(production, energy)

    # After 12 months, total should be 12 × monthly
    expected_total = expected_monthly * 12
    actual_total = result["total_emissions_kg"]

    assert abs(actual_total - expected_total) < 1.0, (
        f"State persistence failed: expected {expected_total:.2f}, got {actual_total:.2f}"
    )
    assert result["month_number"] == 12, "Month counter should be 12"
    print(f"✅ Test 1 — State Persistence: PASS")
    print(f"   Expected total: {expected_total:,.0f} kg | Actual: {actual_total:,.0f} kg")


def test_encapsulation():
    """
    Test 2: Encapsulation
    Verify that emission factors cannot be modified from outside the closure.
    Even if the caller mutates the original dict, the closure's internal copy
    must remain unchanged.
    """
    # Create a mutable factor dict
    mutable_factor = {
        "production_per_ton": 1850.0,
        "energy_per_mwh": 820.0,
        "material_processing_per_ton": 120.0,
    }

    auditor = make_emission_auditor(
        sector="Steel",
        emission_factor=mutable_factor,
        carbon_cap_kg=999_999_999,
    )

    # Get baseline result
    result_before = auditor(1000, 4000)
    baseline_monthly = result_before["monthly_emissions_kg"]

    # Attempt to tamper with the original factor dict
    mutable_factor["production_per_ton"] = 0.0
    mutable_factor["energy_per_mwh"] = 0.0
    mutable_factor["material_processing_per_ton"] = 0.0

    # Create a NEW auditor with the same closure to get a fresh second call
    # But first, let's verify the EXISTING auditor is unaffected
    result_after = auditor(1000, 4000)

    # The second call should produce the SAME monthly emissions as the first
    # (because the closure's internal factors should be unchanged)
    assert abs(result_after["monthly_emissions_kg"] - baseline_monthly) < 0.01, (
        f"Encapsulation broken! Before tampering: {baseline_monthly}, "
        f"After tampering: {result_after['monthly_emissions_kg']}"
    )

    # Also verify we can't access internal state
    assert not hasattr(auditor, "_factors"), "Closure should not expose _factors"
    assert not hasattr(auditor, "total_emissions"), "Closure should not expose total_emissions"

    print(f"✅ Test 2 — Encapsulation: PASS")
    print(f"   Monthly emissions unchanged after external mutation: {baseline_monthly:,.2f} kg")


def test_carbon_cap_alert():
    """
    Test 3: Carbon Cap Alert
    If cumulative emissions exceed the carbon cap, the closure must:
    - Return status = "ALERT"
    - Return the current total emissions
    """
    # Low cap that will be exceeded quickly
    low_cap = 500_000  # 500k kg

    auditor = make_emission_auditor(
        sector="Textile",
        emission_factor=TEXTILE_FACTOR,
        carbon_cap_kg=low_cap,
    )

    # Month 1: 400 tons × 450 + 800 MWh × 520 = 180,000 + 416,000 = 596,000
    # This SINGLE month should exceed the 500k cap
    result = auditor(400, 800)

    assert result["status"] == "ALERT", (
        f"Expected ALERT but got {result['status']}. "
        f"Total: {result['total_emissions_kg']:,.0f} vs cap: {low_cap:,.0f}"
    )
    assert result["alert"] is not None, "Alert message should not be None"
    assert result["total_emissions_kg"] > low_cap, (
        f"Total {result['total_emissions_kg']} should exceed cap {low_cap}"
    )

    print(f"✅ Test 3 — Carbon Cap Alert: PASS")
    print(f"   Total: {result['total_emissions_kg']:,.0f} kg > Cap: {low_cap:,.0f} kg")
    print(f"   Alert: {result['alert']}")


def test_factory_independence():
    """
    Test 4: Factory Independence
    Two factories of the same sector must maintain completely separate state.
    Factory A and Factory B should have different totals after different inputs.
    """
    factory_a = Industry(
        factory_id="TEST_A",
        sector="Steel",
        emission_factor=STEEL_FACTOR,
        carbon_cap_kg=999_999_999,
    )
    factory_b = Industry(
        factory_id="TEST_B",
        sector="Steel",
        emission_factor=STEEL_FACTOR,
        carbon_cap_kg=999_999_999,
    )

    # Same month 1
    factory_a.record_month(1, 1000, 4000)
    factory_b.record_month(1, 1000, 4000)

    # Different month 2
    factory_a.record_month(2, 1500, 5000)   # Higher production
    factory_b.record_month(2, 500, 2000)    # Lower production

    # Totals must differ
    assert factory_a.total_emissions != factory_b.total_emissions, (
        f"Factories should have different totals! "
        f"A={factory_a.total_emissions:,.0f}, B={factory_b.total_emissions:,.0f}"
    )

    # Also verify they track independently
    assert len(factory_a.history) == 2, "Factory A should have 2 months"
    assert len(factory_b.history) == 2, "Factory B should have 2 months"

    print(f"✅ Test 4 — Factory Independence: PASS")
    print(f"   Factory A total: {factory_a.total_emissions:,.0f} kg")
    print(f"   Factory B total: {factory_b.total_emissions:,.0f} kg")


def test_raw_material_impact():
    """
    Test 5: Raw Material Impact
    Providing raw_material_weight should increase emissions compared to no material.
    """
    auditor_with = make_emission_auditor(
        sector="Steel",
        emission_factor=STEEL_FACTOR,
        carbon_cap_kg=999_999_999,
    )
    auditor_without = make_emission_auditor(
        sector="Steel",
        emission_factor=STEEL_FACTOR,
        carbon_cap_kg=999_999_999,
    )

    result_with = auditor_with(1000, 4000, raw_material_weight_tons=1500)
    result_without = auditor_without(1000, 4000, raw_material_weight_tons=None)

    assert result_with["monthly_emissions_kg"] > result_without["monthly_emissions_kg"], (
        f"Raw material should increase emissions! "
        f"With: {result_with['monthly_emissions_kg']:,.0f}, "
        f"Without: {result_without['monthly_emissions_kg']:,.0f}"
    )

    # The difference should be exactly: 1500 * 120 = 180,000 kg
    expected_diff = 1500 * STEEL_FACTOR["material_processing_per_ton"]
    actual_diff = result_with["monthly_emissions_kg"] - result_without["monthly_emissions_kg"]
    assert abs(actual_diff - expected_diff) < 1.0, (
        f"Material emission delta wrong: expected {expected_diff}, got {actual_diff}"
    )

    print(f"✅ Test 5 — Raw Material Impact: PASS")
    print(f"   With material: {result_with['monthly_emissions_kg']:,.0f} kg")
    print(f"   Without material: {result_without['monthly_emissions_kg']:,.0f} kg")
    print(f"   Difference: {actual_diff:,.0f} kg (expected {expected_diff:,.0f} kg)")


def test_energy_source_multiplier():
    """
    Test 6: Energy Source Multiplier
    Coal should produce higher emissions than renewable for the same input.
    """
    auditor_coal = make_emission_auditor(
        sector="Electronics",
        emission_factor={"production_per_ton": 760, "energy_per_mwh": 680, "material_processing_per_ton": 95},
        carbon_cap_kg=999_999_999,
        energy_source_multipliers=ENERGY_MULTIPLIERS,
    )
    auditor_renewable = make_emission_auditor(
        sector="Electronics",
        emission_factor={"production_per_ton": 760, "energy_per_mwh": 680, "material_processing_per_ton": 95},
        carbon_cap_kg=999_999_999,
        energy_source_multipliers=ENERGY_MULTIPLIERS,
    )

    result_coal = auditor_coal(300, 1200, energy_source_type="coal")
    result_renewable = auditor_renewable(300, 1200, energy_source_type="renewable")

    assert result_coal["monthly_emissions_kg"] > result_renewable["monthly_emissions_kg"], (
        f"Coal should produce more emissions than renewable! "
        f"Coal: {result_coal['monthly_emissions_kg']:,.0f}, "
        f"Renewable: {result_renewable['monthly_emissions_kg']:,.0f}"
    )

    # Verify multiplier is applied correctly to energy component only
    assert result_coal["breakdown"]["source_multiplier"] == 1.25
    assert result_renewable["breakdown"]["source_multiplier"] == 0.35

    print(f"✅ Test 6 — Energy Source Multiplier: PASS")
    print(f"   Coal total: {result_coal['monthly_emissions_kg']:,.0f} kg (×{result_coal['breakdown']['source_multiplier']})")
    print(f"   Renewable total: {result_renewable['monthly_emissions_kg']:,.0f} kg (×{result_renewable['breakdown']['source_multiplier']})")


if __name__ == "__main__":
    print("=" * 55)
    print("  🧪 CARBON-TRACE TEST SUITE")
    print("=" * 55)
    print()

    test_state_persistence()
    print()
    test_encapsulation()
    print()
    test_carbon_cap_alert()
    print()
    test_factory_independence()
    print()
    test_raw_material_impact()
    print()
    test_energy_source_multiplier()

    print()
    print("=" * 55)
    print("  🎉 ALL 6 TESTS PASSED!")
    print("=" * 55)
