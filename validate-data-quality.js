/**
 * Automated Data Quality Validation Script
 * Run this after data upload to check data quality metrics
 */

const fs = require('fs');
const path = require('path');

// Configuration
const THRESHOLDS = {
  minCostPerCase: 500,
  maxCostPerCase: 50000,
  minCasesPerSurgeon: 1,
  maxSurgeonsWithZeroCases: 0.5, // 50% threshold
  minRegionalCoverage: 0.8, // 80% should have region data
  expectedAvgCostPerCase: { min: 2000, max: 15000 }
};

function validateDataQuality(dataPath) {
  console.log('═══════════════════════════════════════════════════════');
  console.log('        AUTOMATED DATA QUALITY VALIDATION');
  console.log('═══════════════════════════════════════════════════════\n');

  // Load data
  const data = require(dataPath);
  const report = {
    timestamp: new Date().toISOString(),
    dataFile: dataPath,
    passed: true,
    errors: [],
    warnings: [],
    info: [],
    metrics: {}
  };

  // === BASIC STRUCTURE CHECKS ===
  console.log('📋 STRUCTURE VALIDATION\n');

  if (!data.metadata) {
    report.errors.push('Missing metadata section');
    report.passed = false;
  } else {
    report.info.push(`✓ Metadata present (version ${data.metadata.version})`);
  }

  if (!data.surgeons || !Array.isArray(data.surgeons)) {
    report.errors.push('Missing or invalid surgeons array');
    report.passed = false;
  } else {
    report.info.push(`✓ Surgeons array: ${data.surgeons.length} records`);
  }

  if (!data.vendors) {
    report.errors.push('Missing vendors section');
    report.passed = false;
  }

  if (!data.scenarios) {
    report.errors.push('Missing scenarios section');
    report.passed = false;
  }

  // === CASE COUNT ANALYSIS ===
  console.log('\n💉 CASE COUNT VALIDATION\n');

  const withCases = data.surgeons.filter(s => s.totalCases > 0);
  const zeroCases = data.surgeons.filter(s => s.totalCases === 0);
  const zeroCasePercent = zeroCases.length / data.surgeons.length;

  report.metrics.totalSurgeons = data.surgeons.length;
  report.metrics.surgeonsWithCases = withCases.length;
  report.metrics.surgeonsWithZeroCases = zeroCases.length;
  report.metrics.zeroCasePercent = (zeroCasePercent * 100).toFixed(1) + '%';

  console.log(`Surgeons with cases: ${withCases.length} (${((1 - zeroCasePercent) * 100).toFixed(1)}%)`);
  console.log(`Surgeons with 0 cases: ${zeroCases.length} (${(zeroCasePercent * 100).toFixed(1)}%)`);

  if (zeroCasePercent > THRESHOLDS.maxSurgeonsWithZeroCases) {
    report.warnings.push(
      `High percentage of surgeons with 0 cases (${(zeroCasePercent * 100).toFixed(1)}%). ` +
      `This may indicate component column mapping issues or surgeons who only purchase accessories.`
    );
  }

  // Check if all surgeons have 0 cases (critical error)
  if (withCases.length === 0) {
    report.errors.push(
      'CRITICAL: All surgeons have 0 cases! Component names are not being detected. ' +
      'Check CSV column mapping for component/description field.'
    );
    report.passed = false;
  }

  // === COST PER CASE ANALYSIS ===
  console.log('\n💰 COST PER CASE VALIDATION\n');

  if (withCases.length > 0) {
    const costPerCase = withCases.map(s => ({
      name: s.name,
      cases: s.totalCases,
      spend: s.totalSpend,
      costPerCase: s.totalSpend / s.totalCases
    })).sort((a, b) => a.costPerCase - b.costPerCase);

    const median = costPerCase[Math.floor(costPerCase.length / 2)].costPerCase;
    const avg = costPerCase.reduce((sum, s) => sum + s.costPerCase, 0) / costPerCase.length;
    const min = costPerCase[0].costPerCase;
    const max = costPerCase[costPerCase.length - 1].costPerCase;

    report.metrics.costPerCase = {
      min: Math.round(min),
      median: Math.round(median),
      average: Math.round(avg),
      max: Math.round(max)
    };

    console.log(`Median: $${Math.round(median).toLocaleString()}`);
    console.log(`Average: $${Math.round(avg).toLocaleString()}`);
    console.log(`Range: $${Math.round(min).toLocaleString()} - $${Math.round(max).toLocaleString()}`);

    // Check if average is reasonable
    if (avg < THRESHOLDS.expectedAvgCostPerCase.min || avg > THRESHOLDS.expectedAvgCostPerCase.max) {
      report.warnings.push(
        `Average cost per case ($${Math.round(avg).toLocaleString()}) is outside expected range ` +
        `($${THRESHOLDS.expectedAvgCostPerCase.min.toLocaleString()} - ` +
        `$${THRESHOLDS.expectedAvgCostPerCase.max.toLocaleString()})`
      );
    }

    // Identify outliers
    const outliers = costPerCase.filter(
      s => s.costPerCase < THRESHOLDS.minCostPerCase || s.costPerCase > THRESHOLDS.maxCostPerCase
    );

    report.metrics.outliers = outliers.length;

    if (outliers.length > 0) {
      console.log(`\n🚨 Outliers detected: ${outliers.length}`);
      report.warnings.push(`${outliers.length} surgeons have cost/case outside normal range ($${THRESHOLDS.minCostPerCase}-$${THRESHOLDS.maxCostPerCase})`);

      if (outliers.length <= 10) {
        console.log('\nOutliers:');
        outliers.forEach(o => {
          console.log(`  - ${o.name}: ${o.cases} cases, $${Math.round(o.costPerCase).toLocaleString()}/case`);
        });
      }
    } else {
      console.log('✓ No outliers detected');
    }
  }

  // === REGIONAL DATA VALIDATION ===
  console.log('\n🌎 REGIONAL DATA VALIDATION\n');

  const withRegion = data.surgeons.filter(s => s.region);
  const regionalCoverage = withRegion.length / data.surgeons.length;

  report.metrics.regionalCoverage = (regionalCoverage * 100).toFixed(1) + '%';

  console.log(`Surgeons with region data: ${withRegion.length} (${(regionalCoverage * 100).toFixed(1)}%)`);

  if (regionalCoverage < THRESHOLDS.minRegionalCoverage) {
    report.warnings.push(
      `Low regional coverage (${(regionalCoverage * 100).toFixed(1)}%). ` +
      `Consider adding Region column to CSV for better regional analysis.`
    );
  } else {
    console.log('✓ Good regional coverage');
  }

  if (data.regions) {
    const regionNames = Object.keys(data.regions);
    console.log(`Regions detected: ${regionNames.join(', ')}`);
    report.metrics.regions = regionNames;
  }

  // === COMPONENT DATA VALIDATION ===
  console.log('\n📦 COMPONENT DATA VALIDATION\n');

  const unknownComponents = data.components.filter(c => !c.name || c.name === 'Unknown').length;
  const knownComponents = data.components.length - unknownComponents;
  const unknownPercent = unknownComponents / data.components.length;

  report.metrics.totalComponents = data.components.length;
  report.metrics.unknownComponents = unknownComponents;
  report.metrics.knownComponents = knownComponents;
  report.metrics.unknownPercent = (unknownPercent * 100).toFixed(1) + '%';

  console.log(`Total component records: ${data.components.length.toLocaleString()}`);
  console.log(`Unknown components: ${unknownComponents.toLocaleString()} (${(unknownPercent * 100).toFixed(1)}%)`);
  console.log(`Known components: ${knownComponents.toLocaleString()}`);

  if (unknownPercent > 0.9) {
    report.errors.push(
      `CRITICAL: ${(unknownPercent * 100).toFixed(1)}% of components are "Unknown". ` +
      `Component column not detected in CSV. Check column mapping.`
    );
    report.passed = false;
  } else if (unknownPercent > 0.5) {
    report.warnings.push(
      `High percentage of unknown components (${(unknownPercent * 100).toFixed(1)}%). ` +
      `Check component column mapping.`
    );
  }

  // === VENDOR VALIDATION ===
  console.log('\n🏢 VENDOR DATA VALIDATION\n');

  const vendorCount = Object.keys(data.vendors).length;
  console.log(`Total vendors: ${vendorCount}`);
  report.metrics.totalVendors = vendorCount;

  if (vendorCount < 3) {
    report.warnings.push(`Only ${vendorCount} vendors detected. Expected at least 3-5 major vendors.`);
  }

  // === SCENARIO VALIDATION ===
  console.log('\n📊 SCENARIO VALIDATION\n');

  const scenarioCount = Object.keys(data.scenarios).length;
  console.log(`Total scenarios: ${scenarioCount}`);
  report.metrics.totalScenarios = scenarioCount;

  if (scenarioCount < 5) {
    report.warnings.push(`Only ${scenarioCount} scenarios generated. Expected at least 5-7.`);
  }

  // === FINAL REPORT ===
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('                    VALIDATION SUMMARY');
  console.log('═══════════════════════════════════════════════════════\n');

  if (report.errors.length > 0) {
    console.log('🚨 ERRORS (' + report.errors.length + '):\n');
    report.errors.forEach((err, idx) => {
      console.log(`${idx + 1}. ${err}`);
    });
    console.log();
  }

  if (report.warnings.length > 0) {
    console.log('⚠️  WARNINGS (' + report.warnings.length + '):\n');
    report.warnings.forEach((warn, idx) => {
      console.log(`${idx + 1}. ${warn}`);
    });
    console.log();
  }

  if (report.info.length > 0) {
    console.log('ℹ️  INFO:\n');
    report.info.forEach((info, idx) => {
      console.log(`${idx + 1}. ${info}`);
    });
    console.log();
  }

  // Calculate health score
  let healthScore = 100;
  healthScore -= report.errors.length * 25; // Errors are critical
  healthScore -= report.warnings.length * 5; // Warnings reduce score
  healthScore = Math.max(0, Math.min(100, healthScore));

  report.healthScore = healthScore;

  console.log('DATA HEALTH SCORE: ' + healthScore + '/100');

  if (healthScore >= 90) {
    console.log('Status: ✅ EXCELLENT - Data is production-ready');
  } else if (healthScore >= 75) {
    console.log('Status: ✅ GOOD - Data is usable with minor issues');
  } else if (healthScore >= 60) {
    console.log('Status: ⚠️  FAIR - Data has notable issues');
  } else {
    console.log('Status: 🚨 POOR - Data needs significant fixes');
  }

  console.log('\nValidation: ' + (report.passed ? '✅ PASSED' : '❌ FAILED'));
  console.log('\n═══════════════════════════════════════════════════════\n');

  // Save report
  const reportPath = path.join(path.dirname(dataPath), 'data-quality-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Full report saved to: ${reportPath}\n`);

  return report;
}

// Run validation
const dataPath = process.argv[2] || './public/data/hip-knee-data.json';
const absolutePath = path.resolve(dataPath);

try {
  const report = validateDataQuality(absolutePath);
  process.exit(report.passed ? 0 : 1);
} catch (error) {
  console.error('❌ Validation failed:', error.message);
  process.exit(1);
}
