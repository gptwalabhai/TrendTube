import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import Column, String, Boolean, Integer, BigInteger, Numeric, DateTime, ForeignKey, Text, JSON, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY as PG_ARRAY
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=True)
    avatar_url = Column(Text, nullable=True)
    role = Column(String(50), nullable=False, default="user")
    is_active = Column(Boolean, default=True, nullable=False)
    email_verified = Column(Boolean, default=False, nullable=False)
    stripe_customer_id = Column(String(255), nullable=True)
    subscription_plan = Column(String(50), default="pro")
    subscription_status = Column(String(50), default="active")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    accounts = relationship("Account", back_populates="user", cascade="all, delete-orphan")
    collections = relationship("Collection", back_populates="user", cascade="all, delete-orphan")
    schedules = relationship("Schedule", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class Account(Base):
    __tablename__ = "accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    platform = Column(String(50), nullable=False)
    account_handle = Column(String(255), nullable=False)
    account_name = Column(String(255), nullable=True)
    account_id_on_platform = Column(String(255), nullable=True)
    avatar_url = Column(Text, nullable=True)
    followers_count = Column(BigInteger, default=0)
    following_count = Column(BigInteger, default=0)
    total_videos = Column(Integer, default=0)
    access_token = Column(Text, nullable=True)
    refresh_token = Column(Text, nullable=True)
    token_expires_at = Column(DateTime(timezone=True), nullable=True)
    is_connected = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="accounts")

class Collection(Base):
    __tablename__ = "collections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(UUID(as_uuid=True), nullable=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String(20), default="#6366F1")
    tags = Column(PG_ARRAY(Text), default=[])
    is_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="collections")

class Video(Base):
    __tablename__ = "videos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    platform = Column(String(50), nullable=False)
    external_id = Column(String(255), nullable=False, index=True)
    url = Column(Text, nullable=False)
    author_handle = Column(String(255), nullable=False)
    author_name = Column(String(255), nullable=True)
    author_avatar = Column(Text, nullable=True)
    title = Column(Text, nullable=True)
    caption = Column(Text, nullable=True)
    thumbnail_url = Column(Text, nullable=True)
    video_url = Column(Text, nullable=True)
    duration_seconds = Column(Integer, default=0)
    views_count = Column(BigInteger, default=0)
    likes_count = Column(BigInteger, default=0)
    comments_count = Column(BigInteger, default=0)
    shares_count = Column(BigInteger, default=0)
    published_at = Column(DateTime(timezone=True), nullable=True)
    category = Column(String(100), nullable=True)
    language = Column(String(10), default="en")
    country = Column(String(10), default="US")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    analysis = relationship("TrendAnalysis", back_populates="video", uselist=False, cascade="all, delete-orphan")

class TrendAnalysis(Base):
    __tablename__ = "trend_analysis"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    video_id = Column(UUID(as_uuid=True), ForeignKey("videos.id", ondelete="CASCADE"), nullable=False, unique=True)
    virality_score = Column(Numeric(5, 2), default=0.00, nullable=False)
    trend_score = Column(Numeric(5, 2), default=0.00, nullable=False)
    outlier_score = Column(Numeric(5, 2), default=0.00, nullable=False)
    growth_velocity = Column(Numeric(10, 2), default=0.00, nullable=False)
    engagement_rate = Column(Numeric(5, 2), default=0.00, nullable=False)
    seo_title = Column(Text, nullable=True)
    seo_description = Column(Text, nullable=True)
    hashtags = Column(PG_ARRAY(Text), default=[])
    keywords = Column(PG_ARRAY(Text), default=[])
    hook_analysis = Column(JSONB, nullable=True)
    audience_analysis = Column(JSONB, nullable=True)
    posting_time_recommendation = Column(JSONB, nullable=True)
    content_summary = Column(Text, nullable=True)
    trend_explanation = Column(Text, nullable=True)
    competitor_comparison = Column(JSONB, nullable=True)
    analyzed_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    video = relationship("Video", back_populates="analysis")

class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True)
    video_title = Column(String(255), nullable=False)
    video_description = Column(Text, nullable=True)
    video_tags = Column(PG_ARRAY(Text), default=[])
    thumbnail_url = Column(Text, nullable=True)
    video_file_url = Column(Text, nullable=False)
    platform = Column(String(50), default="youtube")
    status = Column(String(50), default="scheduled")
    scheduled_time = Column(DateTime(timezone=True), nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="schedules")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="info")
    is_read = Column(Boolean, default=False)
    link = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
