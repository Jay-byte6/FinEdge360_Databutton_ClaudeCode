/**
 * Formats a number into Indian currency shorthand format
 * Examples:
 * 5000 -> "5 Thousand"
 * 50000 -> "50 Thousand"
 * 100000 -> "1 Lakh"
 * 5000000 -> "50 Lakhs"
 * 10000000 -> "1 Crore"
 * 50000000 -> "5 Crores"
 */
export const formatIndianNumber = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num) || num === 0) {
    return '';
  }

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 10000000) {
    // Crores (1 crore = 10,000,000)
    const crores = absNum / 10000000;
    return `${sign}${crores.toFixed(2)} Crore${crores !== 1 ? 's' : ''}`;
  } else if (absNum >= 100000) {
    // Lakhs (1 lakh = 100,000)
    const lakhs = absNum / 100000;
    return `${sign}${lakhs.toFixed(2)} Lakh${lakhs !== 1 ? 's' : ''}`;
  } else if (absNum >= 1000) {
    // Thousands
    const thousands = absNum / 1000;
    return `${sign}${thousands.toFixed(2)} Thousand`;
  } else {
    // Less than 1000
    return `${sign}${absNum.toFixed(2)}`;
  }
};

/**
 * Formats a number with Indian numbering system (commas)
 * Examples:
 * 1000 -> "1,000"
 * 100000 -> "1,00,000"
 * 10000000 -> "1,00,00,000"
 */
export const formatIndianCurrency = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return '0';
  }

  return num.toLocaleString('en-IN');
};
