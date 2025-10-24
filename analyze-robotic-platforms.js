#!/usr/bin/env node

/**
 * Analyze robotic platform usage by hospital
 * Identifies which hospitals have Mako, Cori, Rosa, or other robotic platforms
 */

const fs = require('fs');
const path = require('path');

function analyzeRoboticPlatforms() {
  console.log('\n🤖 Analyzing Robotic Platform Usage by Hospital...\n');

  const dataPath = path.join(__dirname, 'public', 'data', 'hip-knee-data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  const components = data.components || [];
  const surgeons = data.surgeons || [];

  // Since components don't have facility info, we need to work from the raw source
  // or create a mapping. For now, let's aggregate robotic procedures found.

  const roboticProcedures = {
    mako: [],
    cori: [],
    rosa: [],
    navio: [],
    generic: []
  };

  const procedureCounts = {};

  components.forEach(comp => {
    const procedure = (comp.procedureType || '').toLowerCase();

    if (procedure.includes('robot')) {
      // Count occurrences
      if (!procedureCounts[comp.procedureType]) {
        procedureCounts[comp.procedureType] = 0;
      }
      procedureCounts[comp.procedureType]++;

      // Classify by platform
      if (procedure.includes('mako')) {
        roboticProcedures.mako.push(comp);
      } else if (procedure.includes('cori')) {
        roboticProcedures.cori.push(comp);
      } else if (procedure.includes('rosa')) {
        roboticProcedures.rosa.push(comp);
      } else if (procedure.includes('navio')) {
        roboticProcedures.navio.push(comp);
      } else {
        roboticProcedures.generic.push(comp);
      }
    }
  });

  console.log('📊 Robotic Platform Distribution:\n');
  console.log(`  Mako (Stryker):     ${roboticProcedures.mako.length.toLocaleString()} procedures`);
  console.log(`  Cori (S&N):         ${roboticProcedures.cori.length.toLocaleString()} procedures`);
  console.log(`  Rosa (Zimmer):      ${roboticProcedures.rosa.length.toLocaleString()} procedures`);
  console.log(`  Navio (S&N):        ${roboticProcedures.navio.length.toLocaleString()} procedures`);
  console.log(`  Generic/Unspec:     ${roboticProcedures.generic.length.toLocaleString()} procedures`);

  const totalRobotic = Object.values(roboticProcedures).reduce((sum, arr) => sum + arr.length, 0);
  console.log(`\n  Total Robotic:      ${totalRobotic.toLocaleString()} procedures`);
  console.log(`  Total All Proc:     ${components.length.toLocaleString()} procedures`);
  console.log(`  Robotic %:          ${((totalRobotic / components.length) * 100).toFixed(1)}%\n`);

  console.log('\n📋 Top Robotic Procedure Types:\n');
  const sorted = Object.entries(procedureCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  sorted.forEach(([proc, count], idx) => {
    console.log(`  ${(idx + 1).toString().padStart(2)}. ${proc.padEnd(60)} ${count.toLocaleString()}`);
  });

  // Calculate platform-specific spend
  console.log('\n💰 Spend by Robotic Platform:\n');

  Object.entries(roboticProcedures).forEach(([platform, procs]) => {
    const totalSpend = procs.reduce((sum, p) => sum + (p.totalSpend || 0), 0);
    if (totalSpend > 0) {
      console.log(`  ${platform.toUpperCase().padEnd(12)} $${(totalSpend / 1000000).toFixed(2)}M`);
    }
  });

  // Note about facility-level analysis
  console.log('\n⚠️  NOTE: To identify which specific hospitals have robots, we need');
  console.log('    facility information linked to procedure records. The current');
  console.log('    component data structure does not include facility.');
  console.log('\n    Recommendation: Add facility field to component records during');
  console.log('    data ingestion, or create a separate surgeon-level robotic flag.');

  // Add robotic metrics to data file
  data.roboticMetrics = {
    totalRoboticProcedures: totalRobotic,
    totalProcedures: components.length,
    roboticPercentage: (totalRobotic / components.length) * 100,
    platformCounts: {
      mako: roboticProcedures.mako.length,
      cori: roboticProcedures.cori.length,
      rosa: roboticProcedures.rosa.length,
      navio: roboticProcedures.navio.length,
      generic: roboticProcedures.generic.length
    },
    topProcedures: sorted.map(([proc, count]) => ({ procedure: proc, count }))
  };

  // Save updated data
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log('\n✅ Added roboticMetrics to data file\n');
}

analyzeRoboticPlatforms();
