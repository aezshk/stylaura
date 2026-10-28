from fileinput import filename
from urllib import error, request
from django.http import JsonResponse
from django.shortcuts import render, redirect
import base64
import cv2
import numpy as np
from django.shortcuts import render
import razorpay

from main.forms import FaceUploadForm



# ---------- LOGIN ----------
import random
import time

def login_view(request):
    if request.method == "POST":
        mobile = request.POST.get("mobile")

        # Generate 6-digit OTP
        otp = random.randint(100000, 999999)

        # Save in session
        request.session["mobile"] = mobile
        request.session["otp"] = str(otp)
        request.session["otp_time"] = time.time()
        request.session["otp_attempts"] = 0

        print("Generated OTP:", otp)  # For development only

        return redirect("otp")

    return render(request, "auth/login.html")



# ---------- OTP ----------
import time
from django.shortcuts import render, redirect
def otp_view(request):
    error = None

    if request.method == "POST":

        entered_otp = request.POST.get("otp")
        saved_otp = request.session.get("otp")
        otp_time = request.session.get("otp_time")
        attempts = request.session.get("otp_attempts", 0)

        if not otp_time:
            error = "Session expired. Please request OTP again."

        elif time.time() - otp_time > 120:
            error = "OTP expired. Please resend."

        elif attempts >= 3:
            error = "Too many attempts. Please resend OTP."

        elif entered_otp == saved_otp:
            request.session["force_login_popup"] = True
            return redirect("profile")

        else:
            request.session["otp_attempts"] = attempts + 1
            error = "Invalid OTP"

    return render(request, 'auth/otp.html', {
        "error": error
    })


def resend_otp(request):
    otp = random.randint(100000, 999999)

    request.session["otp"] = str(otp)
    request.session["otp_time"] = time.time()
    request.session["otp_attempts"] = 0

    print("Resent OTP:", otp)

    return redirect("otp")


# ---------- PROFILE ----------
from django.contrib.auth.decorators import login_required

def profile_view(request):

    show_login = True   # FORCE TRUE for testing

    if request.method == "POST":
        request.session["name"] = request.POST.get("name")
        request.session["gender"] = request.POST.get("gender")
        request.session["age"] = request.POST.get("age")

        return redirect("dashboard")

    return render(request, "auth/profile.html", {
        "show_login": show_login
    })
# ---------- DASHBOARD ----------
def dashboard_view(request):
    name = request.session.get("name", "User")
    gender = request.session.get("gender")
    age = int(request.session.get("age", 0))

    # BASIC AUTO ANALYSIS (can be upgraded later)
    if gender == "female":
        skin_analysis = ["Acne tendency", "Oily skin"]
        hair_analysis = ["Hair fall", "Dry ends"]
        colour_analysis = ["Ivory", "Rose Gold", "Soft Peach"]
    else:
        skin_analysis = ["Oily skin", "Open pores"]
        hair_analysis = ["Hair fall", "Dandruff risk"]
        colour_analysis = ["Navy Blue", "Olive Green", "Beige"]

    return render(
        request,
        "main/dashboard.html",
        {
            "name": name,
            "skin_analysis": skin_analysis,
            "hair_analysis": hair_analysis,
            "colour_analysis": colour_analysis,
        }
    )

# ---------- HAIR ANALYSIS PAGE ----------
def hair_view(request):
    return render(request, "main/hair.html")


# ---------- COLOUR PAGE ----------
def colour_view(request):
    return render(request, "main/colour.html")

# ---------- SPLASH PAGE ----------

def splash_view(request):
    return render(request, "main/splash.html")


def skin_view(request):

    skin_problems = [
        "Acne",
        "Oily skin",
        "Pigmentation",
        "Dry skin",
        "Dark spots",
        "Sensitive skin"
    ]

    if request.method == "POST":

        selected = request.POST.getlist("skin")
        request.session["skin_selected"] = selected

        result = {}
        image_url = None

        # ================= HANDLE CAMERA IMAGE =================
        if request.POST.get("captured_image"):
            image_data = request.POST.get("captured_image")
            format, imgstr = image_data.split(";base64,")
            img_bytes = base64.b64decode(imgstr)
            img = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(img, cv2.IMREAD_COLOR)

        # ================= HANDLE FILE UPLOAD =================
        elif "image" in request.FILES:
            img_file = request.FILES["image"]
            img = np.frombuffer(img_file.read(), np.uint8)
            img = cv2.imdecode(img, cv2.IMREAD_COLOR)

        else:
            return redirect("skin")

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )

        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        if len(faces) > 0:
            x, y, w, h = faces[0]
            face = img[y:y+h, x:x+w]

            # -------- REDNESS --------
            red_channel = face[:, :, 2]
            red_mask = red_channel > 160
            red_percentage = int((np.sum(red_mask) / red_mask.size) * 100)

            # -------- DARK SPOTS --------
            gray_face = gray[y:y+h, x:x+w]
            dark_mask = gray_face < 70
            dark_percentage = int((np.sum(dark_mask) / dark_mask.size) * 100)

            # -------- TEXTURE --------
            raw_texture = np.var(gray_face)

