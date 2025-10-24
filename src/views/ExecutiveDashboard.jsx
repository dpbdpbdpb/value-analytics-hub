import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, RadarChart, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Area, AreaChart,
  ScatterChart, Scatter, ComposedChart, Sankey, RadialBarChart, RadialBar
} from 'recharts';
import { generateScenarios } from '../config/scenarios';
import {
  DollarSign, TrendingUp, AlertCircle, Users, Building2,
  Activity, Shield, Target, Calculator, FileText, CheckCircle,
  AlertTriangle, XCircle, ChevronDown, ChevronRight, Award,
  Package, Heart, Briefcase, Clock, Zap, Info, Settings,
  Sliders, ArrowRight, TrendingDown, HelpCircle, Eye,
  Filter, BarChart3, Bookmark, Play, X, Check,
  BookOpen, MapPin, Stethoscope, Users2, Home, RefreshCw, Calendar
} from 'lucide-react';
import NavigationHeader from '../components/shared/NavigationHeader';
import RegionSwitchingHeatmap from '../components/RegionSwitchingHeatmap';

const EnhancedOrthopedicDashboard = () => {
  // Get persona from URL params
  const [searchParams] = useSearchParams();
  const persona = searchParams.get('persona') || 'financial'; // default to financial
  // Data loading state
  const [realData, setRealData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedScenario, setSelectedScenario] = useState('dual-value'); // Default to Dual-Value scenario
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonScenario, setComparisonScenario] = useState('dual-premium'); // Default comparison
  const [sortBy, setSortBy] = useState('savings');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterProcedureType, setFilterProcedureType] = useState('all'); // all, primary, revision
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);

  // What-if scenario sliders
  const [whatIfParams, setWhatIfParams] = useState({
    adoptionModifier: 0, // -20 to +20
    priceErosion: 0, // -10 to +10
    implementationMonths: 12, // 6 to 24
    volumeGrowth: 0, // -15 to +15
    surgeonResistance: 0, // 0 to 30
    negotiationLeverage: 0, // -10 to +20
  });

  // CommonSpirit brand colors
  const COLORS = {
    primary: '#BA4896',
    secondary: '#7B2D65',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    light: '#F3F4F6',
    dark: '#1F2937',
    purple: '#9333EA',
    teal: '#14B8A6'
  };

  // Fetch real data from JSON
  const fetchData = async () => {
    setIsLoading(true);
    setDataError(null);
    try {
      // Use PUBLIC_URL for Create React App compatibility
      const jsonPath = `${process.env.PUBLIC_URL}/data/hip-knee-data.json`;
      console.log('📊 Fetching data from:', jsonPath);

      const response = await fetch(jsonPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      const data = await response.json();
      setRealData(data);
      setLastRefresh(new Date());
      console.log('✅ Successfully loaded orthopedic data:', data.metadata);
    } catch (error) {
      console.error('❌ Error fetching orthopedic data:', error);
      setDataError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Calculate total matrix pricing savings
  const calculateMatrixSavings = () => {
    if (!realData?.matrixPricing) return 18.5;
    const total = realData.matrixPricing.reduce((sum, item) => sum + item.potentialSavings, 0);
    return total / 1000000; // Convert to millions
  };

  // Get top vendors sorted by spend
  const getTopVendors = () => {
    if (!realData?.vendors) return ['ZIMMER BIOMET', 'STRYKER', 'J&J'];
    return Object.entries(realData.vendors)
      .sort(([, a], [, b]) => b.totalSpend - a.totalSpend)
      .slice(0, 3)
      .map(([name]) => name);
  };

  // Convert real data regions to regional preference format
  const convertToRegionalData = () => {
    if (!realData?.regions || !realData?.vendors) {
      // Return sample data when regions aren't configured yet
      return [
        { region: 'Mountain', zimmer: 85, stryker: 75, jj: 45, surgeons: 52, repQuality: 'Excellent' },
        { region: 'Western', zimmer: 70, stryker: 82, jj: 60, surgeons: 68, repQuality: 'Good' },
        { region: 'Midwest', zimmer: 78, stryker: 65, jj: 55, surgeons: 51, repQuality: 'Good' }
      ];
    }

    // Process actual regions data when available
    return Object.entries(realData.regions).map(([name, data]) => ({
      region: name,
      zimmer: data.vendorPreferences?.['ZIMMER BIOMET'] || 0,
      stryker: data.vendorPreferences?.['STRYKER'] || 0,
      jj: data.vendorPreferences?.['JOHNSON & JOHNSON'] || 0,
      surgeons: data.surgeons || 0,
      repQuality: data.repQuality || 'Good'
    }));
  };

  // Load scenarios from real data (12 scenarios from hip-knee-data.json)
  const SCENARIOS = useMemo(() => {
    if (!realData?.scenarios) {
      return {}; // Return empty object if no data loaded yet
    }
    // Use generateScenarios to ensure all scenarios have proper structure
    // including savingsRange, volumeWeightedRisk, etc.
    return generateScenarios(realData);
  }, [realData]);

  // Matrix Pricing Component Details from real data
  const MATRIX_COMPONENTS = useMemo(() => {
    if (!realData?.matrixPricing) {
      return {
        hipComponents: [],
        kneeComponents: []
      };
    }

    // Separate hip and knee components
    const hipComponents = realData.matrixPricing
      .filter(item =>
        item.category.toLowerCase().includes('hip') ||
        item.category.toLowerCase().includes('acetabular') ||
        item.category.toLowerCase().includes('femoral head')
      )
      .slice(0, 10)
      .map(item => ({
        component: item.category,
        priceCap: item.matrixPrice,
        currentPrice: item.currentAvgPrice,
        savings: item.potentialSavings / 1000, // Convert to thousands
        savingsPercent: ((item.currentAvgPrice - item.matrixPrice) / item.currentAvgPrice * 100).toFixed(1)
      }));

    const kneeComponents = realData.matrixPricing
      .filter(item =>
        item.category.toLowerCase().includes('knee') ||
        item.category.toLowerCase().includes('tibial') ||
        item.category.toLowerCase().includes('femoral component') ||
        item.category.toLowerCase().includes('patellar')
      )
      .slice(0, 10)
      .map(item => ({
        component: item.category,
        priceCap: item.matrixPrice,
        currentPrice: item.currentAvgPrice,
        savings: item.potentialSavings / 1000,
        savingsPercent: ((item.currentAvgPrice - item.matrixPrice) / item.currentAvgPrice * 100).toFixed(1)
      }));

    return { hipComponents, kneeComponents };
  }, [realData]);

  // Regional surgeon preference data from real data
  const REGIONAL_DATA = useMemo(() => convertToRegionalData(), [realData]);

  // Quintuple Aim scoring (aligned with current scenarios)
  const QUINTUPLE_SCORING = {
    'status-quo': {
      patientExperience: 50,
      populationHealth: 40,
      costReduction: 0,
      providerExperience: 80,
      healthEquity: 50,
      missionBonus: 0,
      total: 45
    },
    'tri-vendor': {
      patientExperience: 82,
      populationHealth: 78,
      costReduction: 68,
      providerExperience: 88,
      healthEquity: 82,
      missionBonus: 12,
      total: 82
    },
    'dual-premium': {
      patientExperience: 85,
      populationHealth: 83,
      costReduction: 70,
      providerExperience: 90,
      healthEquity: 85,
      missionBonus: 12,
      total: 85
    },
    'dual-value': {
      patientExperience: 78,
      populationHealth: 75,
      costReduction: 80,
      providerExperience: 76,
      healthEquity: 78,
      missionBonus: 10,
      total: 78
    },
    'dual-innovation': {
      patientExperience: 80,
      populationHealth: 77,
      costReduction: 76,
      providerExperience: 82,
      healthEquity: 80,
      missionBonus: 11,
      total: 80
    }
  };

  // Calculate adjusted metrics based on what-if parameters
  const getAdjustedMetrics = (scenario) => {
    const base = SCENARIOS[scenario];
    if (!base) return null;

    const adoptionAdjustment = whatIfParams.adoptionModifier / 100;
    const priceAdjustment = whatIfParams.priceErosion / 100;
    const volumeAdjustment = whatIfParams.volumeGrowth / 100;
    const resistanceAdjustment = whatIfParams.surgeonResistance / 100;
    const leverageAdjustment = whatIfParams.negotiationLeverage / 100;

    // Adoption rate affected by surgeon resistance
    const adjustedAdoption = Math.max(0, Math.min(100,
      base.adoptionRate + whatIfParams.adoptionModifier - whatIfParams.surgeonResistance
    ));

    // Savings affected by price erosion, volume growth, and negotiation leverage
    const baseSavings = base.annualSavings * (1 + priceAdjustment);
    const volumeImpact = baseSavings * (1 + volumeAdjustment);
    const leverageImpact = volumeImpact * (1 + leverageAdjustment);
    const adjustedSavings = leverageImpact * (adjustedAdoption / base.adoptionRate);

    return {
      ...base,
      adoptionRate: adjustedAdoption,
      annualSavings: adjustedSavings,
      implementation: {
        ...base.implementation,
        timeline: whatIfParams.implementationMonths
      }
    };
  };

  // Sort and filter scenarios
  const filteredScenarios = useMemo(() => {
    let scenarios = Object.values(SCENARIOS);

    // Apply risk filter
    if (filterRisk !== 'all') {
      scenarios = scenarios.filter(s => s.riskLevel === filterRisk);
    }

    // Apply sorting
    scenarios.sort((a, b) => {
      switch (sortBy) {
        case 'savings':
          return b.annualSavings - a.annualSavings;
        case 'adoption':
          return b.adoptionRate - a.adoptionRate;
        case 'risk':
          return a.riskScore - b.riskScore;
        case 'mission':
          return b.quintupleMissionScore - a.quintupleMissionScore;
        default:
          return 0;
      }
    });

    return scenarios;
  }, [SCENARIOS, sortBy, filterRisk]);

  // Calculate probability-weighted savings
  const getProbabilityWeighted = (scenario) => {
    const s = SCENARIOS[scenario];
    if (!s) return 0;
    return (s.savingsRange.conservative * 0.25) +
           (s.savingsRange.expected * 0.50) +
           (s.savingsRange.optimistic * 0.25);
  };

  // Bookmark current configuration
  const toggleBookmark = () => {
    const config = {
      scenario: selectedScenario,
      tab: activeTab,
      whatIf: whatIfParams,
      timestamp: new Date().toISOString()
    };

    if (bookmarks.find(b => b.scenario === selectedScenario && b.tab === activeTab)) {
      setBookmarks(bookmarks.filter(b => !(b.scenario === selectedScenario && b.tab === activeTab)));
    } else {
      setBookmarks([...bookmarks, config]);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 animate-spin mx-auto mb-4" style={{ color: COLORS.primary }} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading CommonSpirit Data...</h2>
          <p className="text-gray-600">Fetching orthopedic analysis from data source</p>
        </div>
      </div>
    );
  }

  // Error state
  if (dataError && !realData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-900 mb-2 text-center">Data Loading Error</h2>
          <p className="text-red-700 mb-4 text-center">{dataError}</p>
          <div className="bg-red-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800">
              <strong>Issue:</strong> Unable to load orthopedic-data.json from /public directory.
            </p>
            <p className="text-sm text-red-800 mt-2">
              <strong>Solution:</strong> Ensure the file exists at /public/orthopedic-data.json and the development server is running.
            </p>
          </div>
          <button
            onClick={fetchData}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Retry Loading Data
          </button>
        </div>
      </div>
    );
  }

  // Render tab navigation
  const renderTabs = () => {
    // Define all tabs with persona visibility
    const allTabs = [
      { id: 'overview', label: 'Overview', icon: Eye, personas: ['financial', 'operational', 'clinical'] },
      { id: 'financial', label: 'Financial Analysis', icon: DollarSign, personas: ['financial', 'operational'] },
      { id: 'clinical', label: 'Clinical Analysis', icon: Stethoscope, personas: ['clinical'] },
      { id: 'components', label: 'Component Analysis', icon: Package, personas: ['financial', 'operational'] },
      { id: 'risk', label: 'Risk Assessment', icon: Shield, personas: ['financial', 'operational'] },
      { id: 'mission', label: 'Mission Impact', icon: Heart, personas: ['financial', 'clinical'] },
      { id: 'industry', label: 'Industry Intelligence', icon: AlertCircle, personas: ['financial', 'operational'] }
    ];

    // Filter tabs based on current persona
    const tabs = allTabs.filter(tab => tab.personas.includes(persona));

    return (
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  // Executive Summary Card
  const ExecutiveSummaryCard = ({ scenario }) => {
    const s = getAdjustedMetrics(scenario);
    if (!s) return null;

    return (
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 mb-6 border-2 border-purple-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-purple-900">Executive Summary: Scenario {scenario}</h3>
            <p className="text-purple-700 mt-1">{s.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-600">Annual Savings</div>
            <div className="text-2xl font-bold text-green-600">${s.annualSavings.toFixed(2)}M</div>
            <div className="text-xs text-gray-500 mt-1">Probability-weighted: ${getProbabilityWeighted(scenario).toFixed(2)}M</div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-600">Adoption Rate</div>
            <div className="text-2xl font-bold text-blue-600">{s.adoptionRate.toFixed(0)}%</div>
            <div className="text-xs text-gray-500 mt-1">
              {realData ? Math.round(realData.metadata.totalCases * s.adoptionRate / 100).toLocaleString() : 0} procedures
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-600">Risk Level</div>
            <div className={`text-2xl font-bold ${
              s.riskLevel === 'low' ? 'text-green-600' :
              s.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {s.riskLevel.charAt(0).toUpperCase() + s.riskLevel.slice(1)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Score: {s.riskScore}/10</div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-600">Mission Score</div>
            <div className="text-2xl font-bold text-purple-600">{s.quintupleMissionScore}/100</div>
            <div className="text-xs text-gray-500 mt-1">Quintuple Aim aligned</div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-white rounded-lg">
          <div className="font-medium text-gray-900 mb-2">Key Recommendation:</div>
          <p className="text-sm text-gray-700">{s.description}</p>
        </div>
      </div>
    );
  };

  // OVERVIEW TAB
  const renderOverviewTab = () => (
    <div className="space-y-6">
      <ExecutiveSummaryCard scenario={selectedScenario} />

      {/* Real Data Indicators */}
      {realData && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <div className="font-bold text-green-900">Real CommonSpirit Data Loaded</div>
                <div className="text-sm text-green-700">
                  {realData.metadata.totalCases.toLocaleString()} cases |
                  ${(realData.metadata.totalSpend / 1000000).toFixed(2)}M total spend |
                  Last updated: {new Date(realData.metadata.lastUpdated).toLocaleString()}
                </div>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Scenario Comparison Table */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" style={{ color: COLORS.primary }} />
            Scenario Comparison Table
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button
              onClick={() => setComparisonMode(!comparisonMode)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
            >
              <Eye className="w-4 h-4" />
              {comparisonMode ? 'Exit' : 'Compare'}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="savings">Annual Savings</option>
                <option value="adoption">Adoption Rate</option>
                <option value="risk">Risk Level</option>
                <option value="mission">Mission Score</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter Risk</label>
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="all">All Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Procedure Type</label>
              <select
                value={filterProcedureType}
                onChange={(e) => setFilterProcedureType(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="all">All Procedures</option>
                <option value="primary">Primary Only</option>
                <option value="revision">Revision Only</option>
              </select>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="px-4 py-3 text-left font-bold text-gray-900 sticky left-0 bg-gray-100 z-10 min-w-[180px]">
                  Metric
                </th>
                {filteredScenarios.map(scenario => (
                  <th
                    key={scenario.id}
                    className={`px-4 py-3 text-center font-bold text-gray-900 min-w-[200px] cursor-pointer hover:bg-gray-200 ${
                      selectedScenario === scenario.id ? 'bg-purple-100' : ''
                    }`}
                    onClick={() => setSelectedScenario(scenario.id)}
                  >
                    <div className="font-bold text-base">{scenario.shortName}</div>
                    <div className="text-xs text-gray-500 font-normal mt-1">{scenario.vendorCount} vendors</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Annual Savings Row */}
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-4 font-semibold text-gray-700 sticky left-0 bg-white z-10">
                  Annual Savings
                </td>
                {filteredScenarios.map(scenario => (
                  <td
                    key={scenario.id}
                    className={`px-4 py-4 text-center ${selectedScenario === scenario.id ? 'bg-purple-50' : ''}`}
                  >
                    <div className="font-bold text-green-600 text-lg">${scenario.annualSavings.toFixed(2)}M</div>
                    <div className="text-xs text-gray-500 mt-1">
                      ${scenario.savingsRange.conservative.toFixed(2)}M - ${scenario.savingsRange.optimistic.toFixed(2)}M
                    </div>
                  </td>
                ))}
              </tr>

              {/* Expected Value Row */}
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-4 font-semibold text-gray-700 sticky left-0 bg-white z-10">
                  Probability-Weighted
                </td>
                {filteredScenarios.map(scenario => (
                  <td
                    key={scenario.id}
                    className={`px-4 py-4 text-center ${selectedScenario === scenario.id ? 'bg-purple-50' : ''}`}
                  >
                    <div className="font-bold text-blue-600 text-lg">${getProbabilityWeighted(scenario.id).toFixed(2)}M</div>
                  </td>
                ))}
              </tr>

              {/* Adoption Rate Row */}
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-4 font-semibold text-gray-700 sticky left-0 bg-white z-10">
                  Adoption Rate
                </td>
                {filteredScenarios.map(scenario => (
                  <td
                    key={scenario.id}
                    className={`px-4 py-4 ${selectedScenario === scenario.id ? 'bg-purple-50' : ''}`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-full max-w-[120px] bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full transition-all"
                          style={{
                            width: `${scenario.adoptionRate}%`,
                            backgroundColor: scenario.adoptionRate >= 85 ? COLORS.success :
                                           scenario.adoptionRate >= 70 ? COLORS.warning : COLORS.danger
                          }}
                        />
                      </div>
                      <span className="font-bold text-gray-900">{scenario.adoptionRate.toFixed(0)}%</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Risk Level Row */}
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-4 font-semibold text-gray-700 sticky left-0 bg-white z-10">
                  Risk Level
                </td>
                {filteredScenarios.map(scenario => (
                  <td
                    key={scenario.id}
                    className={`px-4 py-4 text-center ${selectedScenario === scenario.id ? 'bg-purple-50' : ''}`}
                  >
                    <div className="flex justify-center">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                        scenario.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                        scenario.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {scenario.riskLevel.charAt(0).toUpperCase() + scenario.riskLevel.slice(1)}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* NPV 5-Year Row */}
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-4 font-semibold text-gray-700 sticky left-0 bg-white z-10">
                  5-Year NPV
                </td>
                {filteredScenarios.map(scenario => (
                  <td
                    key={scenario.id}
                    className={`px-4 py-4 text-center ${selectedScenario === scenario.id ? 'bg-purple-50' : ''}`}
                  >
                    <div className="font-bold text-purple-600 text-lg">
                      ${scenario.npv5Year?.toFixed(2) || '0.00'}M
                    </div>
                  </td>
                ))}
              </tr>

              {/* Mission Score Row */}
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-4 font-semibold text-gray-700 sticky left-0 bg-white z-10">
                  Quintuple Aim Score
                </td>
                {filteredScenarios.map(scenario => (
                  <td
                    key={scenario.id}
                    className={`px-4 py-4 text-center ${selectedScenario === scenario.id ? 'bg-purple-50' : ''}`}
                  >
                    <div className="font-bold text-gray-900 text-lg">
                      {scenario.quintupleMissionScore || 0}/100
                    </div>
                  </td>
                ))}
              </tr>

              {/* Pricing Cap Section Header */}
              <tr className="bg-blue-50 border-t-2 border-blue-200">
                <td colSpan={filteredScenarios.length + 1} className="px-4 py-2">
                  <div className="font-bold text-blue-900 text-sm uppercase tracking-wide">
                    + Pricing Cap Strategy (Additional Savings Potential)
                  </div>
                </td>
              </tr>

              {/* Pricing Cap Feasibility Row */}
              <tr className="border-b hover:bg-gray-50 bg-blue-25">
                <td className="px-4 py-4 font-semibold text-gray-700 sticky left-0 bg-white z-10">
                  Pricing Cap Feasibility
                </td>
                {filteredScenarios.map(scenario => (
                  <td
                    key={scenario.id}
                    className={`px-4 py-4 text-center ${selectedScenario === scenario.id ? 'bg-purple-50' : ''}`}
                  >
                    <div className="font-bold text-blue-600 text-lg">
                      {scenario.pricingCap?.feasibilityPercent || 0}%
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {scenario.pricingCap?.rationale || 'Calculating...'}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Additional Pricing Cap Savings Row */}
              <tr className="border-b hover:bg-gray-50 bg-blue-25">
                <td className="px-4 py-4 font-semibold text-gray-700 sticky left-0 bg-white z-10">
                  + Pricing Cap Savings
                </td>
                {filteredScenarios.map(scenario => (
                  <td
                    key={scenario.id}
                    className={`px-4 py-4 text-center ${selectedScenario === scenario.id ? 'bg-purple-50' : ''}`}
                  >
                    <div className="font-bold text-blue-600 text-lg">
                      +${(scenario.pricingCap?.expectedSavings || 0).toFixed(2)}M
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      of ${(scenario.pricingCap?.potentialSavings || 0).toFixed(2)}M potential
                    </div>
                  </td>
                ))}
              </tr>

              {/* Total Potential Savings Row */}
              <tr className="border-b-2 border-blue-300 bg-blue-100 font-bold">
                <td className="px-4 py-4 font-bold text-blue-900 sticky left-0 bg-blue-100 z-10">
                  = Total Potential Savings
                </td>
                {filteredScenarios.map(scenario => (
                  <td
                    key={scenario.id}
                    className={`px-4 py-4 text-center ${selectedScenario === scenario.id ? 'bg-purple-100' : ''}`}
                  >
                    <div className="font-bold text-blue-900 text-xl">
                      ${(scenario.totalPotentialSavings || 0).toFixed(2)}M
                    </div>
                    <div className="text-xs text-blue-700 mt-1">
                      Base: ${scenario.annualSavings.toFixed(2)}M + Cap: ${(scenario.pricingCap?.expectedSavings || 0).toFixed(2)}M
                    </div>
                  </td>
                ))}
              </tr>

              {/* Action Row */}
              <tr className="bg-gray-50">
                <td className="px-4 py-4 font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10">
                  Actions
                </td>
                {filteredScenarios.map(scenario => (
                  <td
                    key={scenario.id}
                    className={`px-4 py-4 text-center ${selectedScenario === scenario.id ? 'bg-purple-50' : ''}`}
                  >
                    <button
                      onClick={() => {
                        setSelectedScenario(scenario.id);
                        setActiveTab('financial');
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
                    >
                      Analyze
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk vs Reward Heatmap */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Target className="w-6 h-6" style={{ color: COLORS.primary }} />
          Risk vs Reward Heatmap
        </h2>
        <p className="text-gray-600 mb-6">
          Strategic positioning of scenarios. Darker green = optimal (high savings, low risk). Select cells show scenario names and metrics.
        </p>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Grid Header */}
            <div className="flex items-end mb-2">
              <div className="w-32"></div>
              <div className="flex-1 text-center">
                <div className="font-bold text-sm text-gray-700 mb-2">Annual Savings Potential →</div>
                <div className="grid grid-cols-5 gap-1">
                  <div className="text-xs text-gray-600 text-center">0-5%</div>
                  <div className="text-xs text-gray-600 text-center">5-12%</div>
                  <div className="text-xs text-gray-600 text-center">12-18%</div>
                  <div className="text-xs text-gray-600 text-center">18-22%</div>
                  <div className="text-xs text-gray-600 text-center">22%+</div>
                </div>
              </div>
            </div>

            {/* Grid Body */}
            <div className="flex">
              {/* Y-axis label */}
              <div className="w-32 flex items-center justify-center">
                <div className="transform -rotate-90 whitespace-nowrap font-bold text-sm text-gray-700">
                  ← Risk Score (Lower is Better)
                </div>
              </div>

              {/* Grid cells */}
              <div className="flex-1">
                {/* Risk levels from low to high (top to bottom) */}
                {[
                  { label: 'Very Low (0-2)', min: 0, max: 2 },
                  { label: 'Low (2-4)', min: 2, max: 4 },
                  { label: 'Medium (4-6)', min: 4, max: 6 },
                  { label: 'High (6-8)', min: 6, max: 8 },
                  { label: 'Very High (8-10)', min: 8, max: 10 }
                ].map((riskRow, rowIdx) => (
                  <div key={rowIdx} className="flex gap-1 mb-1">
                    <div className="w-24 flex items-center justify-end pr-3">
                      <span className="text-xs text-gray-600">{riskRow.label}</span>
                    </div>
                    {/* Savings columns */}
                    {[
                      { min: 0, max: 5 },
                      { min: 5, max: 12 },
                      { min: 12, max: 18 },
                      { min: 18, max: 22 },
                      { min: 22, max: 100 }
                    ].map((savingsCol, colIdx) => {
                      const scenariosInCell = Object.values(SCENARIOS).filter(s => {
                        const savingsPercent = (s.savingsPercent || 0) * 100; // Convert to percentage
                        const risk = s.riskScore || 0;
                        return savingsPercent >= savingsCol.min && savingsPercent < savingsCol.max &&
                               risk >= riskRow.min && risk < riskRow.max;
                      });

                      const rewardScore = colIdx;
                      const riskScore = 4 - rowIdx;
                      const heatScore = rewardScore + riskScore;

                      let bgColor = '';
                      if (heatScore >= 7) bgColor = 'bg-green-100 border-green-300';
                      else if (heatScore >= 6) bgColor = 'bg-green-50 border-green-200';
                      else if (heatScore >= 5) bgColor = 'bg-yellow-50 border-yellow-200';
                      else if (heatScore >= 4) bgColor = 'bg-orange-50 border-orange-200';
                      else if (heatScore >= 3) bgColor = 'bg-red-50 border-red-200';
                      else bgColor = 'bg-red-100 border-red-300';

                      return (
                        <div
                          key={colIdx}
                          className={`flex-1 min-h-[100px] border-2 ${bgColor} rounded-lg p-2 flex flex-col items-center justify-center`}
                        >
                          {scenariosInCell.length > 0 ? (
                            <div className="text-center w-full space-y-1">
                              {scenariosInCell.map((s, idx) => (
                                <div key={idx} className="mb-2">
                                  <div
                                    className={`text-xs font-bold px-2 py-1 rounded mb-1 ${
                                      s.id === selectedScenario ? 'bg-purple-600 text-white' : 'bg-white text-gray-800'
                                    }`}
                                  >
                                    {s.shortName}
                                  </div>
                                  <div className="text-xs text-gray-700 font-medium">
                                    {(s.savingsPercent * 100).toFixed(0)}% / {s.riskScore.toFixed(1)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center px-1">
                              <div className="text-xs text-gray-500 font-medium leading-tight">
                                {heatScore >= 7 && '🎯 Ideal'}
                                {heatScore === 6 && '✓ Strong'}
                                {heatScore === 5 && '⚖️ Balanced'}
                                {heatScore === 4 && '⚠️ Careful'}
                                {heatScore === 3 && '🔴 Unfavorable'}
                                {heatScore <= 2 && '❌ Avoid'}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 grid grid-cols-6 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 border-2 border-green-300 rounded"></div>
                <span className="text-xs text-gray-700">Optimal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-50 border-2 border-green-200 rounded"></div>
                <span className="text-xs text-gray-700">Favorable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-50 border-2 border-yellow-200 rounded"></div>
                <span className="text-xs text-gray-700">Balanced</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-50 border-2 border-orange-200 rounded"></div>
                <span className="text-xs text-gray-700">Cautious</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-50 border-2 border-red-200 rounded"></div>
                <span className="text-xs text-gray-700">Unfavorable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-100 border-2 border-red-300 rounded"></div>
                <span className="text-xs text-gray-700">High Risk</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Switching Burden Heatmap */}
      <RegionSwitchingHeatmap />
    </div>
  );

  // Note: The rest of the render functions (Financial, Matrix, Risk, Mission, Decision tabs)
  // remain the same as before, but now use the dynamically loaded SCENARIOS data
  // For brevity, I'm including just the key parts that demonstrate real data usage

  // CLINICAL ANALYSIS TAB - Comprehensive Provider Impact Assessment
  const renderClinicalTab = () => {
    const scenario = SCENARIOS[selectedScenario];
    if (!scenario || !realData?.surgeons) {
      return <div className="p-6 text-gray-500">Loading clinical impact data...</div>;
    }

    const scenarioVendors = scenario.vendors || [];
    const totalSurgeons = realData.surgeons.length;
    const totalCases = realData.metadata?.totalCases || 0;

    // Categorize surgeons by volume
    const HIGH_VOLUME_THRESHOLD = 200; // cases/year
    const MEDIUM_VOLUME_THRESHOLD = 50;
    const LOYALTY_THRESHOLD = 0.70; // 70%+ preference for single vendor

    // Analyze each surgeon's impact
    const surgeonImpact = realData.surgeons.map(surgeon => {
      const volume = surgeon.totalCases || 0;
      const volumeCategory = volume >= HIGH_VOLUME_THRESHOLD ? 'high' :
                            volume >= MEDIUM_VOLUME_THRESHOLD ? 'medium' : 'low';
      const primaryVendor = surgeon.primaryVendor || 'Unknown';
      const primaryVendorPercent = surgeon.primaryVendorPercent || 0;
      const isLoyalist = primaryVendorPercent >= LOYALTY_THRESHOLD;
      const mustTransition = !scenarioVendors.includes(primaryVendor);

      return {
        ...surgeon,
        volume,
        volumeCategory,
        primaryVendor,
        primaryVendorPercent,
        isLoyalist,
        mustTransition,
        impactScore: mustTransition ? (volume * (isLoyalist ? 2 : 1)) : 0
      };
    });

    // Filter surgeons who must transition
    const surgeonsNeedingTransition = surgeonImpact.filter(s => s.mustTransition);
    const highVolumeLoyalists = surgeonsNeedingTransition.filter(s =>
      s.volumeCategory === 'high' && s.isLoyalist
    );

    // Group by region
    const regionalImpact = {};
    surgeonImpact.forEach(surgeon => {
      const region = surgeon.region || 'Unassigned';
      if (!regionalImpact[region]) {
        regionalImpact[region] = {
          totalSurgeons: 0,
          needingTransition: 0,
          highVolumeLoyalists: 0,
          casesAtRisk: 0
        };
      }
      regionalImpact[region].totalSurgeons++;
      if (surgeon.mustTransition) {
        regionalImpact[region].needingTransition++;
        regionalImpact[region].casesAtRisk += surgeon.volume;
        if (surgeon.volumeCategory === 'high' && surgeon.isLoyalist) {
          regionalImpact[region].highVolumeLoyalists++;
        }
      }
    });

    // Group by hospital
    const hospitalImpact = {};
    surgeonImpact.forEach(surgeon => {
      const facility = surgeon.facility || 'Unassigned';
      if (!hospitalImpact[facility]) {
        hospitalImpact[facility] = {
          region: surgeon.region || 'Unassigned',
          totalSurgeons: 0,
          needingTransition: 0,
          highVolumeLoyalists: 0,
          loyalistsNeedingTransition: 0,
          casesAtRisk: 0,
          vendorDiversity: new Set(),
          transitioningVendors: new Set()
        };
      }
      hospitalImpact[facility].totalSurgeons++;
      hospitalImpact[facility].vendorDiversity.add(surgeon.primaryVendor);

      if (surgeon.mustTransition) {
        hospitalImpact[facility].needingTransition++;
        hospitalImpact[facility].casesAtRisk += surgeon.volume;
        hospitalImpact[facility].transitioningVendors.add(surgeon.primaryVendor);
        if (surgeon.isLoyalist) {
          hospitalImpact[facility].loyalistsNeedingTransition++;
        }
        if (surgeon.volumeCategory === 'high' && surgeon.isLoyalist) {
          hospitalImpact[facility].highVolumeLoyalists++;
        }
      }
    });

    // Identify hospitals with "peer sherpa" opportunities (mixed vendor loyalists)
    const hospitalsWithMixedLoyalists = Object.entries(hospitalImpact)
      .filter(([_, data]) => {
        // Hospital has surgeons transitioning AND surgeons staying (good peer sherpa opportunity)
        const hasMix = data.loyalistsNeedingTransition > 0 &&
                      (data.totalSurgeons - data.needingTransition) > 0;
        return hasMix;
      })
      .map(([facility, data]) => ({
        facility,
        ...data,
        peerSherpaScore: (data.totalSurgeons - data.needingTransition) / data.loyalistsNeedingTransition
      }))
      .sort((a, b) => b.loyalistsNeedingTransition - a.loyalistsNeedingTransition);

    // Top high-risk hospitals (most high-volume loyalists needing transition)
    const topRiskHospitals = Object.entries(hospitalImpact)
      .filter(([_, data]) => data.highVolumeLoyalists > 0)
      .map(([facility, data]) => ({ facility, ...data }))
      .sort((a, b) => b.casesAtRisk - a.casesAtRisk)
      .slice(0, 10);

    // Quality metrics - using placeholder/dummy data for demonstration
    const qualityMetrics = realData?.qualityMetrics || {
      // ⚠️ PLACEHOLDER DATA - Awaiting integration with clinical data systems
      revisionRate: 2.3, // % - industry benchmark ~2-3%
      readmissionRate30Day: 4.1, // % - 30-day all-cause readmission
      readmissionRate90Day: 6.8, // % - 90-day all-cause readmission
      avgLengthOfStay: 2.1, // days
      complicationRate: 3.2, // % - any complication
      infectionRate: 0.8, // % - surgical site infection
      benchmarkRevisionRate: 2.5,
      benchmarkReadmission30: 5.2,
      benchmarkReadmission90: 7.5,
      benchmarkLOS: 2.4,
      benchmarkComplicationRate: 4.0,
      benchmarkInfectionRate: 1.2,
      dataSource: "PLACEHOLDER - Awaiting EMR/Registry Integration",
      lastUpdated: null
    };

    return (
      <div className="space-y-6">
        {/* Scenario Context */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Clinical Deep Dive: {scenario.shortName}</h2>
          <p className="text-blue-100 text-sm">Comprehensive provider impact assessment for vendor consolidation</p>
        </div>

        {/* High-Level Impact Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
            <div className="text-sm text-gray-600 mb-1">Surgeons Needing Transition</div>
            <div className="text-4xl font-bold text-red-600">{surgeonsNeedingTransition.length}</div>
            <div className="text-xs text-gray-500 mt-1">
              {((surgeonsNeedingTransition.length / totalSurgeons) * 100).toFixed(1)}% of total
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
            <div className="text-sm text-gray-600 mb-1">High-Volume Loyalists</div>
            <div className="text-4xl font-bold text-orange-600">{highVolumeLoyalists.length}</div>
            <div className="text-xs text-gray-500 mt-1">
              Require intensive support
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
            <div className="text-sm text-gray-600 mb-1">Cases at Risk</div>
            <div className="text-4xl font-bold text-purple-600">
              {surgeonsNeedingTransition.reduce((sum, s) => sum + s.volume, 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Annual procedures affected
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
            <div className="text-sm text-gray-600 mb-1">Peer Sherpa Sites</div>
            <div className="text-4xl font-bold text-green-600">{hospitalsWithMixedLoyalists.length}</div>
            <div className="text-xs text-gray-500 mt-1">
              Hospitals with transition support
            </div>
          </div>
        </div>

        {/* Regional Impact Analysis */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-purple-600" />
            Impact by Region
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-purple-100 border-b-2 border-purple-300">
                  <th className="text-left p-4 font-bold text-purple-900">Region</th>
                  <th className="text-center p-4 font-bold text-purple-900">Total Surgeons</th>
                  <th className="text-center p-4 font-bold text-purple-900">Need Transition</th>
                  <th className="text-center p-4 font-bold text-purple-900">High-Vol Loyalists</th>
                  <th className="text-center p-4 font-bold text-purple-900">Cases at Risk</th>
                  <th className="text-left p-4 font-bold text-purple-900">Impact Level</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(regionalImpact)
                  .sort((a, b) => b[1].casesAtRisk - a[1].casesAtRisk)
                  .map(([region, data]) => {
                    const impactPercent = (data.needingTransition / data.totalSurgeons) * 100;
                    return (
                      <tr key={region} className="border-b border-gray-200 hover:bg-purple-50">
                        <td className="p-4 font-semibold text-gray-900">{region}</td>
                        <td className="p-4 text-center text-gray-900">{data.totalSurgeons}</td>
                        <td className="p-4 text-center">
                          <span className="font-bold text-red-600">{data.needingTransition}</span>
                          <span className="text-xs text-gray-500 ml-2">({impactPercent.toFixed(0)}%)</span>
                        </td>
                        <td className="p-4 text-center font-bold text-orange-600">{data.highVolumeLoyalists}</td>
                        <td className="p-4 text-center font-bold text-purple-600">{data.casesAtRisk.toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            impactPercent >= 40 ? 'bg-red-100 text-red-800' :
                            impactPercent >= 25 ? 'bg-orange-100 text-orange-800' :
                            impactPercent >= 10 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {impactPercent >= 40 ? 'High' :
                             impactPercent >= 25 ? 'Moderate' :
                             impactPercent >= 10 ? 'Low' : 'Minimal'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* High-Risk Hospitals */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building className="w-6 h-6 text-red-600" />
            Hospitals with Highest Impact
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Facilities with the most high-volume vendor loyalists requiring transition
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-red-100 border-b-2 border-red-300">
                  <th className="text-left p-4 font-bold text-red-900">Hospital</th>
                  <th className="text-center p-4 font-bold text-red-900">Region</th>
                  <th className="text-center p-4 font-bold text-red-900">High-Vol Loyalists</th>
                  <th className="text-center p-4 font-bold text-red-900">Total Transitioning</th>
                  <th className="text-center p-4 font-bold text-red-900">Cases at Risk</th>
                </tr>
              </thead>
              <tbody>
                {topRiskHospitals.map((hospital, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-red-50">
                    <td className="p-4 font-semibold text-gray-900">{hospital.facility}</td>
                    <td className="p-4 text-center text-gray-700">{hospital.region}</td>
                    <td className="p-4 text-center">
                      <span className="font-bold text-2xl text-orange-600">{hospital.highVolumeLoyalists}</span>
                    </td>
                    <td className="p-4 text-center font-bold text-red-600">{hospital.needingTransition}</td>
                    <td className="p-4 text-center font-bold text-purple-600">{hospital.casesAtRisk.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Peer Sherpa Opportunities */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-green-300">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-green-600" />
            Peer Sherpa Opportunities (Mixed Vendor Hospitals)
          </h3>
          <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-lg mb-4">
            <p className="text-sm text-green-800">
              <strong>Peer Sherpas:</strong> These hospitals have surgeons who are STAYING with their current vendors (aligned with scenario) who can mentor and support colleagues who need to transition. This peer-to-peer approach significantly increases adoption success rates.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-green-100 border-b-2 border-green-300">
                  <th className="text-left p-4 font-bold text-green-900">Hospital</th>
                  <th className="text-center p-4 font-bold text-green-900">Region</th>
                  <th className="text-center p-4 font-bold text-green-900">Loyalists Transitioning</th>
                  <th className="text-center p-4 font-bold text-green-900">Potential Sherpas</th>
                  <th className="text-center p-4 font-bold text-green-900">Sherpa Ratio</th>
                  <th className="text-left p-4 font-bold text-green-900">Opportunity Level</th>
                </tr>
              </thead>
              <tbody>
                {hospitalsWithMixedLoyalists.slice(0, 15).map((hospital, idx) => {
                  const potentialSherpas = hospital.totalSurgeons - hospital.needingTransition;
                  const sherpaRatio = hospital.peerSherpaScore;
                  return (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-green-50">
                      <td className="p-4 font-semibold text-gray-900">{hospital.facility}</td>
                      <td className="p-4 text-center text-gray-700">{hospital.region}</td>
                      <td className="p-4 text-center font-bold text-orange-600">{hospital.loyalistsNeedingTransition}</td>
                      <td className="p-4 text-center font-bold text-green-600">{potentialSherpas}</td>
                      <td className="p-4 text-center">
                        <span className="font-bold text-blue-600">{sherpaRatio.toFixed(1)}:1</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          sherpaRatio >= 2 ? 'bg-green-100 text-green-800' :
                          sherpaRatio >= 1 ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {sherpaRatio >= 2 ? 'Excellent' :
                           sherpaRatio >= 1 ? 'Good' : 'Fair'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Regional Heat Map */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-600" />
            Regional Transition Heat Map
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(regionalImpact)
              .sort((a, b) => b[1].casesAtRisk - a[1].casesAtRisk)
              .map(([region, data]) => {
                const impactPercent = (data.needingTransition / data.totalSurgeons) * 100;
                const maxCases = Math.max(...Object.values(regionalImpact).map(r => r.casesAtRisk));
                const barWidth = (data.casesAtRisk / maxCases) * 100;

                return (
                  <div key={region} className="border-l-4 border-purple-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-gray-900">{region}</div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          <span className="font-bold text-red-600">{data.needingTransition}</span> / {data.totalSurgeons} surgeons
                        </span>
                        <span className="text-gray-600">
                          <span className="font-bold text-purple-600">{data.casesAtRisk.toLocaleString()}</span> cases
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-8 relative">
                      <div
                        className={`h-8 rounded-full flex items-center justify-end pr-3 text-white font-bold text-sm ${
                          impactPercent >= 40 ? 'bg-red-500' :
                          impactPercent >= 25 ? 'bg-orange-500' :
                          impactPercent >= 10 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${barWidth}%` }}
                      >
                        {impactPercent.toFixed(0)}% Impact
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Quality Metrics Overview - Moved to bottom */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Quality & Outcomes Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Revision Rate */}
            <div className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Revision Rate</div>
              <div className="text-2xl font-bold text-green-900">{qualityMetrics.revisionRate}%</div>
              <div className="text-xs text-gray-500 mt-1">vs {qualityMetrics.benchmarkRevisionRate}% benchmark</div>
              <div className={`text-xs font-semibold mt-2 ${
                qualityMetrics.revisionRate < qualityMetrics.benchmarkRevisionRate
                  ? 'text-green-600'
                  : 'text-amber-600'
              }`}>
                {qualityMetrics.revisionRate < qualityMetrics.benchmarkRevisionRate ? '✓ Better' : '⚠ Monitor'}
              </div>
            </div>

            {/* 30-Day Readmission */}
            <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">30-Day Readmit</div>
              <div className="text-2xl font-bold text-blue-900">{qualityMetrics.readmissionRate30Day}%</div>
              <div className="text-xs text-gray-500 mt-1">vs {qualityMetrics.benchmarkReadmission30}% benchmark</div>
              <div className={`text-xs font-semibold mt-2 ${
                qualityMetrics.readmissionRate30Day < qualityMetrics.benchmarkReadmission30
                  ? 'text-green-600'
                  : 'text-amber-600'
              }`}>
                {qualityMetrics.readmissionRate30Day < qualityMetrics.benchmarkReadmission30 ? '✓ Better' : '⚠ Monitor'}
              </div>
            </div>

            {/* 90-Day Readmission */}
            <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">90-Day Readmit</div>
              <div className="text-2xl font-bold text-purple-900">{qualityMetrics.readmissionRate90Day}%</div>
              <div className="text-xs text-gray-500 mt-1">vs {qualityMetrics.benchmarkReadmission90}% benchmark</div>
              <div className={`text-xs font-semibold mt-2 ${
                qualityMetrics.readmissionRate90Day < qualityMetrics.benchmarkReadmission90
                  ? 'text-green-600'
                  : 'text-amber-600'
              }`}>
                {qualityMetrics.readmissionRate90Day < qualityMetrics.benchmarkReadmission90 ? '✓ Better' : '⚠ Monitor'}
              </div>
            </div>

            {/* Length of Stay */}
            <div className="bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Avg Length of Stay</div>
              <div className="text-2xl font-bold text-amber-900">{qualityMetrics.avgLengthOfStay} days</div>
              <div className="text-xs text-gray-500 mt-1">vs {qualityMetrics.benchmarkLOS} days benchmark</div>
              <div className={`text-xs font-semibold mt-2 ${
                qualityMetrics.avgLengthOfStay < qualityMetrics.benchmarkLOS
                  ? 'text-green-600'
                  : 'text-amber-600'
              }`}>
                {qualityMetrics.avgLengthOfStay < qualityMetrics.benchmarkLOS ? '✓ Better' : '⚠ Monitor'}
              </div>
            </div>

            {/* Complication Rate */}
            <div className="bg-gradient-to-br from-red-50 to-white border-2 border-red-200 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Complication Rate</div>
              <div className="text-2xl font-bold text-red-900">{qualityMetrics.complicationRate}%</div>
              <div className="text-xs text-gray-500 mt-1">vs {qualityMetrics.benchmarkComplicationRate}% benchmark</div>
              <div className={`text-xs font-semibold mt-2 ${
                qualityMetrics.complicationRate < qualityMetrics.benchmarkComplicationRate
                  ? 'text-green-600'
                  : 'text-amber-600'
              }`}>
                {qualityMetrics.complicationRate < qualityMetrics.benchmarkComplicationRate ? '✓ Better' : '⚠ Monitor'}
              </div>
            </div>

            {/* Infection Rate */}
            <div className="bg-gradient-to-br from-pink-50 to-white border-2 border-pink-200 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Infection Rate (SSI)</div>
              <div className="text-2xl font-bold text-pink-900">{qualityMetrics.infectionRate}%</div>
              <div className="text-xs text-gray-500 mt-1">vs {qualityMetrics.benchmarkInfectionRate}% benchmark</div>
              <div className={`text-xs font-semibold mt-2 ${
                qualityMetrics.infectionRate < qualityMetrics.benchmarkInfectionRate
                  ? 'text-green-600'
                  : 'text-amber-600'
              }`}>
                {qualityMetrics.infectionRate < qualityMetrics.benchmarkInfectionRate ? '✓ Better' : '⚠ Monitor'}
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  };

  // COMPONENT ANALYSIS TAB - Simplified version
  const renderComponentTab = () => {
    const components = realData?.matrixPricing || [];
    const totalSavings = components.reduce((sum, item) => sum + item.potentialSavings, 0);

    // Classification helpers
    const hipKeywords = ['hip', 'femoral head', 'acetabular', 'stem', 'cup', 'bi polar', 'uni polar'];
    const kneeKeywords = ['knee', 'tibial', 'femoral component', 'patella', 'bearing', 'tray'];

    const isHip = (category) => {
      const cat = category.toLowerCase();
      return hipKeywords.some(k => cat.includes(k)) && !cat.includes('knee');
    };

    const isKnee = (category) => {
      const cat = category.toLowerCase();
      return kneeKeywords.some(k => cat.includes(k));
    };

    const isPrimary = (category) => !category.toLowerCase().includes('revision');
    const isRevision = (category) => category.toLowerCase().includes('revision');

    // Group components
    const hipPrimary = components.filter(c => isHip(c.category) && isPrimary(c.category));
    const hipRevision = components.filter(c => isHip(c.category) && isRevision(c.category));
    const kneePrimary = components.filter(c => isKnee(c.category) && isPrimary(c.category));
    const kneeRevision = components.filter(c => isKnee(c.category) && isRevision(c.category));

    const renderComponentTable = (componentList, title, bgColor, borderColor) => {
      const groupSavings = componentList.reduce((sum, item) => sum + item.potentialSavings, 0);

      return (
        <div className={`rounded-lg p-4 ${bgColor} border-2 ${borderColor}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <div className="text-right">
              <div className="text-xl font-bold text-green-600">
                ${(groupSavings / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-gray-600">{componentList.length} categories</div>
            </div>
          </div>

          <div className="bg-white rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-3 py-2 text-left font-bold">#</th>
                  <th className="px-3 py-2 text-left font-bold">Component</th>
                  <th className="px-3 py-2 text-right font-bold">Current</th>
                  <th className="px-3 py-2 text-right font-bold">Target</th>
                  <th className="px-3 py-2 text-right font-bold">Savings %</th>
                  <th className="px-3 py-2 text-right font-bold">Potential</th>
                </tr>
              </thead>
              <tbody>
                {componentList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-3 py-4 text-center text-gray-500 text-sm">
                      No components in this category
                    </td>
                  </tr>
                ) : (
                  componentList.map((item, idx) => {
                    const savingsPercent = ((item.currentAvgPrice - item.matrixPrice) / item.currentAvgPrice * 100).toFixed(1);
                    return (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                        <td className="px-3 py-2 font-medium text-gray-900">{item.category}</td>
                        <td className="px-3 py-2 text-right text-gray-600">${item.currentAvgPrice.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right font-medium text-green-600">
                          ${item.matrixPrice.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-bold text-xs">
                            {savingsPercent}%
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-green-600">
                          ${(item.potentialSavings / 1000).toFixed(0)}K
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <ExecutiveSummaryCard scenario={selectedScenario} />

        {/* Component-Level Savings Analysis */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Package className="w-6 h-6" style={{ color: COLORS.primary }} />
            Component Pricing Opportunities by Procedure & Type
          </h2>
          <p className="text-gray-600 mb-6">
            Component-level pricing opportunities grouped by hip/knee procedures and primary/revision types
          </p>

          {/* Total Savings Summary */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 mb-6 border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-green-900 mb-1">Total Component Savings Potential</h3>
                <p className="text-3xl font-bold text-green-700">${(totalSavings / 1000000).toFixed(2)}M</p>
                <p className="text-sm text-green-600 mt-1">{components.length} component categories analyzed</p>
              </div>
              <TrendingUp className="w-16 h-16 text-green-500 opacity-50" />
            </div>
          </div>

          {/* Hip Components */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              Hip Procedures
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {renderComponentTable(hipPrimary, 'Hip Primary', 'bg-blue-50', 'border-blue-200')}
              {renderComponentTable(hipRevision, 'Hip Revision', 'bg-amber-50', 'border-amber-200')}
            </div>
          </div>

          {/* Knee Components */}
          <div>
            <h3 className="text-xl font-bold text-teal-900 mb-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
              Knee Procedures
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {renderComponentTable(kneePrimary, 'Knee Primary', 'bg-teal-50', 'border-teal-200')}
              {renderComponentTable(kneeRevision, 'Knee Revision', 'bg-orange-50', 'border-orange-200')}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // FINANCIAL ANALYSIS TAB
  const renderFinancialTab = () => (
    <div className="space-y-6">
      <ExecutiveSummaryCard scenario={selectedScenario} />

      {/* Risk/Reward Heatmap Grid */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Target className="w-6 h-6" style={{ color: COLORS.primary }} />
          Risk vs Reward Analysis Matrix
        </h2>
        <p className="text-gray-600 mb-6">
          Strategic positioning of all scenarios in a risk/reward matrix. Darker green indicates optimal combinations of high savings and low risk.
        </p>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Grid Header */}
            <div className="flex items-end mb-2">
              <div className="w-32"></div>
              <div className="flex-1 text-center">
                <div className="font-bold text-sm text-gray-700 mb-2">Annual Savings Potential →</div>
                <div className="grid grid-cols-5 gap-1">
                  <div className="text-xs text-gray-600 text-center">0-5%</div>
                  <div className="text-xs text-gray-600 text-center">5-12%</div>
                  <div className="text-xs text-gray-600 text-center">12-18%</div>
                  <div className="text-xs text-gray-600 text-center">18-22%</div>
                  <div className="text-xs text-gray-600 text-center">22%+</div>
                </div>
              </div>
            </div>

            {/* Grid Body */}
            <div className="flex">
              {/* Y-axis label */}
              <div className="w-32 flex items-center justify-center">
                <div className="transform -rotate-90 whitespace-nowrap font-bold text-sm text-gray-700">
                  ← Risk Score (Lower is Better)
                </div>
              </div>

              {/* Grid cells */}
              <div className="flex-1">
                {/* Risk levels from low to high (top to bottom) */}
                {[
                  { label: 'Very Low (0-2)', min: 0, max: 2, riskLevel: 'very-low' },
                  { label: 'Low (2-4)', min: 2, max: 4, riskLevel: 'low' },
                  { label: 'Medium (4-6)', min: 4, max: 6, riskLevel: 'medium' },
                  { label: 'High (6-8)', min: 6, max: 8, riskLevel: 'high' },
                  { label: 'Very High (8-10)', min: 8, max: 10, riskLevel: 'very-high' }
                ].map((riskRow, rowIdx) => (
                  <div key={rowIdx} className="flex gap-1 mb-1">
                    <div className="w-24 flex items-center justify-end pr-3">
                      <span className="text-xs text-gray-600">{riskRow.label}</span>
                    </div>
                    {/* Savings columns */}
                    {[
                      { min: 0, max: 5 },
                      { min: 5, max: 12 },
                      { min: 12, max: 18 },
                      { min: 18, max: 22 },
                      { min: 22, max: 100 }
                    ].map((savingsCol, colIdx) => {
                      // Find scenarios in this cell
                      const scenariosInCell = Object.values(SCENARIOS).filter(s => {
                        const savingsPercent = s.savingsPercent || 0;
                        const risk = s.riskScore || 0;
                        return savingsPercent >= savingsCol.min && savingsPercent < savingsCol.max &&
                               risk >= riskRow.min && risk < riskRow.max;
                      });

                      // Calculate cell color based on position
                      // Green = high reward, low risk (top-right)
                      // Red = low reward, high risk (bottom-left)
                      const rewardScore = colIdx; // 0-4
                      const riskScore = 4 - rowIdx; // inverted: 4-0
                      const heatScore = rewardScore + riskScore; // 0-8

                      let bgColor = '';
                      if (heatScore >= 7) bgColor = 'bg-green-100 border-green-300';
                      else if (heatScore >= 6) bgColor = 'bg-green-50 border-green-200';
                      else if (heatScore >= 5) bgColor = 'bg-yellow-50 border-yellow-200';
                      else if (heatScore >= 4) bgColor = 'bg-orange-50 border-orange-200';
                      else if (heatScore >= 3) bgColor = 'bg-red-50 border-red-200';
                      else bgColor = 'bg-red-100 border-red-300';

                      return (
                        <div
                          key={colIdx}
                          className={`flex-1 h-20 border-2 ${bgColor} rounded-lg p-2 flex flex-col items-center justify-center`}
                        >
                          {scenariosInCell.length > 0 ? (
                            <div className="text-center">
                              {scenariosInCell.map((s, idx) => (
                                <div
                                  key={idx}
                                  className={`text-xs font-bold mb-1 px-2 py-1 rounded ${
                                    s.id === selectedScenario ? 'bg-purple-600 text-white' : 'bg-white text-gray-800'
                                  }`}
                                >
                                  <div className="truncate max-w-[120px]">{s.shortName}</div>
                                  <div className="text-[10px] font-normal">${s.annualSavings.toFixed(1)}M</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center px-1">
                              <div className="text-xs text-gray-500 font-medium leading-tight">
                                {/* Generate explanatory text based on position */}
                                {heatScore >= 7 && '🎯 Ideal: High savings, low risk'}
                                {heatScore === 6 && '✓ Strong: Good return, manageable risk'}
                                {heatScore === 5 && '⚖️ Balanced: Moderate risk & reward'}
                                {heatScore === 4 && '⚠️ Careful: Limited upside vs. risk'}
                                {heatScore === 3 && '🔴 Unfavorable: High risk, low return'}
                                {heatScore <= 2 && '❌ Avoid: Worst risk/reward profile'}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 grid grid-cols-5 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 border-2 border-green-300 rounded"></div>
                <span className="text-xs text-gray-700">Optimal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-50 border-2 border-green-200 rounded"></div>
                <span className="text-xs text-gray-700">Favorable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-50 border-2 border-yellow-200 rounded"></div>
                <span className="text-xs text-gray-700">Balanced</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-50 border-2 border-orange-200 rounded"></div>
                <span className="text-xs text-gray-700">Cautious</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-100 border-2 border-red-300 rounded"></div>
                <span className="text-xs text-gray-700">High Risk</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Year NPV */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">5-Year Net Present Value</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-700">5-Year Savings</div>
            <div className="text-3xl font-bold text-green-900">
              ${(SCENARIOS[selectedScenario]?.annualSavings * 5).toFixed(2)}M
            </div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="text-sm text-red-700">Implementation Cost</div>
            <div className="text-3xl font-bold text-red-900">
              -${SCENARIOS[selectedScenario]?.implementation.costMillions.toFixed(2)}M
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-700">Net Present Value</div>
            <div className="text-3xl font-bold text-blue-900">
              ${SCENARIOS[selectedScenario]?.npv5Year.toFixed(2)}M
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Comparison Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">All Scenarios - Financial Comparison</h2>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={Object.values(SCENARIOS)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="shortName" />
            <YAxis yAxisId="left" label={{ value: 'Savings ($M)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'NPV ($M)', angle: 90, position: 'insideRight' }} />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="annualSavings" fill={COLORS.primary} name="Annual Savings" />
            <Line yAxisId="right" type="monotone" dataKey="npv5Year" stroke={COLORS.success} strokeWidth={3} name="5-Year NPV" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // RISK ASSESSMENT TAB
  const renderRiskTab = () => (
    <div className="space-y-6">
      <ExecutiveSummaryCard scenario={selectedScenario} />

      {/* Risk vs Reward Heat Map */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Target className="w-6 h-6" style={{ color: COLORS.primary }} />
          Risk vs Reward Heat Map
        </h2>
        <p className="text-gray-600 mb-4">
          Strategic positioning of each scenario based on risk level and financial reward. Colors indicate optimal zones: <span className="font-semibold text-green-700">Green = Optimal</span>, <span className="font-semibold text-yellow-700">Yellow = Balanced</span>, <span className="font-semibold text-blue-700">Blue = Conservative</span>, <span className="font-semibold text-red-700">Red = Caution</span>.
        </p>

        {/* Heat Map Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-gray-700">Risk Level →</div>
            <div className="flex gap-8 text-xs text-gray-600">
              <span>Low Risk (0-3)</span>
              <span>Medium Risk (4-6)</span>
              <span>High Risk (7-10)</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {/* Y-axis labels */}
            <div className="flex flex-col justify-around text-sm font-semibold text-gray-700 pr-2">
              <div className="text-right">High Reward<br/>(&gt;$15M)</div>
              <div className="text-right">Med Reward<br/>($10-15M)</div>
              <div className="text-right">Low Reward<br/>(&lt;$10M)</div>
            </div>

            {/* Heat map cells - organized by Risk (columns) and Reward (rows) */}
            {/* Row 1: High Reward */}
            <div className="space-y-3">
              {/* High Reward, Low Risk - OPTIMAL ZONE (Green) */}
              <div className="bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-300 rounded-lg p-4 h-32 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-green-800">OPTIMAL</span>
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <div className="space-y-1">
                  {Object.values(SCENARIOS).filter(s => s.annualSavings >= 15 && s.riskScore <= 3).map(s => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedScenario(s.id)}
                      className={`text-xs px-2 py-1 rounded cursor-pointer transition-all ${
                        selectedScenario === s.id
                          ? 'bg-purple-600 text-white font-bold shadow-lg scale-105'
                          : 'bg-white text-green-900 hover:bg-green-50 font-semibold'
                      }`}
                    >
                      <div className="truncate">{s.shortName}</div>
                      <div className="text-[10px]">${s.annualSavings.toFixed(1)}M</div>
                    </div>
                  ))}
                  {Object.values(SCENARIOS).filter(s => s.annualSavings >= 15 && s.riskScore <= 3).length === 0 && (
                    <div className="text-xs text-green-700 italic">None</div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* High Reward, Medium Risk - BALANCED ZONE (Yellow) */}
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-300 rounded-lg p-4 h-32 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-yellow-800">BALANCED</span>
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                </div>
                <div className="space-y-1">
                  {Object.values(SCENARIOS).filter(s => s.annualSavings >= 15 && s.riskScore > 3 && s.riskScore <= 6).map(s => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedScenario(s.id)}
                      className={`text-xs px-2 py-1 rounded cursor-pointer transition-all ${
                        selectedScenario === s.id
                          ? 'bg-purple-600 text-white font-bold shadow-lg scale-105'
                          : 'bg-white text-yellow-900 hover:bg-yellow-50 font-semibold'
                      }`}
                    >
                      <div className="truncate">{s.shortName}</div>
                      <div className="text-[10px]">${s.annualSavings.toFixed(1)}M</div>
                    </div>
                  ))}
                  {Object.values(SCENARIOS).filter(s => s.annualSavings >= 15 && s.riskScore > 3 && s.riskScore <= 6).length === 0 && (
                    <div className="text-xs text-yellow-700 italic">None</div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* High Reward, High Risk - CAUTION ZONE (Red) */}
              <div className="bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-300 rounded-lg p-4 h-32 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-red-800">CAUTION</span>
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                </div>
                <div className="space-y-1">
                  {Object.values(SCENARIOS).filter(s => s.annualSavings >= 15 && s.riskScore > 6).map(s => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedScenario(s.id)}
                      className={`text-xs px-2 py-1 rounded cursor-pointer transition-all ${
                        selectedScenario === s.id
                          ? 'bg-purple-600 text-white font-bold shadow-lg scale-105'
                          : 'bg-white text-red-900 hover:bg-red-50 font-semibold'
                      }`}
                    >
                      <div className="truncate">{s.shortName}</div>
                      <div className="text-[10px]">${s.annualSavings.toFixed(1)}M</div>
                    </div>
                  ))}
                  {Object.values(SCENARIOS).filter(s => s.annualSavings >= 15 && s.riskScore > 6).length === 0 && (
                    <div className="text-xs text-red-700 italic">None</div>
                  )}
                </div>
              </div>
            </div>

            {/* Row 2: Medium Reward */}
            <div className="col-start-2 space-y-3">
              {/* Med Reward, Low Risk */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-4 h-32 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-green-700">GOOD</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="space-y-1">
                  {Object.values(SCENARIOS).filter(s => s.annualSavings >= 10 && s.annualSavings < 15 && s.riskScore <= 3).map(s => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedScenario(s.id)}
                      className={`text-xs px-2 py-1 rounded cursor-pointer transition-all ${
                        selectedScenario === s.id
                          ? 'bg-purple-600 text-white font-bold shadow-lg scale-105'
                          : 'bg-white text-green-800 hover:bg-green-50 font-semibold'
                      }`}
                    >
                      <div className="truncate">{s.shortName}</div>
                      <div className="text-[10px]">${s.annualSavings.toFixed(1)}M</div>
                    </div>
                  ))}
                  {Object.values(SCENARIOS).filter(s => s.annualSavings >= 10 && s.annualSavings < 15 && s.riskScore <= 3).length === 0 && (
                    <div className="text-xs text-green-600 italic">None</div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Med Reward, Medium Risk */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-lg p-4 h-32 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-yellow-700">MODERATE</span>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                </div>
                <div className="space-y-1">
                  {Object.values(SCENARIOS).filter(s => s.annualSavings >= 10 && s.annualSavings < 15 && s.riskScore > 3 && s.riskScore <= 6).map(s => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedScenario(s.id)}
                      className={`text-xs px-2 py-1 rounded cursor-pointer transition-all ${
                        selectedScenario === s.id
                          ? 'bg-purple-600 text-white font-bold shadow-lg scale-105'
                          : 'bg-white text-yellow-800 hover:bg-yellow-50 font-semibold'
                      }`}
                    >
                      <div className="truncate">{s.shortName}</div>
                      <div className="text-[10px]">${s.annualSavings.toFixed(1)}M</div>
                    </div>
                  ))}
                  {Object.values(SCENARIOS).filter(s => s.annualSavings >= 10 && s.annualSavings < 15 && s.riskScore > 3 && s.riskScore <= 6).length === 0 && (
                    <div className="text-xs text-yellow-600 italic">None</div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Med Reward, High Risk */}
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-300 rounded-lg p-4 h-32 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-orange-800">RISKY</span>
                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                </div>
                <div className="space-y-1">
                  {Object.values(SCENARIOS).filter(s => s.annualSavings >= 10 && s.annualSavings < 15 && s.riskScore > 6).map(s => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedScenario(s.id)}
                      className={`text-xs px-2 py-1 rounded cursor-pointer transition-all ${
                        selectedScenario === s.id
                          ? 'bg-purple-600 text-white font-bold shadow-lg scale-105'
                          : 'bg-white text-orange-900 hover:bg-orange-50 font-semibold'
                      }`}
                    >
                      <div className="truncate">{s.shortName}</div>
                      <div className="text-[10px]">${s.annualSavings.toFixed(1)}M</div>
                    </div>
                  ))}
                  {Object.values(SCENARIOS).filter(s => s.annualSavings >= 10 && s.annualSavings < 15 && s.riskScore > 6).length === 0 && (
                    <div className="text-xs text-orange-700 italic">None</div>
                  )}
                </div>
              </div>
            </div>

            {/* Row 3: Low Reward */}
            <div className="col-start-2 space-y-3">
              {/* Low Reward, Low Risk - CONSERVATIVE (Blue) */}
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-300 rounded-lg p-4 h-32 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-800">CONSERVATIVE</span>
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <div className="space-y-1">
                  {Object.values(SCENARIOS).filter(s => s.annualSavings < 10 && s.riskScore <= 3).map(s => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedScenario(s.id)}
                      className={`text-xs px-2 py-1 rounded cursor-pointer transition-all ${
                        selectedScenario === s.id
                          ? 'bg-purple-600 text-white font-bold shadow-lg scale-105'
                          : 'bg-white text-blue-900 hover:bg-blue-50 font-semibold'
                      }`}
                    >
                      <div className="truncate">{s.shortName}</div>
                      <div className="text-[10px]">${s.annualSavings.toFixed(1)}M</div>
                    </div>
                  ))}
                  {Object.values(SCENARIOS).filter(s => s.annualSavings < 10 && s.riskScore <= 3).length === 0 && (
                    <div className="text-xs text-blue-700 italic">None</div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Low Reward, Medium Risk */}
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 rounded-lg p-4 h-32 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">LIMITED</span>
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                </div>
                <div className="space-y-1">
                  {Object.values(SCENARIOS).filter(s => s.annualSavings < 10 && s.riskScore > 3 && s.riskScore <= 6).map(s => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedScenario(s.id)}
                      className={`text-xs px-2 py-1 rounded cursor-pointer transition-all ${
                        selectedScenario === s.id
                          ? 'bg-purple-600 text-white font-bold shadow-lg scale-105'
                          : 'bg-white text-gray-800 hover:bg-gray-50 font-semibold'
                      }`}
                    >
                      <div className="truncate">{s.shortName}</div>
                      <div className="text-[10px]">${s.annualSavings.toFixed(1)}M</div>
                    </div>
                  ))}
                  {Object.values(SCENARIOS).filter(s => s.annualSavings < 10 && s.riskScore > 3 && s.riskScore <= 6).length === 0 && (
                    <div className="text-xs text-gray-600 italic">None</div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Low Reward, High Risk - AVOID (Dark Red) */}
              <div className="bg-gradient-to-br from-red-200 to-red-300 border-2 border-red-400 rounded-lg p-4 h-32 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-red-900">AVOID</span>
                  <div className="w-2 h-2 bg-red-700 rounded-full"></div>
                </div>
                <div className="space-y-1">
                  {Object.values(SCENARIOS).filter(s => s.annualSavings < 10 && s.riskScore > 6).map(s => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedScenario(s.id)}
                      className={`text-xs px-2 py-1 rounded cursor-pointer transition-all ${
                        selectedScenario === s.id
                          ? 'bg-purple-600 text-white font-bold shadow-lg scale-105'
                          : 'bg-white text-red-900 hover:bg-red-50 font-semibold'
                      }`}
                    >
                      <div className="truncate">{s.shortName}</div>
                      <div className="text-[10px]">${s.annualSavings.toFixed(1)}M</div>
                    </div>
                  ))}
                  {Object.values(SCENARIOS).filter(s => s.annualSavings < 10 && s.riskScore > 6).length === 0 && (
                    <div className="text-xs text-red-800 italic">None</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Radar Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Shield className="w-6 h-6" style={{ color: COLORS.primary }} />
          Multi-Dimensional Risk Assessment
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={[
            { risk: 'Clinical', [selectedScenario]: SCENARIOS[selectedScenario]?.adoptionRate || 0 },
            { risk: 'Financial', [selectedScenario]: 100 - (SCENARIOS[selectedScenario]?.riskScore * 10) || 0 },
            { risk: 'Operational', [selectedScenario]: SCENARIOS[selectedScenario]?.implementation.complexity === 'Low' ? 90 : SCENARIOS[selectedScenario]?.implementation.complexity === 'Medium' ? 70 : 50 },
            { risk: 'Stakeholder', [selectedScenario]: SCENARIOS[selectedScenario]?.quintupleMissionScore || 0 },
            { risk: 'Timeline', [selectedScenario]: Math.max(0, 100 - (SCENARIOS[selectedScenario]?.implementation.timeline || 0) * 3) }
          ]}>
            <PolarGrid />
            <PolarAngleAxis dataKey="risk" />
            <PolarRadiusAxis domain={[0, 100]} />
            <Radar name={`Scenario ${selectedScenario}`} dataKey={selectedScenario} stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.6} />
            <Tooltip />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Comparison Table */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Risk Comparison Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left">Scenario</th>
                <th className="px-4 py-3 text-center">Risk Level</th>
                <th className="px-4 py-3 text-center">Risk Score</th>
                <th className="px-4 py-3 text-center">Complexity</th>
                <th className="px-4 py-3 text-center">Timeline</th>
                <th className="px-4 py-3 text-center">Implementation Cost</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(SCENARIOS).map(scenario => (
                <tr key={scenario.id} className={`border-b hover:bg-gray-50 ${selectedScenario === scenario.id ? 'bg-purple-50' : ''}`}>
                  <td className="px-4 py-3 font-medium">{scenario.shortName}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      scenario.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                      scenario.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {scenario.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-bold">{scenario.riskScore}/10</td>
                  <td className="px-4 py-3 text-center">{scenario.implementation.complexity}</td>
                  <td className="px-4 py-3 text-center">{scenario.implementation.timeline} months</td>
                  <td className="px-4 py-3 text-center">${scenario.implementation.costMillions}M</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // MISSION IMPACT TAB
  const renderMissionTab = () => {
    const missionData = QUINTUPLE_SCORING[selectedScenario];

    // If no mission data for this scenario, show error
    if (!missionData) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Mission Data Not Available</h2>
            <p className="text-gray-600">
              Quintuple Aim scoring is not available for scenario: <strong>{selectedScenario}</strong>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Available scenarios: {Object.keys(QUINTUPLE_SCORING).join(', ')}
            </p>
          </div>
        </div>
      );
    }

    const quintupleAimDefinitions = [
      {
        name: 'Patient Experience',
        score: missionData.patientExperience,
        color: '#10B981',
        icon: Heart,
        description: 'Quality of care from the patient perspective',
        scoringFactors: [
          'Device reliability and proven outcomes',
          'Surgeon familiarity and training depth',
          'Product availability and consistency',
          'Reduced revision rates'
        ],
        scale: '0-100: Low (0-40) = Limited product choices/surgeon training; Medium (41-70) = Adequate options; High (71-100) = Optimal product portfolio and surgeon expertise'
      },
      {
        name: 'Population Health',
        score: missionData.populationHealth,
        color: '#3B82F6',
        icon: Building2,
        description: 'Overall health outcomes across patient populations',
        scoringFactors: [
          'Clinical outcomes data and registry participation',
          'Evidence-based product selection',
          'Standardization benefits across facilities',
          'Long-term implant survivorship'
        ],
        scale: '0-100: Low (0-40) = Limited outcomes tracking; Medium (41-70) = Good standardization; High (71-100) = Comprehensive outcomes with registry data'
      },
      {
        name: 'Cost Reduction',
        score: missionData.costReduction,
        color: '#F59E0B',
        icon: DollarSign,
        description: 'Financial sustainability and value creation',
        scoringFactors: [
          'Direct savings from vendor negotiation',
          'Reduced inventory and supply chain costs',
          'Administrative efficiency gains',
          'Volume-based contract optimization'
        ],
        scale: '0-100: Proportional to savings percentage (0% = 0 points, 25% = 92 points). Reflects annual cost reduction achieved.'
      },
      {
        name: 'Provider Experience',
        score: missionData.providerExperience,
        color: '#BA4896',
        icon: Stethoscope,
        description: 'Surgeon and clinical team satisfaction',
        scoringFactors: [
          'Product choice flexibility and preference accommodation',
          'Rep support and technical assistance',
          'Training and education opportunities',
          'Ease of adoption and workflow integration'
        ],
        scale: '0-100: Low (0-40) = Single vendor/limited choice; Medium (41-70) = 2-3 vendors; High (71-100) = 3+ vendors with broad portfolio'
      },
      {
        name: 'Health Equity',
        score: missionData.healthEquity,
        color: '#9333EA',
        icon: Shield,
        description: 'Fair access to quality care across all populations',
        scoringFactors: [
          'Consistency of product availability across facilities',
          'Standardized care protocols across regions',
          'Access to premium implants for all patients',
          'Reduced disparities in outcomes by location'
        ],
        scale: '0-100: Low (0-40) = High facility variation; Medium (41-70) = Moderate standardization; High (71-100) = Consistent protocols system-wide'
      }
    ];

    return (
      <div className="space-y-6">
        <ExecutiveSummaryCard scenario={selectedScenario} />

        {/* Disclaimer */}
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-amber-900 mb-1">Estimated Mission Scores</h3>
              <p className="text-sm text-amber-800">
                The Quintuple Aim scores shown below are <strong>estimated based on industry benchmarks and scenario characteristics</strong>.
                Actual patient experience, population health, and health equity scores would require clinical outcomes data,
                patient satisfaction surveys, and facility-level performance metrics not currently available in this analysis.
                Cost reduction scores are derived from actual financial data.
              </p>
            </div>
          </div>
        </div>

        {/* Quintuple Aim Explanations */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <HelpCircle className="w-6 h-6" style={{ color: COLORS.primary }} />
            Understanding the Quintuple Aim Framework
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {quintupleAimDefinitions.map((aim) => {
              const IconComponent = aim.icon;
              return (
                <div key={aim.name} className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className="w-5 h-5" style={{ color: aim.color }} />
                    <h3 className="font-bold text-lg">{aim.name}</h3>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Current Score</span>
                      <span className="text-2xl font-bold" style={{ color: aim.color }}>{aim.score}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${aim.score}%`, backgroundColor: aim.color }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2 font-medium">{aim.description}</p>
                  <div className="text-xs text-gray-600 mb-2">
                    <strong>Scoring Factors:</strong>
                    <ul className="list-disc ml-4 mt-1 space-y-0.5">
                      {aim.scoringFactors.map((factor, idx) => (
                        <li key={idx}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                    <strong>Scale:</strong> {aim.scale}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quintuple Aim Radar */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Heart className="w-6 h-6" style={{ color: COLORS.primary }} />
            Quintuple Aim Mission Alignment
          </h2>
          <ResponsiveContainer width="100%" height={500}>
            <RadarChart data={[
              { aim: 'Patient Experience', score: missionData.patientExperience },
              { aim: 'Population Health', score: missionData.populationHealth },
              { aim: 'Cost Reduction', score: missionData.costReduction },
              { aim: 'Provider Experience', score: missionData.providerExperience },
              { aim: 'Health Equity', score: missionData.healthEquity }
            ]}>
              <PolarGrid />
              <PolarAngleAxis dataKey="aim" />
              <PolarRadiusAxis domain={[0, 100]} />
              <Radar name="Score" dataKey="score" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.7} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-600">Overall Mission Score</div>
            <div className="text-4xl font-bold" style={{ color: COLORS.primary }}>
              {missionData.total}/100
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Mission Bonus: +{missionData.missionBonus} points
            </div>
          </div>
        </div>

        {/* Mission Comparison */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Mission Score Comparison</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={Object.entries(QUINTUPLE_SCORING).map(([id, data]) => ({
              scenario: SCENARIOS[id]?.shortName,
              patientExperience: data.patientExperience,
              populationHealth: data.populationHealth,
              costReduction: data.costReduction,
              providerExperience: data.providerExperience,
              healthEquity: data.healthEquity
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="scenario" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="patientExperience" stackId="a" fill="#10B981" name="Patient Experience" />
              <Bar dataKey="populationHealth" stackId="a" fill="#3B82F6" name="Population Health" />
              <Bar dataKey="costReduction" stackId="a" fill="#F59E0B" name="Cost Reduction" />
              <Bar dataKey="providerExperience" stackId="a" fill="#BA4896" name="Provider Experience" />
              <Bar dataKey="healthEquity" stackId="a" fill="#9333EA" name="Health Equity" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // INDUSTRY INTELLIGENCE TAB
  const renderIndustryTab = () => {
    const industryIntelligence = [
      {
        category: 'Mergers & Acquisitions',
        icon: Target,
        color: '#BA4896',
        events: [
          {
            date: '2024-Q2',
            title: 'Stryker Acquires Vocera Communications',
            impact: 'Medium',
            leverage: 'Vendor',
            description: 'Enhanced clinical communication capabilities, potential bundling opportunities with OR equipment',
            implications: ['Integration with Stryker platforms', 'New communication solutions', 'Potential pricing leverage']
          },
          {
            date: '2023-Q4',
            title: 'J&J Completes Abiomed Acquisition',
            impact: 'Low',
            leverage: 'CommonSpirit',
            description: 'Cardiovascular focus, minimal direct orthopedic impact - J&J diverted resources from ortho',
            implications: ['J&J portfolio diversification', 'Resource allocation shifts away from ortho', 'Opportunity for competitor gains']
          }
        ]
      },
      {
        category: 'Spinoffs & Divestitures',
        icon: AlertCircle,
        color: '#F59E0B',
        events: [
          {
            date: '2023-Q2',
            title: 'Zimmer Biomet Sells Spine Business to H.I.G. Capital',
            impact: 'Medium',
            leverage: 'CommonSpirit',
            description: 'ZimVie spin-off completes separation, focusing core business on joints - need to prove joint focus',
            implications: ['Increased focus on hip/knee portfolio', 'Motivated to grow joint market share', 'Opportunity for volume commitments']
          },
          {
            date: '2021-Q3',
            title: 'J&J Separates Consumer Health Division (Kenvue)',
            impact: 'Low',
            leverage: 'CommonSpirit',
            description: 'Creation of Kenvue as standalone entity, DePuy Synthes remains with J&J MedTech - proving medical focus',
            implications: ['Streamlined MedTech focus', 'Capital reallocation to ortho R&D', 'Strategic partnership opportunities']
          }
        ]
      },
      {
        category: 'Legal & Regulatory',
        icon: Shield,
        color: '#EF4444',
        events: [
          {
            date: '2024-Q1',
            title: 'ASR Hip Settlement - DePuy',
            impact: 'Low',
            leverage: 'CommonSpirit',
            description: 'Legacy metal-on-metal hip implant settlements continue - J&J motivated to rebuild trust',
            implications: ['Increased quality oversight', 'Enhanced clinical evidence requirements', 'Opportunity for quality-based agreements']
          },
          {
            date: '2023-Q3',
            title: 'DOJ Investigation into Implant Pricing',
            impact: 'High',
            leverage: 'CommonSpirit',
            description: 'Federal investigation into orthopedic device pricing practices across industry - pricing scrutiny',
            implications: ['Increased price transparency pressure', 'Vendors motivated to show competitive pricing', 'Enhanced compliance as negotiation point']
          },
          {
            date: '2023-Q1',
            title: 'FDA Modernization Act 2.0',
            impact: 'Medium',
            leverage: 'Vendor',
            description: 'New pathways for medical device approvals, alternatives to animal testing - faster innovation',
            implications: ['Faster innovation cycles', 'New product introductions accelerated', 'Premium pricing for new tech']
          }
        ]
      },
      {
        category: 'Market Dynamics',
        icon: TrendingUp,
        color: '#10B981',
        events: [
          {
            date: '2024-Q1',
            title: 'Robotic-Assisted Surgery Growth',
            impact: 'High',
            leverage: 'Vendor',
            description: 'Continued expansion of robotic platforms (Mako, Rosa, Navio) driving vendor differentiation',
            implications: ['Technology integration requirements', 'Capital equipment considerations', 'Bundled service contracts']
          },
          {
            date: '2023-Q4',
            title: 'ASC Migration Accelerates',
            impact: 'High',
            leverage: 'CommonSpirit',
            description: 'Hip and knee procedures shifting to ambulatory surgery centers - pressure for value pricing',
            implications: ['Value-based purchasing emphasis', 'Episode payment models', 'Aggressive pricing needed for ASC market']
          },
          {
            date: '2023-Q2',
            title: 'Direct Contracting Models Emerge',
            impact: 'Medium',
            leverage: 'CommonSpirit',
            description: 'New direct-to-employer joint replacement programs - transparency and value requirements',
            implications: ['Bundled payment pressure', 'Outcome-based contracting', 'Price transparency demands from employers']
          }
        ]
      }
    ];

    // Negotiating Windows - Fiscal Year & Market Events
    const negotiatingWindows = [
      {
        vendor: 'Stryker',
        fiscalYearEnd: 'December 31',
        optimalWindows: [
          {
            period: 'Q4 (Oct-Dec)',
            rationale: 'End of fiscal year - sales teams motivated to hit annual targets',
            leverage: 'High',
            tactics: ['Volume commitments for year-end close', 'Multi-year deals with upfront recognition', 'Quarter-end urgency pricing']
          },
          {
            period: 'Q1 (Jan-Mar)',
            rationale: 'Post-earnings review period - new annual quotas established',
            leverage: 'Medium',
            tactics: ['Early-year momentum deals', 'Setting baseline for annual relationships', 'Capital equipment bundling']
          }
        ],
        earningsReports: ['Late January', 'Late April', 'Late July', 'Late October'],
        nextEarnings: '2025-01-28'
      },
      {
        vendor: 'Zimmer Biomet',
        fiscalYearEnd: 'December 31',
        optimalWindows: [
          {
            period: 'Q2-Q3 (Apr-Sep)',
            rationale: 'Post-ZimVie spin - proving joint market focus and growth',
            leverage: 'Very High',
            tactics: ['Market share gain commitments', 'Portfolio expansion into revision components', 'Competitive displacement deals']
          },
          {
            period: 'Q4 (Oct-Dec)',
            rationale: 'Fiscal year-end close with pressure to show spine divestiture success',
            leverage: 'High',
            tactics: ['Year-end target pricing', 'Show growth in core joint business', 'Multi-facility agreements']
          }
        ],
        earningsReports: ['Early February', 'Early May', 'Early August', 'Early November'],
        nextEarnings: '2025-02-04'
      },
      {
        vendor: 'J&J (DePuy Synthes)',
        fiscalYearEnd: 'December 31',
        optimalWindows: [
          {
            period: 'Q1-Q2 (Jan-Jun)',
            rationale: 'Post-Kenvue separation - proving MedTech focus and rebuilding trust',
            leverage: 'Very High',
            tactics: ['Partnership approach vs transactional', 'Quality and outcomes focus', 'ASR legacy offset with pricing']
          },
          {
            period: 'Q4 (Oct-Dec)',
            rationale: 'Calendar year-end with parent company scrutiny on MedTech performance',
            leverage: 'High',
            tactics: ['Ortho division performance targets', 'Strategic account pricing', 'Clinical evidence partnerships']
          }
        ],
        earningsReports: ['Mid-January', 'Mid-April', 'Mid-July', 'Mid-October'],
        nextEarnings: '2025-01-21'
      },
      {
        vendor: 'Smith & Nephew',
        fiscalYearEnd: 'December 31',
        optimalWindows: [
          {
            period: 'Q2-Q3 (Apr-Sep)',
            rationale: 'Smaller market share - aggressive pricing to gain CommonSpirit footprint',
            leverage: 'Very High',
            tactics: ['Market entry pricing', 'Navio robotics bundling', 'Revision component specialization']
          },
          {
            period: 'Q4 (Oct-Dec)',
            rationale: 'Year-end growth targets - need reference accounts',
            leverage: 'High',
            tactics: ['Reference customer pricing', 'Technology evaluation programs', 'Competitive win-back offers']
          }
        ],
        earningsReports: ['Early February', 'Mid-May', 'Early August', 'Early November'],
        nextEarnings: '2025-02-06'
      }
    ];

    const getImpactColor = (impact) => {
      switch(impact) {
        case 'High': return '#EF4444';
        case 'Medium': return '#F59E0B';
        case 'Low': return '#10B981';
        default: return '#6B7280';
      }
    };

    return (
      <div className="space-y-6">
        <ExecutiveSummaryCard scenario={selectedScenario} />

        {/* Industry Overview */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6" style={{ color: COLORS.primary }} />
            Orthopedic Industry Intelligence Dashboard
          </h2>
          <p className="text-gray-700 mb-4">
            Strategic insights on mergers, acquisitions, divestitures, legal challenges, and market dynamics
            affecting the orthopedic device landscape and vendor partnership decisions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {industryIntelligence.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <div key={cat.category} className="bg-white rounded-lg p-4 shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className="w-5 h-5" style={{ color: cat.color }} />
                    <h3 className="font-bold">{cat.category}</h3>
                  </div>
                  <div className="text-3xl font-bold" style={{ color: cat.color }}>
                    {cat.events.length}
                  </div>
                  <div className="text-xs text-gray-500">Recent Events</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Intelligence Cards - Horizontal Grid Layout */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Industry Events & Strategic Intelligence</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {industryIntelligence.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <div key={category.category} className="border-2 rounded-lg p-4" style={{ borderColor: category.color }}>
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b-2" style={{ borderColor: category.color }}>
                    <CategoryIcon className="w-5 h-5" style={{ color: category.color }} />
                    <h3 className="font-bold text-lg" style={{ color: category.color }}>{category.category}</h3>
                  </div>
                  <div className="space-y-3">
                    {category.events.map((event, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-bold text-sm flex-1">{event.title}</h4>
                          <div className="flex gap-1 flex-shrink-0">
                            <span
                              className="px-1.5 py-0.5 rounded text-xs font-medium text-white"
                              style={{ backgroundColor: getImpactColor(event.impact) }}
                            >
                              {event.impact}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">{event.date}</div>
                        <p className="text-xs text-gray-700 mb-2">{event.description}</p>
                        <div className="flex items-center gap-1 mb-2">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              event.leverage === 'CommonSpirit'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {event.leverage === 'CommonSpirit' ? '✓ Favors CommonSpirit' : '⚠ Favors Vendor'}
                          </span>
                        </div>
                        <div className="bg-white rounded p-2 mt-2">
                          <div className="text-xs font-semibold text-gray-600 mb-1">Key Implications:</div>
                          <ul className="text-xs text-gray-600 space-y-0.5">
                            {event.implications.slice(0, 2).map((imp, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-purple-600">•</span>
                                <span>{imp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vendor-Specific Intelligence */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-6 h-6" style={{ color: COLORS.primary }} />
            Vendor-Specific Strategic Position
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-2 border-purple-200 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                Zimmer Biomet
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Post-ZimVie spin: focused strategy on joints</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Rosa robotics platform expansion</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span>Integration challenges from historical M&A</span>
                </li>
              </ul>
            </div>
            <div className="border-2 border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                Stryker
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Mako robotics market leader</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Vocera acquisition enhances digital ecosystem</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Consistent innovation pipeline</span>
                </li>
              </ul>
            </div>
            <div className="border-2 border-green-200 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                J&J (DePuy Synthes)
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Post-Kenvue split: focused MedTech strategy</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span>Legacy litigation (ASR) ongoing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Velys robotic platform development</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Negotiating Windows - Fiscal Year Intelligence - Compact Grid */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6" style={{ color: COLORS.primary }} />
            Strategic Negotiating Windows
          </h2>
          <p className="text-gray-600 mb-4">
            Optimal timing for contract negotiations based on vendor fiscal years and market pressures
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {negotiatingWindows.map((vendor, idx) => (
              <div key={idx} className="border-2 border-purple-200 rounded-lg p-4">
                <div className="mb-3 pb-3 border-b border-purple-200">
                  <h3 className="text-lg font-bold text-purple-900">{vendor.vendor}</h3>
                  <div className="text-xs text-gray-600 mt-1">
                    FY End: <span className="font-semibold">{vendor.fiscalYearEnd}</span> |
                    Next Earnings: <span className="font-semibold text-purple-600">{vendor.nextEarnings}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {vendor.optimalWindows.map((window, wIdx) => (
                    <div
                      key={wIdx}
                      className={`rounded-lg p-3 ${
                        window.leverage === 'Very High'
                          ? 'bg-green-50 border border-green-300'
                          : 'bg-blue-50 border border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-sm text-gray-900">{window.period}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          window.leverage === 'Very High'
                            ? 'bg-green-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}>
                          {window.leverage}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 mb-2 italic">{window.rationale}</p>
                      <div className="text-xs">
                        <div className="font-semibold text-gray-600 mb-1">Tactics:</div>
                        <ul className="space-y-0.5">
                          {window.tactics.slice(0, 2).map((tactic, tIdx) => (
                            <li key={tIdx} className="flex items-start gap-1">
                              <span className="text-purple-600">▸</span>
                              <span className="text-gray-600">{tactic}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Timeline Visualization */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-purple-900 mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Negotiating Windows Timeline (Next 12 Months)
            </h3>

            {/* Timeline */}
            <div className="relative">
              {/* Month headers */}
              <div className="grid grid-cols-12 gap-1 mb-4">
                {(() => {
                  const today = new Date();
                  const months = [];
                  for (let i = 0; i < 12; i++) {
                    const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
                    months.push(date.toLocaleDateString('en-US', { month: 'short' }));
                  }
                  return months.map((month, idx) => (
                    <div key={idx} className="text-center text-xs font-semibold text-gray-600">
                      {month}
                    </div>
                  ));
                })()}
              </div>

              {/* Vendor timelines */}
              <div className="space-y-6">
                {negotiatingWindows.map((vendor, vIdx) => (
                  <div key={vIdx} className="relative">
                    <div className="flex items-start gap-4">
                      {/* Vendor name */}
                      <div className="w-32 flex-shrink-0">
                        <div className="font-bold text-purple-900">{vendor.vendor}</div>
                        <div className="text-xs text-gray-600">FY End: {vendor.fiscalYearEnd}</div>
                      </div>

                      {/* Timeline bar */}
                      <div className="flex-1 relative">
                        <div className="grid grid-cols-12 gap-1 h-16">
                          {/* Background months */}
                          {[...Array(12)].map((_, mIdx) => (
                            <div key={mIdx} className="border border-gray-200 rounded bg-gray-50"></div>
                          ))}

                          {/* Optimal windows overlay */}
                          {vendor.optimalWindows.map((window, wIdx) => {
                            // Map period to month range
                            let startMonth, spanMonths;
                            if (window.period.includes('Q1')) {
                              startMonth = 0; spanMonths = 3;
                            } else if (window.period.includes('Q2-Q3') || window.period.includes('Apr-Sep')) {
                              startMonth = 3; spanMonths = 6;
                            } else if (window.period.includes('Q1-Q2') || window.period.includes('Jan-Jun')) {
                              startMonth = 0; spanMonths = 6;
                            } else if (window.period.includes('Q4')) {
                              startMonth = 9; spanMonths = 3;
                            } else {
                              startMonth = 0; spanMonths = 1;
                            }

                            const bgColor = window.leverage === 'Very High'
                              ? 'bg-green-500'
                              : window.leverage === 'High'
                              ? 'bg-blue-500'
                              : 'bg-amber-500';

                            return (
                              <div
                                key={wIdx}
                                className={`absolute ${bgColor} bg-opacity-80 rounded shadow-md flex items-center justify-center text-white font-bold text-xs px-2 border-2 border-white`}
                                style={{
                                  left: `${(startMonth / 12) * 100}%`,
                                  width: `${(spanMonths / 12) * 100}%`,
                                  top: `${wIdx * 50}%`,
                                  height: '45%'
                                }}
                                title={`${window.period}: ${window.rationale}`}
                              >
                                <div className="truncate">{window.period}</div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Earnings markers */}
                        <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none">
                          {vendor.earningsReports && vendor.earningsReports.map((earnings, eIdx) => {
                            // Map earnings to approximate month
                            let monthPos = 0;
                            if (earnings.includes('January') || earnings.includes('Late January')) monthPos = 0.8;
                            else if (earnings.includes('February') || earnings.includes('Early February')) monthPos = 1.2;
                            else if (earnings.includes('April') || earnings.includes('Late April')) monthPos = 3.8;
                            else if (earnings.includes('May') || earnings.includes('Early May')) monthPos = 4.2;
                            else if (earnings.includes('July') || earnings.includes('Late July')) monthPos = 6.8;
                            else if (earnings.includes('August') || earnings.includes('Early August')) monthPos = 7.2;
                            else if (earnings.includes('October') || earnings.includes('Late October')) monthPos = 9.8;
                            else if (earnings.includes('November') || earnings.includes('Early November')) monthPos = 10.2;

                            return (
                              <div
                                key={eIdx}
                                className="absolute w-1 bg-red-500 opacity-60"
                                style={{
                                  left: `${(monthPos / 12) * 100}%`,
                                  top: 0,
                                  height: '100%'
                                }}
                                title={`Earnings: ${earnings}`}
                              >
                                <div className="absolute -top-2 left-0 transform -translate-x-1/2">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-6 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-gray-700">Very High Leverage</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-gray-700">High Leverage</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-500 rounded"></div>
                  <span className="text-gray-700">Medium Leverage</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-red-500"></div>
                  <span className="text-gray-700">Earnings Report</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };


  // WHAT-IF SCENARIO TOOLS
  const renderWhatIfTools = () => (
    <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-xl p-8 mb-6 border-2 border-purple-200">
      {/* Header with Product Line Badge */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
            <Sliders className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Interactive What-If Scenario Analysis
            </h3>
            <p className="text-sm text-gray-600">Model different assumptions to stress-test your strategy</p>
          </div>
        </div>
        <div className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg">
          <div className="text-xs font-semibold uppercase tracking-wide opacity-90">Product Line</div>
          <div className="text-lg font-bold">Hip & Knee Replacement</div>
        </div>
      </div>

      {/* Scenario Selector - Prominent */}
      <div className="mb-6 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 shadow-xl">
        <label className="block text-sm font-bold text-purple-100 uppercase tracking-wide mb-3">
          Select Baseline Scenario
        </label>
        <select
          value={selectedScenario}
          onChange={(e) => setSelectedScenario(e.target.value)}
          className="w-full px-6 py-4 text-lg font-bold border-4 border-purple-400 rounded-lg bg-white text-gray-900 hover:border-purple-300 focus:outline-none focus:ring-4 focus:ring-purple-300 cursor-pointer shadow-lg"
        >
          {Object.values(SCENARIOS).map(scenario => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.shortName} - ${scenario.annualSavings.toFixed(2)}M savings ({scenario.savingsPercent}% reduction)
            </option>
          ))}
        </select>
        <p className="text-purple-100 text-sm mt-3 italic">
          Choose your baseline scenario above, then adjust the parameters below to test different assumptions
        </p>
      </div>

      {/* Parameter Definitions Banner */}
      <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <strong>How to use:</strong> Adjust the sliders below to model different scenarios. Each parameter affects the projected outcomes in real-time. Hover over parameter names for detailed definitions.
          </div>
        </div>
      </div>

      {/* Parameter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Adoption Rate Modifier */}
        <div className="bg-white rounded-lg p-5 shadow-md border border-gray-200">
          <div className="flex items-start gap-2 mb-3">
            <label className="block text-base font-bold text-gray-900">
              Adoption Rate Modifier
            </label>
            <HelpCircle
              className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 cursor-help"
              title="Percentage change in surgeon adoption of the standardized vendor strategy. Positive values indicate better adoption, negative values indicate resistance."
            />
          </div>
          <div className="text-sm text-gray-600 mb-3 italic">
            Adjust surgeon buy-in to standardization
          </div>
          <div className="text-2xl font-bold mb-2" style={{ color: COLORS.primary }}>
            {whatIfParams.adoptionModifier > 0 ? '+' : ''}{whatIfParams.adoptionModifier}%
          </div>
          <input
            type="range"
            min="-20"
            max="20"
            value={whatIfParams.adoptionModifier}
            onChange={(e) => setWhatIfParams({ ...whatIfParams, adoptionModifier: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>-20%</span>
            <span className="font-semibold">Baseline</span>
            <span>+20%</span>
          </div>
        </div>

        {/* Price Erosion */}
        <div className="bg-white rounded-lg p-5 shadow-md border border-gray-200">
          <div className="flex items-start gap-2 mb-3">
            <label className="block text-base font-bold text-gray-900">
              Price Erosion
            </label>
            <HelpCircle
              className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 cursor-help"
              title="Annual rate of price increases or decreases from vendors. Negative values = price reductions (better for us), positive values = price increases (worse for us)."
            />
          </div>
          <div className="text-sm text-gray-600 mb-3 italic">
            Annual vendor price change
          </div>
          <div className="text-2xl font-bold mb-2" style={{ color: COLORS.primary }}>
            {whatIfParams.priceErosion > 0 ? '+' : ''}{whatIfParams.priceErosion}%
          </div>
          <input
            type="range"
            min="-10"
            max="10"
            value={whatIfParams.priceErosion}
            onChange={(e) => setWhatIfParams({ ...whatIfParams, priceErosion: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>-10% (savings)</span>
            <span className="font-semibold">0</span>
            <span>+10% (cost)</span>
          </div>
        </div>

        {/* Implementation Timeline */}
        <div className="bg-white rounded-lg p-5 shadow-md border border-gray-200">
          <div className="flex items-start gap-2 mb-3">
            <label className="block text-base font-bold text-gray-900">
              Implementation Timeline
            </label>
            <HelpCircle
              className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 cursor-help"
              title="Total months from contract signing to full deployment. Longer timelines delay savings realization but may improve adoption."
            />
          </div>
          <div className="text-sm text-gray-600 mb-3 italic">
            Months to full deployment
          </div>
          <div className="text-2xl font-bold mb-2" style={{ color: COLORS.primary }}>
            {whatIfParams.implementationMonths} months
          </div>
          <input
            type="range"
            min="6"
            max="24"
            value={whatIfParams.implementationMonths}
            onChange={(e) => setWhatIfParams({ ...whatIfParams, implementationMonths: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>6mo (fast)</span>
            <span className="font-semibold">12mo</span>
            <span>24mo (slow)</span>
          </div>
        </div>

        {/* Volume Growth */}
        <div className="bg-white rounded-lg p-5 shadow-md border border-gray-200">
          <div className="flex items-start gap-2 mb-3">
            <label className="block text-base font-bold text-gray-900">
              Volume Growth
            </label>
            <HelpCircle
              className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 cursor-help"
              title="Projected annual change in surgical case volume. Positive values = more procedures (aging population), negative values = fewer procedures (improved prevention)."
            />
          </div>
          <div className="text-sm text-gray-600 mb-3 italic">
            Annual case volume change
          </div>
          <div className="text-2xl font-bold mb-2" style={{ color: COLORS.primary }}>
            {whatIfParams.volumeGrowth > 0 ? '+' : ''}{whatIfParams.volumeGrowth}%
          </div>
          <input
            type="range"
            min="-15"
            max="15"
            value={whatIfParams.volumeGrowth}
            onChange={(e) => setWhatIfParams({ ...whatIfParams, volumeGrowth: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>-15%</span>
            <span className="font-semibold">0</span>
            <span>+15%</span>
          </div>
        </div>

        {/* Surgeon Resistance */}
        <div className="bg-white rounded-lg p-5 shadow-md border border-gray-200">
          <div className="flex items-start gap-2 mb-3">
            <label className="block text-base font-bold text-gray-900">
              Surgeon Resistance
            </label>
            <HelpCircle
              className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 cursor-help"
              title="Percentage of surgeons who actively resist changing vendors. Higher values reduce effective adoption rate and may require additional change management."
            />
          </div>
          <div className="text-sm text-gray-600 mb-3 italic">
            Expected pushback on changes
          </div>
          <div className="text-2xl font-bold mb-2" style={{ color: COLORS.primary }}>
            {whatIfParams.surgeonResistance}%
          </div>
          <input
            type="range"
            min="0"
            max="30"
            value={whatIfParams.surgeonResistance}
            onChange={(e) => setWhatIfParams({ ...whatIfParams, surgeonResistance: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>0% (none)</span>
            <span className="font-semibold">15%</span>
            <span>30% (high)</span>
          </div>
        </div>

        {/* Negotiation Leverage */}
        <div className="bg-white rounded-lg p-5 shadow-md border border-gray-200">
          <div className="flex items-start gap-2 mb-3">
            <label className="block text-base font-bold text-gray-900">
              Negotiation Leverage
            </label>
            <HelpCircle
              className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 cursor-help"
              title="Additional savings from improved negotiating position. Positive values = better terms through volume consolidation, negative values = weaker position (vendor consolidation)."
            />
          </div>
          <div className="text-sm text-gray-600 mb-3 italic">
            Enhanced contract terms
          </div>
          <div className="text-2xl font-bold mb-2" style={{ color: COLORS.primary }}>
            {whatIfParams.negotiationLeverage > 0 ? '+' : ''}{whatIfParams.negotiationLeverage}%
          </div>
          <input
            type="range"
            min="-10"
            max="20"
            value={whatIfParams.negotiationLeverage}
            onChange={(e) => setWhatIfParams({ ...whatIfParams, negotiationLeverage: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>-10%</span>
            <span className="font-semibold">0</span>
            <span>+20%</span>
          </div>
        </div>
      </div>

      {/* Key Outcomes by Pillar */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
        <h4 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: COLORS.primary }}>
          <Calculator className="w-6 h-6" />
          Real-Time Impact on Key Outcomes
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Financial Outcomes */}
          <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl p-5 border-2 border-amber-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h5 className="text-lg font-bold text-amber-900">Financial</h5>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-amber-200">
                <div className="text-sm text-amber-700 mb-1">Annual Savings</div>
                <div className="text-3xl font-bold text-amber-900">
                  ${getAdjustedMetrics(selectedScenario)?.annualSavings.toFixed(2)}M
                </div>
                <div className="text-sm font-medium mt-2" style={{ color: ((getAdjustedMetrics(selectedScenario)?.annualSavings || 0) - (SCENARIOS['status-quo']?.annualSavings || 0)) >= 0 ? '#10B981' : '#EF4444' }}>
                  {((getAdjustedMetrics(selectedScenario)?.annualSavings || 0) - (SCENARIOS['status-quo']?.annualSavings || 0)) >= 0 ? '↑' : '↓'}
                  ${Math.abs((getAdjustedMetrics(selectedScenario)?.annualSavings || 0) - (SCENARIOS['status-quo']?.annualSavings || 0)).toFixed(2)}M vs status quo
                </div>
              </div>

              <div className="bg-amber-50 rounded-lg p-3">
                <div className="text-xs text-amber-700 mb-1">5-Year NPV</div>
                <div className="text-lg font-bold text-amber-900">
                  ${(getAdjustedMetrics(selectedScenario)?.annualSavings * 5 || 0).toFixed(1)}M
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Outcomes */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border-2 border-blue-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <h5 className="text-lg font-bold text-blue-900">Clinical</h5>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="text-sm text-blue-700 mb-1">Surgeon Adoption</div>
                <div className="text-3xl font-bold text-blue-900">
                  {getAdjustedMetrics(selectedScenario)?.adoptionRate.toFixed(0)}%
                </div>
                <div className="text-sm font-medium mt-2" style={{ color: ((getAdjustedMetrics(selectedScenario)?.adoptionRate || 0) - (SCENARIOS['status-quo']?.adoptionRate || 0)) >= 0 ? '#10B981' : '#EF4444' }}>
                  {((getAdjustedMetrics(selectedScenario)?.adoptionRate || 0) - (SCENARIOS['status-quo']?.adoptionRate || 0)) >= 0 ? '↑' : '↓'}
                  {Math.abs((getAdjustedMetrics(selectedScenario)?.adoptionRate || 0) - (SCENARIOS['status-quo']?.adoptionRate || 0)).toFixed(0)}% vs status quo
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-xs text-blue-700 mb-1">Adopting</div>
                  <div className="text-lg font-bold text-blue-900">
                    {Math.round((getAdjustedMetrics(selectedScenario)?.adoptionRate / 100 || 0) * (realData?.metadata?.totalSurgeons || 443))}
                  </div>
                  <div className="text-xs text-blue-600">surgeons</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-xs text-blue-700 mb-1">Resistant</div>
                  <div className="text-lg font-bold text-blue-900">
                    {Math.round((1 - getAdjustedMetrics(selectedScenario)?.adoptionRate / 100 || 0) * (realData?.metadata?.totalSurgeons || 443))}
                  </div>
                  <div className="text-xs text-blue-600">surgeons</div>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Outcomes */}
          <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-5 border-2 border-green-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h5 className="text-lg font-bold text-green-900">Operations</h5>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="text-sm text-green-700 mb-1">Implementation Timeline</div>
                <div className="text-3xl font-bold text-green-900">
                  {whatIfParams.implementationMonths}
                </div>
                <div className="text-sm font-medium mt-2" style={{ color: (whatIfParams.implementationMonths - 12) <= 0 ? '#10B981' : '#EF4444' }}>
                  {(whatIfParams.implementationMonths - 12) <= 0 ? '↓' : '↑'}
                  {Math.abs(whatIfParams.implementationMonths - 12)} months vs standard
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-xs text-green-700 mb-1">Complexity</div>
                  <div className="text-lg font-bold text-green-900">
                    {SCENARIOS[selectedScenario]?.implementation?.complexity || 'Medium'}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-xs text-green-700 mb-1">Risk Score</div>
                  <div className="text-lg font-bold text-green-900">
                    {(SCENARIOS[selectedScenario]?.riskScore || 0).toFixed(1)}/10
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setWhatIfParams({
            adoptionModifier: 0,
            priceErosion: 0,
            implementationMonths: 12,
            volumeGrowth: 0,
            surgeonResistance: 0,
            negotiationLeverage: 0
          })}
          className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-all shadow-md"
        >
          <RefreshCw className="w-4 h-4" />
          Reset to Baseline
        </button>
        <button
          onClick={() => setWhatIfParams({
            adoptionModifier: -15,
            priceErosion: 5,
            implementationMonths: 18,
            volumeGrowth: -5,
            surgeonResistance: 25,
            negotiationLeverage: -5
          })}
          className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 font-semibold transition-all shadow-md"
        >
          <AlertTriangle className="w-4 h-4" />
          Worst Case Scenario
        </button>
        <button
          onClick={() => setWhatIfParams({
            adoptionModifier: 15,
            priceErosion: -5,
            implementationMonths: 9,
            volumeGrowth: 8,
            surgeonResistance: 5,
            negotiationLeverage: 15
          })}
          className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 font-semibold transition-all shadow-md"
        >
          <TrendingUp className="w-4 h-4" />
          Best Case Scenario
        </button>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation Header */}
      <NavigationHeader role="executive" specialty="hipknee" specialtyName="Hip & Knee" persona={persona} />

      <div className="p-6">
        <div className="w-full">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS.primary }}>
                <Heart className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Orthopedic Value Analytics
                </h1>
                <p className="text-gray-600 mt-1">
                  CommonSpirit Health | Quintuple Aim Strategic Platform
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {realData ? `${realData.metadata.totalCases.toLocaleString()} Procedures` : 'Loading...'} |
                  {realData ? ` ${realData.regions ? Object.values(realData.regions).reduce((sum, r) => sum + r.surgeons, 0) : realData.surgeons?.length || 0} Surgeons` : ' Loading...'} |
                  Strategic Analysis
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={toggleBookmark}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                title="Bookmark Configuration"
              >
                <Bookmark
                  className="w-5 h-5"
                  fill={bookmarks.find(b => b.scenario === selectedScenario && b.tab === activeTab) ? COLORS.primary : 'none'}
                  color={COLORS.primary}
                />
              </button>
            </div>
          </div>

          {/* Key Context Metrics with Real Data */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200">
              <div className="text-sm text-purple-700 mb-1">Current State</div>
              <div className="text-2xl font-bold text-purple-900">
                {realData ? Object.keys(realData.vendors).length : '20+'} Vendors
              </div>
              <div className="text-xs text-purple-600">Fragmented</div>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-200">
              <div className="text-sm text-green-700 mb-1">Selected Scenario</div>
              <div className="text-2xl font-bold text-green-900">Scenario {selectedScenario}</div>
              <div className="text-xs text-green-600">{SCENARIOS[selectedScenario]?.shortName}</div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
              <div className="text-sm text-blue-700 mb-1">Annual Savings</div>
              <div className="text-2xl font-bold text-blue-900">
                ${SCENARIOS[selectedScenario]?.annualSavings.toFixed(2)}M
              </div>
              <div className="text-xs text-blue-600">Expected value</div>
            </div>

            <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border-2 border-amber-200">
              <div className="text-sm text-amber-700 mb-1">Total Cases {filterProcedureType !== 'all' && `(${filterProcedureType})`}</div>
              <div className="text-2xl font-bold text-amber-900">
                {realData ? (() => {
                  const totalCases = realData.metadata.totalCases;
                  // Estimate: ~85% primary, ~15% revision (industry standard)
                  const primaryCases = Math.round(totalCases * 0.85);
                  const revisionCases = Math.round(totalCases * 0.15);
                  if (filterProcedureType === 'primary') return primaryCases.toLocaleString();
                  if (filterProcedureType === 'revision') return revisionCases.toLocaleString();
                  return totalCases.toLocaleString();
                })() : '0'}
              </div>
              <div className="text-xs text-amber-600">
                {filterProcedureType === 'all' && realData && `~${Math.round(realData.metadata.totalCases * 0.85).toLocaleString()} Primary / ~${Math.round(realData.metadata.totalCases * 0.15).toLocaleString()} Revision`}
                {filterProcedureType === 'primary' && '~85% of total volume'}
                {filterProcedureType === 'revision' && '~15% of total volume'}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border-2 border-red-200">
              <div className="text-sm text-red-700 mb-1">Total Spend</div>
              <div className="text-2xl font-bold text-red-900">
                ${realData ? (realData.metadata.totalSpend / 1000000).toFixed(2) : '0'}M
              </div>
              <div className="text-xs text-red-600">Annual baseline</div>
            </div>
          </div>
        </div>

        {/* What-If Tools */}
        {renderWhatIfTools()}

        {/* Scenario Selector + Tab Navigation */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          {/* Scenario Selector */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700">Active Scenario:</label>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="px-4 py-2 border-2 border-purple-300 rounded-lg font-medium text-gray-900 bg-white hover:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              {Object.values(SCENARIOS).map(scenario => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.shortName} - ${scenario.annualSavings.toFixed(2)}M ({scenario.savingsPercent}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        {renderTabs()}

        {/* Tab Content */}
        <div className="transition-all">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'financial' && renderFinancialTab()}
          {activeTab === 'clinical' && renderClinicalTab()}
          {activeTab === 'components' && renderComponentTab()}
          {activeTab === 'risk' && renderRiskTab()}
          {activeTab === 'mission' && renderMissionTab()}
          {activeTab === 'industry' && renderIndustryTab()}
        </div>

        {/* Footer with Data Source */}
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg">
          <p className="text-sm text-gray-600 text-center">
            Dashboard generated for Doug Barnaby | CommonSpirit Health Strategic Decision-Making
          </p>
          {realData && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Data Source: {realData.metadata.dataSource} |
              Analysis Date: {realData.metadata.analysisDate} |
              Last Updated: {new Date(realData.metadata.lastUpdated).toLocaleString()}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1 text-center">
            Dashboard Version: {realData?.metadata.version || '1.0'} |
            Regions: {realData?.regions ? Object.keys(realData.regions).join(', ') : 'Not yet configured'}
          </p>

          {/* Methodology Note */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <details className="text-left">
              <summary className="text-xs font-semibold text-gray-700 cursor-pointer hover:text-purple-600">
                📊 Case Count Methodology
              </summary>
              <div className="mt-3 text-xs text-gray-600 space-y-2 bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-700">Data Structure:</p>
                <p>
                  Source data contains SKU-level transaction records (one row per component/device).
                  Total case counts ({realData ? realData.metadata.totalCases.toLocaleString() : '27,623'} procedures)
                  are derived from regional surgical volume reporting aggregated across CommonSpirit facilities.
                </p>

                <p className="font-semibold text-gray-700 mt-3">Case Estimation Method:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    <span className="font-medium">Hip Procedures:</span> {realData?.procedureTypes?.hip?.cases.toLocaleString() || '11,063'} cases
                    (${realData?.procedureTypes?.hip ? (realData.procedureTypes.hip.totalSpend / 1000000).toFixed(2) : '15.85'}M spend,
                    avg ${realData?.procedureTypes?.hip?.avgCostPerCase.toLocaleString() || '1,433'} per case)
                  </li>
                  <li>
                    <span className="font-medium">Knee Procedures:</span> {realData?.procedureTypes?.knee?.cases.toLocaleString() || '16,366'} cases
                    (${realData?.procedureTypes?.knee ? (realData.procedureTypes.knee.totalSpend / 1000000).toFixed(2) : '25.96'}M spend,
                    avg ${realData?.procedureTypes?.knee?.avgCostPerCase.toLocaleString() || '1,586'} per case)
                  </li>
                  <li>
                    <span className="font-medium">Primary vs Revision Split:</span> Estimated at ~85% primary / ~15% revision based on
                    industry benchmarks and component category analysis (revision-specific components account for approximately
                    15% of high-value implant spend)
                  </li>
                </ul>

                <p className="font-semibold text-gray-700 mt-3">Component-to-Case Mapping:</p>
                <p>
                  Multiple SKU line items (femoral component, tibial tray, insert, etc.) map to a single surgical case.
                  Regional case counts are validated against component utilization patterns to ensure accuracy.
                  For example, {realData?.componentCategories?.['FEMORAL KNEE COMPONENTS']?.totalQuantity && realData?.procedureTypes?.knee?.cases ? (
                    <>
                      {Math.round(realData.componentCategories['FEMORAL KNEE COMPONENTS'].totalQuantity).toLocaleString()} femoral knee components
                      correlates with {realData.procedureTypes.knee.cases.toLocaleString()} knee cases (ratio ~
                      {(realData.componentCategories['FEMORAL KNEE COMPONENTS'].totalQuantity / realData.procedureTypes.knee.cases).toFixed(2)}:1)
                    </>
                  ) : 'component quantities align with reported case volumes'}.
                </p>

                <p className="font-semibold text-gray-700 mt-3">Data Quality Notes:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>SKU-level spend data is highly accurate (sourced from procurement/AP systems)</li>
                  <li>Case counts are facility-reported surgical volumes (validated against OR scheduling systems)</li>
                  <li>Small discrepancies may exist due to bilateral procedures, staged revisions, or data timing differences</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default EnhancedOrthopedicDashboard;
