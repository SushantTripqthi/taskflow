from sqlalchemy.orm import Session
from models.user_model import User
from schemas.user_schema import UserCreate


class UserRepository:

    @staticmethod
    def create(db: Session, user: UserCreate):
        db_user = User(
            name=user.name,
            email=user.email
        )

        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        return db_user

    @staticmethod
    def get_all(db: Session):
        return db.query(User).all()

    @staticmethod
    def get_by_id(db: Session, user_id: int):
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str):
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def delete(db: Session, user_id: int):
        user = db.query(User).filter(User.id == user_id).first()

        if user:
            db.delete(user)
            db.commit()

        return user