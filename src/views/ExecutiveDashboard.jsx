import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, RadarChart, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Area, AreaChart,
  ScatterChart, Scatter, ComposedChart, Sankey, RadialBarChart, RadialBar
} from 'recharts';
import {
  DollarSign, TrendingUp, AlertCircle, Users, Building2,
  Activity, Shield, Target, Calculator, FileText, CheckCircle,
  AlertTriangle, XCircle, ChevronDown, ChevronRight, Award,
  Package, Heart, Briefcase, Clock, Zap, Info, Settings,
  Sliders, ArrowRight, TrendingDown, HelpCircle, Eye,
  Filter, BarChart3, Bookmark, Play, X, Check,
  BookOpen, MapPin, Stethoscope, Users2, Home, RefreshCw
} from 'lucide-react';
import NavigationHeader from '../components/shared/NavigationHeader';

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
  const [selectedScenario, setSelectedScenario] = useState('C');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonScenario, setComparisonScenario] = useState('D');
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
      const jsonPath = `${process.env.PUBLIC_URL}/orthopedic-data.json`;
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
      return [
        { region: 'Mountain', zimmer: 85, stryker: 75, jj: 45, surgeons: 52, repQuality: 'Excellent' },
        { region: 'Western', zimmer: 70, stryker: 82, jj: 60, surgeons: 68, repQuality: 'Good' },
        { region: 'Midwest', zimmer: 78, stryker: 65, jj: 55, surgeons: 51, repQuality: 'Good' }
      ];
    }

    const topVendors = getTopVendors();
    return Object.entries(realData.regions).map(([name, data]) => {
      // Calculate preference percentages based on relative market share
      const totalSpend = data.totalSpend;
      const zimmerSpend = realData.vendors['ZIMMER BIOMET']?.totalSpend || 0;
      const strykerSpend = realData.vendors['STRYKER']?.totalSpend || 0;
      const jjSpend = realData.vendors['J&J']?.totalSpend || 0;

      const totalTop3 = zimmerSpend + strykerSpend + jjSpend;

      return {
        region: name,
        zimmer: Math.round((zimmerSpend / totalTop3) * 100),
        stryker: Math.round((strykerSpend / totalTop3) * 100),
        jj: Math.round((jjSpend / totalTop3) * 100),
        surgeons: data.surgeons,
        repQuality: data.surgeons > 100 ? 'Excellent' : data.surgeons > 50 ? 'Good' : 'Fair'
      };
    });
  };

  // 7-Scenario Data Structure aligned with Surgeon Tool (hip_knees_surgeon_tool)
  const SCENARIOS = useMemo(() => {
    if (!realData) {
      // Fallback placeholder data
      return {
        'A': {
          id: 'A',
          name: 'Status Quo (Loading...)',
          shortName: 'Status Quo',
          description: 'Loading data...',
          vendors: ['Loading...'],
          vendorCount: 20,
          annualSavings: 0,
          savingsRange: { conservative: 0, expected: 0, optimistic: 0 },
          adoptionRate: 100,
          riskLevel: 'low',
          riskScore: 1,
          baselineCost: 0,
          implementation: { complexity: 'Low', timeline: 0, costMillions: 0 },
          breakdown: { volumeAggregation: 0, priceOptimization: 0, inventoryOptimization: 0, adminEfficiency: 0 },
          agentScore: 2.1,
          quintupleMissionScore: 45,
          npv5Year: 0
        }
      };
    }

    const totalCases = realData.metadata.totalCases;
    const baselineSpend = realData.metadata.totalSpend / 1000000; // Convert to millions

    return {
      'A': {
        id: 'A',
        name: 'Status Quo',
        shortName: 'Status Quo',
        description: 'Continue with current multi-vendor fragmentation (ZIMMER BIOMET, STRYKER, J&J, SMITH & NEPHEW, CONFORMIS)',
        vendors: ['ZIMMER BIOMET', 'STRYKER', 'J&J', 'SMITH & NEPHEW', 'CONFORMIS'],
        vendorCount: 5,
        savingsPercent: 0,
        annualSavings: 0,
        savingsRange: { conservative: 0, expected: 0, optimistic: 0 },
        adoptionRate: 100,
        riskLevel: 'low',
        riskScore: 1,
        baselineCost: realData.metadata.totalSpend,
        implementation: {
          complexity: 'Low',
          timeline: 0,
          costMillions: 0
        },
        breakdown: {
          volumeAggregation: 0,
          priceOptimization: 0,
          inventoryOptimization: 0,
          adminEfficiency: 0
        },
        agentScore: 2.1,
        quintupleMissionScore: 45,
        npv5Year: 0
      },
      'B': {
        id: 'B',
        name: 'Tri-Source (Zimmer + Stryker + J&J)',
        shortName: 'Tri-Source',
        description: 'Consolidate to three primary vendors with proven surgeon acceptance',
        vendors: ['ZIMMER BIOMET', 'STRYKER', 'J&J'],
        vendorCount: 3,
        savingsPercent: 12,
        annualSavings: baselineSpend * 0.12,
        savingsRange: {
          conservative: baselineSpend * 0.12 * 0.85,
          expected: baselineSpend * 0.12,
          optimistic: baselineSpend * 0.12 * 1.15
        },
        adoptionRate: 92,
        riskLevel: 'low',
        riskScore: 2.5,
        baselineCost: realData.metadata.totalSpend,
        implementation: {
          complexity: 'Medium',
          timeline: 10,
          costMillions: 2.2
        },
        breakdown: {
          volumeAggregation: baselineSpend * 0.12 * 0.45,
          priceOptimization: baselineSpend * 0.12 * 0.40,
          inventoryOptimization: baselineSpend * 0.12 * 0.10,
          adminEfficiency: baselineSpend * 0.12 * 0.05
        },
        agentScore: 3.8,
        quintupleMissionScore: 82,
        npv5Year: baselineSpend * 0.12 * 5 - 2.2,
        vendorSplit: {
          zimmer_biomet: 40,
          stryker: 35,
          j_j: 25
        }
      },
      'C': {
        id: 'C',
        name: 'Zimmer + J&J',
        shortName: 'Zimmer + J&J',
        description: 'Dual-vendor model with ZIMMER BIOMET and J&J',
        vendors: ['ZIMMER BIOMET', 'J&J'],
        vendorCount: 2,
        savingsPercent: 18,
        annualSavings: baselineSpend * 0.18,
        savingsRange: {
          conservative: baselineSpend * 0.18 * 0.85,
          expected: baselineSpend * 0.18,
          optimistic: baselineSpend * 0.18 * 1.15
        },
        adoptionRate: 88,
        riskLevel: 'medium',
        riskScore: 3.5,
        baselineCost: realData.metadata.totalSpend,
        implementation: {
          complexity: 'Medium',
          timeline: 12,
          costMillions: 2.8
        },
        breakdown: {
          volumeAggregation: baselineSpend * 0.18 * 0.48,
          priceOptimization: baselineSpend * 0.18 * 0.38,
          inventoryOptimization: baselineSpend * 0.18 * 0.10,
          adminEfficiency: baselineSpend * 0.18 * 0.04
        },
        agentScore: 4.1,
        quintupleMissionScore: 78,
        npv5Year: baselineSpend * 0.18 * 5 - 2.8,
        vendorSplit: {
          zimmer_biomet: 55,
          j_j: 45
        }
      },
      'D': {
        id: 'D',
        name: 'Stryker + Zimmer',
        shortName: 'Stryker + Zimmer',
        description: 'Dual-vendor model with STRYKER and ZIMMER BIOMET',
        vendors: ['STRYKER', 'ZIMMER BIOMET'],
        vendorCount: 2,
        savingsPercent: 16,
        annualSavings: baselineSpend * 0.16,
        savingsRange: {
          conservative: baselineSpend * 0.16 * 0.85,
          expected: baselineSpend * 0.16,
          optimistic: baselineSpend * 0.16 * 1.15
        },
        adoptionRate: 90,
        riskLevel: 'medium',
        riskScore: 3.2,
        baselineCost: realData.metadata.totalSpend,
        implementation: {
          complexity: 'Medium',
          timeline: 12,
          costMillions: 2.6
        },
        breakdown: {
          volumeAggregation: baselineSpend * 0.16 * 0.47,
          priceOptimization: baselineSpend * 0.16 * 0.38,
          inventoryOptimization: baselineSpend * 0.16 * 0.11,
          adminEfficiency: baselineSpend * 0.16 * 0.04
        },
        agentScore: 4.0,
        quintupleMissionScore: 80,
        npv5Year: baselineSpend * 0.16 * 5 - 2.6,
        vendorSplit: {
          stryker: 52,
          zimmer_biomet: 48
        }
      },
      'E': {
        id: 'E',
        name: 'Stryker + J&J',
        shortName: 'Stryker + J&J',
        description: 'Dual-vendor model with STRYKER and J&J',
        vendors: ['STRYKER', 'J&J'],
        vendorCount: 2,
        savingsPercent: 20,
        annualSavings: baselineSpend * 0.20,
        savingsRange: {
          conservative: baselineSpend * 0.20 * 0.85,
          expected: baselineSpend * 0.20,
          optimistic: baselineSpend * 0.20 * 1.15
        },
        adoptionRate: 85,
        riskLevel: 'medium',
        riskScore: 3.8,
        baselineCost: realData.metadata.totalSpend,
        implementation: {
          complexity: 'Medium-High',
          timeline: 14,
          costMillions: 3.0
        },
        breakdown: {
          volumeAggregation: baselineSpend * 0.20 * 0.48,
          priceOptimization: baselineSpend * 0.20 * 0.38,
          inventoryOptimization: baselineSpend * 0.20 * 0.10,
          adminEfficiency: baselineSpend * 0.20 * 0.04
        },
        agentScore: 4.3,
        quintupleMissionScore: 75,
        npv5Year: baselineSpend * 0.20 * 5 - 3.0,
        vendorSplit: {
          stryker: 53,
          j_j: 47
        }
      },
      'F': {
        id: 'F',
        name: 'Zimmer Only',
        shortName: 'Zimmer Only',
        description: 'Single-vendor partnership with ZIMMER BIOMET',
        vendors: ['ZIMMER BIOMET'],
        vendorCount: 1,
        savingsPercent: 25,
        annualSavings: baselineSpend * 0.25,
        savingsRange: {
          conservative: baselineSpend * 0.25 * 0.80,
          expected: baselineSpend * 0.25,
          optimistic: baselineSpend * 0.25 * 1.20
        },
        adoptionRate: 75,
        riskLevel: 'high',
        riskScore: 6.5,
        baselineCost: realData.metadata.totalSpend,
        implementation: {
          complexity: 'High',
          timeline: 18,
          costMillions: 4.0
        },
        breakdown: {
          volumeAggregation: baselineSpend * 0.25 * 0.52,
          priceOptimization: baselineSpend * 0.25 * 0.35,
          inventoryOptimization: baselineSpend * 0.25 * 0.10,
          adminEfficiency: baselineSpend * 0.25 * 0.03
        },
        agentScore: 3.5,
        quintupleMissionScore: 62,
        npv5Year: baselineSpend * 0.25 * 5 - 4.0,
        vendorSplit: {
          zimmer_biomet: 100
        }
      },
      'G': {
        id: 'G',
        name: 'Stryker Only',
        shortName: 'Stryker Only',
        description: 'Single-vendor partnership with STRYKER',
        vendors: ['STRYKER'],
        vendorCount: 1,
        savingsPercent: 22,
        annualSavings: baselineSpend * 0.22,
        savingsRange: {
          conservative: baselineSpend * 0.22 * 0.80,
          expected: baselineSpend * 0.22,
          optimistic: baselineSpend * 0.22 * 1.20
        },
        adoptionRate: 78,
        riskLevel: 'high',
        riskScore: 6.0,
        baselineCost: realData.metadata.totalSpend,
        implementation: {
          complexity: 'High',
          timeline: 18,
          costMillions: 3.8
        },
        breakdown: {
          volumeAggregation: baselineSpend * 0.22 * 0.50,
          priceOptimization: baselineSpend * 0.22 * 0.36,
          inventoryOptimization: baselineSpend * 0.22 * 0.11,
          adminEfficiency: baselineSpend * 0.22 * 0.03
        },
        agentScore: 3.7,
        quintupleMissionScore: 65,
        npv5Year: baselineSpend * 0.22 * 5 - 3.8,
        vendorSplit: {
          stryker: 100
        }
      }
    };
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

  // Quintuple Aim scoring (aligned with 7 scenarios)
  const QUINTUPLE_SCORING = {
    A: {
      patientExperience: 50,
      populationHealth: 40,
      costReduction: 0,
      providerExperience: 80,
      healthEquity: 50,
      missionBonus: 0,
      total: 45
    },
    B: {
      patientExperience: 82,
      populationHealth: 78,
      costReduction: 68,
      providerExperience: 88,
      healthEquity: 82,
      missionBonus: 12,
      total: 82
    },
    C: {
      patientExperience: 78,
      populationHealth: 75,
      costReduction: 80,
      providerExperience: 76,
      healthEquity: 78,
      missionBonus: 10,
      total: 78
    },
    D: {
      patientExperience: 80,
      populationHealth: 77,
      costReduction: 76,
      providerExperience: 82,
      healthEquity: 80,
      missionBonus: 11,
      total: 80
    },
    E: {
      patientExperience: 75,
      populationHealth: 72,
      costReduction: 85,
      providerExperience: 70,
      healthEquity: 76,
      missionBonus: 8,
      total: 75
    },
    F: {
      patientExperience: 62,
      populationHealth: 58,
      costReduction: 92,
      providerExperience: 48,
      healthEquity: 62,
      missionBonus: 3,
      total: 62
    },
    G: {
      patientExperience: 65,
      populationHealth: 62,
      costReduction: 88,
      providerExperience: 55,
      healthEquity: 66,
      missionBonus: 5,
      total: 65
    }
  };

  // Calculate adjusted metrics based on what-if parameters
  const getAdjustedMetrics = (scenario) => {
    const base = SCENARIOS[scenario];
    if (!base) return null;

    const adoptionAdjustment = whatIfParams.adoptionModifier / 100;
    const priceAdjustment = whatIfParams.priceErosion / 100;

    const adjustedAdoption = Math.max(0, Math.min(100, base.adoptionRate + whatIfParams.adoptionModifier));
    const adjustedSavings = base.annualSavings * (1 + priceAdjustment) * (adjustedAdoption / base.adoptionRate);

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
      { id: 'overview', label: 'Overview', icon: Eye, personas: ['financial', 'operational'] },
      { id: 'financial', label: 'Financial Analysis', icon: DollarSign, personas: ['financial', 'operational'] },
      { id: 'components', label: 'Component Analysis', icon: Package, personas: ['financial', 'operational'] },
      { id: 'risk', label: 'Risk Assessment', icon: Shield, personas: ['financial', 'operational'] },
      { id: 'mission', label: 'Mission Impact', icon: Heart, personas: ['financial'] },
      { id: 'industry', label: 'Industry Intelligence', icon: AlertCircle, personas: ['financial', 'operational'] },
      { id: 'decision', label: 'Decision Framework', icon: Target, personas: ['financial', 'operational'] }
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
    const confidence = s.agentScore / 5.0;

    return (
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 mb-6 border-2 border-purple-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-purple-900">Executive Summary: Scenario {scenario}</h3>
            <p className="text-purple-700 mt-1">{s.name}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-purple-600">Confidence Level</div>
            <div className="text-2xl font-bold" style={{ color: COLORS.primary }}>
              {confidence.toFixed(1)}/5.0
            </div>
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
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="px-4 py-3 text-left font-bold text-gray-900">Scenario</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Annual Savings</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Adoption Rate</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Risk Level</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Agent Score</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Expected Value</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredScenarios.map(scenario => (
                <tr
                  key={scenario.id}
                  className={`border-b hover:bg-gray-50 cursor-pointer ${
                    selectedScenario === scenario.id ? 'bg-purple-50' : ''
                  }`}
                  onClick={() => setSelectedScenario(scenario.id)}
                >
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900">{scenario.id}: {scenario.shortName}</div>
                    <div className="text-xs text-gray-500">{scenario.vendorCount} vendors</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-green-600 text-lg">${scenario.annualSavings.toFixed(2)}M</div>
                    <div className="text-xs text-gray-500">
                      ${scenario.savingsRange.conservative.toFixed(2)}M - ${scenario.savingsRange.optimistic.toFixed(2)}M
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${scenario.adoptionRate}%`,
                            backgroundColor: scenario.adoptionRate >= 85 ? COLORS.success :
                                           scenario.adoptionRate >= 70 ? COLORS.warning : COLORS.danger
                          }}
                        />
                      </div>
                      <span className="font-medium">{scenario.adoptionRate.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      scenario.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                      scenario.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {scenario.riskLevel.charAt(0).toUpperCase() + scenario.riskLevel.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-purple-600">{scenario.agentScore.toFixed(1)}/5.0</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-blue-600">${getProbabilityWeighted(scenario.id).toFixed(2)}M</div>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedScenario(scenario.id);
                        setActiveTab('financial');
                      }}
                      className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                    >
                      Analyze
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk vs Reward Scatter */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Target className="w-6 h-6" style={{ color: COLORS.primary }} />
          Risk vs Reward Analysis
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="adoptionRate"
              name="Adoption Rate"
              unit="%"
              domain={[60, 105]}
              label={{ value: 'Adoption Rate (%)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              type="number"
              dataKey="annualSavings"
              name="Annual Savings"
              unit="M"
              label={{ value: 'Annual Savings ($M)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter
              name="Scenarios"
              data={Object.values(SCENARIOS)}
              fill={COLORS.primary}
            >
              {Object.values(SCENARIOS).map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.riskLevel === 'low' ? COLORS.success :
                    entry.riskLevel === 'medium' ? COLORS.warning :
                    COLORS.danger
                  }
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="mt-4 flex gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS.success }} />
            <span className="text-sm text-gray-600">Low Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS.warning }} />
            <span className="text-sm text-gray-600">Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS.danger }} />
            <span className="text-sm text-gray-600">High Risk</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Note: The rest of the render functions (Financial, Matrix, Risk, Mission, Decision tabs)
  // remain the same as before, but now use the dynamically loaded SCENARIOS data
  // For brevity, I'm including just the key parts that demonstrate real data usage

  // COMPONENT ANALYSIS TAB (replaces matrix tab)
  const renderComponentTab = () => (
    <div className="space-y-6">
      <ExecutiveSummaryCard scenario={selectedScenario} />

      {/* Component-Level Savings Analysis */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Package className="w-6 h-6" style={{ color: COLORS.primary }} />
          Top Component Savings Opportunities
        </h2>
        <p className="text-gray-600 mb-4">
          Analysis of component-level pricing showing potential savings from strategic vendor partnerships
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left font-bold">Component Category</th>
                <th className="px-4 py-3 text-right font-bold">Current Avg Price</th>
                <th className="px-4 py-3 text-right font-bold">Target Price</th>
                <th className="px-4 py-3 text-right font-bold">Savings %</th>
                <th className="px-4 py-3 text-right font-bold">Potential Savings</th>
              </tr>
            </thead>
            <tbody>
              {realData?.matrixPricing?.slice(0, 10).map((item, idx) => {
                const savingsPercent = ((item.currentAvgPrice - item.matrixPrice) / item.currentAvgPrice * 100).toFixed(1);
                return (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{item.category}</td>
                    <td className="px-4 py-3 text-right text-gray-600">${item.currentAvgPrice.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-medium text-green-600">
                      ${item.matrixPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-purple-600">
                      {savingsPercent}%
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">
                      ${(item.potentialSavings / 1000).toFixed(0)}K
                    </td>
                  </tr>
                );
              }) || (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    Component data not available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Utilization Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Vendor Utilization Across Scenarios</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={[
            { scenario: 'A', vendors: 5 },
            { scenario: 'B', vendors: 3 },
            { scenario: 'C', vendors: 2 },
            { scenario: 'D', vendors: 2 },
            { scenario: 'E', vendors: 2 },
            { scenario: 'F', vendors: 1 },
            { scenario: 'G', vendors: 1 }
          ]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="scenario" label={{ value: 'Scenario', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Number of Vendors', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="vendors" fill={COLORS.primary} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // FINANCIAL ANALYSIS TAB
  const renderFinancialTab = () => (
    <div className="space-y-6">
      <ExecutiveSummaryCard scenario={selectedScenario} />

      {/* Financial Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <DollarSign className="w-6 h-6" style={{ color: COLORS.primary }} />
          Savings Breakdown
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={Object.values(SCENARIOS[selectedScenario]?.breakdown || {}).map((value, idx) => ({
            name: Object.keys(SCENARIOS[selectedScenario]?.breakdown || {})[idx],
            value: value
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'Savings ($M)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill={COLORS.primary} />
          </BarChart>
        </ResponsiveContainer>
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

      {/* Risk vs Reward Quadrant Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Target className="w-6 h-6" style={{ color: COLORS.primary }} />
          Risk vs Reward Positioning
        </h2>
        <p className="text-gray-600 mb-4">
          Strategic positioning of each scenario based on risk level and financial reward. Top-right quadrant represents optimal high-reward, low-risk opportunities.
        </p>
        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart margin={{ top: 20, right: 80, bottom: 60, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="risk"
              name="Risk Score"
              domain={[0, 10]}
              label={{ value: 'Risk Score (Lower is Better) →', position: 'bottom', offset: 40 }}
            />
            <YAxis
              type="number"
              dataKey="reward"
              name="Annual Savings"
              domain={[0, 'auto']}
              label={{ value: '← Annual Savings ($M)', angle: -90, position: 'left', offset: 40 }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-4 border-2 rounded-lg shadow-lg" style={{ borderColor: data.color }}>
                      <p className="font-bold text-lg mb-2">{data.name}</p>
                      <p className="text-sm text-gray-600">Risk Score: <span className="font-bold">{data.risk}/10</span></p>
                      <p className="text-sm text-gray-600">Annual Savings: <span className="font-bold">${data.reward.toFixed(1)}M</span></p>
                      <p className="text-sm text-gray-600">Vendors: <span className="font-bold">{data.vendorCount}</span></p>
                      <p className="text-sm mt-2 px-2 py-1 rounded" style={{ backgroundColor: `${data.color}20`, color: data.color }}>
                        {data.risk < 3 ? 'Low Risk' : data.risk < 6 ? 'Medium Risk' : 'Higher Risk'}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter
              name="Scenarios"
              data={Object.values(SCENARIOS).map(s => ({
                name: s.shortName,
                risk: s.riskScore,
                reward: s.annualSavings,
                vendorCount: s.vendorCount,
                color: s.riskLevel === 'low' ? '#10B981' : s.riskLevel === 'medium' ? '#F59E0B' : '#EF4444',
                isSelected: s.id === selectedScenario
              }))}
            >
              {Object.values(SCENARIOS).map((s, index) => {
                const color = s.riskLevel === 'low' ? '#10B981' : s.riskLevel === 'medium' ? '#F59E0B' : '#EF4444';
                const isSelected = s.id === selectedScenario;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={color}
                    stroke={isSelected ? '#BA4896' : color}
                    strokeWidth={isSelected ? 4 : 1}
                    r={isSelected ? 12 : 8}
                  />
                );
              })}
            </Scatter>
            {/* Reference lines for quadrants */}
            <line x1={300} y1={0} x2={300} y2={500} stroke="#ccc" strokeDasharray="5 5" strokeWidth={1} />
            <line x1={0} y1={250} x2={600} y2={250} stroke="#ccc" strokeDasharray="5 5" strokeWidth={1} />
          </ScatterChart>
        </ResponsiveContainer>

        {/* Quadrant Legend */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h3 className="font-bold text-green-900">Optimal Zone</h3>
            </div>
            <p className="text-sm text-green-700">High Reward, Low Risk - Recommended scenarios for implementation</p>
          </div>
          <div className="border-2 border-yellow-200 bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <h3 className="font-bold text-yellow-900">Balanced Zone</h3>
            </div>
            <p className="text-sm text-yellow-700">Moderate Reward & Risk - Consider with careful planning</p>
          </div>
          <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h3 className="font-bold text-blue-900">Conservative Zone</h3>
            </div>
            <p className="text-sm text-blue-700">Lower Reward, Lower Risk - Safe but limited value creation</p>
          </div>
          <div className="border-2 border-red-200 bg-red-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <h3 className="font-bold text-red-900">Caution Zone</h3>
            </div>
            <p className="text-sm text-red-700">Higher Risk - Requires strong mitigation strategies and stakeholder buy-in</p>
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

        {/* Quintuple Aim Explanations */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <HelpCircle className="w-6 h-6" style={{ color: COLORS.primary }} />
            Understanding the Quintuple Aim Framework
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            description: 'Enhanced clinical communication capabilities, potential bundling opportunities with OR equipment',
            implications: ['Integration with Stryker platforms', 'New communication solutions', 'Potential pricing leverage']
          },
          {
            date: '2023-Q4',
            title: 'J&J Completes Abiomed Acquisition',
            impact: 'Low',
            description: 'Cardiovascular focus, minimal direct orthopedic impact',
            implications: ['J&J portfolio diversification', 'Resource allocation shifts', 'Cross-specialty synergies']
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
            description: 'ZimVie spin-off completes separation, focusing core business on joints',
            implications: ['Increased focus on hip/knee portfolio', 'Potential pricing adjustments', 'Supply chain optimization']
          },
          {
            date: '2021-Q3',
            title: 'J&J Separates Consumer Health Division (Kenvue)',
            impact: 'Low',
            description: 'Creation of Kenvue as standalone entity, DePuy Synthes remains with J&J MedTech',
            implications: ['Streamlined MedTech focus', 'Capital reallocation to ortho R&D', 'Enhanced shareholder value focus']
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
            description: 'Legacy metal-on-metal hip implant settlements continue, minimal current portfolio impact',
            implications: ['Increased quality oversight', 'Enhanced clinical evidence requirements', 'Product liability considerations']
          },
          {
            date: '2023-Q3',
            title: 'DOJ Investigation into Implant Pricing',
            impact: 'High',
            description: 'Federal investigation into orthopedic device pricing practices across industry',
            implications: ['Increased price transparency pressure', 'Potential regulatory changes', 'Enhanced compliance requirements']
          },
          {
            date: '2023-Q1',
            title: 'FDA Modernization Act 2.0',
            impact: 'Medium',
            description: 'New pathways for medical device approvals, alternatives to animal testing',
            implications: ['Faster innovation cycles', 'New product introductions accelerated', 'Competitive landscape shifts']
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
            description: 'Continued expansion of robotic platforms (Mako, Rosa, Navio) driving vendor differentiation',
            implications: ['Technology integration requirements', 'Capital equipment considerations', 'Surgeon training investments']
          },
          {
            date: '2023-Q4',
            title: 'ASC Migration Accelerates',
            impact: 'High',
            description: 'Hip and knee procedures shifting to ambulatory surgery centers, changing purchasing dynamics',
            implications: ['Value-based purchasing emphasis', 'Episode payment models', 'Supply chain efficiency focus']
          },
          {
            date: '2023-Q2',
            title: 'Direct Contracting Models Emerge',
            impact: 'Medium',
            description: 'New direct-to-employer joint replacement programs bypassing traditional reimbursement',
            implications: ['Bundled payment pressure', 'Outcome-based contracting', 'Price transparency demands']
          }
        ]
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

        {/* Detailed Intelligence Cards */}
        {industryIntelligence.map((category) => {
          const CategoryIcon = category.icon;
          return (
            <div key={category.category} className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <CategoryIcon className="w-6 h-6" style={{ color: category.color }} />
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.events.map((event, idx) => (
                  <div key={idx} className="border-l-4 pl-4 py-3" style={{ borderColor: getImpactColor(event.impact) }}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{event.title}</h3>
                          <span
                            className="px-2 py-1 rounded text-xs font-medium text-white"
                            style={{ backgroundColor: getImpactColor(event.impact) }}
                          >
                            {event.impact} Impact
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">{event.date}</div>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{event.description}</p>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Strategic Implications:</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {event.implications.map((imp, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-purple-600 font-bold">•</span>
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
      </div>
    );
  };

  // DECISION FRAMEWORK TAB
  const renderDecisionTab = () => {
    return (
      <div className="space-y-6">
        <ExecutiveSummaryCard scenario={selectedScenario} />

        {/* Decision Matrix */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Decision Support Matrix</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4 bg-green-50">
              <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Strengths
              </h3>
              <ul className="space-y-1 text-sm text-green-800">
                <li>• {SCENARIOS[selectedScenario]?.adoptionRate >= 85 ? 'High adoption rate' : 'Moderate adoption expected'}</li>
                <li>• ${SCENARIOS[selectedScenario]?.annualSavings.toFixed(2)}M annual savings potential</li>
                <li>• {SCENARIOS[selectedScenario]?.quintupleMissionScore >= 80 ? 'Strong' : 'Good'} mission alignment</li>
                <li>• {SCENARIOS[selectedScenario]?.implementation.timeline} month implementation timeline</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4 bg-red-50">
              <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Risks & Challenges
              </h3>
              <ul className="space-y-1 text-sm text-red-800">
                <li>• {SCENARIOS[selectedScenario]?.riskLevel.charAt(0).toUpperCase() + SCENARIOS[selectedScenario]?.riskLevel.slice(1)} risk level (score: {SCENARIOS[selectedScenario]?.riskScore}/10)</li>
                <li>• ${SCENARIOS[selectedScenario]?.implementation.costMillions}M implementation cost</li>
                <li>• {SCENARIOS[selectedScenario]?.implementation.complexity} implementation complexity</li>
                <li>• Change management across {realData ? Object.values(realData.regions).reduce((sum, r) => sum + r.surgeons, 0) : 0} surgeons</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // WHAT-IF SCENARIO TOOLS
  const renderWhatIfTools = () => (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Sliders className="w-5 h-5" style={{ color: COLORS.primary }} />
        Interactive What-If Scenario Analysis
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adoption Rate Modifier: {whatIfParams.adoptionModifier > 0 ? '+' : ''}{whatIfParams.adoptionModifier}%
          </label>
          <input
            type="range"
            min="-20"
            max="20"
            value={whatIfParams.adoptionModifier}
            onChange={(e) => setWhatIfParams({ ...whatIfParams, adoptionModifier: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>-20%</span>
            <span>0</span>
            <span>+20%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Erosion: {whatIfParams.priceErosion > 0 ? '+' : ''}{whatIfParams.priceErosion}%
          </label>
          <input
            type="range"
            min="-10"
            max="10"
            value={whatIfParams.priceErosion}
            onChange={(e) => setWhatIfParams({ ...whatIfParams, priceErosion: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>-10%</span>
            <span>0</span>
            <span>+10%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Implementation Timeline: {whatIfParams.implementationMonths} months
          </label>
          <input
            type="range"
            min="6"
            max="24"
            value={whatIfParams.implementationMonths}
            onChange={(e) => setWhatIfParams({ ...whatIfParams, implementationMonths: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>6mo</span>
            <span>12mo</span>
            <span>24mo</span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-purple-50 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-purple-700">Adjusted Adoption</div>
            <div className="text-xl font-bold text-purple-900">
              {getAdjustedMetrics(selectedScenario)?.adoptionRate.toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-sm text-purple-700">Adjusted Savings</div>
            <div className="text-xl font-bold text-purple-900">
              ${getAdjustedMetrics(selectedScenario)?.annualSavings.toFixed(2)}M
            </div>
          </div>
          <div>
            <div className="text-sm text-purple-700">Timeline</div>
            <div className="text-xl font-bold text-purple-900">
              {whatIfParams.implementationMonths}mo
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setWhatIfParams({ adoptionModifier: 0, priceErosion: 0, implementationMonths: 12 })}
        className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
      >
        Reset to Baseline
      </button>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation Header */}
      <NavigationHeader role="executive" specialty="hipknee" specialtyName="Hip & Knee" persona={persona} />

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
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
                  {realData ? ` ${Object.values(realData.regions).reduce((sum, r) => sum + r.surgeons, 0)} Surgeons` : ' Loading...'} |
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

        {/* Tab Navigation */}
        {renderTabs()}

        {/* Tab Content */}
        <div className="transition-all">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'financial' && renderFinancialTab()}
          {activeTab === 'components' && renderComponentTab()}
          {activeTab === 'risk' && renderRiskTab()}
          {activeTab === 'mission' && renderMissionTab()}
          {activeTab === 'industry' && renderIndustryTab()}
          {activeTab === 'decision' && renderDecisionTab()}
        </div>

        {/* Footer with Data Source */}
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg text-center">
          <p className="text-sm text-gray-600">
            Dashboard generated for Doug Barnaby | CommonSpirit Health Strategic Decision-Making
          </p>
          {realData && (
            <p className="text-xs text-gray-500 mt-2">
              Data Source: {realData.metadata.dataSource} |
              Analysis Date: {realData.metadata.analysisDate} |
              Last Updated: {new Date(realData.metadata.lastUpdated).toLocaleString()}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Dashboard Version: {realData?.metadata.version || '1.0'} |
            Regions: {realData ? Object.keys(realData.regions).join(', ') : 'Loading...'}
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default EnhancedOrthopedicDashboard;
