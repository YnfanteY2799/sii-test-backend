import { countries, countriesStates, db, userStatus, userType } from "../index.ts";

(async () => {
	const results: Array<string> = [];

	const user_status = (
		await db
			.insert(userStatus)
			.values([
				{ name: "Active" },
				{ name: "Pending Validation" },
				{ name: "Inactive" },
				{ name: "Password Reset" },
				{ name: "Blocked" },
				{ name: "Deleted" },
				{ name: "Pending Delete" },
			])
			.returning({ id: userStatus.id })
			.onConflictDoNothing({ target: userStatus.id })
	).length;

	results.push(`A total of ${user_status} User Status Have been inserted`);

	const user_type = (
		await db
			.insert(userType)
			.values([{ name: "" }])
			.returning({ id: userType.id })
			.onConflictDoNothing({ target: userType.id })
	).length;

	results.push(`A total of ${user_type} User Types Have been inserted`);

	const total_countries = (
		await db
			.insert(countries)
			.values([{ name: "", ISO: "" }])
			.returning({ id: countries.id })
			.onConflictDoNothing({ target: countries.id })
	).length;

	results.push(`A total of ${total_countries} Countries Have been inserted`);

	// const total_cities = (
	// 	await db
	// 		.insert(countriesStates)
	// 		.values([{ name, countryId }])
	// 		.returning({ id: countries.id })
	// 		.onConflictDoNothing({ target: countries.id })
	// ).length;

	console.log("		ヽ(°〇°)ﾉ !... Migrations Applied ...! ヽ(°〇°)ﾉ ");
	console.log("		(•̪ o •̪) Results : ");
	for (let i = 0; i < results.length; i++) console.log(`${i} - ${results[i]}`);
	console.log("		(꒪͒ꇴ꒪͒) (꒪͒ꇴ꒪͒)  (꒪͒ꇴ꒪͒)  (꒪͒ꇴ꒪͒)  (꒪͒ꇴ꒪͒)  (꒪͒ꇴ꒪͒)  (꒪͒ꇴ꒪͒)  (꒪͒ꇴ꒪͒)  (꒪͒ꇴ꒪͒)  (꒪͒ꇴ꒪͒)  (꒪͒ꇴ꒪͒)");
	console.log(`		A total of ${results.length} have been touched		`);
	console.log("		(꒪͒ꇴ꒪͒) (꒪͒ꇴ꒪͒)  (꒪͒ꇴ꒪͒)  (꒪͒ꇴ꒪͒)  (꒪͒ꇴ꒪͒)  (꒪͒ꇴ꒪͒)  (꒪͒ꇴ꒪͒)  (꒪͒ꇴ꒪͒)  (꒪͒ꇴ꒪͒)  (꒪͒ꇴ꒪͒)  (꒪͒ꇴ꒪͒)");
})()
	.catch((err) => {
		console.error("		An Error happenned (」ﾟﾛﾟ)｣NOOOooooo━");
		console.error(`		`, err);
		console.error("		End of message error ^^^^^^ ( ☞•́⍛•̀)╭☞");
	})
	.finally(() => process.exit());

// https://wft-geo-db.p.rapidapi.com/v1/geo/cities
