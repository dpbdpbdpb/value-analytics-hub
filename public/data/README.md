# Synthetic Orthopedic Datasets

## Directory Organization

### Active Data Files
- `hip-knee-data.json` – Synthetic hip/knee dataset served by the application
- `shoulder-data.json` – Synthetic shoulder dataset served by the application
- `README.md` – This documentation

> All historical real-data baselines and profiles have been removed from version control. Only synthetic, externally shareable datasets live in this folder.

## Hip-Knee Synthetic Dataset (`hip-knee-data.json`)

- **Generation Date:** 2025-10-30  
- **Purpose:** Safe external sharing, demos, and analytics without exposing sensitive CommonSpirit information.
- **Scope:** 72,856 cases, $41,010,260 spend, 443 surgeons, 25 vendors (hip/knee implants).

### Anonymization
- Surgeons remapped to `SURG-0001` through `SURG-0443`; sequential numbering preserves uniqueness.
- Vendors relabeled `VENDOR-ALPHA` through `VENDOR-OMEGA`; ordering follows market share (ALPHA = largest).
- Collection dates masked to `2025-10-XX`; source attribution generalized.

### Perturbation Model
- All spend, volume, quantity, and pricing values perturbed by ±5% (random seed 42).
- Surgeon count and vendor count preserved exactly to maintain analytical integrity.

### Preserved Fidelity
- Surgeon volume distribution: 1–1,701 cases, mean spend per case $635.57, standard deviation $338.36.
- Vendor market structure: Top 3 vendors = 85.4% combined share; long-tail vendors retained.
- Clinical practice patterns, component detail, matrix pricing, workflow tracking, and scenarios maintain schema and relationships.

### Validation Snapshot
- Original totals: 72,252 cases | $42,213,313 spend.
- Synthetic totals: 72,856 cases (+0.8%) | $41,010,260 (-2.8%).
- Statistical distributions verified within ±5% tolerance; no negative values; relationship integrity confirmed.

### File Set
- `orthopedic-data-synthetic.json` (source of current app file) – shareable.
- `synthetic-validation-report.json` – distribution checks and QA metrics.
- `synthetic-mapping-CONFIDENTIAL.json` – internal-only identifier mapping (do not store in repo).

### Approved vs Prohibited Uses
- **Approved:** External demos, academic collaboration, vendor evaluations (blind), analytics prototyping, training.  
- **Prohibited:** Reverse mapping attempts, sharing confidential mapping file, using as real operational data, individual surgeon performance review.

### Required Attribution
> “Analysis based on synthetic dataset derived from CommonSpirit Health hip-knee implant procurement data (72,000+ cases, 443 surgeons, 25 vendors). All identifiers anonymized. Statistical distributions preserved within ±5%.”

## Shoulder Synthetic Dataset (`shoulder-data.json`)

- **Generation Date:** 2025-10-30  
- **Status:** Ready for external use; corporate compliance approved.
- **Scope:** 17,078 cases, $28,647,248 spend, 246 surgeons, 14 vendors, 72 hospitals, 5 regions (shoulder implants).

### Anonymization
- Surgeons labeled `SURG-0001` to `SURG-0246`; vendors `VENDOR-ALPHA` to `VENDOR-NU`; hospitals `FACILITY-001` to `FACILITY-072`; regions `REGION-NORTH/SOUTH/EAST/WEST/CENTRAL`.
- Dates masked to month-level; all identifiers anonymized; values perturbed ±5% with fixed seed.

### Preserved Fidelity
- Market concentration: Top 3 vendors hold 81.6% share (VENDOR-ALPHA 38.5%, VENDOR-BETA 28.1%, VENDOR-GAMMA 15.0%).
- Regional distribution: REGION-EAST 72.5% of cases; significant hospital clustering (top 5 facilities = 58% of volume).
- Surgeon patterns: 5 surgeons (>500 cases) drive 33% of all cases; spend per case $3,018 ± $1,615.
- Matrix pricing, scenarios, workflow, and component-level data mirror original schema.

### Supporting Files
- `SHOULDER-COMPLETE-PACKAGE-SUMMARY.md` – overview and quick stats.
- `SHOULDER-EXECUTIVE-SUMMARY.md` – presentation-ready messaging.
- `SHOULDER-SYNTHETIC-DATASET-README.md` – technical methodology.
- `shoulder-synthetic-validation-report.json` – QA results.
- `shoulder-synthetic-mapping-CONFIDENTIAL.json` – internal-only mapping (store securely; never commit).

### Usage Guidance
- **Ideal for:** Multi-service-line demonstrations, regional strategy modeling, vendor negotiation practice (blind), hospital partnership planning, Huron collaboration, training.
- **Do not:** Share confidential mapping file, attempt re-identification, present as live operational performance, use for individual evaluation or contract negotiations.

### Required Attribution
> “Analysis based on synthetic dataset derived from CommonSpirit Health shoulder implant procurement data (17,000+ cases, 246 surgeons, 14 vendors, 72 hospitals, 5 regions). All identifiers anonymized. Statistical distributions preserved within ±5%.”

## Governance and Support
- HIPAA, corporate, competitive, and personnel privacy requirements validated for both datasets.
- Compliance, methodology, and QA contacts remain the Medical Director of System Clinical Alignment and Purchasing; statistical validation details appear in each validation report.
- For novel use cases or external distribution, coordinate with data governance to confirm alignment.

## Change Log
- **2025-10-30:** Version 1.0 synthetic hip-knee and shoulder datasets published; real baselines removed from repository; documentation updated.
