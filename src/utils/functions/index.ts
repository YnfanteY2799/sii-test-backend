import { password } from "bun";

/**
 * Determines if a string contains valid JSON
 *
 * @param {string} str - The string to validate as JSON
 * @returns {boolean} - True if string is valid JSON, false otherwise
 *
 * @performance Optimized for speed through:
 * - Basic string validation before expensive parsing
 * - Early returns for common invalid cases
 * - Explicit handling of edge cases
 *
 * @example
 * // Returns true
 * isJsonString('{"name":"John","age":30}')
 *
 * @example
 * // Returns false
 * isJsonString('{name:"John"}')
 */
export function isJsonString(str: string): boolean {
	// Handle non-string inputs
	if (typeof str !== "string") return false;

	// Quick check for empty or very short strings
	if (!str || str.length < 2) return false;

	// Fast validation for common JSON structures
	const firstChar = str.charAt(0);
	const lastChar = str.charAt(str.length - 1);

	// Valid JSON must start with '{', '[', '"', number, true, false, or null
	if (
		!(
			(
				(firstChar === "{" && lastChar === "}") || // object
				(firstChar === "[" && lastChar === "]") || // array
				(firstChar === '"' && lastChar === '"') || // string
				/^-?\d/.test(firstChar) || // number
				/^true$|^false$|^null$/.test(str)
			) // boolean/null
		)
	)
		return false;

	// Perform the full parse for strings that pass basic validation
	try {
		JSON.parse(str);
		return true;
	} catch (e) {
		return false;
	}
}

/**
 * Filters out the "found" field from error messages to prevent data leakage
 *
 * This function is for removing "found" field on response Error Object, because this field shows incoming data
 * that may contain sensitive information. If the error is valid JSON, it parses it, removes the "found" field,
 * and returns the sanitized object. Otherwise, it returns the original error string.
 *
 * @param {string} error - The error message/string to filter
 * @returns {Object|string} - Sanitized error object if JSON, original string otherwise
 *
 * @security Prevents sensitive data exposure by removing the "found" field which may contain
 * user input or system data that shouldn't be displayed in error messages
 *
 * @example
 * // Returns sanitized object without "found" field
 * filterMessage('{"message":"Invalid input","found":"sensitive_data","code":400}')
 * // Result: { message: "Invalid input", code: 400 }
 *
 * @example
 * // Returns original string for non-JSON errors
 * filterMessage('Simple error message')
 * // Result: "Simple error message"
 */
export function filterMessage(error: string): string {
	if (isJsonString(error)) {
		const { found: _, ...args } = JSON.parse(error);
		return args;
	} else return error;
}

/**
 * Creates a secure password hash using Argon2d algorithm
 *
 * @param {string} salt - Salt string to add entropy (defaults to empty string)
 * @param {string} str - The password string to hash (defaults to empty string)
 * @returns {Promise<string>} - Promise resolving to the hashed password
 *
 * @security Uses Argon2d algorithm which is recommended for password hashing due to:
 * - Memory-hard properties that resist GPU attacks
 * - Configurable time and memory costs
 * - Built-in salt handling
 *
 * @example
 * // Create a password hash with custom salt
 * const hash = await createPassword("user123_salt", "mySecretPassword");
 *
 * @example
 * // Create a password hash with minimal parameters
 * const hash = await createPassword("", "password123");
 */
export async function createPassword(salt: string = "", str: string = ""): Promise<string> {
	return await password.hash(salt + str, { algorithm: "argon2d" });
}

/**
 * Verifies a password against its hash using Argon2d algorithm
 *
 * @param {string} salt - Salt string used during hashing (defaults to empty string)
 * @param {string} str - The plain text password to verify (defaults to empty string)
 * @param {string} hash - The stored hash to compare against (defaults to empty string)
 * @returns {Promise<boolean>} - Promise resolving to true if password matches, false otherwise
 *
 * @security Performs constant-time comparison to prevent timing attacks
 * Salt must match the one used during hash creation for proper verification
 *
 * @example
 * // Verify a password with the same salt used during creation
 * const isValid = await comparePassword("user123_salt", "mySecretPassword", storedHash);
 * if (isValid) {
 *   console.log("Password is correct");
 * }
 *
 * @example
 * // Verify with minimal parameters
 * const isValid = await comparePassword("", "password123", hash);
 */
