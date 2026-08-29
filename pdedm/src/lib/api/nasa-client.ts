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

const NEOWS_BASE_URL = "/api/neo";
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

// wrapper around fetch that retries on 429s with exponential backoff
async function fetchWithBackoff(
  url: string,
  options?: RequestInit
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(url, options);

    // grab rate limit info from response headers if present
    const limitHeader = response.headers.get("X-RateLimit-Limit");
    const remainingHeader = response.headers.get("X-RateLimit-Remaining");

    if (limitHeader !== null || remainingHeader !== null) {
      let limit = limitHeader ? parseInt(limitHeader, 10) : null;
      let remaining = remainingHeader
        ? parseInt(remainingHeader, 10)
        : null;
        
      if (limit !== null && limit > 1000) {
        const actualUsed = remaining !== null ? limit - remaining : 0;
        limit = 1000;
        if (remaining !== null) {
          remaining = Math.max(0, 1000 - actualUsed);
        }
      }
      
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

      // backoff: 1s, 2s, 4s (or use Retry-After if provided)
      const retryAfterHeader = response.headers.get("Retry-After");
      const delayMs = retryAfterHeader
        ? parseInt(retryAfterHeader, 10) * 1000
        : INITIAL_BACKOFF_MS * Math.pow(2, attempt);

      await new Promise((resolve) => setTimeout(resolve, delayMs));
      lastError = new RateLimitError(delayMs / 1000);
      continue;
    }

    throw new NetworkError(
      `NASA API returned HTTP ${response.status}: ${response.statusText}`,
      response.status
    );
  }

  throw lastError ?? new Error("Unexpected fetch failure after retries");
}

// takes the nested NeoWs response and flattens it into rows for the table
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

  rows.sort((a, b) => a.epochApproach - b.epochApproach);
  return rows;
}

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
      "NeoWs response failed schema validation",
      parsed.error.format()
    );
  }

  return flattenNeoFeed(parsed.data);
}

// parses the text block between $$SOE and $$EOE into state vectors
function parseHorizonsVectors(resultText: string): StateVector[] {
  const soeIndex = resultText.indexOf("$$SOE");
  const eoeIndex = resultText.indexOf("$$EOE");

  if (soeIndex === -1 || eoeIndex === -1) {
    throw new HorizonsParseError(
      "Could not find $$SOE / $$EOE markers in result",
      resultText
    );
  }

  const dataBlock = resultText.slice(soeIndex + 5, eoeIndex).trim();
  const vectors: StateVector[] = [];
  const lines = dataBlock.split("\n").map((l) => l.trim());
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // look for Julian Date line (e.g. 2460310.500000000)
    const jdMatch = line.match(/^(\d+\.\d+)\s*=?\s*(.*)/);
    if (jdMatch) {
      const jdtdb = parseFloat(jdMatch[1]);
      const calendarDate = jdMatch[2]?.replace(/^=\s*/, "").trim() ?? "";

      let x = 0, y = 0, z = 0, vx = 0, vy = 0, vz = 0;

      // next few lines have position (X/Y/Z) and velocity (VX/VY/VZ)
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

export async function fetchHorizonsEphemeris(
  designation: string,
  center: string = "500@399",
  startTime?: string,
  stopTime?: string
): Promise<{ vectors: StateVector[]; rawResult: string }> {
  const params = new URLSearchParams({
    designation,
    center,
  });
  if (startTime) params.set("start_time", startTime);
  if (stopTime) params.set("stop_time", stopTime);

  // Always use a relative URL so it works seamlessly on deployed environments
  const response = await fetch(`/api/horizons?${params.toString()}`);

  if (!response.ok) {
    throw new NetworkError(
      `JPL Horizons returned HTTP ${response.status}`,
      response.status
    );
  }

  const json: unknown = await response.json();
  const parsed = HorizonsResponseSchema.safeParse(json);

  if (!parsed.success) {
    throw new ApiValidationError(
      "Horizons response failed schema validation",
      parsed.error.format()
    );
  }

  const rawResult = parsed.data.result;

  if (
    rawResult.includes("No matches found") ||
    rawResult.includes("Cannot find")
  ) {
    throw new HorizonsParseError(
      `Could not resolve designation "${designation}"`,
      rawResult
    );
  }

  if (!rawResult.includes("$$SOE")) {
    return { vectors: [], rawResult };
  }

  const vectors = parseHorizonsVectors(rawResult);
  return { vectors, rawResult };
}
