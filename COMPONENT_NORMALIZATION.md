# Component Name Normalization

## Problem

Component names in Excel files often have inconsistent naming that prevents proper grouping:

### Example Issues:
- **"Hip Acetabular Cup 32mm Sterile"** vs **"ACETABULAR CUP SIZE 32 LATEX-FREE"**
- **"Femoral Head Type 1 -3"** vs **"FEM HEAD -3 MODEL A"**
- **"Tibial Tray Left"** vs **"TIBIAL BASEPLATE L"**

Without normalization, these would be treated as **different components**, preventing price comparison across vendors and reducing matrix categories from potentially 100+ to just 2-3.

---

## Solution: Smart Component Normalization

The upload tool now **automatically normalizes** component names using intelligent pattern matching.

### What Gets Normalized:

#### 1. **Removed (Non-Essential Descriptors)**
- Size indicators: `32MM`, `SIZE 10`, `TYPE 3`, `MODEL A`
- Medical descriptors: `STERILE`, `LATEX-FREE`, `NON-STERILE`
- Side indicators: `LEFT`, `RIGHT`, `L`, `R`
- Reference numbers: `REF: 12345`, `CAT# ABC-123`
- Quantities in name: `-3`, `-4`, `QTY 5`

#### 2. **Standardized (Common Abbreviations)**
| Original | Standardized |
|----------|--------------|
| ACETAB, ACETABULAR | ACETABULAR |
| FEM, FEMORAL | FEMORAL |
| TIB, TIBIAL | TIBIAL |
| PAT, PATELLAR | PATELLAR |
| COMPONENT | COMP |
| PROSTHESIS | PROSTH |
| REVISION | REV |
| PRIMARY | PRIM |

#### 3. **Grouped (Core Component Types)**
The algorithm identifies core component types:
- **"ACETABULAR CUP"** - All acetabular cup variations
- **"ACETABULAR SHELL"** - Shell components
- **"FEMORAL HEAD"** - Femoral head components
- **"FEMORAL STEM"** - Femoral stem components
- **"TIBIAL TRAY"** - Tibial tray/baseplate
- **"TIBIAL INSERT"** - Tibial insert/bearing
- **"PATELLAR COMP"** - Patellar components
- **"GLENOID COMP"** - Glenoid components (shoulder)
- **"HUMERAL COMP"** - Humeral components (shoulder)

---

## Examples

### Before Normalization:
```
Row 1: "HIP ACETABULAR CUP 32MM STERILE REF:12345" - Stryker - $1,200
Row 2: "ACETABULAR CUP SIZE 32 LATEX-FREE CAT#ABC" - Zimmer - $1,000
Row 3: "Acetabular Cup 32mm Type 1 -3 Left" - J&J - $1,150
```
**Result**: 3 separate components, NO matrix pricing possible

### After Normalization:
```
All normalize to: "ACETABULAR CUP"
- Stryker: $1,200
- Zimmer: $1,000 ← Matrix Price (lowest)
- J&J: $1,150
```
**Result**: 1 matrix category with 3-vendor comparison, **$200 savings opportunity**

---

## What You'll See in the Upload Tool

### 1. **Component Normalization Report**
After processing your file, you'll see:

```
┌──────────────────────────────────────────┐
│  Component Normalization Report          │
├──────────────────────────────────────────┤
│  Multi-Vendor Components:  [XX]          │
│  ✓ Can create matrix pricing            │
│                                          │
│  Single-Vendor Components: [XXX]         │
│  ✗ Cannot compare prices                │
└──────────────────────────────────────────┘

Component names were automatically normalized to
group similar items. This increased matrix
categories from potentially hundreds to XX
comparable groups.
```

### 2. **Top Matrix Categories**
Expand to see the top categories with the most savings potential:

```
[▼] View Top Matrix Categories (10 of 45)

    ACETABULAR CUP                    $45.2K savings
    Current: $1,200 → Target: $1,000 (16.7% reduction)

    FEMORAL HEAD                      $38.5K savings
    Current: $850 → Target: $700 (17.6% reduction)

    TIBIAL TRAY                       $32.1K savings
    Current: $1,500 → Target: $1,250 (16.7% reduction)
```

