from rest_framework import serializers
from .models import User, Category, Exam, Question, QuestionOption, ExamAttempt, UserAnswer
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "role")
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        role = validated_data.get("role", "student")
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email"),
            password=validated_data["password"],
            role=role
        )
        return user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"

class QuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionOption
        fields = ["id", "text", "is_correct"]

class QuestionSerializer(serializers.ModelSerializer):
    options = QuestionOptionSerializer(many=True)

    class Meta:
        model = Question
        fields = ["id", "text", "correct_option", "options"]

    def create(self, validated_data):
        options_data = validated_data.pop("options")
        question = Question.objects.create(**validated_data)
        for opt in options_data:
            QuestionOption.objects.create(question=question, **opt)
        return question

class ExamSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)

    class Meta:
        model = Exam
        fields = ["id", "title", "description", "category", "duration_minutes", "total_marks", "questions"]

    def create(self, validated_data):
        questions_data = validated_data.pop("questions")
        exam = Exam.objects.create(**validated_data)
        for q_data in questions_data:
            options_data = q_data.pop("options")
            question = Question.objects.create(exam=exam, **q_data)
            for opt in options_data:
                QuestionOption.objects.create(question=question, **opt)
        return exam
    
class ExamAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamAttempt
        fields = "__all__"

class UserAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAnswer
        fields = "__all__"

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(
            username=data.get("username"),
            password=data.get("password")
        )
        if user and user.is_active:
            return user  # <-- Return the actual User instance
        raise serializers.ValidationError("Invalid credentials")
    

