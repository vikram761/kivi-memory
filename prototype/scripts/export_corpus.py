import json
import nltk
from collections import Counter

try:
    nltk.data.find('corpora/brown')
except LookupError:
    nltk.download('brown')

from nltk.corpus import brown

print("Calculating frequencies...")
freq_dist = Counter(w.lower() for w in brown.words())

with open('backend/frequencies.json', 'w') as f:
    json.dump(freq_dist, f)
print(f"Exported {len(freq_dist)} words to backend/frequencies.json")
