import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, DollarSign, Settings, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CardiovascularIPGDemo = () => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [assumptions, setAssumptions] = useState({});

  // AGENT Real-World Case Data (De-identified)
  const agentCaseData = {
    outpatient: [
      { facility: 'Facility A', date: 'Q1 2025', diagnosis: 'T82.855A - Stenosis of coronary artery stent', cpt: '92131 - PERF RCAT THER EX CLVR', payer: 'Medicare', revenue: 8248, margin: 9330, contributionMargin: -1081 },
      { facility: 'Facility A', date: 'Q2 2025', diagnosis: 'I25.10 - ASCVD of native coronary artery', cpt: '92131 - PERF RCAT THER EX CLVR', payer: 'Medicare', revenue: 12875, margin: 8450, contributionMargin: 4425 },
      { facility: 'Facility A', date: 'Q2 2025', diagnosis: 'I25.10 - ASCVD w/ unstable angina', cpt: '92131 - PERF RCAT THER EX CLVR', payer: 'Commercial', revenue: 9420, margin: 11987, contributionMargin: -2566 },
      { facility: 'Facility A', date: 'Q2 2025', diagnosis: 'T82.855A - Stenosis of coronary artery stent', cpt: '92131 - PERF RCAT THER EX CLVR', payer: 'Medicare', revenue: 10637, margin: 12598, contributionMargin: -1961 },
      { facility: 'Facility A', date: 'Q2 2025', diagnosis: 'T82.855A - Stenosis of coronary artery stent', cpt: '92131 - PERF RCAT THER EX CLVR', payer: 'Commercial', revenue: 42574, margin: 11555, contributionMargin: 31019 },
      { facility: 'Facility A', date: 'Q2 2025', diagnosis: 'I25.119 - ASCVD w/ other angina', cpt: '36415 - COLLECTION VENOUS BLOOD', payer: 'Commercial', revenue: 22694, margin: 10850, contributionMargin: 11844 },
      { facility: 'Facility A', date: 'Q3 2025', diagnosis: 'I25.10 - ASCVD w/ unstable angina', cpt: '80053 - COMPREHENSIVE METABOLIC PANEL', payer: 'Medicare Advantage', revenue: 12883, margin: 9708, contributionMargin: 3175 },
      { facility: 'Facility A', date: 'Q3 2025', diagnosis: 'I25.119 - ASCVD w/ other angina', cpt: '92131 - PERF RCAT THER EX CLVR', payer: 'Medicare Advantage', revenue: 15311, margin: 17921, contributionMargin: -2610 },
      { facility: 'Facility A', date: 'Q3 2025', diagnosis: 'I25.118 - ASCVD w/ other angina', cpt: '80053 - COMPREHENSIVE METABOLIC PANEL', payer: 'Medicare Advantage', revenue: 15694, margin: 9900, contributionMargin: 5794 },
      { facility: 'Facility B', date: 'Q1 2025', diagnosis: 'T82.855A - Stenosis of coronary artery stent', cpt: 'Not Specified', payer: 'Medicare', revenue: 11139, margin: 7977, contributionMargin: 3162 },
      { facility: 'Facility B', date: 'Q3 2025', diagnosis: 'I25.110 - ASCVD w/ unstable angina', cpt: 'Not Specified', payer: 'Commercial', revenue: 28943, margin: 17459, contributionMargin: 11484 }
    ],
    inpatient: [
      { facility: 'Facility A', date: 'Q2 2025', drg: '321 - PERCUTANEOUS CARDIOVASCULAR PROCEDURES WITH MCC OR 4+ ARTERIES', diagnosis: 'I25.110 - ASCVD w/ unstable angina', procedure: '027372Z - Dilation of Coronary Artery Three Arteries', ntap: true, revenue: 48632, margin: 33856 },
      { facility: 'Facility A', date: 'Q3 2025', drg: '322 - PERCUTANEOUS CARDIOVASCULAR PROCEDURES WITH INTRALUMINAL DEVICE WITHOUT MCC', diagnosis: 'I25.110 - ASCVD w/ unstable angina', procedure: '027042Z - Dilation of Coronary Artery One Artery', ntap: false, revenue: 25778, margin: 8014 },
      { facility: 'Facility A', date: 'Q3 2025', drg: '250 - PERCUTANEOUS CARDIOVASCULAR PROCEDURES WITHOUT INTRALUMINAL DEVICE WITH MCC', diagnosis: 'T82.855A - Stenosis of coronary artery stent', procedure: '027032Z - Dilation of Coronary Artery One Artery Percutaneous', ntap: true, revenue: 18771, margin: 6284 },
      { facility: 'Facility A', date: 'Q3 2025', drg: '250 - PERCUTANEOUS CARDIOVASCULAR PROCEDURES WITHOUT INTRALUMINAL DEVICE WITH MCC', diagnosis: 'T82.855A - Stenosis of coronary artery stent', procedure: '027132Z - Dilation of Coronary Artery Two Arteries Percutaneous', ntap: false, revenue: 24120, margin: -925 },
      { facility: 'Facility A', date: 'Q3 2025', drg: '325 - CORONARY INTRAVASCULAR LITHOTRIPSY WITHOUT INTRALUMINAL DEVICE', diagnosis: 'T82.855A - Stenosis of coronary artery stent', procedure: '02F032Z - Fragmentation in Coronary Artery One Artery Percutaneous', ntap: true, revenue: 59163, margin: 31338 },
      { facility: 'Facility B', date: 'Q3 2025', drg: '250 - PERCUTANEOUS CARDIOVASCULAR PROCEDURES WITHOUT INTRALUMINAL DEVICE WITH MCC', diagnosis: 'T82.855A - Stenosis of coronary artery stent', procedure: '027032Z - Dilation of Coronary Artery One Artery Percutaneous', ntap: false, revenue: 17163, margin: 6059 },
      { facility: 'Facility B', date: 'Q3 2025', drg: '325 - CORONARY INTRAVASCULAR LITHOTRIPSY WITHOUT INTRALUMINAL DEVICE', diagnosis: 'I21.4 - Non-ST elevation (NSTEMI) myocardial infarction', procedure: '4A023N7 - Measurement of Cardiac Sampling', ntap: true, revenue: 22365, margin: 7361 }
    ],
    summary: {
      totalCases: 18,
      outpatientCases: 11,
      inpatientCases: 7,
      ntapCases: 4,
      avgRevenueOutpatient: 17010,
      avgRevenueInpatient: 30856,
      avgMarginOutpatient: 4821,
      avgMarginInpatient: 13141,
      totalRevenue: 402884,
      totalMargin: 139623,
      facilities: ['Facility A', 'Facility B']
    }
  };

  // IPG Workflow Stages (Funnel → Sustainability)
  const ipgWorkflow = {
    stages: {
      'funnel': {
        id: 'funnel',
        name: 'Funnel',
        description: 'New technology proposals and vendor submissions',
        status: 'completed',
        color: 'gray',
        icon: '📥',
        completionDate: 'Q4 2024'
      },
      'reviewing': {
        id: 'reviewing',
        name: 'Reviewing',
        description: 'Agentic AI review of proposal completeness and alignment',
        status: 'completed',
        color: 'blue',
        icon: '🤖',
        completionDate: 'Q1 2025'
      },
      'analyzing': {
        id: 'analyzing',
        name: 'Analyzing',
        description: 'Tri-pillar IPG evaluation (Clinical, Financial, Operational)',
        status: 'completed',
        color: 'purple',
        icon: '🎯',
        completionDate: 'Q1 2025'
      },
      'implementing': {
        id: 'implementing',
        name: 'Implementing',
        description: 'SSRM, Revenue Cycle prep, and clinician training',
        status: 'completed',
        color: 'orange',
        icon: '⚙️',
        startDate: 'Q2 2025',
        completionDate: 'Q3 2025'
      },
      'active': {
        id: 'active',
        name: 'Active',
        description: 'Pilot → Scale → Sustain phases',
        status: 'active',
        color: 'green',
        icon: '✓',
        subPhase: 'scale', // pilot, scale, or sustain
        startDate: 'Q3 2025'
      },
      'sustainability': {
        id: 'sustainability',
        name: 'Sustainability',
        description: 'Ongoing monitoring and performance management',
        status: 'upcoming',
        color: 'teal',
        icon: '📊'
      }
    }
  };

  // Product data
  const products = {
    agent: {
      name: 'AGENT Drug-Coated Balloon',
      vendor: 'Boston Scientific',
      description: 'Paclitaxel-coated balloon for in-stent restenosis treatment',
      status: 'approved',
      statusText: 'System-Wide Approved',
      icon: '🎈',
      statusColor: 'bg-green-100 text-green-800 border-green-200',
      hasRealWorldData: true,
      clinical: {
        efficacy: {
          label: 'Target Lesion Revascularization Rate',
          min: 5,
          max: 25,
          default: 15,
          unit: '%',
          description: 'Lower is better'
        },
        adoption: {
          label: 'Physician Adoption Rate',
          min: 1,
          max: 15,
          default: 10,
          unit: '%',
          description: 'Expected usage in eligible cases'
        },
        volume: {
          label: 'Eligible Cases per Year',
          min: 50,
          max: 200,
          default: 120,
          unit: ' cases',
          description: 'ISR cases annually'
        }
      },
      financial: {
        ipMargin: {
          label: 'Inpatient Margin per Case',
          min: 0,
          max: 50000,
          default: 30000,
          unit: '$',
          description: 'IP differential vs standard PTA'
        },
        opMargin: {
          label: 'Outpatient Margin per Case',
          min: 0,
          max: 30000,
          default: 17000,
          unit: '$',
          description: 'OP differential vs standard PTA'
        },
        ipRatio: {
          label: 'Inpatient/Outpatient Case Mix',
          min: 0,
          max: 100,
          default: 20,
          unit: '% IP',
          description: 'Percentage of cases done inpatient'
        }
      },
      operational: {
        facilities: {
          label: 'Participating Facilities',
          min: 1,
          max: 50,
          default: 25,
          unit: ' facilities',
          description: 'Facilities adopting AGENT'
        },
        training: {
          label: 'Training Completion Rate',
          min: 50,
          max: 100,
          default: 95,
          unit: '%',
          description: 'Staff trained and certified'
        },
        stockout: {
          label: 'Product Availability',
          min: 90,
          max: 100,
          default: 98,
          unit: '%',
          description: 'No stock-outs'
        }
      }
    },
    rdn: {
      name: 'Renal Denervation Technology',
      vendor: 'Medtronic',
      description: 'Catheter-based treatment for resistant hypertension',
      status: 'analysis',
      statusText: 'Hub Model Analysis',
      icon: '🫀',
      statusColor: 'bg-orange-100 text-orange-800 border-orange-200',
      clinical: {
        efficacy: {
          label: 'BP Reduction (mmHg)',
          min: 5,
          max: 20,
          default: 12,
          unit: ' mmHg',
          description: 'Systolic blood pressure reduction'
        },
        adoption: {
          label: 'Eligible Patient Conversion',
          min: 5,
          max: 30,
          default: 15,
          unit: '%',
          description: 'Resistant HTN patients treated'
        },
        volume: {
          label: 'Annual Procedures (per hub)',
          min: 50,
          max: 300,
          default: 150,
          unit: ' procedures',
          description: 'Procedures per hub facility'
        }
      },
      financial: {
        reimbursement: {
          label: 'Medicare Reimbursement',
          min: 5000,
          max: 15000,
          default: 9500,
          unit: '$',
          description: 'Expected CMS payment'
        },
        costs: {
          label: 'Total Cost per Procedure',
          min: 3000,
          max: 10000,
          default: 6500,
          unit: '$',
          description: 'Device + procedure costs'
        },
        hubCount: {
          label: 'Number of Hub Facilities',
          min: 1,
          max: 10,
          default: 3,
          unit: ' hubs',
          description: 'High-volume centers'
        }
      },
      operational: {
        infrastructure: {
          label: 'Infrastructure Score',
          min: 1,
          max: 10,
          default: 7,
          unit: '/10',
          description: 'Facility capability rating'
        },
        referral: {
          label: 'Referral Network Size',
          min: 5,
          max: 30,
          default: 15,
          unit: ' facilities',
          description: 'Referring hospitals'
        },
        specialists: {
          label: 'Trained Specialists',
          min: 1,
          max: 10,
          default: 4,
          unit: ' physicians',
          description: 'Per hub facility'
        }
      }
    },
    detour: {
      name: 'DETOUR Percutaneous Bypass',
      vendor: 'PQ Bypass',
      description: 'Novel endovascular bypass for chronic limb-threatening ischemia',
      status: 'pilot',
      statusText: '5-Hospital Pilot',
      icon: '🔄',
      statusColor: 'bg-blue-100 text-blue-800 border-blue-200',
      clinical: {
        patency: {
          label: '12-Month Patency Rate',
          min: 50,
          max: 90,
          default: 75,
          unit: '%',
          description: 'Vessel remains open at 1 year'
        },
        amputation: {
          label: 'Amputation-Free Survival',
          min: 60,
          max: 95,
          default: 85,
          unit: '%',
          description: 'Limb salvage rate'
        },
        volume: {
          label: 'CLTI Cases per Facility',
          min: 20,
          max: 100,
          default: 45,
          unit: ' cases/year',
          description: 'Eligible CLTI patients'
        }
      },
      financial: {
        differential: {
          label: 'Margin vs Bypass Surgery',
          min: -10000,
          max: 40000,
          default: 15000,
          unit: '$',
          description: 'Differential margin'
        },
        adoption: {
          label: 'Market Penetration',
          min: 5,
          max: 40,
          default: 20,
          unit: '%',
          description: 'Of eligible CLTI cases'
        },
        pilotFacilities: {
          label: 'Pilot Site Count',
          min: 3,
          max: 10,
          default: 5,
          unit: ' sites',
          description: 'High-CCR facilities'
        }
      },
      operational: {
        ccr: {
          label: 'Minimum CCR Threshold',
          min: 0.3,
          max: 0.8,
          default: 0.5,
          unit: ' CCR',
          description: 'Cost-to-charge ratio cutoff'
        },
        surgeons: {
          label: 'Vascular Surgeons per Site',
          min: 1,
          max: 5,
          default: 2,
          unit: ' surgeons',
          description: 'Trained specialists'
        },
        readiness: {
          label: 'Facility Readiness Score',
          min: 1,
          max: 10,
          default: 7,
          unit: '/10',
          description: 'Infrastructure capability'
        }
      }
    },
    evoque: {
      name: 'Evoque Tricuspid Valve',
      vendor: 'Edwards Lifesciences',
      description: 'Transcatheter tricuspid valve replacement system',
      status: 'analysis',
      statusText: 'Financial Assessment',
      icon: '❤️',
      statusColor: 'bg-orange-100 text-orange-800 border-orange-200',
      clinical: {
        mortality: {
          label: '30-Day Mortality Rate',
          min: 1,
          max: 10,
          default: 4,
          unit: '%',
          description: 'Procedural mortality'
        },
        improvement: {
          label: 'TR Grade Improvement',
          min: 1,
          max: 4,
          default: 2.5,
          unit: ' grades',
          description: 'Reduction in regurgitation'
        },
        volume: {
          label: 'Eligible Patients System-Wide',
          min: 50,
          max: 300,
          default: 120,
          unit: ' patients/year',
          description: 'Severe TR candidates'
        }
      },
      financial: {
        device: {
          label: 'Device Cost',
          min: 25000,
          max: 60000,
          default: 45000,
          unit: '$',
          description: 'Edwards pricing'
        },
        reimbursement: {
          label: 'Expected Reimbursement',
          min: 30000,
          max: 80000,
          default: 55000,
          unit: '$',
          description: 'CMS + commercial mix'
        },
        breakeven: {
          label: 'Break-Even Volume',
          min: 10,
          max: 100,
          default: 40,
          unit: ' cases/year',
          description: 'System-wide minimum'
        }
      },
      operational: {
        hubModel: {
          label: 'Hub Facility Model',
          min: 1,
          max: 5,
          default: 2,
          unit: ' hubs',
          description: 'Centralized centers'
        },
        specialists: {
          label: 'Interventional Cardiologists',
          min: 2,
          max: 8,
          default: 4,
          unit: ' per hub',
          description: 'Trained operators'
        },
        infrastructure: {
          label: 'Hybrid OR Availability',
          min: 0,
          max: 5,
          default: 2,
          unit: ' ORs',
          description: 'Per hub facility'
        }
      }
    },
    robotics: {
      name: 'Surgical Robotics Platform',
      vendor: 'Intuitive Surgical',
      description: 'Multi-specialty robotic surgery expansion',
      status: 'analysis',
      statusText: 'Strategic Assessment',
      icon: '🤖',
      statusColor: 'bg-orange-100 text-orange-800 border-orange-200',
      clinical: {
        los: {
          label: 'Length of Stay Reduction',
          min: 0,
          max: 3,
          default: 1.2,
          unit: ' days',
          description: 'Compared to open surgery'
        },
        conversion: {
          label: 'Case Conversion Rate',
          min: 20,
          max: 80,
          default: 45,
          unit: '%',
          description: 'Open → Robotic conversion'
        },
        volume: {
          label: 'Robotic Cases per System',
          min: 500,
          max: 3000,
          default: 1500,
          unit: ' cases/year',
          description: 'Across all specialties'
        }
      },
      financial: {
        capital: {
          label: 'Capital Investment per Robot',
          min: 1500000,
          max: 3000000,
          default: 2200000,
          unit: '$',
          description: 'Purchase + setup'
        },
        margin: {
          label: 'Incremental Margin per Case',
          min: 500,
          max: 5000,
          default: 2000,
          unit: '$',
          description: 'Robotic vs open'
        },
        systems: {
          label: 'Number of Systems',
          min: 5,
          max: 30,
          default: 15,
          unit: ' robots',
          description: 'Across CommonSpirit'
        }
      },
      operational: {
        utilization: {
          label: 'Robot Utilization Rate',
          min: 40,
          max: 90,
          default: 65,
          unit: '%',
          description: 'Available OR time used'
        },
        specialties: {
          label: 'Service Lines Using Robotics',
          min: 1,
          max: 8,
          default: 4,
          unit: ' specialties',
          description: 'Ortho, Cardio, GYN, GI, etc'
        },
        training: {
          label: 'Surgeon Training Completion',
          min: 50,
          max: 100,
          default: 80,
          unit: '%',
          description: 'Credentialed surgeons'
        }
      }
    }
  };

  // Initialize assumptions when product is selected
  useEffect(() => {
    if (selectedProduct) {
      const product = products[selectedProduct];
      const newAssumptions = {
        clinical: {},
        financial: {},
        operational: {}
      };

      ['clinical', 'financial', 'operational'].forEach(pillar => {
        Object.keys(product[pillar]).forEach(key => {
          newAssumptions[pillar][key] = product[pillar][key].default;
        });
      });

      setAssumptions(newAssumptions);
    }
  }, [selectedProduct]);

  const formatValue = (value, unit) => {
    if (unit === '$') {
      return '$' + Math.round(value).toLocaleString();
    } else if (unit.includes('case') || unit.includes('facilit') || unit.includes('procedure') || 
               unit.includes('patient') || unit.includes('hub') || unit.includes('site') || 
               unit.includes('surgeon') || unit.includes('physician') || unit.includes('specialt') || 
               unit.includes('robot') || unit.includes('OR')) {
      return Math.round(value) + unit;
    } else if (unit.includes('mmHg') || unit.includes('day') || unit.includes('grade')) {
      return value.toFixed(1) + unit;
    } else if (unit === ' CCR' || unit === '/10') {
      return value.toFixed(1) + unit;
    } else if (unit === '% IP') {
      return Math.round(value) + unit;
    }
    return Math.round(value) + unit;
  };

  const updateAssumption = (pillar, key, value) => {
    setAssumptions(prev => ({
      ...prev,
      [pillar]: {
        ...prev[pillar],
        [key]: parseFloat(value)
      }
    }));
  };

  const calculateResults = () => {
    if (!selectedProduct || !assumptions.clinical) return null;

    const product = products[selectedProduct];
    let results = {};

    switch(selectedProduct) {
      case 'agent':
        results = calculateAgentResults();
        break;
      case 'rdn':
        results = calculateRDNResults();
        break;
      case 'detour':
        results = calculateDetourResults();
        break;
      case 'evoque':
        results = calculateEvoqueResults();
        break;
      case 'robotics':
        results = calculateRoboticsResults();
        break;
    }

    return results;
  };

  const calculateAgentResults = () => {
    const c = assumptions.clinical;
    const f = assumptions.financial;
    const o = assumptions.operational;

    const adoptedCases = c.volume * (c.adoption / 100);
    const ipCases = adoptedCases * (f.ipRatio / 100);
    const opCases = adoptedCases - ipCases;
    
    const totalMargin = (ipCases * f.ipMargin) + (opCases * f.opMargin);
    const systemWideMargin = totalMargin * o.facilities;
    const fiveYearValue = systemWideMargin * 5;

    return {
      metrics: [
        {
          label: 'TLR Risk Level',
          value: c.efficacy.toFixed(1) + '%',
          trend: c.efficacy < 15 ? '✓ Within threshold' : '⚠️ Monitor closely'
        },
        {
          label: 'Annual Cases',
          value: Math.round(adoptedCases * o.facilities),
          trend: '↑ ' + Math.round(c.adoption) + '% adoption'
        },
        {
          label: 'Annual System Margin',
          value: '$' + (systemWideMargin / 1000).toFixed(1) + 'M',
          trend: '↑ $' + (totalMargin / 1000).toFixed(0) + 'K per facility'
        },
        {
          label: '5-Year Value',
          value: '$' + (fiveYearValue / 1000000).toFixed(1) + 'M',
          trend: o.facilities + ' facilities participating'
        }
      ],
      chartData: generateChartData(systemWideMargin),
      clinicalApproval: c.efficacy <= 15 && c.adoption >= 3,
      financialApproval: systemWideMargin > 5000000,
      operationalApproval: o.training >= 90 && o.stockout >= 95
    };
  };

  const calculateRDNResults = () => {
    const c = assumptions.clinical;
    const f = assumptions.financial;
    const o = assumptions.operational;

    const proceduresPerHub = c.volume * (c.adoption / 100);
    const marginPerProcedure = f.reimbursement - f.costs;
    const totalAnnualMargin = proceduresPerHub * marginPerProcedure * f.hubCount;
    const fiveYearValue = totalAnnualMargin * 5;

    return {
      metrics: [
        {
          label: 'Annual Procedures',
          value: Math.round(proceduresPerHub * f.hubCount),
          trend: '↑ ' + f.hubCount + ' hub facilities'
        },
        {
          label: 'Margin per Procedure',
          value: '$' + marginPerProcedure.toLocaleString(),
          trend: marginPerProcedure > 2000 ? '✓ Viable' : '⚠️ Marginal'
        },
        {
          label: 'Annual System Value',
          value: '$' + (totalAnnualMargin / 1000).toFixed(1) + 'K',
          trend: 'Hub model approach'
        },
        {
          label: '5-Year Value',
          value: '$' + (fiveYearValue / 1000000).toFixed(2) + 'M',
          trend: 'Conservative projection'
        }
      ],
      chartData: generateChartData(totalAnnualMargin),
      clinicalApproval: c.efficacy >= 10,
      financialApproval: marginPerProcedure > 1000,
      operationalApproval: o.infrastructure >= 6 && o.referral >= 10
    };
  };

  const calculateDetourResults = () => {
    const c = assumptions.clinical;
    const f = assumptions.financial;
    const o = assumptions.operational;

    const casesPerFacility = c.volume * (f.adoption / 100);
    const totalCases = casesPerFacility * f.pilotFacilities;
    const totalMargin = totalCases * f.differential;
    const fiveYearValue = totalMargin * 5;

    return {
      metrics: [
        {
          label: 'Pilot Cases (Year 1)',
          value: Math.round(totalCases),
          trend: f.pilotFacilities + ' pilot sites'
        },
        {
          label: 'Annual Margin',
          value: '$' + (totalMargin / 1000).toFixed(1) + 'K',
          trend: f.differential > 0 ? '✓ Positive margin' : '⚠️ Loss'
        },
        {
          label: '5-Year Potential',
          value: '$' + (fiveYearValue / 1000000).toFixed(1) + 'M',
          trend: 'If pilot succeeds'
        },
        {
          label: 'Limb Salvage Rate',
          value: c.amputation.toFixed(0) + '%',
          trend: '✓ Clinical benefit'
        }
      ],
      chartData: generateChartData(totalMargin),
      clinicalApproval: c.patency >= 70 && c.amputation >= 80,
      financialApproval: f.differential > 10000 && o.ccr >= 0.45,
      operationalApproval: o.readiness >= 6 && o.surgeons >= 2
    };
  };

  const calculateEvoqueResults = () => {
    const c = assumptions.clinical;
    const f = assumptions.financial;
    const o = assumptions.operational;

    const marginPerCase = f.reimbursement - f.device;
    const annualCases = c.volume;
    const totalMargin = annualCases * marginPerCase;
    const fiveYearValue = totalMargin * 5;

    return {
      metrics: [
        {
          label: 'Eligible Patients',
          value: Math.round(c.volume),
          trend: 'Severe TR patients'
        },
        {
          label: 'Margin per Case',
          value: '$' + marginPerCase.toLocaleString(),
          trend: marginPerCase > 0 ? '✓ Positive' : '⚠️ Negative'
        },
        {
          label: 'Annual System Value',
          value: '$' + (totalMargin / 1000).toFixed(1) + 'K',
          trend: o.hubModel + ' hub facilities'
        },
        {
          label: '5-Year Value',
          value: '$' + (fiveYearValue / 1000000).toFixed(2) + 'M',
          trend: 'If volume sustained'
        }
      ],
      chartData: generateChartData(totalMargin),
      clinicalApproval: c.mortality <= 5 && c.improvement >= 2,
      financialApproval: marginPerCase > 0 && c.volume >= f.breakeven,
      operationalApproval: o.infrastructure >= 2 && o.specialists >= 3
    };
  };

  const calculateRoboticsResults = () => {
    const c = assumptions.clinical;
    const f = assumptions.financial;
    const o = assumptions.operational;

    const totalCapital = f.capital * f.systems;
    const annualMargin = c.volume * f.margin * f.systems;
    const roi = (annualMargin / totalCapital) * 100;
    const paybackYears = totalCapital / annualMargin;
    const fiveYearValue = (annualMargin * 5) - totalCapital;

    return {
      metrics: [
        {
          label: 'Annual Robotic Cases',
          value: Math.round(c.volume * f.systems).toLocaleString(),
          trend: f.systems + ' robot systems'
        },
        {
          label: 'Annual Margin',
          value: '$' + (annualMargin / 1000000).toFixed(1) + 'M',
          trend: '↑ $' + f.margin.toLocaleString() + ' per case'
        },
        {
          label: 'Capital Investment',
          value: '$' + (totalCapital / 1000000).toFixed(1) + 'M',
          trend: f.systems + ' systems'
        },
        {
          label: 'Payback Period',
          value: paybackYears.toFixed(1) + ' years',
          trend: roi.toFixed(1) + '% annual ROI'
        }
      ],
      chartData: generateRoboticsChartData(totalCapital, annualMargin),
      clinicalApproval: c.los >= 0.5 && c.conversion >= 30,
      financialApproval: roi >= 15 && paybackYears <= 5,
      operationalApproval: o.utilization >= 60 && o.training >= 75
    };
  };

  const generateChartData = (annualMargin) => {
    return {
      labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      datasets: [{
        label: 'Cumulative Value ($)',
        data: [
          annualMargin,
          annualMargin * 2.1,
          annualMargin * 3.3,
          annualMargin * 4.6,
          annualMargin * 6.0
        ],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    };
  };

  const generateRoboticsChartData = (capital, annualMargin) => {
    return {
      labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      datasets: [{
        label: 'Net Cumulative Value ($)',
        data: [
          annualMargin - capital,
          annualMargin * 2 - capital,
          annualMargin * 3 - capital,
          annualMargin * 4 - capital,
          annualMargin * 5 - capital
        ],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    };
  };

  const results = calculateResults();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: '5-Year Financial Projection',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            if (value >= 1000000) {
              return '$' + (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return '$' + (value / 1000).toFixed(0) + 'K';
            }
            return '$' + value;
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Portfolio</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">IPG Demo</div>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="text-sm font-semibold text-gray-900">Cardiovascular</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-3xl shadow-lg">
              🏥
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                IPG Product Evaluation Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Interactive Product Governance - Cardiovascular Technology Portfolio
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
            <span className="font-semibold">CommonSpirit Health</span>
            <span>•</span>
            <span>Three-Pillar Governance Framework</span>
          </div>
        </div>

        {/* Product Selector */}
        {!selectedProduct && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(products).map(([key, product]) => (
              <button
                key={key}
                onClick={() => setSelectedProduct(key)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-left border-2 border-transparent hover:border-purple-400 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{product.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">
                    {product.vendor}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full border ${product.statusColor}`}>
                    {product.statusText}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Product Dashboard */}
        {selectedProduct && results && (
          <div className="space-y-6">
            {/* Product Header */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{products[selectedProduct].icon}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {products[selectedProduct].name}
                    </h2>
                    <p className="text-gray-600">{products[selectedProduct].description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  Change Product
                </button>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600">
                  <strong>Vendor:</strong> {products[selectedProduct].vendor}
                </span>
                <span className={`px-3 py-1 rounded-full border text-xs ${products[selectedProduct].statusColor}`}>
                  {products[selectedProduct].statusText}
                </span>
              </div>
            </div>

            {/* IPG Workflow - AGENT Only */}
            {selectedProduct === 'agent' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    New Product Evaluation Workflow: AGENT Drug-Coated Balloon
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Track product evaluation journey from initial proposal through sustainability
                  </p>
                </div>

                {/* Horizontal Workflow */}
                <div className="flex items-start justify-center gap-2 py-6">
                  {Object.values(ipgWorkflow.stages).map((stage, index) => {
                    const isActive = stage.status === 'active';
                    const isCompleted = stage.status === 'completed';
                    const isLast = index === Object.keys(ipgWorkflow.stages).length - 1;

                    // Active sub-phase colors
                    let activeColor = 'bg-green-500 border-green-600';
                    if (isActive && stage.subPhase === 'pilot') {
                      activeColor = 'bg-yellow-500 border-yellow-600';
                    } else if (isActive && stage.subPhase === 'scale') {
                      activeColor = 'bg-blue-500 border-blue-600';
                    } else if (isActive && stage.subPhase === 'sustain') {
                      activeColor = 'bg-green-500 border-green-600';
                    }

                    return (
                      <React.Fragment key={stage.id}>
                        {/* Stage */}
                        <div className="flex flex-col items-center gap-3" style={{ width: '140px' }}>
                          {/* Icon Circle */}
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all shadow-md text-2xl ${
                            isCompleted
                              ? 'bg-green-500 border-green-600 shadow-green-200'
                              : isActive
                              ? `${activeColor} ring-4 ring-opacity-30 ${stage.subPhase === 'pilot' ? 'ring-yellow-300' : stage.subPhase === 'scale' ? 'ring-blue-300' : 'ring-green-300'} animate-pulse shadow-lg`
                              : 'bg-gray-200 border-gray-300 shadow-gray-100'
                          }`}>
                            {stage.icon}
                          </div>

                          {/* Label Card */}
                          <div className={`w-full p-3 rounded-lg shadow-sm border-2 ${
                            isActive ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
                          }`}>
                            <div className={`font-bold text-xs text-center mb-1 ${
                              isCompleted ? 'text-green-900' : isActive ? 'text-blue-900' : 'text-gray-700'
                            }`}>
                              {stage.name}
                            </div>
                            <div className="text-xs text-gray-600 text-center mb-2 leading-tight">
                              {stage.description}
                            </div>
                            <div className="flex justify-center">
                              <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                isCompleted
                                  ? 'bg-green-100 text-green-800'
                                  : isActive
                                  ? stage.subPhase === 'pilot'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : stage.subPhase === 'scale'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {isCompleted
                                  ? `✓ ${stage.completionDate}`
                                  : isActive
                                  ? stage.subPhase === 'pilot'
                                    ? '🔬 Pilot'
                                    : stage.subPhase === 'scale'
                                    ? '📈 Scale'
                                    : '🎯 Sustain'
                                  : '⏳ Pending'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Arrow connector */}
                        {!isLast && (
                          <div className="flex items-start pt-6">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Active Phase Details */}
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-5 border-2 border-blue-400">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">📈</div>
                    <div>
                      <div className="font-bold text-blue-900 text-lg">Currently in Scale Phase (Active)</div>
                      <div className="text-sm text-blue-800">
                        Pilot complete - now expanding from 2 pilot facilities to 15-20 high-volume cardiac centers across the system
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="bg-white rounded-lg p-3 border-2 border-green-300">
                      <div className="text-xs text-green-700 font-semibold mb-1">🔬 Pilot Phase</div>
                      <div className="text-xs text-gray-700">Initial validation at 2 facilities (Q2-Q3 2025)</div>
                      <div className="text-xs font-bold text-green-700 mt-1">✓ Complete</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border-2 border-blue-400 ring-2 ring-blue-200">
                      <div className="text-xs text-blue-700 font-semibold mb-1">📈 Scale Phase</div>
                      <div className="text-xs text-gray-700">Expanding to 15-20 high-volume centers (Q3-Q4 2025)</div>
                      <div className="text-xs font-bold text-blue-700 mt-1">⚡ Active Now</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border-2 border-gray-200">
                      <div className="text-xs text-gray-600 font-semibold mb-1">🎯 Sustain Phase</div>
                      <div className="text-xs text-gray-600">System-wide adoption and optimization (2026+)</div>
                      <div className="text-xs font-bold text-gray-500 mt-1">⏳ Upcoming</div>
                    </div>
                  </div>
                </div>

                {/* Workflow Notes */}
                <div className="mt-4 bg-purple-50 border-l-4 border-purple-600 p-4 rounded">
                  <div className="text-sm text-purple-900">
                    <strong>IPG Workflow Design:</strong> This stage-gated process ensures rigorous evaluation, controlled implementation,
                    and continuous monitoring of new medical technologies. Each stage has defined exit criteria and governance checkpoints
                    before advancing to the next phase.
                  </div>
                </div>
              </div>
            )}

            {/* Results Section */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                Projected Outcomes
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {results.metrics.map((metric, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow-sm p-5">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                      {metric.label}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {metric.value}
                    </div>
                    <div className={`text-sm font-medium ${
                      metric.trend.includes('⚠️') || metric.trend.includes('↓') ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {metric.trend}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="bg-white rounded-lg shadow-sm p-6" style={{ height: '400px' }}>
                {results.chartData && (
                  <Line data={results.chartData} options={chartOptions} />
                )}
              </div>
            </div>

            {/* Real-World Case Data - AGENT Only */}
            {selectedProduct === 'agent' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      📊 Real-World Evidence: AGENT Adoption & Performance
                    </h3>
                    <p className="text-gray-600">Actual case data from pilot facilities (Jan-Sep 2025)</p>
                  </div>
                  <div className="bg-green-100 border-2 border-green-300 rounded-lg px-4 py-2">
                    <div className="text-xs text-green-700 font-semibold uppercase">Pilot Phase Complete</div>
                    <div className="text-2xl font-bold text-green-900">{agentCaseData.summary.totalCases} Cases</div>
                  </div>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                    <div className="text-xs text-blue-700 font-semibold mb-1">Outpatient Cases</div>
                    <div className="text-2xl font-bold text-blue-900">{agentCaseData.summary.outpatientCases}</div>
                    <div className="text-xs text-blue-600 mt-1">Avg Margin: ${agentCaseData.summary.avgMarginOutpatient.toLocaleString()}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                    <div className="text-xs text-purple-700 font-semibold mb-1">Inpatient Cases</div>
                    <div className="text-2xl font-bold text-purple-900">{agentCaseData.summary.inpatientCases}</div>
                    <div className="text-xs text-purple-600 mt-1">Avg Margin: ${agentCaseData.summary.avgMarginInpatient.toLocaleString()}</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-200">
                    <div className="text-xs text-amber-700 font-semibold mb-1">NTAP Cases</div>
                    <div className="text-2xl font-bold text-amber-900">{agentCaseData.summary.ntapCases}</div>
                    <div className="text-xs text-amber-600 mt-1">New Tech Add-On Payment</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                    <div className="text-xs text-green-700 font-semibold mb-1">Total Margin</div>
                    <div className="text-2xl font-bold text-green-900">${(agentCaseData.summary.totalMargin / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-green-600 mt-1">9-Month Pilot Period</div>
                  </div>
                </div>

                {/* Case Tables */}
                <div className="space-y-6">
                  {/* Inpatient Cases */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      🏥 Inpatient Cases (Higher Complexity & NTAP Eligible)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-purple-100 border-b-2 border-purple-300">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-purple-900">Facility</th>
                            <th className="px-3 py-2 text-left font-semibold text-purple-900">Date</th>
                            <th className="px-3 py-2 text-left font-semibold text-purple-900">DRG</th>
                            <th className="px-3 py-2 text-left font-semibold text-purple-900">Diagnosis</th>
                            <th className="px-3 py-2 text-left font-semibold text-purple-900">Procedure</th>
                            <th className="px-3 py-2 text-center font-semibold text-purple-900">NTAP</th>
                            <th className="px-3 py-2 text-right font-semibold text-purple-900">Revenue</th>
                            <th className="px-3 py-2 text-right font-semibold text-purple-900">Margin</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {agentCaseData.inpatient.map((c, idx) => (
                            <tr key={idx} className={`border-b border-gray-200 ${c.ntap ? 'bg-green-50' : ''}`}>
                              <td className="px-3 py-2 text-gray-700 text-xs">{c.facility}</td>
                              <td className="px-3 py-2 text-gray-600 text-xs">{c.date}</td>
                              <td className="px-3 py-2 text-gray-600 text-xs">{c.drg.split(' - ')[0]}</td>
                              <td className="px-3 py-2 text-gray-700 text-xs">{c.diagnosis}</td>
                              <td className="px-3 py-2 text-gray-600 text-xs">{c.procedure}</td>
                              <td className="px-3 py-2 text-center">
                                {c.ntap ? <span className="bg-green-200 text-green-900 px-2 py-1 rounded text-xs font-bold">NTAP</span> : <span className="text-gray-400 text-xs">—</span>}
                              </td>
                              <td className="px-3 py-2 text-right font-semibold text-gray-900 text-xs">${c.revenue.toLocaleString()}</td>
                              <td className={`px-3 py-2 text-right font-bold text-xs ${c.margin >= 0 ? 'text-green-700' : 'text-red-700'}`}>${c.margin.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Outpatient Cases */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      🏢 Outpatient Cases (Routine & Standard Complexity)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-blue-100 border-b-2 border-blue-300">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-blue-900">Facility</th>
                            <th className="px-3 py-2 text-left font-semibold text-blue-900">Date</th>
                            <th className="px-3 py-2 text-left font-semibold text-blue-900">Diagnosis</th>
                            <th className="px-3 py-2 text-left font-semibold text-blue-900">CPT</th>
                            <th className="px-3 py-2 text-left font-semibold text-blue-900">Payer</th>
                            <th className="px-3 py-2 text-right font-semibold text-blue-900">Revenue</th>
                            <th className="px-3 py-2 text-right font-semibold text-blue-900">Margin</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {agentCaseData.outpatient.map((c, idx) => (
                            <tr key={idx} className="border-b border-gray-200">
                              <td className="px-3 py-2 text-gray-700 text-xs">{c.facility}</td>
                              <td className="px-3 py-2 text-gray-600 text-xs">{c.date}</td>
                              <td className="px-3 py-2 text-gray-700 text-xs">{c.diagnosis}</td>
                              <td className="px-3 py-2 text-gray-600 text-xs">{c.cpt.split(' - ')[0]}</td>
                              <td className="px-3 py-2 text-gray-600 text-xs">{c.payer}</td>
                              <td className="px-3 py-2 text-right font-semibold text-gray-900 text-xs">${c.revenue.toLocaleString()}</td>
                              <td className={`px-3 py-2 text-right font-bold text-xs ${c.contributionMargin >= 0 ? 'text-green-700' : 'text-red-700'}`}>${c.contributionMargin.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Key Insights */}
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-5 border-2 border-blue-300">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">💡 Key Insights for System-Wide Scaling</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-semibold text-gray-900 mb-2">✓ Strong Performance Indicators:</div>
                      <ul className="space-y-1 text-gray-700 ml-4">
                        <li>• <strong>NTAP cases</strong> show significantly higher margins (avg ${(agentCaseData.inpatient.filter(c => c.ntap).reduce((sum, c) => sum + c.margin, 0) / agentCaseData.summary.ntapCases).toLocaleString()})</li>
                        <li>• <strong>Inpatient utilization</strong> demonstrates clinical adoption by cardiologists</li>
                        <li>• <strong>Multi-facility success</strong> validates reproducibility across different sites</li>
                        <li>• <strong>Diverse payer mix</strong> indicates broad reimbursement acceptance</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-2">⚠️ Considerations for Expansion:</div>
                      <ul className="space-y-1 text-gray-700 ml-4">
                        <li>• Some outpatient cases show negative margins - review payer contracts</li>
                        <li>• Focus expansion on facilities with high NTAP eligibility</li>
                        <li>• Standardize coding practices to maximize NTAP capture</li>
                        <li>• Target 70/30 inpatient/outpatient mix for optimal margins</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 bg-white rounded-lg p-4 border-2 border-green-300">
                    <div className="font-bold text-green-900 text-center mb-1">📈 Recommended Action</div>
                    <div className="text-gray-800 text-center text-sm">
                      Based on pilot performance, expand AGENT to <strong>15-20 additional high-volume cardiac centers</strong> with established interventional cardiology programs and strong NTAP coding capabilities. Projected system-wide margin impact: <strong>$2.1M - $2.8M annually</strong>.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Three-Pillar Recommendation */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                🎯 Three-Pillar Governance Recommendation
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { name: 'Clinical', approved: results.clinicalApproval },
                  { name: 'Operational', approved: results.operationalApproval },
                  { name: 'Financial', approved: results.financialApproval }
                ].map((pillar, idx) => (
                  <div
                    key={idx}
                    className={`text-center p-6 rounded-lg border-2 ${
                      pillar.approved
                        ? 'bg-green-50 border-green-400'
                        : 'bg-red-50 border-red-400'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 mb-2">
                      {pillar.name} Pillar
                    </div>
                    <div className={`text-2xl font-bold ${
                      pillar.approved ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {pillar.approved ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-6 h-6" />
                          ADVANCE
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <AlertCircle className="w-6 h-6" />
                          DEFER
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className={`p-6 rounded-lg text-center ${
                results.clinicalApproval && results.financialApproval && results.operationalApproval
                  ? 'bg-green-100 border-2 border-green-400'
                  : 'bg-yellow-100 border-2 border-yellow-400'
              }`}>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  {results.clinicalApproval && results.financialApproval && results.operationalApproval
                    ? '✅ UNANIMOUS CONSENSUS'
                    : '⚠️ CONDITIONAL APPROVAL'}
                </h4>
                <p className="text-gray-700">
                  {results.clinicalApproval && results.financialApproval && results.operationalApproval
                    ? 'All three pillars recommend ADVANCE. Ready for system-wide implementation.'
                    : 'One or more pillars recommend DEFER. Additional analysis or conditional implementation required.'}
                </p>
              </div>

              <button
                onClick={() => {
                  const product = products[selectedProduct];
                  const newAssumptions = {
                    clinical: {},
                    financial: {},
                    operational: {}
                  };
                  ['clinical', 'financial', 'operational'].forEach(pillar => {
                    Object.keys(product[pillar]).forEach(key => {
                      newAssumptions[pillar][key] = product[pillar][key].default;
                    });
                  });
                  setAssumptions(newAssumptions);
                }}
                className="mt-6 w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
              >
                Reset to Default Assumptions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardiovascularIPGDemo;