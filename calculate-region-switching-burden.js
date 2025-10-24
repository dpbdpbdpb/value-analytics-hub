const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'public', 'data', 'hip-knee-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('REGION VS SWITCHING BURDEN ANALYSIS');
console.log('═'.repeat(100));
console.log('Calculating switching burden by region for each consolidation scenario\n');

// Get unique regions
const regions = [...new Set(data.surgeons.map(s => s.region))].filter(Boolean).sort();
console.log(`Analyzing ${regions.length} regions across ${data.surgeons.length} surgeons\n`);

// Function to calculate surgeon's primary vendor
const getPrimaryVendor = (surgeon) => {
  if (!surgeon.vendors) return null;
  const vendors = Object.entries(surgeon.vendors)
    .map(([vendor, stats]) => ({ vendor, spend: stats.spend || 0 }))
    .sort((a, b) => b.spend - a.spend);
  return vendors.length > 0 ? vendors[0].vendor : null;
};

// Calculate switching burden for each region-scenario combination
const heatmapData = [];

Object.entries(data.scenarios).forEach(([scenarioKey, scenario]) => {
  if (scenarioKey === 'status-quo') return; // Skip status quo

  const preferredVendors = scenario.preferredVendors || [];

  regions.forEach(region => {
    const regionSurgeons = data.surgeons.filter(s => s.region === region);

    // Calculate metrics
    let surgeonsAffected = 0;
    let casesAffected = 0;
    let spendAffected = 0;
    let totalSurgeons = regionSurgeons.length;
    let totalCases = 0;
    let totalSpend = 0;

    regionSurgeons.forEach(surgeon => {
      const primaryVendor = getPrimaryVendor(surgeon);
      const mustSwitch = primaryVendor && !preferredVendors.includes(primaryVendor);

      totalCases += surgeon.totalCases || 0;
      totalSpend += surgeon.totalSpend || 0;

      if (mustSwitch) {
        surgeonsAffected++;
        casesAffected += surgeon.totalCases || 0;
        spendAffected += surgeon.totalSpend || 0;
      }
    });

    // Calculate burden score (0-100)
    // Weighted composite: 40% surgeon %, 30% case %, 30% spend %
    const surgeonPct = totalSurgeons > 0 ? (surgeonsAffected / totalSurgeons) * 100 : 0;
    const casePct = totalCases > 0 ? (casesAffected / totalCases) * 100 : 0;
    const spendPct = totalSpend > 0 ? (spendAffected / totalSpend) * 100 : 0;

    const burdenScore = (surgeonPct * 0.4) + (casePct * 0.3) + (spendPct * 0.3);

    heatmapData.push({
      scenario: scenario.shortName || scenario.name,
      scenarioKey,
      region,
      surgeonsAffected,
      surgeonPct: surgeonPct.toFixed(1),
      casesAffected,
      casePct: casePct.toFixed(1),
      spendAffected,
      spendPct: spendPct.toFixed(1),
      burdenScore: burdenScore.toFixed(1),
      totalSurgeons,
      totalCases,
      totalSpend
    });
  });
});

// Save heatmap data to file
const heatmapPath = path.join(__dirname, 'public', 'data', 'region-switching-heatmap.json');
fs.writeFileSync(heatmapPath, JSON.stringify({
  regions,
  scenarios: Object.entries(data.scenarios)
    .filter(([key]) => key !== 'status-quo')
    .map(([key, s]) => ({ key, name: s.name, shortName: s.shortName || s.name })),
  heatmapData
}, null, 2));

console.log('✓ Heatmap data calculated');

// Display summary table
console.log('\nSWITCHING BURDEN BY REGION (Sample):');
console.log('─'.repeat(100));
console.log('Scenario'.padEnd(35) + 'Region'.padEnd(20) + 'Burden Score'.padStart(15) + 'Surgeons'.padStart(12) + 'Cases'.padStart(10));
console.log('─'.repeat(100));

// Show highest burden scenarios
const sortedByBurden = [...heatmapData].sort((a, b) => parseFloat(b.burdenScore) - parseFloat(a.burdenScore));
sortedByBurden.slice(0, 15).forEach(row => {
  console.log(
    row.scenario.substring(0, 34).padEnd(35) +
    row.region.padEnd(20) +
    `${row.burdenScore}%`.padStart(15) +
    `${row.surgeonsAffected}/${row.totalSurgeons}`.padStart(12) +
    row.casesAffected.toString().padStart(10)
  );
});

console.log('\n✓ Region switching heatmap data saved to region-switching-heatmap.json');

// Print summary statistics
console.log('\n\nSUMMARY BY SCENARIO:');
console.log('─'.repeat(100));
console.log('Scenario'.padEnd(40) + 'Avg Burden'.padStart(15) + 'Max Burden'.padStart(15) + 'Regions >50%'.padStart(15));
console.log('─'.repeat(100));

const scenarios = [...new Set(heatmapData.map(d => d.scenario))];
scenarios.forEach(scenario => {
  const scenarioData = heatmapData.filter(d => d.scenario === scenario);
  const burdens = scenarioData.map(d => parseFloat(d.burdenScore));
  const avgBurden = burdens.reduce((a, b) => a + b, 0) / burdens.length;
  const maxBurden = Math.max(...burdens);
  const highBurdenCount = burdens.filter(b => b > 50).length;

  console.log(
    scenario.substring(0, 39).padEnd(40) +
    `${avgBurden.toFixed(1)}%`.padStart(15) +
    `${maxBurden.toFixed(1)}%`.padStart(15) +
    highBurdenCount.toString().padStart(15)
  );
});

console.log('\n\nSUMMARY BY REGION:');
console.log('─'.repeat(100));
console.log('Region'.padEnd(25) + 'Avg Burden'.padStart(15) + 'Max Burden'.padStart(15) + 'Worst Scenario'.padStart(35));
console.log('─'.repeat(100));

regions.forEach(region => {
  const regionData = heatmapData.filter(d => d.region === region);
  const burdens = regionData.map(d => parseFloat(d.burdenScore));
  const avgBurden = burdens.reduce((a, b) => a + b, 0) / burdens.length;
  const maxBurden = Math.max(...burdens);
  const worstScenario = regionData.find(d => parseFloat(d.burdenScore) === maxBurden);

  console.log(
    region.padEnd(25) +
    `${avgBurden.toFixed(1)}%`.padStart(15) +
    `${maxBurden.toFixed(1)}%`.padStart(15) +
    (worstScenario.scenario.substring(0, 34)).padStart(35)
  );
});
