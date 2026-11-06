"""Pydantic schemas for request validation and response formatting."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class SceneItem(BaseModel):
    scene_number: int
    description: str
    narration: str


class GeneratedContentSchema(BaseModel):
    title: str
    hook: str
    script: str
    language: str
    scenes: List[SceneItem]
    caption: str
    hashtags: List[str]
    description: str
    call_to_action: str


class ContentGenerateRequest(BaseModel):
    topic: str = Field(..., description="Topic or prompt for content generation")
    target_audience: str = Field("College students", description="Target audience")
    content_purpose: str = Field("Educational", description="Goal or purpose")
    language: str = Field("English", description="English, Hindi, or Hinglish")
    tone: str = Field("Educational", description="Tone of the script")
    platform: str = Field("YouTube", description="Target social platform")
    duration_seconds: int = Field(60, ge=15, le=300, description="Target duration in seconds")
    project_id: Optional[int] = Field(None, description="Existing project ID to update")


class ContentRegenerateRequest(BaseModel):
    project_id: int
    feedback: Optional[str] = Field(None, description="Instructions or tweak requests for regeneration")
    section: Optional[str] = Field("all", description="Section to regenerate: 'all', 'hook', 'script'")


class GeminiImproveRequest(BaseModel):
    project_id: int
    instructions: Optional[str] = Field(
        "Make the opening hook viral and punchy, and ensure natural delivery for the AI avatar presenter.",
        description="Instructions for Gemini review",
    )


class ScriptUpdateRequest(BaseModel):
    title: str
    hook: Optional[str] = None
    script: str
    scenes: Optional[List[SceneItem]] = None
    caption: Optional[str] = None
    hashtags: Optional[List[str]] = None
    description: Optional[str] = None
    call_to_action: Optional[str] = None
    is_approved: bool = True


class HeyGenGenerateRequest(BaseModel):
    project_id: int
    avatar_id: str
    avatar_name: Optional[str] = "Default Avatar"
    voice_id: str
    voice_name: Optional[str] = "Default Voice"
    aspect_ratio: str = Field("16:9", description="16:9, 9:16, or 1:1")
    user_confirmed: bool = Field(False, description="Explicit user confirmation for video generation")


class VideoJobResponse(BaseModel):
    id: int
    project_id: int
    heygen_job_id: Optional[str] = None
    heygen_session_id: Optional[str] = None
    status: str
    progress: int
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    duration: Optional[str] = None
    error_message: Optional[str] = None
    is_demo: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProjectSummary(BaseModel):
    id: int
    title: str
    topic: str
    platform: str
    language: str
    tone: str
    status: str
    selected_avatar_name: Optional[str] = None
    selected_voice_name: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProjectDetailResponse(BaseModel):
    id: int
    title: str
    topic: str
    target_audience: str
    content_purpose: str
    language: str
    tone: str
    platform: str
    duration_seconds: int
    status: str
    selected_avatar_id: Optional[str] = None
    selected_avatar_name: Optional[str] = None
    selected_voice_id: Optional[str] = None
    selected_voice_name: Optional[str] = None
    aspect_ratio: str
    created_at: datetime
    latest_script: Optional[GeneratedContentSchema] = None
    latest_video_job: Optional[VideoJobResponse] = None

    model_config = ConfigDict(from_attributes=True)


class AIStatusResponse(BaseModel):
    ollama_running: bool
    ollama_version: Optional[str] = None
    gemma_model_installed: bool
    gemma_model_name: str
    available_models: List[str] = []
    message: str


class HeyGenStatusResponse(BaseModel):
    configured: bool
    authenticated: bool
    user_email: Optional[str] = None
    username: Optional[str] = None
    remaining_credits: Optional[float] = None
    plan: Optional[str] = None
    message: str


class SceneSchema(SceneItem):
    pass


class NvidiaImproveRequest(BaseModel):
    project_id: int
    instructions: Optional[str] = Field(
        None,
        description="Refinement directive for NVIDIA NIM cloud LLM",
    )
    model_name: Optional[str] = Field(None, description="Optional override of NVIDIA model")


class PlatformVariantsRequest(BaseModel):
    project_id: int
    provider: Optional[str] = Field("nvidia", description="'nvidia' or 'gemma'")


class ScheduledPostCreate(BaseModel):
    project_id: Optional[int] = None
    platform: str = Field("YouTube", description="YouTube, Instagram Reels, YouTube Shorts, LinkedIn")
    title: str
    script: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    scheduled_datetime: datetime
    status: Optional[str] = "SCHEDULED"


class ScheduledPostUpdate(BaseModel):
    scheduled_datetime: Optional[datetime] = None
    status: Optional[str] = None
    published_url: Optional[str] = None
    error_message: Optional[str] = None


class ScheduledPostResponse(BaseModel):
    id: int
    project_id: Optional[int] = None
    platform: str
    title: str
    script: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    scheduled_datetime: datetime
    status: str
    published_url: Optional[str] = None
    error_message: Optional[str] = None
    retry_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TopicBacklogCreate(BaseModel):
    topic: str
    target_audience: Optional[str] = "College Students"
    language: Optional[str] = "Hindi"
    preferred_platform: Optional[str] = "YouTube"


class TopicBacklogResponse(BaseModel):
    id: int
    topic: str
    target_audience: str
    language: str
    preferred_platform: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CreatorPreferenceUpdate(BaseModel):
    posting_days: Optional[str] = "Monday,Wednesday,Friday"
    posting_time: Optional[str] = "18:00"
    timezone: Optional[str] = "Asia/Kolkata"
    unavailable_dates: Optional[List[str]] = None
    mode: Optional[str] = "smart_approval"  # manual, smart_approval, autopilot
    spending_limit_credits: Optional[int] = 5


class CreatorPreferenceResponse(BaseModel):
    id: int
    posting_days: str
    posting_time: str
    timezone: str
    unavailable_dates: List[str] = []
    mode: str
    spending_limit_credits: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

