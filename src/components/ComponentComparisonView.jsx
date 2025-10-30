import React, { useState } from 'react';
import { Package, TrendingDown } from 'lucide-react';

const ComponentComparisonView = ({ surgeon, allSurgeonData }) => {
  const [procedureFilter, setProcedureFilter] = useState('all'); // 'all' | 'hip' | 'knee'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'primary' | 'revision'

  // Classification helpers
  const hipKeywords = ['hip', 'femoral head', 'acetabular', 'stem', 'cup', 'bi polar', 'uni polar'];
  const kneeKeywords = ['knee', 'tibial', 'femoral component', 'patella', 'bearing', 'tray'];

  const isHip = (category) => {
    const cat = category.toLowerCase();
    return hipKeywords.some(k => cat.includes(k)) && !cat.includes('knee');
  };

  const isKnee = (category) => {
    const cat = category.toLowerCase();
    return kneeKeywords.some(k => cat.includes(k));
  };

  const isPrimary = (category) => !category.toLowerCase().includes('revision');
  const isRevision = (category) => category.toLowerCase().includes('revision');

  // Calculate vendor pricing across all surgeons for a component category
  const getVendorPricing = (category) => {
    const vendorData = {};

    allSurgeonData.forEach(s => {
      s.topComponents?.forEach(comp => {
        if (comp.category === category && comp.avgPrice >= 100 && comp.avgPrice <= 15000) {
          if (!vendorData[comp.vendor]) {
            vendorData[comp.vendor] = [];
          }
          vendorData[comp.vendor].push(comp.avgPrice);
        }
      });
    });

    // Calculate median for each vendor (using top 4 synthetic vendors)
    const vendors = ['VENDOR-ALPHA', 'VENDOR-BETA', 'VENDOR-GAMMA', 'VENDOR-DELTA'];
    return vendors
      .filter(v => vendorData[v] && vendorData[v].length > 0)
      .map(vendor => {
        const prices = vendorData[vendor].sort((a, b) => a - b);
        const median = prices[Math.floor(prices.length / 2)];
        return { vendor, medianPrice: median, samples: prices.length };
      })
      .sort((a, b) => a.medianPrice - b.medianPrice);
  };

  // Filter components
  const getFilteredComponents = () => {
    if (!surgeon?.topComponents) return [];

    return surgeon.topComponents
      .filter(c => c.category !== 'UNKNOWN')
      .filter(c => {
        // Procedure filter
        if (procedureFilter === 'hip' && !isHip(c.category)) return false;
        if (procedureFilter === 'knee' && !isKnee(c.category)) return false;
        // Type filter
        if (typeFilter === 'primary' && !isPrimary(c.category)) return false;
        if (typeFilter === 'revision' && !isRevision(c.category)) return false;
        return true;
      })
      .slice(0, 5);
  };

  const components = getFilteredComponents();

  // Check if surgeon has component data
  if (!surgeon?.topComponents || surgeon.topComponents.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Package className="text-purple-600" />
          Component Pricing Comparison
        </h3>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
          <Package className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-gray-900 mb-2">Component Data Not Available</h4>
          <p className="text-gray-600 mb-4">
            Detailed component-level pricing data is not yet available for this surgeon.
          </p>
          <p className="text-sm text-gray-500">
            Component data requires surgeon-specific implant usage records. This data will be populated when detailed supply chain data is integrated.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
        <Package className="text-purple-600" />
        Component Pricing Comparison
      </h3>
      <p className="text-gray-600 mb-6">
        Compare your component prices with other vendors. Showing your top 5 most expensive components by total annual spend.
      </p>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Procedure Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Procedure Type:</label>
          <div className="flex gap-2">
            {['all', 'hip', 'knee'].map(type => (
              <button
                key={type}
                onClick={() => setProcedureFilter(type)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  procedureFilter === type
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? 'All Procedures' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Component Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Component Type:</label>
          <div className="flex gap-2">
            {['all', 'primary', 'revision'].map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  typeFilter === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-purple-100 to-blue-100 border-b-2 border-purple-300">
              <th className="px-4 py-3 text-left font-bold">#</th>
              <th className="px-4 py-3 text-left font-bold">Component</th>
              <th className="px-4 py-3 text-center font-bold">Your Vendor</th>
              <th className="px-4 py-3 text-center font-bold">Your Price</th>
              <th className="px-4 py-3 text-center font-bold">Vendor-Alpha</th>
              <th className="px-4 py-3 text-center font-bold">Vendor-Beta</th>
              <th className="px-4 py-3 text-center font-bold">Vendor-Gamma</th>
              <th className="px-4 py-3 text-center font-bold">Vendor-Delta</th>
              <th className="px-4 py-3 text-right font-bold">Annual Qty</th>
              <th className="px-4 py-3 text-right font-bold">Savings Opp.</th>
            </tr>
          </thead>
          <tbody>
            {components.length === 0 ? (
              <tr>
                <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                  No components match the selected filters
                </td>
              </tr>
            ) : (
              components.map((comp, idx) => {
                const vendorPricing = getVendorPricing(comp.category);
                const yourVendorData = vendorPricing.find(v => v.vendor === comp.vendor);
                const yourPrice = yourVendorData?.medianPrice || comp.avgPrice || 0;
                const bestPrice = vendorPricing[0]?.medianPrice || yourPrice || 0;
                const savings = comp.quantity * Math.max(0, (yourPrice || 0) - (bestPrice || 0));
                const isUsingBest = yourPrice === bestPrice;

                const getVendorPrice = (vendorName) => {
                  const vendor = vendorPricing.find(v => v.vendor === vendorName);
                  return vendor?.medianPrice;
                };

                return (
                  <tr
                    key={idx}
                    className={`border-b hover:bg-purple-50 ${isUsingBest ? 'bg-green-50' : ''}`}
                  >
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-purple-600 text-white text-xs font-bold rounded-full">
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{comp.category}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="font-bold text-purple-700">{comp.vendor.split(' ')[0]}</div>
                      {isUsingBest && <div className="text-xs text-green-600 font-bold">✓ BEST</div>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="font-bold text-gray-900">${yourPrice.toFixed(2)}</div>
                    </td>
                    {['VENDOR-ALPHA', 'VENDOR-BETA', 'VENDOR-GAMMA', 'VENDOR-DELTA'].map(vendor => {
                      const price = getVendorPrice(vendor);
                      const isYourVendor = comp.vendor === vendor;
                      const isBest = price === bestPrice;

                      return (
                        <td key={vendor} className="px-4 py-3 text-center">
                          {price ? (
                            <div className={`font-semibold ${
                              isBest ? 'text-green-600' :
                              isYourVendor ? 'text-purple-700' :
                              'text-gray-700'
                            }`}>
                              ${price.toFixed(2)}
                            </div>
                          ) : (
                            <div className="text-gray-400 text-xs">N/A</div>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {comp.quantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {savings > 0 ? (
                        <div>
                          <div className="font-bold text-green-600 flex items-center justify-end gap-1">
                            <TrendingDown className="w-4 h-4" />
                            ${savings.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                          </div>
                          <div className="text-xs text-gray-600">per year</div>
                        </div>
                      ) : (
                        <div className="text-sm font-semibold text-gray-500">—</div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {components.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-gray-900">Total Annual Savings Opportunity</h4>
              <p className="text-sm text-gray-600">From switching to best-priced vendors for these components</p>
            </div>
            <div className="text-3xl font-bold text-green-600">
              ${components.reduce((sum, comp) => {
                const vendorPricing = getVendorPricing(comp.category);
                const yourVendorData = vendorPricing.find(v => v.vendor === comp.vendor);
                const yourPrice = yourVendorData?.medianPrice || comp.avgPrice;
                const bestPrice = vendorPricing[0]?.medianPrice || yourPrice;
                return sum + (comp.quantity * Math.max(0, yourPrice - bestPrice));
              }, 0).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentComparisonView;
