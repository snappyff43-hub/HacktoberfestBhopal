"""Security, resilience, and telemetry verification tests."""

import pytest


class TestSecurityAndInputValidation:
    """Security validations, error masks, and telemetry headers."""

    def test_missing_required_fields_returns_422(self, client):
        # Missing required 'topic' field
        payload = {
            "target_audience": "Students",
            "language": "English",
        }
        res = client.post("/api/projects", json=payload)
        assert res.status_code == 422
        assert "detail" in res.json()

    def test_invalid_json_body_returns_422(self, client):
        res = client.post(
            "/api/projects",
            content="this is not valid json",
            headers={"Content-Type": "application/json"},
        )
        assert res.status_code == 422

    def test_telemetry_headers_present_on_all_requests(self, client):
        res = client.get("/api/health")
        assert res.status_code == 200
        assert "X-Request-ID" in res.headers
        assert "X-Response-Time-Ms" in res.headers

    def test_error_responses_redact_secrets(self, client):
        # Trigger an intentional 404 to inspect error payload structure
        res = client.get("/api/projects/999999")
        assert res.status_code == 404
        content_str = res.text.lower()
        for forbidden in ["api_key", "bearer", "password", "secret_key"]:
            assert forbidden not in content_str

    def test_empty_schedule_post_validation(self, client):
        # Invalid empty body
        res = client.post("/api/schedule", json={})
        assert res.status_code == 422

