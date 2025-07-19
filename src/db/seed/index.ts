import { db, cardType } from "../index.ts";

(async () => {
	const results: Array<string> = [];

	const card_type = (
		await db
			.insert(cardType)
			.values([
				{ name: "VISA" },
				{ name: "AMEX" },
				{ name: "MASTERCARD" },
				{ name: "DISCOVER" },
				{ name: "DINERS" },
				{ name: "JCB" },
				{ name: "CHINA_UNION_PAY" },
				{ name: "MAESTRO" },
				{ name: "ELO" },
				{ name: "HIPERCARD" },
				{ name: "MIR" },
			])
			.returning({ id: cardType.id })
			.onConflictDoNothing({ target: cardType.id })
	).length;

	results.push(`A total of ${card_type} User Status Have been inserted`);

	// results.push(`A total of ${user_type} User Types Have been inserted`);

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
