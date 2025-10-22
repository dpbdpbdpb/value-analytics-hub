import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Heart, User, TrendingUp, Shield, Stethoscope } from 'lucide-react';

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
    executive: User,
    surgeon: User,
    admin: User
  };

  // Determine display based on persona or role
  const displayName = persona ? personaDisplay[persona] : roleDisplay[role];
  const IconComponent = persona ? personaIcon[persona] : roleIcon[role];
  const RoleIcon = IconComponent || User;

  return (
    <div className="bg-gradient-to-r from-slate-600 to-slate-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Platform Branding */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">
                CommonSpirit Value Analytics Hub
              </h1>
              {displayName && (
                <div className="flex items-center gap-2 text-slate-200 text-xs mt-0.5">
                  <span>{displayName}</span>
                  {(specialtyName || specialty) && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span>{specialtyName || specialty?.toUpperCase()}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Navigation Actions */}
          <div className="flex items-center gap-3">
            {/* Home Button */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-bold shadow-lg"
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
