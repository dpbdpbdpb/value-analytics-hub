import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, DollarSign, Target, Users, Clock, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import NavigationHeader from '../components/shared/NavigationHeader';

const InitiativeDetail = () => {
  const [strategyData, setStrategyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { initiativeId } = useParams();
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

  const initiative = strategyData?.strategicInitiatives?.find(i => i.id === initiativeId);

  // Map program epics to decision canvases
  const programEpicDecisions = {
    'A1': { name: 'Orthopedic - Hip & Knee', route: '/team-decision/hipknee', status: 'implementing', completion: 98 },
    'A2': { name: 'General Surgery', route: null, status: 'planning', completion: 10 },
    'A3': { name: 'Neuroscience', route: null, status: 'on-hold', completion: 5 },
    'A10': { name: 'Cardiology', route: null, status: 'analyzing', completion: 15 },
    'A11': { name: 'Women & Children', route: null, status: 'analyzing', completion: 12 },
    'B1': { name: 'Orthopedic Service Line', route: null, status: 'implementing', completion: 85 },
    'B2': { name: 'Cardiovascular Service Line', route: null, status: 'implementing', completion: 75 },
    'B3': { name: 'Neuroscience Service Line', route: null, status: 'planning', completion: 40 },
    'B4': { name: 'Women & Children Service Line', route: null, status: 'planning', completion: 35 },
    'C1': { name: 'SAFe Portfolio Kanban', route: null, status: 'implementing', completion: 95 },
    'D1': { name: 'Enterprise Data Platform', route: null, status: 'implementing', completion: 90 },
    'D9': { name: 'Clinical AI Models', route: null, status: 'implementing', completion: 80 },
    'D10': { name: 'Predictive Analytics', route: null, status: 'implementing', completion: 85 },
    'D11': { name: 'AI Sourcing Intelligence', route: null, status: 'analyzing', completion: 15 },
    'VAT-B1': { name: 'Orthopedic VAT', route: null, status: 'implementing', completion: 70 },
    'VAT-B2': { name: 'Cardiovascular VAT', route: null, status: 'implementing', completion: 45 },
    'VAT-B3': { name: 'Neuroscience VAT', route: null, status: 'planning', completion: 30 },
    'WC1': { name: 'Women & Children VAT', route: null, status: 'planning', completion: 25 },
    'A5': { name: 'Product Eval Framework', route: null, status: 'complete', completion: 100 },
    'A6': { name: 'ROI Validation Tool', route: null, status: 'complete', completion: 100 },
    'A7': { name: 'Surgeon Engagement', route: null, status: 'implementing', completion: 90 },
    'A8': { name: 'Clinical Evidence Review', route: null, status: 'implementing', completion: 85 },
    'A9': { name: 'Vendor Negotiation', route: null, status: 'implementing', completion: 95 },
    'ROB1': { name: 'Budget Cycle Integration', route: null, status: 'implementing', completion: 80 },
    'WC2': { name: 'Multi-site Coordination', route: null, status: 'implementing', completion: 75 }
  };

  const getStatusColor = (status) => {
    const colors = {
      analyzing: 'bg-purple-100 text-purple-800',
      planning: 'bg-blue-100 text-blue-800',
      implementing: 'bg-green-100 text-green-800',
      complete: 'bg-gray-100 text-gray-800',
      'on-hold': 'bg-amber-100 text-amber-800'
    };
    return colors[status] || colors.planning;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading initiative details...</p>
        </div>
      </div>
    );
  }

  if (!initiative) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Initiative Not Found</h1>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700"
          >
            Return to Portfolio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavigationHeader role="initiative" persona="portfolio" />

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Portfolio Overview
            </button>
          </div>

          {/* Initiative Header */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold text-gray-900">{initiative.name}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(initiative.status)}`}>
                    {initiative.status}
                  </span>
                </div>
                <p className="text-gray-600 text-lg mb-4">{initiative.description}</p>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{initiative.timeframe}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{initiative.owner}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{initiative.financialImpact}</span>
                  </div>
                </div>
              </div>

              <div className="text-right ml-8">
                <div className="text-sm text-gray-600 mb-2">Overall Progress</div>
                <div className="text-5xl font-bold text-purple-600 mb-3">{initiative.completion}%</div>
                <div className="w-48 bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-purple-600 h-3 rounded-full transition-all"
                    style={{ width: `${initiative.completion}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Quintuple Aim Alignment */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-gray-900">Quintuple Aim Alignment</h3>
              </div>
              <div className="grid grid-cols-5 gap-4">
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">👤</div>
                  <div className="text-2xl font-bold text-purple-900 mb-1">
                    {initiative.quintupleAimAlignment?.patientExperience}
                  </div>
                  <div className="text-xs text-gray-600">Patient Experience</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">🏥</div>
                  <div className="text-2xl font-bold text-purple-900 mb-1">
                    {initiative.quintupleAimAlignment?.populationHealth}
                  </div>
                  <div className="text-xs text-gray-600">Population Health</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="text-2xl font-bold text-purple-900 mb-1">
                    {initiative.quintupleAimAlignment?.costReduction}
                  </div>
                  <div className="text-xs text-gray-600">Cost Reduction</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">⚕️</div>
                  <div className="text-2xl font-bold text-purple-900 mb-1">
                    {initiative.quintupleAimAlignment?.providerExperience}
                  </div>
                  <div className="text-xs text-gray-600">Provider Experience</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">⚖️</div>
                  <div className="text-2xl font-bold text-purple-900 mb-1">
                    {initiative.quintupleAimAlignment?.healthEquity}
                  </div>
                  <div className="text-xs text-gray-600">Health Equity</div>
                </div>
              </div>
            </div>
          </div>

          {/* Program Epics / Decision Canvases */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Program Epics & Decision Canvases</h2>
            <p className="text-gray-600 mb-6">
              Click on any program epic to access its decision canvas with scenario analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initiative.programEpics?.map(epicId => {
              const epic = programEpicDecisions[epicId];
              if (!epic) return null;

              return (
                <div
                  key={epicId}
                  onClick={() => {
                    if (epic.route) {
                      navigate(epic.route);
                    }
                  }}
                  className={`bg-white rounded-lg shadow p-6 border-2 transition-all ${
                    epic.route
                      ? 'border-transparent hover:border-purple-300 cursor-pointer hover:shadow-xl'
                      : 'border-gray-200 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-purple-600">{epicId}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(epic.status)}`}>
                          {epic.status}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{epic.name}</h3>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-bold text-purple-600">{epic.completion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${epic.completion}%` }}
                      ></div>
                    </div>
                  </div>

                  {epic.route ? (
                    <div className="flex items-center justify-between text-purple-600 font-semibold text-sm pt-3 border-t">
                      <span>View Decision Canvas</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm pt-3 border-t">
                      Decision canvas coming soon
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">Navigation Guide</h3>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• <strong>Purple cards</strong> = Decision canvas available (click to explore scenarios)</li>
                  <li>• <strong>Gray cards</strong> = Decision canvas coming soon</li>
                  <li>• Each decision canvas includes scenario comparison, assumptions, and deep dives</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitiativeDetail;
