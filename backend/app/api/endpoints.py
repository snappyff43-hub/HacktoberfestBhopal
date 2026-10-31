"""FastAPI API endpoints for CreatorFlow AI."""

import json
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.project import GeneratedScript, Project, VideoAsset, VideoJob
from app.schemas.project import (
    AIStatusResponse,
    ContentGenerateRequest,
    ContentRegenerateRequest,
    GeneratedContentSchema,
    HeyGenGenerateRequest,
    HeyGenStatusResponse,
    ProjectDetailResponse,
    ProjectSummary,
    ScriptUpdateRequest,
    VideoJobResponse,
)
from app.services.gemma_service import gemma_service
from app.services.heygen_service import heygen_service

router = APIRouter(prefix="/api", tags=["creatorflow"])


@router.get("/health")
async def health_check():
    """Health check endpoint confirming backend service status."""
    return {
        "status": "healthy",
        "service": "CreatorFlow AI Backend",
        "version": "1.0.0",
        "api_spec": "HeyGen V3 + Local Gemma 4",
    }


@router.get("/ai/status", response_model=AIStatusResponse)
async def get_ai_status():
    """Inspect local Ollama connection, version, and Gemma 4 model readiness."""
    status_data = await gemma_service.check_status()
    return AIStatusResponse(**status_data)


@router.get("/heygen/status", response_model=HeyGenStatusResponse)
async def get_heygen_status():
    """Check HeyGen API configuration, credentials, and credits."""
    return await heygen_service.get_user_status()


# Support both GET and POST for avatar catalog
@router.get("/heygen/avatars")
@router.post("/heygen/avatars")
async def get_avatars():
    """Return available HeyGen avatar looks."""
    avatars = await heygen_service.get_avatars()
    return {"avatars": avatars, "total": len(avatars)}


# Support both GET and POST for voices catalog
@router.get("/heygen/voices")
@router.post("/heygen/voices")
async def get_voices():
    """Return available HeyGen voice options."""
    voices = await heygen_service.get_voices()
    return {"voices": voices, "total": len(voices)}


