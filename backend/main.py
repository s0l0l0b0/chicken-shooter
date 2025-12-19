from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import models, database

# Initialize DB
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# --- FIX FOR CONNECTION ISSUES ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all connections. Safe for local dev.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScoreSchema(BaseModel):
    player_name: str
    points: int
    level: int
    kills: int
    achievements: Optional[List[str]] = []

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    return db.query(models.Score).order_by(models.Score.points.desc()).limit(10).all()

@app.post("/submit-score")
def submit_score(score: ScoreSchema, db: Session = Depends(get_db)):
    db_score = models.Score(
        player_name=score.player_name, 
        points=score.points,
        level=score.level,
        kills=score.kills,
        achievements=score.achievements or []
    )
    db.add(db_score)
    db.commit()
    db.refresh(db_score)
    return db_score