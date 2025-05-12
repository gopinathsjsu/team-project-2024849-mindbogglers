from sqlalchemy import Column, Integer, String, Float, Enum, Date, Time, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.database import Base

# User Model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(Enum("Customer", "RestaurantManager", "Admin", name="user_roles"))

    reviews = relationship("Review", back_populates="user")
    restaurants = relationship("Restaurant", back_populates="manager") 



# Restaurant Model
class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    cuisine = Column(String, nullable=False)
    cost_rating = Column(Integer)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    zip_code = Column(String, nullable=False)
    rating = Column(Float, default=0.0)
    total_bookings = Column(Integer, default=0)
    description = Column(Text, nullable=True)
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    hours_open = Column(String, nullable=True)
    hours_close = Column(String, nullable=True)
    address = Column(String, nullable=True)
    photos = relationship("RestaurantPhoto", back_populates="restaurant")





    manager_id = Column(Integer, ForeignKey("users.id"))
    manager = relationship("User", back_populates="restaurants")

    tables = relationship("Table", back_populates="restaurant")
    reviews = relationship("Review", back_populates="restaurant")


# Table Model
class Table(Base):
    __tablename__ = "tables"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    size = Column(Integer, nullable=False)  # number of seats
    available_times = Column(String)  # e.g. "18:00,18:30,19:00"

    restaurant = relationship("Restaurant", back_populates="tables")


# Reservation Model
class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    table_id = Column(Integer, ForeignKey("tables.id"))
    date = Column(Date)
    time = Column(Time)
    number_of_people = Column(Integer)

    user = relationship("User")
    restaurant = relationship("Restaurant")
    table = relationship("Table")


# Review Model
class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # e.g., 1 to 5
    comment = Column(Text, nullable=True)

    user = relationship("User", back_populates="reviews")
    restaurant = relationship("Restaurant", back_populates="reviews")

# Restaurant Approval Model
class RestaurantApproval(Base):
    __tablename__ = "restaurant_approvals"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    status = Column(String, default="pending")  # pending, approved, rejected

    restaurant = relationship("Restaurant")

# RestaurantPhoto Model
class RestaurantPhoto(Base):
    __tablename__ = "restaurant_photos"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    photo_url = Column(String, nullable=False)
    description = Column(String)

    restaurant = relationship("Restaurant", back_populates="photos")
