import { env } from "bun";
const errors: string[] = [];

// PORT validation
const portStr = env.PORT;
if (!portStr) errors.push("PORT is required");
else {
	const port = +portStr;
	if (port !== (port | 0) || port < 1024 || port > 65535) errors.push("PORT must be an integer between 1024-65535");
}

// BODY_SIZE validation
const bodySizeStr = env.BODY_SIZE;
if (!bodySizeStr) errors.push("BODY_SIZE is required");
else {
	const bodySize = +bodySizeStr;
	if (bodySize !== (bodySize | 0)) errors.push("BODY_SIZE must be a valid integer");
}

// REQUEST_WINDOW_MS validation
const windowMsStr = env.REQUEST_WINDOW_MS;
if (!windowMsStr) errors.push("REQUEST_WINDOW_MS is required");
else {
	const windowMs = +windowMsStr;
	if (windowMs !== (windowMs | 0)) errors.push("REQUEST_WINDOW_MS must be a valid integer");
}

// REQUEST_LIMIT_CALLS validation
const limitCallsStr = env.REQUEST_LIMIT_CALLS;
if (!limitCallsStr) errors.push("REQUEST_LIMIT_CALLS is required");
else {
	const limitCalls = +limitCallsStr;
	if (limitCalls !== (limitCalls | 0)) errors.push("REQUEST_LIMIT_CALLS must be a valid integer");
}

const jwtSecretKey = env.JWT_SECRET;
if (!jwtSecretKey || jwtSecretKey.length < 10) errors.push("JWT_SECRET is required and must be at least 10 characters");

const databaseUrl = env.DATABASE_URL;
if (!databaseUrl || databaseUrl.length < 10) errors.push("DATABASE_URL is required and must be at least 10 characters");

const jwtExpiresInTime = env.JWT_EXPIRES_IN;
if (!jwtExpiresInTime || jwtExpiresInTime.length < 2) errors.push("JWT_EXPIRES_IN is required and must be at least 2 characters");

// Single error check and exit (faster than multiple checks)
if (errors.length) {
	console.error("❌ Environment validation failed:");
	// Use for loop instead of forEach for better performance
	for (let i = 0; i < errors.length; i++) console.error(`  - ${errors[i]}`);

	process.exit(1);
}

// All validations passed - export as constants
// These become compile-time constants with zero runtime cost
export const currentEnv = env.NODE_ENV || "development";
export const jwtExpiresIn = jwtExpiresInTime ?? "365d";
export const requestLimitCalls = +limitCallsStr!;
export const requestWindowMs = +windowMsStr!;
export const maxBodySizeMb = +bodySizeStr!;
export const databaseUri = databaseUrl!;
export const jwtSecret = jwtSecretKey!;
export const serverPort = +portStr!;

// Pre-computed constants (compile-time calculations)
export const maxRequestWindowMaxSeconds = requestWindowMs * 1000;
export const maxRequestBodySize = ~(maxBodySizeMb << 20); // Bit shift is faster than * 1024 * 1024
export const maxRequestsPerWindow = requestLimitCalls;
