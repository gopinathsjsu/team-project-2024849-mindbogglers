from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timedelta
from app.db import models, database
from app.auth.auth_dependency import get_current_user
from app.db.models import User
from app.models_api.restaurant import RestaurantCreate
from app.models_api.reservation import ReservationCreate
from app.utils.email_utils import send_booking_confirmation  

router = APIRouter(
    prefix="/restaurants",
    tags=["Restaurants"]
)

# DB session dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 🔍 Search restaurants
@router.get("/search", response_model=List[dict])
def search_restaurants(
    city: Optional[str] = None,
    state: Optional[str] = None,
    cuisine: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Restaurant)

    if city:
        query = query.filter(models.Restaurant.city.ilike(f"%{city}%"))
    if state:
        query = query.filter(models.Restaurant.state.ilike(f"%{state}%"))
    if cuisine:
        query = query.filter(models.Restaurant.cuisine.ilike(f"%{cuisine}%"))

    restaurants = query.all()
    if not restaurants:
        raise HTTPException(status_code=404, detail="No restaurants found matching the criteria.")

    return [
        {
            "name": r.name,
            "cuisine": r.cuisine,
            "cost_rating": r.cost_rating,
            "city": r.city,
            "state": r.state,
            "rating": r.rating,
            "total_bookings": r.total_bookings,
            "maps_url": f"https://www.google.com/maps/search/?api=1&query={'+'.join(r.name.split())}+{r.zip_code}+{'+'.join(r.city.split())}+{r.state}"
        }
        for r in restaurants
    ]

