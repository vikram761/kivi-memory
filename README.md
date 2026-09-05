# Kivi Memory

**Live Demo**: [https://kivi-memory.vercel.app/](https://kivi-memory.vercel.app/) *(Hosted on a free tier, cold starts may take a few seconds)*

**Author Details:**
* **Name**: Sriman Vikram
* **Roll Number**: DA26M022
* **Institute Email**: da26m022@smail.iitm.ac.in
* **Personal Email**: srimanvgn@gmail.com

---

A deterministic and mathematically driven phonetic memory system. It intercepts LLM or ASR outputs and corrects personalized language like names, brands, or local terms. It uses Inverse Document Frequency context windows to avoid LLM hallucinations entirely.

## Architecture

The system operates as a middleware layer between the raw LLM output and the user interface. Our system uses the `formatted_output`, which is the text produced by the Kivi model, to inject relevant personal terms. 
*   **Storage**: Corrections and their context anchors are stored in a PostgreSQL database using Drizzle ORM.
*   **NLP Engine**: The core logic is built in TypeScript. It uses static JSON exports of the NLTK Brown Corpus to calculate word frequencies locally, requiring no heavy Python runtime.
*   **User Abstraction**: Our implementation does not have user abstraction yet, but multi tenant isolation can be added via simple database filtering easily.
*   **Visualizer**: A Next.js dashboard allows developers to bulk train the memory and inspect the exact mathematical scoring for every token.

## Cost, Latency & Storage (Zero LLM Usage)

This system is built specifically to operate at the edge or as a lightweight middleware, entirely avoiding the massive overhead of prompting an LLM to "fix" names.
*   **Cost (0 Tokens)**: There is absolutely zero LLM involvement during memory inference. All phonetic hashing, string diffing, and context weighting is purely mathematical and runs locally in a lightweight TypeScript runtime. This saves 100% of the token costs associated with passing historical context windows into a language model.
*   **Latency**: Because the engine relies on pre-compiled static JSON dictionaries (NLTK) and simple array processing without any external network calls or GPU dependencies, the time to mathematically evaluate and correct an entire paragraph of text is typically **under 5 milliseconds**.
*   **Storage**: We store rules and context anchors using `jsonb` maps in PostgreSQL. Instead of storing massive vector embeddings or full conversation transcripts, the system only stores a localized hash map of high-value `(word: frequency)` pairs for positive and negative anchors. This reduces the database footprint to a few kilobytes per memory rule, making it highly scalable and cheap.

## How the Memory Learns

The memory engine learns by running a diff algorithm between the Kivi model output and the user final submitted text. Positive context words are extracted when a correction is made. If a hallucination is reverted by the user, heavy negative context penalties are applied. 

**Activation Threshold**: A correction must reach at least 3 observations to be eligible to be scored and automatically applied by the engine in the future.

## Key Decisions

*   **Indexing by Mistake**: We hash the ASR mistake rather than the correct word. If the ASR hears "kiwi" instead of "Kivi", we store "Kivi" under the phonetic hash of "kiwi". This eliminates the need for complex string replacement rules.
*   **Context Scoring Formulation**: Every word surrounding a mistake is mathematically weighted based on its rarity in the English language. We use the following formulation to score and choose whether to use the new term:
    ```math
    Weight(w) = 1.0 / (1.0 + DocumentFrequency(w))
    Total Score = Sum( Weight(w) * (Positive Count(w) - Negative Count(w)) )
    ```
    If the score exceeds the baseline threshold (0.005), the substitution is successfully applied.
*   **Collision Resolution**: If a single mistake maps to multiple valid corrections (like "Aditi" vs "Aaditya"), the system forces an ambiguity check. It scores all candidates against the current sentence and selects the mathematical winner.
*   **Smart Reverts**: If the system hallucinates a correction and the user reverts it, we do not drop the global confidence count. We apply a heavy negative penalty to those specific context anchors. This blocks the hallucination in that exact context without destroying its usefulness elsewhere.
*   **Typo Safe Logic**: The system checks mistakes against a standard English dictionary. If the mistake is a valid dictionary word, it conservatively demands high context scores. If the mistake is gibberish, it auto corrects instantly.

## Limitations

*   **Bag of Words Blindness**: The context window evaluates nearby words without understanding grammatical syntax. Example: "Sarvam has a new product. I ate a kiwi." might falsely trigger "Kivi" simply because "product" is nearby.
*   **Metaphone Collisions**: Distinct words might hash to the exact same phonetic key due to vowel dropping. Example: "Pat" and "Pete" both hash to the key PT causing unintended conflicts.
*   **Tokenization Limits**: Standard word boundaries prevent merging multiple words into one cleanly. Example: Correcting "De Souza" to "D'Souza" fails because they are evaluated as two entirely separate tokens.

## Datasets

The historical training logs and edge case demonstrations are kept in the [datasets/](datasets/) directory. The Next.js frontend hardcoded memories strictly mirror these exact JSON memory files.

## AI Usage Disclosure

This project was built entirely through pair programming with an advanced agentic AI assistant. The AI assistant was utilized to port the initial Python prototype into the TypeScript backend, author the Next.js visualization dashboard, and refine the database schemas and core revert logic.

## Project Structure

*   [`/backend`](backend/README.md) - The Express backend containing the core math logic (`nlp/logic.ts`), Drizzle schemas, test suites, and API endpoints.
*   [`/frontend`](frontend/README.md) - The Next.js dashboard for injecting memory, viewing system state, and visualizing inference tooltips.
*   `/prototype` - The original Python Jupyter Notebook where the math was proven.
*   `/scripts` - Python scripts used to export NLTK corpora (Brown, Stopwords, Words) to static JSON for the backend.
*   `/datasets` - Deep simulation JSON data used to bulk train the system for different edge cases.

## Tech Stack

*   **Backend**: Bun, TypeScript, Express
*   **Database**: PostgreSQL, Drizzle ORM
*   **Frontend**: Next.js, Tailwind CSS
*   **NLP**: NLTK Static JSON Exports

## How to Run

The entire stack (Frontend, Backend, and PostgreSQL) is fully Dockerized. To run the system from table creation to web app launch:

```bash
docker compose up --build
```

*   **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
*   **Backend API**: `http://localhost:8000`

## Evaluation Suite

The backend contains a rigorous evaluation suite that wipes the database and tests ambiguity, collisions, and reverts dynamically.

```bash
cd backend
bun test
```
