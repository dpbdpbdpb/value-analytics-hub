# Admin Data Upload Interface

## Overview

The Admin Data Upload Interface is a web-based tool built directly into the Value Analytics Hub that allows you to upload Excel/CSV files and automatically transform them into the standardized JSON format required by the application.

**No more manual Claude prompts or JSON editing!**

---

## Accessing the Interface

### Local Development
```
http://localhost:3000/value-analytics-hub/admin/data-upload
```

### Production
```
https://yourdomain.com/value-analytics-hub/admin/data-upload
```

**Password:** `notlzt`

---

## Features

### 1. **Secure Access**
- Password-protected (no username required)
- Simple authentication system
- Prevents unauthorized data uploads

### 2. **Multi-Format Support**
- Excel files (.xlsx, .xls)
- CSV files (.csv)
- Automatic format detection

### 3. **Product Line Selection**
- Hip & Knee
- Shoulder
- (More coming soon)

### 4. **Automatic Transformation**
Converts raw data into the correct JSON structure:
- ✅ **matrixPricing** (array) - for component analysis UI
- ✅ **matrixPricingDetailed** (object) - for vendor detail
- ✅ All required metadata
- ✅ Vendor aggregation
- ✅ Component categorization
- ✅ Workflow tracking initialization

### 5. **Built-in Validation**
Automatically validates:
- Required fields presence
- Data type correctness
- matrixPricing is an array
- matrixPricingDetailed is an object
- Reasonable price ranges
- Total spend calculations

### 6. **Visual Feedback**
Real-time metrics display:
- Number of vendors
- Number of components
- Number of matrix categories
- Total spend

### 7. **Preview & Download**
- View generated JSON before saving
- Download for inspection
- Direct deployment option

---

## Expected Data Format

Your Excel/CSV file should have these columns (case-insensitive):

### Required Columns:
- **Vendor** - Vendor name (e.g., "Stryker", "Zimmer Biomet")
- **Component** - Component description (e.g., "Hip Femoral Stem", "Knee Tibial Tray")
- **Quantity** - Number of units used
- **Price** - Unit price in dollars

### Optional Columns:
- **Surgeon** - Surgeon name
- **Hospital** - Hospital/facility name
- **Region** - Geographic region
- **ProcedureType** - PRIMARY or REVISION
- **BodyPart** - HIP, KNEE, SHOULDER, etc.

### Example Data:

| Vendor | Component | Quantity | Price | Surgeon | Hospital |
|--------|-----------|----------|-------|---------|----------|
| Stryker | Hip Femoral Stem | 150 | 1500 | Dr. Smith | General Hospital |
| Zimmer Biomet | Knee Tibial Tray | 200 | 800 | Dr. Jones | Regional Medical |
| Johnson & Johnson | Acetabular Cup | 100 | 900 | Dr. Brown | General Hospital |

---

## Step-by-Step Workflow

### Step 1: Prepare Your Data
1. Export spend data from your supply chain system
2. Ensure required columns are present
3. Clean any obvious data quality issues
4. Save as Excel (.xlsx) or CSV

### Step 2: Access Admin Interface
1. Navigate to the admin URL
2. Enter password: `notlzt`
3. Click "Login"

### Step 3: Upload Data
1. Select product line (Hip & Knee or Shoulder)
2. Click "Choose File" and select your data file
3. Wait for confirmation: "File loaded: X rows"

### Step 4: Process Data
1. Click "Transform to JSON"
2. Processing typically takes 1-5 seconds
3. Watch for processing indicator

### Step 5: Review Validation
The system will show:
- ✅ Success message (if valid)
- Summary metrics (vendors, components, spend)
- ⚠️ Any warnings (non-critical issues)
- ❌ Errors (if validation failed)

### Step 6: Preview (Optional)
1. Click "Show Preview" to view generated JSON
2. Verify data looks correct
3. Check matrixPricing is an array
4. Check vendor names are normalized

### Step 7: Save & Deploy
1. Click "Save & Deploy"
2. File downloads to your computer
3. Follow the git workflow instructions shown
4. Move file to appropriate location:
   - Hip & Knee: `public/orthopedic-data.json`
   - Shoulder: `public/shoulder-data.json`

### Step 8: Commit & Push
```bash
git add public/orthopedic-data.json
git commit -m "Update spend data via admin interface"
git push
```

GitHub Pages will automatically rebuild and deploy.

---

