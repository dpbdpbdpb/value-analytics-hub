const data = require('./public/data/hip-knee-data.json');

const HIGH_VOLUME_THRESHOLD = 200;
const MEDIUM_VOLUME_THRESHOLD = 50;
const LOYALTY_THRESHOLD = 0.70;

// Vendor to robotic platform mapping
const VENDOR_ROBOTS = {
  'STRYKER': 'Mako',
  'ZIMMER BIOMET': 'ROSA',
  'JOHNSON & JOHNSON': 'VELYS',
  'SMITH & NEPHEW': 'CORI',
  'MEDACTA': 'MYMAKO',
  'EXACTECH': 'ExactechGPS'
};

// Simulate the surgeonImpact calculation
const surgeonImpact = data.surgeons.map(surgeon => {
  const volume = surgeon.totalCases || 0;
  const volumeCategory = volume >= HIGH_VOLUME_THRESHOLD ? 'high' :
                        volume >= MEDIUM_VOLUME_THRESHOLD ? 'medium' : 'low';

  // Calculate primary vendor from vendors object
  let primaryVendor = 'Unknown';
  let primaryVendorCases = 0;
  let primaryVendorPercent = 0;

  if (surgeon.vendors && typeof surgeon.vendors === 'object') {
    // Find vendor with most cases
    Object.entries(surgeon.vendors).forEach(([vendorName, vendorData]) => {
      const cases = vendorData.cases || 0;
      if (cases > primaryVendorCases) {
        primaryVendorCases = cases;
        primaryVendor = vendorName;
      }
    });

    // Calculate percentage
    if (volume > 0) {
      primaryVendorPercent = primaryVendorCases / volume;
    }
  }

  const isLoyalist = primaryVendorPercent >= LOYALTY_THRESHOLD;

  return {
    ...surgeon,
    volume,
    volumeCategory,
    primaryVendor,
    primaryVendorPercent,
    primaryVendorCases,
    isLoyalist
  };
});

// Simulate hospital impact tracking
const hospitalImpact = {};
surgeonImpact.forEach(surgeon => {
  const facility = surgeon.facility || 'Unassigned';
  if (!hospitalImpact[facility]) {
    hospitalImpact[facility] = {
      roboticVendors: {}
    };
  }

  const vendor = surgeon.primaryVendor || 'Unknown';
  const roboticCases = surgeon.roboticMetrics?.estimatedRoboticCases || 0;

  if (roboticCases > 0) {
    if (!hospitalImpact[facility].roboticVendors[vendor]) {
      hospitalImpact[facility].roboticVendors[vendor] = 0;
    }
    hospitalImpact[facility].roboticVendors[vendor] += roboticCases;
  }
});

// Find hospitals with robotic cases
console.log('Hospitals with robotic cases:\n');
Object.entries(hospitalImpact)
  .filter(([_, data]) => Object.keys(data.roboticVendors).length > 0)
  .slice(0, 10)
  .forEach(([facility, data]) => {
    console.log(`${facility}:`);
    Object.entries(data.roboticVendors).forEach(([vendor, cases]) => {
      const robot = VENDOR_ROBOTS[vendor] || '(no robot mapping)';
      console.log(`  ${vendor}: ${cases} cases -> ${robot}`);
    });
    console.log('');
  });

console.log(`\nTotal hospitals with robotic cases: ${Object.values(hospitalImpact).filter(h => Object.keys(h.roboticVendors).length > 0).length}`);
