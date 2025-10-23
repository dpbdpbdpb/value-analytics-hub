# Claude Prompt: Data Standardization for Value Analytics Hub

## Purpose
This prompt helps you convert raw surgical/orthopedic data (Excel, CSV, etc.) into the standardized JSON format required by the Value Analytics Hub.

---

## Prompt Template

```
I need help standardizing surgical data for the CommonSpirit Value Analytics Hub.

PRODUCT LINE: [hip-knee | shoulder | spine | sports-medicine | trauma]
DATA TYPE: [baseline | lookback]
DATA SOURCE: [Description of data source]

[If lookback, provide:]
BASELINE DATE: [YYYY-MM-DD]
LOOKBACK DATE: [YYYY-MM-DD]
LOOKBACK PERIOD: [3-months | 6-months | 9-months | 12-months]

ATTACHED DATA:
[Paste Excel/CSV data or describe the files attached]

INSTRUCTIONS:
1. Analyze the attached data and transform it into the JSON schema defined below
2. Calculate all aggregate metrics (totalCases, totalSpend, uniqueSurgeons, etc.)
3. For vendor data: aggregate by vendor name, normalizing vendor naming variations
4. For surgeon data: preserve individual surgeon records with vendor usage patterns
5. For regional data: aggregate by region if available
6. **For hospital data:** aggregate surgeons by hospital to identify:
   - Vendor concentration patterns within each hospital
   - Pockets of surgeons using the same vendor (change management cohorts)
   - Potential peer influence and sherpa opportunities
7. **Identify sherpas:** flag high-performing surgeons (high volume + low cost) who can mentor peers during vendor transitions
8. **Calculate peer influence:** for each surgeon, identify hospital peers and potential sherpas
9. Generate scenario modeling if sufficient data exists (recommend 4-5 scenarios)
10. Calculate Quintuple Aim scores for each scenario based on:
    - Patient Experience: clinical outcomes, quality metrics
    - Population Health: access, volume trends
    - Cost Reduction: savings potential
    - Provider Experience: surgeon adoption, workflow impact
    - Health Equity: geographic/demographic access
11. **Generate matrix pricing in TWO formats:**

    **Format 1 - matrixPricing (ARRAY for UI display):**
    - Create an ARRAY of components with aggregated metrics
    - For each component category:
      * Calculate weighted average currentAvgPrice across all vendors
      * Set matrixPrice as the lowest vendor price (target price)
      * Estimate totalSpend based on volume and currentAvgPrice
      * Calculate potentialSavings = volume * (currentAvgPrice - matrixPrice)
    - Sort array by potentialSavings descending
    - Only include components where potentialSavings > 0

    **Format 2 - matrixPricingDetailed (OBJECT for detailed analysis):**
    - Create an OBJECT keyed by component category
    - For each category, include vendor-level detail:
      * Calculate median price per vendor
      * Include sample count and price range (min/max) for transparency
      * Filter out outliers (prices < $100 or > $15,000)
    - This enables deep-dive vendor price comparison
12. **Calculate quality metrics:** If clinical outcomes data is available:
    - Revision rates (% of cases requiring revision surgery)
    - Readmission rates (30-day and 90-day all-cause)
    - Average length of stay (LOS) in days
    - Complication rates (any adverse event)
    - Surgical site infection (SSI) rates
    - Include benchmark comparisons (national/regional averages)
    - Break down by vendor if sample sizes are sufficient
13. **Calculate revenue cycle metrics:** If financial/billing data is available:
    - Average reimbursement per case (from payer contracts)
    - Average implant cost per case (from supply chain)
    - Average direct cost per case (OR time, nursing, supplies)
    - Contribution margin per case (reimbursement - implant cost - direct cost)
    - Total revenue, costs, and contribution margin
    - Break down by DRG code (Diagnosis-Related Group)
    - Break down by payer mix (Medicare, Medicaid, Commercial, etc.)
    - This enables profitability analysis and scenario financial modeling
14. **Track workflow stage:** Document current position in sourcing lifecycle:
    - Current stage: sourcing-review | decision | implementation | lookback | renewal
    - Status of each stage: completed | active | upcoming
    - Key dates: start dates, completion dates, scheduled dates
    - Implementation milestones with completion status
    - Selected scenario during decision phase
    - This enables progress tracking and ensures appropriate canvas usage for each stage

OUTPUT FORMAT:
Please provide the complete JSON file following this schema:

```json
{
  "metadata": {
    "productLine": "PRODUCT_LINE_HERE",
    "dataType": "baseline or lookback",
    "dataCollectionDate": "YYYY-MM-DD",
    "lastUpdated": "ISO_TIMESTAMP",
    "dataSource": "DATA_SOURCE_DESCRIPTION",
    "version": "1.0",
    "totalCases": 0,
    "totalSpend": 0
  },
  "vendors": {
    "VENDOR_NAME": {
      "totalSpend": 0,
      "totalQuantity": 0,
      "uniqueSurgeons": 0
    }
  },
  "regions": {
    "REGION_NAME": {
      "totalSpend": 0,
      "cases": 0,
      "surgeons": 0
    }
  },
  "hospitals": {
    "HOSPITAL_NAME": {
      "id": "UNIQUE_HOSPITAL_ID",
      "region": "REGION_NAME",
      "totalCases": 0,
      "totalSpend": 0,
      "surgeonCount": 0,
      "primaryVendor": "VENDOR_NAME",
      "vendorConcentration": 0.0,
      "vendors": {
        "VENDOR_NAME": {
          "cases": 0,
          "spend": 0,
          "surgeons": 0
        }
      }
    }
  },
  "surgeons": [
    {
      "name": "Last, First",
      "id": "UNIQUE_ID",
      "hospitals": [
        {
          "name": "HOSPITAL_NAME",
          "id": "UNIQUE_HOSPITAL_ID",
          "isPrimary": true,
          "cases": 0,
          "spend": 0
        }
      ],
      "primaryHospital": "HOSPITAL_NAME",
      "region": "REGION_NAME",
      "totalCases": 0,
      "totalSpend": 0,
      "primaryVendor": "VENDOR_NAME",
      "primaryVendorPercent": 0.0,
      "volumeCategory": "high | medium | low",
      "isSherpa": false,
      "vendors": {
        "VENDOR_NAME": {
          "cases": 0,
          "spend": 0
        }
      },
      "peerInfluence": {
        "totalHospitalPeers": 0,
        "peersByHospital": {
          "HOSP_ID": {
            "peers": 0,
            "samePrimaryVendor": 0,
            "potentialSherpas": ["SURG_ID_1"]
          }
        }
      }
    }
  ],
  "scenarios": {
    "status-quo": {
      "name": "Status Quo",
      "shortName": "Status Quo",
      "description": "Continue with current vendor distribution",
      "vendors": ["LIST", "ALL", "CURRENT", "VENDORS"],
      "annualSavings": 0,
      "savingsPercent": 0,
      "adoptionRate": 1.0,
      "riskLevel": "Low",
      "riskScore": 1.0,
      "quintupleMissionScore": 50,
      "quintupleScores": {
        "patientExperience": "50",
        "populationHealth": "50",
        "costReduction": "0",
        "providerExperience": "100",
        "healthEquity": "50"
      },
      "implementation": {
        "timeline": 0,
        "complexity": "Low",
        "costMillions": 0
      },
      "npv5Year": 0
    }
  },
  "components": [
    {
      "name": "COMPONENT_NAME",
      "vendor": "VENDOR_NAME",
      "quantity": 0,
      "totalSpend": 0,
      "avgPrice": 0,
      "procedureType": "PRIMARY or REVISION",
      "bodyPart": "HIP or KNEE or SHOULDER etc"
    }
  ],
  "matrixPricing": [
    {
      "category": "COMPONENT_CATEGORY_NAME",
      "totalSpend": 0,
      "currentAvgPrice": 0,
      "matrixPrice": 0,
      "potentialSavings": 0
    }
  ],
  "matrixPricingDetailed": {
    "COMPONENT_CATEGORY": {
      "category": "COMPONENT_CATEGORY_NAME",
      "vendors": {
        "VENDOR_NAME": {
          "medianPrice": 0,
          "samples": 0,
          "priceRange": { "min": 0, "max": 0 }
        }
      }
    }
  },
  "qualityMetrics": {
    "revisionRate": 0.0,
    "readmissionRate30Day": 0.0,
    "readmissionRate90Day": 0.0,
    "avgLengthOfStay": 0.0,
    "complicationRate": 0.0,
    "infectionRate": 0.0,
    "benchmarkRevisionRate": 0.0,
    "benchmarkReadmission30": 0.0,
    "benchmarkReadmission90": 0.0,
    "benchmarkLOS": 0.0,
    "benchmarkComplicationRate": 0.0,
    "benchmarkInfectionRate": 0.0,
    "dataSource": "EMR/Registry System Name",
    "lastUpdated": "ISO_TIMESTAMP",
    "byVendor": {
      "VENDOR_NAME": {
        "revisionRate": 0.0,
        "readmissionRate30Day": 0.0,
        "complicationRate": 0.0
      }
    }
  },
  "revenueCycle": {
    "avgReimbursementPerCase": 0.0,
    "avgImplantCostPerCase": 0.0,
    "avgDirectCostPerCase": 0.0,
    "avgContributionMarginPerCase": 0.0,
    "totalRevenue": 0.0,
    "totalImplantCosts": 0.0,
    "totalDirectCosts": 0.0,
    "totalContributionMargin": 0.0,
    "contributionMarginPercent": 0.0,
    "byDRG": {
      "DRG_CODE": {
        "drgCode": "XXX",
        "description": "DRG Description",
        "cases": 0,
        "avgReimbursement": 0.0,
        "avgImplantCost": 0.0,
        "avgDirectCost": 0.0,
        "avgContributionMargin": 0.0
      }
    },
    "byPayer": {
      "PAYER_NAME": {
        "cases": 0,
        "avgReimbursement": 0.0,
        "totalRevenue": 0.0,
        "contributionMargin": 0.0
      }
    },
    "dataSource": "Revenue Cycle / Decision Support System",
    "lastUpdated": "ISO_TIMESTAMP"
  },
  "workflowTracking": {
    "currentStage": "implementation",
    "lastUpdated": "ISO_TIMESTAMP",
    "stages": {
      "sourcing-review": {
        "status": "completed",
        "startDate": "YYYY-MM-DD",
        "completionDate": "YYYY-MM-DD",
        "notes": "Completed initial market analysis and vendor evaluation"
      },
      "decision": {
        "status": "completed",
        "decisionDate": "YYYY-MM-DD",
        "selectedScenario": "SCENARIO_ID",
        "notes": "Selected dual-vendor strategy (Vendor A + Vendor B)"
      },
      "implementation": {
        "status": "active",
        "startDate": "YYYY-MM-DD",
        "expectedCompletion": "YYYY-MM-DD",
        "percentComplete": 0.0,
        "milestones": [
          {
            "name": "Contract signing",
            "completed": true,
            "date": "YYYY-MM-DD"
          },
          {
            "name": "Surgeon training",
            "completed": false,
            "expectedDate": "YYYY-MM-DD"
          }
        ],
        "notes": "Rolling out new contracts and training surgeons"
      },
      "lookback": {
        "status": "upcoming",
        "scheduledDate": "YYYY-MM-DD",
        "notes": "First lookback scheduled 3 months post-implementation"
      },
      "renewal": {
        "status": "upcoming",
        "contractExpirationDate": "YYYY-MM-DD",
        "nextReviewDate": "YYYY-MM-DD",
        "notes": "Contracts expire in 3 years"
      }
    }
  }
}
```

VALIDATION CHECKS:
- Ensure all dollar amounts are in dollars (not millions)
- Verify totalCases = sum of all surgeon cases
- Verify totalSpend = sum of all vendor spend
- Check that adoptionRate is between 0 and 1
- Ensure all percentages are decimals (e.g., 0.12 for 12%)
- Validate that primaryVendorPercent for each surgeon sums correctly
- Verify each surgeon is assigned to a hospital
- Confirm peerInfluence data is calculated for all surgeons
- **CRITICAL: Verify matrixPricing is an ARRAY with potentialSavings calculated**
- **CRITICAL: Verify matrixPricingDetailed is an OBJECT with vendor-level detail**
- Ensure both matrixPricing and matrixPricingDetailed contain same component categories
- Ensure matrixPricing prices are reasonable ($100-$15,000 range)
- Validate qualityMetrics rates are percentages (0-100 scale)
- Verify qualityMetrics benchmarks are included for comparison
- Check revenueCycle contribution margins are calculated correctly
- Ensure revenueCycle totals match case-level aggregations

HOSPITAL AGGREGATION GUIDELINES:
For each hospital, calculate:
- **Total cases and spend** from all surgeons at that hospital
- **Primary vendor**: The vendor with the most cases at that hospital
- **Vendor concentration**: % of cases using the top vendor (helps identify single-vendor hospitals)
- **Surgeon count**: Number of unique surgeons practicing at that hospital
- **Vendor distribution**: Break down cases/spend/surgeon count by vendor

This helps identify:
- **Cohort opportunities**: Hospitals where most surgeons use the same vendor (easier transitions)
- **Sherpa potential**: Hospitals with high-performing surgeons who can mentor peers
- **Change management priorities**: Hospitals with high vendor fragmentation need more support

SHERPA IDENTIFICATION CRITERIA:
A surgeon qualifies as a potential "sherpa" (peer mentor) if they meet these criteria:
- **High volume**: >200 cases/year (experienced, credible)
- **Cost efficient**: Average cost per case in bottom 40% (demonstrates value)
- **Willing to help**: (Can be flagged manually or inferred from data)

For each surgeon, identify:
- **potentialSherpas**: List of sherpa IDs at the same hospital who use the target vendor
- **hospitalPeers**: Count of other surgeons at same hospital
- **samePrimaryVendor**: Count of peers using the same primary vendor

This enables change management strategies like:
- Pairing surgeons who need to switch with sherpas who already use the target vendor
- Organizing hospital-based training sessions led by local sherpas
- Identifying "vendor islands" (lone surgeons at hospitals where peers use different vendors)

SCENARIO GENERATION GUIDELINES:
1. **Status Quo**: All current vendors, 0 savings, 1.0 adoption, low risk
2. **Tri-Vendor**: Top 3 vendors by volume/spend, 10-15% savings, 0.85-0.92 adoption
3. **Dual Premium**: Top 2 premium vendors, 15-20% savings, 0.80-0.88 adoption, medium risk
4. **Dual Value**: 2 value-oriented vendors, 20-25% savings, 0.75-0.85 adoption, higher risk
5. **Single Vendor**: 1 dominant vendor, 25-30% savings, 0.70-0.80 adoption, high risk

For each scenario, calculate:
- **Annual Savings**: Based on negotiated pricing, volume consolidation
- **Adoption Rate**: % of surgeons who can continue with current vendor or easily switch
- **Risk Score**: 0-10 scale based on surgeon disruption, volume at risk, loyalist impact
- **Implementation Timeline**: Months to full rollout
- **Implementation Cost**: Transition costs, training, contract fees (in millions)
- **5-Year NPV**: Net present value over 5 years

Please generate the complete JSON output.
```

