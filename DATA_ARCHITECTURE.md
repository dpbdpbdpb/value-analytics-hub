# Data Architecture for Value Analytics Hub

## Overview
This document outlines the data architecture for managing multiple product lines (Hip/Knee, Shoulder, Spine, Sports Medicine, Trauma) with support for baseline and lookback datasets.

## Directory Structure

```
public/
├── data/
│   ├── hip-knee/
│   │   ├── baseline.json          # Initial decision data
│   │   ├── lookback-2024-q1.json  # 3-month lookback
│   │   ├── lookback-2024-q2.json  # 6-month lookback
│   │   └── lookback-2024-q3.json  # 9-month lookback
│   ├── shoulder/
│   │   └── baseline.json
│   ├── spine/
│   │   └── baseline.json
│   ├── sports-medicine/
│   │   └── baseline.json
│   └── trauma/
│       └── baseline.json
└── orthopedic-data.json  # Legacy - to be deprecated
```

## Data Schema

### Product Line Data File Structure
Each `baseline.json` or `lookback-*.json` file follows this schema:

```json
{
  "metadata": {
    "productLine": "hip-knee",
    "dataType": "baseline | lookback",
    "lookbackPeriod": "3-months | 6-months | 9-months | 12-months",
    "dataCollectionDate": "2024-10-21",
    "lastUpdated": "2024-10-21T19:58:14.507825",
    "dataSource": "CommonSpirit Surgical Analysis + ECRI Benchmarking",
    "version": "1.0",
    "totalCases": 27623,
    "totalSpend": 42080676.13
  },

  "vendors": {
    "VENDOR NAME": {
      "totalSpend": 14420776.85,
      "totalQuantity": 29110,
      "uniqueSurgeons": 211
    }
  },

  "regions": {
    "REGION NAME": {
      "totalSpend": 10470353.70,
      "cases": 7252,
      "surgeons": 134
    }
  },

  "hospitals": {
    "HOSPITAL_NAME": {
      "id": "HOSP001",
      "region": "CALIFORNIA",
      "totalCases": 1200,
      "totalSpend": 1800000,
      "surgeonCount": 8,
      "primaryVendor": "STRYKER",
      "vendorConcentration": 0.75,  // 75% of cases use top vendor
      "vendors": {
        "STRYKER": {"cases": 900, "spend": 1350000, "surgeons": 6},
        "ZIMMER BIOMET": {"cases": 300, "spend": 450000, "surgeons": 2}
      }
    }
  },

  "surgeons": [
    {
      "name": "Smith, John",
      "id": "SURG001",
      "hospital": "HOSPITAL_NAME",
      "hospitalId": "HOSP001",
      "region": "CALIFORNIA",
      "totalCases": 450,
      "totalSpend": 675000,
      "primaryVendor": "STRYKER",
      "primaryVendorPercent": 0.85,
      "volumeCategory": "high",  // high (>500), medium (200-500), low (<200)
      "isSherpa": false,  // Will be calculated based on efficiency/quality
      "vendors": {
        "STRYKER": {"cases": 383, "spend": 573750},
        "ZIMMER BIOMET": {"cases": 67, "spend": 101250}
      },
      "peerInfluence": {
        "hospitalPeers": 7,  // Other surgeons at same hospital
        "samePrimaryVendor": 5,  // Peers using same primary vendor
        "potentialSherpas": ["SURG002", "SURG003"]  // IDs of efficient peers
      }
    }
  ],

  "scenarios": {
    "status-quo": {
      "name": "Status Quo",
      "shortName": "Status Quo",
      "description": "Continue with current multi-vendor fragmentation",
      "vendors": ["ZIMMER BIOMET", "STRYKER", "J&J", "SMITH & NEPHEW", "CONFORMIS"],
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
    },
    "scenario-id": {
      "name": "Scenario Name",
      "shortName": "Short Name",
      "description": "Scenario description",
      "vendors": ["VENDOR1", "VENDOR2"],
      "annualSavings": 5049681.24,  // In dollars
      "savingsPercent": 12.0,
      "adoptionRate": 0.92,
      "riskLevel": "Low | Medium | High",
      "riskScore": 2.5,
      "quintupleMissionScore": 75,
      "quintupleScores": {
        "patientExperience": "75",
        "populationHealth": "70",
        "costReduction": "85",
        "providerExperience": "65",
        "healthEquity": "75"
      },
      "implementation": {
        "timeline": 6,  // months
        "complexity": "Low | Medium | High",
        "costMillions": 1.5
      },
      "npv5Year": 23.5
    }
  },

  "components": [
    {
      "name": "FEMORAL COMPONENT",
      "vendor": "STRYKER",
      "quantity": 450,
      "totalSpend": 225000,
      "avgPrice": 500,
      "procedureType": "PRIMARY | REVISION",
      "bodyPart": "HIP | KNEE"
    }
  ]
}
```

