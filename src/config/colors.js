/**
 * Centralized Color Palette
 *
 * Consistent color system used across the Value Analytics Hub.
 * All components should reference these colors for consistency.
 */

export const COLORS = {
  // Primary Brand Colors
  primary: {
    main: 'blue-600',
    light: 'blue-50',
    dark: 'blue-900',
    border: 'blue-200',
    gradient: 'from-blue-600 to-blue-700',
    ring: 'ring-blue-200'
  },

  // Secondary/Accent Colors
  secondary: {
    main: 'purple-600',
    light: 'purple-50',
    dark: 'purple-900',
    border: 'purple-200',
    gradient: 'from-purple-600 to-purple-700',
    ring: 'ring-purple-200'
  },

  // Status Colors
  status: {
    success: {
      main: 'green-600',
      light: 'green-50',
      dark: 'green-900',
      border: 'green-200'
    },
    warning: {
      main: 'yellow-600',
      light: 'yellow-50',
      dark: 'yellow-900',
      border: 'yellow-200'
    },
    error: {
      main: 'red-600',
      light: 'red-50',
      dark: 'red-900',
      border: 'red-200'
    },
    info: {
      main: 'blue-600',
      light: 'blue-50',
      dark: 'blue-900',
      border: 'blue-200'
    }
  },

  // Workflow Stage Colors
  workflow: {
    active: {
      bg: 'bg-blue-500',
      border: 'border-blue-600',
      ring: 'ring-blue-200',
      text: 'text-blue-900',
      lightBg: 'bg-blue-50'
    },
    completed: {
      bg: 'bg-green-500',
      border: 'border-green-600',
      text: 'text-green-900',
      lightBg: 'bg-green-50'
    },
    upcoming: {
      bg: 'bg-gray-300',
      border: 'border-gray-400',
      text: 'text-gray-600',
      lightBg: 'bg-gray-50'
    }
  },

  // Chart/Visualization Colors (8-color palette for consistency)
  chart: {
    primary: '#3B82F6',    // blue-500
    secondary: '#8B5CF6',  // purple-500
    success: '#10B981',    // green-500
    warning: '#F59E0B',    // yellow-500
    danger: '#EF4444',     // red-500
    info: '#06B6D4',       // cyan-500
    neutral: '#6B7280',    // gray-500
    accent: '#EC4899'      // pink-500
  },

  // Vendor Colors (for consistent vendor representation)
  vendors: {
    'Stryker': {
      main: 'blue-600',
      light: 'blue-50',
      text: 'text-blue-900',
      bg: 'bg-blue-500'
    },
    'Zimmer Biomet': {
      main: 'purple-600',
      light: 'purple-50',
      text: 'text-purple-900',
      bg: 'bg-purple-500'
    },
    'Johnson & Johnson': {
      main: 'red-600',
      light: 'red-50',
      text: 'text-red-900',
      bg: 'bg-red-500'
    },
    'Smith & Nephew': {
      main: 'green-600',
      light: 'green-50',
      text: 'text-green-900',
      bg: 'bg-green-500'
    },
    'Other': {
      main: 'gray-600',
      light: 'gray-50',
      text: 'text-gray-900',
      bg: 'bg-gray-500'
    }
  },

  // Metric Cards
  metrics: {
    financial: {
      gradient: 'from-green-600 to-green-700',
      light: 'green-50',
      border: 'green-200',
      text: 'text-green-900',
      icon: 'text-green-600'
    },
    clinical: {
      gradient: 'from-blue-600 to-blue-700',
      light: 'blue-50',
      border: 'blue-200',
      text: 'text-blue-900',
      icon: 'text-blue-600'
    },
    operational: {
      gradient: 'from-purple-600 to-purple-700',
      light: 'purple-50',
      border: 'purple-200',
      text: 'text-purple-900',
      icon: 'text-purple-600'
    },
    risk: {
      gradient: 'from-orange-600 to-orange-700',
      light: 'orange-50',
      border: 'orange-200',
      text: 'text-orange-900',
      icon: 'text-orange-600'
    }
  },

  // Risk Levels
  risk: {
    low: {
      main: 'green-600',
      light: 'green-50',
      text: 'text-green-900',
      bg: 'bg-green-500'
    },
    medium: {
      main: 'yellow-600',
      light: 'yellow-50',
      text: 'text-yellow-900',
      bg: 'bg-yellow-500'
    },
    high: {
      main: 'red-600',
      light: 'red-50',
      text: 'text-red-900',
      bg: 'bg-red-500'
    }
  },

  // Neutral/UI Colors
  neutral: {
    white: 'white',
    gray50: 'gray-50',
    gray100: 'gray-100',
    gray200: 'gray-200',
    gray300: 'gray-300',
    gray400: 'gray-400',
    gray500: 'gray-500',
    gray600: 'gray-600',
    gray700: 'gray-700',
    gray800: 'gray-800',
    gray900: 'gray-900',
    black: 'black'
  }
};

// Helper function to get Tailwind classes
export const getColorClass = (category, subcategory, property = 'bg') => {
  try {
    const color = COLORS[category][subcategory];
    if (typeof color === 'string') {
      return `${property}-${color}`;
    }
    if (color[property]) {
      return color[property];
    }
    if (color.main) {
      return `${property}-${color.main}`;
    }
    return '';
  } catch {
    return '';
  }
};

export default COLORS;
