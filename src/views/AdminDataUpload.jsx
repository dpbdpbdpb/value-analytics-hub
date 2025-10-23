import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Download, CheckCircle, AlertCircle, FileText, Eye, Save, ArrowLeft, Lock, Unlock } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import NavigationHeader from '../components/shared/NavigationHeader';

const AdminDataUpload = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [file, setFile] = useState(null);
  const [productLine, setProductLine] = useState('hip-knee');
  const [rawData, setRawData] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Authentication
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'notlzt') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect password');
      setPassword('');
    }
  };

  // File handling
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setRawData(null);
    setProcessedData(null);
    setValidationResults(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target.result;

      if (uploadedFile.name.endsWith('.csv')) {
        // Parse CSV
        Papa.parse(data, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setRawData(results.data);
          }
        });
      } else {
        // Parse Excel
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setRawData(jsonData);
      }
    };

    if (uploadedFile.name.endsWith('.csv')) {
      reader.readAsText(uploadedFile);
    } else {
      reader.readAsBinaryString(uploadedFile);
    }
  };

  // Process data using Claude's standardization logic
  const processData = async () => {
    if (!rawData) return;

    setProcessing(true);

    try {
      // This is where we'll transform the raw data into the standardized JSON format
      // For now, we'll create a placeholder structure
      const processed = await transformRawDataToJSON(rawData, productLine);
      setProcessedData(processed);

      // Validate the processed data
      const validation = validateData(processed);
      setValidationResults(validation);
    } catch (error) {
      console.error('Error processing data:', error);
      setValidationResults({
        isValid: false,
        errors: [error.message]
      });
    } finally {
      setProcessing(false);
    }
  };

  // Transform raw data to JSON (implementing the prompt logic)
  const transformRawDataToJSON = async (data, productLine) => {
    // Group data by vendor
    const vendorMap = {};
    const surgeonMap = {};
    const componentMap = {};
    const matrixPricingMap = {};

    let totalCases = 0;
    let totalSpend = 0;

    data.forEach(row => {
      const vendor = normalizeVendorName(row.Vendor || row.vendor || row.VENDOR);
      const surgeon = row.Surgeon || row.surgeon || row.SURGEON || 'Unknown';
      const component = row.Component || row.component || row.COMPONENT || 'Unknown';
      const quantity = parseFloat(row.Quantity || row.quantity || row.QTY || 1);
      const price = parseFloat(row.Price || row.price || row.PRICE || 0);
      const spend = quantity * price;

      totalCases += quantity;
      totalSpend += spend;

      // Aggregate vendors
      if (!vendorMap[vendor]) {
        vendorMap[vendor] = { totalSpend: 0, totalQuantity: 0, uniqueSurgeons: new Set() };
      }
      vendorMap[vendor].totalSpend += spend;
      vendorMap[vendor].totalQuantity += quantity;
      vendorMap[vendor].uniqueSurgeons.add(surgeon);

      // Aggregate surgeons
      if (!surgeonMap[surgeon]) {
        surgeonMap[surgeon] = { totalCases: 0, totalSpend: 0, vendors: {} };
      }
      surgeonMap[surgeon].totalCases += quantity;
      surgeonMap[surgeon].totalSpend += spend;
      if (!surgeonMap[surgeon].vendors[vendor]) {
        surgeonMap[surgeon].vendors[vendor] = { cases: 0, spend: 0 };
      }
      surgeonMap[surgeon].vendors[vendor].cases += quantity;
      surgeonMap[surgeon].vendors[vendor].spend += spend;

      // Aggregate components
      if (!componentMap[component]) {
        componentMap[component] = [];
      }
      componentMap[component].push({ vendor, price, quantity });

      // Matrix pricing detailed
      if (!matrixPricingMap[component]) {
        matrixPricingMap[component] = { category: component, vendors: {} };
      }
      if (!matrixPricingMap[component].vendors[vendor]) {
        matrixPricingMap[component].vendors[vendor] = { prices: [], samples: 0 };
      }
      matrixPricingMap[component].vendors[vendor].prices.push(price);
      matrixPricingMap[component].vendors[vendor].samples += quantity;
    });

    // Build vendors object
    const vendors = {};
    Object.entries(vendorMap).forEach(([name, data]) => {
      vendors[name] = {
        totalSpend: data.totalSpend,
        totalQuantity: data.totalQuantity,
        uniqueSurgeons: data.uniqueSurgeons.size
      };
    });

    // Build matrixPricing (array) and matrixPricingDetailed (object)
    const matrixPricing = [];
    const matrixPricingDetailed = {};

    Object.entries(matrixPricingMap).forEach(([category, data]) => {
      const vendorStats = {};
      const allPrices = [];
      let totalSamples = 0;

      Object.entries(data.vendors).forEach(([vendor, info]) => {
        const prices = info.prices.sort((a, b) => a - b);
        const median = prices[Math.floor(prices.length / 2)];
        const min = Math.min(...prices);
        const max = Math.max(...prices);

        vendorStats[vendor] = {
          medianPrice: Math.round(median),
          samples: info.samples,
          priceRange: { min: Math.round(min), max: Math.round(max) }
        };

        allPrices.push(...prices);
        totalSamples += info.samples;
      });

      matrixPricingDetailed[category] = {
        category,
        vendors: vendorStats
      };

      // Calculate aggregate metrics for array format
      const weightedSum = Object.entries(vendorStats).reduce((sum, [vendor, stats]) => {
        return sum + (stats.medianPrice * stats.samples);
      }, 0);
      const currentAvgPrice = Math.round(weightedSum / totalSamples);
      const matrixPrice = Math.min(...Object.values(vendorStats).map(v => v.medianPrice));
      const totalSpendCat = currentAvgPrice * totalSamples;
      const potentialSavings = totalSamples * (currentAvgPrice - matrixPrice);

      if (potentialSavings > 0 && totalSpendCat > 0) {
        matrixPricing.push({
          category,
          totalSpend: Math.round(totalSpendCat),
          currentAvgPrice,
          matrixPrice,
          potentialSavings: Math.round(potentialSavings)
        });
      }
    });

    // Sort matrixPricing by potential savings
    matrixPricing.sort((a, b) => b.potentialSavings - a.potentialSavings);

    // Build components array
    const components = [];
    data.forEach(row => {
      components.push({
        name: row.Component || row.component || row.COMPONENT || 'Unknown',
        vendor: normalizeVendorName(row.Vendor || row.vendor || row.VENDOR),
        quantity: parseFloat(row.Quantity || row.quantity || row.QTY || 1),
        totalSpend: parseFloat(row.Quantity || 1) * parseFloat(row.Price || 0),
        avgPrice: parseFloat(row.Price || row.price || row.PRICE || 0),
        procedureType: row.ProcedureType || row.Type || 'PRIMARY',
        bodyPart: productLine === 'shoulder' ? 'SHOULDER' : (row.BodyPart || 'HIP')
      });
    });

    // Build final JSON structure
    return {
      metadata: {
        productLine: productLine,
        dataType: 'baseline',
        dataCollectionDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString(),
        dataSource: `Uploaded via Admin Interface - ${file?.name}`,
        version: '1.0',
        totalCases: Math.round(totalCases),
        totalSpend: Math.round(totalSpend),
        totalSurgeons: Object.keys(surgeonMap).length
      },
      vendors,
      matrixPricing,
      matrixPricingDetailed,
      components,
      workflowTracking: {
        currentStage: 'sourcing-review',
        lastUpdated: new Date().toISOString(),
        stages: {
          'sourcing-review': {
            status: 'active',
            startDate: new Date().toISOString().split('T')[0],
            notes: 'Data uploaded via admin interface'
          },
          'decision': {
            status: 'upcoming',
            notes: 'Decision phase will begin after sourcing review completion'
          },
          'implementation': {
            status: 'upcoming',
            notes: 'Implementation phase will begin after decision is made'
          },
          'lookback': {
            status: 'upcoming',
            notes: 'Lookback analysis will occur post-implementation'
          },
          'renewal': {
            status: 'upcoming',
            notes: 'Contract renewal process for future cycles'
          }
        }
      }
    };
  };

  // Normalize vendor names
  const normalizeVendorName = (name) => {
    if (!name) return 'UNKNOWN';
    const upper = name.toUpperCase().trim();

    // Common normalizations
    if (upper.includes('J&J') || upper.includes('JOHNSON') || upper.includes('DEPUY')) return 'JOHNSON & JOHNSON';
    if (upper.includes('ZIMMER')) return 'ZIMMER BIOMET';
    if (upper.includes('STRYKER')) return 'STRYKER';
    if (upper.includes('SMITH') && upper.includes('NEPHEW')) return 'SMITH & NEPHEW';

    return upper;
  };

  // Validate processed data
  const validateData = (data) => {
    const errors = [];
    const warnings = [];

    if (!data.metadata) errors.push('Missing metadata section');
    if (!data.vendors) errors.push('Missing vendors section');
    if (!data.matrixPricing) errors.push('Missing matrixPricing section');
    if (!data.matrixPricingDetailed) errors.push('Missing matrixPricingDetailed section');
    if (!data.components) errors.push('Missing components section');

    // Validate matrixPricing is an array
    if (data.matrixPricing && !Array.isArray(data.matrixPricing)) {
      errors.push('matrixPricing must be an array');
    }

    // Validate matrixPricingDetailed is an object
    if (data.matrixPricingDetailed && Array.isArray(data.matrixPricingDetailed)) {
      errors.push('matrixPricingDetailed must be an object');
    }

    // Check for required fields in matrixPricing items
    if (Array.isArray(data.matrixPricing)) {
      data.matrixPricing.forEach((item, idx) => {
        if (!item.category) warnings.push(`matrixPricing[${idx}] missing category`);
        if (!item.currentAvgPrice) warnings.push(`matrixPricing[${idx}] missing currentAvgPrice`);
        if (!item.matrixPrice) warnings.push(`matrixPricing[${idx}] missing matrixPrice`);
        if (!item.potentialSavings) warnings.push(`matrixPricing[${idx}] missing potentialSavings`);
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        vendors: Object.keys(data.vendors || {}).length,
        components: (data.components || []).length,
        matrixCategories: Array.isArray(data.matrixPricing) ? data.matrixPricing.length : 0,
        totalSpend: data.metadata?.totalSpend || 0,
        totalCases: data.metadata?.totalCases || 0
      }
    };
  };

  // Download processed JSON
  const downloadJSON = () => {
    const json = JSON.stringify(processedData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${productLine}-data.json`;
    a.click();
  };

  // Save to file (this will download - user must commit via git)
  const saveData = () => {
    const json = JSON.stringify(processedData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = productLine === 'shoulder' ? 'shoulder-data.json' : 'orthopedic-data.json';
    a.click();

    alert(`Data saved! Next steps:\n\n1. Save the downloaded file to public/\n2. Run: git add public/${productLine === 'shoulder' ? 'shoulder-data.json' : 'orthopedic-data.json'}\n3. Run: git commit -m "Update ${productLine} data"\n4. Run: git push`);
  };

  // Login UI
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Lock className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Access</h1>
            <p className="text-gray-600">Data Upload & Management</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter password"
                autoFocus
              />
              {authError && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {authError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <Unlock className="w-5 h-5" />
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main Admin UI
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Data Upload & Management</h1>
          <p className="text-gray-600">Upload Excel/CSV files and transform them into standardized JSON format</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Upload className="w-6 h-6 text-purple-600" />
            Step 1: Upload Data
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Line
              </label>
              <select
                value={productLine}
                onChange={(e) => setProductLine(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="hip-knee">Hip & Knee</option>
                <option value="shoulder">Shoulder</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data File (Excel or CSV)
              </label>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {rawData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                File loaded: {rawData.length} rows
              </p>
            </div>
          )}
        </div>

        {/* Process Section */}
        {rawData && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Step 2: Process Data
            </h2>

            <button
              onClick={processData}
              disabled={processing}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
            >
              {processing ? 'Processing...' : 'Transform to JSON'}
            </button>
          </div>
        )}

        {/* Validation & Preview Section */}
        {validationResults && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              {validationResults.isValid ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600" />
              )}
              Step 3: Validation Results
            </h2>

            {validationResults.isValid ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-semibold">✅ Data validated successfully!</p>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600 mb-1">Vendors</p>
                    <p className="text-2xl font-bold text-purple-900">{validationResults.summary.vendors}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 mb-1">Components</p>
                    <p className="text-2xl font-bold text-blue-900">{validationResults.summary.components}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 mb-1">Matrix Categories</p>
                    <p className="text-2xl font-bold text-green-900">{validationResults.summary.matrixCategories}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-orange-600 mb-1">Total Spend</p>
                    <p className="text-2xl font-bold text-orange-900">${(validationResults.summary.totalSpend / 1000000).toFixed(1)}M</p>
                  </div>
                </div>

                {validationResults.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="font-semibold text-yellow-800 mb-2">⚠️ Warnings:</p>
                    <ul className="list-disc list-inside text-yellow-700 text-sm space-y-1">
                      {validationResults.warnings.map((warn, idx) => (
                        <li key={idx}>{warn}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </button>
                  <button
                    onClick={downloadJSON}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download JSON
                  </button>
                  <button
                    onClick={saveData}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save & Deploy
                  </button>
                </div>

                {showPreview && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <pre className="text-xs overflow-auto max-h-96">
                      {JSON.stringify(processedData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-semibold text-red-800 mb-2">❌ Validation Errors:</p>
                <ul className="list-disc list-inside text-red-700 space-y-1">
                  {validationResults.errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDataUpload;
