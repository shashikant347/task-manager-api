# Task Manager API

REST API for managing tasks. Users can sign up, log in and manage their own tasks.
Built with Node.js, Express, MongoDB and JWT.

## Run locally

You need Node 18+ and a MongoDB instance (local or Atlas).

    npm install
    cp .env.example .env
    npm run dev

Fill in .env before starting:

    PORT=5000
    MONGO_URI=mongodb://127.0.0.1:27017/task_manager
    JWT_SECRET=any_long_random_string
    JWT_EXPIRES_IN=1d

## Endpoints

Auth
- POST /api/auth/register  (name, email, password)
- POST /api/auth/login     (email, password)
- GET  /api/auth/profile   (needs token)

Tasks (all need the header `Authorization: Bearer <token>`)
- POST   /api/tasks
- GET    /api/tasks
- GET    /api/tasks/:id
- PUT    /api/tasks/:id
- DELETE /api/tasks/:id

## Task fields

- title (required)
- description
- status: Pending (default), In Progress, Completed
- priority: Low, Medium (default), High
- dueDate (ISO date, e.g. 2026-12-31)
- createdAt (added automatically)

## Search, filter, pagination

    GET /api/tasks?search=report&status=Completed&priority=High&page=1&limit=10

search looks in title and description. limit is capped at 100.
The response includes total, page, limit and totalPages.

## Notes

- Passwords are hashed with bcrypt and never returned in responses.
- A user can only see and change their own tasks. Someone else's task id returns 404.
- Invalid input returns 400 with a list of what's wrong.

## Postman

Import postman_collection.json. Run Register or Login first, the token gets saved
automatically for the other requests.