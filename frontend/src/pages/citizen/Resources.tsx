
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Navigation,
  Filter,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Map,
  List,
  Scale,
} from 'lucide-react';

import { useAssessmentStore } from '../../store/assessmentStore';
import { apiClient } from '../../api/client';
import type {
  ResourceSearchRequest,
  ResourceSearchResult,
} from '../../types';

import Layout from '../../components/layout/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import ResourceMap from '../../components/map/ResourceMap';

export default function Resources() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const {
    currentAssessment,
    recommendedResources,
    isLoading,
    error,
    loadAssessment,
    loadRecommendedResources,
  } = useAssessmentStore();

  const [searchResults, setSearchResults] = useState<ResourceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [manualLocation, setManualLocation] = useState({
    state: '',
    district: '',
    pincode: '',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    if (token) {
      void loadAssessment(token);
      void loadRecommendedResources(token);
    }
  }, [token]);

  useEffect(() => {
    setSearchResults(recommendedResources);
  }, [recommendedResources]);

  function requestLocation() {
    setSearchError(null);

    if (!navigator.geolocation) {
      setSearchError(
        'Your browser does not support location access. Enter your location manually.'
      );
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setGettingLocation(false);
      },
      (geoError) => {
        setGettingLocation(false);
        setSearchError(
          geoError.code === geoError.PERMISSION_DENIED
            ? 'Location permission was denied. Enter your location manually.'
            : 'Unable to determine your location. Please try again or enter it manually.'
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  }

  async function handleSearch() {
    const hasGps = location !== null;
    const hasManualLocation = Boolean(
      manualLocation.state.trim() ||
      manualLocation.district.trim() ||
      manualLocation.pincode.trim()
    );

    if (!hasGps && !hasManualLocation) {
      setSearchError(
        'Enter a state, district, or PIN code, or select Use My Location first.'
      );
      setShowFilters(true);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    const searchParams: ResourceSearchRequest = {
      legal_issue: currentAssessment?.legal_domain,
      ...manualLocation,
      state: manualLocation.state.trim() || 'Karnataka',
      ...(location
        ? {
            latitude: location.latitude,
            longitude: location.longitude,
          }
        : {}),
    };

    try {
      const results = await apiClient.searchResources(searchParams);
      setSearchResults(results);
      setViewMode('list');

      if (results.length === 0) {
        setSearchError(
          'No legal resources matched your search. Try another district or PIN code, or use Nearby Lawyers.'
        );
      }
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'detail' in err
          ? String((err as { detail: unknown }).detail)
          : 'Unable to search legal resources. Check that the backend is running and try again.';

      setSearchError(message);
    } finally {
      setIsSearching(false);
    }
  }

  function getResourceTypeLabel(type: string) {
    const labels: Record<string, string> = {
      LEGAL_AID_OFFICE: 'Legal Aid Office',
      NGO: 'NGO',
      PRO_BONO_LAWYER: 'Pro Bono Lawyer',
      GOVERNMENT_SCHEME: 'Government Scheme',
      HELPLINE: 'Helpline',
      ONLINE_RESOURCE: 'Online Resource',
    };

    return labels[type] || type;
  }

  function getResourceTypeColor(type: string) {
    const colors: Record<string, string> = {
      LEGAL_AID_OFFICE: 'bg-blue-100 text-blue-800',
      NGO: 'bg-green-100 text-green-800',
      PRO_BONO_LAWYER: 'bg-purple-100 text-purple-800',
      GOVERNMENT_SCHEME: 'bg-amber-100 text-amber-800',
      HELPLINE: 'bg-red-100 text-red-800',
      ONLINE_RESOURCE: 'bg-slate-100 text-slate-800',
    };

    return colors[type] || 'bg-slate-100 text-slate-800';
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-slate-600">Loading resources...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="mx-auto max-w-4xl py-12">
          <ErrorMessage
            message={error}
            onRetry={() => {
              if (token) void loadRecommendedResources(token);
            }}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {token && (
          <Link
            to={`/results/${token}`}
            className="mb-6 inline-flex items-center gap-2 font-medium text-blue-900 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Results
          </Link>
        )}

        <header className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-slate-900 md:text-4xl">
            Legal Resources &amp; Services
          </h1>
          <p className="text-slate-600">
            Connect with legal aid offices, lawyers, and support services.
          </p>
        </header>

        <section className="card mb-8">
          <div className="mb-4 flex flex-col items-start justify-between gap-4 md:flex-row">
            <div className="flex-1">
              <h2 className="mb-2 text-xl font-semibold text-slate-900">
                Search by Location
              </h2>
              <p className="text-sm text-slate-600">
                Find legal resources near you.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <List className="h-4 w-4" />
                  List
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${
                    viewMode === 'map'
                      ? 'bg-white text-blue-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Map className="h-4 w-4" />
                  Map
                </button>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowFilters((visible) => !visible)}
              >
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="space-y-4 border-t border-slate-200 pt-4">
              <div>
                <Button
                  variant="secondary"
                  onClick={requestLocation}
                  isLoading={gettingLocation}
                  disabled={gettingLocation}
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  {gettingLocation
                    ? 'Getting Location...'
                    : location
                      ? 'Location Ready'
                      : 'Use My Location'}
                </Button>

                {location && (
                  <p className="mt-2 text-sm text-green-700">
                    GPS coordinates obtained. Click Search Resources to search.
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label
                    htmlFor="resource-state"
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    State
                  </label>
                  <input
                    id="resource-state"
                    value={manualLocation.state}
                    onChange={(event) =>
                      setManualLocation({
                        ...manualLocation,
                        state: event.target.value,
                      })
                    }
                    className="input w-full"
                    placeholder="e.g. Karnataka"
                  />
                </div>

                <div>
                  <label
                    htmlFor="resource-district"
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    District
                  </label>
                  <input
                    id="resource-district"
                    value={manualLocation.district}
                    onChange={(event) =>
                      setManualLocation({
                        ...manualLocation,
                        district: event.target.value,
                      })
                    }
                    className="input w-full"
                    placeholder="e.g. Bengaluru"
                  />
                </div>

                <div>
                  <label
                    htmlFor="resource-pincode"
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    PIN code
                  </label>
                  <input
                    id="resource-pincode"
                    value={manualLocation.pincode}
                    onChange={(event) =>
                      setManualLocation({
                        ...manualLocation,
                        pincode: event.target.value,
                      })
                    }
                    className="input w-full"
                    placeholder="e.g. 560001"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleSearch} isLoading={isSearching}>
                  Search Resources
                </Button>

                <button
                  type="button"
                  onClick={() => navigate('/nearby-lawyers')}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-800"
                >
                  <Scale className="h-4 w-4" />
                  Find Nearby Lawyers
                </button>
              </div>
            </div>
          )}

          {searchError && (
            <div className="mt-4">
              <ErrorMessage message={searchError} />
              <button
                type="button"
                onClick={() => navigate('/nearby-lawyers')}
                className="mt-3 font-semibold text-blue-900 underline"
              >
                Search mapped lawyer offices instead
              </button>
            </div>
          )}
        </section>

        {searchResults.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No Resources Found"
            description="Enter a location and search, or use the nearby lawyer directory."
            action={{
              label: 'Find Nearby Lawyers',
              onClick: () => navigate('/nearby-lawyers'),
            }}
          />
        ) : viewMode === 'map' ? (
          <div className="space-y-6">
            <ResourceMap
              resources={searchResults.map((result) => ({
                id: String(result.resource.id),
                name: result.resource.name,
                type: String(result.resource.resource_type),
                address: result.resource.address ?? '',
                city: result.resource.city ?? '',
                state: result.resource.state ?? '',
                pincode: result.resource.pincode ?? '',
                latitude: result.resource.latitude ?? undefined,
                longitude: result.resource.longitude ?? undefined,
              }))}
              userLocation={
                location
                  ? { lat: location.latitude, lng: location.longitude }
                  : undefined
              }
              height="600px"
            />

            <p className="text-center text-sm text-slate-600">
              Showing{' '}
              {
                searchResults.filter(
                  (result) =>
                    result.resource.latitude != null &&
                    result.resource.longitude != null
                ).length
              }{' '}
              of {searchResults.length} resources with map coordinates.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {searchResults.map((result) => {
              const resource = result.resource;

              return (
                <article
                  key={resource.id}
                  className="card transition-shadow hover:shadow-lg"
                >
                  <h3 className="mb-2 text-xl font-semibold text-slate-900">
                    {resource.name}
                  </h3>

                  <div className="mb-3 flex flex-wrap gap-2">
                    <span
                      className={`badge ${getResourceTypeColor(
                        resource.resource_type
                      )}`}
                    >
                      {getResourceTypeLabel(resource.resource_type)}
                    </span>

                    {resource.verification_status === 'VERIFIED' && (
                      <span className="badge badge-success inline-flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </span>
                    )}

                    {result.distance_km != null && (
                      <span className="badge badge-info">
                        {result.distance_km.toFixed(1)} km away
                      </span>
                    )}
                  </div>

                  {resource.description && (
                    <p className="mb-4 text-slate-600">
                      {resource.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm text-slate-700">
                    {resource.address && (
                      <p className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        {[
                          resource.address,
                          resource.city,
                          resource.state,
                          resource.pincode,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}

                    {resource.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                        <a
                          href={`tel:${resource.phone}`}
                          className="hover:text-blue-900"
                        >
                          {resource.phone}
                        </a>
                      </p>
                    )}

                    {resource.email && (
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                        <a
                          href={`mailto:${resource.email}`}
                          className="hover:text-blue-900"
                        >
                          {resource.email}
                        </a>
                      </p>
                    )}

                    {resource.website && (
                      <p className="flex items-center gap-2">
                        <Globe className="h-4 w-4 shrink-0 text-slate-400" />
                        <a
                          href={resource.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-900"
                        >
                          Visit Website
                        </a>
                      </p>
                    )}
                  </div>

                  {(resource.languages_supported?.length ?? 0) > 0 && (
  <div className="mt-4 border-t border-slate-200 pt-4">
    <p className="mb-2 text-xs text-slate-500">
      Languages Supported
    </p>
    <div className="flex flex-wrap gap-1">
      {(resource.languages_supported ?? []).map((language) => (
        <span
          key={language}
          className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700"
        >
          {language}
        </span>
      ))}
    </div>
  </div>
)}

                  {result.match_reasons?.length > 0 && (
                    <div className="mt-4 border-t border-slate-200 pt-4">
                      <p className="mb-2 text-sm font-semibold text-slate-900">
                        Why this was recommended
                      </p>
                      <ul className="space-y-1 text-sm text-slate-600">
                        {result.match_reasons.map((reason, index) => (
                          <li
                            key={`${reason}-${index}`}
                            className="flex items-start gap-2"
                          >
                            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        <aside className="card mt-8 border-blue-200 bg-blue-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            <div className="text-sm text-blue-900">
              <strong>Need a nearby lawyer?</strong>
              <p className="mt-1">
                The lawyer directory uses mapped office information. Listings
                are not verified bar registrations; confirm qualifications,
                fees, and availability before engaging a lawyer.
              </p>
              <button
                type="button"
                onClick={() => navigate('/nearby-lawyers')}
                className="mt-3 inline-flex items-center gap-2 font-semibold underline"
              >
                <Navigation className="h-4 w-4" />
                Open Nearby Lawyers
              </button>
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  );
}
