/**
 * Utility functions for consistent formatting across the application
 */

/**
 * Format currency values with proper comma separators and optional millions notation
 * @param {number} value - The value to format
 * @param {object} options - Formatting options
 * @param {boolean} options.millions - Convert to millions (e.g., $5.2M)
 * @param {number} options.decimals - Number of decimal places (default: 1 for millions, 0 for regular)
 * @param {boolean} options.compact - Use compact notation without M suffix
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, options = {}) => {
  const { millions = false, decimals = millions ? 1 : 0, compact = false } = options;

  if (value === null || value === undefined || isNaN(value)) {
    return '$0';
  }

  if (millions) {
    const millionValue = value / 1000000;
    const formatted = millionValue.toFixed(decimals);
    return compact ? `$${formatted}` : `$${formatted}M`;
  }

  // Regular currency formatting with commas
  return `$${value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

/**
 * Format numbers with comma separators
 * @param {number} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted number string
 */
export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  return value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format percentage values
 * @param {number} value - The value to format (as decimal, e.g., 0.15 for 15%)
 * @param {number} decimals - Number of decimal places (default: 1)
 * @param {boolean} isAlreadyPercent - If true, value is already in percent form (e.g., 15 not 0.15)
 * @returns {string} Formatted percentage string
 */
export const formatPercent = (value, decimals = 1, isAlreadyPercent = false) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  const percentValue = isAlreadyPercent ? value : value * 100;
  return `${percentValue.toFixed(decimals)}%`;
};
