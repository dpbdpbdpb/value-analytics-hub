const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'public', 'data', 'hip-knee-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('REMOVING SYNTHETIC DATA');
console.log('═'.repeat(80));

// Remove synthetic region assignments from surgeons
console.log('\nRemoving synthetic region assignments from surgeons...');
let regionsRemoved = 0;
data.surgeons.forEach(surgeon => {
  if (surgeon.region) {
    delete surgeon.region;
    regionsRemoved++;
  }
});
console.log(`✓ Removed region from ${regionsRemoved} surgeons`);

// Keep facility field but it should be null for all (no source data)
console.log('\nChecking facility data...');
const surgeonsWithFacility = data.surgeons.filter(s => s.facility).length;
if (surgeonsWithFacility === 0) {
  console.log('✓ No facility data (expected - will come from source files)');
} else {
  console.log(`  Found ${surgeonsWithFacility} surgeons with facility data (from source)`);
}

// Keep construct costs but mark them as calculated
console.log('\nKeeping construct costs (calculated from real pricing data)...');
const surgeonsWithConstructCosts = data.surgeons.filter(s => s.constructCosts).length;
console.log(`✓ Construct costs present for ${surgeonsWithConstructCosts} surgeons (CALCULATED)`);

// Remove placeholder components (vendor=UNKNOWN)
console.log('\nRemoving placeholder components...');
const realComponents = data.components.filter(c => c.vendor !== 'UNKNOWN' && c.avgPrice > 0);
const removedComponents = data.components.length - realComponents.length;
data.components = realComponents;
console.log(`✓ Removed ${removedComponents} placeholder components`);
console.log(`  Kept ${realComponents.length} real components`);

// Keep scenarios but they're marked as GENERATED
console.log('\nKeeping vendor consolidation scenarios (generated from real data)...');
console.log(`✓ ${Object.keys(data.scenarios).length} scenarios (GENERATED FROM REAL VENDOR DATA)`);

// Add data quality metadata
console.log('\nAdding data quality metadata...');
data.metadata = data.metadata || {};
data.metadata.dataQuality = {
  realData: {
    vendors: true,
    surgeons: true,
    surgeonCases: true,
    surgeonSpend: true,
    vendorUsage: true,
    matrixPricing: true,
    hospitals: data.hospitals && Object.keys(data.hospitals).length > 0,
    regions: data.regions && Object.keys(data.regions).length > 0
  },
  calculatedData: {
    scenarios: true,
    riskScores: true,
    constructCosts: true,
    physicianImpact: true,
    savingsProjections: true
  },
  unavailableData: {
    surgeonRegions: true,  // Not in source file
    surgeonFacilities: true,  // Not in source file
    componentDetails: realComponents.length === 0,  // Check if we have real components
    clinicalOutcomes: true,
    patientSatisfaction: true,
    agentFrameworkScores: true,
    peerBenchmarking: true,
    detailedComponentUsage: true
  },
  lastUpdated: new Date().toISOString()
};

// Save cleaned data
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log('\n✓ Data cleaned and metadata added');
console.log('\nSUMMARY:');
console.log('─'.repeat(80));
console.log('KEPT (Real Data):');
console.log('  • Vendor spend and surgeon counts');
console.log('  • Surgeon names, cases, and vendor usage');
console.log('  • Matrix pricing calculations');
console.log(`  • ${realComponents.length} real components`);

console.log('\nKEPT (Calculated):');
console.log('  • Vendor consolidation scenarios');
console.log('  • Construct costs');
console.log('  • Risk scores');
console.log('  • Physician impact analysis');

console.log('\nREMOVED:');
console.log('  • Synthetic region assignments');
console.log(`  • ${removedComponents} placeholder components`);

console.log('\nMARKED AS UNAVAILABLE:');
console.log('  • Surgeon regions (requires source data)');
console.log('  • Surgeon facilities (requires source data)');
console.log('  • Clinical outcomes');
console.log('  • Patient satisfaction');
console.log('  • 8-Agent framework scores');
console.log('  • Peer benchmarking data');
