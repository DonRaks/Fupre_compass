import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Compass, Layers, Locate, Menu, X } from 'lucide-react';
import Map from '../components/Map/Map';
import Sidebar from '../components/Sidebar/Sidebar';
import { DualSearchBar } from '../components/SearchBar/SearchBar';
import LocationMarker, { BuildingMarker } from '../components/LocationMarker/LocationMarker';
import RouteDisplay from '../components/RouteDisplay/RouteDisplay';
import { useNavigation } from '../context/NavigationContext';
import { useLocation } from '../hooks/useLocation';
import navigationService from '../services/navigationService';
import { Building } from '../algorithms/graph';
import { FUPRE_CENTER } from '../utils/mapUtils';

function Home() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSearchPanel, setShowSearchPanel] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [buildings] = useState<Building[]>(navigationService.getAllBuildings());

  const {
    startBuilding,
    endBuilding,
    route,
    setRoute,
    error,
    setError,
    userLocation,
    setUserLocation,
  } = useNavigation();

  const { coordinates, getCurrentLocation, loading: locationLoading } = useLocation();

  useEffect(() => {
    if (coordinates) {
      setUserLocation(coordinates);
    }
  }, [coordinates, setUserLocation]);

  const handleFindRoute = useCallback(() => {
    if (!startBuilding || !endBuilding) {
      setError('Please select both start and end locations');
      return;
    }

    const result = navigationService.calculateRoute(startBuilding.id, endBuilding.id);

    if (result) {
      setRoute(result);
    } else {
      setError('No route found between these locations');
    }
  }, [startBuilding, endBuilding, setRoute, setError]);

  const handleBuildingClick = useCallback((building: Building) => {
    setSelectedBuilding(building);
  }, []);

  const handleLocateMe = useCallback(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-100">
      <div className="absolute inset-0">
        <Map center={FUPRE_CENTER} zoom={16}>
          {buildings.map((building) => {
            const isStart = startBuilding?.id === building.id;
            const isEnd = endBuilding?.id === building.id;
            const isOnRoute = route?.buildings.some((b) => b.id === building.id);
            const isWaypoint = isOnRoute && !isStart && !isEnd;

            if (isStart) {
              return (
                <LocationMarker
                  key={building.id}
                  building={building}
                  type="start"
                  onClick={handleBuildingClick}
                />
              );
            }

            if (isEnd) {
              return (
                <LocationMarker
                  key={building.id}
                  building={building}
                  type="end"
                  onClick={handleBuildingClick}
                />
              );
            }

            if (isWaypoint) {
              return (
                <BuildingMarker
                  key={building.id}
                  building={building}
                  onClick={handleBuildingClick}
                  isStart={false}
                  isEnd={false}
                  isSelected={selectedBuilding?.id === building.id}
                />
              );
            }

            return (
              <BuildingMarker
                key={building.id}
                building={building}
                onClick={handleBuildingClick}
              />
            );
          })}

          {userLocation && <LocationMarker coordinates={userLocation} type="user" />}

          <RouteDisplay
            route={route}
            showWaypoints={true}
            selectedBuilding={selectedBuilding}
            onWaypointClick={handleBuildingClick}
          />
        </Map>
      </div>

      <div className="absolute top-0 left-0 right-0 z-[1000] pointer-events-none">
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="pointer-events-auto">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="bg-white p-3 rounded-xl shadow-lg hover:bg-gray-50 transition-colors"
              title={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
            >
              {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
            <button
              onClick={handleLocateMe}
              disabled={locationLoading}
              className="bg-white px-4 py-3 rounded-xl shadow-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
              title="My location"
            >
              <Locate className={`w-5 h-5 ${locationLoading ? 'animate-pulse' : ''}`} />
              <span className="text-sm font-medium text-gray-900">My Location</span>
            </button>
          </div>
        </div>
      </div>

      <div className="absolute right-4 bottom-24 z-[1000]">
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setShowSearchPanel(!showSearchPanel)}
            className="bg-white p-3 rounded-xl shadow-lg hover:bg-gray-50 transition-colors"
            title={showSearchPanel ? 'Hide search' : 'Show search'}
          >
            <Compass className="w-5 h-5" />
          </button>
          <button
            className="bg-white p-3 rounded-xl shadow-lg hover:bg-gray-50 transition-colors"
            title="Map layers"
          >
            <Layers className="w-5 h-5" />
          </button>
        </div>
      </div>

      <Sidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        onBuildingClick={handleBuildingClick}
      />

      <div
        className={`absolute top-20 left-0 right-0 z-[1000] pointer-events-none transition-all duration-300 ${
          showSearchPanel ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="mx-4 pointer-events-auto">
          <div
            className={`bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto ml-auto mr-4 transition-opacity duration-300 ${
              route ? 'opacity-0 pointer-events-none' : ''
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">FUPRE Navigator</h2>
                <p className="text-sm text-gray-500">Campus Navigation System</p>
              </div>
            </div>
            <DualSearchBar onFindRoute={handleFindRoute} />
          </div>
        </div>
      </div>

      {error && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-[1000]">
          <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <X className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {route && userLocation && (
        <div className="absolute top-20 right-4 z-[1000]">
          <div className="bg-white rounded-xl shadow-lg p-4 max-w-xs">
            <div className="flex items-center gap-3 mb-3">
              <Locate className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Your Location</p>
                <p className="text-sm text-gray-500">
                  {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