# Normalize texture to percentage (0–100)
            texture_score = min(int((raw_texture / 2000) * 100), 100)

            # -------- DRAW CIRCLES --------
            contours, _ = cv2.findContours(
                red_mask.astype(np.uint8),
                cv2.RETR_EXTERNAL,
                cv2.CHAIN_APPROX_SIMPLE
            )

            for cnt in contours:
                if cv2.contourArea(cnt) > 50:
                    (cx, cy), radius = cv2.minEnclosingCircle(cnt)
                    center = (int(cx)+x, int(cy)+y)
                    cv2.circle(img, center, int(radius), (0, 0, 255), 2)

            result = {
                "redness": red_percentage,
                "dark_spots": dark_percentage,
                "texture": texture_score,
            }

            cv2.imwrite("media/skin_report.jpg", img)
            image_url = "/media/skin_report.jpg"

        else:
            result["error"] = "No face detected"

        # SAVE TO SESSION
        request.session["ai_result"] = result
        request.session["ai_image"] = image_url

        return redirect("skin_result")

    return render(request, "main/skin.html", {
        "skin_problems": skin_problems
    })


def skin_result_view(request):
    print(request.session.get("ai_result"))
    print(request.session.get("ai_image"))
    selected = request.session.get("skin_selected", [])
    result = request.session.get("ai_result")
    image_url = request.session.get("ai_image")

    recommendations = []

    if "Acne" in selected:
        recommendations.append("Use salicylic acid cleanser")
    if "Oily skin" in selected:
        recommendations.append("Use oil-free moisturizer")
    if "Pigmentation" in selected:
        recommendations.append("Use vitamin C serum")

    return render(request, "main/skin_result.html", {
        "selected": selected,
        "recommendations": recommendations,
        "result": result,
        "image_url": image_url
    })


import os
import base64
import cv2
import numpy as np
from django.conf import settings
from django.shortcuts import render, redirect


def skin_ai_view(request):

    if request.method == "POST":

        img = None

        # CAMERA IMAGE
        if request.POST.get("captured_image"):

            image_data = request.POST.get("captured_image")
            format, imgstr = image_data.split(";base64,")

            img_bytes = base64.b64decode(imgstr)

            img = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(img, cv2.IMREAD_COLOR)

        # UPLOADED IMAGE
        elif request.FILES.get("image"):

            img_file = request.FILES["image"]

            img = np.frombuffer(img_file.read(), np.uint8)
            img = cv2.imdecode(img, cv2.IMREAD_COLOR)

        # NO IMAGE
        if img is None:
            return redirect("skin")

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # FACE DETECTION
        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )

        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        if len(faces) == 0:

            request.session["ai_result"] = {
                "error": "No face detected"
            }

            return redirect("skin_result")

        # FACE CROP
        x, y, w, h = faces[0]

        face = img[y:y+h, x:x+w]

        # REDNESS
        red_channel = face[:, :, 2]
        green_channel = face[:, :, 1]

        red_mask = (
            (red_channel > 140) &
            (red_channel > green_channel + 15)
        )

        redness = int(
            (np.sum(red_mask) / red_mask.size) * 100
        )

        # TEXTURE
        gray_face = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)

        raw_texture = np.var(gray_face)

        texture = int(
            (raw_texture / 1500) * 100
        )

        # DARK SPOTS
        dark_mask = gray_face < 80

        dark_spots = int(
            (np.sum(dark_mask) / dark_mask.size) * 100
        )

        # SKIN TYPE
        if redness > 50:
            skin_type = "sensitive"

        elif texture > 50:
            skin_type = "dry"

        elif dark_spots > 50:
            skin_type = "combination"

        else:
            skin_type = "normal"

        # CONCERNS
        concerns_list = []

        if redness > 40:
            concerns_list.append("Redness")

        if texture > 40:
            concerns_list.append("Rough Texture")

        if dark_spots > 40:
            concerns_list.append("Pigmentation")

        concerns = ", ".join(concerns_list)

        if not concerns:
            concerns = "Healthy Skin"

        # SAVE DB
        SkinProfile.objects.create(
            user=request.user if request.user.is_authenticated else None,
            redness=redness,
            texture=texture,
            dark_spots=dark_spots,
            skin_type=skin_type,
            concerns=concerns
        )

        # SESSION
        request.session["ai_result"] = {
            "redness": redness,
            "texture": texture,
            "dark_spots": dark_spots,
            "skin_type": skin_type,
            "concerns": concerns
        }

        return redirect("skin_result")

    return render(request, "main/skin.html")

