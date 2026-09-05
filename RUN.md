# How to Run the Phonetic Memory Engine

The entire system (PostgreSQL Database, Node/Bun Backend, and Next.js Frontend) has been containerized and configured for a true one-click startup.

## Prerequisites
- **Docker** and **Docker Compose** installed on your system.

## 1-Click Start

To boot the entire application, simply run:
```bash
docker compose up --build
```
*(You can append `-d` if you want to run it in detached mode).*

### What happens automatically?
1. The PostgreSQL container (`db`) boots up and exposes port `5432`.
2. Once the DB is healthy, the `backend` container (Bun) starts.
3. The backend container automatically runs Drizzle migrations (`bunx drizzle-kit push`) to create the necessary tables **before** starting the Express server on port `8000`.
4. Finally, the `frontend` Next.js dashboard compiles and spins up on port `3000`.

## Accessing the Application

- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** `http://localhost:8000`

From the Frontend Dashboard, you can navigate between:
- `/` (Bulk Training)
- `/infer` (Inference Engine Playground)
- `/state` (Live Memory Database Viewer)
