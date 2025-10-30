const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'public/data/hip-knee-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const totalSpend = data.metadata.totalSpend;
const totalCases = data.metadata.totalCases;

// Top vendors by spend
const topVendors = ['VENDOR-ALPHA', 'VENDOR-BETA', 'VENDOR-GAMMA', 'VENDOR-DELTA', 'VENDOR-EPSILON'];

// Get all unique vendors from surgeon data
const allVendors = new Set();
data.surgeons.forEach(s => {
  if (s.vendors) {
    Object.keys(s.vendors).forEach(v => allVendors.add(v));
  }
});
const allVendorsList = Array.from(allVendors);

console.log(`Total spend: $${(totalSpend/1000000).toFixed(1)}M`);
console.log(`Total cases: ${totalCases.toLocaleString()}`);
console.log(`Unique vendors: ${allVendorsList.length}`);

// Create comprehensive scenario set
data.scenarios = {
  'status-quo': {
    shortName: 'Status Quo',
    description: 'Current state with all existing vendor relationships',
    vendors: allVendorsList,
    savingsPercent: 0,
    annualSavings: 0,
    adoptionRate: 1.0,
    riskLevel: 'low',
    riskScore: 1.0,
    quintupleMissionScore: 60,
    npv5Year: 0,
    implementation: {
      complexity: 'None',
      timeline: 0,
      costMillions: 0
    },
    vendorSplit: {},
    roboticPlatformAlignment: {
      alignmentScore: 100,
      compatibleCases: totalCases,
      totalRoboticCases: totalCases,
      incompatibleCases: 0
    }
  },

  'tri-vendor-premium': {
    shortName: 'Three-Vendor Strategy',
    description: 'Consolidate to top three vendors for balanced competition and leverage',
    vendors: topVendors.slice(0, 3),
    savingsPercent: 0.12,
    annualSavings: totalSpend * 0.12,
    adoptionRate: 0.75,
    riskLevel: 'medium',
    riskScore: 5.5,
    quintupleMissionScore: 80,
    npv5Year: totalSpend * 0.12 * 4.2, // ~4.2x NPV multiplier
    implementation: {
      complexity: 'Medium',
      timeline: 12,
      costMillions: 2.5
    },
    vendorSplit: {
      'VENDOR-ALPHA': 0.40,
      'VENDOR-BETA': 0.35,
      'VENDOR-GAMMA': 0.25
    },
    roboticPlatformAlignment: {
      alignmentScore: 85,
      compatibleCases: Math.round(totalCases * 0.85),
      totalRoboticCases: totalCases,
      incompatibleCases: Math.round(totalCases * 0.15)
    }
  },

  'dual-premium': {
    shortName: 'Two-Vendor Strategy (Premium)',
    description: 'Dual-vendor approach focusing on top-tier vendors',
    vendors: [topVendors[0], topVendors[1]],
    savingsPercent: 0.18,
    annualSavings: totalSpend * 0.18,
    adoptionRate: 0.65,
    riskLevel: 'medium-high',
    riskScore: 6.5,
    quintupleMissionScore: 82,
    npv5Year: totalSpend * 0.18 * 4.0,
    implementation: {
      complexity: 'High',
      timeline: 15,
      costMillions: 3.2
    },
    vendorSplit: {
      'VENDOR-ALPHA': 0.55,
      'VENDOR-BETA': 0.45
    },
    roboticPlatformAlignment: {
      alignmentScore: 78,
      compatibleCases: Math.round(totalCases * 0.78),
      totalRoboticCases: totalCases,
      incompatibleCases: Math.round(totalCases * 0.22)
    }
  },

  'dual-value': {
    shortName: 'Two-Vendor Strategy (Balanced)',
    description: 'Balanced dual-vendor approach optimizing cost and quality',
    vendors: [topVendors[1], topVendors[2]],
    savingsPercent: 0.16,
    annualSavings: totalSpend * 0.16,
    adoptionRate: 0.70,
    riskLevel: 'medium',
    riskScore: 5.8,
    quintupleMissionScore: 78,
    npv5Year: totalSpend * 0.16 * 4.1,
    implementation: {
      complexity: 'Medium-High',
      timeline: 14,
      costMillions: 2.8
    },
    vendorSplit: {
      'VENDOR-BETA': 0.50,
      'VENDOR-GAMMA': 0.50
    },
    roboticPlatformAlignment: {
      alignmentScore: 80,
      compatibleCases: Math.round(totalCases * 0.80),
      totalRoboticCases: totalCases,
      incompatibleCases: Math.round(totalCases * 0.20)
    }
  },

  'single-vendor': {
    shortName: 'Single-Vendor Strategy',
    description: 'Maximum consolidation to single preferred vendor',
    vendors: [topVendors[0]],
    savingsPercent: 0.22,
    annualSavings: totalSpend * 0.22,
    adoptionRate: 0.50,
    riskLevel: 'high',
    riskScore: 8.5,
    quintupleMissionScore: 75,
    npv5Year: totalSpend * 0.22 * 3.5,
    implementation: {
      complexity: 'Very High',
      timeline: 18,
      costMillions: 4.5
    },
    vendorSplit: {
      'VENDOR-ALPHA': 1.0
    },
    roboticPlatformAlignment: {
      alignmentScore: 65,
      compatibleCases: Math.round(totalCases * 0.65),
      totalRoboticCases: totalCases,
      incompatibleCases: Math.round(totalCases * 0.35)
    }
  }
};

// Write back to file
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('✓ Added 5 scenarios to hip-knee-data.json');
console.log('Scenarios:', Object.keys(data.scenarios).join(', '));
