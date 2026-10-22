
"""
Nearby lawyer discovery for NyayaSetu.

Uses OpenStreetMap / Overpass for mapped lawyer offices and
Nominatim for manual address geocoding.

No fictional or sample lawyer records are returned.
"""

import json
import math
import os
import threading
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import APIRouter, HTTPException, Query

router = APIRouter()

USER_AGENT = os.getenv(
    "NYAYASETU_OSM_USER_AGENT",
    "NyayaSetu/1.0 (nearby legal help discovery)",
)

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

OVERPASS_URLS = [
    "https://overpass.private.coffee/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]

GEOCODE_TTL = 24 * 60 * 60
SEARCH_TTL = 5 * 60

_geocode_cache = {}
_search_cache = {}
_cache_lock = threading.Lock()
_nominatim_lock = threading.Lock()
_last_nominatim_request = 0.0


def _get_json(url: str, timeout: int = 15):
    request = Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "application/json",
        },
    )

    with urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def _post_json(url: str, query: str, timeout: int = 12):
    request = Request(
        url,
        data=urlencode({"data": query}).encode("utf-8"),
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )

    with urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def _geocode(location: str) -> dict:
    """Resolve an entered address to coordinates using Nominatim."""
    global _last_nominatim_request

    location = " ".join(location.split())
    cache_key = location.casefold()
    now = time.time()

    with _cache_lock:
        cached = _geocode_cache.get(cache_key)
        if cached and cached[0] > now:
            return cached[1]

    with _nominatim_lock:
        wait = 1.1 - (
            time.monotonic() - _last_nominatim_request
        )
        if wait > 0:
            time.sleep(wait)

        try:
            results = _get_json(
                NOMINATIM_URL
                + "?"
                + urlencode({
                    "q": location,
                    "format": "jsonv2",
                    "limit": 1,
                    "countrycodes": "in",
                    "addressdetails": 1,
                }),
                timeout=12,
            )
        except (
            HTTPError,
            URLError,
            TimeoutError,
            OSError,
            ValueError,
        ):
            raise HTTPException(
                status_code=503,
                detail=(
                    "Address search is temporarily unavailable. "
                    "Try again or use your current location."
                ),
            ) from None
        finally:
            _last_nominatim_request = time.monotonic()

    if not isinstance(results, list) or not results:
        raise HTTPException(
            status_code=404,
            detail=(
                "Location not found. Enter an Indian city, locality, "
                "address, or PIN code."
            ),
        )

    item = results[0]

    try:
        center = {
            "lat": float(item["lat"]),
            "lon": float(item["lon"]),
            "label": str(item.get("display_name") or location),
        }
    except (KeyError, TypeError, ValueError):
        raise HTTPException(
            status_code=502,
            detail="The address service returned invalid coordinates.",
        ) from None

    with _cache_lock:
        _geocode_cache[cache_key] = (
            time.time() + GEOCODE_TTL,
            center,
        )

    return center


def _distance_m(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
) -> int:
    """Calculate straight-line distance in metres."""
    earth_radius = 6_371_000

    p1 = math.radians(lat1)
    p2 = math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)

    a = (
        math.sin(dp / 2) ** 2
        + math.cos(p1)
        * math.cos(p2)
        * math.sin(dl / 2) ** 2
    )

    a = max(0.0, min(1.0, a))

    return round(
        earth_radius
        * 2
        * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    )


def _address(tags: dict) -> str:
    """Build an address from available OpenStreetMap tags."""
    if tags.get("addr:full"):
        return str(tags["addr:full"])

    street = " ".join(
        str(part)
        for part in (
            tags.get("addr:housenumber"),
            tags.get("addr:street"),
        )
        if part
    )

    parts = [
        street,
        tags.get("addr:neighbourhood"),
        tags.get("addr:suburb"),
        (
            tags.get("addr:city")
            or tags.get("addr:town")
            or tags.get("addr:village")
        ),
        tags.get("addr:state"),
        tags.get("addr:postcode"),
    ]

    return ", ".join(str(part) for part in parts if part)


