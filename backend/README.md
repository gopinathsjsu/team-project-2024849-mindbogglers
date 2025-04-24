# BookTable Backend

This is the backend service for the BookTable application, built with FastAPI.

---

### 🚀 How to Run This Backend Locally

Follow these steps to run the FastAPI backend on your own system:

---

#### 📁 1. Clone the Repository

```bash
git clone https://github.com/syedanida/BookTable_demo.git
cd BookTable_demo/backend
```

---

#### 🐍 2. Create & Activate Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate it
# For Windows
venv\Scripts\activate

# For Mac/Linux
source venv/bin/activate
```

---

#### 📦 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

#### ⚙️ 4. Set Up Environment Variables

Create a `.env` file in the `backend` directory with the following content:

```
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_password
EMAIL_HOST=smtp.yourprovider.com
EMAIL_PORT=587
```

Update values as per your email/SMS setup.

---

#### 🗄️ 5. Run the Server

```bash
uvicorn app.main:app --reload
```

Your FastAPI app will run at:  
📍 `http://127.0.0.1:8000`

You can test APIs at:  
🔗 `http://127.0.0.1:8000/docs`
