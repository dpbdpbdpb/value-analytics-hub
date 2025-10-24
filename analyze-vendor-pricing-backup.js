const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'public', 'data', 'hip-knee-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Calculate weighted average for a set of items
const weightedAvg = (items) => {
  const totalSpend = items.reduce((sum, item) => sum + item.totalSpend, 0);
  const weightedSum = items.reduce((sum, item) => sum + (item.currentAvgPrice * item.totalSpend), 0);
  return totalSpend > 0 ? weightedSum / totalSpend : 0;
};

// Get vendor-specific pricing from matrixPricingDetailed
const vendorConstructCosts = {};

// Define component categories
const hipComponents = ['ACETABULAR', 'CUP ACET', 'SHELL ACET', 'FEMORAL HEAD', 'HEAD', 'FEMORAL STEM', 'STEM FEMORAL'];
const kneeComponents = ['TIBIAL TRAY', 'TIBIAL INSERT', 'INSRT TIBIAL', 'FEMORAL KNEE', 'FEMORAL COMP'];

// For each vendor, calculate average hip and knee construct costs
Object.entries(data.vendors).forEach(([vendorName, vendorStats]) => {
  let hipComponentPrices = [];
  let kneeComponentPrices = [];

  // Look through matrixPricingDetailed for this vendor's prices
  Object.entries(data.matrixPricingDetailed).forEach(([category, categoryData]) => {
    if (!categoryData.vendors || !categoryData.vendors[vendorName]) return;

    const vendorData = categoryData.vendors[vendorName];
    const price = vendorData.medianPrice || 0;

    // Categorize as hip or knee component
    const isHip = hipComponents.some(comp => category.includes(comp));
    const isKnee = kneeComponents.some(comp => category.includes(comp));

    if (isHip) {
      hipComponentPrices.push({ category, price, samples: vendorData.samples });
    }
    if (isKnee) {
      kneeComponentPrices.push({ category, price, samples: vendorData.samples });
    }
  });

  // Calculate weighted average construct cost
  const calcConstructCost = (components) => {
    if (components.length === 0) return 0;
    const totalSamples = components.reduce((sum, c) => sum + c.samples, 0);
    const weightedSum = components.reduce((sum, c) => sum + (c.price * c.samples), 0);
    return totalSamples > 0 ? weightedSum / totalSamples : 0;
  };

  const avgHipPrice = calcConstructCost(hipComponentPrices);
  const avgKneePrice = calcConstructCost(kneeComponentPrices);

  // Estimate full construct cost (hip needs ~3 components, knee needs ~3 components)
  // Based on our analysis: hip = cup + head + stem, knee = tray + insert + femoral
  const hipConstructEstimate = avgHipPrice * 3; // Rough multiplier for full construct
  const kneeConstructEstimate = avgKneePrice * 3;

  vendorConstructCosts[vendorName] = {
    hipConstruct: hipConstructEstimate,
    kneeConstruct: kneeConstructEstimate,
    totalSpend: vendorStats.totalSpend,
    hipComponentCount: hipComponentPrices.length,
    kneeComponentCount: kneeComponentPrices.length
  };
});

// Calculate more accurate construct costs by analyzing actual component combinations
const getActualConstructCost = (vendorName, isHip) => {
  const components = {};

  Object.entries(data.matrixPricingDetailed).forEach(([category, categoryData]) => {
    if (!categoryData.vendors || !categoryData.vendors[vendorName]) return;

    const vendorData = categoryData.vendors[vendorName];
    const price = vendorData.medianPrice || 0;

    if (isHip) {
      if (category.includes('ACETABULAR') || category.includes('SHELL') || category.includes('CUP')) {
        components.acetabular = price;
      }
      if (category.includes('FEMORAL HEAD') || (category.includes('HEAD') && !category.includes('HEADLESS'))) {
        components.femoralHead = price;
      }
      if (category.includes('FEMORAL STEM') || category.includes('STEM FEMORAL')) {
        components.femoralStem = price;
      }
    } else {
      if (category.includes('TIBIAL TRAY')) {
        components.tibialTray = price;
      }
      if (category.includes('TIBIAL INSERT') || category.includes('INSRT TIBIAL')) {
        components.tibialInsert = price;
      }
      if (category.includes('FEMORAL KNEE') || (category.includes('FEMORAL COMP') && category.includes('KNEE'))) {
        components.femoralKnee = price;
      }
    }
  });

  if (isHip) {
    return (components.acetabular || 0) + (components.femoralHead || 0) + (components.femoralStem || 0);
  } else {
    return (components.tibialTray || 0) + (components.tibialInsert || 0) + (components.femoralKnee || 0);
  }
};

// Recalculate with actual construct logic
const vendorAnalysis = Object.entries(data.vendors)
  .map(([vendorName, vendorStats]) => {
    const hipConstruct = getActualConstructCost(vendorName, true);
    const kneeConstruct = getActualConstructCost(vendorName, false);

    return {
      vendor: vendorName,
      hipConstruct,
      kneeConstruct,
      totalSpend: vendorStats.totalSpend,
      hasHipData: hipConstruct > 0,
      hasKneeData: kneeConstruct > 0,
      hipVsCap: hipConstruct > 0 ? hipConstruct - 3000 : null,
      kneeVsCap: kneeConstruct > 0 ? kneeConstruct - 2500 : null
    };
  })
  .filter(v => v.hasHipData || v.hasKneeData)
  .sort((a, b) => b.totalSpend - a.totalSpend);

