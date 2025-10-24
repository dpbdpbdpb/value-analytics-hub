#!/usr/bin/env node

/**
 * Transform components data to classify by procedure type (primary vs revision)
 * for component pricing analysis
 */

const fs = require('fs');
const path = require('path');

function transformComponentsByProcedure(filePath) {
  console.log(`\n📊 Transforming components by procedure type...`);

  // Read the JSON file
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const components = data.components || [];
  console.log(`✓ Found ${components.length} component records`);

  // Group components by category, vendor, and procedure type
  const componentGroups = {};

  components.forEach(comp => {
    const category = comp.category || 'UNKNOWN';
    const vendor = comp.vendor || 'Unknown';
    const procedureType = comp.procedureType || 'UNKNOWN';

    // Determine if this is a revision procedure
    const isRevision = procedureType.toLowerCase().includes('revision');
    const isPrimary = !isRevision && (
      procedureType.toLowerCase().includes('arthroplasty') ||
      procedureType.toLowerCase().includes('replacement') ||
      procedureType.toLowerCase().includes('total hip') ||
      procedureType.toLowerCase().includes('total knee')
    );

    // Only process hip and knee components
    const isHipKnee =
      procedureType.toLowerCase().includes('hip') ||
      procedureType.toLowerCase().includes('knee') ||
      category.toLowerCase().includes('hip') ||
      category.toLowerCase().includes('knee') ||
      category.toLowerCase().includes('femoral') ||
      category.toLowerCase().includes('tibial') ||
      category.toLowerCase().includes('acetabular') ||
      category.toLowerCase().includes('patella');

    if (!isHipKnee) return;

    // Create grouping key
    const procedureClass = isRevision ? 'REVISION' : (isPrimary ? 'PRIMARY' : 'OTHER');
    const groupKey = `${category}|${procedureClass}`;

    if (!componentGroups[groupKey]) {
      componentGroups[groupKey] = {
        category,
        procedureClass,
        vendors: {},
        totalQuantity: 0,
        totalSpend: 0,
        sampleCount: 0
      };
    }

    const group = componentGroups[groupKey];

    // Track vendor-specific data
    if (!group.vendors[vendor]) {
      group.vendors[vendor] = {
        quantity: 0,
        totalSpend: 0,
        prices: [],
        samples: 0
      };
    }

    const vendorData = group.vendors[vendor];
    vendorData.quantity += comp.quantity || 0;
    vendorData.totalSpend += comp.totalSpend || 0;
    vendorData.prices.push(comp.avgPrice || 0);
    vendorData.samples++;

    group.totalQuantity += comp.quantity || 0;
    group.totalSpend += comp.totalSpend || 0;
    group.sampleCount++;
  });

  console.log(`✓ Created ${Object.keys(componentGroups).length} component groups`);

  // Calculate pricing matrix by procedure type
  const matrixPricingByProcedure = {
    primary: [],
    revision: []
  };

  Object.entries(componentGroups).forEach(([key, group]) => {
    const vendors = group.vendors;
    const vendorPrices = Object.values(vendors).map(v => {
      const medianPrice = v.prices.length > 0
        ? v.prices.sort((a, b) => a - b)[Math.floor(v.prices.length / 2)]
        : 0;
      return { vendor: v, medianPrice, samples: v.samples };
    });

    if (vendorPrices.length === 0) return;

    // Calculate current average price (weighted by quantity)
    let currentAvgPrice;
    const vendorsWithQuantity = Object.values(vendors).filter(v => v.quantity > 0);

    if (vendorsWithQuantity.length > 0) {
      const totalQty = vendorsWithQuantity.reduce((sum, v) => sum + v.quantity, 0);
      const weightedSum = vendorsWithQuantity.reduce((sum, v) => {
        const medianPrice = v.prices.length > 0
          ? v.prices.sort((a, b) => a - b)[Math.floor(v.prices.length / 2)]
          : 0;
        return sum + (medianPrice * v.quantity);
      }, 0);
      currentAvgPrice = totalQty > 0 ? Math.round(weightedSum / totalQty) : 0;
    } else {
      currentAvgPrice = 0;
    }

    // Get lowest price from top 4 vendors by volume
    const vendorsWithVolume = Object.entries(vendors).map(([name, data]) => ({
      name,
      price: data.prices.length > 0
        ? data.prices.sort((a, b) => a - b)[Math.floor(data.prices.length / 2)]
        : 0,
      samples: data.samples || 0
    })).sort((a, b) => b.samples - a.samples);

    const top4Vendors = vendorsWithVolume.slice(0, 4);
    const matrixPrice = top4Vendors.length > 0
      ? Math.min(...top4Vendors.map(v => v.price))
      : 0;

    // Calculate potential savings
    const potentialSavings = group.totalQuantity * (currentAvgPrice - matrixPrice);

    if (potentialSavings > 0 && group.totalSpend > 0) {
      const item = {
        category: group.category,
        totalSpend: group.totalSpend,
        currentAvgPrice,
        matrixPrice,
        potentialSavings,
        procedureType: group.procedureClass
      };

      if (group.procedureClass === 'REVISION') {
        matrixPricingByProcedure.revision.push(item);
      } else if (group.procedureClass === 'PRIMARY') {
        matrixPricingByProcedure.primary.push(item);
      }
    }
  });

  // Sort by potential savings
  matrixPricingByProcedure.primary.sort((a, b) => b.potentialSavings - a.potentialSavings);
  matrixPricingByProcedure.revision.sort((a, b) => b.potentialSavings - a.potentialSavings);

  console.log(`✓ Primary components: ${matrixPricingByProcedure.primary.length}`);
  console.log(`✓ Revision components: ${matrixPricingByProcedure.revision.length}`);

  const totalPrimarySavings = matrixPricingByProcedure.primary.reduce((sum, item) => sum + item.potentialSavings, 0);
  const totalRevisionSavings = matrixPricingByProcedure.revision.reduce((sum, item) => sum + item.potentialSavings, 0);

  console.log(`✓ Total primary savings potential: $${(totalPrimarySavings / 1000000).toFixed(2)}M`);
  console.log(`✓ Total revision savings potential: $${(totalRevisionSavings / 1000000).toFixed(2)}M`);

  // Add to data
  data.matrixPricingByProcedure = matrixPricingByProcedure;

  // Write back to file
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Successfully transformed components by procedure type`);
}

// Run the transformation
const filePath = path.join(__dirname, 'public', 'data', 'hip-knee-data.json');
transformComponentsByProcedure(filePath);
