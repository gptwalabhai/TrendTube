from fastapi import APIRouter

router = APIRouter()

@router.get("/overview")
async def get_analytics_overview():
    return {
        "success": True,
        "metrics": {
            "total_views": 4850000,
            "total_subscribers_gained": 38400,
            "avg_ctr": 8.4,
            "avg_watch_time_sec": 48.2,
            "estimated_revenue_usd": 6420.50,
            "views_growth_pct": "+28.4%",
            "subscribers_growth_pct": "+34.1%"
        },
        "views_timeline": [
            {"date": "2026-07-25", "views": 140000, "subscribers": 1100, "revenue": 180.20},
            {"date": "2026-07-26", "views": 185000, "subscribers": 1450, "revenue": 240.50},
            {"date": "2026-07-27", "views": 210000, "subscribers": 1680, "revenue": 290.00},
            {"date": "2026-07-28", "views": 340000, "subscribers": 2800, "revenue": 450.80},
            {"date": "2026-07-29", "views": 520000, "subscribers": 4200, "revenue": 720.00},
            {"date": "2026-07-30", "views": 680000, "subscribers": 5600, "revenue": 940.30},
            {"date": "2026-07-31", "views": 890000, "subscribers": 7100, "revenue": 1210.00},
            {"date": "2026-08-01", "views": 1150000, "subscribers": 9200, "revenue": 1580.00}
        ],
        "top_performing_content": [
            {"title": "I Tried 100 AI Tools", "views": 1450000, "ctr": "9.8%", "watch_time": "52s"},
            {"title": "Secret SaaS Growth Hack", "views": 980000, "ctr": "8.9%", "watch_time": "45s"},
            {"title": "React 19 Complete Breakdown", "views": 750000, "ctr": "8.1%", "watch_time": "58s"}
        ]
    }
