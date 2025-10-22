# Session Continuation Prompt

Use this prompt when starting a new Claude Code session to continue work on the Value Analytics Hub.

---

## Quick Context Prompt

```
I'm continuing work on the CommonSpirit Value Analytics Hub platform. This is a React-based value analytics platform for surgical service line optimization.

Current state:
- Real Q3 2024 baseline data integrated for Hip/Knee (443 surgeons, 75 hospitals) and Shoulder (242 surgeons, 71 hospitals)
- Data stored in public/data/ folder with baselines/ subfolder for source data
- Platform uses tri-pillar decision framework (Clinical, Financial, Operational)
- Scenario-based vendor consolidation analysis with volume-weighted adoption risk

Outstanding work needed:
1. Build hospital vendor loyalty heat map for Hospital & Sherpa Analysis tab
2. Clean up cluttered scenario comparison cards in TeamDecisionDashboard
3. Fix blank pages when clicking decision canvas perspective cards
4. Update app to support multiple product lines (hip/knee, shoulder, spine, etc.)

Key files:
- Data: public/data/baselines/ and public/orthopedic-data.json
- Architecture: DATA_ARCHITECTURE.md
- Standardization: ORTHOPEDIC_DATA_STANDARDIZATION_PROMPT.md
- Main dashboards: src/views/TeamDecisionDashboard.jsx, ProductLineView.jsx

What should I work on first?
```

---

## Detailed Context Prompt (if needed)

```
I'm continuing work on CommonSpirit Value Analytics Hub - a React/Tailwind strategic value analytics platform for surgical service line optimization.

## Platform Overview
- **Purpose**: Transparent, data-driven vendor consolidation decisions
- **Framework**: Tri-pillar approach (Clinical, Financial, Operational)
- **Data**: Real Q3 2024 baseline from SKU-level transactions + ECRI benchmarking
- **Methodology**: Scenario-based analysis with volume-weighted adoption risk

## Current State

### Data Infrastructure
- **Hip & Knee**: 443 surgeons, 75 hospitals, 27,782 cases, $42.3M spend
- **Shoulder**: 242 surgeons, 71 hospitals, 4,668 cases, $29.6M spend
- **Storage**: public/data/baselines/ (source), public/orthopedic-data.json (active)
- **Schema**: Defined in DATA_ARCHITECTURE.md with hospitals, surgeons, scenarios, components

### What's Working
✅ Real baseline data integrated via ORTHOPEDIC_DATA_STANDARDIZATION_PROMPT.md
✅ Surgeon counts fixed (was showing 333/900, now 443)
✅ NPV calculations added ($24.7M-$45.9M range)
✅ Scenario names vendor-based (Stryker + Zimmer, etc.)
✅ Tri-pillar colors standardized (green/amber/purple)
✅ Multi-hospital surgeon tracking with peer influence
✅ Volume-weighted adoption risk (high-volume surgeons weighted 5x)

### Outstanding Issues

**High Priority:**
1. **Hospital Heat Map** - Build vendor loyalty visualization for Hospital & Sherpa Analysis tab
   - X-axis: 75 hospitals
   - Y-axis: Vendors
   - Color: Case volume intensity
   - Badge: Loyalty % (>80% = loyalist)
   - Purpose: Identify sherpa opportunities and consolidation targets

2. **Scenario Cards Cleanup** - TeamDecisionDashboard tri-pillar cards are cluttered
   - Too much text in Finance/Clinical/Operations columns
   - Need simpler, cleaner design
   - Remove redundant information

3. **Blank Pages** - Decision canvas perspective cards (Clinical/Financial/Operational) lead to blank pages
   - Routes may not exist or pages empty
   - Need to verify routing and content

4. **Multi-Product-Line Support** - Enable shoulder, spine, etc.
   - Data structure ready (shoulder-baseline.json exists)
   - Need UI to switch between product lines
   - Service line selection on landing page

**Medium Priority:**
- Add totalSurgeons to metadata in shoulder-data.json
- Create lookback data structure for future scenario validation
- Build sherpa identification dashboard

### Key Architecture Files
- DATA_ARCHITECTURE.md - Complete data schema
- ORTHOPEDIC_DATA_STANDARDIZATION_PROMPT.md - Claude prompt for data generation
- src/views/TeamDecisionDashboard.jsx - Main integrated dashboard
- src/views/ProductLineView.jsx - Product line overview with decision canvas cards
- src/views/PortfolioOverview.jsx - Home page with service line selection
- src/config/scenarios.js - Volume-weighted risk calculations

### Tech Stack
- React 18, React Router v7
- Tailwind CSS for styling
- Lucide React for icons
- Recharts for visualizations
- GitHub Pages deployment

What would you like to work on?
```

---

## For Specific Tasks

### Heat Map Development
```
I need to build a hospital vendor loyalty heat map for the Hospital & Sherpa Analysis tab in TeamDecisionDashboard.jsx.

Data available in public/orthopedic-data.json:
- .hospitals object with 75 hospitals
- Each hospital has: vendorConcentration (0-1), totalCases, vendors breakdown

Goal: Visualize hospital-vendor combinations showing:
- Case volume (color intensity)
- Vendor loyalty % (badge/indicator)
- Identify sherpa candidates (high volume + loyal to target vendor)

Should this be a custom component or use Recharts? What's the best approach?
```

### Scenario Card Cleanup
```
The scenario comparison cards in TeamDecisionDashboard.jsx are too cluttered (see screenshots).

Current issue: Finance/Clinical/Operations columns have too much text and redundant info.

Need to simplify while keeping key metrics:
- Annual savings
- Surgeons affected
- Implementation timeline
- Risk level

Can you help clean up the design?
```

---

## Notes
- Git repo: dpbdpbdpb/value-analytics-hub (deployed to GitHub Pages)
- All commits include Claude Code attribution
- Use TodoWrite tool to track multi-step work
- Real data validated via DATA_STANDARDIZATION workflow