import os
import base64
import cv2
import numpy as np
from django.conf import settings
from django.shortcuts import render, redirect



import os
import uuid
import base64
import cv2
import numpy as np
from django.conf import settings
from django.shortcuts import render, redirect


import base64
import uuid
import os
import cv2
import numpy as np
from django.conf import settings
from django.shortcuts import render, redirect


# ✅ DANDRUFF LABEL FUNCTION

def get_scalp_label(value):
    if value < 10:
        return "Low visibility"
    elif value < 30:
        return "Moderate visibility"
    else:
        return "High visibility"
    
def get_dandruff_label(value):
    if value is None:
        return "Not detected"
    if value < 10:
        return "No visible dandruff"
    elif value < 30:
        return "Mild dandruff"
    elif value < 60:
        return "Moderate dandruff"
    else:
        return "Heavy dandruff"


def hair_ai_view(request):

    if request.method == "POST":

        img = None

        # ===== CAMERA INPUT =====
        if request.POST.get("captured_image"):
            image_data = request.POST.get("captured_image")

            if image_data:
                format, imgstr = image_data.split(";base64,")
                img_bytes = base64.b64decode(imgstr)
                img_array = np.frombuffer(img_bytes, np.uint8)
                img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

        # ===== FILE UPLOAD =====
        elif request.FILES.get("image"):
            img_file = request.FILES["image"]
            img_array = np.frombuffer(img_file.read(), np.uint8)
            img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

        # ❌ NO IMAGE RECEIVED
        if img is None:
            return render(request, "main/hair.html", {
                "error": "No image received"
            })

        # ===== SAVE USER INPUT =====
        hair_type = request.POST.get("hair_type")
        concerns = request.POST.getlist("concerns")

        request.session["hair_type"] = hair_type
        request.session["hair_concerns"] = concerns

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # ===== FACE DETECTION (BLOCK WRONG IMAGES) =====
        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )

        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        if len(faces) > 0:
            return render(request, "main/hair.html", {
                "error": "Face detected. Upload hair/scalp only."
            })

        # ===== HAIR DENSITY =====
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

        lower_hair = np.array([0, 0, 0])
        upper_hair = np.array([180, 80, 120])

        hair_mask = cv2.inRange(hsv, lower_hair, upper_hair)

        density = int((np.sum(hair_mask > 0) / hair_mask.size) * 100)
        density = min(density, 100)

        # ===== TEXTURE =====
        texture = int(np.var(gray) / 100)
        texture = min(texture, 100)

        # ===== DANDRUFF DETECTION (brightness-based) =====
        white_pixels = np.sum(gray > 200)
        dandruff_visibility = int((white_pixels / gray.size) * 100)
        dandruff_visibility = min(dandruff_visibility, 100)
        
        light_pixels = np.sum((gray > 150) & (gray < 220))
        scalp_visibility = int((light_pixels / gray.size) * 100)
        scalp_visibility = min(scalp_visibility, 100)

        # ✅ LABEL
        dandruff_label = get_dandruff_label(dandruff_visibility)
        scalp_label = get_scalp_label(scalp_visibility)

        # ===== RESULT OBJECT =====
        result = {
            "density": density,
            "texture": texture,
            "dandruff_visibility": dandruff_visibility,
            "dandruff_label": dandruff_label,
            "scalp_visibility": scalp_visibility,
            "scalp_label": scalp_label,
        }

        # ===== SAVE IMAGE =====
        filename = f"hair_{uuid.uuid4().hex}.jpg"
        path = os.path.join(settings.MEDIA_ROOT, filename)

        cv2.imwrite(path, img)

        # ===== SAVE SESSION =====
    request.session["hair_result"] = result
    request.session["hair_image"] = settings.MEDIA_URL + filename

    hair_type = request.POST.get("hair_type")

    concerns = request.POST.getlist("concerns")

    HairProfile.objects.create(
user=request.user if request.user.is_authenticated else None,
hair_type=hair_type,
concerns=", ".join(concerns)
)

       

    return redirect("hair_report")

    # ✅ GET REQUEST
    return render(request, "main/hair.html")

def hair_report_view(request):
    result = request.session.get("hair_result")  # ✅ FIXED
    image_url = request.session.get("hair_image")

    return render(request, "main/hair_report.html", {
        "result": result,
        "image_url": image_url
    })

import os
import uuid

from django.shortcuts import render, redirect
from .models import ColourProfile

import cv2
import numpy as np
import base64


# =========================
# COLOUR ANALYSIS VIEW
# =========================

