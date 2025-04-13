import os
import sys
from typing import Dict

curr_dir = os.path.dirname(os.path.realpath(__file__))
NRCPY_DIR = os.path.abspath(os.path.join(curr_dir, '..', "nrcpy"))
if not NRCPY_DIR in sys.path : sys.path.append(NRCPY_DIR)
import emotion_analysis

EMOLEXL = emotion_analysis.get_emolex(os.path.join(NRCPY_DIR, "nrc_emolex.json"))
def sentims(payload : Dict) -> Dict:
    reviews = payload["reviews"]
    all_reviews = " ".join(reviews)
    sentiments_dict, emotion_lvl, _, _ = emotion_analysis.emolex(all_reviews, EMOLEXL)
    # divide by emotion_lvl to get frequency
    sentiment_frequency = {k:v/emotion_lvl for k, v in sentiments_dict.items()} if emotion_lvl != 0 else sentiments_dict
    # Delete key 'trust' -- appears with too high of a ranking.
    if "trust" in sentiment_frequency:
        del sentiment_frequency["trust"]
    payload["sentiments"] = sentiment_frequency
    return payload