import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Target, BarChart3, Users, DollarSign, Settings, Search, CheckCircle, FileSignature, Wrench, TrendingUp, RotateCcw } from 'lucide-react';
import NavigationHeader from '../components/shared/NavigationHeader';

const formatContractDate = (value) => {
  if (!value) return 'TBD';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const ProductLineView = () => {
  const navigate = useNavigate();
  const { serviceLineId, productLineId } = useParams();
  const [orthoData, setOrthoData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sourcing Lifecycle Workflow Stages - dynamically loaded from data
  const getWorkflowStages = () => {
    const tracking = orthoData?.workflowTracking || orthoData?.workflow;
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
        id: 'contract-execution',
        name: 'Contract Execution',
        icon: FileSignature,
        description: 'Execute contracts and onboard vendors',
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
        id: 'monitoring',
        name: 'Contract Management & Performance Monitoring',
        icon: TrendingUp,
        description: 'Ongoing vendor management and performance tracking (custom KPIs by product line)',
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

  const cycleMetadata = {
    currentCycle: orthoData?.workflowTracking?.cycleMetadata?.currentCycle || 1,
    contractYear: orthoData?.workflowTracking?.cycleMetadata?.contractYear || 2,
    contractStartDate: orthoData?.workflowTracking?.cycleMetadata?.contractStartDate || '2024-01-01',
    contractLength: orthoData?.workflowTracking?.cycleMetadata?.contractLength || 3
  };

  const contractEndDate = React.useMemo(() => {
    const start = new Date(cycleMetadata.contractStartDate);
    if (Number.isNaN(start.getTime())) return cycleMetadata.contractStartDate;
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + (cycleMetadata.contractLength || 1));
    return end.toISOString().split('T')[0];
  }, [cycleMetadata.contractStartDate, cycleMetadata.contractLength]);

  const formattedContractStart = formatContractDate(cycleMetadata.contractStartDate);
  const formattedContractEnd = formatContractDate(contractEndDate);

  const [showHistory, setShowHistory] = useState(false);

  const positionedStages = React.useMemo(() => {
    if (!workflowStages || workflowStages.length === 0) return [];

    const count = workflowStages.length;
    const activeIndex = workflowStages.findIndex(s => s.status === 'active');
    const startIndex = activeIndex >= 0 ? activeIndex : 0;

    // Linear horizontal layout - stages flow left to right
    return workflowStages.map((stage, index) => ({
      stage,
      index
    }));
  }, [workflowStages]);

  // Load orthopedic data based on product line
  useEffect(() => {
    const dataFile = productLineId === 'shoulder' ? 'shoulder-data.json' : 'hip-knee-data.json';
    const jsonPath = `${process.env.PUBLIC_URL}/data/${dataFile}`;
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
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>
      <NavigationHeader role="portfolio" persona="portfolio" />

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb / Back */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(`/service-line/${serviceLineId}`)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orthopedic Product Lines
            </button>
            <button
              onClick={() => navigate('/admin/data-upload')}
              className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm font-medium"
              title="Update data"
            >
              <Settings className="w-4 h-4" />
              Update Data
            </button>
          </div>

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
                <div className="text-sm text-gray-600">Annual Surgical Supply Spend</div>
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

            {/* Cycle Metadata Banner */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200 gap-4">
              <div>
                <div className="text-sm text-gray-600">Contract Cycle</div>
                <div className="text-2xl font-bold text-blue-900">Cycle {cycleMetadata.currentCycle}</div>
                <div className="text-xs text-gray-600">Year {cycleMetadata.contractYear} of {cycleMetadata.contractLength}</div>
              </div>
              <div className="text-left md:text-right">
                <div className="text-sm text-gray-600">Contract Period</div>
                <div className="text-lg font-bold text-gray-900">{formattedContractStart} - {formattedContractEnd}</div>
              </div>
            </div>

            {/* Cycle History Toggle */}
            <div className="flex items-center justify-end gap-4 mb-4">
              <button
                onClick={() => setShowHistory(s => !s)}
                className="text-xs px-3 py-1 bg-white border rounded text-gray-700 hover:bg-gray-50"
              >
                {showHistory ? 'Hide Cycle History' : 'Show Cycle History'}
              </button>
            </div>

            {/* Previous Cycles History */}
            {showHistory && (
              <div className="mb-4 bg-gray-50 border border-gray-200 rounded p-3 text-sm">
                <div className="font-semibold text-gray-800 mb-2">Previous Cycles</div>
                {orthoData?.workflowTracking?.previousCycles?.length ? (
                  <div className="grid grid-cols-1 gap-2">
                    {orthoData.workflowTracking.previousCycles.map((c, i) => (
                      <div key={i} className="p-2 bg-white rounded border">
                        <div className="flex justify-between text-xs text-gray-700">
                          <div>Cycle {c.cycleNumber}</div>
                          <div>{c.startDate} → {c.endDate}</div>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{c.summary || 'No summary available'}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-600">No previous cycles recorded for this product line.</div>
                )}
              </div>
            )}
            {/* Horizontal Linear Workflow */}
            <div className="hidden md:flex items-start justify-center gap-2 py-8">
              {positionedStages.map(({ stage, index }) => {
                const IconComponent = stage.icon;
                const isActive = stage.status === 'active';
                const isCompleted = stage.status === 'completed';
                const isLast = index === workflowStages.length - 1;

                return (
                  <React.Fragment key={stage.id}>
                    {/* Stage */}
                    <div className="flex flex-col items-center gap-3" style={{ width: '156px' }}>
                      {/* Icon Circle - Fixed size for perfect alignment */}
                      <button
                        onClick={() => navigate(`/service-line/${serviceLineId}/product-line/${productLineId}/stage/${stage.id}`)}
                        className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all shadow-md hover:scale-110 cursor-pointer ${
                          isCompleted
                            ? 'bg-green-500 border-green-600 shadow-green-200 hover:shadow-green-300'
                            : isActive
                            ? 'bg-blue-500 border-blue-600 ring-4 ring-blue-200 animate-pulse shadow-blue-300 hover:shadow-blue-400'
                            : 'bg-gray-300 border-gray-400 shadow-gray-200 hover:shadow-gray-300'
                        }`}
                      >
                        <IconComponent className={`w-7 h-7 ${isCompleted || isActive ? 'text-white' : 'text-gray-600'}`} />
                      </button>

                      {/* Label - Fixed width and height for uniformity */}
                      <div className={`w-full h-[140px] p-3 rounded-lg shadow-md border-2 flex flex-col justify-between overflow-hidden ${
                        isActive ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
                      }`}>
                        <div className="overflow-hidden">
                          <div className={`font-bold text-xs text-center leading-tight mb-2 ${
                            isCompleted ? 'text-green-900' : isActive ? 'text-blue-900' : 'text-gray-700'
                          }`} style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>{stage.name}</div>
                          <div className="text-xs text-gray-600 text-center leading-tight" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>{stage.description}</div>
                        </div>
                        <div className="flex justify-center mt-auto flex-shrink-0">
                          <div className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            isCompleted
                              ? 'bg-green-100 text-green-800'
                              : isActive
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {isCompleted ? '✓ Complete' : isActive ? '⚡ Active' : '⏳ Pending'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Arrow connector - Properly aligned at circle level */}
                    {!isLast && (
                      <div className="flex items-start pt-6">
                        <ChevronRight className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Mobile fallback */}
            <div className="md:hidden space-y-5">
              {workflowStages.map((stage) => {
                const IconComponent = stage.icon;
                const isActive = stage.status === 'active';
                const isCompleted = stage.status === 'completed';
                const isUpcoming = stage.status === 'upcoming';
                return (
                  <div key={stage.id} className={`p-4 rounded-xl border ${
                    isActive ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-900">{stage.name}</div>
                        <div className="text-xs text-gray-600">{stage.description}</div>
                      </div>
                    </div>
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      isCompleted
                        ? 'bg-green-100 text-green-800'
                        : isActive
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isCompleted ? '✓ Complete' : isActive ? '⚡ In Progress' : '⏳ Upcoming'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Demo Mode & Cycle Notes */}
            <div className="mt-6 space-y-3">
              <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-lg">🎯</div>
                  <div className="font-bold text-amber-900">Demo Mode Active</div>
                </div>
                <p className="text-sm text-amber-800">
                  All workflow stages are clickable for demonstration purposes. In production, only completed stages and the current active stage would be accessible. Future stages remain locked until the current stage is completed and timestamped.
                </p>
              </div>

              <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-2 border-slate-300 rounded-lg p-5 flex items-start gap-4">
                <RotateCcw className="w-8 h-8 text-blue-600 flex-shrink-0 mt-0.5 animate-spin-slow" />
                <div>
                  <div className="font-bold text-slate-900 mb-2 text-lg">Continuous Improvement Cycle</div>
                  <p className="text-sm text-slate-700 mb-2">
                    After Contract Renewal Review, the cycle returns to Sourcing Strategy Review. This iterative process ensures
                    continuous optimization of vendor relationships, clinical outcomes, and financial performance.
                  </p>
                  <p className="text-xs text-slate-600 italic">
                    Note: Monitoring KPIs and strategic priorities may vary between cycles and product lines based on organizational needs.
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
