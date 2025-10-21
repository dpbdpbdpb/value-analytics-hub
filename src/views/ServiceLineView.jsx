import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Target, TrendingUp, Clock, Users, CheckCircle } from 'lucide-react';
import NavigationHeader from '../components/shared/NavigationHeader';

const ServiceLineView = () => {
  const navigate = useNavigate();
  const { serviceLineId } = useParams();
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

  // Calculate metrics from real data
  const hipKneeMetrics = orthoData ? {
    annualVolume: `${orthoData.metadata.totalCases.toLocaleString()} cases`,
    opportunityValue: `$${(orthoData.metadata.totalSpend / 1000000).toFixed(0)}M`,
    activeDecisions: Object.keys(orthoData.scenarios || {}).length - 1, // Exclude status-quo
    completedDecisions: 0 // Will track this in future
  } : {
    annualVolume: 'Loading...',
    opportunityValue: 'Loading...',
    activeDecisions: 0,
    completedDecisions: 0
  };

  // Product lines - only Hip/Knee has data currently
  const productLines = [
    {
      id: 'hip-knee',
      name: 'Hip & Knee',
      description: 'Total joint replacement, revision arthroplasty',
      activeDecisions: hipKneeMetrics.activeDecisions,
      completedDecisions: hipKneeMetrics.completedDecisions,
      annualVolume: hipKneeMetrics.annualVolume,
      opportunityValue: hipKneeMetrics.opportunityValue,
      status: 'active',
      decisions: [
        { id: 'vendor-consolidation', name: 'Vendor Consolidation Strategy', status: 'analyzing' }
      ]
    },
    {
      id: 'shoulder',
      name: 'Shoulder',
      description: 'Total shoulder, reverse shoulder arthroplasty',
      activeDecisions: 0,
      completedDecisions: 0,
      annualVolume: 'TBD',
      opportunityValue: 'TBD',
      status: 'coming-soon',
      decisions: []
    },
    {
      id: 'spine',
      name: 'Spine',
      description: 'Spinal fusion, disc replacement, decompression',
      activeDecisions: 0,
      completedDecisions: 0,
      annualVolume: 'TBD',
      opportunityValue: 'TBD',
      status: 'coming-soon',
      decisions: []
    },
    {
      id: 'sports',
      name: 'Sports Medicine',
      description: 'ACL reconstruction, meniscus repair, rotator cuff',
      activeDecisions: 0,
      completedDecisions: 0,
      annualVolume: 'TBD',
      opportunityValue: 'TBD',
      status: 'coming-soon',
      decisions: []
    },
    {
      id: 'trauma',
      name: 'Trauma',
      description: 'Fracture fixation, external fixation',
      activeDecisions: 0,
      completedDecisions: 0,
      annualVolume: 'TBD',
      opportunityValue: 'TBD',
      status: 'coming-soon',
      decisions: []
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      analyzing: 'bg-purple-100 text-purple-800 border-purple-200',
      planning: 'bg-blue-100 text-blue-800 border-blue-200',
      implementing: 'bg-green-100 text-green-800 border-green-200',
      complete: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || colors.planning;
  };

  const handleProductLineClick = (productLine) => {
    if (productLine.status === 'active') {
      navigate(`/product-line/${serviceLineId}/${productLine.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service line data...</p>
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
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Service Lines
          </button>

          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Orthopedic Service Line
                </h1>
                <p className="text-gray-600 text-lg">
                  Product lines and decision canvases for orthopedic value analytics
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Total Opportunity</div>
                <div className="text-3xl font-bold text-blue-600">{hipKneeMetrics.opportunityValue}</div>
                <div className="text-sm text-gray-600 mt-1">Hip & Knee product line</div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <div className="text-sm text-gray-600">Product Lines</div>
                </div>
                <div className="text-2xl font-bold text-blue-900">{productLines.length}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <div className="text-sm text-gray-600">Active Decisions</div>
                </div>
                <div className="text-2xl font-bold text-green-900">{hipKneeMetrics.activeDecisions}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-2xl font-bold text-purple-900">{hipKneeMetrics.completedDecisions}</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-amber-600" />
                  <div className="text-sm text-gray-600">Annual Volume</div>
                </div>
                <div className="text-2xl font-bold text-amber-900">
                  {orthoData ? `${(orthoData.metadata.totalCases / 1000).toFixed(1)}K` : 'Loading...'}
                </div>
              </div>
            </div>
          </div>

          {/* Product Lines Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Lines</h2>
            <p className="text-gray-600 mb-6">
              Select a product line to view active decision canvases and lookbacks
            </p>
          </div>

          {/* Product Line Cards */}
          <div className="grid grid-cols-3 gap-6">
            {productLines.map((productLine) => {
              const isActive = productLine.status === 'active';

              return (
                <div
                  key={productLine.id}
                  className={`bg-white rounded-xl shadow-lg p-5 transition-all border-2 ${
                    isActive
                      ? 'border-blue-200 hover:shadow-xl cursor-pointer hover:scale-[1.02]'
                      : 'border-gray-200 opacity-75'
                  }`}
                  onClick={() => handleProductLineClick(productLine)}
                >
                  {/* Header */}
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-blue-900 mb-1">
                      {productLine.name}
                    </h3>
                    {!isActive && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                        Coming Q2 2025
                      </span>
                    )}
                    <p className="text-gray-600 text-sm mt-2">{productLine.description}</p>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-600 mb-1">Active</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {productLine.activeDecisions}
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-600 mb-1">Complete</div>
                      <div className="text-2xl font-bold text-green-600">
                        {productLine.completedDecisions}
                      </div>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-600 mb-1">Volume</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {productLine.annualVolume}
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-600 mb-1">Value</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {productLine.opportunityValue}
                      </div>
                    </div>
                  </div>

                  {/* Active Decisions Preview */}
                  {productLine.decisions.length > 0 && (
                    <div className="text-center">
                      <div className="text-xs font-semibold text-gray-600 mb-2">
                        Active Canvases
                      </div>
                      <div className="flex flex-col gap-1">
                        {productLine.decisions.map((decision) => (
                          <span
                            key={decision.id}
                            className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(decision.status)}`}
                          >
                            {decision.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Arrow */}
                  {isActive && (
                    <div className="flex items-center justify-center text-blue-600 mt-4">
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
                <h3 className="font-bold text-blue-900 mb-2">Product Line Decision Framework</h3>
                <p className="text-blue-800 text-sm mb-2">
                  Each product line contains multiple decision canvases representing specific purchasing,
                  standardization, or operational decisions.
                </p>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• <strong>Click a product line</strong> to see all decision canvases</li>
                  <li>• <strong>Decision canvases</strong> include tri-pillar analyses and scenario modeling</li>
                  <li>• <strong>Lookbacks</strong> track actual vs. predicted performance for continuous learning</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceLineView;
