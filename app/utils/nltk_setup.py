# app/utils/nltk_setup.py
import os, nltk

NLTK_DATA = os.environ.get("NLTK_DATA", os.path.join(os.getcwd(), "app", "nltk_data"))
os.makedirs(NLTK_DATA, exist_ok=True)
nltk.data.path.insert(0, NLTK_DATA)

for pkg, path in [("punkt","tokenizers"), ("stopwords","corpora")]:
    try:
        nltk.data.find(f"{path}/{pkg}")
    except LookupError:
        nltk.download(pkg, download_dir=NLTK_DATA)
