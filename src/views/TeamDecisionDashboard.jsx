import React, { useState, useEffect } from 'react';
import { TrendingUp, Stethoscope, Shield, DollarSign, Users, Package, AlertCircle, Eye, Heart, Target, Star, Activity, ChevronRight, MapPin, Lightbulb, FileCheck, Building2 } from 'lucide-react';
import NavigationHeader from '../components/shared/NavigationHeader';

const TeamDecisionDashboard = () => {
  const [realData, setRealData] = useState(null);
  const [strategyData, setStrategyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('scenarios');
  const [selectedScenario, setSelectedScenario] = useState('C');

  // Load data
  useEffect(() => {
    // Load orthopedic data
    const jsonPath = `${process.env.PUBLIC_URL}/orthopedic-data.json`;
    fetch(jsonPath)
      .then(response => response.json())
      .then(data => {
        setRealData(data);
      })
      .catch(err => {
        console.error('Error loading orthopedic data:', err);
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
  }, []);

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
        className={`rounded-xl border-2 p-5 cursor-pointer transition-all ${
          isSelected
            ? 'border-blue-500 bg-blue-50 shadow-xl'
            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {scenario.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
          </div>
          {isSelected && (
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          )}
        </div>

        {/* Quintuple Aim North Star */}
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-300" />
              <h4 className="font-bold text-base">Quintuple Aim</h4>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-90">Mission Alignment</div>
              <div className="text-2xl font-bold">{(scenario.quintupleMissionScore || 0).toFixed(0)}/100</div>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-3 text-xs">
            <div className="text-center">
              <div className="mb-1">👤</div>
              <div className="font-semibold">Patient Exp</div>
              <div className="opacity-90">{scenario.quintupleScores?.patientExperience || 'N/A'}</div>
            </div>
            <div className="text-center">
              <div className="mb-1">🏥</div>
              <div className="font-semibold">Pop Health</div>
              <div className="opacity-90">{scenario.quintupleScores?.populationHealth || 'N/A'}</div>
            </div>
            <div className="text-center">
              <div className="mb-1">💰</div>
              <div className="font-semibold">Cost</div>
              <div className="opacity-90">{scenario.quintupleScores?.costReduction || 'N/A'}</div>
            </div>
            <div className="text-center">
              <div className="mb-1">⚕️</div>
              <div className="font-semibold">Provider</div>
              <div className="opacity-90">{scenario.quintupleScores?.providerExperience || 'N/A'}</div>
            </div>
            <div className="text-center">
              <div className="mb-1">⚖️</div>
              <div className="font-semibold">Equity</div>
              <div className="opacity-90">{scenario.quintupleScores?.healthEquity || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Three Pillar Grid */}
        <div className="mb-4 text-center text-sm text-gray-600">
          <span className="font-semibold">How each pillar serves the Quintuple Aim:</span>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-5">
          {/* Finance Pillar */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-amber-600" />
              <h4 className="font-bold text-amber-900">Finance</h4>
            </div>
            <div className="text-xs text-amber-700 mb-3 italic">Funding the mission</div>
            <div className="space-y-2 text-sm">
              <div>
                <div className="text-xs text-amber-700">Projected Annual Savings</div>
                <div className="text-xl font-bold text-amber-900">
                  ${((scenario.annualSavings || 0) / 1000000).toFixed(1)}M
                </div>
              </div>
              <div>
                <div className="text-xs text-amber-700">Savings %</div>
                <div className="font-semibold text-amber-900">{(scenario.savingsPercent || 0).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-xs text-amber-700">Projected 5-Year NPV</div>
                <div className="font-semibold text-amber-900">${(scenario.npv5Year || 0).toFixed(1)}M</div>
              </div>
              <div>
                <div className="text-xs text-amber-700">Projected Implementation Cost</div>
                <div className="font-semibold text-amber-900">
                  ${(scenario.implementation?.costMillions || 0).toFixed(1)}M
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Pillar */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-blue-900">Clinical</h4>
            </div>
            <div className="text-xs text-blue-700 mb-3 italic">Delivering excellent care</div>
            <div className="space-y-2 text-sm">
              <div>
                <div className="text-xs text-blue-700">Vendor Switching Impact</div>
                <div className="text-xl font-bold text-blue-900">
                  {Math.round(totalSurgeons * (1 - (scenario.adoptionRate || 0)))} surgeons
                </div>
                <div className="text-xs text-blue-600 mt-0.5">
                  {(100 - (scenario.adoptionRate || 0) * 100).toFixed(0)}% of total surgeons affected
                </div>
                <div className="text-xs text-blue-500 mt-1 italic">
                  Surgeons who must switch from their preferred vendor
                </div>
              </div>
              <div>
                <div className="text-xs text-blue-700">Vendor Count</div>
                <div className="font-semibold text-blue-900">
                  {scenario.vendors ? scenario.vendors.length : 0} vendors
                </div>
              </div>
              <div>
                <div className="text-xs text-blue-700">Mission Score</div>
                <div className="font-semibold text-blue-900">
                  {(scenario.quintupleMissionScore || 0).toFixed(0)}/100
                </div>
              </div>
              <div className="text-xs text-blue-700 mt-2">
                {(100 - scenario.adoptionRate * 100) <= 15 ? '✓ Minimal disruption' : (100 - scenario.adoptionRate * 100) <= 30 ? '⚠ Moderate disruption' : '⚠ Significant disruption'}
              </div>
            </div>
          </div>

          {/* Operations Pillar */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-green-600" />
              <h4 className="font-bold text-green-900">Operations</h4>
            </div>
            <div className="text-xs text-green-700 mb-3 italic">Executing efficiently</div>
            <div className="space-y-2 text-sm">
              <div>
                <div className="text-xs text-green-700">Complexity</div>
                <div className="text-xl font-bold text-green-900">
                  {scenario.implementation?.complexity || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-xs text-green-700">Timeline</div>
                <div className="font-semibold text-green-900">
                  {scenario.implementation?.timeline || 0} months
                </div>
              </div>
              <div>
                <div className="text-xs text-green-700">Risk Level</div>
                <div className="font-semibold text-green-900">
                  {scenario.riskLevel || 'N/A'} ({(scenario.riskScore || 0).toFixed(0)}/10)
                </div>
              </div>
              <div className="text-xs text-green-700 mt-2">
                {scenario.implementation?.complexity === 'Low' ? '✓ Easy to implement' : '⚠ Requires planning'}
              </div>
            </div>
          </div>
        </div>

        {/* Tradeoffs by Pillar */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {/* Finance Tradeoffs */}
          <div className="bg-amber-50 border-l-4 border-amber-600 p-3 rounded">
            <div className="flex items-start gap-2">
              <DollarSign className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-amber-900 text-xs mb-1">Finance Tradeoffs</div>
                <div className="text-xs text-amber-800">
                  {scenario.annualSavings === 0
                    ? 'No savings - maintains current spend levels'
                    : scenario.savingsPercent >= 18
                    ? `Strong ROI: $${((scenario.annualSavings || 0) / 1000000).toFixed(1)}M annually with ${((scenario.npv5Year || 0) / (scenario.implementation?.costMillions || 1)).toFixed(1)}x payback`
                    : scenario.savingsPercent >= 10
                    ? `Moderate savings of $${((scenario.annualSavings || 0) / 1000000).toFixed(1)}M offset by $${(scenario.implementation?.costMillions || 0).toFixed(1)}M implementation cost`
                    : `Limited financial benefit ($${((scenario.annualSavings || 0) / 1000000).toFixed(1)}M) may not justify change`}
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Tradeoffs */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded">
            <div className="flex items-start gap-2">
              <Stethoscope className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-blue-900 text-xs mb-1">Clinical Tradeoffs</div>
                <div className="text-xs text-blue-800">
                  {(100 - scenario.adoptionRate * 100) === 0
                    ? 'Zero disruption - all surgeons continue with current vendors'
                    : (100 - scenario.adoptionRate * 100) <= 15
                    ? `Minimal impact: ${Math.round(totalSurgeons * (1 - scenario.adoptionRate))} surgeons switch (${(100 - scenario.adoptionRate * 100).toFixed(0)}%)`
                    : (100 - scenario.adoptionRate * 100) <= 30
                    ? `Moderate disruption: ${Math.round(totalSurgeons * (1 - scenario.adoptionRate))} surgeons must adopt new vendors (${(100 - scenario.adoptionRate * 100).toFixed(0)}%)`
                    : `Significant change: ${Math.round(totalSurgeons * (1 - scenario.adoptionRate))} surgeons affected (${(100 - scenario.adoptionRate * 100).toFixed(0)}%) - requires strong engagement`}
                </div>
              </div>
            </div>
          </div>

          {/* Operations Tradeoffs */}
          <div className="bg-green-50 border-l-4 border-green-600 p-3 rounded">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-green-900 text-xs mb-1">Operations Tradeoffs</div>
                <div className="text-xs text-green-800">
                  {scenario.implementation?.complexity === 'Low'
                    ? `Simple ${scenario.implementation?.timeline || 0}-month rollout with ${scenario.riskLevel} risk`
                    : scenario.implementation?.complexity === 'Medium'
                    ? `${scenario.implementation?.timeline || 0}-month implementation requires coordination across ${scenario.vendors?.length || 0} vendors`
                    : `Complex ${scenario.implementation?.timeline || 0}-month project with ${scenario.riskLevel} risk - needs dedicated resources`}
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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Integrated Decision Dashboard
                </h1>
                <p className="text-gray-600 text-lg">
                  Multi-perspective analysis guided by the Quintuple Aim
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

              {/* Scenario Cards */}
              <div className="grid grid-cols-3 gap-8 mt-6">
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
                          ${((scenario.annualSavings || 0) / 1000000).toFixed(1)}M
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
                          ${(scenario.npv5Year || 0).toFixed(1)}M
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-amber-50">
                      <td className="p-4 font-semibold text-gray-700">Implementation Cost</td>
                      {Object.values(SCENARIOS).map((scenario, idx) => (
                        <td key={idx} className="text-center p-4 text-amber-900">
                          ${(scenario.implementation?.costMillions || 0).toFixed(1)}M
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-amber-50">
                      <td className="p-4 font-semibold text-gray-700">Payback Multiple</td>
                      {Object.values(SCENARIOS).map((scenario, idx) => {
                        const payback = scenario.implementation?.costMillions > 0
                          ? (scenario.npv5Year / scenario.implementation.costMillions).toFixed(1)
                          : 'N/A';
                        return (
                          <td key={idx} className="text-center p-4 text-amber-900">
                            {payback}x
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="bg-blue-50 border-b border-blue-200">
                      <td className="p-4 font-semibold text-blue-900">Clinical Impact</td>
                      {Object.values(SCENARIOS).map((scenario, idx) => (
                        <td key={idx} className="text-center p-4 text-blue-900 text-sm">
                          {Math.round(totalSurgeons * (1 - scenario.adoptionRate))} surgeons affected
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

              {/* Key Insights */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-amber-50 border-l-4 border-amber-600 p-6 rounded">
                  <h3 className="font-bold text-amber-900 mb-3">Financial Highlights</h3>
                  <ul className="space-y-2 text-sm text-amber-800">
                    <li>• Potential savings range from $0 (Status Quo) to ${(Math.max(...Object.values(SCENARIOS).map(s => s.annualSavings || 0)) / 1000000).toFixed(1)}M annually</li>
                    <li>• 5-year NPV varies from ${Math.min(...Object.values(SCENARIOS).map(s => s.npv5Year || 0)).toFixed(1)}M to ${Math.max(...Object.values(SCENARIOS).map(s => s.npv5Year || 0)).toFixed(1)}M</li>
                    <li>• Implementation costs range from ${Math.min(...Object.values(SCENARIOS).map(s => s.implementation?.costMillions || 0)).toFixed(1)}M to ${Math.max(...Object.values(SCENARIOS).map(s => s.implementation?.costMillions || 0)).toFixed(1)}M</li>
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
                          ${((scenario.annualSavings || 0) / 1000000).toFixed(1)}M
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
                          ${(scenario.implementation?.costMillions || 0).toFixed(1)}M
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
                        const roi = scenario.implementation?.costMillions > 0
                          ? (scenario.npv5Year / scenario.implementation.costMillions).toFixed(1)
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

          {activeTab === 'hospitals' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Building2 className="w-7 h-7" />
                  Hospital & Sherpa Analysis
                </h2>
                <p className="text-gray-600 italic">Leverage peer influence and local expertise for successful vendor transitions</p>
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
                      <li>• <strong>Vendor cohorts</strong>: Hospitals where most surgeons already use the target vendor</li>
                      <li>• <strong>Sherpas</strong>: High-volume, cost-efficient surgeons who can mentor peers</li>
                      <li>• <strong>Peer influence opportunities</strong>: Pairing surgeons with hospital-based mentors</li>
                      <li>• <strong>Change management priorities</strong>: Hospitals needing more support vs. easier transitions</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Coming Soon Message */}
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-2 border-slate-200 rounded-xl p-12 text-center">
                <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-700 mb-3">Hospital Data Coming Soon</h3>
                <p className="text-gray-600 mb-4">
                  Hospital-level aggregation and sherpa identification will be available once your data includes hospital assignments for each surgeon.
                </p>
                <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto text-left">
                  <h4 className="font-bold text-slate-900 mb-3">What We'll Show Here:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-semibold text-blue-900 mb-2">By Hospital:</div>
                      <ul className="text-gray-700 space-y-1">
                        <li>• Vendor concentration patterns</li>
                        <li>• Surgeon cohorts by vendor</li>
                        <li>• Change management readiness</li>
                        <li>• Multi-hospital surgeon tracking</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold text-green-900 mb-2">Sherpa Analysis:</div>
                      <ul className="text-gray-700 space-y-1">
                        <li>• High-volume + efficient surgeons</li>
                        <li>• Peer mentoring opportunities</li>
                        <li>• Hospital-based training leads</li>
                        <li>• Vendor adoption champions</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Use the <strong>ORTHOPEDIC_DATA_STANDARDIZATION_PROMPT.md</strong> file to prepare your data with hospital assignments and sherpa flags.
                </p>
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
