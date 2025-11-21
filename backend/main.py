from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
import models, database


models.Base.metadata.create_all(bind=database.engine)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScoreCreate(BaseModel):
    player_name: str
    points: int
    
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()
        

@app.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    scores = db.query(models.Score).order_by(models.Score.points.desc()).limit(10).all()
    return scores

@app.post("/submit-score")
def submit_score(score: ScoreCreate, db: Session = Depends(get_db)):
    db_score = models.Score(player_name=score.player_name, points=score.points)
    db.add(db_score)
    db.commit()
    db.refresh(db_score)
    return db_score
