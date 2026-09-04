# Memory 1: Ambiguity & Reverts (Kivi Product vs Kiwi Fruit)
This scenario teaches the system to replace 'kiwi' with 'Kivi', but ONLY in the context of the product/engineering. It includes deliberate reverts where the user corrects the system back to 'kiwi' when talking about breakfast or birds, training the negative anchors.

**What to test in Inference:**
- `the kiwi product is launching` -> Will change to `Kivi`.
- `i ate a kiwi for lunch` -> Will remain `kiwi` (System intervenes, scores it, but rejects it to prevent hallucination).