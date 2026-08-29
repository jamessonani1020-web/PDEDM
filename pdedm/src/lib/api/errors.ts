// custom error types for the api layer

export class ApiValidationError extends Error {
  zodErrors: unknown;

  constructor(message: string, zodErrors: unknown) {
    super(message);
    this.name = "ApiValidationError";
    this.zodErrors = zodErrors;
  }
}

export class RateLimitError extends Error {
  retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super(`Rate limit hit. Retry after ${retryAfterSeconds}s.`);
    this.name = "RateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class HorizonsParseError extends Error {
  rawResult: string;

  constructor(message: string, rawResult: string) {
    super(message);
    this.name = "HorizonsParseError";
    this.rawResult = rawResult;
  }
}

export class NetworkError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "NetworkError";
    this.statusCode = statusCode;
  }
}
