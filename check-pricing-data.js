const data = require('./public/data/hip-knee-data.json');

console.log('Matrix pricing structure:');
if (data.matrixPricing) {
  console.log('Has matrixPricing:', 'yes');
  console.log('Sample:', JSON.stringify(data.matrixPricing[0], null, 2));
}

console.log('\n\nDetailed matrix pricing:');
if (data.matrixPricingDetailed) {
  console.log('Has matrixPricingDetailed:', 'yes');
  const sample = data.matrixPricingDetailed.find(p => p.procedureType === 'Hip');
  console.log('Sample Hip pricing:', JSON.stringify(sample, null, 2));
}
