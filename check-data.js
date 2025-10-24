const data = require('./public/data/hip-knee-data.json');
console.log('Keys in data file:', Object.keys(data));
console.log('Has components:', data.components ? 'yes' : 'no');
console.log('Number of components:', data.components ? data.components.length : 0);
console.log('Sample surgeon vendors:', data.surgeons[0] ? Object.keys(data.surgeons[0].vendors || {}) : 'none');
