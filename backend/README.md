# BookIt Backend API

RESTful API for the BookIt travel experience booking platform.

## Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- express-validator

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Create PostgreSQL database:
```sql
CREATE DATABASE bookit;
```

4. Run database migrations:
```bash
npm run migrate
```

5. Seed the database with sample data:
```bash
npm run seed
```

### Development

Start the development server with hot reload:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### Production Build

Build the TypeScript code:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## API Endpoints

### Health Check
- `GET /health` - API health status

### Experiences
- `GET /api/experiences` - Get all experiences
- `GET /api/experiences/:id` - Get single experience with available slots

### Bookings
- `POST /api/bookings` - Create a new booking

### Promo Codes
- `POST /api/promo/validate` - Validate a promo code

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── database/       # Database migrations and seeds
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── types/          # TypeScript type definitions
│   ├── validators/     # Request validation
│   └── server.ts       # Entry point
├── dist/               # Compiled JavaScript (generated)
└── package.json
```

## Environment Variables

See `.env.example` for required environment variables.
