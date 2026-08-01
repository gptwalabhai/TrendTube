from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    trends,
    ai_studio,
    collections,
    publishing,
    analytics,
    admin,
    billing,
    notifications
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(trends.router, prefix="/trends", tags=["Trend Discovery"])
api_router.include_router(ai_studio.router, prefix="/ai-studio", tags=["AI Studio"])
api_router.include_router(collections.router, prefix="/collections", tags=["Collections"])
api_router.include_router(publishing.router, prefix="/publishing", tags=["YouTube Publishing"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Panel"])
api_router.include_router(billing.router, prefix="/billing", tags=["Billing & Subscription"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
