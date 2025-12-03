import React from 'react';
import { formatIndianNumber } from '@/utils/formatNumber';

interface FormattedNumberDisplayProps {
  value: number | string;
  className?: string;
}

export const FormattedNumberDisplay: React.FC<FormattedNumberDisplayProps> = ({
  value,
  className = ""
}) => {
  const formattedValue = formatIndianNumber(value);

  if (!formattedValue) {
    return null;
  }

  return (
    <div className={`text-xs text-gray-500 mt-1 italic ${className}`}>
      ≈ {formattedValue}
    </div>
  );
};