---

## Example Usage

### Example 1: Hip/Knee Baseline Data

```
I need help standardizing surgical data for the CommonSpirit Value Analytics Hub.

PRODUCT LINE: hip-knee
DATA TYPE: baseline
DATA SOURCE: CommonSpirit Surgical Analysis + ECRI Benchmarking Q3 2024

ATTACHED DATA:
[Paste your Excel/CSV data here - surgeon names, vendors, case counts, spend amounts, etc.]

[Follow instructions from template above]
```

### Example 2: Shoulder Lookback Data

```
I need help standardizing surgical data for the CommonSpirit Value Analytics Hub.

PRODUCT LINE: shoulder
DATA TYPE: lookback
DATA SOURCE: CommonSpirit Q1 2025 Lookback Analysis
BASELINE DATE: 2024-07-01
LOOKBACK DATE: 2024-10-01
LOOKBACK PERIOD: 3-months

ATTACHED DATA:
[Paste your lookback data including actual vs predicted metrics]

ADDITIONAL CONTEXT:
We implemented a dual-vendor strategy (Stryker + Zimmer) in July 2024. Please include:
- Actual adoption rates vs predicted
- Actual savings vs predicted
- Any implementation challenges or delays
- Surgeon feedback or concerns

[Follow instructions from template above]
```

