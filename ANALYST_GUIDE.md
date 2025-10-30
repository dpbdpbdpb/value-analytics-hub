# Value Analytics Hub - Analyst Guide

**Version:** 2.0
**Last Updated:** October 2025
**Purpose:** Complete reference for data analysts working with the Value Analytics Hub

---

## Table of Contents

1. [Overview](#overview)
2. [Data Schema Reference](#data-schema-reference)
3. [Calculations & Formulas](#calculations--formulas)
4. [Key Assumptions](#key-assumptions)
5. [Data Requirements](#data-requirements)
6. [Metrics Definitions](#metrics-definitions)
7. [Quality Assurance](#quality-assurance)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The Value Analytics Hub is a decision support dashboard for orthopedic vendor consolidation. It helps healthcare systems analyze vendor spending, model consolidation scenarios, and track implementation progress.

### Data Model Philosophy

- **Product Line Based:** Each orthopedic specialty (hip-knee, shoulder, spine, etc.) has its own data file
- **Time Series Support:** Baseline data at decision point, lookback data at implementation milestones
- **Synthetic Data:** Current deployment uses 100% synthetic data for demonstration
- **Real-Time Calculations:** Most metrics calculated client-side from raw data

### Key Entities

```
System
  ├── Product Lines (Hip-Knee, Shoulder, etc.)
  │     ├── Metadata (totals, dates, sources)
  │     ├── Vendors (spend, volume, surgeon count)
  │     ├── Surgeons (cases, spend, vendor preferences)
  │     ├── Components (pricing by vendor & category)
  │     ├── Scenarios (consolidation strategies)
  │     └── Workflow (project status, milestones)
  └── Strategic Framework (assumptions, objectives)
```

---

## Data Schema Reference

### File Location

```
/public/data/
  ├── hip-knee-data.json      # Hip & Knee product line
  ├── shoulder-data.json       # Shoulder product line
  └── [future product lines]
```

### Complete JSON Schema

```json
{
  "metadata": {
    "productLine": "hip-knee",           // Product line identifier
    "dataType": "baseline",              // "baseline" or "lookback"
    "dataCollectionDate": "2025-10-XX",  // YYYY-MM-DD format
    "lastUpdated": "2025-10-XX",         // YYYY-MM-DD format
    "dataSource": "string",              // Description of data sources
    "version": "1.0",                    // Schema version
    "totalCases": 72856,                 // Total annual case volume
    "totalSpend": 41010260,              // Total annual spend in dollars
    "totalSurgeons": 443,                // Active surgeon count
    "note": "string",                    // Data disclaimers
    "regions": 5,                        // Number of geographic regions
    "facilities": 20                     // Number of facilities
  },

  "vendors": {
    "VENDOR-ALPHA": {                    // Vendor name (key)
      "totalSpend": 14908670.57,         // Annual spend in dollars
      "totalQuantity": 30224,            // Total units purchased
      "uniqueSurgeons": 217              // Surgeons using this vendor
    }
    // ... additional vendors
  },

  "surgeons": [
    {
      "name": "SURG-0001",               // Surgeon identifier
      "id": "SURG-0001",                 // Unique ID (same as name)
      "totalCases": 1431,                // Annual case volume
      "totalSpend": 1231506,             // Annual spend in dollars
      "region": "Region A",              // Geographic region
      "facility": "Facility A1",         // Primary facility
      "vendors": {                       // Vendor usage breakdown
        "VENDOR-GAMMA": {
          "cases": 1464,                 // Cases with this vendor
          "spend": 1188650               // Spend with this vendor
        }
        // ... additional vendors
      }
    }
    // ... additional surgeons
  ],

  "components": [
    {
      "name": "FEMORAL HIP STEMS",       // Component category name
      "vendor": "VENDOR-GAMMA",          // Vendor for this component
      "bodyPart": "Hip",                 // "Hip", "Knee", or "General"
      "quantity": 5375,                  // System-wide annual quantity
      "totalSpend": 5890000,             // System-wide annual spend
      "avgPrice": 1096                   // Average price per unit
    }
    // ... additional components
  ],

  "scenarios": {
    "status-quo": {
      "name": "Status Quo",              // Display name
      "shortName": "Status Quo",         // Abbreviated name
      "description": "string",           // Scenario description
      "vendors": ["VENDOR-A", "VENDOR-B"], // Vendors in this scenario
      "preferredVendors": [...],         // Alias for "vendors"
      "annualSavings": 0,                // Projected annual savings ($)
      "savingsPercent": 0,               // Savings as % of baseline
      "adoptionRate": 1.0,               // Expected surgeon adoption (0-1)
      "riskLevel": "Low",                // "Low", "Medium", or "High"
      "riskScore": 1.0,                  // Calculated risk score (0-10)
      "quintupleMissionScore": 50,       // Overall quintuple aim score
      "quintupleScores": {               // Individual pillar scores
        "patientExperience": "50",
        "populationHealth": "50",
        "costReduction": "0",
        "providerExperience": "100",
        "healthEquity": "50"
      },
      "implementation": {
        "timeline": 0,                   // Months to implement
        "complexity": "Low",             // Implementation complexity
        "costMillions": 0                // Implementation cost ($M)
      },
      "npv5Year": 0,                     // 5-year net present value ($M)
      "roboticPlatformAlignment": {      // Optional robotic surgery data
        "alignmentScore": 85,
        "compatibleCases": 450,
        "totalRoboticCases": 500
      }
    }
    // ... additional scenarios (tri-vendor, dual-premium, dual-value, single-vendor)
  },

  "matrixPricing": [                     // Optional: Component price matrix
    {
      "component": "Acetabular Cup",
      "currentVendor": "VENDOR-A",
      "currentPrice": 1500,
      "alternateVendors": [
        {"vendor": "VENDOR-B", "price": 1400},
        {"vendor": "VENDOR-C", "price": 1550}
      ]
    }
  ],

  "workflowTracking": {                  // Optional: Project status
    "currentStage": "decision",          // Workflow stage
    "lastUpdated": "2025-10-XX",
    "stages": {
      "decision": {
        "status": "active",              // "active", "completed", "upcoming"
        "selectedScenario": "dual-premium"
      }
    }
  }
}
```

---

## Calculations & Formulas

### 1. Surgeon-Level Metrics

#### Primary Vendor
```javascript
// Vendor with highest case volume for a surgeon
primaryVendor = max(vendors, by: cases)
```

#### Primary Vendor Percentage
```javascript
primaryVendorPercent = primaryVendorCases / totalCases
```

#### Average Spend Per Case
```javascript
avgSpendPerCase = totalSpend / totalCases
```

#### Vendor Breakdown
```javascript
// For each vendor:
vendorPercentage = vendorSpend / surgeonTotalSpend * 100
```

### 2. Volume-Weighted Risk Score

**Purpose:** Calculate adoption risk based on surgeon volume and loyalty patterns

**Formula:**
```javascript
// Step 1: Categorize surgeons who must switch vendors
highVolumeSurgeonsAffected = count where (
  primaryVendor NOT IN scenarioVendors AND
  totalCases >= 500
)

mediumVolumeSurgeonsAffected = count where (
  primaryVendor NOT IN scenarioVendors AND
  200 <= totalCases < 500
)

lowVolumeSurgeonsAffected = count where (
  primaryVendor NOT IN scenarioVendors AND
  totalCases < 200
)

// Step 2: Calculate loyalists (>90% single-vendor preference)
loyalistsAffected = count where (
  primaryVendorPercent >= 0.90 AND
  primaryVendor NOT IN scenarioVendors
)

// Step 3: Volume-weighted scoring
volumeWeightedScore = (
  (highVolumeSurgeonsAffected * 5) +
  (mediumVolumeSurgeonsAffected * 3) +
  (lowVolumeSurgeonsAffected * 1)
) / totalSurgeons

loyaltyScore = (loyalistsAffected / totalSurgeonsAffected) * 3

caseRiskScore = (casesAtRiskPercent / 100) * 2

// Step 4: Final risk score (0-10 scale)
riskScore = min(10, volumeWeightedScore + loyaltyScore + caseRiskScore)
```

**Risk Level Interpretation:**
- **0-3:** Low Risk (mostly affects low-volume surgeons)
- **4-6:** Medium Risk (affects some high-volume or many medium-volume surgeons)
- **7-10:** High Risk (affects multiple high-volume or highly loyal surgeons)

### 3. Construct Pricing

**Purpose:** Calculate total cost of complete single-vendor implant set

**Formula:**
```javascript
// Hip Construct (all hip components from one vendor)
hipConstructCost = sum(
  component.avgPrice
  WHERE component.bodyPart = "Hip"
  AND component.vendor = targetVendor
)

// Knee Construct (all knee components from one vendor)
kneeConstructCost = sum(
  component.avgPrice
  WHERE component.bodyPart = "Knee"
  AND component.vendor = targetVendor
)

// Average Construct Cost
avgConstructCost = (hipConstructCost + kneeConstructCost) / 2

// Annual Cost for Surgeon
annualConstructCost = avgConstructCost * surgeonTotalCases

// Savings Opportunity
savingsVsBest = (currentVendorConstructCost - lowestVendorConstructCost) * surgeonTotalCases
```

**Component Categorization:**
```javascript
// Hip components include:
- bodyPart = "Hip"
- name contains: "hip", "femoral head", "acetabular", "femoral stem"

// Knee components include:
- bodyPart = "Knee"
- name contains: "knee", "tibial", "patellar", "femoral component"
```

### 4. Scenario Savings Calculations

#### Projected Annual Savings
```javascript
// Method 1: Percentage-based
projectedSavings = baselineSpend * savingsPercent

// Method 2: Component-level calculation
projectedSavings = sum(
  (currentPrice - targetPrice) * quantity
  FOR each component switching vendors
)
```

#### Net Present Value (NPV)
```javascript
// 5-year NPV with implementation costs
implementationCost = implementationCostMillions * 1000000
annualSavings = scenarios[id].annualSavings

npv5Year = sum(
  annualSavings / (1 + discountRate)^year
  FOR year 1 to 5
) - implementationCost

// Typical discount rate: 5-7%
```

#### Adoption-Adjusted Savings
```javascript
// Actual savings accounting for surgeon adoption
adjustedSavings = projectedSavings * adoptionRate

// Example:
// Projected: $5M, Adoption: 92% → Adjusted: $4.6M
```

### 5. Surgeon Component Allocation

**Purpose:** Allocate system-wide component data to individual surgeons

**Formula:**
```javascript
// For each component used by surgeon's vendors:
surgeonVendorProportion = surgeonVendorSpend / surgeonTotalSpend

systemVolumeRatio = surgeonTotalCases / systemTotalCases

allocatedQuantity = componentQuantity *
                    surgeonVendorProportion *
                    systemVolumeRatio

allocatedSpend = componentTotalSpend *
                 surgeonVendorProportion *
                 (surgeonTotalSpend / systemTotalSpend)

// Round quantities to integers for display
displayQuantity = Math.round(allocatedQuantity)
```

### 6. Peer Benchmarking Metrics

#### Spend Efficiency Score
```javascript
// Compare surgeon's cost per case to peers
peerMedianCost = median(allSurgeons.avgSpendPerCase)

efficiencyScore = (peerMedianCost - surgeonAvgSpendPerCase) / peerMedianCost * 100

// Positive score = more efficient than peers
// Negative score = less efficient than peers
```

#### Volume Category
```javascript
volumeCategory = {
  "High": totalCases >= 500,
  "Medium": 200 <= totalCases < 500,
  "Low": totalCases < 200
}
```

---

## Key Assumptions

### Volume & Pricing Assumptions

1. **Case Volume Stability**
   - **Assumption:** Annual case volumes remain stable year-over-year
   - **Impact:** Used for projecting savings and calculating risk
   - **Validation:** Compare to 3-year rolling average

2. **Component Pricing**
   - **Assumption:** Average prices represent system-wide negotiated rates
   - **Impact:** Used for construct pricing and savings calculations
   - **Validation:** Verify against contract pricing sheets

3. **Surgeon Volume Distribution**
   - **High Volume:** >500 cases/year (typically 5-10% of surgeons)
   - **Medium Volume:** 200-500 cases/year (typically 20-30% of surgeons)
   - **Low Volume:** <200 cases/year (typically 60-75% of surgeons)

### Adoption & Risk Assumptions

4. **Loyalty Threshold**
   - **Assumption:** >90% single-vendor usage indicates strong loyalty
   - **Impact:** Higher risk if these surgeons must switch
   - **Rationale:** Surgeons with strong preferences more resistant to change

5. **Volume-Weighted Risk**
   - **Assumption:** High-volume surgeon resistance is 5x riskier than low-volume
   - **Rationale:**
     - Higher revenue impact
     - Greater negotiating power
     - Potential competitive recruitment risk

6. **Adoption Rate Assumptions by Scenario**
   - **Status Quo:** 100% (no change required)
   - **Tri-Vendor:** 92-95% (moderate consolidation)
   - **Dual-Vendor:** 85-92% (significant consolidation)
   - **Single-Vendor:** 75-85% (highest risk)

### Financial Assumptions

7. **Discount Rate**
   - **Standard:** 5-7% for NPV calculations
   - **Rationale:** Typical healthcare system cost of capital

8. **Implementation Costs**
   - **Low Complexity:** $0.5-1M (training, IT integration)
   - **Medium Complexity:** $1-2M (plus inventory transition)
   - **High Complexity:** $2-4M (plus surgeon retention incentives)

9. **Savings Realization Timeline**
   - **Immediate:** Contract pricing changes (0-3 months)
   - **Ramp-up:** Surgeon adoption curve (3-12 months)
   - **Full Run-Rate:** Typically achieved by month 12-18

### Clinical Quality Assumptions

10. **Vendor Equivalence**
    - **Assumption:** Major vendors (Stryker, Zimmer, J&J, S&N) have clinically equivalent outcomes
    - **Evidence:** AJRR registry data shows <0.5% revision rate difference
    - **Note:** Surgeon training and technique matter more than implant brand

11. **Learning Curve**
    - **Assumption:** 10-20 cases needed for surgeon to achieve proficiency with new system
    - **Impact:** Temporary 5-10 minute OR time increase during transition
    - **Mitigation:** Structured training program and vendor support

---

## Data Requirements

### Required Data Fields

#### Minimum Viable Dataset
```
metadata:
  ✓ productLine
  ✓ totalCases
  ✓ totalSpend
  ✓ totalSurgeons

vendors:
  ✓ vendorName (key)
  ✓ totalSpend
  ✓ totalQuantity
  ✓ uniqueSurgeons

surgeons:
  ✓ name or id
  ✓ totalCases
  ✓ totalSpend
  ✓ vendors.{vendorName}.cases
  ✓ vendors.{vendorName}.spend

scenarios:
  ✓ status-quo scenario
  ✓ at least one consolidation scenario
  ✓ vendors list
  ✓ annualSavings OR savingsPercent
```

### Optional But Recommended

```
components:           # Enables construct pricing analysis
region/facility:      # Enables geographic analysis
quality metrics:      # Enables outcomes tracking
workflow tracking:    # Enables project management features
matrixPricing:        # Enables detailed price comparison
```

### Data Quality Rules

1. **No PHI (Protected Health Information)**
   - Patient names, MRNs, dates of birth
   - Surgeon names can be de-identified (SURG-0001) or real names (with permission)

2. **Consistent Naming**
   - Vendor names: Use full official names (ZIMMER BIOMET, not Zimmer)
   - Facilities: Standardize across all records
   - Components: Use consistent category names

3. **Data Validation**
   ```javascript
   // Totals must reconcile:
   sum(surgeons.totalCases) ≈ metadata.totalCases (within 1%)
   sum(surgeons.totalSpend) ≈ metadata.totalSpend (within 1%)
   sum(vendors.totalSpend) ≈ metadata.totalSpend (within 1%)

   // Each surgeon vendor breakdown must sum:
   sum(surgeon.vendors.*.cases) ≈ surgeon.totalCases
   sum(surgeon.vendors.*.spend) ≈ surgeon.totalSpend
   ```

4. **Unit Consistency**
   - All dollar amounts in actual dollars (not millions)
   - All percentages as decimals (0.18 = 18%) in calculations
   - All percentages as whole numbers (18) in display strings
   - All dates in YYYY-MM-DD format

---

## Metrics Definitions

### System-Level Metrics

| Metric | Definition | Calculation | Units |
|--------|------------|-------------|-------|
| **Total Cases** | Annual procedure volume | Sum of all surgeon cases | Count |
| **Total Spend** | Annual implant spend | Sum of all vendor spend | Dollars |
| **Avg Cost Per Case** | System average implant cost | totalSpend / totalCases | Dollars |
| **Vendor Concentration** | % of spend with top vendor | topVendorSpend / totalSpend | Percent |
| **Surgeon Count** | Active surgeons | Count of unique surgeons | Count |
| **Vendor Count** | Active vendors | Count of unique vendors | Count |

### Surgeon-Level Metrics

| Metric | Definition | Calculation | Units |
|--------|------------|-------------|-------|
| **Annual Volume** | Cases per year | surgeon.totalCases | Count |
| **Annual Spend** | Implant spend per year | surgeon.totalSpend | Dollars |
| **Cost Per Case** | Average implant cost | totalSpend / totalCases | Dollars |
| **Primary Vendor** | Most-used vendor | max(vendors, by: cases) | Name |
| **Vendor Loyalty** | Single-vendor preference | primaryVendorCases / totalCases | Percent |
| **Vendor Count** | Number of vendors used | count(vendors) | Count |

### Scenario Metrics

| Metric | Definition | Calculation | Units |
|--------|------------|-------------|-------|
| **Projected Savings** | Annual cost reduction | Various methods | Dollars |
| **Savings Percent** | Savings as % of baseline | savings / baselineSpend | Percent |
| **Adoption Rate** | Expected surgeon participation | Based on risk analysis | Percent (0-1) |
| **Risk Score** | Volume-weighted adoption risk | See formula above | 0-10 scale |
| **NPV 5-Year** | Net present value | See formula above | $Millions |
| **Surgeons Affected** | Must switch vendors | Count where primaryVendor NOT IN scenario.vendors | Count |
| **Cases At Risk** | Volume from affected surgeons | Sum of affected surgeon cases | Count |

### Quality Metrics (Optional)

| Metric | Definition | Source | Units |
|--------|------------|--------|-------|
| **Revision Rate** | % requiring revision within 1-2 years | AJRR/Internal | Percent |
| **30-Day Readmission** | % readmitted within 30 days | CMS/Internal | Percent |
| **90-Day Readmission** | % readmitted within 90 days | CMS/Internal | Percent |
| **Length of Stay** | Average days in hospital | Internal EMR | Days |
| **Complication Rate** | % with any adverse event | Internal EMR | Percent |
| **SSI Rate** | Surgical site infection rate | NHSN | Percent |

---

## Quality Assurance

### Pre-Deployment Checklist

```
Data Validation:
  [ ] JSON syntax is valid (use jsonlint.com)
  [ ] All required fields present
  [ ] Totals reconcile (surgeons sum to metadata)
  [ ] No negative numbers where inappropriate
  [ ] Dates in YYYY-MM-DD format
  [ ] No PHI present

Data Quality:
  [ ] Vendor names consistent and standardized
  [ ] Facility names consistent across surgeons
  [ ] Component categories follow naming convention
  [ ] All dollar amounts in dollars (not millions)
  [ ] Percentages as decimals in calculations

Logic Checks:
  [ ] At least one scenario has status-quo
  [ ] Scenario vendor lists are valid vendor names
  [ ] Surgeon vendor breakdown vendors exist in global vendor list
  [ ] Component vendors exist in global vendor list
  [ ] Risk levels align with risk scores (Low: 0-3, Med: 4-6, High: 7-10)

Dashboard Testing:
  [ ] Dashboard loads without console errors
  [ ] All views render correctly
  [ ] Metrics display reasonable values
  [ ] Charts populate with data
  [ ] Scenario selection changes metrics appropriately
  [ ] Surgeon search returns results
```

### Common Data Issues

| Issue | Symptom | Fix |
|-------|---------|-----|
| **Totals don't sum** | Metadata totals ≠ surgeon totals | Recalculate and update metadata |
| **Missing vendor** | Surgeon uses vendor not in vendor list | Add vendor to vendors object |
| **Duplicate vendors** | "Zimmer" and "ZIMMER BIOMET" | Standardize all vendor names |
| **Incorrect units** | Spend shows as $41 instead of $41M | Change dollars to actual value (41010260) |
| **Broken scenario** | Scenario doesn't show data | Check vendors array matches actual vendor names |
| **Component mismatch** | Components don't show for surgeon | Verify component vendors match surgeon's vendor usage |

---

## Troubleshooting

### Dashboard Shows "No Data Available"

**Possible Causes:**
1. JSON file not found at expected path
2. JSON syntax error
3. File path mismatch in code

**Solution:**
```bash
# Verify file exists
ls -la public/data/hip-knee-data.json

# Validate JSON syntax
cat public/data/hip-knee-data.json | python -m json.tool

# Check browser console for specific error
# Open browser DevTools → Console tab
```

### Numbers Look Wrong

**Possible Causes:**
1. Unit mismatch (dollars vs. millions)
2. Calculation error in source data
3. Incorrect aggregation

**Solution:**
```javascript
// Manual verification:
// 1. Pick a surgeon, verify their totals:
sum(surgeon.vendors.*.spend) should equal surgeon.totalSpend

// 2. Verify system totals:
sum(all surgeons.totalSpend) should equal metadata.totalSpend

// 3. Check component prices:
component.avgPrice = component.totalSpend / component.quantity
```

### Construct Pricing Shows Missing Data

**Possible Causes:**
1. Missing `components` array in data file
2. Component `bodyPart` field incorrect
3. Vendor names don't match

**Solution:**
1. Verify `components` array exists in JSON
2. Check `bodyPart` values are "Hip", "Knee", or "General"
3. Ensure component vendors match surgeon vendor names exactly

### Risk Score Seems Incorrect

**Possible Causes:**
1. Volume thresholds don't match your system
2. Loyalty threshold too strict/lenient
3. Missing surgeon volume data

**Solution:**
1. Adjust thresholds in `src/config/scenarios.js`:
   ```javascript
   VOLUME_THRESHOLDS = {
     HIGH: 500,    // Adjust based on your system
     MEDIUM: 200
   }
   LOYALTY_THRESHOLD = 0.90  // Adjust 0.80-0.95
   ```

### Scenario Savings Don't Match Expectations

**Possible Causes:**
1. `savingsPercent` vs. `annualSavings` conflict
2. Adoption rate not factored in
3. Implementation costs not considered

**Solution:**
1. Use one method consistently:
   ```javascript
   // Method 1: Percentage
   annualSavings = baselineSpend * savingsPercent

   // Method 2: Absolute
   annualSavings = [calculated value]
   // Don't set savingsPercent if using absolute
   ```

---

## Appendix: Example Scenarios

### Scenario Configuration Examples

#### Status Quo (Baseline)
```json
{
  "name": "Status Quo",
  "vendors": ["VENDOR-ALPHA", "VENDOR-BETA", "VENDOR-GAMMA", "VENDOR-DELTA", "VENDOR-EPSILON"],
  "annualSavings": 0,
  "savingsPercent": 0,
  "adoptionRate": 1.0,
  "riskLevel": "Low",
  "riskScore": 1.0
}
```

#### Tri-Vendor (Moderate Consolidation)
```json
{
  "name": "Three-Vendor Strategy",
  "vendors": ["VENDOR-ALPHA", "VENDOR-BETA", "VENDOR-GAMMA"],
  "annualSavings": 3200000,
  "savingsPercent": 7.8,
  "adoptionRate": 0.94,
  "riskLevel": "Low",
  "riskScore": 2.5
}
```

#### Dual-Vendor Premium (High Consolidation)
```json
{
  "name": "Two-Vendor Strategy (Premium)",
  "vendors": ["VENDOR-ALPHA", "VENDOR-BETA"],
  "annualSavings": 5000000,
  "savingsPercent": 12.2,
  "adoptionRate": 0.88,
  "riskLevel": "Medium",
  "riskScore": 4.2
}
```

#### Single-Vendor (Maximum Consolidation)
```json
{
  "name": "Single-Vendor Strategy",
  "vendors": ["VENDOR-ALPHA"],
  "annualSavings": 7500000,
  "savingsPercent": 18.3,
  "adoptionRate": 0.78,
  "riskLevel": "High",
  "riskScore": 7.8
}
```

---

## Support & Resources

### Internal Documentation
- [DATA_ARCHITECTURE.md](DATA_ARCHITECTURE.md) - Schema deep-dive
- [DATA_COLLECTION_GUIDE.md](DATA_COLLECTION_GUIDE.md) - What data to collect
- [DATA_MANAGEMENT_OVERVIEW.md](DATA_MANAGEMENT_OVERVIEW.md) - Update workflows

### Code References
- Scenario calculations: `src/config/scenarios.js`
- Surgeon metrics: `src/views/SurgeonTool.jsx`
- Executive dashboard: `src/views/ExecutiveDashboard.jsx`

### External Benchmarks
- **AJRR:** American Joint Replacement Registry (clinical outcomes)
- **ECRI:** Healthcare supply chain benchmarking
- **Premier:** Group purchasing and quality data
- **NSQIP:** National Surgical Quality Improvement Program

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2025-10 | Added construct pricing, synthetic data updates |
| 1.5 | 2025-10 | Updated risk calculation methodology |
| 1.0 | 2025-10 | Initial consolidated analyst guide |

---

**Questions or Issues?**
Contact: Strategic Sourcing Lead or Value Analytics Administrator
