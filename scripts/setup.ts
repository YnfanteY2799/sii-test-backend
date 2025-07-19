import { $ } from "bun";
import { existsSync, copyFileSync } from "fs";

async function runSetup(): Promise<void> {
	try {
		console.log("🚀 Running empleasy-back setup...\n");

		// Detect platform
		const isWindows = process.platform === "win32";
		const startScript = isWindows ? "start.ps1" : "start.sh";

		// Run platform-specific startup script
		if (existsSync(startScript)) {
			console.log(`📋 Running startup script: ${startScript}`);

			if (isWindows) {
				await $`powershell -ExecutionPolicy Bypass -File start.ps1`;
			} else {
				await $`chmod +x start.sh`;
				await $`./start.sh`;
			}

			console.log("✅ Startup script completed successfully\n");
		} else {
			console.log(`⚠️  Startup script ${startScript} not found, skipping...\n`);
		}

		// Handle .env file creation
		if (!existsSync(".env")) {
			if (existsSync(".env.example")) {
				console.log("📝 Creating .env file from .env.example...");
				copyFileSync(".env.example", ".env");
				console.log("✅ .env file created successfully\n");
			} else {
				console.log("⚠️  Warning: No .env or .env.example file found\n");
			}
		} else {
			console.log("✅ .env file already exists\n");
		}

		console.log("🎯 Setup completed! Starting development server...\n");
	} catch (error) {
		console.error("❌ Error during setup:", error);
		process.exit(1);
	}
}

// Run setup
await runSetup();
