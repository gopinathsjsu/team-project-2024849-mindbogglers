from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, LargeBinary
from sqlalchemy.orm import relationship
from app.db.database import Base

class RestaurantPhoto(Base):
    __tablename__ = "restaurant_photos"
    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    photo_url = Column(String)  # Store URL to photo
    description = Column(String, nullable=True)
    restaurant = relationship("Restaurant")

class RestaurantApproval(Base):
    __tablename__ = "restaurant_approvals"
    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    status = Column(String)  # "pending", "approved", "rejected"
    admin_notes = Column(String, nullable=True)
    restaurant = relationship("Restaurant")