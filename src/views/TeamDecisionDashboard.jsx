import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TrendingUp, Stethoscope, Shield, DollarSign, Users, Package, AlertCircle, Eye, Heart, Target, Star, Activity, ChevronRight, MapPin, Lightbulb, FileCheck, Building2 } from 'lucide-react';
import NavigationHeader from '../components/shared/NavigationHeader';
import { formatCurrency } from '../utils/formatters';

const TeamDecisionDashboard = () => {
  const { specialty } = useParams();
  const navigate = useNavigate();
  const [realData, setRealData] = useState(null);
  const [strategyData, setStrategyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('scenarios');
  const [selectedScenario, setSelectedScenario] = useState('C');
  const [hospitalScenarioFilter, setHospitalScenarioFilter] = useState('C');
  const [productLine, setProductLine] = useState(specialty || 'hipknee');

  // Load data
  useEffect(() => {
    setLoading(true);

    // Load orthopedic data based on product line
    const dataFileName = productLine === 'hipknee' ? 'orthopedic-data.json' : 'shoulder-data.json';
    const jsonPath = `${process.env.PUBLIC_URL}/${dataFileName}`;

    fetch(jsonPath)
      .then(response => response.json())
      .then(data => {
        setRealData(data);
      })
      .catch(err => {
        console.error(`Error loading ${productLine} data:`, err);
      });

    // Load strategic framework data
    const strategyPath = `${process.env.PUBLIC_URL}/strategic-framework.json`;
    fetch(strategyPath)
      .then(response => response.json())
      .then(data => {
        setStrategyData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading strategy data:', err);
        setLoading(false);
      });
  }, [productLine]);

  const COLORS = {
    primary: '#BA4896',
    finance: '#F59E0B',
    clinical: '#3B82F6',
    operations: '#10B981'
  };

  // Get total surgeons from metadata (not vendor sum which counts duplicates)
  const totalSurgeons = realData?.metadata?.totalSurgeons || 205;

  // Scenarios data
  const SCENARIOS = realData?.scenarios || {};

  // Three-Pillar Scenario Card Component
  const ThreePillarScenarioCard = ({ scenarioId, scenario, isSelected, onClick }) => {
    if (!scenario) return null;

    return (
      <div
        onClick={onClick}
        className={`rounded-xl border-2 p-4 cursor-pointer transition-all h-full flex flex-col ${
          isSelected
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-white shadow-xl'
            : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-lg'
        }`}
      >
        {/* Header - Compact */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900 truncate">
                {scenario.name}
              </h3>
              {isSelected && (
                <div className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full flex-shrink-0">
                  SELECTED
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{scenario.description}</p>
          </div>

          {/* Mission Alignment Score - Compact */}
          <div className="ml-3 flex-shrink-0 text-center bg-gradient-to-br from-slate-600 to-slate-700 text-white rounded-lg p-2 min-w-[80px] group relative">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Star className="w-3 h-3 text-yellow-300" />
              <div className="text-xs font-semibold">Mission</div>
            </div>
            <div className="text-2xl font-bold">{(scenario.quintupleMissionScore || 0).toFixed(0)}</div>
            <div className="text-xs opacity-75">/100</div>

            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              Mission Score: Alignment with<br/>CommonSpirit's Quintuple Aim<br/>(Patient, Population, Provider,<br/>Financial, Equity)
            </div>
          </div>
        </div>

        {/* Three Pillar Grid - Stack on smaller screens */}
        <div className="grid grid-cols-1 gap-4 flex-1">
          {/* Finance Pillar */}
          <div className="bg-gradient-to-br from-amber-50 to-white border-2 border-amber-300 rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h4 className="text-base font-bold text-amber-900">Finance</h4>
                <div className="text-xs text-amber-700">Funding the mission</div>
              </div>
            </div>

            <div className="space-y-3">
              {scenario.annualSavings === 0 ? (
                <div className="text-center py-4 bg-white rounded-lg border-2 border-amber-200">
                  <div className="text-amber-700 font-semibold text-sm">No cost savings</div>
                  <div className="text-xs text-amber-600 mt-1">Baseline scenario</div>
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-lg border-2 border-amber-200 p-3">
                    <div className="text-xs text-amber-700 mb-1">Annual Savings</div>
                    <div className="text-2xl font-bold text-amber-900">
                      {formatCurrency(scenario.annualSavings || 0, { millions: true })}
                    </div>
                    <div className="text-xs text-amber-600 mt-1">
                      {(scenario.savingsPercent * 100 || 0).toFixed(1)}% reduction
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white rounded-lg border border-amber-200 p-2">
                      <div className="text-xs text-amber-700 mb-0.5">5-Year NPV</div>
                      <div className="text-base font-bold text-amber-900">
                        {formatCurrency(scenario.npv5Year || 0, { millions: true })}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg border border-amber-200 p-2">
                      <div className="text-xs text-amber-700 mb-0.5">ROI</div>
                      <div className="text-base font-bold text-amber-900">
                        {(((scenario.npv5Year || 0) / 1000000) / (scenario.implementation?.costMillions || 1)).toFixed(1)}x
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Clinical Pillar */}
          <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-300 rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h4 className="text-base font-bold text-blue-900">Clinical</h4>
                <div className="text-xs text-blue-700">Delivering excellent care</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-white rounded-lg border-2 border-blue-200 p-3">
                <div className="text-xs text-blue-700 mb-1">Already Aligned</div>
                <div className="text-2xl font-bold text-blue-900">
                  {(scenario.adoptionRate * 100 || 0).toFixed(0)}%
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {Math.round(totalSurgeons * (scenario.adoptionRate || 0))} of {totalSurgeons} surgeons don't need to change
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-lg border border-blue-200 p-2">
                  <div className="text-xs text-blue-700 mb-0.5">Vendors</div>
                  <div className="text-base font-bold text-blue-900">
                    {scenario.vendors?.length || 0}
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-blue-200 p-2">
                  <div className="text-xs text-blue-700 mb-0.5">Need Transitioning</div>
                  <div className="text-base font-bold text-blue-900">
                    {Math.round(totalSurgeons * (1 - (scenario.adoptionRate || 0)))} surgeons
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Operations Pillar */}
          <div className="bg-gradient-to-br from-green-50 to-white border-2 border-green-300 rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h4 className="text-base font-bold text-green-900">Operations</h4>
                <div className="text-xs text-green-700">Executing efficiently</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-white rounded-lg border-2 border-green-200 p-3">
                <div className="text-xs text-green-700 mb-1">Implementation Timeline</div>
                <div className="text-2xl font-bold text-green-900">
                  {scenario.implementation?.timeline || 0}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  months to full deployment
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-lg border border-green-200 p-2">
                  <div className="text-xs text-green-700 mb-0.5">Complexity</div>
                  <div className="text-base font-bold text-green-900">
                    {scenario.implementation?.complexity || 'N/A'}
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-green-200 p-2">
                  <div className="text-xs text-green-700 mb-0.5">Risk</div>
                  <div className="text-base font-bold text-green-900">
                    {scenario.riskLevel || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render tabs
  const tabs = [
    { id: 'scenarios', label: 'Scenario Comparison', icon: Eye },
    { id: 'assumptions', label: 'Assumptions & Validation', icon: FileCheck },
    { id: 'hospitals', label: 'Hospital & Sherpa Analysis', icon: Building2 },
    { id: 'finance', label: 'Financial Deep Dive', icon: DollarSign },
    { id: 'clinical', label: 'Clinical Deep Dive', icon: Stethoscope },
    { id: 'operations', label: 'Operations Deep Dive', icon: Shield },
    { id: 'components', label: 'Component Analysis', icon: Package }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team decision dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavigationHeader role="team" specialty="hipknee" specialtyName="Hip & Knee" persona="team" />

      <div className="p-6">
        <div className="w-full mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Integrated Decision Dashboard
                </h1>
                <p className="text-gray-600 text-lg">
                  {productLine === 'hipknee' ? 'Hip & Knee Replacement' : 'Shoulder Replacement'} - Multi-perspective analysis guided by the Quintuple Aim
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Total Cases</div>
                <div className="text-3xl font-bold text-slate-700">
                  {realData ? (realData.metadata?.totalCases || 0).toLocaleString() : '0'}
                </div>
                <div className="text-sm text-gray-600 mt-1">procedures analyzed</div>
              </div>
            </div>


            {/* Quintuple Aim North Star Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 text-yellow-300" />
                  <div>
                    <h2 className="text-2xl font-bold">Quintuple Aim - Our North Star</h2>
                    <p className="text-slate-200 text-sm mt-1">
                      All decisions evaluated through CommonSpirit's mission framework
                    </p>
                  </div>
                </div>
                <Heart className="w-12 h-12 text-slate-400 opacity-40" />
              </div>
              <div className="grid grid-cols-5 gap-5">
                <div className="text-center">
                  <div className="text-3xl mb-2">👤</div>
                  <div className="font-bold">Patient</div>
                  <div className="font-bold">Experience</div>
                  <div className="text-xs text-slate-300 mt-1">Quality care delivery</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🏥</div>
                  <div className="font-bold">Population</div>
                  <div className="font-bold">Health</div>
                  <div className="text-xs text-slate-300 mt-1">Community outcomes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="font-bold">Cost</div>
                  <div className="font-bold">Reduction</div>
                  <div className="text-xs text-slate-300 mt-1">Sustainable value</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">⚕️</div>
                  <div className="font-bold">Provider</div>
                  <div className="font-bold">Experience</div>
                  <div className="text-xs text-slate-300 mt-1">Team well-being</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">⚖️</div>
                  <div className="font-bold">Health</div>
                  <div className="font-bold">Equity</div>
                  <div className="text-xs text-slate-300 mt-1">Access for all</div>
                </div>
              </div>
            </div>

            {/* Three Pillars Serve the Quintuple Aim */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                <DollarSign className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <div className="font-bold text-amber-900">Finance</div>
                <div className="text-xs text-amber-700 mt-1">Funding the mission</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Stethoscope className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="font-bold text-blue-900">Clinical</div>
                <div className="text-xs text-blue-700 mt-1">Delivering excellent care</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="font-bold text-green-900">Operations</div>
                <div className="text-xs text-green-700 mt-1">Executing efficiently</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="flex gap-2 overflow-x-auto">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'scenarios' && (
            <div className="space-y-6">
              {/* Info Banner */}
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-blue-900 mb-2">How to Use This View</h3>
                    <p className="text-blue-800 text-sm">
                      Each scenario shows three perspectives side-by-side. Review the tradeoffs between financial savings,
                      clinical adoption, and operational feasibility. Select a scenario to see more details.
                    </p>
                  </div>
                </div>
              </div>

              {/* Scenario Cards - Responsive Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                {Object.entries(SCENARIOS).map(([id, scenario]) => (
                  <ThreePillarScenarioCard
                    key={id}
                    scenarioId={id}
                    scenario={scenario}
                    isSelected={selectedScenario === id}
                    onClick={() => setSelectedScenario(id)}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'assumptions' && strategyData && strategyData.decisions && strategyData.decisions[0] && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-purple-900 mb-2 flex items-center gap-2">
                  <FileCheck className="w-7 h-7" />
                  Assumptions & Validation Framework
                </h2>
                <p className="text-gray-600 italic">Making assumptions transparent and trackable for accountability</p>
              </div>

              {/* Assumptions Overview */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-6 h-6 text-amber-600" />
                    <h3 className="font-bold text-amber-900">Finance</h3>
                  </div>
                  <div className="text-3xl font-bold text-amber-900 mb-1">
                    {strategyData.decisions[0].assumptions.filter(a => a.pillar === 'finance').length}
                  </div>
                  <div className="text-sm text-amber-700">key assumptions</div>
                </div>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="w-6 h-6 text-blue-600" />
                    <h3 className="font-bold text-blue-900">Clinical</h3>
                  </div>
                  <div className="text-3xl font-bold text-blue-900 mb-1">
                    {strategyData.decisions[0].assumptions.filter(a => a.pillar === 'clinical').length}
                  </div>
                  <div className="text-sm text-blue-700">key assumptions</div>
                </div>
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-6 h-6 text-green-600" />
                    <h3 className="font-bold text-green-900">Operations</h3>
                  </div>
                  <div className="text-3xl font-bold text-green-900 mb-1">
                    {strategyData.decisions[0].assumptions.filter(a => a.pillar === 'operations').length}
                  </div>
                  <div className="text-sm text-green-700">key assumptions</div>
                </div>
              </div>

              {/* Assumptions Table */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">All Assumptions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-purple-100 border-b-2 border-purple-300">
                        <th className="text-left p-4 font-bold text-purple-900">Pillar</th>
                        <th className="text-left p-4 font-bold text-purple-900">Assumption</th>
                        <th className="text-center p-4 font-bold text-purple-900">Confidence</th>
                        <th className="text-left p-4 font-bold text-purple-900">Validation Metrics</th>
                        <th className="text-center p-4 font-bold text-purple-900">Frequency</th>
                        <th className="text-left p-4 font-bold text-purple-900">Owner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {strategyData.decisions[0].assumptions.map((assumption, idx) => {
                        const pillarColors = {
                          finance: 'bg-amber-50 text-amber-900 border-amber-200',
                          clinical: 'bg-blue-50 text-blue-900 border-blue-200',
                          operations: 'bg-green-50 text-green-900 border-green-200'
                        };
                        const confidenceColors = {
                          high: 'bg-green-100 text-green-800 border-green-300',
                          medium: 'bg-amber-100 text-amber-800 border-amber-300',
                          low: 'bg-red-100 text-red-800 border-red-300'
                        };
                        return (
                          <tr key={idx} className="border-b border-gray-200 hover:bg-purple-50">
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${pillarColors[assumption.pillar]}`}>
                                {assumption.pillar}
                              </span>
                            </td>
                            <td className="p-4 text-sm text-gray-800">{assumption.assumption}</td>
                            <td className="p-4 text-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${confidenceColors[assumption.confidence]}`}>
                                {assumption.confidence}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-gray-700">
                              {assumption.validationMetrics.join(', ')}
                            </td>
                            <td className="p-4 text-center text-sm text-gray-700">
                              {assumption.validationFrequency}
                            </td>
                            <td className="p-4 text-sm text-gray-700">{assumption.owner}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Why Assumptions Matter */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded">
                  <h3 className="font-bold text-purple-900 mb-3">Why Track Assumptions?</h3>
                  <ul className="space-y-2 text-sm text-purple-800">
                    <li>• <strong>Transparency:</strong> Everyone knows what we believe must be true</li>
                    <li>• <strong>Accountability:</strong> Clear owners for validating each assumption</li>
                    <li>• <strong>Learning:</strong> Track which assumptions hold vs. fail over time</li>
                    <li>• <strong>Agility:</strong> Early warning system to pivot when assumptions break</li>
                  </ul>
                </div>
                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded">
                  <h3 className="font-bold text-blue-900 mb-3">Validation Process</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>• Each assumption has defined validation metrics</li>
                    <li>• Regular review cadence (monthly or quarterly)</li>
                    <li>• Status updates in lookback/retrospective sessions</li>
                    <li>• Triggers decision to <strong>Persevere</strong>, <strong>Pivot</strong>, or <strong>Stop</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-amber-900 mb-2 flex items-center gap-2">
                  <DollarSign className="w-7 h-7" />
                  Financial Deep Dive
                </h2>
                <p className="text-gray-600 italic">Funding the mission through sustainable economics</p>
              </div>

              {/* Financial Comparison Table */}
              <div className="overflow-x-auto mb-8">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-amber-100 border-b-2 border-amber-300">
                      <th className="text-left p-4 font-bold text-amber-900">Metric</th>
                      {Object.entries(SCENARIOS).map(([id, scenario]) => (
                        <th key={id} className="text-center p-4 font-bold text-amber-900">
                          {scenario.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200 hover:bg-amber-50">
                      <td className="p-4 font-semibold text-gray-700">Annual Savings</td>
                      {Object.values(SCENARIOS).map((scenario, idx) => (
                        <td key={idx} className="text-center p-4 font-bold text-amber-900">
                          {formatCurrency(scenario.annualSavings || 0, { millions: true })}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-amber-50">
                      <td className="p-4 font-semibold text-gray-700">Savings Percentage</td>
                      {Object.values(SCENARIOS).map((scenario, idx) => (
                        <td key={idx} className="text-center p-4 text-amber-900">
                          {(scenario.savingsPercent || 0).toFixed(1)}%
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-amber-50">
                      <td className="p-4 font-semibold text-gray-700">5-Year NPV</td>
                      {Object.values(SCENARIOS).map((scenario, idx) => (
                        <td key={idx} className="text-center p-4 font-bold text-amber-900">
                          {formatCurrency(scenario.npv5Year || 0, { millions: true })}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-amber-50">
                      <td className="p-4 font-semibold text-gray-700">Implementation Cost</td>
                      {Object.values(SCENARIOS).map((scenario, idx) => (
                        <td key={idx} className="text-center p-4 text-amber-900">
                          {formatCurrency(scenario.implementation?.costMillions || 0, { millions: true })}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-blue-50 border-b border-blue-200">
                      <td className="p-4 font-semibold text-blue-900">Clinical Impact</td>
                      {Object.values(SCENARIOS).map((scenario, idx) => {
                        const affectedSurgeons = Math.round(totalSurgeons * (1 - scenario.adoptionRate));
                        // Estimate high volume loyalists: ~30% of affected surgeons are high volume (>50 cases/year)
                        // and ~60% of high volume surgeons are vendor loyalists (strong preference)
                        const highVolumeLoyalists = Math.round(affectedSurgeons * 0.30 * 0.60);
                        return (
                          <td key={idx} className="text-center p-4 text-blue-900 text-sm">
                            <div className="font-semibold">{affectedSurgeons} surgeons affected</div>
                            <div className="text-xs text-blue-700 mt-1">
                              ({highVolumeLoyalists} high-volume vendor loyalists)
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="bg-green-50">
                      <td className="p-4 font-semibold text-green-900">Implementation Timeline</td>
                      {Object.values(SCENARIOS).map((scenario, idx) => (
                        <td key={idx} className="text-center p-4 text-green-900 text-sm">
                          {scenario.implementation?.timeline || 0} months
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Key Insights */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-amber-50 border-l-4 border-amber-600 p-6 rounded">
                  <h3 className="font-bold text-amber-900 mb-3">Financial Highlights</h3>
                  <ul className="space-y-2 text-sm text-amber-800">
                    <li>• Potential savings range from $0 (Status Quo) to {formatCurrency(Math.max(...Object.values(SCENARIOS).map(s => s.annualSavings || 0)), { millions: true })} annually</li>
                    <li>• 5-year NPV varies from {formatCurrency(Math.min(...Object.values(SCENARIOS).map(s => s.npv5Year || 0)), { millions: true })} to {formatCurrency(Math.max(...Object.values(SCENARIOS).map(s => s.npv5Year || 0)), { millions: true })}</li>
                    <li>• Implementation costs range from {formatCurrency(Math.min(...Object.values(SCENARIOS).map(s => s.implementation?.costMillions || 0)), { millions: true })} to {formatCurrency(Math.max(...Object.values(SCENARIOS).map(s => s.implementation?.costMillions || 0)), { millions: true })}</li>
                  </ul>
                </div>
                <div className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded">
                  <h3 className="font-bold text-purple-900 mb-3">Mission Alignment</h3>
                  <p className="text-sm text-purple-800 mb-3">
                    Financial sustainability enables us to fulfill our Quintuple Aim commitments:
                  </p>
                  <ul className="space-y-2 text-sm text-purple-800">
                    <li>• Savings can be reinvested in patient care and health equity initiatives</li>
                    <li>• Cost reduction supports affordable care for our communities</li>
                    <li>• Efficient resource allocation improves provider experience</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clinical' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Stethoscope className="w-7 h-7" />
                  Clinical Deep Dive
                </h2>
                <p className="text-gray-600 italic">Delivering excellent care through engaged clinicians</p>
              </div>

              {/* Surgeon Impact Comparison */}
              <div className="overflow-x-auto mb-8">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-100 border-b-2 border-blue-300">
                      <th className="text-left p-4 font-bold text-blue-900">Clinical Metric</th>
                      {Object.entries(SCENARIOS).map(([id, scenario]) => (
                        <th key={id} className="text-center p-4 font-bold text-blue-900">
                          {scenario.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200 hover:bg-blue-50">
                      <td className="p-4 font-semibold text-gray-700">Surgeons Affected</td>
                      {Object.values(SCENARIOS).map((scenario, idx) => (
                        <td key={idx} className="text-center p-4 font-bold text-blue-900">
                          {Math.round(totalSurgeons * (1 - scenario.adoptionRate))}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-blue-50">
                      <td className="p-4 font-semibold text-gray-700">Percentage Switching</td>
                      {Object.values(SCENARIOS).map((scenario, idx) => (
                        <td key={idx} className="text-center p-4 text-blue-900">
                          {(100 - scenario.adoptionRate * 100).toFixed(0)}%
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-blue-50">
                      <td className="p-4 font-semibold text-gray-700">Vendor Count</td>
                      {Object.values(SCENARIOS).map((scenario, idx) => (
                        <td key={idx} className="text-center p-4 text-blue-900">
                          {scenario.vendors?.length || 0} vendors
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-blue-50">
                      <td className="p-4 font-semibold text-gray-700">Disruption Level</td>
                      {Object.values(SCENARIOS).map((scenario, idx) => {
                        const switchPct = 100 - scenario.adoptionRate * 100;
                        const level = switchPct === 0 ? 'None' : switchPct <= 15 ? 'Minimal' : switchPct <= 30 ? 'Moderate' : 'Significant';
                        const color = switchPct === 0 ? 'text-green-700' : switchPct <= 15 ? 'text-blue-700' : switchPct <= 30 ? 'text-amber-700' : 'text-red-700';
                        return (
                          <td key={idx} className={`text-center p-4 font-semibold ${color}`}>
                            {level}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-blue-50">
                      <td className="p-4 font-semibold text-gray-700">Mission Alignment Score</td>
                      {Object.values(SCENARIOS).map((scenario, idx) => (
                        <td key={idx} className="text-center p-4 font-bold text-blue-900">
                          {(scenario.quintupleMissionScore || 0).toFixed(0)}/100
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-amber-50 border-b border-amber-200">
                      <td className="p-4 font-semibold text-amber-900">Annual Savings</td>
                      {Object.values(SCENARIOS).map((scenario, idx) => (
                        <td key={idx} className="text-center p-4 text-amber-900 text-sm">
                          {formatCurrency(scenario.annualSavings || 0, { millions: true })}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-green-50">
                      <td className="p-4 font-semibold text-green-900">Implementation Timeline</td>
                      {Object.values(SCENARIOS).map((scenario, idx) => (
                        <td key={idx} className="text-center p-4 text-green-900 text-sm">
                          {scenario.implementation?.timeline || 0} months
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Clinical Insights */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded">
                  <h3 className="font-bold text-blue-900 mb-3">Clinical Considerations</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>• Total of {totalSurgeons} surgeons performing orthopedic procedures</li>
                    <li>• Vendor switching requires training, adaptation period, and strong communication</li>
                    <li>• Lower vendor count can simplify inventory but may limit surgeon choice</li>
                    <li>• Surgeon engagement critical for successful implementation</li>
                  </ul>
                </div>
                <div className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded">
                  <h3 className="font-bold text-purple-900 mb-3">Mission Alignment</h3>
                  <p className="text-sm text-purple-800 mb-3">
                    Clinical quality supports our Quintuple Aim:
                  </p>
                  <ul className="space-y-2 text-sm text-purple-800">
                    <li>• Surgeon satisfaction impacts provider experience scores</li>
                    <li>• Standardization can improve patient outcomes and safety</li>
                    <li>• Clinical buy-in enables successful transformation</li>
                  </ul>
                </div>
              </div>

              {/* Vendor Switching Definition */}
              <div className="mt-6 bg-blue-100 border border-blue-300 p-4 rounded">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  What does "Surgeons Affected" mean?
                </h4>
                <p className="text-sm text-blue-800">
                  This metric represents surgeons who currently use vendors that would not be included in the proposed scenario.
                  These surgeons would need to switch to one of the contracted vendors, requiring training and adjustment to new
                  equipment and workflows. The percentage reflects the proportion of our total surgeon population that would
                  experience this change.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'operations' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-green-900 mb-2 flex items-center gap-2">
                  <Shield className="w-7 h-7" />
                  Operations Deep Dive
                </h2>
                <p className="text-gray-600 italic">Executing efficiently to enable mission success</p>
              </div>

              {/* Implementation Comparison */}
              <div className="overflow-x-auto mb-8">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-green-100 border-b-2 border-green-300">
                      <th className="text-left p-4 font-bold text-green-900">Implementation Factor</th>
                      {Object.entries(SCENARIOS).map(([id, scenario]) => (
                        <th key={id} className="text-center p-4 font-bold text-green-900">
                          {scenario.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200 hover:bg-green-50">
                      <td className="p-4 font-semibold text-gray-700">Timeline</td>
                      {Object.values(SCENARIOS).map((scenario, idx) => (
                        <td key={idx} className="text-center p-4 font-bold text-green-900">
                          {scenario.implementation?.timeline || 0} months
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-green-50">
                      <td className="p-4 font-semibold text-gray-700">Complexity</td>
                      {Object.values(SCENARIOS).map((scenario, idx) => {
                        const complexity = scenario.implementation?.complexity || 'N/A';
                        const color = complexity === 'Low' ? 'text-green-700' : complexity === 'Medium' ? 'text-amber-700' : 'text-red-700';
                        return (
                          <td key={idx} className={`text-center p-4 font-semibold ${color}`}>
                            {complexity}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-green-50">
                      <td className="p-4 font-semibold text-gray-700">Risk Level</td>
                      {Object.values(SCENARIOS).map((scenario, idx) => {
                        const risk = scenario.riskLevel || 'N/A';
                        const color = risk === 'Low' ? 'text-green-700' : risk === 'Medium' ? 'text-amber-700' : 'text-red-700';
                        return (
                          <td key={idx} className={`text-center p-4 ${color}`}>
                            {risk} ({(scenario.riskScore || 0).toFixed(0)}/10)
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-green-50">
                      <td className="p-4 font-semibold text-gray-700">Implementation Cost</td>
                      {Object.values(SCENARIOS).map((scenario, idx) => (
                        <td key={idx} className="text-center p-4 text-green-900">
                          {formatCurrency(scenario.implementation?.costMillions || 0, { millions: true })}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-green-50">
                      <td className="p-4 font-semibold text-gray-700">Vendor Coordination</td>
                      {Object.values(SCENARIOS).map((scenario, idx) => (
                        <td key={idx} className="text-center p-4 text-green-900">
                          {scenario.vendors?.length || 0} vendors
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-blue-50 border-b border-blue-200">
                      <td className="p-4 font-semibold text-blue-900">Surgeons to Train</td>
                      {Object.values(SCENARIOS).map((scenario, idx) => (
                        <td key={idx} className="text-center p-4 text-blue-900 text-sm">
                          {Math.round(totalSurgeons * (1 - scenario.adoptionRate))} surgeons
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-amber-50">
                      <td className="p-4 font-semibold text-amber-900">ROI (5-Year NPV / Cost)</td>
                      {Object.values(SCENARIOS).map((scenario, idx) => {
                        const npvInMillions = (scenario.npv5Year || 0) / 1000000;
                        const roi = scenario.implementation?.costMillions > 0
                          ? (npvInMillions / scenario.implementation.costMillions).toFixed(1)
                          : 'N/A';
                        return (
                          <td key={idx} className="text-center p-4 text-amber-900 text-sm font-bold">
                            {roi}x
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Implementation Phases */}
              <div className="mb-8">
                <h3 className="font-bold text-green-900 mb-4 text-lg">Typical Implementation Phases</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                    <div className="font-bold text-green-900 mb-2">Phase 1: Planning</div>
                    <ul className="text-xs text-green-800 space-y-1">
                      <li>• Contract negotiation</li>
                      <li>• Stakeholder alignment</li>
                      <li>• Timeline development</li>
                      <li>• Resource allocation</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                    <div className="font-bold text-blue-900 mb-2">Phase 2: Training</div>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Surgeon education</li>
                      <li>• OR staff training</li>
                      <li>• Equipment familiarization</li>
                      <li>• Process updates</li>
                    </ul>
                  </div>
                  <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded">
                    <div className="font-bold text-amber-900 mb-2">Phase 3: Rollout</div>
                    <ul className="text-xs text-amber-800 space-y-1">
                      <li>• Phased implementation</li>
                      <li>• Inventory transition</li>
                      <li>• Real-time support</li>
                      <li>• Issue resolution</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded">
                    <div className="font-bold text-purple-900 mb-2">Phase 4: Optimization</div>
                    <ul className="text-xs text-purple-800 space-y-1">
                      <li>• Performance tracking</li>
                      <li>• Feedback integration</li>
                      <li>• Process refinement</li>
                      <li>• Savings validation</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Operational Insights */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded">
                  <h3 className="font-bold text-green-900 mb-3">Operational Considerations</h3>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li>• Timeline varies based on vendor count and surgeon adoption rates</li>
                    <li>• Higher complexity requires more dedicated project management resources</li>
                    <li>• Risk mitigation through phased rollout and strong communication</li>
                    <li>• Success depends on coordination across Finance, Clinical, and Operations</li>
                  </ul>
                </div>
                <div className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded">
                  <h3 className="font-bold text-purple-900 mb-3">Mission Alignment</h3>
                  <p className="text-sm text-purple-800 mb-3">
                    Operational efficiency enables our Quintuple Aim:
                  </p>
                  <ul className="space-y-2 text-sm text-purple-800">
                    <li>• Efficient implementation minimizes disruption to patient care</li>
                    <li>• Strong project management reduces provider burden</li>
                    <li>• Successful execution captures financial benefits for mission</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hospitals' && realData?.hospitals && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Building2 className="w-7 h-7" />
                  Hospital & Sherpa Analysis
                </h2>
                <p className="text-gray-600 italic">Leverage peer influence and local expertise for successful vendor transitions</p>
              </div>

              {/* Scenario Selector */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-purple-900 mb-1">Select Target Scenario</h3>
                    <p className="text-sm text-purple-700">
                      See which hospitals align with your target vendor strategy
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {Object.entries(SCENARIOS).map(([id, scenario]) => (
                    <button
                      key={id}
                      onClick={() => setHospitalScenarioFilter(id)}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                        hospitalScenarioFilter === id
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-105'
                          : 'bg-white text-purple-900 border-2 border-purple-300 hover:border-purple-500'
                      }`}
                    >
                      <div className="font-bold">{scenario.name}</div>
                      <div className="text-xs opacity-90 mt-1">
                        {scenario.vendors?.join(' + ') || 'N/A'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Banner */}
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg mb-8">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-blue-900 mb-2">Why Hospital-Level Analysis Matters</h3>
                    <p className="text-blue-800 text-sm mb-3">
                      Surgeons are more likely to adopt new vendors when supported by respected peers at their own hospital.
                      This view helps identify:
                    </p>
                    <ul className="text-blue-800 text-sm space-y-1 ml-4">
                      <li>• <strong>Already aligned</strong>: Hospitals where surgeons primarily use target vendors (green)</li>
                      <li>• <strong>Sherpa candidates</strong>: High-volume surgeons on target vendors who can mentor peers</li>
                      <li>• <strong>Need support</strong>: Hospitals requiring significant vendor transitions (red)</li>
                      <li>• <strong>Change management priorities</strong>: Resource allocation based on alignment</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Hospital Summary Stats */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {(() => {
                  const targetVendors = SCENARIOS[hospitalScenarioFilter]?.vendors || [];
                  const hospitals = Object.values(realData.hospitals || {});

                  // Calculate alignment: % of cases using target vendors
                  const alignedHospitals = hospitals.filter(h => {
                    const targetCases = targetVendors.reduce((sum, vendor) => {
                      return sum + (h.vendors?.[vendor]?.cases || 0);
                    }, 0);
                    const alignmentPct = h.totalCases > 0 ? targetCases / h.totalCases : 0;
                    return alignmentPct >= 0.50;
                  });

                  const partiallyAligned = hospitals.filter(h => {
                    const targetCases = targetVendors.reduce((sum, vendor) => {
                      return sum + (h.vendors?.[vendor]?.cases || 0);
                    }, 0);
                    const alignmentPct = h.totalCases > 0 ? targetCases / h.totalCases : 0;
                    return alignmentPct >= 0.25 && alignmentPct < 0.50;
                  });

                  const needSupport = hospitals.filter(h => {
                    const targetCases = targetVendors.reduce((sum, vendor) => {
                      return sum + (h.vendors?.[vendor]?.cases || 0);
                    }, 0);
                    const alignmentPct = h.totalCases > 0 ? targetCases / h.totalCases : 0;
                    return alignmentPct < 0.25;
                  });

                  return (
                    <>
                      <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4">
                        <div className="text-sm text-slate-600 mb-1">Total Hospitals</div>
                        <div className="text-3xl font-bold text-slate-900">
                          {hospitals.length}
                        </div>
                      </div>
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                        <div className="text-sm text-green-700 mb-1">Already Aligned</div>
                        <div className="text-3xl font-bold text-green-900">
                          {alignedHospitals.length}
                        </div>
                        <div className="text-xs text-green-600 mt-1">&ge;50% target vendors</div>
                      </div>
                      <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                        <div className="text-sm text-amber-700 mb-1">Partially Aligned</div>
                        <div className="text-3xl font-bold text-amber-900">
                          {partiallyAligned.length}
                        </div>
                        <div className="text-xs text-amber-600 mt-1">25-49% target vendors</div>
                      </div>
                      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                        <div className="text-sm text-red-700 mb-1">Need Support</div>
                        <div className="text-3xl font-bold text-red-900">
                          {needSupport.length}
                        </div>
                        <div className="text-xs text-red-600 mt-1">&lt;25% target vendors</div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Vendor Loyalty Heat Map */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Hospital Alignment with {SCENARIOS[hospitalScenarioFilter]?.name}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Hospitals sorted by alignment (low to high) with target vendors: {SCENARIOS[hospitalScenarioFilter]?.vendors?.join(' + ')}.
                  Red rows = need most support, Green rows = already aligned. Target vendors highlighted in blue.
                </p>
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-slate-100 border-b-2 border-slate-300 z-10">
                      <tr>
                        <th className="text-left p-3 font-bold text-slate-900">Hospital</th>
                        <th className="text-left p-3 font-bold text-slate-900">Region</th>
                        <th className="text-center p-3 font-bold text-slate-900">Cases</th>
                        <th className="text-center p-3 font-bold text-slate-900">Surgeons</th>
                        <th className="text-center p-3 font-bold text-slate-900">Scenario Alignment</th>
                        <th className="text-left p-3 font-bold text-slate-900">Primary Vendor</th>
                        <th className="text-left p-3 font-bold text-slate-900">Vendor Mix</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(realData.hospitals || {})
                        .sort((a, b) => {
                          const targetVendors = SCENARIOS[hospitalScenarioFilter]?.vendors || [];
                          const aAlignment = targetVendors.reduce((sum, vendor) => sum + (a[1].vendors?.[vendor]?.cases || 0), 0) / (a[1].totalCases || 1);
                          const bAlignment = targetVendors.reduce((sum, vendor) => sum + (b[1].vendors?.[vendor]?.cases || 0), 0) / (b[1].totalCases || 1);
                          return aAlignment - bAlignment;
                        })
                        .map(([hospitalName, hospital], idx) => {
                          const targetVendors = SCENARIOS[hospitalScenarioFilter]?.vendors || [];
                          const targetCases = targetVendors.reduce((sum, vendor) => {
                            return sum + (hospital.vendors?.[vendor]?.cases || 0);
                          }, 0);
                          const alignmentPct = hospital.totalCases > 0 ? (targetCases / hospital.totalCases) * 100 : 0;

                          // Color-code by alignment with scenario
                          const bgColor = alignmentPct >= 50
                            ? 'bg-green-50'
                            : alignmentPct >= 25
                            ? 'bg-amber-50'
                            : 'bg-red-50';
                          const alignmentColor = alignmentPct >= 50
                            ? 'text-green-900 bg-green-100 border-green-300'
                            : alignmentPct >= 25
                            ? 'text-amber-900 bg-amber-100 border-amber-300'
                            : 'text-red-900 bg-red-100 border-red-300';

                          const vendorCount = Object.keys(hospital.vendors || {}).length;
                          const topVendors = Object.entries(hospital.vendors || {})
                            .sort((a, b) => b[1].cases - a[1].cases)
                            .slice(0, 3);

                          return (
                            <tr key={idx} className={`border-b border-gray-200 hover:bg-slate-100 ${bgColor}`}>
                              <td className="p-3 text-sm font-medium text-gray-900">{hospitalName}</td>
                              <td className="p-3 text-sm text-gray-700">
                                <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold">
                                  {hospital.region}
                                </span>
                              </td>
                              <td className="p-3 text-center text-sm text-gray-900">{hospital.totalCases}</td>
                              <td className="p-3 text-center text-sm text-gray-900">{hospital.surgeonCount}</td>
                              <td className="p-3 text-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${alignmentColor}`}>
                                  {alignmentPct.toFixed(0)}%
                                </span>
                              </td>
                              <td className="p-3 text-sm font-semibold text-purple-900">{hospital.primaryVendor}</td>
                              <td className="p-3 text-xs text-gray-600">
                                <div className="space-y-1.5">
                                  {topVendors.map(([vendor, data], i) => {
                                    const isTargetVendor = targetVendors.includes(vendor);
                                    const vendorPct = hospital.totalCases > 0 ? (data.cases / hospital.totalCases * 100).toFixed(0) : 0;
                                    return (
                                      <div key={i} className="flex items-center gap-2">
                                        <span
                                          className={`px-2 py-0.5 rounded text-xs font-semibold min-w-[120px] ${
                                            isTargetVendor
                                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                              : i === 0
                                              ? 'bg-purple-100 text-purple-900'
                                              : 'bg-gray-100 text-gray-700'
                                          }`}
                                        >
                                          {vendor}
                                        </span>
                                        <div className="flex-1 flex items-center gap-1">
                                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
                                            <div
                                              className={`h-2 rounded-full ${isTargetVendor ? 'bg-blue-600' : i === 0 ? 'bg-purple-600' : 'bg-gray-400'}`}
                                              style={{ width: `${vendorPct}%` }}
                                            ></div>
                                          </div>
                                          <span className="text-xs font-bold text-gray-900 min-w-[45px]">
                                            {data.cases} ({vendorPct}%)
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {vendorCount > 3 && (
                                    <div className="text-xs text-gray-500 italic mt-1">
                                      +{vendorCount - 3} more vendors
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Insights */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded">
                  <h3 className="font-bold text-green-900 mb-3">High Concentration Sites (Quick Wins)</h3>
                  <p className="text-sm text-green-800 mb-3">
                    Hospitals with &ge;75% concentration already have strong vendor loyalty. These sites are easier to transition
                    when their primary vendor aligns with your target scenario.
                  </p>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Minimal training required for majority of surgeons</li>
                    <li>• Existing peer support structures in place</li>
                    <li>• Lower change management investment needed</li>
                  </ul>
                </div>
                <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded">
                  <h3 className="font-bold text-red-900 mb-3">Low Concentration Sites (Need Support)</h3>
                  <p className="text-sm text-red-800 mb-3">
                    Hospitals with &lt;50% concentration have fragmented vendor usage. These sites need more intensive
                    change management support and clear peer champions.
                  </p>
                  <ul className="text-sm text-red-800 space-y-1">
                    <li>• Allocate dedicated implementation resources</li>
                    <li>• Identify local clinical champions early</li>
                    <li>• Plan phased rollout with strong communication</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'components' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Component Analysis</h2>
              <p className="text-gray-600">Coming soon: Component pricing grouped by procedure type with multi-pillar impact</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamDecisionDashboard;
