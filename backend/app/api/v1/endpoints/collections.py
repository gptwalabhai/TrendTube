from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class CreateCollectionRequest(BaseModel):
    name: str
    description: Optional[str] = ""
    color: Optional[str] = "#6366F1"
    tags: Optional[List[str]] = []

# In-memory storage mock for fast responsive demonstration
mock_collections = [
    {
        "id": "col-1",
        "name": "🔥 Viral AI Short Form",
        "description": "Top performing AI tool breakdowns and hook frameworks",
        "color": "#6366F1",
        "tags": ["AI", "Shorts", "Hooks"],
        "is_favorite": True,
        "video_count": 12,
        "created_at": "2026-08-01T10:00:00Z"
    },
    {
        "id": "col-2",
        "name": "💼 SaaS Growth Strategies",
        "description": "Case studies and viral founder stories",
        "color": "#10B981",
        "tags": ["SaaS", "Business"],
        "is_favorite": False,
        "video_count": 8,
        "created_at": "2026-07-28T14:30:00Z"
    },
    {
        "id": "col-3",
        "name": "🎨 High Retention Visuals",
        "description": "Fast-paced video editing styles and sound effects",
        "color": "#F59E0B",
        "tags": ["Editing", "Design"],
        "is_favorite": True,
        "video_count": 19,
        "created_at": "2026-07-20T09:15:00Z"
    }
]

@router.get("")
async def list_collections():
    return {"success": True, "collections": mock_collections}

@router.post("")
async def create_collection(payload: CreateCollectionRequest):
    new_col = {
        "id": f"col-{len(mock_collections)+1}",
        "name": payload.name,
        "description": payload.description or "",
        "color": payload.color or "#6366F1",
        "tags": payload.tags or [],
        "is_favorite": False,
        "video_count": 0,
        "created_at": "2026-08-01T12:00:00Z"
    }
    mock_collections.append(new_col)
    return {"success": True, "collection": new_col}
