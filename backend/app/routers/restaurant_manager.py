from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional, List
import os

from app.db import models, database
from app.db.models import Restaurant, RestaurantApproval
from app.db.models import RestaurantPhoto
from app.auth.auth_dependency import get_current_user
from app.models_api.restaurant import RestaurantCreate, RestaurantUpdate, TableCreate, TableUpdate

router = APIRouter(
    prefix="/manager",
    tags=["RestaurantManager"]
)

# Dependency to get DB session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -----------------------------------------------
# ✅ Get All Restaurants Managed by the User
# -----------------------------------------------
@router.get("/my-restaurants")
def view_my_restaurants(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "RestaurantManager":
        raise HTTPException(status_code=403, detail="Only restaurant managers can view their restaurants.")
    
    restaurants = db.query(Restaurant).filter(Restaurant.manager_id == current_user.id).all()
    results = []
    for r in restaurants:
        approval = db.query(RestaurantApproval).filter(RestaurantApproval.restaurant_id == r.id).first()
        results.append({
            "id": r.id,
            "name": r.name,
            "cuisine": r.cuisine,
            "city": r.city,
            "status": approval.status if approval else "unknown"
        })

    return results

# -----------------------------------------------
# ✅ Create a New Restaurant Listing
# -----------------------------------------------
@router.post("/restaurants")
def create_restaurant(
    restaurant_data: RestaurantCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "RestaurantManager":
        raise HTTPException(status_code=403, detail="Only restaurant managers can add new listings.")

    new_restaurant = Restaurant(
        name=restaurant_data.name,
        address=restaurant_data.address,
        city=restaurant_data.city,
        state=restaurant_data.state,
        zip_code=restaurant_data.zip_code,
        contact_email=restaurant_data.contact_email,
        contact_phone=restaurant_data.contact_phone,
        cuisine=restaurant_data.cuisine,
        cost_rating=restaurant_data.cost_rating,
        description=restaurant_data.description,
        hours_open=restaurant_data.hours_open,
        hours_close=restaurant_data.hours_close,
        manager_id=current_user.id
    )
    db.add(new_restaurant)
    db.commit()
    db.refresh(new_restaurant)

    approval = RestaurantApproval(
        restaurant_id=new_restaurant.id,
        status="pending"
    )
    db.add(approval)
    db.commit()

    return {
        "message": "Restaurant submitted for approval",
        "restaurant_id": new_restaurant.id
    }

# -----------------------------------------------
# ✅ Update an Existing Restaurant
# -----------------------------------------------
@router.put("/restaurants/{restaurant_id}")
def update_restaurant(
    restaurant_id: int,
    restaurant_data: RestaurantUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "RestaurantManager":
        raise HTTPException(status_code=403, detail="Only restaurant managers can update restaurants.")

    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found.")

    for field, value in restaurant_data.dict(exclude_unset=True).items():
        setattr(restaurant, field, value)

    db.commit()
    db.refresh(restaurant)

    return {"message": "Restaurant updated successfully"}

# -----------------------------------------------
# ✅ Upload Restaurant Photo
# -----------------------------------------------
@router.post("/restaurants/{restaurant_id}/photos")
def upload_photo(
    restaurant_id: int,
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "RestaurantManager":
        raise HTTPException(status_code=403, detail="Only restaurant managers can upload photos.")

    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found.")

    upload_dir = os.path.join("static", "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    safe_filename = file.filename.replace(" ", "_")
    filename = f"{restaurant_id}_{safe_filename}"
    file_path = os.path.join(upload_dir, filename)

    with open(file_path, "wb") as f:
        f.write(file.file.read())

    photo_url = f"/static/uploads/{filename}"

    new_photo = RestaurantPhoto(
        restaurant_id=restaurant_id,
        photo_url=photo_url,
        description=description
    )
    db.add(new_photo)
    db.commit()
    db.refresh(new_photo)

    return JSONResponse(content={
        "message": "Photo uploaded successfully ✅",
        "photo_url": photo_url
    })

# -----------------------------------------------
# ✅ Add Table
# -----------------------------------------------
@router.post("/restaurants/{restaurant_id}/tables")
def add_table(
    restaurant_id: int,
    table_data: TableCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "RestaurantManager":
        raise HTTPException(status_code=403, detail="Only restaurant managers can add tables.")

    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found.")

    new_table = models.Table(
        restaurant_id=restaurant_id,
        size=table_data.size,
        available_times=",".join(table_data.available_times)
    )

    db.add(new_table)
    db.commit()
    db.refresh(new_table)

    return {"message": "Table added successfully", "table_id": new_table.id}

# -----------------------------------------------
# ✅ Update Table
# -----------------------------------------------
@router.put("/tables/{table_id}")
def update_table(
    table_id: int,
    table_data: TableUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "RestaurantManager":
        raise HTTPException(status_code=403, detail="Only restaurant managers can update tables.")

    table = db.query(models.Table).filter(models.Table.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found.")

    restaurant = db.query(Restaurant).filter(Restaurant.id == table.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found.")

    if table_data.size:
        table.size = table_data.size
    if table_data.available_times:
        table.available_times = ",".join(table_data.available_times)

    db.commit()
    db.refresh(table)

    return {"message": "Table updated successfully"}
