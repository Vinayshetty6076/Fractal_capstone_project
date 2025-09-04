from django.contrib import admin
from .models import User, Category, Exam, Question, QuestionOption, ExamAttempt, UserAnswer

# ---------- User Admin ----------
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_active")
    search_fields = ("username", "email")

# ---------- Category Admin ----------
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)

# ---------- Exam Admin ----------
@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "category", "duration_minutes", "total_marks")
    list_filter = ("category",)
    search_fields = ("title",)

# ---------- Question Admin ----------
@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("id", "exam", "text", "correct_option")
    list_filter = ("exam",)
    search_fields = ("text",)

# ---------- Question Option Admin ----------
@admin.register(QuestionOption)
class QuestionOptionAdmin(admin.ModelAdmin):
    list_display = ("id", "question", "text", "is_correct")
    list_filter = ("question", "is_correct")
    search_fields = ("text",)

# ---------- ExamAttempt Admin ----------
@admin.register(ExamAttempt)
class ExamAttemptAdmin(admin.ModelAdmin):
    list_display = ("id", "exam", "student", "score", "submitted_at")
    list_filter = ("exam", "submitted_at")
    search_fields = ("student__username",)

# ---------- UserAnswer Admin ----------
@admin.register(UserAnswer)
class UserAnswerAdmin(admin.ModelAdmin):
    list_display = ("id", "attempt", "question", "selected_option", "is_correct")
    list_filter = ("is_correct",)
    search_fields = ("question__text", "selected_option__text")
