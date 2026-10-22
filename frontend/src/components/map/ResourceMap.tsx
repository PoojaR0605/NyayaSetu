import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, type LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = new Icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Resource {
  id: string | number;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
}

interface ResourceMapProps {
  resources: Resource[];
  center?: LatLngExpression;
  zoom?: number;
  height?: string;
  userLocation?: { lat: number; lng: number };
}

// Component to fit map bounds to show all markers
function FitBounds({ resources }: { resources: Resource[] }) {
  const map = useMap();

  useEffect(() => {
    if (resources.length > 0) {
      const validCoords = resources
        .filter(r => r.latitude != null && r.longitude != null)
        .map(r => [r.latitude!, r.longitude!] as LatLngExpression);

      if (validCoords.length > 0) {
        const bounds = validCoords as [number, number][];
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      }
    }
  }, [resources, map]);

  return null;
}

export default function ResourceMap({ 
  resources, 
  center = [20.5937, 78.9629], // Center of India
  zoom = 5,
  height = '500px',
  userLocation
}: ResourceMapProps) {
  const mapRef = useRef(null);

  // Filter resources that have valid coordinates
  const mappableResources = resources.filter(
    r => r.latitude != null && r.longitude != null && 
         Number.isFinite(r.latitude) && Number.isFinite(r.longitude)
  );

  if (mappableResources.length === 0) {
    return (
      <div 
        className="bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center p-8">
          <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            Location Data Unavailable
          </h3>
          <p className="text-sm text-slate-500">
            The selected resources don't have location coordinates.<br />
            Please try a different search or location.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden shadow-lg border border-slate-200">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height, width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={new Icon({
              iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" width="32" height="32">
                  <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/>
                  <circle cx="12" cy="12" r="4" fill="white"/>
                </svg>
              `),
              iconSize: [32, 32],
              iconAnchor: [16, 16],
              popupAnchor: [0, -16],
            })}
          >
            <Popup>
              <div className="text-center p-2">
                <strong className="text-blue-900">Your Location</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Resource Markers */}
        {mappableResources.map((resource) => (
          <Marker
            key={resource.id}
            position={[resource.latitude!, resource.longitude!]}
            icon={DefaultIcon}
          >
            <Popup maxWidth={300}>
              <div className="p-2">
                <h3 className="font-bold text-base text-slate-900 mb-2">
                  {resource.name}
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-slate-700">{resource.address}</p>
                      <p className="text-slate-600">
                        {resource.city}, {resource.state} - {resource.pincode}
                      </p>
                    </div>
                  </div>

                  {resource.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <a 
                        href={`tel:${resource.phone}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {resource.phone}
                      </a>
                    </div>
                  )}

                  {resource.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <a 
                        href={`mailto:${resource.email}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                      >
                        {resource.email}
                      </a>
                    </div>
                  )}

                  {resource.website && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <a 
                        href={resource.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}

                  <div className="mt-3 pt-2 border-t border-slate-200">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {resource.type}
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Automatically fit bounds to show all resources */}
        <FitBounds resources={mappableResources} />
      </MapContainer>
    </div>
  );
}
