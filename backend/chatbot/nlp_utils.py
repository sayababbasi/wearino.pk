import re
from typing import Dict, List, Optional, Tuple

CATEGORY_ALIASES = {
    "women": ["women", "women's", "female", "ladies"],
    "men": ["men", "men's", "male", "guys"],
    "kids": ["kids", "child", "children"],
    "accessories": ["accessories", "accessory", "belt", "wallet"],
    "beauty": ["beauty", "makeup", "make-up", "cosmetics", "perfume", "perfumes"],
    "home": ["home", "homeware", "decor"],
    "sale": ["sale", "discount", "discounts", "offers", "deals"],
    "shoes": ["shoes", "heels", "sandals", "sneakers", "boots"],
    "bags": ["bags", "handbags", "tote", "backpack"],
}

def normalize_category_name(name: str) -> str:
    if not name:
        return ""
    n = name.strip().lower()
    n = n.replace("'", "").replace("&", "and")
    n = n.replace(",", "")
    # Map aliases to canonical category
    for canonical, aliases in CATEGORY_ALIASES.items():
        for a in aliases:
            if a in n:
                return canonical
    # fallback: convert spaces to underscore
    return n.replace(" ", "_")

def extract_entities(user_input: str, expected_entities: List[str]) -> Dict[str, str]:
    """
    Heuristics-based entity extraction used by intent follow-ups.
    - Orders: find order id patterns
    - Category: look for known category words
    - Feedback: full text fallback
    """
    text = user_input.strip()
    lower = text.lower()
    entities = {}

    # order id pattern e.g. 'order id 12345' or 'order number 12345' or just '12345'
    if "order" in lower or "status" in lower or "track" in lower:
        # Strict: #ORD-XXXXX or similar
        m_strict = re.search(r"(#?ORD-?[0-9]{4,6})", text, re.IGNORECASE)
        if m_strict:
             entities["order_id"] = m_strict.group(1).upper()
        else:
             # Look for Order ID: XXXXX
             m_explicit = re.search(r"(?:order\s*(?:id|number|#)?\s*[:\s])\s*([A-Z0-9\-]{4,12})", text, re.IGNORECASE)
             if m_explicit:
                 entities["order_id"] = m_explicit.group(1)

    # capture simple standalone alphanumeric token IF we expect an order_id
    # But be careful not to capture "order" or "status"
    if "order_id" not in entities and "order_id" in expected_entities:
         # Find potential ID: 4-6 digits or mix chars, but exclude common words
         tokens = text.split()
         for t in tokens:
             clean = re.sub(r"[^a-zA-Z0-9-]", "", t)
             # Basic check: looks like ID if it has digits or is uppercase mix, and len >= 4
             if len(clean) >= 4 and clean.lower() not in ["order", "status", "track", "check", "please", "where"]:
                 # If pure digits or mixed alpha-num
                 if any(c.isdigit() for c in clean) or (any(c.isalpha() for c in clean) and any(c.isdigit() for c in clean)):
                      entities["order_id"] = clean
                      break

    # reason: 'reason: defective' or 'reason is defective'
    m3 = re.search(r"reason[:\s-]+(.+)$", text, re.IGNORECASE)
    if m3:
        entities["reason"] = m3.group(1).strip()

    # find category by alias list
    for canonical, aliases in CATEGORY_ALIASES.items():
        for a in aliases:
            # Word boundary check is crucial
            if re.search(rf"\b{re.escape(a)}\b", lower):
                entities["category"] = canonical
                break
        if "category" in entities:
            break

    # If expected only has one slot and nothing else found, fallback to whole utterance if reasonable length
    if len(expected_entities) == 1 and not entities:
        key = expected_entities[0]
        # Only fallback to full text for certain keys
        if key in ["feedback_text", "reason"] or (key == "category" and len(text) < 20):
             entities[key] = text

    # feedback_text fallback
    if any(k in ["feedback_text", "feedback"] for k in expected_entities):
        entities["feedback_text"] = text

    return entities

def match_intent_fuzzy(user_input: str, intents_data: List[dict]) -> Tuple[Optional[dict], Dict[str,str]]:
    """
    Score intents based on keyword matches if strict regex fails.
    """
    best_intent = None
    best_score = 0
    
    tokens = [t.lower() for t in re.findall(r"\w+", user_input)]
    if not tokens:
        return None, {}

    for it in intents_data:
        score = 0
        # Build keywords from patterns + explicitly added keywords
        keywords = set()
        if it.get("keywords"):
             keywords.update([k.lower() for k in it.get("keywords")])
        
        # naive extraction from patterns
        for p in it.get("patterns", []):
            parts = re.findall(r"\w+", p)
            # Add significant words
            for pt in parts:
                if len(pt) > 3: keywords.add(pt.lower())
        
        # Scoring
        match_count = 0
        for t in tokens:
            if t in keywords:
                match_count += 1
        
        if match_count > 0:
            score = match_count
            # boost if exact entity match found
            # e.g. if category alias found
            intent_entities = extract_entities(user_input, it.get("entities") or [])
            if intent_entities:
                score += 2

        if score > best_score:
            best_score = score
            best_intent = it

    if best_score > 0:
        return best_intent, extract_entities(user_input, best_intent.get("entities") or [])
    
    return None, {}

def match_intent(user_input: str, intents_data: List[dict]) -> Tuple[Optional[dict], Dict[str,str]]:
    """
    Match the best intent by regex patterns defined in intents.json.
    Returns (intent, extracted_entities).
    """
    best = None
    best_pat_len = 0
    
    # 1. Strict Regex Match
    for it in intents_data:
        for pat in it.get("patterns", []):
            try:
                if re.search(pat, user_input, re.IGNORECASE):
                    if len(pat) > best_pat_len:
                        best = it
                        best_pat_len = len(pat)
            except re.error:
                if pat.lower() in user_input.lower() and len(pat) > best_pat_len:
                    best = it
                    best_pat_len = len(pat)

    entities = {}
    if best:
        expected = (best.get("follow_up") or {}).get("expected_entity", []) or best.get("entities", []) or []
        entities = extract_entities(user_input, expected)
        return best, entities
    
    # 2. Score-based Fuzzy Match (Fallback)
    return match_intent_fuzzy(user_input, intents_data)
