# 🌍 Problem Statement 8: Carbon-Trace – Industrial Emission Auditor

## Theme

**SDG 13 – Climate Action**

---

## 📘 Curriculum Focus

* **Unit 17 — Functions**
* **Unit 20 — Closures**
* **Unit 21 — Classes**

---

## 🚀 The Mission

To effectively combat climate change (**SDG 13 – Climate Action**), industries must move beyond vague sustainability promises and adopt **precise, verifiable carbon auditing systems**.

Calculating carbon emissions is complex because different industrial sectors — such as **Steel**, **Textile**, and **Electronics** — operate under different production methods and emission factors.

Your task is to build **Carbon-Trace**, a specialized industrial emission auditing tool that:

* Creates **custom Carbon Calculator closures** for different industrial sectors
* Maintains a **secure internal state** of each factory’s total annual emissions
* Prevents cross-contamination of emission records between factories

This project demonstrates how **Closures** in Python can securely preserve state while enabling scalable industrial auditing.

---

## 🧠 Why Closures?

Closures allow a function to:

* Retain access to variables from its enclosing scope
* Maintain private state across multiple calls
* Protect sensitive logic (like emission factors)

In this system:

Each generated closure will:

* Maintain its own private `total_emissions` variable
* Accept monthly production inputs
* Keep a running total across 12 months
* Remain independent from other factory closures

This ensures that:

* A steel plant’s high-heat emissions are calculated differently from
* A textile plant’s chemical-processing emissions

By combining **Closures + Classes**, each `Industry` object will be governed by its own specialized carbon calculation logic.

---

## 🏗 System Design Overview

### 🔹 Closure Factory

A factory function will:

* Accept a sector type
* Internally define an emission factor
* Return a closure that:

  * Accepts monthly production data
  * Updates internal emission totals
  * Triggers a carbon cap alert if exceeded

The emission factor must:

* Remain hidden inside the closure
* Be inaccessible and unmodifiable from the main program

---

### 🔹 Industry Class

Each factory will be represented by an `Industry` object containing:

* `factory_id`
* `sector`
* Assigned carbon calculator closure

The class will:

* Delegate emission computation to its closure
* Provide access to year-to-date emission totals

---

## 📊 Dataset Requirements

The provided dataset is indicative. Since emission data is often national-level, you must localize it for specific factories.

### 1️⃣ Dataset Augmentation

You may extend datasets with additional attributes such as:

* `energy_source_type`
* `raw_material_weight`

Dataset reference:
[https://github.com/owid/co2-data](https://github.com/owid/co2-data)

---

### 2️⃣ Synthetic Dataset Creation

Generate a synthetic CSV containing:

* **50 different factories**
* **3 industrial sectors**
* **12 months of production data**

Each row should include:

| factory_id   | sector  | monthly_production_tons | energy_used_mwh |
| ------------ | ------- | ----------------------- | --------------- |
| FAC_STEEL_01 | Steel   | 1200                    | 5000            |
| FAC_TEX_05   | Textile | 400                     | 800             |

The dataset will be processed by your closure-based auditors.

---

## ✅ Test Cases & Validation

### 1️⃣ State Persistence

Verify that:

* A closure for “Factory A” correctly accumulates emissions over 12 monthly calls
* The closure remains independent from “Factory B”

---

### 2️⃣ Logic Encapsulation

Ensure that:

* The emission factor (e.g., `2.5 kg CO₂ per ton`)
* Is hidden inside the closure
* Cannot be modified externally

---

### 3️⃣ Threshold Alert

If accumulated emissions exceed a predefined **Carbon Cap**, the closure must:

* Return an `"ALERT"` message
* Provide the current total emissions

---

## 📦 Submission Guidelines

### 1️⃣ Source Code

Submit a Python file demonstrating:

* A closure factory function
* Its integration with multiple `Industry` class objects
* Simulation of 12 months of data processing

---

### 2️⃣ Output File

Generate:

```
audit_summary_2026.csv
```

This file must include:

* `factory_id`
* `sector`
* `year_to_date_emissions`
* `carbon_cap_status`

---

### 3️⃣ Presentation

Prepare a slide deck explaining:

* Why closures were chosen
* How closures improve:

  * Data security
  * State management
  * Encapsulation

---

### 4️⃣ Visualization

Produce:

* A cumulative **line chart**
* Showing emission growth over 12 months
* Comparing multiple factories

---

## 🎯 Expected Learning Outcomes

By completing this challenge, students will:

* Understand how closures preserve state
* Implement function factories
* Combine object-oriented programming with functional concepts
* Build a secure, scalable carbon auditing proof-of-concept
* Apply programming to real-world climate action scenarios

---

## 🌱 Impact

Carbon-Trace demonstrates how programming concepts like **closures and encapsulation** can directly support **climate accountability systems**, contributing toward global sustainability goals.

---
