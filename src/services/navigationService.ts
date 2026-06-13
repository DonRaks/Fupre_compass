import { campusGraph, searchBuildings, getBuildingById, Building } from '../algorithms/graph';
import { dijkstra, PathResult } from '../algorithms/dijkstra';
import { calculateHaversineDistance } from '../algorithms/dijkstra';

class NavigationService {
  calculateRoute(startId: string, endId: string): PathResult | null {
    const startBuilding = getBuildingById(startId);
    const endBuilding = getBuildingById(endId);

    if (!startBuilding) {
      throw new Error(`Start building not found: ${startId}`);
    }

    if (!endBuilding) {
      throw new Error(`End building not found: ${endId}`);
    }

    if (startId === endId) {
      return {
        path: [startId],
        distance: 0,
        buildings: [startBuilding],
      };
    }

    return dijkstra(campusGraph, startId, endId);
  }

  searchLocations(query: string): Building[] {
    if (!query.trim()) {
      return campusGraph.getAllBuildings();
    }
    return searchBuildings(query);
  }

  getBuilding(id: string): Building | undefined {
    return getBuildingById(id);
  }

  getAllBuildings(): Building[] {
    return campusGraph.getAllBuildings();
  }

  getNearestBuilding(lat: number, lng: number): Building | null {
    let nearest: Building | null = null;
    let minDistance = Infinity;

    campusGraph.nodes.forEach((node) => {
      const distance = calculateHaversineDistance(
        lat,
        lng,
        node.building.lat,
        node.building.lng
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = node.building;
      }
    });

    return nearest;
  }

  getBuildingsWithinRadius(lat: number, lng: number, radiusMeters: number): Building[] {
    const results: Building[] = [];

    campusGraph.nodes.forEach((node) => {
      const distance = calculateHaversineDistance(
        lat,
        lng,
        node.building.lat,
        node.building.lng
      );

      if (distance <= radiusMeters) {
        results.push(node.building);
      }
    });

    return results;
  }

  calculateEstimatedTime(distanceMeters: number, walkingSpeedKmh: number = 5): number {
    const walkingSpeedMs = (walkingSpeedKmh * 1000) / 3600;
    return Math.ceil(distanceMeters / walkingSpeedMs);
  }

  getRouteSummary(route: PathResult): {
    distance: number;
    duration: number;
    buildingCount: number;
    waypoints: string[];
  } {
    return {
      distance: Math.round(route.distance),
      duration: this.calculateEstimatedTime(route.distance),
      buildingCount: route.buildings.length,
      waypoints: route.buildings.map((b) => b.name),
    };
  }

  validateRoute(startId: string, endId: string): { valid: boolean; error?: string } {
    if (!startId || !endId) {
      return { valid: false, error: 'Start and end locations are required' };
    }

    const startBuilding = this.getBuilding(startId);
    const endBuilding = this.getBuilding(endId);

    if (!startBuilding) {
      return { valid: false, error: `Invalid start location: ${startId}` };
    }

    if (!endBuilding) {
      return { valid: false, error: `Invalid end location: ${endId}` };
    }

    if (startId === endId) {
      return { valid: true };
    }

    const path = this.calculateRoute(startId, endId);
    if (!path) {
      return { valid: false, error: 'No route found between these locations' };
    }

    return { valid: true };
  }
}

export const navigationService = new NavigationService();

export type { Building, PathResult };

export default navigationService;
