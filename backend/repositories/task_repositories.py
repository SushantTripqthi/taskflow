from sqlalchemy.orm import Session

from models.task_model import Task

from schemas.task_schema import (
    TaskCreate,
    TaskUpdate
)


class TaskRepository:

    # ==================================================
    # CREATE
    # ==================================================

    @staticmethod
    def create(
        db: Session,
        task: TaskCreate
    ):

        db_task = Task(
            title=task.title,
            description=task.description,
            priority=task.priority,
            due_date=task.due_date,
            project_id=task.project_id
        )

        db.add(db_task)

        db.commit()

        db.refresh(db_task)

        return db_task

    # ==================================================
    # GET ALL
    # ==================================================

    @staticmethod
    def get_all(
        db: Session
    ):

        return db.query(Task).all()

    # ==================================================
    # GET BY ID
    # ==================================================

    @staticmethod
    def get_by_id(
        db: Session,
        task_id: int
    ):

        return (
            db.query(Task)
            .filter(Task.id == task_id)
            .first()
        )

    # ==================================================
    # UPDATE
    # ==================================================

    @staticmethod
    def update(
        db: Session,
        task_id: int,
        task: TaskUpdate
    ):

        db_task = (
            db.query(Task)
            .filter(Task.id == task_id)
            .first()
        )

        if not db_task:
            return None

        if task.title is not None:
            db_task.title = task.title

        if task.description is not None:
            db_task.description = task.description

        if task.priority is not None:
            db_task.priority = task.priority

        if task.due_date is not None:
            db_task.due_date = task.due_date

        db.commit()

        db.refresh(db_task)

        return db_task

    # ==================================================
    # DELETE
    # ==================================================

    @staticmethod
    def delete(
        db: Session,
        task_id: int
    ):

        db_task = (
            db.query(Task)
            .filter(Task.id == task_id)
            .first()
        )

        if db_task:

            db.delete(db_task)

            db.commit()

        return db_task

    # ==================================================
    # GET ALL TASKS
    # ==================================================

    @staticmethod
    def get_all_tasks(
        db: Session
    ):

        return db.query(Task).all()

    # ==================================================
    # SEARCH BY TITLE
    # ==================================================

    @staticmethod
    def get_task_by_title(
        db: Session,
        title: str
    ):

        return (
            db.query(Task)
            .filter(Task.title == title)
            .all()
        )