const data = require('./public/data/hip-knee-data.json');

console.log('SCENARIO SAVINGS AND RISK:');
console.log('='.repeat(90));
console.log('Scenario'.padEnd(45) + 'Savings %'.padStart(12) + 'Risk'.padStart(8) + 'Should be in');
console.log('='.repeat(90));

Object.entries(data.scenarios).forEach(([key, scenario]) => {
  const savingsPct = ((scenario.savingsPercent || 0) * 100).toFixed(1);
  const risk = scenario.riskScore || 0;
  
  // Determine which bucket
  let savingsBucket = '';
  if (savingsPct >= 22) savingsBucket = '22%+';
  else if (savingsPct >= 12) savingsBucket = '12-18%';
  else if (savingsPct >= 5) savingsBucket = '5-12%';
  else savingsBucket = '0-5%';
  
  let riskBucket = '';
  if (risk >= 8) riskBucket = 'Very High (8-10)';
  else if (risk >= 6) riskBucket = 'High (6-8)';
  else if (risk >= 4) riskBucket = 'Medium (4-6)';
  else if (risk >= 2) riskBucket = 'Low (2-4)';
  else riskBucket = 'Very Low (0-2)';
  
  console.log(
    scenario.name.substring(0, 44).padEnd(45) +
    (savingsPct + '%').padStart(12) +
    risk.toFixed(1).padStart(8) +
    '  ' + savingsBucket + ' / ' + riskBucket
  );
});
