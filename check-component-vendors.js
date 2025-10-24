const data = require('./public/data/hip-knee-data.json');

// Get unique vendors from components
const vendorSet = new Set();
data.components.forEach(c => {
  if (c.vendor) vendorSet.add(c.vendor);
});

console.log('Unique vendors in components array:');
Array.from(vendorSet).sort().forEach(v => console.log(' -', v));

console.log('\nUnique vendors in surgeon data:');
const surgeonVendors = new Set();
data.surgeons.forEach(s => {
  if (s.vendors) {
    Object.keys(s.vendors).forEach(v => surgeonVendors.add(v));
  }
});
Array.from(surgeonVendors).sort().forEach(v => console.log(' -', v));
