# BLIP Take Home Test - E-Commerce REST API

A simple E-Commerce REST API built with Express.js, Prisma ORM, and PostgreSQL.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)

## Tech Stack

| Package          | Description                                |
| ---------------- | ------------------------------------------ |
| **express**      | Web framework for Node.js                  |
| **prisma**       | ORM for database management and migrations |
| **pg**           | PostgreSQL client for Node.js              |
| **jsonwebtoken** | JWT authentication                         |
| **bcrypt**       | Password hashing                           |
| **joi**          | Request validation                         |
| **winston**      | Logging with multiple transports           |
| **dotenv**       | Environment variables management           |
| **nodemon**      | Development auto-reload                    |

## Features

| Feature                        | Description                                                           |
| ------------------------------ | --------------------------------------------------------------------- |
| **Centralized Environment**    | All env variables validated at startup, app fails fast if any missing |
| **JWT Authentication**         | Secure token-based authentication                                     |
| **Role-Based Access**          | ADMIN and STAFF roles with different permissions                      |
| **Request Validation**         | Input validation using Joi schemas                                    |
| **Centralized Error Handling** | Consistent error responses with custom error classes                  |
| **Logging**                    | Winston logger with console and file transports                       |
| **Database Connection Pool**   | Optimized PostgreSQL connection pooling                               |

## Project Structure

```
src/
├── main.js              # Application entry point
├── handlers/            # Request handlers (controllers)
│   ├── auth.js
│   └── order.js
├── services/            # Business logic layer
│   ├── auth.js
│   └── order.js
├── routes/              # Route definitions
│   ├── auth.js
│   └── order.js
├── middlewares/         # Express middlewares
│   └── middleware.js    # Auth, validation, error handler
├── validation/          # Joi validation schemas
│   ├── auth.js
│   └── order.js
└── utils/               # Utility functions
    ├── env.js           # Centralized environment config
    ├── logger.js        # Winston logger setup
    ├── prisma.js        # Prisma client with connection pool
    ├── errors.js        # Custom error classes
    ├── helper.js        # Password hashing utilities & JWT utilities
    └── constant.js      # Constants and enums

prisma/
├── schema.prisma        # Database schema
├── migrations/          # Database migrations
└── seed/
    └── seed.js          # Database seeder
```

### Layer Description

| Layer           | Folder         | Description                                           |
| --------------- | -------------- | ----------------------------------------------------- |
| **Routes**      | `routes/`      | Define API endpoints and apply middlewares            |
| **Handlers**    | `handlers/`    | Handle HTTP requests, call services, return responses |
| **Services**    | `services/`    | Contains business logic, interact with database       |
| **Middlewares** | `middlewares/` | Authentication, validation, error handling            |
| **Validation**  | `validation/`  | Joi schemas for request validation                    |
| **Utils**       | `utils/`       | Shared utilities (logger, env, errors, etc.)          |

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/MuhammadMiftaa/BLIP-Take-Home-Test.git
cd BLIP-Take-Home-Test
```

2. Install dependencies

```bash
npm install
```

3. Create `.env` file from example

```bash
cp .env.example .env
```

4. Configure your `.env` file with your database credentials

### Database Setup

1. Generate Prisma client

```bash
npm run prisma:generate
```

2. Run database migrations

```bash
npm run prisma:migrate
```

3. Seed the database (creates default users)

```bash
npm run prisma:seed
```

**Default users after seeding:**
| Email          | Password | Role  |
|----------------|----------|-------|
| admin@blip.com | admin123 | ADMIN |
| staff@blip.com | staff123 | STAFF |

### Running the Application

**Development mode** (with auto-reload):

```bash
npm run dev
```

**Production mode**:

```bash
npm start
```

The server will start on the port specified in your `.env` file.

## API Endpoints

| Method | Endpoint             | Auth | Description             |
| ------ | -------------------- | ---- | ----------------------- |
| POST   | `/auth/login`        | ❌   | Login and get JWT token |
| POST   | `/orders`            | ✅   | Create a new order      |
| GET    | `/orders`            | ✅   | Get all orders          |
| PATCH  | `/orders/:id/status` | ✅   | Update order status     |
| GET    | `/health`            | ❌   | Health check endpoint   |

### Order Status Transitions

| From    | To        | Allowed Roles |
| ------- | --------- | ------------- |
| PENDING | PAID      | ADMIN only    |
| PENDING | CANCELLED | ADMIN, STAFF  |
| PAID    | CANCELLED | ADMIN only    |

## Environment Variables

All environment variables are **required**. The application will fail to start if any are missing.

```env
# Server
PORT=8080
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
DB_MAX_OPEN_CONN=10
DB_MIN_IDLE_CONN=2
DB_IDLE_TIMEOUT_MS=30000
DB_CONNECTION_TIMEOUT_MS=5000

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Logging
LOG_LEVEL=info
```
