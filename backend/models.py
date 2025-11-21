from sqlalchemy import Column, Integer, String
from database import Base

class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True)
    player_name = Column(String, index=True)
    points = Column(Integer)