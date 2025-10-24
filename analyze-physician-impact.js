const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'public', 'data', 'hip-knee-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Helper: Calculate surgeon's primary vendor and loyalty
const analyzeSurgeon = (surgeon) => {
  const vendorList = Object.entries(surgeon.vendors || {}).map(([vendor, stats]) => ({
    vendor,
    cases: stats.cases || 0,
    spend: stats.spend || 0
  })).sort((a, b) => b.cases - a.cases);

  if (vendorList.length === 0) {
    return {
      primaryVendor: 'Unknown',
      primaryVendorCases: 0,
      primaryVendorSpend: 0,
      loyaltyPercent: 0,
      vendorCount: 0
    };
  }

  const primary = vendorList[0];
  const loyaltyPercent = surgeon.totalCases > 0 ? (primary.cases / surgeon.totalCases) * 100 : 0;

  return {
    primaryVendor: primary.vendor,
    primaryVendorCases: primary.cases,
    primaryVendorSpend: primary.spend,
    loyaltyPercent: loyaltyPercent,
    vendorCount: vendorList.length
  };
};

// Analyze impact for each scenario
const analyzeScenarioImpact = (scenario, surgeons) => {
  const preferredVendors = scenario.preferredVendors || [];

  const affectedSurgeons = surgeons.map(surgeon => {
    const analysis = analyzeSurgeon(surgeon);
    const isAffected = !preferredVendors.includes(analysis.primaryVendor);

    // Calculate risk score: volume × loyalty × spend (normalized)
    const volumeScore = surgeon.totalCases / 500; // Normalized to 0-1 (500+ cases = 1.0)
    const loyaltyScore = analysis.loyaltyPercent / 100;
    const spendScore = surgeon.totalSpend / 500000; // Normalized to 0-1 ($500k+ = 1.0)
    const riskScore = Math.min(10, (volumeScore + loyaltyScore + spendScore) * 3.33); // 0-10 scale

    return {
      name: surgeon.name,
      totalCases: surgeon.totalCases,
      totalSpend: surgeon.totalSpend,
      primaryVendor: analysis.primaryVendor,
      primaryVendorCases: analysis.primaryVendorCases,
      loyaltyPercent: analysis.loyaltyPercent,
      vendorCount: analysis.vendorCount,
      isAffected,
      riskScore: isAffected ? riskScore : 0,
      impactCategory: !isAffected ? 'None' :
                      riskScore >= 7 ? 'Critical' :
                      riskScore >= 5 ? 'High' :
                      riskScore >= 3 ? 'Medium' : 'Low'
    };
  }).sort((a, b) => b.riskScore - a.riskScore);

  const affected = affectedSurgeons.filter(s => s.isAffected);
  const critical = affected.filter(s => s.impactCategory === 'Critical');
  const high = affected.filter(s => s.impactCategory === 'High');

  return {
    totalSurgeons: surgeons.length,
    affectedCount: affected.length,
    affectedPercent: (affected.length / surgeons.length) * 100,
    criticalCount: critical.length,
    highCount: high.length,
    casesAtRisk: affected.reduce((sum, s) => sum + s.totalCases, 0),
    spendAtRisk: affected.reduce((sum, s) => sum + s.totalSpend, 0),
    affectedSurgeons,
    criticalSurgeons: critical,
    highRiskSurgeons: high
  };
};

console.log('PHYSICIAN IMPACT ANALYSIS');
console.log('═'.repeat(100));
console.log('Identifies surgeons who must switch vendors under each consolidation scenario');
console.log('Risk Score = Volume × Loyalty × Spend (0-10 scale)');
console.log('');

// Analyze each scenario
const scenarioImpacts = {};

