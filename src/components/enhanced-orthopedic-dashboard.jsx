import React, { useState, useMemo, useEffect } from 'react';
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
  Sliders, ArrowRight, TrendingDown, HelpCircle, Eye, Download,
  Filter, BarChart3, Bookmark, Play, X, Check, Minus, ThumbsUp,
  ThumbsDown, BookOpen, MapPin, Stethoscope, Users2, Home, RefreshCw
} from 'lucide-react';

const EnhancedOrthopedicDashboard = () => {
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
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);

  // What-if scenario sliders
  const [whatIfParams, setWhatIfParams] = useState({
    adoptionModifier: 0, // -20 to +20
    priceErosion: 0, // -10 to +10
    implementationMonths: 12, // 6 to 24
  });

  // Tri-pillar voting state
  const [pillarVotes, setPillarVotes] = useState({
    clinical: null, // ADVANCE, DEFER, REJECT
    finance: null,
    operations: null
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
        description: 'Single-vendor consolidation with ZIMMER BIOMET',
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
        description: 'Single-vendor consolidation with STRYKER',
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

  // Determine decision outcome based on tri-pillar votes
  const getDecisionOutcome = () => {
    const { clinical, finance, operations } = pillarVotes;
    if (!clinical || !finance || !operations) return null;

    if (clinical === 'ADVANCE' && finance === 'ADVANCE' && operations === 'ADVANCE') {
      return { status: 'PROCEED', color: COLORS.success, icon: CheckCircle };
    } else if (clinical === 'REJECT' || finance === 'REJECT' || operations === 'REJECT') {
      return { status: 'REJECT', color: COLORS.danger, icon: XCircle };
    } else {
      return { status: 'DEFER', color: COLORS.warning, icon: AlertTriangle };
    }
  };

  // Export functions
  const exportToPDF = () => {
    alert('PDF export functionality would be implemented here using a library like jsPDF');
  };

  const exportToExcel = () => {
    alert('Excel export functionality would be implemented here');
  };

  const exportToPowerPoint = () => {
    alert('PowerPoint export functionality would be implemented here');
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
    const tabs = [
      { id: 'overview', label: 'Overview', icon: Eye },
      { id: 'financial', label: 'Financial Analysis', icon: DollarSign },
      { id: 'components', label: 'Component Analysis', icon: Package },
      { id: 'risk', label: 'Risk Assessment', icon: Shield },
      { id: 'mission', label: 'Mission Impact', icon: Heart },
      { id: 'decision', label: 'Decision Framework', icon: Target }
    ];

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
                <th className="px-4 py-3 text-left font-bold text-gray-900">Prob-Weighted</th>
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
          Analysis of component-level pricing showing potential savings from vendor consolidation
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

    return (
      <div className="space-y-6">
        <ExecutiveSummaryCard scenario={selectedScenario} />

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

  // DECISION FRAMEWORK TAB
  const renderDecisionTab = () => {
    const decision = getDecisionOutcome();
    const DecisionIcon = decision?.icon || HelpCircle;

    return (
      <div className="space-y-6">
        <ExecutiveSummaryCard scenario={selectedScenario} />

        {/* Tri-Pillar Voting */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-6 h-6" style={{ color: COLORS.primary }} />
            Tri-Pillar Decision Framework
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Clinical Vote */}
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Stethoscope className="w-6 h-6" style={{ color: COLORS.info }} />
                <h3 className="font-bold text-lg">Clinical Leadership</h3>
              </div>
              <div className="space-y-2">
                {['ADVANCE', 'DEFER', 'REJECT'].map(vote => (
                  <button
                    key={vote}
                    onClick={() => setPillarVotes({ ...pillarVotes, clinical: vote })}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                      pillarVotes.clinical === vote
                        ? vote === 'ADVANCE' ? 'bg-green-600 text-white' :
                          vote === 'DEFER' ? 'bg-yellow-600 text-white' :
                          'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {vote === 'ADVANCE' && <ThumbsUp className="w-4 h-4 inline mr-2" />}
                    {vote === 'DEFER' && <Minus className="w-4 h-4 inline mr-2" />}
                    {vote === 'REJECT' && <ThumbsDown className="w-4 h-4 inline mr-2" />}
                    {vote}
                  </button>
                ))}
              </div>
            </div>

            {/* Finance Vote */}
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-6 h-6" style={{ color: COLORS.success }} />
                <h3 className="font-bold text-lg">Finance</h3>
              </div>
              <div className="space-y-2">
                {['ADVANCE', 'DEFER', 'REJECT'].map(vote => (
                  <button
                    key={vote}
                    onClick={() => setPillarVotes({ ...pillarVotes, finance: vote })}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                      pillarVotes.finance === vote
                        ? vote === 'ADVANCE' ? 'bg-green-600 text-white' :
                          vote === 'DEFER' ? 'bg-yellow-600 text-white' :
                          'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {vote === 'ADVANCE' && <ThumbsUp className="w-4 h-4 inline mr-2" />}
                    {vote === 'DEFER' && <Minus className="w-4 h-4 inline mr-2" />}
                    {vote === 'REJECT' && <ThumbsDown className="w-4 h-4 inline mr-2" />}
                    {vote}
                  </button>
                ))}
              </div>
            </div>

            {/* Operations Vote */}
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-6 h-6" style={{ color: COLORS.warning }} />
                <h3 className="font-bold text-lg">Operations</h3>
              </div>
              <div className="space-y-2">
                {['ADVANCE', 'DEFER', 'REJECT'].map(vote => (
                  <button
                    key={vote}
                    onClick={() => setPillarVotes({ ...pillarVotes, operations: vote })}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                      pillarVotes.operations === vote
                        ? vote === 'ADVANCE' ? 'bg-green-600 text-white' :
                          vote === 'DEFER' ? 'bg-yellow-600 text-white' :
                          'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {vote === 'ADVANCE' && <ThumbsUp className="w-4 h-4 inline mr-2" />}
                    {vote === 'DEFER' && <Minus className="w-4 h-4 inline mr-2" />}
                    {vote === 'REJECT' && <ThumbsDown className="w-4 h-4 inline mr-2" />}
                    {vote}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Decision Outcome */}
          {decision && (
            <div className={`mt-6 p-6 rounded-lg border-4`} style={{
              borderColor: decision.color,
              backgroundColor: `${decision.color}20`
            }}>
              <div className="flex items-center gap-4">
                <DecisionIcon className="w-12 h-12" style={{ color: decision.color }} />
                <div>
                  <div className="text-sm font-medium" style={{ color: decision.color }}>
                    Consensus Decision
                  </div>
                  <div className="text-3xl font-bold" style={{ color: decision.color }}>
                    {decision.status}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
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
                  Orthopedic Vendor Consolidation
                </h1>
                <p className="text-gray-600 mt-1">
                  CommonSpirit Health | Executive Decision Dashboard
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
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                Excel
              </button>
              <button
                onClick={exportToPowerPoint}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                <Download className="w-4 h-4" />
                PPT
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
              <div className="text-sm text-amber-700 mb-1">Total Cases</div>
              <div className="text-2xl font-bold text-amber-900">
                {realData ? realData.metadata.totalCases.toLocaleString() : '0'}
              </div>
              <div className="text-xs text-amber-600">Hip & Knee</div>
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
  );
};

export default EnhancedOrthopedicDashboard;
