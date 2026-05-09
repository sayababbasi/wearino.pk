import json
import os
import random
from typing import Any, Dict, Optional
from .nlp_utils import match_intent, extract_entities, normalize_category_name
from .db_utils import (
    safe_get_products_by_category,
    safe_search_products,
    safe_get_latest_products,
    safe_save_inquiry,
    safe_get_categories
)


def generate_unique_order_id():
    # Format: #ORD-[Random-5-Digits]
    return f"#ORD-{random.randint(10000, 99999)}"

NAVIGATION_MAP = {
    "women clothes": "/products",
    "denim jacket": "/products/1",
    "fashion blouse": "/products/5",
    "checkout": "/checkout",
    "women": "/categories/women",
    "men": "/categories/men",
    "kids": "/categories/kids",
    "accessories": "/categories/accessories",
    "beauty": "/categories/beauty",
    "home": "/categories/home",
    "sale": "/categories/sale",
    "cart": "/categories/cart",
    "wishlist": "/categories/wishlist"
}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  
INTENTS_PATH = os.path.join(BASE_DIR, "intents.json")

try:
    with open(INTENTS_PATH, "r", encoding="utf-8") as f:
        INTENTS_DATA = json.load(f).get("intents", [])
    print(f"[chatbot_logic] Loaded {len(INTENTS_DATA)} intents")
except Exception as e:
    print(f"[chatbot_logic] Failed to load intents.json: {e}")
    INTENTS_DATA = []

conversation_memory: Dict[str, Dict[str, Any]] = {}

def get_intent_by_tag(tag: str):
    for it in INTENTS_DATA:
        if it.get("tag") == tag:
            return it
    return None

def detect_navigation(text: str):
    text = text.lower()
    for key, route in NAVIGATION_MAP.items():
        if key in text:
            return f"Sure! Navigating to {key.title()} section.", route
    return None, None

def generate_text_from_template(template: str, entities: Dict[str, str], example_data: Dict[str, Any]):
    out = template
    for k, v in entities.items():
        out = out.replace(f"{{{{{k}}}}}", str(v))
    for key, val in (example_data or {}).items():
        if isinstance(val, list):
            out = out.replace(f"{{{{{key}}}}}", ", ".join(val))
        elif isinstance(val, dict):
            out = out.replace(f"{{{{{key}}}}}", str(val))
    return out