---

## Data Sources for Complete Integration

The standardization prompt supports integration with multiple data sources:

### 1. Supply Chain / Vendor Data (Required)
- **Source**: Supply chain management system, GPO data, vendor invoices
- **Contains**: Component costs, quantities, surgeon usage patterns
- **Fields Populated**: `vendors`, `components`, `surgeons.vendors`, `matrixPricing`

### 2. Clinical Outcomes / Quality Data (Optional but Recommended)
- **Source**: EMR, surgical registry (e.g., AJRR, NSQIP), quality reporting systems
- **Contains**: Revision rates, readmissions, complications, length of stay
- **Fields Populated**: `qualityMetrics`
- **Note**: If unavailable, the dashboard will display placeholder data with clear labeling

### 3. Revenue Cycle / Financial Data (Optional but Recommended)
- **Source**: Decision support system, revenue cycle management, billing systems
- **Contains**: Reimbursement rates, DRG codes, payer mix, profitability
- **Fields Populated**: `revenueCycle`
- **Note**: If unavailable, financial analysis will focus on cost reduction only

### 4. Hospital / Surgeon Data (Required)
- **Source**: Medical staff directory, credentialing database
- **Contains**: Surgeon assignments, hospital affiliations, case volumes
- **Fields Populated**: `hospitals`, `surgeons`, `peerInfluence`