Object.entries(data.scenarios).forEach(([scenarioId, scenario]) => {
  if (scenarioId === 'status-quo') {
    scenarioImpacts[scenarioId] = {
      totalSurgeons: data.surgeons.length,
      affectedCount: 0,
      affectedPercent: 0,
      criticalCount: 0,
      highCount: 0,
      casesAtRisk: 0,
      spendAtRisk: 0,
      affectedSurgeons: [],
      criticalSurgeons: [],
      highRiskSurgeons: []
    };
    return;
  }

  const impact = analyzeScenarioImpact(scenario, data.surgeons);
  scenarioImpacts[scenarioId] = impact;

  console.log(`\n${scenario.name}`);
  console.log('─'.repeat(100));
  console.log(`Preferred Vendors: ${scenario.preferredVendors.join(', ')}`);
  console.log(`Volume Commitment: ${(scenario.volumeCommitment * 100).toFixed(0)}% Tier 1`);
  console.log('');
  console.log(`Surgeons Affected: ${impact.affectedCount} of ${impact.totalSurgeons} (${impact.affectedPercent.toFixed(1)}%)`);
  console.log(`  - Critical Risk: ${impact.criticalCount} surgeons`);
  console.log(`  - High Risk:     ${impact.highCount} surgeons`);
  console.log(`Cases at Risk:     ${impact.casesAtRisk.toLocaleString()} cases`);
  console.log(`Spend at Risk:     $${(impact.spendAtRisk / 1000000).toFixed(2)}M`);

  if (impact.criticalSurgeons.length > 0) {
    console.log('');
    console.log('CRITICAL RISK SURGEONS (Highest Priority for Engagement):');
    console.log('─'.repeat(100));
    console.log('Surgeon'.padEnd(35) + 'Volume'.padStart(8) + 'Primary Vendor'.padStart(20) + 'Loyalty'.padStart(10) + 'Risk'.padStart(8));
    console.log('─'.repeat(100));

    impact.criticalSurgeons.slice(0, 10).forEach(s => {
      console.log(
        `${s.name.substring(0, 34).padEnd(35)}` +
        `${s.totalCases.toString().padStart(8)}` +
        `${s.primaryVendor.substring(0, 18).padStart(20)}` +
        `${s.loyaltyPercent.toFixed(0)}%`.padStart(10) +
        `${s.riskScore.toFixed(1).padStart(8)}`
      );
    });

    if (impact.criticalSurgeons.length > 10) {
      console.log(`... and ${impact.criticalSurgeons.length - 10} more critical risk surgeons`);
    }
  }

  if (impact.highRiskSurgeons.length > 0 && impact.highRiskSurgeons.length <= 15) {
    console.log('');
    console.log('HIGH RISK SURGEONS:');
    console.log('─'.repeat(100));

    impact.highRiskSurgeons.forEach(s => {
      console.log(
        `${s.name.substring(0, 34).padEnd(35)}` +
        `${s.totalCases.toString().padStart(8)}` +
        `${s.primaryVendor.substring(0, 18).padStart(20)}` +
        `${s.loyaltyPercent.toFixed(0)}%`.padStart(10) +
        `${s.riskScore.toFixed(1).padStart(8)}`
      );
    });
  } else if (impact.highRiskSurgeons.length > 15) {
    console.log(`\n  ${impact.highRiskSurgeons.length} high risk surgeons identified (use dashboard for full list)`);
  }
});

// Add impact analysis to scenarios
Object.entries(data.scenarios).forEach(([scenarioId, scenario]) => {
  scenario.physicianImpact = {
    affectedCount: scenarioImpacts[scenarioId].affectedCount,
    affectedPercent: Number(scenarioImpacts[scenarioId].affectedPercent.toFixed(1)),
    criticalCount: scenarioImpacts[scenarioId].criticalCount,
    highRiskCount: scenarioImpacts[scenarioId].highCount,
    casesAtRisk: scenarioImpacts[scenarioId].casesAtRisk,
    spendAtRisk: Math.round(scenarioImpacts[scenarioId].spendAtRisk)
  };
});

// Save updated scenarios
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log('\n\n✓ Physician impact analysis added to all scenarios!');
console.log('\nSummary by Scenario:');
console.log('═'.repeat(100));
console.log('Scenario'.padEnd(35) + 'Affected'.padStart(12) + 'Critical'.padStart(12) + 'High Risk'.padStart(12) + 'Cases at Risk'.padStart(15));
console.log('─'.repeat(100));

Object.entries(scenarioImpacts).forEach(([scenarioId, impact]) => {
  const scenario = data.scenarios[scenarioId];
  console.log(
    `${scenario.shortName.substring(0, 34).padEnd(35)}` +
    `${impact.affectedCount}`.padStart(12) +
    `${impact.criticalCount}`.padStart(12) +
    `${impact.highCount}`.padStart(12) +
    `${impact.casesAtRisk.toLocaleString().padStart(15)}`
  );
});

console.log('\n\nRecommendation: Start with scenarios that have LOWEST critical/high-risk surgeon counts');
console.log('This minimizes disruption to your highest-volume loyalist surgeons.');
