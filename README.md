# Fractal Capstone Project – Online Exam Portal

This is a **full-stack Online Exam Portal** built with **Django (backend)** and **React (frontend)**.  
The project supports **authentication, exams, and analytics** with modern UI.

---

## 🚀 Project Setup

### 📌 Backend (Django + MySQL)

1. **Create & Activate Virtual Environment**
   ```bash
   Windows
   python -m venv venv
   venv\Scripts\activate

2. Install Dependencies

   pip install django djangorestframework djangorestframework-simplejwt django-cors-headers mysqlclient transformers

   - django → Main framework

   - djangorestframework → API support

   - djangorestframework-simplejwt → JWT authentication

   - django-cors-headers → CORS for frontend communication

   - mysqlclient → MySQL database connector

   - transformers + gpt2 → AI/NLP model support

3. Database Setup (MySQL Example) (optional) if you want mysql workbench

   settings.py: update in django file

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


4.  Apply Migrations

     python manage.py makemigrations
   
     python manage.py migrate

5.  Run Server

     python manage.py runserver

📌 Frontend (React + Vite + Material UI)



 

   


  
