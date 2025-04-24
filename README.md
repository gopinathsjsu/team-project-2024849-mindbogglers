# 🍽️ BookTable - Restaurant Reservation System

![BookTable Banner](https://raw.githubusercontent.com/syedanida/BookTable_demo/main/frontend/public/booktable-banner.jpg)

## Project Overview

BookTable is a comprehensive restaurant reservation platform inspired by OpenTable, allowing users to discover, review, and book tables at their favorite restaurants. Our application provides a seamless experience for customers while offering powerful management tools for restaurant owners and administrators.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)

## 🚀 Features

### Customer Features
- **Search Restaurants**: Find restaurants by date, time, party size, and location
- **Real-time Availability**: View available booking times within 30-minute windows
- **Restaurant Details**: Browse cuisines, cost ratings, reviews, and popularity metrics
- **Location Services**: View restaurant locations on Google Maps
- **User Accounts**: Register, login, and manage personal profile
- **Reservations**: Book tables with email/SMS confirmation
- **Booking Management**: View, modify, or cancel existing reservations

### Restaurant Manager Features
- **Listing Management**: Create and update restaurant profiles
- **Property Control**: Manage name, address, hours, and available booking times
- **Content Management**: Add descriptions and photos to showcase the restaurant
- **Reservation Dashboard**: View and manage incoming reservations

### Admin Features
- **Quality Control**: Approve new restaurant listings
- **Moderation Tools**: Remove restaurants that violate platform policies
- **Analytics Dashboard**: Access reservation metrics for business intelligence

## 🛠️ Tech Stack

- **Frontend**: React.js with Material UI components
- **Backend**: FastAPI (Python)
- **Database**: MySQL
- **Deployment**: AWS (EC2 Auto-scaling Cluster with Load Balancer)
- **Authentication**: JWT-based authentication
- **Maps Integration**: Google Maps API
- **Notifications**: Email service and SMS integration

## 🏗️ Architecture

![System Architecture](https://raw.githubusercontent.com/syedanida/BookTable_demo/main/docs/architecture.png)

Our application follows a microservices architecture pattern:

1. **Web Layer**: React.js frontend application
2. **API Layer**: FastAPI backend services
3. **Data Layer**: MySQL database
4. **Infrastructure**: AWS cloud deployment with auto-scaling

## 📋 Installation & Setup

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- MySQL
- AWS CLI (for deployment)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/gopinathsjsu/team-project-2024849-mindbogglers.git
   cd team-project-2024849-mindbogglers

2. **Frontend Setup**
    ```bash
    cd frontend
    npm install
    npm start

3. **Backend Setup**
    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt
    python app.py

4. **Database Setup**
    ```bash
    # Configure your MySQL database
    mysql -u root -p
    CREATE DATABASE booktable;
    # Run the migration scripts in backend/database/migrations

## 🚀 Deployment

Our application is deployed on AWS with the following components:
- EC2 instances in an auto-scaling group
- Elastic Load Balancer for traffic distribution
- RDS for MySQL database hosting
- S3 for static content storage
- CloudFront for content delivery

Deployment instructions are available in the [deployment guide](docs/deployment.md).

## 📊 Project Management

We follow Agile methodologies with Scrum practices:
- Weekly sprint planning and retrospectives
- Task tracking via GitHub Projects
- XP Core Values: Communication and Feedback

## 📝 API Documentation

API documentation is available via Swagger UI at `/docs` when running the backend.

Key API endpoints:
- `/api/restaurants` - Restaurant management
- `/api/bookings` - Reservation management
- `/api/users` - User authentication and profile management
- `/api/admin` - Administrative operations

## 👥 Team MindBogglers

Our team is composed of passionate developers committed to creating an exceptional restaurant reservation experience:

- **Frontend Development**: [@team-member-1](https://github.com/team-member-1)
- **Backend Development**: [@team-member-2](https://github.com/team-member-2)
- **Database Design**: [@team-member-3](https://github.com/team-member-3)
- **DevOps & Deployment**: [@team-member-4](https://github.com/team-member-4)

## 📸 Screenshots

### Customer Interface
![Search Restaurants](https://raw.githubusercontent.com/syedanida/BookTable_demo/main/docs/screenshots/search.png)
*Users can search for restaurants based on various criteria*

![Restaurant Details](https://raw.githubusercontent.com/syedanida/BookTable_demo/main/docs/screenshots/details.png)
*Detailed view of restaurant information with booking options*

### Management Interface
![Restaurant Dashboard](https://raw.githubusercontent.com/syedanida/BookTable_demo/main/docs/screenshots/dashboard.png)
*Restaurant managers can view and manage their bookings*

### Admin Interface
![Admin Analytics](https://raw.githubusercontent.com/syedanida/BookTable_demo/main/docs/screenshots/analytics.png)
*Administrators can view platform usage analytics*


## 🔗 Additional Resources

- [UI Wireframes](docs/wireframes.md)
- [API Documentation](docs/api.md)
- [Database Schema](docs/schema.md)
- [Deployment Guide](docs/deployment.md)
- [Project Journal](docs/journal.md)

