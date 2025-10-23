# Data Management Overview - Value Analytics Hub

**Purpose:** Master guide for managing data in the Value Analytics Hub dashboard

---

## Quick Reference

| What do you need to do? | Which document? | How often? |
|-------------------------|-----------------|------------|
| Understand what data to collect | [DATA_COLLECTION_GUIDE.md](DATA_COLLECTION_GUIDE.md) | Reference as needed |
| Create new product line from scratch | [ORTHOPEDIC_DATA_STANDARDIZATION_PROMPT.md](ORTHOPEDIC_DATA_STANDARDIZATION_PROMPT.md) | Once per product line |
| Update supply chain/vendor data | [PROMPT_SUPPLY_CHAIN_UPDATE.md](PROMPT_SUPPLY_CHAIN_UPDATE.md) | Monthly or Quarterly |
| Update quality/outcomes data | [PROMPT_QUALITY_UPDATE.md](PROMPT_QUALITY_UPDATE.md) | Quarterly |
| Update workflow/project status | [PROMPT_WORKFLOW_UPDATE.md](PROMPT_WORKFLOW_UPDATE.md) | As needed |

---

## Document Library

### 1. DATA_COLLECTION_GUIDE.md
**For:** Data analysts, supply chain team, quality team, finance team
**Purpose:** Explains what data to collect from which systems
**Includes:**
- Data source mapping (which system has which data)
- Update frequency schedules
- Data quality checklist
- Sample data formats
- Submission process

### 2. ORTHOPEDIC_DATA_STANDARDIZATION_PROMPT.md
**For:** Initial setup or creating new product line
**Purpose:** Complete baseline data generation from scratch
**Use when:**
- Starting a new product line (e.g., adding "Spine" to existing Hip/Knee/Shoulder)
- Completely rebuilding data file
- Migrating from different data structure

**Generates:** Complete JSON with all sections populated

### 3. PROMPT_SUPPLY_CHAIN_UPDATE.md
**For:** Monthly/quarterly supply chain data updates
**Purpose:** Update vendor spend, surgeon usage, component pricing
**Use when:**
- New month/quarter of vendor invoices available
- Surgeon roster changes (new hires, departures)
- Contract pricing changes
- Need to refresh case volumes and spend totals

**Updates only:** Supply chain sections, preserves quality/revenue/workflow data

### 4. PROMPT_QUALITY_UPDATE.md
**For:** Quarterly quality metrics updates
**Purpose:** Update clinical outcomes and quality benchmarks
**Use when:**
- Quarterly quality reports available
- New registry data released (e.g., AJRR annual report)
- Quality improvement initiative results available
- Want to add vendor-level quality analysis

**Updates only:** Quality metrics section, preserves supply chain/revenue/workflow data

### 5. PROMPT_WORKFLOW_UPDATE.md
**For:** Project manager, strategic sourcing lead
**Purpose:** Track sourcing lifecycle stage and milestones
**Use when:**
- Moving to next workflow stage (e.g., Decision → Implementation)
- Updating implementation milestones
- Completing lookback analysis
- Scheduling contract renewal review

**Updates only:** Workflow tracking section, preserves all other data

---

## Data Update Workflow

### Monthly Update (Supply Chain Team)

```
1. Extract vendor invoices, surgeon usage from procurement system
2. Clean and validate data (remove PHI, normalize names)
3. Use PROMPT_SUPPLY_CHAIN_UPDATE.md with Claude
4. Generate updated JSON
5. Validate JSON structure
6. Test in dashboard
7. Replace production file
8. Document changes in version control
```

**Time estimate:** 2-3 hours per month

### Quarterly Update (Quality Team)

```
1. Pull quality metrics from EMR/registry
2. Update benchmarks if available
3. Use PROMPT_QUALITY_UPDATE.md with Claude
4. Generate updated JSON
5. Validate quality metrics are reasonable
6. Test in dashboard
7. Replace production file (or merge with supply chain update)
8. Document changes
```

**Time estimate:** 1-2 hours per quarter

### As-Needed Update (Project Manager)

```
1. Document workflow changes (stage progression, milestones)
2. Use PROMPT_WORKFLOW_UPDATE.md with Claude
3. Generate updated JSON
4. Validate workflow progression makes sense
5. Replace production file
6. Notify team of status change
```

**Time estimate:** 15-30 minutes per update

---

## Data Cadence Calendar

### Recommended Update Schedule:

**Monthly (1st business day):**
- [ ] Supply chain data update (vendor spend, surgeon usage)
- [ ] Revenue cycle data update (if available)

**Quarterly (within 2 weeks of quarter-end):**
- [ ] Quality metrics update
- [ ] Supply chain data refresh (if not doing monthly)
- [ ] Review workflow status

**Semi-Annual (January & July):**
- [ ] Surgeon/hospital roster refresh
- [ ] Benchmark data update (AJRR, NSQIP releases)
- [ ] Full data validation and cleanup

