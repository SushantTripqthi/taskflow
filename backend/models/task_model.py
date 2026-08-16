from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Enum
)

from sqlalchemy.orm import relationship

import enum

from database import Base


# ==================================================
# PRIORITY ENUM
# ==================================================

class Priority(str, enum.Enum):

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


# ==================================================
# TASK MODEL
# ==================================================

class Task(Base):

    __tablename__ = "tasks"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String(200),
        nullable=False
    )

    description = Column(
        String(1000),
        nullable=True
    )

    priority = Column(
        Enum(Priority),
        nullable=False,
        default=Priority.MEDIUM
    )

    due_date = Column(
        String,
        nullable=True
    )

    project_id = Column(
        Integer,
        ForeignKey("projects.id"),
        nullable=False
    )

    project = relationship(
        "Project",
        back_populates="tasks"
    )