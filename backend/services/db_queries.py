from sqlalchemy.orm import Session
from models.Models import Product, Category, Inquiry
from sqlalchemy import desc

def get_new_arrivals(db: Session):
    try:
        return db.query(Product).order_by(desc(Product.createdAt)).limit(10).all()
    except Exception as e:
        print(f"[DB ERROR get_new_arrivals]: {e}")
        return []

def get_products_by_category(db: Session, category_name=None, brand=None):
    try:
        query = db.query(Product).join(Category)
        if category_name:
            query = query.filter(Category.name.ilike(f"%{category_name}%"))
        if brand:
            query = query.filter(Product.name.ilike(f"%{brand}%"))
        return query.all()
    except Exception as e:
        print(f"[DB ERROR get_products_by_category]: {e}")
        return []

def get_product_details(db: Session, product_name):
    try:
        return db.query(Product).filter(Product.name.ilike(f"%{product_name}%")).first()
    except Exception as e:
        print(f"[DB ERROR get_product_details]: {e}")
        return None

def get_all_categories(db: Session):
    try:
        return db.query(Category).all()
    except Exception as e:
        print(f"[DB ERROR get_all_categories]: {e}")
        return []

def save_feedback(db: Session, user_id, feedback_text):
    try:
        feedback = Inquiry(user_id=user_id, inquiry=feedback_text)
        db.add(feedback)
        db.commit()
        return feedback
    except Exception as e:
        print(f"[DB ERROR save_feedback]: {e}")
        return None
