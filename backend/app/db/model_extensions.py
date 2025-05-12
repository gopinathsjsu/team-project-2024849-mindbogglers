# from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, LargeBinary
# from sqlalchemy.orm import relationship
# from app.db.database import Base

# class RestaurantPhoto(Base):
#     __tablename__ = "restaurant_photos"
#     __table_args__ = {'extend_existing': True}  # ✅ not needed if removing duplicate
#     id = Column(Integer, primary_key=True, index=True)
#     restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
#     photo_url = Column(String)
#     description = Column(String, nullable=True)
#     restaurant = relationship("app.db.models.Restaurant", back_populates="photos")
