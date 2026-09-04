# AI Context & Project State

**Purpose:** This file acts as the persistent memory bank for any AI assistant joining this project. Read this before suggesting code to understand the established architecture, edge cases solved, and the exact project phase.

## 1. Project Overview
We are building "The Words Kivi Keeps" — a deterministic, backend-focused phonetic memory system that intercepts LLM/ASR outputs and mathematically corrects personalized language (names, brands, local terms) using context windows, completely avoiding LLM hallucinations.

## 2. Current Phase: Complete
*   **Phase 1 (Prototyping):** We built, proved, and edge-cased the entire NLP logic in Python (`prototype/Memory implementation.ipynb`).
*   **Phase 2 (Backend Migration):** We fully ported the mathematical logic to a **TypeScript + Bun + Express** backend, backed by **PostgreSQL** via **Drizzle ORM**. It is fully unit-tested (`bun test`) and correctly handles dictionary collisions, unambiguous proper nouns, weak signal rejections, one-to-many candidate collisions, and typo-safe logic.
*   **Phase 3 (Frontend UI):** We built a clean, modern **Next.js + Tailwind CSS** frontend that beautifully visualizes the bulk-training process, inference engine tooltips, and real-time database state.

## 3. Tech Stack & Best Practices
*   **Backend Runtime:** Bun + TypeScript
*   **API Framework:** Express.js
*   **Database & ORM:** PostgreSQL + Drizzle ORM (using `jsonb` for anchor maps)
*   **NLP Tools:** `diff` (token diffing), `metaphone` (phonetic hashing)
*   **Frontend:** Next.js (App Router) + Tailwind CSS + JetBrains Mono Font
*   **Static NLP Data:** We dumped Python NLTK data into static JSON (`backend/data/frequencies.json`, `stopwords.json`, `dictionary.json`) so the production backend requires zero Python dependencies.

## 4. Critical Design Decisions (Do Not Alter)

### A. Indexing by ASR's Mistake (Keying Strategy)
We do NOT key the database by the phonetic hash of the correct word. We do key the database by the **phonetic hash of the ASR's mistake**. 
*   *Example:* If ASR says `kiwi` and user meant `Kivi`, we store `Kivi` under the hash for `kiwi` (`KW`). This entirely eliminates the need for hardcoded `w` to `v` string replacements.

### B. The Scoring Math (Inverse Document Frequency)
Every non-stopword in the context window (±4 tokens) is mathematically weighted based on its frequency in the English language (via NLTK Brown corpus).
*   **Formula:** `weight = 1.0 / (1.0 + docFreq)`
*   **Threshold:** `0.005` (A single generic word like "good" scores ~0.001 and is rejected. A rare word like "product" scores ~0.008 and is accepted).

### C. Collision Resolution (One-to-Many)
If `KW` points to both `Kivi` and `Kavi`, the database uses a composite key: `(phonetic_key, canonical_term)`. During inference, the system detects multiple candidates, forces an ambiguity check, scores them all based on the context window, and dynamically picks the highest scoring one that beats the threshold.

### D. The Revert Logic & Bulk Training
If the system incorrectly changes `kiwi` to `Kivi`, and the user manually reverts it back to `kiwi`:
1.  The `observationCount` of the `Kivi` rule is exponentially decayed (halved).
2.  The context words are extracted and added to the `negativeAnchors` JSONB map of the `Kivi` rule so it learns from the mistake.
*Important:* To make this work with historical JSON seed data, the `/bulk-learn` endpoint **simulates inference first**, running the raw LLM output through `applyMemory()`, and then runs `learnFromObservation()` on the diff between the *system's output* and the *user's final text*.

### E. Typo-Safe Ambiguity Logic (The "Bibek" Rule)
An `ambiguityRisk` is ONLY flagged as `true` if the **Original ASR Mistake** is a valid word in the English dictionary (e.g., `kiwi`). If the ASR outputs gibberish or a non-dictionary name (e.g., `Bibek`), `ambiguityRisk` is `false`. This allows the system to confidently auto-correct out-of-vocabulary typos instantly without demanding context, while remaining strictly conservative about overwriting valid English words.
