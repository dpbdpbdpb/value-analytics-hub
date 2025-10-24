#!/usr/bin/env node

/**
 * Transform matrixPricing from object format to array format
 * while preserving vendor detail as matrixPricingDetailed
 */

const fs = require('fs');
const path = require('path');

function transformMatrixPricing(filePath) {
  console.log(`\n📊 Transforming ${path.basename(filePath)}...`);

  // Read the JSON file
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Check if matrixPricing exists and is an object
  if (!data.matrixPricing || Array.isArray(data.matrixPricing)) {
    console.log('⚠️  matrixPricing is already in array format or missing. Skipping...');
    return;
  }

  console.log(`✓ Found matrixPricing object with ${Object.keys(data.matrixPricing).length} categories`);

  // Preserve the detailed vendor data
  data.matrixPricingDetailed = data.matrixPricing;

  // Transform to array format with calculated metrics
  const matrixPricingArray = [];

  for (const [categoryKey, categoryData] of Object.entries(data.matrixPricing)) {
    const vendors = categoryData.vendors || {};
    const vendorPrices = Object.values(vendors).map(v => v.medianPrice);

    if (vendorPrices.length === 0) continue;

    // Calculate current average price (weighted by samples if available)
    let currentAvgPrice;
    const vendorsWithSamples = Object.values(vendors).filter(v => v.samples > 0);

    if (vendorsWithSamples.length > 0) {
      const totalSamples = vendorsWithSamples.reduce((sum, v) => sum + v.samples, 0);
      const weightedSum = vendorsWithSamples.reduce((sum, v) => sum + (v.medianPrice * v.samples), 0);
      currentAvgPrice = Math.round(weightedSum / totalSamples);
    } else {
      currentAvgPrice = Math.round(vendorPrices.reduce((a, b) => a + b, 0) / vendorPrices.length);
    }

    // Calculate matrix price (lowest price from top 4 vendors by volume)
    // Sort vendors by sample count (volume) descending
    const vendorsWithVolume = Object.entries(vendors).map(([name, data]) => ({
      name,
      price: data.medianPrice,
      samples: data.samples || 0
    })).sort((a, b) => b.samples - a.samples);

    // Take top 4 vendors by volume
    const top4Vendors = vendorsWithVolume.slice(0, 4);

    // Get lowest price among top 4 and identify the vendor
    const matrixPrice = Math.min(...top4Vendors.map(v => v.price));
    const targetVendor = top4Vendors.find(v => v.price === matrixPrice)?.name || 'Unknown';

    // Abbreviate vendor names for display
    const abbreviateVendor = (name) => {
      const upper = name.toUpperCase();
      if (upper.includes('STRYKER')) return 'STR';
      if (upper.includes('ZIMMER')) return 'ZIM';
      if (upper.includes('J&J') || upper.includes('JOHNSON')) return 'J&J';
      if (upper.includes('SMITH')) return 'S&N';
      return name.substring(0, 3).toUpperCase();
    };

    // Estimate total spend based on samples (rough estimate)
    const totalSamples = Object.values(vendors).reduce((sum, v) => sum + (v.samples || 0), 0);
    const totalSpend = currentAvgPrice * totalSamples;

    // Calculate potential savings
    const potentialSavings = totalSamples * (currentAvgPrice - matrixPrice);

    // Only include if there's actual savings potential
    if (potentialSavings > 0 && totalSpend > 0) {
      matrixPricingArray.push({
        category: categoryData.category || categoryKey,
        totalSpend: totalSpend,
        currentAvgPrice: currentAvgPrice,
        matrixPrice: matrixPrice,
        targetVendor: abbreviateVendor(targetVendor),
        targetVendorFull: targetVendor,
        potentialSavings: potentialSavings
      });
    }
  }

  // Sort by potential savings descending
  matrixPricingArray.sort((a, b) => b.potentialSavings - a.potentialSavings);

  console.log(`✓ Created array with ${matrixPricingArray.length} components`);

  // Calculate total savings
  const totalSavings = matrixPricingArray.reduce((sum, item) => sum + item.potentialSavings, 0);
  console.log(`✓ Total potential savings: $${(totalSavings / 1000000).toFixed(2)}M`);

  // Update the data
  data.matrixPricing = matrixPricingArray;

  // Write back to file
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Successfully transformed ${path.basename(filePath)}`);
  console.log(`   - matrixPricing: Array with ${matrixPricingArray.length} components`);
  console.log(`   - matrixPricingDetailed: Object with vendor-level detail preserved`);
}

// Process both files
const files = [
  path.join(__dirname, 'public', 'orthopedic-data.json'),
  path.join(__dirname, 'public', 'shoulder-data.json')
];

console.log('🔄 Starting matrix pricing transformation...\n');

files.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      transformMatrixPricing(file);
    } catch (error) {
      console.error(`❌ Error processing ${path.basename(file)}:`, error.message);
    }
  } else {
    console.log(`⚠️  File not found: ${path.basename(file)}`);
  }
});

console.log('\n✨ Transformation complete!\n');
