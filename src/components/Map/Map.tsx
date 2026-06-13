import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FUPRE_CENTER, DEFAULT_ZOOM, FUPRE_BOUNDS } from '../../utils/mapUtils';

interface MapEventsHandlerProps {
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
}

function MapEventsHandler({ onBoundsChange }: MapEventsHandlerProps) {
  const map = useMap();

  useMapEvents({
    moveend: () => {
      if (onBoundsChange) {
        onBoundsChange(map.getBounds());
      }
    },
    zoomend: () => {
      if (onBoundsChange) {
        onBoundsChange(map.getBounds());
      }
    },
  });

  return null;
}

interface MapProps {
  children?: React.ReactNode;
  center?: L.LatLngExpression;
  zoom?: number;
  className?: string;
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
}

function Map({
  children,
  center = FUPRE_CENTER,
  zoom = DEFAULT_ZOOM,
  className = '',
  onBoundsChange,
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={`${className}`}
      style={{ width: '100%', height: '100%' }}
      maxBounds={[
        [FUPRE_BOUNDS.south, FUPRE_BOUNDS.west],
        [FUPRE_BOUNDS.north, FUPRE_BOUNDS.east],
      ]}
      minZoom={14}
      maxZoom={19}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEventsHandler onBoundsChange={onBoundsChange} />
      {children}
    </MapContainer>
  );
}

export default Map;
