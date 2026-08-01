from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from app.services.scrapers import scraper_service
from app.services.downloader import pipeline_service

router = APIRouter()

class URLAnalyzeRequest(BaseModel):
    url: str

class AutoPipelineRequest(BaseModel):
    url_or_handle: str
    auto_schedule: Optional[bool] = True

@router.post("/analyze-url")
async def analyze_url(payload: URLAnalyzeRequest):
    if not payload.url or len(payload.url.strip()) < 3:
        raise HTTPException(status_code=400, detail="Invalid profile or channel URL provided.")
    
    result = await scraper_service.analyze_url(payload.url)
    return {
        "success": True,
        "data": result
    }

@router.post("/scrape-download-publish")
async def auto_scrape_download_publish(payload: AutoPipelineRequest):
    if not payload.url_or_handle:
        raise HTTPException(status_code=400, detail="Creator handle or URL is required.")
    
    res = await pipeline_service.run_pipeline(payload.url_or_handle, auto_schedule=payload.auto_schedule)
    return res

@router.get("/feed")
async def get_trend_feed(
    platform: Optional[str] = Query(None, description="all, youtube, tiktok, instagram"),
    date_range: Optional[str] = Query("7d", description="today, 7d, 30d, 90d"),
    min_views: Optional[int] = Query(10000),
    min_likes: Optional[int] = Query(500),
    min_engagement: Optional[float] = Query(2.0),
    category: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("virality_score", description="virality_score, trend_score, outlier_score, growth_velocity, views_count")
):
    result = await scraper_service.analyze_url("https://www.youtube.com/@TrendTubeAI")
    videos = result["videos"]

    if platform and platform.lower() != "all":
        videos = [v for v in videos if v["platform"].lower() == platform.lower()]

    if min_views:
        videos = [v for v in videos if v["views_count"] >= min_views]
    if min_likes:
        videos = [v for v in videos if v["likes_count"] >= min_likes]
    if min_engagement:
        videos = [v for v in videos if v["engagement_rate"] >= min_engagement]

    if sort_by in ["virality_score", "trend_score", "outlier_score", "growth_velocity", "views_count"]:
        videos.sort(key=lambda x: x.get(sort_by, 0), reverse=True)

    return {
        "success": True,
        "count": len(videos),
        "filters": {
            "platform": platform,
            "date_range": date_range,
            "min_views": min_views,
            "min_likes": min_likes,
            "sort_by": sort_by
        },
        "videos": videos
    }
