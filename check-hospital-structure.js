const data = require('./public/data/hip-knee-data.json');

console.log('Hospitals structure:');
if (data.hospitals && data.hospitals.length > 0) {
  console.log('Number of hospitals:', data.hospitals.length);
  console.log('Sample hospital:', JSON.stringify(data.hospitals[0], null, 2));
}

console.log('\nRegions structure:');
if (data.regions && data.regions.length > 0) {
  console.log('Number of regions:', data.regions.length);
  console.log('Sample region:', JSON.stringify(data.regions[0], null, 2));
}

console.log('\nSurgeon fields:');
console.log(Object.keys(data.surgeons[0]));
