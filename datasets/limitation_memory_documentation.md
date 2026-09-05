# Limitation Memory: Architectural Flaws & Edge Cases

This dataset demonstrates the explicit architectural limitations of the current Phonetic Memory System as outlined in the README. It trains three specific rules designed to expose failures in Bag of Words context evaluation, Metaphone hashing, and sub-word tokenization.

**What to test in Inference:**
```json
[
  {
    "limitation": "Bag of Words Blindness",
    "formatted_output": "Sarvam has a new product. I ate a kiwi.",
    "expected_result": "Sarvam has a new product. I ate a kiwi.",
    "actual_result": "Sarvam has a new product. I ate a Kivi."
  },
  {
    "limitation": "Metaphone Collisions",
    "formatted_output": "Pat the dog.",
    "expected_result": "Pat the dog.",
    "actual_result": "Peter the dog."
  },
  {
    "limitation": "Tokenization Limits",
    "formatted_output": "Ask De Souza.",
    "expected_result": "Ask D'Souza.",
    "actual_result": "Ask De Souza."
  }
]
```

**Note:** A correction must be injected at least 3 times to cross the activation threshold.
