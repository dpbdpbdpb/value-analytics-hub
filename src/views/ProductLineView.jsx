import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Target, BarChart3, Users, Stethoscope, DollarSign, Settings, Search, CheckCircle, Wrench, TrendingUp, RotateCcw, Calendar } from 'lucide-react';
import NavigationHeader from '../components/shared/NavigationHeader';

const ProductLineView = () => {
  const navigate = useNavigate();
  const { serviceLineId, productLineId } = useParams();
  const [orthoData, setOrthoData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Determine specialty name based on productLineId
  const specialtyName = productLineId === 'shoulder' ? 'shoulder' : 'hipknee';

  // Sourcing Lifecycle Workflow Stages - dynamically loaded from data
  const getWorkflowStages = () => {
    const tracking = orthoData?.workflowTracking;
    if (!tracking) {
      // Fallback if no workflow data
      return [];
    }

    const stageDefinitions = [
      {
        id: 'sourcing-review',
        name: 'Sourcing Strategy Review',
        icon: Search,
        description: 'Analyze market, vendors, and internal data',
        relevantCanvases: ['team-decision', 'financial-view', 'clinical-view']
      },
      {
        id: 'decision',
        name: 'Decision',
        icon: CheckCircle,
        description: 'Select vendor strategy and negotiate contracts',
        relevantCanvases: ['team-decision', 'financial-view']
      },
      {
        id: 'implementation',
        name: 'Implementation',
        icon: Wrench,
        description: 'Roll out new vendor contracts and train surgeons',
        relevantCanvases: ['operational-view', 'surgeon-analytics']
      },
      {
        id: 'lookback',
        name: 'Lookback Analysis',
        icon: TrendingUp,
        description: 'Track actual vs. predicted performance',
        relevantCanvases: ['team-decision', 'clinical-view', 'financial-view']
      },
      {
        id: 'renewal',
        name: 'Contract Renewal Review',
        icon: RotateCcw,
        description: 'Evaluate performance and prepare for next cycle',
        relevantCanvases: ['team-decision', 'financial-view']
      }
    ];

    return stageDefinitions.map(def => {
      const stageData = tracking.stages[def.id] || {};
      return {
        ...def,
        status: stageData.status || 'upcoming',
        startDate: stageData.startDate,
        completionDate: stageData.completionDate,
        decisionDate: stageData.decisionDate,
        expectedCompletion: stageData.expectedCompletion,
        scheduledDate: stageData.scheduledDate,
        contractExpirationDate: stageData.contractExpirationDate,
        percentComplete: stageData.percentComplete,
        milestones: stageData.milestones,
        notes: stageData.notes
      };
    });
  };

  const workflowStages = React.useMemo(() => getWorkflowStages(), [orthoData]);

  // Load orthopedic data based on product line
  useEffect(() => {
    const dataFile = productLineId === 'shoulder' ? 'shoulder-data.json' : 'orthopedic-data.json';
    const jsonPath = `${process.env.PUBLIC_URL}/${dataFile}`;
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
  }, [productLineId]);

  // Decision Canvas configuration - dynamic based on product line
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
      route: `/team-decision/${specialtyName}`,
      features: [
        'Unified tri-pillar view',
        '5-scenario value framework',
        'Real-time tradeoff analysis',
        'Collaborative decision support'
      ],
      metrics: {
        scenarios: 5,
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
      route: `/executive/${specialtyName}?persona=clinical`,
      features: [
        'Clinical outcomes analysis',
        'Quality metrics',
        'Evidence-based recommendations',
        'Surgeon-level insights'
      ],
      metrics: {
        surgeons: 205,
        procedures: '27,623/yr',
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
      route: `/executive/${specialtyName}?persona=financial`,
      features: [
        'Cost per case analysis',
        'Value opportunity modeling',
        '$8M savings scenarios',
        'Vendor consolidation impact'
      ],
      metrics: {
        opportunity: '$8M',
        scenarios: 5,
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
      route: `/executive/${specialtyName}?persona=operational`,
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
      route: `/surgeon/${specialtyName}`,
      features: [
        'Surgeon scorecards',
        'Preference card analysis',
        'Cost per surgeon',
        'Volume and outcomes'
      ],
      metrics: {
        surgeons: 205,
        avgCost: '$1,523',
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
                  {productLineId === 'shoulder' ? 'Shoulder Replacement' : 'Hip & Knee Replacement'}
                </h1>
                <p className="text-gray-600 text-lg">
                  {productLineId === 'shoulder'
                    ? 'Decision canvases for total shoulder and reverse shoulder value analytics'
                    : 'Decision canvases for total joint replacement value analytics'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Annual Implant Spend</div>
                <div className="text-3xl font-bold text-gray-900">
                  {orthoData ? `$${(orthoData.metadata.totalSpend / 1000000).toFixed(1)}M` : '-'}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Savings Opportunity:
                  <span className="text-green-600 font-bold ml-1">
                    ${orthoData ? (Math.max(...Object.values(orthoData.scenarios || {}).map(s => s.annualSavings || 0)) / 1000000).toFixed(1) : '-'}M
                  </span>
                </div>
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
                  {orthoData ? (orthoData.metadata.totalSurgeons || 205) : '-'}
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
                  <div className="text-sm text-gray-600">Avg Implant Cost/Case</div>
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

          {/* Sourcing Lifecycle Workflow */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Sourcing Lifecycle Workflow</h2>
                <p className="text-gray-600 text-sm">Track progress through the strategic sourcing cycle</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-600">Current Stage</div>
                <div className="text-lg font-bold text-blue-600">
                  {workflowStages.find(s => s.status === 'active')?.name || 'Not Started'}
                </div>
              </div>
            </div>

            {/* Workflow Timeline */}
            <div className="relative">
              {/* Connection Line */}
              <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200" style={{ width: 'calc(100% - 60px)', left: '30px' }}></div>

              {/* Stages */}
              <div className="relative grid grid-cols-5 gap-4">
                {workflowStages.map((stage, idx) => {
                  const IconComponent = stage.icon;
                  const isActive = stage.status === 'active';
                  const isCompleted = stage.status === 'completed';
                  const isUpcoming = stage.status === 'upcoming';

                  return (
                    <div key={stage.id} className="flex flex-col items-center">
                      {/* Icon Circle */}
                      <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center mb-3 border-4 transition-all ${
                        isCompleted
                          ? 'bg-green-500 border-green-600'
                          : isActive
                          ? 'bg-blue-500 border-blue-600 ring-4 ring-blue-200 animate-pulse'
                          : 'bg-gray-300 border-gray-400'
                      }`}>
                        <IconComponent className={`w-7 h-7 ${isCompleted || isActive ? 'text-white' : 'text-gray-600'}`} />
                      </div>

                      {/* Stage Info */}
                      <div className={`text-center ${isActive ? 'bg-blue-50 rounded-lg p-3 border-2 border-blue-200' : ''}`}>
                        <div className={`font-bold text-sm mb-1 ${
                          isCompleted ? 'text-green-900' : isActive ? 'text-blue-900' : 'text-gray-600'
                        }`}>
                          {stage.name}
                        </div>
                        <div className="text-xs text-gray-600 mb-2">{stage.description}</div>

                        {/* Status Badge */}
                        <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                          isCompleted
                            ? 'bg-green-100 text-green-800'
                            : isActive
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isCompleted ? '✓ Complete' : isActive ? '⚡ In Progress' : '⏳ Upcoming'}
                        </div>

                        {/* Dates */}
                        {stage.decisionDate && (
                          <div className="text-xs text-gray-500 mt-2">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {stage.decisionDate}
                          </div>
                        )}
                        {stage.expectedCompletion && isActive && (
                          <div className="text-xs text-blue-600 mt-2 font-semibold">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            Due: {stage.expectedCompletion}
                          </div>
                        )}
                        {stage.scheduledDate && isUpcoming && (
                          <div className="text-xs text-gray-500 mt-2">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            Scheduled: {stage.scheduledDate}
                          </div>
                        )}
                        {stage.contractExpirationDate && (
                          <div className="text-xs text-gray-500 mt-2">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            Expires: {stage.contractExpirationDate}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cycle Note */}
            <div className="mt-6 bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start gap-3">
              <RotateCcw className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900 mb-1">Continuous Improvement Cycle</div>
                <p className="text-sm text-slate-700">
                  After Contract Renewal Review, the cycle returns to Sourcing Strategy Review. This iterative process ensures
                  continuous optimization of vendor relationships, clinical outcomes, and financial performance.
                </p>
              </div>
            </div>
          </div>

          {/* Active Canvases for Current Stage */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-600 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <Target className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">
                  Active Canvases for {workflowStages.find(s => s.status === 'active')?.name || 'Current'} Stage
                </h3>
                <p className="text-blue-800 text-sm mb-3">
                  Based on your current workflow stage, the following decision canvases are most relevant:
                </p>
                <div className="flex flex-wrap gap-2">
                  {workflowStages.find(s => s.status === 'active')?.relevantCanvases.map((canvasId) => {
                    const canvas = decisionCanvases.find(c => c.id === canvasId);
                    return canvas ? (
                      <div key={canvasId} className="bg-white px-3 py-2 rounded-lg border-2 border-blue-200 text-sm font-semibold text-blue-900">
                        {canvas.name}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
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
          <div className="grid grid-cols-5 gap-4">
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
