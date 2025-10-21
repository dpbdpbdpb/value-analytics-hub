import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Target, BarChart3, Users, Stethoscope, DollarSign, Settings } from 'lucide-react';
import NavigationHeader from '../components/shared/NavigationHeader';

const ProductLineView = () => {
  const navigate = useNavigate();
  const { serviceLineId, productLineId } = useParams();
  const [orthoData, setOrthoData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load orthopedic data
  useEffect(() => {
    const jsonPath = `${process.env.PUBLIC_URL}/orthopedic-data.json`;
    fetch(jsonPath)
      .then(response => response.json())
      .then(data => {
        setOrthoData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading orthopedic data:', err);
        setLoading(false);
      });
  }, []);

  // Decision Canvas configuration for Hip/Knee
  const decisionCanvases = [
    {
      id: 'team-decision',
      name: 'Integrated Decision Dashboard',
      description: 'Tri-pillar team view with all three perspectives integrated in one canvas',
      icon: Users,
      color: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-900',
      accentColor: 'text-blue-600',
      status: 'active',
      route: '/team-decision/hipknee',
      features: [
        'Unified tri-pillar view',
        '7-scenario value framework',
        'Real-time tradeoff analysis',
        'Collaborative decision support'
      ],
      metrics: {
        scenarios: 7,
        dataPoints: '150+',
        lastUpdated: '2025-10-21'
      }
    },
    {
      id: 'clinical-view',
      name: 'Clinical Perspective',
      description: 'Clinical quality, outcomes, and evidence-based analysis',
      icon: Stethoscope,
      color: 'from-green-600 to-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-900',
      accentColor: 'text-green-600',
      status: 'active',
      route: '/executive/hipknee?persona=clinical',
      features: [
        'Clinical outcomes analysis',
        'Quality metrics',
        'Evidence-based recommendations',
        'Surgeon-level insights'
      ],
      metrics: {
        surgeons: 25,
        procedures: '8,500/yr',
        lastUpdated: '2025-10-21'
      }
    },
    {
      id: 'financial-view',
      name: 'Financial Perspective',
      description: 'Cost analysis, value optimization, and financial impact modeling',
      icon: DollarSign,
      color: 'from-amber-600 to-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-900',
      accentColor: 'text-amber-600',
      status: 'active',
      route: '/executive/hipknee?persona=financial',
      features: [
        'Cost per case analysis',
        'Value opportunity modeling',
        '$28M savings scenarios',
        'Vendor consolidation impact'
      ],
      metrics: {
        opportunity: '$28M',
        scenarios: 7,
        lastUpdated: '2025-10-21'
      }
    },
    {
      id: 'operational-view',
      name: 'Operational Perspective',
      description: 'Workflow efficiency, capacity optimization, and operational metrics',
      icon: Settings,
      color: 'from-purple-600 to-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-900',
      accentColor: 'text-purple-600',
      status: 'active',
      route: '/executive/hipknee?persona=operational',
      features: [
        'OR efficiency analysis',
        'Capacity planning',
        'Workflow optimization',
        'Resource utilization'
      ],
      metrics: {
        orTime: '150 min avg',
        utilization: '78%',
        lastUpdated: '2025-10-21'
      }
    },
    {
      id: 'surgeon-tool',
      name: 'Surgeon-Level Analytics',
      description: 'Individual surgeon performance, preferences, and value contribution',
      icon: BarChart3,
      color: 'from-teal-600 to-teal-700',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      textColor: 'text-teal-900',
      accentColor: 'text-teal-600',
      status: 'active',
      route: '/surgeon/hipknee',
      features: [
        'Surgeon scorecards',
        'Preference card analysis',
        'Cost per surgeon',
        'Volume and outcomes'
      ],
      metrics: {
        surgeons: 25,
        avgCost: '$8,450',
        lastUpdated: '2025-10-21'
      }
    }
  ];

  const handleCanvasClick = (canvas) => {
    if (canvas.status === 'active') {
      navigate(canvas.route);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product line data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavigationHeader role="portfolio" persona="portfolio" />

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb / Back */}
          <button
            onClick={() => navigate(`/service-line/${serviceLineId}`)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orthopedic Product Lines
          </button>

          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Hip & Knee Replacement
                </h1>
                <p className="text-gray-600 text-lg">
                  Decision canvases for total joint replacement value analytics
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Value Opportunity</div>
                <div className="text-3xl font-bold text-blue-600">
                  {orthoData ? `$${(Math.max(...Object.values(orthoData.scenarios || {}).map(s => s.annualSavings || 0)) / 1000000).toFixed(0)}M` : '-'}
                </div>
                <div className="text-sm text-gray-600 mt-1">annual savings potential</div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div className="text-sm text-gray-600">Surgeons</div>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {orthoData ? Object.values(orthoData.vendors).reduce((sum, v) => sum + (v.uniqueSurgeons || 0), 0) : '-'}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <div className="text-sm text-gray-600">Annual Volume</div>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {orthoData ? orthoData.metadata.totalCases.toLocaleString() : '-'}
                </div>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                  <div className="text-sm text-gray-600">Avg Cost/Case</div>
                </div>
                <div className="text-2xl font-bold text-amber-900">
                  {orthoData ? `$${(orthoData.metadata.totalSpend / orthoData.metadata.totalCases).toLocaleString(undefined, {maximumFractionDigits: 0})}` : '-'}
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <div className="text-sm text-gray-600">Decision Scenarios</div>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {orthoData ? Object.keys(orthoData.scenarios || {}).length : '-'}
                </div>
              </div>
            </div>

            {/* Tri-Pillar Note */}
            <div className="mt-6 bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-slate-600" />
                <span className="font-bold text-slate-900">Tri-Pillar Decision Framework</span>
              </div>
              <p className="text-sm text-slate-700">
                Each decision canvas provides a unique perspective (Clinical, Financial, Operational) or integrates all three.
                Use these tools to analyze tradeoffs, model scenarios, and make transparent data-driven decisions.
              </p>
            </div>
          </div>

          {/* Decision Canvases Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Decision Canvases</h2>
            <p className="text-gray-600 mb-6">
              Select a decision canvas to analyze Hip & Knee replacement from different perspectives
            </p>
          </div>

          {/* Decision Canvas Cards */}
          <div className="grid grid-cols-3 gap-6">
            {decisionCanvases.map((canvas) => {
              const IconComponent = canvas.icon;
              const isActive = canvas.status === 'active';

              return (
                <div
                  key={canvas.id}
                  className={`bg-white rounded-xl shadow-lg p-5 transition-all border-2 ${
                    isActive
                      ? `${canvas.borderColor} hover:shadow-xl cursor-pointer hover:scale-[1.02]`
                      : 'border-gray-200 opacity-75'
                  }`}
                  onClick={() => handleCanvasClick(canvas)}
                >
                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${canvas.color} flex items-center justify-center`}>
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  {/* Header */}
                  <div className="text-center mb-3">
                    <h3 className={`text-lg font-bold ${canvas.textColor} mb-1`}>
                      {canvas.name}
                    </h3>
                    <p className="text-gray-600 text-xs">{canvas.description}</p>
                  </div>

                  {/* Features */}
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-gray-600 mb-2 text-center">Key Features</div>
                    <div className="flex flex-col gap-1">
                      {canvas.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${canvas.bgColor} ${canvas.accentColor}`}></div>
                          <span className="text-xs text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="border-t pt-3">
                    {Object.entries(canvas.metrics).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className={`font-bold ${canvas.accentColor}`}>{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Arrow */}
                  {isActive && (
                    <div className={`flex items-center justify-center ${canvas.accentColor} mt-4`}>
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
            <div className="flex items-start gap-3">
              <Target className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">How to Use Decision Canvases</h3>
                <div className="text-blue-800 text-sm space-y-2">
                  <p>Each canvas provides different analytical views:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• <strong>Integrated Dashboard</strong> - All three pillars in one view for team decisions</li>
                    <li>• <strong>Individual Perspectives</strong> - Deep dive into Clinical, Financial, or Operational analysis</li>
                    <li>• <strong>Surgeon Analytics</strong> - Individual surgeon performance and preference analysis</li>
                  </ul>
                  <p className="mt-3 italic">
                    All canvases use the same underlying data and 7-scenario framework to ensure consistency across perspectives.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductLineView;
