# Memory 2: One-to-Many Collision & Contextual Reverts
This dataset teaches the system to resolve a severe phonetic collision for the key `ATT` which maps to both `Aaditya` and `Aditi`. When the LLM outputs `aditi`, the system learns to map it to `Aaditya` for engineering tasks, but when the user reverts it back to `Aditi` for design tasks, it learns to hold both candidates in memory and dynamically pick based on context.

**What to test in Inference:**
- `aditi is writing code` -> `Aaditya is writing code`
- `aditi is creating figma mockups` -> `Aditi is creating figma mockups`
- `can aditi deploy the server?` -> `can Aaditya deploy the server?`
