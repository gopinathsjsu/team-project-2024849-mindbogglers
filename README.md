# 🍽️ BookTable - Restaurant Reservation System

<div align="center">
  <img src="https://github.com/gopinathsjsu/team-project-2024849-mindbogglers/blob/main/frontend/public/Restaurant%20image.jpg" alt="BookTable Banner" width="100%">
</div>
Image source: expedia.com

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
    uvicorn app.main:app --reload    #To run backend server

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

1. Syeda Nida Khader
2. Rutuja Patil
3. Aishly Manglani
4. Harshavardhan Reddy Gadila

## Areas of Contribution for each team member:
### Syeda Nida Khader:

User Interface: Designed the interfaces for customer, manager and admin.

Maps Integration: Integrated the Google Maps API to enable location-based restaurant discovery

Backend Architecture: Spearheaded the development of the FastAPI (Python) backend services

Error Handling: Created robust validation and error handling for all API inputs

### Aishly Manglani:

Frontend Development: Led the development of the React.js frontend with Material UI components

Database Design: Designed and implemented the MySQL database schema

Error Handling: Created robust validation and error handling for all API inputs

### Rutuja Patil:

Backend Architecture: Spearheaded the development of the FastAPI (Python) backend services

API Development: Created RESTful API endpoints for restaurant management, bookings, and user authentication

Authentication System: Implemented the JWT-based authentication system

### Harshavardhan:

DevOps & Deployment: Configured the AWS infrastructure (EC2, Load Balancer, RDS)

Project journal, UI wireframes, Diagrams: Prepared the scrum documentations.

## 🔗 Resources

- Project Board_(https://docs.google.com/spreadsheets/d/1ONBP3ygoERc7HbGaNyZAmJ2vxt5ty9sNkG0XhjNRnag/edit?gid=0#gid=0)
  
- [Project Journal](docs/journal.md)

  
## 📸 Screenshots

### Customer Interface
![Search Restaurants](https://github.com/gopinathsjsu/team-project-2024849-mindbogglers/blob/main/UI%20Screenshot/SearchRestaurant.png)
*Users can search for restaurants based on various criteria*

![Restaurant Details](https://raw.githubusercontent.com/syedanida/BookTable_demo/main/docs/screenshots/details.png)
*Detailed view of restaurant information with booking options*

### Management Interface
![Restaurant Dashboard](https://raw.githubusercontent.com/syedanida/BookTable_demo/main/docs/screenshots/dashboard.png)
*Restaurant managers can view and manage their bookings*

### Admin Interface
![Admin Analytics](https://raw.githubusercontent.com/syedanida/BookTable_demo/main/docs/screenshots/analytics.png)
*Administrators can view platform usage analytics*




