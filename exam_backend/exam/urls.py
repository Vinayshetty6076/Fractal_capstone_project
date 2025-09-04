from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from rest_framework.permissions import AllowAny
from .views import admin_exam_stats
from . import views
from .views import (
    RegisterView, LoginView,
    CategoryListCreateView, CategoryRetrieveUpdateDestroyView,
    ExamListCreateView, ExamRetrieveUpdateDeleteView,
    QuestionListCreateView, QuestionRetrieveUpdateDeleteView,
    ExamAttemptListCreateView, UserAnswerListCreateView,
    generate_questions, exams_by_category, submit_exam, get_exam_questions, check_score,
    student_attempts_per_category
)

urlpatterns = [
    # Auth
    path("register/", RegisterView.as_view(permission_classes=[AllowAny])),
    path("login/", LoginView.as_view(permission_classes=[AllowAny])),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),

    # Categories
    path("categories/", CategoryListCreateView.as_view(), name="categories-list"),
    path("categories/<int:pk>/", CategoryRetrieveUpdateDestroyView.as_view(), name="category-detail"),
    path("categories/<int:category_id>/exams/", exams_by_category, name="exams-by-category"),

    # Exams
    path("exams/", ExamListCreateView.as_view(), name="exams-list"),
    path("exams/<int:pk>/", ExamRetrieveUpdateDeleteView.as_view(), name="exams-detail"),
    path("exams/<int:exam_id>/questions/", get_exam_questions, name="exam-questions"),
    path("exams/<int:exam_id>/generate-questions/", generate_questions, name="generate-questions"),
    path("exams/<int:exam_id>/submit/", submit_exam, name="submit-exam"),
    path("exams/<int:exam_id>/score/", check_score, name="exam-score"),
    path("attempts-per-category/", student_attempts_per_category, name="attempts-per-category"),


    # Questions
    path("questions/", QuestionListCreateView.as_view(), name="questions-list"),
    path("questions/<int:pk>/", QuestionRetrieveUpdateDeleteView.as_view(), name="questions-detail"),

    # Attempts & Answers
    path("attempts/", ExamAttemptListCreateView.as_view(), name="attempts-list"),
    path("answers/", UserAnswerListCreateView.as_view(), name="answers-list"),

    # Admin
    path("admin/exam-stats/", admin_exam_stats, name="admin-exam-stats"),
    path("leaderboard/", views.student_leaderboard, name="student-leaderboard"),
]
