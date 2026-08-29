import { z } from "zod";

// NASA sends some numbers as strings (e.g. "15.89") so we need to coerce them
const coercedNumericString = z
  .union([z.string(), z.number(), z.null()])
  .transform((val) => {
    if (val === null || val === undefined) return 0;
    const parsed = typeof val === "number" ? val : parseFloat(val);
    return Number.isNaN(parsed) ? 0 : parsed;
  });

// NeoWs schemas

const DiameterRangeSchema = z.object({
  estimated_diameter_min: z.number().catch(0),
  estimated_diameter_max: z.number().catch(0),
});

const EstimatedDiameterSchema = z.object({
  kilometers: DiameterRangeSchema.catch({ estimated_diameter_min: 0, estimated_diameter_max: 0 }),
  meters: DiameterRangeSchema.catch({ estimated_diameter_min: 0, estimated_diameter_max: 0 }),
  miles: DiameterRangeSchema.catch({ estimated_diameter_min: 0, estimated_diameter_max: 0 }),
  feet: DiameterRangeSchema.catch({ estimated_diameter_min: 0, estimated_diameter_max: 0 }),
});

const RelativeVelocitySchema = z.object({
  kilometers_per_second: coercedNumericString,
  kilometers_per_hour: coercedNumericString,
  miles_per_hour: coercedNumericString,
});

const MissDistanceSchema = z.object({
  astronomical: coercedNumericString,
  lunar: coercedNumericString,
  kilometers: coercedNumericString,
  miles: coercedNumericString,
});

const CloseApproachDataSchema = z.object({
  close_approach_date: z.string().catch("Unknown"),
  close_approach_date_full: z.string().nullable().catch(null),
  epoch_date_close_approach: z.number().catch(0),
  relative_velocity: RelativeVelocitySchema,
  miss_distance: MissDistanceSchema,
  orbiting_body: z.string().catch("Earth"),
});

export const NeoObjectSchema = z.object({
  id: z.string(),
  neo_reference_id: z.string(),
  name: z.string(),
  nasa_jpl_url: z.string().url().catch(""),
  absolute_magnitude_h: z.number().catch(0),
  estimated_diameter: EstimatedDiameterSchema,
  is_potentially_hazardous_asteroid: z.boolean().catch(false),
  close_approach_data: z.array(CloseApproachDataSchema).catch([]),
  is_sentry_object: z.boolean().catch(false),
});

const FeedLinksSchema = z.object({
  next: z.string().optional(),
  previous: z.string().optional(),
  self: z.string().optional(),
});

export const NeoWsFeedSchema = z.object({
  links: FeedLinksSchema.catch({}),
  element_count: z.number().catch(0),
  near_earth_objects: z.record(z.string(), z.array(NeoObjectSchema)).catch({}),
});

// flattened row for the data table
export interface NeoTableRow {
  id: string;
  name: string;
  nasaJplUrl: string;
  absoluteMagnitude: number;
  diameterMinMeters: number;
  diameterMaxMeters: number;
  isHazardous: boolean;
  isSentryObject: boolean;
  approachDate: string;
  approachDateFull: string | null;
  epochApproach: number;
  velocityKmPerSec: number;
  velocityKmPerHour: number;
  missDistanceKm: number;
  missDistanceAu: number;
  missDistanceLunar: number;
  orbitingBody: string;
}

// JPL Horizons response

const HorizonsSignatureSchema = z.object({
  source: z.string().catch("NASA/JPL Horizons API"),
  version: z.string().catch("unknown"),
});

export const HorizonsResponseSchema = z.object({
  signature: HorizonsSignatureSchema.catch({ source: "NASA/JPL Horizons API", version: "unknown" }),
  result: z.string(),
});

// parsed state vector from the $$SOE/$$EOE block in horizons output
export interface StateVector {
  jdtdb: number;
  calendarDate: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}

// inferred types
export type NeoWsFeed = z.infer<typeof NeoWsFeedSchema>;
export type NeoObject = z.infer<typeof NeoObjectSchema>;
export type CloseApproachData = z.infer<typeof CloseApproachDataSchema>;
export type HorizonsResponse = z.infer<typeof HorizonsResponseSchema>;
