from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.youtube_publisher import youtube_publisher_service

router = APIRouter()

class ScheduleUploadRequest(BaseModel):
    title: str
    description: str
    tags: Optional[List[str]] = []
    file_url: str
    thumbnail_url: Optional[str] = None
    scheduled_time: datetime

mock_schedules = [
    {
        "id": "sched-101",
        "video_title": "5 Secret AI Tools for 10x Productivity",
        "video_description": "Boost your workflow with these top AI tools!",
        "video_tags": ["#AI", "#Productivity", "#Shorts"],
        "thumbnail_url": "https://picsum.photos/seed/thumb1/600/338",
        "video_file_url": "https://storage.trendtube.ai/videos/demo1.mp4",
        "platform": "youtube",
        "status": "scheduled",
        "scheduled_time": "2026-08-02T18:00:00Z",
        "retry_count": 0
    },
    {
        "id": "sched-102",
        "video_title": "How I Scaled My SaaS to $50k MRR",
        "video_description": "Step-by-step breakdown of user acquisition strategies.",
        "video_tags": ["#SaaS", "#Startup", "#Business"],
        "thumbnail_url": "https://picsum.photos/seed/thumb2/600/338",
        "video_file_url": "https://storage.trendtube.ai/videos/demo2.mp4",
        "platform": "youtube",
        "status": "published",
        "scheduled_time": "2026-07-31T15:00:00Z",
        "published_at": "2026-07-31T15:00:04Z",
        "retry_count": 0
    }
]

@router.get("/oauth-url")
async def get_youtube_oauth_url():
    url = youtube_publisher_service.get_oauth_url()
    return {"success": True, "oauth_url": url}

@router.get("/schedules")
async def get_publishing_schedules():
    return {"success": True, "schedules": mock_schedules}

@router.post("/schedule")
async def schedule_upload(payload: ScheduleUploadRequest):
    item = await youtube_publisher_service.schedule_upload(
        user_id="user-demo-123",
        account_id="primary-yt-account",
        title=payload.title,
        description=payload.description,
        tags=payload.tags or [],
        file_url=payload.file_url,
        thumbnail_url=payload.thumbnail_url,
        scheduled_time=payload.scheduled_time
    )
    mock_schedules.insert(0, item)
    return {"success": True, "schedule": item}

@router.post("/schedules/{schedule_id}/retry")
async def retry_schedule(schedule_id: str):
    res = await youtube_publisher_service.retry_failed_upload(schedule_id)
    return {"success": True, "schedule": res}
