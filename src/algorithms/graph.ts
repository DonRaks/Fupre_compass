import buildings from '../data/buildings.json';
import paths from '../data/paths.json';

export interface Building {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
  type: string;
}

export interface Path {
  id: string;
  from: string;
  to: string;
  distance: number;
  type: string;
  description: string;
}

export interface GraphNode {
  id: string;
  building: Building;
  neighbors: Map<string, number>;
}

export interface Graph {
  nodes: Map<string, GraphNode>;
  getNode(id: string): GraphNode | undefined;
  getDistance(from: string, to: string): number;
  getAllBuildings(): Building[];
}

export function createGraph(buildingsData: Building[], pathsData: Path[]): Graph {
  const nodes = new Map<string, GraphNode>();

  buildingsData.forEach((building) => {
    nodes.set(building.id, {
      id: building.id,
      building,
      neighbors: new Map<string, number>(),
    });
  });

  pathsData.forEach((path) => {
    const fromNode = nodes.get(path.from);
    const toNode = nodes.get(path.to);

    if (fromNode && toNode) {
      fromNode.neighbors.set(path.to, path.distance);
      toNode.neighbors.set(path.from, path.distance);
    }
  });

  return {
    nodes,

    getNode(id: string): GraphNode | undefined {
      return nodes.get(id);
    },

    getDistance(from: string, to: string): number {
      const fromNode = nodes.get(from);
      if (fromNode) {
        const dist = fromNode.neighbors.get(to);
        return dist ? dist : Infinity;
      }
      return Infinity;
    },

    getAllBuildings(): Building[] {
      return buildingsData;
    },
  };
}

export const campusGraph = createGraph(buildings as Building[], paths as Path[]);

export function getBuildingById(id: string): Building | undefined {
  return (buildings as Building[]).find((b) => b.id === id);
}

export function getBuildingByName(name: string): Building | undefined {
  return (buildings as Building[]).find(
    (b) => b.name.toLowerCase() === name.toLowerCase()
  );
}

export function searchBuildings(query: string): Building[] {
  const lowerQuery = query.toLowerCase();
  return (buildings as Building[]).filter(
    (b) =>
      b.name.toLowerCase().includes(lowerQuery) ||
      b.description.toLowerCase().includes(lowerQuery) ||
      b.type.toLowerCase().includes(lowerQuery)
  );
}

export default campusGraph;