**Recommendation**: Start with supply chain data to get the dashboard operational, then progressively integrate clinical outcomes and revenue cycle data for comprehensive decision support.

---

## Tips for Best Results

1. **Clean Your Data First**: Remove any sensitive PHI, normalize vendor names, ensure consistent date formats

2. **Provide Context**: Tell Claude about any unique aspects of your data or decision context

3. **Validate Output**: Always review the generated JSON for:
   - Mathematical correctness (sums, percentages)
   - Logical consistency (e.g., savings should correlate with vendor reduction)
   - Completeness (all required fields present)

4. **Iterate**: If scenarios don't look right, ask Claude to:
   - Adjust savings assumptions
   - Recalculate adoption rates based on surgeon vendor loyalty
   - Refine Quintuple Aim scores

5. **Save Raw Data**: Keep your original Excel/CSV files as backup - JSON is for the application only

6. **Placeholder Data**: If quality or revenue cycle data is not yet available, the prompt will:
   - Generate NULL values or placeholder text indicating data is pending
   - Enable the dashboard to display informative messages about data availability
   - Allow progressive enhancement as additional data sources are integrated

---

## Vendor Name Normalization

Common variations to watch for:
- "J&J" vs "JOHNSON & JOHNSON" vs "DePuy Synthes"
- "ZIMMER" vs "ZIMMER BIOMET" vs "ZB"
- "STRYKER" vs "Stryker Orthopaedics"
- "SMITH & NEPHEW" vs "S&N"

Claude should normalize these to a single canonical name per vendor.

---

## Next Steps After Standardization

1. Save the JSON output to: `public/data/{product-line}/baseline.json`
2. Validate the JSON using: `npx ajv validate -s schema.json -d baseline.json`
3. Test loading in the application
4. Review scenarios with clinical/financial stakeholders
5. Adjust if needed and re-upload

---

## Need Help?

If Claude's output needs refinement:
- Ask it to explain its calculation methodology
- Request specific adjustments to savings assumptions
- Ask for sensitivity analysis on key variables
- Request additional scenarios based on your strategic priorities
