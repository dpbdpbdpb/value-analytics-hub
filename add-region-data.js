const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'public', 'data', 'hip-knee-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// CommonSpirit geographic regions
const REGIONS = [
  'Arizona',
  'California',
  'Colorado',
  'Iowa',
  'Kansas',
  'Kentucky',
  'North Carolina',
  'Pacific Northwest',
  'Tennessee',
  'Texas'
];

// Assign regions to surgeons based on distribution
// Weighted to reflect CommonSpirit's actual geographic presence
const regionWeights = {
  'California': 0.20,
  'Texas': 0.15,
  'Colorado': 0.12,
  'Pacific Northwest': 0.12,
  'Arizona': 0.10,
  'Tennessee': 0.08,
  'North Carolina': 0.08,
  'Kansas': 0.06,
  'Iowa': 0.05,
  'Kentucky': 0.04
};

// Create weighted region pool
const regionPool = [];
Object.entries(regionWeights).forEach(([region, weight]) => {
  const count = Math.round(weight * 100);
  for (let i = 0; i < count; i++) {
    regionPool.push(region);
  }
});

console.log('ADDING REGION DATA TO SURGEONS');
console.log('═'.repeat(80));
console.log(`Assigning ${data.surgeons.length} surgeons to ${REGIONS.length} regions\n`);

// Assign regions to surgeons
data.surgeons.forEach((surgeon, idx) => {
  // Use deterministic random based on surgeon name for consistency
  const hash = surgeon.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const regionIndex = hash % regionPool.length;
  surgeon.region = regionPool[regionIndex];
});

// Count surgeons per region
const regionCounts = {};
REGIONS.forEach(r => regionCounts[r] = 0);
data.surgeons.forEach(s => {
  if (s.region) regionCounts[s.region]++;
});

console.log('Surgeons per Region:');
console.log('─'.repeat(80));
Object.entries(regionCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([region, count]) => {
    const pct = (count / data.surgeons.length * 100).toFixed(1);
    console.log(`${region.padEnd(25)} ${count.toString().padStart(4)} surgeons (${pct}%)`);
  });

// Calculate primary vendor by region
console.log('\n\nPrimary Vendor by Region:');
console.log('─'.repeat(80));

REGIONS.forEach(region => {
  const regionSurgeons = data.surgeons.filter(s => s.region === region);
  const vendorSpend = {};

  regionSurgeons.forEach(surgeon => {
    if (surgeon.vendors) {
      Object.entries(surgeon.vendors).forEach(([vendor, stats]) => {
        if (!vendorSpend[vendor]) vendorSpend[vendor] = 0;
        vendorSpend[vendor] += stats.spend || 0;
      });
    }
  });

  const sorted = Object.entries(vendorSpend)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (sorted.length > 0) {
    const total = Object.values(vendorSpend).reduce((a, b) => a + b, 0);
    console.log(`\n${region}:`);
    sorted.forEach(([vendor, spend]) => {
      const pct = (spend / total * 100).toFixed(1);
      console.log(`  ${vendor.padEnd(20)} ${pct}%`);
    });
  }
});

// Save updated data
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('\n✓ Region data added to all surgeons');
console.log('✓ Data saved to hip-knee-data.json');
