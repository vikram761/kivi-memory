# System Flaws & Architectural Limitations

While the deterministic, IDF-weighted phonetic memory system effectively solves basic collisions and dictionary ambiguities, the current architecture contains several logical flaws that cause it to fail in complex, real-world scenarios. 

This document outlines the known flaws, heavily referencing the `memory2` (Aditi vs Aaditya) and `memory3` test cases.

---

## 1. The "Identity Mapping" Blindspot (The `memory2` Failure)

The most critical flaw in the current implementation is how the system handles **Identity Mappings**—situations where the LLM's spelling was actually correct and should be left alone.

### The Scenario (`memory2`):
- **Context A (Backend):** User wants "Aaditya". LLM outputs "Aditi". User corrects to "Aaditya".
- **Context B (Design):** User wants "Aditi". LLM outputs "Aditi". User leaves it as "Aditi".

### The Flaw:
The `learnFromObservation` function is driven entirely by `diffArrays`. It only extracts context windows and updates the database when a word is **modified, added, or removed**. 
Because the user did not change "Aditi" in the design context, the diff is empty. The system **never learns** that "Aditi" maps to "Aditi" in design contexts.

### The Catastrophic Chain Reaction:
1. The database learns the rule: `Aditi (AT) ➔ Aaditya` with backend anchors.
2. The database **fails to learn**: `Aditi (AT) ➔ Aditi` with design anchors.
3. Because "Aditi" is not in the standard English dictionary (`ambiguityRisk = false`), the system considers it an "Unambiguous Proper Noun".
4. During inference on the sentence *"Ask Aditi for the Figma design"*, the system hashes "Aditi", finds "Aaditya" as the *only* candidate, sees `ambiguityRisk = false`, completely bypasses the context window check, and forcefully replaces it.
5. **Result:** *"Ask Aaditya for the Figma design."* (Failure).

### The Fix Required:
The learning loop must look for occurrences of words that share a phonetic key with an *existing active candidate*, even if the user didn't modify them. If it spots "Aditi" left uncorrected, it must explicitly insert an identity rule (`Aditi ➔ Aditi`) and flag `ambiguityRisk = true` to force context evaluation between the two names.

---

## 2. Bag-of-Words Context Blindness (The IDF Limitation)

The system relies on an Inverse Document Frequency (IDF) bag-of-words approach ($\pm4$ tokens). While this mathematically prevents generic words ("the", "good", "is") from triggering substitutions, it completely ignores **semantic meaning, word order, and syntax**.

### The Scenario:
- **Positive anchors for Kivi:** "product", "sarvam", "service"
- **Sentence A:** "The Sarvam Kivi product is great." (Correctly evaluated)
- **Sentence B:** "Sarvam has a new product. I ate a kiwi." 

### The Flaw:
Because the system looks $\pm4$ tokens in both directions, in Sentence B, the words "Sarvam" and "product" fall within the radius of "kiwi". The system simply sums the weights of the anchors present in the window. 
- **Result:** It will incorrectly autocorrect Sentence B to *"Sarvam has a new product. I ate a Kivi."* 

### The Fix Required:
A purely math-based approach reaches its limit here. To solve this, the system needs either syntactic dependency parsing (knowing that "ate" governs "kiwi", whereas "product" governs "Sarvam"), or it must fall back to a localized LLM router for highly ambiguous sentences.

---

## 3. Metaphone Hashing Collisions on Non-Errors

Our "Index by Mistake" strategy solves the problem of Metaphone being bad at Indian names (e.g., Sarvan ➔ `SRFN`, Sarvam ➔ `SRFM`). We index under the mistake's hash.

However, Metaphone is highly aggressive at dropping vowels and conflating consonants, which causes **false positives** where two completely unrelated words hash to the exact same key.

### The Scenario:
Consider the words **"Pat"** and **"Pete"**.
- `metaphone("Pat")` ➔ `PT`
- `metaphone("Pete")` ➔ `PT`

### The Flaw:
If the user corrects "Pete" to "Peter", the system learns: `PT ➔ Peter`.
If the LLM later outputs "Pat the dog", the system hashes "Pat" to `PT`, looks it up, finds "Peter", and potentially overwrites it to *"Peter the dog"* if the context weights align poorly.

### The Fix Required:
The system needs a secondary string-distance check (like Levenshtein distance) *before* it accepts a phonetic candidate. If the original ASR word is too wildly different from the candidate's historical mistake origins, it should reject the candidate even if the Metaphone hash matches.

---

## 4. Sub-word Tokenization and Punctuation Splitting

The current tokenizer splits by regex word boundaries (`\b`) and filters by `\w+`. 

### The Scenario:
A user's name is "D'Souza", and the LLM outputs "De Souza".

### The Flaw:
1. `tokenize("D'Souza")` yields `["D", "Souza"]`.
2. The `diffArrays` logic breaks down because it evaluates "D" and "Souza" as entirely independent tokens with separate phonetic keys. 
3. The system cannot apply a multi-token memory substitution (e.g., changing two words "De Souza" into one joined word "D'Souza").

### The Fix Required:
The memory system must support $n$-gram diffing and substitution, allowing it to evaluate and replace multi-token spans as a single continuous memory entry.
