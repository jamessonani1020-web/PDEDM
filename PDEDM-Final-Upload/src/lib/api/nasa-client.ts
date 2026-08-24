import {
  NeoWsFeedSchema,
  HorizonsResponseSchema,
  type NeoWsFeed,
  type NeoTableRow,
  type StateVector,
} from "@/types/schema";
import { useRateLimitStore } from "@/stores/rate-limit-store";
import {
  ApiValidationError,
  RateLimitError,
  HorizonsParseError,
  NetworkError,
} from "./errors";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const NEOWS_BASE_URL = "/api/neo";
const HORIZONS_BASE_URL = "https://ssd.jpl.nasa.gov/api/horizons.api";

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

// ---------------------------------------------------------------------------
// Exponential backoff helper
// ---------------------------------------------------------------------------

async function fetchWithBackoff(
  url: string,
  options?: RequestInit
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(url, options);

    // Extract and store rate-limit headers (NASA-specific)
    const limitHeader = response.headers.get("X-RateLimit-Limit");
    const remainingHeader = response.headers.get("X-RateLimit-Remaining");

    if (limitHeader !== null || remainingHeader !== null) {
      const limit = limitHeader ? parseInt(limitHeader, 10) : null;
      const remaining = remainingHeader
        ? parseInt(remainingHeader, 10)
        : null;
      useRateLimitStore.getState().setRateLimit(
        Number.isNaN(limit) ? null : limit,
        Number.isNaN(remaining) ? null : remaining
      );
    }

    if (response.ok) {
      return response;
    }

    if (response.status === 429) {
      if (attempt === MAX_RETRIES) {
        const retryAfter = response.headers.get("Retry-After");
        throw new RateLimitError(
          retryAfter ? parseInt(retryAfter, 10) : 60
        );
      }

      // Exponential backoff: 1s, 2s, 4s
      const retryAfterHeader = response.headers.get("Retry-After");
      const delayMs = retryAfterHeader
        ? parseInt(retryAfterHeader, 10) * 1000
        : INITIAL_BACKOFF_MS * Math.pow(2, attempt);

      await new Promise((resolve) => setTimeout(resolve, delayMs));
      lastError = new RateLimitError(delayMs / 1000);
      continue;
    }

    // Non-retryable error
    throw new NetworkError(
      `NASA API returned HTTP ${response.status}: ${response.statusText}`,
      response.status
    );
  }

  throw lastError ?? new Error("Unexpected fetch failure after retries");
}

// ---------------------------------------------------------------------------
// NeoWs Feed
// ---------------------------------------------------------------------------

/**
 * Flatten the nested NeoWs response into a flat array of table rows.
 */
function flattenNeoFeed(feed: NeoWsFeed): NeoTableRow[] {
  const rows: NeoTableRow[] = [];

  for (const [, objects] of Object.entries(feed.near_earth_objects)) {
    for (const neo of objects) {
      const approach = neo.close_approach_data[0];
      if (!approach) continue;

      rows.push({
        id: neo.id,
        name: neo.name,
        nasaJplUrl: neo.nasa_jpl_url,
        absoluteMagnitude: neo.absolute_magnitude_h,
        diameterMinMeters: neo.estimated_diameter.meters.estimated_diameter_min,
        diameterMaxMeters: neo.estimated_diameter.meters.estimated_diameter_max,
        isHazardous: neo.is_potentially_hazardous_asteroid,
        isSentryObject: neo.is_sentry_object,
        approachDate: approach.close_approach_date,
        approachDateFull: approach.close_approach_date_full,
        epochApproach: approach.epoch_date_close_approach,
        velocityKmPerSec: approach.relative_velocity.kilometers_per_second,
        velocityKmPerHour: approach.relative_velocity.kilometers_per_hour,
        missDistanceKm: approach.miss_distance.kilometers,
        missDistanceAu: approach.miss_distance.astronomical,
        missDistanceLunar: approach.miss_distance.lunar,
        orbitingBody: approach.orbiting_body,
      });
    }
  }

  // Sort by approach date ascending
  rows.sort((a, b) => a.epochApproach - b.epochApproach);
  return rows;
}

/**
 * Fetch Near Earth Objects for a date range.
 * Validates the response through the Zod schema.
 * Returns flattened, display-ready rows.
 */
export async function fetchNeoFeed(
  startDate: string,
  endDate: string
): Promise<NeoTableRow[]> {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
  });

  const response = await fetchWithBackoff(`${NEOWS_BASE_URL}?${params.toString()}`);
  const json: unknown = await response.json();

  const parsed = NeoWsFeedSchema.safeParse(json);
  if (!parsed.success) {
    throw new ApiValidationError(
      "NeoWs response failed Zod schema validation",
      parsed.error.format()
    );
  }

  return flattenNeoFeed(parsed.data);
}

