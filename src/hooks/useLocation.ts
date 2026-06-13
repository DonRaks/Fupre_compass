import { useState, useEffect, useCallback } from 'react';
import { supportsGeolocation } from '../utils/helpers';

interface LocationState {
  coordinates: { lat: number; lng: number } | null;
  error: string | null;
  loading: boolean;
}

interface UseLocationReturn extends LocationState {
  getCurrentLocation: () => void;
  clearLocation: () => void;
  hasPermission: boolean | null;
}

export function useLocation(): UseLocationReturn {
  const [state, setState] = useState<LocationState>({
    coordinates: null,
    error: null,
    loading: false,
  });

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const getCurrentLocation = useCallback(() => {
    if (!supportsGeolocation()) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setState({
          coordinates: { lat: latitude, lng: longitude },
          error: null,
          loading: false,
        });
        setHasPermission(true);
      },
      (error) => {
        let errorMessage = 'Unknown error occurred';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            setHasPermission(false);
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }

        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  const clearLocation = useCallback(() => {
    setState({
      coordinates: null,
      error: null,
      loading: false,
    });
  }, []);

  useEffect(() => {
    if (supportsGeolocation()) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((result) => {
          setHasPermission(result.state === 'granted');
          result.addEventListener('change', () => {
            setHasPermission(result.state === 'granted');
          });
        })
        .catch(() => {});
    }
  }, []);

  return {
    ...state,
    getCurrentLocation,
    clearLocation,
    hasPermission,
  };
}

export default useLocation;
