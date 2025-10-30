# Value Analytics Hub - Analyst Guide

**Version:** 2.0
**Last Updated:** October 2025
**Purpose:** Complete reference for data analysts working with the Value Analytics Hub

---

## Table of Contents

1. [What This Dashboard Does](#what-this-dashboard-does)
2. [Understanding the Data](#understanding-the-data)
3. [How Calculations Work](#how-calculations-work)
4. [Key Assumptions Explained](#key-assumptions-explained)
5. [What Data You Need](#what-data-you-need)
6. [Using the Dashboard Interface](#using-the-dashboard-interface)
7. [Metrics Reference](#metrics-reference)
8. [Data Quality Guidelines](#data-quality-guidelines)
9. [Common Issues & Solutions](#common-issues--solutions)

---

## What This Dashboard Does

The Value Analytics Hub helps healthcare systems make data-driven decisions about orthopedic vendor consolidation. Think of it as a decision support tool that answers three key questions:

1. **Where are we now?** Shows current vendor spending, surgeon preferences, and system-wide patterns
2. **What if we consolidate?** Models different consolidation scenarios (3 vendors, 2 vendors, 1 vendor) with projected savings and risks
3. **How's it going?** Tracks implementation progress and compares actual results to projections

### Who Uses This

- **Executives:** See system-wide impact, savings opportunities, and risk assessment
- **Surgeons:** Compare their practice patterns to peers, explore construct pricing options
- **Supply Chain:** Analyze vendor spend, component pricing, and consolidation opportunities
- **Project Managers:** Track implementation milestones and adoption rates

---

## Understanding the Data

### The Big Picture

The dashboard organizes data by **product line** (hip-knee, shoulder, spine, etc.). Each product line has its own data file that contains:

- **System totals:** Total cases, total spend, number of surgeons
- **Vendor information:** How much you spend with each vendor, which surgeons use them
- **Surgeon details:** Each surgeon's case volume, spending, and vendor preferences
- **Component pricing:** What different implant components cost from each vendor
- **Scenarios:** Different consolidation strategies with projected savings
- **Project status:** Where you are in the decision/implementation process

### How Data Files Are Structured

**File Location:** Data files live in `/public/data/` folder:
- `hip-knee-data.json` = Hip & Knee product line
- `shoulder-data.json` = Shoulder product line
- Future product lines will be added here

**Current Status:** The dashboard is using 100% synthetic data for demonstration. When you're ready to use real data, you'll replace these files with your actual system data.

### The Main Data Sections

#### 1. Metadata (The Summary)

This section contains your system-wide totals and should match your finance reports:

- **Total Cases:** Total annual surgical procedures (e.g., 72,856 cases)
- **Total Spend:** Total annual implant spending in actual dollars (e.g., $41,010,260)
- **Total Surgeons:** Number of active orthopedic surgeons (e.g., 443 surgeons)
- **Data Collection Date:** When this data snapshot was taken
- **Version:** Helps track which version of the data structure you're using

**Important:** These totals act as validation checks. The sum of all surgeon cases should equal your total cases. If they don't match, something's wrong with the data.

#### 2. Vendors

Lists each vendor you purchase from and their system-wide totals:

- **Total Spend:** How much you spent with this vendor annually (in dollars)
- **Total Quantity:** How many implant components you bought
- **Unique Surgeons:** How many surgeons used this vendor

**Example:** Vendor-Alpha might show $14.9M spend, 30,224 units, used by 217 surgeons.

This section helps you understand vendor concentration. If 80% of spend is with 2 vendors, you're already somewhat consolidated.

#### 3. Surgeons

This is the heart of the data. Each surgeon has:

- **Name/ID:** Unique identifier (can be anonymized like "SURG-0001" or real names)
- **Total Cases:** How many surgeries this surgeon performs annually
- **Total Spend:** Total implant costs for this surgeon's cases
- **Region/Facility:** Where they practice
- **Vendor Breakdown:** How their cases and spending split across vendors

**Example:** Dr. Smith performs 1,431 cases annually, spending $1.2M on implants. 95% of cases use Vendor-Gamma, 5% use Vendor-Beta.

This granular surgeon data enables peer comparison, risk assessment, and targeted engagement strategies.

#### 4. Components

Breaks down implant costs by specific component types:

- **Component Name:** Like "Femoral Hip Stems" or "Tibial Knee Components"
- **Vendor:** Which vendor supplies this component
- **Body Part:** Hip, Knee, or General
- **Quantity:** System-wide annual usage
- **Average Price:** Cost per unit

**Why This Matters:** Component-level data enables construct pricing analysis, showing what a complete single-vendor implant set would cost.

#### 5. Scenarios

Different consolidation strategies you might pursue:

- **Status Quo:** Keep all current vendors (baseline for comparison)
- **Tri-Vendor:** Consolidate to 3 preferred vendors
- **Dual-Vendor (Premium):** 2 vendors focusing on quality/innovation
- **Dual-Vendor (Value):** 2 vendors focusing on cost efficiency
- **Single-Vendor:** Maximum consolidation with one vendor

Each scenario includes:
- **Vendors List:** Which vendors are included
- **Annual Savings:** Projected cost reduction in dollars
- **Savings Percent:** Savings as % of baseline spend
- **Adoption Rate:** Expected surgeon participation (0-100%)
- **Risk Level:** Low, Medium, or High
- **Risk Score:** Calculated 0-10 scale based on volume-weighted surgeon impact

---

## How Calculations Work

### Understanding Risk Scores

The risk score answers: "How hard will it be to get surgeons to adopt this scenario?"

**The Method:**

We look at surgeons who would need to switch vendors in each scenario. Not all surgeons are equal—losing a high-volume surgeon is much riskier than losing a low-volume surgeon. Here's how we weight them:

- **High-volume surgeons** (>500 cases/year): Weighted 5x
  - Why: They have significant revenue impact and negotiating power
  - Example: A 600-case surgeon leaving would hurt more than 5 low-volume surgeons leaving

- **Medium-volume surgeons** (200-500 cases/year): Weighted 3x
  - Why: Solid contributors to volume and revenue
  - Example: Losing 3-4 of these surgeons would be noticeable

- **Low-volume surgeons** (<200 cases/year): Weighted 1x
  - Why: Smaller individual impact
  - Example: System can absorb turnover more easily

**Additional Risk Factors:**

- **Loyalists (90%+ single-vendor users):** These surgeons have strong vendor preferences. If their preferred vendor isn't in the scenario, they're much more likely to resist or leave.

- **Cases at Risk:** What percentage of your total case volume comes from surgeons who must switch?

**Risk Score Scale:**
- **0-3 = Low Risk:** Mostly affects low-volume surgeons, minimal loyalists impacted
- **4-6 = Medium Risk:** Some high-volume or many medium-volume surgeons affected
- **7-10 = High Risk:** Multiple high-volume surgeons or many loyalists must switch

**Real Example:**

A dual-vendor scenario might affect:
- 2 high-volume surgeons (×5 weight = 10 points)
- 8 medium-volume surgeons (×3 weight = 24 points)
- 15 low-volume surgeons (×1 weight = 15 points)
- Total of 49 points across 443 surgeons
- Plus 5 loyalists affected adds 3 more points
- Plus 18% of cases at risk adds 0.36 points
- **Final Risk Score: 4.2 (Medium Risk)**

### Construct Pricing Explained

Construct pricing shows what it would cost if all implant components for one procedure came from the same vendor.

**Why This Matters:** Vendors often offer better pricing when you use their complete system rather than mixing components from multiple vendors. This analysis helps you see true apples-to-apples pricing.

**How It Works:**

For Hip Replacement:
- Femoral stem from Vendor-Alpha: $1,296
- Femoral head from Vendor-Alpha: $1,203
- Acetabular cup from Vendor-Alpha: $975
- Hip liner from Vendor-Alpha: $1,369
- **Total Hip Construct: $4,843**

For Knee Replacement:
- Femoral component from Vendor-Alpha: $798
- Tibial component from Vendor-Alpha: $2,397
- Patellar component from Vendor-Alpha: $729
- **Total Knee Construct: $3,924**

**Average Construct Cost:** (Hip + Knee) ÷ 2 = $4,384

The dashboard shows this for every vendor, ranked from lowest to highest cost. If your current vendor charges $4,800 average construct and the lowest is $4,200, you could save $600 per case. Multiply by 1,400 annual cases = $840,000 annual savings potential.

### Savings Calculations

**Projected Annual Savings:**

Method 1 - Percentage-Based:
If a scenario shows 12% savings and your baseline spend is $41M, then:
Annual Savings = $41M × 0.12 = $4.92M

Method 2 - Component-Level:
Calculate savings for each component that would switch vendors, summing the price differences times quantities purchased.

**Adoption-Adjusted Savings:**

Projected savings assume 100% participation. But what if only 88% of surgeons adopt?

Adjusted Savings = $4.92M × 0.88 = $4.33M

This is your more realistic savings estimate.

**Net Present Value (NPV):**

NPV accounts for the time value of money and implementation costs. If you spend $1.5M to implement and save $4.33M annually for 5 years, with a 5% discount rate:

Year 1 savings: $4.33M ÷ 1.05 = $4.12M
Year 2 savings: $4.33M ÷ 1.05² = $3.93M
Year 3 savings: $4.33M ÷ 1.05³ = $3.74M
Year 4 savings: $4.33M ÷ 1.05⁴ = $3.56M
Year 5 savings: $4.33M ÷ 1.05⁵ = $3.39M

Total 5-year value: $18.74M
Minus implementation cost: -$1.5M
**NPV: $17.24M**

### How Savings Rates Are Estimated

**The Question:** How do we arrive at savings percentages like 8%, 10%, or 18% for different scenarios?

**The Answer:** Savings estimates combine multiple factors based on vendor consolidation strategy:

**1. Volume Leverage (40-50% of savings)**
- **Logic:** More volume with fewer vendors = better pricing
- **Example:** If you consolidate from 5 vendors to 2 vendors, each of those 2 vendors sees 2-3x more volume
- **Typical impact:** 5-10% price reduction from volume aggregation alone

**2. Price Optimization (30-40% of savings)**
- **Logic:** Moving cases from expensive vendors to lower-cost vendors
- **Example:** Current average construct cost is $4,600. Target vendor average is $4,100. That's an 11% reduction.
- **Method:** Calculate the weighted average price difference for components that would switch vendors
- **Typical impact:** 3-8% depending on current vs. target vendor mix

**3. Administrative Efficiency (5-15% of savings)**
- **Logic:** Fewer vendors = lower administrative burden
- **Example:** Reduced contract management, fewer invoices to process, simpler inventory management
- **Typical impact:** 2-4% of total spend

**4. Inventory Optimization (5-10% of savings)**
- **Logic:** Fewer product lines = better inventory turns and reduced waste
- **Example:** Less expired inventory, better consignment terms, reduced safety stock
- **Typical impact:** 1-3% of total spend

**Real Scenario Examples:**

**Two-Vendor Premium Strategy (18% savings):**
- Moving from 17 vendors to 2 premium vendors
- High volume leverage: 10% (concentrating 72,000 cases into 2 vendors)
- Good price optimization: 5% (selecting lower-cost premium vendors)
- Administrative efficiency: 2%
- Inventory optimization: 1%
- **Total: 18%**

**Two-Vendor Value Strategy (10% savings):**
- Moving from 17 vendors to 2 value-focused vendors
- Moderate volume leverage: 6% (same consolidation, but value vendors have less pricing flexibility)
- Moderate price optimization: 2% (value vendors already near floor pricing)
- Administrative efficiency: 1.5%
- Inventory optimization: 0.5%
- **Total: 10%**

**Construct Price Cap (8% savings):**
- Setting maximum construct prices (Hip: $4,500, Knee: $3,800)
- Price cap enforcement: 6% (based on gap between current average and cap levels)
- Volume commitment leverage: 1.5% (vendors accept caps in exchange for volume guarantees)
- Administrative overhead: 0.5%
- **Total: 8%**

**Component Price Cap (10% savings):**
- Setting maximum prices for individual components
- Component-level enforcement: 7% (finer control enables tighter caps)
- GPO leverage: 2% (using group purchasing organization benchmarks)
- Vendor competition: 1% (all vendors compete to meet caps)
- **Total: 10%**

**Important Notes:**
- These percentages are estimates based on industry benchmarks and synthetic data
- Actual savings vary significantly by:
  - Current pricing vs. market benchmarks (use ECRI data to validate)
  - Negotiating leverage and skill
  - Surgeon adoption rates
  - Contract terms and implementation effectiveness
- Always model conservative, expected, and optimistic scenarios (±15% range)

### Price Cap Strategies Explained

**What Are Price Caps?**

Price caps set maximum allowable prices for implant components or complete constructs. Any vendor can participate, but must meet the price cap requirements.

**Two Approaches:**

**1. Construct Price Cap**
- **Definition:** Maximum price for a complete hip or knee implant set
- **Example caps:**
  - Hip construct: $4,500 maximum (all components included)
  - Knee construct: $3,800 maximum (all components included)
- **How it works:** Vendors bid to supply complete constructs at or below these caps. Multiple vendors can participate if they meet the caps.
- **Pros:** Simple to enforce, easy for surgeons to understand, maintains vendor choice
- **Cons:** Less granular control, may disadvantage premium components even when clinically justified

**2. Component Price Cap**
- **Definition:** Maximum prices for individual components
- **Example caps:**
  - Femoral stem: $1,200 max
  - Acetabular cup: $1,100 max
  - Femoral head: $950 max
  - Liner: $1,000 max
- **How it works:** Vendors must price each component at or below the cap. Surgeons can mix-and-match components from multiple vendors.
- **Pros:** More precise control, allows surgeons to select best component for each patient
- **Cons:** More complex to manage, requires detailed component catalog

**How Caps Are Set:**
1. Benchmark against ECRI pricing data (national averages)
2. Identify 25th-50th percentile pricing (achievable with good negotiation)
3. Set caps 5-10% below current average to drive savings
4. Validate that at least 3-4 vendors can meet caps (ensures competition)

**Enforcement:**
- Contract terms require compliance
- Volume guarantees incentivize participation ("Meet these caps and we'll give you 60% of our volume")
- Regular auditing to ensure vendors honor caps

### Robotic Platform Alignment and Stranded Cases

**What Is This?**

Many health systems have invested millions in robotic surgery platforms (e.g., Mako, ROSA, NAVIO). These robots are often tied to specific implant vendors.

**The Problem:**

If you consolidate to vendors who don't support your robotic platforms, you "strand" your robotic surgery investment—the robots become unusable.

**Example:**
- Your system invested $2M in Mako robots (Stryker platform)
- You currently perform 2,400 robotic cases/year using Stryker implants
- You're considering a two-vendor strategy with Zimmer + Smith & Nephew
- **Result:** 2,400 robotic cases become "stranded"—you can't use the robots with Zimmer or S&N implants

**Impact on Risk Score:**

Stranded robotic cases significantly increase adoption risk:
- **< 70% alignment (>30% stranded):** +2.0 risk points (critical issue)
- **70-80% alignment:** +1.5 risk points (high impact)
- **80-90% alignment:** +0.5 risk points (moderate impact)
- **> 90% alignment:** No penalty (minimal impact)

**Why This Matters:**
1. **Sunk cost:** You've already paid for the robots; not using them wastes that investment
2. **Surgeon resistance:** Surgeons trained on robotics prefer to keep using them
3. **Clinical outcomes:** Some surgeons achieve better outcomes with robotic assistance
4. **Marketing:** Robotics programs attract patients and referring providers

**Dashboard Display:**

In the scenario comparison table, you'll see:
- **Alignment Score:** % of robotic cases compatible with scenario vendors (e.g., "78.5%")
- **Compatible Cases:** How many robotic cases can continue (e.g., "1,885 / 2,400 cases")
- **Stranded Cases:** How many robotic cases become incompatible (e.g., "515 stranded ℹ️")

Hover over "stranded ℹ️" to see the full explanation.

**Strategies to Address:**
1. **Include robot-compatible vendors** in your consolidation plan
2. **Phase out robots** over time if consolidation savings justify it
3. **Negotiate cross-platform compatibility** (some vendors offer adapter kits)
4. **Reserve robots for specific cases** where clinical benefit is highest

### Peer Benchmarking

**Spend Efficiency Score:**

Compares a surgeon's cost per case to the median of all peers.

Example:
- Dr. Smith: $860 per case
- Peer median: $920 per case
- Efficiency = ($920 - $860) ÷ $920 = 6.5% more efficient than peers

A positive score means the surgeon is more cost-efficient than average. A negative score means less efficient.

---

## Key Assumptions Explained

### Why We Make Assumptions

Real-world outcomes depend on factors we can't perfectly predict (surgeon behavior, contract negotiations, market changes). Assumptions help us model likely outcomes while being transparent about uncertainty.

### Critical Assumptions to Understand

#### 1. Case Volumes Stay Stable

**Assumption:** Next year's case volumes will be similar to this year's.

**Why It Matters:** If a high-volume surgeon leaves because we eliminated their preferred vendor, we lose both that surgeon's cases AND the revenue. Projections assume surgeons stay.

**Reality Check:** Look at your 3-year trend. If volumes have been growing 5% annually, adjust projections accordingly.

#### 2. Vendor Pricing Represents Contract Rates

**Assumption:** The average prices in the data reflect your actual negotiated contracts.

**Why It Matters:** If actual prices vary by 10-15% from averages, savings calculations will be off by that amount.

**Validation:** Compare component prices in the data file to your current contracts. Flag any discrepancies >10%.

#### 3. Surgeon Loyalty Threshold

**Assumption:** Surgeons using one vendor >90% of the time have strong loyalty.

**Why It Matters:** These surgeons are most likely to resist change or leave if forced to switch.

**Flexibility:** This threshold (90%) can be adjusted to 80% or 95% based on your experience with surgeon engagement.

#### 4. Volume-Weighted Risk Factors

**Assumption:** A high-volume surgeon (>500 cases) is 5x more impactful than a low-volume surgeon (<200 cases).

**Why It Matters:** Drives the risk score calculation and should reflect your system's reality.

**Adjustment:** If your system is more academic (harder to replace high-volume surgeons), increase the weight. If community-based (more fungible), decrease it.

#### 5. Adoption Rates by Scenario

**Assumption:** More vendors = higher adoption.

Typical adoption rates:
- Status Quo (no change): 100%
- Tri-Vendor (3 vendors): 92-95%
- Dual-Vendor (2 vendors): 85-92%
- Single-Vendor (1 vendor): 75-85%

**Why It Matters:** A 10-point drop in adoption can reduce savings by $500K-$1M in a typical system.

**Customization:** Adjust based on your culture. Strong surgeon engagement and buy-in can achieve higher rates. Poor relationships or past failed initiatives might require lower rates.

#### 6. Clinical Quality Equivalence

**Assumption:** Major vendors (Stryker, Zimmer, J&J, Smith & Nephew) produce clinically equivalent outcomes.

**Evidence:** American Joint Replacement Registry (AJRR) shows revision rates within 0.5% across major vendors at 2 years post-op.

**Why It Matters:** Justifies vendor consolidation from a clinical standpoint. Surgeons can switch vendors without compromising patient outcomes.

**Important Note:** Surgeon training and technique matter more than implant brand. A well-trained surgeon using their less-preferred vendor will still have good outcomes.

#### 7. Implementation Timeline

**Assumption:** Full savings realized within 12-18 months.

**Reality:**
- Months 0-3: Contract signed, immediate pricing changes
- Months 3-12: Surgeon training, gradual adoption ramp-up
- Months 12-18: Full run-rate savings achieved

**Why It Matters:** Affects NPV calculations and when you can count on the savings hitting your budget.

---

## What Data You Need

### Absolute Minimum (Required)

To get the dashboard functioning, you must have:

**System Totals:**
- Total annual case volume (e.g., 72,856 cases)
- Total annual implant spend (e.g., $41,010,260)
- Number of active surgeons (e.g., 443 surgeons)

**Vendor Summary:**
- List of all vendors you purchase from
- Annual spend with each vendor
- Annual quantity purchased from each vendor
- Number of surgeons using each vendor

**Surgeon Details:**
- Unique identifier for each surgeon (can be anonymized)
- Annual case volume per surgeon
- Annual implant spend per surgeon
- Breakdown showing which vendors each surgeon uses and how much

**At Least One Scenario:**
- Status quo (current state) scenario
- At least one consolidation scenario showing:
  - Which vendors would be included
  - Expected savings (either as a dollar amount or percentage)

### Strongly Recommended

These aren't required for the dashboard to work, but significantly enhance its value:

**Component-Level Pricing:**
- Specific implant components (femoral stems, acetabular cups, etc.)
- Which vendor supplies each component
- Average price per component
- Annual usage volume

**Benefit:** Enables construct pricing analysis, showing true vendor cost comparisons.

**Geographic Data:**
- Which region each surgeon practices in
- Which facility/hospital each surgeon works at

**Benefit:** Enables geographic analysis and regional consolidation strategies.

**Quality Metrics:**
- Revision rates (% requiring additional surgery)
- 30-day and 90-day readmission rates
- Length of stay averages
- Complication rates

**Benefit:** Demonstrates clinical safety of consolidation decisions.

**Multiple Scenarios:**
- Tri-vendor strategy
- Dual-vendor options (premium vs. value focused)
- Single-vendor option (if applicable)

**Benefit:** Gives leadership multiple options to evaluate and choose from.

### Data You Don't Need

**Protected Health Information (PHI):**
- Never include patient names, medical record numbers, or dates of birth
- Surgeon names can be de-identified if preferred (SURG-0001, SURG-0002, etc.)

**Granular Transaction Data:**
- Individual purchase orders or invoices
- Case-by-case detail

**Note:** The dashboard works with aggregated annual data. You sum everything up before loading it.

### Data Quality Requirements

**1. Consistent Naming**

Bad:
- "Zimmer", "ZIMMER", "Zimmer Biomet", "ZB"

Good:
- "ZIMMER BIOMET" (pick one format and stick with it)

**2. Totals Must Reconcile**

If your metadata says 72,856 total cases, the sum of all surgeon cases should equal 72,856 (within 1% tolerance for rounding).

**3. No PHI**

Remove all patient identifiers. This data is for system-level decision-making, not patient care.

**4. Units Consistency**

- Dollar amounts: Always in actual dollars (41010260, not 41.01M)
- Dates: Always YYYY-MM-DD format (2025-10-30)
- Percentages: Store as decimals for calculations (0.18 = 18%)

**5. Valid Vendor References**

If a surgeon uses "VENDOR-ALPHA", that vendor must exist in the vendors list. Misspellings break the analysis.

---

## Using the Dashboard Interface

### Navigation and Key Features

**Scenario Comparison Table:**

The Executive Dashboard features a comprehensive scenario comparison table that shows all consolidation strategies side-by-side. This table is the primary decision-making tool.

**The "Analyze" Button:**

Each scenario column has an **Analyze** button at the bottom. When clicked, this button:

1. **Selects that scenario** as the active focus
2. **Navigates to the Overview tab** showing detailed analysis
3. **Displays:**
   - Detailed surgeon impact analysis (which surgeons would need to switch)
   - Vendor split breakdown (volume and spend allocation)
   - Implementation timeline with milestones
   - Risk factors and mitigation strategies
   - Financial projections with NPV calculations
   - Quality and clinical considerations

**How to Use It:**
- Review all scenarios in the comparison table first
- Identify 2-3 promising scenarios based on savings vs. risk
- Click **Analyze** on each to dive into the details
- Compare the detailed views to make your final decision
- Share the detailed analysis with stakeholders

**Key Definitions Box:**

Below the scenario comparison table, you'll find a reference box with:
- **Component price caps:** Specific dollar amounts for each implant component
- **Construct price caps:** Maximum prices for complete hip and knee implant sets
- **Surgeon classifications:** Definitions of high/medium/low volume and loyalists
- **Risk level definitions:** What each risk level (LOW, MEDIUM, MED-HIGH, HIGH) means

These definitions help you interpret the metrics shown in the table above.

**Tooltips and Hover Information:**

Throughout the dashboard, hover your cursor over:
- **"stranded ℹ️":** Explains what stranded robotic cases mean
- **Scenario names:** Shows full scenario description
- **Metrics:** Provides calculation details
- **Risk scores:** Breaks down the risk components

**Filtering and Sorting:**

- **Product Line Selector:** Switch between Hip-Knee, Shoulder, and other product lines
- **Scenario filters:** Hide/show specific scenarios based on your criteria
- **Surgeon filters:** Filter by volume, vendor preference, or facility

---

## Metrics Reference

### System-Level Metrics

**Total Cases**
- Definition: Total annual surgical procedures across all surgeons
- Use: Baseline for volume projections and market share analysis
- Example: 72,856 cases

**Total Spend**
- Definition: Total annual implant expenditure across all surgeons
- Use: Baseline for savings calculations
- Example: $41,010,260

**Average Cost Per Case**
- Definition: Total spend divided by total cases
- Calculation: $41,010,260 ÷ 72,856 = $563 per case
- Use: High-level efficiency metric, good for executive summaries

**Vendor Concentration**
- Definition: Percentage of spend with top vendor(s)
- Example: If top vendor represents $15M of $41M spend = 36.6% concentration
- Use: Shows current consolidation level; higher = already consolidated

**Active Vendors**
- Definition: Number of vendors currently purchased from
- Use: Starting point for consolidation; dropping from 25 to 3 vendors is dramatic

### Surgeon-Level Metrics

**Annual Volume**
- Definition: Number of cases a surgeon performs per year
- Categories: High (>500), Medium (200-500), Low (<200)
- Use: Risk weighting and recruitment impact assessment

**Cost Per Case**
- Definition: Surgeon's annual implant spend ÷ their case volume
- Example: $1,231,506 ÷ 1,431 cases = $860 per case
- Use: Identify efficiency outliers (high or low cost)

**Primary Vendor**
- Definition: Vendor the surgeon uses most frequently
- Calculation: Vendor with highest case count for that surgeon
- Use: Determines if surgeon must switch vendors in each scenario

**Vendor Loyalty**
- Definition: Percentage of cases using primary vendor
- Example: 1,360 cases with Vendor-Gamma ÷ 1,431 total cases = 95% loyalty
- Use: Identifies surgeons most resistant to change

**Vendor Diversity**
- Definition: Number of different vendors a surgeon uses
- Example: Uses 3 vendors (Gamma 95%, Beta 4%, Alpha 1%)
- Use: Low diversity suggests strong preference; high diversity suggests flexibility

### Scenario Metrics

**Projected Annual Savings**
- Definition: Expected cost reduction if scenario is adopted
- Units: Dollars per year
- Example: $5,049,681 annual savings
- Use: Primary financial metric for decision-making

**Savings Percentage**
- Definition: Savings as percent of baseline spend
- Calculation: $5,049,681 ÷ $41,010,260 = 12.3%
- Use: Normalizes savings for comparison across product lines

**Adoption Rate**
- Definition: Expected percentage of surgeons who will participate
- Range: 0% to 100% (expressed as 0.75 to 1.0 in data)
- Example: 88% adoption rate
- Use: Reality check on savings; 88% adoption = only 88% of savings realized

**Risk Score**
- Definition: Volume-weighted measure of adoption difficulty
- Range: 0-10 scale
- Categories: 0-3 Low, 4-6 Medium, 7-10 High
- Use: Flags scenarios requiring intensive change management

**Surgeons Affected**
- Definition: Number of surgeons who must switch vendors
- Example: 45 surgeons out of 443 total
- Use: Size of engagement/training effort required

**Cases at Risk**
- Definition: Annual case volume from affected surgeons
- Example: 12,500 cases out of 72,856 total (17%)
- Use: Revenue risk if surgeons leave rather than adopt

**Net Present Value (NPV)**
- Definition: 5-year present value of savings minus implementation costs
- Units: Millions of dollars
- Example: $17.2M over 5 years
- Use: ROI metric that accounts for time value of money

---

## Data Quality Guidelines

### Before You Submit Data

Run through this checklist every time you prepare data for the dashboard:

**1. PHI Check**
- [ ] No patient names, MRNs, or dates of birth
- [ ] Surgeon names are either approved for use or anonymized
- [ ] No identifiable facility information if anonymization is required

**2. Naming Consistency**
- [ ] All vendor names spelled identically throughout file
- [ ] All facility names spelled identically throughout file
- [ ] Component categories follow consistent naming convention

**3. Mathematical Reconciliation**
- [ ] Sum of surgeon cases ≈ metadata total cases (within 1%)
- [ ] Sum of surgeon spend ≈ metadata total spend (within 1%)
- [ ] Sum of vendor spend ≈ metadata total spend (within 1%)
- [ ] Each surgeon's vendor spend sums to their total spend
- [ ] Each surgeon's vendor cases sum to their total cases

**4. Unit Consistency**
- [ ] All dollar amounts in actual dollars, not millions
- [ ] All dates in YYYY-MM-DD format
- [ ] No negative numbers where inappropriate (cases, spend)
- [ ] Percentages stored as decimals (0.18) not whole numbers (18) in calculations

**5. Referential Integrity**
- [ ] Every surgeon's vendor exists in the global vendors list
- [ ] Every component's vendor exists in the global vendors list
- [ ] Every scenario's vendors exist in the global vendors list
- [ ] No "orphan" references to vendors that don't exist

**6. Completeness**
- [ ] All required fields present (see "What Data You Need" section)
- [ ] No empty or null values for required fields
- [ ] At least one scenario defined (status quo at minimum)

**7. Reasonableness Checks**
- [ ] Average cost per case between $200-$1,500 (typical range)
- [ ] No surgeon has >2,000 cases/year (would be unusual)
- [ ] No component costs >$10,000 (flag for review if so)
- [ ] Savings percentages between 0-25% (higher needs explanation)

### Common Data Quality Issues

**Issue: Totals Don't Match**

Symptom: Metadata says 72,856 cases but surgeons sum to 68,420 cases.

Causes:
- Missing surgeons in the data file
- Included non-orthopedic cases in total
- Counted some cases twice

Fix: Recalculate totals. Either add missing surgeons or adjust metadata to match actual sum.

**Issue: Vendor Name Mismatches**

Symptom: Surgeon uses "Zimmer" but vendors list has "ZIMMER BIOMET".

Causes:
- Inconsistent data entry
- Different source systems using different names
- Typos or abbreviations

Fix: Standardize all vendor names. Pick one official name (usually full legal name) and find-and-replace all variants.

**Issue: Construct Pricing Shows Gaps**

Symptom: Some vendors show hip prices but no knee prices.

Causes:
- That vendor doesn't make knee components (possible)
- Component data incomplete (more likely)
- Component categorization wrong (bodyPart field incorrect)

Fix: Verify with procurement team whether vendor actually makes those components. If yes, add missing data. If no, this is expected.

**Issue: Risk Score Seems Wrong**

Symptom: Scenario marked "Low Risk" but affects 5 high-volume surgeons.

Causes:
- Risk thresholds don't match your system
- Volume categories misconfigured
- Calculation error

Fix: Review risk calculation assumptions. Adjust volume thresholds (currently 500+ high, 200-500 medium) to match your system's reality.

**Issue: Savings Look Too High**

Symptom: Scenario shows 25% savings which seems unrealistic.

Causes:
- Data error (wrong prices or volumes)
- Overly optimistic assumptions
- Comparing to inflated baseline

Fix: Manually verify a few component price differences. If a $1,500 component would drop to $1,000, that's 33% savings on that component. Aggregate across all components to see if 25% is feasible.

---

## Common Issues & Solutions

### Dashboard Shows "No Data Available"

**What's Wrong:** The dashboard can't find or load your data file.

**Troubleshooting Steps:**

1. Check the file exists:
   - Open the project folder
   - Navigate to `/public/data/`
   - Verify `hip-knee-data.json` (or relevant file) is there

2. Validate JSON syntax:
   - Open the file in a text editor
   - Copy all contents
   - Paste into jsonlint.com to check for syntax errors
   - Common errors: missing comma, extra comma, unclosed bracket

3. Check browser console:
   - Open the dashboard in browser
   - Press F12 to open Developer Tools
   - Click Console tab
   - Look for red error messages indicating what went wrong

**Common Fixes:**
- Missing comma between fields → Add comma
- File in wrong location → Move to `/public/data/` folder
- File named incorrectly → Rename to match expected name

### Numbers Look Completely Wrong

**What's Wrong:** Calculations appear incorrect or nonsensical.

**Troubleshooting Steps:**

1. Check unit mismatch:
   - Is spend showing as $41 instead of $41M?
   - Fix: Change values to actual dollars (41010260) not millions (41.01)

2. Verify source data:
   - Pick one surgeon randomly
   - Manually add up their vendor spend
   - Does it equal their total spend in the file?
   - If not, data error in source

3. Check percentages:
   - Are savings showing as 0.12% instead of 12%?
   - Fix: In calculations, 0.12 = 12%; in display strings, show "12%"

**Common Fixes:**
- Convert millions to dollars: 41.01 → 41010260
- Fix percentage: Change display from 0.12 to 12
- Recalculate totals from source invoices

### Scenarios Don't Show Savings

**What's Wrong:** All scenarios show $0 savings or missing savings data.

**Troubleshooting Steps:**

1. Check scenario configuration:
   - Open data file
   - Find "scenarios" section
   - Verify each scenario has either "annualSavings" OR "savingsPercent"
   - If both missing, add one

2. Verify vendor lists:
   - Does each scenario list which vendors are included?
   - Do those vendor names match exactly the vendors in "vendors" section?

**Common Fixes:**
- Add savings values to each scenario
- Fix vendor name mismatches (case-sensitive!)
- Ensure status-quo scenario shows $0 savings (baseline)

### Construct Pricing Tab Is Empty

**What's Wrong:** The construct pricing feature shows no data.

**Troubleshooting Steps:**

1. Check if components exist:
   - Open data file
   - Look for "components" array
   - If missing, construct pricing won't work (this is optional feature)

2. Check bodyPart field:
   - Components should have bodyPart: "Hip", "Knee", or "General"
   - If blank or wrong, categorization fails

3. Verify vendor names:
   - Component vendors must match surgeon vendors exactly
   - "Vendor-Alpha" ≠ "VENDOR-ALPHA" (case sensitive)

**Common Fixes:**
- Add components array with sample data to enable feature
- Standardize bodyPart values to "Hip", "Knee", or "General"
- Fix vendor name capitalization mismatches

### Peer Comparisons Show Everyone as Average

**What's Wrong:** No surgeons appear as outliers; all show similar efficiency.

**Possible Reasons:**

1. Real pattern: Your surgeons actually are similar (this happens)

2. Data limitation: If all surgeons use same vendors at same prices, there won't be much variation

3. Missing cost drivers: If you're not capturing premium vs. standard implants, costs will look artificially similar

**What To Do:**
- This might be accurate; confirm with supply chain team
- Consider adding component-level detail to capture pricing variation
- Look at case complexity—are you comparing complex revisions to simple primaries?

### Risk Scores Seem Backwards

**What's Wrong:** A scenario marked "High Risk" seems easier than one marked "Low Risk".

**Possible Causes:**

1. Volume thresholds don't match your reality
   - Current: High = >500 cases, Medium = 200-500, Low = <200
   - Your system might be different

2. Loyalty threshold too strict
   - Current: 90%+ single-vendor = loyalist
   - Adjust to 80% or 95% based on your experience

3. Weighting doesn't match your priorities
   - Current: High-volume = 5x weight
   - Academic systems might need 7-8x; community might need 3-4x

**How To Fix:**

The risk calculation lives in the code, but you can request adjustments to:
- Volume category thresholds
- Loyalty percentage cutoff
- Weighting factors for different volume surgeons

Discuss with your analytics team what makes sense for your system.

---

## Getting Help

### Internal Resources

**For Data Questions:**
- Supply Chain Team: Vendor spend, purchase orders, contract pricing
- Quality Department: Clinical outcomes, readmission rates, complication data
- Finance: Revenue cycle data, contribution margins, reimbursement
- Medical Staff Office: Surgeon roster, credentialing, hospital affiliations

**For Technical Issues:**
- IT Department: File access, server issues, browser problems
- Analytics Team: Data validation, calculation questions, metric interpretation

**For Strategic Questions:**
- Strategic Sourcing Lead: Vendor consolidation strategy, negotiation approach
- Value Analysis Committee: Clinical decision-making, surgeon engagement
- Executive Leadership: Final decision authority, budget approval

### Documentation

**This Guide:** Comprehensive reference for data structure and calculations

**Other Available Documentation:**
- DATA_ARCHITECTURE.md: Technical schema deep-dive
- DATA_COLLECTION_GUIDE.md: What data to collect from which systems
- DATA_MANAGEMENT_OVERVIEW.md: How to update data regularly

### External Benchmarks

**Note:** These external benchmarks are not integrated into the dashboard but serve as useful references for validating your data and supporting strategic assumptions.

**AJRR (American Joint Replacement Registry):**
- **Use for:** Validating clinical quality assumptions (e.g., "vendor outcomes are equivalent")
- **Provides:** Clinical outcomes data, revision rates by implant, national benchmarks
- **Website:** aaos.org/registries/ajrr
- **Example:** Verify that major vendors show <0.5% difference in revision rates

**ECRI (Emergency Care Research Institute):**
- **Use for:** Validating pricing assumptions and component costs
- **Provides:** Healthcare supply chain benchmarking, price comparisons, clinical effectiveness reviews
- **Website:** ecri.org
- **Example:** Check if your component prices align with national averages

**Premier Inc.:**
- **Use for:** Benchmarking system-wide spend and identifying savings opportunities
- **Provides:** Group purchasing data, quality benchmarks, cost analytics
- **Website:** premierinc.com
- **Example:** Compare your spend per case to similar-sized health systems

**NSQIP (National Surgical Quality Improvement Program):**
- **Use for:** Quality metrics and surgical outcomes validation
- **Provides:** Surgical quality metrics, risk-adjusted outcomes, complication rates
- **Website:** facs.org/nsqip
- **Example:** Verify readmission and complication rates are within normal ranges

---

## Quick Reference

### Metric Quick Lookup

| Metric | Normal Range | Red Flag |
|--------|--------------|----------|
| Cost per case | $400-$800 | >$1,000 or <$300 |
| Vendor concentration | 60-80% | >90% (too concentrated) or <40% (too fragmented) |
| Surgeon loyalty | 70-90% | >95% (very resistant to change) |
| Risk score | 2-5 | >7 (high risk, proceed cautiously) |
| Adoption rate | 85-95% | <75% (savings won't materialize) |
| Savings % | 8-15% | >20% (verify data, seems high) |

### Data File Checklist

✅ Required:
- Metadata with totals
- Vendors list
- Surgeons with cases and spend
- At least one scenario

⭐ Recommended:
- Components for construct pricing
- Regions/facilities for geographic analysis
- Multiple scenarios for comparison

❌ Never Include:
- Patient names or identifiers
- Detailed transaction records
- Raw invoice data

### Common Calculations

**Cost per case:**
Total spend ÷ Total cases

**Vendor loyalty:**
Primary vendor cases ÷ Total cases

**Savings percentage:**
Annual savings ÷ Baseline spend

**Risk score:**
Volume-weighted affected surgeons + Loyalists factor + Cases at risk %

**Efficiency vs peers:**
(Peer median cost - Your cost) ÷ Peer median cost

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | Oct 2025 | Rewrote for plain-text narrative style; removed heavy JSON/code formatting |
| 1.5 | Oct 2025 | Added construct pricing explanations |
| 1.0 | Oct 2025 | Initial consolidated analyst guide |

---

**Questions or Issues?**

Contact your Strategic Sourcing Lead or Value Analytics Administrator for support with this dashboard.
