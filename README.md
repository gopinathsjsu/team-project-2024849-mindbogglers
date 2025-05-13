# 🍽️ BookTable - Restaurant Reservation System

![Home Page](https://github.com/gopinathsjsu/team-project-2024849-mindbogglers/blob/main/UI%20Screenshot/Homepage_1.png)
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
### Syeda Nida Khader

Syedanida led multiple critical components of the frontend and backend integration. She developed the Login and Booking interfaces, built the user dashboard to view and cancel reservations, and implemented email/SMS confirmation logic. She also contributed to the restaurant search page and played a major role in frontend deployment and initial system planning.

###  Rutuja Patil

Rutuja focused heavily on backend architecture, implementing core FastAPI services for reservations, authentication, and restaurant availability. She also integrated Google Maps for address resolution and protected APIs using JWT-based role access control. She contributed significantly to the Manager and Admin modules and supported database and deployment setup.

###  Aishly Manglani

Aishly was responsible for developing the Admin module, designing the database schema, and building secure login/signup APIs. She integrated role-based access control and collaborated on the booking search and confirmation systems. Aishly also led testing and validation efforts, and worked on backend deployment and documentation finalization.

###  Harshavardhan

Harsha built key UI modules including the Manager Dashboard and Signup page. He finalized the frontend landing page, styled key components, and handled EC2 backend deployment and AWS configuration. He also prepared the UI wireframes, architecture diagrams, and project journal.

## 🔗 Resources

- [Project Board](documents/Sprint_Sheet.xlsx)
  
- [Project Journal](documents/Project_Journal.pdf)
- [XPvalues.pdf](documents/XPvalues.pdf)

  
## 📸 Screenshots

### Home Page

![Home Page](https://github.com/gopinathsjsu/team-project-2024849-mindbogglers/blob/main/UI%20Screenshot/HomePage_2.png)

### Customer Interface
![Search Restaurants](https://github.com/gopinathsjsu/team-project-2024849-mindbogglers/blob/main/UI%20Screenshot/SearchRestaurant.png)
*Users can search for restaurants based on various criteria*

![Restaurant Details](https://github.com/gopinathsjsu/team-project-2024849-mindbogglers/blob/main/UI%20Screenshot/available_restaurant.png)
*Detailed view of restaurant information with booking options*

### Manage Interface
![Restaurant Dashboard](https://github.com/gopinathsjsu/team-project-2024849-mindbogglers/blob/main/UI%20Screenshot/manager_dashboard.png)
*Restaurant managers can view and manage their bookings*

### Admin Interface
![Admin Analytics](https://github.com/gopinathsjsu/team-project-2024849-mindbogglers/blob/main/UI%20Screenshot/admin_dashboard_approve_Remove.png)
*Administrators can view platform usage analytics*




