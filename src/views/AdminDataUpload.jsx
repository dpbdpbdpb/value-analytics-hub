import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Download, CheckCircle, AlertCircle, FileText, Eye, Save, ArrowLeft, Lock, Unlock, Info } from 'lucide-react';
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
  const [detectedColumns, setDetectedColumns] = useState(null);
  const [columnMapping, setColumnMapping] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  // Detect columns from first row and create smart mapping
  const detectAndMapColumns = (data) => {
    if (!data || data.length === 0) return null;

    const columns = Object.keys(data[0]);
    const mapping = {
      vendor: findBestMatch(columns, ['vendor', 'vendor name', 'manufacturer', 'supplier', 'mfr']),
      component: findBestMatch(columns, ['item_description', 'item description', 'component', 'item', 'description', 'product', 'component description', 'product description', 'product name']),
      componentCategory: findBestMatch(columns, ['cpc_category', 'cpc category', 'category', 'component category', 'item category']),
      quantity: findBestMatch(columns, ['quantity', 'qty', 'count', 'units', 'volume']),
      price: findBestMatch(columns, ['price', 'unit price', 'cost', 'unit cost', 'avg price', 'average price']),
      surgeon: findBestMatch(columns, ['surgeon', 'doctor', 'physician', 'provider', 'surgeon name']),
      procedureType: findBestMatch(columns, ['procedure type', 'type', 'procedure', 'surgery type']),
      bodyPart: findBestMatch(columns, ['body part', 'bodypart', 'anatomy', 'site']),
      facility: findBestMatch(columns, ['facility name', 'facility', 'hospital', 'hospital name', 'site name', 'location']),
      region: findBestMatch(columns, ['region name', 'region', 'area', 'district', 'market'])
    };

    return { columns, mapping };
  };

  // Find best matching column name (case-insensitive, fuzzy)
  const findBestMatch = (columns, targets) => {
    const lowerColumns = columns.map(c => c.toLowerCase().trim());

    // Try exact matches first
    for (const target of targets) {
      const idx = lowerColumns.indexOf(target.toLowerCase());
      if (idx !== -1) return columns[idx];
    }

    // Try partial matches
    for (const target of targets) {
      const targetLower = target.toLowerCase();
      for (let i = 0; i < lowerColumns.length; i++) {
        if (lowerColumns[i].includes(targetLower) || targetLower.includes(lowerColumns[i])) {
          return columns[i];
        }
      }
    }

    return null;
  };

  // File handling
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setRawData(null);
    setProcessedData(null);
    setValidationResults(null);
    setDetectedColumns(null);
    setColumnMapping(null);

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
            const detected = detectAndMapColumns(results.data);
            setDetectedColumns(detected?.columns || []);
            setColumnMapping(detected?.mapping || {});
          }
        });
      } else {
        // Parse Excel
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setRawData(jsonData);
        const detected = detectAndMapColumns(jsonData);
        setDetectedColumns(detected?.columns || []);
        setColumnMapping(detected?.mapping || {});
      }
    };

    if (uploadedFile.name.endsWith('.csv')) {
      reader.readAsText(uploadedFile);
    } else {
      reader.readAsArrayBuffer(uploadedFile);
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

  // Helper: Identify if component is a primary component (one per surgery)
  const isPrimaryComponent = (componentName) => {
    if (!componentName) return false;
    const name = componentName.toUpperCase();

    // Hip primary component indicators (typically 1 per surgery)
    const isHipPrimary =
      // Acetabular components (cup, shell, liner combinations)
      (name.includes('ACETABULAR') && (name.includes('CUP') || name.includes('SHELL'))) ||
      (name.includes('ACETAB') && (name.includes('CUP') || name.includes('SHELL'))) ||
      // Femoral hip components (stem, head)
      (name.includes('FEMORAL') && name.includes('STEM') && !name.includes('KNEE')) ||
      (name.includes('FEM') && name.includes('STEM') && !name.includes('KNEE')) ||
      // Standalone hip indicators
      (name.includes('HIP') && (name.includes('CUP') || name.includes('SHELL') || name.includes('STEM')));

    // Knee primary component indicators (typically 1 per surgery)
    const isKneePrimary =
      // Tibial components (tray, baseplate, plate)
      (name.includes('TIBIAL') && (name.includes('TRAY') || name.includes('BASEPLATE') || name.includes('BASE PLATE') || name.includes('PLATE'))) ||
      (name.includes('TIB') && (name.includes('TRAY') || name.includes('BASEPLATE') || name.includes('BASE PLATE') || name.includes('PLATE'))) ||
      // Femoral knee components
      (name.includes('FEMORAL') && (name.includes('KNEE') || name.includes('COMP'))) ||
      (name.includes('FEM') && name.includes('KNEE')) ||
      // Knee-specific patterns
      (name.includes('KNEE') && name.includes('FEMORAL')) ||
      (name.includes('KNEE') && name.includes('TIBIAL'));

    return isHipPrimary || isKneePrimary;
  };

  // Transform raw data to JSON (implementing the prompt logic)
  const transformRawDataToJSON = async (data, productLine) => {
    // Group data by vendor
    const vendorMap = {};
    const surgeonMap = {};
    const componentMap = {};
    const matrixPricingMap = {};
    const hospitalMap = {};
    const regionMap = {};

    let totalCases = 0;
    let totalSpend = 0;

    // Use columnMapping if available, otherwise fallback to common names
    const getFieldValue = (row, mappedField, fallbacks) => {
      if (columnMapping && columnMapping[mappedField]) {
        return row[columnMapping[mappedField]];
      }
      // Fallback to common variations
      for (const fallback of fallbacks) {
        if (row[fallback] !== undefined) return row[fallback];
      }
      return null;
    };

    data.forEach(row => {
      const vendor = normalizeVendorName(
        getFieldValue(row, 'vendor', ['Vendor', 'vendor', 'VENDOR', 'Vendor Name', 'Manufacturer']) || 'UNKNOWN'
      );
      const surgeon = getFieldValue(row, 'surgeon', ['Surgeon', 'surgeon', 'SURGEON', 'Doctor', 'Physician']) || 'Unknown';
      const componentRaw = getFieldValue(row, 'component', ['Component', 'component', 'COMPONENT', 'Item', 'Description', 'Product']) || 'Unknown';
      const facility = getFieldValue(row, 'facility', ['Facility Name', 'facility name', 'Facility', 'Hospital', 'Hospital Name']) || null;
      const region = getFieldValue(row, 'region', ['Region Name', 'region name', 'Region', 'Area', 'District']) || null;

      // Normalize component name for better grouping
      const component = normalizeComponentName(componentRaw);

      const quantity = parseFloat(getFieldValue(row, 'quantity', ['Quantity', 'quantity', 'QTY', 'Qty', 'Count', 'Units']) || 1);
      const price = parseFloat(getFieldValue(row, 'price', ['Price', 'price', 'PRICE', 'Unit Price', 'Cost', 'Unit Cost']) || 0);
      const spend = quantity * price;

      // Count cases only from primary components (acetabular cups, femoral/tibial components)
      // This estimates actual surgical procedures rather than counting all component SKUs
      if (isPrimaryComponent(component)) {
        totalCases += quantity;
      }
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
        surgeonMap[surgeon] = {
          totalCases: 0,
          totalSpend: 0,
          vendors: {},
          facility: null,
          region: null
        };
      }
      // Store facility and region (first occurrence wins)
      if (facility && !surgeonMap[surgeon].facility) {
        surgeonMap[surgeon].facility = facility;
      }
      if (region && !surgeonMap[surgeon].region) {
        surgeonMap[surgeon].region = region;
      }
      // Count cases only from primary components for accurate surgery count
      if (isPrimaryComponent(component)) {
        surgeonMap[surgeon].totalCases += quantity;
      }
      surgeonMap[surgeon].totalSpend += spend;
      if (!surgeonMap[surgeon].vendors[vendor]) {
        surgeonMap[surgeon].vendors[vendor] = { cases: 0, spend: 0 };
      }
      // Count cases only from primary components
      if (isPrimaryComponent(component)) {
        surgeonMap[surgeon].vendors[vendor].cases += quantity;
      }
      surgeonMap[surgeon].vendors[vendor].spend += spend;

      // Aggregate hospitals (if facility data exists)
      if (facility) {
        if (!hospitalMap[facility]) {
          hospitalMap[facility] = {
            totalCases: 0,
            totalSpend: 0,
            surgeons: new Set(),
            vendors: new Set()
          };
        }
        if (isPrimaryComponent(component)) {
          hospitalMap[facility].totalCases += quantity;
        }
        hospitalMap[facility].totalSpend += spend;
        hospitalMap[facility].surgeons.add(surgeon);
        hospitalMap[facility].vendors.add(vendor);
      }

      // Aggregate regions (if region data exists)
      if (region) {
        if (!regionMap[region]) {
          regionMap[region] = {
            totalCases: 0,
            totalSpend: 0,
            facilities: new Set(),
            surgeons: new Set(),
            vendors: new Set()
          };
        }
        if (isPrimaryComponent(component)) {
          regionMap[region].totalCases += quantity;
        }
        regionMap[region].totalSpend += spend;
        if (facility) regionMap[region].facilities.add(facility);
        regionMap[region].surgeons.add(surgeon);
        regionMap[region].vendors.add(vendor);
      }

      // Aggregate components (using normalized name)
      if (!componentMap[component]) {
        componentMap[component] = [];
      }
      componentMap[component].push({ vendor, price, quantity });

      // Matrix pricing detailed (using normalized name for grouping)
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
      const componentName = getFieldValue(row, 'component', ['item_description', 'Item_Description', 'item description', 'Item Description', 'Component', 'component', 'COMPONENT', 'Description', 'Item', 'Product']) || 'Unknown';
      const componentCategory = getFieldValue(row, 'componentCategory', ['cpc_category', 'CPC_Category', 'cpc category', 'CPC Category', 'Category', 'Item Category']) || null;

      components.push({
        name: componentName,
        category: componentCategory,
        vendor: normalizeVendorName(getFieldValue(row, 'vendor', ['Vendor', 'vendor', 'VENDOR', 'Vendor Name', 'Manufacturer']) || 'UNKNOWN'),
        quantity: parseFloat(getFieldValue(row, 'quantity', ['Quantity', 'quantity', 'QTY', 'Qty', 'Count', 'Units']) || 1),
        totalSpend: parseFloat(getFieldValue(row, 'quantity', ['Quantity', 'quantity', 'QTY']) || 1) * parseFloat(getFieldValue(row, 'price', ['Price', 'price', 'PRICE', 'Unit Price', 'Cost']) || 0),
        avgPrice: parseFloat(getFieldValue(row, 'price', ['Price', 'price', 'PRICE', 'Unit Price', 'Cost', 'Unit Cost']) || 0),
        procedureType: getFieldValue(row, 'procedureType', ['Procedure Type', 'procedure type', 'Type', 'Procedure']) || 'PRIMARY',
        bodyPart: productLine === 'shoulder' ? 'SHOULDER' : (getFieldValue(row, 'bodyPart', ['Body Part', 'body part', 'BodyPart', 'Anatomy']) || 'HIP')
      });
    });

    // Build surgeons array
    const surgeons = Object.entries(surgeonMap).map(([name, data]) => ({
      name,
      totalCases: Math.round(data.totalCases),
      totalSpend: Math.round(data.totalSpend),
      facility: data.facility,
      region: data.region,
      vendors: Object.entries(data.vendors).reduce((acc, [vendor, stats]) => {
        acc[vendor] = {
          cases: Math.round(stats.cases),
          spend: Math.round(stats.spend)
        };
        return acc;
      }, {})
    })).sort((a, b) => b.totalSpend - a.totalSpend);

    // Build hospitals object (if facility data exists)
    const hospitals = {};
    if (Object.keys(hospitalMap).length > 0) {
      Object.entries(hospitalMap).forEach(([name, data]) => {
        hospitals[name] = {
          totalCases: Math.round(data.totalCases),
          totalSpend: Math.round(data.totalSpend),
          surgeons: data.surgeons.size,
          avgCostPerCase: data.totalCases > 0 ? Math.round(data.totalSpend / data.totalCases) : 0,
          topVendors: Array.from(data.vendors)
        };
      });
    }

    // Build regions object (if region data exists)
    const regions = {};
    if (Object.keys(regionMap).length > 0) {
      Object.entries(regionMap).forEach(([name, data]) => {
        regions[name] = {
          totalCases: Math.round(data.totalCases),
          totalSpend: Math.round(data.totalSpend),
          facilities: data.facilities.size,
          surgeons: data.surgeons.size,
          avgCostPerCase: data.totalCases > 0 ? Math.round(data.totalSpend / data.totalCases) : 0,
          topVendors: Array.from(data.vendors)
        };
      });
    }

    // Determine which sections have real vs synthetic data
    const syntheticDataSections = [];
    const dataQuality = {
      surgeons: 'REAL - from uploaded Excel',
      vendors: 'REAL - from uploaded Excel',
      components: 'REAL - from uploaded Excel',
      scenarios: 'SYNTHETIC - generated from vendor data',
      regions: Object.keys(regions).length > 0 ? 'REAL - from uploaded Excel' : 'SYNTHETIC - distributed proportionally for demo',
      hospitals: Object.keys(hospitals).length > 0 ? 'REAL - from uploaded Excel' : 'SYNTHETIC - distributed proportionally for demo',
      qualityMetrics: 'SYNTHETIC - placeholder values for demo',
      revenueCycle: 'SYNTHETIC - placeholder values for demo'
    };

    if (Object.keys(regions).length === 0) syntheticDataSections.push('regions');
    if (Object.keys(hospitals).length === 0) syntheticDataSections.push('hospitals');
    syntheticDataSections.push('qualityMetrics', 'revenueCycle');

    // Generate vendor consolidation scenarios based on actual vendor spend
    const vendorsBySpend = Object.entries(vendors)
      .sort((a, b) => b[1].totalSpend - a[1].totalSpend)
      .map(([name, data]) => ({ name, ...data }));

    const top4Vendors = vendorsBySpend.slice(0, 4);
    const top3Vendors = vendorsBySpend.slice(0, 3);
    const top2Vendors = vendorsBySpend.slice(0, 2);
    const vendors_2_3 = vendorsBySpend.slice(1, 3); // 2nd and 3rd vendors
    const vendors_1_3 = [vendorsBySpend[0], vendorsBySpend[2]]; // 1st and 3rd vendors

    // Calculate pricing cap scenario savings (IMPLANTS ONLY)
    // Note: Total spend includes implants (~30%) + accessories/disposables (~70%)
    // Pricing caps apply to IMPLANT constructs only, not total spend

    // Estimate implant-only spend (typically 30-35% of total orthopedic spend)
    // This includes: acetabular cups/shells, femoral heads/stems, tibial trays/inserts, etc.
    const estimatedImplantPercent = 0.31; // Based on typical orthopedic spend breakdown
    const estimatedImplantSpend = totalSpend * estimatedImplantPercent;
    const currentImplantCostPerCase = estimatedImplantSpend / totalCases;

    // Cap pricing: $2500 for knee implants, $3000 for hip implants
    // Assume roughly 50/50 split between hip and knee cases
    const kneeCases = Math.round(totalCases * 0.5);
    const hipCases = Math.round(totalCases * 0.5);
    const cappedKneeSpend = kneeCases * 2500;
    const cappedHipSpend = hipCases * 3000;
    const cappedImplantSpend = cappedKneeSpend + cappedHipSpend;

    // Savings = reduction in implant spend only
    const pricingCapSavings = Math.max(0, estimatedImplantSpend - cappedImplantSpend);
    const pricingCapPercent = estimatedImplantSpend > 0 ? pricingCapSavings / estimatedImplantSpend : 0;

    // Scenario generation with proper field names for generateScenarios() function
    const scenarios = {
      'status-quo': {
        name: 'Status Quo',
        shortName: 'Status Quo',
        description: 'Continue current vendor mix',
        vendors: vendorsBySpend.map(v => v.name),
        annualSavings: 0,
        savingsPercent: 0,
        adoptionRate: 1.0, // 100% = no change
        riskLevel: 'low',
        riskScore: 1,
        quintupleMissionScore: 65,
        npv5Year: 0,
        implementation: {
          complexity: 'Low',
          timeline: 0,
          costMillions: 0
        }
      },
      'quad-source': {
        name: 'Quad-Source Consolidation',
        shortName: `${top4Vendors.map(v => v.name.split(' ')[0]).join('+')}`,
        description: `Focus on top 4 vendors: ${top4Vendors.map(v => v.name).join(', ')}`,
        vendors: top4Vendors.map(v => v.name),
        annualSavings: totalSpend * 0.10,
        savingsPercent: 0.10,
        adoptionRate: 0.90, // 90%
        riskLevel: 'low',
        riskScore: 2.5,
        quintupleMissionScore: 75,
        npv5Year: (totalSpend * 0.10 * 5) - 2000000,
        implementation: {
          complexity: 'Medium',
          timeline: 10,
          costMillions: 2.0
        }
      },
      'tri-source': {
        name: 'Tri-Source Consolidation',
        shortName: `${top3Vendors.map(v => v.name.split(' ')[0]).join('+')}`,
        description: `Focus on top 3 vendors: ${top3Vendors.map(v => v.name).join(', ')}`,
        vendors: top3Vendors.map(v => v.name),
        annualSavings: totalSpend * 0.12,
        savingsPercent: 0.12,
        adoptionRate: 0.85, // 85%
        riskLevel: 'low',
        riskScore: 3,
        quintupleMissionScore: 78,
        npv5Year: (totalSpend * 0.12 * 5) - 2500000,
        implementation: {
          complexity: 'Medium',
          timeline: 12,
          costMillions: 2.5
        }
      },
      'dual-premium': {
        name: 'Dual Premium',
        shortName: `${top2Vendors.map(v => v.name.split(' ')[0]).join('+')}`,
        description: `Partner with top 2 vendors: ${top2Vendors.map(v => v.name).join(' + ')}`,
        vendors: top2Vendors.map(v => v.name),
        annualSavings: totalSpend * 0.18,
        savingsPercent: 0.18,
        adoptionRate: 0.75, // 75%
        riskLevel: 'medium',
        riskScore: 5,
        quintupleMissionScore: 82,
        npv5Year: (totalSpend * 0.18 * 5) - 3500000,
        implementation: {
          complexity: 'Medium',
          timeline: 15,
          costMillions: 3.5
        }
      },
      'dual-value': {
        name: 'Dual Value',
        shortName: `${vendors_2_3.map(v => v.name.split(' ')[0]).join('+')}`,
        description: `Partner with 2nd and 3rd vendors: ${vendors_2_3.map(v => v.name).join(' + ')}`,
        vendors: vendors_2_3.map(v => v.name),
        annualSavings: totalSpend * 0.16,
        savingsPercent: 0.16,
        adoptionRate: 0.70, // 70%
        riskLevel: 'medium',
        riskScore: 6,
        quintupleMissionScore: 80,
        npv5Year: (totalSpend * 0.16 * 5) - 3200000,
        implementation: {
          complexity: 'Medium-High',
          timeline: 18,
          costMillions: 3.2
        }
      },
      'dual-innovation': {
        name: 'Dual Innovation',
        shortName: `${vendors_1_3.map(v => v.name.split(' ')[0]).join('+')}`,
        description: `Partner with 1st and 3rd vendors: ${vendors_1_3.map(v => v.name).join(' + ')}`,
        vendors: vendors_1_3.map(v => v.name),
        annualSavings: totalSpend * 0.20,
        savingsPercent: 0.20,
        adoptionRate: 0.68, // 68%
        riskLevel: 'medium-high',
        riskScore: 6.5,
        quintupleMissionScore: 84,
        npv5Year: (totalSpend * 0.20 * 5) - 4000000,
        implementation: {
          complexity: 'High',
          timeline: 18,
          costMillions: 4.0
        }
      },
      'pricing-cap': {
        name: 'Pricing Cap by Construct',
        shortName: 'Pricing Cap',
        description: `Cap implant pricing at $2,500 per knee construct and $3,000 per hip construct across all vendors. Current avg: $${Math.round(currentImplantCostPerCase).toLocaleString()}/case.`,
        vendors: vendorsBySpend.map(v => v.name), // Keep all vendors, just cap pricing
        annualSavings: pricingCapSavings,
        savingsPercent: pricingCapPercent,
        adoptionRate: 0.95, // 95% - easier adoption since vendors stay the same
        riskLevel: 'low',
        riskScore: 2,
        quintupleMissionScore: 88,
        npv5Year: (pricingCapSavings * 5) - 1000000,
        implementation: {
          complexity: 'Low',
          timeline: 6,
          costMillions: 1.0
        }
      }
    };

    // Add scenarios to dataQuality tracking
    dataQuality.scenarios = 'CALCULATED - based on vendor consolidation strategies';

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
        totalSurgeons: Object.keys(surgeonMap).length,
        totalHospitals: Object.keys(hospitals).length,
        totalRegions: Object.keys(regions).length,
        syntheticDataSections,
        dataQuality
      },
      vendors,
      surgeons,
      hospitals,
      regions,
      scenarios,
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

  // Normalize component names for better grouping
  const normalizeComponentName = (name) => {
    if (!name) return 'UNKNOWN';

    let normalized = name.toUpperCase().trim();

    // Remove common prefixes/suffixes that don't affect component category
    const removePatterns = [
      /\bSTERILE\b/g,
      /\bLATEX-FREE\b/g,
      /\bLATEX FREE\b/g,
      /\bNON-STERILE\b/g,
      /\bDISPOSABLE\b/g,
      /\bSINGLE USE\b/g,
      /\bREUSABLE\b/g,
      /\s+SIZE\s+[A-Z0-9]+/gi,
      /\s+\d+MM\b/gi,
      /\s+\d+CM\b/gi,
      /\s+-\d+\b/g,  // Remove trailing numbers like "-3"
      /\s+TYPE\s*\d+/gi,
      /\s+MODEL\s+[A-Z0-9]+/gi,
      /\s+REF\s*[:#]?\s*[A-Z0-9-]+/gi,
      /\s+CAT\s*[:#]?\s*[A-Z0-9-]+/gi,
      /\s+LEFT\b/gi,
      /\s+RIGHT\b/gi,
      /\s+L\b$/,  // Trailing L or R
      /\s+R\b$/
    ];

    removePatterns.forEach(pattern => {
      normalized = normalized.replace(pattern, '');
    });

    // Standardize common terms
    const standardizations = {
      'ACETABULAR': 'ACETABULAR',
      'ACETAB': 'ACETABULAR',
      'FEMORAL': 'FEMORAL',
      'FEM': 'FEMORAL',
      'TIBIAL': 'TIBIAL',
      'TIB': 'TIBIAL',
      'PATELLAR': 'PATELLAR',
      'PAT': 'PATELLAR',
      'KNEE': 'KNEE',
      'HIP': 'HIP',
      'SHOULDER': 'SHOULDER',
      'HUMERAL': 'HUMERAL',
      'GLENOID': 'GLENOID',
      'COMPONENT': 'COMP',
      'IMPLANT': 'IMPLANT',
      'PROSTHESIS': 'PROSTH',
      'REVISION': 'REV',
      'PRIMARY': 'PRIM'
    };

    Object.entries(standardizations).forEach(([from, to]) => {
      const regex = new RegExp(`\\b${from}\\b`, 'g');
      normalized = normalized.replace(regex, to);
    });

    // Remove extra whitespace
    normalized = normalized.replace(/\s+/g, ' ').trim();

    // Extract core component type for grouping
    // Try to identify the main component type
    if (normalized.includes('ACETABULAR') && normalized.includes('CUP')) {
      return 'ACETABULAR CUP';
    }
    if (normalized.includes('ACETABULAR') && normalized.includes('SHELL')) {
      return 'ACETABULAR SHELL';
    }
    if (normalized.includes('FEMORAL') && normalized.includes('HEAD')) {
      return 'FEMORAL HEAD';
    }
    if (normalized.includes('FEMORAL') && normalized.includes('STEM')) {
      return 'FEMORAL STEM';
    }
    if (normalized.includes('TIBIAL') && (normalized.includes('TRAY') || normalized.includes('BASEPLATE'))) {
      return 'TIBIAL TRAY';
    }
    if (normalized.includes('TIBIAL') && normalized.includes('INSERT')) {
      return 'TIBIAL INSERT';
    }
    if (normalized.includes('FEMORAL') && normalized.includes('KNEE')) {
      return 'FEMORAL KNEE COMP';
    }
    if (normalized.includes('PATELLAR')) {
      return 'PATELLAR COMP';
    }
    if (normalized.includes('GLENOID')) {
      return 'GLENOID COMP';
    }
    if (normalized.includes('HUMERAL')) {
      return 'HUMERAL COMP';
    }

    // If no specific pattern matched, return the cleaned-up name
    // but limit length to avoid too-specific groupings
    const words = normalized.split(' ').filter(w => w.length > 2);
    return words.slice(0, 4).join(' ');
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

    // Check for column mapping issues
    if (columnMapping) {
      if (!columnMapping.vendor) warnings.push('Vendor column was not detected - data may be incomplete');
      if (!columnMapping.component) warnings.push('Component column was not detected - data may be incomplete');
      if (!columnMapping.quantity) warnings.push('Quantity column was not detected - defaulted to 1');
      if (!columnMapping.price) warnings.push('Price column was not detected - defaulted to $0');
    }

    // Check for suspicious data values
    if (data.metadata) {
      if (data.metadata.totalSpend === 0 || data.metadata.totalSpend < 1000) {
        warnings.push(`Total spend is suspiciously low ($${data.metadata.totalSpend.toFixed(2)}). Check that Price column was correctly mapped.`);
      }
      if (data.metadata.totalCases === 0) {
        warnings.push('Total cases is 0. Check that Quantity column was correctly mapped.');
      }
    }

    // Add methodology note about case counting
    const info = [];
    info.push(`📊 Case Counting Methodology: Cases are estimated by counting primary components (acetabular cups, femoral components, tibial trays) rather than all component SKUs. This provides an accurate estimate of actual surgical procedures.`);

    // Add info about extracted facility/region data
    const totalHospitals = data.metadata?.totalHospitals || 0;
    const totalRegions = data.metadata?.totalRegions || 0;
    if (totalHospitals > 0) {
      info.push(`🏥 Hospital Data: Successfully extracted ${totalHospitals} facilities from your Excel file.`);
    }
    if (totalRegions > 0) {
      info.push(`🌎 Region Data: Successfully extracted ${totalRegions} regions from your Excel file.`);
    }

    // Analyze matrix pricing categories
    const matrixCategories = Array.isArray(data.matrixPricing) ? data.matrixPricing : [];
    const matrixDetails = data.matrixPricingDetailed || {};

    // Count components by vendor count
    const multiVendorCategories = Object.values(matrixDetails).filter(
      cat => Object.keys(cat.vendors || {}).length >= 2
    ).length;
    const singleVendorCategories = Object.values(matrixDetails).filter(
      cat => Object.keys(cat.vendors || {}).length === 1
    ).length;

    if (multiVendorCategories === 0 && singleVendorCategories > 0) {
      warnings.push(`Found ${singleVendorCategories} unique components, but none have pricing from multiple vendors. Matrix pricing requires 2+ vendors per component for price comparison.`);
    } else if (multiVendorCategories < singleVendorCategories) {
      warnings.push(`Only ${multiVendorCategories} of ${multiVendorCategories + singleVendorCategories} components have multi-vendor pricing. Consider consolidating similar component names.`);
    }

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
        if (item.currentAvgPrice === undefined || item.currentAvgPrice === null) warnings.push(`matrixPricing[${idx}] missing currentAvgPrice`);
        if (item.matrixPrice === undefined || item.matrixPrice === null) warnings.push(`matrixPricing[${idx}] missing matrixPrice`);
        if (item.potentialSavings === undefined || item.potentialSavings === null) warnings.push(`matrixPricing[${idx}] missing potentialSavings`);
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      info,
      summary: {
        vendors: Object.keys(data.vendors || {}).length,
        components: (data.components || []).length,
        matrixCategories: Array.isArray(data.matrixPricing) ? data.matrixPricing.length : 0,
        totalSpend: data.metadata?.totalSpend || 0,
        totalCases: data.metadata?.totalCases || 0,
        multiVendorCategories,
        singleVendorCategories
      },
      matrixDetails: {
        topCategories: matrixCategories.slice(0, 10),
        allCategories: matrixCategories.length
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

  // Save data directly to public/ folder via API
  const saveData = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      const response = await fetch('/api/save-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: processedData,
          productLine: productLine
        })
      });

      const result = await response.json();

      if (response.ok) {
        setSaveSuccess(true);
        const filename = productLine === 'shoulder' ? 'shoulder-data.json' : 'hip-knee-data.json';
        alert(`✓ Data saved successfully!\n\nFile: public/data/${filename}\n\nNext steps:\n1. Run: git add public/data/${filename}\n2. Run: git commit -m "Update ${productLine} data"\n3. Run: git push`);
      } else {
        throw new Error(result.error || 'Failed to save data');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert(`✗ Error saving data: ${error.message}\n\nFalling back to manual download...`);
      // Fallback to download
      downloadJSON();
    } finally {
      setSaving(false);
    }
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
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  File loaded: {rawData.length} rows
                </p>
              </div>

              {/* Column Detection Results */}
              {detectedColumns && columnMapping && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    Column Detection
                  </h3>

                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    {Object.entries({
                      vendor: 'Vendor',
                      component: 'Component',
                      quantity: 'Quantity',
                      price: 'Price',
                      surgeon: 'Surgeon (Optional)',
                      facility: 'Facility/Hospital (Optional)',
                      region: 'Region (Optional)',
                    }).map(([field, label]) => {
                      const mapped = columnMapping[field];
                      const isMissing = !mapped && !['surgeon', 'procedureType', 'bodyPart', 'facility', 'region'].includes(field);

                      return (
                        <div key={field} className={`flex items-center justify-between p-2 rounded ${
                          isMissing ? 'bg-red-100' : 'bg-white'
                        }`}>
                          <span className="font-medium text-gray-700">{label}:</span>
                          <span className={`${isMissing ? 'text-red-700' : 'text-green-700'} font-mono text-xs`}>
                            {mapped || '❌ Not Found'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Show unmapped required fields warning */}
                  {(!columnMapping.vendor || !columnMapping.component || !columnMapping.quantity || !columnMapping.price) && (
                    <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded text-sm text-red-800">
                      <AlertCircle className="inline w-4 h-4 mr-1" />
                      <strong>Warning:</strong> Some required columns were not detected.
                      Please ensure your file has columns for: Vendor, Component, Quantity, and Price.
                      The tool will use default values (0 or "Unknown") for missing data.
                    </div>
                  )}

                  {/* Show detected columns list */}
                  <details className="mt-3">
                    <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                      All detected columns ({detectedColumns.length})
                    </summary>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {detectedColumns.map(col => (
                        <span key={col} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                          {col}
                        </span>
                      ))}
                    </div>
                  </details>

                  {/* Sample Data Preview */}
                  {rawData.length > 0 && (
                    <details className="mt-3">
                      <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                        Sample data (first 3 rows)
                      </summary>
                      <div className="mt-2 overflow-x-auto">
                        <table className="min-w-full text-xs border border-gray-300">
                          <thead className="bg-gray-100">
                            <tr>
                              {detectedColumns.slice(0, 10).map(col => (
                                <th key={col} className="px-2 py-1 border text-left">{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {rawData.slice(0, 3).map((row, idx) => (
                              <tr key={idx} className="border-t">
                                {detectedColumns.slice(0, 10).map(col => (
                                  <td key={col} className="px-2 py-1 border">{String(row[col] || '').substring(0, 30)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  )}
                </div>
              )}
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

                {validationResults.info && validationResults.info.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="font-semibold text-blue-800 mb-2">ℹ️ Methodology:</p>
                    <ul className="list-disc list-inside text-blue-700 text-sm space-y-1">
                      {validationResults.info.map((info, idx) => (
                        <li key={idx}>{info}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Component Grouping Report */}
                {validationResults.summary.multiVendorCategories !== undefined && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      Component Normalization Report
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div className="bg-white rounded-lg p-3 border-2 border-green-300">
                        <div className="text-sm text-gray-600 mb-1">Multi-Vendor Components</div>
                        <div className="text-2xl font-bold text-green-700">
                          {validationResults.summary.multiVendorCategories}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ✓ Can create matrix pricing (2+ vendors)
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border-2 border-gray-300">
                        <div className="text-sm text-gray-600 mb-1">Single-Vendor Components</div>
                        <div className="text-2xl font-bold text-gray-700">
                          {validationResults.summary.singleVendorCategories}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ✗ Cannot compare prices (only 1 vendor)
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-blue-800">
                      <strong>Component names were automatically normalized</strong> to group similar items
                      (e.g., "Hip Cup 32mm" + "HIP CUP SIZE 32" → "ACETABULAR CUP"). This increased
                      matrix categories from potentially hundreds to {validationResults.summary.matrixCategories} comparable groups.
                    </div>

                    {/* Top Matrix Categories */}
                    {validationResults.matrixDetails?.topCategories && validationResults.matrixDetails.topCategories.length > 0 && (
                      <details className="mt-3">
                        <summary className="text-xs text-blue-700 cursor-pointer hover:text-blue-900 font-semibold">
                          View Top Matrix Categories ({validationResults.matrixDetails.topCategories.length} of {validationResults.matrixDetails.allCategories})
                        </summary>
                        <div className="mt-2 space-y-2">
                          {validationResults.matrixDetails.topCategories.map((cat, idx) => (
                            <div key={idx} className="bg-white rounded p-2 text-xs border border-blue-200">
                              <div className="flex justify-between items-start">
                                <span className="font-semibold text-gray-900">{cat.category}</span>
                                <span className="text-green-700 font-bold">
                                  ${(cat.potentialSavings / 1000).toFixed(1)}K savings
                                </span>
                              </div>
                              <div className="text-gray-600 mt-1">
                                Current: ${cat.currentAvgPrice.toLocaleString()} →
                                Target: ${cat.matrixPrice.toLocaleString()}
                                ({((1 - cat.matrixPrice / cat.currentAvgPrice) * 100).toFixed(1)}% reduction)
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
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
                    disabled={saving}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                      saveSuccess
                        ? 'bg-green-700 text-white'
                        : saving
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : saveSuccess ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Saved to public/
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save to public/
                      </>
                    )}
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
