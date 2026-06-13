import React from 'react';
import { MapPin, Clock, Route, Volume2, VolumeX, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Building, PathResult } from '../../algorithms/dijkstra';
import RouteDisplay, { RouteInstructions } from '../RouteDisplay/RouteDisplay';
import { formatDistance, formatDuration, calculateRouteDuration } from '../../utils/mapUtils';
import { useNavigation } from '../../context/NavigationContext';
import { useSpeech } from '../../hooks/useSpeech';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onBuildingClick?: (building: Building) => void;
}

function Sidebar({ isOpen = true, onClose, onBuildingClick }: SidebarProps) {
  const { startBuilding, endBuilding, route, clearRoute } = useNavigation();
  const { narrateRoute, stop, isSpeaking: isNarrating } = useSpeech();

  if (!isOpen) return null;

  const handleNarrate = () => {
    if (route) {
      if (isNarrating) {
        stop();
      } else {
        narrateRoute(route);
      }
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="absolute top-4 left-4 z-[1000] w-96 max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 text-white">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Route className="w-5 h-5" />
            <h2 className="font-semibold text-lg">Navigation</h2>
          </div>
          <div className="flex items-center gap-2">
            {route && (
              <button
                onClick={handleNarrate}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title={isNarrating ? 'Stop narration' : 'Narrate route'}
              >
                {isNarrating ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <p className="text-sm text-white/80">FUPRE Campus Navigation</p>
      </div>

      {startBuilding && endBuilding && route ? (
        <RouteInfo
          route={route}
          startBuilding={startBuilding}
          endBuilding={endBuilding}
          onClear={clearRoute}
          onBuildingClick={onBuildingClick}
          onNarrate={handleNarrate}
          isNarrating={isNarrating}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Route className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">No Route Selected</h3>
          <p className="text-sm text-gray-500">
            Select start and end points from the search bar to find the shortest route
            across campus.
          </p>
        </div>
      )}
    </div>
  );
}

interface RouteInfoProps {
  route: PathResult;
  startBuilding: Building;
  endBuilding: Building;
  onClear?: () => void;
  onBuildingClick?: (building: Building) => void;
  onNarrate?: () => void;
  isNarrating?: boolean;
}

function RouteInfo({
  route,
  startBuilding,
  endBuilding,
  onClear,
  onBuildingClick,
  onNarrate,
  isNarrating = false,
}: RouteInfoProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const distance = Math.round(route.distance);
  const duration = calculateRouteDuration(distance);
  const stepCount = route.buildings.length;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-primary-50 rounded-xl">
            <div className="flex items-center justify-center gap-1 text-primary-600 mb-1">
              <MapPin className="w-4 h-4" />
            </div>
            <p className="text-xs text-gray-500">Distance</p>
            <p className="font-semibold text-gray-900">{formatDistance(distance)}</p>
          </div>

          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-xs text-gray-500">Duration</p>
            <p className="font-semibold text-gray-900">{formatDuration(duration)}</p>
          </div>

          <div className="text-center p-3 bg-amber-50 rounded-xl">
            <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
              <Route className="w-4 h-4" />
            </div>
            <p className="text-xs text-gray-500">Waypoints</p>
            <p className="font-semibold text-gray-900">{stepCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">From</p>
            <p className="font-medium text-gray-900 truncate">{startBuilding.name}</p>
          </div>
        </div>

        <div className="ml-1.5 h-4 border-l-2 border-dashed border-gray-300"></div>

        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">To</p>
            <p className="font-medium text-gray-900 truncate">{endBuilding.name}</p>
          </div>
        </div>

        {onClear && (
          <button
            onClick={onClear}
            className="w-full mt-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Clear Route
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium text-gray-900">Route Instructions</span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {isExpanded && (
          <div className="px-4 pb-4">
            <RouteInstructions route={route} onStepClick={() => {}} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
