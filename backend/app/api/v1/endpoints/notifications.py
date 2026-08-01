from fastapi import APIRouter

router = APIRouter()

mock_notifications = [
    {
        "id": "notif-1",
        "title": "⚡ Viral Spike Detected!",
        "message": "@techcreator's video reached a Virality Score of 94.2!",
        "type": "trend_alert",
        "is_read": False,
        "created_at": "2026-08-01T12:00:00Z"
    },
    {
        "id": "notif-2",
        "title": "✅ YouTube Upload Successful",
        "message": "'5 Secret AI Tools' was published to YouTube Shorts successfully.",
        "type": "success",
        "is_read": True,
        "created_at": "2026-08-01T10:30:00Z"
    }
]

@router.get("")
async def get_notifications():
    return {"success": True, "notifications": mock_notifications}
