import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';

const RegionSwitchingHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/region-switching-heatmap.json')
      .then(res => res.json())
      .then(data => {
        setHeatmapData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading heatmap data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading heatmap...</div>;
  }

  if (!heatmapData) {
    return <div className="text-center py-8 text-gray-500">Unable to load heatmap data</div>;
  }

  // Get color based on burden score
  const getBurdenColor = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 70) return 'bg-red-600';
    if (numScore >= 60) return 'bg-red-500';
    if (numScore >= 50) return 'bg-orange-500';
    if (numScore >= 40) return 'bg-orange-400';
    if (numScore >= 30) return 'bg-yellow-400';
    if (numScore >= 20) return 'bg-yellow-300';
    if (numScore >= 10) return 'bg-green-300';
    return 'bg-green-400';
  };

  const getTextColor = (score) => {
    const numScore = parseFloat(score);
    return numScore >= 30 ? 'text-white' : 'text-gray-900';
  };

  // Group data by scenario and region
  const dataMatrix = {};
  heatmapData.heatmapData.forEach(row => {
    if (!dataMatrix[row.scenario]) {
      dataMatrix[row.scenario] = {};
    }
    dataMatrix[row.scenario][row.region] = row;
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Regional Switching Burden Heatmap
        </h2>
        <p className="text-gray-600 mb-4">
          Impact of vendor consolidation by region - darker colors indicate higher burden
        </p>

        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span className="text-sm text-gray-700">Low (0-20%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-300 rounded"></div>
            <span className="text-sm text-gray-700">Moderate (20-40%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-400 rounded"></div>
            <span className="text-sm text-gray-700">High (40-60%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-700">Very High (60-80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-sm text-gray-700">Critical (&gt;80%)</span>
          </div>
        </div>
      </div>

      {/* Heatmap Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-3 text-left bg-gray-100 border-b-2 border-gray-300 font-bold text-gray-900 sticky left-0 z-10">
                Scenario
              </th>
              {heatmapData.regions.map(region => (
                <th
                  key={region}
                  className="p-3 text-center bg-gray-100 border-b-2 border-gray-300 font-bold text-gray-900 min-w-[100px]"
                >
                  <div className="text-xs">{region}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmapData.scenarios.map(scenario => (
              <tr key={scenario.key} className="hover:bg-gray-50">
                <td className="p-3 border-b border-gray-200 font-semibold text-gray-900 bg-white sticky left-0 z-10">
                  <div className="text-sm">{scenario.shortName}</div>
                </td>
                {heatmapData.regions.map(region => {
                  const cellData = dataMatrix[scenario.shortName]?.[region];
                  if (!cellData) return <td key={region} className="p-3 border-b border-gray-200"></td>;

                  return (
                    <td
                      key={region}
                      className="p-3 border-b border-gray-200 relative group"
                    >
                      <div
                        className={`${getBurdenColor(cellData.burdenScore)} ${getTextColor(cellData.burdenScore)} rounded p-2 text-center font-bold text-sm transition-all hover:scale-105 cursor-pointer`}
                        title={`${cellData.burdenScore}% burden - ${cellData.surgeonsAffected} surgeons, ${cellData.casesAffected} cases`}
                      >
                        {cellData.burdenScore}%
                      </div>

                      {/* Tooltip */}
                      <div className="absolute left-1/2 bottom-full mb-2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap shadow-xl">
                        <div className="font-bold mb-1">{region}</div>
                        <div>Burden Score: {cellData.burdenScore}%</div>
                        <div>Surgeons: {cellData.surgeonsAffected} of {cellData.totalSurgeons} ({cellData.surgeonPct}%)</div>
                        <div>Cases: {cellData.casesAffected.toLocaleString()} of {cellData.totalCases.toLocaleString()} ({cellData.casePct}%)</div>
                        <div>Spend: ${(cellData.spendAffected / 1000000).toFixed(1)}M of ${(cellData.totalSpend / 1000000).toFixed(1)}M ({cellData.spendPct}%)</div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Methodology Note */}
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex items-start gap-2">
          <Info className="text-blue-600 mt-0.5 flex-shrink-0" size={18} />
          <div className="text-sm text-gray-700">
            <strong>Burden Score Calculation:</strong> Weighted composite score based on surgeons affected (40%),
            cases affected (30%), and spend at risk (30%). Higher scores indicate more surgeons in that region
            would need to switch vendors under that consolidation scenario.
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
          <h3 className="font-bold text-gray-900 mb-2">Lowest Average Burden</h3>
          <div className="text-2xl font-bold text-green-700">
            {heatmapData.scenarios[0]?.shortName}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Quad-vendor approach minimizes regional disruption
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border-2 border-orange-200">
          <h3 className="font-bold text-gray-900 mb-2">Highest Risk Regions</h3>
          <div className="text-sm text-gray-700">
            {/* Find regions with highest average burden */}
            {(() => {
              const regionBurdens = {};
              heatmapData.regions.forEach(region => {
                const burdens = heatmapData.scenarios.map(s => {
                  return parseFloat(dataMatrix[s.shortName]?.[region]?.burdenScore || 0);
                });
                regionBurdens[region] = burdens.reduce((a, b) => a + b, 0) / burdens.length;
              });
              const sorted = Object.entries(regionBurdens)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3);

              return sorted.map(([region, burden]) => (
                <div key={region} className="flex justify-between mb-1">
                  <span className="font-semibold">{region}</span>
                  <span className="text-orange-700">{burden.toFixed(1)}% avg</span>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionSwitchingHeatmap;
