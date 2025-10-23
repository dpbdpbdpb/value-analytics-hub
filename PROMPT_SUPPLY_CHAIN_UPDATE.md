# Claude Prompt: Supply Chain Data Update (Monthly/Quarterly)

**Use this prompt when:** You need to update vendor spend, surgeon usage, and component data (most frequent update)

---

## Prompt Template

```
I need to UPDATE the supply chain data for the CommonSpirit Value Analytics Hub.

PRODUCT LINE: [hip-knee | shoulder | spine | sports-medicine | trauma]
UPDATE TYPE: supply-chain-only
CURRENT DATA FILE: [path to existing JSON file]
UPDATE PERIOD: [Month Year - e.g., "October 2024" or "Q4 2024"]

ATTACHED NEW DATA:
[Paste your CSV/Excel data with vendor spend, surgeon usage, component pricing]

INSTRUCTIONS:
1. Load the existing JSON file from CURRENT DATA FILE
2. Update ONLY the following sections with new data:
   - `metadata.totalCases`
   - `metadata.totalSpend`
   - `metadata.lastUpdated`
   - `vendors` (aggregate vendor totals)
   - `surgeons` (update cases, spend, vendor usage for each surgeon)
   - `components` (update component totals and pricing)
   - `matrixPricing` (recalculate vendor pricing comparisons)

3. PRESERVE all other sections unchanged:
   - `qualityMetrics` (leave as-is)
   - `revenueCycle` (leave as-is)
   - `workflowTracking` (leave as-is)
   - `scenarios` (leave as-is unless you have new scenario data)
   - `hospitals` (update only if surgeon assignments changed)
   - `regions` (recalculate based on new totals)

4. Ensure data quality:
   - Normalize vendor names (J&J → JOHNSON & JOHNSON, etc.)
   - Calculate `avgSpendPerCase` for each surgeon
   - Update `primaryVendor` and `primaryVendorPercent` for surgeons
   - Recalculate hospital aggregates if surgeon data changed
   - Update vendor consolidation scenario savings estimates

5. Validation:
   - Verify `metadata.totalCases` = sum of all surgeon cases
   - Verify `metadata.totalSpend` = sum of all vendor spend
   - Check that all surgeons have valid hospital assignments
   - Ensure dollar amounts are in dollars (not millions)

OUTPUT:
Please provide the complete updated JSON file, maintaining all existing structure and only updating the supply chain sections specified above.
```

---

## Example Usage

```
I need to UPDATE the supply chain data for the CommonSpirit Value Analytics Hub.

PRODUCT LINE: hip-knee
UPDATE TYPE: supply-chain-only
CURRENT DATA FILE: /public/orthopedic-data.json
UPDATE PERIOD: January 2025

ATTACHED NEW DATA:
[Paste your vendor invoices, surgeon usage reports, component pricing data from procurement system]

ADDITIONAL CONTEXT:
- We onboarded 3 new surgeons this month at St. Mary Medical Center
- Stryker pricing decreased 2% due to contract renegotiation
- Total case volume increased 5% compared to December 2024

[Follow INSTRUCTIONS from template above]
```

---

## Tips for Best Results

1. **Incremental updates work best** - Only update what changed
2. **Include context** - Tell Claude about significant changes (new surgeons, pricing changes, etc.)
3. **Validate before replacing** - Test the new JSON in a dev environment first
4. **Keep backup** - Save previous version before updating production file
5. **Document changes** - Add notes to version control about what was updated

---

## Common Scenarios

### Scenario 1: Monthly Routine Update
- New month of vendor invoices
- Updated surgeon case counts
- No major changes to roster or contracts

### Scenario 2: New Surgeon Onboarding
- Include new surgeon in data export
- Ensure they're assigned to correct hospital
- May need to update hospital surgeon counts

### Scenario 3: Contract Price Change
- Update vendor pricing in component data
- Recalculate scenario savings estimates
- Update matrixPricing comparisons

### Scenario 4: Vendor Name Change / Consolidation
- Update vendor name consistently across all records
- Merge data if vendors consolidated
- Preserve historical data in notes
