import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, TrendingUp, TrendingDown, AlertCircle, DollarSign, Package, Users, Award, Info, ChevronDown, ChevronUp, Download, CheckCircle, AlertTriangle, Target, Mail, Heart, Star, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ComposedChart, ScatterChart, Scatter, ZAxis, AreaChart, Area, ReferenceLine, Label } from 'recharts';
import NavigationHeader from '../components/shared/NavigationHeader';
import ComponentComparisonView from '../components/ComponentComparisonView';

const SurgeonTool = () => {
  const [surgeonData, setSurgeonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSurgeon, setSelectedSurgeon] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('C');
  const [showComponentDetail, setShowComponentDetail] = useState(true);
  const [expandedComponents, setExpandedComponents] = useState([]); // Track which components are expanded
  const [showPracticeTrends, setShowPracticeTrends] = useState(true);
  const [showHistoryTable, setShowHistoryTable] = useState(false);
  const [showPeerComparison, setShowPeerComparison] = useState(true);
  const [selectedVendorFilter, setSelectedVendorFilter] = useState('All');
  const [compareList, setCompareList] = useState([]);
  const [showScenarioDetails, setShowScenarioDetails] = useState(false);
  const [projectionMode, setProjectionMode] = useState('realistic'); // optimistic, realistic, conservative
  const [savedScenario, setSavedScenario] = useState(null);
  const [showSystemContext, setShowSystemContext] = useState(true);
  const [selectedSimulatorScenario, setSelectedSimulatorScenario] = useState('C');
  const [simulatorSurgeons, setSimulatorSurgeons] = useState(50);
  const [showDashboard, setShowDashboard] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const [procedureView, setProcedureView] = useState('combined'); // 'combined' | 'hips' | 'knees'
  const [activeView, setActiveView] = useState('system'); // 'system' | 'individual'
  const [individualTab, setIndividualTab] = useState('overview'); // 'overview' | 'peers' | 'components' | 'scenarios'

  // Toggle function for individual component expansion
  const toggleComponent = (idx) => {
    setExpandedComponents(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  // Load surgeon data from new baseline
  useEffect(() => {
    const jsonPath = `${process.env.PUBLIC_URL}/orthopedic-data.json`;
    fetch(jsonPath)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load surgeon data');
        }
        return response.json();
      })
      .then(data => {
        const globalComponents = data.components || [];

        // Extract surgeons array and transform to add vendorBreakdown and calculated fields
        const surgeons = (data.surgeons || []).map(surgeon => {
          // Calculate avgSpendPerCase if not already present
          const avgSpendPerCase = surgeon.totalCases > 0
            ? surgeon.totalSpend / surgeon.totalCases
            : 0;

          // Transform vendors object to vendorBreakdown array if not already present
          if (!surgeon.vendorBreakdown && surgeon.vendors) {
            surgeon.vendorBreakdown = Object.entries(surgeon.vendors).map(([vendor, vendorData]) => ({
              vendor,
              spend: vendorData.spend || 0,
              cases: vendorData.cases || 0,
              percentage: surgeon.totalSpend > 0 ? ((vendorData.spend || 0) / surgeon.totalSpend * 100) : 0
            })).sort((a, b) => b.spend - a.spend);
          }

          // Generate topComponents from global components if missing
          if (!surgeon.topComponents && surgeon.vendors && globalComponents.length > 0) {
            const surgeonVendors = Object.keys(surgeon.vendors);

            // Aggregate components by category for this surgeon's vendors
            const componentsByCategory = {};

            globalComponents.forEach(comp => {
              if (surgeonVendors.includes(comp.vendor)) {
                const category = comp.name || 'Unknown';
                if (!componentsByCategory[category]) {
                  componentsByCategory[category] = {
                    category,
                    vendor: comp.vendor,
                    bodyPart: comp.bodyPart,
                    quantity: 0,
                    spend: 0
                  };
                }
                // Proportionally allocate based on surgeon's vendor usage
                const vendorData = surgeon.vendors[comp.vendor];
                const vendorProportion = vendorData.spend / surgeon.totalSpend;
                const allocatedQty = comp.quantity * vendorProportion * (surgeon.totalCases / 27623); // Scale by surgeon volume
                const allocatedSpend = comp.totalSpend * vendorProportion * (surgeon.totalSpend / 42080676);

                componentsByCategory[category].quantity += allocatedQty;
                componentsByCategory[category].spend += allocatedSpend;
              }
            });

            // Convert to array and sort by spend
            surgeon.topComponents = Object.values(componentsByCategory)
              .sort((a, b) => b.spend - a.spend)
              .slice(0, 20); // Top 20 components
          }

          return {
            ...surgeon,
            avgSpendPerCase
          };
        });
        setSurgeonData(surgeons);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Vendor consolidation scenarios
  const scenarios = {
    'A': { name: 'Status Quo', vendors: ['ZIMMER BIOMET', 'STRYKER', 'J&J', 'SMITH & NEPHEW', 'CONFORMIS'], savings: 0 },
    'B': { name: 'Tri-Source (Zimmer + Stryker + J&J)', vendors: ['ZIMMER BIOMET', 'STRYKER', 'J&J'], savings: 0.12 },
    'C': { name: 'Zimmer + J&J', vendors: ['ZIMMER BIOMET', 'J&J'], savings: 0.18 },
    'D': { name: 'Stryker + Zimmer', vendors: ['STRYKER', 'ZIMMER BIOMET'], savings: 0.16 },
    'E': { name: 'Stryker + J&J', vendors: ['STRYKER', 'J&J'], savings: 0.20 },
    'F': { name: 'Zimmer Only', vendors: ['ZIMMER BIOMET'], savings: 0.25 },
    'G': { name: 'Stryker Only', vendors: ['STRYKER'], savings: 0.22 }
  };

  // Utility function to separate hip vs. knee data
  const separateHipKneeData = (surgeon) => {
    // If no topComponents data, we cannot separate hip/knee, so return empty estimates
    if (!surgeon || !surgeon.topComponents || !Array.isArray(surgeon.topComponents) || surgeon.topComponents.length === 0) {
      // Since we don't have component-level data, we can't split hip vs knee
      // Return empty data for hip/knee splits
      return {
        hip: {
          cases: 0,
          spend: 0,
          avgSpendPerCase: 0,
          components: [],
          vendors: {},
          primaryVendor: 'N/A',
          vendorBreakdown: []
        },
        knee: {
          cases: 0,
          spend: 0,
          avgSpendPerCase: 0,
          components: [],
          vendors: {},
          primaryVendor: 'N/A',
          vendorBreakdown: []
        },
        other: {
          cases: 0,
          spend: 0,
          avgSpendPerCase: 0,
          components: []
        }
      };
    }

    // Keywords for classification
    const hipKeywords = [
      'HIP', 'ACETABULAR', 'FEMORAL HEAD', 'BI POLAR', 'UNI POLAR',
      'FEMORAL MODULAR HIP', 'RESURFACING FEMORAL'
    ];

    const kneeKeywords = [
      'KNEE', 'TIBIAL', 'PATELLAR', 'FEMORAL KNEE'
    ];

    const isHipComponent = (component) => {
      // First check if component has bodyPart field (from new data structure)
      if (component.bodyPart) {
        return component.bodyPart.toUpperCase() === 'HIP';
      }
      // Fallback to category keyword matching
      const category = component.category || '';
      return hipKeywords.some(keyword => category.toUpperCase().includes(keyword)) &&
        !category.toUpperCase().includes('KNEE');
    };

    const isKneeComponent = (component) => {
      // First check if component has bodyPart field (from new data structure)
      if (component.bodyPart) {
        return component.bodyPart.toUpperCase() === 'KNEE';
      }
      // Fallback to category keyword matching
      const category = component.category || '';
      return kneeKeywords.some(keyword => category.toUpperCase().includes(keyword));
    };

    // Separate components
    const hipComponents = surgeon.topComponents.filter(c => isHipComponent(c));
    const kneeComponents = surgeon.topComponents.filter(c => isKneeComponent(c));
    const otherComponents = surgeon.topComponents.filter(c =>
      !isHipComponent(c) && !isKneeComponent(c)
    );

    // Calculate hip metrics
    const hipSpend = hipComponents.reduce((sum, c) => sum + c.spend, 0);
    const hipQuantity = hipComponents.reduce((sum, c) => sum + c.quantity, 0);
    const hipVendors = {};
    hipComponents.forEach(c => {
      if (!hipVendors[c.vendor]) {
        hipVendors[c.vendor] = { spend: 0, quantity: 0 };
      }
      hipVendors[c.vendor].spend += c.spend;
      hipVendors[c.vendor].quantity += c.quantity;
    });

    // Calculate knee metrics
    const kneeSpend = kneeComponents.reduce((sum, c) => sum + c.spend, 0);
    const kneeQuantity = kneeComponents.reduce((sum, c) => sum + c.quantity, 0);
    const kneeVendors = {};
    kneeComponents.forEach(c => {
      if (!kneeVendors[c.vendor]) {
        kneeVendors[c.vendor] = { spend: 0, quantity: 0 };
      }
      kneeVendors[c.vendor].spend += c.spend;
      kneeVendors[c.vendor].quantity += c.quantity;
    });

    // Calculate other metrics
    const otherSpend = otherComponents.reduce((sum, c) => sum + c.spend, 0);
    const otherQuantity = otherComponents.reduce((sum, c) => sum + c.quantity, 0);

    // Get primary vendor for each procedure type
    const getTopVendor = (vendors) => {
      const sorted = Object.entries(vendors).sort((a, b) => b[1].spend - a[1].spend);
      return sorted.length > 0 ? sorted[0][0] : 'N/A';
    };

    // Estimate case distribution based on spend proportion
    const totalSpend = surgeon.totalSpend || 0;
    const totalCases = surgeon.totalCases || 0;
    const hipCaseEstimate = totalSpend > 0 && totalCases > 0 ? Math.round(totalCases * (hipSpend / totalSpend)) : 0;
    const kneeCaseEstimate = totalSpend > 0 && totalCases > 0 ? Math.round(totalCases * (kneeSpend / totalSpend)) : 0;

    return {
      hip: {
        cases: hipCaseEstimate,
        spend: hipSpend,
        avgSpendPerCase: hipCaseEstimate > 0 ? hipSpend / hipCaseEstimate : 0,
        components: hipComponents,
        vendors: hipVendors,
        primaryVendor: getTopVendor(hipVendors),
        vendorBreakdown: Object.entries(hipVendors).map(([vendor, data]) => ({
          vendor,
          spend: data.spend,
          cases: data.quantity,
          percentage: (data.spend / hipSpend) * 100
        })).sort((a, b) => b.spend - a.spend)
      },
      knee: {
        cases: kneeCaseEstimate,
        spend: kneeSpend,
        avgSpendPerCase: kneeCaseEstimate > 0 ? kneeSpend / kneeCaseEstimate : 0,
        components: kneeComponents,
        vendors: kneeVendors,
        primaryVendor: getTopVendor(kneeVendors),
        vendorBreakdown: Object.entries(kneeVendors).map(([vendor, data]) => ({
          vendor,
          spend: data.spend,
          cases: data.quantity,
          percentage: (data.spend / kneeSpend) * 100
        })).sort((a, b) => b.spend - a.spend)
      },
      other: {
        cases: otherQuantity,
        spend: otherSpend,
        avgSpendPerCase: otherQuantity > 0 ? otherSpend / otherQuantity : 0,
        components: otherComponents
      }
    };
  };

  // Get current view data based on procedure filter
  const getCurrentViewData = useMemo(() => {
    if (!selectedSurgeon) return null;

    if (procedureView === 'combined') {
      return selectedSurgeon;
    }

    const separated = separateHipKneeData(selectedSurgeon);
    const procedureData = procedureView === 'hips' ? separated.hip : separated.knee;

    return {
      ...selectedSurgeon,
      totalCases: procedureData.cases,
      totalSpend: procedureData.spend,
      avgSpendPerCase: procedureData.avgSpendPerCase,
      primaryVendor: procedureData.primaryVendor || selectedSurgeon.primaryVendor,
      topComponents: procedureData.components,
      vendorBreakdown: (procedureData.vendorBreakdown || []).length > 0
        ? procedureData.vendorBreakdown
        : (selectedSurgeon.vendorBreakdown || []),
      procedureType: procedureView // Add flag for reference
    };
  }, [selectedSurgeon, procedureView]);

  // Filter surgeons based on search
  const filteredSurgeons = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return surgeonData.filter(s => 
      s.name.toLowerCase().includes(term)
    ).slice(0, 10); // Limit to 10 results
  }, [searchTerm, surgeonData]);

  // Enhanced scenario impact calculation with 3-year projections
  const scenarioImpact = useMemo(() => {
    if (!selectedSurgeon) return null;

    const scenario = scenarios[selectedScenario];
    const approvedVendors = scenario.vendors;

    const mustSwitch = !approvedVendors.includes(selectedSurgeon.primaryVendor);
    const affectedSpend = (selectedSurgeon.vendorBreakdown || [])
      .filter(v => !approvedVendors.includes(v.vendor))
      .reduce((sum, v) => sum + v.spend, 0);

    // Projection parameters based on mode
    const params = {
      optimistic: { realizationYear1: 0.40, realizationYear2: 0.85, realizationFinal: 0.90, learningCurveWeeks: 10 },
      realistic: { realizationYear1: 0.30, realizationYear2: 0.70, realizationFinal: 0.70, learningCurveWeeks: 16 },
      conservative: { realizationYear1: 0.20, realizationYear2: 0.50, realizationFinal: 0.50, learningCurveWeeks: 24 }
    };

    const mode = params[projectionMode];
    const targetSavings = selectedSurgeon.totalSpend * scenario.savings;

    // Transition costs (Year 1 only, if switching vendors)
    const trainingCost = mustSwitch ? 5000 : 0;
    const affectedCases = Math.min(15, selectedSurgeon.totalCases);
    const orTimeValue = 2000; // $2000/hour
    const learningCurveInefficiency = mustSwitch ? (affectedCases * 2 * orTimeValue * 0.20) : 0;
    const vendorSupportCost = mustSwitch ? 3000 : 0;
    const totalTransitionCosts = trainingCost + learningCurveInefficiency + vendorSupportCost;

    // Year-by-year calculations
    const year1Savings = targetSavings * mode.realizationYear1;
    const year1Bonus = 0; // No bonus in transition year
    const year1Net = year1Savings - totalTransitionCosts;

    const year2Savings = targetSavings * mode.realizationYear2;
    const year2Bonus = 0; // No bonus program
    const year2Net = year2Savings;

    const year3Savings = targetSavings * mode.realizationFinal;
    const year3Bonus = 0; // No bonus program
    const year3Net = year3Savings;

    // NPV calculation (5% discount rate)
    const discountRate = 0.05;
    const npv = year1Net / Math.pow(1 + discountRate, 1) +
                year2Net / Math.pow(1 + discountRate, 2) +
                year3Net / Math.pow(1 + discountRate, 3);

    // Break-even calculation (monthly)
    const monthlySavings = targetSavings * mode.realizationFinal / 12;
    const breakEvenMonths = totalTransitionCosts > 0 ? Math.ceil(totalTransitionCosts / monthlySavings) : 0;

    // Total 3-year bonus
    const total3YearBonus = year1Bonus + year2Bonus + year3Bonus;

    // Risk assessment
    let riskPoints = 0;
    if (mustSwitch) riskPoints += 3;
    if ((affectedSpend / selectedSurgeon.totalSpend) > 0.5) riskPoints += 2;
    if (selectedSurgeon.vendorLoyalty && selectedSurgeon.vendorLoyalty.primaryVendorYears < 3) riskPoints += 1;
    if (selectedSurgeon.totalCases > 200) riskPoints += 1;
    const switchCount = (selectedSurgeon.vendorBreakdown || []).filter(v => !approvedVendors.includes(v.vendor)).length;
    if (switchCount > 1) riskPoints += 2;

    const riskLevel = riskPoints <= 2 ? 'Low' : riskPoints <= 4 ? 'Medium' : 'High';
    const riskColor = riskLevel === 'Low' ? 'green' : riskLevel === 'Medium' ? 'yellow' : 'red';
    const riskIcon = riskLevel === 'Low' ? '🟢' : riskLevel === 'Medium' ? '🟡' : '🔴';

    // Training requirements
    const trainingDays = mustSwitch ? 2.5 : 0;
    const proctoredCases = mustSwitch ? 6 : 0;
    const transitionWeeks = mustSwitch ? mode.learningCurveWeeks : 0;

    return {
      // Basic fields (maintain compatibility)
      mustSwitch,
      affectedSpend,
      savingsAmount: year3Savings,
      bonusPotential: year3Bonus,
      newVendor: mustSwitch ? approvedVendors[0] : selectedSurgeon.primaryVendor,
      affectedPercentage: (affectedSpend / selectedSurgeon.totalSpend) * 100,

      // Enhanced 3-year projection
      year1: { transitionCosts: totalTransitionCosts, savings: year1Savings, bonus: year1Bonus, net: year1Net },
      year2: { transitionCosts: 0, savings: year2Savings, bonus: year2Bonus, net: year2Net },
      year3: { transitionCosts: 0, savings: year3Savings, bonus: year3Bonus, net: year3Net },
      npv,
      breakEvenMonths,
      total3YearBonus,

      // Operational impact
      trainingDays,
      proctoredCases,
      transitionWeeks,
      affectedCases,
      orTimeImpact: learningCurveInefficiency / orTimeValue,

      // Risk assessment
      riskLevel,
      riskColor,
      riskIcon,
      riskPoints
    };
  }, [selectedSurgeon, selectedScenario, projectionMode]);

  const handleSurgeonSelect = (surgeon) => {
    setSelectedSurgeon(surgeon);
    setSearchTerm(surgeon.name);
    setShowDropdown(false);
  };

  const clearSelection = () => {
    setSelectedSurgeon(null);
    setSearchTerm('');
    setShowDropdown(false);
  };

  // Helper Functions for Practice Trends
  const calculateTrendAnalysis = (historicalData) => {
    if (!historicalData || historicalData.length === 0) {
      return null;
    }

    // Ensure avgCost is calculated if missing
    const data = historicalData.map(q => ({
      ...q,
      avgCost: q.avgCost || (q.cases > 0 ? q.spend / q.cases : 0)
    }));

    // Calculate year-over-year changes (comparing last quarter to 4 quarters ago)
    const latestQuarter = data[data.length - 1];
    const yearAgoQuarter = data.length >= 5 ? data[data.length - 5] : data[0];

    const caseChange = yearAgoQuarter.cases > 0
      ? ((latestQuarter.cases - yearAgoQuarter.cases) / yearAgoQuarter.cases) * 100
      : 0;

    const spendChange = yearAgoQuarter.spend > 0
      ? ((latestQuarter.spend - yearAgoQuarter.spend) / yearAgoQuarter.spend) * 100
      : 0;

    const costChange = yearAgoQuarter.avgCost > 0
      ? ((latestQuarter.avgCost - yearAgoQuarter.avgCost) / yearAgoQuarter.avgCost) * 100
      : 0;

    // Calculate linear regression for cost trend
    const n = data.length;
    const sumX = data.reduce((sum, _, idx) => sum + idx, 0);
    const sumY = data.reduce((sum, q) => sum + q.avgCost, 0);
    const sumXY = data.reduce((sum, q, idx) => sum + (idx * q.avgCost), 0);
    const sumX2 = data.reduce((sum, _, idx) => sum + (idx * idx), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgCost = sumY / n;
    const costTrendPercentage = avgCost > 0 ? (slope / avgCost) * 100 : 0;

    // Identify significant cost changes (>10% quarter-over-quarter)
    const costAlerts = data.map((q, idx) => {
      if (idx === 0) return null;
      const prevCost = data[idx - 1].avgCost;
      const change = prevCost > 0 ? ((q.avgCost - prevCost) / prevCost) * 100 : 0;
      return {
        quarter: q.quarter,
        change,
        isIncrease: change > 10,
        isDecrease: change < -10
      };
    }).filter(a => a && (a.isIncrease || a.isDecrease));

    // Calculate efficiency score (cases per $100k)
    const totalCases = data.reduce((sum, q) => sum + q.cases, 0);
    const totalSpend = data.reduce((sum, q) => sum + q.spend, 0);
    const efficiencyScore = totalSpend > 0 ? (totalCases / (totalSpend / 100000)) : 0;

    return {
      caseChange,
      spendChange,
      costChange,
      costTrendPercentage,
      costAlerts,
      efficiencyScore,
      data
    };
  };

  const generateInsights = (trendAnalysis, surgeon) => {
    if (!trendAnalysis) return [];

    const insights = [];

    // Volume Insight
    if (trendAnalysis.caseChange > 10) {
      insights.push({
        icon: '📈',
        title: 'Growing Practice',
        description: `Your volume increased ${trendAnalysis.caseChange.toFixed(0)}% year-over-year`,
        type: 'positive'
      });
    } else if (trendAnalysis.caseChange < -10) {
      insights.push({
        icon: '📉',
        title: 'Volume Declining',
        description: `Cases decreased ${Math.abs(trendAnalysis.caseChange).toFixed(0)}% from last year`,
        type: 'warning'
      });
    } else {
      const avgCases = trendAnalysis.data.reduce((sum, q) => sum + q.cases, 0) / trendAnalysis.data.length;
      insights.push({
        icon: '📊',
        title: 'Stable Practice',
        description: `Consistent volume around ${Math.round(avgCases)} cases per quarter`,
        type: 'neutral'
      });
    }

    // Cost Insight
    if (trendAnalysis.costChange < -5) {
      insights.push({
        icon: '💰',
        title: 'Cost Efficiency Improving',
        description: `Down $${Math.abs(trendAnalysis.data[trendAnalysis.data.length - 1].avgCost - trendAnalysis.data[0].avgCost).toFixed(0)}/case since ${trendAnalysis.data[0].quarter}`,
        type: 'positive'
      });
    } else if (trendAnalysis.costChange > 5) {
      insights.push({
        icon: '⚠️',
        title: 'Cost Pressure',
        description: `Average cost up $${(trendAnalysis.data[trendAnalysis.data.length - 1].avgCost - trendAnalysis.data[0].avgCost).toFixed(0)}/case, review with supply chain`,
        type: 'warning'
      });
    } else {
      insights.push({
        icon: '➡️',
        title: 'Cost Stability',
        description: 'Maintaining consistent per-case costs',
        type: 'neutral'
      });
    }

    // Efficiency Insight (assuming peer average is 38 cases per $100k)
    const peerAverage = 38;
    const comparison = trendAnalysis.efficiencyScore > peerAverage ? 'Above' : 'Below';
    insights.push({
      icon: '🎯',
      title: 'Efficiency Score',
      description: `${trendAnalysis.efficiencyScore.toFixed(0)} cases per $100k (${comparison} peer average of ${peerAverage})`,
      type: trendAnalysis.efficiencyScore > peerAverage ? 'positive' : 'neutral'
    });

    return insights;
  };

  const downloadHistoricalData = (surgeon) => {
    if (!surgeon.historicalData || surgeon.historicalData.length === 0) return;

    const csvContent = [
      ['Quarter', 'Cases', 'Total Spend', 'Avg Cost Per Case'].join(','),
      ...surgeon.historicalData.map(q =>
        [q.quarter, q.cases, q.spend.toFixed(2), (q.avgCost || (q.cases > 0 ? q.spend / q.cases : 0)).toFixed(2)].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${surgeon.name.replace(/[^a-z0-9]/gi, '_')}_historical_data.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Helper Functions for Peer Comparison
  const calculatePercentiles = (surgeon, allSurgeons) => {
    const sortedByCases = [...allSurgeons].sort((a, b) => (a.totalCases || 0) - (b.totalCases || 0));
    const sortedByCost = [...allSurgeons].sort((a, b) => (a.avgSpendPerCase || 0) - (b.avgSpendPerCase || 0));
    const sortedBySpend = [...allSurgeons].sort((a, b) => (a.totalSpend || 0) - (b.totalSpend || 0));

    const caseRank = sortedByCases.findIndex(s => s.id === surgeon.id) + 1;
    const costRank = sortedByCost.findIndex(s => s.id === surgeon.id) + 1;
    const spendRank = sortedBySpend.findIndex(s => s.id === surgeon.id) + 1;

    const volumePercentile = (caseRank / allSurgeons.length) * 100;
    const costPercentile = (costRank / allSurgeons.length) * 100;
    const spendPercentile = (spendRank / allSurgeons.length) * 100;

    return {
      volumePercentile: Math.round(volumePercentile),
      costPercentile: Math.round(costPercentile),
      spendPercentile: Math.round(spendPercentile),
      volumeRank: caseRank,
      costRank: costRank,
      spendRank: spendRank
    };
  };

  const getQuadrant = (surgeon, medianCases, medianCost) => {
    if (surgeon.totalCases >= medianCases && surgeon.avgSpendPerCase <= medianCost) {
      return 'High Performer';
    } else if (surgeon.totalCases < medianCases && surgeon.avgSpendPerCase <= medianCost) {
      return 'Cost Conscious';
    } else if (surgeon.totalCases >= medianCases && surgeon.avgSpendPerCase > medianCost) {
      return 'High Volume';
    } else {
      return 'Opportunity Zone';
    }
  };

  const findSimilarSurgeons = (surgeon, allSurgeons) => {
    const others = allSurgeons.filter(s => s.id !== surgeon.id);

    const scored = others.map(other => {
      // Volume similarity (±20%, weight 40%)
      const surgeonCases = surgeon.totalCases || 0;
      const otherCases = other.totalCases || 0;
      const volumeDiff = surgeonCases > 0 ? Math.abs(otherCases - surgeonCases) / surgeonCases : 0;
      const volumeScore = volumeDiff <= 0.2 ? (1 - volumeDiff / 0.2) * 0.4 : 0;

      // Cost similarity (±15%, weight 30%)
      const surgeonCost = surgeon.avgSpendPerCase || 0;
      const otherCost = other.avgSpendPerCase || 0;
      const costDiff = surgeonCost > 0 ? Math.abs(otherCost - surgeonCost) / surgeonCost : 0;
      const costScore = costDiff <= 0.15 ? (1 - costDiff / 0.15) * 0.3 : 0;

      // Vendor match (weight 20%)
      const vendorScore = other.primaryVendor === surgeon.primaryVendor ? 0.2 : 0;

      // Baseline similarity (weight 10%)
      const baselineScore = 0.1;

      const totalScore = volumeScore + costScore + vendorScore + baselineScore;

      return {
        ...other,
        similarityScore: totalScore * 100,
        caseDiff: otherCases - surgeonCases,
        costDiff: otherCost - surgeonCost
      };
    });

    return scored.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 4);
  };

  const generatePeerInsights = (surgeon, allSurgeons, percentiles, quadrant) => {
    const insights = [];
    const medianCases = allSurgeons.map(s => s.totalCases || 0).sort((a, b) => a - b)[Math.floor(allSurgeons.length / 2)] || 0;
    const avgCost = allSurgeons.reduce((sum, s) => sum + (s.avgSpendPerCase || 0), 0) / allSurgeons.length;
    const costDiff = (surgeon.avgSpendPerCase || 0) - avgCost;
    const costPct = avgCost > 0 ? (costDiff / avgCost) * 100 : 0;

    if (quadrant === 'High Performer') {
      insights.push({
        icon: '🏆',
        title: 'Excellent Performance',
        description: `You're in the top ${100 - percentiles.volumePercentile}% for both volume and cost efficiency.`,
        type: 'positive'
      });

      const potentialMentees = allSurgeons.filter(s =>
        s.id !== surgeon.id &&
        s.primaryVendor === surgeon.primaryVendor &&
        (s.avgSpendPerCase || 0) > (surgeon.avgSpendPerCase || 0) * 1.15
      ).slice(0, 2);

      if (potentialMentees.length > 0) {
        insights.push({
          icon: '💡',
          title: 'Sherpa Opportunity',
          description: `Consider being a Sherpa for: ${potentialMentees.map(s => s.name.split(',')[0]).join(' and ')} could benefit from your guidance.`,
          type: 'neutral'
        });
      }
    } else if (quadrant === 'Cost Conscious') {
      insights.push({
        icon: '💰',
        title: 'Great Cost Control',
        description: `Your per-case cost of $${(surgeon.avgSpendPerCase || 0).toFixed(0)} is ${Math.abs(costPct).toFixed(0)}% below average.`,
        type: 'positive'
      });

      const highVolume = allSurgeons.filter(s =>
        s.id !== surgeon.id &&
        (s.avgSpendPerCase || 0) <= (surgeon.avgSpendPerCase || 0) * 1.1 &&
        (s.totalCases || 0) > (surgeon.totalCases || 0) * 1.3
      ).slice(0, 1);

      if (highVolume.length > 0) {
        insights.push({
          icon: '📈',
          title: 'Volume Opportunity',
          description: `${highVolume[0].name.split(',')[0]} has similar efficiency with ${(((highVolume[0].totalCases || 0) - (surgeon.totalCases || 0)) / (surgeon.totalCases || 1) * 100).toFixed(0)}% more cases.`,
          type: 'neutral'
        });
      }
    } else if (quadrant === 'High Volume') {
      insights.push({
        icon: '📊',
        title: 'High-Volume Practice',
        description: `Strong volume with room for cost optimization.`,
        type: 'neutral'
      });

      const betterCost = allSurgeons.filter(s =>
        s.id !== surgeon.id &&
        Math.abs((s.totalCases || 0) - (surgeon.totalCases || 0)) / (surgeon.totalCases || 1) < 0.2 &&
        (s.avgSpendPerCase || 0) < (surgeon.avgSpendPerCase || 0)
      ).sort((a, b) => (a.avgSpendPerCase || 0) - (b.avgSpendPerCase || 0)).slice(0, 2);

      if (betterCost.length > 0) {
        insights.push({
          icon: '💡',
          title: 'Cost Optimization Peers',
          description: `Top performers with similar volume: ${betterCost.map(s => `${s.name.split(',')[0]} ($${((surgeon.avgSpendPerCase || 0) - (s.avgSpendPerCase || 0)).toFixed(0)} lower cost)`).join(', ')}.`,
          type: 'neutral'
        });
      }
    } else {
      insights.push({
        icon: '🎯',
        title: 'Focus Area',
        description: 'Both volume and cost efficiency have growth potential.',
        type: 'warning'
      });

      const roleModels = allSurgeons.filter(s =>
        s.id !== surgeon.id &&
        s.primaryVendor === surgeon.primaryVendor &&
        s.totalCases > surgeon.totalCases &&
        s.avgSpendPerCase < surgeon.avgSpendPerCase
      ).slice(0, 2);

      if (roleModels.length > 0) {
        insights.push({
          icon: '👥',
          title: 'Success Stories',
          description: `Connect with: ${roleModels.map(s => s.name.split(',')[0]).join(' and ')} - achieved high performance with same vendor.`,
          type: 'neutral'
        });
      }
    }

    return insights;
  };

  const getSherpaSuggestions = (surgeon, allSurgeons) => {
    return allSurgeons.filter(s =>
      s.id !== surgeon.id &&
      s.primaryVendor === surgeon.primaryVendor &&
      Math.abs(s.totalCases - surgeon.totalCases) / surgeon.totalCases < 0.3 &&
      s.avgSpendPerCase < surgeon.avgSpendPerCase * 0.85
    ).sort((a, b) => a.avgSpendPerCase - b.avgSpendPerCase).slice(0, 3);
  };

  const handleSurgeonClick = (surgeon) => {
    setSelectedSurgeon(surgeon);
    setSearchTerm(surgeon.name);
    setShowDropdown(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate all scenarios for comparison
  const calculateAllScenarios = (surgeon) => {
    return Object.keys(scenarios).map(key => {
      const scenario = scenarios[key];
      const approvedVendors = scenario.vendors;
      const mustSwitch = !approvedVendors.includes(surgeon.primaryVendor);
      const affectedSpend = surgeon.vendorBreakdown
        .filter(v => !approvedVendors.includes(v.vendor))
        .reduce((sum, v) => sum + v.spend, 0);

      const params = {
        optimistic: { realizationYear1: 0.40, realizationYear2: 0.85, realizationFinal: 0.90, learningCurveWeeks: 10 },
        realistic: { realizationYear1: 0.30, realizationYear2: 0.70, realizationFinal: 0.70, learningCurveWeeks: 16 },
        conservative: { realizationYear1: 0.20, realizationYear2: 0.50, realizationFinal: 0.50, learningCurveWeeks: 24 }
      };

      const mode = params[projectionMode];
      const targetSavings = surgeon.totalSpend * scenario.savings;

      const trainingCost = mustSwitch ? 5000 : 0;
      const affectedCases = Math.min(15, surgeon.totalCases);
      const learningCurveInefficiency = mustSwitch ? (affectedCases * 2 * 2000 * 0.20) : 0;
      const vendorSupportCost = mustSwitch ? 3000 : 0;
      const totalTransitionCosts = trainingCost + learningCurveInefficiency + vendorSupportCost;

      const year1Net = (targetSavings * mode.realizationYear1) - totalTransitionCosts;
      const year2Net = (targetSavings * mode.realizationYear2);
      const year3Net = (targetSavings * mode.realizationFinal);

      const total3YearBonus = 0; // No bonus program
      const total3YearNet = year1Net + year2Net + year3Net;

      const monthlySavings = targetSavings * mode.realizationFinal / 12;
      const breakEvenMonths = totalTransitionCosts > 0 ? Math.ceil(totalTransitionCosts / monthlySavings) : 0;

      let riskPoints = 0;
      if (mustSwitch) riskPoints += 3;
      if ((affectedSpend / surgeon.totalSpend) > 0.5) riskPoints += 2;
      if (surgeon.vendorLoyalty && surgeon.vendorLoyalty.primaryVendorYears < 3) riskPoints += 1;
      if (surgeon.totalCases > 200) riskPoints += 1;
      if ((surgeon.vendorBreakdown || []).filter(v => !approvedVendors.includes(v.vendor)).length > 1) riskPoints += 2;

      const riskLevel = riskPoints <= 2 ? 'Low' : riskPoints <= 4 ? 'Medium' : 'High';
      const trainingDays = mustSwitch ? 2.5 : 0;
      const proctoredCases = mustSwitch ? 6 : 0;

      return {
        key,
        name: scenario.name,
        vendors: approvedVendors,
        mustSwitch,
        affectedPercentage: (affectedSpend / surgeon.totalSpend) * 100,
        trainingDays,
        proctoredCases,
        breakEvenMonths,
        year1Net,
        year2Net,
        year3Net,
        total3YearBonus,
        total3YearNet,
        riskLevel
      };
    });
  };

  // Data quality filters for peer matching
  const QUALITY_FILTERS = {
    minCases: 100,          // Higher bar for "experts"
    minCostPerCase: 800,    // Exclude low outliers (data errors)
    maxCostPerCase: 2500    // Exclude high outliers (data errors)
  };

  // Get quality-filtered experts
  const getQualityExperts = (surgeons) => {
    return surgeons.filter(s =>
      s.totalCases >= QUALITY_FILTERS.minCases &&
      s.avgSpendPerCase >= QUALITY_FILTERS.minCostPerCase &&
      s.avgSpendPerCase <= QUALITY_FILTERS.maxCostPerCase
    );
  };

  // Find vendor experts for transition support
  const findVendorExperts = (targetVendor, allSurgeons, excludeSurgeonId) => {
    const qualityExperts = getQualityExperts(allSurgeons);

    return qualityExperts
      .filter(s =>
        s.id !== excludeSurgeonId &&
        s.primaryVendor === targetVendor &&
        s.totalCases >= 150  // High volume = experienced
      )
      .map(s => {
        // Calculate vendor loyalty percentage
        const vendorBreakdown = (s.vendorBreakdown || []).find(v => v.vendor === targetVendor);
        const loyalty = vendorBreakdown ? vendorBreakdown.percentage : 0;

        // Calculate years of experience (estimate based on volume)
        const estimatedYearsExperience = Math.min(Math.floor(s.totalCases / 100), 10);

        // Check if they use same components
        const componentMatch = (s.topComponents || []).filter(comp =>
          comp.vendor === targetVendor
        ).length;

        return {
          ...s,
          vendorLoyalty: loyalty,
          estimatedYearsExperience,
          componentMatch
        };
      })
      .filter(s => s.vendorLoyalty >= 80)  // High loyalty only
      .sort((a, b) => b.totalCases - a.totalCases)  // Most experienced first
      .slice(0, 10);
  };

  // Find component-specific experts
  const findComponentExperts = (targetVendor, componentCategory, allSurgeons, excludeSurgeonId) => {
    const qualityExperts = getQualityExperts(allSurgeons);

    return qualityExperts
      .filter(s =>
        s.id !== excludeSurgeonId &&
        (s.topComponents || []).some(comp =>
          comp.vendor === targetVendor &&
          comp.category === componentCategory
        )
      )
      .map(s => {
        const relevantComponent = (s.topComponents || []).find(comp =>
          comp.vendor === targetVendor &&
          comp.category === componentCategory
        );

        return {
          ...s,
          componentSpend: relevantComponent ? relevantComponent.spend : 0,
          componentQuantity: relevantComponent ? relevantComponent.quantity : 0
        };
      })
      .sort((a, b) => b.componentQuantity - a.componentQuantity)
      .slice(0, 5);
  };

  // Get system-wide vendor statistics
  const getVendorStats = (targetVendor, allSurgeons) => {
    const qualityExperts = getQualityExperts(allSurgeons);
    const vendorUsers = qualityExperts.filter(s => s.primaryVendor === targetVendor);

    if (vendorUsers.length === 0) {
      return null;
    }

    const totalCases = vendorUsers.reduce((sum, s) => sum + s.totalCases, 0);
    const avgCasesPerSurgeon = totalCases / vendorUsers.length;
    const avgCostPerCase = vendorUsers.reduce((sum, s) => sum + s.avgSpendPerCase, 0) / vendorUsers.length;

    // Get high performers (top 25%)
    const sortedByCases = [...vendorUsers].sort((a, b) => b.totalCases - a.totalCases);
    const top25Percent = sortedByCases.slice(0, Math.ceil(vendorUsers.length * 0.25));
    const avgCasesTop25 = top25Percent.reduce((sum, s) => sum + s.totalCases, 0) / top25Percent.length;

    return {
      totalSurgeons: vendorUsers.length,
      totalSystemCases: totalCases,
      avgCasesPerSurgeon: Math.round(avgCasesPerSurgeon),
      avgCostPerCase: Math.round(avgCostPerCase),
      avgCasesTop25: Math.round(avgCasesTop25),
      percentOfSystem: (vendorUsers.length / qualityExperts.length) * 100
    };
  };

  const COLORS = ['#BA4896', '#667eea', '#764ba2', '#f093fb', '#4facfe'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading surgeon data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 max-w-md">
          <AlertCircle className="text-red-600 mx-auto mb-2" size={48} />
          <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Data</h2>
          <p className="text-red-700">{error}</p>
          <p className="text-sm text-red-600 mt-2">Please contact IT support if this issue persists.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Navigation Header */}
      <NavigationHeader role="surgeon" specialty="hipknee" specialtyName="Hip & Knee" />

      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-2xl p-5 mb-3 text-white">
          <h1 className="text-2xl font-bold mb-2">Surgeon Implant Analytics</h1>
          <p className="text-lg opacity-90">Your personalized vendor consolidation impact tool</p>
          <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-xs opacity-80">Total Surgeons</div>
              <div className="text-2xl font-bold">{surgeonData.length}</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-xs opacity-80">Primary Procedures Only</div>
              <div className="text-2xl font-bold">Hip & Knee</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-xs opacity-80">Data Includes</div>
              <div className="text-2xl font-bold">Top 5 Components</div>
            </div>
          </div>
        </div>

        {/* View Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveView('system')}
              className={`py-4 px-4 rounded-lg font-bold transition-all ${
                activeView === 'system'
                  ? 'bg-gradient-to-r from-blue-600 to-slate-700 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="text-lg">System View</div>
              <div className="text-xs opacity-80 mt-1">
                The Big Picture
              </div>
            </button>
            <button
              onClick={() => setActiveView('individual')}
              className={`py-4 px-4 rounded-lg font-bold transition-all ${
                activeView === 'individual'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="text-lg">Surgeon Profile</div>
              <div className="text-xs opacity-80 mt-1">
                Individual Analytics & Impact
              </div>
            </button>
          </div>
        </div>

        {/* Search Box - Show in Individual view */}
        {activeView === 'individual' && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-3">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Find Your Profile (Type Last Name, First Name)
          </label>
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="e.g., SMITH, JOHN or just SMITH"
                className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-lg"
              />
              {searchTerm && (
                <button
                  onClick={clearSelection}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            
            {/* Dropdown Results */}
            {showDropdown && filteredSurgeons.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-96 overflow-y-auto">
                {filteredSurgeons.map((surgeon) => (
                  <button
                    key={surgeon.id}
                    onClick={() => handleSurgeonSelect(surgeon)}
                    className="w-full text-left px-4 py-4 hover:bg-purple-50 border-b border-gray-100 transition-colors"
                  >
                    <div className="font-semibold text-gray-900">{surgeon.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {surgeon.totalCases} cases/year • ${(surgeon.totalSpend / 1000).toFixed(0)}k spend • Primary: {surgeon.primaryVendor}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        )}

        {/* Empty State - Show when individual view is active but no surgeon selected */}
        {activeView === 'individual' && !selectedSurgeon && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-3 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="text-purple-600" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Find Your Surgeon Profile
              </h3>
              <p className="text-gray-600 mb-4">
                Search for a surgeon above to view their individual analytics, peer benchmarking, component usage, and scenario impact calculations.
              </p>
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 text-left">
                <h4 className="font-semibold text-purple-900 mb-2">What you'll see:</h4>
                <ul className="space-y-2 text-sm text-purple-800">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 flex-shrink-0" size={16} />
                    <span><strong>Overview:</strong> Current vendor status, cost efficiency, and annual volume</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 flex-shrink-0" size={16} />
                    <span><strong>Peer Benchmarking:</strong> See how this surgeon compares to similar colleagues</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 flex-shrink-0" size={16} />
                    <span><strong>Components:</strong> Detailed breakdown of implant components used</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 mt-0.5 flex-shrink-0" size={16} />
                    <span><strong>Scenario Calculator:</strong> Personalized financial impact of vendor consolidation scenarios</span>
                  </li>
                </ul>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                We have data for {surgeonData.length} surgeons performing Hip & Knee procedures.
              </p>
            </div>
          </div>
        )}

        {/* System View Content - The Story Starts Here */}
        {activeView === 'system' && (() => {
          // System-level constants (same as in individual view)
          const systemContext = {
            totalSurgeons: surgeonData.length,
            systemSavingsGoal: 8500000,
            currentProgress: 0,
            optimalProgress: 7200000,
            // Scenario projections: "surgeons" = loyalists (>85% spend) with non-approved vendors who'd need to switch
            scenarioProjections: {
              'A': { potential: 0, surgeons: 0, adoptionRate: 0 }, // Status Quo - no change
              'B': { potential: 1200000, surgeons: 45, adoptionRate: 0.13 }, // Tri-Source
              'C': { potential: 1400000, surgeons: 65, adoptionRate: 0.31 }, // Zimmer + J&J
              'D': { potential: 1600000, surgeons: 78, adoptionRate: 0.38 }, // Stryker + Zimmer
              'E': { potential: 2800000, surgeons: 142, adoptionRate: 0.42 }, // Stryker + J&J
              'F': { potential: 2100000, surgeons: 89, adoptionRate: 0.28 }, // Zimmer Only
              'G': { potential: 1800000, surgeons: 67, adoptionRate: 0.23 }  // Stryker Only
            },
            clinicalData: {
              survivorship: { 'STRYKER': 97.2, 'ZIMMER BIOMET': 96.8, 'J&J': 97.1, benchmark: 96.5 },
              complications: { 'STRYKER': 1.8, 'ZIMMER BIOMET': 1.9, 'J&J': 1.7, national: 2.1 },
              revisionRates: { 'STRYKER': 2.1, 'ZIMMER BIOMET': 2.3, 'J&J': 2.2, national: 3.2 }
            },
            qualityTrends: {
              readmission: { before: 3.2, after: 2.8, change: -12.5 },
              satisfaction: { before: 87, after: 91, change: 4.6 },
              los: { before: 2.4, after: 2.1, change: -12.5 },
              complications: { before: 4.1, after: 3.7, change: -9.8 }
            },
            vendorDistribution: {
              current: { 'ZIMMER BIOMET': 117, 'STRYKER': 89, 'J&J': 59, 'OTHER': 68 },
              target: { 'STRYKER': 145, 'ZIMMER BIOMET': 125, 'J&J': 63, 'OTHER': 0 }
            }
          };

          const progressPercent = (systemContext.currentProgress / systemContext.systemSavingsGoal) * 100;
          const optimalProgressPercent = (systemContext.optimalProgress / systemContext.systemSavingsGoal) * 100;

          return (
            <div className="space-y-3">
              {/* Welcome/Introduction */}
              <div className="bg-gradient-to-r from-blue-600 to-slate-700 rounded-2xl shadow-xl p-5 text-white">
                <h2 className="text-2xl font-bold mb-2">CommonSpirit's Current Situation & Goals</h2>
                <p className="text-lg opacity-90 mb-3">
                  Understanding where we are, where we're going, and the different paths to reach our vendor consolidation goals
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-2xl font-bold mb-1">{systemContext.totalSurgeons}</div>
                    <div className="text-sm opacity-80">Orthopedic Surgeons</div>
                    <div className="text-xs opacity-70 mt-1">Performing hip & knee procedures</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-2xl font-bold mb-1">$8.5M</div>
                    <div className="text-sm opacity-80">Annual Savings Target</div>
                    <div className="text-xs opacity-70 mt-1">Through vendor consolidation</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-2xl font-bold mb-1">6</div>
                    <div className="text-sm opacity-80">Consolidation Scenarios</div>
                    <div className="text-xs opacity-70 mt-1">Different paths forward</div>
                  </div>
                </div>
              </div>

              {/* System Savings Potential */}
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Savings Potential</h3>
                <div className="mb-2">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-sm text-gray-600">System Goal</div>
                      <div className="text-2xl font-bold text-gray-900">${(systemContext.systemSavingsGoal / 1000000).toFixed(1)}M</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Current State</div>
                      <div className="text-2xl font-bold text-orange-600">$0</div>
                      <div className="text-xs text-gray-500">No consolidation yet</div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-2">
                    <div className="text-sm font-semibold text-blue-900 mb-1">What's Achievable</div>
                    <div className="text-xs text-gray-700">
                      With optimal vendor consolidation across all {systemContext.totalSurgeons} surgeons, CommonSpirit could achieve <strong>${(systemContext.optimalProgress / 1000000).toFixed(1)}M in annual savings</strong> - reaching <strong>{optimalProgressPercent.toFixed(0)}% of the goal</strong>.
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-600 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${optimalProgressPercent}%` }}
                    >
                      <span className="text-white text-xs font-bold">${(systemContext.optimalProgress / 1000000).toFixed(1)}M Potential</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          );
        })()}

        {/* Individual View Content - Surgeon Profile */}
        {activeView === 'individual' && selectedSurgeon && (
          <div className="space-y-3">
            {/* Individual Sub-Tabs Navigation */}
            <div className="bg-white rounded-xl shadow-lg p-2">
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setIndividualTab('overview')}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all text-sm ${
                    individualTab === 'overview'
                      ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setIndividualTab('peers')}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all text-sm ${
                    individualTab === 'peers'
                      ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Peer Benchmarking
                </button>
                <button
                  onClick={() => setIndividualTab('components')}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all text-sm ${
                    individualTab === 'components'
                      ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Components
                </button>
                <button
                  onClick={() => setIndividualTab('scenarios')}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all text-sm ${
                    individualTab === 'scenarios'
                      ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Scenario Calculator
                </button>
              </div>
            </div>

            {/* OVERVIEW TAB */}
            {individualTab === 'overview' && (() => {
              // Calculate status metrics
              const currentScenario = scenarios[selectedScenario];
              const mustSwitch = !currentScenario.vendors.includes(selectedSurgeon.primaryVendor);
              const qualitySurgeons = surgeonData.filter(s =>
                (s.totalCases || 0) >= 100 &&
                (s.avgSpendPerCase || 0) >= 800 &&
                (s.avgSpendPerCase || 0) <= 2500
              );
              const avgCosts = qualitySurgeons.map(s => s.avgSpendPerCase || 0).filter(cost => cost > 0);
              const systemAvg = avgCosts.length > 0 ? avgCosts.reduce((a, b) => a + b, 0) / avgCosts.length : 0;
              const surgeonCost = selectedSurgeon.avgSpendPerCase || 0;
              const costEfficiency = systemAvg > 0 && surgeonCost > 0 ? ((systemAvg - surgeonCost) / systemAvg) * 100 : 0;

              return (
              <>
                {/* Status at a Glance */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-5 text-white mb-3">
                  <h2 className="text-2xl font-bold mb-3">Your Status at a Glance</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white/20 rounded-lg p-4">
                      <div className="text-sm opacity-80 mb-2">Current Vendor</div>
                      <div className="text-2xl font-bold">{selectedSurgeon.primaryVendor.split(' ')[0]}</div>
                      <div className="text-sm opacity-80 mt-2">
                        {mustSwitch ? '⚠️ Switch Required for Scenario ' + selectedScenario : '✅ No Switch Needed for Scenario ' + selectedScenario}
                      </div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4">
                      <div className="text-sm opacity-80 mb-2">Cost Efficiency</div>
                      <div className="text-2xl font-bold">{Math.abs(costEfficiency).toFixed(1)}%</div>
                      <div className="text-sm opacity-80 mt-2">
                        {costEfficiency > 0 ? 'below system average' : costEfficiency < 0 ? 'above system average' : 'at system average'}
                      </div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4">
                      <div className="text-sm opacity-80 mb-2">Annual Volume</div>
                      <div className="text-2xl font-bold">{selectedSurgeon.totalCases}</div>
                      <div className="text-sm opacity-80 mt-2">
                        ${(selectedSurgeon.totalSpend / 1000).toFixed(0)}K total spend
                      </div>
                    </div>
                  </div>
                </div>

                {/* Procedure Type Toggle */}
            {(() => {
              const separated = separateHipKneeData(selectedSurgeon);
              const displayData = getCurrentViewData;

              return (
                <>
                  <div className="bg-white rounded-xl shadow-lg p-4 mb-3">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                      <div className="mb-2 md:mb-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Procedure View</h3>
                        <p className="text-sm text-gray-600">Filter metrics by procedure type</p>
                      </div>

                      <div className="inline-flex rounded-lg border-2 border-purple-300 p-1 bg-gray-50">
                        <button
                          onClick={() => setProcedureView('combined')}
                          className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                            procedureView === 'combined'
                              ? 'bg-purple-600 text-white shadow-md'
                              : 'text-gray-700 hover:bg-purple-50'
                          }`}
                        >
                          Combined
                          <div className="text-xs mt-1">
                            {selectedSurgeon.totalCases} cases
                          </div>
                        </button>
                        <button
                          onClick={() => setProcedureView('hips')}
                          className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                            procedureView === 'hips'
                              ? 'bg-purple-600 text-white shadow-md'
                              : 'text-gray-700 hover:bg-purple-50'
                          }`}
                        >
                          Hips Only
                          <div className="text-xs mt-1">
                            {separated.hip.cases} cases
                          </div>
                        </button>
                        <button
                          onClick={() => setProcedureView('knees')}
                          className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                            procedureView === 'knees'
                              ? 'bg-purple-600 text-white shadow-md'
                              : 'text-gray-700 hover:bg-purple-50'
                          }`}
                        >
                          Knees Only
                          <div className="text-xs mt-1">
                            {separated.knee.cases} cases
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Data Limitation Notice */}
                    {(separated.hip.cases === 0 && separated.knee.cases === 0 && procedureView === 'combined') && (
                      <div className="mt-2 pt-4 border-t border-gray-200">
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-sm text-gray-700">
                          <Info className="inline-block mr-2 text-blue-600" size={16} />
                          <strong>Note:</strong> Hip vs. Knee procedure separation requires component-level data.
                          The current baseline dataset contains aggregated vendor spend data only.
                          Use "Combined" view to see all {selectedSurgeon.totalCases} cases and ${(selectedSurgeon.totalSpend / 1000).toFixed(0)}K total spend.
                        </div>
                      </div>
                    )}

                    {/* Quick Stats Summary */}
                    {procedureView === 'combined' && separated.hip.cases > 0 && separated.knee.cases > 0 && (
                      <div className="mt-2 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-700">Hip Procedures</span>
                              <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                                {separated.hip.cases > 0 ? ((separated.hip.cases / selectedSurgeon.totalCases) * 100).toFixed(0) : 0}% of total
                              </span>
                            </div>
                            <div className="text-2xl font-bold text-blue-700">{separated.hip.cases} cases</div>
                            <div className="text-sm text-gray-600 mt-1">
                              ${(separated.hip.spend / 1000).toFixed(1)}K spend • ${separated.hip.avgSpendPerCase.toFixed(0)}/case
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              Primary: {separated.hip.primaryVendor}
                            </div>
                          </div>

                          <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-700">Knee Procedures</span>
                              <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                                {separated.knee.cases > 0 ? ((separated.knee.cases / selectedSurgeon.totalCases) * 100).toFixed(0) : 0}% of total
                              </span>
                            </div>
                            <div className="text-2xl font-bold text-green-700">{separated.knee.cases} cases</div>
                            <div className="text-sm text-gray-600 mt-1">
                              ${(separated.knee.spend / 1000).toFixed(1)}K spend • ${separated.knee.avgSpendPerCase.toFixed(0)}/case
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              Primary: {separated.knee.primaryVendor}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Explanatory Note */}
                    <div className="mt-2 bg-blue-50 border-l-4 border-blue-400 p-3">
                      <div className="flex items-start gap-2">
                        <Info className="text-blue-600 mt-0.5" size={16} />
                        <div>
                          <div className="text-xs font-semibold text-blue-900 mb-1">About Case Count Calculations</div>
                          <div className="text-xs text-gray-700 leading-relaxed">
                            Hip and knee case counts are <strong>estimated</strong> based on the proportion of spend for hip-specific vs knee-specific components.
                            Due to this estimation method and rounding, hip + knee counts may not exactly equal the combined total.
                            Some components may also be used in procedures other than primary hip/knee replacements.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 8-Agent Framework Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    {/* Clinical Evidence Score */}
                    <div className="bg-white rounded-xl shadow-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Heart className="text-red-500" size={24} />
                        <span className="text-xs text-gray-500">Clinical Evidence</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">4.2/5.0</div>
                      <div className="text-sm text-gray-600 mt-1">Evidence Quality</div>
                      <div className="text-xs text-green-600 mt-2 font-semibold">
                        ✓ Peer-reviewed outcomes
                      </div>
                    </div>

                    {/* Patient Experience Score */}
                    <div className="bg-white rounded-xl shadow-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Star className="text-amber-500" size={24} />
                        <span className="text-xs text-gray-500">Patient Experience</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">86/100</div>
                      <div className="text-sm text-gray-600 mt-1">Device Reliability</div>
                      <div className="text-xs text-gray-500 mt-2">
                        Registry outcomes tracked
                      </div>
                    </div>

                    {/* Provider Experience Score */}
                    <div className="bg-white rounded-xl shadow-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Users className="text-purple-600" size={24} />
                        <span className="text-xs text-gray-500">Provider Experience</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">78/100</div>
                      <div className="text-sm text-gray-600 mt-1">Workflow Efficiency</div>
                      <div className="text-xs text-gray-500 mt-2">
                        Vendor support quality
                      </div>
                    </div>

                    {/* Annual Volume (kept for context) */}
                    <div className="bg-white rounded-xl shadow-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Activity className="text-blue-600" size={24} />
                        <span className="text-xs text-gray-500">Annual Volume</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">{displayData.totalCases}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {procedureView === 'combined' ? 'Total Cases' :
                         procedureView === 'hips' ? 'Hip Cases' : 'Knee Cases'}
                      </div>
                      {procedureView !== 'combined' && (
                        <div className="text-xs text-blue-600 mt-2 font-semibold">
                          {((displayData.totalCases / selectedSurgeon.totalCases) * 100).toFixed(0)}% of practice
                        </div>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
              </>
              );
            })()}

            {/* PEERS TAB */}
            {individualTab === 'peers' && (
              <>
                {/* Peer Comparison & Benchmarking Section */}
            {(() => {
              const percentiles = calculatePercentiles(selectedSurgeon, surgeonData);
              const medianCases = surgeonData.map(s => s.totalCases || 0).sort((a, b) => a - b)[Math.floor(surgeonData.length / 2)] || 0;
              const medianCost = surgeonData.map(s => s.avgSpendPerCase || 0).sort((a, b) => a - b)[Math.floor(surgeonData.length / 2)] || 0;
              const quadrant = getQuadrant(selectedSurgeon, medianCases, medianCost);
              const similarSurgeons = findSimilarSurgeons(selectedSurgeon, surgeonData);
              const peerInsights = generatePeerInsights(selectedSurgeon, surgeonData, percentiles, quadrant);
              const sherpas = getSherpaSuggestions(selectedSurgeon, surgeonData);

              // Filter surgeons by vendor if selected
              const displaySurgeons = selectedVendorFilter === 'All'
                ? surgeonData
                : surgeonData.filter(s => s.primaryVendor === selectedVendorFilter);

              // Get unique vendors for filter
              const uniqueVendors = ['All', ...new Set(surgeonData.map(s => s.primaryVendor))].sort();

              // Quality filters for peer comparison
              const QUALITY_FILTERS = {
                minCases: 100,
                minCostPerCase: 800,
                maxCostPerCase: 2500
              };

              const qualitySurgeons = surgeonData.filter(s =>
                s.totalCases >= QUALITY_FILTERS.minCases &&
                s.avgSpendPerCase >= QUALITY_FILTERS.minCostPerCase &&
                s.avgSpendPerCase <= QUALITY_FILTERS.maxCostPerCase
              );

              // Prepare top performers (filtered for quality)
              const topByVolume = [...qualitySurgeons].sort((a, b) => b.totalCases - a.totalCases).slice(0, 10);
              const topByEfficiency = [...qualitySurgeons].sort((a, b) => a.avgSpendPerCase - b.avgSpendPerCase).slice(0, 10);
              const topByImpact = [...qualitySurgeons].sort((a, b) => b.totalSpend - a.totalSpend).slice(0, 10);

              return (
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <button
                    onClick={() => setShowPeerComparison(!showPeerComparison)}
                    className="w-full flex items-center justify-between mb-2"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Target className="text-purple-600" />
                        Peer Comparison & Benchmarking
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        See how you compare to {surgeonData.length} CommonSpirit surgeons
                      </p>
                    </div>
                    {showPeerComparison ? <ChevronUp /> : <ChevronDown />}
                  </button>

                  {showPeerComparison && (
                    <div className="space-y-3">
                      {/* Privacy Notice */}
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-sm text-gray-700">
                        <Info className="inline-block mr-2 text-blue-600" size={16} />
                        This comparison uses internal CommonSpirit data to facilitate peer learning and best practice sharing.
                        All surgeons shown have access to this tool. Data is for internal quality improvement purposes.
                      </div>

                      {/* Peer Insights */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {peerInsights.map((insight, idx) => (
                          <div
                            key={idx}
                            className={`rounded-lg p-4 border-2 ${
                              insight.type === 'positive'
                                ? 'bg-green-50 border-green-200'
                                : insight.type === 'warning'
                                ? 'bg-orange-50 border-orange-200'
                                : 'bg-blue-50 border-blue-200'
                            }`}
                          >
                            <div className="text-2xl mb-2">{insight.icon}</div>
                            <div className="font-bold text-gray-900 mb-1">{insight.title}</div>
                            <div className="text-sm text-gray-700">{insight.description}</div>
                          </div>
                        ))}
                      </div>

                      {/* Percentile Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-100">
                          <div className="text-sm text-gray-600 mb-2">Volume Percentile</div>
                          <div className="text-2xl font-bold text-purple-600 mb-2">{percentiles.volumePercentile}%</div>
                          <div className="text-sm text-gray-700">
                            You rank in top {100 - percentiles.volumePercentile}% by case volume
                          </div>
                          <div className="text-xs text-gray-600 mt-2">Rank #{percentiles.volumeRank} of {surgeonData.length}</div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-100">
                          <div className="text-sm text-gray-600 mb-2">Implant Cost Efficiency Percentile</div>
                          <div className="text-2xl font-bold text-purple-600 mb-2">{percentiles.costPercentile}%</div>
                          <div className="text-sm text-gray-700">
                            You rank in top {100 - percentiles.costPercentile}% for implant cost per case
                          </div>
                          <div className="text-xs text-gray-600 mt-2">Rank #{percentiles.costRank} of {surgeonData.length}</div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-100">
                          <div className="text-sm text-gray-600 mb-2">Total Spend Percentile</div>
                          <div className="text-2xl font-bold text-purple-600 mb-2">{percentiles.spendPercentile}%</div>
                          <div className="text-sm text-gray-700">
                            You rank in top {100 - percentiles.spendPercentile}% by total spend
                          </div>
                          <div className="text-xs text-gray-600 mt-2">Rank #{percentiles.spendRank} of {surgeonData.length}</div>
                        </div>
                      </div>

                      {/* Performance Quadrant Chart */}
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            <Target className="text-purple-600" size={20} />
                            Performance Quadrant
                          </h4>
                          <select
                            value={selectedVendorFilter}
                            onChange={(e) => setSelectedVendorFilter(e.target.value)}
                            className="px-3 py-1 border-2 border-purple-300 rounded-lg text-sm"
                          >
                            {uniqueVendors.map(v => (
                              <option key={v} value={v}>{v}</option>
                            ))}
                          </select>
                        </div>
                        <div className="text-center mb-2">
                          <span className="inline-block px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-bold">
                            You are in: {quadrant}
                          </span>
                        </div>
                        <ResponsiveContainer width="100%" height={400}>
                          <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                              type="number"
                              dataKey="totalCases"
                              name="Cases"
                              tick={{ fontSize: 11 }}
                              label={{ value: 'Total Cases per Year', position: 'bottom', offset: 40 }}
                            />
                            <YAxis
                              type="number"
                              dataKey="avgSpendPerCase"
                              name="Avg Cost"
                              tick={{ fontSize: 11 }}
                              label={{ value: 'Avg Implant Cost per Case ($)', angle: -90, position: 'left', offset: 40 }}
                              tickFormatter={(value) => `$${value.toFixed(0)}`}
                            />
                            <ZAxis range={[30, 400]} />
                            <Tooltip
                              cursor={{ strokeDasharray: '3 3' }}
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-white p-3 border-2 border-purple-600 rounded-lg shadow-xl">
                                      <p className="font-bold text-purple-900">{data.name}</p>
                                      <p className="text-sm text-gray-700">Cases: {data.totalCases}</p>
                                      <p className="text-sm text-gray-700">Avg Cost: ${data.avgSpendPerCase.toFixed(0)}</p>
                                      <p className="text-sm text-gray-700">Vendor: {data.primaryVendor}</p>
                                      {data.id !== selectedSurgeon.id && (
                                        <button
                                          onClick={() => handleSurgeonClick(data)}
                                          className="mt-2 text-xs text-purple-600 hover:text-purple-800 font-semibold"
                                        >
                                          View Profile →
                                        </button>
                                      )}
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <ReferenceLine x={medianCases} stroke="#9ca3af" strokeDasharray="5 5" />
                            <ReferenceLine y={medianCost} stroke="#9ca3af" strokeDasharray="5 5" />

                            {/* Other surgeons */}
                            <Scatter
                              data={displaySurgeons.filter(s => s.id !== selectedSurgeon.id)}
                              fill="#9ca3af"
                              opacity={0.4}
                            />

                            {/* Selected surgeon */}
                            <Scatter
                              data={[selectedSurgeon]}
                              fill="#BA4896"
                              opacity={1}
                            >
                              <Cell r={8} />
                            </Scatter>
                          </ScatterChart>
                        </ResponsiveContainer>

                        {/* Quadrant Labels */}
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                          <div className="text-center p-2 bg-blue-100 rounded">
                            <div className="font-bold text-blue-900">Cost Conscious</div>
                            <div className="text-blue-700">Low vol, Low cost</div>
                          </div>
                          <div className="text-center p-2 bg-green-100 rounded">
                            <div className="font-bold text-green-900">High Performer</div>
                            <div className="text-green-700">High vol, Low cost</div>
                          </div>
                          <div className="text-center p-2 bg-orange-100 rounded">
                            <div className="font-bold text-orange-900">Opportunity Zone</div>
                            <div className="text-orange-700">Low vol, High cost</div>
                          </div>
                          <div className="text-center p-2 bg-purple-100 rounded">
                            <div className="font-bold text-purple-900">High Volume</div>
                            <div className="text-purple-700">High vol, High cost</div>
                          </div>
                        </div>
                      </div>

                      {/* Top Performers Tables */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                        {/* Top by Volume */}
                        <div className="bg-white border-2 border-purple-200 rounded-lg overflow-hidden">
                          <div className="bg-purple-600 text-white px-4 py-3 font-bold">
                            Top 10 by Volume
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-purple-50">
                                <tr>
                                  <th className="px-3 py-2 text-left">#</th>
                                  <th className="px-3 py-2 text-left">Surgeon</th>
                                  <th className="px-3 py-2 text-right">Cases</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {topByVolume.map((s, idx) => (
                                  <tr
                                    key={s.id}
                                    className={`hover:bg-purple-50 cursor-pointer ${s.id === selectedSurgeon.id ? 'bg-purple-100 font-bold' : ''}`}
                                    onClick={() => handleSurgeonClick(s)}
                                  >
                                    <td className="px-3 py-2">{idx + 1}</td>
                                    <td className="px-3 py-2 text-purple-600 hover:text-purple-800">
                                      {s.name.split(',')[0]}
                                    </td>
                                    <td className="px-3 py-2 text-right">{s.totalCases}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Top by Cost Efficiency */}
                        <div className="bg-white border-2 border-green-200 rounded-lg overflow-hidden">
                          <div className="bg-green-600 text-white px-4 py-3 font-bold">
                            Top 10 by Implant Cost Efficiency
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-green-50">
                                <tr>
                                  <th className="px-3 py-2 text-left">#</th>
                                  <th className="px-3 py-2 text-left">Surgeon</th>
                                  <th className="px-3 py-2 text-right">$/Case</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {topByEfficiency.map((s, idx) => (
                                  <tr
                                    key={s.id}
                                    className={`hover:bg-green-50 cursor-pointer ${s.id === selectedSurgeon.id ? 'bg-green-100 font-bold' : ''}`}
                                    onClick={() => handleSurgeonClick(s)}
                                  >
                                    <td className="px-3 py-2">{idx + 1}</td>
                                    <td className="px-3 py-2 text-green-600 hover:text-green-800">
                                      {s.name.split(',')[0]}
                                    </td>
                                    <td className="px-3 py-2 text-right">${(s.avgSpendPerCase || 0).toFixed(0)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Top by Total Impact */}
                        <div className="bg-white border-2 border-blue-200 rounded-lg overflow-hidden">
                          <div className="bg-blue-600 text-white px-4 py-3 font-bold">
                            Top 10 by Total Impact
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-blue-50">
                                <tr>
                                  <th className="px-3 py-2 text-left">#</th>
                                  <th className="px-3 py-2 text-left">Surgeon</th>
                                  <th className="px-3 py-2 text-right">Spend</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {topByImpact.map((s, idx) => (
                                  <tr
                                    key={s.id}
                                    className={`hover:bg-blue-50 cursor-pointer ${s.id === selectedSurgeon.id ? 'bg-blue-100 font-bold' : ''}`}
                                    onClick={() => handleSurgeonClick(s)}
                                  >
                                    <td className="px-3 py-2">{idx + 1}</td>
                                    <td className="px-3 py-2 text-blue-600 hover:text-blue-800">
                                      {s.name.split(',')[0]}
                                    </td>
                                    <td className="px-3 py-2 text-right">${((s.totalSpend || 0) / 1000).toFixed(0)}k</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* Similar Surgeons */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <Users className="text-purple-600" size={20} />
                          Surgeons Similar to Your Profile
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {percentiles.volumePercentile > 75
                            ? 'Connect with these high performers:'
                            : 'Learn from these similar surgeons who optimize costs:'}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {similarSurgeons.map((sim, idx) => (
                            <div key={sim.id} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-100">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-bold text-lg text-gray-900">{sim.name.split(',')[0]}</div>
                                <div className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                                  {(sim.similarityScore || 0).toFixed(0)}% match
                                </div>
                              </div>
                              <div className="space-y-1 text-sm text-gray-700 mb-3">
                                <div>Cases/year: {sim.totalCases || 0}</div>
                                <div>Avg cost: ${(sim.avgSpendPerCase || 0).toFixed(0)}</div>
                                <div>Vendor: {sim.primaryVendor ? sim.primaryVendor.split(' ')[0] : 'N/A'}</div>
                              </div>
                              <div className="text-xs text-gray-600 mb-3">
                                {sim.caseDiff > 0 ? `+${sim.caseDiff}` : sim.caseDiff} cases/year,
                                {sim.costDiff > 0 ? ` +$${(sim.costDiff || 0).toFixed(0)}` : ` -$${Math.abs(sim.costDiff || 0).toFixed(0)}`} per case
                              </div>
                              <button
                                onClick={() => handleSurgeonClick(sim)}
                                className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                              >
                                View Profile
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sherpa Suggestions */}
                      {sherpas.length > 0 && (
                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border-2 border-orange-200">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Mail className="text-orange-600" size={20} />
                            Suggested Sherpas in Your Volume Range
                          </h4>
                          <p className="text-sm text-gray-700 mb-4 italic">
                            A "Sherpa" is a peer surgeon with similar case volume who uses preferred vendors and achieves better financial outcomes.
                            These colleagues can provide practical guidance on vendor selection and cost optimization.
                          </p>
                          <div className="space-y-3">
                            {sherpas.map((sherpa) => (
                              <div key={sherpa.id} className="bg-white rounded-lg p-4 flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-bold text-gray-900">{sherpa.name}</div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    {sherpa.totalCases || 0} cases • ${(sherpa.avgSpendPerCase || 0).toFixed(0)}/case
                                    • ${((selectedSurgeon.avgSpendPerCase || 0) - (sherpa.avgSpendPerCase || 0)).toFixed(0)} lower cost
                                  </div>
                                  <div className="text-sm font-semibold text-purple-600 mt-1">
                                    Primary Vendor: {sherpa.primaryVendor}
                                  </div>
                                </div>
                                <div>
                                  <button
                                    onClick={() => handleSurgeonClick(sherpa)}
                                    className="px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-sm"
                                  >
                                    View Profile →
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
              </>
            )}

            {/* COMPONENTS TAB */}
            {individualTab === 'components' && selectedSurgeon && (
              <ComponentComparisonView
                surgeon={selectedSurgeon}
                allSurgeonData={surgeonData}
              />
            )}

            {/* SCENARIOS TAB */}
            {individualTab === 'scenarios' && (
              <>
                {/* Enhanced Vendor Consolidation Scenarios */}
            {scenarioImpact && (
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Award className="text-purple-600" />
                  Vendor Consolidation Impact Calculator
                </h3>

                {/* Scenario Selector */}
                <div className="mb-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Consolidation Scenario:
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.keys(scenarios).map(key => (
                      <button
                        key={key}
                        onClick={() => setSelectedScenario(key)}
                        className={`px-4 py-3 rounded-lg border-2 font-semibold transition-colors ${
                          selectedScenario === key
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                        }`}
                      >
                        <div className="text-sm">{key}</div>
                        <div className="text-xs opacity-80">{scenarios[key].name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Projection Mode Toggle */}
                <div className="mb-3 flex items-center justify-between bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-700">Projection Mode:</div>
                  <div className="flex gap-2">
                    {['optimistic', 'realistic', 'conservative'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => setProjectionMode(mode)}
                        className={`px-3 py-1 rounded-lg text-sm font-semibold capitalize transition-colors ${
                          projectionMode === mode
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-purple-100'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                  <div className={`rounded-lg p-4 border-2 ${
                    scenarioImpact.mustSwitch ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="text-xs text-gray-600 mb-1">Vendor Switch</div>
                    <div className="text-2xl font-bold">
                      {scenarioImpact.mustSwitch ? '⚠️ Required' : '✅ Not Needed'}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-100">
                    <div className="text-xs text-gray-600 mb-1">3-Year Savings</div>
                    <div className="text-2xl font-bold text-green-600">
                      ${scenarioImpact.npv.toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </div>
                  </div>

                  <div className={`rounded-lg p-4 border-2 ${
                    scenarioImpact.riskLevel === 'Low' ? 'bg-green-50 border-green-200' :
                    scenarioImpact.riskLevel === 'Medium' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-red-50 border-red-200'
                  }`}>
                    <div className="text-xs text-gray-600 mb-1">Risk Level</div>
                    <div className="text-2xl font-bold">
                      {scenarioImpact.riskIcon} {scenarioImpact.riskLevel}
                    </div>
                  </div>
                </div>

                {/* Detailed View Toggle */}
                <button
                  onClick={() => setShowScenarioDetails(!showScenarioDetails)}
                  className="w-full mb-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  {showScenarioDetails ? 'Hide' : 'Show'} Detailed Financial & Operational Analysis
                  {showScenarioDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {showScenarioDetails && (
                  <div className="space-y-3">
                    {/* 3-Year Financial Projection Table */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-100">
                      <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <DollarSign className="text-purple-600" size={20} />
                        3-Year Financial Projection
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-purple-600 text-white">
                            <tr>
                              <th className="px-4 py-3 text-left">Year</th>
                              <th className="px-4 py-3 text-right">Transition Costs</th>
                              <th className="px-4 py-3 text-right">Savings</th>
                              <th className="px-4 py-3 text-right">Net Impact</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            <tr className="bg-white hover:bg-purple-50">
                              <td className="px-4 py-3 font-semibold">Year 1 - Transition</td>
                              <td className="px-4 py-3 text-right text-red-600">-${scenarioImpact.year1.transitionCosts.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                              <td className="px-4 py-3 text-right text-green-600">+${scenarioImpact.year1.savings.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                              <td className="px-4 py-3 text-right font-bold">${scenarioImpact.year1.net.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            </tr>
                            <tr className="bg-white hover:bg-purple-50">
                              <td className="px-4 py-3 font-semibold">Year 2 - Stabilization</td>
                              <td className="px-4 py-3 text-right">$0.00</td>
                              <td className="px-4 py-3 text-right text-green-600">+${scenarioImpact.year2.savings.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                              <td className="px-4 py-3 text-right font-bold text-green-600">+${scenarioImpact.year2.net.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            </tr>
                            <tr className="bg-white hover:bg-purple-50">
                              <td className="px-4 py-3 font-semibold">Year 3+ - Full Realization</td>
                              <td className="px-4 py-3 text-right">$0.00</td>
                              <td className="px-4 py-3 text-right text-green-600">+${scenarioImpact.year3.savings.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                              <td className="px-4 py-3 text-right font-bold text-green-600">+${scenarioImpact.year3.net.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="bg-white rounded-lg p-4">
                          <div className="text-xs text-gray-600 mb-1">Total 3-Year NPV (5% discount)</div>
                          <div className="text-2xl font-bold text-green-600">
                            ${scenarioImpact.npv.toLocaleString(undefined, {maximumFractionDigits: 0})}
                          </div>
                        </div>
                        {scenarioImpact.breakEvenMonths > 0 && (
                          <div className="bg-white rounded-lg p-4">
                            <div className="text-xs text-gray-600 mb-1">Break-Even Timeline</div>
                            <div className="text-2xl font-bold text-purple-600">
                              Month {scenarioImpact.breakEvenMonths}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              You'll break even in {scenarioImpact.breakEvenMonths} months
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Operational Impact (if switching vendors) */}
                    {scenarioImpact.mustSwitch && (
                      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border-2 border-orange-200">
                        <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                          <Users className="text-orange-600" size={20} />
                          Operational Impact Assessment
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                          <div className="bg-white rounded-lg p-4">
                            <div className="text-xs text-gray-600 mb-2">Training Requirements</div>
                            <div className="text-2xl font-bold text-orange-600">{scenarioImpact.trainingDays} days</div>
                            <div className="text-xs text-gray-600 mt-2">
                              • 8 hrs didactic<br/>
                              • 12 hrs hands-on
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-4">
                            <div className="text-xs text-gray-600 mb-2">Proctored Cases</div>
                            <div className="text-2xl font-bold text-orange-600">{scenarioImpact.proctoredCases} cases</div>
                            <div className="text-xs text-gray-600 mt-2">
                              Vendor rep required
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-4">
                            <div className="text-xs text-gray-600 mb-2">Transition Timeline</div>
                            <div className="text-2xl font-bold text-orange-600">{scenarioImpact.transitionWeeks} weeks</div>
                            <div className="text-xs text-gray-600 mt-2">
                              To full efficiency
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 mb-2">
                          <div className="font-semibold text-gray-900 mb-3">Learning Curve Impact:</div>
                          <div className="space-y-2 text-sm text-gray-700">
                            <div>• First {scenarioImpact.affectedCases} cases: 80% of normal efficiency</div>
                            <div>• Additional OR time needed: {scenarioImpact.orTimeImpact.toFixed(1)} hours total</div>
                            <div>• Expected return to full efficiency: Week {scenarioImpact.transitionWeeks}</div>
                            <div className="text-xs text-gray-600 mt-2 italic">
                              * Based on average transition times from 127 surgeons who switched to this vendor system-wide
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4">
                          <div className="font-semibold text-gray-900 mb-3">Timeline Visualization:</div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-24 text-gray-600">Week 1-2:</div>
                              <div className="flex-1 bg-blue-200 rounded px-3 py-1">Didactic training</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-24 text-gray-600">Week 3-4:</div>
                              <div className="flex-1 bg-purple-200 rounded px-3 py-1">Hands-on training</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-24 text-gray-600">Week 5-8:</div>
                              <div className="flex-1 bg-orange-200 rounded px-3 py-1">First 5 proctored cases</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-24 text-gray-600">Week 9-16:</div>
                              <div className="flex-1 bg-yellow-200 rounded px-3 py-1">Independent cases with vendor support</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-24 text-gray-600">Week 17+:</div>
                              <div className="flex-1 bg-green-200 rounded px-3 py-1">Full efficiency achieved</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Risk Assessment & Clinical Quality - Side by Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

                    {/* Risk Assessment & Mitigation */}
                    {scenarioImpact.riskLevel !== 'Low' && (
                      <div className={`rounded-lg p-4 border-2 ${
                        scenarioImpact.riskLevel === 'Medium' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
                      }`}>
                        <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                          <AlertCircle className={scenarioImpact.riskLevel === 'Medium' ? 'text-yellow-600' : 'text-red-600'} size={20} />
                          Risk Assessment & Mitigation Strategies
                        </h4>

                        <div className="bg-white rounded-lg p-4 mb-2">
                          <div className="font-semibold mb-2">Risk Level: {scenarioImpact.riskIcon} {scenarioImpact.riskLevel} Risk</div>
                          <div className="text-sm text-gray-700">
                            {scenarioImpact.riskLevel === 'Medium' ? 'Manageable with proper planning' : 'Requires careful coordination'}
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4">
                          <div className="font-semibold mb-3">Recommended Action Items:</div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                              <div>Schedule training 6 weeks before transition</div>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                              <div>Identify 2 facility peers for proctoring support</div>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                              <div>Block OR time for vendor rep presence (first 10 cases)</div>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                              <div>Plan transition during lower-volume period</div>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                              <div>Attend vendor facility training session</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}


                    {/* Clinical Quality Protection */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="text-2xl">🛡️</div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2">Clinical Quality Commitment</h4>
                          <div className="text-sm text-gray-700 space-y-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="text-green-600" size={16} />
                              <div>FDA-approved implants with 10+ year track record</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="text-green-600" size={16} />
                              <div>Equivalent clinical outcomes to current products</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="text-green-600" size={16} />
                              <div>Used by 90% of U.S. orthopedic surgeons</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="text-green-600" size={16} />
                              <div>Comprehensive training and support program</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="text-green-600" size={16} />
                              <div>Zero quality compromises for cost savings</div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-700 italic">
                            Your clinical autonomy is protected. This is about system efficiency, not clinical decisions.
                          </div>
                        </div>
                      </div>
                    </div>

                    </div>

                    {/* All Scenarios Comparison */}
                    <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                      <h4 className="font-bold text-gray-900 mb-2">Compare All Scenarios</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-3 py-2 text-left">Scenario</th>
                              <th className="px-3 py-2 text-center">Switch?</th>
                              <th className="px-3 py-2 text-right">% Affected</th>
                              <th className="px-3 py-2 text-right">Training Days</th>
                              <th className="px-3 py-2 text-right">Break-Even</th>
                              <th className="px-3 py-2 text-right">3-Yr Bonus</th>
                              <th className="px-3 py-2 text-right">3-Yr Net</th>
                              <th className="px-3 py-2 text-center">Risk</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {calculateAllScenarios(selectedSurgeon).map((s) => {
                              const isSelected = s.key === selectedScenario;
                              const allScenarios = calculateAllScenarios(selectedSurgeon);
                              const maxNet = Math.max(...allScenarios.map(x => x.total3YearNet));
                              const isBestROI = s.total3YearNet === maxNet && maxNet > 0;
                              const isEasiest = !s.mustSwitch;

                              return (
                                <tr
                                  key={s.key}
                                  className={`hover:bg-purple-50 cursor-pointer ${isSelected ? 'bg-purple-100 font-semibold' : ''}`}
                                  onClick={() => setSelectedScenario(s.key)}
                                >
                                  <td className="px-3 py-2">
                                    <div className="flex items-center gap-2">
                                      <span>{s.key}: {s.name}</span>
                                      {isBestROI && <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">🏆 Best ROI</span>}
                                      {isEasiest && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">✅ Easy</span>}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-center">{s.mustSwitch ? '⚠️ Yes' : '✅ No'}</td>
                                  <td className="px-3 py-2 text-right">{s.affectedPercentage.toFixed(0)}%</td>
                                  <td className="px-3 py-2 text-right">{s.trainingDays > 0 ? s.trainingDays : '-'}</td>
                                  <td className="px-3 py-2 text-right">{s.breakEvenMonths > 0 ? `Mo ${s.breakEvenMonths}` : '-'}</td>
                                  <td className="px-3 py-2 text-right text-purple-600 font-semibold">${s.total3YearBonus.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                  <td className="px-3 py-2 text-right text-green-600 font-semibold">${s.total3YearNet.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                  <td className="px-3 py-2 text-center">
                                    {s.riskLevel === 'Low' ? '🟢' : s.riskLevel === 'Medium' ? '🟡' : '🔴'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Save Scenario */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSavedScenario(selectedScenario)}
                        className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                      >
                        💾 Save Scenario {selectedScenario} as Favorite
                      </button>
                      {savedScenario && (
                        <div className="flex-1 px-4 py-3 bg-green-100 border-2 border-green-300 rounded-lg text-green-800 font-semibold text-center">
                          ✓ Saved: Scenario {savedScenario}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
              </>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default SurgeonTool;
