const data = require('./public/data/hip-knee-data.json');

// Check first surgeon
const surgeon = data.surgeons[0];
console.log('Surgeon name:', surgeon.name);
console.log('Has vendors:', surgeon.vendors ? 'yes' : 'no');
console.log('Has topComponents:', surgeon.topComponents ? 'yes' : 'no');
if (surgeon.topComponents) {
  console.log('Number of topComponents:', surgeon.topComponents.length);
} else {
  console.log('Vendor names:', Object.keys(surgeon.vendors || {}));
  console.log('\nSample components from data:');
  const surgeonVendors = Object.keys(surgeon.vendors || {});
  const matchingComps = data.components.filter(c => surgeonVendors.includes(c.vendor)).slice(0, 3);
  console.log(JSON.stringify(matchingComps, null, 2));
}
