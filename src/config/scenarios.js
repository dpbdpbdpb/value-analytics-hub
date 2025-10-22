/**
 * Shared Scenario Configuration
 *
 * This file defines the 5 standardized vendor consolidation scenarios
 * used across all decision canvases in the Value Analytics Hub.
 *
 * All scenarios include volume-weighted adoption risk calculations.
 */

export const SCENARIO_IDS = {
  STATUS_QUO: 'status-quo',
  TRI_VENDOR: 'tri-vendor',
  DUAL_PREMIUM: 'dual-premium',
  DUAL_VALUE: 'dual-value',
  DUAL_INNOVATION: 'dual-innovation'
};

export const SCENARIO_NAMES = {
  [SCENARIO_IDS.STATUS_QUO]: 'Status Quo',
  [SCENARIO_IDS.TRI_VENDOR]: 'Tri-Vendor',
  [SCENARIO_IDS.DUAL_PREMIUM]: 'Dual-Vendor: Premium',
  [SCENARIO_IDS.DUAL_VALUE]: 'Dual-Vendor: Value',
  [SCENARIO_IDS.DUAL_INNOVATION]: 'Dual-Vendor: Innovation'
};

const DEFAULT_AGENT_SCORES = {
  [SCENARIO_IDS.STATUS_QUO]: 2.1,
  [SCENARIO_IDS.TRI_VENDOR]: 3.8,
  [SCENARIO_IDS.DUAL_PREMIUM]: 4.3,
  [SCENARIO_IDS.DUAL_VALUE]: 4.5,
  [SCENARIO_IDS.DUAL_INNOVATION]: 4.0
};

/**
 * Calculate volume-weighted adoption risk for a scenario
 *
 * @param {Array} surgeons - Array of surgeon objects with volume and vendor data
 * @param {Array} scenarioVendors - List of vendors in the scenario
 * @param {number} totalCases - Total cases across all surgeons
 * @returns {Object} Volume-weighted risk metrics
 */
export const calculateVolumeWeightedRisk = (surgeons, scenarioVendors, totalCases) => {
  if (!surgeons || surgeons.length === 0) {
    return {
      highVolumeSurgeonsAffected: 0,
      mediumVolumeSurgeonsAffected: 0,
      lowVolumeSurgeonsAffected: 0,
      totalSurgeonsAffected: 0,
      casesAtRisk: 0,
      casesAtRiskPercent: 0,
      revenueAtRisk: 0,
      loyalistsAffected: 0,
      riskScore: 0
    };
  };

  const VOLUME_THRESHOLDS = {
    HIGH: 500,    // >500 cases/year
    MEDIUM: 200   // 200-500 cases/year
  };

  const LOYALTY_THRESHOLD = 0.90; // 90%+ single-vendor preference

  let highVolumeSurgeonsAffected = 0;
  let mediumVolumeSurgeonsAffected = 0;
  let lowVolumeSurgeonsAffected = 0;
  let casesAtRisk = 0;
  let revenueAtRisk = 0;
  let loyalistsAffected = 0;

  surgeons.forEach(surgeon => {
    // Determine if surgeon needs to switch vendors
    const primaryVendor = surgeon.primaryVendor;
    const primaryVendorPercent = surgeon.primaryVendorPercent || 0;
    const mustSwitch = !scenarioVendors.includes(primaryVendor);

    if (mustSwitch) {
      const annualVolume = surgeon.annualVolume || 0;
      const annualSpend = surgeon.annualSpend || 0;

      // Categorize by volume
      if (annualVolume >= VOLUME_THRESHOLDS.HIGH) {
        highVolumeSurgeonsAffected++;
      } else if (annualVolume >= VOLUME_THRESHOLDS.MEDIUM) {
        mediumVolumeSurgeonsAffected++;
      } else {
        lowVolumeSurgeonsAffected++;
      }

      // Track cases and revenue at risk
      casesAtRisk += annualVolume;
      revenueAtRisk += annualSpend;

      // Track loyalists (surgeons who use one vendor >90% of the time)
      if (primaryVendorPercent >= LOYALTY_THRESHOLD) {
        loyalistsAffected++;
      }
    }
  });

  const totalSurgeonsAffected = highVolumeSurgeonsAffected + mediumVolumeSurgeonsAffected + lowVolumeSurgeonsAffected;
  const casesAtRiskPercent = totalCases > 0 ? (casesAtRisk / totalCases) * 100 : 0;

  // Calculate overall risk score (0-10 scale)
  // Weight high-volume surgeons more heavily
  const volumeWeightedScore = (
    (highVolumeSurgeonsAffected * 5) +
    (mediumVolumeSurgeonsAffected * 3) +
    (lowVolumeSurgeonsAffected * 1)
  ) / surgeons.length;

  const loyaltyScore = (loyalistsAffected / totalSurgeonsAffected || 0) * 3;
  const caseRiskScore = (casesAtRiskPercent / 100) * 2;

  const riskScore = Math.min(10, volumeWeightedScore + loyaltyScore + caseRiskScore);

  return {
    highVolumeSurgeonsAffected,
    mediumVolumeSurgeonsAffected,
    lowVolumeSurgeonsAffected,
    totalSurgeonsAffected,
    casesAtRisk: Math.round(casesAtRisk),
    casesAtRiskPercent: parseFloat(casesAtRiskPercent.toFixed(1)),
    revenueAtRisk: Math.round(revenueAtRisk),
    loyalistsAffected,
    riskScore: parseFloat(riskScore.toFixed(1))
  };
};

