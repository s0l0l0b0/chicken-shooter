from sqlalchemy import Column, Integer, String, JSON
from database import Base

class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True)
    player_name = Column(String, index=True)
    points = Column(Integer)
    level = Column(Integer)
    kills = Column(Integer)
    achievements = Column(JSON, default=list)  # Store unlocked achievements