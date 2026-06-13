import L from 'leaflet';
import { Building, PathResult } from '../algorithms/dijkstra';

export const FUPRE_BOUNDS = {
  north: 5.558,
  south: 5.550,
  east: 5.767,
  west: 5.758,
};

export const FUPRE_CENTER: L.LatLngExpression = [5.5535, 5.762];

export const DEFAULT_ZOOM = 16;

export const buildingIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all">
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-4 0H8m4 0v3.5M8 21v-3.5m0 0a3.5 3.5 0 110-7 3.5 3.5 0 010 7z" />
    </svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

export const startPointIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-3 border-white animate-pulse transition-all">
    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

export const endPointIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-3 border-white transition-all">
    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

export const userLocationIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all relative">
    <div class="w-3 h-3 bg-blue-300 rounded-full animate-ping absolute"></div>
    <div class="w-2 h-2 bg-white rounded-full relative z-10"></div>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

export function buildingToLatLng(building: Building): L.LatLngExpression {
  return [building.lat, building.lng];
}

export function pathToCoordinates(path: PathResult): L.LatLngExpression[] {
  return path.buildings.map((building) => [building.lat, building.lng] as L.LatLngExpression);
}

export function createRoutePolyline(
  coordinates: L.LatLngExpression[],
  options?: L.PolylineOptions
): L.Polyline {
  const defaultOptions: L.PolylineOptions = {
    color: '#22c55e',
    weight: 6,
    opacity: 0.8,
    smoothFactor: 1,
    lineJoin: 'round',
  };

  return L.polyline(coordinates, { ...defaultOptions, ...options });
}

export function calculateRouteDuration(
  distanceInMeters: number,
  walkingSpeedKmh: number = 5
): number {
  const walkingSpeedMs = (walkingSpeedKmh * 1000) / 3600;
  return Math.ceil(distanceInMeters / walkingSpeedMs);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} sec`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) {
    return `${minutes} min`;
  }
  return `${minutes} min ${remainingSeconds} sec`;
}

export function getBoundsForBuilding(building: Building): L.LatLngBounds {
  const offset = 0.002;
  return L.latLngBounds(
    [building.lat - offset, building.lng - offset],
    [building.lat + offset, building.lng + offset]
  );
}

export function getBoundsForRoute(path: PathResult): L.LatLngBounds {
  const coords = path.buildings.map((b) => [b.lat, b.lng] as L.LatLngTuple);
  return L.latLngBounds(coords);
}
