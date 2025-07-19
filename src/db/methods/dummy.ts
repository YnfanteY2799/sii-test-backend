import { jobs, users, countries, countriesStates, jobStatus, employmentTypes, workingModality, jobLanguages, languages, db } from "../index";
import { desc, asc, gt, lt, and, or, eq, sql, count } from "drizzle-orm";

// Types for pagination options
interface BasePaginationOptions {
	limit?: number;
	orderBy?: "createdAt" | "updatedAt" | "title";
	orderDirection?: "asc" | "desc";
	filters?: {
		countryId?: number;
		stateId?: number;
		employmentTypeId?: number;
		workingModalityId?: number;
		jobStatusId?: number;
		salaryMin?: number;
		salaryMax?: number;
		languageIds?: number[];
		searchTerm?: string;
	};
}

interface CursorPaginationOptions extends BasePaginationOptions {
	cursor?: string; // Job ID for cursor-based pagination
	direction?: "next" | "prev";
}

interface OffsetPaginationOptions extends BasePaginationOptions {
	page?: number;
	includeTotalCount?: boolean;
}

interface PaginatedResult<T = unknown> {
	data: Array<T>;
	hasMore: boolean;
	nextCursor?: string;
	prevCursor?: string;
}

interface OffsetPaginatedResult<T = unknown> extends PaginatedResult<T> {
	totalCount?: number;
	totalPages?: number;
	currentPage: number;
}

/**
 * Cursor-based pagination for jobs (recommended for large datasets)
 * More efficient for large offsets, consistent performance
 */
export async function getJobsByCursor(options: CursorPaginationOptions = {}): Promise<PaginatedResult> {
	const { limit = 20, cursor, direction = "next", orderBy = "createdAt", orderDirection = "desc", filters = {} } = options;

	// Validate limit to prevent abuse
	const validatedLimit = Math.min(Math.max(limit, 1), 100);

	// Build all conditions first
	const conditions = [];

	if (filters.countryId) {
		conditions.push(eq(jobs.countryId, filters.countryId));
	}

	if (filters.stateId) {
		conditions.push(eq(jobs.stateId, filters.stateId));
	}

	if (filters.employmentTypeId) {
		conditions.push(eq(jobs.employmentTypeId, filters.employmentTypeId));
	}

	if (filters.workingModalityId) {
		conditions.push(eq(jobs.workingModalityId, filters.workingModalityId));
	}

	if (filters.jobStatusId) {
		conditions.push(eq(jobs.jobStatusId, filters.jobStatusId));
	}

	if (filters.salaryMin) {
		conditions.push(sql`${jobs.salaryMax} >= ${filters.salaryMin}`);
	}

	if (filters.salaryMax) {
		conditions.push(sql`${jobs.salaryMin} <= ${filters.salaryMax}`);
	}

	if (filters.searchTerm) {
		const searchPattern = `%${filters.searchTerm}%`;
		conditions.push(or(sql`${jobs.title} ILIKE ${searchPattern}`, sql`${jobs.description} ILIKE ${searchPattern}`));
	}

	// Handle language filter with EXISTS subquery for better performance
	if (filters.languageIds && filters.languageIds.length > 0) {
		conditions.push(
			sql`EXISTS (
        SELECT 1 FROM ${jobLanguages} jl 
        WHERE jl.job_id = ${jobs.id} 
        AND jl.language_id = ANY(${filters.languageIds})
      )`
		);
	}

	// Handle cursor-based pagination
	if (cursor) {
		const orderColumn = jobs[orderBy];
		const cursorCondition = direction === "next" ? (orderDirection === "desc" ? lt : gt) : orderDirection === "desc" ? gt : lt;

		// For cursor pagination, we need to compare the ordering column value
		// This is a simplified version - in production you might want to handle ties
		conditions.push(cursorCondition(orderColumn, sql`(SELECT ${orderColumn} FROM ${jobs} WHERE id = ${cursor})`));
	}

	// Build the query with all joins and conditions
	const baseQuery = db
		.select({
			// Job fields
			id: jobs.id,
			title: jobs.title,
			description: jobs.description,
			salaryMin: jobs.salaryMin,
			salaryMax: jobs.salaryMax,
			createdAt: jobs.createdAt,
			updatedAt: jobs.updatedAt,

			// Related data (avoid N+1 queries)
			creator: {
				id: users.id,
				firstname: users.firstname,
				lastname: users.lastname,
			},
			country: {
				id: countries.id,
				name: countries.name,
				ISO: countries.ISO,
			},
			state: {
				id: countriesStates.id,
				name: countriesStates.name,
			},
			jobStatus: {
				id: jobStatus.id,
				name: jobStatus.name,
			},
			employmentType: {
				id: employmentTypes.id,
				name: employmentTypes.name,
			},
			workingModality: {
				id: workingModality.id,
				name: workingModality.name,
			},
		})
		.from(jobs)
		.innerJoin(users, eq(jobs.createdUserId, users.id))
		.innerJoin(countries, eq(jobs.countryId, countries.id))
		.leftJoin(countriesStates, eq(jobs.stateId, countriesStates.id))
		.innerJoin(jobStatus, eq(jobs.jobStatusId, jobStatus.id))
		.innerJoin(employmentTypes, eq(jobs.employmentTypeId, employmentTypes.id))
		.innerJoin(workingModality, eq(jobs.workingModalityId, workingModality.id));

	// Apply conditions and ordering
	const orderColumn = jobs[orderBy];
	const orderFn = orderDirection === "desc" ? desc : asc;

	const query = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

	// Fetch one extra record to determine if there are more results
	const results = await query
		.orderBy(orderFn(orderColumn), asc(jobs.id)) // Secondary sort by ID for consistency
		.limit(validatedLimit + 1);

	const hasMore = results.length > validatedLimit;
	const data = hasMore ? results.slice(0, -1) : results;

	// Get cursors for next/prev navigation
	const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : undefined;
	const prevCursor = data.length > 0 ? data[0].id : undefined;

	return {
		data,
		hasMore,
		nextCursor,
		prevCursor,
	};
}

