// AGENT Drug-Coated Balloon Demo Data
// Enhanced Product Evaluation Framework v20.0 - Cardiovascular Service Line

export const agentDCBData = {
  // Basic Product Information
  productInfo: {
    id: 'agent-dcb',
    productName: 'AGENT Drug-Coated Balloon System',
    vendor: 'Boston Scientific',
    indication: 'Coronary artery disease - de novo lesions, small vessels',
    serviceLine: 'cardiovascular',
    serviceLineName: 'Cardiovascular',
    clinicalChampion: {
      name: 'Dr. Nezar Falluji',
      title: 'Cardiovascular Service Line Medical Director'
    },
    facilitator: {
      name: 'Doug Barnaby',
      title: 'Medical Director, System Clinical Alignment & Purchasing'
    },
    evaluationStart: '2025-09-01',
    kaizenDate: '2025-11-14',
    pilotStart: '2026-01-15',
    currentPhase: 'pilot',
    tierClassification: 'Tier 2 - Conditional Permission',
    completionPercentage: 85
  },

  // Eight-Agent Analysis - Summary for quick view
  eightAgentSummary: {
    totalComplete: 8,
    totalAgents: 8,
    overallCompletion: 100,
    allComplete: true
  },

  // Eight-Agent Analysis Results (Complete data)
  eightAgentAnalysis: [
    {
      agentType: 'clinical',
      agentName: 'Clinical Evidence Agent',
      completionStatus: 'complete',
      completionPercentage: 100,
      analyst: 'Clinical Research Team',
      lastUpdated: '2025-10-28',
      evidenceQuality: 'strong',
      recommendedAction: 'advance',
      rationale: 'Efficacy data supports selective use in eligible patients with acceptable safety profile',
      keyFindings: [
        'Reduced target lesion revascularization vs POBA: 12% vs 18% at 12 months',
        'Procedural success rate >95% in clinical trials',
        'Safety profile comparable to plain balloon angioplasty',
        'Most effective in de novo lesions <3mm diameter',
        'Learning curve minimal - 5 proctored cases recommended'
      ],
      criticalAssumptions: [
        {
          assumption: 'Physicians will use AGENT selectively in appropriate cases (3-10% of eligible)',
          validationOwner: 'Dr. Falluji',
          confidence: 'moderate',
          flag: '🟡'
        },
        {
          assumption: 'TLR rate will be <15% at CommonSpirit facilities',
          validationOwner: 'Clinical Research Team',
          confidence: 'high',
          flag: '🟢'
        }
      ]
    },
    {
      agentType: 'financial',
      agentName: 'Financial Analysis Agent',
      completionStatus: 'complete',
      completionPercentage: 100,
      analyst: 'Larry Blumenthal (CFO)',
      lastUpdated: '2025-10-30',
      evidenceQuality: 'strong',
      recommendedAction: 'advance',
      rationale: 'Break-even to marginally positive, acceptable for Tier 2 classification',
      keyFindings: [
        'Average contribution margin: +$150 per case vs POBA',
        'Reimbursement: Bundled under PCI procedures',
        'Device cost: $1,200 vs $300 for POBA',
        'Savings from reduced re-interventions offset device cost',
        'Financial risk acceptable with 3-10% usage target'
      ],
      criticalAssumptions: [
        {
          assumption: 'Usage will remain at 3-10% of eligible cases',
          validationOwner: 'Larry Blumenthal',
          confidence: 'moderate',
          flag: '🟡'
        },
        {
          assumption: 'No strategic losses accepted',
          validationOwner: 'Larry Blumenthal',
          confidence: 'high',
          flag: '🟢'
        }
      ]
    },
    {
      agentType: 'regulatory',
      agentName: 'Regulatory Compliance Agent',
      completionStatus: 'complete',
      completionPercentage: 100,
      analyst: 'Regulatory Affairs Team',
      lastUpdated: '2025-10-25',
      evidenceQuality: 'strong',
      recommendedAction: 'advance',
      rationale: 'FDA 510(k) cleared, CMS coverage bundled',
      keyFindings: [
        'FDA 510(k) clearance: K183274',
        'Indicated for coronary artery disease',
        'CMS coverage bundled under PCI procedures',
        'No state-specific regulatory requirements',
        'Standard device tracking required'
      ],
      criticalAssumptions: []
    },
    {
      agentType: 'safety',
      agentName: 'Safety Profile Agent',
      completionStatus: 'complete',
      completionPercentage: 100,
      analyst: 'Patient Safety Team',
      lastUpdated: '2025-10-27',
      evidenceQuality: 'strong',
      recommendedAction: 'advance',
      rationale: 'Adverse event rates acceptable, monitoring plan established',
      keyFindings: [
        'Major adverse cardiac events (MACE): 1.5% in trials',
        'Dissection rate comparable to POBA',
        'No unique safety signals vs standard angioplasty',
        'Stop criteria: >10% MACE in pilot'
      ],
      criticalAssumptions: []
    },
    {
      agentType: 'population-health',
      agentName: 'Population Health Agent',
      completionStatus: 'complete',
      completionPercentage: 100,
      analyst: 'Population Health Team',
      lastUpdated: '2025-10-26',
      evidenceQuality: 'moderate',
      recommendedAction: 'advance',
      rationale: 'Expands treatment options, equity considerations addressed',
      keyFindings: [
        'Expands PCI options for small vessels',
        'Reduces need for repeat interventions',
        'Available regardless of payer mix (mission alignment)',
        'Quintuple Aim: Meets 3/5 dimensions'
      ],
      criticalAssumptions: []
    },
    {
      agentType: 'implementation',
      agentName: 'Implementation Feasibility Agent',
      completionStatus: 'complete',
      completionPercentage: 100,
      analyst: 'Operations Team',
      lastUpdated: '2025-10-29',
      evidenceQuality: 'strong',
      recommendedAction: 'advance',
      rationale: 'Feasible with existing cath lab infrastructure',
      keyFindings: [
        'No facility modifications required',
        'Training: 1-day proctoring per physician',
        'Competency: 5 proctored cases minimum',
        'Workflow integration: Minimal disruption',
        '2-week facility onboarding timeline'
      ],
      criticalAssumptions: []
    },
    {
      agentType: 'supply-chain',
      agentName: 'Supply Chain Reliability Agent',
      completionStatus: 'complete',
      completionPercentage: 100,
      analyst: 'Supply Chain Team',
      lastUpdated: '2025-10-24',
      evidenceQuality: 'strong',
      recommendedAction: 'advance',
      rationale: 'Vendor reliable, backup options identified',
      keyFindings: [
        'Vendor: Boston Scientific (established partner)',
        'Distribution: Direct from manufacturer',
        'Lead time: 2-week standard delivery',
        'Backup vendors: Medtronic, Abbott',
        'Contract terms: Standard pricing, no minimums'
      ],
      criticalAssumptions: []
    },
    {
      agentType: 'quality',
      agentName: 'Quality Measures Agent',
      completionStatus: 'complete',
      completionPercentage: 100,
      analyst: 'Quality Improvement Team',
      lastUpdated: '2025-10-31',
      evidenceQuality: 'strong',
      recommendedAction: 'advance',
      rationale: 'Outcome tracking plan using ACC NCDR registry',
      keyFindings: [
        'Primary outcome: TLR at 12 months',
        'Secondary: Procedural success, safety events',
        'Registry: ACC NCDR CathPCI participation',
        'Reporting: Quarterly dashboard to cardiovascular VAT',
        'Benchmarking: National data available'
      ],
      criticalAssumptions: []
    }
  ],

  // Three-Pillar Review (Kaizen Nov 14, 2025)
  threePillarReview: {
    kaizenDate: '2025-11-14',
    kaizenDuration: 90,
    attendees: [
      'Dr. Nezar Falluji (Clinical)',
      'Larry Blumenthal (Financial)',
      'Operations Lead (Operations)',
      'Doug Barnaby (Facilitator)'
    ],
    votes: {
      clinical: {
        leader: 'Dr. Nezar Falluji',
        decision: 'advance',
        rationale: 'Evidence supports selective use in eligible patients',
        timestamp: '2025-11-14T14:45:00'
      },
      financial: {
        leader: 'Larry Blumenthal',
        decision: 'advance',
        rationale: 'Tier 2 classification appropriate, risk acceptable',
        timestamp: '2025-11-14T14:47:00'
      },
      operations: {
        leader: 'Operations Lead',
        decision: 'advance',
        rationale: 'Implementation feasible, training plan solid',
        timestamp: '2025-11-14T14:48:00'
      }
    },
    unanimousConsent: true,
    decisionOutcome: 'advance',
    conditions: [
      'Tier 2 (Conditional Permission)',
      'Limited to 5 facilities (CCR >0.50)',
      'Usage target: 3-10% of eligible cases',
      'Monthly financial review',
      'Quarterly safety review'
    ],
    keyDecision: 'Unanimous ADVANCE with Tier 2 conditions. All three pillars aligned on usage limits and facility selection criteria.'
  },

  // Pilot Monitoring - Current Performance (3 months: Jan-Mar 2026)
  pilotMonitoring: {
    pilotStart: '2026-01-15',
    monthsCompleted: 3,
    totalCasesPerformed: 45,
    targetCases: 100,
    facilities: [
      { name: 'St. Mary Medical Center', ccr: 0.58, state: 'CA', cases: 12 },
      { name: 'Mercy Hospital', ccr: 0.62, state: 'TX', cases: 10 },
      { name: 'CommonSpirit Regional', ccr: 0.55, state: 'IL', cases: 8 },
      { name: 'Sacred Heart Medical', ccr: 0.60, state: 'WA', cases: 9 },
      { name: 'Providence Medical', ccr: 0.52, state: 'NY', cases: 6 }
    ],
    
    // Domain Performance
    clinicalDomain: {
      owner: 'Dr. Nezar Falluji',
      status: 'meeting',
      metrics: [
        { name: 'TLR Rate', threshold: 15, current: 12, unit: '%', status: 'meeting', trend: 'stable' },
        { name: 'Procedural Success', threshold: 95, current: 98, unit: '%', status: 'meeting', trend: 'stable' },
        { name: 'MACE Rate', threshold: 5, current: 1.5, unit: '%', status: 'meeting', trend: 'stable' }
      ],
      evidenceQuality: 'strong'
    },
    financialDomain: {
      owner: 'Larry Blumenthal',
      status: 'meeting',
      metrics: [
        { name: 'Avg Margin', threshold: 0, current: 150, unit: '$', status: 'meeting', trend: 'stable' },
        { name: 'Usage Rate', threshold: 10, current: 7, unit: '%', status: 'meeting', trend: 'stable' },
        { name: 'Total Impact', threshold: 0, current: 6750, unit: '$', status: 'meeting', trend: 'improving' }
      ],
      evidenceQuality: 'strong'
    },
    operationsDomain: {
      owner: 'Operations Lead',
      status: 'meeting',
      metrics: [
        { name: 'Facility Adoption', threshold: 5, current: 5, unit: 'facilities', status: 'meeting', trend: 'stable' },
        { name: 'Training Complete', threshold: 100, current: 100, unit: '%', status: 'meeting', trend: 'stable' },
        { name: 'Stock-Outs', threshold: 5, current: 0, unit: '%', status: 'meeting', trend: 'stable' }
      ],
      evidenceQuality: 'strong'
    },

    // Monthly Data Trend
    monthlyTrend: [
      { month: 'Jan 2026', cases: 12, tlr: 0, mace: 0, usageRate: 6, margin: 140 },
      { month: 'Feb 2026', cases: 18, tlr: 1, mace: 0, usageRate: 7.5, margin: 155 },
      { month: 'Mar 2026', cases: 15, tlr: 1, mace: 1, usageRate: 7, margin: 150 }
    ],

    // Key Uncertainties - All Resolved
    uncertainties: [
      {
        question: 'Will physicians adopt AGENT DCB at target rates?',
        status: 'resolved',
        evidence: '7% usage rate achieved (target: 3-10%)',
        resolvedDate: '2026-02-28'
      },
      {
        question: 'Will TLR rates match trial data?',
        status: 'resolved',
        evidence: '12% TLR rate (below 15% threshold)',
        resolvedDate: '2026-03-31'
      },
      {
        question: 'Will financial projections hold?',
        status: 'resolved',
        evidence: '+$150/case average margin achieved',
        resolvedDate: '2026-03-31'
      }
    ],

    // Phase Transition Status
    phaseTransition: {
      readyToAdvance: true,
      evidenceAccumulated: 95,
      recommendation: 'ADVANCE to Scale',
      rationale: 'All three domains meeting thresholds. Key uncertainties resolved. Strong evidence quality. Usage at 7% (within target). Physician adoption successful. Safety profile as expected.',
      nextPhase: 'Scale to additional facilities (CCR >0.45)',
      nextReviewDate: '2026-04-15'
    }
  }
};

export default agentDCBData;