// ---------------------------------------------------------------------------
// JPL Horizons Ephemeris
// ---------------------------------------------------------------------------

/**
 * Parse the plain-text result block between $$SOE and $$EOE markers
 * into structured StateVector objects.
 */
function parseHorizonsVectors(resultText: string): StateVector[] {
  const soeIndex = resultText.indexOf("$$SOE");
  const eoeIndex = resultText.indexOf("$$EOE");

  if (soeIndex === -1 || eoeIndex === -1) {
    throw new HorizonsParseError(
      "Could not locate $$SOE / $$EOE markers in Horizons result",
      resultText
    );
  }

  const dataBlock = resultText.slice(soeIndex + 5, eoeIndex).trim();
  const vectors: StateVector[] = [];

  // Horizons VECTORS format:
  //   JDTDB
  //     CalendarDate
  //     X = ...  Y = ...  Z = ...
  //     VX= ...  VY= ...  VZ= ...
  // Each record is separated by blank-ish lines.

  // Strategy: split by JDTDB lines (lines matching a Julian Date pattern)
  const lines = dataBlock.split("\n").map((l) => l.trim());
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Look for JDTDB line: a number like 2460310.500000000
    const jdMatch = line.match(/^(\d+\.\d+)\s*=?\s*(.*)/);
    if (jdMatch) {
      const jdtdb = parseFloat(jdMatch[1]);
      const calendarDate = jdMatch[2]?.replace(/^=\s*/, "").trim() ?? "";

      // Next lines contain X, Y, Z and VX, VY, VZ
      let x = 0,
        y = 0,
        z = 0,
        vx = 0,
        vy = 0,
        vz = 0;

      // Scan the next few lines for coordinate data
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const posMatch = lines[j].match(
          /X\s*=\s*([^\s]+)\s+Y\s*=\s*([^\s]+)\s+Z\s*=\s*([^\s]+)/i
        );
        if (posMatch) {
          x = parseFloat(posMatch[1]);
          y = parseFloat(posMatch[2]);
          z = parseFloat(posMatch[3]);
        }

        const velMatch = lines[j].match(
          /VX\s*=\s*([^\s]+)\s+VY\s*=\s*([^\s]+)\s+VZ\s*=\s*([^\s]+)/i
        );
        if (velMatch) {
          vx = parseFloat(velMatch[1]);
          vy = parseFloat(velMatch[2]);
          vz = parseFloat(velMatch[3]);
        }
      }

      vectors.push({ jdtdb, calendarDate, x, y, z, vx, vy, vz });
    }

    i++;
  }

  return vectors;
}

/**
 * Fetch Cartesian state vectors from JPL Horizons for a given asteroid.
 */
export async function fetchHorizonsEphemeris(
  designation: string
): Promise<{ vectors: StateVector[]; rawResult: string }> {
  const now = new Date();
  const startTime = now.toISOString().split("T")[0];
  const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const stopTime = future.toISOString().split("T")[0];

  const url = new URL(HORIZONS_BASE_URL);
  url.searchParams.set("format", "json");
  url.searchParams.set("COMMAND", `'DES=${designation}'`);
  url.searchParams.set("OBJ_DATA", "YES");
  url.searchParams.set("MAKE_EPHEM", "YES");
  url.searchParams.set("EPHEM_TYPE", "VECTORS");
  url.searchParams.set("CENTER", "500@399");
  url.searchParams.set("START_TIME", startTime);
  url.searchParams.set("STOP_TIME", stopTime);
  url.searchParams.set("STEP_SIZE", "1d");

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new NetworkError(
      `JPL Horizons API returned HTTP ${response.status}`,
      response.status
    );
  }

  const json: unknown = await response.json();
  const parsed = HorizonsResponseSchema.safeParse(json);

  if (!parsed.success) {
    throw new ApiValidationError(
      "Horizons response failed Zod schema validation",
      parsed.error.format()
    );
  }

  const rawResult = parsed.data.result;

  // If the result contains an error message from Horizons
  if (
    rawResult.includes("No matches found") ||
    rawResult.includes("Cannot find")
  ) {
    throw new HorizonsParseError(
      `Horizons could not resolve designation "${designation}"`,
      rawResult
    );
  }

  // If there's no ephemeris data (e.g., only object data returned)
  if (!rawResult.includes("$$SOE")) {
    return { vectors: [], rawResult };
  }

  const vectors = parseHorizonsVectors(rawResult);
  return { vectors, rawResult };
}