def _live_lawyers(
    lat: float,
    lon: float,
    radius_m: int,
) -> list:
    """Retrieve actual mapped lawyer-office records from OSM."""
    query = f"""
    [out:json][timeout:10];
    (
      nwr(around:{radius_m},{lat},{lon})["office"="lawyer"];
      nwr(around:{radius_m},{lat},{lon})["amenity"="lawyer"];
    );
    out center tags;
    """

    payload = None
    last_error = None

    for endpoint in OVERPASS_URLS:
        try:
            response = _post_json(
                endpoint,
                query,
                timeout=12,
            )

            if (
                not isinstance(response, dict)
                or not isinstance(response.get("elements"), list)
            ):
                last_error = ValueError("Invalid Overpass response")
                continue

            payload = response
            break

        except (
            HTTPError,
            URLError,
            TimeoutError,
            OSError,
            ValueError,
        ) as exc:
            last_error = exc

    if payload is None:
        raise RuntimeError(
            "All configured Overpass servers failed"
        ) from last_error

    lawyers = []
    seen = set()

    for element in payload["elements"]:
        if not isinstance(element, dict):
            continue

        element_type = element.get("type")
        element_id = element.get("id")

        if (
            element_type not in {"node", "way", "relation"}
            or element_id is None
        ):
            continue

        unique_key = (element_type, element_id)

        if unique_key in seen:
            continue

        seen.add(unique_key)

        tags = element.get("tags") or {}
        if not isinstance(tags, dict):
            continue

        coordinates = element.get("center") or element

        try:
            lawyer_lat = float(coordinates["lat"])
            lawyer_lon = float(coordinates["lon"])
        except (KeyError, TypeError, ValueError):
            continue

        distance = _distance_m(
            lat,
            lon,
            lawyer_lat,
            lawyer_lon,
        )

        if distance > radius_m:
            continue

        lawyers.append({
            "id": f"{element_type}-{element_id}",
            "name": (
                tags.get("name")
                or tags.get("name:en")
                or "Lawyer office (name not listed)"
            ),
            "lat": lawyer_lat,
            "lon": lawyer_lon,
            "address": _address(tags),
            "phone": (
                tags.get("phone")
                or tags.get("contact:phone")
                or tags.get("telephone")
            ),
            "website": (
                tags.get("website")
                or tags.get("contact:website")
            ),
            "distance_m": distance,
            "source_url": (
                "https://www.openstreetmap.org/"
                f"{element_type}/{element_id}"
            ),
            "source": "OpenStreetMap",
            "is_sample": False,
            "verification_notice": (
                "Mapped listing. Advocate registration "
                "has not been independently verified."
            ),
        })

    lawyers.sort(key=lambda item: item["distance_m"])
    return lawyers[:100]


def _find_lawyers(
    lat: float,
    lon: float,
    radius_m: int,
) -> tuple[list, str, bool]:
    """
    Return live results only.

    The third value indicates whether the live data source failed.
    An empty successful response is different from a source outage.
    """
    cache_key = f"{lat:.5f}:{lon:.5f}:{radius_m}"
    now = time.time()

    with _cache_lock:
        cached = _search_cache.get(cache_key)
        if cached and cached[0] > now:
            return cached[1]

    try:
        lawyers = _live_lawyers(lat, lon, radius_m)
        result = (lawyers, "OpenStreetMap", False)

    except RuntimeError:
        result = ([], "OpenStreetMap", True)

    with _cache_lock:
        _search_cache[cache_key] = (
            time.time() + SEARCH_TTL,
            result,
        )

    return result


@router.get("/search")
def search_nearby_lawyers(
    location: str | None = Query(default=None, max_length=200),
    lat: float | None = Query(default=None, ge=-90, le=90),
    lon: float | None = Query(default=None, ge=-180, le=180),
    radius_m: int = Query(default=5000, ge=500, le=10000),
):
    """
    Search by a manual address or GPS coordinates.

    Address example:
      /search?location=Indiranagar%2C%20Bengaluru&radius_m=5000

    GPS example:
      /search?lat=12.9733&lon=77.6405&radius_m=5000
    """
    if location is not None and not location.strip():
        raise HTTPException(
            status_code=400,
            detail="Enter a city, address, locality, or PIN code.",
        )

    if location is not None and (
        lat is not None or lon is not None
    ):
        raise HTTPException(
            status_code=400,
            detail="Provide an address OR GPS coordinates, not both.",
        )

    if (lat is None) != (lon is None):
        raise HTTPException(
            status_code=400,
            detail=(
                "Both latitude and longitude are required "
                "for GPS search."
            ),
        )

    if location is not None:
        center = _geocode(location.strip())

    elif lat is not None and lon is not None:
        center = {
            "lat": lat,
            "lon": lon,
            "label": f"GPS location ({lat:.5f}, {lon:.5f})",
        }

    else:
        raise HTTPException(
            status_code=400,
            detail="Enter an address or use your current location.",
        )

    lawyers, data_source, source_unavailable = _find_lawyers(
        center["lat"],
        center["lon"],
        radius_m,
    )

    if source_unavailable:
        notice = (
            "The live OpenStreetMap lawyer directory could not be "
            "reached. No fictional results are displayed. Use the "
            "Google Maps or eCourtsIndia links to continue searching."
        )
    elif not lawyers:
        notice = (
            "No lawyer offices matching the mapped OpenStreetMap "
            "tags were found in this radius. This does not mean no "
            "lawyers practise in this area. Try Google Maps or "
            "eCourtsIndia for additional results."
        )
    else:
        notice = (
            "Listings are sourced from OpenStreetMap and may be "
            "incomplete or outdated. Advocate registrations are not "
            "verified by this search. Confirm credentials and contact "
            "details before engaging a lawyer."
        )

    return {
        "center": center,
        "radius_m": radius_m,
        "count": len(lawyers),
        "lawyers": lawyers,
        "source": data_source,
        "is_demo": False,
        "source_unavailable": source_unavailable,
        "attribution": "© OpenStreetMap contributors",
        "notice": notice,
    }
