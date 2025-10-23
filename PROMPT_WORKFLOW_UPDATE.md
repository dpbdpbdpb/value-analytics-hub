# Claude Prompt: Workflow Status Update (As Needed)

**Use this prompt when:** You need to update the sourcing lifecycle stage, milestones, or project status

---

## Prompt Template

```
I need to UPDATE workflow tracking status for the CommonSpirit Value Analytics Hub.

PRODUCT LINE: [hip-knee | shoulder | spine | sports-medicine | trauma]
UPDATE TYPE: workflow-status-only
CURRENT DATA FILE: [path to existing JSON file]
UPDATE DATE: [Today's date]

WORKFLOW UPDATES:
[Describe what changed in the sourcing lifecycle]

INSTRUCTIONS:
1. Load the existing JSON file from CURRENT DATA FILE
2. Update ONLY the `workflowTracking` section:
   - `currentStage` (if stage changed)
   - `lastUpdated` (current timestamp)
   - Update specific stage status (completed → active, active → completed, etc.)
   - Add/update key dates (startDate, completionDate, scheduledDate)
   - Update implementation milestones if in implementation stage
   - Update percentComplete if in implementation stage
   - Add notes documenting changes

3. PRESERVE all other sections unchanged:
   - `metadata`, `vendors`, `surgeons`, `components` (leave as-is)
   - `qualityMetrics` (leave as-is)
   - `revenueCycle` (leave as-is)
   - `scenarios` (leave as-is)

4. Validation:
   - Only one stage should have status "active" at a time
   - Completed stages should have completionDate
   - Active stage should have startDate
   - Upcoming stages should have scheduledDate or expectedDate
   - Stage progression makes logical sense

OUTPUT:
Please provide the complete updated JSON file, maintaining all existing structure and only updating the workflowTracking section.
```

---

## Example Usage Scenarios

### Scenario 1: Moving from Decision to Implementation

```
I need to UPDATE workflow tracking status for the CommonSpirit Value Analytics Hub.

PRODUCT LINE: hip-knee
UPDATE TYPE: workflow-status-only
CURRENT DATA FILE: /public/orthopedic-data.json
UPDATE DATE: 2024-10-01

WORKFLOW UPDATES:
- Completed decision phase - selected "dual-premium" scenario (Zimmer + Stryker)
- Moving to implementation phase
- Contracts signed on 2024-09-28
- Implementation start date: 2024-10-01
- Expected completion: 2025-03-31

Updated milestones for implementation:
1. Contract signing - COMPLETED (2024-09-28)
2. Vendor onboarding - In Progress (expected 2024-10-15)
3. Surgeon training sessions - Upcoming (scheduled 2024-11-01 to 2025-01-31)
4. Go-live for all sites - Upcoming (expected 2025-02-01)
5. Full adoption - Upcoming (expected 2025-03-31)

[Follow INSTRUCTIONS from template above]
```

### Scenario 2: Updating Implementation Progress

```
I need to UPDATE workflow tracking status for the CommonSpirit Value Analytics Hub.

PRODUCT LINE: hip-knee
UPDATE TYPE: workflow-status-only
CURRENT DATA FILE: /public/orthopedic-data.json
UPDATE DATE: 2024-12-15

WORKFLOW UPDATES:
- Still in implementation phase
- Progress update: 60% complete (was 45%)
- Completed milestones this month:
  - Vendor onboarding: COMPLETED (2024-10-12)
  - Surgeon training sessions: COMPLETED (2024-12-10)
- Upcoming milestones:
  - Go-live for all sites: In Progress (expected 2025-02-01)
  - Full adoption: Upcoming (expected 2025-03-31)

Notes: Training sessions went well, 85% surgeon attendance. Some resistance from high-volume J&J users, pairing them with Stryker sherpas.

[Follow INSTRUCTIONS from template above]
```

### Scenario 3: Moving from Implementation to Lookback

