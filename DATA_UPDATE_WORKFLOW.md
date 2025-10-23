# Data Update Workflow - Sustainable Process

## Overview
This document describes the sustainable workflow for updating spend data in the Value Analytics Hub.

---

## The Problem We Solved

**Original Issue:** When using Claude to process Excel data, the `matrixPricing` field was being generated as an object instead of an array, breaking the component analysis UI.

**Root Cause:** The data standardization prompt ([ORTHOPEDIC_DATA_STANDARDIZATION_PROMPT.md](ORTHOPEDIC_DATA_STANDARDIZATION_PROMPT.md)) had the wrong schema definition.

**Solution:** Updated the prompt to generate BOTH formats:
- `matrixPricing` (array) - for UI component analysis
- `matrixPricingDetailed` (object) - for detailed vendor analysis

---

## Recommended Workflow

### Option A: Use Admin Upload Interface (NEW - Easiest!)

**Best for:** Quick, error-free updates without any manual JSON editing

1. **Access the Admin Interface**
   - Navigate to: `https://yourdomain.com/value-analytics-hub/admin/data-upload`
   - Or locally: `http://localhost:3000/value-analytics-hub/admin/data-upload`
   - Password: `notlzt`

2. **Upload Your Data**
   - Select product line (Hip & Knee or Shoulder)
   - Choose your Excel (.xlsx, .xls) or CSV file
   - Expected columns: Surgeon, Vendor, Component, Quantity, Price, Hospital (optional)

3. **Process & Validate**
   - Click "Transform to JSON"
   - Review validation results
   - Check metrics: vendors, components, total spend
   - Preview the JSON if needed

4. **Save & Deploy**
   - Click "Save & Deploy"
   - File will download to your computer
   - Move file to `public/orthopedic-data.json` or `public/shoulder-data.json`
   - Follow git instructions:
     ```bash
     git add public/orthopedic-data.json
     git commit -m "Update spend data via admin interface"
     git push
     ```

**Advantages:**
- ✅ No Claude prompts needed
- ✅ Automatic transformation to correct format
- ✅ Built-in validation
- ✅ Immediate visual feedback
- ✅ Guarantees both `matrixPricing` (array) and `matrixPricingDetailed` (object)

---

### Option B: Use Updated Prompt (Alternative)

**Best for:** Regular updates using Claude to process Excel data

1. **Prepare Your Excel Data**
   - Export spend data from your supply chain system
   - Ensure columns include: Surgeon, Vendor, Component, Quantity, Price, Hospital, etc.

2. **Use the Updated Prompt**
   - Open [ORTHOPEDIC_DATA_STANDARDIZATION_PROMPT.md](ORTHOPEDIC_DATA_STANDARDIZATION_PROMPT.md)
   - Copy the prompt template
   - Paste your Excel data into a Claude conversation
   - Follow the prompt instructions

3. **Claude Will Generate Both Formats**
   ```json
   {
     "matrixPricing": [
       {
         "category": "FEMORAL KNEE COMPONENTS",
         "totalSpend": 8102377,
         "currentAvgPrice": 1457,
         "matrixPrice": 1200,
         "potentialSavings": 1429177
       }
     ],
     "matrixPricingDetailed": {
       "FEMORAL KNEE COMPONENTS": {
         "category": "FEMORAL KNEE COMPONENTS",
         "vendors": {
           "Zimmer Biomet": {
             "medianPrice": 1500,
             "samples": 2000,
             "priceRange": { "min": 1200, "max": 1800 }
           }
         }
       }
     }
   }
   ```

4. **Validate & Deploy**
   - Save output to `public/orthopedic-data.json` or `public/shoulder-data.json`
   - Verify the file loads in your app
   - Component analysis should now work!

---

### Option C: Use Transformation Script (Backup)

**Best for:** When you already have data in the old format

If Claude still generates the old format (object only), use the transformation script:

```bash
node transform-matrix-pricing.js
```

This script:
- ✅ Preserves vendor detail as `matrixPricingDetailed`
- ✅ Generates array format as `matrixPricing`
- ✅ Calculates all required metrics automatically
- ✅ Works on both orthopedic-data.json and shoulder-data.json

---

## Validation Checklist

After generating/updating data, verify:

- [ ] `matrixPricing` is an **ARRAY** (not object)
- [ ] Each array item has: `category`, `totalSpend`, `currentAvgPrice`, `matrixPrice`, `potentialSavings`
- [ ] Array is sorted by `potentialSavings` descending
- [ ] `matrixPricingDetailed` is an **OBJECT** with vendor-level detail
- [ ] Both formats contain the same component categories
- [ ] Prices are reasonable ($100-$15,000 range)
- [ ] Total spend calculations are accurate
- [ ] Component analysis tab displays correctly in the UI

