import React from 'react';
import { Polyline } from 'react-leaflet';
import L from 'leaflet';
import { PathResult } from '../../algorithms/dijkstra';
import { Building } from '../../algorithms/graph';
import LocationMarker from '../LocationMarker/LocationMarker';
import { buildingToLatLng } from '../../utils/mapUtils';

interface RouteDisplayProps {
  route: PathResult | null;
  showWaypoints?: boolean;
  selectedBuilding?: Building | null;
  onWaypointClick?: (building: Building) => void;
}

function RouteDisplay({
  route,
  showWaypoints = true,
  selectedBuilding,
  onWaypointClick,
}: RouteDisplayProps) {
  if (!route || route.buildings.length === 0) {
    return null;
  }

  const coordinates = route.buildings.map((b) => buildingToLatLng(b));

  const getWeightedColor = (index: number) => {
    const { length } = route.buildings;
    if (index === 0) return '#22c55e';
    if (index === length - 1) return '#ef4444';

    const ratio = index / length;
    const r = Math.round(34 + ratio * (239 - 34));
    const g = Math.round(197 + ratio * (68 - 197));
    const b = Math.round(94 + ratio * (68 - 94));
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <>
      {coordinates.slice(0, -1).map((coord, index) => (
        <Polyline
          key={`segment-${index}`}
          positions={[
            coordinates[index] as L.LatLngExpression,
            coordinates[index + 1] as L.LatLngExpression,
          ]}
          color={getWeightedColor(index)}
          weight={6}
          opacity={0.9}
          lineCap="round"
          lineJoin="round"
        />
      ))}

      <Polyline
        positions={coordinates}
        color="#22c55e"
        weight={3}
        opacity={0.3}
        dashArray="10, 10"
        lineCap="round"
        lineJoin="round"
      />

      {selectedBuilding &&
        !route.buildings.some((b) => b.id === selectedBuilding.id) && (
          <LocationMarker
            building={selectedBuilding}
            type="building"
            isSelected
            onClick={onWaypointClick}
          />
        )}
    </>
  );
}

interface RouteInstructionsProps {
  route: PathResult;
  currentStep?: number;
  onStepClick?: (index: number) => void;
}

function RouteInstructions({
  route,
  currentStep = 0,
  onStepClick,
}: RouteInstructionsProps) {
  return (
    <div className="space-y-2">
      {route.buildings.map((building, index) => {
        const isStart = index === 0;
        const isEnd = index === route.buildings.length - 1;
        const isActive = index === currentStep;

        return (
          <button
            key={building.id}
            onClick={() => {
              if (onStepClick) {
                onStepClick(index);
              }
            }}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              isActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  isStart
                    ? 'bg-green-500 text-white'
                    : isEnd
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                }`}
              >
                {isStart ? 'S' : isEnd ? 'E' : index}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{building.name}</p>
                <p className="text-sm text-gray-500">{building.description}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default RouteDisplay;
export { RouteDisplay, RouteInstructions };
