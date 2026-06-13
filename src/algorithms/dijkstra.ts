import { campusGraph, Graph, GraphNode, Building } from './graph';

interface PathResult {
  path: string[];
  distance: number;
  buildings: Building[];
}

interface PriorityQueueItem {
  id: string;
  distance: number;
}

class PriorityQueue {
  private items: PriorityQueueItem[] = [];

  enqueue(item: PriorityQueueItem): void {
    let added = false;
    for (let i = 0; i < this.items.length; i++) {
      if (item.distance < this.items[i].distance) {
        this.items.splice(i, 0, item);
        added = true;
        break;
      }
    }
    if (!added) {
      this.items.push(item);
    }
  }

  dequeue(): PriorityQueueItem | undefined {
    return this.items.shift();
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  contains(id: string): boolean {
    return this.items.some((item) => item.id === id);
  }

  update(id: string, newDistance: number): void {
    const index = this.items.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.items[index].distance = newDistance;
      this.items.sort((a, b) => a.distance - b.distance);
    }
  }
}

export function dijkstra(
  graph: Graph,
  startId: string,
  endId: string
): PathResult | null {
  const startNode = graph.getNode(startId);
  const endNode = graph.getNode(endId);

  if (!startNode || !endNode) {
    console.error('Start or end node not found');
    return null;
  }

  if (startId === endId) {
    return {
      path: [startId],
      distance: 0,
      buildings: [startNode.building],
    };
  }

  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();
  const pq = new PriorityQueue();

  graph.nodes.forEach((_, id) => {
    distances.set(id, Infinity);
    previous.set(id, null);
  });

  distances.set(startId, 0);
  pq.enqueue({ id: startId, distance: 0 });

  while (!pq.isEmpty()) {
    const current = pq.dequeue();

    if (!current) break;

    if (visited.has(current.id)) continue;

    visited.add(current.id);

    if (current.id === endId) {
      break;
    }

    const currentNode = graph.getNode(current.id);
    if (!currentNode) continue;

    currentNode.neighbors.forEach((distance, neighborId) => {
      if (visited.has(neighborId)) return;

      const altDistance = distances.get(current.id)! + distance;

      if (altDistance < distances.get(neighborId)!) {
        distances.set(neighborId, altDistance);
        previous.set(neighborId, current.id);

        if (!pq.contains(neighborId)) {
          pq.enqueue({ id: neighborId, distance: altDistance });
        } else {
          pq.update(neighborId, altDistance);
        }
      }
    });
  }

  if (distances.get(endId) === Infinity) {
    return null;
  }

  const path: string[] = [];
  let current: string | null = endId;

  while (current !== null) {
    path.unshift(current);
    current = previous.get(current) ?? null;
  }

  const buildings = path
    .map((id) => graph.getNode(id)?.building)
    .filter((b): b is Building => b !== undefined);

  return {
    path,
    distance: distances.get(endId)!,
    buildings,
  };
}

export function findAllPaths(
  graph: Graph,
  startId: string,
  endId: string,
  maxPaths: number = 3
): PathResult[] {
  const results: PathResult[] = [];

  const mainPath = dijkstra(graph, startId, endId);
  if (mainPath) {
    results.push(mainPath);
  }

  return results;
}

export function getNearestBuilding(
  graph: Graph,
  lat: number,
  lng: number
): Building | null {
  let nearest: Building | null = null;
  let minDistance = Infinity;

  graph.nodes.forEach((node) => {
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

export function calculateHaversineDistance(
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

export { campusGraph, type PathResult };
