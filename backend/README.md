# Backend Engine

This folder contains the core Express server, the PostgreSQL database schemas (via Drizzle ORM), and the mathematical NLP engine for the Phonetic Memory System.

## Core Logic Location

The entire mathematical scoring engine, tokenizer, and diff algorithms are centrally located in a single file:
`src/nlp/logic.ts`

## API Endpoints

### 1. Bulk Training
*   **Endpoint**: `POST /api/memory/bulk-learn`
*   **Description**: Ingests historical interaction logs, simulates inference, and extracts positive and negative context anchors based on user corrections.
*   **Input Format**: An array of interaction objects.
```json
[
  {
    "llm": "Ask aditi to review the pull request.",
    "user": "Ask Aaditya to review the pull request."
  }
]
```

### 2. Inference Engine
*   **Endpoint**: `POST /api/memory/infer`
*   **Description**: Runs the raw output through the phonetic memory engine to mathematically score and substitute hallucinated terms.
*   **Input Format**: A single JSON object containing the text to evaluate.
```json
{
  "formatted_text": "Tell aditi the server is deployed."
}
```

### 3. State Retrieval
*   **Endpoint**: `GET /api/memory/state`
*   **Description**: Fetches all current memory entries, observation counts, and anchor weights from the database.
*   **Input Format**: No body required.

### 4. Reset Memory
*   **Endpoint**: `POST /api/memory/reset`
*   **Description**: Wipes the database and clears all learned phonetic memories and anchors.
*   **Input Format**: No body required.