## Vendor Name Normalization

The system automatically normalizes vendor names to ensure consistency:

| Input Variations | Normalized To |
|------------------|---------------|
| J&J, JOHNSON, DePuy | JOHNSON & JOHNSON |
| ZIMMER, ZB, Zimmer | ZIMMER BIOMET |
| Stryker, STRYKER Orthopaedics | STRYKER |
| S&N, Smith Nephew | SMITH & NEPHEW |

This prevents duplicate vendor entries due to naming inconsistencies.

---

## Data Transformation Logic

### Matrix Pricing Calculation

**For each component category:**

1. **Aggregate vendor prices**
   - Calculate median price per vendor
   - Count samples (quantity) per vendor
   - Track min/max price range

2. **Calculate metrics**
   - `currentAvgPrice` = weighted average across all vendors
   - `matrixPrice` = lowest vendor price (target price)
   - `totalSpend` = currentAvgPrice × total quantity
   - `potentialSavings` = (currentAvgPrice - matrixPrice) × quantity

3. **Generate both formats**
   - **Array format** (matrixPricing): sorted by potentialSavings descending
   - **Object format** (matrixPricingDetailed): vendor-level detail preserved

### Workflow Initialization

Every uploaded file automatically initializes workflow tracking:
- **Current stage:** sourcing-review
- **Status:** active
- All other stages set to "upcoming"
- Start date set to today

---

## Validation Rules

The system validates:

### Critical (Must Pass):
- ✅ matrixPricing is an array (not object)
- ✅ matrixPricingDetailed is an object (not array)
- ✅ All required sections present (metadata, vendors, components)
- ✅ Each matrixPricing item has required fields

### Warnings (Non-blocking):
- ⚠️ Missing optional fields
- ⚠️ Low sample counts
- ⚠️ Unusual price ranges

---

## Troubleshooting

### Problem: "File loaded: 0 rows"
**Solution:**
- Check file format (must be .xlsx, .xls, or .csv)
- Ensure file has a header row
- Verify file isn't corrupted

### Problem: "Validation failed"
**Solution:**
- Review error messages
- Check that required columns exist
- Ensure data types are correct (numbers for Price/Quantity)

### Problem: "Component analysis still not showing"
**Solution:**
- Verify matrixPricing is an array: open browser console
- Check file was saved to correct location (public/ folder)
- Clear browser cache and refresh
- Verify file name matches product line

### Problem: "Total spend seems wrong"
**Solution:**
- Check Price column is unit price (not extended price)
- Verify Quantity column has correct values
- Look for outliers or data entry errors in source file

---

## Security Considerations

### Current Implementation:
- Password protection (client-side)
- No server-side storage
- All processing happens in browser
- Downloaded files require manual git commit

### Production Recommendations:
1. Change password from default `notlzt`
2. Consider adding server-side authentication
3. Add audit logging for data uploads
4. Implement role-based access control
5. Add file size limits (currently browser-dependent)

---

## Future Enhancements

Planned features:
1. **Direct Git Integration:** Auto-commit and push from interface
2. **Data Versioning:** Track history of uploads with rollback capability
3. **Advanced Validation:** Surgeon-level data validation
4. **Comparison View:** Compare new data vs. current data before saving
5. **Bulk Upload:** Multiple product lines at once
6. **Scenario Generation:** Auto-generate recommended scenarios
7. **Quality Metrics:** Upload clinical outcomes data
8. **Revenue Cycle:** Upload financial/reimbursement data

---

## Files Reference

| File | Purpose |
|------|---------|
| [src/views/AdminDataUpload.jsx](src/views/AdminDataUpload.jsx) | Main admin interface component |
| [DATA_UPDATE_WORKFLOW.md](DATA_UPDATE_WORKFLOW.md) | Complete workflow documentation |
| [ORTHOPEDIC_DATA_STANDARDIZATION_PROMPT.md](ORTHOPEDIC_DATA_STANDARDIZATION_PROMPT.md) | Claude prompt (alternative method) |
| [transform-matrix-pricing.js](transform-matrix-pricing.js) | Standalone transformation script |

---

## Support

For issues or questions:
1. Check [DATA_UPDATE_WORKFLOW.md](DATA_UPDATE_WORKFLOW.md) troubleshooting section
2. Review browser console for error messages
3. Verify data format matches expected structure
4. Test with a small sample file first

---

Last Updated: 2025-10-23
