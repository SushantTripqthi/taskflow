from typing import Optional

from pydantic import BaseModel, Field, ConfigDict, field_validator

from models.task_model import Priority


# ==================================================
# CREATE TASK
# ==================================================

class TaskCreate(BaseModel):

    title: str = Field(
        ...,
        min_length=2,
        max_length=200
    )

    description: Optional[str] = Field(
        default=None,
        max_length=1000
    )

    priority: Priority

    due_date: Optional[str] = None

    project_id: int

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str):

        value = value.strip()

        if not value:
            raise ValueError("Title cannot be blank")

        return value


# ==================================================
# UPDATE TASK
# ==================================================

class TaskUpdate(BaseModel):

    title: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=200
    )

    description: Optional[str] = Field(
        default=None,
        max_length=1000
    )

    priority: Optional[Priority] = None

    due_date: Optional[str] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, value):

        if value is None:
            return value

        value = value.strip()

        if not value:
            raise ValueError("Title cannot be blank")

        return value


# ==================================================
# TASK RESPONSE
# ==================================================

class TaskResponse(BaseModel):

    id: int

    title: str

    description: Optional[str]

    priority: Priority

    due_date: Optional[str]

    project_id: int

    model_config = ConfigDict(
        from_attributes=True
    )


# ==================================================
# QUICK ADD REQUEST
# ==================================================

class QuickAddRequest(BaseModel):
    """
    Request schema for AI Quick-Add.
    """

    description: str = Field(
        ...,
        min_length=1,
        description="Free-text task description"
    )

    project_id: int = Field(
        ...,
        description="Existing project ID"
    )