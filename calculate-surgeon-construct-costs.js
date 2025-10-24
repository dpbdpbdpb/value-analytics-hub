const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'public', 'data', 'hip-knee-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Component categories for constructs
const HIP_COMPONENTS = {
  cup: ['ACETABULAR SHELL', 'CUP ACET', 'SHELL'],
  head: ['FEMORAL HEAD', 'HEAD'],
  stem: ['FEMORAL STEM', 'STEM']
};

const KNEE_COMPONENTS = {
  tray: ['TIBIAL TRAY', 'BASEPLT TIBIAL'],
  insert: ['TIBIAL INSERT', 'INSERT', 'BEARING'],
  femoral: ['FEMORAL KNEE COMP', 'COMP FEMORAL', 'FEMORAL COMP'],
  patella: ['PATELLA']
};

// Helper: Find component pricing by category pattern
const findComponentPrice = (pricing, patterns, vendor) => {
  for (const category of Object.keys(pricing)) {
    const catUpper = category.toUpperCase();
    for (const pattern of patterns) {
      if (catUpper.includes(pattern)) {
        const vendorData = pricing[category].vendors?.[vendor];
        if (vendorData && vendorData.medianPrice > 0) {
          return vendorData.medianPrice;
        }
      }
    }
  }
  return null;
};

// Calculate construct cost for a specific vendor
const calculateVendorConstruct = (vendor, componentMap, pricing) => {
  const prices = {};
  let total = 0;
  let missingComponents = [];

  for (const [componentType, patterns] of Object.entries(componentMap)) {
    const price = findComponentPrice(pricing, patterns, vendor);
    if (price) {
      prices[componentType] = price;
      total += price;
    } else {
      missingComponents.push(componentType);
    }
  }

  // Only return if we have at least some components
  if (Object.keys(prices).length > 0) {
    return { prices, total, missingComponents };
  }
  return null;
};

console.log('SURGEON CONSTRUCT COST ANALYSIS');
console.log('═'.repeat(100));
console.log('Calculating hip and knee construct costs for each surgeon based on vendor usage\n');

// Process each surgeon
data.surgeons.forEach((surgeon, idx) => {
  if (!surgeon.vendors || Object.keys(surgeon.vendors).length === 0) {
    surgeon.constructCosts = {
      hip: { median: 0, min: 0, max: 0, vendorCount: 0 },
      knee: { median: 0, min: 0, max: 0, vendorCount: 0 }
    };
    return;
  }

  // Get vendor spend breakdown
  const vendorSpends = Object.entries(surgeon.vendors)
    .map(([vendor, stats]) => ({
      vendor,
      spend: stats.spend || 0,
      cases: stats.cases || 0
    }))
    .filter(v => v.spend > 0)
    .sort((a, b) => b.spend - a.spend);

  // Calculate construct costs for each vendor the surgeon uses
  const hipCosts = [];
  const kneeCosts = [];

  vendorSpends.forEach(({ vendor }) => {
    // Hip construct
    const hipConstruct = calculateVendorConstruct(vendor, HIP_COMPONENTS, data.matrixPricingDetailed);
    if (hipConstruct) {
      hipCosts.push({ vendor, cost: hipConstruct.total, details: hipConstruct.prices });
    }

    // Knee construct
    const kneeConstruct = calculateVendorConstruct(vendor, KNEE_COMPONENTS, data.matrixPricingDetailed);
    if (kneeConstruct) {
      kneeCosts.push({ vendor, cost: kneeConstruct.total, details: kneeConstruct.prices });
    }
  });

  // Calculate median, min, max
  const calculateStats = (costs) => {
    if (costs.length === 0) return { median: 0, min: 0, max: 0, vendorCount: 0, vendors: [] };

    const sorted = costs.map(c => c.cost).sort((a, b) => a - b);
    return {
      median: sorted[Math.floor(sorted.length / 2)],
      min: Math.min(...sorted),
      max: Math.max(...sorted),
      vendorCount: costs.length,
      vendors: costs.map(c => ({ vendor: c.vendor, cost: c.cost, details: c.details }))
    };
  };

  surgeon.constructCosts = {
    hip: calculateStats(hipCosts),
    knee: calculateStats(kneeCosts)
  };

  // Log progress every 100 surgeons
  if ((idx + 1) % 100 === 0) {
    console.log(`Processed ${idx + 1} surgeons...`);
  }
});

// Show summary
console.log(`\n✓ Processed ${data.surgeons.length} surgeons`);

// Show sample results
console.log('\nSample Results (First 10 Surgeons):');
console.log('─'.repeat(100));
console.log('Surgeon'.padEnd(35) + 'Hip Construct'.padStart(20) + 'Knee Construct'.padStart(20) + 'Vendors'.padStart(10));
console.log('─'.repeat(100));

data.surgeons.slice(0, 10).forEach(s => {
  const hipRange = s.constructCosts.hip.vendorCount > 0
    ? `$${s.constructCosts.hip.min.toFixed(0)}-$${s.constructCosts.hip.max.toFixed(0)}`
    : 'N/A';
  const kneeRange = s.constructCosts.knee.vendorCount > 0
    ? `$${s.constructCosts.knee.min.toFixed(0)}-$${s.constructCosts.knee.max.toFixed(0)}`
    : 'N/A';

  console.log(
    s.name.substring(0, 34).padEnd(35) +
    hipRange.padStart(20) +
    kneeRange.padStart(20) +
    s.constructCosts.hip.vendorCount.toString().padStart(10)
  );
});

// Save updated data
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('\n✓ Surgeon construct costs saved to hip-knee-data.json');
