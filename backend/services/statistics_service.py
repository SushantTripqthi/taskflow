from sqlalchemy import func
from sqlalchemy.orm import Session

from models.task_model import Task


class StatisticsService:

    @staticmethod
    def task_statistics(
        db: Session,
        project_id: int
    ):

        result = (
            db.query(
                Task.priority,
                func.count(Task.id)
            )
            .filter(Task.project_id == project_id)
            .group_by(Task.priority)
            .all()
        )

        statistics = {}

        for priority, count in result:
            statistics[priority.value] = count

        return statistics