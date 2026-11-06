"""Intelligent Autopilot & Publishing Schedule Service for CreatorFlow AI.

Manages calendar slots, creator availability blackouts, topic backlog dispatching,
duplicate-job prevention, and Smart Approval safety gates.
"""

from datetime import datetime, timedelta
import json
import logging
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from app.models.project import CreatorPreference, Project, ScheduledPost, TopicBacklog

logger = logging.getLogger("creatorflow.autopilot")

WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


class AutopilotService:
    """Intelligent scheduling coordinator."""

    def get_or_create_preferences(self, db: Session) -> CreatorPreference:
        """Fetch current creator preference configuration or establish default."""
        pref = db.query(CreatorPreference).first()
        if not pref:
            pref = CreatorPreference(
                posting_days="Monday,Wednesday,Friday",
                posting_time="18:00",
                timezone="Asia/Kolkata",
                unavailable_dates_json="[]",
                mode="smart_approval",
                spending_limit_credits=5,
            )
            db.add(pref)
            db.commit()
            db.refresh(pref)
        return pref

    def plan_weekly_slots(
        self,
        db: Session,
        reference_date: Optional[datetime] = None,
        days_ahead: int = 7,
    ) -> Dict[str, Any]:
        """Evaluate cadence, filter unavailable blackout dates, and allocate backlog topics.

        Prevents duplicate allocations and missed slots.
        """
        now = reference_date or datetime.utcnow()
        pref = self.get_or_create_preferences(db)

        if pref.mode == "manual":
            return {
                "mode": "manual",
                "message": "Autopilot is set to manual mode. No automatic slots planned.",
                "slots_planned": 0,
                "slots": [],
            }

        preferred_days = [d.strip() for d in pref.posting_days.split(",") if d.strip()]
        unavailable_dates = pref.unavailable_dates  # list of YYYY-MM-DD
        hour, minute = 18, 0
        if ":" in pref.posting_time:
            parts = pref.posting_time.split(":")
            try:
                hour, minute = int(parts[0]), int(parts[1])
            except ValueError:
                pass

        planned_slots = []
        backlog_items = (
            db.query(TopicBacklog)
            .filter(TopicBacklog.status == "backlog")
            .order_by(TopicBacklog.created_at.asc())
            .all()
        )
        backlog_idx = 0

        for i in range(1, days_ahead + 1):
            target_day = now + timedelta(days=i)
            target_date_str = target_day.strftime("%Y-%m-%d")
            day_name = WEEKDAYS[target_day.weekday()]

            if day_name not in preferred_days:
                continue

            slot_datetime = target_day.replace(hour=hour, minute=minute, second=0, microsecond=0)

            # Check creator blackout dates
            if target_date_str in unavailable_dates:
                planned_slots.append({
                    "date": target_date_str,
                    "datetime": slot_datetime.isoformat(),
                    "status": "SKIPPED_UNAVAILABLE",
                    "reason": f"Creator marked {target_date_str} as unavailable.",
                })
                continue

            # Duplicate prevention check: is there already a post scheduled within 2 hours of this slot?
            existing = (
                db.query(ScheduledPost)
                .filter(
                    ScheduledPost.scheduled_datetime >= slot_datetime - timedelta(hours=2),
                    ScheduledPost.scheduled_datetime <= slot_datetime + timedelta(hours=2),
                )
                .first()
            )

            if existing:
                planned_slots.append({
                    "date": target_date_str,
                    "datetime": slot_datetime.isoformat(),
                    "status": "OCCUPIED",
                    "post_id": existing.id,
                    "title": existing.title,
                })
                continue

            # Allocate from backlog if available
            assigned_topic = None
            if backlog_idx < len(backlog_items):
                assigned_topic = backlog_items[backlog_idx]
                backlog_idx += 1

                # Create scheduled post in Smart Approval mode
                initial_status = "NEEDS_APPROVAL" if pref.mode == "smart_approval" else "SCHEDULED"
                new_post = ScheduledPost(
                    platform=assigned_topic.preferred_platform or "YouTube",
                    title=assigned_topic.topic,
                    script=f"Autopilot draft outline for: {assigned_topic.topic}",
                    scheduled_datetime=slot_datetime,
                    status=initial_status,
                )
                db.add(new_post)
                assigned_topic.status = "in_progress"
                db.commit()
                db.refresh(new_post)

                planned_slots.append({
                    "date": target_date_str,
                    "datetime": slot_datetime.isoformat(),
                    "status": "PLANNED",
                    "post_id": new_post.id,
                    "title": new_post.title,
                    "platform": new_post.platform,
                    "approval_required": (pref.mode == "smart_approval"),
                })
            else:
                planned_slots.append({
                    "date": target_date_str,
                    "datetime": slot_datetime.isoformat(),
                    "status": "OPEN_EMPTY_BACKLOG",
                    "message": "Slot is available but approved topic backlog is empty.",
                })

        return {
            "mode": pref.mode,
            "slots_planned": len([s for s in planned_slots if s.get("status") == "PLANNED"]),
            "slots": planned_slots,
        }

    def simulate_publishing(
        self,
        db: Session,
        post_id: int,
        require_approval: bool = True,
    ) -> Dict[str, Any]:
        """Safely execute simulated publishing check without sending real external social requests.

        Validates:
        1. Non-existence
        2. Duplicate publish prevention
        3. Smart Approval permission checks
        """
        post = db.query(ScheduledPost).filter(ScheduledPost.id == post_id).first()
        if not post:
            raise ValueError(f"Scheduled post #{post_id} not found.")

        # 1. Duplicate publish prevention
        if post.status == "PUBLISHED":
            return {
                "success": False,
                "error": "DUPLICATE_PUBLISH_PREVENTED",
                "message": f"Post #{post_id} has already been published. Cannot publish twice.",
                "post": {
                    "id": post.id,
                    "status": post.status,
                    "published_url": post.published_url,
                },
            }

        # 2. Permission check: Smart Approval enforcement
        if require_approval and post.status in ["NEEDS_APPROVAL", "DRAFT"]:
            return {
                "success": False,
                "error": "PERMISSION_DENIED",
                "message": (
                    f"Safety Gate: Post #{post_id} is in '{post.status}' state. "
                    "Smart Approval requires explicit creator review before publishing."
                ),
                "post": {
                    "id": post.id,
                    "status": post.status,
                },
            }

        # 3. Simulate transition
        post.status = "PUBLISHED"
        post.published_url = f"https://youtube.com/watch?v=sim_{post.id:04d}"
        db.commit()
        db.refresh(post)

        logger.info(
            "Simulated publishing completed for post #%s on platform %s",
            post.id,
            post.platform,
        )

        return {
            "success": True,
            "message": f"Successfully published post #{post.id} (Simulated).",
            "published_url": post.published_url,
            "published_at": datetime.utcnow().isoformat(),
            "platform": post.platform,
        }

    def evaluate_missed_slots(
        self,
        db: Session,
        simulated_now: Optional[datetime] = None,
    ) -> List[Dict[str, Any]]:
        """Identify past scheduled slots that were never published."""
        now = simulated_now or datetime.utcnow()
        overdue_posts = (
            db.query(ScheduledPost)
            .filter(
                ScheduledPost.scheduled_datetime < now,
                ScheduledPost.status.in_(["SCHEDULED", "NEEDS_APPROVAL"]),
            )
            .all()
        )

        handled = []
        for post in overdue_posts:
            post.status = "MISSED_SLOT"
            post.error_message = f"Publishing window expired on {post.scheduled_datetime.isoformat()}."
            handled.append({
                "post_id": post.id,
                "title": post.title,
                "scheduled_datetime": post.scheduled_datetime.isoformat(),
                "action": "marked_as_missed",
            })

        if handled:
            db.commit()

        return handled


autopilot_service = AutopilotService()

