/**
 * Analyze if 90% spend compliance can be achieved by exempting high/medium risk hospitals
 *
 * This script calculates:
 * 1. Current spend distribution by vendor
 * 2. Spend by hospital risk level
 * 3. Whether excluding high/medium risk hospitals allows 90% compliance
 */

const fs = require('fs');

const hipKneeData = JSON.parse(fs.readFileSync('./public/data/hip-knee-data.json', 'utf8'));

// Configuration
const LOYALTY_THRESHOLD = 0.70; // 70%+ preference for single vendor
const HIGH_VOLUME_THRESHOLD = 200; // cases/year

// Scenario configurations (from scenarios.js)
const SCENARIOS = {
  'dual-premium': {
    name: 'Stryker + Zimmer',
    vendors: ['STRYKER', 'ZIMMER BIOMET']
  },
  'dual-value': {
    name: 'Zimmer + J&J',
    vendors: ['ZIMMER BIOMET', 'JOHNSON & JOHNSON']
  },
  'dual-innovation': {
    name: 'Stryker + J&J',
    vendors: ['STRYKER', 'JOHNSON & JOHNSON']
  }
};

// Calculate vendor spend totals
const vendorSpend = {};
hipKneeData.surgeons.forEach(s => {
  if (s.vendors) {
    Object.entries(s.vendors).forEach(([vendor, vdata]) => {
      vendorSpend[vendor] = (vendorSpend[vendor] || 0) + (vdata.spend || 0);
    });
  }
});

console.log('='.repeat(80));
console.log('VENDOR CONSOLIDATION ANALYSIS: Risk Exemption Impact');
console.log('='.repeat(80));
console.log();
console.log(`Total System Spend: $${(hipKneeData.metadata.totalSpend/1000000).toFixed(2)}M`);
console.log(`Total Surgeons: ${hipKneeData.surgeons.length}`);
console.log(`Total Cases: ${hipKneeData.metadata.totalCases.toLocaleString()}`);
console.log();

