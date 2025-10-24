const data = require('./public/data/hip-knee-data.json');

console.log('🔍 ANALYZING 0-CASE SURGEONS COMPONENT NAMES\n');
console.log('═══════════════════════════════════════════════════════\n');

// Get 0-case surgeons with significant spend
const zeroCaseSurgeons = data.surgeons
  .filter(s => s.totalCases === 0 && s.totalSpend > 50000)
  .slice(0, 5);

console.log('Analyzing top 5 zero-case surgeons with >$50K spend:\n');

zeroCaseSurgeons.forEach((surgeon, idx) => {
  console.log('─────────────────────────────────────────────────────');
  console.log((idx + 1) + '. ' + surgeon.name);
  console.log('   Spend: $' + (surgeon.totalSpend/1000).toFixed(1) + 'K');
  console.log('   Vendors:', Object.keys(surgeon.vendors).join(', '));
  console.log();
});

// Check the raw components array - it has ALL component names from CSV
console.log('\n📦 SAMPLE OF ALL COMPONENT NAMES IN DATASET');
console.log('═══════════════════════════════════════════════════════\n');

// Get unique component names and their frequencies
const componentCounts = {};
data.components.forEach(c => {
  const name = c.name || 'Unknown';
  componentCounts[name] = (componentCounts[name] || 0) + 1;
});

// Sort by frequency and show top 50
const sortedComponents = Object.entries(componentCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 50);

console.log('Top 50 most common component names:');
console.log('(These should help us understand what we might be missing)\n');

function checkIfPrimary(componentName) {
  if (!componentName || componentName === 'Unknown') return false;
  const name = componentName.toUpperCase();

  const isHipPrimary =
    (name.includes('ACETABULAR') && (name.includes('CUP') || name.includes('SHELL'))) ||
    (name.includes('ACETAB') && (name.includes('CUP') || name.includes('SHELL'))) ||
    (name.includes('FEMORAL') && name.includes('STEM') && !name.includes('KNEE')) ||
    (name.includes('FEM') && name.includes('STEM') && !name.includes('KNEE')) ||
    (name.includes('HIP') && (name.includes('CUP') || name.includes('SHELL') || name.includes('STEM')));

  const isKneePrimary =
    (name.includes('TIBIAL') && (name.includes('TRAY') || name.includes('BASEPLATE') || name.includes('BASE PLATE') || name.includes('PLATE'))) ||
    (name.includes('TIB') && (name.includes('TRAY') || name.includes('BASEPLATE') || name.includes('BASE PLATE') || name.includes('PLATE'))) ||
    (name.includes('FEMORAL') && (name.includes('KNEE') || name.includes('COMP'))) ||
    (name.includes('FEM') && name.includes('KNEE')) ||
    (name.includes('KNEE') && name.includes('FEMORAL')) ||
    (name.includes('KNEE') && name.includes('TIBIAL'));

  return isHipPrimary || isKneePrimary;
}

sortedComponents.forEach(([name, count], idx) => {
  const isPrimary = checkIfPrimary(name);
  const marker = isPrimary ? '✅' : '❌';
  console.log(marker, (idx + 1) + '.', name.substring(0, 60), '(' + count.toLocaleString() + ' records)');
});

console.log('\n\n🔍 SEARCHING FOR POTENTIAL MISSING PATTERNS\n');
console.log('═══════════════════════════════════════════════════════\n');

// Look for hip/knee related terms that weren't counted
const hipKneeTerms = ['HIP', 'KNEE', 'FEMORAL', 'TIBIAL', 'ACETABULAR', 'PATELLAR'];
const uncountedButRelevant = Object.entries(componentCounts)
  .filter(([name]) => {
    const upper = name.toUpperCase();
    const hasRelevantTerm = hipKneeTerms.some(term => upper.includes(term));
    return hasRelevantTerm && !checkIfPrimary(name) && name !== 'Unknown';
  })
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30);

console.log('Top 30 hip/knee-related components that WERE NOT counted:');
console.log('(These might be accessories or we might need to add patterns)\n');

uncountedButRelevant.forEach(([name, count], idx) => {
  console.log('❌', (idx + 1) + '.', name.substring(0, 70), '(' + count.toLocaleString() + ')');
});