/**
 * Generate standardized scenarios with volume-weighted risk
 *
 * @param {Object} realData - Raw data from orthopedic-data.json
 * @returns {Object} Standardized scenarios with risk calculations
 */
export const generateScenarios = (realData) => {
  if (!realData) {
    return generatePlaceholderScenarios();
  }

  const getAgentScore = (scenarioId) => {
    const dataScore = realData?.scenarios?.[scenarioId]?.agentScore;
    if (typeof dataScore === 'number' && !Number.isNaN(dataScore)) {
      return dataScore;
    }
    return DEFAULT_AGENT_SCORES[scenarioId] ?? 3.5;
  };

  const totalCases = realData.metadata?.totalCases || 0;
  const baselineSpend = (realData.metadata?.totalSpend || 0) / 1000000; // Convert to millions
  const surgeons = realData.surgeons || [];

  const scenarios = {
    [SCENARIO_IDS.STATUS_QUO]: {
      id: SCENARIO_IDS.STATUS_QUO,
      name: SCENARIO_NAMES[SCENARIO_IDS.STATUS_QUO],
      shortName: 'Status Quo',
      description: 'Continue with current multi-vendor fragmentation across all vendors',
      vendors: ['ZIMMER BIOMET', 'STRYKER', 'J&J', 'SMITH & NEPHEW', 'CONFORMIS'],
      vendorCount: 5,
      savingsPercent: 0,
      annualSavings: 0,
      savingsRange: { conservative: 0, expected: 0, optimistic: 0 },
      adoptionRate: 100,
      riskLevel: 'low',
      baselineCost: realData.metadata?.totalSpend || 0,
      implementation: {
        complexity: 'Low',
        timeline: 0,
        costMillions: 0
      },
      breakdown: {
        volumeAggregation: 0,
        priceOptimization: 0,
        inventoryOptimization: 0,
        adminEfficiency: 0
      },
      quintupleMissionScore: 45,
      npv5Year: 0,
      agentScore: getAgentScore(SCENARIO_IDS.STATUS_QUO)
    },
    [SCENARIO_IDS.TRI_VENDOR]: {
      id: SCENARIO_IDS.TRI_VENDOR,
      name: SCENARIO_NAMES[SCENARIO_IDS.TRI_VENDOR],
      shortName: 'Tri-Vendor',
      description: 'Balanced approach with three major vendors (Zimmer + Stryker + J&J)',
      vendors: ['ZIMMER BIOMET', 'STRYKER', 'J&J'],
      vendorCount: 3,
      savingsPercent: 12,
      annualSavings: baselineSpend * 0.12,
      savingsRange: {
        conservative: baselineSpend * 0.12 * 0.85,
        expected: baselineSpend * 0.12,
        optimistic: baselineSpend * 0.12 * 1.15
      },
      adoptionRate: 92,
      riskLevel: 'low',
      baselineCost: realData.metadata?.totalSpend || 0,
      implementation: {
        complexity: 'Medium',
        timeline: 10,
        costMillions: 2.2
      },
      breakdown: {
        volumeAggregation: baselineSpend * 0.12 * 0.45,
        priceOptimization: baselineSpend * 0.12 * 0.40,
        inventoryOptimization: baselineSpend * 0.12 * 0.10,
        adminEfficiency: baselineSpend * 0.12 * 0.05
      },
      quintupleMissionScore: 82,
      npv5Year: baselineSpend * 0.12 * 5 - 2.2,
      vendorSplit: { zimmer_biomet: 40, stryker: 35, j_j: 25 },
      agentScore: getAgentScore(SCENARIO_IDS.TRI_VENDOR)
    },
    [SCENARIO_IDS.DUAL_PREMIUM]: {
      id: SCENARIO_IDS.DUAL_PREMIUM,
      name: SCENARIO_NAMES[SCENARIO_IDS.DUAL_PREMIUM],
      shortName: 'Premium',
      description: 'Premium vendors focus (Stryker + Zimmer) - highest quality, moderate savings',
      vendors: ['STRYKER', 'ZIMMER BIOMET'],
      vendorCount: 2,
      savingsPercent: 15,
      annualSavings: baselineSpend * 0.15,
      savingsRange: {
        conservative: baselineSpend * 0.15 * 0.80,
        expected: baselineSpend * 0.15,
        optimistic: baselineSpend * 0.15 * 1.20
      },
      adoptionRate: 88,
      riskLevel: 'medium',
      baselineCost: realData.metadata?.totalSpend || 0,
      implementation: {
        complexity: 'High',
        timeline: 14,
        costMillions: 2.8
      },
      breakdown: {
        volumeAggregation: baselineSpend * 0.15 * 0.50,
        priceOptimization: baselineSpend * 0.15 * 0.35,
        inventoryOptimization: baselineSpend * 0.15 * 0.10,
        adminEfficiency: baselineSpend * 0.15 * 0.05
      },
      quintupleMissionScore: 85,
      npv5Year: baselineSpend * 0.15 * 5 - 2.8,
      vendorSplit: { stryker: 55, zimmer_biomet: 45 },
      agentScore: getAgentScore(SCENARIO_IDS.DUAL_PREMIUM)
    },
    [SCENARIO_IDS.DUAL_VALUE]: {
      id: SCENARIO_IDS.DUAL_VALUE,
      name: SCENARIO_NAMES[SCENARIO_IDS.DUAL_VALUE],
      shortName: 'Value',
      description: 'Value-focused consolidation (Zimmer + J&J) - strong savings, good quality',
      vendors: ['ZIMMER BIOMET', 'J&J'],
      vendorCount: 2,
      savingsPercent: 18,
      annualSavings: baselineSpend * 0.18,
      savingsRange: {
        conservative: baselineSpend * 0.18 * 0.85,
        expected: baselineSpend * 0.18,
        optimistic: baselineSpend * 0.18 * 1.15
      },
      adoptionRate: 85,
      riskLevel: 'medium',
      baselineCost: realData.metadata?.totalSpend || 0,
      implementation: {
        complexity: 'High',
        timeline: 16,
        costMillions: 3.0
      },
      breakdown: {
        volumeAggregation: baselineSpend * 0.18 * 0.45,
        priceOptimization: baselineSpend * 0.18 * 0.40,
        inventoryOptimization: baselineSpend * 0.18 * 0.10,
        adminEfficiency: baselineSpend * 0.18 * 0.05
      },
      quintupleMissionScore: 78,
      npv5Year: baselineSpend * 0.18 * 5 - 3.0,
      vendorSplit: { zimmer_biomet: 60, j_j: 40 },
      agentScore: getAgentScore(SCENARIO_IDS.DUAL_VALUE)
    },
    [SCENARIO_IDS.DUAL_INNOVATION]: {
      id: SCENARIO_IDS.DUAL_INNOVATION,
      name: SCENARIO_NAMES[SCENARIO_IDS.DUAL_INNOVATION],
      shortName: 'Innovation',
      description: 'Innovation-focused (Stryker + J&J) - leading technology, higher adoption risk',
      vendors: ['STRYKER', 'J&J'],
      vendorCount: 2,
      savingsPercent: 16,
      annualSavings: baselineSpend * 0.16,
      savingsRange: {
        conservative: baselineSpend * 0.16 * 0.80,
        expected: baselineSpend * 0.16,
        optimistic: baselineSpend * 0.16 * 1.20
      },
      adoptionRate: 82,
      riskLevel: 'high',
      baselineCost: realData.metadata?.totalSpend || 0,
      implementation: {
        complexity: 'High',
        timeline: 18,
        costMillions: 3.2
      },
      breakdown: {
        volumeAggregation: baselineSpend * 0.16 * 0.45,
        priceOptimization: baselineSpend * 0.16 * 0.40,
        inventoryOptimization: baselineSpend * 0.16 * 0.10,
        adminEfficiency: baselineSpend * 0.16 * 0.05
      },
      quintupleMissionScore: 80,
      npv5Year: baselineSpend * 0.16 * 5 - 3.2,
      vendorSplit: { stryker: 50, j_j: 50 },
      agentScore: getAgentScore(SCENARIO_IDS.DUAL_INNOVATION)
    }
  };

  // Calculate volume-weighted risk for each scenario
  Object.keys(scenarios).forEach(scenarioId => {
    const scenario = scenarios[scenarioId];
    const volumeWeightedRisk = calculateVolumeWeightedRisk(
      surgeons,
      scenario.vendors,
      totalCases
    );
    scenarios[scenarioId].volumeWeightedRisk = volumeWeightedRisk;
    scenarios[scenarioId].riskScore = volumeWeightedRisk.riskScore;
  });

  return scenarios;
};