@router.post("/content/generate")
async def generate_content(req: ContentGenerateRequest, db: Session = Depends(get_db)):
    """Generate a complete structured video script using local Gemma 4 via Ollama."""
    try:
        content: GeneratedContentSchema = await gemma_service.generate_content(
            topic=req.topic,
            target_audience=req.target_audience,
            content_purpose=req.content_purpose,
            language=req.language,
            tone=req.tone,
            platform=req.platform,
            duration_seconds=req.duration_seconds,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gemma 4 generation failed: {str(e)}",
        )

    # Persist or update project in database
    if req.project_id:
        project = db.query(Project).filter(Project.id == req.project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        project.title = content.title
        project.topic = req.topic
        project.language = req.language
        project.tone = req.tone
        project.platform = req.platform
        project.duration_seconds = req.duration_seconds
        project.status = "script_ready"
    else:
        project = Project(
            title=content.title,
            topic=req.topic,
            target_audience=req.target_audience,
            content_purpose=req.content_purpose,
            language=req.language,
            tone=req.tone,
            platform=req.platform,
            duration_seconds=req.duration_seconds,
            status="script_ready",
        )
        db.add(project)
        db.flush()

    # Save generated script version
    script_record = GeneratedScript(
        project_id=project.id,
        title=content.title,
        hook=content.hook,
        script=content.script,
        language=content.language,
        scenes_json=json.dumps([s.model_dump() for s in content.scenes]),
        caption=content.caption,
        hashtags_json=json.dumps(content.hashtags),
        description=content.description,
        call_to_action=content.call_to_action,
        is_approved=False,
    )
    db.add(script_record)
    db.commit()
    db.refresh(project)

    return {
        "project_id": project.id,
        "content": content.model_dump(),
        "status": project.status,
    }


@router.post("/content/regenerate")
async def regenerate_content(req: ContentRegenerateRequest, db: Session = Depends(get_db)):
    """Regenerate or revise script with user feedback using local Gemma 4."""
    project = db.query(Project).filter(Project.id == req.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        content = await gemma_service.generate_content(
            topic=project.topic,
            target_audience=project.target_audience,
            content_purpose=project.content_purpose,
            language=project.language,
            tone=project.tone,
            platform=project.platform,
            duration_seconds=project.duration_seconds,
            feedback=req.feedback,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Script regeneration failed: {str(e)}",
        )

    # Save new version
    latest_script = (
        db.query(GeneratedScript)
        .filter(GeneratedScript.project_id == project.id)
        .order_by(GeneratedScript.version.desc())
        .first()
    )
    new_version = (latest_script.version + 1) if latest_script else 1

    script_record = GeneratedScript(
        project_id=project.id,
        title=content.title,
        hook=content.hook,
        script=content.script,
        language=content.language,
        scenes_json=json.dumps([s.model_dump() for s in content.scenes]),
        caption=content.caption,
        hashtags_json=json.dumps(content.hashtags),
        description=content.description,
        call_to_action=content.call_to_action,
        is_approved=False,
        version=new_version,
    )
    db.add(script_record)
    project.title = content.title
    project.status = "script_ready"
    db.commit()

    return {
        "project_id": project.id,
        "content": content.model_dump(),
        "version": new_version,
    }


@router.put("/projects/{project_id}/script")
@router.post("/projects/{project_id}/script")
async def update_script(project_id: int, req: ScriptUpdateRequest, db: Session = Depends(get_db)):
    """User edits and approves the generated script."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    scenes_json = json.dumps([s.model_dump() for s in req.scenes]) if req.scenes else None
    hashtags_json = json.dumps(req.hashtags) if req.hashtags else None

    script_record = (
        db.query(GeneratedScript)
        .filter(GeneratedScript.project_id == project.id)
        .order_by(GeneratedScript.id.desc())
        .first()
    )

    if script_record:
        script_record.title = req.title
        if req.hook is not None:
            script_record.hook = req.hook
        script_record.script = req.script
        if scenes_json:
            script_record.scenes_json = scenes_json
        if req.caption is not None:
            script_record.caption = req.caption
        if hashtags_json:
            script_record.hashtags_json = hashtags_json
        if req.description is not None:
            script_record.description = req.description
        if req.call_to_action is not None:
            script_record.call_to_action = req.call_to_action
        script_record.is_approved = req.is_approved
    else:
        script_record = GeneratedScript(
            project_id=project.id,
            title=req.title,
            hook=req.hook,
            script=req.script,
            scenes_json=scenes_json,
            caption=req.caption,
            hashtags_json=hashtags_json,
            description=req.description,
            call_to_action=req.call_to_action,
            is_approved=req.is_approved,
        )
        db.add(script_record)

    project.title = req.title
    if req.is_approved:
        project.status = "approved"

    db.commit()
    return {"message": "Script updated successfully", "is_approved": req.is_approved}


@router.post("/heygen/generate")
async def generate_video(req: HeyGenGenerateRequest, db: Session = Depends(get_db)):
    """Submit approved script to HeyGen V3 for avatar video rendering.

    Enforces explicit user confirmation check.
    """
    if not req.user_confirmed:
        raise HTTPException(
            status_code=400,
            detail="Safety check: Video generation requires explicit user approval.",
        )

    project = db.query(Project).filter(Project.id == req.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Get latest approved script
    script_record = (
        db.query(GeneratedScript)
        .filter(GeneratedScript.project_id == project.id)
        .order_by(GeneratedScript.id.desc())
        .first()
    )
    if not script_record:
        raise HTTPException(status_code=400, detail="No script exists for this project.")

    # Update project choices
    project.selected_avatar_id = req.avatar_id
    project.selected_avatar_name = req.avatar_name
    project.selected_voice_id = req.voice_id
    project.selected_voice_name = req.voice_name
    project.aspect_ratio = req.aspect_ratio
    project.status = "generating"

    try:
        gen_result = await heygen_service.generate_avatar_video(
            title=project.title,
            script=script_record.script,
            avatar_id=req.avatar_id,
            voice_id=req.voice_id,
            aspect_ratio=req.aspect_ratio,
            user_confirmed=req.user_confirmed,
        )
    except Exception as e:
        project.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"HeyGen generation failed: {str(e)}")

    video_job = VideoJob(
        project_id=project.id,
        heygen_job_id=gen_result.get("video_id"),
        heygen_session_id=gen_result.get("session_id"),
        status=gen_result.get("status", "pending"),
        progress=10 if gen_result.get("is_demo") else 0,
        is_demo=gen_result.get("is_demo", False),
    )
    db.add(video_job)
    db.commit()
    db.refresh(video_job)

    return {
        "job_id": video_job.id,
        "heygen_video_id": video_job.heygen_job_id,
        "status": video_job.status,
        "is_demo": video_job.is_demo,
        "message": gen_result.get("message"),
    }


@router.get("/heygen/status/{job_id}", response_model=VideoJobResponse)
async def get_job_status(job_id: int, db: Session = Depends(get_db)):
    """Poll progress and completion status of a video rendering job."""
    job = db.query(VideoJob).filter(VideoJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Video job not found")

    if job.status not in ["completed", "failed"] and job.heygen_job_id:
        poll_res = await heygen_service.get_video_status(job.heygen_job_id, is_demo=job.is_demo)
        job.status = poll_res.get("status", job.status)
        job.progress = poll_res.get("progress", job.progress)
        if poll_res.get("video_url"):
            job.video_url = poll_res.get("video_url")
        if poll_res.get("thumbnail_url"):
            job.thumbnail_url = poll_res.get("thumbnail_url")
        if poll_res.get("duration"):
            job.duration = poll_res.get("duration")
        if poll_res.get("error_message"):
            job.error_message = poll_res.get("error_message")

        project = db.query(Project).filter(Project.id == job.project_id).first()
        if project:
            if job.status == "completed":
                project.status = "completed"
            elif job.status == "failed":
                project.status = "failed"

        db.commit()
        db.refresh(job)

    return job


@router.get("/projects", response_model=List[ProjectSummary])
async def list_projects(db: Session = Depends(get_db)):
    """List all projects with status and metadata."""
    projects = db.query(Project).order_by(Project.created_at.desc()).all()
    results = []
    for p in projects:
        latest_job = (
            db.query(VideoJob)
            .filter(VideoJob.project_id == p.id)
            .order_by(VideoJob.id.desc())
            .first()
        )
        results.append(
            ProjectSummary(
                id=p.id,
                title=p.title,
                topic=p.topic,
                platform=p.platform,
                language=p.language,
                tone=p.tone,
                status=p.status,
                selected_avatar_name=p.selected_avatar_name,
                selected_voice_name=p.selected_voice_name,
                video_url=latest_job.video_url if latest_job else None,
                thumbnail_url=latest_job.thumbnail_url if latest_job else None,
                created_at=p.created_at,
            )
        )
    return results


@router.post("/projects")
async def create_project(req: ContentGenerateRequest, db: Session = Depends(get_db)):
    """Create a new project record."""
    project = Project(
        title=f"Video on {req.topic[:35]}",
        topic=req.topic,
        target_audience=req.target_audience,
        content_purpose=req.content_purpose,
        language=req.language,
        tone=req.tone,
        platform=req.platform,
        duration_seconds=req.duration_seconds,
        status="draft",
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return {"id": project.id, "title": project.title, "status": project.status}


@router.get("/projects/{project_id}")
async def get_project(project_id: int, db: Session = Depends(get_db)):
    """Fetch complete project details including latest script and job."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    script = (
        db.query(GeneratedScript)
        .filter(GeneratedScript.project_id == project.id)
        .order_by(GeneratedScript.id.desc())
        .first()
    )
    job = (
        db.query(VideoJob)
        .filter(VideoJob.project_id == project.id)
        .order_by(VideoJob.id.desc())
        .first()
    )

    script_data = None
    if script:
        script_data = {
            "title": script.title,
            "hook": script.hook or "",
            "script": script.script,
            "language": script.language,
            "scenes": script.scenes,
            "caption": script.caption or "",
            "hashtags": script.hashtags,
            "description": script.description or "",
            "call_to_action": script.call_to_action or "",
            "is_approved": script.is_approved,
        }

    job_data = None
    if job:
        job_data = {
            "id": job.id,
            "project_id": job.project_id,
            "heygen_job_id": job.heygen_job_id,
            "status": job.status,
            "progress": job.progress,
            "video_url": job.video_url,
            "thumbnail_url": job.thumbnail_url,
            "duration": job.duration,
            "error_message": job.error_message,
            "is_demo": job.is_demo,
            "created_at": job.created_at.isoformat(),
            "updated_at": job.updated_at.isoformat(),
        }

    return {
        "id": project.id,
        "title": project.title,
        "topic": project.topic,
        "target_audience": project.target_audience,
        "content_purpose": project.content_purpose,
        "language": project.language,
        "tone": project.tone,
        "platform": project.platform,
        "duration_seconds": project.duration_seconds,
        "status": project.status,
        "selected_avatar_id": project.selected_avatar_id,
        "selected_avatar_name": project.selected_avatar_name,
        "selected_voice_id": project.selected_voice_id,
        "selected_voice_name": project.selected_voice_name,
        "aspect_ratio": project.aspect_ratio,
        "created_at": project.created_at.isoformat(),
        "latest_script": script_data,
        "latest_video_job": job_data,
    }


@router.delete("/projects/{project_id}")
async def delete_project(project_id: int, db: Session = Depends(get_db)):
    """Delete a project and all associated scripts and jobs."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully", "id": project_id}


@router.get("/library")
async def get_library(db: Session = Depends(get_db)):
    """Fetch completed video library entries with video and script metadata."""
    completed_jobs = (
        db.query(VideoJob)
        .filter(VideoJob.video_url.isnot(None))
        .order_by(VideoJob.created_at.desc())
        .all()
    )

    items = []
    for job in completed_jobs:
        project = db.query(Project).filter(Project.id == job.project_id).first()
        script = (
            db.query(GeneratedScript)
            .filter(GeneratedScript.project_id == job.project_id)
            .order_by(GeneratedScript.id.desc())
            .first()
        )
        if project:
            items.append({
                "job_id": job.id,
                "project_id": project.id,
                "title": project.title,
                "topic": project.topic,
                "platform": project.platform,
                "language": project.language,
                "avatar_name": project.selected_avatar_name,
                "voice_name": project.selected_voice_name,
                "video_url": job.video_url,
                "thumbnail_url": job.thumbnail_url,
                "duration": job.duration or f"{project.duration_seconds}s",
                "script": script.script if script else "",
                "created_at": job.created_at.isoformat(),
                "is_demo": job.is_demo,
            })
    return {"items": items, "total": len(items)}
