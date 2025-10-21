import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Heart, Activity, Brain, Bone, Stethoscope, TrendingUp, Target, Users } from 'lucide-react';
import NavigationHeader from '../components/shared/NavigationHeader';

const PortfolioOverview = () => {
  const navigate = useNavigate();
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

  // Calculate real metrics from orthopedic data
  const orthopedicMetrics = orthoData ? {
    annualVolume: `${orthoData.metadata.totalCases.toLocaleString()} cases`,
    opportunityValue: `$${(orthoData.metadata.totalSpend / 1000000).toFixed(0)}M`,
    activeDecisions: Object.keys(orthoData.scenarios || {}).length - 1 // Exclude status-quo
  } : {
    annualVolume: 'Loading...',
    opportunityValue: 'Loading...',
    activeDecisions: 0
  };

  // Service lines configuration
  const serviceLines = [
    {
      id: 'orthopedic',
      name: 'Orthopedic',
      icon: Bone,
      color: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-900',
      accentColor: 'text-blue-600',
      description: 'Joint replacement (hip & knee)',
      productLines: ['Hip/Knee'],
      activeDecisions: orthopedicMetrics.activeDecisions,
      annualVolume: orthopedicMetrics.annualVolume,
      opportunityValue: orthopedicMetrics.opportunityValue,
      status: 'active'
    },
    {
      id: 'cardiovascular',
      name: 'Cardiovascular',
      icon: Heart,
      color: 'from-red-600 to-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-900',
      accentColor: 'text-red-600',
      description: 'Cardiac surgery, interventional cardiology, vascular',
      productLines: ['Cardiac Surgery', 'Interventional Cardiology', 'Vascular', 'Electrophysiology'],
      activeDecisions: 0,
      annualVolume: 'TBD',
      opportunityValue: 'TBD',
      status: 'coming-soon'
    },
    {
      id: 'neuroscience',
      name: 'Neuroscience',
      icon: Brain,
      color: 'from-purple-600 to-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-900',
      accentColor: 'text-purple-600',
      description: 'Neurosurgery, stroke, epilepsy, neuro spine',
      productLines: ['Neurosurgery', 'Stroke', 'Epilepsy', 'Neuro Spine'],
      activeDecisions: 0,
      annualVolume: 'TBD',
      opportunityValue: 'TBD',
      status: 'coming-soon'
    },
    {
      id: 'general-surgery',
      name: 'General Surgery',
      icon: Stethoscope,
      color: 'from-teal-600 to-teal-700',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      textColor: 'text-teal-900',
      accentColor: 'text-teal-600',
      description: 'General, bariatric, colorectal, surgical oncology',
      productLines: ['General Surgery', 'Bariatric', 'Colorectal', 'Surgical Oncology'],
      activeDecisions: 0,
      annualVolume: 'TBD',
      opportunityValue: 'TBD',
      status: 'coming-soon'
    }
  ];

  const handleServiceLineClick = (serviceLine) => {
    if (serviceLine.status === 'active') {
      navigate(`/service-line/${serviceLine.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading portfolio data...</p>
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
                  Value Analytics Decision Hub
                </h1>
                <p className="text-gray-600 text-lg">
                  Transparent, data-driven, multidisciplinary decision-making across service lines
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-2">
                  <Target className="w-5 h-5 text-slate-600" />
                  <div className="text-sm text-gray-600">Tri-Pillar Approach</div>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-semibold">Clinical</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-semibold">Financial</span>
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded font-semibold">Operational</span>
                </div>
              </div>
            </div>

            {/* Tri-Pillar Framework */}
            <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-8 h-8 text-white" />
                <div>
                  <h2 className="text-2xl font-bold">Tri-Pillar Decision Framework</h2>
                  <p className="text-slate-100 text-sm mt-1">
                    Clear tradeoffs, shared ownership, measurable outcomes
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-3 grid grid-cols-3 gap-4">
                  <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-3xl mb-2">⚕️</div>
                    <div className="font-bold mb-1">Clinical Excellence</div>
                    <div className="text-xs text-slate-200">Patient outcomes, quality, safety</div>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-3xl mb-2">💰</div>
                    <div className="font-bold mb-1">Financial Stewardship</div>
                    <div className="text-xs text-slate-200">Cost, value, sustainability</div>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-3xl mb-2">⚙️</div>
                    <div className="font-bold mb-1">Operational Excellence</div>
                    <div className="text-xs text-slate-200">Efficiency, workflow, capacity</div>
                  </div>
                </div>
                <div className="col-span-2 bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-sm font-bold mb-2">Decision Process</div>
                  <div className="space-y-1 text-xs text-slate-200">
                    <div>1. Define assumptions & analyze scenarios</div>
                    <div>2. Make tradeoffs explicit & transparent</div>
                    <div>3. All three pillars own the decision</div>
                    <div>4. Track metrics & conduct lookbacks</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Lines Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Lines</h2>
            <p className="text-gray-600 mb-6">
              Select a service line to view product lines and access decision canvases
            </p>
          </div>

          {/* Service Line Cards */}
          <div className="grid grid-cols-2 gap-6">
            {serviceLines.map((serviceLine) => {
              const IconComponent = serviceLine.icon;
              const isActive = serviceLine.status === 'active';

              return (
                <div
                  key={serviceLine.id}
                  className={`bg-white rounded-xl shadow-lg p-5 transition-all border-2 ${
                    isActive
                      ? `${serviceLine.borderColor} hover:shadow-xl cursor-pointer hover:scale-[1.01]`
                      : 'border-gray-200 opacity-75'
                  }`}
                  onClick={() => handleServiceLineClick(serviceLine)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${serviceLine.color} flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`text-2xl font-bold ${serviceLine.textColor}`}>
                            {serviceLine.name}
                          </h3>
                          {!isActive && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                              Coming Q2 2025
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3 text-sm">{serviceLine.description}</p>

                        {/* Product Lines */}
                        <div className="mb-3">
                          <div className="text-xs font-semibold text-gray-600 mb-2">Product Lines:</div>
                          <div className="flex flex-wrap gap-2">
                            {serviceLine.productLines.map((pl) => (
                              <span
                                key={pl}
                                className={`px-2 py-1 ${serviceLine.bgColor} ${serviceLine.accentColor} rounded text-xs font-medium`}
                              >
                                {pl}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="text-xs text-gray-600 mb-1">Active Decisions</div>
                            <div className={`text-2xl font-bold ${serviceLine.accentColor}`}>
                              {serviceLine.activeDecisions}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600 mb-1">Annual Volume</div>
                            <div className="text-lg font-semibold text-gray-900">
                              {serviceLine.annualVolume}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600 mb-1">Opportunity Value</div>
                            <div className="text-lg font-semibold text-gray-900">
                              {serviceLine.opportunityValue}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    {isActive && (
                      <div className={`flex items-center ${serviceLine.accentColor} ml-4`}>
                        <ChevronRight className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
            <div className="flex items-start gap-3">
              <Activity className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">How This Decision Hub Works</h3>
                <div className="text-blue-800 text-sm space-y-2">
                  <p className="mb-2">
                    This platform supports transparent, data-driven decision-making with clear accountability:
                  </p>
                  <ul className="space-y-1 ml-4">
                    <li>• <strong>Service Lines</strong> → High-level clinical service areas</li>
                    <li>• <strong>Product Lines</strong> → Specific procedure/product categories within each service</li>
                    <li>• <strong>Decision Canvases</strong> → Tri-pillar analyses with scenario modeling and clear tradeoffs</li>
                    <li>• <strong>Lookbacks</strong> → Performance tracking against assumptions to drive continuous improvement</li>
                  </ul>
                  <p className="mt-3 italic">
                    Every decision is owned by all three pillars, with metrics to validate assumptions and drive learning.
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

export default PortfolioOverview;
