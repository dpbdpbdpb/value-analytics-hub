# Value Analytics Data Structure

## Directory Organization

### `baselines/`
Original baseline datasets generated from ORTHOPEDIC_DATA_STANDARDIZATION_PROMPT.md
- `hip-knee-baseline.json` - Q3 2024 hip & knee baseline (443 surgeons, 75 hospitals, 27,782 cases)
- `shoulder-baseline.json` - Q3 2024 shoulder baseline (242 surgeons, 71 hospitals, 4,668 cases)

**Note**: These are the source-of-truth baseline files. Do not modify directly.

### Active Data Files
- `hip-knee-data.json` - Currently active hip/knee data used by the application
- `shoulder-data.json` - Active shoulder data (ready for shoulder product line pages)

## Adding New Product Lines

1. Use `ORTHOPEDIC_DATA_STANDARDIZATION_PROMPT.md` to generate baseline JSON
2. Save to `baselines/[product-line]-baseline.json`
3. Copy to `[product-line]-data.json` for active use
4. Update application routes to load the new product line

## Workflow: Baseline → Lookback

**Baseline** (current): Establishes starting point for vendor consolidation analysis
**Lookback** (future): Compares actual results vs. predicted scenarios after implementation

Each product line will have:
- Baseline: `baselines/[product-line]-baseline.json`
- Lookback (future): `lookbacks/[product-line]-lookback-YYYY-MM.json`
