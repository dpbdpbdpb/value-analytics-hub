# Data Collection Guide for Value Analytics Hub

**Purpose:** This guide helps analysts understand what data to collect, when to collect it, and how to prepare it for the Value Analytics Hub.

---

## Data Collection Overview

The Value Analytics Hub integrates data from multiple sources, each with different update frequencies:

| Data Type | Source System | Update Frequency | Owner | Priority |
|-----------|--------------|------------------|-------|----------|
| Supply Chain | Procurement/GPO | Monthly | Supply Chain Team | **Required** |
| Quality Metrics | EMR/Registry | Quarterly | Quality/Clinical Team | Recommended |
| Revenue Cycle | Billing/DSS | Monthly/Quarterly | Finance Team | Recommended |
| Workflow Tracking | Manual Update | As Needed | Project Manager | Required |
| Surgeon/Hospital | Credentialing | Semi-Annual | Medical Staff Office | **Required** |

---

## 1. Supply Chain Data (REQUIRED)

**Update Frequency:** Monthly or Quarterly
**Data Collection Window:** Previous 12 months rolling
**Owner:** Supply Chain / Value Analysis Team

### What to Collect:

#### Vendor Invoices/Purchase Orders
- Vendor name
- Component/product description
- Quantity purchased
- Unit price
- Total spend
- Procedure type (Primary/Revision)
- Body part (Hip/Knee/Shoulder)
- Date of purchase

#### Surgeon Usage Data
- Surgeon name and unique ID
- Hospital/facility where procedure performed
- Vendor preference by surgeon
- Case volumes by surgeon
- Spend by surgeon

#### Component Catalog
- Component categories (e.g., "Acetabular Cup", "Femoral Stem")
- Vendor for each component
- Average pricing by vendor
- Usage frequency

### How to Prepare:

1. **Export from procurement system** (e.g., SAP, Oracle, Workday)
2. **Normalize vendor names:**
   - "J&J" → "JOHNSON & JOHNSON"
   - "Zimmer" → "ZIMMER BIOMET"
   - "S&N" → "SMITH & NEPHEW"
3. **Remove PHI:** Strip patient names, MRNs, dates of birth
4. **Aggregate to surgeon level:** Sum cases and spend per surgeon
5. **Save as CSV or Excel** with clear column headers

### Example Data Format:

```csv
Surgeon_Name,Surgeon_ID,Hospital,Vendor,Component,Quantity,Spend,Procedure_Type
"Smith, John",SMITH_JOHN_001,St Mary Medical Center,ZIMMER BIOMET,Acetabular Cup,45,67500,PRIMARY
"Jones, Sarah",JONES_SARAH_002,St Mary Medical Center,STRYKER,Femoral Stem,38,95000,PRIMARY
```

---

## 2. Quality & Clinical Outcomes Data (RECOMMENDED)

**Update Frequency:** Quarterly or Semi-Annual
**Data Collection Window:** Previous 12-24 months
**Owner:** Quality Department / Clinical Registry Team

### What to Collect:

#### Aggregate Quality Metrics
- Revision rate (% of cases requiring revision surgery within 1-2 years)
- 30-day readmission rate (all-cause)
- 90-day readmission rate (all-cause)
- Average length of stay (days)
- Complication rate (any adverse event)
- Surgical site infection (SSI) rate

#### Benchmark Data
- National/regional averages for each metric
- Source of benchmarks (e.g., AJRR, NSQIP, Premier)

#### Optional: Vendor-Level Quality (if sample size sufficient)
- Quality metrics broken down by implant vendor
- Allows correlation between vendor choice and outcomes

### How to Prepare:

1. **Pull from quality reporting system** (e.g., Premier, NSQIP, internal registry)
2. **Calculate rates as percentages** (0-100 scale, not decimals)
3. **Document benchmark sources** and dates
4. **De-identify:** No patient-level data, only aggregates
5. **Save as structured JSON or CSV**

### Example Data Format:

```json
{
  "qualityMetrics": {
    "revisionRate": 2.3,
    "readmissionRate30Day": 4.1,
    "avgLengthOfStay": 2.1,
    "benchmarkRevisionRate": 2.5,
    "benchmarkReadmission30": 5.2,
    "dataSource": "AJRR 2024 + Internal EMR",
    "lastUpdated": "2025-01-15"
  }
}
```

---

## 3. Revenue Cycle Data (RECOMMENDED)

**Update Frequency:** Monthly or Quarterly
**Data Collection Window:** Previous 12 months
**Owner:** Finance / Decision Support / Revenue Cycle Team

### What to Collect:

#### Case-Level Financial Data
- DRG code and description
- Payer type (Medicare, Medicaid, Commercial, Self-Pay)
- Total reimbursement per case
- Implant cost per case (from supply chain)
- Direct costs per case (OR time, nursing, supplies)

