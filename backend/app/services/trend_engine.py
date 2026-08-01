import math
from datetime import datetime, timezone
from typing import Dict, Any, List

class TrendEngine:
    """
    Enterprise-grade Trend & Virality Analytics Engine.
    Calculates mathematical scores for videos based on engagement metrics,
    author baselines, recency decay curves, and outlier statistical deviations.
    """

    @staticmethod
    def calculate_engagement_rate(views: int, likes: int, comments: int, shares: int = 0) -> float:
        if views <= 0:
            return 0.0
        total_interactions = likes + comments + (shares * 2) # Shares weighted double
        rate = (total_interactions / views) * 100.0
        return round(min(rate, 100.0), 2)

    @staticmethod
    def calculate_growth_velocity(views: int, published_at: datetime) -> float:
        if not published_at:
            return 0.0
        
        now = datetime.now(timezone.utc)
        if published_at.tzinfo is None:
            published_at = published_at.replace(tzinfo=timezone.utc)
            
        hours_elapsed = max((now - published_at).total_seconds() / 3600.0, 0.5)
        views_per_hour = views / hours_elapsed
        return round(views_per_hour, 2)

    @staticmethod
    def calculate_outlier_score(views: int, author_avg_views: int = 10000) -> float:
        """
        Calculates how many standard deviations / multiples above the channel average this video is performing.
        1.0 = baseline average. 5.0+ = 5x baseline (high viral outlier).
        """
        baseline = max(author_avg_views, 100)
        multiplier = views / baseline
        outlier_score = min(round(multiplier, 2), 99.99)
        return outlier_score

    @staticmethod
    def calculate_virality_score(
        views: int,
        likes: int,
        comments: int,
        shares: int,
        author_avg_views: int,
        published_at: datetime
    ) -> float:
        """
        Composite Virality Score algorithm (0.0 to 99.9).
        Integrates Outlier multiplier, Engagement density, and Velocity boost.
        """
        outlier = TrendEngine.calculate_outlier_score(views, author_avg_views)
        engagement = TrendEngine.calculate_engagement_rate(views, likes, comments, shares)
        velocity = TrendEngine.calculate_growth_velocity(views, published_at)
        
        # Logarithmic view magnitude factor
        view_factor = math.log10(max(views, 10)) / 7.0 # Normalized against 10M views
        
        # Weighted composite score
        score = (
            (outlier * 35.0) + 
            (min(engagement, 15.0) * 2.5) + 
            (min(velocity / 1000.0, 20.0) * 1.5) + 
            (view_factor * 15.0)
        )
        return min(max(round(score, 1), 5.0), 99.9)

    @staticmethod
    def calculate_trend_score(
        virality_score: float,
        published_at: datetime
    ) -> float:
        """
        Calculates real-time trend momentum incorporating exponential recency decay.
        Videos uploaded in the last 48 hours receive maximum trend weight.
        """
        if not published_at:
            return virality_score
            
        now = datetime.now(timezone.utc)
        if published_at.tzinfo is None:
            published_at = published_at.replace(tzinfo=timezone.utc)
            
        days_old = max((now - published_at).total_seconds() / 86400.0, 0.1)
        
        # Half-life decay of 7 days
        decay_factor = math.exp(-0.1 * days_old)
        trend_score = virality_score * decay_factor
        return min(max(round(trend_score, 1), 1.0), 99.9)

    @classmethod
    def analyze_video_metrics(
        cls,
        views: int,
        likes: int,
        comments: int,
        shares: int,
        author_avg_views: int,
        published_at: datetime
    ) -> Dict[str, float]:
        engagement_rate = cls.calculate_engagement_rate(views, likes, comments, shares)
        growth_velocity = cls.calculate_growth_velocity(views, published_at)
        outlier_score = cls.calculate_outlier_score(views, author_avg_views)
        virality_score = cls.calculate_virality_score(views, likes, comments, shares, author_avg_views, published_at)
        trend_score = cls.calculate_trend_score(virality_score, published_at)

        return {
            "virality_score": virality_score,
            "trend_score": trend_score,
            "outlier_score": outlier_score,
            "growth_velocity": growth_velocity,
            "engagement_rate": engagement_rate
        }

trend_engine = TrendEngine()
