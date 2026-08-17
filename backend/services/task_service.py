from fastapi import HTTPException
from sqlalchemy.orm import Session

from repositories.task_repository import TaskRepository
from repositories.project_repository import ProjectRepository

from ai.quick_add_parser import parse_quick_add

from schemas.task_schema import (
    QuickAddRequest,
    TaskCreate,
    TaskUpdate
)

from algorithms.insertion_sort import insertion_sort
from algorithms.linear_search import linear_search
from algorithms.binary_search import binary_search
from algorithms.comparison_counter import ComparisonCounter


class TaskService:

    # ==================================================
    # CREATE TASK
    # ==================================================

    @staticmethod
    def create_task(
        db: Session,
        task: TaskCreate
    ):

        project = ProjectRepository.get_by_id(
            db,
            task.project_id
        )

        if not project:

            raise HTTPException(
                status_code=404,
                detail="Project not found."
            )

        return TaskRepository.create(
            db,
            task
        )

    # ==================================================
    # QUICK ADD
    # ==================================================

    @staticmethod
    def quick_add_task(
        db: Session,
        request: QuickAddRequest
    ):

        project = ProjectRepository.get_by_id(
            db,
            request.project_id
        )

        if not project:

            raise HTTPException(
                status_code=422,
                detail={
                    "project_id": [
                        "Project does not exist."
                    ]
                }
            )

        parsed = parse_quick_add(
            request.description
        )

        try:

            task_data = TaskCreate(
                title=parsed["title"],
                description=request.description,
                priority=parsed["priority"],
                due_date=parsed["due_date_hint"],
                project_id=request.project_id
            )

        except Exception as exc:

            raise HTTPException(
                status_code=422,
                detail={
                    "validation_error": str(exc)
                }
            )

        return TaskRepository.create(
            db,
            task_data
        )

    # ==================================================
    # GET ALL
    # ==================================================

    @staticmethod
    def get_all_tasks(
        db: Session
    ):

        return TaskRepository.get_all(db)

    # ==================================================
    # GET BY ID
    # ==================================================

    @staticmethod
    def get_task(
        db: Session,
        task_id: int
    ):

        task = TaskRepository.get_by_id(
            db,
            task_id
        )

        if not task:

            raise HTTPException(
                status_code=404,
                detail="Task not found."
            )

        return task

    # ==================================================
    # UPDATE
    # ==================================================

    @staticmethod
    def update_task(
        db: Session,
        task_id: int,
        task: TaskUpdate
    ):

        updated_task = TaskRepository.update(
            db,
            task_id,
            task
        )

        if not updated_task:

            raise HTTPException(
                status_code=404,
                detail="Task not found."
            )

        return updated_task

    # ==================================================
    # DELETE
    # ==================================================

    @staticmethod
    def delete_task(
        db: Session,
        task_id: int
    ):

        deleted_task = TaskRepository.delete(
            db,
            task_id
        )

        if not deleted_task:

            raise HTTPException(
                status_code=404,
                detail="Task not found."
            )

        return {
            "message": "Task deleted successfully"
        }

    # ==================================================
    # CONVERT TASK TO DICTIONARY
    # ==================================================

    @staticmethod
    def _task_to_dict(task):

        priority = task.priority

        if hasattr(priority, "value"):
            priority = priority.value

        return {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "priority": priority,
            "due_date": task.due_date,
            "project_id": task.project_id
        }

    # ==================================================
    # SORT TASKS
    # ==================================================

    @staticmethod
    def get_tasks_with_sort(
        db: Session,
        sort: str | None = None
    ):

        tasks = TaskRepository.get_all(db)

        records = [
            TaskService._task_to_dict(task)
            for task in tasks
        ]

        if sort is None:
            return records

        if sort != "priority":

            raise HTTPException(
                status_code=400,
                detail="Only sort=priority is supported."
            )

        counter = ComparisonCounter()

        insertion_sort(
            records,
            "priority",
            counter
        )

        return records

    # ==================================================
    # SEARCH BY TITLE
    # ==================================================

    @staticmethod
    def search_tasks(
        db: Session,
        title: str,
        algo: str
    ):

        if not title or not title.strip():

            raise HTTPException(
                status_code=400,
                detail="Search title cannot be blank."
            )

        algo = algo.lower().strip()

        if algo not in {
            "linear",
            "binary"
        }:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid algorithm. "
                    "Use 'linear' or 'binary'."
                )
            )

        tasks = TaskRepository.get_all(db)

        records = [
            TaskService._task_to_dict(task)
            for task in tasks
        ]

        counter = ComparisonCounter()

        if algo == "linear":

            index = linear_search(
                records,
                title,
                "title",
                counter
            )

        else:

            insertion_sort(
                records,
                "title",
                counter
            )

            index = binary_search(
                records,
                title,
                "title",
                counter
            )

        if index == -1:

            raise HTTPException(
                status_code=404,
                detail="Task not found."
            )

        return records[index]

    # ==================================================
    # SEARCH BY ID - BINARY SEARCH
    # ==================================================

    @staticmethod
    def search_by_id(
        db: Session,
        task_id: int
    ):

        tasks = TaskRepository.get_all(db)

        records = [
            TaskService._task_to_dict(task)
            for task in tasks
        ]

        counter = ComparisonCounter()

        insertion_sort(
            records,
            "id",
            counter
        )

        index = binary_search(
            records,
            task_id,
            "id",
            counter
        )

        if index == -1:

            raise HTTPException(
                status_code=404,
                detail="Task not found."
            )

        return records[index]