// Analyze each scenario
Object.entries(SCENARIOS).forEach(([scenarioId, scenario]) => {
  console.log('='.repeat(80));
  console.log(`SCENARIO: ${scenario.name}`);
  console.log('='.repeat(80));
  console.log();

  const scenarioVendors = scenario.vendors;

  // Analyze each surgeon
  const surgeonAnalysis = hipKneeData.surgeons.map(surgeon => {
    const volume = surgeon.totalCases || 0;
    const volumeCategory = volume >= HIGH_VOLUME_THRESHOLD ? 'high' : 'medium';

    // Calculate primary vendor
    let primaryVendor = 'Unknown';
    let primaryVendorCases = 0;
    let primaryVendorPercent = 0;
    let primaryVendorSpend = 0;

    if (surgeon.vendors) {
      Object.entries(surgeon.vendors).forEach(([vendorName, vendorData]) => {
        const cases = vendorData.cases || 0;
        if (cases > primaryVendorCases) {
          primaryVendorCases = cases;
          primaryVendor = vendorName;
          primaryVendorSpend = vendorData.spend || 0;
        }
      });

      if (volume > 0) {
        primaryVendorPercent = primaryVendorCases / volume;
      }
    }

    const isLoyalist = primaryVendorPercent >= LOYALTY_THRESHOLD;
    const mustTransition = isLoyalist && !scenarioVendors.includes(primaryVendor);
    const isHighVolumeLoyalist = mustTransition && volumeCategory === 'high' && isLoyalist;

    // Calculate total surgeon spend
    let totalSpend = 0;
    if (surgeon.vendors) {
      Object.values(surgeon.vendors).forEach(v => {
        totalSpend += (v.spend || 0);
      });
    }

    return {
      name: surgeon.name,
      facility: surgeon.facility,
      region: surgeon.region,
      volume,
      volumeCategory,
      primaryVendor,
      primaryVendorPercent,
      isLoyalist,
      mustTransition,
      isHighVolumeLoyalist,
      totalSpend,
      vendors: surgeon.vendors
    };
  });

  // Calculate hospital risk levels
  const hospitalData = {};
  surgeonAnalysis.forEach(surgeon => {
    const facility = surgeon.facility || 'Unassigned';
    if (!hospitalData[facility]) {
      hospitalData[facility] = {
        surgeons: [],
        totalSpend: 0,
        totalCases: 0,
        loyalistsNeedingTransition: 0,
        highVolumeLoyalists: 0
      };
    }

    hospitalData[facility].surgeons.push(surgeon);
    hospitalData[facility].totalSpend += surgeon.totalSpend;
    hospitalData[facility].totalCases += surgeon.volume;

    if (surgeon.mustTransition) {
      hospitalData[facility].loyalistsNeedingTransition++;
    }
    if (surgeon.isHighVolumeLoyalist) {
      hospitalData[facility].highVolumeLoyalists++;
    }
  });

  // Calculate sherpa capacity and risk levels for each hospital
  Object.entries(hospitalData).forEach(([facility, data]) => {
    const sherpas = data.surgeons.filter(s => !s.mustTransition && s.volume >= 30);
    const sherpaCapacity = sherpas.reduce((sum, s) => sum + (s.volume / 100), 0);
    const sherpaRatio = data.loyalistsNeedingTransition > 0 ? sherpaCapacity / data.loyalistsNeedingTransition : 0;

    // Risk assessment logic (from ExecutiveDashboard.jsx lines 1492-1513)
    let riskLevel = 'Low';
    if (data.highVolumeLoyalists >= 3) {
      if (sherpaRatio < 1.5) {
        riskLevel = 'High';
      } else if (sherpaRatio < 2.5) {
        riskLevel = 'Medium';
      }
    } else if (data.highVolumeLoyalists === 2) {
      if (sherpaRatio < 0.8) {
        riskLevel = 'High';
      } else if (sherpaRatio < 2) {
        riskLevel = 'Medium';
      }
    } else if (data.highVolumeLoyalists === 1) {
      if (sherpaRatio < 1) {
        riskLevel = 'Medium';
      }
    }

    data.riskLevel = riskLevel;
    data.sherpaCapacity = sherpaCapacity;
    data.sherpaRatio = sherpaRatio;
  });

  // Aggregate by risk level
  const riskLevelStats = {
    'Low': { hospitals: 0, spend: 0, cases: 0 },
    'Medium': { hospitals: 0, spend: 0, cases: 0 },
    'High': { hospitals: 0, spend: 0, cases: 0 }
  };

  Object.entries(hospitalData).forEach(([facility, data]) => {
    riskLevelStats[data.riskLevel].hospitals++;
    riskLevelStats[data.riskLevel].spend += data.totalSpend;
    riskLevelStats[data.riskLevel].cases += data.totalCases;
  });

  // Calculate spend by vendor across all hospitals
  const totalSpendByVendor = {};
  surgeonAnalysis.forEach(s => {
    if (s.vendors) {
      Object.entries(s.vendors).forEach(([vendor, vdata]) => {
        totalSpendByVendor[vendor] = (totalSpendByVendor[vendor] || 0) + (vdata.spend || 0);
      });
    }
  });

  // Calculate spend by vendor for LOW RISK hospitals only
  const lowRiskSpendByVendor = {};
  Object.entries(hospitalData).forEach(([facility, data]) => {
    if (data.riskLevel === 'Low') {
      data.surgeons.forEach(s => {
        if (s.vendors) {
          Object.entries(s.vendors).forEach(([vendor, vdata]) => {
            lowRiskSpendByVendor[vendor] = (lowRiskSpendByVendor[vendor] || 0) + (vdata.spend || 0);
          });
        }
      });
    }
  });

  // Calculate compliance percentages
  const totalScenarioSpend = scenarioVendors.reduce((sum, v) => sum + (totalSpendByVendor[v] || 0), 0);
  const totalSystemSpend = Object.values(totalSpendByVendor).reduce((a, b) => a + b, 0);
  const currentCompliance = (totalScenarioSpend / totalSystemSpend) * 100;

  const lowRiskScenarioSpend = scenarioVendors.reduce((sum, v) => sum + (lowRiskSpendByVendor[v] || 0), 0);
  const lowRiskTotalSpend = riskLevelStats['Low'].spend;
  const lowRiskCompliance = lowRiskTotalSpend > 0 ? (lowRiskScenarioSpend / lowRiskTotalSpend) * 100 : 0;

  console.log('Hospital Risk Distribution:');
  console.log('-'.repeat(80));
  Object.entries(riskLevelStats).forEach(([risk, stats]) => {
    const pctSpend = (stats.spend / totalSystemSpend) * 100;
    console.log(`  ${risk.padEnd(8)} Risk: ${stats.hospitals.toString().padStart(3)} hospitals | ` +
                `$${(stats.spend/1000000).toFixed(2).padStart(6)}M (${pctSpend.toFixed(1)}%) | ` +
                `${stats.cases.toLocaleString().padStart(7)} cases`);
  });
  console.log();

  console.log('Vendor Spend Distribution (Current):');
  console.log('-'.repeat(80));
  const sorted = Object.entries(totalSpendByVendor).sort((a,b) => b[1] - a[1]).slice(0, 10);
  sorted.forEach(([vendor, spend]) => {
    const pct = (spend / totalSystemSpend) * 100;
    const inScenario = scenarioVendors.includes(vendor) ? ' ✓' : '';
    console.log(`  ${vendor.padEnd(25)} $${(spend/1000000).toFixed(2).padStart(6)}M (${pct.toFixed(1).padStart(5)}%)${inScenario}`);
  });
  console.log();

  console.log('Compliance Analysis:');
  console.log('-'.repeat(80));
  console.log(`  Current System-Wide Compliance: ${currentCompliance.toFixed(1)}%`);
  console.log(`    ${scenarioVendors.join(' + ')} spend: $${(totalScenarioSpend/1000000).toFixed(2)}M`);
  console.log();
  console.log(`  LOW RISK Hospitals Only Compliance: ${lowRiskCompliance.toFixed(1)}%`);
  console.log(`    ${scenarioVendors.join(' + ')} spend: $${(lowRiskScenarioSpend/1000000).toFixed(2)}M`);
  console.log(`    Total low risk spend: $${(lowRiskTotalSpend/1000000).toFixed(2)}M`);
  console.log();

  if (lowRiskCompliance >= 90) {
    console.log('  ✓ YES - You can achieve 90% compliance with LOW RISK hospitals only!');
    console.log(`    You have ${(lowRiskCompliance - 90).toFixed(1)}% cushion above the 90% target.`);
  } else {
    const gap = 90 - lowRiskCompliance;
    const additionalSpendNeeded = (lowRiskTotalSpend * gap / 100);
    console.log(`  ✗ NO - You fall ${gap.toFixed(1)}% short of 90% compliance.`);
    console.log(`    Additional spend needed: $${(additionalSpendNeeded/1000000).toFixed(2)}M`);
    console.log();
    console.log('  Options:');
    console.log(`    1. Include some Medium risk hospitals (${riskLevelStats['Medium'].hospitals} available)`);
    console.log(`    2. Negotiate better pricing with scenario vendors to shift more spend`);
    console.log(`    3. Accept a lower compliance threshold (e.g., 85%)`);
  }
  console.log();
  console.log();
});

console.log('='.repeat(80));
console.log('ANALYSIS COMPLETE');
console.log('='.repeat(80));
