# Task Management REST API

A secure REST API for managing personal tasks, built with **Node.js, Express, MongoDB (Mongoose) and JWT**.

## Features
- Register / login with JWT authentication and bcrypt password hashing
- Full task CRUD, scoped so users can only access their own tasks
- Search (title/description), filter (status, priority), pagination and sorting
- Request validation (express-validator), centralized error handling
- Security: helmet, CORS, rate limiting on auth routes, body size limit, no sensitive data in responses

## Project structure
```
src/
  config/        database connection
  models/        Mongoose schemas (User, Task)
  validators/    express-validator rule sets
  middleware/    auth (JWT), validate, error handler
  controllers/   request handling logic
  routes/        route definitions
  utils/         ApiError, asyncHandler, token helper
  app.js         Express app setup
  server.js      entry point
```

## Setup
**Prerequisites:** Node.js 18+, MongoDB (local or Atlas)

```bash
git clone <your-repo-url>
cd task-manager-api
npm install
cp .env.example .env      # then edit values
npm run dev               # development (nodemon)
npm start                 # production
```

### Environment variables
| Variable | Description |
|---|---|
| `PORT` | Server port (default 5000) |
| `NODE_ENV` | `development` or `production` |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random secret for signing tokens |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `1d` |

Generate a secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

## API Reference
Base URL: `http://localhost:5000`. Protected routes need `Authorization: Bearer <token>`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register (`name`, `email`, `password`) |
| POST | `/api/auth/login` | No | Login (`email`, `password`) |
| GET | `/api/auth/profile` | Yes | Current user profile |
| POST | `/api/tasks` | Yes | Create task |
| GET | `/api/tasks` | Yes | List tasks |
| GET | `/api/tasks/:id` | Yes | Get one task |
| PUT | `/api/tasks/:id` | Yes | Update task (send any subset of fields) |
| DELETE | `/api/tasks/:id` | Yes | Delete task |

### Task fields
| Field | Type | Notes |
|---|---|---|
| `title` | string | required, max 120 |
| `description` | string | optional, max 1000 |
| `status` | enum | `Pending` (default), `In Progress`, `Completed` |
| `priority` | enum | `Low`, `Medium` (default), `High` |
| `dueDate` | ISO date | optional, e.g. `2026-12-31` |
| `createdAt` | date | set automatically |

### List query parameters
`GET /api/tasks?search=report&status=Completed&priority=High&page=1&limit=10&sortBy=dueDate&order=asc`

| Param | Description |
|---|---|
| `search` | Case-insensitive match on title or description |
| `status` / `priority` | Exact filter |
| `page` / `limit` | Pagination (limit max 100, default 10) |
| `sortBy` | `createdAt` (default), `dueDate`, `priority`, `title` |
| `order` | `desc` (default) or `asc` |

Response:
```json
{
  "success": true,
  "data": { "tasks": [ ... ] },
  "pagination": { "total": 25, "page": 1, "limit": 10, "totalPages": 3 }
}
```

### Error format
```json
{ "success": false, "message": "Validation failed", "errors": [{ "field": "email", "message": "A valid email is required" }] }
```
Status codes used: 400 validation, 401 auth, 404 not found, 409 conflict, 429 rate limit, 500 server error.

## Postman
Import `postman_collection.json`. Run **Register** or **Login** first; the token is saved automatically to a collection variable and used by all other requests. The created task id is saved too.

## Design notes
- Passwords are hashed with bcrypt (cost 12) and excluded from queries/JSON by default.
- Login returns the same error for wrong email or password to prevent user enumeration.
- Task ownership is enforced inside the database query (`{ _id, user }`), so another user's task returns 404.
- The task owner always comes from the verified JWT, never the request body (prevents mass assignment).
- Search input is regex-escaped to prevent regex injection.
