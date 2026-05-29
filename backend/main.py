# FAST API
from fastapi import FastAPI, Form, UploadFile, File, Depends, HTTPException, Cookie
from fastapi.responses import JSONResponse
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# OTHERS
from dotenv import load_dotenv
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from uuid import uuid4
import time
import shutil
from jose import jwt
import os

# LOCAL IMPORT
from models import DailySummary, Post, User, TripHistory
from schemas import PostBase, CreatePost, RegisterRequest, LoginRequest
from database import engine, SessionLocal, Base, pwd_context, get_db
from ai import *
from jwt import *

#===================================================================================================================================
# LOAD .ENV
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

#===================================================================================================================================
# INITIALIZE FASTAPI
app = FastAPI()

# DECLARE STATIC FILES FOLDERS
app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # FRONTEND_URL,
        # BACKEND_URL,
	"*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#===================================================================================================================================
# API

# GET /
@app.get("/")
def root():

    return {
        "status": "success",
        "message": "Drowsiness Detection API Running"
    }

# POST /register
@app.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    try:
        existing_user = db.query(User).filter(
            User.email == request.email
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        hashed_password = pwd_context.hash(
            request.password[:72]
        )

        new_user = User(
            name=request.name,
            email=request.email,
            password=hashed_password
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {
            "status": "success",
            "message": "Register successful"
        }

    except Exception as e:
        print("REGISTER ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# POST /login
@app.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(
            User.email == request.email
        ).first()

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        valid_password = pwd_context.verify(
            request.password[:72],
            user.password
        )

        if not valid_password:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        # CREATE JWT TOKEN
        token = create_access_token({
            "user_id": user.id
        })

        # RESPONSE
        response = JSONResponse(
            content={
                "status": "success",
                "message": "Login successful",
                "token": token,
                "user": {
                    "name": user.name,
                    "email": user.email,
                    "profile": user.photo
                }
            }
        )

        # SET COOKIE
        response.set_cookie(
    		key="access_token",
    		value=token,
		    httponly=True,
    		secure=False,
    		samesite="lax",
    		max_age=86400
	    )

        # print(response.body)

        return response

    except HTTPException:
        raise

    except Exception as e:
        print("LOGIN ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# POST 
@app.post("/logout")
def logout():

    response = JSONResponse(
        content={
            "status": "success",
            "message": "Logout successful"
        }
    )

    response.delete_cookie("access_token")
    response.delete_cookie("user_id")

    return response

# POST /start-trip
@app.post("/start-trip")
def start_trip( current_user: str = Depends(check_login), user_id: int = Form(...), db: Session = Depends(get_db)):
    #??? user_id should get from jwt token
    trip = TripHistory(
        user_id=user_id,
        start_time=datetime.now()
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return {
        "trip_id": trip.id,
        "start_time": trip.start_time
    }

# POST /end-trip/{trip_id}
@app.post("/end-trip/{trip_id}")
def end_trip( trip_id: int, current_user: str = Depends(check_login), db: Session = Depends(get_db)):
    trip = db.query(TripHistory).filter(
        TripHistory.id == trip_id
    ).first()

    if not trip:
        raise HTTPException(
            status_code=404,
            detail="Trip tidak ditemukan"
        )

    trip.end_time = datetime.now()

    duration = (
        trip.end_time - trip.start_time
    ).total_seconds() / 60

    trip.duration_minutes = round(
        duration,
        2
    )

    db.commit()
    db.refresh(trip)
    return {
        "duration_minutes":
        trip.duration_minutes
    }


# POST /upload-profile
@app.post("/upload-profile")
async def upload_profile(photo: UploadFile = File(...), current_user: str = Depends(check_login), db: Session = Depends(get_db)):
    try:
        # UNIQUE FILE NAME
        ext = photo.filename.split(".")[-1] #??? validasi ekstensi
        filename = f"{uuid4()}.{ext}"
        filepath = f"uploads/{filename}"

        # SAVE FILE
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(
                photo.file,
                buffer
            )

        # GET LAST USER
        user = db.query(User).filter(User.id == current_user).first()

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User tidak ditemukan"
            )

        # SAVE PHOTO DATABASE
        photo_url = (
            f"uploads/{filename}"
        )

        user.photo = photo_url
        db.commit()
        db.refresh(user)
        return {
            "status": "success",
            "photo": photo_url
        }

    except Exception as e:
        print("UPLOAD ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# GET /profile
@app.get("/profile")
def get_profile(current_user: str = Depends(check_login), db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.id == current_user).first()
        if not user:
            return {} #??? return kosong

        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "photo": user.photo
        }

    except Exception as e:
        print("PROFILE ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# GET /profile/activity-summary
@app.get("/profile/activity-summary")
def profile_activity_summary(current_user: str = Depends(check_login),db: Session = Depends(get_db)):
    try:
        # TOTAL DROWSY
        total_drowsy = db.query(
            DetectionData
        ).count()

        # LAST MONITORING
        last_data = db.query(
            DetectionData
        ).order_by(
            DetectionData.created_at.desc()
        ).first()

        # FORMAT LAST DATE
        if last_data and last_data.created_at:
            last_monitoring = (
                last_data.created_at.strftime(
                        "%d %B %Y %H:%M"
                )
    	    )
        else:
            last_monitoring = "-"
        
        return {
            "lastMonitoring":
            last_monitoring,
            "totalDrowsy":
            total_drowsy,
            "averageDuration":
            "-"
        }

    except Exception as e:
        print(
            "SUMMARY ERROR:",
            e
        )
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# POST /predict
@app.post("/predict")
async def predict(file: UploadFile = File(...), user_id: str = Depends(check_login), db: Session = Depends(get_db)):
    
    print("PREDICT HIT")
    print("USER ID:", user_id)
    global last_save_time

    try:

        contents = await file.read()

        npimg = np.frombuffer(
            contents,
            np.uint8
        )

        img = cv2.imdecode(
            npimg,
            cv2.IMREAD_COLOR
        )

        if img is None:

            raise HTTPException(
                status_code=400,
                detail="Invalid image"
            )

        result = predict_drowsiness(img)

        current_time = time.time()

        # =====================================
        # SAVE DROWSY
        # =====================================
        if (
            result["status"] == "DROWSY"
            and current_time - last_save_time > 5
        ):

            new_data = DetectionData(
                user_id=user_id,
                status=result["status"],

                confidence=result["confidence"]
            )

            db.add(new_data)

            db.commit()

            db.refresh(new_data)

            last_save_time = current_time

            print(
                f"DROWSY SAVED | {result['confidence']}%"
            )

        return result

    except Exception as e:

        print("ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# PUT /update-summary/{user_id}
@app.post("/update-summary/{user_id}")
async def update_summary(user_id: int, data: dict, current_user: str = Depends(check_login)):
    db = SessionLocal()

    try:

        today = datetime.now().strftime("%d %b %Y")
        duration = data.get("duration", 0)
        drowsy_count = data.get("drowsy_count", 0)
        summary = db.query(DailySummary).filter(
            DailySummary.date == today,
            DailySummary.user_id == user_id
        ).first()

        if not summary:

            summary = DailySummary(
                user_id=user_id,
                date=today,
                total_duration=duration,
                total_drowsy=drowsy_count
            )

            db.add(summary)

        else:

            summary.total_duration += duration

            summary.total_drowsy += drowsy_count

        db.commit()

        return {
            "status": "success"
        }

    except Exception as e:

        print("UPDATE SUMMARY ERROR:", e)

        return {
            "status": "error",
            "message": str(e)
        }

    finally:

        db.close()

# GET /chart-data/{user_id}
@app.get("/chart-data/{user_id}")
def get_chart_data(user_id: int, current_user: str = Depends(check_login)):
    db = SessionLocal()

    summaries = (
        db.query(DailySummary)
        .filter(DailySummary.user_id == user_id)
        .order_by(DailySummary.id.asc())
        .limit(30)
        .all()
    )

    results = []

    for item in summaries:

        results.append({

            "date": item.date,

            "value": item.total_drowsy
        })

    db.close()

    return results

# GET /dashboard-history
@app.get("/dashboard-history")
def dashboard_history(user_id: str = Depends(check_login)):
    print(user_id)
    db = SessionLocal()
    summaries = (
        db.query(DailySummary)
        .filter(DailySummary.user_id == user_id)
        .order_by(DailySummary.id.desc())
        .limit(30)
        .all()
    )
    results = []
    for item in summaries:

        status = (
            "DROWSY"
            if item.total_drowsy > 0
            else "AWAKE"
        )

        hours = item.total_duration // 3600

        minutes = (
            item.total_duration % 3600
        ) // 60

        seconds = (
            item.total_duration % 60
        )

        duration = (
            f"{hours:02}:{minutes:02}:{seconds:02}"
        )
        results.append({
            "tanggal": item.date,
            "durasi": duration,
            "frekuensi": item.total_drowsy,
            "status": status
        })
    db.close()
    return results

