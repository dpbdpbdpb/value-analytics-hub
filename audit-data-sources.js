const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'public', 'data', 'hip-knee-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('DATA SOURCE AUDIT');
console.log('═'.repeat(80));
console.log('Identifying REAL vs SYNTHETIC data in hip-knee-data.json\n');

// Check surgeons
console.log('SURGEONS DATA:');
console.log('─'.repeat(80));
console.log('Total surgeons:', data.surgeons.length);

const sampleSurgeon = data.surgeons[0];
console.log('\nSample surgeon fields:');
Object.keys(sampleSurgeon).forEach(key => {
  console.log(`  ${key}: ${typeof sampleSurgeon[key]}`);
});

// Check for synthetic region data
const surgeonsWithRegion = data.surgeons.filter(s => s.region).length;
const surgeonsWithFacility = data.surgeons.filter(s => s.facility).length;
console.log(`\nSurgeons with region: ${surgeonsWithRegion} (${(surgeonsWithRegion/data.surgeons.length*100).toFixed(1)}%)`);
console.log(`Surgeons with facility: ${surgeonsWithFacility} (${(surgeonsWithFacility/data.surgeons.length*100).toFixed(1)}%)`);

if (surgeonsWithRegion > 0) {
  const uniqueRegions = [...new Set(data.surgeons.filter(s => s.region).map(s => s.region))];
  console.log('⚠️  SYNTHETIC: Regions assigned:', uniqueRegions.join(', '));
}

// Check construct costs
const surgeonsWithConstructCosts = data.surgeons.filter(s => s.constructCosts).length;
console.log(`\nSurgeons with construct costs: ${surgeonsWithConstructCosts} (${(surgeonsWithConstructCosts/data.surgeons.length*100).toFixed(1)}%)`);
if (surgeonsWithConstructCosts > 0) {
  console.log('⚠️  CALCULATED: Construct costs derived from pricing data');
}

// Check scenarios
console.log('\n\nSCENARIOS:');
console.log('─'.repeat(80));
console.log('Total scenarios:', Object.keys(data.scenarios).length);
console.log('⚠️  GENERATED: Scenarios created from vendor consolidation logic');

Object.entries(data.scenarios).forEach(([key, scenario]) => {
  console.log(`  ${scenario.name}: ${scenario.savingsPercent * 100}% savings, risk ${scenario.riskScore}`);
});

// Check components
console.log('\n\nCOMPONENTS:');
console.log('─'.repeat(80));
console.log('Total components:', data.components.length);

const realComponents = data.components.filter(c => c.vendor !== 'UNKNOWN' && c.avgPrice > 0);
const syntheticComponents = data.components.filter(c => c.vendor === 'UNKNOWN' || c.avgPrice === 0);
console.log(`Real components: ${realComponents.length}`);
console.log(`Synthetic/placeholder components: ${syntheticComponents.length}`);

if (syntheticComponents.length > 0) {
  console.log('⚠️  SYNTHETIC: Most components are placeholders');
}

// Check vendors
console.log('\n\nVENDORS:');
console.log('─'.repeat(80));
console.log('Total vendors:', Object.keys(data.vendors).length);
console.log('✓ REAL: Vendor spend data from uploaded files');
Object.entries(data.vendors).slice(0, 5).forEach(([name, vendor]) => {
  console.log(`  ${name}: $${(vendor.totalSpend / 1000000).toFixed(1)}M, ${vendor.uniqueSurgeons} surgeons`);
});

// Check matrix pricing
console.log('\n\nMATRIX PRICING:');
console.log('─'.repeat(80));
if (data.matrixPricing) {
  console.log('Matrix pricing categories:', data.matrixPricing.length);
  console.log('✓ REAL: Calculated from actual component pricing data');
}

if (data.matrixPricingDetailed) {
  const categories = Object.keys(data.matrixPricingDetailed).length;
  console.log('Detailed pricing categories:', categories);
}

// Check hospitals and regions
console.log('\n\nHOSPITALS & REGIONS:');
console.log('─'.repeat(80));
console.log('Hospitals:', data.hospitals ? Object.keys(data.hospitals).length : 0);
console.log('Regions:', data.regions ? Object.keys(data.regions).length : 0);

if (!data.hospitals || Object.keys(data.hospitals).length === 0) {
  console.log('⚠️  MISSING: No hospital/facility data in uploaded files');
}

if (!data.regions || Object.keys(data.regions).length === 0) {
  console.log('⚠️  MISSING: No region data in uploaded files (but synthetically assigned to surgeons)');
}

// Summary
console.log('\n\nSUMMARY:');
console.log('═'.repeat(80));
console.log('\n✓ REAL DATA SOURCES:');
console.log('  • Vendor names, spend, and surgeon counts');
console.log('  • Surgeon names, case volumes, and vendor usage');
console.log('  • Component pricing (from uploaded files)');
console.log('  • Matrix pricing calculations');

console.log('\n⚠️  SYNTHETIC/CALCULATED DATA:');
console.log('  • Region assignments (synthetically distributed)');
console.log('  • Facility assignments (not in source data)');
console.log('  • Construct costs (calculated from pricing)');
console.log('  • Vendor consolidation scenarios (generated)');
console.log('  • Risk scores (calculated)');
console.log('  • Physician impact analysis (calculated)');
console.log('  • Component placeholders (vendor=UNKNOWN)');

console.log('\n❌ MISSING DATA (needs "Coming Soon"):');
console.log('  • Regional/facility breakdowns (if not in source file)');
console.log('  • Clinical outcomes data');
console.log('  • Patient satisfaction scores');
console.log('  • 8-Agent framework scores');
console.log('  • Peer benchmarking data');
console.log('  • Detailed component-level usage by surgeon');
