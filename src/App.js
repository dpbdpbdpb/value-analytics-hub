import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './views/LandingPage';
import ExecutiveDashboard from './views/ExecutiveDashboard';
import SurgeonTool from './views/SurgeonTool';
import TeamDecisionDashboard from './views/TeamDecisionDashboard';
import PortfolioOverview from './views/PortfolioOverview';
import ServiceLineView from './views/ServiceLineView';
import ProductLineView from './views/ProductLineView';
import InitiativeDetail from './views/InitiativeDetail';
import AdminDataUpload from './views/AdminDataUpload';
import './App.css';

function App() {
  return (
    <Router basename="/value-analytics-hub">
      <Routes>
        {/* Portfolio Overview - Default home page */}
        <Route path="/" element={<PortfolioOverview />} />

        {/* New Hierarchy: Service Line → Product Line → Decision Canvas */}
        <Route path="/service-line/:serviceLineId" element={<ServiceLineView />} />
        <Route path="/product-line/:serviceLineId/:productLineId" element={<ProductLineView />} />

        {/* Initiative Detail - Legacy */}
        <Route path="/initiative/:initiativeId" element={<InitiativeDetail />} />

        {/* Legacy landing page for persona selection */}
        <Route path="/select-view" element={<LandingPage />} />

        {/* Team Decision Dashboard with specialty */}
        <Route path="/team-decision/:specialty" element={<TeamDecisionDashboard />} />

        {/* Executive Dashboard Routes */}
        <Route path="/executive/:specialty" element={<ExecutiveDashboard />} />

        {/* Surgeon Tool Routes */}
        <Route path="/surgeon/:specialty" element={<SurgeonTool />} />

        {/* Coming Soon Routes (legacy - sports, trauma, spine still pending) */}
        <Route path="/executive/sports" element={<ComingSoon specialty="Sports Medicine" />} />
        <Route path="/executive/trauma" element={<ComingSoon specialty="Trauma" />} />
        <Route path="/executive/spine" element={<ComingSoon specialty="Spine" />} />

        <Route path="/surgeon/sports" element={<ComingSoon specialty="Sports Medicine" />} />
        <Route path="/surgeon/trauma" element={<ComingSoon specialty="Trauma" />} />
        <Route path="/surgeon/spine" element={<ComingSoon specialty="Spine" />} />

        {/* Admin routes */}
        <Route path="/admin/data-upload" element={<AdminDataUpload />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// Coming Soon Component
const ComingSoon = ({ specialty }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-2xl bg-white rounded-2xl shadow-xl p-12 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full mx-auto mb-6 flex items-center justify-center">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {specialty} Analytics
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Coming Soon - Q2 2025
        </p>
        <p className="text-gray-600 mb-8">
          We're building comprehensive value analytics for this specialty.
          The platform will include the same 7-scenario framework, surgeon-level analytics,
          and strategic decision support currently available for Hip & Knee.
        </p>
        <a
          href="/value-analytics-hub"
          className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-lg hover:shadow-lg transition-all"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default App;
