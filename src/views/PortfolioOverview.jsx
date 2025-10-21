import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ChevronRight, TrendingUp, DollarSign, Target, AlertCircle, CheckCircle, Clock, Users } from 'lucide-react';
import NavigationHeader from '../components/shared/NavigationHeader';

const PortfolioOverview = () => {
  const [strategyData, setStrategyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load strategic framework data
  useEffect(() => {
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

  const getHealthColor = (health) => {
    const colors = {
      excellent: 'bg-green-100 text-green-800 border-green-300',
      good: 'bg-blue-100 text-blue-800 border-blue-300',
      caution: 'bg-amber-100 text-amber-800 border-amber-300',
      concern: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[health] || colors.good;
  };

  const getStatusColor = (status) => {
    const colors = {
      analyzing: 'bg-purple-100 text-purple-800',
      planning: 'bg-blue-100 text-blue-800',
      implementing: 'bg-green-100 text-green-800',
      complete: 'bg-gray-100 text-gray-800',
      onhold: 'bg-amber-100 text-amber-800'
    };
    return colors[status] || colors.planning;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading portfolio overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavigationHeader role="portfolio" persona="portfolio" />

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Strategic Portfolio Overview
                </h1>
                <p className="text-gray-600 text-lg">
                  Enterprise value transformation guided by the Quintuple Aim
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Portfolio Value</div>
                <div className="text-3xl font-bold text-purple-600">$45M+</div>
                <div className="text-sm text-gray-600 mt-1">total opportunity</div>
              </div>
            </div>

            {/* Quintuple Aim North Star */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 text-yellow-300" />
                  <div>
                    <h2 className="text-2xl font-bold">Quintuple Aim - Our North Star</h2>
                    <p className="text-purple-100 text-sm mt-1">
                      All strategic initiatives aligned to CommonSpirit's mission framework
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-3xl mb-2">👤</div>
                  <div className="font-bold">Patient Experience</div>
                  <div className="text-xs text-purple-200 mt-1">Quality care delivery</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🏥</div>
                  <div className="font-bold">Population Health</div>
                  <div className="text-xs text-purple-200 mt-1">Community outcomes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="font-bold">Cost Reduction</div>
                  <div className="text-xs text-purple-200 mt-1">Sustainable value</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">⚕️</div>
                  <div className="font-bold">Provider Experience</div>
                  <div className="text-xs text-purple-200 mt-1">Team well-being</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">⚖️</div>
                  <div className="font-bold">Health Equity</div>
                  <div className="text-xs text-purple-200 mt-1">Access for all</div>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Summary Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-6 h-6 text-purple-600" />
                <h3 className="font-bold text-gray-900">Strategic Initiatives</h3>
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {strategyData?.strategicInitiatives?.length || 0}
              </div>
              <div className="text-sm text-gray-600">active portfolio epics</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h3 className="font-bold text-gray-900">In Progress</h3>
              </div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {strategyData?.strategicInitiatives?.filter(i => i.status === 'implementing').length || 0}
              </div>
              <div className="text-sm text-gray-600">implementing now</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-6 h-6 text-amber-600" />
                <h3 className="font-bold text-gray-900">Financial Impact</h3>
              </div>
              <div className="text-3xl font-bold text-amber-600 mb-1">$45M</div>
              <div className="text-sm text-gray-600">savings opportunity</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-blue-600" />
                <h3 className="font-bold text-gray-900">Program Epics</h3>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-1">25+</div>
              <div className="text-sm text-gray-600">tactical initiatives</div>
            </div>
          </div>

          {/* Strategic Initiatives Cards */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Strategic Initiatives</h2>
            <p className="text-gray-600 mb-6">
              Click on any initiative to explore program epics and decision canvases
            </p>
          </div>

          <div className="space-y-4">
            {strategyData?.strategicInitiatives?.map((initiative) => (
              <div
                key={initiative.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-300"
                onClick={() => navigate(`/initiative/${initiative.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{initiative.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(initiative.status)}`}>
                        {initiative.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getHealthColor(initiative.health)}`}>
                        {initiative.health}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{initiative.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {initiative.timeframe}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {initiative.owner}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {initiative.financialImpact}
                      </div>
                    </div>
                  </div>

                  <div className="text-right ml-6">
                    <div className="text-sm text-gray-600 mb-1">Progress</div>
                    <div className="text-3xl font-bold text-purple-600 mb-2">{initiative.completion}%</div>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${initiative.completion}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Program Epics Pills */}
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <span className="text-xs font-semibold text-gray-600">Program Epics:</span>
                  {initiative.programEpics?.map(epic => (
                    <span
                      key={epic}
                      className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold"
                    >
                      {epic}
                    </span>
                  ))}
                </div>

                {/* Quintuple Aim Alignment */}
                <div className="border-t pt-4">
                  <div className="text-xs font-semibold text-gray-600 mb-2">Quintuple Aim Alignment</div>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-900">
                        {initiative.quintupleAimAlignment?.patientExperience}
                      </div>
                      <div className="text-xs text-gray-600">Patient</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-900">
                        {initiative.quintupleAimAlignment?.populationHealth}
                      </div>
                      <div className="text-xs text-gray-600">Population</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-900">
                        {initiative.quintupleAimAlignment?.costReduction}
                      </div>
                      <div className="text-xs text-gray-600">Cost</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-900">
                        {initiative.quintupleAimAlignment?.providerExperience}
                      </div>
                      <div className="text-xs text-gray-600">Provider</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-900">
                        {initiative.quintupleAimAlignment?.healthEquity}
                      </div>
                      <div className="text-xs text-gray-600">Equity</div>
                    </div>
                  </div>
                </div>

                {/* Click hint */}
                <div className="flex items-center justify-end gap-2 text-purple-600 font-semibold text-sm mt-4">
                  <span>View Program Epics & Decision Canvases</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">How to Use This Portfolio View</h3>
                <p className="text-blue-800 text-sm mb-2">
                  This is your strategic command center showing all active initiatives aligned to the Quintuple Aim.
                </p>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• <strong>Click any initiative</strong> to drill down into program epics and decision canvases</li>
                  <li>• <strong>Track progress</strong> across all initiatives with completion % and health status</li>
                  <li>• <strong>View alignment</strong> to Quintuple Aim dimensions for each initiative</li>
                  <li>• <strong>Navigate hierarchically</strong> from portfolio → initiative → program epic → decision canvas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioOverview;
