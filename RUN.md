# Primary Review Method: Containerised application and database

> **Note:** The application is also hosted at [https://kivi-memory.vercel.app/](https://kivi-memory.vercel.app/), but it might be slow as it is hosted on a free instance. We strongly recommend running it locally via Docker for the review.

## 1. Required Runtimes and Versions
- **Docker** and **Docker Compose**

## 2. Required Environment Variables
No manual `.env` configuration is required. The `docker-compose.yml` automatically injects the necessary environment variables (`DATABASE_URL=postgresql://kivi_user:kivi_password@db:5432/kivi_memory`).

## 3. Exact Commands to Install Dependencies
Dependencies are automatically installed inside the Docker containers during the build step. No local installation of Bun or Node is required.

## 4. Exact Commands to Create, Migrate, and Seed the Database
The PostgreSQL database is created automatically when the container starts. The backend container is configured to automatically run `bunx drizzle-kit push` to migrate the schema before booting the Express server.
*(Note: There is no manual CLI seed command required; the frontend provides an intuitive 1-click bulk training interface to seed the memory directly).*

## 5. Exact Commands to Start Every Required Process
To boot the entire application (Database, Backend, and Frontend), simply run in the root directory:
```bash
docker compose up --build
```
*(You can append `-d` if you want to run it in detached mode).*

## 6. URL, Application Window, or Interface to Open
Open your browser and navigate to the frontend dashboard:
**[http://localhost:3000](http://localhost:3000)**

## 7. Primary Interactions to Try
Here are the steps to interact with the full system and observe memory in action:

1. **How to Bulk Upload Memory (Seeding)**
   - Go to the **Bulk Training** page (Root URL: `/`).
   - Select a Test Scenario from the sidebar (e.g., Scenario 1: Ambiguity & Reverts).
   - Click **Inject Memory**. The system simulates inference and mathematically extracts positive/negative anchors from the historical logs.
2. **Where to Perform Inference**
   - Navigate to the **Inference Engine** page (`/infer`).
   - Enter a raw ASR string (e.g., `"The Kiwi product."`) and watch the system use its context anchors to correctly output `"Kivi"` while detailing threshold scores and decision reasons.
3. **Where to View Memory State**
   - Navigate to the **Memory State** page (`/state`).
   - Here you can inspect all the phonetic hashes, canonical terms, anchor weights, observation counts, and ambiguity flags stored in the database.
4. **Where to Wipe It (Reset)**
   - Go to the **Memory State** page (`/state`) and click the **Wipe Memory** button to reset the database and start a new evaluation scenario.

*(For detailed API endpoint documentation, refer to the [Backend Documentation](backend/README.md)).*

### Pre-packaged Datasets for Testing
We have pre-packaged several historical interaction logs to demonstrate the system's capabilities and edge cases. You can explore these in the [datasets](datasets/) directory:
- **[Memory 1: Ambiguity & Reverts](datasets/memory1_documentation.md)**: Teaches the system to replace "kiwi" with "Kivi" in a product context, while using negative anchors to safely ignore "kiwi" when discussing birds or fruit.
- **[Memory 2: One-to-Many Collision](datasets/memory2_documentation.md)**: Resolves a severe phonetic collision where "aditi" must dynamically map to either "Aaditya" or "Aditi" based entirely on surrounding context weights.
- **[Memory 3: Unambiguous Proper Nouns](datasets/memory3_documentation.md)**: Demonstrates instantly replacing non-dictionary names (Bibek -> Vivek) without requiring context scoring, since they don't risk overwriting real English words.
- **[Limitation Memory](datasets/limitation_memory_documentation.md)**: Explicitly demonstrates architectural edge cases, such as bag-of-words blindness across sentence boundaries and tokenization limits.

## 8. Exact Command to Run the Evaluation
The core NLP evaluation, context windowing, scoring algorithms, and mathematical edge cases are rigorously unit-tested in the backend. 
To run the automated evaluation suite inside the backend container (while the system is running):
```bash
docker compose exec backend bun test
```

## 9. Where the Evaluation Results are Written
The evaluation results are printed directly to the standard output (console) after running the test command. It will display the pass/fail status, runtime latency, and inspectable console logs detailing each phonetic substitution decision.

## 10. Exact Procedure for Resetting the System
1. Open the **Memory State** page in the frontend UI (`http://localhost:3000/state`).
2. Click the red **Wipe Memory** button to completely wipe all learned anchors and rules from the live database.
3. (Alternatively, you can tear down the docker containers and completely wipe the database volume by running `docker compose down -v`).
