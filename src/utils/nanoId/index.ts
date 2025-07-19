/**
 * Generates a cryptographically secure random ID with exceptional performance
 *
 * @param {number} size - Length of the generated ID (default: 21)
 * @param {string|Symbol} [alphabet] - Custom alphabet or predefined alphabet symbol (default: URL-safe alphabet)
 * @returns {string} A cryptographically secure unique random ID
 *
 * @example
 * // Default usage (21 character ID with URL-safe alphabet)
 * import { generateNanoID } from './nanoid';
 * const id = generateNanoID();
 * // => "JVxF3bDr9SHbmv6FLkM5c"
 *
 * @example
 * // Custom length (10 characters)
 * const shortId = generateNanoID(10);
 * // => "X1c5DwMj9r"
 *
 * @example
 * // Using predefined alphabets
 * const safeId = generateNanoID(16, ALPHABET.NO_CONFUSION);
 * // => "AhG7TpJrXmQfWk9B"
 *
 * @example
 * // Custom alphabet
 * const hexId = generateNanoID(16, "0123456789abcdef");
 * // => "a7d53f8e2c0b4916"
 *
 * @throws {Error} If size is not a positive integer
 * @throws {Error} If secure random generation is not supported in the environment
 * @throws {Error} If alphabet length is less than 2
 */

// Predefined alphabets for common use cases
export const ALPHABET = {
	DEFAULT: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_",
	NO_CONFUSION: "346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz",
	HEX: "0123456789abcdef",
	NUMERIC: "0123456789",
} as const;

// Minimum recommended entropy bits for secure IDs
const MIN_RECOMMENDED_ENTROPY = 64;

/**
 * Get cryptographically secure random values across different environments
 * @param {Uint8Array} buffer - Buffer to fill with random values
 * @returns {Uint8Array} Filled buffer
 * @throws {Error} If secure random generation is not supported
 */
function getSecureRandomValues(buffer: Uint8Array): Uint8Array {
	// Browser environment
	if (typeof crypto !== "undefined" && crypto.getRandomValues) {
		return crypto.getRandomValues(buffer);
	}

	// Node.js environment
	if (typeof process === "object" && process.versions && process.versions.node) {
		// Use CommonJS require() dynamically to avoid bundler issues
		try {
			const nodeCrypto = require("crypto");
			nodeCrypto.randomFillSync(buffer);
			return buffer;
		} catch (e) {
			throw new Error("Node.js crypto module not available. Please ensure you have a compatible Node.js version.");
		}
	}

	// Web worker or other environment
	if (typeof self === "object" && self.crypto && self.crypto.getRandomValues) {
		return self.crypto.getRandomValues(buffer);
	}

	throw new Error("Secure random number generation not supported in this environment. Consider using a polyfill.");
}

/**
 * Calculate optimal step size for random byte generation
 * @param {number} mask - Bitmask value
 * @param {number} size - ID length
 * @param {number} len - Alphabet length
 * @returns {number} Optimal step size
 */
function calculateOptimalStep(mask: number, size: number, len: number): number {
	// For small alphabets (especially for powers of 2), we need fewer random bytes
	// For larger alphabets, we need more random bytes to compensate for rejection sampling
	const efficiency = isPowerOf2(len) ? 1.0 : len < 16 ? 1.1 : 1.5;
	return Math.ceil((efficiency * mask * size) / len);
}

/**
 * Check if a number is a power of 2
 * @param {number} n - Number to check
 * @returns {boolean} True if the number is a power of 2
 */
function isPowerOf2(n: number): boolean {
	return (n & (n - 1)) === 0 && n > 0;
}

/**
 * Check if entropy is sufficient for security
 * @param {number} size - ID length
 * @param {number} alphabetLength - Alphabet length
 * @returns {boolean} True if entropy is sufficient
 */
function hasAdequateEntropy(size: number, alphabetLength: number): boolean {
	const entropyPerChar = Math.log2(alphabetLength);
	return entropyPerChar * size >= MIN_RECOMMENDED_ENTROPY;
}

export function generateNanoID(size: number = 21, alphabet: string | keyof typeof ALPHABET = ALPHABET.DEFAULT): string {
	// Resolve alphabet if a predefined key is provided
	const alphabetStr: string = typeof alphabet === "string" ? alphabet : ALPHABET[alphabet] || ALPHABET.DEFAULT;

	// Input validation
	if (size <= 0 || !Number.isInteger(size)) throw new Error("Size must be a positive integer");

	if (alphabetStr.length < 2) throw new Error("Alphabet must contain at least 2 characters");

	// Calculate entropy and warn if insufficient
	const len = alphabetStr.length;
	const entropyPerChar = Math.log2(len);
	const totalEntropy = entropyPerChar * size;

	if (!hasAdequateEntropy(size, len)) {
		console.warn(
			`Security warning: This ID configuration provides only ${totalEntropy.toFixed(2)} bits of entropy, ` +
				`which is below the recommended minimum of ${MIN_RECOMMENDED_ENTROPY} bits. ` +
				`Consider increasing the ID length or using a larger alphabet.`
		);
	}

	// Special case for power-of-2 alphabet sizes (allows for a much faster algorithm)
	if (isPowerOf2(len)) return generatePowerOf2ID(size, alphabetStr);

	// For general case alphabets
	// Calculate the bitmask based on the alphabet length (smallest number where mask >= len - 1)
	const mask = (2 << (31 - Math.clz32((len - 1) | 1))) - 1;

	// Calculate optimal step size to minimize wasted random bytes
	const step = calculateOptimalStep(mask, size, len);

	// Choose the most efficient string building strategy based on ID size
	return size <= 16 ? generateSmallID(size, alphabetStr, mask, step) : generateLargeID(size, alphabetStr, mask, step);
}

