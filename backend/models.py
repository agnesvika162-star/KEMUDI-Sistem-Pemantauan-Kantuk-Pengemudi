from xml.dom.minidom import Text

from database import Base
from sqlalchemy import (
    Column,
    Integer,
    String,
    TIMESTAMP,
    Float,
    text
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

    # waktu deteksi dibuat
    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=text("now()")
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
# 🔵 MODEL USER
# AUTHENTICATION SYSTEM
# =========================================
class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # nama user
    name = Column(
        String,
        nullable=False
    )

    # email login
    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    # hashed password
    password = Column(
        String,
        nullable=False
    )

    # waktu akun dibuat
    created_at = Column(
        TIMESTAMP(timezone=True),
        server_default=text("now()")
    )

