from sqlalchemy import Column, Integer, String
from database import Base

class Divergencia(Base):
    __tablename__ = "divergencias"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, index=True, nullable=False)
    quantidade = Column(Integer, nullable=False)
    categoria = Column(String, nullable=False)
    subcategoria = Column(String, nullable=True)