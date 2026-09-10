import { Building } from '../algorithms/graph';

export function capitalizeWords(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

export function getBuildingIcon(type: string): string {
  const icons: Record<string, string> = {
    gate: '🚪',
    building: '🏢',
    hostel: '🏠',
    recreation: '⚽',
    utility: '⚙️',
    monument: '🏛️',
    garden: '🌳',
    museum: '🎨',
    infrastructure: '🏗️',
    default: '📍',
  };

  return icons[type] || icons.default;
}

export function sortBuildingsByName(buildings: Building[]): Building[] {
  return [...buildings].sort((a, b) => a.name.localeCompare(b.name));
}

export function groupBuildingsByType(buildings: Building[]): Record<string, Building[]> {
  return buildings.reduce(
    (acc, building) => {
      const type = building.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(building);
      return acc;
    },
    {} as Record<string, Building[]>
  );
}

export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function supportsGeolocation(): boolean {
  return 'geolocation' in navigator;
}

export function supportsSpeechSynthesis(): boolean {
  return 'speechSynthesis' in window;
}

export function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function calculateTotalDistance(buildings: Building[]): number {
  let total = 0;
  for (let i = 0; i < buildings.length - 1; i++) {
    total += getDistanceInMeters(
      buildings[i].lat,
      buildings[i].lng,
      buildings[i + 1].lat,
      buildings[i + 1].lng
    );
  }
  return total;
}
