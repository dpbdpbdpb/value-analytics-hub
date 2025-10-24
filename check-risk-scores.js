const data = require('./public/data/hip-knee-data.json');

console.log('SCENARIO RISK SCORES:');
console.log('='.repeat(80));

Object.entries(data.scenarios).forEach(([key, scenario]) => {
  const name = scenario.name.padEnd(40);
  const risk = scenario.riskScore !== undefined ? scenario.riskScore : 'MISSING';
  console.log(`${name} Risk: ${risk}`);
});
