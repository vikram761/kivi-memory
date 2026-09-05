# Frontend Dashboard

This directory contains the Next.js and Tailwind CSS dashboard used to interact with and visualize the Kivi memory system.

## Pages

*   **`/` (Bulk Training)**: The main entry point. Allows you to inject historical LLM output and user text logs to bulk train the phonetic memory system using predefined datasets.
*   **`/infer` (Inference Engine)**: A testing playground to type sentences and see how the engine evaluates context, scores words, and applies phonetic memory substitutions in real time.
*   **`/state` (Memory State)**: A visual representation of the PostgreSQL database, showing active memory entries, their observation counts, and their accumulated positive and negative anchors.