```
I need to UPDATE workflow tracking status for the CommonSpirit Value Analytics Hub.

PRODUCT LINE: hip-knee
UPDATE TYPE: workflow-status-only
CURRENT DATA FILE: /public/orthopedic-data.json
UPDATE DATE: 2025-04-01

WORKFLOW UPDATES:
- Completed implementation phase on 2025-03-31
- Moving to lookback analysis phase
- Implementation achieved 100% completion
- All milestones completed successfully
- Lookback analysis starts today (2025-04-01)
- Scheduled lookback review meeting: 2025-04-15

Notes: Implementation completed on schedule. Final adoption rate: 88% (vs. predicted 85%). Ready to begin 3-month lookback analysis to compare actual vs. predicted savings.

[Follow INSTRUCTIONS from template above]
```

### Scenario 4: Scheduling Contract Renewal Review

```
I need to UPDATE workflow tracking status for the CommonSpirit Value Analytics Hub.

PRODUCT LINE: hip-knee
UPDATE TYPE: workflow-status-only
CURRENT DATA FILE: /public/orthopedic-data.json
UPDATE DATE: 2025-06-01

WORKFLOW UPDATES:
- Completed lookback analysis phase on 2025-05-30
- Lookback results: Actual savings $7.2M vs. predicted $8.0M (90% achievement)
- Moving from lookback back to ongoing monitoring
- Updated contract renewal schedule:
  - Current contracts expire: 2027-09-30
  - Next renewal review starts: 2027-06-01 (3 months before expiration)
  - Begin sourcing strategy review: 2027-05-01

Notes: Lookback showed strong performance. Surgeon adoption higher than expected (88% vs 85%). Savings slightly below target due to 3% higher than expected volume on premium implants. Will monitor for next 2 years until contract renewal.

[Follow INSTRUCTIONS from template above]
```

---

## Workflow Stage Definitions

### 1. Sourcing Strategy Review
**Status when:** Analyzing market, evaluating vendors, preparing RFP
**Typical duration:** 2-4 months
**Key dates:** startDate, completionDate
**Outputs:** Market analysis, vendor shortlist, initial scenarios

### 2. Decision
**Status when:** Selecting vendor strategy, negotiating contracts
**Typical duration:** 1-3 months
**Key dates:** decisionDate
**Outputs:** Selected scenario, signed contracts, decision rationale
**Special field:** `selectedScenario` (scenario ID chosen)

### 3. Implementation
**Status when:** Rolling out contracts, training surgeons, transitioning
**Typical duration:** 6-12 months
**Key dates:** startDate, expectedCompletion
**Special fields:** `percentComplete`, `milestones[]`
**Milestones:** Contract signing, training, go-live, full adoption

### 4. Lookback Analysis
**Status when:** Evaluating actual vs. predicted performance (post-implementation)
**Typical duration:** 1-3 months
**Key dates:** scheduledDate, completionDate
**Outputs:** Actual savings, adoption rates, lessons learned
**Frequency:** 3-month, 6-month, 12-month post-implementation

### 5. Contract Renewal Review
**Status when:** Preparing for contract expiration, evaluating next cycle
**Typical duration:** 2-3 months before expiration
**Key dates:** contractExpirationDate, nextReviewDate
**Outputs:** Performance summary, renewal decision
**Next step:** Returns to Sourcing Strategy Review

---

## Tips for Best Results

1. **Update promptly** - Workflow tracking is most useful when current
2. **Document rationale** - Add notes explaining decisions and changes
3. **Track milestones** - Implementation stage benefits from detailed milestone tracking
4. **Be realistic with dates** - Update expected dates if timeline slips
5. **Celebrate wins** - Document successful completions and learnings

---

## Workflow Progression Validation

Valid progressions:
- sourcing-review → decision ✓
- decision → implementation ✓
- implementation → lookback ✓
- lookback → renewal (if contracts expiring soon) ✓
- lookback → monitoring (if contracts have 2+ years remaining) ✓
- renewal → sourcing-review ✓ (cycle repeats)

Invalid progressions:
- Skipping stages (e.g., decision → lookback without implementation) ✗
- Going backward without explanation ✗
- Multiple active stages simultaneously ✗
