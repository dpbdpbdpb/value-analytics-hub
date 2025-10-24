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

// Helper to format vendor names for display
const formatVendorNames = (vendors) => {
  if (!vendors || vendors.length === 0) return '';
  const shortNames = vendors.map(v => {
    const upper = v.toUpperCase();
    if (upper.includes('ZIMMER')) return 'Zimmer';
    if (upper.includes('STRYKER')) return 'Stryker';
    if (upper.includes('J&J') || upper.includes('JOHNSON')) return 'J&J';
    if (upper.includes('SMITH')) return 'Smith & Nephew';
    return v;
  });
  return shortNames.join(' + ');
};

export const SCENARIO_NAMES = {
  [SCENARIO_IDS.STATUS_QUO]: 'Status Quo',
  [SCENARIO_IDS.TRI_VENDOR]: 'Tri-Source (Zimmer + Stryker + J&J)',
  [SCENARIO_IDS.DUAL_PREMIUM]: 'Stryker + Zimmer',
  [SCENARIO_IDS.DUAL_VALUE]: 'Zimmer + J&J',
  [SCENARIO_IDS.DUAL_INNOVATION]: 'Stryker + J&J'
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
    // Calculate primary vendor from vendors object
    let primaryVendor = 'Unknown';
    let primaryVendorCases = 0;
    let primaryVendorPercent = 0;

    if (surgeon.vendors && typeof surgeon.vendors === 'object') {
      // Find vendor with most cases
      Object.entries(surgeon.vendors).forEach(([vendorName, vendorData]) => {
        const cases = vendorData.cases || 0;
        if (cases > primaryVendorCases) {
          primaryVendorCases = cases;
          primaryVendor = vendorName;
        }
      });

      // Calculate percentage
      const totalCases = surgeon.totalCases || 0;
      if (totalCases > 0) {
        primaryVendorPercent = primaryVendorCases / totalCases;
      }
    }

    // Determine if surgeon needs to switch vendors
    const mustSwitch = !scenarioVendors.includes(primaryVendor);

    if (mustSwitch) {
      const annualVolume = surgeon.totalCases || 0;
      const annualSpend = surgeon.totalSpend || 0;

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
 * Calculate pricing cap feasibility and potential savings for a scenario
 *
 * Pricing cap feasibility is based on:
 * - Vendor count (more vendors = more competition = higher acceptance)
 * - Vendor characteristics (premium vs value vendors)
 * - Volume consolidation leverage
 *
 * @param {Array} vendors - List of vendors in the scenario
 * @param {Object} realData - Raw data from orthopedic-data.json
 * @returns {Object} Pricing cap metrics
 */
export const calculatePricingCapMetrics = (vendors, realData) => {
  // Calculate total pricing cap savings potential from matrix pricing
  const totalPricingCapPotential = realData.matrixPricing
    ? realData.matrixPricing.reduce((sum, item) => sum + (item.potentialSavings || 0), 0) / 1000000
    : 0;

  if (totalPricingCapPotential === 0 || !vendors || vendors.length === 0) {
    return {
      feasibilityPercent: 0,
      potentialSavings: 0,
      expectedSavings: 0,
      rational: 'No pricing cap data available'
    };
  }

  // Base feasibility by vendor count
  let feasibility = 0;
  if (vendors.length >= 4) {
    feasibility = 0.30; // Multiple vendors = good competition but harder to coordinate
  } else if (vendors.length === 3) {
    feasibility = 0.50; // Sweet spot: good competition + manageable coordination
  } else if (vendors.length === 2) {
    feasibility = 0.60; // Strong leverage with dual vendor model
  } else if (vendors.length === 1) {
    feasibility = 0.70; // Total control but highest risk if vendor walks
  }

  // Vendor characteristic adjustments
  const vendorNames = vendors.map(v => v.toUpperCase());

  // Premium vendors less willing to discount deeply
  if (vendorNames.includes('STRYKER')) {
    feasibility -= 0.10; // Premium brand, less flexible on pricing caps
  }

  // Value-focused vendors more willing to accept pricing caps
  if (vendorNames.includes('JOHNSON & JOHNSON') || vendorNames.includes('ZIMMER BIOMET')) {
    feasibility += 0.08; // More flexible, competitive pricing strategies
  }

  // Smaller vendors more willing to compete
  if (vendorNames.includes('SMITH & NEPHEW') && vendors.length <= 3) {
    feasibility += 0.07; // Hungry for market share
  }

  // Cap between 15% and 75%
  feasibility = Math.max(0.15, Math.min(0.75, feasibility));

  const expectedSavings = totalPricingCapPotential * feasibility;

  // Generate rationale
  let rationale = `${Math.round(feasibility * 100)}% likely to achieve pricing caps. `;
  if (vendors.length === 3) {
    rationale += 'Optimal vendor count for negotiating leverage.';
  } else if (vendors.length === 2) {
    rationale += 'Strong dual-vendor leverage for pricing caps.';
  } else if (vendors.length === 1) {
    rationale += 'Maximum control enables strict pricing enforcement.';
  } else {
    rationale += 'Competition among multiple vendors supports pricing discipline.';
  }

  return {
    feasibilityPercent: Math.round(feasibility * 100),
    potentialSavings: totalPricingCapPotential,
    expectedSavings: expectedSavings,
    rationale: rationale
  };
};

/**
 * Generate standardized scenarios with volume-weighted risk
 *
 * @param {Object} realData - Raw data from orthopedic-data.json
 * @returns {Object} Standardized scenarios with risk calculations
 */
export const generateScenarios = (realData) => {
  if (!realData || !realData.scenarios) {
    return generatePlaceholderScenarios();
  }

  const totalCases = realData.metadata?.totalCases || 0;
  const baselineSpend = (realData.metadata?.totalSpend || 0) / 1000000; // Convert to millions
  const surgeons = realData.surgeons || [];

  // Use ALL scenarios from the data file EXCEPT pricing-cap (it's now a metric, not a scenario)
  const scenarios = {};

  Object.keys(realData.scenarios).forEach(scenarioId => {
    // Skip the standalone pricing-cap scenario - it's now integrated as a metric
    if (scenarioId === 'pricing-cap') {
      return;
    }

    const dataScenario = realData.scenarios[scenarioId];
    const vendors = dataScenario.vendors || [];

    // Generate vendor-based name
    let displayName;
    if (scenarioId === 'status-quo') {
      displayName = 'Status Quo';
    } else if (vendors.length === 1) {
      displayName = `Single Vendor (${formatVendorNames(vendors)})`;
    } else {
      displayName = formatVendorNames(vendors);
    }

    scenarios[scenarioId] = {
      id: scenarioId,
      name: displayName,
      shortName: dataScenario.shortName || displayName,
      description: dataScenario.description || '',
      vendors: vendors,
      vendorCount: vendors.length,
      savingsPercent: (dataScenario.savingsPercent || 0) * 100,
      annualSavings: (dataScenario.annualSavings || 0) / 1000000, // Convert to millions
      savingsRange: {
        conservative: ((dataScenario.annualSavings || 0) * 0.85) / 1000000,
        expected: (dataScenario.annualSavings || 0) / 1000000,
        optimistic: ((dataScenario.annualSavings || 0) * 1.15) / 1000000
      },
      adoptionRate: (dataScenario.adoptionRate || 0) * 100,
      riskLevel: dataScenario.riskLevel || 'medium',
      baselineCost: realData.metadata?.totalSpend || 0,
      implementation: {
        complexity: dataScenario.implementation?.complexity || 'Medium',
        timeline: dataScenario.implementation?.timeline || 12,
        costMillions: dataScenario.implementation?.costMillions || 2.5
      },
      breakdown: {
        volumeAggregation: ((dataScenario.annualSavings || 0) * 0.45) / 1000000,
        priceOptimization: ((dataScenario.annualSavings || 0) * 0.40) / 1000000,
        inventoryOptimization: ((dataScenario.annualSavings || 0) * 0.10) / 1000000,
        adminEfficiency: ((dataScenario.annualSavings || 0) * 0.05) / 1000000
      },
      quintupleMissionScore: dataScenario.quintupleMissionScore || 75,
      npv5Year: (dataScenario.npv5Year || 0) / 1000000, // Convert to millions
      vendorSplit: dataScenario.vendorSplit || {},
      riskScore: dataScenario.riskScore || 5,
      roboticPlatformAlignment: dataScenario.roboticPlatformAlignment || null
    };
  });


  // Calculate volume-weighted risk and pricing cap metrics for each scenario
  Object.keys(scenarios).forEach(scenarioId => {
    const scenario = scenarios[scenarioId];

    // Calculate volume-weighted risk
    const volumeWeightedRisk = calculateVolumeWeightedRisk(
      surgeons,
      scenario.vendors,
      totalCases
    );
    scenarios[scenarioId].volumeWeightedRisk = volumeWeightedRisk;
    scenarios[scenarioId].riskScore = volumeWeightedRisk.riskScore;

    // Incorporate robotic platform alignment into risk score
    // Robotic misalignment adds significant switching barriers
    let adjustedRiskScore = volumeWeightedRisk.riskScore;

    if (scenario.roboticPlatformAlignment) {
      const alignment = scenario.roboticPlatformAlignment.alignmentScore;

      // Robotic misalignment increases risk:
      // <70% alignment: +2.0 risk points (critical stranded investment)
      // 70-80%: +1.5 risk points (high impact)
      // 80-90%: +0.5 risk points (moderate impact)
      // >90%: no adjustment (minimal impact)
      if (alignment < 70) {
        adjustedRiskScore += 2.0;
      } else if (alignment < 80) {
        adjustedRiskScore += 1.5;
      } else if (alignment < 90) {
        adjustedRiskScore += 0.5;
      }
    }

    // Cap at 10
    adjustedRiskScore = Math.min(10, adjustedRiskScore);
    scenarios[scenarioId].riskScore = adjustedRiskScore;

    // Derive riskLevel from adjusted riskScore for consistency
    const score = adjustedRiskScore;
    if (score <= 3) {
      scenarios[scenarioId].riskLevel = 'low';
    } else if (score <= 5) {
      scenarios[scenarioId].riskLevel = 'medium';
    } else if (score <= 7) {
      scenarios[scenarioId].riskLevel = 'medium-high';
    } else {
      scenarios[scenarioId].riskLevel = 'high';
    }

    // Calculate pricing cap metrics
    const pricingCapMetrics = calculatePricingCapMetrics(scenario.vendors, realData);
    scenarios[scenarioId].pricingCap = pricingCapMetrics;

    // Update total potential savings (base consolidation + pricing cap)
    scenarios[scenarioId].totalPotentialSavings =
      scenario.annualSavings + pricingCapMetrics.expectedSavings;
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
  calculateVolumeWeightedRisk,
  calculatePricingCapMetrics
};
