# 🦊 Cardholder-App Back

## 📋 Overview

Cardholder-App Back is a modern backend API service built with Elysia.js (🦊) and Bun (🥧) runtime. It provides authentication, data management, and other services for the Cardholder-App application.

## 🏁 Getting Started

To get started with this project, follow the instructions below.

### 📦 Prerequisites

Make sure you have the following installed:

- [Bun](https://bun.sh/)
- [Docker](https://www.docker.com/)
- Docker Compose (optional for more complex use)

### 🔧 Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/YnfanteY2799/sii-test-backend.git
   cd sii-test-backend
   ```

2. **Set up environment variables:**

   Create a `.env` file based on `.env.example`:

   ```bash
   cp .env.example .env
   ```

   Adjust the variables in `.env` as needed for your environment.

3. **Install dependencies:**

   ```bash
   bun install
   ```

4. **Run setup script:**

   This will initialize Docker containers and perform necessary setup.

   ```powershell
   bun dev
   ```

### 💻 Development

To start the development server, run:

```bash
bun d
```

This will launch the application at `http://localhost:8080`. Open this URL : `http://localhost:8080/Documentation` in your browser to see the project swagger.

### 🗃️ Database Management

The project uses Drizzle ORM for database management. You can use the following commands:

```bash
# Generate database migrations
bun run db:g

# Seed the database
bun run db:s

# Push changes the database
bun run db:p

# Apply migrations
bun run db:m
```

## Project Structure 🌳

- **scripts/**: ⚙️ Setup and utility scripts
- **src/**: 🗂️ Main source code, including:
  - **controllers/**: 🚀 API endpoints and logic
  - **db/**: 🗄️ Database configurations and models
  - **middlewares/**: 🛡️ Application middlewares
  - **utils/**: 🔧 Utility functions and helpers
- **.env**: Environment variables
- **drizzle.config.ts**: Drizzle ORM configuration
- **start.ps1 / start.sh**: Startup scripts for Windows/Unix

This structure organizes the backend service effectively, providing clear separation of concerns for various components.

## 📚 Project Dependencies

### 🧩 Main Dependencies

- `@elysiajs/cors`: ^1.3.3
- `@elysiajs/jwt`: ^1.3.1
- `@elysiajs/swagger`: ^1.3.0
- `drizzle-orm`: ^0.44.2
- `elysia`: latest
- `elysia-helmet`: ^3.0.0
- `logestic`: ^1.2.4
- `postgres`: ^3.4.7

### 🛠️ Dev Dependencies

- `bun-types`: latest
- `drizzle-kit`: ^0.31.2

## 📝 API Documentation

The API documentation is available at `http://localhost:8080/Documentation` when the server is running.

## 🔥 Features

- ⚡ **Fast Performance**: Built with Bun and Elysia for maximum speed
- 🔒 **Secure Authentication**: JWT-based authentication system
- 📊 **Database Integration**: PostgreSQL with Drizzle ORM
- 🔄 **Caching**: Redis for high-performance caching
- 📚 **API Documentation**: Swagger UI for easy API exploration
- 🔍 **Type Safety**: Full TypeScript support throughout the codebase

## 👨‍💻 Contribution

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the terms of the MIT license.
