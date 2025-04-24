from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional, List
from app.db import models, database
from app.db.model_extensions import RestaurantPhoto
from app.auth.auth_dependency import get_current_user
from app.models_api.restaurant import RestaurantUpdate, TableCreate, TableUpdate

router = APIRouter(
    prefix="/manager",
    tags=["RestaurantManager"]
)

# DB session dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Update restaurant details
@router.put("/restaurants/{restaurant_id}")
def update_restaurant(
    restaurant_id: int,
    restaurant_data: RestaurantUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "RestaurantManager":
        raise HTTPException(status_code=403, detail="Only restaurant managers can update restaurants.")
    
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found.")
    
    # Update fields
    for field, value in restaurant_data.dict(exclude_unset=True).items():
        setattr(restaurant, field, value)
    
    db.commit()
    db.refresh(restaurant)
    
    return {"message": "Restaurant updated successfully"}

# Add a table to restaurant
@router.post("/restaurants/{restaurant_id}/tables")
def add_table(
    restaurant_id: int,
    table_data: TableCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "RestaurantManager":
        raise HTTPException(status_code=403, detail="Only restaurant managers can add tables.")
    
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
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

# Update table details
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
    
    # Check if this manager owns the restaurant
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == table.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found.")
    
    # Update fields
    if table_data.size:
        table.size = table_data.size
    if table_data.available_times:
        table.available_times = ",".join(table_data.available_times)
    
    db.commit()
    db.refresh(table)
    
    return {"message": "Table updated successfully"}

# Upload restaurant photo
@router.post("/restaurants/{restaurant_id}/photos")
def upload_photo(
    restaurant_id: int,
    description: Optional[str] = None,
    photo_url: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "RestaurantManager":
        raise HTTPException(status_code=403, detail="Only restaurant managers can upload photos.")
    
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found.")
    
    new_photo = RestaurantPhoto(
        restaurant_id=restaurant_id,
        photo_url=photo_url,
        description=description
    )
    
    db.add(new_photo)
    db.commit()
    db.refresh(new_photo)
    
    return {"message": "Photo uploaded successfully", "photo_id": new_photo.id}