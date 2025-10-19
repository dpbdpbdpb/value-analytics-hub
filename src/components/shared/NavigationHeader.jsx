import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Heart, User, RefreshCw } from 'lucide-react';

const NavigationHeader = ({ role, specialty, specialtyName }) => {
  const navigate = useNavigate();

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

  const RoleIcon = roleIcon[role] || User;

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
                <span>{roleDisplay[role]}</span>
                <span className="text-purple-300">•</span>
                <span>{specialtyName || specialty.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Right: Navigation Actions */}
          <div className="flex items-center gap-3">
            {/* Change View Button */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-all backdrop-blur-sm font-medium border border-white border-opacity-20"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Change View</span>
            </button>

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
