from rest_framework import generics, permissions
from django.db.models import Avg, Count, Sum
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from .models import Category, Exam, Question, QuestionOption, ExamAttempt, UserAnswer, User
from .serializers import (
    RegisterSerializer, LoginSerializer, CategorySerializer,
    ExamSerializer, QuestionSerializer, QuestionOptionSerializer,
    ExamAttemptSerializer, UserAnswerSerializer
)
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Exam
from transformers import pipeline
import tensorflow as tf

User = get_user_model() 

# Register
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny] 

# class LoginView(APIView):
#     def post(self, request):
#         serializer = LoginSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         user = serializer.validated_data 
#         refresh = RefreshToken.for_user(user)
#         return Response({
#             "refresh": str(refresh),
#             "access": str(refresh.access_token),
#             "user": {
#                 "id": user.id,
#                 "username": user.username,
#                 "email": user.email,
#                 "role": user.role
#             }
#         })

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
            }
        })



# Category APIs
class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class CategoryRetrieveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class CategoryRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]

class CategoryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]

# Exams by Category
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def exams_by_category(request, category_id):
    try:
        exams = Exam.objects.filter(category_id=category_id)
        serializer = ExamSerializer(exams, many=True)
        return Response(serializer.data)
    except Category.DoesNotExist:
        return Response({"error": "Category not found"}, status=404)

# Exam APIs
class ExamListCreateView(generics.ListCreateAPIView):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [permissions.IsAuthenticated]

class ExamRetrieveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [permissions.IsAuthenticated]

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_exam(request, exam_id):
    user = request.user
    answers = request.data.get("answers", {})

    try:
        exam = Exam.objects.get(id=exam_id)
    except Exam.DoesNotExist:
        return Response({"error": "Exam not found"}, status=404)

    total_questions = exam.questions.count()
    correct_count = 0

    attempt = ExamAttempt.objects.create(exam=exam, student=user)

    for q_id, selected_text in answers.items():
        try:
            question = Question.objects.get(id=q_id)
            selected_option = QuestionOption.objects.get(question=question, text=selected_text)
            is_correct = selected_option.is_correct
            if is_correct:
                correct_count += 1

            UserAnswer.objects.create(
                attempt=attempt,
                question=question,
                selected_option=selected_option,
                is_correct=is_correct
            )
        except Exception as e:
            continue

    score = int((correct_count / total_questions) * exam.total_marks)
    passed = score >= (exam.total_marks / 2)  # pass if >= 50%

    return Response({
        "score": score,
        "total": exam.total_marks,
        "correct": correct_count,
        "pass": passed
    })


# Question APIs
class QuestionListCreateView(generics.ListCreateAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

class QuestionRetrieveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

# ExamAttempt APIs
class ExamAttemptListCreateView(generics.ListCreateAPIView):
    queryset = ExamAttempt.objects.all()
    serializer_class = ExamAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]


# UserAnswer APIs
class UserAnswerListCreateView(generics.ListCreateAPIView):
    queryset = UserAnswer.objects.all()
    serializer_class = UserAnswerSerializer
    permission_classes = [permissions.IsAuthenticated]


# Hugging Face pipeline
qa_generator = pipeline("text-generation", model="gpt2", framework="pt")

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_questions(request, exam_id):
    try:
        exam = Exam.objects.get(id=exam_id)
        num_questions = int(request.data.get("num_questions", 20))

        prompt = (
            f"Generate {num_questions} multiple choice questions for the exam: {exam.title}. "
            "Each question must have 4 options labeled A, B, C, D. Clearly mark the correct answer."
        )

        output = qa_generator(
            prompt,
            max_length=600,
            num_return_sequences=1
        )[0]["generated_text"]

        questions_data = []
        lines = [line.strip() for line in output.split("\n") if line.strip()]
        q_text, options, correct = None, [], None

        for line in lines:
            if line[0].isdigit() and "." in line: 
                if q_text and options:
                    questions_data.append({
                        "text": q_text,
                        "options": options,
                        "correct": correct or options[0]
                    })
                q_text = line.split(".", 1)[1].strip()
                options, correct = [], None

            elif line[0] in ["A", "B", "C", "D"] and ")" in line:  
                option_text = line.split(")", 1)[-1].strip()
                options.append(option_text)

            elif "Answer:" in line or "Correct:" in line:
                correct = line.split(":")[-1].strip()

        # Add the last question
        if q_text and options:
            questions_data.append({
                "text": q_text,
                "options": options,
                "correct": correct or options[0]
            })

        # ---- Store into DB ----
        saved_questions = []
        for q in questions_data[:num_questions]:
            question = Question.objects.create(
                exam=exam,
                text=q["text"],
                correct_option=q["correct"]
            )
            for opt_text in q["options"]:
                QuestionOption.objects.create(
                    question=question,
                    text=opt_text,
                    is_correct=(opt_text == q["correct"])
                )
            saved_questions.append({
                "id": question.id,
                "text": question.text,
                "options": q["options"],
                "correct": q["correct"]
            })

        return Response({
            "exam": exam.title,
            "generated_questions": saved_questions
        })

    except Exam.DoesNotExist:
        return Response({"error": "Exam not found"}, status=404)
    
