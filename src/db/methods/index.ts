import { db, sessions, users } from "../index.ts";
import { eq } from "drizzle-orm";

export async function createNewUserSession(userId: string, rememberUser: boolean, maxSessionAge: Date): Promise<{ id: string }> {
	try {
		return (await db.insert(sessions).values({ userId, expiresAt: maxSessionAge }).returning({ id: sessions.id }))[0];
	} catch (err) {
		console.error(err);
		throw err;
	}
}

export async function deleteCurrentUserActiveSingleSession(sessionId: string): Promise<{ id: string }> {
	try {
		return (await db.delete(sessions).where(eq(sessions.id, sessionId)))[0];
	} catch (err) {
		console.error(err);
		throw err;
	}
}

export async function getUserSession(sessionId: string) {
	const [user] = await db
		.select({ user: users, session: sessions })
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(eq(sessions.id, sessionId))
		.limit(1);

	return user;
}
