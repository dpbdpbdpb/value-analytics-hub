# Claude Prompt: Quality Metrics Data Update (Quarterly)

**Use this prompt when:** You need to update clinical outcomes and quality metrics (less frequent update)

---

## Prompt Template

```
I need to UPDATE quality metrics for the CommonSpirit Value Analytics Hub.

PRODUCT LINE: [hip-knee | shoulder | spine | sports-medicine | trauma]
UPDATE TYPE: quality-metrics-only
CURRENT DATA FILE: [path to existing JSON file]
UPDATE PERIOD: [Quarter Year - e.g., "Q1 2025"]

QUALITY DATA SOURCE: [e.g., "AJRR Registry + Internal EMR + NSQIP"]
MEASUREMENT PERIOD: [Date range for quality metrics - e.g., "Jan 2024 - Dec 2024"]

ATTACHED DATA:
[Paste quality metrics: revision rates, readmissions, LOS, complications, infections]
[Include benchmark data and sources]

INSTRUCTIONS:
1. Load the existing JSON file from CURRENT DATA FILE
2. Update ONLY the `qualityMetrics` section:
   - `revisionRate`
   - `readmissionRate30Day`
   - `readmissionRate90Day`
   - `avgLengthOfStay`
   - `complicationRate`
   - `infectionRate`
   - `benchmarkRevisionRate`
   - `benchmarkReadmission30`
   - `benchmarkReadmission90`
   - `benchmarkLOS`
   - `benchmarkComplicationRate`
   - `benchmarkInfectionRate`
   - `dataSource` (document which registries/systems used)
   - `lastUpdated` (current timestamp)
   - `byVendor` (if sample size sufficient for vendor-level breakdown)

3. PRESERVE all other sections unchanged:
   - `metadata`, `vendors`, `surgeons`, `components` (leave as-is)
   - `revenueCycle` (leave as-is)
   - `workflowTracking` (leave as-is)
   - `scenarios` (leave as-is)

4. Data quality checks:
   - Rates should be percentages (0-100 scale)
   - Ensure benchmarks are from credible sources (AJRR, NSQIP, Premier)
   - Document measurement period
   - If vendor-level quality available, include only if n > 30 cases per vendor

5. Validation:
   - Quality metrics are realistic (revision rate 1-5%, readmission 3-8%, etc.)
   - Benchmarks are documented with sources
   - Dates are current

OUTPUT:
Please provide the complete updated JSON file, maintaining all existing structure and only updating the qualityMetrics section.
```

---

## Example Usage

```
I need to UPDATE quality metrics for the CommonSpirit Value Analytics Hub.

PRODUCT LINE: hip-knee
UPDATE TYPE: quality-metrics-only
CURRENT DATA FILE: /public/orthopedic-data.json
UPDATE PERIOD: Q4 2024

QUALITY DATA SOURCE: AJRR National Registry 2024 + CommonSpirit Internal EMR
MEASUREMENT PERIOD: January 2024 - December 2024

ATTACHED DATA:

Our Performance:
- Revision rate: 2.1% (down from 2.3%)
- 30-day readmission: 3.8% (improved from 4.1%)
- 90-day readmission: 6.2%
- Average LOS: 2.0 days (down from 2.1 days)
- Complication rate: 2.9%
- SSI rate: 0.7%

National Benchmarks (AJRR 2024):
- Revision rate: 2.5%
- 30-day readmission: 5.2%
- 90-day readmission: 7.5%
- Average LOS: 2.4 days
- Complication rate: 4.0%
- SSI rate: 1.2%

Vendor-Level Quality (sample sizes sufficient):
- ZIMMER BIOMET: 2.0% revision, 3.5% readmission (n=450 cases)
- STRYKER: 2.2% revision, 4.0% readmission (n=380 cases)
- JOHNSON & JOHNSON: 2.1% revision, 3.9% readmission (n=340 cases)

[Follow INSTRUCTIONS from template above]
```

---

## Data Sources Reference

### Recommended Quality Data Sources:

**National Registries:**
- **AJRR** (American Joint Replacement Registry) - Gold standard for joint replacement outcomes
- **NSQIP** (National Surgical Quality Improvement Program) - Surgical complications
- **Premier** - Quality benchmarking network

**Internal Sources:**
- **EMR** (Epic, Cerner) - Readmissions, LOS, complications
- **Infection Control** - SSI rates
- **Case Management** - Readmission tracking

### Minimum Sample Sizes:

- **Overall quality metrics:** Minimum 100 cases for reliable rates
- **Vendor-level quality:** Minimum 30 cases per vendor
- **Surgeon-level quality:** Minimum 20 cases per surgeon (not currently tracked)

---

## Tips for Best Results

1. **Document sources clearly** - Quality metrics are only credible with proper sourcing
2. **Use consistent time periods** - Typically 12-24 month rolling windows
3. **Update benchmarks annually** - National benchmarks change as practice improves
4. **Include improvement notes** - Document why metrics improved or worsened
5. **Consider risk adjustment** - Note if your patient population differs from benchmarks

---

## Common Scenarios

### Scenario 1: Quarterly Routine Update
- Pull latest quality metrics from EMR/registry
- Update rolling 12-month rates
- Compare to same quarter last year

### Scenario 2: Annual Benchmark Update
- Update national benchmark values (AJRR releases annual reports)
- Document new benchmark source and year
- Recalculate performance gaps

### Scenario 3: Vendor Quality Analysis Added
- First time adding vendor-level quality breakdown
- Ensure adequate sample sizes (n > 30 per vendor)
- May reveal quality differences between vendors

### Scenario 4: Quality Improvement Initiative
- Document improvement in specific metric
- Add notes about interventions (e.g., "Reduced LOS via enhanced recovery protocol")
- Update more frequently during active QI project
