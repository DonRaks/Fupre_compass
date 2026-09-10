import { Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Building } from '../../algorithms/graph';
import { userLocationIcon } from '../../utils/mapUtils';
import { getBuildingIcon } from '../../utils/helpers';

interface BuildingMarkerProps {
  building: Building;
  onClick?: (building: Building) => void;
  isStart?: boolean;
  isEnd?: boolean;
  isSelected?: boolean;
}

function BuildingMarker({
  building,
  onClick,
  isStart = false,
  isEnd = false,
  isSelected = false,
}: BuildingMarkerProps) {
  const handleClick = (e: L.LeafletMouseEvent) => {
    e.originalEvent.stopPropagation();
    if (onClick) {
      onClick(building);
    }
  };

  const getMarkerColor = () => {
    if (isStart) return 'bg-green-500 border-green-600';
    if (isEnd) return 'bg-red-500 border-red-600';
    if (isSelected) return 'bg-primary-500 border-primary-600';
    return 'bg-primary-600 border-primary-700';
  };

  const customIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div class="marker-inner w-8 h-8 ${getMarkerColor()} rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all cursor-pointer">
      <span class="text-white text-sm">${getBuildingIcon(building.type)}</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

  return (
    <Marker
      position={[building.lat, building.lng]}
      icon={customIcon}
      bubblingMouseEvents={false}
      eventHandlers={{
        click: handleClick,
      }}
    >
      <Popup>
        <div className="p-2 min-w-48">
          <h3 className="font-semibold text-gray-900 mb-1">{building.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{building.description}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="px-2 py-0.5 bg-gray-100 rounded capitalize">
              {building.type}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onClick) {
                onClick(building);
              }
            }}
            className="mt-2 w-full px-3 py-1.5 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors"
          >
            Select building
          </button>
        </div>
      </Popup>
      <Tooltip
        direction="top"
        offset={[0, -20]}
        permanent={false}
      >
        {building.name}
      </Tooltip>
    </Marker>
  );
}

interface UserLocationMarkerProps {
  coordinates: { lat: number; lng: number };
  accuracy?: number;
}

function UserLocationMarker({ coordinates, accuracy }: UserLocationMarkerProps) {
  return (
    <Marker position={[coordinates.lat, coordinates.lng]} icon={userLocationIcon}>
      <Popup>
        <div className="p-2 min-w-32">
          <h3 className="font-semibold text-gray-900">Your Location</h3>
          {accuracy && (
            <p className="text-xs text-gray-500">Accuracy: {Math.round(accuracy)}m</p>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

interface LocationMarkerProps {
  building?: Building;
  coordinates?: { lat: number; lng: number };
  type?: 'building' | 'user' | 'start' | 'end';
  onClick?: (building: Building) => void;
  isSelected?: boolean;
}

function LocationMarker({
  building,
  coordinates,
  type = 'building',
  onClick,
  isSelected = false,
}: LocationMarkerProps) {
  if (building) {
    return (
      <BuildingMarker
        building={building}
        onClick={onClick}
        isStart={type === 'start'}
        isEnd={type === 'end'}
        isSelected={isSelected}
      />
    );
  }

  if (coordinates && type === 'user') {
    return <UserLocationMarker coordinates={coordinates} />;
  }

  return null;
}

export default LocationMarker;
export { BuildingMarker, UserLocationMarker };
