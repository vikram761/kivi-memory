import json
import nltk

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

from nltk.corpus import stopwords

stops = set(stopwords.words('english'))

with open('backend/data/stopwords.json', 'w') as f:
    json.dump(list(stops), f)

print('Stopwords exported!')
