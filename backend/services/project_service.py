from fastapi import HTTPException
from sqlalchemy.orm import Session

from repositories.project_repository import ProjectRepository
from repositories.user_repository import UserRepository
from schemas.project_schema import ProjectCreate


class ProjectService:

    @staticmethod
    def create_project(db: Session, project: ProjectCreate):

        owner = UserRepository.get_by_id(db, project.owner_id)

        if not owner:
            raise HTTPException(
                status_code=404,
                detail="Owner not found."
            )

        return ProjectRepository.create(db, project)

    @staticmethod
    def get_all_projects(db: Session):
        return ProjectRepository.get_all(db)

    @staticmethod
    def get_project(db: Session, project_id: int):

        project = ProjectRepository.get_by_id(db, project_id)

        if not project:
            raise HTTPException(
                status_code=404,
                detail="Project not found."
            )

        return project

    @staticmethod
    def delete_project(db: Session, project_id: int):

        project = ProjectRepository.delete(db, project_id)

        if not project:
            raise HTTPException(
                status_code=404,
                detail="Project not found."
            )

        return {"message": "Project deleted successfully"}