from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from collections import Counter

from app.db import models, database
from app.db.models import RestaurantApproval
from app.auth.auth_dependency import get_current_user
from app.models_api.admin import ApprovalUpdateRequest

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/restaurants/pending")
def get_pending_approvals(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Only admins can access this endpoint.")

    pending_approvals = db.query(RestaurantApproval).filter(
        RestaurantApproval.status == "pending"
    ).all()

    return [
        {
            "approval_id": approval.id,
            "restaurant_id": approval.restaurant_id,
            "restaurant_name": approval.restaurant.name,
            "status": approval.status,
            "city": approval.restaurant.city if approval.restaurant else None,
            "state": approval.restaurant.state if approval.restaurant else None,
            "zip_code": approval.restaurant.zip_code if approval.restaurant else None,
            "cuisine": approval.restaurant.cuisine if approval.restaurant else None,
            "cost_rating": approval.restaurant.cost_rating if approval.restaurant else None
        }
        for approval in pending_approvals
    ]

@router.put("/restaurants/{approval_id}/status")
def update_approval_status(
    approval_id: int,
    update: ApprovalUpdateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Only admins can update approval status.")

    approval = db.query(RestaurantApproval).filter(RestaurantApproval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval record not found.")

    if approval.status != "pending":
        raise HTTPException(status_code=400, detail=f"This restaurant has already been {approval.status}.")

    approval.status = update.status.value
    approval.admin_notes = update.notes
    db.commit()
    db.refresh(approval)

    return {"message": f"Restaurant {update.status.value} successfully"}

@router.delete("/restaurants/{restaurant_id}")
def remove_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Only admins can remove restaurants.")

    restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found.")

    db.query(models.Review).filter(models.Review.restaurant_id == restaurant_id).delete()
    db.query(models.Reservation).filter(models.Reservation.restaurant_id == restaurant_id).delete()
    db.query(models.Table).filter(models.Table.restaurant_id == restaurant_id).delete()
    db.query(RestaurantApproval).filter(RestaurantApproval.restaurant_id == restaurant_id).delete()

    db.delete(restaurant)
    db.commit()

    return {"message": f"Restaurant {restaurant_id} and all associated data removed successfully"}

@router.get("/analytics/reservations")
def get_reservation_analytics(
    timeframe: str = "month",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Only admins can access analytics.")
    
    today = datetime.now().date()
    if timeframe == "week":
        start_date = today - timedelta(days=7)
    elif timeframe == "month":
        start_date = today - timedelta(days=30)
    else:
        raise HTTPException(status_code=400, detail="Timeframe must be 'week' or 'month'.")

    reservations = db.query(models.Reservation).filter(
        models.Reservation.date >= start_date,
        models.Reservation.date <= today
    ).all()

    total_reservations = len(reservations)

    # Daily trend
    daily_counter = Counter(str(r.date) for r in reservations)
    daily_trend = [{"date": date, "count": count} for date, count in sorted(daily_counter.items())]

    # Hourly chart
    hourly_counter = Counter(r.time.strftime("%H:%M") for r in reservations)
    hourly_distribution = [{"label": hour, "count": count} for hour, count in sorted(hourly_counter.items())]

    # Top 5 restaurants by reservation count
    restaurant_counter = Counter(r.restaurant.name for r in reservations)
    top_restaurants = restaurant_counter.most_common(5)
    restaurant_distribution = [{"restaurant": name, "count": count} for name, count in top_restaurants]

    return {
        "timeframe": timeframe,
        "start_date": str(start_date),
        "end_date": str(today),
        "total_reservations": total_reservations,
        "cancelled_reservations": 0,  # Placeholder for future support
        "daily_trend": daily_trend,
        "hourly_distribution": hourly_distribution,
        "restaurant_distribution": restaurant_distribution
    }