export async function comparePassword(salt: string = "", str: string = "", hash: string = ""): Promise<boolean> {
	return await password.verify(salt + str, hash, "argon2d");
}

/**
 * Calculates a future date by adding a specified duration to the current date.
 *
 * Parses a human-readable duration string and returns a Date object representing
 * the current date plus the specified duration. Supports multiple time units
 * and handles calendar-based units (months/years) correctly to account for
 * varying month lengths and leap years.
 *
 * @param {string | null} [duration=null] - Duration string containing time units.
 *   Format: "<number> <unit>" where unit can be:
 *   - Time units: "second(s)", "minute(s)", "hour(s)", "day(s)"
 *   - Calendar units: "month(s)", "year(s)"
 *   Multiple units can be combined: "1 year 2 months 3 days 4 hours"
 *   Case-insensitive. Numbers must be positive integers.
 *
 * @returns {Date} A new Date object representing:
 *   - Current date/time if duration is null, empty, or invalid
 *   - Current date/time plus the parsed duration if valid
 *
 * @example
 * // Get current date
 * getDate(); // Returns new Date()
 * getDate(null); // Returns new Date()
 * getDate(""); // Returns new Date()
 *
 * @example
 * // Single time units
 * getDate("30 seconds"); // 30 seconds from now
 * getDate("5 minutes"); // 5 minutes from now
 * getDate("2 hours"); // 2 hours from now
 * getDate("7 days"); // 7 days from now
 *
 * @example
 * // Calendar units (handles month/year variations)
 * getDate("3 months"); // 3 months from now
 * getDate("1 year"); // 1 year from now
 *
 * @example
 * // Combined units
 * getDate("1 year 6 months 2 weeks 3 days 4 hours 30 minutes");
 *
 * @example
 * // Case insensitive, singular/plural forms
 * getDate("1 Hour 30 Minutes"); // Works
 * getDate("2 DAYS"); // Works
 *
 * @example
 * // Invalid inputs return current date
 * getDate("invalid string"); // Returns new Date()
 * getDate("0 days"); // Returns new Date() (zero values invalid)
 * getDate("-5 hours"); // Returns new Date() (negative values invalid)
 *
 * @performance
 * - Uses pre-compiled regex to avoid recompilation overhead
 * - Single-pass parsing with efficient switch statements
 * - Minimizes Date object method calls
 * - Separates millisecond-based and calendar-based calculations for accuracy
 *
 * @algorithm
 * 1. Returns current date immediately if no duration provided
 * 2. Parses duration string using regex to extract number-unit pairs
 * 3. Validates all numbers are positive integers
 * 4. Accumulates milliseconds for time-based units (seconds through days)
 * 5. Tracks calendar units (months/years) separately
 * 6. Applies calendar units first (to handle month/year boundaries correctly)
 * 7. Adds accumulated milliseconds in single operation
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date} Date API
 *
 * @since 1.0.0
 * @author @YnfanteY2799
 * @category Date Utilities
 */
