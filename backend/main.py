# =========================================
# IMPORT
# =========================================
from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Depends,
    HTTPException
)
from dotenv import load_dotenv
import os

load_dotenv()

MODEL_NAME = os.getenv("MODEL")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.cors import CORSMiddleware

from fastapi.staticfiles import StaticFiles

from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Float,
    DateTime
)

from sqlalchemy.sql import text

from sqlalchemy.orm import (
    declarative_base,
    sessionmaker,
    Session
)

from pydantic import BaseModel

from passlib.context import CryptContext

from tensorflow.keras.models import load_model

from datetime import datetime

from uuid import uuid4

from models import DailySummary

import numpy as np
import cv2
import time
import os
import shutil
import os
from uuid import uuid4
from fastapi.staticfiles import StaticFiles
import mediapipe as mp

# =========================================
# HIDE TENSORFLOW WARNING
# =========================================
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

# =========================================
# FASTAPI
# =========================================
app = FastAPI()

# =========================================
# STATIC FILES
# =========================================
app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

# =========================================
# CORS
# =========================================
app.add_middleware(
    CORSMiddleware,

    # allow_origins=[
    #     FRONTEND_URL,
    #     BACKEND_URL,
    # ],
    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)

# =========================================
# DATABASE
# =========================================
DATABASE_URL = "postgresql://default:p0o9i8u7y6@postgresql.oriontacita.my.id:4450/default"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

# =========================================
# PASSWORD HASH
# =========================================
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto"
)
# =========================================
# DATABASE SESSION
# =========================================
def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()
# =========================================
# DROWSY HISTORY TABLE
# =========================================
class DrowsyHistory(Base):

    __tablename__ = "drowsy_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    status = Column(
        String,
        nullable=False
    )

    confidence = Column(
        Float,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP")
    )

# =========================================
# USER TABLE
# =========================================
class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        nullable=False
    )

    password = Column(
        String,
        nullable=False
    )

    # =====================================
    # PROFILE PHOTO
    # =====================================
    photo = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP")
    )

# =========================================
# TRIP HISTORY
# =========================================
class TripHistory(Base):

    __tablename__ = "trip_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False
    )

    start_time = Column(
        DateTime,
        nullable=False
    )

    end_time = Column(
        DateTime,
        nullable=True
    )

    duration_minutes = Column(
        Float,
        nullable=True
    )
    
    # =========================================
# START TRIP
# =========================================
@app.post("/start-trip")
def start_trip(
    user_id: int,
    db: Session = Depends(get_db)
):

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

# =========================================
# END TRIP
# =========================================
@app.post("/end-trip/{trip_id}")
def end_trip(
    trip_id: int,
    db: Session = Depends(get_db)
):

    trip = db.query(TripHistory).filter(
        TripHistory.id == trip_id
    ).first()

    if not trip:

        raise HTTPException(
            status_code=404,
            detail="Trip tidak ditemukan"
        )

    # =====================================
    # END TIME
    # =====================================
    trip.end_time = datetime.now()

    # =====================================
    # DURATION
    # =====================================
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
# =========================================
# CREATE TABLE
# =========================================
Base.metadata.create_all(bind=engine)

# =========================================
# REQUEST SCHEMA
# =========================================
class RegisterRequest(BaseModel):

    name: str
    email: str
    password: str

class LoginRequest(BaseModel):

    email: str
    password: str

# =========================================
# LOAD AI MODEL
# =========================================
model = load_model(MODEL_NAME)

IMG_SIZE=(96,96)

THRESHOLD=0.5

# =========================================
# MEDIAPIPE
# =========================================

mp_face=mp.solutions.face_mesh

face_mesh=mp_face.FaceMesh(

    static_image_mode=True,

    max_num_faces=1,

    refine_landmarks=True,

    min_detection_confidence=0.5
)


LEFT_EYE=[33,133,160,159,158,157,173]

RIGHT_EYE=[362,263,387,386,385,384,398]

# =========================================
# EYE BOUNDING BOX
# =========================================

def get_eye_box(

    landmarks,
    eye_indices,
    w,
    h

):

    xs=[]

    ys=[]

    for idx in eye_indices:

        lm=landmarks[idx]

        xs.append(

            int(
                lm.x*w
            )
        )

        ys.append(

            int(
                lm.y*h
            )
        )

    return (

        min(xs)-5,

        min(ys)-5,

        max(xs)+5,

        max(ys)+5

    )

