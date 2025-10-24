const data = require('./public/data/hip-knee-data.json');
const keys = Object.keys(data.scenarios);
console.log('Scenario keys:', keys);
const firstKey = keys[0];
console.log('\nFirst scenario key:', firstKey);
console.log('Has roboticPlatformAlignment?', data.scenarios[firstKey].roboticPlatformAlignment !== undefined);
if (data.scenarios[firstKey].roboticPlatformAlignment) {
  console.log('Alignment score:', data.scenarios[firstKey].roboticPlatformAlignment.alignmentScore);
}
