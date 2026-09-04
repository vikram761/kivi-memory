# Architecture and Database Schema

The system utilizes a deterministic, two-phase architecture backed by PostgreSQL that entirely avoids large language models during the inference path. This approach ensures zero-hallucination replacements, highly inspectable logging, and a reproducible evaluation suite. The goal is to build the smallest useful phonetic memory system.

The database relies on the `fuzzystrmatch` extension for phonetic matching.

* **`memory_entries`**: Stores `canonical_term`, `phonetic_key`, a `confidence` metric, net `observation_count`, an `ambiguity_risk` boolean for dictionary collisions, and JSONB maps (`positive_anchors`, `negative_anchors`) for context tokens.


* **`intervention_logs`**: Fulfills inspectability requirements by recording the raw ASR, base formatted text, deterministic decision state, calculated arithmetic score, matched token array, execution latency, and $0.00 model cost.



# The Learning Phase (Write Path)

Memory updates trigger deterministically when an observation occurs between the formatted text and the final user-accepted text. The backend performs a position-aware diff on the sentence to isolate the specific changed span. Positive confirmations increment the observation count, calculating confidence as $\min(1,observationCount/3)$, while reverts heavily decay the trust.

For terms flagged with dictionary collision risk, the system extracts a $\pm4$ token window around the occurrence, stripping stop words.

* The changed occurrence's contextual window is stored in the `positive_anchors` JSONB map.


* If the identical phonetic word exists elsewhere in the same sentence but is left uncorrected, its window is added to the `negative_anchors` JSONB map.



# The Inference Phase (Read Path)

Incoming tokens are converted to phonetic keys and queried against active candidates. If a candidate lacks ambiguity risk (e.g., proper noun "Aaditya"), the system bypasses contextual checks and performs direct span replacement.

For ambiguous terms, a $\pm4$ token window is extracted and inverse token weighting is applied to prevent generic words from triggering substitutions:


$$weight(w)=\frac{1}{1+docFreq(w)}$$

$$Score=\sum_{w\in{window}}weight(w)\times(positiveCount[w]-negativeCount[w])$$

* If the calculated score exceeds a defined minimum threshold, the target character span is mutated in-place.


* If the score fails to meet the threshold, the text remains untouched and the rejection reasoning is logged mathematically.



# Application Design and Evaluation

The interface provides a runnable demonstration featuring a user dropdown for clean states and a database reset button. The Training Page accepts formatted and final text to trigger diff learning. The Inference Page displays the final memory-aware output with inline score justifications directly below the result. The System State Page exposes the active dictionary thresholds and intervention audit trails.

The reproducible evaluation suite validates distinct cases:

* **Unambiguous Proper Nouns**: Direct replacement without anchor matches.


* **Positive Context**: "Sarvam kiwi service" replacing with "Kivi".


* **Negative Context**: "kiwi for breakfast" resulting in deliberate inaction and a logged score of 0.


* **Weak Signal Rejection**: Rejecting substitutions based solely on weak generic overlaps.



Does this structural blueprint provide all necessary specifications to initialize the repository and begin coding?
