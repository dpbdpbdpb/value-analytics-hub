import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Users, Activity, Stethoscope, ArrowRight, TrendingUp, Shield } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);

  const roles = [
    {
      id: 'clinical',
      name: 'Clinical',
      icon: Stethoscope,
      description: 'Surgeon-level analytics, clinical outcomes, value impact, and practice optimization',
      color: '#3B82F6',
      route: 'surgeon' // Maps to surgeon tool for now
    },
    {
      id: 'financial',
      name: 'Finance',
      icon: TrendingUp,
      description: 'System-wide value analytics, cost reduction strategies, and ROI analysis',
      color: '#BA4896',
      route: 'executive' // Maps to executive dashboard
    },
    {
      id: 'operational',
      name: 'Operations',
      icon: Shield,
      description: 'Supply chain optimization, implementation tracking, and operational efficiency',
      color: '#10B981',
      route: 'executive' // Maps to executive dashboard for now
    }
  ];

  const specialties = [
    {
      id: 'hipknee',
      name: 'Hip & Knee',
      icon: Activity,
      description: 'Total joint arthroplasty - value-based optimization',
      vendors: ['Zimmer Biomet', 'Stryker', 'J&J'],
      status: 'active',
      color: '#BA4896'
    },
    {
      id: 'sports',
      name: 'Sports Medicine',
      icon: Heart,
      description: 'Arthroscopic procedures, ligament repair, biologics',
      vendors: ['Arthrex', 'Smith & Nephew', 'ConMed', 'Stryker'],
      status: 'coming-soon',
      color: '#F59E0B'
    },
    {
      id: 'trauma',
      name: 'Trauma',
      icon: Activity,
      description: 'Fracture fixation, plates, screws, intramedullary nails',
      vendors: ['Synthes (J&J)', 'Stryker Trauma', 'Zimmer Biomet'],
      status: 'coming-soon',
      color: '#EF4444'
    },
    {
      id: 'shoulder',
      name: 'Shoulder',
      icon: Users,
      description: 'Anatomic and reverse shoulder arthroplasty',
      vendors: ['Zimmer Biomet', 'Stryker', 'DePuy', 'Wright Medical'],
      status: 'coming-soon',
      color: '#8B5CF6'
    },
    {
      id: 'spine',
      name: 'Spine',
      icon: Activity,
      description: 'Spinal fusion, instrumentation, and biologics',
      vendors: ['Medtronic', 'DePuy Synthes', 'NuVasive', 'Stryker'],
      status: 'coming-soon',
      color: '#14B8A6'
    }
  ];

  const handleContinue = () => {
    if (selectedRole && selectedSpecialty) {
      const specialty = specialties.find(s => s.id === selectedSpecialty);
      const role = roles.find(r => r.id === selectedRole);
      if (specialty.status === 'active' && role) {
        navigate(`/${role.route}/${selectedSpecialty}?persona=${selectedRole}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                CommonSpirit Orthopedic Value Analytics
              </h1>
              <p className="text-gray-600 mt-1">
                Quintuple Aim-aligned strategic value optimization across orthopedic service lines
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Primary Action: Team Decision Dashboard */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How would you like to proceed?</h2>
            <p className="text-gray-600 text-lg">Choose collaborative team view or individual perspective</p>
          </div>

          {/* Team Decision Dashboard - Primary CTA */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/team-decision/hipknee')}
              className="w-full p-8 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-2xl hover:shadow-purple-500/50 hover:scale-[1.02] transition-all border-4 border-purple-400"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-3xl font-bold mb-2">🤝 Team Decision Dashboard</h3>
                    <p className="text-purple-100 text-lg mb-3">
                      Collaborative view showing Finance, Clinical, and Operations perspectives together
                    </p>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        <span>Finance Impact</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-5 h-5" />
                        <span>Clinical Impact</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        <span>Operations Impact</span>
                      </div>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-12 h-12 flex-shrink-0" />
              </div>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 border-t-2 border-gray-300"></div>
            <span className="text-gray-500 font-semibold">OR</span>
            <div className="flex-1 border-t-2 border-gray-300"></div>
          </div>
        </div>

        {/* Secondary Option: Individual Perspectives */}
        <div className="mb-12">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gray-500 text-white rounded-full flex items-center justify-center font-bold">
                ↳
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Individual Perspective</h2>
            </div>
            <p className="text-gray-600 ml-11">For detailed research and preparation (optional)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map(role => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;

              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50 shadow-lg scale-105'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: isSelected ? role.color : '#F3F4F6' }}
                    >
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{role.name}</h3>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="mt-4 flex items-center gap-2 text-purple-600 font-medium">
                      <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      Selected
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Select Specialty (only for individual perspectives) */}
        <div className={`transition-all ${selectedRole ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                selectedRole ? 'bg-gray-600 text-white' : 'bg-gray-300 text-gray-500'
              }`}>
                2
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Select Specialty</h2>
            </div>
            <p className="text-gray-600 ml-11">Choose the orthopedic service line to analyze</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialties.map(specialty => {
              const Icon = specialty.icon;
              const isSelected = selectedSpecialty === specialty.id;
              const isAvailable = specialty.status === 'active';

              return (
                <button
                  key={specialty.id}
                  onClick={() => isAvailable && setSelectedSpecialty(specialty.id)}
                  disabled={!isAvailable}
                  className={`p-6 rounded-xl border-2 transition-all text-left relative ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50 shadow-lg'
                      : isAvailable
                      ? 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                >
                  {!isAvailable && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      Coming Soon
                    </div>
                  )}

                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: isSelected ? specialty.color : '#F3F4F6' }}
                    >
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg mb-1 ${isAvailable ? 'text-gray-900' : 'text-gray-500'}`}>
                        {specialty.name}
                      </h3>
                      <p className={`text-sm ${isAvailable ? 'text-gray-600' : 'text-gray-400'}`}>
                        {specialty.description}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="text-xs text-gray-500 mb-2">Primary Vendors:</div>
                    <div className="flex flex-wrap gap-1">
                      {specialty.vendors.slice(0, 3).map((vendor, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {vendor}
                        </span>
                      ))}
                      {specialty.vendors.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{specialty.vendors.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-4 flex items-center gap-2 text-purple-600 font-medium">
                      <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      Selected
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Continue Button */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedRole || !selectedSpecialty || specialties.find(s => s.id === selectedSpecialty)?.status !== 'active'}
            className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all ${
              selectedRole && selectedSpecialty && specialties.find(s => s.id === selectedSpecialty)?.status === 'active'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:shadow-lg hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue to Analytics
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        {/* Info Footer */}
        <div className="mt-12 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Platform Overview</h3>
              <p className="text-blue-800 text-sm mb-2">
                This platform provides comprehensive value analytics aligned with the Quintuple Aim across all orthopedic service lines.
                Each specialty has 7 standardized scenarios (A-G) analyzing different value optimization strategies.
              </p>
              <p className="text-blue-800 text-sm">
                <strong>Currently Available:</strong> Hip & Knee arthroplasty with full surgeon-level and system-level analytics.
                Additional specialties launching Q2 2025.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
