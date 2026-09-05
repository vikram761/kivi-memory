# Memory 1: Ambiguity & Reverts (Kivi Product vs Kiwi Fruit)
This scenario teaches the system to replace 'kiwi' with 'Kivi', but ONLY in the context of the product/engineering. It includes deliberate reverts where the user corrects the system back to 'kiwi' when talking about breakfast or birds, training the negative anchors.

**What to test in Inference:**
```json
[
  {
    "formatted_output": "the kiwi product is launching",
    "expected_result": "the Kivi product is launching",
    "actual_result": "the Kivi product is launching"
  },
  {
    "formatted_output": "i ate a kiwi for lunch",
    "expected_result": "i ate a kiwi for lunch",
    "actual_result": "i ate a kiwi for lunch"
  }
]
```

**Note:** A correction must be injected at least 3 times to cross the activation threshold.
