from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.ai_studio import ai_studio_service

router = APIRouter()

class GenerateStudioRequest(BaseModel):
    topic: str
    tone: Optional[str] = "viral"
    content_type: Optional[str] = "script"
    target_platform: Optional[str] = "youtube_shorts"

@router.post("/generate")
async def generate_studio_content(payload: GenerateStudioRequest):
    if not payload.topic:
        raise HTTPException(status_code=400, detail="Topic is required.")
    
    result = await ai_studio_service.generate_studio_content(
        topic=payload.topic,
        tone=payload.tone or "viral",
        content_type=payload.content_type or "script",
        target_platform=payload.target_platform or "youtube_shorts"
    )
    return {
        "success": True,
        "data": result
    }