**As-Needed:**
- [ ] Workflow stage transitions
- [ ] Contract changes mid-cycle
- [ ] Quality improvement initiative results
- [ ] Major system changes

---

## File Locations

### Production Data Files:
```
/public/orthopedic-data.json          # Hip & Knee product line
/public/shoulder-data.json            # Shoulder product line
/public/strategic-framework.json      # Strategic assumptions
```

### Backup Strategy:
```
Before updating production:
1. Copy current file to /backups/ with date suffix
   Example: orthopedic-data-2025-01-15.json
2. Keep last 12 months of backups
3. Document what changed in version control commit message
```

### Version Control:
```
Git commit messages should follow format:
"Data update: [Type] for [Product Line] - [Month/Quarter Year]"

Examples:
- "Data update: Supply chain for Hip-Knee - January 2025"
- "Data update: Quality metrics for Shoulder - Q4 2024"
- "Data update: Workflow status for Hip-Knee - Implementation milestone"
```

---

## Common Scenarios

### Scenario 1: Monthly Routine Update
**Data available:** New month of vendor invoices, surgeon case counts
**Prompt to use:** PROMPT_SUPPLY_CHAIN_UPDATE.md
**Time:** 2-3 hours
**Preserves:** Quality, revenue, workflow data

### Scenario 2: Quarter-End Comprehensive Update
**Data available:** Supply chain + quality metrics + revenue cycle
**Approach:** Run multiple prompts sequentially:
1. PROMPT_SUPPLY_CHAIN_UPDATE.md (generates intermediate file)
2. PROMPT_QUALITY_UPDATE.md (updates intermediate file)
3. Manually add revenue cycle if available
**Time:** 4-5 hours
**Result:** Fully refreshed data file

### Scenario 3: New Product Line Setup
**Data available:** Full historical dataset for new product line (e.g., Spine)
**Prompt to use:** ORTHOPEDIC_DATA_STANDARDIZATION_PROMPT.md
**Time:** 4-6 hours
**Creates:** New complete JSON file from scratch

### Scenario 4: Workflow Milestone Update
**Data available:** Project status change
**Prompt to use:** PROMPT_WORKFLOW_UPDATE.md
**Time:** 15-30 minutes
**Preserves:** All data, updates only workflow section

### Scenario 5: Contract Price Change
**Data available:** New vendor pricing effective immediately
**Approach:**
1. Update component pricing in supply chain data
2. Recalculate scenario savings estimates
3. Update matrixPricing comparisons
**Prompt to use:** PROMPT_SUPPLY_CHAIN_UPDATE.md with note about price change
**Time:** 2-3 hours

---

## Quality Assurance Checklist

Before deploying updated data to production:

- [ ] **JSON validates** - No syntax errors
- [ ] **Totals reconcile** - metadata.totalCases = sum of surgeon cases
- [ ] **No PHI** - All patient identifiers removed
- [ ] **Dates are current** - lastUpdated timestamp is correct
- [ ] **Scenario IDs match** - Workflow selectedScenario matches available scenarios
- [ ] **Dashboard loads** - Test in browser, no console errors
- [ ] **Metrics display** - Spot-check that numbers look reasonable
- [ ] **Backup created** - Previous version saved before overwriting
- [ ] **Changes documented** - Git commit or change log updated

---

## Troubleshooting

### Problem: Dashboard shows "No data available"
**Cause:** JSON file not found or invalid syntax
**Fix:**
1. Check file path matches what app expects
2. Validate JSON syntax (use online validator)
3. Check browser console for error messages

### Problem: Numbers don't look right
**Cause:** Unit mismatch (dollars vs millions) or calculation error
**Fix:**
1. Verify dollar amounts are in dollars, not millions
2. Check that percentages are decimals (0.18 = 18%) where expected
3. Recalculate totals manually to verify

### Problem: Quality metrics missing
**Cause:** qualityMetrics section not populated
**Fix:**
1. Quality data is optional - dashboard will show placeholder
2. If you want to populate, use PROMPT_QUALITY_UPDATE.md
3. Check that dataSource is documented

### Problem: Workflow stage doesn't match reality
**Cause:** workflowTracking section needs update
**Fix:**
1. Use PROMPT_WORKFLOW_UPDATE.md to correct
2. Ensure only one stage is "active" at a time
3. Check that stage progression makes logical sense

---

## Getting Help

**For data collection questions:**
- Contact: Supply Chain Team / Quality Department / Finance
- Reference: DATA_COLLECTION_GUIDE.md

**For Claude prompt usage:**
- Reference: Individual prompt files (PROMPT_*.md)
- Tip: Include context about what changed and why

**For dashboard issues:**
- Check: Browser console for error messages
- Validate: JSON syntax and structure
- Test: In development environment before production

**For strategic questions:**
- Contact: Strategic Sourcing Lead / Value Analysis Team
- Reference: strategic-framework.json for assumptions