## Lookback Data Additions

Lookback files include everything in baseline.json PLUS:

```json
{
  "metadata": {
    "...baseline fields...",
    "dataType": "lookback",
    "lookbackPeriod": "3-months",
    "baselineDate": "2024-01-15",
    "lookbackDate": "2024-04-15"
  },

  "assumptions": {
    "assumption-id": {
      "description": "Assumption text from decision canvas",
      "pillar": "finance | clinical | operations",
      "owner": "CFO",
      "predicted": {
        "metric": "Annual Savings",
        "value": 5000000,
        "unit": "dollars"
      },
      "actual": {
        "value": 4200000,
        "unit": "dollars"
      },
      "variance": -0.16,  // -16%
      "status": "on-track | at-risk | off-track",
      "notes": "Slower vendor transition than expected"
    }
  },

  "actualScenario": {
    "id": "dual-premium",
    "implementationProgress": 0.60,  // 60% complete
    "actualSavingsToDate": 2100000,
    "projectedAnnualSavings": 4200000,
    "surgeonAdoptionRate": 0.88,  // vs predicted 0.92
    "implementationChallenges": [
      "Two high-volume surgeons requested extension",
      "Supply chain delays for preferred implants"
    ]
  }
}
```

## Data Loading Strategy

### Phase 1: Current State (Single Product Line)
- Hip/Knee uses `public/orthopedic-data.json` (existing)
- Other product lines show as "TBD"

### Phase 2: Multi-Product Line Support
- Hip/Knee migrates to `public/data/hip-knee/baseline.json`
- Add Shoulder, Spine, Sports Medicine, Trauma baselines as data becomes available
- Update App.js to dynamically load product line data

### Phase 3: Lookback Support
- Add lookback files as time-based milestones are reached
- Create Lookback view component
- Show variance analysis comparing assumptions vs. actuals

## Data Flow

```
Raw Excel/CSV Data
    ↓
Claude Data Standardization Prompt
    ↓
Standardized JSON (following schema)
    ↓
Save to public/data/{product-line}/baseline.json
    ↓
Application fetches and displays
```

## Implementation Notes

1. **Backward Compatibility**: Keep `orthopedic-data.json` until Hip/Knee fully migrated
2. **Lazy Loading**: Only load product line data when user navigates to it
3. **Error Handling**: Gracefully handle missing/malformed data files
4. **Caching**: Use browser cache to avoid redundant fetches
5. **Validation**: Add JSON schema validation on data load

## Migration Plan

### Step 1: Create new directory structure
```bash
mkdir -p public/data/{hip-knee,shoulder,spine,sports-medicine,trauma}
```

### Step 2: Copy and rename current data
```bash
cp public/orthopedic-data.json public/data/hip-knee/baseline.json
```

### Step 3: Update metadata in new file
- Set `productLine: "hip-knee"`
- Set `dataType: "baseline"`

### Step 4: Update application code
- Modify data loading to support product line parameter
- Update routes to pass product line context
- Add dynamic data loading in views

### Step 5: Test and validate
- Verify all dashboards work with new data structure
- Test loading multiple product lines
- Verify graceful handling of missing data

### Step 6: Deploy and deprecate legacy
- Deploy new structure
- Mark `orthopedic-data.json` as deprecated
- Plan removal for future release