# =========================================
# GLOBAL STATUS
# =========================================
last_status = "AWAKE"

last_save_time = 0

# =========================================
# ROOT
# =========================================
@app.get("/")
def root():

    return {

        "status": "success",

        "message": "Drowsiness Detection API Running"
    }

# =========================================
# REGISTER
# =========================================
@app.post("/register")
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):

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

# =========================================
# LOGIN
# =========================================
@app.post("/login")
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):

    try:

        user = db.query(User).filter(
            User.email == request.email
        ).first()

        if not user:

            raise HTTPException(
                status_code=401,
                detail="Invalid email"
            )

        valid_password = pwd_context.verify(
            request.password[:72],
            user.password
        )

        if not valid_password:

            raise HTTPException(
                status_code=401,
                detail="Invalid password"
            )

        return {

            "status": "success",

            "message": "Login successful",

            "user": {

                "id": user.id,

                "name": user.name,

                "email": user.email,

                "photo": user.photo
            }
        }

    except HTTPException:

        raise

    except Exception as e:

        print("LOGIN ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# =========================================
# UPLOAD PROFILE
# =========================================
@app.post("/upload-profile")
async def upload_profile(
    photo: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    try:

        # =====================================
        # CREATE FOLDER
        # =====================================
        if not os.path.exists("uploads"):

            os.makedirs("uploads")

        # =====================================
        # UNIQUE FILE NAME
        # =====================================
        ext = photo.filename.split(".")[-1]

        filename = f"{uuid4()}.{ext}"

        filepath = f"uploads/{filename}"

        # =====================================
        # SAVE FILE
        # =====================================
        with open(filepath, "wb") as buffer:

            shutil.copyfileobj(
                photo.file,
                buffer
            )

        # =====================================
        # GET LAST USER
        # =====================================
        user = db.query(User).order_by(
            User.id.desc()
        ).first()

        if not user:

            raise HTTPException(
                status_code=404,
                detail="User tidak ditemukan"
            )

        # =====================================
        # SAVE PHOTO DATABASE
        # =====================================
        photo_url = (
            f"http://localhost:8000/uploads/{filename}"
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

# =========================================
# PROFILE
# =========================================
@app.get("/profile")
def get_profile(
    db: Session = Depends(get_db)
):

    try:

        user = db.query(User).order_by(
            User.id.desc()
        ).first()

        if not user:

            return {}

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

# =========================================
# PROFILE ACTIVITY SUMMARY
# =========================================
@app.get("/profile/activity-summary")
def profile_activity_summary(
    db: Session = Depends(get_db)
):

    try:

        # =====================================
        # TOTAL DROWSY
        # =====================================
        total_drowsy = db.query(
            DrowsyHistory
        ).count()

        # =====================================
        # LAST MONITORING
        # =====================================
        last_data = db.query(
            DrowsyHistory
        ).order_by(
            DrowsyHistory.created_at.desc()
        ).first()

        # =====================================
        # FORMAT LAST DATE
        # =====================================
        if last_data and last_data.created_at:

            last_monitoring = (
        last_data.created_at.strftime(
            "%d %B %Y %H:%M"
        )
    )

        else:

            last_monitoring = "-"
        # =====================================
        # RETURN
        # =====================================
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
    

# =========================================
# LAST STATUS
# =========================================
last_status = "AWAKE"

# =========================================
# AI PREDICT
# =========================================
# def predict_drowsiness(img):

#     global last_status

#     try:

#         # =====================================
#         # RESIZE
#         # =====================================
#         img = cv2.resize(
#             img,
#             (96, 96)
#         )

#         # =====================================
#         # GRAYSCALE
#         # =====================================
#         img = cv2.cvtColor(
#             img,
#             cv2.COLOR_BGR2GRAY
#         )

#         # =====================================
#         # NORMALIZE
#         # =====================================
#         img = img.astype("float32") / 255.0

#         # =====================================
#         # RESHAPE
#         # =====================================
#         img = np.expand_dims(
#             img,
#             axis=-1
#         )

#         img = np.expand_dims(
#             img,
#             axis=0
#         )

#         print(
#             "INPUT SHAPE:",
#             img.shape
#         )

#         # =====================================
#         # PREDICT
#         # =====================================
#         prediction = model.predict(
#             img,
#             verbose=0
#         )

#         print(
#             "RAW PREDICTION:",
#             prediction
#         )

#         value = float(
#             prediction[0][0]
#         )

#         print(
#             "RAW VALUE:",
#             value
#         )

#         # =====================================
#         # STATUS
#         # =====================================
#         # MODEL BARU:
#         # 1 = AWAKE
#         # 0 = DROWSY
#         # =====================================

#         if value >= 0.50:

#             status = "AWAKE"

#         else:

#             status = "DROWSY"
#         print("STATUS:", status)
#         # =====================================
#         # SAVE LAST STATUS
#         # =====================================
#         last_status = status

#         # =====================================
#         # RETURN
#         # =====================================
#         return {

#             "status": status,

#             "confidence": round(
#                 value * 100,
#                 2
#             )
#         }

#     except Exception as e:

#         print(
#             "PREDICT ERROR:",
#             e
#         )

#         return {

#             "status": last_status,

#             "confidence": 0
#         }
#     # =====================================
#     # CONFIDENCE
#     # =====================================
#     confidence = max(
#         value,
#         1 - value
#     ) * 100

#     result = {

#         "status": status,

#         "confidence": round(confidence, 2),

#         "value": round(value, 4)
#     }

#     print("AI RESULT:", result)

#     return result

def predict_drowsiness(img):

    global last_status

    try:

        h,w,_=img.shape


        rgb=cv2.cvtColor(

            img,
            cv2.COLOR_BGR2RGB
        )


        results=face_mesh.process(
            rgb
        )


        if not results.multi_face_landmarks:

            return {

                "status":"NO_EYE",

                "confidence":0
            }


        scores=[]


        face_landmarks=(
            results.multi_face_landmarks[0]
        )


        lm=face_landmarks.landmark


        boxes=[

            get_eye_box(

                lm,

                LEFT_EYE,

                w,

                h

            ),

            get_eye_box(

                lm,

                RIGHT_EYE,

                w,

                h
            )

        ]


        for (

            x1,
            y1,
            x2,
            y2

        ) in boxes:


            x1=max(x1,0)

            y1=max(y1,0)

            x2=min(x2,w)

            y2=min(y2,h)


            eye=img[
                y1:y2,
                x1:x2
            ]


            if eye.size==0:

                continue


            gray=cv2.cvtColor(

                eye,

                cv2.COLOR_BGR2GRAY
            )


            eye=cv2.resize(

                gray,

                IMG_SIZE
            )


            eye=eye.astype(
                "float32"
            )/255.0


            eye=np.expand_dims(

                eye,

                axis=(0,-1)
            )


            score=float(

                model.predict(

                    eye,

                    verbose=0

                )[0][0]
            )


            scores.append(
                score
            )


        if len(scores)==0:

            return {

                "status":"NO_EYE",

                "confidence":0
            }


        avg_score=np.mean(
            scores
        )


        status=(

            "AWAKE"

            if avg_score>

            THRESHOLD

            else

            "DROWSY"

        )


        confidence=max(

            avg_score,

            1-avg_score

        )*100


        last_status=status


        result={

            "status":status,

            "confidence":

            round(
                float(confidence),
                2
            ),

            "value":

            round(
                float(avg_score),
                4``
            )
        }


        print(
            "AI RESULT:",
            result
        )


        return result


    except Exception as e:

        print(

            "PREDICT ERROR:",
            e
        )

        return {

            "status":last_status,

            "confidence":0
        }

# =========================================
# PREDICT API
# =========================================
@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

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

            new_data = DrowsyHistory(

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

# =========================================
# UPDATE SUMMARY
# =========================================
@app.post("/update-summary")
async def update_summary(
    data: dict
):

    db = SessionLocal()

    try:

        today = datetime.now().strftime("%d %b %Y")
        duration = data.get("duration", 0)
        drowsy_count = data.get("drowsy_count", 0)
        summary = db.query(DailySummary).filter(
            DailySummary.date == today
        ).first()

        if not summary:

            summary = DailySummary(

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

# =========================================
# CHART DATA
# =========================================
@app.get("/chart-data")
def get_chart_data():

    db = SessionLocal()

    summaries = (
        db.query(DailySummary)
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

# =========================================
# DASHBOARD HISTORY
# =========================================
@app.get("/dashboard-history")
def dashboard_history():
    db = SessionLocal()
    summaries = (
        db.query(DailySummary)
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
