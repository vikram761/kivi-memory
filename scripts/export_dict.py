import json
import nltk

try:
    nltk.data.find('corpora/words')
except LookupError:
    nltk.download('words')

from nltk.corpus import words

d = set(w.lower() for w in words.words())
# ensure kiwi is there, NLTK words might not have modern words
d.add('kiwi')

with open('backend/data/dictionary.json', 'w') as f:
    json.dump(list(d), f)
print('Done!')
