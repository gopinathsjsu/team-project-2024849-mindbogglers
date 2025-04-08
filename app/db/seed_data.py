from app.db.database import engine
from app.db import models
models.Base.metadata.create_all(bind=engine)
from app.db import models, database
from app.auth.auth_handler import hash_password  # ✅ Correct import
from sqlalchemy.orm import Session

def seed_restaurants_tables_reviews():
    db: Session = database.SessionLocal()

    if db.query(models.Restaurant).first():
        print("Restaurants already seeded.")
        return

    # Create sample users with hashed passwords
    customer1 = models.User(
        email="rutujabpatil24@gmail.com",
        hashed_password=hash_password("alice123"),
        full_name="Rutuja",
        role="Customer"
    )
    customer2 = models.User(
        email="bob@example.com",
        hashed_password=hash_password("bob123"),
        full_name="Bob",
        role="Customer"
    )
    db.add_all([customer1, customer2])
    db.flush()

    alice_id = customer1.id
    bob_id = customer2.id

    sample_restaurants = [
        {
            "restaurant": models.Restaurant(
                name="Tandoori Flames",
                cuisine="Indian",
                cost_rating=3,
                city="San Francisco",
                state="CA",
                zip_code="94105",
                rating=4.5,
                total_bookings=12
            ),
            "tables": [
                {"size": 2, "available_times": "18:00,18:30,19:00"},
                {"size": 4, "available_times": "18:00,19:00"}
            ],
            "reviews": [
                {"user_id": alice_id, "rating": 5, "comment": "Fantastic Indian food!"},
                {"user_id": bob_id, "rating": 4, "comment": "Great flavors and service."}
            ]
        },
        {
            "restaurant": models.Restaurant(
                name="Luigi's Trattoria",
                cuisine="Italian",
                cost_rating=4,
                city="San Francisco",
                state="CA",
                zip_code="94107",
                rating=4.2,
                total_bookings=20
            ),
            "tables": [
                {"size": 2, "available_times": "18:00,18:30,19:00"},
                {"size": 6, "available_times": "19:00,20:00"}
            ],
            "reviews": [
                {"user_id": alice_id, "rating": 5, "comment": "Authentic Italian and cozy vibe!"},
                {"user_id": bob_id, "rating": 3, "comment": "Decent food but a bit pricey."}
            ]
        },
        {
            "restaurant": models.Restaurant(
                name="Dragon Garden",
                cuisine="Chinese",
                cost_rating=2,
                city="Oakland",
                state="CA",
                zip_code="94607",
                rating=4.0,
                total_bookings=9
            ),
            "tables": [
                {"size": 2, "available_times": "17:00,18:00"},
                {"size": 4, "available_times": "18:30,19:30"}
            ],
            "reviews": [
                {"user_id": alice_id, "rating": 4, "comment": "Loved the dumplings and soup!"},
                {"user_id": bob_id, "rating": 4, "comment": "Nice place for quick dinner."}
            ]
        },
    ]

    for entry in sample_restaurants:
        restaurant = entry["restaurant"]
        db.add(restaurant)
        db.flush()

        for t in entry["tables"]:
            db.add(models.Table(
                restaurant_id=restaurant.id,
                size=t["size"],
                available_times=t["available_times"]
            ))

        for r in entry["reviews"]:
            db.add(models.Review(
                user_id=r["user_id"],
                restaurant_id=restaurant.id,
                rating=r["rating"],
                comment=r["comment"]
            ))

    db.commit()
    print("✅ Restaurants, tables, and reviews seeded.")
    db.close()

if __name__ == "__main__":
    seed_restaurants_tables_reviews()
