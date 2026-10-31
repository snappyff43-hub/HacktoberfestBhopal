"""SQLAlchemy database models for CreatorFlow AI."""

from datetime import datetime
import json
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database.database import Base


class User(Base):
    """User account entity."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, default="creator")
    email = Column(String(255), unique=True, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")


class Project(Base):
    """Main video creation project."""
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=False)
    topic = Column(Text, nullable=False)
    target_audience = Column(String(150), default="General Audience")
    content_purpose = Column(String(150), default="Educate & Inspire")
    language = Column(String(50), default="English")
    tone = Column(String(50), default="Professional")
    platform = Column(String(50), default="YouTube")
    duration_seconds = Column(Integer, default=60)
    status = Column(String(50), default="draft")  # draft, script_ready, approved, generating, completed, failed

    selected_avatar_id = Column(String(100), nullable=True)
    selected_avatar_name = Column(String(100), nullable=True)
    selected_voice_id = Column(String(100), nullable=True)
    selected_voice_name = Column(String(100), nullable=True)
    aspect_ratio = Column(String(20), default="16:9")  # 16:9, 9:16, 1:1

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="projects")
    scripts = relationship("GeneratedScript", back_populates="project", cascade="all, delete-orphan")
    video_jobs = relationship("VideoJob", back_populates="project", cascade="all, delete-orphan")


class GeneratedScript(Base):
    """AI Generated and User-Approved Script versions."""
    __tablename__ = "generated_scripts"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String(255), nullable=False)
    hook = Column(Text, nullable=True)
    script = Column(Text, nullable=False)
    language = Column(String(50), default="English")
    scenes_json = Column(Text, nullable=True)  # JSON-encoded array of scene objects
    caption = Column(Text, nullable=True)
    hashtags_json = Column(Text, nullable=True)  # JSON-encoded array of hashtags
    description = Column(Text, nullable=True)
    call_to_action = Column(Text, nullable=True)
    is_approved = Column(Boolean, default=False)
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="scripts")

    @property
    def scenes(self):
        if not self.scenes_json:
            return []
        try:
            return json.loads(self.scenes_json)
        except Exception:
            return []

    @scenes.setter
    def scenes(self, value):
        self.scenes_json = json.dumps(value) if value is not None else None

    @property
    def hashtags(self):
        if not self.hashtags_json:
            return []
        try:
            return json.loads(self.hashtags_json)
        except Exception:
            return []

    @hashtags.setter
    def hashtags(self, value):
        self.hashtags_json = json.dumps(value) if value is not None else None


class VideoJob(Base):
    """HeyGen Video Generation job tracker."""
    __tablename__ = "video_jobs"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    heygen_job_id = Column(String(100), index=True, nullable=True)
    heygen_session_id = Column(String(100), nullable=True)
    status = Column(String(50), default="pending")  # pending, processing, completed, failed
    progress = Column(Integer, default=0)
    video_url = Column(Text, nullable=True)
    thumbnail_url = Column(Text, nullable=True)
    duration = Column(String(50), nullable=True)
    error_message = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="video_jobs")
    assets = relationship("VideoAsset", back_populates="video_job", cascade="all, delete-orphan")


class VideoAsset(Base):
    """Media assets related to video jobs."""
    __tablename__ = "video_assets"

    id = Column(Integer, primary_key=True, index=True)
    video_job_id = Column(Integer, ForeignKey("video_jobs.id"), nullable=False)
    asset_type = Column(String(50), nullable=False)  # mp4, webm, srt, thumbnail, gif
    asset_url = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    video_job = relationship("VideoJob", back_populates="assets")


class Setting(Base):
    """Application preferences and non-secret configurations."""
    __tablename__ = "settings"

    key = Column(String(100), primary_key=True)
    value = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