/**
 * Offset-based pagination for jobs (better for page numbers, smaller datasets)
 * Less efficient for large offsets but familiar UX pattern
 */
export async function getJobsByOffset(options: OffsetPaginationOptions = {}): Promise<OffsetPaginatedResult> {
	const { limit = 20, page = 1, orderBy = "createdAt", orderDirection = "desc", filters = {}, includeTotalCount = false } = options;

	// Validate inputs
	const validatedLimit = Math.min(Math.max(limit, 1), 100);
	const validatedPage = Math.max(page, 1);
	const offset = (validatedPage - 1) * validatedLimit;

	// Build all conditions first
	const conditions = [];

	if (filters.countryId) conditions.push(eq(jobs.countryId, filters.countryId));
	if (filters.stateId) conditions.push(eq(jobs.stateId, filters.stateId));
	if (filters.employmentTypeId) conditions.push(eq(jobs.employmentTypeId, filters.employmentTypeId));
	if (filters.workingModalityId) conditions.push(eq(jobs.workingModalityId, filters.workingModalityId));
	if (filters.jobStatusId) conditions.push(eq(jobs.jobStatusId, filters.jobStatusId));

	if (filters.salaryMin) conditions.push(sql`${jobs.salaryMax} >= ${filters.salaryMin}`);

	if (filters.salaryMax) conditions.push(sql`${jobs.salaryMin} <= ${filters.salaryMax}`);

	if (filters.searchTerm) {
		const searchPattern = `%${filters.searchTerm}%`;
		conditions.push(or(sql`${jobs.title} ILIKE ${searchPattern}`, sql`${jobs.description} ILIKE ${searchPattern}`));
	}

	if (filters.languageIds && filters.languageIds.length > 0) {
		conditions.push(
			sql`EXISTS (
        SELECT 1 FROM ${jobLanguages} jl 
        WHERE jl.job_id = ${jobs.id} 
        AND jl.language_id = ANY(${filters.languageIds})
      )`
		);
	}

	// Build the base query
	const baseQuery = db
		.select({
			id: jobs.id,
			title: jobs.title,
			description: jobs.description,
			salaryMin: jobs.salaryMin,
			salaryMax: jobs.salaryMax,
			createdAt: jobs.createdAt,
			updatedAt: jobs.updatedAt,

			creator: {
				id: users.id,
				lastname: users.lastname,
				firstname: users.firstname,
			},
			country: {
				id: countries.id,
				ISO: countries.ISO,
				name: countries.name,
			},
			state: {
				id: countriesStates.id,
				name: countriesStates.name,
			},
			jobStatus: {
				id: jobStatus.id,
				name: jobStatus.name,
			},
			employmentType: {
				id: employmentTypes.id,
				name: employmentTypes.name,
			},
			workingModality: {
				id: workingModality.id,
				name: workingModality.name,
			},
		})
		.from(jobs)
		.innerJoin(users, eq(jobs.createdUserId, users.id))
		.innerJoin(countries, eq(jobs.countryId, countries.id))
		.leftJoin(countriesStates, eq(jobs.stateId, countriesStates.id))
		.innerJoin(jobStatus, eq(jobs.jobStatusId, jobStatus.id))
		.innerJoin(employmentTypes, eq(jobs.employmentTypeId, employmentTypes.id))
		.innerJoin(workingModality, eq(jobs.workingModalityId, workingModality.id));

	// Apply conditions and ordering
	const orderColumn = jobs[orderBy];
	const orderFn = orderDirection === "desc" ? desc : asc;

	const query = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

	// Execute count query in parallel if needed (optional for performance)
	const [results, totalCountResult] = await Promise.all([
		query
			.orderBy(orderFn(orderColumn), asc(jobs.id))
			.limit(validatedLimit + 1)
			.offset(offset),
		includeTotalCount
			? conditions.length > 0
				? db
						.select({ count: count() })
						.from(jobs)
						.where(and(...conditions))
				: db.select({ count: count() }).from(jobs)
			: Promise.resolve([{ count: 0 }]),
	]);

	const hasMore = results.length > validatedLimit;
	const data = hasMore ? results.slice(0, -1) : results;
	const totalCount = includeTotalCount ? totalCountResult[0].count : undefined;
	const totalPages = totalCount ? Math.ceil(totalCount / validatedLimit) : undefined;

	return {
		data,
		hasMore,
		totalCount,
		totalPages,
		currentPage: validatedPage,
		nextCursor: undefined, // Not applicable for offset pagination
		prevCursor: undefined, // Not applicable for offset pagination
	};
}

// Utility function to get job languages separately if needed
export async function getJobLanguages(jobIds: string[]): Promise<Record<string, any[]>> {
	if (jobIds.length === 0) return {};

	const jobLanguageResults = await db
		.select({
			jobId: jobLanguages.jobId,
			languageId: jobLanguages.languageId,
			required: jobLanguages.required,
			languageName: languages.name,
		})
		.from(jobLanguages)
		.innerJoin(languages, eq(jobLanguages.languageId, languages.id))
		.where(sql`${jobLanguages.jobId} = ANY(${jobIds})`);

	// Group by job ID
	const grouped: Record<string, any[]> = {};
	jobLanguageResults.forEach((row: { jobId: string | number; languageId: any; languageName: any; required: any }) => {
		if (!grouped[row.jobId]) {
			grouped[row.jobId] = [];
		}
		grouped[row.jobId].push({
			id: row.languageId,
			name: row.languageName,
			required: row.required,
		});
	});

	return grouped;
}