def colour_view(request):

    if request.method == "POST":

        img = None

        # =========================
        # CAMERA IMAGE
        # =========================
        if request.POST.get("captured_image"):

            image_data = request.POST.get("captured_image")

            format, imgstr = image_data.split(";base64,")

            img_bytes = base64.b64decode(imgstr)

            img_array = np.frombuffer(
                img_bytes,
                np.uint8
            )

            img = cv2.imdecode(
                img_array,
                cv2.IMREAD_COLOR
            )

        # =========================
        # UPLOADED IMAGE
        # =========================
        elif "image" in request.FILES:

            img_file = request.FILES["image"]

            img_array = np.frombuffer(
                img_file.read(),
                np.uint8
            )

            img = cv2.imdecode(
                img_array,
                cv2.IMREAD_COLOR
            )

        # =========================
        # AI ANALYSIS
        # =========================
        if img is not None:

            # Convert to LAB colour space
            lab = cv2.cvtColor(
                img,
                cv2.COLOR_BGR2LAB
            )

            # Center region only
            h, w, _ = lab.shape

            center = lab[
                h//3:h//2,
                w//3:w//2
            ]

            # Split LAB channels
            L, A, B = cv2.split(center)

            avg_A = np.mean(A)

            print("A channel:", avg_A)

            # =========================
            # UNDERTONE DETECTION
            # =========================
            if avg_A > 140:

                undertone = "Warm Undertone"

                palette = [
                    "Peach",
                    "Coral",
                    "Gold",
                    "Olive"
                ]

            elif avg_A < 130:

                undertone = "Cool Undertone"

                palette = [
                    "Lavender",
                    "Rose",
                    "Silver",
                    "Navy"
                ]

            else:

                undertone = "Neutral Undertone"

                palette = [
                    "Beige",
                    "Soft Pink",
                    "Teal",
                    "Plum"
                ]

            # =========================
            # SAVE SESSION
            # =========================
            request.session["colour_result"] = {
                "undertone": undertone,
                "palette": palette
            }

            # =========================
            # SAVE DATABASE
            # =========================
            colour = ColourProfile.objects.create(
                user=request.user if request.user.is_authenticated else None,
                undertone=undertone
            )

            print("COLOUR SAVED:", colour.id)

            # =========================
            # REDIRECT RESULT
            # =========================
            return redirect("colour_result")

    return render(
        request,
        "main/colour.html"
    )


# =========================
# COLOUR RESULT VIEW
# =========================

def colour_result_view(request):

    data = request.session.get("colour_result")

    if not data:
        return redirect("colour")

    return render(
        request,
        "main/colour_result.html",
        {
            "undertone": data.get("undertone"),
            "palette": data.get("palette")
        }
    )



from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from .models import Order, OrderItem, Product, SkinProfile, HairProfile

from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from .models import UserProfile, SkinProfile, HairProfile, ColourProfile

from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from .models import UserProfile, SkinProfile, HairProfile, ColourProfile


from django.contrib.auth.models import User
from .models import Order, SkinProfile, HairProfile, ColourProfile
@login_required
def admin_dashboard(request):

    # 🔒 Only admin allowed
    if not request.user.is_superuser:
        return redirect('dashboard')

    context = {
        "total_users": User.objects.count(),
        "total_skin": SkinProfile.objects.count(),
        "total_hair": HairProfile.objects.count(),
        "total_colour": ColourProfile.objects.count(),

        # ✅ USE ORDERS INSTEAD
        "recent_orders": Order.objects.order_by("-id")[:5],
    }

    return render(request, "auth/admin_dashboard.html", context)


from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect

from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect

def login2_view(request):

    next_url = request.GET.get('next')

    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)

            if next_url:
                return redirect(next_url)

            if user.is_superuser:
                return redirect('admin_dashboard')

            return redirect('dashboard')

    return render(request, 'auth/login2.html')

from django.contrib.auth import logout


def logout_view(request):
    logout(request)
    return redirect("/")



from django.core.paginator import Paginator
from django.db.models import Q
from django.contrib.auth.models import User
from django.core.paginator import Paginator
from django.db.models import Q
from django.shortcuts import render, redirect


@login_required
def manage_users(request):

    if not request.user.is_superuser:
        return redirect('dashboard')

    query = request.GET.get('q')

    users = User.objects.all().order_by('-id')

    # 🔍 SEARCH
    if query:
        users = users.filter(
            Q(username__icontains=query) |
            Q(email__icontains=query)
        )

    # 📄 PAGINATION
    paginator = Paginator(users, 5)

    page_number = request.GET.get('page')

    page_obj = paginator.get_page(page_number)

    context = {
        'page_obj': page_obj,
        'query': query
    }

    return render(
        request,
        'auth/manage_users.html',
        context
    )

