const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./public/data/hip-knee-data.json', 'utf8'));

console.log('\nScenario Risk Scores and Savings Percentages:\n');
Object.entries(data.scenarios).forEach(([id, s]) => {
  if (id !== 'pricing-cap') {
    const savingsPercent = (s.savingsPercent * 100).toFixed(1);
    console.log(`${id.padEnd(25)} - Risk: ${s.riskScore}  | Savings: ${savingsPercent}%`);
  }
});
