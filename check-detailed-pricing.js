const data = require('./public/data/hip-knee-data.json');

console.log('matrixPricingDetailed type:', typeof data.matrixPricingDetailed);
console.log('Is array?:', Array.isArray(data.matrixPricingDetailed));

if (data.matrixPricingDetailed) {
  const keys = Object.keys(data.matrixPricingDetailed);
  console.log('Keys:', keys);
  
  if (keys.length > 0) {
    console.log('\nSample data for first key:');
    console.log(JSON.stringify(data.matrixPricingDetailed[keys[0]], null, 2));
  }
}
