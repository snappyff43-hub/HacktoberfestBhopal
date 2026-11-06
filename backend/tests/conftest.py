"""Test configuration, in-memory database fixtures, and TestClient setup for CreatorFlow AI."""

import os
import sys
from pathlib import Path
from unittest.mock import patch
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.database.database import Base, get_db
from app.main import app

# In-memory test engine isolated from production creatorflow.db
TEST_DB_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh isolated in-memory database for each test function."""
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session):
    """FastAPI TestClient with overridden get_db dependency.
    
    Uses raise_server_exceptions=False and patches init_db to skip production
    DB file access during the lifespan startup event.
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    # Patch init_db so the lifespan event creates tables on the in-memory
    # test engine rather than opening the production SQLite file.
    with patch("app.main.init_db", lambda: Base.metadata.create_all(bind=test_engine)):
        with TestClient(app, raise_server_exceptions=True) as test_client:
            yield test_client
    app.dependency_overrides.clear()

