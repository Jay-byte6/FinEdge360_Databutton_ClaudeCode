import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

interface DisclaimerAlertProps {
  type?: 'warning' | 'info';
  title: string;
  children: React.ReactNode;
}

const DisclaimerAlert: React.FC<DisclaimerAlertProps> = ({ type = 'warning', title, children }) => {
  const isWarning = type === 'warning';

  return (
    <div className={`${
      isWarning
        ? 'bg-yellow-50 border-yellow-400 text-yellow-900'
        : 'bg-blue-50 border-blue-400 text-blue-900'
    } border-l-4 p-4 mb-6 rounded-r-lg`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          {isWarning ? (
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          ) : (
            <Info className="h-5 w-5 text-blue-600" />
          )}
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-semibold mb-2">{title}</h3>
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerAlert;
