# Kivi Memory

A deterministic, mathematically-driven phonetic memory system that intercepts LLM/ASR outputs and corrects personalized language (names, brands, local terms) using Inverse Document Frequency context windows—completely avoiding LLM hallucinations.

## Features

- **Phonetic Hashing:** Uses `metaphone` to index user corrections by the exact sound of the ASR's mistake, eliminating hardcoded string replacements.
- **Contextual Math (IDF):** Mathematically evaluates surrounding words against the NLTK Brown Corpus. Rare words provide strong "anchors" (high score), while common words are ignored.
- **Collision Resolution:** Automatically resolves one-to-many phonetic collisions (e.g., mapping the mistake "aditi" to either "Aaditya" or "Aditi" based entirely on surrounding context).
- **Typo-Safe Logic:** Intelligently checks mistakes against a standard English dictionary. If the mistake is a valid English word (e.g. "kiwi"), it acts conservatively and demands context. If the mistake is gibberish (e.g. "Bibek"), it auto-corrects instantly.
- **Negative Anchors (Revert Decay):** If the system intervenes and the user reverts the change, the system halves its confidence and permanently associates the surrounding context as negative anchors, ensuring it never makes the exact same mistake twice.

## Tech Stack

- **Backend:** Bun + TypeScript + Express.js
- **Database:** PostgreSQL + Drizzle ORM
- **Frontend:** Next.js (App Router) + Tailwind CSS + JetBrains Mono
- **NLP:** `diff`, `metaphone`, NLTK Static JSON Exports

## Project Structure

*   `/backend` - The Express backend containing the core math logic (`nlp/logic.ts`), Drizzle schemas, and test suites.
*   `/frontend` - The Next.js dashboard for injecting memory and visualizing inference tooltips.
*   `/prototype` - The original Python Jupyter Notebook where the math was proven.
*   `/scripts` - Python scripts used to export NLTK corpora (Brown, Stopwords, Words) to static JSON for the backend.
*   `/testcase` - Deep simulation JSON data used to bulk-train the system for different edge cases.

## How to Run

1.  **Start the Database:**
    ```bash
    docker-compose up -d
    ```
2.  **Start the Backend:**
    ```bash
    cd backend
    bun install
    bun run src/index.ts
    ```
    *The backend runs on `http://localhost:8000`*
3.  **Start the Frontend:**
    ```bash
    cd frontend
    bun install
    bun run dev
    ```
    *The frontend runs on `http://localhost:3000`*

## Running the Evaluation Suite

The backend contains a rigorous, fully automated evaluation suite that wipes the database and tests Ambiguity, Collisions, Reverts, and Unambiguous substitutions dynamically.

```bash
cd backend
bun test
```
