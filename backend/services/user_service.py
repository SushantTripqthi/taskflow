from fastapi import HTTPException
from sqlalchemy.orm import Session

from repositories.user_repository import UserRepository
from schemas.user_schema import UserCreate


class UserService:

    @staticmethod
    def create_user(db: Session, user: UserCreate):

        existing = UserRepository.get_by_email(db, user.email)

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Email already exists."
            )

        return UserRepository.create(db, user)

    @staticmethod
    def get_all_users(db: Session):
        return UserRepository.get_all(db)

    @staticmethod
    def get_user(db: Session, user_id: int):

        user = UserRepository.get_by_id(db, user_id)

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found."
            )

        return user

    @staticmethod
    def delete_user(db: Session, user_id: int):

        user = UserRepository.delete(db, user_id)

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found."
            )

        return {"message": "User deleted successfully"}