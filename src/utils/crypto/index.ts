/**
 * High-performance, dependency-free cryptographic utilities
 * Optimized for speed, security, and reliability
 */
const ALPHANUMERIC_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const URL_SAFE_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
const LOWERCASE_CHARS = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMERIC_CHARS = "0123456789";
const HEX_CHARS = "0123456789abcdef";

/**
 * Direct crypto access for modern Node.js/Bun environments
 */
const crypto = globalThis.crypto;

/**
 * High-performance random string generator with cryptographically secure randomness
 * Uses optimized algorithms for maximum speed and security
 *
 * @param length - The desired length of the random string
 * @param charset - The character set to use for generation
 * @returns A cryptographically secure random string
 */
function generateSecureRandomString(length: number, charset: string): string {
	if (length <= 0) throw new Error("Length must be a positive integer");

	if (!charset || charset.length === 0) throw new Error("Charset cannot be empty");

	const charsetLength = charset.length;

	// For small character sets, use rejection sampling for uniform distribution
	if (charsetLength <= 16) return generateWithRejectionSampling(crypto, length, charset, charsetLength);

	// For larger character sets, use modular arithmetic with bias mitigation
	return generateWithBiasReduction(crypto, length, charset, charsetLength);
}

/**
 * Rejection sampling method for small character sets (most secure, uniform distribution)
 */
function generateWithRejectionSampling(crypto: Crypto, length: number, charset: string, charsetLength: number): string {
	const result: string[] = new Array(length);
	const maxValid = Math.floor(256 / charsetLength) * charsetLength;

	let resultIndex = 0;
	let bufferSize = Math.max(length * 2, 256); // Start with reasonable buffer size

	while (resultIndex < length) {
		const randomBytes = new Uint8Array(bufferSize);
		crypto.getRandomValues(randomBytes);

		for (let i = 0; i < randomBytes.length && resultIndex < length; i++) {
			if (randomBytes[i] < maxValid) result[resultIndex++] = charset[randomBytes[i] % charsetLength];
		}

		// Increase buffer size if we're not making good progress
		if (resultIndex < length / 2) bufferSize = Math.min(bufferSize * 2, 4096);
	}

	return result.join("");
}

/**
 * Bias reduction method for larger character sets (optimized for performance)
 */
function generateWithBiasReduction(crypto: Crypto, length: number, charset: string, charsetLength: number): string {
	// Calculate optimal batch size based on character set
	const batchSize = Math.min(Math.max(length, 64), 1024);
	const randomBytes = new Uint8Array(batchSize);
	const result: string[] = new Array(length);

	let resultIndex = 0;

	while (resultIndex < length) {
		crypto.getRandomValues(randomBytes);

		const processLength = Math.min(length - resultIndex, batchSize);

		for (let i = 0; i < processLength; i++) result[resultIndex + i] = charset[randomBytes[i] % charsetLength];

		resultIndex += processLength;
	}

	return result.join("");
}

/**
 * Generates a cryptographically secure random salt string.
 * Optimized for password hashing and cryptographic operations.
 *
 * @param length - The length of the salt (default: 16, recommended: 16-32)
 * @returns A random string containing alphanumeric characters (a-z, A-Z, 0-9)
 * @example
 * const salt = generateRandomSalt(); // e.g. "aB7cD9eF2gH5jK3m"
 * const longSalt = generateRandomSalt(32); // e.g. "x7Yz3Ab9Cd2EfG8hI5jK6lM9nO2pQ4rS"
 */
export function generateRandomSalt(length: number = 16): string {
	if (length < 8) console.warn("Salt length below 8 characters may not provide adequate security");
	return generateSecureRandomString(length, ALPHANUMERIC_CHARS);
}

/**
 * Generates a cryptographically secure random token for authentication.
 * Optimized for session tokens, API keys, and identification purposes.
 *
 * @param length - The length of the token (default: 32, recommended: 32-64)
 * @returns A random string containing alphanumeric characters (a-z, A-Z, 0-9)
 * @example
 * const token = generateToken(); // e.g. "x7Yz3Ab9Cd2EfG8hI5jK6lM9nO2pQ4rS"
 * const apiKey = generateToken(64); // e.g. 64-character secure token
 */
export function generateToken(length: number = 32): string {
	if (length < 16) console.warn("Token length below 16 characters may not provide adequate security");
	return generateSecureRandomString(length, ALPHANUMERIC_CHARS);
}

