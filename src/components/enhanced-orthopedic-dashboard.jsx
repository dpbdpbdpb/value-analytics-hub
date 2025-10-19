import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, RadarChart, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Cell, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Area, ComposedChart,
  Sankey, Treemap, ScatterChart, Scatter
} from 'recharts';
import { 
  DollarSign, TrendingUp, AlertCircle, Users, Building2, 
  Activity, Shield, Target, Calculator, FileText, CheckCircle, 
  AlertTriangle, XCircle, ChevronDown, ChevronRight, Award,
  Package, Heart, Briefcase, Clock, Zap, Info, Settings,
  Sliders, ArrowRight, TrendingDown, HelpCircle, Eye
} from 'lucide-react';

const EnhancedOrthopedicDashboard = () => {
  // State management
  const [selectedScenario, setSelectedScenario] = useState('A');
  const [expandedView, setExpandedView] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    assumptions: true,
    financial: true,
    risk: true,
    components: true
  });
  
  // Dynamic assumptions state
  const [assumptions, setAssumptions] = useState({
    pricingLeverage: {
      status_quo: 0,
      single: 25,
      dual: 20,
      tri: 15,
      matrix: 12
    },
    surgeonAdoption: {
      A: 100,
      B: 85,
      C: 68,
      D: 92,
      E: 88,
      F: 90,
      G: 89,
      H: 91 // New tri-vendor
    },
    vendorShares: {
      A: { // Status Quo - many vendors
        zimmer: 28,
        stryker: 22,
        jj: 15,
        smith_nephew: 10,
        others: 25 // 15+ smaller vendors
      },
      B: { // Dual
        zimmer: 55,
        stryker: 45,
        jj: 0,
        requirement: 'minimum' // min or max
      },
      C: { // Single
        zimmer: 100,
        stryker: 0,
        jj: 0
      },
      D: { // Matrix (all three)
        zimmer: 40,
        stryker: 35,
        jj: 25
      },
      H: { // Tri-vendor equal
        zimmer: 33.3,
        stryker: 33.3,
        jj: 33.4
      }
    },
    shareRequirements: {
      B: { min: 40, max: 60 },
      H: { min: 30, max: 40 }
    }
  });

  // CommonSpirit brand colors
  const colors = {
    primary: '#BA4896',
    secondary: '#7B2D65',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    light: '#F3F4F6',
    dark: '#1F2937'
  };

  // Enhanced scenario data with narratives
  const scenarios = {
    'A': {
      name: 'Status Quo - Fragmented Multi-Vendor',
      shortName: 'Status Quo',
      vendors: '20+ vendors',
      vendorList: ['Zimmer', 'Stryker', 'J&J', 'Smith & Nephew', '15+ others'],
      narrative: 'Current state with 20+ vendors including Zimmer (28%), Stryker (22%), J&J (15%), Smith & Nephew (10%), and 15+ smaller vendors (25%). Zero negotiation leverage due to fragmentation results in no savings opportunity.',
      savingsMethod: 'No savings - fragmented purchasing prevents volume leverage. Small vendors maintain 5-10% shares each, creating operational complexity without pricing benefits.',
      volumeSplit: assumptions.vendorShares.A,
      baselineCost: 4850,
      targetCost: 4850,
      savingsBreakdown: {
        volumeLeverage: 0,
        priceOptimization: 0,
        inventoryEfficiency: 0,
        adminEfficiency: 0
      }
    },
    'B': {
      name: 'Dual-Vendor Strategic Consolidation',
      shortName: 'Dual-Vendor',
      vendors: '2 vendors',
      vendorList: ['Zimmer', 'Stryker'],
      narrative: 'Consolidate 85% of volume with Zimmer (55%) and Stryker (45%), eliminating J&J and smaller vendors. Proven Mountain Region model with strong surgeon acceptance.',
      savingsMethod: 'Achieve 20% price reduction through volume aggregation ($970 savings/case). Factor in 85% surgeon adoption: $970 × 85% × 5,300 cases = $20.1M annual savings.',
      volumeSplit: assumptions.vendorShares.B,
      baselineCost: 4850,
      targetCost: 3880,
      savingsBreakdown: {
        volumeLeverage: 9.0,
        priceOptimization: 7.2,
        inventoryEfficiency: 2.4,
        adminEfficiency: 1.5
      }
    },
    'C': {
      name: 'Single-Vendor Maximum Leverage',
      shortName: 'Single-Vendor',
      vendors: '1 vendor',
      vendorList: ['Zimmer'],
      narrative: 'Award 100% volume to Zimmer for maximum negotiation leverage. Highest savings potential offset by significant surgeon resistance and adoption risk.',
      savingsMethod: 'Maximum 25% price reduction ($1,212 savings/case) but only 68% surgeon adoption. Net impact: $1,212 × 68% × 5,300 cases = $23.6M before accounting for lost volume.',
      volumeSplit: assumptions.vendorShares.C,
      baselineCost: 4850,
      targetCost: 3638,
      savingsBreakdown: {
        volumeLeverage: 11.0,
        priceOptimization: 8.5,
        inventoryEfficiency: 3.0,
        adminEfficiency: 1.1
      }
    },
    'D': {
      name: 'Three-Vendor Matrix Competition',
      shortName: 'Matrix Pricing',
      vendors: '3 vendors',
      vendorList: ['Zimmer', 'Stryker', 'J&J'],
      narrative: 'All three major vendors compete on component-level pricing. Surgeons choose best components from any vendor, maintaining choice while driving competition.',
      savingsMethod: 'Component-level competition achieves 12% cost reduction ($582/case). High 92% adoption due to maintained choice: $582 × 92% × 5,300 cases = $18.5M.',
      volumeSplit: assumptions.vendorShares.D,
      baselineCost: 4850,
      targetCost: 4268,
      savingsBreakdown: {
        volumeLeverage: 8.2,
        priceOptimization: 7.1,
        inventoryEfficiency: 2.2,
        adminEfficiency: 1.0
      }
    },
    'E': {
      name: 'Performance-Based Hybrid Model',
      shortName: 'Performance-Based',
      vendors: '2 vendors',
      vendorList: ['Zimmer', 'Stryker'],
      narrative: 'Two vendors with quarterly volume adjustments based on quality scorecards. Initial 50/50 split adjusts ±10% based on performance metrics.',
      savingsMethod: 'Base 18% reduction ($873/case) plus performance incentives. 88% adoption yields: $873 × 88% × 5,300 cases = $19.8M.',
      volumeSplit: { zimmer: 50, stryker: 50 },
      baselineCost: 4850,
      targetCost: 3977,
      savingsBreakdown: {
        volumeLeverage: 8.5,
        priceOptimization: 7.8,
        inventoryEfficiency: 2.5,
        adminEfficiency: 1.0
      }
    },
    'F': {
      name: 'Value-Based Care Alignment',
      shortName: 'VBC Model',
      vendors: '2 vendors',
      vendorList: ['Zimmer', 'Stryker'],
      narrative: 'Outcome-based contracting with shared risk/reward tied to readmissions, revisions, and PROMs. Base savings plus outcome bonuses.',
      savingsMethod: 'Base 15% reduction ($727/case) at 90% adoption = $17.2M, plus $3-5M potential outcome bonuses for quality metrics achievement.',
      volumeSplit: { zimmer: 52, stryker: 48 },
      baselineCost: 4850,
      targetCost: 4123,
      outcomeBonus: 3.5,
      savingsBreakdown: {
        volumeLeverage: 6.5,
        priceOptimization: 6.0,
        inventoryEfficiency: 2.2,
        adminEfficiency: 2.5
      }
    },
    'G': {
      name: 'Enhanced Dual-Vendor Plus',
      shortName: 'Enhanced Dual',
      vendors: '2 vendors',
      vendorList: ['Zimmer', 'Stryker'],
      narrative: 'Optimized dual-vendor with matrix pricing elements. Zimmer and Stryker compete on components while maintaining primary relationships.',
      savingsMethod: 'Aggressive 22% reduction ($1,067/case) with 89% adoption through enhanced competition: $1,067 × 89% × 5,300 cases = $22.3M.',
      volumeSplit: { zimmer: 53, stryker: 47 },
      baselineCost: 4850,
      targetCost: 3783,
      savingsBreakdown: {
        volumeLeverage: 10.0,
        priceOptimization: 8.3,
        inventoryEfficiency: 2.8,
        adminEfficiency: 1.2
      }
    },
    'H': {
      name: 'Tri-Vendor Balanced Competition',
      shortName: 'Tri-Vendor',
      vendors: '3 vendors',
      vendorList: ['Zimmer', 'Stryker', 'J&J'],
      narrative: 'Equal distribution among three major vendors (33.3% each) maintains maximum competition while consolidating from 20+ to 3 vendors.',
      savingsMethod: 'Moderate 15% reduction ($727/case) with high 91% adoption due to surgeon choice: $727 × 91% × 5,300 cases = $17.6M.',
      volumeSplit: assumptions.vendorShares.H,
      baselineCost: 4850,
      targetCost: 4123,
      savingsBreakdown: {
        volumeLeverage: 7.0,
        priceOptimization: 6.5,
        inventoryEfficiency: 2.5,
        adminEfficiency: 1.6
      }
    }
  };

  // Calculate dynamic financial impact
  const calculateFinancialImpact = (scenarioKey) => {
    const scenario = scenarios[scenarioKey];
    const adoption = assumptions.surgeonAdoption[scenarioKey] / 100;
    const baseCases = 5300;
    const adoptedCases = baseCases * adoption;
    const lostCases = baseCases * (1 - adoption);
    
    // Calculate savings on adopted cases
    const savingsPerCase = scenario.baselineCost - scenario.targetCost;
    const grossSavings = savingsPerCase * adoptedCases;
    
    // Calculate lost contribution margin on lost cases
    const contributionMarginPerCase = 1500; // Average contribution margin
    const lostContribution = lostCases * contributionMarginPerCase;
    
    // Net financial impact
    const netSavings = grossSavings - lostContribution;
    const netSavingsMillions = netSavings / 1000000;
    
    // Risk-adjusted (probability-weighted)
    const conservative = netSavingsMillions * 0.85;
    const expected = netSavingsMillions;
    const optimistic = netSavingsMillions * 1.15;
    const probabilityWeighted = (conservative * 0.25) + (expected * 0.50) + (optimistic * 0.25);
    
    return {
      adoptedCases,
      lostCases,
      savingsPerCase,
      grossSavings,
      lostContribution,
      netSavings,
      netSavingsMillions,
      conservative,
      expected,
      optimistic,
      probabilityWeighted
    };
  };

  // Savings component breakdown explanation
  const savingsComponentExplanations = {
    volumeLeverage: {
      name: 'Volume Leverage',
      description: 'Consolidating purchasing volume creates negotiation power. Vendors offer deeper discounts for guaranteed higher volumes.',
      calculation: 'Based on % of total spend concentrated with each vendor',
      example: 'Moving from 25% to 55% share with a vendor typically yields 8-10% additional discount'
    },
    priceOptimization: {
      name: 'Price Standardization',
      description: 'Eliminating price variation across facilities and standardizing to best negotiated rates.',
      calculation: 'Difference between highest and lowest current prices × adoption rate',
      example: 'Same implant varies 3x across facilities; standardizing captures the delta'
    },
    inventoryEfficiency: {
      name: 'Inventory Optimization',
      description: 'Reducing SKUs, consignment needs, and carrying costs through vendor consolidation.',
      calculation: 'Reduction in inventory carrying costs + reduced waste from expiration',
      example: 'Reducing from 200+ SKUs to 120 SKUs saves ~$2.2M in carrying costs'
    },
    adminEfficiency: {
      name: 'Administrative Efficiency',
      description: 'Simplified vendor management, unified contracts, and reduced processing overhead.',
      calculation: 'Reduced FTEs needed for vendor management × fully loaded cost',
      example: 'Managing 3 vendors vs 20+ saves 2-3 FTEs at $150K each'
    }
  };

  // Handle vendor share adjustments
  const handleVendorShareChange = (scenario, vendor, value) => {
    const newShares = { ...assumptions.vendorShares[scenario] };
    const oldValue = newShares[vendor];
    const diff = value - oldValue;
    
    newShares[vendor] = value;
    
    // Redistribute difference among other vendors
    const otherVendors = Object.keys(newShares).filter(v => v !== vendor && v !== 'requirement');
    const redistribution = diff / otherVendors.length;
    
    otherVendors.forEach(v => {
      newShares[v] = Math.max(0, newShares[v] - redistribution);
    });
    
    setAssumptions(prev => ({
      ...prev,
      vendorShares: {
        ...prev.vendorShares,
        [scenario]: newShares
      }
    }));
  };

  // Handle pricing leverage adjustment
  const handlePricingLeverageChange = (model, value) => {
    setAssumptions(prev => ({
      ...prev,
      pricingLeverage: {
        ...prev.pricingLeverage,
        [model]: value
      }
    }));
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Render scenario deep dive
  const renderScenarioDeepDive = () => {
    const scenario = scenarios[selectedScenario];
    const financial = calculateFinancialImpact(selectedScenario);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-6xl max-h-[90vh] overflow-y-auto p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{scenario.name}</h2>
              <p className="text-gray-600 mt-2">{scenario.narrative}</p>
            </div>
            <button
              onClick={() => setExpandedView(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Financial Deep Dive */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-green-900 mb-4">Financial Analysis Deep Dive</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Volume Impact</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total procedures:</span>
                    <span className="font-medium">5,300</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Surgeon adoption rate:</span>
                    <span className="font-medium">{assumptions.surgeonAdoption[selectedScenario]}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Adopted procedures:</span>
                    <span className="font-medium text-green-600">{financial.adoptedCases.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lost procedures:</span>
                    <span className="font-medium text-red-600">{financial.lostCases.toFixed(0)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Financial Impact</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Savings per case:</span>
                    <span className="font-medium">${financial.savingsPerCase.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gross savings:</span>
                    <span className="font-medium text-green-600">${(financial.grossSavings/1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lost contribution:</span>
                    <span className="font-medium text-red-600">-${(financial.lostContribution/1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-bold">Net savings:</span>
                    <span className="font-bold text-green-700">${financial.netSavingsMillions.toFixed(1)}M</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Savings Method Explanation */}
            <div className="mt-4 p-4 bg-white rounded">
              <h4 className="font-medium text-gray-700 mb-2">How We Calculate Savings</h4>
              <p className="text-sm text-gray-600">{scenario.savingsMethod}</p>
            </div>
          </div>

          {/* Component Breakdown */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-blue-900 mb-4">Savings Components Explained</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(scenario.savingsBreakdown).map(([key, value]) => (
                <div key={key} className="bg-white rounded p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {savingsComponentExplanations[key].name}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {savingsComponentExplanations[key].description}
                      </p>
                      <p className="text-sm font-medium text-blue-700 mt-2">
                        ${value.toFixed(1)}M contribution
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vendor Distribution */}
          {selectedScenario !== 'A' && (
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-purple-900 mb-4">Vendor Share Requirements</h3>
              <div className="space-y-4">
                {scenario.volumeSplit && Object.entries(scenario.volumeSplit).map(([vendor, share]) => {
                  if (vendor === 'requirement' || vendor === 'others') return null;
                  return (
                    <div key={vendor}>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium capitalize">{vendor.replace('_', ' ')}</span>
                        <span>{share}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full"
                          style={{ 
                            width: `${share}%`,
                            backgroundColor: vendor === 'zimmer' ? colors.primary : 
                                           vendor === 'stryker' ? colors.info : colors.warning
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {assumptions.shareRequirements[selectedScenario] && (
                <div className="mt-4 p-3 bg-white rounded">
                  <p className="text-sm text-gray-600">
                    <strong>Share Requirements:</strong> Each vendor must maintain between {assumptions.shareRequirements[selectedScenario].min}% 
                    and {assumptions.shareRequirements[selectedScenario].max}% share to achieve pricing targets.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Orthopedic Vendor Consolidation Scenario Analyzer
              </h1>
              <p className="text-gray-600 mt-2">
                CommonSpirit Health | Dynamic Cost-Cutting Analysis with Market Intelligence
              </p>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
            >
              <Settings className="w-5 h-5" />
              Adjust Assumptions
            </button>
          </div>

          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Current State</p>
                  <p className="text-xl font-bold text-gray-900">20+ Vendors</p>
                  <p className="text-xs text-gray-600">Fragmented</p>
                </div>
                <Package className="w-8 h-8 text-gray-400" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">Selected Savings</p>
                  <p className="text-xl font-bold text-green-900">
                    ${calculateFinancialImpact(selectedScenario).netSavingsMillions.toFixed(1)}M
                  </p>
                  <p className="text-xs text-green-600">Net annual impact</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">Adoption Rate</p>
                  <p className="text-xl font-bold text-blue-900">
                    {assumptions.surgeonAdoption[selectedScenario]}%
                  </p>
                  <p className="text-xs text-blue-600">Surgeon acceptance</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700">Lost Volume</p>
                  <p className="text-xl font-bold text-purple-900">
                    {calculateFinancialImpact(selectedScenario).lostCases.toFixed(0)}
                  </p>
                  <p className="text-xs text-purple-600">Cases at risk</p>
                </div>
                <TrendingDown className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700">Market Intel</p>
                  <p className="text-xl font-bold text-amber-900">20-25%</p>
                  <p className="text-xs text-amber-600">Achievable reduction</p>
                </div>
                <Target className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Assumptions Panel */}
        {showDetails && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sliders className="w-6 h-6" style={{ color: colors.primary }} />
                Dynamic Assumptions & Market Intelligence
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pricing Leverage */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700">Pricing Leverage by Model (%)</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Single Vendor</span>
                      <span className="text-sm font-medium">{assumptions.pricingLeverage.single}%</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="30"
                      value={assumptions.pricingLeverage.single}
                      onChange={(e) => handlePricingLeverageChange('single', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Dual Vendor</span>
                      <span className="text-sm font-medium">{assumptions.pricingLeverage.dual}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="25"
                      value={assumptions.pricingLeverage.dual}
                      onChange={(e) => handlePricingLeverageChange('dual', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Tri Vendor</span>
                      <span className="text-sm font-medium">{assumptions.pricingLeverage.tri}%</span>
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="20"
                      value={assumptions.pricingLeverage.tri}
                      onChange={(e) => handlePricingLeverageChange('tri', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Surgeon Adoption */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700">Surgeon Adoption Rates (%)</h3>
                <div className="space-y-2">
                  {Object.entries(scenarios).map(([key, scenario]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm">{scenario.shortName}</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={assumptions.surgeonAdoption[key]}
                        onChange={(e) => setAssumptions(prev => ({
                          ...prev,
                          surgeonAdoption: {
                            ...prev.surgeonAdoption,
                            [key]: parseInt(e.target.value)
                          }
                        }))}
                        className="w-20 px-2 py-1 border rounded text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Market Intelligence */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700">Market Intelligence Insights</h3>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">J&J Spin-off Window</p>
                        <p className="text-blue-700">DePuy vulnerability through 2027</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-900">Zimmer ERP Crisis</p>
                        <p className="text-amber-700">Operational leverage opportunity</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">CMS TEAM 2026</p>
                        <p className="text-green-700">Bundled payment leverage</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Scenario Grid */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Eye className="w-6 h-6" style={{ color: colors.primary }} />
            Interactive Scenario Explorer (Click to Deep Dive)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(scenarios).map(([key, scenario]) => {
              const financial = calculateFinancialImpact(key);
              const isSelected = selectedScenario === key;
              
              return (
                <div
                  key={key}
                  className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50 shadow-lg transform scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow'
                  }`}
                  onClick={() => setSelectedScenario(key)}
                >
                  {/* Scenario Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold">Scenario {key}</span>
                    {financial.netSavingsMillions > 15 && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        High Impact
                      </span>
                    )}
                  </div>
                  
                  {/* Scenario Name */}
                  <p className="font-medium text-gray-900 mb-1">{scenario.shortName}</p>
                  <p className="text-xs text-gray-600 mb-3">{scenario.vendors}</p>
                  
                  {/* Financial Impact Visual */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Net Savings</span>
                      <span className="font-medium">${financial.netSavingsMillions.toFixed(1)}M</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${Math.min(100, (financial.netSavingsMillions / 25) * 100)}%`,
                          backgroundColor: financial.netSavingsMillions > 18 ? colors.success :
                                         financial.netSavingsMillions > 15 ? colors.warning :
                                         colors.info
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Key Metrics */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Adoption:</span>
                      <span className={`font-medium ${
                        assumptions.surgeonAdoption[key] >= 85 ? 'text-green-600' : 
                        assumptions.surgeonAdoption[key] >= 70 ? 'text-amber-600' : 
                        'text-red-600'
                      }`}>
                        {assumptions.surgeonAdoption[key]}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Lost cases:</span>
                      <span className="font-medium text-red-600">{financial.lostCases.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Risk-adjusted:</span>
                      <span className="font-medium">${financial.probabilityWeighted.toFixed(1)}M</span>
                    </div>
                  </div>
                  
                  {/* Deep Dive Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedView(true);
                    }}
                    className="mt-3 w-full py-2 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <ArrowRight className="w-3 h-3" />
                    Explore Details
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Comparison Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6" style={{ color: colors.primary }} />
              Net Savings Comparison (Adoption-Adjusted)
            </h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(scenarios).map(([key, scenario]) => ({
                name: `${key}: ${scenario.shortName}`,
                gross: (scenario.baselineCost - scenario.targetCost) * assumptions.surgeonAdoption[key] / 100 * 5300 / 1000000,
                lost: -(1 - assumptions.surgeonAdoption[key] / 100) * 5300 * 1500 / 1000000,
                net: calculateFinancialImpact(key).netSavingsMillions
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(1)}M`} />
                <Legend />
                <Bar dataKey="gross" stackId="a" fill={colors.success} name="Gross Savings" />
                <Bar dataKey="lost" stackId="a" fill={colors.danger} name="Lost Contribution" />
                <Bar dataKey="net" fill={colors.primary} name="Net Impact" />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Key Insight:</strong> Higher savings scenarios often have lower adoption rates. 
                Scenario {selectedScenario} nets ${calculateFinancialImpact(selectedScenario).netSavingsMillions.toFixed(1)}M 
                after accounting for {calculateFinancialImpact(selectedScenario).lostCases.toFixed(0)} lost cases.
              </p>
            </div>
          </div>

          {/* Vendor Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Package className="w-6 h-6" style={{ color: colors.info }} />
              Vendor Share Distribution
            </h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(scenarios[selectedScenario].volumeSplit || {})
                    .filter(([key]) => key !== 'requirement')
                    .map(([vendor, share]) => ({
                      name: vendor.charAt(0).toUpperCase() + vendor.slice(1).replace('_', ' '),
                      value: share
                    }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(scenarios[selectedScenario].volumeSplit || {}).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      entry[0] === 'zimmer' ? colors.primary :
                      entry[0] === 'stryker' ? colors.info :
                      entry[0] === 'jj' ? colors.warning :
                      entry[0] === 'smith_nephew' ? colors.success :
                      colors.secondary
                    } />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">Current Scenario: {scenarios[selectedScenario].name}</p>
              <p className="text-xs text-gray-600">{scenarios[selectedScenario].narrative}</p>
            </div>
          </div>
        </div>

        {/* Savings Components Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <div 
            className="flex items-center justify-between mb-4 cursor-pointer"
            onClick={() => toggleSection('components')}
          >
            <h2 className="text-xl font-bold flex items-center gap-2">
              <HelpCircle className="w-6 h-6" style={{ color: colors.primary }} />
              Understanding Savings Components
            </h2>
            {expandedSections.components ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
          
          {expandedSections.components && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(savingsComponentExplanations).map(([key, component]) => (
                <div key={key} className="p-4 border rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">{component.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{component.description}</p>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-xs text-gray-500 mb-1">
                      <strong>How it's calculated:</strong> {component.calculation}
                    </p>
                    <p className="text-xs text-gray-500">
                      <strong>Example:</strong> {component.example}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-gray-700">Contribution:</span>
                    <span className="font-bold text-purple-700">
                      ${scenarios[selectedScenario].savingsBreakdown[key]}M
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Decision Matrix */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl shadow-lg p-8 mt-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Strategic Recommendation Engine</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <h3 className="font-bold mb-2">If Priority is Savings</h3>
              <p className="text-sm text-purple-100">Choose Scenario G (Enhanced Dual)</p>
              <p className="text-xs text-purple-200 mt-1">$22.3M net with 89% adoption</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <h3 className="font-bold mb-2">If Priority is Adoption</h3>
              <p className="text-sm text-purple-100">Choose Scenario D (Matrix)</p>
              <p className="text-xs text-purple-200 mt-1">92% adoption with $18.5M savings</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <h3 className="font-bold mb-2">If Priority is Balance</h3>
              <p className="text-sm text-purple-100">Choose Scenario B or H</p>
              <p className="text-xs text-purple-200 mt-1">Good savings with manageable risk</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white/20 backdrop-blur rounded-lg">
            <p className="text-sm italic">
              "Market intelligence shows J&J's spin-off vulnerability, Zimmer's ERP challenges, and 
              CMS bundled payments create a 2025-2027 window for 20-25% cost reductions. 
              Act decisively to capture this once-in-decade opportunity."
            </p>
          </div>
        </div>
      </div>

      {/* Expanded View Modal */}
      {expandedView && renderScenarioDeepDive()}
    </div>
  );
};

export default EnhancedOrthopedicDashboard;