/**
 * Optimized generator for alphabets with length = power of 2
 * @param {number} size - ID length
 * @param {string} alphabet - Character set
 * @returns {string} Generated ID
 */
function generatePowerOf2ID(size: number, alphabet: string): string {
	const len = alphabet.length;
	const mask = len - 1; // For power of 2, mask is just len-1

	// For small IDs, use direct string building
	if (size <= 16) {
		let result = "";
		const bytes = new Uint8Array(size);
		getSecureRandomValues(bytes);

		// No rejection sampling needed for power-of-2 alphabets
		for (let i = 0; i < size; i++) {
			result += alphabet[bytes[i] & mask];
		}

		return result;
	} else {
		// For larger IDs, use array joining
		const result = new Array(size);
		const bytes = new Uint8Array(size);
		getSecureRandomValues(bytes);

		for (let i = 0; i < size; i++) result[i] = alphabet[bytes[i] & mask];

		return result.join("");
	}
}

/**
 * Optimized generator for small IDs (≤16 chars)
 * @param {number} size - ID length
 * @param {string} alphabet - Character set
 * @param {number} mask - Bitmask value
 * @param {number} step - Random bytes step size
 * @returns {string} Generated ID
 */
function generateSmallID(size: number, alphabet: string, mask: number, step: number): string {
	const len = alphabet.length;
	let result = "";

	// Generate random bytes in bulk
	const bytes = new Uint8Array(step);
	getSecureRandomValues(bytes);

	let i = 0; // Position in result
	let j = 0; // Position in random bytes

	// Main loop with unbiased sampling algorithm
	while (i < size) {
		// If we're out of random bytes, generate more
		if (j >= bytes.length) {
			getSecureRandomValues(bytes);
			j = 0;
		}

		// Apply mask to get unbiased random value
		const r = bytes[j] & mask;
		j++;

		// Skip values outside our alphabet range
		if (r >= len) continue;

		// Add character to result
		result += alphabet[r];
		i++;
	}

	return result;
}

/**
 * Optimized generator for large IDs (>16 chars)
 * @param {number} size - ID length
 * @param {string} alphabet - Character set
 * @param {number} mask - Bitmask value
 * @param {number} step - Random bytes step size
 * @returns {string} Generated ID
 */
function generateLargeID(size: number, alphabet: string, mask: number, step: number): string {
	const len = alphabet.length;
	const result = new Array(size);

	// Generate random bytes in bulk
	const bytes = new Uint8Array(step);
	getSecureRandomValues(bytes);

	let i = 0; // Position in result
	let j = 0; // Position in random bytes

	// Main loop with unbiased sampling algorithm
	while (i < size) {
		// If we're out of random bytes, generate more
		if (j >= bytes.length) {
			getSecureRandomValues(bytes);
			j = 0;
		}

		// Apply mask to get unbiased random value
		const r = bytes[j] & mask;
		j++;

		// Skip values outside our alphabet range
		if (r >= len) continue;

		// Add character to result
		result[i] = alphabet[r];
		i++;
	}

	// Join at the end (faster than string concatenation in a loop for large strings)
	return result.join("");
}

/**
 * Calculates collision probability for given ID parameters
 *
 * @param {number} size - Length of the ID
 * @param {number} alphabetSize - Number of characters in the alphabet
 * @param {number} idCount - Number of IDs generated
 * @returns {number} Probability of at least one collision as a percentage
 */
export function calculateCollisionProbability(size: number, alphabetSize: number, idCount: number): number {
	// For large values, use an approximation to avoid precision issues
	if (size * Math.log2(alphabetSize) > 60) {
		// Use approximation formula for birthday paradox
		const possibilities = Math.pow(alphabetSize, size);
		const exponent = -((idCount * (idCount - 1)) / (2 * possibilities));
		return (1 - Math.exp(exponent)) * 100;
	} else {
		// Direct calculation for smaller values
		const possibilities = Math.pow(alphabetSize, size);
		return (1 - Math.pow((possibilities - 1) / possibilities, (idCount * (idCount - 1)) / 2)) * 100;
	}
}

/**
 * Recommends minimum ID size for a given alphabet and desired security level
 *
 * @param {number} alphabetSize - Number of characters in the alphabet
 * @param {number} idCount - Number of IDs you plan to generate
 * @param {number} maxCollisionProbability - Maximum acceptable collision probability (in percentage)
 * @returns {number} Recommended minimum ID size
 */
export function recommendIdSize(alphabetSize: number, idCount: number, maxCollisionProbability: number = 0.0000001): number {
	// Calculate bits needed based on birthday paradox
	const p = maxCollisionProbability / 100;
	const n = idCount;

	// Use approximation formula for required bits
	const bitsNeeded = Math.ceil(Math.log2((n * n) / (-2 * Math.log(1 - p))));

	// Convert bits to characters in the given alphabet
	const entropyPerChar = Math.log2(alphabetSize);
	return Math.ceil(bitsNeeded / entropyPerChar);
}

// Export default for backward compatibility
export default generateNanoID;
