# backend/models.py
from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import relationship
from database import Base

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    createdAt = Column(TIMESTAMP, server_default=func.now())
    updatedAt = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    # Relationship: products
    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(Text)
    price = Column(Float)
    image = Column(String(255))
    categoryId = Column(Integer, ForeignKey("categories.id"))
    view = Column(Integer, default=0)
    createdAt = Column(TIMESTAMP, server_default=func.now())
    updatedAt = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    category = relationship("Category", back_populates="products")


class Inquiry(Base):
    __tablename__ = "inquiries"
    id = Column(Integer, primary_key=True, index=True)
    userId = Column(String(64), nullable=True)
    productId = Column(Integer, nullable=True)
    name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    message = Column(Text, nullable=True)
    createdAt = Column(TIMESTAMP, server_default=func.now())
