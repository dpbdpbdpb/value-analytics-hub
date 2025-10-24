import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';

const ComingSoonBadge = ({ variant = 'default', message, className = '' }) => {
  const variants = {
    default: {
      bg: 'bg-blue-100',
      border: 'border-blue-300',
      text: 'text-blue-800',
      icon: Clock
    },
    warning: {
      bg: 'bg-orange-100',
      border: 'border-orange-300',
      text: 'text-orange-800',
      icon: AlertCircle
    },
    calculated: {
      bg: 'bg-purple-100',
      border: 'border-purple-300',
      text: 'text-purple-800',
      icon: AlertCircle
    }
  };

  const style = variants[variant] || variants.default;
  const Icon = style.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 ${style.bg} ${style.border} ${className}`}>
      <Icon className={style.text} size={14} />
      <span className={`text-xs font-semibold ${style.text}`}>
        {message || 'Coming Soon'}
      </span>
    </div>
  );
};

export const DataNotAvailable = ({ title, description, showIcon = true }) => {
  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
      {showIcon && <Clock className="w-12 h-12 text-blue-400 mx-auto mb-4" />}
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title || 'Data Not Available'}</h3>
      <p className="text-gray-600 mb-4">
        {description || 'This data will be available when integrated with your source systems.'}
      </p>
      <ComingSoonBadge message="Requires Additional Data Integration" />
    </div>
  );
};

export const CalculatedDataBadge = () => {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-100 border border-purple-300">
      <span className="text-xs font-semibold text-purple-800">Calculated</span>
    </div>
  );
};

export default ComingSoonBadge;
