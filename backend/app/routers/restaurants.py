from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timedelta
from app.db import models, database
from app.auth.auth_dependency import get_current_user
from app.db.models import User, RestaurantApproval  # ⬅️ Make sure this is here
from app.models_api.restaurant import RestaurantCreate
from app.models_api.reservation import ReservationCreate
from app.utils.email_utils import send_booking_confirmation, BookingConfirmationDetails
from app.db import models
from app.db.models import RestaurantPhoto
from sqlalchemy.exc import OperationalError
from app.models_api.reservation import ReservationRequest






router = APIRouter(
    prefix="/restaurants",
    tags=["Restaurants"]
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()
@router.get("/search", response_model=List[dict])
def search_restaurants(
    date: Optional[str] = None,
    time: Optional[str] = None,
    people: Optional[int] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    zip_code: Optional[str] = None,
    cuisine: Optional[str] = None,
    db: Session = Depends(get_db)
):
    print(f"Search params: date={date}, time={time}, people={people}, city={city}, state={state}, zip_code={zip_code}")

    # Join with RestaurantApproval to only get approved ones
    query = db.query(models.Restaurant).join(RestaurantApproval).filter(RestaurantApproval.status == "approved")

    if city and city.strip():
        query = query.filter(models.Restaurant.city.ilike(f"%{city}%"))
    if state and state.strip():
        query = query.filter(models.Restaurant.state.ilike(f"%{state}%"))
    if zip_code and zip_code.strip():
        query = query.filter(models.Restaurant.zip_code == zip_code)
    if cuisine and cuisine.strip():
        query = query.filter(models.Restaurant.cuisine.ilike(f"%{cuisine}%"))

    restaurants = query.all()
    print(f"Found {len(restaurants)} approved restaurants")

    return [
        {
            "id": r.id,
            "name": r.name,
            "cuisine": r.cuisine,
            "cost_rating": r.cost_rating,
            "city": r.city,
            "state": r.state,
            "zip_code": r.zip_code,
            "rating": r.rating,
            "total_bookings": r.total_bookings,
            "maps_url": f"https://www.google.com/maps/search/?api=1&query={'+'.join(r.name.split())}+{r.zip_code}+{'+'.join(r.city.split())}+{r.state}"
        }
        for r in restaurants
    ]

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

    restaurant_query = db.query(models.Restaurant).join(models.RestaurantApproval).filter(models.RestaurantApproval.status == "approved")

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
                            # Fetch main image
                            image_url = None
                            if restaurant.photos:
                                for p in restaurant.photos:
                                    if p.photo_url:
                                        image_url = p.photo_url
                                        break
                            if not image_url:
                                image_url = f"https://source.unsplash.com/featured/?restaurant,{restaurant.cuisine}"

                            matching_restaurants.append({
                                "restaurant_id": restaurant.id,
                                "restaurant_name": restaurant.name,
                                "table_id": table.id,
                                "available_time": t,
                                "city": restaurant.city,
                                "state": restaurant.state,
                                "zip_code": restaurant.zip_code,
                                "cuisine": restaurant.cuisine,
                                "cost_rating": restaurant.cost_rating,
                                "rating": restaurant.rating,
                                "total_bookings": restaurant.total_bookings,
                                "maps_url": f"https://www.google.com/maps/search/?api=1&query={'+'.join(restaurant.name.split())}+{restaurant.zip_code}+{'+'.join(restaurant.city.split())}+{restaurant.state}",
                                "contact": getattr(restaurant, 'contact', None),
                                "image": image_url,
                                "description": restaurant.description or f"Enjoy a wonderful {restaurant.cuisine} dining experience in {restaurant.city}."
                            })
                            break
                    except ValueError:
                        continue

    if not matching_restaurants:
        raise HTTPException(status_code=404, detail="No available restaurants found.")

    return matching_restaurants



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

@router.post("/api/send-confirmation-email")
async def email_confirmation(
    background_tasks: BackgroundTasks,
    request: ReservationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reservation_id = request.reservation_id

    reservation = db.query(models.Reservation).filter(
        models.Reservation.id == reservation_id,
        models.Reservation.user_id == current_user.id
    ).join(models.Restaurant).first()

    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found or doesn't belong to you")

    restaurant = reservation.restaurant

    booking_details = BookingConfirmationDetails(
        id=str(reservation.id),
        restaurant_name=restaurant.name,
        date=reservation.date.strftime("%A, %B %d, %Y"),
        time=reservation.time.strftime("%H:%M"),
        people=reservation.number_of_people,
        table_type=f"Table #{reservation.table_id}" if reservation.table_id else "Standard",
        address=f"{restaurant.city}, {restaurant.state} {restaurant.zip_code}",
        contact=restaurant.contact if hasattr(restaurant, 'contact') else None
    )

    background_tasks.add_task(
        send_booking_confirmation,
        current_user.email,
        booking_details
    )

    return {"message": "Confirmation email will be sent shortly"}

@router.post("/add")
def add_restaurant(
    restaurant: RestaurantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "RestaurantManager":
        raise HTTPException(status_code=403, detail="Only RestaurantManagers can add restaurants.")

    # ✅ Prevent duplicate restaurant entries by name + zip
    existing = db.query(models.Restaurant).filter(
        models.Restaurant.name == restaurant.name,
        models.Restaurant.zip_code == restaurant.zip_code
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Restaurant already exists with the same name and zip code.")

    # ✅ Add new restaurant (status is pending)
    new_restaurant = models.Restaurant(
        name=restaurant.name,
        cuisine=restaurant.cuisine,
        cost_rating=restaurant.cost_rating,
        city=restaurant.city,
        state=restaurant.state,
        zip_code=restaurant.zip_code,
        rating=restaurant.rating,
        total_bookings=0,
        manager_id=current_user.id
    )
    db.add(new_restaurant)
    db.commit()
    db.refresh(new_restaurant)

    # ✅ Create approval request
    approval = RestaurantApproval(
        restaurant_id=new_restaurant.id,
        status="pending"
    )
    db.add(approval)
    db.commit()

    return {"message": "Restaurant submitted for approval", "restaurant_id": new_restaurant.id}

@router.post("/{restaurant_id}/book")
def book_table(
    restaurant_id: int,
    reservation: ReservationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "Customer":
        raise HTTPException(status_code=403, detail="Only customers can book tables.")

    restaurant = (
        db.query(models.Restaurant)
        .join(RestaurantApproval)
        .filter(
            models.Restaurant.id == restaurant_id,
            RestaurantApproval.status == "approved"
        )
        .first()
    )
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found or not approved for booking.")

    table = db.query(models.Table).filter(
        models.Table.id == reservation.table_id,
        models.Table.restaurant_id == restaurant_id
    ).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found for this restaurant.")

    available_times = [t.strip() for t in table.available_times.split(",")]
    if reservation.time.strftime("%H:%M") not in available_times:
        raise HTTPException(status_code=400, detail="Selected time not available for this table.")

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

    new_reservation = models.Reservation(
        user_id=current_user.id,
        restaurant_id=restaurant_id,
        table_id=reservation.table_id,
        date=reservation.date,
        time=reservation.time,
        number_of_people=reservation.number_of_people
    )

    try:
        db.add(new_reservation)
        restaurant.total_bookings += 1
        db.commit()
        db.refresh(new_reservation)
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Booking failed: {str(e)}")

    booking_details = BookingConfirmationDetails(
        id=str(new_reservation.id),
        restaurant_name=restaurant.name,
        date=reservation.date.strftime("%A, %B %d, %Y"),
        time=reservation.time.strftime("%H:%M"),
        people=reservation.number_of_people,
        table_type=f"Table #{reservation.table_id}",
        address=f"{restaurant.city}, {restaurant.state} {restaurant.zip_code}",
        contact=restaurant.contact if hasattr(restaurant, 'contact') else None
    )

    background_tasks.add_task(
        send_booking_confirmation,
        current_user.email,
        booking_details
    )

    return {"message": "✅ Table booked successfully!", "reservation_id": new_reservation.id}


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
            "comment": r.comment,
            "date": r.created_at.strftime("%Y-%m-%d") if hasattr(r, 'created_at') else None
        }
        for r in reviews
    ]



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
        comment=comment,
        created_at=datetime.now()
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





# ✅ FIXED: Get restaurant details only if approved
@router.get("/{restaurant_id}")
def get_restaurant_details(
    restaurant_id: int,
    db: Session = Depends(get_db)
):
    # Join to also check approval status
    restaurant = (
        db.query(models.Restaurant)
        .join(RestaurantApproval)
        .filter(
            models.Restaurant.id == restaurant_id,
            RestaurantApproval.status == "approved"
        )
        .first()
    )

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found or not approved.")

    return {
        "id": restaurant.id,
        "name": restaurant.name,
        "cuisine": restaurant.cuisine,
        "cost_rating": restaurant.cost_rating,
        "city": restaurant.city,
        "state": restaurant.state,
        "zip_code": restaurant.zip_code,
        "rating": restaurant.rating,
        "contact": restaurant.contact if hasattr(restaurant, 'contact') else None,
        "address": f"{restaurant.city}, {restaurant.state} {restaurant.zip_code}"
    }
from app.db.models import RestaurantApproval  # ✅ Make sure this is imported






# 🕒 Get today's bookings count for a restaurant
@router.get("/{restaurant_id}/bookings/today")
def get_today_bookings_count(
    restaurant_id: int,
    db: Session = Depends(get_db)
):
    # Get today's date
    today = datetime.now().date()
    
    # Query the database for bookings made today for this restaurant
    bookings_count = db.query(models.Reservation).filter(
        models.Reservation.restaurant_id == restaurant_id,
        models.Reservation.date == today
    ).count()
    
    return {"count": bookings_count}



@router.delete("/reservations/{reservation_id}/cancel")
def cancel_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "Customer":
        raise HTTPException(status_code=403, detail="Only customers can cancel bookings.")
    
    reservation = db.query(models.Reservation).filter(
        models.Reservation.id == reservation_id,
        models.Reservation.user_id == current_user.id
    ).first()
    
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found or does not belong to you.")
    
    db.delete(reservation)
    db.commit()
    
    return {"message": "Reservation cancelled successfully."}