# student list cat
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_categories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

# list for exams in a category
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_exams(request, category_id):
    exams = Exam.objects.filter(category_id=category_id)
    serializer = ExamSerializer(exams, many=True)
    return Response(serializer.data)

# eustion for an exam
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_exam_questions(request, exam_id):
    questions = Question.objects.filter(exam_id=exam_id)
    data = []
    for q in questions:
        options = q.options.all()
        data.append({
            "id": q.id,
            "text": q.text,
            "options": [{"id": o.id, "text": o.text} for o in options]
        })
    return Response(data)

# Submit exam
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_exam(request, exam_id):
    user = request.user
    answers_data = request.data.get("answers", {})  
    try:
        exam = Exam.objects.get(id=exam_id)
    except Exam.DoesNotExist:
        return Response({"error": "Exam not found"}, status=404)

    attempt = ExamAttempt.objects.create(exam=exam, student=user)

    score = 0
    for q_id, selected_option_id in answers_data.items():
        try:
            question = Question.objects.get(id=q_id, exam=exam)
            option = QuestionOption.objects.get(id=selected_option_id, question=question)
            is_correct = option.is_correct
            if is_correct:
                score += 1
            UserAnswer.objects.create(
                attempt=attempt,
                question=question,
                selected_option=option,
                is_correct=is_correct
            )
        except (Question.DoesNotExist, QuestionOption.DoesNotExist):
            continue

    attempt.score = score
    attempt.save()
    serializer = ExamAttemptSerializer(attempt)
    return Response(serializer.data)

#Check exam score
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def check_score(request, exam_id):
    user = request.user
    try:
        attempt = ExamAttempt.objects.get(exam_id=exam_id, student=user)
        answers = UserAnswer.objects.filter(attempt=attempt)
        answers_serializer = UserAnswerSerializer(answers, many=True)
        return Response({
            "attempt": ExamAttemptSerializer(attempt).data,
            "answers": answers_serializer.data
        })
    except ExamAttempt.DoesNotExist:
        return Response({"error": "No submission found"}, status=404)
    
@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_exam_stats(request):
    # Total exams
    total_exams = Exam.objects.count()
    
    # Total attempts
    total_attempts = ExamAttempt.objects.count()
    
    # Average score per exam
    avg_score_per_exam = (
        ExamAttempt.objects.values("exam__title")
        .annotate(avg_score=Avg("score"))
        .order_by("exam__title")
    )
    
    # Leaderboard (top 10 students)
    leaderboard = (
        User.objects.filter(role="student")
        .annotate(total_score=Sum("examattempt__score"), total_attempts=Count("examattempt"))
        .order_by("-total_score")[:10]
    )

    # Serialize for response
    leaderboard_data = [
        {
            "username": u.username,
            "total_score": u.total_score or 0,
            "total_attempts": u.total_attempts
        } for u in leaderboard
    ]

    return Response({
        "total_exams": total_exams,
        "total_attempts": total_attempts,
        "avg_score_per_exam": list(avg_score_per_exam),
        "leaderboard": leaderboard_data
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_attempts_per_category(request):
    user = request.user

    # Aggregate attempts per category for this student
    attempts = (
        ExamAttempt.objects.filter(student=user)
        .values('exam__category__id', 'exam__category__name')
        .annotate(count=Count('id'))
    )

    # Return in a clean format
    data = [
        {
            "category_id": a["exam__category__id"],
            "category_name": a["exam__category__name"],
            "count": a["count"]
        }
        for a in attempts
    ]

    return Response(data)


# Student Leaderboard - Top 10 students
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_leaderboard(request):
    leaderboard = (
        User.objects.filter(role="student")
        .annotate(
            total_score=Sum("examattempt__score"),
            total_attempts=Count("examattempt")
        )
        .order_by("-total_score")[:5]
    )

    data = [
        {
            "student": u.username,
            "score": u.total_score or 0,
            "attempts": u.total_attempts
        }
        for u in leaderboard
    ]
    return Response(data)