---

## When Normalization Helps Most

✅ **Best scenarios:**
- Multiple vendors selling the same types of components
- Inconsistent naming conventions in your data
- Mix of abbreviations and full names
- Size/model variations of the same component

⚠️ **Limited benefit when:**
- Each vendor has completely unique components
- All components are already consistently named
- Data contains only single-vendor items
- Components are fundamentally different (can't be compared)

---

## Tips for Better Results

### 1. **Ensure Vendor Diversity**
Matrix pricing requires **2+ vendors per component type**. If you're seeing low matrix categories:
- Check if most components are single-source
- Consider if certain vendors specialize in unique components

### 2. **Check Component Names**
Look at the "Sample Data Preview" to verify:
- Component names are descriptive (not just part numbers)
- Similar components have some naming consistency
- Core component type is identifiable (e.g., contains "cup", "head", "tray")

### 3. **Review the Report**
The normalization report shows:
- How many components have multi-vendor pricing
- Which categories have the most savings potential
- Whether your data supports matrix pricing

---

## Technical Details

### Normalization Algorithm

```javascript
1. REMOVE non-essential descriptors
   - Sizes (32mm, SIZE 10)
   - Medical terms (STERILE, LATEX-FREE)
   - References (REF: 123, CAT# ABC)

2. STANDARDIZE abbreviations
   - ACETAB → ACETABULAR
   - FEM → FEMORAL
   - TIB → TIBIAL

3. IDENTIFY core component type
   - If contains "ACETABULAR" + "CUP" → "ACETABULAR CUP"
   - If contains "FEMORAL" + "HEAD" → "FEMORAL HEAD"
   - etc.

4. FALLBACK for unmatched patterns
   - Keep first 4 significant words (>2 chars)
   - Remove extra whitespace
```

### Matrix Category Creation

For each normalized component:
```
1. Group all rows with same normalized name
2. Calculate vendor statistics (median price, samples, range)
3. Only create matrix category if:
   - 2+ vendors sell this component
   - Price difference exists (savings opportunity)
   - Actual spend/volume data present
```

---

## Examples by Component Type

### Hip Components
| Original Names | Normalized To |
|----------------|---------------|
| "Hip Acetabular Cup 32mm", "ACETABULAR CUP SIZE 32 STERILE" | **ACETABULAR CUP** |
| "Femoral Head 32mm +3", "FEM HEAD 32 TYPE 1" | **FEMORAL HEAD** |
| "Hip Femoral Stem Size 10", "FEMORAL STEM MODEL A" | **FEMORAL STEM** |

### Knee Components
| Original Names | Normalized To |
|----------------|---------------|
| "Tibial Tray Left 10mm", "TIB BASEPLATE L SIZE 10" | **TIBIAL TRAY** |
| "Tibial Insert 7mm CR", "TIBIAL BEARING CRUCIATE RETAIN" | **TIBIAL INSERT** |
| "Femoral Knee Component", "FEM KNEE IMPLANT" | **FEMORAL KNEE COMP** |
| "Patellar Component 32mm", "PAT BUTTON" | **PATELLAR COMP** |

### Shoulder Components
| Original Names | Normalized To |
|----------------|---------------|
| "Glenoid Component", "GLENOID IMPLANT STERILE" | **GLENOID COMP** |
| "Humeral Component", "HUMERAL STEM" | **HUMERAL COMP** |

---

## Still Have Few Matrix Categories?

If you still only see 2-3 matrix categories after normalization, it likely means:

1. **Most components are single-vendor** - Each vendor has proprietary components that others don't sell
2. **Highly specialized data** - Components are truly unique and not comparable
3. **Data structure issue** - Check column mapping was correct

**This is normal** if your procurement data shows vendor specialization. Matrix pricing works best when vendors compete on the same component types.
