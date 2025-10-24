const data = require('./public/data/hip-knee-data.json');
const surgeons = data.surgeons || [];
const vendorRoboticCases = {};

surgeons.forEach(surgeon => {
  if (surgeon.roboticMetrics && surgeon.roboticMetrics.estimatedRoboticCases > 0) {
    const vendors = surgeon.vendors || {};
    let primaryVendor = null;
    let maxCases = 0;

    Object.entries(vendors).forEach(([vendor, data]) => {
      if (data.cases > maxCases) {
        maxCases = data.cases;
        primaryVendor = vendor;
      }
    });

    if (primaryVendor) {
      if (!vendorRoboticCases[primaryVendor]) {
        vendorRoboticCases[primaryVendor] = {
          surgeons: 0,
          roboticCases: 0
        };
      }
      vendorRoboticCases[primaryVendor].surgeons++;
      vendorRoboticCases[primaryVendor].roboticCases += surgeon.roboticMetrics.estimatedRoboticCases;
    }
  }
});

console.log('Robotic cases by vendor (based on surgeon primary vendor):\n');
Object.entries(vendorRoboticCases)
  .sort((a, b) => b[1].roboticCases - a[1].roboticCases)
  .forEach(([vendor, stats]) => {
    console.log(`${vendor}: ${stats.roboticCases} cases from ${stats.surgeons} surgeons`);
  });
