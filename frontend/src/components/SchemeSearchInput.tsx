import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

interface Scheme {
  scheme_code: string;
  scheme_name: string;
  amc_name: string;
  category: string;
}

interface Props {
  onSelect: (scheme: Scheme) => void;
  placeholder?: string;
}

export const SchemeSearchInput = ({ onSelect, placeholder = "Search mutual fund schemes..." }: Props) => {
  const [query, setQuery] = useState('');
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced search effect
  useEffect(() => {
    if (query.length < 2) {
      setSchemes([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `${API_ENDPOINTS.baseUrl}/routes/search-schemes?query=${encodeURIComponent(query)}&limit=20`
        );

        if (response.ok) {
          const data = await response.json();
          setSchemes(data.schemes || []);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Failed to search schemes:', error);
        setSchemes([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (scheme: Scheme) => {
    setSelectedScheme(scheme);
    setQuery(scheme.scheme_name);
    setIsOpen(false);
    onSelect(scheme);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedScheme(null);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => query.length >= 2 && schemes.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && schemes.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {schemes.map((scheme) => (
            <div
              key={scheme.scheme_code}
              onClick={() => handleSelect(scheme)}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-sm text-gray-900 mb-1">
                {scheme.scheme_name}
              </div>
              <div className="text-xs text-gray-500">
                {scheme.amc_name && <span>{scheme.amc_name}</span>}
                {scheme.amc_name && scheme.category && <span className="mx-1">•</span>}
                {scheme.category && <span>{scheme.category}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {isOpen && !isLoading && schemes.length === 0 && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center">
          <p className="text-sm text-gray-500">No schemes found</p>
        </div>
      )}
    </div>
  );
};
