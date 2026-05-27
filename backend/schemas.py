from pydantic import BaseModel

class PostBase(BaseModel):
    content: str
    title: str

    class Config:
        orm_mode = True

class CreatePost(PostBase):
    class Config:
        orm_mode = True

class RegisterRequest(BaseModel):

    name: str
    email: str
    password: str

class LoginRequest(BaseModel):

    email: str
    password: str
