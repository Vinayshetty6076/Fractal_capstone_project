# Fractal Capstone Project – Online Exam Portal

This is a **full-stack Online Exam Portal** built with **Django (backend)** and **React (frontend)**.  
The project supports **authentication, exams, and analytics** with modern UI.

---

## 🚀 Project Setup

### 📌 Backend (Django + MySQL)

1. **Create & Activate Virtual Environment**

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
Install Backend Dependencies

bash
Copy code
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers mysqlclient transformers
Database Setup (MySQL Example)
Update your settings.py:

python
Copy code
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'exam_db',
        'USER': 'root',
        'PASSWORD': 'yourpassword',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
Apply Migrations

bash
Copy code
python manage.py makemigrations
python manage.py migrate
Run Backend Server

bash
Copy code
python manage.py runserver
📌 Frontend (React + Vite + Material UI)
Go to frontend folder

bash
Copy code
cd exam-frontend
Install Frontend Dependencies

bash
Copy code
npm install
npm install @mui/material @emotion/react @emotion/styled highcharts
Start Frontend

bash
Copy code
npm run dev
