import React, { useState, useRef, useEffect } from 'react';
import { MapPin, X, ArrowRight, Navigation } from 'lucide-react';
import { Building } from '../../algorithms/graph';
import { useNavigation } from '../../context/NavigationContext';
import navigationService from '../../services/navigationService';
import { debounce, sortBuildingsByName } from '../../utils/helpers';

interface SearchBarProps {
  onSelectBuilding?: (building: Building) => void;
  placeholder?: string;
  type: 'start' | 'end';
}

function SearchBar({ onSelectBuilding, placeholder, type }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Building[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { startBuilding, endBuilding, setStartBuilding, setEndBuilding } = useNavigation();

  const currentValue = type === 'start' ? startBuilding : endBuilding;
  const setBuilding = type === 'start' ? setStartBuilding : setEndBuilding;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const debouncedSearch = debounce((searchQuery: string) => {
    const searchResults = navigationService.searchLocations(searchQuery);
    setResults(sortBuildingsByName(searchResults).slice(0, 8));
    setHighlightedIndex(0);
  }, 150);

  useEffect(() => {
    if (query.trim()) {
      debouncedSearch(query);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSelectBuilding = (building: Building) => {
    setBuilding(building);
    setQuery(building.name);
    setIsOpen(false);
    if (onSelectBuilding) {
      onSelectBuilding(building);
    }
  };

  const handleClear = () => {
    setBuilding(null);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[highlightedIndex]) {
          handleSelectBuilding(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const defaultPlaceholder =
    type === 'start' ? 'Enter starting point...' : 'Enter destination...';

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <div className="absolute left-3 text-gray-400">
          {type === 'start' ? (
            <Navigation className="w-5 h-5" />
          ) : (
            <MapPin className="w-5 h-5" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={currentValue ? currentValue.name : query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim()) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || defaultPlaceholder}
          className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
        />
        {currentValue ? (
          <button
            onClick={handleClear}
            className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        ) : null}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-80 overflow-y-auto">
          {results.map((building, index) => (
            <button
              key={building.id}
              onClick={() => handleSelectBuilding(building)}
              className={`w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors flex items-center gap-3 ${
                index === highlightedIndex ? 'bg-primary-50' : ''
              } ${index > 0 ? 'border-t border-gray-100' : ''}`}
            >
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {building.name}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {building.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface DualSearchBarProps {
  onFindRoute?: () => void;
}

function DualSearchBar({ onFindRoute }: DualSearchBarProps) {
  const { startBuilding, endBuilding, swapBuildings } = useNavigation();

  return (
    <div className="space-y-4">
      <SearchBar type="start" />
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 border-r-2 border-l-2 border-gray-300 border-dashed -mx-4 self-center"></div>
        <button
          onClick={swapBuildings}
          className="p-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          title="Swap locations"
        >
          <ArrowRight className="w-4 h-4 text-gray-600 rotate-90" />
        </button>
      </div>
      <SearchBar type="end" />
      {startBuilding && endBuilding && (
        <button
          onClick={onFindRoute}
          className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <Navigation className="w-5 h-5" />
          <span>Find Route</span>
        </button>
      )}
    </div>
  );
}

export default SearchBar;
export { SearchBar, DualSearchBar };