/**
 * Generate placeholder scenarios for loading state
 */
const generatePlaceholderScenarios = () => {
  const createPlaceholderScenario = (scenarioId) => ({
    id: scenarioId,
    name: `${SCENARIO_NAMES[scenarioId] || 'Scenario'} (Loading...)`,
    shortName: 'Loading...',
    description: 'Loading data...',
    vendors: [],
    vendorCount: 0,
    savingsPercent: 0,
    annualSavings: 0,
    savingsRange: { conservative: 0, expected: 0, optimistic: 0 },
    adoptionRate: 0,
    riskLevel: 'loading',
    riskScore: 0,
    agentScore: DEFAULT_AGENT_SCORES[scenarioId] ?? 3.5,
    quintupleMissionScore: 0,
    npv5Year: 0,
    implementation: {
      complexity: 'Unknown',
      timeline: 0,
      costMillions: 0
    },
    breakdown: {
      volumeAggregation: 0,
      priceOptimization: 0,
      inventoryOptimization: 0,
      adminEfficiency: 0
    },
    vendorSplit: {}
  });

  return {
    [SCENARIO_IDS.STATUS_QUO]: createPlaceholderScenario(SCENARIO_IDS.STATUS_QUO),
    [SCENARIO_IDS.TRI_VENDOR]: createPlaceholderScenario(SCENARIO_IDS.TRI_VENDOR),
    [SCENARIO_IDS.DUAL_PREMIUM]: createPlaceholderScenario(SCENARIO_IDS.DUAL_PREMIUM),
    [SCENARIO_IDS.DUAL_VALUE]: createPlaceholderScenario(SCENARIO_IDS.DUAL_VALUE),
    [SCENARIO_IDS.DUAL_INNOVATION]: createPlaceholderScenario(SCENARIO_IDS.DUAL_INNOVATION)
  };
};

export default {
  SCENARIO_IDS,
  SCENARIO_NAMES,
  generateScenarios,
  calculateVolumeWeightedRisk
};