@login_required
def manage_skin(request):
    if not request.user.is_superuser:
        return redirect('dashboard')

    skins = SkinProfile.objects.all()
    return render(request, 'auth/manage_skin.html', {'skins': skins})


@login_required
def manage_hair(request):
    if not request.user.is_superuser:
        return redirect('dashboard')

    hairs = HairProfile.objects.all()
    return render(request, 'auth/manage_hair.html', {'hairs': hairs})


@login_required
def manage_colour(request):

    colours = ColourProfile.objects.all().order_by("-id")

    return render(
        request,
        "auth/manage_colour.html",
        {
            "colours": colours
        }
    )

from django.shortcuts import get_object_or_404

@login_required
def delete_user(request, user_id):

    if not request.user.is_superuser:
        return redirect('dashboard')

    user = get_object_or_404(UserProfile, id=user_id)
    user.delete()

    return redirect('manage_users')

@login_required
def toggle_admin(request, user_id):

    if not request.user.is_superuser:
        return redirect('dashboard')

    user = get_object_or_404(UserProfile, id=user_id)

    # Toggle admin status
    user.is_admin = not user.is_admin
    user.save()

    return redirect('manage_users')

@login_required
def edit_user(request, user_id):

    if not request.user.is_superuser:
        return redirect('dashboard')

    user = get_object_or_404(UserProfile, id=user_id)

    if request.method == "POST":
        user.name = request.POST.get('name')
        user.mobile = request.POST.get('mobile')
        user.gender = request.POST.get('gender')
        user.age = request.POST.get('age')
        user.save()
        return redirect('manage_users')

    return render(request, 'auth/edit_user.html', {'user': user})


from django.contrib.auth.models import User
from django.contrib import messages

from django.contrib.auth.models import User
from django.contrib import messages
from django.shortcuts import render, redirect
from .models import UserProfile


def signup(request):

    if request.method == "POST":

        username = request.POST.get("username")
        password = request.POST.get("password")
        confirm = request.POST.get("confirm_password")

        mobile = request.POST.get("mobile")
        age = request.POST.get("age")
        gender = request.POST.get("gender")

        # ❌ validation
        if password != confirm:
            messages.error(request, "Passwords do not match")
            return redirect("otp")

        if User.objects.filter(username=username).exists():
            messages.error(request, "Username already exists")
            return redirect("otp")

        # ✅ create user
        user = User.objects.create_user(username=username, password=password)

        # ✅ create profile (IMPORTANT)
        UserProfile.objects.create(
            user=user,
            mobile=mobile,
            age=age,
            gender=gender
        )

        messages.success(request, "Account created successfully")

        return redirect("login2")

    return render(request, "auth/signup.html")
    
    


from django.shortcuts import render

from django.shortcuts import render
from django.contrib.auth.decorators import login_required


@login_required
def recommended_products(request):
    if not request.user.is_authenticated:
        request.session["next"] = request.path
        return redirect(f"/login2/?next={request.path}")

    result = request.session.get("ai_result", {})

    conditions = []

    if result.get("texture", 0) > 40:
        conditions.append("acne")

    if result.get("dark_spots", 0) > 25:
        conditions.append("pigmentation")

    if result.get("redness", 0) > 30:
        conditions.append("sensitive")

    def build_routine():
        am = ["cleanser", "niacinamide", "moisturizer", "sunscreen"]
        pm = ["cleanser", "moisturizer"]

        if "acne" in conditions:
            pm.insert(1, "salicylic acid")

        if "pigmentation" in conditions:
            am.insert(1, "vitamin c")
            pm.insert(1, "alpha arbutin")

        if "sensitive" in conditions:
            pm.insert(1, "soothing serum")

        return am, pm

    routines = {}

    for tier in ["budget", "medium", "luxury"]:

        am, pm = build_routine()

        am_products = Product.objects.filter(
            tier=tier,
            category__in=am,
            product_type="skin"   # 🔥 VERY IMPORTANT
        )

        pm_products = Product.objects.filter(
            tier=tier,
            category__in=pm,
            product_type="skin"   # 🔥 VERY IMPORTANT
        )

        routines[tier] = {
            "am": am,
            "pm": pm,
            "am_products": am_products,
            "pm_products": pm_products
        }
        # 👇 ADD BEFORE RETURN
        top_product = Product.objects.filter(
        product_type="skin",
        description__icontains="acne"
        ).order_by("-rating").first()
        

    return render(request, "main/products.html", {
        "routines": routines,
        "top_product": top_product
    })

from django.contrib.auth.models import User
from django.shortcuts import render, redirect

