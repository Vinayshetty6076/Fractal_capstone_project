# -------------------------------
# Fractal Capstone Project Setup
# -------------------------------

# 1. Go to project folder
cd C:\Users\User\Desktop\Online_exam_portal_capstone

# 2. Create & activate Python virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# 3. Install backend dependencies
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers mysqlclient transformers

# 4. Setup MySQL database (update in exam_backend/settings.py)
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

# 7. Open new terminal or stop backend temporarily, go to frontend folder
cd exam-frontend

# 8. Install frontend dependencies
npm install
npm install @mui/material @emotion/react @emotion/styled highcharts

# 9. Run React frontend
npm run dev

# -------------------------------
# Notes
# -------------------------------
# - Backend runs on http://127.0.0.1:8000
# - Frontend runs on http://localhost:5173 (default Vite port)
# - Make sure .env or settings.py has correct DB credentials
# - Virtual environment and node_modules are ignored in .gitignore
