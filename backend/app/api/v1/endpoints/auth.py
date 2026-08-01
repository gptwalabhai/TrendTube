from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login(payload: LoginRequest):
    return {
        "success": True,
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.trendtube_demo_token",
        "user": {
            "id": "user-demo-123",
            "email": payload.email,
            "name": "Alex Trendmaster",
            "role": "admin",
            "subscription_plan": "pro"
        }
    }

@router.get("/me")
async def get_current_user():
    return {
        "success": True,
        "user": {
            "id": "user-demo-123",
            "email": "creator@trendtube.ai",
            "name": "Alex Trendmaster",
            "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Trendmaster",
            "role": "admin",
            "subscription_plan": "pro"
        }
    }