---

## Workflow Tracking Separation

**New Best Practice:** Keep workflow phase tracking separate from spend data.

### Why?
- Spend data changes frequently (monthly/quarterly updates)
- Workflow phase changes infrequently (only when moving through sourcing lifecycle)
- Mixing them makes updates error-prone

### Future Enhancement Options:

1. **Option 1:** Move workflow to `strategic-framework.json`
   - Add `productLineWorkflows` section
   - Track phase for each product line centrally

2. **Option 2:** Create `workflow-state.json`
   - Dedicated file for tracking phases
   - Simple structure: `{ "hip-knee": { "currentPhase": "sourcing-review" } }`

3. **Option 3:** Keep in data files (current approach)
   - Just be careful to preserve `workflowTracking` when updating spend data
   - Consider using the transformation script to merge updates

**Current Status:** Workflow tracking remains in data files. Consider moving to Option 1 or 2 in future iteration.

---

## Troubleshooting

### Problem: Component Analysis Not Showing

**Solution:**
1. Check browser console for errors
2. Verify `matrixPricing` is an array: `grep -A 5 '"matrixPricing": \[' public/orthopedic-data.json`
3. If it's an object, run: `node transform-matrix-pricing.js`

### Problem: Claude Still Generates Object Format

**Solution:**
1. Make sure you're using the updated prompt from [ORTHOPEDIC_DATA_STANDARDIZATION_PROMPT.md](ORTHOPEDIC_DATA_STANDARDIZATION_PROMPT.md)
2. Explicitly remind Claude: "CRITICAL: matrixPricing MUST be an array, not an object"
3. If needed, ask Claude to fix it: "Please convert matrixPricing from object to array format with the required fields"
4. As a fallback, run the transformation script after getting the output

### Problem: Missing Vendor Detail

**Solution:**
- The transformation script preserves vendor detail as `matrixPricingDetailed`
- Check: `grep -A 10 '"matrixPricingDetailed": {' public/orthopedic-data.json`
- If missing, you've lost vendor-level data - regenerate from source

---

## Files Reference

| File | Purpose |
|------|---------|
| [ORTHOPEDIC_DATA_STANDARDIZATION_PROMPT.md](ORTHOPEDIC_DATA_STANDARDIZATION_PROMPT.md) | Claude prompt for processing Excel data |
| [transform-matrix-pricing.js](transform-matrix-pricing.js) | Transformation script (backup solution) |
| [public/orthopedic-data.json](public/orthopedic-data.json) | Hip & Knee spend data |
| [public/shoulder-data.json](public/shoulder-data.json) | Shoulder spend data |
| [DATA_UPDATE_WORKFLOW.md](DATA_UPDATE_WORKFLOW.md) | This document |

---

## Quick Reference: Data Update Steps

### Method 1: Admin Interface (Recommended)
```bash
# 1. Start your local server
npm start

# 2. Navigate to admin interface
# Open: http://localhost:3000/value-analytics-hub/admin/data-upload
# Password: notlzt

# 3. Upload Excel/CSV file and click "Transform to JSON"

# 4. Click "Save & Deploy" and move downloaded file to public/

# 5. Commit changes
git add public/orthopedic-data.json
git commit -m "Update spend data via admin interface"
git push
```

### Method 2: Claude Prompt (Alternative)
```bash
# 1. Prepare Excel data
# 2. Use updated Claude prompt from ORTHOPEDIC_DATA_STANDARDIZATION_PROMPT.md
# 3. Save Claude's output to public/orthopedic-data.json

# 4. IF needed (old format), transform:
node transform-matrix-pricing.js

# 5. Test the app
npm start

# 6. Verify component analysis displays correctly
# Navigate to: Team Decision Dashboard > Components tab

# 7. Commit changes
git add public/orthopedic-data.json
git commit -m "Update spend data with matrix pricing"
git push
```

---

## Future Improvements

1. **Automated Validation:** Create pre-commit hook to validate JSON schema
2. **Data Versioning:** Track data versions for audit trail
3. **Automated Testing:** Add tests for component analysis rendering
4. **Workflow Separation:** Move phase tracking to strategic-framework.json
5. **API Integration:** Direct connection to supply chain system (eliminate manual Excel step)

---

Last Updated: 2025-10-23
