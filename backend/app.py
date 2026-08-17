from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine

from models import User, Project, Task

from routers.user_router import router as user_router
from routers.project_router import router as project_router
from routers.task_router import router as task_router

from middleware.request_logging import request_logging_middleware


app = FastAPI(
    title="TaskFlow API",
    version="1.0.0"
)


# ==================================================
# DATABASE
# ==================================================

Base.metadata.create_all(bind=engine)


# ==================================================
# CORS
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS"
    ],
    allow_headers=[
        "Content-Type",
        "Authorization"
    ]
)


# ==================================================
# REQUEST LOGGING MIDDLEWARE
# ==================================================

app.middleware("http")(
    request_logging_middleware
)


# ==================================================
# ROUTERS
# ==================================================

app.include_router(user_router)
app.include_router(project_router)
app.include_router(task_router)


# ==================================================
# ROOT
# ==================================================

@app.get("/")
def home():

    return {
        "message": "TaskFlow Backend Running"
    }