import os
import re
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from rapidfuzz import fuzz
import textstat

from app.utils.nltk_setup import NLTK_DATA  # triggers the setup once



def score_structure(response: str) -> float:
    """
    Heuristic: count sentences (.,!,?) and paragraphs (\n).
    Returns:
      ≥5 sentences & ≥2 paragraphs → 10.0
      ≥4 sentences → 8.0
      ≥2 sentences → 6.0
      else → 4.0
    """
    if not response:
        return 0.0
    sentences = response.count('.') + response.count('!') + response.count('?')
    paragraphs = max(1, response.count('\n') + 1)
    if sentences >= 5 and paragraphs >= 2:
        return 10.0
    if sentences >= 4:
        return 8.0
    if sentences >= 2:
        return 6.0
    return 4.0





def score_readability(response: str) -> float:
    """
    Map Flesch Reading Ease into a 0–10 scale:
      90+  → 10.0
      60–89 → 8.0
      30–59 → 6.0
      <30   → 4.0
    """
    ease = textstat.flesch_reading_ease(response or "")
    if ease >= 90:
        return 10.0
    if ease >= 60:
        return 8.0
    if ease >= 30:
        return 6.0
    return 4.0




def score_similarity(question: dict, response: str) -> float:
    """
    Compare 'explanation' vs. response via token_set_ratio.
    Scale 0-100 into 0-10.
    """
    expl = question.get("explanation", "")
    if not expl:
        return 0.0
    sim = fuzz.token_set_ratio(clean_text(expl), clean_text(response))
    return round((sim / 100) * 10, 2)






def score_keywords(question: dict, response: str) -> float:
    """
    For each keyword, if any response token fuzzily matches it >80%, count as matched.
    Returns (matched / total_keywords) * 10, rounded to 2 decimals.
    """
    keywords = [kw.lower() for kw in question.get("keywords", [])]
    if not keywords:
        return 0.0
    tokens = tokenize_and_filter(response)
    matched = 0
    for kw in keywords:
        if any(fuzz.partial_ratio(kw, tok) > 80 for tok in tokens):
            matched += 1
    return round((matched / len(keywords)) * 10, 2)





_STOPWORDS = set(stopwords.words("english"))

def clean_text(text: str) -> str:
    """
    Lowercase, strip whitespace, collapse internal runs of whitespace.
    """
    return re.sub(r"\s+", " ", text.strip().lower())

def tokenize_and_filter(text: str) -> list[str]:
    """
    Tokenize on words, keep only alphanumeric tokens not in stopwords.
    """
    txt = clean_text(text)
    tokens = word_tokenize(txt)
    return [t for t in tokens if t.isalnum() and t not in _STOPWORDS]

