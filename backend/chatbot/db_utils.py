from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from models.Models import Product, Category, Inquiry

def _product_to_dict(p: Product) -> Dict:
    return {
        "id": p.id,
        "name": p.name,
        "description": p.description,
        "price": p.price,
        "image": p.image,
        "categoryId": p.categoryId,
        "createdAt": getattr(p, "createdAt", None),
    }

def safe_get_products_by_category(db: Optional[Session], category_name: str) -> Optional[List[Dict]]:
    """
    Returns list of product dicts or None if DB not available / error.
    """
    if db is None:
        return None
    try:
        cat = db.query(Category).filter(Category.name.ilike(f"%{category_name}%")).first()
        if not cat:
            return []
        prods = db.query(Product).filter(Product.categoryId == cat.id).limit(50).all()
        return [_product_to_dict(p) for p in prods]
    except Exception as e:
        print(f"[db_utils.safe_get_products_by_category] {e}")
        return None

def safe_search_products(db: Optional[Session], keyword: str) -> Optional[List[Dict]]:
    if db is None:
        return None
    try:
        q = db.query(Product).filter(Product.name.ilike(f"%{keyword}%")).limit(50).all()
        return [_product_to_dict(p) for p in q]
    except Exception as e:
        print(f"[db_utils.safe_search_products] {e}")
        return None

def safe_get_latest_products(db: Optional[Session], limit: int = 10) -> Optional[List[Dict]]:
    if db is None:
        return None
    try:
        prods = db.query(Product).order_by(Product.createdAt.desc()).limit(limit).all()
        return [_product_to_dict(p) for p in prods]
    except Exception as e:
        print(f"[db_utils.safe_get_latest_products] {e}")
        return None

def safe_get_categories(db: Optional[Session]) -> Optional[List[Dict]]:
    if db is None:
        return None
    try:
        cats = db.query(Category).all()
        return [{"id": c.id, "name": c.name} for c in cats]
    except Exception as e:
        print(f"[db_utils.safe_get_categories] {e}")
        return None

def safe_save_inquiry(db: Optional[Session], user_id: str, message: str, product_id: int = None, name: str = None, email: str = None) -> bool:
    if db is None:
        return False
    try:
        rec = Inquiry(userId=user_id, productId=product_id, name=name, email=email, message=message)
        db.add(rec)
        db.commit()
        return True
    except Exception as e:
        print(f"[db_utils.safe_save_inquiry] {e}")
        try:
            db.rollback()
        except:
            pass
        return False
