#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result.toISOString().split('T')[0];
}

function updateWorkflowDates(filePath) {
  console.log(`\n📅 Updating workflow dates in ${path.basename(filePath)}...`);

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Update or create workflow section
  if (!data.workflow && !data.workflowTracking) {
    console.log('⚠️  No workflow section found, creating one...');
    data.workflow = {};
  }

  const workflow = data.workflow || data.workflowTracking || {};

  // Update to new structure
  workflow.currentStage = 'sourcing-review';
  workflow.lastUpdated = new Date().toISOString();
  workflow.stages = {
    'sourcing-review': {
      status: 'active',
      startDate: todayStr,
      notes: 'Analyzing market data, vendor landscape, and internal spend patterns'
    },
    'decision': {
      status: 'upcoming',
      scheduledDate: addMonths(today, 2), // 2 months out
      notes: 'Decision meeting scheduled with clinical leadership and finance'
    },
    'implementation': {
      status: 'upcoming',
      expectedStart: addMonths(today, 4), // 4 months out
      expectedCompletion: addMonths(today, 16), // 16 months out
      percentComplete: 0,
      milestones: [
        {
          name: 'Contract negotiations',
          completed: false,
          expectedDate: addMonths(today, 3)
        },
        {
          name: 'Contract signing',
          completed: false,
          expectedDate: addMonths(today, 4)
        },
        {
          name: 'Surgeon training sessions',
          completed: false,
          expectedDate: addMonths(today, 10)
        },
        {
          name: 'Go-live for all sites',
          completed: false,
          expectedDate: addMonths(today, 13)
        },
        {
          name: 'Full adoption target',
          completed: false,
          expectedDate: addMonths(today, 16)
        }
      ],
      notes: 'Timeline dependent on scenario selection and stakeholder alignment'
    },
    'lookback': {
      status: 'upcoming',
      scheduledDate: addMonths(today, 19), // 3 months after implementation
      notes: 'First lookback scheduled 3 months post-implementation to validate assumptions'
    },
    'renewal': {
      status: 'upcoming',
      contractExpirationDate: addMonths(today, 40), // ~3.3 years out
      nextReviewDate: addMonths(today, 37), // Start review 3 months before expiration
      notes: 'Contracts will be 3-year terms with annual performance reviews'
    }
  };

  // Save as workflow (not workflowTracking) for consistency
  data.workflow = workflow;
  delete data.workflowTracking; // Remove old field if it exists

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Updated workflow dates for ${path.basename(filePath)}`);
  console.log(`   - Current stage: sourcing-review (active)`);
  console.log(`   - Decision scheduled: ${workflow.stages['decision'].scheduledDate}`);
  console.log(`   - Implementation: ${workflow.stages['implementation'].expectedStart} - ${workflow.stages['implementation'].expectedCompletion}`);
  console.log(`   - Lookback: ${workflow.stages['lookback'].scheduledDate}`);
  console.log(`   - Contract expiration: ${workflow.stages['renewal'].contractExpirationDate}`);
}

// Update both files
const files = [
  path.join(__dirname, 'public', 'orthopedic-data.json'),
  path.join(__dirname, 'public', 'shoulder-data.json')
];

console.log('🔄 Starting workflow date updates...\n');

files.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      updateWorkflowDates(file);
    } catch (error) {
      console.error(`❌ Error processing ${path.basename(file)}:`, error.message);
    }
  } else {
    console.log(`⚠️  File not found: ${path.basename(file)}`);
  }
});

console.log('\n✨ Workflow date updates complete!\n');