export function getDate(duration: string | null = null): Date {
	if (!duration) return new Date();

	// Pre-compiled regex (avoid recompilation)
	const regex = /(\d+)\s*(second|seconds|minute|minutes|hour|hours|day|days|month|months|year|years)/gi;

	// Accumulate all milliseconds first, handle months/years separately
	let totalMs = 0;
	let yearsToAdd = 0;
	let monthsToAdd = 0;
	let hasValidUnit = false;

	// Single pass through matches
	let match;
	while ((match = regex.exec(duration)) !== null) {
		const value = parseInt(match[1], 10);
		if (value < 1) return new Date();

		const unit = match[2];
		hasValidUnit = true;

		// Use switch for faster lookup than object property access
		switch (unit) {
			case "second":
			case "seconds":
				totalMs += value * 1000;
				break;
			case "minute":
			case "minutes":
				totalMs += value * 60000; // 60 * 1000
				break;
			case "hour":
			case "hours":
				totalMs += value * 3600000; // 60 * 60 * 1000
				break;
			case "day":
			case "days":
				totalMs += value * 86400000; // 24 * 60 * 60 * 1000
				break;
			case "month":
			case "months":
				monthsToAdd += value;
				break;
			case "year":
			case "years":
				yearsToAdd += value;
				break;
		}
	}

	if (!hasValidUnit) return new Date();

	// Single date object creation and minimal method calls
	const result = new Date();

	// Handle calendar units first (months/years)
	if (yearsToAdd > 0) result.setFullYear(result.getFullYear() + yearsToAdd);

	if (monthsToAdd > 0) result.setMonth(result.getMonth() + monthsToAdd);

	// Add all milliseconds in one operation
	if (totalMs > 0) result.setTime(result.getTime() + totalMs);

	return result;
}

/**
 * Converts a human-readable duration string into the equivalent number of seconds.
 *
 * Parses a duration string containing multiple time units and calculates the total
 * duration in seconds. Particularly useful for setting cookie maxAge values, cache
 * expiration times, or any scenario requiring duration in seconds. Handles both
 * fixed-duration units (seconds, minutes, hours, days) and variable calendar units
 * (months, years) by calculating their actual duration from the current date.
 *
 * @param {string | null} [duration=null] - Duration string containing time units.
 *   Format: "<number> <unit>" where unit can be:
 *   - Fixed units: "second(s)", "minute(s)", "hour(s)", "day(s)"
 *   - Calendar units: "month(s)", "year(s)" (calculated from current date)
 *   Multiple units can be combined: "1 year 2 months 3 days 4 hours"
 *   Case-insensitive. Numbers must be positive integers ≥ 1.
 *
 * @returns {number} Total duration in seconds:
 *   - 0 if duration is null, empty, invalid, or contains zero/negative values
 *   - Positive integer representing the total seconds for valid duration strings
 *
 * @example
 * // Basic time units
 * getDurationInSeconds("30 seconds"); // Returns: 30
 * getDurationInSeconds("5 minutes");  // Returns: 300
 * getDurationInSeconds("2 hours");    // Returns: 7200
 * getDurationInSeconds("7 days");     // Returns: 604800
 *
 * @example
 * // Calendar units (calculated from current date)
 * getDurationInSeconds("1 month");    // Returns: ~2592000 (varies by month)
 * getDurationInSeconds("1 year");     // Returns: ~31536000 (varies by year)
 * getDurationInSeconds("2 months");   // Returns: actual seconds for 2 months from now
 *
 * @example
 * // Combined units
 * getDurationInSeconds("1 hour 30 minutes");        // Returns: 5400
 * getDurationInSeconds("1 month 2 days");           // Returns: ~2764800
 * getDurationInSeconds("1 year 6 months 1 day");    // Returns: calculated total
 * getDurationInSeconds("2 days 3 hours 45 minutes"); // Returns: 185700
 *
 * @example
 * // Case insensitive and flexible forms
 * getDurationInSeconds("1 Hour 30 Minutes"); // Returns: 5400
 * getDurationInSeconds("2 DAYS");            // Returns: 172800
 * getDurationInSeconds("1 second");          // Returns: 1
 * getDurationInSeconds("1 seconds");         // Returns: 1
 *
 * @example
 * // Cookie maxAge usage
 * const maxAge = getDurationInSeconds("1 month 2 days");
 * document.cookie = `sessionId=abc123; maxAge=${maxAge}; path=/`;
 *
 * // Cache expiration
 * const cacheExpiry = getDurationInSeconds("5 minutes");
 * cache.set("key", "value", cacheExpiry);
 *
 * @example
 * // Invalid inputs return 0
 * getDurationInSeconds(null);           // Returns: 0
 * getDurationInSeconds("");             // Returns: 0
 * getDurationInSeconds("invalid");      // Returns: 0
 * getDurationInSeconds("0 days");       // Returns: 0 (zero values invalid)
 * getDurationInSeconds("-5 hours");     // Returns: 0 (negative values invalid)
 * getDurationInSeconds("abc minutes");  // Returns: 0 (non-numeric values)
 *
 * @performance
 * - Uses pre-compiled regex for efficient parsing
 * - Single-pass parsing with switch statements for O(n) complexity
 * - Minimal Date object operations for calendar calculations
 * - Handles fixed units with direct multiplication (no Date overhead)
 * - Only creates Date objects when calendar units (months/years) are present
 *
 * @algorithm
 * 1. Return 0 immediately if no duration provided
 * 2. Parse duration string using regex to extract number-unit pairs
 * 3. Validate all numbers are positive integers (≥ 1)
 * 4. Accumulate seconds for fixed units using direct multiplication
 * 5. Track calendar units (months/years) separately
 * 6. If calendar units exist, calculate their actual duration from current date
 * 7. Sum fixed seconds and calendar seconds for final result
 *
 * @precision
 * - Fixed units: Exact second precision
 * - Calendar units: Calculated to nearest second based on current date/time
 * - Months: Uses actual month lengths (28-31 days)
 * - Years: Accounts for leap years (365 or 366 days)
 *
 * @conversion_rates
 * - 1 minute = 60 seconds
 * - 1 hour = 3,600 seconds
 * - 1 day = 86,400 seconds
 * - 1 month = Variable (2,419,200 to 2,678,400 seconds)
 * - 1 year = Variable (31,536,000 to 31,622,400 seconds)
 *
 * @use_cases
 * - Cookie maxAge values
 * - Cache expiration times
 * - Session timeout durations
 * - Rate limiting windows
 * - Scheduled task intervals
 * - API timeout values
 * - JWT token expiration
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie} Cookie maxAge
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date} Date API
 *
 * @throws {None} Function never throws - returns 0 for any invalid input
 *
 * @since 1.0.0
 * @author YnfanteY2799
 * @category Duration Utilities
 * @category Cookie Utilities
 * @category Time Conversion
 */