console.log('VENDOR PRICING vs CAPS');
console.log('═'.repeat(100));
console.log('Vendor'.padEnd(25) + 'Hip Construct'.padStart(15) + 'vs Cap'.padStart(12) + 'Knee Construct'.padStart(17) + 'vs Cap'.padStart(12) + 'Total Spend'.padStart(15));
console.log('─'.repeat(100));

vendorAnalysis.forEach(v => {
  const hipStr = v.hasHipData ? `$${Math.round(v.hipConstruct).toLocaleString()}`.padStart(15) : 'N/A'.padStart(15);
  const hipVsCapStr = v.hipVsCap !== null ? (v.hipVsCap >= 0 ? `+$${Math.round(v.hipVsCap).toLocaleString()}` : `-$${Math.round(Math.abs(v.hipVsCap)).toLocaleString()}`).padStart(12) : ''.padStart(12);

  const kneeStr = v.hasKneeData ? `$${Math.round(v.kneeConstruct).toLocaleString()}`.padStart(17) : 'N/A'.padStart(17);
  const kneeVsCapStr = v.kneeVsCap !== null ? (v.kneeVsCap >= 0 ? `+$${Math.round(v.kneeVsCap).toLocaleString()}` : `-$${Math.round(Math.abs(v.kneeVsCap)).toLocaleString()}`).padStart(12) : ''.padStart(12);

  const spendStr = `$${(v.totalSpend / 1000000).toFixed(1)}M`.padStart(15);

  console.log(v.vendor.substring(0, 24).padEnd(25) + hipStr + hipVsCapStr + kneeStr + kneeVsCapStr + spendStr);
});

console.log('\n\nSUMMARY:');
console.log('─'.repeat(100));

const hipAboveCap = vendorAnalysis.filter(v => v.hipVsCap > 0);
const hipBelowCap = vendorAnalysis.filter(v => v.hipVsCap < 0);
const kneeAboveCap = vendorAnalysis.filter(v => v.kneeVsCap > 0);
const kneeBelowCap = vendorAnalysis.filter(v => v.kneeVsCap < 0);

console.log(`Hip Constructs:  ${hipAboveCap.length} vendors above $3,000 cap | ${hipBelowCap.length} vendors below cap`);
console.log(`Knee Constructs: ${kneeAboveCap.length} vendors above $2,500 cap | ${kneeBelowCap.length} vendors below cap`);

if (hipAboveCap.length > 0) {
  console.log('\nHip vendors above cap:');
  hipAboveCap.forEach(v => {
    console.log(`  ${v.vendor.padEnd(25)} $${Math.round(v.hipConstruct).toLocaleString()} (+$${Math.round(v.hipVsCap).toLocaleString()})`);
  });
}

if (kneeAboveCap.length > 0) {
  console.log('\nKnee vendors above cap:');
  kneeAboveCap.forEach(v => {
    console.log(`  ${v.vendor.padEnd(25)} $${Math.round(v.kneeConstruct).toLocaleString()} (+$${Math.round(v.kneeVsCap).toLocaleString()})`);
  });
}

// Calculate actual savings based on vendor mix
const totalCases = data.metadata.totalCases;
const hipCases = Math.round(totalCases * 0.5);
const kneeCases = Math.round(totalCases * 0.5);

// Weighted average current pricing
const totalHipSpend = vendorAnalysis.reduce((sum, v) => sum + (v.hasHipData ? v.totalSpend * 0.5 : 0), 0);
const weightedHipPrice = vendorAnalysis.reduce((sum, v) => {
  if (!v.hasHipData) return sum;
  const vendorShare = v.totalSpend / data.metadata.totalSpend;
  return sum + (v.hipConstruct * vendorShare);
}, 0);

const weightedKneePrice = vendorAnalysis.reduce((sum, v) => {
  if (!v.hasKneeData) return sum;
  const vendorShare = v.totalSpend / data.metadata.totalSpend;
  return sum + (v.kneeConstruct * vendorShare);
}, 0);

const currentHipSpend = hipCases * weightedHipPrice;
const currentKneeSpend = kneeCases * weightedKneePrice;
const cappedHipSpend = hipCases * 3000;
const cappedKneeSpend = kneeCases * 2500;

const totalSavings = (currentHipSpend - cappedHipSpend) + (currentKneeSpend - cappedKneeSpend);

console.log('\n\nPRICING CAP SCENARIO SAVINGS:');
console.log('─'.repeat(100));
console.log(`Current weighted avg hip:   $${Math.round(weightedHipPrice).toLocaleString()} × ${hipCases.toLocaleString()} cases = $${(currentHipSpend / 1000000).toFixed(2)}M`);
console.log(`Capped hip pricing:         $3,000 × ${hipCases.toLocaleString()} cases = $${(cappedHipSpend / 1000000).toFixed(2)}M`);
console.log(`Hip savings:                $${((currentHipSpend - cappedHipSpend) / 1000000).toFixed(2)}M`);
console.log('');
console.log(`Current weighted avg knee:  $${Math.round(weightedKneePrice).toLocaleString()} × ${kneeCases.toLocaleString()} cases = $${(currentKneeSpend / 1000000).toFixed(2)}M`);
console.log(`Capped knee pricing:        $2,500 × ${kneeCases.toLocaleString()} cases = $${(cappedKneeSpend / 1000000).toFixed(2)}M`);
console.log(`Knee savings:               $${((currentKneeSpend - cappedKneeSpend) / 1000000).toFixed(2)}M`);
console.log('');
console.log(`TOTAL ANNUAL SAVINGS:       $${(totalSavings / 1000000).toFixed(2)}M`);
console.log(`Savings %:                  ${((totalSavings / (currentHipSpend + currentKneeSpend)) * 100).toFixed(1)}%`);
