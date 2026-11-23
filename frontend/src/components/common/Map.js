import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

// Component to recenter map when center prop changes
const RecenterMap = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

const Map = ({
    center = [28.6139, 77.2090], // Default to New Delhi
    zoom = 13,
    markers = [],
    height = '400px',
    onMarkerClick
}) => {
    return (
        <div className="map-container" style={{ height, borderRadius: '1rem', overflow: 'hidden', zIndex: 0 }}>
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap center={center} />

                {markers.map((marker, index) => (
                    <Marker
                        key={index}
                        position={marker.position}
                        eventHandlers={{
                            click: () => onMarkerClick && onMarkerClick(marker),
                        }}
                    >
                        <Popup>
                            <div className="map-popup">
                                <h4>{marker.title}</h4>
                                <p>{marker.description}</p>
                                {marker.action && (
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => marker.action.onClick(marker)}
                                        style={{ marginTop: '0.5rem', width: '100%' }}
                                    >
                                        {marker.action.label}
                                    </button>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            <style>{`
        .leaflet-container {
          width: 100%;
          height: 100%;
        }
        .map-popup h4 {
          margin: 0 0 0.5rem 0;
          font-weight: 600;
          color: var(--gray-900);
        }
        .map-popup p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--gray-600);
        }
      `}</style>
        </div>
    );
};

export default Map;
