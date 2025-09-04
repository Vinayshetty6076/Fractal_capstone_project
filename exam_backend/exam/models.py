from django.db import models
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class UserManager(BaseUserManager):
    def create_user(self, username, email=None, password=None, role="student", **extra_fields):
        if not username:
            raise ValueError("The Username field must be set")
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault("role", "admin")
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(username, email, password, **extra_fields)


class User(AbstractUser):
    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("student", "Student"),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="student")

    groups = models.ManyToManyField(
        "auth.Group",
        related_name="exam_users",
        blank=True
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="exam_users_permissions",
        blank=True
    )

    objects = UserManager()  # ✅ use the custom manager

    def __str__(self):
        return self.username

class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Exam(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    duration_minutes = models.IntegerField()
    total_marks = models.IntegerField()

class Question(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name="questions")
    text = models.TextField()
    correct_option = models.CharField(max_length=255) 

class QuestionOption(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="options")
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

class ExamAttempt(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    submitted_at = models.DateTimeField(auto_now_add=True)

class UserAnswer(models.Model):
    attempt = models.ForeignKey(ExamAttempt, on_delete=models.CASCADE, related_name="answers")
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.ForeignKey(QuestionOption, on_delete=models.CASCADE)
    is_correct = models.BooleanField(default=False)


