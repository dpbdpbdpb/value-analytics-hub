# Value Analytics Hub - Color Palette Guide

## Primary Brand Colors

### Blue (Primary)
- **Use for**: Primary actions, active states, primary CTAs, navigation highlights
- **Main**: `blue-600` (#2563EB)
- **Light Background**: `blue-50`
- **Dark Text**: `blue-900`
- **Border**: `blue-200`
- **Gradient**: `from-blue-600 to-blue-700`

### Purple (Secondary/Accent)
- **Use for**: Secondary actions, accents, highlights, complementary elements
- **Main**: `purple-600` (#9333EA)
- **Light Background**: `purple-50`
- **Dark Text**: `purple-900`
- **Border**: `purple-200`
- **Gradient**: `from-purple-600 to-purple-700`

## Workflow Stage Colors

### Active Stage
- **Circle**: `bg-blue-500` with `border-blue-600`
- **Ring**: `ring-4 ring-blue-200`
- **Background**: `bg-blue-50`
- **Text**: `text-blue-900`
- **Badge**: `bg-blue-100 text-blue-700`

### Completed Stage
- **Circle**: `bg-green-500` with `border-green-600`
- **Background**: `bg-green-50`
- **Text**: `text-green-900`
- **Badge**: `bg-green-100 text-green-700`

### Upcoming Stage
- **Circle**: `bg-gray-300` with `border-gray-400`
- **Background**: `bg-gray-50`
- **Text**: `text-gray-600`
- **Badge**: `bg-gray-100 text-gray-700`

## Status Colors

### Success
- **Main**: `green-600`
- **Light**: `green-50`
- **Border**: `green-200`
- **Text**: `text-green-900`

### Warning
- **Main**: `yellow-600`
- **Light**: `yellow-50`
- **Border**: `yellow-200`
- **Text**: `text-yellow-900`

### Error/High Risk
- **Main**: `red-600`
- **Light**: `red-50`
- **Border**: `red-200`
- **Text**: `text-red-900`

### Info
- **Main**: `blue-600`
- **Light**: `blue-50`
- **Border**: `blue-200`
- **Text**: `text-blue-900`

## Vendor Colors

Use consistent colors for each vendor across all visualizations:

- **Stryker**: `blue-500` / `blue-600`
- **Zimmer Biomet**: `purple-500` / `purple-600`
- **Johnson & Johnson**: `red-500` / `red-600`
- **Smith & Nephew**: `green-500` / `green-600`
- **Other Vendors**: `gray-500` / `gray-600`

## Metric Cards

### Financial Metrics
- **Gradient**: `from-green-600 to-green-700`
- **Background**: `green-50`
- **Icon**: `text-green-600`

### Clinical Metrics
- **Gradient**: `from-blue-600 to-blue-700`
- **Background**: `blue-50`
- **Icon**: `text-blue-600`

### Operational Metrics
- **Gradient**: `from-purple-600 to-purple-700`
- **Background**: `purple-50`
- **Icon**: `text-purple-600`

### Risk Metrics
- **Gradient**: `from-orange-600 to-orange-700`
- **Background**: `orange-50`
- **Icon**: `text-orange-600`

## Chart Colors

For consistent data visualization (8-color palette):

1. `#3B82F6` - Blue (primary)
2. `#8B5CF6` - Purple (secondary)
3. `#10B981` - Green (success)
4. `#F59E0B` - Yellow (warning)
5. `#EF4444` - Red (danger)
6. `#06B6D4` - Cyan (info)
7. `#6B7280` - Gray (neutral)
8. `#EC4899` - Pink (accent)

## Usage Guidelines

1. **Primary actions/CTAs**: Always use `blue-600`
2. **Secondary actions**: Use `purple-600` or `gray-600`
3. **Success states**: Use `green-600`
4. **Warnings**: Use `yellow-600` or `orange-600`
5. **Errors/High risk**: Use `red-600`
6. **Active workflow stages**: Use `blue-500` with `blue-600` border
7. **Completed workflow stages**: Use `green-500` with `green-600` border

## Gradients

Prefer subtle gradients for hero sections and cards:
- Primary: `bg-gradient-to-r from-blue-50 to-purple-50`
- Success: `bg-gradient-to-r from-green-50 to-blue-50`
- Warning: `bg-gradient-to-r from-yellow-50 to-orange-50`

## Implementation

Import the centralized color palette:
```javascript
import COLORS from '../config/colors';
```

Reference in code:
```javascript
// For color classes
className={`bg-${COLORS.primary.main}`}

// Or use the helper function
className={getColorClass('primary', 'main', 'bg')}
```
