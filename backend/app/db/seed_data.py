# ✅ Full updated seed_data.py with 5+ Restaurants per City (completed)

from app.db.database import engine
from app.db import models
models.Base.metadata.create_all(bind=engine)
from app.db import models, database
from app.auth.auth_handler import hash_password
from sqlalchemy.orm import Session

def seed_restaurants_tables_reviews():
    db: Session = database.SessionLocal()

    if db.query(models.Restaurant).first():
        print("Restaurants already seeded.")
        return

    # ✅ Create Customers and Admins
    customer1 = models.User(
        email="alice@gmail.com",
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
    admin1 = models.User(
        email="aishly@example.com",
        hashed_password=hash_password("admin123"),
        full_name="Aishly Manglani",
        role="Admin"
    )
    admin2 = models.User(
        email="harsha@example.com",
        hashed_password=hash_password("admin123"),
        full_name="Harshavardhan Reddy",
        role="Admin"
    )

    # ✅ Create 5 Restaurant Managers (1 per city)
    manager_sf = models.User(
        email="manager_sf@example.com",
        hashed_password=hash_password("manager123"),
        full_name="Manager SF",
        role="RestaurantManager"
    )
    manager_oak = models.User(
        email="manager_oak@example.com",
        hashed_password=hash_password("manager123"),
        full_name="Manager Oakland",
        role="RestaurantManager"
    )
    manager_sj = models.User(
        email="manager_sj@example.com",
        hashed_password=hash_password("manager123"),
        full_name="Manager San Jose",
        role="RestaurantManager"
    )
    manager_berk = models.User(
        email="manager_berk@example.com",
        hashed_password=hash_password("manager123"),
        full_name="Manager Berkeley",
        role="RestaurantManager"
    )
    manager_pa = models.User(
        email="manager_pa@example.com",
        hashed_password=hash_password("manager123"),
        full_name="Manager Palo Alto",
        role="RestaurantManager"
    )

    # ✅ Add all users
    db.add_all([customer1, customer2, admin1, admin2,
                manager_sf, manager_oak, manager_sj, manager_berk, manager_pa])
    db.flush()

    alice_id = customer1.id
    bob_id = customer2.id

    # ✅ Map cities to managers
    city_manager_map = {
        "San Francisco": manager_sf.id,
        "Oakland": manager_oak.id,
        "San Jose": manager_sj.id,
        "Berkeley": manager_berk.id,
        "Palo Alto": manager_pa.id
    }

    sample_restaurants = [
        # --- San Francisco Restaurants ---
        {"restaurant": models.Restaurant(name="Tandoori Flames", cuisine="Indian", cost_rating=3, city="San Francisco", state="CA", zip_code="94105", rating=4.5, total_bookings=12), "tables": [{"size": 2, "available_times": "18:00,18:30,19:00"}, {"size": 4, "available_times": "18:00,19:00"}], "reviews": [{"user_id": alice_id, "rating": 5, "comment": "Fantastic Indian food!"}, {"user_id": bob_id, "rating": 4, "comment": "Great flavors and service."}]},
        {"restaurant": models.Restaurant(name="Wayfare Tavern", cuisine="American", cost_rating=4, city="San Francisco", state="CA", zip_code="94111", rating=4.3, total_bookings=15), "tables": [{"size": 2, "available_times": "17:00,18:00,19:00"}], "reviews": [{"user_id": alice_id, "rating": 5, "comment": "Amazing burgers!"}]},
        {"restaurant": models.Restaurant(name="Kin Khao", cuisine="Thai", cost_rating=3, city="San Francisco", state="CA", zip_code="94102", rating=4.0, total_bookings=10), "tables": [{"size": 4, "available_times": "18:30,19:30"}], "reviews": [{"user_id": bob_id, "rating": 4, "comment": "Delicious Pad Thai!"}]},
        {"restaurant": models.Restaurant(name="Burma Superstar", cuisine="Burmese", cost_rating=2, city="San Francisco", state="CA", zip_code="94118", rating=4.6, total_bookings=8), "tables": [{"size": 6, "available_times": "18:00,19:00,20:00"}], "reviews": [{"user_id": alice_id, "rating": 5, "comment": "Incredible flavors!"}]},
        {"restaurant": models.Restaurant(name="House of Prime Rib", cuisine="Steakhouse", cost_rating=5, city="San Francisco", state="CA", zip_code="94109", rating=4.7, total_bookings=22), "tables": [{"size": 2, "available_times": "18:00,19:00"}], "reviews": [{"user_id": bob_id, "rating": 5, "comment": "Best prime rib!"}]},

        # --- Oakland Restaurants ---
        {"restaurant": models.Restaurant(name="Dragon Garden", cuisine="Chinese", cost_rating=2, city="Oakland", state="CA", zip_code="94607", rating=4.0, total_bookings=9), "tables": [{"size": 2, "available_times": "17:00,18:00"}], "reviews": [{"user_id": alice_id, "rating": 4, "comment": "Loved the dumplings!"}]},
        {"restaurant": models.Restaurant(name="Millennium", cuisine="Vegan", cost_rating=4, city="Oakland", state="CA", zip_code="94609", rating=4.5, total_bookings=7), "tables": [{"size": 4, "available_times": "19:00,20:00"}], "reviews": [{"user_id": bob_id, "rating": 4, "comment": "Excellent vegan options!"}]},
        {"restaurant": models.Restaurant(name="Shan Dong", cuisine="Chinese", cost_rating=2, city="Oakland", state="CA", zip_code="94612", rating=4.2, total_bookings=5), "tables": [{"size": 2, "available_times": "17:30,19:00"}], "reviews": [{"user_id": alice_id, "rating": 5, "comment": "Authentic Chinese noodles!"}]},
        {"restaurant": models.Restaurant(name="Homeroom", cuisine="American", cost_rating=2, city="Oakland", state="CA", zip_code="94609", rating=4.1, total_bookings=4), "tables": [{"size": 4, "available_times": "18:00,19:00"}], "reviews": [{"user_id": bob_id, "rating": 4, "comment": "Mac and cheese heaven!"}]},
        {"restaurant": models.Restaurant(name="Shakewell", cuisine="Mediterranean", cost_rating=3, city="Oakland", state="CA", zip_code="94610", rating=4.4, total_bookings=6), "tables": [{"size": 2, "available_times": "18:30,19:30"}], "reviews": [{"user_id": alice_id, "rating": 4, "comment": "Fun Mediterranean dishes!"}]},

        # --- San Jose Restaurants ---
        {"restaurant": models.Restaurant(name="Back A Yard", cuisine="Caribbean", cost_rating=3, city="San Jose", state="CA", zip_code="95112", rating=4.5, total_bookings=10), "tables": [{"size": 2, "available_times": "18:00,19:00"}], "reviews": [{"user_id": alice_id, "rating": 5, "comment": "Authentic Caribbean!"}]},
        {"restaurant": models.Restaurant(name="La Foret", cuisine="French", cost_rating=5, city="San Jose", state="CA", zip_code="95120", rating=4.6, total_bookings=12), "tables": [{"size": 4, "available_times": "17:30,19:30"}], "reviews": [{"user_id": bob_id, "rating": 5, "comment": "Beautiful French dining!"}]},
        {"restaurant": models.Restaurant(name="Original Joe's", cuisine="Italian", cost_rating=3, city="San Jose", state="CA", zip_code="95113", rating=4.3, total_bookings=9), "tables": [{"size": 2, "available_times": "18:30,19:30"}], "reviews": [{"user_id": alice_id, "rating": 4, "comment": "Classic Italian spot!"}]},
        {"restaurant": models.Restaurant(name="Bill's Cafe", cuisine="American", cost_rating=2, city="San Jose", state="CA", zip_code="95125", rating=4.0, total_bookings=7), "tables": [{"size": 2, "available_times": "17:00,18:30"}], "reviews": [{"user_id": bob_id, "rating": 4, "comment": "Great breakfast!"}]},
        {"restaurant": models.Restaurant(name="Pho Kim Long", cuisine="Vietnamese", cost_rating=2, city="San Jose", state="CA", zip_code="95112", rating=4.2, total_bookings=8), "tables": [{"size": 4, "available_times": "18:00,20:00"}], "reviews": [{"user_id": alice_id, "rating": 5, "comment": "Best Pho ever!"}]},

        # --- Berkeley Restaurants ---
        {"restaurant": models.Restaurant(name="Chez Panisse", cuisine="French", cost_rating=5, city="Berkeley", state="CA", zip_code="94704", rating=4.7, total_bookings=13), "tables": [{"size": 2, "available_times": "18:00,19:00"}], "reviews": [{"user_id": alice_id, "rating": 5, "comment": "Elegant French!"}]},
        {"restaurant": models.Restaurant(name="Ippuku", cuisine="Japanese", cost_rating=4, city="Berkeley", state="CA", zip_code="94704", rating=4.3, total_bookings=11), "tables": [{"size": 2, "available_times": "17:30,19:30"}], "reviews": [{"user_id": bob_id, "rating": 4, "comment": "Authentic Izakaya!"}]},
        {"restaurant": models.Restaurant(name="Jupiter", cuisine="Pizza", cost_rating=3, city="Berkeley", state="CA", zip_code="94704", rating=4.2, total_bookings=7), "tables": [{"size": 4, "available_times": "18:00,20:00"}], "reviews": [{"user_id": alice_id, "rating": 5, "comment": "Great beers & pizza!"}]},
        {"restaurant": models.Restaurant(name="Comal", cuisine="Mexican", cost_rating=3, city="Berkeley", state="CA", zip_code="94704", rating=4.5, total_bookings=9), "tables": [{"size": 2, "available_times": "18:00,19:30"}], "reviews": [{"user_id": bob_id, "rating": 4, "comment": "Best tacos!"}]},
        {"restaurant": models.Restaurant(name="Eureka!", cuisine="American", cost_rating=3, city="Berkeley", state="CA", zip_code="94704", rating=4.4, total_bookings=8), "tables": [{"size": 2, "available_times": "17:00,18:00"}], "reviews": [{"user_id": alice_id, "rating": 5, "comment": "Amazing burgers!"}]},

        # --- Palo Alto Restaurants ---
        {"restaurant": models.Restaurant(name="Tamarine", cuisine="Vietnamese", cost_rating=4, city="Palo Alto", state="CA", zip_code="94301", rating=4.6, total_bookings=10), "tables": [{"size": 2, "available_times": "18:00,19:30"}], "reviews": [{"user_id": bob_id, "rating": 5, "comment": "Upscale Vietnamese!"}]},
        {"restaurant": models.Restaurant(name="Oren's Hummus", cuisine="Mediterranean", cost_rating=3, city="Palo Alto", state="CA", zip_code="94301", rating=4.5, total_bookings=9), "tables": [{"size": 2, "available_times": "17:30,18:30"}], "reviews": [{"user_id": alice_id, "rating": 5, "comment": "Best hummus ever!"}]},
        {"restaurant": models.Restaurant(name="Fuki Sushi", cuisine="Japanese", cost_rating=4, city="Palo Alto", state="CA", zip_code="94306", rating=4.2, total_bookings=7), "tables": [{"size": 4, "available_times": "18:00,19:00"}], "reviews": [{"user_id": bob_id, "rating": 4, "comment": "Fresh sushi!"}]},
        {"restaurant": models.Restaurant(name="Evvia Estiatorio", cuisine="Greek", cost_rating=4, city="Palo Alto", state="CA", zip_code="94301", rating=4.7, total_bookings=11), "tables": [{"size": 2, "available_times": "18:00,19:00"}], "reviews": [{"user_id": alice_id, "rating": 5, "comment": "Amazing Greek food!"}]},
        {"restaurant": models.Restaurant(name="Il Fornaio", cuisine="Italian", cost_rating=4, city="Palo Alto", state="CA", zip_code="94301", rating=4.4, total_bookings=8), "tables": [{"size": 2, "available_times": "17:00,18:30"}], "reviews": [{"user_id": bob_id, "rating": 5, "comment": "Great pasta!"}]},
    ]

    for entry in sample_restaurants:
        restaurant = entry["restaurant"]
        restaurant.manager_id = city_manager_map[restaurant.city]

        db.add(restaurant)
        db.flush()

        db.add(models.RestaurantApproval(
            restaurant_id=restaurant.id,
            status="pending"
        ))

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
    print("✅ Restaurants, tables, reviews, and approvals seeded with city-specific managers.")
    db.close()

if __name__ == "__main__":
    seed_restaurants_tables_reviews()
