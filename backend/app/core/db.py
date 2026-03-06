from sqlmodel import SQLModel, create_engine, Session
import os

DB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../database"))
os.makedirs(DB_DIR, exist_ok=True)

sqlite_file_name = f"{DB_DIR}/v2_journalists.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=False)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