# ➕ Add new restaurant
@router.post("/add")
def add_restaurant(
    restaurant: RestaurantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "RestaurantManager":
        raise HTTPException(status_code=403, detail="Only RestaurantManagers can add restaurants.")

    new_restaurant = models.Restaurant(
        name=restaurant.name,
        cuisine=restaurant.cuisine,
        cost_rating=restaurant.cost_rating,
        city=restaurant.city,
        state=restaurant.state,
        zip_code=restaurant.zip_code,
        rating=restaurant.rating,
        total_bookings=0
    )

    db.add(new_restaurant)
    db.commit()
    db.refresh(new_restaurant)

    return {"message": "Restaurant added successfully", "restaurant_id": new_restaurant.id}

# 📅 Search availability
@router.get("/availability")
def search_availability(
    date: str,
    time: str,
    people: int,
    city: Optional[str] = None,
    state: Optional[str] = None,
    zip_code: Optional[str] = None,
    db: Session = Depends(get_db)
):
    try:
        target_time = datetime.strptime(time, "%H:%M").time()
        date_obj = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date/time format")

    start_time = (datetime.combine(date_obj, target_time) - timedelta(minutes=30)).time()
    end_time = (datetime.combine(date_obj, target_time) + timedelta(minutes=30)).time()

    restaurant_query = db.query(models.Restaurant)
    if city:
        restaurant_query = restaurant_query.filter(models.Restaurant.city.ilike(f"%{city}%"))
    if state:
        restaurant_query = restaurant_query.filter(models.Restaurant.state.ilike(f"%{state}%"))
    if zip_code:
        restaurant_query = restaurant_query.filter(models.Restaurant.zip_code == zip_code)

    matching_restaurants = []

    for restaurant in restaurant_query.all():
        for table in restaurant.tables:
            if table.size >= people:
                available_times = [t.strip() for t in table.available_times.split(",")]
                for t in available_times:
                    try:
                        t_obj = datetime.strptime(t, "%H:%M").time()
                        if start_time <= t_obj <= end_time:
                            matching_restaurants.append({
                                "restaurant_name": restaurant.name,
                                "table_id": table.id,
                                "available_time": t,
                                "city": restaurant.city,
                                "cuisine": restaurant.cuisine,
                                "cost_rating": restaurant.cost_rating,
                                "rating": restaurant.rating
                            })
                            break
                    except ValueError:
                        continue

    if not matching_restaurants:
        raise HTTPException(status_code=404, detail="No available restaurants found.")

    return matching_restaurants

# 📝 View reviews
@router.get("/{restaurant_id}/reviews")
def get_reviews(
    restaurant_id: int,
    db: Session = Depends(get_db)
):
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found.")

    reviews = db.query(models.Review).filter(models.Review.restaurant_id == restaurant_id).all()

    return [
        {
            "review_id": r.id,
            "user_name": r.user.full_name,
            "rating": r.rating,
            "comment": r.comment
        }
        for r in reviews
    ]

# 📋 View current user's reservations
@router.get("/my-reservations")
def get_my_reservations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reservations = db.query(models.Reservation).filter(models.Reservation.user_id == current_user.id).all()
    return [
        {
            "reservation_id": r.id,
            "restaurant": r.restaurant.name,
            "date": r.date,
            "time": r.time.strftime("%H:%M"),
            "table_id": r.table_id,
            "number_of_people": r.number_of_people
        } for r in reservations
    ]

# ✅ Book table + prevent overlaps + send email
@router.post("/{restaurant_id}/book")
def book_table(
    restaurant_id: int,
    reservation: ReservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "Customer":
        raise HTTPException(status_code=403, detail="Only customers can book tables.")

    restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found.")

    table = db.query(models.Table).filter(
        models.Table.id == reservation.table_id,
        models.Table.restaurant_id == restaurant_id
    ).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found for this restaurant.")

    # ⏰ Check if selected time is in table's available_times
    available_times = [t.strip() for t in table.available_times.split(",")]
    if reservation.time.strftime("%H:%M") not in available_times:
        raise HTTPException(status_code=400, detail="Selected time not available for this table.")

    # 🚫 Prevent overlapping reservations (1 hour block)
    start_time = datetime.combine(reservation.date, reservation.time)
    end_time = start_time + timedelta(hours=1)

    conflict = db.query(models.Reservation).filter(
        models.Reservation.table_id == reservation.table_id,
        models.Reservation.date == reservation.date,
        models.Reservation.time.between(
            start_time.time(),
            (end_time - timedelta(minutes=1)).time()
        )
    ).first()

    if conflict:
        raise HTTPException(
            status_code=400,
            detail="This table is already reserved within the selected time window. Please choose another time."
        )

    # ✅ All good – proceed with booking
    new_reservation = models.Reservation(
        user_id=current_user.id,
        restaurant_id=restaurant_id,
        table_id=reservation.table_id,
        date=reservation.date,
        time=reservation.time,
        number_of_people=reservation.number_of_people
    )

    db.add(new_reservation)
    db.commit()
    db.refresh(new_reservation)

    # 📧 Send confirmation email
    send_booking_confirmation(
        to_email=current_user.email,
        restaurant_name=restaurant.name,
        date=str(reservation.date),
        time=reservation.time.strftime("%H:%M"),
        number_of_people=reservation.number_of_people
    )

    return {"message": "✅ Table booked successfully!", "reservation_id": new_reservation.id}

# ✅ Cancel a booking (only by the user who made it)
@router.delete("/cancel/{reservation_id}")
def cancel_booking(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "Customer":
        raise HTTPException(status_code=403, detail="Only customers can cancel bookings.")

    reservation = db.query(models.Reservation).filter(models.Reservation.id == reservation_id).first()

    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found.")

    if reservation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only cancel your own reservations.")

    db.delete(reservation)
    db.commit()

    return {"message": "❌ Reservation cancelled successfully."}

# Add review endpoint
@router.post("/{restaurant_id}/reviews")
def add_review(
    restaurant_id: int,
    rating: int,
    comment: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "Customer":
        raise HTTPException(status_code=403, detail="Only customers can add reviews.")
    
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found.")
    
    # Check if user has already reviewed this restaurant
    existing_review = db.query(models.Review).filter(
        models.Review.user_id == current_user.id,
        models.Review.restaurant_id == restaurant_id
    ).first()
    
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this restaurant.")
    
    # Create new review
    new_review = models.Review(
        user_id=current_user.id,
        restaurant_id=restaurant_id,
        rating=rating,
        comment=comment
    )
    
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    # Update restaurant rating
    all_reviews = db.query(models.Review).filter(
        models.Review.restaurant_id == restaurant_id
    ).all()
    
    total_rating = sum(review.rating for review in all_reviews)
    avg_rating = total_rating / len(all_reviews)
    
    restaurant.rating = round(avg_rating, 1)
    db.commit()
    
    return {"message": "Review added successfully"}