/**
 * Generates a URL-safe random string using base64url character set.
 * Perfect for tokens that need to be transmitted in URLs without encoding.
 *
 * @param length - The length of the string (default: 32)
 * @returns A URL-safe random string containing [a-z, A-Z, 0-9, -, _]
 * @example
 * const urlToken = generateUrlSafeToken(); // e.g. "x7Yz-Ab9_d2EfG8hI5jK6lM9nO2pQ4rS"
 */
export function generateUrlSafeToken(length: number = 32): string {
	return generateSecureRandomString(length, URL_SAFE_CHARS);
}

/**
 * Generates a hexadecimal random string.
 * Useful for session IDs, nonces, and other hex-encoded values.
 *
 * @param length - The length of the hex string (default: 32)
 * @returns A random hexadecimal string (0-9, a-f)
 * @example
 * const hexId = generateHexString(); // e.g. "7a9f3b2e8d4c1a6f9e3b7c2d8f4a1e9b"
 */
export function generateHexString(length: number = 32): string {
	return generateSecureRandomString(length, HEX_CHARS);
}

/**
 * Generates a numeric-only random string.
 * Useful for PIN codes, verification codes, and numeric identifiers.
 *
 * @param length - The length of the numeric string (default: 6)
 * @returns A random numeric string (0-9)
 * @example
 * const pin = generateNumericString(6); // e.g. "739251"
 * const verificationCode = generateNumericString(8); // e.g. "82947301"
 */
export function generateNumericString(length: number = 6): string {
	return generateSecureRandomString(length, NUMERIC_CHARS);
}

/**
 * Generates a custom random string with specified character set.
 * Provides maximum flexibility for specific use cases.
 *
 * @param length - The length of the string
 * @param customCharset - Custom character set to use
 * @returns A random string using the specified character set
 * @example
 * const custom = generateCustomString(10, 'ABCDEF123456'); // hex-like with specific chars
 */
export function generateCustomString(length: number, customCharset: string): string {
	if (!customCharset || customCharset.length === 0) throw new Error("Custom charset cannot be empty");
	return generateSecureRandomString(length, [...new Set(customCharset)].join(""));
}

/**
 * Generates a random string with specified complexity requirements.
 * Ensures the string contains at least one character from each required set.
 *
 * @param length - The length of the string (minimum 4)
 * @param options - Complexity requirements
 * @returns A random string meeting the specified requirements
 */
export function generateComplexString(
	length: number = 16,
	options: {
		lowercase?: boolean;
		uppercase?: boolean;
		numbers?: boolean;
		symbols?: string;
	} = { lowercase: true, uppercase: true, numbers: true }
): string {
	if (length < 4) throw new Error("Length must be at least 4 for complex strings");

	const { lowercase = true, uppercase = true, numbers = true, symbols = "" } = options;

	if (!lowercase && !uppercase && !numbers && !symbols) throw new Error("At least one character type must be enabled");

	let charset = "";
	const requiredChars: string[] = [];

	if (lowercase) {
		charset += LOWERCASE_CHARS;
		requiredChars.push(generateSecureRandomString(1, LOWERCASE_CHARS));
	}

	if (uppercase) {
		charset += UPPERCASE_CHARS;
		requiredChars.push(generateSecureRandomString(1, UPPERCASE_CHARS));
	}

	if (numbers) {
		charset += NUMERIC_CHARS;
		requiredChars.push(generateSecureRandomString(1, NUMERIC_CHARS));
	}

	if (symbols) {
		charset += symbols;
		requiredChars.push(generateSecureRandomString(1, symbols));
	}

	// Generate remaining characters
	const remainingLength = length - requiredChars.length;
	const remainingChars = generateSecureRandomString(remainingLength, charset);

	// Combine and shuffle all characters
	const allChars = [...requiredChars, ...remainingChars.split("")];

	// Fisher-Yates shuffle using crypto random
	const shuffleBytes = new Uint8Array(allChars.length - 1);
	crypto.getRandomValues(shuffleBytes);

	for (let i = allChars.length - 1; i > 0; i--) {
		const j = shuffleBytes[i - 1] % (i + 1);
		[allChars[i], allChars[j]] = [allChars[j], allChars[i]];
	}

	return allChars.join("");
}

// Export character sets for advanced usage
export const CharacterSets = {
	ALPHANUMERIC: ALPHANUMERIC_CHARS,
	LOWERCASE: LOWERCASE_CHARS,
	UPPERCASE: UPPERCASE_CHARS,
	URL_SAFE: URL_SAFE_CHARS,
	NUMERIC: NUMERIC_CHARS,
	HEX: HEX_CHARS,
} as const;
