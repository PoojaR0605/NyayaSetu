
import { useState, type FormEvent } from 'react';
import {
  MapPin,
  Navigation,
  Scale,
  ExternalLink,
  Search,
  Phone,
  Globe,
  LoaderCircle,
} from 'lucide-react';
import * as L from 'leaflet';
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import Layout from '../../components/layout/Layout';
import apiClient, {
  type NearbyLawyerSearchResponse,
} from '../../api/client';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const INDIA_CENTER: [number, number] = [20.5937, 78.9629];

export default function NearbyLawyers() {
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState('5000');
  const [results, setResults] =
    useState<NearbyLawyerSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function searchByAddress(
    event?: FormEvent<HTMLFormElement>,
  ) {
    event?.preventDefault();

    const query = location.trim();

    if (!query) {
      setError('Enter a city, area, address, or PIN code.');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const data = await apiClient.searchNearbyLawyers({
        location: query,
        radius_m: Number(radius),
      });

      setResults(data);
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'detail' in err
          ? String((err as { detail: unknown }).detail)
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Unable to search the lawyer directory. Please try again.';

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function useMyLocation() {
    setError('');

    if (!navigator.geolocation) {
      setError(
        'Your browser does not support location access. Enter your location manually.',
      );
      return;
    }

    setLoading(true);
    setResults(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        setLocation(
          `Current location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`,
        );

        try {
          const data = await apiClient.searchNearbyLawyers({
            lat: latitude,
            lon: longitude,
            radius_m: Number(radius),
          });

          setResults(data);
        } catch (err: unknown) {
          const message =
            typeof err === 'object' &&
            err !== null &&
            'detail' in err
              ? String((err as { detail: unknown }).detail)
              : typeof err === 'object' &&
                  err !== null &&
                  'message' in err
                ? String((err as { message: unknown }).message)
                : 'Unable to find nearby lawyer offices. Please try again.';

          setError(message);
        } finally {
          setLoading(false);
        }
      },
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError(
            'Location permission was denied. Enter a city or PIN code instead.',
          );
        } else if (geoError.code === geoError.TIMEOUT) {
          setError(
            'Getting your location took too long. Please try again.',
          );
        } else {
          setError(
            'Your location could not be determined. Please enter it manually.',
          );
        }

        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      },
    );
  }

  const center: [number, number] = results
    ? [results.center.lat, results.center.lon]
    : INDIA_CENTER;

  // External directories are searched separately. Their listings are
  // not imported into NyayaSetu's own result list or map.

  const googleMapsUrl = results
    ? `https://www.google.com/maps/search/lawyers/@${results.center.lat},${results.center.lon},14z`
    : `https://www.google.com/maps/search/${encodeURIComponent(
        location.trim() ? `lawyers near ${location.trim()}` : 'lawyers near me',
      )}`;

  const eCourtsUrl =
    'https://ecourtsindia.com/advocate/';

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header className="mb-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-900">
              <Scale size={30} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Find Legal Help Nearby
              </h1>
              <p className="text-slate-600">
                Find mapped lawyer offices or search external advocate directories.
              </p>
            </div>
          </div>
        </header>

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <form
            onSubmit={searchByAddress}
            className="grid gap-4 md:grid-cols-[1fr_auto]"
          >
            <div>
              <label
                htmlFor="lawyer-location"
                className="mb-2 block font-semibold text-slate-800"
              >
                City, area, address or PIN code
              </label>

              <input
                id="lawyer-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="e.g. Indiranagar, Bengaluru or 560038"
                maxLength={200}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="search-radius"
                className="mb-2 block font-semibold text-slate-800"
              >
                Search radius
              </label>

              <select
                id="search-radius"
                value={radius}
                onChange={(event) => setRadius(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3"
              >
                <option value="1000">1 km</option>
                <option value="3000">3 km</option>
                <option value="5000">5 km</option>
                <option value="10000">10 km</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <Search size={18} />
                )}

                {loading ? 'Searching...' : 'Search lawyers'}
              </button>

              <button
                type="button"
                onClick={useMyLocation}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-800 px-5 py-3 font-semibold text-blue-900 hover:bg-blue-50 disabled:opacity-60"
              >
                <Navigation size={18} />
                Use my current location
              </button>
            </div>
          </form>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800"
            >
              {error}
            </p>
          )}

          <div className="mt-5 border-t border-slate-200 pt-4">
            <h2 className="font-semibold text-slate-900">
              Search external lawyer directories
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              These links open external websites. Results from those sites
              are not imported into NyayaSetu.
            </p>

            <div className="mt-3 flex flex-wrap gap-3">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
              >
                <MapPin size={17} />
                Search on Google Maps
                <ExternalLink size={14} />
              </a>

              <a
                href={eCourtsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-blue-800 px-4 py-2.5 text-sm font-semibold text-blue-900 hover:bg-blue-50"
              >
                <Scale size={17} />
                Browse eCourtsIndia Advocates
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </section>

        <section className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <h2 className="font-semibold text-slate-900">
              Lawyer location map
            </h2>

            <p className="text-sm text-slate-600">
              {results
                ? `Showing mapped offices within ${
                    results.radius_m / 1000
                  } km of ${results.center.label}.`
                : 'Search for a location to display mapped lawyer offices.'}
            </p>
          </div>

          <MapContainer
            key={`${center[0]}-${center[1]}`}
            center={center}
            zoom={results ? 14 : 5}
            scrollWheelZoom
            className="h-[380px] w-full sm:h-[480px]"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {results && (
              <>
                <Circle
                  center={center}
                  radius={results.radius_m}
                  pathOptions={{
                    color: '#1d4ed8',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.08,
                  }}
                />

                {results.lawyers.map((lawyer) => (
                  <Marker
                    key={lawyer.id}
                    position={[lawyer.lat, lawyer.lon]}
                  >
                    <Popup>
                      <div className="max-w-[240px]">
                        <strong>{lawyer.name}</strong>

                        {lawyer.address && <p>{lawyer.address}</p>}

                        <p>
                          {lawyer.distance_m >= 1000
                            ? `${(lawyer.distance_m / 1000).toFixed(1)} km away`
                            : `${lawyer.distance_m} m away`}
                        </p>

                        {lawyer.phone && (
                          <p>
                            <a href={`tel:${lawyer.phone}`}>
                              Call: {lawyer.phone}
                            </a>
                          </p>
                        )}

                        {lawyer.website && (
                          <p>
                            <a
                              href={lawyer.website}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Visit website
                            </a>
                          </p>
                        )}

                        {lawyer.source_url && (
                          <a
                            href={lawyer.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View OpenStreetMap record
                          </a>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </>
            )}
          </MapContainer>

          <p className="p-3 text-xs text-slate-500">
            Map data © OpenStreetMap contributors.
          </p>
        </section>

        {results && (
          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Nearby lawyer offices
                </h2>

                <p className="text-sm text-slate-600">
                  {results.count} mapped result
                  {results.count === 1 ? '' : 's'}
                </p>
              </div>

              <a
                href={`https://www.openstreetmap.org/?mlat=${results.center.lat}&mlon=${results.center.lon}#map=15/${results.center.lat}/${results.center.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-800 hover:underline"
              >
                Open OpenStreetMap <ExternalLink size={15} />
              </a>
            </div>

            {results.count === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-slate-900">
                  {results.source_unavailable
                    ? 'Live lawyer data is temporarily unavailable'
                    : 'No mapped lawyer offices found'}
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                  {results.notice}
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  No fictional lawyer entries have been added. Try a larger
                  radius or search the external directories above.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                  >
                    Search Google Maps <ExternalLink size={14} />
                  </a>

                  <a
                    href={eCourtsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-blue-800 px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-50"
                  >
                    Find advocates <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {results.lawyers.map((lawyer) => (
                  <article
                    key={lawyer.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-blue-50 p-2 text-blue-900">
                        <MapPin size={21} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-900">
                          {lawyer.name}
                        </h3>

                        {lawyer.address && (
                          <p className="mt-1 text-sm text-slate-600">
                            {lawyer.address}
                          </p>
                        )}

                        <p className="mt-2 text-sm text-slate-600">
                          {lawyer.distance_m >= 1000
                            ? `${(lawyer.distance_m / 1000).toFixed(1)} km away`
                            : `${lawyer.distance_m} m away`}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 text-sm">
                      {lawyer.phone && (
                        <a
                          href={`tel:${lawyer.phone}`}
                          className="inline-flex items-center gap-1 font-medium text-blue-800 hover:underline"
                        >
                          <Phone size={15} /> Call
                        </a>
                      )}

                      {lawyer.website && (
                        <a
                          href={lawyer.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-blue-800 hover:underline"
                        >
                          <Globe size={15} /> Website
                        </a>
                      )}

                      {lawyer.source_url && (
                        <a
                          href={lawyer.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-blue-800 hover:underline"
                        >
                          Source record <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}

            <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
              <strong>Important:</strong> {results.notice} Verify advocate
              credentials, fees, and availability independently before
              engaging a lawyer.
            </p>
          </section>
        )}

        <section className="mt-8 rounded-xl border border-green-200 bg-green-50 p-5">
          <h2 className="font-semibold text-green-950">
            Need free legal assistance?
          </h2>

          <p className="mt-1 text-sm text-green-900">
            Contact India&apos;s National Legal Services Authority to learn
            about legal aid and eligibility.
          </p>

          <a
            href="https://nalsa.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 font-semibold text-green-950 underline"
          >
            Visit NALSA <ExternalLink size={16} />
          </a>
        </section>
      </div>
    </Layout>
  );
}
