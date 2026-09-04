# Phonetic Memory System: Architecture & Keying Strategy

This document explains how the Kivi memory prototype matches words phonetically without relying on hardcoded character replacements (like mapping `w` to `v`) or requiring perfect phonetic algorithm parity.

## The Problem: Phonetic Algorithm Limitations

Out-of-the-box phonetic algorithms like Metaphone were designed for Western names and often fail on Indian English phonetic conflations or specific ASR quirks.

For example:
*   `get_phonetic_key("kiwi")` → `KW`
*   `get_phonetic_key("Kivi")` → `KF`
*   `get_phonetic_key("aditya")` → `ATTY`
*   `get_phonetic_key("Aaditya")` → `TTY`

If the system strictly stored memory entries using the phonetic key of the **target word** (`KF` for "Kivi"), it would fail during inference. When the ASR outputs "kiwi", the system would hash it to `KW`, search the database for `KW`, find nothing, and fail to intervene.

## The Solution: Indexing by the ASR's Mistake

Instead of trying to force "kiwi" and "Kivi" to have the exact same hash using regex hacks, the system generalizes the process by storing the memory entry using the phonetic hash of the **original ASR mistake**.

### 1. The Learning Phase (Write Path)
When a user corrects the ASR output:
*   **ASR Output:** "kiwi"
*   **User Corrects To:** "Kivi"
*   **System Sees:** `orig_word = "kiwi"`, `new_word = "Kivi"`

The system computes the phonetic key of the `orig_word`:
`pkey = get_phonetic_key("kiwi")` → `KW`

It stores this in the database:
```json
{
  "KW": {
    "canonical_term": "Kivi",
    "phonetic_key": "KW",
    "ambiguity_risk": true,
    ...
  }
}
```
**Why this matters:** The system explicitly learns the mapping: *"When the ASR outputs something that sounds like 'kiwi' (`KW`), the user actually wants 'Kivi'."*

### 2. The Inference Phase (Read Path)
When the user speaks again:
*   **ASR Outputs:** "review the sarvam kiwi service"

The system evaluates the word "kiwi":
1.  Hashes the incoming word: `get_phonetic_key("kiwi")` → `KW`.
2.  Queries the database for active candidates with `phonetic_key == "KW"`.
3.  Successfully finds the memory entry for `canonical_term = "Kivi"`.
4.  Evaluates context anchors and confidently substitutes "kiwi" with "Kivi".

Because the database is indexed by the phonetic footprint of the ASR's mistakes, "kiwi" and "Kivi" **do not need to have the same phonetic hash** for the system to link them together.

### 3. Handling Reverts (Decaying Trust)
What happens if the system incorrectly intervenes, and the user reverts it?
*   **System Outputs:** "Kivi is a fruit"
*   **User Reverts To:** "kiwi is a fruit"
*   **System Sees:** `orig_word = "Kivi"`, `new_word = "kiwi"`

If the system tried to look up the memory entry using `get_phonetic_key("Kivi")` → `KF`, it wouldn't find the original entry (which is stored under `KW`). 

To fix this, during a revert, the system ignores the phonetic key. Instead, it directly searches the database for the active candidate that caused the intervention: 
`SELECT * FROM memory_entries WHERE canonical_term = 'Kivi'`

Once found, it heavily decays the `observation_count` of that specific entry, ensuring the system learns from its over-corrections without breaking the phonetic mappings.
