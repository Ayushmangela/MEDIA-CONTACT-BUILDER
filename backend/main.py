from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.db import create_db_and_tables
from .routers import api

app = FastAPI(
    title="Media-Contact-Builder V2",
    description="Intelligent Public Relations and Pitch Generation Platform"
)

# Setup CORS for the React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

app.include_router(api.router)

@app.get("/")
def read_root():
    return {"message": "System Online: Media-Contact-Builder V2"}
