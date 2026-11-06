"""Unit tests covering all CreatorFlow AI FastAPI endpoints using isolated in-memory test DB."""

from datetime import datetime, timedelta
import pytest
from unittest.mock import AsyncMock, patch
from app.models.project import Project, GeneratedScript, ScheduledPost, TopicBacklog, CreatorPreference


class TestSystemAndHealthEndpoints:
    """System health, root metadata, and diagnostics endpoints."""

    def test_root_endpoint(self, client):
        res = client.get("/")
        assert res.status_code == 200
        data = res.json()
        assert data["service"] == "CreatorFlow AI API"
        assert data["status"] == "operational"

    def test_health_endpoint(self, client):
        res = client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data

    def test_api_health_endpoint(self, client):
        res = client.get("/api/health")
        assert res.status_code == 200
        assert res.json()["status"] == "healthy"

    def test_nvidia_status_endpoint(self, client):
        res = client.get("/api/nvidia/status")
        assert res.status_code == 200
        data = res.json()
        assert "configured" in data
        assert "status" in data


class TestProjectAndScriptEndpoints:
    """Project CRUD and Script Director workflow endpoints."""

    def test_create_and_get_project(self, client, db_session):
        payload = {
            "topic": "Quantum Computing Basics",
            "target_audience": "Undergrads",
            "content_purpose": "Educate",
            "language": "English",
            "tone": "Casual",
            "platform": "YouTube",
            "duration_seconds": 60,
        }
        res = client.post("/api/projects", json=payload)
        assert res.status_code == 200
        project_id = res.json()["id"]

        # Fetch project
        get_res = client.get(f"/api/projects/{project_id}")
        assert get_res.status_code == 200
        data = get_res.json()
        assert data["id"] == project_id
        assert data["topic"] == payload["topic"]
        assert data["status"] == "draft"

    def test_get_nonexistent_project_returns_404(self, client):
        res = client.get("/api/projects/99999")
        assert res.status_code == 404
        assert "not found" in res.json()["detail"].lower()

    def test_update_script_with_approval(self, client, db_session):
        project = Project(
            title="AI Revolution",
            topic="Artificial Intelligence",
            target_audience="General",
            content_purpose="Educate",
            language="Hindi",
            tone="Informative",
            platform="YouTube",
            duration_seconds=60,
            status="draft",
        )
        db_session.add(project)
        db_session.commit()
        db_session.refresh(project)

        update_payload = {
            "title": "AI Revolution 2026",
            "hook": "क्या आप जानते हैं AI आपका भविष्य कैसे बदल रहा है?",
            "script": "नमस्ते दोस्तों! आज हम बात करेंगे AI के नए दौर की...",
            "scenes": [
                {"scene_number": 1, "description": "Avatar welcomes audience", "narration": "नमस्ते दोस्तों!"}
            ],
            "caption": "AI का भविष्य समझें 🚀",
            "hashtags": ["AI", "TechHindi", "Future"],
            "call_to_action": "सब्सक्राइब करें!",
            "is_approved": True,
        }
        res = client.put(f"/api/projects/{project.id}/script", json=update_payload)
        assert res.status_code == 200
        assert res.json()["is_approved"] is True

        # Verify project status changed to approved
        get_res = client.get(f"/api/projects/{project.id}")
        assert get_res.json()["status"] == "approved"
        assert get_res.json()["latest_script"]["title"] == "AI Revolution 2026"

    def test_delete_project(self, client, db_session):
        project = Project(
            title="Temporary Project",
            topic="Temp",
            target_audience="All",
            content_purpose="Test",
            language="English",
            tone="Test",
            platform="YouTube",
            duration_seconds=30,
            status="draft",
        )
        db_session.add(project)
        db_session.commit()
        db_session.refresh(project)

        del_res = client.delete(f"/api/projects/{project.id}")
        assert del_res.status_code == 200

        # Verify 404 afterwards
        assert client.get(f"/api/projects/{project.id}").status_code == 404


class TestHeyGenSafetyAndVideoEndpoints:
    """HeyGen safety gates and video job tracking."""

    def test_generate_video_fails_without_user_confirmation(self, client, db_session):
        project = Project(
            title="Unconfirmed Video",
            topic="Unconfirmed",
            language="English",
            platform="YouTube",
            status="approved",
        )
        db_session.add(project)
        db_session.commit()

        payload = {
            "project_id": project.id,
            "avatar_id": "Angela-inTshirt-20220820",
            "voice_id": "1bd001e7e50f421d891986aad5158bc8",
            "aspect_ratio": "16:9",
            "user_confirmed": False,  # Safety Gate Violating
        }
        res = client.post("/api/heygen/generate", json=payload)
        assert res.status_code == 400
        assert "requires explicit user approval" in res.json()["detail"].lower()

    def test_generate_video_creates_job_with_user_confirmation(self, client, db_session):
        project = Project(
            title="Confirmed Video",
            topic="Confirmed",
            language="English",
            platform="YouTube",
            status="approved",
        )
        db_session.add(project)
        db_session.flush()

        script = GeneratedScript(
            project_id=project.id,
            title="Confirmed Video",
            hook="Opening Hook",
            script="This is the confirmed spoken narrative text for the avatar.",
            language="English",
            is_approved=True,
            version=1,
        )
        db_session.add(script)
        db_session.commit()

        # Mock heygen_service.generate_avatar_video
        mock_result = {
            "video_id": "demo_job_12345",
            "session_id": "sess_demo_abc",
            "status": "pending",
            "is_demo": True,
            "message": "Demo mode simulated video generation",
        }

        with patch("app.api.endpoints.heygen_service.generate_avatar_video", new_callable=AsyncMock) as mock_gen:
            mock_gen.return_value = mock_result

            payload = {
                "project_id": project.id,
                "avatar_id": "Angela-inTshirt-20220820",
                "avatar_name": "Angela T-Shirt",
                "voice_id": "1bd001e7e50f421d891986aad5158bc8",
                "voice_name": "Sara Natural",
                "aspect_ratio": "16:9",
                "user_confirmed": True,
            }
            res = client.post("/api/heygen/generate", json=payload)
            assert res.status_code == 200
            data = res.json()
            assert data["is_demo"] is True
            assert data["heygen_video_id"] == "demo_job_12345"


