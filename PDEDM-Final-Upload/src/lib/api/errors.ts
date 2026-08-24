/**
 * Custom error classes for API client operations.
 * Provides structured error handling across the data pipeline.
 */

export class ApiValidationError extends Error {
  public readonly zodErrors: unknown;

  constructor(message: string, zodErrors: unknown) {
    super(message);
    this.name = "ApiValidationError";
    this.zodErrors = zodErrors;
  }
}

export class RateLimitError extends Error {
  public readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super(
      `NASA API rate limit exceeded. Retry after ${retryAfterSeconds} seconds.`
    );
    this.name = "RateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class HorizonsParseError extends Error {
  public readonly rawResult: string;

  constructor(message: string, rawResult: string) {
    super(message);
    this.name = "HorizonsParseError";
    this.rawResult = rawResult;
  }
}

export class NetworkError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "NetworkError";
    this.statusCode = statusCode;
  }
}
