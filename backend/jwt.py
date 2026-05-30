# OTHERS
from fastapi import FastAPI, Form, UploadFile, File, Depends, HTTPException, Cookie
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from uuid import uuid4
import time
import shutil
from jose import jwt
import os
from dotenv import load_dotenv

#===================================================================================================================================
# LOAD .ENV
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

#===================================================================================================================================
# JWT TOKEN
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        days=1
    )
    to_encode.update({
        "exp": expire
    })
    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    return encoded_jwt

# AUTH CHECK
def check_login(access_token: str = Cookie(default=None)):
    # print(access_token)
    if not access_token:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized"
        )

    try:
        payload = jwt.decode(
            access_token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )
        return user_id

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Token invalid"
        )