class TestAutopilotAndSchedulingEndpoints:
    """Publishing Calendar, Autopilot, Blackout Dates, and Duplicate Prevention."""

    def test_preferences_lifecycle(self, client, db_session):
        # GET default preferences
        get_res = client.get("/api/preferences")
        assert get_res.status_code == 200
        pref = get_res.json()
        assert pref["mode"] == "smart_approval"
        assert "Monday" in pref["posting_days"]

        # UPDATE preferences with blackout dates and cadence
        update_payload = {
            "posting_days": "Tuesday,Thursday",
            "posting_time": "19:30",
            "timezone": "Asia/Kolkata",
            "unavailable_dates": ["2026-11-05", "2026-11-12"],
            "mode": "smart_approval",
            "spending_limit_credits": 10,
        }
        put_res = client.put("/api/preferences", json=update_payload)
        assert put_res.status_code == 200
        updated = put_res.json()
        assert updated["posting_days"] == "Tuesday,Thursday"
        assert "2026-11-05" in updated["unavailable_dates"]
        assert updated["spending_limit_credits"] == 10

    def test_backlog_crud(self, client, db_session):
        # Add topic to backlog
        topic_payload = {
            "topic": "10 AI Prompts That Will Save 5 Hours Weekly",
            "target_audience": "Developers",
            "language": "English",
            "preferred_platform": "LinkedIn",
        }
        create_res = client.post("/api/backlog", json=topic_payload)
        assert create_res.status_code == 200
        topic_id = create_res.json()["id"]

        # List backlog
        list_res = client.get("/api/backlog")
        assert list_res.status_code == 200
        assert any(t["id"] == topic_id for t in list_res.json())

        # Delete topic
        del_res = client.delete(f"/api/backlog/{topic_id}")
        assert del_res.status_code == 200

    def test_scheduled_post_crud(self, client, db_session):
        future_time = (datetime.utcnow() + timedelta(days=3)).isoformat()
        post_payload = {
            "platform": "YouTube Shorts",
            "title": "Fast Python Tricks in 20s",
            "script": "Here are 3 Python one-liners you will use daily...",
            "scheduled_datetime": future_time,
            "status": "NEEDS_APPROVAL",
        }
        res = client.post("/api/schedule", json=post_payload)
        assert res.status_code == 200
        post = res.json()
        assert post["title"] == post_payload["title"]
        assert post["status"] == "NEEDS_APPROVAL"
        post_id = post["id"]

        # Update post status
        update_res = client.put(f"/api/schedule/{post_id}", json={"status": "APPROVED"})
        assert update_res.status_code == 200
        assert update_res.json()["status"] == "APPROVED"

        # List schedule
        sched_res = client.get("/api/schedule")
        assert any(p["id"] == post_id for p in sched_res.json())

        # Delete post
        assert client.delete(f"/api/schedule/{post_id}").status_code == 200

    def test_autopilot_planning_skips_creator_blackout_dates(self, client, db_session):
        # 1. Set unavailable date for 2 days from now
        target_blackout = (datetime.utcnow() + timedelta(days=2)).strftime("%Y-%m-%d")
        client.put("/api/preferences", json={
            "posting_days": "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday",
            "unavailable_dates": [target_blackout],
            "mode": "smart_approval",
        })

        # 2. Add topic to backlog
        client.post("/api/backlog", json={"topic": "Blackout Test Topic"})

        # 3. Plan schedule
        plan_res = client.post("/api/autopilot/plan?days_ahead=5")
        assert plan_res.status_code == 200
        plan = plan_res.json()
        assert "slots" in plan

        # Verify target_blackout was skipped
        blackout_slot = next((s for s in plan["slots"] if s["date"] == target_blackout), None)
        assert blackout_slot is not None
        assert blackout_slot["status"] == "SKIPPED_UNAVAILABLE"

    def test_duplicate_publish_prevention(self, client, db_session):
        # Create a post already marked as PUBLISHED
        post = ScheduledPost(
            platform="YouTube",
            title="Already Published Post",
            script="Content",
            scheduled_datetime=datetime.utcnow() - timedelta(hours=1),
            status="PUBLISHED",
            published_url="https://youtube.com/watch?v=sim_0001",
        )
        db_session.add(post)
        db_session.commit()
        db_session.refresh(post)

        # Attempt to publish again
        res = client.post(f"/api/autopilot/simulate-publish/{post.id}")
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is False
        assert data["error"] == "DUPLICATE_PUBLISH_PREVENTED"

    def test_smart_approval_safety_gate_blocks_unapproved_publish(self, client, db_session):
        # Create post in NEEDS_APPROVAL state
        post = ScheduledPost(
            platform="LinkedIn",
            title="Draft Thought Leadership Post",
            script="Draft content requiring sign-off",
            scheduled_datetime=datetime.utcnow() + timedelta(days=1),
            status="NEEDS_APPROVAL",
        )
        db_session.add(post)
        db_session.commit()
        db_session.refresh(post)

        # Attempt to publish with require_approval=True
        res = client.post(f"/api/autopilot/simulate-publish/{post.id}?require_approval=true")
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is False
        assert data["error"] == "PERMISSION_DENIED"
        assert "Smart Approval requires explicit creator review" in data["message"]