def generate_response_for_intent(intent: dict, entities: Dict[str, str], db_session) -> Dict[str, Optional[str]]:
    tag = intent.get("tag", "")
    follow_up = intent.get("follow_up") or {}
    example_data = follow_up.get("example_data") or intent.get("example_data") or {}
    template = follow_up.get("response_template") or random.choice(intent.get("responses", ["Sorry, I don't understand."]))

    # product_search
    if tag == "product_search":
        cat_entity = entities.get("category") or follow_up.get("default_category") or ""
        normalized = normalize_category_name(cat_entity)
        products = None
        if db_session is not None:
            try:
                db_products = safe_get_products_by_category(db_session, normalized)
                if db_products is not None:
                    products = [p.get("name") for p in db_products]
            except Exception:
                products = None

        if not products:
            # fallback to example_data keys
            products = example_data.get(normalized) or example_data.get(normalized.replace(" ", "_")) or example_data.get(follow_up.get("default_category")) or []
        if not products:
            products = ["No products found"]
        text = template.replace("{{category}}", cat_entity or "products").replace("{{product_list}}", ", ".join(products))
        navigate = f"/categories/{normalized.replace('_','-')}" if normalized else "/products"
        return {"text": text, "navigate_to": navigate}

    # search_products: keyword search
    if tag == "search_products":
        keyword = entities.get("keyword") or ""
        products = None
        if db_session is not None and keyword:
            try:
                db_products = safe_search_products(db_session, keyword)
                if db_products is not None:
                    products = [p.get("name") for p in db_products]
            except Exception:
                products = None
        if not products:
            # fallback to searching example_data lists
            flattened = []
            for v in example_data.values():
                if isinstance(v, list):
                    flattened.extend(v)
            products = [p for p in flattened if keyword.lower() in p.lower()] or flattened[:5] or []
        text = template.replace("{{keyword}}", keyword).replace("{{product_list}}", ", ".join(products))
        return {"text": text, "navigate_to": f"/products?search={keyword}"}

    # browse_category
    if tag == "browse_category":
        category = entities.get("category") or follow_up.get("default_category") or "all"
        normalized = normalize_category_name(category)
        products = None
        if db_session is not None:
            try:
                db_products = safe_get_products_by_category(db_session, normalized)
                if db_products is not None:
                    products = [p.get("name") for p in db_products]
            except Exception:
                products = None
        if not products:
            products = example_data.get(normalized) or example_data.get(normalized.replace(" ", "_")) or ["No items available"]
        text = template.replace("{{category}}", category).replace("{{product_list}}", ", ".join(products))
        navigate = f"/categories/{normalized.replace('_','-')}"
        return {"text": text, "navigate_to": navigate}

    # delivery_status
    if tag == "delivery_status":
        order_id = entities.get("order_id")
        
        # Scenario B: User omits ID - this might be handled by memory flow, 
        # but if we are here and still no ID, we should ask.
        # However, the match_intent wrapper usually catches missing entities first 
        # if configured in expected_entity. 
        # If we reached here, we might have an ID or we are in a direct response.
        
        if not order_id and "order_id" in follow_up.get("expected_entity", []):
             # This branch might be reached if nlp_utils didn't find it but we forced entry?
             # Usually 'missing' logic in get_bot_response handles this.
             # But let's be safe.
             return {"text": "I can help with that. Could you please provide your Order ID?", "navigate_to": None}

        if order_id:
             # Scenario A (User provides ID) & Scenario C (Invalid ID)
             # Mock DB check
             # refined logic: Check if it looks like a valid ID
             if len(order_id) >= 4: # Simple heuristic
                 status = random.choice(["Shipped", "Processing", "Out for Delivery", "Delivered"])
                 text = template.replace("{{order_id}}", order_id).replace("{{status}}", status)
                 return {"text": text, "navigate_to": f"/orderReceipt/{order_id.replace('#', '')}"}
             else:
                 # Scenario C
                 return {"text": f"I cannot find an order with ID {order_id}. Please double-check the number.", "navigate_to": None}
        
        return {"text": "I can help with that. Could you please provide your Order ID?", "navigate_to": None}

    # place_order
    if tag == "place_order":
        # User wants to buy -> navigate to checkout
        return {"text": "Great! Navigating you to checkout to complete your purchase.", "navigate_to": "/checkout"}

    if tag == "refund_request":
        order_id = entities.get("order_id") or "unknown"
        text = template.replace("{{order_id}}", order_id).replace("{{refund_status}}", "Pending")
        return {"text": text, "navigate_to": None}

    # offers / new arrivals
    if tag in ("offers_discounts", "new_arrivals"):
        if tag == "new_arrivals":
            items = None
            if db_session is not None:
                try:
                    db_items = safe_get_latest_products(db_session, limit=6)
                    if db_items is not None:
                        items = [p.get("name") for p in db_items]
                except Exception:
                    items = None
            if not items:
                items = example_data.get("new_items") or []
            text = template.replace("{{new_items}}", ", ".join(items))
            return {"text": text, "navigate_to": "/products"}
        # offers
        offer_list = example_data.get("offer_list", [])
        text = template.replace("{{offer_list}}", ", ".join(offer_list))
        return {"text": text, "navigate_to": None}
    if tag == "feedback":
        feedback_text = entities.get("feedback_text")
        if not feedback_text:
            prompt = follow_up.get("prompt") or random.choice(intent.get("responses", ["Please type your review."]))
            return {"text": prompt, "navigate_to": None}
        msg = follow_up.get("response_template") or "Thank you! Your feedback has been successfully recorded."
        return {"text": msg, "navigate_to": None}

    text = generate_text_from_template(template, entities, example_data)
    return {"text": text, "navigate_to": None}


def get_bot_response(user_input: str, user_id: str = "user1", db_session=None) -> Dict[str, Optional[str]]:
    """
    Main hybrid entrypoint. Use this in your FastAPI handler.
    - db_session: value from Depends(get_db()) (may be None)
    """
    nav_text, nav_route = detect_navigation(user_input)
    if nav_route:
       return {"text": nav_text, "navigate_to": nav_route}

    if not user_input or not user_input.strip():
       return {"text": "Please type something so I can help.", "navigate_to": None}

    if user_id in conversation_memory:
        follow = conversation_memory[user_id]
        expected = follow.get("expected_entity", [])
        entities = extract_entities(user_input, expected)
        intent = follow.get("intent")
        try:
            resp = generate_response_for_intent(intent, entities, db_session)
        finally:
            if user_id in conversation_memory:
                del conversation_memory[user_id]
        return resp

    intent, entities = match_intent(user_input, INTENTS_DATA)
    if intent is None:
        if db_session is not None:
            db_search = safe_search_products(db_session, user_input.strip())
            if db_search:
                names = [p.get("name") for p in db_search]
                return {"text": f"I found: {', '.join(names)}", "navigate_to": f"/products?search={user_input.strip()}"}
        return {"text": "Sorry, I didn't understand. Try asking about categories, products, or orders.", "navigate_to": None}

    follow = intent.get("follow_up") or {}
    expected_entities = follow.get("expected_entity", []) or intent.get("entities", []) or []
    missing = [e for e in expected_entities if not entities.get(e)]
    if missing:
        conversation_memory[user_id] = {"intent": intent, "expected_entity": expected_entities}
        prompt = follow.get("prompt") or random.choice(intent.get("responses", ["Please provide more information."]))
        return {"text": prompt, "navigate_to": None}

    return generate_response_for_intent(intent, entities, db_session)
