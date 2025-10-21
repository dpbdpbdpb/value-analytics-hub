import React, { useState, useEffect } from 'react';
import { TrendingUp, Stethoscope, Shield, DollarSign, Users, Package, AlertCircle, Eye, Heart, Target, Star, Activity } from 'lucide-react';
import NavigationHeader from '../components/shared/NavigationHeader';

const TeamDecisionDashboard = () => {
  const [realData, setRealData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('scenarios');
  const [selectedScenario, setSelectedScenario] = useState('C');

  // Load data
  useEffect(() => {
    const jsonPath = `${process.env.PUBLIC_URL}/orthopedic-data.json`;
    fetch(jsonPath)
      .then(response => response.json())
      .then(data => {
        setRealData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading data:', err);
        setLoading(false);
      });
  }, []);

  const COLORS = {
    primary: '#BA4896',
    finance: '#F59E0B',
    clinical: '#3B82F6',
    operations: '#10B981'
  };

  // Calculate total surgeons from vendor data
  const totalSurgeons = realData?.vendors
    ? Object.values(realData.vendors).reduce((sum, vendor) => sum + (vendor.uniqueSurgeons || 0), 0)
    : 0;

  // Scenarios data
  const SCENARIOS = realData?.scenarios || {};

  // Three-Pillar Scenario Card Component
  const ThreePillarScenarioCard = ({ scenarioId, scenario, isSelected, onClick }) => {
    if (!scenario) return null;

    return (
      <div
        onClick={onClick}
        className={`rounded-xl border-2 p-6 cursor-pointer transition-all ${
          isSelected
            ? 'border-purple-600 bg-purple-50 shadow-lg'
            : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {scenarioId}: {scenario.shortName}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
          </div>
          {isSelected && (
            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          )}
        </div>

        {/* Quintuple Aim North Star */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-300" />
              <h4 className="font-bold">Quintuple Aim</h4>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-90">Mission Alignment</div>
              <div className="text-2xl font-bold">{(scenario.quintupleMissionScore || 0).toFixed(0)}/100</div>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2 text-xs">
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
        <div className="mb-3 text-center text-sm text-gray-600">
          <span className="font-semibold">How each pillar serves the Quintuple Aim:</span>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
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
                  ${(scenario.annualSavings || 0).toFixed(1)}M
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
                    ? `Strong ROI: $${(scenario.annualSavings || 0).toFixed(1)}M annually with ${((scenario.npv5Year || 0) / (scenario.implementation?.costMillions || 1)).toFixed(1)}x payback`
                    : scenario.savingsPercent >= 10
                    ? `Moderate savings of $${(scenario.annualSavings || 0).toFixed(1)}M offset by $${(scenario.implementation?.costMillions || 0).toFixed(1)}M implementation cost`
                    : `Limited financial benefit ($${(scenario.annualSavings || 0).toFixed(1)}M) may not justify change`}
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
                <div className="text-3xl font-bold text-purple-600">
                  {realData ? (realData.metadata?.totalCases || 0).toLocaleString() : '0'}
                </div>
                <div className="text-sm text-gray-600 mt-1">procedures analyzed</div>
              </div>
            </div>

            {/* Quintuple Aim North Star Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 text-yellow-300" />
                  <div>
                    <h2 className="text-2xl font-bold">Quintuple Aim - Our North Star</h2>
                    <p className="text-purple-100 text-sm mt-1">
                      All decisions evaluated through CommonSpirit's mission framework
                    </p>
                  </div>
                </div>
                <Heart className="w-12 h-12 text-purple-300 opacity-50" />
              </div>
              <div className="grid grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-3xl mb-2">👤</div>
                  <div className="font-bold">Patient</div>
                  <div className="font-bold">Experience</div>
                  <div className="text-xs text-purple-200 mt-1">Quality care delivery</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🏥</div>
                  <div className="font-bold">Population</div>
                  <div className="font-bold">Health</div>
                  <div className="text-xs text-purple-200 mt-1">Community outcomes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="font-bold">Cost</div>
                  <div className="font-bold">Reduction</div>
                  <div className="text-xs text-purple-200 mt-1">Sustainable value</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">⚕️</div>
                  <div className="font-bold">Provider</div>
                  <div className="font-bold">Experience</div>
                  <div className="text-xs text-purple-200 mt-1">Team well-being</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">⚖️</div>
                  <div className="font-bold">Health</div>
                  <div className="font-bold">Equity</div>
                  <div className="text-xs text-purple-200 mt-1">Access for all</div>
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
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md'
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
          )}

          {activeTab === 'finance' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Financial Deep Dive</h2>
              <p className="text-gray-600">Coming soon: Detailed financial analysis with clinical and operational callouts</p>
            </div>
          )}

          {activeTab === 'clinical' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Clinical Deep Dive</h2>
              <p className="text-gray-600">Coming soon: Surgeon preferences and adoption analysis with financial and operational context</p>
            </div>
          )}

          {activeTab === 'operations' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Operations Deep Dive</h2>
              <p className="text-gray-600">Coming soon: Implementation planning with clinical and financial impact indicators</p>
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
