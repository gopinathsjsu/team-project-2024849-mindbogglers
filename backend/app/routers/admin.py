from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.db import models, database
from app.db.model_extensions import RestaurantApproval
from app.auth.auth_dependency import get_current_user

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

# DB session dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Get pending restaurant approvals
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
            "status": approval.status
        }
        for approval in pending_approvals
    ]

# Approve or reject restaurant
@router.put("/restaurants/{approval_id}/status")
def update_approval_status(
    approval_id: int,
    status: str,
    notes: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Only admins can update approval status.")
    
    if status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'.")
    
    approval = db.query(RestaurantApproval).filter(RestaurantApproval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval record not found.")
    
    approval.status = status
    approval.admin_notes = notes
    
    db.commit()
    db.refresh(approval)
    
    return {"message": f"Restaurant {status} successfully"}

# Remove restaurant
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
    
    # Delete associated data first
    db.query(models.Review).filter(models.Review.restaurant_id == restaurant_id).delete()
    db.query(models.Reservation).filter(models.Reservation.restaurant_id == restaurant_id).delete()
    db.query(models.Table).filter(models.Table.restaurant_id == restaurant_id).delete()
    db.query(RestaurantPhoto).filter(RestaurantPhoto.restaurant_id == restaurant_id).delete()
    db.query(RestaurantApproval).filter(RestaurantApproval.restaurant_id == restaurant_id).delete()
    
    # Then delete the restaurant
    db.delete(restaurant)
    db.commit()
    
    return {"message": "Restaurant and all associated data removed successfully"}

# Analytics dashboard
@router.get("/analytics/reservations")
def get_reservation_analytics(
    timeframe: str = "month",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Only admins can access analytics.")
    
    # Calculate date range based on timeframe
    today = datetime.now().date()
    if timeframe == "week":
        start_date = today - timedelta(days=7)
    elif timeframe == "month":
        start_date = today - timedelta(days=30)
    else:
        raise HTTPException(status_code=400, detail="Timeframe must be 'week' or 'month'.")
    
    # Get reservations within the date range
    reservations = db.query(models.Reservation).filter(
        models.Reservation.date >= start_date,
        models.Reservation.date <= today
    ).all()
    
    # Group by restaurant
    restaurant_counts = {}
    for reservation in reservations:
        restaurant_id = reservation.restaurant_id
        if restaurant_id not in restaurant_counts:
            restaurant_counts[restaurant_id] = {
                "restaurant_id": restaurant_id,
                "restaurant_name": reservation.restaurant.name,
                "count": 0
            }
        restaurant_counts[restaurant_id]["count"] += 1
    
    # Convert to list and sort by count
    analytics = list(restaurant_counts.values())
    analytics.sort(key=lambda x: x["count"], reverse=True)
    
    return {
        "timeframe": timeframe,
        "total_reservations": len(reservations),
        "by_restaurant": analytics
    }