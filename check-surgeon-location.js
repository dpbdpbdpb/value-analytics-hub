const data = require('./public/data/hip-knee-data.json');

const surgeon = data.surgeons[0];
console.log('Surgeon:', surgeon.name);
console.log('Has facility:', surgeon.facility ? 'yes' : 'no');
console.log('Has region:', surgeon.region ? 'yes' : 'no');
console.log('Facility:', surgeon.facility);
console.log('Region:', surgeon.region);

// Count surgeons with facility/region
let withFacility = 0;
let withRegion = 0;
data.surgeons.forEach(s => {
  if (s.facility) withFacility++;
  if (s.region) withRegion++;
});

console.log('\n% with facility:', (withFacility / data.surgeons.length * 100).toFixed(1) + '%');
console.log('% with region:', (withRegion / data.surgeons.length * 100).toFixed(1) + '%');
