import pytest
from datetime import datetime, timezone, timedelta
from app.services.trend_engine import trend_engine

def test_calculate_engagement_rate():
    # 100,000 views, 5,000 likes, 500 comments, 200 shares
    rate = trend_engine.calculate_engagement_rate(100000, 5000, 500, 200)
    assert rate > 0
    assert isinstance(rate, float)
    assert rate == 5.9 # (5000 + 500 + 400) / 100000 * 100

def test_calculate_outlier_score():
    # Video with 500,000 views when author avg is 50,000 views -> 10.0x outlier
    score = trend_engine.calculate_outlier_score(500000, 50000)
    assert score == 10.0

def test_analyze_video_metrics():
    pub_date = datetime.now(timezone.utc) - timedelta(hours=24)
    metrics = trend_engine.analyze_video_metrics(
        views=250000,
        likes=22000,
        comments=1400,
        shares=3100,
        author_avg_views=30000,
        published_at=pub_date
    )

    assert "virality_score" in metrics
    assert "trend_score" in metrics
    assert "outlier_score" in metrics
    assert "growth_velocity" in metrics
    assert "engagement_rate" in metrics
    assert metrics["virality_score"] > 50.0