def register_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        # check if user exists
        if User.objects.filter(username=username).exists():
            return render(request, "auth/register.html", {
                "error": "Username already exists"
            })

        # create user
        User.objects.create_user(username=username, password=password)
        password = request.POST.get("password")
        confirm_password = request.POST.get("confirm_password")

        if password != confirm_password:
             return render(request, "auth/register.html", {
        "error": "Passwords do not match"
    })

        return redirect('/login2/')

    return render(request, "auth/register.html")
    
    
from .models import Product, Cart
from django.shortcuts import get_object_or_404

@login_required(login_url='/login2/')
def add_to_cart(request, product_id):

    product = get_object_or_404(Product, id=product_id)

    cart_item, created = Cart.objects.get_or_create(
        user=request.user,
        product=product
    )

    if not created:
        cart_item.quantity += 1
        cart_item.save()

    return redirect('cart')

def increase_quantity(request, id):
    item = Cart.objects.get(id=id)
    item.quantity += 1
    item.save()
    return redirect('cart')


def decrease_quantity(request, id):
    item = Cart.objects.get(id=id)

    if item.quantity > 1:
        item.quantity -= 1
        item.save()
    else:
        item.delete()

    return redirect('cart')
from django.contrib.auth.decorators import login_required
@login_required(login_url='/login2/')

def cart(request):
    cart_items = Cart.objects.all()

    total = 0
    for item in cart_items:
        total += item.product.price * item.quantity

    return render(request, "main/cart.html", {
        "cart_items": cart_items,
        "total": total
    })

@login_required(login_url='/login2/')
def remove_from_cart(request, product_id):

    item = Cart.objects.filter(user=request.user, product_id=product_id)

    item.delete()

    return redirect('cart')

@login_required
def delete_product(request, id):

    product = Product.objects.get(id=id)
    product.delete()

    return redirect("manage_products")
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import Product


# 🧾 SHOW ALL PRODUCTS
@login_required
def manage_products(request):

    products = Product.objects.all()

    return render(request, "auth/manage_products.html", {
        "products": products
    })


# ➕ ADD PRODUCT
from django.shortcuts import render, redirect
from .models import Product
from django.contrib.auth.decorators import login_required


@login_required
def add_product(request):

    if not request.user.is_superuser:
        return redirect("dashboard")

    if request.method == "POST":
        name = request.POST.get("name")
        category = request.POST.get("category")
        tier = request.POST.get("tier")
        price = request.POST.get("price")
        description = request.POST.get("description")
        image = request.FILES.get("image")

        Product.objects.create(
            name=name,
            category=category,
            tier=tier,
            price=price,
            description=description,
            image=image
        )

        return redirect("admin_dashboard")


    return render(request, "auth/add_product.html")


@login_required
def delete_product(request, id):

    if not request.user.is_superuser:
        return redirect("dashboard")

    product = Product.objects.get(id=id)
    product.delete()

    return redirect("manage_products")

@login_required
def edit_product(request, id):

    if not request.user.is_superuser:
        return redirect("dashboard")

    product = Product.objects.get(id=id)

    if request.method == "POST":
        product.name = request.POST.get("name")
        product.category = request.POST.get("category")
        product.tier = request.POST.get("tier")
        product.price = request.POST.get("price")
        product.description = request.POST.get("description")

        if request.FILES.get("image"):
            product.image = request.FILES.get("image")

        product.save()

        return redirect("manage_products")

    return render(request, "auth/edit_product.html", {
        "product": product
    })
import razorpay
from django.conf import settings
from django.contrib.auth.decorators import login_required

import razorpay
from django.conf import settings

from django.shortcuts import render, redirect
from .models import Cart, Order, OrderItem

def checkout(request):

    if not request.user.is_authenticated:
        return redirect(f"/login2/?next=/checkout/")

    cart_items = Cart.objects.filter(user=request.user)

    if not cart_items.exists():
        return redirect("cart")

    total = sum(item.product.price * item.quantity for item in cart_items)

    if request.method == "POST":

        name = request.POST.get("name")
        mobile = request.POST.get("mobile")
        address = request.POST.get("address")

        # ✅ CREATE ORDER
        order = Order.objects.create(
            user=request.user,
            name=name,
            mobile=mobile,
            address=address,
            total_amount=total,
            payment_id="COD",
            status="Pending"
        )

        # ✅ SAVE ITEMS
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity
            )

        # ✅ CLEAR CART
        cart_items.delete()

        # ✅ SUCCESS PAGE
        return redirect("success")

    return render(request, "main/checkout.html", {
        "cart_items": cart_items,
        "total": total
    })
from .models import Order   # make sure this import exists

@login_required
def order_history(request):

    orders = Order.objects.filter(user=request.user).order_by("-id")
    return render(request, "main/order_history.html", {
        "orders": orders
    })

@login_required
def manage_orders(request):

    if not request.user.is_superuser:
        return redirect("dashboard")

    orders = Order.objects.all().order_by("-id")

    return render(request, "auth/manage_orders.html", {
        "orders": orders
    })

