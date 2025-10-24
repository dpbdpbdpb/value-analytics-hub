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
  const persona = searchParams.get('persona') || 'integrated'; // default to integrated (all tabs)
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
  const [visibleHospitalCount, setVisibleHospitalCount] = useState(10); // Show 10 hospitals initially

  // Surgeon analytics state
  const [surgeonSearchQuery, setSurgeonSearchQuery] = useState('');
  const [selectedSurgeon, setSelectedSurgeon] = useState(null);
  const [surgeonFilter, setSurgeonFilter] = useState('all'); // all, loyalists, sherpas, high-volume, transitioning

  // What-if scenario sliders
  const [whatIfParams, setWhatIfParams] = useState({
    adoptionModifier: 0, // -20 to +20
    priceErosion: 0, // -10 to +10
    implementationMonths: 12, // 6 to 24
    volumeGrowth: 0, // -15 to +15
    surgeonResistance: 0, // 0 to 30
    negotiationLeverage: 0, // -10 to +20
    savingsAdjustment: 0, // -30 to +30 percentage adjustment
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

  // Filter real data based on procedure type before generating scenarios
  const filteredRealData = useMemo(() => {
    if (!realData) return null;

    // If "all" is selected, return original data
    if (filterProcedureType === 'all') return realData;

    // Filter components based on procedure type
    const filteredComponents = realData.components.filter(component => {
      const isRevision = component.procedureType?.toUpperCase().includes('REVISION');

      if (filterProcedureType === 'primary') return !isRevision;
      if (filterProcedureType === 'revision') return isRevision;
      return true;
    });

    // Calculate new metadata based on filtered components
    const filteredSpend = filteredComponents.reduce((sum, c) => sum + (c.totalSpend || 0), 0);
    const filteredQuantity = filteredComponents.reduce((sum, c) => sum + (c.quantity || 0), 0);

    // Return filtered data with updated metadata
    return {
      ...realData,
      components: filteredComponents,
      metadata: {
        ...realData.metadata,
        totalSpend: filteredSpend,
        totalCases: filteredQuantity
      }
    };
  }, [realData, filterProcedureType]);

  // Load scenarios from filtered real data
  const SCENARIOS = useMemo(() => {
    if (!filteredRealData?.scenarios) {
      return {}; // Return empty object if no data loaded yet
    }
    // Use generateScenarios to:
    // 1. Filter out "pricing-cap" (it's a metric, not a scenario)
    // 2. Convert units (dollars → millions, decimals → percentages)
    // 3. Preserve pre-calculated risk levels from the data file
    return generateScenarios(filteredRealData);
  }, [filteredRealData]);

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

    const volumeAdjustment = whatIfParams.volumeGrowth / 100;
    const leverageAdjustment = whatIfParams.negotiationLeverage / 100;
    const savingsAdjustment = whatIfParams.savingsAdjustment / 100;

    // Savings affected by volume growth, negotiation leverage, and savings adjustment
    const baseSavings = base.annualSavings;
    const volumeImpact = baseSavings * (1 + volumeAdjustment);
    const leverageImpact = volumeImpact * (1 + leverageAdjustment);
    const adjustedSavings = leverageImpact * (1 + savingsAdjustment);

    return {
      ...base,
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
  }, [SCENARIOS, sortBy, filterRisk, filterProcedureType]);

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
      { id: 'overview', label: 'Overview', icon: Eye, personas: ['financial', 'operational', 'clinical', 'integrated'] },
      { id: 'financial', label: 'Financial Analysis', icon: DollarSign, personas: ['financial', 'operational', 'integrated'] },
      { id: 'clinical', label: 'Clinical Analysis', icon: Stethoscope, personas: ['clinical', 'integrated'] },
      { id: 'surgeons', label: 'Surgeon Analytics', icon: Users2, personas: ['clinical', 'operational', 'integrated'] },
      { id: 'components', label: 'Component Analysis', icon: Package, personas: ['financial', 'operational', 'integrated'] }
    ];

    // Filter tabs based on current persona (integrated shows all tabs)
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
      {/* Real Data Indicators */}
      {filteredRealData && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <div className="font-bold text-green-900">
                  Real CommonSpirit Data Loaded
                  {filterProcedureType !== 'all' && (
                    <span className="ml-2 text-sm text-green-700">
                      (Filtered: {filterProcedureType === 'primary' ? 'Primary' : 'Revision'} Only)
                    </span>
                  )}
                </div>
                <div className="text-sm text-green-700">
                  {filteredRealData.metadata.totalCases.toLocaleString()} cases |
                  ${(filteredRealData.metadata.totalSpend / 1000000).toFixed(2)}M total spend |
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
                    className={`px-3 py-3 text-center font-bold text-gray-900 min-w-[160px] max-w-[200px] cursor-pointer hover:bg-gray-200 ${
                      selectedScenario === scenario.id ? 'bg-purple-100' : ''
                    }`}
                    onClick={() => setSelectedScenario(scenario.id)}
                  >
                    <div className="font-bold text-sm break-words leading-tight">{scenario.shortName}</div>
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
                  </td>
                ))}
              </tr>

              {/* Loyalists Needing Transition Row */}
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-4 font-semibold text-gray-700 sticky left-0 bg-white z-10">
                  Loyalists Needing Transition
                </td>
                {filteredScenarios.map(scenario => (
                  <td
                    key={scenario.id}
                    className={`px-4 py-4 text-center ${selectedScenario === scenario.id ? 'bg-purple-50' : ''}`}
                  >
                    <div className="font-bold text-orange-600 text-lg">
                      {scenario.volumeWeightedRisk?.loyalistsAffected || 0}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      <span className="font-semibold text-red-600">
                        {scenario.volumeWeightedRisk?.highVolumeSurgeonsAffected || 0} high-volume
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {((scenario.volumeWeightedRisk?.loyalistsAffected || 0) / (realData?.surgeons?.length || 1) * 100).toFixed(0)}% of surgeons
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

              {/* Robotic Platform Alignment Row */}
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-4 font-semibold text-gray-700 sticky left-0 bg-white z-10">
                  Robotic Platform Alignment
                </td>
                {filteredScenarios.map(scenario => (
                  <td
                    key={scenario.id}
                    className={`px-4 py-4 text-center ${selectedScenario === scenario.id ? 'bg-purple-50' : ''}`}
                  >
                    {scenario.roboticPlatformAlignment ? (
                      <>
                        <div className={`font-bold text-lg ${
                          scenario.roboticPlatformAlignment.alignmentScore >= 90 ? 'text-green-600' :
                          scenario.roboticPlatformAlignment.alignmentScore >= 70 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {scenario.roboticPlatformAlignment.alignmentScore.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {scenario.roboticPlatformAlignment.compatibleCases.toLocaleString()} / {scenario.roboticPlatformAlignment.totalRoboticCases.toLocaleString()} cases
                        </div>
                        {scenario.roboticPlatformAlignment.incompatibleCases > 0 && (
                          <div className="text-xs text-red-600 font-semibold mt-1">
                            {scenario.roboticPlatformAlignment.incompatibleCases.toLocaleString()} stranded
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400 text-sm">N/A</span>
                    )}
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

              {/* Pricing Cap Section Header */}
              <tr className="bg-blue-50 border-t-2 border-blue-200">
                <td colSpan={filteredScenarios.length + 1} className="px-4 py-3">
                  <div className="font-bold text-blue-900 text-sm uppercase tracking-wide mb-2">
                    + Pricing Cap Strategy (Additional Savings Potential)
                  </div>
                  <div className="text-xs text-blue-800 normal-case font-normal leading-relaxed">
                    <strong>Methodology:</strong> Set a maximum allowed price per complete construct: <strong>$2,500 for knee procedures, $3,000 for hip procedures.</strong> This cap applies to the total cost of all implant components used in a single procedure. All spending above these caps represents savings opportunity.
                    <br/>
                    <strong className="mt-1 inline-block">Feasibility Model:</strong> Expected savings = Total potential × Feasibility%.
                    Base feasibility by vendor count: 1 vendor (70%), 2 vendors (60%), 3 vendors (50%), 4+ vendors (30%).
                    Adjustments: Stryker presence -10% (premium positioning), J&J/Zimmer +8% (competitive pricing), S&N +7% (market share hungry).
                    <br/>
                    <strong className="mt-1 inline-block">Implementation:</strong> Pricing caps are enforced through contract language requiring vendors to bundle implant components at or below the construct price cap ($2,500 knee / $3,000 hip).
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
                {/* Risk levels from low to high (top to bottom) - aligned with riskLevel categories */}
                {[
                  { label: 'Low (0-3)', min: 0, max: 3 },
                  { label: 'Medium (3-5)', min: 3, max: 5 },
                  { label: 'Medium-High (5-7)', min: 5, max: 7 },
                  { label: 'High (7-10)', min: 7, max: 10 }
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
                        const savingsPercent = s.savingsPercent || 0; // Already in percentage format from scenarios.js
                        const risk = s.riskScore || 0;
                        return savingsPercent >= savingsCol.min && savingsPercent < savingsCol.max &&
                               risk >= riskRow.min && risk < riskRow.max;
                      });

                      const rewardScore = colIdx;
                      const riskScore = 3 - rowIdx; // 4 rows (0-3), lower rowIdx = lower risk = higher score
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
                                    {s.savingsPercent.toFixed(0)}% / {s.riskScore.toFixed(1)}
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
      const mustTransition = isLoyalist && !scenarioVendors.includes(primaryVendor);

      return {
        ...surgeon,
        volume,
        volumeCategory,
        primaryVendor,
        primaryVendorPercent,
        primaryVendorCases,
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

    // Group by region (will be updated with hospital risk scores later)
    const regionalImpact = {};
    surgeonImpact.forEach(surgeon => {
      const region = surgeon.region || 'Unassigned';
      if (!regionalImpact[region]) {
        regionalImpact[region] = {
          totalSurgeons: 0,
          needingTransition: 0,
          highVolumeLoyalists: 0,
          highVolLoyalistCases: 0, // Total cases performed by high-volume loyalists
          casesAtRisk: 0,
          totalCases: 0,
          hospitals: [],
          riskScores: []
        };
      }
      regionalImpact[region].totalSurgeons++;
      regionalImpact[region].totalCases += surgeon.volume;
      if (surgeon.mustTransition) {
        regionalImpact[region].needingTransition++;
        regionalImpact[region].casesAtRisk += surgeon.volume;
        if (surgeon.volumeCategory === 'high' && surgeon.isLoyalist) {
          regionalImpact[region].highVolumeLoyalists++;
          regionalImpact[region].highVolLoyalistCases += surgeon.volume; // Track total cases
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
          highVolLoyalistCases: 0, // Total cases performed by high-volume loyalists
          loyalistsNeedingTransition: 0,
          casesAtRisk: 0,
          totalCases: 0,
          vendorDiversity: new Set(),
          transitioningVendors: new Set(),
          vendorCaseCounts: {}, // Track cases by vendor
          highVolLoyalistVendors: {} // Track vendors for high-volume loyalists
        };
      }
      hospitalImpact[facility].totalSurgeons++;
      hospitalImpact[facility].totalCases += surgeon.volume;
      hospitalImpact[facility].vendorDiversity.add(surgeon.primaryVendor);

      // Track vendor case counts
      const vendor = surgeon.primaryVendor || 'Unknown';
      if (!hospitalImpact[facility].vendorCaseCounts[vendor]) {
        hospitalImpact[facility].vendorCaseCounts[vendor] = 0;
      }
      hospitalImpact[facility].vendorCaseCounts[vendor] += surgeon.volume;

      if (surgeon.mustTransition) {
        hospitalImpact[facility].needingTransition++;
        hospitalImpact[facility].casesAtRisk += surgeon.volume;
        hospitalImpact[facility].transitioningVendors.add(surgeon.primaryVendor);
        if (surgeon.isLoyalist) {
          hospitalImpact[facility].loyalistsNeedingTransition++;
        }
        if (surgeon.volumeCategory === 'high' && surgeon.isLoyalist) {
          hospitalImpact[facility].highVolumeLoyalists++;
          hospitalImpact[facility].highVolLoyalistCases += surgeon.volume; // Track total cases
          // Track which vendor this high-volume loyalist uses
          if (!hospitalImpact[facility].highVolLoyalistVendors[vendor]) {
            hospitalImpact[facility].highVolLoyalistVendors[vendor] = 0;
          }
          hospitalImpact[facility].highVolLoyalistVendors[vendor]++;
        }
      }
    });

    // Calculate risk scores for each hospital and aggregate to regions
    Object.entries(hospitalImpact).forEach(([facility, hospital]) => {
      // Volume-weighted sherpa calculation:
      // Only count surgeons with ≥30 cases as potential sherpas
      // Weight their contribution by their case volume (normalized per 100 cases)
      const sherpas = surgeonImpact.filter(s => s.facility === facility && !s.mustTransition && s.volume >= 30);

      const sherpaCapacity = sherpas.reduce((sum, s) => sum + (s.volume / 100), 0);

      const loyalistCount = hospital.loyalistsNeedingTransition;
      const sherpaRatio = loyalistCount > 0 ? sherpaCapacity / loyalistCount : 0;

      // Count sherpas and track their vendors
      const potentialSherpas = sherpas.length;
      const sherpaVendors = {};
      sherpas.forEach(s => {
        const vendor = s.primaryVendor || 'Unknown';
        sherpaVendors[vendor] = (sherpaVendors[vendor] || 0) + 1;
      });

      // Store sherpa metrics in hospital object for reuse
      hospital.sherpaRatio = sherpaRatio;
      hospital.sherpaCapacity = sherpaCapacity;
      hospital.potentialSherpas = potentialSherpas;
      hospital.sherpaVendors = sherpaVendors;

      // Determine preferred vendor (vendor with most cases)
      let preferredVendor = 'Unknown';
      let preferredVendorCases = 0;
      Object.entries(hospital.vendorCaseCounts).forEach(([vendor, cases]) => {
        if (cases > preferredVendorCases) {
          preferredVendorCases = cases;
          preferredVendor = vendor;
        }
      });
      const preferredVendorPercent = hospital.totalCases > 0 ? (preferredVendorCases / hospital.totalCases) * 100 : 0;
      hospital.preferredVendor = preferredVendor;
      hospital.preferredVendorPercent = preferredVendorPercent;

      // Calculate hospital risk score (0-10 scale, higher = more risk)
      // Base risk from loyalists and sherpa ratio
      let baseRisk = 0;

      if (hospital.highVolumeLoyalists >= 3) {
        if (sherpaRatio < 1.5) {
          baseRisk = 8; // High risk
        } else if (sherpaRatio < 2.5) {
          baseRisk = 5; // Medium risk
        } else {
          baseRisk = 2; // Low risk
        }
      } else if (hospital.highVolumeLoyalists === 2) {
        if (sherpaRatio < 0.8) {
          baseRisk = 8; // High risk
        } else if (sherpaRatio < 2) {
          baseRisk = 5; // Medium risk
        } else {
          baseRisk = 2; // Low risk
        }
      } else if (hospital.highVolumeLoyalists === 1) {
        if (sherpaRatio < 1) {
          baseRisk = 5; // Medium risk
        } else {
          baseRisk = 2; // Low risk
        }
      } else {
        baseRisk = 1; // Very low risk (no high-volume loyalists)
      }

      // Adjust risk based on volume of cases at risk
      // High volume of cases at risk increases the stakes and overall risk
      let volumeMultiplier = 1.0;
      if (hospital.casesAtRisk >= 300) {
        volumeMultiplier = 1.4; // Significantly increase risk for very high volume
      } else if (hospital.casesAtRisk >= 200) {
        volumeMultiplier = 1.3;
      } else if (hospital.casesAtRisk >= 150) {
        volumeMultiplier = 1.2;
      } else if (hospital.casesAtRisk >= 100) {
        volumeMultiplier = 1.1;
      } else if (hospital.casesAtRisk <= 30) {
        volumeMultiplier = 0.8; // Reduce risk for low volume
      }

      // Final risk score capped at 10
      let riskScore = Math.min(10, baseRisk * volumeMultiplier);

      // Store risk score in hospital object for reuse
      hospital.riskScore = riskScore;

      // Weight the risk score by cases at risk (hospital with more cases has bigger impact on regional risk)
      const weightedRisk = riskScore * hospital.casesAtRisk;

      // Aggregate to region
      const region = hospital.region;
      if (regionalImpact[region]) {
        regionalImpact[region].hospitals.push(facility);
        regionalImpact[region].riskScores.push({ score: riskScore, weight: hospital.casesAtRisk, weightedRisk, sherpaRatio });
      }
    });

    // Calculate average risk score and sherpa ratio for each region (weighted by cases at risk)
    Object.keys(regionalImpact).forEach(region => {
      const data = regionalImpact[region];
      if (data.riskScores.length > 0) {
        const totalWeight = data.riskScores.reduce((sum, r) => sum + r.weight, 0);
        const totalWeightedRisk = data.riskScores.reduce((sum, r) => sum + r.weightedRisk, 0);
        const totalWeightedSherpaRatio = data.riskScores.reduce((sum, r) => sum + (r.sherpaRatio * r.weight), 0);

        data.avgRiskScore = totalWeight > 0 ? totalWeightedRisk / totalWeight : 0;
        data.avgSherpaRatio = totalWeight > 0 ? totalWeightedSherpaRatio / totalWeight : 0;
        data.hospitalCount = data.hospitals.length;
      } else {
        data.avgRiskScore = 0;
        data.avgSherpaRatio = 0;
        data.hospitalCount = 0;
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

    // Top high-risk hospitals (sorted by risk score: high to low)
    const topRiskHospitals = Object.entries(hospitalImpact)
      .filter(([_, data]) => data.needingTransition > 0)
      .map(([facility, data]) => {
        // Use the pre-calculated risk score (which includes volume adjustment)
        return { facility, ...data };
      })
      .sort((a, b) => b.riskScore - a.riskScore); // Sort by risk score descending (high risk first)

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
                  <th className="text-center p-4 font-bold text-purple-900" title="Surgeons with >200 cases/year who are ≥70% loyal to a vendor not in this scenario. These surgeons represent high-impact transition challenges.">High-Vol Loyalists</th>
                  <th className="text-center p-4 font-bold text-purple-900">Cases at Risk</th>
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
                        <td className="p-4 text-center font-bold text-orange-600">
                          {data.highVolumeLoyalists}
                          {data.highVolumeLoyalists > 0 && (
                            <span className="text-xs text-gray-500 ml-2">
                              ({data.highVolLoyalistCases.toLocaleString()})
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center font-bold text-purple-600">{data.casesAtRisk.toLocaleString()}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Robotic Platform Alignment */}
        {scenario.roboticPlatformAlignment && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              Robotic Platform Alignment
            </h3>

            <div className="mb-4">
              <div className={`border-l-4 p-4 rounded-lg ${
                scenario.roboticPlatformAlignment.alignmentScore >= 90 ? 'bg-green-50 border-green-600' :
                scenario.roboticPlatformAlignment.alignmentScore >= 70 ? 'bg-yellow-50 border-yellow-600' :
                'bg-red-50 border-red-600'
              }`}>
                <p className={`text-sm ${
                  scenario.roboticPlatformAlignment.alignmentScore >= 90 ? 'text-green-800' :
                  scenario.roboticPlatformAlignment.alignmentScore >= 70 ? 'text-yellow-800' :
                  'text-red-800'
                }`}>
                  <strong>Platform Compatibility:</strong> Robotic surgical systems represent significant capital investments and create vendor lock-in.
                  This scenario's vendor mix {scenario.roboticPlatformAlignment.alignmentScore >= 90 ? 'strongly supports' :
                    scenario.roboticPlatformAlignment.alignmentScore >= 70 ? 'moderately supports' : 'creates challenges for'} existing robotic platform investments.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="text-xs text-purple-600 font-semibold mb-1">Alignment Score</div>
                <div className={`text-3xl font-bold ${
                  scenario.roboticPlatformAlignment.alignmentScore >= 90 ? 'text-green-600' :
                  scenario.roboticPlatformAlignment.alignmentScore >= 70 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {scenario.roboticPlatformAlignment.alignmentScore.toFixed(1)}%
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-600 font-semibold mb-1">Total Robotic Cases</div>
                <div className="text-3xl font-bold text-blue-600">
                  {scenario.roboticPlatformAlignment.totalRoboticCases.toLocaleString()}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="text-xs text-green-600 font-semibold mb-1">Compatible Cases</div>
                <div className="text-3xl font-bold text-green-600">
                  {scenario.roboticPlatformAlignment.compatibleCases.toLocaleString()}
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                <div className="text-xs text-red-600 font-semibold mb-1">Stranded Cases</div>
                <div className="text-3xl font-bold text-red-600">
                  {scenario.roboticPlatformAlignment.incompatibleCases.toLocaleString()}
                </div>
              </div>
            </div>

            {scenario.roboticPlatformAlignment.incompatiblePlatforms &&
             scenario.roboticPlatformAlignment.incompatiblePlatforms.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-3">Stranded Robotic Investments</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-red-100 border-b-2 border-red-300">
                        <th className="text-left p-3 font-bold text-red-900">Platform</th>
                        <th className="text-left p-3 font-bold text-red-900">Facility</th>
                        <th className="text-right p-3 font-bold text-red-900">Stranded Cases</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scenario.roboticPlatformAlignment.incompatiblePlatforms
                        .sort((a, b) => b.cases - a.cases)
                        .slice(0, 10)
                        .map((item, idx) => (
                          <tr key={idx} className="border-b border-gray-200 hover:bg-red-50">
                            <td className="p-3 font-semibold text-gray-900">{item.platform}</td>
                            <td className="p-3 text-gray-700">{item.facility}</td>
                            <td className="p-3 text-right font-bold text-red-600">{item.cases.toLocaleString()}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hospital Impact & Risk Assessment (Combined) */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-purple-600" />
            Hospital Impact & Risk Assessment
          </h3>
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg mb-4">
            <p className="text-sm text-blue-800">
              <strong>Risk Assessment:</strong> Hospitals with high-volume loyalists needing transition but good peer sherpa ratios (aligned surgeons who can mentor) have lower implementation risk.
              <strong className="ml-2">Sherpa Ratio:</strong> Volume-weighted capacity of experienced surgeons (≥30 cases/year) available to support each transitioning loyalist. A surgeon doing 100 cases/year = 1.0 unit of capacity, 200 cases/year = 2.0 units, etc.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-purple-100 border-b-2 border-purple-300">
                  <th className="text-left p-4 font-bold text-purple-900">Hospital</th>
                  <th className="text-center p-4 font-bold text-purple-900">Region</th>
                  <th className="text-center p-4 font-bold text-purple-900">Preferred Vendor</th>
                  <th className="text-center p-4 font-bold text-purple-900" title="Surgeons with >200 cases/year who are ≥70% loyal to a vendor not in this scenario. These surgeons represent high-impact transition challenges.">High-Vol Loyalists</th>
                  <th className="text-center p-4 font-bold text-purple-900">Loyalist Vendors</th>
                  <th className="text-center p-4 font-bold text-purple-900">Total Transitioning</th>
                  <th className="text-center p-4 font-bold text-purple-900">Cases at Risk</th>
                  <th className="text-center p-4 font-bold text-purple-900">Experienced Sherpas<br/><span className="text-xs font-normal">(≥30 cases/yr)</span></th>
                  <th className="text-center p-4 font-bold text-purple-900">Sherpa Capacity<br/><span className="text-xs font-normal">(volume-weighted)</span></th>
                  <th className="text-left p-4 font-bold text-purple-900">Implementation Risk</th>
                </tr>
              </thead>
              <tbody>
                {topRiskHospitals.slice(0, visibleHospitalCount).map((hospital, idx) => {
                  // Use the pre-calculated volume-weighted sherpa metrics
                  const potentialSherpas = hospital.potentialSherpas;
                  const sherpaRatio = hospital.sherpaRatio;

                  // More realistic risk assessment with lower thresholds
                  let riskLevel = 'Low';
                  let riskColor = 'bg-green-100 text-green-800';

                  // High Risk: Multiple high-volume loyalists with insufficient sherpa support
                  if (hospital.highVolumeLoyalists >= 3) {
                    if (sherpaRatio < 1.5) {
                      riskLevel = 'High';
                      riskColor = 'bg-red-100 text-red-800';
                    } else if (sherpaRatio < 2.5) {
                      riskLevel = 'Medium';
                      riskColor = 'bg-orange-100 text-orange-800';
                    }
                  } else if (hospital.highVolumeLoyalists === 2) {
                    if (sherpaRatio < 0.8) {
                      riskLevel = 'High';
                      riskColor = 'bg-red-100 text-red-800';
                    } else if (sherpaRatio < 2) {
                      riskLevel = 'Medium';
                      riskColor = 'bg-orange-100 text-orange-800';
                    }
                  } else if (hospital.highVolumeLoyalists === 1) {
                    if (sherpaRatio < 1) {
                      riskLevel = 'Medium';
                      riskColor = 'bg-orange-100 text-orange-800';
                    }
                  }

                  return (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-purple-50">
                      <td className="p-4 font-semibold text-gray-900">{hospital.facility}</td>
                      <td className="p-4 text-center text-gray-700">{hospital.region}</td>
                      <td className="p-4 text-center">
                        <div className="font-semibold text-gray-900">{hospital.preferredVendor}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {hospital.preferredVendorPercent.toFixed(0)}% of cases
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-bold text-xl text-orange-600">
                          {hospital.highVolumeLoyalists}
                          {hospital.highVolumeLoyalists > 0 && (
                            <span className="text-sm text-gray-600 ml-1">
                              ({hospital.highVolLoyalistCases.toLocaleString()})
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {hospital.highVolumeLoyalists > 0 ? (
                          <div className="text-sm">
                            {Object.entries(hospital.highVolLoyalistVendors || {})
                              .sort((a, b) => b[1] - a[1])
                              .map(([vendor, count]) => (
                                <div key={vendor} className="text-gray-900">
                                  <span className="font-semibold">{vendor}</span>
                                  <span className="text-gray-600 ml-1">({count})</span>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="p-4 text-center font-bold text-red-600">{hospital.needingTransition}</td>
                      <td className="p-4 text-center font-bold text-purple-600">{hospital.casesAtRisk.toLocaleString()}</td>
                      <td className="p-4 text-center">
                        {potentialSherpas > 0 ? (
                          <div>
                            <div className="font-bold text-xl text-green-600">{potentialSherpas}</div>
                            {hospital.sherpaVendors && Object.keys(hospital.sherpaVendors).length > 0 && (
                              <div className="text-xs text-gray-600 mt-1">
                                {Object.entries(hospital.sherpaVendors)
                                  .sort((a, b) => b[1] - a[1])
                                  .map(([vendor, count]) => (
                                    <div key={vendor}>
                                      {vendor} ({count})
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xl">—</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-bold text-blue-600">{sherpaRatio.toFixed(1)}:1</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${riskColor}`}>
                          {riskLevel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Show More / Show Less Button */}
          {topRiskHospitals.length > 10 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  if (visibleHospitalCount < topRiskHospitals.length) {
                    setVisibleHospitalCount(prev => Math.min(prev + 10, topRiskHospitals.length));
                  } else {
                    setVisibleHospitalCount(10);
                  }
                }}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                {visibleHospitalCount < topRiskHospitals.length
                  ? `Show More (${topRiskHospitals.length - visibleHospitalCount} remaining)`
                  : 'Show Less'}
              </button>
              <div className="text-sm text-gray-600 mt-2">
                Showing {visibleHospitalCount} of {topRiskHospitals.length} hospitals
              </div>
            </div>
          )}
        </div>

        {/* Regional Transition Heat Map */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-600" />
            Regional Transition Heat Map
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Implementation Risk aggregates hospital-level assessments (considering high-volume loyalists + sherpa support). Support Ratio shows average aligned surgeons available per transitioning loyalist — <span className="font-semibold">green = strong support (lower risk), red = limited support (higher risk)</span>.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-4 py-3 text-left font-bold text-gray-900">Region</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-900">Hospitals</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-900">Surgeons Needing Transition</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-900" title="Surgeons with >200 cases/year who are ≥70% loyal to a vendor not in this scenario. These surgeons represent high-impact transition challenges.">High-Vol Loyalists</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-900">Cases at Risk</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-900">Support Ratio<br/><span className="text-xs font-normal">(higher = better)</span></th>
                  <th className="px-4 py-3 text-center font-bold text-gray-900">Implementation Risk</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(regionalImpact)
                  .sort((a, b) => b[1].casesAtRisk - a[1].casesAtRisk)
                  .map(([region, data]) => {
                    const impactPercent = (data.needingTransition / data.totalSurgeons) * 100;

                    // Helper functions to get color based on ABSOLUTE thresholds (not relative)
                    // Using softer rose/amber/teal palette instead of harsh red/orange/green
                    const getSurgeonTransitionColor = (needingTransition, totalSurgeons) => {
                      const percent = (needingTransition / totalSurgeons) * 100;
                      if (percent >= 50) return 'bg-rose-300 text-rose-900 font-bold';
                      if (percent >= 35) return 'bg-rose-200 text-rose-900 font-semibold';
                      if (percent >= 25) return 'bg-amber-200 text-amber-900 font-medium';
                      if (percent >= 15) return 'bg-yellow-100 text-yellow-900';
                      return 'bg-teal-50 text-teal-800';
                    };

                    const getLoyalistColor = (count) => {
                      if (count >= 6) return 'bg-rose-300 text-rose-900 font-bold';
                      if (count >= 4) return 'bg-rose-200 text-rose-900 font-semibold';
                      if (count >= 3) return 'bg-amber-200 text-amber-900 font-medium';
                      if (count >= 2) return 'bg-yellow-100 text-yellow-900';
                      if (count >= 1) return 'bg-teal-100 text-teal-800 font-medium';
                      return 'bg-teal-50 text-teal-700';
                    };

                    const getCasesColor = (cases) => {
                      if (cases >= 150) return 'bg-rose-300 text-rose-900 font-bold';
                      if (cases >= 100) return 'bg-rose-200 text-rose-900 font-semibold';
                      if (cases >= 60) return 'bg-amber-200 text-amber-900 font-medium';
                      if (cases >= 30) return 'bg-yellow-100 text-yellow-900';
                      return 'bg-teal-50 text-teal-800';
                    };

                    return (
                      <tr key={region} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-900">{region}</td>
                        <td className="px-4 py-3 text-center text-gray-700 font-medium">{data.hospitalCount}</td>
                        <td className={`px-4 py-3 text-center ${getSurgeonTransitionColor(data.needingTransition, data.totalSurgeons)}`}>
                          {data.needingTransition} / {data.totalSurgeons}
                          <div className="text-xs opacity-75 mt-1">
                            ({((data.needingTransition / data.totalSurgeons) * 100).toFixed(0)}%)
                          </div>
                        </td>
                        <td className={`px-4 py-3 text-center ${getLoyalistColor(data.highVolumeLoyalists)}`}>
                          {data.highVolumeLoyalists}
                          {data.highVolumeLoyalists > 0 && (
                            <span className="text-xs opacity-75 ml-1">
                              ({data.highVolLoyalistCases.toLocaleString()})
                            </span>
                          )}
                        </td>
                        <td className={`px-4 py-3 text-center ${getCasesColor(data.casesAtRisk)}`}>
                          {data.casesAtRisk.toLocaleString()}
                          <div className="text-xs opacity-75 mt-1">
                            ({((data.casesAtRisk / data.totalCases) * 100).toFixed(0)}%)
                          </div>
                        </td>
                        <td className={`px-4 py-3 text-center ${
                          data.avgSherpaRatio >= 2.5 ? 'bg-teal-400 text-teal-900 font-bold' :
                          data.avgSherpaRatio >= 2 ? 'bg-teal-300 text-teal-900 font-semibold' :
                          data.avgSherpaRatio >= 1.5 ? 'bg-teal-100 text-teal-800 font-medium' :
                          data.avgSherpaRatio >= 1 ? 'bg-yellow-100 text-yellow-900' :
                          data.avgSherpaRatio >= 0.5 ? 'bg-amber-200 text-amber-900 font-medium' :
                          'bg-rose-300 text-rose-900 font-bold'
                        }`}>
                          <div className="font-bold">
                            {data.avgSherpaRatio.toFixed(2)}:1
                          </div>
                          <div className="text-xs opacity-75 mt-1">
                            {data.avgSherpaRatio >= 2 ? '✓ Strong' :
                             data.avgSherpaRatio >= 1 ? 'Adequate' : '⚠ Limited'}
                          </div>
                        </td>
                        <td className={`px-4 py-3 text-center ${
                          data.avgRiskScore >= 7 ? 'bg-red-100 text-red-800' :
                          data.avgRiskScore >= 5 ? 'bg-orange-100 text-orange-800' :
                          data.avgRiskScore >= 3 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          <div className="font-bold">
                            {data.avgRiskScore >= 7 ? 'High' :
                             data.avgRiskScore >= 5 ? 'Medium' :
                             data.avgRiskScore >= 3 ? 'Low' : 'Very Low'}
                          </div>
                          <div className="text-xs opacity-75 mt-1">
                            Score: {data.avgRiskScore.toFixed(1)}/10
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-6 text-sm">
            <span className="font-semibold text-gray-700">Heat Map Legend:</span>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 font-medium">← Favorable</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-teal-400 rounded border border-gray-400"></div>
                <div className="w-6 h-6 bg-teal-100 rounded border border-gray-400"></div>
                <div className="w-6 h-6 bg-yellow-100 rounded border border-gray-400"></div>
                <div className="w-6 h-6 bg-amber-200 rounded border border-gray-400"></div>
                <div className="w-6 h-6 bg-rose-200 rounded border border-gray-400"></div>
                <div className="w-6 h-6 bg-rose-300 rounded border border-gray-400"></div>
              </div>
              <span className="text-gray-600 font-medium">Unfavorable →</span>
            </div>
            <div className="text-xs text-gray-500 italic ml-2">
              (Note: Support Ratio reverses scale - higher is more favorable)
            </div>
          </div>
        </div>

        {/* Quality Metrics Overview - Moved to bottom */}
        {/* Quality & Outcomes Metrics Placeholder */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-300">
          <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Quality & Outcomes Metrics
          </h3>
          <div className="bg-white rounded-lg p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <Info className="w-5 h-5 text-blue-500" />
              <p className="text-gray-700 font-medium">
                Clinical quality outcomes data integration pending
              </p>
            </div>
            <p className="text-sm text-gray-600 ml-8">
              This section will display real-time quality metrics including revision rates, readmissions,
              length of stay, complications, and infection rates when clinical outcomes data is integrated
              from the CommonSpirit quality reporting systems.
            </p>
          </div>
        </div>

      </div>
    );
  };

  // COMPONENT ANALYSIS TAB - Using procedure-based classification
  const renderComponentTab = () => {
    const procedureData = realData?.matrixPricingByProcedure || { primary: [], revision: [] };
    const components = realData?.matrixPricing || [];
    const totalSavings = components.reduce((sum, item) => sum + item.potentialSavings, 0);

    // Classification helpers for hip vs knee
    const hipKeywords = ['hip', 'femoral head', 'acetabular', 'stem', 'cup', 'bi polar', 'uni polar', 'femur'];
    const kneeKeywords = ['knee', 'tibial', 'femoral component', 'patella', 'bearing', 'tray'];

    const isHip = (category) => {
      const cat = category.toLowerCase();
      return hipKeywords.some(k => cat.includes(k)) && !cat.includes('knee');
    };

    const isKnee = (category) => {
      const cat = category.toLowerCase();
      return kneeKeywords.some(k => cat.includes(k));
    };

    // Group components by procedure type and body part
    const hipPrimary = procedureData.primary.filter(c => isHip(c.category));
    const hipRevision = procedureData.revision.filter(c => isHip(c.category));
    const kneePrimary = procedureData.primary.filter(c => isKnee(c.category));
    const kneeRevision = procedureData.revision.filter(c => isKnee(c.category));

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
              {filterProcedureType !== 'all' && (
                <span className="text-sm text-blue-600 font-normal ml-2">
                  ({filterProcedureType === 'primary' ? 'Primary Only' : 'Revision Only'})
                </span>
              )}
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {(filterProcedureType === 'all' || filterProcedureType === 'primary') &&
                renderComponentTable(hipPrimary, 'Hip Primary', 'bg-blue-50', 'border-blue-200')}
              {(filterProcedureType === 'all' || filterProcedureType === 'revision') &&
                renderComponentTable(hipRevision, 'Hip Revision', 'bg-amber-50', 'border-amber-200')}
            </div>
          </div>

          {/* Knee Components */}
          <div>
            <h3 className="text-xl font-bold text-teal-900 mb-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
              Knee Procedures
              {filterProcedureType !== 'all' && (
                <span className="text-sm text-teal-600 font-normal ml-2">
                  ({filterProcedureType === 'primary' ? 'Primary Only' : 'Revision Only'})
                </span>
              )}
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {(filterProcedureType === 'all' || filterProcedureType === 'primary') &&
                renderComponentTable(kneePrimary, 'Knee Primary', 'bg-teal-50', 'border-teal-200')}
              {(filterProcedureType === 'all' || filterProcedureType === 'revision') &&
                renderComponentTable(kneeRevision, 'Knee Revision', 'bg-orange-50', 'border-orange-200')}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // SURGEON ANALYTICS TAB
  const renderSurgeonTab = () => {
    const scenario = SCENARIOS[selectedScenario];
    if (!scenario || !realData?.surgeons) {
      return <div className="p-6 text-gray-500">Loading surgeon data...</div>;
    }

    const scenarioVendors = scenario.vendors || [];
    const HIGH_VOLUME_THRESHOLD = 200;
    const MEDIUM_VOLUME_THRESHOLD = 50;
    const LOYALTY_THRESHOLD = 0.70;

    // Analyze each surgeon
    const surgeonAnalytics = realData.surgeons.map(surgeon => {
      const volume = surgeon.totalCases || 0;
      const volumeCategory = volume >= HIGH_VOLUME_THRESHOLD ? 'high' :
                            volume >= MEDIUM_VOLUME_THRESHOLD ? 'medium' : 'low';

      let primaryVendor = 'Unknown';
      let primaryVendorCases = 0;
      let primaryVendorPercent = 0;

      if (surgeon.vendors && typeof surgeon.vendors === 'object') {
        Object.entries(surgeon.vendors).forEach(([vendorName, vendorData]) => {
          const cases = vendorData.cases || 0;
          if (cases > primaryVendorCases) {
            primaryVendorCases = cases;
            primaryVendor = vendorName;
          }
        });
        if (volume > 0) {
          primaryVendorPercent = primaryVendorCases / volume;
        }
      }

      const isLoyalist = primaryVendorPercent >= LOYALTY_THRESHOLD;
      const mustTransition = isLoyalist && !scenarioVendors.includes(primaryVendor);
      const isSherpa = !mustTransition && volume >= 30;
      const roboticCases = surgeon.roboticMetrics?.estimatedRoboticCases || 0;

      return {
        ...surgeon,
        volume,
        volumeCategory,
        primaryVendor,
        primaryVendorPercent,
        primaryVendorCases,
        isLoyalist,
        mustTransition,
        isSherpa,
        roboticCases,
        roboticPercent: volume > 0 ? (roboticCases / volume) * 100 : 0
      };
    });

    // Filter surgeons based on selected filter
    let filteredSurgeons = surgeonAnalytics;
    if (surgeonFilter === 'loyalists') {
      filteredSurgeons = surgeonAnalytics.filter(s => s.isLoyalist);
    } else if (surgeonFilter === 'sherpas') {
      filteredSurgeons = surgeonAnalytics.filter(s => s.isSherpa);
    } else if (surgeonFilter === 'high-volume') {
      filteredSurgeons = surgeonAnalytics.filter(s => s.volumeCategory === 'high');
    } else if (surgeonFilter === 'transitioning') {
      filteredSurgeons = surgeonAnalytics.filter(s => s.mustTransition);
    }

    // Apply search filter
    if (surgeonSearchQuery) {
      filteredSurgeons = filteredSurgeons.filter(s =>
        s.name && s.name.toLowerCase().includes(surgeonSearchQuery.toLowerCase())
      );
    }

    // Calculate peer benchmarks for selected surgeon
    const getPeerBenchmarks = (surgeon) => {
      if (!surgeon) return null;

      // Find peers: same region, similar volume category
      const peers = surgeonAnalytics.filter(s =>
        s.region === surgeon.region &&
        s.volumeCategory === surgeon.volumeCategory &&
        s.name !== surgeon.name
      );

      if (peers.length === 0) return null;

      const peerAvgCases = peers.reduce((sum, p) => sum + p.volume, 0) / peers.length;
      const peerAvgSpend = peers.reduce((sum, p) => sum + (p.totalSpend || 0), 0) / peers.length;
      const peerAvgCostPerCase = peerAvgSpend / peerAvgCases;
      const surgeonCostPerCase = surgeon.totalSpend / surgeon.volume;

      const peerRoboticPercent = peers.reduce((sum, p) => sum + p.roboticPercent, 0) / peers.length;

      return {
        peerCount: peers.length,
        peerAvgCases: Math.round(peerAvgCases),
        peerAvgSpend,
        peerAvgCostPerCase,
        surgeonCostPerCase,
        costVariance: ((surgeonCostPerCase - peerAvgCostPerCase) / peerAvgCostPerCase) * 100,
        caseVariance: ((surgeon.volume - peerAvgCases) / peerAvgCases) * 100,
        peerRoboticPercent
      };
    };

    const benchmarks = selectedSurgeon ? getPeerBenchmarks(selectedSurgeon) : null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Surgeon Level Analytics: {scenario.shortName}</h2>
          <p className="text-purple-100 text-sm">Individual surgeon profiles, peer benchmarks, and transition planning</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search surgeon by name..."
                value={surgeonSearchQuery}
                onChange={(e) => setSurgeonSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={surgeonFilter}
                onChange={(e) => setSurgeonFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Surgeons ({surgeonAnalytics.length})</option>
                <option value="loyalists">Loyalists ({surgeonAnalytics.filter(s => s.isLoyalist).length})</option>
                <option value="sherpas">Sherpas ({surgeonAnalytics.filter(s => s.isSherpa).length})</option>
                <option value="high-volume">High Volume ({surgeonAnalytics.filter(s => s.volumeCategory === 'high').length})</option>
                <option value="transitioning">Needing Transition ({surgeonAnalytics.filter(s => s.mustTransition).length})</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scatter Plot Visualization */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Surgeon Cost & Volume Analysis</h3>
            <p className="text-sm text-gray-600">Each bubble represents a surgeon. Size = Total Annual Spend. Border styles indicate surgeon status. Top opportunities are labeled.</p>
          </div>

          {(() => {
            // Prepare data for scatter plot
            const allData = filteredSurgeons.map(s => ({
              ...s,
              costPerCase: s.totalSpend / s.volume
            })).filter(s => s.volume > 0 && s.totalSpend > 0);

            if (allData.length === 0) {
              return <div className="text-center text-gray-500 py-8">No data available for visualization</div>;
            }

            // Remove outliers using percentile method
            const costs = allData.map(s => s.costPerCase).sort((a, b) => a - b);
            const volumes = allData.map(s => s.volume).sort((a, b) => a - b);

            // Calculate 95th percentile to filter extreme outliers
            const costP95Index = Math.floor(costs.length * 0.95);
            const volumeP95Index = Math.floor(volumes.length * 0.95);
            const costP95 = costs[costP95Index];
            const volumeP95 = volumes[volumeP95Index];

            // Filter data to remove outliers
            const plotData = allData.filter(s =>
              s.costPerCase <= costP95 && s.volume <= volumeP95
            );

            const outlierCount = allData.length - plotData.length;

            // Calculate scales
            const maxVolume = Math.max(...plotData.map(s => s.volume));
            const minVolume = Math.min(...plotData.map(s => s.volume));
            const maxCost = Math.max(...plotData.map(s => s.costPerCase));
            const minCost = Math.min(...plotData.map(s => s.costPerCase));
            const maxSpend = Math.max(...plotData.map(s => s.totalSpend));

            // Chart dimensions
            const width = 1000;
            const height = 500;
            const padding = { top: 20, right: 20, bottom: 60, left: 80 };
            const chartWidth = width - padding.left - padding.right;
            const chartHeight = height - padding.top - padding.bottom;

            // Vendor colors
            const vendorColors = {
              'STRYKER': '#3B82F6',
              'ZIMMER BIOMET': '#10B981',
              'JOHNSON & JOHNSON': '#EF4444',
              'SMITH & NEPHEW': '#F59E0B',
              'KYOCERA': '#8B5CF6',
              'EXACTECH': '#EC4899',
              'CORIN': '#6366F1',
              'DEFAULT': '#6B7280'
            };

            const getVendorColor = (vendor) => {
              const upperVendor = (vendor || '').toUpperCase();
              for (const [key, color] of Object.entries(vendorColors)) {
                if (upperVendor.includes(key)) return color;
              }
              return vendorColors.DEFAULT;
            };

            // Scale functions
            const xScale = (volume) => padding.left + ((volume - minVolume) / (maxVolume - minVolume)) * chartWidth;
            const yScale = (cost) => padding.top + chartHeight - ((cost - minCost) / (maxCost - minCost)) * chartHeight;
            const rScale = (spend) => 4 + ((spend / maxSpend) * 16); // 4-20px radius

            // Calculate peer average
            const avgCost = plotData.reduce((sum, s) => sum + s.costPerCase, 0) / plotData.length;
            const avgVolume = plotData.reduce((sum, s) => sum + s.volume, 0) / plotData.length;

            // #1: Calculate opportunity scores and identify top opportunities
            // Opportunity = volume * (cost - avgCost) - higher is more opportunity
            const dataWithOpportunity = plotData.map(s => ({
              ...s,
              opportunityScore: s.costPerCase > avgCost ? s.volume * (s.costPerCase - avgCost) : 0,
              savingsPotential: s.costPerCase > avgCost ? s.volume * (s.costPerCase - avgCost) : 0
            }));

            // Sort by opportunity and get top 10
            const topOpportunities = [...dataWithOpportunity]
              .sort((a, b) => b.opportunityScore - a.opportunityScore)
              .slice(0, 10);

            const totalOpportunity = dataWithOpportunity
              .filter(s => s.savingsPotential > 0)
              .reduce((sum, s) => sum + s.savingsPotential, 0);

            const opportunityCount = dataWithOpportunity.filter(s => s.savingsPotential > 0).length;

            return (
              <div className="relative">
                {/* Opportunity Summary Card */}
                {opportunityCount > 0 && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-red-900 mb-1">
                          💰 Total Savings Opportunity
                        </h4>
                        <p className="text-sm text-red-700">
                          <strong>{opportunityCount} surgeons</strong> operating above peer average cost represent{' '}
                          <strong className="text-xl">${(totalOpportunity / 1000000).toFixed(2)}M</strong> in potential annual savings
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-red-600 uppercase font-semibold mb-1">Top 10 Opportunities</div>
                        <div className="text-2xl font-bold text-red-600">
                          ${(topOpportunities.reduce((sum, s) => sum + s.savingsPotential, 0) / 1000000).toFixed(2)}M
                        </div>
                        <div className="text-xs text-red-700">savings potential</div>
                      </div>
                    </div>
                  </div>
                )}

                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto border border-gray-200 rounded-lg bg-gray-50">
                  {/* Grid lines */}
                  <g className="grid-lines">
                    {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
                      <g key={`grid-${ratio}`}>
                        <line
                          x1={padding.left}
                          y1={padding.top + chartHeight * ratio}
                          x2={padding.left + chartWidth}
                          y2={padding.top + chartHeight * ratio}
                          stroke="#E5E7EB"
                          strokeWidth="1"
                        />
                        <line
                          x1={padding.left + chartWidth * ratio}
                          y1={padding.top}
                          x2={padding.left + chartWidth * ratio}
                          y2={padding.top + chartHeight}
                          stroke="#E5E7EB"
                          strokeWidth="1"
                        />
                      </g>
                    ))}
                  </g>

                  {/* Average lines */}
                  <line
                    x1={xScale(avgVolume)}
                    y1={padding.top}
                    x2={xScale(avgVolume)}
                    y2={padding.top + chartHeight}
                    stroke="#9CA3AF"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                  <line
                    x1={padding.left}
                    y1={yScale(avgCost)}
                    x2={padding.left + chartWidth}
                    y2={yScale(avgCost)}
                    stroke="#9CA3AF"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />

                  {/* Axes */}
                  <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartHeight} stroke="#374151" strokeWidth="2" />
                  <line x1={padding.left} y1={padding.top + chartHeight} x2={padding.left + chartWidth} y2={padding.top + chartHeight} stroke="#374151" strokeWidth="2" />

                  {/* Y-axis labels */}
                  {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                    const cost = minCost + (maxCost - minCost) * (1 - ratio);
                    return (
                      <text
                        key={`y-label-${ratio}`}
                        x={padding.left - 10}
                        y={padding.top + chartHeight * ratio}
                        textAnchor="end"
                        alignmentBaseline="middle"
                        className="text-xs fill-gray-600"
                      >
                        ${cost.toFixed(0)}
                      </text>
                    );
                  })}

                  {/* X-axis labels */}
                  {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                    const volume = minVolume + (maxVolume - minVolume) * ratio;
                    return (
                      <text
                        key={`x-label-${ratio}`}
                        x={padding.left + chartWidth * ratio}
                        y={padding.top + chartHeight + 20}
                        textAnchor="middle"
                        className="text-xs fill-gray-600"
                      >
                        {volume.toFixed(0)}
                      </text>
                    );
                  })}

                  {/* Axis titles */}
                  <text
                    x={padding.left - 60}
                    y={padding.top + chartHeight / 2}
                    textAnchor="middle"
                    transform={`rotate(-90, ${padding.left - 60}, ${padding.top + chartHeight / 2})`}
                    className="text-sm font-semibold fill-gray-700"
                  >
                    Cost Per Case ($)
                  </text>
                  <text
                    x={padding.left + chartWidth / 2}
                    y={padding.top + chartHeight + 50}
                    textAnchor="middle"
                    className="text-sm font-semibold fill-gray-700"
                  >
                    Total Cases (Annual Volume)
                  </text>

                  {/* Data points with loyalty indicators */}
                  {dataWithOpportunity.map((surgeon, idx) => {
                    const x = xScale(surgeon.volume);
                    const y = yScale(surgeon.costPerCase);
                    const r = rScale(surgeon.totalSpend);
                    const color = getVendorColor(surgeon.primaryVendor);
                    const isSelected = selectedSurgeon && selectedSurgeon.name === surgeon.name;
                    const isTopOpportunity = topOpportunities.some(t => t.name === surgeon.name);

                    // #2: Visual Loyalty Indicators - different border styles
                    let strokeDasharray = '0'; // Solid = default
                    let strokeWidth = 2;
                    let strokeColor = color;

                    if (surgeon.mustTransition) {
                      // Must transition = red double border
                      strokeColor = '#EF4444';
                      strokeWidth = 3;
                    } else if (surgeon.isSherpa) {
                      // Sherpa = gold/yellow border
                      strokeColor = '#F59E0B';
                      strokeWidth = 2.5;
                    } else if (surgeon.isLoyalist) {
                      // Loyalist = dashed border
                      strokeDasharray = '4,2';
                      strokeWidth = 2;
                    }

                    if (isSelected) {
                      strokeColor = '#000';
                      strokeWidth = 4;
                    }

                    return (
                      <g key={idx}>
                        <circle
                          cx={x}
                          cy={y}
                          r={r}
                          fill={color}
                          fillOpacity={isSelected ? 1 : 0.6}
                          stroke={strokeColor}
                          strokeWidth={strokeWidth}
                          strokeDasharray={strokeDasharray}
                          className="cursor-pointer hover:opacity-100 transition-all"
                          onClick={() => setSelectedSurgeon(surgeon)}
                        >
                          <title>{`${surgeon.name}\nVolume: ${surgeon.volume.toLocaleString()}\nCost/Case: $${surgeon.costPerCase.toFixed(0)}\nVendor: ${surgeon.primaryVendor}\nAnnual Spend: $${(surgeon.totalSpend / 1000000).toFixed(2)}M${surgeon.savingsPotential > 0 ? `\nSavings Potential: $${(surgeon.savingsPotential / 1000).toFixed(0)}K` : ''}\nStatus: ${surgeon.mustTransition ? 'Must Transition' : surgeon.isSherpa ? 'Sherpa' : surgeon.isLoyalist ? 'Loyalist' : 'Flexible'}`}</title>
                        </circle>
                      </g>
                    );
                  })}

                  {/* Quadrant labels */}
                  <text x={padding.left + chartWidth * 0.75} y={padding.top + 15} className="text-xs font-semibold fill-red-600" textAnchor="middle">
                    HIGH OPPORTUNITY
                  </text>
                  <text x={padding.left + chartWidth * 0.25} y={padding.top + 15} className="text-xs font-semibold fill-orange-600" textAnchor="middle">
                    LOW VOLUME
                  </text>
                  <text x={padding.left + chartWidth * 0.75} y={padding.top + chartHeight - 5} className="text-xs font-semibold fill-yellow-600" textAnchor="middle">
                    HIGH VOLUME
                  </text>
                  <text x={padding.left + chartWidth * 0.25} y={padding.top + chartHeight - 5} className="text-xs font-semibold fill-green-600" textAnchor="middle">
                    EFFICIENT
                  </text>
                </svg>

                {/* Legend - Vendors */}
                <div className="mt-4">
                  <div className="text-xs font-semibold text-gray-700 mb-2 text-center">Vendor Colors</div>
                  <div className="flex flex-wrap gap-4 justify-center mb-4">
                    {Object.entries(vendorColors).filter(([k]) => k !== 'DEFAULT').map(([vendor, color]) => (
                      <div key={vendor} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
                        <span className="text-xs text-gray-700">{vendor}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend - Status Indicators */}
                <div className="mt-2 border-t pt-3">
                  <div className="text-xs font-semibold text-gray-700 mb-2 text-center">Surgeon Status (Border Style)</div>
                  <div className="flex flex-wrap gap-6 justify-center">
                    <div className="flex items-center gap-2">
                      <svg width="20" height="20">
                        <circle cx="10" cy="10" r="7" fill="#3B82F6" fillOpacity="0.6" stroke="#F59E0B" strokeWidth="2.5" />
                      </svg>
                      <span className="text-xs text-gray-700"><strong>Gold Border</strong> = Sherpa (≥30 cases, aligned)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="20" height="20">
                        <circle cx="10" cy="10" r="7" fill="#3B82F6" fillOpacity="0.6" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4,2" />
                      </svg>
                      <span className="text-xs text-gray-700"><strong>Dashed</strong> = Loyalist (≥70% single vendor)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="20" height="20">
                        <circle cx="10" cy="10" r="7" fill="#3B82F6" fillOpacity="0.6" stroke="#EF4444" strokeWidth="3" />
                      </svg>
                      <span className="text-xs text-gray-700"><strong>Red Border</strong> = Must Transition</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="20" height="20">
                        <circle cx="10" cy="10" r="7" fill="#3B82F6" fillOpacity="0.6" stroke="#3B82F6" strokeWidth="2" />
                      </svg>
                      <span className="text-xs text-gray-700"><strong>Solid</strong> = Flexible</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-center text-xs text-gray-500">
                  Dashed lines = peer averages • Bubble size = Annual Spend • Red labels = Top 10 opportunities
                  {outlierCount > 0 && ` • ${outlierCount} extreme outliers filtered for clarity`}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Selected Surgeon Profile */}
        {selectedSurgeon && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedSurgeon.name}</h3>
                <p className="text-gray-600">{selectedSurgeon.facility} • {selectedSurgeon.region}</p>
              </div>
              <button
                onClick={() => setSelectedSurgeon(null)}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Close
              </button>
            </div>

            {/* Surgeon Metrics Grid */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-600 font-semibold mb-1">Total Cases</div>
                <div className="text-2xl font-bold text-blue-900">{selectedSurgeon.volume.toLocaleString()}</div>
                <div className="text-xs text-blue-600 mt-1">{selectedSurgeon.volumeCategory.toUpperCase()} volume</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="text-xs text-purple-600 font-semibold mb-1">Primary Vendor</div>
                <div className="text-lg font-bold text-purple-900">{selectedSurgeon.primaryVendor}</div>
                <div className="text-xs text-purple-600 mt-1">{(selectedSurgeon.primaryVendorPercent * 100).toFixed(0)}% loyalty</div>
              </div>

              <div className={`p-4 rounded-lg border ${
                selectedSurgeon.isLoyalist ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className={`text-xs font-semibold mb-1 ${selectedSurgeon.isLoyalist ? 'text-orange-600' : 'text-gray-600'}`}>Status</div>
                <div className={`text-lg font-bold ${selectedSurgeon.isLoyalist ? 'text-orange-900' : 'text-gray-700'}`}>
                  {selectedSurgeon.isLoyalist ? 'LOYALIST' : 'FLEXIBLE'}
                </div>
                <div className={`text-xs mt-1 ${selectedSurgeon.isLoyalist ? 'text-orange-600' : 'text-gray-600'}`}>
                  {selectedSurgeon.isSherpa ? 'Can mentor' : ''}
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${
                selectedSurgeon.mustTransition ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
              }`}>
                <div className={`text-xs font-semibold mb-1 ${selectedSurgeon.mustTransition ? 'text-red-600' : 'text-green-600'}`}>Transition</div>
                <div className={`text-lg font-bold ${selectedSurgeon.mustTransition ? 'text-red-900' : 'text-green-900'}`}>
                  {selectedSurgeon.mustTransition ? 'REQUIRED' : 'ALIGNED'}
                </div>
              </div>

              <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                <div className="text-xs text-teal-600 font-semibold mb-1">Robotic Cases</div>
                <div className="text-2xl font-bold text-teal-900">{selectedSurgeon.roboticCases}</div>
                <div className="text-xs text-teal-600 mt-1">{selectedSurgeon.roboticPercent.toFixed(1)}% of cases</div>
              </div>
            </div>

            {/* Peer Benchmarks */}
            {benchmarks && (
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">Peer Benchmarks ({benchmarks.peerCount} similar surgeons in {selectedSurgeon.region})</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-xs text-gray-600 mb-2">Volume vs Peers</div>
                    <div className="text-xl font-bold text-gray-900">{selectedSurgeon.volume.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">vs {benchmarks.peerAvgCases.toLocaleString()} avg</div>
                    <div className={`text-xs mt-1 font-semibold ${
                      benchmarks.caseVariance > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {benchmarks.caseVariance > 0 ? '+' : ''}{benchmarks.caseVariance.toFixed(0)}%
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-xs text-gray-600 mb-2">Cost Per Case</div>
                    <div className="text-xl font-bold text-gray-900">${benchmarks.surgeonCostPerCase.toFixed(0)}</div>
                    <div className="text-sm text-gray-600">vs ${benchmarks.peerAvgCostPerCase.toFixed(0)} avg</div>
                    <div className={`text-xs mt-1 font-semibold ${
                      benchmarks.costVariance < 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {benchmarks.costVariance > 0 ? '+' : ''}{benchmarks.costVariance.toFixed(0)}%
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-xs text-gray-600 mb-2">Total Annual Spend</div>
                    <div className="text-xl font-bold text-gray-900">${(selectedSurgeon.totalSpend / 1000000).toFixed(2)}M</div>
                    <div className="text-sm text-gray-600">vs ${(benchmarks.peerAvgSpend / 1000000).toFixed(2)}M avg</div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-xs text-gray-600 mb-2">Robotic Utilization</div>
                    <div className="text-xl font-bold text-gray-900">{selectedSurgeon.roboticPercent.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">vs {benchmarks.peerRoboticPercent.toFixed(1)}% avg</div>
                    <div className={`text-xs mt-1 font-semibold ${
                      selectedSurgeon.roboticPercent > benchmarks.peerRoboticPercent ? 'text-purple-600' : 'text-gray-600'
                    }`}>
                      {selectedSurgeon.roboticPercent > benchmarks.peerRoboticPercent ? 'Above peers' : 'Below peers'}
                    </div>
                  </div>
                </div>

                {/* Cost Per Case Comparison - Visual */}
                <div className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  <h5 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Cost Per Case Comparison
                  </h5>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Surgeon Card */}
                    <div className="bg-white rounded-lg p-5 shadow-md border-2 border-indigo-200">
                      <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">This Surgeon</div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">${benchmarks.surgeonCostPerCase.toFixed(0)}</div>
                      <div className="text-xs text-gray-500">per procedure</div>
                      <div className={`mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        benchmarks.costVariance < 0
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {benchmarks.costVariance < 0 ? '↓' : '↑'} {Math.abs(benchmarks.costVariance).toFixed(0)}% vs peers
                      </div>
                    </div>

                    {/* Peer Average Card */}
                    <div className="bg-white rounded-lg p-5 shadow-md border-2 border-gray-200">
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Peer Average</div>
                      <div className="text-3xl font-bold text-gray-700 mb-1">${benchmarks.peerAvgCostPerCase.toFixed(0)}</div>
                      <div className="text-xs text-gray-500">{benchmarks.peerCount} similar surgeons</div>
                      <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                        {selectedSurgeon.region} • {selectedSurgeon.volumeCategory} volume
                      </div>
                    </div>
                  </div>

                  {/* Visual Comparison Bar */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600">Lower Cost</span>
                      <span className="text-xs font-medium text-gray-600">Higher Cost</span>
                    </div>
                    <div className="relative h-12 bg-gradient-to-r from-green-100 via-gray-100 to-red-100 rounded-full overflow-hidden shadow-inner">
                      {/* Center line */}
                      <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gray-400 opacity-50"></div>

                      {/* Surgeon position marker */}
                      <div
                        className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-500"
                        style={{
                          left: `${Math.min(Math.max((benchmarks.surgeonCostPerCase / (benchmarks.peerAvgCostPerCase * 2)) * 100, 5), 95)}%`
                        }}
                      >
                        <div className="relative">
                          <div className={`w-8 h-8 rounded-full shadow-lg border-3 flex items-center justify-center transform -translate-x-1/2 ${
                            benchmarks.costVariance < 0
                              ? 'bg-green-500 border-green-600'
                              : 'bg-orange-500 border-orange-600'
                          }`}>
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                            <div className="text-xs font-semibold text-gray-700">You</div>
                          </div>
                        </div>
                      </div>

                      {/* Peer average marker */}
                      <div
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                      >
                        <div className="relative">
                          <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-gray-500 shadow-md"></div>
                          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                            <div className="text-xs font-medium text-gray-600">Avg</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Insight Message */}
                  <div className={`mt-8 p-4 rounded-lg border-l-4 ${
                    benchmarks.costVariance < 0
                      ? 'bg-green-50 border-green-500'
                      : 'bg-orange-50 border-orange-500'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        benchmarks.costVariance < 0 ? 'bg-green-500' : 'bg-orange-500'
                      }`}>
                        {benchmarks.costVariance < 0 ? (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold mb-1 ${
                          benchmarks.costVariance < 0 ? 'text-green-800' : 'text-orange-800'
                        }`}>
                          {benchmarks.costVariance < 0
                            ? `Cost Efficient Performance`
                            : `Savings Opportunity Identified`
                          }
                        </p>
                        <p className={`text-xs ${
                          benchmarks.costVariance < 0 ? 'text-green-700' : 'text-orange-700'
                        }`}>
                          {benchmarks.costVariance < 0
                            ? `This surgeon operates ${Math.abs(benchmarks.costVariance).toFixed(0)}% below peer average, demonstrating cost-effective practices while maintaining quality outcomes.`
                            : `This surgeon's cost per case is ${Math.abs(benchmarks.costVariance).toFixed(0)}% above peer average, representing an opportunity for vendor optimization and cost reduction.`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Surgeon Table */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {surgeonFilter === 'all' ? 'All Surgeons' :
             surgeonFilter === 'loyalists' ? 'Loyalist Surgeons' :
             surgeonFilter === 'sherpas' ? 'Potential Sherpa Surgeons' :
             surgeonFilter === 'high-volume' ? 'High-Volume Surgeons' :
             'Surgeons Needing Transition'}
            <span className="ml-2 text-sm text-gray-500">({filteredSurgeons.length} surgeons)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-purple-100 border-b-2 border-purple-300">
                  <th className="text-left p-3 font-bold text-purple-900">Surgeon Name</th>
                  <th className="text-left p-3 font-bold text-purple-900">Facility</th>
                  <th className="text-center p-3 font-bold text-purple-900">Region</th>
                  <th className="text-center p-3 font-bold text-purple-900">Total Cases</th>
                  <th className="text-left p-3 font-bold text-purple-900">Primary Vendor</th>
                  <th className="text-center p-3 font-bold text-purple-900">Loyalty %</th>
                  <th className="text-center p-3 font-bold text-purple-900">Status</th>
                  <th className="text-center p-3 font-bold text-purple-900">Robotic %</th>
                  <th className="text-center p-3 font-bold text-purple-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSurgeons.slice(0, 50).map((surgeon, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-purple-50">
                    <td className="p-3 font-semibold text-gray-900">{surgeon.name}</td>
                    <td className="p-3 text-gray-700 text-sm">{surgeon.facility}</td>
                    <td className="p-3 text-center text-gray-700">{surgeon.region}</td>
                    <td className="p-3 text-center font-semibold text-blue-600">{surgeon.volume.toLocaleString()}</td>
                    <td className="p-3 text-gray-900">{surgeon.primaryVendor}</td>
                    <td className="p-3 text-center">
                      <span className={`font-semibold ${surgeon.isLoyalist ? 'text-orange-600' : 'text-gray-600'}`}>
                        {(surgeon.primaryVendorPercent * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {surgeon.isLoyalist && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-semibold">
                          LOYALIST
                        </span>
                      )}
                      {surgeon.isSherpa && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold ml-1">
                          SHERPA
                        </span>
                      )}
                      {surgeon.mustTransition && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold ml-1">
                          TRANSITION
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center text-teal-600 font-semibold">
                      {surgeon.roboticPercent.toFixed(1)}%
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedSurgeon(surgeon)}
                        className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs font-semibold"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredSurgeons.length > 50 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Showing first 50 of {filteredSurgeons.length} surgeons. Use search to narrow results.
            </div>
          )}
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

      {/* Parameter Definitions Banner */}
      <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <strong>How to use:</strong> Adjust the sliders below to model different scenarios. Each parameter affects the projected outcomes in real-time. Hover over parameter names for detailed definitions.
          </div>
        </div>
      </div>

      {/* Parameter Grid - 4 Key Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Projected Savings Adjustment */}
        <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
          <div className="flex items-start gap-2 mb-2">
            <label className="block text-sm font-bold text-gray-900">
              Projected Savings
            </label>
            <HelpCircle
              className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 cursor-help"
              title="Adjust the baseline savings projection up or down based on confidence level, market conditions, or risk tolerance."
            />
          </div>
          <div className="text-xl font-bold mb-2" style={{ color: COLORS.primary }}>
            {whatIfParams.savingsAdjustment > 0 ? '+' : ''}{whatIfParams.savingsAdjustment}%
          </div>
          <input
            type="range"
            min="-30"
            max="30"
            value={whatIfParams.savingsAdjustment}
            onChange={(e) => setWhatIfParams({ ...whatIfParams, savingsAdjustment: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Conservative</span>
            <span>Optimistic</span>
          </div>
        </div>

        {/* Volume Growth */}
        <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
          <div className="flex items-start gap-2 mb-2">
            <label className="block text-sm font-bold text-gray-900">
              Volume Growth
            </label>
            <HelpCircle
              className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 cursor-help"
              title="Projected annual change in surgical case volume. Positive = more procedures (aging population), negative = fewer procedures."
            />
          </div>
          <div className="text-xl font-bold mb-2" style={{ color: COLORS.primary }}>
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
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>-15%</span>
            <span>+15%</span>
          </div>
        </div>

        {/* Implementation Timeline */}
        <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
          <div className="flex items-start gap-2 mb-2">
            <label className="block text-sm font-bold text-gray-900">
              Implementation
            </label>
            <HelpCircle
              className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 cursor-help"
              title="Total months from contract signing to full deployment. Longer timelines delay savings realization."
            />
          </div>
          <div className="text-xl font-bold mb-2" style={{ color: COLORS.primary }}>
            {whatIfParams.implementationMonths} mo
          </div>
          <input
            type="range"
            min="6"
            max="24"
            value={whatIfParams.implementationMonths}
            onChange={(e) => setWhatIfParams({ ...whatIfParams, implementationMonths: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>6mo</span>
            <span>24mo</span>
          </div>
        </div>

        {/* Negotiation Leverage */}
        <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
          <div className="flex items-start gap-2 mb-2">
            <label className="block text-sm font-bold text-gray-900">
              Negotiation Leverage
            </label>
            <HelpCircle
              className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 cursor-help"
              title="Additional savings from improved negotiating position through volume consolidation."
            />
          </div>
          <div className="text-xl font-bold mb-2" style={{ color: COLORS.primary }}>
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
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>-10%</span>
            <span>+20%</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setWhatIfParams({
            savingsAdjustment: 0,
            volumeGrowth: 0,
            implementationMonths: 12,
            negotiationLeverage: 0
          })}
          className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-all shadow-md"
        >
          <RefreshCw className="w-4 h-4" />
          Reset to Baseline
        </button>
        <button
          onClick={() => setWhatIfParams({
            savingsAdjustment: -20,
            volumeGrowth: -5,
            implementationMonths: 18,
            negotiationLeverage: -5
          })}
          className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 font-semibold transition-all shadow-md"
        >
          <AlertTriangle className="w-4 h-4" />
          Conservative Case
        </button>
        <button
          onClick={() => setWhatIfParams({
            savingsAdjustment: 20,
            volumeGrowth: 8,
            implementationMonths: 9,
            negotiationLeverage: 15
          })}
          className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 font-semibold transition-all shadow-md"
        >
          <TrendingUp className="w-4 h-4" />
          Optimistic Case
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200">
              <div className="text-sm text-purple-700 mb-1">Current State</div>
              <div className="text-2xl font-bold text-purple-900">
                {realData ? Object.keys(realData.vendors).length : '20+'} Vendors
              </div>
              <div className="text-xs text-purple-600">Fragmented</div>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-200">
              <div className="text-sm text-green-700 mb-2 font-semibold">Selected Scenario</div>
              <select
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value)}
                className="w-full px-3 py-2 border-2 border-green-300 rounded-lg font-bold text-green-900 bg-white hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer text-sm"
              >
                {Object.values(SCENARIOS).map(scenario => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.shortName}
                  </option>
                ))}
              </select>
              <div className="text-xs text-green-600 mt-1">
                ${SCENARIOS[selectedScenario]?.annualSavings.toFixed(2)}M savings
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
              <div className="text-sm text-blue-700 mb-1">Annual Savings</div>
              <div className="text-2xl font-bold text-blue-900">
                ${getAdjustedMetrics(selectedScenario)?.annualSavings.toFixed(2)}M
              </div>
              <div className="text-xs text-blue-600">
                {whatIfParams.savingsAdjustment !== 0 || whatIfParams.volumeGrowth !== 0 || whatIfParams.negotiationLeverage !== 0 ? (
                  <>
                    Baseline: ${SCENARIOS[selectedScenario]?.annualSavings.toFixed(2)}M
                    {whatIfParams.savingsAdjustment !== 0 && (
                      <span className={whatIfParams.savingsAdjustment > 0 ? 'text-green-600' : 'text-orange-600'}>
                        {' '}({whatIfParams.savingsAdjustment > 0 ? '+' : ''}{whatIfParams.savingsAdjustment}% adj)
                      </span>
                    )}
                  </>
                ) : (
                  `${SCENARIOS[selectedScenario]?.savingsPercent}% reduction from baseline`
                )}
              </div>
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

            <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border-2 border-orange-300">
              <div className="text-sm text-orange-700 mb-1">Cases at Risk</div>
              <div className="text-2xl font-bold text-orange-900">
                {SCENARIOS[selectedScenario]?.volumeWeightedRisk?.casesAtRisk?.toLocaleString() || '0'}
              </div>
              <div className="text-xs text-orange-600">
                High-volume loyalists
              </div>
            </div>
          </div>
        </div>

        {/* What-If Tools */}
        {renderWhatIfTools()}

        {/* Tab Navigation */}
        {renderTabs()}

        {/* Tab Content */}
        <div className="transition-all">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'financial' && renderFinancialTab()}
          {activeTab === 'clinical' && renderClinicalTab()}
          {activeTab === 'surgeons' && renderSurgeonTab()}
          {activeTab === 'components' && renderComponentTab()}
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
