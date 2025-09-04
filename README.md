# Fractal Capstone Project – Online Exam Portal

This is a **full-stack Online Exam Portal** built with **Django (backend)** and **React (frontend)**.  
The project supports **authentication, exams, and analytics** with modern UI.

---

## 🚀 One-Click Setup (Copy-Paste Commands)

Open terminal and copy-paste the following commands step by step.

```bash
# 1. Go to project folder
cd C:\Users\User\Desktop\Online_exam_portal_capstone

# 2. Create & activate Python virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# 3. Install backend dependencies
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers mysqlclient transformers

# 4. Setup MySQL database (update exam_backend/settings.py)
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': 'exam_db',
#         'USER': 'root',
#         'PASSWORD': 'yourpassword',
#         'HOST': 'localhost',
#         'PORT': '3306',
#     }
# }

# 5. Apply Django migrations
python manage.py makemigrations
python manage.py migrate

# 6. Run Django backend server
python manage.py runserver

# -------------------------------
# Frontend Setup (React + Vite + Material UI)
# -------------------------------

# 7. Go to frontend folder
cd exam-frontend

# 8. Install frontend dependencies (copy-paste ready)
npm install
npm install @mui/material @emotion/react @emotion/styled highcharts

# 9. Run React frontend
npm run dev

# -------------------------------
# Notes
# -------------------------------
# - Backend runs on http://127.0.0.1:8000
# - Frontend runs on http://localhost:5173 (default Vite port)
# - Make sure settings.py or .env has correct DB credentials
# - Virtual environment and node_modules are ignored in .gitignore