@login_required
def update_order_status(request, id):

    if not request.user.is_superuser:
        return redirect("dashboard")

    order = Order.objects.get(id=id)

    if request.method == "POST":
        new_status = request.POST.get("status")
        order.status = new_status
        order.save()

        return redirect("manage_orders")

    return render(request, "auth/update_order.html", {
        "order": order
    })

from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from .models import Cart, Order

from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from .models import Cart, Order, OrderItem

@login_required
def cod_order(request):

    cart_items = Cart.objects.filter(user=request.user)

    if not cart_items:
        return redirect("cart")

    total = sum(item.product.price * item.quantity for item in cart_items)

    # ✅ Create Order
    order = Order.objects.create(
        user=request.user,
        total_amount=total,
        payment_id="COD"   # 🔥 important fix
    )

    # ✅ Save each product in OrderItem
    for item in cart_items:
        OrderItem.objects.create(
            order=order,
            product=item.product,
            quantity=item.quantity
        )

    # ✅ Clear cart
    cart_items.delete()

    return redirect("order_success")

def order_success(request):   # ✅ separate function
    return render(request, "main/order_success.html")

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Order

@csrf_exempt
def update_order_status(request, id):

    if request.method == "POST":
        data = json.loads(request.body)
        status = data.get("status")

        order = Order.objects.get(id=id)
        order.status = status
        order.save()

        return JsonResponse({"success": True})

    return JsonResponse({"success": False})
from django.shortcuts import get_object_or_404, redirect
from django.contrib.auth.decorators import login_required

@login_required
def delete_order(request, id):

    if not request.user.is_superuser:
        return redirect("dashboard")

    if request.method == "POST":
        order = get_object_or_404(Order, id=id)
        order.delete()

    return redirect("manage_orders")
import json
from django.http import JsonResponse
from .models import Order

# BULK DELETE
def bulk_delete_orders(request):
    if request.method == "POST":
        data = json.loads(request.body)
        ids = data.get("ids", [])

        Order.objects.filter(id__in=ids).delete()

        return JsonResponse({"success": True})

    return JsonResponse({"success": False})


# BULK STATUS UPDATE
def bulk_update_status(request):
    if request.method == "POST":
        data = json.loads(request.body)
        ids = data.get("ids", [])
        status = data.get("status")

        Order.objects.filter(id__in=ids).update(status=status)

        return JsonResponse({"success": True})

    return JsonResponse({"success": False})

from django.shortcuts import render
from .models import Product


def hair_products(request):

    # 🔐 LOGIN CHECK (CLEAN VERSION)
    if not request.user.is_authenticated:
         return redirect(f"/login2/?next={request.path}")

    # ===== SESSION DATA =====
    hair_type = request.session.get("hair_type")
    concerns = request.session.get("hair_concerns", [])
    result = request.session.get("hair_result", {})

    concerns = [c.lower().replace(" ", "") for c in concerns]

    # ===== CATEGORY MAPPING =====
    category_map = {
        "Shampoo": "shampoo",
        "Anti-Dandruff Shampoo": "shampoo",
        "Conditioner": "conditioner",
        "Hair Serum": "serum",
        "Hair Mask": "mask",
        "Leave-in Conditioner": "leave-in",
        "Hair Growth Oil": "oil"
    }

    # ===== BUILD ROUTINE =====
    def build_routine():
        routine = []

        if "dandruff" in concerns or result.get("dandruff_visibility", 0) > 30:
            routine.append("Anti-Dandruff Shampoo")
        else:
            routine.append("Shampoo")

        routine.append("Conditioner")

        if result.get("texture", 0) < 30:
            routine.append("Hair Mask")

        if "hairfall" in concerns:
            routine.append("Hair Serum")

        if "frizz" in concerns:
            routine.append("Leave-in Conditioner")

        if "dryness" in concerns:
            routine.append("Hair Mask")

        if result.get("scalp_visibility", 0) > 40:
            routine.append("Hair Growth Oil")

        return list(dict.fromkeys(routine))

    # ===== GENERATE ROUTINES =====
    routines = {}

    for tier in ["budget", "medium", "luxury"]:

        routine_steps = build_routine()
        products = []

        for step in routine_steps:
            category = category_map.get(step)
            if not category:
                continue

            qs = Product.objects.filter(
                tier=tier,
                category=category,
                product_type="hair"
            )

            product = qs.order_by('?').first()

            if product:
                products.append({
                    "step": step,
                    "item": product,
                    "reason": f"Recommended for your {step.lower()} needs"
                })

        if not products:
            fallback = Product.objects.filter(tier=tier)[:4]
            products = [
                {"step": "Recommended", "item": p, "reason": "General hair care"}
                for p in fallback
            ]

        routines[tier] = {
            "routine": routine_steps,
            "products": products
        }

    # 🔥 FIX: Move OUTSIDE loop
    top_product = Product.objects.filter(
        product_type="hair",
        description__icontains="dandruff"
    ).order_by("-rating").first()

    # ===== RENDER =====
    return render(request, "main/hair_products.html", {
        "routines": routines,
        "hair_type": hair_type,
        "concerns": concerns,
        "top_product": top_product
    })

