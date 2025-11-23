import React from 'react';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface InfoTooltipProps {
  content: string;
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ content, className = '' }) => {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info
            className={`inline-block w-4 h-4 text-blue-500 hover:text-blue-700 cursor-help ml-1 ${className}`}
          />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-gray-900 text-white p-3 rounded-lg shadow-lg">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
