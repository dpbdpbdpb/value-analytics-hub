import React, { useState, useEffect } from 'react';
import { TrendingUp, Stethoscope, Shield, DollarSign, Users, Package, AlertCircle, Eye, Heart, Target } from 'lucide-react';
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
              Scenario {scenarioId}: {scenario.shortName}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
          </div>
          {isSelected && (
            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          )}
        </div>

        {/* Three Pillar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Finance Pillar */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-amber-600" />
              <h4 className="font-bold text-amber-900">Finance</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <div className="text-xs text-amber-700">Annual Savings</div>
                <div className="text-xl font-bold text-amber-900">
                  ${scenario.annualSavings?.toFixed(1) || 0}M
                </div>
              </div>
              <div>
                <div className="text-xs text-amber-700">Savings %</div>
                <div className="font-semibold text-amber-900">{scenario.savingsPercent || 0}%</div>
              </div>
              <div>
                <div className="text-xs text-amber-700">5-Year NPV</div>
                <div className="font-semibold text-amber-900">${scenario.npv5Year?.toFixed(1) || 0}M</div>
              </div>
              <div>
                <div className="text-xs text-amber-700">Implementation Cost</div>
                <div className="font-semibold text-amber-900">
                  ${scenario.implementation?.costMillions || 0}M
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Pillar */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-blue-900">Clinical</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <div className="text-xs text-blue-700">Surgeon Adoption</div>
                <div className="text-xl font-bold text-blue-900">{scenario.adoptionRate || 0}%</div>
              </div>
              <div>
                <div className="text-xs text-blue-700">Vendor Count</div>
                <div className="font-semibold text-blue-900">
                  {scenario.vendorSplit ? Object.keys(scenario.vendorSplit).length : 0} vendors
                </div>
              </div>
              <div>
                <div className="text-xs text-blue-700">Mission Score</div>
                <div className="font-semibold text-blue-900">
                  {scenario.quintupleMissionScore || 0}/100
                </div>
              </div>
              <div className="text-xs text-blue-700 mt-2">
                {scenario.adoptionRate >= 85 ? '✓ High surgeon buy-in' : '⚠ Some surgeon changes needed'}
              </div>
            </div>
          </div>

          {/* Operations Pillar */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-green-600" />
              <h4 className="font-bold text-green-900">Operations</h4>
            </div>
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
                  {scenario.riskLevel || 'N/A'} ({scenario.riskScore || 0}/10)
                </div>
              </div>
              <div className="text-xs text-green-700 mt-2">
                {scenario.implementation?.complexity === 'Low' ? '✓ Easy to implement' : '⚠ Requires planning'}
              </div>
            </div>
          </div>
        </div>

        {/* Tradeoff Summary */}
        <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded">
          <div className="flex items-start gap-2">
            <Target className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-purple-900 text-sm mb-1">Key Tradeoff</div>
              <div className="text-sm text-purple-800">
                {scenario.savingsPercent >= 18 && scenario.adoptionRate >= 75
                  ? 'Strong financial case with good clinical buy-in - balanced option'
                  : scenario.savingsPercent >= 20
                  ? `High savings ($${scenario.annualSavings?.toFixed(1)}M) but requires ${100 - scenario.adoptionRate}% of surgeons to adapt`
                  : scenario.adoptionRate >= 85
                  ? `High surgeon satisfaction but lower savings ($${scenario.annualSavings?.toFixed(1)}M annually)`
                  : 'Moderate savings with moderate adoption - baseline option'}
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
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  🤝 Team Decision Dashboard
                </h1>
                <p className="text-gray-600 text-lg">
                  Collaborative view showing Finance, Clinical, and Operations perspectives together
                </p>
                <div className="flex items-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2 text-amber-700">
                    <DollarSign className="w-5 h-5" />
                    <span className="font-semibold">Finance Impact</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-700">
                    <Stethoscope className="w-5 h-5" />
                    <span className="font-semibold">Clinical Impact</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-700">
                    <Shield className="w-5 h-5" />
                    <span className="font-semibold">Operations Impact</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Total Cases</div>
                <div className="text-3xl font-bold text-purple-600">
                  {realData ? (realData.metadata?.totalCases || 0).toLocaleString() : '0'}
                </div>
                <div className="text-sm text-gray-600 mt-1">procedures analyzed</div>
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
