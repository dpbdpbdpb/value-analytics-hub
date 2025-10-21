import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Heart, User, RefreshCw, TrendingUp, Shield, Stethoscope } from 'lucide-react';

const NavigationHeader = ({ role, specialty, specialtyName, persona }) => {
  const navigate = useNavigate();

  // Map personas to display names
  const personaDisplay = {
    clinical: 'Clinical',
    financial: 'Finance',
    operational: 'Operations',
    team: 'Integrated Decision Dashboard'
  };

  // Map personas to icons
  const personaIcon = {
    clinical: Stethoscope,
    financial: TrendingUp,
    operational: Shield,
    team: User
  };

  // Legacy role display for backwards compatibility
  const roleDisplay = {
    executive: 'Executive Dashboard',
    surgeon: 'Surgeon View',
    admin: 'Administrator'
  };

  const roleIcon = {
    executive: RefreshCw,
    surgeon: User,
    admin: RefreshCw
  };

  // Determine display based on persona or role
  const displayName = persona ? personaDisplay[persona] : roleDisplay[role];
  const IconComponent = persona ? personaIcon[persona] : roleIcon[role];
  const RoleIcon = IconComponent || User;

  return (
    <div className="bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Platform Branding */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">
                CommonSpirit Orthopedic Value Analytics
              </h1>
              <div className="flex items-center gap-2 text-purple-100 text-sm">
                <RoleIcon className="w-3 h-3" />
                <span>{displayName}</span>
                {(specialtyName || specialty) && (
                  <>
                    <span className="text-purple-300">•</span>
                    <span>{specialtyName || specialty?.toUpperCase()}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Navigation Actions */}
          <div className="flex items-center gap-3">
            {/* Switch View Button - Conditional based on current view */}
            {persona === 'team' ? (
              <button
                onClick={() => navigate('/select-view')}
                className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-all backdrop-blur-sm font-medium border border-white border-opacity-20"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Switch to Individual View</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-all backdrop-blur-sm font-medium border border-white border-opacity-20"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Switch to Team View</span>
              </button>
            )}

            {/* Home Button */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-white text-purple-700 rounded-lg hover:bg-purple-50 transition-all font-bold shadow-lg"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationHeader;