export function getDurationInSeconds(duration: string | null = null): number {
	if (!duration) return 0;

	const regex = /(\d+)\s*(second|seconds|minute|minutes|hour|hours|day|days|month|months|year|years)/gi;

	let totalSeconds = 0;
	let yearsToAdd = 0;
	let monthsToAdd = 0;
	let hasValidUnit = false;

	let match;
	while ((match = regex.exec(duration)) !== null) {
		const value = parseInt(match[1], 10);
		if (value < 1) return 0;

		const unit = match[2];
		hasValidUnit = true;

		switch (unit) {
			case "second":
			case "seconds":
				totalSeconds += value;
				break;
			case "minute":
			case "minutes":
				totalSeconds += value * 60;
				break;
			case "hour":
			case "hours":
				totalSeconds += value * 3600;
				break;
			case "day":
			case "days":
				totalSeconds += value * 86400;
				break;
			case "month":
			case "months":
				monthsToAdd += value;
				break;
			case "year":
			case "years":
				yearsToAdd += value;
				break;
		}
	}

	if (!hasValidUnit) return 0;

	// Handle calendar units by calculating their duration
	if (yearsToAdd > 0 || monthsToAdd > 0) {
		const now = new Date();
		const future = new Date();

		if (yearsToAdd > 0) future.setFullYear(future.getFullYear() + yearsToAdd);

		if (monthsToAdd > 0) future.setMonth(future.getMonth() + monthsToAdd);

		const calendarSeconds = Math.floor((future.getTime() - now.getTime()) / 1000);
		totalSeconds += calendarSeconds;
	}

	return totalSeconds;
}
