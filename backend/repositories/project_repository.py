from sqlalchemy.orm import Session
from models.project_model import Project
from schemas.project_schema import ProjectCreate


class ProjectRepository:

    @staticmethod
    def create(db: Session, project: ProjectCreate):

        db_project = Project(
            name=project.name,
            description=project.description,
            owner_id=project.owner_id
        )

        db.add(db_project)
        db.commit()
        db.refresh(db_project)

        return db_project

    @staticmethod
    def get_all(db: Session):
        return db.query(Project).all()

    @staticmethod
    def get_by_id(db: Session, project_id: int):
        return db.query(Project).filter(Project.id == project_id).first()

    @staticmethod
    def delete(db: Session, project_id: int):

        project = db.query(Project).filter(Project.id == project_id).first()

        if project:
            db.delete(project)
            db.commit()

        return project