from xml.dom.minidom import Text

from database import Base
from sqlalchemy import (
    Column,
    Integer,
    String,
    TIMESTAMP,
    Float,
    text,
    DateTime,
    func,
    and_
)

# =========================================
# 🔴 MODEL LOG DETEKSI AI (REAL-TIME)
# Menyimpan setiap kejadian kantuk
# =========================================
class Post(Base):

    __tablename__ = "data"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # hasil prediksi AI
    # DROWSY / AWAKE
    status = Column(
        String,
        nullable=False
    )

    # confidence AI
    # contoh: 0.923
    confidence = Column(
        Float,
        nullable=False
    )

    user_id = Column(
        Integer,
        nullable=False
    )

    # waktu deteksi dibuat
    created_at = Column(
        TIMESTAMP, 
        default=func.now()
    )


# =========================================
# 🟢 MODEL SUMMARY HARIAN
# Menyimpan akumulasi data
# =========================================
class DailySummary(Base):

    __tablename__ = "daily_summary"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    user_id = Column(
        Integer,
        nullable=False
    )
    # format:
    # YYYY-MM-DD
    date = Column(
        String,
        unique=True,
        nullable=False
    )

    # total durasi berkendara
    total_duration = Column(
        Integer,
        default=0
    )

    # total kejadian ngantuk
    total_drowsy = Column(
        Integer,
        default=0
    )

    # waktu data dibuat
    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=text("now()")
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