def colour_products(request):
    

    # 🔐 LOGIN CHECK
    if not request.user.is_authenticated:
        request.session["next"] = request.path
        return redirect(f"/login2/?next={request.path}")
    # 🎯 GET DATA FROM SESSION
    session_data = request.session.get("colour_result", {})
    undertone = session_data.get("undertone", "").lower()

    # 🎨 WARM
    if "warm" in undertone:
        data = {
            "lipstick": [
                {"name": "Coral Nude", "hex": "#E9967A"},
                {"name": "Terracotta", "hex": "#E2725B"},
                {"name": "Brick Red", "hex": "#8B2E2E"},
            ],
            "blush": [
                {"name": "Apricot Glow", "hex": "#FBCEB1"},
                {"name": "Warm Peach", "hex": "#FFDAB9"},
            ],
            "foundation": "Golden / Yellow undertone (warm base)",
            "clothes": [
                {"name": "Mustard Yellow", "hex": "#FFDB58"},
                {"name": "Olive Green", "hex": "#708238"},
                {"name": "Camel Beige", "hex": "#C19A6B"},
            ]
        }

    # ❄️ COOL
    elif "cool" in undertone:
        data = {
            "lipstick": [
                {"name": "Berry Wine", "hex": "#722F37"},
                {"name": "Cool Pink", "hex": "#FF69B4"},
                {"name": "Plum", "hex": "#8E4585"},
            ],
            "blush": [
                {"name": "Rose Pink", "hex": "#FF007F"},
                {"name": "Soft Mauve", "hex": "#C08081"},
            ],
            "foundation": "Pink / Red undertone (cool base)",
            "clothes": [
                {"name": "Lavender", "hex": "#E6E6FA"},
                {"name": "Emerald Green", "hex": "#50C878"},
                {"name": "Royal Blue", "hex": "#4169E1"},
            ]
        }

    # ⚖️ NEUTRAL
    else:
        data = {
            "lipstick": [
                {"name": "Soft Nude", "hex": "#D2A679"},
                {"name": "Mauve Pink", "hex": "#915F6D"},
                {"name": "Rosewood", "hex": "#65000B"},
            ],
            "blush": [
                {"name": "Peach Pink", "hex": "#F4C2C2"},
                {"name": "Neutral Rose", "hex": "#BC8F8F"},
            ],
            "foundation": "Neutral undertone (balanced base)",
            "clothes": [
                {"name": "Dusty Rose", "hex": "#DCAE96"},
                {"name": "Teal", "hex": "#008080"},
                {"name": "Soft Taupe", "hex": "#483C32"},
            ]
        }

    # 🎯 SEND TO TEMPLATE
    return render(request, "main/colour_products.html", {
        "undertone": undertone,
        "lipstick": data["lipstick"],
        "blush": data["blush"],
        "foundation": data["foundation"],
        "clothes": data["clothes"],
    }) 

    

def set_undertone(request, value):

    data = request.session.get("colour_result", {})

    # Update undertone
    data["undertone"] = value.capitalize()

    request.session["colour_result"] = data

    return redirect("colour_products")

def order_success(request):
    return render(request, "main/order_success.html")

from django.contrib.auth.models import User


def edit_user(request, user_id):

    if not request.user.is_superuser:
        return redirect('dashboard')

    user = User.objects.get(id=user_id)

    if request.method == "POST":

        user.username = request.POST.get('username')
        user.email = request.POST.get('email')

        user.save()

        return redirect('manage_users')

    return render(request, 'auth/edit_user.html', {
        'edit_user': user
    })
from django.contrib.auth.models import User
from django.shortcuts import redirect, get_object_or_404


def toggle_admin(request, user_id):

    if not request.user.is_superuser:
        return redirect('dashboard')

    user = get_object_or_404(User, id=user_id)

    # Prevent removing own admin access
    if user != request.user:

        user.is_superuser = not user.is_superuser
        user.is_staff = user.is_superuser

        user.save()

    return redirect('manage_users')
def delete_user(request, user_id):

    if not request.user.is_superuser:
        return redirect('dashboard')

    user = get_object_or_404(User, id=user_id)

    # Prevent deleting yourself
    if user != request.user:
        user.delete()

    return redirect('manage_users')