#### Aggregated Metrics
- Average reimbursement per case (by DRG, by payer)
- Average implant cost per case
- Average direct cost per case
- Contribution margin per case (reimbursement - implant cost - direct cost)
- Total revenue, costs, and margin

### How to Prepare:

1. **Export from decision support system** (e.g., Epic Cogito, Tableau, Strata)
2. **Link to supply chain data** via case ID or date
3. **Calculate contribution margin:**
   - `Contribution Margin = Reimbursement - Implant Cost - Direct Cost`
4. **Break down by DRG and payer**
5. **Remove PHI:** No patient identifiers
6. **Save as CSV or JSON**

### Example Data Format:

```csv
DRG_Code,DRG_Description,Cases,Avg_Reimbursement,Avg_Implant_Cost,Avg_Direct_Cost,Avg_Contribution_Margin
469,Total Hip Replacement,450,18500,6200,8500,3800
470,Total Knee Replacement,520,16800,5800,7900,3100
```

---

## 4. Workflow Tracking Data (REQUIRED)

**Update Frequency:** As Needed (Event-Driven)
**Data Collection Window:** Current project status
**Owner:** Project Manager / Strategic Sourcing Lead

### What to Track:

#### Current Workflow Stage
- Which stage: sourcing-review | decision | implementation | lookback | renewal
- Status: completed | active | upcoming
- Key dates (start, completion, scheduled)

#### Implementation Milestones (if in Implementation stage)
- Milestone name (e.g., "Contract Signing", "Surgeon Training")
- Completion status (true/false)
- Completion or expected date

#### Decision Documentation (if in Decision stage)
- Selected scenario ID (e.g., "dual-premium")
- Decision date
- Decision rationale/notes

### How to Prepare:

1. **Manually update** as project progresses
2. **Document key dates** accurately
3. **Update after major milestones**
4. **Save as JSON**

### Example Data Format:

```json
{
  "workflowTracking": {
    "currentStage": "implementation",
    "lastUpdated": "2025-01-20",
    "stages": {
      "decision": {
        "status": "completed",
        "decisionDate": "2024-09-15",
        "selectedScenario": "dual-premium",
        "notes": "Selected Zimmer + Stryker based on surgeon preference analysis"
      },
      "implementation": {
        "status": "active",
        "startDate": "2024-10-01",
        "expectedCompletion": "2025-03-31",
        "percentComplete": 45,
        "milestones": [
          {"name": "Contract signing", "completed": true, "date": "2024-10-05"},
          {"name": "Surgeon training", "completed": false, "expectedDate": "2025-02-15"}
        ]
      }
    }
  }
}
```

---

## 5. Surgeon & Hospital Data (REQUIRED)

**Update Frequency:** Semi-Annual or Annual
**Data Collection Window:** Current active roster
**Owner:** Medical Staff Office / Credentialing

### What to Collect:

#### Surgeon Directory
- Surgeon name and unique ID
- Primary hospital affiliation
- All hospital privileges (if practicing at multiple sites)
- Specialty (if multiple orthopedic specialties)

#### Hospital Directory
- Hospital name and unique ID
- Region or market
- Total case volume (from supply chain data)
- Surgeon count

### How to Prepare:

1. **Export from credentialing system**
2. **Cross-reference with supply chain data** to identify active surgeons
3. **Normalize hospital names** (consistent formatting)
4. **Create unique IDs** (e.g., "SMITH_JOHN_001")
5. **Save as CSV**

---

## Data Quality Checklist

Before submitting data, verify:

- [ ] **No PHI** - All patient identifiers removed
- [ ] **Consistent naming** - Vendors, hospitals, surgeons use same spelling
- [ ] **Unique IDs** - Every surgeon and hospital has a unique identifier
- [ ] **Date formats** - Use YYYY-MM-DD format
- [ ] **Dollar amounts** - In dollars, not millions (e.g., 1500000 not 1.5M)
- [ ] **Percentages** - As decimals for calculations (0.18 = 18%) OR as whole numbers where specified
- [ ] **Complete records** - No missing required fields
- [ ] **Data validation** - Totals reconcile (e.g., surgeon cases sum to total cases)

---

## Data Submission Process

1. **Collect data** according to schedules above
2. **Clean and validate** using checklist
3. **Use appropriate Claude prompt** (see separate prompt files)
4. **Generate JSON output**
5. **Validate JSON** (can use online JSON validator)
6. **Replace old file** in `public/` directory
7. **Test dashboard** to ensure data loads correctly
8. **Document changes** in version control

---

## Questions?

Contact your Strategic Sourcing lead or Value Analytics Hub administrator for:
- Access to source systems
- Training on data extraction
- Claude prompt usage
- JSON validation assistance
- Dashboard troubleshooting
