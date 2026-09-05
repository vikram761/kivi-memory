# Memory 2: One-to-Many Collision & Contextual Reverts
This dataset teaches the system to resolve a severe phonetic collision for the key `ATT` which maps to both `Aaditya` and `Aditi`. When the LLM outputs `aditi`, the system learns to map it to `Aaditya` for engineering tasks, but when the user reverts it back to `Aditi` for design tasks, it learns to hold both candidates in memory and dynamically pick based on context.

**What to test in Inference:**
```json
[
  {
    "formatted_output": "aditi is writing code",
    "expected_result": "Aaditya is writing code",
    "actual_result": "Aaditya is writing code"
  },
  {
    "formatted_output": "aditi is creating figma mockups",
    "expected_result": "Aditi is creating figma mockups",
    "actual_result": "Aditi is creating figma mockups"
  },
  {
    "formatted_output": "can aditi deploy the server?",
    "expected_result": "can Aaditya deploy the server?",
    "actual_result": "can Aaditya deploy the server?"
  }
]
```

**Note:** A correction must be injected at least 3 times to cross the activation threshold.
