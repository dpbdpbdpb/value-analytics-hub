const data = require('./public/data/hip-knee-data.json');

console.log('Sample components:');
console.log(JSON.stringify(data.components.slice(0, 5), null, 2));

console.log('\n\nComponent fields:');
if (data.components.length > 0) {
  console.log(Object.keys(data.components[0]));
}
