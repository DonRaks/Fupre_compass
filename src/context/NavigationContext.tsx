import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Building } from '../algorithms/graph';
import { PathResult } from '../algorithms/dijkstra';

interface NavigationState {
  startBuilding: Building | null;
  endBuilding: Building | null;
  route: PathResult | null;
  isCalculating: boolean;
  error: string | null;
}

interface NavigationContextType extends NavigationState {
  setStartBuilding: (building: Building | null) => void;
  setEndBuilding: (building: Building | null) => void;
  setRoute: (route: PathResult | null) => void;
  clearRoute: () => void;
  swapBuildings: () => void;
  setError: (error: string | null) => void;
  userLocation: { lat: number; lng: number } | null;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NavigationState>({
    startBuilding: null,
    endBuilding: null,
    route: null,
    isCalculating: false,
    error: null,
  });

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const setStartBuilding = useCallback((building: Building | null) => {
    setState((prev) => ({
      ...prev,
      startBuilding: building,
      route: null,
      error: null,
    }));
  }, []);

  const setEndBuilding = useCallback((building: Building | null) => {
    setState((prev) => ({
      ...prev,
      endBuilding: building,
      route: null,
      error: null,
    }));
  }, []);

  const setRoute = useCallback((route: PathResult | null) => {
    setState((prev) => ({
      ...prev,
      route,
      isCalculating: false,
      error: null,
    }));
  }, []);

  const clearRoute = useCallback(() => {
    setState((prev) => ({
      ...prev,
      startBuilding: null,
      endBuilding: null,
      route: null,
      error: null,
    }));
  }, []);

  const swapBuildings = useCallback(() => {
    setState((prev) => ({
      ...prev,
      startBuilding: prev.endBuilding,
      endBuilding: prev.startBuilding,
      route: null,
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({
      ...prev,
      error,
      isCalculating: false,
    }));
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        ...state,
        setStartBuilding,
        setEndBuilding,
        setRoute,
        clearRoute,
        swapBuildings,
        setError,
        userLocation,
        setUserLocation,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextType {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

export default NavigationContext;
