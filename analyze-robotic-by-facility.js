#!/usr/bin/env node

/**
 * Comprehensive Robotic Platform Analysis
 * A) Link procedures to facilities through surgeons
 * B) Create surgeon-level robotic flags
 * C) Calculate robotic platform alignment for risk assessment
 */

const fs = require('fs');
const path = require('path');

function analyzeRoboticsByFacility() {
  console.log('\n🤖 Comprehensive Robotic Platform Analysis\n');

  const dataPath = path.join(__dirname, 'public', 'data', 'hip-knee-data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  const components = data.components || [];
  const surgeons = data.surgeons || [];

  // Step 1: Infer robotic platform from vendor when not explicitly specified
  const inferRoboticPlatform = (procedureType, vendor) => {
    const proc = (procedureType || '').toLowerCase();
    const vend = (vendor || '').toUpperCase();

    if (!proc.includes('robot')) return null;

    // Explicit platform mentions
    if (proc.includes('mako')) return 'Mako';
    if (proc.includes('cori')) return 'Cori';
    if (proc.includes('rosa')) return 'Rosa';
    if (proc.includes('navio')) return 'Navio';

    // Infer from vendor when procedure says "robot-assisted"
    if (vend.includes('STRYKER')) return 'Mako';
    if (vend.includes('ZIMMER')) return 'Rosa';
    if (vend.includes('SMITH')) return 'Cori/Navio';

    return 'Generic';
  };

  // Step 2: Aggregate robotic usage by vendor
  const vendorRoboticCases = {};

  components.forEach(comp => {
    const platform = inferRoboticPlatform(comp.procedureType, comp.vendor);
    if (platform) {
      const vendor = comp.vendor || 'Unknown';
      if (!vendorRoboticCases[vendor]) {
        vendorRoboticCases[vendor] = {
          totalRoboticCases: 0,
          platforms: {},
          spend: 0
        };
      }
      vendorRoboticCases[vendor].totalRoboticCases++;
      vendorRoboticCases[vendor].spend += comp.totalSpend || 0;

      if (!vendorRoboticCases[vendor].platforms[platform]) {
        vendorRoboticCases[vendor].platforms[platform] = 0;
      }
      vendorRoboticCases[vendor].platforms[platform]++;
    }
  });

  console.log('📊 Robotic Cases by Vendor (with platform inference):\n');
  Object.entries(vendorRoboticCases)
    .sort((a, b) => b[1].totalRoboticCases - a[1].totalRoboticCases)
    .forEach(([vendor, data]) => {
      console.log(`  ${vendor}:`);
      console.log(`    Total Robotic Cases: ${data.totalRoboticCases.toLocaleString()}`);
      console.log(`    Spend: $${(data.spend / 1000000).toFixed(2)}M`);
      console.log(`    Platforms:`);
      Object.entries(data.platforms)
        .sort((a, b) => b[1] - a[1])
        .forEach(([platform, count]) => {
          console.log(`      - ${platform}: ${count.toLocaleString()}`);
        });
      console.log('');
    });

  // Step 3: Since components don't have facility, we need to work with surgeon data
  // Add robotic metrics to each surgeon based on their vendor usage patterns
  const surgeonsWithRobotics = surgeons.map(surgeon => {
    const surgeonVendors = surgeon.vendors || {};

    // Calculate robotic probability based on vendor mix
    let estimatedRoboticCases = 0;
    let primaryRoboticPlatform = null;
    let maxPlatformCases = 0;

    Object.entries(surgeonVendors).forEach(([vendor, vendorData]) => {
      const cases = vendorData.cases || 0;
      const vendorRobotic = vendorRoboticCases[vendor];

      if (vendorRobotic) {
        // Estimate this surgeon's robotic cases based on vendor's robotic %
        const totalVendorCases = components.filter(c => c.vendor === vendor).length;
        const roboticRate = vendorRobotic.totalRoboticCases / totalVendorCases;
        const estimatedRoboticForVendor = cases * roboticRate;

        estimatedRoboticCases += estimatedRoboticForVendor;

        // Determine primary platform
        Object.entries(vendorRobotic.platforms).forEach(([platform, count]) => {
          const estimatedPlatformCases = estimatedRoboticForVendor * (count / vendorRobotic.totalRoboticCases);
          if (estimatedPlatformCases > maxPlatformCases) {
            maxPlatformCases = estimatedPlatformCases;
            primaryRoboticPlatform = platform;
          }
        });
      }
    });

    return {
      ...surgeon,
      roboticMetrics: {
        estimatedRoboticCases: Math.round(estimatedRoboticCases),
        roboticPercentage: surgeon.totalCases > 0 ? (estimatedRoboticCases / surgeon.totalCases) * 100 : 0,
        primaryRoboticPlatform: estimatedRoboticCases > 20 ? primaryRoboticPlatform : null,
        isRoboticUser: estimatedRoboticCases > 20 // At least 20 robotic cases
      }
    };
  });

  // Step 4: Aggregate to facility level
  const facilityRobotics = {};

  surgeonsWithRobotics.forEach(surgeon => {
    const facility = surgeon.facility || 'Unknown';

    if (!facilityRobotics[facility]) {
      facilityRobotics[facility] = {
        totalSurgeons: 0,
        roboticSurgeons: 0,
        estimatedRoboticCases: 0,
        totalCases: 0,
        platforms: {},
        platformDetails: {}, // Track vendor info for better display
        region: surgeon.region || 'Unknown'
      };
    }

    facilityRobotics[facility].totalSurgeons++;
    facilityRobotics[facility].totalCases += surgeon.totalCases || 0;
    facilityRobotics[facility].estimatedRoboticCases += surgeon.roboticMetrics.estimatedRoboticCases;

    if (surgeon.roboticMetrics.isRoboticUser) {
      facilityRobotics[facility].roboticSurgeons++;

      const platform = surgeon.roboticMetrics.primaryRoboticPlatform;
      if (platform) {
        if (!facilityRobotics[facility].platforms[platform]) {
          facilityRobotics[facility].platforms[platform] = 0;
        }
        facilityRobotics[facility].platforms[platform]++;

        // Track primary vendor for this platform at this facility
        if (!facilityRobotics[facility].platformDetails[platform]) {
          // Find surgeon's primary vendor
          let primaryVendor = 'Unknown';
          let maxCases = 0;
          Object.entries(surgeon.vendors || {}).forEach(([vendor, data]) => {
            if (data.cases > maxCases) {
              maxCases = data.cases;
              primaryVendor = vendor;
            }
          });
          facilityRobotics[facility].platformDetails[platform] = primaryVendor;
        }
      }
    }
  });

  console.log('\n🏥 Hospitals with Robotic Platforms (Top 20):\n');
  Object.entries(facilityRobotics)
    .filter(([_, data]) => data.estimatedRoboticCases > 0)
    .sort((a, b) => b[1].estimatedRoboticCases - a[1].estimatedRoboticCases)
    .slice(0, 20)
    .forEach(([facility, data]) => {
      const roboticRate = (data.estimatedRoboticCases / data.totalCases) * 100;
      console.log(`  ${facility}:`);
      console.log(`    Robotic Cases: ~${Math.round(data.estimatedRoboticCases)} (${roboticRate.toFixed(1)}%)`);
      console.log(`    Robotic Surgeons: ${data.roboticSurgeons}/${data.totalSurgeons}`);
      if (Object.keys(data.platforms).length > 0) {
        console.log(`    Platforms: ${Object.entries(data.platforms)
          .sort((a, b) => b[1] - a[1])
          .map(([p, c]) => `${p} (${c})`)
          .join(', ')}`);
      }
      console.log('');
    });

  // Step 5: Add robotic platform alignment to scenarios
  const scenarios = data.scenarios || {};

  Object.keys(scenarios).forEach(scenarioId => {
    const scenario = scenarios[scenarioId];
    const scenarioVendors = scenario.vendors || [];

    // Calculate robotic platform compatibility
    let totalRoboticCases = 0;
    let compatibleRoboticCases = 0;
    let incompatiblePlatforms = [];

    Object.entries(facilityRobotics).forEach(([facility, fData]) => {
      totalRoboticCases += fData.estimatedRoboticCases;

      Object.entries(fData.platforms).forEach(([platform, surgeonCount]) => {
        const platformCases = fData.estimatedRoboticCases * (surgeonCount / fData.roboticSurgeons);

        // Check if scenario vendors support this platform
        let isCompatible = false;
        if (platform === 'Mako' && scenarioVendors.some(v => v.toUpperCase().includes('STRYKER'))) {
          isCompatible = true;
        } else if (platform === 'Rosa' && scenarioVendors.some(v => v.toUpperCase().includes('ZIMMER'))) {
          isCompatible = true;
        } else if ((platform === 'Cori/Navio' || platform === 'Cori') && scenarioVendors.some(v => v.toUpperCase().includes('SMITH'))) {
          isCompatible = true;
        }

        if (isCompatible) {
          compatibleRoboticCases += platformCases;
        } else if (platformCases > 50) {
          // Get vendor for better display
          const vendor = fData.platformDetails[platform] || 'Unknown';
          const displayName = platform === 'Generic' ? `Robot-Assisted (${vendor})` : platform;
          incompatiblePlatforms.push({
            platform: displayName,
            facility,
            cases: Math.round(platformCases),
            vendor  // Include for reference
          });
        }
      });
    });

    const roboticAlignmentScore = totalRoboticCases > 0
      ? (compatibleRoboticCases / totalRoboticCases) * 100
      : 100;

    scenario.roboticPlatformAlignment = {
      alignmentScore: roboticAlignmentScore,
      totalRoboticCases: Math.round(totalRoboticCases),
      compatibleCases: Math.round(compatibleRoboticCases),
      incompatibleCases: Math.round(totalRoboticCases - compatibleRoboticCases),
      incompatiblePlatforms: incompatiblePlatforms.slice(0, 5),
      riskImpact: roboticAlignmentScore < 80 ? 'High' : roboticAlignmentScore < 90 ? 'Medium' : 'Low'
    };
  });

  console.log('\n📊 Robotic Platform Alignment by Scenario:\n');
  Object.entries(scenarios)
    .filter(([id, _]) => id !== 'pricing-cap')
    .forEach(([id, scenario]) => {
      const align = scenario.roboticPlatformAlignment;
      console.log(`  ${scenario.shortName}:`);
      console.log(`    Alignment Score: ${align.alignmentScore.toFixed(1)}%`);
      console.log(`    Risk Impact: ${align.riskImpact}`);
      console.log(`    Compatible Cases: ${align.compatibleCases.toLocaleString()}/${align.totalRoboticCases.toLocaleString()}`);
      if (align.incompatiblePlatforms.length > 0) {
        console.log(`    Stranded Platforms:`);
        align.incompatiblePlatforms.forEach(({ platform, facility, cases }) => {
          console.log(`      - ${platform} at ${facility}: ~${cases} cases`);
        });
      }
      console.log('');
    });

  // Save updated data
  data.surgeons = surgeonsWithRobotics;
  data.scenarios = scenarios;
  data.facilityRobotics = facilityRobotics;

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log('✅ Updated data with robotic metrics at surgeon, facility, and scenario levels\n');
}

analyzeRoboticsByFacility();
